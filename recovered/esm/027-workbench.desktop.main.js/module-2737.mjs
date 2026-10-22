// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/languageModelsConfigurationService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { IEditorService, MODAL_GROUP } from "./module-0934.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0925.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { visit } from "./module-0883.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { localize } from "./module-0001.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { ILanguageModelsConfigurationService } from "./module-0966.mjs";


// src/vs/workbench/contrib/chat/browser/languageModelsConfigurationService.ts
var LanguageModelsConfigurationService = class extends Disposable {
  constructor(fileService, textFileService, textModelService, editorService, editorGroupsService, userDataProfileService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.textFileService = textFileService;
    this.textModelService = textModelService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this._onDidChangeLanguageModelGroups = this._register(new Emitter());
    this.onDidChangeLanguageModelGroups = this._onDidChangeLanguageModelGroups.event;
    this.languageModelsProviderGroups = [];
    this.modelsConfigurationFile = userDataProfileService.currentProfile.languageModelsResource;
    this._whenReady = this.updateLanguageModelsConfiguration().catch(() => {
    });
    this._register(fileService.watch(uriIdentityService.extUri.dirname(this.modelsConfigurationFile)));
    this._register(fileService.onDidFilesChange((e) => {
      if (e.contains(this.modelsConfigurationFile)) {
        this.updateLanguageModelsConfiguration();
      }
    }));
  }
  get configurationFile() {
    return this.modelsConfigurationFile;
  }
  get whenReady() {
    return this._whenReady;
  }
  setLanguageModelsConfiguration(languageModelsConfiguration) {
    const changedGroups = [];
    const oldGroupMap = new Map(this.languageModelsProviderGroups.map((g) => [`${g.vendor}:${g.name}`, g]));
    const newGroupMap = new Map(languageModelsConfiguration.map((g) => [`${g.vendor}:${g.name}`, g]));
    for (const [key3, newGroup] of newGroupMap) {
      const oldGroup = oldGroupMap.get(key3);
      if (!oldGroup || !equals4(oldGroup, newGroup)) {
        changedGroups.push(newGroup);
      }
    }
    for (const [key3, oldGroup] of oldGroupMap) {
      if (!newGroupMap.has(key3)) {
        changedGroups.push(oldGroup);
      }
    }
    this.languageModelsProviderGroups = languageModelsConfiguration;
    if (changedGroups.length > 0) {
      this._onDidChangeLanguageModelGroups.fire(changedGroups);
    }
  }
  async updateLanguageModelsConfiguration() {
    const languageModelsProviderGroups = await this.withLanguageModelsProviderGroups();
    this.setLanguageModelsConfiguration(languageModelsProviderGroups);
  }
  getLanguageModelsProviderGroups() {
    return this.languageModelsProviderGroups;
  }
  async addLanguageModelsProviderGroup(toAdd) {
    await this.withLanguageModelsProviderGroups(async (languageModelsProviderGroups) => {
      if (languageModelsProviderGroups.some(({ name, vendor }) => name === toAdd.name && vendor === toAdd.vendor)) {
        throw new Error(`Language model group with name ${toAdd.name} already exists for vendor ${toAdd.vendor}`);
      }
      languageModelsProviderGroups.push(toAdd);
      return languageModelsProviderGroups;
    });
    await this.updateLanguageModelsConfiguration();
    const result = this.getLanguageModelsProviderGroups().find((group2) => group2.name === toAdd.name && group2.vendor === toAdd.vendor);
    if (!result) {
      throw new Error(`Language model group with name ${toAdd.name} not found for vendor ${toAdd.vendor}`);
    }
    return result;
  }
  async updateLanguageModelsProviderGroup(from, to) {
    await this.withLanguageModelsProviderGroups(async (languageModelsProviderGroups) => {
      const result2 = [];
      for (const group2 of languageModelsProviderGroups) {
        if (group2.name === from.name && group2.vendor === from.vendor) {
          result2.push(to);
        } else {
          result2.push(group2);
        }
      }
      return result2;
    });
    await this.updateLanguageModelsConfiguration();
    const result = this.getLanguageModelsProviderGroups().find((group2) => group2.name === to.name && group2.vendor === to.vendor);
    if (!result) {
      throw new Error(`Language model group with name ${to.name} not found for vendor ${to.vendor}`);
    }
    return result;
  }
  async removeLanguageModelsProviderGroup(toRemove) {
    await this.withLanguageModelsProviderGroups(async (languageModelsProviderGroups) => {
      const result = [];
      for (const group2 of languageModelsProviderGroups) {
        if (group2.name === toRemove.name && group2.vendor === toRemove.vendor) {
          continue;
        }
        result.push(group2);
      }
      return result;
    });
    await this.updateLanguageModelsConfiguration();
  }
  async configureLanguageModels(options3) {
    const preferredGroup = this.editorGroupsService.getPart(this.editorGroupsService.activeGroup) === this.editorGroupsService.activeModalEditorPart ? MODAL_GROUP : void 0;
    const editor = await this.editorService.openEditor({
      resource: this.modelsConfigurationFile,
      options: { override: DEFAULT_EDITOR_ASSOCIATION.id }
    }, preferredGroup);
    if (!editor || !options3?.group) {
      return;
    }
    const codeEditor = getCodeEditor(editor.getControl());
    if (!codeEditor) {
      return;
    }
    if (options3.snippet) {
      const model = codeEditor.getModel();
      if (!model) {
        return;
      }
      const targetRange = options3.snippetTarget === "models" ? options3.group.modelsRange : options3.group.range;
      if (!targetRange) {
        return;
      }
      const models = options3.group.models;
      const isModelsArray = options3.snippetTarget === "models" && Array.isArray(models);
      const emptyModelsArray = isModelsArray && models.length === 0;
      const insertBeforeModelsArrayEnd = emptyModelsArray || isModelsArray && targetRange.startLineNumber === targetRange.endLineNumber;
      const lastPropertyLine = targetRange.endLineNumber - 1;
      const insertPosition = insertBeforeModelsArrayEnd ? {
        lineNumber: targetRange.endLineNumber,
        column: targetRange.endColumn - 1
      } : {
        lineNumber: lastPropertyLine,
        column: model.getLineLength(lastPropertyLine) + 1
      };
      codeEditor.setPosition(insertPosition);
      codeEditor.revealPositionNearTop(insertPosition);
      codeEditor.focus();
      SnippetController2.get(codeEditor)?.insert(emptyModelsArray ? options3.snippet : ",\n" + options3.snippet);
    } else {
      if (!options3.group.range) {
        return;
      }
      const position2 = { lineNumber: options3.group.range.startLineNumber, column: options3.group.range.startColumn };
      codeEditor.setPosition(position2);
      codeEditor.revealPositionNearTop(position2);
      codeEditor.focus();
    }
  }
  async withLanguageModelsProviderGroups(update) {
    const exists = await this.fileService.exists(this.modelsConfigurationFile);
    if (!exists) {
      await this.fileService.writeFile(this.modelsConfigurationFile, VSBuffer.fromString(JSON.stringify([], void 0, "	")));
    }
    const ref = await this.textModelService.createModelReference(this.modelsConfigurationFile);
    const model = ref.object.textEditorModel;
    try {
      const languageModelsProviderGroups = parseLanguageModelsProviderGroups(model);
      if (!update) {
        return languageModelsProviderGroups;
      }
      const updatedLanguageModelsProviderGroups = await update(languageModelsProviderGroups);
      for (const group2 of updatedLanguageModelsProviderGroups) {
        delete group2.range;
        delete group2.modelsRange;
      }
      model.setValue(JSON.stringify(updatedLanguageModelsProviderGroups, void 0, "	"));
      await this.textFileService.save(this.modelsConfigurationFile);
      return updatedLanguageModelsProviderGroups;
    } finally {
      ref.dispose();
    }
  }
};

LanguageModelsConfigurationService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IUserDataProfileService),
  __decorateParam(6, IUriIdentityService)
], LanguageModelsConfigurationService);

function parseLanguageModelsProviderGroups(model) {
  const configuration2 = [];
  let currentProperty = null;
  let currentParent = configuration2;
  const previousParents = [];
  function onValue(value2, offset, length) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value2);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value2;
    }
  }
  const visitor = {
    onObjectBegin: (offset, length) => {
      const object2 = {};
      if (previousParents.length === 1 && Array.isArray(currentParent)) {
        const start = model.getPositionAt(offset);
        const end = model.getPositionAt(offset + length);
        object2.range = {
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column
        };
      }
      onValue(object2, offset, length);
      previousParents.push(currentParent);
      currentParent = object2;
      currentProperty = null;
    },
    onObjectProperty: (name, offset, length) => {
      currentProperty = name;
    },
    onObjectEnd: (offset, length) => {
      const parent = currentParent;
      if (parent.range) {
        const end = model.getPositionAt(offset + length);
        parent.range = {
          startLineNumber: parent.range.startLineNumber,
          startColumn: parent.range.startColumn,
          endLineNumber: end.lineNumber,
          endColumn: end.column
        };
      }
      if (parent._parentConfigurationRange) {
        const end = model.getPositionAt(offset + length);
        parent._parentConfigurationRange.endLineNumber = end.lineNumber;
        parent._parentConfigurationRange.endColumn = end.column;
        delete parent._parentConfigurationRange;
      }
      currentParent = previousParents.pop();
    },
    onArrayBegin: (offset, length) => {
      if (currentParent === configuration2 && previousParents.length === 0) {
        previousParents.push(currentParent);
        currentProperty = null;
        return;
      }
      const array3 = [];
      const parent = currentParent;
      if (currentProperty === "models" && parent.range) {
        const start = model.getPositionAt(offset);
        const end = model.getPositionAt(offset + length);
        parent.modelsRange = {
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column
        };
        array3._parentModelsRange = parent.modelsRange;
      }
      onValue(array3, offset, length);
      previousParents.push(currentParent);
      currentParent = array3;
      currentProperty = null;
    },
    onArrayEnd: (offset, length) => {
      const parent = currentParent;
      if (parent._parentConfigurationRange) {
        const end = model.getPositionAt(offset + length);
        parent._parentConfigurationRange.endLineNumber = end.lineNumber;
        parent._parentConfigurationRange.endColumn = end.column;
        delete parent._parentConfigurationRange;
      }
      if (parent._parentModelsRange) {
        const end = model.getPositionAt(offset + length);
        parent._parentModelsRange.endLineNumber = end.lineNumber;
        parent._parentModelsRange.endColumn = end.column;
        delete parent._parentModelsRange;
      }
      currentParent = previousParents.pop();
    },
    onLiteralValue: (value2, offset, length) => {
      onValue(value2, offset, length);
    }
  };
  visit(model.getValue(), visitor);
  return configuration2;
}

var languageModelsSchemaId = "vscode://schemas/language-models";

var ChatLanguageModelsDataContribution = class extends Disposable {
  constructor(languageModelsService, languageModelsConfigurationService) {
    super();
    this.languageModelsService = languageModelsService;
    const registry4 = Registry.as(Extensions3.JSONContribution);
    this._register(registry4.registerSchemaAssociation(languageModelsSchemaId, languageModelsConfigurationService.configurationFile.toString()));
    this.updateSchema(registry4);
    this._register(this.languageModelsService.onDidChangeLanguageModels(() => this.updateSchema(registry4)));
  }
  static {
    this.ID = "workbench.contrib.chatLanguageModelsData";
  }
  updateSchema(registry4) {
    const vendors = this.languageModelsService.getVendors();
    const modelSchemas = [];
    const modelIds = this.languageModelsService.getLanguageModelIds();
    for (const modelId of modelIds) {
      const metadata = this.languageModelsService.lookupLanguageModel(modelId);
      if (metadata?.configurationSchema) {
        modelSchemas.push({
          if: {
            properties: {
              vendor: { const: metadata.vendor }
            }
          },
          then: {
            properties: {
              settings: {
                type: "object",
                properties: {
                  [metadata.id]: metadata.configurationSchema
                }
              }
            }
          }
        });
      }
    }
    const schema10 = {
      type: "array",
      items: {
        properties: {
          vendor: {
            type: "string",
            enum: vendors.map((v2) => v2.vendor)
          },
          name: { type: "string" },
          settings: {
            type: "object",
            description: localize(11342, null)
          }
        },
        allOf: [
          ...vendors.map((vendor) => ({
            if: {
              properties: {
                vendor: { const: vendor.vendor }
              }
            },
            then: vendor.configuration
          })),
          ...modelSchemas
        ],
        required: ["vendor", "name"]
      }
    };
    registry4.registerSchema(languageModelsSchemaId, schema10);
  }
};

ChatLanguageModelsDataContribution = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILanguageModelsConfigurationService)
], ChatLanguageModelsDataContribution);
export { parseLanguageModelsProviderGroups, LanguageModelsConfigurationService, languageModelsSchemaId, ChatLanguageModelsDataContribution };
