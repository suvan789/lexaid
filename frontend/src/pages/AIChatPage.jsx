import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axios';

// ─── Comprehensive Offline Legal AI Engine ───────────────────────────────────
function getOfflineLegalReply(q) {
  const lq = q.toLowerCase().trim();

  // ── Greetings & Casual Conversation ──
  if (/^(hi|hello|hey|hii|hiii|helo|helo|howdy|yo|sup|what'?s up|namaste|namaskar|vanakkam|salaam|greetings?)[\s!?.]*$/.test(lq)) {
    return `Hello! 👋 I'm **LexAid AI**, your Indian Legal Assistant.\n\nHow can I help you today? You can ask me about:\n• 🏠 Rent disputes & tenant rights\n• ⚖️ Criminal law (FIR, bail, cheque bounce)\n• 👨‍👩‍👧 Family law (divorce, maintenance, custody)\n• 💼 Labour & employment issues\n• 🛒 Consumer complaints\n• 🏘️ Property & RERA disputes\n• 💻 Cyber crime & online fraud\n• 📋 RTI, tax, insurance and more\n\nJust describe your legal problem and I'll guide you!`;
  }

  if (/^(how are you|how r u|how are u|how do you do|what are you|who are you|are you a bot|are you ai|what can you do|what is lexaid|tell me about yourself)[\s!?.]*$/.test(lq)) {
    return `I'm **LexAid AI** — an AI-powered legal assistant specialized in **Indian law**. 🤖⚖️\n\nI can help you understand:\n• Laws, Acts & Sections relevant to your situation\n• Your legal rights and remedies\n• Step-by-step guidance on filing complaints\n• What to do in legal emergencies\n\nI'm available 24/7, completely free. Just type your legal question and I'll guide you with the relevant Indian laws and Acts.\n\nWhat legal issue can I help you with today?`;
  }

  if (/^(thank you|thanks|thank u|thnx|thx|ty|great|ok|okay|good|nice|perfect|got it|understood|noted|sure|alright|fine)[\s!?.]*$/.test(lq)) {
    return `You're welcome! 😊\n\nIf you have any other legal questions — whether about property, criminal law, family disputes, employment, or consumer rights — feel free to ask anytime.\n\n*Remember: For filing cases or official legal proceedings, always consult a registered advocate.*`;
  }

  if (/^(bye|goodbye|good bye|see you|see ya|take care|talk later|ttyl|cya)[\s!?.]*$/.test(lq)) {
    return `Goodbye! 👋 Stay safe and informed about your legal rights.\n\nIf you ever face a legal issue, LexAid AI is here 24/7 to guide you. Take care! ⚖️`;
  }

  if (lq.includes('help') && lq.split(' ').length <= 3) {
    return `Sure, I'm here to help! 🙏\n\nPlease describe your legal problem in detail. For example:\n• *"My landlord is not returning my security deposit"*\n• *"My employer fired me without notice"*\n• *"Cheque given to me has bounced"*\n• *"I want to file a consumer complaint"*\n• *"My neighbour encroached on my land"*\n\nThe more details you give, the better I can guide you with the specific law and steps!`;
  }

  if (lq.includes('good morning') || lq.includes('good afternoon') || lq.includes('good evening') || lq.includes('good night')) {
    const greet = lq.includes('morning') ? 'Good morning' : lq.includes('afternoon') ? 'Good afternoon' : lq.includes('evening') ? 'Good evening' : 'Good night';
    return `${greet}! ☀️ I'm **LexAid AI**, ready to assist with any Indian legal question.\n\nWhat legal matter can I help you with today?`;
  }



  // ── Section 106 / Rent / Tenancy ──
  if (lq.includes('106') || (lq.includes('rent') && lq.includes('notice')) || lq.includes('eviction') || lq.includes('tenancy') || lq.includes('landlord') || lq.includes('tenant')) {
    return `⚖️ **Section 106, Transfer of Property Act 1882 — Tenant Rights**

**Mandatory Notice Period:**
• Month-to-month tenancy → **15 days** written notice required
• Agricultural/manufacturing lease → **6 months** notice required
• Notice must be registered and sent via Registered Post

**Tenant Protections:**
• Landlord CANNOT forcefully evict without court order
• Lock-change without notice = illegal criminal trespass (IPC/BNS)
• Security deposit must be returned within 30 days of vacating

**Legal Remedies:**
• File complaint under Rent Control Act in your city
• Seek stay order from Civil Court against illegal eviction
• Section 441 BNS 2023 — Criminal trespass by landlord is punishable

*Consult a registered advocate for case-specific advice.*`;
  }

  // ── Contract / NDA / Non-compete ──
  if (lq.includes('contract') || lq.includes('nda') || lq.includes('non-compete') || lq.includes('agreement') || lq.includes('breach') || lq.includes('section 27') || lq.includes('section 74')) {
    return `⚖️ **Indian Contract Act 1872 — Key Provisions**

**Section 27 — Restraint of Trade:**
• Any agreement restricting lawful profession/trade is **VOID**
• Post-employment non-compete clauses are **NOT enforceable** in India
• Exception: Sale of goodwill restraints may be valid

**Section 74 — Penalty/Liquidated Damages:**
• Courts can reduce arbitrary penalty clauses to actual reasonable loss
• Party in breach liable only for actual damages proven

**Section 23 — Unlawful Agreements:**
• Agreements against public policy, fraud, or illegal consideration are void

**Breach of Contract Remedies:**
• Specific Performance (Section 10, Specific Relief Act 1963)
• Injunction to prevent breach
• Damages for financial loss

*File a civil suit within 3 years of breach (Limitation Act 1963).*`;
  }

  // ── IPC / BNS / Criminal Law ──
  if (lq.includes('bns') || lq.includes('ipc') || lq.includes('fir') || lq.includes('criminal') || lq.includes('arrest') || lq.includes('bail') || lq.includes('murder') || lq.includes('theft') || lq.includes('fraud') || lq.includes('cheating')) {
    return `⚖️ **Bharatiya Nyaya Sanhita (BNS) 2023 — Criminal Law**

**BNS 2023 replaces Indian Penal Code 1860:**
• **Section 103 BNS** (Murder) → Life imprisonment or death penalty
• **Section 303 BNS** (Theft) → Up to 3 years imprisonment + fine
• **Section 316 BNS** (Cheating) → Up to 7 years + fine
• **Section 318 BNS** (Fraud) → 7 years imprisonment

**FIR & Arrest Rights:**
• Zero FIR: File FIR at ANY police station regardless of jurisdiction
• Must be produced before Magistrate within **24 hours** of arrest
• Right to inform family of arrest (Section 50 BNSS)
• Right to free legal aid (Article 39A, Constitution)

**Bail Rights:**
• Bailable offences → bail as a right from police station
• Non-bailable → only Court can grant bail
• Anticipatory bail under Section 482 BNSS

*For immediate legal help, contact State Legal Services Authority (free legal aid).*`;
  }

  // ── Cheque Bounce / NI Act ──
  if (lq.includes('cheque') || lq.includes('check bounce') || lq.includes('138') || lq.includes('dishonour') || lq.includes('ni act')) {
    return `⚖️ **Section 138, Negotiable Instruments Act 1881 — Cheque Bounce**

**Legal Process:**
1. Cheque bounces → Bank returns with memo
2. Send **legal demand notice** within 30 days of receiving memo
3. Drawer must pay within **15 days** of receiving notice
4. If no payment → file complaint within **30 days** thereafter

**Punishment:**
• Up to **2 years** imprisonment OR
• Fine up to **twice** the cheque amount, OR both

**Important Points:**
• Complaint must be filed in court where cheque was presented
• Digital/online cheques are equally covered
• Company directors can be held personally liable

**Recovery Tips:**
• File under Section 138 NI Act + Section 420 IPC for fraud
• Attach property of the accused during trial (interim injunction)

*Limitation: 1 month from the date cheque was dishonoured to send notice.*`;
  }

  // ── Consumer Rights ──
  if (lq.includes('consumer') || lq.includes('defective') || lq.includes('complaint forum') || lq.includes('refund') || lq.includes('deficiency in service')) {
    return `⚖️ **Consumer Protection Act 2019 — Your Rights**

**Three-Tier Consumer Commission System:**
• **District Commission** → Claims up to ₹50 Lakhs
• **State Commission** → Claims ₹50 Lakh to ₹2 Crore
• **National Commission (NCDRC)** → Claims above ₹2 Crore

**Your Consumer Rights:**
• Right to Safety, Information, Choice, Redressal
• Right against unfair trade practices
• Right to file complaint within **2 years** of cause of action

**Online Complaint:**
• File at: consumerhelpline.gov.in or edaakhil.nic.in
• No court fee for claims up to ₹5 Lakhs
• No lawyer required for District Commission

**Common Cases:**
• Defective products, Poor service, E-commerce fraud
• Insurance claim rejection, Builder delays (RERA)
• Medical negligence, Bank complaints

*You can also file under RERA for real estate disputes.*`;
  }

  // ── Labour Law / Employment ──
  if (lq.includes('labour') || lq.includes('employee') || lq.includes('termination') || lq.includes('pf') || lq.includes('esi') || lq.includes('gratuity') || lq.includes('notice period') || lq.includes('salary') || lq.includes('wrongful')) {
    return `⚖️ **Indian Labour Laws — Employee Rights**

**Key Statutes:**
• **Industrial Disputes Act 1947** — Wrongful termination, retrenchment
• **Payment of Gratuity Act 1972** — 5+ years service = gratuity entitlement
• **EPF & MP Act 1952** — PF contributions mandatory for eligible establishments
• **Minimum Wages Act 1948** — State-wise minimum wage enforcement
• **POSH Act 2013** — Sexual harassment at workplace

**Wrongful Termination:**
• Must follow prescribed notice period or pay in lieu
• No termination without conducting a domestic inquiry
• Entitled to full & final settlement, PF withdrawal, gratuity (if 5+ years)

**Unpaid Salary / PF Issues:**
• File complaint with Labour Commissioner of your state
• PF grievance at epfigms.labour.gov.in
• ESI grievance at esic.in

**Notice Period:**
• As per contract or 1 month (whichever is higher)
• Can be waived by paying notice pay

*Contact your State Labour Department for mediation and conciliation.*`;
  }

  // ── Property / Land / Real Estate ──
  if (lq.includes('property') || lq.includes('land') || lq.includes('sale deed') || lq.includes('registry') || lq.includes('mutation') || lq.includes('encumbrance') || lq.includes('rera') || lq.includes('builder')) {
    return `⚖️ **Property Law in India — Key Rights & Remedies**

**Property Registration (Registration Act 1908):**
• All property transactions above ₹100 must be registered
• Stamp duty: 5-7% of property value (varies by state)
• Registration fees: 1-2% of property value

**RERA — Real Estate (Regulation) Act 2016:**
• Builder must register project with state RERA authority
• Delayed possession → Refund + 10.85% interest OR compensation
• File complaint at RERA website of your state

**Title & Ownership:**
• Check Encumbrance Certificate (EC) for 13-30 years
• Verify Khata/Patta, Mutation records at local authority
• Get Legal Opinion from advocate before purchase

**Dispute Resolution:**
• Property disputes → Civil Court (Title suit, Partition)
• Illegal possession → Section 145 CrPC / BNSS injunction
• Boundary dispute → Revenue Court / Tehsildar

*Always get property documents verified by a property lawyer before purchase.*`;
  }

  // ── Family Law / Divorce / Marriage ──
  if (lq.includes('divorce') || lq.includes('marriage') || lq.includes('matrimonial') || lq.includes('alimony') || lq.includes('maintenance') || lq.includes('dowry') || lq.includes('child custody') || lq.includes('hindu marriage')) {
    return `⚖️ **Family Law in India — Marriage, Divorce & Maintenance**

**Divorce under Hindu Marriage Act 1955:**
• **Mutual Consent Divorce** → 6 months waiting period (Section 13B)
• **Contested Divorce** → Grounds: Cruelty, Adultery, Desertion (2+ years), Conversion, Unsound mind
• Can waive 6-month period in exceptional cases (Supreme Court ruling)

**Maintenance & Alimony:**
• Section 125 CrPC/BNSS — Maintenance for wife, children, parents
• Interim maintenance can be sought during pending proceedings
• Section 24 HMA — Maintenance pending suit

**Child Custody:**
• Best interest of the child is paramount consideration
• Mother gets custody for children below 5 years (presumption)
• Visitation rights for non-custodial parent

**Dowry / Domestic Violence:**
• Section 498A IPC/BNS — Cruelty by husband/family (cognizable, non-bailable)
• Domestic Violence Act 2005 — Protection orders, residence rights, compensation
• Dowry Prohibition Act 1961 — Giving/taking dowry is illegal

*File DV complaints at the nearest Magistrate Court. Legal aid available free.*`;
  }

  // ── Cyber Crime / Online Fraud ──
  if (lq.includes('cyber') || lq.includes('online fraud') || lq.includes('hacking') || lq.includes('it act') || lq.includes('digital') || lq.includes('social media') || lq.includes('defamation online') || lq.includes('upi fraud')) {
    return `⚖️ **IT Act 2000 & Cyber Laws in India**

**Cyber Crimes & Punishment:**
• **Section 66 IT Act** — Hacking/unauthorized access → 3 years + ₹5 Lakh fine
• **Section 66C** — Identity theft → 3 years + ₹1 Lakh fine
• **Section 66D** — Cheating by personation (phishing) → 3 years + ₹1 Lakh fine
• **Section 67** — Obscene content online → 3-5 years + fine
• **Section 43** — Unauthorized computer access → Compensation

**Online/UPI Fraud:**
• Report immediately at cybercrime.gov.in (National Cyber Crime Portal)
• Call **1930** (Cybercrime Helpline) within 24 hours to freeze fraudulent transactions
• File FIR at local police cyber crime cell

**Social Media Defamation:**
• Section 499/500 IPC — Defamation → 2 years imprisonment
• Can seek injunction from civil court to remove content
• Platform grievance officer must respond within 15 days (IT Rules 2021)

**Recovery:**
• Cyber crime victims can recover money if reported within golden hour (24-48 hours)

*Report all cyber crimes at cybercrime.gov.in or helpline 1930.*`;
  }

  // ── RTI / Government ──
  if (lq.includes('rti') || lq.includes('right to information') || lq.includes('government information') || lq.includes('pio')) {
    return `⚖️ **Right to Information Act 2005 — RTI**

**What You Can Ask:**
• Any information held by public authorities (Central & State Govt)
• Documents, files, records, contracts, policies
• NOT applicable to personal information, security/intelligence matters

**How to File RTI:**
• Online: rtionline.gov.in (Central Govt)
• Offline: Write application to Public Information Officer (PIO) with ₹10 fee
• Response within **30 days** (48 hours for life/liberty matters)

**Appeals:**
• 1st Appeal → First Appellate Authority (within 30 days of rejection)
• 2nd Appeal → Central/State Information Commission (within 90 days)
• Penalty: ₹250/day (up to ₹25,000) for delayed/false information

**Exemptions:**
• Cabinet notes, security/intelligence, personal private information
• Information that may harm third party privacy

*RTI is a powerful tool — use it to expose corruption and get government accountability.*`;
  }

  // ── Domestic Violence ──
  if (lq.includes('domestic violence') || lq.includes('498') || lq.includes('cruelty') || lq.includes('abuse') || lq.includes('dv act')) {
    return `⚖️ **Protection of Women from Domestic Violence Act 2005**

**Who is Protected:**
• Wife, live-in partner, mother, sister, daughter in shared household

**Types of Abuse Covered:**
• Physical, sexual, emotional, verbal, economic abuse
• Dowry harassment, threats, isolation

**Reliefs Available:**
• **Protection Order** — Restraining the abuser
• **Residence Order** — Right to stay in shared household
• **Monetary Relief** — Maintenance, medical expenses, compensation
• **Custody Order** — Temporary custody of children

**How to File:**
• Approach Protection Officer (available at Women & Child Dept)
• File before Magistrate Court directly
• Police complaint under Section 498A IPC/BNS (cognizable, non-bailable)

**Emergency Help:**
• Women Helpline: **1091** (24/7)
• National Commission for Women: 7827170170
• iCall: 9152987821

*First information report (FIR) can be filed at any police station under Zero FIR.*`;
  }

  // ── GST / Tax ──
  if (lq.includes('gst') || lq.includes('tax') || lq.includes('income tax') || lq.includes('tds') || lq.includes('itr') || lq.includes('refund tax')) {
    return `⚖️ **Taxation Laws in India — GST & Income Tax**

**GST (Goods & Services Tax):**
• Applicable on supply of goods/services above ₹40 Lakh turnover
• Rates: 0%, 5%, 12%, 18%, 28%
• File returns: GSTR-1 (monthly), GSTR-3B (monthly), GSTR-9 (annual)
• GST disputes → GST Appellate Authority → GSTAT → High Court

**Income Tax:**
• New Tax Regime (default): Slab rates from 5% to 30%
• File ITR by July 31 each year
• TDS refund: Claim in ITR filing

**Tax Evasion:**
• Section 276C Income Tax Act → Imprisonment 6 months to 7 years
• Penalty up to 300% of tax evaded

**Disputes & Notices:**
• Respond to income tax notices within stated deadline
• File objections before Commissioner of Income Tax (Appeals)
• Further appeal to Income Tax Appellate Tribunal (ITAT)

*For tax planning and dispute resolution, consult a Chartered Accountant or tax advocate.*`;
  }

  // ── Insurance ──
  if (lq.includes('insurance') || lq.includes('claim') || lq.includes('irda') || lq.includes('policy') || lq.includes('premium')) {
    return `⚖️ **Insurance Laws in India — Claim Disputes**

**Governing Law:**
• Insurance Act 1938 + IRDAI Regulations
• Insurance Ombudsman for disputes

**Claim Rejection — Your Rights:**
• Insurer must give written reasons for rejection
• File complaint with Insurance Ombudsman (free, no lawyer needed)
• File with IRDAI Grievance Cell: igms.irda.gov.in
• Further appeal to Consumer Commission or Civil Court

**Common Grounds for Dispute:**
• Non-disclosure of pre-existing conditions → check policy terms carefully
• Delay in claim settlement → 30 days after survey completion (IRDAI rule)
• Repudiation of health/life/motor claims

**Motor Insurance:**
• Third-party insurance mandatory under Motor Vehicles Act
• MACT (Motor Accident Claims Tribunal) for accident compensation

**Life Insurance:**
• 30-day free-look period to cancel policy
• Nomination is important — update it regularly

*File insurance grievances free at igms.irda.gov.in or call 155255.*`;
  }

  // ── Wills & Succession ──
  if (lq.includes('will') || lq.includes('succession') || lq.includes('inheritance') || lq.includes('nominee') || lq.includes('probate') || lq.includes('estate')) {
    return `⚖️ **Succession & Inheritance Laws in India**

**Hindu Succession Act 1956:**
• Sons and daughters have EQUAL inheritance rights (2005 amendment)
• Daughter is coparcener by birth in ancestral property
• Widow has absolute ownership of inherited property

**Making a Valid Will:**
• Must be in writing, signed by testator
• Witnessed by at least 2 independent witnesses
• Registered will is stronger but not mandatory
• Testator must be of sound mind (18+ years)

**Intestate Succession (No Will):**
• Class I heirs → Son, Daughter, Widow, Mother (get equal share)
• Class II heirs → Father, siblings (only if no Class I heirs)

**Probate:**
• Court certification of a will's validity
• Required for immovable property in certain states (Mumbai, Chennai, Kolkata)
• File petition in High Court/District Court

**Nomination:**
• Nominee is a trustee, not automatic legal heir
• Nominee must distribute to legal heirs (except in bank/insurance)

*Draft a will with a lawyer and register it at Sub-Registrar's office.*`;
  }

  // ── Passport / Visa ──
  if (lq.includes('passport') || lq.includes('visa') || lq.includes('immigration') || lq.includes('citizenship') || lq.includes('pcc')) {
    return `⚖️ **Passport & Immigration Laws in India**

**Passport Act 1967:**
• Passport can be impounded for criminal cases/national security
• Minors need consent of both parents for passport
• Normal passport: 30 working days; Tatkal: 7 working days

**Police Clearance Certificate (PCC):**
• Required for immigration/visa in many countries
• Apply at Passport Seva Kendra (PSK) or online
• Local police verification required

**Visa Issues:**
• Overstay → Deportation + ban on future entry
• Visa violations → Report to FRRO (Foreigners Regional Registration Office)

**Citizenship:**
• By birth (if parent is Indian citizen)
• By registration/naturalization (11 years residency)
• OCI Card — lifelong visa for foreign citizens of Indian origin

**Immigration Detention:**
• Must be produced before Magistrate
• Right to contact Embassy/Consulate
• Legal aid available

*Contact nearest Passport Seva Kendra or passportindia.gov.in for applications.*`;
  }

  // ── Default comprehensive response ──
  return `⚖️ **LexAid AI — Legal Analysis: "${q}"**

**General Legal Framework (Indian Law):**

I can help you with information on these major areas of Indian law:

📋 **Civil Law:**
• Property disputes (Transfer of Property Act 1882)
• Contract disputes (Indian Contract Act 1872)
• Consumer complaints (Consumer Protection Act 2019)
• Family law — Divorce, Maintenance, Custody

⚖️ **Criminal Law:**
• Bharatiya Nyaya Sanhita (BNS) 2023 (replaces IPC)
• FIR filing, bail, arrest rights
• Cheque bounce (Section 138 NI Act)
• Cyber crime (IT Act 2000)

🏘️ **Specialized Laws:**
• Labour & Employment disputes
• RTI — Right to Information
• Domestic Violence Act 2005
• RERA — Real estate disputes

**Immediate Steps for Any Legal Issue:**
1. Document everything — save all messages, receipts, photos
2. Send a formal legal notice (15-30 day deadline)
3. File complaint with relevant authority
4. Consult a registered advocate for court proceedings

*Please describe your specific legal problem and I'll give you a detailed answer with the relevant Acts and Sections.*`;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! 🙏 I am **LexAid AI**, your Indian Legal Assistant.\n\nAsk me any question about Indian law — property, criminal, family, labour, consumer, cyber law and more. I will guide you with the relevant Acts and Sections.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(Date.now());
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleListening = () => {
    if (isListening) { setIsListening(false); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Your browser does not support Speech Recognition."); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      setInput((prev) => prev + (prev ? ' ' : '') + event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.filter(m => m.role !== 'system').map(m => ({
        role: m.role, content: m.content,
      }));

      let reply = '';
      try {
        // Try backend with generous timeout for mobile Capacitor
        const res = await API.post('/api/chat/legal', {
          message: userMsg,
          conversation_history: history,
        }, { timeout: 12000 }); // 12s timeout — enough for Render to wake up
        reply = res.data.reply;
      } catch (err) {
        // Full offline legal AI engine — works without internet
        reply = getOfflineLegalReply(userMsg);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚖️ **LexAid AI**: Please describe your legal issue in detail (e.g. "landlord not returning deposit", "cheque bounce", "wrongful termination") and I will provide the relevant Indian law guidance.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (messages.length > 1) {
      setConversations(prev => [{
        id: currentConvId,
        preview: messages.find(m => m.role === 'user')?.content || 'New chat',
        date: new Date().toLocaleDateString(),
        messages: [...messages],
      }, ...prev]);
    }
    setCurrentConvId(Date.now());
    setMessages([
      { role: 'assistant', content: 'Namaste! 🙏 I am **LexAid AI**, your Indian Legal Assistant.\n\nAsk me any question about Indian law — property, criminal, family, labour, consumer, cyber law and more. I will guide you with the relevant Acts and Sections.' }
    ]);
  };

  const loadConversation = (conv) => {
    if (messages.length > 1) {
      setConversations(prev => {
        const existing = prev.find(c => c.id === currentConvId);
        if (existing) return prev.map(c => c.id === currentConvId ? { ...c, messages: [...messages] } : c);
        return [{ id: currentConvId, preview: messages.find(m => m.role === 'user')?.content || 'Chat', date: new Date().toLocaleDateString(), messages: [...messages] }, ...prev];
      });
    }
    setCurrentConvId(conv.id);
    setMessages(conv.messages);
  };

  return (
    <div className="flex gap-4 h-[calc(100dvh-125px)] lg:h-[calc(100vh-6rem)] max-w-6xl mx-auto px-2 sm:px-4">
      {/* Sidebar - Conversation History (Desktop only) */}
      <div className="hidden lg:flex flex-col w-64 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100">
          <button onClick={startNewChat} className="w-full py-2.5 px-4 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light transition-colors shadow-sm">
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No past conversations</p>
          ) : (
            conversations.map((conv) => (
              <button key={conv.id} onClick={() => loadConversation(conv)}
                className={`w-full text-left p-3 rounded-xl mb-1 hover:bg-gray-50 transition-colors ${currentConvId === conv.id ? 'bg-accent/10 border border-accent/20' : ''}`}>
                <p className="text-sm text-gray-800 truncate font-medium">{conv.preview}</p>
                <p className="text-xs text-gray-400 mt-1">{conv.date}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0">
        {/* Header */}
        <div className="bg-navy text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="font-bold text-sm sm:text-base">LexAid AI Legal Chat</p>
              <p className="text-[11px] text-white/70">Indian Law · Property · Criminal · Family · Labour · Consumer</p>
            </div>
          </div>
          <button onClick={startNewChat} className="lg:hidden text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 font-medium transition-colors">
            + New
          </button>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-gray-100 shrink-0 no-scrollbar">
          {['Rent & Eviction', 'Cheque Bounce', 'Divorce', 'Labour Rights', 'Cyber Crime', 'Consumer', 'Property', 'RTI'].map(topic => (
            <button key={topic} onClick={() => { setInput(topic); }}
              className="shrink-0 px-3 py-1 bg-navy/5 hover:bg-navy/10 text-navy text-xs font-medium rounded-full border border-navy/10 transition-colors">
              {topic}
            </button>
          ))}
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white text-xs shrink-0 mt-1 mr-2">⚖️</div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm'
                  : 'bg-gray-50 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-100'
              }`}>
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white text-xs shrink-0 mt-1 mr-2">⚖️</div>
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span className="text-xs text-gray-400 ml-1">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex gap-2 max-w-3xl mx-auto items-center">
            <button onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-colors shrink-0 text-base ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title="Voice Input">🎤</button>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about Indian law... e.g. 'landlord not returning deposit'"
              className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white min-w-0"
            />
            <button id="chat-send" onClick={sendMessage} disabled={loading || !input.trim()}
              className="px-4 sm:px-5 py-2.5 bg-navy text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-navy-light disabled:opacity-50 transition-all shrink-0 shadow-sm">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
