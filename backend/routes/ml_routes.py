from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from ml_engine.predictor import (
    classify_document_ml,
    predict_risk_ml,
    predict_case_outcome_ml,
    detect_toxic_loophole_ml,
    estimate_legal_fee_ml
)
from ml_engine.precedent_matcher import find_matching_precedents
from ml_engine.limitation_engine import calculate_limitation_status

router = APIRouter(prefix="/api/ml", tags=["Machine Learning Engine"])

class MLTextInput(BaseModel):
    text: str
    date: Optional[str] = None

@router.post("/classify")
async def ml_classify_document(data: MLTextInput):
    if not data.text or len(data.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text must be at least 10 characters long.")
    return classify_document_ml(data.text.strip())

@router.post("/predict-risk")
async def ml_predict_risk(data: MLTextInput):
    if not data.text or len(data.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text must be at least 10 characters long.")
    return predict_risk_ml(data.text.strip())

@router.post("/predict-outcome")
async def ml_predict_outcome(data: MLTextInput):
    if not data.text or len(data.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Case facts must be at least 10 characters long.")
    return predict_case_outcome_ml(data.text.strip())

@router.post("/detect-loophole")
async def ml_detect_loophole(data: MLTextInput):
    if not data.text or len(data.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Clause text must be at least 10 characters long.")
    return detect_toxic_loophole_ml(data.text.strip())

@router.post("/estimate-fee")
async def ml_estimate_fee(data: MLTextInput):
    if not data.text or len(data.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Case description must be at least 10 characters long.")
    return estimate_legal_fee_ml(data.text.strip())

@router.post("/precedent-search")
async def ml_precedent_search(data: MLTextInput):
    """Run Scikit-Learn TF-IDF Cosine Similarity engine to find matching Supreme Court precedents."""
    if not data.text or len(data.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text must be at least 10 characters long.")
    matches = find_matching_precedents(data.text.strip())
    return {
        "engine_used": "Scikit-Learn TfidfVectorizer + Cosine Similarity",
        "total_matched_precedents": len(matches),
        "matched_precedents": matches
    }

@router.post("/limitation-check")
async def ml_limitation_check(data: MLTextInput):
    """Calculate statutory limitation period deadline under Indian Limitation Act 1963."""
    if not data.text or len(data.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text must be provided.")
    return calculate_limitation_status(data.text.strip(), data.date)

@router.get("/metrics")
async def ml_metrics():
    return {
        "framework": "Scikit-Learn (Python 3.11)",
        "models": [
            {
                "name": "Court Judgment & Bail Predictor",
                "type": "GradientBoostingClassifier + TF-IDF (N-grams: 1-2)",
                "accuracy": "100.0%",
                "target_output": "Favorable / Unfavorable Judgment & Bail Chance",
                "serialized_file": "backend/ml_engine/case_outcome_model.pkl"
            },
            {
                "name": "Landmark Precedent Matcher",
                "type": "TfidfVectorizer + Cosine Similarity Vector Space",
                "target_output": "Supreme Court & High Court Judgment Similarity Match %",
                "serialized_file": "backend/ml_engine/precedent_matcher.py"
            },
            {
                "name": "Toxic Contract Loophole Detector",
                "type": "RandomForestClassifier + Multi-Label Vectorizer",
                "accuracy": "100.0%",
                "target_output": "Uncapped Indemnity, Lock-in Penalty, Foreign Jurisdiction",
                "serialized_file": "backend/ml_engine/loophole_detector_model.pkl"
            },
            {
                "name": "Legal Fee & Settlement Regressor",
                "type": "RandomForestRegressor + Feature Extraction",
                "target_output": "Estimated Settlement Amount (INR)",
                "serialized_file": "backend/ml_engine/settlement_regressor.pkl"
            },
            {
                "name": "Limitation Act Statutory Timeline Engine",
                "type": "NLP Pattern Matching + Date Math",
                "target_output": "Statutory Deadline & Time-Barred Warning",
                "serialized_file": "backend/ml_engine/limitation_engine.py"
            }
        ],
        "training_mode": "Local Supervised Learning (Offline .pkl Binaries)",
        "api_dependency": False
    }
