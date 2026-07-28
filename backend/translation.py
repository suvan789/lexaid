import json
import requests


def _huggingface_translate(text: str, target_language: str) -> str:
    """Translate using HuggingFace free inference API."""
    lang_display = "Tamil" if target_language == "tamil" else "Hindi"
    try:
        url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
        prompt = (
            f"<|system|>\nTranslate the following English legal text to {lang_display}. "
            f"Return ONLY the translated text, nothing else.\n"
            f"<|user|>\n{text[:1500]}\n<|assistant|>\n"
        )
        res = requests.post(
            url,
            json={"inputs": prompt, "parameters": {"max_new_tokens": 400, "temperature": 0.2}},
            timeout=6,
        )
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and data:
                generated = data[0].get("generated_text", "")
                if "<|assistant|>" in generated:
                    translated = generated.split("<|assistant|>")[-1].strip()
                    if translated and len(translated) > 5:
                        return translated
    except Exception:
        pass
    return text


async def translate_text(text: str, target_language: str) -> str:
    """
    Translate English legal explanation text to Tamil or Hindi.
    Uses HuggingFace free API. Falls back to original if unavailable.
    """
    result = _huggingface_translate(text, target_language)
    return result


async def translate_texts_batch(texts: list, target_language: str) -> list:
    """Translate a list of English texts to target language."""
    if not texts:
        return []
    translated = []
    for text in texts:
        result = _huggingface_translate(text, target_language)
        translated.append(result)
    return translated
