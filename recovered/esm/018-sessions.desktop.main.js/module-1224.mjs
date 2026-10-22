// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLanguageFeatures.ts
import { Disposable, DisposableMap, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { URI } from "./module-0032.mjs";
import { reviveWorkspaceEditDto } from "./module-0944.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { WorkspaceSymbolProviderRegistry } from "./module-1216.mjs";
import { mixin } from "./module-0098.mjs";
import { ProviderId } from "./module-0164.mjs";
import { revive } from "./module-0265.mjs";
import { CancellationError } from "./module-0004.mjs";
import { CallHierarchyProviderRegistry } from "./module-1215.mjs";
import { TypeHierarchyProviderRegistry } from "./module-1217.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IInlineCompletionsUnificationService } from "./module-1223.mjs";
import { DataTransferFileCache } from "./module-1213.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { DataTransfer2 } from "./module-1212.mjs";
import { VSDataTransfer, createStringDataTransferItem } from "./module-0264.mjs";
import { decodeSemanticTokensDto } from "./module-0840.mjs";
import { EditDeltaInfo } from "./module-0377.mjs";
import { DataChannelForwardingTelemetryService, forwardToChannelIf, isCopilotLikeExtension } from "./module-0722.mjs";
import { sendInlineCompletionsEndOfLifeTelemetry } from "./module-0723.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";


// src/vs/workbench/api/browser/mainThreadLanguageFeatures.ts
var MainThreadLanguageFeatures = class extends Disposable {
  constructor(extHostContext, _languageService, _languageConfigurationService, _languageFeaturesService, _uriIdentService, _instantiationService, _inlineCompletionsUnificationService) {
    super();
    this._languageService = _languageService;
    this._languageConfigurationService = _languageConfigurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._uriIdentService = _uriIdentService;
    this._instantiationService = _instantiationService;
    this._inlineCompletionsUnificationService = _inlineCompletionsUnificationService;
    this._registrations = this._register(new DisposableMap());
    // --- copy paste action provider
    this._pasteEditProviders = /* @__PURE__ */ new Map();
    // --- document drop Edits
    this._documentOnDropEditProviders = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostLanguageFeatures);
    if (this._languageService) {
      const updateAllWordDefinitions = () => {
        const wordDefinitionDtos = [];
        for (const languageId of _languageService.getRegisteredLanguageIds()) {
          const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(languageId).getWordDefinition();
          wordDefinitionDtos.push({
            languageId,
            regexSource: wordDefinition.source,
            regexFlags: wordDefinition.flags
          });
        }
        this._proxy.$setWordDefinitions(wordDefinitionDtos);
      };
      this._register(this._languageConfigurationService.onDidChange((e4) => {
        if (!e4.languageId) {
          updateAllWordDefinitions();
        } else {
          const wordDefinition = this._languageConfigurationService.getLanguageConfiguration(e4.languageId).getWordDefinition();
          this._proxy.$setWordDefinitions([{
            languageId: e4.languageId,
            regexSource: wordDefinition.source,
            regexFlags: wordDefinition.flags
          }]);
        }
      }));
      updateAllWordDefinitions();
    }
    if (this._inlineCompletionsUnificationService) {
      this._register(this._inlineCompletionsUnificationService.onDidStateChange(() => {
        this._proxy.$acceptInlineCompletionsUnificationState(this._inlineCompletionsUnificationService.state);
      }));
      this._proxy.$acceptInlineCompletionsUnificationState(this._inlineCompletionsUnificationService.state);
    }
  }
  $unregister(handle2) {
    this._registrations.deleteAndDispose(handle2);
  }
  static _reviveLocationDto(data) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      data.forEach((l) => MainThreadLanguageFeatures._reviveLocationDto(l));
      return data;
    } else {
      data.uri = URI.revive(data.uri);
      return data;
    }
  }
  static _reviveLocationLinkDto(data) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      data.forEach((l) => MainThreadLanguageFeatures._reviveLocationLinkDto(l));
      return data;
    } else {
      data.uri = URI.revive(data.uri);
      return data;
    }
  }
  static _reviveWorkspaceSymbolDto(data) {
    if (!data) {
      return data;
    } else if (Array.isArray(data)) {
      data.forEach(MainThreadLanguageFeatures._reviveWorkspaceSymbolDto);
      return data;
    } else {
      data.location = MainThreadLanguageFeatures._reviveLocationDto(data.location);
      return data;
    }
  }
  static _reviveCodeActionDto(data, uriIdentService) {
    data?.forEach((code) => reviveWorkspaceEditDto(code.edit, uriIdentService));
    return data;
  }
  static _reviveLinkDTO(data) {
    if (data.url && typeof data.url !== "string") {
      data.url = URI.revive(data.url);
    }
    return data;
  }
  static _reviveCallHierarchyItemDto(data) {
    if (data) {
      data.uri = URI.revive(data.uri);
    }
    return data;
  }
  static _reviveTypeHierarchyItemDto(data) {
    if (data) {
      data.uri = URI.revive(data.uri);
    }
    return data;
  }
  //#endregion
  // --- outline
  $registerDocumentSymbolProvider(handle2, selector, displayName) {
    this._registrations.set(handle2, this._languageFeaturesService.documentSymbolProvider.register(selector, {
      displayName,
      provideDocumentSymbols: (model, token) => {
        return this._proxy.$provideDocumentSymbols(handle2, model.uri, token);
      }
    }));
  }
  // --- code lens
  $registerCodeLensSupport(handle2, selector, eventHandle) {
    const provider = {
      provideCodeLenses: async (model, token) => {
        const listDto = await this._proxy.$provideCodeLenses(handle2, model.uri, token);
        if (!listDto) {
          return void 0;
        }
        return {
          lenses: listDto.lenses,
          dispose: () => listDto.cacheId && this._proxy.$releaseCodeLenses(handle2, listDto.cacheId)
        };
      },
      resolveCodeLens: async (model, codeLens, token) => {
        const result = await this._proxy.$resolveCodeLens(handle2, codeLens, token);
        if (!result || token.isCancellationRequested) {
          return void 0;
        }
        return {
          ...result,
          range: model.validateRange(result.range)
        };
      }
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChange = emitter.event;
    }
    this._registrations.set(handle2, this._languageFeaturesService.codeLensProvider.register(selector, provider));
  }
  $emitCodeLensEvent(eventHandle, event) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  // --- declaration
  $registerDefinitionSupport(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.definitionProvider.register(selector, {
      provideDefinition: (model, position2, token) => {
        return this._proxy.$provideDefinition(handle2, model.uri, position2, token).then(MainThreadLanguageFeatures._reviveLocationLinkDto);
      }
    }));
  }
  $registerDeclarationSupport(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.declarationProvider.register(selector, {
      provideDeclaration: (model, position2, token) => {
        return this._proxy.$provideDeclaration(handle2, model.uri, position2, token).then(MainThreadLanguageFeatures._reviveLocationLinkDto);
      }
    }));
  }
  $registerImplementationSupport(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.implementationProvider.register(selector, {
      provideImplementation: (model, position2, token) => {
        return this._proxy.$provideImplementation(handle2, model.uri, position2, token).then(MainThreadLanguageFeatures._reviveLocationLinkDto);
      }
    }));
  }
  $registerTypeDefinitionSupport(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.typeDefinitionProvider.register(selector, {
      provideTypeDefinition: (model, position2, token) => {
        return this._proxy.$provideTypeDefinition(handle2, model.uri, position2, token).then(MainThreadLanguageFeatures._reviveLocationLinkDto);
      }
    }));
  }
  // --- extra info
  $registerHoverProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.hoverProvider.register(selector, {
      provideHover: async (model, position2, token, context2) => {
        const serializedContext = {
          verbosityRequest: context2?.verbosityRequest ? {
            verbosityDelta: context2.verbosityRequest.verbosityDelta,
            previousHover: { id: context2.verbosityRequest.previousHover.id }
          } : void 0
        };
        const hover = await this._proxy.$provideHover(handle2, model.uri, position2, serializedContext, token);
        return hover;
      }
    }));
  }
  // --- debug hover
  $registerEvaluatableExpressionProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.evaluatableExpressionProvider.register(selector, {
      provideEvaluatableExpression: (model, position2, token) => {
        return this._proxy.$provideEvaluatableExpression(handle2, model.uri, position2, token);
      }
    }));
  }
  // --- inline values
  $registerInlineValuesProvider(handle2, selector, eventHandle) {
    const provider = {
      provideInlineValues: (model, viewPort, context2, token) => {
        return this._proxy.$provideInlineValues(handle2, model.uri, viewPort, context2, token);
      }
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChangeInlineValues = emitter.event;
    }
    this._registrations.set(handle2, this._languageFeaturesService.inlineValuesProvider.register(selector, provider));
  }
  $emitInlineValuesEvent(eventHandle, event) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  // --- occurrences
  $registerDocumentHighlightProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.documentHighlightProvider.register(selector, {
      provideDocumentHighlights: (model, position2, token) => {
        return this._proxy.$provideDocumentHighlights(handle2, model.uri, position2, token);
      }
    }));
  }
  $registerMultiDocumentHighlightProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.multiDocumentHighlightProvider.register(selector, {
      selector,
      provideMultiDocumentHighlights: (model, position2, otherModels, token) => {
        return this._proxy.$provideMultiDocumentHighlights(handle2, model.uri, position2, otherModels.map((model2) => model2.uri), token).then((dto) => {
          if (dto === void 0 || dto === null) {
            return void 0;
          }
          const result = new ResourceMap();
          dto?.forEach((value2) => {
            const uri4 = URI.revive(value2.uri);
            if (result.has(uri4)) {
              result.get(uri4).push(...value2.highlights);
            } else {
              result.set(uri4, value2.highlights);
            }
          });
          return result;
        });
      }
    }));
  }
  // --- linked editing
  $registerLinkedEditingRangeProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.linkedEditingRangeProvider.register(selector, {
      provideLinkedEditingRanges: async (model, position2, token) => {
        const res = await this._proxy.$provideLinkedEditingRanges(handle2, model.uri, position2, token);
        if (res) {
          return {
            ranges: res.ranges,
            wordPattern: res.wordPattern ? MainThreadLanguageFeatures._reviveRegExp(res.wordPattern) : void 0
          };
        }
        return void 0;
      }
    }));
  }
  // --- references
  $registerReferenceSupport(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.referenceProvider.register(selector, {
      provideReferences: (model, position2, context2, token) => {
        return this._proxy.$provideReferences(handle2, model.uri, position2, context2, token).then(MainThreadLanguageFeatures._reviveLocationDto);
      }
    }));
  }
  // --- code actions
  $registerCodeActionSupport(handle2, selector, metadata, displayName, extensionId, supportsResolve) {
    const provider = {
      provideCodeActions: async (model, rangeOrSelection, context2, token) => {
        const listDto = await this._proxy.$provideCodeActions(handle2, model.uri, rangeOrSelection, context2, token);
        if (!listDto) {
          return void 0;
        }
        return {
          actions: MainThreadLanguageFeatures._reviveCodeActionDto(listDto.actions, this._uriIdentService),
          dispose: () => {
            if (typeof listDto.cacheId === "number") {
              this._proxy.$releaseCodeActions(handle2, listDto.cacheId);
            }
          }
        };
      },
      providedCodeActionKinds: metadata.providedKinds,
      documentation: metadata.documentation,
      displayName,
      extensionId
    };
    if (supportsResolve) {
      provider.resolveCodeAction = async (codeAction, token) => {
        const resolved = await this._proxy.$resolveCodeAction(handle2, codeAction.cacheId, token);
        if (resolved.edit) {
          codeAction.edit = reviveWorkspaceEditDto(resolved.edit, this._uriIdentService);
        }
        if (resolved.command) {
          codeAction.command = resolved.command;
        }
        return codeAction;
      };
    }
    this._registrations.set(handle2, this._languageFeaturesService.codeActionProvider.register(selector, provider));
  }
  $registerPasteEditProvider(handle2, selector, metadata) {
    const provider = new MainThreadPasteEditProvider(handle2, this._proxy, metadata, this._uriIdentService);
    this._pasteEditProviders.set(handle2, provider);
    this._registrations.set(handle2, combinedDisposable(
      this._languageFeaturesService.documentPasteEditProvider.register(selector, provider),
      toDisposable(() => this._pasteEditProviders.delete(handle2))
    ));
  }
  $resolvePasteFileData(handle2, requestId, dataId) {
    const provider = this._pasteEditProviders.get(handle2);
    if (!provider) {
      throw new Error("Could not find provider");
    }
    return provider.resolveFileData(requestId, dataId);
  }
  // --- formatting
  $registerDocumentFormattingSupport(handle2, selector, extensionId, displayName) {
    this._registrations.set(handle2, this._languageFeaturesService.documentFormattingEditProvider.register(selector, {
      extensionId,
      displayName,
      provideDocumentFormattingEdits: (model, options3, token) => {
        return this._proxy.$provideDocumentFormattingEdits(handle2, model.uri, options3, token);
      }
    }));
  }
  $registerRangeFormattingSupport(handle2, selector, extensionId, displayName, supportsRanges) {
    this._registrations.set(handle2, this._languageFeaturesService.documentRangeFormattingEditProvider.register(selector, {
      extensionId,
      displayName,
      provideDocumentRangeFormattingEdits: (model, range2, options3, token) => {
        return this._proxy.$provideDocumentRangeFormattingEdits(handle2, model.uri, range2, options3, token);
      },
      provideDocumentRangesFormattingEdits: !supportsRanges ? void 0 : (model, ranges, options3, token) => {
        return this._proxy.$provideDocumentRangesFormattingEdits(handle2, model.uri, ranges, options3, token);
      }
    }));
  }
  $registerOnTypeFormattingSupport(handle2, selector, autoFormatTriggerCharacters, extensionId) {
    this._registrations.set(handle2, this._languageFeaturesService.onTypeFormattingEditProvider.register(selector, {
      extensionId,
      autoFormatTriggerCharacters,
      provideOnTypeFormattingEdits: (model, position2, ch, options3, token) => {
        return this._proxy.$provideOnTypeFormattingEdits(handle2, model.uri, position2, ch, options3, token);
      }
    }));
  }
  // --- navigate type
  $registerNavigateTypeSupport(handle2, supportsResolve) {
    let lastResultId;
    const provider = {
      provideWorkspaceSymbols: async (search2, token) => {
        const result = await this._proxy.$provideWorkspaceSymbols(handle2, search2, token);
        if (lastResultId !== void 0) {
          this._proxy.$releaseWorkspaceSymbols(handle2, lastResultId);
        }
        lastResultId = result.cacheId;
        return MainThreadLanguageFeatures._reviveWorkspaceSymbolDto(result.symbols);
      }
    };
    if (supportsResolve) {
      provider.resolveWorkspaceSymbol = async (item, token) => {
        const resolvedItem = await this._proxy.$resolveWorkspaceSymbol(handle2, item, token);
        return resolvedItem && MainThreadLanguageFeatures._reviveWorkspaceSymbolDto(resolvedItem);
      };
    }
    this._registrations.set(handle2, WorkspaceSymbolProviderRegistry.register(provider));
  }
  // --- rename
  $registerRenameSupport(handle2, selector, supportResolveLocation) {
    this._registrations.set(handle2, this._languageFeaturesService.renameProvider.register(selector, {
      provideRenameEdits: (model, position2, newName, token) => {
        return this._proxy.$provideRenameEdits(handle2, model.uri, position2, newName, token).then((data) => reviveWorkspaceEditDto(data, this._uriIdentService));
      },
      resolveRenameLocation: supportResolveLocation ? (model, position2, token) => this._proxy.$resolveRenameLocation(handle2, model.uri, position2, token) : void 0
    }));
  }
  $registerNewSymbolNamesProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.newSymbolNamesProvider.register(selector, {
      supportsAutomaticNewSymbolNamesTriggerKind: this._proxy.$supportsAutomaticNewSymbolNamesTriggerKind(handle2),
      provideNewSymbolNames: (model, range2, triggerKind, token) => {
        return this._proxy.$provideNewSymbolNames(handle2, model.uri, range2, triggerKind, token);
      }
    }));
  }
  // --- semantic tokens
  $registerDocumentSemanticTokensProvider(handle2, selector, legend, eventHandle) {
    let event = void 0;
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      event = emitter.event;
    }
    this._registrations.set(handle2, this._languageFeaturesService.documentSemanticTokensProvider.register(selector, new MainThreadDocumentSemanticTokensProvider(this._proxy, handle2, legend, event)));
  }
  $emitDocumentSemanticTokensEvent(eventHandle) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(void 0);
    }
  }
  $emitDocumentRangeSemanticTokensEvent(eventHandle) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(void 0);
    }
  }
  $registerDocumentRangeSemanticTokensProvider(handle2, selector, legend, eventHandle) {
    let event = void 0;
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      event = emitter.event;
    }
    this._registrations.set(handle2, this._languageFeaturesService.documentRangeSemanticTokensProvider.register(selector, new MainThreadDocumentRangeSemanticTokensProvider(this._proxy, handle2, legend, event)));
  }
  // --- suggest
  static _inflateSuggestDto(defaultRange, data, extensionId) {
    const label3 = data["a" /* label */];
    const commandId = data["o" /* commandId */];
    const commandIdent = data["n" /* commandIdent */];
    const commitChars = data["k" /* commitCharacters */];
    let command4;
    if (commandId) {
      command4 = {
        $ident: commandIdent,
        id: commandId,
        title: "",
        arguments: commandIdent ? [commandIdent] : data["p" /* commandArguments */]
        // Automatically fill in ident as first argument
      };
    }
    return {
      label: label3,
      extensionId,
      kind: data["b" /* kind */] ?? 9 /* Property */,
      tags: data["m" /* kindModifier */],
      detail: data["c" /* detail */],
      documentation: data["d" /* documentation */],
      sortText: data["e" /* sortText */],
      filterText: data["f" /* filterText */],
      preselect: data["g" /* preselect */],
      insertText: data["h" /* insertText */] ?? (typeof label3 === "string" ? label3 : label3.label),
      range: data["j" /* range */] ?? defaultRange,
      insertTextRules: data["i" /* insertTextRules */],
      commitCharacters: commitChars ? Array.from(commitChars) : void 0,
      additionalTextEdits: data["l" /* additionalTextEdits */],
      command: command4,
      // not-standard
      _id: data.x
    };
  }
  $registerCompletionsProvider(handle2, selector, triggerCharacters, supportsResolveDetails, extensionId) {
    const provider = {
      triggerCharacters,
      _debugDisplayName: `${extensionId.value}(${triggerCharacters.join("")})`,
      provideCompletionItems: async (model, position2, context2, token) => {
        const result = await this._proxy.$provideCompletionItems(handle2, model.uri, position2, context2, token);
        if (!result) {
          return result;
        }
        return {
          suggestions: result["b" /* completions */].map((d) => MainThreadLanguageFeatures._inflateSuggestDto(result["a" /* defaultRanges */], d, extensionId)),
          incomplete: result["c" /* isIncomplete */] || false,
          duration: result["d" /* duration */],
          dispose: () => {
            if (typeof result.x === "number") {
              this._proxy.$releaseCompletionItems(handle2, result.x);
            }
          }
        };
      }
    };
    if (supportsResolveDetails) {
      provider.resolveCompletionItem = (suggestion, token) => {
        return this._proxy.$resolveCompletionItem(handle2, suggestion._id, token).then((result) => {
          if (!result) {
            return suggestion;
          }
          const newSuggestion = MainThreadLanguageFeatures._inflateSuggestDto(suggestion.range, result, extensionId);
          return mixin(suggestion, newSuggestion, true);
        });
      };
    }
    this._registrations.set(handle2, this._languageFeaturesService.completionProvider.register(selector, provider));
  }
  $registerInlineCompletionsSupport(handle2, selector, supportsHandleEvents, extensionId, extensionVersion, groupId, yieldsToExtensionIds, displayName, debounceDelayMs, excludesExtensionIds, supportsOnDidChange, supportsSetModelId, initialModelInfo, supportsOnDidChangeModelInfo, supportsSetProviderOption, initialProviderOptions, supportsOnDidChangeProviderOptions) {
    const providerId = new ProviderId(extensionId, extensionVersion, groupId);
    const provider = this._instantiationService.createInstance(
      ExtensionBackedInlineCompletionsProvider,
      handle2,
      groupId ?? extensionId,
      providerId,
      yieldsToExtensionIds,
      excludesExtensionIds,
      debounceDelayMs,
      displayName,
      initialModelInfo,
      supportsHandleEvents,
      supportsSetModelId,
      supportsOnDidChange,
      supportsOnDidChangeModelInfo,
      initialProviderOptions,
      supportsSetProviderOption,
      supportsOnDidChangeProviderOptions,
      selector,
      this._proxy
    );
    this._registrations.set(handle2, provider);
  }
  $emitInlineCompletionsChange(handle2, changeHint) {
    const obj = this._registrations.get(handle2);
    if (obj instanceof ExtensionBackedInlineCompletionsProvider) {
      obj._emitDidChange(changeHint);
    }
  }
  $emitInlineCompletionModelInfoChange(handle2, data) {
    const obj = this._registrations.get(handle2);
    if (obj instanceof ExtensionBackedInlineCompletionsProvider) {
      obj._setModelInfo(data);
    }
  }
  $emitInlineCompletionProviderOptionsChange(handle2, data) {
    const obj = this._registrations.get(handle2);
    if (obj instanceof ExtensionBackedInlineCompletionsProvider) {
      obj._setProviderOptions(data);
    }
  }
  // --- parameter hints
  $registerSignatureHelpProvider(handle2, selector, metadata) {
    this._registrations.set(handle2, this._languageFeaturesService.signatureHelpProvider.register(selector, {
      signatureHelpTriggerCharacters: metadata.triggerCharacters,
      signatureHelpRetriggerCharacters: metadata.retriggerCharacters,
      provideSignatureHelp: async (model, position2, token, context2) => {
        const result = await this._proxy.$provideSignatureHelp(handle2, model.uri, position2, context2, token);
        if (!result) {
          return void 0;
        }
        return {
          value: result,
          dispose: () => {
            this._proxy.$releaseSignatureHelp(handle2, result.id);
          }
        };
      }
    }));
  }
  // --- inline hints
  $registerInlayHintsProvider(handle2, selector, supportsResolve, eventHandle, displayName) {
    const provider = {
      displayName,
      provideInlayHints: async (model, range2, token) => {
        const result = await this._proxy.$provideInlayHints(handle2, model.uri, range2, token);
        if (!result) {
          return;
        }
        return {
          hints: revive(result.hints),
          dispose: () => {
            if (result.cacheId) {
              this._proxy.$releaseInlayHints(handle2, result.cacheId);
            }
          }
        };
      }
    };
    if (supportsResolve) {
      provider.resolveInlayHint = async (hint, token) => {
        const dto = hint;
        if (!dto.cacheId) {
          return hint;
        }
        const result = await this._proxy.$resolveInlayHint(handle2, dto.cacheId, token);
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        if (!result) {
          return hint;
        }
        return {
          ...hint,
          tooltip: result.tooltip,
          label: revive(result.label),
          textEdits: result.textEdits
        };
      };
    }
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChangeInlayHints = emitter.event;
    }
    this._registrations.set(handle2, this._languageFeaturesService.inlayHintsProvider.register(selector, provider));
  }
  $emitInlayHintsEvent(eventHandle) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(void 0);
    }
  }
  // --- links
  $registerDocumentLinkProvider(handle2, selector, supportsResolve) {
    const provider = {
      provideLinks: (model, token) => {
        return this._proxy.$provideDocumentLinks(handle2, model.uri, token).then((dto) => {
          if (!dto) {
            return void 0;
          }
          return {
            links: dto.links.map(MainThreadLanguageFeatures._reviveLinkDTO),
            dispose: () => {
              if (typeof dto.cacheId === "number") {
                this._proxy.$releaseDocumentLinks(handle2, dto.cacheId);
              }
            }
          };
        });
      }
    };
    if (supportsResolve) {
      provider.resolveLink = (link2, token) => {
        const dto = link2;
        if (!dto.cacheId) {
          return link2;
        }
        return this._proxy.$resolveDocumentLink(handle2, dto.cacheId, token).then((obj) => {
          return obj && MainThreadLanguageFeatures._reviveLinkDTO(obj);
        });
      };
    }
    this._registrations.set(handle2, this._languageFeaturesService.linkProvider.register(selector, provider));
  }
  // --- colors
  $registerDocumentColorProvider(handle2, selector) {
    const proxy = this._proxy;
    this._registrations.set(handle2, this._languageFeaturesService.colorProvider.register(selector, {
      provideDocumentColors: (model, token) => {
        return proxy.$provideDocumentColors(handle2, model.uri, token).then((documentColors) => {
          return documentColors.map((documentColor) => {
            const [red, green, blue, alpha] = documentColor.color;
            const color2 = {
              red,
              green,
              blue,
              alpha
            };
            return {
              color: color2,
              range: documentColor.range
            };
          });
        });
      },
      provideColorPresentations: (model, colorInfo, token) => {
        return proxy.$provideColorPresentations(handle2, model.uri, {
          color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha],
          range: colorInfo.range
        }, token);
      }
    }));
  }
  // --- folding
  $registerFoldingRangeProvider(handle2, selector, extensionId, eventHandle) {
    const provider = {
      id: extensionId.value,
      provideFoldingRanges: (model, context2, token) => {
        return this._proxy.$provideFoldingRanges(handle2, model.uri, context2, token);
      }
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._registrations.set(eventHandle, emitter);
      provider.onDidChange = emitter.event;
    }
    this._registrations.set(handle2, this._languageFeaturesService.foldingRangeProvider.register(selector, provider));
  }
  $emitFoldingRangeEvent(eventHandle, event) {
    const obj = this._registrations.get(eventHandle);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  // -- smart select
  $registerSelectionRangeProvider(handle2, selector) {
    this._registrations.set(handle2, this._languageFeaturesService.selectionRangeProvider.register(selector, {
      provideSelectionRanges: (model, positions, token) => {
        return this._proxy.$provideSelectionRanges(handle2, model.uri, positions, token);
      }
    }));
  }
  // --- call hierarchy
  $registerCallHierarchyProvider(handle2, selector) {
    this._registrations.set(handle2, CallHierarchyProviderRegistry.register(selector, {
      prepareCallHierarchy: async (document2, position2, token) => {
        const items = await this._proxy.$prepareCallHierarchy(handle2, document2.uri, position2, token);
        if (!items || items.length === 0) {
          return void 0;
        }
        return {
          dispose: () => {
            for (const item of items) {
              this._proxy.$releaseCallHierarchy(handle2, item._sessionId);
            }
          },
          roots: items.map(MainThreadLanguageFeatures._reviveCallHierarchyItemDto)
        };
      },
      provideOutgoingCalls: async (item, token) => {
        const outgoing = await this._proxy.$provideCallHierarchyOutgoingCalls(handle2, item._sessionId, item._itemId, token);
        if (!outgoing) {
          return outgoing;
        }
        outgoing.forEach((value2) => {
          value2.to = MainThreadLanguageFeatures._reviveCallHierarchyItemDto(value2.to);
        });
        return outgoing;
      },
      provideIncomingCalls: async (item, token) => {
        const incoming = await this._proxy.$provideCallHierarchyIncomingCalls(handle2, item._sessionId, item._itemId, token);
        if (!incoming) {
          return incoming;
        }
        incoming.forEach((value2) => {
          value2.from = MainThreadLanguageFeatures._reviveCallHierarchyItemDto(value2.from);
        });
        return incoming;
      }
    }));
  }
  // --- configuration
  static _reviveRegExp(regExp) {
    return new RegExp(regExp.pattern, regExp.flags);
  }
  static _reviveIndentationRule(indentationRule) {
    return {
      decreaseIndentPattern: MainThreadLanguageFeatures._reviveRegExp(indentationRule.decreaseIndentPattern),
      increaseIndentPattern: MainThreadLanguageFeatures._reviveRegExp(indentationRule.increaseIndentPattern),
      indentNextLinePattern: indentationRule.indentNextLinePattern ? MainThreadLanguageFeatures._reviveRegExp(indentationRule.indentNextLinePattern) : void 0,
      unIndentedLinePattern: indentationRule.unIndentedLinePattern ? MainThreadLanguageFeatures._reviveRegExp(indentationRule.unIndentedLinePattern) : void 0
    };
  }
  static _reviveOnEnterRule(onEnterRule) {
    return {
      beforeText: MainThreadLanguageFeatures._reviveRegExp(onEnterRule.beforeText),
      afterText: onEnterRule.afterText ? MainThreadLanguageFeatures._reviveRegExp(onEnterRule.afterText) : void 0,
      previousLineText: onEnterRule.previousLineText ? MainThreadLanguageFeatures._reviveRegExp(onEnterRule.previousLineText) : void 0,
      action: onEnterRule.action
    };
  }
  static _reviveOnEnterRules(onEnterRules) {
    return onEnterRules.map(MainThreadLanguageFeatures._reviveOnEnterRule);
  }
  $setLanguageConfiguration(handle2, languageId, _configuration) {
    const configuration2 = {
      comments: _configuration.comments,
      brackets: _configuration.brackets,
      wordPattern: _configuration.wordPattern ? MainThreadLanguageFeatures._reviveRegExp(_configuration.wordPattern) : void 0,
      indentationRules: _configuration.indentationRules ? MainThreadLanguageFeatures._reviveIndentationRule(_configuration.indentationRules) : void 0,
      onEnterRules: _configuration.onEnterRules ? MainThreadLanguageFeatures._reviveOnEnterRules(_configuration.onEnterRules) : void 0,
      autoClosingPairs: void 0,
      surroundingPairs: void 0,
      __electricCharacterSupport: void 0
    };
    if (_configuration.autoClosingPairs) {
      configuration2.autoClosingPairs = _configuration.autoClosingPairs;
    } else if (_configuration.__characterPairSupport) {
      configuration2.autoClosingPairs = _configuration.__characterPairSupport.autoClosingPairs;
    }
    if (_configuration.__electricCharacterSupport && _configuration.__electricCharacterSupport.docComment) {
      configuration2.__electricCharacterSupport = {
        docComment: {
          open: _configuration.__electricCharacterSupport.docComment.open,
          close: _configuration.__electricCharacterSupport.docComment.close
        }
      };
    }
    if (this._languageService.isRegisteredLanguageId(languageId)) {
      this._registrations.set(handle2, this._languageConfigurationService.register(languageId, configuration2, 100));
    }
  }
  // --- type hierarchy
  $registerTypeHierarchyProvider(handle2, selector) {
    this._registrations.set(handle2, TypeHierarchyProviderRegistry.register(selector, {
      prepareTypeHierarchy: async (document2, position2, token) => {
        const items = await this._proxy.$prepareTypeHierarchy(handle2, document2.uri, position2, token);
        if (!items) {
          return void 0;
        }
        return {
          dispose: () => {
            for (const item of items) {
              this._proxy.$releaseTypeHierarchy(handle2, item._sessionId);
            }
          },
          roots: items.map(MainThreadLanguageFeatures._reviveTypeHierarchyItemDto)
        };
      },
      provideSupertypes: async (item, token) => {
        const supertypes = await this._proxy.$provideTypeHierarchySupertypes(handle2, item._sessionId, item._itemId, token);
        if (!supertypes) {
          return supertypes;
        }
        return supertypes.map(MainThreadLanguageFeatures._reviveTypeHierarchyItemDto);
      },
      provideSubtypes: async (item, token) => {
        const subtypes = await this._proxy.$provideTypeHierarchySubtypes(handle2, item._sessionId, item._itemId, token);
        if (!subtypes) {
          return subtypes;
        }
        return subtypes.map(MainThreadLanguageFeatures._reviveTypeHierarchyItemDto);
      }
    }));
  }
  $registerDocumentOnDropEditProvider(handle2, selector, metadata) {
    const provider = new MainThreadDocumentOnDropEditProvider(handle2, this._proxy, metadata, this._uriIdentService);
    this._documentOnDropEditProviders.set(handle2, provider);
    this._registrations.set(handle2, combinedDisposable(
      this._languageFeaturesService.documentDropEditProvider.register(selector, provider),
      toDisposable(() => this._documentOnDropEditProviders.delete(handle2))
    ));
  }
  async $resolveDocumentOnDropFileData(handle2, requestId, dataId) {
    const provider = this._documentOnDropEditProviders.get(handle2);
    if (!provider) {
      throw new Error("Could not find provider");
    }
    return provider.resolveDocumentOnDropFileData(requestId, dataId);
  }
};

MainThreadLanguageFeatures = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguageFeatures),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, ILanguageConfigurationService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IInlineCompletionsUnificationService)
], MainThreadLanguageFeatures);

var MainThreadPasteEditProvider = class {
  constructor(_handle, _proxy, metadata, _uriIdentService) {
    this._handle = _handle;
    this._proxy = _proxy;
    this._uriIdentService = _uriIdentService;
    this.dataTransfers = new DataTransferFileCache();
    this.copyMimeTypes = metadata.copyMimeTypes ?? [];
    this.pasteMimeTypes = metadata.pasteMimeTypes ?? [];
    this.providedPasteEditKinds = metadata.providedPasteEditKinds?.map((kind) => new HierarchicalKind(kind)) ?? [];
    if (metadata.supportsCopy) {
      this.prepareDocumentPaste = async (model, selections, dataTransfer, token) => {
        const dataTransferDto = await DataTransfer2.fromList(dataTransfer);
        if (token.isCancellationRequested) {
          return void 0;
        }
        const newDataTransfer = await this._proxy.$prepareDocumentPaste(_handle, model.uri, selections, dataTransferDto, token);
        if (!newDataTransfer) {
          return void 0;
        }
        const dataTransferOut = new VSDataTransfer();
        for (const [type, item] of newDataTransfer.items) {
          dataTransferOut.replace(type, createStringDataTransferItem(item.asString, item.id));
        }
        return dataTransferOut;
      };
    }
    if (metadata.supportsPaste) {
      this.provideDocumentPasteEdits = async (model, selections, dataTransfer, context2, token) => {
        const request2 = this.dataTransfers.add(dataTransfer);
        try {
          const dataTransferDto = await DataTransfer2.fromList(dataTransfer);
          if (token.isCancellationRequested) {
            return;
          }
          const edits = await this._proxy.$providePasteEdits(this._handle, request2.id, model.uri, selections, dataTransferDto, {
            only: context2.only?.value,
            triggerKind: context2.triggerKind
          }, token);
          if (!edits) {
            return;
          }
          return {
            edits: edits.map((edit3) => {
              return {
                ...edit3,
                kind: edit3.kind ? new HierarchicalKind(edit3.kind.value) : new HierarchicalKind(""),
                yieldTo: edit3.yieldTo?.map((x) => ({ kind: new HierarchicalKind(x) })),
                additionalEdit: edit3.additionalEdit ? reviveWorkspaceEditDto(edit3.additionalEdit, this._uriIdentService, (dataId) => this.resolveFileData(request2.id, dataId)) : void 0
              };
            }),
            dispose: () => {
              this._proxy.$releasePasteEdits(this._handle, request2.id);
            }
          };
        } finally {
          request2.dispose();
        }
      };
    }
    if (metadata.supportsResolve) {
      this.resolveDocumentPasteEdit = async (edit3, token) => {
        const resolved = await this._proxy.$resolvePasteEdit(this._handle, edit3._cacheId, token);
        if (typeof resolved.insertText !== "undefined") {
          edit3.insertText = resolved.insertText;
        }
        if (resolved.additionalEdit) {
          edit3.additionalEdit = reviveWorkspaceEditDto(resolved.additionalEdit, this._uriIdentService);
        }
        return edit3;
      };
    }
  }
  resolveFileData(requestId, dataId) {
    return this.dataTransfers.resolveFileData(requestId, dataId);
  }
};

MainThreadPasteEditProvider = __decorateClass([
  __decorateParam(3, IUriIdentityService)
], MainThreadPasteEditProvider);

var MainThreadDocumentOnDropEditProvider = class {
  constructor(_handle, _proxy, metadata, _uriIdentService) {
    this._handle = _handle;
    this._proxy = _proxy;
    this._uriIdentService = _uriIdentService;
    this.dataTransfers = new DataTransferFileCache();
    this.dropMimeTypes = metadata?.dropMimeTypes ?? ["*/*"];
    this.providedDropEditKinds = metadata?.providedDropKinds?.map((kind) => new HierarchicalKind(kind));
    if (metadata?.supportsResolve) {
      this.resolveDocumentDropEdit = async (edit3, token) => {
        const resolved = await this._proxy.$resolvePasteEdit(this._handle, edit3._cacheId, token);
        if (resolved.additionalEdit) {
          edit3.additionalEdit = reviveWorkspaceEditDto(resolved.additionalEdit, this._uriIdentService);
        }
        return edit3;
      };
    }
  }
  async provideDocumentDropEdits(model, position2, dataTransfer, token) {
    const request2 = this.dataTransfers.add(dataTransfer);
    try {
      const dataTransferDto = await DataTransfer2.fromList(dataTransfer);
      if (token.isCancellationRequested) {
        return;
      }
      const edits = await this._proxy.$provideDocumentOnDropEdits(this._handle, request2.id, model.uri, position2, dataTransferDto, token);
      if (!edits) {
        return;
      }
      return {
        edits: edits.map((edit3) => {
          return {
            ...edit3,
            yieldTo: edit3.yieldTo?.map((x) => ({ kind: new HierarchicalKind(x) })),
            kind: edit3.kind ? new HierarchicalKind(edit3.kind) : void 0,
            additionalEdit: reviveWorkspaceEditDto(edit3.additionalEdit, this._uriIdentService, (dataId) => this.resolveDocumentOnDropFileData(request2.id, dataId))
          };
        }),
        dispose: () => {
          this._proxy.$releaseDocumentOnDropEdits(this._handle, request2.id);
        }
      };
    } finally {
      request2.dispose();
    }
  }
  resolveDocumentOnDropFileData(requestId, dataId) {
    return this.dataTransfers.resolveFileData(requestId, dataId);
  }
};

MainThreadDocumentOnDropEditProvider = __decorateClass([
  __decorateParam(3, IUriIdentityService)
], MainThreadDocumentOnDropEditProvider);

var MainThreadDocumentSemanticTokensProvider = class {
  constructor(_proxy, _handle, _legend, onDidChange) {
    this._proxy = _proxy;
    this._handle = _handle;
    this._legend = _legend;
    this.onDidChange = onDidChange;
  }
  releaseDocumentSemanticTokens(resultId) {
    if (resultId) {
      this._proxy.$releaseDocumentSemanticTokens(this._handle, parseInt(resultId, 10));
    }
  }
  getLegend() {
    return this._legend;
  }
  async provideDocumentSemanticTokens(model, lastResultId, token) {
    const nLastResultId = lastResultId ? parseInt(lastResultId, 10) : 0;
    const encodedDto = await this._proxy.$provideDocumentSemanticTokens(this._handle, model.uri, nLastResultId, token);
    if (!encodedDto) {
      return null;
    }
    if (token.isCancellationRequested) {
      return null;
    }
    const dto = decodeSemanticTokensDto(encodedDto);
    if (dto.type === "full") {
      return {
        resultId: String(dto.id),
        data: dto.data
      };
    }
    return {
      resultId: String(dto.id),
      edits: dto.deltas
    };
  }
};

var MainThreadDocumentRangeSemanticTokensProvider = class {
  constructor(_proxy, _handle, _legend, onDidChange) {
    this._proxy = _proxy;
    this._handle = _handle;
    this._legend = _legend;
    this.onDidChange = onDidChange;
  }
  getLegend() {
    return this._legend;
  }
  async provideDocumentRangeSemanticTokens(model, range2, token) {
    const encodedDto = await this._proxy.$provideDocumentRangeSemanticTokens(this._handle, model.uri, range2, token);
    if (!encodedDto) {
      return null;
    }
    if (token.isCancellationRequested) {
      return null;
    }
    const dto = decodeSemanticTokensDto(encodedDto);
    if (dto.type === "full") {
      return {
        resultId: String(dto.id),
        data: dto.data
      };
    }
    throw new Error(`Unexpected`);
  }
};

var ExtensionBackedInlineCompletionsProvider = class extends Disposable {
  constructor(handle2, groupId, providerId, yieldsToGroupIds, excludesGroupIds, debounceDelayMs, displayName, modelInfo, _supportsHandleEvents, _supportsSetModelId, _supportsOnDidChange, _supportsOnDidChangeModelInfo, providerOptions, _supportsSetProviderOption, _supportsOnDidChangeProviderOptions, _selector, _proxy, _languageFeaturesService, _aiEditTelemetryService, _instantiationService) {
    super();
    this.handle = handle2;
    this.groupId = groupId;
    this.providerId = providerId;
    this.yieldsToGroupIds = yieldsToGroupIds;
    this.excludesGroupIds = excludesGroupIds;
    this.debounceDelayMs = debounceDelayMs;
    this.displayName = displayName;
    this.modelInfo = modelInfo;
    this._supportsHandleEvents = _supportsHandleEvents;
    this._supportsSetModelId = _supportsSetModelId;
    this._supportsOnDidChange = _supportsOnDidChange;
    this._supportsOnDidChangeModelInfo = _supportsOnDidChangeModelInfo;
    this.providerOptions = providerOptions;
    this._supportsSetProviderOption = _supportsSetProviderOption;
    this._supportsOnDidChangeProviderOptions = _supportsOnDidChangeProviderOptions;
    this._selector = _selector;
    this._proxy = _proxy;
    this._languageFeaturesService = _languageFeaturesService;
    this._aiEditTelemetryService = _aiEditTelemetryService;
    this._instantiationService = _instantiationService;
    this._onDidChangeEmitter = this._register(new Emitter());
    this._onDidChangeModelInfoEmitter = this._register(new Emitter());
    this._onDidProviderOptionsChangeEmitter = this._register(new Emitter());
    this.setModelId = this._supportsSetModelId ? async (modelId) => {
      await this._proxy.$handleInlineCompletionSetCurrentModelId(this.handle, modelId);
    } : void 0;
    this.setProviderOption = this._supportsSetProviderOption ? async (optionId, valueId) => {
      await this._proxy.$handleInlineCompletionSetProviderOption(this.handle, optionId, valueId);
    } : void 0;
    this.onDidChangeInlineCompletions = this._supportsOnDidChange ? this._onDidChangeEmitter.event : void 0;
    this.onDidChangeModelInfo = this._supportsOnDidChangeModelInfo ? this._onDidChangeModelInfoEmitter.event : void 0;
    this.onDidProviderOptionsChange = this._supportsOnDidChangeProviderOptions ? this._onDidProviderOptionsChangeEmitter.event : void 0;
    this._register(this._languageFeaturesService.inlineCompletionsProvider.register(this._selector, this));
  }
  _setModelInfo(newModelInfo) {
    this.modelInfo = newModelInfo;
    if (this._supportsOnDidChangeModelInfo) {
      this._onDidChangeModelInfoEmitter.fire();
    }
  }
  _setProviderOptions(newProviderOptions) {
    this.providerOptions = newProviderOptions;
    if (this._supportsOnDidChangeProviderOptions) {
      this._onDidProviderOptionsChangeEmitter.fire();
    }
  }
  _emitDidChange(changeHint) {
    if (this._supportsOnDidChange) {
      this._onDidChangeEmitter.fire(changeHint);
    }
  }
  async provideInlineCompletions(model, position2, context2, token) {
    const result = await this._proxy.$provideInlineCompletions(this.handle, model.uri, position2, context2, token);
    return result;
  }
  async handleItemDidShow(completions, item, updatedInsertText, editDeltaInfo) {
    if (item.suggestionId === void 0) {
      item.suggestionId = this._aiEditTelemetryService.createSuggestionId({
        applyCodeBlockSuggestionId: void 0,
        feature: "inlineSuggestion",
        source: this.providerId,
        languageId: completions.languageId,
        editDeltaInfo,
        modeId: void 0,
        modelId: void 0,
        presentation: item.isInlineEdit ? "nextEditSuggestion" : "inlineCompletion",
        sourceRequestId: void 0
      });
    }
    if (this._supportsHandleEvents) {
      await this._proxy.$handleInlineCompletionDidShow(this.handle, completions.pid, item.idx, updatedInsertText);
    }
  }
  async handlePartialAccept(completions, item, acceptedCharacters, info) {
    if (this._supportsHandleEvents) {
      await this._proxy.$handleInlineCompletionPartialAccept(this.handle, completions.pid, item.idx, acceptedCharacters, info);
    }
  }
  async handleEndOfLifetime(completions, item, reason, lifetimeSummary) {
    function mapReason(reason2, f) {
      if (reason2.kind === 2 /* Ignored */) {
        return {
          ...reason2,
          supersededBy: reason2.supersededBy ? f(reason2.supersededBy) : void 0
        };
      }
      return reason2;
    }
    if (this._supportsHandleEvents) {
      await this._proxy.$handleInlineCompletionEndOfLifetime(this.handle, completions.pid, item.idx, mapReason(reason, (i2) => ({ pid: i2.pid, idx: i2.idx })));
    }
    if (reason.kind === 0 /* Accepted */) {
      if (item.suggestionId !== void 0) {
        this._aiEditTelemetryService.handleCodeAccepted({
          suggestionId: item.suggestionId,
          feature: "inlineSuggestion",
          source: this.providerId,
          languageId: completions.languageId,
          editDeltaInfo: EditDeltaInfo.tryCreate(
            lifetimeSummary.lineCountModified,
            lifetimeSummary.lineCountOriginal,
            lifetimeSummary.characterCountModified,
            lifetimeSummary.characterCountOriginal
          ),
          modeId: void 0,
          modelId: void 0,
          presentation: item.isInlineEdit ? "nextEditSuggestion" : "inlineCompletion",
          acceptanceMethod: "accept",
          applyCodeBlockSuggestionId: void 0,
          sourceRequestId: void 0
        });
      }
    } else if (reason.kind === 1 /* Rejected */) {
      if (item.suggestionId !== void 0) {
        this._aiEditTelemetryService.handleCodeRejected({
          suggestionId: item.suggestionId,
          feature: "inlineSuggestion",
          source: this.providerId,
          languageId: completions.languageId,
          editDeltaInfo: EditDeltaInfo.tryCreate(
            lifetimeSummary.lineCountModified,
            lifetimeSummary.lineCountOriginal,
            lifetimeSummary.characterCountModified,
            lifetimeSummary.characterCountOriginal
          ),
          modeId: void 0,
          modelId: void 0,
          presentation: item.isInlineEdit ? "nextEditSuggestion" : "inlineCompletion",
          rejectionMethod: "reject",
          applyCodeBlockSuggestionId: void 0,
          sourceRequestId: void 0
        });
      }
    }
    const endOfLifeSummary = {
      opportunityId: lifetimeSummary.requestUuid,
      correlationId: lifetimeSummary.correlationId,
      shown: lifetimeSummary.shown,
      shownDuration: lifetimeSummary.shownDuration,
      shownDurationUncollapsed: lifetimeSummary.shownDurationUncollapsed,
      timeUntilShown: lifetimeSummary.timeUntilShown,
      timeUntilProviderRequest: lifetimeSummary.timeUntilProviderRequest,
      timeUntilProviderResponse: lifetimeSummary.timeUntilProviderResponse,
      editorType: lifetimeSummary.editorType,
      viewKind: lifetimeSummary.viewKind,
      preceeded: lifetimeSummary.preceeded,
      requestReason: lifetimeSummary.requestReason,
      typingInterval: lifetimeSummary.typingInterval,
      typingIntervalCharacterCount: lifetimeSummary.typingIntervalCharacterCount,
      languageId: lifetimeSummary.languageId,
      cursorColumnDistance: lifetimeSummary.cursorColumnDistance,
      cursorLineDistance: lifetimeSummary.cursorLineDistance,
      lineCountOriginal: lifetimeSummary.lineCountOriginal,
      lineCountModified: lifetimeSummary.lineCountModified,
      characterCountOriginal: lifetimeSummary.characterCountOriginal,
      characterCountModified: lifetimeSummary.characterCountModified,
      disjointReplacements: lifetimeSummary.disjointReplacements,
      sameShapeReplacements: lifetimeSummary.sameShapeReplacements,
      selectedSuggestionInfo: lifetimeSummary.selectedSuggestionInfo,
      extensionId: this.providerId.extensionId,
      extensionVersion: this.providerId.extensionVersion,
      groupId: extractEngineFromCorrelationId(lifetimeSummary.correlationId) ?? this.groupId,
      skuPlan: lifetimeSummary.skuPlan,
      skuType: lifetimeSummary.skuType,
      performanceMarkers: lifetimeSummary.performanceMarkers,
      availableProviders: lifetimeSummary.availableProviders,
      partiallyAccepted: lifetimeSummary.partiallyAccepted,
      partiallyAcceptedCountSinceOriginal: lifetimeSummary.partiallyAcceptedCountSinceOriginal,
      partiallyAcceptedRatioSinceOriginal: lifetimeSummary.partiallyAcceptedRatioSinceOriginal,
      partiallyAcceptedCharactersSinceOriginal: lifetimeSummary.partiallyAcceptedCharactersSinceOriginal,
      superseded: reason.kind === 2 /* Ignored */ && !!reason.supersededBy,
      reason: reason.kind === 0 /* Accepted */ ? "accepted" : reason.kind === 1 /* Rejected */ ? "rejected" : reason.kind === 2 /* Ignored */ ? "ignored" : void 0,
      acceptedAlternativeAction: reason.kind === 0 /* Accepted */ && reason.alternativeAction,
      noSuggestionReason: void 0,
      notShownReason: lifetimeSummary.notShownReason,
      renameCreated: lifetimeSummary.renameCreated,
      renameDuration: lifetimeSummary.renameDuration,
      renameTimedOut: lifetimeSummary.renameTimedOut,
      renameDroppedOtherEdits: lifetimeSummary.renameDroppedOtherEdits,
      renameDroppedRenameEdits: lifetimeSummary.renameDroppedRenameEdits,
      editKind: lifetimeSummary.editKind,
      longDistanceHintVisible: lifetimeSummary.longDistanceHintVisible,
      longDistanceHintDistance: lifetimeSummary.longDistanceHintDistance,
      isForAnotherDocument: lifetimeSummary.isForAnotherDocument,
      ...forwardToChannelIf(isCopilotLikeExtension(this.providerId.extensionId))
    };
    const dataChannelForwardingTelemetryService = this._instantiationService.createInstance(DataChannelForwardingTelemetryService);
    sendInlineCompletionsEndOfLifeTelemetry(dataChannelForwardingTelemetryService, endOfLifeSummary);
  }
  disposeInlineCompletions(completions, reason) {
    this._proxy.$freeInlineCompletionsList(this.handle, completions.pid, reason);
  }
  async handleRejection(completions, item) {
    if (this._supportsHandleEvents) {
      await this._proxy.$handleInlineCompletionRejection(this.handle, completions.pid, item.idx);
    }
  }
  toString() {
    return `InlineCompletionsProvider(${this.providerId.toString()})`;
  }
};

ExtensionBackedInlineCompletionsProvider = __decorateClass([
  __decorateParam(17, ILanguageFeaturesService),
  __decorateParam(18, IAiEditTelemetryService),
  __decorateParam(19, IInstantiationService)
], ExtensionBackedInlineCompletionsProvider);

function extractEngineFromCorrelationId(correlationId) {
  if (!correlationId) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(correlationId);
    if (typeof parsed === "object" && parsed !== null && typeof parsed.engine === "string") {
      return parsed.engine;
    }
    return void 0;
  } catch {
    return void 0;
  }
}
export { extractEngineFromCorrelationId, MainThreadLanguageFeatures, MainThreadPasteEditProvider, MainThreadDocumentOnDropEditProvider, MainThreadDocumentSemanticTokensProvider, MainThreadDocumentRangeSemanticTokensProvider, ExtensionBackedInlineCompletionsProvider };
