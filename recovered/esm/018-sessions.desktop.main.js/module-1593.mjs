// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/common/jsonEditingService.ts
import { Queue } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Selection } from "./module-0107.mjs";
import { setProperty } from "./module-1377.mjs";
import { parse5 } from "./module-0885.mjs";
import { IJSONEditingService, JSONEditingError } from "./module-1584.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/configuration/common/jsonEditingService.ts
var JSONEditingService = class {
  constructor(fileService, textModelResolverService, textFileService, filesConfigurationService) {
    this.fileService = fileService;
    this.textModelResolverService = textModelResolverService;
    this.textFileService = textFileService;
    this.filesConfigurationService = filesConfigurationService;
    this.queue = new Queue();
  }
  write(resource, values) {
    return Promise.resolve(this.queue.queue(() => this.doWriteConfiguration(resource, values)));
  }
  async doWriteConfiguration(resource, values) {
    const reference = await this.resolveAndValidate(resource, true);
    try {
      await this.writeToBuffer(reference.object.textEditorModel, values);
    } finally {
      reference.dispose();
    }
  }
  async writeToBuffer(model, values) {
    let disposable;
    try {
      disposable = this.filesConfigurationService.enableAutoSaveAfterShortDelay(model.uri);
      let hasEdits = false;
      for (const value2 of values) {
        const edit3 = this.getEdits(model, value2)[0];
        hasEdits = !!edit3 && this.applyEditsToBuffer(edit3, model) || hasEdits;
      }
      if (hasEdits) {
        return this.textFileService.save(model.uri);
      }
    } finally {
      disposable?.dispose();
    }
    return void 0;
  }
  applyEditsToBuffer(edit3, model) {
    const startPosition = model.getPositionAt(edit3.offset);
    const endPosition = model.getPositionAt(edit3.offset + edit3.length);
    const range2 = new Range2(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    const currentText = model.getValueInRange(range2);
    if (edit3.content !== currentText) {
      const editOperation = currentText ? EditOperation.replace(range2, edit3.content) : EditOperation.insert(startPosition, edit3.content);
      model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
      return true;
    }
    return false;
  }
  getEdits(model, configurationValue) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const { path, value: value2 } = configurationValue;
    if (!path.length) {
      const content = JSON.stringify(value2, null, insertSpaces ? " ".repeat(tabSize) : "	");
      return [{
        content,
        length: content.length,
        offset: 0
      }];
    }
    return setProperty(model.getValue(), path, value2, { tabSize, insertSpaces, eol });
  }
  async resolveModelReference(resource) {
    const exists = await this.fileService.exists(resource);
    if (!exists) {
      await this.textFileService.write(resource, "{}", { encoding: "utf8" });
    }
    return this.textModelResolverService.createModelReference(resource);
  }
  hasParseErrors(model) {
    const parseErrors = [];
    parse5(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    return parseErrors.length > 0;
  }
  async resolveAndValidate(resource, checkDirty) {
    const reference = await this.resolveModelReference(resource);
    const model = reference.object.textEditorModel;
    if (this.hasParseErrors(model)) {
      reference.dispose();
      return this.reject(0 /* ERROR_INVALID_FILE */);
    }
    return reference;
  }
  reject(code) {
    const message = this.toErrorMessage(code);
    return Promise.reject(new JSONEditingError(message, code));
  }
  toErrorMessage(error) {
    switch (error) {
      // User issues
      case 0 /* ERROR_INVALID_FILE */: {
        return localize(22814, null);
      }
    }
  }
};

JSONEditingService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITextModelService),
  __decorateParam(2, ITextFileService),
  __decorateParam(3, IFilesConfigurationService)
], JSONEditingService);

registerSingleton(IJSONEditingService, JSONEditingService, 1 /* Delayed */);
export { JSONEditingService };
