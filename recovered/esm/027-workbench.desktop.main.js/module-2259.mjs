// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatChangesSummaryPart.ts
import { Disposable, DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { $, EventHelper, addDisposableListener, isKeyboardEvent, isMouseEvent } from "./module-0075.mjs";
import { ChatEditingSnapshotTextModelContentProvider } from "./module-2257.mjs";
import { autorun } from "./module-0052.mjs";
import { ChatCollapsibleContentPart } from "./module-2143.mjs";
import { Iterable } from "./module-0011.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { MultiDiffEditorInput } from "./module-1148.mjs";
import { MultiDiffEditorItem } from "./module-1147.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatService } from "./module-0972.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatResponseFileChangesService } from "./module-2258.mjs";
import { ResourcePool } from "./module-2153.mjs";
import { createFileIconThemableTreeContainerScope } from "./module-2152.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ActionBar } from "./module-0477.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatChangesSummaryPart.ts
var CHANGES_SUMMARY_ELEMENT_HEIGHT = 22;

var CHANGES_SUMMARY_MAX_ITEMS_SHOWN = 6;

function renderChangesSummaryFileList(container3, diffs, instantiationService, editorService, configurationService, options3) {
  const store = new DisposableStore();
  const columnWidths = { insertions: 2, deletions: 2 };
  const list2 = store.add(instantiationService.createInstance(CollapsibleChangesSummaryListPool, options3, columnWidths)).get();
  const listNode = list2.getHTMLElement();
  container3.appendChild(listNode.parentElement);
  store.add(list2.onDidOpen((item) => {
    const diff4 = item.element;
    if (!diff4) {
      return;
    }
    const altKey = (isMouseEvent(item.browserEvent) || isKeyboardEvent(item.browserEvent)) && item.browserEvent.altKey;
    const openInDiffEditorByDefault = configurationService.getValue("chat.editing.openChangedFileInDiffEditor" /* OpenChangedFileInDiffEditor */);
    const openInDiffEditor = altKey ? !openInDiffEditorByDefault : openInDiffEditorByDefault;
    if (!openInDiffEditor) {
      const fileURI = ChatEditingSnapshotTextModelContentProvider.getOriginalFileURI(diff4.modifiedURI);
      if (fileURI) {
        editorService.openEditor({ resource: fileURI, options: { preserveFocus: true } });
        return;
      }
    }
    editorService.openEditor({
      original: { resource: diff4.originalURI },
      modified: { resource: diff4.modifiedURI },
      options: { preserveFocus: true }
    });
  }));
  store.add(list2.onContextMenu((e) => {
    EventHelper.stop(e.browserEvent, true);
  }));
  store.add(autorun((r2) => {
    const currentDiffs = diffs.read(r2);
    let insertionsColumnCharacters = 2;
    let deletionsColumnCharacters = 2;
    for (const diff4 of currentDiffs) {
      if (!diff4.identical && !diff4.isBusy) {
        insertionsColumnCharacters = Math.max(insertionsColumnCharacters, String(diff4.added).length + 1);
        deletionsColumnCharacters = Math.max(deletionsColumnCharacters, String(diff4.removed).length + 1);
      }
    }
    columnWidths.insertions = insertionsColumnCharacters;
    columnWidths.deletions = deletionsColumnCharacters;
    const itemsShown = Math.min(currentDiffs.length, CHANGES_SUMMARY_MAX_ITEMS_SHOWN);
    const height = itemsShown * CHANGES_SUMMARY_ELEMENT_HEIGHT;
    list2.layout(height);
    listNode.style.height = height + "px";
    list2.splice(0, list2.length, currentDiffs);
  }));
  return store;
}

var ChatCheckpointFileChangesSummaryContentPart = class extends Disposable {
  constructor(content2, context2, hoverService, chatService, editorService, configurationService, instantiationService, chatResponseFileChangesService) {
    super();
    this.content = content2;
    this.hoverService = hoverService;
    this.chatService = chatService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.chatResponseFileChangesService = chatResponseFileChangesService;
    this.diffsBetweenRequests = /* @__PURE__ */ new Map();
    this.fileChangesDiffsObservable = this.computeFileChangesDiffs(content2);
    this.domNode = $(".checkpoint-file-changes-summary.checkpoint-file-changes-compact");
    this.detailsElement = document.createElement("details");
    this.detailsElement.classList.add("checkpoint-file-changes-disclosure");
    this.domNode.appendChild(this.detailsElement);
    const headerDomNode = this.detailsElement.appendChild(document.createElement("summary"));
    headerDomNode.classList.add("checkpoint-file-changes-summary-header");
    this._register(autorun((r2) => {
      const hasChanges = this.fileChangesDiffsObservable.read(r2).length > 0;
      this.domNode.style.display = hasChanges ? "" : "none";
    }));
    this._register(this.renderHeader(headerDomNode));
    this._register(this.renderFilesList(this.detailsElement));
    this._register(addDisposableListener(headerDomNode, "click", () => {
      this.domNode.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
    }));
  }
  computeFileChangesDiffs({ requestId, sessionResource }) {
    const fromProvider = this.chatResponseFileChangesService.getChangesForRequest(sessionResource, requestId);
    if (fromProvider) {
      return fromProvider;
    }
    return this.chatService.chatModels.map((models) => Iterable.find(models, (m) => isEqual2(m.sessionResource, sessionResource))).map((model) => model?.editingSession?.getDiffsForFilesInRequest(requestId)).map((diffs, r2) => diffs?.read(r2) || Iterable.empty());
  }
  getCachedEntryDiffBetweenRequests(editSession, uri5, startRequestId, stopRequestId) {
    const key3 = `${uri5}\0${startRequestId}\0${stopRequestId}`;
    let observable = this.diffsBetweenRequests.get(key3);
    if (!observable) {
      observable = editSession.getEntryDiffBetweenRequests(uri5, startRequestId, stopRequestId);
      this.diffsBetweenRequests.set(key3, observable);
    }
    return observable;
  }
  renderHeader(container3) {
    const filesLabel = container3.appendChild($("span.chat-file-changes-label"));
    const counts = container3.appendChild($("span.chat-file-changes-counts", { "aria-hidden": "true" }));
    const addedLabel = counts.appendChild($("span.insertions"));
    const removedLabel = counts.appendChild($("span.deletions"));
    const disposables = new DisposableStore();
    disposables.add(this.renderViewAllFileChangesButton(container3));
    const chevron = container3.appendChild($("span.chat-file-changes-chevron.chat-collapsible-hover-chevron", { "aria-hidden": "true" }));
    chevron.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRightCompact));
    this._register(autorun((r2) => {
      const diffs = this.fileChangesDiffsObservable.read(r2);
      const fileCountLabel = diffs.length === 1 ? localize(11889, null) : localize(11888, null, diffs.length);
      const additions = diffs.reduce((total, diff4) => total + diff4.added, 0);
      const deletions = diffs.reduce((total, diff4) => total + diff4.removed, 0);
      filesLabel.textContent = fileCountLabel;
      addedLabel.textContent = `+${additions}`;
      removedLabel.textContent = `-${deletions}`;
      container3.setAttribute("aria-label", localize(
        11887,
        null,
        fileCountLabel,
        additions,
        deletions
      ));
    }));
    const setExpansionState = () => {
      container3.setAttribute("aria-expanded", String(this.detailsElement.open));
      chevron.classList.toggle("expanded", this.detailsElement.open);
    };
    setExpansionState();
    disposables.add(addDisposableListener(this.detailsElement, "toggle", setExpansionState));
    return toDisposable(() => disposables.dispose());
  }
  renderViewAllFileChangesButton(container3) {
    const button = container3.appendChild(document.createElement("button"));
    button.classList.add("chat-view-changes-icon");
    button.type = "button";
    const hoverDisposable = this.hoverService.setupDelayedHover(button, () => ({
      content: localize2(11890, "View All File Changes")
    }));
    button.classList.add(...ThemeIcon.asClassNameArray(Codicon.diffMultiple));
    button.setAttribute("aria-label", localize(11891, null));
    return combinedDisposable(hoverDisposable, addDisposableListener(button, "click", (e) => {
      const resources = this.fileChangesDiffsObservable.get().map((diff4) => ({
        originalUri: diff4.originalURI,
        modifiedUri: diff4.modifiedURI
      }));
      const source = URI.parse(`multi-diff-editor:${(/* @__PURE__ */ new Date()).getMilliseconds().toString() + Math.random().toString()}`);
      const input = this.instantiationService.createInstance(
        MultiDiffEditorInput,
        source,
        localize(11886, null),
        resources.map((resource) => {
          return new MultiDiffEditorItem(
            resource.originalUri,
            resource.modifiedUri,
            void 0
          );
        }),
        false
      );
      this.editorService.openEditor(input);
      EventHelper.stop(e, true);
    }));
  }
  renderFilesList(container3) {
    return renderChangesSummaryFileList(container3, this.fileChangesDiffsObservable, this.instantiationService, this.editorService, this.configurationService);
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "changesSummary" && other.requestId === this.content.requestId;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatCheckpointFileChangesSummaryContentPart = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IChatResponseFileChangesService)
], ChatCheckpointFileChangesSummaryContentPart);

var CollapsibleChangesSummaryListPool = class extends Disposable {
  constructor(options3, columnWidths, instantiationService, themeService) {
    super();
    this.options = options3;
    this.columnWidths = columnWidths;
    this.instantiationService = instantiationService;
    this.themeService = themeService;
    this._resourcePool = this._register(new ResourcePool(() => this.listFactory()));
  }
  listFactory() {
    const container3 = $(".chat-summary-list");
    const store = new DisposableStore();
    store.add(createFileIconThemableTreeContainerScope(container3, this.themeService));
    const resourceLabels = store.add(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: () => Disposable.None }));
    const list2 = store.add(this.instantiationService.createInstance(
      WorkbenchList,
      "ChatListRenderer",
      container3,
      new CollapsibleChangesSummaryListDelegate(),
      [new CollapsibleChangesSummaryListRenderer(resourceLabels, this.options, this.columnWidths)],
      {
        alwaysConsumeMouseWheel: false
      }
    ));
    return {
      list: list2,
      dispose: () => {
        store.dispose();
      }
    };
  }
  get() {
    return this._resourcePool.get().list;
  }
};

CollapsibleChangesSummaryListPool = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService)
], CollapsibleChangesSummaryListPool);

var CollapsibleChangesSummaryListDelegate = class {
  getHeight(element) {
    return CHANGES_SUMMARY_ELEMENT_HEIGHT;
  }
  getTemplateId(element) {
    return CollapsibleChangesSummaryListRenderer.TEMPLATE_ID;
  }
};

var CollapsibleChangesSummaryListRenderer = class _CollapsibleChangesSummaryListRenderer {
  constructor(labels2, options3, columnWidths) {
    this.labels = labels2;
    this.options = options3;
    this.columnWidths = columnWidths;
    this.templateId = _CollapsibleChangesSummaryListRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "collapsibleChangesSummaryListRenderer";
  }
  static {
    this.CHANGES_SUMMARY_CLASS_NAME = "insertions-and-deletions";
  }
  renderTemplate(container3) {
    const label3 = this.labels.create(container3, { supportHighlights: true, supportIcons: true });
    let actionBar3;
    if (this.options?.getRowActions) {
      container3.classList.add("chat-summary-list-row-with-actions");
      const actionsContainer = container3.appendChild($(".chat-summary-list-actions"));
      actionBar3 = new ActionBar(actionsContainer);
    }
    return {
      label: label3,
      actionBar: actionBar3,
      changesContainer: actionBar3 ? container3 : label3.element,
      dispose: () => {
        label3.dispose();
        actionBar3?.dispose();
      }
    };
  }
  renderElement(data, index2, templateData) {
    const label3 = templateData.label;
    label3.setFile(data.modifiedURI, {
      fileKind: 0 /* FILE */,
      title: data.modifiedURI.path
    });
    templateData.changesElement?.remove();
    if (!data.identical && !data.isBusy) {
      const changesSummary = templateData.changesContainer.appendChild($(`.${_CollapsibleChangesSummaryListRenderer.CHANGES_SUMMARY_CLASS_NAME}`));
      const added = changesSummary.appendChild($(`.insertions`));
      added.textContent = `+${data.added}`;
      added.style.width = `${this.columnWidths.insertions}ch`;
      const removed = changesSummary.appendChild($(`.deletions`));
      removed.textContent = `-${data.removed}`;
      removed.style.width = `${this.columnWidths.deletions}ch`;
      templateData.changesElement = changesSummary;
    }
    if (templateData.actionBar && this.options?.getRowActions) {
      templateData.actionBar.clear();
      templateData.actionBar.push(this.options.getRowActions(data), { icon: false, label: true });
    }
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};
export { renderChangesSummaryFileList, CHANGES_SUMMARY_ELEMENT_HEIGHT, CHANGES_SUMMARY_MAX_ITEMS_SHOWN, ChatCheckpointFileChangesSummaryContentPart, CollapsibleChangesSummaryListPool, CollapsibleChangesSummaryListDelegate, CollapsibleChangesSummaryListRenderer };
