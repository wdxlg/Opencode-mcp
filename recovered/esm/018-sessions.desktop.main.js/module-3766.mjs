// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/diffEditor.sessions.contribution.ts
import { DiffEditorCommandsService, IDiffEditorCommandsService } from "./module-1527.mjs";
import { URI } from "./module-0032.mjs";
import { SessionChangesEditor } from "./module-3739.mjs";
import { TextDiffEditor } from "./module-1526.mjs";
import { isDiffEditor } from "./module-0223.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IDiffEditorOptionsService } from "./module-3738.mjs";
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { DiffEditorOptionsService } from "./module-3765.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/editor/browser/diffEditor.sessions.contribution.ts
var SessionsDiffEditorCommandsService = class extends DiffEditorCommandsService {
  constructor(editorService, textResourceConfigurationService, contextKeyService, diffEditorOptionsService) {
    super(editorService, textResourceConfigurationService, contextKeyService);
    this.diffEditorOptionsService = diffEditorOptionsService;
  }
  async toggleRenderSideBySide(args2) {
    const resource = args2[0] instanceof URI ? args2[0] : void 0;
    if (resource || !(this.editorService.activeEditorPane instanceof SessionChangesEditor)) {
      for (const pane of [this.editorService.activeEditorPane, ...this.editorService.visibleEditorPanes]) {
        if (!(pane instanceof TextDiffEditor)) {
          continue;
        }
        const control = pane.getControl();
        if (!isDiffEditor(control)) {
          continue;
        }
        const modifiedResource = control.getModifiedEditor().getModel()?.uri;
        if (resource && (!modifiedResource || !isEqual2(resource, modifiedResource))) {
          continue;
        }
        this.diffEditorOptionsService.toggleRenderSideBySide();
        return;
      }
    }
    if (this.editorService.activeEditorPane instanceof SessionChangesEditor) {
      this.diffEditorOptionsService.toggleRenderSideBySide();
      return;
    }
    if (resource) {
      this.diffEditorOptionsService.toggleRenderSideBySide();
      return;
    }
    return super.toggleRenderSideBySide(args2);
  }
};

SessionsDiffEditorCommandsService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITextResourceConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IDiffEditorOptionsService)
], SessionsDiffEditorCommandsService);

var SessionsDiffEditorLayoutContribution = class extends Disposable {
  constructor(editorService, diffEditorOptionsService) {
    super();
    this.editorService = editorService;
    this.diffEditorOptionsService = diffEditorOptionsService;
    this._register(this.editorService.onDidActiveEditorChange(() => this.applyLayout()));
    this._register(this.editorService.onDidVisibleEditorsChange(() => this.applyLayout()));
    this._register(autorun((reader) => {
      this.diffEditorOptionsService.renderSideBySide.read(reader);
      this.applyLayout();
    }));
  }
  static {
    this.ID = "workbench.contrib.sessions.diffEditorLayout";
  }
  applyLayout() {
    const renderSideBySide = this.diffEditorOptionsService.renderSideBySide.get();
    for (const pane of /* @__PURE__ */ new Set([this.editorService.activeEditorPane, ...this.editorService.visibleEditorPanes])) {
      if (pane instanceof TextDiffEditor) {
        const control = pane.getControl();
        if (isDiffEditor(control)) {
          control.updateOptions({ renderSideBySide, useInlineViewWhenSpaceIsLimited: true });
        }
      }
    }
  }
};

SessionsDiffEditorLayoutContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IDiffEditorOptionsService)
], SessionsDiffEditorLayoutContribution);

registerSingleton(IDiffEditorOptionsService, DiffEditorOptionsService, 1 /* Delayed */);

registerSingleton(IDiffEditorCommandsService, SessionsDiffEditorCommandsService, 1 /* Delayed */);

registerWorkbenchContribution2(SessionsDiffEditorLayoutContribution.ID, SessionsDiffEditorLayoutContribution, WorkbenchPhase.AfterRestored);
export { SessionsDiffEditorCommandsService, SessionsDiffEditorLayoutContribution };
