// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionReferenceCompletions.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { Disposable } from "./module-0012.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { Range2 } from "./module-0106.mjs";
import { getCopilotCliSessionRawId } from "./module-1110.mjs";
import { localize } from "./module-0001.mjs";
import { createSessionReferenceVariableEntry } from "./module-3574.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/contrib/chat/browser/sessionReferenceCompletions.ts
var VARIABLE_LEADER2 = "#";

var SESSION_TOKEN = "session";

var ADD_SESSION_REFERENCE_COMMAND = "sessions.chat.addSessionReference";

CommandsRegistry.registerCommand(ADD_SESSION_REFERENCE_COMMAND, (_accessor, arg) => {
  arg.handler.acceptSessionReference(arg.entry, arg.referenceText);
});

var SessionReferenceCompletionHandler = class extends Disposable {
  constructor(_editor, _contextAttachments, languageFeaturesService, sessionsManagementService, sessionsService) {
    super();
    this._editor = _editor;
    this._contextAttachments = _contextAttachments;
    this.languageFeaturesService = languageFeaturesService;
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    /** Inline `#session:<title>` reference texts present in the editor, for decoration. */
    this._referenceTexts = /* @__PURE__ */ new Set();
    this._decorations = this._editor.createDecorationsCollection();
    this._registerSessionCompletions();
    this._registerDecorations();
  }
  static {
    this._wordPattern = /#[^\s]*/g;
  }
  static {
    // MUST use g-flag
    this._className = "sessions-variable-reference";
  }
  _registerSessionCompletions() {
    const uri4 = this._editor.getModel()?.uri;
    if (!uri4) {
      return;
    }
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: uri4.scheme, hasAccessToAllModels: true }, {
      _debugDisplayName: "sessionsVariableSession",
      triggerCharacters: [VARIABLE_LEADER2],
      provideCompletionItems: (model, position2, _context, _token) => {
        const varWord = getWordAtText(position2.column, SessionReferenceCompletionHandler._wordPattern, model.getLineContent(position2.lineNumber), 0);
        if (!varWord || !varWord.word.startsWith(VARIABLE_LEADER2)) {
          return null;
        }
        const typed = varWord.word.slice(VARIABLE_LEADER2.length).toLowerCase();
        if (typed.length > 0 && !SESSION_TOKEN.startsWith(typed) && !typed.startsWith(SESSION_TOKEN)) {
          return null;
        }
        const replace = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, varWord.endColumn);
        const insert2 = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, position2.column);
        const suggestions = typed.length === 0 ? [] : this._collectSessionItems({ insert: insert2, replace });
        return { suggestions, incomplete: true };
      }
    }));
  }
  /** Attaches the chosen session and decorates its inline reference text. */
  acceptSessionReference(entry, referenceText) {
    this._contextAttachments.addAttachments(entry);
    this._referenceTexts.add(referenceText);
    this._updateDecorations();
  }
  _collectSessionItems(range2) {
    const activeResource = this.sessionsService.activeSession.get()?.resource;
    const activeResourceStr = activeResource?.toString();
    const sessions = this.sessionsManagementService.getSessions().map((session) => ({ session, rawId: getCopilotCliSessionRawId(session.resource) })).filter((entry) => entry.rawId !== void 0).filter((entry) => {
      return !activeResource || entry.session.resource.scheme === activeResource.scheme;
    }).sort((a, b) => b.session.updatedAt.get().getTime() - a.session.updatedAt.get().getTime());
    return sessions.map(({ session, rawId }, index2) => {
      const title = session.title.get() || localize(4648, null);
      const referenceTitle = title.replace(/\s+/g, " ").trim() || localize(4648, null);
      const isActive2 = activeResourceStr === session.resource.toString();
      const date = session.updatedAt.get().toLocaleString();
      const description = isActive2 ? localize(4647, null, date) : date;
      const referenceText = `${VARIABLE_LEADER2}${SESSION_TOKEN}:${referenceTitle}`;
      const entry = createSessionReferenceVariableEntry(rawId, referenceTitle, session.resource);
      return {
        label: { label: referenceTitle, description },
        // Include the leading `#` so the typed `#session` word matches
        // (Monaco filters against the word including the trigger char).
        filterText: `${VARIABLE_LEADER2}${SESSION_TOKEN} ${referenceTitle}`,
        // Insert the inline reference, replacing the typed `#session…` token.
        insertText: `${referenceText} `,
        range: range2,
        kind: 21 /* Reference */,
        sortText: String(index2).padStart(4, "0"),
        command: {
          id: ADD_SESSION_REFERENCE_COMMAND,
          title: "",
          arguments: [{ handler: this, entry, referenceText }]
        }
      };
    });
  }
  // --- Decorations ---
  _registerDecorations() {
    this._register(this._editor.onDidChangeModelContent(() => this._updateDecorations()));
    this._updateDecorations();
  }
  _updateDecorations() {
    const model = this._editor.getModel();
    if (!model || this._referenceTexts.size === 0) {
      this._decorations.set([]);
      return;
    }
    const value2 = model.getValue();
    const decos = [];
    for (const referenceText of this._referenceTexts) {
      let index2 = value2.indexOf(referenceText);
      while (index2 !== -1) {
        const startPos = model.getPositionAt(index2);
        const endPos = model.getPositionAt(index2 + referenceText.length);
        decos.push({
          range: Range2.fromPositions(startPos, endPos),
          options: { description: "sessions-session-reference", inlineClassName: SessionReferenceCompletionHandler._className }
        });
        index2 = value2.indexOf(referenceText, index2 + referenceText.length);
      }
    }
    this._decorations.set(decos);
  }
};

SessionReferenceCompletionHandler = __decorateClass([
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ISessionsManagementService),
  __decorateParam(4, ISessionsService)
], SessionReferenceCompletionHandler);
export { VARIABLE_LEADER2, SESSION_TOKEN, ADD_SESSION_REFERENCE_COMMAND, SessionReferenceCompletionHandler };
