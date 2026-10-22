// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/quickAccess/browser/terminalQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { localize } from "./module-0001.mjs";
import { getColorClass, getIconId, getUriClasses } from "./module-1175.mjs";
import { matchesFuzzyIconAware, parseLabelWithIcons } from "./module-0461.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { killTerminalIcon, renameTerminalIcon } from "./module-2351.mjs";
import { terminalStrings } from "./module-3261.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from "./module-1149.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/terminalContrib/quickAccess/browser/terminalQuickAccess.ts
var terminalPicks = [];

var TerminalQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(_commandService, _editorService, _instantiationService, _terminalEditorService, _terminalGroupService, _terminalService, _themeService) {
    super(TerminalQuickAccessProvider.PREFIX, { canAcceptInBackground: true });
    this._commandService = _commandService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalService = _terminalService;
    this._themeService = _themeService;
  }
  static {
    this.PREFIX = "term ";
  }
  _getPicks(filter2) {
    terminalPicks = [];
    terminalPicks.push({ type: "separator", label: "panel" });
    const terminalGroups = this._terminalGroupService.groups;
    for (let groupIndex = 0; groupIndex < terminalGroups.length; groupIndex++) {
      const terminalGroup = terminalGroups[groupIndex];
      for (let terminalIndex = 0; terminalIndex < terminalGroup.terminalInstances.length; terminalIndex++) {
        const terminal2 = terminalGroup.terminalInstances[terminalIndex];
        const pick = this._createPick(terminal2, terminalIndex, filter2, { groupIndex, groupSize: terminalGroup.terminalInstances.length });
        if (pick) {
          terminalPicks.push(pick);
        }
      }
    }
    if (terminalPicks.length > 0) {
      terminalPicks.push({ type: "separator", label: "editor" });
    }
    const terminalEditors = this._terminalEditorService.instances;
    for (let editorIndex = 0; editorIndex < terminalEditors.length; editorIndex++) {
      const term = terminalEditors[editorIndex];
      term.target = 2 /* Editor */;
      const pick = this._createPick(term, editorIndex, filter2);
      if (pick) {
        terminalPicks.push(pick);
      }
    }
    if (terminalPicks.length > 0) {
      terminalPicks.push({ type: "separator" });
    }
    const createTerminalLabel = localize(20810, null);
    terminalPicks.push({
      label: `$(plus) ${createTerminalLabel}`,
      ariaLabel: createTerminalLabel,
      accept: () => this._commandService.executeCommand("workbench.action.terminal.new" /* New */)
    });
    const createWithProfileLabel = localize(20811, null);
    terminalPicks.push({
      label: `$(plus) ${createWithProfileLabel}`,
      ariaLabel: createWithProfileLabel,
      accept: () => this._commandService.executeCommand("workbench.action.terminal.newWithProfile" /* NewWithProfile */)
    });
    return terminalPicks;
  }
  _createPick(terminal2, terminalIndex, filter2, groupInfo) {
    const iconId = this._instantiationService.invokeFunction(getIconId, terminal2);
    const index2 = groupInfo ? groupInfo.groupSize > 1 ? `${groupInfo.groupIndex + 1}.${terminalIndex + 1}` : `${groupInfo.groupIndex + 1}` : `${terminalIndex + 1}`;
    const label3 = `$(${iconId}) ${index2}: ${terminal2.title}`;
    const iconClasses = [];
    const colorClass = getColorClass(terminal2);
    if (colorClass) {
      iconClasses.push(colorClass);
    }
    const uriClasses = getUriClasses(terminal2, this._themeService.getColorTheme().type);
    if (uriClasses) {
      iconClasses.push(...uriClasses);
    }
    const highlights = matchesFuzzyIconAware(filter2, parseLabelWithIcons(label3), true);
    if (highlights) {
      return {
        label: label3,
        description: terminal2.description,
        highlights: { label: highlights },
        buttons: [
          {
            iconClass: ThemeIcon.asClassName(renameTerminalIcon),
            tooltip: localize(20809, null)
          },
          {
            iconClass: ThemeIcon.asClassName(killTerminalIcon),
            tooltip: terminalStrings.kill.value
          }
        ],
        iconClasses,
        trigger: (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              this._commandService.executeCommand("workbench.action.terminal.rename" /* Rename */, terminal2);
              return 0 /* NO_ACTION */;
            case 1:
              this._terminalService.safeDisposeTerminal(terminal2);
              return 3 /* REMOVE_ITEM */;
          }
          return 0 /* NO_ACTION */;
        },
        accept: (keyMod, event) => {
          if (terminal2.target === 2 /* Editor */) {
            const existingEditors = this._editorService.findEditors(terminal2.resource);
            this._terminalEditorService.openEditor(terminal2, { viewColumn: existingEditors?.[0].groupId });
            this._terminalEditorService.setActiveInstance(terminal2);
          } else {
            this._terminalGroupService.showPanel(!event.inBackground);
            this._terminalGroupService.setActiveInstance(terminal2);
          }
        }
      };
    }
    return void 0;
  }
};

TerminalQuickAccessProvider = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITerminalEditorService),
  __decorateParam(4, ITerminalGroupService),
  __decorateParam(5, ITerminalService),
  __decorateParam(6, IThemeService)
], TerminalQuickAccessProvider);
export { terminalPicks, TerminalQuickAccessProvider };
