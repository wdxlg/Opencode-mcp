// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/editorGroupModel.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { coalesce } from "./module-0007.mjs";
import { EditorInput } from "./module-0928.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/common/editor/editorGroupModel.ts
var EditorOpenPositioning = {
  LEFT: "left",
  RIGHT: "right",
  FIRST: "first",
  LAST: "last"
};

function isSerializedEditorGroupModel(group2) {
  const candidate = group2;
  return !!(candidate && typeof candidate === "object" && Array.isArray(candidate.editors) && Array.isArray(candidate.mru));
}

function isGroupEditorOpenEvent(e) {
  const candidate = e;
  return candidate.kind === 5 /* EDITOR_OPEN */ && candidate.editorIndex !== void 0;
}

function isGroupEditorMoveEvent(e) {
  const candidate = e;
  return candidate.kind === 7 /* EDITOR_MOVE */ && candidate.editorIndex !== void 0 && candidate.oldEditorIndex !== void 0;
}

function isGroupEditorCloseEvent(e) {
  const candidate = e;
  return candidate.kind === 6 /* EDITOR_CLOSE */ && candidate.editorIndex !== void 0 && candidate.context !== void 0 && candidate.sticky !== void 0;
}

var EditorGroupModel = class extends Disposable {
  constructor(labelOrSerializedGroup, instantiationService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    //#region events
    this._onDidModelChange = this._register(new Emitter({
      leakWarningThreshold: 500,
      leakWarningName: "EditorGroupModel._onDidModelChange"
      /* increased for users with hundreds of inputs opened */
    }));
    this.onDidModelChange = this._onDidModelChange.event;
    this.editors = [];
    this.mru = [];
    this.editorListeners = /* @__PURE__ */ new Set();
    this.locked = false;
    this.selection = [];
    this.preview = null;
    // editor in preview state
    this.sticky = -1;
    // index of first editor in sticky state
    this.transient = /* @__PURE__ */ new Set();
    if (isSerializedEditorGroupModel(labelOrSerializedGroup)) {
      this._id = this.deserialize(labelOrSerializedGroup);
    } else {
      this._id = EditorGroupModel.IDS++;
    }
    this.onConfigurationUpdated();
    this.registerListeners();
  }
  static {
    this.IDS = 0;
  }
  get id() {
    return this._id;
  }
  // editors in selected state, first one is active
  get active() {
    return this.selection[0] ?? null;
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationUpdated(e)));
  }
  onConfigurationUpdated(e) {
    if (e && !e.affectsConfiguration("workbench.editor.openPositioning") && !e.affectsConfiguration("workbench.editor.focusRecentEditorAfterClose")) {
      return;
    }
    this.editorOpenPositioning = this.configurationService.getValue("workbench.editor.openPositioning");
    this.focusRecentEditorAfterClose = this.configurationService.getValue("workbench.editor.focusRecentEditorAfterClose");
  }
  get count() {
    return this.editors.length;
  }
  get stickyCount() {
    return this.sticky + 1;
  }
  getEditors(order, options3) {
    const editors = order === 0 /* MOST_RECENTLY_ACTIVE */ ? this.mru.slice(0) : this.editors.slice(0);
    if (options3?.excludeSticky) {
      if (order === 0 /* MOST_RECENTLY_ACTIVE */) {
        return editors.filter((editor) => !this.isSticky(editor));
      }
      return editors.slice(this.sticky + 1);
    }
    return editors;
  }
  getEditorByIndex(index2) {
    return this.editors[index2];
  }
  get activeEditor() {
    return this.active;
  }
  isActive(candidate) {
    return this.matches(this.active, candidate);
  }
  get previewEditor() {
    return this.preview;
  }
  openEditor(candidate, options3) {
    const makeSticky = options3?.sticky || typeof options3?.index === "number" && this.isSticky(options3.index);
    const makePinned = options3?.pinned || options3?.sticky;
    const makeTransient = !!options3?.transient;
    const makeActive = options3?.active || !this.activeEditor || !makePinned && this.preview === this.activeEditor;
    const existingEditorAndIndex = this.findEditor(candidate, options3);
    if (!existingEditorAndIndex) {
      const newEditor = candidate;
      const indexOfActive = this.indexOf(this.active);
      let targetIndex;
      if (options3 && typeof options3.index === "number") {
        targetIndex = options3.index;
      } else if (this.editorOpenPositioning === EditorOpenPositioning.FIRST) {
        targetIndex = 0;
        if (!makeSticky && this.isSticky(targetIndex)) {
          targetIndex = this.sticky + 1;
        }
      } else if (this.editorOpenPositioning === EditorOpenPositioning.LAST) {
        targetIndex = this.editors.length;
      } else {
        if (this.editorOpenPositioning === EditorOpenPositioning.LEFT) {
          if (indexOfActive === 0 || !this.editors.length) {
            targetIndex = 0;
          } else {
            targetIndex = indexOfActive;
          }
        } else {
          targetIndex = indexOfActive + 1;
        }
        if (!makeSticky && this.isSticky(targetIndex)) {
          targetIndex = this.sticky + 1;
        }
      }
      if (makeSticky) {
        this.sticky++;
        if (!this.isSticky(targetIndex)) {
          targetIndex = this.sticky;
        }
      }
      if (makePinned || !this.preview) {
        this.splice(targetIndex, false, newEditor);
      }
      if (makeTransient) {
        this.doSetTransient(newEditor, targetIndex, true);
      }
      if (!makePinned) {
        if (this.preview) {
          const indexOfPreview = this.indexOf(this.preview);
          if (targetIndex > indexOfPreview) {
            targetIndex--;
          }
          this.replaceEditor(this.preview, newEditor, targetIndex, !makeActive);
        }
        this.preview = newEditor;
      }
      this.registerEditorListeners(newEditor);
      const event = {
        kind: 5 /* EDITOR_OPEN */,
        editor: newEditor,
        editorIndex: targetIndex
      };
      this._onDidModelChange.fire(event);
      this.setSelection(makeActive ? newEditor : this.activeEditor, options3?.inactiveSelection ?? []);
      return {
        editor: newEditor,
        isNew: true
      };
    } else {
      const [existingEditor, existingEditorIndex] = existingEditorAndIndex;
      this.doSetTransient(existingEditor, existingEditorIndex, makeTransient === false ? false : this.isTransient(existingEditor));
      if (makePinned) {
        this.doPin(existingEditor, existingEditorIndex);
      }
      this.setSelection(makeActive ? existingEditor : this.activeEditor, options3?.inactiveSelection ?? []);
      if (options3 && typeof options3.index === "number") {
        this.moveEditor(existingEditor, options3.index);
      }
      if (makeSticky) {
        this.doStick(existingEditor, this.indexOf(existingEditor));
      }
      return {
        editor: existingEditor,
        isNew: false
      };
    }
  }
  registerEditorListeners(editor) {
    const listeners = new DisposableStore();
    this.editorListeners.add(listeners);
    listeners.add(Event2.once(editor.onWillDispose)(() => {
      const editorIndex = this.editors.indexOf(editor);
      if (editorIndex >= 0) {
        const event = {
          kind: 15 /* EDITOR_WILL_DISPOSE */,
          editor,
          editorIndex
        };
        this._onDidModelChange.fire(event);
      }
    }));
    listeners.add(editor.onDidChangeDirty(() => {
      const event = {
        kind: 14 /* EDITOR_DIRTY */,
        editor,
        editorIndex: this.editors.indexOf(editor)
      };
      this._onDidModelChange.fire(event);
    }));
    listeners.add(editor.onDidChangeLabel(() => {
      const event = {
        kind: 9 /* EDITOR_LABEL */,
        editor,
        editorIndex: this.editors.indexOf(editor)
      };
      this._onDidModelChange.fire(event);
    }));
    listeners.add(editor.onDidChangeCapabilities(() => {
      const event = {
        kind: 10 /* EDITOR_CAPABILITIES */,
        editor,
        editorIndex: this.editors.indexOf(editor)
      };
      this._onDidModelChange.fire(event);
    }));
    listeners.add(this.onDidModelChange((event) => {
      if (event.kind === 6 /* EDITOR_CLOSE */ && event.editor?.matches(editor)) {
        dispose(listeners);
        this.editorListeners.delete(listeners);
      }
    }));
  }
  replaceEditor(toReplace, replaceWith, replaceIndex, openNext = true) {
    const closeResult = this.doCloseEditor(toReplace, 1 /* REPLACE */, openNext);
    this.splice(replaceIndex, false, replaceWith);
    if (closeResult) {
      const event = {
        kind: 6 /* EDITOR_CLOSE */,
        ...closeResult
      };
      this._onDidModelChange.fire(event);
    }
  }
  closeEditor(candidate, context2 = 0 /* UNKNOWN */, openNext = true) {
    const closeResult = this.doCloseEditor(candidate, context2, openNext);
    if (closeResult) {
      const event = {
        kind: 6 /* EDITOR_CLOSE */,
        ...closeResult
      };
      this._onDidModelChange.fire(event);
      return closeResult;
    }
    return void 0;
  }
  doCloseEditor(candidate, context2, openNext) {
    const index2 = this.indexOf(candidate);
    if (index2 === -1) {
      return void 0;
    }
    const editor = this.editors[index2];
    const sticky = this.isSticky(index2);
    const isActiveEditor = this.active === editor;
    if (openNext && isActiveEditor) {
      if (this.mru.length > 1) {
        let newActive;
        if (this.focusRecentEditorAfterClose) {
          newActive = this.mru[1];
        } else {
          if (index2 === this.editors.length - 1) {
            newActive = this.editors[index2 - 1];
          } else {
            newActive = this.editors[index2 + 1];
          }
        }
        const newInactiveSelectedEditors = this.selection.filter((selected) => selected !== editor && selected !== newActive);
        this.doSetSelection(newActive, this.editors.indexOf(newActive), newInactiveSelectedEditors);
      } else {
        this.doSetSelection(null, void 0, []);
      }
    } else if (!isActiveEditor) {
      if (this.doIsSelected(editor)) {
        const newInactiveSelectedEditors = this.selection.filter((selected) => selected !== editor && selected !== this.activeEditor);
        this.doSetSelection(this.activeEditor, this.indexOf(this.activeEditor), newInactiveSelectedEditors);
      }
    }
    if (this.preview === editor) {
      this.preview = null;
    }
    this.transient.delete(editor);
    this.splice(index2, true);
    return { editor, sticky, editorIndex: index2, context: context2 };
  }
  moveEditor(candidate, toIndex) {
    if (toIndex >= this.editors.length) {
      toIndex = this.editors.length - 1;
    } else if (toIndex < 0) {
      toIndex = 0;
    }
    const index2 = this.indexOf(candidate);
    if (index2 < 0 || toIndex === index2) {
      return;
    }
    const editor = this.editors[index2];
    const sticky = this.sticky;
    if (this.isSticky(index2) && toIndex > this.sticky) {
      this.sticky--;
    } else if (!this.isSticky(index2) && toIndex <= this.sticky) {
      this.sticky++;
    }
    this.editors.splice(index2, 1);
    this.editors.splice(toIndex, 0, editor);
    const event = {
      kind: 7 /* EDITOR_MOVE */,
      editor,
      oldEditorIndex: index2,
      editorIndex: toIndex
    };
    this._onDidModelChange.fire(event);
    if (sticky !== this.sticky) {
      const event2 = {
        kind: 13 /* EDITOR_STICKY */,
        editor,
        editorIndex: toIndex
      };
      this._onDidModelChange.fire(event2);
    }
    return editor;
  }
  setActive(candidate) {
    let result;
    if (!candidate) {
      this.setGroupActive();
    } else {
      result = this.setEditorActive(candidate);
    }
    return result;
  }
  setGroupActive() {
    this._onDidModelChange.fire({ kind: 0 /* GROUP_ACTIVE */ });
  }
  setEditorActive(candidate) {
    const res = this.findEditor(candidate);
    if (!res) {
      return;
    }
    const [editor, editorIndex] = res;
    this.doSetSelection(editor, editorIndex, []);
    return editor;
  }
  get selectedEditors() {
    return this.editors.filter((editor) => this.doIsSelected(editor));
  }
  isSelected(editorCandidateOrIndex) {
    let editor;
    if (typeof editorCandidateOrIndex === "number") {
      editor = this.editors[editorCandidateOrIndex];
    } else {
      editor = this.findEditor(editorCandidateOrIndex)?.[0];
    }
    return !!editor && this.doIsSelected(editor);
  }
  doIsSelected(editor) {
    return this.selection.includes(editor);
  }
  setSelection(activeSelectedEditorCandidate, inactiveSelectedEditorCandidates) {
    const res = this.findEditor(activeSelectedEditorCandidate);
    if (!res) {
      return;
    }
    const [activeSelectedEditor, activeSelectedEditorIndex] = res;
    const inactiveSelectedEditors = /* @__PURE__ */ new Set();
    for (const inactiveSelectedEditorCandidate of inactiveSelectedEditorCandidates) {
      const res2 = this.findEditor(inactiveSelectedEditorCandidate);
      if (!res2) {
        return;
      }
      const [inactiveSelectedEditor] = res2;
      if (inactiveSelectedEditor === activeSelectedEditor) {
        continue;
      }
      inactiveSelectedEditors.add(inactiveSelectedEditor);
    }
    this.doSetSelection(activeSelectedEditor, activeSelectedEditorIndex, Array.from(inactiveSelectedEditors));
  }
  doSetSelection(activeSelectedEditor, activeSelectedEditorIndex, inactiveSelectedEditors) {
    const previousActiveEditor = this.activeEditor;
    const previousSelection = this.selection;
    let newSelection;
    if (activeSelectedEditor) {
      newSelection = [activeSelectedEditor, ...inactiveSelectedEditors];
    } else {
      newSelection = [];
    }
    this.selection = newSelection;
    const activeEditorChanged = activeSelectedEditor && typeof activeSelectedEditorIndex === "number" && previousActiveEditor !== activeSelectedEditor;
    if (activeEditorChanged) {
      const mruIndex = this.indexOf(activeSelectedEditor, this.mru);
      this.mru.splice(mruIndex, 1);
      this.mru.unshift(activeSelectedEditor);
      const event = {
        kind: 8 /* EDITOR_ACTIVE */,
        editor: activeSelectedEditor,
        editorIndex: activeSelectedEditorIndex
      };
      this._onDidModelChange.fire(event);
    }
    if (activeEditorChanged || previousSelection.length !== newSelection.length || previousSelection.some((editor) => !newSelection.includes(editor))) {
      const event = {
        kind: 4 /* EDITORS_SELECTION */
      };
      this._onDidModelChange.fire(event);
    }
  }
  setIndex(index2) {
    this._onDidModelChange.fire({ kind: 1 /* GROUP_INDEX */ });
  }
  setLabel(label3) {
    this._onDidModelChange.fire({ kind: 2 /* GROUP_LABEL */ });
  }
  pin(candidate) {
    const res = this.findEditor(candidate);
    if (!res) {
      return;
    }
    const [editor, editorIndex] = res;
    this.doPin(editor, editorIndex);
    return editor;
  }
  doPin(editor, editorIndex) {
    if (this.isPinned(editor)) {
      return;
    }
    this.setTransient(editor, false);
    this.preview = null;
    const event = {
      kind: 11 /* EDITOR_PIN */,
      editor,
      editorIndex
    };
    this._onDidModelChange.fire(event);
  }
  unpin(candidate) {
    const res = this.findEditor(candidate);
    if (!res) {
      return;
    }
    const [editor, editorIndex] = res;
    this.doUnpin(editor, editorIndex);
    return editor;
  }
  doUnpin(editor, editorIndex) {
    if (!this.isPinned(editor)) {
      return;
    }
    const oldPreview = this.preview;
    this.preview = editor;
    const event = {
      kind: 11 /* EDITOR_PIN */,
      editor,
      editorIndex
    };
    this._onDidModelChange.fire(event);
    if (oldPreview) {
      this.closeEditor(oldPreview, 3 /* UNPIN */);
    }
  }
  isPinned(editorCandidateOrIndex) {
    let editor;
    if (typeof editorCandidateOrIndex === "number") {
      editor = this.editors[editorCandidateOrIndex];
    } else {
      editor = editorCandidateOrIndex;
    }
    return !this.matches(this.preview, editor);
  }
  stick(candidate) {
    const res = this.findEditor(candidate);
    if (!res) {
      return;
    }
    const [editor, editorIndex] = res;
    this.doStick(editor, editorIndex);
    return editor;
  }
  doStick(editor, editorIndex) {
    if (this.isSticky(editorIndex)) {
      return;
    }
    this.pin(editor);
    const newEditorIndex = this.sticky + 1;
    this.moveEditor(editor, newEditorIndex);
    this.sticky++;
    const event = {
      kind: 13 /* EDITOR_STICKY */,
      editor,
      editorIndex: newEditorIndex
    };
    this._onDidModelChange.fire(event);
  }
  unstick(candidate) {
    const res = this.findEditor(candidate);
    if (!res) {
      return;
    }
    const [editor, editorIndex] = res;
    this.doUnstick(editor, editorIndex);
    return editor;
  }
  doUnstick(editor, editorIndex) {
    if (!this.isSticky(editorIndex)) {
      return;
    }
    const newEditorIndex = this.sticky;
    this.moveEditor(editor, newEditorIndex);
    this.sticky--;
    const event = {
      kind: 13 /* EDITOR_STICKY */,
      editor,
      editorIndex: newEditorIndex
    };
    this._onDidModelChange.fire(event);
  }
  isSticky(candidateOrIndex) {
    if (this.sticky < 0) {
      return false;
    }
    let index2;
    if (typeof candidateOrIndex === "number") {
      index2 = candidateOrIndex;
    } else {
      index2 = this.indexOf(candidateOrIndex);
    }
    if (index2 < 0) {
      return false;
    }
    return index2 <= this.sticky;
  }
  setTransient(candidate, transient) {
    if (!transient && this.transient.size === 0) {
      return;
    }
    const res = this.findEditor(candidate);
    if (!res) {
      return;
    }
    const [editor, editorIndex] = res;
    this.doSetTransient(editor, editorIndex, transient);
    return editor;
  }
  doSetTransient(editor, editorIndex, transient) {
    if (transient) {
      if (this.transient.has(editor)) {
        return;
      }
      this.transient.add(editor);
    } else {
      if (!this.transient.has(editor)) {
        return;
      }
      this.transient.delete(editor);
    }
    const event = {
      kind: 12 /* EDITOR_TRANSIENT */,
      editor,
      editorIndex
    };
    this._onDidModelChange.fire(event);
  }
  isTransient(editorCandidateOrIndex) {
    if (this.transient.size === 0) {
      return false;
    }
    let editor;
    if (typeof editorCandidateOrIndex === "number") {
      editor = this.editors[editorCandidateOrIndex];
    } else {
      editor = this.findEditor(editorCandidateOrIndex)?.[0];
    }
    return !!editor && this.transient.has(editor);
  }
  splice(index2, del, editor) {
    const editorToDeleteOrReplace = this.editors[index2];
    if (del && this.isSticky(index2)) {
      this.sticky--;
    }
    if (editor) {
      this.editors.splice(index2, del ? 1 : 0, editor);
    } else {
      this.editors.splice(index2, del ? 1 : 0);
    }
    {
      if (!del && editor) {
        if (this.mru.length === 0) {
          this.mru.push(editor);
        } else {
          this.mru.splice(1, 0, editor);
        }
      } else {
        const indexInMRU = this.indexOf(editorToDeleteOrReplace, this.mru);
        if (del && !editor) {
          this.mru.splice(indexInMRU, 1);
        } else if (del && editor) {
          this.mru.splice(indexInMRU, 1, editor);
        }
      }
    }
  }
  indexOf(candidate, editors = this.editors, options3) {
    let index2 = -1;
    if (!candidate) {
      return index2;
    }
    for (let i2 = 0; i2 < editors.length; i2++) {
      const editor = editors[i2];
      if (this.matches(editor, candidate, options3)) {
        if (options3?.supportSideBySide && editor instanceof SideBySideEditorInput && !(candidate instanceof SideBySideEditorInput)) {
          index2 = i2;
        } else {
          index2 = i2;
          break;
        }
      }
    }
    return index2;
  }
  findEditor(candidate, options3) {
    const index2 = this.indexOf(candidate, this.editors, options3);
    if (index2 === -1) {
      return void 0;
    }
    return [this.editors[index2], index2];
  }
  isFirst(candidate, editors = this.editors) {
    return this.matches(editors[0], candidate);
  }
  isLast(candidate, editors = this.editors) {
    return this.matches(editors[editors.length - 1], candidate);
  }
  contains(candidate, options3) {
    return this.indexOf(candidate, this.editors, options3) !== -1;
  }
  matches(editor, candidate, options3) {
    if (!editor || !candidate) {
      return false;
    }
    if (options3?.supportSideBySide && editor instanceof SideBySideEditorInput && !(candidate instanceof SideBySideEditorInput)) {
      switch (options3.supportSideBySide) {
        case 4 /* ANY */:
          if (this.matches(editor.primary, candidate, options3) || this.matches(editor.secondary, candidate, options3)) {
            return true;
          }
          break;
        case 3 /* BOTH */:
          if (this.matches(editor.primary, candidate, options3) && this.matches(editor.secondary, candidate, options3)) {
            return true;
          }
          break;
      }
    }
    const strictEquals2 = editor === candidate;
    if (options3?.strictEquals) {
      return strictEquals2;
    }
    return strictEquals2 || editor.matches(candidate);
  }
  get isLocked() {
    return this.locked;
  }
  lock(locked) {
    if (this.isLocked !== locked) {
      this.locked = locked;
      this._onDidModelChange.fire({ kind: 3 /* GROUP_LOCKED */ });
    }
  }
  clone() {
    const clone2 = this.instantiationService.createInstance(EditorGroupModel, void 0);
    clone2.editors = this.editors.slice(0);
    clone2.mru = this.mru.slice(0);
    clone2.preview = this.preview;
    clone2.selection = this.selection.slice(0);
    clone2.sticky = this.sticky;
    for (const editor of clone2.editors) {
      clone2.registerEditorListeners(editor);
    }
    return clone2;
  }
  serialize() {
    const registry4 = Registry.as(EditorExtensions.EditorFactory);
    const serializableEditors = [];
    const serializedEditors = [];
    let serializablePreviewIndex;
    let serializableSticky = this.sticky;
    for (let i2 = 0; i2 < this.editors.length; i2++) {
      const editor = this.editors[i2];
      let canSerializeEditor = false;
      const editorSerializer = registry4.getEditorSerializer(editor);
      if (editorSerializer) {
        const value2 = editorSerializer.canSerialize(editor) ? editorSerializer.serialize(editor) : void 0;
        if (typeof value2 === "string") {
          canSerializeEditor = true;
          serializedEditors.push({ id: editor.typeId, value: value2 });
          serializableEditors.push(editor);
          if (this.preview === editor) {
            serializablePreviewIndex = serializableEditors.length - 1;
          }
        } else {
          canSerializeEditor = false;
        }
      }
      if (!canSerializeEditor && this.isSticky(i2)) {
        serializableSticky--;
      }
    }
    const serializableMru = this.mru.map((editor) => this.indexOf(editor, serializableEditors)).filter((i2) => i2 >= 0);
    return {
      id: this.id,
      locked: this.locked ? true : void 0,
      editors: serializedEditors,
      mru: serializableMru,
      preview: serializablePreviewIndex,
      sticky: serializableSticky >= 0 ? serializableSticky : void 0
    };
  }
  deserialize(data) {
    const registry4 = Registry.as(EditorExtensions.EditorFactory);
    if (typeof data.id === "number") {
      this._id = data.id;
      EditorGroupModel.IDS = Math.max(data.id + 1, EditorGroupModel.IDS);
    } else {
      this._id = EditorGroupModel.IDS++;
    }
    if (data.locked) {
      this.locked = true;
    }
    this.editors = coalesce(data.editors.map((e, index2) => {
      let editor;
      const editorSerializer = registry4.getEditorSerializer(e.id);
      if (editorSerializer) {
        const deserializedEditor = editorSerializer.deserialize(this.instantiationService, e.value);
        if (deserializedEditor instanceof EditorInput) {
          editor = deserializedEditor;
          this.registerEditorListeners(editor);
        }
      }
      if (!editor && typeof data.sticky === "number" && index2 <= data.sticky) {
        data.sticky--;
      }
      return editor;
    }));
    this.mru = coalesce(data.mru.map((i2) => this.editors[i2]));
    this.selection = this.mru.length > 0 ? [this.mru[0]] : [];
    if (typeof data.preview === "number") {
      this.preview = this.editors[data.preview];
    }
    if (typeof data.sticky === "number") {
      this.sticky = data.sticky;
    }
    return this._id;
  }
  dispose() {
    dispose(Array.from(this.editorListeners));
    this.editorListeners.clear();
    this.transient.clear();
    super.dispose();
  }
};

EditorGroupModel = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService)
], EditorGroupModel);
export { isSerializedEditorGroupModel, isGroupEditorOpenEvent, isGroupEditorMoveEvent, isGroupEditorCloseEvent, EditorOpenPositioning, EditorGroupModel };
