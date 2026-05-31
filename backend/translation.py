import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


async def translate_text(text: str, target_language: str) -> str:
    """
    Translate English legal explanation text to Tamil or Hindi using Groq.
    Falls back to original text if translation fails.
    """
    language_display = "Tamil" if target_language == "tamil" else "Hindi"

    prompt = f"""Translate the following English legal explanation to {language_display}.
Keep the translation simple and easy to understand.
Maintain the same meaning exactly.
Return ONLY the translated text, nothing else.

Text to translate:
{text}"""

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
        translated = chat_completion.choices[0].message.content.strip()
        if translated:
            return translated
        return text
    except Exception:
        return text


async def translate_texts_batch(texts: list, target_language: str) -> list:
    if not texts:
        return []
        
    language_display = "Tamil" if target_language == "tamil" else "Hindi"
    
    prompt = f"""Translate the following JSON array of English texts to {language_display}.
Keep the translations simple and easy to understand.
Maintain the same meaning exactly.
Return ONLY a valid JSON object containing a single key "translations" which holds the array of translated strings in the exact same order. Do not include markdown formatting.

Texts to translate:
{json.dumps(texts, ensure_ascii=False)}"""

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
        
        response_text = chat_completion.choices[0].message.content.strip()
        data = json.loads(response_text)
        
        translated_list = data.get("translations", texts)

        if isinstance(translated_list, list) and len(translated_list) == len(texts):
            return translated_list
        return texts
    except Exception:
        return texts
