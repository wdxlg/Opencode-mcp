// usage-ledger-step01: 模型用量统计（像 Cursor 的 Usage 页）。
// 原生对话每轮结束时把 token 用量记到 ~/.opencode/usage/YYYY-MM.jsonl（只记数字、模型和时间，不记内容）；
// 命令「OpenCode：模型用量统计」按今天 / 近 7 天 / 近 30 天、按模型汇总，在编辑器里显示。
import { __toESM } from "./module-0000.mjs";
var vscodeU = __toESM(require("vscode"));
var fsU = __toESM(require("node:fs"));
var pathU = __toESM(require("node:path"));
var osU = __toESM(require("node:os"));

export const USAGE_DIR = pathU.join(osU.homedir(), ".opencode", "usage");

function monthFile(date, dir = USAGE_DIR) {
  return pathU.join(dir, `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}.jsonl`);
}
const n = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : 0);

export function recordUsage(entry, options = {}) {
  try {
    const at = options.now ? options.now() : new Date();
    const dir = options.dir || USAGE_DIR;
    const row = {
      at: at.toISOString(),
      source: String(entry.source || "native-chat"),
      provider: entry.provider ? String(entry.provider).slice(0, 80) : void 0,
      models: (Array.isArray(entry.models) && entry.models.length ? entry.models : [entry.model || "unknown"]).map((m) => String(m).slice(0, 120)).slice(0, 4),
      input: n(entry.input), output: n(entry.output), cacheRead: n(entry.cacheRead), cacheWrite: n(entry.cacheWrite), reasoning: n(entry.reasoning),
      steps: n(entry.steps), durationMs: n(entry.durationMs)
    };
    fsU.mkdirSync(dir, { recursive: true });
    fsU.appendFileSync(monthFile(at, dir), JSON.stringify(row) + "\n");
    return row;
  } catch {
    return void 0;
  }
}

export function readUsage(days, options = {}) {
  const dir = options.dir || USAGE_DIR;
  const now = options.now ? options.now() : new Date();
  const since = new Date(now.getTime() - days * 864e5);
  const rows = [];
  for (let d = new Date(since.getFullYear(), since.getMonth(), 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    let text = "";
    try { text = fsU.readFileSync(monthFile(d, dir), "utf8"); } catch { continue; }
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try { const row = JSON.parse(line); if (new Date(row.at) >= since) rows.push(row); } catch {}
    }
  }
  return rows;
}

export function summarizeUsage(rows) {
  const byModel = new Map();
  const total = { turns: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, tokens: 0 };
  for (const r of rows) {
    const key = r.models?.[0] || "unknown";
    const m = byModel.get(key) || { model: key, provider: r.provider, turns: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, tokens: 0 };
    for (const t of [m, total]) {
      t.turns += 1; t.input += r.input || 0; t.output += r.output || 0; t.cacheRead += r.cacheRead || 0; t.cacheWrite += r.cacheWrite || 0;
      t.tokens += (r.input || 0) + (r.output || 0) + (r.cacheRead || 0) + (r.cacheWrite || 0);
    }
    byModel.set(key, m);
  }
  return { total, models: [...byModel.values()].sort((a, b) => b.tokens - a.tokens) };
}

const fmt = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : String(v));

export function usageReportMarkdown(options = {}) {
  const sections = [["今天", 1], ["近 7 天", 7], ["近 30 天", 30]];
  const out = ["# OpenCode 模型用量", "", "统计原生对话每一轮的 token（输入 / 输出 / 缓存读 / 缓存写），只记数字。外部 AI 通过 MCP 驱动时的用量算在它自己的账上，不在这里。", ""];
  for (const [label, days] of sections) {
    const s = summarizeUsage(readUsage(days, options));
    out.push(`## ${label}：${s.total.turns} 轮 · ${fmt(s.total.tokens)} tokens（输入 ${fmt(s.total.input)} · 输出 ${fmt(s.total.output)} · 缓存读 ${fmt(s.total.cacheRead)}）`, "");
    if (s.models.length) {
      out.push("| 模型 | 轮数 | 输入 | 输出 | 缓存读 | 缓存写 | 合计 |", "|---|---:|---:|---:|---:|---:|---:|");
      for (const m of s.models) out.push(`| ${m.model}${m.provider ? `（${m.provider}）` : ""} | ${m.turns} | ${fmt(m.input)} | ${fmt(m.output)} | ${fmt(m.cacheRead)} | ${fmt(m.cacheWrite)} | ${fmt(m.tokens)} |`);
      out.push("");
    }
  }
  out.push(`数据目录：${options.dir || USAGE_DIR}`);
  return out.join("\n");
}

// oc-unified-ui-v1: 用量统计改为自绘页面（原 markdown 预览打开为空白）
const escU = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export function usageReportHtml(options = {}) {
  const sections = [["今天", 1], ["近 7 天", 7], ["近 30 天", 30]];
  const parts = [];
  sections.forEach(([label, days], i) => {
    const s = summarizeUsage(readUsage(days, options));
    const rows = s.models.map((m) => `<tr><td>${escU(m.model)}${m.provider ? `<span class="prov">${escU(m.provider)}</span>` : ""}</td><td>${m.turns}</td><td>${fmt(m.input)}</td><td>${fmt(m.output)}</td><td>${fmt(m.cacheRead)}</td><td>${fmt(m.cacheWrite)}</td><td><b>${fmt(m.tokens)}</b></td></tr>`).join("");
    parts.push(`<section style="animation-delay:${i * 40}ms"><header><h2>${label}</h2><div class="kpis"><span><b>${s.total.turns}</b> 轮</span><span><b>${fmt(s.total.tokens)}</b> tokens</span><span>输入 ${fmt(s.total.input)}</span><span>输出 ${fmt(s.total.output)}</span><span>缓存读 ${fmt(s.total.cacheRead)}</span></div></header>${rows ? `<table><thead><tr><th>模型</th><th>轮数</th><th>输入</th><th>输出</th><th>缓存读</th><th>缓存写</th><th>合计</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="empty">这段时间还没有用量。</p>`}</section>`);
  });
  const css = `body{font-family:var(--vscode-font-family);font-size:13px;color:var(--vscode-foreground);background:var(--vscode-editor-background);margin:0;padding:16px 24px 32px}main{max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.top{display:flex;align-items:baseline;gap:10px;padding:4px 0 12px;border-bottom:1px solid var(--vscode-widget-border,var(--vscode-panel-border))}h1{font-size:16px;font-weight:600;margin:0}.sub{font-size:12px;color:var(--vscode-descriptionForeground)}section{border:1px solid var(--vscode-widget-border,var(--vscode-panel-border));border-radius:6px;background:var(--vscode-sideBar-background,var(--vscode-editor-background));padding:12px 14px;animation:ocu-in .2s cubic-bezier(.2,0,0,1) both}header{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}h2{font-size:13px;font-weight:600;margin:0}.kpis{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--vscode-descriptionForeground)}.kpis b{color:var(--vscode-foreground);font-weight:600}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:right;padding:5px 8px;border-bottom:1px solid var(--vscode-widget-border,var(--vscode-panel-border))}th:first-child,td:first-child{text-align:left}th{font-weight:600;color:var(--vscode-descriptionForeground)}tbody tr{transition:background-color .1s cubic-bezier(.2,0,0,1)}tbody tr:hover{background:var(--vscode-list-hoverBackground)}tbody tr:last-child td{border-bottom:0}.prov{margin-left:6px;font-size:11px;color:var(--vscode-descriptionForeground)}.empty{margin:0;font-size:12px;color:var(--vscode-descriptionForeground)}.foot{font-size:11px;color:var(--vscode-descriptionForeground)}code{font-family:var(--vscode-editor-font-family)}@keyframes ocu-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';"><style>${css}</style></head><body><main><div class="top"><h1>模型用量</h1><span class="sub">原生对话每一轮的 token，外部 AI 通过 MCP 驱动时的用量不计在内</span></div>${parts.join("")}<p class="foot">数据目录：<code>${escU(options.dir || USAGE_DIR)}</code></p></main></body></html>`;
}

export function registerUsageCommand() {
  if (globalThis.__ocUsageCommand) return;
  globalThis.__ocUsageCommand = true;
  // perf-first-chat step02: 用量页只在用户执行命令时打开；重启时编辑器恢复出来的旧用量页直接关掉。
  try { vscodeU.window.registerWebviewPanelSerializer?.("opencode.usage", { async deserializeWebviewPanel(panel) { panel.dispose(); } }); } catch {}
  vscodeU.commands.registerCommand("opencode.usage.show", async () => {
    const panel = vscodeU.window.createWebviewPanel("opencode.usage", "模型用量", vscodeU.ViewColumn.Active, { enableScripts: false, retainContextWhenHidden: false });
    panel.iconPath = new vscodeU.ThemeIcon("graph");
    const render = () => { panel.webview.html = usageReportHtml(); };
    render();
    panel.onDidChangeViewState((e) => { if (e.webviewPanel.visible) render(); });
  });
}
