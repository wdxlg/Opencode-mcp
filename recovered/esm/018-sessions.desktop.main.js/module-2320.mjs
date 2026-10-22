// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/abstractToolConfirmationSubPart.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { localize } from "./module-0001.mjs";
import { createApprovalReasonBadge, createToolRiskBadge } from "./module-2281.mjs";
import { ChatCustomConfirmationWidget } from "./module-2274.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Separator } from "./module-0082.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/abstractToolConfirmationSubPart.ts
var ChatConfirmationOpenedEditors = class extends Disposable {
  constructor(_toolInvocation, _editorService) {
    super();
    this._toolInvocation = _toolInvocation;
    this._editorService = _editorService;
    this._opened = [];
    this.fileWidgetOptions = {
      trackOpen: (open2) => this._trackOpen(open2)
    };
  }
  /**
   * The opener API doesn't report which editor it opened, so attribute the editor the click
   * left active. Editors that were already open beforehand are left alone.
   */
  async _trackOpen(open2) {
    const before = new Set(this._editorService.editors);
    try {
      await open2();
    } finally {
      const pane = this._editorService.activeEditorPane;
      if (pane?.input && !before.has(pane.input)) {
        this._opened.push({ editor: pane.input, groupId: pane.group.id });
      }
    }
  }
  /**
   * A confirmation can be answered by clicking a button, but also by keybinding or voice. All
   * of those transition the invocation out of its waiting state, which re-renders and disposes
   * this sub part, so cleaning up here covers every path. Editors are kept when the part is
   * disposed for any other reason, such as the list virtualizing the response away.
   */
  dispose() {
    const stateKind = this._toolInvocation.state.get().type;
    if (stateKind !== IChatToolInvocation.StateKind.WaitingForConfirmation && stateKind !== IChatToolInvocation.StateKind.WaitingForPostApproval) {
      const toClose = this._opened.filter(({ editor }) => !editor.isDisposed() && !editor.isDirty());
      if (toClose.length) {
        this._editorService.closeEditors(toClose).catch(onUnexpectedError);
      }
    }
    this._opened.length = 0;
    super.dispose();
  }
};

ChatConfirmationOpenedEditors = __decorateClass([
  __decorateParam(1, IEditorService)
], ChatConfirmationOpenedEditors);

var AbstractToolConfirmationSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService) {
    super(toolInvocation);
    this.toolInvocation = toolInvocation;
    this.context = context2;
    this.instantiationService = instantiationService;
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.languageModelToolsService = languageModelToolsService;
    this.riskAssessmentService = riskAssessmentService;
    if (toolInvocation.kind !== "toolInvocation") {
      throw new Error("Confirmation only works with live tool invocations");
    }
    this.openedEditors = this._register(instantiationService.createInstance(ChatConfirmationOpenedEditors, toolInvocation));
  }
  render(config) {
    const { keybindingService, languageModelToolsService, toolInvocation } = this;
    const state = toolInvocation.state.get();
    const customOptions = state.type === IChatToolInvocation.StateKind.WaitingForConfirmation ? state.confirmationMessages?.customOptions : void 0;
    let buttons;
    if (customOptions && customOptions.length > 0) {
      buttons = this.buildCustomOptionButtons(toolInvocation, customOptions);
    } else {
      const allowTooltip = keybindingService.appendKeybinding(config.allowLabel, config.allowActionId);
      const skipTooltip = keybindingService.appendKeybinding(config.skipLabel, config.skipActionId);
      const additionalActions = this.additionalPrimaryActions();
      const sessionAction = this.useAllowOnceAsPrimary() ? void 0 : additionalActions.find(
        (action) => "scope" in action && action.scope === "session"
      );
      const allowAction = {
        label: config.allowLabel,
        tooltip: allowTooltip,
        data: () => {
          this.confirmWith(toolInvocation, { type: 4 /* UserAction */ });
        }
      };
      const primaryAction = sessionAction ?? allowAction;
      const moreActions = sessionAction ? [allowAction, ...additionalActions.filter((a) => a !== sessionAction)] : additionalActions;
      buttons = [
        {
          label: primaryAction.label,
          tooltip: primaryAction.tooltip,
          data: primaryAction.data,
          moreActions: moreActions.length > 0 ? moreActions : void 0
        },
        {
          label: localize(12199, null),
          tooltip: skipTooltip,
          data: () => {
            this.confirmWith(toolInvocation, { type: 5 /* Skipped */ });
          },
          isSecondary: true
        }
      ];
    }
    const contentElement = this.createContentElement();
    const tool = languageModelToolsService.getTool(toolInvocation.toolId);
    const approvalReasonBadge = state.type === IChatToolInvocation.StateKind.WaitingForConfirmation ? createApprovalReasonBadge(this._store, this.instantiationService, state.confirmationMessages?.approvalReason) : void 0;
    const riskBadge = approvalReasonBadge?.domNode ?? (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation ? this.createRiskBadgeDomNode(state.parameters) : void 0);
    const confirmWidget = this._register(this.instantiationService.createInstance(
      ChatCustomConfirmationWidget,
      this.context,
      {
        title: this.getTitle(),
        icon: tool?.icon && "id" in tool.icon ? tool.icon : Codicon.tools,
        subtitle: config.subtitle,
        buttons,
        message: contentElement,
        footerBanner: riskBadge,
        fileWidgetOptions: this.openedEditors.fileWidgetOptions,
        toolbarData: {
          arg: toolInvocation,
          partType: config.partType,
          partSource: toolInvocation.source.type
        }
      }
    ));
    const hasToolConfirmation = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmation.set(true);
    this._register(confirmWidget.onDidClick(({ button, isTouchClick }) => {
      button.data();
      if (!isTouchClick) {
        this.chatWidgetService.getWidgetBySessionResource(this.context.element.sessionResource)?.focusInput();
      }
    }));
    this._register(toDisposable(() => hasToolConfirmation.reset()));
    this.domNode = confirmWidget.domNode;
  }
  confirmWith(toolInvocation, reason) {
    IChatToolInvocation.confirmWith(toolInvocation, reason);
  }
  buildCustomOptionButtons(toolInvocation, options3) {
    const approve = [];
    const deny = [];
    for (const option2 of options3) {
      (option2.kind === "deny" /* Deny */ ? deny : approve).push(option2);
    }
    const makeAction = (option2) => ({
      label: option2.label,
      data: () => {
        this.confirmWith(toolInvocation, { type: 4 /* UserAction */, selectedButton: option2.id, selectedButtonKind: option2.kind });
      }
    });
    const makeGroupButton = (group2, isSecondary) => {
      const [primary, ...rest] = group2;
      const button = {
        ...makeAction(primary),
        isSecondary
      };
      if (rest.length > 0) {
        const moreActions = [];
        let prevGroup = primary.group;
        for (const option2 of rest) {
          if (option2.group !== prevGroup) {
            moreActions.push(new Separator());
          }
          moreActions.push(makeAction(option2));
          prevGroup = option2.group;
        }
        button.moreActions = moreActions;
      }
      return button;
    };
    const buttons = [];
    if (approve.length > 0) {
      buttons.push(makeGroupButton(approve, false));
    }
    if (deny.length > 0) {
      buttons.push(makeGroupButton(deny, approve.length > 0));
    }
    return buttons;
  }
  additionalPrimaryActions() {
    return [];
  }
  /**
   * Create the risk-assessment badge DOM node for this confirmation, or
   * `undefined` when the feature is disabled or the tool is unknown. Returned
   * as a `footerBanner` for the confirmation widget.
   */
  createRiskBadgeDomNode(parameters) {
    return createToolRiskBadge(this._store, this.instantiationService, this.riskAssessmentService, this.languageModelToolsService, this.toolInvocation.toolId, parameters)?.domNode;
  }
  /**
   * When true, "Allow Once" stays the primary button even when a
   * session-scoped action is available. Subclasses override this
   * to keep the simple allow-once default (e.g. when combination
   * approval options are present).
   */
  useAllowOnceAsPrimary() {
    return false;
  }
};

AbstractToolConfirmationSubPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, ILanguageModelToolsService),
  __decorateParam(7, IChatToolRiskAssessmentService)
], AbstractToolConfirmationSubPart);
export { ChatConfirmationOpenedEditors, AbstractToolConfirmationSubPart };
