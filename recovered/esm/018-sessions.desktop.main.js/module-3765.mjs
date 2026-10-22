// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/diffEditorOptionsService.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { SessionsDiffRenderSideBySideContext } from "./module-3738.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/sessions/contrib/editor/browser/diffEditorOptionsService.ts
var PREFERRED_RENDER_SIDE_BY_SIDE_STORAGE_KEY = "sessions.diffEditor.renderSideBySide";

var DiffEditorOptionsService = class extends Disposable {
  constructor(storageService, contextKeyService) {
    super();
    this.storageService = storageService;
    this.renderSideBySide = observableValue(this, storageService.getBoolean(PREFERRED_RENDER_SIDE_BY_SIDE_STORAGE_KEY, 0 /* PROFILE */, true));
    this._register(bindContextKey(SessionsDiffRenderSideBySideContext, contextKeyService, (reader) => this.renderSideBySide.read(reader)));
  }
  toggleRenderSideBySide() {
    const renderSideBySide = !this.renderSideBySide.get();
    this.renderSideBySide.set(renderSideBySide, void 0);
    this.storageService.store(PREFERRED_RENDER_SIDE_BY_SIDE_STORAGE_KEY, renderSideBySide, 0 /* PROFILE */, 0 /* USER */);
  }
};

DiffEditorOptionsService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IContextKeyService)
], DiffEditorOptionsService);
export { PREFERRED_RENDER_SIDE_BY_SIDE_STORAGE_KEY, DiffEditorOptionsService };
