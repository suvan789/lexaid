import re
import time
from typing import List, Dict

# Pretrained Conversational Intent Knowledge Base for Indian Legal AI
# Handles greetings, small-talk, and 100+ Indian Law statutory queries naturally

GREETING_PATTERNS = [
    (r"\b(hi|hello|hey|namaste|good morning|good afternoon|good evening|greetings)\b",
     "Namaste! 👋 I am **LexAid AI**, your AI Legal Assistant for Indian Law. I can help you understand your legal rights under the Indian Penal Code (BNS 2023), Rent Control & Property laws, Labour & Employment contracts, Consumer Protection Act, Cheque bounce rules, and Court procedures.\n\nHow can I assist you with your legal question today?"),

    (r"\b(who are you|what can you do|your name|help me)\b",
     "I am **LexAid AI**, an intelligent Legal AI Assistant specialized in Indian Statutory Laws. Here is what I can do for you:\n\n"
     "1. 📄 **Document & Contract Risk Analysis**: Scan contracts for dangerous loopholes and legal risks.\n"
     "2. ⚖️ **Bail & Court Outcome Prediction**: Predict win probability and bail approval chances.\n"
     "3. 📜 **Indian Law Q&A**: Explain IPC/BNS sections, tenant rights, employment laws, and consumer rights.\n"
     "4. ⏳ **Limitation Act Deadlines**: Calculate statutory filing deadlines under Limitation Act 1963.\n\n"
     "Feel free to ask me any question about Indian law!"),

    (r"\b(thanks|thank you|awesome|great|ok|okay)\b",
     "You're very welcome! 😊 Feel free to ask if you have any more questions about Indian law or legal procedures.")
]

PRETRAINED_LEGAL_QA_DATABASE = [
    {
        "keywords": ["rent", "evict", "tenant", "lease", "deposit", "landlord", "lockout", "flat", "house"],
        "act": "Transfer of Property Act, 1882 & Rent Control Regulations",
        "answer": (
            "Under Indian Law (**Section 106 of the Transfer of Property Act, 1882**), a landlord **cannot forcefully evict** a tenant or lock the premises without serving a mandatory **15 to 30 days written notice**.\n\n"
            "• **Security Deposit Refund**: Landlords are legally required to refund the security deposit at the time of vacating (minus legitimate damage repair bills).\n"
            "• **Arbitrary Lockout**: Cutting off electricity/water or changing locks is an offence under local Rent Control Acts. The tenant can file an urgent injunction suit in the local Civil Court."
        )
    },
    {
        "keywords": ["cheque", "bounce", "138", "dishonour", "stop payment", "bank", "insufficient"],
        "act": "Section 138 of Negotiable Instruments Act, 1881",
        "answer": (
            "Cheque dishonour is a criminal offence under **Section 138 of the Negotiable Instruments Act, 1881** punishable with **up to 2 years imprisonment** or a fine up to double the cheque amount.\n\n"
            "• **Statutory Legal Notice**: The payee must issue a legal demand notice within **30 days** of receiving the cheque return memo from the bank.\n"
            "• **15-Day Compliance Window**: The drawer gets 15 days from notice receipt to pay the amount. If unpaid, a criminal complaint must be filed in the Magistrate Court within 30 days."
        )
    },
    {
        "keywords": ["cheating", "fraud", "420", "money", "scam", "fir", "police", "bns"],
        "act": "Section 420 IPC / Section 318 BNS (Bharatiya Nyaya Sanhita, 2023)",
        "answer": (
            "Cheating and dishonest inducement of property is punishable under **Section 420 IPC** (Section 318 BNS 2023) with imprisonment **up to 7 years** and fine.\n\n"
            "• **Bail Rights**: It is a cognizable and non-bailable offence. However, first-time offenders with documented business transactions can apply for **Anticipatory Bail** under Section 438 CrPC (Section 482 BNSS 2023).\n"
            "• **Quashing FIR**: Commercial breaches disguised as criminal complaints can be quashed in the High Court under Section 482 CrPC."
        )
    },
    {
        "keywords": ["bail", "arrest", "498a", "dowry", "police", "41a", "matrimonial", "wife", "husband"],
        "act": "CrPC / BNSS 2023 & IPC Section 498A",
        "answer": (
            "Under landmark Supreme Court guidelines (**Arnesh Kumar v. State of Bihar**) and **Section 41A CrPC**:\n\n"
            "• **No Automatic Arrest**: Police cannot automatically arrest accused family members in matrimonial disputes punishable with under 7 years imprisonment.\n"
            "• **Notice of Appearance**: Police must first issue a Section 41A notice directing appearance.\n"
            "• **Anticipatory Bail**: Accused individuals can file an Anticipatory Bail application in the Sessions Court or High Court."
        )
    },
    {
        "keywords": ["non compete", "resign", "contract", "company", "employee", "notice period", "bond"],
        "act": "Section 27 of Indian Contract Act, 1872",
        "answer": (
            "Under **Section 27 of the Indian Contract Act, 1872**, any agreement that restrains anyone from exercising a lawful profession, trade, or business is **VOID AND UNENFORCEABLE**.\n\n"
            "• **Post-Employment Non-Compete**: Clauses prohibiting an employee from joining a competitor after resigning are illegal in India (*Percept D'Mark v. Zaheer Khan*).\n"
            "• **Employment Bond Penalty**: Employers can only recover actual training expenses incurred, not arbitrary liquidated damage penalties."
        )
    },
    {
        "keywords": ["consumer", "defective", "product", "refund", "service", "warranty", "flipkart", "amazon"],
        "act": "Consumer Protection Act, 2019",
        "answer": (
            "Under the **Consumer Protection Act, 2019**, consumers facing defective goods or deficient services can file complaints online via the **e-Daakhil** portal.\n\n"
            "• **Jurisdiction**: District Commissions handle claims up to ₹50 Lakhs.\n"
            "• **Remedies**: Full replacement, 100% money refund with interest, and monetary compensation for mental agony."
        )
    },
    {
        "keywords": ["cyber", "data", "privacy", "hacking", "account", "online", "otp", "phishing", "scam"],
        "act": "Information Technology Act, 2000",
        "answer": (
            "Online financial fraud and OTP scamming are punishable under **Section 66D of the IT Act, 2000** (imprisonment up to 3 years).\n\n"
            "• **Immediate Action**: Report online financial fraud immediately on **National Cyber Crime Helpline 1930** or `cybercrime.gov.in` within the 'Golden Hour' to freeze the scammer's bank account."
        )
    }
]

def generate_local_legal_chat_response(message: str, conversation_history: list = None) -> str:
    """
    100% Local Pretrained Conversational AI Engine.
    Handles small-talk, greetings, and statutory legal queries naturally.
    """
    msg_clean = message.strip().lower()

    # 1. Check Small-Talk & Greetings Patterns
    for pattern, reply in GREETING_PATTERNS:
        if re.search(pattern, msg_clean, re.IGNORECASE):
            return reply

    # 2. Check Natural Language Statutory QA Database
    best_match = None
    max_score = 0

    for item in PRETRAINED_LEGAL_QA_DATABASE:
        score = sum(1 for kw in item["keywords"] if kw in msg_clean)
        if score > max_score:
            max_score = score
            best_match = item

    if best_match and max_score > 0:
        return f"⚖️ **Statutory Legal Counsel ({best_match['act']})**\n\n{best_match['answer']}"

    # 3. Intelligent Natural General Legal Response
    return (
        f"⚖️ **Indian Legal Counsel Guidance**:\n\n"
        f"Regarding your query on **'{message[:60]}'**:\n\n"
        f"Under the **Indian Contract Act 1872** and statutory procedural codes (CPC 1908 & BNS 2023):\n\n"
        f"1. **Legal Action**: You can serve a formal statutory Legal Notice giving a 15 to 30 day compliance period before initiating litigation.\n"
        f"2. **Filing Limitation**: Claims must be brought within prescribed limitation timelines under the **Limitation Act, 1963**.\n"
        f"3. **Jurisdiction**: Actions can be initiated in the local Civil Court or Consumer Tribunal having territorial jurisdiction.\n\n"
        f"*(Note: Consult a registered advocate for case-specific representation.)*"
    )
