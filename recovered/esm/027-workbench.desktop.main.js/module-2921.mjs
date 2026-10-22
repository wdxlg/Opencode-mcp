// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionEditor.ts
import { Disposable, DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, append, hide, setParentFlowTo, show } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ExtensionIconWidget, ExtensionKindIndicatorWidget, ExtensionRecommendationWidget, ExtensionStatusWidget, ExtensionWidget, InstallCountWidget, PublisherWidget, RatingsWidget, RemoteBadgeWidget, SponsorWidget, onClick2 } from "./module-2280.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { EditorPane } from "./module-1089.mjs";
import { ButtonWithDropDownExtensionAction, ButtonWithDropdownExtensionActionViewItem, ClearLanguageAction, DisableDropDownAction, DropDownExtensionAction, EnableDropDownAction, ExtensionEditorManageExtensionAction, ExtensionRuntimeStateAction, ExtensionStatusAction, ExtensionStatusLabelAction, InstallAnotherVersionAction, InstallDropdownAction, InstallingLabelAction, LocalInstallAction, MigrateDeprecatedExtensionAction, RemoteInstallAction, SetColorThemeAction, SetFileIconThemeAction, SetLanguageAction, SetProductIconThemeAction, ToggleAutoUpdateForExtensionAction, TogglePreReleaseExtensionAction, UninstallAction, UpdateAction, WebInstallAction } from "./module-1877.mjs";
import { CheckboxActionViewItem } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { ExtensionContainers, IExtensionsWorkbenchService } from "./module-1022.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isUndefined } from "./module-0010.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Cache2 } from "./module-0027.mjs";
import { URI } from "./module-0032.mjs";
import { insert, isFalsyOrEmpty } from "./module-0007.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { ShowCurrentReleaseNotesActionId } from "./module-2777.mjs";
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from "./module-2746.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { generateTokensCSSForColorMap } from "./module-0401.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { ExtensionFeaturesTab } from "./module-2920.mjs";
import { ExtensionData2, ExtensionsGridView, ExtensionsTree, getExtensions2 } from "./module-2283.mjs";
import { editorBackground } from "./module-0229.mjs";
import { Delegate3 } from "./module-2281.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionGalleryService, computeSize } from "./module-0872.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IExtensionRecommendationsService } from "./module-1702.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWebviewService, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED } from "./module-1042.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { fromNow } from "./module-0120.mjs";
import { isNative } from "./module-0014.mjs";
import { ByteSize, IFileService } from "./module-0269.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IExtensionGalleryManifestService } from "./module-0890.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { textLinkActiveForeground, textLinkForeground } from "./module-0227.mjs";
import { buttonForeground, buttonHoverBackground } from "./module-0233.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionEditor.ts
var NavBar = class extends Disposable {
  constructor(container3) {
    super();
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._currentId = null;
    const element = append(container3, $(".navbar"));
    this.actions = [];
    this.actionbar = this._register(new ActionBar(element));
  }
  get currentId() {
    return this._currentId;
  }
  push(id2, label3, tooltip) {
    const action = new Action(id2, label3, void 0, true, () => this.update(id2, true));
    action.tooltip = tooltip;
    this.actions.push(action);
    this.actionbar.push(action);
    if (this.actions.length === 1) {
      this.update(id2);
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
  update(id2, focus) {
    this._currentId = id2;
    this._onChange.fire({ id: id2, focus: !!focus });
    this.actions.forEach((a) => a.checked = a.id === id2);
  }
  dispose() {
    this.clear();
    super.dispose();
  }
};

var CONTEXT_SHOW_PRE_RELEASE_VERSION = new RawContextKey("showPreReleaseVersion", false);

var ExtensionWithDifferentGalleryVersionWidget = class extends ExtensionWidget {
  constructor() {
    super(...arguments);
    this._gallery = null;
  }
  get gallery() {
    return this._gallery;
  }
  set gallery(gallery) {
    if (this.extension && gallery && !areSameExtensions(this.extension.identifier, gallery.identifier)) {
      return;
    }
    this._gallery = gallery;
    this.update();
  }
};

var VersionWidget = class extends ExtensionWithDifferentGalleryVersionWidget {
  constructor(container3, hoverService) {
    super();
    this.element = append(container3, $("code.version", void 0, "pre-release"));
    this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, localize(15008, null)));
    this.render();
  }
  render() {
    if (this.extension?.preRelease) {
      show(this.element);
    } else {
      hide(this.element);
    }
  }
};

var ExtensionEditor = class extends EditorPane {
  constructor(group2, telemetryService, instantiationService, extensionsWorkbenchService, extensionGalleryService, themeService, notificationService, openerService, extensionRecommendationsService, storageService, extensionService, webviewService, languageService, contextMenuService, contextKeyService, hoverService) {
    super(ExtensionEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionGalleryService = extensionGalleryService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.extensionService = extensionService;
    this.webviewService = webviewService;
    this.languageService = languageService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this._scopedContextKeyService = this._register(new MutableDisposable());
    // Some action bar items use a webview whose vertical scroll position we track in this map
    this.initialScrollProgress = /* @__PURE__ */ new Map();
    // Spot when an ExtensionEditor instance gets reused for a different extension, in which case the vertical scroll positions must be zeroed
    this.currentIdentifier = "";
    this.layoutParticipants = [];
    this.contentDisposables = this._register(new DisposableStore());
    this.transientDisposables = this._register(new DisposableStore());
    this.activeElement = null;
    this.extensionReadme = null;
    this.extensionChangelog = null;
    this.extensionManifest = null;
  }
  static {
    this.ID = "workbench.editor.extension";
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService.value;
  }
  createEditor(parent) {
    const root = append(parent, $(".extension-editor"));
    this._scopedContextKeyService.value = this.contextKeyService.createScoped(root);
    this._scopedContextKeyService.value.createKey("inExtensionEditor", true);
    this.showPreReleaseVersionContextKey = CONTEXT_SHOW_PRE_RELEASE_VERSION.bindTo(this._scopedContextKeyService.value);
    root.tabIndex = 0;
    root.style.outline = "none";
    root.setAttribute("role", "document");
    const header2 = append(root, $(".header"));
    const iconContainer = append(header2, $(".icon-container"));
    const iconWidget = this.instantiationService.createInstance(ExtensionIconWidget, iconContainer);
    const remoteBadge = this.instantiationService.createInstance(RemoteBadgeWidget, iconContainer, true);
    const details = append(header2, $(".details"));
    const title = append(details, $(".title"));
    const name = append(title, $("span.name.clickable", { role: "heading", tabIndex: 0 }));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), name, localize(15024, null)));
    const versionWidget = new VersionWidget(title, this.hoverService);
    const preview = append(title, $("span.preview"));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), preview, localize(15029, null)));
    preview.textContent = localize(15029, null);
    const builtin = append(title, $("span.builtin"));
    builtin.textContent = localize(14996, null);
    const subtitle = append(details, $(".subtitle"));
    const subTitleEntryContainers = [];
    const publisherContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(publisherContainer);
    const publisherWidget = this.instantiationService.createInstance(PublisherWidget, publisherContainer, false);
    const extensionKindContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(extensionKindContainer);
    const extensionKindWidget = this.instantiationService.createInstance(ExtensionKindIndicatorWidget, extensionKindContainer, false);
    const installCountContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(installCountContainer);
    const installCountWidget = this.instantiationService.createInstance(InstallCountWidget, installCountContainer, false);
    const ratingsContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(ratingsContainer);
    const ratingsWidget = this.instantiationService.createInstance(RatingsWidget, ratingsContainer, false);
    const sponsorContainer = append(subtitle, $(".subtitle-entry"));
    subTitleEntryContainers.push(sponsorContainer);
    const sponsorWidget = this.instantiationService.createInstance(SponsorWidget, sponsorContainer);
    const widgets2 = [
      iconWidget,
      remoteBadge,
      versionWidget,
      publisherWidget,
      extensionKindWidget,
      installCountWidget,
      ratingsWidget,
      sponsorWidget
    ];
    const description = append(details, $(".description"));
    const installAction = this.instantiationService.createInstance(InstallDropdownAction);
    const actions = [
      this.instantiationService.createInstance(ExtensionRuntimeStateAction),
      this.instantiationService.createInstance(ExtensionStatusLabelAction),
      this.instantiationService.createInstance(UpdateAction, true),
      this.instantiationService.createInstance(SetColorThemeAction),
      this.instantiationService.createInstance(SetFileIconThemeAction),
      this.instantiationService.createInstance(SetProductIconThemeAction),
      this.instantiationService.createInstance(SetLanguageAction),
      this.instantiationService.createInstance(ClearLanguageAction),
      this.instantiationService.createInstance(EnableDropDownAction),
      this.instantiationService.createInstance(TogglePreReleaseExtensionAction),
      this.instantiationService.createInstance(DisableDropDownAction),
      this.instantiationService.createInstance(RemoteInstallAction, false),
      this.instantiationService.createInstance(LocalInstallAction),
      this.instantiationService.createInstance(WebInstallAction),
      installAction,
      this.instantiationService.createInstance(InstallingLabelAction),
      this.instantiationService.createInstance(ButtonWithDropDownExtensionAction, "extensions.uninstall", UninstallAction.UninstallClass, [
        [
          this.instantiationService.createInstance(MigrateDeprecatedExtensionAction, false),
          this.instantiationService.createInstance(UninstallAction),
          this.instantiationService.createInstance(InstallAnotherVersionAction, null, true)
        ]
      ]),
      this.instantiationService.createInstance(ToggleAutoUpdateForExtensionAction),
      new ExtensionEditorManageExtensionAction(this.scopedContextKeyService || this.contextKeyService, this.instantiationService)
    ];
    const actionsAndStatusContainer = append(details, $(".actions-status-container"));
    const extensionActionBar = this._register(new ActionBar(actionsAndStatusContainer, {
      actionViewItemProvider: (action, options3) => {
        if (action instanceof DropDownExtensionAction) {
          return action.createActionViewItem(options3);
        }
        if (action instanceof ButtonWithDropDownExtensionAction) {
          return new ButtonWithDropdownExtensionActionViewItem(
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
        if (action instanceof ToggleAutoUpdateForExtensionAction) {
          return new CheckboxActionViewItem(void 0, action, { ...options3, icon: true, label: true, checkboxStyles: defaultCheckboxStyles });
        }
        return void 0;
      },
      focusOnlyEnabledItems: true
    }));
    extensionActionBar.push(actions, { icon: true, label: true });
    extensionActionBar.setFocusable(true);
    this._register(Event2.any(...actions.map((a) => Event2.filter(a.onDidChange, (e) => e.enabled !== void 0)))(() => {
      extensionActionBar.setFocusable(false);
      extensionActionBar.setFocusable(true);
    }));
    const otherExtensionContainers = [];
    const extensionStatusAction = this.instantiationService.createInstance(ExtensionStatusAction);
    const extensionStatusWidget = this._register(this.instantiationService.createInstance(ExtensionStatusWidget, append(actionsAndStatusContainer, $(".status")), extensionStatusAction));
    otherExtensionContainers.push(extensionStatusAction, new class extends ExtensionWidget {
      render() {
        actionsAndStatusContainer.classList.toggle("list-layout", this.extension?.state === 1 /* Installed */);
      }
    }());
    const recommendationWidget = this.instantiationService.createInstance(ExtensionRecommendationWidget, append(details, $(".recommendation")));
    widgets2.push(recommendationWidget);
    this._register(Event2.any(extensionStatusWidget.onDidRender, recommendationWidget.onDidRender)(() => {
      if (this.dimension) {
        this.layout(this.dimension);
      }
    }));
    const extensionContainers = this.instantiationService.createInstance(ExtensionContainers, [...actions, ...widgets2, ...otherExtensionContainers]);
    for (const disposable of [...actions, ...widgets2, ...otherExtensionContainers, extensionContainers]) {
      this._register(disposable);
    }
    const onError = Event2.chain(
      extensionActionBar.onDidRun,
      ($110) => $110.map(({ error }) => error).filter((error) => !!error)
    );
    this._register(onError(this.onError, this));
    const body = append(root, $(".body"));
    const navbar = this._register(new NavBar(body));
    const content2 = append(body, $(".content"));
    content2.id = generateUuid();
    this.template = {
      builtin,
      content: content2,
      description,
      header: header2,
      name,
      navbar,
      preview,
      actionsAndStatusContainer,
      extensionActionBar,
      set extension(extension) {
        extensionContainers.extension = extension;
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
      },
      set gallery(gallery) {
        versionWidget.gallery = gallery;
      },
      set manifest(manifest) {
        installAction.manifest = manifest;
      }
    };
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    this.updatePreReleaseVersionContext();
    if (this.template) {
      await this.render(input.extension, this.template, !!options3?.preserveFocus);
    }
  }
  setOptions(options3) {
    const currentOptions = this.options;
    super.setOptions(options3);
    this.updatePreReleaseVersionContext();
    if (this.input && this.template && currentOptions?.showPreReleaseVersion !== options3?.showPreReleaseVersion) {
      this.render(this.input.extension, this.template, !!options3?.preserveFocus);
      return;
    }
    if (options3?.tab) {
      this.template?.navbar.switch(options3.tab);
    }
  }
  updatePreReleaseVersionContext() {
    let showPreReleaseVersion = this.options?.showPreReleaseVersion;
    if (isUndefined(showPreReleaseVersion)) {
      showPreReleaseVersion = !!this.input.extension.gallery?.properties.isPreReleaseVersion;
    }
    this.showPreReleaseVersionContextKey?.set(showPreReleaseVersion);
  }
  async openTab(tab) {
    if (!this.input || !this.template) {
      return;
    }
    if (this.template.navbar.switch(tab)) {
      return;
    }
    if (tab === "extensionPack" /* ExtensionPack */) {
      this.template.navbar.switch("readme" /* Readme */);
    }
  }
  async getGalleryVersionToShow(extension, preRelease) {
    if (extension.resourceExtension) {
      return null;
    }
    if (extension.local?.source === "resource") {
      return null;
    }
    if (isUndefined(preRelease)) {
      return null;
    }
    if (preRelease === extension.gallery?.properties.isPreReleaseVersion) {
      return null;
    }
    if (preRelease && !extension.hasPreReleaseVersion) {
      return null;
    }
    if (!preRelease && !extension.hasReleaseVersion) {
      return null;
    }
    return (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease, hasPreRelease: extension.hasPreReleaseVersion }], CancellationToken.None))[0] || null;
  }
  async render(extension, template2, preserveFocus) {
    this.activeElement = null;
    this.transientDisposables.clear();
    const token = this.transientDisposables.add(new CancellationTokenSource()).token;
    const gallery = await this.getGalleryVersionToShow(extension, this.options?.showPreReleaseVersion);
    if (token.isCancellationRequested) {
      return;
    }
    this.extensionReadme = new Cache2(() => gallery ? this.extensionGalleryService.getReadme(gallery, token) : extension.getReadme(token));
    this.extensionChangelog = new Cache2(() => gallery ? this.extensionGalleryService.getChangelog(gallery, token) : extension.getChangelog(token));
    this.extensionManifest = new Cache2(() => gallery ? this.extensionGalleryService.getManifest(gallery, token) : extension.getManifest(token));
    template2.extension = extension;
    template2.gallery = gallery;
    template2.manifest = null;
    template2.name.textContent = extension.displayName;
    template2.name.classList.toggle("clickable", !!extension.url);
    template2.name.classList.toggle("deprecated", !!extension.deprecationInfo);
    template2.preview.style.display = extension.preview ? "inherit" : "none";
    template2.builtin.style.display = extension.isBuiltin ? "inherit" : "none";
    template2.description.textContent = extension.description;
    if (extension.url) {
      this.transientDisposables.add(onClick2(template2.name, () => this.openerService.open(URI.parse(extension.url))));
    }
    const manifest = await this.extensionManifest.get().promise;
    if (token.isCancellationRequested) {
      return;
    }
    if (manifest) {
      template2.manifest = manifest;
    }
    this.renderNavbar(extension, manifest, template2, preserveFocus);
    const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
    let recommendationsData = {};
    if (extRecommendations[extension.identifier.id.toLowerCase()]) {
      recommendationsData = { recommendationReason: extRecommendations[extension.identifier.id.toLowerCase()].reasonId };
    }
    this.telemetryService.publicLog("extensionGallery:openExtension", { ...extension.telemetryData, ...recommendationsData });
  }
  renderNavbar(extension, manifest, template2, preserveFocus) {
    template2.content.innerText = "";
    template2.navbar.clear();
    if (this.currentIdentifier !== extension.identifier.id) {
      this.initialScrollProgress.clear();
      this.currentIdentifier = extension.identifier.id;
    }
    template2.navbar.push("readme" /* Readme */, localize(15004, null), localize(15005, null));
    if (manifest) {
      template2.navbar.push("features" /* Features */, localize(15011, null), localize(15012, null));
    }
    if (extension.hasChangelog()) {
      template2.navbar.push("changelog" /* Changelog */, localize(14999, null), localize(15001, null));
    }
    if (extension.dependencies.length) {
      template2.navbar.push("dependencies" /* Dependencies */, localize(15002, null), localize(15003, null));
    }
    if (manifest && manifest.extensionPack?.length && !this.shallRenderAsExtensionPack(manifest)) {
      template2.navbar.push("extensionPack" /* ExtensionPack */, localize(15009, null), localize(15010, null));
    }
    if (this.options?.tab) {
      template2.navbar.switch(this.options.tab);
    }
    if (template2.navbar.currentId) {
      this.onNavbarChange(extension, { id: template2.navbar.currentId, focus: !preserveFocus }, template2);
    }
    template2.navbar.onChange((e) => this.onNavbarChange(extension, e, template2), this, this.transientDisposables);
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
    const details = append(template2.content, $(".details"));
    const contentContainer = append(details, $(".content-container"));
    const additionalDetailsContainer = append(details, $(".additional-details-container"));
    const layout2 = () => details.classList.toggle("narrow", this.dimension && this.dimension.width < 500);
    layout2();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    this.renderAdditionalDetails(additionalDetailsContainer, extension);
    switch (id2) {
      case "readme" /* Readme */:
        return this.openDetails(extension, contentContainer, token);
      case "features" /* Features */:
        return this.openFeatures(extension, contentContainer, token);
      case "changelog" /* Changelog */:
        return this.openChangelog(extension, contentContainer, token);
      case "dependencies" /* Dependencies */:
        return this.openExtensionDependencies(extension, contentContainer, token);
      case "extensionPack" /* ExtensionPack */:
        return this.openExtensionPack(extension, contentContainer, token);
    }
    return Promise.resolve(null);
  }
  async openMarkdown(extension, cacheResult, noContentCopy, container3, webviewIndex, title, token) {
    try {
      const body = await this.renderMarkdown(extension, cacheResult, container3, token);
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
      setParentFlowTo(webview.container, container3);
      webview.setAnchorElement(container3);
      webview.setHtml(body);
      webview.claim(this, this.window, void 0);
      this.contentDisposables.add(webview.onDidFocus(() => this._onDidFocus?.fire()));
      this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
      let isDisposed = false;
      this.contentDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
        const body2 = await this.renderMarkdown(extension, cacheResult, container3);
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
        } else if (matchesScheme(link2, Schemas.command) && extension.type === 0 /* System */) {
          this.openerService.open(link2, {
            allowCommands: [
              ShowCurrentReleaseNotesActionId
            ]
          });
        }
      }));
      return webview;
    } catch (e) {
      const p = append(container3, $("p.nocontent"));
      p.textContent = noContentCopy;
      return p;
    }
  }
  async renderMarkdown(extension, cacheResult, container3, token) {
    const contents = await this.loadContents(() => cacheResult, container3);
    if (token?.isCancellationRequested) {
      return "";
    }
    const allowedLinkProtocols = [Schemas.http, Schemas.https, Schemas.mailto];
    const content2 = await renderMarkdownDocument(contents, this.extensionService, this.languageService, {
      sanitizerConfig: {
        allowedLinkProtocols: {
          override: extension.type === 0 /* System */ ? [...allowedLinkProtocols, Schemas.command] : allowedLinkProtocols
        }
      }
    }, token);
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
  async openDetails(extension, contentContainer, token) {
    let activeElement = null;
    const manifest = await this.extensionManifest.get().promise;
    if (manifest && manifest.extensionPack?.length && this.shallRenderAsExtensionPack(manifest)) {
      activeElement = await this.openExtensionPackReadme(extension, manifest, contentContainer, token);
    } else {
      activeElement = await this.openMarkdown(extension, this.extensionReadme.get(), localize(15027, null), contentContainer, 0 /* Readme */, localize(15031, null), token);
    }
    return activeElement;
  }
  shallRenderAsExtensionPack(manifest) {
    return !!manifest.categories?.some((category11) => category11.toLowerCase() === "extension packs");
  }
  async openExtensionPackReadme(extension, manifest, container3, token) {
    if (token.isCancellationRequested) {
      return Promise.resolve(null);
    }
    const extensionPackReadme = append(container3, $("div", { class: "extension-pack-readme" }));
    extensionPackReadme.style.margin = "0 auto";
    extensionPackReadme.style.maxWidth = "882px";
    const extensionPack = append(extensionPackReadme, $("div", { class: "extension-pack" }));
    const packCount = manifest.extensionPack.length;
    const headerHeight = 37;
    const contentMinHeight = 200;
    const layout2 = () => {
      extensionPackReadme.classList.remove("one-row", "two-rows", "three-rows", "more-rows");
      const availableHeight = container3.clientHeight;
      const availableForPack = Math.max(availableHeight - headerHeight - contentMinHeight, 0);
      let rowClass = "one-row";
      if (availableForPack >= 302 && packCount > 6) {
        rowClass = "more-rows";
      } else if (availableForPack >= 282 && packCount > 4) {
        rowClass = "three-rows";
      } else if (availableForPack >= 200 && packCount > 2) {
        rowClass = "two-rows";
      } else {
        rowClass = "one-row";
      }
      extensionPackReadme.classList.add(rowClass);
    };
    layout2();
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: layout2 })));
    const extensionPackHeader = append(extensionPack, $("div.header"));
    extensionPackHeader.textContent = localize(15007, null, manifest.extensionPack.length);
    const extensionPackContent = append(extensionPack, $("div", { class: "extension-pack-content" }));
    extensionPackContent.setAttribute("tabindex", "0");
    const readmeContent = append(extensionPackReadme, $("div.readme-content"));
    await Promise.all([
      this.renderExtensionPack(manifest, extensionPackContent, token),
      this.openMarkdown(extension, this.extensionReadme.get(), localize(15027, null), readmeContent, 0 /* Readme */, localize(15031, null), token)
    ]);
    return { focus: () => extensionPackContent.focus() };
  }
  renderAdditionalDetails(container3, extension) {
    const content2 = $("div", { class: "additional-details-content", tabindex: "0" });
    const scrollableContent = new DomScrollableElement(content2, {});
    const layout2 = () => scrollableContent.scanDomNode();
    const removeLayoutParticipant = insert(this.layoutParticipants, { layout: layout2 });
    this.contentDisposables.add(toDisposable(removeLayoutParticipant));
    this.contentDisposables.add(scrollableContent);
    this.contentDisposables.add(this.instantiationService.createInstance(AdditionalDetailsWidget, content2, extension));
    append(container3, scrollableContent.getDomNode());
    scrollableContent.scanDomNode();
  }
  async openChangelog(extension, contentContainer, token) {
    const activeElement = await this.openMarkdown(extension, this.extensionChangelog.get(), localize(15025, null), contentContainer, 1 /* Changelog */, localize(15000, null), token);
    return activeElement;
  }
  async openFeatures(extension, contentContainer, token) {
    const manifest = await this.loadContents(() => this.extensionManifest.get(), contentContainer);
    if (token.isCancellationRequested) {
      return null;
    }
    if (!manifest) {
      return null;
    }
    const extensionFeaturesTab = this.contentDisposables.add(this.instantiationService.createInstance(ExtensionFeaturesTab, manifest, this.options?.feature));
    const featureLayout = () => extensionFeaturesTab.layout(contentContainer.clientHeight, contentContainer.clientWidth);
    const removeLayoutParticipant = insert(this.layoutParticipants, { layout: featureLayout });
    this.contentDisposables.add(toDisposable(removeLayoutParticipant));
    append(contentContainer, extensionFeaturesTab.domNode);
    featureLayout();
    return extensionFeaturesTab.domNode;
  }
  openExtensionDependencies(extension, contentContainer, token) {
    if (token.isCancellationRequested) {
      return Promise.resolve(null);
    }
    if (isFalsyOrEmpty(extension.dependencies)) {
      append(contentContainer, $("p.nocontent")).textContent = localize(15026, null);
      return Promise.resolve(contentContainer);
    }
    const content2 = $("div", { class: "subcontent" });
    const scrollableContent = new DomScrollableElement(content2, {});
    append(contentContainer, scrollableContent.getDomNode());
    this.contentDisposables.add(scrollableContent);
    const dependenciesTree = this.instantiationService.createInstance(
      ExtensionsTree,
      new ExtensionData2(extension, null, (extension2) => extension2.dependencies || [], this.extensionsWorkbenchService),
      content2,
      {
        listBackground: editorBackground
      }
    );
    const depLayout = () => {
      scrollableContent.scanDomNode();
      const scrollDimensions = scrollableContent.getScrollDimensions();
      dependenciesTree.layout(scrollDimensions.height);
    };
    const removeLayoutParticipant = insert(this.layoutParticipants, { layout: depLayout });
    this.contentDisposables.add(toDisposable(removeLayoutParticipant));
    this.contentDisposables.add(dependenciesTree);
    depLayout();
    return Promise.resolve({ focus() {
      dependenciesTree.domFocus();
    } });
  }
  async openExtensionPack(extension, contentContainer, token) {
    if (token.isCancellationRequested) {
      return Promise.resolve(null);
    }
    const manifest = await this.loadContents(() => this.extensionManifest.get(), contentContainer);
    if (token.isCancellationRequested) {
      return null;
    }
    if (!manifest) {
      return null;
    }
    return this.renderExtensionPack(manifest, contentContainer, token);
  }
  async renderExtensionPack(manifest, parent, token) {
    if (token.isCancellationRequested) {
      return null;
    }
    const content2 = $("div", { class: "subcontent" });
    const scrollableContent = new DomScrollableElement(content2, { useShadows: false });
    append(parent, scrollableContent.getDomNode());
    const extensionsGridView = this.instantiationService.createInstance(ExtensionsGridView, content2, new Delegate3());
    const extensions = await getExtensions2(manifest.extensionPack, this.extensionsWorkbenchService);
    extensionsGridView.setExtensions(extensions);
    scrollableContent.scanDomNode();
    this.contentDisposables.add(scrollableContent);
    this.contentDisposables.add(extensionsGridView);
    this.contentDisposables.add(toDisposable(insert(this.layoutParticipants, { layout: () => scrollableContent.scanDomNode() })));
    return content2;
  }
  loadContents(loadingTask, container3) {
    container3.classList.add("loading");
    const result = this.contentDisposables.add(loadingTask());
    const onDone = () => container3.classList.remove("loading");
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

ExtensionEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IExtensionsWorkbenchService),
  __decorateParam(4, IExtensionGalleryService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IExtensionRecommendationsService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IWebviewService),
  __decorateParam(12, ILanguageService),
  __decorateParam(13, IContextMenuService),
  __decorateParam(14, IContextKeyService),
  __decorateParam(15, IHoverService)
], ExtensionEditor);

var AdditionalDetailsWidget = class extends Disposable {
  constructor(container3, extension, hoverService, openerService, userDataProfilesService, remoteAgentService, fileService, uriIdentityService, extensionsWorkbenchService, extensionGalleryManifestService) {
    super();
    this.container = container3;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.userDataProfilesService = userDataProfilesService;
    this.remoteAgentService = remoteAgentService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionGalleryManifestService = extensionGalleryManifestService;
    this.disposables = this._register(new DisposableStore());
    this.render(extension);
    this._register(this.extensionsWorkbenchService.onChange((e) => {
      if (e && areSameExtensions(e.identifier, extension.identifier) && e.server === extension.server) {
        this.render(e);
      }
    }));
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
    this.renderCategories(this.container, extension);
    this.renderExtensionResources(this.container, extension);
  }
  renderCategories(container3, extension) {
    if (extension.categories.length) {
      const categoriesContainer = append(container3, $(".categories-container.additional-details-element"));
      append(categoriesContainer, $(".additional-details-title", void 0, localize(14998, null)));
      const categoriesElement = append(categoriesContainer, $(".categories"));
      this.extensionGalleryManifestService.getExtensionGalleryManifest().then((manifest) => {
        const hasCategoryFilter = manifest?.capabilities.extensionQuery.filtering?.some(({ name }) => name === "Category" /* Category */);
        for (const category11 of extension.categories) {
          const categoryElement = append(categoriesElement, $("span.category", { tabindex: "0" }, category11));
          if (hasCategoryFilter) {
            categoryElement.classList.add("clickable");
            this.disposables.add(onClick2(categoryElement, () => this.extensionsWorkbenchService.openSearch(`@category:"${category11}"`)));
          }
        }
      });
    }
  }
  renderExtensionResources(container3, extension) {
    const resources = [];
    if (extension.repository) {
      try {
        resources.push([localize(15032, null), ThemeIcon.fromId(Codicon.repo.id), URI.parse(extension.repository)]);
      } catch (error) {
      }
    }
    if (extension.supportUrl) {
      try {
        resources.push([localize(15018, null), ThemeIcon.fromId(Codicon.issues.id), URI.parse(extension.supportUrl)]);
      } catch (error) {
      }
    }
    if (extension.licenseUrl) {
      try {
        resources.push([localize(15021, null), ThemeIcon.fromId(Codicon.linkExternal.id), URI.parse(extension.licenseUrl)]);
      } catch (error) {
      }
    }
    if (extension.publisherUrl) {
      resources.push([extension.publisherDisplayName, ThemeIcon.fromId(Codicon.linkExternal.id), extension.publisherUrl]);
    }
    if (extension.url) {
      resources.push([localize(15022, null), ThemeIcon.fromId(Codicon.linkExternal.id), URI.parse(extension.url)]);
    }
    if (resources.length || extension.publisherSponsorLink) {
      const extensionResourcesContainer = append(container3, $(".resources-container.additional-details-element"));
      append(extensionResourcesContainer, $(".additional-details-title", void 0, localize(15033, null)));
      const resourcesElement = append(extensionResourcesContainer, $(".resources"));
      for (const [label3, icon2, uri5] of resources) {
        const resourceElement = append(resourcesElement, $(".resource"));
        append(resourceElement, $(ThemeIcon.asCSSSelector(icon2)));
        append(resourceElement, $("a", { tabindex: "0" }, label3));
        this.disposables.add(onClick2(resourceElement, () => this.openerService.open(uri5)));
        this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), resourceElement, uri5.toString()));
      }
    }
  }
  renderInstallInfo(container3, extension) {
    const installInfoContainer = append(container3, $(".more-info-container.additional-details-element"));
    append(installInfoContainer, $(".additional-details-title", void 0, localize(15017, null)));
    const installInfo = append(installInfoContainer, $(".more-info"));
    append(
      installInfo,
      $(
        ".more-info-entry",
        void 0,
        $("div.more-info-entry-name", void 0, localize(15016, null)),
        $("code", void 0, extension.identifier.id)
      )
    );
    if (extension.type !== 0 /* System */) {
      append(
        installInfo,
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", void 0, localize(15037, null)),
          $("code", void 0, extension.manifest.version)
        )
      );
    }
    if (extension.installedTimestamp) {
      append(
        installInfo,
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", void 0, localize(15020, null)),
          $("div", {
            "title": new Date(extension.installedTimestamp).toString()
          }, fromNow(extension.installedTimestamp, true, true, true))
        )
      );
    }
    if (!extension.isBuiltin && extension.source !== "gallery") {
      const element = $("div", void 0, extension.source === "vsix" ? localize(15038, null) : localize(15028, null));
      append(
        installInfo,
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", void 0, localize(15036, null)),
          element
        )
      );
      if (isNative && extension.source === "resource" && extension.location.scheme === Schemas.file) {
        element.classList.add("link");
        element.tabIndex = 0;
        element.setAttribute("role", "link");
        element.title = extension.location.fsPath;
        this.disposables.add(onClick2(element, () => this.openerService.open(extension.location, { openExternal: true })));
      }
    }
    if (extension.size) {
      const element = $("div", void 0, ByteSize.formatSize(extension.size));
      append(
        installInfo,
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", { title: localize(15035, null) }, localize(15034, null)),
          element
        )
      );
      if (isNative && extension.location.scheme === Schemas.file) {
        element.classList.add("link");
        element.tabIndex = 0;
        element.setAttribute("role", "link");
        element.title = extension.location.fsPath;
        this.disposables.add(onClick2(element, () => this.openerService.open(extension.location, { openExternal: true })));
      }
    }
    this.getCacheLocation(extension).then((cacheLocation) => {
      if (!cacheLocation) {
        return;
      }
      computeSize(cacheLocation, this.fileService).then((cacheSize) => {
        if (!cacheSize) {
          return;
        }
        const element = $("div", void 0, ByteSize.formatSize(cacheSize));
        append(
          installInfo,
          $(
            ".more-info-entry",
            void 0,
            $("div.more-info-entry-name", { title: localize(15006, null) }, localize(14997, null)),
            element
          )
        );
        if (isNative && extension.location.scheme === Schemas.file) {
          element.classList.add("link");
          element.tabIndex = 0;
          element.setAttribute("role", "link");
          element.title = cacheLocation.fsPath;
          this.disposables.add(onClick2(element, () => this.openerService.open(cacheLocation.with({ scheme: Schemas.file }), { openExternal: true })));
        }
      });
    });
  }
  async getCacheLocation(extension) {
    let extensionCacheLocation = this.uriIdentityService.extUri.joinPath(this.userDataProfilesService.defaultProfile.globalStorageHome, extension.identifier.id.toLowerCase());
    if (extension.location.scheme === Schemas.vscodeRemote) {
      const environment = await this.remoteAgentService.getEnvironment();
      if (!environment) {
        return void 0;
      }
      extensionCacheLocation = this.uriIdentityService.extUri.joinPath(environment.globalStorageHome, extension.identifier.id.toLowerCase());
    }
    return extensionCacheLocation;
  }
  renderMarketplaceInfo(container3, extension) {
    const gallery = extension.gallery;
    const moreInfoContainer = append(container3, $(".more-info-container.additional-details-element"));
    append(moreInfoContainer, $(".additional-details-title", void 0, localize(15023, null)));
    const moreInfo = append(moreInfoContainer, $(".more-info"));
    if (gallery) {
      if (!extension.local) {
        append(
          moreInfo,
          $(
            ".more-info-entry",
            void 0,
            $("div.more-info-entry-name", void 0, localize(15016, null)),
            $("code", void 0, extension.identifier.id)
          )
        );
        append(
          moreInfo,
          $(
            ".more-info-entry",
            void 0,
            $("div.more-info-entry-name", void 0, localize(15037, null)),
            $("code", void 0, gallery.version)
          )
        );
      }
      append(
        moreInfo,
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", void 0, localize(15030, null)),
          $("div", {
            "title": new Date(gallery.releaseDate).toString()
          }, fromNow(gallery.releaseDate, true, true, true))
        ),
        $(
          ".more-info-entry",
          void 0,
          $("div.more-info-entry-name", void 0, localize(15019, null)),
          $("div", {
            "title": new Date(gallery.lastUpdated).toString()
          }, fromNow(gallery.lastUpdated, true, true, true))
        )
      );
    }
  }
};

AdditionalDetailsWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, IRemoteAgentService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IUriIdentityService),
  __decorateParam(8, IExtensionsWorkbenchService),
  __decorateParam(9, IExtensionGalleryManifestService)
], AdditionalDetailsWidget);

var contextKeyExpr = ContextKeyExpr.and(ContextKeyExpr.equals("activeEditor", ExtensionEditor.ID), EditorContextKeys.focus.toNegated());

registerAction2(class ShowExtensionEditorFindAction extends Action2 {
  constructor() {
    super({
      id: "editor.action.extensioneditor.showfind",
      title: localize(15013, null),
      keybinding: {
        when: contextKeyExpr,
        weight: 100 /* EditorContrib */,
        primary: 2048 /* CtrlCmd */ | 36 /* KeyF */
      }
    });
  }
  run(accessor) {
    const extensionEditor = getExtensionEditor(accessor);
    extensionEditor?.showFind();
  }
});

registerAction2(class StartExtensionEditorFindNextAction extends Action2 {
  constructor() {
    super({
      id: "editor.action.extensioneditor.findNext",
      title: localize(15014, null),
      keybinding: {
        when: ContextKeyExpr.and(
          contextKeyExpr,
          KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED
        ),
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor) {
    const extensionEditor = getExtensionEditor(accessor);
    extensionEditor?.runFindAction(false);
  }
});

registerAction2(class StartExtensionEditorFindPreviousAction extends Action2 {
  constructor() {
    super({
      id: "editor.action.extensioneditor.findPrevious",
      title: localize(15015, null),
      keybinding: {
        when: ContextKeyExpr.and(
          contextKeyExpr,
          KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED
        ),
        primary: 1024 /* Shift */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor) {
    const extensionEditor = getExtensionEditor(accessor);
    extensionEditor?.runFindAction(true);
  }
});

registerThemingParticipant((theme, collector) => {
  const link2 = theme.getColor(textLinkForeground);
  if (link2) {
    collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource { color: ${link2}; }`);
    collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a { color: ${link2}; }`);
  }
  const activeLink = theme.getColor(textLinkActiveForeground);
  if (activeLink) {
    collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:hover,
			.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:active { color: ${activeLink}; }`);
    collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a:hover,
			.monaco-workbench .extension-editor .content .feature-contributions a:active { color: ${activeLink}; }`);
  }
  const buttonHoverBackgroundColor = theme.getColor(buttonHoverBackground);
  if (buttonHoverBackgroundColor) {
    collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category.clickable:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
  }
  const buttonForegroundColor = theme.getColor(buttonForeground);
  if (buttonForegroundColor) {
    collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category.clickable:hover { color: ${buttonForegroundColor}; }`);
  }
});

function getExtensionEditor(accessor) {
  const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
  if (activeEditorPane instanceof ExtensionEditor) {
    return activeEditorPane;
  }
  return null;
}
export { getExtensionEditor, NavBar, CONTEXT_SHOW_PRE_RELEASE_VERSION, ExtensionWithDifferentGalleryVersionWidget, VersionWidget, ExtensionEditor, AdditionalDetailsWidget, contextKeyExpr };
