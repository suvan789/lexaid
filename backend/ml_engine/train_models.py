import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

# Directory for saved PKL models
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── 1. Synthetic Legal Training Dataset ────────────────────────
TRAINING_DATA = [
    # Non-Disclosure Agreement (NDA)
    ("This Non-Disclosure Agreement is made between Disclosing Party and Receiving Party to protect proprietary trade secrets, technical specifications, customer lists, and confidential business information. Receiving party agrees not to disclose information for a period of 3 years.", "Non-Disclosure Agreement (NDA)"),
    ("Confidentiality agreement protecting proprietary source code, financial projections, business strategy, and intellectual property. Unauthorized disclosure shall result in injunctive relief and liquidated damages.", "Non-Disclosure Agreement (NDA)"),
    ("The Recipient agrees that all written and oral information marked confidential shall remain the sole property of the Discloser and shall not be copied or shared with third parties without written authorization.", "Non-Disclosure Agreement (NDA)"),
    ("Trade secrets, operational data, and technical know-how disclosed during discussion shall be kept strictly confidential by both entities under this Mutual NDA.", "Non-Disclosure Agreement (NDA)"),

    # Rent & Lease Agreement
    ("This Deed of Lease Agreement is entered into between Lessor (Landlord) and Lessee (Tenant) for the residential premises situated at Flat 402. The monthly rent is fixed at INR 25,000 per month payable on or before 5th of each calendar month.", "Rent & Lease Agreement"),
    ("Tenancy agreement for commercial shop premises. Security deposit of 6 months rent deposited. Tenant responsible for electricity charges, water bill, maintenance fees, and routine repairs.", "Rent & Lease Agreement"),
    ("Rental contract specifying lease period of 11 months with automatic renewal option. Lock-in period is 6 months. Landlord retains right to inspect premises with 24 hours prior written notice.", "Rent & Lease Agreement"),
    ("House lease agreement between owner and tenant. Subletting prohibited without landlord consent. Notice period of 2 months required for lease termination by either party.", "Rent & Lease Agreement"),

    # Employment Contract
    ("Employment agreement between Company and Employee appointing the candidate as Senior Software Developer. Probation period shall be 6 months. Salary and remuneration package structured as per Annexure A.", "Employment Contract"),
    ("Non-compete and non-solicitation clauses in employment contract. Employee agrees not to join competing firms within 12 months of resignation. Notice period is 60 days or salary in lieu thereof.", "Employment Contract"),
    ("Service agreement outlining job responsibilities, working hours, annual leave entitlements, medical insurance, IP assignment, and termination provisions for full-time employee.", "Employment Contract"),
    ("Offer letter and contract of service detailing probation completion metrics, Code of Conduct compliance, confidentiality obligations, and severance terms.", "Employment Contract"),

    # Power of Attorney
    ("General Power of Attorney granted by Principal to Attorney to manage, sell, lease, transfer, and register immovable property situated in Chennai, Tamil Nadu. Principal ratifies all lawful acts executed by Attorney.", "Power of Attorney"),
    ("Special Power of Attorney executed for representation in District Civil Court, signing pleadings, depositing court fees, appointing advocates, and prosecuting legal proceedings.", "Power of Attorney"),
    ("Irrevocable Power of Attorney authorizing bank or financial institution to sell mortgaged property upon default of loan repayment under SARFAESI Act provisions.", "Power of Attorney"),

    # Legal Notice
    ("Legal Notice issued under Section 138 of Negotiable Instruments Act for dishonoured cheque bearing number 405912 drawn on HDFC Bank. You are called upon to make payment within 15 days of receipt.", "Legal Notice & Demand"),
    ("Advocate notice issued for breach of contract and recovery of outstanding dues of INR 15,00,000 along with 18% interest per annum. Failure to comply shall lead to civil suit and criminal prosecution.", "Legal Notice & Demand"),
    ("Demand notice for eviction of tenant from residential premises due to non-payment of rent for 4 consecutive months and unlawful alterations made to building structure.", "Legal Notice & Demand"),

    # Partnership & Business Agreement
    ("Partnership Deed executed between Partner A and Partner B to carry on business of digital logistics under partnership firm name. Profit and loss sharing ratio fixed at 60:40.", "Partnership Deed"),
    ("Joint Venture Agreement establishing capital contributions, management board structure, profit distribution, dispute resolution via arbitration in Mumbai, and dissolution procedure.", "Partnership Deed"),

    # Last Will & Testament
    ("This is the Last Will and Testament of the Testator executed in sound mind. I hereby revoke all prior wills and codicils. I bequeath my residential property, bank deposits, and shares to my lawful heirs.", "Will & Testament"),
    ("Registered Will appointing Executor to administer estate assets, pay outstanding debts, and distribute jewelry, real estate, and mutual funds among beneficiaries as specified.", "Will & Testament")
]

# ─── 2. Synthetic Risk Dataset ─────────────────────────────────
RISK_DATA = [
    ("Party A shall indemnify, defend, and hold harmless Party B against any and all claims, losses, damages, liabilities, costs, and expenses without any limitation of liability.", 95.0),
    ("Standard commercial agreement with standard notice period of 30 days and standard dispute resolution via Indian courts.", 15.0),
    ("Immediate termination without cause permitted by Landlord without returning security deposit. Penalty interest rate of 36% per annum charged on late payments.", 88.0),
    ("Employee agrees to 3 years lock-in period with liquidated damages of INR 10,00,000 for early resignation.", 82.0),
    ("Sub-lease permitted with written approval of owner. Standard 11 month duration with 10% rent escalation after 11 months.", 20.0),
    ("Discloser may terminate confidentiality agreement upon 15 days notice. All confidential material shall be returned immediately.", 25.0),
    ("Unilateral right to alter pricing, fees, and terms at sole discretion without consent of client. Exclusive jurisdiction restricted to foreign court.", 90.0)
]

def train_and_save():
    print("[ML ENGINE] Training Local Scikit-Learn Models...")
    
    # --- Train Document Classifier (TF-IDF + Random Forest) ---
    texts, labels = zip(*TRAINING_DATA)
    
    classifier_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=1000, stop_words='english')),
        ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    classifier_pipeline.fit(texts, labels)
    train_acc = accuracy_score(labels, classifier_pipeline.predict(texts))
    print(f"Document Classifier Model Trained! Accuracy: {train_acc * 100:.1f}%")
    
    # --- Train Risk Regressor (TF-IDF + Random Forest Regressor) ---
    risk_texts, risk_scores = zip(*RISK_DATA)
    
    risk_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=500, stop_words='english')),
        ('regressor', RandomForestRegressor(n_estimators=50, random_state=42))
    ])
    risk_pipeline.fit(risk_texts, risk_scores)
    print("Legal Risk Regressor Model Trained!")

    # Save trained model binaries
    joblib.dump(classifier_pipeline, os.path.join(MODEL_DIR, 'doc_classifier.pkl'))
    joblib.dump(risk_pipeline, os.path.join(MODEL_DIR, 'risk_regressor.pkl'))
    
    print(f"Saved ML PKL Model Artifacts to {MODEL_DIR}")
    return train_acc

if __name__ == "__main__":
    train_and_save()
