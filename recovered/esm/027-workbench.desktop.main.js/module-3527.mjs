// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/snippetPicker.ts
import { ISnippetsService } from "./module-1352.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/workbench/contrib/snippets/browser/snippetPicker.ts
async function pickSnippet(accessor, languageIdOrSnippets, resourceUri) {
  const snippetService = accessor.get(ISnippetsService);
  const quickInputService = accessor.get(IQuickInputService);
  let snippets;
  if (Array.isArray(languageIdOrSnippets)) {
    snippets = languageIdOrSnippets;
  } else {
    snippets = await snippetService.getSnippets(languageIdOrSnippets, resourceUri, { includeDisabledSnippets: true, includeNoPrefixSnippets: true });
  }
  snippets.sort((a, b) => a.snippetSource - b.snippetSource);
  const makeSnippetPicks = () => {
    const result2 = [];
    let prevSnippet;
    for (const snippet of snippets) {
      const pick = {
        label: snippet.prefix || snippet.name,
        detail: snippet.description || snippet.body,
        snippet
      };
      if (!prevSnippet || prevSnippet.snippetSource !== snippet.snippetSource || prevSnippet.source !== snippet.source) {
        let label3 = "";
        switch (snippet.snippetSource) {
          case 1 /* User */:
            label3 = localize(19353, null);
            break;
          case 3 /* Extension */:
            label3 = snippet.source;
            break;
          case 2 /* Workspace */:
            label3 = localize(19354, null);
            break;
        }
        result2.push({ type: "separator", label: label3 });
      }
      if (snippet.snippetSource === 3 /* Extension */) {
        const isEnabled = snippetService.isEnabled(snippet);
        if (isEnabled) {
          pick.buttons = [{
            iconClass: ThemeIcon.asClassName(Codicon.eyeClosed),
            tooltip: localize(19348, null)
          }];
        } else {
          pick.description = localize(19350, null);
          pick.buttons = [{
            iconClass: ThemeIcon.asClassName(Codicon.eye),
            tooltip: localize(19349, null)
          }];
        }
      }
      result2.push(pick);
      prevSnippet = snippet;
    }
    return result2;
  };
  const disposables = new DisposableStore();
  const picker = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
  picker.placeholder = localize(19352, null);
  picker.matchOnDetail = true;
  picker.ignoreFocusOut = false;
  picker.keepScrollPosition = true;
  disposables.add(picker.onDidTriggerItemButton((ctx) => {
    const isEnabled = snippetService.isEnabled(ctx.item.snippet);
    snippetService.updateEnablement(ctx.item.snippet, !isEnabled);
    picker.items = makeSnippetPicks();
  }));
  picker.items = makeSnippetPicks();
  if (!picker.items.length) {
    picker.validationMessage = localize(19351, null);
  }
  picker.show();
  await Promise.race([Event2.toPromise(picker.onDidAccept), Event2.toPromise(picker.onDidHide)]);
  const result = picker.selectedItems[0]?.snippet;
  disposables.dispose();
  return result;
}
export { pickSnippet };
