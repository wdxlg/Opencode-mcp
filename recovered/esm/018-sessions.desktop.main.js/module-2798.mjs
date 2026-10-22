// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/agentHostInputCompletionsBase.ts
import { Disposable } from "./module-0012.mjs";
import { isAtTriggerCharacterToken } from "./module-2391.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/agentHostInputCompletionsBase.ts
var AgentHostInputCompletionsBase = class extends Disposable {
  constructor(_languageFeaturesService, _chatSessionsService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this._chatSessionsService = _chatSessionsService;
  }
  /**
   * Register a Monaco completion provider that delegates to this
   * instance. Subclasses call this once their lifecycle decides a
   * registration should exist (e.g. once a content provider becomes
   * available, or once the active session changes to an AHP-backed
   * one). The opaque {@link regData} is forwarded to
   * {@link _resolveContext} so the subclass can identify which
   * registration is firing (e.g. its scheme) and ignore models that
   * don't belong to it.
   */
  _registerProvider(filter2, debugName, triggerCharacters, regData) {
    return this._languageFeaturesService.completionProvider.register(filter2, {
      _debugDisplayName: debugName,
      triggerCharacters: [...triggerCharacters],
      provideCompletionItems: (model, position2, _context, token) => this._provide(model, position2, token, triggerCharacters, regData)
    });
  }
  async _provide(model, position2, token, triggerCharacters, regData) {
    if (!isAtTriggerCharacterToken(model, position2, triggerCharacters)) {
      return null;
    }
    const ctx = this._resolveContext(model, regData);
    if (!ctx) {
      return null;
    }
    const text2 = model.getValue();
    const offset = model.getOffsetAt(position2);
    const result = await this._chatSessionsService.provideChatInputCompletions(ctx.sessionResource, { text: text2, offset }, token);
    if (token.isCancellationRequested || !result) {
      return null;
    }
    const suggestions = [];
    for (const item of result.items) {
      const built = this._buildItem(position2, item, ctx.context);
      if (built) {
        if (item.start && (built.kind === 20 /* File */ || built.kind === 23 /* Folder */)) {
          built.filterText = model.getValueInRange(Range2.fromPositions(item.start, position2));
        }
        built.sortText ??= suggestions.length.toString().padStart(6, "0");
        suggestions.push(built);
      }
    }
    return { suggestions, incomplete: true };
  }
  /**
   * Compute the insert/replace ranges for an item. Positions returned
   * by the host are already 1-based Monaco positions, so they can be
   * used directly. When omitted, the ranges default to a zero-length
   * span at the cursor (Monaco then inserts without replacing).
   */
  static computeRange(position2, item) {
    const start = item.start ?? position2;
    const end = item.end ?? position2;
    const replace = new Range2(start.lineNumber, start.column, end.lineNumber, end.column);
    const insert2 = new Range2(start.lineNumber, start.column, position2.lineNumber, position2.column);
    return { insert: insert2, replace };
  }
};
export { AgentHostInputCompletionsBase };
