// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentMergePrompt.ts



// src/vs/platform/agentHost/common/agentMergePrompt.ts
var stateOpenTag = "<agent_merge_state>";

var stateCloseTag = "</agent_merge_state>";

var actionsPrefix = "Authorized actions this run: ";

var feedbackSeparator = "---";

var quoteMarker = "> ";

var emptyQuotedLine = ">";

function unquoteLine(line) {
  if (line === emptyQuotedLine) {
    return "";
  }
  return line.startsWith(quoteMarker) ? line.slice(quoteMarker.length) : line;
}

function unquote(value2) {
  return value2.split("\n").map(unquoteLine).join("\n");
}

function isQuoted(value2) {
  return value2.split("\n").some((line) => line.startsWith(quoteMarker) || line === emptyQuotedLine);
}

var repairActionLabels = {
  addressReviews: "address review feedback",
  fixCI: "fix failed required CI checks",
  resolveConflicts: "resolve conflicts or update the behind branch"
};

var promptFields = [
  "Pull request:",
  "Title:",
  "Head:",
  "Base:",
  "Unresolved authorized review threads:",
  "Changes-requested reviews:",
  "New authorized comments:",
  "Failed required checks:",
  "Behind base:",
  "Conflicting:"
];

var authorPattern = /^(?<author>[A-Za-z0-9-_.]+(?:\[bot\])?): (?<body>[\s\S]*)$/;

var headPattern = /^(?<ref>.*?) \((?<sha>[^()]*)\)$/;

var filePattern = /^(?<path>.*?)(?::(?<line>\d+))?$/;

function parseAgentMergePrompt(text2) {
  if (!text2.includes(stateOpenTag)) {
    return void 0;
  }
  const lines = text2.split("\n");
  const openIndex = lines.findIndex((line) => line.trim() === stateOpenTag);
  if (openIndex === -1) {
    return void 0;
  }
  const closeIndex = lines.findIndex((line, index2) => index2 > openIndex && line.trim() === stateCloseTag);
  if (closeIndex === -1) {
    return void 0;
  }
  const stateLines = lines.slice(openIndex + 1, closeIndex);
  const actionsLine = stateLines.find((line) => line.startsWith(actionsPrefix));
  if (actionsLine === void 0) {
    return void 0;
  }
  const sections = readSections(stateLines);
  const head = headPattern.exec(sections.get("Head:")?.trim() ?? "")?.groups;
  return {
    actions: parseActions(actionsLine.slice(actionsPrefix.length)),
    pullRequestUrl: sections.get("Pull request:")?.trim() ?? "",
    title: sections.get("Title:")?.trim() ?? "",
    headRef: head?.ref ?? "",
    headSha: head?.sha ?? "",
    baseRef: sections.get("Base:")?.trim() ?? "",
    reviewThreads: parseReviewThreads(sections.get("Unresolved authorized review threads:")),
    reviewSummaries: parseFeedbackComments(sections.get("Changes-requested reviews:")),
    newComments: parseFeedbackComments(sections.get("New authorized comments:")),
    failedChecks: parseFailedChecks(sections.get("Failed required checks:")),
    behind: sections.get("Behind base:")?.trim() === "yes",
    conflicting: sections.get("Conflicting:")?.trim() === "yes",
    agentMessage: lines.slice(closeIndex + 1).join("\n").trim()
  };
}

function readSections(stateLines) {
  const starts = /* @__PURE__ */ new Map();
  let upperBound = stateLines.length;
  for (let i2 = promptFields.length - 1; i2 >= 0; i2--) {
    const field = promptFields[i2];
    for (let line = upperBound - 1; line >= 0; line--) {
      if (stateLines[line].startsWith(field)) {
        starts.set(field, line);
        upperBound = line;
        break;
      }
    }
  }
  const ordered = promptFields.filter((field) => starts.has(field));
  const sections = /* @__PURE__ */ new Map();
  for (let i2 = 0; i2 < ordered.length; i2++) {
    const field = ordered[i2];
    const start = starts.get(field);
    const end = i2 + 1 < ordered.length ? starts.get(ordered[i2 + 1]) : stateLines.length;
    const body = [stateLines[start].slice(field.length), ...stateLines.slice(start + 1, end)].join("\n");
    sections.set(field, body.replace(/^[^\S\n]+/, "").replace(/^\n+/, ""));
  }
  return sections;
}

function parseActions(value2) {
  const labels2 = new Set(value2.split(",").map((label3) => label3.trim()).filter(Boolean));
  const actions = Object.keys(repairActionLabels);
  return actions.filter((action) => labels2.has(repairActionLabels[action]));
}

function parseFailedChecks(value2) {
  const trimmed = value2?.trim();
  if (!trimmed || trimmed === "none") {
    return [];
  }
  if (isQuoted(trimmed)) {
    return trimmed.split("\n").map(unquoteLine).map((check) => check.trim()).filter(Boolean);
  }
  return trimmed.split(",").map((check) => check.trim()).filter(Boolean);
}

function parseReviewThreads(value2) {
  const trimmed = value2?.trim();
  if (!trimmed || trimmed === "none") {
    return [];
  }
  return splitOnSeparator(trimmed, (block2) => block2.startsWith("Thread ")).map(parseReviewThread).filter((thread) => !!thread);
}

function parseReviewThread(block2) {
  const lines = block2.split("\n");
  if (!lines[0]?.startsWith("Thread ")) {
    return void 0;
  }
  const id2 = lines[0].slice("Thread ".length).trim();
  let index2 = 1;
  let path;
  let line;
  if (lines[index2]?.startsWith("File: ")) {
    const match2 = filePattern.exec(lines[index2].slice("File: ".length).trim());
    path = match2?.groups?.path || void 0;
    const parsedLine = Number(match2?.groups?.line);
    line = Number.isSafeInteger(parsedLine) ? parsedLine : void 0;
    index2++;
  }
  if (lines[index2] === "Feedback:") {
    index2++;
  }
  const feedback = lines.slice(index2).join("\n").trim();
  return {
    id: id2,
    ...path !== void 0 ? { path } : {},
    ...line !== void 0 ? { line } : {},
    comments: feedback ? [parseFeedbackComment(feedback)] : []
  };
}

function parseFeedbackComments(value2) {
  const trimmed = value2?.trim();
  if (!trimmed || trimmed === "none") {
    return [];
  }
  const isEntryStart = (block2) => {
    const first2 = block2.split("\n")[0] ?? "";
    return first2.startsWith(quoteMarker) || first2 === emptyQuotedLine || authorPattern.test(first2);
  };
  return splitOnSeparator(trimmed, isEntryStart).map(parseFeedbackComment);
}

function parseFeedbackComment(block2) {
  const body = unquote(block2).trim();
  const match2 = authorPattern.exec(body);
  if (!match2?.groups) {
    return { body };
  }
  return { author: match2.groups.author, body: match2.groups.body.trim() };
}

function splitOnSeparator(value2, isBlockStart) {
  const blocks = [];
  for (const candidate of value2.split(`
${feedbackSeparator}
`)) {
    if (blocks.length === 0 || isBlockStart(candidate)) {
      blocks.push(candidate);
    } else {
      blocks[blocks.length - 1] += `
${feedbackSeparator}
${candidate}`;
    }
  }
  return blocks.map((block2) => block2.trim()).filter(Boolean);
}
export { unquoteLine, unquote, isQuoted, parseAgentMergePrompt, readSections, parseActions, parseFailedChecks, parseReviewThreads, parseReviewThread, parseFeedbackComments, parseFeedbackComment, splitOnSeparator, stateOpenTag, stateCloseTag, actionsPrefix, feedbackSeparator, quoteMarker, emptyQuotedLine, repairActionLabels, promptFields, authorPattern, headPattern, filePattern };
