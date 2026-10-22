// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/scan/claudeRuleScan.ts
import { URI } from "./module-0023.mjs";
import { parseRuleFile, pathExists } from "./module-0126.mjs";
import { basename2 } from "./module-0025.mjs";
import { customizationId } from "./module-0047.mjs";


// src/vs/platform/agentHost/node/claude/customizations/scan/claudeRuleScan.ts
function claudeMemoryFiles(workingDirectory, userHome) {
  const files = [URI.joinPath(userHome, ".claude", "CLAUDE.md")];
  if (workingDirectory) {
    files.push(
      URI.joinPath(workingDirectory, "CLAUDE.md"),
      URI.joinPath(workingDirectory, ".claude", "CLAUDE.md"),
      URI.joinPath(workingDirectory, "CLAUDE.local.md")
    );
  }
  return files;
}

var MAX_RULE_SCAN_DEPTH = 32;

async function readMarkdownFilesRecursive(dir, fileService, seen = /* @__PURE__ */ new Set(), depth = 0) {
  const key = dir.toString();
  if (depth > MAX_RULE_SCAN_DEPTH || seen.has(key)) {
    return [];
  }
  seen.add(key);
  let stat3;
  try {
    stat3 = await fileService.resolve(dir);
  } catch {
    return [];
  }
  if (!stat3.isDirectory || !stat3.children) {
    return [];
  }
  const files = [];
  for (const child of stat3.children) {
    if (child.isDirectory) {
      files.push(...await readMarkdownFilesRecursive(child.resource, fileService, seen, depth + 1));
    } else if (child.isFile && child.resource.path.toLowerCase().endsWith(".md")) {
      files.push(child.resource);
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function scanClaudeRules(workingDirectory, userHome, fileService) {
  const result = [];
  for (const uri of claudeMemoryFiles(workingDirectory, userHome)) {
    if (await pathExists(uri, fileService)) {
      const ruleUri = uri.toString();
      const name = basename2(uri);
      const customization = {
        type: "rule" /* Rule */,
        id: customizationId(ruleUri),
        uri: ruleUri,
        name,
        alwaysApply: true
      };
      result.push({ uri, name, customization });
    }
  }
  const scopes = workingDirectory ? [workingDirectory, userHome] : [userHome];
  for (const scope of scopes) {
    const files = await readMarkdownFilesRecursive(URI.joinPath(scope, ".claude", "rules"), fileService);
    for (const uri of files) {
      const parsed = await parseRuleFile(uri, fileService);
      const ruleUri = uri.toString();
      const hasGlobs = !!parsed.globs?.length;
      const customization = {
        type: "rule" /* Rule */,
        id: customizationId(ruleUri),
        uri: ruleUri,
        name: parsed.name,
        ...parsed.description ? { description: parsed.description } : {},
        ...hasGlobs ? { globs: parsed.globs } : {},
        alwaysApply: !hasGlobs
      };
      result.push({ uri, name: parsed.name, ...parsed.description ? { description: parsed.description } : {}, customization });
    }
  }
  return result;
}
export { claudeMemoryFiles, readMarkdownFilesRecursive, scanClaudeRules, MAX_RULE_SCAN_DEPTH };
