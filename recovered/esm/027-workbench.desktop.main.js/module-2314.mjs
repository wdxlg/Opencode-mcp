// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMultiDiffContentPart.ts
import { $, EventHelper, addDisposableListener, isKeyboardEvent, isMouseEvent } from "./module-0075.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { isObservable } from "./module-0059.mjs";
import { constObservable } from "./module-0061.mjs";
import { ButtonWithIcon } from "./module-0546.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { MultiDiffEditorInput } from "./module-1148.mjs";
import { MultiDiffEditorItem } from "./module-1147.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { createFileIconThemableTreeContainerScope } from "./module-2152.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { Event2 } from "./module-0017.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { ChatEditingSnapshotTextModelContentProvider } from "./module-2257.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMultiDiffContentPart.ts
var $51 = $;

var ELEMENT_HEIGHT = 22;

var MAX_ITEMS_SHOWN = 6;

var ChatMultiDiffContentPart = class extends Disposable {
  constructor(content2, _element, instantiationService, editorService, themeService, contextKeyService, configurationService) {
    super();
    this.content = content2;
    this._element = _element;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.themeService = themeService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.isCollapsed = false;
    this.readOnly = content2.readOnly ?? false;
    this.diffData = isObservable(this.content.multiDiffData) ? this.content.multiDiffData.map((d) => d) : constObservable(this.content.multiDiffData);
    const headerDomNode = $51(".checkpoint-file-changes-summary-header");
    this.domNode = $51(".checkpoint-file-changes-summary", void 0, headerDomNode);
    this.domNode.tabIndex = 0;
    this.isCollapsed = content2?.collapsed ?? false;
    this._register(this.renderHeader(headerDomNode));
    this._register(this.renderFilesList(this.domNode));
  }
  renderHeader(container3) {
    const viewListButtonContainer = container3.appendChild($51(".chat-file-changes-label"));
    const viewListButton = new ButtonWithIcon(viewListButtonContainer, {});
    this._register(autorun((reader) => {
      const fileCount = this.diffData.read(reader).resources.length;
      viewListButton.label = fileCount === 1 ? localize(11954, null) : localize(11953, null, fileCount);
    }));
    const setExpansionState = () => {
      viewListButton.icon = this.isCollapsed ? Codicon.chevronRight : Codicon.chevronDown;
      this.domNode.classList.toggle("chat-file-changes-collapsed", this.isCollapsed);
    };
    setExpansionState();
    const disposables = new DisposableStore();
    disposables.add(viewListButton);
    disposables.add(viewListButton.onDidClick(() => {
      this.isCollapsed = !this.isCollapsed;
      setExpansionState();
    }));
    if (!this.readOnly) {
      disposables.add(this.renderViewAllFileChangesButton(viewListButton.element));
    }
    disposables.add(this.renderContributedButtons(viewListButton.element));
    return toDisposable(() => disposables.dispose());
  }
  renderViewAllFileChangesButton(container3) {
    const button = container3.appendChild($51(".chat-view-changes-icon"));
    button.classList.add(...ThemeIcon.asClassNameArray(Codicon.diffMultiple));
    button.title = localize(11955, null);
    return addDisposableListener(button, "click", (e) => {
      const source = URI.parse(`multi-diff-editor:${(/* @__PURE__ */ new Date()).getMilliseconds().toString() + Math.random().toString()}`);
      const { title, resources } = this.diffData.get();
      const input = this.instantiationService.createInstance(
        MultiDiffEditorInput,
        source,
        title || "Multi-Diff",
        resources.map((resource) => new MultiDiffEditorItem(
          resource.originalUri,
          resource.modifiedUri,
          resource.goToFileUri
        )),
        false
      );
      const sideBySide = e.altKey;
      this.editorService.openEditor(input, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
      EventHelper.stop(e, true);
    });
  }
  renderContributedButtons(container3) {
    const buttonsContainer = container3.appendChild($51(".chat-multidiff-contributed-buttons"));
    const disposables = new DisposableStore();
    const type = getChatSessionType(this._element.sessionResource);
    const overlay = this.contextKeyService.createOverlay([
      [ChatContextKeys.agentSessionType.key, type]
    ]);
    const nestedInsta = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, overlay])));
    const marshalledUri = {
      ...this._element.sessionResource,
      $mid: 1 /* Uri */
    };
    disposables.add(nestedInsta.createInstance(
      MenuWorkbenchToolBar,
      buttonsContainer,
      MenuId.ChatMultiDiffContext,
      {
        menuOptions: {
          arg: marshalledUri,
          shouldForwardArgs: true
        },
        toolbarOptions: {
          primaryGroup: () => true
        }
      }
    ));
    return disposables;
  }
  renderFilesList(container3) {
    const store = new DisposableStore();
    const listContainer = container3.appendChild($51(".chat-summary-list"));
    store.add(createFileIconThemableTreeContainerScope(listContainer, this.themeService));
    const resourceLabels = store.add(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: Event2.None }));
    this.list = store.add(this.instantiationService.createInstance(
      WorkbenchList,
      "ChatMultiDiffList",
      listContainer,
      new ChatMultiDiffListDelegate(),
      [this.instantiationService.createInstance(ChatMultiDiffListRenderer, resourceLabels)],
      {
        identityProvider: {
          getId: (element) => element.uri.toString()
        },
        setRowLineHeight: true,
        horizontalScrolling: false,
        supportDynamicHeights: false,
        mouseSupport: !this.readOnly,
        alwaysConsumeMouseWheel: false,
        accessibilityProvider: {
          getAriaLabel: (element) => element.uri.path,
          getWidgetAriaLabel: () => localize(11956, null)
        }
      }
    ));
    this._register(autorun((reader) => {
      const { resources } = this.diffData.read(reader);
      const items = [];
      for (const resource of resources) {
        const uri5 = resource.modifiedUri || resource.originalUri || resource.goToFileUri;
        if (!uri5) {
          continue;
        }
        const item = { uri: uri5 };
        if (resource.originalUri && resource.modifiedUri) {
          item.diff = {
            originalURI: resource.originalUri,
            modifiedURI: resource.modifiedUri,
            isFinal: true,
            quitEarly: false,
            identical: false,
            added: resource.added || 0,
            removed: resource.removed || 0,
            isBusy: false
          };
        }
        items.push(item);
      }
      this.list.splice(0, this.list.length, items);
      const height = Math.min(items.length, MAX_ITEMS_SHOWN) * ELEMENT_HEIGHT;
      this.list.layout(height);
      listContainer.style.height = `${height}px`;
    }));
    if (!this.readOnly) {
      store.add(this.list.onDidOpen((e) => {
        if (!e.element) {
          return;
        }
        const altKey = (isMouseEvent(e.browserEvent) || isKeyboardEvent(e.browserEvent)) && e.browserEvent.altKey;
        const openInDiffEditorByDefault = this.configurationService.getValue("chat.editing.openChangedFileInDiffEditor" /* OpenChangedFileInDiffEditor */);
        const openInDiffEditor = altKey ? !openInDiffEditorByDefault : openInDiffEditorByDefault;
        if (e.element.diff && !openInDiffEditor) {
          const fileURI = ChatEditingSnapshotTextModelContentProvider.getOriginalFileURI(e.element.diff.modifiedURI);
          if (fileURI) {
            this.editorService.openEditor({ resource: fileURI, options: { preserveFocus: true } });
            return;
          }
        }
        if (e.element.diff) {
          this.editorService.openEditor({
            original: { resource: e.element.diff.originalURI },
            modified: { resource: e.element.diff.modifiedURI },
            options: { preserveFocus: true }
          });
        } else {
          const fileURI = ChatEditingSnapshotTextModelContentProvider.getOriginalFileURI(e.element.uri) ?? e.element.uri;
          this.editorService.openEditor({
            resource: fileURI,
            options: { preserveFocus: true }
          });
        }
      }));
    }
    return store;
  }
  hasSameContent(other) {
    return other.kind === "multiDiffData" && this.diffData.get().resources.length === (isObservable(other.multiDiffData) ? other.multiDiffData.get().resources.length : other.multiDiffData.resources.length);
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatMultiDiffContentPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IConfigurationService)
], ChatMultiDiffContentPart);

var ChatMultiDiffListDelegate = class {
  getHeight() {
    return 22;
  }
  getTemplateId() {
    return "chatMultiDiffItem";
  }
};

var ChatMultiDiffListRenderer = class _ChatMultiDiffListRenderer {
  constructor(labels2) {
    this.labels = labels2;
    this.templateId = _ChatMultiDiffListRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "chatMultiDiffItem";
  }
  static {
    this.CHANGES_SUMMARY_CLASS_NAME = "insertions-and-deletions";
  }
  renderTemplate(container3) {
    const label3 = this.labels.create(container3, { supportHighlights: true, supportIcons: true });
    return {
      label: label3,
      dispose: () => label3.dispose()
    };
  }
  renderElement(element, _index, templateData) {
    templateData.label.setFile(element.uri, {
      fileKind: 0 /* FILE */,
      title: element.uri.path
    });
    const labelElement = templateData.label.element;
    templateData.changesElement?.remove();
    if (element.diff?.added || element.diff?.removed) {
      const changesSummary = labelElement.appendChild($51(`.${_ChatMultiDiffListRenderer.CHANGES_SUMMARY_CLASS_NAME}`));
      const addedElement = changesSummary.appendChild($51(".insertions"));
      addedElement.textContent = `+${element.diff.added}`;
      const removedElement = changesSummary.appendChild($51(".deletions"));
      removedElement.textContent = `-${element.diff.removed}`;
      changesSummary.setAttribute("aria-label", localize(11952, null, element.diff.added, element.diff.removed));
      templateData.changesElement = changesSummary;
    }
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};
export { $51, ELEMENT_HEIGHT, MAX_ITEMS_SHOWN, ChatMultiDiffContentPart, ChatMultiDiffListDelegate, ChatMultiDiffListRenderer };
