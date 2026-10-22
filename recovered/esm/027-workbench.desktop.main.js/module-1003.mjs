// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/promptFileParser.ts
import { splitLinesIncludeSeparators } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { parse7 } from "./module-1002.mjs";
import { PositionOffsetTransformer } from "./module-0176.mjs";
import { Iterable } from "./module-0011.mjs";
import { URI } from "./module-0032.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/promptFileParser.ts
var PromptFileParser = class {
  constructor() {
  }
  parse(uri5, content2) {
    const linesWithEOL = splitLinesIncludeSeparators(content2);
    if (linesWithEOL.length === 0) {
      return new ParsedPromptFile(uri5, void 0, void 0);
    }
    let header2 = void 0;
    let body = void 0;
    let bodyStartLine = 0;
    if (linesWithEOL[0].match(/^---[\s\r\n]*$/)) {
      let headerEndLine = linesWithEOL.findIndex((line, index2) => index2 > 0 && line.match(/^---[\s\r\n]*$/));
      if (headerEndLine === -1) {
        headerEndLine = linesWithEOL.length;
        bodyStartLine = linesWithEOL.length;
      } else {
        bodyStartLine = headerEndLine + 1;
      }
      const range2 = new Range2(2, 1, headerEndLine + 1, 1);
      header2 = new PromptHeader(range2, uri5, linesWithEOL);
    }
    if (bodyStartLine < linesWithEOL.length) {
      const range2 = new Range2(bodyStartLine + 1, 1, linesWithEOL.length + 1, 1);
      body = new PromptBody(range2, linesWithEOL, uri5);
    }
    return new ParsedPromptFile(uri5, header2, body);
  }
};

var ParsedPromptFile = class {
  constructor(uri5, header2, body) {
    this.uri = uri5;
    this.header = header2;
    this.body = body;
  }
};

var PromptHeaderAttributes;

((PromptHeaderAttributes2) => {
  PromptHeaderAttributes2.name = "name";
  PromptHeaderAttributes2.description = "description";
  PromptHeaderAttributes2.agent = "agent";
  PromptHeaderAttributes2.mode = "mode";
  PromptHeaderAttributes2.model = "model";
  PromptHeaderAttributes2.reasoningEffort = "reasoning-effort";
  PromptHeaderAttributes2.applyTo = "applyTo";
  PromptHeaderAttributes2.paths = "paths";
  PromptHeaderAttributes2.tools = "tools";
  PromptHeaderAttributes2.handOffs = "handoffs";
  PromptHeaderAttributes2.advancedOptions = "advancedOptions";
  PromptHeaderAttributes2.argumentHint = "argument-hint";
  PromptHeaderAttributes2.excludeAgent = "excludeAgent";
  PromptHeaderAttributes2.target = "target";
  PromptHeaderAttributes2.infer = "infer";
  PromptHeaderAttributes2.license = "license";
  PromptHeaderAttributes2.compatibility = "compatibility";
  PromptHeaderAttributes2.metadata = "metadata";
  PromptHeaderAttributes2.agents = "agents";
  PromptHeaderAttributes2.userInvocable = "user-invocable";
  PromptHeaderAttributes2.disableModelInvocation = "disable-model-invocation";
  PromptHeaderAttributes2.hooks = "hooks";
  PromptHeaderAttributes2.context = "context";
})(PromptHeaderAttributes || (PromptHeaderAttributes = {}));

var PromptHeader = class {
  constructor(range2, uri5, linesWithEOL) {
    this.range = range2;
    this.uri = uri5;
    this.linesWithEOL = linesWithEOL;
  }
  get _parsedHeader() {
    if (this._parsed === void 0) {
      const yamlErrors = [];
      const headerContent = this.linesWithEOL.slice(this.range.startLineNumber - 1, this.range.endLineNumber - 1).join("");
      const node = parse7(headerContent, yamlErrors);
      const transformer = new PositionOffsetTransformer(headerContent);
      const asRange = ({ startOffset, endOffset }) => {
        const startPos = transformer.getPosition(startOffset), endPos = transformer.getPosition(endOffset);
        const headerDelta = this.range.startLineNumber - 1;
        return new Range2(startPos.lineNumber + headerDelta, startPos.column, endPos.lineNumber + headerDelta, endPos.column);
      };
      const asValue = (node2) => {
        switch (node2.type) {
          case "scalar":
            return { type: "scalar", value: node2.value, range: asRange(node2), format: node2.format };
          case "sequence":
            return { type: "sequence", items: node2.items.map((item) => asValue(item)), range: asRange(node2) };
          case "map": {
            const properties = node2.properties.map((property) => ({ key: asValue(property.key), value: asValue(property.value) }));
            return { type: "map", properties, range: asRange(node2) };
          }
        }
      };
      const attributes = [];
      const errors = yamlErrors.map((err) => ({ message: err.message, range: asRange(err), code: err.code }));
      if (node) {
        if (node.type !== "map") {
          errors.push({ message: "Invalid header, expecting <key: value> pairs", range: this.range, code: "INVALID_YAML" });
        } else {
          for (const property of node.properties) {
            attributes.push({
              key: property.key.value,
              range: asRange({ startOffset: property.key.startOffset, endOffset: property.value.endOffset }),
              value: asValue(property.value)
            });
          }
        }
      }
      this._parsed = { node, attributes, errors };
    }
    return this._parsed;
  }
  get attributes() {
    return this._parsedHeader.attributes;
  }
  getAttribute(key3) {
    return this._parsedHeader.attributes.find((attr) => attr.key === key3);
  }
  get errors() {
    return this._parsedHeader.errors;
  }
  getStringAttribute(key3) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key3);
    if (attribute?.value.type === "scalar") {
      return attribute.value.value;
    }
    return void 0;
  }
  get name() {
    return this.getStringAttribute(PromptHeaderAttributes.name);
  }
  get description() {
    return this.getStringAttribute(PromptHeaderAttributes.description);
  }
  get agent() {
    return this.getStringAttribute(PromptHeaderAttributes.agent) ?? this.getStringAttribute(PromptHeaderAttributes.mode);
  }
  get model() {
    return this.getStringOrStringArrayAttribute(PromptHeaderAttributes.model);
  }
  get applyTo() {
    return this.getStringAttribute(PromptHeaderAttributes.applyTo);
  }
  /**
   * Gets the 'paths' attribute from the header.
   * The `paths` field supports a list of glob patterns that scope the instruction
   * to specific files (used by Claude rules). Returns a string array or undefined.
   */
  get paths() {
    return this.getStringOrStringArrayAttribute(PromptHeaderAttributes.paths);
  }
  get argumentHint() {
    return this.getStringAttribute(PromptHeaderAttributes.argumentHint);
  }
  get target() {
    return this.getStringAttribute(PromptHeaderAttributes.target);
  }
  get infer() {
    return this.getBooleanAttribute(PromptHeaderAttributes.infer);
  }
  get tools() {
    const toolsAttribute = this._parsedHeader.attributes.find((attr) => attr.key === PromptHeaderAttributes.tools);
    if (!toolsAttribute) {
      return void 0;
    }
    let value2 = toolsAttribute.value;
    if (value2.type === "scalar") {
      value2 = parseCommaSeparatedList2(value2);
    }
    if (value2.type === "sequence") {
      const tools = [];
      for (const item of value2.items) {
        if (item.type === "scalar" && item.value) {
          tools.push(item.value);
        }
      }
      return tools;
    }
    return void 0;
  }
  get handOffs() {
    const handoffsAttribute = this._parsedHeader.attributes.find((attr) => attr.key === PromptHeaderAttributes.handOffs);
    if (!handoffsAttribute) {
      return void 0;
    }
    if (handoffsAttribute.value.type === "sequence") {
      const handoffs = [];
      for (const item of handoffsAttribute.value.items) {
        if (item.type === "map") {
          let agent;
          let label3;
          let prompt;
          let send;
          let showContinueOn;
          let model;
          for (const prop of item.properties) {
            if (prop.key.value === "agent" && prop.value.type === "scalar") {
              agent = prop.value.value;
            } else if (prop.key.value === "label" && prop.value.type === "scalar") {
              label3 = prop.value.value;
            } else if (prop.key.value === "prompt" && prop.value.type === "scalar") {
              prompt = prop.value.value;
            } else if (prop.key.value === "send" && prop.value.type === "scalar") {
              send = parseBoolean(prop.value);
            } else if (prop.key.value === "showContinueOn" && prop.value.type === "scalar") {
              showContinueOn = parseBoolean(prop.value);
            } else if (prop.key.value === "model" && prop.value.type === "scalar") {
              model = prop.value.value;
            }
          }
          if (agent && label3?.trim() && prompt !== void 0) {
            const handoff = {
              agent,
              label: label3,
              prompt,
              ...send !== void 0 ? { send } : {},
              ...showContinueOn !== void 0 ? { showContinueOn } : {},
              ...model !== void 0 ? { model } : {}
            };
            handoffs.push(handoff);
          }
        }
      }
      return handoffs;
    }
    return void 0;
  }
  getStringArrayAttribute(key3) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key3);
    if (!attribute) {
      return void 0;
    }
    if (attribute.value.type === "sequence") {
      const result = [];
      for (const item of attribute.value.items) {
        if (item.type === "scalar" && item.value) {
          result.push(item.value);
        }
      }
      return result;
    }
    return void 0;
  }
  getStringOrStringArrayAttribute(key3) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key3);
    if (!attribute) {
      return void 0;
    }
    if (attribute.value.type === "scalar") {
      return [attribute.value.value];
    }
    if (attribute.value.type === "sequence") {
      const result = [];
      for (const item of attribute.value.items) {
        if (item.type === "scalar") {
          result.push(item.value);
        }
      }
      return result;
    }
    return void 0;
  }
  get agents() {
    return this.getStringArrayAttribute(PromptHeaderAttributes.agents);
  }
  get userInvocable() {
    return this.getBooleanAttribute(PromptHeaderAttributes.userInvocable);
  }
  get disableModelInvocation() {
    return this.getBooleanAttribute(PromptHeaderAttributes.disableModelInvocation);
  }
  get context() {
    return this.getStringAttribute(PromptHeaderAttributes.context);
  }
  /**
   * Gets the raw 'hooks' attribute value from the header.
   * Returns the YAML map value if present, or undefined. The caller is
   * responsible for converting this to `ChatRequestHooks` via
   * {@link parseSubagentHooksFromYaml}.
   */
  get hooksRaw() {
    const attr = this._parsedHeader.attributes.find((a) => a.key === PromptHeaderAttributes.hooks);
    if (attr?.value.type === "map") {
      return attr.value;
    }
    return void 0;
  }
  getBooleanAttribute(key3) {
    const attribute = this._parsedHeader.attributes.find((attr) => attr.key === key3);
    if (attribute?.value.type === "scalar") {
      return parseBoolean(attribute.value);
    }
    return void 0;
  }
};

function parseBoolean(stringValue2) {
  if (stringValue2.value === "true") {
    return true;
  } else if (stringValue2.value === "false") {
    return false;
  }
  return void 0;
}

var PromptBody = class {
  constructor(range2, linesWithEOL, uri5) {
    this.range = range2;
    this.linesWithEOL = linesWithEOL;
    this.uri = uri5;
  }
  get fileReferences() {
    return this.getParsedBody().fileReferences;
  }
  get variableReferences() {
    return this.getParsedBody().variableReferences;
  }
  get offset() {
    return this.getParsedBody().bodyOffset;
  }
  getParsedBody() {
    if (this._parsed === void 0) {
      const markdownLinkRanges = [];
      const fileReferences = [];
      const variableReferences = [];
      const bodyOffset = Iterable.reduce(Iterable.slice(this.linesWithEOL, 0, this.range.startLineNumber - 1), (len, line) => line.length + len, 0);
      let inFencedCodeBlock = false;
      let fencedCodeBlockFenceChar;
      let fencedCodeBlockFenceLength = 0;
      for (let i2 = this.range.startLineNumber - 1, lineStartOffset = bodyOffset; i2 < this.range.endLineNumber - 1; i2++) {
        const line = this.linesWithEOL[i2];
        const trimmedLine = line.trimStart();
        const fenceMatch = /^(?<fence>(`{3,}|~{3,}))/u.exec(trimmedLine);
        if (fenceMatch) {
          const fence = fenceMatch.groups.fence;
          const fenceChar = fence[0];
          const fenceLength = fence.length;
          const restOfLine = trimmedLine.slice(fence.length);
          if (!inFencedCodeBlock) {
            inFencedCodeBlock = true;
            fencedCodeBlockFenceChar = fenceChar;
            fencedCodeBlockFenceLength = fenceLength;
            lineStartOffset += line.length;
            continue;
          }
          if (fencedCodeBlockFenceChar === fenceChar && fenceLength >= fencedCodeBlockFenceLength && /^\s*$/.test(restOfLine)) {
            inFencedCodeBlock = false;
            fencedCodeBlockFenceChar = void 0;
            fencedCodeBlockFenceLength = 0;
            lineStartOffset += line.length;
            continue;
          }
        }
        if (inFencedCodeBlock) {
          lineStartOffset += line.length;
          continue;
        }
        const inlineCodeRanges = [];
        for (const inlineMatch of line.matchAll(/`[^`]+`/g)) {
          inlineCodeRanges.push({ start: inlineMatch.index, end: inlineMatch.index + inlineMatch[0].length });
        }
        const isInsideInlineCode = (offset) => {
          return inlineCodeRanges.some((r2) => offset >= r2.start && offset < r2.end);
        };
        const linkMatch = line.matchAll(/\[(.*?)\]\((.+?)\)/g);
        for (const match2 of linkMatch) {
          if (match2.index > 0 && line[match2.index - 1] === "!") {
            continue;
          }
          if (isInsideInlineCode(match2.index)) {
            continue;
          }
          const linkEndOffset = match2.index + match2[0].length - 1;
          const linkStartOffset = match2.index + match2[0].length - match2[2].length - 1;
          const range2 = new Range2(i2 + 1, linkStartOffset + 1, i2 + 1, linkEndOffset + 1);
          fileReferences.push({ content: match2[2], range: range2, isMarkdownLink: true });
          markdownLinkRanges.push(new Range2(i2 + 1, match2.index + 1, i2 + 1, match2.index + match2[0].length + 1));
        }
        const reg3 = /#file:(?<filePath>[^\s#]+)|#tool:(?<toolName>[\w_\-\.\/]+)/gi;
        const matches2 = line.matchAll(reg3);
        for (const match2 of matches2) {
          const fullMatch = match2[0];
          const fullRange = new Range2(i2 + 1, match2.index + 1, i2 + 1, match2.index + fullMatch.length + 1);
          if (markdownLinkRanges.some((mdRange) => Range2.areIntersectingOrTouching(mdRange, fullRange))) {
            continue;
          }
          if (isInsideInlineCode(match2.index)) {
            continue;
          }
          const contentMatch = match2.groups?.["filePath"] || match2.groups?.["toolName"];
          if (!contentMatch) {
            continue;
          }
          const startOffset = match2.index + fullMatch.length - contentMatch.length;
          const endOffset = match2.index + fullMatch.length;
          const range2 = new Range2(i2 + 1, startOffset + 1, i2 + 1, endOffset + 1);
          if (match2.groups?.["filePath"]) {
            fileReferences.push({ content: match2.groups?.["filePath"], range: range2, isMarkdownLink: false });
          } else if (match2.groups?.["toolName"]) {
            variableReferences.push({ name: match2.groups?.["toolName"], range: range2, offset: lineStartOffset + match2.index, fullLength: fullMatch.length });
          }
        }
        lineStartOffset += line.length;
      }
      this._parsed = { fileReferences: fileReferences.sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range)), variableReferences, bodyOffset };
    }
    return this._parsed;
  }
  getContent() {
    return this.linesWithEOL.slice(this.range.startLineNumber - 1, this.range.endLineNumber - 1).join("");
  }
  resolveFilePath(path) {
    try {
      if (path.startsWith("/")) {
        return this.uri.with({ path });
      } else if (path.match(/^[a-zA-Z]+:\//)) {
        return URI.parse(path);
      } else {
        const dirName = dirname2(this.uri);
        return joinPath(dirName, path);
      }
    } catch {
      return void 0;
    }
  }
};

function parseCommaSeparatedList2(stringValue2) {
  const result = [];
  const input = stringValue2.value;
  const positionOffset = stringValue2.range.getStartPosition();
  let pos = 0;
  const isWhitespace3 = (char) => char === " " || char === "	";
  while (pos < input.length) {
    while (pos < input.length && isWhitespace3(input[pos])) {
      pos++;
    }
    if (pos >= input.length) {
      break;
    }
    const startPos = pos;
    let value2 = "";
    let endPos;
    let quoteStyle;
    const char = input[pos];
    if (char === '"' || char === `'`) {
      const quote = char;
      pos++;
      while (pos < input.length && input[pos] !== quote) {
        value2 += input[pos];
        pos++;
      }
      endPos = pos + 1;
      if (pos < input.length) {
        pos++;
      }
      quoteStyle = quote === '"' ? "double" : "single";
    } else {
      const startPos2 = pos;
      while (pos < input.length && input[pos] !== ",") {
        value2 += input[pos];
        pos++;
      }
      value2 = value2.trimEnd();
      endPos = startPos2 + value2.length;
      quoteStyle = "none";
    }
    result.push({ type: "scalar", value: value2, range: new Range2(positionOffset.lineNumber, positionOffset.column + startPos, positionOffset.lineNumber, positionOffset.column + endPos), format: quoteStyle });
    while (pos < input.length && isWhitespace3(input[pos])) {
      pos++;
    }
    if (pos < input.length && input[pos] === ",") {
      pos++;
    }
  }
  return { type: "sequence", items: result, range: stringValue2.range };
}

function evaluateApplyToPattern(header2, isClaudeRules) {
  if (isClaudeRules) {
    return header2?.paths?.join(", ") ?? "**";
  }
  return header2?.applyTo;
}
export { parseBoolean, parseCommaSeparatedList2, evaluateApplyToPattern, PromptFileParser, ParsedPromptFile, PromptHeaderAttributes, PromptHeader, PromptBody };
