// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadEditorTabs.ts
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { MergeEditorInput } from "./module-1144.mjs";
import { AbstractTextResourceEditorInput } from "./module-1104.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { NotebookEditorInput } from "./module-0939.mjs";
import { CustomEditorInput } from "./module-1126.mjs";
import { WebviewInput } from "./module-1116.mjs";
import { TerminalEditorInput } from "./module-1177.mjs";
import { InteractiveEditorInput } from "./module-1129.mjs";
import { ChatEditorInput } from "./module-1111.mjs";
import { MultiDiffEditorInput } from "./module-1148.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { URI } from "./module-0032.mjs";
import { Event2 } from "./module-0017.mjs";
import { columnToEditorGroup, editorGroupToColumn } from "./module-1078.mjs";
import { isGroupEditorMoveEvent } from "./module-1102.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0933.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/api/browser/mainThreadEditorTabs.ts
var MainThreadEditorTabs = class {
  constructor(extHostContext, _editorGroupsService, _configurationService, _logService, editorService) {
    this._editorGroupsService = _editorGroupsService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._dispoables = new DisposableStore();
    // List of all groups and their corresponding tabs, this is **the** model
    this._tabGroupModel = [];
    // Lookup table for finding group by id
    this._groupLookup = /* @__PURE__ */ new Map();
    // Lookup table for finding tab by id
    this._tabInfoLookup = /* @__PURE__ */ new Map();
    // Tracks the currently open MultiDiffEditorInputs to listen to resource changes
    this._multiDiffEditorInputListeners = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostEditorTabs);
    this._dispoables.add(editorService.onDidEditorsChange((event) => {
      try {
        this._updateTabsModel(event);
      } catch {
        this._logService.error("Failed to update model, rebuilding");
        this._createTabsModel();
      }
    }));
    this._dispoables.add(this._multiDiffEditorInputListeners);
    this._dispoables.add(this._editorGroupsService.onDidAddGroup(() => this._createTabsModel()));
    this._dispoables.add(this._editorGroupsService.onDidRemoveGroup(() => this._createTabsModel()));
    this._editorGroupsService.whenReady.then(() => this._createTabsModel());
  }
  dispose() {
    this._groupLookup.clear();
    this._tabInfoLookup.clear();
    this._dispoables.dispose();
  }
  /**
   * Creates a tab object with the correct properties
   * @param editor The editor input represented by the tab
   * @param group The group the tab is in
   * @returns A tab object
   */
  _buildTabObject(group2, editor, editorIndex) {
    const editorId = editor.editorId;
    const tab = {
      id: this._generateTabId(editor, group2.id),
      label: editor.getName(),
      editorId,
      input: this._editorInputToDto(editor),
      isPinned: group2.isSticky(editorIndex),
      isPreview: !group2.isPinned(editorIndex),
      isActive: group2.isActive(editor),
      isDirty: editor.isDirty()
    };
    return tab;
  }
  _editorInputToDto(editor) {
    if (editor instanceof MergeEditorInput) {
      return {
        kind: 3 /* TextMergeInput */,
        base: editor.base,
        input1: editor.input1.uri,
        input2: editor.input2.uri,
        result: editor.resource
      };
    }
    if (editor instanceof AbstractTextResourceEditorInput) {
      return {
        kind: 1 /* TextInput */,
        uri: editor.resource
      };
    }
    if (editor instanceof SideBySideEditorInput && !(editor instanceof DiffEditorInput)) {
      const primaryResource = editor.primary.resource;
      const secondaryResource = editor.secondary.resource;
      if (editor.primary instanceof AbstractTextResourceEditorInput && editor.secondary instanceof AbstractTextResourceEditorInput && isEqual2(primaryResource, secondaryResource) && primaryResource && secondaryResource) {
        return {
          kind: 1 /* TextInput */,
          uri: primaryResource
        };
      }
      return { kind: 0 /* UnknownInput */ };
    }
    if (editor instanceof NotebookEditorInput) {
      return {
        kind: 4 /* NotebookInput */,
        notebookType: editor.viewType,
        uri: editor.resource
      };
    }
    if (editor instanceof CustomEditorInput) {
      return {
        kind: 6 /* CustomEditorInput */,
        viewType: editor.viewType,
        uri: editor.resource
      };
    }
    if (editor instanceof WebviewInput) {
      return {
        kind: 7 /* WebviewEditorInput */,
        viewType: editor.viewType
      };
    }
    if (editor instanceof TerminalEditorInput) {
      return {
        kind: 8 /* TerminalEditorInput */
      };
    }
    if (editor instanceof DiffEditorInput) {
      if (editor.modified instanceof AbstractTextResourceEditorInput && editor.original instanceof AbstractTextResourceEditorInput) {
        return {
          kind: 2 /* TextDiffInput */,
          modified: editor.modified.resource,
          original: editor.original.resource
        };
      }
      if (editor.modified instanceof NotebookEditorInput && editor.original instanceof NotebookEditorInput) {
        return {
          kind: 5 /* NotebookDiffInput */,
          notebookType: editor.original.viewType,
          modified: editor.modified.resource,
          original: editor.original.resource
        };
      }
    }
    if (editor instanceof InteractiveEditorInput) {
      return {
        kind: 9 /* InteractiveEditorInput */,
        uri: editor.resource,
        inputBoxUri: editor.inputResource
      };
    }
    if (editor instanceof ChatEditorInput) {
      return {
        kind: 10 /* ChatEditorInput */
      };
    }
    if (editor instanceof MultiDiffEditorInput) {
      const diffEditors = [];
      for (const resource of editor?.resources.get() ?? []) {
        if (resource.originalUri && resource.modifiedUri) {
          diffEditors.push({
            kind: 2 /* TextDiffInput */,
            original: resource.originalUri,
            modified: resource.modifiedUri
          });
        }
      }
      return {
        kind: 11 /* MultiDiffEditorInput */,
        diffEditors
      };
    }
    return { kind: 0 /* UnknownInput */ };
  }
  /**
   * Generates a unique id for a tab
   * @param editor The editor input
   * @param groupId The group id
   * @returns A unique identifier for a specific tab
   */
  _generateTabId(editor, groupId) {
    let resourceString;
    const resource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 3 /* BOTH */ });
    if (resource instanceof URI) {
      resourceString = resource.toString();
    } else {
      resourceString = `${resource?.primary?.toString()}-${resource?.secondary?.toString()}`;
    }
    return `${groupId}~${editor.editorId}-${editor.typeId}-${resourceString} `;
  }
  /**
   * Called whenever a group activates, updates the model by marking the group as active an notifies the extension host
   */
  _onDidGroupActivate() {
    const activeGroupId = this._editorGroupsService.activeGroup.id;
    const activeGroup = this._groupLookup.get(activeGroupId);
    if (activeGroup) {
      activeGroup.isActive = true;
      this._proxy.$acceptTabGroupUpdate(activeGroup);
    }
  }
  /**
   * Called when the tab label changes
   * @param groupId The id of the group the tab exists in
   * @param editorInput The editor input represented by the tab
   */
  _onDidTabLabelChange(groupId, editorInput, editorIndex) {
    const tabId = this._generateTabId(editorInput, groupId);
    const tabInfo = this._tabInfoLookup.get(tabId);
    if (tabInfo) {
      tabInfo.tab.label = editorInput.getName();
      this._proxy.$acceptTabOperation({
        groupId,
        index: editorIndex,
        tabDto: tabInfo.tab,
        kind: 2 /* TAB_UPDATE */
      });
    } else {
      if (this._editorGroupsService.activeModalEditorPart?.groups.some((group2) => group2.id === groupId)) {
        return;
      }
      this._logService.error("Invalid model for label change, rebuilding");
      this._createTabsModel();
    }
  }
  /**
   * Called when a new tab is opened
   * @param groupId The id of the group the tab is being created in
   * @param editorInput The editor input being opened
   * @param editorIndex The index of the editor within that group
   */
  _onDidTabOpen(groupId, editorInput, editorIndex) {
    const group2 = this._editorGroupsService.getGroup(groupId);
    const groupInModel = this._groupLookup.get(groupId) !== void 0;
    if (!group2 || !groupInModel) {
      this._createTabsModel();
      return;
    }
    const tabs = this._groupLookup.get(groupId)?.tabs;
    if (!tabs) {
      return;
    }
    const tabObject = this._buildTabObject(group2, editorInput, editorIndex);
    tabs.splice(editorIndex, 0, tabObject);
    const tabId = this._generateTabId(editorInput, groupId);
    this._tabInfoLookup.set(tabId, { group: group2, editorInput, tab: tabObject });
    if (editorInput instanceof MultiDiffEditorInput) {
      this._multiDiffEditorInputListeners.set(editorInput, Event2.fromObservableLight(editorInput.resources)(() => {
        const tabInfo = this._tabInfoLookup.get(tabId);
        if (!tabInfo) {
          return;
        }
        Object.assign(tabInfo.tab, this._buildTabObject(group2, editorInput, editorIndex));
        this._proxy.$acceptTabOperation({
          groupId,
          index: editorIndex,
          tabDto: tabInfo.tab,
          kind: 2 /* TAB_UPDATE */
        });
      }));
    }
    this._proxy.$acceptTabOperation({
      groupId,
      index: editorIndex,
      tabDto: tabObject,
      kind: 0 /* TAB_OPEN */
    });
  }
  /**
   * Called when a tab is closed
   * @param groupId The id of the group the tab is being removed from
   * @param editorIndex The index of the editor within that group
   */
  _onDidTabClose(groupId, editorIndex) {
    const group2 = this._editorGroupsService.getGroup(groupId);
    const tabs = this._groupLookup.get(groupId)?.tabs;
    if (!group2 || !tabs) {
      this._createTabsModel();
      return;
    }
    const removedTab = tabs.splice(editorIndex, 1);
    if (removedTab.length === 0) {
      return;
    }
    this._tabInfoLookup.delete(removedTab[0]?.id ?? "");
    if (removedTab[0]?.input instanceof MultiDiffEditorInput) {
      this._multiDiffEditorInputListeners.deleteAndDispose(removedTab[0]?.input);
    }
    this._proxy.$acceptTabOperation({
      groupId,
      index: editorIndex,
      tabDto: removedTab[0],
      kind: 1 /* TAB_CLOSE */
    });
  }
  /**
   * Called when the active tab changes
   * @param groupId The id of the group the tab is contained in
   * @param editorIndex The index of the tab
   */
  _onDidTabActiveChange(groupId, editorIndex) {
    const tabs = this._groupLookup.get(groupId)?.tabs;
    if (!tabs) {
      return;
    }
    const activeTab = tabs[editorIndex];
    activeTab.isActive = true;
    for (const tab of tabs) {
      if (tab !== activeTab) {
        tab.isActive = false;
      }
    }
    this._proxy.$acceptTabOperation({
      groupId,
      index: editorIndex,
      tabDto: activeTab,
      kind: 2 /* TAB_UPDATE */
    });
  }
  /**
   * Called when the dirty indicator on the tab changes
   * @param groupId The id of the group the tab is in
   * @param editorIndex The index of the tab
   * @param editor The editor input represented by the tab
   */
  _onDidTabDirty(groupId, editorIndex, editor) {
    const tabId = this._generateTabId(editor, groupId);
    const tabInfo = this._tabInfoLookup.get(tabId);
    if (!tabInfo) {
      this._logService.error("Invalid model for dirty change, rebuilding");
      this._createTabsModel();
      return;
    }
    tabInfo.tab.isDirty = editor.isDirty();
    this._proxy.$acceptTabOperation({
      groupId,
      index: editorIndex,
      tabDto: tabInfo.tab,
      kind: 2 /* TAB_UPDATE */
    });
  }
  /**
   * Called when the tab is pinned/unpinned
   * @param groupId The id of the group the tab is in
   * @param editorIndex The index of the tab
   * @param editor The editor input represented by the tab
   */
  _onDidTabPinChange(groupId, editorIndex, editor) {
    const tabId = this._generateTabId(editor, groupId);
    const tabInfo = this._tabInfoLookup.get(tabId);
    const group2 = tabInfo?.group;
    const tab = tabInfo?.tab;
    if (!group2 || !tab) {
      this._logService.error("Invalid model for sticky change, rebuilding");
      this._createTabsModel();
      return;
    }
    tab.isPinned = group2.isSticky(editorIndex);
    this._proxy.$acceptTabOperation({
      groupId,
      index: editorIndex,
      tabDto: tab,
      kind: 2 /* TAB_UPDATE */
    });
  }
  /**
  * Called when the tab is preview / unpreviewed
  * @param groupId The id of the group the tab is in
  * @param editorIndex The index of the tab
  * @param editor The editor input represented by the tab
  */
  _onDidTabPreviewChange(groupId, editorIndex, editor) {
    const tabId = this._generateTabId(editor, groupId);
    const tabInfo = this._tabInfoLookup.get(tabId);
    const group2 = tabInfo?.group;
    const tab = tabInfo?.tab;
    if (!group2 || !tab) {
      this._logService.error("Invalid model for sticky change, rebuilding");
      this._createTabsModel();
      return;
    }
    tab.isPreview = !group2.isPinned(editorIndex);
    this._proxy.$acceptTabOperation({
      kind: 2 /* TAB_UPDATE */,
      groupId,
      tabDto: tab,
      index: editorIndex
    });
  }
  _onDidTabMove(groupId, editorIndex, oldEditorIndex, editor) {
    const tabs = this._groupLookup.get(groupId)?.tabs;
    if (!tabs) {
      this._logService.error("Invalid model for move change, rebuilding");
      this._createTabsModel();
      return;
    }
    const removedTab = tabs.splice(oldEditorIndex, 1);
    if (removedTab.length === 0) {
      return;
    }
    tabs.splice(editorIndex, 0, removedTab[0]);
    this._proxy.$acceptTabOperation({
      kind: 3 /* TAB_MOVE */,
      groupId,
      tabDto: removedTab[0],
      index: editorIndex,
      oldIndex: oldEditorIndex
    });
  }
  /**
   * Builds the model from scratch based on the current state of the editor service.
   */
  _createTabsModel() {
    if (this._editorGroupsService.groups.length === 0) {
      return;
    }
    this._tabGroupModel = [];
    this._groupLookup.clear();
    this._tabInfoLookup.clear();
    let tabs = [];
    for (const group2 of this._editorGroupsService.groups) {
      const currentTabGroupModel = {
        groupId: group2.id,
        isActive: group2.id === this._editorGroupsService.activeGroup.id,
        viewColumn: editorGroupToColumn(this._editorGroupsService, group2),
        tabs: []
      };
      group2.editors.forEach((editor, editorIndex) => {
        const tab = this._buildTabObject(group2, editor, editorIndex);
        tabs.push(tab);
        this._tabInfoLookup.set(this._generateTabId(editor, group2.id), {
          group: group2,
          tab,
          editorInput: editor
        });
      });
      currentTabGroupModel.tabs = tabs;
      this._tabGroupModel.push(currentTabGroupModel);
      this._groupLookup.set(group2.id, currentTabGroupModel);
      tabs = [];
    }
    this._proxy.$acceptEditorTabModel(this._tabGroupModel);
  }
  /**
   * The main handler for the tab events
   * @param events The list of events to process
   */
  _updateTabsModel(changeEvent) {
    const event = changeEvent.event;
    const groupId = changeEvent.groupId;
    switch (event.kind) {
      case 0 /* GROUP_ACTIVE */:
        if (groupId === this._editorGroupsService.activeGroup.id) {
          this._onDidGroupActivate();
          break;
        } else {
          return;
        }
      case 9 /* EDITOR_LABEL */:
        if (event.editor !== void 0 && event.editorIndex !== void 0) {
          this._onDidTabLabelChange(groupId, event.editor, event.editorIndex);
          break;
        }
      case 5 /* EDITOR_OPEN */:
        if (event.editor !== void 0 && event.editorIndex !== void 0) {
          this._onDidTabOpen(groupId, event.editor, event.editorIndex);
          break;
        }
      case 6 /* EDITOR_CLOSE */:
        if (event.editorIndex !== void 0) {
          this._onDidTabClose(groupId, event.editorIndex);
          break;
        }
      case 8 /* EDITOR_ACTIVE */:
        if (event.editorIndex !== void 0) {
          this._onDidTabActiveChange(groupId, event.editorIndex);
          break;
        }
      case 14 /* EDITOR_DIRTY */:
        if (event.editorIndex !== void 0 && event.editor !== void 0) {
          this._onDidTabDirty(groupId, event.editorIndex, event.editor);
          break;
        }
      case 13 /* EDITOR_STICKY */:
        if (event.editorIndex !== void 0 && event.editor !== void 0) {
          this._onDidTabPinChange(groupId, event.editorIndex, event.editor);
          break;
        }
      case 11 /* EDITOR_PIN */:
        if (event.editorIndex !== void 0 && event.editor !== void 0) {
          this._onDidTabPreviewChange(groupId, event.editorIndex, event.editor);
          break;
        }
      case 12 /* EDITOR_TRANSIENT */:
        break;
      case 4 /* EDITORS_SELECTION */:
        break;
      case 7 /* EDITOR_MOVE */:
        if (isGroupEditorMoveEvent(event) && event.editor && event.editorIndex !== void 0 && event.oldEditorIndex !== void 0) {
          this._onDidTabMove(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
          break;
        }
      default:
        this._createTabsModel();
    }
  }
  //#region Messages received from Ext Host
  $moveTab(tabId, index2, viewColumn, preserveFocus) {
    const groupId = columnToEditorGroup(this._editorGroupsService, this._configurationService, viewColumn);
    const tabInfo = this._tabInfoLookup.get(tabId);
    const tab = tabInfo?.tab;
    if (!tab) {
      throw new Error(`Attempted to close tab with id ${tabId} which does not exist`);
    }
    let targetGroup;
    const sourceGroup = this._editorGroupsService.getGroup(tabInfo.group.id);
    if (!sourceGroup) {
      return;
    }
    if (this._groupLookup.get(groupId) === void 0) {
      let direction = 3 /* RIGHT */;
      if (viewColumn === SIDE_GROUP) {
        direction = preferredSideBySideGroupDirection(this._configurationService);
      }
      targetGroup = this._editorGroupsService.addGroup(this._editorGroupsService.groups[this._editorGroupsService.groups.length - 1], direction);
    } else {
      targetGroup = this._editorGroupsService.getGroup(groupId);
    }
    if (!targetGroup) {
      return;
    }
    if (index2 < 0 || index2 > targetGroup.editors.length) {
      index2 = targetGroup.editors.length;
    }
    const editorInput = tabInfo?.editorInput;
    if (!editorInput) {
      return;
    }
    sourceGroup.moveEditor(editorInput, targetGroup, { index: index2, preserveFocus });
    return;
  }
  async $closeTab(tabIds, preserveFocus) {
    const groups = /* @__PURE__ */ new Map();
    for (const tabId of tabIds) {
      const tabInfo = this._tabInfoLookup.get(tabId);
      const tab = tabInfo?.tab;
      const group2 = tabInfo?.group;
      const editorTab = tabInfo?.editorInput;
      if (!group2 || !tab || !tabInfo || !editorTab) {
        continue;
      }
      const groupEditors = groups.get(group2);
      if (!groupEditors) {
        groups.set(group2, [editorTab]);
      } else {
        groupEditors.push(editorTab);
      }
    }
    const results = [];
    for (const [group2, editors] of groups) {
      results.push(await group2.closeEditors(editors, { preserveFocus }));
    }
    return results.every((result) => result);
  }
  async $closeGroup(groupIds, preserveFocus) {
    const groupCloseResults = [];
    for (const groupId of groupIds) {
      const group2 = this._editorGroupsService.getGroup(groupId);
      if (group2) {
        groupCloseResults.push(await group2.closeAllEditors());
        if (group2.count === 0 && this._editorGroupsService.getGroup(group2.id)) {
          this._editorGroupsService.removeGroup(group2);
        }
      }
    }
    return groupCloseResults.every((result) => result);
  }
  //#endregion
};

MainThreadEditorTabs = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadEditorTabs),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IEditorService)
], MainThreadEditorTabs);
export { MainThreadEditorTabs };
