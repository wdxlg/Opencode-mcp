// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThrough.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { WalkThroughPart } from "./module-3566.mjs";
import { localize } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { WalkThroughInput } from "./module-3564.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { EditorWalkThroughAction, EditorWalkThroughInputSerializer } from "./module-3569.mjs";
import { registerWorkbenchContribution2 } from "./module-0870.mjs";
import { WalkThroughSnippetContentProvider } from "./module-3563.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { WalkThroughArrowDown, WalkThroughArrowUp, WalkThroughPageDown, WalkThroughPageUp } from "./module-3567.mjs";


// src/vs/workbench/contrib/welcomeWalkthrough/browser/walkThrough.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    WalkThroughPart,
    WalkThroughPart.ID,
    localize(22265, null)
  ),
  [new SyncDescriptor(WalkThroughInput)]
);

registerAction2(EditorWalkThroughAction);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(EditorWalkThroughInputSerializer.ID, EditorWalkThroughInputSerializer);

registerWorkbenchContribution2(WalkThroughSnippetContentProvider.ID, WalkThroughSnippetContentProvider, { editorTypeId: WalkThroughPart.ID });

KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughArrowUp);

KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughArrowDown);

KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughPageUp);

KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughPageDown);

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
  group: "1_welcome",
  command: {
    id: "workbench.action.showInteractivePlayground",
    title: localize(22264, null)
  },
  order: 3
});
export {};
