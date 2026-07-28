import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Database of Landmark Indian Supreme Court & High Court Precedents
LANDMARK_PRECEDENTS = [
    {
        "case_name": "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
        "court": "Supreme Court of India",
        "legal_topic": "Section 498A IPC & Arrest Guidelines",
        "summary": "Mandatory 41A CrPC notice prior to arrest in offences punishable with less than 7 years imprisonment. Automatic arrest prohibited in matrimonial disputes."
    },
    {
        "case_name": "Dashrath Rupsingh Rathod v. State of Maharashtra (2014) 9 SCC 129",
        "court": "Supreme Court of India",
        "legal_topic": "Section 138 NI Act Cheque Bounce Jurisdiction",
        "summary": "Cheque dishonour complaint can be filed in the court within whose local jurisdiction the branch of the bank where the payee maintains the account is situated."
    },
    {
        "case_name": "Satender Kumar Antil v. CBI (2022) 10 SCC 51",
        "court": "Supreme Court of India",
        "legal_topic": "Bail Policy & Pre-trial Detention",
        "summary": "Detailed categorisation of offences for granting bail. Undertrials should not be detained indefinitely; bail is the rule and jail is the exception."
    },
    {
        "case_name": "Vidya Drolia v. Durga Trading Corp (2021) 2 SCC 1",
        "court": "Supreme Court of India",
        "legal_topic": "Landlord-Tenant Disputes Arbitrability",
        "summary": "Landlord-tenant disputes governed by special rent control acts are non-arbitrable, but disputes under Transfer of Property Act are arbitrable."
    },
    {
        "case_name": "Kalyani Transco v. Gujarat Gas Ltd (2024)",
        "court": "High Court of Gujarat",
        "legal_topic": "Uncapped Indemnity & Commercial Contracts",
        "summary": "Indemnity clauses without monetary caps must be strictly construed against the drafting party under the principle of contra proferentem."
    }
]

# Initialize TF-IDF Vectorizer over Precedents
summaries = [p["summary"] + " " + p["legal_topic"] for p in LANDMARK_PRECEDENTS]
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
precedent_vectors = vectorizer.fit_transform(summaries)

def find_matching_precedents(query_text: str, top_k: int = 3):
    """Calculate Cosine Similarity between user case facts and Supreme Court Precedents."""
    if not query_text or len(query_text.strip()) < 10:
        return []

    query_vector = vectorizer.transform([query_text])
    similarities = cosine_similarity(query_vector, precedent_vectors)[0]

    matched_results = []
    for idx in similarities.argsort()[::-1][:top_k]:
        sim_score = float(similarities[idx])
        if sim_score > 0.05:
            item = LANDMARK_PRECEDENTS[idx].copy()
            item["similarity_match_percentage"] = round(sim_score * 100, 2)
            matched_results.append(item)

    return matched_results
