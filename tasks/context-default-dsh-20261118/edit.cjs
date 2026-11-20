// context-default-dsh: apply edits atomically (all-or-nothing), after backup. Usage: node edit.cjs <root> <backupDir> <new0174.b64file> <newmts.b64file>
const fs=require('fs'),path=require('path');
const [root,bak,f0174,fmts]=process.argv.slice(2);
const R=p=>path.join(root,p);
const files={
 m174:'recovered/esm/000-extension.js/module-0174.mjs',
 m171:'recovered/esm/000-extension.js/module-0171.mjs',
 m161:'recovered/esm/000-extension.js/module-0161.mjs',
 ah:'recovered/esm/002-agent-host.js/module-0029.mjs',
 mts:'recovered/typescript/extensions/opencode/src/model-defaults.mts'};
const orig={},next={};
for(const [k,p] of Object.entries(files)){orig[k]=fs.readFileSync(R(p),'utf8');}
function rep(k,a,b,count=1){const s=next[k]??orig[k];const n=s.split(a).length-1;if(n!==count)throw Error(`${files[k]}: expected ${count} match(es), found ${n}: ${a.slice(0,90)}`);next[k]=s.split(a).join(b);}
// 0174 / mts: full replacement
next.m174=Buffer.from(fs.readFileSync(f0174,'utf8').trim(),'base64').toString('utf8');
next.mts=Buffer.from(fs.readFileSync(fmts,'utf8').trim(),'base64').toString('utf8');
// 0171
rep('m171','import { DEFAULT_API_CONTEXT_WINDOW, DEFAULT_API_MAX_OUTPUT_TOKENS, DEFAULT_CODEX_CONTEXT_WINDOW } from "./module-0174.mjs";',
 'import { DEFAULT_API_CONTEXT_WINDOW, DEFAULT_API_MAX_OUTPUT_TOKENS, DEFAULT_CODEX_CONTEXT_WINDOW, DSH_FALLBACK_CONTEXT_WINDOW, dshDefaultContextWindow } from "./module-0174.mjs";');
rep('m171','var DEFAULT_CONTEXT_WINDOW = 128e3;','// OpenCode context-default-dsh: 与 dsh pi-ai 适配器回退值一致（原 128K）\nvar DEFAULT_CONTEXT_WINDOW = DSH_FALLBACK_CONTEXT_WINDOW;');
rep('m171','function parseDiscoveredModels(payload, codex = false) {',
`// OpenCode context-default-dsh: /models 发现与 dsh 一致（dsh-llm-pi-ai readListing/capacity）：
// 窗口取 context_window / max_context_window / contextWindow / context_length / max_input_tokens / limit.context 中第一个正整数，
// 输出上限取 max_output_tokens / maxOutputTokens / maxTokens / max_tokens / limit.output / top_provider.max_completion_tokens；
// "models" 也可以是以模型 id 为键的对象。
function ocDshCapacity(...candidates) {
  for (const candidate of candidates) if (typeof candidate === "number" && Number.isInteger(candidate) && candidate > 0) return candidate;
  return void 0;
}
function ocDshListingMap(models) {
  return Object.entries(models).filter(([, raw]) => raw !== null && typeof raw === "object" && !Array.isArray(raw)).map(([key, raw]) => ({ ...raw, id: key || raw.id }));
}
function parseDiscoveredModels(payload, codex = false) {`);
rep('m171','Array.isArray(payload?.models) ? payload.models : Array.isArray(payload?.results)',
 'Array.isArray(payload?.models) ? payload.models : payload?.models && typeof payload.models === "object" ? ocDshListingMap(payload.models) : Array.isArray(payload?.results)');
rep('m171','      contextWindow: optionalInteger(item.context_window ?? item.max_context_window, 1024, 1e7),\n      maxOutputTokens: optionalInteger(item.max_output_tokens, 1, 1e6),',
 '      contextWindow: optionalInteger(ocDshCapacity(item.context_window, item.max_context_window, item.contextWindow, item.context_length, item.max_input_tokens, item.limit?.context) ?? item.context_window ?? item.max_context_window, 1024, 1e7),\n      maxOutputTokens: optionalInteger(ocDshCapacity(item.max_output_tokens, item.maxOutputTokens, item.maxTokens, item.max_tokens, item.limit?.output, item.top_provider?.max_completion_tokens) ?? item.max_output_tokens, 1, 1e6),');
rep('m171','      contextWindow: deepSeek ? DEEPSEEK_CONTEXT_WINDOW_TOKENS : DEFAULT_CONTEXT_WINDOW,',
 '      // OpenCode context-default-dsh: dsh 目录（按端点 + 模型 id）> 回退（官方 DeepSeek 1e6，其他 262144）\n      contextWindow: dshDefaultContextWindow(modelOverride || legacy.model, baseUrl),');
rep('m171','// OpenCode context-fixes step01: 官方 DeepSeek 端点真实窗口为 1M；其他未知端点默认 128K',
 '// OpenCode context-default-dsh: 用户在配置里填的窗口优先；否则官方 DeepSeek 1e6、其他 262144（与 dsh 回退一致），具体模型再按 dsh 目录细化（见 dshDefaultContextWindow 的调用处）');
rep('m171','        const config2 = ocApplyManagedModelMeta({ ...base, model: rawModelId, providerKey: namespace, imageInput: true }, metaMap[rawModelId]);',
 '        // OpenCode context-default-dsh: 未在模型设置里填窗口时按 dsh 目录（端点 + 模型 id）取值，查不到用 dsh 回退值；用户填写的值（metaMap）仍优先\n        const config2 = ocApplyManagedModelMeta({ ...base, model: rawModelId, providerKey: namespace, imageInput: true, contextWindow: dshDefaultContextWindow(rawModelId, base.baseUrl) }, metaMap[rawModelId]);');
rep('m171','        contextWindow: discoveredModel.contextWindow ?? base.contextWindow,',
 '        // OpenCode context-default-dsh: 发现值 > 用户在配置里填的窗口 > dsh 目录（端点 + 模型 id）> dsh 回退值\n        contextWindow: discoveredModel.contextWindow ?? (!base.codex && optionalInteger(configuration?.contextWindow, 1024, 1e7) !== void 0 ? base.contextWindow : dshDefaultContextWindow(rawModelId, base.baseUrl)),');
// agent-host internal fallback
rep('ah','var CONTEXT_FALLBACK_WINDOW = 128e3;','// OpenCode context-default-dsh: 扩展没传窗口时的内部回退，与 dsh pi-ai 回退一致（原 128K）\nvar CONTEXT_FALLBACK_WINDOW = 262144;');
// 0161 provider editor hint
const oldDef=String.raw`function pDefCw(){try{return /^https?:\\/\\/api\\.deepseek\\.com(\\/|$)/i.test(String($(\"fUrl\").value||\"\").trim())?'1M（DeepSeek 官方）':'128K';}catch{return '128K';}}`;
const newDef=String.raw`const P_DSH_CW=" + DSH_CONTEXT_CATALOG_JSON + ";\nfunction pDefCw(id){const f=n=>n%1048576===0?n/1048576+\"M\":n%1e6===0?n/1e6+\"M\":n%1024===0?n/1024+\"K\":n%1e3===0?n/1e3+\"K\":String(n);try{let h=\"\";try{h=new URL(String($(\"fUrl\").value||\"\").trim()).host.toLowerCase();}catch{}const c=P_DSH_CW[h],k=String(id||\"\").trim();if(c&&Object.prototype.hasOwnProperty.call(c,k))return f(c[k])+'（dsh 目录）';return h===\"api.deepseek.com\"?'1M（DeepSeek 官方）':'256K';}catch{return '256K';}}`;
rep('m161',oldDef,newDef);
rep('m161',`'+pDefCw()+'`,`'+pDefCw(m.id)+'`,3);
const imp0161='import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";';
rep('m161',imp0161,imp0161+'\n// OpenCode context-default-dsh: 提供商编辑器里“未填窗口按多少计算”的提示与运行时用同一份 dsh 目录\nimport { DSH_CONTEXT_CATALOG_JSON } from "./module-0174.mjs";');
// backup then write
for(const [k,p] of Object.entries(files)){const b=path.join(bak,p);fs.mkdirSync(path.dirname(b),{recursive:true});fs.writeFileSync(b,orig[k]);}
for(const [k,p] of Object.entries(files)){if(next[k]===orig[k])throw Error('no change '+p);}
for(const [k,p] of Object.entries(files)){fs.writeFileSync(R(p),next[k]);console.log('wrote',p,orig[k].length,'->',next[k].length);}
