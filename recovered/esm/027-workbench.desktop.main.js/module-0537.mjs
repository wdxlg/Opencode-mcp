// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/services/bulkEditService.ts
import { createDecorator } from "./module-0077.mjs";
import { isObject } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/editor/browser/services/bulkEditService.ts
var IBulkEditService = createDecorator("IWorkspaceEditService");

var ResourceEdit = class {
  constructor(metadata) {
    this.metadata = metadata;
  }
  static convert(edit3) {
    return edit3.edits.map((edit4) => {
      if (ResourceTextEdit.is(edit4)) {
        return ResourceTextEdit.lift(edit4);
      }
      if (ResourceFileEdit.is(edit4)) {
        return ResourceFileEdit.lift(edit4);
      }
      throw new Error("Unsupported edit");
    });
  }
};

var ResourceTextEdit = class _ResourceTextEdit extends ResourceEdit {
  constructor(resource, textEdit, versionId = void 0, metadata) {
    super(metadata);
    this.resource = resource;
    this.textEdit = textEdit;
    this.versionId = versionId;
  }
  static is(candidate) {
    if (candidate instanceof _ResourceTextEdit) {
      return true;
    }
    return isObject(candidate) && URI.isUri(candidate.resource) && isObject(candidate.textEdit);
  }
  static lift(edit3) {
    if (edit3 instanceof _ResourceTextEdit) {
      return edit3;
    } else {
      return new _ResourceTextEdit(edit3.resource, edit3.textEdit, edit3.versionId, edit3.metadata);
    }
  }
};

var ResourceFileEdit = class _ResourceFileEdit extends ResourceEdit {
  constructor(oldResource, newResource, options3 = {}, metadata) {
    super(metadata);
    this.oldResource = oldResource;
    this.newResource = newResource;
    this.options = options3;
  }
  static is(candidate) {
    if (candidate instanceof _ResourceFileEdit) {
      return true;
    } else {
      return isObject(candidate) && (Boolean(candidate.newResource) || Boolean(candidate.oldResource));
    }
  }
  static lift(edit3) {
    if (edit3 instanceof _ResourceFileEdit) {
      return edit3;
    } else {
      return new _ResourceFileEdit(edit3.oldResource, edit3.newResource, edit3.options, edit3.metadata);
    }
  }
};
export { IBulkEditService, ResourceEdit, ResourceTextEdit, ResourceFileEdit };
