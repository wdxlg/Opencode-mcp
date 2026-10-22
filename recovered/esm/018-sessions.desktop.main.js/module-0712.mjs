// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/snippet/browser/snippetVariables.ts
import { commonPrefixLength2, getLeadingWhitespace, isFalsyOrWhitespace, splitLines } from "./module-0030.mjs";
import { Text } from "./module-0544.mjs";
import { basename, dirname } from "./module-0026.mjs";
import { dirname2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { localize } from "./module-0001.mjs";
import { WORKSPACE_EXTENSION, isEmptyWorkspaceIdentifier, isSingleFolderWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/editor/contrib/snippet/browser/snippetVariables.ts
var KnownSnippetVariableNames = Object.freeze({
  "CURRENT_YEAR": true,
  "CURRENT_YEAR_SHORT": true,
  "CURRENT_MONTH": true,
  "CURRENT_DATE": true,
  "CURRENT_HOUR": true,
  "CURRENT_MINUTE": true,
  "CURRENT_SECOND": true,
  "CURRENT_MILLISECOND": true,
  "CURRENT_DAY_NAME": true,
  "CURRENT_DAY_NAME_SHORT": true,
  "CURRENT_MONTH_NAME": true,
  "CURRENT_MONTH_NAME_SHORT": true,
  "CURRENT_SECONDS_UNIX": true,
  "CURRENT_MILLISECONDS_UNIX": true,
  "CURRENT_TIMEZONE_OFFSET": true,
  "CURRENT_TIMEZONE_NAME": true,
  "SELECTION": true,
  "CLIPBOARD": true,
  "TM_SELECTED_TEXT": true,
  "TM_CURRENT_LINE": true,
  "TM_CURRENT_WORD": true,
  "TM_LINE_INDEX": true,
  "TM_LINE_NUMBER": true,
  "TM_FILENAME": true,
  "TM_FILENAME_BASE": true,
  "TM_DIRECTORY": true,
  "TM_DIRECTORY_BASE": true,
  "TM_FILEPATH": true,
  "CURSOR_INDEX": true,
  // 0-offset
  "CURSOR_NUMBER": true,
  // 1-offset
  "RELATIVE_FILEPATH": true,
  "BLOCK_COMMENT_START": true,
  "BLOCK_COMMENT_END": true,
  "LINE_COMMENT": true,
  "WORKSPACE_NAME": true,
  "WORKSPACE_FOLDER": true,
  "RANDOM": true,
  "RANDOM_HEX": true,
  "UUID": true
});

var CompositeSnippetVariableResolver = class {
  constructor(_delegates) {
    this._delegates = _delegates;
  }
  resolve(variable) {
    for (const delegate of this._delegates) {
      const value2 = delegate.resolve(variable);
      if (value2 !== void 0) {
        return value2;
      }
    }
    return void 0;
  }
};

var SelectionBasedVariableResolver = class {
  constructor(_model, _selection, _selectionIdx, _overtypingCapturer) {
    this._model = _model;
    this._selection = _selection;
    this._selectionIdx = _selectionIdx;
    this._overtypingCapturer = _overtypingCapturer;
  }
  resolve(variable) {
    const { name } = variable;
    if (name === "SELECTION" || name === "TM_SELECTED_TEXT") {
      let value2 = this._model.getValueInRange(this._selection) || void 0;
      let isMultiline = this._selection.startLineNumber !== this._selection.endLineNumber;
      if (!value2 && this._overtypingCapturer) {
        const info = this._overtypingCapturer.getLastOvertypedInfo(this._selectionIdx);
        if (info) {
          value2 = info.value;
          isMultiline = info.multiline;
        }
      }
      if (value2 && isMultiline && variable.snippet) {
        const line = this._model.getLineContent(this._selection.startLineNumber);
        const lineLeadingWhitespace = getLeadingWhitespace(line, 0, this._selection.startColumn - 1);
        let varLeadingWhitespace = lineLeadingWhitespace;
        variable.snippet.walk((marker) => {
          if (marker === variable) {
            return false;
          }
          if (marker instanceof Text) {
            varLeadingWhitespace = getLeadingWhitespace(splitLines(marker.value).pop());
          }
          return true;
        });
        const whitespaceCommonLength = commonPrefixLength2(varLeadingWhitespace, lineLeadingWhitespace);
        value2 = value2.replace(
          /(\r\n|\r|\n)(.*)/g,
          (m, newline2, rest) => `${newline2}${varLeadingWhitespace.substr(whitespaceCommonLength)}${rest}`
        );
      }
      return value2;
    } else if (name === "TM_CURRENT_LINE") {
      return this._model.getLineContent(this._selection.positionLineNumber);
    } else if (name === "TM_CURRENT_WORD") {
      const info = this._model.getWordAtPosition({
        lineNumber: this._selection.positionLineNumber,
        column: this._selection.positionColumn
      });
      return info && info.word || void 0;
    } else if (name === "TM_LINE_INDEX") {
      return String(this._selection.positionLineNumber - 1);
    } else if (name === "TM_LINE_NUMBER") {
      return String(this._selection.positionLineNumber);
    } else if (name === "CURSOR_INDEX") {
      return String(this._selectionIdx);
    } else if (name === "CURSOR_NUMBER") {
      return String(this._selectionIdx + 1);
    }
    return void 0;
  }
};

var ModelBasedVariableResolver = class {
  constructor(_labelService, _model) {
    this._labelService = _labelService;
    this._model = _model;
  }
  resolve(variable) {
    const { name } = variable;
    if (name === "TM_FILENAME") {
      return basename(this._model.uri.fsPath);
    } else if (name === "TM_FILENAME_BASE") {
      const name2 = basename(this._model.uri.fsPath);
      const idx = name2.lastIndexOf(".");
      if (idx <= 0) {
        return name2;
      } else {
        return name2.slice(0, idx);
      }
    } else if (name === "TM_DIRECTORY") {
      if (dirname(this._model.uri.fsPath) === ".") {
        return "";
      }
      return this._labelService.getUriLabel(dirname2(this._model.uri));
    } else if (name === "TM_DIRECTORY_BASE") {
      if (dirname(this._model.uri.fsPath) === ".") {
        return "";
      }
      return basename(dirname(this._model.uri.fsPath));
    } else if (name === "TM_FILEPATH") {
      return this._labelService.getUriLabel(this._model.uri);
    } else if (name === "RELATIVE_FILEPATH") {
      return this._labelService.getUriLabel(this._model.uri, { relative: true, noPrefix: true });
    }
    return void 0;
  }
};

var ClipboardBasedVariableResolver = class {
  constructor(_readClipboardText, _selectionIdx, _selectionCount, _spread) {
    this._readClipboardText = _readClipboardText;
    this._selectionIdx = _selectionIdx;
    this._selectionCount = _selectionCount;
    this._spread = _spread;
  }
  resolve(variable) {
    if (variable.name !== "CLIPBOARD") {
      return void 0;
    }
    const clipboardText = this._readClipboardText();
    if (!clipboardText) {
      return void 0;
    }
    if (this._spread) {
      const lines = clipboardText.split(/\r\n|\n|\r/).filter((s) => !isFalsyOrWhitespace(s));
      if (lines.length === this._selectionCount) {
        return lines[this._selectionIdx];
      }
    }
    return clipboardText;
  }
};

var CommentBasedVariableResolver = class {
  constructor(_model, _selection, _languageConfigurationService) {
    this._model = _model;
    this._selection = _selection;
    this._languageConfigurationService = _languageConfigurationService;
  }
  resolve(variable) {
    const { name } = variable;
    const langId = this._model.getLanguageIdAtPosition(this._selection.selectionStartLineNumber, this._selection.selectionStartColumn);
    const config = this._languageConfigurationService.getLanguageConfiguration(langId).comments;
    if (!config) {
      return void 0;
    }
    if (name === "LINE_COMMENT") {
      return config.lineCommentToken || void 0;
    } else if (name === "BLOCK_COMMENT_START") {
      return config.blockCommentStartToken || void 0;
    } else if (name === "BLOCK_COMMENT_END") {
      return config.blockCommentEndToken || void 0;
    }
    return void 0;
  }
};

CommentBasedVariableResolver = __decorateClass([
  __decorateParam(2, ILanguageConfigurationService)
], CommentBasedVariableResolver);

var TimeBasedVariableResolver = class _TimeBasedVariableResolver {
  constructor() {
    this._date = /* @__PURE__ */ new Date();
  }
  static {
    this.dayNames = [localize(1622, null), localize(1612, null), localize(1626, null), localize(1628, null), localize(1624, null), localize(1600, null), localize(1618, null)];
  }
  static {
    this.dayNamesShort = [localize(1623, null), localize(1613, null), localize(1627, null), localize(1629, null), localize(1625, null), localize(1601, null), localize(1619, null)];
  }
  static {
    this.monthNames = [localize(1602, null), localize(1598, null), localize(1608, null), localize(1592, null), localize(1610, null), localize(1606, null), localize(1604, null), localize(1594, null), localize(1620, null), localize(1616, null), localize(1614, null), localize(1596, null)];
  }
  static {
    this.monthNamesShort = [localize(1603, null), localize(1599, null), localize(1609, null), localize(1593, null), localize(1611, null), localize(1607, null), localize(1605, null), localize(1595, null), localize(1621, null), localize(1617, null), localize(1615, null), localize(1597, null)];
  }
  resolve(variable) {
    const { name } = variable;
    switch (name) {
      case "CURRENT_YEAR":
        return String(this._date.getFullYear());
      case "CURRENT_YEAR_SHORT":
        return String(this._date.getFullYear()).slice(-2);
      case "CURRENT_MONTH":
        return String(this._date.getMonth().valueOf() + 1).padStart(2, "0");
      case "CURRENT_DATE":
        return String(this._date.getDate().valueOf()).padStart(2, "0");
      case "CURRENT_HOUR":
        return String(this._date.getHours().valueOf()).padStart(2, "0");
      case "CURRENT_MINUTE":
        return String(this._date.getMinutes().valueOf()).padStart(2, "0");
      case "CURRENT_SECOND":
        return String(this._date.getSeconds().valueOf()).padStart(2, "0");
      case "CURRENT_MILLISECOND":
        return String(this._date.getMilliseconds().valueOf()).padStart(3, "0");
      case "CURRENT_DAY_NAME":
        return _TimeBasedVariableResolver.dayNames[this._date.getDay()];
      case "CURRENT_DAY_NAME_SHORT":
        return _TimeBasedVariableResolver.dayNamesShort[this._date.getDay()];
      case "CURRENT_MONTH_NAME":
        return _TimeBasedVariableResolver.monthNames[this._date.getMonth()];
      case "CURRENT_MONTH_NAME_SHORT":
        return _TimeBasedVariableResolver.monthNamesShort[this._date.getMonth()];
      case "CURRENT_SECONDS_UNIX":
        return String(Math.floor(this._date.getTime() / 1e3));
      case "CURRENT_MILLISECONDS_UNIX":
        return String(this._date.getTime());
      case "CURRENT_TIMEZONE_OFFSET": {
        const rawTimeOffset = this._date.getTimezoneOffset();
        const sign = rawTimeOffset > 0 ? "-" : "+";
        const hours = Math.trunc(Math.abs(rawTimeOffset / 60));
        const hoursString = hours < 10 ? "0" + hours : hours;
        const minutes = Math.abs(rawTimeOffset) - hours * 60;
        const minutesString = minutes < 10 ? "0" + minutes : minutes;
        return sign + hoursString + ":" + minutesString;
      }
      case "CURRENT_TIMEZONE_NAME":
        return this._timezoneName ??= Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return void 0;
  }
};

var WorkspaceBasedVariableResolver = class {
  constructor(_workspaceService) {
    this._workspaceService = _workspaceService;
  }
  resolve(variable) {
    if (!this._workspaceService) {
      return void 0;
    }
    const workspaceIdentifier = toWorkspaceIdentifier(this._workspaceService.getWorkspace());
    if (isEmptyWorkspaceIdentifier(workspaceIdentifier)) {
      return void 0;
    }
    if (variable.name === "WORKSPACE_NAME") {
      return this._resolveWorkspaceName(workspaceIdentifier);
    } else if (variable.name === "WORKSPACE_FOLDER") {
      return this._resoveWorkspacePath(workspaceIdentifier);
    }
    return void 0;
  }
  _resolveWorkspaceName(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return basename(workspaceIdentifier.uri.path);
    }
    let filename = basename(workspaceIdentifier.configPath.path);
    if (filename.endsWith(WORKSPACE_EXTENSION)) {
      filename = filename.substr(0, filename.length - WORKSPACE_EXTENSION.length - 1);
    }
    return filename;
  }
  _resoveWorkspacePath(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return normalizeDriveLetter(workspaceIdentifier.uri.fsPath);
    }
    const filename = basename(workspaceIdentifier.configPath.path);
    let folderpath = workspaceIdentifier.configPath.fsPath;
    if (folderpath.endsWith(filename)) {
      folderpath = folderpath.substr(0, folderpath.length - filename.length - 1);
    }
    return folderpath ? normalizeDriveLetter(folderpath) : "/";
  }
};

var RandomBasedVariableResolver = class {
  resolve(variable) {
    const { name } = variable;
    if (name === "RANDOM") {
      return Math.random().toString().slice(-6);
    } else if (name === "RANDOM_HEX") {
      return Math.random().toString(16).slice(-6);
    } else if (name === "UUID") {
      return generateUuid();
    }
    return void 0;
  }
};
export { KnownSnippetVariableNames, CompositeSnippetVariableResolver, SelectionBasedVariableResolver, ModelBasedVariableResolver, ClipboardBasedVariableResolver, CommentBasedVariableResolver, TimeBasedVariableResolver, WorkspaceBasedVariableResolver, RandomBasedVariableResolver };
