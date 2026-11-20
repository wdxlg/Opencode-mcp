// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadWebviewPanels.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtensionKeyedWebviewOriginStore } from "./module-1042.mjs";
import { ExtHostContext } from "./module-0921.mjs";
import { Event2 } from "./module-0017.mjs";
import { reviveWebviewContentOptions, reviveWebviewExtension } from "./module-1040.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0933.mjs";
import { generateUuid } from "./module-0190.mjs";
import { editorGroupToColumn } from "./module-1078.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { WebviewInput } from "./module-1116.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWebviewWorkbenchService } from "./module-1120.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/api/browser/mainThreadWebviewPanels.ts
var WebviewInputStore = class {
  constructor() {
    this._handlesToInputs = /* @__PURE__ */ new Map();
    this._inputsToHandles = /* @__PURE__ */ new Map();
  }
  add(handle2, input) {
    this._handlesToInputs.set(handle2, input);
    this._inputsToHandles.set(input, handle2);
  }
  getHandleForInput(input) {
    return this._inputsToHandles.get(input);
  }
  getInputForHandle(handle2) {
    return this._handlesToInputs.get(handle2);
  }
  delete(handle2) {
    const input = this.getInputForHandle(handle2);
    this._handlesToInputs.delete(handle2);
    if (input) {
      this._inputsToHandles.delete(input);
    }
  }
  get size() {
    return this._handlesToInputs.size;
  }
  [Symbol.iterator]() {
    return this._handlesToInputs.values();
  }
};

var WebviewViewTypeTransformer = class {
  constructor(prefix) {
    this.prefix = prefix;
  }
  fromExternal(viewType) {
    return this.prefix + viewType;
  }
  toExternal(viewType) {
    return viewType.startsWith(this.prefix) ? viewType.substr(this.prefix.length) : void 0;
  }
};

var MainThreadWebviewPanels = class extends Disposable {
  constructor(context2, _mainThreadWebviews, _configurationService, _editorGroupService, _editorService, extensionService, storageService, _webviewWorkbenchService) {
    super();
    this._mainThreadWebviews = _mainThreadWebviews;
    this._configurationService = _configurationService;
    this._editorGroupService = _editorGroupService;
    this._editorService = _editorService;
    this._webviewWorkbenchService = _webviewWorkbenchService;
    this.webviewPanelViewType = new WebviewViewTypeTransformer("mainThreadWebview-");
    this._webviewInputs = new WebviewInputStore();
    this._revivers = this._register(new DisposableMap());
    this.webviewOriginStore = new ExtensionKeyedWebviewOriginStore("mainThreadWebviewPanel.origins", storageService);
    this._proxy = context2.getProxy(ExtHostContext.ExtHostWebviewPanels);
    this._register(Event2.any(
      _editorService.onDidActiveEditorChange,
      _editorService.onDidVisibleEditorsChange,
      _editorGroupService.onDidAddGroup,
      _editorGroupService.onDidRemoveGroup,
      _editorGroupService.onDidMoveGroup
    )(() => {
      this.updateWebviewViewStates(this._editorService.activeEditor);
    }));
    this._register(_webviewWorkbenchService.onDidChangeActiveWebviewEditor((input) => {
      this.updateWebviewViewStates(input);
    }));
    this._register(_webviewWorkbenchService.registerResolver({
      canResolve: (webview) => {
        const viewType = this.webviewPanelViewType.toExternal(webview.viewType);
        if (typeof viewType === "string") {
          extensionService.activateByEvent(`onWebviewPanel:${viewType}`);
        }
        return false;
      },
      resolveWebview: () => {
        throw new Error("not implemented");
      }
    }));
  }
  get webviewInputs() {
    return this._webviewInputs;
  }
  addWebviewInput(handle2, input, options3) {
    this._webviewInputs.add(handle2, input);
    this._mainThreadWebviews.addWebview(handle2, input.webview, options3);
    const disposeSub = input.webview.onDidDispose(() => {
      disposeSub.dispose();
      this._proxy.$onDidDisposeWebviewPanel(handle2).finally(() => {
        this._webviewInputs.delete(handle2);
      });
    });
  }
  $createWebviewPanel(extensionData, handle2, viewType, initData, showOptions) {
    // OpenCode: 自家设置窗口以模态窗口显示（叠在当前界面上，不切换编辑器页面）
    const targetGroup = /^opencode\.(tools|commands|attachContext|providers|skills|plugins)$/.test(viewType) ? -4 /* MODAL_GROUP */ : this.getTargetGroupFromShowOptions(showOptions);
    const mainThreadShowOptions = showOptions ? {
      preserveFocus: !!showOptions.preserveFocus,
      group: targetGroup
    } : {};
    const extension = reviveWebviewExtension(extensionData);
    const origin = this.webviewOriginStore.getOrigin(viewType, extension.id);
    const webview = this._webviewWorkbenchService.openWebview({
      origin,
      providedViewType: viewType,
      title: initData.title,
      options: reviveWebviewOptions(initData.panelOptions),
      contentOptions: reviveWebviewContentOptions(initData.webviewOptions),
      extension
    }, this.webviewPanelViewType.fromExternal(viewType), initData.title, void 0, mainThreadShowOptions);
    // OpenCode ctxframe1825: 「添加上下文」窗口内容很紧凑，模态框按内容大小（680x560）居中显示，最大化/弹出不受影响
    if (viewType === "opencode.attachContext" && webview && typeof webview.getModalEditorOptions !== "function") {
      webview.getModalEditorOptions = () => ({ preferredSize: { width: 680, height: 560 } });
    }
    this.addWebviewInput(handle2, webview, { serializeBuffersForPostMessage: initData.serializeBuffersForPostMessage });
  }
  $disposeWebview(handle2) {
    const webview = this.tryGetWebviewInput(handle2);
    if (!webview) {
      return;
    }
    webview.dispose();
  }
  $setTitle(handle2, value2) {
    this.tryGetWebviewInput(handle2)?.setWebviewTitle(value2);
  }
  $setIconPath(handle2, value2) {
    const webview = this.tryGetWebviewInput(handle2);
    if (webview) {
      webview.iconPath = reviveWebviewIcon(value2);
    }
  }
  $reveal(handle2, showOptions) {
    const webview = this.tryGetWebviewInput(handle2);
    if (!webview || webview.isDisposed()) {
      return;
    }
    const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
    this._webviewWorkbenchService.revealWebview(webview, targetGroup, !!showOptions.preserveFocus);
  }
  getTargetGroupFromShowOptions(showOptions) {
    if (typeof showOptions.viewColumn === "undefined" || showOptions.viewColumn === ACTIVE_GROUP || this._editorGroupService.count === 1 && this._editorGroupService.activeGroup.isEmpty) {
      return ACTIVE_GROUP;
    }
    if (showOptions.viewColumn === SIDE_GROUP) {
      return SIDE_GROUP;
    }
    if (showOptions.viewColumn >= 0) {
      const groupInColumn = this._editorGroupService.getGroups(2 /* GRID_APPEARANCE */)[showOptions.viewColumn];
      if (groupInColumn) {
        return groupInColumn.id;
      }
      const newGroup = this._editorGroupService.findGroup({ location: 1 /* LAST */ });
      if (newGroup) {
        const direction = preferredSideBySideGroupDirection(this._configurationService);
        return this._editorGroupService.addGroup(newGroup, direction);
      }
    }
    return ACTIVE_GROUP;
  }
  $registerSerializer(viewType, options3) {
    if (this._revivers.has(viewType)) {
      throw new Error(`Reviver for ${viewType} already registered`);
    }
    this._revivers.set(viewType, this._webviewWorkbenchService.registerResolver({
      canResolve: (webviewInput) => {
        return webviewInput.viewType === this.webviewPanelViewType.fromExternal(viewType);
      },
      resolveWebview: async (webviewInput) => {
        const viewType2 = this.webviewPanelViewType.toExternal(webviewInput.viewType);
        if (!viewType2) {
          webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(webviewInput.viewType));
          return;
        }
        const handle2 = generateUuid();
        this.addWebviewInput(handle2, webviewInput, options3);
        let state = void 0;
        if (webviewInput.webview.state) {
          try {
            state = JSON.parse(webviewInput.webview.state);
          } catch (e) {
            console.error("Could not load webview state", e, webviewInput.webview.state);
          }
        }
        try {
          await this._proxy.$deserializeWebviewPanel(handle2, viewType2, {
            title: webviewInput.getTitle(),
            state,
            panelOptions: webviewInput.webview.options,
            webviewOptions: webviewInput.webview.contentOptions,
            active: webviewInput === this._editorService.activeEditor
          }, editorGroupToColumn(this._editorGroupService, webviewInput.group || 0));
        } catch (error) {
          onUnexpectedError(error);
          webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(viewType2));
        }
      }
    }));
  }
  $unregisterSerializer(viewType) {
    if (!this._revivers.has(viewType)) {
      throw new Error(`No reviver for ${viewType} registered`);
    }
    this._revivers.deleteAndDispose(viewType);
  }
  updateWebviewViewStates(activeEditorInput) {
    if (!this._webviewInputs.size) {
      return;
    }
    const viewStates = {};
    const updateViewStatesForInput = (group2, topLevelInput, editorInput) => {
      if (!(editorInput instanceof WebviewInput)) {
        return;
      }
      editorInput.updateGroup(group2.id);
      const handle2 = this._webviewInputs.getHandleForInput(editorInput);
      if (handle2) {
        viewStates[handle2] = {
          visible: topLevelInput === group2.activeEditor,
          active: editorInput === activeEditorInput,
          position: editorGroupToColumn(this._editorGroupService, group2.id)
        };
      }
    };
    for (const group2 of this._editorGroupService.groups) {
      for (const input of group2.editors) {
        if (input instanceof DiffEditorInput) {
          updateViewStatesForInput(group2, input, input.primary);
          updateViewStatesForInput(group2, input, input.secondary);
        } else {
          updateViewStatesForInput(group2, input, input);
        }
      }
    }
    if (Object.keys(viewStates).length) {
      this._proxy.$onDidChangeWebviewPanelViewStates(viewStates);
    }
  }
  tryGetWebviewInput(handle2) {
    return this._webviewInputs.getInputForHandle(handle2);
  }
};

MainThreadWebviewPanels = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWebviewWorkbenchService)
], MainThreadWebviewPanels);

function reviveWebviewIcon(value2) {
  if (!value2) {
    return void 0;
  }
  if (ThemeIcon.isThemeIcon(value2)) {
    return value2;
  }
  return {
    light: URI.revive(value2.light),
    dark: URI.revive(value2.dark)
  };
}

function reviveWebviewOptions(panelOptions) {
  return {
    enableFindWidget: panelOptions.enableFindWidget,
    retainContextWhenHidden: panelOptions.retainContextWhenHidden
  };
}
export { reviveWebviewIcon, reviveWebviewOptions, WebviewInputStore, WebviewViewTypeTransformer, MainThreadWebviewPanels };
