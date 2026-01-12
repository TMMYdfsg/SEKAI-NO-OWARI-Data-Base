@echo off
chcp 65001 >nul 2>&1
title SEKAI NO OWARI Database

cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║       S E K A I   N O   O W A R I   D a t a b a s e         ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if port 3000 is already in use
netstat -an | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [INFO] サーバーは既に起動中です (ポート 3000)
    echo [INFO] ブラウザを開いています...
    timeout /t 1 /nobreak >nul
    start "" "http://localhost:3000"
    echo.
    echo このウィンドウは閉じて構いません。
    timeout /t 5
    exit /b 0
)

echo [START] サーバーを起動しています...
echo.

:: Start the server in background
start /min "" cmd /c "npm run dev"

:: Wait for server to start
echo [WAIT] サーバーの準備を待っています...
:wait_loop
timeout /t 1 /nobreak >nul
netstat -an | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel% neq 0 goto wait_loop

echo [OK] サーバーが起動しました！
echo [INFO] ブラウザを開いています...
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ══════════════════════════════════════════════════════════════
echo   サーバーはバックグラウンドで実行中です
echo   終了するには: タスクマネージャーで node.exe を終了してください
echo   または: npm run コマンドを実行しているウィンドウを閉じてください
echo ══════════════════════════════════════════════════════════════
echo.
echo このウィンドウは自動的に閉じます...
timeout /t 5
