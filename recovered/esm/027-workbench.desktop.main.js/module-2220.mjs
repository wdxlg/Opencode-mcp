// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/markdownLinks.ts
import { lexer } from "./module-0464.mjs";


// src/vs/base/common/markdownLinks.ts
function isOpaque(token) {
  switch (token.type) {
    case "code":
    case "codespan":
    case "html":
    case "link":
    case "image":
    case "def":
      return true;
    default:
      return false;
  }
}

function childrenOf(token) {
  const candidate = token;
  if (candidate.items?.length) {
    return candidate.items;
  }
  if (candidate.header || candidate.rows) {
    const cells = [...candidate.header ?? [], ...(candidate.rows ?? []).flat()];
    return cells.flatMap((cell) => cell.tokens ?? []);
  }
  return candidate.tokens ?? [];
}

function markdownTokensToPlainText(tokens) {
  let text2 = "";
  for (const token of tokens) {
    const children = token.tokens;
    text2 += children?.length ? markdownTokensToPlainText(children) : token.text ?? token.raw ?? "";
  }
  return text2;
}

function collectEdits(tokens, markdown, cursor, rewriter, edits, codeRanges, unlocatable) {
  for (const token of tokens) {
    if (!isOpaque(token)) {
      const children = childrenOf(token);
      if (children.length) {
        cursor = collectEdits(children, markdown, cursor, rewriter, edits, codeRanges, unlocatable);
        continue;
      }
    }
    const raw = token.raw ?? "";
    if (!raw) {
      continue;
    }
    const start = markdown.indexOf(raw, cursor);
    if (start < 0) {
      if (token.type === "link" || token.type === "image") {
        unlocatable.push(token);
      }
      continue;
    }
    const end = start + raw.length;
    cursor = end;
    if (token.type === "code" || token.type === "codespan") {
      codeRanges.push({ start, end });
    } else if (token.type === "link" || token.type === "image") {
      const replacement = rewriter.rewriteLink(token);
      if (replacement !== void 0) {
        edits.push({ start, end, replacement });
      } else {
        collectEdits(childrenOf(token), markdown, start, rewriter, edits, codeRanges, unlocatable);
      }
    }
  }
  return cursor;
}

function findDefinitionRanges(tokens, markdown) {
  const ranges = [];
  let cursor = 0;
  for (const token of tokens) {
    const raw = token.raw ?? "";
    const start = raw ? markdown.indexOf(raw, cursor) : -1;
    if (start < 0) {
      return [];
    }
    if (start > cursor && markdown.substring(cursor, start).trim()) {
      ranges.push({ start: cursor, end: start });
    }
    cursor = start + raw.length;
  }
  if (markdown.substring(cursor).trim()) {
    ranges.push({ start: cursor, end: markdown.length });
  }
  return ranges;
}

function rewriteMarkdownLinks(markdown, rewriter) {
  let tokens;
  try {
    tokens = lexer(markdown);
  } catch {
    return markdown;
  }
  const edits = [];
  const codeRanges = [];
  const unlocatable = [];
  collectEdits(tokens, markdown, 0, rewriter, edits, codeRanges, unlocatable);
  edits.push(...rewriter.additionalEdits?.(markdown, {
    codeRanges,
    definitionRanges: findDefinitionRanges(tokens, markdown),
    unlocatable
  }) ?? []);
  if (!edits.length) {
    return markdown;
  }
  edits.sort((a, b) => a.start - b.start);
  let result = "";
  let position2 = 0;
  for (const edit3 of edits) {
    if (edit3.start < position2) {
      continue;
    }
    result += markdown.substring(position2, edit3.start) + edit3.replacement;
    position2 = edit3.end;
  }
  return result + markdown.substring(position2);
}
export { isOpaque, childrenOf, markdownTokensToPlainText, collectEdits, findDefinitionRanges, rewriteMarkdownLinks };
