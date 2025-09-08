# Crea Development Server Runner
# PowerShell script to run Crea application with various options

param(
    [string]$Mode = "dev",
    [switch]$Clean,
    [switch]$Install,
    [switch]$Test,
    [switch]$Lint,
    [switch]$Build,
    [switch]$Help,
    [switch]$ForceRebuild,
    [string]$EngineUrl,
    [string]$GatewayUrl
)

# Configuration
$ProjectRoot = $PSScriptRoot
$NodeModulesPath = Join-Path $ProjectRoot "node_modules"
$PackageJsonPath = Join-Path $ProjectRoot "package.json"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$White = "White"

function Write-ColoredOutput {
    param(
        [string]$Message,
        [string]$Color = $White,
        [switch]$NoNewline
    )

    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Write-Header {
    param([string]$Title)

    Write-ColoredOutput ("=" * 60) $Cyan
    Write-ColoredOutput "  $Title" $Cyan
    Write-ColoredOutput ("=" * 60) $Cyan
    Write-Host
}

function Write-Step {
    param([string]$Step, [string]$Description = "")

    Write-ColoredOutput "[$Step]" $Green -NoNewline
    Write-ColoredOutput " $Description" $White
}

function Test-NodeJs {
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Step "✓" "Node.js version: $nodeVersion"
            return $true
        }
    }
    catch {
        Write-Step "✗" "Node.js not found in PATH"
        return $false
    }
    return $false
}

function Test-Npm {
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Step "✓" "npm version: $npmVersion"
            return $true
        }
    }
    catch {
        Write-Step "✗" "npm not found in PATH"
        return $false
    }
    return $false
}

function Test-ProjectStructure {
    $requiredFiles = @(
        "package.json",
        "tsconfig.json",
        "src",
        "forge.config.ts"
    )

    $allPresent = $true
    foreach ($file in $requiredFiles) {
        $path = Join-Path $ProjectRoot $file
        if (Test-Path $path) {
            Write-Step "✓" "Found: $file"
        } else {
            Write-Step "✗" "Missing: $file"
            $allPresent = $false
        }
    }
    return $allPresent
}

function Clean-Project {
    Write-Step "CLEAN" "Cleaning project..."

    # Remove node_modules and lock files
    $pathsToRemove = @(
        "node_modules",
        "package-lock.json",
        "yarn.lock",
        "out",
        "dist",
        ".cache"
    )

    foreach ($path in $pathsToRemove) {
        $fullPath = Join-Path $ProjectRoot $path
        if (Test-Path $fullPath) {
            Write-ColoredOutput "  Removing $path..." $Yellow
            try {
                Remove-Item $fullPath -Recurse -Force -ErrorAction Stop
                Write-ColoredOutput "  ✓ Removed $path" $Green
            }
            catch {
                Write-ColoredOutput "  ✗ Failed to remove $path : $($_.Exception.Message)" $Red
            }
        }
    }

    Write-Host
}

function Install-Dependencies {
    Write-Step "INSTALL" "Installing dependencies..."

    if (-not (Test-Path $PackageJsonPath)) {
        Write-ColoredOutput "❌ package.json not found!" $Red
        return $false
    }

    try {
        # Use npm ci if lock file exists, otherwise npm install
        if ((Test-Path (Join-Path $ProjectRoot "package-lock.json")) -or (Test-Path (Join-Path $ProjectRoot "yarn.lock"))) {
            Write-ColoredOutput "  Using npm ci (lock file detected)..." $Yellow
            npm ci 2>&1
        } else {
            Write-ColoredOutput "  Using npm install..." $Yellow
            npm install 2>&1
        }

        if ($LASTEXITCODE -eq 0) {
            Write-ColoredOutput "  ✓ Dependencies installed successfully" $Green
            return $true
        } else {
            Write-ColoredOutput "  ✗ Failed to install dependencies" $Red
            return $false
        }
    }
    catch {
        Write-ColoredOutput "  ✗ Error installing dependencies: $($_.Exception.Message)" $Red
        return $false
    }
}

function Run-TypeScriptCheck {
    Write-Step "TSC" "Running TypeScript compilation check..."

    try {
        npm run ts:main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColoredOutput "  ✓ TypeScript compilation successful" $Green
            return $true
        } else {
            Write-ColoredOutput "  ✗ TypeScript compilation failed" $Red
            return $false
        }
    }
    catch {
        Write-ColoredOutput "  ✗ Error running TypeScript check: $($_.Exception.Message)" $Red
        return $false
    }
}

function Run-Linting {
    Write-Step "LINT" "Running code linting..."

    try {
        npm run lint 2>&1 | Select-Object -First 20
        if ($LASTEXITCODE -eq 0) {
            Write-ColoredOutput "  ✓ Linting completed successfully" $Green
            return $true
        } else {
            Write-ColoredOutput "  ⚠ Linting completed with warnings/errors" $Yellow
            return $true
        }
    }
    catch {
        Write-ColoredOutput "  ✗ Error running linter: $($_.Exception.Message)" $Red
        return $false
    }
}

function Run-Tests {
    Write-Step "TEST" "Running test suite..."

    try {
        npm test 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColoredOutput "  ✓ Tests passed" $Green
            return $true
        } else {
            Write-ColoredOutput "  ✗ Tests failed" $Red
            return $false
        }
    }
    catch {
        Write-ColoredOutput "  ✗ Error running tests: $($_.Exception.Message)" $Red
        return $false
    }
}

function Fix-NativeDependencies {
    Write-Step "FIX" "Attempting to fix native dependency issues..."

    try {
        # Try to rebuild native dependencies
        Write-ColoredOutput "  Rebuilding native dependencies..." $Yellow
        npm rebuild 2>&1 | Out-Null

        # Try electron-rebuild
        Write-ColoredOutput "  Running electron-rebuild..." $Yellow
        npx electron-rebuild 2>&1 | Out-Null

        Write-ColoredOutput "  ✓ Native dependencies rebuild attempted" $Green
        return $true
    }
    catch {
        Write-ColoredOutput "  ✗ Failed to fix native dependencies: $($_.Exception.Message)" $Red
        return $false
    }
}

function Start-DevelopmentServer {
    param([string]$CustomMode = "")

    Write-Step "START" "Starting Crea development server..."

    # Set environment variables if provided
    $envVars = @{}

    if ($EngineUrl) {
        $envVars["CREA_ENGINE_URL"] = $EngineUrl
        Write-ColoredOutput "  Engine URL: $EngineUrl" $Cyan
    }

    if ($GatewayUrl) {
        $envVars["CREA_GATEWAY_URL"] = $GatewayUrl
        Write-ColoredOutput "  Gateway URL: $GatewayUrl" $Cyan
    }

    # Choose the appropriate npm script based on mode
    $npmScript = switch ($CustomMode) {
        "staging-engine" { "dev:staging-engine" }
        "staging-gateway" { "dev:staging-gateway" }
        default { "start" }
    }

    Write-ColoredOutput "  Running: npm run $npmScript" $Cyan

    try {
        # Set environment variables and run the command
        foreach ($key in $envVars.Keys) {
            [Environment]::SetEnvironmentVariable($key, $envVars[$key])
        }

        # Run the npm script
        npm run $npmScript

    }
    catch {
        Write-ColoredOutput "  ✗ Failed to start server: $($_.Exception.Message)" $Red
        return $false
    }

    return $true
}

function Show-Help {
    Write-Header "Crea Development Server Runner"

    Write-ColoredOutput "USAGE:" $Cyan
    Write-Host "  .\run-servers.ps1 [options]"
    Write-Host

    Write-ColoredOutput "OPTIONS:" $Cyan
    Write-Host "  -Mode <mode>          Development mode: dev, staging-engine, staging-gateway (default: dev)"
    Write-Host "  -Clean                Clean project before running"
    Write-Host "  -Install              Install dependencies"
    Write-Host "  -Test                 Run test suite"
    Write-Host "  -Lint                 Run linting"
    Write-Host "  -Build                Build the application"
    Write-Host "  -ForceRebuild         Force rebuild of native dependencies"
    Write-Host "  -EngineUrl <url>      Custom engine URL"
    Write-Host "  -GatewayUrl <url>     Custom gateway URL"
    Write-Host "  -Help                 Show this help message"
    Write-Host

    Write-ColoredOutput "EXAMPLES:" $Cyan
    Write-Host "  .\run-servers.ps1 -Clean -Install -Mode dev"
    Write-Host "  .\run-servers.ps1 -Test -Lint"
    Write-Host "  .\run-servers.ps1 -EngineUrl 'http://localhost:8080/v1'"
    Write-Host "  .\run-servers.ps1 -ForceRebuild -Clean"
    Write-Host

    Write-ColoredOutput "AVAILABLE NPM SCRIPTS:" $Cyan
    if (Test-Path $PackageJsonPath) {
        try {
            $packageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
            if ($packageJson.scripts) {
                $packageJson.scripts.PSObject.Properties | ForEach-Object {
                    Write-Host ("  {0,-20} {1}" -f $_.Name, $_.Value)
                }
            }
        }
        catch {
            Write-ColoredOutput "  Unable to read package.json" $Red
        }
    }
}

# Main execution logic
function Main {
    if ($Help) {
        Show-Help
        return
    }

    Write-Header "Crea Development Server Runner"
    Write-ColoredOutput "Mode: $Mode" $Cyan
    Write-Host

    # Pre-flight checks
    Write-Step "CHECK" "Performing pre-flight checks..."
    $nodeOk = Test-NodeJs
    $npmOk = Test-Npm
    $structureOk = Test-ProjectStructure

    if (-not ($nodeOk -and $npmOk -and $structureOk)) {
        Write-ColoredOutput "❌ Pre-flight checks failed. Please fix the issues above." $Red
        return
    }

    Write-ColoredOutput "✅ All pre-flight checks passed!" $Green
    Write-Host

    # Navigate to project root
    Set-Location $ProjectRoot

    # Clean if requested
    if ($Clean) {
        Clean-Project
    }

    # Install dependencies if requested or if node_modules doesn't exist
    if ($Install -or -not (Test-Path $NodeModulesPath)) {
        if (-not (Install-Dependencies)) {
            Write-ColoredOutput "❌ Failed to install dependencies. Exiting." $Red
            return
        }
    }

    # Fix native dependencies if requested
    if ($ForceRebuild) {
        Fix-NativeDependencies
    }

    # Run tests if requested
    if ($Test) {
        if (-not (Run-Tests)) {
            Write-ColoredOutput "⚠ Tests failed, but continuing..." $Yellow
        }
    }

    # Run linting if requested
    if ($Lint) {
        if (-not (Run-Linting)) {
            Write-ColoredOutput "⚠ Linting failed, but continuing..." $Yellow
        }
    }

    # Run TypeScript check
    if (-not (Run-TypeScriptCheck)) {
        Write-ColoredOutput "⚠ TypeScript compilation failed. You may want to fix these issues." $Yellow
    }

    # Build if requested
    if ($Build) {
        Write-Step "BUILD" "Building application..."
        try {
            npm run package 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColoredOutput "  ✓ Build completed successfully" $Green
            } else {
                Write-ColoredOutput "  ✗ Build failed" $Red
                return
            }
        }
        catch {
            Write-ColoredOutput "  ✗ Error during build: $($_.Exception.Message)" $Red
            return
        }
    }

    # Start the development server
    if ($Mode -ne "none") {
        Write-Host
        Start-DevelopmentServer -CustomMode $Mode
    }
}

# Run the main function
try {
    Main
}
catch {
    Write-ColoredOutput "❌ An unexpected error occurred: $($_.Exception.Message)" $Red
    Write-ColoredOutput "Stack trace: $($_.Exception.StackTrace)" $Red
}
finally {
    Write-Host
    Write-ColoredOutput "Script execution completed." $Cyan
}
