// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/htmlToMarkdown.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { appendEscapedMarkdownInlineCode, isPortableMarkdownTarget } from "./module-0462.mjs";


// src/vs/base/browser/htmlToMarkdown.ts
var maxInputLength = 2e5;

var ttPolicy7 = createTrustedTypesPolicy("htmlToMarkdown", { createHTML: (value2) => value2 });

function convertHtmlToMarkdown(html3) {
  if (html3.length > maxInputLength) {
    return html3.replace(/<[^>]+>/g, "");
  }
  const trustedHtml = ttPolicy7?.createHTML(html3) ?? html3;
  const doc = new DOMParser().parseFromString(trustedHtml, "text/html");
  let result = convertChildren(doc.body);
  result = result.replace(/\u00A0/g, " ");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim();
}

function convertNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }
  const el = node;
  const tag2 = el.tagName.toLowerCase();
  switch (tag2) {
    case "h1":
      return `
# ${convertChildren(el).trim()}
`;
    case "h2":
      return `
## ${convertChildren(el).trim()}
`;
    case "h3":
      return `
### ${convertChildren(el).trim()}
`;
    case "h4":
      return `
#### ${convertChildren(el).trim()}
`;
    case "h5":
      return `
##### ${convertChildren(el).trim()}
`;
    case "h6":
      return `
###### ${convertChildren(el).trim()}
`;
    case "pre": {
      const codeEl = el.querySelector("code");
      const text2 = (codeEl ?? el).textContent ?? "";
      return `
\`\`\`
${text2.replace(/^\n+|\n+$/g, "")}
\`\`\`
`;
    }
    case "code":
      return appendEscapedMarkdownInlineCode(el.textContent ?? "");
    case "blockquote": {
      const inner = convertChildren(el).trim();
      const lines = inner.split("\n").map((l) => `> ${l.trim()}`);
      return `
${lines.join("\n")}
`;
    }
    case "ol": {
      let index2 = 0;
      let result = "\n";
      for (const child of el.children) {
        if (child.tagName.toLowerCase() === "li") {
          index2++;
          result += `${index2}. ${convertChildren(child).trim()}
`;
        }
      }
      return result;
    }
    case "ul": {
      let result = "\n";
      for (const child of el.children) {
        if (child.tagName.toLowerCase() === "li") {
          result += `- ${convertChildren(child).trim()}
`;
        }
      }
      return result;
    }
    case "li":
      return `- ${convertChildren(el).trim()}
`;
    case "p":
      return `${convertChildren(el)}

`;
    case "div":
      return `${convertChildren(el)}
`;
    case "br":
      return "\n";
    case "hr":
      return "\n---\n";
    case "a": {
      return sanitizeLink(linkTargetOf(el), convertChildren(el).trim(), (el.textContent ?? "").trim());
    }
    case "img": {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "";
      if (!isPortableMarkdownTarget(src)) {
        return alt ? appendEscapedMarkdownInlineCode(alt) : "";
      }
      return `![${alt}](${src})`;
    }
    case "strong":
    case "b":
      return `**${convertChildren(el)}**`;
    case "em":
    case "i":
      return `*${convertChildren(el)}*`;
    case "del":
    case "s":
    case "strike":
      return `~~${convertChildren(el)}~~`;
    default:
      return convertChildren(el);
  }
}

function convertChildren(node) {
  let result = "";
  for (const child of node.childNodes) {
    result += convertNode(child);
  }
  return result;
}

function linkTargetOf(el) {
  const href = (el.getAttribute("href") ?? "").trim();
  if (href && isPortableMarkdownTarget(href)) {
    return href;
  }
  return (el.getAttribute("data-href") ?? "").trim() || href;
}

function sanitizeLink(href, text2, plainText) {
  const target = href.trim();
  if (/^(javascript|vbscript|data):/i.test(target)) {
    return text2;
  }
  if (!target || !isPortableMarkdownTarget(target)) {
    return plainText ? appendEscapedMarkdownInlineCode(plainText) : "";
  }
  return `[${text2}](${target})`;
}
export { convertHtmlToMarkdown, convertNode, convertChildren, linkTargetOf, sanitizeLink, maxInputLength, ttPolicy7 };
