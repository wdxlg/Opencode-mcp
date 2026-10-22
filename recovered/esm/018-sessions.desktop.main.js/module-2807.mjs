// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchResultsView.ts
import { isPlainTextSearchHeading, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeFolderMatchNoRoot, isSearchTreeFolderMatchWorkspaceRoot, isSearchTreeMatch, isTextSearchHeading } from "./module-2519.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { SearchContext } from "./module-1261.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ILabelService } from "./module-0641.mjs";
import { isSearchTreeAIFileMatch } from "./module-2806.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { IHoverService } from "./module-0520.mjs";
import { dirname } from "./module-0026.mjs";


// src/vs/workbench/contrib/search/browser/searchResultsView.ts
var SearchDelegate = class _SearchDelegate {
  static {
    this.ITEM_HEIGHT = 22;
  }
  getHeight(element) {
    return _SearchDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (isSearchTreeFolderMatch(element)) {
      return FolderMatchRenderer.TEMPLATE_ID;
    } else if (isSearchTreeFileMatch(element)) {
      return FileMatchRenderer.TEMPLATE_ID;
    } else if (isSearchTreeMatch(element)) {
      return MatchRenderer.TEMPLATE_ID;
    } else if (isTextSearchHeading(element)) {
      return TextSearchResultRenderer.TEMPLATE_ID;
    }
    console.error("Invalid search tree element", element);
    throw new Error("Invalid search tree element");
  }
};

var TextSearchResultRenderer = class extends Disposable {
  constructor(labels, contextService, instantiationService, contextKeyService) {
    super();
    this.labels = labels;
    this.contextService = contextService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = TextSearchResultRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "textResultMatch";
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const textSearchResultElement = append(container2, $(".textsearchresult"));
    const label3 = this.labels.create(textSearchResultElement, { supportDescriptionHighlights: true, supportHighlights: true, supportIcons: true });
    disposables.add(label3);
    const actionBarContainer = append(textSearchResultElement, $(".actionBarContainer"));
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container2));
    const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      highlightToggledItems: true,
      hiddenItemStrategy: 0 /* Ignore */,
      toolbarOptions: {
        primaryGroup: (g) => /^inline/.test(g)
      }
    }));
    return { label: label3, disposables, actions, contextKeyService: contextKeyServiceMain };
  }
  async renderElement(node, index2, templateData) {
    if (isPlainTextSearchHeading(node.element)) {
      templateData.label.setLabel(localize(19186, null));
      SearchContext.AIResultsTitle.bindTo(templateData.contextKeyService).set(false);
      SearchContext.MatchFocusKey.bindTo(templateData.contextKeyService).set(false);
      SearchContext.FileFocusKey.bindTo(templateData.contextKeyService).set(false);
      SearchContext.FolderFocusKey.bindTo(templateData.contextKeyService).set(false);
    } else {
      try {
        await node.element.parent().searchModel.getAITextResultProviderName();
      } catch {
      }
      const localizedLabel = localize(19184, null);
      templateData.label.setLabel(`$(${Codicon.searchSparkle.id}) ${localizedLabel}`);
      SearchContext.AIResultsTitle.bindTo(templateData.contextKeyService).set(true);
      SearchContext.MatchFocusKey.bindTo(templateData.contextKeyService).set(false);
      SearchContext.FileFocusKey.bindTo(templateData.contextKeyService).set(false);
      SearchContext.FolderFocusKey.bindTo(templateData.contextKeyService).set(false);
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
  renderCompressedElements(node, index2, templateData) {
  }
};

TextSearchResultRenderer = __decorateClass([
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService)
], TextSearchResultRenderer);

var FolderMatchRenderer = class extends Disposable {
  constructor(searchView, labels, contextService, labelService, instantiationService, contextKeyService) {
    super();
    this.searchView = searchView;
    this.labels = labels;
    this.contextService = contextService;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = FolderMatchRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "folderMatch";
  }
  renderCompressedElements(node, index2, templateData) {
    const compressed = node.element;
    const folder = compressed.elements[compressed.elements.length - 1];
    const label3 = compressed.elements.map((e4) => e4.name());
    if (folder.resource) {
      const fileKind = isSearchTreeFolderMatchWorkspaceRoot(folder) ? 2 /* ROOT_FOLDER */ : 1 /* FOLDER */;
      templateData.label.setResource({ resource: folder.resource, name: label3 }, {
        fileKind,
        separator: this.labelService.getSeparator(folder.resource.scheme)
      });
    } else {
      templateData.label.setLabel(localize(19185, null));
    }
    this.renderFolderDetails(folder, templateData);
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const folderMatchElement = append(container2, $(".foldermatch"));
    const label3 = this.labels.create(folderMatchElement, { supportDescriptionHighlights: true, supportHighlights: true });
    disposables.add(label3);
    const badge = new CountBadge(append(folderMatchElement, $(".badge")), {}, defaultCountBadgeStyles);
    disposables.add(badge);
    const actionBarContainer = append(folderMatchElement, $(".actionBarContainer"));
    const elementDisposables = new DisposableStore();
    disposables.add(elementDisposables);
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container2));
    SearchContext.AIResultsTitle.bindTo(contextKeyServiceMain).set(false);
    SearchContext.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FolderFocusKey.bindTo(contextKeyServiceMain).set(true);
    const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      hiddenItemStrategy: 0 /* Ignore */,
      toolbarOptions: {
        primaryGroup: (g) => /^inline/.test(g)
      }
    }));
    return {
      label: label3,
      badge,
      actions,
      disposables,
      elementDisposables,
      contextKeyService: contextKeyServiceMain
    };
  }
  renderElement(node, index2, templateData) {
    const folderMatch = node.element;
    if (folderMatch.resource) {
      const workspaceFolder = this.contextService.getWorkspaceFolder(folderMatch.resource);
      if (workspaceFolder && isEqual2(workspaceFolder.uri, folderMatch.resource)) {
        templateData.label.setFile(folderMatch.resource, { fileKind: 2 /* ROOT_FOLDER */, hidePath: true });
      } else {
        templateData.label.setFile(folderMatch.resource, { fileKind: 1 /* FOLDER */, hidePath: this.searchView.isTreeLayoutViewVisible });
      }
    } else {
      templateData.label.setLabel(localize(19185, null));
    }
    SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
    templateData.elementDisposables.add(folderMatch.onChange(() => {
      SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
    }));
    this.renderFolderDetails(folderMatch, templateData);
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
  renderFolderDetails(folder, templateData) {
    const count2 = folder.recursiveMatchCount();
    templateData.badge.setCount(count2);
    templateData.badge.setTitleFormat(count2 > 1 ? localize(19183, null, count2) : localize(19182, null, count2));
    templateData.actions.context = { viewer: this.searchView.getControl(), element: folder };
  }
};

FolderMatchRenderer = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], FolderMatchRenderer);

var FileMatchRenderer = class extends Disposable {
  constructor(searchView, labels, contextService, configurationService, instantiationService, contextKeyService) {
    super();
    this.searchView = searchView;
    this.labels = labels;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = FileMatchRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "fileMatch";
  }
  renderCompressedElements(node, index2, templateData) {
    throw new Error("Should never happen since node is incompressible.");
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    disposables.add(elementDisposables);
    const fileMatchElement = append(container2, $(".filematch"));
    const label3 = this.labels.create(fileMatchElement);
    disposables.add(label3);
    const badge = new CountBadge(append(fileMatchElement, $(".badge")), {}, defaultCountBadgeStyles);
    disposables.add(badge);
    const actionBarContainer = append(fileMatchElement, $(".actionBarContainer"));
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container2));
    SearchContext.AIResultsTitle.bindTo(contextKeyServiceMain).set(false);
    SearchContext.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FileFocusKey.bindTo(contextKeyServiceMain).set(true);
    SearchContext.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
    const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      hiddenItemStrategy: 0 /* Ignore */,
      toolbarOptions: {
        primaryGroup: (g) => /^inline/.test(g)
      }
    }));
    return {
      el: fileMatchElement,
      label: label3,
      badge,
      actions,
      disposables,
      elementDisposables,
      contextKeyService: contextKeyServiceMain
    };
  }
  renderElement(node, index2, templateData) {
    const fileMatch = node.element;
    templateData.el.setAttribute("data-resource", fileMatch.resource.toString());
    const decorationConfig = this.configurationService.getValue("search").decorations;
    templateData.label.setFile(fileMatch.resource, { range: isSearchTreeAIFileMatch(fileMatch) ? fileMatch.getFullRange() : void 0, hidePath: this.searchView.isTreeLayoutViewVisible && !isSearchTreeFolderMatchNoRoot(fileMatch.parent()), hideIcon: false, fileDecorations: { colors: decorationConfig.colors, badges: decorationConfig.badges } });
    const count2 = fileMatch.count();
    templateData.badge.setCount(count2);
    templateData.badge.setTitleFormat(count2 > 1 ? localize(19188, null, count2) : localize(19187, null, count2));
    templateData.actions.context = { viewer: this.searchView.getControl(), element: fileMatch };
    SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
    templateData.elementDisposables.add(fileMatch.onChange(() => {
      SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
    }));
    const twistieContainer = templateData.el.parentElement?.parentElement?.querySelector(".monaco-tl-twistie");
    twistieContainer?.classList.add("force-twistie");
  }
  disposeElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

FileMatchRenderer = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService)
], FileMatchRenderer);

var MatchRenderer = class extends Disposable {
  constructor(searchView, contextService, configurationService, instantiationService, contextKeyService, hoverService) {
    super();
    this.searchView = searchView;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.templateId = MatchRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "match";
  }
  renderCompressedElements(node, index2, templateData) {
    throw new Error("Should never happen since node is incompressible.");
  }
  renderTemplate(container2) {
    container2.classList.add("linematch");
    const lineNumber = append(container2, $("span.matchLineNum"));
    const parent = append(container2, $("a.plain.match"));
    const before = append(parent, $("span"));
    const match2 = append(parent, $("span.findInFileMatch"));
    const replace = append(parent, $("span.replaceMatch"));
    const after2 = append(parent, $("span"));
    const actionBarContainer = append(container2, $("span.actionBarContainer"));
    const disposables = new DisposableStore();
    const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container2));
    SearchContext.AIResultsTitle.bindTo(contextKeyServiceMain).set(false);
    SearchContext.MatchFocusKey.bindTo(contextKeyServiceMain).set(true);
    SearchContext.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
    SearchContext.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
    const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyServiceMain])));
    const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
      menuOptions: {
        shouldForwardArgs: true
      },
      hiddenItemStrategy: 0 /* Ignore */,
      toolbarOptions: {
        primaryGroup: (g) => /^inline/.test(g)
      }
    }));
    const parentHover = disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), parent, ""));
    const lineNumberHover = disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), lineNumber, ""));
    return {
      parent,
      before,
      match: match2,
      replace,
      after: after2,
      lineNumber,
      actions,
      parentHover,
      lineNumberHover,
      disposables,
      contextKeyService: contextKeyServiceMain
    };
  }
  renderElement(node, index2, templateData) {
    const match2 = node.element;
    const preview = match2.preview();
    const replace = this.searchView.model.isReplaceActive() && !!this.searchView.model.replaceString && !match2.isReadonly;
    templateData.before.textContent = preview.before;
    templateData.match.textContent = preview.inside;
    templateData.match.classList.toggle("replace", replace);
    templateData.replace.textContent = replace ? match2.replaceString : "";
    templateData.after.textContent = preview.after;
    const title = (preview.fullBefore + (replace ? match2.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
    templateData.parentHover.update(title);
    SearchContext.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!match2.isReadonly);
    const numLines = match2.range().endLineNumber - match2.range().startLineNumber;
    const extraLinesStr = numLines > 0 ? `+${numLines}` : "";
    const showLineNumbers = this.configurationService.getValue("search").showLineNumbers;
    const lineNumberStr = showLineNumbers ? `${match2.range().startLineNumber}:` : "";
    templateData.lineNumber.classList.toggle("show", numLines > 0 || showLineNumbers);
    templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
    templateData.lineNumberHover.update(this.getMatchTitle(match2, showLineNumbers));
    templateData.actions.context = { viewer: this.searchView.getControl(), element: match2 };
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
  getMatchTitle(match2, showLineNumbers) {
    const startLine = match2.range().startLineNumber;
    const numLines = match2.range().endLineNumber - match2.range().startLineNumber;
    const lineNumStr = showLineNumbers ? localize(19177, null, startLine, numLines) + " " : "";
    const numLinesStr = numLines > 0 ? "+ " + localize(19178, null, numLines) : "";
    return lineNumStr + numLinesStr;
  }
};

MatchRenderer = __decorateClass([
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IHoverService)
], MatchRenderer);

var SearchAccessibilityProvider = class {
  constructor(searchView, labelService) {
    this.searchView = searchView;
    this.labelService = labelService;
  }
  getWidgetAriaLabel() {
    return localize(19181, null);
  }
  getAriaLabel(element) {
    if (isSearchTreeFolderMatch(element)) {
      const count2 = element.allDownstreamFileMatches().reduce((total, current) => total + current.count(), 0);
      return element.resource ? localize(19176, null, count2, element.name()) : localize(19179, null, count2);
    }
    if (isSearchTreeFileMatch(element)) {
      const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
      return localize(19175, null, element.count(), element.name(), dirname(path));
    }
    if (isSearchTreeMatch(element)) {
      const match2 = element;
      const searchModel = this.searchView.model;
      const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
      const matchString = match2.getMatchString();
      const range2 = match2.range();
      const matchText = match2.text().substr(0, range2.endColumn + 150);
      if (replace) {
        return localize(19180, null, matchText, range2.startColumn, matchString, match2.replaceString);
      }
      return localize(19189, null, matchText, range2.startColumn, matchString);
    }
    return null;
  }
};

SearchAccessibilityProvider = __decorateClass([
  __decorateParam(1, ILabelService)
], SearchAccessibilityProvider);
export { SearchDelegate, TextSearchResultRenderer, FolderMatchRenderer, FileMatchRenderer, MatchRenderer, SearchAccessibilityProvider };
