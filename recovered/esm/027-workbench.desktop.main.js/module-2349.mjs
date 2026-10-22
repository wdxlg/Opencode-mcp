// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatTerminalToolConfirmationSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2323.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { TerminalContribCommandId, TerminalContribSettingId } from "./module-1172.mjs";
import { localize } from "./module-0001.mjs";
import { Separator } from "./module-0082.mjs";
import { CodeBlockPart } from "./module-2278.mjs";
import { DisposableResizeObserver, append, getWindow, h } from "./module-0075.mjs";
import { createApprovalReasonBadge, createToolRiskBadge } from "./module-2306.mjs";
import { ChatCustomConfirmationWidget } from "./module-2299.mjs";
import { Codicon } from "./module-0085.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { SessionType } from "./module-0960.mjs";
import { ErrorNoTelemetry, onUnexpectedError } from "./module-0004.mjs";
import { MarkdownString, createCommandUri, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { toDisposable } from "./module-0012.mjs";
import { asArray } from "./module-0007.mjs";
import { isObject } from "./module-0010.mjs";
import { AcceptToolConfirmationActionId, SkipToolConfirmationActionId } from "./module-2203.mjs";
import { severity_default } from "./module-0266.mjs";
import { ChatMarkdownContentPart } from "./module-2298.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITerminalChatService } from "./module-1149.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IChatToolRiskAssessmentService } from "./module-2304.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatTerminalToolConfirmationSubPart.ts
var ChatTerminalToolConfirmationSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, terminalData, context2, renderer, editorPool, currentWidthDelegate, codeBlockStartIndex, instantiationService, dialogService, keybindingService, languageService, configurationService, contextKeyService, chatWidgetService, preferencesService, storageService, terminalChatService, hoverService, languageModelToolsService, riskAssessmentService) {
    super(toolInvocation);
    this.context = context2;
    this.renderer = renderer;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.keybindingService = keybindingService;
    this.languageService = languageService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.preferencesService = preferencesService;
    this.storageService = storageService;
    this.terminalChatService = terminalChatService;
    this.languageModelToolsService = languageModelToolsService;
    this.riskAssessmentService = riskAssessmentService;
    this.codeblocks = [];
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation || !state.confirmationMessages?.title) {
      throw new Error("Confirmation messages are missing");
    }
    terminalData = migrateLegacyTerminalToolSpecificData(terminalData);
    const { title, message, disclaimer, terminalCustomActions } = state.confirmationMessages;
    const initialContent = terminalData.presentationOverrides?.commandLine ?? terminalData.confirmation?.commandLine ?? (terminalData.commandLine.toolEdited ?? terminalData.commandLine.original).trimStart();
    const cdPrefix = terminalData.confirmation?.cdPrefix ?? "";
    const isReadOnly2 = !!terminalData.presentationOverrides;
    const autoApproveEnabled = this.configurationService.getValue(TerminalContribSettingId.EnableAutoApprove) === true;
    let customActions = terminalCustomActions;
    const buildMoreActions = () => {
      if (!autoApproveEnabled) {
        return void 0;
      }
      const autoApproveWarningAccepted = this.storageService.getBoolean("chat.tools.terminal.autoApprove.warningAccepted" /* TerminalAutoApproveWarningAccepted */, -1 /* APPLICATION */, false);
      const moreActions = [];
      if (!autoApproveWarningAccepted) {
        moreActions.push({
          label: localize(12234, null),
          data: {
            type: "enable"
          }
        });
        moreActions.push(new Separator());
        if (customActions) {
          for (const action of customActions) {
            if (!(action instanceof Separator)) {
              action.disabled = true;
            }
          }
        }
      }
      if (customActions) {
        moreActions.push(...customActions);
      }
      return moreActions.length === 0 ? void 0 : moreActions;
    };
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on",
        readOnly: isReadOnly2,
        tabFocusMode: true,
        ariaLabel: typeof title === "string" ? title : title.value
      }
    };
    const languageId = this.languageService.getLanguageIdByLanguageName(terminalData.presentationOverrides?.language ?? terminalData.language ?? "sh") ?? "shellscript";
    const key3 = CodeBlockPart.poolKey(this.context.element.id, this.codeBlockStartIndex);
    const editor = this._register(this.editorPool.get(key3));
    editor.object.render({
      codeBlockIndex: this.codeBlockStartIndex,
      element: this.context.element,
      languageId,
      text: initialContent,
      renderOptions: codeBlockRenderOptions,
      chatSessionResource: this.context.element.sessionResource
    }, this.currentWidthDelegate());
    const model = editor.object.editor.getModel();
    this.codeblocks.push({
      codeBlockIndex: this.codeBlockStartIndex,
      codemapperUri: void 0,
      elementId: this.context.element.id,
      focus: () => editor.object.focus(),
      ownerMarkdownPartId: this.codeblocksPartId,
      uri: model.uri,
      chatSessionResource: this.context.element.sessionResource
    });
    this._register(model.onDidChangeContent(() => {
      const currentValue = model.getValue();
      if (currentValue !== initialContent) {
        terminalData.commandLine.userEdited = cdPrefix + currentValue;
      } else {
        terminalData.commandLine.userEdited = void 0;
      }
    }));
    const elements = h(".chat-confirmation-message-terminal", [
      h(".chat-confirmation-message-terminal-editor@editor"),
      h(".chat-confirmation-message-terminal-disclaimer@disclaimer")
    ]);
    append(elements.editor, editor.object.element);
    const editorResizeObserver = this._register(new DisposableResizeObserver("ChatTerminalToolConfirmationSubPart.editor", (entries2) => {
      const width2 = entries2[0]?.contentRect.width;
      if (width2) {
        editor.object.layout(width2);
      }
    }, getWindow(this.context.container)));
    this._register(editorResizeObserver.observe(elements.editor));
    this._register(hoverService.setupDelayedHover(elements.editor, {
      content: message || "",
      style: 1 /* Pointer */,
      position: { hoverPosition: 0 /* LEFT */ }
    }));
    const riskBadge = createApprovalReasonBadge(this._store, this.instantiationService, state.confirmationMessages.approvalReason) ?? createToolRiskBadge(this._store, this.instantiationService, this.riskAssessmentService, this.languageModelToolsService, this.toolInvocation.toolId, state.parameters, "terminal");
    const confirmWidget = this._register(this.instantiationService.createInstance(
      ChatCustomConfirmationWidget,
      this.context,
      {
        title,
        icon: Codicon.terminal,
        message: elements.root,
        footerBanner: riskBadge?.domNode,
        buttons: this._createButtons(buildMoreActions())
      }
    ));
    if (autoApproveEnabled && !customActions && terminalData.autoApproveRuleResolvable && getChatSessionType(this.context.element.sessionResource) === SessionType.AgentHostCopilot) {
      const commandForAnalysis = terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
      const analysisLanguage = terminalData.language === "powershell" ? "powershell" : "shellscript";
      this.terminalChatService.getAutoApproveActions(commandForAnalysis, analysisLanguage).then((actions) => {
        if (this._store.isDisposed || !actions?.length) {
          return;
        }
        if (toolInvocation.state.get().type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
          return;
        }
        customActions = actions;
        confirmWidget.updateButtons(this._createButtons(buildMoreActions()));
      }, onUnexpectedError);
    }
    const detailParts = [];
    if (terminalData.requestUnsandboxedExecution) {
      const reasonText = terminalData.requestUnsandboxedExecutionReason && terminalData.requestUnsandboxedExecutionReason.trim() || localize(12242, null);
      const inline3 = new MarkdownString(void 0, { supportThemeIcons: true });
      inline3.appendMarkdown(`$(${Codicon.info.id}) `);
      inline3.appendText(reasonText);
      detailParts.push({
        inline: inline3,
        hoverLabel: localize(12240, null),
        hoverBody: escapeMarkdownSyntaxTokens(reasonText),
        isTrusted: void 0
      });
    }
    if (terminalData.requestAllowNetwork) {
      const reasonText = terminalData.requestAllowNetworkReason && terminalData.requestAllowNetworkReason.trim() || localize(12238, null);
      const inline3 = new MarkdownString(void 0, { supportThemeIcons: true });
      inline3.appendMarkdown(`$(${Codicon.info.id}) `);
      inline3.appendText(reasonText);
      detailParts.push({
        inline: inline3,
        hoverLabel: localize(12241, null),
        hoverBody: escapeMarkdownSyntaxTokens(reasonText),
        isTrusted: void 0
      });
    }
    if (disclaimer) {
      const inline3 = typeof disclaimer === "string" ? new MarkdownString(disclaimer) : disclaimer;
      const hoverBody = inline3.value.replace(/^\s*\$\([^)]+\)\s*/, "");
      detailParts.push({
        inline: inline3,
        hoverLabel: localize(12239, null),
        hoverBody,
        isTrusted: inline3.isTrusted
      });
    }
    const renderInlineDisclaimers = () => {
      elements.disclaimer.replaceChildren();
      for (const part of detailParts) {
        this._appendMarkdownPart(elements.disclaimer, part.inline, codeBlockRenderOptions);
      }
    };
    if (riskBadge && detailParts.length) {
      const combined = new MarkdownString(void 0, {
        supportThemeIcons: true,
        isTrusted: detailParts.reduce((acc, part) => {
          if (part.isTrusted === true || acc === true) {
            return true;
          }
          if (typeof part.isTrusted === "object" && part.isTrusted) {
            const enabled = /* @__PURE__ */ new Set([
              ...typeof acc === "object" && acc?.enabledCommands ? acc.enabledCommands : [],
              ...part.isTrusted.enabledCommands
            ]);
            return { enabledCommands: [...enabled] };
          }
          return acc;
        }, void 0)
      });
      detailParts.forEach((part, i2) => {
        if (i2 > 0) {
          combined.appendMarkdown("\n\n");
        }
        combined.appendMarkdown(`**${escapeMarkdownSyntaxTokens(part.hoverLabel)}** ${part.hoverBody}`);
      });
      riskBadge.setDetails(combined);
      this._register(riskBadge.onDidHide(() => renderInlineDisclaimers()));
    } else {
      renderInlineDisclaimers();
    }
    const hasToolConfirmationKey = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmationKey.set(true);
    this._register(toDisposable(() => hasToolConfirmationKey.reset()));
    this._register(confirmWidget.onDidClick(async ({ button, isTouchClick }) => {
      let doComplete = true;
      const data = button.data;
      let toolConfirmKind = 0 /* Denied */;
      if (typeof data === "boolean") {
        if (data) {
          toolConfirmKind = 4 /* UserAction */;
          if (terminalData.autoApproveInfo) {
            terminalData.autoApproveInfo = void 0;
          }
        }
      } else if (typeof data !== "boolean") {
        switch (data.type) {
          case "enable": {
            const optedIn = await this._showAutoApproveWarning();
            if (optedIn) {
              this.storageService.store("chat.tools.terminal.autoApprove.warningAccepted" /* TerminalAutoApproveWarningAccepted */, true, -1 /* APPLICATION */, 0 /* USER */);
              if (terminalData.autoApproveInfo) {
                toolConfirmKind = 4 /* UserAction */;
              } else {
                if (customActions) {
                  for (const action of customActions) {
                    if (!(action instanceof Separator)) {
                      action.disabled = false;
                    }
                  }
                }
                confirmWidget.updateButtons(this._createButtons(buildMoreActions()));
                doComplete = false;
              }
            } else {
              doComplete = false;
            }
            break;
          }
          case "skip": {
            toolConfirmKind = 5 /* Skipped */;
            break;
          }
          case "newRule": {
            let formatRuleLinks = function(rules, scope) {
              return rules.map((e) => {
                if (scope === "session") {
                  return `\`${e.key}\``;
                }
                const target = scope === "workspace" ? 5 /* WORKSPACE */ : 2 /* USER */;
                const settingsUri = createCommandUri(TerminalContribCommandId.OpenTerminalSettingsLink, target);
                return `[\`${e.key}\`](${settingsUri.toString()} "${localize(12249, null)}")`;
              }).join(", ");
            };
            const newRules = asArray(data.rule);
            const sessionRules = newRules.filter((r2) => r2.scope === "session");
            const workspaceRules = newRules.filter((r2) => r2.scope === "workspace");
            const userRules = newRules.filter((r2) => r2.scope === "user");
            const chatSessionResource = this.context.element.sessionResource;
            for (const rule of sessionRules) {
              this.terminalChatService.addSessionAutoApproveRule(chatSessionResource, rule.key, rule.value);
            }
            if (workspaceRules.length > 0) {
              const inspect = this.configurationService.inspect(TerminalContribSettingId.AutoApprove);
              const oldValue = inspect.workspaceValue ?? {};
              if (isObject(oldValue)) {
                const newValue = { ...oldValue };
                for (const rule of workspaceRules) {
                  newValue[rule.key] = rule.value;
                }
                await this.configurationService.updateValue(TerminalContribSettingId.AutoApprove, newValue, 5 /* WORKSPACE */);
              } else {
                this.preferencesService.openSettings({
                  jsonEditor: true,
                  target: 5 /* WORKSPACE */,
                  revealSetting: { key: TerminalContribSettingId.AutoApprove }
                });
                throw new ErrorNoTelemetry(`Cannot add new rule, existing workspace setting is unexpected format`);
              }
            }
            if (userRules.length > 0) {
              const inspect = this.configurationService.inspect(TerminalContribSettingId.AutoApprove);
              const oldValue = inspect.userValue ?? {};
              if (isObject(oldValue)) {
                const newValue = { ...oldValue };
                for (const rule of userRules) {
                  newValue[rule.key] = rule.value;
                }
                await this.configurationService.updateValue(TerminalContribSettingId.AutoApprove, newValue, 2 /* USER */);
              } else {
                this.preferencesService.openSettings({
                  jsonEditor: true,
                  target: 2 /* USER */,
                  revealSetting: { key: TerminalContribSettingId.AutoApprove }
                });
                throw new ErrorNoTelemetry(`Cannot add new rule, existing setting is unexpected format`);
              }
            }
            const mdTrustSettings = {
              isTrusted: {
                enabledCommands: [TerminalContribCommandId.OpenTerminalSettingsLink]
              }
            };
            const parts = [];
            if (sessionRules.length > 0) {
              parts.push(sessionRules.length === 1 ? localize(12243, null, formatRuleLinks(sessionRules, "session")) : localize(12244, null, formatRuleLinks(sessionRules, "session")));
            }
            if (workspaceRules.length > 0) {
              parts.push(workspaceRules.length === 1 ? localize(12247, null, formatRuleLinks(workspaceRules, "workspace")) : localize(12248, null, formatRuleLinks(workspaceRules, "workspace")));
            }
            if (userRules.length > 0) {
              parts.push(userRules.length === 1 ? localize(12245, null, formatRuleLinks(userRules, "user")) : localize(12246, null, formatRuleLinks(userRules, "user")));
            }
            if (parts.length > 0) {
              terminalData.autoApproveInfo = new MarkdownString(parts.join(", "), mdTrustSettings);
            }
            toolConfirmKind = 4 /* UserAction */;
            break;
          }
          case "configure": {
            this.preferencesService.openSettings({
              target: 2 /* USER */,
              query: `@id:${TerminalContribSettingId.AutoApprove}`
            });
            doComplete = false;
            break;
          }
          case "sessionApproval": {
            const sessionResource = this.context.element.sessionResource;
            this.terminalChatService.setChatSessionAutoApproval(sessionResource, true);
            const disableUri = createCommandUri(TerminalContribCommandId.DisableSessionAutoApproval, sessionResource);
            const mdTrustSettings = {
              isTrusted: {
                enabledCommands: [TerminalContribCommandId.DisableSessionAutoApproval]
              }
            };
            terminalData.autoApproveInfo = new MarkdownString(`${localize(12250, null)} ([${localize(12251, null)}](${disableUri.toString()}))`, mdTrustSettings);
            toolConfirmKind = 4 /* UserAction */;
            break;
          }
        }
      }
      if (doComplete) {
        IChatToolInvocation.confirmWith(toolInvocation, { type: toolConfirmKind });
        if (!isTouchClick) {
          this.chatWidgetService.getWidgetBySessionResource(this.context.element.sessionResource)?.focusInput();
        }
      }
    }));
    this.domNode = confirmWidget.domNode;
  }
  _createButtons(moreActions) {
    const getLabelAndTooltip = (label3, actionId, tooltipDetail = label3) => {
      const tooltip = this.keybindingService.appendKeybinding(tooltipDetail, actionId);
      return { label: label3, tooltip };
    };
    return [
      {
        ...getLabelAndTooltip(localize(12253, null), AcceptToolConfirmationActionId),
        data: true,
        moreActions
      },
      {
        ...getLabelAndTooltip(localize(12254, null), SkipToolConfirmationActionId, localize(12252, null)),
        data: { type: "skip" },
        isSecondary: true
      }
    ];
  }
  async _showAutoApproveWarning() {
    const promptResult = await this.dialogService.prompt({
      type: severity_default.Info,
      message: localize(12237, null),
      buttons: [{
        label: localize(12233, null),
        run: () => true
      }],
      cancelButton: true,
      custom: {
        icon: Codicon.shield,
        markdownDetails: [{
          markdown: new MarkdownString(localize(12235, null))
        }, {
          markdown: new MarkdownString(`[${localize(12236, null)}](https://code.visualstudio.com/docs/agents/run/security?referrer=in-product#_security-risks-to-be-aware-of)`)
        }]
      }
    });
    return promptResult.result === true;
  }
  _appendMarkdownPart(container3, message, codeBlockRenderOptions) {
    const part = this._register(this.instantiationService.createInstance(
      ChatMarkdownContentPart,
      {
        kind: "markdownContent",
        content: typeof message === "string" ? new MarkdownString().appendMarkdown(message) : message
      },
      this.context,
      this.editorPool,
      false,
      this.codeBlockStartIndex,
      this.renderer,
      void 0,
      this.currentWidthDelegate(),
      { codeBlockRenderOptions }
    ));
    append(container3, part.domNode);
  }
};

ChatTerminalToolConfirmationSubPart = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, ILanguageService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IChatWidgetService),
  __decorateParam(14, IPreferencesService),
  __decorateParam(15, IStorageService),
  __decorateParam(16, ITerminalChatService),
  __decorateParam(17, IHoverService),
  __decorateParam(18, ILanguageModelToolsService),
  __decorateParam(19, IChatToolRiskAssessmentService)
], ChatTerminalToolConfirmationSubPart);
export { ChatTerminalToolConfirmationSubPart };
