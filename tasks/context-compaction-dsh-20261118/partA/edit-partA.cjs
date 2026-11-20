// context-compaction-dsh PART A (output defaults): all-or-nothing edits with exact-match asserts, after backup.
// Usage: node edit-partA.cjs <root> <backupDir> <block0174.b64>
const fs=require('fs'),path=require('path');
const [root,bak,fblk]=process.argv.slice(2);
const R=p=>path.join(root,p);
const files={
 m174:'recovered/esm/000-extension.js/module-0174.mjs',
 m171:'recovered/esm/000-extension.js/module-0171.mjs',
 m161:'recovered/esm/000-extension.js/module-0161.mjs',
 mts:'recovered/typescript/extensions/opencode/src/model-defaults.mts'};
const orig={},next={};
for(const [k,p] of Object.entries(files)) orig[k]=fs.readFileSync(R(p),'utf8');
const eolOf=s=>s.includes('\r\n')?'\r\n':'\n';
function rep(k,a,b,count=1){const s=next[k]??orig[k];const e=eolOf(orig[k]);if(e!=='\n'){a=a.split('\n').join(e);b=b.split('\n').join(e);}const n=s.split(a).length-1;if(n!==count)throw Error(`${files[k]}: expected ${count} match(es), found ${n}: ${a.slice(0,100)}`);next[k]=s.split(a).join(b);}
const block=Buffer.from(fs.readFileSync(fblk,'utf8').trim(),'base64').toString('utf8');
// ---- 0174: output catalog + dshDefaultMaxOutputTokens
rep('m174','// 提供商编辑器（webview）用的同一份目录\nvar DSH_CONTEXT_CATALOG_JSON', block+'// 提供商编辑器（webview）用的同一份目录\nvar DSH_CONTEXT_CATALOG_JSON');
rep('m174','dshFallbackContextWindow, dshDefaultContextWindow };','dshFallbackContextWindow, dshDefaultContextWindow, DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS, DSH_OUTPUT_CATALOG_JSON, dshCatalogMaxOutputTokens, dshDefaultMaxOutputTokens };');
// ---- 0171
rep('m171','DSH_FALLBACK_CONTEXT_WINDOW, dshDefaultContextWindow } from "./module-0174.mjs";','DSH_FALLBACK_CONTEXT_WINDOW, dshDefaultContextWindow, dshCatalogMaxOutputTokens } from "./module-0174.mjs";');
rep('m171','    next.maxOutputTokensExplicit = true;\n','    next.maxOutputTokensExplicit = true;\n    next.outputReserveTokens = next.maxOutputTokens;\n');
rep('m171','// OpenCode: 提供商窗口里逐个模型的设置。',
`// OpenCode context-compaction-dsh PART A: 输出上限与压缩预留 O 与 dsh 一致（Codex 不走这里）。
// 输出上限：用户填写 > /models 发现（官方 DeepSeek 取 min(256000, 发现值)）> dsh 目录（端点 + 模型 id）> 32768；官方 DeepSeek 未发现时 256000。
// 预留 O：用户填写或发现的值；官方 DeepSeek 默认 256000；其他 0（dsh 通用适配器只在配置了 maxTokens 时报告默认输出）。
function ocDshOutputFields(base, rawModelId, discovered) {
  if (base.maxOutputTokensExplicit === true && base.maxOutputTokens !== void 0) return { maxOutputTokens: base.maxOutputTokens, maxOutputTokensExplicit: true, outputReserveTokens: base.maxOutputTokens };
  if (discovered !== void 0) {
    const value = base.deepSeek ? Math.min(DEEPSEEK_MAX_OUTPUT_TOKENS, discovered) : discovered;
    return { maxOutputTokens: value, maxOutputTokensExplicit: true, outputReserveTokens: value };
  }
  if (base.deepSeek) return { maxOutputTokens: DEEPSEEK_MAX_OUTPUT_TOKENS, maxOutputTokensExplicit: false, outputReserveTokens: DEEPSEEK_MAX_OUTPUT_TOKENS };
  return { maxOutputTokens: dshCatalogMaxOutputTokens(rawModelId, base.baseUrl) ?? DEFAULT_API_MAX_OUTPUT_TOKENS, maxOutputTokensExplicit: false, outputReserveTokens: 0 };
}
// OpenCode context-compaction-dsh PART A: 与 dsh pi-ai 一致，请求的输出上限不超过「窗口 − 输入估算 − 4096」；Codex、官方 DeepSeek（已有自己的预留逻辑）不变。
// 估算偏粗（图片会被高估），所以下限取 min(上限, 4096)，避免把输出压到个位数。
function ocDshOutputCap(config2, maxTokens, payload) {
  if (maxTokens === void 0 || config2.codex || config2.deepSeek || !(config2.contextWindow > 0)) return maxTokens;
  return Math.min(maxTokens, Math.max(Math.min(maxTokens, 4096), config2.contextWindow - estimatedTokens(payload) - 4096));
}

// OpenCode: 提供商窗口里逐个模型的设置。`);
rep('m171','    maxOutputTokensExplicit: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) !== void 0 || base.maxOutputTokensExplicit === true,\n',
'    maxOutputTokensExplicit: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) !== void 0 || base.maxOutputTokensExplicit === true,\n    // OpenCode context-compaction-dsh PART A: 按模型填写的输出上限同时作为压缩预留 O\n    outputReserveTokens: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) ?? base.outputReserveTokens,\n');
rep('m171','      maxOutputTokens: deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : void 0,\n',
'      // OpenCode context-compaction-dsh PART A: 官方 DeepSeek 256000（预留同值）；其他按 dsh 目录 ?? 32768，预留 0\n      maxOutputTokens: deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : dshCatalogMaxOutputTokens(modelOverride || legacy.model, baseUrl) ?? DEFAULT_API_MAX_OUTPUT_TOKENS,\n      outputReserveTokens: deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : 0,\n');
rep('m171','      maxOutputTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? DEFAULT_API_MAX_OUTPUT_TOKENS,\n',
'      // OpenCode context-compaction-dsh PART A: 用户填写 > 官方 DeepSeek 256000 > 32768（具体模型再按 dsh 目录细化，见 ocDshOutputFields）\n      maxOutputTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? (deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : DEFAULT_API_MAX_OUTPUT_TOKENS),\n');
rep('m171','      maxOutputTokensExplicit: optionalInteger(configuration.maxOutputTokens, 1, 1e6) !== void 0,\n',
'      maxOutputTokensExplicit: optionalInteger(configuration.maxOutputTokens, 1, 1e6) !== void 0,\n      // 压缩预留 O：用户填写值；官方 DeepSeek 默认 256000；其他 0\n      outputReserveTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? (deepSeek ? DEEPSEEK_MAX_OUTPUT_TOKENS : 0),\n');
rep('m171','imageInput: true, contextWindow: dshDefaultContextWindow(rawModelId, base.baseUrl) }, metaMap[rawModelId]);',
'imageInput: true, contextWindow: dshDefaultContextWindow(rawModelId, base.baseUrl), ...ocDshOutputFields(base, rawModelId) }, metaMap[rawModelId]);');
rep('m171','        maxOutputTokens: discoveredModel.maxOutputTokens ?? base.maxOutputTokens,\n        maxOutputTokensExplicit: discoveredModel.maxOutputTokens !== void 0 || base.maxOutputTokensExplicit === true,\n',
'        // OpenCode context-compaction-dsh PART A: Codex 不变；其他见 ocDshOutputFields（用户 > 发现 > dsh 目录 > 32768）\n        ...base.codex ? { maxOutputTokens: discoveredModel.maxOutputTokens ?? base.maxOutputTokens, maxOutputTokensExplicit: discoveredModel.maxOutputTokens !== void 0 || base.maxOutputTokensExplicit === true } : ocDshOutputFields(base, rawModelId, discoveredModel.maxOutputTokens),\n');
rep('m171','...config2.maxOutputTokens !== void 0 ? { max_output_tokens: config2.maxOutputTokens } : {},',
'...config2.maxOutputTokens !== void 0 ? { max_output_tokens: ocDshOutputCap(config2, config2.maxOutputTokens, { input: toResponsesInput(messages2), tools: responseTools }) } : {},');
rep('m171','      const maxOutputTokens = config2.maxOutputTokens ?? 8192;\n',
'      const maxOutputTokens = ocDshOutputCap(config2, config2.maxOutputTokens ?? 8192, { messages: toAnthropicChatMessages(messages2).messages, tools: anthropicTools });\n');
rep('m171','    const requestMaxOutputTokens = config2.maxOutputTokens !== void 0 ? availableOutputTokens === void 0 ? config2.maxOutputTokens : Math.min(config2.maxOutputTokens, availableOutputTokens) : void 0;',
'    const requestMaxOutputTokens = config2.maxOutputTokens !== void 0 ? availableOutputTokens === void 0 ? ocDshOutputCap(config2, config2.maxOutputTokens, { messages: chatMessages, tools: chatTools }) : Math.min(config2.maxOutputTokens, availableOutputTokens) : void 0;');
// ---- 0161 (item 4): editor max-output placeholder shows computed default
rep('m161','import { DSH_CONTEXT_CATALOG_JSON } from "./module-0174.mjs";','import { DSH_CONTEXT_CATALOG_JSON, DSH_OUTPUT_CATALOG_JSON } from "./module-0174.mjs";');
rep('m161',String.raw`<input data-mf=\"maxTokens\" placeholder=\"自动\" value=\"`,String.raw`<input data-mf=\"maxTokens\" placeholder=\"'+esc(pDefMax(m.id))+'\" value=\"`);
rep('m161',String.raw`\nconst P_DSH_CW=" + DSH_CONTEXT_CATALOG_JSON + ";`,
 String.raw`\nconst P_DSH_OUT=" + DSH_OUTPUT_CATALOG_JSON + ";\nfunction pDefMax(id){const f=n=>n%1e3===0?n/1e3+'K':n%1024===0?n/1024+'K':String(n);try{let h='';try{h=new URL(String($('fUrl').value||'').trim()).host.toLowerCase();}catch{}if(h==='api.deepseek.com')return '256K';const c=P_DSH_OUT[h],k=String(id||'').trim();if(c&&Object.prototype.hasOwnProperty.call(c,k))return f(c[k]);return '32K';}catch{return '32K';}}\nconst P_DSH_CW=" + DSH_CONTEXT_CATALOG_JSON + ";`);
// ---- model-defaults.mts reference copy
rep('mts','export const DEFAULT_API_MAX_OUTPUT_TOKENS = 384_000;',
`/**
 * Output defaults aligned with dsh (context-compaction-dsh PART A, 2026-11-19):
 * user value > /models discovery (official DeepSeek: min(256000, discovered)) >
 * dsh output catalog (pi-ai providers/data maxTokens, endpoint host + model id) > 32768;
 * official DeepSeek default 256000. See DSH_OUTPUT_CATALOG in module-0174.mjs.
 */
export const DEFAULT_API_MAX_OUTPUT_TOKENS = 32_768;
export const DSH_DEEPSEEK_OFFICIAL_MAX_OUTPUT_TOKENS = 256_000;`);
// backup then write
for(const [k,p] of Object.entries(files)){if(next[k]===undefined||next[k]===orig[k])throw Error('no change '+p);}
for(const [k,p] of Object.entries(files)){const b=path.join(bak,p);if(fs.existsSync(b))throw Error('backup exists, refusing to overwrite: '+b);}
for(const [k,p] of Object.entries(files)){const b=path.join(bak,p);fs.mkdirSync(path.dirname(b),{recursive:true});fs.writeFileSync(b,orig[k]);}
for(const [k,p] of Object.entries(files)){fs.writeFileSync(R(p),next[k]);console.log('wrote',p,orig[k].length,'->',next[k].length);}
