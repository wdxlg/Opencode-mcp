// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsCopy.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { category2, getSearchView } from "./module-2836.mjs";
import { SearchContext } from "./module-1262.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ILabelService } from "./module-0641.mjs";
import { isWindows } from "./module-0014.mjs";
import { isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeFolderMatchWithResource, isSearchTreeMatch, isTextSearchHeading } from "./module-2545.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { searchMatchComparer } from "./module-2835.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsCopy.ts
registerAction2(class CopyMatchCommandAction extends Action2 {
  constructor() {
    super({
      id: "search.action.copyMatch" /* CopyMatchCommandId */,
      title: localize2(19095, "Copy"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.FileMatchOrMatchFocusKey,
        primary: 2048 /* CtrlCmd */ | 33 /* KeyC */
      },
      menu: [{
        id: MenuId.SearchContext,
        when: SearchContext.FileMatchOrMatchFocusKey,
        group: "search_2",
        order: 1
      }]
    });
  }
  async run(accessor, match2) {
    await copyMatchCommand(accessor, match2);
  }
});

registerAction2(class CopyPathCommandAction extends Action2 {
  constructor() {
    super({
      id: "search.action.copyPath" /* CopyPathCommandId */,
      title: localize2(19096, "Copy Path"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.FileMatchOrFolderMatchWithResourceFocusKey,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */,
        win: {
          primary: 1024 /* Shift */ | 512 /* Alt */ | 33 /* KeyC */
        }
      },
      menu: [{
        id: MenuId.SearchContext,
        when: SearchContext.FileMatchOrFolderMatchWithResourceFocusKey,
        group: "search_2",
        order: 2
      }]
    });
  }
  async run(accessor, fileMatch) {
    await copyPathCommand2(accessor, fileMatch);
  }
});

registerAction2(class CopyAllCommandAction extends Action2 {
  constructor() {
    super({
      id: "search.action.copyAll" /* CopyAllCommandId */,
      title: localize2(19094, "Copy All"),
      category: category2,
      menu: [{
        id: MenuId.SearchContext,
        when: SearchContext.HasSearchResults,
        group: "search_2",
        order: 3
      }]
    });
  }
  async run(accessor, match2) {
    await copyAllCommand(accessor, match2);
  }
});

registerAction2(class GetSearchResultsAction extends Action2 {
  constructor() {
    super({
      id: "search.action.getSearchResults" /* GetSearchResultsActionId */,
      title: localize2(19097, "Get Search Results"),
      category: category2,
      f1: false
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const labelService = accessor.get(ILabelService);
    const searchView = getSearchView(viewsService);
    if (searchView) {
      const root = searchView.searchResult;
      const textSearchResult = allFolderMatchesToString(root.folderMatches(), labelService);
      const aiSearchResult = allFolderMatchesToString(root.folderMatches(true), labelService);
      const text2 = `${textSearchResult}${lineDelimiter2}${lineDelimiter2}${aiSearchResult}`;
      return text2;
    }
    return void 0;
  }
});

var lineDelimiter2 = isWindows ? "\r\n" : "\n";

async function copyPathCommand2(accessor, fileMatch) {
  if (!fileMatch) {
    const selection = getSelectedRow(accessor);
    if (!isSearchTreeFileMatch(selection) || isSearchTreeFolderMatchWithResource(selection)) {
      return;
    }
    fileMatch = selection;
  }
  const clipboardService = accessor.get(IClipboardService);
  const labelService = accessor.get(ILabelService);
  const text2 = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
  await clipboardService.writeText(text2);
}

async function copyMatchCommand(accessor, match2) {
  if (!match2) {
    const selection = getSelectedRow(accessor);
    if (!selection) {
      return;
    }
    match2 = selection;
  }
  const clipboardService = accessor.get(IClipboardService);
  const labelService = accessor.get(ILabelService);
  let text2;
  if (isSearchTreeMatch(match2)) {
    text2 = matchToString(match2);
  } else if (isSearchTreeFileMatch(match2)) {
    text2 = fileMatchToString(match2, labelService).text;
  } else if (isSearchTreeFolderMatch(match2)) {
    text2 = folderMatchToString(match2, labelService).text;
  }
  if (text2) {
    await clipboardService.writeText(text2);
  }
}

async function copyAllCommand(accessor, match2) {
  const viewsService = accessor.get(IViewsService);
  const clipboardService = accessor.get(IClipboardService);
  const labelService = accessor.get(ILabelService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const root = searchView.searchResult;
    const isAISearchElement = isAISearchResult(match2);
    if (!match2) {
      match2 = getSelectedRow(accessor);
    }
    const text2 = allFolderMatchesToString(root.folderMatches(isAISearchElement), labelService);
    await clipboardService.writeText(text2);
  }
}

function matchToString(match2, indent = 0) {
  const getFirstLinePrefix = () => `${match2.range().startLineNumber},${match2.range().startColumn}`;
  const getOtherLinePrefix = (i2) => match2.range().startLineNumber + i2 + "";
  const fullMatchLines = match2.fullPreviewLines();
  const largestPrefixSize = fullMatchLines.reduce((largest, _, i2) => {
    const thisSize = i2 === 0 ? getFirstLinePrefix().length : getOtherLinePrefix(i2).length;
    return Math.max(thisSize, largest);
  }, 0);
  const formattedLines = fullMatchLines.map((line, i2) => {
    const prefix = i2 === 0 ? getFirstLinePrefix() : getOtherLinePrefix(i2);
    const paddingStr = " ".repeat(largestPrefixSize - prefix.length);
    const indentStr = " ".repeat(indent);
    return `${indentStr}${prefix}: ${paddingStr}${line}`;
  });
  return formattedLines.join("\n");
}

function fileFolderMatchToString(match2, labelService) {
  if (isSearchTreeFileMatch(match2)) {
    return fileMatchToString(match2, labelService);
  } else {
    return folderMatchToString(match2, labelService);
  }
}

function fileMatchToString(fileMatch, labelService) {
  const matchTextRows = fileMatch.matches().sort(searchMatchComparer).map((match2) => matchToString(match2, 2));
  const uriString = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
  return {
    text: `${uriString}${lineDelimiter2}${matchTextRows.join(lineDelimiter2)}`,
    count: matchTextRows.length
  };
}

function folderMatchToString(folderMatch, labelService) {
  const results = [];
  let numMatches = 0;
  const matches2 = folderMatch.matches().sort(searchMatchComparer);
  matches2.forEach((match2) => {
    const result = fileFolderMatchToString(match2, labelService);
    numMatches += result.count;
    results.push(result.text);
  });
  return {
    text: results.join(lineDelimiter2 + lineDelimiter2),
    count: numMatches
  };
}

function allFolderMatchesToString(folderMatches, labelService) {
  const folderResults = [];
  folderMatches = folderMatches.sort(searchMatchComparer);
  for (let i2 = 0; i2 < folderMatches.length; i2++) {
    const folderResult = folderMatchToString(folderMatches[i2], labelService);
    if (folderResult.count) {
      folderResults.push(folderResult.text);
    }
  }
  return folderResults.join(lineDelimiter2 + lineDelimiter2);
}

function getSelectedRow(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  return searchView?.getControl().getSelection()[0];
}

function isAISearchResult(element) {
  if (!element) {
    return false;
  }
  if (isSearchTreeMatch(element)) {
    return element.parent().parent().isAIContributed();
  }
  if (isSearchTreeFileMatch(element)) {
    return element.parent().isAIContributed();
  }
  if (isSearchTreeFolderMatch(element)) {
    return element.isAIContributed();
  }
  if (isTextSearchHeading(element)) {
    return element.isAIContributed;
  }
  return false;
}
export { copyPathCommand2, copyMatchCommand, copyAllCommand, matchToString, fileFolderMatchToString, fileMatchToString, folderMatchToString, allFolderMatchesToString, getSelectedRow, isAISearchResult, lineDelimiter2 };
