// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/electron-browser/sleepResumeRepaintMinimap.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/codeEditor/electron-browser/sleepResumeRepaintMinimap.ts
var SleepResumeRepaintMinimap = class extends Disposable {
  constructor(codeEditorService, nativeHostService) {
    super();
    this._register(nativeHostService.onDidResumeOS(() => {
      codeEditorService.listCodeEditors().forEach((editor) => editor.render(true));
    }));
  }
};

SleepResumeRepaintMinimap = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, INativeHostService)
], SleepResumeRepaintMinimap);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(SleepResumeRepaintMinimap, 4 /* Eventually */);
export { SleepResumeRepaintMinimap };
