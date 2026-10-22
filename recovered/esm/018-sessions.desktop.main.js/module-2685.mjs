// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorOverlay.ts
import { ActionViewItem } from "./module-0476.mjs";
import { AcceptAction2, RejectAction, navigationBearingFakeActionId } from "./module-2684.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { assertType } from "./module-0010.mjs";
import { $, addDisposableGenericMouseMoveListener, append } from "./module-0075.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { renderIcon } from "./module-0467.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { transaction } from "./module-0045.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { IChatEditingService } from "./module-1082.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { EditorGroupView } from "./module-2019.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorOverlay.ts
var ChatEditingAcceptRejectActionViewItem = class extends ActionViewItem {
  constructor(action, options3, _entry, _editor, _keybindingService, _primaryActionIds = [AcceptAction2.ID]) {
    super(void 0, action, { ...options3, icon: false, label: true, keybindingNotRenderedWithLabel: true });
    this._entry = _entry;
    this._editor = _editor;
    this._keybindingService = _keybindingService;
    this._primaryActionIds = _primaryActionIds;
    this._reveal = this._store.add(new MutableDisposable());
  }
  render(container2) {
    super.render(container2);
    if (this._primaryActionIds.includes(this._action.id)) {
      this.element?.classList.add("primary");
    }
    if (this._action.id === AcceptAction2.ID) {
      const listener = this._store.add(new MutableDisposable());
      this._store.add(autorun((r2) => {
        assertType(this.label);
        assertType(this.element);
        const ctrl = this._entry.read(r2)?.autoAcceptController.read(r2);
        if (ctrl) {
          const ratio = -100 * (ctrl.remaining / ctrl.total);
          this.element.style.setProperty("--vscode-action-item-auto-timeout", `${ratio}%`);
          this.element.classList.toggle("auto", true);
          listener.value = addDisposableGenericMouseMoveListener(this.element, () => ctrl.cancel());
        } else {
          this.element.classList.toggle("auto", false);
          listener.clear();
        }
      }));
    }
  }
  set actionRunner(actionRunner) {
    super.actionRunner = actionRunner;
    if (this._editor) {
      this._reveal.value = actionRunner.onWillRun((_e) => {
        this._editor.focus();
      });
    }
  }
  get actionRunner() {
    return super.actionRunner;
  }
  getTooltip() {
    const value2 = super.getTooltip();
    if (!value2) {
      return value2;
    }
    return this._keybindingService.appendKeybinding(value2, this._action.id);
  }
};

var ChatEditorOverlayWidget = class extends Disposable {
  constructor(_editor, _keybindingService, _instaService) {
    super();
    this._editor = _editor;
    this._keybindingService = _keybindingService;
    this._instaService = _instaService;
    this._showStore = this._store.add(new DisposableStore());
    this._session = observableValue(this, void 0);
    this._entry = observableValue(this, void 0);
    this._navigationBearings = observableValue(this, { changeCount: -1, activeIdx: -1, entriesCount: -1 });
    this._domNode = document.createElement("div");
    this._domNode.classList.add("chat-editor-overlay-widget");
    this._isBusy = derived((r2) => {
      const entry = this._entry.read(r2);
      return entry?.waitsForLastEdits.read(r2);
    });
    const progressNode = document.createElement("div");
    progressNode.classList.add("chat-editor-overlay-progress");
    append(progressNode, renderIcon(ThemeIcon.modify(Codicon.loadingCompact, "spin")));
    const textProgress = append(progressNode, $("span.progress-message"));
    this._domNode.appendChild(progressNode);
    this._store.add(autorun((r2) => {
      const busy = this._isBusy.read(r2);
      this._domNode.classList.toggle("busy", busy);
      textProgress.innerText = "";
    }));
    this._toolbarNode = document.createElement("div");
    this._toolbarNode.classList.add("chat-editor-overlay-toolbar");
  }
  dispose() {
    this.hide();
    super.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  show(session, entry, indicies) {
    this._showStore.clear();
    transaction((tx) => {
      this._session.set(session, tx);
      this._entry.set(entry, tx);
    });
    this._showStore.add(autorun((r2) => {
      const entryIndex = indicies.entryIndex.read(r2);
      const changeIndex = indicies.changeIndex.read(r2);
      const entries2 = session.entries.read(r2);
      let activeIdx = entryIndex !== void 0 && changeIndex !== void 0 ? changeIndex : -1;
      let totalChangesCount = 0;
      for (let i2 = 0; i2 < entries2.length; i2++) {
        const changesCount = entries2[i2].changesCount.read(r2);
        totalChangesCount += changesCount;
        if (entryIndex !== void 0 && i2 < entryIndex) {
          activeIdx += changesCount;
        }
      }
      this._navigationBearings.set({ changeCount: totalChangesCount, activeIdx, entriesCount: entries2.length }, void 0);
    }));
    this._domNode.appendChild(this._toolbarNode);
    this._showStore.add(toDisposable(() => this._toolbarNode.remove()));
    this._showStore.add(this._instaService.createInstance(MenuWorkbenchToolBar, this._toolbarNode, MenuId.ChatEditingEditorContent, {
      telemetrySource: "chatEditor.overlayToolbar",
      hiddenItemStrategy: 0 /* Ignore */,
      toolbarOptions: {
        primaryGroup: () => true,
        useSeparatorsInPrimaryActions: true
      },
      menuOptions: { renderShortTitle: true },
      actionViewItemProvider: (action, options3) => {
        const that = this;
        if (action.id === navigationBearingFakeActionId) {
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options3, icon: false, label: true, keybindingNotRenderedWithLabel: true });
            }
            render(container2) {
              super.render(container2);
              container2.classList.add("label-item");
              this._store.add(autorun((r2) => {
                assertType(this.label);
                const { changeCount, activeIdx } = that._navigationBearings.read(r2);
                if (changeCount > 0) {
                  const n2 = activeIdx === -1 ? "1" : `${activeIdx + 1}`;
                  this.label.innerText = localize(10854, null, n2, changeCount);
                } else {
                  this.label.innerText = localize(10853, null);
                }
                this.updateTooltip();
              }));
            }
            getTooltip() {
              const { changeCount, entriesCount } = that._navigationBearings.get();
              if (changeCount === -1 || entriesCount === -1) {
                return void 0;
              }
              let result;
              if (changeCount === 1 && entriesCount === 1) {
                result = localize(10855, null);
              } else if (changeCount === 1) {
                result = localize(10856, null, entriesCount);
              } else if (entriesCount === 1) {
                result = localize(10858, null, changeCount);
              } else {
                result = localize(10859, null, changeCount, entriesCount);
              }
              if (!that._isBusy.get()) {
                return result;
              }
              return localize(10857, null, result);
            }
          }();
        }
        if (action.id === AcceptAction2.ID || action.id === RejectAction.ID) {
          return new ChatEditingAcceptRejectActionViewItem(action, options3, that._entry, that._editor, that._keybindingService);
        }
        return void 0;
      }
    }));
  }
  hide() {
    transaction((tx) => {
      this._session.set(void 0, tx);
      this._entry.set(void 0, tx);
      this._navigationBearings.set({ changeCount: -1, activeIdx: -1, entriesCount: -1 }, tx);
    });
    this._showStore.clear();
  }
};

ChatEditorOverlayWidget = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IInstantiationService)
], ChatEditorOverlayWidget);

var ChatEditingOverlayController = class {
  constructor(container2, group2, instaService, chatEditingService) {
    this._store = new DisposableStore();
    this._domNode = document.createElement("div");
    this._domNode.classList.add("chat-editing-editor-overlay");
    this._domNode.style.position = "absolute";
    this._domNode.style.bottom = `24px`;
    this._domNode.style.right = `24px`;
    this._domNode.style.zIndex = `100`;
    const widget = instaService.createInstance(ChatEditorOverlayWidget, group2);
    this._domNode.appendChild(widget.getDomNode());
    this._store.add(toDisposable(() => this._domNode.remove()));
    this._store.add(widget);
    const show3 = () => {
      if (!container2.contains(this._domNode)) {
        container2.appendChild(this._domNode);
      }
    };
    const hide4 = () => {
      if (container2.contains(this._domNode)) {
        widget.hide();
        this._domNode.remove();
      }
    };
    const activeEditorSignal = observableSignalFromEvent(this, Event2.any(group2.onDidActiveEditorChange, group2.onDidModelChange));
    const activeUriObs = derivedOpts({ equalsFn: isEqual2 }, (r2) => {
      activeEditorSignal.read(r2);
      const editor = group2.activeEditorPane;
      if (!getCodeEditor(editor?.getControl())) {
        return void 0;
      }
      const uri4 = EditorResourceAccessor.getOriginalUri(editor?.input, { supportSideBySide: 1 /* PRIMARY */ });
      return uri4;
    });
    const sessionAndEntry = derived((r2) => {
      activeEditorSignal.read(r2);
      const uri4 = activeUriObs.read(r2);
      if (!uri4) {
        return void 0;
      }
      for (const session of chatEditingService.editingSessionsObs.read(r2)) {
        if (!session.isGlobalEditingSession) {
          continue;
        }
        const entry = session.readEntry(uri4, r2);
        if (entry) {
          return { session, entry };
        }
      }
      return void 0;
    });
    this._store.add(autorun((r2) => {
      const data = sessionAndEntry.read(r2);
      if (!data) {
        hide4();
        return;
      }
      const { session, entry } = data;
      if (entry?.state.read(r2) === 0 /* Modified */) {
        const editorPane = group2.activeEditorPane;
        assertType(editorPane);
        const changeIndex = derived((r3) => entry ? entry.getEditorIntegration(editorPane).currentIndex.read(r3) : 0);
        const entryIndex = derived(
          (r3) => entry ? session.entries.read(r3).indexOf(entry) : 0
        );
        widget.show(session, entry, { entryIndex, changeIndex });
        show3();
      } else {
        hide4();
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};

ChatEditingOverlayController = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatEditingService)
], ChatEditingOverlayController);

var ChatEditingEditorOverlay = class {
  constructor(editorGroupsService, instantiationService, environmentService) {
    this._store = new DisposableStore();
    const editorGroups = observableFromEvent(
      this,
      Event2.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup),
      () => editorGroupsService.groups
    );
    const overlayWidgets = this._store.add(new DisposableMap());
    this._store.add(autorun((r2) => {
      if (environmentService.isSessionsWindow) {
        return;
      }
      const toDelete = new Set(overlayWidgets.keys());
      const groups = editorGroups.read(r2);
      for (const group2 of groups) {
        if (!(group2 instanceof EditorGroupView)) {
          continue;
        }
        toDelete.delete(group2);
        if (!overlayWidgets.has(group2)) {
          const scopedInstaService = instantiationService.createChild(
            new ServiceCollection([IContextKeyService, group2.scopedContextKeyService])
          );
          const container2 = group2.element;
          const ctrl = scopedInstaService.createInstance(ChatEditingOverlayController, container2, group2);
          overlayWidgets.set(group2, combinedDisposable(ctrl, scopedInstaService));
        }
      }
      for (const group2 of toDelete) {
        overlayWidgets.deleteAndDispose(group2);
      }
    }));
  }
  static {
    this.ID = "chat.edits.editorOverlay";
  }
  dispose() {
    this._store.dispose();
  }
};

ChatEditingEditorOverlay = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], ChatEditingEditorOverlay);
export { ChatEditingAcceptRejectActionViewItem, ChatEditorOverlayWidget, ChatEditingOverlayController, ChatEditingEditorOverlay };
