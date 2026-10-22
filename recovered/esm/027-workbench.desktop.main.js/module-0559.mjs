// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeAction.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { coalesce, equals, isNonEmptyArray } from "./module-0007.mjs";
import { CodeActionItem, CodeActionKind, filtersAction, mayIncludeActionsOfKind } from "./module-0558.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { TextModelCancellationTokenSource } from "./module-0539.mjs";
import { illegalArgument, isCancellationError, onUnexpectedExternalError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotificationService } from "./module-0336.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { EditSources } from "./module-0377.mjs";
import { ProviderId } from "./module-0164.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IModelService } from "./module-0080.mjs";
import { Selection } from "./module-0107.mjs";
import { Range2 } from "./module-0106.mjs";
import { Progress } from "./module-0446.mjs";


// src/vs/editor/contrib/codeAction/browser/codeAction.ts
var codeActionCommandId = "editor.action.codeAction";

var quickFixCommandId = "editor.action.quickFix";

var autoFixCommandId = "editor.action.autoFix";

var refactorCommandId = "editor.action.refactor";

var sourceActionCommandId = "editor.action.sourceAction";

var organizeImportsCommandId = "editor.action.organizeImports";

var fixAllCommandId = "editor.action.fixAll";

var CODE_ACTION_SOUND_APPLIED_DURATION = 1e3;

var ManagedCodeActionSet = class _ManagedCodeActionSet extends Disposable {
  constructor(actions, documentation, disposables) {
    super();
    this.documentation = documentation;
    this._register(disposables);
    this.allActions = [...actions].sort(_ManagedCodeActionSet.codeActionsComparator);
    this.validActions = this.allActions.filter(({ action }) => !action.disabled);
  }
  static codeActionsPreferredComparator(a, b) {
    if (a.isPreferred && !b.isPreferred) {
      return -1;
    } else if (!a.isPreferred && b.isPreferred) {
      return 1;
    } else {
      return 0;
    }
  }
  static codeActionsComparator({ action: a }, { action: b }) {
    if (a.isAI && !b.isAI) {
      return 1;
    } else if (!a.isAI && b.isAI) {
      return -1;
    }
    if (isNonEmptyArray(a.diagnostics)) {
      return isNonEmptyArray(b.diagnostics) ? _ManagedCodeActionSet.codeActionsPreferredComparator(a, b) : -1;
    } else if (isNonEmptyArray(b.diagnostics)) {
      return 1;
    } else {
      return _ManagedCodeActionSet.codeActionsPreferredComparator(a, b);
    }
  }
  get hasAutoFix() {
    return this.validActions.some(({ action: fix }) => !!fix.kind && CodeActionKind.QuickFix.contains(new HierarchicalKind(fix.kind)) && !!fix.isPreferred);
  }
  get hasAIFix() {
    return this.validActions.some(({ action: fix }) => !!fix.isAI);
  }
  get allAIFixes() {
    return this.validActions.every(({ action: fix }) => !!fix.isAI);
  }
};

var emptyCodeActionsResponse = { actions: [], documentation: void 0 };

async function getCodeActions(registry4, model, rangeOrSelection, trigger, progress, token) {
  const filter2 = trigger.filter || {};
  const notebookFilter = {
    ...filter2,
    excludes: [...filter2.excludes || [], CodeActionKind.Notebook]
  };
  const codeActionContext = {
    only: filter2.include?.value,
    trigger: trigger.type
  };
  const cts = new TextModelCancellationTokenSource(model, token);
  const excludeNotebookCodeActions = trigger.type === 2 /* Auto */;
  const providers2 = getCodeActionProviders(registry4, model, excludeNotebookCodeActions ? notebookFilter : filter2);
  const disposables = new DisposableStore();
  const promises = providers2.map(async (provider) => {
    const handle2 = setTimeout(() => progress.report(provider), 1250);
    try {
      const providedCodeActions = await provider.provideCodeActions(model, rangeOrSelection, codeActionContext, cts.token);
      if (cts.token.isCancellationRequested) {
        providedCodeActions?.dispose();
        return emptyCodeActionsResponse;
      }
      if (providedCodeActions) {
        disposables.add(providedCodeActions);
      }
      const filteredActions = (providedCodeActions?.actions || []).filter((action) => action && filtersAction(filter2, action));
      const documentation = getDocumentationFromProvider(provider, filteredActions, filter2.include);
      return {
        actions: filteredActions.map((action) => new CodeActionItem(action, provider)),
        documentation
      };
    } catch (err) {
      if (isCancellationError(err)) {
        throw err;
      }
      onUnexpectedExternalError(err);
      return emptyCodeActionsResponse;
    } finally {
      clearTimeout(handle2);
    }
  });
  const listener = registry4.onDidChange(() => {
    const newProviders = registry4.all(model);
    if (!equals(newProviders, providers2)) {
      cts.cancel();
    }
  });
  try {
    const actions = await Promise.all(promises);
    const allActions = actions.map((x) => x.actions).flat();
    const allDocumentation = [
      ...coalesce(actions.map((x) => x.documentation)),
      ...getAdditionalDocumentationForShowingActions(registry4, model, trigger, allActions)
    ];
    const managedCodeActionSet = new ManagedCodeActionSet(allActions, allDocumentation, disposables);
    disposables.add(managedCodeActionSet);
    return managedCodeActionSet;
  } catch (err) {
    disposables.dispose();
    throw err;
  } finally {
    listener.dispose();
    cts.dispose();
  }
}

function getCodeActionProviders(registry4, model, filter2) {
  return registry4.all(model).filter((provider) => {
    if (!provider.providedCodeActionKinds) {
      return true;
    }
    return provider.providedCodeActionKinds.some((kind) => mayIncludeActionsOfKind(filter2, new HierarchicalKind(kind)));
  });
}

function* getAdditionalDocumentationForShowingActions(registry4, model, trigger, actionsToShow) {
  if (model && actionsToShow.length) {
    for (const provider of registry4.all(model)) {
      if (provider._getAdditionalMenuItems) {
        yield* provider._getAdditionalMenuItems?.({ trigger: trigger.type, only: trigger.filter?.include?.value }, actionsToShow.map((item) => item.action));
      }
    }
  }
}

function getDocumentationFromProvider(provider, providedCodeActions, only) {
  if (!provider.documentation) {
    return void 0;
  }
  const documentation = provider.documentation.map((entry) => ({ kind: new HierarchicalKind(entry.kind), command: entry.command }));
  if (only) {
    let currentBest;
    for (const entry of documentation) {
      if (entry.kind.contains(only)) {
        if (!currentBest) {
          currentBest = entry;
        } else {
          if (currentBest.kind.contains(entry.kind)) {
            currentBest = entry;
          }
        }
      }
    }
    if (currentBest) {
      return currentBest?.command;
    }
  }
  for (const action of providedCodeActions) {
    if (!action.kind) {
      continue;
    }
    for (const entry of documentation) {
      if (entry.kind.contains(new HierarchicalKind(action.kind))) {
        return entry.command;
      }
    }
  }
  return void 0;
}

async function applyCodeAction(accessor, item, codeActionReason, options3, token = CancellationToken.None) {
  const bulkEditService = accessor.get(IBulkEditService);
  const commandService = accessor.get(ICommandService);
  const telemetryService = accessor.get(ITelemetryService);
  const notificationService = accessor.get(INotificationService);
  const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
  telemetryService.publicLog2("codeAction.applyCodeAction", {
    codeActionTitle: item.action.title,
    codeActionKind: item.action.kind,
    codeActionIsPreferred: !!item.action.isPreferred,
    reason: codeActionReason
  });
  accessibilitySignalService.playSignal(AccessibilitySignal.codeActionTriggered);
  await item.resolve(token);
  if (token.isCancellationRequested) {
    return;
  }
  if (item.action.edit?.edits.length) {
    const result = await bulkEditService.apply(item.action.edit, {
      editor: options3?.editor,
      label: item.action.title,
      quotableLabel: item.action.title,
      code: "undoredo.codeAction",
      respectAutoSaveConfig: codeActionReason !== "onSave" /* OnSave */,
      showPreview: options3?.preview,
      reason: EditSources.codeAction({ kind: item.action.kind, providerId: ProviderId.fromExtensionId(item.provider?.extensionId) })
    });
    if (!result.isApplied) {
      return;
    }
  }
  if (item.action.command) {
    try {
      await commandService.executeCommand(item.action.command.id, ...item.action.command.arguments || []);
    } catch (err) {
      const message = asMessage(err);
      notificationService.error(
        typeof message === "string" ? message : localize(1003, null)
      );
    }
  }
  setTimeout(() => accessibilitySignalService.playSignal(AccessibilitySignal.codeActionApplied), CODE_ACTION_SOUND_APPLIED_DURATION);
}

function asMessage(err) {
  if (typeof err === "string") {
    return err;
  } else if (err instanceof Error && typeof err.message === "string") {
    return err.message;
  } else {
    return void 0;
  }
}

CommandsRegistry.registerCommand("_executeCodeActionProvider", async function(accessor, resource, rangeOrSelection, kind, itemResolveCount) {
  if (!(resource instanceof URI)) {
    throw illegalArgument();
  }
  const { codeActionProvider } = accessor.get(ILanguageFeaturesService);
  const model = accessor.get(IModelService).getModel(resource);
  if (!model) {
    throw illegalArgument();
  }
  const validatedRangeOrSelection = Selection.isISelection(rangeOrSelection) ? Selection.liftSelection(rangeOrSelection) : Range2.isIRange(rangeOrSelection) ? model.validateRange(rangeOrSelection) : void 0;
  if (!validatedRangeOrSelection) {
    throw illegalArgument();
  }
  const include = typeof kind === "string" ? new HierarchicalKind(kind) : void 0;
  const codeActionSet = await getCodeActions(
    codeActionProvider,
    model,
    validatedRangeOrSelection,
    { type: 1 /* Invoke */, triggerAction: "other (default)" /* Default */, filter: { includeSourceActions: true, include } },
    Progress.None,
    CancellationToken.None
  );
  const resolving = [];
  const resolveCount = Math.min(codeActionSet.validActions.length, typeof itemResolveCount === "number" ? itemResolveCount : 0);
  for (let i2 = 0; i2 < resolveCount; i2++) {
    resolving.push(codeActionSet.validActions[i2].resolve(CancellationToken.None));
  }
  try {
    await Promise.all(resolving);
    return codeActionSet.validActions.map((item) => item.action);
  } finally {
    setTimeout(() => codeActionSet.dispose(), 100);
  }
});
export { getCodeActions, getCodeActionProviders, getAdditionalDocumentationForShowingActions, getDocumentationFromProvider, applyCodeAction, asMessage, codeActionCommandId, quickFixCommandId, autoFixCommandId, refactorCommandId, sourceActionCommandId, organizeImportsCommandId, fixAllCommandId, CODE_ACTION_SOUND_APPLIED_DURATION, ManagedCodeActionSet, emptyCodeActionsResponse };
