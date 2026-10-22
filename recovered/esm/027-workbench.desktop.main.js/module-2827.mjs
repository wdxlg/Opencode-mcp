// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpPromptArgumentPick.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { assertNever } from "./module-0009.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { QueryBuilder } from "./module-1312.mjs";
import { basename2 } from "./module-0034.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { derived } from "./module-0054.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { RunOnceScheduler, disposableTimeout, timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ITerminalGroupService, ITerminalService } from "./module-1149.mjs";
import { ISearchService } from "./module-0999.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorService } from "./module-0934.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpPromptArgumentPick.ts
var SHELL_INTEGRATION_TIMEOUT = 5e3;

var NO_SHELL_INTEGRATION_IDLE = 1e3;

var SUGGEST_DEBOUNCE = 200;

var McpPromptArgumentPick = class extends Disposable {
  constructor(prompt, _quickInputService, _terminalService, _searchService, _workspaceContextService, _labelService, _fileService, _modelService, _languageService, _terminalGroupService, _instantiationService, _codeEditorService, _editorService) {
    super();
    this.prompt = prompt;
    this._quickInputService = _quickInputService;
    this._terminalService = _terminalService;
    this._searchService = _searchService;
    this._workspaceContextService = _workspaceContextService;
    this._labelService = _labelService;
    this._fileService = _fileService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._terminalGroupService = _terminalGroupService;
    this._instantiationService = _instantiationService;
    this._codeEditorService = _codeEditorService;
    this._editorService = _editorService;
    this.quickPick = this._register(_quickInputService.createQuickPick({ useSeparators: true }));
  }
  async createArgs(token) {
    const { quickPick, prompt } = this;
    quickPick.totalSteps = prompt.arguments.length;
    quickPick.step = 0;
    quickPick.ignoreFocusOut = true;
    quickPick.sortByLabel = false;
    const args2 = {};
    const backSnapshots = [];
    for (let i2 = 0; i2 < prompt.arguments.length; i2++) {
      const arg = prompt.arguments[i2];
      const restore2 = backSnapshots.at(i2);
      quickPick.step = i2 + 1;
      quickPick.placeholder = arg.required ? arg.description : `${arg.description || ""} (${localize(16992, null)})`;
      quickPick.title = localize(16990, null, arg.title || arg.name);
      quickPick.value = restore2?.value ?? (args2.hasOwnProperty(arg.name) && args2[arg.name] || "");
      quickPick.items = restore2?.items ?? [];
      quickPick.activeItems = restore2?.activeItems ?? [];
      quickPick.buttons = i2 > 0 ? [this._quickInputService.backButton] : [];
      const value2 = await this._getArg(arg, !!restore2, args2, token);
      if (value2.type === "back") {
        i2 -= 2;
      } else if (value2.type === "cancel") {
        return void 0;
      } else if (value2.type === "arg") {
        backSnapshots[i2] = { value: quickPick.value, items: quickPick.items.slice(), activeItems: quickPick.activeItems.slice() };
        args2[arg.name] = value2.value;
      } else {
        assertNever(value2);
      }
    }
    quickPick.value = "";
    quickPick.placeholder = localize(16978, null);
    quickPick.busy = true;
    return args2;
  }
  async _getArg(arg, didRestoreState, argsSoFar, token) {
    const { quickPick } = this;
    const store = new DisposableStore();
    const input$ = observableValue(this, quickPick.value);
    const asyncPicks = [
      {
        name: localize(16989, null),
        observer: this._promptCompletions(arg, input$, argsSoFar)
      },
      {
        name: localize(16980, null),
        observer: this._activeFileCompletions()
      },
      {
        name: localize(16984, null),
        observer: this._fileCompletions(input$)
      }
    ];
    store.add(autorun((reader) => {
      if (didRestoreState) {
        input$.read(reader);
        return;
      }
      let items = [];
      items.push({ id: "insert-text", label: localize(16983, null), iconClass: ThemeIcon.asClassName(Codicon.textSize), action: "text", alwaysShow: true });
      items.push({ id: "run-command", label: localize(16981, null), description: localize(16982, null), iconClass: ThemeIcon.asClassName(Codicon.terminal), action: "command", alwaysShow: true });
      let busy = false;
      for (const pick of asyncPicks) {
        const state = pick.observer.read(reader);
        busy ||= state.busy;
        if (state.picks) {
          items.push({ label: pick.name, type: "separator" });
          items = items.concat(state.picks);
        }
      }
      const previouslyActive = quickPick.activeItems;
      quickPick.busy = busy;
      quickPick.items = items;
      const lastActive = items.find((i2) => previouslyActive.some((a) => a.id === i2.id));
      const serverSuggestions = asyncPicks[0].observer;
      if (lastActive) {
        quickPick.activeItems = [lastActive];
      } else if (serverSuggestions.read(reader).picks?.length) {
        quickPick.activeItems = [items[3]];
      } else if (busy) {
        quickPick.activeItems = [];
      } else {
        quickPick.activeItems = [items[0]];
      }
    }));
    try {
      const value2 = await new Promise((resolve3) => {
        if (token) {
          store.add(token.onCancellationRequested(() => {
            resolve3(void 0);
          }));
        }
        store.add(quickPick.onDidChangeValue((value3) => {
          quickPick.validationMessage = void 0;
          input$.set(value3, void 0);
        }));
        store.add(quickPick.onDidAccept(() => {
          const item = quickPick.selectedItems[0];
          if (!quickPick.value && arg.required && (!item || item.action === "text" || item.action === "command")) {
            quickPick.validationMessage = localize(16985, null);
          } else if (!item) {
            resolve3({ id: "insert-text", label: "", action: "text" });
          } else {
            resolve3(item);
          }
        }));
        store.add(quickPick.onDidTriggerButton(() => {
          resolve3("back");
        }));
        store.add(quickPick.onDidHide(() => {
          resolve3(void 0);
        }));
        quickPick.show();
      });
      if (value2 === "back") {
        return { type: "back" };
      }
      if (value2 === void 0) {
        return { type: "cancel" };
      }
      store.clear();
      const cts = new CancellationTokenSource();
      store.add(toDisposable(() => cts.dispose(true)));
      store.add(quickPick.onDidHide(() => store.dispose()));
      switch (value2.action) {
        case "text":
          return { type: "arg", value: quickPick.value || void 0 };
        case "command":
          if (!quickPick.value) {
            return { type: "arg", value: void 0 };
          }
          quickPick.busy = true;
          return { type: "arg", value: await this._getTerminalOutput(quickPick.value, cts.token) };
        case "suggest":
          return { type: "arg", value: value2.label };
        case "file":
          quickPick.busy = true;
          return { type: "arg", value: await this._fileService.readFile(value2.uri).then((c) => c.value.toString()) };
        case "selectedText":
          return { type: "arg", value: value2.selectedText };
        default:
          assertNever(value2);
      }
    } finally {
      store.dispose();
    }
  }
  _promptCompletions(arg, input, argsSoFar) {
    const alreadyResolved = {};
    for (const [key3, value2] of Object.entries(argsSoFar)) {
      if (value2) {
        alreadyResolved[key3] = value2;
      }
    }
    return this._asyncCompletions(input, async (i2, t2) => {
      const items = await this.prompt.complete(arg.name, i2, alreadyResolved, t2);
      return items.map((i3) => ({ id: `suggest:${i3}`, label: i3, action: "suggest" }));
    });
  }
  _fileCompletions(input) {
    const qb = this._instantiationService.createInstance(QueryBuilder);
    return this._asyncCompletions(input, async (i2, token) => {
      if (!i2) {
        return [];
      }
      const query = qb.file(this._workspaceContextService.getWorkspace().folders, {
        filePattern: i2,
        maxResults: 10
      });
      const { results } = await this._searchService.fileSearch(query, token);
      return results.map((i3) => ({
        id: i3.resource.toString(),
        label: basename2(i3.resource),
        description: this._labelService.getUriLabel(i3.resource),
        iconClasses: getIconClasses(this._modelService, this._languageService, i3.resource),
        uri: i3.resource,
        action: "file"
      }));
    });
  }
  _activeFileCompletions() {
    const activeEditorChange = observableSignalFromEvent(this, this._editorService.onDidActiveEditorChange);
    const activeEditor = derived((reader) => {
      activeEditorChange.read(reader);
      return this._codeEditorService.getActiveCodeEditor();
    });
    const resourceObs = activeEditor.map((e) => e ? observableSignalFromEvent(this, e.onDidChangeModel).map(() => e.getModel()?.uri) : void 0).map((o, reader) => o?.read(reader));
    const selectionObs = activeEditor.map((e) => e ? observableSignalFromEvent(this, e.onDidChangeCursorSelection).map(() => ({ range: e.getSelection(), model: e.getModel() })) : void 0).map((o, reader) => o?.read(reader));
    return derived((reader) => {
      const resource = resourceObs.read(reader);
      if (!resource) {
        return { busy: false, picks: [] };
      }
      const items = [];
      items.push({
        id: "active-file",
        label: localize(16979, null),
        description: this._labelService.getUriLabel(resource),
        iconClasses: getIconClasses(this._modelService, this._languageService, resource),
        uri: resource,
        action: "file"
      });
      const selection = selectionObs.read(reader);
      if (selection && selection.model && selection.range && !selection.range.isEmpty()) {
        const selectedText = selection.model.getValueInRange(selection.range);
        const lineCount = selection.range.endLineNumber - selection.range.startLineNumber + 1;
        const description = lineCount === 1 ? localize(16988, null, selection.range.startLineNumber) : localize(16987, null, lineCount);
        items.push({
          id: "selected-text",
          label: localize(16986, null),
          description,
          selectedText,
          iconClass: ThemeIcon.asClassName(Codicon.selection),
          uri: resource,
          action: "selectedText"
        });
      }
      return { picks: items, busy: false };
    });
  }
  _asyncCompletions(input, mapper) {
    const promise = derived((reader) => {
      const queryValue = input.read(reader);
      const cts = new CancellationTokenSource();
      reader.store.add(toDisposable(() => cts.dispose(true)));
      return new ObservablePromise(
        timeout(SUGGEST_DEBOUNCE, cts.token).then(() => mapper(queryValue, cts.token)).catch(() => [])
      );
    });
    return promise.map((value2, reader) => {
      const result = value2.promiseResult.read(reader);
      return { picks: result?.data || [], busy: result === void 0 };
    });
  }
  async _getTerminalOutput(command4, token) {
    const terminal2 = this._terminal ??= this._register(await this._terminalService.createTerminal({
      config: {
        name: localize(16991, null),
        isTransient: true,
        forceShellIntegration: true,
        isFeatureTerminal: true
      },
      location: 1 /* Panel */
    }));
    this._terminalService.setActiveInstance(terminal2);
    this._terminalGroupService.showPanel(false);
    const shellIntegration = terminal2.capabilities.get(2 /* CommandDetection */);
    if (shellIntegration) {
      return this._getTerminalOutputInner(terminal2, command4, shellIntegration, token);
    }
    const store = new DisposableStore();
    return await new Promise((resolve3) => {
      store.add(terminal2.capabilities.onDidAddCapability((e) => {
        if (e.id === 2 /* CommandDetection */) {
          store.dispose();
          resolve3(this._getTerminalOutputInner(terminal2, command4, e.capability, token));
        }
      }));
      store.add(token.onCancellationRequested(() => {
        store.dispose();
        resolve3(void 0);
      }));
      store.add(disposableTimeout(() => {
        store.dispose();
        resolve3(this._getTerminalOutputInner(terminal2, command4, void 0, token));
      }, SHELL_INTEGRATION_TIMEOUT));
    });
  }
  async _getTerminalOutputInner(terminal2, command4, shellIntegration, token) {
    const store = new DisposableStore();
    return new Promise((resolve3) => {
      let allData = "";
      store.add(terminal2.onLineData((d) => allData += d + "\n"));
      if (shellIntegration) {
        store.add(shellIntegration.onCommandFinished((e) => resolve3(e.getOutput() || allData)));
      } else {
        const done = store.add(new RunOnceScheduler(() => resolve3(allData), NO_SHELL_INTEGRATION_IDLE));
        store.add(terminal2.onData(() => done.schedule()));
      }
      store.add(token.onCancellationRequested(() => resolve3(void 0)));
      store.add(terminal2.onDisposed(() => resolve3(void 0)));
      terminal2.runCommand(command4, true);
    }).finally(() => {
      store.dispose();
    });
  }
};

McpPromptArgumentPick = __decorateClass([
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, ITerminalService),
  __decorateParam(3, ISearchService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IModelService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, ITerminalGroupService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, ICodeEditorService),
  __decorateParam(12, IEditorService)
], McpPromptArgumentPick);
export { SHELL_INTEGRATION_TIMEOUT, NO_SHELL_INTEGRATION_IDLE, SUGGEST_DEBOUNCE, McpPromptArgumentPick };
