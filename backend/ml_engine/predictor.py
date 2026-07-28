import os
import time
import joblib

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
CLASSIFIER_PATH = os.path.join(MODEL_DIR, 'doc_classifier.pkl')
RISK_PATH = os.path.join(MODEL_DIR, 'risk_regressor.pkl')

# Load models into memory
doc_classifier = None
risk_regressor = None

try:
    if os.path.exists(CLASSIFIER_PATH):
        doc_classifier = joblib.load(CLASSIFIER_PATH)
    if os.path.exists(RISK_PATH):
        risk_regressor = joblib.load(RISK_PATH)
except Exception as e:
    print(f"[ML ENGINE] Warning loading model binaries: {e}")

def classify_document_ml(text: str):
    """Predict document type using local Random Forest TF-IDF ML model."""
    global doc_classifier
    start_time = time.time()
    
    if not doc_classifier:
        from ml_engine.train_models import train_and_save
        train_and_save()
        doc_classifier = joblib.load(CLASSIFIER_PATH)

    probs = doc_classifier.predict_proba([text])[0]
    classes = doc_classifier.classes_
    top_index = probs.argmax()
    
    predicted_type = classes[top_index]
    confidence_score = float(probs[top_index])
    
    # Class probabilities dictionary for evaluators
    all_probabilities = {cls: round(float(prob), 4) for cls, prob in zip(classes, probs)}
    
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    
    return {
        "model_used": "RandomForestClassifier + TF-IDF (Local PKL Model)",
        "predicted_category": predicted_type,
        "confidence_score": round(confidence_score * 100, 2),
        "class_probabilities": all_probabilities,
        "inference_time_ms": elapsed_ms
    }

def predict_risk_ml(text: str):
    """Predict contract risk percentage using Random Forest Regressor ML model."""
    global risk_regressor
    start_time = time.time()
    
    if not risk_regressor:
        from ml_engine.train_models import train_and_save
        train_and_save()
        risk_regressor = joblib.load(RISK_PATH)

    predicted_risk = float(risk_regressor.predict([text])[0])
    predicted_risk = min(max(predicted_risk, 5.0), 98.0)
    
    risk_level = "Low"
    if predicted_risk > 75:
        risk_level = "Critical"
    elif predicted_risk > 50:
        risk_level = "High"
    elif predicted_risk > 25:
        risk_level = "Medium"
        
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    
    # Detect high-risk legal clauses using statistical pattern matching
    detected_clauses = []
    lower = text.lower()
    if "indemnify" in lower or "hold harmless" in lower:
        detected_clauses.append("Uncapped Indemnification Clause")
    if "without cause" in lower or "immediate termination" in lower:
        detected_clauses.append("Unilateral Termination Rights")
    if "penalty" in lower or "late payment" in lower:
        detected_clauses.append("High Penalty Interest Clause")
    if "exclusive jurisdiction" in lower or "foreign court" in lower:
        detected_clauses.append("Restrictive Jurisdiction Clause")
    if "lock-in" in lower or "liquidated damages" in lower:
        detected_clauses.append("Lock-in Penalty Clause")

    return {
        "model_used": "RandomForestRegressor + TF-IDF (Local PKL Model)",
        "risk_score_percentage": round(predicted_risk, 1),
        "risk_level": risk_level,
        "detected_risk_clauses": detected_clauses,
        "inference_time_ms": elapsed_ms
    }
