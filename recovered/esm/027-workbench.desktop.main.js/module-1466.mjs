// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/scmMultiDiffSourceResolver.ts
import { URI } from "./module-0032.mjs";
import { waitForState } from "./module-0056.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { IActivityService, ProgressBadge } from "./module-1449.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISCMService } from "./module-1080.mjs";
import { ValueWithChangeEvent } from "./module-0017.mjs";
import { basename } from "./module-0026.mjs";
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from "./module-1147.mjs";
import { ValueWithChangeEventFromObservable } from "./module-0063.mjs";
import { Disposable } from "./module-0012.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/scmMultiDiffSourceResolver.ts
var ScmMultiDiffSourceResolver = class {
  constructor(_scmService, _activityService) {
    this._scmService = _scmService;
    this._activityService = _activityService;
  }
  static {
    this._scheme = "scm-multi-diff-source";
  }
  static getMultiDiffSourceUri(repositoryUri, groupId) {
    return URI.from({
      scheme: ScmMultiDiffSourceResolver._scheme,
      query: JSON.stringify({ repositoryUri, groupId })
    });
  }
  static parseUri(uri5) {
    if (uri5.scheme !== ScmMultiDiffSourceResolver._scheme) {
      return void 0;
    }
    let query;
    try {
      query = JSON.parse(uri5.query);
    } catch (e) {
      return void 0;
    }
    if (typeof query !== "object" || query === null) {
      return void 0;
    }
    const { repositoryUri, groupId } = query;
    if (typeof repositoryUri !== "string" || typeof groupId !== "string") {
      return void 0;
    }
    return { repositoryUri: URI.parse(repositoryUri), groupId };
  }
  canHandleUri(uri5) {
    return ScmMultiDiffSourceResolver.parseUri(uri5) !== void 0;
  }
  async resolveDiffSource(uri5) {
    const { repositoryUri, groupId } = ScmMultiDiffSourceResolver.parseUri(uri5);
    const repository = await waitForState(
      observableFromEvent(
        this,
        this._scmService.onDidAddRepository,
        () => [...this._scmService.repositories].find((r2) => r2.provider.rootUri?.toString() === repositoryUri.toString())
      )
    );
    const group2 = await waitForState(observableFromEvent(
      this,
      repository.provider.onDidChangeResourceGroups,
      () => repository.provider.groups.find((g) => g.id === groupId)
    ));
    const scmActivities = observableFromEvent(
      this._activityService.onDidChangeActivity,
      () => [...this._activityService.getViewContainerActivities("workbench.view.scm")]
    );
    const scmViewHasNoProgressBadge = scmActivities.map((activities) => !activities.some((a) => a.badge instanceof ProgressBadge));
    await waitForState(scmViewHasNoProgressBadge, (v2) => v2);
    return new ScmResolvedMultiDiffSource(group2, repository);
  }
};

ScmMultiDiffSourceResolver = __decorateClass([
  __decorateParam(0, ISCMService),
  __decorateParam(1, IActivityService)
], ScmMultiDiffSourceResolver);

var ScmHistoryItemResolver = class {
  constructor(_scmService) {
    this._scmService = _scmService;
  }
  static {
    this.scheme = "scm-history-item";
  }
  static getMultiDiffSourceUri(provider, historyItemId, historyItemParentId, historyItemDisplayId) {
    return URI.from({
      scheme: ScmHistoryItemResolver.scheme,
      path: provider.rootUri?.fsPath,
      query: JSON.stringify({
        repositoryId: provider.id,
        historyItemId,
        historyItemParentId,
        historyItemDisplayId
      })
    }, true);
  }
  static parseUri(uri5) {
    if (uri5.scheme !== ScmHistoryItemResolver.scheme) {
      return void 0;
    }
    let query;
    try {
      query = JSON.parse(uri5.query);
    } catch (e) {
      return void 0;
    }
    if (typeof query !== "object" || query === null) {
      return void 0;
    }
    const { repositoryId, historyItemId, historyItemParentId, historyItemDisplayId } = query;
    if (typeof repositoryId !== "string" || typeof historyItemId !== "string" || typeof historyItemParentId !== "string" && historyItemParentId !== void 0 || typeof historyItemDisplayId !== "string" && historyItemDisplayId !== void 0) {
      return void 0;
    }
    return { repositoryId, historyItemId, historyItemParentId, historyItemDisplayId };
  }
  canHandleUri(uri5) {
    return ScmHistoryItemResolver.parseUri(uri5) !== void 0;
  }
  async resolveDiffSource(uri5) {
    const { repositoryId, historyItemId, historyItemParentId, historyItemDisplayId } = ScmHistoryItemResolver.parseUri(uri5);
    const repository = await waitForState(
      observableFromEvent(
        this,
        this._scmService.onDidAddRepository,
        () => this._scmService.getRepository(repositoryId)
      )
    );
    const historyProvider = await waitForState(repository.provider.historyProvider);
    const historyItemChanges = await historyProvider.provideHistoryItemChanges(historyItemId, historyItemParentId) ?? [];
    const resources = ValueWithChangeEvent.const(
      historyItemChanges.map((change) => {
        const goToFileEditorTitle = change.modifiedUri ? `${basename(change.modifiedUri.fsPath)} (${historyItemDisplayId ?? historyItemId})` : void 0;
        return new MultiDiffEditorItem(change.originalUri, change.modifiedUri, change.modifiedUri, goToFileEditorTitle);
      })
    );
    return { resources };
  }
};

ScmHistoryItemResolver = __decorateClass([
  __decorateParam(0, ISCMService)
], ScmHistoryItemResolver);

var ScmResolvedMultiDiffSource = class {
  constructor(_group, _repository) {
    this._group = _group;
    this._repository = _repository;
    this._resources = observableFromEvent(
      this._group.onDidChangeResources,
      () => (
        /** @description resources */
        this._group.resources.map((e) => new MultiDiffEditorItem(e.multiDiffEditorOriginalUri, e.multiDiffEditorModifiedUri, e.sourceUri))
      )
    );
    this.resources = new ValueWithChangeEventFromObservable(this._resources);
    this.contextKeys = {
      scmResourceGroup: this._group.id,
      scmProvider: this._repository.provider.providerId
    };
  }
};

var ScmMultiDiffSourceResolverContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.scmMultiDiffSourceResolver";
  }
  constructor(instantiationService, multiDiffSourceResolverService) {
    super();
    this._register(multiDiffSourceResolverService.registerResolver(instantiationService.createInstance(ScmHistoryItemResolver)));
    this._register(multiDiffSourceResolverService.registerResolver(instantiationService.createInstance(ScmMultiDiffSourceResolver)));
  }
};

ScmMultiDiffSourceResolverContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMultiDiffSourceResolverService)
], ScmMultiDiffSourceResolverContribution);

var OpenScmGroupAction = class _OpenScmGroupAction extends Action2 {
  static async openMultiFileDiffEditor(editorService, label3, repositoryRootUri, resourceGroupId, options3) {
    if (!repositoryRootUri) {
      return;
    }
    const multiDiffSource = ScmMultiDiffSourceResolver.getMultiDiffSourceUri(repositoryRootUri.toString(), resourceGroupId);
    return await editorService.openEditor({ label: label3, multiDiffSource, options: options3 });
  }
  constructor() {
    super({
      id: "_workbench.openScmMultiDiffEditor",
      title: localize2(17381, "Open Changes"),
      f1: false
    });
  }
  async run(accessor, options3) {
    const editorService = accessor.get(IEditorService);
    await _OpenScmGroupAction.openMultiFileDiffEditor(editorService, options3.title, URI.revive(options3.repositoryUri), options3.resourceGroupId);
  }
};
export { ScmMultiDiffSourceResolver, ScmHistoryItemResolver, ScmResolvedMultiDiffSource, ScmMultiDiffSourceResolverContribution, OpenScmGroupAction };
