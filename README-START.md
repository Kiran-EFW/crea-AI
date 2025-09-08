# Crea Development Server - Quick Start Guide

## 🚀 Getting Started

Your Crea app is now ready to run! Choose the script that works best for your environment.

## 📋 Available Scripts

### Option 1: Command Prompt (Recommended)
```batch
# Basic start
run-servers.bat

# Clean and reinstall
run-servers.bat -clean -install

# Fix native dependencies
run-servers.bat -forcerebuild

# Verbose output
run-servers.bat -verbose

# Show help
run-servers.bat -help
```

### Option 2: PowerShell
```powershell
# Basic start
.\run-servers.ps1

# Clean and reinstall
.\run-servers.ps1 -Clean -Install

# Fix native dependencies
.\run-servers.ps1 -ForceRebuild

# Verbose output
.\run-servers.ps1 -Verbose

# Show help
.\run-servers.ps1 -Help
```

## 🎯 What Each Script Does

| Command | Description |
|---------|-------------|
| **Basic Run** | Starts the development server normally |
| **-clean** | Removes node_modules, package-lock.json, and build cache |
| **-install** | Installs all npm dependencies |
| **-forcerebuild** | Rebuilds native dependencies (fixes better-sqlite3 issues) |
| **-verbose** | Shows full npm output instead of background mode |
| **-help** | Shows detailed usage information |

## 🔧 Troubleshooting

### If the app doesn't start:
1. **Clean and reinstall**: `run-servers.bat -clean -install`
2. **Fix native dependencies**: `run-servers.bat -forcerebuild`
3. **Run as Administrator** (if permission errors occur)
4. **Check if port 5173 is available**

### If you see build errors:
1. **Clear build cache**: `run-servers.bat -clean`
2. **Reinstall dependencies**: `run-servers.bat -install`
3. **Force rebuild**: `run-servers.bat -forcerebuild`

## 📱 Accessing Your App

Once the server starts successfully, open your browser and go to:
**http://localhost:5173/**

## ✅ Success Indicators

When the app starts correctly, you'll see:
- ✅ "Server startup initiated"
- ✅ "Open http://localhost:5173"
- ✅ No error messages in red
- ✅ Electron app window opens

## 🎉 You're All Set!

Your Crea development environment is fully configured and ready to use! 🚀
