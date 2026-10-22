// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/editorContextKeys.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/common/editorContextKeys.ts
var EditorContextKeys;

((EditorContextKeys2) => {
  EditorContextKeys2.editorSimpleInput = new RawContextKey("editorSimpleInput", false, true);
  EditorContextKeys2.editorTextFocus = new RawContextKey("editorTextFocus", false, localize(854, null));
  EditorContextKeys2.focus = new RawContextKey("editorFocus", false, localize(827, null));
  EditorContextKeys2.textInputFocus = new RawContextKey("textInputFocus", false, localize(867, null));
  EditorContextKeys2.readOnly = new RawContextKey("editorReadonly", false, localize(851, null));
  EditorContextKeys2.inDiffEditor = new RawContextKey("inDiffEditor", false, localize(856, null));
  EditorContextKeys2.isEmbeddedDiffEditor = new RawContextKey("isEmbeddedDiffEditor", false, localize(859, null));
  EditorContextKeys2.inMultiDiffEditor = new RawContextKey("inMultiDiffEditor", false, localize(857, null));
  EditorContextKeys2.multiDiffEditorAllCollapsed = new RawContextKey("multiDiffEditorAllCollapsed", void 0, localize(860, null));
  EditorContextKeys2.multiDiffEditorItemAllUnchangedRegionsShown = new RawContextKey("multiDiffEditorItemAllUnchangedRegionsShown", false, localize(861, null));
  EditorContextKeys2.multiDiffEditorRenderSideBySide = new RawContextKey("multiDiffEditorRenderSideBySide", true, localize(862, null));
  EditorContextKeys2.hasChanges = new RawContextKey("diffEditorHasChanges", false, localize(819, null));
  EditorContextKeys2.comparingMovedCode = new RawContextKey("comparingMovedCode", false, localize(818, null));
  EditorContextKeys2.accessibleDiffViewerVisible = new RawContextKey("accessibleDiffViewerVisible", false, localize(817, null));
  EditorContextKeys2.diffEditorRenderSideBySideInlineBreakpointReached = new RawContextKey("diffEditorRenderSideBySideInlineBreakpointReached", false, localize(825, null));
  EditorContextKeys2.diffEditorInlineMode = new RawContextKey("diffEditorInlineMode", false, localize(820, null));
  EditorContextKeys2.diffEditorOriginalWritable = new RawContextKey("diffEditorOriginalWritable", false, localize(824, null));
  EditorContextKeys2.diffEditorModifiedWritable = new RawContextKey("diffEditorModifiedWritable", false, localize(822, null));
  EditorContextKeys2.diffEditorOriginalUri = new RawContextKey("diffEditorOriginalUri", "", localize(823, null));
  EditorContextKeys2.diffEditorModifiedUri = new RawContextKey("diffEditorModifiedUri", "", localize(821, null));
  EditorContextKeys2.columnSelection = new RawContextKey("editorColumnSelection", false, localize(826, null));
  EditorContextKeys2.writable = EditorContextKeys2.readOnly.toNegated();
  EditorContextKeys2.hasNonEmptySelection = new RawContextKey("editorHasSelection", false, localize(845, null));
  EditorContextKeys2.hasOnlyEmptySelection = EditorContextKeys2.hasNonEmptySelection.toNegated();
  EditorContextKeys2.hasMultipleSelections = new RawContextKey("editorHasMultipleSelections", false, localize(842, null));
  EditorContextKeys2.hasSingleSelection = EditorContextKeys2.hasMultipleSelections.toNegated();
  EditorContextKeys2.tabMovesFocus = new RawContextKey("editorTabMovesFocus", false, localize(853, null));
  EditorContextKeys2.tabDoesNotMoveFocus = EditorContextKeys2.tabMovesFocus.toNegated();
  EditorContextKeys2.isInEmbeddedEditor = new RawContextKey("isInEmbeddedEditor", false, true);
  EditorContextKeys2.canUndo = new RawContextKey("canUndo", false, true);
  EditorContextKeys2.canRedo = new RawContextKey("canRedo", false, true);
  EditorContextKeys2.hoverVisible = new RawContextKey("editorHoverVisible", false, localize(849, null));
  EditorContextKeys2.hoverFocused = new RawContextKey("editorHoverFocused", false, localize(848, null));
  EditorContextKeys2.stickyScrollFocused = new RawContextKey("stickyScrollFocused", false, localize(865, null));
  EditorContextKeys2.stickyScrollVisible = new RawContextKey("stickyScrollVisible", false, localize(866, null));
  EditorContextKeys2.standaloneColorPickerVisible = new RawContextKey("standaloneColorPickerVisible", false, localize(864, null));
  EditorContextKeys2.standaloneColorPickerFocused = new RawContextKey("standaloneColorPickerFocused", false, localize(863, null));
  EditorContextKeys2.isComposing = new RawContextKey("isComposing", false, localize(858, null));
  EditorContextKeys2.inCompositeEditor = new RawContextKey("inCompositeEditor", void 0, localize(855, null));
  EditorContextKeys2.notInCompositeEditor = EditorContextKeys2.inCompositeEditor.toNegated();
  EditorContextKeys2.languageId = new RawContextKey("editorLangId", "", localize(850, null));
  EditorContextKeys2.hasCompletionItemProvider = new RawContextKey("editorHasCompletionItemProvider", false, localize(830, null));
  EditorContextKeys2.hasCodeActionsProvider = new RawContextKey("editorHasCodeActionsProvider", false, localize(828, null));
  EditorContextKeys2.hasCodeLensProvider = new RawContextKey("editorHasCodeLensProvider", false, localize(829, null));
  EditorContextKeys2.hasDefinitionProvider = new RawContextKey("editorHasDefinitionProvider", false, localize(832, null));
  EditorContextKeys2.hasDeclarationProvider = new RawContextKey("editorHasDeclarationProvider", false, localize(831, null));
  EditorContextKeys2.hasImplementationProvider = new RawContextKey("editorHasImplementationProvider", false, localize(838, null));
  EditorContextKeys2.hasTypeDefinitionProvider = new RawContextKey("editorHasTypeDefinitionProvider", false, localize(847, null));
  EditorContextKeys2.hasHoverProvider = new RawContextKey("editorHasHoverProvider", false, localize(837, null));
  EditorContextKeys2.hasDocumentHighlightProvider = new RawContextKey("editorHasDocumentHighlightProvider", false, localize(834, null));
  EditorContextKeys2.hasDocumentSymbolProvider = new RawContextKey("editorHasDocumentSymbolProvider", false, localize(836, null));
  EditorContextKeys2.hasReferenceProvider = new RawContextKey("editorHasReferenceProvider", false, localize(843, null));
  EditorContextKeys2.hasRenameProvider = new RawContextKey("editorHasRenameProvider", false, localize(844, null));
  EditorContextKeys2.hasSignatureHelpProvider = new RawContextKey("editorHasSignatureHelpProvider", false, localize(846, null));
  EditorContextKeys2.hasInlayHintsProvider = new RawContextKey("editorHasInlayHintsProvider", false, localize(839, null));
  EditorContextKeys2.hasDocumentFormattingProvider = new RawContextKey("editorHasDocumentFormattingProvider", false, localize(833, null));
  EditorContextKeys2.hasDocumentSelectionFormattingProvider = new RawContextKey("editorHasDocumentSelectionFormattingProvider", false, localize(835, null));
  EditorContextKeys2.hasMultipleDocumentFormattingProvider = new RawContextKey("editorHasMultipleDocumentFormattingProvider", false, localize(840, null));
  EditorContextKeys2.hasMultipleDocumentSelectionFormattingProvider = new RawContextKey("editorHasMultipleDocumentSelectionFormattingProvider", false, localize(841, null));
  EditorContextKeys2.selectionHasDiagnostics = new RawContextKey("editorSelectionHasDiagnostics", false, localize(852, null));
})(EditorContextKeys || (EditorContextKeys = {}));
export { EditorContextKeys };
