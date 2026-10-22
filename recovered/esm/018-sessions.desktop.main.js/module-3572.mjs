// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/slashCommands.ts
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { AICustomizationManagementCommands2 } from "./module-1471.mjs";
import { localize } from "./module-0001.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { isAgentHostTarget } from "./module-0961.mjs";
import { Range2 } from "./module-0106.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { INewChatModelPickerService } from "./module-3540.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { IChatSubmitRequestHandlerService } from "./module-2367.mjs";


// src/vs/sessions/contrib/chat/browser/slashCommands.ts
var SESSIONS_EXECUTE_SLASH_COMMAND_ID = "sessions.chat.executeSlashCommand";

CommandsRegistry.registerCommand(SESSIONS_EXECUTE_SLASH_COMMAND_ID, (_, handler, slashCommandStr) => {
  handler.tryExecuteSlashCommand(slashCommandStr);
  handler.clearInput();
});

var SlashCommandHandler = class extends Disposable {
  constructor(_editor, commandService, languageFeaturesService, harnessService, newChatModelPickerService, sessionContext, chatPetService, submitRequestHandlerService) {
    super();
    this._editor = _editor;
    this.commandService = commandService;
    this.languageFeaturesService = languageFeaturesService;
    this.harnessService = harnessService;
    this.newChatModelPickerService = newChatModelPickerService;
    this.sessionContext = sessionContext;
    this.chatPetService = chatPetService;
    this.id = "sessions.slashCommands";
    this._slashCommands = [];
    this._cachedPromptCommands = [];
    this._promptCommandsRefreshGeneration = 0;
    this._commandDecorations = this._editor.createDecorationsCollection();
    this._placeholderDecorations = this._editor.createDecorationsCollection();
    this._registerSlashCommands();
    this._register(submitRequestHandlerService.register(this));
    this._registerCompletions();
    this._registerDecorations();
    this._register(autorun((reader) => {
      this._refreshPromptCommands(this.sessionContext.session.read(reader)?.resource);
    }));
    this._register(this.harnessService.onDidChangeSlashCommands((e4) => {
      const sessionResource = this.sessionContext.session.get()?.resource;
      if (sessionResource && e4.sessionType === getChatSessionType(sessionResource)) {
        this._refreshPromptCommands(sessionResource);
      }
    }));
  }
  static {
    this._commandClassName = "sessions-slash-command";
  }
  static {
    this._placeholderClassName = "sessions-slash-placeholder";
  }
  clearInput() {
    this._editor.getModel()?.setValue("");
  }
  async tryHandle(request2) {
    const currentSessionResource = this.sessionContext.session.get()?.resource;
    if (!currentSessionResource || !request2.providerId || !request2.sessionId || !isEqual2(currentSessionResource, request2.sessionResource)) {
      return false;
    }
    return this.tryExecuteSlashCommand(request2.input);
  }
  _refreshPromptCommands(sessionResource) {
    const refreshGeneration = ++this._promptCommandsRefreshGeneration;
    if (!sessionResource) {
      this._cachedPromptCommands = [];
      this._updateDecorations();
      return;
    }
    this.harnessService.getSlashCommands(sessionResource, CancellationToken.None).then((commands) => {
      const currentSessionResource = this.sessionContext.session.get()?.resource;
      if (refreshGeneration !== this._promptCommandsRefreshGeneration || !currentSessionResource || !isEqual2(currentSessionResource, sessionResource)) {
        return;
      }
      this._cachedPromptCommands = commands;
      this._updateDecorations();
    }, () => {
      const currentSessionResource = this.sessionContext.session.get()?.resource;
      if (refreshGeneration !== this._promptCommandsRefreshGeneration || !currentSessionResource || !isEqual2(currentSessionResource, sessionResource)) {
        return;
      }
      this._cachedPromptCommands = [];
      this._updateDecorations();
    });
  }
  /**
   * Attempts to parse and execute a slash command from the input.
   * Returns `true` if a command was handled.
   */
  tryExecuteSlashCommand(query) {
    const match2 = query.match(/^\/([\w\p{L}\d_\-\.:]+)\s*(.*)/su);
    if (!match2) {
      return false;
    }
    const commandName = match2[1];
    const slashCommand = this._slashCommands.find((c) => c.command === commandName);
    if (!slashCommand) {
      return false;
    }
    slashCommand.execute(match2[2]?.trim() ?? "");
    return true;
  }
  _registerSlashCommands() {
    const openSection = (section) => () => this.commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, section);
    this._slashCommands.push({
      command: "vscode-pet",
      detail: localize(4733, null),
      sortText: "z3_vscodePet",
      executeImmediately: true,
      execute: () => this.chatPetService.toggle()
    });
    this._slashCommands.push({
      command: "agents",
      detail: localize(4728, null),
      sortText: "z3_agents",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Agents)
    });
    this._slashCommands.push({
      command: "skills",
      detail: localize(4732, null),
      sortText: "z3_skills",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Skills)
    });
    this._slashCommands.push({
      command: "instructions",
      detail: localize(4730, null),
      sortText: "z3_instructions",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Instructions)
    });
    this._slashCommands.push({
      command: "hooks",
      detail: localize(4729, null),
      sortText: "z3_hooks",
      executeImmediately: true,
      execute: openSection(AICustomizationManagementSection.Hooks)
    });
    this._slashCommands.push({
      command: "models",
      detail: localize(4731, null),
      sortText: "z3_models",
      executeImmediately: true,
      execute: () => this.newChatModelPickerService.openModelPicker()
    });
  }
  _registerDecorations() {
    this._register(this._editor.onDidChangeModelContent(() => this._updateDecorations()));
    this._register(autorun((reader) => {
      this.sessionContext.session.read(reader);
      this._updateDecorations();
    }));
    this._updateDecorations();
  }
  _updateDecorations() {
    const model = this._editor.getModel();
    const value2 = model?.getValue() ?? "";
    const match2 = value2.match(/^\/([\w\p{L}\d_\-\.:]+)\s?/u);
    const activeSession = this.sessionContext.session.get();
    if (!match2 || activeSession && isAgentHostTarget(getChatSessionType(activeSession.resource))) {
      this._commandDecorations.clear();
      this._placeholderDecorations.clear();
      return;
    }
    const commandName = match2[1];
    const slashCommand = this._slashCommands.find((c) => c.command === commandName);
    const promptCommand = this._cachedPromptCommands.find((c) => c.name === commandName);
    if (!slashCommand && !promptCommand) {
      this._commandDecorations.clear();
      this._placeholderDecorations.clear();
      return;
    }
    const commandEnd = match2[0].trimEnd().length;
    this._commandDecorations.set([{
      range: new Range2(1, 1, 1, commandEnd + 1),
      options: { description: "sessions-slash-command", inlineClassName: SlashCommandHandler._commandClassName }
    }]);
    const restOfInput = value2.slice(match2[0].length).trim();
    const detail2 = slashCommand?.detail ?? promptCommand?.argumentHint;
    if (!restOfInput && detail2) {
      const placeholderCol = match2[0].length + 1;
      this._placeholderDecorations.set([{
        range: new Range2(1, placeholderCol, 1, model.getLineMaxColumn(1)),
        options: {
          description: "sessions-slash-placeholder",
          // The range is collapsed (nothing follows the command), so injected
          // text only renders with `showIfCollapsed`.
          showIfCollapsed: true,
          after: { content: detail2, inlineClassName: SlashCommandHandler._placeholderClassName, cursorStops: 3 /* None */ }
        }
      }]);
    } else {
      this._placeholderDecorations.clear();
    }
  }
  _registerCompletions() {
    const uri4 = this._editor.getModel()?.uri;
    if (!uri4) {
      return;
    }
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: uri4.scheme, hasAccessToAllModels: true }, {
      _debugDisplayName: "sessionsSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: (model, position2, _context, _token) => {
        const range2 = this._computeCompletionRanges(model, position2, /\/\w*/g);
        if (!range2) {
          return null;
        }
        const textBefore = model.getValueInRange(new Range2(1, 1, range2.replace.startLineNumber, range2.replace.startColumn));
        if (textBefore.trim() !== "") {
          return null;
        }
        return {
          suggestions: this._slashCommands.map((c, i2) => {
            const withSlash = `/${c.command}`;
            return {
              label: withSlash,
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              detail: c.detail,
              range: range2,
              sortText: c.sortText ?? "a".repeat(i2 + 1),
              kind: 18 /* Text */,
              command: c.executeImmediately ? { id: SESSIONS_EXECUTE_SLASH_COMMAND_ID, title: withSlash, arguments: [this, withSlash] } : void 0
            };
          })
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: uri4.scheme, hasAccessToAllModels: true }, {
      _debugDisplayName: "sessionsPromptSlashCommands",
      triggerCharacters: ["/"],
      provideCompletionItems: async (model, position2, _context, token) => {
        const activeSession = this.sessionContext.session.get();
        if (!activeSession) {
          return null;
        }
        if (isAgentHostTarget(getChatSessionType(activeSession.resource))) {
          return null;
        }
        const range2 = this._computeCompletionRanges(model, position2, /\/[\p{L}0-9_.:-]*/gu);
        if (!range2) {
          return null;
        }
        const textBefore = model.getValueInRange(new Range2(1, 1, range2.replace.startLineNumber, range2.replace.startColumn));
        if (textBefore.trim() !== "") {
          return null;
        }
        const promptCommands = await this.harnessService.getSlashCommands(activeSession?.resource, token);
        const userInvocable = promptCommands.filter((c) => c.userInvocable);
        if (userInvocable.length === 0) {
          return null;
        }
        return {
          suggestions: userInvocable.map((c, i2) => {
            const label3 = `/${c.name}`;
            return {
              label: { label: label3, description: c.description },
              insertText: `${label3} `,
              documentation: c.description,
              range: range2,
              sortText: "b".repeat(i2 + 1),
              kind: 18 /* Text */
            };
          })
        };
      }
    }));
  }
  _computeCompletionRanges(model, position2, reg2) {
    const varWord = getWordAtText(position2.column, reg2, model.getLineContent(position2.lineNumber), 0);
    if (!varWord && model.getWordUntilPosition(position2).word) {
      return;
    }
    if (!varWord && position2.column > 1) {
      const textBefore = model.getValueInRange(new Range2(position2.lineNumber, position2.column - 1, position2.lineNumber, position2.column));
      if (textBefore !== " ") {
        return;
      }
    }
    let insert2;
    let replace;
    if (!varWord) {
      insert2 = replace = Range2.fromPositions(position2);
    } else {
      insert2 = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, position2.column);
      replace = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, varWord.endColumn);
    }
    return { insert: insert2, replace };
  }
};

SlashCommandHandler = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ICustomizationHarnessService),
  __decorateParam(4, INewChatModelPickerService),
  __decorateParam(5, ISessionContext),
  __decorateParam(6, IChatPetService),
  __decorateParam(7, IChatSubmitRequestHandlerService)
], SlashCommandHandler);
export { SESSIONS_EXECUTE_SLASH_COMMAND_ID, SlashCommandHandler };
