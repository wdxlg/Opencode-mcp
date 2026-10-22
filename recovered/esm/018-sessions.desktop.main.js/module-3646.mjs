// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/sessionChangesService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { SessionChangesEditorInput } from "./module-3586.mjs";
import { localize } from "./module-0001.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IChangesViewService } from "./module-3645.mjs";


// src/vs/sessions/contrib/changes/browser/sessionChangesService.ts
var ISessionChangesService = createDecorator("sessionChangesService");

var CHANGES_MULTI_DIFF_SOURCE_SCHEME = "changes-multi-diff-source";

var SessionChangesService = class {
  constructor(editorService, instantiationService, layoutService, changesViewService) {
    this.editorService = editorService;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.changesViewService = changesViewService;
  }
  getChangesEditorResource(sessionResource) {
    return URI.from({
      scheme: CHANGES_MULTI_DIFF_SOURCE_SCHEME,
      query: JSON.stringify({ sessionResource: sessionResource.toString() })
    });
  }
  getSessionResource(editorResource) {
    if (editorResource.scheme !== CHANGES_MULTI_DIFF_SOURCE_SCHEME) {
      return void 0;
    }
    let fields;
    try {
      fields = JSON.parse(editorResource.query);
    } catch {
      return void 0;
    }
    if (typeof fields !== "object" || fields === null || typeof fields.sessionResource !== "string") {
      return void 0;
    }
    return URI.parse(fields.sessionResource);
  }
  async openChangesEditor(sessionResource, options3, group2) {
    if (options3?.changesetSelection) {
      if (options3.changesetSelection.kind === "transient") {
        this.changesViewService.showChangeset(options3.changesetSelection.changeset);
      } else {
        this.changesViewService.setChangesetId(options3.changesetSelection.id);
      }
    }
    let editorOptions;
    if (options3) {
      const { changesetSelection: _, ...optionsWithoutSelection } = options3;
      editorOptions = optionsWithoutSelection;
    }
    const multiDiffSource = this.getChangesEditorResource(sessionResource);
    if (this.layoutService.isSinglePaneLayoutEnabled) {
      const input = this.instantiationService.createInstance(SessionChangesEditorInput, multiDiffSource);
      const pane2 = await this.editorService.openEditor(input, { ...editorOptions, pinned: true }, group2);
      await this.expandRevealTarget(pane2?.input, editorOptions);
      return pane2?.group;
    }
    const pane = await this.editorService.openEditor({
      multiDiffSource,
      label: localize(4303, null),
      options: editorOptions
    }, group2);
    await this.expandRevealTarget(pane?.input, editorOptions);
    return pane?.group;
  }
  async expandRevealTarget(input, options3) {
    const resource = options3?.viewState?.revealData?.resource;
    if (!resource || !(input instanceof SessionChangesEditorInput || input instanceof MultiDiffEditorInput)) {
      return;
    }
    const viewModel = await input.getViewModel();
    const item = viewModel.items.get().find((item2) => isEqual2(item2.originalUri, resource.original) && isEqual2(item2.modifiedUri, resource.modified));
    if (item) {
      viewModel.expand(item);
    }
  }
};

SessionChangesService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAgentWorkbenchLayoutService),
  __decorateParam(3, IChangesViewService)
], SessionChangesService);
export { ISessionChangesService, CHANGES_MULTI_DIFF_SOURCE_SCHEME, SessionChangesService };
