// Item 4 — review gate: a task can opt into its own git worktree + branch (review/<task>). When the work is done it
// is submitted as "pending review"; only an explicit approval merges it (never automatically, never on submit).
// Approval through the model-facing tool is refused unless review.allowToolApprove is set; the local channel
// (item 12, user side) can approve.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { statePath, readJson, writeJsonAtomic, safeName, nowIso } from "./core.mjs";

const reviewFile = (taskId) => statePath("reviews", `${safeName(taskId)}.json`);
export const loadReview = (taskId) => readJson(reviewFile(taskId), null);
const save = (r) => (writeJsonAtomic(reviewFile(r.task_id), r), r);
const git = (cwd, args) => execFileSync("git", ["-c", "core.pager=cat", ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 32 << 20 }).trim();
// Hosts without a global git identity: reuse the author of the reviewed branch head for the merge commit.
const identity = (repo, ref) => { try { git(repo, ["config", "user.email"]); return []; } catch { const [n, e] = git(repo, ["log", "-1", "--format=%an%x00%ae", ref]).split("\0"); return ["-c", `user.name=${n}`, "-c", `user.email=${e}`]; } };
const fail = (code, message) => { throw Object.assign(new Error(message), { code }); };
const need = (r, ...states) => { if (!r) fail("UNKNOWN_REVIEW", "该任务没有评审闸门记录（先 review_start）"); if (!states.includes(r.status)) fail("BAD_STATE", `当前状态 ${r.status}，需要 ${states.join("/")}`); return r; };
const hist = (r, event, extra = {}) => { r.history = [...(r.history ?? []), { at: nowIso(), event, ...extra }]; r.status = event === "start" ? "active" : r.status; return r; };

export function listReviews() {
  let names = [];
  try { names = fs.readdirSync(statePath("reviews")).filter((n) => n.endsWith(".json")); } catch { names = []; }
  return names.map((n) => readJson(statePath("reviews", n), null)).filter(Boolean);
}

export function startReview({ task_id, repo, base = "HEAD" }, config) {
  if (!config.review?.enabled) fail("DISABLED", "评审闸门默认关闭：在 multica.config.json 设 review.enabled=true 后可用");
  if (!task_id || !repo) fail("INVALID_ARGUMENT", "task_id 与 repo 必填");
  if (loadReview(task_id) && !["merged", "rejected", "abandoned"].includes(loadReview(task_id).status)) fail("EXISTS", "该任务已有进行中的评审闸门");
  const top = git(path.resolve(repo), ["rev-parse", "--show-toplevel"]);
  const baseCommit = git(top, ["rev-parse", base]);
  const branch = `review/${safeName(task_id)}`;
  const root = config.review.worktreeRoot ? path.resolve(config.review.worktreeRoot) : statePath("worktrees");
  const worktree = path.join(root, safeName(task_id));
  fs.mkdirSync(root, { recursive: true });
  git(top, ["worktree", "add", "-b", branch, worktree, baseCommit]);
  return save(hist({ task_id, repo: top, base, base_commit: baseCommit, branch, worktree, status: "active", createdAt: nowIso() }, "start"));
}

export function submitReview({ task_id, summary = "" }) {
  const r = need(loadReview(task_id), "active", "changes_requested");
  r.head_commit = git(r.repo, ["rev-parse", r.branch]);
  r.diffstat = git(r.repo, ["diff", "--stat", `${r.base_commit}..${r.branch}`]).split("\n").slice(-30).join("\n");
  r.commits = git(r.repo, ["log", "--oneline", `${r.base_commit}..${r.branch}`]).split("\n").filter(Boolean).slice(0, 50);
  r.summary = String(summary).slice(0, 4000);
  r.status = "pending_review";
  return save(hist(r, "submit", { head: r.head_commit }));
}

/** Merge only on explicit approval. via="channel" is the user-side path; via="tool" needs allowToolApprove. */
export function approveReview({ task_id, merge = true, note = "" }, config, via = "tool") {
  if (via === "tool" && !config.review?.allowToolApprove) fail("NEEDS_USER", "评审批准需用户本人操作：通过本机渠道（channels webhook，type=review_approve）批准，或用户在配置中显式开启 review.allowToolApprove");
  const r = need(loadReview(task_id), "pending_review");
  const head = git(r.repo, ["rev-parse", r.branch]);
  if (head !== r.head_commit) fail("CHANGED_AFTER_SUBMIT", "提交评审后分支又有新提交，请重新 review_submit");
  r.status = "approved";
  hist(r, "approve", { via, note: String(note).slice(0, 500) });
  if (merge) {
    const current = git(r.repo, ["rev-parse", "--abbrev-ref", "HEAD"]);
    try { git(r.repo, [...identity(r.repo, r.branch), "merge", "--no-ff", "--no-edit", "-m", `review: merge ${r.branch} (approved via ${via})`, r.branch]); }
    catch (e) { save(r); fail("MERGE_FAILED", `已批准但合并失败（未改动主分支，可手动合并）：${String(e.stderr || e.message).slice(0, 600)}`); }
    r.status = "merged"; r.merged_into = current; r.merge_commit = git(r.repo, ["rev-parse", "HEAD"]);
    hist(r, "merge", { into: current });
  }
  return save(r);
}
export function rejectReview({ task_id, reason = "" }, via = "tool") {
  const r = need(loadReview(task_id), "pending_review");
  r.status = "changes_requested";
  return save(hist(r, "request_changes", { via, reason: String(reason).slice(0, 1000) }));
}
export function cleanupReview({ task_id, delete_branch = false }) {
  const r = loadReview(task_id) ?? fail("UNKNOWN_REVIEW", "没有记录");
  if (fs.existsSync(r.worktree)) git(r.repo, ["worktree", "remove", "--force", r.worktree]);
  if (delete_branch && r.status === "merged") git(r.repo, ["branch", "-d", r.branch]);
  if (!["merged"].includes(r.status)) r.status = "abandoned";
  return save(hist(r, "cleanup", { delete_branch }));
}

export const reviewGateFeature = {
  id: "review",
  actions: {
    review_start: (a, c) => ({ review: startReview(a, c.config) }),
    review_submit: (a) => ({ review: submitReview(a) }),
    review_approve: (a, c) => ({ review: approveReview(a, c.config, c.via ?? "tool") }),
    review_reject: (a, c) => ({ review: rejectReview(a, c.via ?? "tool") }),
    review_cleanup: (a) => ({ review: cleanupReview(a) }),
    review_list: (a) => ({ reviews: listReviews().filter((r) => !a.status || r.status === a.status) })
  }
};
