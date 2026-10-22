// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptToolSetsCodeLensProvider.ts
import { Disposable } from "./module-0012.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { isITextModel } from "./module-0117.mjs";
import { Range2 } from "./module-0106.mjs";
import { isString } from "./module-0010.mjs";
import { findNodeAtLocation, parseTree } from "./module-0885.mjs";
import { localize } from "./module-0001.mjs";
import { showToolsPicker } from "./module-2177.mjs";
import { EditOperation } from "./module-0162.mjs";
import { getLeadingWhitespace } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerEditorFeature } from "./module-0574.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptToolSetsCodeLensProvider.ts
var ToolSetsCodeLensProvider = class extends Disposable {
  constructor(languageFeaturesService, languageModelToolsService, instantiationService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.languageModelToolsService = languageModelToolsService;
    this.instantiationService = instantiationService;
    // `_`-prefix marks this as private command
    this.cmdId = `_configureToolSetTools/${generateUuid()}`;
    this._register(this.languageFeaturesService.codeLensProvider.register({ language: "jsonc" }, this));
    this._register(CommandsRegistry.registerCommand(this.cmdId, (_accessor, ...args2) => {
      const modelArg = args2[0];
      const rangeArg = args2[1];
      const toolsArg = args2[2];
      if (isITextModel(modelArg) && Range2.isIRange(rangeArg) && Array.isArray(toolsArg) && toolsArg.every(isString)) {
        return this.updateTools(modelArg, Range2.lift(rangeArg), toolsArg);
      }
      return void 0;
    }));
  }
  provideCodeLenses(model, _token) {
    if (!model.uri.path.endsWith(".toolsets.jsonc")) {
      return void 0;
    }
    const root = parseTree(model.getValue());
    if (!root || root.type !== "object" || !root.children) {
      return void 0;
    }
    const lenses = [];
    for (const property of root.children) {
      if (property.type !== "property" || !property.children || property.children.length !== 2) {
        continue;
      }
      const [keyNode, valueNode] = property.children;
      if (valueNode.type !== "object") {
        continue;
      }
      const toolsNode = findNodeAtLocation(valueNode, ["tools"]);
      if (!toolsNode || toolsNode.type !== "array") {
        continue;
      }
      const selectedTools = (toolsNode.children ?? []).filter((item) => item.type === "string" && isString(item.value)).map((item) => item.value);
      const keyStart = model.getPositionAt(keyNode.offset);
      const valueRange = this.rangeFromNode(model, toolsNode);
      lenses.push({
        range: Range2.fromPositions(keyStart),
        command: {
          title: localize(11546, null),
          id: this.cmdId,
          arguments: [model, valueRange, selectedTools]
        }
      });
    }
    return { lenses };
  }
  rangeFromNode(model, node) {
    const start = model.getPositionAt(node.offset);
    const end = model.getPositionAt(node.offset + node.length);
    return Range2.fromPositions(start, end);
  }
  async updateTools(model, range2, selectedTools) {
    const getToolsEntries = () => this.languageModelToolsService.toToolAndToolSetEnablementMap(selectedTools, void 0);
    const newSelected = await this.instantiationService.invokeFunction(showToolsPicker, localize(11547, null), "toolSetCodeLens", void 0, getToolsEntries);
    if (!newSelected) {
      return;
    }
    const newNames = this.languageModelToolsService.toFullReferenceNames(newSelected);
    const newValue = this.formatToolsArray(model, range2, newNames);
    model.pushStackElement();
    model.pushEditOperations(null, [EditOperation.replaceMove(range2, newValue)], () => null);
    model.pushStackElement();
  }
  formatToolsArray(model, range2, toolNames) {
    if (toolNames.length === 0) {
      return "[]";
    }
    const { insertSpaces, indentSize } = model.getOptions();
    const oneIndent = insertSpaces ? " ".repeat(indentSize) : "	";
    const baseIndent = getLeadingWhitespace(model.getLineContent(range2.startLineNumber));
    const itemIndent = baseIndent + oneIndent;
    const items = toolNames.map((name) => `${itemIndent}${JSON.stringify(name)}`).join(",\n");
    return `[
${items}
${baseIndent}]`;
  }
};

ToolSetsCodeLensProvider = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IInstantiationService)
], ToolSetsCodeLensProvider);

registerEditorFeature(ToolSetsCodeLensProvider);
export { ToolSetsCodeLensProvider };
