// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/browser/issueQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1520.mjs";
import { localize } from "./module-0001.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/contrib/issue/browser/issueQuickAccess.ts
var IssueQuickAccess = class extends PickerQuickAccessProvider {
  constructor(menuService, contextKeyService, commandService, extensionService, productService) {
    super(IssueQuickAccess.PREFIX, { canAcceptInBackground: true });
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.commandService = commandService;
    this.extensionService = extensionService;
    this.productService = productService;
  }
  static {
    this.PREFIX = "issue ";
  }
  _getPicks(filter2) {
    const issuePicksConst = new Array();
    const issuePicksParts = new Array();
    const extensionIdSet = /* @__PURE__ */ new Set();
    const productLabel = this.productService.nameLong;
    const marketPlaceLabel = localize(16281, null);
    const productFilter = matchesFuzzy(filter2, productLabel, true);
    const marketPlaceFilter = matchesFuzzy(filter2, marketPlaceLabel, true);
    if (productFilter) {
      issuePicksConst.push({
        label: productLabel,
        ariaLabel: productLabel,
        highlights: { label: productFilter },
        accept: () => this.commandService.executeCommand("workbench.action.openIssueReporter", { issueSource: "vscode" /* VSCode */ })
      });
    }
    if (marketPlaceFilter) {
      issuePicksConst.push({
        label: marketPlaceLabel,
        ariaLabel: marketPlaceLabel,
        highlights: { label: marketPlaceFilter },
        accept: () => this.commandService.executeCommand("workbench.action.openIssueReporter", { issueSource: "marketplace" /* Marketplace */ })
      });
    }
    issuePicksConst.push({ type: "separator", label: localize(16280, null) });
    const actions = this.menuService.getMenuActions(MenuId.IssueReporter, this.contextKeyService, { renderShortTitle: true }).flatMap((entry) => entry[1]);
    actions.forEach((action) => {
      if ("source" in action.item && action.item.source) {
        extensionIdSet.add(action.item.source.id);
      }
      const pick = this._createPick(filter2, action);
      if (pick) {
        issuePicksParts.push(pick);
      }
    });
    this.extensionService.extensions.forEach((extension) => {
      if (!extension.isBuiltin) {
        const pick = this._createPick(filter2, void 0, extension);
        const id2 = extension.identifier.value;
        if (pick && !extensionIdSet.has(id2)) {
          issuePicksParts.push(pick);
        }
        extensionIdSet.add(id2);
      }
    });
    issuePicksParts.sort((a, b) => {
      const aLabel = a.label ?? "";
      const bLabel = b.label ?? "";
      return aLabel.localeCompare(bLabel);
    });
    return [...issuePicksConst, ...issuePicksParts];
  }
  _createPick(filter2, action, extension) {
    const buttons = [{
      iconClass: ThemeIcon.asClassName(Codicon.info),
      tooltip: localize(16279, null)
    }];
    let label3;
    let trigger;
    let accept;
    if (action && "source" in action.item && action.item.source) {
      label3 = action.item.source?.title;
      trigger = () => {
        if ("source" in action.item && action.item.source) {
          this.commandService.executeCommand("extension.open", action.item.source.id);
        }
        return 1 /* CLOSE_PICKER */;
      };
      accept = () => {
        action.run();
      };
    } else if (extension) {
      label3 = extension.displayName ?? extension.name;
      trigger = () => {
        this.commandService.executeCommand("extension.open", extension.identifier.value);
        return 1 /* CLOSE_PICKER */;
      };
      accept = () => {
        this.commandService.executeCommand("workbench.action.openIssueReporter", extension.identifier.value);
      };
    } else {
      return void 0;
    }
    const highlights = matchesFuzzy(filter2, label3, true);
    if (highlights) {
      return {
        label: label3,
        highlights: { label: highlights },
        buttons,
        trigger,
        accept
      };
    }
    return void 0;
  }
};

IssueQuickAccess = __decorateClass([
  __decorateParam(0, IMenuService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IProductService)
], IssueQuickAccess);
export { IssueQuickAccess };
