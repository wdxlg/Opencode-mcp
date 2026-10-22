// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/variableCompletions.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { Range2 } from "./module-0106.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { isDiffEditorInput } from "./module-0926.mjs";
import { isSupportedChatFileScheme } from "./module-0965.mjs";
import { basename2, isEqualOrParent2 } from "./module-0034.mjs";
import { isPatternInWord } from "./module-0453.mjs";
import { Schemas } from "./module-0033.mjs";
import { searchFilesAndFolders } from "./module-2834.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ISearchService } from "./module-1000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/chat/browser/variableCompletions.ts
var VARIABLE_LEADER = "#";

var ADD_REFERENCE_COMMAND = "sessions.chat.addVariableReference";

CommandsRegistry.registerCommand(ADD_REFERENCE_COMMAND, (_accessor, arg) => {
  arg.attachments.addAttachments({
    id: arg.entry.id,
    name: arg.entry.name,
    value: arg.entry.value,
    kind: arg.entry.kind
  });
});

function computeRange(model, position2, reg2) {
  const varWord = getWordAtText(position2.column, reg2, model.getLineContent(position2.lineNumber), 0);
  if (!varWord && model.getWordUntilPosition(position2).word) {
    return;
  }
  if (!varWord && position2.column > 1) {
    const textBefore = model.getValueInRange(new Range2(position2.lineNumber, position2.column - 1, position2.lineNumber, position2.column));
    if (textBefore !== " ") {
      return;
    }
  }
  if (varWord) {
    const wordBefore = model.getWordUntilPosition({ lineNumber: position2.lineNumber, column: varWord.startColumn });
    if (wordBefore.word) {
      return;
    }
  }
  let insert2;
  let replace;
  if (!varWord) {
    insert2 = replace = Range2.fromPositions(position2);
  } else {
    insert2 = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, position2.column);
    replace = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, varWord.endColumn);
  }
  return { insert: insert2, replace, varWord };
}

var VariableCompletionHandler = class extends Disposable {
  constructor(_editor, _contextAttachments, _getWorkspaceUri, languageFeaturesService, searchService, labelService, configurationService, fileService, historyService, instantiationService) {
    super();
    this._editor = _editor;
    this._contextAttachments = _contextAttachments;
    this._getWorkspaceUri = _getWorkspaceUri;
    this.languageFeaturesService = languageFeaturesService;
    this.searchService = searchService;
    this.labelService = labelService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.historyService = historyService;
    this.instantiationService = instantiationService;
    this._decorations = this._editor.createDecorationsCollection();
    this._registerFileCompletions();
    this._registerDecorations();
  }
  static {
    this._wordPattern = /#[^\s]*/g;
  }
  static {
    // MUST use g-flag
    this._className = "sessions-variable-reference";
  }
  // --- File & Folder completions ---
  _registerFileCompletions() {
    const uri4 = this._editor.getModel()?.uri;
    if (!uri4) {
      return;
    }
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: uri4.scheme, hasAccessToAllModels: true }, {
      _debugDisplayName: "sessionsVariableFileAndFolder",
      triggerCharacters: [VARIABLE_LEADER],
      provideCompletionItems: async (model, position2, _context, token) => {
        if (/^\s*\/troubleshoot\b/.test(model.getValue())) {
          return null;
        }
        const workspaceUri = this._getWorkspaceUri();
        if (!workspaceUri) {
          return null;
        }
        const range2 = computeRange(model, position2, VariableCompletionHandler._wordPattern);
        if (!range2) {
          return null;
        }
        const result = { suggestions: [], incomplete: true };
        await this._addFileAndFolderEntries(workspaceUri, result, range2, token);
        return result;
      }
    }));
  }
  async _addFileAndFolderEntries(workspaceUri, result, info, token) {
    const makeItem = (resource, kind, description, boostPriority) => {
      const nameLabel = this.labelService.getUriBasenameLabel(resource);
      const text2 = `${VARIABLE_LEADER}file:${nameLabel}`;
      const uriLabel = this.labelService.getUriLabel(resource, { relative: true });
      const labelDescription = description ? localize(4735, null, uriLabel, description) : uriLabel;
      const sortText = boostPriority ? " " : "!";
      return {
        label: { label: nameLabel, description: labelDescription },
        filterText: `${nameLabel} ${VARIABLE_LEADER}${nameLabel} ${uriLabel}`,
        insertText: info.varWord?.endColumn === info.replace.endColumn ? `${text2} ` : text2,
        range: info,
        kind: kind === 0 /* FILE */ ? 20 /* File */ : 23 /* Folder */,
        sortText,
        command: {
          id: ADD_REFERENCE_COMMAND,
          title: "",
          arguments: [{
            attachments: this._contextAttachments,
            entry: {
              id: resource.toString(),
              name: nameLabel,
              value: resource,
              kind: kind === 0 /* FILE */ ? "file" : "directory"
            }
          }]
        }
      };
    };
    let pattern;
    if (info.varWord?.word && info.varWord.word.startsWith(VARIABLE_LEADER)) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const seen = new ResourceSet();
    let historyCount = 0;
    for (const [i2, item] of this.historyService.getHistory().entries()) {
      const resource = isDiffEditorInput(item) ? item.modified.resource : item.resource;
      if (!resource || seen.has(resource) || !this.instantiationService.invokeFunction((accessor) => isSupportedChatFileScheme(accessor, resource.scheme))) {
        continue;
      }
      if (!isEqualOrParent2(resource, workspaceUri)) {
        continue;
      }
      if (pattern) {
        const uriLabel = this.labelService.getUriLabel(resource, { relative: true }).toLowerCase();
        const baseName = this.labelService.getUriBasenameLabel(resource).toLowerCase();
        const combined = `${baseName} ${uriLabel}`;
        if (!isPatternInWord(pattern, 0, pattern.length, combined, 0, combined.length)) {
          continue;
        }
      }
      seen.add(resource);
      result.suggestions.push(makeItem(resource, 0 /* FILE */, i2 === 0 ? localize(4734, null) : void 0, i2 === 0));
      if (++historyCount >= 5) {
        break;
      }
    }
    if (workspaceUri.scheme === Schemas.file || workspaceUri.scheme === Schemas.vscodeRemote) {
      await this._addEntriesViaSearch(workspaceUri, pattern, seen, makeItem, result, token);
    } else {
      await this._addEntriesViaFileService(workspaceUri, pattern, seen, makeItem, result, token);
    }
  }
  /**
   * Uses the search service to find files/folders — works for `file://` and `vscodeRemote` schemes.
   */
  async _addEntriesViaSearch(workspaceUri, pattern, seen, makeItem, result, token) {
    try {
      const { files, folders } = await searchFilesAndFolders(workspaceUri, pattern || "", true, token, void 0, this.configurationService, this.searchService);
      for (const file of files) {
        if (!seen.has(file)) {
          seen.add(file);
          result.suggestions.push(makeItem(file, 0 /* FILE */));
        }
      }
      for (const folder of folders) {
        if (!seen.has(folder)) {
          seen.add(folder);
          result.suggestions.push(makeItem(folder, 1 /* FOLDER */));
        }
      }
    } catch {
    }
  }
  /**
   * Walks the file tree via IFileService — used for virtual filesystems
   * (e.g. `github-remote-file://`) that don't support the search service.
   */
  async _addEntriesViaFileService(workspaceUri, pattern, seen, makeItem, result, token) {
    const maxResults = 100;
    const maxDepth = 10;
    const patternLower = pattern?.toLowerCase();
    const collect2 = async (uri4, depth) => {
      if (result.suggestions.length >= maxResults || depth > maxDepth || token.isCancellationRequested) {
        return;
      }
      try {
        const stat = await this.fileService.resolve(uri4);
        if (!stat.children) {
          return;
        }
        for (const child of stat.children) {
          if (result.suggestions.length >= maxResults || token.isCancellationRequested) {
            break;
          }
          if (child.isDirectory) {
            if (!seen.has(child.resource)) {
              const folderName = basename2(child.resource).toLowerCase();
              if (!patternLower || folderName.includes(patternLower)) {
                seen.add(child.resource);
                result.suggestions.push(makeItem(child.resource, 1 /* FOLDER */));
              }
            }
            await collect2(child.resource, depth + 1);
          } else {
            if (!seen.has(child.resource)) {
              const fileName = child.name.toLowerCase();
              if (!patternLower || fileName.includes(patternLower)) {
                seen.add(child.resource);
                result.suggestions.push(makeItem(child.resource, 0 /* FILE */));
              }
            }
          }
        }
      } catch {
      }
    };
    await collect2(workspaceUri, 0);
  }
  // --- Decorations ---
  _registerDecorations() {
    this._register(this._editor.onDidChangeModelContent(() => this._updateDecorations()));
    this._updateDecorations();
  }
  _updateDecorations() {
    const model = this._editor.getModel();
    const value2 = model?.getValue() ?? "";
    const decos = [];
    const regex = /#file:\S+/g;
    let match2;
    while ((match2 = regex.exec(value2)) !== null) {
      const startOffset = match2.index;
      const endOffset = startOffset + match2[0].length;
      const startPos = model.getPositionAt(startOffset);
      const endPos = model.getPositionAt(endOffset);
      decos.push({
        range: {
          startLineNumber: startPos.lineNumber,
          startColumn: startPos.column,
          endLineNumber: endPos.lineNumber,
          endColumn: endPos.column
        },
        options: { description: "sessions-variable-reference", inlineClassName: VariableCompletionHandler._className }
      });
    }
    this._decorations.set(decos);
  }
};

VariableCompletionHandler = __decorateClass([
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ISearchService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IHistoryService),
  __decorateParam(9, IInstantiationService)
], VariableCompletionHandler);
export { computeRange, VARIABLE_LEADER, ADD_REFERENCE_COMMAND, VariableCompletionHandler };
