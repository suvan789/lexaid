import os
import time
import joblib

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# Model Paths
DOC_CLASSIFIER_PATH = os.path.join(MODEL_DIR, 'doc_classifier.pkl')
RISK_PATH = os.path.join(MODEL_DIR, 'risk_regressor.pkl')
OUTCOME_PATH = os.path.join(MODEL_DIR, 'case_outcome_model.pkl')
LOOPHOLE_PATH = os.path.join(MODEL_DIR, 'loophole_detector_model.pkl')
SETTLEMENT_PATH = os.path.join(MODEL_DIR, 'settlement_regressor.pkl')

# Global Model Memory Cache
doc_classifier = None
risk_regressor = None
outcome_model = None
loophole_model = None
settlement_model = None

def load_all_models():
    global doc_classifier, risk_regressor, outcome_model, loophole_model, settlement_model
    try:
        if os.path.exists(DOC_CLASSIFIER_PATH): doc_classifier = joblib.load(DOC_CLASSIFIER_PATH)
        if os.path.exists(RISK_PATH): risk_regressor = joblib.load(RISK_PATH)
        if os.path.exists(OUTCOME_PATH): outcome_model = joblib.load(OUTCOME_PATH)
        if os.path.exists(LOOPHOLE_PATH): loophole_model = joblib.load(LOOPHOLE_PATH)
        if os.path.exists(SETTLEMENT_PATH): settlement_model = joblib.load(SETTLEMENT_PATH)
    except Exception as e:
        print(f"[ML ENGINE] Model loading note: {e}")

load_all_models()

def extract_features(pipeline, text):
    """Extract non-zero TF-IDF feature tokens from text."""
    try:
        vectorizer = pipeline.named_steps['tfidf']
        feature_names = vectorizer.get_feature_names_out()
        tfidf_matrix = vectorizer.transform([text])
        non_zero_indices = tfidf_matrix.nonzero()[1]
        extracted = [feature_names[idx] for idx in non_zero_indices]
        return extracted[:10]
    except Exception:
        return ["legal", "contract", "section", "party"]

def predict_case_outcome_ml(case_facts: str):
    """Predict court judgment outcome & bail chances using Gradient Boosting ML model."""
    global outcome_model
    start_time = time.time()
    if not outcome_model: load_all_models()

    probs = outcome_model.predict_proba([case_facts])[0]
    classes = outcome_model.classes_
    top_idx = probs.argmax()

    predicted_outcome = classes[top_idx]
    confidence_score = round(float(probs[top_idx]) * 100, 2)
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    features = extract_features(outcome_model, case_facts)

    return {
        "model_used": "GradientBoostingClassifier + TF-IDF (Local PKL Binary)",
        "predicted_outcome": predicted_outcome,
        "confidence_percentage": confidence_score,
        "class_probabilities": {cls: round(float(p) * 100, 2) for cls, p in zip(classes, probs)},
        "extracted_tfidf_features": features,
        "inference_time_ms": elapsed_ms
    }

def detect_toxic_loophole_ml(clause_text: str):
    """Detect dangerous legal loopholes using Random Forest Multi-label Classifier."""
    global loophole_model
    start_time = time.time()
    if not loophole_model: load_all_models()

    probs = loophole_model.predict_proba([clause_text])[0]
    classes = loophole_model.classes_
    top_idx = probs.argmax()

    loophole_type = classes[top_idx]
    confidence = round(float(probs[top_idx]) * 100, 2)
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    features = extract_features(loophole_model, clause_text)
    is_dangerous = loophole_type != "Standard Fair Clause"

    return {
        "model_used": "RandomForestClassifier + TF-IDF (Local PKL Binary)",
        "loophole_category": loophole_type,
        "is_dangerous_trap": is_dangerous,
        "confidence_percentage": confidence,
        "extracted_tfidf_features": features,
        "inference_time_ms": elapsed_ms
    }

def estimate_legal_fee_ml(case_description: str):
    """Predict estimated court fee and settlement value using Random Forest Regressor."""
    global settlement_model
    start_time = time.time()
    if not settlement_model: load_all_models()

    est_amount = float(settlement_model.predict([case_description])[0])
    est_amount = max(round(est_amount, -2), 5000.0)
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    features = extract_features(settlement_model, case_description)

    return {
        "model_used": "RandomForestRegressor + TF-IDF Feature Extraction",
        "estimated_amount_inr": est_amount,
        "estimated_amount_formatted": f"INR {est_amount:,.2f}",
        "extracted_tfidf_features": features,
        "inference_time_ms": elapsed_ms
    }

def classify_document_ml(text: str):
    """Predict document type using local Random Forest TF-IDF ML model."""
    global doc_classifier
    start_time = time.time()
    if not doc_classifier: load_all_models()

    probs = doc_classifier.predict_proba([text])[0]
    classes = doc_classifier.classes_
    top_index = probs.argmax()

    return {
        "model_used": "RandomForestClassifier + TF-IDF (Local PKL Model)",
        "predicted_category": classes[top_index],
        "confidence_score": round(float(probs[top_index]) * 100, 2),
        "class_probabilities": {cls: round(float(prob), 4) for cls, prob in zip(classes, probs)},
        "inference_time_ms": round((time.time() - start_time) * 1000, 2)
    }

def predict_risk_ml(text: str):
    """Predict contract risk percentage using Random Forest Regressor ML model."""
    global risk_regressor
    start_time = time.time()
    if not risk_regressor: load_all_models()

    predicted_risk = float(risk_regressor.predict([text])[0])
    predicted_risk = min(max(predicted_risk, 5.0), 98.0)

    risk_level = "Low"
    if predicted_risk > 75: risk_level = "Critical"
    elif predicted_risk > 50: risk_level = "High"
    elif predicted_risk > 25: risk_level = "Medium"

    return {
        "model_used": "RandomForestRegressor + TF-IDF (Local PKL Model)",
        "risk_score_percentage": round(predicted_risk, 1),
        "risk_level": risk_level,
        "inference_time_ms": round((time.time() - start_time) * 1000, 2)
    }
