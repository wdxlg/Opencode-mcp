// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlayHints/browser/inlayHintsLocations.ts
import { ITextModelService } from "./module-0081.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { MenuId, MenuItemAction, MenuRegistry, isIMenuItem } from "./module-0092.mjs";
import { generateUuid } from "./module-0190.mjs";
import { DefinitionAction, SymbolNavigationAction, SymbolNavigationAnchor } from "./module-0647.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { Range2 } from "./module-0106.mjs";
import { getDomNodePagePosition } from "./module-0075.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { PeekContext } from "./module-0623.mjs";


// src/vs/editor/contrib/inlayHints/browser/inlayHintsLocations.ts
async function showGoToContextMenu(accessor, editor, anchor, part) {
  const resolverService = accessor.get(ITextModelService);
  const contextMenuService = accessor.get(IContextMenuService);
  const commandService = accessor.get(ICommandService);
  const instaService = accessor.get(IInstantiationService);
  const notificationService = accessor.get(INotificationService);
  await part.item.resolve(CancellationToken.None);
  if (!part.part.location) {
    return;
  }
  const location2 = part.part.location;
  const menuActions = [];
  const filter2 = new Set(MenuRegistry.getMenuItems(MenuId.EditorContext).map((item) => isIMenuItem(item) ? item.command.id : generateUuid()));
  for (const delegate of SymbolNavigationAction.all()) {
    if (filter2.has(delegate.desc.id)) {
      menuActions.push(new Action(delegate.desc.id, MenuItemAction.label(delegate.desc, { renderShortTitle: true }), void 0, true, async () => {
        const ref = await resolverService.createModelReference(location2.uri);
        try {
          const symbolAnchor = new SymbolNavigationAnchor(ref.object.textEditorModel, Range2.getStartPosition(location2.range));
          const range2 = part.item.anchor.range;
          await instaService.invokeFunction(delegate.runEditorCommand.bind(delegate), editor, symbolAnchor, range2);
        } finally {
          ref.dispose();
        }
      }));
    }
  }
  if (part.part.command) {
    const { command: command4 } = part.part;
    menuActions.push(new Separator());
    menuActions.push(new Action(command4.id, command4.title, void 0, true, async () => {
      try {
        await commandService.executeCommand(command4.id, ...command4.arguments ?? []);
      } catch (err) {
        notificationService.notify({
          severity: Severity2.Error,
          source: part.item.provider.displayName,
          message: err
        });
      }
    }));
  }
  const useShadowDOM = editor.getOption(144 /* useShadowDOM */);
  contextMenuService.showContextMenu({
    domForShadowRoot: useShadowDOM ? editor.getDomNode() ?? void 0 : void 0,
    getAnchor: () => {
      const box = getDomNodePagePosition(anchor);
      return { x: box.left, y: box.top + box.height + 8 };
    },
    getActions: () => menuActions,
    onHide: () => {
      editor.focus();
    },
    autoSelectFirstItem: true
  });
}

async function goToDefinitionWithLocation(accessor, event, editor, location2) {
  const resolverService = accessor.get(ITextModelService);
  const ref = await resolverService.createModelReference(location2.uri);
  await editor.invokeWithinContext(async (accessor2) => {
    const openToSide = event.hasSideBySideModifier;
    const contextKeyService = accessor2.get(IContextKeyService);
    const isInPeek = PeekContext.inPeekEditor.getValue(contextKeyService);
    const canPeek = !openToSide && editor.getOption(101 /* definitionLinkOpensInPeek */) && !isInPeek;
    const action = new DefinitionAction({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: "", original: "" }, id: "", precondition: void 0 });
    return action.run(accessor2, new SymbolNavigationAnchor(ref.object.textEditorModel, Range2.getStartPosition(location2.range)), Range2.lift(location2.range));
  });
  ref.dispose();
}
export { showGoToContextMenu, goToDefinitionWithLocation };
