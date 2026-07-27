@echo off
echo ============================================
echo   LexAid Android APK Builder
echo ============================================
echo.

echo [1/4] Building React production app...
cd /d "d:\Lawaid\lexaid\frontend-web"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)
echo    React build complete!
echo.

echo [2/4] Syncing with Android platform...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo    Sync complete!
echo.

echo [3/4] Building Android Debug APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Gradle build failed! Make sure Android Studio is installed.
    echo Download from: https://developer.android.com/studio
    pause
    exit /b 1
)
echo    APK built successfully!
echo.

echo [4/4] Done!
echo ============================================
echo   APK Location:
echo   d:\Lawaid\lexaid\frontend-web\android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================
echo.
echo Send this APK file to your Android friends!
echo They can install it directly on their phone.
echo.
pause
