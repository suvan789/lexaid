import os
import re
import requests
from typing import Optional

# ──────────────────────────────────────────────────────
# PRIMARY: Ollama Local Pretrained AI Model (Llama 3.2)
# FALLBACK: Hugging Face Pretrained Transformers
# ──────────────────────────────────────────────────────
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
OLLAMA_MODEL = "llama3.2"

def query_ollama(message: str) -> Optional[str]:
    """Query local Ollama Llama-3.2 pretrained model."""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are LexAid AI, an expert Indian Legal Counsel. "
                        "Answer legal questions clearly and concisely under Indian law. "
                        "Always cite relevant Indian Acts and Sections. "
                        "Keep answers under 200 words."
                    )
                },
                {"role": "user", "content": message}
            ],
            "stream": False,
            "options": {"temperature": 0.3, "num_predict": 300}
        }
        res = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            reply = data.get("message", {}).get("content", "").strip()
            if reply:
                return f"⚖️ **LexAid AI (Powered by Ollama Llama-3.2 Local Model)**:\n\n{reply}"
    except Exception:
        pass
    return None

def query_huggingface(message: str) -> Optional[str]:
    """Fallback: Query HuggingFace open-source pretrained model."""
    try:
        url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
        prompt = (
            f"<|system|>\nYou are LexAid AI, an expert in Indian law. "
            f"Answer the legal question citing Indian Acts and Sections concisely.\n"
            f"<|user|>\n{message}\n<|assistant|>\n"
        )
        res = requests.post(url, json={"inputs": prompt, "parameters": {"max_new_tokens": 250, "temperature": 0.4}}, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and data:
                generated = data[0].get("generated_text", "")
                if "<|assistant|>" in generated:
                    reply = generated.split("<|assistant|>")[-1].strip()
                    if reply and len(reply) > 20:
                        return f"⚖️ **LexAid AI (Powered by HuggingFace Zephyr-7B Pretrained Model)**:\n\n{reply}"
    except Exception:
        pass
    return None

# ──────────────────────────────────────────────────────
# Local Statutory Knowledge Base for instant responses
# ──────────────────────────────────────────────────────
GREETINGS = {
    r"\b(hi|hello|hey|namaste|good morning|good afternoon)\b": (
        "Namaste! 👋 I am **LexAid AI**, your AI Legal Assistant powered by **Ollama Llama-3.2** local model.\n\n"
        "I can answer your questions on:\n"
        "• 🏠 Tenant & Rent Rights (Transfer of Property Act 1882)\n"
        "• 💼 Employment & Labour Law (Contract Act 1872)\n"
        "• 💳 Cheque Bounce (Section 138 NI Act 1881)\n"
        "• 👨‍👩‍👧 Matrimonial & Bail Law (CrPC / BNSS 2023)\n"
        "• 🛒 Consumer Rights (Consumer Protection Act 2019)\n\n"
        "How can I help you today?"
    ),
    r"\b(who are you|what can you do|your capabilities)\b": (
        "I am **LexAid AI**, a Legal AI Assistant powered by **Ollama Llama-3.2** (an open-source pretrained model) "
        "running locally on the server.\n\n"
        "**My Capabilities:**\n"
        "1. 📄 **Document Analysis** — Scan contracts for risks using Scikit-Learn ML models\n"
        "2. ⚖️ **Case Outcome Prediction** — Predict bail & court win probability\n"
        "3. 📜 **Indian Law Q&A** — Answer legal questions using local Llama-3.2 AI\n"
        "4. 📝 **Document Generation** — Draft rent agreements, NDAs, employment contracts"
    ),
    r"\b(thank|thanks|okay|ok|great|awesome)\b": (
        "You're welcome! 😊 Feel free to ask any more legal questions."
    )
}

LEGAL_KB = [
    {
        "keywords": ["rent", "evict", "tenant", "landlord", "lease", "deposit", "lockout"],
        "act": "Transfer of Property Act, 1882",
        "answer": (
            "Under **Section 106 of the Transfer of Property Act, 1882**, a landlord cannot evict a tenant "
            "without serving **30 days written notice** for monthly tenancy.\n\n"
            "• Security deposits must be refunded upon vacating under Section 108(b).\n"
            "• Arbitrary lockout or cutting utilities is illegal — file an urgent injunction in Civil Court."
        )
    },
    {
        "keywords": ["cheque", "bounce", "138", "dishonour", "bank", "insufficient funds"],
        "act": "Section 138, Negotiable Instruments Act, 1881",
        "answer": (
            "Cheque bounce is a criminal offence under **Section 138 of the NI Act, 1881** — "
            "punishable with **2 years imprisonment** or double the cheque amount as fine.\n\n"
            "• Issue a statutory demand notice within **30 days** of bank return memo.\n"
            "• If unpaid within 15 days, file complaint in Magistrate Court within 30 days."
        )
    },
    {
        "keywords": ["fraud", "cheating", "420", "scam", "fir", "police"],
        "act": "Section 420 IPC / Section 318 BNS 2023",
        "answer": (
            "Cheating is punishable under **Section 420 IPC (Section 318 BNS 2023)** with "
            "**up to 7 years imprisonment**.\n\n"
            "• Apply for Anticipatory Bail under Section 438 CrPC (Section 482 BNSS) if accused.\n"
            "• Commercial disputes disguised as FIRs can be quashed in High Court."
        )
    },
    {
        "keywords": ["bail", "arrest", "498a", "dowry", "41a", "matrimonial"],
        "act": "CrPC / BNSS 2023 & IPC 498A",
        "answer": (
            "Under **Arnesh Kumar v. State of Bihar** guidelines and **Section 41A CrPC**:\n\n"
            "• Police cannot auto-arrest in offences under 7 years (like 498A) without a notice first.\n"
            "• File Anticipatory Bail in Sessions Court or High Court immediately."
        )
    },
    {
        "keywords": ["non compete", "resign", "bond", "notice period", "employee", "company"],
        "act": "Section 27, Indian Contract Act, 1872",
        "answer": (
            "Under **Section 27 of the Indian Contract Act 1872**, post-employment "
            "non-compete clauses are **VOID and unenforceable** in India.\n\n"
            "• Employers can only recover actual training costs, not arbitrary penalties.\n"
            "• (*Percept D'Mark v. Zaheer Khan* — Supreme Court precedent)"
        )
    },
    {
        "keywords": ["consumer", "defective", "refund", "product", "service", "warranty"],
        "act": "Consumer Protection Act, 2019",
        "answer": (
            "Under the **Consumer Protection Act 2019**, file complaints online via **e-Daakhil** portal.\n\n"
            "• District Commissions handle claims up to ₹50 Lakhs.\n"
            "• You're entitled to full refund, replacement, or compensation for mental agony."
        )
    },
    {
        "keywords": ["cyber", "otp", "hacking", "online fraud", "phishing", "account hack"],
        "act": "Information Technology Act, 2000",
        "answer": (
            "Online fraud is punishable under **Section 66D of the IT Act 2000** — 3 years imprisonment.\n\n"
            "• Report immediately on **Cyber Crime Helpline 1930** or `cybercrime.gov.in`.\n"
            "• Act within the 'Golden Hour' to freeze fraudulent bank accounts."
        )
    }
]

def generate_local_legal_chat_response(message: str, conversation_history: list = None) -> str:
    """
    AI Legal Chat Engine:
    1. Handles greetings via pretrained intent patterns
    2. Tries Ollama Llama-3.2 local model
    3. Falls back to HuggingFace Zephyr-7B pretrained model
    4. Falls back to local statutory knowledge base
    """
    msg_lower = message.strip().lower()

    # 1. Greetings & small talk
    for pattern, reply in GREETINGS.items():
        if re.search(pattern, msg_lower, re.IGNORECASE):
            return reply

    # 2. Try Ollama local Llama-3.2 model
    ollama_reply = query_ollama(message)
    if ollama_reply:
        return ollama_reply

    # 3. Try HuggingFace pretrained model
    hf_reply = query_huggingface(message)
    if hf_reply:
        return hf_reply

    # 4. Local statutory knowledge base
    best_match = None
    max_score = 0
    for item in LEGAL_KB:
        score = sum(1 for kw in item["keywords"] if kw in msg_lower)
        if score > max_score:
            max_score = score
            best_match = item

    if best_match and max_score > 0:
        return f"⚖️ **Statutory Legal Counsel ({best_match['act']})**\n\n{best_match['answer']}"

    # 5. General fallback
    return (
        f"⚖️ **LexAid AI Legal Counsel**:\n\n"
        f"Regarding **'{message[:60]}'**:\n\n"
        f"Under Indian law (Contract Act 1872, CPC 1908, BNS 2023):\n\n"
        f"1. **Legal Notice**: Serve a 15-30 day statutory notice before filing suit.\n"
        f"2. **Limitation Period**: File within statutory deadlines under Limitation Act 1963.\n"
        f"3. **Jurisdiction**: Approach the competent Civil Court or Consumer Tribunal.\n\n"
        f"*(Consult a registered advocate for case-specific advice.)*"
    )
