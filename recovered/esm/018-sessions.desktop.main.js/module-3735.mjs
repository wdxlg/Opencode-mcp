// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesViewRenderer.ts
import { $ } from "./module-0075.mjs";
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { basename2, dirname2, extUriBiasedIgnorePathCase, isEqual2, relativePath } from "./module-0034.mjs";
import { ResourceTree } from "./module-1258.mjs";
import { URI } from "./module-0032.mjs";
import { GITHUB_REMOTE_FILE_SCHEME } from "./module-1767.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ActiveSessionContextKeys, ChangesContextKeys } from "./module-3620.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/contrib/changes/browser/changesViewRenderer.ts
var $123 = $;

function getChangesFileUri(change) {
  return isIChatSessionFileChange2(change) ? change.uri : change.modifiedUri;
}

function isChangesFileResource(change, resource) {
  return isEqual2(change.originalUri, resource) || isEqual2(change.modifiedUri, resource) || isEqual2(getChangesFileUri(change), resource);
}

function toIChangesFileItem(changes) {
  return changes.map((change) => {
    const isAddition = change.originalUri === void 0;
    const isDeletion3 = change.modifiedUri === void 0;
    const uri4 = getChangesFileUri(change);
    return {
      type: "file",
      uri: uri4,
      originalUri: change.originalUri,
      isDeletion: isDeletion3,
      state: 1 /* Accepted */,
      changeType: isAddition ? "added" : isDeletion3 ? "deleted" : "modified",
      linesAdded: change.insertions,
      linesRemoved: change.deletions
    };
  });
}

function isChangesFileItem(element) {
  return !ResourceTree.isResourceNode(element) && element.type === "file";
}

function isChangesRootItem(element) {
  return !ResourceTree.isResourceNode(element) && element.type === "root";
}

function buildTreeChildren(items, treeRootInfo) {
  if (items.length === 0) {
    return [];
  }
  let rootUri = treeRootInfo?.resourceTreeRootUri ?? URI.file("/");
  if (!treeRootInfo && items[0].uri.scheme === GITHUB_REMOTE_FILE_SCHEME) {
    const parts = items[0].uri.path.split("/").filter(Boolean);
    if (parts.length >= 3) {
      rootUri = items[0].uri.with({ path: "/" + parts.slice(0, 3).join("/") });
    }
  }
  const resourceTree = new ResourceTree(void 0, rootUri, extUriBiasedIgnorePathCase);
  for (const item of items) {
    resourceTree.add(item.uri, item);
  }
  function convertChildren2(parent) {
    const result = [];
    for (const child of parent.children) {
      if (child.element && child.childrenCount === 0) {
        result.push({
          element: child.element,
          collapsible: false,
          incompressible: true
        });
      } else {
        result.push({
          element: child,
          children: convertChildren2(child),
          incompressible: parent === resourceTree.root,
          collapsible: true,
          collapsed: false
        });
      }
    }
    return result;
  }
  const children = convertChildren2(resourceTree.root);
  if (!treeRootInfo) {
    return children;
  }
  return [{
    element: treeRootInfo.root,
    children,
    collapsible: true,
    collapsed: false,
    incompressible: true
  }];
}

var ChangesTreeRenderer = class {
  constructor(labels, actionRunner, getRootUri, instantiationService, changesViewService, contextKeyService, labelService, sessionsService) {
    this.labels = labels;
    this.actionRunner = actionRunner;
    this.getRootUri = getRootUri;
    this.instantiationService = instantiationService;
    this.changesViewService = changesViewService;
    this.contextKeyService = contextKeyService;
    this.labelService = labelService;
    this.sessionsService = sessionsService;
    this.templateId = ChangesTreeRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "changesTreeRenderer";
  }
  renderTemplate(container2) {
    const templateDisposables = new DisposableStore();
    const label3 = templateDisposables.add(this.labels.create(container2, { supportHighlights: true, supportIcons: true }));
    const reviewCommentsBadge = $(".changes-review-comments-badge");
    label3.element.appendChild(reviewCommentsBadge);
    const agentFeedbackBadge = $(".changes-agent-feedback-badge");
    label3.element.appendChild(agentFeedbackBadge);
    const lineCountsContainer = $123(".working-set-line-counts");
    const addedSpan = $(".working-set-lines-added");
    const removedSpan = $(".working-set-lines-removed");
    lineCountsContainer.appendChild(addedSpan);
    lineCountsContainer.appendChild(removedSpan);
    label3.element.appendChild(lineCountsContainer);
    const actionBarContainer = $123(".chat-collapsible-list-action-bar");
    const contextKeyService = templateDisposables.add(this.contextKeyService.createScoped(actionBarContainer));
    const scopedInstantiationService = templateDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const toolbar = templateDisposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.AgentsChangeInlineToolbar, {
      menuOptions: { shouldForwardArgs: true, arg: void 0 },
      actionRunner: this.actionRunner
    }));
    label3.element.appendChild(actionBarContainer);
    templateDisposables.add(bindContextKey(ChatContextKeys.agentSessionType, contextKeyService, (reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.sessionType ?? "";
    }));
    templateDisposables.add(bindContextKey(ActiveSessionContextKeys.HasGitRepository, contextKeyService, (reader) => {
      return this.changesViewService.activeSessionHasGitRepositoryObs.read(reader);
    }));
    templateDisposables.add(bindContextKey(ChangesContextKeys.VersionMode, contextKeyService, (reader) => {
      return this.changesViewService.activeSessionChangesetObs.read(reader)?.id ?? "";
    }));
    const changeKindContextKey = ChangesContextKeys.ChangeKind.bindTo(contextKeyService);
    const decorationBadge = $(".changes-decoration-badge");
    label3.element.appendChild(decorationBadge);
    return { label: label3, toolbar, changeKindContextKey, reviewCommentsBadge, agentFeedbackBadge, decorationBadge, addedSpan, removedSpan, lineCountsContainer, elementDisposables: new DisposableStore(), templateDisposables };
  }
  renderElement(node, _index, templateData) {
    const element = node.element;
    templateData.label.element.style.display = "flex";
    if (isChangesRootItem(element)) {
      this.renderRootElement(element, templateData);
    } else if (ResourceTree.isResourceNode(element)) {
      this.renderFolderElement(element, templateData);
    } else {
      this.renderFileElement(element, templateData);
    }
  }
  renderCompressedElements(node, _index, templateData) {
    const compressed = node.element;
    const folder = compressed.elements[compressed.elements.length - 1];
    templateData.label.element.style.display = "flex";
    const label3 = compressed.elements.map((e4) => e4.name);
    templateData.label.setResource({ resource: folder.uri, name: label3 }, {
      fileKind: 1 /* FOLDER */,
      separator: this.labelService.getSeparator(folder.uri.scheme)
    });
    templateData.reviewCommentsBadge.style.display = "none";
    templateData.agentFeedbackBadge.style.display = "none";
    templateData.decorationBadge.style.display = "none";
    templateData.lineCountsContainer.style.display = "none";
    if (templateData.toolbar) {
      templateData.toolbar.context = folder;
    }
    templateData.changeKindContextKey.set("folder");
  }
  renderFileElement(data, templateData) {
    const root = this.getRootUri();
    const viewMode = this.changesViewService.viewModeObs.get();
    templateData.label.setResource({
      resource: data.uri,
      name: basename2(data.uri),
      description: viewMode === "list" /* List */ ? root ? relativePath(root, dirname2(data.uri)) : void 0 : void 0
    }, {
      fileKind: 0 /* FILE */,
      fileDecorations: void 0,
      strikethrough: data.changeType === "deleted"
    });
    const showChangeDecorations = data.changeType !== "none";
    templateData.lineCountsContainer.style.display = showChangeDecorations ? "" : "none";
    templateData.decorationBadge.style.display = showChangeDecorations ? "" : "none";
    templateData.elementDisposables.add(autorun((reader) => {
      const reviewCommentByFile = this.changesViewService.activeSessionReviewCommentCountByFileObs.read(reader);
      const reviewCommentCount = reviewCommentByFile?.get(data.uri.fsPath) ?? 0;
      if (reviewCommentCount > 0) {
        templateData.reviewCommentsBadge.style.display = "";
        templateData.reviewCommentsBadge.className = "changes-review-comments-badge";
        templateData.reviewCommentsBadge.replaceChildren(
          $(".codicon.codicon-comment-unresolved"),
          $("span", void 0, `${reviewCommentCount}`)
        );
      } else {
        templateData.reviewCommentsBadge.style.display = "none";
        templateData.reviewCommentsBadge.replaceChildren();
      }
    }));
    templateData.elementDisposables.add(autorun((reader) => {
      const agentFeedbackByFile = this.changesViewService.activeSessionAgentFeedbackCountByFileObs.read(reader);
      const agentFeedbackCount = agentFeedbackByFile?.get(data.uri.fsPath) ?? 0;
      if (agentFeedbackCount > 0) {
        templateData.agentFeedbackBadge.style.display = "";
        templateData.agentFeedbackBadge.className = "changes-agent-feedback-badge";
        templateData.agentFeedbackBadge.replaceChildren(
          $(".codicon.codicon-comment"),
          $("span", void 0, `${agentFeedbackCount}`)
        );
      } else {
        templateData.agentFeedbackBadge.style.display = "none";
        templateData.agentFeedbackBadge.replaceChildren();
      }
    }));
    const badge = templateData.decorationBadge;
    badge.className = "changes-decoration-badge";
    if (showChangeDecorations) {
      switch (data.changeType) {
        case "added":
          badge.textContent = "A";
          badge.classList.add("added");
          break;
        case "deleted":
          badge.textContent = "D";
          badge.classList.add("deleted");
          break;
        case "modified":
        default:
          badge.textContent = "M";
          badge.classList.add("modified");
          break;
      }
      templateData.addedSpan.textContent = `+${data.linesAdded}`;
      templateData.removedSpan.textContent = `-${data.linesRemoved}`;
      templateData.label.element.querySelector(".monaco-icon-name-container")?.classList.add("modified");
    } else {
      badge.textContent = "";
      templateData.label.element.querySelector(".monaco-icon-name-container")?.classList.remove("modified");
    }
    templateData.toolbar.context = data;
    templateData.changeKindContextKey.set("file");
  }
  renderRootElement(data, templateData) {
    templateData.label.setResource({
      resource: data.uri,
      name: data.name
    }, {
      fileKind: 2 /* ROOT_FOLDER */,
      separator: this.labelService.getSeparator(data.uri.scheme, data.uri.authority)
    });
    templateData.reviewCommentsBadge.style.display = "none";
    templateData.agentFeedbackBadge.style.display = "none";
    templateData.decorationBadge.style.display = "none";
    templateData.lineCountsContainer.style.display = "none";
    templateData.toolbar.context = data.uri;
    templateData.changeKindContextKey.set("root");
  }
  renderFolderElement(node, templateData) {
    templateData.label.setFile(node.uri, {
      fileKind: 1 /* FOLDER */,
      hidePath: true
    });
    templateData.reviewCommentsBadge.style.display = "none";
    templateData.agentFeedbackBadge.style.display = "none";
    templateData.decorationBadge.style.display = "none";
    templateData.lineCountsContainer.style.display = "none";
    templateData.toolbar.context = node;
    templateData.changeKindContextKey.set("folder");
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(_element, _index, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposables.dispose();
  }
};

ChangesTreeRenderer = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IChangesViewService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, ISessionsService)
], ChangesTreeRenderer);
export { getChangesFileUri, isChangesFileResource, toIChangesFileItem, isChangesFileItem, isChangesRootItem, buildTreeChildren, $123, ChangesTreeRenderer };
