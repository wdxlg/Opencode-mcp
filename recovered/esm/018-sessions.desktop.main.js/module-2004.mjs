// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { coalesce, shuffle } from "./module-0007.mjs";
import { OS, isMacintosh, isWeb } from "./module-0014.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, append, clearNode, h } from "./module-0075.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { defaultKeybindingLabelStyles } from "./module-0513.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts
var showChatContextKey = ContextKeyExpr.and(ContextKeyExpr.equals("chatSetupHidden", false), ContextKeyExpr.equals("chatSetupDisabledInWorkspace", false));

var openChat = { text: localize(6657, null), id: "workbench.action.chat.open", when: { native: showChatContextKey, web: showChatContextKey } };

var showCommands = { text: localize(6664, null), id: "workbench.action.showCommands" };

var gotoFile = { text: localize(6663, null), id: "workbench.action.quickOpen" };

var openFile = { text: localize(6658, null), id: "workbench.action.files.openFile" };

var openFolder = { text: localize(6660, null), id: "workbench.action.files.openFolder" };

var openFileOrFolder = { text: localize(6659, null), id: "workbench.action.files.openFileFolder" };

var openRecent = { text: localize(6661, null), id: "workbench.action.openRecent" };

var newUntitledFile = { text: localize(6656, null), id: "workbench.action.files.newUntitledFile" };

var findInFiles = { text: localize(6655, null), id: "workbench.action.findInFiles" };

var toggleTerminal = { text: localize(6666, null), id: "workbench.action.terminal.toggleTerminal", when: { web: ContextKeyExpr.equals("terminalProcessSupported", true) } };

var startDebugging = { text: localize(6665, null), id: "workbench.action.debug.start", when: { web: ContextKeyExpr.equals("terminalProcessSupported", true) } };

var openSettings = { text: localize(6662, null), id: "workbench.action.openSettings" };

var baseEntries = [
  openChat,
  showCommands
];

var emptyWindowEntries = coalesce([
  ...baseEntries,
  openRecent,
  ...isMacintosh && !isWeb ? [openFileOrFolder] : [openFile, openFolder],
  isMacintosh && !isWeb ? newUntitledFile : void 0
  // fill in one more on macOS to get to 5 entries
]);

var workspaceEntries = [
  ...baseEntries
];

var otherEntries = [
  gotoFile,
  findInFiles,
  startDebugging,
  toggleTerminal,
  openSettings
];

var EditorGroupWatermark = class extends Disposable {
  constructor(container2, keybindingService, contextService, contextKeyService, configurationService, storageService, instantiationService) {
    super();
    this.keybindingService = keybindingService;
    this.contextService = contextService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.transientDisposables = this._register(new DisposableStore());
    this.keybindingLabels = this._register(new DisposableStore());
    this.enabled = false;
    this.cachedWhen = this.storageService.getObject(EditorGroupWatermark.CACHED_WHEN, 0 /* PROFILE */, /* @__PURE__ */ Object.create(null));
    this.workbenchState = this.contextService.getWorkbenchState();
    const elements = h(".editor-group-watermark-wrapper", [
      h(".editor-group-watermark-toolbar-container@toolbarContainer"),
      h(".editor-group-watermark", [
        h(".watermark-container", [
          h(".letterpress"),
          h(".shortcuts@shortcuts")
        ])
      ])
    ]);
    append(container2, elements.root);
    this.shortcuts = elements.shortcuts;
    this.toolbarContainer = elements.toolbarContainer;
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, this.toolbarContainer, MenuId.EditorGroupWatermarkToolbar, {
      hiddenItemStrategy: -1 /* NoHide */,
      highlightToggledItems: true,
      menuOptions: { shouldForwardArgs: true }
    }));
    this.registerListeners();
    this.render();
  }
  static {
    this.CACHED_WHEN = "editorGroupWatermark.whenConditions";
  }
  static {
    this.SETTINGS_KEY = "workbench.tips.enabled";
  }
  static {
    this.MINIMUM_ENTRIES = 3;
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(EditorGroupWatermark.SETTINGS_KEY) && this.enabled !== this.configurationService.getValue(EditorGroupWatermark.SETTINGS_KEY)) {
        this.render();
      }
    }));
    this._register(this.contextService.onDidChangeWorkbenchState((workbenchState) => {
      if (this.workbenchState !== workbenchState) {
        this.workbenchState = workbenchState;
        this.render();
      }
    }));
    this._register(this.storageService.onWillSaveState((e4) => {
      if (e4.reason === 1 /* SHUTDOWN */) {
        const entries2 = [...emptyWindowEntries, ...workspaceEntries, ...otherEntries];
        for (const entry of entries2) {
          const when = isWeb ? entry.when?.web : entry.when?.native;
          if (when) {
            this.cachedWhen[entry.id] = this.contextKeyService.contextMatchesRules(when);
          }
        }
        this.storageService.store(EditorGroupWatermark.CACHED_WHEN, JSON.stringify(this.cachedWhen), 0 /* PROFILE */, 1 /* MACHINE */);
      }
    }));
  }
  render() {
    this.enabled = this.configurationService.getValue(EditorGroupWatermark.SETTINGS_KEY);
    clearNode(this.shortcuts);
    this.transientDisposables.clear();
    if (!this.enabled) {
      return;
    }
    const entries2 = this.filterEntries(this.workbenchState !== 1 /* EMPTY */ ? workspaceEntries : emptyWindowEntries);
    if (entries2.length < EditorGroupWatermark.MINIMUM_ENTRIES) {
      const additionalEntries = this.filterEntries(otherEntries);
      shuffle(additionalEntries);
      entries2.push(...additionalEntries.slice(0, EditorGroupWatermark.MINIMUM_ENTRIES - entries2.length));
    }
    const box = append(this.shortcuts, $(".watermark-box"));
    const update = () => {
      clearNode(box);
      this.keybindingLabels.clear();
      for (const entry of entries2) {
        const keys = this.keybindingService.lookupKeybinding(entry.id);
        if (!keys) {
          continue;
        }
        const dl = append(box, $("dl"));
        const dt = append(dl, $("dt"));
        dt.textContent = entry.text;
        const dd = append(dl, $("dd"));
        const label3 = this.keybindingLabels.add(new KeybindingLabel(dd, OS, { renderUnboundKeybindings: true, ...defaultKeybindingLabelStyles }));
        label3.set(keys);
      }
    };
    update();
    this.transientDisposables.add(this.keybindingService.onDidUpdateKeybindings(update));
  }
  filterEntries(entries2) {
    const filteredEntries = entries2.filter((entry) => {
      if (this.cachedWhen[entry.id]) {
        return true;
      }
      const contextKey = isWeb ? entry.when?.web : entry.when?.native;
      return !contextKey || this.contextKeyService.contextMatchesRules(contextKey);
    }).filter((entry) => !!CommandsRegistry.getCommand(entry.id)).filter((entry) => !!this.keybindingService.lookupKeybinding(entry.id));
    return filteredEntries;
  }
};

EditorGroupWatermark = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IInstantiationService)
], EditorGroupWatermark);
export { showChatContextKey, openChat, showCommands, gotoFile, openFile, openFolder, openFileOrFolder, openRecent, newUntitledFile, findInFiles, toggleTerminal, startDebugging, openSettings, baseEntries, emptyWindowEntries, workspaceEntries, otherEntries, EditorGroupWatermark };
