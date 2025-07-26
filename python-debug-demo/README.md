# Python Debug Demo

This folder contains simple Python files for testing the **Copilot Debug Tool Extension**.

## 📁 Folder Structure

```
python-debug-demo/
├─ .vscode/
│  └─ launch.json                    # Debug configurations
├─ simple_debug.py                  # Simple script for debugging practice
├─ sample_app.py                     # Alternative demo application
└─ README.md                         # This file
```

## 🎯 Purpose

This demo workspace is designed to:
1. Provide simple Python code that's easy to debug
2. Test the Copilot Debug Tool extension functionality  
3. Demonstrate integration with GitHub Copilot Chat
4. Help beginners learn debugging with clear breakpoint locations

## 🚀 How to Use

### Prerequisites
1. Install the Copilot Debug Tool extension from the parent directory
2. Have Python extension for VS Code installed
3. Ensure Python is available in your system PATH
4. **Copy the `.github` folder from the parent directory to this folder** for Copilot integration

### Setup Steps
1. **Copy .github folder**: 
   ```
   Copy: ../vscode-extension/.github/ 
   To: python-debug-demo/.github/
   ```
2. **Open this folder in VS Code** as a workspace
3. **Open `simple_debug.py`** - the main file for debugging practice

### Recommended Debugging Workflow

1. **Set breakpoints** at these key lines in `simple_debug.py`:
   - **Line 20**: `for num in numbers:` - Main loop start
   - **Line 24**: `square = num * num` - Variable calculations  
   - **Line 35**: `results.append(...)` - After result creation
   - **Line 60**: `for i in range(2, n):` - Fibonacci loop start

2. **Start debugging**: Press `F5` or use "Start Debug" command

3. **Use Copilot Chat** with natural language:
   - *"Debug this script"*
   - *"Show me variable values in the loop"*  
   - *"Step through the iterations"*
   - *"What's the value of sum_total?"*

### Debug Configurations Available

- **Python: Simple Debug** - Debug the simple_debug.py file
- **Python: Sample App** - Debug the sample_app.py file  
- **Python: Current File** - Debug whichever Python file is currently open

## 📋 Files Description

### simple_debug.py
- **Purpose**: Main file for debugging practice
- **Features**: 
  - Clear variable calculations
  - Simple loops perfect for stepping through
  - Multiple functions to practice call stack inspection
  - Helpful comments showing where to set breakpoints
- **Best for**: Learning debugging basics, testing variable inspection
## 🎮 Quick Start Commands

After copying the `.github` folder and opening this workspace:

1. **Open `simple_debug.py`**
2. **Set a breakpoint at line 20** (the for loop)
3. **Press F5** to start debugging
4. **Use Copilot Chat**: *"Show me variable values in the loop"*
5. **Step through iterations** to see values change

## 🔧 Troubleshooting

- **"No .github folder"** → Copy `.github` from parent directory
- **"Python not found"** → Install Python and VS Code Python extension
- **"Debug commands not working"** → Reload VS Code window after installing extension
- **"Copilot not responding"** → Ensure `.github/copilot-instructions.md` exists

## 💡 Pro Tips

- Start with `simple_debug.py` - it's designed for easy debugging
- Use natural language with Copilot Chat for intelligent assistance  
- Set multiple breakpoints to practice stepping through code
- Try evaluating expressions like `num * 2` when paused at breakpoints

---
**🎯 Goal**: Learn debugging fundamentals with AI assistance through simple, clear Python examples!
