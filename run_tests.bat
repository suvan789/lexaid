@echo off
REM ============================================================
REM  LexAid — Run ALL Tests (Selenium E2E + Load Test)
REM  Complete Test Suite from Command Prompt
REM ============================================================

title LexAid — Complete Test Suite

echo.
echo ============================================================
echo   LEXAID COMPLETE TEST SUITE
echo   1. Selenium E2E  — 470 tests vs GitHub Pages
echo   2. Load Test     — 100 VUs x 60s vs Live API
echo ============================================================
echo.

cd /d "d:\Lawaid\lexaid"
set PYTHONUTF8=1
set PYTHONPATH=d:\Lawaid\lexaid
set BASE_URL=https://suvan789.github.io/lexaid/
set API_URL=https://lexaid-api.onrender.com
set HEADLESS=true

echo Which test do you want to run?
echo.
echo   [1] Selenium E2E Tests  (470 test cases vs GitHub Pages)
echo   [2] Baseline Load Test  (100 VUs x 60s vs Live API)
echo   [3] Run BOTH Tests
echo   [4] Launch Mobile App in Expo Go (Scan QR on Mobile)
echo   [5] Exit
echo.
set /p CHOICE=Enter choice (1/2/3/4/5): 

if "%CHOICE%"=="1" goto SELENIUM
if "%CHOICE%"=="2" goto LOADTEST
if "%CHOICE%"=="3" goto BOTH
if "%CHOICE%"=="4" goto EXPO
if "%CHOICE%"=="5" goto EXIT

:SELENIUM
echo.
echo ============================================================
echo   RUNNING SELENIUM E2E TESTS
echo ============================================================
echo.
python automation\selenium\run_selenium_tests.py
echo.
if exist "automation\selenium\reports\HTML\execution-report.html" (
    echo [OK] Opening HTML Report...
    start "" "automation\selenium\reports\HTML\execution-report.html"
)
if exist "automation\selenium\reports\Excel\Automation_Test_Report.xlsx" (
    echo [OK] Opening Excel Report...
    start "" "automation\selenium\reports\Excel\Automation_Test_Report.xlsx"
)
goto END

:LOADTEST
echo.
echo ============================================================
echo   RUNNING BASELINE LOAD TEST
echo ============================================================
echo.
python loadtest\scripts\run_load_test.py
echo.
if exist "loadtest\reports\load-report.html" (
    echo [OK] Opening Load Test HTML Report...
    start "" "loadtest\reports\load-report.html"
)
goto END

:EXPO
echo.
echo ============================================================
echo   STARTING EXPO GO SERVER
echo ============================================================
echo.
cd /d "d:\Lawaid\lexaid\mobile-app"
npx expo start
goto END

:BOTH
echo.
echo ============================================================
echo   STEP 1/2 — SELENIUM E2E TESTS
echo ============================================================
python automation\selenium\run_selenium_tests.py
echo.
echo ============================================================
echo   STEP 2/2 — BASELINE LOAD TEST
echo ============================================================
python loadtest\scripts\run_load_test.py
echo.
if exist "automation\selenium\reports\HTML\execution-report.html" (
    start "" "automation\selenium\reports\HTML\execution-report.html"
)
if exist "loadtest\reports\load-report.html" (
    start "" "loadtest\reports\load-report.html"
)
if exist "automation\selenium\reports\Excel\Automation_Test_Report.xlsx" (
    start "" "automation\selenium\reports\Excel\Automation_Test_Report.xlsx"
)
goto END

:EXIT
echo Exiting...
exit /b 0

:END
echo.
echo ============================================================
echo   ALL DONE! Reports opened automatically.
echo ============================================================
echo.
pause
