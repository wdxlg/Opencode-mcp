// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesetReviewActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { CHANGESET_REVIEW_ACTION_ID, SessionChangesEditor } from "./module-3739.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SessionChangesFileResourceContext } from "./module-3740.mjs";
import { ChangesetReviewSupportContext, ChangesetReviewedFilesContext } from "./module-3743.mjs";
import { URI } from "./module-0032.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { getChangesEditorFileStats } from "./module-3730.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/sessions/contrib/changes/browser/changesetReviewActions.ts
var ChangesetReviewAction = class extends Action2 {
  constructor() {
    super({
      id: CHANGESET_REVIEW_ACTION_ID,
      title: localize(4262, null),
      f1: false,
      toggled: {
        condition: ContextKeyExpr.in(
          SessionChangesFileResourceContext.key,
          ChangesetReviewedFilesContext.key
        )
      },
      menu: {
        id: MenuId.MultiDiffEditorFileToolbar,
        when: ContextKeyExpr.and(
          ChangesetReviewSupportContext.isEqualTo(true),
          ContextKeyExpr.equals("resourceScheme", "changes-multi-diff-source")
        ),
        group: "navigation",
        order: 100
      }
    });
  }
  run(accessor, ...args2) {
    const resource = args2[0];
    if (!(resource instanceof URI)) {
      return;
    }
    const changesViewService = accessor.get(IChangesViewService);
    if (changesViewService.activeSessionChangesetObs.get()?.capabilities?.review !== true) {
      return;
    }
    const activeSessionChanges = changesViewService.activeSessionChangesObs.get();
    if (!getChangesEditorFileStats(resource, activeSessionChanges)) {
      return;
    }
    const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
    const reviewedFiles = activeSessionChanges.filter((change) => change.reviewed).map((change) => change.modifiedUri?.toString() ?? change.originalUri?.toString()).filter((uri4) => uri4 !== void 0);
    const review = !reviewedFiles.includes(resource.toString());
    if (activeEditorPane instanceof SessionChangesEditor) {
      if (review) {
        activeEditorPane.collapse(resource);
      } else {
        activeEditorPane.expand(resource);
      }
    }
    changesViewService.setChangesetFilesReviewState([resource], review);
  }
};

registerAction2(ChangesetReviewAction);
export { ChangesetReviewAction };
