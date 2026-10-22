// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/binaryEditor.ts
import { EditorPlaceholder } from "./module-1546.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { BinaryEditorModel } from "./module-1544.mjs";
import { ByteSize } from "./module-0269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/browser/parts/editor/binaryEditor.ts
var BaseBinaryResourceEditor = class extends EditorPlaceholder {
  constructor(id2, group2, callbacks, telemetryService, themeService, storageService) {
    super(id2, group2, telemetryService, themeService, storageService);
    this.callbacks = callbacks;
    this._onDidChangeMetadata = this._register(new Emitter());
    this.onDidChangeMetadata = this._onDidChangeMetadata.event;
    this._onDidOpenInPlace = this._register(new Emitter());
    this.onDidOpenInPlace = this._onDidOpenInPlace.event;
  }
  getTitle() {
    return this.input ? this.input.getName() : localize(6273, null);
  }
  async getContents(input, options3) {
    const model = await input.resolve();
    if (!(model instanceof BinaryEditorModel)) {
      throw new Error("Unable to open file as binary");
    }
    const size3 = model.getSize();
    this.handleMetadataChanged(typeof size3 === "number" ? ByteSize.formatSize(size3) : "");
    return {
      icon: "$(warning)",
      label: localize(6274, null),
      actions: [
        {
          label: localize(6275, null),
          run: async () => {
            await this.callbacks.openInternal(input, options3);
            this._onDidOpenInPlace.fire();
          }
        }
      ]
    };
  }
  handleMetadataChanged(meta) {
    this.metadata = meta;
    this._onDidChangeMetadata.fire();
  }
  getMetadata() {
    return this.metadata;
  }
};

BaseBinaryResourceEditor = __decorateClass([
  __decorateParam(5, IStorageService)
], BaseBinaryResourceEditor);
export { BaseBinaryResourceEditor };
