@echo off
REM ============================================================
REM  LexAid — Launch Mobile App in Expo Go
REM  Scan QR Code with Expo Go app on iPhone / Android
REM ============================================================

title LexAid — Expo Go Mobile App Server

echo.
echo ============================================================
echo   LEXAID MOBILE APP — EXPO GO SERVER
echo ============================================================
echo.
echo   1. Install "Expo Go" on your phone (App Store / Play Store)
echo   2. Scan the QR code that appears below
echo   3. Your LexAid mobile app will open on your phone!
echo ============================================================
echo.

cd /d "d:\Lawaid\lexaid\mobile-app"

echo [INFO] Installing Expo dependencies if needed...
call npm install --legacy-peer-deps

echo.
echo [INFO] Starting Expo Development Server...
echo [INFO] A QR Code will be displayed below in a moment...
echo.

npx expo start --tunnel

pause
