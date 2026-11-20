// goal-loop-step01: 目标驱动循环（参照 dsh workflow/goal、ralph）。
// 用法：/goal 目标 [--check "验收命令"] [--max 轮数]
// 每轮 agent 结束后：有验收命令就在工作区运行，退出码 0 即完成；没有就看模型最后一行的
// GOAL_DONE / GOAL_CONTINUE。未完成则把失败信息作为下一轮用户消息，自动继续，直到完成或到轮数上限。
import { spawn, spawnSync } from "node:child_process";

export const GOAL_DEFAULT_MAX_ROUNDS = 5;
export const GOAL_HARD_MAX_ROUNDS = 50;
const TAIL_CHARS = 4000;

export function parseGoalRequest(command, prompt) {
  let text = String(prompt ?? "");
  if (command !== "goal") {
    if (command) return null;
    const m = /^\s*\/goal\b/i.exec(text);
    if (!m) return null;
    text = text.slice(m[0].length);
  }
  let check;
  let max;
  text = text.replace(/(^|\s)--max(?:=|\s+)(\d+)/i, (_all, lead, n) => {
    max = Number(n);
    return lead;
  });
  // 带引号时取引号内；不带引号时取到行尾（验收命令通常写在最后，可以含空格）
  text = text.replace(/(^|\s)--check(?:=|\s+)(?:"([^"]*)"|'([^']*)'|`([^`]*)`|([^\r\n]+))/i, (_all, lead, a, b, c, d) => {
    check = a ?? b ?? c ?? d;
    return lead;
  });
  const goal = text.trim();
  if (!goal) return { error: "usage" };
  return { goal, check: typeof check === "string" && check.trim() ? check.trim() : void 0, max };
}

export function goalMaxRounds(parsed, configured) {
  const pick = [parsed?.max, configured].find((value) => value !== void 0 && value !== null && String(value).trim() !== "");
  const n = pick === void 0 ? GOAL_DEFAULT_MAX_ROUNDS : Math.floor(Number(pick));
  if (!Number.isFinite(n) || n < 1) return GOAL_DEFAULT_MAX_ROUNDS;
  return Math.min(n, GOAL_HARD_MAX_ROUNDS);
}

export const GOAL_USAGE = "用法：`/goal 目标 [--check \"验收命令\"] [--max 轮数]`\n\n例如：`/goal 修好登录页的所有单元测试 --check \"npm test\" --max 8`\n\n有验收命令时，每轮结束后在工作区运行它，退出码 0 即完成；没有验收命令时由模型在最后一行写 `GOAL_DONE` 表示完成。";

export function goalRoundPrompt(parsed, round, max, verdict) {
  const acceptance = parsed.check
    ? `验收方式：每轮结束后系统会在工作区运行 \`${parsed.check}\`，退出码为 0 才算完成。不需要你自己宣布完成，但请在结束本轮前自己先跑一遍验收命令确认。`
    : "验收方式：本轮结束时，如果目标已完全达成，在回答最后单独一行写 `GOAL_DONE`；如果还没完成、需要继续，最后单独一行写 `GOAL_CONTINUE: 下一步要做什么`。";
  if (round <= 1) {
    return [
      `【目标循环 第 1/${max} 轮】`,
      `目标：${parsed.goal}`,
      acceptance,
      "这一轮尽量多推进，不要停下来问确认；遇到真正无法自行决定的问题再说明。"
    ].join("\n\n");
  }
  return [
    `【目标循环 第 ${round}/${max} 轮】目标还没达成，继续。`,
    `目标：${parsed.goal}`,
    verdict?.feedback ? `上一轮的验收结果：\n${verdict.feedback}` : "",
    acceptance,
    "先根据上面的结果找出原因，再修复；不要重复已经做过且无效的尝试。"
  ].filter(Boolean).join("\n\n");
}

function tail(text, n = TAIL_CHARS) {
  const s = String(text ?? "");
  return s.length > n ? `…（前面省略 ${s.length - n} 字）\n${s.slice(-n)}` : s;
}

export function goalSelfVerdict(answer) {
  const lines = String(answer ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0 && i >= lines.length - 6; i -= 1) {
    const m = /^[`*>\s]*GOAL_(DONE|CONTINUE)\b[`*]*\s*:?\s*(.*)$/i.exec(lines[i]);
    if (!m) continue;
    if (m[1].toUpperCase() === "DONE") return { ok: true, summary: "模型确认目标已完成" };
    const reason = m[2].trim();
    return { ok: false, summary: reason ? `模型表示还需继续：${reason.slice(0, 200)}` : "模型表示还需继续", feedback: reason ? `你上一轮说还需要：${reason}` : "你上一轮表示还没完成。" };
  }
  return {
    ok: false,
    summary: "上一轮没有给出 GOAL_DONE / GOAL_CONTINUE",
    feedback: "上一轮结尾没有写 GOAL_DONE 或 GOAL_CONTINUE。如果目标确实已完全达成，请核对后只回复一行 GOAL_DONE；否则继续完成剩余工作。"
  };
}

function killTree(child) {
  if (!child?.pid) return;
  try {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true });
    else child.kill("SIGKILL");
  } catch {}
}

export function runGoalCheck(command, cwd, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 6e5;
  return new Promise((resolve) => {
    let out = "";
    let settled = false;
    let child;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { cancelSub?.dispose?.(); } catch {}
      resolve(value);
    };
    try {
      child = spawn(command, { cwd, shell: true, windowsHide: true, env: { ...process.env, CI: process.env.CI ?? "1" } });
    } catch (error) {
      resolve({ ok: false, code: null, summary: `验收命令无法启动：${error?.message || error}`, feedback: `验收命令 \`${command}\` 无法启动：${error?.message || error}` });
      return;
    }
    const append = (chunk) => {
      out += chunk.toString();
      if (out.length > TAIL_CHARS * 4) out = out.slice(-TAIL_CHARS * 2);
    };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);
    const timer = setTimeout(() => {
      killTree(child);
      finish({ ok: false, code: null, timedOut: true, summary: `验收命令超时（${Math.round(timeoutMs / 1e3)} 秒）`, feedback: `验收命令 \`${command}\` 运行超过 ${Math.round(timeoutMs / 1e3)} 秒被终止。输出末尾：\n\`\`\`\n${tail(out)}\n\`\`\`` });
    }, timeoutMs);
    const cancelSub = options.token?.onCancellationRequested?.(() => {
      killTree(child);
      finish({ ok: false, code: null, canceled: true, summary: "已取消", feedback: "" });
    });
    child.on("error", (error) => finish({ ok: false, code: null, summary: `验收命令出错：${error?.message || error}`, feedback: `验收命令 \`${command}\` 出错：${error?.message || error}` }));
    child.on("close", (code) => {
      if (code === 0) finish({ ok: true, code, summary: "验收命令通过" });
      else finish({ ok: false, code, summary: `验收命令退出码 ${code}`, feedback: `验收命令 \`${command}\` 退出码 ${code}。输出末尾：\n\`\`\`\n${tail(out)}\n\`\`\`` });
    });
  });
}
