// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/electron-browser/startDebugTextMate.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { URI } from "./module-0032.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { Range2 } from "./module-0106.mjs";
import { ITextMateTokenizationService } from "./module-1226.mjs";
import { IModelService } from "./module-0080.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IHostService } from "./module-1118.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { IFileService } from "./module-0269.mjs";
import { joinPath } from "./module-0034.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/workbench/contrib/codeEditor/electron-browser/startDebugTextMate.ts
var StartDebugTextMate = class _StartDebugTextMate extends Action2 {
  static {
    this.resource = URI.parse(`inmemory:///tm-log.txt`);
  }
  constructor() {
    super({
      id: "editor.action.startDebugTextMate",
      title: localize2(13928, "Start TextMate Syntax Grammar Logging"),
      category: Categories.Developer,
      f1: true
    });
  }
  _getOrCreateModel(modelService) {
    const model = modelService.getModel(_StartDebugTextMate.resource);
    if (model) {
      return model;
    }
    return modelService.createModel("", null, _StartDebugTextMate.resource);
  }
  _append(model, str) {
    const lineCount = model.getLineCount();
    model.applyEdits([{
      range: new Range2(lineCount, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, lineCount, 1073741824 /* MAX_SAFE_SMALL_INTEGER */),
      text: str
    }]);
  }
  async run(accessor) {
    const textMateService = accessor.get(ITextMateTokenizationService);
    const modelService = accessor.get(IModelService);
    const editorService = accessor.get(IEditorService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const hostService = accessor.get(IHostService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    const loggerService = accessor.get(ILoggerService);
    const fileService = accessor.get(IFileService);
    const pathInTemp = joinPath(environmentService.tmpDir, `vcode-tm-log-${generateUuid()}.txt`);
    await fileService.createFile(pathInTemp);
    const logger = loggerService.createLogger(pathInTemp, { name: "debug textmate" });
    const model = this._getOrCreateModel(modelService);
    const append4 = (str) => {
      this._append(model, str + "\n");
      scrollEditor();
      logger.info(str);
      logger.flush();
    };
    await hostService.openWindow([{ fileUri: pathInTemp }], { forceNewWindow: true });
    const textEditorPane = await editorService.openEditor({
      resource: model.uri,
      options: { pinned: true }
    });
    if (!textEditorPane) {
      return;
    }
    const scrollEditor = () => {
      const editors = codeEditorService.listCodeEditors();
      for (const editor of editors) {
        if (editor.hasModel()) {
          if (editor.getModel().uri.toString() === _StartDebugTextMate.resource.toString()) {
            editor.revealLine(editor.getModel().getLineCount());
          }
        }
      }
    };
    append4(`// Open the file you want to test to the side and watch here`);
    append4(`// Output mirrored at ${pathInTemp}`);
    textMateService.startDebugMode(
      (str) => {
        this._append(model, str + "\n");
        scrollEditor();
        logger.info(str);
        logger.flush();
      },
      () => {
      }
    );
  }
};

registerAction2(StartDebugTextMate);
export { StartDebugTextMate };
