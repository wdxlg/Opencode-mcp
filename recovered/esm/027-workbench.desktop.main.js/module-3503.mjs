// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/editorAccessibilityHelp.ts
import { Disposable } from "./module-0012.mjs";
import { AccessibilityHelpAction } from "./module-1375.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { NEW_UNTITLED_FILE_COMMAND_ID } from "./module-2017.mjs";
import { AccessibilityHelpNLS } from "./module-0867.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CommentContextKeys } from "./module-1319.mjs";
import { CommentAccessibilityHelpNLS } from "./module-3235.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ctxHasEditorModification, ctxHasRequestInProgress } from "./module-2057.mjs";
import { HasSpeechProvider } from "./module-1254.mjs";


// src/vs/workbench/contrib/accessibility/browser/editorAccessibilityHelp.ts
var EditorAccessibilityHelpContribution = class extends Disposable {
  constructor() {
    super();
    this._register(AccessibilityHelpAction.addImplementation(90, "editor", async (accessor) => {
      const codeEditorService = accessor.get(ICodeEditorService);
      const accessibleViewService = accessor.get(IAccessibleViewService);
      const instantiationService = accessor.get(IInstantiationService);
      const commandService = accessor.get(ICommandService);
      let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
      if (!codeEditor) {
        await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
        codeEditor = codeEditorService.getActiveCodeEditor();
      }
      accessibleViewService.show(instantiationService.createInstance(EditorAccessibilityHelpProvider, codeEditor));
    }));
  }
};

var EditorAccessibilityHelpProvider = class extends Disposable {
  constructor(_editor, _keybindingService, _contextKeyService, accessibilityService, _configurationService) {
    super();
    this._editor = _editor;
    this._keybindingService = _keybindingService;
    this._contextKeyService = _contextKeyService;
    this.accessibilityService = accessibilityService;
    this._configurationService = _configurationService;
    this.id = "editor" /* Editor */;
    this.options = { type: "help" /* Help */, readMoreUrl: "https://go.microsoft.com/fwlink/?linkid=851010" };
    this.verbositySettingKey = "accessibility.verbosity.editor" /* Editor */;
  }
  onClose() {
    this._editor.focus();
  }
  provideContent() {
    const options3 = this._editor.getOptions();
    const content2 = [];
    if (options3.get(70 /* inDiffEditor */)) {
      if (options3.get(104 /* readOnly */)) {
        content2.push(AccessibilityHelpNLS.readonlyDiffEditor);
      } else {
        content2.push(AccessibilityHelpNLS.editableDiffEditor);
      }
    } else {
      if (options3.get(104 /* readOnly */)) {
        content2.push(AccessibilityHelpNLS.readonlyEditor);
      } else {
        content2.push(AccessibilityHelpNLS.editableEditor);
      }
    }
    if (this.accessibilityService.isScreenReaderOptimized() && this._configurationService.getValue("accessibility.windowTitleOptimized")) {
      content2.push(AccessibilityHelpNLS.defaultWindowTitleIncludesEditorState);
    } else {
      content2.push(AccessibilityHelpNLS.defaultWindowTitleExcludingEditorState);
    }
    content2.push(AccessibilityHelpNLS.toolbar);
    const chatEditInfo = getChatEditInfo(this._keybindingService, this._contextKeyService, this._editor);
    if (chatEditInfo) {
      content2.push(chatEditInfo);
    }
    content2.push(AccessibilityHelpNLS.listSignalSounds);
    content2.push(AccessibilityHelpNLS.listAlerts);
    content2.push(AccessibilityHelpNLS.announceCursorPosition);
    content2.push(AccessibilityHelpNLS.focusNotifications);
    const chatCommandInfo = getChatCommandInfo(this._keybindingService, this._contextKeyService);
    if (chatCommandInfo) {
      content2.push(chatCommandInfo);
    }
    const commentCommandInfo = getCommentCommandInfo(this._keybindingService, this._contextKeyService, this._editor);
    if (commentCommandInfo) {
      content2.push(commentCommandInfo);
    }
    content2.push(AccessibilityHelpNLS.suggestActions);
    content2.push(AccessibilityHelpNLS.acceptSuggestAction);
    content2.push(AccessibilityHelpNLS.toggleSuggestionFocus);
    if (!options3.get(104 /* readOnly */)) {
      const dictationInfo = getDictationInfo(this._contextKeyService);
      if (dictationInfo) {
        content2.push(dictationInfo);
      }
    }
    if (options3.get(131 /* stickyScroll */).enabled) {
      content2.push(AccessibilityHelpNLS.stickScroll);
    }
    if (options3.get(164 /* tabFocusMode */)) {
      content2.push(AccessibilityHelpNLS.tabFocusModeOnMsg);
    } else {
      content2.push(AccessibilityHelpNLS.tabFocusModeOffMsg);
    }
    content2.push(AccessibilityHelpNLS.codeFolding);
    content2.push(AccessibilityHelpNLS.intellisense);
    content2.push(AccessibilityHelpNLS.showOrFocusHover);
    content2.push(AccessibilityHelpNLS.goToSymbol);
    content2.push(AccessibilityHelpNLS.startDebugging);
    content2.push(AccessibilityHelpNLS.setBreakpoint);
    content2.push(AccessibilityHelpNLS.debugExecuteSelection);
    content2.push(AccessibilityHelpNLS.addToWatch);
    return content2.join("\n");
  }
};

EditorAccessibilityHelpProvider = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IAccessibilityService),
  __decorateParam(4, IConfigurationService)
], EditorAccessibilityHelpProvider);

function getCommentCommandInfo(keybindingService, contextKeyService, editor) {
  const editorContext = contextKeyService.getContext(editor.getDomNode());
  if (editorContext.getValue(CommentContextKeys.activeEditorHasCommentingRange.key)) {
    return [CommentAccessibilityHelpNLS.intro, CommentAccessibilityHelpNLS.addComment, CommentAccessibilityHelpNLS.nextCommentThread, CommentAccessibilityHelpNLS.previousCommentThread, CommentAccessibilityHelpNLS.nextRange, CommentAccessibilityHelpNLS.previousRange].join("\n");
  }
  return;
}

function getChatCommandInfo(keybindingService, contextKeyService) {
  if (ChatContextKeys.enabled.getValue(contextKeyService)) {
    return [AccessibilityHelpNLS.quickChat, AccessibilityHelpNLS.startInlineChat].join("\n");
  }
  return;
}

function getChatEditInfo(keybindingService, contextKeyService, editor) {
  const editorContext = contextKeyService.getContext(editor.getDomNode());
  if (editorContext.getValue(ctxHasEditorModification.key)) {
    return AccessibilityHelpNLS.chatEditorModification + "\n" + AccessibilityHelpNLS.chatEditActions;
  } else if (editorContext.getValue(ctxHasRequestInProgress.key)) {
    return AccessibilityHelpNLS.chatEditorRequestInProgress;
  }
  return;
}

function getDictationInfo(contextKeyService) {
  if (HasSpeechProvider.getValue(contextKeyService) || ChatContextKeys.enabled.getValue(contextKeyService) && ChatContextKeys.speechToTextConfigured.getValue(contextKeyService)) {
    return AccessibilityHelpNLS.editorDictation;
  }
  return;
}
export { getCommentCommandInfo, getChatCommandInfo, getChatEditInfo, getDictationInfo, EditorAccessibilityHelpContribution, EditorAccessibilityHelpProvider };
