// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/activity.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { getRepositoryResourceCount, getSCMRepositoryIcon, getStatusBarCommandGenericName } from "./module-2028.mjs";
import { IActivityService, NumberBadge } from "./module-1449.mjs";
import { localize } from "./module-0001.mjs";
import { ISCMService, ISCMViewService, VIEW_PANE_ID } from "./module-1080.mjs";
import { basename2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { ITitleService } from "./module-1595.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/scm/browser/activity.ts
var ActiveRepositoryContextKeys = {
  ActiveRepositoryName: new RawContextKey("scmActiveRepositoryName", ""),
  ActiveRepositoryBranchName: new RawContextKey("scmActiveRepositoryBranchName", "")
};

var SCMActiveRepositoryController = class extends Disposable {
  constructor(activityService, configurationService, contextKeyService, scmService, scmViewService, statusbarService, titleService) {
    super();
    this.activityService = activityService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.scmService = scmService;
    this.scmViewService = scmViewService;
    this.statusbarService = statusbarService;
    this.titleService = titleService;
    this._activeRepositoryNameContextKey = ActiveRepositoryContextKeys.ActiveRepositoryName.bindTo(this.contextKeyService);
    this._activeRepositoryBranchNameContextKey = ActiveRepositoryContextKeys.ActiveRepositoryBranchName.bindTo(this.contextKeyService);
    this.titleService.registerVariables([
      { name: "activeRepositoryName", contextKey: ActiveRepositoryContextKeys.ActiveRepositoryName.key },
      { name: "activeRepositoryBranchName", contextKey: ActiveRepositoryContextKeys.ActiveRepositoryBranchName.key }
    ]);
    this._countBadgeConfig = observableConfigValue("scm.countBadge", "all", this.configurationService);
    this._visibleRepositories = observableFromEvent(
      this,
      Event2.any(this.scmViewService.onDidChangeVisibleRepositories, this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository),
      () => this.scmViewService.visibleRepositories
    );
    this._activeRepositoryHistoryItemRefName = derived((reader) => {
      const activeRepository = this.scmViewService.activeRepository.read(reader);
      const historyProvider = activeRepository?.repository.provider.historyProvider.read(reader);
      const historyItemRef = historyProvider?.historyItemRef.read(reader);
      return historyItemRef?.name;
    });
    this._countBadgeRepositories = derived(this, (reader) => {
      switch (this._countBadgeConfig.read(reader)) {
        case "all": {
          const repositories = this._visibleRepositories.read(reader);
          return repositories.map((r2) => ({ provider: r2.provider, resourceCount: this._getRepositoryResourceCount(r2) }));
        }
        case "focused": {
          const activeRepository = this.scmViewService.activeRepository.read(reader);
          return activeRepository ? [{ provider: activeRepository.repository.provider, resourceCount: this._getRepositoryResourceCount(activeRepository.repository) }] : [];
        }
        case "off":
          return [];
        default:
          throw new Error("Invalid countBadge setting");
      }
    });
    this._countBadge = derived(this, (reader) => {
      let total = 0;
      for (const repository of this._countBadgeRepositories.read(reader)) {
        const count2 = repository.provider.count?.read(reader);
        const resourceCount = repository.resourceCount.read(reader);
        total = total + (count2 ?? resourceCount);
      }
      return total;
    });
    this._register(autorun((reader) => {
      const countBadge2 = this._countBadge.read(reader);
      this._updateActivityCountBadge(countBadge2, reader.store);
    }));
    this._register(autorun((reader) => {
      const activeRepository = this.scmViewService.activeRepository.read(reader);
      const commands = activeRepository?.repository.provider.statusBarCommands.read(reader);
      this._updateStatusBar(activeRepository, commands ?? [], reader.store);
    }));
    this._register(autorun((reader) => {
      const activeRepository = this.scmViewService.activeRepository.read(reader);
      const historyItemRefName = this._activeRepositoryHistoryItemRefName.read(reader);
      this._updateActiveRepositoryContextKeys(activeRepository?.repository.provider.name, historyItemRefName);
    }));
  }
  _getRepositoryResourceCount(repository) {
    return observableFromEvent(this, repository.provider.onDidChangeResources, () => (
      /** @description repositoryResourceCount */
      getRepositoryResourceCount(repository.provider)
    ));
  }
  _updateActivityCountBadge(count2, store) {
    if (count2 === 0) {
      return;
    }
    const badge = new NumberBadge(count2, (num) => localize(18718, null, num));
    store.add(this.activityService.showViewActivity(VIEW_PANE_ID, { badge }));
  }
  _updateStatusBar(activeRepository, commands, store) {
    // 状态栏不再显示仓库名/分支（用户要求）：分支信息只在源代码管理面板查看。
    return;
    if (!activeRepository) {
      return;
    }
    const label3 = activeRepository.repository.provider.rootUri ? `${basename2(activeRepository.repository.provider.rootUri)} (${activeRepository.repository.provider.label})` : activeRepository.repository.provider.label;
    for (let index2 = 0; index2 < commands.length; index2++) {
      const command4 = commands[index2];
      const tooltip = `${label3}${command4.tooltip ? ` - ${command4.tooltip}` : ""}`;
      const genericCommandName = getStatusBarCommandGenericName(command4);
      const statusbarEntry = {
        name: localize(18719, null) + (genericCommandName ? ` ${genericCommandName}` : ""),
        text: index2 === 0 ? `$(${getSCMRepositoryIcon(activeRepository, activeRepository.repository).id}) ${activeRepository.repository.provider.name} · ${command4.title}` : command4.title,
        ariaLabel: tooltip,
        tooltip,
        command: command4.id ? command4 : void 0
      };
      store.add(
        index2 === 0 ? this.statusbarService.addEntry(statusbarEntry, `status.scm.${index2}`, 0 /* LEFT */, 1e4) : this.statusbarService.addEntry(statusbarEntry, `status.scm.${index2}`, 0 /* LEFT */, { location: { id: `status.scm.${index2 - 1}`, priority: 1e4 }, alignment: 1 /* RIGHT */, compact: true })
      );
    }
    if (commands.length === 0 && this.scmViewService.repositories.length > 1) {
      const icon2 = getSCMRepositoryIcon(activeRepository, activeRepository.repository);
      const repositoryStatusbarEntry = {
        name: localize(18720, null),
        text: `$(${icon2.id}) ${activeRepository.repository.provider.name}`,
        ariaLabel: label3,
        tooltip: label3,
        command: "scm.setActiveProvider"
      };
      store.add(this.statusbarService.addEntry(repositoryStatusbarEntry, "status.scm.provider", 0 /* LEFT */, { location: { id: `status.scm.0`, priority: 1e4 }, alignment: 0 /* LEFT */, compact: true }));
    }
  }
  _updateActiveRepositoryContextKeys(repositoryName, branchName) {
    this._activeRepositoryNameContextKey.set(repositoryName ?? "");
    this._activeRepositoryBranchNameContextKey.set(branchName ?? "");
  }
};

SCMActiveRepositoryController = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ISCMService),
  __decorateParam(4, ISCMViewService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, ITitleService)
], SCMActiveRepositoryController);

var SCMActiveResourceContextKeyController = class extends Disposable {
  constructor(editorGroupsService, scmService, uriIdentityService) {
    super();
    this.scmService = scmService;
    this.uriIdentityService = uriIdentityService;
    this._onDidRepositoryChange = new Emitter();
    const activeResourceHasChangesContextKey = new RawContextKey("scmActiveResourceHasChanges", false, localize(18716, null));
    const activeResourceRepositoryContextKey = new RawContextKey("scmActiveResourceRepository", void 0, localize(18717, null));
    this._repositories = observableFromEvent(
      this,
      Event2.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository),
      () => this.scmService.repositories
    );
    this._register(autorun((reader) => {
      for (const repository of this._repositories.read(reader)) {
        reader.store.add(Event2.runAndSubscribe(repository.provider.onDidChangeResources, () => {
          this._onDidRepositoryChange.fire();
        }));
      }
    }));
    const hasChangesContextKeyProvider = {
      contextKey: activeResourceHasChangesContextKey,
      getGroupContextKeyValue: (group2) => this._getEditorHasChanges(group2.activeEditor),
      onDidChange: this._onDidRepositoryChange.event
    };
    const repositoryContextKeyProvider = {
      contextKey: activeResourceRepositoryContextKey,
      getGroupContextKeyValue: (group2) => this._getEditorRepositoryId(group2.activeEditor),
      onDidChange: this._onDidRepositoryChange.event
    };
    this._store.add(editorGroupsService.registerContextKeyProvider(hasChangesContextKeyProvider));
    this._store.add(editorGroupsService.registerContextKeyProvider(repositoryContextKeyProvider));
  }
  _getEditorHasChanges(activeEditor) {
    const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
    if (!activeResource) {
      return false;
    }
    const activeResourceRepository = this.scmService.getRepository(activeResource);
    for (const resourceGroup of activeResourceRepository?.provider.groups ?? []) {
      if (resourceGroup.resources.some((scmResource) => this.uriIdentityService.extUri.isEqual(activeResource, scmResource.sourceUri))) {
        return true;
      }
    }
    return false;
  }
  _getEditorRepositoryId(activeEditor) {
    const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
    if (!activeResource) {
      return void 0;
    }
    const activeResourceRepository = this.scmService.getRepository(activeResource);
    return activeResourceRepository?.id;
  }
  dispose() {
    this._onDidRepositoryChange.dispose();
    super.dispose();
  }
};

SCMActiveResourceContextKeyController = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, ISCMService),
  __decorateParam(2, IUriIdentityService)
], SCMActiveResourceContextKeyController);
export { ActiveRepositoryContextKeys, SCMActiveRepositoryController, SCMActiveResourceContextKeyController };
