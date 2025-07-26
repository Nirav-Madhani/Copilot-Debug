# 🎯 Copilot Debug Tool - Function Reference

## Overview
This VS Code extension exposes debugging commands as agent-callable tools for GitHub Copilot integration. The extension provides both command palette commands and language model tools for intelligent debugging assistance.

## 🔧 Available Functions

### 1. **Start Debug Session**
- **Command ID**: `copilot-debug-tool.startDebug`
- **Description**: Starts a debugging session with optional configuration
- **Parameters**:
  - `configName` (string, optional): Name of debug configuration to use
- **Usage Examples**:
  ```typescript
  // Start with specific config
  vscode.commands.executeCommand('copilot-debug-tool.startDebug', 'Python: Current File');
  
  // Start with default config
  vscode.commands.executeCommand('copilot-debug-tool.startDebug');
  ```
- **Copilot Chat**: *"Start debugging this Python script"*

### 2. **Debug Control Commands**
#### Continue Debug
- **Command ID**: `copilot-debug-tool.continue`
- **Description**: Continues execution from current breakpoint
- **Parameters**: None
- **Copilot Chat**: *"Continue debugging"* or *"Resume execution"*

#### Pause Debug
- **Command ID**: `copilot-debug-tool.pause`
- **Description**: Pauses the current debug session
- **Parameters**: None
- **Copilot Chat**: *"Pause debugging"*

#### Stop Debug
- **Command ID**: `copilot-debug-tool.stop`
- **Description**: Stops the current debug session
- **Parameters**: None
- **Copilot Chat**: *"Stop debugging"*

### 3. **Step Commands**
#### Step Over
- **Command ID**: `copilot-debug-tool.stepOver`
- **Description**: Execute current line and move to next line
- **Parameters**: None
- **Copilot Chat**: *"Step over"* or *"Execute this line"*

#### Step Into
- **Command ID**: `copilot-debug-tool.stepInto`
- **Description**: Step into function calls on current line
- **Parameters**: None
- **Copilot Chat**: *"Step into this function"*

#### Step Out
- **Command ID**: `copilot-debug-tool.stepOut`
- **Description**: Execute until return from current function
- **Parameters**: None
- **Copilot Chat**: *"Step out of this function"*

### 4. **Breakpoint Management**
#### Add Breakpoint
- **Command ID**: `copilot-debug-tool.addBreakpoint`
- **Description**: Adds a breakpoint at specified location
- **Parameters**:
  - `filePath` (string): Absolute path to the file
  - `lineNumber` (number): Line number (1-based)
- **Usage Example**:
  ```typescript
  vscode.commands.executeCommand('copilot-debug-tool.addBreakpoint', 
    '/path/to/file.py', 25);
  ```
- **Copilot Chat**: *"Add breakpoint at line 25"*

### 5. **Variable Inspection**
#### Get Variables
- **Command ID**: `copilot-debug-tool.getVariables`
- **Description**: Retrieves variable values from current scope
- **Parameters**:
  - `scopeType` (string, optional): Filter by scope type ('local', 'global', etc.)
- **Returns**: Object with variable names, values, and types
- **Usage Examples**:
  ```typescript
  // Get all variables
  vscode.commands.executeCommand('copilot-debug-tool.getVariables');
  
  // Get only local variables
  vscode.commands.executeCommand('copilot-debug-tool.getVariables', 'local');
  ```
- **Copilot Chat**: *"Show me the current variable values"* or *"What are the local variables?"*

### 6. **Expression Evaluation**
#### Evaluate Expression
- **Command ID**: `copilot-debug-tool.evaluateExpression`
- **Description**: Evaluates an expression in the current debug context
- **Parameters**:
  - `expression` (string): Expression to evaluate
- **Returns**: Object with result value and type
- **Usage Example**:
  ```typescript
  vscode.commands.executeCommand('copilot-debug-tool.evaluateExpression', 'x * 2 + y');
  ```
- **Copilot Chat**: *"Evaluate the expression 'x * 2 + y'"* or *"What is the value of num * num?"*

### 7. **Call Stack Inspection**
#### Get Call Stack
- **Command ID**: `copilot-debug-tool.getCallStack`
- **Description**: Retrieves the current call stack
- **Parameters**: None
- **Returns**: Array of stack frames with file, line, and function information
- **Copilot Chat**: *"Show me the call stack"* or *"How did we get here?"*

### 8. **Debug Status**
#### Debug Status
- **Command ID**: `copilot-debug-tool.debugStatus`
- **Description**: Gets current debug session status and information
- **Parameters**: None
- **Returns**: Object with session details, frame info, and thread info
- **Copilot Chat**: *"Check debug status"* or *"Is debugging active?"*

### 9. **Unified Debug Command**
#### Execute Debug Action
- **Command ID**: `copilot-debug-tool.debug`
- **Description**: Unified command that can perform multiple debug actions
- **Parameters**: Object or individual parameters
  - `action` (string): Action to perform ('start', 'continue', 'pause', 'stepOver', 'stepInto', 'stepOut', 'stop', 'getVariables', 'evaluateExpression', 'getCallStack', 'debugStatus')
  - `configName` (string, optional): Debug configuration name
  - `breakpoints` (array, optional): Array of `{file: string, line: number}` objects
  - `expression` (string, optional): Expression for evaluation
  - `scopeFilter` (string, optional): Scope filter for variables

- **Usage Examples**:
  ```typescript
  // Object parameter style
  vscode.commands.executeCommand('copilot-debug-tool.debug', {
    action: 'start',
    configName: 'Python: Current File',
    breakpoints: [
      { file: '/path/to/file.py', line: 20 },
      { file: '/path/to/file.py', line: 35 }
    ]
  });
  
  // Get variables with filter
  vscode.commands.executeCommand('copilot-debug-tool.debug', {
    action: 'getVariables',
    scopeFilter: 'local'
  });
  
  // Evaluate expression
  vscode.commands.executeCommand('copilot-debug-tool.debug', {
    action: 'evaluateExpression',
    expression: 'num * num'
  });
  ```

### 10. **Debug UI**
#### Show Debug UI
- **Command ID**: `copilot-debug-tool.showUI`
- **Description**: Opens the debug UI webview panel
- **Parameters**: None
- **Copilot Chat**: *"Show debug UI"* or *"Open debug panel"*

## 🤖 Language Model Tool Integration

### Debug Tool
- **Tool Name**: `debug`
- **Description**: Language model tool for GitHub Copilot integration
- **Parameters**:
  - `action` (string): Debug action to perform
  - `configName` (string, optional): Debug configuration
  - `breakpoints` (array, optional): Breakpoints to add before action
- **Supported Actions**: 'start', 'continue', 'pause', 'stepOver', 'stepInto', 'stepOut', 'stop'

## 🎯 Copilot Chat Integration

### Natural Language Commands
GitHub Copilot can understand and execute these natural language requests:

- **"Debug this script"** → Starts debugging
- **"Show me variable values in the loop"** → Gets variables at current location
- **"Step through the iterations"** → Steps over code execution
- **"Evaluate 'num * 2'"** → Evaluates the expression
- **"Check debug status"** → Gets current debug state
- **"Add breakpoint at line 20"** → Adds breakpoint
- **"What's in the call stack?"** → Shows call stack
- **"Continue to next breakpoint"** → Continues execution

### Example Workflow Commands
```
User: "Debug this Python script and show me the variables when we hit the loop"
→ Copilot calls: startDebug + addBreakpoint + getVariables

User: "Step through each iteration and show me how the value changes"
→ Copilot calls: stepOver + getVariables (repeated)

User: "What's the value of result * 2 at this point?"
→ Copilot calls: evaluateExpression with "result * 2"
```

## 📋 Return Value Formats

### Variable Inspection
```json
{
  "success": true,
  "variables": {
    "Locals": {
      "num": { "value": "5", "type": "int" },
      "result": { "value": "25", "type": "int" }
    },
    "Globals": {
      "__name__": { "value": "__main__", "type": "str" }
    }
  },
  "frameInfo": {
    "threadId": 1,
    "frameId": 0,
    "sessionId": "debug-session-1"
  }
}
```

### Expression Evaluation
```json
{
  "success": true,
  "expression": "num * 2",
  "result": "10",
  "type": "int"
}
```

### Call Stack
```json
{
  "success": true,
  "callStack": [
    {
      "id": 0,
      "name": "main",
      "source": "/path/to/file.py",
      "line": 25,
      "column": 0
    }
  ],
  "currentFrame": {
    "threadId": 1,
    "frameId": 0
  }
}
```

## 🔍 Error Handling

All commands return objects with `success` boolean and `message` string:
- **Success**: `{ success: true, ... }`
- **Error**: `{ success: false, message: "Error description" }`

Common error scenarios:
- **"No active debug session"** → Start debugging first
- **"No active stack frame"** → Must be paused at breakpoint
- **"Invalid parameters"** → Check parameter format and types

## 💡 Best Practices

1. **Always check debug status** before executing debug operations
2. **Use natural language** with Copilot Chat for intuitive debugging
3. **Combine multiple actions** using the unified `debug` command
4. **Filter variable scopes** to reduce noise when inspecting variables
5. **Handle errors gracefully** by checking return values