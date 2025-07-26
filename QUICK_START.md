# 🎯 COPILOT DEBUG TOOL - QUICK REFERENCE

## 🚀 GET STARTED IN 3 STEPS

1. **Setup**: Install the extension from `copilot-debug-tool/` folder 
2. **Open UI**: Use `Ctrl+Shift+P` → "Copilot Debug: Show Debug UI"
3. **Debug**: Set breakpoint at line 20, click "Start Debug", then "Get Variables"

## 🎮 KEY COMMANDS

| Action | UI Button | Chat Command |
|--------|-----------|--------------|
| Start debugging | ▶️ Start Debug | "Debug this script" |
| Get variable values | 📋 Get Variables | "Show me variable values in the loop" |
| Step through code | ⤵️ Step Over | "Step through the iterations" |
| Evaluate expressions | 🔍 Evaluate | "Evaluate 'num * 2'" |
| Check debug status | 🔍 Debug Status | "Check debug status" |

## 📍 RECOMMENDED BREAKPOINTS

- **Line 20**: `for num in numbers:` - Main loop start
- **Line 24**: `square = num * num` - Variable calculations  
- **Line 35**: `results.append(...)` - After result creation
- **Line 60**: `for i in range(n):` - Fibonacci loop start

## 🎯 TYPICAL WORKFLOW

1. Set breakpoint at line 20
2. Click "Start Debug" in UI
3. When paused, click "Get Variables" to see: `num=2, square=4, sum_total=2`
4. Click "Step Over" to next line
5. Click "Get Variables" again to see changes
6. Click "Continue" to next breakpoint

## 🔧 TROUBLESHOOTING

- **"No active debug session"** → Start debugging first (F5 or Start Debug button)
- **"No active stack frame"** → Must be paused at a breakpoint
- **Commands not working** → Reload VS Code window after installing extension

## 📚 COMPLETE DOCUMENTATION

For comprehensive debugging documentation, see the `copilot-instructions.md` file in the `.github` folder. 

**For demo usage**: Copy the `.github` folder to `python-debug-demo/` folder for Copilot integration.

---
**💡 Pro Tip**: Use natural language with Copilot Chat like "Debug this script and show me variable values in the loop" for intelligent debugging assistance!
