// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/commands/devCommands.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { ctxIsMergeEditor } from "./module-1142.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { INotificationService } from "./module-0336.mjs";
import { MergeEditor } from "./module-2986.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/commands/devCommands.ts
var MERGE_EDITOR_CATEGORY = localize2(17239, "Merge Editor (Dev)");

var MergeEditorCopyContentsToJSON = class extends Action2 {
  constructor() {
    super({
      id: "merge.dev.copyContentsJson",
      category: MERGE_EDITOR_CATEGORY,
      title: localize2(17236, "Copy Merge Editor State as JSON"),
      icon: Codicon.layoutCentered,
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    const clipboardService = accessor.get(IClipboardService);
    const notificationService = accessor.get(INotificationService);
    if (!(activeEditorPane instanceof MergeEditor)) {
      notificationService.info({
        name: localize(17240, null),
        message: localize(17241, null)
      });
      return;
    }
    const model = activeEditorPane.model;
    if (!model) {
      return;
    }
    const contents = {
      languageId: model.resultTextModel.getLanguageId(),
      base: model.base.getValue(),
      input1: model.input1.textModel.getValue(),
      input2: model.input2.textModel.getValue(),
      result: model.resultTextModel.getValue(),
      initialResult: model.getInitialResultValue()
    };
    const jsonStr = JSON.stringify(contents, void 0, 4);
    clipboardService.writeText(jsonStr);
    notificationService.info({
      name: localize(17240, null),
      message: localize(17243, null)
    });
  }
};

var MergeEditorSaveContentsToFolder = class extends Action2 {
  constructor() {
    super({
      id: "merge.dev.saveContentsToFolder",
      category: MERGE_EDITOR_CATEGORY,
      title: localize2(17238, "Save Merge Editor State to Folder"),
      icon: Codicon.layoutCentered,
      f1: true,
      precondition: ctxIsMergeEditor
    });
  }
  async run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    const notificationService = accessor.get(INotificationService);
    const dialogService = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const languageService = accessor.get(ILanguageService);
    if (!(activeEditorPane instanceof MergeEditor)) {
      notificationService.info({
        name: localize(17240, null),
        message: localize(17241, null)
      });
      return;
    }
    const model = activeEditorPane.model;
    if (!model) {
      return;
    }
    const result = await dialogService.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      title: localize(17242, null)
    });
    if (!result) {
      return;
    }
    const targetDir = result[0];
    const extension = languageService.getExtensions(model.resultTextModel.getLanguageId())[0] || "";
    async function write(fileName, source) {
      await fileService.writeFile(URI.joinPath(targetDir, fileName + extension), VSBuffer.fromString(source), {});
    }
    await Promise.all([
      write("base", model.base.getValue()),
      write("input1", model.input1.textModel.getValue()),
      write("input2", model.input2.textModel.getValue()),
      write("result", model.resultTextModel.getValue()),
      write("initialResult", model.getInitialResultValue())
    ]);
    notificationService.info({
      name: localize(17240, null),
      message: localize(17244, null)
    });
  }
};

var MergeEditorLoadContentsFromFolder = class extends Action2 {
  constructor() {
    super({
      id: "merge.dev.loadContentsFromFolder",
      category: MERGE_EDITOR_CATEGORY,
      title: localize2(17237, "Load Merge Editor State from Folder"),
      icon: Codicon.layoutCentered,
      f1: true
    });
  }
  async run(accessor, args2) {
    const dialogService = accessor.get(IFileDialogService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const quickInputService = accessor.get(IQuickInputService);
    if (!args2) {
      args2 = {};
    }
    let targetDir;
    if (!args2.folderUri) {
      const result = await dialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: localize(17242, null)
      });
      if (!result) {
        return;
      }
      targetDir = result[0];
    } else {
      targetDir = args2.folderUri;
    }
    const targetDirInfo = await fileService.resolve(targetDir);
    function findFile(name) {
      return targetDirInfo.children.find((c) => c.name.startsWith(name))?.resource;
    }
    const shouldOpenInitial = await promptOpenInitial(quickInputService, args2.resultState);
    const baseUri = findFile("base");
    const input1Uri = findFile("input1");
    const input2Uri = findFile("input2");
    const resultUri = findFile(shouldOpenInitial ? "initialResult" : "result");
    const input = {
      base: { resource: baseUri },
      input1: { resource: input1Uri, label: "Input 1", description: "Input 1", detail: "(from file)" },
      input2: { resource: input2Uri, label: "Input 2", description: "Input 2", detail: "(from file)" },
      result: { resource: resultUri }
    };
    editorService.openEditor(input);
  }
};

async function promptOpenInitial(quickInputService, resultStateOverride) {
  if (resultStateOverride) {
    return resultStateOverride === "initial";
  }
  const result = await quickInputService.pick([{ label: "result", result: false }, { label: "initial result", result: true }], { canPickMany: false });
  return result?.result;
}
export { promptOpenInitial, MERGE_EDITOR_CATEGORY, MergeEditorCopyContentsToJSON, MergeEditorSaveContentsToFolder, MergeEditorLoadContentsFromFolder };
