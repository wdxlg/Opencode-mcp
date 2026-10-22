// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpServerWidgets.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, finalHandler, reset } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { mcpLicenseIcon, mcpServerIcon2, mcpServerRemoteIcon, mcpServerWorkspaceIcon, mcpStarredIcon } from "./module-2879.mjs";
import { isDark } from "./module-0247.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { renderIcon } from "./module-0467.mjs";
import { verifiedPublisherIcon } from "./module-2225.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ExtensionIconBadge } from "./module-2255.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { registerColor } from "./module-0226.mjs";
import { textLinkForeground } from "./module-0227.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpServerWidgets.ts
var McpServerWidget = class extends Disposable {
  constructor() {
    super(...arguments);
    this._mcpServer = null;
  }
  get mcpServer() {
    return this._mcpServer;
  }
  set mcpServer(mcpServer) {
    this._mcpServer = mcpServer;
    this.update();
  }
  update() {
    this.render();
  }
};

function onClick3(element, callback) {
  const disposables = new DisposableStore();
  disposables.add(addDisposableListener(element, EventType.CLICK, finalHandler(callback)));
  disposables.add(addDisposableListener(element, EventType.KEY_UP, (e4) => {
    const keyboardEvent = new StandardKeyboardEvent(e4);
    if (keyboardEvent.equals(10 /* Space */) || keyboardEvent.equals(3 /* Enter */)) {
      e4.preventDefault();
      e4.stopPropagation();
      callback();
    }
  }));
  return disposables;
}

var McpServerIconWidget = class extends McpServerWidget {
  constructor(container2, themeService) {
    super();
    this.themeService = themeService;
    this.iconLoadingDisposable = this._register(new MutableDisposable());
    this.element = append(container2, $(".extension-icon"));
    this.iconElement = append(this.element, $("img.icon", { alt: "" }));
    this.iconElement.style.display = "none";
    this.codiconIconElement = append(this.element, $(ThemeIcon.asCSSSelector(mcpServerIcon2)));
    this.codiconIconElement.style.display = "none";
    this.render();
    this._register(toDisposable(() => this.clear()));
    this._register(this.themeService.onDidColorThemeChange(() => this.render()));
  }
  clear() {
    this.iconUrl = void 0;
    this.iconElement.src = "";
    this.iconElement.style.display = "none";
    this.codiconIconElement.style.display = "none";
    this.codiconIconElement.className = ThemeIcon.asClassName(mcpServerIcon2);
    this.iconLoadingDisposable.clear();
  }
  render() {
    if (!this.mcpServer) {
      this.clear();
      return;
    }
    if (this.mcpServer.icon) {
      const type = this.themeService.getColorTheme().type;
      const iconUrl = isDark(type) ? this.mcpServer.icon.dark : this.mcpServer.icon.light;
      if (this.iconUrl !== iconUrl) {
        this.iconElement.style.display = "inherit";
        this.codiconIconElement.style.display = "none";
        this.iconUrl = iconUrl;
        this.iconLoadingDisposable.value = addDisposableListener(this.iconElement, "error", () => {
          this.iconElement.style.display = "none";
          this.codiconIconElement.style.display = "inherit";
        }, { once: true });
        this.iconElement.src = this.iconUrl;
        if (!this.iconElement.complete) {
          this.iconElement.style.visibility = "hidden";
          this.iconElement.onload = () => this.iconElement.style.visibility = "inherit";
        } else {
          this.iconElement.style.visibility = "inherit";
        }
      }
    } else {
      this.iconUrl = void 0;
      this.iconElement.style.display = "none";
      this.iconElement.src = "";
      this.codiconIconElement.className = this.mcpServer.codicon ? `codicon ${this.mcpServer.codicon}` : ThemeIcon.asClassName(mcpServerIcon2);
      this.codiconIconElement.style.display = "inherit";
      this.iconLoadingDisposable.clear();
    }
  }
};

McpServerIconWidget = __decorateClass([
  __decorateParam(1, IThemeService)
], McpServerIconWidget);

var PublisherWidget2 = class extends McpServerWidget {
  constructor(container2, small, hoverService, openerService) {
    super();
    this.container = container2;
    this.small = small;
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
    if (!this.mcpServer?.publisherDisplayName) {
      return;
    }
    this.element = append(this.container, $(".publisher"));
    const publisherDisplayName = $(".publisher-name.ellipsis");
    publisherDisplayName.textContent = this.mcpServer.publisherDisplayName;
    const verifiedPublisher = $(".verified-publisher");
    append(verifiedPublisher, $("span.extension-verified-publisher.clickable"), renderIcon(verifiedPublisherIcon));
    if (this.small) {
      if (this.mcpServer.gallery?.publisherDomain?.verified) {
        append(this.element, verifiedPublisher);
      }
      append(this.element, publisherDisplayName);
    } else {
      this.element.classList.toggle("clickable", !!this.mcpServer.gallery?.publisherUrl);
      this.element.setAttribute("role", "button");
      this.element.tabIndex = 0;
      this.containerHover = this.disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.element, localize(17088, null, this.mcpServer.publisherDisplayName)));
      append(this.element, publisherDisplayName);
      if (this.mcpServer.gallery?.publisherDomain?.verified) {
        append(this.element, verifiedPublisher);
        const publisherDomainLink = URI.parse(this.mcpServer.gallery?.publisherDomain.link);
        verifiedPublisher.tabIndex = 0;
        verifiedPublisher.setAttribute("role", "button");
        this.containerHover.update(localize(17090, null, this.mcpServer.gallery?.publisherDomain.link));
        verifiedPublisher.setAttribute("role", "link");
        append(verifiedPublisher, $("span.extension-verified-publisher-domain", void 0, publisherDomainLink.authority.startsWith("www.") ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority));
        this.disposables.add(onClick3(verifiedPublisher, () => this.openerService.open(publisherDomainLink)));
      }
      if (this.mcpServer.gallery?.publisherUrl) {
        this.disposables.add(onClick3(this.element, () => this.openerService.open(this.mcpServer?.gallery?.publisherUrl)));
      }
    }
  }
};

PublisherWidget2 = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IOpenerService)
], PublisherWidget2);

var StarredWidget = class _StarredWidget extends McpServerWidget {
  constructor(container2, small) {
    super();
    this.container = container2;
    this.small = small;
    this.disposables = this._register(new DisposableStore());
    this.container.classList.add("extension-ratings");
    if (this.small) {
      container2.classList.add("small");
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
    if (!this.mcpServer?.starsCount) {
      return;
    }
    if (this.small && this.mcpServer.installState !== 3 /* Uninstalled */) {
      return;
    }
    const parent = this.small ? this.container : append(this.container, $("span.rating", { tabIndex: 0 }));
    append(parent, $("span" + ThemeIcon.asCSSSelector(mcpStarredIcon)));
    const ratingCountElement = append(parent, $("span.count", void 0, _StarredWidget.getCountLabel(this.mcpServer.starsCount)));
    if (!this.small) {
      ratingCountElement.style.paddingLeft = "3px";
    }
  }
  static getCountLabel(starsCount) {
    if (starsCount > 1e6) {
      return `${Math.floor(starsCount / 1e5) / 10}M`;
    } else if (starsCount > 1e3) {
      return `${Math.floor(starsCount / 1e3)}K`;
    } else {
      return String(starsCount);
    }
  }
};

var LicenseWidget = class extends McpServerWidget {
  constructor(container2) {
    super();
    this.container = container2;
    this.disposables = this._register(new DisposableStore());
    this.container.classList.add("license");
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.container.innerText = "";
    this.disposables.clear();
  }
  render() {
    this.clear();
    if (!this.mcpServer?.license) {
      return;
    }
    const parent = append(this.container, $("span.license", { tabIndex: 0 }));
    append(parent, $("span" + ThemeIcon.asCSSSelector(mcpLicenseIcon)));
    const licenseElement = append(parent, $("span", void 0, this.mcpServer.license));
    licenseElement.style.paddingLeft = "3px";
  }
};

var McpServerHoverWidget = class extends McpServerWidget {
  constructor(options3, mcpServerStatusAction, hoverService, configurationService) {
    super();
    this.options = options3;
    this.mcpServerStatusAction = mcpServerStatusAction;
    this.hoverService = hoverService;
    this.configurationService = configurationService;
    this.hover = this._register(new MutableDisposable());
  }
  render() {
    this.hover.value = void 0;
    if (this.mcpServer) {
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
          markdown: () => Promise.resolve(this.getHoverMarkdown()),
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
    if (!this.mcpServer) {
      return void 0;
    }
    const markdown = new MarkdownString("", { isTrusted: false, supportThemeIcons: true });
    markdown.appendMarkdown(`**${escapeMarkdownSyntaxTokens(this.mcpServer.label)}**`);
    markdown.appendText(`
`);
    let addSeparator = false;
    if (this.mcpServer.local?.scope === "workspace" /* Workspace */) {
      markdown.appendMarkdown(`$(${mcpServerWorkspaceIcon.id})&nbsp;`);
      markdown.appendMarkdown(localize(17091, null));
      addSeparator = true;
    }
    if (this.mcpServer.local?.scope === "remoteUser" /* RemoteUser */) {
      markdown.appendMarkdown(`$(${mcpServerRemoteIcon.id})&nbsp;`);
      markdown.appendMarkdown(localize(17089, null));
      addSeparator = true;
    }
    if (this.mcpServer.installState === 1 /* Installed */) {
      if (this.mcpServer.starsCount) {
        if (addSeparator) {
          markdown.appendText(`  |  `);
        }
        const starsCountLabel = StarredWidget.getCountLabel(this.mcpServer.starsCount);
        markdown.appendMarkdown(`$(${mcpStarredIcon.id}) ${starsCountLabel}`);
        addSeparator = true;
      }
    }
    if (addSeparator) {
      markdown.appendText(`
`);
    }
    if (this.mcpServer.description) {
      markdown.appendMarkdown(escapeMarkdownSyntaxTokens(this.mcpServer.description));
    }
    const extensionStatus = this.mcpServerStatusAction.status;
    if (extensionStatus.length) {
      markdown.appendMarkdown(`---`);
      markdown.appendText(`
`);
      for (const status2 of extensionStatus) {
        if (status2.icon) {
          markdown.appendMarkdown(`$(${status2.icon.id})&nbsp;`);
        }
        markdown.appendMarkdown(status2.message.value);
        markdown.appendText(`
`);
      }
    }
    return markdown;
  }
};

McpServerHoverWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IConfigurationService)
], McpServerHoverWidget);

var McpServerScopeBadgeWidget = class extends McpServerWidget {
  constructor(container2, instantiationService) {
    super();
    this.container = container2;
    this.instantiationService = instantiationService;
    this.badge = this._register(new MutableDisposable());
    this.element = append(this.container, $(""));
    this.render();
    this._register(toDisposable(() => this.clear()));
  }
  clear() {
    this.badge.value?.element.remove();
    this.badge.clear();
  }
  render() {
    this.clear();
    const scope = this.mcpServer?.local?.scope;
    if (!scope || scope === "user" /* User */) {
      return;
    }
    let icon2;
    switch (scope) {
      case "workspace" /* Workspace */: {
        icon2 = mcpServerWorkspaceIcon;
        break;
      }
      case "remoteUser" /* RemoteUser */: {
        icon2 = mcpServerRemoteIcon;
        break;
      }
    }
    this.badge.value = this.instantiationService.createInstance(ExtensionIconBadge, icon2, void 0);
    append(this.element, this.badge.value.element);
  }
};

McpServerScopeBadgeWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], McpServerScopeBadgeWidget);

var McpServerStatusWidget = class extends McpServerWidget {
  constructor(container2, extensionStatusAction, markdownRendererService) {
    super();
    this.container = container2;
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

McpServerStatusWidget = __decorateClass([
  __decorateParam(2, IMarkdownRendererService)
], McpServerStatusWidget);

var mcpStarredIconColor = registerColor("mcpIcon.starForeground", { light: "#DF6100", dark: "#FF8E00", hcDark: "#FF8E00", hcLight: textLinkForeground }, localize(17087, null), false);

registerThemingParticipant((theme, collector) => {
  const mcpStarredIconColorValue = theme.getColor(mcpStarredIconColor);
  if (mcpStarredIconColorValue) {
    collector.addRule(`.extension-ratings .codicon-mcp-server-starred { color: ${mcpStarredIconColorValue}; }`);
    collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(mcpStarredIcon)} { color: ${mcpStarredIconColorValue}; }`);
  }
});
export { onClick3, McpServerWidget, McpServerIconWidget, PublisherWidget2, StarredWidget, LicenseWidget, McpServerHoverWidget, McpServerScopeBadgeWidget, McpServerStatusWidget, mcpStarredIconColor };
