// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmRepositoriesViewPane.ts
import { collectContextMenuActions, connectPrimaryMenu, getActionViewItemProvider, isSCMArtifactGroupTreeElement, isSCMArtifactNode, isSCMArtifactTreeElement, isSCMRepository } from "./module-2028.mjs";
import { RepositoryActionRunner, RepositoryRenderer } from "./module-3138.mjs";
import { $, append } from "./module-0075.mjs";
import { IconLabel } from "./module-0640.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { Disposable, DisposableMap, DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ISCMService, ISCMViewService } from "./module-1080.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { fromNow } from "./module-0120.mjs";
import { Codicon } from "./module-0085.mjs";
import { basename2 } from "./module-0034.mjs";
import { ResourceTree } from "./module-1258.mjs";
import { SCMViewService } from "./module-3140.mjs";
import { URI } from "./module-0032.mjs";
import { Iterable } from "./module-0011.mjs";
import { ViewPane } from "./module-1335.mjs";
import { Sequencer, Throttler } from "./module-0036.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { autorun } from "./module-0052.mjs";
import { runOnChange } from "./module-0064.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { WorkbenchCompressibleAsyncDataTree } from "./module-0636.mjs";
import { localize } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/scm/browser/scmRepositoriesViewPane.ts
var ListDelegate3 = class {
  getHeight() {
    return 22;
  }
  getTemplateId(element) {
    if (isSCMRepository(element)) {
      return RepositoryRenderer.TEMPLATE_ID;
    } else if (isSCMArtifactGroupTreeElement(element)) {
      return ArtifactGroupRenderer.TEMPLATE_ID;
    } else if (isSCMArtifactTreeElement(element) || isSCMArtifactNode(element)) {
      return ArtifactRenderer.TEMPLATE_ID;
    } else {
      throw new Error("Invalid tree element");
    }
  }
};

var ArtifactGroupRenderer = class {
  constructor(actionViewItemProvider, _contextMenuService, _contextKeyService, _keybindingService, _menuService, _commandService, _scmViewService, _telemetryService) {
    this.actionViewItemProvider = actionViewItemProvider;
    this._contextMenuService = _contextMenuService;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._menuService = _menuService;
    this._commandService = _commandService;
    this._scmViewService = _scmViewService;
    this._telemetryService = _telemetryService;
  }
  static {
    this.TEMPLATE_ID = "artifactGroup";
  }
  get templateId() {
    return ArtifactGroupRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const element = append(container3, $(".scm-artifact-group"));
    const icon2 = append(element, $(".icon"));
    const label3 = new IconLabel(element, { supportIcons: false });
    const actionsContainer = append(element, $(".actions"));
    const actionBar3 = new WorkbenchToolBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider }, this._menuService, this._contextKeyService, this._contextMenuService, this._keybindingService, this._commandService, this._telemetryService);
    return { icon: icon2, label: label3, actionBar: actionBar3, elementDisposables: new DisposableStore(), templateDisposable: combinedDisposable(label3, actionBar3) };
  }
  renderElement(node, index2, templateData) {
    const provider = node.element.repository.provider;
    const artifactGroup = node.element.artifactGroup;
    templateData.icon.className = ThemeIcon.isThemeIcon(artifactGroup.icon) ? `icon ${ThemeIcon.asClassName(artifactGroup.icon)}` : "";
    templateData.label.setLabel(artifactGroup.name);
    const repositoryMenus = this._scmViewService.menus.getRepositoryMenus(provider);
    templateData.elementDisposables.add(connectPrimaryMenu(repositoryMenus.getArtifactGroupMenu(artifactGroup), (primary) => {
      templateData.actionBar.setActions(primary);
    }, "inline", provider));
    templateData.actionBar.context = artifactGroup;
  }
  renderCompressedElements(node, index2, templateData, details) {
    throw new Error("Should never happen since node is incompressible");
  }
  disposeElement(element, index2, templateData, details) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposable.dispose();
  }
};

ArtifactGroupRenderer = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ISCMViewService),
  __decorateParam(7, ITelemetryService)
], ArtifactGroupRenderer);

var ArtifactRenderer = class {
  constructor(actionViewItemProvider, _contextMenuService, _contextKeyService, _keybindingService, _menuService, _commandService, _scmViewService, _telemetryService) {
    this.actionViewItemProvider = actionViewItemProvider;
    this._contextMenuService = _contextMenuService;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._menuService = _menuService;
    this._commandService = _commandService;
    this._scmViewService = _scmViewService;
    this._telemetryService = _telemetryService;
  }
  static {
    this.TEMPLATE_ID = "artifact";
  }
  get templateId() {
    return ArtifactRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const element = append(container3, $(".scm-artifact"));
    const icon2 = append(element, $(".icon"));
    const label3 = new IconLabel(element, { supportIcons: false });
    const timestampContainer = append(element, $(".timestamp-container"));
    const timestamp = append(timestampContainer, $(".timestamp"));
    const actionsContainer = append(element, $(".actions"));
    const actionBar3 = new WorkbenchToolBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider }, this._menuService, this._contextKeyService, this._contextMenuService, this._keybindingService, this._commandService, this._telemetryService);
    return { icon: icon2, label: label3, timestampContainer, timestamp, actionBar: actionBar3, elementDisposables: new DisposableStore(), templateDisposable: combinedDisposable(label3, actionBar3) };
  }
  renderElement(nodeOrElement, index2, templateData) {
    const artifactOrFolder = nodeOrElement.element;
    if (isSCMArtifactTreeElement(artifactOrFolder)) {
      const artifactGroup = artifactOrFolder.group;
      const artifact = artifactOrFolder.artifact;
      const artifactIcon = artifact.icon ?? artifactOrFolder.group.icon;
      templateData.icon.className = ThemeIcon.isThemeIcon(artifactIcon) ? `icon ${ThemeIcon.asClassName(artifactIcon)}` : "";
      const artifactLabel = artifactGroup.supportsFolders ? artifact.name.split("/").pop() ?? artifact.name : artifact.name;
      templateData.label.setLabel(artifactLabel, artifact.description);
      templateData.timestamp.textContent = artifact.timestamp ? fromNow(artifact.timestamp) : "";
      templateData.timestampContainer.classList.toggle("duplicate", artifactOrFolder.hideTimestamp);
      templateData.timestampContainer.style.display = "";
    } else if (isSCMArtifactNode(artifactOrFolder)) {
      templateData.icon.className = `icon ${ThemeIcon.asClassName(Codicon.folder)}`;
      templateData.label.setLabel(basename2(artifactOrFolder.uri));
      templateData.timestamp.textContent = "";
      templateData.timestampContainer.classList.remove("duplicate");
      templateData.timestampContainer.style.display = "none";
    }
    this._renderActionBar(artifactOrFolder, templateData);
  }
  renderCompressedElements(node, index2, templateData, details) {
    const compressed = node.element;
    const artifactOrFolder = compressed.elements[compressed.elements.length - 1];
    if (isSCMArtifactTreeElement(artifactOrFolder)) {
      const artifact = artifactOrFolder.artifact;
      const artifactIcon = artifact.icon ?? artifactOrFolder.group.icon;
      templateData.icon.className = ThemeIcon.isThemeIcon(artifactIcon) ? `icon ${ThemeIcon.asClassName(artifactIcon)}` : "";
      templateData.label.setLabel(artifact.name, artifact.description);
      templateData.timestamp.textContent = artifact.timestamp ? fromNow(artifact.timestamp) : "";
      templateData.timestampContainer.classList.toggle("duplicate", artifactOrFolder.hideTimestamp);
      templateData.timestampContainer.style.display = "";
    } else if (isSCMArtifactNode(artifactOrFolder)) {
      templateData.icon.className = `icon ${ThemeIcon.asClassName(Codicon.folder)}`;
      templateData.label.setLabel(artifactOrFolder.uri.fsPath.substring(1));
      templateData.timestamp.textContent = "";
      templateData.timestampContainer.classList.remove("duplicate");
      templateData.timestampContainer.style.display = "none";
    }
    this._renderActionBar(artifactOrFolder, templateData);
  }
  _renderActionBar(artifactOrFolder, templateData) {
    if (isSCMArtifactTreeElement(artifactOrFolder)) {
      const artifact = artifactOrFolder.artifact;
      const provider = artifactOrFolder.repository.provider;
      const repositoryMenus = this._scmViewService.menus.getRepositoryMenus(provider);
      templateData.elementDisposables.add(connectPrimaryMenu(repositoryMenus.getArtifactMenu(artifactOrFolder.group, artifact), (primary) => {
        templateData.actionBar.setActions(primary);
      }, "inline", provider));
      templateData.actionBar.context = artifact;
    } else if (ResourceTree.isResourceNode(artifactOrFolder)) {
      templateData.actionBar.setActions([]);
      templateData.actionBar.context = void 0;
    }
  }
  disposeElement(element, index2, templateData, details) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposable.dispose();
  }
};

ArtifactRenderer = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ISCMViewService),
  __decorateParam(7, ITelemetryService)
], ArtifactRenderer);

var RepositoryTreeDataSource = class extends Disposable {
  constructor(scmViewService) {
    super();
    this.scmViewService = scmViewService;
  }
  async getChildren(inputOrElement) {
    if (this.scmViewService.explorerEnabledConfig.get() === false) {
      const parentId = isSCMRepository(inputOrElement) ? inputOrElement.provider.id : void 0;
      const repositories = this.scmViewService.repositories.filter((r2) => r2.provider.parentId === parentId);
      return repositories;
    }
    if (inputOrElement instanceof SCMViewService) {
      const repositories = this.scmViewService.repositories.filter((r2) => r2.provider.parentId === void 0);
      if (repositories.length !== this.scmViewService.repositories.length) {
        for (const repository of repositories) {
          const childRepositories = this.scmViewService.repositories.filter((r2) => r2.provider.parentId === repository.provider.id);
          if (childRepositories.length === 0) {
            continue;
          }
          const repositoryIndex = repositories.indexOf(repository);
          repositories.splice(repositoryIndex + 1, 0, ...childRepositories);
        }
      }
      return repositories;
    } else if (isSCMRepository(inputOrElement)) {
      const artifactGroups = await inputOrElement.provider.artifactProvider.get()?.provideArtifactGroups() ?? [];
      return artifactGroups.map((group2) => ({
        repository: inputOrElement,
        artifactGroup: group2,
        type: "artifactGroup"
      }));
    } else if (isSCMArtifactGroupTreeElement(inputOrElement)) {
      const repository = inputOrElement.repository;
      const artifacts = await repository.provider.artifactProvider.get()?.provideArtifacts(inputOrElement.artifactGroup.id) ?? [];
      if (inputOrElement.artifactGroup.supportsFolders) {
        const artifactsTree = new ResourceTree(inputOrElement);
        for (let index2 = 0; index2 < artifacts.length; index2++) {
          const artifact = artifacts[index2];
          const artifactUri = URI.from({ scheme: "scm-artifact", path: artifact.name });
          const artifactDirectory = artifact.id.lastIndexOf("/") > 0 ? artifact.id.substring(0, artifact.id.lastIndexOf("/")) : artifact.id;
          const prevArtifact = index2 > 0 ? artifacts[index2 - 1] : void 0;
          const prevArtifactDirectory = prevArtifact && prevArtifact.id.lastIndexOf("/") > 0 ? prevArtifact.id.substring(0, prevArtifact.id.lastIndexOf("/")) : prevArtifact?.id;
          const hideTimestamp = index2 > 0 && artifact.timestamp !== void 0 && prevArtifact?.timestamp !== void 0 && artifactDirectory === prevArtifactDirectory && fromNow(prevArtifact.timestamp) === fromNow(artifact.timestamp);
          artifactsTree.add(artifactUri, {
            repository,
            group: inputOrElement.artifactGroup,
            artifact,
            hideTimestamp,
            type: "artifact"
          });
        }
        return Iterable.map(artifactsTree.root.children, (node) => node.element ?? node);
      }
      return artifacts.map((artifact, index2, artifacts2) => ({
        repository,
        group: inputOrElement.artifactGroup,
        artifact,
        hideTimestamp: index2 > 0 && artifact.timestamp !== void 0 && artifacts2[index2 - 1].timestamp !== void 0 && fromNow(artifacts2[index2 - 1].timestamp) === fromNow(artifact.timestamp),
        type: "artifact"
      }));
    } else if (isSCMArtifactNode(inputOrElement)) {
      return Iterable.map(
        inputOrElement.children,
        (node) => node.element && node.childrenCount === 0 ? node.element : node
      );
    }
    return [];
  }
  hasChildren(inputOrElement) {
    if (this.scmViewService.explorerEnabledConfig.get() === false) {
      const parentId = isSCMRepository(inputOrElement) ? inputOrElement.provider.id : void 0;
      const repositories = this.scmViewService.repositories.filter((r2) => r2.provider.parentId === parentId);
      return repositories.length > 0;
    }
    if (inputOrElement instanceof SCMViewService) {
      return this.scmViewService.repositories.length > 0;
    } else if (isSCMRepository(inputOrElement)) {
      return true;
    } else if (isSCMArtifactGroupTreeElement(inputOrElement)) {
      return true;
    } else if (isSCMArtifactTreeElement(inputOrElement)) {
      return false;
    } else if (isSCMArtifactNode(inputOrElement)) {
      return inputOrElement.childrenCount > 0;
    } else {
      return false;
    }
  }
};

RepositoryTreeDataSource = __decorateClass([
  __decorateParam(0, ISCMViewService)
], RepositoryTreeDataSource);

var RepositoryTreeIdentityProvider = class {
  getId(element) {
    if (isSCMRepository(element)) {
      return `repo:${element.provider.id}`;
    } else if (isSCMArtifactGroupTreeElement(element)) {
      return `artifactGroup:${element.repository.provider.id}/${element.artifactGroup.id}`;
    } else if (isSCMArtifactTreeElement(element)) {
      return `artifact:${element.repository.provider.id}/${element.group.id}/${element.artifact.id}`;
    } else if (isSCMArtifactNode(element)) {
      return `artifactFolder:${element.context.repository.provider.id}/${element.context.artifactGroup.id}/${element.uri.fsPath}`;
    } else {
      throw new Error("Invalid tree element");
    }
  }
};

var RepositoriesTreeCompressionDelegate = class {
  isIncompressible(element) {
    if (ResourceTree.isResourceNode(element)) {
      return element.childrenCount > 1;
    } else {
      return true;
    }
  }
};

var SCMRepositoriesViewPane = class extends ViewPane {
  constructor(options3, scmService, scmViewService, keybindingService, contextMenuService, commandService, instantiationService, viewDescriptorService, contextKeyService, configurationService, openerService, themeService, hoverService, storageService) {
    super({ ...options3, titleMenuId: MenuId.SCMSourceControlTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.scmService = scmService;
    this.scmViewService = scmViewService;
    this.commandService = commandService;
    this.storageService = storageService;
    this.treeOperationSequencer = new Sequencer();
    this.updateChildrenThrottler = new Throttler();
    this.visibilityDisposables = new DisposableStore();
    this.repositoryDisposables = new DisposableMap();
    this.visibleCountObs = observableConfigValue("scm.repositories.visible", 10, this.configurationService);
    this.providerCountBadgeObs = observableConfigValue("scm.providerCountBadge", "hidden", this.configurationService);
    this.storageService.onWillSaveState(() => {
      this.storeTreeViewState();
    }, this, this._store);
    this._register(this.updateChildrenThrottler);
  }
  renderBody(container3) {
    super.renderBody(container3);
    const treeContainer = append(container3, $(".scm-view.scm-repositories-view"));
    this._register(autorun((reader) => {
      const providerCountBadge = this.providerCountBadgeObs.read(reader);
      treeContainer.classList.toggle("hide-provider-counts", providerCountBadge === "hidden");
      treeContainer.classList.toggle("auto-provider-counts", providerCountBadge === "auto");
    }));
    const viewState = this.loadTreeViewState();
    this.createTree(treeContainer, viewState);
    this.onDidChangeBodyVisibility(async (visible) => {
      if (!visible) {
        this.visibilityDisposables.clear();
        return;
      }
      this.treeOperationSequencer.queue(async () => {
        await this.tree.setInput(this.scmViewService, viewState);
        this.visibilityDisposables.add(autorun((reader) => {
          const visibleCount = this.visibleCountObs.read(reader);
          this.updateBodySize(this.tree.contentHeight, visibleCount);
        }));
        this.visibilityDisposables.add(runOnChange(this.scmViewService.explorerEnabledConfig, async () => {
          await this.updateChildren();
          this.updateBodySize(this.tree.contentHeight);
          if (this.scmViewService.repositories.length === 1) {
            await this.treeOperationSequencer.queue(() => this.tree.expand(this.scmViewService.repositories[0]));
          }
        }));
        const onDidChangeVisibleRepositoriesSignal = observableSignalFromEvent(
          this,
          this.scmViewService.onDidChangeVisibleRepositories
        );
        this.visibilityDisposables.add(autorun(async (reader) => {
          onDidChangeVisibleRepositoriesSignal.read(reader);
          await this.treeOperationSequencer.queue(() => this.updateTreeSelection());
        }));
        this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.visibilityDisposables);
        this.scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.visibilityDisposables);
        for (const repository of this.scmService.repositories) {
          this.onDidAddRepository(repository);
        }
        this.visibilityDisposables.add(autorun(async (reader) => {
          const explorerEnabledConfig = this.scmViewService.explorerEnabledConfig.read(reader);
          const didFinishLoadingRepositories = this.scmViewService.didFinishLoadingRepositories.read(reader);
          if (viewState === void 0 && explorerEnabledConfig && didFinishLoadingRepositories && this.scmViewService.repositories.length === 1) {
            await this.treeOperationSequencer.queue(() => this.tree.expand(this.scmViewService.repositories[0]));
          }
        }));
      });
    }, this, this._store);
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.tree.layout(height, width2);
  }
  focus() {
    super.focus();
    this.tree.domFocus();
  }
  createTree(container3, viewState) {
    this.treeIdentityProvider = new RepositoryTreeIdentityProvider();
    this.treeDataSource = this.instantiationService.createInstance(RepositoryTreeDataSource);
    this._register(this.treeDataSource);
    this.tree = this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "SCM Repositories",
      container3,
      new ListDelegate3(),
      new RepositoriesTreeCompressionDelegate(),
      [
        this.instantiationService.createInstance(RepositoryRenderer, MenuId.SCMSourceControlInline, getActionViewItemProvider(this.instantiationService)),
        this.instantiationService.createInstance(ArtifactGroupRenderer, getActionViewItemProvider(this.instantiationService)),
        this.instantiationService.createInstance(ArtifactRenderer, getActionViewItemProvider(this.instantiationService))
      ],
      this.treeDataSource,
      {
        identityProvider: this.treeIdentityProvider,
        horizontalScrolling: false,
        collapseByDefault: (e) => {
          if (this.scmViewService.explorerEnabledConfig.get() === false) {
            if (isSCMRepository(e) && e.provider.parentId === void 0) {
              return false;
            }
            return true;
          }
          if (viewState?.expanded && (isSCMRepository(e) || isSCMArtifactGroupTreeElement(e) || isSCMArtifactTreeElement(e))) {
            return viewState.expanded.indexOf(this.treeIdentityProvider.getId(e)) === -1;
          } else if (isSCMArtifactNode(e)) {
            return !(e.childrenCount === 1 && Iterable.first(e.children)?.element === void 0);
          } else {
            return true;
          }
        },
        compressionEnabled: true,
        overrideStyles: this.getLocationBasedColors().listOverrideStyles,
        multipleSelectionSupport: this.scmViewService.selectionModeConfig.get() === "multiple",
        expandOnDoubleClick: true,
        expandOnlyOnTwistieClick: true,
        accessibilityProvider: {
          getAriaLabel(element) {
            if (isSCMRepository(element)) {
              return element.provider.label;
            } else if (isSCMArtifactGroupTreeElement(element)) {
              return element.artifactGroup.name;
            } else if (isSCMArtifactTreeElement(element)) {
              return element.artifact.name;
            } else {
              return "";
            }
          },
          getWidgetAriaLabel() {
            return localize(18918, null);
          }
        }
      }
    );
    this._register(this.tree);
    this._register(autorun((reader) => {
      const selectionMode = this.scmViewService.selectionModeConfig.read(reader);
      this.tree.updateOptions({ multipleSelectionSupport: selectionMode === "multiple" });
    }));
    this._register(this.tree.onDidOpen(this.onTreeDidOpen, this));
    this._register(this.tree.onDidChangeSelection(this.onTreeSelectionChange, this));
    this._register(this.tree.onDidChangeFocus(this.onTreeDidChangeFocus, this));
    this._register(this.tree.onDidFocus(this.onDidTreeFocus, this));
    this._register(this.tree.onContextMenu(this.onTreeContextMenu, this));
    this._register(this.tree.onDidChangeContentHeight(this.onTreeContentHeightChange, this));
  }
  async onDidAddRepository(repository) {
    const disposables = new DisposableStore();
    disposables.add(autorun(async (reader) => {
      const explorerEnabled = this.scmViewService.explorerEnabledConfig.read(reader);
      const artifactsProvider = repository.provider.artifactProvider.read(reader);
      if (!explorerEnabled || !artifactsProvider) {
        return;
      }
      reader.store.add(artifactsProvider.onDidChangeArtifacts(async (groups) => {
        await this.updateRepository(repository);
      }));
    }));
    disposables.add(autorun(async (reader) => {
      const historyProvider = repository.provider.historyProvider.read(reader);
      if (!historyProvider) {
        return;
      }
      reader.store.add(runOnChange(historyProvider.historyItemRef, async () => {
        await this.updateRepository(repository);
      }));
    }));
    await this.updateRepository(repository);
    this.repositoryDisposables.set(repository, disposables);
  }
  async onDidRemoveRepository(repository) {
    await this.updateRepository(repository);
    this.repositoryDisposables.deleteAndDispose(repository);
  }
  onTreeDidOpen(e) {
    if (!e.element || !isSCMArtifactTreeElement(e.element) || !e.element.artifact.command) {
      return;
    }
    this.commandService.executeCommand(e.element.artifact.command.id, e.element.repository.provider, e.element.artifact);
  }
  onTreeContextMenu(e) {
    if (!e.element) {
      return;
    }
    if (isSCMRepository(e.element)) {
      const provider = e.element.provider;
      const menus = this.scmViewService.menus.getRepositoryMenus(provider);
      const menu = menus.getRepositoryContextMenu(e.element);
      const actions = collectContextMenuActions(menu);
      const disposables = new DisposableStore();
      const actionRunner = new RepositoryActionRunner(() => {
        return this.getTreeSelection();
      });
      disposables.add(actionRunner);
      disposables.add(actionRunner.onWillRun(() => this.tree.domFocus()));
      this.contextMenuService.showContextMenu({
        actionRunner,
        getAnchor: () => e.anchor,
        getActions: () => actions,
        getActionsContext: () => provider,
        onHide: () => disposables.dispose()
      });
    } else if (isSCMArtifactTreeElement(e.element)) {
      const provider = e.element.repository.provider;
      const artifact = e.element.artifact;
      const menus = this.scmViewService.menus.getRepositoryMenus(provider);
      const menu = menus.getArtifactMenu(e.element.group, artifact);
      const actions = collectContextMenuActions(menu, provider);
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => actions,
        getActionsContext: () => artifact
      });
    }
  }
  onTreeSelectionChange(e) {
    if (e.browserEvent && e.elements.length > 0) {
      const scrollTop = this.tree.scrollTop;
      if (e.elements.every((e2) => isSCMRepository(e2))) {
        this.scmViewService.visibleRepositories = e.elements;
      } else if (e.elements.every((e2) => isSCMArtifactGroupTreeElement(e2) || isSCMArtifactTreeElement(e2))) {
        this.scmViewService.visibleRepositories = e.elements.map((e2) => e2.repository);
      }
      this.tree.scrollTop = scrollTop;
    }
  }
  onTreeDidChangeFocus(e) {
    if (e.browserEvent && e.elements.length > 0) {
      if (isSCMRepository(e.elements[0])) {
        this.scmViewService.focus(e.elements[0]);
      }
    }
  }
  onDidTreeFocus() {
    const focused = this.tree.getFocus();
    if (focused.length > 0) {
      if (isSCMRepository(focused[0])) {
        this.scmViewService.focus(focused[0]);
      } else if (isSCMArtifactGroupTreeElement(focused[0]) || isSCMArtifactTreeElement(focused[0])) {
        this.scmViewService.focus(focused[0].repository);
      }
    }
  }
  onTreeContentHeightChange(height) {
    this.updateBodySize(height);
    this.treeOperationSequencer.queue(() => this.updateTreeSelection());
  }
  async updateChildren(element) {
    return this.updateChildrenThrottler.queue(
      () => this.treeOperationSequencer.queue(async () => {
        if (element && this.tree.hasNode(element)) {
          await this.tree.updateChildren(element, true);
        } else {
          await this.tree.updateChildren(void 0, true);
        }
      })
    );
  }
  async expand(element) {
    await this.treeOperationSequencer.queue(() => this.tree.expand(element, true));
  }
  async updateRepository(repository) {
    if (this.scmViewService.explorerEnabledConfig.get() === false) {
      if (repository.provider.parentId === void 0) {
        await this.updateChildren();
        return;
      }
      await this.updateParentRepository(repository);
    }
    await this.updateChildren();
  }
  async updateParentRepository(repository) {
    const parentRepository = this.scmViewService.repositories.find((r2) => r2.provider.id === repository.provider.parentId);
    if (!parentRepository) {
      return;
    }
    await this.updateChildren(parentRepository);
    await this.expand(parentRepository);
  }
  updateBodySize(contentHeight, visibleCount) {
    if (this.orientation === 1 /* HORIZONTAL */) {
      return;
    }
    if (this.scmViewService.explorerEnabledConfig.get() === false) {
      visibleCount = visibleCount ?? this.visibleCountObs.get();
      const empty = this.scmViewService.repositories.length === 0;
      const size3 = Math.min(contentHeight / 22, visibleCount) * 22;
      this.minimumBodySize = visibleCount === 0 ? 22 : size3;
      this.maximumBodySize = visibleCount === 0 ? Number.POSITIVE_INFINITY : empty ? Number.POSITIVE_INFINITY : size3;
    } else {
      this.minimumBodySize = 120;
      this.maximumBodySize = Number.POSITIVE_INFINITY;
    }
  }
  async updateTreeSelection() {
    const oldSelection = this.getTreeSelection();
    const oldSet = new Set(oldSelection);
    const set = new Set(this.scmViewService.visibleRepositories);
    const added = new Set(Iterable.filter(set, (r2) => !oldSet.has(r2)));
    const removed = new Set(Iterable.filter(oldSet, (r2) => !set.has(r2)));
    if (added.size === 0 && removed.size === 0) {
      return;
    }
    const selection = oldSelection.filter((repo) => !removed.has(repo));
    for (const repo of this.scmViewService.repositories) {
      if (added.has(repo)) {
        selection.push(repo);
      }
    }
    const visibleSelection = selection.filter((s) => this.tree.hasNode(s));
    this.tree.setSelection(visibleSelection);
    if (visibleSelection.length > 0 && !this.tree.getFocus().includes(visibleSelection[0])) {
      this.tree.setAnchor(visibleSelection[0]);
      this.tree.setFocus([visibleSelection[0]]);
    }
  }
  getTreeSelection() {
    return this.tree.getSelection().map((e) => {
      if (isSCMRepository(e)) {
        return e;
      } else if (isSCMArtifactGroupTreeElement(e) || isSCMArtifactTreeElement(e)) {
        return e.repository;
      } else if (isSCMArtifactNode(e)) {
        return e.context.repository;
      } else {
        throw new Error("Invalid tree element");
      }
    });
  }
  loadTreeViewState() {
    const storageViewState = this.storageService.get("scm.repositoriesViewState", 1 /* WORKSPACE */);
    if (!storageViewState) {
      return void 0;
    }
    try {
      const treeViewState = JSON.parse(storageViewState);
      return treeViewState;
    } catch {
      return void 0;
    }
  }
  storeTreeViewState() {
    if (this.tree) {
      this.storageService.store("scm.repositoriesViewState", JSON.stringify(this.tree.getViewState()), 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
  }
  dispose() {
    this.visibilityDisposables.dispose();
    this.repositoryDisposables.dispose();
    super.dispose();
  }
};

SCMRepositoriesViewPane = __decorateClass([
  __decorateParam(1, ISCMService),
  __decorateParam(2, ISCMViewService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IViewDescriptorService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, IHoverService),
  __decorateParam(13, IStorageService)
], SCMRepositoriesViewPane);
export { ListDelegate3, ArtifactGroupRenderer, ArtifactRenderer, RepositoryTreeDataSource, RepositoryTreeIdentityProvider, RepositoriesTreeCompressionDelegate, SCMRepositoriesViewPane };
