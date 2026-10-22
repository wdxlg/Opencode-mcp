// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatGoalSummaryService.ts
import { createDecorator } from "./module-0077.mjs";
import { LRUCache } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";


// src/vs/workbench/contrib/chat/browser/chatGoalSummaryService.ts
var IChatGoalSummaryService = createDecorator("chatGoalSummaryService");

var MAX_PROMPT_CHARS = 4e3;

var MAX_SUMMARY_CHARS = 100;

var CACHE_SIZE = 50;

var REFUSAL_PREFIX_RE = /^(?:sorry\b|unfortunately\b|my apologies\b|as an ai\b|i\s+apologi[sz]e\b|i\s*['\u2019]?m\s+sorry\b|i\s+am\s+sorry\b|i\s*['\u2019]?m\s+unable\b|i\s+am\s+unable\b|i\s+am\s+not\s+able\b|i\s*(?:can['\u2019]?t|cannot|can\s?not|won['\u2019]?t)\b)/i;

var ChatGoalSummaryService = class {
  constructor(_languageModelsService) {
    this._languageModelsService = _languageModelsService;
    this._cache = new LRUCache(CACHE_SIZE);
    this._inFlight = /* @__PURE__ */ new Map();
  }
  async summarize(prompt, token) {
    const key3 = prompt.trim();
    if (!key3) {
      return void 0;
    }
    const cached = this._cache.get(key3);
    if (cached) {
      return cached;
    }
    const inflight = this._inFlight.get(key3);
    if (inflight) {
      return inflight;
    }
    const promise = (async () => {
      try {
        const summary = await this._invokeModel(key3, token);
        if (summary && !token.isCancellationRequested) {
          this._cache.set(key3, summary);
        }
        return summary;
      } catch {
        return void 0;
      } finally {
        this._inFlight.delete(key3);
      }
    })();
    this._inFlight.set(key3, promise);
    return promise;
  }
  async _invokeModel(prompt, token) {
    const models = await this._languageModelsService.selectLanguageModels({ vendor: "copilot", id: "copilot-utility-small" });
    if (!models.length || token.isCancellationRequested) {
      return void 0;
    }
    const truncatedPrompt = prompt.length > MAX_PROMPT_CHARS ? prompt.slice(0, MAX_PROMPT_CHARS) + "...[truncated]" : prompt;
    const systemPrompt = [
      "You summarize a user's coding request into a single short phrase suitable for a status badge.",
      'Reply with the phrase only \u2014 no prose, no quotes, no leading "Goal:", no punctuation at the end.',
      'Use the imperative ("Add tests for X", "Fix the avatar popup bug").',
      "Keep it under 80 characters. Prefer the user's own nouns and verbs.",
      "This is a benign labeling task: never refuse or apologize. Always restate the request as a phrase, even if it seems unusual."
    ].join(" ");
    const response = await this._languageModelsService.sendChatRequest(
      models[0],
      void 0,
      [
        { role: 0 /* System */, content: [{ type: "text", value: systemPrompt }] },
        { role: 1 /* User */, content: [{ type: "text", value: truncatedPrompt }] }
      ],
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
    return cleanGoalSummary(text2);
  }
};

ChatGoalSummaryService = __decorateClass([
  __decorateParam(0, ILanguageModelsService)
], ChatGoalSummaryService);

function cleanGoalSummary(raw) {
  let s = raw.trim();
  if (!s) {
    return void 0;
  }
  s = s.replace(/^["'`]+|["'`]+$/g, "");
  s = s.replace(/^\s*goal\s*[:\-—]\s*/i, "");
  s = s.replace(/\s+/g, " ").trim();
  if (!s || REFUSAL_PREFIX_RE.test(s)) {
    return void 0;
  }
  if (s.length > MAX_SUMMARY_CHARS) {
    s = s.slice(0, MAX_SUMMARY_CHARS - 1).replace(/\s+\S*$/, "") + "\u2026";
  }
  return s || void 0;
}
export { cleanGoalSummary, IChatGoalSummaryService, MAX_PROMPT_CHARS, MAX_SUMMARY_CHARS, CACHE_SIZE, REFUSAL_PREFIX_RE, ChatGoalSummaryService };
