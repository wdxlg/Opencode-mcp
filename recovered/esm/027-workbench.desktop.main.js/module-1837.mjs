// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/simpleEditorOptions.ts
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { MenuPreventer } from "./module-1340.mjs";
import { SelectionClipboardContributionID } from "./module-1361.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { SuggestController } from "./module-0758.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { TabCompletionController } from "./module-1360.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { selectionBackground } from "./module-0227.mjs";
import { inputBackground, inputForeground } from "./module-0233.mjs";
import { editorSelectionBackground } from "./module-0229.mjs";


// src/vs/workbench/contrib/codeEditor/browser/simpleEditorOptions.ts
function getSimpleEditorOptions(configurationService) {
  return {
    wordWrap: "on",
    overviewRulerLanes: 0,
    glyphMargin: false,
    lineNumbers: "off",
    folding: false,
    selectOnLineNumbers: false,
    hideCursorInOverviewRuler: true,
    selectionHighlight: false,
    scrollbar: {
      horizontal: "hidden",
      alwaysConsumeMouseWheel: false
    },
    lineDecorationsWidth: 0,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    renderLineHighlight: "none",
    fixedOverflowWidgets: true,
    acceptSuggestionOnEnter: "smart",
    dragAndDrop: false,
    revealHorizontalRightPadding: 5,
    minimap: {
      enabled: false
    },
    guides: {
      indentation: false
    },
    wordSegmenterLocales: configurationService.getValue("editor.wordSegmenterLocales"),
    accessibilitySupport: configurationService.getValue("editor.accessibilitySupport"),
    cursorBlinking: configurationService.getValue("editor.cursorBlinking"),
    editContext: configurationService.getValue("editor.editContext"),
    defaultColorDecorators: "never",
    allowVariableLineHeights: false,
    allowVariableFonts: false,
    allowVariableFontsInAccessibilityMode: false
  };
}

function getSimpleCodeEditorWidgetOptions() {
  return {
    isSimpleWidget: true,
    contributions: EditorExtensionsRegistry.getSomeEditorContributions([
      MenuPreventer.ID,
      SelectionClipboardContributionID,
      ContextMenuController.ID,
      SuggestController.ID,
      SnippetController2.ID,
      TabCompletionController.ID
    ])
  };
}

function setupSimpleEditorSelectionStyling(editorContainerSelector) {
  return registerThemingParticipant((theme, collector) => {
    const selectionBackgroundColor = theme.getColor(selectionBackground);
    if (selectionBackgroundColor) {
      const inputBackgroundColor = theme.getColor(inputBackground);
      if (inputBackgroundColor) {
        collector.addRule(`${editorContainerSelector} .monaco-editor-background { background-color: ${inputBackgroundColor}; } `);
        collector.addRule(`${editorContainerSelector} .monaco-editor .selected-text { background-color: ${inputBackgroundColor.transparent(0.4)}; }`);
      }
      const inputForegroundColor = theme.getColor(inputForeground);
      if (inputForegroundColor) {
        collector.addRule(`${editorContainerSelector} .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`);
      }
      collector.addRule(`${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`);
    } else {
      collector.addRule(`${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${theme.getColor(editorSelectionBackground)}; }`);
    }
  });
}
export { getSimpleEditorOptions, getSimpleCodeEditorWidgetOptions, setupSimpleEditorSelectionStyling };
