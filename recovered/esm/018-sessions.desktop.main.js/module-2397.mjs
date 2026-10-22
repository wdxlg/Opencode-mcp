// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.ts
import { Disposable } from "./module-0012.mjs";
import { EmptyTextEditorHintContributionId } from "./module-1349.mjs";
import { LOG_MODE_ID, OUTPUT_MODE_ID } from "./module-1245.mjs";
import { SEARCH_RESULT_LANGUAGE_ID } from "./module-1000.mjs";
import { Schemas } from "./module-0033.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInlineChatSessionService } from "./module-1876.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Event2 } from "./module-0017.mjs";
import { status } from "./module-0076.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { $, addDisposableListener, getActiveWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ChangeLanguageAction } from "./module-1549.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { Position } from "./module-0079.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.ts
var emptyTextEditorHintSetting = "workbench.editor.empty.hint";

var EmptyTextEditorHintContribution = class extends Disposable {
  constructor(editor, configurationService, inlineChatSessionService, chatAgentService, instantiationService) {
    super();
    this.editor = editor;
    this.configurationService = configurationService;
    this.inlineChatSessionService = inlineChatSessionService;
    this.chatAgentService = chatAgentService;
    this.instantiationService = instantiationService;
    this._register(this.editor.onDidChangeModel(() => this.update()));
    this._register(this.editor.onDidChangeModelLanguage(() => this.update()));
    this._register(this.editor.onDidChangeModelContent(() => this.update()));
    this._register(this.chatAgentService.onDidChangeAgents(() => this.update()));
    this._register(this.editor.onDidChangeModelDecorations(() => this.update()));
    this._register(this.editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(104 /* readOnly */)) {
        this.update();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(emptyTextEditorHintSetting)) {
        this.update();
      }
    }));
    this._register(inlineChatSessionService.onWillStartSession((editor2) => {
      if (this.editor === editor2) {
        this.disposeHint();
      }
    }));
    this._register(inlineChatSessionService.onDidChangeSessions(() => {
      this.update();
    }));
  }
  static {
    this.ID = EmptyTextEditorHintContributionId;
  }
  shouldRenderHint() {
    const configValue = this.configurationService.getValue(emptyTextEditorHintSetting);
    if (configValue === "hidden") {
      return false;
    }
    if (this.editor.getOption(104 /* readOnly */)) {
      return false;
    }
    const model = this.editor.getModel();
    const languageId = model?.getLanguageId();
    if (!model || languageId === OUTPUT_MODE_ID || languageId === LOG_MODE_ID || languageId === SEARCH_RESULT_LANGUAGE_ID) {
      return false;
    }
    if (this.inlineChatSessionService.getSessionByTextModel(model.uri)) {
      return false;
    }
    if (this.editor.getModel()?.getValueLength()) {
      return false;
    }
    const hasConflictingDecorations = Boolean(this.editor.getLineDecorations(1)?.find(
      (d) => d.options.beforeContentClassName || d.options.afterContentClassName || d.options.before?.content || d.options.after?.content
    ));
    if (hasConflictingDecorations) {
      return false;
    }
    const hasEditorAgents = Boolean(this.chatAgentService.getDefaultAgent("editor" /* EditorInline */));
    const shouldRenderDefaultHint = model?.uri.scheme === Schemas.untitled && languageId === PLAINTEXT_LANGUAGE_ID;
    return hasEditorAgents || shouldRenderDefaultHint;
  }
  update() {
    const shouldRenderHint = this.shouldRenderHint();
    if (shouldRenderHint && !this.textHintContentWidget) {
      this.textHintContentWidget = this.instantiationService.createInstance(EmptyTextEditorHintContentWidget, this.editor);
    } else if (!shouldRenderHint && this.textHintContentWidget) {
      this.disposeHint();
    }
  }
  disposeHint() {
    this.textHintContentWidget?.dispose();
    this.textHintContentWidget = void 0;
  }
  dispose() {
    super.dispose();
    this.disposeHint();
  }
};

EmptyTextEditorHintContribution = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInlineChatSessionService),
  __decorateParam(3, IChatAgentService),
  __decorateParam(4, IInstantiationService)
], EmptyTextEditorHintContribution);

var EmptyTextEditorHintContentWidget = class extends Disposable {
  constructor(editor, commandService, configurationService, keybindingService, chatAgentService, telemetryService, contextMenuService) {
    super();
    this.editor = editor;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.chatAgentService = chatAgentService;
    this.telemetryService = telemetryService;
    this.contextMenuService = contextMenuService;
    this.isVisible = false;
    this.ariaLabel = "";
    this._register(this.editor.onDidChangeConfiguration((e4) => {
      if (this.domNode && e4.hasChanged(59 /* fontInfo */)) {
        this.editor.applyFontInfo(this.domNode);
      }
    }));
    const onDidFocusEditorText = Event2.debounce(this.editor.onDidFocusEditorText, () => void 0, 500);
    this._register(onDidFocusEditorText(() => {
      if (this.editor.hasTextFocus() && this.isVisible && this.ariaLabel && this.configurationService.getValue("accessibility.verbosity.emptyEditorHint" /* EmptyEditorHint */)) {
        status(this.ariaLabel);
      }
    }));
    this.editor.addContentWidget(this);
  }
  static {
    this.ID = "editor.widget.emptyHint";
  }
  getId() {
    return EmptyTextEditorHintContentWidget.ID;
  }
  disableHint(e4) {
    const disableHint = () => {
      this.configurationService.updateValue(emptyTextEditorHintSetting, "hidden");
      this.dispose();
      this.editor.focus();
    };
    if (!e4) {
      disableHint();
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => {
        return new StandardMouseEvent(getActiveWindow(), e4);
      },
      getActions: () => {
        return [
          {
            id: "workench.action.disableEmptyEditorHint",
            label: localize(13785, null),
            tooltip: localize(13785, null),
            enabled: true,
            class: void 0,
            run: () => {
              disableHint();
            }
          }
        ];
      }
    });
  }
  getHint() {
    const hasInlineChatProvider = this.chatAgentService.getActivatedAgents().filter((candidate) => candidate.locations.includes("editor" /* EditorInline */)).length > 0;
    const hintHandler = {
      disposables: this._store,
      callback: (index2, event) => {
        switch (index2) {
          case "0":
            hasInlineChatProvider ? askSomething(event.browserEvent) : languageOnClickOrTap(event.browserEvent);
            break;
          case "1":
            hasInlineChatProvider ? languageOnClickOrTap(event.browserEvent) : this.disableHint();
            break;
          case "2":
            this.disableHint();
            break;
        }
      }
    };
    const askSomethingCommandId = "inlineChat.start";
    const askSomething = async (e4) => {
      e4.stopPropagation();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: askSomethingCommandId,
        from: "hint"
      });
      await this.commandService.executeCommand(askSomethingCommandId, { from: "hint" });
    };
    const languageOnClickOrTap = async (e4) => {
      e4.stopPropagation();
      this.editor.focus();
      this.telemetryService.publicLog2("workbenchActionExecuted", {
        id: ChangeLanguageAction.ID,
        from: "hint"
      });
      await this.commandService.executeCommand(ChangeLanguageAction.ID);
      this.editor.focus();
    };
    const keybindingsLookup = [askSomethingCommandId, ChangeLanguageAction.ID];
    const keybindingLabels = keybindingsLookup.map((id2) => this.keybindingService.lookupKeybinding(id2)?.getLabel());
    const hintMsg = (hasInlineChatProvider ? localize(13787, null, keybindingLabels.at(0) ?? "", keybindingLabels.at(1) ?? "") : localize(13788, null, keybindingLabels.at(1) ?? "")).replaceAll(" ()", "");
    const hintElement = renderFormattedText(hintMsg, {
      actionHandler: hintHandler,
      renderCodeSegments: false
    });
    hintElement.style.fontStyle = "italic";
    const ariaLabel = hasInlineChatProvider ? localize(13783, null, ...keybindingLabels) : localize(13784, null, ...keybindingLabels);
    for (const anchor of hintElement.querySelectorAll("a")) {
      anchor.style.cursor = "pointer";
    }
    return { hintElement, ariaLabel };
  }
  getDomNode() {
    if (!this.domNode) {
      this.domNode = $(".empty-editor-hint");
      this.domNode.style.width = "max-content";
      this.domNode.style.paddingLeft = "4px";
      const { hintElement, ariaLabel } = this.getHint();
      this.domNode.append(hintElement);
      this.ariaLabel = ariaLabel.concat(localize(13786, null, "accessibility.verbosity.emptyEditorHint" /* EmptyEditorHint */));
      this._register(addDisposableListener(this.domNode, "click", () => {
        this.editor.focus();
      }));
      this.editor.applyFontInfo(this.domNode);
      const lineHeight = this.editor.getLineHeightForPosition(new Position(1, 1));
      this.domNode.style.lineHeight = lineHeight + "px";
    }
    return this.domNode;
  }
  getPosition() {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [0 /* EXACT */]
    };
  }
  dispose() {
    super.dispose();
    this.editor.removeContentWidget(this);
  }
};

EmptyTextEditorHintContentWidget = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IChatAgentService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IContextMenuService)
], EmptyTextEditorHintContentWidget);

registerEditorContribution(EmptyTextEditorHintContribution.ID, EmptyTextEditorHintContribution, 0 /* Eager */);
export { emptyTextEditorHintSetting, EmptyTextEditorHintContribution, EmptyTextEditorHintContentWidget };
