@echo off
chcp 65001 >nul 2>&1

echo.
echo サーバーを停止しています...
echo.

:: Kill all Node.js processes related to this project
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel%==0 (
    echo [OK] サーバーを停止しました
) else (
    echo [INFO] 実行中のサーバーはありませんでした
)

echo.
timeout /t 3
