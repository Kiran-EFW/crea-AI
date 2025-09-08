@echo off
REM Crea Development Server Runner - Batch Version
REM Simple batch script for running Crea application

REM Parse command line arguments
set CLEAN=0
set INSTALL=0
set FORCEREBUILD=0
set VERBOSE=0
set HELP=0

:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="-clean" set CLEAN=1
if /i "%~1"=="-install" set INSTALL=1
if /i "%~1"=="-forcerebuild" set FORCEREBUILD=1
if /i "%~1"=="-verbose" set VERBOSE=1
if /i "%~1"=="-help" set HELP=1
if /i "%~1"=="/?" set HELP=1
shift
goto :parse_args
:end_parse

REM Show help if requested
if %HELP%==1 goto :show_help

REM Header
echo ======================================
echo     Crea Development Server
echo ======================================
echo.

REM Clean if requested
if %CLEAN%==1 (
    echo [CLEAN] Cleaning project...
    if exist node_modules (
        echo   Removing node_modules...
        rmdir /s /q node_modules 2>nul
        echo   [OK] Removed node_modules
    )
    if exist package-lock.json (
        echo   Removing package-lock.json...
        del package-lock.json 2>nul
        echo   [OK] Removed package-lock.json
    )
    if exist .vite (
        echo   Removing .vite...
        rmdir /s /q .vite 2>nul
        echo   [OK] Removed .vite
    )
    echo.
)

REM Install if requested
if %INSTALL%==1 (
    echo [INSTALL] Installing dependencies...
    echo   Running npm install...
    call npm install
    if errorlevel 1 (
        echo   [ERROR] Failed to install dependencies
        goto :error
    ) else (
        echo   [OK] Dependencies installed
    )
    echo.
)

REM Fix native dependencies if requested
if %FORCEREBUILD%==1 (
    echo [FIX] Fixing native dependencies...
    echo   Rebuilding better-sqlite3...
    call npm uninstall better-sqlite3 2>nul
    call npm install better-sqlite3 --build-from-source
    if errorlevel 1 (
        echo   [ERROR] Failed to fix native dependencies
        goto :error
    ) else (
        echo   [OK] Native dependencies fixed
    )
    echo.
)

REM Start server
echo [START] Starting Crea development server...
if %VERBOSE%==1 (
    echo   Running in verbose mode...
    call npm start
) else (
    echo   Starting server...
    start "Crea Development Server" cmd /c "npm start"
    timeout /t 5 /nobreak >nul
    echo   [OK] Server startup initiated
    echo   [INFO] Open http://localhost:5173
)

echo.
echo Script completed.
goto :end

:show_help
echo ======================================
echo     Crea Development Server Runner
echo ======================================
echo.
echo USAGE:
echo   run-servers.bat [options]
echo.
echo OPTIONS:
echo   -clean           Clean node_modules and cache
echo   -install         Install dependencies
echo   -forcerebuild    Force rebuild native dependencies
echo   -verbose         Show full npm output
echo   -help            Show this help
echo.
echo EXAMPLES:
echo   run-servers.bat
echo   run-servers.bat -clean -install
echo   run-servers.bat -forcerebuild
echo   run-servers.bat -verbose
goto :end

:error
echo.
echo [ERROR] An error occurred. Check the output above.
echo.
echo Common fixes:
echo   1. Run as Administrator
echo   2. Try: run-servers.bat -clean -install
echo   3. Try: run-servers.bat -forcerebuild
goto :end

:end
