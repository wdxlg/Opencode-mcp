// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackContextView.ts
import { $, EventType, append, isAncestor, isHTMLElement } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { basename } from "./module-0026.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { createFileIconThemableTreeContainerScope } from "./module-2125.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { editorHoverBackground } from "./module-0229.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackContextView.ts
var $128 = $;

function isFeedbackFileElement(element) {
  return element.type === "file";
}

var FeedbackTreeDelegate = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(element) {
    return isFeedbackFileElement(element) ? FeedbackFileRenderer.TEMPLATE_ID : FeedbackCommentRenderer.TEMPLATE_ID;
  }
};

var FeedbackFileRenderer = class _FeedbackFileRenderer {
  constructor(_labels, _agentFeedbackService, _sessionResource) {
    this._labels = _labels;
    this._agentFeedbackService = _agentFeedbackService;
    this._sessionResource = _sessionResource;
    this.templateId = _FeedbackFileRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "feedbackFile";
  }
  renderTemplate(container2) {
    const templateDisposables = new DisposableStore();
    const label3 = templateDisposables.add(this._labels.create(container2, { supportHighlights: true }));
    const actionBarContainer = $128("div.agent-feedback-context-view-action-bar");
    label3.element.appendChild(actionBarContainer);
    const actionBar3 = templateDisposables.add(new ActionBar(actionBarContainer));
    return { label: label3, actionBar: actionBar3, templateDisposables };
  }
  renderElement(node, _index, templateData) {
    const element = node.element;
    templateData.label.element.style.display = "flex";
    const name = basename(element.uri.path);
    templateData.label.setResource(
      { resource: element.uri, name },
      { fileKind: 0 /* FILE */ }
    );
    templateData.actionBar.clear();
    if (this._agentFeedbackService) {
      const service = this._agentFeedbackService;
      const sessionResource = this._sessionResource;
      templateData.actionBar.push(new Action(
        "agentFeedback.removeFileComments",
        localize(4043, null),
        ThemeIcon.asClassName(Codicon.close),
        true,
        () => {
          for (const item of element.items) {
            service.removeFeedback(sessionResource, item.id);
          }
        }
      ), { icon: true, label: false });
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
};

var FeedbackCommentRenderer = class _FeedbackCommentRenderer {
  constructor(_agentFeedbackService, _canDelete, _sessionResource, _hoverService, _languageService) {
    this._agentFeedbackService = _agentFeedbackService;
    this._canDelete = _canDelete;
    this._sessionResource = _sessionResource;
    this._hoverService = _hoverService;
    this._languageService = _languageService;
    this.templateId = _FeedbackCommentRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "feedbackComment";
  }
  renderTemplate(container2) {
    const templateDisposables = new DisposableStore();
    const row = append(container2, $128("div.agent-feedback-context-view-comment-row"));
    const textElement = append(row, $128("div.agent-feedback-context-view-comment-text"));
    const actionBarContainer = append(row, $128("div.agent-feedback-context-view-action-bar"));
    const actionBar3 = templateDisposables.add(new ActionBar(actionBarContainer));
    const hoverDisposable = templateDisposables.add(new MutableDisposable());
    return { textElement, row, actionBar: actionBar3, templateDisposables, hoverDisposable };
  }
  renderElement(node, _index, templateData) {
    const element = node.element;
    templateData.textElement.textContent = element.text;
    if (!this._canDelete) {
      templateData.hoverDisposable.value = this._hoverService.setupDelayedHover(
        templateData.row,
        () => this._buildCommentHover(element),
        { groupId: "agent-feedback-comment" }
      );
    }
    templateData.actionBar.clear();
    if (this._canDelete) {
      const service = this._agentFeedbackService;
      const sessionResource = this._sessionResource;
      templateData.actionBar.push(new Action(
        "agentFeedback.removeComment",
        localize(4042, null),
        ThemeIcon.asClassName(Codicon.close),
        true,
        () => {
          service.removeFeedback(sessionResource, element.id);
        }
      ), { icon: true, label: false });
    }
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  _buildCommentHover(element) {
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    markdown.appendText(element.text);
    if (element.codeSelection) {
      const languageId = this._languageService.guessLanguageIdByFilepathOrFirstLine(element.resourceUri);
      markdown.appendMarkdown("\n\n");
      markdown.appendCodeblock(languageId ?? "", element.codeSelection);
    }
    if (element.diffHunks) {
      markdown.appendMarkdown("\n\n");
      markdown.appendCodeblock("diff", element.diffHunks);
    }
    return {
      content: markdown,
      style: 1 /* Pointer */,
      position: {
        hoverPosition: 1 /* RIGHT */
      }
    };
  }
};

var AgentFeedbackContextView = class extends Disposable {
  constructor(_element, _attachment, _canDelete, _hoverService, _contextViewService, _instantiationService, _agentFeedbackService, _languageService, _themeService) {
    super();
    this._element = _element;
    this._attachment = _attachment;
    this._canDelete = _canDelete;
    this._hoverService = _hoverService;
    this._contextViewService = _contextViewService;
    this._instantiationService = _instantiationService;
    this._agentFeedbackService = _agentFeedbackService;
    this._languageService = _languageService;
    this._themeService = _themeService;
    this._store.add(this._hoverService.setupDelayedHover(
      this._element,
      {
        content: localize(4041, null),
        style: 1 /* Pointer */
      },
      { groupId: "chat-attachments" }
    ));
    this._store.add(toDisposable(() => this._openContextView?.close()));
  }
  toggle() {
    if (this._openContextView) {
      this._openContextView.close();
      return;
    }
    if (this._attachment.feedbackItems.length < 2) {
      return;
    }
    this._hoverService.hideHover();
    this._show();
  }
  _show() {
    this._openContextView = this._contextViewService.showContextView({
      getAnchor: () => this._element,
      anchorAlignment: 0 /* LEFT */,
      anchorPosition: 0 /* BELOW */,
      render: (container2) => this._render(container2),
      focus: () => this._tree?.domFocus(),
      onDOMEvent: (e4) => {
        const eventType = e4.browserEvent?.type ?? e4.type;
        if (eventType === EventType.KEY_DOWN && e4.keyCode === 9 /* Escape */) {
          e4.preventDefault();
          e4.stopPropagation();
          this._openContextView?.close();
          this._element.focus();
          return;
        }
        if (eventType === EventType.CLICK) {
          const target = e4.target;
          if (isHTMLElement(target) && !isAncestor(target, this._contextViewService.getContextViewElement()) && !isAncestor(target, this._element)) {
            this._openContextView?.close();
          }
        }
      },
      onHide: () => {
        this._element.ariaExpanded = "false";
        this._tree = void 0;
        this._openContextView = void 0;
      }
    });
    this._element.ariaExpanded = "true";
  }
  _render(container2) {
    const disposables = new DisposableStore();
    const contextViewElement = append(container2, $128(".agent-feedback-context-view.monaco-hover.workbench-hover.compact"));
    const treeContainer = append(contextViewElement, $128(".results.agent-feedback-context-view-tree"));
    disposables.add(createFileIconThemableTreeContainerScope(treeContainer, this._themeService));
    const resourceLabels = disposables.add(this._instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    const { children, commentElements } = this._buildTreeData();
    const tree = disposables.add(this._instantiationService.createInstance(
      WorkbenchObjectTree,
      "AgentFeedbackContextViewTree",
      treeContainer,
      new FeedbackTreeDelegate(),
      [
        new FeedbackFileRenderer(resourceLabels, this._canDelete ? this._agentFeedbackService : void 0, this._attachment.sessionResource),
        new FeedbackCommentRenderer(this._agentFeedbackService, this._canDelete, this._attachment.sessionResource, this._hoverService, this._languageService)
      ],
      {
        defaultIndent: 0,
        alwaysConsumeMouseWheel: false,
        openOnSingleClick: true,
        accessibilityProvider: {
          getAriaLabel: (element) => {
            if (isFeedbackFileElement(element)) {
              return basename(element.uri.path);
            }
            return element.text;
          },
          getWidgetAriaLabel: () => localize(4044, null)
        },
        identityProvider: {
          getId: (element) => {
            if (isFeedbackFileElement(element)) {
              return `file:${element.uri.toString()}`;
            }
            return `comment:${element.id}`;
          }
        },
        overrideStyles: {
          listFocusBackground: void 0,
          listInactiveFocusBackground: void 0,
          listActiveSelectionBackground: void 0,
          listFocusAndSelectionBackground: void 0,
          listInactiveSelectionBackground: void 0,
          listBackground: editorHoverBackground,
          listFocusForeground: void 0,
          treeStickyScrollBackground: editorHoverBackground
        }
      }
    ));
    this._tree = tree;
    disposables.add(tree.onDidOpen((e4) => {
      if (e4.element && !isFeedbackFileElement(e4.element)) {
        this._openContextView?.close();
        void this._agentFeedbackService.revealFeedback(this._attachment.sessionResource, e4.element.id);
      }
    }));
    tree.setChildren(null, children);
    if (children[0]?.element) {
      tree.setFocus([children[0].element]);
    }
    const ROW_HEIGHT = 22;
    const MAX_ROWS = 8;
    const totalRows = commentElements.length + children.length;
    const treeHeight = Math.min(totalRows * ROW_HEIGHT, MAX_ROWS * ROW_HEIGHT);
    tree.layout(treeHeight, 200);
    treeContainer.style.height = `${treeHeight}px`;
    return disposables;
  }
  _buildTreeData() {
    const byFile = /* @__PURE__ */ new Map();
    for (const item of this._attachment.feedbackItems) {
      const key3 = item.resourceUri.toString();
      let group2 = byFile.get(key3);
      if (!group2) {
        group2 = { uri: item.resourceUri, comments: [] };
        byFile.set(key3, group2);
      }
      group2.comments.push({
        type: "comment",
        id: item.id,
        text: item.text,
        resourceUri: item.resourceUri,
        codeSelection: item.codeSelection,
        diffHunks: item.diffHunks
      });
    }
    const children = [];
    const allComments = [];
    for (const [, group2] of byFile) {
      const fileElement = {
        type: "file",
        uri: group2.uri,
        items: group2.comments
      };
      allComments.push(...group2.comments);
      children.push({
        element: fileElement,
        collapsible: true,
        collapsed: false,
        children: group2.comments.map((comment) => ({
          element: comment,
          collapsible: false
        }))
      });
    }
    return { children, commentElements: allComments };
  }
};

AgentFeedbackContextView = __decorateClass([
  __decorateParam(3, IHoverService),
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IAgentFeedbackService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IThemeService)
], AgentFeedbackContextView);
export { isFeedbackFileElement, $128, FeedbackTreeDelegate, FeedbackFileRenderer, FeedbackCommentRenderer, AgentFeedbackContextView };
