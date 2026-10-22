// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibleViewKeybindingResolver.ts
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibleViewKeybindingResolver.ts
function resolveContentAndKeybindingItems(keybindingService, value2) {
  if (!value2) {
    return;
  }
  const configureKeybindingItems = [];
  const configuredKeybindingItems = [];
  const matches2 = value2.matchAll(/(\<keybinding:(?<commandId>[^\<]*)\>)/gm);
  for (const match2 of [...matches2]) {
    const commandId = match2?.groups?.commandId;
    let kbLabel;
    if (match2?.length && commandId) {
      const keybinding = keybindingService.lookupKeybinding(commandId)?.getAriaLabel();
      if (!keybinding) {
        kbLabel = ` (unassigned keybinding)`;
        configureKeybindingItems.push({
          label: commandId,
          id: commandId
        });
      } else {
        kbLabel = " (" + keybinding + ")";
        configuredKeybindingItems.push({
          label: commandId,
          id: commandId
        });
      }
      value2 = value2.replace(match2[0], kbLabel);
    }
  }
  const content = new MarkdownString(value2);
  content.isTrusted = true;
  return { content, configureKeybindingItems: configureKeybindingItems.length ? configureKeybindingItems : void 0, configuredKeybindingItems: configuredKeybindingItems.length ? configuredKeybindingItems : void 0 };
}
export { resolveContentAndKeybindingItems };
