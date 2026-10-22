// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/dropOrPasteInto/browser/copyPasteController.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { InlineProgressManager } from "./module-0540.mjs";
import { PostEditWidgetManager } from "./module-0554.mjs";
import { UriList, VSDataTransfer, createStringDataTransferItem, matchesMimeType } from "./module-0264.mjs";
import { generateUuid } from "./module-0190.mjs";
import { DeferredPromise, createCancelablePromise, raceCancellation } from "./module-0036.mjs";
import { MessageController } from "./module-0542.mjs";
import { Mimes } from "./module-0136.mjs";
import { EditorStateCancellationTokenSource } from "./module-0539.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { DefaultTextPasteOrDropEditProvider } from "./module-0543.mjs";
import { upcast } from "./module-0010.mjs";
import { createCombinedWorkspaceEdit, sortEditsByYieldTo } from "./module-0545.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { coalesce } from "./module-0007.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/editor/contrib/dropOrPasteInto/browser/copyPasteController.ts
var changePasteTypeCommandId = "editor.changePasteType";

var pasteAsPreferenceConfig = "editor.pasteAs.preferences";

var pasteWidgetVisibleCtx = new RawContextKey("pasteWidgetVisible", false, localize(1099, null));

var vscodeClipboardMime = "application/vnd.code.copymetadata";

var CopyPasteController = class extends Disposable {
  constructor(editor, instantiationService, _logService, _bulkEditService, _clipboardService, _commandService, _configService, _languageFeaturesService, _quickInputService, _progressService) {
    super();
    this._logService = _logService;
    this._bulkEditService = _bulkEditService;
    this._clipboardService = _clipboardService;
    this._commandService = _commandService;
    this._configService = _configService;
    this._languageFeaturesService = _languageFeaturesService;
    this._quickInputService = _quickInputService;
    this._progressService = _progressService;
    this._editor = editor;
    this._register(editor.onWillCopy((e4) => this.handleCopy(e4)));
    this._register(editor.onWillCut((e4) => this.handleCopy(e4)));
    this._register(editor.onWillPaste((e4) => this.handlePaste(e4)));
    this._pasteProgressManager = this._register(new InlineProgressManager("pasteIntoEditor", editor, instantiationService));
    this._postPasteWidgetManager = this._register(instantiationService.createInstance(
      PostEditWidgetManager,
      "pasteIntoEditor",
      editor,
      pasteWidgetVisibleCtx,
      { id: changePasteTypeCommandId, label: localize(1100, null) },
      () => CopyPasteController._configureDefaultAction ? [CopyPasteController._configureDefaultAction] : []
    ));
  }
  static {
    this.ID = "editor.contrib.copyPasteActionController";
  }
  static get(editor) {
    return editor.getContribution(CopyPasteController.ID);
  }
  static setConfigureDefaultAction(action) {
    CopyPasteController._configureDefaultAction = action;
  }
  changePasteType() {
    this._postPasteWidgetManager.tryShowSelector();
  }
  async pasteAs(preferred) {
    this._logService.trace("CopyPasteController.pasteAs");
    this._editor.focus();
    try {
      this._logService.trace("Before calling editor.action.clipboardPasteAction");
      this._pasteAsActionContext = { preferred };
      await this._commandService.executeCommand("editor.action.clipboardPasteAction");
    } finally {
      this._pasteAsActionContext = void 0;
    }
  }
  clearWidgets() {
    this._postPasteWidgetManager.clear();
  }
  isPasteAsEnabled() {
    return this._editor.getOption(97 /* pasteAs */).enabled;
  }
  async finishedPaste() {
    await this._currentPasteOperation;
  }
  handleCopy(e4) {
    this._logService.trace("CopyPasteController#handleCopy");
    if (!this._editor.hasTextFocus()) {
      return;
    }
    this._clipboardService.clearInternalState?.();
    if (!this.isPasteAsEnabled()) {
      return;
    }
    const model = this._editor.getModel();
    const viewModel = this._editor._getViewModel();
    const selections = this._editor.getSelections();
    if (!model || !viewModel || !selections?.length) {
      return;
    }
    const defaultPastePayload = {
      multicursorText: e4.dataToCopy.multicursorText ?? null,
      pasteOnNewLine: e4.dataToCopy.isFromEmptySelection,
      mode: null
    };
    const providers2 = this._languageFeaturesService.documentPasteEditProvider.ordered(model).filter((x) => !!x.prepareDocumentPaste);
    if (!providers2.length) {
      this.setCopyMetadata(e4.clipboardData, { defaultPastePayload });
      return;
    }
    const dataTransfer = new VSDataTransfer();
    const providerCopyMimeTypes = providers2.flatMap((x) => x.copyMimeTypes ?? []);
    const handle2 = generateUuid();
    this.setCopyMetadata(e4.clipboardData, {
      id: handle2,
      providerCopyMimeTypes,
      defaultPastePayload
    });
    const operations = providers2.map((provider) => {
      return {
        providerMimeTypes: provider.copyMimeTypes,
        operation: createCancelablePromise((token) => provider.prepareDocumentPaste(model, e4.dataToCopy.sourceRanges, dataTransfer, token).catch((err) => {
          console.error(err);
          return void 0;
        }))
      };
    });
    CopyPasteController._currentCopyOperation?.operations.forEach((entry) => entry.operation.cancel());
    CopyPasteController._currentCopyOperation = { handle: handle2, operations };
  }
  async handlePaste(e4) {
    this._logService.trace("CopyPasteController#handlePaste for id : ", e4.metadata?.id);
    if (!this._editor.hasTextFocus()) {
      return;
    }
    const dataTransfer = e4.toExternalVSDataTransfer();
    if (!dataTransfer) {
      return;
    }
    dataTransfer.delete(vscodeClipboardMime);
    MessageController.get(this._editor)?.closeMessage();
    this._currentPasteOperation?.cancel();
    this._currentPasteOperation = void 0;
    const model = this._editor.getModel();
    const selections = this._editor.getSelections();
    if (!selections?.length || !model) {
      return;
    }
    if (this._editor.getOption(104 /* readOnly */) || !this.isPasteAsEnabled() && !this._pasteAsActionContext) {
      return;
    }
    const metadata = this.fetchCopyMetadata(e4);
    this._logService.trace("CopyPasteController#handlePaste with metadata : ", metadata?.id, " and text.length : ", e4.clipboardData.getData("text/plain").length);
    const fileTypes = Array.from(e4.clipboardData.files).map((file) => file.type);
    const allPotentialMimeTypes = [
      ...e4.clipboardData.types,
      ...fileTypes,
      ...metadata?.providerCopyMimeTypes ?? [],
      // TODO: always adds `uri-list` because this get set if there are resources in the system clipboard.
      // However we can only check the system clipboard async. For this early check, just add it in.
      // We filter providers again once we have the final dataTransfer we will use.
      Mimes.uriList
    ];
    const allProviders = this._languageFeaturesService.documentPasteEditProvider.ordered(model).filter((provider) => {
      const preference = this._pasteAsActionContext?.preferred;
      if (preference) {
        if (!this.providerMatchesPreference(provider, preference)) {
          return false;
        }
      }
      return provider.pasteMimeTypes?.some((type) => matchesMimeType(type, allPotentialMimeTypes));
    });
    if (!allProviders.length) {
      if (this._pasteAsActionContext?.preferred) {
        this.showPasteAsNoEditMessage(selections, this._pasteAsActionContext.preferred);
        e4.setHandled();
      }
      return;
    }
    e4.setHandled();
    if (this._pasteAsActionContext) {
      this.showPasteAsPick(this._pasteAsActionContext.preferred, allProviders, selections, dataTransfer, metadata);
    } else {
      this.doPasteInline(allProviders, selections, dataTransfer, metadata, e4.browserEvent);
    }
  }
  showPasteAsNoEditMessage(selections, preference) {
    const kindLabel2 = "only" in preference ? preference.only.value : "preferences" in preference ? preference.preferences.length ? preference.preferences.map((preference2) => preference2.value).join(", ") : localize(1093, null) : preference.providerId;
    MessageController.get(this._editor)?.showMessage(localize(1095, null, kindLabel2), selections[0].getStartPosition());
  }
  doPasteInline(allProviders, selections, dataTransfer, metadata, clipboardEvent) {
    this._logService.trace("CopyPasteController#doPasteInline");
    const editor = this._editor;
    if (!editor.hasModel()) {
      return;
    }
    const editorStateCts = new EditorStateCancellationTokenSource(editor, 1 /* Value */ | 2 /* Selection */, void 0);
    const p = createCancelablePromise(async (pToken) => {
      const editor2 = this._editor;
      if (!editor2.hasModel()) {
        return;
      }
      const model = editor2.getModel();
      const disposables = new DisposableStore();
      const cts = disposables.add(new CancellationTokenSource(pToken));
      disposables.add(editorStateCts.token.onCancellationRequested(() => cts.cancel()));
      const token = cts.token;
      try {
        await this.mergeInDataFromCopy(allProviders, dataTransfer, metadata, token);
        if (token.isCancellationRequested) {
          return;
        }
        const supportedProviders = allProviders.filter((provider) => this.isSupportedPasteProvider(provider, dataTransfer));
        if (!supportedProviders.length || supportedProviders.length === 1 && supportedProviders[0] instanceof DefaultTextPasteOrDropEditProvider) {
          return this.applyDefaultPasteHandler(dataTransfer, metadata, token, clipboardEvent);
        }
        const context2 = {
          triggerKind: 0 /* Automatic */
        };
        const editSession = await this.getPasteEdits(supportedProviders, dataTransfer, model, selections, context2, token);
        disposables.add(editSession);
        if (token.isCancellationRequested) {
          return;
        }
        if (editSession.edits.length === 1 && editSession.edits[0].provider instanceof DefaultTextPasteOrDropEditProvider) {
          return this.applyDefaultPasteHandler(dataTransfer, metadata, token, clipboardEvent);
        }
        if (editSession.edits.length) {
          const canShowWidget = editor2.getOption(97 /* pasteAs */).showPasteSelector === "afterPaste";
          return this._postPasteWidgetManager.applyEditAndShowIfNeeded(selections, { activeEditIndex: this.getInitialActiveEditIndex(model, editSession.edits), allEdits: editSession.edits }, canShowWidget, async (edit3, resolveToken) => {
            if (!edit3.provider.resolveDocumentPasteEdit) {
              return edit3;
            }
            const resolveP = edit3.provider.resolveDocumentPasteEdit(edit3, resolveToken);
            const showP = new DeferredPromise();
            const resolved = await this._pasteProgressManager.showWhile(selections[0].getEndPosition(), localize(1101, null, edit3.title), raceCancellation(Promise.race([showP.p, resolveP]), resolveToken), {
              cancel: () => showP.cancel()
            }, 0);
            if (resolved) {
              edit3.insertText = resolved.insertText;
              edit3.additionalEdit = resolved.additionalEdit;
            }
            return edit3;
          }, token);
        }
        await this.applyDefaultPasteHandler(dataTransfer, metadata, token, clipboardEvent);
      } finally {
        disposables.dispose();
        if (this._currentPasteOperation === p) {
          this._currentPasteOperation = void 0;
        }
      }
    });
    this._pasteProgressManager.showWhile(selections[0].getEndPosition(), localize(1098, null), p, {
      cancel: async () => {
        p.cancel();
        if (editorStateCts.token.isCancellationRequested) {
          return;
        }
        await this.applyDefaultPasteHandler(dataTransfer, metadata, editorStateCts.token, clipboardEvent);
      }
    }).finally(() => {
      editorStateCts.dispose();
    });
    this._currentPasteOperation = p;
  }
  showPasteAsPick(preference, allProviders, selections, dataTransfer, metadata) {
    this._logService.trace("CopyPasteController#showPasteAsPick");
    const p = createCancelablePromise(async (token) => {
      const editor = this._editor;
      if (!editor.hasModel()) {
        return;
      }
      const model = editor.getModel();
      const disposables = new DisposableStore();
      const tokenSource = disposables.add(new EditorStateCancellationTokenSource(editor, 1 /* Value */ | 2 /* Selection */, void 0, token));
      try {
        await this.mergeInDataFromCopy(allProviders, dataTransfer, metadata, tokenSource.token);
        if (tokenSource.token.isCancellationRequested) {
          return;
        }
        let supportedProviders = allProviders.filter((provider) => this.isSupportedPasteProvider(provider, dataTransfer, preference));
        if (preference) {
          supportedProviders = supportedProviders.filter((provider) => this.providerMatchesPreference(provider, preference));
        }
        const context2 = {
          triggerKind: 1 /* PasteAs */,
          only: preference && "only" in preference ? preference.only : void 0
        };
        let editSession = disposables.add(await this.getPasteEdits(supportedProviders, dataTransfer, model, selections, context2, tokenSource.token));
        if (tokenSource.token.isCancellationRequested) {
          return;
        }
        if (preference) {
          editSession = {
            edits: editSession.edits.filter((edit3) => {
              if ("only" in preference) {
                return preference.only.contains(edit3.kind);
              } else if ("preferences" in preference) {
                return preference.preferences.some((preference2) => preference2.contains(edit3.kind));
              } else {
                return preference.providerId === edit3.provider.id;
              }
            }),
            dispose: editSession.dispose
          };
        }
        if (!editSession.edits.length) {
          if (preference) {
            this.showPasteAsNoEditMessage(selections, preference);
          }
          return;
        }
        let pickedEdit;
        if (preference) {
          pickedEdit = editSession.edits.at(0);
        } else {
          const configureDefaultItem = {
            id: "editor.pasteAs.default",
            label: localize(1094, null),
            edit: void 0
          };
          const selected = await this._quickInputService.pick(
            [
              ...editSession.edits.map((edit3) => ({
                label: edit3.title,
                description: edit3.kind?.value,
                edit: edit3
              })),
              ...CopyPasteController._configureDefaultAction ? [
                upcast({ type: "separator" }),
                {
                  label: CopyPasteController._configureDefaultAction.label,
                  edit: void 0
                }
              ] : []
            ],
            {
              placeHolder: localize(1096, null)
            }
          );
          if (selected === configureDefaultItem) {
            CopyPasteController._configureDefaultAction?.run();
            return;
          }
          pickedEdit = selected?.edit;
        }
        if (!pickedEdit) {
          return;
        }
        const combinedWorkspaceEdit = createCombinedWorkspaceEdit(model.uri, selections, pickedEdit);
        await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor });
      } finally {
        disposables.dispose();
        if (this._currentPasteOperation === p) {
          this._currentPasteOperation = void 0;
        }
      }
    });
    this._progressService.withProgress({
      location: 10 /* Window */,
      title: localize(1097, null)
    }, () => p);
  }
  setCopyMetadata(clipboardData, metadata) {
    this._logService.trace("CopyPasteController#setCopyMetadata new id : ", metadata.id);
    clipboardData.setData(vscodeClipboardMime, JSON.stringify(metadata));
  }
  fetchCopyMetadata(e4) {
    this._logService.trace("CopyPasteController#fetchCopyMetadata");
    const rawMetadata = e4.clipboardData.getData(vscodeClipboardMime);
    if (rawMetadata) {
      try {
        return JSON.parse(rawMetadata);
      } catch {
        return void 0;
      }
    }
    if (e4.metadata) {
      return {
        defaultPastePayload: {
          mode: e4.metadata.mode,
          multicursorText: e4.metadata.multicursorText ?? null,
          pasteOnNewLine: !!e4.metadata.isFromEmptySelection
        }
      };
    }
    return void 0;
  }
  async mergeInDataFromCopy(allProviders, dataTransfer, metadata, token) {
    this._logService.trace("CopyPasteController#mergeInDataFromCopy with metadata : ", metadata?.id);
    if (metadata?.id && CopyPasteController._currentCopyOperation?.handle === metadata.id) {
      const toResolve = CopyPasteController._currentCopyOperation.operations.filter((op) => allProviders.some((provider) => provider.pasteMimeTypes.some((type) => matchesMimeType(type, op.providerMimeTypes)))).map((op) => op.operation);
      const toMergeResults = await Promise.all(toResolve);
      if (token.isCancellationRequested) {
        return;
      }
      for (const toMergeData of toMergeResults.reverse()) {
        if (toMergeData) {
          for (const [key3, value2] of toMergeData) {
            dataTransfer.replace(key3, value2);
          }
        }
      }
    }
    if (!dataTransfer.has(Mimes.uriList)) {
      const resources = await this._clipboardService.readResources();
      if (token.isCancellationRequested) {
        return;
      }
      if (resources.length) {
        dataTransfer.append(Mimes.uriList, createStringDataTransferItem(UriList.create(resources)));
      }
    }
  }
  async getPasteEdits(providers2, dataTransfer, model, selections, context2, token) {
    const disposables = new DisposableStore();
    const results = await raceCancellation(
      Promise.all(providers2.map(async (provider) => {
        try {
          const edits2 = await provider.provideDocumentPasteEdits?.(model, selections, dataTransfer, context2, token);
          if (edits2) {
            disposables.add(edits2);
          }
          return edits2?.edits?.map((edit3) => ({ ...edit3, provider }));
        } catch (err) {
          if (!isCancellationError(err)) {
            console.error(err);
          }
          return void 0;
        }
      })),
      token
    );
    const edits = coalesce(results ?? []).flat().filter((edit3) => {
      return !context2.only || context2.only.contains(edit3.kind);
    });
    return {
      edits: sortEditsByYieldTo(edits),
      dispose: () => disposables.dispose()
    };
  }
  async applyDefaultPasteHandler(dataTransfer, metadata, token, clipboardEvent) {
    const textDataTransfer = dataTransfer.get(Mimes.text) ?? dataTransfer.get("text");
    const text2 = await textDataTransfer?.asString() ?? "";
    if (token.isCancellationRequested) {
      return;
    }
    const payload = {
      clipboardEvent,
      text: text2,
      pasteOnNewLine: metadata?.defaultPastePayload.pasteOnNewLine ?? false,
      multicursorText: metadata?.defaultPastePayload.multicursorText ?? null,
      mode: null
    };
    this._logService.trace("CopyPasteController#applyDefaultPasteHandler for id : ", metadata?.id);
    this._editor.trigger("keyboard", "paste" /* Paste */, payload);
  }
  /**
   * Filter out providers if they:
   * - Don't handle any of the data transfer types we have
   * - Don't match the preferred paste kind
   */
  isSupportedPasteProvider(provider, dataTransfer, preference) {
    if (!provider.pasteMimeTypes?.some((type) => dataTransfer.matches(type))) {
      return false;
    }
    return !preference || this.providerMatchesPreference(provider, preference);
  }
  providerMatchesPreference(provider, preference) {
    if ("only" in preference) {
      return provider.providedPasteEditKinds.some((providedKind) => preference.only.contains(providedKind));
    } else if ("preferences" in preference) {
      return provider.providedPasteEditKinds.some((providedKind) => preference.preferences.some((preferredKind) => preferredKind.contains(providedKind)));
    } else {
      return provider.id === preference.providerId;
    }
  }
  getInitialActiveEditIndex(model, edits) {
    const preferredProviders = this._configService.getValue(pasteAsPreferenceConfig, { resource: model.uri });
    for (const config of Array.isArray(preferredProviders) ? preferredProviders : []) {
      const desiredKind = new HierarchicalKind(config);
      const editIndex = edits.findIndex((edit3) => desiredKind.contains(edit3.kind));
      if (editIndex >= 0) {
        return editIndex;
      }
    }
    return 0;
  }
};

CopyPasteController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IBulkEditService),
  __decorateParam(4, IClipboardService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILanguageFeaturesService),
  __decorateParam(8, IQuickInputService),
  __decorateParam(9, IProgressService)
], CopyPasteController);
export { changePasteTypeCommandId, pasteAsPreferenceConfig, pasteWidgetVisibleCtx, vscodeClipboardMime, CopyPasteController };
