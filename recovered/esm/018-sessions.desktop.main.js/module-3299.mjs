// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/format/browser/formatModified.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { formatDocumentRangesWithSelectedProvider } from "./module-0689.mjs";
import { Progress } from "./module-0446.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IQuickDiffService } from "./module-1080.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { getOriginalResource } from "./module-2956.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/format/browser/formatModified.ts
registerEditorAction(class FormatModifiedAction extends EditorAction {
  constructor() {
    super({
      id: "editor.action.formatChanges",
      label: localize2(16090, "Format Modified Lines"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasDocumentSelectionFormattingProvider)
    });
  }
  async run(accessor, editor) {
    const instaService = accessor.get(IInstantiationService);
    if (!editor.hasModel()) {
      return;
    }
    const ranges = await instaService.invokeFunction(getModifiedRanges, editor.getModel());
    if (isNonEmptyArray(ranges)) {
      return instaService.invokeFunction(
        formatDocumentRangesWithSelectedProvider,
        editor,
        ranges,
        1 /* Explicit */,
        Progress.None,
        CancellationToken.None,
        true
      );
    }
  }
});

async function getModifiedRanges(accessor, modified) {
  const quickDiffService = accessor.get(IQuickDiffService);
  const workerService = accessor.get(IEditorWorkerService);
  const modelService = accessor.get(ITextModelService);
  const original = await getOriginalResource(quickDiffService, modified.uri, modified.getLanguageId(), shouldSynchronizeModel(modified));
  if (!original) {
    return null;
  }
  const ranges = [];
  const ref = await modelService.createModelReference(original);
  try {
    if (!workerService.canComputeDirtyDiff(original, modified.uri)) {
      return void 0;
    }
    const changes = await workerService.computeDirtyDiff(original, modified.uri, false);
    if (!isNonEmptyArray(changes)) {
      return void 0;
    }
    for (const change of changes) {
      ranges.push(modified.validateRange(
        new Range2(
          change.modifiedStartLineNumber,
          1,
          change.modifiedEndLineNumber || change.modifiedStartLineNumber,
          Number.MAX_SAFE_INTEGER
        )
      ));
    }
  } finally {
    ref.dispose();
  }
  return ranges;
}
export { getModifiedRanges };
