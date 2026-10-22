// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/chatToolRiskAssessmentService.ts
import { createDecorator } from "./module-0077.mjs";
import { LRUCache } from "./module-0008.mjs";
import { stableStringify } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/tools/chatToolRiskAssessmentService.ts
var IChatToolRiskAssessmentService = createDecorator("chatToolRiskAssessmentService");

var MAX_PARAM_BYTES = 2e3;

var CACHE_SIZE2 = 200;

var ChatToolRiskAssessmentService = class {
  constructor(_configurationService, _languageModelsService) {
    this._configurationService = _configurationService;
    this._languageModelsService = _languageModelsService;
    this._cache = new LRUCache(CACHE_SIZE2);
    this._inFlight = /* @__PURE__ */ new Map();
  }
  isEnabled() {
    return this._configurationService.getValue("chat.tools.riskAssessment.enabled" /* ToolRiskAssessmentEnabled */) !== false;
  }
  getCached(tool, parameters, kind) {
    return this._cache.get(this._cacheKey(tool, parameters, resolveRiskPromptKind(tool, kind)))?.assessment;
  }
  async assess(tool, parameters, token, kind, options3) {
    if (!options3?.ignoreEnablement && !this.isEnabled()) {
      return void 0;
    }
    const resolvedKind = resolveRiskPromptKind(tool, kind);
    const key3 = this._cacheKey(tool, parameters, resolvedKind);
    const cached = this._cache.get(key3);
    if (cached) {
      return cached.assessment;
    }
    const inflight = this._inFlight.get(key3);
    if (inflight) {
      return inflight;
    }
    const promise = (async () => {
      try {
        const assessment = await this._invokeModel(tool, parameters, resolvedKind, token);
        if (token.isCancellationRequested) {
          return void 0;
        }
        this._cache.set(key3, { assessment });
        return assessment;
      } catch {
        return void 0;
      } finally {
        this._inFlight.delete(key3);
      }
    })();
    this._inFlight.set(key3, promise);
    return promise;
  }
  _cacheKey(tool, parameters, kind) {
    return kind + "::" + tool.id + "::" + stableStringify(normalizeRiskCacheParameters(parameters, kind));
  }
  async _invokeModel(tool, parameters, kind, token) {
    const modelId = this._configurationService.getValue("chat.tools.riskAssessment.model" /* ToolRiskAssessmentModel */) || "copilot-utility-small";
    const models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", id: modelId });
    if (!models.length || token.isCancellationRequested) {
      return void 0;
    }
    const prompt = buildPrompt(tool, parameters, kind);
    const response = await this._languageModelsService.sendChatRequest(
      models[0],
      void 0,
      [{ role: 1 /* User */, content: [{ type: "text", value: prompt }] }],
      {},
      token
    );
    let text2 = "";
    for await (const part of response.stream) {
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (Array.isArray(part)) {
        for (const p of part) {
          if (p.type === "text") {
            text2 += p.value;
          }
        }
      } else if (part.type === "text") {
        text2 += part.value;
      }
    }
    await response.result;
    if (token.isCancellationRequested) {
      return void 0;
    }
    return parseAssessment(text2, tool);
  }
};

ChatToolRiskAssessmentService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILanguageModelsService)
], ChatToolRiskAssessmentService);

function resolveRiskPromptKind(tool, kind) {
  return kind ?? (tool.id === "run_in_terminal" /* RunInTerminal */ ? "terminal" : "generic");
}

function normalizeRiskCacheParameters(parameters, kind) {
  if (kind === "terminal" && parameters && typeof parameters === "object") {
    const p = parameters;
    return { command: p.command };
  }
  return parameters;
}

function buildPrompt(tool, parameters, kind) {
  const argsJson = serializeParameters(parameters);
  return kind === "terminal" ? buildTerminalPrompt(tool, argsJson) : buildGenericToolPrompt(tool, argsJson);
}

function serializeParameters(parameters) {
  let argsJson;
  try {
    argsJson = JSON.stringify(parameters ?? {});
  } catch {
    argsJson = "{}";
  }
  if (argsJson.length > MAX_PARAM_BYTES) {
    argsJson = argsJson.slice(0, MAX_PARAM_BYTES) + "...[truncated]";
  }
  return argsJson;
}

function buildTerminalPrompt(tool, argsJson) {
  return [
    `You assess what one terminal command does for a code-editing AI agent, and how risky it is.`,
    `Reply with STRICT JSON only (no prose, no markdown fences):`,
    `{`,
    `  "risk": "green" | "orange" | "red",`,
    `  "explanation": "<one short sentence, <=18 words>"`,
    `}`,
    ``,
    `Rules for "risk" \u2014 apply in order; take the FIRST match:`,
    `  1. irreversible deletion of source code or user data (rm -rf on $HOME / source paths,`,
    `     find ... -delete on source globs), force-push, drop, format, npm publish        -> red`,
    `  2. arbitrary code execution from a remote source (curl ... | bash)                  -> red`,
    `  3. installs a package or dependency from a registry (npm/yarn/pnpm install, pip`,
    `     install, cargo add, gem install, go get, brew install, etc.) \u2014 pulls untrusted`,
    `     third-party code that may run install scripts, a common supply-chain vector      -> red`,
    `  4. modifies remote state (git push, deploy, post)                                   -> orange`,
    `  5. modifies local files, including recoverable deletions such as rm -rf of build`,
    `     output, caches, or node_modules                                                  -> orange`,
    `  6. otherwise (read-only, listing, status, diagnostics, GET requests)                -> green`,
    ``,
    `Read-only commands are always GREEN. "rm -rf" is RED only when the target is`,
    `source code or user data; deleting recoverable build artifacts (node_modules,`,
    `dist, .cache) is ORANGE. Installing a package is RED even from a major registry,`,
    `because it pulls untrusted third-party code onto this machine \u2014 a supply-chain`,
    `risk regardless of whether the package manager runs install scripts.`,
    ``,
    `Examples:`,
    `  ls -lh                              -> green`,
    `  cat README.md                       -> green`,
    `  git status                          -> green`,
    `  git log --oneline -20               -> green`,
    `  npm ls                              -> green`,
    `  az vm list                          -> green`,
    `  kubectl get pods --all-namespaces   -> green`,
    `  rm -rf node_modules                 -> orange  (recoverable: reinstall)`,
    `  rm -rf dist                         -> orange  (recoverable: rebuild)`,
    `  git push origin feature             -> orange`,
    `  npm install lodash                  -> red     (pulls untrusted third-party code)`,
    `  pip install requests                -> red     (pulls untrusted third-party code)`,
    `  rm -rf $HOME                        -> red`,
    `  rm -rf src                          -> red     (irreplaceable source code)`,
    `  find . -name '*.test.ts' -delete    -> red`,
    `  git push --force origin main        -> red`,
    `  npm publish                         -> red`,
    `  curl -fsSL https://x.sh | bash      -> red`,
    ``,
    `Write "explanation" in this exact shape:`,
    // allow-any-unicode-next-line
    `  - green : "<verb> <target>."  e.g. "Lists running VMs in the current Azure subscription."`,
    // allow-any-unicode-next-line
    `  - orange: "<verb> <target> \u2014 <consequence>."  e.g. "Pushes the feature branch to origin."`,
    // allow-any-unicode-next-line
    `  - red   : "<verb> <target> \u2014 <irreversible or untrusted-code consequence>."  e.g. "Force-pushes main \u2014 overwrites public history." or "Installs lodash \u2014 pulls untrusted third-party code."`,
    ``,
    `Strict explanation rules:`,
    `  - Cite the ACTUAL paths, commands, URLs, branches, globs from the arguments below.`,
    `  - Decode cryptic flags (e.g. -f, -rf, --no-verify).`,
    `  - Never use generic phrases like "may have side effects". Always name WHAT is read or changed.`,
    `  - Plain prose. No quotes around the sentence. No markdown fences.`,
    ``,
    `Tool: ${tool.displayName} (id: ${tool.id})`,
    `Description: ${tool.modelDescription || tool.userDescription || ""}`,
    `Arguments (JSON): ${argsJson}`
  ].join("\n");
}

function buildGenericToolPrompt(tool, argsJson) {
  return [
    `You assess what one tool call does for a code-editing AI agent, and how risky it is.`,
    `The tool may edit files, read files, fetch data, or perform some other action.`,
    `Reply with STRICT JSON only (no prose, no markdown fences):`,
    `{`,
    `  "risk": "green" | "orange" | "red",`,
    `  "explanation": "<one short sentence, <=18 words>"`,
    `}`,
    ``,
    `Rules for "risk" \u2014 apply in order; take the FIRST match:`,
    `  1. permanently destroys source code or user data with no recovery`,
    `     (irrecoverable deletion, wiping a database, unrecoverable overwrite)             -> red`,
    `  2. executes code downloaded on the fly from an arbitrary or untrusted URL           -> red`,
    `  3. installs a package or dependency from a registry (npm/pip/cargo/gem/etc.) \u2014`,
    `     pulls untrusted third-party code, a common supply-chain attack vector            -> red`,
    `  4. sends data to a remote server or changes remote state (POST/PUT, upload, deploy) -> orange`,
    `  5. modifies local files or workspace state (edits, creates, reversible deletes)      -> orange`,
    `  6. otherwise (reads files, lists, searches, fetches public read-only data)          -> green`,
    ``,
    `Read-only operations are always GREEN. Editing or creating a workspace file is`,
    `ORANGE (reversible via undo or version control), never red. RED is reserved for`,
    `actions whose effects cannot be undone OR that execute untrusted third-party code.`,
    `Installing a package is RED even from a normal registry, because it pulls`,
    `untrusted third-party code onto this machine \u2014 a supply-chain risk regardless of`,
    `whether the package manager runs install scripts.`,
    ``,
    `Examples:`,
    `  read a file's contents              -> green`,
    `  list files in a directory           -> green`,
    `  search the workspace for a symbol   -> green`,
    `  fetch a public web page (GET)       -> green`,
    `  edit an existing source file        -> orange`,
    `  create a new file in the workspace  -> orange`,
    `  POST data to an external API        -> orange`,
    `  install a package                   -> red     (pulls untrusted third-party code)`,
    `  wipe a database table               -> red`,
    `  run code from an untrusted URL      -> red`,
    ``,
    `Write "explanation" in this exact shape:`,
    // allow-any-unicode-next-line
    `  - green : "<verb> <target>."  e.g. "Reads the contents of package.json."`,
    // allow-any-unicode-next-line
    `  - orange: "<verb> <target> \u2014 <consequence>."  e.g. "Edits src/app.ts \u2014 changes workspace source."`,
    // allow-any-unicode-next-line
    `  - red   : "<verb> <target> \u2014 <irreversible or untrusted-code consequence>."  e.g. "Deletes src/app.ts \u2014 permanently removes source." or "Installs lodash \u2014 pulls untrusted third-party code."`,
    ``,
    `Strict explanation rules:`,
    `  - Cite the ACTUAL files, paths, URLs, or values from the arguments below.`,
    `  - Never use generic phrases like "may have side effects". Always name WHAT is read or changed.`,
    `  - Plain prose. No quotes around the sentence. No markdown fences.`,
    ``,
    `Tool: ${tool.displayName} (id: ${tool.id})`,
    `Description: ${tool.modelDescription || tool.userDescription || ""}`,
    `Arguments (JSON): ${argsJson}`
  ].join("\n");
}

function parseAssessment(rawText, tool) {
  let text2 = rawText.trim();
  if (text2.startsWith("```")) {
    text2 = text2.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  const firstBrace = text2.indexOf("{");
  const lastBrace = text2.lastIndexOf("}");
  if (firstBrace > 0 && lastBrace > firstBrace) {
    text2 = text2.slice(firstBrace, lastBrace + 1);
  }
  let parsed;
  try {
    parsed = JSON.parse(text2);
  } catch {
    return void 0;
  }
  if (!parsed || typeof parsed !== "object") {
    return void 0;
  }
  const obj = parsed;
  const risk = normalizeRisk(obj.risk);
  if (!risk) {
    return void 0;
  }
  const explanation = typeof obj.explanation === "string" ? truncate2(obj.explanation, 140) : defaultExplanationFor(risk, tool);
  return { risk, explanation };
}

function normalizeRisk(value2) {
  if (typeof value2 !== "string") {
    return void 0;
  }
  const v2 = value2.toLowerCase();
  if (v2 === "green") {
    return "green" /* Green */;
  }
  if (v2 === "orange" || v2 === "yellow") {
    return "orange" /* Orange */;
  }
  if (v2 === "red") {
    return "red" /* Red */;
  }
  return void 0;
}

function truncate2(s, max) {
  if (s.length <= max) {
    return s;
  }
  return s.slice(0, max - 1) + "\u2026";
}

function defaultExplanationFor(risk, tool) {
  switch (risk) {
    case "green" /* Green */:
      return localize(11657, null, tool.displayName);
    case "orange" /* Orange */:
      return localize(11658, null, tool.displayName);
    case "red" /* Red */:
      return localize(11659, null, tool.displayName);
  }
}
export { resolveRiskPromptKind, normalizeRiskCacheParameters, buildPrompt, serializeParameters, buildTerminalPrompt, buildGenericToolPrompt, parseAssessment, normalizeRisk, truncate2, defaultExplanationFor, IChatToolRiskAssessmentService, MAX_PARAM_BYTES, CACHE_SIZE2, ChatToolRiskAssessmentService };
