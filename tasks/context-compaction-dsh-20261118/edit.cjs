// context-compaction-dsh: 压缩与默认输出对齐 dsh
const fs=require('fs'),path=require('path');
const R='recovered/esm/';
const TS=process.argv[2];const BK='backup/context-compaction-dsh-'+TS+'/';
const files={a29:R+'002-agent-host.js/module-0029.mjs',a64:R+'002-agent-host.js/module-0064.mjs',e73:R+'000-extension.js/module-0173.mjs',e74:R+'000-extension.js/module-0174.mjs',e71:R+'000-extension.js/module-0171.mjs',e77:R+'000-extension.js/module-0177.mjs'};
const src={};for(const[k,f] of Object.entries(files)){src[k]=fs.readFileSync(f,'utf8');fs.mkdirSync(path.dirname(BK+f),{recursive:true});fs.copyFileSync(f,BK+f);}
let fail=0;
function rep(k,a,b,n=1){if(src[k].includes('\r\n')){a=a.replace(/\r?\n/g,'\r\n');b=b.replace(/\r?\n/g,'\r\n')}const c=src[k].split(a).length-1;if(c!==n){console.log('MISMATCH',k,c,'!=',n,JSON.stringify(a.slice(0,90)));fail++;return}src[k]=src[k].split(a).join(b)}
// 默认输出
rep('a64','var DEEPSEEK_MAX_OUTPUT_TOKENS = 384e3;','// OpenCode context-compaction-dsh: 与 dsh DeepSeek 官方 maxTokens 一致（原 384e3）\nvar DEEPSEEK_MAX_OUTPUT_TOKENS = 256e3;');
rep('e73','var DEEPSEEK_MAX_OUTPUT_TOKENS = 384e3;','// OpenCode context-compaction-dsh: 与 dsh DeepSeek 官方 maxTokens 一致（原 384e3）\nvar DEEPSEEK_MAX_OUTPUT_TOKENS = 256e3;');
rep('e74','var DEFAULT_API_MAX_OUTPUT_TOKENS = 384e3;','// OpenCode context-compaction-dsh: 与 dsh pi-ai DEFAULT_MAX_TOKENS 一致（原 384e3）\nvar DEFAULT_API_MAX_OUTPUT_TOKENS = 32768;');
// 0171：标记输出上限是否「手动填写 / 接口返回」
rep('e71','  if (Number(m.maxTokens) > 0) next.maxOutputTokens = Math.floor(Number(m.maxTokens));','  if (Number(m.maxTokens) > 0) {\n    next.maxOutputTokens = Math.floor(Number(m.maxTokens));\n    // OpenCode context-compaction-dsh: 提供商窗口里填写/发现的输出上限，压缩时预留\n    next.maxOutputTokensExplicit = true;\n  }');
rep('e71','    maxOutputTokens: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) ?? base.maxOutputTokens,\n','    maxOutputTokens: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) ?? base.maxOutputTokens,\n    maxOutputTokensExplicit: optionalInteger(modelConfiguration.maxOutputTokens, 1, 1e6) !== void 0 || base.maxOutputTokensExplicit === true,\n');
rep('e71','      maxOutputTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? DEFAULT_API_MAX_OUTPUT_TOKENS,\n','      maxOutputTokens: optionalInteger(configuration.maxOutputTokens, 1, 1e6) ?? DEFAULT_API_MAX_OUTPUT_TOKENS,\n      // OpenCode context-compaction-dsh: 只有手动填写的输出上限才算「已知」，压缩时预留；默认 32K 不预留（与 dsh 一致）\n      maxOutputTokensExplicit: optionalInteger(configuration.maxOutputTokens, 1, 1e6) !== void 0,\n');
rep('e71','        maxOutputTokens: discoveredModel.maxOutputTokens ?? base.maxOutputTokens,\n','        maxOutputTokens: discoveredModel.maxOutputTokens ?? base.maxOutputTokens,\n        maxOutputTokensExplicit: discoveredModel.maxOutputTokens !== void 0 || base.maxOutputTokensExplicit === true,\n');
// 0177：传预留 O；阈值 / 保留量只在用户明确设置时传
rep('e77',`          threshold: Number(ocContextConfig.get("compactThreshold", 0.85)),
          keepRecentTokens: Number(ocContextConfig.get("keepRecentTokens", 2e4)),
`,`          // OpenCode context-compaction-dsh: 触发点、保留量默认按 dsh 公式由 agent-host 计算；只有用户明确改过设置才传
          ...ocExplicitContextSetting(ocContextConfig, "compactThreshold") !== void 0 ? { threshold: Number(ocExplicitContextSetting(ocContextConfig, "compactThreshold")) } : {},
          ...ocExplicitContextSetting(ocContextConfig, "keepRecentTokens") !== void 0 ? { keepRecentTokens: Number(ocExplicitContextSetting(ocContextConfig, "keepRecentTokens")) } : {},
          outputReserve: ocContextOutputReserve(effectiveRuntimeModel),
`);
rep('e77','// OpenCode: 手动 /compact 轮次不进入历史',`// OpenCode context-compaction-dsh: 用户在设置里明确填过的值（未填返回 undefined，不取 package.json 默认）
function ocExplicitContextSetting(config, key) {
  try {
    const info = config.inspect(key);
    const value = info?.workspaceFolderValue ?? info?.workspaceValue ?? info?.globalValue;
    return value === void 0 || value === null || value === "" ? void 0 : value;
  } catch {
    return void 0;
  }
}
// OpenCode context-compaction-dsh: 压缩预留的输出 O，与 dsh 一致——手动填写、接口返回或 DeepSeek 官方才预留，其余按 0
function ocContextOutputReserve(model) {
  const value = Number(model?.maxOutputTokens);
  if (!Number.isInteger(value) || value <= 0) return 0;
  return model?.maxOutputTokensExplicit === true || model?.deepSeek === true ? value : 0;
}
// OpenCode: 手动 /compact 轮次不进入历史`);
// 0029 设置
rep('a29',`    threshold: num(raw.threshold, 0.85, 0.3, 0.98),
    clearToolResultsAt: num(raw.clearToolResultsAt, 0.6, 0.2, 0.95),
    keepRecentTokens: Math.floor(num(raw.keepRecentTokens, 2e4, 2e3, 2e5)),
`,`    // OpenCode context-compaction-dsh: 未传时按 dsh 公式（见 compactTriggerTokens / keepRecentTokens）
    threshold: typeof raw.threshold === "number" && Number.isFinite(raw.threshold) ? num(raw.threshold, 0.85, 0.3, 0.98) : void 0,
    keepRecentTokens: typeof raw.keepRecentTokens === "number" && Number.isFinite(raw.keepRecentTokens) ? Math.floor(num(raw.keepRecentTokens, 2e4, 2e3, 2e5)) : void 0,
    outputReserve: typeof raw.outputReserve === "number" && Number.isInteger(raw.outputReserve) && raw.outputReserve >= 0 && raw.outputReserve <= 1e7 ? raw.outputReserve : void 0,
`);
rep('a29',`  const contextOutputReserve = () => {
    const configured = Number.isInteger(input2.maxOutputTokens) && input2.maxOutputTokens > 0 ? input2.maxOutputTokens : deepSeek ? maxOutputTokens : anthropic ? anthropicMaxOutputTokens : 8192;
    return Math.max(1024, Math.min(configured, Math.floor(managedContextWindow * 0.2), 65536));
  };
  const usableContextWindow = () => Math.max(2048, managedContextWindow - contextOutputReserve());
`,`  // OpenCode context-compaction-dsh: O 与 dsh 一致——扩展传来的预留（手动填写 / 接口返回 / DeepSeek 官方），否则 DeepSeek 官方用其输出上限，其余为 0。
  const contextOutputReserve = () => {
    const raw = contextSettings.outputReserve !== void 0 ? contextSettings.outputReserve : deepSeek ? maxOutputTokens : 0;
    return Math.max(0, Math.min(raw, managedContextWindow - 4096));
  };
  const usableContextWindow = () => Math.max(2048, managedContextWindow - contextOutputReserve());
  // dsh-compaction-basic: 触发点 floor(min(W×0.8, W−O−65536))；用户明确设了比例时按 (W−O)×比例。下限 W/4，防止小窗口出现负值。
  const compactTriggerTokens = () => {
    const W = managedContextWindow;
    const O = contextOutputReserve();
    if (contextSettings.threshold !== void 0) return Math.max(2048, Math.floor((W - O) * contextSettings.threshold));
    return Math.max(Math.floor(W / 4), Math.floor(Math.min(W * 0.8, W - O - 65536)));
  };
  // dsh-compaction-basic: 压缩后保留的最近原文 floor((W−O)×0.16)
  const keepRecentContextTokens = () => contextSettings.keepRecentTokens !== void 0 ? contextSettings.keepRecentTokens : Math.max(2e3, Math.floor((managedContextWindow - contextOutputReserve()) * 0.16));
`);
rep('a29',`      const keep = aggressiveLevel >= 2 ? Math.floor(contextSettings.keepRecentTokens / 4) : aggressiveLevel ? Math.floor(contextSettings.keepRecentTokens / 2) : contextSettings.keepRecentTokens;`,
`      const keepBase = keepRecentContextTokens();
      const keep = aggressiveLevel >= 2 ? Math.floor(keepBase / 4) : aggressiveLevel ? Math.floor(keepBase / 2) : keepBase;`);
rep('a29',`      if (cut > 1) messages.splice(1, cut - 1);
      if (!input2.compactOnly && messages.length > 1 && messages[1]?.role !== "user") {`,`      if (cut > 1) messages.splice(1, cut - 1);
      // OpenCode context-compaction-dsh: 工具结果只在压缩时裁剪——保留下来的超过 8K 字符的结果留开头 4K + 结尾 1K
      trimContextToolResultsForCompaction(messages, turnUserMessage ? messages.indexOf(turnUserMessage) : messages.length);
      if (!input2.compactOnly && messages.length > 1 && messages[1]?.role !== "user") {`);
rep('a29',`          let usedContext = currentContextTokens();
          if (usedContext > usableContextWindow() * contextSettings.clearToolResultsAt) {
            const cleared = clearOldContextToolResults(messages, contextSettings.keepToolResults);
            // OpenCode context-fixes step04: 以往轮次存成 assistant 文本的工具上下文也一起裁剪（头 4K + 尾 1K）。
            const shrunk = shrinkPriorToolContextBlocks(messages, turnUserMessage ? messages.indexOf(turnUserMessage) : messages.length);
            cleared.count += shrunk.count;
            if (cleared.count > 0) {
              measuredContext = void 0;
              emitTrace({ type: "context_compaction", step, data: { phase: "cleared", reason: "tool_results", before: usedContext, after: currentContextTokens(), cleared: cleared.count, window: managedContextWindow } });
              usedContext = currentContextTokens();
            }
          }
          if (usedContext > usableContextWindow() * contextSettings.threshold) await compactContext("threshold", { step });`,
`          // OpenCode context-compaction-dsh: 去掉 60% 时的工具结果清理；只在超过 dsh 触发点时压缩（压缩时顺带裁剪工具结果）。
          const usedContext = currentContextTokens();
          if (usedContext > compactTriggerTokens()) await compactContext("threshold", { step });`);
rep('a29','function clearOldContextToolResults(messages, keepCount) {',`// OpenCode context-compaction-dsh: 压缩时裁剪保留部分的工具结果（> 8K 字符留头 4K + 尾 1K），并裁剪以往轮次的工具上下文块
var COMPACTION_TOOL_RESULT_MAX_CHARS = 8e3;
var COMPACTION_TOOL_RESULT_HEAD_CHARS = 4e3;
var COMPACTION_TOOL_RESULT_TAIL_CHARS = 1e3;
function trimToolTextForCompaction(text) {
  const value = String(text ?? "");
  if (value.length <= COMPACTION_TOOL_RESULT_MAX_CHARS) return void 0;
  const omitted = value.length - COMPACTION_TOOL_RESULT_HEAD_CHARS - COMPACTION_TOOL_RESULT_TAIL_CHARS;
  return \`\${value.slice(0, COMPACTION_TOOL_RESULT_HEAD_CHARS)}\\n…[\${omitted} chars of tool output trimmed at context compaction]…\\n\${value.slice(-COMPACTION_TOOL_RESULT_TAIL_CHARS)}\`;
}
function trimContextToolResultsForCompaction(messages, priorUptoIndex) {
  let count = 0;
  for (const message of messages) {
    if (message?.role !== "tool") continue;
    if (typeof message.content === "string") {
      const next = trimToolTextForCompaction(message.content);
      if (next !== void 0) {
        message.content = next;
        count += 1;
      }
    } else if (Array.isArray(message.content)) {
      let changed = false;
      const parts = message.content.map((part) => {
        if (!part || typeof part !== "object" || typeof part.text !== "string") return part;
        const next = trimToolTextForCompaction(part.text);
        if (next === void 0) return part;
        changed = true;
        count += 1;
        return { ...part, text: next };
      });
      if (changed) message.content = parts;
    }
  }
  try {
    count += shrinkPriorToolContextBlocks(messages, priorUptoIndex).count;
  } catch {
  }
  return { count };
}
function clearOldContextToolResults(messages, keepCount) {`);
if(fail){console.log('FAILED, nothing written');process.exit(1)}
for(const[k,f] of Object.entries(files))fs.writeFileSync(f,src[k]);
console.log('written',Object.values(files).length,'backup',BK);
