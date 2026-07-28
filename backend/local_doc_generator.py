import json
from datetime import datetime

# 100% Local Legal Document Drafting Engine (No Third-Party APIs)
# Generates comprehensive, legally binding Indian legal documents under Indian Statutory Acts

def generate_local_legal_document(doc_type: str, form_data: dict) -> str:
    """Generate complete legal document templates under Indian Statutory Acts."""
    dt_clean = doc_type.lower().replace("_", " ")
    today = datetime.now().strftime("%B %d, %Y")

    full_name = form_data.get("full_name") or form_data.get("tenant_name") or form_data.get("employee_name") or form_data.get("party1_name") or "SUVAN SENTHIL"
    party2_name = form_data.get("landlord_name") or form_data.get("company_name") or form_data.get("party2_name") or "LEXAID ENTERPRISES PVT LTD"
    address = form_data.get("address") or form_data.get("property_address") or "No. 45, Anna Salai, Chennai, Tamil Nadu - 600002"
    amount = form_data.get("amount") or form_data.get("rent_amount") or form_data.get("salary") or "15,000"
    duration = form_data.get("duration") or "11 months"

    if "rent" in dt_clean or "lease" in dt_clean:
        return f"""RESIDENTIAL RENTAL & LEASE AGREEMENT
(Under Section 105 of the Transfer of Property Act, 1882)

THIS DEED OF LEASE is executed on this {today} at Chennai, Tamil Nadu by and between:

LESSOR (LANDLORD):
{party2_name}, residing at {address} (hereinafter called the "LESSOR").

AND

LESSEE (TENANT):
{full_name}, residing at {address} (hereinafter called the "LESSEE").

WHEREAS the Lessor is the absolute owner of the residential property situated at {address}.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. DURATION: The lease shall be for a period of {duration} commencing from {today}.
2. MONTHLY RENT: The Lessee agrees to pay monthly rent of INR {amount}/- on or before the 5th of each calendar month.
3. SECURITY DEPOSIT: The Lessee has paid an advance security deposit of INR 50,000/- refundable upon lease expiry under Section 108(b) of Transfer of Property Act 1882.
4. STATUTORY NOTICE: Either party may terminate this agreement by giving 30 days prior written notice under Section 106 of Transfer of Property Act 1882.
5. MAINTENANCE & UTILITIES: Lessee shall pay monthly electricity and water utility bills as per actual meter readings.
6. JURISDICTION: Subject to the exclusive jurisdiction of local Civil Courts.

IN WITNESS WHEREOF the parties have set their hands on the date first written above.

___________________________                     ___________________________
LESSOR ({party2_name})                           LESSEE ({full_name})

WITNESSES:
1. ________________________                     2. ________________________
"""

    elif "employment" in dt_clean or "job" in dt_clean:
        return f"""EMPLOYMENT CONTRACT & SERVICE AGREEMENT
(Under the Indian Contract Act, 1872)

THIS EMPLOYMENT AGREEMENT is entered into on this {today} between:

EMPLOYER: {party2_name}, having its registered office at {address}.
EMPLOYEE: {full_name}, residing at {address}.

TERMS AND CONDITIONS OF EMPLOYMENT:

1. APPOINTMENT: The Employee is appointed to the position of Software Developer.
2. REMUNERATION: The Company shall pay monthly salary of INR {amount}/- subject to statutory tax deductions.
3. PROBATION & NOTICE: Probation period shall be 6 months. Notice period during or post probation is 60 days.
4. CONFIDENTIALITY: Governed by Section 43A of Information Technology Act 2000; Employee agrees to protect proprietary source code.
5. GOVERNING LAW: Governed by Indian Contract Act 1872. Section 27 invalidates post-employment non-compete restraints.

___________________________                     ___________________________
EMPLOYER ({party2_name})                          EMPLOYEE ({full_name})
"""

    elif "nda" in dt_clean or "confidential" in dt_clean:
        return f"""MUTUAL NON-DISCLOSURE AGREEMENT (MUTUAL NDA)
(Under Section 43A of Information Technology Act, 2000 & Indian Contract Act, 1872)

THIS AGREEMENT is made on this {today} between:

DISCLOSING PARTY: {party2_name}
RECEIVING PARTY: {full_name}

1. CONFIDENTIAL INFORMATION: Includes technical specs, customer databases, trade secrets, and source code.
2. OBLIGATIONS: Receiving Party agrees not to disclose information for 3 years from receipt date.
3. REMEDIES: In case of breach, Disclosing Party entitled to seek injunctive relief and damages under Section 73 of Indian Contract Act 1872.

___________________________                     ___________________________
DISCLOSING PARTY ({party2_name})                  RECEIVING PARTY ({full_name})
"""

    else:
        return f"""GENERAL LEGAL AGREEMENT DEED
(Under the Indian Contract Act, 1872)

THIS DEED OF AGREEMENT is executed on {today} between {party2_name} and {full_name}.

1. OBLIGATIONS: Both parties agree to perform mutual obligations in accordance with Section 10 of Indian Contract Act 1872.
2. CONSIDERATION: The agreed valuation for services/goods is INR {amount}/-.
3. DISPUTE RESOLUTION: All disputes shall be settled via Arbitration under Section 7 of Arbitration and Conciliation Act 1996.

___________________________                     ___________________________
FIRST PARTY ({party2_name})                       SECOND PARTY ({full_name})
"""
