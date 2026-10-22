// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsWidgets.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, finalHandler, reset } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { extensionDefaultIcon, extensionVerifiedPublisherIconColor, verifiedPublisherIcon } from "./module-2250.mjs";
import { activationTimeIcon, errorIcon, infoIcon, installCountIcon, preReleaseIcon, privateExtensionIcon, ratingIcon, remoteIcon, restartRequiredIcon, sponsorIcon, starEmptyIcon, starFullIcon, starHalfIcon, syncIgnoredIcon, warningIcon2 } from "./module-1875.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { language } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { URI } from "./module-0032.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { renderIcon } from "./module-0467.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from "./module-1702.mjs";
import { IExtensionManagementServerService } from "./module-1046.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { EXTENSION_BADGE_BACKGROUND, EXTENSION_BADGE_FOREGROUND } from "./module-0912.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { VIEW_ID2 } from "./module-1542.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IExplorerService } from "./module-2020.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IExtensionGalleryManifestService } from "./module-0890.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUserDataSyncEnablementService } from "./module-1696.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11, IExtensionFeaturesManagementService } from "./module-0877.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { MarkdownString, createCommandUri } from "./module-0462.mjs";
import { valid } from "./module-1044.mjs";
import { Color } from "./module-0197.mjs";
import { severity_default } from "./module-0266.mjs";
import { extensionButtonProminentBackground } from "./module-1877.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { registerColor } from "./module-0226.mjs";
import { textLinkForeground } from "./module-0227.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsWidgets.ts
var ExtensionWidget = class extends Disposable {
  constructor() {
    super(...arguments);
    this._extension = null;
  }
  get extension() {
    return this._extension;
  }
  set extension(extension) {
    this._extension = extension;
    this.update();
  }
  update() {
    this.render();
  }
};

function onClick2(element, callback) {
  const disposables = new DisposableStore();
  disposables.add(addDisposableListener(element, EventType.CLICK, finalHandler(callback)));
  disposables.add(addDisposableListener(element, EventType.KEY_UP, (e) => {
    const keyboardEvent = new StandardKeyboardEvent(e);
    if (keyboardEvent.equals(10 /* Space */) || keyboardEvent.equals(3 /* Enter */)) {
      e.preventDefault();
      e.stopPropagation();
      callback();
    }
  }));
  return disposables;
}

var ExtensionIconWidget = class extends ExtensionWidget {
  constructor(container3) {
    super();
    this.iconLoadingDisposable = this._register(new MutableDisposable());
    this.iconErrorDisposable = this._register(new MutableDisposable());
    this.element = append(container3, $(".extension-icon"));
    this.iconElement = append(this.element, $("img.icon", { alt: "" }));
    this.iconElement.style.display = "none";
    this.defaultIconElement = append(this.element, $(ThemeIcon.asCSSSelector(extensionDefaultIcon)));
    this.defaultIconElement.style.display = "none";
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.iconUrl = void 0;
    this.iconElement.src = "";
    this.iconElement.style.display = "none";
    this.defaultIconElement.style.display = "none";
    this.iconErrorDisposable.clear();
    this.iconLoadingDisposable.clear();
  }
  render() {
    if (!this.extension) {
      this.clear();
      return;
    }
    if (this.extension.iconUrl) {
      if (this.iconUrl !== this.extension.iconUrl) {
        this.iconElement.style.display = "inherit";
        this.defaultIconElement.style.display = "none";
        this.iconUrl = this.extension.iconUrl;
        this.iconErrorDisposable.value = addDisposableListener(this.iconElement, "error", () => {
          if (this.extension?.iconUrlFallback) {
            this.iconElement.src = this.extension.iconUrlFallback;
          } else {
            this.iconElement.style.display = "none";
            this.defaultIconElement.style.display = "inherit";
          }
        }, { once: true });
        this.iconElement.src = this.iconUrl;
        if (!this.iconElement.complete) {
          this.iconElement.style.visibility = "hidden";
          this.iconLoadingDisposable.value = addDisposableListener(this.iconElement, "load", () => {
            this.iconElement.style.visibility = "inherit";
          });
        } else {
          this.iconElement.style.visibility = "inherit";
        }
      }
    } else {
      this.iconUrl = void 0;
      this.iconElement.style.display = "none";
      this.iconElement.src = "";
      this.defaultIconElement.style.display = "inherit";
      this.iconErrorDisposable.clear();
      this.iconLoadingDisposable.clear();
    }
  }
};

var InstallCountWidget = class extends ExtensionWidget {
  constructor(container3, small, hoverService) {
    super();
    this.container = container3;
    this.small = small;
    this.hoverService = hoverService;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.container.innerText = "";
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.extension) {
      return;
    }
    if (this.small && this.extension.state !== 3 /* Uninstalled */) {
      return;
    }
    const installLabel = InstallCountWidget.getInstallLabel(this.extension, this.small);
    if (!installLabel) {
      return;
    }
    const parent = this.small ? this.container : append(this.container, $("span.install", { tabIndex: 0 }));
    append(parent, $("span" + ThemeIcon.asCSSSelector(installCountIcon)));
    const count2 = append(parent, $("span.count"));
    count2.textContent = installLabel;
    if (!this.small) {
      this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.container, localize(15495, null)));
    }
  }
  static getInstallLabel(extension, small) {
    const installCount = extension.installCount;
    if (!installCount) {
      return void 0;
    }
    let installLabel;
    if (small) {
      if (installCount > 1e6) {
        installLabel = `${Math.floor(installCount / 1e5) / 10}M`;
      } else if (installCount > 1e3) {
        installLabel = `${Math.floor(installCount / 1e3)}K`;
      } else {
        installLabel = String(installCount);
      }
    } else {
      installLabel = installCount.toLocaleString(language);
    }
    return installLabel;
  }
};

InstallCountWidget = __decorateClass([
  __decorateParam(2, IHoverService)
], InstallCountWidget);

var RatingsWidget = class extends ExtensionWidget {
  constructor(container3, small, hoverService, openerService) {
    super();
    this.container = container3;
    this.small = small;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.disposables = this._register(new DisposableStore());
    container3.classList.add("extension-ratings");
    if (this.small) {
      container3.classList.add("small");
    }
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.container.innerText = "";
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.extension) {
      return;
    }
    if (this.small && this.extension.state !== 3 /* Uninstalled */) {
      return;
    }
    if (this.extension.rating === void 0) {
      return;
    }
    if (this.small && !this.extension.ratingCount) {
      return;
    }
    if (!this.extension.url) {
      return;
    }
    const rating = Math.round(this.extension.rating * 2) / 2;
    if (this.small) {
      append(this.container, $("span" + ThemeIcon.asCSSSelector(starFullIcon)));
      const count2 = append(this.container, $("span.count"));
      count2.textContent = String(rating);
    } else {
      const element = append(this.container, $("span.rating.clickable", { tabIndex: 0 }));
      for (let i2 = 1; i2 <= 5; i2++) {
        if (rating >= i2) {
          append(element, $("span" + ThemeIcon.asCSSSelector(starFullIcon)));
        } else if (rating >= i2 - 0.5) {
          append(element, $("span" + ThemeIcon.asCSSSelector(starHalfIcon)));
        } else {
          append(element, $("span" + ThemeIcon.asCSSSelector(starEmptyIcon)));
        }
      }
      if (this.extension.ratingCount) {
        const ratingCountElemet = append(element, $("span", void 0, ` (${this.extension.ratingCount})`));
        ratingCountElemet.style.paddingLeft = "1px";
      }
      this.containerHover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element, ""));
      this.containerHover.update(localize(15502, null, rating));
      element.setAttribute("role", "link");
      if (this.extension.ratingUrl) {
        this.disposables.add(onClick2(element, () => this.openerService.open(URI.parse(this.extension.ratingUrl))));
      }
    }
  }
};

RatingsWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IOpenerService)
], RatingsWidget);

var PublisherWidget = class extends ExtensionWidget {
  constructor(container3, small, extensionsWorkbenchService, hoverService, openerService) {
    super();
    this.container = container3;
    this.small = small;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.element?.remove();
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.extension) {
      return;
    }
    if (this.extension.resourceExtension) {
      return;
    }
    if (this.extension.local?.source === "resource") {
      return;
    }
    this.element = append(this.container, $(".publisher"));
    const publisherDisplayName = $(".publisher-name.ellipsis");
    publisherDisplayName.textContent = this.extension.publisherDisplayName;
    const verifiedPublisher = $(".verified-publisher");
    append(verifiedPublisher, $("span.extension-verified-publisher.clickable"), renderIcon(verifiedPublisherIcon));
    if (this.small) {
      if (this.extension.publisherDomain?.verified) {
        append(this.element, verifiedPublisher);
      }
      append(this.element, publisherDisplayName);
    } else {
      this.element.classList.toggle("clickable", !!this.extension.url);
      this.element.setAttribute("role", "button");
      this.element.tabIndex = 0;
      this.containerHover = this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, localize(15500, null, this.extension.publisherDisplayName)));
      append(this.element, publisherDisplayName);
      if (this.extension.publisherDomain?.verified) {
        append(this.element, verifiedPublisher);
        const publisherDomainLink = URI.parse(this.extension.publisherDomain.link);
        verifiedPublisher.tabIndex = 0;
        verifiedPublisher.setAttribute("role", "button");
        this.containerHover.update(localize(15514, null, this.extension.publisherDomain.link));
        verifiedPublisher.setAttribute("role", "link");
        append(verifiedPublisher, $("span.extension-verified-publisher-domain", void 0, publisherDomainLink.authority.startsWith("www.") ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority));
        this.disposables.add(onClick2(verifiedPublisher, () => this.openerService.open(publisherDomainLink)));
      }
      if (this.extension.url) {
        this.disposables.add(onClick2(this.element, () => this.extensionsWorkbenchService.openSearch(`publisher:"${this.extension?.publisherDisplayName}"`)));
      }
    }
  }
};

PublisherWidget = __decorateClass([
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IOpenerService)
], PublisherWidget);

var SponsorWidget = class extends ExtensionWidget {
  constructor(container3, hoverService, openerService) {
    super();
    this.container = container3;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.disposables = this._register(new DisposableStore());
    this.render();
  }
  render() {
    reset(this.container);
    this.disposables.clear();
    if (!this.extension?.publisherSponsorLink) {
      return;
    }
    const sponsor = append(this.container, $("span.sponsor.clickable", { tabIndex: 0 }));
    this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), sponsor, this.extension?.publisherSponsorLink.toString() ?? ""));
    sponsor.setAttribute("role", "link");
    const sponsorIconElement = renderIcon(sponsorIcon);
    const label3 = $("span", void 0, localize(15507, null));
    append(sponsor, sponsorIconElement, label3);
    this.disposables.add(onClick2(sponsor, () => {
      this.openerService.open(this.extension.publisherSponsorLink);
    }));
  }
};

SponsorWidget = __decorateClass([
  __decorateParam(1, IHoverService),
  __decorateParam(2, IOpenerService)
], SponsorWidget);

var RecommendationWidget = class extends ExtensionWidget {
  constructor(parent, extensionRecommendationsService) {
    super();
    this.parent = parent;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
  }
  clear() {
    this.element?.remove();
    this.element = void 0;
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.extension || this.extension.state === 1 /* Installed */ || this.extension.deprecationInfo) {
      return;
    }
    const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
    if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
      this.element = append(this.parent, $("div.extension-bookmark"));
      const recommendation = append(this.element, $(".recommendation"));
      append(recommendation, $("span" + ThemeIcon.asCSSSelector(ratingIcon)));
    }
  }
};

RecommendationWidget = __decorateClass([
  __decorateParam(1, IExtensionRecommendationsService)
], RecommendationWidget);

var PreReleaseBookmarkWidget = class extends ExtensionWidget {
  constructor(parent) {
    super();
    this.parent = parent;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.element?.remove();
    this.element = void 0;
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (this.extension?.state === 1 /* Installed */ ? this.extension.preRelease : this.extension?.hasPreReleaseVersion) {
      this.element = append(this.parent, $("div.extension-bookmark"));
      const preRelease = append(this.element, $(".pre-release"));
      append(preRelease, $("span" + ThemeIcon.asCSSSelector(preReleaseIcon)));
    }
  }
};

var RemoteBadgeWidget = class extends ExtensionWidget {
  constructor(parent, tooltip, extensionManagementServerService, instantiationService) {
    super();
    this.tooltip = tooltip;
    this.extensionManagementServerService = extensionManagementServerService;
    this.instantiationService = instantiationService;
    this.remoteBadge = this._register(new MutableDisposable());
    this.element = append(parent, $(""));
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.remoteBadge.value?.element.remove();
    this.remoteBadge.clear();
  }
  render() {
    this.clear();
    if (!this.extension || !this.extension.local || !this.extension.server || !(this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) || this.extension.server !== this.extensionManagementServerService.remoteExtensionManagementServer) {
      return;
    }
    let tooltip;
    if (this.tooltip && this.extensionManagementServerService.remoteExtensionManagementServer) {
      tooltip = localize(15504, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
    }
    this.remoteBadge.value = this.instantiationService.createInstance(ExtensionIconBadge, remoteIcon, tooltip);
    append(this.element, this.remoteBadge.value.element);
  }
};

RemoteBadgeWidget = __decorateClass([
  __decorateParam(2, IExtensionManagementServerService),
  __decorateParam(3, IInstantiationService)
], RemoteBadgeWidget);

var ExtensionIconBadge = class extends Disposable {
  constructor(icon2, tooltip, hoverService, labelService, themeService) {
    super();
    this.icon = icon2;
    this.tooltip = tooltip;
    this.labelService = labelService;
    this.themeService = themeService;
    this.element = $("div.extension-badge.extension-icon-badge");
    this.elementHover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, ""));
    this.render();
  }
  render() {
    append(this.element, $("span" + ThemeIcon.asCSSSelector(this.icon)));
    const applyBadgeStyle = () => {
      if (!this.element) {
        return;
      }
      const bgColor = this.themeService.getColorTheme().getColor(EXTENSION_BADGE_BACKGROUND);
      const fgColor = this.themeService.getColorTheme().getColor(EXTENSION_BADGE_FOREGROUND);
      this.element.style.backgroundColor = bgColor ? bgColor.toString() : "";
      this.element.style.color = fgColor ? fgColor.toString() : "";
    };
    applyBadgeStyle();
    this._register(this.themeService.onDidColorThemeChange(() => applyBadgeStyle()));
    if (this.tooltip) {
      const updateTitle = () => {
        if (this.element) {
          this.elementHover.update(this.tooltip);
        }
      };
      this._register(this.labelService.onDidChangeFormatters(() => updateTitle()));
      updateTitle();
    }
  }
};

ExtensionIconBadge = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IThemeService)
], ExtensionIconBadge);

var ExtensionPackCountWidget = class extends ExtensionWidget {
  constructor(parent) {
    super();
    this.parent = parent;
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.element?.remove();
    this.countBadge?.dispose();
    this.countBadge = void 0;
  }
  render() {
    this.clear();
    if (!this.extension || !this.extension.categories?.some((category11) => category11.toLowerCase() === "extension packs") || !this.extension.extensionPack.length) {
      return;
    }
    this.element = append(this.parent, $(".extension-badge.extension-pack-badge"));
    this.countBadge = new CountBadge(this.element, {}, defaultCountBadgeStyles);
    this.countBadge.setCount(this.extension.extensionPack.length);
  }
};

var ExtensionKindIndicatorWidget = class extends ExtensionWidget {
  constructor(container3, small, hoverService, contextService, uriIdentityService, explorerService, viewsService, extensionGalleryManifestService) {
    super();
    this.container = container3;
    this.small = small;
    this.hoverService = hoverService;
    this.contextService = contextService;
    this.uriIdentityService = uriIdentityService;
    this.explorerService = explorerService;
    this.viewsService = viewsService;
    this.extensionGalleryManifest = null;
    this.disposables = this._register(new DisposableStore());
    this.render();
    this._register(toDisposable(() => this.clear()));
    extensionGalleryManifestService.getExtensionGalleryManifest().then((manifest) => {
      if (this._store.isDisposed) {
        return;
      }
      this.extensionGalleryManifest = manifest;
      this.render();
    });
  }
  clear() {
    this.element?.remove();
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.extension) {
      return;
    }
    if (this.extension?.private) {
      this.element = append(this.container, $(".extension-kind-indicator"));
      if (!this.small || this.extensionGalleryManifest?.capabilities.extensions?.includePublicExtensions && this.extensionGalleryManifest?.capabilities.extensions?.includePrivateExtensions) {
        append(this.element, $("span" + ThemeIcon.asCSSSelector(privateExtensionIcon)));
      }
      if (!this.small) {
        append(this.element, $("span.private-extension-label", void 0, localize(15499, null)));
      }
      return;
    }
    if (!this.small) {
      return;
    }
    const location2 = this.extension.resourceExtension?.location ?? (this.extension.local?.source === "resource" ? this.extension.local?.location : void 0);
    if (!location2) {
      return;
    }
    this.element = append(this.container, $(".extension-kind-indicator"));
    const workspaceFolder = this.contextService.getWorkspaceFolder(location2);
    if (workspaceFolder && this.extension.isWorkspaceScoped) {
      this.element.textContent = localize(15515, null);
      this.element.classList.add("clickable");
      this.element.setAttribute("role", "button");
      this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, this.uriIdentityService.extUri.relativePath(workspaceFolder.uri, location2)));
      this.disposables.add(onClick2(this.element, () => {
        this.viewsService.openView(VIEW_ID2, true).then(() => this.explorerService.select(location2, true));
      }));
    } else {
      this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, location2.path));
      this.element.textContent = localize(15496, null);
    }
  }
};

ExtensionKindIndicatorWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IExplorerService),
  __decorateParam(6, IViewsService),
  __decorateParam(7, IExtensionGalleryManifestService)
], ExtensionKindIndicatorWidget);

var SyncIgnoredWidget = class extends ExtensionWidget {
  constructor(container3, configurationService, extensionsWorkbenchService, hoverService, userDataSyncEnablementService) {
    super();
    this.container = container3;
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.hoverService = hoverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.disposables = this._register(new DisposableStore());
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("settingsSync.ignoredExtensions"))(() => this.render()));
    this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
    this.render();
  }
  render() {
    this.disposables.clear();
    this.container.innerText = "";
    if (this.extension && this.extension.state === 1 /* Installed */ && this.userDataSyncEnablementService.isEnabled() && this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension)) {
      const element = append(this.container, $("span.extension-sync-ignored" + ThemeIcon.asCSSSelector(syncIgnoredIcon)));
      this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element, localize(15509, null)));
      element.classList.add(...ThemeIcon.asClassNameArray(syncIgnoredIcon));
    }
  }
};

SyncIgnoredWidget = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IUserDataSyncEnablementService)
], SyncIgnoredWidget);

var ExtensionRestartRequiredWidget = class extends ExtensionWidget {
  constructor(container3, hoverService) {
    super();
    this.container = container3;
    this.hoverService = hoverService;
    this.disposables = this._register(new DisposableStore());
  }
  render() {
    this.disposables.clear();
    this.container.innerText = "";
    const runtimeState = this.extension?.runtimeState;
    const reason = typeof runtimeState?.reason === "string" ? runtimeState.reason : "";
    if (runtimeState && /restart|reload/i.test(reason)) {
      const element = append(this.container, $("span.extension-restart-required" + ThemeIcon.asCSSSelector(restartRequiredIcon)));
      append(this.container, $("span.extension-restart-required-label", void 0, localize(15505, null)));
      this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element, reason));
    }
  }
};

ExtensionRestartRequiredWidget = __decorateClass([
  __decorateParam(1, IHoverService)
], ExtensionRestartRequiredWidget);

var ExtensionRuntimeStatusWidget = class extends ExtensionWidget {
  constructor(extensionViewState, container3, extensionService, extensionFeaturesManagementService, extensionsWorkbenchService) {
    super();
    this.extensionViewState = extensionViewState;
    this.container = container3;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this._register(extensionService.onDidChangeExtensionsStatus((extensions) => {
      if (this.extension && extensions.some((e) => areSameExtensions({ id: e.value }, this.extension.identifier))) {
        this.update();
      }
    }));
    this._register(extensionFeaturesManagementService.onDidChangeAccessData((e) => {
      if (this.extension && ExtensionIdentifier.equals(this.extension.identifier.id, e.extension)) {
        this.update();
      }
    }));
  }
  render() {
    this.container.innerText = "";
    if (!this.extension) {
      return;
    }
    if (this.extensionViewState.filters.featureId && this.extension.state === 1 /* Installed */) {
      const accessData = this.extensionFeaturesManagementService.getAllAccessDataForExtension(new ExtensionIdentifier(this.extension.identifier.id)).get(this.extensionViewState.filters.featureId);
      const feature = Registry.as(Extensions11.ExtensionFeaturesRegistry).getExtensionFeature(this.extensionViewState.filters.featureId);
      if (feature?.icon && accessData) {
        const featureAccessTimeElement = append(this.container, $("span.activationTime"));
        featureAccessTimeElement.textContent = localize(15492, null, accessData.accessTimes.length);
        const iconElement = append(this.container, $("span" + ThemeIcon.asCSSSelector(feature.icon)));
        iconElement.style.paddingLeft = "4px";
        return;
      }
    }
    const extensionStatus = this.extensionsWorkbenchService.getExtensionRuntimeStatus(this.extension);
    if (extensionStatus?.activationTimes) {
      const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
      append(this.container, $("span" + ThemeIcon.asCSSSelector(activationTimeIcon)));
      const activationTimeElement = append(this.container, $("span.activationTime"));
      activationTimeElement.textContent = `${activationTime}ms`;
    }
  }
};

ExtensionRuntimeStatusWidget = __decorateClass([
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IExtensionFeaturesManagementService),
  __decorateParam(4, IExtensionsWorkbenchService)
], ExtensionRuntimeStatusWidget);

var ExtensionHoverWidget = class extends ExtensionWidget {
  constructor(options3, extensionStatusAction, extensionsWorkbenchService, extensionFeaturesManagementService, hoverService, configurationService, extensionRecommendationsService, themeService, contextService) {
    super();
    this.options = options3;
    this.extensionStatusAction = extensionStatusAction;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.hoverService = hoverService;
    this.configurationService = configurationService;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.themeService = themeService;
    this.contextService = contextService;
    this.hover = this._register(new MutableDisposable());
  }
  render() {
    this.hover.value = void 0;
    if (this.extension) {
      this.hover.value = this.hoverService.setupManagedHover(
        {
          delay: this.configurationService.getValue("workbench.hover.delay"),
          showHover: (options3, focus) => {
            return this.hoverService.showInstantHover({
              ...options3,
              additionalClasses: ["extension-hover"],
              position: {
                hoverPosition: this.options.position(),
                forcePosition: true
              },
              persistence: {
                hideOnKeyDown: true
              }
            }, focus);
          },
          placement: "element"
        },
        this.options.target,
        {
          markdown: async () => {
            try {
              await this.extensionStatusAction.recomputeStatus();
            } catch (error) {
            }
            return this.getHoverMarkdown();
          },
          markdownNotSupportedFallback: void 0
        },
        {
          appearance: {
            showHoverHint: true
          }
        }
      );
    }
  }
  getHoverMarkdown() {
    if (!this.extension) {
      return void 0;
    }
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    markdown.appendMarkdown(`**`).appendText(this.extension.displayName).appendMarkdown(`**`);
    if (valid(this.extension.version)) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.version}${this.extension.isPreReleaseVersion ? " (pre-release)" : ""}_**&nbsp;</span>`);
    }
    markdown.appendText(`
`);
    let addSeparator = false;
    if (this.extension.private) {
      markdown.appendMarkdown(`$(${privateExtensionIcon.id}) ${localize(15499, null)}`);
      addSeparator = true;
    }
    if (this.extension.state === 1 /* Installed */) {
      const installLabel = InstallCountWidget.getInstallLabel(this.extension, true);
      if (installLabel) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        markdown.appendMarkdown(`$(${installCountIcon.id}) ${installLabel}`);
        addSeparator = true;
      }
      if (this.extension.rating) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        const rating = Math.round(this.extension.rating * 2) / 2;
        markdown.appendMarkdown(`$(${starFullIcon.id}) [${rating}](${this.extension.url}&ssr=false#review-details)`);
        addSeparator = true;
      }
      if (this.extension.publisherSponsorLink) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        markdown.appendMarkdown(`$(${sponsorIcon.id}) [${localize(15507, null)}](${this.extension.publisherSponsorLink})`);
        addSeparator = true;
      }
    }
    if (addSeparator) {
      markdown.appendText(`
`);
    }
    const location2 = this.extension.resourceExtension?.location ?? (this.extension.local?.source === "resource" ? this.extension.local?.location : void 0);
    if (location2) {
      if (this.extension.isWorkspaceScoped && this.contextService.isInsideWorkspace(location2)) {
        markdown.appendMarkdown(localize(15515, null));
      } else {
        markdown.appendMarkdown(localize(15496, null));
      }
      markdown.appendText(`
`);
    }
    if (this.extension.description) {
      markdown.appendText(this.extension.description);
      markdown.appendText(`
`);
    }
    if (this.extension.publisherDomain?.verified) {
      const bgColor = this.themeService.getColorTheme().getColor(extensionVerifiedPublisherIconColor);
      const publisherVerifiedTooltip = localize(15501, null, `[${URI.parse(this.extension.publisherDomain.link).authority}](${this.extension.publisherDomain.link})`);
      markdown.appendMarkdown(`<span style="color:${bgColor ? Color.Format.CSS.formatHex(bgColor) : "#ffffff"};">$(${verifiedPublisherIcon.id})</span>&nbsp;${publisherVerifiedTooltip}`);
      markdown.appendText(`
`);
    }
    if (this.extension.outdated) {
      markdown.appendMarkdown(localize(15513, null));
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.latestVersion}_**&nbsp;</span>`);
      markdown.appendText(`
`);
    }
    const preReleaseMessage = ExtensionHoverWidget.getPreReleaseMessage(this.extension);
    const extensionRuntimeStatus = this.extensionsWorkbenchService.getExtensionRuntimeStatus(this.extension);
    const extensionFeaturesAccessData = this.extensionFeaturesManagementService.getAllAccessDataForExtension(new ExtensionIdentifier(this.extension.identifier.id));
    const extensionStatus = this.extensionStatusAction.status;
    const runtimeState = this.extension.runtimeState;
    const recommendationMessage = this.getRecommendationMessage(this.extension);
    if (extensionRuntimeStatus || extensionFeaturesAccessData.size || extensionStatus.length || runtimeState || recommendationMessage || preReleaseMessage) {
      markdown.appendMarkdown(`---`);
      markdown.appendText(`
`);
      if (extensionRuntimeStatus) {
        if (extensionRuntimeStatus.activationTimes) {
          const activationTime = extensionRuntimeStatus.activationTimes.codeLoadingTime + extensionRuntimeStatus.activationTimes.activateCallTime;
          markdown.appendMarkdown(`${localize(15487, null)}${extensionRuntimeStatus.activationTimes.activationReason.startup ? ` (${localize(15508, null)})` : ""}: \`${activationTime}ms\``);
          markdown.appendText(`
`);
        }
        if (extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.length) {
          const hasErrors = extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.some((message) => message.type === severity_default.Error);
          const hasWarnings = extensionRuntimeStatus.messages.some((message) => message.type === severity_default.Warning);
          const errorsLink = extensionRuntimeStatus.runtimeErrors.length ? `[${extensionRuntimeStatus.runtimeErrors.length === 1 ? localize(15511, null) : localize(15512, null, extensionRuntimeStatus.runtimeErrors.length)}](${createCommandUri("extension.open", this.extension.identifier.id, "features" /* Features */)})` : void 0;
          const messageLink = extensionRuntimeStatus.messages.length ? `[${extensionRuntimeStatus.messages.length === 1 ? localize(15497, null) : localize(15498, null, extensionRuntimeStatus.messages.length)}](${createCommandUri("extension.open", this.extension.identifier.id, "features" /* Features */)})` : void 0;
          markdown.appendMarkdown(`$(${hasErrors ? errorIcon.id : hasWarnings ? warningIcon2.id : infoIcon.id}) This extension has reported `);
          if (errorsLink && messageLink) {
            markdown.appendMarkdown(`${errorsLink} and ${messageLink}`);
          } else {
            markdown.appendMarkdown(`${errorsLink || messageLink}`);
          }
          markdown.appendText(`
`);
        }
      }
      if (extensionFeaturesAccessData.size) {
        const registry4 = Registry.as(Extensions11.ExtensionFeaturesRegistry);
        for (const [featureId, accessData] of extensionFeaturesAccessData) {
          if (accessData?.accessTimes.length) {
            const feature = registry4.getExtensionFeature(featureId);
            if (feature) {
              markdown.appendMarkdown(localize(15493, null, feature.label));
              markdown.appendMarkdown(`: [${localize(15510, null, accessData.accessTimes.length, feature.accessDataLabel ?? feature.label)}](${createCommandUri("extension.open", this.extension.identifier.id, "features" /* Features */)})`);
              markdown.appendText(`
`);
            }
          }
        }
      }
      for (const status2 of extensionStatus) {
        if (status2.icon) {
          markdown.appendMarkdown(`$(${status2.icon.id})&nbsp;`);
        }
        markdown.appendMarkdown(status2.message.value);
        markdown.appendText(`
`);
      }
      if (runtimeState) {
        markdown.appendMarkdown(`$(${infoIcon.id})&nbsp;`);
        markdown.appendMarkdown(`${runtimeState.reason}`);
        markdown.appendText(`
`);
      }
      if (preReleaseMessage) {
        const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(extensionPreReleaseIconColor);
        markdown.appendMarkdown(`<span style="color:${extensionPreReleaseIcon ? Color.Format.CSS.formatHex(extensionPreReleaseIcon) : "#ffffff"};">$(${preReleaseIcon.id})</span>&nbsp;${preReleaseMessage}`);
        markdown.appendText(`
`);
      }
      if (recommendationMessage) {
        markdown.appendMarkdown(recommendationMessage);
        markdown.appendText(`
`);
      }
    }
    return markdown;
  }
  getRecommendationMessage(extension) {
    if (extension.state === 1 /* Installed */) {
      return void 0;
    }
    if (extension.deprecationInfo) {
      return void 0;
    }
    const recommendation = this.extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()];
    if (!recommendation?.reasonText) {
      return void 0;
    }
    const bgColor = this.themeService.getColorTheme().getColor(extensionButtonProminentBackground);
    return `<span style="color:${bgColor ? Color.Format.CSS.formatHex(bgColor) : "#ffffff"};">$(${starEmptyIcon.id})</span>&nbsp;${recommendation.reasonText}`;
  }
  static getPreReleaseMessage(extension) {
    if (!extension.hasPreReleaseVersion) {
      return void 0;
    }
    if (extension.isBuiltin) {
      return void 0;
    }
    if (extension.isPreReleaseVersion) {
      return void 0;
    }
    if (extension.preRelease) {
      return void 0;
    }
    const preReleaseVersionLink = `[${localize(15506, null)}](${createCommandUri("workbench.extensions.action.showPreReleaseVersion", extension.identifier.id)})`;
    return localize(15494, null, preReleaseVersionLink);
  }
};

ExtensionHoverWidget = __decorateClass([
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IExtensionFeaturesManagementService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IExtensionRecommendationsService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IWorkspaceContextService)
], ExtensionHoverWidget);

var ExtensionStatusWidget = class extends ExtensionWidget {
  constructor(container3, extensionStatusAction, markdownRendererService) {
    super();
    this.container = container3;
    this.extensionStatusAction = extensionStatusAction;
    this.markdownRendererService = markdownRendererService;
    this.renderDisposables = this._register(new MutableDisposable());
    this._onDidRender = this._register(new Emitter());
    this.onDidRender = this._onDidRender.event;
    this.render();
    this._register(extensionStatusAction.onDidChangeStatus(() => this.render()));
  }
  render() {
    reset(this.container);
    this.renderDisposables.value = void 0;
    const disposables = new DisposableStore();
    this.renderDisposables.value = disposables;
    const extensionStatus = this.extensionStatusAction.status;
    if (extensionStatus.length) {
      const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
      for (let i2 = 0; i2 < extensionStatus.length; i2++) {
        const status2 = extensionStatus[i2];
        if (status2.icon) {
          markdown.appendMarkdown(`$(${status2.icon.id})&nbsp;`);
        }
        markdown.appendMarkdown(status2.message.value);
        if (i2 < extensionStatus.length - 1) {
          markdown.appendText(`
`);
        }
      }
      const rendered = disposables.add(this.markdownRendererService.render(markdown));
      append(this.container, rendered.element);
    }
    this._onDidRender.fire();
  }
};

ExtensionStatusWidget = __decorateClass([
  __decorateParam(2, IMarkdownRendererService)
], ExtensionStatusWidget);

var ExtensionRecommendationWidget = class extends ExtensionWidget {
  constructor(container3, extensionRecommendationsService, extensionIgnoredRecommendationsService) {
    super();
    this.container = container3;
    this.extensionRecommendationsService = extensionRecommendationsService;
    this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
    this._onDidRender = this._register(new Emitter());
    this.onDidRender = this._onDidRender.event;
    this.render();
    this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
  }
  render() {
    reset(this.container);
    const recommendationStatus = this.getRecommendationStatus();
    if (recommendationStatus) {
      if (recommendationStatus.icon) {
        append(this.container, $(`div${ThemeIcon.asCSSSelector(recommendationStatus.icon)}`));
      }
      append(this.container, $(`div.recommendation-text`, void 0, recommendationStatus.message));
    }
    this._onDidRender.fire();
  }
  getRecommendationStatus() {
    if (!this.extension || this.extension.deprecationInfo || this.extension.state === 1 /* Installed */) {
      return void 0;
    }
    const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
    if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
      const reasonText = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
      if (reasonText) {
        return { icon: starEmptyIcon, message: reasonText };
      }
    } else if (this.extensionIgnoredRecommendationsService.globalIgnoredRecommendations.indexOf(this.extension.identifier.id.toLowerCase()) !== -1) {
      return { icon: void 0, message: localize(15503, null) };
    }
    return void 0;
  }
};

ExtensionRecommendationWidget = __decorateClass([
  __decorateParam(1, IExtensionRecommendationsService),
  __decorateParam(2, IExtensionIgnoredRecommendationsService)
], ExtensionRecommendationWidget);

var extensionRatingIconColor = registerColor("extensionIcon.starForeground", { light: "#DF6100", dark: "#FF8E00", hcDark: "#FF8E00", hcLight: textLinkForeground }, localize(15490, null), false);

var extensionPreReleaseIconColor = registerColor("extensionIcon.preReleaseForeground", { dark: "#1d9271", light: "#1d9271", hcDark: "#1d9271", hcLight: textLinkForeground }, localize(15491, null), false);

var extensionSponsorIconColor = registerColor("extensionIcon.sponsorForeground", { light: "#B51E78", dark: "#D758B3", hcDark: null, hcLight: "#B51E78" }, localize(15489, null), false);

var extensionPrivateBadgeBackground = registerColor("extensionIcon.privateForeground", { dark: "#ffffff60", light: "#00000060", hcDark: "#ffffff60", hcLight: "#00000060" }, localize(15488, null));

registerThemingParticipant((theme, collector) => {
  const extensionRatingIcon = theme.getColor(extensionRatingIconColor);
  if (extensionRatingIcon) {
    collector.addRule(`.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`);
    collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(starFullIcon)} { color: ${extensionRatingIcon}; }`);
  }
  const extensionVerifiedPublisherIcon = theme.getColor(extensionVerifiedPublisherIconColor);
  if (extensionVerifiedPublisherIcon) {
    collector.addRule(`${ThemeIcon.asCSSSelector(verifiedPublisherIcon)} { color: ${extensionVerifiedPublisherIcon}; }`);
  }
  collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
  collector.addRule(`.extension-editor > .header > .details > .subtitle .sponsor ${ThemeIcon.asCSSSelector(sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
  const privateBadgeBackground = theme.getColor(extensionPrivateBadgeBackground);
  if (privateBadgeBackground) {
    collector.addRule(`.extension-private-badge { color: ${privateBadgeBackground}; }`);
  }
});
export { onClick2, ExtensionWidget, ExtensionIconWidget, InstallCountWidget, RatingsWidget, PublisherWidget, SponsorWidget, RecommendationWidget, PreReleaseBookmarkWidget, RemoteBadgeWidget, ExtensionIconBadge, ExtensionPackCountWidget, ExtensionKindIndicatorWidget, SyncIgnoredWidget, ExtensionRestartRequiredWidget, ExtensionRuntimeStatusWidget, ExtensionHoverWidget, ExtensionStatusWidget, ExtensionRecommendationWidget, extensionRatingIconColor, extensionPreReleaseIconColor, extensionSponsorIconColor, extensionPrivateBadgeBackground };
