// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/policyDiagnosticsMarkdown.ts
import { appendEscapedMarkdownCodeBlockFence, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { escape } from "./module-0030.mjs";


// src/vs/workbench/browser/actions/policyDiagnosticsMarkdown.ts
function escapeMarkdownText(value2) {
  return escapeMarkdownSyntaxTokens(escape(value2));
}

function markdownText(value2) {
  return escapeMarkdownText(value2).replace(/\r?\n/g, " ");
}

function markdownTableCell(value2) {
  return escapeMarkdownText(value2).replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

function markdownTable(headers, rows) {
  for (const row of rows) {
    if (row.length !== headers.length) {
      throw new Error(`Markdown table row has ${row.length} cells; expected ${headers.length}.`);
    }
  }
  const lines = [
    `| ${headers.map(markdownTableCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownTableCell).join(" | ")} |`)
  ];
  return `${lines.join("\n")}

`;
}

function markdownJsonBlock(value2) {
  const serialized = JSON.stringify(value2 ?? {}, null, 2) ?? "null";
  return `${appendEscapedMarkdownCodeBlockFence(serialized, "json")}

`;
}

function markdownDetails(summary, content2) {
  const safeSummary = escape(summary).replace(/\r?\n/g, " ");
  return `<details>
<summary>${safeSummary}</summary>

${content2.trimEnd()}

</details>

`;
}
export { escapeMarkdownText, markdownText, markdownTableCell, markdownTable, markdownJsonBlock, markdownDetails };
