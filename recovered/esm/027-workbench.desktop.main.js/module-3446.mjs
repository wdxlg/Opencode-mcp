// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/lspTerminalUtil.ts



// src/vs/workbench/contrib/terminalContrib/suggest/browser/lspTerminalUtil.ts
var VSCODE_LSP_TERMINAL_PROMPT_TRACKER = "vscode_lsp_terminal_prompt_tracker= {}\n";

var terminalLspSupportedLanguages = /* @__PURE__ */ new Set([
  {
    shellType: "python",
    languageId: "python",
    extension: "py"
  }
]);

function getTerminalLspSupportedLanguageObj(shellType) {
  for (const supportedLanguage of terminalLspSupportedLanguages) {
    if (supportedLanguage.shellType === shellType) {
      return supportedLanguage;
    }
  }
  return void 0;
}
export { getTerminalLspSupportedLanguageObj, VSCODE_LSP_TERMINAL_PROMPT_TRACKER, terminalLspSupportedLanguages };
