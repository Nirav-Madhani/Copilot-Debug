import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Create output channel for debugging
    const outputChannel = vscode.window.createOutputChannel('Copilot Debug Tool');
    context.subscriptions.push(outputChannel);

    // Register a command that can be called to start debugging
    let startDebugCommand = vscode.commands.registerCommand('copilot-debug-tool.startDebug', async (configName?: string) => {
        if (configName) {
            await vscode.debug.startDebugging(undefined, configName);
        } else {
            // Start with the first available configuration or create a default one
            const configs = vscode.workspace.getConfiguration('launch').get('configurations') as any[];
            if (configs && configs.length > 0) {
                await vscode.debug.startDebugging(undefined, configs[0]);
            } else {
                // Default debug configuration
                const defaultConfig = {
                    name: 'Default Debug',
                    type: 'node',
                    request: 'launch',
                    program: '${file}'
                };
                await vscode.debug.startDebugging(undefined, defaultConfig);
            }
        }
        return { success: true, message: 'Debug session started' };
    });

    // Register a command for continuing debugging
    let continueDebugCommand = vscode.commands.registerCommand('copilot-debug-tool.continue', async () => {
        await vscode.commands.executeCommand('workbench.action.debug.continue');
        return { success: true, message: 'Debug continued' };
    });

    // Register a command for pausing debugging
    let pauseDebugCommand = vscode.commands.registerCommand('copilot-debug-tool.pause', async () => {
        await vscode.commands.executeCommand('workbench.action.debug.pause');
        return { success: true, message: 'Debug paused' };
    });

    // Register a command for step over
    let stepOverCommand = vscode.commands.registerCommand('copilot-debug-tool.stepOver', async () => {
        await vscode.commands.executeCommand('workbench.action.debug.stepOver');
        return { success: true, message: 'Step over executed' };
    });

    // Register a command for step into
    let stepIntoCommand = vscode.commands.registerCommand('copilot-debug-tool.stepInto', async () => {
        await vscode.commands.executeCommand('workbench.action.debug.stepInto');
        return { success: true, message: 'Step into executed' };
    });

    // Register a command for step out
    let stepOutCommand = vscode.commands.registerCommand('copilot-debug-tool.stepOut', async () => {
        await vscode.commands.executeCommand('workbench.action.debug.stepOut');
        return { success: true, message: 'Step out executed' };
    });

    // Register a command for stopping debugging
    let stopDebugCommand = vscode.commands.registerCommand('copilot-debug-tool.stop', async () => {
        await vscode.commands.executeCommand('workbench.action.debug.stop');
        return { success: true, message: 'Debug session stopped' };
    });

    // Register a command for adding breakpoints
    let addBreakpointCommand = vscode.commands.registerCommand('copilot-debug-tool.addBreakpoint', async (filePath: string, lineNumber: number) => {
        try {
            const uri = vscode.Uri.file(filePath);
            const position = new vscode.Position(lineNumber - 1, 0);
            const location = new vscode.Location(uri, position);
            const breakpoint = new vscode.SourceBreakpoint(location);
            vscode.debug.addBreakpoints([breakpoint]);
            return { success: true, message: `Breakpoint added at ${filePath}:${lineNumber}` };
        } catch (error) {
            return { success: false, message: `Failed to add breakpoint: ${error}` };
        }
    });

    // Register a debug status command for diagnostic purposes
    let debugStatusCommand = vscode.commands.registerCommand('copilot-debug-tool.debugStatus', async () => {
        try {
            const session = vscode.debug.activeDebugSession;
            const stackItem = vscode.debug.activeStackItem;
            
            return {
                success: true,
                status: {
                    hasSession: !!session,
                    sessionId: session?.id,
                    sessionType: session?.type,
                    sessionName: session?.name,
                    hasStackItem: !!stackItem,
                    frameId: (stackItem instanceof vscode.DebugStackFrame) ? stackItem.frameId : null,
                    threadId: stackItem?.threadId,
                    stackItemType: stackItem?.constructor?.name
                }
            };
        } catch (error) {
            return { success: false, message: `Failed to get debug status: ${error}` };
        }
    });

    // Register a command for getting variable values
    let getVariablesCommand = vscode.commands.registerCommand('copilot-debug-tool.getVariables', async (scopeType?: string) => {
        try {
            outputChannel.appendLine(`getVariables called with scope: ${scopeType}`);
            
            const session = vscode.debug.activeDebugSession;
            outputChannel.appendLine(`Active session: ${session?.id}, ${session?.type}, ${session?.name}`);
            if (!session) {
                outputChannel.appendLine('No active debug session found');
                return { success: false, message: 'No active debug session' };
            }

            const stackItem = vscode.debug.activeStackItem;
            
            // Check if stackItem is a DebugStackFrame (not DebugThread)
            if (!stackItem || !(stackItem instanceof vscode.DebugStackFrame)) {
                outputChannel.appendLine(`Invalid stack item - not a DebugStackFrame. Type: ${stackItem?.constructor?.name}`);
                return { success: false, message: 'No active stack frame or invalid stack frame type' };
            }

            outputChannel.appendLine(`Stack frame details: frameId=${stackItem.frameId}, threadId=${stackItem.threadId}`);

            // Check if we have valid frame and thread IDs
            if (stackItem.frameId === undefined || stackItem.threadId === undefined) {
                outputChannel.appendLine(`Invalid frame or thread ID: frameId=${stackItem.frameId}, threadId=${stackItem.threadId}`);
                return { success: false, message: 'Invalid frame or thread ID' };
            }

            outputChannel.appendLine(`Making scopes request with frameId: ${stackItem.frameId}`);
            
            // Get scopes (local, global, etc.)
            const scopesResponse = await session.customRequest('scopes', {
                frameId: stackItem.frameId
            });

            outputChannel.appendLine(`Scopes response: ${JSON.stringify(scopesResponse)}`);

            const variables: any = {};
            
            for (const scope of scopesResponse.scopes) {
                if (!scopeType || scope.name.toLowerCase().includes(scopeType.toLowerCase())) {
                    outputChannel.appendLine(`Getting variables for scope: ${scope.name} (ref: ${scope.variablesReference})`);
                    
                    // Get variables for this scope
                    const variablesResponse = await session.customRequest('variables', {
                        variablesReference: scope.variablesReference
                    });

                    outputChannel.appendLine(`Variables in ${scope.name}: ${JSON.stringify(variablesResponse)}`);

                    const scopeVars: any = {};
                    for (const variable of variablesResponse.variables) {
                        scopeVars[variable.name] = {
                            value: variable.value,
                            type: variable.type || 'unknown'
                        };
                    }
                    variables[scope.name] = scopeVars;
                }
            }

            return { 
                success: true, 
                variables, 
                frameInfo: {
                    threadId: stackItem.threadId,
                    frameId: stackItem.frameId,
                    sessionId: session.id
                }
            };
        } catch (error) {
            outputChannel.appendLine(`getVariables error: ${error}`);
            return { success: false, message: `Failed to get variables: ${error}` };
        }
    });

    // Register a command for evaluating expressions
    let evaluateExpressionCommand = vscode.commands.registerCommand('copilot-debug-tool.evaluateExpression', async (expression: string) => {
        try {
            outputChannel.appendLine(`evaluateExpression called with: ${expression}`);
            
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                outputChannel.appendLine('No active debug session found');
                return { success: false, message: 'No active debug session' };
            }

            const stackItem = vscode.debug.activeStackItem;
            if (!stackItem || !(stackItem instanceof vscode.DebugStackFrame)) {
                outputChannel.appendLine('No active stack frame found or invalid type');
                return { success: false, message: 'No active stack frame' };
            }

            outputChannel.appendLine(`Making evaluate request with frameId: ${stackItem.frameId}, expression: ${expression}`);

            const result = await session.customRequest('evaluate', {
                expression: expression,
                frameId: stackItem.frameId,
                context: 'repl'
            });

            outputChannel.appendLine(`Evaluate result: ${JSON.stringify(result)}`);

            return { 
                success: true, 
                expression,
                result: result.result,
                type: result.type || 'unknown'
            };
        } catch (error) {
            outputChannel.appendLine(`evaluateExpression error: ${error}`);
            return { success: false, message: `Failed to evaluate expression: ${error}` };
        }
    });

    // Register a command for getting call stack
    let getCallStackCommand = vscode.commands.registerCommand('copilot-debug-tool.getCallStack', async () => {
        try {
            outputChannel.appendLine('getCallStack called');
            
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                outputChannel.appendLine('No active debug session found');
                return { success: false, message: 'No active debug session' };
            }

            const stackItem = vscode.debug.activeStackItem;
            if (!stackItem || !(stackItem instanceof vscode.DebugStackFrame)) {
                outputChannel.appendLine('No active stack frame found or invalid type');
                return { success: false, message: 'No active stack frame' };
            }

            outputChannel.appendLine(`Making stackTrace request with threadId: ${stackItem.threadId}`);

            const stackResponse = await session.customRequest('stackTrace', {
                threadId: stackItem.threadId
            });

            outputChannel.appendLine(`Stack trace result: ${JSON.stringify(stackResponse)}`);

            const callStack = stackResponse.stackFrames.map((frame: any) => ({
                id: frame.id,
                name: frame.name,
                source: frame.source ? frame.source.path : 'unknown',
                line: frame.line,
                column: frame.column
            }));

            return { 
                success: true, 
                callStack,
                currentFrame: {
                    threadId: stackItem.threadId,
                    frameId: stackItem.frameId
                }
            };
        } catch (error) {
            outputChannel.appendLine(`getCallStack error: ${error}`);
            return { success: false, message: `Failed to get call stack: ${error}` };
        }
    });

    // Helper functions for direct UI calls
    async function getVariablesDirectly(scopeType?: string, outputChannel?: vscode.OutputChannel) {
        try {
            if (outputChannel) {
                outputChannel.appendLine(`getVariables called with scope: ${scopeType}`);
            }
            
            const session = vscode.debug.activeDebugSession;
            if (outputChannel) {
                outputChannel.appendLine(`Active session: ${session?.id}, ${session?.type}, ${session?.name}`);
            }
            if (!session) {
                if (outputChannel) {
                    outputChannel.appendLine('No active debug session found');
                }
                return { success: false, message: 'No active debug session' };
            }

            const stackItem = vscode.debug.activeStackItem;
            
            if (!stackItem || !(stackItem instanceof vscode.DebugStackFrame)) {
                if (outputChannel) {
                    outputChannel.appendLine(`Invalid stack item - not a DebugStackFrame. Type: ${stackItem?.constructor?.name}`);
                }
                return { success: false, message: 'No active stack frame or invalid stack frame type' };
            }

            if (outputChannel) {
                outputChannel.appendLine(`Stack frame details: frameId=${stackItem.frameId}, threadId=${stackItem.threadId}`);
            }

            if (stackItem.frameId === undefined || stackItem.threadId === undefined) {
                if (outputChannel) {
                    outputChannel.appendLine(`Invalid frame or thread ID: frameId=${stackItem.frameId}, threadId=${stackItem.threadId}`);
                }
                return { success: false, message: 'Invalid frame or thread ID' };
            }

            if (outputChannel) {
                outputChannel.appendLine(`Making scopes request with frameId: ${stackItem.frameId}`);
            }
            
            const scopesResponse = await session.customRequest('scopes', {
                frameId: stackItem.frameId
            });

            if (outputChannel) {
                outputChannel.appendLine(`Scopes response: ${JSON.stringify(scopesResponse)}`);
            }

            const variables: any = {};
            
            for (const scope of scopesResponse.scopes) {
                if (!scopeType || scope.name.toLowerCase().includes(scopeType.toLowerCase())) {
                    if (outputChannel) {
                        outputChannel.appendLine(`Getting variables for scope: ${scope.name} (ref: ${scope.variablesReference})`);
                    }
                    
                    const variablesResponse = await session.customRequest('variables', {
                        variablesReference: scope.variablesReference
                    });

                    if (outputChannel) {
                        outputChannel.appendLine(`Variables in ${scope.name}: ${JSON.stringify(variablesResponse)}`);
                    }

                    const scopeVars: any = {};
                    for (const variable of variablesResponse.variables) {
                        scopeVars[variable.name] = {
                            value: variable.value,
                            type: variable.type || 'unknown'
                        };
                    }
                    variables[scope.name] = scopeVars;
                }
            }

            return { 
                success: true, 
                variables, 
                frameInfo: {
                    threadId: stackItem.threadId,
                    frameId: stackItem.frameId,
                    sessionId: session.id
                }
            };
        } catch (error) {
            if (outputChannel) {
                outputChannel.appendLine(`getVariables error: ${error}`);
            }
            return { success: false, message: `Failed to get variables: ${error}` };
        }
    }

    async function evaluateExpressionDirectly(expression: string, outputChannel?: vscode.OutputChannel) {
        try {
            if (outputChannel) {
                outputChannel.appendLine(`evaluateExpression called with: ${expression}`);
            }
            
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                if (outputChannel) {
                    outputChannel.appendLine('No active debug session found');
                }
                return { success: false, message: 'No active debug session' };
            }

            const stackItem = vscode.debug.activeStackItem;
            if (!stackItem || !(stackItem instanceof vscode.DebugStackFrame)) {
                if (outputChannel) {
                    outputChannel.appendLine('No active stack frame found or invalid type');
                }
                return { success: false, message: 'No active stack frame' };
            }

            if (outputChannel) {
                outputChannel.appendLine(`Making evaluate request with frameId: ${stackItem.frameId}, expression: ${expression}`);
            }

            const result = await session.customRequest('evaluate', {
                expression: expression,
                frameId: stackItem.frameId,
                context: 'repl'
            });

            if (outputChannel) {
                outputChannel.appendLine(`Evaluate result: ${JSON.stringify(result)}`);
            }

            return { 
                success: true, 
                expression,
                result: result.result,
                type: result.type || 'unknown'
            };
        } catch (error) {
            if (outputChannel) {
                outputChannel.appendLine(`evaluateExpression error: ${error}`);
            }
            return { success: false, message: `Failed to evaluate expression: ${error}` };
        }
    }

    async function getCallStackDirectly(outputChannel?: vscode.OutputChannel) {
        try {
            if (outputChannel) {
                outputChannel.appendLine('getCallStack called');
            }
            
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                if (outputChannel) {
                    outputChannel.appendLine('No active debug session found');
                }
                return { success: false, message: 'No active debug session' };
            }

            const stackItem = vscode.debug.activeStackItem;
            if (!stackItem || !(stackItem instanceof vscode.DebugStackFrame)) {
                if (outputChannel) {
                    outputChannel.appendLine('No active stack frame found or invalid type');
                }
                return { success: false, message: 'No active stack frame' };
            }

            if (outputChannel) {
                outputChannel.appendLine(`Making stackTrace request with threadId: ${stackItem.threadId}`);
            }

            const stackResponse = await session.customRequest('stackTrace', {
                threadId: stackItem.threadId
            });

            if (outputChannel) {
                outputChannel.appendLine(`Stack trace result: ${JSON.stringify(stackResponse)}`);
            }

            const callStack = stackResponse.stackFrames.map((frame: any) => ({
                id: frame.id,
                name: frame.name,
                source: frame.source ? frame.source.path : 'unknown',
                line: frame.line,
                column: frame.column
            }));

            return { 
                success: true, 
                callStack,
                currentFrame: {
                    threadId: stackItem.threadId,
                    frameId: stackItem.frameId
                }
            };
        } catch (error) {
            if (outputChannel) {
                outputChannel.appendLine(`getCallStack error: ${error}`);
            }
            return { success: false, message: `Failed to get call stack: ${error}` };
        }
    }

    async function getDebugStatusDirectly() {
        try {
            const session = vscode.debug.activeDebugSession;
            const stackItem = vscode.debug.activeStackItem;
            
            return {
                success: true,
                status: {
                    hasSession: !!session,
                    sessionId: session?.id,
                    sessionType: session?.type,
                    sessionName: session?.name,
                    hasStackItem: !!stackItem,
                    frameId: (stackItem instanceof vscode.DebugStackFrame) ? stackItem.frameId : null,
                    threadId: stackItem?.threadId,
                    stackItemType: stackItem?.constructor?.name
                }
            };
        } catch (error) {
            return { success: false, message: `Failed to get debug status: ${error}` };
        }
    }

    // Register a command to show the debug UI
    let showUICommand = vscode.commands.registerCommand('copilot-debug-tool.showUI', () => {
        const panel = vscode.window.createWebviewPanel(
            'copilotDebugUI',
            'Copilot Debug Tool',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'startDebug':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.startDebug', message.configName);
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'continue':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.continue');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'pause':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.pause');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'stepOver':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.stepOver');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'stepInto':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.stepInto');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'stepOut':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.stepOut');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'stop':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.stop');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'addBreakpoint':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.addBreakpoint', message.filePath, message.lineNumber);
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'getVariables':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.getVariables', message.scopeType);
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'evaluateExpression':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.evaluateExpression', message.expression);
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'getCallStack':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.getCallStack');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                    case 'debugStatus':
                        try {
                            const result = await vscode.commands.executeCommand('copilot-debug-tool.debugStatus');
                            panel.webview.postMessage({ command: 'result', data: result });
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', data: `Error: ${error}` });
                        }
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    function getWebviewContent() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Copilot Debug Tool</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 5px;
            background-color: var(--vscode-editor-background);
        }
        .section h3 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 5px;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin: 5px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            cursor: not-allowed;
        }
        input, textarea {
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 6px;
            margin: 5px;
            border-radius: 3px;
            font-family: var(--vscode-font-family);
            font-size: 13px;
        }
        input:focus, textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .input-group {
            display: flex;
            align-items: center;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        .input-group label {
            margin-right: 10px;
            min-width: 100px;
        }
        .input-group input {
            flex: 1;
            min-width: 200px;
        }
        #output {
            background-color: var(--vscode-terminal-background);
            color: var(--vscode-terminal-foreground);
            padding: 10px;
            border-radius: 3px;
            white-space: pre-wrap;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 20px;
            border: 1px solid var(--vscode-panel-border);
        }
        .button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 10px 0;
        }
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-active {
            background-color: #4CAF50;
        }
        .status-inactive {
            background-color: #f44336;
        }
    </style>
</head>
<body>
    <h2>🐛 Copilot Debug Tool Control Panel</h2>
    
    <div class="section">
        <h3>📊 Debug Status</h3>
        <button onclick="getDebugStatus()">🔍 Check Debug Status</button>
        <div id="statusDisplay" style="margin-top: 10px;"></div>
    </div>

    <div class="section">
        <h3>🎮 Debug Session Control</h3>
        <div class="input-group">
            <label for="configName">Config Name:</label>
            <input type="text" id="configName" placeholder="Leave empty for default config" />
        </div>
        <div class="button-row">
            <button onclick="startDebug()">▶️ Start Debug</button>
            <button onclick="continueDebug()">⏩ Continue</button>
            <button onclick="pauseDebug()">⏸️ Pause</button>
            <button onclick="stopDebug()">⏹️ Stop</button>
        </div>
    </div>

    <div class="section">
        <h3>👣 Step Controls</h3>
        <div class="button-row">
            <button onclick="stepOver()">⤵️ Step Over</button>
            <button onclick="stepInto()">⤴️ Step Into</button>
            <button onclick="stepOut()">⤴️ Step Out</button>
        </div>
    </div>

    <div class="section">
        <h3>🔴 Breakpoint Management</h3>
        <div class="input-group">
            <label for="bpFilePath">File Path:</label>
            <input type="text" id="bpFilePath" placeholder="c:\\path\\to\\file.py" style="flex: 2;" />
        </div>
        <div class="input-group">
            <label for="bpLineNumber">Line Number:</label>
            <input type="number" id="bpLineNumber" placeholder="24" min="1" />
        </div>
        <button onclick="addBreakpoint()">🔴 Add Breakpoint</button>
    </div>

    <div class="section">
        <h3>📊 Variable Inspection</h3>
        <div class="input-group">
            <label for="scopeFilter">Scope Filter:</label>
            <input type="text" id="scopeFilter" placeholder="local, global, or leave empty for all" />
        </div>
        <button onclick="getVariables()">📋 Get Variables</button>
    </div>

    <div class="section">
        <h3>🔍 Expression Evaluation</h3>
        <div class="input-group">
            <label for="expression">Expression:</label>
            <input type="text" id="expression" placeholder="num * 2, len(numbers), etc." style="flex: 2;" />
        </div>
        <button onclick="evaluateExpression()">🔍 Evaluate</button>
    </div>

    <div class="section">
        <h3>📞 Call Stack</h3>
        <button onclick="getCallStack()">📞 Get Call Stack</button>
    </div>

    <div class="section">
        <h3>📝 Output</h3>
        <button onclick="clearOutput()" style="float: right;">🗑️ Clear</button>
        <div id="output">Ready to debug! Click any button above to get started.</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'result':
                    displayResult(message.data);
                    break;
                case 'error':
                    displayError(message.data);
                    break;
            }
        });

        function displayResult(result) {
            const output = document.getElementById('output');
            const timestamp = new Date().toLocaleTimeString();
            output.innerHTML += \`[\${timestamp}] ✅ SUCCESS:\\n\${JSON.stringify(result, null, 2)}\\n\\n\`;
            output.scrollTop = output.scrollHeight;
        }

        function displayError(error) {
            const output = document.getElementById('output');
            const timestamp = new Date().toLocaleTimeString();
            output.innerHTML += \`[\${timestamp}] ❌ ERROR: \${error}\\n\\n\`;
            output.scrollTop = output.scrollHeight;
        }

        function clearOutput() {
            document.getElementById('output').innerHTML = 'Output cleared.\\n';
        }

        function startDebug() {
            const configName = document.getElementById('configName').value.trim() || undefined;
            vscode.postMessage({
                command: 'startDebug',
                configName: configName
            });
        }

        function continueDebug() {
            vscode.postMessage({ command: 'continue' });
        }

        function pauseDebug() {
            vscode.postMessage({ command: 'pause' });
        }

        function stopDebug() {
            vscode.postMessage({ command: 'stop' });
        }

        function stepOver() {
            vscode.postMessage({ command: 'stepOver' });
        }

        function stepInto() {
            vscode.postMessage({ command: 'stepInto' });
        }

        function stepOut() {
            vscode.postMessage({ command: 'stepOut' });
        }

        function addBreakpoint() {
            const filePath = document.getElementById('bpFilePath').value.trim();
            const lineNumber = parseInt(document.getElementById('bpLineNumber').value);
            
            if (!filePath || !lineNumber) {
                displayError('Please provide both file path and line number for breakpoint');
                return;
            }
            
            vscode.postMessage({
                command: 'addBreakpoint',
                filePath: filePath,
                lineNumber: lineNumber
            });
        }

        function getVariables() {
            const scopeType = document.getElementById('scopeFilter').value.trim() || undefined;
            vscode.postMessage({
                command: 'getVariables',
                scopeType: scopeType
            });
        }

        function evaluateExpression() {
            const expression = document.getElementById('expression').value.trim();
            
            if (!expression) {
                displayError('Please provide an expression to evaluate');
                return;
            }
            
            vscode.postMessage({
                command: 'evaluateExpression',
                expression: expression
            });
        }

        function getCallStack() {
            vscode.postMessage({ command: 'getCallStack' });
        }

        function getDebugStatus() {
            vscode.postMessage({ command: 'debugStatus' });
        }

        // Auto-fill current file path for breakpoints
        function autoFillCurrentFile() {
            // This would be filled by the extension dynamically
            const currentFile = ''; // Will be populated by extension
            document.getElementById('bpFilePath').value = currentFile;
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            autoFillCurrentFile();
            getDebugStatus(); // Check initial status
        });
    </script>
</body>
</html>`;
    }

    let debugCommand = vscode.commands.registerCommand('copilot-debug-tool.debug', async (args: any) => {
        try {
            // Handle both old parameter style and new object parameter style
            let action: string;
            let configName: string | undefined;
            let breakpoints: Array<{file: string, line: number}> | undefined;
            let expression: string | undefined;
            let scopeFilter: string | undefined;

            if (typeof args === 'string') {
                // Old style: first parameter is action string
                action = args;
                configName = arguments[1];
                breakpoints = arguments[2];
                expression = arguments[3];
                scopeFilter = arguments[4];
            } else if (args && typeof args === 'object') {
                // New style: single object parameter
                action = args.action;
                configName = args.configName;
                breakpoints = args.breakpoints;
                expression = args.expression;
                scopeFilter = args.scopeFilter;
            } else {
                throw new Error('Invalid parameters provided to debug command');
            }

            if (!action) {
                throw new Error('Action parameter is required');
            }

            // Add breakpoints if provided
            if (breakpoints && Array.isArray(breakpoints)) {
                for (const bp of breakpoints) {
                    try {
                        const uri = vscode.Uri.file(bp.file);
                        const position = new vscode.Position(bp.line - 1, 0);
                        const location = new vscode.Location(uri, position);
                        const breakpoint = new vscode.SourceBreakpoint(location);
                        vscode.debug.addBreakpoints([breakpoint]);
                    } catch (bpError) {
                        // Use vscode output channel instead of console
                        vscode.window.showWarningMessage(`Failed to add breakpoint at ${bp.file}:${bp.line}: ${bpError}`);
                    }
                }
            }

            // Execute the requested action
            switch (action) {
                case 'start':
                    if (configName) {
                        await vscode.debug.startDebugging(undefined, configName);
                    } else {
                        // Start with the first available configuration or create a default one
                        const configs = vscode.workspace.getConfiguration('launch').get('configurations') as any[];
                        if (configs && configs.length > 0) {
                            await vscode.debug.startDebugging(undefined, configs[0]);
                        } else {
                            // Default debug configuration
                            const defaultConfig = {
                                name: 'Default Debug',
                                type: 'node',
                                request: 'launch',
                                program: '${file}'
                            };
                            await vscode.debug.startDebugging(undefined, defaultConfig);
                        }
                    }
                    break;
                case 'continue':
                    await vscode.commands.executeCommand('workbench.action.debug.continue');
                    break;
                case 'pause':
                    await vscode.commands.executeCommand('workbench.action.debug.pause');
                    break;
                case 'stepOver':
                    await vscode.commands.executeCommand('workbench.action.debug.stepOver');
                    break;
                case 'stepInto':
                    await vscode.commands.executeCommand('workbench.action.debug.stepInto');
                    break;
                case 'stepOut':
                    await vscode.commands.executeCommand('workbench.action.debug.stepOut');
                    break;
                case 'stop':
                    await vscode.commands.executeCommand('workbench.action.debug.stop');
                    break;
                case 'getVariables':
                    return await vscode.commands.executeCommand('copilot-debug-tool.getVariables', scopeFilter);
                case 'evaluateExpression':
                    if (!expression) {
                        throw new Error('Expression required for evaluateExpression action');
                    }
                    return await vscode.commands.executeCommand('copilot-debug-tool.evaluateExpression', expression);
                case 'getCallStack':
                    return await vscode.commands.executeCommand('copilot-debug-tool.getCallStack');
                case 'debugStatus':
                    return await vscode.commands.executeCommand('copilot-debug-tool.debugStatus');
                default:
                    throw new Error(`Unknown debug action: ${action}`);
            }

            return { success: true, action, message: `Debug action '${action}' executed successfully` };
        } catch (error) {
            return { success: false, message: `Failed to execute debug action: ${error}` };
        }
    });

    // Add all commands to subscriptions
    context.subscriptions.push(
        startDebugCommand,
        continueDebugCommand,
        pauseDebugCommand,
        stepOverCommand,
        stepIntoCommand,
        stepOutCommand,
        stopDebugCommand,
        addBreakpointCommand,
        getVariablesCommand,
        evaluateExpressionCommand,
        getCallStackCommand,
        debugStatusCommand,
        debugCommand,
        showUICommand
    );

    // If the Language Model Tools API becomes available in the future, register the tool
    if ((vscode as any).lm && (vscode as any).lm.registerTool) {
        try {
            const disposable = (vscode as any).lm.registerTool(
                'debug',
                async (args: any, api: any, _context: any) => {
                    const { action, configName, breakpoints } = args ?? {};

                    // Add requested breakpoints (optional)
                    if (Array.isArray(breakpoints)) {
                        const bpObjs = await Promise.all(
                            breakpoints.map(async (bp: any) => {
                                const uri = vscode.Uri.file(bp.file);
                                const loc = new vscode.Location(uri, new vscode.Position(bp.line - 1, 0));
                                return new vscode.SourceBreakpoint(loc);
                            })
                        );
                        vscode.debug.addBreakpoints(bpObjs);
                    }

                    // Map 'action' to VS Code commands / APIs
                    switch (action) {
                        case 'start':
                            if (configName) {
                                await vscode.debug.startDebugging(undefined, configName);
                            } else {
                                // Start with the first available configuration or create a default one
                                const configs = vscode.workspace.getConfiguration('launch').get('configurations') as any[];
                                if (configs && configs.length > 0) {
                                    await vscode.debug.startDebugging(undefined, configs[0]);
                                } else {
                                    // Default debug configuration
                                    const defaultConfig = {
                                        name: 'Default Debug',
                                        type: 'node',
                                        request: 'launch',
                                        program: '${file}'
                                    };
                                    await vscode.debug.startDebugging(undefined, defaultConfig);
                                }
                            }
                            break;
                        case 'continue':
                            await vscode.commands.executeCommand('workbench.action.debug.continue');
                            break;
                        case 'pause':
                            await vscode.commands.executeCommand('workbench.action.debug.pause');
                            break;
                        case 'stepOver':
                            await vscode.commands.executeCommand('workbench.action.debug.stepOver');
                            break;
                        case 'stepInto':
                            await vscode.commands.executeCommand('workbench.action.debug.stepInto');
                            break;
                        case 'stepOut':
                            await vscode.commands.executeCommand('workbench.action.debug.stepOut');
                            break;
                        case 'stop':
                            await vscode.commands.executeCommand('workbench.action.debug.stop');
                            break;
                        default:
                            if (api && api.showErrorMessage) {
                                api.showErrorMessage(`Unknown debug action: ${action}`);
                            }
                    }

                    /* A tool must return JSON‑serializable data */
                    return { ok: true, action };
                }
            );

            context.subscriptions.push(disposable);
        } catch (error) {
            // Language Model Tools API not available yet
        }
    }
}

export function deactivate() {}
