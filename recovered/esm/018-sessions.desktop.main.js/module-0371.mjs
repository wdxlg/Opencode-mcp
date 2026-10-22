// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/codeEditor/codeEditorContributions.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { getWindow, runWhenWindowIdle } from "./module-0075.mjs";


// src/vs/editor/browser/widget/codeEditor/codeEditorContributions.ts
var CodeEditorContributions = class extends Disposable {
  constructor() {
    super();
    this._editor = null;
    this._instantiationService = null;
    /**
     * Contains all instantiated contributions.
     */
    this._instances = this._register(new DisposableMap());
    /**
     * Contains contributions which are not yet instantiated.
     */
    this._pending = /* @__PURE__ */ new Map();
    /**
     * Tracks which instantiation kinds are still left in `_pending`.
     */
    this._finishedInstantiation = [];
    this._finishedInstantiation[0 /* Eager */] = false;
    this._finishedInstantiation[1 /* AfterFirstRender */] = false;
    this._finishedInstantiation[2 /* BeforeFirstInteraction */] = false;
    this._finishedInstantiation[3 /* Eventually */] = false;
  }
  initialize(editor, contributions, instantiationService) {
    this._editor = editor;
    this._instantiationService = instantiationService;
    for (const desc of contributions) {
      if (this._pending.has(desc.id)) {
        onUnexpectedError(new Error(`Cannot have two contributions with the same id ${desc.id}`));
        continue;
      }
      this._pending.set(desc.id, desc);
    }
    this._instantiateSome(0 /* Eager */);
    this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
      this._instantiateSome(1 /* AfterFirstRender */);
    }));
    this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
      this._instantiateSome(2 /* BeforeFirstInteraction */);
    }));
    this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
      this._instantiateSome(3 /* Eventually */);
    }, 5e3));
  }
  saveViewState() {
    const contributionsState = {};
    for (const [id2, contribution] of this._instances) {
      if (typeof contribution.saveViewState === "function") {
        contributionsState[id2] = contribution.saveViewState();
      }
    }
    return contributionsState;
  }
  restoreViewState(contributionsState) {
    for (const [id2, contribution] of this._instances) {
      if (typeof contribution.restoreViewState === "function") {
        contribution.restoreViewState(contributionsState[id2]);
      }
    }
  }
  get(id2) {
    this._instantiateById(id2);
    return this._instances.get(id2) || null;
  }
  /**
   * used by tests
   */
  set(id2, value2) {
    this._instances.set(id2, value2);
  }
  onBeforeInteractionEvent() {
    this._instantiateSome(2 /* BeforeFirstInteraction */);
  }
  onAfterModelAttached() {
    return runWhenWindowIdle(getWindow(this._editor?.getDomNode()), () => {
      this._instantiateSome(1 /* AfterFirstRender */);
    }, 50);
  }
  _instantiateSome(instantiation) {
    if (this._finishedInstantiation[instantiation]) {
      return;
    }
    this._finishedInstantiation[instantiation] = true;
    const contribs = this._findPendingContributionsByInstantiation(instantiation);
    for (const contrib of contribs) {
      this._instantiateById(contrib.id);
    }
  }
  _findPendingContributionsByInstantiation(instantiation) {
    const result = [];
    for (const [, desc] of this._pending) {
      if (desc.instantiation === instantiation) {
        result.push(desc);
      }
    }
    return result;
  }
  _instantiateById(id2) {
    const desc = this._pending.get(id2);
    if (!desc) {
      return;
    }
    this._pending.delete(id2);
    if (!this._instantiationService || !this._editor) {
      throw new Error(`Cannot instantiate contributions before being initialized!`);
    }
    try {
      const instance2 = this._instantiationService.createInstance(desc.ctor, this._editor);
      this._instances.set(desc.id, instance2);
      if (typeof instance2.restoreViewState === "function" && desc.instantiation !== 0 /* Eager */) {
        console.warn(`Editor contribution '${desc.id}' should be eager instantiated because it uses saveViewState / restoreViewState.`);
      }
    } catch (err) {
      onUnexpectedError(err);
    }
  }
};
export { CodeEditorContributions };
