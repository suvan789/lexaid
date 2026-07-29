@echo off
REM ============================================================
REM  LexAid — Baseline Load Test (Command Prompt)
REM  100 Virtual Users x 60 Seconds
REM  Target: https://lexaid-api.onrender.com
REM ============================================================

title LexAid Baseline Load Test — 100 VUs x 60s

echo.
echo ============================================================
echo   LEXAID API BASELINE LOAD TEST
echo   Target  : https://lexaid-api.onrender.com
echo   Users   : 100 Virtual Users
echo   Duration: 60 Seconds
echo ============================================================
echo.
echo   What you will see:
echo   - Requests per second (RPS)  e.g. 120 req/sec
echo   - Avg Response Time          e.g. 250ms
echo   - Min Response Time          e.g. 50ms
echo   - Max Response Time          e.g. 1500ms
echo   - P95 and P99 percentiles
echo   - Error rate (target lt 5%%)
echo ============================================================
echo.

REM -- Set working directory
cd /d "d:\Lawaid\lexaid"

REM -- Set environment
set PYTHONUTF8=1
set API_URL=https://lexaid-api.onrender.com
set WEB_URL=https://suvan789.github.io/lexaid
set VUS=100
set DURATION=60
set BUILD_NUMBER=LOAD-CMD-%DATE:~-4%%DATE:~3,2%%DATE:~0,2%

echo [INFO] Warming up API server (Render free-tier cold start)...
echo [INFO] This may take 10-30 seconds on first run...
echo.

REM -- Run the load test
python loadtest\scripts\run_load_test.py

echo.
echo ============================================================
echo   LOAD TEST REPORTS:
echo ============================================================
echo   HTML : loadtest\reports\load-report.html
echo   JSON : loadtest\results\raw.json
echo   MD   : loadtest\reports\summary.md
echo ============================================================
echo.

REM -- Open HTML report in browser
if exist "loadtest\reports\load-report.html" (
    echo [INFO] Opening load test HTML report...
    start "" "loadtest\reports\load-report.html"
)

echo.
echo Press any key to exit...
pause >nul
