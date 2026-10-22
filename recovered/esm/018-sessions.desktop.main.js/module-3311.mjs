// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/format/browser/formatActionsNone.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/workbench/contrib/format/browser/formatActionsNone.ts
registerEditorAction(class FormatDocumentMultipleAction2 extends EditorAction {
  constructor() {
    super({
      id: "editor.action.formatDocument.none",
      label: localize2(16086, "Format Document"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasDocumentFormattingProvider.toNegated()),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KeyF */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */ },
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const commandService = accessor.get(ICommandService);
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const notificationService = accessor.get(INotificationService);
    const dialogService = accessor.get(IDialogService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const model = editor.getModel();
    const formatterCount = languageFeaturesService.documentFormattingEditProvider.all(model).length;
    if (formatterCount > 1) {
      return commandService.executeCommand("editor.action.formatDocument.multiple");
    } else if (formatterCount === 1) {
      return commandService.executeCommand("editor.action.formatDocument");
    } else if (model.isTooLargeForSyncing()) {
      notificationService.warn(localize(16089, null));
    } else {
      const langName = model.getLanguageId();
      const message = localize(16088, null, langName);
      const { confirmed } = await dialogService.confirm({
        message,
        primaryButton: localize(16087, null)
      });
      if (confirmed) {
        extensionsWorkbenchService.openSearch(`category:formatters ${langName}`);
      }
    }
  }
});
export {};
