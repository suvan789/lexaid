import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# ───────────────────────────────────────────────────────────────
# FULL INDIAN STATUTORY LAWS TRAINING DATASET (25+ ACTS & SECTIONS)
# ───────────────────────────────────────────────────────────────
STATUTORY_LAW_DATASET = [
    # --- 1. RENT & REAL ESTATE (Transfer of Property Act 1882 & Rent Control) ---
    ("Tenant agrees to pay monthly rent into Landlord account on or before 5th of each month.",
     "Section 105, Transfer of Property Act, 1882"),

    ("Security deposit paid by Tenant shall be refunded by Landlord upon vacating the premises.",
     "Section 108(b), Transfer of Property Act, 1882"),

    ("Either party may terminate the lease agreement by serving a 30-day written notice.",
     "Section 106, Transfer of Property Act, 1882"),

    ("Tenant shall not sublet, assign, or re-rent the premises without explicit written consent.",
     "Section 108(j), Transfer of Property Act, 1882"),

    ("Tenant shall maintain property in good tenantable repair and pay utility electricity bills.",
     "Section 108(m), Transfer of Property Act, 1882"),

    ("Landlord agrees to let out residential flat for an 11 month period with renewal option.",
     "Section 107, Transfer of Property Act, 1882 & Registration Act, 1908"),

    # --- 2. CONTRACTS & COMMERCIAL (Indian Contract Act 1872) ---
    ("Party A agrees to indemnify and hold harmless Party B against all legal losses and third party claims.",
     "Section 124 & 125, Indian Contract Act, 1872"),

    ("If payment is delayed, penalty interest of 24% per annum shall be charged on outstanding dues.",
     "Section 74, Indian Contract Act, 1872 (Penalty Provisions)"),

    ("Neither party shall be liable for delay in performance caused by natural disasters or force majeure.",
     "Section 56, Indian Contract Act, 1872 (Frustration of Contract)"),

    ("Employee agrees not to join any competing firm or start competing business post resignation.",
     "Section 27, Indian Contract Act, 1872 (Restraint of Trade Void)"),

    ("This agreement constitutes the entire understanding between the parties and supersedes all prior agreements.",
     "Section 10 & Section 37, Indian Contract Act, 1872"),

    # --- 3. ARBITRATION & JURISDICTION (Arbitration Act 1996 & CPC 1908) ---
    ("All disputes shall be referred to a sole arbitrator in accordance with the Arbitration and Conciliation Act.",
     "Section 7, Arbitration and Conciliation Act, 1996"),

    ("Subject to exclusive jurisdiction of the civil courts located in Chennai, Tamil Nadu.",
     "Section 20, Code of Civil Procedure, 1908 (CPC)"),

    # --- 4. IT ACT & CONFIDENTIALITY (Information Technology Act 2000) ---
    ("Receiving party agrees not to disclose source code, trade secrets, or customer data to third parties.",
     "Section 43A & Section 72A, Information Technology Act, 2000"),

    ("Employee agrees that all patents, software code, and inventions created shall be owned solely by Company.",
     "Section 17, Copyright Act, 1957 & Patents Act, 1970"),

    # --- 5. CHEQUES & BANKING (Negotiable Instruments Act 1881) ---
    ("Cheque issued towards discharge of legal debt dishonoured due to insufficiency of funds.",
     "Section 138, Negotiable Instruments Act, 1881"),

    # --- 6. CRIMINAL & MATRIMONIAL (IPC / BNS 2023 & CrPC / BNSS 2023) ---
    ("Accused charged with cheating, forgery, and dishonestly inducing delivery of property.",
     "Section 420 IPC / Section 318 BNS 2023"),

    ("Matrimonial dispute involving allegations of harassment, dowry demand, or physical cruelty.",
     "Section 498A IPC & Protection of Women from Domestic Violence Act, 2005"),

    ("Statutory notice of appearance issued by police prior to arrest in offences punishable under 7 years.",
     "Section 41A CrPC / Section 35 BNSS 2023")
]

# Case Outcome & Loophole Datasets
CASE_DATASET = [
    ("Petitioner accused under IPC Section 420 for cheating. First time offender with no prior criminal record.", "Favorable (Bail Granted / High Win Chance)"),
    ("Accused charged under Section 420 IPC for running fraudulent scheme defrauding 200 investors.", "Unfavorable (Bail Denied / High Risk of Conviction)"),
    ("Cheque bounce complaint under Section 138 NI Act with statutory notice served.", "Favorable (High Conviction & Recovery Chance)")
]

LOOPHOLE_DATASET = [
    ("Party A shall indemnify Party B without any monetary cap or limitation.", "Uncapped Indemnity Trap"),
    ("Company reserves right to modify fees at any time without notice.", "Unilateral Modification Clause"),
    ("Either party may terminate agreement by giving 30 days notice.", "Standard Fair Clause")
]

SETTLEMENT_DATASET = [
    ("Property dispute in High Court involving land valuation of 1 crore", 450000.0),
    ("Section 138 NI Act cheque bounce case for recovery of 5 lakhs", 35000.0)
]

def train_and_save_all():
    print("[ML ENGINE] Training Full Indian Statutory Laws Multi-Class Model...")

    texts = [item[0] for item in STATUTORY_LAW_DATASET]
    labels = [item[1] for item in STATUTORY_LAW_DATASET]

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=2500, stop_words='english')),
        ('rf', RandomForestClassifier(n_estimators=150, random_state=42))
    ])
    pipeline.fit(texts, labels)
    acc = accuracy_score(labels, pipeline.predict(texts))
    print(f"Full Indian Statutory Laws Classifier Model Trained! Accuracy: {acc * 100:.1f}%")

    # Auxiliary models
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

    # Export binaries
    joblib.dump(pipeline, os.path.join(MODEL_DIR, 'clause_act_classifier.pkl'))
    joblib.dump(outcome_pipeline, os.path.join(MODEL_DIR, 'case_outcome_model.pkl'))
    joblib.dump(loophole_pipeline, os.path.join(MODEL_DIR, 'loophole_detector_model.pkl'))
    joblib.dump(settlement_pipeline, os.path.join(MODEL_DIR, 'settlement_regressor.pkl'))

    print(f"Saved Full Indian Statutory Laws Model (clause_act_classifier.pkl) to {MODEL_DIR}")

if __name__ == "__main__":
    train_and_save_all()
