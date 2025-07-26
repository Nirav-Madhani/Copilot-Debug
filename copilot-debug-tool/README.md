# Copilot Debug Tool

A VS Code extension that exposes debugging commands as agent-callable tools for GitHub Copilot Chat.

## Features

- **Debug Session Control**: Start, pause, continue, and stop debug sessions
- **Step Controls**: Step over, step into, and step out during debugging
- **Breakpoint Management**: Add breakpoints dynamically
- **Variable Inspection**: Get current variable values with scope filtering
- **Expression Evaluation**: Evaluate expressions in the current debug context
- **Call Stack**: View the current call stack
- **Debug Status**: Check the current debug session status
- **Interactive UI**: Graphical interface with buttons and input fields for all debug commands
- Integration with GitHub Copilot Chat (when Language Model Tools API becomes available)

## Usage

### Command Palette Commands

All debug commands are available through the Command Palette (`Ctrl+Shift+P`):

- `Copilot Debug: Show Debug UI` - Opens the interactive debug panel
- `Copilot Debug: Start Debug Session`
- `Copilot Debug: Continue Debug`
- `Copilot Debug: Pause Debug`
- `Copilot Debug: Step Over`
- `Copilot Debug: Step Into`
- `Copilot Debug: Step Out`
- `Copilot Debug: Stop Debug`
- `Copilot Debug: Add Breakpoint`
- `Copilot Debug: Get Debug Variables`
- `Copilot Debug: Evaluate Expression`
- `Copilot Debug: Get Call Stack`
- `Copilot Debug: Debug Status`

### Interactive Debug UI

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type "Copilot Debug: Show Debug UI" and press Enter
3. The debug panel will open with an intuitive interface featuring:
   - **Debug Status**: Real-time status indicator
   - **Session Controls**: Start/stop/pause/continue buttons
   - **Step Controls**: Step over/into/out buttons
   - **Breakpoint Management**: Add breakpoints with file path and line number inputs
   - **Variable Inspection**: View variables with optional scope filtering
   - **Expression Evaluation**: Evaluate custom expressions
   - **Call Stack**: View the current execution stack
   - **Output Panel**: Real-time feedback and results

### Quick Start Example

1. Open your Python file (e.g., `simple_debug.py`)
2. Run "Copilot Debug: Show Debug UI" from Command Palette
3. In the UI:
   - Add a breakpoint: Enter file path and line number (e.g., line 24)
   - Click "Start Debug" to begin debugging
   - When paused at breakpoint, click "Get Variables" to see current values
   - Use step controls to navigate through code
   - Evaluate expressions like `num * 2` or `len(numbers)`

## Installation

1. Clone or download this repository
2. Navigate to the extension directory
3. Install dependencies: `npm install`
4. Compile the extension: `npm run compile`
5. Package the extension: `npx vsce package`
6. Install the generated .vsix file in VS Code

## Usage

### Manual Commands

The extension provides the following commands that can be executed via the Command Palette (Ctrl+Shift+P):

- `Copilot Debug: Start Debug Session` - Start debugging with optional configuration
- `Copilot Debug: Continue Debug` - Continue execution when paused
- `Copilot Debug: Pause Debug` - Pause execution
- `Copilot Debug: Step Over` - Step over the current line
- `Copilot Debug: Step Into` - Step into function calls
- `Copilot Debug: Step Out` - Step out of current function
- `Copilot Debug: Stop Debug` - Stop the debug session
- `Copilot Debug: Add Breakpoint` - Add a breakpoint at specified location
- `Copilot Debug: Execute Debug Action` - Unified command for all debug actions

### Agent Integration (Future)

When the Language Model Tools API becomes stable, this extension will automatically register a "debug" tool that GitHub Copilot Chat can use autonomously. The agent will be able to:

- Start debug sessions with specific configurations
- Set breakpoints before starting
- Control execution flow (pause, continue, step)
- Stop debug sessions

## Development

### Prerequisites

- Node.js 14.x or later
- VS Code 1.94.0 or later
- TypeScript 5.4.0 or later

### Building

```bash
npm install
npm run compile
```

### Packaging

```bash
npx vsce package
```

## API Reference

### Debug Command

The unified debug command accepts the following parameters:

```typescript
{
  action: 'start' | 'continue' | 'pause' | 'stepOver' | 'stepInto' | 'stepOut' | 'stop',
  configName?: string,  // Optional launch configuration name for 'start' action
  breakpoints?: Array<{file: string, line: number}>  // Optional breakpoints to set
}
```

### Return Values

All commands return a result object:

```typescript
{
  success: boolean,
  action?: string,
  message: string
}
```

## Future Enhancements

- Support for conditional breakpoints
- Variable inspection capabilities
- Watch expression management
- Call stack navigation
- Multiple debug session support

## License

MIT
