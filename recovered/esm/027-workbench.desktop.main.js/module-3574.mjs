// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeViews/common/newFile.contribution.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { promiseWithResolvers } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/welcomeViews/common/newFile.contribution.ts
var builtInSource = localize(22243, null);

var category9 = localize2(22245, "Create");

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "welcome.showNewFileEntries",
      title: localize2(22252, "New File..."),
      category: category9,
      f1: true,
      precondition: IsSessionsWindowContext.negate(),
      keybinding: {
        primary: 512 /* Alt */ + 2048 /* CtrlCmd */ + 256 /* WinCtrl */ + 44 /* KeyN */,
        weight: 200 /* WorkbenchContrib */
      },
      menu: {
        id: MenuId.MenubarFileMenu,
        group: "1_new",
        order: 2,
        when: IsSessionsWindowContext.negate()
      }
    });
  }
  async run(accessor) {
    return assertReturnsDefined(NewFileTemplatesManager.Instance).run();
  }
});

var NewFileTemplatesManager = class extends Disposable {
  constructor(quickInputService, contextKeyService, commandService, keybindingService, menuService) {
    super();
    this.quickInputService = quickInputService;
    this.contextKeyService = contextKeyService;
    this.commandService = commandService;
    this.keybindingService = keybindingService;
    NewFileTemplatesManager.Instance = this;
    this._register({ dispose() {
      if (NewFileTemplatesManager.Instance === this) {
        NewFileTemplatesManager.Instance = void 0;
      }
    } });
    this.menu = menuService.createMenu(MenuId.NewFile, contextKeyService);
  }
  allEntries() {
    const items = [];
    for (const [groupName, group2] of this.menu.getActions({ renderShortTitle: true })) {
      for (const action of group2) {
        if (action instanceof MenuItemAction) {
          items.push({ commandID: action.item.id, from: action.item.source?.title ?? builtInSource, title: action.label, group: groupName });
        }
      }
    }
    return items;
  }
  async run() {
    const entries2 = this.allEntries();
    if (entries2.length === 0) {
      throw Error("Unexpected empty new items list");
    } else if (entries2.length === 1) {
      this.commandService.executeCommand(entries2[0].commandID);
      return true;
    } else {
      return this.selectNewEntry(entries2);
    }
  }
  async selectNewEntry(entries2) {
    const { promise: resultPromise, resolve: resolveResult } = promiseWithResolvers();
    const disposables = new DisposableStore();
    const qp = this.quickInputService.createQuickPick({ useSeparators: true });
    qp.title = localize(22250, null);
    qp.placeholder = localize(22249, null);
    qp.sortByLabel = false;
    qp.matchOnDetail = true;
    qp.matchOnDescription = true;
    const sortCategories = (a, b) => {
      const categoryPriority = { "file": 1, "notebook": 2 };
      if (categoryPriority[a.group] && categoryPriority[b.group]) {
        if (categoryPriority[a.group] !== categoryPriority[b.group]) {
          return categoryPriority[b.group] - categoryPriority[a.group];
        }
      } else if (categoryPriority[a.group]) {
        return 1;
      } else if (categoryPriority[b.group]) {
        return -1;
      }
      if (a.from === builtInSource) {
        return 1;
      }
      if (b.from === builtInSource) {
        return -1;
      }
      return a.from.localeCompare(b.from);
    };
    const displayCategory = {
      "file": localize(22246, null),
      "notebook": localize(22251, null)
    };
    const refreshQp = (entries3) => {
      const items = [];
      let lastSeparator;
      entries3.sort((a, b) => -sortCategories(a, b)).forEach((entry) => {
        const command4 = entry.commandID;
        const keybinding = this.keybindingService.lookupKeybinding(command4 || "", this.contextKeyService);
        if (lastSeparator !== entry.group) {
          items.push({
            type: "separator",
            label: displayCategory[entry.group] ?? entry.group
          });
          lastSeparator = entry.group;
        }
        items.push({
          ...entry,
          label: entry.title,
          type: "item",
          keybinding,
          buttons: command4 ? [
            {
              iconClass: "codicon codicon-gear",
              tooltip: localize(22244, null)
            }
          ] : [],
          detail: "",
          description: entry.from
        });
      });
      qp.items = items;
    };
    refreshQp(entries2);
    disposables.add(this.menu.onDidChange(() => refreshQp(this.allEntries())));
    disposables.add(qp.onDidChangeValue((val) => {
      if (val === "") {
        refreshQp(entries2);
        return;
      }
      const currentTextEntry = {
        commandID: "workbench.action.files.newFile",
        commandArgs: { languageId: void 0, viewType: void 0, fileName: val },
        title: localize(22248, null, val),
        group: "file",
        from: builtInSource
      };
      refreshQp([currentTextEntry, ...entries2]);
    }));
    disposables.add(qp.onDidAccept(async (e) => {
      const selected = qp.selectedItems[0];
      resolveResult(!!selected);
      qp.hide();
      if (selected) {
        await this.commandService.executeCommand(selected.commandID, selected.commandArgs);
      }
    }));
    disposables.add(qp.onDidHide(() => {
      qp.dispose();
      disposables.dispose();
      resolveResult(false);
    }));
    disposables.add(qp.onDidTriggerItemButton((e) => {
      qp.hide();
      this.commandService.executeCommand("workbench.action.openGlobalKeybindings", e.item.commandID);
      resolveResult(false);
    }));
    qp.show();
    return resultPromise;
  }
};

NewFileTemplatesManager = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService)
], NewFileTemplatesManager);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NewFileTemplatesManager, 3 /* Restored */);

MenuRegistry.appendMenuItem(MenuId.NewFile, {
  group: "file",
  command: {
    id: "workbench.action.files.newUntitledFile",
    title: localize(22247, null)
  },
  order: 1
});
export { builtInSource, category9, NewFileTemplatesManager };
