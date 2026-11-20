// Stage ONLY this task's changes. module-0114.mjs also carries another dialogue's uncommitted hunks, so it is staged
// as "HEAD + our replacements" (stage-pairs.json) via hash-object/update-index; own new files are added by path.
// Usage: node tasks/<id>/stage.cjs [<commit-msg-file>]
const cp = require("child_process"), fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "../..");
const T = path.basename(__dirname);
const git = (args, input) => cp.execFileSync("git", ["-c", "core.pager=cat", ...args], { cwd: root, input, encoding: "utf8", maxBuffer: 64 << 20 });
const rel = "recovered/esm/000-extension.js/module-0114.mjs";
const head = git(["show", `HEAD:${rel}`]);
const eol = head.includes("\r\n") ? "\r\n" : "\n";
const wt = fs.readFileSync(path.join(root, rel), "utf8");
let out = head;
for (const [oldText, newText] of JSON.parse(fs.readFileSync(path.join(__dirname, "stage-pairs.json"), "utf8"))) {
  const o = oldText.replace(/\n/g, eol), n = newText.replace(/\n/g, eol);
  if (out.split(o).length !== 2) throw new Error(`hunk not unique in HEAD: ${oldText.slice(0, 80)}`);
  if (!wt.includes(n)) throw new Error(`hunk not present in worktree: ${newText.slice(0, 80)}`);
  out = out.replace(o, () => n);
}
const sha = git(["hash-object", "-w", "--stdin"], out).trim();
git(["update-index", "--cacheinfo", `100644,${sha},${rel}`]);
const own = ["scripts/test-cloudflare-reconnect.mjs", `tasks/${T}`, `.ai-workflow/logs/${T}.jsonl`, `.ai-workflow/index/${T}.json`].filter((p) => fs.existsSync(path.join(root, p)));
git(["add", "--", ...own]);
const staged = git(["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
const extra = staged.filter((f) => f !== rel && !own.some((o) => f === o || f.startsWith(o + "/")));
console.log(git(["diff", "--cached", "--stat"]));
if (extra.length) { console.log("UNEXPECTED STAGED:", extra.join(", ")); process.exit(3); }
const ident = () => { try { git(["config", "user.email"]); return []; } catch { const [n, e] = git(["log", "-1", "--format=%an%x00%ae"]).trim().split("\0"); return ["-c", `user.name=${n}`, "-c", `user.email=${e}`]; } };
if (process.argv[2]) { git([...ident(), "commit", "-q", "-F", process.argv[2]]); console.log("COMMITTED=" + git(["log", "-1", "--format=%h %s"]).trim()); }
