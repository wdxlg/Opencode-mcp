// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorsObserver.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { LinkedMap, ResourceMap } from "./module-0008.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { SideBySideEditorInput } from "./module-1096.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { coalesce } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/browser/parts/editor/editorsObserver.ts
var EditorsObserver = class extends Disposable {
  constructor(editorGroupsContainer, editorGroupService, storageService) {
    super();
    this.editorGroupService = editorGroupService;
    this.storageService = storageService;
    this.keyMap = /* @__PURE__ */ new Map();
    this.mostRecentEditorsMap = new LinkedMap();
    this.editorsPerResourceCounter = new ResourceMap();
    this._onDidMostRecentlyActiveEditorsChange = this._register(new Emitter());
    this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
    this.editorGroupsContainer = editorGroupsContainer ?? editorGroupService;
    this.isScoped = !!editorGroupsContainer;
    this.registerListeners();
    this.loadState();
  }
  static {
    this.STORAGE_KEY = "editors.mru";
  }
  get count() {
    return this.mostRecentEditorsMap.size;
  }
  get editors() {
    return [...this.mostRecentEditorsMap.values()];
  }
  hasEditor(editor) {
    const editors = this.editorsPerResourceCounter.get(editor.resource);
    return editors?.has(this.toIdentifier(editor)) ?? false;
  }
  hasEditors(resource) {
    return this.editorsPerResourceCounter.has(resource);
  }
  toIdentifier(arg1, editorId) {
    if (typeof arg1 !== "string") {
      return this.toIdentifier(arg1.typeId, arg1.editorId);
    }
    if (editorId) {
      return `${arg1}/${editorId}`;
    }
    return arg1;
  }
  registerListeners() {
    this._register(this.editorGroupsContainer.onDidAddGroup((group2) => this.onGroupAdded(group2)));
    this._register(this.editorGroupService.onDidChangeEditorPartOptions((e4) => this.onDidChangeEditorPartOptions(e4)));
    this._register(this.storageService.onWillSaveState(() => this.saveState()));
  }
  onGroupAdded(group2) {
    const groupEditorsMru = group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */);
    for (let i2 = groupEditorsMru.length - 1; i2 >= 0; i2--) {
      this.addMostRecentEditor(
        group2,
        groupEditorsMru[i2],
        false,
        true
        /* is new */
      );
    }
    if (this.editorGroupsContainer.activeGroup === group2 && group2.activeEditor) {
      this.addMostRecentEditor(
        group2,
        group2.activeEditor,
        true,
        false
        /* already added before */
      );
    }
    this.registerGroupListeners(group2);
  }
  registerGroupListeners(group2) {
    const groupDisposables = new DisposableStore();
    groupDisposables.add(group2.onDidModelChange((e4) => {
      switch (e4.kind) {
        // Group gets active: put active editor as most recent
        case 0 /* GROUP_ACTIVE */: {
          if (this.editorGroupsContainer.activeGroup === group2 && group2.activeEditor) {
            this.addMostRecentEditor(
              group2,
              group2.activeEditor,
              true,
              false
              /* editor already opened */
            );
          }
          break;
        }
        // Editor opens: put it as second most recent
        //
        // Also check for maximum allowed number of editors and
        // start to close oldest ones if needed.
        case 5 /* EDITOR_OPEN */: {
          if (e4.editor) {
            this.addMostRecentEditor(
              group2,
              e4.editor,
              false,
              true
              /* is new */
            );
            this.ensureOpenedEditorsLimit({ groupId: group2.id, editor: e4.editor }, group2.id);
          }
          break;
        }
      }
    }));
    groupDisposables.add(group2.onDidCloseEditor((e4) => {
      this.removeMostRecentEditor(group2, e4.editor);
    }));
    groupDisposables.add(group2.onDidActiveEditorChange((e4) => {
      if (e4.editor) {
        this.addMostRecentEditor(
          group2,
          e4.editor,
          this.editorGroupsContainer.activeGroup === group2,
          false
          /* editor already opened */
        );
      }
    }));
    Event2.once(group2.onWillDispose)(() => dispose(groupDisposables));
  }
  onDidChangeEditorPartOptions(event) {
    if (!equals4(event.newPartOptions.limit, event.oldPartOptions.limit)) {
      const activeGroup = this.editorGroupsContainer.activeGroup;
      let exclude = void 0;
      if (activeGroup.activeEditor) {
        exclude = { editor: activeGroup.activeEditor, groupId: activeGroup.id };
      }
      this.ensureOpenedEditorsLimit(exclude);
    }
  }
  addMostRecentEditor(group2, editor, isActive2, isNew) {
    const key3 = this.ensureKey(group2, editor);
    const mostRecentEditor = this.mostRecentEditorsMap.first;
    if (isActive2 || !mostRecentEditor) {
      this.mostRecentEditorsMap.set(key3, key3, mostRecentEditor ? 1 /* AsOld */ : void 0);
    } else {
      this.mostRecentEditorsMap.set(
        key3,
        key3,
        1 /* AsOld */
        /* make first */
      );
      this.mostRecentEditorsMap.set(
        mostRecentEditor,
        mostRecentEditor,
        1 /* AsOld */
        /* make first */
      );
    }
    if (isNew) {
      this.updateEditorResourcesMap(editor, true);
    }
    this._onDidMostRecentlyActiveEditorsChange.fire();
  }
  updateEditorResourcesMap(editor, add) {
    let resource = void 0;
    let typeId = void 0;
    let editorId = void 0;
    if (editor instanceof SideBySideEditorInput) {
      resource = editor.primary.resource;
      typeId = editor.primary.typeId;
      editorId = editor.primary.editorId;
    } else {
      resource = editor.resource;
      typeId = editor.typeId;
      editorId = editor.editorId;
    }
    if (!resource) {
      return;
    }
    const identifier2 = this.toIdentifier(typeId, editorId);
    if (add) {
      let editorsPerResource = this.editorsPerResourceCounter.get(resource);
      if (!editorsPerResource) {
        editorsPerResource = /* @__PURE__ */ new Map();
        this.editorsPerResourceCounter.set(resource, editorsPerResource);
      }
      editorsPerResource.set(identifier2, (editorsPerResource.get(identifier2) ?? 0) + 1);
    } else {
      const editorsPerResource = this.editorsPerResourceCounter.get(resource);
      if (editorsPerResource) {
        const counter = editorsPerResource.get(identifier2) ?? 0;
        if (counter > 1) {
          editorsPerResource.set(identifier2, counter - 1);
        } else {
          editorsPerResource.delete(identifier2);
          if (editorsPerResource.size === 0) {
            this.editorsPerResourceCounter.delete(resource);
          }
        }
      }
    }
  }
  removeMostRecentEditor(group2, editor) {
    this.updateEditorResourcesMap(editor, false);
    const key3 = this.findKey(group2, editor);
    if (key3) {
      this.mostRecentEditorsMap.delete(key3);
      const map = this.keyMap.get(group2.id);
      if (map?.delete(key3.editor) && map.size === 0) {
        this.keyMap.delete(group2.id);
      }
      this._onDidMostRecentlyActiveEditorsChange.fire();
    }
  }
  findKey(group2, editor) {
    const groupMap = this.keyMap.get(group2.id);
    if (!groupMap) {
      return void 0;
    }
    return groupMap.get(editor);
  }
  ensureKey(group2, editor) {
    let groupMap = this.keyMap.get(group2.id);
    if (!groupMap) {
      groupMap = /* @__PURE__ */ new Map();
      this.keyMap.set(group2.id, groupMap);
    }
    let key3 = groupMap.get(editor);
    if (!key3) {
      key3 = { groupId: group2.id, editor };
      groupMap.set(editor, key3);
    }
    return key3;
  }
  async ensureOpenedEditorsLimit(exclude, groupId) {
    if (!this.editorGroupService.partOptions.limit?.enabled || typeof this.editorGroupService.partOptions.limit.value !== "number" || this.editorGroupService.partOptions.limit.value <= 0) {
      return;
    }
    const limit = this.editorGroupService.partOptions.limit.value;
    if (this.editorGroupService.partOptions.limit?.perEditorGroup) {
      if (typeof groupId === "number") {
        const group2 = this.editorGroupsContainer.getGroup(groupId);
        if (group2) {
          await this.doEnsureOpenedEditorsLimit(limit, group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */).map((editor) => ({ editor, groupId })), exclude);
        }
      } else {
        for (const group2 of this.editorGroupsContainer.groups) {
          await this.ensureOpenedEditorsLimit(exclude, group2.id);
        }
      }
    } else {
      await this.doEnsureOpenedEditorsLimit(limit, [...this.mostRecentEditorsMap.values()], exclude);
    }
  }
  async doEnsureOpenedEditorsLimit(limit, mostRecentEditors, exclude) {
    const mostRecentEditorsCountingForLimit = mostRecentEditors.filter(({ editor }) => {
      if (editor.hasCapability(4096 /* ExcludeFromEditorLimit */)) {
        return false;
      }
      if (this.editorGroupService.partOptions.limit?.excludeDirty && (editor.isDirty() && !editor.isSaving() || editor.hasCapability(512 /* Scratchpad */))) {
        return false;
      }
      return true;
    });
    if (limit >= mostRecentEditorsCountingForLimit.length) {
      return;
    }
    const leastRecentlyClosableEditors = mostRecentEditorsCountingForLimit.reverse().filter(({ editor, groupId }) => {
      if (editor.isDirty() && !editor.isSaving() || editor.hasCapability(512 /* Scratchpad */)) {
        return false;
      }
      if (exclude && editor === exclude.editor && groupId === exclude.groupId) {
        return false;
      }
      if (this.editorGroupsContainer.getGroup(groupId)?.isSticky(editor)) {
        return false;
      }
      return true;
    });
    let editorsToCloseCount = mostRecentEditorsCountingForLimit.length - limit;
    const mapGroupToEditorsToClose = /* @__PURE__ */ new Map();
    for (const { groupId, editor } of leastRecentlyClosableEditors) {
      let editorsInGroupToClose = mapGroupToEditorsToClose.get(groupId);
      if (!editorsInGroupToClose) {
        editorsInGroupToClose = [];
        mapGroupToEditorsToClose.set(groupId, editorsInGroupToClose);
      }
      editorsInGroupToClose.push(editor);
      editorsToCloseCount--;
      if (editorsToCloseCount === 0) {
        break;
      }
    }
    for (const [groupId, editors] of mapGroupToEditorsToClose) {
      const group2 = this.editorGroupsContainer.getGroup(groupId);
      if (group2) {
        await group2.closeEditors(editors, { preserveFocus: true });
      }
    }
  }
  saveState() {
    if (this.isScoped) {
      return;
    }
    if (this.mostRecentEditorsMap.isEmpty()) {
      this.storageService.remove(EditorsObserver.STORAGE_KEY, 1 /* WORKSPACE */);
    } else {
      this.storageService.store(EditorsObserver.STORAGE_KEY, JSON.stringify(this.serialize()), 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
  }
  serialize() {
    const registry4 = Registry.as(EditorExtensions.EditorFactory);
    const entries2 = [...this.mostRecentEditorsMap.values()];
    const mapGroupToSerializableEditorsOfGroup = /* @__PURE__ */ new Map();
    return {
      entries: coalesce(entries2.map(({ editor, groupId }) => {
        const group2 = this.editorGroupsContainer.getGroup(groupId);
        if (!group2) {
          return void 0;
        }
        let serializableEditorsOfGroup = mapGroupToSerializableEditorsOfGroup.get(group2);
        if (!serializableEditorsOfGroup) {
          serializableEditorsOfGroup = group2.getEditors(1 /* SEQUENTIAL */).filter((editor2) => {
            const editorSerializer = registry4.getEditorSerializer(editor2);
            return editorSerializer?.canSerialize(editor2);
          });
          mapGroupToSerializableEditorsOfGroup.set(group2, serializableEditorsOfGroup);
        }
        const index2 = serializableEditorsOfGroup.indexOf(editor);
        if (index2 === -1) {
          return void 0;
        }
        return { groupId, index: index2 };
      }))
    };
  }
  async loadState() {
    if (this.editorGroupsContainer === this.editorGroupService.mainPart || this.editorGroupsContainer === this.editorGroupService) {
      await this.editorGroupService.whenReady;
    }
    let hasRestorableState = false;
    if (!this.isScoped) {
      const serialized = this.storageService.get(EditorsObserver.STORAGE_KEY, 1 /* WORKSPACE */);
      if (serialized) {
        hasRestorableState = true;
        this.deserialize(JSON.parse(serialized));
      }
    }
    if (!hasRestorableState) {
      const groups = this.editorGroupsContainer.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
      for (let i2 = groups.length - 1; i2 >= 0; i2--) {
        const group2 = groups[i2];
        const groupEditorsMru = group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */);
        for (let i3 = groupEditorsMru.length - 1; i3 >= 0; i3--) {
          this.addMostRecentEditor(
            group2,
            groupEditorsMru[i3],
            true,
            true
            /* is new */
          );
        }
      }
    }
    for (const group2 of this.editorGroupsContainer.groups) {
      this.registerGroupListeners(group2);
    }
  }
  deserialize(serialized) {
    const mapValues2 = [];
    for (const { groupId, index: index2 } of serialized.entries) {
      const group2 = this.editorGroupsContainer.getGroup(groupId);
      if (!group2) {
        continue;
      }
      const editor = group2.getEditorByIndex(index2);
      if (!editor) {
        continue;
      }
      const editorIdentifier = this.ensureKey(group2, editor);
      mapValues2.push([editorIdentifier, editorIdentifier]);
      this.updateEditorResourcesMap(editor, true);
    }
    this.mostRecentEditorsMap.fromJSON(mapValues2);
  }
};

EditorsObserver = __decorateClass([
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IStorageService)
], EditorsObserver);
export { EditorsObserver };
