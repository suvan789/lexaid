"""
LexAid Selenium E2E Automation Framework — Global Configuration
==============================================================
All tests run EXCLUSIVELY against the LIVE GitHub Pages deployment.
Never runs against localhost or local dev servers.
"""

import os
from datetime import datetime

# ─────────────────────────────────────────────────────────
# LIVE DEPLOYMENT URL  (always GitHub Pages — never localhost)
# ─────────────────────────────────────────────────────────
BASE_URL = os.environ.get("BASE_URL", "https://suvan789.github.io/lexaid/").rstrip("/")

# ─────────────────────────────────────────────────────────
# Browser Settings
# ─────────────────────────────────────────────────────────
HEADLESS        = os.environ.get("HEADLESS", "true").lower() == "true"
BROWSER         = os.environ.get("BROWSER", "chrome")
PAGE_LOAD_TIMEOUT   = int(os.environ.get("PAGE_LOAD_TIMEOUT", "30"))
IMPLICIT_WAIT       = int(os.environ.get("IMPLICIT_WAIT", "10"))
EXPLICIT_WAIT       = int(os.environ.get("EXPLICIT_WAIT", "15"))

# ─────────────────────────────────────────────────────────
# Test Execution
# ─────────────────────────────────────────────────────────
RETRY_COUNT         = int(os.environ.get("RETRY_COUNT", "2"))
PARALLEL_WORKERS    = int(os.environ.get("PARALLEL_WORKERS", "3"))
PASS_THRESHOLD      = float(os.environ.get("PASS_THRESHOLD", "95.0"))  # 95% required

# ─────────────────────────────────────────────────────────
# Report Paths
# ─────────────────────────────────────────────────────────
ROOT_DIR            = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR         = os.path.join(ROOT_DIR, "reports")
EXCEL_DIR           = os.path.join(REPORTS_DIR, "Excel")
HTML_DIR            = os.path.join(REPORTS_DIR, "HTML")
SCREENSHOTS_DIR     = os.path.join(REPORTS_DIR, "Screenshots")
LOGS_DIR            = os.path.join(REPORTS_DIR, "Logs")
JSON_DIR            = os.path.join(REPORTS_DIR, "JSON")
SUMMARY_DIR         = os.path.join(REPORTS_DIR, "Summary")

# ─────────────────────────────────────────────────────────
# Build Info
# ─────────────────────────────────────────────────────────
BUILD_NUMBER        = os.environ.get("GITHUB_RUN_NUMBER", f"LOCAL-{datetime.now().strftime('%Y%m%d%H%M%S')}")
GIT_COMMIT          = os.environ.get("GITHUB_SHA", "local-commit")[:8]
BRANCH              = os.environ.get("GITHUB_REF_NAME", "main")
EXECUTION_TIMESTAMP = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# ─────────────────────────────────────────────────────────
# Test Credentials  (used in auth test cases)
# ─────────────────────────────────────────────────────────
VALID_EMAIL         = os.environ.get("TEST_EMAIL", "suvansenthils@gmail.com")
VALID_PASSWORD      = os.environ.get("TEST_PASSWORD", "password123")
ADVOCATE_EMAIL      = os.environ.get("ADVOCATE_EMAIL", "flowfored@gmail.com")
ADVOCATE_PASSWORD   = os.environ.get("ADVOCATE_PASSWORD", "password123")
INVALID_EMAIL       = "invalid.selenium.test@nonexistent.xyz"
INVALID_PASSWORD    = "WrongPassword000#"
