// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindContent.ts
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { isLocation } from "./module-0164.mjs";
import { canceledName } from "./module-0004.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindContent.ts
function inlineReferenceLabel(part) {
  const ref = part.inlineReference;
  if (URI.isUri(ref)) {
    return part.name || basename2(ref);
  }
  if (isLocation(ref)) {
    return part.name || basename2(ref.uri);
  }
  return ref.name;
}

function isErrorDetailsRendered(item) {
  const errorDetails = item.errorDetails;
  if (!errorDetails?.message || errorDetails.isQuotaExceeded || errorDetails.isRateLimited) {
    return false;
  }
  return item.model.response === item.model.entireResponse && !item.isCanceled && errorDetails.message !== canceledName;
}

var FIND_PLAINTEXT_OPTIONS = { omitMarkdownSyntax: true };

function withSourceEdgeWhitespace(source, text2) {
  const edge = (whitespace) => whitespace ? whitespace.includes("\n") ? "\n" : " " : "";
  return edge(/^\s+/.exec(source)?.[0]) + text2 + edge(/\s+$/.exec(source)?.[0]);
}

function getChatFindTextParts(item) {
  const parts = [];
  if (isErrorDetailsRendered(item)) {
    parts.push({ partIndex: -1, text: renderAsPlaintext(new MarkdownString(item.errorDetails.message), FIND_PLAINTEXT_OPTIONS) });
  }
  if (item.errorDetails?.responseIsFiltered) {
    return parts;
  }
  item.response.value.forEach((part, partIndex) => {
    switch (part.kind) {
      case "markdownContent": {
        const text2 = renderAsPlaintext(part.content, FIND_PLAINTEXT_OPTIONS);
        if (text2.trim()) {
          parts.push({ partIndex, text: withSourceEdgeWhitespace(part.content.value, text2) });
        }
        break;
      }
      case "inlineReference": {
        const label3 = inlineReferenceLabel(part);
        if (label3?.trim()) {
          parts.push({ partIndex, text: label3 });
        }
        break;
      }
      case "toolInvocation":
      case "toolInvocationSerialized": {
        break;
      }
      case "elicitation2":
      case "elicitationSerialized": {
        const title = isMarkdownString(part.title) ? renderAsPlaintext(part.title, FIND_PLAINTEXT_OPTIONS) : part.title;
        const message = isMarkdownString(part.message) ? renderAsPlaintext(part.message, FIND_PLAINTEXT_OPTIONS) : part.message;
        const text2 = [title, message].filter((value2) => typeof value2 === "string" && value2.trim()).join("\n");
        if (text2.trim()) {
          parts.push({ partIndex, text: text2 });
        }
        break;
      }
    }
  });
  return parts;
}
export { inlineReferenceLabel, isErrorDetailsRendered, withSourceEdgeWhitespace, getChatFindTextParts, FIND_PLAINTEXT_OPTIONS };
