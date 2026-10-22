// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/electron-browser/devCommands.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { URI } from "./module-0032.mjs";
import { randomPath } from "./module-0031.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { MergeEditor } from "./module-2986.mjs";


// src/vs/workbench/contrib/mergeEditor/electron-browser/devCommands.ts
var MERGE_EDITOR_CATEGORY2 = localize2(17353, "Merge Editor (Dev)");

var MergeEditorOpenContentsFromJSON = class extends Action2 {
  constructor() {
    super({
      id: "merge.dev.openContentsJson",
      category: MERGE_EDITOR_CATEGORY2,
      title: localize2(17352, "Open Merge Editor State from JSON"),
      icon: Codicon.layoutCentered,
      f1: true
    });
  }
  async run(accessor, args2) {
    const quickInputService = accessor.get(IQuickInputService);
    const clipboardService = accessor.get(IClipboardService);
    const editorService = accessor.get(IEditorService);
    const languageService = accessor.get(ILanguageService);
    const env2 = accessor.get(INativeEnvironmentService);
    const fileService = accessor.get(IFileService);
    if (!args2) {
      args2 = {};
    }
    let content;
    if (!args2.data) {
      const result = await quickInputService.input({
        prompt: localize(17354, null),
        value: await clipboardService.readText()
      });
      if (result === void 0) {
        return;
      }
      content = result !== "" ? JSON.parse(result) : { base: "", input1: "", input2: "", result: "", languageId: "plaintext" };
    } else {
      content = args2.data;
    }
    const targetDir = URI.joinPath(env2.tmpDir, randomPath());
    const extension = languageService.getExtensions(content.languageId)[0] || "";
    const baseUri = URI.joinPath(targetDir, `/base${extension}`);
    const input1Uri = URI.joinPath(targetDir, `/input1${extension}`);
    const input2Uri = URI.joinPath(targetDir, `/input2${extension}`);
    const resultUri = URI.joinPath(targetDir, `/result${extension}`);
    const initialResultUri = URI.joinPath(targetDir, `/initialResult${extension}`);
    async function writeFile(uri4, content2) {
      await fileService.writeFile(uri4, VSBuffer.fromString(content2));
    }
    const shouldOpenInitial = await promptOpenInitial2(quickInputService, args2.resultState);
    await Promise.all([
      writeFile(baseUri, content.base),
      writeFile(input1Uri, content.input1),
      writeFile(input2Uri, content.input2),
      writeFile(resultUri, shouldOpenInitial ? content.initialResult || "" : content.result),
      writeFile(initialResultUri, content.initialResult || "")
    ]);
    const input = {
      base: { resource: baseUri },
      input1: { resource: input1Uri, label: "Input 1", description: "Input 1", detail: "(from JSON)" },
      input2: { resource: input2Uri, label: "Input 2", description: "Input 2", detail: "(from JSON)" },
      result: { resource: resultUri }
    };
    editorService.openEditor(input);
  }
};

async function promptOpenInitial2(quickInputService, resultStateOverride) {
  if (resultStateOverride) {
    return resultStateOverride === "initial";
  }
  const result = await quickInputService.pick([{ label: "result", result: false }, { label: "initial result", result: true }], { canPickMany: false });
  return result?.result;
}

var MergeEditorAction3 = class extends Action2 {
  constructor(desc) {
    super(desc);
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      const vm = activeEditorPane.viewModel.get();
      if (!vm) {
        return;
      }
      this.runWithViewModel(vm, accessor);
    }
  }
};

var OpenSelectionInTemporaryMergeEditor = class extends MergeEditorAction3 {
  constructor() {
    super({
      id: "merge.dev.openSelectionInTemporaryMergeEditor",
      category: MERGE_EDITOR_CATEGORY2,
      title: localize2(17351, "Open Selection In Temporary Merge Editor"),
      icon: Codicon.layoutCentered,
      f1: true
    });
  }
  async runWithViewModel(viewModel, accessor) {
    const rangesInBase = viewModel.selectionInBase.get()?.rangesInBase;
    if (!rangesInBase || rangesInBase.length === 0) {
      return;
    }
    const base = rangesInBase.map(
      (r2) => viewModel.model.base.getValueInRange(
        r2
      )
    ).join("\n");
    const input1 = rangesInBase.map(
      (r2) => viewModel.inputCodeEditorView1.editor.getModel().getValueInRange(
        viewModel.model.translateBaseRangeToInput(1, r2)
      )
    ).join("\n");
    const input2 = rangesInBase.map(
      (r2) => viewModel.inputCodeEditorView2.editor.getModel().getValueInRange(
        viewModel.model.translateBaseRangeToInput(2, r2)
      )
    ).join("\n");
    const result = rangesInBase.map(
      (r2) => viewModel.resultCodeEditorView.editor.getModel().getValueInRange(
        viewModel.model.translateBaseRangeToResult(r2)
      )
    ).join("\n");
    new MergeEditorOpenContentsFromJSON().run(accessor, {
      data: {
        base,
        input1,
        input2,
        result,
        languageId: viewModel.resultCodeEditorView.editor.getModel().getLanguageId()
      }
    });
  }
};
export { promptOpenInitial2, MERGE_EDITOR_CATEGORY2, MergeEditorOpenContentsFromJSON, MergeEditorAction3, OpenSelectionInTemporaryMergeEditor };
