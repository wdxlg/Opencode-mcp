// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/agentHostInputCompletions.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { getAgentHostCompletionReferenceKind, isAgentHostCompletionVariableEntry, isPastedTextArtifact, toAgentHostCompletionVariableEntry } from "./module-0980.mjs";
import { getCommandArgumentHint, getCompletionAction } from "./module-2795.mjs";
import { AgentHostInputCompletionsBase } from "./module-2798.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { IChatSessionsService, isAgentHostTarget } from "./module-0961.mjs";
import { applyAgentHostCompletionAction } from "./module-2796.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { Range2 } from "./module-0106.mjs";
import { chatVariableLeader } from "./module-0988.mjs";
import { getInputPlaceholderColor, getRangeForPlaceholder } from "./module-2800.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/sessions/contrib/chat/browser/agentHostInputCompletions.ts
var ADD_REFERENCE_COMMAND2 = "sessions.chat.addAgentHostReference";

CommandsRegistry.registerCommand(ADD_REFERENCE_COMMAND2, (_accessor, arg) => {
  arg.handler.acceptCompletion(arg.entry, arg.insertText, arg.range);
});

var CONFIG_ACTION_COMMAND = "sessions.chat.applyAgentHostConfigAction";

CommandsRegistry.registerCommand(CONFIG_ACTION_COMMAND, async (accessor, arg) => {
  await arg.handler.applyConfigAction(accessor, arg);
});

function getAgentHostCompletionAttachmentRange(value2, referenceText, preferredRange, messageOffset, messageLength) {
  if (!referenceText) {
    return void 0;
  }
  let bestIndex = -1;
  let bestDistance = Number.MAX_SAFE_INTEGER;
  let from = 0;
  const endsWithDigit = /\d$/.test(referenceText);
  while (true) {
    const index2 = value2.indexOf(referenceText, from);
    if (index2 < 0) {
      break;
    }
    from = index2 + referenceText.length;
    if (endsWithDigit && /\d/.test(value2.charAt(from))) {
      continue;
    }
    const distance = preferredRange ? Math.abs(index2 - preferredRange.start) : index2;
    if (distance < bestDistance) {
      bestIndex = index2;
      bestDistance = distance;
    }
  }
  if (bestIndex < 0) {
    return void 0;
  }
  const start = bestIndex - messageOffset;
  const endExclusive = start + referenceText.length;
  if (start < 0 || endExclusive > messageLength) {
    return void 0;
  }
  return new OffsetRange(start, endExclusive);
}

function getCommandArgumentHintPlaceholder(value2, attachments, insertedReferences) {
  for (const entry of attachments) {
    if (getAgentHostCompletionReferenceKind(entry) !== "command" /* Command */) {
      continue;
    }
    const argumentHint = getCommandArgumentHint(entry._meta);
    if (!argumentHint) {
      continue;
    }
    const reference = insertedReferences.get(entry.id);
    if (!reference) {
      continue;
    }
    const range2 = getAgentHostCompletionAttachmentRange(value2, reference.text, reference.range, 0, value2.length);
    if (!range2) {
      continue;
    }
    if (value2.slice(0, range2.start).trim().length > 0 || value2.slice(range2.endExclusive) !== " ") {
      return void 0;
    }
    return { argumentHint, endOffset: range2.endExclusive };
  }
  return void 0;
}

var AgentHostInputCompletionHandler = class extends AgentHostInputCompletionsBase {
  constructor(_editor, _contextAttachments, languageFeaturesService, _sessionContext, chatSessionsService, _codeEditorService, _themeService, _configurationService) {
    super(languageFeaturesService, chatSessionsService);
    this._editor = _editor;
    this._contextAttachments = _contextAttachments;
    this._sessionContext = _sessionContext;
    this._codeEditorService = _codeEditorService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._registration = this._register(new MutableDisposable());
    /**
     * Inserted reference per accepted attachment id. Used to find and decorate
     * the accepted occurrence in the editor and dropped when the user removes
     * the attachment chip.
     */
    this._insertedReferences = /* @__PURE__ */ new Map();
    /** Ids whose inline reference should be removed with the attachment. */
    this._artifactReferenceIds = /* @__PURE__ */ new Set();
    this._register(this._codeEditorService.registerDecorationType(AgentHostInputCompletionHandler._argumentHintDecorationDescription, AgentHostInputCompletionHandler._argumentHintDecorationType, {}));
    this._decorations = this._editor.createDecorationsCollection();
    this._registerDecorations();
    let currentScheme;
    this._register(autorun((reader) => {
      const session = this._sessionContext.session.read(reader);
      const scheme = session ? getChatSessionType(session.resource) : void 0;
      if (scheme === currentScheme) {
        return;
      }
      currentScheme = scheme;
      this._registration.clear();
      if (scheme && isAgentHostTarget(scheme)) {
        void this._registerForScheme(scheme);
      }
    }));
  }
  static {
    this._className = "sessions-agent-host-reference";
  }
  static {
    this._argumentHintDecorationDescription = "sessions-chat";
  }
  static {
    this._argumentHintDecorationType = "sessions-command-argument-hint";
  }
  async _registerForScheme(scheme) {
    const triggerCharacters = await this._chatSessionsService.getChatInputCompletionTriggerCharacters(scheme);
    if (!triggerCharacters || triggerCharacters.length === 0) {
      return;
    }
    const activeSession = this._sessionContext.session.get();
    if (!activeSession || getChatSessionType(activeSession.resource) !== scheme) {
      return;
    }
    const editorUri = this._editor.getModel()?.uri;
    if (!editorUri) {
      return;
    }
    this._registration.value = this._registerProvider(
      { scheme: editorUri.scheme, hasAccessToAllModels: true },
      `sessionsAgentHostInputCompletions[${scheme}]`,
      triggerCharacters,
      scheme
    );
  }
  _resolveContext(model, scheme) {
    if (/^\s*\/troubleshoot\b/.test(model.getValue())) {
      return void 0;
    }
    const session = this._sessionContext.session.get();
    if (!session) {
      return void 0;
    }
    const sessionResource = session.resource;
    if (getChatSessionType(sessionResource) !== scheme) {
      return void 0;
    }
    return { sessionResource, context: void 0 };
  }
  _buildItem(position2, item) {
    const replaceRange = AgentHostInputCompletionHandler.computeRange(position2, item);
    const attachment = item.attachment;
    switch (attachment.kind) {
      case "command": {
        const action = getCompletionAction(attachment._meta);
        if (action) {
          if (false) {
            return void 0;
          }
          const keep = item.insertText !== "";
          const label3 = item.label ?? item.insertText;
          const referenceText2 = item.insertText.trimEnd();
          const entry2 = keep ? toAgentHostCompletionVariableEntry("command" /* Command */, referenceText2, attachment.command, attachment._meta) : void 0;
          return {
            label: { label: label3, description: attachment.description },
            insertText: item.insertText,
            filterText: label3,
            range: replaceRange,
            kind: 18 /* Text */,
            documentation: attachment.description,
            command: {
              id: CONFIG_ACTION_COMMAND,
              title: "",
              arguments: [{
                handler: this,
                action,
                entry: entry2,
                referenceText: referenceText2,
                referenceRange: entry2 ? this._toOffsetRange(replaceRange.replace, referenceText2) : void 0
              }]
            }
          };
        }
        const referenceText = item.insertText.trimEnd();
        const entry = toAgentHostCompletionVariableEntry("command" /* Command */, referenceText, attachment.command, attachment._meta);
        return {
          label: { label: item.insertText, description: attachment.description },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          kind: 18 /* Text */,
          documentation: attachment.description,
          command: {
            id: ADD_REFERENCE_COMMAND2,
            title: "",
            arguments: [{
              handler: this,
              entry,
              insertText: referenceText,
              range: this._toOffsetRange(replaceRange.replace, referenceText)
            }]
          }
        };
      }
      case "skill": {
        const referenceText = item.insertText.trimEnd();
        const entry = toAgentHostCompletionVariableEntry("skill" /* Skill */, referenceText, attachment.uri, attachment._meta);
        return {
          label: { label: item.insertText, description: attachment.description },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          documentation: attachment.description,
          kind: 18 /* Text */,
          command: {
            id: ADD_REFERENCE_COMMAND2,
            title: "",
            arguments: [{
              handler: this,
              entry,
              insertText: referenceText,
              range: this._toOffsetRange(replaceRange.replace, referenceText)
            }]
          }
        };
      }
      case "chat": {
        return void 0;
      }
      default: {
        const label3 = attachment.displayName ?? item.insertText;
        const description = attachment.uri.path;
        const kind = attachment.isDirectory ? 23 /* Folder */ : 20 /* File */;
        const entry = {
          id: attachment.uri.toString(),
          name: attachment.displayName ?? this._basename(attachment.uri),
          value: attachment.uri,
          kind: attachment.isDirectory ? "directory" : "file",
          _meta: attachment._meta
        };
        return {
          label: { label: label3, description },
          insertText: item.insertText,
          filterText: item.insertText,
          range: replaceRange,
          kind,
          command: {
            id: ADD_REFERENCE_COMMAND2,
            title: "",
            arguments: [{
              handler: this,
              entry,
              insertText: item.insertText,
              range: this._toOffsetRange(replaceRange.replace, item.insertText)
            }]
          }
        };
      }
    }
  }
  _basename(uri4) {
    const idx = uri4.path.lastIndexOf("/");
    return idx >= 0 ? uri4.path.slice(idx + 1) : uri4.path;
  }
  // --- Attachment + decoration bridging ---
  /**
   * Called when the user accepts an item from the Monaco completion
   * widget (via the registered command). Adds the resource to the
   * context attachments and tracks the inserted text so it can be
   * highlighted in the editor.
   */
  acceptCompletion(entry, insertText, range2) {
    this._insertedReferences.set(entry.id, { text: insertText, range: range2 });
    this._contextAttachments.setAttachments([...this._contextAttachments.attachments.filter((e4) => e4.id !== entry.id), entry]);
    this._updateDecorations();
  }
  /**
   * Accept handler for config-action completions (permission/mode toggles).
   * Applies the session-config change (gated by the elevated-permission
   * confirmation for `autoApprove`) via this input's scoped session's
   * agent-host provider. Keep-text items (non-empty insertText) then add their
   * argument-hint reference; toggle items insert nothing, so there is no text
   * to remove.
   */
  async applyConfigAction(accessor, arg) {
    const session = this._sessionContext.session.get();
    if (!session) {
      return;
    }
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const applied = await applyAgentHostCompletionAction(arg.action, dialogService, storageService, async (config) => {
      const provider = sessionsProvidersService.getProvider(session.providerId);
      if (provider && isAgentHostProvider(provider)) {
        await Promise.all(Object.entries(config).map(([key3, value2]) => provider.setSessionConfigValue(session.sessionId, key3, value2).catch(() => {
        })));
      }
    });
    if (applied && arg.entry) {
      this.acceptCompletion(arg.entry, arg.referenceText, arg.referenceRange);
    }
  }
  getAttachmentsForSend(messageText2, messageOffset = 0) {
    const model = this._editor.getModel();
    const value2 = model?.getValue() ?? "";
    const messageLength = messageText2?.length ?? value2.length;
    const result = [];
    for (const entry of this._contextAttachments.attachments) {
      const reference = this._insertedReferences.get(entry.id) ?? (isAgentHostCompletionVariableEntry(entry) ? { text: entry.name, range: void 0 } : void 0);
      if (!reference) {
        if (!isPastedTextArtifact(entry) || !entry.range) {
          result.push(entry);
        }
        continue;
      }
      const range2 = getAgentHostCompletionAttachmentRange(value2, reference.text, reference.range, messageOffset, messageLength);
      if (!range2) {
        if (!isAgentHostCompletionVariableEntry(entry) && (!isPastedTextArtifact(entry) || !entry.range)) {
          result.push(entry);
        }
        continue;
      }
      result.push({ ...entry, range: range2 });
    }
    return result;
  }
  _registerDecorations() {
    this._register(this._editor.onDidChangeModelContent(() => this._updateDecorations()));
    this._register(this._contextAttachments.onDidChangeContext(() => this._updateDecorations()));
    this._updateDecorations();
  }
  /**
   * Drops tracking for a reference without touching the input text, for callers
   * that remove that text themselves. The paste pipeline's undo does: the undo
   * stack removes the pasted reference text as its own step, so the chip-removal
   * cleanup below must not run a competing edit while that undo is unwinding.
   */
  forgetReference(id2) {
    this._insertedReferences.delete(id2);
    this._artifactReferenceIds.delete(id2);
  }
  /** Removes an inline reference's text, including one trailing space. */
  _removeReferenceText(text2, preferredRange) {
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const value2 = model.getValue();
    const range2 = getAgentHostCompletionAttachmentRange(value2, text2, preferredRange, 0, value2.length);
    if (!range2) {
      return;
    }
    const endExclusive = value2.charAt(range2.endExclusive) === " " ? range2.endExclusive + 1 : range2.endExclusive;
    const start = model.getPositionAt(range2.start);
    const end = model.getPositionAt(endExclusive);
    this._editor.executeEdits("sessionsChat.removeAttachmentReference", [{
      range: Range2.fromPositions(start, end),
      text: ""
    }]);
  }
  _updateDecorations() {
    const attachedIds = new Set(this._contextAttachments.attachments.map((a) => a.id));
    for (const id2 of [...this._insertedReferences.keys()]) {
      if (!attachedIds.has(id2)) {
        const removed = this._insertedReferences.get(id2);
        this._insertedReferences.delete(id2);
        if (removed && this._artifactReferenceIds.delete(id2)) {
          this._removeReferenceText(removed.text, removed.range);
        }
      }
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const value2 = model.getValue();
    const orphanedArtifacts = [];
    for (const entry of this._contextAttachments.attachments) {
      if (!isPastedTextArtifact(entry) || !entry.range) {
        continue;
      }
      const text2 = `${chatVariableLeader}attachment:${entry.name}`;
      const preferredRange = new OffsetRange(entry.range.start, entry.range.endExclusive);
      const range2 = getAgentHostCompletionAttachmentRange(value2, text2, preferredRange, 0, value2.length);
      if (range2) {
        this._artifactReferenceIds.add(entry.id);
        this._insertedReferences.set(entry.id, { text: text2, range: range2 });
      } else {
        orphanedArtifacts.push(entry.id);
      }
    }
    for (const id2 of orphanedArtifacts) {
      this._insertedReferences.delete(id2);
      this._contextAttachments.removeAttachment(id2);
    }
    const decos = [];
    for (const reference of this._insertedReferences.values()) {
      const range2 = getAgentHostCompletionAttachmentRange(value2, reference.text, reference.range, 0, value2.length);
      if (!range2) {
        continue;
      }
      const startPos = model.getPositionAt(range2.start);
      const endPos = model.getPositionAt(range2.endExclusive);
      decos.push({
        range: {
          startLineNumber: startPos.lineNumber,
          startColumn: startPos.column,
          endLineNumber: endPos.lineNumber,
          endColumn: endPos.column
        },
        options: { description: "sessions-agent-host-reference", inlineClassName: AgentHostInputCompletionHandler._className }
      });
    }
    this._decorations.set(decos);
    this._editor.setDecorationsByType(
      AgentHostInputCompletionHandler._argumentHintDecorationDescription,
      AgentHostInputCompletionHandler._argumentHintDecorationType,
      this._getArgumentHintDecorations(model, value2)
    );
  }
  /**
   * Computes the inline placeholder (ghost text) shown after an accepted
   * agent-host slash command whose `_meta` carries an argument hint. Shown
   * only while the command is the sole content followed by a single trailing
   * space (i.e. before any argument has been typed).
   */
  _getArgumentHintDecorations(model, value2) {
    const placeholder = getCommandArgumentHintPlaceholder(value2, this._contextAttachments.attachments, this._insertedReferences);
    if (!placeholder) {
      return [];
    }
    const endPos = model.getPositionAt(placeholder.endOffset);
    return [{
      range: getRangeForPlaceholder({ startLineNumber: endPos.lineNumber, endLineNumber: endPos.lineNumber, startColumn: endPos.column, endColumn: endPos.column }),
      renderOptions: { after: { contentText: placeholder.argumentHint, color: getInputPlaceholderColor(this._themeService) } }
    }];
  }
  _toOffsetRange(range2, insertText) {
    const model = this._editor.getModel();
    if (!model) {
      return void 0;
    }
    const start = model.getOffsetAt(range2.getStartPosition());
    return new OffsetRange(start, start + insertText.length);
  }
};

AgentHostInputCompletionHandler = __decorateClass([
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ISessionContext),
  __decorateParam(4, IChatSessionsService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IConfigurationService)
], AgentHostInputCompletionHandler);
export { getAgentHostCompletionAttachmentRange, getCommandArgumentHintPlaceholder, ADD_REFERENCE_COMMAND2, CONFIG_ACTION_COMMAND, AgentHostInputCompletionHandler };
