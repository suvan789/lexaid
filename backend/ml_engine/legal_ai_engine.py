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
        stop_words=None,              # Keep legal stop words (section, act, etc.)
        max_features=8000,
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


def semantic_legal_search(query: str, top_k: int = 1, threshold: float = 0.08) -> str | None:
    """
    Find the best matching legal answer for a user query using TF-IDF cosine similarity.

    Args:
        query: User's legal question
        top_k: Number of results to consider
        threshold: Minimum similarity score to return a match

    Returns:
        Best matching answer string, or None if no good match
    """
    _build_or_load_model()

    processed = _preprocess(query)
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
