// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/toolSetsContribution.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon, getAllCodicons } from "./module-0085.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { basename2, joinPath } from "./module-0034.mjs";
import { assertType, isObject } from "./module-0010.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { isFalsyOrEmpty } from "./module-0007.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { ILanguageModelToolsService, ToolAndToolSetEnablementMap, ToolDataSource, isToolSet } from "./module-0991.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { parse12 } from "./module-2175.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { Iterable } from "./module-0011.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0982.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { isValidBasename } from "./module-0031.mjs";


// src/vs/workbench/contrib/chat/browser/tools/toolSetsContribution.ts
var toolEnumValues = [];

var toolEnumDescriptions = [];

var toolSetSchemaId = "vscode://schemas/toolsets";

var toolSetsSchema = {
  id: toolSetSchemaId,
  allowComments: true,
  allowTrailingCommas: true,
  defaultSnippets: [{
    label: localize(11750, null),
    body: { "${1:toolSetName}": { "tools": ["${2:someTool}", "${3:anotherTool}"], "description": "${4:description}", "icon": "${5:tools}" } }
  }],
  type: "object",
  description: localize(11757, null),
  additionalProperties: {
    type: "object",
    required: ["tools"],
    additionalProperties: false,
    properties: {
      tools: {
        description: localize(11753, null),
        type: "array",
        minItems: 1,
        items: {
          type: "string",
          enum: toolEnumValues,
          enumDescriptions: toolEnumDescriptions
        }
      },
      icon: {
        description: localize(11752, null),
        type: "string",
        enum: Array.from(getAllCodicons(), (icon2) => icon2.id),
        markdownEnumDescriptions: Array.from(getAllCodicons(), (icon2) => `$(${icon2.id})`)
      },
      description: {
        description: localize(11751, null),
        type: "string"
      }
    }
  }
};

var reg = Registry.as(Extensions3.JSONContribution);

var RawToolSetsShape = class _RawToolSetsShape {
  static {
    this.suffix = ".toolsets.jsonc";
  }
  static isToolSetFileName(uri4) {
    return basename2(uri4).endsWith(_RawToolSetsShape.suffix);
  }
  static from(data, logService) {
    if (!isObject(data)) {
      throw new Error(`Invalid tool set data`);
    }
    const map = /* @__PURE__ */ new Map();
    for (const [name, value2] of Object.entries(data)) {
      if (isFalsyOrWhitespace(name)) {
        logService.error(`Tool set name cannot be empty`);
      }
      if (isFalsyOrEmpty(value2.tools)) {
        logService.error(`Tool set '${name}' cannot have an empty tools array`);
      }
      map.set(name, {
        name,
        tools: value2.tools,
        description: value2.description,
        icon: value2.icon
      });
    }
    return new class extends _RawToolSetsShape {
    }(map);
  }
  constructor(entries2) {
    this.entries = Object.freeze(new Map(entries2));
  }
};

var UserToolSetsContributions = class extends Disposable {
  constructor(extensionService, lifecycleService, _languageModelToolsService, _userDataProfileService, _fileService, _logService) {
    super();
    this._languageModelToolsService = _languageModelToolsService;
    this._userDataProfileService = _userDataProfileService;
    this._fileService = _fileService;
    this._logService = _logService;
    Promise.allSettled([
      extensionService.whenInstalledExtensionsRegistered,
      lifecycleService.when(3 /* Restored */)
    ]).then(() => this._initToolSets());
    const toolsObs = observableFromEvent(this, _languageModelToolsService.onDidChangeTools, () => Array.from(_languageModelToolsService.getAllToolsIncludingDisabled()));
    const store = this._store.add(new DisposableStore());
    this._store.add(autorun((r2) => {
      const tools = toolsObs.read(r2);
      const toolSets = this._languageModelToolsService.toolSets.read(r2);
      const data = [];
      for (const tool of tools) {
        if (tool.canBeReferencedInPrompt) {
          data.push({
            name: this._languageModelToolsService.getFullReferenceName(tool),
            sourceLabel: ToolDataSource.classify(tool.source).label,
            sourceOrdinal: ToolDataSource.classify(tool.source).ordinal,
            description: tool.userDescription ?? tool.modelDescription
          });
        }
      }
      for (const toolSet of toolSets) {
        data.push({
          name: this._languageModelToolsService.getFullReferenceName(toolSet),
          sourceLabel: ToolDataSource.classify(toolSet.source).label,
          sourceOrdinal: ToolDataSource.classify(toolSet.source).ordinal,
          description: toolSet.description
        });
      }
      toolEnumValues.length = 0;
      toolEnumDescriptions.length = 0;
      data.sort((a, b) => {
        if (a.sourceOrdinal !== b.sourceOrdinal) {
          return a.sourceOrdinal - b.sourceOrdinal;
        }
        if (a.sourceLabel !== b.sourceLabel) {
          return a.sourceLabel.localeCompare(b.sourceLabel);
        }
        return a.name.localeCompare(b.name);
      });
      for (const item of data) {
        toolEnumValues.push(item.name);
        toolEnumDescriptions.push(localize(11754, null, item.sourceLabel, item.name, item.description));
      }
      store.clear();
      reg.registerSchema(toolSetSchemaId, toolSetsSchema, store);
    }));
  }
  static {
    this.ID = "chat.userToolSets";
  }
  _initToolSets() {
    const promptFolder = observableFromEvent(this, this._userDataProfileService.onDidChangeCurrentProfile, () => this._userDataProfileService.currentProfile.promptsHome);
    const toolsSig = observableSignalFromEvent(this, this._languageModelToolsService.onDidChangeTools);
    const fileEventSig = observableSignalFromEvent(this, Event2.filter(this._fileService.onDidFilesChange, (e4) => e4.affects(promptFolder.get())));
    const store = this._store.add(new DisposableStore());
    const getFilesInFolder = async (folder) => {
      try {
        return (await this._fileService.resolve(folder)).children ?? [];
      } catch (err) {
        return [];
      }
    };
    this._store.add(autorun(async (r2) => {
      store.clear();
      toolsSig.read(r2);
      fileEventSig.read(r2);
      const uri4 = promptFolder.read(r2);
      const cts = new CancellationTokenSource();
      store.add(toDisposable(() => cts.dispose(true)));
      const entries2 = await getFilesInFolder(uri4);
      if (cts.token.isCancellationRequested) {
        return;
      }
      for (const entry of entries2) {
        if (!entry.isFile || !RawToolSetsShape.isToolSetFileName(entry.resource)) {
          continue;
        }
        store.add(this._fileService.watch(entry.resource));
        let data;
        try {
          const content = await this._fileService.readFile(entry.resource, void 0, cts.token);
          const rawObj = parse12(content.value.toString());
          data = RawToolSetsShape.from(rawObj, this._logService);
        } catch (err) {
          this._logService.error(`Error reading tool set file ${entry.resource.toString()}:`, err);
          continue;
        }
        if (cts.token.isCancellationRequested) {
          return;
        }
        for (const [name, value2] of data.entries) {
          const tools = [];
          const toolSets = [];
          value2.tools.forEach((name2) => {
            const toolOrToolSet = this._languageModelToolsService.getToolByFullReferenceName(name2);
            if (isToolSet(toolOrToolSet)) {
              toolSets.push(toolOrToolSet);
              return;
            } else if (toolOrToolSet) {
              tools.push(toolOrToolSet);
              return;
            }
            const tool = this._languageModelToolsService.getToolByName(name2);
            if (tool) {
              tools.push(tool);
              return;
            }
            const toolSet = this._languageModelToolsService.getToolSetByName(name2);
            if (toolSet) {
              toolSets.push(toolSet);
              return;
            }
          });
          if (tools.length === 0 && toolSets.length === 0) {
            continue;
          }
          const toolset = this._languageModelToolsService.createToolSet(
            { type: "user", file: entry.resource, label: basename2(entry.resource) },
            `user/${entry.resource.toString()}/${name}`,
            name,
            {
              // toolReferenceName: value.referenceName,
              icon: value2.icon ? ThemeIcon.fromId(value2.icon) : void 0,
              description: value2.description,
              deprecated: true
            }
          );
          transaction((tx) => {
            store.add(toolset);
            tools.forEach((tool) => store.add(toolset.addTool(tool, tx)));
            toolSets.forEach((toolSet) => store.add(toolset.addToolSet(toolSet, tx)));
          });
        }
      }
    }));
  }
};

UserToolSetsContributions = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, ILanguageModelToolsService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IFileService),
  __decorateParam(5, ILogService)
], UserToolSetsContributions);

function getSelectionFromArg(arg) {
  if (!isObject(arg)) {
    return void 0;
  }
  const selection = arg.selection;
  if (!(selection instanceof ToolAndToolSetEnablementMap)) {
    return void 0;
  }
  return selection;
}

function getEnabledSelectionReferences(selection, toolsService) {
  const enabledToolSets = [];
  const enabledTools = [];
  for (const [item, enabled] of selection) {
    if (!enabled) {
      continue;
    }
    if (isToolSet(item)) {
      if (Iterable.every(item.getTools(), (tool) => selection.get(tool) !== false)) {
        enabledToolSets.push(item);
      }
    } else {
      enabledTools.push(item);
    }
  }
  const coveredToolIds = /* @__PURE__ */ new Set();
  for (const toolSet of enabledToolSets) {
    for (const tool of toolSet.getTools()) {
      coveredToolIds.add(tool.id);
    }
  }
  const references = [];
  const seen = /* @__PURE__ */ new Set();
  const addReference = (referenceName) => {
    if (seen.has(referenceName)) {
      return;
    }
    seen.add(referenceName);
    references.push(referenceName);
  };
  for (const toolSet of enabledToolSets) {
    addReference(toolsService.getFullReferenceName(toolSet));
  }
  for (const tool of enabledTools) {
    if (coveredToolIds.has(tool.id)) {
      continue;
    }
    const referenceName = toolsService.getFullReferenceName(tool);
    if (toolsService.getToolByFullReferenceName(referenceName) !== tool) {
      continue;
    }
    addReference(referenceName);
  }
  return references;
}

function createToolSetFileContents(toolSetName, toolReferences) {
  const serializedReferences = toolReferences.map((reference) => `			${JSON.stringify(reference)}`).join(",\n");
  return [
    "{",
    `	${JSON.stringify(toolSetName)}: {`,
    '		"tools": [',
    serializedReferences,
    "		],",
    '		"description": "",',
    '		"icon": "tools"',
    "	}",
    "}"
  ].join("\n");
}

function deleteToolSetFromFileContents(rawContents, toolSetName) {
  const parsed = parse12(rawContents);
  if (!isObject(parsed)) {
    return void 0;
  }
  const record = parsed;
  if (!Object.hasOwn(record, toolSetName)) {
    return void 0;
  }
  delete record[toolSetName];
  return { contents: JSON.stringify(record, void 0, "	"), isEmpty: Object.keys(record).length === 0 };
}

var ConfigureToolSets = class _ConfigureToolSets extends Action2 {
  static {
    this.ID = "chat.configureToolSets";
  }
  constructor() {
    super({
      id: _ConfigureToolSets.ID,
      title: localize2(11743, "Configure Tool Sets..."),
      shortTitle: localize(11748, null),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.Tools.toolsCount.greater(0)),
      menu: [{
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
        order: 11,
        group: "2_level"
      }]
    });
  }
  async run(accessor, options3) {
    const toolsService = accessor.get(ILanguageModelToolsService);
    const quickInputService = accessor.get(IQuickInputService);
    const editorService = accessor.get(IEditorService);
    const userDataProfileService = accessor.get(IUserDataProfileService);
    const fileService = accessor.get(IFileService);
    const textFileService = accessor.get(ITextFileService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const picks = [];
    const currentSelection = getSelectionFromArg(options3) ?? chatWidgetService.lastFocusedWidget?.input.selectedToolsModel.entriesMap.get() ?? ToolAndToolSetEnablementMap.fromEntries([]);
    const selectedReferences = getEnabledSelectionReferences(currentSelection, toolsService);
    if (selectedReferences.length > 0) {
      picks.push({
        label: localize(11745, null),
        kind: "createFromSelection",
        alwaysShow: true,
        iconClass: ThemeIcon.asClassName(Codicon.plus)
      });
    }
    picks.push({
      label: localize(11744, null),
      kind: "createNewFile",
      alwaysShow: true,
      iconClass: ThemeIcon.asClassName(Codicon.plus)
    });
    for (const toolSet of toolsService.toolSets.get()) {
      if (toolSet.source.type !== "user") {
        continue;
      }
      picks.push({
        label: toolSet.referenceName,
        kind: "existing",
        toolset: toolSet,
        tooltip: toolSet.description,
        iconClass: ThemeIcon.asClassName(toolSet.icon)
      });
    }
    const pick = await quickInputService.pick(picks, {
      canPickMany: false,
      placeHolder: localize(11747, null)
    });
    if (!pick) {
      return;
    }
    let resource;
    if (!pick.toolset) {
      const name = await quickInputService.input({
        placeHolder: localize(11749, null),
        validateInput: async (input) => {
          if (!input) {
            return localize(11741, null);
          }
          if (!isValidBasename(input)) {
            return localize(11742, null, input);
          }
          if (pick.kind === "createFromSelection") {
            const candidate = joinPath(userDataProfileService.currentProfile.promptsHome, `${input}${RawToolSetsShape.suffix}`);
            if (await fileService.exists(candidate)) {
              return localize(11746, null);
            }
          }
          return void 0;
        }
      });
      if (isFalsyOrWhitespace(name)) {
        return;
      }
      resource = joinPath(userDataProfileService.currentProfile.promptsHome, `${name}${RawToolSetsShape.suffix}`);
      if (pick.kind === "createFromSelection") {
        const toolSetName = await quickInputService.input({
          placeHolder: localize(11756, null),
          validateInput: async (input) => {
            if (isFalsyOrWhitespace(input)) {
              return localize(11755, null);
            }
            return void 0;
          }
        });
        if (!toolSetName || isFalsyOrWhitespace(toolSetName)) {
          return;
        }
        await textFileService.write(resource, createToolSetFileContents(toolSetName, selectedReferences));
      } else if (!await fileService.exists(resource)) {
        await textFileService.write(resource, [
          "// Place your tool sets here...",
          "// Example:",
          "// {",
          '// 	"toolSetName": {',
          '// 		"tools": [',
          '// 			"someTool",',
          '// 			"anotherTool"',
          "// 		],",
          '// 		"description": "description",',
          '// 		"icon": "tools"',
          "// 	}",
          "// }"
        ].join("\n"));
      }
    } else {
      assertType(pick.toolset.source.type === "user");
      resource = pick.toolset.source.file;
    }
    await editorService.openEditor({ resource, options: { pinned: true } });
  }
};
export { getSelectionFromArg, getEnabledSelectionReferences, createToolSetFileContents, deleteToolSetFromFileContents, toolEnumValues, toolEnumDescriptions, toolSetSchemaId, toolSetsSchema, reg, RawToolSetsShape, UserToolSetsContributions, ConfigureToolSets };
