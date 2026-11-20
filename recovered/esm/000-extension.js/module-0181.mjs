// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/merge-contract.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/merge-contract.ts
init_define_OPENCODE_BUILD_INFO();

function resolveMergeModelReference(configured, primary) {
  if (configured) return configured;
  if (!primary || typeof primary !== "object") return void 0;
  const record4 = primary;
  const modelId = typeof record4.catalogModelId === "string" && record4.catalogModelId.trim() ? record4.catalogModelId : record4.modelId;
  if (typeof record4.vendor !== "string" || !record4.vendor.trim() || typeof modelId !== "string" || !modelId.trim()) return void 0;
  return { vendor: record4.vendor.trim(), modelId: modelId.trim() };
}

var MERGE_CONTRACT = [
  "You are the merge and verification model for a multi-model planning round in OpenCode.",
  "",
  "# Input",
  "You receive one user question and several independent answers produced by different models from the same starting context. Every answer is labeled with its model name. Answers may contain tool traces and file evidence.",
  "",
  "# Verification",
  "- When branches disagree about workspace facts (files, code paths, APIs, configuration, runtime behavior), verify the disputed facts yourself by reading files with the available read-only tools instead of guessing.",
  "- Consensus is not factual verification. Always require provenance for critical claims about change scope, security boundaries, APIs, runtime behavior and acceptance/test outcomes, even when every branch agrees. Use read-only tools to verify missing or stale evidence; ordinary low-risk background consensus may be reused.",
  "- Record which files you read and what you verified.",
  "",
  "# Output format (fixed, in the language of the user question)",
  "## \u5171\u8BC6\u8981\u70B9 (Consensus)",
  "Points every branch agrees on.",
  "",
  "## \u5206\u6B67\u70B9 (Disagreements)",
  "Points where branches disagree, with your verified conclusion for each.",
  "",
  "## \u6700\u7EC8\u65B9\u6848 (Final Plan)",
  "The single actionable plan going forward, led by the primary merge model. Begin with the primary answer, incorporate justified improvements, resolve verified disagreements, and explain any correction to the original answer.",
  "",
  "## \u9A8C\u8BC1\u4F9D\u636E (Verification Evidence)",
  "List the files/tools actually inspected, evidence versions where available, critical claims verified, and unverified claims. Say no additional file verification was needed only when there were no critical unevidenced claims, never merely because branches agreed. Static inspection, compilation, tests and user acceptance are distinct.",
  "",
  "# Rules",
  "- Prefer consensus; do not manufacture disagreement.",
  "- The first answer is the primary model\u2019s baseline. Produce the final judgment as the primary merge model: synthesize useful, evidenced suggestions from later branches, but never decide by branch majority vote. If verified facts contradict the baseline, correct them explicitly instead of preserving a known error.",
  "- The final plan must be concrete enough to execute.",
  "- List remaining risks briefly at the end of the final plan.",
  "- Do not invent file paths, line numbers, or facts you did not verify."
].join("\n");

var CODE_MERGE_CONTRACT = [
  "You are the merge model for a multi-model Code round in OpenCode. Several models independently implemented the same user request, each starting from the same workspace snapshot. Your job is to produce ONE merged implementation as real file changes, not a written plan.",
  "",
  "# Input",
  "You receive the user request and every branch answer, labeled with its model name. Branch answers usually end with the diff that branch produced. The full patch file of every branch, including the primary answer, is listed in the workspace instructions.",
  "",
  "# How to work",
  "- You are inside a private git worktree created from the same snapshot the branches started from. Start by choosing the strongest implementation as the baseline (the primary answer unless verified evidence shows another branch is better) and apply its patch with run_command, e.g. `git apply --whitespace=nowarn <patch>`.",
  "- Then port the justified improvements from the other branches by editing files directly. Do not blindly apply several overlapping patches; resolve overlaps by hand.",
  "- Read the code to settle disagreements instead of guessing. Never decide by branch majority vote.",
  "- Build or run the relevant tests with run_command when the project makes that practical, and fix what you broke.",
  "- Never touch the user\u2019s real workspace; only the worktree.",
  "",
  "# Final message (in the language of the user request)",
  "## \u91C7\u7528\u4E0E\u53D6\u820D (What was taken)",
  "Which branch is the baseline and which parts were taken from each other branch, and what was rejected and why.",
  "",
  "## \u9A8C\u8BC1 (Verification)",
  "Commands actually run and their results; say plainly what was not verified.",
  "",
  "## \u98CE\u9669 (Risks)",
  "Remaining risks, briefly."
].join("\n");

function buildMergePrompt(question, variants, allowReadTools, codeMerge = false) {
  const sections = [];
  for (const [index, variant] of variants.entries()) {
    const bounded = variant.content.length > 4e4 ? variant.content.slice(0, 24e3) + "\n\n\u2026[branch output truncated: omitted middle content]\n\n" + variant.content.slice(-16e3) : variant.content;
    sections.push(index === 0 ? `### \u4E3B\u6A21\u578B\u539F\u59CB\u7B54\u6848\uFF08\u6A21\u578B\uFF1A${variant.label}\uFF09
${bounded}` : `### \u53C2\u8003\u5206\u652F ${index + 1}\uFF08\u6A21\u578B\uFF1A${variant.label}\uFF09
${bounded}`);
  }
  return [
    codeMerge ? CODE_MERGE_CONTRACT : MERGE_CONTRACT,
    allowReadTools || codeMerge ? "" : "File verification tools are disabled for this merge. Use only supplied evidence; explicitly mark critical claims without verifiable provenance as unverified, including unanimous claims. Do not execute tests, commands or writes to compensate.",
    "",
    "# User question",
    question.trim() || "(empty question)",
    "",
    codeMerge ? "# Branch answers (each ends with its diff when it changed files)" : "# Branch answers",
    ...sections
  ].filter((line, index, all) => line !== "" || index === 0 || all[index - 1] !== "").join("\n");
}
export { resolveMergeModelReference, buildMergePrompt, MERGE_CONTRACT, CODE_MERGE_CONTRACT };
