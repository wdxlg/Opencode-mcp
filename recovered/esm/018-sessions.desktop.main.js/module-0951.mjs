// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/chat/common/chatSettings.ts



// src/vs/platform/chat/common/chatSettings.ts
var ChatAIDisabledSettingId = "chat.disableAIFeatures";

var ChatMicrosoftAuthenticationEnabledSettingId = "chat.microsoftAuthentication.enabled";

var ALWAYS_CHECKED_EDIT_PATTERNS = {
  "**/.mcp.json": false,
  "**/.npmrc": false,
  "**/.vscode/*.json": false,
  "**/.github/agents/**": false,
  "**/.github/hooks/**": false,
  "**/.claude/agents/**": false,
  "**/.claude/settings.json": false,
  "**/.claude/settings.local.json": false
};

var DEFAULT_EDIT_AUTO_APPROVE_PATTERNS = {
  "**/*": true,
  "**/.git/**": false,
  "**/{package.json,server.xml,build.rs,web.config,.gitattributes,.env,Cargo.toml}": false,
  "**/{.npmrc,.yarnrc,.yarnrc.yml,.pnpmfile.js,.pnpmfile.cjs,.pnpmfile.mjs,pnpm-workspace.yaml}": false,
  "**/*.{code-workspace,csproj,fsproj,vbproj,vcxproj,proj,targets,props,gradle,gradle.kts}": false,
  "**/gradle.properties": false,
  "**/ruby_lsp/*/addon": false,
  "**/*.lock": false,
  "**/*-lock.{yaml,json}": false,
  ...ALWAYS_CHECKED_EDIT_PATTERNS
};

function mergeChatEditAutoApprovePatterns(value2) {
  const patterns = { ...DEFAULT_EDIT_AUTO_APPROVE_PATTERNS };
  if (typeof value2 !== "object" || value2 === null || Array.isArray(value2)) {
    return patterns;
  }
  for (const [pattern, isApproved] of Object.entries(value2)) {
    delete patterns[pattern];
    patterns[pattern] = isApproved === true;
  }
  return patterns;
}
export { mergeChatEditAutoApprovePatterns, ChatAIDisabledSettingId, ChatMicrosoftAuthenticationEnabledSettingId, ALWAYS_CHECKED_EDIT_PATTERNS, DEFAULT_EDIT_AUTO_APPROVE_PATTERNS };
