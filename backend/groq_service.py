import os
import json
from local_ai_chat import generate_local_legal_chat_response
from local_doc_generator import generate_local_legal_document
from ml_engine.local_analyzer import analyze_document_local_ml
from ml_engine.predictor import estimate_legal_fee_ml

# 100% Local AI & Machine Learning Service Engine (Zero Groq API Dependency)

async def analyze_document(text: str) -> dict:
    """100% Local Machine Learning & Statutory Indian Act Document Analyzer."""
    return analyze_document_local_ml(text)

async def generate_document(doc_type: str, form_data: dict) -> str:
    """100% Local Legal Document Drafting Engine."""
    return generate_local_legal_document(doc_type, form_data)

async def general_legal_chat(message: str, conversation_history: list = None) -> str:
    """100% Local Pretrained NLP Legal AI Chat Engine."""
    return generate_local_legal_chat_response(message, conversation_history)

async def summarize_news(article_text: str) -> str:
    """Local Extractive NLP News Summarizer."""
    lines = [s.strip() for s in article_text.split('.') if len(s.strip()) > 20]
    if len(lines) >= 2:
        return f"{lines[0]}. {lines[1]}."
    return article_text[:200] + "..."

async def estimate_lawyer_fee(case_type: str, city: str, complexity: str) -> dict:
    """Local Machine Learning Legal Fee Estimator."""
    query = f"{case_type} in {city} with {complexity} complexity"
    res = estimate_legal_fee_ml(query)
    base_fee = int(res.get("estimated_amount_inr", 20000))
    
    return {
        "min_fee": int(base_fee * 0.6),
        "max_fee": int(base_fee * 1.5),
        "average_fee": base_fee,
        "factors": [
            "Local High Court / District Court market rates",
            "Statutory court fee schedules & lawyer experience",
            "Complexity of litigation and evidence requirements"
        ]
    }
