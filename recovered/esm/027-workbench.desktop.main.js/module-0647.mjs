// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/goToCommands.ts
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Position } from "./module-0079.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { Iterable } from "./module-0011.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { ISymbolNavigationService } from "./module-0645.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { EditorStateCancellationTokenSource } from "./module-0539.mjs";
import { createCancelablePromise, raceCancellation } from "./module-0036.mjs";
import { alert } from "./module-0076.mjs";
import { MessageController } from "./module-0542.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { isLocationLink } from "./module-0164.mjs";
import { Range2 } from "./module-0106.mjs";
import { ReferencesController } from "./module-0644.mjs";
import { ReferencesModel } from "./module-0637.mjs";
import { getDeclarationsAtPosition, getDefinitionsAtPosition, getImplementationsAtPosition, getReferencesAtPosition, getTypeDefinitionsAtPosition } from "./module-0646.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { KeyChord } from "./module-0019.mjs";
import { PeekContext } from "./module-0623.mjs";
import { URI } from "./module-0032.mjs";
import { assertType } from "./module-0010.mjs";
import { isCodeEditor } from "./module-0223.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/goToCommands.ts
MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  submenu: MenuId.EditorContextPeek,
  title: localize(1246, null),
  group: "navigation",
  order: 100
});

var SymbolNavigationAnchor = class _SymbolNavigationAnchor {
  constructor(model, position2) {
    this.model = model;
    this.position = position2;
  }
  static is(thing) {
    if (!thing || typeof thing !== "object") {
      return false;
    }
    if (thing instanceof _SymbolNavigationAnchor) {
      return true;
    }
    if (Position.isIPosition(thing.position) && thing.model) {
      return true;
    }
    return false;
  }
};

var SymbolNavigationAction = class _SymbolNavigationAction extends EditorAction2 {
  static {
    this._allSymbolNavigationCommands = /* @__PURE__ */ new Map();
  }
  static {
    this._activeAlternativeCommands = /* @__PURE__ */ new Set();
  }
  static all() {
    return _SymbolNavigationAction._allSymbolNavigationCommands.values();
  }
  static _patchConfig(opts) {
    const result = { ...opts, f1: true };
    if (result.menu) {
      for (const item of Iterable.wrap(result.menu)) {
        if (item.id === MenuId.EditorContext || item.id === MenuId.EditorContextPeek) {
          item.when = ContextKeyExpr.and(opts.precondition, item.when);
        }
      }
    }
    return result;
  }
  constructor(configuration2, opts) {
    super(_SymbolNavigationAction._patchConfig(opts));
    this.configuration = configuration2;
    _SymbolNavigationAction._allSymbolNavigationCommands.set(opts.id, this);
  }
  runEditorCommand(accessor, editor, arg, range2) {
    if (!editor.hasModel()) {
      return Promise.resolve(void 0);
    }
    const notificationService = accessor.get(INotificationService);
    const editorService = accessor.get(ICodeEditorService);
    const progressService = accessor.get(IEditorProgressService);
    const symbolNavService = accessor.get(ISymbolNavigationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const instaService = accessor.get(IInstantiationService);
    const model = editor.getModel();
    const position2 = editor.getPosition();
    const anchor = SymbolNavigationAnchor.is(arg) ? arg : new SymbolNavigationAnchor(model, position2);
    const cts = new EditorStateCancellationTokenSource(editor, 1 /* Value */ | 4 /* Position */);
    const promise = raceCancellation(this._getLocationModel(languageFeaturesService, anchor.model, anchor.position, cts.token), cts.token).then(async (references) => {
      if (!references || cts.token.isCancellationRequested) {
        return;
      }
      alert(references.ariaMessage);
      let altAction;
      if (references.referenceAt(model.uri, position2)) {
        const altActionId = this._getAlternativeCommand(editor);
        if (altActionId !== void 0 && !_SymbolNavigationAction._activeAlternativeCommands.has(altActionId) && _SymbolNavigationAction._allSymbolNavigationCommands.has(altActionId)) {
          altAction = _SymbolNavigationAction._allSymbolNavigationCommands.get(altActionId);
        }
      }
      const referenceCount = references.references.length;
      if (referenceCount === 0) {
        if (!this.configuration.muteMessage) {
          const info = model.getWordAtPosition(position2);
          MessageController.get(editor)?.showMessage(this._getNoResultFoundMessage(info), position2);
        }
      } else if (referenceCount === 1 && altAction) {
        _SymbolNavigationAction._activeAlternativeCommands.add(this.desc.id);
        instaService.invokeFunction((accessor2) => altAction.runEditorCommand(accessor2, editor, arg, range2).finally(() => {
          _SymbolNavigationAction._activeAlternativeCommands.delete(this.desc.id);
        }));
      } else {
        return this._onResult(editorService, symbolNavService, editor, references, range2);
      }
    }, (err) => {
      notificationService.error(err);
    }).finally(() => {
      cts.dispose();
    });
    progressService.showWhile(promise, 250);
    return promise;
  }
  async _onResult(editorService, symbolNavService, editor, model, range2) {
    const gotoLocation = this._getGoToPreference(editor);
    if (!(editor instanceof EmbeddedCodeEditorWidget) && (this.configuration.openInPeek || gotoLocation === "peek" && model.references.length > 1)) {
      this._openInPeek(editor, model, range2);
    } else {
      const next = model.firstReference();
      const peek = model.references.length > 1 && gotoLocation === "gotoAndPeek";
      const targetEditor = await this._openReference(editor, editorService, next, this.configuration.openToSide, !peek);
      if (peek && targetEditor) {
        this._openInPeek(targetEditor, model, range2);
      } else {
        model.dispose();
      }
      if (gotoLocation === "goto") {
        symbolNavService.put(next);
      }
    }
  }
  async _openReference(editor, editorService, reference, sideBySide, highlight) {
    let range2 = void 0;
    if (isLocationLink(reference)) {
      range2 = reference.targetSelectionRange;
    }
    if (!range2) {
      range2 = reference.range;
    }
    if (!range2) {
      return void 0;
    }
    const targetEditor = await editorService.openCodeEditor({
      resource: reference.uri,
      options: {
        selection: Range2.collapseToStart(range2),
        selectionRevealType: 3 /* NearTopIfOutsideViewport */,
        selectionSource: "code.jump" /* JUMP */
      }
    }, editor, sideBySide);
    if (!targetEditor) {
      return void 0;
    }
    if (highlight) {
      const modelNow = targetEditor.getModel();
      const decorations = targetEditor.createDecorationsCollection([{ range: range2, options: { description: "symbol-navigate-action-highlight", className: "symbolHighlight" } }]);
      setTimeout(() => {
        if (targetEditor.getModel() === modelNow) {
          decorations.clear();
        }
      }, 350);
    }
    return targetEditor;
  }
  _openInPeek(target, model, range2) {
    const controller = ReferencesController.get(target);
    if (controller && target.hasModel()) {
      controller.toggleWidget(range2 ?? target.getSelection(), createCancelablePromise((_) => Promise.resolve(model)), this.configuration.openInPeek);
    } else {
      model.dispose();
    }
  }
};

var DefinitionAction = class extends SymbolNavigationAction {
  async _getLocationModel(languageFeaturesService, model, position2, token) {
    return new ReferencesModel(await getDefinitionsAtPosition(languageFeaturesService.definitionProvider, model, position2, false, token), localize(1229, null));
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? localize(1245, null, info.word) : localize(1231, null);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(67 /* gotoLocation */).alternativeDefinitionCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(67 /* gotoLocation */).multipleDefinitions;
  }
};

registerAction2(class GoToDefinitionAction extends DefinitionAction {
  static {
    this.id = "editor.action.revealDefinition";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: GoToDefinitionAction.id,
      title: {
        ...localize2(1217, "Go to Definition"),
        mnemonicTitle: localize(1241, null)
      },
      precondition: EditorContextKeys.hasDefinitionProvider,
      keybinding: [{
        when: EditorContextKeys.editorTextFocus,
        primary: 70 /* F12 */,
        weight: 100 /* EditorContrib */
      }, {
        when: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, IsWebContext),
        primary: 2048 /* CtrlCmd */ | 70 /* F12 */,
        weight: 100 /* EditorContrib */
      }],
      menu: [{
        id: MenuId.EditorContext,
        group: "navigation",
        order: 1.1
      }, {
        id: MenuId.MenubarGoMenu,
        precondition: null,
        group: "4_symbol_nav",
        order: 2
      }]
    });
    CommandsRegistry.registerCommandAlias("editor.action.goToDeclaration", GoToDefinitionAction.id);
  }
});

registerAction2(class OpenDefinitionToSideAction extends DefinitionAction {
  static {
    this.id = "editor.action.revealDefinitionAside";
  }
  constructor() {
    super({
      openToSide: true,
      openInPeek: false,
      muteMessage: false
    }, {
      id: OpenDefinitionToSideAction.id,
      title: localize2(1219, "Open Definition to the Side"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasDefinitionProvider,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      keybinding: [{
        when: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 70 /* F12 */),
        weight: 100 /* EditorContrib */
      }, {
        when: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, IsWebContext),
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 70 /* F12 */),
        weight: 100 /* EditorContrib */
      }]
    });
    CommandsRegistry.registerCommandAlias("editor.action.openDeclarationToTheSide", OpenDefinitionToSideAction.id);
  }
});

registerAction2(class PeekDefinitionAction extends DefinitionAction {
  static {
    this.id = "editor.action.peekDefinition";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: PeekDefinitionAction.id,
      title: localize2(1225, "Peek Definition"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasDefinitionProvider,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        primary: 512 /* Alt */ | 70 /* F12 */,
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 68 /* F10 */ },
        weight: 100 /* EditorContrib */
      },
      menu: {
        id: MenuId.EditorContextPeek,
        group: "peek",
        order: 2
      }
    });
    CommandsRegistry.registerCommandAlias("editor.action.previewDeclaration", PeekDefinitionAction.id);
  }
});

var DeclarationAction = class extends SymbolNavigationAction {
  async _getLocationModel(languageFeaturesService, model, position2, token) {
    return new ReferencesModel(await getDeclarationsAtPosition(languageFeaturesService.declarationProvider, model, position2, false, token), localize(1228, null));
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? localize(1227, null, info.word) : localize(1226, null);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(67 /* gotoLocation */).alternativeDeclarationCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(67 /* gotoLocation */).multipleDeclarations;
  }
};

registerAction2(class GoToDeclarationAction extends DeclarationAction {
  static {
    this.id = "editor.action.revealDeclaration";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: GoToDeclarationAction.id,
      title: {
        ...localize2(1218, "Go to Declaration"),
        mnemonicTitle: localize(1240, null)
      },
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasDeclarationProvider,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: [{
        id: MenuId.EditorContext,
        group: "navigation",
        order: 1.3
      }, {
        id: MenuId.MenubarGoMenu,
        precondition: null,
        group: "4_symbol_nav",
        order: 3
      }]
    });
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? localize(1227, null, info.word) : localize(1226, null);
  }
});

registerAction2(class PeekDeclarationAction extends DeclarationAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: "editor.action.peekDeclaration",
      title: localize2(1222, "Peek Declaration"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasDeclarationProvider,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: {
        id: MenuId.EditorContextPeek,
        group: "peek",
        order: 3
      }
    });
  }
});

var TypeDefinitionAction = class extends SymbolNavigationAction {
  async _getLocationModel(languageFeaturesService, model, position2, token) {
    return new ReferencesModel(await getTypeDefinitionsAtPosition(languageFeaturesService.typeDefinitionProvider, model, position2, false, token), localize(1251, null));
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? localize(1237, null, info.word) : localize(1236, null);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(67 /* gotoLocation */).alternativeTypeDefinitionCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(67 /* gotoLocation */).multipleTypeDefinitions;
  }
};

registerAction2(class GoToTypeDefinitionAction extends TypeDefinitionAction {
  static {
    this.ID = "editor.action.goToTypeDefinition";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: GoToTypeDefinitionAction.ID,
      title: {
        ...localize2(1221, "Go to Type Definition"),
        mnemonicTitle: localize(1244, null)
      },
      precondition: EditorContextKeys.hasTypeDefinitionProvider,
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        primary: 0,
        weight: 100 /* EditorContrib */
      },
      menu: [{
        id: MenuId.EditorContext,
        group: "navigation",
        order: 1.4
      }, {
        id: MenuId.MenubarGoMenu,
        precondition: null,
        group: "4_symbol_nav",
        order: 3
      }]
    });
  }
});

registerAction2(class PeekTypeDefinitionAction extends TypeDefinitionAction {
  static {
    this.ID = "editor.action.peekTypeDefinition";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: PeekTypeDefinitionAction.ID,
      title: localize2(1224, "Peek Type Definition"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasTypeDefinitionProvider,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: {
        id: MenuId.EditorContextPeek,
        group: "peek",
        order: 4
      }
    });
  }
});

var ImplementationAction = class extends SymbolNavigationAction {
  async _getLocationModel(languageFeaturesService, model, position2, token) {
    return new ReferencesModel(await getImplementationsAtPosition(languageFeaturesService.implementationProvider, model, position2, false, token), localize(1238, null));
  }
  _getNoResultFoundMessage(info) {
    return info && info.word ? localize(1234, null, info.word) : localize(1233, null);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(67 /* gotoLocation */).alternativeImplementationCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(67 /* gotoLocation */).multipleImplementations;
  }
};

registerAction2(class GoToImplementationAction extends ImplementationAction {
  static {
    this.ID = "editor.action.goToImplementation";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: GoToImplementationAction.ID,
      title: {
        ...localize2(1220, "Go to Implementations"),
        mnemonicTitle: localize(1242, null)
      },
      precondition: EditorContextKeys.hasImplementationProvider,
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 70 /* F12 */,
        weight: 100 /* EditorContrib */
      },
      menu: [{
        id: MenuId.EditorContext,
        group: "navigation",
        order: 1.45
      }, {
        id: MenuId.MenubarGoMenu,
        precondition: null,
        group: "4_symbol_nav",
        order: 4
      }]
    });
  }
});

registerAction2(class PeekImplementationAction extends ImplementationAction {
  static {
    this.ID = "editor.action.peekImplementation";
  }
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: PeekImplementationAction.ID,
      title: localize2(1223, "Peek Implementations"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasImplementationProvider,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 70 /* F12 */,
        weight: 100 /* EditorContrib */
      },
      menu: {
        id: MenuId.EditorContextPeek,
        group: "peek",
        order: 5
      }
    });
  }
});

var ReferencesAction = class extends SymbolNavigationAction {
  _getNoResultFoundMessage(info) {
    return info ? localize(1249, null, info.word) : localize(1250, null);
  }
  _getAlternativeCommand(editor) {
    return editor.getOption(67 /* gotoLocation */).alternativeReferenceCommand;
  }
  _getGoToPreference(editor) {
    return editor.getOption(67 /* gotoLocation */).multipleReferences;
  }
};

registerAction2(class GoToReferencesAction extends ReferencesAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: false,
      muteMessage: false
    }, {
      id: "editor.action.goToReferences",
      title: {
        ...localize2(1235, "Go to References"),
        mnemonicTitle: localize(1243, null)
      },
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasReferenceProvider,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 70 /* F12 */,
        weight: 100 /* EditorContrib */
      },
      menu: [{
        id: MenuId.EditorContext,
        group: "navigation",
        order: 1.45
      }, {
        id: MenuId.MenubarGoMenu,
        precondition: null,
        group: "4_symbol_nav",
        order: 5
      }]
    });
  }
  async _getLocationModel(languageFeaturesService, model, position2, token) {
    return new ReferencesModel(await getReferencesAtPosition(languageFeaturesService.referenceProvider, model, position2, true, false, token), localize(1247, null));
  }
});

registerAction2(class PeekReferencesAction extends ReferencesAction {
  constructor() {
    super({
      openToSide: false,
      openInPeek: true,
      muteMessage: false
    }, {
      id: "editor.action.referenceSearch.trigger",
      title: localize2(1248, "Peek References"),
      precondition: ContextKeyExpr.and(
        EditorContextKeys.hasReferenceProvider,
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      ),
      menu: {
        id: MenuId.EditorContextPeek,
        group: "peek",
        order: 6
      }
    });
  }
  async _getLocationModel(languageFeaturesService, model, position2, token) {
    return new ReferencesModel(await getReferencesAtPosition(languageFeaturesService.referenceProvider, model, position2, false, false, token), localize(1247, null));
  }
});

var GenericGoToLocationAction = class extends SymbolNavigationAction {
  constructor(config, _references, _gotoMultipleBehaviour) {
    super(config, {
      id: "editor.action.goToLocation",
      title: localize2(1239, "Go to Any Symbol"),
      precondition: ContextKeyExpr.and(
        PeekContext.notInPeekEditor,
        EditorContextKeys.isInEmbeddedEditor.toNegated()
      )
    });
    this._references = _references;
    this._gotoMultipleBehaviour = _gotoMultipleBehaviour;
  }
  async _getLocationModel(languageFeaturesService, _model, _position, _token) {
    return new ReferencesModel(this._references, localize(1232, null));
  }
  _getNoResultFoundMessage(info) {
    return info && localize(1230, null, info.word) || "";
  }
  _getGoToPreference(editor) {
    return this._gotoMultipleBehaviour ?? editor.getOption(67 /* gotoLocation */).multipleReferences;
  }
  _getAlternativeCommand() {
    return void 0;
  }
};

CommandsRegistry.registerCommand({
  id: "editor.action.goToLocations",
  metadata: {
    description: "Go to locations from a position in a file",
    args: [
      { name: "uri", description: "The text document in which to start", constraint: URI },
      { name: "position", description: "The position at which to start", constraint: Position.isIPosition },
      { name: "locations", description: "An array of locations.", constraint: Array },
      { name: "multiple", description: "Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto`" },
      { name: "noResultsMessage", description: "Human readable message that shows when locations is empty." }
    ]
  },
  handler: async (accessor, resource, position2, references, multiple, noResultsMessage, openInPeek) => {
    assertType(URI.isUri(resource));
    assertType(Position.isIPosition(position2));
    assertType(Array.isArray(references));
    assertType(typeof multiple === "undefined" || typeof multiple === "string");
    assertType(typeof openInPeek === "undefined" || typeof openInPeek === "boolean");
    const editorService = accessor.get(ICodeEditorService);
    const editor = await editorService.openCodeEditor({ resource }, editorService.getFocusedCodeEditor());
    if (isCodeEditor(editor)) {
      editor.setPosition(position2);
      editor.revealPositionInCenterIfOutsideViewport(position2, 0 /* Smooth */);
      return editor.invokeWithinContext((accessor2) => {
        const command4 = new class extends GenericGoToLocationAction {
          _getNoResultFoundMessage(info) {
            return noResultsMessage || super._getNoResultFoundMessage(info);
          }
        }({
          muteMessage: !Boolean(noResultsMessage),
          openInPeek: Boolean(openInPeek),
          openToSide: false
        }, references, multiple);
        accessor2.get(IInstantiationService).invokeFunction(command4.run.bind(command4), editor);
      });
    }
  }
});

CommandsRegistry.registerCommand({
  id: "editor.action.peekLocations",
  metadata: {
    description: "Peek locations from a position in a file",
    args: [
      { name: "uri", description: "The text document in which to start", constraint: URI },
      { name: "position", description: "The position at which to start", constraint: Position.isIPosition },
      { name: "locations", description: "An array of locations.", constraint: Array },
      { name: "multiple", description: "Define what to do when having multiple results, either `peek`, `gotoAndPeek`, or `goto`" }
    ]
  },
  handler: async (accessor, resource, position2, references, multiple) => {
    accessor.get(ICommandService).executeCommand("editor.action.goToLocations", resource, position2, references, multiple, void 0, true);
  }
});

CommandsRegistry.registerCommand({
  id: "editor.action.findReferences",
  handler: (accessor, resource, position2) => {
    assertType(URI.isUri(resource));
    assertType(Position.isIPosition(position2));
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const codeEditorService = accessor.get(ICodeEditorService);
    return codeEditorService.openCodeEditor({ resource }, codeEditorService.getFocusedCodeEditor()).then((control) => {
      if (!isCodeEditor(control) || !control.hasModel()) {
        return void 0;
      }
      const controller = ReferencesController.get(control);
      if (!controller) {
        return void 0;
      }
      const references = createCancelablePromise((token) => getReferencesAtPosition(languageFeaturesService.referenceProvider, control.getModel(), Position.lift(position2), false, false, token).then((references2) => new ReferencesModel(references2, localize(1247, null))));
      const range2 = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column);
      return Promise.resolve(controller.toggleWidget(range2, references, false));
    });
  }
});

CommandsRegistry.registerCommandAlias("editor.action.showReferences", "editor.action.peekLocations");
export { SymbolNavigationAnchor, SymbolNavigationAction, DefinitionAction, DeclarationAction, TypeDefinitionAction, ImplementationAction, ReferencesAction, GenericGoToLocationAction };
