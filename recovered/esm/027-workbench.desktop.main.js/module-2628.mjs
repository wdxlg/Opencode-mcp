// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptCodeActions.ts
import { getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { MARKERS_OWNER_ID } from "./module-2626.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { localize } from "./module-0001.mjs";
import { Range2 } from "./module-0106.mjs";
import { PromptHeaderAttributes, parseCommaSeparatedList2 } from "./module-1003.mjs";
import { LEGACY_MODE_FILE_EXTENSION } from "./module-0996.mjs";
import { getTarget, isVSCodeOrDefaultTarget } from "./module-1015.mjs";
import { Lazy } from "./module-0028.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IFileService } from "./module-0269.mjs";
import { IMarkerService } from "./module-0560.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptCodeActions.ts
var PromptCodeActionProvider = class {
  constructor(promptsService, languageModelToolsService, fileService, markerService) {
    this.promptsService = promptsService;
    this.languageModelToolsService = languageModelToolsService;
    this.fileService = fileService;
    this.markerService = markerService;
    /**
     * Debug display name for this provider.
     */
    this._debugDisplayName = "PromptCodeActionProvider";
  }
  async provideCodeActions(model, range2, context2, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType || promptType === "instructions" /* instructions */) {
      return void 0;
    }
    const result = [];
    const promptAST = this.promptsService.getParsedPromptFile(model);
    switch (promptType) {
      case "agent" /* agent */:
        this.getUpdateToolsCodeActions(promptAST, promptType, model, range2, result);
        this.getEnableMcpServerCodeActions(model, range2, result);
        await this.getMigrateModeFileCodeActions(model, result);
        break;
      case "prompt" /* prompt */:
        this.getUpdateModeCodeActions(promptAST, model, range2, result);
        this.getUpdateToolsCodeActions(promptAST, promptType, model, range2, result);
        this.getEnableMcpServerCodeActions(model, range2, result);
        break;
    }
    if (result.length === 0) {
      return void 0;
    }
    return {
      actions: result,
      dispose: () => {
      }
    };
  }
  getMarkers(model, range2) {
    const markers = this.markerService.read({ resource: model.uri, owner: MARKERS_OWNER_ID });
    return markers.filter((marker) => range2.containsRange(marker));
  }
  createCodeAction(model, range2, title, edits, command4) {
    return {
      title,
      ...edits ? { edit: { edits } } : {},
      ...command4 ? { command: command4 } : {},
      ranges: [range2],
      diagnostics: this.getMarkers(model, range2),
      kind: CodeActionKind.QuickFix.value
    };
  }
  getEnableMcpServerCodeActions(model, range2, result) {
    const markersInRange = this.getMarkersInRange(model, range2);
    for (const marker of markersInRange) {
      const markerCode = this.getMarkerCode(marker);
      if (markerCode === "promptValidator.missingGithubMcpServer" /* MissingGithubMcpServer */) {
        result.push(this.createCodeAction(
          model,
          range2,
          localize(13085, null),
          void 0,
          { id: "workbench.action.openSettings", title: "", arguments: ["@id:github.copilot.chat.githubMcpServer.enabled"] }
        ));
        result.push(this.createCodeAction(
          model,
          range2,
          localize(13087, null),
          void 0,
          { id: "workbench.extensions.search", title: "", arguments: ["@mcp github"] }
        ));
      } else if (markerCode === "promptValidator.missingPlaywrightMcpServer" /* MissingPlaywrightMcpServer */) {
        result.push(this.createCodeAction(
          model,
          range2,
          localize(13088, null),
          void 0,
          { id: "workbench.extensions.search", title: "", arguments: ["@mcp playwright"] }
        ));
      } else if (markerCode === "promptValidator.unknownExtensionReference" /* UnknownExtensionReference */) {
        const reference = model.getValueInRange(new Range2(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn)).trim();
        const extensionId = reference.split("/")[0].replace(/^['"]|['"]$/g, "");
        if (extensionId) {
          result.push(this.createCodeAction(
            model,
            range2,
            localize(13091, null, extensionId),
            void 0,
            { id: "workbench.extensions.search", title: "", arguments: [`@id:${extensionId}`] }
          ));
        }
      } else if (markerCode === "promptValidator.unknownMcpServerReference" /* UnknownMcpServerReference */) {
        const reference = model.getValueInRange(new Range2(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn)).trim();
        const serverId = reference.replace(/^['"]|['"]$/g, "");
        if (serverId) {
          result.push(this.createCodeAction(
            model,
            range2,
            localize(13093, null, serverId),
            void 0,
            { id: "workbench.extensions.search", title: "", arguments: [`@mcp ${serverId}`] }
          ));
        }
      } else {
        const reference = model.getValueInRange(new Range2(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn)).trim();
        if (reference) {
          const extensionId = reference.split("/")[0].replace(/^['"]|['"]$/g, "");
          result.push(this.createCodeAction(
            model,
            range2,
            localize(13092, null, extensionId),
            void 0,
            { id: "workbench.extensions.search", title: "", arguments: [`@id:${extensionId}`] }
          ));
          const serverId = reference.replace(/^['"]|['"]$/g, "");
          result.push(this.createCodeAction(
            model,
            range2,
            localize(13094, null, serverId),
            void 0,
            { id: "workbench.extensions.search", title: "", arguments: [`@mcp ${serverId}`] }
          ));
        }
      }
    }
  }
  getMarkerCode(marker) {
    if (!marker.code) {
      return void 0;
    }
    return typeof marker.code === "string" ? marker.code : marker.code.value;
  }
  getMarkersInRange(model, range2) {
    const markers = this.markerService.read({ resource: model.uri, owner: MARKERS_OWNER_ID });
    return markers.filter((marker) => {
      const markerRange = new Range2(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn);
      return markerRange.intersectRanges(range2);
    });
  }
  getUpdateModeCodeActions(promptFile, model, range2, result) {
    const modeAttr = promptFile.header?.getAttribute(PromptHeaderAttributes.mode);
    if (!modeAttr?.range.containsRange(range2)) {
      return;
    }
    const keyRange = new Range2(modeAttr.range.startLineNumber, modeAttr.range.startColumn, modeAttr.range.startLineNumber, modeAttr.range.startColumn + modeAttr.key.length);
    result.push(this.createCodeAction(
      model,
      keyRange,
      localize(13090, null),
      [asWorkspaceTextEdit(model, { range: keyRange, text: "agent" })]
    ));
  }
  async getMigrateModeFileCodeActions(model, result) {
    if (model.uri.path.endsWith(LEGACY_MODE_FILE_EXTENSION)) {
      const location2 = this.promptsService.getAgentFileURIFromModeFile(model.uri);
      if (location2 && await this.fileService.canMove(model.uri, location2)) {
        const edit3 = { oldResource: model.uri, newResource: location2, options: { overwrite: false, copy: false } };
        result.push(this.createCodeAction(
          model,
          new Range2(1, 1, 1, 4),
          localize(13089, null),
          [edit3]
        ));
      }
    }
  }
  getUpdateToolsCodeActions(promptFile, promptType, model, range2, result) {
    if (!promptFile.header) {
      return;
    }
    const toolsAttr = promptFile.header.getAttribute(PromptHeaderAttributes.tools);
    if (!toolsAttr || !toolsAttr.value.range.containsRange(range2)) {
      return;
    }
    const target = getTarget(promptType, promptFile.header);
    if (!isVSCodeOrDefaultTarget(target)) {
      return;
    }
    let value2 = toolsAttr.value;
    if (value2.type === "scalar") {
      value2 = parseCommaSeparatedList2(value2);
    }
    if (value2.type !== "sequence") {
      return;
    }
    const values = value2.items;
    const deprecatedNames = new Lazy(() => this.languageModelToolsService.getDeprecatedFullReferenceNames());
    const edits = [];
    for (const item of values) {
      if (item.type !== "scalar") {
        continue;
      }
      const newNames = deprecatedNames.value.get(item.value);
      if (newNames && newNames.size > 0) {
        const quote = model.getValueInRange(new Range2(item.range.startLineNumber, item.range.startColumn, item.range.endLineNumber, item.range.startColumn + 1));
        if (newNames.size === 1) {
          const newName = Array.from(newNames)[0];
          const text2 = quote === `'` || quote === '"' ? quote + newName + quote : newName;
          const edit3 = { range: item.range, text: text2 };
          edits.push(edit3);
          if (item.range.containsRange(range2)) {
            result.push(this.createCodeAction(
              model,
              item.range,
              localize(13096, null, newName),
              [asWorkspaceTextEdit(model, edit3)]
            ));
          }
        } else {
          const newNamesArray = Array.from(newNames).sort((a, b) => a.localeCompare(b));
          const separator2 = model.getValueInRange(new Range2(item.range.startLineNumber, item.range.endColumn, item.range.endLineNumber, item.range.endColumn + 2));
          const useCommaSpace = separator2.includes(",");
          const delimiterText = useCommaSpace ? ", " : ",";
          const newNamesText = newNamesArray.map(
            (name) => quote === `'` || quote === '"' ? quote + name + quote : name
          ).join(delimiterText);
          const edit3 = { range: item.range, text: newNamesText };
          edits.push(edit3);
          if (item.range.containsRange(range2)) {
            result.push(this.createCodeAction(
              model,
              item.range,
              localize(13086, null, newNames.size),
              [asWorkspaceTextEdit(model, edit3)]
            ));
          }
        }
      }
    }
    if (edits.length && result.length === 0 || edits.length > 1) {
      result.push(
        this.createCodeAction(
          model,
          value2.range,
          localize(13095, null),
          edits.map((edit3) => asWorkspaceTextEdit(model, edit3))
        )
      );
    }
  }
};

PromptCodeActionProvider = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IMarkerService)
], PromptCodeActionProvider);

function asWorkspaceTextEdit(model, textEdit) {
  return {
    versionId: model.getVersionId(),
    resource: model.uri,
    textEdit
  };
}
export { asWorkspaceTextEdit, PromptCodeActionProvider };
