// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/builtInTools/tools.ts
import { Disposable } from "./module-0012.mjs";
import { FetchWebPageTool, FetchWebPageToolData } from "./module-4118.mjs";
import { InternalFetchWebPageToolId } from "./module-2519.mjs";
import { ChatUrlFetchingConfirmationContribution } from "./module-4117.mjs";
import { ChatExternalPathConfirmationContribution } from "./module-4115.mjs";
import { dirname2, extUriBiasedIgnorePathCase } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageModelToolsConfirmationService } from "./module-1474.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/chat/electron-browser/builtInTools/tools.ts
var NativeBuiltinToolsContribution = class extends Disposable {
  static {
    this.ID = "chat.nativeBuiltinTools";
  }
  constructor(toolsService, instantiationService, confirmationService, fileService, storageService, fileDialogService, labelService) {
    super();
    const editTool = instantiationService.createInstance(FetchWebPageTool);
    this._register(toolsService.registerTool(FetchWebPageToolData, editTool));
    this._register(confirmationService.registerConfirmationContribution(
      InternalFetchWebPageToolId,
      instantiationService.createInstance(
        ChatUrlFetchingConfirmationContribution,
        (params) => params.urls
      )
    ));
    const externalPathConfirmation = new ChatExternalPathConfirmationContribution(
      (ref) => {
        const params = ref.parameters;
        if (params?.filePath) {
          return { path: params.filePath, isDirectory: false };
        }
        if (params?.path) {
          return { path: params.path, isDirectory: true };
        }
        return void 0;
      },
      labelService,
      async (pathUri) => {
        let dir = dirname2(pathUri);
        for (let i2 = 0; i2 < 100; i2++) {
          try {
            if (await fileService.exists(URI.joinPath(dir, ".git"))) {
              return dir;
            }
          } catch {
          }
          const parent = dirname2(dir);
          if (extUriBiasedIgnorePathCase.isEqual(parent, dir)) {
            return void 0;
          }
          dir = parent;
        }
        return void 0;
      },
      storageService,
      async () => {
        const result = await fileDialogService.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false
        });
        return result?.[0];
      }
    );
    this._register(externalPathConfirmation);
    this._register(confirmationService.registerConfirmationContribution(
      "copilot_readFile",
      externalPathConfirmation
    ));
    this._register(confirmationService.registerConfirmationContribution(
      "copilot_listDirectory",
      externalPathConfirmation
    ));
  }
};

NativeBuiltinToolsContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILanguageModelToolsConfirmationService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IFileDialogService),
  __decorateParam(6, ILabelService)
], NativeBuiltinToolsContribution);
export { NativeBuiltinToolsContribution };
