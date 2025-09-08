# Crea Development Server Runner

A comprehensive PowerShell script to run and manage the Crea application development environment.

## 🚀 Quick Start

```powershell
# Run in development mode (default)
.\run-servers.ps1

# Clean install and run
.\run-servers.ps1 -Clean -Install

# Run tests and linting
.\run-servers.ps1 -Test -Lint

# Run with custom engine URL
.\run-servers.ps1 -EngineUrl "http://localhost:8080/v1"
```

## 📋 Available Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `-Mode` | String | `dev` | Development mode (`dev`, `staging-engine`, `staging-gateway`) |
| `-Clean` | Switch | `false` | Clean project before running |
| `-Install` | Switch | `false` | Install/refresh dependencies |
| `-Test` | Switch | `false` | Run test suite |
| `-Lint` | Switch | `false` | Run code linting |
| `-Build` | Switch | `false` | Build the application |
| `-ForceRebuild` | Switch | `false` | Force rebuild native dependencies |
| `-EngineUrl` | String | - | Custom engine URL for testing |
| `-GatewayUrl` | String | - | Custom gateway URL for testing |
| `-Help` | Switch | `false` | Show help information |

## 🎯 Common Usage Scenarios

### Development Setup (First Time)
```powershell
.\run-servers.ps1 -Clean -Install -Test -Lint
```

### Quick Development Start
```powershell
.\run-servers.ps1
```

### Testing Environment
```powershell
.\run-servers.ps1 -EngineUrl "http://localhost:8080/v1" -GatewayUrl "http://localhost:3001/v1"
```

### Staging Environment
```powershell
.\run-servers.ps1 -Mode staging-engine
```

### Build and Package
```powershell
.\run-servers.ps1 -Build
```

### Fix Native Dependencies
```powershell
.\run-servers.ps1 -ForceRebuild
```

### Full Quality Check
```powershell
.\run-servers.ps1 -Clean -Install -Test -Lint -Mode none
```

## 🔧 What the Script Does

### Pre-flight Checks
- ✅ Verifies Node.js installation and version
- ✅ Verifies npm installation and version
- ✅ Checks project structure (package.json, tsconfig.json, src/, forge.config.ts)

### Optional Operations
- 🧹 **Clean**: Removes node_modules, lock files, build artifacts
- 📦 **Install**: Installs dependencies using npm ci (if lock file exists) or npm install
- 🔧 **Fix**: Attempts to rebuild native dependencies (better-sqlite3, etc.)
- 🧪 **Test**: Runs the test suite
- 🎨 **Lint**: Runs code linting and shows first 20 issues
- 📝 **TypeScript**: Compiles and checks TypeScript code
- 🏗️ **Build**: Packages the application for distribution

### Development Server
- 🚀 Starts the Electron application
- 🌐 Supports different environments (dev, staging)
- 🔗 Allows custom engine/gateway URLs for testing

## 📊 Script Features

### Colored Output
- 🟢 Green: Success messages
- 🔴 Red: Error messages
- 🟡 Yellow: Warning/Info messages
- 🔵 Cyan: Headers and URLs
- ⚪ White: Regular text

### Error Handling
- Graceful error handling with detailed messages
- Continues execution where possible
- Shows stack traces for debugging

### Smart Dependency Management
- Auto-detects lock files (package-lock.json, yarn.lock)
- Uses `npm ci` when lock files exist
- Falls back to `npm install` when needed

### Environment Support
- Supports multiple development environments
- Custom URL overrides for testing
- Environment variable management

## 🔍 Troubleshooting

### Common Issues

#### "node-gyp failed to rebuild"
```powershell
# Try force rebuild
.\run-servers.ps1 -ForceRebuild

# Or clean and reinstall
.\run-servers.ps1 -Clean -Install
```

#### "Cannot find module" errors
```powershell
# Clean node_modules and reinstall
.\run-servers.ps1 -Clean -Install
```

#### TypeScript compilation errors
```powershell
# Run TypeScript check only
.\run-servers.ps1 -Lint -Test -Mode none
```

#### Permission errors on Windows
```powershell
# Run PowerShell as Administrator, or:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Debug Mode
```powershell
# Run with verbose output
$DebugPreference = "Continue"
.\run-servers.ps1 -Clean -Install
```

## 📁 Project Structure

The script expects the following project structure:
```
crea-project/
├── run-servers.ps1     # This script
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── forge.config.ts     # Electron Forge configuration
├── src/                # Source code
├── node_modules/       # Dependencies (auto-managed)
└── out/                # Build output (auto-managed)
```

## 🔗 Available npm Scripts

The script automatically detects and can run these npm scripts from your package.json:

- `start` - Start development server
- `dev:staging-engine` - Run with staging engine
- `dev:staging-gateway` - Run with staging gateway
- `test` - Run tests
- `lint` - Run linting
- `ts:main` - TypeScript compilation check
- `package` - Build application
- `clean` - Clean build artifacts

## 🎉 Success Indicators

When everything works correctly, you'll see:
```
============================================================
  Crea Development Server Runner
============================================================
Mode: dev

[✓] Node.js version: v18.x.x
[✓] npm version: 9.x.x
[✓] Found: package.json
[✓] Found: tsconfig.json
[✓] Found: src
[✓] Found: forge.config.ts
✅ All pre-flight checks passed!

[INSTALL] Installing dependencies...
  ✓ Dependencies installed successfully

[TSC] Running TypeScript compilation check...
  ✓ TypeScript compilation successful

[LINT] Running code linting...
  ✓ Linting completed successfully

[START] Starting Crea development server...
  Running: npm run start
```

## 🤝 Contributing

To add new features to the script:

1. Add new parameter switches to the `param()` block
2. Create new functions for specific operations
3. Add the logic to the `Main()` function
4. Update the help documentation
5. Test thoroughly with different scenarios

## 📝 Notes

- The script automatically detects your project root
- All operations are logged with timestamps and colored output
- Errors don't stop execution unless critical
- The script is idempotent (can be run multiple times safely)
- Environment variables are set temporarily for the session

---

**Happy coding with Crea! 🎊**
