// context-default-dsh 自检（不是测试套件）：只读源码，检查 dsh 目录查找函数与提供商编辑器提示函数。用法：node tasks/context-default-dsh-20261118/selfcheck.mjs
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ext = path.join(root, "recovered", "esm", "000-extension.js");
const src174 = fs.readFileSync(path.join(ext, "module-0174.mjs"), "utf8").replace(/^import .*$/gm, "").replace(/^init_define_OPENCODE_BUILD_INFO\(\);$/m, "").replace(/^export \{([^}]*)\};?\s*$/m, "return {$1};");
const M = new Function(src174)();
let fail = 0; const eq = (name, got, want) => { const ok = got === want; if (!ok) fail++; console.log(`${ok ? "OK  " : "FAIL"} ${name}: ${got}${ok ? "" : " (want " + want + ")"}`); };
eq("unknown model fallback", M.dshDefaultContextWindow("my-model", "https://example.com/v1"), 262144);
eq("DEFAULT_API_CONTEXT_WINDOW", M.DEFAULT_API_CONTEXT_WINDOW, 262144);
eq("DEFAULT_CODEX_CONTEXT_WINDOW", M.DEFAULT_CODEX_CONTEXT_WINDOW, 262144);
eq("deepseek official catalog", M.dshDefaultContextWindow("deepseek-v4-pro", "https://api.deepseek.com"), 1048576);
eq("deepseek official other id", M.dshDefaultContextWindow("deepseek-chat", "https://api.deepseek.com/v1"), 1e6);
eq("openai gpt-5.5", M.dshDefaultContextWindow("gpt-5.5", "https://api.openai.com/v1"), 272000);
eq("openai gpt-4.1", M.dshDefaultContextWindow("gpt-4.1", "https://api.openai.com/v1"), 1047576);
eq("codex gpt-5.3-codex-spark", M.dshDefaultContextWindow("gpt-5.3-codex-spark", "https://chatgpt.com/backend-api/codex"), 128000);
eq("anthropic claude-sonnet-4-6", M.dshDefaultContextWindow("claude-sonnet-4-6", "https://api.anthropic.com"), 1000000);
eq("google gemini-2.5-pro", M.dshDefaultContextWindow("gemini-2.5-pro", "https://generativelanguage.googleapis.com/v1beta"), 1048576);
eq("kimi-k2.6 (moonshot.cn)", M.dshDefaultContextWindow("kimi-k2.6", "https://api.moonshot.cn/v1"), 262144);
eq("glm-5.3 (bigmodel)", M.dshDefaultContextWindow("glm-5.3", "https://open.bigmodel.cn/api/coding/paas/v4"), 1000000);
eq("exact id only (case)", M.dshDefaultContextWindow("GPT-5.5", "https://api.openai.com/v1"), 262144);
eq("proxy host not in catalog", M.dshDefaultContextWindow("gpt-5.5", "https://openrouter.ai/api/v1"), 262144);
eq("prototype key", M.dshDefaultContextWindow("constructor", "https://api.openai.com/v1"), 262144);
// 提供商编辑器提示：从 module-0161 的 OC_PROV_JS 里取出 pDefCw 并运行
const s161 = fs.readFileSync(path.join(ext, "module-0161.mjs"), "utf8");
const a = s161.indexOf('const P_DSH_CW=" + DSH_CONTEXT_CATALOG_JSON + "'), b = s161.indexOf("\\nfunction renderModels", a);
eq("0161 catalog injection present", a > 0 && b > a, true);
eq("0161 pDefCw(m.id) calls", s161.split("'+pDefCw(m.id)+'").length - 1, 3);
const tail = JSON.parse('"' + s161.slice(a + 'const P_DSH_CW=" + DSH_CONTEXT_CATALOG_JSON + "'.length, b) + '"');
for (const [url, id, want] of [["https://api.openai.com/v1", "gpt-5.5", "272K（dsh 目录）"], ["https://api.deepseek.com", "deepseek-flash", "1M（dsh 目录）"], ["https://api.deepseek.com", "x", "1M（DeepSeek 官方）"], ["https://example.com/v1", "x", "256K"], ["", "x", "256K"]]) {
  const fn = new Function("$", "pTokText", "const P_DSH_CW=" + M.DSH_CONTEXT_CATALOG_JSON + tail + "\nreturn pDefCw;")((k) => ({ value: url }), String);
  eq(`editor hint ${url || "(empty)"} ${id}`, fn(id), want);
}
console.log(fail ? `${fail} FAILED` : "all self-checks passed");
process.exitCode = fail ? 1 : 0;
