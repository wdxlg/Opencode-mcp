// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/browser/postUpdateWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { isWeb } from "./module-0014.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { getUpdateInfoUrl, isMajorMinorVersionChange } from "./module-3540.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asTextOrError } from "./module-0946.mjs";
import { parseUpdateInfoInput } from "./module-3544.mjs";
import { localize } from "./module-0001.mjs";
import { ShowCurrentReleaseNotesActionId } from "./module-2777.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { IMarkdownRendererService, openLinkFromMarkdown } from "./module-0541.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1117.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IMeteredConnectionService } from "./module-1021.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/update/browser/postUpdateWidget.ts
var LAST_KNOWN_VERSION_KEY = "postUpdateWidget/lastKnownVersion";

var PostUpdateWidgetContribution = class extends Disposable {
  constructor(commandService, configurationService, hostService, hoverService, layoutService, markdownRendererService, meteredConnectionService, openerService, productService, requestService, storageService, telemetryService) {
    super();
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.hostService = hostService;
    this.hoverService = hoverService;
    this.layoutService = layoutService;
    this.markdownRendererService = markdownRendererService;
    this.meteredConnectionService = meteredConnectionService;
    this.openerService = openerService;
    this.productService = productService;
    this.requestService = requestService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    if (isWeb) {
      return;
    }
    this._register(CommandsRegistry.registerCommand("_update.showUpdateInfo", (_accessor, markdown) => this.showUpdateInfo(markdown)));
    void this.tryShowOnStartup();
  }
  static {
    this.idCounter = 0;
  }
  async tryShowOnStartup() {
    if (!await this.hostService.hadLastFocus()) {
      return;
    }
    if (this.meteredConnectionService.isConnectionMetered) {
      return;
    }
    if (!this.detectVersionChange()) {
      return;
    }
    if (this.configurationService.getValue("update.showPostInstallInfo") === false) {
      return;
    }
    await this.showUpdateInfo();
  }
  async showUpdateInfo(markdown) {
    const info = await this.getUpdateInfo(markdown);
    if (!info) {
      return;
    }
    const contentDisposables = new DisposableStore();
    const target = this.layoutService.mainContainer;
    const { clientWidth } = target;
    const maxWidth = 420;
    const x = Math.max(clientWidth - maxWidth - 80, 16);
    this.hoverService.showInstantHover({
      content: this.buildContent(info, contentDisposables),
      target: {
        targetElements: [target],
        x,
        y: 40,
        dispose: () => contentDisposables.dispose()
      },
      additionalClasses: ["post-update-widget-hover"],
      persistence: { sticky: true },
      appearance: { showPointer: false, compact: true, maxHeightRatio: 1 },
      trapFocus: true
    }, true);
  }
  async getUpdateInfo(input) {
    if (!input) {
      try {
        const url = getUpdateInfoUrl(this.productService.version);
        const context2 = await this.requestService.request({ url, callSite: "postUpdateWidget" }, CancellationToken.None);
        input = await asTextOrError(context2);
      } catch {
      }
    }
    if (!input) {
      return void 0;
    }
    let info = parseUpdateInfoInput(input);
    if (!info?.buttons?.length) {
      info = {
        ...info,
        buttons: [{
          label: localize(21462, null),
          commandId: ShowCurrentReleaseNotesActionId,
          args: [this.productService.version],
          style: "secondary"
        }]
      };
    }
    return info;
  }
  buildContent(info, disposables) {
    const { markdown, buttons, bannerImageUrl, badge, title, features } = info;
    const container3 = $(".post-update-widget");
    const titleId = `post-update-widget-title-${PostUpdateWidgetContribution.idCounter++}`;
    container3.setAttribute("role", "dialog");
    container3.setAttribute("aria-labelledby", titleId);
    const banner = append(container3, $(".banner"));
    banner.setAttribute("aria-hidden", "true");
    const safeBannerUrl = sanitizeBannerImageUrl(bannerImageUrl);
    if (safeBannerUrl) {
      banner.style.setProperty("background-image", `url(${JSON.stringify(safeBannerUrl)})`);
    }
    const closeButton = append(container3, $("button.banner-close"));
    closeButton.setAttribute("aria-label", localize(21461, null));
    const closeIcon3 = append(closeButton, $(ThemeIcon.asCSSSelector(Codicon.close)));
    closeIcon3.setAttribute("aria-hidden", "true");
    disposables.add(addDisposableListener(closeButton, "click", () => {
      this.hoverService.hideHover(true);
    }));
    const body = append(container3, $(".body"));
    if (badge) {
      const badgeEl = append(body, $(".badge"));
      badgeEl.textContent = badge;
    }
    const titleEl = append(body, $(".title"));
    titleEl.id = titleId;
    titleEl.textContent = title ?? localize(21463, null, this.productService.version);
    if (features?.length) {
      const list2 = append(body, $(".features"));
      list2.setAttribute("role", "list");
      for (const feature of features) {
        const row = append(list2, $(".feature"));
        row.setAttribute("role", "listitem");
        const iconEl = append(row, $(".feature-icon"));
        const iconId = feature.icon ?? Codicon.sparkle.id;
        const themeIcon = ThemeIcon.fromId(iconId);
        iconEl.classList.add(...ThemeIcon.asClassNameArray(themeIcon));
        iconEl.setAttribute("aria-hidden", "true");
        const text2 = append(row, $(".feature-text"));
        const featureTitle = append(text2, $(".feature-title"));
        featureTitle.textContent = feature.title;
        const featureDescription = append(text2, $(".feature-description"));
        const rendered = disposables.add(this.markdownRendererService.render(
          new MarkdownString(feature.description, {
            isTrusted: true,
            supportThemeIcons: true
          }),
          {
            actionHandler: (link2, mdStr) => {
              openLinkFromMarkdown(this.openerService, link2, mdStr.isTrusted);
              this.hoverService.hideHover(true);
            }
          }
        ));
        featureDescription.appendChild(rendered.element);
      }
    } else if (markdown) {
      const markdownContainer = append(body, $(".update-markdown"));
      const rendered = disposables.add(this.markdownRendererService.render(
        new MarkdownString(markdown, {
          isTrusted: true,
          supportHtml: true,
          supportThemeIcons: true
        }),
        {
          actionHandler: (link2, mdStr) => {
            openLinkFromMarkdown(this.openerService, link2, mdStr.isTrusted);
            this.hoverService.hideHover(true);
          }
        }
      ));
      markdownContainer.appendChild(rendered.element);
    }
    if (buttons?.length) {
      const buttonBar = append(body, $(".button-bar"));
      const isSingleButton = buttons.length === 1;
      let seenSecondary = false;
      for (const { label: label3, style, commandId, args: args2 } of buttons) {
        const button = append(buttonBar, $("button"));
        button.textContent = label3;
        if (style === "secondary") {
          button.classList.add("update-button-secondary");
          if (!seenSecondary && buttons.length > 1) {
            button.classList.add("update-button-leading-secondary");
            seenSecondary = true;
          }
        } else {
          button.classList.add("update-button-primary");
        }
        if (isSingleButton) {
          button.classList.add("update-button-full-width");
        }
        disposables.add(addDisposableListener(button, "click", () => {
          this.telemetryService.publicLog2(
            "workbenchActionExecuted",
            { id: commandId, from: "postUpdateWidget" }
          );
          void this.commandService.executeCommand(commandId, ...args2 ?? []);
          this.hoverService.hideHover(true);
        }));
      }
    }
    return container3;
  }
  detectVersionChange() {
    let from;
    try {
      from = this.storageService.getObject(LAST_KNOWN_VERSION_KEY, -1 /* APPLICATION */);
    } catch {
    }
    const to = {
      version: this.productService.version,
      commit: this.productService.commit,
      timestamp: Date.now()
    };
    if (from?.commit === to.commit) {
      return false;
    }
    this.storageService.store(LAST_KNOWN_VERSION_KEY, JSON.stringify(to), -1 /* APPLICATION */, 1 /* MACHINE */);
    if (from) {
      return isMajorMinorVersionChange(from.version, to.version);
    }
    return false;
  }
};

PostUpdateWidgetContribution = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, ILayoutService),
  __decorateParam(5, IMarkdownRendererService),
  __decorateParam(6, IMeteredConnectionService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IProductService),
  __decorateParam(9, IRequestService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, ITelemetryService)
], PostUpdateWidgetContribution);

function sanitizeBannerImageUrl(value2) {
  if (!value2) {
    return void 0;
  }
  try {
    const uri5 = URI.parse(value2, true);
    if (uri5.scheme === "https") {
      return uri5.toString(true);
    }
    if (uri5.scheme === "data" && /^image\//i.test(uri5.path)) {
      return uri5.toString(true);
    }
  } catch {
  }
  return void 0;
}
export { sanitizeBannerImageUrl, LAST_KNOWN_VERSION_KEY, PostUpdateWidgetContribution };
