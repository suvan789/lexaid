import copy
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from groq_service import analyze_document
from models import Document, User
from pdf_parser import extract_text
from schemas import AnalysisResponse, DocumentHistory, TranslationRequest
from translation import translate_text

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("/upload", response_model=AnalysisResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF document for AI-powered legal analysis. Saves results to DB."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract text from PDF (with scanned PDF OCR fallback)
    document_text = extract_text(file_bytes, file.filename)

    # Analyze with Groq LLM
    analysis = await analyze_document(document_text)

    # Enrich with Local Machine Learning Model Risk Analysis
    try:
        from ml_engine.predictor import predict_risk_ml, classify_document_ml
        ml_risk = predict_risk_ml(document_text[:2000] if document_text else "standard agreement")
        ml_class = classify_document_ml(document_text[:2000] if document_text else "standard agreement")
        analysis["ml_risk_score_percentage"] = ml_risk.get("risk_score_percentage", 45.0)
        analysis["ml_document_type"] = ml_class.get("predicted_category", "Standard Legal Document")
    except Exception as ml_err:
        print(f"ML enrichment note: {ml_err}")

    # Save document to database
    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        document_type=analysis.get("document_type", "Unknown"),
        overall_risk=analysis.get("overall_risk", "MEDIUM"),
        risk_summary=analysis.get("risk_summary", ""),
        analysis_json=analysis,
        document_text=document_text,
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)

    return AnalysisResponse(
        document_type=analysis.get("document_type", "Unknown"),
        overall_risk=analysis.get("overall_risk", "MEDIUM"),
        risk_summary=analysis.get("risk_summary", ""),
        total_clauses=analysis.get("total_clauses", 0),
        high_risk_count=analysis.get("high_risk_count", 0),
        medium_risk_count=analysis.get("medium_risk_count", 0),
        low_risk_count=analysis.get("low_risk_count", 0),
        clauses=analysis.get("clauses", []),
        document_text=document_text,
        document_id=str(doc.id),
    )


@router.get("/history", response_model=list[DocumentHistory])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the document analysis history for the current user, newest first."""
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .limit(20)
    )
    documents = result.scalars().all()
    return documents


@router.get("/{document_id}", response_model=AnalysisResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a full document analysis by ID. Must belong to the current user."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this document.")

    analysis = doc.analysis_json or {}

    return AnalysisResponse(
        document_type=analysis.get("document_type", doc.document_type or "Unknown"),
        overall_risk=analysis.get("overall_risk", doc.overall_risk or "MEDIUM"),
        risk_summary=analysis.get("risk_summary", doc.risk_summary or ""),
        total_clauses=analysis.get("total_clauses", 0),
        high_risk_count=analysis.get("high_risk_count", 0),
        medium_risk_count=analysis.get("medium_risk_count", 0),
        low_risk_count=analysis.get("low_risk_count", 0),
        clauses=analysis.get("clauses", []),
        document_text=doc.document_text or "",
        document_id=str(doc.id),
    )


@router.post("/{document_id}/translate", response_model=AnalysisResponse)
async def translate_document(
    document_id: UUID,
    body: TranslationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Translate the analysis of a document to Tamil or Hindi."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this document.")

    analysis = copy.deepcopy(doc.analysis_json or {})
    target_lang = body.target_language

    from translation import translate_texts_batch
    
    texts_to_translate = []
    
    if analysis.get("risk_summary"):
        texts_to_translate.append(analysis["risk_summary"])
        
    for clause in analysis.get("clauses", []):
        if clause.get("plain_explanation"):
            texts_to_translate.append(clause["plain_explanation"])
        if clause.get("what_it_means_for_you"):
            texts_to_translate.append(clause["what_it_means_for_you"])
        if clause.get("your_rights") and clause["your_rights"].strip():
            texts_to_translate.append(clause["your_rights"])

    if texts_to_translate:
        translated_texts = await translate_texts_batch(texts_to_translate, target_lang)
        
        idx = 0
        if analysis.get("risk_summary"):
            analysis["risk_summary"] = translated_texts[idx]
            idx += 1
            
        for clause in analysis.get("clauses", []):
            if clause.get("plain_explanation"):
                clause["plain_explanation"] = translated_texts[idx]
                idx += 1
            if clause.get("what_it_means_for_you"):
                clause["what_it_means_for_you"] = translated_texts[idx]
                idx += 1
            if clause.get("your_rights") and clause["your_rights"].strip():
                clause["your_rights"] = translated_texts[idx]
                idx += 1

    return AnalysisResponse(
        document_type=analysis.get("document_type", doc.document_type or "Unknown"),
        overall_risk=analysis.get("overall_risk", doc.overall_risk or "MEDIUM"),
        risk_summary=analysis.get("risk_summary", ""),
        total_clauses=analysis.get("total_clauses", 0),
        high_risk_count=analysis.get("high_risk_count", 0),
        medium_risk_count=analysis.get("medium_risk_count", 0),
        low_risk_count=analysis.get("low_risk_count", 0),
        clauses=analysis.get("clauses", []),
        document_text=doc.document_text or "",
        document_id=str(doc.id),
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document. Must belong to the current user."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this document.")

    await db.delete(doc)
