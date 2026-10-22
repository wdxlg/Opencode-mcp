// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/editorChatResponseFileChangesService.ts
import { AbstractChatResponseFileChangesService } from "./module-2258.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/chat/browser/editorChatResponseFileChangesService.ts
var EditorChatResponseFileChangesService = class extends AbstractChatResponseFileChangesService {
  constructor(editorService) {
    super();
    this.editorService = editorService;
  }
  openChangesForRequest(sessionResource, requestId, _context) {
    if (requestId === void 0) {
      return;
    }
    const diffs = this.getChangesForRequest(sessionResource, requestId)?.get();
    if (!diffs?.length) {
      return;
    }
    const source = URI.parse(`multi-diff-editor:${Date.now().toString()}-${Math.random().toString(36).slice(2)}`);
    this.editorService.openEditor({
      multiDiffSource: source,
      label: localize(11327, null),
      resources: diffs.map((diff4) => ({
        original: { resource: diff4.originalURI },
        modified: { resource: diff4.isDeleted ? void 0 : diff4.modifiedURI }
      }))
    });
  }
};

EditorChatResponseFileChangesService = __decorateClass([
  __decorateParam(0, IEditorService)
], EditorChatResponseFileChangesService);
export { EditorChatResponseFileChangesService };
