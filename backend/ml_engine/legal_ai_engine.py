"""
LexAid AI — TF-IDF Semantic Legal Search Engine
================================================
A pretrained Machine Learning model using:
- TF-IDF Vectorizer (scikit-learn) trained on Indian Legal corpus
- Cosine Similarity for semantic query matching
- 500+ curated Indian Law Q&A pairs
- Zero external API calls — runs 100% on Render cloud server
"""

import os
import re
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ml_engine.legal_knowledge_base import LEGAL_QA_CORPUS

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
VECTORIZER_PATH = os.path.join(MODEL_DIR, "legal_tfidf_vectorizer.pkl")
MATRIX_PATH = os.path.join(MODEL_DIR, "legal_tfidf_matrix.pkl")

# ── Cached global state ──────────────────────────────────────────────────────
_vectorizer: TfidfVectorizer = None
_tfidf_matrix = None
_corpus_answers: list = []


def _build_or_load_model():
    """Build TF-IDF model from legal corpus or load cached version."""
    global _vectorizer, _tfidf_matrix, _corpus_answers

    if _vectorizer is not None:
        return  # Already loaded in memory

    # Prepare corpus
    _corpus_answers = [item["a"] for item in LEGAL_QA_CORPUS]
    corpus_questions = [item["q"] for item in LEGAL_QA_CORPUS]

    # Try loading cached model
    if os.path.exists(VECTORIZER_PATH) and os.path.exists(MATRIX_PATH):
        try:
            _vectorizer = joblib.load(VECTORIZER_PATH)
            _tfidf_matrix = joblib.load(MATRIX_PATH)
            return
        except Exception:
            pass  # Rebuild if corrupted

    # Train TF-IDF vectorizer on legal corpus
    _vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),           # Unigrams, bigrams, trigrams
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,            # Apply log normalization to TF
        analyzer="word",
        stop_words="english",         # Filter out English stop words (what, to, do, my, by, etc.)
        max_features=10000,
    )

    # Fit on full corpus (questions form the index)
    _tfidf_matrix = _vectorizer.fit_transform(corpus_questions)

    # Cache to disk
    try:
        joblib.dump(_vectorizer, VECTORIZER_PATH)
        joblib.dump(_tfidf_matrix, MATRIX_PATH)
    except Exception:
        pass  # Ignore save errors (e.g., read-only filesystem)


def _preprocess(text: str) -> str:
    """Normalize query text."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _domain_intent_classifier(query_lower: str) -> str | None:
    """Fast-path legal domain intent classifier for high precision on core legal topics."""
    # 1. Road Accidents, Bike/Car Collisions & Motor Vehicles
    if any(w in query_lower for w in ["bus", "bike", "crashed", "crash", "collision", "hit", "accident", "mact", "vehicle accident", "knocked down", "run over"]):
        for item in LEGAL_QA_CORPUS:
            if "bike crashed by government bus" in item["q"] or "accident hit and run" in item["q"]:
                return item["a"]

    # 2. Cheque Bounce & Bank Payment Return
    if any(w in query_lower for w in ["cheque", "check", "bounce", "bounced", "dishonour", "dishonored", "section 138"]):
        for item in LEGAL_QA_CORPUS:
            if "cheque bounce" in item["q"]:
                return item["a"]

    # 3. Cyber Fraud, Scam & OTP
    if any(w in query_lower for w in ["cyber", "otp", "scammed", "scam", "phishing", "online fraud", "hacked"]):
        for item in LEGAL_QA_CORPUS:
            if "online fraud" in item["q"] or "cyber crime" in item["q"]:
                return item["a"]

    # 4. Salary, Wages & Labour Dues
    if any(w in query_lower for w in ["salary", "wages", "overtime", "pf not deposited", "epf", "notice period"]):
        for item in LEGAL_QA_CORPUS:
            if "salary dues" in item["q"] or "overtime" in item["q"]:
                return item["a"]

    # 5. Divorce, Marriage & Custody
    if any(w in query_lower for w in ["divorce", "custody", "alimony", "matrimonial", "husband", "wife"]):
        for item in LEGAL_QA_CORPUS:
            if "divorce process" in item["q"] or "hindu marriage act" in item["q"]:
                return item["a"]

    # 6. FIR, Police & Bail
    if any(w in query_lower for w in ["police complaint", "false fir", "anticipatory bail", "arrest"]):
        for item in LEGAL_QA_CORPUS:
            if "false police complaint" in item["q"] or "crpc bnss" in item["q"]:
                return item["a"]

    return None


def semantic_legal_search(query: str, top_k: int = 1, threshold: float = 0.12) -> str | None:
    """
    Find the best matching legal answer for a user query using TF-IDF cosine similarity + Intent Router.
    """
    _build_or_load_model()
    processed = _preprocess(query)

    # Check Intent Router first for exact domain keyword match
    domain_match = _domain_intent_classifier(processed)
    if domain_match:
        return domain_match

    query_vec = _vectorizer.transform([processed])

    # Compute cosine similarity against all corpus questions
    similarities = cosine_similarity(query_vec, _tfidf_matrix).flatten()
    best_idx = int(np.argmax(similarities))
    best_score = float(similarities[best_idx])

    if best_score >= threshold:
        return _corpus_answers[best_idx]

    return None


def get_model_info() -> dict:
    """Return info about the loaded TF-IDF model."""
    _build_or_load_model()
    return {
        "model": "TF-IDF Semantic Retrieval (scikit-learn)",
        "corpus_size": len(LEGAL_QA_CORPUS),
        "vocabulary_size": len(_vectorizer.vocabulary_) if _vectorizer else 0,
        "ngram_range": "(1, 3)",
        "metric": "Cosine Similarity",
        "api_calls": 0,
    }
