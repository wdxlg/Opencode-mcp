// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputEditorContrib.ts
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart, ChatRequestSlashPromptPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestToolSetPart, chatAgentLeader, chatSubcommandLeader } from "./module-0988.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { Position } from "./module-0079.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { autorun } from "./module-0052.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { chatSlashCommandBackground, chatSlashCommandForeground } from "./module-2057.mjs";
import { dynamicVariableDecorationType } from "./module-0985.mjs";
import { getInputPlaceholderColor, getRangeForPlaceholder } from "./module-2800.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { NativeEditContextRegistry } from "./module-0362.mjs";
import { TextAreaEditContextRegistry } from "./module-0355.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ChatWidget } from "./module-2369.mjs";
import { agentReg, slashReg, variableReg } from "./module-0992.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputEditorContrib.ts
var decorationDescription2 = "chat";

var placeholderDecorationType = "chat-session-detail";

var slashCommandTextDecorationType = "chat-session-text";

var clickableSlashPromptTextDecorationType = "chat-session-clickable-text";

var variableTextDecorationType = "chat-variable-text";

function agentAndCommandToKey(agent, subcommand) {
  return subcommand ? `${agent.id}__${subcommand}` : agent.id;
}

function isWhitespaceOrPromptPart(p) {
  return p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestSlashPromptPart;
}

function exactlyOneSpaceAfterPart(parsedRequest, part) {
  const partIdx = parsedRequest.indexOf(part);
  if (parsedRequest.length > partIdx + 2) {
    return false;
  }
  const nextPart = parsedRequest[partIdx + 1];
  return nextPart && nextPart instanceof ChatRequestTextPart && nextPart.text === " ";
}

var InputEditorDecorations = class extends Disposable {
  constructor(widget, codeEditorService, themeService, chatAgentService, labelService, customizationHarnessService, editorService) {
    super();
    this.widget = widget;
    this.codeEditorService = codeEditorService;
    this.themeService = themeService;
    this.chatAgentService = chatAgentService;
    this.labelService = labelService;
    this.customizationHarnessService = customizationHarnessService;
    this.editorService = editorService;
    this.id = "inputEditorDecorations";
    this.previouslyUsedAgents = /* @__PURE__ */ new Set();
    this.viewModelDisposables = this._register(new MutableDisposable());
    this.updateThrottle = this._register(new ThrottledDelayer(InputEditorDecorations.UPDATE_DELAY));
    this.registeredDecorationTypes();
    this.triggerInputEditorDecorationsUpdate();
    this._register(this.widget.inputEditor.onDidChangeModelContent(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(this.widget.inputEditor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(100 /* placeholder */)) {
        this.triggerInputEditorDecorationsUpdate();
      }
    }));
    this._register(this.widget.onDidChangeParsedInput(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(this.widget.onDidChangeViewModel(() => {
      this.registerViewModelListeners();
      this.previouslyUsedAgents.clear();
      this.triggerInputEditorDecorationsUpdate();
    }));
    this._register(this.widget.onDidSubmitAgent((e4) => {
      this.previouslyUsedAgents.add(agentAndCommandToKey(e4.agent, e4.slashCommand?.name));
    }));
    this._register(this.widget.inputEditor.onMouseDown((e4) => {
      this.mouseDownPromptSlashCommand = void 0;
      if (!e4.event.leftButton || e4.target.type !== 6 /* CONTENT_TEXT */ || !e4.target.position) {
        return;
      }
      const clickablePromptSlashCommand = this.clickablePromptSlashCommand;
      if (!clickablePromptSlashCommand || !clickablePromptSlashCommand.range.containsPosition(e4.target.position)) {
        return;
      }
      this.mouseDownPromptSlashCommand = {
        position: Position.lift(e4.target.position),
        uri: clickablePromptSlashCommand.uri,
        range: clickablePromptSlashCommand.range
      };
    }));
    this._register(this.widget.inputEditor.onMouseUp((e4) => {
      const mouseDownPromptSlashCommand = this.mouseDownPromptSlashCommand;
      this.mouseDownPromptSlashCommand = void 0;
      if (!mouseDownPromptSlashCommand || e4.target.type !== 6 /* CONTENT_TEXT */ || !e4.target.position) {
        return;
      }
      if (!mouseDownPromptSlashCommand.range.containsPosition(e4.target.position) || !Position.equals(mouseDownPromptSlashCommand.position, e4.target.position)) {
        return;
      }
      void this.editorService.openEditor({ resource: mouseDownPromptSlashCommand.uri });
    }));
    this._register(this.chatAgentService.onDidChangeAgents(() => this.triggerInputEditorDecorationsUpdate()));
    this._register(this.customizationHarnessService.onDidChangeSlashCommands((e4) => {
      const sessionResource = this.widget.viewModel?.sessionResource;
      if (sessionResource && e4.sessionType === getChatSessionType(sessionResource)) {
        this.triggerInputEditorDecorationsUpdate();
      }
    }));
    this._register(autorun((reader) => {
      const currentMode = this.widget.input.currentModeObs.read(reader);
      if (currentMode) {
        currentMode.description.read(reader);
      }
      this.triggerInputEditorDecorationsUpdate();
    }));
    this.registerViewModelListeners();
  }
  static {
    this.UPDATE_DELAY = 200;
  }
  registerViewModelListeners() {
    this.viewModelDisposables.value = this.widget.viewModel?.onDidChange((e4) => {
      if (e4?.kind === "changePlaceholder" || e4?.kind === "initialize") {
        this.triggerInputEditorDecorationsUpdate();
      }
    });
  }
  registeredDecorationTypes() {
    this._register(this.codeEditorService.registerDecorationType(decorationDescription2, placeholderDecorationType, {}));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription2, slashCommandTextDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px"
    }));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription2, clickableSlashPromptTextDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px",
      cursor: "pointer"
    }));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription2, variableTextDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px"
    }));
    this._register(this.codeEditorService.registerDecorationType(decorationDescription2, dynamicVariableDecorationType, {
      color: themeColorFromId(chatSlashCommandForeground),
      backgroundColor: themeColorFromId(chatSlashCommandBackground),
      borderRadius: "3px",
      rangeBehavior: 1 /* NeverGrowsWhenTypingAtEdges */
    }));
  }
  getPlaceholderColor() {
    return getInputPlaceholderColor(this.themeService);
  }
  triggerInputEditorDecorationsUpdate() {
    this.updateInputPlaceholderDecoration();
    this.updateThrottle.trigger((token) => this.updateAsyncInputEditorDecorations(token)).catch((err) => {
      if (!isCancellationError(err)) {
        throw err;
      }
    });
  }
  updateInputPlaceholderDecoration() {
    const inputValue = this.widget.inputEditor.getValue();
    const viewModel = this.widget.viewModel;
    if (!viewModel) {
      this.updateAriaPlaceholder(void 0);
      if (inputValue) {
        this.widget.inputEditor.setDecorationsByType(decorationDescription2, placeholderDecorationType, []);
      }
      return;
    }
    if (!inputValue) {
      if (this.widget.inputEditor.getOption(100 /* placeholder */)) {
        this.updateAriaPlaceholder(void 0);
        this.widget.inputEditor.setDecorationsByType(decorationDescription2, placeholderDecorationType, []);
        return;
      }
      const mode = this.widget.input.currentModeObs.get();
      const placeholder = mode.argumentHint?.get() ?? mode.description.get() ?? "";
      const displayPlaceholder = viewModel.inputPlaceholder || placeholder;
      const decoration3 = [
        {
          range: {
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: 1e3
          },
          renderOptions: {
            after: {
              contentText: displayPlaceholder,
              color: this.getPlaceholderColor()
            }
          }
        }
      ];
      this.updateAriaPlaceholder(displayPlaceholder || void 0);
      this.widget.inputEditor.setDecorationsByType(decorationDescription2, placeholderDecorationType, decoration3);
      return;
    }
    this.updateAriaPlaceholder(void 0);
    const parsedRequest = this.widget.parsedInput.parts;
    let placeholderDecoration;
    const agentPart = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
    const agentSubcommandPart = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart);
    const onlyAgentAndWhitespace = agentPart && parsedRequest.every((p) => p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestAgentPart);
    if (onlyAgentAndWhitespace) {
      const isFollowupSlashCommand = this.previouslyUsedAgents.has(agentAndCommandToKey(agentPart.agent, void 0));
      const shouldRenderFollowupPlaceholder = isFollowupSlashCommand && agentPart.agent.metadata.followupPlaceholder;
      if (agentPart.agent.description && exactlyOneSpaceAfterPart(parsedRequest, agentPart)) {
        placeholderDecoration = [{
          range: getRangeForPlaceholder(agentPart.editorRange),
          renderOptions: {
            after: {
              contentText: shouldRenderFollowupPlaceholder ? agentPart.agent.metadata.followupPlaceholder : agentPart.agent.description,
              color: this.getPlaceholderColor()
            }
          }
        }];
      }
    }
    const onlyAgentAndAgentCommandAndWhitespace = agentPart && agentSubcommandPart && parsedRequest.every((p) => p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestAgentPart || p instanceof ChatRequestAgentSubcommandPart);
    if (onlyAgentAndAgentCommandAndWhitespace) {
      const isFollowupSlashCommand = this.previouslyUsedAgents.has(agentAndCommandToKey(agentPart.agent, agentSubcommandPart.command.name));
      const shouldRenderFollowupPlaceholder = isFollowupSlashCommand && agentSubcommandPart.command.followupPlaceholder;
      if (agentSubcommandPart?.command.description && exactlyOneSpaceAfterPart(parsedRequest, agentSubcommandPart)) {
        placeholderDecoration = [{
          range: getRangeForPlaceholder(agentSubcommandPart.editorRange),
          renderOptions: {
            after: {
              contentText: shouldRenderFollowupPlaceholder ? agentSubcommandPart.command.followupPlaceholder : agentSubcommandPart.command.description,
              color: this.getPlaceholderColor()
            }
          }
        }];
      }
    }
    const onlyAgentCommandAndWhitespace = agentSubcommandPart && parsedRequest.every((p) => p instanceof ChatRequestTextPart && !p.text.trim().length || p instanceof ChatRequestAgentSubcommandPart);
    if (onlyAgentCommandAndWhitespace) {
      if (agentSubcommandPart?.command.description && exactlyOneSpaceAfterPart(parsedRequest, agentSubcommandPart)) {
        placeholderDecoration = [{
          range: getRangeForPlaceholder(agentSubcommandPart.editorRange),
          renderOptions: {
            after: {
              contentText: agentSubcommandPart.command.description,
              color: this.getPlaceholderColor()
            }
          }
        }];
      }
    }
    this.widget.inputEditor.setDecorationsByType(decorationDescription2, placeholderDecorationType, placeholderDecoration ?? []);
  }
  async updateAsyncInputEditorDecorations(token) {
    this.clickablePromptSlashCommand = void 0;
    this.widget.inputEditor.setDecorationsByType(decorationDescription2, clickableSlashPromptTextDecorationType, []);
    const parsedRequest = this.widget.parsedInput.parts;
    const viewModel = this.widget.viewModel;
    if (!viewModel) {
      return;
    }
    const agentPart = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
    const agentSubcommandPart = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart);
    const slashCommandPart = parsedRequest.find((p) => p instanceof ChatRequestSlashCommandPart);
    const slashPromptPart = parsedRequest.find((p) => p instanceof ChatRequestSlashPromptPart);
    const promptSlashCommand = slashPromptPart ? await this.customizationHarnessService.resolvePromptSlashCommand(slashPromptPart.name, viewModel.sessionResource, token) : void 0;
    if (token.isCancellationRequested) {
      return;
    }
    if (slashPromptPart && promptSlashCommand) {
      const onlyPromptCommandAndWhitespace = slashPromptPart && parsedRequest.every(isWhitespaceOrPromptPart);
      if (onlyPromptCommandAndWhitespace && exactlyOneSpaceAfterPart(parsedRequest, slashPromptPart) && promptSlashCommand) {
        const description = promptSlashCommand.argumentHint;
        if (description) {
          this.widget.inputEditor.setDecorationsByType(decorationDescription2, placeholderDecorationType, [{
            range: getRangeForPlaceholder(slashPromptPart.editorRange),
            renderOptions: {
              after: {
                contentText: description,
                color: this.getPlaceholderColor()
              }
            }
          }]);
        }
      }
    }
    const textDecorations = [];
    if (agentPart) {
      textDecorations.push({ range: agentPart.editorRange });
    }
    if (agentSubcommandPart) {
      textDecorations.push({ range: agentSubcommandPart.editorRange, hoverMessage: new MarkdownString(agentSubcommandPart.command.description) });
    }
    if (slashCommandPart) {
      textDecorations.push({ range: slashCommandPart.editorRange, hoverMessage: new MarkdownString(slashCommandPart.slashCommand.detail) });
    }
    if (slashPromptPart && promptSlashCommand) {
      this.clickablePromptSlashCommand = {
        range: Range2.lift(slashPromptPart.editorRange),
        uri: promptSlashCommand.uri
      };
      const promptHoverMessage = new MarkdownString();
      if (promptSlashCommand.description) {
        promptHoverMessage.appendText(promptSlashCommand.description);
        promptHoverMessage.appendText("\n");
      }
      promptHoverMessage.appendText(localize(
        12530,
        null,
        this.labelService.getUriLabel(promptSlashCommand.uri, { relative: true })
      ));
      const promptDecoration = {
        range: slashPromptPart.editorRange,
        hoverMessage: promptHoverMessage
      };
      this.widget.inputEditor.setDecorationsByType(decorationDescription2, clickableSlashPromptTextDecorationType, [promptDecoration]);
    }
    this.widget.inputEditor.setDecorationsByType(decorationDescription2, slashCommandTextDecorationType, textDecorations);
    const varDecorations = [];
    const toolParts = parsedRequest.filter((p) => p instanceof ChatRequestToolPart || p instanceof ChatRequestToolSetPart);
    for (const tool of toolParts) {
      varDecorations.push({ range: tool.editorRange });
    }
    const dynamicVariableParts = parsedRequest.filter((p) => p instanceof ChatRequestDynamicVariablePart);
    const isEditingPreviousRequest = !!viewModel.editing;
    if (isEditingPreviousRequest) {
      for (const variable of dynamicVariableParts) {
        varDecorations.push({ range: variable.editorRange, hoverMessage: URI.isUri(variable.data) ? new MarkdownString(this.labelService.getUriLabel(variable.data, { relative: true })) : void 0 });
      }
    }
    this.widget.inputEditor.setDecorationsByType(decorationDescription2, variableTextDecorationType, varDecorations);
  }
  updateAriaPlaceholder(value2) {
    const nativeEditContext = NativeEditContextRegistry.get(this.widget.inputEditor.getId());
    if (nativeEditContext) {
      const domNode = nativeEditContext.domNode.domNode;
      if (value2 && value2.trim().length) {
        domNode.setAttribute("aria-placeholder", value2);
      } else {
        domNode.removeAttribute("aria-placeholder");
      }
    } else {
      const textAreaEditContext = TextAreaEditContextRegistry.get(this.widget.inputEditor.getId());
      if (textAreaEditContext) {
        const textArea = textAreaEditContext.textArea.domNode;
        if (value2 && value2.trim().length) {
          textArea.setAttribute("aria-placeholder", value2);
        } else {
          textArea.removeAttribute("aria-placeholder");
        }
      }
    }
  }
};

InputEditorDecorations = __decorateClass([
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IChatAgentService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, ICustomizationHarnessService),
  __decorateParam(6, IEditorService)
], InputEditorDecorations);

var InputEditorSlashCommandMode = class extends Disposable {
  constructor(widget) {
    super();
    this.widget = widget;
    this.id = "InputEditorSlashCommandMode";
    this._register(this.widget.onDidChangeAgent((e4) => {
      if (e4.slashCommand && e4.slashCommand.isSticky || !e4.slashCommand && e4.agent.metadata.isSticky) {
        this.repopulateAgentCommand(e4.agent, e4.slashCommand);
      }
    }));
    this._register(this.widget.onDidSubmitAgent((e4) => {
      this.repopulateAgentCommand(e4.agent, e4.slashCommand);
    }));
  }
  async repopulateAgentCommand(agent, slashCommand) {
    if (this.widget.inputEditor.getValue().trim()) {
      return;
    }
    let value2;
    if (slashCommand && slashCommand.isSticky) {
      value2 = `${chatAgentLeader}${agent.name} ${chatSubcommandLeader}${slashCommand.name} `;
    } else if (agent.metadata.isSticky) {
      value2 = `${chatAgentLeader}${agent.name} `;
    }
    if (value2) {
      this.widget.inputEditor.setValue(value2);
      this.widget.inputEditor.setPosition({ lineNumber: 1, column: value2.length + 1 });
    }
  }
};

ChatWidget.CONTRIBS.push(InputEditorDecorations, InputEditorSlashCommandMode);

var ChatTokenDeleter = class extends Disposable {
  constructor(widget) {
    super();
    this.widget = widget;
    this.id = "chatTokenDeleter";
    let prevInsertTokenRange;
    this._register(this.widget.inputEditor.onDidChangeModelContent((e4) => {
      let insertedTokenRange;
      if (e4.changes.length === 1) {
        const change = e4.changes[0];
        if (change.text.length > 0 && change.rangeLength === 1) {
          if (slashReg.test(change.text) || agentReg.test(change.text) || variableReg.test(change.text)) {
            insertedTokenRange = new Range2(change.range.startLineNumber, change.range.startColumn, change.range.endLineNumber, change.range.startColumn + change.text.length);
          }
        } else if (change.text.length === 0 && prevInsertTokenRange && change.range.endColumn === prevInsertTokenRange.endColumn) {
          this.widget.inputEditor.executeEdits(this.id, [{
            range: prevInsertTokenRange,
            text: ""
          }]);
          this.widget.refreshParsedInput();
        }
      }
      prevInsertTokenRange = insertedTokenRange;
    }));
  }
};

ChatWidget.CONTRIBS.push(ChatTokenDeleter);
export { agentAndCommandToKey, isWhitespaceOrPromptPart, exactlyOneSpaceAfterPart, decorationDescription2, placeholderDecorationType, slashCommandTextDecorationType, clickableSlashPromptTextDecorationType, variableTextDecorationType, InputEditorDecorations, InputEditorSlashCommandMode, ChatTokenDeleter };
