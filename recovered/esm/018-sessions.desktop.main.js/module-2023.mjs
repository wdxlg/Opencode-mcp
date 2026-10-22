// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/util.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/scm/browser/util.ts
function getHistoryItemEditorTitle(historyItem) {
  return `${historyItem.displayId ?? historyItem.id} - ${historyItem.subject}`;
}

function getSCMRepositoryIcon(activeRepository, repository) {
  if (!ThemeIcon.isThemeIcon(repository.provider.iconPath)) {
    return Codicon.repo;
  }
  if (activeRepository?.pinned === true && activeRepository?.repository.id === repository.id && repository.provider.iconPath.id === Codicon.repo.id) {
    return Codicon.repoPinned;
  }
  return repository.provider.iconPath;
}
export { getHistoryItemEditorTitle, getSCMRepositoryIcon };
