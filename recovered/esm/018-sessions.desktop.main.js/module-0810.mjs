// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverAccessibleViews.ts
import { localize } from "./module-0001.mjs";
import { DECREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID, DECREASE_HOVER_VERBOSITY_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID } from "./module-0579.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Codicon } from "./module-0085.mjs";
import { labelForHoverVerbosityAction } from "./module-0608.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/editor/contrib/hover/browser/hoverAccessibleViews.ts
var HoverAccessibilityHelpNLS;

((HoverAccessibilityHelpNLS2) => {
  HoverAccessibilityHelpNLS2.increaseVerbosity = localize(1281, null, `<keybinding:${INCREASE_HOVER_VERBOSITY_ACTION_ID}>`);
  HoverAccessibilityHelpNLS2.decreaseVerbosity = localize(1280, null, `<keybinding:${DECREASE_HOVER_VERBOSITY_ACTION_ID}>`);
})(HoverAccessibilityHelpNLS || (HoverAccessibilityHelpNLS = {}));

var HoverAccessibleView = class {
  constructor() {
    this.type = "view" /* View */;
    this.priority = 95;
    this.name = "hover";
    this.when = EditorContextKeys.hoverFocused;
  }
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      throw new Error("No active or focused code editor");
    }
    const hoverController = ContentHoverController.get(codeEditor);
    if (!hoverController) {
      return;
    }
    const keybindingService = accessor.get(IKeybindingService);
    return accessor.get(IInstantiationService).createInstance(HoverAccessibleViewProvider, keybindingService, codeEditor, hoverController);
  }
};

var HoverAccessibilityHelp = class {
  constructor() {
    this.priority = 100;
    this.name = "hover";
    this.type = "help" /* Help */;
    this.when = EditorContextKeys.hoverVisible;
  }
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      throw new Error("No active or focused code editor");
    }
    const hoverController = ContentHoverController.get(codeEditor);
    if (!hoverController) {
      return;
    }
    return accessor.get(IInstantiationService).createInstance(HoverAccessibilityHelpProvider, hoverController);
  }
};

var BaseHoverAccessibleViewProvider = class extends Disposable {
  constructor(_hoverController) {
    super();
    this._hoverController = _hoverController;
    this.id = "hover" /* Hover */;
    this.verbositySettingKey = "accessibility.verbosity.hover";
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._focusedHoverPartIndex = -1;
  }
  onOpen() {
    if (!this._hoverController) {
      return;
    }
    this._hoverController.shouldKeepOpenOnEditorMouseMoveOrLeave = true;
    this._focusedHoverPartIndex = this._hoverController.focusedHoverPartIndex();
    this._register(this._hoverController.onHoverContentsChanged(() => {
      this._onDidChangeContent.fire();
    }));
  }
  onClose() {
    if (!this._hoverController) {
      return;
    }
    if (this._focusedHoverPartIndex === -1) {
      this._hoverController.focus();
    } else {
      this._hoverController.focusHoverPartWithIndex(this._focusedHoverPartIndex);
    }
    this._focusedHoverPartIndex = -1;
    this._hoverController.shouldKeepOpenOnEditorMouseMoveOrLeave = false;
  }
  provideContentAtIndex(focusedHoverIndex, includeVerbosityActions) {
    if (focusedHoverIndex !== -1) {
      const accessibleContent = this._hoverController.getAccessibleWidgetContentAtIndex(focusedHoverIndex);
      if (accessibleContent === void 0) {
        return "";
      }
      const contents = [];
      if (includeVerbosityActions) {
        contents.push(...this._descriptionsOfVerbosityActionsForIndex(focusedHoverIndex));
      }
      contents.push(accessibleContent);
      return contents.join("\n");
    } else {
      const accessibleContent = this._hoverController.getAccessibleWidgetContent();
      if (accessibleContent === void 0) {
        return "";
      }
      const contents = [];
      contents.push(accessibleContent);
      return contents.join("\n");
    }
  }
  _descriptionsOfVerbosityActionsForIndex(index2) {
    const content = [];
    const descriptionForIncreaseAction = this._descriptionOfVerbosityActionForIndex(0 /* Increase */, index2);
    if (descriptionForIncreaseAction !== void 0) {
      content.push(descriptionForIncreaseAction);
    }
    const descriptionForDecreaseAction = this._descriptionOfVerbosityActionForIndex(1 /* Decrease */, index2);
    if (descriptionForDecreaseAction !== void 0) {
      content.push(descriptionForDecreaseAction);
    }
    return content;
  }
  _descriptionOfVerbosityActionForIndex(action, index2) {
    const isActionSupported = this._hoverController.doesHoverAtIndexSupportVerbosityAction(index2, action);
    if (!isActionSupported) {
      return;
    }
    switch (action) {
      case 0 /* Increase */:
        return HoverAccessibilityHelpNLS.increaseVerbosity;
      case 1 /* Decrease */:
        return HoverAccessibilityHelpNLS.decreaseVerbosity;
    }
  }
};

var HoverAccessibilityHelpProvider = class extends BaseHoverAccessibleViewProvider {
  constructor(hoverController) {
    super(hoverController);
    this.options = { type: "help" /* Help */ };
  }
  provideContent() {
    return this.provideContentAtIndex(this._focusedHoverPartIndex, true);
  }
};

var HoverAccessibleViewProvider = class extends BaseHoverAccessibleViewProvider {
  constructor(_keybindingService, _editor, hoverController) {
    super(hoverController);
    this._keybindingService = _keybindingService;
    this._editor = _editor;
    this.options = { type: "view" /* View */ };
    this._initializeOptions(this._editor, hoverController);
  }
  provideContent() {
    return this.provideContentAtIndex(this._focusedHoverPartIndex, false);
  }
  get actions() {
    const actions = [];
    actions.push(this._getActionFor(this._editor, 0 /* Increase */));
    actions.push(this._getActionFor(this._editor, 1 /* Decrease */));
    return actions;
  }
  _getActionFor(editor, action) {
    let actionId;
    let accessibleActionId;
    let actionCodicon;
    switch (action) {
      case 0 /* Increase */:
        actionId = INCREASE_HOVER_VERBOSITY_ACTION_ID;
        accessibleActionId = INCREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID;
        actionCodicon = Codicon.add;
        break;
      case 1 /* Decrease */:
        actionId = DECREASE_HOVER_VERBOSITY_ACTION_ID;
        accessibleActionId = DECREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID;
        actionCodicon = Codicon.remove;
        break;
    }
    const actionLabel = labelForHoverVerbosityAction(this._keybindingService, action);
    const actionEnabled = this._hoverController.doesHoverAtIndexSupportVerbosityAction(this._focusedHoverPartIndex, action);
    return new Action(accessibleActionId, actionLabel, ThemeIcon.asClassName(actionCodicon), actionEnabled, () => {
      editor.getAction(actionId)?.run({ index: this._focusedHoverPartIndex, focus: false });
    });
  }
  _initializeOptions(editor, hoverController) {
    const helpProvider = this._register(new HoverAccessibilityHelpProvider(hoverController));
    this.options.language = editor.getModel()?.getLanguageId();
    this.options.customHelp = () => {
      return helpProvider.provideContentAtIndex(this._focusedHoverPartIndex, true);
    };
  }
};

var ExtHoverAccessibleView = class {
  constructor() {
    this.type = "view" /* View */;
    this.priority = 90;
    this.name = "extension-hover";
  }
  getProvider(accessor) {
    const contextViewService = accessor.get(IContextViewService);
    const contextViewElement = contextViewService.getContextViewElement();
    const extensionHoverContent = contextViewElement?.textContent ?? void 0;
    const hoverService = accessor.get(IHoverService);
    if (contextViewElement.classList.contains("accessible-view-container") || !extensionHoverContent) {
      return;
    }
    return new AccessibleContentProvider(
      "hover" /* Hover */,
      { language: "typescript", type: "view" /* View */ },
      () => {
        return extensionHoverContent;
      },
      () => {
        hoverService.showAndFocusLastHover();
      },
      "accessibility.verbosity.hover"
    );
  }
};
export { HoverAccessibilityHelpNLS, HoverAccessibleView, HoverAccessibilityHelp, BaseHoverAccessibleViewProvider, HoverAccessibilityHelpProvider, HoverAccessibleViewProvider, ExtHoverAccessibleView };
