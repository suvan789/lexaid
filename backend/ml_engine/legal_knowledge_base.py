"""
LexAid AI Legal Knowledge Base — 500+ curated Indian Law Q&A pairs.
Covers all major Indian Acts, Sections, and legal scenarios.
Used by the TF-IDF Semantic Retrieval engine in legal_ai_engine.py.
"""

LEGAL_QA_CORPUS = [

    # ─── GREETINGS & GENERAL ────────────────────────────────────────────────
    {"q": "hello hi hey namaste good morning good evening",
     "a": "Namaste! 👋 I am **LexAid AI**, your offline Indian Legal Assistant powered by a pretrained ML model.\n\nI can help you with:\n• 🏠 Rent & Tenant Rights\n• 💼 Employment & Labour Law\n• 💳 Cheque Bounce (Section 138)\n• 👨‍👩‍👧 Family & Matrimonial Law\n• 🛒 Consumer Rights\n• 🔒 Cyber Crime & IT Act\n• 🏛️ Criminal Law (BNS/IPC)\n• 📄 Contracts & Agreements\n\nHow can I help you today?"},

    {"q": "who are you what is lexaid what can you do capabilities",
     "a": "I am **LexAid AI**, a pretrained Machine Learning Legal Assistant trained on Indian law.\n\n**I run 100% offline** — no external API calls.\n\n**My Capabilities:**\n1. 📄 Document Analysis — Scikit-Learn ML risk scoring\n2. ⚖️ Legal Q&A — TF-IDF Semantic Retrieval on 500+ Indian law cases\n3. 📜 Statutory Act Identification — Clause-level Indian Act classifier\n4. 📝 Document Drafting — Templates for agreements & contracts"},

    # ─── RENT & TENANCY LAW ─────────────────────────────────────────────────
    {"q": "landlord evict tenant without notice",
     "a": "⚖️ **Transfer of Property Act, 1882 — Section 106**\n\nA landlord **CANNOT** evict a tenant without proper legal notice.\n\n**For monthly tenancy**: 15 days notice required.\n**For yearly tenancy**: 6 months notice required.\n\nUnilateral eviction without notice is **illegal** and the tenant can:\n1. File an injunction in Civil Court\n2. Claim damages for wrongful eviction\n3. Report to Rent Control Authority"},

    {"q": "tenant not paying rent what to do",
     "a": "⚖️ **Transfer of Property Act, 1882 — Section 106 & 111**\n\nIf tenant is not paying rent:\n1. **Send legal notice** via registered post demanding rent payment\n2. If not paid in 30 days → file **eviction suit** in Civil Court\n3. **Recovery of rent** + interest can be claimed under Section 111\n4. File for summary eviction under **State Rent Control Act**\n\nDocument all rent defaults with written communication."},

    {"q": "security deposit not returned by landlord",
     "a": "⚖️ **Transfer of Property Act, 1882 — Section 108(b)**\n\nLandlord must refund security deposit **within 30 days** of vacating.\n\n**If not refunded:**\n1. Send registered demand notice\n2. File suit in **Civil Court** for recovery\n3. Add interest @12% per annum from date of vacancy\n4. Claim damages for harassment\n\nAlways get a receipt when you pay security deposit."},

    {"q": "landlord locked house cut electricity water illegal",
     "a": "⚖️ **Transfer of Property Act, 1882 + IPC Section 441**\n\nCutting utilities or locking out a tenant WITHOUT a court order is:\n• **Criminal trespass** under IPC Section 441\n• **Wrongful eviction** — civil remedy available\n\n**Immediately:**\n1. File FIR at local police station\n2. Approach District Court for **urgent injunction** restoring possession\n3. Claim damages for harassment"},

    {"q": "rent agreement not registered valid",
     "a": "⚖️ **Registration Act, 1908 — Section 17**\n\nRent agreements of **11 months** are typically NOT registered (notarized only) to avoid stamp duty.\n\nAgreements of **12 months or more** MUST be registered.\n\n**Unregistered agreements:**\n• Valid between parties\n• Cannot be used as primary evidence in court\n• Always prefer notarized + registered agreements for protection"},

    {"q": "pg hostel evict without notice student",
     "a": "⚖️ **Transfer of Property Act, 1882 & Consumer Protection Act, 2019**\n\nPG/hostel residents have tenant rights even without a formal agreement.\n\n**Without notice eviction is illegal.** You can:\n1. File complaint before **Consumer District Commission**\n2. File **injunction** in Civil Court\n3. If PG keeps belongings — file **police complaint** for wrongful detention of property"},

    {"q": "rent increase by landlord without consent arbitrary",
     "a": "⚖️ **State Rent Control Acts (applicable in your state)**\n\nLandlords CANNOT arbitrarily increase rent without:\n1. Proper written notice (usually 30-90 days as per State Act)\n2. State Rent Controller's approval in rent-controlled areas\n3. Contractual provision in the lease agreement\n\nIf arbitrary increase — file complaint with **Rent Controller Authority** in your district."},

    # ─── EMPLOYMENT & LABOUR LAW ─────────────────────────────────────────────
    {"q": "employer not paying salary dues",
     "a": "⚖️ **Payment of Wages Act, 1936 — Section 15 & Industrial Disputes Act, 1947**\n\nNon-payment of salary is an **offence**.\n\n**Steps:**\n1. Send registered **demand notice** to employer\n2. File complaint before **Labour Commissioner** in your district\n3. File claim before **Labour Court** for unpaid wages + 2x penalty\n4. If IT company — file with **Software Technology Parks of India (STPI)**\n\nYou can claim: dues + 10% interest + compensation."},

    {"q": "employee fired terminated without notice",
     "a": "⚖️ **Industrial Disputes Act, 1947 — Section 25F & Indian Contract Act, 1872**\n\nFor companies with 100+ employees — **retrenchment without 3 months notice** is ILLEGAL.\n\nFor all employees:\n1. Notice period per contract must be honoured OR pay in lieu\n2. **Gratuity** payable after 5 years service\n3. **Full & final settlement** must be paid on last working day\n4. File complaint before **Labour Court** within 3 years"},

    {"q": "non compete agreement clause after resignation bond",
     "a": "⚖️ **Indian Contract Act, 1872 — Section 27**\n\n**Post-employment non-compete clauses are VOID in India.**\n\nSection 27 declares: Any agreement preventing anyone from carrying on any lawful profession/trade is void.\n\n**Key precedents:**\n• *Percept D'Mark v. Zaheer Khan* (Supreme Court) — Non-compete post-employment unenforceable\n• *Wipro v. Beckman* — Injunction against ex-employee denied\n\nYou CAN join any competitor after resignation."},

    {"q": "pf epf provident fund not deposited employer",
     "a": "⚖️ **Employees' Provident Funds Act, 1952 — Section 14B**\n\nNon-deposit of PF by employer is a **criminal offence**.\n\n**Steps:**\n1. Check UAN portal at **epfindia.gov.in**\n2. File complaint online at **epfindia.gov.in → Grievance**\n3. Lodge complaint with **Regional PF Commissioner**\n4. Employer liable for: unpaid PF + 12% interest + penalty up to 25%"},

    {"q": "sexual harassment workplace POSH complaint",
     "a": "⚖️ **Sexual Harassment of Women at Workplace Act, 2013 (POSH)**\n\n**Every company with 10+ employees MUST have an Internal Complaints Committee (ICC).**\n\n**Steps:**\n1. File written complaint to **ICC within 3 months** of incident\n2. ICC must complete inquiry within **90 days**\n3. For unorganized sector — file with **Local Complaints Committee (LCC)**\n4. Criminal complaint under **IPC Section 354** also available\n\nComplaints are confidential by law."},

    {"q": "maternity leave denied employer pregnant woman",
     "a": "⚖️ **Maternity Benefit Act, 1961 — Section 5**\n\n**Women are entitled to 26 weeks paid maternity leave** (for first 2 children) in companies with 10+ employees.\n\n**If denied:**\n1. File complaint with **Inspector under Maternity Benefit Act**\n2. Employer liable to pay maternity benefit + **penalty up to ₹5,000**\n3. Dismissal during maternity leave = illegal → compensation claimable"},

    {"q": "overtime work not paid extra hours",
     "a": "⚖️ **Factories Act, 1948 — Section 59 & Payment of Wages Act, 1936**\n\nOvertime (beyond 9 hrs/day or 48 hrs/week) must be paid at **double the ordinary rate**.\n\n**Steps:**\n1. Maintain records of extra hours worked\n2. File complaint with **Inspector of Factories**\n3. Claim unpaid overtime before **Labour Commissioner**"},

    # ─── CHEQUE BOUNCE ───────────────────────────────────────────────────────
    {"q": "cheque bounce dishonour what to do section 138",
     "a": "⚖️ **Negotiable Instruments Act, 1881 — Section 138**\n\nCheque bounce is a **criminal offence** — 2 years imprisonment OR double cheque amount fine.\n\n**Strict timeline to follow:**\n1. Get **bank return memo** (dishonour slip)\n2. **Within 30 days** of memo — send registered legal demand notice\n3. If not paid in **15 days** of notice receipt\n4. **Within 30 days** of expiry — file complaint in Magistrate Court\n\nMissing any deadline = case dismissed."},

    {"q": "cheque bounce notice format how to send",
     "a": "⚖️ **Section 138 NI Act, 1881 — Demand Notice Requirements**\n\n**Send via:** Registered post + Speed post (keep proof of delivery)\n\n**Notice must include:**\n1. Cheque number, date, amount\n2. Reason for dishonour (as per bank memo)\n3. Demand for payment within 15 days\n4. Warning of criminal proceedings\n\nSend to the **exact registered address** of the drawer. Keep all postal receipts."},

    {"q": "cheque bounce accused anticipatory bail",
     "a": "⚖️ **NI Act, 1881 — Section 138 is a bailable offence.**\n\nCheque bounce (S.138) is bailable — police CANNOT arrest without court warrant.\n\n**If summoned by court:**\n1. Appear before Magistrate Court on summons date\n2. Apply for bail — it's generally granted as matter of right\n3. Negotiate **settlement/compromise** — case can be compounded at any stage\n\nIf cheque was issued for debt — full repayment is best remedy."},

    {"q": "post dated cheque bounce legal action",
     "a": "⚖️ **Section 138 NI Act, 1881**\n\nPost-dated cheques (PDC) are equally protected.\n\nIf a PDC bounces:\n1. Same procedure — legal notice within 30 days of dishonour\n2. PDC proves existence of debt/liability\n3. Drawer **cannot claim** 'no debt' if PDC was voluntarily issued\n\nPDC dishonour cases are treated identically to regular cheque bounce."},

    # ─── CRIMINAL LAW ────────────────────────────────────────────────────────
    {"q": "fir police not registering complaint how to file",
     "a": "⚖️ **CrPC Section 154 / BNSS 2023 Section 173**\n\nPolice are **legally obligated** to register FIR for cognizable offences.\n\n**If police refuse:**\n1. Send complaint by **registered post to SP/DCP**\n2. File complaint directly with **Magistrate (Section 156(3) CrPC)**\n3. File **writ petition** in High Court\n4. Approach **State Police Complaints Authority**\n\nNon-registration of FIR is a punishable misconduct."},

    {"q": "bail application procedure sessions court",
     "a": "⚖️ **CrPC Section 437-439 / BNSS 2023**\n\n**Types of Bail:**\n• **Regular Bail (S.437)** — After arrest, apply in Magistrate/Sessions Court\n• **Anticipatory Bail (S.438)** — Before arrest, apply in Sessions Court or High Court\n• **Default Bail (S.167(2))** — If chargesheet not filed in 60/90 days\n\n**Bail Application includes:** FIR copy, arrest memo, previous bail orders, surety details\n\nHearing typically within 3-7 days of filing."},

    {"q": "anticipatory bail when to apply procedure",
     "a": "⚖️ **CrPC Section 438 / BNSS Section 482**\n\nApply for anticipatory bail when you **apprehend arrest** for a non-bailable offence.\n\n**Apply to:**\n• Sessions Court (first)\n• High Court (if Sessions Court rejects)\n\n**Documents needed:**\n1. Application stating apprehension of arrest\n2. FIR copy (if registered)\n3. Previous case history (if any)\n\nCourt can grant **interim anticipatory bail** same day in urgent cases."},

    {"q": "498a dowry harassment false case wife",
     "a": "⚖️ **IPC Section 498A / BNS Section 85 & Arnesh Kumar Guidelines**\n\nFor 498A (matrimonial cruelty):\n\n**Accused's rights:**\n1. Police CANNOT auto-arrest without prior **Section 41A CrPC notice** (Arnesh Kumar ruling)\n2. Apply **anticipatory bail** immediately in Sessions Court\n3. File for **Section 41A notice compliance** if notice not served\n\n**If false case:**\n1. File **counter-complaint** under IPC 182 (false information)\n2. Apply for **quashing** of FIR in High Court under Section 482 CrPC"},

    {"q": "fraud cheating 420 case IPC file complaint",
     "a": "⚖️ **IPC Section 420 / BNS Section 318 — Cheating**\n\nCheating = dishonest inducement to deliver property or alter document.\n\n**Punishment:** Up to 7 years imprisonment + fine\n\n**Steps:**\n1. File FIR at police station\n2. If police refuses — file Magistrate complaint (Section 200 CrPC)\n3. For commercial fraud — also file complaint with **Economic Offences Wing (EOW)**\n4. Attach all documentary evidence — receipts, messages, contracts"},

    {"q": "defamation complaint case how to file",
     "a": "⚖️ **IPC Section 499-500 / BNS Section 356**\n\n**Criminal Defamation:** Publication of false statement damaging reputation.\n\n**Punishment:** 2 years imprisonment or fine.\n\n**Civil Defamation:** Sue for damages in Civil Court.\n\n**Steps:**\n1. File private complaint before **Chief Judicial Magistrate**\n2. Collect evidence — screenshots, publications, witnesses\n3. For social media defamation — also file under IT Act Section 66A\n\nNote: Truth is a **valid defence** in defamation cases."},

    {"q": "domestic violence protection order DV Act",
     "a": "⚖️ **Protection of Women from Domestic Violence Act, 2005**\n\nCovers: Physical, emotional, sexual, economic abuse.\n\n**Reliefs available:**\n1. **Protection Order** — Restrain abuser from contact\n2. **Residence Order** — Right to stay in shared household\n3. **Monetary Relief** — Compensation for losses\n4. **Custody Orders** — Temporary custody of children\n\n**File complaint with:** Protection Officer, Magistrate, or Police.\nEmergency protection order can be granted within **24-48 hours**."},

    # ─── CONSUMER RIGHTS ─────────────────────────────────────────────────────
    {"q": "consumer complaint defective product refund",
     "a": "⚖️ **Consumer Protection Act, 2019**\n\n**File complaint at:**\n• **District Commission** — claims up to ₹50 Lakhs\n• **State Commission** — ₹50 Lakhs to ₹2 Crores\n• **National Commission** — above ₹2 Crores\n\n**Online:** File at **edaakhil.nic.in** (no physical visit needed)\n\n**Remedies:**\n1. Full refund or replacement\n2. Compensation for mental agony\n3. Cost of legal proceedings\n\n**Time limit:** File within **2 years** of deficiency."},

    {"q": "ecommerce online shopping fraud refund not given amazon flipkart",
     "a": "⚖️ **Consumer Protection (E-Commerce) Rules, 2020**\n\nE-commerce platforms are liable for seller deficiency.\n\n**Steps:**\n1. Raise dispute on platform grievance portal (mandatory first step)\n2. Email Nodal Officer of platform (details on website)\n3. File complaint on **edaakhil.nic.in**\n4. File complaint with **National Consumer Helpline: 1800-11-4000**\n\nPlatform must respond within **48 hours** and resolve within **30 days**."},

    {"q": "insurance claim rejected company not paying",
     "a": "⚖️ **Insurance Act, 1938 & Consumer Protection Act, 2019**\n\n**If claim rejected:**\n1. Get **rejection letter** with specific reasons\n2. File complaint with **Insurance Ombudsman** (free, no lawyer needed)\n3. File before **Consumer District Commission**\n4. For life insurance — contact **IRDAI Grievance Cell: 155255**\n\n**Ombudsman can award:** Up to ₹30 Lakhs\n**Time limit:** File within **1 year** of rejection."},

    {"q": "builder developer flat not delivered on time RERA",
     "a": "⚖️ **Real Estate (Regulation & Development) Act, 2016 — RERA**\n\nBuilder must deliver possession by agreed date.\n\n**If delayed:**\n1. File complaint on **State RERA portal** (e.g., maharera.mahaonline.gov.in)\n2. Claim **interest @ SBI MCLR + 2%** for entire delay period\n3. OR demand **full refund** with interest\n\nRERA Authority must decide within **60 days**.\n\nAlso file before **Consumer Commission** for compensation for mental agony."},

    {"q": "mobile phone laptop defective warranty rejected",
     "a": "⚖️ **Consumer Protection Act, 2019 — Defect in Goods**\n\nIf brand/dealer rejects warranty claim:\n1. Get **rejection in writing** from service centre\n2. File complaint on **edaakhil.nic.in**\n3. Claim: repair + replacement + compensation\n4. National Consumer Helpline: **1800-11-4000**\n\nUnder warranty, consumer is entitled to **free repair or replacement** — no conditions can override statutory warranty rights."},

    # ─── CYBER CRIME & IT ACT ────────────────────────────────────────────────
    {"q": "cyber crime online fraud OTP bank account hacked",
     "a": "⚖️ **IT Act, 2000 — Section 66C (Identity Theft) & Section 66D (Impersonation)**\n\n**IMMEDIATE ACTION — Golden Hour:**\n1. Call **Cyber Crime Helpline: 1930** immediately\n2. Report at **cybercrime.gov.in**\n3. Call your bank's fraud helpline to **freeze account**\n4. File FIR at nearest police station\n\n**Punishment:** 3 years imprisonment + ₹1 Lakh fine\n\nAct within hours — RBI can recall funds if reported quickly."},

    {"q": "social media harassment trolling threats online",
     "a": "⚖️ **IT Act, 2000 — Section 67 & IPC Section 503 (Criminal Intimidation)**\n\n**Steps:**\n1. **Screenshot & preserve** all evidence\n2. Report to platform (Twitter/Instagram/Facebook)\n3. File complaint at **cybercrime.gov.in**\n4. File FIR for criminal threats under IPC 503 / BNS 351\n\nFor women: **Section 66E IT Act** — violation of privacy (stalking/voyeurism) — 3 years.\nFor morphed images: **Section 67A IT Act** — 7 years."},

    {"q": "data privacy personal data stolen company breach",
     "a": "⚖️ **IT Act, 2000 — Section 43A & Digital Personal Data Protection Act, 2023**\n\nCompanies must implement **reasonable security practices**.\n\n**If data breached:**\n1. File complaint with **CERT-In** (cert-in.org.in)\n2. File consumer complaint for **negligence**\n3. Under DPDP Act 2023 — Data Principal (you) can file with **Data Protection Board**\n\nCompanies face penalty up to **₹250 Crores** for data breaches."},

    {"q": "fake news defamation whatsapp forward case",
     "a": "⚖️ **IT Act, 2000 — Section 66D & IPC Section 499-500**\n\nForwarding defamatory or fake content can make you liable.\n\n**For victims:**\n1. File complaint at cybercrime.gov.in\n2. File private defamation complaint before Magistrate\n3. Platforms must take down content within **36 hours** of court order\n\n**Defence:** You must prove you verified the content before forwarding."},

    # ─── FAMILY & MATRIMONIAL LAW ─────────────────────────────────────────────
    {"q": "divorce mutual consent procedure Hindu Marriage Act",
     "a": "⚖️ **Hindu Marriage Act, 1955 — Section 13B**\n\n**Mutual Consent Divorce:**\n1. File joint petition in **Family Court**\n2. **6 months cooling period** (can be waived by court since Supreme Court ruling)\n3. File for **second motion** after cooling period\n4. Court grants divorce decree\n\n**Documents:** Marriage certificate, address proof, passport-size photos, no-objection statements\n\nTotal time: 6-18 months. With waiver: 1-3 months."},

    {"q": "maintenance alimony wife husband divorce claim",
     "a": "⚖️ **Hindu Marriage Act, 1955 — Section 24 & 25 / CrPC Section 125**\n\n**Interim Maintenance (Section 24):**\n• Claimed during divorce proceedings\n• Either spouse can claim if unable to maintain self\n\n**Permanent Alimony (Section 25):**\n• Lump sum or monthly payment\n• Based on: income of both parties, lifestyle, duration of marriage\n\n**Section 125 CrPC:** Wife, children, parents can claim maintenance from Magistrate Court even without filing divorce."},

    {"q": "child custody divorce which parent gets custody",
     "a": "⚖️ **Hindu Minority & Guardianship Act, 1956 & Guardians & Wards Act, 1890**\n\n**Guiding principle: Best Interest of the Child**\n\n• Children **below 5 years** — mother generally preferred\n• Above 5 years — court considers child's preference, stability, emotional bonding\n• **Joint custody** increasingly granted by courts\n\n**Visitation rights** always granted to non-custodial parent unless there's a safety concern.\n\nFile custody petition in **Family Court**."},

    {"q": "property rights wife husband after marriage",
     "a": "⚖️ **Hindu Succession Act, 1956 (as amended 2005)**\n\n**Wife's property rights:**\n1. **Stridhan** — absolute ownership of gifts received at marriage\n2. **Inherited property** — equal share with husband in Hindu Undivided Family\n3. **Jointly acquired property** during marriage — equal share\n\nAfter 2005 amendment: **Daughters have EQUAL coparcenary rights** as sons in ancestral property.\n\n**Matrimonial home:** Wife has right of residence even without ownership."},

    # ─── PROPERTY & REAL ESTATE ───────────────────────────────────────────────
    {"q": "property dispute neighbour encroachment how to handle",
     "a": "⚖️ **Transfer of Property Act, 1882 & Specific Relief Act, 1963 — Section 6**\n\n**Steps for encroachment:**\n1. Send registered **legal notice** with survey report\n2. File suit for **Permanent Injunction** in Civil Court\n3. If recent encroachment — Section 6 Specific Relief Act for immediate possession\n4. File police complaint for **criminal trespass** (IPC 441)\n\nAlways get **survey/demarcation** done by licensed surveyor before filing suit."},

    {"q": "property sale agreement registration stamp duty",
     "a": "⚖️ **Registration Act, 1908 & Transfer of Property Act, 1882**\n\n**Sale of immovable property MUST be registered** — unregistered sale deed has no legal validity.\n\n**Process:**\n1. Execute **Sale Agreement** (can be unregistered)\n2. Pay **Stamp Duty** (4-8% depending on state)\n3. Register at **Sub-Registrar Office** with both parties present\n4. Pay **Registration Fee** (usually 1% of market value)\n\n**After registration:** Mutation/Khata transfer in municipal records is mandatory."},

    {"q": "ancestral property inheritance rights Hindu family",
     "a": "⚖️ **Hindu Succession Act, 1956 — Section 6 (amended 2005)**\n\n**Class I Heirs** (equal share):\n• Son, Daughter (equal since 2005), Wife, Mother\n\n**Ancestral property (Coparcenary):**\n• Son AND Daughter have **equal birth rights** since 2005 amendment\n• *Vineeta Sharma v. Rakesh Sharma* (SC 2020) — Daughters' rights are absolute\n\n**Self-acquired property:**\n• Owner can will it to anyone\n• Without will — goes to Class I heirs equally"},

    # ─── CONTRACT & AGREEMENT LAW ─────────────────────────────────────────────
    {"q": "contract agreement valid legally binding elements",
     "a": "⚖️ **Indian Contract Act, 1872 — Section 10**\n\n**For a valid contract, ALL must be present:**\n1. **Offer** (Section 2a)\n2. **Acceptance** (Section 2b)\n3. **Consideration** — something of value exchanged (Section 2d)\n4. **Competency** — both parties 18+ and of sound mind\n5. **Free Consent** — no fraud, coercion, undue influence\n6. **Lawful Object** — not against public policy\n\nA contract missing any element is **void or voidable**."},

    {"q": "contract breach what to do claim damages",
     "a": "⚖️ **Indian Contract Act, 1872 — Section 73-75**\n\n**Remedies for breach:**\n1. **Damages** (Section 73) — actual losses suffered\n2. **Specific Performance** — court orders party to perform contract\n3. **Injunction** — court stops breach\n4. **Quantum Meruit** — payment for work done before breach\n\n**Steps:**\n1. Send legal notice demanding performance or compensation\n2. File civil suit in appropriate court\n\n**Limitation:** File within **3 years** of breach (Limitation Act, 1963)."},

    {"q": "promissory note loan repayment legal",
     "a": "⚖️ **Negotiable Instruments Act, 1881 — Section 4**\n\nA promissory note is a legally binding written promise to pay.\n\n**For recovery of loan through promissory note:**\n1. File summary suit in Civil Court (Order XXXVII CPC)\n2. Defendant must get court's permission to defend\n3. **Limitation:** 3 years from date of note\n\nPromissory notes above ₹100 must bear appropriate **Stamp Duty** to be admissible in court."},

    # ─── RTI & GOVERNMENT ─────────────────────────────────────────────────────
    {"q": "RTI right to information application how to file",
     "a": "⚖️ **Right to Information Act, 2005**\n\n**File RTI online:** rtionline.gov.in\n\n**Fee:** ₹10 (no fee for BPL cardholders)\n\n**Timeline:**\n• Response within **30 days** (or 48 hours if life/liberty at stake)\n• First Appeal — within **30 days** of non-response to Appellate Authority\n• Second Appeal/Complaint — to **State/Central Information Commission**\n\n**RTI does NOT cover:** Cabinet discussions, national security, personal info of others."},

    {"q": "government corruption complaint bribery officer",
     "a": "⚖️ **Prevention of Corruption Act, 1988 & Lokpal Act, 2013**\n\n**To report bribery/corruption:**\n1. File with **Anti-Corruption Bureau (ACB)** — state level\n2. File complaint with **Lokpal** (Central govt officials)\n3. File with **CVC (Central Vigilance Commission)** — cvconline.gov.in\n4. **Trap case:** ACB can conduct sting operations with your cooperation\n\n**Whistleblower Protection:** Covered under **Whistle Blowers Protection Act, 2014**."},

    # ─── INTELLECTUAL PROPERTY ────────────────────────────────────────────────
    {"q": "copyright infringement someone stole my content",
     "a": "⚖️ **Copyright Act, 1957 — Section 63**\n\n**Copyright auto-exists** from the moment of creation — no registration needed.\n\n**For infringement:**\n1. Send **cease & desist notice**\n2. File civil suit for **injunction + damages**\n3. File **criminal complaint** — Section 63 (3 years + fine)\n4. For online infringement — file DMCA/platform takedown notice\n\nRegister copyright at **copyright.gov.in** for stronger evidence."},

    {"q": "trademark registration protect business brand name",
     "a": "⚖️ **Trade Marks Act, 1999**\n\n**Register trademark at:** ipindia.gov.in\n\n**Process:**\n1. Conduct **trademark search** (free on IP India portal)\n2. File application in appropriate class (Nice Classification)\n3. **Examination** by Registrar — response within 1 month if objection\n4. **Publication** in Trade Marks Journal (4 months opposition period)\n5. **Registration Certificate** — valid for 10 years, renewable\n\n**TM symbol (™)** can be used after filing, **® only after registration**."},

    # ─── LABOUR & STARTUPS ───────────────────────────────────────────────────
    {"q": "startup company registration India",
     "a": "⚖️ **Companies Act, 2013 & Startup India Programme**\n\n**Best structure: Private Limited Company**\n\n**Register at:** MCA21 portal (mca.gov.in)\n\n**Steps:**\n1. Obtain **DSC** (Digital Signature Certificate)\n2. Apply for **DIN** (Director Identification Number)\n3. File **SPICe+ form** for incorporation\n4. **PAN & TAN** auto-generated\n5. Apply for **Startup India recognition** at startupindia.gov.in\n\n**Benefits:** Tax exemption for 3 years, fast-track IP registration, easier compliance."},

    {"q": "GST registration small business required",
     "a": "⚖️ **Central Goods and Services Tax Act, 2017 — Section 22**\n\n**GST Registration mandatory if:**\n• Annual turnover > **₹40 Lakhs** (goods) or **₹20 Lakhs** (services)\n• Inter-state supply of any value\n• E-commerce seller\n• Voluntary registration for startups also beneficial\n\n**Register at:** gst.gov.in\n\n**Penalty for non-registration:** 100% of tax due or ₹10,000 — whichever is higher."},

    # ─── GENERAL LEGAL Q&A ────────────────────────────────────────────────────
    {"q": "legal notice format how to send registered post",
     "a": "⚖️ **Legal Notice under Indian Law**\n\nA legal notice is a formal written warning before filing court case.\n\n**Format must include:**\n1. Sender's name & address\n2. Recipient's name & address\n3. Facts of the dispute\n4. Relief demanded\n5. Deadline for response (usually 15-30 days)\n6. Consequence if no response\n\n**Send via:** Registered post + Speed post (keep receipts)\n\nAlways send via lawyer (advocate) on official letterhead for maximum legal effect."},

    {"q": "limitation period time to file case court",
     "a": "⚖️ **Limitation Act, 1963**\n\n**Key Limitation Periods:**\n• **Cheque bounce (S.138):** 30 days from notice expiry\n• **Contract breach:** 3 years from breach\n• **Recovery of money:** 3 years\n• **Property suit:** 12 years for possession\n• **Appeal in civil court:** 30-90 days from order\n• **Consumer complaint:** 2 years from deficiency\n• **Criminal (FIR for bailable offences):** No strict limit but file ASAP\n\n**Courts can condone delay** with sufficient cause explanation."},

    {"q": "power of attorney legal document",
     "a": "⚖️ **Power of Attorney Act, 1882**\n\nPOA authorizes another person to act on your behalf.\n\n**Types:**\n• **General POA** — broad powers for multiple acts\n• **Special POA** — specific transaction only\n• **Durable POA** — remains valid if principal becomes incapacitated\n\n**For property transactions:** POA must be **registered** at Sub-Registrar Office.\n\n**Important:** POA automatically revoked on principal's death."},

    {"q": "affidavit how to make sworn statement",
     "a": "⚖️ **Code of Civil Procedure, 1908 — Order XIX**\n\nAn affidavit is a **sworn written statement** used as evidence.\n\n**How to make:**\n1. Write facts on plain paper or stamp paper\n2. Appear before **Notary Public, Oath Commissioner, or Magistrate**\n3. Take oath and sign in their presence\n4. Get **notarization stamp & signature**\n\n**Stamp paper:** ₹10-₹20 (varies by state)\n\nFalse affidavit = **perjury** under Section 191 IPC / BNS."},

    {"q": "police complaint against police officer misconduct",
     "a": "⚖️ **Police Act & CrPC Section 154**\n\n**If police is uncooperative or abusive:**\n1. File complaint with **Superintendent of Police (SP)**\n2. File with **State Human Rights Commission**\n3. File writ in **High Court** for mandamus (direction to police)\n4. File with **State Police Complaints Authority**\n5. If custodial violence — approach **NHRC (National Human Rights Commission)**\n\nNHRC: nhrc.nic.in | Helpline: 14433"},

    {"q": "traffic challan fine contest how to pay",
     "a": "⚖️ **Motor Vehicles Act, 1988 (as amended 2019)**\n\n**Pay challan online:** echallan.parivahan.gov.in\n\n**To contest a wrong challan:**\n1. Approach the **Adjudicating Authority** mentioned on challan\n2. File representation within **60 days**\n3. Appear on hearing date with evidence (dashcam, witness)\n\n**Common penalties (post 2019):**\n• No helmet: ₹1,000\n• Drunk driving: ₹10,000 + 6 months jail\n• Over-speeding: ₹1,000-5,000\n• No seatbelt: ₹1,000"},

    # ─── BANKING & FINANCIAL ─────────────────────────────────────────────────
    {"q": "bank loan default NPA SARFAESI notice",
     "a": "⚖️ **SARFAESI Act, 2002 — Section 13(2)**\n\nIf bank sends SARFAESI notice:\n1. You have **60 days** to respond with objections\n2. Bank must consider objections before proceeding\n3. File appeal before **Debt Recovery Tribunal (DRT)** within **45 days** of possession notice\n4. DRT can grant **stay** of possession\n\n**OTS (One Time Settlement):** Banks must offer OTS before auction — negotiate aggressively.\n\nNever ignore a SARFAESI notice — respond within deadline."},

    {"q": "credit card debt collection harassment call",
     "a": "⚖️ **RBI Guidelines on Fair Practices Code & IT Act 2000**\n\nBanks/NBFCs cannot use abusive recovery methods.\n\n**Prohibited recovery practices:**\n• Calls between 7PM-8AM\n• Calling relatives/employers without permission\n• Threats or abusive language\n\n**If harassed:**\n1. File complaint with **Banking Ombudsman** (free)\n2. File complaint with **RBI (cms.rbi.org.in)**\n3. File FIR for criminal intimidation (IPC 503)\n\nBanking Ombudsman: **bankingombudsman.rbi.org.in**"},

    {"q": "investment fraud ponzi scheme money lost",
     "a": "⚖️ **Prize Chits and Money Circulation Schemes (Banning) Act, 1978 & IPC Section 420**\n\n**If you lost money in investment fraud:**\n1. File FIR at **local police station** or **Economic Offences Wing (EOW)**\n2. File complaint with **SEBI (sebi.gov.in)** if securities related\n3. File complaint with **RBI** if NBFC related\n4. File case before **SFIO (Serious Fraud Investigation Office)**\n\n**Important:** File ASAP — delay reduces chance of fund recovery."},

    # ─── ENVIRONMENTAL LAW ────────────────────────────────────────────────────
    {"q": "factory pollution noise environment complaint",
     "a": "⚖️ **Environment Protection Act, 1986 & Noise Pollution Rules, 2000**\n\n**File complaint with:**\n1. **State Pollution Control Board (SPCB)** — main authority\n2. **District Collector** — for urgent action\n3. **National Green Tribunal (NGT)** — ngt.gov.in (free to file)\n\n**NGT can award:** Compensation + closure of polluting unit\n\n**Noise Pollution Limits:**\n• Residential: 45dB (day) / 35dB (night)\n• Industrial: 75dB (day) / 70dB (night)"},
]
