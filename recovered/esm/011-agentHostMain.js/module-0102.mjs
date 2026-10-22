// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentChatSurfaceMeta.ts



// src/vs/platform/agentHost/common/meta/agentChatSurfaceMeta.ts
var VSCODE_CHAT_SURFACE_META_KEY = "vscode.chat.surface";

function readChatSurfaceMeta(source) {
  const value = source._meta?.[VSCODE_CHAT_SURFACE_META_KEY];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  switch (raw["surface"]) {
    case "terminal":
      if (raw["shellType"] !== void 0 && typeof raw["shellType"] !== "string" || typeof raw["osName"] !== "string") {
        return void 0;
      }
      return {
        surface: "terminal",
        ...typeof raw["shellType"] === "string" ? { shellType: raw["shellType"] } : {},
        osName: raw["osName"]
      };
    case "editorInline":
      if (raw["languageId"] !== void 0 && typeof raw["languageId"] !== "string") {
        return void 0;
      }
      return {
        surface: "editorInline",
        ...typeof raw["languageId"] === "string" ? { languageId: raw["languageId"] } : {},
        ...typeof raw["targetUri"] === "string" ? { targetUri: raw["targetUri"] } : {}
      };
    default:
      return void 0;
  }
}

function withChatSurfaceMeta(meta, surface) {
  if (!surface) {
    return meta;
  }
  const serializedSurface = surface.surface === "terminal" ? {
    surface: surface.surface,
    ...surface.shellType !== void 0 ? { shellType: surface.shellType } : {},
    osName: surface.osName
  } : {
    surface: "editorInline",
    ...surface.languageId !== void 0 ? { languageId: surface.languageId } : {},
    ...surface.targetUri !== void 0 ? { targetUri: surface.targetUri } : {}
  };
  return {
    ...meta ?? {},
    [VSCODE_CHAT_SURFACE_META_KEY]: serializedSurface
  };
}

function isPowerShell(shellType) {
  return shellType === "ps1" || shellType === "pwsh" || shellType === "powershell";
}

function createTerminalChatInstruction(surface) {
  const shellType = surface.shellType;
  return [
    "<terminal_chat>",
    "You specialize in the command line. Help the user craft a command to run.",
    `- You're targeting ${surface.osName}.`,
    ...shellType ? [`- The active shell is ${shellType}.`] : [],
    "- Prefer single-line commands. Omit explanations unless the command is complex; then be concise.",
    "- Always put each command in its own fenced Markdown code block using triple backticks, never in plain text or inline code. Use the shell type as the code block language when known.",
    "- Use `{placeholder_text}` for required replacement text that the user did not provide.",
    ...shellType && isPowerShell(shellType) ? [
      "- Prefer idiomatic PowerShell: use `Stop-Process` or `Get-NetTCPConnection` instead of `kill` or `lsof`.",
      "- Prefer cross-platform PowerShell and use Unix utilities only when PowerShell has no equivalent."
    ] : shellType ? ["- Only use Python or Perl when the shell cannot accomplish the task."] : [],
    `- Do not try to accomplish the task yourself, instead provide a${shellType ? ` ${shellType}` : ""} command to run.`,
    "- Avoid extraneous steps or context-gathering prior to providing the command, unless context is required to resolve ambiguity.",
    "</terminal_chat>"
  ].join("\n");
}

function createEditorInlineChatInstruction(surface) {
  return [
    "<editor_inline_chat>",
    "You specialize in focused inline edits. Make the requested change directly.",
    "- Edit only the file attached as the current editor context. Do not create, delete, or modify other files.",
    "- Make the smallest edit that satisfies the request; preserve surrounding style and indentation.",
    "- Focus on the user's selected range when one is provided.",
    "- Avoid broad repository exploration or context-gathering unless required to resolve ambiguity.",
    "- After making the edit, stop; do not run tests, builds, linters, or other verification, and never summarize the change.",
    "- Produce the edit directly rather than explaining it or writing a tutorial.",
    ...surface.languageId !== void 0 ? [`- The file's language is ${surface.languageId}.`] : [],
    "</editor_inline_chat>"
  ].join("\n");
}
export { readChatSurfaceMeta, withChatSurfaceMeta, isPowerShell, createTerminalChatInstruction, createEditorInlineChatInstruction, VSCODE_CHAT_SURFACE_META_KEY };
