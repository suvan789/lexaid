from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from groq_service import generate_document
from models import GeneratedDocument, User
from schemas import DocumentGenerateRequest, GeneratedDocResponse, DocumentTypeInfo

router = APIRouter(prefix="/api/generator", tags=["Document Generator"])

# ─── Document Type Definitions ─────────────────────────────────

DOCUMENT_TYPES = [
    DocumentTypeInfo(
        type="rent_agreement",
        name="Rent Agreement",
        description="Standard residential or commercial rent/lease agreement under Indian law",
        required_fields=[
            "landlord_name", "landlord_address", "tenant_name", "tenant_address",
            "property_address", "rent_amount", "deposit_amount", "start_date",
            "duration_months", "notice_period_days"
        ]
    ),
    DocumentTypeInfo(
        type="employment_contract",
        name="Employment Contract",
        description="Employment agreement with terms, salary, and conditions",
        required_fields=[
            "employer_name", "employer_address", "employee_name", "employee_address",
            "designation", "department", "salary", "start_date", "probation_months",
            "notice_period_days", "working_hours"
        ]
    ),
    DocumentTypeInfo(
        type="nda",
        name="Non-Disclosure Agreement",
        description="Confidentiality agreement between two parties",
        required_fields=[
            "party1_name", "party1_address", "party2_name", "party2_address",
            "purpose", "duration_years", "governing_state"
        ]
    ),
    DocumentTypeInfo(
        type="affidavit",
        name="Affidavit",
        description="Sworn statement for legal or official purposes",
        required_fields=[
            "deponent_name", "deponent_address", "deponent_age", "id_proof_type",
            "id_proof_number", "statement", "purpose", "city", "state"
        ]
    ),
    DocumentTypeInfo(
        type="legal_notice",
        name="Legal Notice",
        description="Formal legal notice to another party demanding action",
        required_fields=[
            "sender_name", "sender_address", "recipient_name", "recipient_address",
            "subject", "grievance_details", "relief_sought", "response_days"
        ]
    ),
    DocumentTypeInfo(
        type="partnership_deed",
        name="Partnership Deed",
        description="Partnership agreement defining terms between business partners",
        required_fields=[
            "firm_name", "business_address", "partner1_name", "partner1_address",
            "partner1_share", "partner2_name", "partner2_address", "partner2_share",
            "business_nature", "start_date", "capital_amount"
        ]
    ),
    DocumentTypeInfo(
        type="loan_agreement",
        name="Loan Agreement",
        description="Agreement for lending/borrowing money with terms and interest",
        required_fields=[
            "lender_name", "lender_address", "borrower_name", "borrower_address",
            "loan_amount", "interest_rate", "duration_months", "start_date",
            "repayment_day"
        ]
    ),
]

VALID_DOC_TYPES = {dt.type for dt in DOCUMENT_TYPES}


@router.get("/types", response_model=list[DocumentTypeInfo])
async def get_document_types():
    """Get list of supported document types with required fields."""
    return DOCUMENT_TYPES


@router.post("/generate", response_model=GeneratedDocResponse)
async def generate_doc(
    body: DocumentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a legal document using AI based on type and form data."""
    if body.doc_type not in VALID_DOC_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document type. Supported types: {', '.join(VALID_DOC_TYPES)}"
        )

    # Find the type info for validation
    type_info = next(dt for dt in DOCUMENT_TYPES if dt.type == body.doc_type)

    # Check required fields
    missing = [f for f in type_info.required_fields if f not in body.form_data or not body.form_data[f]]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing)}"
        )

    # Generate document with Groq
    content = await generate_document(body.doc_type, body.form_data)

    # Create title from doc type and key fields
    title = f"{type_info.name}"
    if "tenant_name" in body.form_data:
        title += f" - {body.form_data['tenant_name']}"
    elif "employee_name" in body.form_data:
        title += f" - {body.form_data['employee_name']}"
    elif "party2_name" in body.form_data:
        title += f" - {body.form_data['party2_name']}"
    elif "borrower_name" in body.form_data:
        title += f" - {body.form_data['borrower_name']}"

    # Save to database
    gen_doc = GeneratedDocument(
        user_id=current_user.id,
        doc_type=body.doc_type,
        title=title,
        content=content,
        form_data=body.form_data,
    )
    db.add(gen_doc)
    await db.flush()
    await db.refresh(gen_doc)

    return GeneratedDocResponse(
        id=gen_doc.id,
        doc_type=gen_doc.doc_type,
        title=gen_doc.title,
        content=gen_doc.content,
        form_data=gen_doc.form_data,
        created_at=gen_doc.created_at,
    )


@router.get("/history", response_model=list[GeneratedDocResponse])
async def get_generated_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get generated document history for the current user."""
    result = await db.execute(
        select(GeneratedDocument)
        .where(GeneratedDocument.user_id == current_user.id)
        .order_by(GeneratedDocument.created_at.desc())
        .limit(20)
    )
    docs = result.scalars().all()
    return docs


@router.get("/{doc_id}", response_model=GeneratedDocResponse)
async def get_generated_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific generated document by ID."""
    from uuid import UUID
    try:
        doc_uuid = UUID(doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    result = await db.execute(
        select(GeneratedDocument).where(GeneratedDocument.id == doc_uuid)
    )
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return doc


@router.delete("/{doc_id}", status_code=204)
async def delete_generated_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a generated document."""
    from uuid import UUID
    try:
        doc_uuid = UUID(doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    result = await db.execute(
        select(GeneratedDocument).where(GeneratedDocument.id == doc_uuid)
    )
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    await db.delete(doc)
