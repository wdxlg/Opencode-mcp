// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpServerEditor.ts
import { Disposable, DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, append, clearNode, setParentFlowTo } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { EditorPane } from "./module-1090.mjs";
import { LicenseWidget, McpServerIconWidget, McpServerScopeBadgeWidget, McpServerStatusWidget, McpServerWidget, PublisherWidget2, StarredWidget, onClick3 } from "./module-2880.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { ButtonWithDropDownExtensionAction2, ButtonWithDropdownExtensionActionViewItem2, DisableMcpDropDownAction, DropDownAction, EnableMcpDropDownAction, InstallAction2, InstallInRemoteAction, InstallInWorkspaceAction, InstallingLabelAction2, ManageMcpServerAction, McpServerStatusAction, UninstallAction2 } from "./module-2628.mjs";
import { IMcpWorkbenchService, McpServerContainers } from "./module-1206.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Cache2 } from "./module-0027.mjs";
import { URI } from "./module-0032.mjs";
import { insert } from "./module-0007.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from "./module-2721.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IWebviewService } from "./module-1043.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { IMcpGalleryManifestService, getMcpGalleryManifestResourceUri } from "./module-1195.mjs";
import { fromNow } from "./module-0120.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpServerEditor.ts
var NavBar = class extends Disposable {
  constructor(container2) {
    super();
    this._onChange = this._register(new Emitter());
    this._currentId = null;
    const element = append(container2, $(".navbar"));
    this.actions = [];
    this.actionbar = this._register(new ActionBar(element));
  }
  get onChange() {
    return this._onChange.event;
  }
  get currentId() {
    return this._currentId;
  }
  push(id2, label3, tooltip, index2) {
    const action = new Action(id2, label3, void 0, true, () => this.update(id2, true));
    action.tooltip = tooltip;
    if (typeof index2 === "number") {
      this.actions.splice(index2, 0, action);
    } else {
      this.actions.push(action);
    }
    this.actionbar.push(action, { index: index2 });
    if (this.actions.length === 1) {
      this.update(id2);
    }
  }
  remove(id2) {
    const index2 = this.actions.findIndex((action) => action.id === id2);
    if (index2 !== -1) {
      this.actions.splice(index2, 1);
      this.actionbar.pull(index2);
      if (this._currentId === id2) {
        this.switch(this.actions[0]?.id);
      }
    }
  }
  clear() {
    this.actions = dispose(this.actions);
    this.actionbar.clear();
  }
  switch(id2) {
    const action = this.actions.find((action2) => action2.id === id2);
    if (action) {
      action.run();
      return true;
    }
    return false;
  }
  has(id2) {
    return this.actions.some((action) => action.id === id2);
  }
  update(id2, focus) {
    this._currentId = id2;
    this._onChange.fire({ id: id2, focus: !!focus });
    this.actions.forEach((a) => a.checked = a.id === id2);
  }
};

var McpServerEditor = class extends EditorPane {
  constructor(group2, telemetryService, instantiationService, themeService, notificationService, openerService, storageService, extensionService, webviewService, languageService, contextKeyService, mcpWorkbenchService, hoverService, contextMenuService) {
    super(McpServerEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.extensionService = extensionService;
    this.webviewService = webviewService;
    this.languageService = languageService;
    this.contextKeyService = contextKeyService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.hoverService = hoverService;
    this.contextMenuService = contextMenuService;
    this._scopedContextKeyService = this._register(new MutableDisposable());
    // Some action bar items use a webview whose vertical scroll position we track in this map
    this.initialScrollProgress = /* @__PURE__ */ new Map();
    // Spot when an ExtensionEditor instance gets reused for a different extension, in which case the vertical scroll positions must be zeroed
    this.currentIdentifier = "";
    this.layoutParticipants = [];
    this.contentDisposables = this._register(new DisposableStore());
    this.transientDisposables = this._register(new DisposableStore());
    this.activeElement = null;
    this.mcpServerReadme = null;
    this.mcpServerManifest = null;
  }
  static {
    this.ID = "workbench.editor.mcpServer";
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService.value;
  }
  createEditor(parent) {
    const root = append(parent, $(".extension-editor.mcp-server-editor"));
    this._scopedContextKeyService.value = this.contextKeyService.createScoped(root);
    this._scopedContextKeyService.value.createKey("inExtensionEditor", true);
    root.tabIndex = 0;
    root.style.outline = "none";
    root.setAttribute("role", "document");
    const header2 = append(root, $(".header"));
    const iconContainer = append(header2, $(".icon-container"));
    const iconWidget = this.instantiationService.createInstance(McpServerIconWidget, iconContainer);
    const scopeWidget = this.instantiationService.createInstance(McpServerScopeBadgeWidget, iconContainer);
    const details = append(header2, $(".details"));
    const title = append(details, $(".title"));
    const name = append(title, $("span.name.clickable", { role: "heading", tabIndex: 0 }));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), name, localize(17048, null)));
    const subtitle = append(details, $(".subtitle"));
    const subTitleEntryContainers = [];
    const publisherContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(publisherContainer);
    const publisherWidget = this.instantiationService.createInstance(PublisherWidget2, publisherContainer, false);
    const starredContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(starredContainer);
    const installCountWidget = this.instantiationService.createInstance(StarredWidget, starredContainer, false);
    const licenseContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(licenseContainer);
    const licenseWidget = this.instantiationService.createInstance(LicenseWidget, licenseContainer);
    const widgets2 = [
      iconWidget,
      publisherWidget,
      installCountWidget,
      scopeWidget,
      licenseWidget
    ];
    const description = append(details, $(".description"));
    const actions = [
      this.instantiationService.createInstance(InstallAction2, false),
      this.instantiationService.createInstance(InstallingLabelAction2),
      this.instantiationService.createInstance(ButtonWithDropDownExtensionAction2, "extensions.uninstall", UninstallAction2.CLASS, [
        [
          this.instantiationService.createInstance(UninstallAction2),
          this.instantiationService.createInstance(InstallInWorkspaceAction, false),
          this.instantiationService.createInstance(InstallInRemoteAction, false)
        ]
      ]),
      this.instantiationService.createInstance(EnableMcpDropDownAction),
      this.instantiationService.createInstance(DisableMcpDropDownAction),
      this.instantiationService.createInstance(ManageMcpServerAction, true)
    ];
    const actionsAndStatusContainer = append(details, $(".actions-status-container.mcp-server-actions"));
    const actionBar3 = this._register(new ActionBar(actionsAndStatusContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof DropDownAction) {
          return action.createActionViewItem(options3);
        }
        if (action instanceof ButtonWithDropDownExtensionAction2) {
          return new ButtonWithDropdownExtensionActionViewItem2(
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
    actionBar3.push(actions, { icon: true, label: true });
    actionBar3.setFocusable(true);
    this._register(Event2.any(...actions.map((a) => Event2.filter(a.onDidChange, (e4) => e4.enabled !== void 0)))(() => {
      actionBar3.setFocusable(false);
      actionBar3.setFocusable(true);
    }));
    const otherContainers = [];
    const mcpServerStatusAction = this.instantiationService.createInstance(McpServerStatusAction);
    const mcpServerStatusWidget = this._register(this.instantiationService.createInstance(McpServerStatusWidget, append(actionsAndStatusContainer, $(".status")), mcpServerStatusAction));
    this._register(Event2.any(mcpServerStatusWidget.onDidRender)(() => {
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }));
    otherContainers.push(mcpServerStatusAction, new class extends McpServerWidget {
      render() {
        actionsAndStatusContainer.classList.toggle("list-layout", this.mcpServer?.installState === 1 /* Installed */);
      }
    }());
    const mcpServerContainers = this.instantiationService.createInstance(McpServerContainers, [...actions, ...widgets2, ...otherContainers]);
    for (const disposable of [...actions, ...widgets2, ...otherContainers, mcpServerContainers]) {
      this._register(disposable);
    }
    const onError = Event2.chain(
      actionBar3.onDidRun,
      ($129) => $129.map(({ error }) => error).filter((error) => !!error)
    );
    this._register(onError(this.onError, this));
    const body = append(root, $(".body"));
    const navbar = new NavBar(body);
    const content = append(body, $(".content"));
    content.id = generateUuid();
    this.template = {
      content,
      description,
      header: header2,
      name,
      navbar,
      actionsAndStatusContainer,
      actionBar: actionBar3,
      set mcpServer(mcpServer) {
        mcpServerContainers.mcpServer = mcpServer;
        let lastNonEmptySubtitleEntryContainer;
        for (const subTitleEntryElement of subTitleEntryContainers) {
          subTitleEntryElement.classList.remove("last-non-empty");
          if (subTitleEntryElement.children.length > 0) {
            lastNonEmptySubtitleEntryContainer = subTitleEntryElement;
          }
        }
        if (lastNonEmptySubtitleEntryContainer) {
          lastNonEmptySubtitleEntryContainer.classList.add("last-non-empty");
        }
      }
    };
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (this.template) {
      await this.render(input.mcpServer, this.template, !!options3?.preserveFocus);
    }
  }
  async render(mcpServer, template2, preserveFocus) {
    this.activeElement = null;
    this.transientDisposables.clear();
    const token = this.transientDisposables.add(new CancellationTokenSource()).token;
    this.mcpServerReadme = new Cache2(() => mcpServer.getReadme(token));
    this.mcpServerManifest = new Cache2(() => mcpServer.getManifest(token));
    template2.mcpServer = mcpServer;
    template2.name.textContent = mcpServer.label;
    template2.name.classList.toggle("clickable", !!mcpServer.gallery?.webUrl);
    template2.description.textContent = mcpServer.description;
    if (mcpServer.gallery?.webUrl) {
      this.transientDisposables.add(onClick3(template2.name, () => this.openerService.open(URI.parse(mcpServer.gallery?.webUrl))));
    }
    this.renderNavbar(mcpServer, template2, preserveFocus);
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (options3?.tab) {
      this.template?.navbar.switch(options3.tab);
    }
  }
  renderNavbar(extension, template2, preserveFocus) {
    template2.content.innerText = "";
    template2.navbar.clear();
    if (this.currentIdentifier !== extension.id) {
      this.initialScrollProgress.clear();
      this.currentIdentifier = extension.id;
    }
    if (extension.readmeUrl || extension.gallery?.readme) {
      template2.navbar.push("readme" /* Readme */, localize(17036, null), localize(17037, null));
    }
    if (extension.gallery || extension.local?.manifest) {
      template2.navbar.push("manifest" /* Manifest */, localize(17045, null), localize(17046, null));
    }
    if (extension.config) {
      template2.navbar.push("configuration" /* Configuration */, localize(17034, null), localize(17035, null));
    }
    this.transientDisposables.add(this.mcpWorkbenchService.onChange((e4) => {
      if (e4 === extension) {
        if (e4.config && !template2.navbar.has("configuration" /* Configuration */)) {
          template2.navbar.push("configuration" /* Configuration */, localize(17034, null), localize(17035, null), extension.readmeUrl ? 1 : 0);
        }
        if (!e4.config && template2.navbar.has("configuration" /* Configuration */)) {
          template2.navbar.remove("configuration" /* Configuration */);
        }
      }
    }));
    if (this.options?.tab) {
      template2.navbar.switch(this.options.tab);
    }
    if (template2.navbar.currentId) {
      this.onNavbarChange(extension, { id: template2.navbar.currentId, focus: !preserveFocus }, template2);
    }
    template2.navbar.onChange((e4) => this.onNavbarChange(extension, e4, template2), this, this.transientDisposables);
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
  showFind() {
    this.activeWebview?.showFind();
  }
  runFindAction(previous) {
    this.activeWebview?.runFindAction(previous);
  }
  get activeWebview() {
    if (!this.activeElement || !this.activeElement.runFindAction) {
      return void 0;
    }
    return this.activeElement;
  }
  onNavbarChange(extension, { id: id2, focus }, template2) {
    this.contentDisposables.clear();
    template2.content.innerText = "";
    this.activeElement = null;
    if (id2) {
      const cts = new CancellationTokenSource();
      this.contentDisposables.add(toDisposable(() => cts.dispose(true)));
      this.open(id2, extension, template2, cts.token).then((activeElement) => {
        if (cts.token.isCancellationRequested) {
          return;
        }
        this.activeElement = activeElement;
        if (focus) {
          this.focus();
        }
      });
    }
  }
  open(id2, extension, template2, token) {
    switch (id2) {
      case "configuration" /* Configuration */:
        return this.openConfiguration(extension, template2, token);
      case "readme" /* Readme */:
        return this.openDetails(extension, template2, token);
      case "manifest" /* Manifest */:
        return extension.readmeUrl ? this.openManifest(extension, template2.content, token) : this.openManifestWithAdditionalDetails(extension, template2, token);
    }
    return Promise.resolve(null);
  }
  async openMarkdown(extension, cacheResult, noContentCopy, container2, webviewIndex, title, token) {
    try {
      const body = await this.renderMarkdown(extension, cacheResult, container2, token);
      if (token.isCancellationRequested) {
        return Promise.resolve(null);
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
      webview.claim(this, this.window, this.scopedContextKeyService);
      setParentFlowTo(webview.container, container2);
      webview.setAnchorElement(container2);
      webview.setHtml(body);
      webview.claim(this, this.window, void 0);
      this.contentDisposables.add(webview.onDidFocus(() => this._onDidFocus?.fire()));
      this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
      const removeLayoutParticipant = insert(this.layoutParticipants, {
        layout: () => {
          webview.setAnchorElement(container2);
        }
      });
      this.contentDisposables.add(toDisposable(removeLayoutParticipant));
      let isDisposed = false;
      this.contentDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
        const body2 = await this.renderMarkdown(extension, cacheResult, container2);
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
    } catch (e4) {
      const p = append(container2, $("p.nocontent"));
      p.textContent = noContentCopy;
      return p;
    }
  }
  async renderMarkdown(extension, cacheResult, container2, token) {
    const contents = await this.loadContents(() => cacheResult, container2);
    if (token?.isCancellationRequested) {
      return "";
    }
    const content = await renderMarkdownDocument(contents, this.extensionService, this.languageService, {}, token);
    if (token?.isCancellationRequested) {
      return "";
    }
    return this.renderBody(content);
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

					/* prevent scroll-to-top button from blocking the body text */
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
						/* Chevron up icon */
						webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
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
  async openDetails(extension, template2, token) {
    const details = append(template2.content, $(".details"));
    const readmeContainer = append(details, $(".content-container"));
    const additionalDetailsContainer = append(details, $(".additional-details-container"));
    const layout2 = () => details.classList.toggle("narrow", this.dimension && this.dimension.width < 500);
    layout2();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    const activeElement = await this.openMarkdown(extension, this.mcpServerReadme.get(), localize(17051, null), readmeContainer, 0 /* Readme */, localize(17056, null), token);
    this.renderAdditionalDetails(additionalDetailsContainer, extension);
    return activeElement;
  }
  async openConfiguration(mcpServer, template2, token) {
    const configContainer = append(template2.content, $(".configuration"));
    const content = $("div", { class: "configuration-content" });
    this.renderConfigurationDetails(content, mcpServer);
    const scrollableContent = new DomScrollableElement(content, {});
    const layout2 = () => scrollableContent.scanDomNode();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    append(configContainer, scrollableContent.getDomNode());
    return { focus: () => content.focus() };
  }
  async openManifestWithAdditionalDetails(mcpServer, template2, token) {
    const details = append(template2.content, $(".details"));
    const readmeContainer = append(details, $(".content-container"));
    const additionalDetailsContainer = append(details, $(".additional-details-container"));
    const layout2 = () => details.classList.toggle("narrow", this.dimension && this.dimension.width < 500);
    layout2();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    const activeElement = await this.openManifest(mcpServer, readmeContainer, token);
    this.renderAdditionalDetails(additionalDetailsContainer, mcpServer);
    return activeElement;
  }
  async openManifest(mcpServer, parent, token) {
    const manifestContainer = append(parent, $(".manifest"));
    const content = $("div", { class: "manifest-content" });
    try {
      const manifest = await this.loadContents(() => this.mcpServerManifest.get(), content);
      if (token.isCancellationRequested) {
        return null;
      }
      this.renderManifestDetails(content, manifest);
    } catch (error) {
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
      const noManifestMessage = append(content, $(".no-manifest"));
      noManifestMessage.textContent = localize(17050, null);
    }
    const scrollableContent = new DomScrollableElement(content, {});
    const layout2 = () => scrollableContent.scanDomNode();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    append(manifestContainer, scrollableContent.getDomNode());
    return { focus: () => content.focus() };
  }
  renderConfigurationDetails(container2, mcpServer) {
    clearNode(container2);
    const config = mcpServer.config;
    if (!config) {
      const noConfigMessage = append(container2, $(".no-config"));
      noConfigMessage.textContent = localize(17049, null);
      return;
    }
    const nameSection = append(container2, $(".config-section"));
    const nameLabel = append(nameSection, $(".config-label"));
    nameLabel.textContent = localize(17061, null);
    const nameValue = append(nameSection, $(".config-value"));
    nameValue.textContent = mcpServer.name;
    const typeSection = append(container2, $(".config-section"));
    const typeLabel = append(typeSection, $(".config-label"));
    typeLabel.textContent = localize(17062, null);
    const typeValue = append(typeSection, $(".config-value"));
    typeValue.textContent = config.type;
    if (config.type === "stdio" /* LOCAL */) {
      const commandSection = append(container2, $(".config-section"));
      const commandLabel = append(commandSection, $(".config-label"));
      commandLabel.textContent = localize(17033, null);
      const commandValue = append(commandSection, $("code.config-value"));
      commandValue.textContent = config.command;
      if (config.args && config.args.length > 0) {
        const argsSection = append(container2, $(".config-section"));
        const argsLabel = append(argsSection, $(".config-label"));
        argsLabel.textContent = localize(17032, null);
        const argsValue = append(argsSection, $("code.config-value"));
        argsValue.textContent = config.args.join(" ");
      }
      if (config.env && Object.keys(config.env).length > 0) {
        const envSection = append(container2, $(".config-section"));
        const envLabel = append(envSection, $(".config-label"));
        envLabel.textContent = localize(17039, null);
        const envValue = append(envSection, $(".config-value"));
        for (const [key3, value2] of Object.entries(config.env)) {
          append(envValue, $("code.env-entry", void 0, `${key3}=${value2 ?? ""}`));
        }
      }
      if (config.envFile) {
        const envFileSection = append(container2, $(".config-section"));
        const envFileLabel = append(envFileSection, $(".config-label"));
        envFileLabel.textContent = localize(17038, null);
        const envFileValue = append(envFileSection, $("code.config-value"));
        envFileValue.textContent = config.envFile;
      }
    } else if (config.type === "http" /* REMOTE */) {
      const urlSection = append(container2, $(".config-section"));
      const urlLabel = append(urlSection, $(".config-label"));
      urlLabel.textContent = localize(17066, null);
      const urlValue = append(urlSection, $("code.config-value"));
      urlValue.textContent = config.url;
      if (config.headers && Object.keys(config.headers).length > 0) {
        const headersSection = append(container2, $(".config-section"));
        const headersLabel = append(headersSection, $(".config-label"));
        headersLabel.textContent = localize(17041, null);
        const headersValue = append(headersSection, $(".config-value"));
        for (const [key3, value2] of Object.entries(config.headers)) {
          append(headersValue, $("code.env-entry", void 0, `${key3}: ${value2 ?? ""}`));
        }
      }
    }
  }
  renderManifestDetails(container2, manifest) {
    clearNode(container2);
    if (manifest.packages && manifest.packages.length > 0) {
      const packagesByType = /* @__PURE__ */ new Map();
      for (const pkg of manifest.packages) {
        const type = pkg.registryType;
        let packages = packagesByType.get(type);
        if (!packages) {
          packagesByType.set(type, packages = []);
        }
        packages.push(pkg);
      }
      append(container2, $(".manifest-section", void 0, $(".manifest-section-title", void 0, localize(17054, null))));
      for (const [packageType, packages] of packagesByType) {
        const packageSection = append(container2, $(".package-section", void 0, $(".package-section-title", void 0, packageType.toUpperCase())));
        const packagesGrid = append(packageSection, $(".package-details"));
        for (let i2 = 0; i2 < packages.length; i2++) {
          const pkg = packages[i2];
          append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17053, null)), $(".detail-value", void 0, pkg.identifier)));
          if (pkg.packageArguments && pkg.packageArguments.length > 0) {
            const argStrings = [];
            for (const arg of pkg.packageArguments) {
              if (arg.type === "named") {
                argStrings.push(arg.name);
                if (arg.value) {
                  argStrings.push(arg.value);
                }
              }
              if (arg.type === "positional") {
                const val = arg.value ?? arg.valueHint;
                if (val) {
                  argStrings.push(val);
                }
              }
            }
            append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17052, null)), $("code.detail-value", void 0, argStrings.join(" "))));
          }
          if (pkg.runtimeArguments && pkg.runtimeArguments.length > 0) {
            const argStrings = [];
            for (const arg of pkg.runtimeArguments) {
              if (arg.type === "named") {
                argStrings.push(arg.name);
                if (arg.value) {
                  argStrings.push(arg.value);
                }
              }
              if (arg.type === "positional") {
                const val = arg.value ?? arg.valueHint;
                if (val) {
                  argStrings.push(val);
                }
              }
            }
            append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17060, null)), $("code.detail-value", void 0, argStrings.join(" "))));
          }
          if (pkg.environmentVariables && pkg.environmentVariables.length > 0) {
            const envStrings = pkg.environmentVariables.map((envVar) => `${envVar.name}=${envVar.value ?? ""}`);
            append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17040, null)), $("code.detail-value", void 0, envStrings.join(" "))));
          }
          if (i2 < packages.length - 1) {
            append(packagesGrid, $(".package-separator"));
          }
        }
      }
    }
    if (manifest.remotes && manifest.remotes.length > 0) {
      const packageSection = append(container2, $(".package-section", void 0, $(".package-section-title", void 0, localize(17057, null).toLocaleUpperCase())));
      for (const remote of manifest.remotes) {
        const packagesGrid = append(packageSection, $(".package-details"));
        append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17066, null)), $(".detail-value", void 0, remote.url)));
        if (remote.type) {
          append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17065, null)), $(".detail-value", void 0, remote.type)));
        }
        if (remote.headers && remote.headers.length > 0) {
          const headerStrings = remote.headers.map((header2) => `${header2.name}: ${header2.value ?? ""}`);
          append(packagesGrid, $(".package-detail", void 0, $(".detail-label", void 0, localize(17041, null)), $(".detail-value", void 0, headerStrings.join(", "))));
        }
      }
    }
  }
  renderAdditionalDetails(container2, extension) {
    const content = $("div", { class: "additional-details-content", tabindex: "0" });
    const scrollableContent = new DomScrollableElement(content, {});
    const layout2 = () => scrollableContent.scanDomNode();
    const removeLayoutParticipant = insert(this.layoutParticipants, { layout: layout2 });
    this.contentDisposables.add(toDisposable(removeLayoutParticipant));
    this.contentDisposables.add(scrollableContent);
    this.contentDisposables.add(this.instantiationService.createInstance(AdditionalDetailsWidget, content, extension));
    append(container2, scrollableContent.getDomNode());
    scrollableContent.scanDomNode();
  }
  loadContents(loadingTask, container2) {
    container2.classList.add("loading");
    const result = this.contentDisposables.add(loadingTask());
    const onDone = () => container2.classList.remove("loading");
    result.promise.then(onDone, onDone);
    return result.promise;
  }
  layout(dimension) {
    this.dimension = dimension;
    this.layoutParticipants.forEach((p) => p.layout());
  }
  onError(err) {
    if (isCancellationError(err)) {
      return;
    }
    this.notificationService.error(err);
  }
};

McpServerEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IWebviewService),
  __decorateParam(9, ILanguageService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IMcpWorkbenchService),
  __decorateParam(12, IHoverService),
  __decorateParam(13, IContextMenuService)
], McpServerEditor);

var AdditionalDetailsWidget = class extends Disposable {
  constructor(container2, extension, mcpGalleryManifestService, hoverService, openerService) {
    super();
    this.container = container2;
    this.mcpGalleryManifestService = mcpGalleryManifestService;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.disposables = this._register(new DisposableStore());
    this.render(extension);
    this._register(this.mcpGalleryManifestService.onDidChangeMcpGalleryManifest(() => this.render(extension)));
  }
  render(extension) {
    this.container.innerText = "";
    this.disposables.clear();
    if (extension.local) {
      this.renderInstallInfo(this.container, extension.local);
    }
    if (extension.gallery) {
      this.renderMarketplaceInfo(this.container, extension);
    }
    this.renderTags(this.container, extension);
    this.renderExtensionResources(this.container, extension);
  }
  renderTags(container2, extension) {
    if (extension.gallery?.topics?.length) {
      const categoriesContainer = append(container2, $(".categories-container.additional-details-element"));
      append(categoriesContainer, $(".additional-details-title", void 0, localize(17064, null)));
      const categoriesElement = append(categoriesContainer, $(".categories"));
      for (const category9 of extension.gallery.topics) {
        append(categoriesElement, $("span.category", { tabindex: "0" }, category9));
      }
    }
  }
  async renderExtensionResources(container2, extension) {
    const resources = [];
    const manifest = await this.mcpGalleryManifestService.getMcpGalleryManifest();
    if (extension.repository) {
      try {
        resources.push([localize(17058, null), ThemeIcon.fromId(Codicon.repo.id), URI.parse(extension.repository)]);
      } catch (error) {
      }
    }
    if (manifest) {
      const supportUri = getMcpGalleryManifestResourceUri(manifest, "ContactSupportUri" /* ContactSupportUri */);
      if (supportUri) {
        try {
          resources.push([localize(17063, null), ThemeIcon.fromId(Codicon.commentDiscussion.id), URI.parse(supportUri)]);
        } catch (error) {
        }
      }
    }
    if (resources.length) {
      const extensionResourcesContainer = append(container2, $(".resources-container.additional-details-element"));
      append(extensionResourcesContainer, $(".additional-details-title", void 0, localize(17059, null)));
      const resourcesElement = append(extensionResourcesContainer, $(".resources"));
      for (const [label3, icon2, uri4] of resources) {
        const resourceElement = append(resourcesElement, $(".resource"));
        append(resourceElement, $(ThemeIcon.asCSSSelector(icon2)));
        append(resourceElement, $("a", { tabindex: "0" }, label3));
        this.disposables.add(onClick3(resourceElement, () => this.openerService.open(uri4)));
        this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), resourceElement, uri4.toString()));
      }
    }
  }
  renderInstallInfo(container2, extension) {
    const installInfoContainer = append(container2, $(".more-info-container.additional-details-element"));
    append(installInfoContainer, $(".additional-details-title", void 0, localize(17043, null)));
    const installInfo = append(installInfoContainer, $(".more-info"));
    append(
      installInfo,
      $(
        ".more-info-entry",
        void 0,
        $("div.more-info-entry-name", void 0, localize(17042, null)),
        $("code", void 0, extension.name)
      )
    );
    if (extension.version) {
      append(
        installInfo,
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", void 0, localize(17067, null)),
          $("code", void 0, extension.version)
        )
      );
    }
  }
  renderMarketplaceInfo(container2, extension) {
    const gallery = extension.gallery;
    const moreInfoContainer = append(container2, $(".more-info-container.additional-details-element"));
    append(moreInfoContainer, $(".additional-details-title", void 0, localize(17047, null)));
    const moreInfo = append(moreInfoContainer, $(".more-info"));
    if (gallery) {
      if (!extension.local) {
        append(
          moreInfo,
          $(
            ".more-info-entry",
            void 0,
            $("div.more-info-entry-name", void 0, localize(17042, null)),
            $("code", void 0, extension.name)
          )
        );
        if (gallery.version) {
          append(
            moreInfo,
            $(
              ".more-info-entry",
              void 0,
              $("div.more-info-entry-name", void 0, localize(17067, null)),
              $("code", void 0, gallery.version)
            )
          );
        }
      }
      if (gallery.lastUpdated) {
        append(
          moreInfo,
          $(
            ".more-info-entry",
            void 0,
            $("div.more-info-entry-name", void 0, localize(17044, null)),
            $("div", {
              "title": new Date(gallery.lastUpdated).toString()
            }, fromNow(gallery.lastUpdated, true, true, true))
          )
        );
      }
      if (gallery.publishDate) {
        append(
          moreInfo,
          $(
            ".more-info-entry",
            void 0,
            $("div.more-info-entry-name", void 0, localize(17055, null)),
            $("div", {
              "title": new Date(gallery.publishDate).toString()
            }, fromNow(gallery.publishDate, true, true, true))
          )
        );
      }
    }
  }
};

AdditionalDetailsWidget = __decorateClass([
  __decorateParam(2, IMcpGalleryManifestService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IOpenerService)
], AdditionalDetailsWidget);
export { NavBar, McpServerEditor, AdditionalDetailsWidget };
