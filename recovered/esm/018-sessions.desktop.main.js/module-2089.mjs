// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/implicitContextAttachment.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { isLocation } from "./module-0164.mjs";
import { isStringImplicitContextValue, resolveChatContextIcon } from "./module-0980.mjs";
import { $, EventHelper, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { Button } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { isDark } from "./module-0247.mjs";
import { BrowserViewUri } from "./module-1487.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatContextService } from "./module-1453.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/implicitContextAttachment.ts
var ImplicitContextAttachmentWidget = class extends Disposable {
  constructor(widgetRef, isAttachmentAlreadyAttached, attachment, resourceLabels, attachmentModel, domNode, contextKeyService, contextMenuService, labelService, menuService, fileService, languageService, modelService, hoverService, configService, chatContextService, browserViewService, themeService) {
    super();
    this.widgetRef = widgetRef;
    this.isAttachmentAlreadyAttached = isAttachmentAlreadyAttached;
    this.attachment = attachment;
    this.resourceLabels = resourceLabels;
    this.attachmentModel = attachmentModel;
    this.domNode = domNode;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.fileService = fileService;
    this.languageService = languageService;
    this.modelService = modelService;
    this.hoverService = hoverService;
    this.configService = configService;
    this.chatContextService = chatContextService;
    this.browserViewService = browserViewService;
    this.themeService = themeService;
    this.renderDisposables = this._register(new DisposableStore());
    this.renderedCount = 0;
    this.render();
    this._register(this.themeService.onDidColorThemeChange(() => {
      if (this._hasDualPathIcon()) {
        this.render();
      }
    }));
  }
  _hasDualPathIcon() {
    return this.attachment.values.some((context2) => {
      const iconPath = context2.iconPath;
      return !!iconPath && !ThemeIcon.isThemeIcon(iconPath) && !URI.isUri(iconPath);
    });
  }
  render() {
    this.renderDisposables.clear();
    this.renderedCount = 0;
    for (const context2 of this.attachment.values) {
      const targetUri = context2.uri;
      const targetRange = isLocation(context2.value) ? context2.value.range : void 0;
      const targetHandle = isStringImplicitContextValue(context2.value) ? context2.value.handle : void 0;
      const currentlyAttached = this.isAttachmentAlreadyAttached(targetUri, targetRange, targetHandle);
      if (!currentlyAttached) {
        this.renderMainContext(context2, context2.isSelection);
        this.renderedCount++;
      }
    }
  }
  get hasRenderedContexts() {
    return this.renderedCount > 0;
  }
  renderMainContext(context2, isSelection) {
    const contextNode = $(".chat-attached-context-attachment.show-file-icons.implicit");
    this.domNode.appendChild(contextNode);
    contextNode.tabIndex = 0;
    contextNode.classList.toggle("disabled", !context2.enabled);
    const file = context2.uri;
    const attachmentTypeName = file?.scheme === Schemas.vscodeNotebookCell ? localize(9916, null) : localize(9925, null);
    const contextLabel = context2.name ?? (file ? basename2(file) : localize(9926, null));
    const isSuggestedEnabled = this.configService.getValue("chat.implicitContext.suggestedContext");
    if (isSuggestedEnabled) {
      if (!isSelection) {
        const buttonMsg = context2.enabled ? localize(9922, null, attachmentTypeName, contextLabel) : localize(9915, null, contextLabel);
        const toggleButton = this.renderDisposables.add(new Button(contextNode, { supportIcons: true, title: buttonMsg }));
        toggleButton.icon = context2.enabled ? Codicon.closeCompact : Codicon.addCompact;
        this.renderDisposables.add(toggleButton.onDidClick(async (e4) => {
          e4.stopPropagation();
          e4.preventDefault();
          if (!context2.enabled) {
            await this.convertToRegularAttachment(context2);
          }
          context2.enabled = false;
        }));
      } else {
        const pinButtonMsg = localize(9929, null);
        const pinButton = this.renderDisposables.add(new Button(contextNode, { supportIcons: true, title: pinButtonMsg }));
        pinButton.icon = Codicon.pinned;
        this.renderDisposables.add(pinButton.onDidClick(async (e4) => {
          e4.stopPropagation();
          e4.preventDefault();
          await this.pinSelection();
        }));
      }
      if (!context2.enabled && isSelection) {
        contextNode.classList.remove("disabled");
      }
      this.renderDisposables.add(addDisposableListener(contextNode, EventType.CLICK, async (e4) => {
        if (!context2.enabled && !isSelection) {
          await this.convertToRegularAttachment(context2);
        }
      }));
      this.renderDisposables.add(addDisposableListener(contextNode, EventType.KEY_DOWN, async (e4) => {
        const event = new StandardKeyboardEvent(e4);
        if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
          if (!context2.enabled && !isSelection) {
            e4.preventDefault();
            e4.stopPropagation();
            await this.convertToRegularAttachment(context2);
          }
        }
      }));
    } else {
      const buttonMsg = context2.enabled ? localize(9921, null, attachmentTypeName) : localize(9923, null, attachmentTypeName);
      const toggleButton = this.renderDisposables.add(new Button(contextNode, { supportIcons: true, title: buttonMsg }));
      toggleButton.icon = context2.enabled ? Codicon.eye : Codicon.eyeClosed;
      this.renderDisposables.add(toggleButton.onDidClick((e4) => {
        e4.stopPropagation();
        context2.enabled = !context2.enabled;
      }));
    }
    const label3 = this.renderDisposables.add(this.resourceLabels.create(contextNode, { supportIcons: true }));
    let title;
    let markdownTooltip;
    if (isStringImplicitContextValue(context2.value)) {
      markdownTooltip = context2.value.tooltip;
      title = this.renderString(label3, context2.name, context2.iconPath, context2.value.resourceUri, markdownTooltip, localize(9928, null));
      contextNode.ariaLabel = localize(9920, null, context2.name);
    } else {
      title = this.renderResource(context2.value, context2.isSelection, context2.enabled, label3, contextNode);
    }
    if (markdownTooltip || title) {
      this.renderDisposables.add(this.hoverService.setupDelayedHover(contextNode, {
        content: markdownTooltip ?? title,
        appearance: { showPointer: true }
      }));
    }
    const scopedContextKeyService = this.renderDisposables.add(this.contextKeyService.createScoped(contextNode));
    const resourceContextKey = this.renderDisposables.add(new ResourceContextKey(scopedContextKeyService, this.fileService, this.languageService, this.modelService));
    resourceContextKey.set(file);
    this.renderDisposables.add(addDisposableListener(contextNode, EventType.CONTEXT_MENU, async (domEvent) => {
      const event = new StandardMouseEvent(getWindow(domEvent), domEvent);
      EventHelper.stop(domEvent, true);
      this.contextMenuService.showContextMenu({
        contextKeyService: scopedContextKeyService,
        getAnchor: () => event,
        getActions: () => {
          const menu = this.menuService.getMenuActions(MenuId.ChatInputResourceAttachmentContext, scopedContextKeyService, { arg: file });
          return getFlatContextMenuActions(menu);
        }
      });
    }));
  }
  renderString(resourceLabel, name, iconPath, resourceUri, markdownTooltip, defaultTitle) {
    const title = markdownTooltip ? void 0 : defaultTitle;
    if (iconPath && ThemeIcon.isThemeIcon(iconPath) && (ThemeIcon.isFile(iconPath) || ThemeIcon.isFolder(iconPath)) && resourceUri) {
      const fileKind = ThemeIcon.isFolder(iconPath) ? 1 /* FOLDER */ : 0 /* FILE */;
      const iconClasses = getIconClasses(this.modelService, this.languageService, resourceUri, fileKind);
      resourceLabel.setLabel(name, void 0, { extraClasses: iconClasses, title });
    } else {
      const resolvedIcon = iconPath ? resolveChatContextIcon(iconPath, isDark(this.themeService.getColorTheme().type)) : void 0;
      resourceLabel.setLabel(name, void 0, { iconPath: resolvedIcon, title });
    }
    return title;
  }
  renderResource(attachmentValue, isSelection, enabled, label3, contextNode) {
    const file = URI.isUri(attachmentValue) ? attachmentValue : attachmentValue.uri;
    const range2 = URI.isUri(attachmentValue) || !isSelection ? void 0 : attachmentValue.range;
    if (file.scheme === Schemas.vscodeBrowser) {
      return this.renderBrowserResource(file, label3, contextNode);
    }
    const attachmentTypeName = file.scheme === Schemas.vscodeNotebookCell ? localize(9916, null) : localize(9925, null);
    const fileBasename = basename2(file);
    const fileDirname = dirname2(file);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const ariaLabel = range2 ? localize(9919, null, attachmentTypeName, friendlyName, range2.startLineNumber, range2.endLineNumber) : localize(9918, null, attachmentTypeName, friendlyName);
    const uriLabel = this.labelService.getUriLabel(file, { relative: true });
    const currentFile = localize(9927, null, attachmentTypeName);
    const inactive = localize(9924, null, attachmentTypeName);
    const currentFileHint = enabled || isSelection ? currentFile : inactive;
    const title = `${currentFileHint}
${uriLabel}`;
    label3.setFile(file, {
      fileKind: 0 /* FILE */,
      hidePath: true,
      range: range2,
      title
    });
    contextNode.ariaLabel = ariaLabel;
    return title;
  }
  renderBrowserResource(browserUri, label3, contextNode) {
    const id2 = BrowserViewUri.getId(browserUri);
    const input = id2 && this.browserViewService.getKnownBrowserViews().get(id2);
    if (!input) {
      return void 0;
    }
    const update = () => {
      label3.setLabel(input.getName(), void 0, { iconPath: Codicon.globe });
      contextNode.ariaLabel = localize(9917, null, input.getName());
    };
    update();
    this.renderDisposables.add(input.onDidChangeLabel(() => update()));
    return input.getTitle();
  }
  async convertToRegularAttachment(attachment) {
    if (!attachment.value) {
      return;
    }
    if (isStringImplicitContextValue(attachment.value)) {
      if (attachment.value.value === void 0) {
        await this.chatContextService.resolveChatContext(attachment.value);
      }
      const context2 = {
        kind: "string",
        value: attachment.value.value,
        id: attachment.id,
        name: attachment.name,
        iconPath: attachment.value.iconPath,
        modelDescription: attachment.modelDescription,
        uri: attachment.value.uri,
        resourceUri: attachment.value.resourceUri,
        tooltip: attachment.value.tooltip,
        commandId: attachment.value.commandId,
        handle: attachment.value.handle
      };
      this.attachmentModel.addContext(context2);
    } else {
      const file = URI.isUri(attachment.value) ? attachment.value : attachment.value.uri;
      if (file.scheme === Schemas.vscodeNotebookCell && isLocation(attachment.value)) {
        this.attachmentModel.addFile(file, attachment.value.range);
      } else {
        this.attachmentModel.addFile(file);
      }
    }
    this.widgetRef()?.focusInput();
  }
  async pinSelection() {
    for (const attachment of this.attachment.values) {
      if (!attachment.value || !attachment.isSelection) {
        continue;
      }
      if (!URI.isUri(attachment.value) && !isStringImplicitContextValue(attachment.value)) {
        const location2 = attachment.value;
        this.attachmentModel.addFile(location2.uri, location2.range);
      }
    }
    this.widgetRef()?.focusInput();
  }
};

ImplicitContextAttachmentWidget = __decorateClass([
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IMenuService),
  __decorateParam(10, IFileService),
  __decorateParam(11, ILanguageService),
  __decorateParam(12, IModelService),
  __decorateParam(13, IHoverService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, IChatContextService),
  __decorateParam(16, IBrowserViewWorkbenchService),
  __decorateParam(17, IThemeService)
], ImplicitContextAttachmentWidget);
export { ImplicitContextAttachmentWidget };
