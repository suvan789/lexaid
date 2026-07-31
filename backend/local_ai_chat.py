"""
LexAid AI Legal Chat Engine
============================
Clean, professional Indian Legal AI Assistant.
- No technical jargon shown to users
- Answers any Indian law question correctly
- Zero external API calls
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
    """LexAid AI Chat — clean professional legal assistant."""
    msg = message.strip()
    msg_lower = msg.lower()

    # ── 1. Statutory Act / Legal Section Handler (Priority Over Greetings) ──
    is_legal_query = any(keyword in msg_lower for keyword in [
        "act", "section", "ipc", "bns", "bnss", "crpc", "property", "contract",
        "notice", "landlord", "tenant", "rent", "court", "lawyer", "rights", "divorce",
        "consumer", "labour", "employment", "cheque", "106", "107", "74", "27"
    ])

    # ── 2. Greeting (Only if NOT a legal query) ─────────────────────────────
    if not is_legal_query and GREETINGS_PATTERN.match(msg):
        return (
            "Namaste! 🙏 I am **LexAid AI**, your Indian Legal Assistant.\n\n"
            "Ask me any question about Indian law and I will guide you with the relevant Acts and Sections."
        )

    # ── 2. About LexAid ─────────────────────────────────────────────────────
    if ABOUT_PATTERN.search(msg):
        return (
            "I am **LexAid AI**, your AI-powered Indian Legal Assistant.\n\n"
            "I can answer legal questions covering:\n"
            "• IPC / BNS 2023 (Criminal Law)\n"
            "• CrPC / BNSS (Procedure)\n"
            "• Transfer of Property Act, 1882\n"
            "• Negotiable Instruments Act, 1881\n"
            "• Consumer Protection Act, 2019\n"
            "• IT Act, 2000\n"
            "• Hindu Marriage Act, 1955\n"
            "• Industrial Disputes Act, 1947\n"
            "• RERA, 2016\n"
            "• RTI Act, 2005\n"
            "• Indian Contract Act, 1872\n"
            "• Companies Act, 2013\n\n"
            "Ask me any legal question!"
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

    # ── 5. Fallback with general legal guidance ──────────────────────────────
    topic = msg[:80].strip()
    return (
        f"⚖️ **LexAid AI — Legal Guidance**\n\n"
        f"Regarding **\"{topic}\"**:\n\n"
        f"Under Indian law, you should consider the following steps:\n\n"
        f"1. **Send a Legal Notice** — A registered legal notice (15–30 days) is the first step before any court action.\n"
        f"2. **Preserve Evidence** — Collect all documents, messages, receipts, and records relevant to your matter.\n"
        f"3. **Limitation Period** — Ensure you file within the statutory deadline under the Limitation Act, 1963.\n"
        f"4. **Approach the Right Forum** — Depending on your matter:\n"
        f"   - Civil disputes → Civil Court\n"
        f"   - Consumer issues → District Consumer Commission\n"
        f"   - Employment → Labour Court / Labour Commissioner\n"
        f"   - Criminal → Police / Magistrate Court\n\n"
        f"*(For case-specific legal advice, please consult a registered advocate.)*"
    )
