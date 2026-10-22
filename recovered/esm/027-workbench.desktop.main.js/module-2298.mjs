// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownContentPart.ts
import { $, DisposableResizeObserver, append, clearNode, getWindow, isHTMLElement } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { findLast } from "./module-0006.mjs";
import { status } from "./module-0076.mjs";
import { isRequestVM, isResponseVM } from "./module-0978.mjs";
import { IncrementalDOMMorpher } from "./module-2296.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { URI } from "./module-0032.mjs";
import { ChatMarkdownDecorationsRenderer } from "./module-2275.mjs";
import { coalesce } from "./module-0007.mjs";
import { MarkedKatexSupport } from "./module-2270.mjs";
import { allowedChatMarkdownHtmlTags } from "./module-2144.mjs";
import { allowedMarkdownHtmlAttributes } from "./module-0468.mjs";
import { extractCodeblockUrisFromText, extractVulnerabilitiesFromText } from "./module-2210.mjs";
import { MarkdownDiffBlockPart, parseUnifiedDiff } from "./module-2271.mjs";
import { ChatExtensionsContentPart } from "./module-2284.mjs";
import { EditDeltaInfo } from "./module-0377.mjs";
import { IChatSessionsService, isAgentHostSessionResource } from "./module-0960.mjs";
import { Lazy } from "./module-0028.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { wrapTablesWithScrollable } from "./module-2269.mjs";
import { CodeBlockPart } from "./module-2278.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { IChatOutputRendererService } from "./module-1309.mjs";
import { Range2 } from "./module-0106.mjs";
import { isLocation } from "./module-0164.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { ChatProgressSubPart } from "./module-2289.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { IChatOutputPartStateCache } from "./module-2297.mjs";
import { ChatEditPillElement, isResourceContentEmpty } from "./module-2279.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { derived } from "./module-0054.mjs";
import { autorun, autorunSelfDisposable } from "./module-0052.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatService } from "./module-0972.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownContentPart.ts
var $48 = $;

var ChatMarkdownContentPart = class extends Disposable {
  constructor(markdown, context2, editorPool, fillInIncompleteTokens2 = false, codeBlockStartIndex = 0, renderer, markdownRenderOptions, currentWidth, rendererOptions, contextKeyService, configurationService, instantiationService, aiEditTelemetryService, chatOutputRendererService, chatSessionsService) {
    super();
    this.markdown = markdown;
    this.editorPool = editorPool;
    this.rendererOptions = rendererOptions;
    this.instantiationService = instantiationService;
    this.aiEditTelemetryService = aiEditTelemetryService;
    this.chatOutputRendererService = chatOutputRendererService;
    this.chatSessionsService = chatSessionsService;
    this.codeblocksPartId = String(++ChatMarkdownContentPart.ID_POOL);
    // This Event exists for one specific scenario and the pattern shouldn't be copied without a good reason
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._onDidChangeDiff = this._register(new Emitter());
    /**
     * Fires when any edit pill (CollapsedCodeBlock) in this markdown part updates its diff.
     * The data includes the total stats and current resources across all edit pills.
     */
    this.onDidChangeDiff = this._onDidChangeDiff.event;
    this._onDidFinishRendering = this._register(new Emitter());
    this.onDidFinishRendering = this._onDidFinishRendering.event;
    this.allRefs = [];
    this._codeblocks = [];
    this.mathLayoutParticipants = /* @__PURE__ */ new Set();
    const element = context2.element;
    const inUndoStop = findLast(context2.content, (e) => e.kind === "undoStop", context2.contentIndex)?.id;
    let globalCodeBlockIndexStart = codeBlockStartIndex;
    this.domNode = $48("div.chat-markdown-part");
    if (this.rendererOptions.accessibilityOptions?.statusMessage) {
      this.domNode.ariaLabel = this.rendererOptions.accessibilityOptions.statusMessage;
      if (configurationService.getValue("accessibility.verboseChatProgressUpdates" /* VerboseChatProgressUpdates */)) {
        status(this.rendererOptions.accessibilityOptions.statusMessage);
      }
    }
    const enableMath = configurationService.getValue("chat.math.enabled" /* EnableMath */);
    const incrementalRenderingEnabled = configurationService.getValue("chat.experimental.incrementalRendering.enabled" /* IncrementalRendering */);
    if (incrementalRenderingEnabled && isResponseVM(element) && fillInIncompleteTokens2 && !element.isComplete) {
      this._incrementalMorpher = this._register(instantiationService.createInstance(IncrementalDOMMorpher, this.domNode));
      this._register(this._incrementalMorpher.onDidDrain(() => this._onDidFinishRendering.fire()));
      this._incrementalMorpher.setRenderCallback((newMd) => {
        const savedMarkdown = this.markdown;
        const content2 = new MarkdownString(newMd, this.markdown.content);
        content2.baseUri = URI.revive(this.markdown.content.baseUri);
        content2.uris = this.markdown.content.uris;
        this.markdown = { ...this.markdown, content: content2 };
        doRenderMarkdown();
        this.markdown = savedMarkdown;
        this._onDidChangeHeight.fire();
      });
    }
    const renderStore = this._register(new MutableDisposable());
    const markdownDecorationsRenderer = this._register(instantiationService.createInstance(ChatMarkdownDecorationsRenderer));
    const doRenderMarkdown = () => {
      if (this._store.isDisposed) {
        return;
      }
      const previousRenderStore = renderStore.clearAndLeak();
      const reusableOutputCodeBlockRefs = /* @__PURE__ */ new Map();
      for (const ref of this.allRefs) {
        if (ref.object instanceof ChatOutputCodeBlockPart) {
          const outputRef = ref;
          previousRenderStore?.deleteAndLeak(outputRef);
          reusableOutputCodeBlockRefs.set(outputRef.object.reuseKey, outputRef);
        }
      }
      previousRenderStore?.dispose();
      const store = new DisposableStore();
      renderStore.value = store;
      clearNode(this.domNode);
      this.allRefs.length = 0;
      this._codeblocks.length = 0;
      this.mathLayoutParticipants.clear();
      globalCodeBlockIndexStart = codeBlockStartIndex;
      const markedExtensions = enableMath ? coalesce([MarkedKatexSupport.getExtension(getWindow(context2.container), {
        throwOnError: false
      })]) : [];
      const markedOpts = {
        gfm: true,
        breaks: true
      };
      const configuredUriTransformer = markdownRenderOptions?.transformUri;
      const transformUri2 = isResponseVM(element) ? (href, kind) => this.chatSessionsService.resolveChatResponseUri(element.sessionResource, configuredUriTransformer?.(href, kind) ?? href, kind) : configuredUriTransformer;
      const result = store.add(renderer.render(this.markdown.content, {
        sanitizerConfig: MarkedKatexSupport.getSanitizerOptions({
          allowedTags: allowedChatMarkdownHtmlTags,
          allowedAttributes: allowedMarkdownHtmlAttributes
        }),
        fillInIncompleteTokens: fillInIncompleteTokens2,
        codeBlockRendererSync: (languageId, text2, raw) => {
          const isCodeBlockComplete = !isResponseVM(context2.element) || context2.element.isComplete || !raw || codeblockHasClosingBackticks(raw);
          const hasChatOutputRenderer = !!languageId && this.chatOutputRendererService.hasCodeBlockRenderer(languageId);
          if ((!text2 || text2.startsWith("<vscode_codeblock_uri") && !text2.includes("\n")) && !isCodeBlockComplete && !hasChatOutputRenderer) {
            const hideEmptyCodeblock = $48("div");
            hideEmptyCodeblock.style.display = "none";
            return hideEmptyCodeblock;
          }
          if (languageId === "diff" && raw && this.rendererOptions.allowInlineDiffs) {
            const match2 = raw.match(/^```diff:(\w+)/);
            if (match2 && isResponseVM(context2.element)) {
              const actualLanguageId = match2[1];
              const codeBlockUri = extractCodeblockUrisFromText(text2);
              const { before, after: after2 } = parseUnifiedDiff(codeBlockUri?.textWithoutResult ?? text2);
              const diffData = {
                element: context2.element,
                codeBlockIndex: globalCodeBlockIndexStart++,
                languageId: actualLanguageId,
                beforeContent: before,
                afterContent: after2,
                codeBlockResource: codeBlockUri?.uri,
                isReadOnly: true,
                horizontalPadding: this.rendererOptions.horizontalPadding
              };
              const diffPart = this.instantiationService.createInstance(MarkdownDiffBlockPart, diffData, context2.diffEditorPool, context2.currentWidth.get());
              const ref2 = {
                object: diffPart,
                isStale: () => false,
                dispose: () => diffPart.dispose()
              };
              this.allRefs.push(ref2);
              store.add(ref2);
              return diffPart.element;
            }
          }
          if (languageId === "vscode-extensions") {
            const chatExtensions = store.add(instantiationService.createInstance(ChatExtensionsContentPart, { kind: "extensions", extensions: text2.split(",") }));
            return chatExtensions.domNode;
          }
          const globalIndex = globalCodeBlockIndexStart++;
          let codeBlockText = text2;
          const extractedVulns = extractVulnerabilitiesFromText(text2);
          codeBlockText = fixCodeText(extractedVulns.newText, languageId);
          const vulns = extractedVulns.vulnerabilities;
          let codemapperUri;
          let isEdit;
          const codeblockUri = extractCodeblockUrisFromText(codeBlockText);
          if (codeblockUri) {
            codemapperUri = codeblockUri.uri;
            isEdit = codeblockUri.isEdit;
            codeBlockText = codeblockUri.textWithoutResult;
          }
          const hideToolbar = isResponseVM(element) && element.errorDetails?.responseIsFiltered;
          const renderOptions = {
            ...this.rendererOptions.codeBlockRenderOptions
          };
          if (hideToolbar !== void 0) {
            renderOptions.hideToolbar = hideToolbar;
          }
          const codeBlockInfo = { languageId, text: codeBlockText, codeBlockIndex: globalIndex, element, parentContextKeyService: contextKeyService, vulns, codemapperUri, renderOptions, chatSessionResource: element.sessionResource };
          const baseCodeBlockInfo = {
            ownerMarkdownPartId: this.codeblocksPartId,
            codeBlockIndex: globalIndex,
            elementId: element.id,
            chatSessionResource: element.sessionResource,
            languageId,
            editDeltaInfo: EditDeltaInfo.fromText(text2)
          };
          if (element.isCompleteAddedRequest || !codemapperUri || !isEdit) {
            if (hasChatOutputRenderer) {
              const ref3 = this.renderChatOutputCodeBlock(languageId, codeBlockText, globalIndex, context2, isCodeBlockComplete, reusableOutputCodeBlockRefs);
              this._codeblocks.push({
                ...baseCodeBlockInfo,
                codemapperUri: codeBlockInfo.codemapperUri,
                isStreamingEdit: false,
                get uri() {
                  return void 0;
                },
                focus() {
                  ref3.object.focus();
                }
              });
              store.add(ref3);
              return ref3.object.element;
            }
            const ref2 = this.renderCodeBlock(codeBlockInfo, currentWidth);
            this._codeblocks.push({
              ...baseCodeBlockInfo,
              codemapperUri: codeBlockInfo.codemapperUri,
              isStreamingEdit: false,
              get uri() {
                return ref2.object.uri;
              },
              focus() {
                ref2.object.focus();
              }
            });
            store.add(ref2);
            return ref2.object.element;
          }
          const requestId = isRequestVM(element) ? element.id : element.requestId;
          const ref = this.renderCodeBlockPill(element.sessionResource, requestId, inUndoStop, codemapperUri);
          this._codeblocks.push({
            ...baseCodeBlockInfo,
            codemapperUri,
            isStreamingEdit: !isCodeBlockComplete,
            get uri() {
              return void 0;
            },
            focus() {
              return ref.object.element.focus();
            }
          });
          store.add(ref);
          return ref.object.element;
        },
        markedOptions: markedOpts,
        markedExtensions,
        ...markdownRenderOptions,
        transformUri: transformUri2
      }, this.domNode));
      if (isResponseVM(element) && !element.model.codeBlockInfos && element.model.isComplete) {
        element.model.initializeCodeBlockInfos(this._codeblocks.map((info) => {
          return {
            suggestionId: this.aiEditTelemetryService.createSuggestionId({
              presentation: "codeBlock",
              feature: "sideBarChat",
              editDeltaInfo: info.editDeltaInfo,
              languageId: info.languageId,
              modeId: element.model.request?.modeInfo?.telemetryModeId,
              modelId: element.model.request?.modelId,
              applyCodeBlockSuggestionId: void 0,
              source: void 0,
              sourceRequestId: void 0,
              isAgentHostSession: isAgentHostSessionResource(element.sessionResource)
            })
          };
        }));
      }
      store.add(markdownDecorationsRenderer.walkTreeAndAnnotateReferenceLinks(this.markdown, result.element));
      const layoutParticipants = new Lazy(() => {
        const observer = store.add(new DisposableResizeObserver("ChatMarkdownContentPart.mathLayout", () => this.mathLayoutParticipants.forEach((layout2) => layout2())));
        store.add(observer.observe(this.domNode));
        return this.mathLayoutParticipants;
      });
      for (const katexBlock of this.domNode.querySelectorAll(".katex-display")) {
        if (!isHTMLElement(katexBlock)) {
          continue;
        }
        const scrollable = new DomScrollableElement(katexBlock.cloneNode(true), {
          vertical: 2 /* Hidden */,
          horizontal: 1 /* Auto */
        });
        store.add(scrollable);
        katexBlock.replaceWith(scrollable.getDomNode());
        layoutParticipants.value.add(() => {
          scrollable.scanDomNode();
        });
        scrollable.scanDomNode();
      }
      store.add(wrapTablesWithScrollable(this.domNode, layoutParticipants));
      dispose(reusableOutputCodeBlockRefs.values());
    };
    doRenderMarkdown();
    this._incrementalMorpher?.seed(
      markdown.content.value,
      /* animateInitial */
      true
    );
    if (enableMath && !MarkedKatexSupport.getExtension(getWindow(context2.container))) {
      MarkedKatexSupport.loadExtension(getWindow(context2.container)).then(() => {
        doRenderMarkdown();
      }).catch((e) => {
        console.error("Failed to load MarkedKatexSupport extension:", e);
      });
    }
  }
  static {
    this.ID_POOL = 0;
  }
  get codeblocks() {
    return this._codeblocks;
  }
  dispose() {
    super.dispose();
    dispose(this.allRefs);
    this.allRefs.length = 0;
  }
  renderCodeBlockPill(sessionResource, requestId, inUndoStop, codemapperUri) {
    const codeBlock = this.instantiationService.createInstance(CollapsedCodeBlock, sessionResource, requestId, inUndoStop);
    const diffListenerStore = new DisposableStore();
    const ref = {
      object: codeBlock,
      isStale: () => false,
      dispose: () => {
        codeBlock.dispose();
        diffListenerStore.dispose();
      }
    };
    this.allRefs.push(ref);
    diffListenerStore.add(codeBlock.onDidChangeDiff(() => this.fireAggregatedDiff()));
    codeBlock.render(codemapperUri);
    return ref;
  }
  renderChatOutputCodeBlock(identifier2, text2, codeBlockIndex, context2, isComplete, reusableOutputCodeBlockRefs) {
    const reuseKey = ChatOutputCodeBlockPart.reuseKey(context2.element.id, codeBlockIndex, identifier2);
    const reusableRef = reusableOutputCodeBlockRefs.get(reuseKey);
    if (reusableRef?.object.hasSameContent(identifier2, text2, isComplete)) {
      reusableOutputCodeBlockRefs.delete(reuseKey);
      this.allRefs.push(reusableRef);
      return reusableRef;
    }
    const codeBlock = this.instantiationService.createInstance(
      ChatOutputCodeBlockPart,
      identifier2,
      text2,
      codeBlockIndex,
      context2,
      isComplete,
      () => this._onDidChangeHeight.fire()
    );
    const ref = {
      object: codeBlock,
      isStale: () => false,
      dispose: () => codeBlock.dispose()
    };
    this.allRefs.push(ref);
    return ref;
  }
  fireAggregatedDiff() {
    let totalAdded = 0;
    let totalRemoved = 0;
    const resources = [];
    for (const ref of this.allRefs) {
      if (ref.object instanceof CollapsedCodeBlock && ref.object.diff) {
        const diff4 = ref.object.diff;
        totalAdded += diff4.added;
        totalRemoved += diff4.removed;
        resources.push({
          resource: diff4.modifiedURI,
          originalURI: diff4.originalURI,
          modifiedURI: diff4.isDeleted ? void 0 : diff4.modifiedSnapshotURI ?? diff4.modifiedURI
        });
      }
    }
    this._onDidChangeDiff.fire({ added: totalAdded, removed: totalRemoved, resources });
  }
  renderCodeBlock(data, currentWidth) {
    const key3 = CodeBlockPart.poolKey(data.element.id, data.codeBlockIndex);
    const ref = this.editorPool.get(key3);
    this.allRefs.push(ref);
    ref.object.render(data, currentWidth);
    if (!this._store.isDisposed && isRequestVM(data.element)) {
      this._onDidChangeHeight.fire();
    }
    return ref;
  }
  hasSameContent(other) {
    if (other.kind !== "markdownContent") {
      return false;
    }
    if (other.content.value === this.markdown.content.value && equalsInlineReferences(other.inlineReferences, this.markdown.inlineReferences)) {
      return true;
    }
    const lastCodeblock = this._codeblocks.at(-1);
    if (lastCodeblock && lastCodeblock.codemapperUri !== void 0 && lastCodeblock.isStreamingEdit) {
      return other.content.value.lastIndexOf("```") === this.markdown.content.value.lastIndexOf("```");
    }
    return false;
  }
  get isRenderComplete() {
    return this._incrementalMorpher?.isDrained ?? true;
  }
  /**
   * Attempts an incremental DOM update for smooth streaming instead of
   * tearing down and rebuilding the entire markdown part.
   *
   * The morpher checks that the new content is a pure append, then
   * schedules a rAF-batched re-render through the full markdown
   * pipeline. Code blocks, tables, and all markdown features are
   * rendered correctly because the update goes through the standard
   * `doRenderMarkdown()` path.
   *
   * @param newMarkdown The new (appended) markdown content.
   * @returns `true` if the incremental update succeeded and the caller
   *          should treat this part as unchanged. `false` if a full
   *          re-render is needed.
   */
  tryIncrementalUpdate(newMarkdown) {
    if (!this._incrementalMorpher) {
      return false;
    }
    if (!equalsInlineReferences(newMarkdown.inlineReferences, this.markdown.inlineReferences)) {
      return false;
    }
    const success = this._incrementalMorpher.tryMorph(newMarkdown.content.value);
    if (success) {
      this.markdown = newMarkdown;
    }
    return success;
  }
  /**
   * Forward the stream's word-rate estimate to the morpher's buffer.
   */
  updateStreamRate(rate, isComplete) {
    this._incrementalMorpher?.updateStreamRate(rate, isComplete);
  }
  layout(width2) {
    this.allRefs.forEach((ref, index2) => {
      if (ref.object instanceof CodeBlockPart) {
        ref.object.layout(width2);
      } else if (ref.object instanceof ChatOutputCodeBlockPart) {
        ref.object.layout(width2);
      } else if (ref.object instanceof MarkdownDiffBlockPart) {
        ref.object.layout(width2);
      } else if (ref.object instanceof CollapsedCodeBlock) {
        const codeblockModel = this._codeblocks[index2];
        if (codeblockModel.codemapperUri && !isEqual2(ref.object.uri, codeblockModel.codemapperUri)) {
          ref.object.render(codeblockModel.codemapperUri);
        }
      }
    });
    this.mathLayoutParticipants.forEach((layout2) => layout2());
  }
  onDidRemount() {
    for (const ref of this.allRefs) {
      if (ref.object instanceof CodeBlockPart || ref.object instanceof ChatOutputCodeBlockPart) {
        ref.object.onDidRemount();
      }
    }
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatMarkdownContentPart = __decorateClass([
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IAiEditTelemetryService),
  __decorateParam(13, IChatOutputRendererService),
  __decorateParam(14, IChatSessionsService)
], ChatMarkdownContentPart);

function equalsInlineReferences(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return !a && !b;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key3) => equalsInlineReference(a[key3], b[key3]));
}

function equalsInlineReference(a, b) {
  if (!a || !b) {
    return !a && !b;
  }
  return a.resolveId === b.resolveId && a.name === b.name && equalsInlineReferenceValue(a.inlineReference, b.inlineReference);
}

var workspaceSymbolComparers = {
  name: (a, b) => a.name === b.name,
  containerName: (a, b) => a.containerName === b.containerName,
  kind: (a, b) => a.kind === b.kind,
  tags: (a, b) => equalsSymbolTags(a.tags, b.tags),
  location: (a, b) => isEqual2(a.location.uri, b.location.uri) && Range2.equalsRange(a.location.range, b.location.range)
};

var workspaceSymbolComparerKeys = Object.keys(workspaceSymbolComparers);

function equalsInlineReferenceValue(a, b) {
  if (URI.isUri(a) || URI.isUri(b)) {
    return URI.isUri(a) && URI.isUri(b) && isEqual2(a, b);
  }
  if (isLocation(a) || isLocation(b)) {
    return isLocation(a) && isLocation(b) && isEqual2(a.uri, b.uri) && Range2.equalsRange(a.range, b.range);
  }
  return equalsWorkspaceSymbol(a, b);
}

function equalsWorkspaceSymbol(a, b) {
  return workspaceSymbolComparerKeys.every((key3) => workspaceSymbolComparers[key3](a, b));
}

function equalsSymbolTags(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  return a.every((tag2, index2) => tag2 === b[index2]);
}

function codeblockHasClosingBackticks(str) {
  str = str.trim();
  return !!str.match(/\n```+$/);
}

var ChatOutputCodeBlockPart = class extends Disposable {
  constructor(identifier2, text2, codeBlockIndex, context2, isComplete, onDidChangeHeight, instantiationService, chatOutputRendererService, stateCache) {
    super();
    this.identifier = identifier2;
    this.text = text2;
    this.context = context2;
    this.isComplete = isComplete;
    this.onDidChangeHeight = onDidChangeHeight;
    this.instantiationService = instantiationService;
    this.chatOutputRendererService = chatOutputRendererService;
    this.stateCache = stateCache;
    this._disposeCts = this._register(new CancellationTokenSource());
    this._renderedOutputPart = this._register(new MutableDisposable());
    this.reuseKey = ChatOutputCodeBlockPart.reuseKey(context2.element.id, codeBlockIndex, identifier2);
    const title = localize(11938, null, codeBlockIndex + 1);
    this.element = $48(".interactive-result-code-block.chat-output-code-block.tool-output-part");
    this.element.tabIndex = -1;
    this.element.ariaLabel = title;
    const parent = $48(".webview-output");
    parent.style.maxHeight = "80vh";
    parent.style.minHeight = "38px";
    this.element.appendChild(parent);
    const stateCacheKey = `codeBlock/${context2.element.sessionResource.toString()}/${context2.element.id}/${codeBlockIndex}/${identifier2.toLowerCase()}`;
    const partState = this.stateCache.get(stateCacheKey) ?? { height: 0 };
    this.stateCache.set(stateCacheKey, partState);
    if (partState.height) {
      parent.style.height = `${partState.height}px`;
    }
    const progressMessage = $48("span");
    progressMessage.textContent = localize(11937, null);
    const progressPart = this._register(this.instantiationService.createInstance(ChatProgressSubPart, progressMessage, ThemeIcon.modify(Codicon.loading, "spin"), void 0));
    parent.appendChild(progressPart.domNode);
    if (!isComplete) {
      this.onDidChangeHeight();
      return;
    }
    this.chatOutputRendererService.renderCodeBlock(identifier2, new TextEncoder().encode(text2), parent, {
      webviewState: partState.webviewState,
      title,
      chatSessionResource: this.context.element.sessionResource
    }, this._disposeCts.token).then((renderedItem) => {
      if (this._disposeCts.token.isCancellationRequested) {
        renderedItem.dispose();
        return;
      }
      this._renderedOutputPart.value = renderedItem;
      progressPart.domNode.remove();
      parent.style.minHeight = "";
      this.onDidChangeHeight();
      this._register(renderedItem.webview.onDidUpdateState((e) => {
        partState.webviewState = e;
      }));
      this._register(renderedItem.onDidChangeHeight((newHeight) => {
        partState.height = newHeight;
        this.onDidChangeHeight();
      }));
      this._register(this.context.onDidChangeVisibility((visible) => {
        if (visible) {
          renderedItem.reinitialize();
        }
      }));
    }, (error) => {
      if (isCancellationError(error)) {
        return;
      }
      console.error("Error rendering chat code block:", error);
      progressPart.domNode.replaceWith(this.renderError(error));
      parent.style.minHeight = "";
      this.onDidChangeHeight();
    });
  }
  static reuseKey(elementId, codeBlockIndex, identifier2) {
    return `${elementId}/${codeBlockIndex}/${identifier2.toLowerCase()}`;
  }
  hasSameContent(identifier2, text2, isComplete) {
    return identifier2.toLowerCase() === this.identifier.toLowerCase() && text2 === this.text && isComplete === this.isComplete;
  }
  dispose() {
    this._disposeCts.dispose(true);
    super.dispose();
  }
  layout(width2) {
    this.element.style.maxWidth = `${width2}px`;
  }
  onDidRemount() {
    this._renderedOutputPart.value?.reinitialize();
  }
  focus() {
    const webview = this._renderedOutputPart.value?.webview;
    if (webview) {
      webview.focus();
    } else {
      this.element.focus();
    }
  }
  renderError(error) {
    const errorNode = $48(".output-error");
    const errorHeaderNode = $48(".output-error-header");
    append(errorNode, errorHeaderNode);
    const iconElement = $48("div");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.error));
    errorHeaderNode.append(iconElement);
    const errorTitleNode = $48(".output-error-title");
    errorTitleNode.textContent = localize(11936, null);
    errorHeaderNode.append(errorTitleNode);
    const errorMessageNode = $48(".output-error-details");
    errorMessageNode.textContent = error?.message || String(error);
    errorNode.append(errorMessageNode);
    return errorNode;
  }
};

ChatOutputCodeBlockPart = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IChatOutputRendererService),
  __decorateParam(8, IChatOutputPartStateCache)
], ChatOutputCodeBlockPart);

var CollapsedCodeBlock = class extends ChatEditPillElement {
  constructor(sessionResource, requestId, inUndoStop, labelService, editorService, modelService, languageService, contextMenuService, contextKeyService, menuService, hoverService, chatService, configurationService, textModelService) {
    super(labelService, modelService, languageService, hoverService);
    this.sessionResource = sessionResource;
    this.requestId = requestId;
    this.inUndoStop = inUndoStop;
    this.editorService = editorService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.chatService = chatService;
    this.configurationService = configurationService;
    this.textModelService = textModelService;
    this._onDidChangeDiff = this._register(new Emitter());
    this.onDidChangeDiff = this._onDidChangeDiff.event;
    this.progressStore = this._store.add(new DisposableStore());
    this._register(this.onDidClick((e) => this.showDiff(e)));
    this._register(this.onDidContextMenu((event) => {
      this.contextMenuService.showContextMenu({
        contextKeyService: this.contextKeyService,
        getAnchor: () => event,
        getActions: () => {
          if (!this.uri) {
            return [];
          }
          const menu = this.menuService.getMenuActions(MenuId.ChatEditingCodeBlockContext, this.contextKeyService, {
            arg: {
              sessionResource: this.sessionResource,
              requestId: this.requestId,
              uri: this.uri,
              stopId: this.inUndoStop
            }
          });
          return getFlatContextMenuActions(menu);
        }
      });
    }));
  }
  get diff() {
    return this.currentDiff;
  }
  async showDiff({ editorOptions: options3, openToSide }) {
    const group2 = openToSide ? SIDE_GROUP : void 0;
    if (this.currentDiff) {
      if (this.currentDiff.removed === 0 && await isResourceContentEmpty(this.textModelService, this.currentDiff.originalURI) && this.uri) {
        this.editorService.openEditor({ resource: this.uri, options: options3 }, group2);
        return;
      }
      this.editorService.openEditor({
        original: { resource: this.currentDiff.originalURI },
        modified: { resource: this.currentDiff.modifiedURI },
        options: options3
      }, group2);
    } else if (this.uri) {
      this.editorService.openEditor({ resource: this.uri, options: options3 }, group2);
    }
  }
  /**
   * @param uri URI of the file on-disk being changed
   */
  render(uri5) {
    this.progressStore.clear();
    this.setUri(uri5);
    this.setStatus(void 0, "");
    this.setLabelDetail("");
    this.setProgressFill(void 0);
    const session = this.chatService.getSession(this.sessionResource);
    const editSession = session?.editingSession;
    if (!editSession) {
      return;
    }
    const diffObservable = derived((reader) => {
      const entry = editSession.readEntry(uri5, reader);
      return entry && editSession.getEntryDiffBetweenStops(entry.modifiedURI, this.requestId, this.inUndoStop);
    }).map((d, r2) => d?.read(r2));
    const isStreaming = derived((r2) => {
      const entry = editSession.readEntry(uri5, r2);
      const currentlyModified = entry?.isCurrentlyBeingModifiedBy.read(r2);
      return !!currentlyModified && currentlyModified.responseModel.requestId === this.requestId && currentlyModified.undoStopId === this.inUndoStop;
    });
    const iconText = this.labelService.getUriBasenameLabel(uri5);
    this.progressStore.add(autorun((r2) => {
      if (isStreaming.read(r2)) {
        const codicon = ThemeIcon.modify(Codicon.loading, "spin");
        this.setStatus(codicon, localize(11928, null));
        const entry = editSession.readEntry(uri5, r2);
        const rwRatio = Math.floor((entry?.rewriteRatio.read(r2) || 0) * 100);
        const showAnimation = this.configurationService.getValue("chat.agent.codeBlockProgress" /* ShowCodeBlockProgressAnimation */);
        if (showAnimation) {
          this.setProgressFill(rwRatio);
          this.setLabelDetail("");
        } else {
          this.setProgressFill(void 0);
          this.setLabelDetail(rwRatio === 0 || !rwRatio ? localize(11933, null) : localize(11929, null, rwRatio));
        }
      } else {
        this.setStatus(Codicon.check, localize(11932, null));
        this.setProgressFill(void 0);
        this.setLabelDetail("");
      }
    }));
    this.progressStore.add(autorunSelfDisposable((r2) => {
      const changes = diffObservable.read(r2);
      if (changes === void 0) {
        return;
      }
      if (changes && !changes?.identical && !changes?.quitEarly) {
        this.currentDiff = changes;
        this._onDidChangeDiff.fire(changes);
        this.setDiff({ added: changes.added, removed: changes.removed });
        const insertionsFragment = changes.added === 1 ? localize(11935, null) : localize(11934, null, changes.added);
        const deletionsFragment = changes.removed === 1 ? localize(11931, null) : localize(11930, null, changes.removed);
        this.setAriaLabel(localize(11939, null, iconText, insertionsFragment, deletionsFragment));
        if (changes.isFinal) {
          r2.dispose();
        }
      }
    }));
  }
};

CollapsedCodeBlock = __decorateClass([
  __decorateParam(3, ILabelService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IModelService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IMenuService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IChatService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ITextModelService)
], CollapsedCodeBlock);

function fixCodeText(text2, languageId) {
  if (languageId === "php") {
    if (!text2.trim().startsWith("<?")) {
      return `<?php
${text2}`;
    }
  }
  return text2;
}
export { equalsInlineReferences, equalsInlineReference, equalsInlineReferenceValue, equalsWorkspaceSymbol, equalsSymbolTags, codeblockHasClosingBackticks, fixCodeText, $48, ChatMarkdownContentPart, workspaceSymbolComparers, workspaceSymbolComparerKeys, ChatOutputCodeBlockPart, CollapsedCodeBlock };
