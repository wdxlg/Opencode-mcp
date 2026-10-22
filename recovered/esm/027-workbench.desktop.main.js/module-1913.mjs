// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { IWebviewService, WebviewOriginStore } from "./module-1042.mjs";
import { localize } from "./module-0001.mjs";
import { preloadsScriptStr } from "./module-1909.mjs";
import { editorFindMatch, editorFindMatchHighlight } from "./module-0229.mjs";
import { asWebviewUri, webviewGenericCspSource } from "./module-1911.mjs";
import { FileAccess, Schemas, matchesScheme, matchesSomeScheme } from "./module-0033.mjs";
import { dirname2, extname2, isEqual2, joinPath } from "./module-0034.mjs";
import { isMacintosh, isWeb } from "./module-0014.mjs";
import { getWindow } from "./module-0075.mjs";
import { WebviewWindowDragMonitor } from "./module-1115.mjs";
import { DeferredPromise, runWhenGlobalIdle } from "./module-0036.mjs";
import { NOTEBOOK_WEBVIEW_BOUNDARY } from "./module-1908.mjs";
import { URI } from "./module-0032.mjs";
import { CellUri } from "./module-0909.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { MenuId } from "./module-0092.mjs";
import { MarkupCellViewModel } from "./module-1901.mjs";
import { IOpenerService, extractSelection } from "./module-0272.mjs";
import { tokenizeToString } from "./module-0430.mjs";
import { getExtensionForMimeType, isTextStreamMime } from "./module-0136.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { transformWebviewThemeVars } from "./module-1910.mjs";
import { coalesce } from "./module-0007.mjs";
import { equals4 } from "./module-0098.mjs";
import { TEXT_BASED_MIMETYPES, getOutputStreamText, getOutputText } from "./module-1912.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPathService } from "./module-0938.mjs";
import { INotebookLoggingService } from "./module-1395.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";


// src/vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView.ts
var LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;

var LineQueryRegex = /line=(\d+)$/;

var FRAGMENT_REGEX = /^(.*)#([^#]*)$/;

var BackLayerWebView = class extends Themable {
  constructor(notebookEditor, id2, notebookViewType, documentUri, options3, rendererMessaging, webviewService, openerService, notebookService, contextService, environmentService, fileDialogService, fileService, contextMenuService, contextKeyService, workspaceTrustManagementService, configurationService, languageService, workspaceContextService, editorGroupService, editorService, storageService, pathService, notebookLogService, themeService, telemetryService) {
    super(themeService);
    this.notebookEditor = notebookEditor;
    this.id = id2;
    this.notebookViewType = notebookViewType;
    this.documentUri = documentUri;
    this.options = options3;
    this.rendererMessaging = rendererMessaging;
    this.webviewService = webviewService;
    this.openerService = openerService;
    this.notebookService = notebookService;
    this.contextService = contextService;
    this.environmentService = environmentService;
    this.fileDialogService = fileDialogService;
    this.fileService = fileService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.configurationService = configurationService;
    this.languageService = languageService;
    this.workspaceContextService = workspaceContextService;
    this.editorGroupService = editorGroupService;
    this.editorService = editorService;
    this.storageService = storageService;
    this.pathService = pathService;
    this.notebookLogService = notebookLogService;
    this.telemetryService = telemetryService;
    this.webview = void 0;
    this.insetMapping = /* @__PURE__ */ new Map();
    this.pendingWebviewIdleCreationRequest = /* @__PURE__ */ new Map();
    this.pendingWebviewIdleInsetMapping = /* @__PURE__ */ new Map();
    this.reversedPendingWebviewIdleInsetMapping = /* @__PURE__ */ new Map();
    this.markupPreviewMapping = /* @__PURE__ */ new Map();
    this.hiddenInsetMapping = /* @__PURE__ */ new Set();
    this.reversedInsetMapping = /* @__PURE__ */ new Map();
    this.localResourceRootsCache = void 0;
    this._onMessage = this._register(new Emitter());
    this._preloadsCache = /* @__PURE__ */ new Set();
    this.onMessage = this._onMessage.event;
    this._disposed = false;
    this.firstInit = true;
    this.nonce = generateUuid();
    this._logRendererDebugMessage("Creating backlayer webview for notebook");
    this.element = document.createElement("div");
    this.element.style.height = "1400px";
    this.element.style.position = "absolute";
    if (rendererMessaging) {
      this._register(rendererMessaging);
      rendererMessaging.receiveMessageHandler = (rendererId, message) => {
        if (!this.webview || this._disposed) {
          return Promise.resolve(false);
        }
        this._sendMessageToWebview({
          __vscode_notebook_message: true,
          type: "customRendererMessage",
          rendererId,
          message
        });
        return Promise.resolve(true);
      };
    }
    this._register(workspaceTrustManagementService.onDidChangeTrust((e) => {
      const baseUrl = this.asWebviewUri(this.getNotebookBaseUri(), void 0);
      const htmlContent = this.generateContent(baseUrl.toString());
      this.webview?.setHtml(htmlContent);
    }));
    this._register(TokenizationRegistry2.onDidChange(() => {
      this._sendMessageToWebview({
        type: "tokenizedStylesChanged",
        css: getTokenizationCss()
      });
    }));
  }
  static getOriginStore(storageService) {
    this._originStore ??= new WebviewOriginStore("notebook.backlayerWebview.origins", storageService);
    return this._originStore;
  }
  updateOptions(options3) {
    this.options = options3;
    this._updateStyles();
    this._updateOptions();
  }
  _logRendererDebugMessage(msg) {
    this.notebookLogService.debug("BacklayerWebview", `${this.documentUri} (${this.id}) - ${msg}`);
  }
  _updateStyles() {
    this._sendMessageToWebview({
      type: "notebookStyles",
      styles: this._generateStyles()
    });
  }
  _updateOptions() {
    this._sendMessageToWebview({
      type: "notebookOptions",
      options: {
        dragAndDropEnabled: this.options.dragAndDropEnabled
      },
      renderOptions: {
        lineLimit: this.options.outputLineLimit,
        outputScrolling: this.options.outputScrolling,
        outputWordWrap: this.options.outputWordWrap,
        linkifyFilePaths: this.options.outputLinkifyFilePaths,
        minimalError: this.options.minimalError
      }
    });
  }
  _generateStyles() {
    return {
      "notebook-output-left-margin": `${this.options.leftMargin + this.options.runGutter}px`,
      "notebook-output-width": `calc(100% - ${this.options.leftMargin + this.options.rightMargin + this.options.runGutter}px)`,
      "notebook-output-node-padding": `${this.options.outputNodePadding}px`,
      "notebook-run-gutter": `${this.options.runGutter}px`,
      "notebook-preview-node-padding": `${this.options.previewNodePadding}px`,
      "notebook-markdown-left-margin": `${this.options.markdownLeftMargin}px`,
      "notebook-output-node-left-padding": `${this.options.outputNodeLeftPadding}px`,
      "notebook-markdown-min-height": `${this.options.previewNodePadding * 2}px`,
      "notebook-markup-font-size": typeof this.options.markupFontSize === "number" && this.options.markupFontSize > 0 ? `${this.options.markupFontSize}px` : `calc(${this.options.fontSize}px * 1.2)`,
      "notebook-markdown-line-height": typeof this.options.markdownLineHeight === "number" && this.options.markdownLineHeight > 0 ? `${this.options.markdownLineHeight}px` : `normal`,
      "notebook-cell-output-font-size": `${this.options.outputFontSize || this.options.fontSize}px`,
      "notebook-cell-output-line-height": `${this.options.outputLineHeight}px`,
      "notebook-cell-output-max-height": `${this.options.outputLineHeight * this.options.outputLineLimit + 2}px`,
      "notebook-cell-output-font-family": this.options.outputFontFamily || this.options.fontFamily,
      "notebook-cell-markup-empty-content": localize(17894, null),
      "notebook-cell-renderer-not-found-error": localize(17896, null),
      "notebook-cell-renderer-fallbacks-exhausted": localize(17895, null),
      "notebook-markup-font-family": this.options.markupFontFamily
    };
  }
  generateContent(baseUrl) {
    const renderersData = this.getRendererData();
    const preloadsData = this.getStaticPreloadsData();
    const renderOptions = {
      lineLimit: this.options.outputLineLimit,
      outputScrolling: this.options.outputScrolling,
      outputWordWrap: this.options.outputWordWrap,
      linkifyFilePaths: this.options.outputLinkifyFilePaths,
      minimalError: this.options.minimalError
    };
    const preloadScript = preloadsScriptStr(
      {
        ...this.options,
        tokenizationCss: getTokenizationCss()
      },
      { dragAndDropEnabled: this.options.dragAndDropEnabled },
      renderOptions,
      renderersData,
      preloadsData,
      this.workspaceTrustManagementService.isWorkspaceTrusted(),
      this.nonce
    );
    const enableCsp = this.configurationService.getValue("notebook.experimental.enableCsp");
    const currentHighlight = this.getColor(editorFindMatch);
    const findMatchHighlight = this.getColor(editorFindMatchHighlight);
    return (
      /* html */
      `
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${baseUrl}/" />
				${enableCsp ? `<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${webviewGenericCspSource} 'unsafe-inline' 'unsafe-eval';
					style-src ${webviewGenericCspSource} 'unsafe-inline';
					img-src ${webviewGenericCspSource} https: http: data:;
					font-src ${webviewGenericCspSource} https:;
					connect-src https:;
					child-src https: data:;
				">` : ""}
				<style nonce="${this.nonce}">
					::highlight(find-highlight) {
						background-color: var(--vscode-editor-findMatchBackground, ${findMatchHighlight});
					}

					::highlight(current-find-highlight) {
						background-color: var(--vscode-editor-findMatchHighlightBackground, ${currentHighlight});
					}

					#container .cell_container {
						width: 100%;
					}

					#container .output_container {
						width: 100%;
					}

					#container .cell_container.nb-insertHighlight div.output_container div.output {
						background-color: var(--vscode-diffEditor-insertedLineBackground, var(--vscode-diffEditor-insertedTextBackground));
					}

					#container > div > div > div.output {
						font-size: var(--notebook-cell-output-font-size);
						width: var(--notebook-output-width);
						margin-left: var(--notebook-output-left-margin);
						background-color: var(--theme-notebook-output-background);
						padding-top: var(--notebook-output-node-padding);
						padding-right: var(--notebook-output-node-padding);
						padding-bottom: var(--notebook-output-node-padding);
						padding-left: var(--notebook-output-node-left-padding);
						box-sizing: border-box;
						border-top: none;
					}

					/* markdown */
					#container div.preview {
						width: 100%;
						padding-right: var(--notebook-preview-node-padding);
						padding-left: var(--notebook-markdown-left-margin);
						padding-top: var(--notebook-preview-node-padding);
						padding-bottom: var(--notebook-preview-node-padding);

						box-sizing: border-box;
						white-space: nowrap;
						overflow: hidden;
						white-space: initial;

						font-size: var(--notebook-markup-font-size);
						line-height: var(--notebook-markdown-line-height);
						color: var(--theme-ui-foreground);
						font-family: var(--notebook-markup-font-family);
					}

					#container div.preview.draggable {
						user-select: none;
						-webkit-user-select: none;
						-ms-user-select: none;
						cursor: grab;
					}

					#container div.preview.selected {
						background: var(--theme-notebook-cell-selected-background);
					}

					#container div.preview.dragging {
						background-color: var(--theme-background);
						opacity: 0.5 !important;
					}

					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex img,
					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex-block img {
						filter: brightness(0) invert(1)
					}

					#container .markup > div.nb-symbolHighlight {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .markup > div.nb-insertHighlight {
						background-color: var(--vscode-diffEditor-insertedLineBackground, var(--vscode-diffEditor-insertedTextBackground));
					}

					#container .nb-symbolHighlight .output_container .output {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .markup > div.nb-multiCellHighlight {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .nb-multiCellHighlight .output_container .output {
						background-color: var(--theme-notebook-symbol-highlight-background);
					}

					#container .nb-chatGenerationHighlight .output_container .output {
						background-color: var(--vscode-notebook-selectedCellBackground);
					}

					#container > div.nb-cellDeleted .output_container {
						background-color: var(--theme-notebook-diff-removed-background);
					}

					#container > div.nb-cellAdded .output_container {
						background-color: var(--theme-notebook-diff-inserted-background);
					}

					#container > div > div:not(.preview) > div {
						overflow-x: auto;
					}

					#container .no-renderer-error {
						color: var(--vscode-editorError-foreground);
					}

					body {
						padding: 0px;
						height: 100%;
						width: 100%;
					}

					table, thead, tr, th, td, tbody {
						border: none;
						border-color: transparent;
						border-spacing: 0;
						border-collapse: collapse;
					}

					table, th, tr {
						vertical-align: middle;
						text-align: right;
					}

					thead {
						font-weight: bold;
						background-color: rgba(130, 130, 130, 0.16);
					}

					th, td {
						padding: 4px 8px;
					}

					tr:nth-child(even) {
						background-color: rgba(130, 130, 130, 0.08);
					}

					tbody th {
						font-weight: normal;
					}

					.find-match {
						background-color: var(--vscode-editor-findMatchHighlightBackground);
					}

					.current-find-match {
						background-color: var(--vscode-editor-findMatchBackground);
					}

					#_defaultColorPalatte {
						color: var(--vscode-editor-findMatchHighlightBackground);
						background-color: var(--vscode-editor-findMatchBackground);
					}
				</style>
			</head>
			<body style="overflow: hidden;">
				<div id='findStart' tabIndex=-1></div>
				<div id='container' class="widgetarea" style="position: absolute;width:100%;top: 0px"></div>
				<div id="_defaultColorPalatte"></div>
				<script type="module">${preloadScript}</script>
			</body>
		</html>`
    );
  }
  getRendererData() {
    return this.notebookService.getRenderers().map((renderer) => {
      const entrypoint = {
        extends: renderer.entrypoint.extends,
        path: this.asWebviewUri(renderer.entrypoint.path, renderer.extensionLocation).toString()
      };
      return {
        id: renderer.id,
        entrypoint,
        mimeTypes: renderer.mimeTypes,
        messaging: renderer.messaging !== "never" /* Never */ && !!this.rendererMessaging,
        isBuiltin: renderer.isBuiltin
      };
    });
  }
  getStaticPreloadsData() {
    return Array.from(this.notebookService.getStaticPreloads(this.notebookViewType), (preload) => {
      return { entrypoint: this.asWebviewUri(preload.entrypoint, preload.extensionLocation).toString().toString() };
    });
  }
  asWebviewUri(uri5, fromExtension) {
    return asWebviewUri(uri5, fromExtension?.scheme === Schemas.vscodeRemote ? { isRemote: true, authority: fromExtension.authority } : void 0);
  }
  postKernelMessage(message) {
    this._sendMessageToWebview({
      __vscode_notebook_message: true,
      type: "customKernelMessage",
      message
    });
  }
  resolveOutputId(id2) {
    const output = this.reversedInsetMapping.get(id2);
    if (!output) {
      return;
    }
    const cellInfo = this.insetMapping.get(output).cellInfo;
    return { cellInfo, output };
  }
  isResolved() {
    return !!this.webview;
  }
  createWebview(targetWindow) {
    const baseUrl = this.asWebviewUri(this.getNotebookBaseUri(), void 0);
    const htmlContent = this.generateContent(baseUrl.toString());
    return this._initialize(htmlContent, targetWindow);
  }
  getNotebookBaseUri() {
    if (this.documentUri.scheme === Schemas.untitled) {
      const folder = this.workspaceContextService.getWorkspaceFolder(this.documentUri);
      if (folder) {
        return folder.uri;
      }
      const folders = this.workspaceContextService.getWorkspace().folders;
      if (folders.length) {
        return folders[0].uri;
      }
    }
    return dirname2(this.documentUri);
  }
  getBuiltinLocalResourceRoots() {
    if (!this.documentUri.path.toLowerCase().endsWith(".ipynb")) {
      return [];
    }
    if (isWeb) {
      return [];
    }
    return [
      dirname2(FileAccess.asFileUri("vs/nls.js"))
    ];
  }
  _initialize(content2, targetWindow) {
    if (!getWindow(this.element).document.body.contains(this.element)) {
      throw new Error("Element is already detached from the DOM tree");
    }
    this.webview = this._createInset(this.webviewService, content2);
    this.webview.mountTo(this.element, targetWindow);
    this._register(this.webview);
    this._register(new WebviewWindowDragMonitor(targetWindow, () => this.webview));
    const initializePromise = new DeferredPromise();
    this._register(this.webview.onFatalError((e) => {
      initializePromise.error(new Error(`Could not initialize webview: ${e.message}}`));
    }));
    this._register(this.webview.onMessage(async (message) => {
      const data = message.message;
      if (this._disposed) {
        return;
      }
      if (!data.__vscode_notebook_message) {
        return;
      }
      switch (data.type) {
        case "initialized": {
          initializePromise.complete();
          this.initializeWebViewState();
          break;
        }
        case "initializedMarkup": {
          if (this.initializeMarkupPromise?.requestId === data.requestId) {
            this.initializeMarkupPromise?.p.complete();
            this.initializeMarkupPromise = void 0;
          }
          break;
        }
        case "dimension": {
          for (const update of data.updates) {
            const height = update.height;
            if (update.isOutput) {
              const resolvedResult = this.resolveOutputId(update.id);
              if (resolvedResult) {
                const { cellInfo, output } = resolvedResult;
                this.notebookEditor.updateOutputHeight(cellInfo, output, height, !!update.init, "webview#dimension");
                this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
              } else if (update.init) {
                const outputRequest = this.reversedPendingWebviewIdleInsetMapping.get(update.id);
                if (outputRequest) {
                  const inset = this.pendingWebviewIdleInsetMapping.get(outputRequest);
                  this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                  this.pendingWebviewIdleCreationRequest.delete(outputRequest);
                  const cellInfo = inset.cellInfo;
                  this.reversedInsetMapping.set(update.id, outputRequest);
                  this.insetMapping.set(outputRequest, inset);
                  this.notebookEditor.updateOutputHeight(cellInfo, outputRequest, height, !!update.init, "webview#dimension");
                  this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                }
                this.reversedPendingWebviewIdleInsetMapping.delete(update.id);
              }
              {
                if (!update.init) {
                  continue;
                }
                const output = this.reversedInsetMapping.get(update.id);
                if (!output) {
                  continue;
                }
                const inset = this.insetMapping.get(output);
                inset.initialized = true;
              }
            } else {
              this.notebookEditor.updateMarkupCellHeight(update.id, height, !!update.init);
            }
          }
          break;
        }
        case "mouseenter": {
          const resolvedResult = this.resolveOutputId(data.id);
          if (resolvedResult) {
            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
            if (latestCell) {
              latestCell.outputIsHovered = true;
            }
          }
          break;
        }
        case "mouseleave": {
          const resolvedResult = this.resolveOutputId(data.id);
          if (resolvedResult) {
            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
            if (latestCell) {
              latestCell.outputIsHovered = false;
            }
          }
          break;
        }
        case "outputFocus": {
          const resolvedResult = this.resolveOutputId(data.id);
          if (resolvedResult) {
            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
            if (latestCell) {
              latestCell.outputIsFocused = true;
              this.notebookEditor.focusNotebookCell(latestCell, "output", { outputId: resolvedResult.output.model.outputId, skipReveal: true, outputWebviewFocused: true });
            }
          }
          break;
        }
        case "outputBlur": {
          const resolvedResult = this.resolveOutputId(data.id);
          if (resolvedResult) {
            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
            if (latestCell) {
              latestCell.outputIsFocused = false;
              latestCell.inputInOutputIsFocused = false;
            }
          }
          break;
        }
        case "scroll-ack": {
          break;
        }
        case "scroll-to-reveal": {
          this.notebookEditor.setScrollTop(data.scrollTop - NOTEBOOK_WEBVIEW_BOUNDARY);
          break;
        }
        case "did-scroll-wheel": {
          this.notebookEditor.triggerScroll({
            ...data.payload,
            preventDefault: () => {
            },
            stopPropagation: () => {
            }
          });
          break;
        }
        case "focus-editor": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell) {
            if (data.focusNext) {
              this.notebookEditor.focusNextNotebookCell(cell, "editor");
            } else {
              await this.notebookEditor.focusNotebookCell(cell, "editor");
            }
          }
          break;
        }
        case "clicked-data-url": {
          this._onDidClickDataLink(data);
          break;
        }
        case "clicked-link": {
          if (matchesScheme(data.href, Schemas.command)) {
            const uri5 = URI.parse(data.href);
            if (uri5.path === "workbench.action.openLargeOutput") {
              const outputId = uri5.query;
              const group2 = this.editorGroupService.activeGroup;
              if (group2) {
                if (group2.activeEditor) {
                  group2.pinEditor(group2.activeEditor);
                }
              }
              this.openerService.open(CellUri.generateCellOutputUriWithId(this.documentUri, outputId));
              return;
            }
            if (uri5.path === "cellOutput.enableScrolling") {
              const outputId = uri5.query;
              const cell = this.reversedInsetMapping.get(outputId);
              if (cell) {
                this.telemetryService.publicLog2("workbenchActionExecuted", { id: "notebook.cell.toggleOutputScrolling", from: "inlineLink" });
                cell.cellViewModel.outputsViewModels.forEach((vm) => {
                  if (vm.model.metadata) {
                    vm.model.metadata["scrollable"] = true;
                    vm.resetRenderer();
                  }
                });
              }
              return;
            }
            this.openerService.open(data.href, {
              fromUserGesture: true,
              fromWorkspace: true,
              allowCommands: [
                "github-issues.authNow",
                "workbench.extensions.search",
                "workbench.action.openSettings",
                "_notebook.selectKernel",
                // TODO@rebornix explore open output channel with name command
                "jupyter.viewOutput",
                "jupyter.createPythonEnvAndSelectController"
              ]
            });
            return;
          }
          if (matchesSomeScheme(data.href, Schemas.http, Schemas.https, Schemas.mailto)) {
            this.openerService.open(data.href, { fromUserGesture: true, fromWorkspace: true });
          } else if (matchesScheme(data.href, Schemas.vscodeNotebookCell)) {
            const uri5 = URI.parse(data.href);
            await this._handleNotebookCellResource(uri5);
          } else if (!/^[\w\-]+:/.test(data.href)) {
            await this._handleResourceOpening(tryDecodeURIComponent(data.href));
          } else {
            if (isAbsolute(data.href)) {
              await this._openUri(URI.file(data.href));
            } else {
              await this._openUri(URI.parse(data.href));
            }
          }
          break;
        }
        case "customKernelMessage": {
          this._onMessage.fire({ message: data.message });
          break;
        }
        case "customRendererMessage": {
          this.rendererMessaging?.postMessage(data.rendererId, data.message);
          break;
        }
        case "clickMarkupCell": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell) {
            if (data.shiftKey || (isMacintosh ? data.metaKey : data.ctrlKey)) {
              this.notebookEditor.toggleNotebookCellSelection(
                cell,
                /* fromPrevious */
                data.shiftKey
              );
            } else {
              await this.notebookEditor.focusNotebookCell(cell, "container", { skipReveal: true });
            }
          }
          break;
        }
        case "contextMenuMarkupCell": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell) {
            await this.notebookEditor.focusNotebookCell(cell, "container", { skipReveal: true });
            const webviewRect = this.element.getBoundingClientRect();
            this.contextMenuService.showContextMenu({
              menuId: MenuId.NotebookCellTitle,
              contextKeyService: this.contextKeyService,
              getAnchor: () => ({
                x: webviewRect.x + data.clientX,
                y: webviewRect.y + data.clientY
              })
            });
          }
          break;
        }
        case "toggleMarkupPreview": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell && !this.notebookEditor.creationOptions.isReadOnly) {
            this.notebookEditor.setMarkupCellEditState(data.cellId, 1 /* Editing */);
            await this.notebookEditor.focusNotebookCell(cell, "editor", { skipReveal: true });
          }
          break;
        }
        case "mouseEnterMarkupCell": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell instanceof MarkupCellViewModel) {
            cell.cellIsHovered = true;
          }
          break;
        }
        case "mouseLeaveMarkupCell": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell instanceof MarkupCellViewModel) {
            cell.cellIsHovered = false;
          }
          break;
        }
        case "cell-drag-start": {
          this.notebookEditor.didStartDragMarkupCell(data.cellId, data);
          break;
        }
        case "cell-drag": {
          this.notebookEditor.didDragMarkupCell(data.cellId, data);
          break;
        }
        case "cell-drop": {
          this.notebookEditor.didDropMarkupCell(data.cellId, {
            dragOffsetY: data.dragOffsetY,
            ctrlKey: data.ctrlKey,
            altKey: data.altKey
          });
          break;
        }
        case "cell-drag-end": {
          this.notebookEditor.didEndDragMarkupCell(data.cellId);
          break;
        }
        case "renderedMarkup": {
          const cell = this.notebookEditor.getCellById(data.cellId);
          if (cell instanceof MarkupCellViewModel) {
            cell.renderedHtml = data.html;
          }
          this._handleHighlightCodeBlock(data.codeBlocks);
          break;
        }
        case "renderedCellOutput": {
          this._handleHighlightCodeBlock(data.codeBlocks);
          break;
        }
        case "outputResized": {
          this.notebookEditor.didResizeOutput(data.cellId);
          break;
        }
        case "getOutputItem": {
          const resolvedResult = this.resolveOutputId(data.outputId);
          const output = resolvedResult?.output.model.outputs.find((output2) => output2.mime === data.mime);
          this._sendMessageToWebview({
            type: "returnOutputItem",
            requestId: data.requestId,
            output: output ? { mime: output.mime, valueBytes: output.data.buffer } : void 0
          });
          break;
        }
        case "logRendererDebugMessage": {
          this._logRendererDebugMessage(`${data.message}${data.data ? " " + JSON.stringify(data.data, null, 4) : ""}`);
          break;
        }
        case "notebookPerformanceMessage": {
          this.notebookEditor.updatePerformanceMetadata(data.cellId, data.executionId, data.duration, data.rendererId);
          if (data.outputSize && data.rendererId === "vscode.builtin-renderer") {
            this._sendPerformanceData(data.outputSize, data.duration);
          }
          break;
        }
        case "outputInputFocus": {
          const resolvedResult = this.resolveOutputId(data.id);
          if (resolvedResult) {
            const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
            if (latestCell) {
              latestCell.inputInOutputIsFocused = data.inputFocused;
            }
          }
          this.notebookEditor.didFocusOutputInputChange(data.inputFocused);
        }
      }
    }));
    return initializePromise.p;
  }
  _sendPerformanceData(outputSize, renderTime) {
    const telemetryData = {
      outputSize,
      renderTime
    };
    this.telemetryService.publicLog2("NotebookCellOutputRender", telemetryData);
  }
  _handleNotebookCellResource(uri5) {
    const notebookResource = uri5.path.length > 0 ? uri5 : this.documentUri;
    const lineMatch = /(?:^|&)line=([^&]+)/.exec(uri5.query);
    let editorOptions2 = void 0;
    if (lineMatch) {
      const parsedLineNumber = parseInt(lineMatch[1], 10);
      if (!isNaN(parsedLineNumber)) {
        const lineNumber = parsedLineNumber;
        editorOptions2 = {
          selection: { startLineNumber: lineNumber, startColumn: 1 }
        };
      }
    }
    const executionMatch = /(?:^|&)execution_count=([^&]+)/.exec(uri5.query);
    if (executionMatch) {
      const executionCount = parseInt(executionMatch[1], 10);
      if (!isNaN(executionCount)) {
        const notebookModel = this.notebookService.getNotebookTextModel(notebookResource);
        const cell = notebookModel?.cells.slice().reverse().find((cell2) => {
          return cell2.internalMetadata.executionOrder === executionCount;
        });
        if (cell?.uri) {
          return this.openerService.open(cell.uri, {
            fromUserGesture: true,
            fromWorkspace: true,
            editorOptions: editorOptions2
          });
        }
      }
    }
    const fragmentLineMatch = /\?line=(\d+)$/.exec(uri5.fragment);
    if (fragmentLineMatch) {
      const parsedLineNumber = parseInt(fragmentLineMatch[1], 10);
      if (!isNaN(parsedLineNumber)) {
        const lineNumber = parsedLineNumber + 1;
        const fragment = uri5.fragment.substring(0, fragmentLineMatch.index);
        const editorOptions3 = {
          selection: { startLineNumber: lineNumber, startColumn: 1, endLineNumber: lineNumber, endColumn: 1 }
        };
        return this.openerService.open(notebookResource.with({ fragment }), {
          fromUserGesture: true,
          fromWorkspace: true,
          editorOptions: editorOptions3
        });
      }
    }
    return this.openerService.open(notebookResource, { fromUserGesture: true, fromWorkspace: true });
  }
  async _handleResourceOpening(href) {
    let linkToOpen = void 0;
    let fragment = void 0;
    const hrefWithFragment = FRAGMENT_REGEX.exec(href);
    if (hrefWithFragment) {
      href = hrefWithFragment[1];
      fragment = hrefWithFragment[2];
    }
    if (href.startsWith("/")) {
      linkToOpen = await this.pathService.fileURI(href);
      const folders = this.workspaceContextService.getWorkspace().folders;
      if (folders.length) {
        linkToOpen = linkToOpen.with({
          scheme: folders[0].uri.scheme,
          authority: folders[0].uri.authority
        });
      }
    } else if (href.startsWith("~")) {
      const userHome = await this.pathService.userHome();
      if (userHome) {
        linkToOpen = URI.joinPath(userHome, href.substring(2));
      }
    } else {
      if (this.documentUri.scheme === Schemas.untitled) {
        const folders = this.workspaceContextService.getWorkspace().folders;
        if (!folders.length) {
          return;
        }
        linkToOpen = URI.joinPath(folders[0].uri, href);
      } else {
        linkToOpen = URI.joinPath(dirname2(this.documentUri), href);
      }
    }
    if (linkToOpen) {
      if (fragment) {
        linkToOpen = linkToOpen.with({ fragment });
      }
      await this._openUri(linkToOpen);
    }
  }
  async _openUri(uri5) {
    let lineNumber = void 0;
    let column = void 0;
    const lineCol = LINE_COLUMN_REGEX.exec(uri5.path);
    if (lineCol) {
      uri5 = uri5.with({
        path: uri5.path.slice(0, lineCol.index),
        fragment: `L${lineCol[0].slice(1)}`
      });
      lineNumber = parseInt(lineCol[1], 10);
      column = lineCol[2] ? parseInt(lineCol[2], 10) : 1;
    }
    const lineMatch = LineQueryRegex.exec(uri5.query);
    if (lineMatch) {
      const parsedLineNumber = parseInt(lineMatch[1], 10);
      if (!isNaN(parsedLineNumber)) {
        lineNumber = parsedLineNumber + 1;
        column = 1;
        uri5 = uri5.with({ fragment: `L${lineNumber}` });
      }
    }
    uri5 = uri5.with({
      query: null
    });
    const extractedSelection = extractSelection(uri5);
    const selection = lineNumber !== void 0 && column !== void 0 ? { startLineNumber: lineNumber, startColumn: column } : extractedSelection.selection;
    const resource = extractedSelection.uri;
    if (!this.fileService.hasProvider(resource) || this.workspaceContextService.isInsideWorkspace(resource)) {
      await this.openerService.open(uri5, { fromUserGesture: true, fromWorkspace: true });
      return;
    }
    let match2 = void 0;
    for (const group2 of this.editorGroupService.groups) {
      const editorInput = group2.editors.find((editor) => editor.resource && isEqual2(editor.resource, resource, true));
      if (editorInput) {
        match2 = { group: group2, editor: editorInput };
        break;
      }
    }
    const options3 = {
      selection,
      source: 1 /* USER */
    };
    if (match2) {
      await this.editorService.openEditors([{
        editor: match2.editor,
        options: options3
      }], match2.group, { validateTrust: true });
    } else {
      await this.editorService.openEditors([{
        resource,
        options: options3
      }], void 0, { validateTrust: true });
    }
  }
  _handleHighlightCodeBlock(codeBlocks) {
    for (const { id: id2, value: value2, lang } of codeBlocks) {
      const languageId = this.languageService.getLanguageIdByLanguageName(lang);
      if (!languageId) {
        continue;
      }
      tokenizeToString(this.languageService, value2, languageId).then((html3) => {
        if (this._disposed) {
          return;
        }
        this._sendMessageToWebview({
          type: "tokenizedCodeBlock",
          html: html3,
          codeBlockId: id2
        });
      });
    }
  }
  async _onDidClickDataLink(event) {
    if (typeof event.data !== "string") {
      return;
    }
    const [splitStart, splitData] = event.data.split(";base64,");
    if (!splitData || !splitStart) {
      return;
    }
    const defaultDir = extname2(this.documentUri) === ".interactive" ? this.workspaceContextService.getWorkspace().folders[0]?.uri ?? await this.fileDialogService.defaultFilePath() : dirname2(this.documentUri);
    let defaultName;
    if (event.downloadName) {
      defaultName = event.downloadName;
    } else {
      const mimeType = splitStart.replace(/^data:/, "");
      const candidateExtension = mimeType && getExtensionForMimeType(mimeType);
      defaultName = candidateExtension ? `download${candidateExtension}` : "download";
    }
    const defaultUri = joinPath(defaultDir, defaultName);
    const newFileUri = await this.fileDialogService.showSaveDialog({
      defaultUri
    });
    if (!newFileUri) {
      return;
    }
    const buff = decodeBase64(splitData);
    await this.fileService.writeFile(newFileUri, buff);
    await this.openerService.open(newFileUri);
  }
  _createInset(webviewService, content2) {
    this.localResourceRootsCache = this._getResourceRootsCache();
    const webview = webviewService.createWebviewElement({
      origin: BackLayerWebView.getOriginStore(this.storageService).getOrigin(this.notebookViewType, void 0),
      title: localize(17897, null),
      options: {
        purpose: "notebookRenderer" /* NotebookRenderer */,
        enableFindWidget: false,
        transformCssVariables: transformWebviewThemeVars
      },
      contentOptions: {
        allowMultipleAPIAcquire: true,
        allowScripts: true,
        forwardUntrustedKeypressEvents: false,
        localResourceRoots: this.localResourceRootsCache
      },
      extension: void 0,
      providedViewType: "notebook.output"
    });
    webview.setHtml(content2);
    webview.setContextKeyService(this.contextKeyService);
    return webview;
  }
  _getResourceRootsCache() {
    const workspaceFolders = this.contextService.getWorkspace().folders.map((x) => x.uri);
    const notebookDir = this.getNotebookBaseUri();
    return [
      this.notebookService.getNotebookProviderResourceRoots(),
      this.notebookService.getRenderers().map((x) => dirname2(x.entrypoint.path)),
      ...Array.from(this.notebookService.getStaticPreloads(this.notebookViewType), (x) => [
        dirname2(x.entrypoint),
        ...x.localResourceRoots
      ]),
      workspaceFolders,
      notebookDir,
      this.getBuiltinLocalResourceRoots()
    ].flat();
  }
  initializeWebViewState() {
    this._preloadsCache.clear();
    if (this._currentKernel) {
      this._updatePreloadsFromKernel(this._currentKernel);
    }
    for (const [output, inset] of this.insetMapping.entries()) {
      this._sendMessageToWebview({ ...inset.cachedCreation, initiallyHidden: this.hiddenInsetMapping.has(output) });
    }
    if (this.initializeMarkupPromise?.isFirstInit) {
    } else {
      const mdCells = [...this.markupPreviewMapping.values()];
      this.markupPreviewMapping.clear();
      this.initializeMarkup(mdCells);
    }
    this._updateStyles();
    this._updateOptions();
  }
  shouldUpdateInset(cell, output, cellTop, outputOffset) {
    if (this._disposed) {
      return false;
    }
    if ("isOutputCollapsed" in cell && cell.isOutputCollapsed) {
      return false;
    }
    if (this.hiddenInsetMapping.has(output)) {
      return true;
    }
    const outputCache = this.insetMapping.get(output);
    if (!outputCache) {
      return false;
    }
    if (outputOffset === outputCache.cachedCreation.outputOffset && cellTop === outputCache.cachedCreation.cellTop) {
      return false;
    }
    return true;
  }
  ackHeight(updates) {
    this._sendMessageToWebview({
      type: "ack-dimension",
      updates
    });
  }
  updateScrollTops(outputRequests, markupPreviews) {
    if (this._disposed) {
      return;
    }
    const widgets2 = coalesce(outputRequests.map((request2) => {
      const outputCache = this.insetMapping.get(request2.output);
      if (!outputCache) {
        return;
      }
      if (!request2.forceDisplay && !this.shouldUpdateInset(request2.cell, request2.output, request2.cellTop, request2.outputOffset)) {
        return;
      }
      const id2 = outputCache.outputId;
      outputCache.cachedCreation.cellTop = request2.cellTop;
      outputCache.cachedCreation.outputOffset = request2.outputOffset;
      this.hiddenInsetMapping.delete(request2.output);
      return {
        cellId: request2.cell.id,
        outputId: id2,
        cellTop: request2.cellTop,
        outputOffset: request2.outputOffset,
        forceDisplay: request2.forceDisplay
      };
    }));
    if (!widgets2.length && !markupPreviews.length) {
      return;
    }
    this._sendMessageToWebview({
      type: "view-scroll",
      widgets: widgets2,
      markupCells: markupPreviews
    });
  }
  async createMarkupPreview(initialization) {
    if (this._disposed) {
      return;
    }
    if (this.markupPreviewMapping.has(initialization.cellId)) {
      console.error("Trying to create markup preview that already exists");
      return;
    }
    this.markupPreviewMapping.set(initialization.cellId, initialization);
    this._sendMessageToWebview({
      type: "createMarkupCell",
      cell: initialization
    });
  }
  async showMarkupPreview(newContent) {
    if (this._disposed) {
      return;
    }
    const entry = this.markupPreviewMapping.get(newContent.cellId);
    if (!entry) {
      return this.createMarkupPreview(newContent);
    }
    const sameContent = newContent.content === entry.content;
    const sameMetadata = equals4(newContent.metadata, entry.metadata);
    if (!sameContent || !sameMetadata || !entry.visible) {
      this._sendMessageToWebview({
        type: "showMarkupCell",
        id: newContent.cellId,
        handle: newContent.cellHandle,
        // If the content has not changed, we still want to make sure the
        // preview is visible but don't need to send anything over
        content: sameContent ? void 0 : newContent.content,
        top: newContent.offset,
        metadata: sameMetadata ? void 0 : newContent.metadata
      });
    }
    entry.metadata = newContent.metadata;
    entry.content = newContent.content;
    entry.offset = newContent.offset;
    entry.visible = true;
  }
  async hideMarkupPreviews(cellIds) {
    if (this._disposed) {
      return;
    }
    const cellsToHide = [];
    for (const cellId of cellIds) {
      const entry = this.markupPreviewMapping.get(cellId);
      if (entry) {
        if (entry.visible) {
          cellsToHide.push(cellId);
          entry.visible = false;
        }
      }
    }
    if (cellsToHide.length) {
      this._sendMessageToWebview({
        type: "hideMarkupCells",
        ids: cellsToHide
      });
    }
  }
  async unhideMarkupPreviews(cellIds) {
    if (this._disposed) {
      return;
    }
    const toUnhide = [];
    for (const cellId of cellIds) {
      const entry = this.markupPreviewMapping.get(cellId);
      if (entry) {
        if (!entry.visible) {
          entry.visible = true;
          toUnhide.push(cellId);
        }
      } else {
        console.error(`Trying to unhide a preview that does not exist: ${cellId}`);
      }
    }
    this._sendMessageToWebview({
      type: "unhideMarkupCells",
      ids: toUnhide
    });
  }
  async deleteMarkupPreviews(cellIds) {
    if (this._disposed) {
      return;
    }
    for (const id2 of cellIds) {
      if (!this.markupPreviewMapping.has(id2)) {
        console.error(`Trying to delete a preview that does not exist: ${id2}`);
      }
      this.markupPreviewMapping.delete(id2);
    }
    if (cellIds.length) {
      this._sendMessageToWebview({
        type: "deleteMarkupCell",
        ids: cellIds
      });
    }
  }
  async updateMarkupPreviewSelections(selectedCellsIds) {
    if (this._disposed) {
      return;
    }
    this._sendMessageToWebview({
      type: "updateSelectedMarkupCells",
      selectedCellIds: selectedCellsIds.filter((id2) => this.markupPreviewMapping.has(id2))
    });
  }
  async initializeMarkup(cells) {
    if (this._disposed) {
      return;
    }
    this.initializeMarkupPromise?.p.complete();
    const requestId = generateUuid();
    this.initializeMarkupPromise = { p: new DeferredPromise(), requestId, isFirstInit: this.firstInit };
    this.firstInit = false;
    for (const cell of cells) {
      this.markupPreviewMapping.set(cell.cellId, cell);
    }
    this._sendMessageToWebview({
      type: "initializeMarkup",
      cells,
      requestId
    });
    return this.initializeMarkupPromise.p.p;
  }
  /**
   * Validate if cached inset is out of date and require a rerender
   * Note that it doesn't account for output content change.
   */
  _cachedInsetEqual(cachedInset, content2) {
    if (content2.type === 1 /* Extension */) {
      return cachedInset.renderer?.id === content2.renderer.id;
    } else {
      return cachedInset.cachedCreation.type === "html";
    }
  }
  requestCreateOutputWhenWebviewIdle(cellInfo, content2, cellTop, offset) {
    if (this._disposed) {
      return;
    }
    if (this.insetMapping.has(content2.source)) {
      return;
    }
    if (this.pendingWebviewIdleCreationRequest.has(content2.source)) {
      return;
    }
    if (this.pendingWebviewIdleInsetMapping.has(content2.source)) {
      return;
    }
    this.pendingWebviewIdleCreationRequest.set(content2.source, runWhenGlobalIdle(() => {
      const { message, renderer, transfer: transferable } = this._createOutputCreationMessage(cellInfo, content2, cellTop, offset, true, true);
      this._sendMessageToWebview(message, transferable);
      this.pendingWebviewIdleInsetMapping.set(content2.source, { outputId: message.outputId, versionId: content2.source.model.versionId, cellInfo, renderer, cachedCreation: message });
      this.reversedPendingWebviewIdleInsetMapping.set(message.outputId, content2.source);
      this.pendingWebviewIdleCreationRequest.delete(content2.source);
    }));
  }
  createOutput(cellInfo, content2, cellTop, offset) {
    if (this._disposed) {
      return;
    }
    const cachedInset = this.insetMapping.get(content2.source);
    this.pendingWebviewIdleCreationRequest.get(content2.source)?.dispose();
    this.pendingWebviewIdleCreationRequest.delete(content2.source);
    this.pendingWebviewIdleInsetMapping.delete(content2.source);
    if (cachedInset) {
      this.reversedPendingWebviewIdleInsetMapping.delete(cachedInset.outputId);
    }
    if (cachedInset && this._cachedInsetEqual(cachedInset, content2)) {
      this.hiddenInsetMapping.delete(content2.source);
      this._sendMessageToWebview({
        type: "showOutput",
        cellId: cachedInset.cellInfo.cellId,
        outputId: cachedInset.outputId,
        cellTop,
        outputOffset: offset
      });
      return;
    }
    const { message, renderer, transfer: transferable } = this._createOutputCreationMessage(cellInfo, content2, cellTop, offset, false, false);
    this._sendMessageToWebview(message, transferable);
    this.insetMapping.set(content2.source, { outputId: message.outputId, versionId: content2.source.model.versionId, cellInfo, renderer, cachedCreation: message });
    this.hiddenInsetMapping.delete(content2.source);
    this.reversedInsetMapping.set(message.outputId, content2.source);
  }
  createMetadata(output, mimeType) {
    if (mimeType.startsWith("image")) {
      const buffer = output.outputs.find((out) => out.mime === "text/plain")?.data.buffer;
      if (buffer?.length && buffer?.length > 0) {
        const altText = new TextDecoder().decode(buffer);
        return { ...output.metadata, vscode_altText: altText };
      }
    }
    return output.metadata;
  }
  _createOutputCreationMessage(cellInfo, content2, cellTop, offset, createOnIdle, initiallyHidden) {
    const messageBase = {
      type: "html",
      executionId: cellInfo.executionId,
      cellId: cellInfo.cellId,
      cellTop,
      outputOffset: offset,
      left: 0,
      requiredPreloads: [],
      createOnIdle
    };
    const transfer = [];
    let message;
    let renderer;
    if (content2.type === 1 /* Extension */) {
      const output = content2.source.model;
      renderer = content2.renderer;
      const first2 = output.outputs.find((op) => op.mime === content2.mimeType);
      const metadata = this.createMetadata(output, content2.mimeType);
      const valueBytes = copyBufferIfNeeded(first2.data.buffer, transfer);
      message = {
        ...messageBase,
        outputId: output.outputId,
        rendererId: content2.renderer.id,
        content: {
          type: 1 /* Extension */,
          outputId: output.outputId,
          metadata,
          output: {
            mime: first2.mime,
            valueBytes
          },
          allOutputs: output.outputs.map((output2) => ({ mime: output2.mime }))
        },
        initiallyHidden
      };
    } else {
      message = {
        ...messageBase,
        outputId: generateUuid(),
        content: {
          type: content2.type,
          htmlContent: content2.htmlContent
        },
        initiallyHidden
      };
    }
    return {
      message,
      renderer,
      transfer
    };
  }
  updateOutput(cellInfo, content2, cellTop, offset) {
    if (this._disposed) {
      return;
    }
    if (!this.insetMapping.has(content2.source)) {
      this.createOutput(cellInfo, content2, cellTop, offset);
      return;
    }
    const outputCache = this.insetMapping.get(content2.source);
    if (outputCache.versionId === content2.source.model.versionId) {
      return;
    }
    this.hiddenInsetMapping.delete(content2.source);
    let updatedContent = void 0;
    const transfer = [];
    if (content2.type === 1 /* Extension */) {
      const output = content2.source.model;
      const firstBuffer = output.outputs.find((op) => op.mime === content2.mimeType);
      const appenededData = output.appendedSinceVersion(outputCache.versionId, content2.mimeType);
      const appended = appenededData ? { valueBytes: appenededData.buffer, previousVersion: outputCache.versionId } : void 0;
      const valueBytes = copyBufferIfNeeded(firstBuffer.data.buffer, transfer);
      updatedContent = {
        type: 1 /* Extension */,
        outputId: outputCache.outputId,
        metadata: output.metadata,
        output: {
          mime: content2.mimeType,
          valueBytes,
          appended
        },
        allOutputs: output.outputs.map((output2) => ({ mime: output2.mime }))
      };
    }
    this._sendMessageToWebview({
      type: "showOutput",
      cellId: outputCache.cellInfo.cellId,
      outputId: outputCache.outputId,
      cellTop,
      outputOffset: offset,
      content: updatedContent
    }, transfer);
    outputCache.versionId = content2.source.model.versionId;
    return;
  }
  async copyImage(output) {
    const textAlternates = [];
    const cellOutput = output.model;
    for (const outputItem of cellOutput.outputs) {
      if (TEXT_BASED_MIMETYPES.includes(outputItem.mime)) {
        const text2 = isTextStreamMime(outputItem.mime) ? getOutputStreamText(output).text : getOutputText(outputItem.mime, outputItem);
        textAlternates.push({
          mimeType: outputItem.mime,
          content: text2
        });
      }
    }
    this._sendMessageToWebview({
      type: "copyImage",
      outputId: output.model.outputId,
      altOutputId: output.model.alternativeOutputId,
      textAlternates: textAlternates.length > 0 ? textAlternates : void 0
    });
  }
  removeInsets(outputs) {
    if (this._disposed) {
      return;
    }
    for (const output of outputs) {
      const outputCache = this.insetMapping.get(output);
      if (!outputCache) {
        continue;
      }
      const id2 = outputCache.outputId;
      this._sendMessageToWebview({
        type: "clearOutput",
        rendererId: outputCache.cachedCreation.rendererId,
        cellUri: outputCache.cellInfo.cellUri.toString(),
        outputId: id2,
        cellId: outputCache.cellInfo.cellId
      });
      this.insetMapping.delete(output);
      this.pendingWebviewIdleCreationRequest.get(output)?.dispose();
      this.pendingWebviewIdleCreationRequest.delete(output);
      this.pendingWebviewIdleInsetMapping.delete(output);
      this.reversedPendingWebviewIdleInsetMapping.delete(id2);
      this.reversedInsetMapping.delete(id2);
    }
  }
  hideInset(output) {
    if (this._disposed) {
      return;
    }
    const outputCache = this.insetMapping.get(output);
    if (!outputCache) {
      return;
    }
    this.hiddenInsetMapping.add(output);
    this._sendMessageToWebview({
      type: "hideOutput",
      outputId: outputCache.outputId,
      cellId: outputCache.cellInfo.cellId
    });
  }
  focusWebview() {
    if (this._disposed) {
      return;
    }
    this.webview?.focus();
  }
  selectOutputContents(cell) {
    if (this._disposed) {
      return;
    }
    const output = cell.outputsViewModels.find((o) => o.model.outputId === cell.focusedOutputId);
    const outputId = output ? this.insetMapping.get(output)?.outputId : void 0;
    this._sendMessageToWebview({
      type: "select-output-contents",
      cellOrOutputId: outputId || cell.id
    });
  }
  selectInputContents(cell) {
    if (this._disposed) {
      return;
    }
    const output = cell.outputsViewModels.find((o) => o.model.outputId === cell.focusedOutputId);
    const outputId = output ? this.insetMapping.get(output)?.outputId : void 0;
    this._sendMessageToWebview({
      type: "select-input-contents",
      cellOrOutputId: outputId || cell.id
    });
  }
  focusOutput(cellOrOutputId, alternateId, viewFocused) {
    if (this._disposed) {
      return;
    }
    if (!viewFocused) {
      this.webview?.focus();
    }
    this._sendMessageToWebview({
      type: "focus-output",
      cellOrOutputId,
      alternateId
    });
  }
  blurOutput() {
    if (this._disposed) {
      return;
    }
    this._sendMessageToWebview({
      type: "blur-output"
    });
  }
  async find(query, options3) {
    if (query === "") {
      this._sendMessageToWebview({
        type: "findStop",
        ownerID: options3.ownerID
      });
      return [];
    }
    const p = new Promise((resolve3) => {
      const sub = this.webview?.onMessage((e) => {
        if (e.message.type === "didFind") {
          resolve3(e.message.matches);
          sub?.dispose();
        }
      });
    });
    this._sendMessageToWebview({
      type: "find",
      query,
      options: options3
    });
    const ret = await p;
    return ret;
  }
  findStop(ownerID) {
    this._sendMessageToWebview({
      type: "findStop",
      ownerID
    });
  }
  async findHighlightCurrent(index2, ownerID) {
    const p = new Promise((resolve3) => {
      const sub = this.webview?.onMessage((e) => {
        if (e.message.type === "didFindHighlightCurrent") {
          resolve3(e.message.offset);
          sub?.dispose();
        }
      });
    });
    this._sendMessageToWebview({
      type: "findHighlightCurrent",
      index: index2,
      ownerID
    });
    const ret = await p;
    return ret;
  }
  async findUnHighlightCurrent(index2, ownerID) {
    this._sendMessageToWebview({
      type: "findUnHighlightCurrent",
      index: index2,
      ownerID
    });
  }
  deltaCellOutputContainerClassNames(cellId, added, removed) {
    this._sendMessageToWebview({
      type: "decorations",
      cellId,
      addedClassNames: added,
      removedClassNames: removed
    });
  }
  deltaMarkupPreviewClassNames(cellId, added, removed) {
    if (this.markupPreviewMapping.get(cellId)) {
      this._sendMessageToWebview({
        type: "markupDecorations",
        cellId,
        addedClassNames: added,
        removedClassNames: removed
      });
    }
  }
  updateOutputRenderers() {
    if (!this.webview) {
      return;
    }
    const renderersData = this.getRendererData();
    this.localResourceRootsCache = this._getResourceRootsCache();
    const mixedResourceRoots = [
      ...this.localResourceRootsCache || [],
      ...this._currentKernel ? [this._currentKernel.localResourceRoot] : []
    ];
    this.webview.localResourcesRoot = mixedResourceRoots;
    this._sendMessageToWebview({
      type: "updateRenderers",
      rendererData: renderersData
    });
  }
  async updateKernelPreloads(kernel) {
    if (this._disposed || kernel === this._currentKernel) {
      return;
    }
    const previousKernel = this._currentKernel;
    this._currentKernel = kernel;
    if (previousKernel && previousKernel.preloadUris.length > 0) {
      this.webview?.reload();
    } else if (kernel) {
      this._updatePreloadsFromKernel(kernel);
    }
  }
  _updatePreloadsFromKernel(kernel) {
    const resources = [];
    for (const preload of kernel.preloadUris) {
      const uri5 = this.environmentService.isExtensionDevelopment && (preload.scheme === "http" || preload.scheme === "https") ? preload : this.asWebviewUri(preload, void 0);
      if (!this._preloadsCache.has(uri5.toString())) {
        resources.push({ uri: uri5.toString(), originalUri: preload.toString() });
        this._preloadsCache.add(uri5.toString());
      }
    }
    if (!resources.length) {
      return;
    }
    this._updatePreloads(resources);
  }
  _updatePreloads(resources) {
    if (!this.webview) {
      return;
    }
    const mixedResourceRoots = [
      ...this.localResourceRootsCache || [],
      ...this._currentKernel ? [this._currentKernel.localResourceRoot] : []
    ];
    this.webview.localResourcesRoot = mixedResourceRoots;
    this._sendMessageToWebview({
      type: "preload",
      resources
    });
  }
  _sendMessageToWebview(message, transfer) {
    if (this._disposed) {
      return;
    }
    this.webview?.postMessage(message, transfer);
  }
  dispose() {
    this._disposed = true;
    this.webview?.dispose();
    this.webview = void 0;
    this.notebookEditor = null;
    this.insetMapping.clear();
    this.pendingWebviewIdleCreationRequest.clear();
    super.dispose();
  }
};

BackLayerWebView = __decorateClass([
  __decorateParam(6, IWebviewService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, INotebookService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IFileDialogService),
  __decorateParam(12, IFileService),
  __decorateParam(13, IContextMenuService),
  __decorateParam(14, IContextKeyService),
  __decorateParam(15, IWorkspaceTrustManagementService),
  __decorateParam(16, IConfigurationService),
  __decorateParam(17, ILanguageService),
  __decorateParam(18, IWorkspaceContextService),
  __decorateParam(19, IEditorGroupsService),
  __decorateParam(20, IEditorService),
  __decorateParam(21, IStorageService),
  __decorateParam(22, IPathService),
  __decorateParam(23, INotebookLoggingService),
  __decorateParam(24, IThemeService),
  __decorateParam(25, ITelemetryService)
], BackLayerWebView);

function copyBufferIfNeeded(buffer, transfer) {
  if (buffer.byteLength === buffer.buffer.byteLength) {
    return buffer;
  } else {
    const valueBytes = new Uint8Array(buffer);
    transfer.push(valueBytes.buffer);
    return valueBytes;
  }
}

function getTokenizationCss() {
  const colorMap = TokenizationRegistry2.getColorMap();
  const tokenizationCss = colorMap ? generateTokensCSSForColorMap(colorMap) : "";
  return tokenizationCss;
}

function tryDecodeURIComponent(uri5) {
  try {
    return decodeURIComponent(uri5);
  } catch {
    return uri5;
  }
}
export { copyBufferIfNeeded, getTokenizationCss, tryDecodeURIComponent, LINE_COLUMN_REGEX, LineQueryRegex, FRAGMENT_REGEX, BackLayerWebView };
