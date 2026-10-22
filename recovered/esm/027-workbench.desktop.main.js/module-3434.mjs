// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/sendSequence/browser/terminal.sendSequence.contribution.ts
import { isObject, isString } from "./module-0010.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { registerTerminalAction } from "./module-3272.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { isIOS, isMacintosh, isWindows } from "./module-0014.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/terminalContrib/sendSequence/browser/terminal.sendSequence.contribution.ts
function toOptionalString2(obj) {
  return isString(obj) ? obj : void 0;
}

var terminalSendSequenceCommand = async (accessor, args2) => {
  const quickInputService = accessor.get(IQuickInputService);
  const configurationResolverService = accessor.get(IConfigurationResolverService);
  const workspaceContextService = accessor.get(IWorkspaceContextService);
  const historyService = accessor.get(IHistoryService);
  const terminalService = accessor.get(ITerminalService);
  const instance2 = terminalService.activeInstance;
  if (instance2) {
    let isTextArg = function(obj) {
      return isObject(obj) && "text" in obj;
    };
    let text2 = isTextArg(args2) ? toOptionalString2(args2.text) : void 0;
    if (!text2) {
      text2 = await quickInputService.input({
        value: "",
        placeHolder: "Enter sequence to send (supports \\n, \\r, \\xAB)",
        prompt: localize(20827, null)
      });
      if (!text2) {
        return;
      }
      let processedText = text2.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
      while (true) {
        const match2 = processedText.match(/\\x([0-9a-fA-F]{2})/);
        if (match2 === null || match2.index === void 0 || match2.length < 2) {
          break;
        }
        processedText = processedText.slice(0, match2.index) + String.fromCharCode(parseInt(match2[1], 16)) + processedText.slice(match2.index + 4);
      }
      text2 = processedText;
    }
    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance2.hasRemoteAuthority ? Schemas.vscodeRemote : Schemas.file);
    const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text2);
    instance2.sendText(resolvedText, false);
  }
};

var sendSequenceString = localize2(20825, "Send Sequence");

registerTerminalAction({
  id: "workbench.action.terminal.sendSequence" /* SendSequence */,
  title: sendSequenceString,
  f1: true,
  metadata: {
    description: sendSequenceString.value,
    args: [{
      name: "args",
      schema: {
        type: "object",
        required: ["text"],
        properties: {
          text: {
            description: localize(20826, null),
            type: "string"
          }
        }
      }
    }]
  },
  run: (c, accessor, args2) => terminalSendSequenceCommand(accessor, args2)
});

function registerSendSequenceKeybinding(text2, rule) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "workbench.action.terminal.sendSequence" /* SendSequence */,
    weight: 200 /* WorkbenchContrib */,
    when: rule.when || TerminalContextKeys.focus,
    primary: rule.primary,
    mac: rule.mac,
    linux: rule.linux,
    win: rule.win,
    handler: terminalSendSequenceCommand,
    args: { text: text2 }
  });
}

if (isWindows) {
  const ctrlV = String.fromCharCode("V".charCodeAt(0) - 64 /* CtrlLetterOffset */);
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "workbench.action.terminal.pastePwsh" /* PastePwsh */,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "pwsh" /* PowerShell */), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
    primary: 2048 /* CtrlCmd */ | 52 /* KeyV */,
    handler: async (accessor) => {
      const clipboardService = accessor.get(IClipboardService);
      const commandService = accessor.get(ICommandService);
      if (!await clipboardService.readText() && await clipboardService.hasResources()) {
        return commandService.executeCommand("workbench.action.terminal.paste" /* Paste */);
      }
      return commandService.executeCommand("workbench.action.terminal.sendSequence" /* SendSequence */, { text: ctrlV });
    }
  });
}

registerSendSequenceKeybinding("\x1B[24~a", {
  // F12,a -> ctrl+space (MenuComplete)
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "pwsh" /* PowerShell */), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode" /* EnableWin32InputMode */}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  primary: 2048 /* CtrlCmd */ | 10 /* Space */,
  mac: { primary: 256 /* WinCtrl */ | 10 /* Space */ }
});

registerSendSequenceKeybinding("\x1B[24~b", {
  // F12,b -> alt+space (SetMark)
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "pwsh" /* PowerShell */), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode" /* EnableWin32InputMode */}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  primary: 512 /* Alt */ | 10 /* Space */
});

registerSendSequenceKeybinding("\x1B[24~c", {
  // F12,c -> shift+enter (AddLine)
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "pwsh" /* PowerShell */), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode" /* EnableWin32InputMode */}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  primary: 1024 /* Shift */ | 3 /* Enter */
});

registerSendSequenceKeybinding("\x1B[24~d", {
  // F12,d -> shift+end (SelectLine) - HACK: \x1b[1;2F is supposed to work but it doesn't
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "pwsh" /* PowerShell */), TerminalContextKeys.terminalShellIntegrationEnabled, ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode" /* EnableWin32InputMode */}`, true), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
  mac: { primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 17 /* RightArrow */ }
});

registerSendSequenceKeybinding("\x1B[1;2H", {
  // Shift+home
  when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "pwsh" /* PowerShell */), ContextKeyExpr.equals(`config.${"terminal.integrated.enableWin32InputMode" /* EnableWin32InputMode */}`, true)),
  mac: { primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 15 /* LeftArrow */ }
});

registerSendSequenceKeybinding("\x1B[1;5A", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 /* Alt */ | 16 /* UpArrow */
});

registerSendSequenceKeybinding("\x1B[1;5B", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 /* Alt */ | 18 /* DownArrow */
});

registerSendSequenceKeybinding("\x1B" + (isMacintosh ? "f" : "[1;5C"), {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 /* Alt */ | 17 /* RightArrow */
});

registerSendSequenceKeybinding("\x1B" + (isMacintosh ? "b" : "[1;5D"), {
  when: ContextKeyExpr.and(TerminalContextKeys.focus),
  primary: 512 /* Alt */ | 15 /* LeftArrow */
});

registerSendSequenceKeybinding("", {
  when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
  primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KeyR */,
  mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 48 /* KeyR */ }
});

registerSendSequenceKeybinding("\x07", {
  when: TerminalContextKeys.focus,
  primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 37 /* KeyG */,
  mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 37 /* KeyG */ }
});

if (isIOS) {
  registerSendSequenceKeybinding(String.fromCharCode("C".charCodeAt(0) - 64 /* CtrlLetterOffset */), {
    // ctrl+c
    when: ContextKeyExpr.and(TerminalContextKeys.focus),
    primary: 256 /* WinCtrl */ | 33 /* KeyC */
  });
}

registerSendSequenceKeybinding(String.fromCharCode("W".charCodeAt(0) - 64 /* CtrlLetterOffset */), {
  primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
  mac: { primary: 512 /* Alt */ | 1 /* Backspace */ }
});

if (isWindows) {
  registerSendSequenceKeybinding(String.fromCharCode("H".charCodeAt(0) - 64 /* CtrlLetterOffset */), {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* ShellType */, "cmd" /* CommandPrompt */)),
    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
  });
}

registerSendSequenceKeybinding("\x1Bd", {
  primary: 2048 /* CtrlCmd */ | 20 /* Delete */,
  mac: { primary: 512 /* Alt */ | 20 /* Delete */ }
});

registerSendSequenceKeybinding("", {
  mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ }
});

registerSendSequenceKeybinding(String.fromCharCode("A".charCodeAt(0) - 64), {
  mac: { primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */ }
});

registerSendSequenceKeybinding(String.fromCharCode("E".charCodeAt(0) - 64), {
  mac: { primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */ }
});

registerSendSequenceKeybinding("\0", {
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 23 /* Digit2 */,
  mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 23 /* Digit2 */ }
});

registerSendSequenceKeybinding("", {
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 27 /* Digit6 */,
  mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 27 /* Digit6 */ }
});
export { toOptionalString2, registerSendSequenceKeybinding, terminalSendSequenceCommand, sendSequenceString };
