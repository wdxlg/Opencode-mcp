// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/widget/annotations.ts
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { isLocation } from "./module-0164.mjs";
import { appendMarkdownString, canMergeMarkdownStrings } from "./module-1193.mjs";
import { MarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/chat/common/widget/annotations.ts
var contentRefUrl = "http://_vscodecontentref_";

function annotateSpecialMarkdownContentWithSource(response) {
  let refIdPool = 0;
  const result = [];
  let sourceIndex = 0;
  for (const item of response) {
    const currentSourceIndex = sourceIndex++;
    const previousItemIndex = result.findLastIndex((p) => p.content.kind !== "textEditGroup" && p.content.kind !== "undoStop");
    const previousEntry = result[previousItemIndex];
    const previousItem = previousEntry?.content;
    if (item.kind === "inlineReference") {
      let label3 = item.name;
      if (!label3) {
        if (URI.isUri(item.inlineReference)) {
          label3 = basename2(item.inlineReference);
        } else if (isLocation(item.inlineReference)) {
          label3 = basename2(item.inlineReference.uri);
        } else {
          label3 = item.inlineReference.name;
        }
      }
      const previousText = previousItem?.kind === "markdownContent" ? previousItem.content.value : "";
      if (isInsideCodeContext(previousText)) {
        if (previousItem?.kind === "markdownContent") {
          const merged = appendMarkdownString(previousItem.content, new MarkdownString(label3));
          result[previousItemIndex] = {
            content: { ...previousItem, content: merged },
            sourceIndexes: [...previousEntry.sourceIndexes, currentSourceIndex]
          };
        } else {
          result.push({
            content: { content: new MarkdownString(label3), kind: "markdownContent" },
            sourceIndexes: [currentSourceIndex]
          });
        }
      } else {
        const refId = refIdPool++;
        const printUri = URI.parse(contentRefUrl).with({ path: String(refId) });
        const markdownText2 = `[${label3}](${printUri.toString()})`;
        const annotationMetadata = { [refId]: item };
        if (previousItem?.kind === "markdownContent") {
          const merged = appendMarkdownString(previousItem.content, new MarkdownString(markdownText2));
          result[previousItemIndex] = {
            content: { ...previousItem, content: merged, inlineReferences: { ...annotationMetadata, ...previousItem.inlineReferences || {} } },
            sourceIndexes: [...previousEntry.sourceIndexes, currentSourceIndex]
          };
        } else {
          result.push({
            content: { content: new MarkdownString(markdownText2), inlineReferences: annotationMetadata, kind: "markdownContent" },
            sourceIndexes: [currentSourceIndex]
          });
        }
      }
    } else if (item.kind === "markdownContent" && previousItem?.kind === "markdownContent") {
      if (canMergeMarkdownStrings(previousItem.content, item.content)) {
        const merged = appendMarkdownString(previousItem.content, item.content);
        result[previousItemIndex] = {
          content: { ...previousItem, content: merged },
          sourceIndexes: [...previousEntry.sourceIndexes, currentSourceIndex]
        };
      } else if (previousItem.inlineReferences && isContentRefOnly(previousItem.content.value)) {
        result[previousItemIndex] = {
          content: {
            ...previousItem,
            content: {
              ...item.content,
              value: previousItem.content.value + item.content.value
            }
          },
          sourceIndexes: [...previousEntry.sourceIndexes, currentSourceIndex]
        };
      } else {
        result.push({ content: item, sourceIndexes: [currentSourceIndex] });
      }
    } else if (item.kind === "markdownVuln") {
      const vulnText = encodeURIComponent(JSON.stringify(item.vulnerabilities));
      const markdownText2 = `<vscode_annotation details='${vulnText}'>${item.content.value}</vscode_annotation>`;
      if (previousItem?.kind === "markdownContent") {
        const merged = appendMarkdownString(previousItem.content, new MarkdownString(markdownText2));
        result[previousItemIndex] = {
          content: { ...previousItem, content: merged },
          sourceIndexes: [...previousEntry.sourceIndexes, currentSourceIndex]
        };
      } else {
        result.push({
          content: { content: new MarkdownString(markdownText2), kind: "markdownContent" },
          sourceIndexes: [currentSourceIndex]
        });
      }
    } else if (item.kind === "codeblockUri") {
      if (previousItem?.kind === "markdownContent") {
        const isEditText = item.isEdit ? ` isEdit` : "";
        const subAgentText = item.subAgentInvocationId ? ` subAgentInvocationId="${encodeURIComponent(item.subAgentInvocationId)}"` : "";
        const markdownText2 = `<vscode_codeblock_uri${isEditText}${subAgentText}>${item.uri.toString()}</vscode_codeblock_uri>`;
        const merged = appendMarkdownString(previousItem.content, new MarkdownString(markdownText2));
        result.splice(previousItemIndex, 1);
        result.push({
          content: { ...previousItem, content: merged },
          sourceIndexes: [...previousEntry.sourceIndexes, currentSourceIndex]
        });
      }
    } else if (item.kind === "voiceProgress") {
      continue;
    } else {
      result.push({ content: item, sourceIndexes: [currentSourceIndex] });
    }
  }
  return result;
}

function annotateSpecialMarkdownContent(response) {
  return annotateSpecialMarkdownContentWithSource(response).map((entry) => entry.content);
}

var contentRefPattern = new RegExp(`^(\\[.*?\\]\\(${contentRefUrl}/\\d+\\))+$`);

function isContentRefOnly(text2) {
  return contentRefPattern.test(text2);
}

function isInsideCodeContext(text2) {
  const lines = text2.split("\n");
  let inFencedBlock = false;
  let fenceChar = "";
  let fenceLength = 0;
  const unfencedLines = [];
  for (const line of lines) {
    const trimmed = line.trimStart();
    if (inFencedBlock) {
      const closeLength = countLeadingChar(trimmed, fenceChar);
      if (closeLength >= fenceLength && trimmed.substring(closeLength).trim() === "") {
        inFencedBlock = false;
        unfencedLines.length = 0;
      }
      continue;
    }
    const firstChar = trimmed[0];
    if (firstChar === "`" || firstChar === "~") {
      const openLength = countLeadingChar(trimmed, firstChar);
      if (openLength >= 3 && (firstChar === "~" || !trimmed.substring(openLength).includes("`"))) {
        inFencedBlock = true;
        fenceChar = firstChar;
        fenceLength = openLength;
        unfencedLines.length = 0;
        continue;
      }
    }
    unfencedLines.push(line);
  }
  return inFencedBlock || hasUnclosedInlineCode(unfencedLines.join("\n"));
}

function countLeadingChar(text2, char) {
  let count2 = 0;
  while (count2 < text2.length && text2[count2] === char) {
    count2++;
  }
  return count2;
}

function hasUnclosedInlineCode(text2) {
  let i2 = 0;
  while (i2 < text2.length) {
    if (text2[i2] !== "`") {
      i2++;
      continue;
    }
    const openLen = countLeadingChar(text2.substring(i2), "`");
    i2 += openLen;
    let found = false;
    while (i2 < text2.length) {
      if (text2[i2] !== "`") {
        i2++;
        continue;
      }
      const closeLen = countLeadingChar(text2.substring(i2), "`");
      i2 += closeLen;
      if (closeLen === openLen) {
        found = true;
        break;
      }
    }
    if (!found) {
      return true;
    }
  }
  return false;
}

function extractCodeblockUrisFromText(text2) {
  const match2 = /<vscode_codeblock_uri( isEdit)?( subAgentInvocationId="([^"]*)")?>([\s\S]*?)<\/vscode_codeblock_uri>/ms.exec(text2);
  if (match2) {
    const [all, isEdit, , encodedSubAgentId, uriString] = match2;
    if (uriString) {
      let result;
      try {
        result = URI.parse(uriString);
      } catch {
        return void 0;
      }
      const textWithoutResult = text2.substring(0, match2.index) + text2.substring(match2.index + all.length);
      let subAgentInvocationId;
      if (encodedSubAgentId) {
        try {
          subAgentInvocationId = decodeURIComponent(encodedSubAgentId);
        } catch {
          subAgentInvocationId = encodedSubAgentId;
        }
      }
      return { uri: result, textWithoutResult, isEdit: !!isEdit, subAgentInvocationId };
    }
  }
  return void 0;
}

function extractSubAgentInvocationIdFromText(text2) {
  const match2 = /<vscode_codeblock_uri[^>]* subAgentInvocationId="([^"]*)"/ms.exec(text2);
  if (match2) {
    try {
      return decodeURIComponent(match2[1]);
    } catch {
      return match2[1];
    }
  }
  return void 0;
}

function hasCodeblockUriTag(text2) {
  return text2.includes("<vscode_codeblock_uri");
}

function hasEditCodeblockUriTag(text2) {
  return text2.includes("<vscode_codeblock_uri isEdit");
}

function extractVulnerabilitiesFromText(text2) {
  const vulnerabilities = [];
  let newText = text2;
  let match2;
  while ((match2 = /<vscode_annotation details='(.*?)'>(.*?)<\/vscode_annotation>/ms.exec(newText)) !== null) {
    const [full, details, content] = match2;
    const start = match2.index;
    const textBefore = newText.substring(0, start);
    const linesBefore = textBefore.split("\n").length - 1;
    const linesInside = content.split("\n").length - 1;
    const previousNewlineIdx = textBefore.lastIndexOf("\n");
    const startColumn = start - (previousNewlineIdx + 1) + 1;
    const endPreviousNewlineIdx = (textBefore + content).lastIndexOf("\n");
    const endColumn = start + content.length - (endPreviousNewlineIdx + 1) + 1;
    try {
      const vulnDetails = JSON.parse(decodeURIComponent(details));
      vulnDetails.forEach(({ title, description }) => vulnerabilities.push({
        title,
        description,
        range: { startLineNumber: linesBefore + 1, startColumn, endLineNumber: linesBefore + linesInside + 1, endColumn }
      }));
    } catch (err) {
    }
    newText = newText.substring(0, start) + content + newText.substring(start + full.length);
  }
  return { newText, vulnerabilities };
}
export { annotateSpecialMarkdownContentWithSource, annotateSpecialMarkdownContent, isContentRefOnly, isInsideCodeContext, countLeadingChar, hasUnclosedInlineCode, extractCodeblockUrisFromText, extractSubAgentInvocationIdFromText, hasCodeblockUriTag, hasEditCodeblockUriTag, extractVulnerabilitiesFromText, contentRefUrl, contentRefPattern };
