// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/simpleCommentEditor.ts
import { RawContextKey } from "./module-0089.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { MenuPreventer } from "./module-1340.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { SuggestController } from "./module-0758.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { TabCompletionController } from "./module-1360.mjs";
import { EditorDictation } from "./module-1351.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { CopyPasteController } from "./module-0555.mjs";
import { DropIntoEditorController } from "./module-0671.mjs";
import { LinkDetector } from "./module-0822.mjs";
import { MessageController } from "./module-0542.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { GlyphHoverController } from "./module-0809.mjs";
import { SelectionClipboardContributionID } from "./module-1361.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { PlaceholderTextContribution } from "./module-0832.mjs";
import { MenuId } from "./module-0092.mjs";
import { CommentContextKeys } from "./module-1319.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IThemeService } from "./module-0287.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IUserInteractionService } from "./module-0366.mjs";
import { clamp } from "./module-0040.mjs";


// src/vs/workbench/contrib/comments/browser/simpleCommentEditor.ts
var ctxCommentEditorFocused = new RawContextKey("commentEditorFocused", false);

var MIN_EDITOR_HEIGHT = 5 * 18;

var MAX_EDITOR_HEIGHT = 25 * 18;

var SimpleCommentEditor = class extends CodeEditorWidget {
  constructor(domElement, options3, scopedContextKeyService, parentThread, instantiationService, codeEditorService, commandService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService, userInteractionService) {
    const codeEditorWidgetOptions = {
      contributions: [
        { id: MenuPreventer.ID, ctor: MenuPreventer, instantiation: 2 /* BeforeFirstInteraction */ },
        { id: ContextMenuController.ID, ctor: ContextMenuController, instantiation: 2 /* BeforeFirstInteraction */ },
        { id: SuggestController.ID, ctor: SuggestController, instantiation: 0 /* Eager */ },
        { id: SnippetController2.ID, ctor: SnippetController2, instantiation: 4 /* Lazy */ },
        { id: TabCompletionController.ID, ctor: TabCompletionController, instantiation: 0 /* Eager */ },
        // eager because it needs to define a context key
        { id: EditorDictation.ID, ctor: EditorDictation, instantiation: 4 /* Lazy */ },
        ...EditorExtensionsRegistry.getSomeEditorContributions([
          CopyPasteController.ID,
          DropIntoEditorController.ID,
          LinkDetector.ID,
          MessageController.ID,
          ContentHoverController.ID,
          GlyphHoverController.ID,
          SelectionClipboardContributionID,
          InlineCompletionsController.ID,
          CodeActionController.ID,
          PlaceholderTextContribution.ID
        ])
      ],
      contextMenuId: MenuId.SimpleEditorContext
    };
    super(domElement, options3, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, scopedContextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService, userInteractionService);
    this._commentEditorFocused = ctxCommentEditorFocused.bindTo(scopedContextKeyService);
    this._commentEditorEmpty = CommentContextKeys.commentIsEmpty.bindTo(scopedContextKeyService);
    this._commentEditorEmpty.set(!this.getModel()?.getValueLength());
    this._parentThread = parentThread;
    this._register(this.onDidFocusEditorWidget((_) => this._commentEditorFocused.set(true)));
    this._register(this.onDidChangeModelContent((e) => this._commentEditorEmpty.set(!this.getModel()?.getValueLength())));
    this._register(this.onDidBlurEditorWidget((_) => this._commentEditorFocused.reset()));
  }
  getParentThread() {
    return this._parentThread;
  }
  _getActions() {
    return EditorExtensionsRegistry.getEditorActions();
  }
  updateOptions(newOptions) {
    const withLineNumberRemoved = { ...newOptions, lineNumbers: "off" };
    super.updateOptions(withLineNumberRemoved);
  }
  static getEditorOptions(configurationService) {
    return {
      wordWrap: "on",
      glyphMargin: false,
      lineNumbers: "off",
      folding: false,
      selectOnLineNumbers: false,
      scrollbar: {
        vertical: "visible",
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: false
      },
      overviewRulerLanes: 2,
      lineDecorationsWidth: 0,
      scrollBeyondLastLine: false,
      renderLineHighlight: "none",
      fixedOverflowWidgets: true,
      acceptSuggestionOnEnter: "smart",
      minimap: {
        enabled: false
      },
      dropIntoEditor: { enabled: true },
      autoClosingBrackets: configurationService.getValue("editor.autoClosingBrackets"),
      quickSuggestions: false,
      accessibilitySupport: configurationService.getValue("editor.accessibilitySupport"),
      fontFamily: configurationService.getValue("editor.fontFamily"),
      fontSize: configurationService.getValue("editor.fontSize"),
      allowVariableLineHeights: false
    };
  }
};

SimpleCommentEditor = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, INotificationService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, ILanguageConfigurationService),
  __decorateParam(11, ILanguageFeaturesService),
  __decorateParam(12, IUserInteractionService)
], SimpleCommentEditor);

function calculateEditorHeight(parentEditor, editor, currentHeight) {
  const layoutInfo = editor.getLayoutInfo();
  const lineHeight = editor.getOption(75 /* lineHeight */);
  const contentHeight = editor._getViewModel()?.getLineCount() * lineHeight;
  if (contentHeight > layoutInfo.height || contentHeight < layoutInfo.height && currentHeight > MIN_EDITOR_HEIGHT) {
    const linesToAdd = Math.ceil((contentHeight - layoutInfo.height) / lineHeight);
    const proposedHeight = layoutInfo.height + lineHeight * linesToAdd;
    return clamp(proposedHeight, MIN_EDITOR_HEIGHT, clamp(parentEditor.getLayoutInfo().height - 90, MIN_EDITOR_HEIGHT, MAX_EDITOR_HEIGHT));
  }
  return currentHeight;
}
export { calculateEditorHeight, ctxCommentEditorFocused, MIN_EDITOR_HEIGHT, MAX_EDITOR_HEIGHT, SimpleCommentEditor };
