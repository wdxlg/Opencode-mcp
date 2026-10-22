// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsList.ts
import { ExtensionHoverWidget, ExtensionIconWidget, ExtensionKindIndicatorWidget, ExtensionPackCountWidget, ExtensionRestartRequiredWidget, ExtensionRuntimeStatusWidget, InstallCountWidget, PreReleaseBookmarkWidget, PublisherWidget, RatingsWidget, RecommendationWidget, RemoteBadgeWidget, SyncIgnoredWidget } from "./module-2280.mjs";
import { $, append } from "./module-0075.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ButtonWithDropDownExtensionAction, ButtonWithDropdownExtensionActionViewItem, ClearLanguageAction, DropDownExtensionAction, ExtensionStatusAction, ExtensionStatusLabelAction, InstallDropdownAction, InstallingLabelAction, LocalInstallAction, ManageExtensionAction2, MigrateDeprecatedExtensionAction, RemoteInstallAction, SetLanguageAction, UpdateAction, WebInstallAction } from "./module-1877.mjs";
import { ExtensionContainers, IExtensionsWorkbenchService } from "./module-1022.mjs";
import { combinedDisposable, dispose } from "./module-0012.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1046.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { extensionVerifiedPublisherIconColor, verifiedPublisherIcon } from "./module-2250.mjs";
import { WORKBENCH_BACKGROUND } from "./module-0912.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsList.ts
var EXTENSION_LIST_ELEMENT_HEIGHT = 72;

var Delegate3 = class {
  getHeight() {
    return EXTENSION_LIST_ELEMENT_HEIGHT;
  }
  getTemplateId() {
    return "extension";
  }
};

var Renderer = class {
  constructor(extensionViewState, options3, instantiationService, notificationService, extensionService, extensionsWorkbenchService, extensionEnablementService, contextMenuService) {
    this.extensionViewState = extensionViewState;
    this.options = options3;
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.contextMenuService = contextMenuService;
  }
  get templateId() {
    return "extension";
  }
  renderTemplate(root) {
    const recommendationWidget = this.instantiationService.createInstance(RecommendationWidget, append(root, $(".extension-bookmark-container")));
    const preReleaseWidget = this.instantiationService.createInstance(PreReleaseBookmarkWidget, append(root, $(".extension-bookmark-container")));
    const element = append(root, $(".extension-list-item"));
    const iconContainer = append(element, $(".icon-container"));
    const iconWidget = this.instantiationService.createInstance(ExtensionIconWidget, iconContainer);
    const iconRemoteBadgeWidget = this.instantiationService.createInstance(RemoteBadgeWidget, iconContainer, false);
    const extensionPackBadgeWidget = this.instantiationService.createInstance(ExtensionPackCountWidget, iconContainer);
    const details = append(element, $(".details"));
    const headerContainer = append(details, $(".header-container"));
    const header2 = append(headerContainer, $(".header"));
    const name = append(header2, $("span.name"));
    const restartRequired = append(header2, $("span.restart-required"));
    const installCount = append(header2, $("span.install-count"));
    const ratings = append(header2, $("span.ratings"));
    const syncIgnore = append(header2, $("span.sync-ignored"));
    const extensionKindIndicator = append(header2, $("span"));
    const activationStatus = append(header2, $("span.activation-status"));
    const description = append(details, $(".description.ellipsis"));
    const footer = append(details, $(".footer"));
    const publisherWidget = this.instantiationService.createInstance(PublisherWidget, append(footer, $(".publisher-container")), true);
    const actionbar = new ActionBar(footer, {
      actionViewItemProvider: (action, options3) => {
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
        if (action instanceof DropDownExtensionAction) {
          return action.createActionViewItem(options3);
        }
        return void 0;
      },
      focusOnlyEnabledItems: true
    });
    actionbar.setFocusable(false);
    const actionBarListener = actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
    const extensionStatusIconAction = this.instantiationService.createInstance(ExtensionStatusAction);
    const actions = [
      this.instantiationService.createInstance(ExtensionStatusLabelAction),
      this.instantiationService.createInstance(MigrateDeprecatedExtensionAction, true),
      this.instantiationService.createInstance(UpdateAction, false),
      this.instantiationService.createInstance(InstallDropdownAction),
      this.instantiationService.createInstance(InstallingLabelAction),
      this.instantiationService.createInstance(SetLanguageAction),
      this.instantiationService.createInstance(ClearLanguageAction),
      this.instantiationService.createInstance(RemoteInstallAction, false),
      this.instantiationService.createInstance(LocalInstallAction),
      this.instantiationService.createInstance(WebInstallAction),
      extensionStatusIconAction,
      this.instantiationService.createInstance(ManageExtensionAction2)
    ];
    const extensionHoverWidget = this.instantiationService.createInstance(ExtensionHoverWidget, { target: root, position: this.options.hoverOptions.position }, extensionStatusIconAction);
    const widgets2 = [
      iconWidget,
      recommendationWidget,
      preReleaseWidget,
      iconRemoteBadgeWidget,
      extensionPackBadgeWidget,
      publisherWidget,
      extensionHoverWidget,
      this.instantiationService.createInstance(SyncIgnoredWidget, syncIgnore),
      this.instantiationService.createInstance(ExtensionRestartRequiredWidget, restartRequired),
      this.instantiationService.createInstance(ExtensionRuntimeStatusWidget, this.extensionViewState, activationStatus),
      this.instantiationService.createInstance(InstallCountWidget, installCount, true),
      this.instantiationService.createInstance(RatingsWidget, ratings, true),
      this.instantiationService.createInstance(ExtensionKindIndicatorWidget, extensionKindIndicator, true)
    ];
    const extensionContainers = this.instantiationService.createInstance(ExtensionContainers, [...actions, ...widgets2]);
    actionbar.push(actions, { icon: true, label: true });
    const disposable = combinedDisposable(...actions, ...widgets2, actionbar, actionBarListener, extensionContainers);
    return {
      root,
      element,
      name,
      installCount,
      ratings,
      description,
      disposables: [disposable],
      actionbar,
      extensionDisposables: [],
      set extension(extension) {
        extensionContainers.extension = extension;
      }
    };
  }
  renderPlaceholder(index2, data) {
    data.element.classList.add("loading");
    data.root.removeAttribute("aria-label");
    data.root.removeAttribute("data-extension-id");
    data.extensionDisposables = dispose(data.extensionDisposables);
    data.name.textContent = "";
    data.description.textContent = "";
    data.installCount.style.display = "none";
    data.ratings.style.display = "none";
    data.extension = null;
  }
  renderElement(extension, index2, data) {
    data.element.classList.remove("loading");
    data.root.setAttribute("data-extension-id", extension.identifier.id);
    if (extension.state !== 3 /* Uninstalled */ && !extension.server) {
      extension = this.extensionsWorkbenchService.local.filter((e) => e.server === extension.server && areSameExtensions(e.identifier, extension.identifier))[0] || extension;
    }
    data.extensionDisposables = dispose(data.extensionDisposables);
    const updateEnablement = () => {
      const disabled = extension.state === 1 /* Installed */ && !!extension.local && !this.extensionEnablementService.isEnabled(extension.local);
      const deprecated = !!extension.deprecationInfo;
      data.element.classList.toggle("deprecated", deprecated);
      data.root.classList.toggle("disabled", disabled);
    };
    updateEnablement();
    this.extensionService.onDidChangeExtensions(() => updateEnablement(), this, data.extensionDisposables);
    data.name.textContent = extension.displayName;
    data.description.textContent = extension.description;
    data.installCount.style.display = "";
    data.ratings.style.display = "";
    data.extension = extension;
    if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
      data.description.textContent = extension.gallery.properties.localizedLanguages.map((name) => name[0].toLocaleUpperCase() + name.slice(1)).join(", ");
    }
    this.extensionViewState.onFocus((e) => {
      if (areSameExtensions(extension.identifier, e.identifier)) {
        data.actionbar.setFocusable(true);
      }
    }, this, data.extensionDisposables);
    this.extensionViewState.onBlur((e) => {
      if (areSameExtensions(extension.identifier, e.identifier)) {
        data.actionbar.setFocusable(false);
      }
    }, this, data.extensionDisposables);
  }
  disposeElement(extension, index2, data) {
    data.extensionDisposables = dispose(data.extensionDisposables);
  }
  disposeTemplate(data) {
    data.extensionDisposables = dispose(data.extensionDisposables);
    data.disposables = dispose(data.disposables);
  }
};

Renderer = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IWorkbenchExtensionEnablementService),
  __decorateParam(7, IContextMenuService)
], Renderer);

registerThemingParticipant((theme, collector) => {
  const verifiedPublisherIconColor = theme.getColor(extensionVerifiedPublisherIconColor);
  if (verifiedPublisherIconColor) {
    const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(0.5).makeOpaque(WORKBENCH_BACKGROUND(theme));
    collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled:not(.selected) .author .verified-publisher ${ThemeIcon.asCSSSelector(verifiedPublisherIcon)} { color: ${disabledVerifiedPublisherIconColor}; }`);
  }
});
export { EXTENSION_LIST_ELEMENT_HEIGHT, Delegate3, Renderer };
