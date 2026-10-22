// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/editors/binaryFileEditor.ts
import { BaseBinaryResourceEditor } from "./module-1547.mjs";
import { BINARY_FILE_EDITOR_ID, BINARY_TEXT_FILE_MODE } from "./module-1534.mjs";
import { FileEditorInput } from "./module-2000.mjs";
import { isEditorInputWithOptions } from "./module-0926.mjs";
import { DiffEditorInput } from "./module-1102.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/files/browser/editors/binaryFileEditor.ts
var BinaryFileEditor = class extends BaseBinaryResourceEditor {
  constructor(group2, telemetryService, themeService, editorResolverService, storageService) {
    super(
      BinaryFileEditor.ID,
      group2,
      {
        openInternal: (input, options3) => this.openInternal(input, options3)
      },
      telemetryService,
      themeService,
      storageService
    );
    this.editorResolverService = editorResolverService;
  }
  static {
    this.ID = BINARY_FILE_EDITOR_ID;
  }
  async openInternal(input, options3) {
    if (input instanceof FileEditorInput && this.group.activeEditor) {
      const activeEditor = this.group.activeEditor;
      const untypedActiveEditor = activeEditor?.toUntyped();
      if (!untypedActiveEditor) {
        return;
      }
      let resolvedEditor = await this.editorResolverService.resolveEditor({
        ...untypedActiveEditor,
        options: {
          ...options3,
          override: 0 /* PICK */
        }
      }, this.group);
      if (resolvedEditor === 2 /* NONE */) {
        resolvedEditor = void 0;
      } else if (resolvedEditor === 1 /* ABORT */) {
        return;
      }
      if (isEditorInputWithOptions(resolvedEditor)) {
        for (const editor of resolvedEditor.editor instanceof DiffEditorInput ? [resolvedEditor.editor.original, resolvedEditor.editor.modified] : [resolvedEditor.editor]) {
          if (editor instanceof FileEditorInput) {
            editor.setForceOpenAsText();
            editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE);
          }
        }
      }
      await this.group.replaceEditors([{
        editor: activeEditor,
        replacement: resolvedEditor?.editor ?? input,
        options: {
          ...resolvedEditor?.options ?? options3
        }
      }]);
    }
  }
  getTitle() {
    return this.input ? this.input.getName() : localize(15671, null);
  }
};

BinaryFileEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IEditorResolverService),
  __decorateParam(4, IStorageService)
], BinaryFileEditor);
export { BinaryFileEditor };
