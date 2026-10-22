// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatModifiedFilesConfirmationSubPart.ts
import { basename2, isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { AbstractToolConfirmationSubPart } from "./module-2320.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { ChatCustomConfirmationWidget } from "./module-2274.mjs";
import { hasKey } from "./module-0010.mjs";
import { Codicon } from "./module-0085.mjs";
import { createApprovalReasonBadge } from "./module-2281.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { toDisposable } from "./module-0012.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderFileWidgets } from "./module-2115.mjs";
import { Button, ButtonWithIcon } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IChatMarkdownAnchorService } from "./module-2113.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatModifiedFilesConfirmationSubPart.ts
function isCreatedFile(file) {
  return file.editKind === "create" || file.editKind === void 0 && !file.originalUri && !file.originalContentUri && !!file.modifiedContentUri;
}

function findModifiedFileConfirmationEntry(modifiedFiles, resource) {
  return modifiedFiles.find((file) => isEqual2(URI.revive(file.uri), resource));
}

function getModifiedFilesSummaryLabel(modifiedFiles) {
  const allFilesCreated = modifiedFiles.length > 0 && modifiedFiles.every(isCreatedFile);
  if (allFilesCreated) {
    return modifiedFiles.length === 1 ? localize(12226, null) : localize(12221, null, modifiedFiles.length);
  }
  return modifiedFiles.length === 1 ? localize(12225, null) : localize(12220, null, modifiedFiles.length);
}

function createModifiedFilePreviewEditorInput(resource, originalUri, modifiedContentUri, title, options3) {
  const modifiedUri = modifiedContentUri ?? resource;
  if (originalUri) {
    return {
      original: { resource: originalUri },
      modified: { resource: modifiedUri },
      options: options3
    };
  }
  if (modifiedContentUri) {
    return {
      label: title ?? basename2(resource),
      original: { resource: void 0, contents: "" },
      modified: { resource: modifiedContentUri },
      options: options3
    };
  }
  return { resource, options: options3 };
}

var ChatModifiedFilesConfirmationSubPart = class extends AbstractToolConfirmationSubPart {
  constructor(toolInvocation, context2, listPool, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, markdownRendererService, chatMarkdownAnchorService, editorService, commandService, riskAssessmentService) {
    super(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService);
    this.listPool = listPool;
    this.markdownRendererService = markdownRendererService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.editorService = editorService;
    this.commandService = commandService;
    this.codeblocks = [];
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation || !state.confirmationMessages?.title) {
      throw new Error("Modified files confirmation messages are missing");
    }
    const data = toolInvocation.toolSpecificData;
    if (!data || data.kind !== "modifiedFilesConfirmation") {
      throw new Error("Modified files confirmation data is missing");
    }
    const tool = languageModelToolsService.getTool(toolInvocation.toolId);
    const confirmWidget = this._register(this.instantiationService.createInstance(
      ChatCustomConfirmationWidget,
      this.context,
      {
        title: this.getTitle(),
        icon: tool?.icon && hasKey(tool.icon, { id: true }) ? tool.icon : Codicon.tools,
        subtitle: typeof toolInvocation.originMessage === "string" ? toolInvocation.originMessage : toolInvocation.originMessage?.value,
        buttons: this.createButtons(data.options),
        message: this.createWidgetContentElement(state.confirmationMessages.message, data),
        footerBanner: createApprovalReasonBadge(this._store, this.instantiationService, state.confirmationMessages.approvalReason)?.domNode ?? this.createRiskBadgeDomNode(state.parameters)
      }
    ));
    const hasToolConfirmation = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmation.set(true);
    this._register(confirmWidget.onDidClick(({ button, isTouchClick }) => {
      button.data();
      if (!isTouchClick) {
        this.chatWidgetService.getWidgetBySessionResource(this.context.element.sessionResource)?.focusInput();
      }
    }));
    this._register(toDisposable(() => hasToolConfirmation.reset()));
    this.domNode = confirmWidget.domNode;
  }
  createButtons(options3) {
    const [primaryOption, ...secondaryOptions] = options3;
    return [
      {
        label: primaryOption,
        data: () => this.confirmWith(this.toolInvocation, { type: 4 /* UserAction */, selectedButton: primaryOption }),
        moreActions: secondaryOptions.map((option2) => ({
          label: option2,
          data: () => this.confirmWith(this.toolInvocation, { type: 4 /* UserAction */, selectedButton: option2 })
        }))
      }
    ];
  }
  createWidgetContentElement(message, data) {
    const container2 = $(".chat-modified-files-confirmation");
    if (message) {
      const renderedMessage = this._register(this.markdownRendererService.render(typeof message === "string" ? new MarkdownString(message) : message));
      renderFileWidgets(renderedMessage.element, this.instantiationService, this.chatMarkdownAnchorService, this._store, {
        ...this.openedEditors.fileWidgetOptions,
        openResource: (resource, editorOptions) => this.openModifiedFilePreview(data, resource, editorOptions)
      });
      container2.append(renderedMessage.element);
    }
    container2.append(this.createModifiedFilesElement(data));
    return container2;
  }
  createModifiedFilesElement(data) {
    const container2 = $(".chat-modified-files-confirmation-list.chat-editing-session-container.show-file-icons");
    const overview = append(container2, $(".chat-editing-session-overview"));
    const title = append(overview, $(".working-set-title"));
    const titleButton = this._register(new ButtonWithIcon(title, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0,
      supportIcons: true
    }));
    const actions = append(overview, $(".chat-editing-session-actions"));
    const countsContainer = $(".working-set-line-counts");
    const addedSpan = append(countsContainer, $(".working-set-lines-added"));
    const removedSpan = append(countsContainer, $(".working-set-lines-removed"));
    titleButton.element.appendChild(countsContainer);
    const filesLabel = getModifiedFilesSummaryLabel(data.modifiedFiles);
    titleButton.label = filesLabel;
    let added = 0;
    let removed = 0;
    let hasDiffStats = false;
    for (const file of data.modifiedFiles) {
      if (typeof file.insertions === "number" || typeof file.deletions === "number") {
        hasDiffStats = true;
        added += file.insertions ?? 0;
        removed += file.deletions ?? 0;
      }
    }
    if (hasDiffStats) {
      addedSpan.textContent = `+${added}`;
      removedSpan.textContent = `-${removed}`;
      titleButton.element.setAttribute("aria-label", localize(12224, null, filesLabel, added, removed));
      countsContainer.setAttribute("aria-label", localize(12223, null, added, removed));
    } else {
      countsContainer.remove();
      titleButton.element.setAttribute("aria-label", filesLabel);
    }
    const viewAllChangesButton = this._register(new Button(actions, {
      ...defaultButtonStyles,
      secondary: true,
      small: true,
      supportIcons: true,
      ariaLabel: localize(12227, null),
      title: localize(12227, null)
    }));
    viewAllChangesButton.element.classList.add("default-colors");
    viewAllChangesButton.icon = Codicon.diffMultiple;
    viewAllChangesButton.label = " ";
    this._register(viewAllChangesButton.onDidClick(async () => {
      await this.openAllChanges(data);
    }));
    const listReference = this._register(this.listPool.get());
    const list2 = listReference.object;
    const listItems = data.modifiedFiles.map((file) => {
      const resource = URI.revive(file.uri);
      const originalUri = file.originalUri ? URI.revive(file.originalUri) : void 0;
      const modifiedContentUri = file.modifiedContentUri ? URI.revive(file.modifiedContentUri) : void 0;
      const originalContentUri = file.originalContentUri ? URI.revive(file.originalContentUri) : void 0;
      return {
        kind: "reference",
        reference: resource,
        title: file.title,
        description: file.description,
        state: 1 /* Accepted */,
        showModifiedState: true,
        options: {
          diffMeta: typeof file.insertions === "number" || typeof file.deletions === "number" ? {
            added: file.insertions ?? 0,
            removed: file.deletions ?? 0
          } : void 0,
          originalUri: originalContentUri ?? originalUri,
          modifiedUri: modifiedContentUri,
          status: void 0
        }
      };
    });
    this._register(list2.onDidOpen(async (e4) => {
      if (e4.element?.kind !== "reference" || !URI.isUri(e4.element.reference)) {
        return;
      }
      const options3 = e4.element.options;
      await this.editorService.openEditor(createModifiedFilePreviewEditorInput(
        e4.element.reference,
        options3?.originalUri,
        options3?.modifiedUri,
        e4.element.title,
        e4.editorOptions
      ));
    }));
    const maxItemsShown = 6;
    const itemsShown = Math.min(listItems.length, maxItemsShown);
    const height = itemsShown * 22;
    const workingSetContainer = append(container2, $(".chat-editing-session-list.collapsed"));
    list2.layout(height);
    list2.getHTMLElement().style.height = `${height}px`;
    list2.splice(0, list2.length, listItems);
    workingSetContainer.append(list2.getHTMLElement());
    let isCollapsed = true;
    const setExpansionState = () => {
      titleButton.icon = isCollapsed ? Codicon.chevronRight : Codicon.chevronDown;
      workingSetContainer.classList.toggle("collapsed", isCollapsed);
    };
    setExpansionState();
    const toggleWorkingSet = () => {
      isCollapsed = !isCollapsed;
      setExpansionState();
    };
    this._register(titleButton.onDidClick(toggleWorkingSet));
    this._register(addDisposableListener(overview, "click", (e4) => {
      if (e4.defaultPrevented) {
        return;
      }
      const target = e4.target;
      if (target.closest(".monaco-button")) {
        return;
      }
      toggleWorkingSet();
    }));
    return container2;
  }
  async openModifiedFilePreview(data, resource, editorOptions) {
    const file = findModifiedFileConfirmationEntry(data.modifiedFiles, resource);
    if (!file) {
      return false;
    }
    await this.editorService.openEditor(createModifiedFilePreviewEditorInput(
      resource,
      file.originalContentUri ? URI.revive(file.originalContentUri) : file.originalUri ? URI.revive(file.originalUri) : void 0,
      file.modifiedContentUri ? URI.revive(file.modifiedContentUri) : void 0,
      file.title,
      editorOptions
    ));
    return true;
  }
  async openAllChanges(data) {
    await this.commandService.executeCommand("_workbench.openMultiDiffEditor", {
      title: localize(12222, null),
      resources: data.modifiedFiles.map((file) => ({
        originalUri: file.originalContentUri ? URI.revive(file.originalContentUri) : file.originalUri ? URI.revive(file.originalUri) : void 0,
        modifiedUri: file.modifiedContentUri ? URI.revive(file.modifiedContentUri) : URI.revive(file.uri)
      }))
    });
  }
  createContentElement() {
    throw new Error("Not used");
  }
  getTitle() {
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
      return "";
    }
    const title = state.confirmationMessages?.title;
    return typeof title === "string" ? title : title?.value ?? "";
  }
};

ChatModifiedFilesConfirmationSubPart = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, ILanguageModelToolsService),
  __decorateParam(8, IMarkdownRendererService),
  __decorateParam(9, IChatMarkdownAnchorService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, ICommandService),
  __decorateParam(12, IChatToolRiskAssessmentService)
], ChatModifiedFilesConfirmationSubPart);
export { isCreatedFile, findModifiedFileConfirmationEntry, getModifiedFilesSummaryLabel, createModifiedFilePreviewEditorInput, ChatModifiedFilesConfirmationSubPart };
