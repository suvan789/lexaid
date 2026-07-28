import re
from datetime import datetime, timedelta

# Statutory Limitation Rules under Limitation Act, 1963
LIMITATION_RULES = [
    {"pattern": r"138|cheque|bounce|negotiable", "category": "Section 138 NI Act", "days": 30, "description": "Legal notice must be served within 30 days of cheque return memo."},
    {"pattern": r"rent|eviction|tenant|lease", "category": "Rent & Tenant Disputes", "days": 1095, "description": "Limitation period for recovery of rent arrears is 3 years (1095 days)."},
    {"pattern": r"debt|recovery|loan|unpaid dues", "category": "Debt & Dues Recovery", "days": 1095, "description": "Suit for money recovery must be filed within 3 years from cause of action date."},
    {"pattern": r"consumer|defective|deficiency", "category": "Consumer Protection Claim", "days": 730, "description": "Consumer complaint must be filed within 2 years (730 days) from cause of action."},
    {"pattern": r"mact|accident|compensation", "category": "Motor Accident Claim", "days": 180, "description": "MACT claim petition should be filed within 6 months (180 days) under MV Act 2019."}
]

def calculate_limitation_status(case_text: str, cause_of_action_date_str: str = None):
    """Calculate statutory limitation period deadline under Indian Limitation Act 1963."""
    lower = case_text.lower()
    matched_rule = LIMITATION_RULES[1] # Default to Debt recovery 3 years

    for rule in LIMITATION_RULES:
        if re.search(rule["pattern"], lower):
            matched_rule = rule
            break

    # Parse cause of action date
    today = datetime.now()
    coa_date = today - timedelta(days=120) # Default to 4 months ago if not specified

    if cause_of_action_date_str:
        try:
            coa_date = datetime.strptime(cause_of_action_date_str, "%Y-%m-%d")
        except ValueError:
            pass

    deadline_date = coa_date + timedelta(days=matched_rule["days"])
    days_remaining = (deadline_date - today).days

    status = "Active & Within Limitation"
    if days_remaining < 0:
        status = "EXPIRED - Time Barred under Limitation Act"
    elif days_remaining < 30:
        status = "CRITICAL - Less than 30 days remaining!"

    return {
        "statutory_category": matched_rule["category"],
        "prescribed_limitation_days": matched_rule["days"],
        "legal_rule_description": matched_rule["description"],
        "cause_of_action_date": coa_date.strftime("%Y-%m-%d"),
        "limitation_deadline_date": deadline_date.strftime("%Y-%m-%d"),
        "days_remaining": days_remaining,
        "limitation_status": status
    }
