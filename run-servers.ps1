# Crea Development Server Runner
# Simple PowerShell script for the Crea application

param(
    [switch]$Clean,
    [switch]$Install,
    [switch]$ForceRebuild,
    [switch]$Verbose,
    [switch]$Help
)

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$White = "White"

function Write-Color {
    param([string]$Text, [string]$Color = $White)
    Write-Host $Text -ForegroundColor $Color
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Color "[$Step] $Message" $Cyan
}

function Show-Help {
    Write-Color "=====================================" $Cyan
    Write-Color "    Crea Development Server Runner" $Cyan
    Write-Color "=====================================" $Cyan
    Write-Host
    Write-Color "USAGE:" $Cyan
    Write-Host "  .\run-servers.ps1 [options]"
    Write-Host
    Write-Color "OPTIONS:" $Cyan
    Write-Host "  -Clean           Clean node_modules and cache"
    Write-Host "  -Install         Install dependencies"
    Write-Host "  -ForceRebuild    Force rebuild native dependencies"
    Write-Host "  -Verbose         Show full npm output"
    Write-Host "  -Help            Show this help"
    Write-Host
    Write-Color "EXAMPLES:" $Cyan
    Write-Host "  .\run-servers.ps1"
    Write-Host "  .\run-servers.ps1 -Clean -Install"
    Write-Host "  .\run-servers.ps1 -ForceRebuild"
    Write-Host "  .\run-servers.ps1 -Verbose"
}

function Clean-Project {
    Write-Step "CLEAN" "Cleaning project..."

    $paths = @("node_modules", "package-lock.json", ".vite")

    foreach ($path in $paths) {
        if (Test-Path $path) {
            Write-Color "  Removing $path..." $Yellow
            Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Color "  ✓ Removed $path" $Green
        }
    }
}

function Install-Dependencies {
    Write-Step "INSTALL" "Installing dependencies..."

    Write-Color "  Running npm install..." $Yellow
    npm install

    if ($LASTEXITCODE -eq 0) {
        Write-Color "  ✓ Dependencies installed" $Green
        return $true
    } else {
        Write-Color "  ✗ Failed to install dependencies" $Red
        return $false
    }
}

function Fix-NativeDeps {
    Write-Step "FIX" "Fixing native dependencies..."

    Write-Color "  Rebuilding better-sqlite3..." $Yellow
    npm uninstall better-sqlite3 2>$null
    npm install better-sqlite3 --build-from-source

    if ($LASTEXITCODE -eq 0) {
        Write-Color "  ✓ Native dependencies fixed" $Green
        return $true
    } else {
        Write-Color "  ✗ Failed to fix native dependencies" $Red
        return $false
    }
}

function Start-Server {
    Write-Step "START" "Starting Crea development server..."

    if ($Verbose) {
        Write-Color "  Running in verbose mode..." $Yellow
        npm start
    } else {
        Write-Color "  Starting server..." $Yellow
        $job = Start-Job -ScriptBlock { npm start }

        Start-Sleep -Seconds 5

        if ($job.State -eq "Running") {
            Write-Color "  ✅ Server started successfully" $Green
            Write-Color "  📱 Open http://localhost:5173" $Cyan
        } else {
            Write-Color "  ❌ Server failed to start" $Red
            return $false
        }
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-Color "=====================================" $Cyan
Write-Color "    Crea Development Server" $Cyan
Write-Color "=====================================" $Cyan
Write-Host

# Clean if requested
if ($Clean) {
    Clean-Project
    Write-Host
}

# Install if requested
if ($Install) {
    Install-Dependencies
    Write-Host
}

# Fix native deps if requested
if ($ForceRebuild) {
    Fix-NativeDeps
    Write-Host
}

# Start server (always)
Start-Server

Write-Host
Write-Color "Script completed." $Cyan
