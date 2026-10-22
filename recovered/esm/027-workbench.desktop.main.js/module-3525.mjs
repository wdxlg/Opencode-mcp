// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/commands/configureSnippets.ts
import { URI } from "./module-0032.mjs";
import { basename2, joinPath } from "./module-0034.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { getIconClassesForLanguageId } from "./module-0755.mjs";
import { extname } from "./module-0026.mjs";
import { isValidBasename } from "./module-0031.mjs";
import { SnippetsAction } from "./module-3524.mjs";
import { MenuId } from "./module-0092.mjs";
import { ISnippetsService } from "./module-1352.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/snippets/browser/commands/configureSnippets.ts
var ISnippetPick;

((ISnippetPick2) => {
  function is(thing) {
    return !!thing && URI.isUri(thing.filepath);
  }
  ISnippetPick2.is = is;
})(ISnippetPick || (ISnippetPick = {}));

async function computePicks(snippetService, userDataProfileService, languageService, labelService) {
  const existing = [];
  const future = [];
  const seen = /* @__PURE__ */ new Set();
  const added = /* @__PURE__ */ new Map();
  for (const file of await snippetService.getSnippetFiles()) {
    if (file.source === 3 /* Extension */) {
      continue;
    }
    if (file.isGlobalSnippets) {
      await file.load();
      const names = /* @__PURE__ */ new Set();
      let source;
      outer: for (const snippet2 of file.data) {
        if (!source) {
          source = snippet2.source;
        }
        for (const scope of snippet2.scopes) {
          const name = languageService.getLanguageName(scope);
          if (name) {
            if (names.size >= 4) {
              names.add(`${name}...`);
              break outer;
            } else {
              names.add(name);
            }
          }
        }
      }
      const snippet = {
        label: basename2(file.location),
        filepath: file.location,
        description: names.size === 0 ? localize(19326, null) : localize(19325, null, [...names].join(", "))
      };
      existing.push(snippet);
      if (!source) {
        continue;
      }
      const detail2 = localize(19324, null, source, labelService.getUriLabel(file.location, { relative: true }));
      const lastItem = added.get(basename2(file.location));
      if (lastItem) {
        snippet.detail = detail2;
        lastItem.snippet.detail = lastItem.detail;
      }
      added.set(basename2(file.location), { snippet, detail: detail2 });
    } else {
      const mode = basename2(file.location).replace(/\.json$/, "");
      existing.push({
        label: basename2(file.location),
        description: `(${languageService.getLanguageName(mode) ?? mode})`,
        filepath: file.location
      });
      seen.add(mode);
    }
  }
  const dir = userDataProfileService.currentProfile.snippetsHome;
  for (const languageId of languageService.getRegisteredLanguageIds()) {
    const label3 = languageService.getLanguageName(languageId);
    if (label3 && !seen.has(languageId)) {
      future.push({
        label: label3,
        description: `(${languageId})`,
        filepath: joinPath(dir, `${languageId}.json`),
        hint: true,
        iconClasses: getIconClassesForLanguageId(languageId)
      });
    }
  }
  existing.sort((a, b) => {
    const a_ext = extname(a.filepath.path);
    const b_ext = extname(b.filepath.path);
    if (a_ext === b_ext) {
      return a.label.localeCompare(b.label);
    } else if (a_ext === ".code-snippets") {
      return -1;
    } else {
      return 1;
    }
  });
  future.sort((a, b) => {
    return a.label.localeCompare(b.label);
  });
  return { existing, future };
}

async function createSnippetFile(scope, defaultPath, quickInputService, fileService, textFileService, opener) {
  function createSnippetUri(input2) {
    const filename = extname(input2) !== ".code-snippets" ? `${input2}.code-snippets` : input2;
    return joinPath(defaultPath, filename);
  }
  await fileService.createFolder(defaultPath);
  const input = await quickInputService.input({
    placeHolder: localize(19329, null),
    async validateInput(input2) {
      if (!input2) {
        return localize(19321, null);
      }
      if (!isValidBasename(input2)) {
        return localize(19322, null, input2);
      }
      if (await fileService.exists(createSnippetUri(input2))) {
        return localize(19323, null, input2);
      }
      return void 0;
    }
  });
  if (!input) {
    return void 0;
  }
  const resource = createSnippetUri(input);
  await textFileService.write(resource, [
    "{",
    "	// Place your " + scope + " snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and ",
    "	// description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope ",
    "	// is left empty or omitted, the snippet gets applied to all languages. The prefix is what is ",
    "	// used to trigger the snippet and the body will be expanded and inserted. Possible variables are: ",
    "	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. ",
    "	// Placeholders with the same ids are connected.",
    "	// Example:",
    '	// "Print to console": {',
    '	// 	"scope": "javascript,typescript",',
    '	// 	"prefix": "log",',
    '	// 	"body": [',
    `	// 		"console.log('$1');",`,
    '	// 		"$2"',
    "	// 	],",
    '	// 	"description": "Log output to console"',
    "	// }",
    "	//",
    "	// You can also restrict snippets to specific files using include/exclude patterns:",
    '	// "Test snippet": {',
    '	// 	"scope": "javascript,typescript",',
    '	// 	"prefix": "test",',
    `	// 	"body": "test('$1', () => {\\n\\t$0\\n});",`,
    '	// 	"include": ["**/*.test.ts", "*.spec.ts"],',
    '	// 	"exclude": ["**/temp/*.ts"],',
    '	// 	"description": "Insert test block"',
    "	// }",
    "}"
  ].join("\n"));
  await opener.open(resource);
  return void 0;
}

async function createLanguageSnippetFile(pick, fileService, textFileService) {
  if (await fileService.exists(pick.filepath)) {
    return;
  }
  const contents = [
    "{",
    "	// Place your snippets for " + pick.label + " here. Each snippet is defined under a snippet name and has a prefix, body and ",
    "	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:",
    "	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the ",
    "	// same ids are connected.",
    "	// Example:",
    '	// "Print to console": {',
    '	// 	"prefix": "log",',
    '	// 	"body": [',
    `	// 		"console.log('$1');",`,
    '	// 		"$2"',
    "	// 	],",
    '	// 	"description": "Log output to console"',
    "	// }",
    "	//",
    "	// You can also restrict snippets to specific files using include/exclude patterns:",
    '	// "Test snippet": {',
    '	// 	"prefix": "test",',
    `	// 	"body": "test('$1', () => {\\n\\t$0\\n});",`,
    '	// 	"include": ["**/*.test.ts", "*.spec.ts"],',
    '	// 	"exclude": ["**/temp/*.ts"],',
    '	// 	"description": "Insert test block"',
    "	// }",
    "}"
  ].join("\n");
  await textFileService.write(pick.filepath, contents);
}

var ConfigureSnippetsAction = class extends SnippetsAction {
  constructor() {
    super({
      id: "workbench.action.openSnippets",
      title: localize2(19335, "Configure Snippets"),
      shortTitle: {
        ...localize2(19337, "Snippets"),
        mnemonicTitle: localize(19328, null)
      },
      f1: true,
      menu: [
        { id: MenuId.MenubarPreferencesMenu, group: "2_configuration", order: 5 },
        { id: MenuId.GlobalActivity, group: "2_configuration", order: 5 }
      ]
    });
  }
  async run(accessor) {
    const snippetService = accessor.get(ISnippetsService);
    const quickInputService = accessor.get(IQuickInputService);
    const opener = accessor.get(IOpenerService);
    const languageService = accessor.get(ILanguageService);
    const userDataProfileService = accessor.get(IUserDataProfileService);
    const workspaceService = accessor.get(IWorkspaceContextService);
    const fileService = accessor.get(IFileService);
    const textFileService = accessor.get(ITextFileService);
    const labelService = accessor.get(ILabelService);
    const picks = await computePicks(snippetService, userDataProfileService, languageService, labelService);
    const existing = picks.existing;
    const globalSnippetPicks = [{
      scope: localize(19332, null),
      label: localize(19331, null),
      uri: userDataProfileService.currentProfile.snippetsHome
    }];
    const workspaceSnippetPicks = [];
    for (const folder of workspaceService.getWorkspace().folders) {
      workspaceSnippetPicks.push({
        scope: localize(19334, null, folder.name),
        label: localize(19330, null, folder.name),
        uri: folder.toResource(".vscode")
      });
    }
    if (existing.length > 0) {
      existing.unshift({ type: "separator", label: localize(19327, null) });
      existing.push({ type: "separator", label: localize(19333, null) });
    } else {
      existing.push({ type: "separator", label: localize(19333, null) });
    }
    const pick = await quickInputService.pick([].concat(existing, globalSnippetPicks, workspaceSnippetPicks, picks.future), {
      placeHolder: localize(19336, null),
      matchOnDescription: true
    });
    if (globalSnippetPicks.indexOf(pick) >= 0) {
      return createSnippetFile(pick.scope, pick.uri, quickInputService, fileService, textFileService, opener);
    } else if (workspaceSnippetPicks.indexOf(pick) >= 0) {
      return createSnippetFile(pick.scope, pick.uri, quickInputService, fileService, textFileService, opener);
    } else if (ISnippetPick.is(pick)) {
      if (pick.hint) {
        await createLanguageSnippetFile(pick, fileService, textFileService);
      }
      return opener.open(pick.filepath);
    }
  }
};
export { computePicks, createSnippetFile, createLanguageSnippetFile, ISnippetPick, ConfigureSnippetsAction };
