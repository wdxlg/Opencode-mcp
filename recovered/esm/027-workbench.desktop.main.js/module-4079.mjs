// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/tools/browserTools.contribution.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { OpenBrowserToolNonAgentic, OpenBrowserToolNonAgenticData } from "./module-4073.mjs";
import { OpenBrowserTool, OpenBrowserToolData } from "./module-4066.mjs";
import { ReadBrowserTool, ReadBrowserToolData } from "./module-4074.mjs";
import { ScreenshotBrowserTool, ScreenshotBrowserToolData } from "./module-4077.mjs";
import { NavigateBrowserTool, NavigateBrowserToolData } from "./module-4072.mjs";
import { ClickBrowserTool, ClickBrowserToolData } from "./module-4067.mjs";
import { DragElementTool, DragElementToolData } from "./module-4068.mjs";
import { HoverElementTool, HoverElementToolData } from "./module-4070.mjs";
import { TypeBrowserTool, TypeBrowserToolData } from "./module-4078.mjs";
import { RunPlaywrightCodeTool, RunPlaywrightCodeToolData } from "./module-4075.mjs";
import { HandleDialogBrowserTool, HandleDialogBrowserToolData } from "./module-4069.mjs";
import { ListBrowserPagesTool, ListBrowserPagesToolData } from "./module-4071.mjs";
import { getBrowserPagesContext } from "./module-4065.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatContextService } from "./module-1454.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IAgentNetworkFilterService } from "./module-1241.mjs";
import { IChatService } from "./module-0972.mjs";
import { IPlaywrightService } from "./module-3939.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/tools/browserTools.contribution.ts
var BrowserChatAgentToolsContribution = class extends Disposable {
  constructor(instantiationService, toolsService, chatContextService, editorService, browserViewService, agentNetworkFilterService, chatService, playwrightService) {
    super();
    this.instantiationService = instantiationService;
    this.toolsService = toolsService;
    this.chatContextService = chatContextService;
    this.editorService = editorService;
    this.browserViewService = browserViewService;
    this.agentNetworkFilterService = agentNetworkFilterService;
    this.chatService = chatService;
    this.playwrightService = playwrightService;
    this._toolsStore = this._register(new DisposableStore());
    this._modelListeners = this._register(new DisposableMap());
    this._browserToolSet = this._register(this.toolsService.createToolSet(
      ToolDataSource.Internal,
      "browser",
      "browser",
      {
        icon: Codicon.globe,
        description: localize(8223, null),
        deprecated: true
      }
    ));
    this._updateToolRegistrations();
    this._register(this.browserViewService.onDidChangeSharingAvailable(() => {
      this._updateToolRegistrations();
    }));
    this._register(this.chatService.onDidDisposeSession((e) => {
      for (const resource of e.sessionResources) {
        void this.playwrightService.disposeSession(resource.toString()).catch(() => {
        });
      }
    }));
  }
  static {
    this.ID = "browserView.chatAgentTools";
  }
  static {
    this.CONTEXT_ID = "browserView.trackedPages";
  }
  _updateToolRegistrations() {
    this._toolsStore.clear();
    this._modelListeners.clearAndDisposeAll();
    if (!this.browserViewService.isSharingAvailable) {
      this._toolsStore.add(this.toolsService.registerTool(OpenBrowserToolNonAgenticData, this.instantiationService.createInstance(OpenBrowserToolNonAgentic)));
      this._toolsStore.add(this._browserToolSet.addTool(OpenBrowserToolNonAgenticData));
      this.chatContextService.updateWorkspaceContextItems(BrowserChatAgentToolsContribution.CONTEXT_ID, []);
      return;
    }
    this._toolsStore.add(this.toolsService.registerTool(OpenBrowserToolData, this.instantiationService.createInstance(OpenBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ReadBrowserToolData, this.instantiationService.createInstance(ReadBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ScreenshotBrowserToolData, this.instantiationService.createInstance(ScreenshotBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(NavigateBrowserToolData, this.instantiationService.createInstance(NavigateBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ClickBrowserToolData, this.instantiationService.createInstance(ClickBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(DragElementToolData, this.instantiationService.createInstance(DragElementTool)));
    this._toolsStore.add(this.toolsService.registerTool(HoverElementToolData, this.instantiationService.createInstance(HoverElementTool)));
    this._toolsStore.add(this.toolsService.registerTool(TypeBrowserToolData, this.instantiationService.createInstance(TypeBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(RunPlaywrightCodeToolData, this.instantiationService.createInstance(RunPlaywrightCodeTool)));
    this._toolsStore.add(this.toolsService.registerTool(HandleDialogBrowserToolData, this.instantiationService.createInstance(HandleDialogBrowserTool)));
    this._toolsStore.add(this.toolsService.registerTool(ListBrowserPagesToolData, this.instantiationService.createInstance(ListBrowserPagesTool)));
    this._toolsStore.add(this._browserToolSet.addTool(OpenBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(ReadBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(ScreenshotBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(NavigateBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(ClickBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(DragElementToolData));
    this._toolsStore.add(this._browserToolSet.addTool(HoverElementToolData));
    this._toolsStore.add(this._browserToolSet.addTool(TypeBrowserToolData));
    this._toolsStore.add(this._browserToolSet.addTool(RunPlaywrightCodeToolData));
    this._toolsStore.add(this._browserToolSet.addTool(HandleDialogBrowserToolData));
    this._syncModelListeners();
    this._toolsStore.add(this.browserViewService.onDidChangeBrowserViews(() => {
      this._syncModelListeners();
      this._updateBrowserContext();
    }));
    this._toolsStore.add(this.editorService.onDidActiveEditorChange(() => this._updateBrowserContext()));
    this._toolsStore.add(this.editorService.onDidVisibleEditorsChange(() => this._updateBrowserContext()));
    this._toolsStore.add(this.agentNetworkFilterService.onDidChange(() => this._updateBrowserContext()));
    this._updateBrowserContext();
  }
  /**
   * Subscribe to sharingState changes on each known model so the workspace
   * context updates whenever a page is shared or unshared.
   */
  _syncModelListeners() {
    const views = this.browserViewService.getContextualBrowserViews();
    for (const id2 of this._modelListeners.keys()) {
      if (!views.has(id2)) {
        this._modelListeners.deleteAndDispose(id2);
      }
    }
    for (const [id2, input] of views) {
      if (!this._modelListeners.has(id2) && input.model) {
        const store = new DisposableStore();
        store.add(input.onDidChangeLabel(() => this._updateBrowserContext()));
        store.add(input.model.onDidChangeSharingState(() => this._updateBrowserContext()));
        this._modelListeners.set(id2, store);
      }
    }
  }
  _updateBrowserContext() {
    const value2 = getBrowserPagesContext(this.editorService, this.browserViewService, this.agentNetworkFilterService, { canPromptUser: true });
    if (!value2) {
      this.chatContextService.updateWorkspaceContextItems(BrowserChatAgentToolsContribution.CONTEXT_ID, []);
      return;
    }
    this.chatContextService.updateWorkspaceContextItems(BrowserChatAgentToolsContribution.CONTEXT_ID, [{
      handle: 0,
      label: localize(8222, null),
      value: value2
    }]);
  }
};

BrowserChatAgentToolsContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IChatContextService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IBrowserViewWorkbenchService),
  __decorateParam(5, IAgentNetworkFilterService),
  __decorateParam(6, IChatService),
  __decorateParam(7, IPlaywrightService)
], BrowserChatAgentToolsContribution);

registerWorkbenchContribution2(BrowserChatAgentToolsContribution.ID, BrowserChatAgentToolsContribution, WorkbenchPhase.AfterRestored);
export { BrowserChatAgentToolsContribution };
