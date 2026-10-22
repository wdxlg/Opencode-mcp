// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/rename/browser/rename.ts
import { Range2 } from "./module-0106.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { CONTEXT_RENAME_INPUT_VISIBLE, RenameWidget } from "./module-0733.mjs";
import { EditorStateCancellationTokenSource } from "./module-0539.mjs";
import { CancellationError, onUnexpectedError } from "./module-0004.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { MessageController } from "./module-0542.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { EditSources } from "./module-0377.mjs";
import { alert } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution, registerModelAndPositionCommand } from "./module-0097.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { URI } from "./module-0032.mjs";
import { Position } from "./module-0079.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { assertType } from "./module-0010.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/editor/contrib/rename/browser/rename.ts
var RenameSkeleton = class {
  constructor(model, position2, registry4) {
    this.model = model;
    this.position = position2;
    this._providerRenameIdx = 0;
    this._providers = registry4.ordered(model);
  }
  hasProvider() {
    return this._providers.length > 0;
  }
  async resolveRenameLocation(token) {
    const rejects = [];
    for (this._providerRenameIdx = 0; this._providerRenameIdx < this._providers.length; this._providerRenameIdx++) {
      const provider = this._providers[this._providerRenameIdx];
      if (!provider.resolveRenameLocation) {
        break;
      }
      const res = await provider.resolveRenameLocation(this.model, this.position, token);
      if (!res) {
        continue;
      }
      if (res.rejectReason) {
        rejects.push(res.rejectReason);
        continue;
      }
      return res;
    }
    this._providerRenameIdx = 0;
    const word = this.model.getWordAtPosition(this.position);
    if (!word) {
      return {
        range: Range2.fromPositions(this.position),
        text: "",
        rejectReason: rejects.length > 0 ? rejects.join("\n") : void 0
      };
    }
    return {
      range: new Range2(this.position.lineNumber, word.startColumn, this.position.lineNumber, word.endColumn),
      text: word.word,
      rejectReason: rejects.length > 0 ? rejects.join("\n") : void 0
    };
  }
  async provideRenameEdits(newName, token) {
    return this._provideRenameEdits(newName, this._providerRenameIdx, [], token);
  }
  async _provideRenameEdits(newName, i2, rejects, token) {
    const provider = this._providers[i2];
    if (!provider) {
      return {
        edits: [],
        rejectReason: rejects.join("\n")
      };
    }
    const result = await provider.provideRenameEdits(this.model, this.position, newName, token);
    if (!result) {
      return this._provideRenameEdits(newName, i2 + 1, rejects.concat(localize(1570, null)), token);
    } else if (result.rejectReason) {
      return this._provideRenameEdits(newName, i2 + 1, rejects.concat(result.rejectReason), token);
    }
    return result;
  }
};

function hasProvider(registry4, model) {
  const providers2 = registry4.ordered(model);
  return providers2.length > 0;
}

async function rawRename(registry4, model, position2, newName, cancellationToken) {
  const skeleton = new RenameSkeleton(model, position2, registry4);
  return skeleton.provideRenameEdits(newName, cancellationToken ?? CancellationToken.None);
}

async function rename(registry4, model, position2, newName) {
  const skeleton = new RenameSkeleton(model, position2, registry4);
  const loc = await skeleton.resolveRenameLocation(CancellationToken.None);
  if (loc?.rejectReason) {
    return { edits: [], rejectReason: loc.rejectReason };
  }
  return skeleton.provideRenameEdits(newName, CancellationToken.None);
}

var RenameController = class {
  constructor(editor, _instaService, _notificationService, _bulkEditService, _progressService, _logService, _configService, _languageFeaturesService) {
    this.editor = editor;
    this._instaService = _instaService;
    this._notificationService = _notificationService;
    this._bulkEditService = _bulkEditService;
    this._progressService = _progressService;
    this._logService = _logService;
    this._configService = _configService;
    this._languageFeaturesService = _languageFeaturesService;
    this._disposableStore = new DisposableStore();
    this._cts = new CancellationTokenSource();
    this._renameWidget = this._disposableStore.add(this._instaService.createInstance(RenameWidget, this.editor, ["acceptRenameInput", "acceptRenameInputWithPreview"]));
  }
  static {
    this.ID = "editor.contrib.renameController";
  }
  static get(editor) {
    return editor.getContribution(RenameController.ID);
  }
  dispose() {
    this._disposableStore.dispose();
    this._cts.dispose(true);
  }
  async run() {
    const trace = this._logService.trace.bind(this._logService, "[rename]");
    this._cts.dispose(true);
    this._cts = new CancellationTokenSource();
    if (!this.editor.hasModel()) {
      trace("editor has no model");
      return void 0;
    }
    const position2 = this.editor.getPosition();
    const skeleton = new RenameSkeleton(this.editor.getModel(), position2, this._languageFeaturesService.renameProvider);
    if (!skeleton.hasProvider()) {
      trace("skeleton has no provider");
      return void 0;
    }
    const cts1 = new EditorStateCancellationTokenSource(this.editor, 4 /* Position */ | 1 /* Value */, void 0, this._cts.token);
    let loc;
    try {
      trace("resolving rename location");
      const resolveLocationOperation = skeleton.resolveRenameLocation(cts1.token);
      this._progressService.showWhile(resolveLocationOperation, 250);
      loc = await resolveLocationOperation;
      trace("resolved rename location");
    } catch (e) {
      if (e instanceof CancellationError) {
        trace("resolve rename location cancelled", JSON.stringify(e, null, "	"));
      } else {
        trace("resolve rename location failed", e instanceof Error ? e : JSON.stringify(e, null, "	"));
        if (typeof e === "string" || isMarkdownString(e)) {
          MessageController.get(this.editor)?.showMessage(e || localize(1575, null), position2);
        }
      }
      return void 0;
    } finally {
      cts1.dispose();
    }
    if (!loc) {
      trace("returning early - no loc");
      return void 0;
    }
    if (loc.rejectReason) {
      trace(`returning early - rejected with reason: ${loc.rejectReason}`, loc.rejectReason);
      MessageController.get(this.editor)?.showMessage(loc.rejectReason, position2);
      return void 0;
    }
    if (cts1.token.isCancellationRequested) {
      trace("returning early - cts1 cancelled");
      return void 0;
    }
    const cts2 = new EditorStateCancellationTokenSource(this.editor, 4 /* Position */ | 1 /* Value */, loc.range, this._cts.token);
    const model = this.editor.getModel();
    const newSymbolNamesProviders = this._languageFeaturesService.newSymbolNamesProvider.all(model);
    const resolvedNewSymbolnamesProviders = await Promise.all(newSymbolNamesProviders.map(async (p) => [p, await p.supportsAutomaticNewSymbolNamesTriggerKind ?? false]));
    const requestRenameSuggestions = (triggerKind, cts) => {
      let providers2 = resolvedNewSymbolnamesProviders.slice();
      if (triggerKind === 1 /* Automatic */) {
        providers2 = providers2.filter(([_, supportsAutomatic]) => supportsAutomatic);
      }
      return providers2.map(([p]) => p.provideNewSymbolNames(model, loc.range, triggerKind, cts));
    };
    trace("creating rename input field and awaiting its result");
    const supportPreview = this._bulkEditService.hasPreviewHandler() && this._configService.getValue(this.editor.getModel().uri, "editor.rename.enablePreview");
    const inputFieldResult = await this._renameWidget.getInput(
      loc.range,
      loc.text,
      supportPreview,
      newSymbolNamesProviders.length > 0 ? requestRenameSuggestions : void 0,
      cts2
    );
    trace("received response from rename input field");
    if (typeof inputFieldResult === "boolean") {
      trace(`returning early - rename input field response - ${inputFieldResult}`);
      if (inputFieldResult) {
        this.editor.focus();
      }
      cts2.dispose();
      return void 0;
    }
    this.editor.focus();
    trace("requesting rename edits");
    const renameOperation = raceCancellation(skeleton.provideRenameEdits(inputFieldResult.newName, cts2.token), cts2.token).then(async (renameResult) => {
      if (!renameResult) {
        trace("returning early - no rename edits result");
        return;
      }
      if (!this.editor.hasModel()) {
        trace("returning early - no model after rename edits are provided");
        return;
      }
      if (renameResult.rejectReason) {
        trace(`returning early - rejected with reason: ${renameResult.rejectReason}`);
        this._notificationService.info(renameResult.rejectReason);
        return;
      }
      this.editor.setSelection(Range2.fromPositions(this.editor.getSelection().getPosition()));
      trace("applying edits");
      this._bulkEditService.apply(renameResult, {
        editor: this.editor,
        showPreview: inputFieldResult.wantsPreview,
        label: localize(1569, null, loc?.text, inputFieldResult.newName),
        code: "undoredo.rename",
        quotableLabel: localize(1571, null, loc?.text, inputFieldResult.newName),
        respectAutoSaveConfig: true,
        reason: EditSources.rename(loc?.text, inputFieldResult.newName)
      }).then((result) => {
        trace("edits applied");
        if (result.ariaSummary) {
          alert(localize(1565, null, loc.text, inputFieldResult.newName, result.ariaSummary));
        }
      }).catch((err) => {
        trace(`error when applying edits ${JSON.stringify(err, null, "	")}`);
        this._notificationService.error(localize(1573, null));
        this._logService.error(err);
      });
    }, (err) => {
      trace("error when providing rename edits", JSON.stringify(err, null, "	"));
      this._notificationService.error(localize(1572, null));
      this._logService.error(err);
    }).finally(() => {
      cts2.dispose();
    });
    trace("returning rename operation");
    this._progressService.showWhile(renameOperation, 250);
    return renameOperation;
  }
  acceptRenameInput(wantsPreview) {
    this._renameWidget.acceptInput(wantsPreview);
  }
  cancelRenameInput() {
    this._renameWidget.cancelInput(true, "cancelRenameInput command");
  }
  focusNextRenameSuggestion() {
    this._renameWidget.focusNextRenameSuggestion();
  }
  focusPreviousRenameSuggestion() {
    this._renameWidget.focusPreviousRenameSuggestion();
  }
};

RenameController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IBulkEditService),
  __decorateParam(4, IEditorProgressService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, ILanguageFeaturesService)
], RenameController);

var RenameAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.rename",
      label: localize2(1574, "Rename Symbol"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasRenameProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 60 /* F2 */,
        weight: 100 /* EditorContrib */
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 1.1
      },
      canTriggerInlineEdits: true
    });
  }
  runCommand(accessor, args2) {
    const editorService = accessor.get(ICodeEditorService);
    const [uri5, pos] = Array.isArray(args2) && args2 || [void 0, void 0];
    if (URI.isUri(uri5) && Position.isIPosition(pos)) {
      return editorService.openCodeEditor({ resource: uri5 }, editorService.getActiveCodeEditor()).then((editor) => {
        if (!editor) {
          return;
        }
        editor.setPosition(pos);
        editor.invokeWithinContext((accessor2) => {
          this.reportTelemetry(accessor2, editor);
          return this.run(accessor2, editor);
        });
      }, onUnexpectedError);
    }
    return super.runCommand(accessor, args2);
  }
  run(accessor, editor) {
    const logService = accessor.get(ILogService);
    const controller = RenameController.get(editor);
    if (controller) {
      logService.trace("[RenameAction] got controller, running...");
      return controller.run();
    }
    logService.trace("[RenameAction] returning early - controller missing");
    return Promise.resolve();
  }
};

registerEditorContribution(RenameController.ID, RenameController, 4 /* Lazy */);

registerEditorAction(RenameAction);

var RenameCommand = EditorCommand.bindToContribution(RenameController.get);

registerEditorCommand(new RenameCommand({
  id: "acceptRenameInput",
  precondition: CONTEXT_RENAME_INPUT_VISIBLE,
  handler: (x) => x.acceptRenameInput(false),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 99,
    kbExpr: EditorContextKeys.focus,
    primary: 3 /* Enter */
  }
}));

registerEditorCommand(new RenameCommand({
  id: "acceptRenameInputWithPreview",
  precondition: ContextKeyExpr.and(CONTEXT_RENAME_INPUT_VISIBLE, ContextKeyExpr.has("config.editor.rename.enablePreview")),
  handler: (x) => x.acceptRenameInput(true),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 99,
    kbExpr: EditorContextKeys.focus,
    primary: 2048 /* CtrlCmd */ + 3 /* Enter */
  }
}));

registerEditorCommand(new RenameCommand({
  id: "cancelRenameInput",
  precondition: CONTEXT_RENAME_INPUT_VISIBLE,
  handler: (x) => x.cancelRenameInput(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 99,
    kbExpr: EditorContextKeys.focus,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));

registerAction2(class FocusNextRenameSuggestion extends Action2 {
  constructor() {
    super({
      id: "focusNextRenameSuggestion",
      title: {
        ...localize2(1567, "Focus Next Rename Suggestion")
      },
      precondition: CONTEXT_RENAME_INPUT_VISIBLE,
      keybinding: [
        {
          primary: 18 /* DownArrow */,
          weight: 100 /* EditorContrib */ + 99
        }
      ]
    });
  }
  run(accessor) {
    const currentEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!currentEditor) {
      return;
    }
    const controller = RenameController.get(currentEditor);
    if (!controller) {
      return;
    }
    controller.focusNextRenameSuggestion();
  }
});

registerAction2(class FocusPreviousRenameSuggestion extends Action2 {
  constructor() {
    super({
      id: "focusPreviousRenameSuggestion",
      title: {
        ...localize2(1568, "Focus Previous Rename Suggestion")
      },
      precondition: CONTEXT_RENAME_INPUT_VISIBLE,
      keybinding: [
        {
          primary: 16 /* UpArrow */,
          weight: 100 /* EditorContrib */ + 99
        }
      ]
    });
  }
  run(accessor) {
    const currentEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!currentEditor) {
      return;
    }
    const controller = RenameController.get(currentEditor);
    if (!controller) {
      return;
    }
    controller.focusPreviousRenameSuggestion();
  }
});

registerModelAndPositionCommand("_executeDocumentRenameProvider", function(accessor, model, position2, ...args2) {
  const [newName] = args2;
  assertType(typeof newName === "string");
  const { renameProvider } = accessor.get(ILanguageFeaturesService);
  return rename(renameProvider, model, position2, newName);
});

registerModelAndPositionCommand("_executePrepareRename", async function(accessor, model, position2) {
  const { renameProvider } = accessor.get(ILanguageFeaturesService);
  const skeleton = new RenameSkeleton(model, position2, renameProvider);
  const loc = await skeleton.resolveRenameLocation(CancellationToken.None);
  if (loc?.rejectReason) {
    throw new Error(loc.rejectReason);
  }
  return loc;
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "editor",
  properties: {
    "editor.rename.enablePreview": {
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      description: localize(1566, null),
      default: true,
      type: "boolean"
    }
  }
});
export { hasProvider, rawRename, rename, RenameSkeleton, RenameController, RenameAction, RenameCommand };
