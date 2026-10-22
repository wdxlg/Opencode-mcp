// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmHistoryChatContext.ts
import { CodeDataTransfers } from "./module-0273.mjs";
import { Disposable } from "./module-0012.mjs";
import { ScmHistoryItemResolver } from "./module-1466.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatContextPickService, picksWithPromiseFn } from "./module-1453.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { coalesce } from "./module-0007.mjs";
import { fromNow } from "./module-0120.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ISCMService, ISCMViewService } from "./module-1080.mjs";
import { IModelService } from "./module-0080.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { basename2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/scm/browser/scmHistoryChatContext.ts
function extractSCMHistoryItemDropData(e) {
  if (!e.dataTransfer?.types.includes(CodeDataTransfers.SCM_HISTORY_ITEM)) {
    return void 0;
  }
  const data = e.dataTransfer?.getData(CodeDataTransfers.SCM_HISTORY_ITEM);
  if (!data) {
    return void 0;
  }
  return JSON.parse(data);
}

var SCMHistoryItemContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chat.scmHistoryItemContextContribution";
  }
  constructor(contextPickService, instantiationService, textModelResolverService) {
    super();
    this._store.add(contextPickService.registerChatContextItem(
      instantiationService.createInstance(SCMHistoryItemContext)
    ));
    this._store.add(textModelResolverService.registerTextModelContentProvider(
      ScmHistoryItemResolver.scheme,
      instantiationService.createInstance(SCMHistoryItemContextContentProvider)
    ));
    this._store.add(textModelResolverService.registerTextModelContentProvider(
      SCMHistoryItemChangeRangeContentProvider.scheme,
      instantiationService.createInstance(SCMHistoryItemChangeRangeContentProvider)
    ));
  }
};

SCMHistoryItemContextContribution = __decorateClass([
  __decorateParam(0, IChatContextPickService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextModelService)
], SCMHistoryItemContextContribution);

var SCMHistoryItemContext = class {
  constructor(_scmViewService) {
    this._scmViewService = _scmViewService;
    this.type = "pickerPick";
    this.label = localize(18888, null);
    this.icon = Codicon.gitCommit;
    this._delayer = new ThrottledDelayer(200);
  }
  static asAttachment(provider, historyItem) {
    const historyItemParentId = historyItem.parentIds.length > 0 ? historyItem.parentIds[0] : void 0;
    const multiDiffSourceUri = ScmHistoryItemResolver.getMultiDiffSourceUri(provider, historyItem.id, historyItemParentId, historyItem.displayId);
    const attachmentName = `$(${Codicon.repo.id})\xA0${provider.name}\xA0$(${Codicon.gitCommit.id})\xA0${historyItem.displayId ?? historyItem.id}`;
    return {
      id: historyItem.id,
      name: attachmentName,
      value: multiDiffSourceUri,
      historyItem: {
        ...historyItem,
        references: []
      },
      kind: "scmHistoryItem"
    };
  }
  isEnabled(widget) {
    const activeRepository = this._scmViewService.activeRepository.get();
    const supported3 = !!widget.attachmentCapabilities.supportsSourceControlAttachments;
    return activeRepository?.repository.provider.historyProvider.get() !== void 0 && supported3;
  }
  asPicker(_widget) {
    return {
      placeholder: localize(18889, null),
      picks: picksWithPromiseFn((query, token) => {
        const filterText = query.trim() !== "" ? query.trim() : void 0;
        const activeRepository = this._scmViewService.activeRepository.get();
        const historyProvider = activeRepository?.repository.provider.historyProvider.get();
        if (!activeRepository || !historyProvider) {
          return Promise.resolve([]);
        }
        const historyItemRefs = coalesce([
          historyProvider.historyItemRef.get(),
          historyProvider.historyItemRemoteRef.get(),
          historyProvider.historyItemBaseRef.get()
        ]).map((ref) => ref.id);
        return this._delayer.trigger(() => {
          return historyProvider.provideHistoryItems({ historyItemRefs, filterText, limit: 100 }, token).then((historyItems) => {
            if (!historyItems) {
              return [];
            }
            return historyItems.map((historyItem) => {
              const details = [`${historyItem.displayId ?? historyItem.id}`];
              if (historyItem.author) {
                details.push(historyItem.author);
              }
              if (historyItem.statistics) {
                details.push(`${historyItem.statistics.files} ${localize(18890, null)}`);
              }
              if (historyItem.timestamp) {
                details.push(fromNow(historyItem.timestamp, true, true));
              }
              return {
                iconClass: ThemeIcon.asClassName(Codicon.gitCommit),
                label: historyItem.subject,
                detail: details.join(`$(${Codicon.circleSmallFilled.id})`),
                asAttachment: () => SCMHistoryItemContext.asAttachment(activeRepository.repository.provider, historyItem)
              };
            });
          });
        });
      })
    };
  }
};

SCMHistoryItemContext = __decorateClass([
  __decorateParam(0, ISCMViewService)
], SCMHistoryItemContext);

var SCMHistoryItemContextContentProvider = class {
  constructor(_modelService, _scmService) {
    this._modelService = _modelService;
    this._scmService = _scmService;
  }
  async provideTextContent(resource) {
    const uriFields = ScmHistoryItemResolver.parseUri(resource);
    if (!uriFields) {
      return null;
    }
    const textModel = this._modelService.getModel(resource);
    if (textModel) {
      return textModel;
    }
    const { repositoryId, historyItemId } = uriFields;
    const repository = this._scmService.getRepository(repositoryId);
    const historyProvider = repository?.provider.historyProvider.get();
    if (!repository || !historyProvider) {
      return null;
    }
    const historyItemContext = await historyProvider.resolveHistoryItemChatContext(historyItemId);
    if (!historyItemContext) {
      return null;
    }
    return this._modelService.createModel(historyItemContext, null, resource, false);
  }
};

SCMHistoryItemContextContentProvider = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ISCMService)
], SCMHistoryItemContextContentProvider);

var SCMHistoryItemChangeRangeContentProvider = class {
  constructor(_modelService, _scmService) {
    this._modelService = _modelService;
    this._scmService = _scmService;
  }
  static {
    this.scheme = "scm-history-item-change-range";
  }
  async provideTextContent(resource) {
    const uriFields = this._parseUri(resource);
    if (!uriFields) {
      return null;
    }
    const textModel = this._modelService.getModel(resource);
    if (textModel) {
      return textModel;
    }
    const { repositoryId, start, end } = uriFields;
    const repository = this._scmService.getRepository(repositoryId);
    const historyProvider = repository?.provider.historyProvider.get();
    if (!repository || !historyProvider) {
      return null;
    }
    const historyItemChangeRangeContext = await historyProvider.resolveHistoryItemChangeRangeChatContext(end, start, resource.path);
    if (!historyItemChangeRangeContext) {
      return null;
    }
    return this._modelService.createModel(historyItemChangeRangeContext, null, resource, false);
  }
  _parseUri(uri5) {
    if (uri5.scheme !== SCMHistoryItemChangeRangeContentProvider.scheme) {
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
    const { repositoryId, start, end } = query;
    if (typeof repositoryId !== "string" || typeof start !== "string" || typeof end !== "string") {
      return void 0;
    }
    return { repositoryId, start, end };
  }
};

SCMHistoryItemChangeRangeContentProvider = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ISCMService)
], SCMHistoryItemChangeRangeContentProvider);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.addHistoryItemToChat",
      title: localize(18886, null),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryItemContext,
        group: "z_chat",
        order: 1,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, provider, historyItem) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = await chatWidgetService.revealWidget();
    if (!provider || !historyItem || !widget) {
      return;
    }
    widget.attachmentModel.addContext(SCMHistoryItemContext.asAttachment(provider, historyItem));
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.summarizeHistoryItem",
      title: localize(18887, null),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryItemContext,
        group: "z_chat",
        order: 2,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, provider, historyItem) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = await chatWidgetService.revealWidget();
    if (!provider || !historyItem || !widget) {
      return;
    }
    widget.attachmentModel.addContext(SCMHistoryItemContext.asAttachment(provider, historyItem));
    await widget.acceptInput("Summarize the attached history item");
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.addHistoryItemChangeToChat",
      title: localize(18886, null),
      f1: false,
      menu: {
        id: MenuId.SCMHistoryItemChangeContext,
        group: "z_chat",
        order: 1,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, historyItem, historyItemChange) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = await chatWidgetService.revealWidget();
    if (!historyItem || !historyItemChange.modifiedUri || !widget) {
      return;
    }
    widget.attachmentModel.addContext({
      id: historyItemChange.uri.toString(),
      name: `${basename2(historyItemChange.modifiedUri)}`,
      value: historyItemChange.modifiedUri,
      historyItem,
      kind: "scmHistoryItemChange"
    });
  }
});
export { extractSCMHistoryItemDropData, SCMHistoryItemContextContribution, SCMHistoryItemContext, SCMHistoryItemContextContentProvider, SCMHistoryItemChangeRangeContentProvider };
