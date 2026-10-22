// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/files.contribution.ts
import { Schemas } from "./module-0033.mjs";
import { sep } from "./module-0026.mjs";
import { isNative, isWeb, isWindows } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IExplorerService } from "./module-1997.mjs";
import { ExplorerService, UNDO_REDO_SOURCE } from "./module-2925.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { TextFileEditor } from "./module-2929.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { FileEditorInput } from "./module-2000.mjs";
import { BinaryFileEditor } from "./module-2923.mjs";
import { BINARY_TEXT_FILE_MODE, FILE_EDITOR_INPUT_ID } from "./module-1534.mjs";
import { FileEditorInputSerializer, FileEditorWorkingCopyEditorHandler } from "./module-2928.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { ExplorerViewletViewsContribution } from "./module-2921.mjs";
import { TextFileEditorTracker } from "./module-2922.mjs";
import { TextFileSaveErrorHandler } from "./module-2001.mjs";
import { WorkspaceWatcher } from "./module-2926.mjs";
import { DirtyFilesIndicator } from "./module-2927.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { AutoSaveConfiguration, FILES_ASSOCIATIONS_CONFIG, FILES_EXCLUDE_CONFIG, FILES_READONLY_EXCLUDE_CONFIG, FILES_READONLY_FROM_PERMISSIONS_CONFIG, FILES_READONLY_INCLUDE_CONFIG, HotExitConfiguration } from "./module-0269.mjs";
import { GUESSABLE_ENCODINGS, SUPPORTED_ENCODINGS } from "./module-1124.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { RedoCommand, UndoCommand } from "./module-0097.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ModesRegistry } from "./module-0141.mjs";


// src/vs/workbench/contrib/files/browser/files.contribution.ts
var FileUriLabelContribution = class {
  static {
    this.ID = "workbench.contrib.fileUriLabel";
  }
  constructor(labelService) {
    labelService.registerFormatter({
      scheme: Schemas.file,
      formatting: {
        label: "${authority}${path}",
        separator: sep,
        tildify: !isWindows,
        normalizeDriveLetter: isWindows,
        authorityPrefix: sep + sep,
        workspaceSuffix: ""
      }
    });
  }
};

FileUriLabelContribution = __decorateClass([
  __decorateParam(0, ILabelService)
], FileUriLabelContribution);

registerSingleton(IExplorerService, ExplorerService, 1 /* Delayed */);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    TextFileEditor,
    TextFileEditor.ID,
    localize(15992, null)
  ),
  [
    new SyncDescriptor(FileEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    BinaryFileEditor,
    BinaryFileEditor.ID,
    localize(15902, null)
  ),
  [
    new SyncDescriptor(FileEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorFactory).registerFileEditorFactory({
  typeId: FILE_EDITOR_INPUT_ID,
  createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
    return instantiationService.createInstance(FileEditorInput, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents);
  },
  isFileEditor: (obj) => {
    return obj instanceof FileEditorInput;
  }
});

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(FILE_EDITOR_INPUT_ID, FileEditorInputSerializer);

registerWorkbenchContribution2(FileEditorWorkingCopyEditorHandler.ID, FileEditorWorkingCopyEditorHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ExplorerViewletViewsContribution.ID, ExplorerViewletViewsContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(TextFileEditorTracker.ID, TextFileEditorTracker, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(TextFileSaveErrorHandler.ID, TextFileSaveErrorHandler, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(FileUriLabelContribution.ID, FileUriLabelContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(WorkspaceWatcher.ID, WorkspaceWatcher, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(DirtyFilesIndicator.ID, DirtyFilesIndicator, WorkbenchPhase.BlockStartup);

var configurationRegistry15 = Registry.as(Extensions4.Configuration);

var hotExitConfiguration = isNative ? {
  "type": "string",
  "scope": 1 /* APPLICATION */,
  "enum": [HotExitConfiguration.OFF, HotExitConfiguration.ON_EXIT, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
  "default": HotExitConfiguration.ON_EXIT,
  "markdownEnumDescriptions": [
    localize(15963, null),
    localize(15964, null),
    localize(15965, null)
  ],
  "markdownDescription": localize(15962, null, HotExitConfiguration.ON_EXIT, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
} : {
  "type": "string",
  "scope": 1 /* APPLICATION */,
  "enum": [HotExitConfiguration.OFF, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
  "default": HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE,
  "markdownEnumDescriptions": [
    localize(15963, null),
    localize(15966, null)
  ],
  "markdownDescription": localize(15962, null, HotExitConfiguration.ON_EXIT, HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
};

configurationRegistry15.registerConfiguration({
  "id": "files",
  "order": 9,
  "title": localize(15956, null),
  "type": "object",
  "properties": {
    [FILES_EXCLUDE_CONFIG]: {
      "type": "object",
      "markdownDescription": localize(15931, null),
      "default": {
        ...{ "**/.git": true, "**/.svn": true, "**/.hg": true, "**/.DS_Store": true, "**/Thumbs.db": true },
        ...isWeb ? {
          "**/*.crswap": true
          /* filter out swap files used for local file access */
        } : void 0
      },
      "scope": 5 /* RESOURCE */,
      "additionalProperties": {
        "anyOf": [
          {
            "type": "boolean",
            "enum": [true, false],
            "enumDescriptions": [localize(15996, null), localize(15940, null)],
            "description": localize(15950, null)
          },
          {
            "type": "object",
            "properties": {
              "when": {
                "type": "string",
                // expression ({ "**/*.js": { "when": "$(basename).js" } })
                "pattern": "\\w*\\$\\(basename\\)\\w*",
                "default": "$(basename).ext",
                "markdownDescription": localize(15951, null)
              }
            }
          }
        ]
      }
    },
    [FILES_ASSOCIATIONS_CONFIG]: {
      "type": "object",
      "markdownDescription": localize(15890, null),
      "additionalProperties": {
        "type": "string"
      }
    },
    "files.encoding": {
      "type": "string",
      "enum": Object.keys(SUPPORTED_ENCODINGS),
      "default": "utf8",
      "description": localize(15925, null),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */,
      "enumDescriptions": Object.keys(SUPPORTED_ENCODINGS).map((key3) => SUPPORTED_ENCODINGS[key3].labelLong),
      "enumItemLabels": Object.keys(SUPPORTED_ENCODINGS).map((key3) => SUPPORTED_ENCODINGS[key3].labelLong)
    },
    "files.autoGuessEncoding": {
      "type": "boolean",
      "default": false,
      "markdownDescription": localize(15891, null, "`#files.encoding#`"),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.candidateGuessEncodings": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": Object.keys(GUESSABLE_ENCODINGS),
        "enumDescriptions": Object.keys(GUESSABLE_ENCODINGS).map((key3) => GUESSABLE_ENCODINGS[key3].labelLong)
      },
      "default": [],
      "markdownDescription": localize(15903, null, "`#files.encoding#`"),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.eol": {
      "type": "string",
      "enum": [
        "\n",
        "\r\n",
        "auto"
      ],
      "enumDescriptions": [
        localize(15929, null),
        localize(15928, null),
        localize(15927, null)
      ],
      "default": "auto",
      "description": localize(15926, null),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.enableTrash": {
      "type": "boolean",
      "default": true,
      "description": localize(15997, null)
    },
    "files.trimTrailingWhitespace": {
      "type": "boolean",
      "default": false,
      "description": localize(15994, null),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.trimTrailingWhitespaceInRegexAndStrings": {
      "type": "boolean",
      "default": true,
      "description": localize(15995, null),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.insertFinalNewline": {
      "type": "boolean",
      "default": false,
      "description": localize(15967, null),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.trimFinalNewlines": {
      "type": "boolean",
      "default": false,
      "description": localize(15993, null),
      scope: 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.autoSave": {
      "type": "string",
      "enum": [AutoSaveConfiguration.OFF, AutoSaveConfiguration.AFTER_DELAY, AutoSaveConfiguration.ON_FOCUS_CHANGE, AutoSaveConfiguration.ON_WINDOW_CHANGE],
      "markdownEnumDescriptions": [
        localize(15947, null),
        localize(15946, null),
        localize(15948, null),
        localize(15949, null)
      ],
      "default": isWeb ? AutoSaveConfiguration.AFTER_DELAY : AutoSaveConfiguration.OFF,
      "markdownDescription": localize(15898, null, AutoSaveConfiguration.OFF, AutoSaveConfiguration.AFTER_DELAY, AutoSaveConfiguration.ON_FOCUS_CHANGE, AutoSaveConfiguration.ON_WINDOW_CHANGE, AutoSaveConfiguration.AFTER_DELAY),
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      agentsWindow: { default: "afterDelay" }
    },
    "files.autoSaveDelay": {
      "type": "number",
      "default": 1e3,
      "minimum": 0,
      "markdownDescription": localize(15899, null, AutoSaveConfiguration.AFTER_DELAY),
      scope: 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.autoSaveWorkspaceFilesOnly": {
      "type": "boolean",
      "default": false,
      "markdownDescription": localize(15901, null, "`#files.autoSave#`"),
      scope: 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.autoSaveWhenNoErrors": {
      "type": "boolean",
      "default": false,
      "markdownDescription": localize(15900, null, "`#files.autoSave#`"),
      scope: 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.watcherExclude": {
      "type": "object",
      "patternProperties": {
        ".*": { "type": "boolean" }
      },
      "default": {
        // Avoiding a '**' pattern here which results in a very complex
        // RegExp that can slow things down significantly in large workspaces
        ".git/objects/**": true,
        ".git/subtree-cache/**": true,
        ".hg/store/**": true,
        "*/.git/objects/**": true,
        "*/.git/subtree-cache/**": true,
        "*/.hg/store/**": true
      },
      "markdownDescription": localize(15998, null),
      "scope": 5 /* RESOURCE */
    },
    "files.watcherInclude": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": [],
      "description": localize(15999, null),
      "scope": 5 /* RESOURCE */
    },
    "files.hotExit": hotExitConfiguration,
    "files.defaultLanguage": {
      "type": "string",
      "markdownDescription": localize(15917, null)
    },
    [FILES_READONLY_INCLUDE_CONFIG]: {
      "type": "object",
      "patternProperties": {
        ".*": { "type": "boolean" }
      },
      "default": {},
      "markdownDescription": localize(15959, null),
      "scope": 5 /* RESOURCE */
    },
    [FILES_READONLY_EXCLUDE_CONFIG]: {
      "type": "object",
      "patternProperties": {
        ".*": { "type": "boolean" }
      },
      "default": {},
      "markdownDescription": localize(15957, null),
      "scope": 5 /* RESOURCE */
    },
    [FILES_READONLY_FROM_PERMISSIONS_CONFIG]: {
      "type": "boolean",
      "markdownDescription": localize(15958, null),
      "default": false
    },
    "files.restoreUndoStack": {
      "type": "boolean",
      "description": localize(15953, null),
      "default": true
    },
    "files.saveConflictResolution": {
      "type": "string",
      "enum": [
        "askUser",
        "overwriteFileOnDisk"
      ],
      "enumDescriptions": [
        localize(15889, null),
        localize(15973, null)
      ],
      "description": localize(15954, null),
      "default": "askUser",
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "files.dialog.defaultPath": {
      "type": "string",
      "pattern": "^((\\/|\\\\\\\\|[a-zA-Z]:\\\\).*)?$",
      // slash OR UNC-root OR drive-root OR undefined
      "patternErrorMessage": localize(15918, null),
      "description": localize(15941, null),
      "scope": 2 /* MACHINE */
    },
    "files.simpleDialog.enable": {
      "type": "boolean",
      "description": localize(15955, null),
      "default": false
    },
    "files.participants.timeout": {
      type: "number",
      default: 6e4,
      markdownDescription: localize(15952, null)
    }
  }
});

configurationRegistry15.registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.formatOnSave": {
      "type": "boolean",
      "markdownDescription": localize(15960, null, "`#files.autoSave#`"),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    },
    "editor.formatOnSaveMode": {
      "type": "string",
      "default": "file",
      "enum": [
        "file",
        "modifications",
        "modificationsIfAvailable"
      ],
      "enumDescriptions": [
        localize(15930, null),
        localize(15968, null),
        localize(15969, null)
      ],
      "markdownDescription": localize(15961, null),
      "scope": 6 /* LANGUAGE_OVERRIDABLE */
    }
  }
});

configurationRegistry15.registerConfiguration({
  "id": "explorer",
  "order": 10,
  "title": localize(15939, null),
  "type": "object",
  "properties": {
    "explorer.openEditors.visible": {
      "type": "number",
      "description": localize(15971, null),
      "default": 9,
      "minimum": 1
    },
    "explorer.openEditors.minVisible": {
      "type": "number",
      "description": localize(15972, null),
      "default": 0,
      "minimum": 0
    },
    "explorer.openEditors.sortOrder": {
      "type": "string",
      "enum": ["editorOrder", "alphabetical", "fullPath"],
      "description": localize(15970, null),
      "enumDescriptions": [
        localize(15979, null),
        localize(15977, null),
        localize(15982, null)
      ],
      "default": "editorOrder"
    },
    "explorer.autoReveal": {
      "type": ["boolean", "string"],
      "enum": [true, false, "focusNoScroll"],
      "default": true,
      "enumDescriptions": [
        localize(15896, null),
        localize(15895, null),
        localize(15894, null)
      ],
      "description": localize(15893, null)
    },
    "explorer.autoRevealExclude": {
      "type": "object",
      "markdownDescription": localize(15897, null),
      "default": { "**/node_modules": true, "**/bower_components": true },
      "additionalProperties": {
        "anyOf": [
          {
            "type": "boolean",
            "description": localize(15934, null)
          },
          {
            type: "object",
            properties: {
              when: {
                type: "string",
                // expression ({ "**/*.js": { "when": "$(basename).js" } })
                pattern: "\\w*\\$\\(basename\\)\\w*",
                default: "$(basename).ext",
                description: localize(15935, null, "$(basename)")
              }
            }
          }
        ]
      }
    },
    "explorer.enableDragAndDrop": {
      "type": "boolean",
      "description": localize(15920, null),
      "default": true
    },
    "explorer.confirmDragAndDrop": {
      "type": "boolean",
      "description": localize(15906, null),
      "default": true
    },
    "explorer.confirmPasteNative": {
      "type": "boolean",
      "description": localize(15907, null),
      "default": true
    },
    "explorer.confirmDelete": {
      "type": "boolean",
      "description": localize(15905, null),
      "default": true
    },
    "explorer.enableUndo": {
      "type": "boolean",
      "description": localize(15921, null),
      "default": true
    },
    "explorer.confirmUndo": {
      "type": "string",
      "enum": ["verbose" /* Verbose */, "default" /* Default */, "light" /* Light */],
      "description": localize(15908, null),
      "default": "default" /* Default */,
      "enumDescriptions": [
        localize(15924, null),
        localize(15922, null),
        localize(15923, null)
      ]
    },
    "explorer.expandSingleFolderWorkspaces": {
      "type": "boolean",
      "description": localize(15933, null),
      "default": true
    },
    "explorer.sortOrder": {
      "type": "string",
      "enum": ["default" /* Default */, "mixed" /* Mixed */, "filesFirst" /* FilesFirst */, "type" /* Type */, "modified" /* Modified */, "foldersNestsFiles" /* FoldersNestsFiles */],
      "default": "default" /* Default */,
      "enumDescriptions": [
        localize(15978, null),
        localize(15983, null),
        localize(15980, null),
        localize(15985, null),
        localize(15984, null),
        localize(15981, null)
      ],
      "markdownDescription": localize(15976, null)
    },
    "explorer.sortOrderLexicographicOptions": {
      "type": "string",
      "enum": ["default" /* Default */, "upper" /* Upper */, "lower" /* Lower */, "unicode" /* Unicode */],
      "default": "default" /* Default */,
      "enumDescriptions": [
        localize(15987, null),
        localize(15990, null),
        localize(15988, null),
        localize(15989, null)
      ],
      "description": localize(15986, null)
    },
    "explorer.sortOrderReverse": {
      "type": "boolean",
      "description": localize(15991, null),
      "default": false
    },
    "explorer.decorations.colors": {
      type: "boolean",
      description: localize(15937, null),
      default: true
    },
    "explorer.decorations.badges": {
      type: "boolean",
      description: localize(15936, null),
      default: true
    },
    "explorer.incrementalNaming": {
      "type": "string",
      enum: ["simple", "smart", "disabled"],
      enumDescriptions: [
        localize(15974, null),
        localize(15975, null),
        localize(15919, null)
      ],
      description: localize(15938, null),
      default: "simple"
    },
    "explorer.autoOpenDroppedFile": {
      "type": "boolean",
      "description": localize(15892, null),
      "default": true
    },
    "explorer.compactFolders": {
      "type": "boolean",
      "description": localize(15904, null),
      "default": true
    },
    "explorer.copyRelativePathSeparator": {
      "type": "string",
      "enum": [
        "/",
        "\\",
        "auto"
      ],
      "enumDescriptions": [
        localize(15916, null),
        localize(15915, null),
        localize(15914, null)
      ],
      "description": localize(15913, null),
      "default": "auto"
    },
    "explorer.copyPathSeparator": {
      "type": "string",
      "enum": [
        "/",
        "\\",
        "auto"
      ],
      "enumDescriptions": [
        localize(15912, null),
        localize(15911, null),
        localize(15910, null)
      ],
      "description": localize(15909, null),
      "default": "auto"
    },
    "explorer.excludeGitIgnore": {
      type: "boolean",
      markdownDescription: localize(15932, null, "`#files.exclude#`"),
      default: false,
      scope: 5 /* RESOURCE */
    },
    "explorer.fileNesting.enabled": {
      "type": "boolean",
      scope: 5 /* RESOURCE */,
      "markdownDescription": localize(15943, null),
      "default": false
    },
    "explorer.fileNesting.expand": {
      "type": "boolean",
      "markdownDescription": localize(15944, null, "`#explorer.fileNesting.enabled#`"),
      "default": true
    },
    "explorer.fileNesting.patterns": {
      "type": "object",
      scope: 5 /* RESOURCE */,
      "markdownDescription": localize(15945, null, "`#explorer.fileNesting.enabled#`"),
      patternProperties: {
        "^[^*]*\\*?[^*]*$": {
          markdownDescription: localize(15942, null),
          type: "string",
          pattern: "^([^,*]*\\*?[^,*]*)(, ?[^,*]*\\*?[^,*]*)*$"
        }
      },
      additionalProperties: false,
      "default": {
        "*.ts": "${capture}.js",
        "*.js": "${capture}.js.map, ${capture}.min.js, ${capture}.d.ts",
        "*.jsx": "${capture}.js",
        "*.tsx": "${capture}.ts",
        "tsconfig.json": "tsconfig.*.json",
        "package.json": "package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb, bun.lock"
      }
    }
  }
});

UndoCommand.addImplementation(110, "explorer", (accessor) => {
  const undoRedoService = accessor.get(IUndoRedoService);
  const explorerService = accessor.get(IExplorerService);
  const configurationService = accessor.get(IConfigurationService);
  const explorerCanUndo = configurationService.getValue().explorer.enableUndo;
  if (explorerService.hasViewFocus() && undoRedoService.canUndo(UNDO_REDO_SOURCE) && explorerCanUndo) {
    undoRedoService.undo(UNDO_REDO_SOURCE);
    return true;
  }
  return false;
});

RedoCommand.addImplementation(110, "explorer", (accessor) => {
  const undoRedoService = accessor.get(IUndoRedoService);
  const explorerService = accessor.get(IExplorerService);
  const configurationService = accessor.get(IConfigurationService);
  const explorerCanUndo = configurationService.getValue().explorer.enableUndo;
  if (explorerService.hasViewFocus() && undoRedoService.canRedo(UNDO_REDO_SOURCE) && explorerCanUndo) {
    undoRedoService.redo(UNDO_REDO_SOURCE);
    return true;
  }
  return false;
});

ModesRegistry.registerLanguage({
  id: BINARY_TEXT_FILE_MODE,
  aliases: ["Binary"],
  mimetypes: ["text/x-code-binary"]
});
export { FileUriLabelContribution, configurationRegistry15, hotExitConfiguration };
