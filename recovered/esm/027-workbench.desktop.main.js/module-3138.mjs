// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmRepositoryRenderer.ts
import { ActionRunner } from "./module-0082.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { $, append } from "./module-0075.mjs";
import { IconLabel } from "./module-0640.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { StatusBarAction, connectPrimaryMenu, getRepositoryResourceCount, isSCMRepository } from "./module-2028.mjs";
import { autorun } from "./module-0052.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { shorten } from "./module-0711.mjs";
import { dirname2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ISCMViewService } from "./module-1080.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/scm/browser/scmRepositoryRenderer.ts
var RepositoryActionRunner = class extends ActionRunner {
  constructor(getSelectedRepositories) {
    super();
    this.getSelectedRepositories = getSelectedRepositories;
  }
  async runAction(action, context2) {
    if (!(action instanceof MenuItemAction)) {
      return super.runAction(action, context2);
    }
    const actionContext = [context2];
    const selection = this.getSelectedRepositories().map((r2) => r2.provider);
    if (selection.some((s) => s === context2)) {
      actionContext.push(...selection.filter((s) => s !== context2));
    }
    await action.run(...actionContext);
  }
};

var RepositoryRenderer = class {
  constructor(toolbarMenuId, actionViewItemProvider, commandService, contextKeyService, contextMenuService, keybindingService, labelService, menuService, scmViewService, telemetryService, uriIdentityService) {
    this.toolbarMenuId = toolbarMenuId;
    this.actionViewItemProvider = actionViewItemProvider;
    this.commandService = commandService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.labelService = labelService;
    this.menuService = menuService;
    this.scmViewService = scmViewService;
    this.telemetryService = telemetryService;
    this.uriIdentityService = uriIdentityService;
    this.onDidChangeVisibleRepositoriesSignal = observableSignalFromEvent(this, this.scmViewService.onDidChangeVisibleRepositories);
  }
  static {
    this.TEMPLATE_ID = "repository";
  }
  get templateId() {
    return RepositoryRenderer.TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const provider = append(container3, $(".scm-provider"));
    const icon2 = append(provider, $(".icon"));
    const label3 = new IconLabel(provider, { supportIcons: false });
    const actions = append(provider, $(".actions"));
    const toolBar = new WorkbenchToolBar(actions, { actionViewItemProvider: this.actionViewItemProvider, resetMenu: this.toolbarMenuId, responsiveBehavior: { enabled: true, kind: "all", minItems: 2 } }, this.menuService, this.contextKeyService, this.contextMenuService, this.keybindingService, this.commandService, this.telemetryService);
    const countContainer = append(provider, $(".count"));
    const count2 = new CountBadge(countContainer, {}, defaultCountBadgeStyles);
    const visibilityDisposable = toolBar.onDidChangeDropdownVisibility((e) => provider.classList.toggle("active", e));
    const templateDisposable = combinedDisposable(label3, visibilityDisposable, toolBar);
    return { icon: icon2, label: label3, countContainer, count: count2, toolBar, elementDisposables: new DisposableStore(), templateDisposable };
  }
  renderElement(arg, index2, templateData) {
    const repository = isSCMRepository(arg) ? arg : arg.element;
    templateData.elementDisposables.add(autorun((reader) => {
      this.onDidChangeVisibleRepositoriesSignal.read(reader);
      const isVisible = this.scmViewService.isVisible(repository);
      const icon2 = ThemeIcon.isThemeIcon(repository.provider.iconPath) ? repository.provider.iconPath : Codicon.repo;
      const showSelectedIcon = icon2.id === Codicon.repo.id && isVisible && this.scmViewService.repositories.length > 1;
      templateData.icon.className = showSelectedIcon ? `icon ${ThemeIcon.asClassName(Codicon.repoSelected)}` : `icon ${ThemeIcon.asClassName(icon2)}`;
    }));
    let description = void 0;
    if (repository.provider.rootUri) {
      const repositoriesWithRootUri = this.scmViewService.repositories.filter((r2) => r2.provider.rootUri !== void 0 && this.uriIdentityService.extUri.isEqual(r2.provider.rootUri, repository.provider.rootUri));
      const repositoriesWithSameName = this.scmViewService.repositories.filter((r2) => r2.provider.rootUri !== void 0 && r2.provider.name === repository.provider.name);
      if (repositoriesWithRootUri.length > 1) {
        description = repository.provider.label;
      } else if (repositoriesWithSameName.length > 1) {
        const repositoryIndex = repositoriesWithSameName.findIndex((r2) => r2 === repository);
        const shortDescription = shorten(repositoriesWithSameName.map((r2) => this.labelService.getUriLabel(dirname2(r2.provider.rootUri), { relative: true })));
        description = shortDescription[repositoryIndex];
      }
    }
    let label3;
    if (this.scmViewService.explorerEnabledConfig.get() === false) {
      label3 = repository.provider.name;
    } else {
      const parentRepository = this.scmViewService.repositories.find((r2) => r2.provider.id === repository.provider.parentId);
      label3 = parentRepository ? `${parentRepository.provider.name} / ${repository.provider.name}` : repository.provider.name;
    }
    const title = repository.provider.rootUri ? `${repository.provider.label}: ${this.labelService.getUriLabel(repository.provider.rootUri)}` : repository.provider.label;
    templateData.label.setLabel(label3, description, { title });
    let statusPrimaryActions = [];
    let menuPrimaryActions = [];
    let menuSecondaryActions = [];
    const updateToolbar = () => {
      templateData.toolBar.setActions([...statusPrimaryActions, ...menuPrimaryActions], menuSecondaryActions);
    };
    templateData.elementDisposables.add(autorun((reader) => {
      const commands = repository.provider.statusBarCommands.read(reader) ?? [];
      statusPrimaryActions = commands.map((c) => reader.store.add(new StatusBarAction(c, this.commandService)));
      updateToolbar();
    }));
    templateData.elementDisposables.add(autorun((reader) => {
      const count2 = repository.provider.count.read(reader) ?? getRepositoryResourceCount(repository.provider);
      templateData.countContainer.setAttribute("data-count", String(count2));
      templateData.count.setCount(count2);
    }));
    templateData.elementDisposables.add(autorun((reader) => {
      repository.provider.contextValue.read(reader);
      const repositoryMenus = this.scmViewService.menus.getRepositoryMenus(repository.provider);
      const menu = this.toolbarMenuId === MenuId.SCMTitle ? repositoryMenus.titleMenu.menu : repositoryMenus.getRepositoryMenu(repository);
      reader.store.add(connectPrimaryMenu(menu, (primary, secondary) => {
        menuPrimaryActions = primary;
        menuSecondaryActions = secondary;
        updateToolbar();
      }, this.toolbarMenuId === MenuId.SCMTitle ? "navigation" : "inline"));
    }));
    templateData.toolBar.context = repository.provider;
  }
  renderCompressedElements() {
    throw new Error("Should never happen since node is incompressible");
  }
  disposeElement(group2, index2, template2) {
    template2.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposable.dispose();
    templateData.count.dispose();
  }
};

RepositoryRenderer = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, ISCMViewService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IUriIdentityService)
], RepositoryRenderer);
export { RepositoryActionRunner, RepositoryRenderer };
