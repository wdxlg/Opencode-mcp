// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/tool-presentation.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { boundedTechnicalText } from "./module-0179.mjs";


// extensions/opencode/src/tool-presentation.ts
init_define_OPENCODE_BUILD_INFO();

var vscode18 = __toESM(require("vscode"));

var MAX_PREVIEW_ITEMS = 12;

function presentationKind(toolName) {
  switch (toolName) {
    case "find_files":
    case "read_files":
    case "list_directory":
      return "files";
    case "search_files":
      return "search";
    case "apply_patch":
      return "edit";
    case "run_command":
    case "get_command_output":
    case "send_command_input":
      return "terminal";
    case "get_diagnostics":
      return "diagnostics";
    case "lsp":
      return "lsp";
    default:
      return "generic";
  }
}

function field2(text2, name) {
  const match = text2.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
}

function integerField(text2, name) {
  const value = field2(text2, name);
  if (!value) return void 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : void 0;
}

function parseJsonString(value) {
  if (!value) return void 0;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "string" ? parsed : value;
  } catch {
    return value.replace(/^"|"$/g, "");
  }
}

function blockBetween2(text2, begin, end) {
  const start = text2.indexOf(begin);
  if (start < 0) return void 0;
  const contentStart = start + begin.length;
  const finish = text2.indexOf(end, contentStart);
  const value = text2.slice(contentStart, finish >= 0 ? finish : void 0).replace(/^\r?\n/, "").replace(/\r?\n$/, "");
  return value || void 0;
}

function relativeResource(root, relativePath, line, column) {
  if (!root || !relativePath || relativePath.startsWith("(") || relativePath.startsWith("\u2026")) return void 0;
  const clean = relativePath.replace(/\\/g, "/").replace(/^\.\//, "");
  const uri = vscode18.Uri.joinPath(root, ...clean.split("/").filter(Boolean));
  if (!line) return uri;
  const start = new vscode18.Position(Math.max(0, line - 1), Math.max(0, (column ?? 1) - 1));
  return new vscode18.Location(uri, new vscode18.Range(start, start));
}

function durationMetric(durationMs) {
  if (durationMs === void 0) return [];
  return [{ label: "Duration", value: durationMs < 1e3 ? `${durationMs} ms` : `${(durationMs / 1e3).toFixed(1)} s` }];
}

function formatDurationMs(ms) {
  return ms >= 1e3 && ms % 1e3 === 0 ? `${ms / 1e3} s` : `${ms} ms`;
}

function withOverflowItem(items, total) {
  if (items.length <= MAX_PREVIEW_ITEMS) return items;
  const visible = items.slice(0, MAX_PREVIEW_ITEMS);
  visible.push({ label: `\u2026 ${Math.max(0, total - MAX_PREVIEW_ITEMS)} more` });
  return visible;
}

function findFilesPresentation(text2, root, durationMs) {
  const total = integerField(text2, "returned_files") ?? 0;
  const marker = "--- FILES ---";
  const section = text2.includes(marker) ? text2.split(marker, 2)[1] ?? "" : "";
  const paths = section.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("===") && !line.startsWith("NOTE:") && line !== "(no matching files)");
  const pattern = field2(text2, "patterns");
  const scope = parseJsonString(field2(text2, "scope")) ?? ".";
  return {
    title: total === 1 ? "Found 1 file" : `Found ${total} files`,
    summary: pattern ? `Searched ${scope} for ${pattern}.` : `Searched ${scope}.`,
    items: withOverflowItem(paths.map((path36) => ({ label: path36, resource: relativeResource(root, path36) })), total),
    metrics: [{ label: "Files", value: String(total) }, ...durationMetric(durationMs)]
  };
}

function searchFilesPresentation(text2, root, durationMs) {
  const total = integerField(text2, "returned_matches") ?? 0;
  const files = integerField(text2, "files_with_matches") ?? 0;
  const pattern = parseJsonString(field2(text2, "pattern")) ?? "";
  const scope = parseJsonString(field2(text2, "scope")) ?? ".";
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  for (const match of text2.matchAll(/^(.+?):(\d+):(\d+)$/gm)) {
    const path36 = match[1]?.trim();
    const line = Number(match[2]);
    const column = Number(match[3]);
    const key = `${path36}:${line}:${column}`;
    if (!path36 || seen.has(key)) continue;
    seen.add(key);
    items.push({ label: path36, description: `Line ${line}`, resource: relativeResource(root, path36, line, column) });
  }
  return {
    title: total === 1 ? "Found 1 match" : `Found ${total} matches`,
    summary: pattern ? `Searched ${scope} for \u201C${pattern}\u201D.` : `Searched ${scope}.`,
    items: withOverflowItem(items, total),
    metrics: [{ label: "Matches", value: String(total) }, { label: "Files", value: String(files) }, ...durationMetric(durationMs)]
  };
}

function readFilesPresentation(text2, root, durationMs) {
  const requested = integerField(text2, "requested") ?? 0;
  const succeeded = integerField(text2, "succeeded") ?? requested;
  const failed = integerField(text2, "failed") ?? 0;
  const truncated = integerField(text2, "truncated") ?? 0;
  const items = [];
  for (const block of text2.split("=== FILE BEGIN ===").slice(1)) {
    const path36 = parseJsonString(field2(block, "path"));
    if (!path36) continue;
    const status = field2(block, "status") ?? "unknown";
    const lines = field2(block, "lines");
    const startLine = lines ? Number.parseInt(lines.split("-", 1)[0] ?? "1", 10) : void 0;
    items.push({
      label: path36,
      description: status === "success" ? lines ? `Lines ${lines}` : "Read" : status,
      resource: relativeResource(root, path36, Number.isFinite(startLine) ? startLine : void 0)
    });
  }
  return {
    title: succeeded === 1 ? "Read 1 file" : `Read ${succeeded} files`,
    summary: failed > 0 ? `${succeeded} succeeded and ${failed} failed.` : `${succeeded} file${succeeded === 1 ? "" : "s"} read successfully.`,
    items: withOverflowItem(items, items.length),
    metrics: [
      { label: "Requested", value: String(requested) },
      ...truncated ? [{ label: "Truncated", value: String(truncated) }] : [],
      ...durationMetric(durationMs)
    ]
  };
}

function applyPatchPresentation(text2, root, durationMs) {
  const filesChanged = integerField(text2, "files_changed") ?? 0;
  const additions = integerField(text2, "additions") ?? 0;
  const deletions = integerField(text2, "deletions") ?? 0;
  const items = [];
  for (const block of text2.split("--- FILE ---").slice(1)) {
    const path36 = parseJsonString(field2(block, "destination_path")) ?? parseJsonString(field2(block, "path"));
    if (!path36) continue;
    items.push({
      label: path36,
      description: field2(block, "action") ?? "updated",
      resource: relativeResource(root, path36),
      added: integerField(block, "additions"),
      removed: integerField(block, "deletions")
    });
  }
  const diff = blockBetween2(text2, "--- CANONICAL APPLIED DIFF ---", "=== APPLY_PATCH END ===")?.replace(/\r?\nNOTE: Diff display was truncated;[\s\S]*$/, "");
  return {
    title: filesChanged === 1 ? "Updated 1 file" : `Updated ${filesChanged} files`,
    summary: `${additions} line${additions === 1 ? "" : "s"} added and ${deletions} removed.`,
    items: withOverflowItem(items, filesChanged),
    metrics: [
      { label: "Files", value: String(filesChanged) },
      { label: "Added", value: `+${additions}` },
      { label: "Removed", value: `\u2212${deletions}` },
      ...durationMetric(durationMs)
    ],
    diff,
    diffPreview: parseUnifiedDiffPreview2(diff)
  };
}

var MAX_DIFF_PREVIEW_FILES2 = 8;

var MAX_DIFF_PREVIEW_HUNKS_PER_FILE2 = 4;

var MAX_DIFF_PREVIEW_LINES_PER_HUNK2 = 18;

function diffPath2(header) {
  const value = header.trim();
  if (!value || value === "/dev/null") return void 0;
  return value.replace(/^[ab]\//, "");
}

function parseUnifiedDiffPreview2(diff) {
  if (!diff) return [];
  const lines = diff.split(/\r?\n/);
  const files = [];
  let currentFile;
  let currentHunk;
  let oldLine = 0;
  let newLine = 0;
  const finishHunk = () => {
    if (!currentFile || !currentHunk) return;
    if (currentFile.hunks.length < MAX_DIFF_PREVIEW_HUNKS_PER_FILE2) currentFile.hunks.push(currentHunk);
    else currentFile.truncated = true;
    currentHunk = void 0;
  };
  const finishFile = () => {
    finishHunk();
    if (!currentFile) return;
    if (files.length < MAX_DIFF_PREVIEW_FILES2) files.push(currentFile);
    else if (files.length) files[files.length - 1].truncated = true;
    currentFile = void 0;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("--- ")) {
      finishFile();
      const oldPath = diffPath2(line.slice(4));
      const next = lines[index + 1];
      const newPath = next?.startsWith("+++ ") ? diffPath2(next.slice(4)) : void 0;
      const path36 = newPath ?? oldPath;
      if (path36) currentFile = { path: path36, hunks: [] };
      if (next?.startsWith("+++ ")) index += 1;
      continue;
    }
    if (!currentFile) continue;
    const hunk = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      finishHunk();
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[2]);
      currentHunk = { lines: [] };
      continue;
    }
    if (!currentHunk || line === "\\ No newline at end of file" || line === "... <diff truncated>") continue;
    const marker = line[0];
    if (marker !== " " && marker !== "+" && marker !== "-") continue;
    const previewLine = marker === "+" ? { kind: "add", newLine, text: line.slice(1) } : marker === "-" ? { kind: "delete", oldLine, text: line.slice(1) } : { kind: "context", oldLine, newLine, text: line.slice(1) };
    if (currentHunk.lines.length < MAX_DIFF_PREVIEW_LINES_PER_HUNK2) currentHunk.lines.push(previewLine);
    else currentHunk.truncated = true;
    if (marker !== "+") oldLine += 1;
    if (marker !== "-") newLine += 1;
  }
  finishFile();
  return files;
}

function listDirectoryPresentation(text2, root, durationMs, args) {
  const items = [...text2.matchAll(/^\[(DIR|FILE|LINK|OTHER)\]\s+(.+)$/gm)].map((match) => {
    const path36 = match[2]?.trim() ?? "";
    return { label: path36, description: match[1] === "DIR" ? "Folder" : void 0, resource: relativeResource(root, path36) };
  }).filter((item) => item.label);
  const target = typeof args.path === "string" && args.path.trim() ? args.path.trim() : "workspace";
  return {
    title: `Explored ${target}`,
    summary: `${items.length} item${items.length === 1 ? "" : "s"}.`,
    items: withOverflowItem(items, items.length),
    metrics: [{ label: "Items", value: String(items.length) }, ...durationMetric(durationMs)]
  };
}

function diagnosticsPresentation(text2, root, durationMs) {
  const total = integerField(text2, "returned") ?? integerField(text2, "total_matching") ?? 0;
  const items = [];
  for (const block of text2.split(/--- DIAGNOSTIC \d+ ---/).slice(1)) {
    const lines = block.trim().split(/\r?\n/);
    const location = lines[0]?.match(/^(.+):(\d+):(\d+)$/);
    if (!location) continue;
    const severity = field2(block, "severity");
    const messageStart = lines.findIndex((line) => line.startsWith("code:"));
    const message2 = messageStart >= 0 ? lines.slice(messageStart + 1).join(" ").trim() : void 0;
    items.push({
      label: message2 || location[1],
      description: [severity, `${location[1]}:${location[2]}:${location[3]}`].filter(Boolean).join(" \xB7 "),
      resource: relativeResource(root, location[1], Number(location[2]), Number(location[3]))
    });
  }
  return {
    title: total === 0 ? "No diagnostics" : total === 1 ? "Found 1 diagnostic" : `Found ${total} diagnostics`,
    summary: total === 0 ? "No matching editor or language-service diagnostics." : void 0,
    items: withOverflowItem(items, total),
    metrics: [{ label: "Diagnostics", value: String(total) }, ...durationMetric(durationMs)]
  };
}

function lspPresentation(text2, root, durationMs, args) {
  const total = integerField(text2, "returned_results") ?? integerField(text2, "returned") ?? 0;
  const items = [];
  for (const block of text2.split(/--- RESULT \d+ ---/).slice(1)) {
    const path36 = parseJsonString(field2(block, "path"));
    if (!path36 || /^[a-z]+:\/\//i.test(path36)) continue;
    const range = field2(block, "selection_range") ?? field2(block, "range");
    const position = range?.match(/^(\d+):(\d+)/);
    const line = position ? Number(position[1]) : void 0;
    const column = position ? Number(position[2]) : void 0;
    items.push({
      label: parseJsonString(field2(block, "name")) ?? path36,
      description: [field2(block, "kind"), field2(block, "container"), line ? `${path36}:${line}:${column ?? 1}` : path36].filter(Boolean).join(" \xB7 "),
      resource: relativeResource(root, path36, line, column)
    });
  }
  const operation = typeof args.operation === "string" ? args.operation : "LSP query";
  return {
    title: `${operation.replaceAll("_", " ")} \xB7 ${total} result${total === 1 ? "" : "s"}`,
    summary: field2(text2, "provider_state") ? `Provider: ${field2(text2, "provider_state")}` : void 0,
    items: withOverflowItem(items, total),
    metrics: [{ label: "Results", value: String(total) }, ...durationMetric(durationMs)]
  };
}

function terminalPresentation(text2, durationMs, args, toolName) {
  const command = typeof args.command === "string" ? args.command.trim() : typeof args.input === "string" ? args.input.trim() : "";
  const terminalId = field2(text2, "terminal_id");
  const terminalName = field2(text2, "terminal_name");
  const status = field2(text2, "status");
  const exitCode = field2(text2, "exit_code");
  const output2 = blockBetween2(text2, "--- OUTPUT BEGIN ---", "--- OUTPUT END ---");
  const title = toolName === "run_command" ? `Ran ${command || "terminal command"}` : toolName === "get_command_output" ? "Read command output" : "Sent command input";
  return {
    title,
    summary: [terminalName, status && status !== "completed" ? status : void 0, exitCode && exitCode !== "null" ? `exit ${exitCode}` : void 0].filter(Boolean).join(" \xB7 ") || void 0,
    output: output2,
    terminalId,
    metrics: [...exitCode && exitCode !== "null" ? [{ label: "Exit", value: exitCode }] : [], ...durationMetric(durationMs)]
  };
}

function waitPresentation(text2, durationMs) {
  const match = text2.match(/Waited (\d+) ms\./);
  const requestedMs = match ? Number(match[1]) : void 0;
  return {
    title: requestedMs !== void 0 && Number.isFinite(requestedMs) ? `Waited ${formatDurationMs(requestedMs)}` : "Waited",
    summary: "Wait completed.",
    metrics: durationMetric(durationMs)
  };
}

function runningPresentation(toolName, args, root) {
  switch (toolName) {
    case "find_files": {
      const patterns = Array.isArray(args.patterns) ? args.patterns.filter((value) => typeof value === "string") : [];
      return { title: "Finding files", summary: patterns.length ? `Searching for ${patterns.join(", ")}.` : "Searching workspace paths.", items: [] };
    }
    case "search_files":
      return { title: "Searching files", summary: typeof args.pattern === "string" ? `Searching for \u201C${args.pattern}\u201D.` : "Searching file contents.", items: [] };
    case "read_files": {
      const files = Array.isArray(args.files) ? args.files.filter((file) => !!file && typeof file === "object") : [];
      return {
        title: files.length === 1 ? "Reading 1 file" : `Reading ${files.length} files`,
        summary: "Reading requested source ranges.",
        items: withOverflowItem(files.map((file) => {
          const path36 = typeof file.path === "string" ? file.path : "file";
          const start = typeof file.start_line === "number" ? file.start_line : void 0;
          const end = typeof file.end_line === "number" ? file.end_line : void 0;
          return { label: path36, description: start ? `Lines ${start}${end ? `\u2013${end}` : "\u2013EOF"}` : void 0, resource: relativeResource(root, path36, start) };
        }), files.length)
      };
    }
    case "apply_patch": {
      const patch = typeof args.patch === "string" ? args.patch : "";
      const paths = [...patch.matchAll(/^\*\*\* (?:Update|Add|Delete) File: (.+)$/gm)].map((match) => match[1]?.trim()).filter((value) => !!value);
      return { title: paths.length === 1 ? "Updating 1 file" : `Updating ${paths.length || "workspace"} files`, summary: "Applying source changes.", items: withOverflowItem(paths.map((path36) => ({ label: path36, resource: relativeResource(root, path36) })), paths.length) };
    }
    case "list_directory":
      return { title: `Exploring ${typeof args.path === "string" && args.path.trim() ? args.path.trim() : "workspace"}`, summary: "Reading directory contents.", items: [] };
    case "get_diagnostics":
      return { title: "Checking diagnostics", summary: "Reading current editor and language-service diagnostics.", items: [] };
    case "lsp":
      return { title: typeof args.operation === "string" ? args.operation.replaceAll("_", " ") : "Running code intelligence", summary: "Querying active language services.", items: [] };
    case "run_command":
      return { title: `Running ${typeof args.command === "string" ? args.command.trim() : "terminal command"}`, summary: typeof args.cwd === "string" ? args.cwd : void 0, items: [] };
    case "get_command_output":
      return { title: "Reading command output", summary: typeof args.command_id === "string" ? args.command_id : void 0, items: [] };
    case "send_command_input":
      return { title: "Sending command input", summary: typeof args.command_id === "string" ? args.command_id : void 0, items: [] };
    case "wait": {
      const ms = typeof args.ms === "number" && Number.isFinite(args.ms) ? args.ms : void 0;
      return { title: "Waiting", summary: ms !== void 0 ? `Waiting ${formatDurationMs(ms)}.` : "Waiting for the requested duration.", items: [] };
    }
    default:
      return { title: `${toolName} running`, summary: void 0, items: [] };
  }
}

// OpenCode: 工具调用翻译——把 PowerShell / bash 命令和常见工具参数翻成一句短话（参考 Arena 命令翻译 v1.2.7 的读/改/搜索分类）
function ocDescShort(p) {
  let s = String(p ?? "").trim().replace(/^["'`]+|["'`]+$/g, "");
  if (!s || /^\$|^\(|^@\(|^\{/.test(s)) return "";
  s = s.replace(/[\\/]+$/, "");
  const parts = s.split(/[\\/]/).filter(Boolean);
  let b = parts.length ? parts[parts.length - 1] : s;
  if (/^[A-Za-z]:$/.test(b)) b = b + "\\";
  if (b === "~" || b === "." ) return b;
  return b.length > 48 ? b.slice(0, 47) + "…" : b;
}
function ocDescTokens(seg) {
  const out = [];
  const re = /"((?:[^"`]|`.)*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(seg))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}
function ocDescArg(toks, names, skipVals) {
  for (let i = 1; i < toks.length - 1; i++) {
    if (names.includes(toks[i].toLowerCase())) return toks[i + 1];
  }
  for (let i = 1; i < toks.length; i++) {
    const t = toks[i];
    if (/^-/.test(t)) {
      if (skipVals && skipVals.includes(t.toLowerCase()) && i + 1 < toks.length) i++;
      continue;
    }
    if (/^[|<>&;]+$/.test(t)) break;
    return t;
  }
  return "";
}
const OC_DESC_PS = (() => {
  const m = {};
  const add = (verb, names) => names.split(" ").forEach((n) => m[n] = verb);
  add("read", "get-content gc cat type more less head tail bat");
  add("list", "get-childitem gci ls dir tree find");
  add("search", "select-string sls findstr rg grep ag");
  add("write", "set-content add-content out-file tee-object tee");
  add("del", "remove-item rm del erase rmdir rd ri unlink");
  add("copy", "copy-item cp copy cpi xcopy robocopy");
  add("move", "move-item mv move mi rename-item ren rni");
  add("mkdir", "mkdir md");
  add("check", "test-path");
  add("stat", "get-item gi get-itemproperty gp stat get-filehash certutil");
  add("net", "invoke-webrequest iwr invoke-restmethod irm curl curl.exe wget");
  add("start", "start-process start saps");
  add("proc", "get-process gps ps tasklist");
  add("kill", "stop-process kill spps taskkill");
  add("zip", "expand-archive compress-archive tar unzip zip 7z");
  add("sed", "sed awk");
  add("skip", "cd set-location sl pushd popd chdir echo write-host write-output write-verbose write-error out-null out-string select-object select sort-object sort measure-object where-object where foreach-object % ? format-table ft format-list fl convertto-json convertfrom-json get-date start-sleep sleep clear cls exit return param try catch finally if else elseif foreach for while new-object get-location pwd join-path split-path resolve-path true false export import");
  return m;
})();
function ocDescSegment(seg, acts, vars) {
  seg = seg.trim().replace(/^[&.]\s+/, "");
  if (!seg || seg.startsWith("#")) return;
  // .NET 文件读写
  let mm = /\[(?:System\.)?IO\.File\]::(ReadAll\w*|WriteAll\w*|AppendAll\w*|Exists|Delete|Copy|Move)\(\s*["']?([^"',)]*)/i.exec(seg);
  if (mm) {
    const f = ocDescShort(mm[2]);
    const k = mm[1].toLowerCase();
    acts.push(k.startsWith("read") ? ["读", f] : k === "exists" ? ["检查", f] : k === "delete" ? ["删除", f] : k === "copy" ? ["复制", f] : k === "move" ? ["移动", f] : ["写", f]);
    return;
  }
  const redir = /(?:^|[^2])>>?\s*["']?([^\s"'|;&]+)/.exec(seg);
  const toks = ocDescTokens(seg.replace(/^\$\w+\s*=\s*/, ""));
  if (!toks.length) return;
  let cmd = toks[0].replace(/^.*[\\/]/, "").toLowerCase();
  if (cmd.endsWith(".exe")) cmd = cmd.slice(0, -4);
  const verb = OC_DESC_PS[cmd];
  const rawPath = () => ocDescArg(toks, ["-path", "-literalpath", "-filepath", "-p"], ["-encoding", "-tail", "-totalcount", "-first", "-head", "-n", "-filter", "-include", "-exclude", "-depth", "-raw"]);
  const pathArg = () => {
    const raw = rawPath();
    const v = /^\$(\w+)$/.exec(raw || "");
    if (v && vars && vars.has(v[1].toLowerCase())) return vars.get(v[1].toLowerCase());
    return ocDescShort(raw);
  };
  if (verb === "read") { const f = pathArg(); if (f) acts.push(["读", f]); }
  else if (verb === "list") acts.push([toks.some((t) => /^-r(ecurse)?$/i.test(t)) ? "遍历" : "列出", rawPath() ? pathArg() : "当前目录"]);
  else if (verb === "search") {
    const pat = ocDescArg(toks, ["-pattern", "-e"], ["-path", "-literalpath", "-g", "--glob", "-t", "--type", "-c", "-a", "-b", "-m", "--max-count"]);
    acts.push(["搜索", pat ? "“" + (pat.length > 30 ? pat.slice(0, 29) + "…" : pat) + "”" : ""]);
  } else if (verb === "write") acts.push(["写", pathArg()]);
  else if (verb === "del") acts.push(["删除", pathArg()]);
  else if (verb === "copy") acts.push(["复制", pathArg()]);
  else if (verb === "move") acts.push([/^ren|rename/.test(cmd) ? "重命名" : "移动", pathArg()]);
  else if (verb === "mkdir") acts.push(["新建目录", pathArg()]);
  else if (cmd === "new-item" || cmd === "ni") acts.push([toks.some((t) => /^director/i.test(t)) ? "新建目录" : "新建", pathArg()]);
  else if (verb === "check") acts.push(["检查", pathArg()]);
  else if (verb === "stat") acts.push(["查看", pathArg()]);
  else if (verb === "net") {
    const u = toks.find((t) => /^https?:\/\//i.test(t)) || "";
    const h = /^https?:\/\/([^/?#]+)/i.exec(u);
    acts.push(["请求", h ? h[1] : ""]);
  } else if (verb === "start") acts.push(["启动", pathArg()]);
  else if (verb === "proc") acts.push(["查看进程", ""]);
  else if (verb === "kill") acts.push(["结束进程", ""]);
  else if (verb === "zip") acts.push([/expand|unzip|-x/.test(seg.toLowerCase()) ? "解压" : "压缩", pathArg()]);
  else if (verb === "sed") acts.push([/\s-i\b/.test(seg) ? "改" : "读", ocDescShort(toks[toks.length - 1])]);
  else if (cmd === "git") acts.push(["git " + (toks.slice(1).find((t) => !t.startsWith("-") && !/^-c$/.test(t)) || ""), ""]);
  else if (["npm", "pnpm", "yarn", "npx", "bun", "dotnet", "cargo", "go", "pip", "pip3", "msbuild", "csc", "cmake", "make", "winget", "choco", "scoop"].includes(cmd)) {
    const words = toks.slice(1).filter((t) => !t.startsWith("-"));
    acts.push([cmd + " " + (words[0] === "run" || words[0] === "exec" ? words.slice(0, 2).join(" ") : words[0] || ""), ""]);
  }
  else if (["node", "python", "python3", "py", "deno", "pwsh", "powershell", "bash", "sh", "cmd"].includes(cmd)) {
    const script = toks.slice(1).find((t) => !t.startsWith("-") && /\.\w{1,5}$/.test(t));
    if (script) acts.push(["运行", ocDescShort(script)]);
    else if (toks.some((t) => /^(-c|-e|-command|--eval|\/c)$/i.test(t))) acts.push(["运行 " + cmd + " 脚本", ""]);
    else acts.push(["运行", cmd]);
  } else if (verb === "skip" || /^\$|^\[|^\(|^\{|^\}|^@/.test(toks[0])) {
    // 不单独显示
  } else if (/^[a-z][\w.-]*$/i.test(cmd)) acts.push(["运行", toks[0].replace(/^.*[\\/]/, "")]);
  if (redir && verb !== "write" && !/^(\$null|null|nul|&1|&2)$/i.test(redir[1])) acts.push(["写", ocDescShort(redir[1])]);
}
function ocDescribeCommand(command) {
  const acts = [];
  const text = String(command || "").replace(/`\r?\n/g, " ");
  const vars = new Map();
  const asg = /\$(\w+)\s*=\s*(@\(([^)]*)\)|"[^"]*"|'[^']*')/g;
  let am;
  while ((am = asg.exec(text))) {
    const lits = (am[3] ?? am[2]).match(/"[^"]*"|'[^']*'/g) || [];
    const names = lits.map((x) => ocDescShort(x.slice(1, -1).replace(/\$env:\w+/gi, ""))).filter(Boolean);
    if (names.length) vars.set(am[1].toLowerCase(), names.length > 2 ? names.slice(0, 2).join("、") + " 等 " + names.length + " 个" : names.join("、"));
  }
  const loopVar = /foreach\s*\(\s*\$(\w+)\s+in\s+\$(\w+)\s*\)/gi;
  while ((am = loopVar.exec(text))) if (vars.has(am[2].toLowerCase())) vars.set(am[1].toLowerCase(), vars.get(am[2].toLowerCase()));
  for (const line of text.split(/\r?\n|[{}]/)) {
    for (let seg of line.split(/\s*(?:;|&&|\|\||\|)\s*/)) {
      const kw = /^\s*(?:if|elseif|while|foreach|for|switch)\s*\((.*)\)\s*$/i.exec(seg);
      if (kw) seg = kw[1].replace(/^\$\w+\s+in\s+/i, "");
      try { ocDescSegment(seg, acts, vars); } catch { }
    }
  }
  return acts;
}
function ocDescJoin(acts) {
  const seen = new Set();
  const groups = new Map();
  for (const [verb, obj] of acts) {
    const key = verb + "\0" + obj;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!groups.has(verb)) groups.set(verb, []);
    if (obj) groups.get(verb).push(obj);
  }
  const parts = [];
  for (const [verb, objs] of groups) {
    if (!objs.length) parts.push(verb);
    else if (objs.length <= 2) parts.push(verb + " " + objs.join("、"));
    else parts.push(verb + " " + objs.slice(0, 2).join("、") + " 等 " + objs.length + " 个");
  }
  if (!parts.length) return "";
  return parts.length > 3 ? parts.slice(0, 3).join(" · ") + " 等" : parts.join(" · ");
}
// 返回一句短话；认不出时返回 undefined（沿用原来的「正在运行 X」）
function ocDescribeToolCall(toolName, input) {
  try {
    if (typeof input === "string") {
      try { input = JSON.parse(input); } catch { input = { command: input }; }
    }
    if (!input || typeof input !== "object") return void 0;
    const name = String(toolName || "").toLowerCase();
    const cmd = input.command ?? input.cmd ?? input.script ?? input.commandLine;
    if (typeof cmd === "string" && cmd.trim()) {
      const s = ocDescJoin(ocDescribeCommand(cmd));
      if (s) return s;
      const first = cmd.trim().split(/\r?\n/)[0];
      return "运行 " + (first.length > 40 ? first.slice(0, 39) + "…" : first);
    }
    const mode = String(input.mode ?? input.action ?? input.operation ?? "").toLowerCase();
    const p = ocDescShort(input.path ?? input.file ?? input.filePath ?? input.file_path ?? input.target ?? input.directory ?? input.dir ?? "");
    const q = input.query ?? input.pattern ?? input.regex ?? input.search;
    const verbs = { list: "列出", ls: "列出", tree: "遍历", read: "读", view: "读", cat: "读", write: "写", create: "新建", append: "追加", edit: "改", replace: "改", patch: "改", delete: "删除", remove: "删除", copy: "复制", move: "移动", rename: "重命名", search: "搜索", find: "搜索", grep: "搜索", info: "查看", stat: "查看", exists: "检查", mkdir: "新建目录" };
    let verb = verbs[mode];
    if (!verb) {
      for (const k of Object.keys(verbs)) {
        if (new RegExp("(^|[_\\-.])" + k + "($|[_\\-.]|file|dir)", "i").test(name)) { verb = verbs[k]; break; }
      }
    }
    if (verb === "搜索" || (!verb && typeof q === "string" && q)) {
      const qs = typeof q === "string" && q ? "“" + (q.length > 30 ? q.slice(0, 29) + "…" : q) + "”" : "";
      return ["搜索", qs + (p ? "（" + p + "）" : "")].filter(Boolean).join(" ");
    }
    if (verb && p) return verb + " " + p;
    const url = input.url ?? input.uri;
    if (typeof url === "string") {
      const h = /^https?:\/\/([^/?#]+)/i.exec(url);
      if (h) return "请求 " + h[1];
    }
    return void 0;
  } catch {
    return void 0;
  }
}

function createToolPresentation(invocation, output2, options) {
  const rawOutput = options.isComplete ? boundedTechnicalText(output2 ?? "") : "";
  const technicalInput = boundedTechnicalText(invocation.args);
  const parsed = options.isComplete && typeof output2 === "string" ? invocation.toolName === "find_files" ? findFilesPresentation(output2, options.workspaceRoot, options.durationMs) : invocation.toolName === "search_files" ? searchFilesPresentation(output2, options.workspaceRoot, options.durationMs) : invocation.toolName === "read_files" ? readFilesPresentation(output2, options.workspaceRoot, options.durationMs) : invocation.toolName === "apply_patch" && !options.isError ? applyPatchPresentation(output2, options.workspaceRoot, options.durationMs) : invocation.toolName === "list_directory" ? listDirectoryPresentation(output2, options.workspaceRoot, options.durationMs, invocation.args) : invocation.toolName === "get_diagnostics" ? diagnosticsPresentation(output2, options.workspaceRoot, options.durationMs) : invocation.toolName === "lsp" ? lspPresentation(output2, options.workspaceRoot, options.durationMs, invocation.args) : ["run_command", "get_command_output", "send_command_input"].includes(invocation.toolName) ? terminalPresentation(output2, options.durationMs, invocation.args, invocation.toolName) : invocation.toolName === "wait" ? waitPresentation(output2, options.durationMs) : void 0 : void 0;
  const presentation = parsed ?? runningPresentation(invocation.toolName, invocation.args, options.workspaceRoot);
  // OpenCode: 命令和常见工具翻成一句短话（读 a.js · 搜索 “x” · git status），不再全是 Running/Ran 原命令
  const ocDesc = ocDescribeToolCall(invocation.toolName, invocation.args);
  const ocUseDesc = !!ocDesc && (invocation.toolName === "run_command" || presentation.title === `${invocation.toolName} running` || /^(Ran|Running) /.test(presentation.title));
  const ocTitle = ocUseDesc ? options.isComplete ? ocDesc : `${ocDesc}…` : presentation.title;
  const failedTitle = options.isError ? ocDesc ? `${ocDesc} · 失败` : `${invocation.toolName} failed` : ocTitle;
  const failureCode = options.isError ? rawOutput.match(/\b(?:INVALID_ARGUMENT|INVALID_GLOB|PATH_OUTSIDE_WORKSPACE|FILE_NOT_FOUND|PERMISSION_DENIED|ABORTED|IO_ERROR)\b/)?.[0] : void 0;
  const kind = presentationKind(invocation.toolName);
  return {
    title: failedTitle,
    data: {
      input: options.isError || kind === "generic" ? technicalInput : "",
      output: options.isError ? rawOutput : presentation.output ?? (kind === "generic" ? rawOutput : ""),
      presentationStyle: options.useOpenCodeStyle ? "opencode" : void 0,
      presentationKind: kind,
      isError: Boolean(options.isError),
      durationMs: options.durationMs,
      terminalId: presentation.terminalId,
      diff: presentation.diff,
      diffPreview: presentation.diffPreview,
      summary: options.isError ? `${failureCode ? `Error ${failureCode}. ` : ""}The tool did not complete successfully. Open technical details for the reported error.` : presentation.summary,
      detailsLabel: "Technical details",
      items: presentation.items,
      metrics: options.isComplete ? presentation.metrics : void 0
    }
  };
}
export { presentationKind, field2, integerField, parseJsonString, blockBetween2, relativeResource, durationMetric, formatDurationMs, withOverflowItem, findFilesPresentation, searchFilesPresentation, readFilesPresentation, applyPatchPresentation, diffPath2, parseUnifiedDiffPreview2, listDirectoryPresentation, diagnosticsPresentation, lspPresentation, terminalPresentation, waitPresentation, runningPresentation, createToolPresentation, vscode18, MAX_PREVIEW_ITEMS, MAX_DIFF_PREVIEW_FILES2, MAX_DIFF_PREVIEW_HUNKS_PER_FILE2, MAX_DIFF_PREVIEW_LINES_PER_HUNK2 };
