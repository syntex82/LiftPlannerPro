@echo off
echo ========================================
echo Clean Build Script for Lift Planner Pro
echo ========================================
echo.

echo 🧹 Cleaning build artifacts...
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ Removed .next directory
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Removed node_modules cache
)

echo.
echo 📦 Reinstalling dependencies...
call npm install

echo.
echo 🔨 Building for production...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo 🚀 Ready to start production server:
echo   npm start
echo.
pause
