// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/browser/releaseNotesEditor.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { SimpleSettingRenderer } from "./module-3317.mjs";
import { dirname2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ACTIVE_GROUP, IEditorService } from "./module-0935.mjs";
import { escape } from "./module-0030.mjs";
import { KeybindingParser } from "./module-1606.mjs";
import { escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { IRequestService, asTextOrError } from "./module-0947.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Schemas } from "./module-0033.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { getTelemetryLevel, supportsTelemetry } from "./module-0887.mjs";
import { generateUuid } from "./module-0190.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";
import { asWebviewUri } from "./module-1888.mjs";
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from "./module-2721.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IWebviewWorkbenchService } from "./module-1121.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IProductService } from "./module-0875.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/update/browser/releaseNotesEditor.ts
var ReleaseNotesManager = class extends Disposable {
  constructor(_environmentService, _keybindingService, _languageService, _openerService, _requestService, _configurationService, _editorService, _editorGroupService, _codeEditorService, _webviewWorkbenchService, _extensionService, _productService, _instantiationService) {
    super();
    this._environmentService = _environmentService;
    this._keybindingService = _keybindingService;
    this._languageService = _languageService;
    this._openerService = _openerService;
    this._requestService = _requestService;
    this._configurationService = _configurationService;
    this._editorService = _editorService;
    this._editorGroupService = _editorGroupService;
    this._codeEditorService = _codeEditorService;
    this._webviewWorkbenchService = _webviewWorkbenchService;
    this._extensionService = _extensionService;
    this._productService = _productService;
    this._instantiationService = _instantiationService;
    this._releaseNotesCache = /* @__PURE__ */ new Map();
    this._currentReleaseNotes = void 0;
    this._register(TokenizationRegistry2.onDidChange(() => {
      return this.updateHtml();
    }));
    this._register(_configurationService.onDidChangeConfiguration((e4) => this.onDidChangeConfiguration(e4)));
    this._register(_webviewWorkbenchService.onDidChangeActiveWebviewEditor((e4) => this.onDidChangeActiveWebviewEditor(e4)));
    this._simpleSettingRenderer = this._instantiationService.createInstance(SimpleSettingRenderer);
  }
  async updateHtml() {
    if (!this._currentReleaseNotes || !this._lastMeta) {
      return;
    }
    const html3 = await this.renderBody(this._lastMeta);
    if (this._currentReleaseNotes) {
      this._currentReleaseNotes.webview.setHtml(html3);
    }
  }
  async getBase(useCurrentFile) {
    if (useCurrentFile) {
      const currentFileUri = this._codeEditorService.getActiveCodeEditor()?.getModel()?.uri;
      if (currentFileUri) {
        return dirname2(currentFileUri);
      }
    }
    return URI.parse("https://code.visualstudio.com/raw");
  }
  async show(version2, useCurrentFile) {
    const releaseNoteText = await this.loadReleaseNotes(version2, useCurrentFile);
    const base = await this.getBase(useCurrentFile);
    this._lastMeta = { text: releaseNoteText, base };
    const html3 = await this.renderBody(this._lastMeta);
    const title = localize(21464, null, version2);
    const activeEditorPane = this._editorService.activeEditorPane;
    if (this._currentReleaseNotes) {
      this._currentReleaseNotes.setWebviewTitle(title);
      this._currentReleaseNotes.webview.setHtml(html3);
      this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes, activeEditorPane ? activeEditorPane.group : this._editorGroupService.activeGroup, false);
    } else {
      this._currentReleaseNotes = this._webviewWorkbenchService.openWebview(
        {
          title,
          options: {
            tryRestoreScrollPosition: true,
            enableFindWidget: true,
            disableServiceWorker: useCurrentFile ? false : true
          },
          contentOptions: {
            localResourceRoots: useCurrentFile ? [base] : [],
            allowScripts: true
          },
          extension: void 0
        },
        "releaseNotes",
        title,
        Codicon.vscode,
        { group: ACTIVE_GROUP, preserveFocus: false }
      );
      const disposables = new DisposableStore();
      disposables.add(this._currentReleaseNotes.webview.onDidClickLink((uri4) => this.onDidClickLink(URI.parse(uri4))));
      disposables.add(this._currentReleaseNotes.webview.onMessage((e4) => {
        if (e4.message.type === "showReleaseNotes") {
          this._configurationService.updateValue("update.showReleaseNotes", e4.message.value);
        } else if (e4.message.type === "clickSetting") {
          const x = this._currentReleaseNotes?.webview.container.offsetLeft + e4.message.value.x;
          const y = this._currentReleaseNotes?.webview.container.offsetTop + e4.message.value.y;
          this._simpleSettingRenderer.updateSetting(URI.parse(e4.message.value.uri), x, y);
        }
      }));
      disposables.add(this._currentReleaseNotes.onWillDispose(() => {
        disposables.dispose();
        this._currentReleaseNotes = void 0;
      }));
      this._currentReleaseNotes.webview.setHtml(html3);
    }
    return true;
  }
  async loadReleaseNotes(version2, useCurrentFile) {
    const match2 = /^(\d+\.\d+)\./.exec(version2);
    if (!match2) {
      throw new Error("not found");
    }
    const versionLabel = match2[1].replace(/\./g, "_");
    const baseUrl = "https://code.visualstudio.com/raw";
    const url = `${baseUrl}/v${versionLabel}.md`;
    const unassigned = localize(21466, null);
    const escapeMdHtml = (text2) => {
      return escape(text2).replace(/\\/g, "\\\\");
    };
    const patchKeybindings = (text2) => {
      const kb = (match3, kb2) => {
        const keybinding = this._keybindingService.lookupKeybinding(kb2);
        if (!keybinding) {
          return kb2;
        }
        return keybinding.getLabel() || kb2;
      };
      const kbstyle = (match3, kb2) => {
        const keybinding = KeybindingParser.parseKeybinding(kb2);
        if (!keybinding) {
          return unassigned;
        }
        const resolvedKeybindings = this._keybindingService.resolveKeybinding(keybinding);
        if (resolvedKeybindings.length === 0) {
          return unassigned;
        }
        return resolvedKeybindings[0].getLabel() || unassigned;
      };
      const kbCode = (match3, binding) => {
        const resolved = kb(match3, binding);
        return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
      };
      const kbstyleCode = (match3, binding) => {
        const resolved = kbstyle(match3, binding);
        return resolved ? `<code title="${binding}">${escapeMdHtml(resolved)}</code>` : resolved;
      };
      return text2.replace(/`kb\(([a-z.\d\-]+)\)`/gi, kbCode).replace(/`kbstyle\(([^\)]+)\)`/gi, kbstyleCode).replace(/kb\(([a-z.\d\-]+)\)/gi, (match3, binding) => escapeMarkdownSyntaxTokens(kb(match3, binding))).replace(/kbstyle\(([^\)]+)\)/gi, (match3, binding) => escapeMarkdownSyntaxTokens(kbstyle(match3, binding)));
    };
    const fetchReleaseNotes = async () => {
      let text2;
      try {
        if (useCurrentFile) {
          const file = this._codeEditorService.getActiveCodeEditor()?.getModel()?.getValue();
          text2 = file ? file.substring(file.indexOf("#")) : void 0;
        } else {
          text2 = await asTextOrError(await this._requestService.request({ url, callSite: "releaseNotesEditor.fetchReleaseNotes" }, CancellationToken.None));
        }
      } catch {
        throw new Error("Failed to fetch release notes");
      }
      if (!text2 || !/^#\s/.test(text2) && !useCurrentFile) {
        throw new Error("Invalid release notes");
      }
      return patchKeybindings(text2);
    };
    if (useCurrentFile) {
      return fetchReleaseNotes();
    }
    if (!this._releaseNotesCache.has(version2)) {
      this._releaseNotesCache.set(version2, (async () => {
        try {
          return await fetchReleaseNotes();
        } catch (err) {
          this._releaseNotesCache.delete(version2);
          throw err;
        }
      })());
    }
    return this._releaseNotesCache.get(version2);
  }
  async onDidClickLink(uri4) {
    if (uri4.scheme === Schemas.codeSetting) {
    } else {
      this.addGAParameters(uri4, "ReleaseNotes").then((updated) => this._openerService.open(updated, { allowCommands: ["workbench.action.openSettings", "summarize.release.notes"] })).then(void 0, onUnexpectedError);
    }
  }
  async addGAParameters(uri4, origin, experiment = "1") {
    if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === 3 /* USAGE */) {
      if (uri4.scheme === "https" && uri4.authority === "code.visualstudio.com") {
        return uri4.with({ query: `${uri4.query ? uri4.query + "&" : ""}utm_source=VsCode&utm_medium=${encodeURIComponent(origin)}&utm_content=${encodeURIComponent(experiment)}` });
      }
    }
    return uri4;
  }
  async renderBody(fileContent) {
    const nonce = generateUuid();
    const processedContent = await renderReleaseNotesMarkdown(fileContent.text, this._extensionService, this._languageService, this._simpleSettingRenderer, this._productService.quality);
    const colorMap = TokenizationRegistry2.getColorMap();
    const css = colorMap ? generateTokensCSSForColorMap(colorMap) : "";
    const showReleaseNotes2 = Boolean(this._configurationService.getValue("update.showReleaseNotes"));
    return `<!DOCTYPE html>
		<html>
			<head>
				<base href="${asWebviewUri(fileContent.base).toString(true)}/" >
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${nonce}' https://code.visualstudio.com; script-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${DEFAULT_MARKDOWN_STYLES}
					${css}

					/* codesetting */

					code:has(.codesetting) {
						background-color: var(--vscode-textPreformat-background);
						color: var(--vscode-textPreformat-foreground);
						padding-left: 1px;
						margin-right: 3px;
						padding-right: 0px;
					}

					code:has(.codesetting):focus {
						border: 1px solid var(--vscode-button-border, transparent);
					}

					.codesetting {
						color: var(--vscode-textPreformat-foreground);
						padding: 0px 1px 1px 0px;
						font-size: 0px;
						overflow: hidden;
						text-overflow: ellipsis;
						outline-offset: 2px !important;
						box-sizing: border-box;
						text-align: center;
						cursor: pointer;
						display: inline;
						margin-right: 3px;
					}
					.codesetting svg {
						font-size: 12px;
						text-align: center;
						cursor: pointer;
						border: 1px solid var(--vscode-button-secondaryBorder, transparent);
						outline: 1px solid transparent;
						line-height: 9px;
						margin-bottom: -5px;
						padding-left: 0px;
						padding-top: 2px;
						padding-bottom: 2px;
						padding-right: 2px;
						display: inline-block;
						text-decoration: none;
						text-rendering: auto;
						text-transform: none;
						-webkit-font-smoothing: antialiased;
						-moz-osx-font-smoothing: grayscale;
						user-select: none;
						-webkit-user-select: none;
					}
					.codesetting .setting-name {
						font-size: 13px;
						padding-left: 2px;
						padding-right: 3px;
						padding-top: 1px;
						padding-bottom: 1px;
						margin-top: -3px;
					}
					.codesetting:hover {
						color: var(--vscode-textPreformat-foreground) !important;
						text-decoration: none !important;
					}
					code:has(.codesetting):hover {
						filter: brightness(140%);
						text-decoration: none !important;
					}
					.codesetting:focus {
						outline: 0 !important;
						text-decoration: none !important;
						color: var(--vscode-button-hoverForeground) !important;
					}
					.codesetting .separator {
						width: 1px;
						height: 14px;
						margin-bottom: -3px;
						display: inline-block;
						background-color: var(--vscode-editor-background);
						font-size: 12px;
						margin-right: 4px;
					}

					header { display: flex; align-items: center; padding-top: 1em; }

					/* Release notes enhancements from vscode-docs */
					html {
						font-size: 10px;
						height: 100%;
						overscroll-behavior: none;
					}

					body {
						margin: 0 auto;
						max-width: 980px;
						height: auto;
						overflow-y: auto;
						overscroll-behavior: none;
					}

					/* Scroll to top button */
					#scroll-to-top {
						position: fixed;
						width: 40px;
						height: 40px;
						right: 25px;
						bottom: 25px;
						background-color: var(--vscode-button-background, #444);
						border-color: var(--vscode-button-border);
						border-radius: 50%;
						cursor: pointer;
						box-shadow: 1px 1px 1px rgba(0,0,0,.25);
						outline: none;
						display: flex;
						justify-content: center;
						align-items: center;
					}

					#scroll-to-top:hover {
						background-color: var(--vscode-button-hoverBackground);
						box-shadow: 2px 2px 2px rgba(0,0,0,.25);
					}

					body.vscode-high-contrast #scroll-to-top {
						border-width: 2px;
						border-style: solid;
						box-shadow: none;
					}

					#scroll-to-top span.icon::before {
						content: "";
						display: block;
						background: var(--vscode-button-foreground);
						/* Chevron up icon */
						-webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						width: 16px;
						height: 16px;
					}

					/* Header styling */
					h2 {
						margin-top: 1.2em;
						scroll-margin-top: 1.2em;
					}

					h2:not(:first-of-type) {
						margin-top: 4em;
						scroll-margin-top: 1em;
					}

					h3 {
						margin-top: 4em;
						scroll-margin-top: 1em;
					}

					h2 + h3 {
						margin-top: 0;
					}

					/* Highlights table styling */
					.highlights-table {
						border-collapse: collapse;
						border: none;
					}

					.highlights-table th {
						vertical-align: top;
						border: none;
						padding-top: 2em;
						font-weight: bold;
					}

					.highlights-table td {
						vertical-align: top;
						border: none;
					}

					.highlights-table tr:nth-child(2) td {
						padding-bottom: 1em;
					}

					/* Main content layout */
					.toc-nav-layout {
						display: flex;
						align-items: flex-start;
					}

					/* TOC Navigation */
					#toc-nav {
						position: sticky;
						top: 20px;
						width: 10vw;
						min-width: 120px;
						margin-right: 32px;
						margin-top: 2em;
					}

					#toc-nav > div {
						font-weight: bold;
						font-size: 1em;
						margin-bottom: 1em;
						text-transform: uppercase;
					}

					#toc-nav ul {
						list-style: none;
						padding: 0;
						margin: 0;
					}

					#toc-nav ul li {
						margin-bottom: 0.5em;
					}

					#toc-nav a {
						color: var(--vscode-editor-foreground, #ccc);
						text-decoration: none !important;
						transition: background-color 0.2s, color 0.2s;
						padding: 4px 6px;
						margin: -4px -6px;
						border-radius: 4px;
						display: block;
						outline: none;
					}

					#toc-nav a:hover {
						background-color: var(--vscode-button-secondaryHoverBackground, #1177bb);
						color: var(--vscode-button-secondaryForeground, #ffffff);
						cursor: pointer;
						text-decoration: none !important;
					}

					/* Main content area */
					.notes-main {
						flex: 1;
						min-width: 0;
					}

					/* Responsive breakpoint - Hide TOC on smaller screens */
					@media (max-width: 576px) {
						#toc-nav {
							display: none;
						}

						.toc-nav-layout {
							flex-direction: column;
						}

						.notes-main {
							margin-left: 0;
						}
					}

				</style>
			</head>
			<body>
				${processedContent}
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
					const container = document.createElement('p');
					container.style.display = 'flex';
					container.style.alignItems = 'center';

					const input = document.createElement('input');
					input.type = 'checkbox';
					input.id = 'showReleaseNotes';
					input.checked = ${showReleaseNotes2};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${localize(21465, null)}';
					container.appendChild(label);

					const beforeElement = document.querySelector("body > h1")?.nextElementSibling;
					if (beforeElement) {
						document.body.insertBefore(container, beforeElement);
					} else {
						document.body.appendChild(container);
					}

					window.addEventListener('message', event => {
						if (event.data.type === 'showReleaseNotes') {
							input.checked = event.data.value;
						}
					});

					window.addEventListener('click', event => {
						const href = event.target.href ?? event.target.parentElement?.href ?? event.target.parentElement?.parentElement?.href;
						if (href && (href.startsWith('${Schemas.codeSetting}'))) {
							vscode.postMessage({ type: 'clickSetting', value: { uri: href, x: event.clientX, y: event.clientY }});
						}
					});

					window.addEventListener('keypress', event => {
						if (event.keyCode === 13) {
							if (event.target.children.length > 0 && event.target.children[0].href) {
								const clientRect = event.target.getBoundingClientRect();
								vscode.postMessage({ type: 'clickSetting', value: { uri: event.target.children[0].href, x: clientRect.right , y: clientRect.bottom }});
							}
						}
					});

					input.addEventListener('change', event => {
						vscode.postMessage({ type: 'showReleaseNotes', value: input.checked }, '*');
					});
				</script>
			</body>
		</html>`;
  }
  onDidChangeConfiguration(e4) {
    if (e4.affectsConfiguration("update.showReleaseNotes")) {
      this.updateCheckboxWebview();
    }
  }
  onDidChangeActiveWebviewEditor(input) {
    if (input && input === this._currentReleaseNotes) {
      this.updateCheckboxWebview();
    }
  }
  updateCheckboxWebview() {
    if (this._currentReleaseNotes) {
      this._currentReleaseNotes.webview.postMessage({
        type: "showReleaseNotes",
        value: this._configurationService.getValue("update.showReleaseNotes")
      });
    }
  }
};

ReleaseNotesManager = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IRequestService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IEditorGroupsService),
  __decorateParam(8, ICodeEditorService),
  __decorateParam(9, IWebviewWorkbenchService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IInstantiationService)
], ReleaseNotesManager);

function processConditionalBlocks(text2, activeConditions) {
  return text2.replace(
    /<!--\s*%IF\s+(\w+)\s*%([\s\S]*?)%ENDIF\s*%\s*-->/gi,
    (_match, condition, content) => {
      if (activeConditions.has(condition.toUpperCase())) {
        return content;
      }
      return "";
    }
  );
}

async function renderReleaseNotesMarkdown(text2, extensionService, languageService, simpleSettingRenderer, quality) {
  text2 = text2.toString().replace(/<!--\s*TOC\s*/gi, "").replace(/\s*Navigation End\s*-->/gi, "");
  const activeConditions = /* @__PURE__ */ new Set(["IN_PRODUCT"]);
  if (quality === "stable") {
    activeConditions.add("STABLE");
  } else if (quality === "insider") {
    activeConditions.add("INSIDERS");
  }
  text2 = processConditionalBlocks(text2, activeConditions);
  return renderMarkdownDocument(text2, extensionService, languageService, {
    sanitizerConfig: {
      allowRelativeMediaPaths: true,
      allowedLinkProtocols: {
        override: [Schemas.http, Schemas.https, Schemas.command, Schemas.codeSetting]
      },
      allowedTags: { augment: ["nav", "svg", "path"] },
      allowedAttributes: { augment: ["aria-role", "viewBox", "fill", "xmlns", "d"] }
    },
    markedExtensions: [{
      renderer: {
        html: simpleSettingRenderer.getHtmlRenderer(),
        codespan: simpleSettingRenderer.getCodeSpanRenderer()
      }
    }]
  });
}
export { processConditionalBlocks, renderReleaseNotesMarkdown, ReleaseNotesManager };
