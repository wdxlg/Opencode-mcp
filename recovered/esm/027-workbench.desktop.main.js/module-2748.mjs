// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentPluginEditor/agentPluginEditor.ts
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, reset, setParentFlowTo } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { EnablementDropDownAction, EnablementDropdownActionViewItem, InstallPluginAction, createDisablePluginDropDown, createEnablePluginDropDown, createPolicyBlockedEnableAction, createUninstallPluginAction, isPluginPolicyBlocked } from "./module-2658.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Cache2 } from "./module-0027.mjs";
import { URI } from "./module-0032.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { EnablementStatusWidget, pluginEnablementLabels } from "./module-2747.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IPluginMarketplaceService, hasSourceChanged } from "./module-1028.mjs";
import { INotificationService } from "./module-0336.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { IRequestService, asText } from "./module-0946.mjs";
import { insert } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from "./module-2746.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWebviewService } from "./module-1042.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IFileService } from "./module-0269.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { Action } from "./module-0082.mjs";


// src/vs/workbench/contrib/chat/browser/agentPluginEditor/agentPluginEditor.ts
var AgentPluginEditor = class extends EditorPane {
  constructor(group2, telemetryService, instantiationService, themeService, openerService, storageService, extensionService, webviewService, languageService, fileService, requestService, agentPluginService, pluginInstallService, pluginMarketplaceService, labelService, contextMenuService) {
    super(AgentPluginEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.extensionService = extensionService;
    this.webviewService = webviewService;
    this.languageService = languageService;
    this.fileService = fileService;
    this.requestService = requestService;
    this.agentPluginService = agentPluginService;
    this.pluginInstallService = pluginInstallService;
    this.pluginMarketplaceService = pluginMarketplaceService;
    this.labelService = labelService;
    this.contextMenuService = contextMenuService;
    this.pluginReadme = null;
    this.initialScrollProgress = /* @__PURE__ */ new Map();
    this.currentIdentifier = "";
    this.layoutParticipants = [];
    this.contentDisposables = this._register(new DisposableStore());
    this.transientDisposables = this._register(new DisposableStore());
    this.activeElement = null;
  }
  static {
    this.ID = "workbench.editor.agentPlugin";
  }
  createEditor(parent) {
    const root = append(parent, $(".extension-editor.agent-plugin-editor"));
    root.tabIndex = 0;
    root.style.outline = "none";
    root.setAttribute("role", "document");
    const header2 = append(root, $(".header"));
    const iconContainer = append(header2, $(".icon-container"));
    const icon2 = append(iconContainer, $("span.codicon.codicon-extensions"));
    icon2.style.fontSize = "64px";
    const details = append(header2, $(".details"));
    const title = append(details, $(".title"));
    const name = append(title, $("span.name", { role: "heading", tabIndex: 0 }));
    const description = append(details, $(".description"));
    const subtitle = append(details, $(".subtitle"));
    const marketplace = append(subtitle, $("span.subtitle-entry"));
    const actionsAndStatusContainer = append(details, $(".actions-status-container"));
    const actionBar3 = this._register(new ActionBar(actionsAndStatusContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof EnablementDropDownAction) {
          return new EnablementDropdownActionViewItem(
            action,
            {
              ...options3,
              icon: true,
              label: true,
              menuActionsOrProvider: { getActions: () => action.menuActions },
              menuActionClassNames: action.menuActionClassNames
            },
            this.contextMenuService
          );
        }
        return void 0;
      },
      focusOnlyEnabledItems: true
    }));
    actionBar3.setFocusable(true);
    const statusContainer3 = append(actionsAndStatusContainer, $(".status"));
    const body = append(root, $(".body"));
    const content2 = append(body, $(".content"));
    content2.id = generateUuid();
    this.template = {
      content: content2,
      description,
      header: header2,
      name,
      marketplace,
      actionBar: actionBar3,
      statusContainer: statusContainer3
    };
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (this.template) {
      await this.render(input.item, this.template);
    }
  }
  async render(item, template2) {
    this.activeElement = null;
    this.transientDisposables.clear();
    this.contentDisposables.clear();
    template2.content.innerText = "";
    const cts = new CancellationTokenSource();
    this.transientDisposables.add(toDisposable(() => cts.dispose(true)));
    const token = cts.token;
    const itemId = item.kind === "installed" /* Installed */ ? item.plugin.uri.toString() : `${item.marketplaceReference.canonicalId}/${item.source}`;
    if (this.currentIdentifier !== itemId) {
      this.initialScrollProgress.clear();
      this.currentIdentifier = itemId;
    }
    this.pluginReadme = new Cache2(() => this.fetchReadme(item, token));
    template2.name.textContent = item.name;
    template2.description.textContent = item.description;
    const marketplaceLabel = item.marketplace ?? "";
    const githubRepo = item.kind === "marketplace" /* Marketplace */ ? item.marketplaceReference.githubRepo : item.plugin.fromMarketplace?.marketplaceReference.githubRepo;
    if (marketplaceLabel && githubRepo) {
      const url = `https://github.com/${githubRepo}`;
      const link2 = $("a.marketplace-link", { href: url }, marketplaceLabel);
      this.transientDisposables.add(addDisposableListener(link2, EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openerService.open(URI.parse(url));
      }));
      reset(template2.marketplace, link2);
    } else {
      reset(template2.marketplace, marketplaceLabel);
    }
    const currentItem = derived((reader) => {
      const allPlugins = this.agentPluginService.plugins.read(reader);
      let currentItem2 = item;
      if (item.kind === "marketplace" /* Marketplace */) {
        const expectedUri = this.pluginInstallService.getPluginInstallUri({
          name: item.name,
          description: item.description,
          version: item.version ?? "",
          source: item.source,
          sourceDescriptor: item.sourceDescriptor,
          marketplace: item.marketplace,
          marketplaceReference: item.marketplaceReference,
          marketplaceType: item.marketplaceType
        });
        const installedPlugin = allPlugins.find((p) => p.uri.toString() === expectedUri.toString());
        if (installedPlugin) {
          currentItem2 = this.installedPluginToItem(installedPlugin);
        }
      } else {
        const stillInstalled = allPlugins.find((p) => p.uri.toString() === item.plugin.uri.toString());
        if (!stillInstalled) {
          if (item.plugin.fromMarketplace) {
            const mp = item.plugin.fromMarketplace;
            currentItem2 = {
              kind: "marketplace" /* Marketplace */,
              name: item.name,
              description: mp.description,
              version: mp.version,
              source: mp.source,
              sourceDescriptor: mp.sourceDescriptor,
              marketplace: mp.marketplace,
              marketplaceReference: mp.marketplaceReference,
              marketplaceType: mp.marketplaceType,
              readmeUri: mp.readmeUri
            };
          } else {
            return;
          }
        } else {
          stillInstalled.enablement.read(reader);
          currentItem2 = this.installedPluginToItem(stillInstalled);
        }
      }
      return currentItem2;
    });
    const storedPlugin = currentItem.map((item2, r2) => {
      if (!item2 || item2.kind === "marketplace" /* Marketplace */) {
        return void 0;
      }
      return this.pluginMarketplaceService.installedPlugins.read(r2).find((e) => e.pluginUri.toString() === item2.plugin.uri.toString())?.plugin ?? item2.plugin.fromMarketplace;
    });
    const actionDisposables = this.transientDisposables.add(new DisposableStore());
    this.transientDisposables.add(autorun((reader) => {
      actionDisposables.clear();
      template2.actionBar.clear();
      const current = currentItem.read(reader);
      if (!current) {
        return;
      }
      this.pluginMarketplaceService.lastFetchedPlugins.read(reader);
      const actions = this.getItemActions(current, storedPlugin.read(reader));
      if (actions.length > 0) {
        template2.actionBar.push(actions, { icon: true, label: true });
      }
      for (const action of actions) {
        actionDisposables.add(action);
      }
      if (current.kind === "installed" /* Installed */) {
        actionDisposables.add(this.instantiationService.createInstance(
          EnablementStatusWidget,
          template2.statusContainer,
          current.plugin.enablement,
          pluginEnablementLabels
        ));
      }
    }));
    this.activeElement = await this.openDetails(item, template2, token);
  }
  getItemActions(item, storedPlugin) {
    if (item.kind === "marketplace" /* Marketplace */) {
      return [this.instantiationService.createInstance(InstallPluginAction, item)];
    }
    const workspaceService = this.instantiationService.invokeFunction((a) => a.get(IWorkspaceContextService));
    const actions = [];
    if (storedPlugin) {
      const cachedMarketplace = this.pluginMarketplaceService.lastFetchedPlugins.get();
      const key3 = `${storedPlugin.marketplaceReference.canonicalId}::${storedPlugin.name}`;
      const livePlugin = cachedMarketplace.find(
        (mp) => `${mp.marketplaceReference.canonicalId}::${mp.name}` === key3
      );
      if (livePlugin && hasSourceChanged(storedPlugin.sourceDescriptor, livePlugin.sourceDescriptor)) {
        actions.push(this.instantiationService.createInstance(UpdatePluginEditorAction, item.plugin, livePlugin));
      }
    }
    if (isPluginPolicyBlocked(item.plugin)) {
      const notificationService = this.instantiationService.invokeFunction((a) => a.get(INotificationService));
      actions.push(createPolicyBlockedEnableAction(item.plugin, notificationService));
    } else {
      actions.push(createEnablePluginDropDown(item.plugin, this.agentPluginService.enablementModel, workspaceService));
      actions.push(createDisablePluginDropDown(item.plugin, this.agentPluginService.enablementModel, workspaceService));
    }
    const uninstallAction = createUninstallPluginAction(item.plugin);
    if (uninstallAction) {
      actions.push(uninstallAction);
    }
    return actions;
  }
  installedPluginToItem(plugin) {
    const name = plugin.label;
    const description = plugin.fromMarketplace?.description ?? this.labelService.getUriLabel(dirname2(plugin.uri), { relative: true });
    const marketplace = plugin.fromMarketplace?.marketplace;
    return { kind: "installed" /* Installed */, name, description, marketplace, plugin };
  }
  async fetchReadme(item, token) {
    let readmeUri;
    if (item.kind === "installed" /* Installed */) {
      readmeUri = joinPath(item.plugin.uri, "README.md");
    } else {
      readmeUri = item.readmeUri;
    }
    if (!readmeUri) {
      return "";
    }
    if (readmeUri.scheme === Schemas.file || readmeUri.scheme === Schemas.vscodeRemote) {
      try {
        const content2 = await this.fileService.readFile(readmeUri);
        return content2.value.toString();
      } catch {
        return "";
      }
    }
    if (readmeUri.scheme === Schemas.https) {
      let rawUrl = readmeUri.toString();
      const githubBlobMatch = rawUrl.match(/^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/blob\/(?<rest>.+)$/);
      if (githubBlobMatch?.groups) {
        rawUrl = `https://raw.githubusercontent.com/${githubBlobMatch.groups["owner"]}/${githubBlobMatch.groups["repo"]}/${githubBlobMatch.groups["rest"]}`;
      }
      try {
        const context2 = await this.requestService.request({ type: "GET", url: rawUrl, callSite: "agentPluginEditor.fetchReadme" }, token);
        const text2 = await asText(context2);
        return text2 ?? "";
      } catch {
        return "";
      }
    }
    return "";
  }
  async openDetails(item, template2, token) {
    const details = append(template2.content, $(".details"));
    const readmeContainer = append(details, $(".content-container"));
    const layout2 = () => details.classList.toggle("narrow", this.dimension !== void 0 && this.dimension.width < 500);
    layout2();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    return this.openMarkdown(this.pluginReadme.get(), localize(8897, null), readmeContainer, 0 /* Readme */, localize(8898, null), token);
  }
  async openMarkdown(cacheResult, noContentCopy, container3, webviewIndex, title, token) {
    try {
      const body = await this.renderMarkdown(cacheResult, container3, token);
      if (token.isCancellationRequested) {
        return null;
      }
      const webview = this.contentDisposables.add(this.webviewService.createWebviewOverlay({
        title,
        options: {
          enableFindWidget: true,
          tryRestoreScrollPosition: true,
          disableServiceWorker: true
        },
        contentOptions: {},
        extension: void 0
      }));
      webview.initialScrollProgress = this.initialScrollProgress.get(webviewIndex) || 0;
      webview.claim(this, this.window, void 0);
      setParentFlowTo(webview.container, container3);
      webview.setAnchorElement(container3);
      webview.setHtml(body);
      webview.claim(this, this.window, void 0);
      this.contentDisposables.add(webview.onDidFocus(() => this._onDidFocus?.fire()));
      this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
      const removeLayoutParticipant = insert(this.layoutParticipants, {
        layout: () => {
          webview.setAnchorElement(container3);
        }
      });
      this.contentDisposables.add(toDisposable(removeLayoutParticipant));
      let isDisposed = false;
      this.contentDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
        const body2 = await this.renderMarkdown(cacheResult, container3);
        if (!isDisposed) {
          webview.setHtml(body2);
        }
      }));
      this.contentDisposables.add(webview.onDidClickLink((link2) => {
        if (!link2) {
          return;
        }
        if (matchesScheme(link2, Schemas.http) || matchesScheme(link2, Schemas.https) || matchesScheme(link2, Schemas.mailto)) {
          this.openerService.open(link2);
        }
      }));
      return webview;
    } catch (e) {
      const p = append(container3, $("p.nocontent"));
      p.textContent = noContentCopy;
      return p;
    }
  }
  async renderMarkdown(cacheResult, container3, token) {
    const contents = await this.loadContents(() => cacheResult, container3);
    if (token?.isCancellationRequested) {
      return "";
    }
    const content2 = await renderMarkdownDocument(contents, this.extensionService, this.languageService, {}, token);
    if (token?.isCancellationRequested) {
      return "";
    }
    return this.renderBody(content2);
  }
  renderBody(body) {
    const nonce = generateUuid();
    const colorMap = TokenizationRegistry2.getColorMap();
    const css = colorMap ? generateTokensCSSForColorMap(colorMap) : "";
    return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${DEFAULT_MARKDOWN_STYLES}

					body {
						padding-bottom: 75px;
					}

					#scroll-to-top {
						position: fixed;
						width: 32px;
						height: 32px;
						right: 25px;
						bottom: 25px;
						background-color: var(--vscode-button-secondaryBackground);
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
						background-color: var(--vscode-button-secondaryHoverBackground);
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
						background: var(--vscode-button-secondaryForeground);
						-webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						width: 16px;
						height: 16px;
					}
					${css}
				</style>
			</head>
			<body>
				<a id="scroll-to-top" role="button" aria-label="scroll to top" href="#"><span class="icon"></span></a>
				${body}
			</body>
		</html>`;
  }
  loadContents(loadingTask, container3) {
    container3.classList.add("loading");
    const result = this.contentDisposables.add(loadingTask());
    const onDone = () => container3.classList.remove("loading");
    result.promise.then(onDone, onDone);
    return result.promise;
  }
  clearInput() {
    this.contentDisposables.clear();
    this.transientDisposables.clear();
    super.clearInput();
  }
  focus() {
    super.focus();
    this.activeElement?.focus();
  }
  get activeWebview() {
    if (!this.activeElement || !this.activeElement.runFindAction) {
      return void 0;
    }
    return this.activeElement;
  }
  layout(dimension) {
    this.dimension = dimension;
    this.layoutParticipants.forEach((p) => p.layout());
  }
};

AgentPluginEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IWebviewService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IFileService),
  __decorateParam(10, IRequestService),
  __decorateParam(11, IAgentPluginService),
  __decorateParam(12, IPluginInstallService),
  __decorateParam(13, IPluginMarketplaceService),
  __decorateParam(14, ILabelService),
  __decorateParam(15, IContextMenuService)
], AgentPluginEditor);

var UpdatePluginEditorAction = class extends Action {
  constructor(plugin, liveMarketplacePlugin, pluginInstallService, pluginMarketplaceService) {
    super(UpdatePluginEditorAction.ID, localize(8899, null), "extension-action label prominent install");
    this.plugin = plugin;
    this.liveMarketplacePlugin = liveMarketplacePlugin;
    this.pluginInstallService = pluginInstallService;
    this.pluginMarketplaceService = pluginMarketplaceService;
  }
  static {
    this.ID = "agentPlugin.editor.update";
  }
  async run() {
    if (await this.pluginInstallService.updatePlugin(this.liveMarketplacePlugin)) {
      this.pluginMarketplaceService.addInstalledPlugin(this.plugin.uri, this.liveMarketplacePlugin);
    }
  }
};

UpdatePluginEditorAction = __decorateClass([
  __decorateParam(2, IPluginInstallService),
  __decorateParam(3, IPluginMarketplaceService)
], UpdatePluginEditorAction);
export { AgentPluginEditor, UpdatePluginEditorAction };
