// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatArtifactsWidget.ts
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { Button } from "./module-0546.mjs";
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { localize } from "./module-0001.mjs";
import { setChatInputStackSlot } from "./module-2038.mjs";
import { URI } from "./module-0032.mjs";
import { ChatMemoryFileResource } from "./module-1479.mjs";
import { getEditorOverrideForChatResource } from "./module-2141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatArtifactsService } from "./module-1480.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IChatImageCarouselService } from "./module-2031.mjs";
import { ActionBar } from "./module-0477.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { toAction } from "./module-0082.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatArtifactsWidget.ts
var ARTIFACT_TYPE_ICONS = {
  devServer: Codicon.globe,
  screenshot: Codicon.file,
  plan: Codicon.book
};

function isGroupNode(element) {
  return element.kind === "group";
}

function isLeafNode(element) {
  return element.kind === "leaf";
}

var ChatArtifactsWidget = class extends Disposable {
  constructor(_chatArtifactsService, _instantiationService, _openerService, _configurationService, _commandService, _fileService, _fileDialogService, _chatImageCarouselService) {
    super();
    this._chatArtifactsService = _chatArtifactsService;
    this._instantiationService = _instantiationService;
    this._openerService = _openerService;
    this._configurationService = _configurationService;
    this._commandService = _commandService;
    this._fileService = _fileService;
    this._fileDialogService = _fileDialogService;
    this._chatImageCarouselService = _chatImageCarouselService;
    this._visible = false;
    this._sessionResource = observableValue(this, void 0);
    this._isCollapsed = observableValue(this, false);
    this._currentArtifacts = derived(this, (reader) => {
      const sr = this._sessionResource.read(reader);
      return sr ? this._chatArtifactsService.getArtifacts(sr) : void 0;
    });
    this._treeData = derived(this, (reader) => {
      const artifacts = this._currentArtifacts.read(reader);
      if (!artifacts) {
        return void 0;
      }
      const groups = artifacts.artifactGroups.read(reader);
      const totalCount = groups.reduce((sum2, g) => sum2 + g.artifacts.length, 0);
      if (totalCount === 0) {
        return void 0;
      }
      const multiSource = groups.length > 1;
      const treeElements = buildTreeElementsFromGroups(groups, multiSource, (source) => this._clearSource(source));
      const visibleCount = countVisibleRows(treeElements);
      const itemsShown = Math.min(visibleCount, ChatArtifactsWidget.MAX_ITEMS_SHOWN);
      return {
        totalCount,
        treeElements,
        treeHeight: itemsShown * ChatArtifactsWidget.ELEMENT_HEIGHT
      };
    });
    this.domNode = $(".chat-artifacts-widget");
    this.domNode.style.display = "none";
    this._register(autorun((reader) => {
      const artifacts = this._currentArtifacts.read(reader);
      clearNode(this.domNode);
      if (!artifacts) {
        this._setVisible(false);
        return;
      }
      const store = reader.store;
      const expandoContainer = $(".chat-artifacts-expand");
      const headerButton = store.add(new Button(expandoContainer, { supportIcons: true }));
      const titleSection = $(".chat-artifacts-title-section");
      const expandIcon2 = $(".expand-icon.codicon");
      expandIcon2.setAttribute("aria-hidden", "true");
      const titleElement = $(".chat-artifacts-title");
      titleSection.appendChild(expandIcon2);
      titleSection.appendChild(titleElement);
      headerButton.element.appendChild(titleSection);
      this.domNode.appendChild(expandoContainer);
      const listContainer = $(".chat-artifacts-list");
      this.domNode.appendChild(listContainer);
      const tree = store.add(this._instantiationService.createInstance(
        WorkbenchObjectTree,
        "ChatArtifactsTree",
        listContainer,
        new ChatArtifactsTreeDelegate(),
        [
          new ChatArtifactGroupRenderer(),
          new ChatArtifactLeafRenderer((artifact) => this._saveArtifact(artifact))
        ],
        {
          alwaysConsumeMouseWheel: false,
          accessibilityProvider: new ChatArtifactsAccessibilityProvider()
        }
      ));
      store.add(tree.onDidOpen((e) => {
        if (!e.element) {
          return;
        }
        if (isGroupNode(e.element)) {
          if (e.element.onlyShowGroup) {
            this._openGroupInCarousel(e.element);
          }
        } else if (isLeafNode(e.element)) {
          this._openLeafArtifact(e.element.artifact);
        }
      }));
      store.add(headerButton.onDidClick(() => {
        this._isCollapsed.set(!this._isCollapsed.read(void 0), void 0);
      }));
      store.add(autorun((reader2) => {
        const collapsed2 = this._isCollapsed.read(reader2);
        expandIcon2.classList.toggle("codicon-chevron-down", !collapsed2);
        expandIcon2.classList.toggle("codicon-chevron-right", collapsed2);
        headerButton.element.setAttribute("aria-expanded", String(!collapsed2));
        listContainer.style.display = collapsed2 ? "none" : "block";
      }));
      store.add(autorun((reader2) => {
        const data = this._treeData.read(reader2);
        if (!data) {
          this._setVisible(false);
          return;
        }
        this._setVisible(true);
        titleElement.textContent = data.totalCount === 1 ? localize(11863, null) : localize(11861, null, data.totalCount);
        tree.layout(data.treeHeight);
        tree.getHTMLElement().style.height = `${data.treeHeight}px`;
        tree.setChildren(null, data.treeElements);
      }));
    }));
  }
  static {
    this.ELEMENT_HEIGHT = 22;
  }
  static {
    this.MAX_ITEMS_SHOWN = 6;
  }
  setSessionResource(sessionResource) {
    this._sessionResource.set(sessionResource, void 0);
  }
  /** Add the list to its slot in the chat input stack. */
  attachTo(slot) {
    this._slot = slot;
    slot.appendChild(this.domNode);
    setChatInputStackSlot(slot, this._visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  /** Show or hide the list, and report the same to the stack. */
  _setVisible(visible) {
    this._visible = visible;
    this.domNode.style.display = visible ? "" : "none";
    setChatInputStackSlot(this._slot, visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  async _openGroupInCarousel(group2) {
    const first2 = group2.artifacts[0];
    if (first2?.uri) {
      await this._chatImageCarouselService.openCarouselAtResource(URI.parse(first2.uri));
    }
  }
  _openLeafArtifact(artifact) {
    if (artifact.type === "screenshot" && this._configurationService.getValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */)) {
      this._openScreenshotInCarousel(artifact);
    } else if (artifact.uri) {
      const uri5 = URI.parse(artifact.uri);
      if (ChatMemoryFileResource.isChatMemoryFileUri(uri5)) {
        this._openMemoryFileArtifact(uri5);
      } else {
        const editorOverride = getEditorOverrideForChatResource(uri5, this._configurationService);
        this._openerService.open(uri5, {
          fromUserGesture: true,
          editorOptions: { override: editorOverride }
        });
      }
    }
  }
  async _openScreenshotInCarousel(clicked) {
    if (clicked.uri) {
      await this._chatImageCarouselService.openCarouselAtResource(URI.parse(clicked.uri));
    }
  }
  async _openMemoryFileArtifact(uri5) {
    const { memoryPath, sessionResource } = ChatMemoryFileResource.parse(uri5);
    const resolvedUriStr = await this._commandService.executeCommand(
      "github.copilot.chat.tools.memory.resolveMemoryFileUri",
      memoryPath,
      sessionResource
    );
    if (resolvedUriStr) {
      const resolvedUri = URI.parse(resolvedUriStr);
      const editorOverride = getEditorOverrideForChatResource(resolvedUri, this._configurationService);
      this._openerService.open(resolvedUri, {
        fromUserGesture: true,
        editorOptions: { override: editorOverride }
      });
    }
  }
  _clearSource(source) {
    const artifacts = this._currentArtifacts.get();
    if (!artifacts) {
      return;
    }
    switch (source.kind) {
      case "agent":
        artifacts.clearAgentArtifacts();
        break;
      case "subagent":
        artifacts.clearSubagentArtifacts(source.invocationId);
        break;
    }
  }
  async _saveArtifact(artifact) {
    const sourceUri = URI.parse(artifact.uri);
    const defaultFileName2 = sourceUri.path.split("/").pop() ?? artifact.label;
    const defaultPath = await this._fileDialogService.defaultFilePath();
    const defaultUri = URI.joinPath(defaultPath, defaultFileName2);
    const targetUri = await this._fileDialogService.showSaveDialog({
      defaultUri,
      title: localize(11865, null)
    });
    if (targetUri) {
      const content2 = await this._fileService.readFile(sourceUri);
      await this._fileService.writeFile(targetUri, content2.value);
    }
  }
};

ChatArtifactsWidget = __decorateClass([
  __decorateParam(0, IChatArtifactsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IFileDialogService),
  __decorateParam(7, IChatImageCarouselService)
], ChatArtifactsWidget);

function sourceDisplayName(source) {
  switch (source.kind) {
    case "rules":
      return localize(11867, null);
    case "agent":
      return localize(11866, null);
    case "subagent":
      return source.name ?? localize(11868, null);
  }
}

function buildTreeElementsFromGroups(sourceGroups, multiSource, onClearSource) {
  const elements = [];
  for (const sourceGroup of sourceGroups) {
    const prefix = multiSource ? sourceDisplayName(sourceGroup.source) : void 0;
    const clearable = sourceGroup.source.kind !== "rules";
    const onClear = clearable ? () => onClearSource(sourceGroup.source) : void 0;
    const groups = /* @__PURE__ */ new Map();
    const ungrouped = [];
    for (const artifact of sourceGroup.artifacts) {
      if (artifact.groupName) {
        let group2 = groups.get(artifact.groupName);
        if (!group2) {
          group2 = { config: { groupName: artifact.groupName, onlyShowGroup: artifact.onlyShowGroup ?? false }, artifacts: [] };
          groups.set(artifact.groupName, group2);
        }
        group2.artifacts.push(artifact);
      } else {
        ungrouped.push(artifact);
      }
    }
    for (const [, group2] of groups) {
      const displayName = prefix ? `${prefix}: ${group2.config.groupName}` : group2.config.groupName;
      if (group2.artifacts.length === 1 && !group2.config.onlyShowGroup) {
        elements.push({ element: { kind: "leaf", artifact: group2.artifacts[0], description: displayName, onClear } });
        continue;
      }
      const groupNode = {
        kind: "group",
        groupName: displayName,
        artifacts: group2.artifacts,
        onlyShowGroup: group2.config.onlyShowGroup,
        onClear
      };
      if (group2.config.onlyShowGroup) {
        elements.push({ element: groupNode, collapsible: false, collapsed: false });
      } else {
        elements.push({
          element: groupNode,
          collapsible: true,
          collapsed: false,
          children: group2.artifacts.map((a) => ({ element: { kind: "leaf", artifact: a } }))
        });
      }
    }
    if (ungrouped.length > 0 && prefix) {
      if (ungrouped.length === 1) {
        elements.push({ element: { kind: "leaf", artifact: ungrouped[0], description: prefix, onClear } });
      } else {
        const groupNode = {
          kind: "group",
          groupName: prefix,
          artifacts: ungrouped,
          onlyShowGroup: false,
          onClear
        };
        elements.push({
          element: groupNode,
          collapsible: true,
          collapsed: false,
          children: ungrouped.map((a) => ({ element: { kind: "leaf", artifact: a } }))
        });
      }
    } else {
      for (const artifact of ungrouped) {
        elements.push({ element: { kind: "leaf", artifact, onClear } });
      }
    }
  }
  return elements;
}

function countVisibleRows(elements) {
  let count2 = 0;
  for (const el of elements) {
    count2++;
    if (el.children && !el.collapsed) {
      count2 += countVisibleRows([...el.children]);
    }
  }
  return count2;
}

var ChatArtifactsTreeDelegate = class {
  getHeight() {
    return ChatArtifactsWidget.ELEMENT_HEIGHT;
  }
  getTemplateId(element) {
    return isGroupNode(element) ? ChatArtifactGroupRenderer.TEMPLATE_ID : ChatArtifactLeafRenderer.TEMPLATE_ID;
  }
};

var ChatArtifactsAccessibilityProvider = class {
  getAriaLabel(element) {
    if (isGroupNode(element)) {
      return localize(11862, null, element.groupName, element.artifacts.length);
    }
    return element.artifact.label;
  }
  getWidgetAriaLabel() {
    return localize(11869, null);
  }
};

var ChatArtifactGroupRenderer = class _ChatArtifactGroupRenderer {
  constructor() {
    this.templateId = _ChatArtifactGroupRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "chatArtifactGroupRenderer";
  }
  renderTemplate(container3) {
    const row = append(container3, $(".chat-artifacts-list-row"));
    const iconElement = append(row, $(".chat-artifacts-list-icon"));
    const labelElement = append(row, $(".chat-artifacts-list-label"));
    const actionsContainer = append(row, $(".chat-artifacts-list-actions"));
    const elementDisposables = new DisposableStore();
    const actionBar3 = new ActionBar(actionsContainer);
    return { container: row, iconElement, labelElement, actionBar: actionBar3, elementDisposables };
  }
  renderElement(node, _index, templateData) {
    const group2 = node.element;
    if (!isGroupNode(group2)) {
      return;
    }
    templateData.elementDisposables.clear();
    const firstType = group2.artifacts[0]?.type;
    const icon2 = firstType && ARTIFACT_TYPE_ICONS[firstType] || Codicon.archive;
    templateData.iconElement.className = "chat-artifacts-list-icon " + ThemeIcon.asClassName(icon2);
    templateData.labelElement.textContent = `${group2.groupName} (${group2.artifacts.length})`;
    templateData.container.title = group2.groupName;
    templateData.actionBar.clear();
    if (group2.onClear) {
      const clearFn = group2.onClear;
      templateData.actionBar.push(toAction({
        id: "chatArtifacts.clearSource",
        label: localize(11860, null),
        class: ThemeIcon.asClassName(Codicon.closeSmall),
        run: () => clearFn()
      }), { icon: true, label: false });
    }
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.actionBar.dispose();
  }
};

var ChatArtifactLeafRenderer = class _ChatArtifactLeafRenderer {
  constructor(_onSave) {
    this._onSave = _onSave;
    this.templateId = _ChatArtifactLeafRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "chatArtifactLeafRenderer";
  }
  renderTemplate(container3) {
    const row = append(container3, $(".chat-artifacts-list-row"));
    const iconElement = append(row, $(".chat-artifacts-list-icon"));
    const labelElement = append(row, $(".chat-artifacts-list-label"));
    const descriptionElement = append(row, $(".chat-artifacts-list-description"));
    const actionsContainer = append(row, $(".chat-artifacts-list-actions"));
    const elementDisposables = new DisposableStore();
    const actionBar3 = new ActionBar(actionsContainer);
    return { container: row, iconElement, labelElement, descriptionElement, actionBar: actionBar3, elementDisposables };
  }
  renderElement(node, _index, templateData) {
    if (!isLeafNode(node.element)) {
      return;
    }
    templateData.elementDisposables.clear();
    const { artifact, description, onClear } = node.element;
    const icon2 = artifact.type && ARTIFACT_TYPE_ICONS[artifact.type] || Codicon.archive;
    templateData.iconElement.className = "chat-artifacts-list-icon " + ThemeIcon.asClassName(icon2);
    templateData.labelElement.textContent = artifact.label;
    templateData.descriptionElement.textContent = description ?? "";
    templateData.descriptionElement.style.display = description ? "" : "none";
    templateData.container.title = artifact.uri;
    templateData.actionBar.clear();
    const actions = [];
    if (onClear) {
      const clearFn = onClear;
      actions.push(toAction({
        id: "chatArtifacts.clearSource",
        label: localize(11860, null),
        class: ThemeIcon.asClassName(Codicon.closeSmall),
        run: () => clearFn()
      }));
    }
    actions.push(toAction({
      id: "chatArtifacts.save",
      label: localize(11864, null),
      class: ThemeIcon.asClassName(Codicon.save),
      run: () => this._onSave(artifact)
    }));
    templateData.actionBar.push(actions, { icon: true, label: false });
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.actionBar.dispose();
  }
};
export { isGroupNode, isLeafNode, sourceDisplayName, buildTreeElementsFromGroups, countVisibleRows, ARTIFACT_TYPE_ICONS, ChatArtifactsWidget, ChatArtifactsTreeDelegate, ChatArtifactsAccessibilityProvider, ChatArtifactGroupRenderer, ChatArtifactLeafRenderer };
