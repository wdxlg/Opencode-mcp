// Allowlist classification of background-branch terminal commands (classifyBackgroundCommand),
// extracted verbatim from module-0177.mjs. Usage: node classify.test.cjs <module-0177.mjs>
const fs = require("fs"), path = require("path"), assert = require("assert");
const src = fs.readFileSync(process.argv[2], "utf8");
const start = src.indexOf("var BACKGROUND_COMMAND_APPROVAL_TIMEOUT_MS");
const end = src.indexOf("function settleBackgroundCommandApproval(");
assert.ok(start > 0 && end > start, "classifier block found");
const block = src.slice(start, end);
const M = new Function("PARALLEL_JOB_TTL_MS", "import_node_path_mm", block + "\nreturn { classifyBackgroundCommand, splitBackgroundCommand };")(1800000, { default: path });
let n = 0;
function check(impl, root, cwd, cases, expected) {
  for (const cmd of cases) {
    const v = M.classifyBackgroundCommand(cmd, cwd, root, impl);
    assert.equal(v.readOnly, expected, `${expected ? "should auto-allow" : "should need approval"}: ${cmd} (${v.reason})`);
    n += 1;
  }
}
const allowed = [
  "git status", "git status --short", "git diff", "git diff --stat HEAD~1", "git log --oneline -20", "git show HEAD",
  "git --no-pager log -5", "git rev-parse --short HEAD", "git ls-files", "git branch", "git branch -a", "git remote -v",
  "git --version", "ls", "ls -la src", "dir", "pwd", "cat package.json", "type git", "head -n 20 README.md", "tail -5 a.txt",
  "wc -l src/*.js", "grep -rn foo src", "rg -n 'createX' src", "findstr foo a.txt", "node --version", "node -v", "npm --version",
  "git status && git diff", "git log --oneline | head -5", "cat a.txt | grep -n x | wc -l", "ls; pwd", "echo hello",
  "find . -name '*.js'", "sort -n a.txt", "git diff -- ./src/../src/a.js", "ls ../", "grep \"a b\" ./src", "git log --pretty=format:%h"
];
const needApproval = [
  "npm install", "npm test", "node script.js", "node -e 1", "git commit -m x", "git checkout main", "git reset --hard",
  "git stash", "git clean -fd", "git branch new-branch", "git -C .. status", "git -c core.pager=sh log", "git push",
  "git diff --output=out.patch", "git diff --ext-diff", "git grep -Ovim foo", "git remote add x y", "rm -rf build",
  "echo hi > a.txt", "cat a >> b", "ls 2>/dev/null", "git log > log.txt", "cat < a.txt", "cat a.txt | tee b.txt",
  "git status && npm install", "ls; rm x", "git diff || rm x", "ls & rm x", "sleep 1 &", "echo $(rm x)", "echo `rm x`",
  "echo $HOME", "cat \"$FILE\"", "ls\nrm x", "cat /etc/passwd", "cat C:/Windows/win.ini", "cat C:\\\\Windows\\\\win.ini",
  "ls ../../", "cat ../../../secret.txt", "ls src/../../..", "cat ~/x", "ls -C~", "grep -f/etc/passwd x", "grep --file=/etc/passwd x",
  "find . -delete", "find . -exec rm {} ;", "rg --pre sh x", "sort -o out.txt a.txt", "sort --output=o a",
  "FOO=1 ls", "./run.sh", "bash -c ls", "python -c 1", "npx tsc --version", "cd .. && ls", "ls # comment",
  "(ls)", "ls |& cat", "", "   ", "cat 'unterminated", "git", "sed -i s/a/b/ x", "awk '{print}' x", "xargs rm", "uniq a b",
  "findstr /i foo a.txt", "x".repeat(2100)
];
for (const [impl, root, cwd] of [[path.win32, "E:\\wt\\branch-1", "E:\\wt\\branch-1\\src"], [path.posix, "/wt/branch-1", "/wt/branch-1/src"]]) {
  check(impl, root, cwd, allowed, true);
  check(impl, root, cwd, needApproval, false);
  // absolute paths inside the worktree stay allowed
  check(impl, root, cwd, [`cat ${impl === path.win32 ? "E:/wt/branch-1/a.txt" : "/wt/branch-1/a.txt"}`], true);
  // cwd outside the worktree always needs approval
  const outside = impl === path.win32 ? "E:\\other" : "/other";
  assert.equal(M.classifyBackgroundCommand("git status", outside, root, impl).readOnly, false, "cwd outside"); n += 1;
  // no root -> approval
  assert.equal(M.classifyBackgroundCommand("git status", cwd, "", impl).readOnly, false, "no root"); n += 1;
}
console.log(`classify tests passed (${n} cases)`);
