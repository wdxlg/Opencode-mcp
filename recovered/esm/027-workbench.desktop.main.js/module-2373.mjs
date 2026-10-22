// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatClipboard.ts
import { $ } from "./module-0075.mjs";
import { appendEscapedMarkdownInlineCode, isPortableLinkTarget, isPortableMarkdownTarget } from "./module-0462.mjs";
import { markdownTokensToPlainText, rewriteMarkdownLinks } from "./module-2220.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatClipboard.ts
function getLinkTarget(element) {
  return (element.getAttribute("data-href") || element.getAttribute("href") || "").trim();
}

function replaceWithLabel(element, label3) {
  if (!label3.trim()) {
    element.remove();
    return;
  }
  const code = $("code");
  code.textContent = label3;
  element.replaceWith(code);
}

function sanitizeChatClipboardFragment(fragment) {
  let changed = false;
  for (const anchor of Array.from(fragment.querySelectorAll("a"))) {
    const target = getLinkTarget(anchor);
    if (isPortableLinkTarget(target)) {
      anchor.setAttribute("href", target);
      anchor.removeAttribute("data-href");
      continue;
    }
    replaceWithLabel(anchor, anchor.textContent ?? "");
    changed = true;
  }
  for (const image of Array.from(fragment.querySelectorAll("img"))) {
    if (!isPortableLinkTarget(image.getAttribute("src") ?? "")) {
      replaceWithLabel(image, image.getAttribute("alt") ?? "");
      changed = true;
    }
  }
  for (const element of Array.from(fragment.querySelectorAll("[data-href]"))) {
    element.removeAttribute("data-href");
  }
  return changed;
}

function overlapsCode(start, end, codeRanges) {
  return codeRanges.some((range2) => start < range2.end && end > range2.start);
}

function toPortableMarkdown(markdown) {
  return rewriteMarkdownLinks(markdown, {
    rewriteLink(token) {
      const target = token.href ?? "";
      if (!isPortableMarkdownTarget(target)) {
        const label3 = markdownTokensToPlainText(token.tokens ?? []).trim() || (token.text ?? "").trim();
        return label3 ? appendEscapedMarkdownInlineCode(label3) : "";
      }
      if (!token.raw.includes(target)) {
        const title = token.title ? ` "${token.title}"` : "";
        return `${token.type === "image" ? "!" : ""}[${token.text}](${target}${title})`;
      }
      return void 0;
    },
    additionalEdits(source, { codeRanges, definitionRanges, unlocatable }) {
      const edits = [];
      for (const token of unlocatable) {
        const target = token.href ?? "";
        if (isPortableMarkdownTarget(target)) {
          continue;
        }
        const needle = `](${target})`;
        for (let at = source.indexOf(needle); at >= 0; at = source.indexOf(needle, at + 1)) {
          if (!overlapsCode(at, at + needle.length, codeRanges)) {
            edits.push({ start: at, end: at + needle.length, replacement: "]()" });
          }
        }
      }
      edits.push(...definitionRanges.map((range2) => ({ ...range2, replacement: "" })));
      return edits;
    }
  });
}
export { getLinkTarget, replaceWithLabel, sanitizeChatClipboardFragment, overlapsCode, toPortableMarkdown };
