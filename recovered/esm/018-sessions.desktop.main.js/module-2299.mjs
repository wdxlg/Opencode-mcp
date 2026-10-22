// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatExtensionsInstallToolSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { $, append } from "./module-0075.mjs";
import { ChatExtensionsContentPart } from "./module-2259.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { localize } from "./module-0001.mjs";
import { AcceptToolConfirmationActionId } from "./module-2178.mjs";
import { CancelChatActionId } from "./module-2056.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatConfirmationWidget } from "./module-2274.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { toDisposable } from "./module-0012.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatExtensionsInstallToolSubPart.ts
var ExtensionsInstallConfirmationWidgetSubPart = class extends BaseChatToolInvocationSubPart {
  get codeblocks() {
    return this._confirmWidget?.codeblocks || [];
  }
  get codeblocksPartId() {
    return this._confirmWidget?.codeblocksPartId || "<none>";
  }
  constructor(toolInvocation, context2, keybindingService, contextKeyService, chatWidgetService, extensionManagementService, instantiationService) {
    super(toolInvocation);
    if (toolInvocation.toolSpecificData?.kind !== "extensions") {
      throw new Error("Tool specific data is missing or not of kind extensions");
    }
    const extensionsContent = toolInvocation.toolSpecificData;
    this.domNode = $("");
    const chatExtensionsContentPart = this._register(instantiationService.createInstance(ChatExtensionsContentPart, extensionsContent));
    append(this.domNode, chatExtensionsContentPart.domNode);
    const state = toolInvocation.state.get();
    if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
      const allowLabel = localize(12212, null);
      const allowTooltip = keybindingService.appendKeybinding(allowLabel, AcceptToolConfirmationActionId);
      const cancelLabel = localize(12213, null);
      const cancelTooltip = keybindingService.appendKeybinding(cancelLabel, CancelChatActionId);
      const enableAllowButtonEvent = this._register(new Emitter());
      const buttons = [
        {
          label: allowLabel,
          data: { type: 4 /* UserAction */ },
          tooltip: allowTooltip,
          disabled: true,
          onDidChangeDisablement: enableAllowButtonEvent.event
        },
        {
          label: cancelLabel,
          data: { type: 0 /* Denied */ },
          isSecondary: true,
          tooltip: cancelTooltip
        }
      ];
      const confirmWidget = this._register(instantiationService.createInstance(
        ChatConfirmationWidget,
        context2,
        {
          title: state.confirmationMessages?.title ?? localize(12214, null),
          message: state.confirmationMessages?.message ?? localize(12215, null),
          buttons
        }
      ));
      this._confirmWidget = confirmWidget;
      append(this.domNode, confirmWidget.domNode);
      this._register(confirmWidget.onDidClick(({ button, isTouchClick }) => {
        IChatToolInvocation.confirmWith(toolInvocation, button.data);
        if (!isTouchClick) {
          chatWidgetService.getWidgetBySessionResource(context2.element.sessionResource)?.focusInput();
        }
      }));
      const hasToolConfirmationKey = ChatContextKeys.Editing.hasToolConfirmation.bindTo(contextKeyService);
      hasToolConfirmationKey.set(true);
      this._register(toDisposable(() => hasToolConfirmationKey.reset()));
      const disposable = this._register(extensionManagementService.onInstallExtension((e4) => {
        if (extensionsContent.extensions.some((id2) => areSameExtensions({ id: id2 }, e4.identifier))) {
          disposable.dispose();
          enableAllowButtonEvent.fire(false);
        }
      }));
    }
  }
};

ExtensionsInstallConfirmationWidgetSubPart = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatWidgetService),
  __decorateParam(5, IExtensionManagementService),
  __decorateParam(6, IInstantiationService)
], ExtensionsInstallConfirmationWidgetSubPart);
export { ExtensionsInstallConfirmationWidgetSubPart };
