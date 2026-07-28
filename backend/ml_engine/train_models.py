import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# ───────────────────────────────────────────────────────────────
# 1. CLAUSE-LEVEL INDIAN ACT CLASSIFIER DATASET
# ───────────────────────────────────────────────────────────────
CLAUSE_ACT_DATASET = [
    # Rent & Lease Clauses
    ("Tenant shall pay monthly rent on or before 5th of each calendar month into Landlord bank account.",
     {"act": "State Rent Control Regulations & Indian Contract Act 1872", "section": "Section 105, Transfer of Property Act, 1882", "rights": "Right to receipt for rent paid under Rent Control Act."}),

    ("Security deposit of 6 months rent shall be deposited with landlord and refunded upon peaceful vacating of premises.",
     {"act": "Transfer of Property Act, 1882", "section": "Section 108(b), Transfer of Property Act, 1882", "rights": "Right to full refund of security deposit minus legitimate damage repairs."}),

    ("Either party may terminate lease agreement by giving 30 days prior written notice to the other party.",
     {"act": "Transfer of Property Act, 1882", "section": "Section 106, Transfer of Property Act, 1882", "rights": "Right to 15 to 30 days statutory notice period prior to lease eviction."}),

    ("Tenant shall not sublet, assign, or re-rent the premises to any third party without explicit written consent of landlord.",
     {"act": "Transfer of Property Act, 1882", "section": "Section 108(j), Transfer of Property Act, 1882", "rights": "Landlord retains absolute right to restrict unauthorized subletting."}),

    ("Tenant shall maintain premises in good tenantable condition and pay routine electricity and water utility bills.",
     {"act": "Transfer of Property Act, 1882", "section": "Section 108(m), Transfer of Property Act, 1882", "rights": "Landlord responsible for major structural repairs; Tenant pays utilities."}),

    # Contract & Liability Clauses
    ("Party A shall indemnify, defend, and hold harmless Party B against all third party claims, legal costs, and damages without limitation.",
     {"act": "Indian Contract Act, 1872", "section": "Section 124 & Section 125, Indian Contract Act, 1872", "rights": "Indemnified party entitled to recover all damages & costs ordered by court."}),

    ("If payment is delayed by more than 5 days, late penalty interest shall be charged at 24% per annum.",
     {"act": "Indian Contract Act, 1872", "section": "Section 74, Indian Contract Act, 1872 (Penalty Clauses)", "rights": "Court may reduce exorbitant penalty rates to reasonable compensation under Section 74."}),

    ("All disputes arising out of this agreement shall be referred to sole arbitrator in accordance with Arbitration Act.",
     {"act": "Arbitration and Conciliation Act, 1996", "section": "Section 7, Arbitration and Conciliation Act, 1996", "rights": "Right to impartial arbitration before initiating civil suit."}),

    ("Employee agrees not to join competing companies or start competing business for 2 years after resignation.",
     {"act": "Indian Contract Act, 1872", "section": "Section 27, Indian Contract Act, 1872", "rights": "VOID UNDER INDIAN LAW: Section 27 prohibits post-employment non-compete restraints."}),

    ("Receiving party agrees not to disclose source code, trade secrets, or customer data to third parties.",
     {"act": "Information Technology Act, 2000 & Contract Act", "section": "Section 43A & Section 72A, Information Technology Act, 2000", "rights": "Right to claim compensation for data breach & criminal prosecution under Section 72A IT Act."})
]

# ───────────────────────────────────────────────────────────────
# 2. PRECEDENT & OUTCOME DATASETS
# ───────────────────────────────────────────────────────────────
CASE_DATASET = [
    ("Petitioner accused under IPC Section 420 for cheating. First time offender, full cooperation.", "Favorable (Bail Granted / High Win Chance)"),
    ("Accused charged under Section 420 IPC for running fraudulent chit fund scheme.", "Unfavorable (Bail Denied / High Risk of Conviction)"),
    ("Cheque bounce complaint under Section 138 NI Act. Notice served, cheque returned.", "Favorable (High Conviction & Recovery Chance)")
]

LOOPHOLE_DATASET = [
    ("Party A shall indemnify and hold harmless Party B without any monetary cap.", "Uncapped Indemnity Trap"),
    ("Company reserves right to unilaterally modify fees and terms without consent.", "Unilateral Modification Clause"),
    ("Either party may terminate by 30 days notice.", "Standard Fair Clause")
]

SETTLEMENT_DATASET = [
    ("Property dispute in High Court involving land valuation of 1 crore", 450000.0),
    ("Section 138 NI Act cheque bounce case for recovery of 5 lakhs", 35000.0),
    ("Consumer court complaint against defective product", 8000.0)
]

def train_and_save_all():
    print("[ML ENGINE] Training Clause-Level Indian Statutory Act ML Classifier...")

    # --- 1. Train Clause-Level Indian Act Classifier ---
    clause_texts = [item[0] for item in CLAUSE_ACT_DATASET]
    clause_labels = [item[1]["act"] for item in CLAUSE_ACT_DATASET]

    clause_act_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1500, stop_words='english')),
        ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    clause_act_pipeline.fit(clause_texts, clause_labels)
    print("Clause-Level Indian Statutory Act Model Trained!")

    # --- 2. Train Outcome, Loophole, and Settlement Models ---
    c_texts, c_labels = zip(*CASE_DATASET)
    outcome_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000, stop_words='english')),
        ('gbc', GradientBoostingClassifier(n_estimators=50, random_state=42))
    ])
    outcome_pipeline.fit(c_texts, c_labels)

    l_texts, l_labels = zip(*LOOPHOLE_DATASET)
    loophole_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000, stop_words='english')),
        ('rf', RandomForestClassifier(n_estimators=50, random_state=42))
    ])
    loophole_pipeline.fit(l_texts, l_labels)

    s_texts, s_amounts = zip(*SETTLEMENT_DATASET)
    settlement_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=500, stop_words='english')),
        ('regressor', RandomForestRegressor(n_estimators=50, random_state=42))
    ])
    settlement_pipeline.fit(s_texts, s_amounts)

    # Export PKL model binaries
    joblib.dump(clause_act_pipeline, os.path.join(MODEL_DIR, 'clause_act_classifier.pkl'))
    joblib.dump(outcome_pipeline, os.path.join(MODEL_DIR, 'case_outcome_model.pkl'))
    joblib.dump(loophole_pipeline, os.path.join(MODEL_DIR, 'loophole_detector_model.pkl'))
    joblib.dump(settlement_pipeline, os.path.join(MODEL_DIR, 'settlement_regressor.pkl'))

    print(f"Saved Clause-Level Indian Statutory Act ML Model (clause_act_classifier.pkl) to {MODEL_DIR}")

if __name__ == "__main__":
    train_and_save_all()
