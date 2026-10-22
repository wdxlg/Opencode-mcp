// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/format/browser/format.ts
import { ExtensionIdentifierSet } from "./module-0688.mjs";
import { LinkedList } from "./module-0013.mjs";
import { Iterable } from "./module-0011.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { ILogService } from "./module-0095.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { EditorStateCancellationTokenSource, TextModelCancellationTokenSource } from "./module-0539.mjs";
import { asArray, isNonEmptyArray } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";
import { FormattingEdit } from "./module-0686.mjs";
import { Selection } from "./module-0107.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/contrib/format/browser/format.ts
function getRealAndSyntheticDocumentFormattersOrdered(documentFormattingEditProvider, documentRangeFormattingEditProvider, model) {
  const result = [];
  const seen = new ExtensionIdentifierSet();
  const docFormatter = documentFormattingEditProvider.ordered(model);
  for (const formatter of docFormatter) {
    result.push(formatter);
    if (formatter.extensionId) {
      seen.add(formatter.extensionId);
    }
  }
  const rangeFormatter = documentRangeFormattingEditProvider.ordered(model);
  for (const formatter of rangeFormatter) {
    if (formatter.extensionId) {
      if (seen.has(formatter.extensionId)) {
        continue;
      }
      seen.add(formatter.extensionId);
    }
    result.push({
      displayName: formatter.displayName,
      extensionId: formatter.extensionId,
      provideDocumentFormattingEdits(model2, options3, token) {
        return formatter.provideDocumentRangeFormattingEdits(model2, model2.getFullModelRange(), options3, token);
      }
    });
  }
  return result;
}

var FormattingConflicts = class _FormattingConflicts {
  static {
    this._selectors = new LinkedList();
  }
  static setFormatterSelector(selector) {
    const remove2 = _FormattingConflicts._selectors.unshift(selector);
    return { dispose: remove2 };
  }
  static async select(formatter, document2, mode, kind) {
    if (formatter.length === 0) {
      return void 0;
    }
    const selector = Iterable.first(_FormattingConflicts._selectors);
    if (selector) {
      return await selector(formatter, document2, mode, kind);
    }
    return void 0;
  }
};

async function formatDocumentRangesWithSelectedProvider(accessor, editorOrModel, rangeOrRanges, mode, progress, token, userGesture) {
  const instaService = accessor.get(IInstantiationService);
  const { documentRangeFormattingEditProvider: documentRangeFormattingEditProviderRegistry } = accessor.get(ILanguageFeaturesService);
  const model = isCodeEditor(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
  const provider = documentRangeFormattingEditProviderRegistry.ordered(model);
  const selected = await FormattingConflicts.select(provider, model, mode, 2 /* Selection */);
  if (selected) {
    progress.report(selected);
    await instaService.invokeFunction(formatDocumentRangesWithProvider, selected, editorOrModel, rangeOrRanges, token, userGesture);
  }
}

async function formatDocumentRangesWithProvider(accessor, provider, editorOrModel, rangeOrRanges, token, userGesture) {
  const workerService = accessor.get(IEditorWorkerService);
  const logService = accessor.get(ILogService);
  const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
  let model;
  let cts;
  if (isCodeEditor(editorOrModel)) {
    model = editorOrModel.getModel();
    cts = new EditorStateCancellationTokenSource(editorOrModel, 1 /* Value */ | 4 /* Position */, void 0, token);
  } else {
    model = editorOrModel;
    cts = new TextModelCancellationTokenSource(editorOrModel, token);
  }
  const ranges = [];
  let len = 0;
  for (const range2 of asArray(rangeOrRanges).sort(Range2.compareRangesUsingStarts)) {
    if (len > 0 && Range2.areIntersectingOrTouching(ranges[len - 1], range2)) {
      ranges[len - 1] = Range2.fromPositions(ranges[len - 1].getStartPosition(), range2.getEndPosition());
    } else {
      len = ranges.push(range2);
    }
  }
  const computeEdits = async (range2) => {
    logService.trace(`[format][provideDocumentRangeFormattingEdits] (request)`, provider.extensionId?.value, range2);
    const result = await provider.provideDocumentRangeFormattingEdits(
      model,
      range2,
      model.getFormattingOptions(),
      cts.token
    ) || [];
    logService.trace(`[format][provideDocumentRangeFormattingEdits] (response)`, provider.extensionId?.value, result);
    return result;
  };
  const hasIntersectingEdit = (a, b) => {
    if (!a.length || !b.length) {
      return false;
    }
    const mergedA = a.reduce((acc, val) => {
      return Range2.plusRange(acc, val.range);
    }, a[0].range);
    if (!b.some((x) => {
      return Range2.intersectRanges(mergedA, x.range);
    })) {
      return false;
    }
    for (const edit3 of a) {
      for (const otherEdit of b) {
        if (Range2.intersectRanges(edit3.range, otherEdit.range)) {
          return true;
        }
      }
    }
    return false;
  };
  const allEdits = [];
  const rawEditsList = [];
  try {
    if (typeof provider.provideDocumentRangesFormattingEdits === "function") {
      logService.trace(`[format][provideDocumentRangeFormattingEdits] (request)`, provider.extensionId?.value, ranges);
      const result = await provider.provideDocumentRangesFormattingEdits(
        model,
        ranges,
        model.getFormattingOptions(),
        cts.token
      ) || [];
      logService.trace(`[format][provideDocumentRangeFormattingEdits] (response)`, provider.extensionId?.value, result);
      rawEditsList.push(result);
    } else {
      for (const range2 of ranges) {
        if (cts.token.isCancellationRequested) {
          return true;
        }
        rawEditsList.push(await computeEdits(range2));
      }
      for (let i2 = 0; i2 < ranges.length; ++i2) {
        for (let j = i2 + 1; j < ranges.length; ++j) {
          if (cts.token.isCancellationRequested) {
            return true;
          }
          if (hasIntersectingEdit(rawEditsList[i2], rawEditsList[j])) {
            const mergedRange = Range2.plusRange(ranges[i2], ranges[j]);
            const edits = await computeEdits(mergedRange);
            ranges.splice(j, 1);
            ranges.splice(i2, 1);
            ranges.push(mergedRange);
            rawEditsList.splice(j, 1);
            rawEditsList.splice(i2, 1);
            rawEditsList.push(edits);
            i2 = 0;
            j = 0;
          }
        }
      }
    }
    for (const rawEdits of rawEditsList) {
      if (cts.token.isCancellationRequested) {
        return true;
      }
      const minimalEdits = await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
      if (minimalEdits) {
        allEdits.push(...minimalEdits);
      }
    }
    if (cts.token.isCancellationRequested) {
      return true;
    }
  } finally {
    cts.dispose();
  }
  if (allEdits.length === 0) {
    return false;
  }
  if (isCodeEditor(editorOrModel)) {
    FormattingEdit.execute(editorOrModel, allEdits, true);
    editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* Immediate */);
  } else {
    const [{ range: range2 }] = allEdits;
    const initialSelection = new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
    model.pushEditOperations([initialSelection], allEdits.map((edit3) => {
      return {
        text: edit3.text,
        range: Range2.lift(edit3.range),
        forceMoveMarkers: true
      };
    }), (undoEdits) => {
      for (const { range: range3 } of undoEdits) {
        if (Range2.areIntersectingOrTouching(range3, initialSelection)) {
          return [new Selection(range3.startLineNumber, range3.startColumn, range3.endLineNumber, range3.endColumn)];
        }
      }
      return null;
    });
  }
  accessibilitySignalService.playSignal(AccessibilitySignal.format, { userGesture });
  return true;
}

async function formatDocumentWithSelectedProvider(accessor, editorOrModel, mode, progress, token, userGesture) {
  const instaService = accessor.get(IInstantiationService);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const model = isCodeEditor(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
  const provider = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
  const selected = await FormattingConflicts.select(provider, model, mode, 1 /* File */);
  if (selected) {
    progress.report(selected);
    await instaService.invokeFunction(formatDocumentWithProvider, selected, editorOrModel, mode, token, userGesture);
  }
}

async function formatDocumentWithProvider(accessor, provider, editorOrModel, mode, token, userGesture) {
  const workerService = accessor.get(IEditorWorkerService);
  const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
  let model;
  let cts;
  if (isCodeEditor(editorOrModel)) {
    model = editorOrModel.getModel();
    cts = new EditorStateCancellationTokenSource(editorOrModel, 1 /* Value */ | 4 /* Position */, void 0, token);
  } else {
    model = editorOrModel;
    cts = new TextModelCancellationTokenSource(editorOrModel, token);
  }
  let edits;
  try {
    const rawEdits = await provider.provideDocumentFormattingEdits(
      model,
      model.getFormattingOptions(),
      cts.token
    );
    edits = await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
    if (cts.token.isCancellationRequested) {
      return true;
    }
  } finally {
    cts.dispose();
  }
  if (!edits || edits.length === 0) {
    return false;
  }
  if (isCodeEditor(editorOrModel)) {
    FormattingEdit.execute(editorOrModel, edits, mode !== 2 /* Silent */);
    if (mode !== 2 /* Silent */) {
      editorOrModel.revealPositionInCenterIfOutsideViewport(editorOrModel.getPosition(), 1 /* Immediate */);
    }
  } else {
    const [{ range: range2 }] = edits;
    const initialSelection = new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
    model.pushEditOperations([initialSelection], edits.map((edit3) => {
      return {
        text: edit3.text,
        range: Range2.lift(edit3.range),
        forceMoveMarkers: true
      };
    }), (undoEdits) => {
      for (const { range: range3 } of undoEdits) {
        if (Range2.areIntersectingOrTouching(range3, initialSelection)) {
          return [new Selection(range3.startLineNumber, range3.startColumn, range3.endLineNumber, range3.endColumn)];
        }
      }
      return null;
    });
  }
  accessibilitySignalService.playSignal(AccessibilitySignal.format, { userGesture });
  return true;
}

async function getDocumentRangeFormattingEditsUntilResult(workerService, languageFeaturesService, model, range2, options3, token) {
  const providers2 = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
  for (const provider of providers2) {
    const rawEdits = await Promise.resolve(provider.provideDocumentRangeFormattingEdits(model, range2, options3, token)).catch(onUnexpectedExternalError);
    if (isNonEmptyArray(rawEdits)) {
      return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
    }
  }
  return void 0;
}

async function getDocumentFormattingEditsUntilResult(workerService, languageFeaturesService, model, options3, token) {
  const providers2 = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
  for (const provider of providers2) {
    const rawEdits = await Promise.resolve(provider.provideDocumentFormattingEdits(model, options3, token)).catch(onUnexpectedExternalError);
    if (isNonEmptyArray(rawEdits)) {
      return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
    }
  }
  return void 0;
}

async function getDocumentFormattingEditsWithSelectedProvider(workerService, languageFeaturesService, editorOrModel, mode, token) {
  const model = isCodeEditor(editorOrModel) ? editorOrModel.getModel() : editorOrModel;
  const provider = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
  const selected = await FormattingConflicts.select(provider, model, mode, 1 /* File */);
  if (selected) {
    const rawEdits = await Promise.resolve(selected.provideDocumentFormattingEdits(model, model.getOptions(), token)).catch(onUnexpectedExternalError);
    return await workerService.computeMoreMinimalEdits(model.uri, rawEdits);
  }
  return void 0;
}

function getOnTypeFormattingEdits(workerService, languageFeaturesService, model, position2, ch, options3, token) {
  const providers2 = languageFeaturesService.onTypeFormattingEditProvider.ordered(model);
  if (providers2.length === 0) {
    return Promise.resolve(void 0);
  }
  if (providers2[0].autoFormatTriggerCharacters.indexOf(ch) < 0) {
    return Promise.resolve(void 0);
  }
  return Promise.resolve(providers2[0].provideOnTypeFormattingEdits(model, position2, ch, options3, token)).catch(onUnexpectedExternalError).then((edits) => {
    return workerService.computeMoreMinimalEdits(model.uri, edits);
  });
}

function isFormattingOptions(obj) {
  const candidate = obj;
  return !!candidate && typeof candidate === "object" && typeof candidate.tabSize === "number" && typeof candidate.insertSpaces === "boolean";
}

CommandsRegistry.registerCommand("_executeFormatRangeProvider", async function(accessor, ...args2) {
  const [resource, range2, options3] = args2;
  assertType(URI.isUri(resource));
  assertType(Range2.isIRange(range2));
  const resolverService = accessor.get(ITextModelService);
  const workerService = accessor.get(IEditorWorkerService);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const reference = await resolverService.createModelReference(resource);
  try {
    return getDocumentRangeFormattingEditsUntilResult(workerService, languageFeaturesService, reference.object.textEditorModel, Range2.lift(range2), ensureFormattingOptions(options3, reference), CancellationToken.None);
  } finally {
    reference.dispose();
  }
});

CommandsRegistry.registerCommand("_executeFormatDocumentProvider", async function(accessor, ...args2) {
  const [resource, options3] = args2;
  assertType(URI.isUri(resource));
  const resolverService = accessor.get(ITextModelService);
  const workerService = accessor.get(IEditorWorkerService);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const reference = await resolverService.createModelReference(resource);
  try {
    return getDocumentFormattingEditsUntilResult(workerService, languageFeaturesService, reference.object.textEditorModel, ensureFormattingOptions(options3, reference), CancellationToken.None);
  } finally {
    reference.dispose();
  }
});

CommandsRegistry.registerCommand("_executeFormatOnTypeProvider", async function(accessor, ...args2) {
  const [resource, position2, ch, options3] = args2;
  assertType(URI.isUri(resource));
  assertType(Position.isIPosition(position2));
  assertType(typeof ch === "string");
  const resolverService = accessor.get(ITextModelService);
  const workerService = accessor.get(IEditorWorkerService);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const reference = await resolverService.createModelReference(resource);
  try {
    return getOnTypeFormattingEdits(workerService, languageFeaturesService, reference.object.textEditorModel, Position.lift(position2), ch, ensureFormattingOptions(options3, reference), CancellationToken.None);
  } finally {
    reference.dispose();
  }
});

function ensureFormattingOptions(options3, reference) {
  let validatedOptions;
  if (isFormattingOptions(options3)) {
    validatedOptions = options3;
  } else {
    const modelOptions = reference.object.textEditorModel.getOptions();
    validatedOptions = {
      tabSize: modelOptions.tabSize,
      insertSpaces: modelOptions.insertSpaces
    };
  }
  return validatedOptions;
}
export { getRealAndSyntheticDocumentFormattersOrdered, formatDocumentRangesWithSelectedProvider, formatDocumentRangesWithProvider, formatDocumentWithSelectedProvider, formatDocumentWithProvider, getDocumentRangeFormattingEditsUntilResult, getDocumentFormattingEditsUntilResult, getDocumentFormattingEditsWithSelectedProvider, getOnTypeFormattingEdits, isFormattingOptions, ensureFormattingOptions, FormattingConflicts };
