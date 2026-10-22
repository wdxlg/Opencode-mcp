// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/welcomeView.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ViewPane } from "./module-1335.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_START_COMMAND_ID } from "./module-2406.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_EXTENSION_AVAILABLE, IDebugService } from "./module-1057.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Registry } from "./module-0090.mjs";
import { OpenFileAction, OpenFolderAction } from "./module-1522.mjs";
import { createCommandUri } from "./module-0462.mjs";
import { WorkbenchStateContext } from "./module-0949.mjs";


// src/vs/workbench/contrib/debug/browser/welcomeView.ts
var debugStartLanguageKey = "debugStartLanguage";

var CONTEXT_DEBUG_START_LANGUAGE = new RawContextKey(debugStartLanguageKey, void 0);

var CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR = new RawContextKey("debuggerInterestedInActiveEditor", false);

var WelcomeView = class extends ViewPane {
  constructor(options3, themeService, keybindingService, contextMenuService, configurationService, contextKeyService, debugService, editorService, instantiationService, viewDescriptorService, openerService, storageSevice, hoverService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.debugService = debugService;
    this.editorService = editorService;
    this.debugStartLanguageContext = CONTEXT_DEBUG_START_LANGUAGE.bindTo(contextKeyService);
    this.debuggerInterestedContext = CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR.bindTo(contextKeyService);
    const lastSetLanguage = storageSevice.get(debugStartLanguageKey, 1 /* WORKSPACE */);
    this.debugStartLanguageContext.set(lastSetLanguage);
    const setContextKey = () => {
      let editorControl = this.editorService.activeTextEditorControl;
      if (isDiffEditor(editorControl)) {
        editorControl = editorControl.getModifiedEditor();
      }
      if (isCodeEditor(editorControl)) {
        const model = editorControl.getModel();
        const language2 = model ? model.getLanguageId() : void 0;
        if (language2 && this.debugService.getAdapterManager().someDebuggerInterestedInLanguage(language2)) {
          this.debugStartLanguageContext.set(language2);
          this.debuggerInterestedContext.set(true);
          storageSevice.store(debugStartLanguageKey, language2, 1 /* WORKSPACE */, 1 /* MACHINE */);
          return;
        }
      }
      this.debuggerInterestedContext.set(false);
    };
    const disposables = new DisposableStore();
    this._register(disposables);
    this._register(editorService.onDidActiveEditorChange(() => {
      disposables.clear();
      let editorControl = this.editorService.activeTextEditorControl;
      if (isDiffEditor(editorControl)) {
        editorControl = editorControl.getModifiedEditor();
      }
      if (isCodeEditor(editorControl)) {
        disposables.add(editorControl.onDidChangeModelLanguage(setContextKey));
      }
      setContextKey();
    }));
    this._register(this.debugService.getAdapterManager().onDidRegisterDebugger(setContextKey));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        setContextKey();
      }
    }));
    setContextKey();
    debugKeybindingLabel = this.keybindingService.appendKeybinding("", DEBUG_START_COMMAND_ID);
  }
  static {
    this.ID = "workbench.debug.welcome";
  }
  static {
    this.LABEL = localize2(14727, "Run");
  }
  shouldShowWelcome() {
    return true;
  }
};

WelcomeView = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IDebugService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IHoverService)
], WelcomeView);

var viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);

viewsRegistry6.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize(
    14726,
    null,
    OpenFileAction.ID
  ),
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR.toNegated()),
  group: "2_open" /* Open */
});

var debugKeybindingLabel = "";

viewsRegistry6.registerViewWelcomeContent(WelcomeView.ID, {
  content: `[${localize(14728, null)}${debugKeybindingLabel}](command:${DEBUG_START_COMMAND_ID})`,
  when: CONTEXT_DEBUGGERS_AVAILABLE,
  group: "4_debug" /* Debug */,
  // Allow inserting more buttons directly after this one (by setting order to 1).
  order: 1
});

viewsRegistry6.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize(
    14724,
    null,
    `${createCommandUri(DEBUG_CONFIGURE_COMMAND_ID, { addNew: true }).toString()}`
  ),
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, WorkbenchStateContext.notEqualsTo("empty")),
  group: "4_debug" /* Debug */
});

viewsRegistry6.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize(
    14725,
    null,
    createCommandUri(OpenFolderAction.ID).toString()
  ),
  when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, WorkbenchStateContext.isEqualTo("empty")),
  group: "4_debug" /* Debug */
});

viewsRegistry6.registerViewWelcomeContent(WelcomeView.ID, {
  content: localize(14723, null),
  when: CONTEXT_DEBUG_EXTENSION_AVAILABLE.toNegated(),
  group: "4_debug" /* Debug */
});
export { debugStartLanguageKey, CONTEXT_DEBUG_START_LANGUAGE, CONTEXT_DEBUGGER_INTERESTED_IN_ACTIVE_EDITOR, WelcomeView, viewsRegistry6, debugKeybindingLabel };
