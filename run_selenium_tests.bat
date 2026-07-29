@echo off
REM ============================================================
REM  LexAid — Selenium E2E Tests (Command Prompt)
REM  Run: Double-click OR open cmd.exe and run this file
REM ============================================================

title LexAid Selenium E2E Test Runner

echo.
echo ============================================================
echo   LEXAID SELENIUM E2E TEST RUNNER
echo   Target: https://suvan789.github.io/lexaid/
echo   Tests : 470+ test cases (14 modules)
echo ============================================================
echo.

REM -- Set working directory to project root
cd /d "d:\Lawaid\lexaid"

REM -- Set environment variables
set PYTHONPATH=d:\Lawaid\lexaid
set PYTHONUTF8=1
set BASE_URL=https://suvan789.github.io/lexaid/
set HEADLESS=true
set PASS_THRESHOLD=95.0
set BUILD_NUMBER=CMD-%DATE:~-4%%DATE:~3,2%%DATE:~0,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%

echo [INFO] Build Number: %BUILD_NUMBER%
echo [INFO] Target URL  : %BASE_URL%
echo [INFO] Starting tests in 3 seconds...
echo.
timeout /t 3 /nobreak >nul

REM -- Run the Selenium test suite
python automation\selenium\run_selenium_tests.py

REM -- Show report paths
echo.
echo ============================================================
echo   REPORTS GENERATED:
echo ============================================================
echo   HTML : automation\selenium\reports\HTML\execution-report.html
echo   Excel: automation\selenium\reports\Excel\Automation_Test_Report.xlsx
echo   JSON : automation\selenium\reports\JSON\execution-results.json
echo   Logs : automation\selenium\reports\Logs\
echo ============================================================
echo.

REM -- Open HTML report automatically in browser
if exist "automation\selenium\reports\HTML\execution-report.html" (
    echo [INFO] Opening HTML report in browser...
    start "" "automation\selenium\reports\HTML\execution-report.html"
)

REM -- Open Excel report
if exist "automation\selenium\reports\Excel\Automation_Test_Report.xlsx" (
    echo [INFO] Opening Excel report...
    start "" "automation\selenium\reports\Excel\Automation_Test_Report.xlsx"
)

echo.
echo Press any key to exit...
pause >nul
