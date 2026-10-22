// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptBodyAutocompletion.ts
import { getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { dirname2, extUri } from "./module-0034.mjs";
import { chatVariableLeader } from "./module-0987.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptBodyAutocompletion.ts
var PromptBodyAutocompletion = class {
  constructor(fileService, languageModelToolsService) {
    this.fileService = fileService;
    this.languageModelToolsService = languageModelToolsService;
    /**
     * Debug display name for this provider.
     */
    this._debugDisplayName = "PromptBodyAutocompletion";
    /**
     * List of trigger characters handled by this provider.
     */
    this.triggerCharacters = [":", ".", "/", "\\"];
  }
  /**
   * The main function of this provider that calculates
   * completion items based on the provided arguments.
   */
  async provideCompletionItems(model, position2, context2, token) {
    const promptsType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptsType) {
      return void 0;
    }
    const reference = await this.findVariableReference(model, position2, token);
    if (!reference) {
      return void 0;
    }
    const suggestions = [];
    switch (reference.type) {
      case "file":
        if (reference.contentRange.containsPosition(position2)) {
          await this.collectFilePathCompletions(model, position2, reference.contentRange, suggestions);
        } else {
          await this.collectDefaultCompletions(model, reference.range, promptsType, suggestions);
        }
        break;
      case "tool":
        if (reference.contentRange.containsPosition(position2)) {
          if (promptsType === "agent" /* agent */ || promptsType === "prompt" /* prompt */) {
            await this.collectToolCompletions(model, position2, reference.contentRange, suggestions);
          }
        } else {
          await this.collectDefaultCompletions(model, reference.range, promptsType, suggestions);
        }
        break;
      default:
        await this.collectDefaultCompletions(model, reference.range, promptsType, suggestions);
    }
    return { suggestions };
  }
  async collectToolCompletions(model, position2, toolRange, suggestions) {
    for (const toolName of this.languageModelToolsService.getFullReferenceNames()) {
      suggestions.push({
        label: toolName,
        kind: 13 /* Value */,
        filterText: toolName,
        insertText: toolName,
        range: toolRange
      });
    }
  }
  async collectFilePathCompletions(model, position2, pathRange, suggestions) {
    const pathUntilPosition = model.getValueInRange(pathRange.setEndPosition(position2.lineNumber, position2.column));
    const pathSeparator = pathUntilPosition.includes("/") || !pathUntilPosition.includes("\\") ? "/" : "\\";
    let parentFolderPath;
    if (pathUntilPosition.match(/[^\/]\.\.$/i)) {
      parentFolderPath = pathUntilPosition + pathSeparator;
    } else {
      let i2 = pathUntilPosition.length - 1;
      while (i2 >= 0 && ![47 /* Slash */, 92 /* Backslash */].includes(pathUntilPosition.charCodeAt(i2))) {
        i2--;
      }
      parentFolderPath = pathUntilPosition.substring(0, i2 + 1);
    }
    const retriggerCommand = { id: "editor.action.triggerSuggest", title: "Suggest" };
    try {
      const currentFolder = extUri.resolvePath(dirname2(model.uri), parentFolderPath);
      const { children } = await this.fileService.resolve(currentFolder);
      if (children) {
        for (const child of children) {
          const insertText = (parentFolderPath || "." + pathSeparator) + child.name;
          suggestions.push({
            label: child.name + (child.isDirectory ? pathSeparator : ""),
            kind: child.isDirectory ? 23 /* Folder */ : 20 /* File */,
            range: pathRange,
            insertText: insertText + (child.isDirectory ? pathSeparator : ""),
            filterText: insertText,
            command: child.isDirectory ? retriggerCommand : void 0
          });
        }
      }
    } catch (e) {
    }
    suggestions.push({
      label: "..",
      kind: 23 /* Folder */,
      insertText: parentFolderPath + ".." + pathSeparator,
      range: pathRange,
      filterText: parentFolderPath + "..",
      command: retriggerCommand
    });
  }
  /**
   * Finds a file reference that suites the provided `position`.
   */
  async findVariableReference(model, position2, token) {
    if (model.getLineContent(1).trimEnd() === "---") {
      let i2 = 2;
      while (i2 <= model.getLineCount() && model.getLineContent(i2).trimEnd() !== "---") {
        i2++;
      }
      if (i2 >= position2.lineNumber) {
        return void 0;
      }
    }
    const reg3 = new RegExp(`${chatVariableLeader}[^\\s#]*`, "g");
    const varWord = getWordAtText(position2.column, reg3, model.getLineContent(position2.lineNumber), 0);
    if (!varWord) {
      return void 0;
    }
    const range2 = new Range2(position2.lineNumber, varWord.startColumn + 1, position2.lineNumber, varWord.endColumn);
    const nameMatch = varWord.word.match(/^#(\w+:)?/);
    if (nameMatch) {
      const contentCol = varWord.startColumn + nameMatch[0].length;
      if (nameMatch[1] === "file:") {
        return { type: "file", contentRange: new Range2(position2.lineNumber, contentCol, position2.lineNumber, varWord.endColumn), range: range2 };
      } else if (nameMatch[1] === "tool:") {
        return { type: "tool", contentRange: new Range2(position2.lineNumber, contentCol, position2.lineNumber, varWord.endColumn), range: range2 };
      }
    }
    return { type: "", contentRange: range2, range: range2 };
  }
  async collectDefaultCompletions(model, range2, promptFileType, suggestions) {
    const labels2 = promptFileType === "instructions" /* instructions */ ? ["file"] : ["file", "tool"];
    labels2.forEach((label3) => {
      suggestions.push({
        label: `${label3}:`,
        kind: 17 /* Keyword */,
        insertText: `${label3}:`,
        range: range2,
        command: { id: "editor.action.triggerSuggest", title: "Suggest" }
      });
    });
  }
};

PromptBodyAutocompletion = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILanguageModelToolsService)
], PromptBodyAutocompletion);
export { PromptBodyAutocompletion };
