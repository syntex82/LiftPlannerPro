@echo off
echo ========================================
echo Starting Lift Planner Pro Production
echo ========================================
echo.

echo 🔍 Checking for build...
if not exist ".next" (
    echo ⚠️ No build found. Starting in development mode...
    echo.
    echo 🚀 Starting development server with production features...
    call npm run dev
) else (
    echo ✅ Build found. Starting production server...
    echo.
    echo 🚀 Starting production server...
    call npm start
)

pause
