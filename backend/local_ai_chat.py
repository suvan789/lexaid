"""
LexAid AI Legal Chat Engine
============================
Powered by: TF-IDF Pretrained ML Model (scikit-learn)
- NO external API calls
- NO Ollama / Groq / HuggingFace API
- Runs 100% on Render cloud server
- Pretrained on 500+ Indian Law Q&A corpus
"""

import re
from ml_engine.legal_ai_engine import semantic_legal_search

# ── Quick intent patterns (instant responses) ────────────────────────────────
GREETINGS_PATTERN = re.compile(
    r"^\s*(hi|hello|hey|namaste|good\s*(morning|afternoon|evening|night)|"
    r"howdy|greetings|jai\s*hind)\s*[\!\.\?]*\s*$",
    re.IGNORECASE,
)

ABOUT_PATTERN = re.compile(
    r"who\s*are\s*you|what\s*(are|can|is)\s*(you|lexaid)|"
    r"your\s*capabilities|what\s*do\s*you\s*do",
    re.IGNORECASE,
)

THANKS_PATTERN = re.compile(
    r"^\s*(thank|thanks|ok|okay|great|awesome|understood|got\s*it|"
    r"perfect|noted|good)\s*[\!\.\?]*\s*$",
    re.IGNORECASE,
)


def generate_local_legal_chat_response(message: str, conversation_history: list = None) -> str:
    """
    LexAid AI Chat — 100% offline, no API calls.
    Uses pretrained TF-IDF ML model on Indian Legal corpus.
    """
    msg = message.strip()
    msg_lower = msg.lower()

    # ── 1. Greeting ─────────────────────────────────────────────────────────
    if GREETINGS_PATTERN.match(msg):
        return (
            "Namaste! 👋 I am **LexAid AI**, your Indian Legal Assistant.\n\n"
            "I am powered by a **pretrained TF-IDF ML model** trained on 500+ Indian law cases — "
            "running 100% offline on this server with zero API calls.\n\n"
            "**I can help you with:**\n"
            "• 🏠 Rent & Tenant Rights (Transfer of Property Act 1882)\n"
            "• 💼 Employment & Labour Law (Industrial Disputes Act 1947)\n"
            "• 💳 Cheque Bounce (Section 138 NI Act 1881)\n"
            "• 👨‍👩‍👧 Family & Matrimonial Law (Hindu Marriage Act 1955)\n"
            "• 🛒 Consumer Rights (Consumer Protection Act 2019)\n"
            "• 🔒 Cyber Crime (IT Act 2000)\n"
            "• 🏛️ Criminal Law (BNS 2023 / IPC)\n"
            "• 📜 Property & Real Estate (RERA 2016)\n\n"
            "Ask me your legal question!"
        )

    # ── 2. About LexAid ─────────────────────────────────────────────────────
    if ABOUT_PATTERN.search(msg):
        return (
            "I am **LexAid AI** — a pretrained Machine Learning Legal Assistant.\n\n"
            "**🤖 AI Model:** TF-IDF Semantic Retrieval (scikit-learn)\n"
            "**📚 Training Corpus:** 500+ Indian Law Q&A pairs\n"
            "**⚡ Inference:** Cosine Similarity matching\n"
            "**🌐 External APIs:** Zero (completely offline)\n"
            "**🖥️ Runs on:** Render cloud server (no Ollama/Groq needed)\n\n"
            "**Covered Acts:**\n"
            "IPC/BNS 2023 • CrPC/BNSS • NI Act 1881 • Transfer of Property Act 1882 • "
            "Consumer Protection Act 2019 • IT Act 2000 • Hindu Marriage Act 1955 • "
            "RERA 2016 • RTI Act 2005 • POSH Act 2013 • Companies Act 2013"
        )

    # ── 3. Thanks / closing ─────────────────────────────────────────────────
    if THANKS_PATTERN.match(msg):
        return (
            "You're welcome! 😊\n\n"
            "Remember: This is for **general legal information** only. "
            "For case-specific advice, always consult a registered advocate.\n\n"
            "Feel free to ask any more legal questions!"
        )

    # ── 4. TF-IDF Semantic Search (pretrained ML model) ─────────────────────
    result = semantic_legal_search(msg)
    if result:
        return result

    # ── 5. Fallback with legal guidance ─────────────────────────────────────
    topic = msg[:60].strip()
    return (
        f"⚖️ **LexAid AI — Legal Guidance**\n\n"
        f"Regarding: *\"{topic}\"*\n\n"
        f"Under Indian law, your options typically include:\n\n"
        f"1. **Legal Notice** — Send a registered notice (15-30 days) before court action.\n"
        f"2. **Limitation Period** — File suit within statutory deadline (Limitation Act, 1963).\n"
        f"3. **Jurisdiction** — Approach Civil Court / Consumer Commission / Labour Court as applicable.\n"
        f"4. **Evidence** — Preserve all documents, messages, receipts as evidence.\n\n"
        f"For a more specific answer, try asking with keywords like:\n"
        f"*\"cheque bounce\", \"rent eviction\", \"consumer complaint\", \"bail application\", \"salary dues\", etc.*\n\n"
        f"*(Always consult a registered advocate for case-specific representation.)*"
    )
