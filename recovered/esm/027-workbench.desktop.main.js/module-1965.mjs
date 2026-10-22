// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions.ts



// src/vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions.ts
var fixedEditorPaddingSingleLineCells = {
  top: 24,
  bottom: 24
};

var fixedEditorPadding = {
  top: 12,
  bottom: 12
};

function getEditorPadding(lineCount) {
  return lineCount === 1 ? fixedEditorPaddingSingleLineCells : fixedEditorPadding;
}

var fixedEditorOptions = {
  padding: fixedEditorPadding,
  scrollBeyondLastLine: false,
  scrollbar: {
    verticalScrollbarSize: 14,
    horizontal: "auto",
    vertical: "auto",
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    alwaysConsumeMouseWheel: false
  },
  renderLineHighlightOnlyWhenFocus: true,
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  selectOnLineNumbers: false,
  wordWrap: "off",
  lineNumbers: "off",
  glyphMargin: true,
  fixedOverflowWidgets: true,
  minimap: { enabled: false },
  renderValidationDecorations: "on",
  renderLineHighlight: "none",
  readOnly: true
};

var fixedDiffEditorOptions = {
  ...fixedEditorOptions,
  glyphMargin: true,
  enableSplitViewResizing: false,
  renderIndicators: true,
  renderMarginRevertIcon: false,
  readOnly: false,
  isInEmbeddedEditor: true,
  renderOverviewRuler: false,
  wordWrap: "off",
  diffWordWrap: "off",
  diffAlgorithm: "advanced",
  renderSideBySide: true,
  useInlineViewWhenSpaceIsLimited: false
};
export { getEditorPadding, fixedEditorPaddingSingleLineCells, fixedEditorPadding, fixedEditorOptions, fixedDiffEditorOptions };
