// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatManagement/chatManagementEditor.ts
import { $, append } from "./module-0075.mjs";
import { EditorPane } from "./module-1090.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { CONTEXT_MODELS_EDITOR } from "./module-0965.mjs";
import { ChatModelsWidget } from "./module-2644.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/browser/chatManagement/chatManagementEditor.ts
var $96 = $;

var ModelsManagementEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, contextKeyService) {
    super(ModelsManagementEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.editorDisposables = this._register(new DisposableStore());
    this.inModelsEditorContextKey = CONTEXT_MODELS_EDITOR.bindTo(contextKeyService);
  }
  static {
    this.ID = "workbench.editor.modelsManagement";
  }
  createEditor(parent) {
    this.editorDisposables.clear();
    this.bodyContainer = append(parent, $96(".ai-models-management-editor"));
    this.modelsWidget = this.editorDisposables.add(this.instantiationService.createInstance(ChatModelsWidget, { vendor: "opencode", presentation: "api" }));
    this.bodyContainer.appendChild(this.modelsWidget.element);
  }
  async setInput(input, options3, context2, token) {
    this.inModelsEditorContextKey.set(true);
    await super.setInput(input, options3, context2, token);
    if (this.dimension) {
      this.layout(this.dimension);
    }
    this.modelsWidget?.render();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.bodyContainer) {
      this.modelsWidget?.layout(dimension.height - 15, this.bodyContainer.clientWidth - 24);
    }
  }
  focus() {
    super.focus();
    this.modelsWidget?.focusSearch();
  }
  clearInput() {
    this.inModelsEditorContextKey.set(false);
    super.clearInput();
  }
  clearSearch() {
    this.modelsWidget?.clearSearch();
  }
  search(query) {
    this.modelsWidget?.search(query);
  }
};

ModelsManagementEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], ModelsManagementEditor);
export { $96, ModelsManagementEditor };
