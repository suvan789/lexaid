import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

const DOC_ICONS = {
  rent_agreement: '🏠', employment_contract: '💼', nda: '🤝',
  affidavit: '📜', legal_notice: '⚠️', partnership_deed: '🤝', loan_agreement: '💰',
};

const DEFAULT_DOC_TYPES = [
  {
    type: "rent_agreement",
    name: "Residential Rental Agreement",
    description: "Standard Indian residential lease agreement under Transfer of Property Act 1882 & Rent Control Act.",
    required_fields: ["landlord_name", "tenant_name", "property_address", "monthly_rent", "security_deposit", "notice_period_months", "agreement_date"]
  },
  {
    type: "employment_contract",
    name: "Employment Contract",
    description: "Standard employee offer & service contract under Indian Contract Act 1872 & Labour laws.",
    required_fields: ["employer_name", "employee_name", "job_title", "monthly_salary", "joining_date", "notice_period_days"]
  },
  {
    type: "nda",
    name: "Non-Disclosure Agreement (NDA)",
    description: "Mutual or one-way confidentiality agreement protecting trade secrets & proprietary business information.",
    required_fields: ["disclosing_party", "receiving_party", "purpose", "effective_date", "confidentiality_years"]
  },
  {
    type: "affidavit",
    name: "General Affidavit",
    description: "Sworn legal declaration statement executed under oath for official and court purposes.",
    required_fields: ["deponent_name", "father_name", "address", "statement", "affidavit_date"]
  },
  {
    type: "legal_notice",
    name: "Legal Notice for Recovery / Eviction",
    description: "Formal statutory legal notice before initiating civil or criminal litigation.",
    required_fields: ["advocate_name", "client_name", "opposite_party_name", "grievance_details", "relief_sought", "notice_date"]
  },
  {
    type: "partnership_deed",
    name: "Partnership Deed",
    description: "Business partnership agreement under the Indian Partnership Act 1932.",
    required_fields: ["partner1_name", "partner2_name", "firm_name", "business_nature", "profit_share_ratio", "start_date"]
  },
  {
    type: "loan_agreement",
    name: "Personal / Commercial Loan Agreement",
    description: "Legally enforceable loan & debt repayment agreement with interest terms.",
    required_fields: ["lender_name", "borrower_name", "principal_amount", "interest_rate", "tenure_months", "loan_date"]
  }
];

export default function GeneratorPage() {
  const [step, setStep] = useState(1);
  const [docTypes, setDocTypes] = useState(DEFAULT_DOC_TYPES);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [signatureImage, setSignatureImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setGeneratedDoc } = useApp();
  const navigate = useNavigate();

  useEffect(() => { fetchDocTypes(); }, []);

  const fetchDocTypes = async () => {
    try {
      const res = await API.get('/api/generator/types', { timeout: 3000 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDocTypes(res.data);
      }
    } catch {}
  };

  const handleSelectType = (dt) => {
    setSelectedType(dt);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const initial = {};
    dt.required_fields.forEach(field => {
      if (field.includes('date')) {
        initial[field] = todayStr;
      }
    });
    setFormData(initial);
    setSignatureImage(null);
    setStep(2);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result);
        setFormData(prev => ({ ...prev, signature_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatLabel = (field) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    const missing = selectedType.required_fields.filter(f => !formData[f]?.trim());
    if (missing.length > 0) {
      setError(`Please fill in required fields: ${missing.map(formatLabel).join(', ')}`);
      return;
    }
    setError('');
    setLoading(true);

    try {
      let docResult = null;
      try {
        const res = await API.post('/api/generator/generate', {
          doc_type: selectedType.type,
          form_data: {
            ...formData,
            signature_image: signatureImage || formData.signature_image || null
          },
        }, { timeout: 4000 });
        docResult = res.data;
      } catch (err) {
        console.warn("Backend API note, executing local template compiler:", err);
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        let content = '';

        if (selectedType.type === 'rent_agreement') {
          const d = formData;
          content = `RESIDENTIAL RENTAL AGREEMENT

THIS RENTAL AGREEMENT is made and executed on ${d.agreement_date || today} at the place mentioned herein below.

BETWEEN

LANDLORD: ${d.landlord_name || '__________'}, hereinafter referred to as the "LANDLORD" (which expression shall unless repugnant to the context include his/her heirs, successors, legal representatives and assigns).

AND

TENANT: ${d.tenant_name || '__________'}, hereinafter referred to as the "TENANT" (which expression shall unless repugnant to the context include his/her heirs, successors and assigns).

The Landlord and the Tenant are collectively referred to as the "Parties."

WHEREAS the Landlord is the owner of the residential property situated at:
${d.property_address || '__________'}
hereinafter referred to as the "Demised Premises."

NOW THEREFORE, in consideration of the mutual covenants and conditions herein contained, the Parties agree as follows:

1. LEASE PERIOD
   This tenancy shall commence on ${d.agreement_date || today} and shall continue on a month-to-month basis unless terminated by either party as specified herein.

2. MONTHLY RENT
   The Tenant agrees to pay a monthly rent of Rs. ${d.monthly_rent || '__________'}/- (Rupees ${d.monthly_rent || '__________'} only) payable on or before the 5th day of each month.

3. SECURITY DEPOSIT
   The Tenant has deposited a sum of Rs. ${d.security_deposit || '__________'}/- (Rupees ${d.security_deposit || '__________'} only) as an interest-free refundable security deposit. This amount shall be refunded at the time of vacating the premises after deducting legitimate dues, if any.

4. USE OF PREMISES
   The Tenant shall use the demised premises solely for residential purposes and shall not carry on any commercial, illegal or immoral activity from the premises. The Tenant shall not sublet or assign the premises to any third party without the prior written consent of the Landlord.

5. MAINTENANCE & UTILITIES
   (a) The Tenant shall pay all utility bills including electricity, water, internet, gas and maintenance charges regularly.
   (b) The Tenant shall maintain the premises in good and tenantable condition and shall not carry out any structural alterations without prior written consent of the Landlord.
   (c) Minor day-to-day repairs (below Rs. 500) shall be the Tenant's responsibility. Major structural repairs shall be the Landlord's responsibility.

6. NOTICE PERIOD & TERMINATION
   Either party may terminate this agreement by giving ${d.notice_period_months || '1'} month(s) prior written notice to the other party. Upon termination, the Tenant shall vacate the premises peaceably and hand over vacant possession in good condition.

7. LANDLORD'S RIGHT OF INSPECTION
   The Landlord or his/her authorized representative shall have the right to inspect the premises at a mutually convenient time with prior notice of 24 hours.

8. LOCK-IN PERIOD
   This agreement shall have a lock-in period of 6 months from the date of commencement. Neither party shall terminate this agreement before the expiry of the lock-in period.

9. GOVERNING LAW
   This Agreement shall be governed by and construed in accordance with the Transfer of Property Act 1882, Rent Control Legislation applicable in the jurisdiction, and the Indian Contract Act 1872.

10. DISPUTE RESOLUTION
    Any dispute arising out of or in connection with this Agreement shall be first attempted to be resolved amicably. If unresolved within 30 days, the matter shall be referred to arbitration or civil courts of competent jurisdiction.

IN WITNESS WHEREOF, the Parties have signed this Agreement on the date first written above.

LANDLORD:                                    TENANT:
Name: ${d.landlord_name || '__________'}         Name: ${d.tenant_name || '__________'}
Signature: ____________________              Signature: ____________________
Date: ${d.agreement_date || today}               Date: ${d.agreement_date || today}

WITNESSES:
1. Name: ____________________  Signature: ____________________
2. Name: ____________________  Signature: ____________________`;

        } else if (selectedType.type === 'employment_contract') {
          const d = formData;
          content = `EMPLOYMENT CONTRACT / OFFER LETTER

Date: ${d.joining_date || today}

TO,
${d.employee_name || '__________'}

Dear ${d.employee_name?.split(' ')[0] || 'Candidate'},

We are pleased to offer you employment with ${d.employer_name || '__________'} ("the Company") on the following terms and conditions:

1. POSITION & DESIGNATION
   Job Title: ${d.job_title || '__________'}
   Department: As assigned by management
   Reporting To: Immediate supervisor / Manager

2. COMMENCEMENT OF EMPLOYMENT
   Your employment shall commence on ${d.joining_date || today}. This offer is contingent upon satisfactory completion of background verification.

3. COMPENSATION & BENEFITS
   (a) Basic Monthly Salary: Rs. ${d.monthly_salary || '__________'}/- (Rupees ${d.monthly_salary || '__________'} only)
   (b) Annual CTC shall include Basic, HRA, Conveyance Allowance, Medical Allowance and other statutory components.
   (c) Salary shall be credited to your registered bank account by the last working day of each month.
   (d) You will be entitled to statutory benefits including Provident Fund (PF), Employee State Insurance (ESI), and Gratuity as per applicable laws.

4. PROBATION PERIOD
   You will be on probation for a period of 6 months from the date of joining, during which performance will be assessed. The Company reserves the right to extend the probation period based on performance evaluation.

5. WORKING HOURS
   Standard working hours are 9:00 AM to 6:00 PM, Monday to Saturday (or as specified by the Company). The Company may require you to work beyond regular hours when necessary.

6. LEAVE ENTITLEMENT
   (a) Earned Leave: 18 days per annum
   (b) Casual Leave: 6 days per annum
   (c) Sick Leave: 6 days per annum
   (d) Public Holidays as per the Company's Holiday List

7. NOTICE PERIOD & TERMINATION
   (a) Either party may terminate this employment by providing ${d.notice_period_days || '30'} days' prior written notice.
   (b) The Company reserves the right to terminate employment without notice in case of gross misconduct, fraud, misrepresentation or breach of this contract.
   (c) The employee shall serve the notice period or pay salary in lieu thereof.

8. CONFIDENTIALITY
   You shall maintain strict confidentiality of all proprietary, technical, commercial and business information of the Company during and after employment. Breach of confidentiality shall constitute grounds for immediate termination and legal action.

9. INTELLECTUAL PROPERTY
   All inventions, developments, software, documents, or work product created during the course of employment shall be the exclusive property of the Company.

10. CODE OF CONDUCT
    You are expected to adhere to the Company's policies, code of conduct, and comply with all applicable laws and regulations.

11. GOVERNING LAW
    This contract is governed by the Indian Contract Act 1872, Industrial Employment (Standing Orders) Act 1946, and applicable Labour Laws of India.

Please sign and return a copy of this letter as your acceptance of the above terms.

Yours sincerely,

For ${d.employer_name || '__________'}:
Authorized Signatory: ____________________
Date: ${d.joining_date || today}

ACCEPTANCE BY EMPLOYEE:
I, ${d.employee_name || '__________'}, accept the above terms and conditions of employment.

Signature: ____________________
Date: ____________________`;

        } else if (selectedType.type === 'nda') {
          const d = formData;
          content = `NON-DISCLOSURE AGREEMENT (NDA)
MUTUAL / ONE-WAY CONFIDENTIALITY AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${d.effective_date || today} by and between:

DISCLOSING PARTY: ${d.disclosing_party || '__________'}, hereinafter referred to as "Disclosing Party."

RECEIVING PARTY: ${d.receiving_party || '__________'}, hereinafter referred to as "Receiving Party."

Collectively referred to as the "Parties."

PURPOSE:
The Parties wish to explore or engage in the following business relationship or purpose:
"${d.purpose || '__________'}"

In connection with this Purpose, the Disclosing Party may disclose certain Confidential Information to the Receiving Party. The Parties agree to the following terms:

1. DEFINITION OF CONFIDENTIAL INFORMATION
   "Confidential Information" means any and all non-public, proprietary, or sensitive information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, electronically, or by any other means, including but not limited to:
   (a) Business plans, strategies, financial data, projections, and forecasts
   (b) Technical data, trade secrets, know-how, research, product plans, and inventions
   (c) Customer lists, vendor information, and business contacts
   (d) Software, databases, algorithms, formulas, and processes
   (e) Marketing strategies, pricing information, and competitive analyses
   (f) Personnel data, salary information, and internal policies

2. OBLIGATIONS OF RECEIVING PARTY
   The Receiving Party agrees to:
   (a) Keep all Confidential Information strictly confidential and not disclose it to any third party without prior written consent of the Disclosing Party.
   (b) Use the Confidential Information solely for the Purpose stated above.
   (c) Limit access to Confidential Information to its employees, agents, or advisors who have a strict need to know and are bound by confidentiality obligations at least as protective as this Agreement.
   (d) Protect the Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.

3. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
   This Agreement does not apply to information that:
   (a) Is or becomes publicly available through no fault of the Receiving Party
   (b) Was rightfully known to the Receiving Party prior to disclosure
   (c) Is independently developed by the Receiving Party without use of Confidential Information
   (d) Is required to be disclosed by applicable law, court order, or government authority (with prior written notice to the Disclosing Party where legally permissible)

4. TERM OF CONFIDENTIALITY
   This Agreement shall remain in effect from the Effective Date and the confidentiality obligations shall survive for a period of ${d.confidentiality_years || '2'} year(s) from the date of disclosure of such Confidential Information.

5. RETURN OF INFORMATION
   Upon written request by the Disclosing Party, the Receiving Party shall promptly return or destroy all Confidential Information and any copies, extracts, or summaries thereof.

6. REMEDIES
   The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages would be inadequate. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction, in addition to all other remedies available at law or in equity.

7. NO LICENSE
   Nothing in this Agreement grants the Receiving Party any right, title, or license in or to any Confidential Information, intellectual property, or other assets of the Disclosing Party.

8. GOVERNING LAW & JURISDICTION
   This Agreement shall be governed by the laws of India. Any dispute arising from this Agreement shall be subject to the exclusive jurisdiction of the courts in India.

IN WITNESS WHEREOF, the Parties have executed this Non-Disclosure Agreement as of the date first written above.

DISCLOSING PARTY:                          RECEIVING PARTY:
Name: ${d.disclosing_party || '__________'}    Name: ${d.receiving_party || '__________'}
Signature: ____________________            Signature: ____________________
Date: ${d.effective_date || today}             Date: ${d.effective_date || today}`;

        } else if (selectedType.type === 'affidavit') {
          const d = formData;
          content = `AFFIDAVIT

I, ${d.deponent_name || '__________'}, Son/Daughter/Wife of ${d.father_name || '__________'}, aged ____ years, residing at ${d.address || '__________'}, do hereby solemnly affirm and declare as under:

1. That I am the deponent herein and am competent to swear this affidavit.

2. That the statements made herein are true and correct to the best of my knowledge and belief, and nothing material has been concealed or misrepresented.

3. STATEMENT / DECLARATION:
   ${d.statement || '__________'}

4. That this affidavit is being made for the purpose of __________ and for submission before the concerned authorities / courts / institutions.

5. That the deponent is not under any legal disability, mental incapacity, or duress at the time of making this declaration.

6. That no proceedings are pending against the deponent in any court of law regarding the subject matter of this affidavit.

VERIFICATION:
I, ${d.deponent_name || '__________'}, the above-named deponent, do hereby verify and declare that the contents of the above affidavit are true and correct to my knowledge; that no part of it is false; and that nothing material has been concealed therein.

Verified at __________ on this ${d.affidavit_date || today}.

DEPONENT:
Name: ${d.deponent_name || '__________'}
Signature: ____________________
Date: ${d.affidavit_date || today}

Sworn before me:
Notary / Magistrate / Oath Commissioner: ____________________
Seal & Signature: ____________________
Date: ____________________

[NOTARY STAMP]`;

        } else if (selectedType.type === 'legal_notice') {
          const d = formData;
          content = `LEGAL NOTICE

Date: ${d.notice_date || today}

FROM:
${d.advocate_name || '__________'}, Advocate
On behalf of: ${d.client_name || '__________'}
(Hereinafter referred to as "Noticing Party")

TO:
${d.opposite_party_name || '__________'}
(Hereinafter referred to as "Noticee")

SUBJECT: LEGAL NOTICE UNDER SECTION 80 CPC / RELEVANT STATUTORY PROVISIONS

Sir/Madam,

Under instructions from and on behalf of my client ${d.client_name || '__________'}, I hereby serve you the following Legal Notice:

1. BACKGROUND & GRIEVANCE:
   ${d.grievance_details || '__________'}

2. LEGAL BASIS:
   The aforesaid acts / omissions / conduct of the Noticee are in clear violation of the applicable laws of India, including but not limited to the Indian Contract Act 1872, Transfer of Property Act 1882, Code of Civil Procedure 1908, and/or other applicable statutes, and constitute actionable wrongs causing loss, injury, and damage to my client.

3. RELIEF SOUGHT:
   In view of the above, my client calls upon you to:
   ${d.relief_sought || '__________'}

4. TIME LIMIT:
   You are hereby called upon to comply with the above demands within 15 (FIFTEEN) days from the receipt of this notice. Failing which, my client shall be constrained to initiate appropriate civil and/or criminal legal proceedings against you before the competent court of jurisdiction, entirely at your cost and risk, without any further notice to you.

5. COSTS:
   All costs, charges, and expenses incurred in connection with these legal proceedings shall be recovered from you.

Please take this notice seriously and govern yourself accordingly.

Yours faithfully,

${d.advocate_name || '__________'}
Advocate
Bar Council Enrollment No.: __________
Address: __________
Phone: __________

Note: This notice has been sent on behalf of ${d.client_name || '__________'}. The Noticee is advised to respond within the stipulated time to avoid litigation.`;

        } else if (selectedType.type === 'partnership_deed') {
          const d = formData;
          content = `PARTNERSHIP DEED

THIS DEED OF PARTNERSHIP is made and entered into on ${d.start_date || today} at __________.

BETWEEN:

PARTNER 1: ${d.partner1_name || '__________'}, hereinafter referred to as "First Partner."

AND

PARTNER 2: ${d.partner2_name || '__________'}, hereinafter referred to as "Second Partner."

The First Partner and the Second Partner are collectively referred to as "Partners."

NOW THIS DEED WITNESSETH as follows:

1. FIRM NAME
   The Partners hereby agree to carry on business in partnership under the name and style of "${d.firm_name || '__________'}" (hereinafter referred to as "the Firm").

2. NATURE OF BUSINESS
   The business of the Firm shall be: ${d.business_nature || '__________'}, and such other activities as may be mutually agreed upon by the Partners from time to time.

3. COMMENCEMENT & DURATION
   The partnership shall commence on ${d.start_date || today} and shall continue until dissolved by mutual consent or in accordance with the provisions of this deed.

4. PLACE OF BUSINESS
   The principal place of business of the Firm shall be at __________ or such other place as may be agreed upon by the Partners.

5. CAPITAL CONTRIBUTION
   Each Partner shall contribute capital to the Firm as mutually agreed. Additional capital requirements shall be contributed in proportion to their profit-sharing ratio unless otherwise agreed in writing.

6. PROFIT & LOSS SHARING
   The net profits and losses of the Firm shall be shared between the Partners in the following ratio:
   ${d.partner1_name || 'First Partner'}: ${d.profit_share_ratio?.split(':')[0] || '50'}%
   ${d.partner2_name || 'Second Partner'}: ${d.profit_share_ratio?.split(':')[1] || '50'}%
   (Profit Share Ratio: ${d.profit_share_ratio || '50:50'})

7. BANKING & ACCOUNTS
   (a) The Firm shall maintain a bank account in the name of the Firm with a scheduled bank.
   (b) All receipts, payments, and financial transactions shall be routed through the Firm's bank account.
   (c) Cheques / withdrawals above Rs. 10,000 shall require signatures of both Partners.

8. MANAGEMENT & DUTIES
   (a) Each Partner shall devote their full time, attention, and skills to the business of the Firm.
   (b) Each Partner shall have equal rights to participate in the management of the Firm's business.
   (c) No Partner shall, without the written consent of the other Partner, engage in any business competitive with the Firm.

9. BOOKS OF ACCOUNTS
   (a) Proper books of accounts shall be maintained at the principal place of business.
   (b) Each Partner shall have the right to inspect and audit the books of accounts at any time.
   (c) Annual accounts shall be prepared as of 31st March each year.

10. DRAWINGS
    Each Partner shall be entitled to draw a sum not exceeding Rs. __________ per month from the Firm's account as drawings against their share of profits.

11. RETIREMENT & DISSOLUTION
    (a) Any Partner may retire from the Firm by giving 3 months' prior written notice to the other Partner.
    (b) Upon retirement, the retiring Partner shall be entitled to their share of capital and profits up to the date of retirement.
    (c) The Firm shall not be dissolved on the death, insolvency, or retirement of any Partner unless mutually agreed.

12. ARBITRATION
    Any dispute or difference arising between the Partners concerning the business, accounts, or interpretation of this deed shall be referred to arbitration under the Arbitration and Conciliation Act 1996.

13. GOVERNING LAW
    This Partnership Deed shall be governed by the Indian Partnership Act 1932 and the laws of India.

IN WITNESS WHEREOF, the Partners have signed this Deed of Partnership on the date first above written.

FIRST PARTNER:                             SECOND PARTNER:
Name: ${d.partner1_name || '__________'}       Name: ${d.partner2_name || '__________'}
Signature: ____________________            Signature: ____________________
Date: ${d.start_date || today}                 Date: ${d.start_date || today}

WITNESSES:
1. Name: ____________________  Signature: ____________________
2. Name: ____________________  Signature: ____________________`;

        } else if (selectedType.type === 'loan_agreement') {
          const d = formData;
          const principal = d.principal_amount || '__________';
          const rate = d.interest_rate || '__________';
          const tenure = d.tenure_months || '__________';
          content = `LOAN AGREEMENT

THIS LOAN AGREEMENT ("Agreement") is made and entered into on ${d.loan_date || today} between:

LENDER: ${d.lender_name || '__________'}, hereinafter referred to as the "Lender."

AND

BORROWER: ${d.borrower_name || '__________'}, hereinafter referred to as the "Borrower."

WHEREAS the Borrower has requested the Lender to lend a certain sum of money, and the Lender has agreed to lend such sum on the terms and conditions set forth herein.

NOW THEREFORE, in consideration of the mutual covenants herein, the Parties agree as follows:

1. LOAN AMOUNT (PRINCIPAL)
   The Lender agrees to lend to the Borrower a sum of Rs. ${principal}/- (Rupees ${principal} only), hereinafter referred to as the "Principal Amount." The Borrower acknowledges receipt of this amount in full.

2. PURPOSE OF LOAN
   The Borrower shall use the loan amount solely for __________ purposes and shall not divert funds for any other purpose without prior written consent of the Lender.

3. RATE OF INTEREST
   The loan shall carry an interest rate of ${rate}% per annum (compounded monthly / annually as agreed), calculated on the reducing balance.

4. REPAYMENT SCHEDULE
   (a) Loan Tenure: ${tenure} months from the date of disbursement.
   (b) The Borrower shall repay the loan in ${tenure} equal monthly instalments (EMI) of Rs. __________ each.
   (c) Repayments shall be made on or before the 5th day of each month.
   (d) The Borrower may prepay the outstanding loan amount at any time without penalty.

5. SECURITY / COLLATERAL
   As security for repayment of the loan, the Borrower hereby provides / pledges: __________ (if applicable). In the absence of collateral, this is an unsecured personal loan based on mutual trust.

6. DEFAULT & CONSEQUENCES
   (a) If the Borrower fails to make any instalment payment within 15 days of the due date, it shall constitute an "Event of Default."
   (b) Upon default, the entire outstanding amount (Principal + Interest + Penalty) shall become immediately due and payable.
   (c) In case of default, the Lender shall be entitled to charge a penal interest of 2% per month on the overdue amount.
   (d) The Lender shall have the right to initiate legal proceedings for recovery of dues.

7. PREPAYMENT
   The Borrower may prepay the entire outstanding loan amount or part thereof at any time. Part prepayment shall be adjusted against the principal outstanding.

8. REPRESENTATIONS & WARRANTIES
   The Borrower represents and warrants that:
   (a) The Borrower has the legal capacity to enter into this Agreement.
   (b) There are no pending legal proceedings against the Borrower that would affect repayment.
   (c) All information provided to the Lender is true, accurate, and complete.

9. GOVERNING LAW
   This Agreement shall be governed by the Indian Contract Act 1872, and any dispute shall be resolved in courts of competent jurisdiction in India.

10. DISPUTE RESOLUTION
    Any dispute arising out of this Agreement shall first be attempted to be resolved through mutual negotiation within 30 days. If unresolved, the dispute shall be referred to arbitration under the Arbitration and Conciliation Act 1996.

IN WITNESS WHEREOF, the Parties have executed this Loan Agreement on the date first written above.

LENDER:                                    BORROWER:
Name: ${d.lender_name || '__________'}         Name: ${d.borrower_name || '__________'}
Signature: ____________________            Signature: ____________________
Date: ${d.loan_date || today}                  Date: ${d.loan_date || today}

WITNESSES:
1. Name: ____________________  Signature: ____________________
2. Name: ____________________  Signature: ____________________`;

        } else {
          content = `${selectedType.name.toUpperCase()}\n\nThis document has been generated using LexAid AI Legal Document Generator.\n\nDocument Type: ${selectedType.name}\nDate: ${today}\n\n[Document content generated based on provided details]\n\nThis document is governed by the Indian Contract Act 1872 and applicable laws of India.`;
        }

        docResult = {
          title: selectedType.name,
          content: content,
          doc_type: selectedType.type,
          form_data: formData,
          signature_image: signatureImage
        };
      }

      setGeneratedDoc({
        ...docResult,
        form_data: {
          ...docResult.form_data,
          signature_image: signatureImage
        }
      });
      navigate('/generate/result');
    } catch (err) {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-3xl mx-auto text-center py-20 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-navy mb-2">AI is drafting your document...</p>
        <p className="text-sm text-gray-400">This may take 15-30 seconds</p>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-navy mb-2">Generate Legal Document</h1>
        <p className="text-gray-500">Create professional legal documents powered by AI</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step >= 1 ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span> Choose Type
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step >= 2 ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span> Fill Details
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {docTypes.map((dt) => (
            <button
              key={dt.type}
              onClick={() => handleSelectType(dt)}
              className="bg-white rounded-xl p-5 text-left shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
            >
              <div className="text-3xl mb-3">{DOC_ICONS[dt.type] || '📄'}</div>
              <h3 className="font-semibold text-navy mb-1">{dt.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{dt.description}</p>
              <span className="text-accent text-sm font-medium group-hover:underline">Select →</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && selectedType && (
        <div className="animate-fade-in">
          <button onClick={() => setStep(1)} className="text-sm text-accent hover:underline mb-4 inline-flex items-center gap-1">
            ← Back to document types
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{DOC_ICONS[selectedType.type] || '📄'}</span>
                <div>
                  <h2 className="text-lg font-bold text-navy">{selectedType.name}</h2>
                  <p className="text-sm text-gray-500">{selectedType.required_fields.length} fields required</p>
                </div>
              </div>
              <div className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-semibold">
                📅 Date Auto-Filled to Today ({new Date().toISOString().split('T')[0]})
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {selectedType.required_fields.map((field) => (
                <div key={field} className={field === 'statement' || field === 'grievance_details' || field === 'relief_sought' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {formatLabel(field)} <span className="text-red-400">*</span>
                  </label>
                  {(field === 'statement' || field === 'grievance_details' || field === 'relief_sought') ? (
                    <textarea
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm resize-none"
                      placeholder={`Enter ${formatLabel(field).toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.includes('date') ? 'date' : field.includes('amount') || field.includes('rate') || field.includes('salary') || field.includes('months') || field.includes('days') || field.includes('hours') || field.includes('share') || field.includes('years') || field.includes('age') ? 'number' : 'text'}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                      placeholder={`Enter ${formatLabel(field).toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Signature Upload Section */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 mb-6">
              <label className="block text-sm font-semibold text-navy mb-1">
                ✍️ Upload Sender / Authorized Signature (Optional Image)
              </label>
              <p className="text-xs text-gray-500 mb-3">Upload your signature image (PNG/JPG) to place it on the final document & PDF.</p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-white hover:file:bg-navy-light cursor-pointer"
              />

              {signatureImage && (
                <div className="mt-3 flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
                  <img src={signatureImage} alt="Uploaded Signature" className="h-12 max-w-[160px] object-contain border border-gray-200 p-1 rounded" />
                  <div>
                    <p className="text-xs font-semibold text-green-600">✓ Signature Loaded Successfully</p>
                    <button type="button" onClick={() => setSignatureImage(null)} className="text-xs text-red-500 hover:underline mt-0.5">Remove Signature</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all shadow-md"
            >
              📝 Generate Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
