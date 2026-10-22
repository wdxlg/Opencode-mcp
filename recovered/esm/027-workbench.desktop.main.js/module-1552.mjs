// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/binaryEditorModel.ts
import { EditorModel } from "./module-1096.mjs";
import { Mimes } from "./module-0136.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/common/editor/binaryEditorModel.ts
var BinaryEditorModel = class extends EditorModel {
  constructor(resource, name, fileService) {
    super();
    this.resource = resource;
    this.name = name;
    this.fileService = fileService;
    this.mime = Mimes.binary;
  }
  /**
   * The name of the binary resource.
   */
  getName() {
    return this.name;
  }
  /**
   * The size of the binary resource if known.
   */
  getSize() {
    return this.size;
  }
  /**
   * The mime of the binary resource if known.
   */
  getMime() {
    return this.mime;
  }
  /**
   * The etag of the binary resource if known.
   */
  getETag() {
    return this.etag;
  }
  async resolve() {
    if (this.fileService.hasProvider(this.resource)) {
      const stat = await this.fileService.stat(this.resource);
      this.etag = stat.etag;
      if (typeof stat.size === "number") {
        this.size = stat.size;
      }
    }
    return super.resolve();
  }
};

BinaryEditorModel = __decorateClass([
  __decorateParam(2, IFileService)
], BinaryEditorModel);
export { BinaryEditorModel };
