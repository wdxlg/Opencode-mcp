// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/history/browser/terminalRunRecentQuickPick.ts
import { IAccessibleViewService } from "./module-0799.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPathService } from "./module-0939.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { commandHistoryFuzzySearchIcon, commandHistoryOpenFileIcon, commandHistoryOutputIcon, commandHistoryRemoveIcon } from "./module-2326.mjs";
import { localize } from "./module-0001.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { collapseTildePath } from "./module-3036.mjs";
import { terminalStrings } from "./module-3030.mjs";
import { getCommandHistory, getDirectoryHistory, getShellFileHistory } from "./module-3189.mjs";
import { extUri, extUriIgnorePathCase } from "./module-0034.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { fromNow } from "./module-0120.mjs";
import { isObject } from "./module-0010.mjs";
import { showWithPinnedItems } from "./module-3190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/contrib/terminalContrib/history/browser/terminalRunRecentQuickPick.ts
async function showRunRecentQuickPick(accessor, instance2, terminalInRunCommandPicker, type, filterMode, value2) {
  if (!instance2.xterm) {
    return;
  }
  const accessibleViewService = accessor.get(IAccessibleViewService);
  const editorService = accessor.get(IEditorService);
  const instantiationService = accessor.get(IInstantiationService);
  const quickInputService = accessor.get(IQuickInputService);
  const storageService = accessor.get(IStorageService);
  const pathService = accessor.get(IPathService);
  const runRecentStorageKey = `${"terminal.pinnedRecentCommands" /* PinnedRecentCommandsPrefix */}.${instance2.shellType}`;
  let placeholder;
  let items = [];
  const commandMap = /* @__PURE__ */ new Set();
  const removeFromCommandHistoryButton = {
    iconClass: ThemeIcon.asClassName(commandHistoryRemoveIcon),
    tooltip: localize(20761, null)
  };
  const commandOutputButton = {
    iconClass: ThemeIcon.asClassName(commandHistoryOutputIcon),
    tooltip: localize(20767, null),
    alwaysVisible: false
  };
  const openResourceButtons = [];
  if (type === "command") {
    let formatLabel = function(label3) {
      return label3.replace(/\r?\n/g, "\u23CE").replace(/\s\s\s+/g, "\u22EF");
    };
    placeholder = isMacintosh ? localize(20763, null) : localize(20762, null);
    const cmdDetection = instance2.capabilities.get(2 /* CommandDetection */);
    const commands = cmdDetection?.commands;
    const executingCommand = cmdDetection?.executingCommand;
    if (executingCommand) {
      commandMap.add(executingCommand);
    }
    if (commands && commands.length > 0) {
      for (let i2 = commands.length - 1; i2 >= 0; i2--) {
        const entry = commands[i2];
        const label3 = entry.command.trim();
        if (label3.length === 0 || commandMap.has(label3)) {
          continue;
        }
        let description = collapseTildePath(entry.cwd, instance2.userHome, instance2.os === 1 /* Windows */ ? "\\" : "/");
        if (entry.exitCode) {
          if (entry.exitCode === -1) {
            description += " failed";
          } else {
            description += ` exitCode: ${entry.exitCode}`;
          }
        }
        description = description.trim();
        const buttons = [commandOutputButton];
        const lastItem = items.length > 0 ? items[items.length - 1] : void 0;
        if (lastItem?.type !== "separator" && lastItem?.label === label3) {
          lastItem.id = entry.timestamp.toString();
          lastItem.description = description;
          continue;
        }
        items.push({
          label: formatLabel(label3),
          rawLabel: label3,
          description,
          id: entry.timestamp.toString(),
          command: entry,
          buttons: entry.hasOutput() ? buttons : void 0
        });
        commandMap.add(label3);
      }
    }
    if (executingCommand) {
      items.unshift({
        label: formatLabel(executingCommand),
        rawLabel: executingCommand,
        description: cmdDetection.cwd
      });
    }
    if (items.length > 0) {
      items.unshift({
        type: "separator",
        buttons: [],
        // HACK: Force full sized separators as there's no flag currently
        label: terminalStrings.currentSessionCategory
      });
    }
    const history = instantiationService.invokeFunction(getCommandHistory);
    const previousSessionItems = [];
    for (const [label3, info] of history.entries) {
      if (!commandMap.has(label3) && info.shellType === instance2.shellType) {
        previousSessionItems.unshift({
          label: formatLabel(label3),
          rawLabel: label3,
          buttons: [removeFromCommandHistoryButton]
        });
        commandMap.add(label3);
      }
    }
    if (previousSessionItems.length > 0) {
      items.push(
        {
          type: "separator",
          buttons: [],
          // HACK: Force full sized separators as there's no flag currently
          label: terminalStrings.previousSessionCategory
        },
        ...previousSessionItems
      );
    }
    const shellFileHistory2 = await instantiationService.invokeFunction(getShellFileHistory, instance2.shellType);
    if (shellFileHistory2 !== void 0) {
      const dedupedShellFileItems = [];
      for (const label3 of shellFileHistory2.commands) {
        if (!commandMap.has(label3)) {
          dedupedShellFileItems.unshift({
            label: formatLabel(label3),
            rawLabel: label3
          });
        }
      }
      if (dedupedShellFileItems.length > 0) {
        const button = {
          iconClass: ThemeIcon.asClassName(commandHistoryOpenFileIcon),
          tooltip: localize(20760, null),
          alwaysVisible: false,
          resource: shellFileHistory2.sourceResource
        };
        openResourceButtons.push(button);
        items.push(
          {
            type: "separator",
            buttons: [button],
            label: localize(20766, null, instance2.shellType),
            description: shellFileHistory2.sourceLabel
          },
          ...dedupedShellFileItems
        );
      }
    }
  } else {
    placeholder = isMacintosh ? localize(20765, null) : localize(20764, null);
    const uriComparer = instance2.os === 1 /* Windows */ ? extUriIgnorePathCase : extUri;
    const uniqueUris = new ResourceSet((o) => uriComparer.getComparisonKey(o));
    const cwds = instance2.capabilities.get(0 /* CwdDetection */)?.cwds || [];
    if (cwds && cwds.length > 0) {
      for (const label3 of cwds) {
        const itemUri = URI.file(label3);
        if (!uniqueUris.has(itemUri)) {
          uniqueUris.add(itemUri);
          items.push({
            label: await instance2.getUriLabelForShell(itemUri),
            rawLabel: label3
          });
        }
      }
      items = items.reverse();
      items.unshift({ type: "separator", label: terminalStrings.currentSessionCategory });
    }
    const history = instantiationService.invokeFunction(getDirectoryHistory);
    const previousSessionItems = [];
    for (const [label3, info] of history.entries) {
      if (info === null || info.remoteAuthority === instance2.remoteAuthority) {
        const itemUri = info?.remoteAuthority ? await pathService.fileURI(label3) : URI.file(label3);
        if (!uniqueUris.has(itemUri)) {
          uniqueUris.add(itemUri);
          previousSessionItems.unshift({
            label: await instance2.getUriLabelForShell(itemUri),
            rawLabel: label3,
            buttons: [removeFromCommandHistoryButton]
          });
        }
      }
    }
    if (previousSessionItems.length > 0) {
      items.push(
        { type: "separator", label: terminalStrings.previousSessionCategory },
        ...previousSessionItems
      );
    }
  }
  if (items.length === 0) {
    return;
  }
  const disposables = new DisposableStore();
  const fuzzySearchButton = {
    iconClass: ThemeIcon.asClassName(commandHistoryFuzzySearchIcon),
    tooltip: localize(20759, null),
    toggle: { checked: filterMode === "fuzzy" },
    location: 3 /* Input */
  };
  const outputProvider = disposables.add(instantiationService.createInstance(TerminalOutputProvider));
  const quickPick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
  const originalItems = items;
  quickPick.items = [...originalItems];
  quickPick.sortByLabel = false;
  quickPick.placeholder = placeholder;
  quickPick.matchOnLabelMode = filterMode || "contiguous";
  quickPick.buttons = [fuzzySearchButton];
  disposables.add(quickPick.onDidTriggerButton((button) => {
    if (button === fuzzySearchButton) {
      instantiationService.invokeFunction(showRunRecentQuickPick, instance2, terminalInRunCommandPicker, type, fuzzySearchButton.toggle.checked ? "fuzzy" : "contiguous", quickPick.value);
    }
  }));
  disposables.add(quickPick.onDidTriggerItemButton(async (e4) => {
    if (e4.button === removeFromCommandHistoryButton) {
      if (type === "command") {
        instantiationService.invokeFunction(getCommandHistory)?.remove(e4.item.label);
      } else {
        instantiationService.invokeFunction(getDirectoryHistory)?.remove(e4.item.rawLabel);
      }
    } else if (e4.button === commandOutputButton) {
      const selectedCommand = e4.item.command;
      const output = selectedCommand?.getOutput();
      if (output && selectedCommand?.command) {
        const textContent = await outputProvider.provideTextContent(URI.from(
          {
            scheme: TerminalOutputProvider.scheme,
            path: `${selectedCommand.command}... ${fromNow(selectedCommand.timestamp, true)}`,
            fragment: output,
            query: `terminal-output-${selectedCommand.timestamp}-${instance2.instanceId}`
          }
        ));
        if (textContent) {
          await editorService.openEditor({
            resource: textContent.uri
          });
        }
      }
    }
    await instantiationService.invokeFunction(showRunRecentQuickPick, instance2, terminalInRunCommandPicker, type, filterMode, value2);
  }));
  disposables.add(quickPick.onDidTriggerSeparatorButton(async (e4) => {
    const resource = openResourceButtons.find((openResourceButton) => e4.button === openResourceButton)?.resource;
    if (resource) {
      await editorService.openEditor({
        resource
      });
    }
  }));
  disposables.add(quickPick.onDidChangeValue(async (value3) => {
    if (!value3) {
      await instantiationService.invokeFunction(showRunRecentQuickPick, instance2, terminalInRunCommandPicker, type, filterMode, value3);
    }
  }));
  let terminalScrollStateSaved = false;
  function restoreScrollState() {
    terminalScrollStateSaved = false;
    instance2.xterm?.markTracker.restoreScrollState();
    instance2.xterm?.markTracker.clear();
  }
  disposables.add(quickPick.onDidChangeActive(async () => {
    const xterm = instance2.xterm;
    if (!xterm) {
      return;
    }
    const [item] = quickPick.activeItems;
    if (!item) {
      return;
    }
    function isItem2(obj) {
      return isObject(obj) && "rawLabel" in obj;
    }
    if (isItem2(item) && item.command && item.command.marker) {
      if (!terminalScrollStateSaved) {
        xterm.markTracker.saveScrollState();
        terminalScrollStateSaved = true;
      }
      const promptRowCount = item.command.getPromptRowCount();
      const commandRowCount = item.command.getCommandRowCount();
      xterm.markTracker.revealRange({
        start: {
          x: 1,
          y: item.command.marker.line - (promptRowCount - 1) + 1
        },
        end: {
          x: instance2.cols,
          y: item.command.marker.line + (commandRowCount - 1) + 1
        }
      });
    } else {
      restoreScrollState();
    }
  }));
  disposables.add(quickPick.onDidAccept(async () => {
    const result = quickPick.activeItems[0];
    let text2;
    if (type === "cwd") {
      text2 = `cd ${await instance2.preparePathForShell(result.rawLabel)}`;
    } else {
      text2 = result.rawLabel;
    }
    quickPick.hide();
    terminalScrollStateSaved = false;
    instance2.xterm?.markTracker.clear();
    instance2.scrollToBottom();
    instance2.runCommand(text2, !quickPick.keyMods.alt);
    if (quickPick.keyMods.alt) {
      instance2.focus();
    }
  }));
  disposables.add(quickPick.onDidHide(() => restoreScrollState()));
  if (value2) {
    quickPick.value = value2;
  }
  return new Promise((r2) => {
    terminalInRunCommandPicker.set(true);
    disposables.add(showWithPinnedItems(storageService, runRecentStorageKey, quickPick, true));
    disposables.add(quickPick.onDidHide(() => {
      terminalInRunCommandPicker.set(false);
      accessibleViewService.showLastProvider("terminal" /* Terminal */);
      r2();
      disposables.dispose();
    }));
  });
}

var TerminalOutputProvider = class extends Disposable {
  constructor(textModelResolverService, _modelService) {
    super();
    this._modelService = _modelService;
    this._register(textModelResolverService.registerTextModelContentProvider(TerminalOutputProvider.scheme, this));
  }
  static {
    this.scheme = "TERMINAL_OUTPUT";
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    return this._modelService.createModel(resource.fragment, null, resource, false);
  }
};

TerminalOutputProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService)
], TerminalOutputProvider);
export { showRunRecentQuickPick, TerminalOutputProvider };
