// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/agentEditorComments/browser/agentEditorCommentsOverlayWidget.ts
import { ActionRunner } from "./module-0082.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/services/agentEditorComments/browser/agentEditorCommentsOverlayWidget.ts
var SubmitCommentsActionRunner = class extends ActionRunner {
  constructor(_submitActionId, _editorGroup) {
    super();
    this._submitActionId = _submitActionId;
    this._editorGroup = _editorGroup;
  }
  async runAction(action, context2) {
    const editorToClose = action.id === this._submitActionId ? this._editorGroup.activeEditor : void 0;
    const didSubmit = await action.run(context2);
    if (didSubmit === true && editorToClose) {
      await this._editorGroup.closeEditor(editorToClose);
    }
  }
};

var CommentsActionViewItem = class extends ActionViewItem {
  constructor(action, options3, _overlayOptions, _keybindingService, _commentCount, editorGroup) {
    const isIconOnly = action.id === _overlayOptions.previousActionId || action.id === _overlayOptions.nextActionId;
    super(void 0, action, { ...options3, icon: isIconOnly, label: !isIconOnly, keybindingNotRenderedWithLabel: true });
    this._overlayOptions = _overlayOptions;
    this._keybindingService = _keybindingService;
    this._commentCount = _commentCount;
    if (action.id === _overlayOptions.submitActionId && editorGroup) {
      this.actionRunner = this._register(new SubmitCommentsActionRunner(_overlayOptions.submitActionId, editorGroup));
    }
  }
  render(container2) {
    super.render(container2);
    if (this._action.id === this._overlayOptions.submitActionId) {
      this.element?.classList.add("primary");
      this._store.add(autorun((reader) => {
        this._commentCount.read(reader);
        this.updateLabel();
        this.updateTooltip();
      }));
    }
  }
  updateLabel() {
    if (this._action.id === this._overlayOptions.submitActionId && this.label) {
      this.label.textContent = localize(22714, null, this._commentCount.get());
      return;
    }
    super.updateLabel();
  }
  getTooltip() {
    const value2 = this._action.id === this._overlayOptions.submitActionId ? localize(22713, null, this._commentCount.get()) : super.getTooltip();
    return value2 && !this.options.keybinding ? this._keybindingService.appendKeybinding(value2, this._action.id) : value2;
  }
};

var AgentEditorCommentsOverlayWidget = class extends Disposable {
  constructor(_options, _instantiationService, _keybindingService) {
    super();
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._keybindingService = _keybindingService;
    this._showStore = this._register(new DisposableStore());
    this._navigationBearings = observableValue(this, { activeIdx: -1, totalCount: 0 });
    this._commentCount = observableValue(this, 0);
    this._domNode = document.createElement("div");
    this._domNode.classList.add("agent-editor-comments-overlay-widget");
    this._toolbarNode = document.createElement("div");
    this._toolbarNode.classList.add("agent-editor-comments-overlay-toolbar");
  }
  getDomNode() {
    return this._domNode;
  }
  show(navigationBearings, commentCount, editorGroup) {
    this._showStore.clear();
    this._navigationBearings.set(navigationBearings, void 0);
    this._commentCount.set(commentCount, void 0);
    if (!this._domNode.contains(this._toolbarNode)) {
      this._domNode.appendChild(this._toolbarNode);
    }
    const toolbar = this._showStore.add(this._instantiationService.createInstance(MenuWorkbenchToolBar, this._toolbarNode, this._options.menuId, {
      telemetrySource: this._options.telemetrySource,
      hiddenItemStrategy: 0 /* Ignore */,
      toolbarOptions: {
        primaryGroup: () => true,
        useSeparatorsInPrimaryActions: true
      },
      menuOptions: { renderShortTitle: true },
      actionViewItemProvider: (action, options3) => {
        if (action.id === this._options.navigationBearingActionId) {
          const that = this;
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options3, icon: false, label: true, keybindingNotRenderedWithLabel: true });
            }
            render(container2) {
              super.render(container2);
              container2.classList.add("label-item");
              this._store.add(autorun((reader) => {
                if (this.label) {
                  const { activeIdx, totalCount } = that._navigationBearings.read(reader);
                  this.label.innerText = totalCount > 0 ? localize(22712, null, activeIdx === -1 ? 1 : activeIdx + 1, totalCount) : localize(22715, null);
                }
              }));
            }
          }();
        }
        return new CommentsActionViewItem(action, options3, this._options, this._keybindingService, this._commentCount, editorGroup);
      }
    }));
    if (editorGroup) {
      const activeEditor = editorGroup.activeEditor;
      toolbar.context = {
        groupId: editorGroup.id,
        editorIndex: activeEditor ? editorGroup.getIndexOfEditor(activeEditor) : void 0
      };
    }
    this._showStore.add(toDisposable(() => this._toolbarNode.remove()));
  }
  hide() {
    this._showStore.clear();
    this._navigationBearings.set({ activeIdx: -1, totalCount: 0 }, void 0);
    this._commentCount.set(0, void 0);
    this._toolbarNode.remove();
  }
};

AgentEditorCommentsOverlayWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService)
], AgentEditorCommentsOverlayWidget);
export { SubmitCommentsActionRunner, CommentsActionViewItem, AgentEditorCommentsOverlayWidget };
