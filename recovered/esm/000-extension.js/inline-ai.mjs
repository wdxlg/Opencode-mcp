// inline-ai-step01: 编辑器内的 AI，像 Cursor 的 Tab 补全和 Ctrl+K 行内修改。
// · Tab 补全：停止输入片刻后，用 OpenCode 已接入的模型（vscode.lm，vendor opencode / opencode-codex）预测光标处要写的代码，
//   以灰色幽灵文本显示，按 Tab 接受。状态栏「Tab AI」可开关；偏好的模型、开关存在 ~/.opencode/inline-ai.json。
// · 行内修改（Ctrl+I）：选中代码后描述要怎么改，AI 直接改写选区并高亮；不选中时在光标处生成。改完弹出「接受 / 撤销」。
import { __toESM } from "./module-0000.mjs";
var vscodeI = __toESM(require("vscode"));
var fsI = __toESM(require("node:fs"));
var pathI = __toESM(require("node:path"));
var osI = __toESM(require("node:os"));

const SETTINGS_FILE = pathI.join(osI.homedir(), ".opencode", "inline-ai.json");
const VENDORS = ["opencode", "opencode-codex"];
const FAST_MODEL = /mini|flash|haiku|lite|fast|nano|small|turbo/i;
// inline-ai-follow-chat: no stored pick (tabModel/editModel unset) = follow the native Chat model.
const AUTO_MODEL = "__auto__";

/** Model for Tab / Ctrl+I. An explicit pick made with opencode.inlineAi.pickModel wins; otherwise follow the model
 * the native OpenCode Chat last used (vendor + id, reported by module-0177 on every turn); if that model is not
 * available (or Chat was never used), fall back to the old automatic choice (fast model for Tab). */
export function resolveInlineModel(all, kind, settings = {}, chatModel) {
  if (!Array.isArray(all) || !all.length) return void 0;
  const pref = kind === "tab" ? settings?.tabModel : settings?.editModel;
  if (pref && pref !== AUTO_MODEL) { const m = all.find((x) => x.id === pref || x.name === pref); if (m) return m; }
  if (!pref && chatModel && typeof chatModel.id === "string" && chatModel.id) {
    const m = all.find((x) => x.id === chatModel.id && (!chatModel.vendor || x.vendor === chatModel.vendor)) || all.find((x) => x.id === chatModel.id);
    if (m) return m;
  }
  if (kind === "tab") return all.find((m) => FAST_MODEL.test(`${m.id} ${m.name} ${m.family}`)) || all[0];
  return all[0];
}

function readSettings() {
  try { return { tab: true, ...JSON.parse(fsI.readFileSync(SETTINGS_FILE, "utf8")) }; } catch { return { tab: true }; }
}
function writeSettings(s) {
  try { fsI.mkdirSync(pathI.dirname(SETTINGS_FILE), { recursive: true }); fsI.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2)); } catch {}
}

export function stripFences(text) {
  let t = String(text ?? "");
  const m = /```[^\n`]*\n([\s\S]*?)\n?```/.exec(t);
  if (m) t = m[1];
  return t.replace(/^\s*<cursor>\s*/i, "");
}

/** Drop the part of a completion that merely repeats the text already after the cursor. */
export function trimAgainstSuffix(completion, suffix) {
  let c = completion;
  const s = String(suffix || "");
  const firstSuffixLine = s.split(/\r?\n/)[0].trim();
  if (firstSuffixLine && c.trimEnd().endsWith(firstSuffixLine)) c = c.trimEnd().slice(0, c.trimEnd().length - firstSuffixLine.length);
  const nextLines = s.split(/\r?\n/).slice(1, 4).map((l) => l.trim()).filter(Boolean);
  if (nextLines.length) {
    const lines = c.split(/\r?\n/);
    const at = lines.findIndex((l, i) => i > 0 && l.trim() && l.trim() === nextLines[0]);
    if (at > 0) c = lines.slice(0, at).join("\n");
  }
  return c.replace(/\s+$/, (ws) => (ws.includes("\n") ? "" : ws));
}

class InlineAi {
  constructor(log) {
    this.log = log || (() => {});
    this.settings = readSettings();
    // module-0177 reports the model of each native Chat turn here; the last one is remembered across restarts.
    globalThis.__ocOnNativeChatModel = (m) => this.noteChatModel(m);
    if (globalThis.__ocNativeChatModel) this.noteChatModel(globalThis.__ocNativeChatModel);
    this.lastRequestAt = 0;
    this.cache = { key: "", text: "" };
    this.subscriptions = [];
    this.pendingDecoration = vscodeI.window.createTextEditorDecorationType({ backgroundColor: new vscodeI.ThemeColor("diffEditor.insertedTextBackground"), isWholeLine: false });
    this.status = vscodeI.window.createStatusBarItem(vscodeI.StatusBarAlignment.Right, 101);
    this.status.command = "opencode.inlineAi.toggleTab";
    this.renderStatus();
    this.status.show();
    const reg = (id, fn) => this.subscriptions.push(vscodeI.commands.registerCommand(id, fn));
    reg("opencode.inlineAi.toggleTab", () => this.toggleTab());
    reg("opencode.inlineAi.pickModel", () => this.pickModelSetting());
    reg("opencode.inlineEdit", () => this.inlineEdit());
    this.subscriptions.push(vscodeI.languages.registerInlineCompletionItemProvider({ pattern: "**" }, { provideInlineCompletionItems: (doc, pos, ctx, token) => this.complete(doc, pos, ctx, token) }));
  }
  renderStatus() {
    this.status.text = this.settings.tab ? "$(sparkle) Tab AI" : "$(circle-slash) Tab AI";
    const chat = this.settings.chatModel;
    const label = (pref) => pref === AUTO_MODEL ? "自动" : pref || `跟随对话模型（${chat ? chat.name || chat.id : "尚未使用对话"}）`;
    this.status.tooltip = `AI 代码补全：${this.settings.tab ? "已开启" : "已关闭"}（点击切换）\n行内修改：选中代码后按 Ctrl+I\n模型：补全 ${label(this.settings.tabModel)} · 修改 ${label(this.settings.editModel)}\n换模型：命令 opencode.inlineAi.pickModel`;
  }
  toggleTab() {
    this.settings.tab = !this.settings.tab;
    writeSettings(this.settings);
    this.renderStatus();
    void vscodeI.window.setStatusBarMessage(this.settings.tab ? "AI 代码补全已开启" : "AI 代码补全已关闭", 2500);
  }
  async models() {
    const groups = await Promise.allSettled(VENDORS.map((vendor) => vscodeI.lm.selectChatModels({ vendor })));
    return groups.flatMap((g) => (g.status === "fulfilled" ? g.value : []));
  }
  noteChatModel(m) {
    if (!m || typeof m.id !== "string" || !m.id) return;
    const next = { vendor: typeof m.vendor === "string" ? m.vendor : "", id: m.id, ...(typeof m.name === "string" && m.name ? { name: m.name } : {}) };
    const cur = this.settings.chatModel;
    if (cur && cur.id === next.id && cur.vendor === next.vendor && cur.name === next.name) return;
    this.settings.chatModel = next;
    writeSettings(this.settings);
    this.renderStatus();
  }
  async pickModel(kind) {
    return resolveInlineModel(await this.models(), kind, this.settings, globalThis.__ocNativeChatModel || this.settings.chatModel);
  }
  async pickModelSetting() {
    const all = await this.models();
    if (!all.length) { void vscodeI.window.showWarningMessage("还没有可用的模型：先在 OpenCode 里配置模型。"); return; }
    const kind = await vscodeI.window.showQuickPick([{ label: "Tab 补全用的模型", kind: "tab" }, { label: "行内修改（Ctrl+I）用的模型", kind: "edit" }], { title: "选择要设置的功能" });
    if (!kind) return;
    const chat = globalThis.__ocNativeChatModel || this.settings.chatModel;
    const pick = await vscodeI.window.showQuickPick([{ label: "跟随对话模型", description: chat ? `当前对话：${chat.name || chat.id}` : "对话里选的模型（尚未使用对话时自动选择）", id: "" }, { label: "自动", description: kind.kind === "tab" ? "优先快速模型" : "第一个可用模型", id: AUTO_MODEL }, ...all.map((m) => ({ label: m.name || m.id, description: `${m.vendor} · ${m.id}`, id: m.id }))], { title: kind.label });
    if (!pick) return;
    if (kind.kind === "tab") this.settings.tabModel = pick.id || void 0; else this.settings.editModel = pick.id || void 0;
    writeSettings(this.settings);
    this.renderStatus();
  }
  async ask(model, prompt, token) {
    const res = await model.sendRequest([vscodeI.LanguageModelChatMessage.User(prompt)], { justification: "OpenCode 编辑器内 AI" }, token);
    let out = "";
    for await (const part of res.text) { out += part; if (token?.isCancellationRequested) break; }
    return out;
  }
  async complete(doc, pos, ctx, token) {
    try {
      if (!this.settings.tab || !["file", "untitled", "vscode-notebook-cell"].includes(doc.uri.scheme)) return void 0;
      if (ctx?.selectedCompletionInfo) return void 0;
      if (doc.lineCount > 50000) return void 0;
      const offset = doc.offsetAt(pos);
      const text = doc.getText();
      const prefix = text.slice(Math.max(0, offset - 4000), offset);
      const suffix = text.slice(offset, offset + 1500);
      const linePrefix = doc.lineAt(pos.line).text.slice(0, pos.character);
      const lineSuffix = doc.lineAt(pos.line).text.slice(pos.character);
      if (/\S/.test(lineSuffix) && !/^[\s)\]}"'`;,]*$/.test(lineSuffix)) return void 0; // 光标在一行中间：不打扰
      const key = `${doc.uri.toString()}|${doc.version}|${offset}`;
      if (this.cache.key === key) return this.cache.text ? [new vscodeI.InlineCompletionItem(this.cache.text, new vscodeI.Range(pos, pos))] : void 0;
      // 抖动：等用户停手。
      const isAuto = ctx?.triggerKind !== vscodeI.InlineCompletionTriggerKind?.Invoke;
      await new Promise((r) => setTimeout(r, isAuto ? 450 : 0));
      if (token.isCancellationRequested) return void 0;
      if (isAuto && !linePrefix.trim() && !prefix.trim()) return void 0;
      const model = await this.pickModel("tab");
      if (!model || token.isCancellationRequested) return void 0;
      const prompt = [
        "You are a code completion engine inside an IDE. Continue the code at <CURSOR>.",
        "Reply with ONLY the exact text to insert at <CURSOR>: no explanation, no markdown fences, do not repeat text that is before or after the cursor.",
        "Prefer finishing the current statement or block; at most 12 lines. If nothing sensible should be inserted, reply with an empty message.",
        `File: ${vscodeI.workspace.asRelativePath(doc.uri)} (language: ${doc.languageId})`,
        "<CODE>",
        `${prefix}<CURSOR>${suffix}`,
        "</CODE>"
      ].join("\n");
      this.lastRequestAt = Date.now();
      let out = await this.ask(model, prompt, token);
      if (token.isCancellationRequested) return void 0;
      out = trimAgainstSuffix(stripFences(out), suffix);
      if (out.trim() && linePrefix && out.startsWith(linePrefix.trimStart()) && linePrefix.trim()) out = out.slice(linePrefix.trimStart().length);
      out = out.split(/\r?\n/).slice(0, 12).join("\n");
      this.cache = { key, text: out.trim() ? out : "" };
      if (!out.trim()) return void 0;
      return [new vscodeI.InlineCompletionItem(out, new vscodeI.Range(pos, pos))];
    } catch (error) {
      if (!token?.isCancellationRequested) this.log(`[inline-ai] 补全失败：${error?.message ?? error}`);
      return void 0;
    }
  }
  async inlineEdit() {
    const editor = vscodeI.window.activeTextEditor;
    if (!editor) { void vscodeI.window.showInformationMessage("先打开一个文件再用行内修改。"); return; }
    const doc = editor.document;
    const sel = editor.selection;
    const generating = sel.isEmpty;
    const instruction = await vscodeI.window.showInputBox({
      title: generating ? "AI 在光标处生成代码" : "AI 修改选中的代码",
      prompt: "描述要做什么，回车执行（Esc 取消）",
      placeHolder: generating ? "例如：写一个带取消功能的防抖函数" : "例如：改成 async/await 并处理错误",
      ignoreFocusOut: true
    });
    if (!instruction?.trim()) return;
    const model = await this.pickModel("edit");
    if (!model) { void vscodeI.window.showWarningMessage("还没有可用的模型：先在 OpenCode 里配置模型。"); return; }
    const range = generating ? new vscodeI.Range(sel.active, sel.active) : new vscodeI.Range(sel.start, sel.end);
    const original = doc.getText(range);
    const before = doc.getText(new vscodeI.Range(new vscodeI.Position(Math.max(0, range.start.line - 80), 0), range.start));
    const after = doc.getText(new vscodeI.Range(range.end, new vscodeI.Position(Math.min(doc.lineCount - 1, range.end.line + 40), 1e6)));
    const prompt = [
      generating ? "You write code to insert at <INSERT_HERE> in the file below." : "You rewrite the code between <SELECTION> and </SELECTION> in the file below.",
      `Instruction from the user: ${instruction.trim()}`,
      generating ? "Reply with ONLY the code to insert, matching the file's indentation and style." : "Reply with ONLY the full replacement for the selected code, keeping the original indentation; keep code outside the selection unchanged.",
      "No explanation, no markdown fences.",
      `File: ${vscodeI.workspace.asRelativePath(doc.uri)} (language: ${doc.languageId})`,
      "<FILE>",
      generating ? `${before}<INSERT_HERE>${after}` : `${before}<SELECTION>${original}</SELECTION>${after}`,
      "</FILE>"
    ].join("\n");
    let result;
    try {
      result = await vscodeI.window.withProgress({ location: vscodeI.ProgressLocation.Notification, title: `AI 正在${generating ? "生成" : "修改"}（${model.name || model.id}）…`, cancellable: true }, async (_p, token) => {
        const cts = new vscodeI.CancellationTokenSource();
        token.onCancellationRequested(() => cts.cancel());
        const out = await this.ask(model, prompt, cts.token);
        return token.isCancellationRequested ? void 0 : stripFences(out);
      });
    } catch (error) {
      void vscodeI.window.showErrorMessage(`AI 修改失败：${error?.message ?? error}`);
      return;
    }
    if (result === void 0) return;
    if (!generating && original.endsWith("\n") && !result.endsWith("\n")) result += "\n";
    if (doc.isClosed) return;
    const startOffset = doc.offsetAt(range.start);
    const ok = await editor.edit((b) => b.replace(range, result));
    if (!ok) { void vscodeI.window.showErrorMessage("AI 修改没能写入编辑器（文件可能已变化）。"); return; }
    const newRange = new vscodeI.Range(doc.positionAt(startOffset), doc.positionAt(startOffset + result.length));
    editor.setDecorations(this.pendingDecoration, [newRange]);
    editor.revealRange(newRange, vscodeI.TextEditorRevealType.InCenterIfOutsideViewport);
    const choice = await vscodeI.window.showInformationMessage(generating ? "AI 已插入代码。" : "AI 已修改选中的代码。", "接受", "撤销");
    editor.setDecorations(this.pendingDecoration, []);
    if (choice === "撤销") {
      const current = doc.getText(newRange);
      if (current === result) await editor.edit((b) => b.replace(newRange, original));
      else void vscodeI.window.showWarningMessage("这段代码之后又被改过，没有自动撤销；可以用 Ctrl+Z。");
    }
  }
}

let instance;
export function activateInlineAi(options = {}) {
  if (instance || globalThis.__ocInlineAiActive) return instance;
  globalThis.__ocInlineAiActive = true;
  instance = new InlineAi(options.log);
  return instance;
}
