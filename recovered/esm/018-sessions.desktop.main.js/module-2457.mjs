// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/format/browser/formatActionsMultiple.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { FormattingConflicts, formatDocumentRangesWithProvider, formatDocumentWithProvider, getRealAndSyntheticDocumentFormattersOrdered } from "./module-0689.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { localize } from "./module-0001.mjs";
import { IExtensionService, toExtension } from "./module-0889.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageStatusService } from "./module-1225.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/format/browser/formatActionsMultiple.ts
var DefaultFormatter = class extends Disposable {
  constructor(_extensionService, _extensionEnablementService, _configService, _notificationService, _dialogService, _quickInputService, _languageService, _languageFeaturesService, _languageStatusService, _editorService) {
    super();
    this._extensionService = _extensionService;
    this._extensionEnablementService = _extensionEnablementService;
    this._configService = _configService;
    this._notificationService = _notificationService;
    this._dialogService = _dialogService;
    this._quickInputService = _quickInputService;
    this._languageService = _languageService;
    this._languageFeaturesService = _languageFeaturesService;
    this._languageStatusService = _languageStatusService;
    this._editorService = _editorService;
    this._languageStatusStore = this._store.add(new DisposableStore());
    this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
    this._store.add(FormattingConflicts.setFormatterSelector((formatter, document2, mode, kind) => this._selectFormatter(formatter, document2, mode, kind)));
    this._store.add(_editorService.onDidActiveEditorChange(this._updateStatus, this));
    this._store.add(_languageFeaturesService.documentFormattingEditProvider.onDidChange(this._updateStatus, this));
    this._store.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._updateStatus, this));
    this._store.add(_languageFeaturesService.documentFormattingEditProvider.onDidChange(this._updateConfigValues, this));
    this._store.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._updateConfigValues, this));
    this._store.add(_configService.onDidChangeConfiguration((e4) => e4.affectsConfiguration(DefaultFormatter.configName) && this._updateStatus()));
    this._updateConfigValues();
  }
  static {
    this.configName = "editor.defaultFormatter";
  }
  static {
    this.extensionIds = [];
  }
  static {
    this.extensionItemLabels = [];
  }
  static {
    this.extensionDescriptions = [];
  }
  async _updateConfigValues() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    let extensions = [...this._extensionService.extensions];
    const documentFormatters = this._languageFeaturesService.documentFormattingEditProvider.allNoModel();
    const rangeFormatters = this._languageFeaturesService.documentRangeFormattingEditProvider.allNoModel();
    const formatterExtensionIds = /* @__PURE__ */ new Set();
    for (const formatter of documentFormatters) {
      if (formatter.extensionId) {
        formatterExtensionIds.add(ExtensionIdentifier.toKey(formatter.extensionId));
      }
    }
    for (const formatter of rangeFormatters) {
      if (formatter.extensionId) {
        formatterExtensionIds.add(ExtensionIdentifier.toKey(formatter.extensionId));
      }
    }
    extensions = extensions.sort((a, b) => {
      const contributesFormatterA = formatterExtensionIds.has(ExtensionIdentifier.toKey(a.identifier));
      const contributesFormatterB = formatterExtensionIds.has(ExtensionIdentifier.toKey(b.identifier));
      if (contributesFormatterA && !contributesFormatterB) {
        return -1;
      } else if (!contributesFormatterA && contributesFormatterB) {
        return 1;
      }
      const boostA = a.categories?.find((cat) => cat === "Formatters" || cat === "Programming Languages");
      const boostB = b.categories?.find((cat) => cat === "Formatters" || cat === "Programming Languages");
      if (boostA && !boostB) {
        return -1;
      } else if (!boostA && boostB) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    DefaultFormatter.extensionIds.length = 0;
    DefaultFormatter.extensionItemLabels.length = 0;
    DefaultFormatter.extensionDescriptions.length = 0;
    DefaultFormatter.extensionIds.push(null);
    DefaultFormatter.extensionItemLabels.push(localize(16082, null));
    DefaultFormatter.extensionDescriptions.push(localize(16083, null));
    for (const extension of extensions) {
      if (extension.main || extension.browser) {
        DefaultFormatter.extensionIds.push(extension.identifier.value);
        DefaultFormatter.extensionItemLabels.push(extension.displayName ?? "");
        DefaultFormatter.extensionDescriptions.push(extension.description ?? "");
      }
    }
  }
  static _maybeQuotes(s) {
    return s.match(/\s/) ? `'${s}'` : s;
  }
  async _analyzeFormatter(kind, formatter, document2) {
    const defaultFormatterId = this._configService.getValue(DefaultFormatter.configName, {
      resource: document2.uri,
      overrideIdentifier: document2.getLanguageId()
    });
    if (defaultFormatterId) {
      const defaultFormatter = formatter.find((formatter2) => ExtensionIdentifier.equals(formatter2.extensionId, defaultFormatterId));
      if (defaultFormatter) {
        return defaultFormatter;
      }
      const extension = await this._extensionService.getExtension(defaultFormatterId);
      if (extension && this._extensionEnablementService.isEnabled(toExtension(extension))) {
        const langName2 = this._languageService.getLanguageName(document2.getLanguageId()) || document2.getLanguageId();
        const detail2 = kind === 1 /* File */ ? localize(16080, null, extension.displayName || extension.name, langName2) : localize(16081, null, extension.displayName || extension.name, langName2);
        return detail2;
      }
    } else if (formatter.length === 1) {
      return formatter[0];
    }
    const langName = this._languageService.getLanguageName(document2.getLanguageId()) || document2.getLanguageId();
    const message = !defaultFormatterId ? localize(16069, null, DefaultFormatter._maybeQuotes(langName)) : localize(16068, null, defaultFormatterId);
    return message;
  }
  async _selectFormatter(formatter, document2, mode, kind) {
    const formatterOrMessage = await this._analyzeFormatter(kind, formatter, document2);
    if (typeof formatterOrMessage !== "string") {
      return formatterOrMessage;
    }
    if (mode !== 2 /* Silent */) {
      const { confirmed } = await this._dialogService.confirm({
        message: localize(16079, null),
        detail: formatterOrMessage,
        primaryButton: localize(16071, null)
      });
      if (confirmed) {
        return this._pickAndPersistDefaultFormatter(formatter, document2);
      }
    } else {
      this._notificationService.prompt(
        Severity2.Info,
        formatterOrMessage,
        [{ label: localize(16073, null), run: () => this._pickAndPersistDefaultFormatter(formatter, document2) }],
        { priority: 2 /* SILENT */ }
      );
    }
    return void 0;
  }
  async _pickAndPersistDefaultFormatter(formatter, document2) {
    const picks = formatter.map((formatter2, index2) => {
      return {
        index: index2,
        label: formatter2.displayName || (formatter2.extensionId ? formatter2.extensionId.value : "?"),
        description: formatter2.extensionId && formatter2.extensionId.value
      };
    });
    const langName = this._languageService.getLanguageName(document2.getLanguageId()) || document2.getLanguageId();
    const pick = await this._quickInputService.pick(picks, { placeHolder: localize(16084, null, DefaultFormatter._maybeQuotes(langName)) });
    if (!pick || !formatter[pick.index].extensionId) {
      return void 0;
    }
    this._configService.updateValue(DefaultFormatter.configName, formatter[pick.index].extensionId.value, {
      resource: document2.uri,
      overrideIdentifier: document2.getLanguageId()
    });
    return formatter[pick.index];
  }
  // --- status item
  _updateStatus() {
    this._languageStatusStore.clear();
    const editor = getCodeEditor(this._editorService.activeTextEditorControl);
    if (!editor || !editor.hasModel()) {
      return;
    }
    const document2 = editor.getModel();
    const formatter = getRealAndSyntheticDocumentFormattersOrdered(this._languageFeaturesService.documentFormattingEditProvider, this._languageFeaturesService.documentRangeFormattingEditProvider, document2);
    if (formatter.length === 0) {
      return;
    }
    const cts = new CancellationTokenSource();
    this._languageStatusStore.add(toDisposable(() => cts.dispose(true)));
    this._analyzeFormatter(1 /* File */, formatter, document2).then((result) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (typeof result !== "string") {
        return;
      }
      const command4 = { id: `formatter/configure/dfl/${generateUuid()}`, title: localize(16072, null) };
      this._languageStatusStore.add(CommandsRegistry.registerCommand(command4.id, () => this._pickAndPersistDefaultFormatter(formatter, document2)));
      this._languageStatusStore.add(this._languageStatusService.addStatus({
        id: "formatter.conflict",
        name: localize(16085, null),
        selector: { language: document2.getLanguageId(), pattern: document2.uri.fsPath },
        severity: Severity2.Error,
        label: localize(16077, null),
        detail: result,
        busy: false,
        source: "",
        command: command4,
        accessibilityInfo: void 0
      }));
    });
  }
};

DefaultFormatter = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IWorkbenchExtensionEnablementService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, ILanguageFeaturesService),
  __decorateParam(8, ILanguageStatusService),
  __decorateParam(9, IEditorService)
], DefaultFormatter);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  DefaultFormatter,
  3 /* Restored */
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    [DefaultFormatter.configName]: {
      description: localize(16078, null),
      type: ["string", "null"],
      default: null,
      enum: DefaultFormatter.extensionIds,
      enumItemLabels: DefaultFormatter.extensionItemLabels,
      markdownEnumDescriptions: DefaultFormatter.extensionDescriptions
    }
  }
});

async function showFormatterPick(accessor, model, formatters) {
  const quickPickService = accessor.get(IQuickInputService);
  const configService = accessor.get(IConfigurationService);
  const languageService = accessor.get(ILanguageService);
  const overrides = { resource: model.uri, overrideIdentifier: model.getLanguageId() };
  const defaultFormatter = configService.getValue(DefaultFormatter.configName, overrides);
  let defaultFormatterPick;
  const picks = formatters.map((provider, index2) => {
    const isDefault = ExtensionIdentifier.equals(provider.extensionId, defaultFormatter);
    const pick2 = {
      index: index2,
      label: provider.displayName || "",
      description: isDefault ? localize(16070, null) : void 0
    };
    if (isDefault) {
      defaultFormatterPick = pick2;
    }
    return pick2;
  });
  const configurePick = {
    label: localize(16067, null)
  };
  const pick = await quickPickService.pick(
    [...picks, { type: "separator" }, configurePick],
    {
      placeHolder: localize(16074, null),
      activeItem: defaultFormatterPick
    }
  );
  if (!pick) {
    return void 0;
  } else if (pick === configurePick) {
    const langName = languageService.getLanguageName(model.getLanguageId()) || model.getLanguageId();
    const pick2 = await quickPickService.pick(picks, { placeHolder: localize(16084, null, DefaultFormatter._maybeQuotes(langName)) });
    if (pick2 && formatters[pick2.index].extensionId) {
      configService.updateValue(DefaultFormatter.configName, formatters[pick2.index].extensionId.value, overrides);
    }
    return void 0;
  } else {
    return pick.index;
  }
}

registerEditorAction(class FormatDocumentMultipleAction extends EditorAction {
  constructor() {
    super({
      id: "editor.action.formatDocument.multiple",
      label: localize(16075, null),
      alias: "Format Document...",
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasMultipleDocumentFormattingProvider),
      contextMenuOpts: {
        group: "1_modification",
        order: 1.3
      }
    });
  }
  async run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const instaService = accessor.get(IInstantiationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const model = editor.getModel();
    const provider = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
    const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
    if (typeof pick === "number") {
      await instaService.invokeFunction(formatDocumentWithProvider, provider[pick], editor, 1 /* Explicit */, CancellationToken.None);
    }
  }
});

registerEditorAction(class FormatSelectionMultipleAction extends EditorAction {
  constructor() {
    super({
      id: "editor.action.formatSelection.multiple",
      label: localize(16076, null),
      alias: "Format Code...",
      precondition: ContextKeyExpr.and(ContextKeyExpr.and(EditorContextKeys.writable), EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider),
      contextMenuOpts: {
        when: ContextKeyExpr.and(EditorContextKeys.hasNonEmptySelection),
        group: "1_modification",
        order: 1.31
      }
    });
  }
  async run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const instaService = accessor.get(IInstantiationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const model = editor.getModel();
    let range2 = editor.getSelection();
    if (range2.isEmpty()) {
      range2 = new Range2(range2.startLineNumber, 1, range2.startLineNumber, model.getLineMaxColumn(range2.startLineNumber));
    }
    const provider = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
    const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
    if (typeof pick === "number") {
      await instaService.invokeFunction(formatDocumentRangesWithProvider, provider[pick], editor, range2, CancellationToken.None, true);
    }
  }
});
export { showFormatterPick, DefaultFormatter };
