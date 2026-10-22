// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/chat/common/chatSettings.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/chat/common/chatSettings.ts
var ALWAYS_CHECKED_EDIT_PATTERNS, DEFAULT_EDIT_AUTO_APPROVE_PATTERNS;

var init_chatSettings = __esm({
  "src/vs/platform/chat/common/chatSettings.ts"() {
    ALWAYS_CHECKED_EDIT_PATTERNS = {
      "**/.mcp.json": false,
      "**/.npmrc": false,
      "**/.vscode/*.json": false,
      "**/.github/agents/**": false,
      "**/.github/hooks/**": false,
      "**/.claude/agents/**": false,
      "**/.claude/settings.json": false,
      "**/.claude/settings.local.json": false
    };
    DEFAULT_EDIT_AUTO_APPROVE_PATTERNS = {
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
  }
});
export { ALWAYS_CHECKED_EDIT_PATTERNS, DEFAULT_EDIT_AUTO_APPROVE_PATTERNS, init_chatSettings };
