// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/searchTreeCommon.ts
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/searchTreeCommon.ts
function arrayContainsElementOrParent(element, testArray) {
  do {
    if (testArray.includes(element)) {
      return true;
    }
  } while (!isSearchResult(element.parent()) && (element = element.parent()));
  return false;
}

var PLAIN_TEXT_SEARCH__RESULT_ID = "plainTextSearch";

var AI_TEXT_SEARCH_RESULT_ID = "aiTextSearch";

var SEARCH_MODEL_PREFIX = "SEARCH_MODEL_";

var SEARCH_RESULT_PREFIX = "SEARCH_RESULT_";

var TEXT_SEARCH_HEADING_PREFIX = "TEXT_SEARCH_HEADING_";

var FOLDER_MATCH_PREFIX = "FOLDER_MATCH_";

var FILE_MATCH_PREFIX = "FILE_MATCH_";

var MATCH_PREFIX = "MATCH_";

function mergeSearchResultEvents(events) {
  const retEvent = {
    elements: [],
    added: false,
    removed: false
  };
  events.forEach((e4) => {
    if (e4.added) {
      retEvent.added = true;
    }
    if (e4.removed) {
      retEvent.removed = true;
    }
    retEvent.elements = retEvent.elements.concat(e4.elements);
  });
  return retEvent;
}

function isSearchResult(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(SEARCH_RESULT_PREFIX);
}

function isTextSearchHeading(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(TEXT_SEARCH_HEADING_PREFIX);
}

function isPlainTextSearchHeading(obj) {
  return isTextSearchHeading(obj) && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.replace === "function" && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.replaceAll === "function";
}

function isSearchTreeFolderMatch(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(FOLDER_MATCH_PREFIX);
}

function isSearchTreeFolderMatchWithResource(obj) {
  return isSearchTreeFolderMatch(obj) && obj.resource instanceof URI;
}

function isSearchTreeFolderMatchWorkspaceRoot(obj) {
  return isSearchTreeFolderMatchWithResource(obj) && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.createAndConfigureFileMatch === "function";
}

function isSearchTreeFolderMatchNoRoot(obj) {
  return isSearchTreeFolderMatch(obj) && // eslint-disable-next-line local/code-no-any-casts
  typeof obj.createAndConfigureFileMatch === "function";
}

function isSearchTreeFileMatch(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(FILE_MATCH_PREFIX);
}

function isSearchTreeMatch(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(MATCH_PREFIX);
}

function isSearchHeader(obj) {
  return typeof obj === "object" && obj !== null && typeof obj.id === "function" && obj.id().startsWith(TEXT_SEARCH_HEADING_PREFIX);
}

function getFileMatches(matches2) {
  const folderMatches = [];
  const fileMatches = [];
  matches2.forEach((e4) => {
    if (isSearchTreeFileMatch(e4)) {
      fileMatches.push(e4);
    } else {
      folderMatches.push(e4);
    }
  });
  return fileMatches.concat(folderMatches.map((e4) => e4.allDownstreamFileMatches()).flat());
}
export { arrayContainsElementOrParent, mergeSearchResultEvents, isSearchResult, isTextSearchHeading, isPlainTextSearchHeading, isSearchTreeFolderMatch, isSearchTreeFolderMatchWithResource, isSearchTreeFolderMatchWorkspaceRoot, isSearchTreeFolderMatchNoRoot, isSearchTreeFileMatch, isSearchTreeMatch, isSearchHeader, getFileMatches, PLAIN_TEXT_SEARCH__RESULT_ID, AI_TEXT_SEARCH_RESULT_ID, SEARCH_MODEL_PREFIX, SEARCH_RESULT_PREFIX, TEXT_SEARCH_HEADING_PREFIX, FOLDER_MATCH_PREFIX, FILE_MATCH_PREFIX, MATCH_PREFIX };
