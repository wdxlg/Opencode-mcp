// cloud-agent-step01: 「发到云端运行」——把任务派给当前工作区 git remote 指向的 GitHub 仓库的
// GitHub Actions（.github/workflows/opencode-agent.yml），关机也能继续跑；结果推到分支
// opencode/agent-<run_id> 并开 draft PR（绝不自动合并），OpenCode 状态栏显示进度，完成后可查看 PR / 拉取分支。
// 通用：不绑定任何仓库；仓库来自 git remote（回退到设置 opencode.cloudAgent.repo 或输入框）。
// 模型密钥只放在 GitHub Secrets（默认 OPENCODE_API_KEY，设置 opencode.cloudAgent.secretName 可改），这里从不读取/记录。
// GitHub 鉴权沿用 opencode_github 的做法：vscode.authentication 的 github 会话（scopes: repo + workflow）。
// 纯函数（parseGitRemote / agentBranchName / buildDispatchRequest / parseRunStatus 等）导出给 scripts/test-cursor-parity.mjs。
import { __toESM } from "./module-0000.mjs";
var vscodeCA = __toESM(require("vscode"));
var fsCA = __toESM(require("node:fs"));
var pathCA = __toESM(require("node:path"));
var osCA = __toESM(require("node:os"));
var cpCA = __toESM(require("node:child_process"));

export const CLOUD_WORKFLOW_FILE = "opencode-agent.yml";
export const CLOUD_WORKFLOW_PATH = ".github/workflows/opencode-agent.yml";
export const CLOUD_RUNNER_PATH = ".github/opencode/cloud-agent-runner.mjs";
export const CLOUD_BRANCH_PREFIX = "opencode/agent-";
export const CLOUD_DEFAULT_SECRET = "OPENCODE_API_KEY";
export const CLOUD_GITHUB_SCOPES = ["repo", "workflow"];
// 与 scripts/opencode-agent.yml、scripts/cloud-agent-runner.mjs 保持一致（测试会比对）。
export const CLOUD_WORKFLOW_TEMPLATE = "# OpenCode cloud agent: installed by \"OpenCode：安装云端工作流\".\n# Dispatched by \"OpenCode：发到云端运行\"; runs on GitHub-hosted runners, so it keeps going with your PC off.\n# Model key: repository secret OPENCODE_API_KEY (or the name passed in input secret_name).\n# Optional: secret or variable OPENCODE_API_BASE (OpenAI-compatible base URL), variable OPENCODE_MODEL.\n# Results: branch opencode/agent-<run_id> + a DRAFT pull request (never merged automatically) + artifact with summary/logs.\nname: OpenCode Agent\nrun-name: \"opencode-agent ${{ inputs.run_id }}\"\n\non:\n  workflow_dispatch:\n    inputs:\n      task:\n        description: \"Task for the agent\"\n        required: true\n        type: string\n      base:\n        description: \"Base branch (empty = repository default branch)\"\n        required: false\n        type: string\n        default: \"\"\n      model:\n        description: \"Model id (empty = variable OPENCODE_MODEL or runner default)\"\n        required: false\n        type: string\n        default: \"\"\n      run_id:\n        description: \"Run id chosen by OpenCode (branch opencode/agent-<run_id>)\"\n        required: true\n        type: string\n      secret_name:\n        description: \"Name of the repository secret that holds the model API key\"\n        required: false\n        type: string\n        default: \"OPENCODE_API_KEY\"\n\npermissions:\n  contents: write\n  pull-requests: write\n\nconcurrency:\n  group: opencode-agent-${{ inputs.run_id }}\n  cancel-in-progress: false\n\njobs:\n  agent:\n    runs-on: ubuntu-latest\n    timeout-minutes: 60\n    env:\n      RUN_ID: ${{ inputs.run_id }}\n      BASE_BRANCH: ${{ inputs.base || github.event.repository.default_branch }}\n    steps:\n      - name: Validate inputs\n        env:\n          TASK: ${{ inputs.task }}\n        run: |\n          if ! printf '%s' \"$RUN_ID\" | grep -Eq '^[A-Za-z0-9._-]{1,64}$'; then echo \"invalid run_id\"; exit 1; fi\n          if [ -z \"$TASK\" ]; then echo \"empty task\"; exit 1; fi\n          echo \"OPENCODE_OUT_DIR=$RUNNER_TEMP/opencode-cloud\" >> \"$GITHUB_ENV\"\n          mkdir -p \"$RUNNER_TEMP/opencode-cloud\"\n\n      - name: Checkout base\n        uses: actions/checkout@v4\n        with:\n          ref: ${{ inputs.base || github.event.repository.default_branch }}\n          fetch-depth: 0\n\n      - name: Setup Node\n        uses: actions/setup-node@v4\n        with:\n          node-version: 20\n\n      - name: Run OpenCode agent\n        id: agent\n        continue-on-error: true\n        timeout-minutes: 50\n        env:\n          OPENCODE_TASK: ${{ inputs.task }}\n          OPENCODE_API_KEY: ${{ secrets[inputs.secret_name || 'OPENCODE_API_KEY'] }}\n          OPENCODE_API_BASE: ${{ secrets.OPENCODE_API_BASE || vars.OPENCODE_API_BASE }}\n          OPENCODE_MODEL: ${{ inputs.model || vars.OPENCODE_MODEL }}\n          OPENCODE_MAX_STEPS: ${{ vars.OPENCODE_MAX_STEPS || '40' }}\n          OPENCODE_MAX_MINUTES: ${{ vars.OPENCODE_MAX_MINUTES || '45' }}\n        run: |\n          # The runner lives in the repo (.github/opencode/cloud-agent-runner.mjs); copy it out so the agent cannot change the code that is running.\n          cp .github/opencode/cloud-agent-runner.mjs \"$RUNNER_TEMP/cloud-agent-runner.mjs\"\n          # exit 2 = step/runtime limit reached: keep the partial work, do not fail the job.\n          node \"$RUNNER_TEMP/cloud-agent-runner.mjs\" || { code=$?; if [ \"$code\" = \"2\" ]; then echo \"::warning::Agent stopped at its step/runtime limit; partial result kept.\"; else exit \"$code\"; fi; }\n\n      - name: Run tests (non-fatal)\n        continue-on-error: true\n        timeout-minutes: 15\n        run: |\n          if [ -f package.json ] && node -e \"process.exit(require('./package.json').scripts?.test ? 0 : 1)\"; then\n            ( [ -f package-lock.json ] && npm ci || npm install ) > \"$OPENCODE_OUT_DIR/install.log\" 2>&1 || true\n            npm test 2>&1 | tee \"$OPENCODE_OUT_DIR/tests.log\"\n            echo \"tests_exit=${PIPESTATUS[0]}\" >> \"$GITHUB_OUTPUT\"\n          else\n            echo \"No package.json test script found; skipping tests.\" | tee \"$OPENCODE_OUT_DIR/tests.log\"\n          fi\n\n      - name: Push branch and open draft PR\n        id: pr\n        env:\n          GH_TOKEN: ${{ github.token }}\n          TASK: ${{ inputs.task }}\n          AGENT_OUTCOME: ${{ steps.agent.outcome }}\n        run: |\n          BRANCH=\"opencode/agent-$RUN_ID\"\n          git config user.name \"opencode-agent[bot]\"\n          git config user.email \"opencode-agent@users.noreply.github.com\"\n          git checkout -B \"$BRANCH\"\n          git add -A\n          # GITHUB_TOKEN cannot push workflow changes; never include them.\n          git reset -q -- .github/workflows .opencode-cloud 2>/dev/null || true\n          if git diff --cached --quiet; then\n            echo \"The agent made no changes; nothing to push.\"\n            echo \"changed=false\" >> \"$GITHUB_OUTPUT\"\n            exit 0\n          fi\n          TITLE=\"$(printf '%s' \"$TASK\" | tr '\\r\\n' '  ' | cut -c1-72)\"\n          git commit -q -m \"opencode agent: $TITLE\" -m \"Run id: $RUN_ID\"\n          git push --force-with-lease origin \"HEAD:refs/heads/$BRANCH\"\n          echo \"changed=true\" >> \"$GITHUB_OUTPUT\"\n          BODY=\"$OPENCODE_OUT_DIR/pr-body.md\"\n          if [ -f \"$OPENCODE_OUT_DIR/summary.md\" ]; then cat \"$OPENCODE_OUT_DIR/summary.md\" > \"$BODY\"; else echo \"Agent summary missing (agent step: $AGENT_OUTCOME).\" > \"$BODY\"; fi\n          printf '\\n---\\nOpened by OpenCode cloud agent, run `%s`, [workflow run](%s/%s/actions/runs/%s). Draft: review before merging.\\n' \"$RUN_ID\" \"$GITHUB_SERVER_URL\" \"$GITHUB_REPOSITORY\" \"$GITHUB_RUN_ID\" >> \"$BODY\"\n          if gh pr create --draft --base \"$BASE_BRANCH\" --head \"$BRANCH\" --title \"[OpenCode] $TITLE\" --body-file \"$BODY\"; then\n            echo \"pr=created\" >> \"$GITHUB_OUTPUT\"\n          else\n            echo \"::warning::Could not open the pull request. Enable Settings > Actions > General > 'Allow GitHub Actions to create and approve pull requests', or open it manually from branch $BRANCH.\"\n          fi\n\n      - name: Upload summary and logs\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: opencode-agent-${{ inputs.run_id }}\n          path: ${{ runner.temp }}/opencode-cloud\n          if-no-files-found: warn\n          retention-days: 14\n\n      - name: Fail when the agent failed\n        if: steps.agent.outcome == 'failure'\n        run: |\n          echo \"The agent step failed; see summary.md in the artifact.\"\n          exit 1\n";
export const CLOUD_RUNNER_SOURCE = "#!/usr/bin/env node\n// OpenCode cloud agent runner (headless, dependency-free, Node 20+).\n// Runs inside GitHub Actions (or any shell): an OpenAI-compatible chat-completions\n// tool-calling loop over the checked-out repository.\n//\n// Environment:\n//   OPENCODE_TASK          task text (required)\n//   OPENCODE_API_KEY       model API key (required; never printed, never passed to run_command)\n//   OPENCODE_API_BASE      OpenAI-compatible base URL (default https://api.openai.com/v1)\n//   OPENCODE_MODEL         model id (default gpt-4o)\n//   OPENCODE_MAX_STEPS     max model turns (default 40)\n//   OPENCODE_MAX_MINUTES   max wall-clock minutes (default 45)\n//   OPENCODE_OUT_DIR       where summary.md / agent-log.jsonl go (default $RUNNER_TEMP/opencode-cloud or ./.opencode-cloud)\n//   OPENCODE_WORKDIR       repository root (default cwd)\n// Exit code: 0 when the model finished, 2 when a limit was hit, 1 on fatal error.\nimport fs from \"node:fs\";\nimport path from \"node:path\";\nimport { spawnSync } from \"node:child_process\";\nimport { fileURLToPath } from \"node:url\";\n\nconst env = process.env;\nconst ROOT = path.resolve(env.OPENCODE_WORKDIR || process.cwd());\nconst OUT = path.resolve(env.OPENCODE_OUT_DIR || (env.RUNNER_TEMP ? path.join(env.RUNNER_TEMP, \"opencode-cloud\") : path.join(ROOT, \".opencode-cloud\")));\nconst API_KEY = String(env.OPENCODE_API_KEY || \"\");\nconst API_BASE = String(env.OPENCODE_API_BASE || \"https://api.openai.com/v1\").replace(/\\/+$/, \"\");\nconst MODEL = String(env.OPENCODE_MODEL || \"gpt-4o\");\nconst TASK = String(env.OPENCODE_TASK || \"\").trim();\nconst MAX_STEPS = Math.max(1, Number(env.OPENCODE_MAX_STEPS) || 40);\nconst MAX_MS = Math.max(1, Number(env.OPENCODE_MAX_MINUTES) || 45) * 60 * 1000;\nconst STARTED = Date.now();\nconst SKIP_DIRS = new Set([\".git\", \"node_modules\", \".opencode-cloud\", \"dist\", \"build\", \"out\", \".next\", \"target\", \"__pycache__\", \".venv\", \"venv\"]);\nconst MAX_RESULT = 20000;\n\nfs.mkdirSync(OUT, { recursive: true });\nconst logFile = path.join(OUT, \"agent-log.jsonl\");\n\nfunction redact(text) {\n  let s = String(text ?? \"\");\n  if (API_KEY && API_KEY.length >= 4) s = s.split(API_KEY).join(\"***\");\n  return s;\n}\nfunction log(event) {\n  const line = redact(JSON.stringify({ t: new Date().toISOString(), ...event }));\n  fs.appendFileSync(logFile, line + \"\\n\");\n}\nfunction say(msg) { process.stdout.write(redact(msg) + \"\\n\"); }\nfunction clip(s, n = MAX_RESULT) { s = String(s ?? \"\"); return s.length > n ? s.slice(0, n) + `\\n…[truncated ${s.length - n} chars]` : s; }\nfunction remainingMs() { return MAX_MS - (Date.now() - STARTED); }\n\nfunction resolveInRepo(p) {\n  const abs = path.resolve(ROOT, String(p || \".\"));\n  const rel = path.relative(ROOT, abs);\n  if (rel.startsWith(\"..\") || path.isAbsolute(rel)) throw new Error(`path outside repository: ${p}`);\n  return { abs, rel: rel.split(path.sep).join(\"/\") };\n}\n\nfunction* walk(dir, depth, maxDepth) {\n  let entries = [];\n  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }\n  entries.sort((a, b) => a.name.localeCompare(b.name));\n  for (const e of entries) {\n    const full = path.join(dir, e.name);\n    if (e.isDirectory()) {\n      if (SKIP_DIRS.has(e.name)) continue;\n      yield { full, dir: true };\n      if (depth < maxDepth) yield* walk(full, depth + 1, maxDepth);\n    } else if (e.isFile()) yield { full, dir: false };\n  }\n}\n\nconst TOOLS = [\n  { type: \"function\", function: { name: \"read_file\", description: \"Read a text file from the repository. Optional 1-based start_line/end_line.\", parameters: { type: \"object\", properties: { path: { type: \"string\" }, start_line: { type: \"integer\" }, end_line: { type: \"integer\" } }, required: [\"path\"] } } },\n  { type: \"function\", function: { name: \"write_file\", description: \"Create or overwrite a file in the repository with the full new content.\", parameters: { type: \"object\", properties: { path: { type: \"string\" }, content: { type: \"string\" } }, required: [\"path\", \"content\"] } } },\n  { type: \"function\", function: { name: \"list_files\", description: \"List files and folders under a directory (default repository root).\", parameters: { type: \"object\", properties: { path: { type: \"string\" }, max_depth: { type: \"integer\" } } } } },\n  { type: \"function\", function: { name: \"search\", description: \"Search file contents (like grep). pattern is a JavaScript regular expression unless literal=true.\", parameters: { type: \"object\", properties: { pattern: { type: \"string\" }, path: { type: \"string\" }, literal: { type: \"boolean\" }, max_results: { type: \"integer\" } }, required: [\"pattern\"] } } },\n  { type: \"function\", function: { name: \"run_command\", description: \"Run a shell command (bash) in the repository root, e.g. install, build or test. Returns exit code and output.\", parameters: { type: \"object\", properties: { command: { type: \"string\" }, timeout_seconds: { type: \"integer\" } }, required: [\"command\"] } } }\n];\n\nconst commandsRun = [];\nconst filesWritten = new Set();\n\nfunction toolReadFile(a) {\n  const { abs, rel } = resolveInRepo(a.path);\n  const text = fs.readFileSync(abs, \"utf8\");\n  const lines = text.split(/\\r?\\n/);\n  const s = Math.max(1, Number(a.start_line) || 1), e = Math.min(lines.length, Number(a.end_line) || lines.length);\n  return `${rel} (lines ${s}-${e} of ${lines.length})\\n` + lines.slice(s - 1, e).map((l, i) => `${s + i}: ${l}`).join(\"\\n\");\n}\nfunction toolWriteFile(a) {\n  const { abs, rel } = resolveInRepo(a.path);\n  if (rel === \".git\" || rel.startsWith(\".git/\")) throw new Error(\"writing inside .git is not allowed\");\n  fs.mkdirSync(path.dirname(abs), { recursive: true });\n  fs.writeFileSync(abs, String(a.content ?? \"\"));\n  filesWritten.add(rel);\n  return `wrote ${rel} (${Buffer.byteLength(String(a.content ?? \"\"))} bytes)`;\n}\nfunction toolListFiles(a) {\n  const { abs } = resolveInRepo(a.path || \".\");\n  const out = [];\n  for (const it of walk(abs, 0, Math.min(6, Math.max(0, Number(a.max_depth ?? 2))))) {\n    out.push(path.relative(ROOT, it.full).split(path.sep).join(\"/\") + (it.dir ? \"/\" : \"\"));\n    if (out.length >= 500) { out.push(\"…(truncated at 500 entries)\"); break; }\n  }\n  return out.join(\"\\n\") || \"(empty)\";\n}\nfunction toolSearch(a) {\n  const { abs } = resolveInRepo(a.path || \".\");\n  const max = Math.min(300, Math.max(1, Number(a.max_results) || 100));\n  const src = String(a.pattern || \"\");\n  const re = a.literal ? new RegExp(src.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\")) : new RegExp(src);\n  const hits = [];\n  const files = fs.statSync(abs).isFile() ? [{ full: abs, dir: false }] : walk(abs, 0, 50);\n  for (const it of files) {\n    if (it.dir) continue;\n    let st; try { st = fs.statSync(it.full); } catch { continue; }\n    if (st.size > 1024 * 1024) continue;\n    let text; try { text = fs.readFileSync(it.full, \"utf8\"); } catch { continue; }\n    if (text.includes(\"\\u0000\")) continue;\n    const lines = text.split(/\\r?\\n/);\n    for (let i = 0; i < lines.length; i++) {\n      if (re.test(lines[i])) {\n        hits.push(`${path.relative(ROOT, it.full).split(path.sep).join(\"/\")}:${i + 1}: ${lines[i].slice(0, 300)}`);\n        if (hits.length >= max) return hits.join(\"\\n\") + \"\\n…(max results reached)\";\n      }\n    }\n  }\n  return hits.join(\"\\n\") || \"(no matches)\";\n}\nfunction toolRunCommand(a) {\n  const command = String(a.command || \"\");\n  if (!command.trim()) throw new Error(\"empty command\");\n  const timeout = Math.max(1000, Math.min((Number(a.timeout_seconds) || 600) * 1000, remainingMs() - 5000));\n  const childEnv = { ...env };\n  for (const k of Object.keys(childEnv)) if (/^OPENCODE_API_KEY$|^OPENCODE_API_BASE$|TOKEN|SECRET|PASSWORD/i.test(k)) delete childEnv[k];\n  const r = spawnSync(\"bash\", [\"-lc\", command], { cwd: ROOT, env: childEnv, encoding: \"utf8\", timeout, maxBuffer: 32 * 1024 * 1024 });\n  commandsRun.push({ command, exit: r.status, timedOut: r.error?.code === \"ETIMEDOUT\" });\n  const out = `${r.stdout || \"\"}${r.stderr ? `\\n[stderr]\\n${r.stderr}` : \"\"}`;\n  return `exit_code: ${r.status ?? \"null\"}${r.error ? ` (${r.error.code || r.error.message})` : \"\"}\\n${clip(out, 12000)}`;\n}\nconst HANDLERS = { read_file: toolReadFile, write_file: toolWriteFile, list_files: toolListFiles, search: toolSearch, run_command: toolRunCommand };\n\nexport function runTool(name, args) {\n  const h = HANDLERS[name];\n  if (!h) return `error: unknown tool ${name}`;\n  try { return clip(h(args || {})); } catch (e) { return `error: ${e?.message || e}`; }\n}\n\nasync function chat(messages) {\n  let lastErr;\n  for (let attempt = 0; attempt < 4; attempt++) {\n    const left = remainingMs();\n    if (left <= 5000) throw new Error(\"runtime limit reached\");\n    try {\n      const r = await fetch(`${API_BASE}/chat/completions`, {\n        method: \"POST\",\n        headers: { \"Content-Type\": \"application/json\", Authorization: `Bearer ${API_KEY}` },\n        body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, tool_choice: \"auto\" }),\n        signal: AbortSignal.timeout(Math.min(240000, left))\n      });\n      const txt = await r.text();\n      if (r.ok) return JSON.parse(txt);\n      lastErr = new Error(`model API ${r.status}: ${redact(txt).slice(0, 400)}`);\n      if (r.status !== 429 && r.status < 500) throw lastErr;\n    } catch (e) {\n      lastErr = e;\n      if (/model API 4\\d\\d/.test(String(e?.message)) && !/model API 429/.test(String(e?.message))) throw e;\n    }\n    await new Promise((res) => setTimeout(res, 2000 * 2 ** attempt));\n  }\n  throw lastErr;\n}\n\nfunction gitStatus() {\n  const r = spawnSync(\"git\", [\"status\", \"--porcelain\"], { cwd: ROOT, encoding: \"utf8\" });\n  return (r.stdout || \"\").trim();\n}\n\nfunction writeSummary({ stop, steps, finalText, error }) {\n  const changed = gitStatus();\n  const md = [\n    `# OpenCode cloud agent`,\n    ``,\n    `**Task:**`,\n    ``,\n    TASK.split(\"\\n\").map((l) => `> ${l}`).join(\"\\n\"),\n    ``,\n    `- Model: \\`${MODEL}\\``,\n    `- Steps: ${steps} / ${MAX_STEPS}`,\n    `- Duration: ${Math.round((Date.now() - STARTED) / 1000)}s (limit ${Math.round(MAX_MS / 60000)} min)`,\n    `- Stop reason: ${stop}`,\n    error ? `- Error: ${redact(error).slice(0, 500)}` : null,\n    ``,\n    `## Result`,\n    ``,\n    finalText ? redact(finalText) : \"_(no final message)_\",\n    ``,\n    `## Changed files`,\n    ``,\n    changed ? \"```\\n\" + changed + \"\\n```\" : \"_(none)_\",\n    ``,\n    `## Commands run`,\n    ``,\n    commandsRun.length ? commandsRun.map((c) => `- \\`${redact(c.command).replace(/`/g, \"'\").slice(0, 200)}\\` → exit ${c.exit ?? \"null\"}${c.timedOut ? \" (timeout)\" : \"\"}`).join(\"\\n\") : \"_(none)_\",\n    ``\n  ].filter((l) => l !== null).join(\"\\n\");\n  fs.writeFileSync(path.join(OUT, \"summary.md\"), md + \"\\n\");\n  if (env.GITHUB_STEP_SUMMARY) { try { fs.appendFileSync(env.GITHUB_STEP_SUMMARY, md + \"\\n\"); } catch {} }\n  return md;\n}\n\nconst SYSTEM_PROMPT = `You are OpenCode's autonomous cloud coding agent running headless in CI on a checked-out git repository (root: the current directory).\nComplete the user's task by inspecting and editing files with the tools. Work carefully and minimally: keep the existing style, do not touch unrelated files, never commit, push or create branches (the workflow does that), never print secrets or environment variables.\nDo not modify files under .github/workflows/. Run the project's tests or build when practical to verify.\nWhen finished, reply WITHOUT tool calls with a concise summary (what changed, why, how it was verified, anything left undone). That reply becomes the pull request description.`;\n\nasync function main() {\n  if (!TASK) { say(\"OPENCODE_TASK is empty\"); writeSummary({ stop: \"no task\", steps: 0, error: \"OPENCODE_TASK is empty\" }); return 1; }\n  if (!API_KEY) { say(\"Model API key is missing: set the repository secret (default OPENCODE_API_KEY).\"); writeSummary({ stop: \"missing API key\", steps: 0, error: \"model API key secret is not set\" }); return 1; }\n  say(`[opencode] model=${MODEL} maxSteps=${MAX_STEPS} maxMinutes=${Math.round(MAX_MS / 60000)} root=${ROOT}`);\n  log({ type: \"start\", model: MODEL, task: TASK.slice(0, 2000) });\n  const messages = [{ role: \"system\", content: SYSTEM_PROMPT }, { role: \"user\", content: TASK }];\n  let steps = 0, finalText = \"\", stop = \"max steps reached\";\n  try {\n    while (steps < MAX_STEPS) {\n      if (remainingMs() <= 10000) { stop = \"max runtime reached\"; break; }\n      steps++;\n      const resp = await chat(messages);\n      const msg = resp?.choices?.[0]?.message;\n      if (!msg) throw new Error(\"model returned no message\");\n      const calls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];\n      messages.push({ role: \"assistant\", content: msg.content ?? null, ...(calls.length ? { tool_calls: calls } : {}) });\n      if (msg.content) { say(`[assistant] ${clip(msg.content, 2000)}`); finalText = msg.content; }\n      if (!calls.length) { stop = \"completed\"; break; }\n      for (const c of calls) {\n        let args = {};\n        try { args = JSON.parse(c.function?.arguments || \"{}\"); } catch { args = {}; }\n        const name = c.function?.name;\n        say(`[tool] ${name} ${clip(JSON.stringify(name === \"write_file\" ? { path: args.path, bytes: String(args.content ?? \"\").length } : args), 300)}`);\n        const result = runTool(name, args);\n        log({ type: \"tool\", step: steps, name, args: name === \"write_file\" ? { path: args.path } : args, result: clip(result, 2000) });\n        messages.push({ role: \"tool\", tool_call_id: c.id, content: redact(result) });\n      }\n    }\n  } catch (e) {\n    const error = String(e?.message || e);\n    say(`[opencode] error: ${error}`);\n    log({ type: \"error\", error });\n    writeSummary({ stop: \"error\", steps, finalText, error });\n    return 1;\n  }\n  log({ type: \"end\", stop, steps });\n  const md = writeSummary({ stop, steps, finalText });\n  say(md);\n  return stop === \"completed\" ? 0 : 2;\n}\n\nconst isMain = (() => { try { return path.resolve(process.argv[1] || \"\") === path.resolve(fileURLToPath(import.meta.url)); } catch { return false; } })();\nif (isMain) main().then((code) => process.exit(code), (e) => { say(String(e?.stack || e)); process.exit(1); });\n";

// ---------- 纯函数 ----------
export function parseGitRemote(url) {
  const s = String(url || "").trim();
  if (!s) return null;
  let m = /^(?:[\w.-]+@)?([\w.-]+):(?!\/)([^\s]+?)$/.exec(s); // scp 形式 git@github.com:o/r.git
  let host, p;
  if (m && !/^[a-z]+:\/\//i.test(s)) { host = m[1]; p = m[2]; }
  else {
    try { const u = new URL(s); if (!/^(https?|ssh|git):$/.test(u.protocol)) return null; host = u.hostname; p = u.pathname; } catch { return null; }
  }
  const parts = String(p).replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.git$/i, "").split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[parts.length - 2], repo = parts[parts.length - 1];
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
  return { host: String(host).toLowerCase(), owner, repo, fullName: `${owner}/${repo}` };
}

export function parseRepoSetting(value) {
  const s = String(value || "").trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(s)) { const [owner, repo] = s.split("/"); return { host: "github.com", owner, repo: repo.replace(/\.git$/i, ""), fullName: `${owner}/${repo.replace(/\.git$/i, "")}` }; }
  return parseGitRemote(s);
}

export function githubApiBase(host) {
  const h = String(host || "github.com").toLowerCase();
  return h === "github.com" || h === "www.github.com" ? "https://api.github.com" : `https://${h}/api/v3`;
}

export function sanitizeRunId(id) {
  return String(id || "").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 64);
}

export function newRunId(now = new Date(), rand = Math.random) {
  const p = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  const r = Math.floor(rand() * 36 ** 4).toString(36).padStart(4, "0");
  return `${stamp}-${r}`;
}

export function agentBranchName(runId) {
  const id = sanitizeRunId(runId);
  if (!id) throw new Error("run_id 不能为空");
  return CLOUD_BRANCH_PREFIX + id;
}

export function runDisplayName(runId) { return `opencode-agent ${sanitizeRunId(runId)}`; }

export function buildDispatchRequest({ owner, repo, task, base, model, runId, secretName, workflow } = {}) {
  if (!owner || !repo) throw new Error("缺少 owner/repo");
  const t = String(task || "").trim();
  if (!t) throw new Error("任务不能为空");
  if (t.length > 20000) throw new Error("任务太长（最多 20000 字符）");
  const b = String(base || "").trim();
  if (!b) throw new Error("缺少基准分支");
  const id = sanitizeRunId(runId);
  if (!id) throw new Error("缺少 run_id");
  const secret = String(secretName || CLOUD_DEFAULT_SECRET).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(secret)) throw new Error(`Secret 名称不合法：${secret}`);
  const wf = encodeURIComponent(String(workflow || CLOUD_WORKFLOW_FILE));
  return {
    method: "POST",
    path: `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${wf}/dispatches`,
    body: { ref: b, inputs: { task: t, base: b, model: String(model || "").trim(), run_id: id, secret_name: secret } },
    runId: id,
    branch: agentBranchName(id)
  };
}

export function buildRunsQuery({ owner, repo, createdAfter, workflow } = {}) {
  const q = new URLSearchParams({ event: "workflow_dispatch", per_page: "30" });
  if (createdAfter) {
    const d = new Date(new Date(createdAfter).getTime() - 2 * 60 * 1000); // 时钟偏差余量
    q.set("created", `>=${d.toISOString().replace(/\.\d{3}Z$/, "Z")}`);
  }
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflow || CLOUD_WORKFLOW_FILE)}/runs?${q}`;
}

const STATE_LABELS = { pending: "等待启动", queued: "排队中", running: "运行中", success: "已完成", failure: "失败", cancelled: "已取消", timed_out: "超时", skipped: "已跳过", unknown: "未知" };
export function statusLabel(state) { return STATE_LABELS[state] || STATE_LABELS.unknown; }

export function parseRunStatus(response, { runId } = {}) {
  const runs = Array.isArray(response?.workflow_runs) ? response.workflow_runs : Array.isArray(response) ? response : [];
  const want = runDisplayName(runId);
  const run = runs.find((r) => String(r?.display_title || "").trim() === want || String(r?.name || "").trim() === want);
  if (!run) return { found: false, state: "pending", done: false, label: statusLabel("pending") };
  const status = String(run.status || "");
  const conclusion = String(run.conclusion || "");
  let state;
  if (status === "completed") state = conclusion === "success" ? "success" : conclusion === "cancelled" ? "cancelled" : conclusion === "timed_out" ? "timed_out" : conclusion === "skipped" ? "skipped" : "failure";
  else if (status === "in_progress") state = "running";
  else if (["queued", "requested", "waiting", "pending"].includes(status)) state = "queued";
  else state = "unknown";
  return { found: true, id: run.id, status, conclusion: conclusion || null, state, done: status === "completed", label: statusLabel(state), htmlUrl: run.html_url || "", createdAt: run.created_at || "", updatedAt: run.updated_at || "" };
}

export function pickPullRequest(list) {
  const prs = Array.isArray(list) ? list : [];
  return prs.find((p) => p?.state === "open") || prs[0] || null;
}

// ---------- VS Code 部分 ----------
let activated = false;
let log = () => {};
let statusItem = null;
const active = new Map(); // runId -> record

function cfg() { return vscodeCA.workspace.getConfiguration("opencode"); }
function stateFile() { return pathCA.join(osCA.homedir(), ".opencode", "cloud-agent", "runs.json"); }
function readRuns() { try { const j = JSON.parse(fsCA.readFileSync(stateFile(), "utf8")); return Array.isArray(j) ? j : []; } catch { return []; } }
function saveRun(rec) {
  try {
    const runs = readRuns().filter((r) => r.runId !== rec.runId);
    runs.unshift(rec);
    fsCA.mkdirSync(pathCA.dirname(stateFile()), { recursive: true });
    fsCA.writeFileSync(stateFile(), JSON.stringify(runs.slice(0, 30), null, 2));
  } catch (e) { log(`[cloud-agent] 保存运行记录失败：${e?.message ?? e}`); }
}

function workspaceRoot() {
  const ed = vscodeCA.window.activeTextEditor?.document?.uri;
  const f = (ed && vscodeCA.workspace.getWorkspaceFolder(ed)) || vscodeCA.workspace.workspaceFolders?.[0];
  return f?.uri?.fsPath || "";
}

function git(cwd, args, timeout = 60000) {
  return new Promise((resolve, reject) => {
    cpCA.execFile("git", args, { cwd, timeout, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) { const e = new Error(String(stderr || err.message || err).trim()); e.code = err.code; reject(e); } else resolve(String(stdout || "").trim());
    });
  });
}

async function token(silent) {
  const s = await vscodeCA.authentication.getSession("github", CLOUD_GITHUB_SCOPES, silent ? { silent: true } : { createIfNone: true });
  if (!s) throw new Error("没有登录 GitHub（需要 repo + workflow 权限）。");
  return s.accessToken;
}

async function gh(repoInfo, p, opt = {}) {
  const t = await token(opt.silent);
  const r = await fetch(githubApiBase(repoInfo?.host) + p, {
    method: opt.method || "GET",
    headers: { Authorization: "Bearer " + t, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "OpenCode", ...(opt.body ? { "Content-Type": "application/json" } : {}) },
    body: opt.body ? JSON.stringify(opt.body) : void 0
  });
  const txt = await r.text();
  if (!r.ok) { let msg = txt; try { msg = JSON.parse(txt).message || txt; } catch {} const e = new Error("GitHub " + r.status + "：" + String(msg).slice(0, 300)); e.status = r.status; throw e; }
  return txt ? JSON.parse(txt) : null;
}

async function detectRepo(root, { ask = true } = {}) {
  if (root) {
    try {
      const remotes = (await git(root, ["remote"])).split(/\s+/).filter(Boolean);
      const order = remotes.includes("origin") ? ["origin", ...remotes.filter((r) => r !== "origin")] : remotes;
      for (const name of order) {
        const info = parseGitRemote(await git(root, ["remote", "get-url", name]).catch(() => ""));
        if (info) return { ...info, remote: name };
      }
    } catch (e) { log(`[cloud-agent] 读取 git remote 失败：${e?.message ?? e}`); }
  }
  const fromSetting = parseRepoSetting(cfg().get("cloudAgent.repo"));
  if (fromSetting) return { ...fromSetting, remote: "origin" };
  if (!ask) return null;
  const typed = await vscodeCA.window.showInputBox({ title: "OpenCode 云端运行", prompt: "没有从 git remote 识别到 GitHub 仓库，请输入 owner/repo（也可在设置 opencode.cloudAgent.repo 中填写）", placeHolder: "owner/repo", ignoreFocusOut: true, validateInput: (v) => parseRepoSetting(v) ? null : "格式：owner/repo 或 GitHub 仓库 URL" });
  const info = parseRepoSetting(typed);
  return info ? { ...info, remote: "origin" } : null;
}

function ensureStatusItem() {
  if (!statusItem) {
    statusItem = vscodeCA.window.createStatusBarItem(vscodeCA.StatusBarAlignment.Left, 50);
    statusItem.command = "opencode.cloudAgent.showRuns";
  }
  return statusItem;
}
function renderStatus() {
  const item = ensureStatusItem();
  const list = [...active.values()];
  if (!list.length) { item.hide(); return; }
  const r = list[0];
  const spin = r.state === "running" || r.state === "queued" || r.state === "pending" ? "$(sync~spin)" : "$(cloud)";
  item.text = `${spin} 云端：${statusLabel(r.state)}${list.length > 1 ? ` (+${list.length - 1})` : ""}`;
  item.tooltip = `OpenCode 云端任务 ${r.runId}\n${r.repo}\n${String(r.task || "").slice(0, 200)}\n点击查看云端任务`;
  item.show();
}

async function dispatchCommand() {
  const root = workspaceRoot();
  const repoInfo = await detectRepo(root);
  if (!repoInfo) return;
  let current = "";
  if (root) { try { current = await git(root, ["rev-parse", "--abbrev-ref", "HEAD"]); } catch {} }
  if (current === "HEAD") current = "";
  const base = await vscodeCA.window.showInputBox({ title: `OpenCode 云端运行 · ${repoInfo.fullName}`, prompt: "基准分支（云端从这个分支检出；需要已推送到 GitHub，且包含 opencode-agent 工作流）", value: current || "main", ignoreFocusOut: true, validateInput: (v) => String(v || "").trim() ? null : "不能为空" });
  if (!base) return;
  if (root && current && base.trim() === current) {
    try {
      const ahead = await git(root, ["rev-list", "--count", `${repoInfo.remote}/${current}..HEAD`]);
      if (Number(ahead) > 0) {
        const go = await vscodeCA.window.showWarningMessage(`本地分支 ${current} 有 ${ahead} 个提交还没推送，云端看不到它们。仍然继续？`, { modal: true }, "继续");
        if (go !== "继续") return;
      }
    } catch {}
  }
  const task = await vscodeCA.window.showInputBox({ title: `OpenCode 云端运行 · ${repoInfo.fullName}@${base.trim()}`, prompt: "要让云端智能体完成的任务（会写进 GitHub Actions 的运行输入，请勿包含密钥）", placeHolder: "例如：修复 README 里失效的链接，并补上单元测试", ignoreFocusOut: true, validateInput: (v) => String(v || "").trim() ? null : "任务不能为空" });
  if (!task) return;
  const model = String(cfg().get("cloudAgent.model") || "").trim() || String(cfg().get("model.name") || "").trim();
  const secretName = String(cfg().get("cloudAgent.secretName") || CLOUD_DEFAULT_SECRET).trim() || CLOUD_DEFAULT_SECRET;
  const runId = newRunId();
  let req;
  try { req = buildDispatchRequest({ owner: repoInfo.owner, repo: repoInfo.repo, task, base, model, runId, secretName }); }
  catch (e) { void vscodeCA.window.showErrorMessage(`OpenCode 云端运行：${e?.message ?? e}`); return; }
  const dispatchedAt = new Date().toISOString();
  try {
    await gh(repoInfo, req.path, { method: "POST", body: req.body });
  } catch (e) {
    if (e?.status === 404) {
      const pick = await vscodeCA.window.showWarningMessage(`${repoInfo.fullName} 的分支 ${base.trim()} 上还没有 ${CLOUD_WORKFLOW_PATH}（或当前 GitHub 账号没有权限）。要把云端工作流安装到当前仓库吗？`, "安装工作流", "取消");
      if (pick === "安装工作流") await installWorkflowCommand();
      return;
    }
    if (e?.status === 422) { void vscodeCA.window.showErrorMessage(`OpenCode 云端运行：GitHub 拒绝了请求（分支 ${base.trim()} 不存在于远端，或工作流的输入不匹配，请重新安装工作流）。${e.message}`); return; }
    if (e?.status === 403 || e?.status === 401) { void vscodeCA.window.showErrorMessage(`OpenCode 云端运行：GitHub 权限不足（需要 repo + workflow）。${e.message}`); return; }
    void vscodeCA.window.showErrorMessage(`OpenCode 云端运行：派发失败：${e?.message ?? e}`);
    return;
  }
  const rec = { runId: req.runId, branch: req.branch, repo: repoInfo.fullName, host: repoInfo.host, owner: repoInfo.owner, name: repoInfo.repo, remote: repoInfo.remote, base: base.trim(), task: task.trim(), model, dispatchedAt, root, state: "pending", ghRunId: null, htmlUrl: "" };
  saveRun(rec);
  log(`[cloud-agent] 已派发 ${rec.repo} run_id=${rec.runId} base=${rec.base}`);
  void vscodeCA.window.showInformationMessage(`已发到云端：${rec.repo}（${rec.branch}）。关机也会继续运行，完成后会提醒你。`, "查看运行").then((p) => { if (p === "查看运行") void openRunPage(rec); });
  startPolling(rec);
}

function repoInfoOf(rec) { return { host: rec.host || "github.com", owner: rec.owner, repo: rec.name, fullName: rec.repo }; }

async function openRunPage(rec) {
  const url = rec.htmlUrl || `https://${rec.host || "github.com"}/${rec.repo}/actions/workflows/${CLOUD_WORKFLOW_FILE}`;
  await vscodeCA.env.openExternal(vscodeCA.Uri.parse(url));
}

function startPolling(rec, { silent = false } = {}) {
  if (active.has(rec.runId)) return;
  active.set(rec.runId, rec);
  renderStatus();
  const started = Date.now();
  const tick = async () => {
    if (!active.has(rec.runId)) return;
    try {
      const data = await gh(repoInfoOf(rec), buildRunsQuery({ owner: rec.owner, repo: rec.name, createdAfter: rec.dispatchedAt }), { silent });
      const st = parseRunStatus(data, { runId: rec.runId });
      if (st.found) { rec.ghRunId = st.id; rec.htmlUrl = st.htmlUrl; }
      if (st.state !== rec.state) { rec.state = st.state; saveRun(rec); renderStatus(); log(`[cloud-agent] ${rec.runId}：${st.label}`); }
      if (st.done) { active.delete(rec.runId); renderStatus(); void notifyDone(rec, st); return; }
      if (!st.found && Date.now() - started > 10 * 60 * 1000 && Date.now() - new Date(rec.dispatchedAt).getTime() > 10 * 60 * 1000) {
        rec.state = "unknown"; saveRun(rec); active.delete(rec.runId); renderStatus();
        void vscodeCA.window.showWarningMessage(`云端任务 ${rec.runId} 派发 10 分钟后仍未出现在 GitHub Actions 里。`, "打开 Actions").then((p) => { if (p) void openRunPage(rec); });
        return;
      }
    } catch (e) {
      log(`[cloud-agent] 查询状态失败：${e?.message ?? e}`);
    }
    if (Date.now() - started > 3 * 60 * 60 * 1000) { active.delete(rec.runId); renderStatus(); return; }
    const t = setTimeout(tick, rec.state === "pending" ? 8000 : 20000); t.unref?.();
  };
  const t = setTimeout(tick, 5000); t.unref?.();
}

async function findPr(rec) {
  const list = await gh(repoInfoOf(rec), `/repos/${encodeURIComponent(rec.owner)}/${encodeURIComponent(rec.name)}/pulls?state=all&head=${encodeURIComponent(rec.owner + ":" + rec.branch)}`);
  return pickPullRequest(list);
}

async function notifyDone(rec, st) {
  const actions = ["查看 PR", "拉取分支到本地", "查看运行"];
  const msg = st.state === "success" ? `云端任务完成：${rec.repo}（${rec.branch}）` : `云端任务${st.label}：${rec.repo}（${rec.runId}）`;
  const pick = await (st.state === "success" ? vscodeCA.window.showInformationMessage(msg, ...actions) : vscodeCA.window.showWarningMessage(msg, ...actions));
  await handleAction(rec, pick);
}

async function handleAction(rec, pick) {
  try {
    if (pick === "查看运行") return void (await openRunPage(rec));
    if (pick === "查看 PR") {
      const pr = await findPr(rec);
      if (pr?.html_url) return void (await vscodeCA.env.openExternal(vscodeCA.Uri.parse(pr.html_url)));
      const p = await vscodeCA.window.showWarningMessage(`没有找到分支 ${rec.branch} 的 PR（可能智能体没有改动，或仓库没允许 Actions 创建 PR）。`, "查看运行");
      if (p) await openRunPage(rec);
      return;
    }
    if (pick === "拉取分支到本地") return void (await pullBranch(rec));
  } catch (e) { void vscodeCA.window.showErrorMessage(`OpenCode 云端运行：${e?.message ?? e}`); }
}

async function pullBranch(rec) {
  const root = rec.root && fsCA.existsSync(rec.root) ? rec.root : workspaceRoot();
  if (!root) throw new Error("没有打开工作区");
  const remote = rec.remote || "origin";
  await git(root, ["fetch", remote, `+refs/heads/${rec.branch}:refs/remotes/${remote}/${rec.branch}`], 180000);
  const ok = await vscodeCA.window.showInformationMessage(`已拉取 ${remote}/${rec.branch}。切换到这个分支吗？（工作区有未提交改动时 git 可能拒绝切换）`, { modal: true }, "切换分支");
  if (ok !== "切换分支") return;
  let exists = true;
  try { await git(root, ["rev-parse", "--verify", "--quiet", `refs/heads/${rec.branch}`]); } catch { exists = false; }
  if (exists) { await git(root, ["checkout", rec.branch]); await git(root, ["merge", "--ff-only", `${remote}/${rec.branch}`]).catch((e) => log(`[cloud-agent] ff 失败：${e.message}`)); }
  else await git(root, ["checkout", "-b", rec.branch, "--track", `${remote}/${rec.branch}`]);
  void vscodeCA.window.showInformationMessage(`已切换到 ${rec.branch}。`);
}

async function showRunsCommand() {
  const runs = readRuns();
  if (!runs.length) { void vscodeCA.window.showInformationMessage("还没有云端任务。运行「OpenCode：发到云端运行」开始。"); return; }
  const item = await vscodeCA.window.showQuickPick(runs.map((r) => ({ label: `${active.has(r.runId) ? "$(sync~spin) " : ""}${statusLabel(active.get(r.runId)?.state || r.state)} · ${String(r.task || "").replace(/\s+/g, " ").slice(0, 60)}`, description: `${r.repo} · ${r.branch}`, detail: `${r.dispatchedAt}`, rec: r })), { title: "OpenCode 云端任务", ignoreFocusOut: true });
  if (!item) return;
  const pick = await vscodeCA.window.showQuickPick(["查看 PR", "拉取分支到本地", "查看运行"], { title: item.rec.branch });
  if (pick) await handleAction(item.rec, pick);
}

async function installWorkflowCommand() {
  const root = workspaceRoot();
  if (!root) { void vscodeCA.window.showErrorMessage("OpenCode：请先打开一个 git 仓库文件夹。"); return; }
  let top = root;
  try { top = await git(root, ["rev-parse", "--show-toplevel"]); } catch {}
  const wf = pathCA.join(top, ...CLOUD_WORKFLOW_PATH.split("/"));
  const rn = pathCA.join(top, ...CLOUD_RUNNER_PATH.split("/"));
  if (fsCA.existsSync(wf) || fsCA.existsSync(rn)) {
    const ok = await vscodeCA.window.showWarningMessage(`${CLOUD_WORKFLOW_PATH} 或 ${CLOUD_RUNNER_PATH} 已存在，覆盖为当前版本吗？`, { modal: true }, "覆盖");
    if (ok !== "覆盖") return;
  }
  fsCA.mkdirSync(pathCA.dirname(wf), { recursive: true });
  fsCA.mkdirSync(pathCA.dirname(rn), { recursive: true });
  fsCA.writeFileSync(wf, CLOUD_WORKFLOW_TEMPLATE);
  fsCA.writeFileSync(rn, CLOUD_RUNNER_SOURCE);
  const secretName = String(cfg().get("cloudAgent.secretName") || CLOUD_DEFAULT_SECRET).trim() || CLOUD_DEFAULT_SECRET;
  const repoInfo = await detectRepo(top, { ask: false });
  log(`[cloud-agent] 已写入 ${wf} 和 ${rn}`);
  const doc = await vscodeCA.workspace.openTextDocument(wf).then(undefined, () => null);
  if (doc) void vscodeCA.window.showTextDocument(doc, { preview: true });
  const actions = repoInfo ? ["打开 Secrets 设置", "Actions 权限设置"] : [];
  const pick = await vscodeCA.window.showInformationMessage(`已写入 ${CLOUD_WORKFLOW_PATH} 和 ${CLOUD_RUNNER_PATH}。下一步：1) 提交并推送到 GitHub（git add .github && git commit && git push）；2) 在仓库 Settings › Secrets and variables › Actions 添加 Secret「${secretName}」（模型 API Key；可选 OPENCODE_API_BASE、变量 OPENCODE_MODEL）；3) 在 Settings › Actions › General 勾选“Allow GitHub Actions to create and approve pull requests”，以便自动开 draft PR。`, { modal: false }, ...actions);
  if (repoInfo && pick) {
    const web = `https://${repoInfo.host}/${repoInfo.fullName}`;
    await vscodeCA.env.openExternal(vscodeCA.Uri.parse(pick === "打开 Secrets 设置" ? `${web}/settings/secrets/actions/new` : `${web}/settings/actions`));
  }
}

export function activateCloudAgent(deps = {}) {
  if (activated) return; activated = true;
  log = (m) => { try { deps.log?.(m); } catch {} };
  const wrap = (fn) => async (...a) => { try { await fn(...a); } catch (e) { log(`[cloud-agent] ${e?.stack ?? e}`); void vscodeCA.window.showErrorMessage(`OpenCode 云端运行：${e?.message ?? e}`); } };
  vscodeCA.commands.registerCommand("opencode.cloudAgent.dispatch", wrap(dispatchCommand));
  vscodeCA.commands.registerCommand("opencode.cloudAgent.installWorkflow", wrap(installWorkflowCommand));
  vscodeCA.commands.registerCommand("opencode.cloudAgent.showRuns", wrap(showRunsCommand));
  // 重新打开 OpenCode 后继续跟踪 3 小时内未结束的云端任务（静默鉴权，不弹登录）。
  const t = setTimeout(() => {
    for (const r of readRuns()) {
      if (["pending", "queued", "running"].includes(r.state) && Date.now() - new Date(r.dispatchedAt).getTime() < 3 * 60 * 60 * 1000) startPolling(r, { silent: true });
    }
  }, 15000);
  t.unref?.();
}
