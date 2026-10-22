// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/findSectionHeaders.ts
import { isMultilineRegexSource } from "./module-0171.mjs";
import { regExpLeadsToEndlessLoop } from "./module-0030.mjs";


// src/vs/editor/common/services/findSectionHeaders.ts
var trimDashesRegex = /^-+|-+$/g;

var CHUNK_SIZE = 100;

var MAX_SECTION_LINES = 5;

function findSectionHeaders(model, options3) {
  let headers = [];
  if (options3.findRegionSectionHeaders && options3.foldingRules?.markers) {
    const regionHeaders = collectRegionHeaders(model, options3);
    headers = headers.concat(regionHeaders);
  }
  if (options3.findMarkSectionHeaders) {
    const markHeaders = collectMarkHeaders(model, options3);
    headers = headers.concat(markHeaders);
  }
  return headers;
}

function collectRegionHeaders(model, options3) {
  const regionHeaders = [];
  const endLineNumber = model.getLineCount();
  for (let lineNumber = 1; lineNumber <= endLineNumber; lineNumber++) {
    const lineContent = model.getLineContent(lineNumber);
    const match2 = lineContent.match(options3.foldingRules.markers.start);
    if (match2) {
      const range2 = { startLineNumber: lineNumber, startColumn: match2[0].length + 1, endLineNumber: lineNumber, endColumn: lineContent.length + 1 };
      if (range2.endColumn > range2.startColumn) {
        const sectionHeader = {
          range: range2,
          ...getHeaderText(lineContent.substring(match2[0].length)),
          shouldBeInComments: false
        };
        if (sectionHeader.text || sectionHeader.hasSeparatorLine) {
          regionHeaders.push(sectionHeader);
        }
      }
    }
  }
  return regionHeaders;
}

function collectMarkHeaders(model, options3) {
  const markHeaders = [];
  const endLineNumber = model.getLineCount();
  if (!options3.markSectionHeaderRegex || options3.markSectionHeaderRegex.trim() === "") {
    return markHeaders;
  }
  const multiline = isMultilineRegexSource(options3.markSectionHeaderRegex);
  const regex = new RegExp(options3.markSectionHeaderRegex, `gdm${multiline ? "s" : ""}`);
  if (regExpLeadsToEndlessLoop(regex)) {
    return markHeaders;
  }
  for (let startLine = 1; startLine <= endLineNumber; startLine += CHUNK_SIZE - MAX_SECTION_LINES) {
    const endLine = Math.min(startLine + CHUNK_SIZE - 1, endLineNumber);
    const lines = [];
    for (let i2 = startLine; i2 <= endLine; i2++) {
      lines.push(model.getLineContent(i2));
    }
    const text2 = lines.join("\n");
    regex.lastIndex = 0;
    let match2;
    while ((match2 = regex.exec(text2)) !== null) {
      const precedingText = text2.substring(0, match2.index);
      const lineOffset = (precedingText.match(/\n/g) || []).length;
      const lineNumber = startLine + lineOffset;
      const matchLines = match2[0].split("\n");
      const matchHeight = matchLines.length;
      const matchEndLine = lineNumber + matchHeight - 1;
      const lineStartIndex = precedingText.lastIndexOf("\n") + 1;
      const startColumn = match2.index - lineStartIndex + 1;
      const lastMatchLine = matchLines[matchLines.length - 1];
      const endColumn = matchHeight === 1 ? startColumn + match2[0].length : lastMatchLine.length + 1;
      const range2 = {
        startLineNumber: lineNumber,
        startColumn,
        endLineNumber: matchEndLine,
        endColumn
      };
      const text22 = (match2.groups ?? {})["label"] ?? "";
      const hasSeparatorLine = ((match2.groups ?? {})["separator"] ?? "") !== "";
      const sectionHeader = {
        range: range2,
        text: text22,
        hasSeparatorLine,
        shouldBeInComments: true
      };
      if (sectionHeader.text || sectionHeader.hasSeparatorLine) {
        if (markHeaders.length === 0 || markHeaders[markHeaders.length - 1].range.endLineNumber < sectionHeader.range.startLineNumber) {
          markHeaders.push(sectionHeader);
        }
      }
      regex.lastIndex = match2.index + match2[0].length;
    }
  }
  return markHeaders;
}

function getHeaderText(text2) {
  text2 = text2.trim();
  const hasSeparatorLine = text2.startsWith("-");
  text2 = text2.replace(trimDashesRegex, "");
  return { text: text2, hasSeparatorLine };
}
export { findSectionHeaders, collectRegionHeaders, collectMarkHeaders, getHeaderText, trimDashesRegex, CHUNK_SIZE, MAX_SECTION_LINES };
