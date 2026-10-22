// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/util.ts
import { ResourceTree } from "./module-1258.mjs";
import { MenuItemAction } from "./module-0092.mjs";
import { createActionViewItem, getActionBarActions, getContextMenuActions } from "./module-0516.mjs";
import { equals } from "./module-0007.mjs";
import { Action } from "./module-0082.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { reset } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/scm/browser/util.ts
function isSCMViewService(element) {
  return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
}

function isSCMRepository(element) {
  return !!element.provider && !!element.input;
}

function isSCMInput(element) {
  return !!element.validateInput && typeof element.value === "string";
}

function isSCMActionButton(element) {
  return element.type === "actionButton";
}

function isSCMResourceGroup(element) {
  return !!element.provider && !!element.resources;
}

function isSCMResource(element) {
  return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}

function isSCMResourceNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
}

function isSCMHistoryItemViewModelTreeElement(element) {
  return element.type === "historyItemViewModel";
}

function isSCMHistoryItemLoadMoreTreeElement(element) {
  return element.type === "historyItemLoadMore";
}

function isSCMHistoryItemChangeViewModelTreeElement(element) {
  return element.type === "historyItemChangeViewModel";
}

function isSCMHistoryItemChangeNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMHistoryItemViewModelTreeElement(element.context);
}

function isSCMArtifactGroupTreeElement(element) {
  return element.type === "artifactGroup";
}

function isSCMArtifactNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMArtifactGroupTreeElement(element.context);
}

function isSCMArtifactTreeElement(element) {
  return element.type === "artifact";
}

var compareActions = (a, b) => {
  if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
    return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
  }
  return a.id === b.id && a.enabled === b.enabled;
};

function connectPrimaryMenu(menu, callback, primaryGroup, arg) {
  let cachedPrimary = [];
  let cachedSecondary = [];
  const updateActions = () => {
    const { primary, secondary } = getActionBarActions(menu.getActions({ arg, shouldForwardArgs: true }), primaryGroup);
    if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
      return;
    }
    cachedPrimary = primary;
    cachedSecondary = secondary;
    callback(primary, secondary);
  };
  updateActions();
  return menu.onDidChange(updateActions);
}

function collectContextMenuActions(menu, arg) {
  return getContextMenuActions(menu.getActions({ arg, shouldForwardArgs: true }), "inline").secondary;
}

var StatusBarAction = class extends Action {
  constructor(command4, commandService) {
    super(`statusbaraction{${command4.id}}`, getStatusBarCommandGenericName(command4), "", true);
    this.command = command4;
    this.commandService = commandService;
    this.commandTitle = command4.title;
    this.tooltip = command4.tooltip || "";
  }
  run() {
    return this.commandService.executeCommand(this.command.id, ...this.command.arguments || []);
  }
};

var StatusBarActionViewItem = class extends ActionViewItem {
  constructor(action, options3) {
    super(null, action, { ...options3, icon: false, label: true });
    this._commandTitle = action.commandTitle;
  }
  render(container3) {
    container3.classList.add("scm-status-bar-action");
    super.render(container3);
  }
  updateLabel() {
    if (this.options.label && this.label) {
      const elements = renderLabelWithIcons(this._commandTitle ?? this.action.label).map((element) => {
        if (typeof element === "string") {
          const span = document.createElement("span");
          span.textContent = element;
          return span;
        }
        return element;
      });
      reset(this.label, ...elements);
    }
  }
};

function getActionViewItemProvider(instaService) {
  return (action, options3) => {
    if (action instanceof StatusBarAction) {
      return new StatusBarActionViewItem(action, options3);
    }
    return createActionViewItem(instaService, action, options3);
  };
}

function getProviderKey(provider) {
  return `${provider.providerId}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}

function getRepositoryResourceCount(provider) {
  return provider.groups.reduce((r2, g) => r2 + g.resources.length, 0);
}

function getHistoryItemEditorTitle(historyItem) {
  return `${historyItem.displayId ?? historyItem.id} - ${historyItem.subject}`;
}

function getSCMRepositoryIcon(activeRepository, repository) {
  if (!ThemeIcon.isThemeIcon(repository.provider.iconPath)) {
    return Codicon.repo;
  }
  if (activeRepository?.pinned === true && activeRepository?.repository.id === repository.id && repository.provider.iconPath.id === Codicon.repo.id) {
    return Codicon.repoPinned;
  }
  return repository.provider.iconPath;
}

function getStatusBarCommandGenericName(command4) {
  let genericName = void 0;
  if (typeof command4.arguments?.[0] === "string") {
    const lastIndex = command4.arguments[0].lastIndexOf("/");
    genericName = lastIndex !== -1 ? command4.arguments[0].substring(0, lastIndex) : command4.arguments[0];
    genericName = genericName.replace(/^(?:git\.|remoteHub\.)/, "").trim();
    if (genericName.length === 0) {
      return void 0;
    }
    genericName = genericName[0].toLocaleUpperCase() + genericName.slice(1);
  }
  return genericName;
}
export { isSCMViewService, isSCMRepository, isSCMInput, isSCMActionButton, isSCMResourceGroup, isSCMResource, isSCMResourceNode, isSCMHistoryItemViewModelTreeElement, isSCMHistoryItemLoadMoreTreeElement, isSCMHistoryItemChangeViewModelTreeElement, isSCMHistoryItemChangeNode, isSCMArtifactGroupTreeElement, isSCMArtifactNode, isSCMArtifactTreeElement, connectPrimaryMenu, collectContextMenuActions, getActionViewItemProvider, getProviderKey, getRepositoryResourceCount, getHistoryItemEditorTitle, getSCMRepositoryIcon, getStatusBarCommandGenericName, compareActions, StatusBarAction, StatusBarActionViewItem };
