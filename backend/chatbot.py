import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


async def chat_with_document(message: str, document_text: str) -> str:
    """
    Chat with Groq about the uploaded legal document.
    The model is constrained to only answer based on the document content.
    """
    truncated_text = document_text[:20000] if len(document_text) > 20000 else document_text

    prompt = f"""You are LexAid Assistant, a friendly AI legal helper for Indian citizens.

STRICT RULES:
1. Answer ONLY from the document provided below
2. If answer not in document, respond exactly: "I cannot find this information in your document. Please consult a lawyer for advice on this."
3. Cite relevant Indian laws when applicable
4. Keep answers under 80 words
5. Use simple English — no legal jargon
6. Be reassuring — the user may be worried

DOCUMENT:
{truncated_text}

USER QUESTION: {message}

Answer:"""

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
        return f"I'm sorry, I encountered an error processing your question. Please try again. ({str(e)})"
