import os
import json
from groq import Groq
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in environment variables. Check your .env file.")

client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"

# ─── Prompts ──────────────────────────────────────────────────

ANALYSIS_PROMPT = """You are LexAid, expert AI legal assistant for Indian law.
Analyze this legal document. Return ONLY valid JSON, no markdown.

{
  "document_type": "detected type",
  "overall_risk": "HIGH|MEDIUM|LOW",
  "risk_summary": "one sentence",
  "total_clauses": number,
  "high_risk_count": number,
  "medium_risk_count": number,
  "low_risk_count": number,
  "legal_mistakes_detected": [
    {
      "mistake_found": "Describe the factually incorrect, legally unsound, or outdated Indian law from the document.",
      "correction": "Explain what the actual, current Indian law says to correct this mistake."
    }
  ],
  "clauses": [
    {
      "clause_number": number,
      "heading": "max 5 words",
      "original_text": "exact text",
      "risk_level": "HIGH|MEDIUM|LOW",
      "plain_explanation": "2 simple sentences",
      "what_it_means_for_you": "practical impact",
      "your_rights": "Indian law citation or empty string"
    }
  ]
}

Sort: HIGH first, MEDIUM next, LOW last.
Minimum 5 clauses. Be conservative on risk.

DOCUMENT TO ANALYZE:
"""

GENERATE_DOC_PROMPT = """You are LexAid, an expert Indian legal document drafter.
Generate a complete, legally sound {doc_type} document
based on this information: {form_data}

Requirements:
- Follow Indian law standards
- Include all standard clauses for this document type
- Use proper legal language
- Include date, signatures section
- Make it comprehensive and professional
- Return ONLY the document text, no explanation
"""

LEGAL_CHAT_PROMPT = """You are LexAid, a knowledgeable AI legal assistant
specializing in Indian law.

RULES:
1. Answer general Indian legal questions clearly
2. Cite specific laws when applicable (IPC, CrPC,
   Contract Act, Consumer Protection Act etc.)
3. Always add: "Consult a qualified lawyer for
   advice specific to your situation."
4. Keep answers under 150 words
5. Use simple language

Conversation history:
{history}

User question: {message}
"""

FEE_ESTIMATE_PROMPT = """You are LexAid, an expert on Indian legal market rates.
Estimate lawyer fees for:
- Case type: {case_type}
- City: {city}
- Complexity: {complexity}

Return ONLY valid JSON, no markdown:
{{
  "min_fee": number_in_inr,
  "max_fee": number_in_inr,
  "average_fee": number_in_inr,
  "factors": ["factor1", "factor2", "factor3"]
}}

Base on realistic Indian lawyer market rates for 2024-2025.
Consider city tier, case complexity, and typical duration.
"""


def _parse_json_response(text: str) -> dict:
    """Parse JSON from Groq response, stripping markdown fences if present."""
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Sometimes models add text around JSON, try to find the JSON block
        start = cleaned.find('{')
        end = cleaned.rfind('}') + 1
        if start != -1 and end != 0:
            return json.loads(cleaned[start:end])
        raise


async def analyze_document(text: str) -> dict:
    """
    Send document text to Groq for clause-by-clause legal analysis.
    Chunks text to 30000 chars if too long. Retries once on JSON parse failure.
    """
    document_text = text[:30000] if len(text) > 30000 else text
    full_prompt = ANALYSIS_PROMPT + document_text

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": full_prompt,
                }
            ],
            model=MODEL,
            response_format={"type": "json_object"}
        )
        result = json.loads(chat_completion.choices[0].message.content)
        return result
    except Exception as e:
        try:
            # Retry without JSON format enforcement if it fails
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": "Return ONLY valid JSON, no other text:\n\n" + full_prompt,
                    }
                ],
                model=MODEL,
            )
            result = _parse_json_response(chat_completion.choices[0].message.content)
            return result
        except Exception as retry_e:
            raise HTTPException(
                status_code=500,
                detail=f"AI analysis failed: {str(retry_e)}",
            )


async def generate_document(doc_type: str, form_data: dict) -> str:
    """Generate a complete legal document using Groq."""
    # Exclude heavy Base64 signature image string from LLM prompt to keep tokens low
    clean_form_data = {k: v for k, v in form_data.items() if k != "signature_image"}
    if form_data.get("signature_image"):
        clean_form_data["has_digitally_attached_signature"] = True

    prompt = GENERATE_DOC_PROMPT.format(
        doc_type=doc_type.replace("_", " ").title(),
        form_data=json.dumps(clean_form_data, indent=2)
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document generation failed: {str(e)}",
        )


async def general_legal_chat(message: str, conversation_history: list = None) -> str:
    """General Indian law Q&A using Groq."""
    history_str = ""
    if conversation_history:
        for msg in conversation_history[-10:]:  # Keep last 10 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            history_str += f"{role}: {content}\n"

    prompt = LEGAL_CHAT_PROMPT.format(
        history=history_str if history_str else "No previous conversation.",
        message=message
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        return f"I'm sorry, I encountered an error. Please try again. ({str(e)})"


async def summarize_news(article_text: str) -> str:
    """Summarize a news article in 2-3 sentences in simple English."""
    prompt = f"""Summarize the following legal news article in 2-3 sentences in simple English.
Focus on the key legal impact for Indian citizens.
Return ONLY the summary, nothing else.

Article:
{article_text[:5000]}"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception:
        return article_text[:200] + "..."


async def estimate_lawyer_fee(case_type: str, city: str, complexity: str) -> dict:
    """Estimate lawyer fees using Groq based on Indian market rates."""
    prompt = FEE_ESTIMATE_PROMPT.format(
        case_type=case_type,
        city=city,
        complexity=complexity
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL,
            response_format={"type": "json_object"}
        )
        result = json.loads(chat_completion.choices[0].message.content)
        return {
            "min_fee": int(result.get("min_fee", 5000)),
            "max_fee": int(result.get("max_fee", 50000)),
            "average_fee": int(result.get("average_fee", 20000)),
            "factors": result.get("factors", [])
        }
    except Exception:
        # Return reasonable defaults if it fails
        return {
            "min_fee": 5000,
            "max_fee": 50000,
            "average_fee": 20000,
            "factors": [
                "City tier and local market rates",
                "Case complexity and duration",
                "Lawyer's experience and reputation"
            ]
        }
