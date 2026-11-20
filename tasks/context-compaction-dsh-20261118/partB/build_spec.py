import json
J=json.load(open('src/lines.json'))
def rng(k,a,b): return '\n'.join(J[k][str(i)] for i in range(a,b+1))
AH='recovered/esm/002-agent-host.js/'; EX='recovered/esm/000-extension.js/'; PKG='assets/resources/app/extensions/opencode/package.json'
E=[]
def add(f,old,new): E.append({'file':f,'old':old,'new':new})
# ---- module-0029
add(AH+'module-0029.mjs', J['m29']['17'], J['m29']['17']+'\n'+r'''// OpenCode context-compaction-dsh PART B: dsh-compaction-basic 默认值（lib/index.js :15/:17/:63/:82）与「每个模型只警告一次」的配置错误记录（:843-850）
var DSH_COMPACTION_THRESHOLD_RATIO = 0.8;
var DSH_COMPACTION_RETAIN_RATIO = 0.16;
var DSH_COMPACTION_HEADROOM_TOKENS = 65536;
var DSH_COMPACTION_ATTEMPTS = 2;
var dshWarnedPressureConfigTargets = /* @__PURE__ */ new Set();''')
add(AH+'module-0029.mjs', rng('m29',713,728), r'''  // OpenCode context-fixes step04 / context-compaction-dsh PART B: O 与 dsh 一致——扩展传来的预留（手动填写 / 接口返回 / DeepSeek 官方 256000），
  // 未传时 DeepSeek 官方用其输出上限，其余为 0。不再截断到 W−4096（dsh 不截断，W−O≤0 走下面的配置错误）。
  const contextOutputReserve = () => {
    const raw = contextSettings.outputReserve !== void 0 ? contextSettings.outputReserve : deepSeek ? maxOutputTokens : 0;
    return Math.max(0, raw);
  };
  const usableContextWindow = () => Math.max(2048, managedContextWindow - contextOutputReserve());
  // dsh-compaction-basic resolveCompactSpec（精确，无任何下限；已去掉旧的 0.4W 下限）：budget=W−O；threshold=floor(min(W×ratio, W−O−65536))，ratio 默认 0.8，
  // 用户设置 compactThreshold 时替换 ratio；retain=floor((W−O)×0.16)，用户设置 keepRecentTokens 时为固定值。
  // W−O≤0、W−O−65536≤0、retain≥threshold 为配置错误：每个模型只警告一次，跳过自动压力压缩（溢出恢复照常）。
  const dshCompactSpec = () => {
    const W = managedContextWindow;
    const O = contextOutputReserve();
    const budget = W - O;
    const target = `${input2.baseUrl ?? ""}|${input2.model ?? ""}|W=${W}|O=${O}|r=${contextSettings.threshold ?? ""}|k=${contextSettings.keepRecentTokens ?? ""}`;
    if (budget <= 0) return { error: `${input2.model ?? "model"} reserves ${O} completion tokens of its ${W}-token context window, leaving no message budget`, target, budget };
    const pressureBudget = budget - DSH_COMPACTION_HEADROOM_TOKENS;
    if (pressureBudget <= 0) return { error: `${input2.model ?? "model"} reserves ${O} completion tokens and ${DSH_COMPACTION_HEADROOM_TOKENS} headroom tokens of its ${W}-token context window, leaving no pressure budget`, target, budget };
    const ratio = contextSettings.threshold !== void 0 ? contextSettings.threshold : DSH_COMPACTION_THRESHOLD_RATIO;
    const threshold = Math.floor(Math.min(W * ratio, pressureBudget));
    const retain = contextSettings.keepRecentTokens !== void 0 ? contextSettings.keepRecentTokens : Math.floor(budget * DSH_COMPACTION_RETAIN_RATIO);
    if (retain >= threshold) return { error: `${input2.model ?? "model"} retainTokens (${retain}) must be less than threshold tokens ${threshold}`, target, budget };
    return { threshold, retain, budget };
  };
  // 压缩后保留的最近原文 = dsh retain；配置错误时（只剩历史 / 溢出路径会用到）按固定值或 floor(max(0, W−O)×0.16)
  const keepRecentContextTokens = () => {
    const spec = dshCompactSpec();
    if (!spec.error) return spec.retain;
    return contextSettings.keepRecentTokens !== void 0 ? contextSettings.keepRecentTokens : Math.floor(Math.max(0, spec.budget) * DSH_COMPACTION_RETAIN_RATIO);
  };
  // 本轮开局装入历史的预算 = dsh 触发点；配置错误（自动压缩被跳过）时 = W−O
  const historyBudgetTokens = () => {
    const spec = dshCompactSpec();
    return spec.error ? Math.max(0, spec.budget) : spec.threshold;
  };
  const warnDshCompactConfig = (spec, step) => {
    if (dshWarnedPressureConfigTargets.has(spec.target)) return;
    dshWarnedPressureConfigTargets.add(spec.target);
    console.warn(`[agent-host] step compaction failed: ${spec.error}; automatic compaction is skipped for this model, continuing the turn`);
    emitTrace({ type: "context_compaction", step, data: { phase: "config_error", reason: "threshold", error: spec.error, window: managedContextWindow } });
  };''')
add(AH+'module-0029.mjs', 'calibrated, usableContextWindow, applyContextCheckpoint }, { OPENCODE_CHAT_BEHAVIOR_CONTRACT', 'calibrated, usableContextWindow, historyBudgetTokens, applyContextCheckpoint }, { OPENCODE_CHAT_BEHAVIOR_CONTRACT')
add(AH+'module-0029.mjs', rng('m29',813,821), r'''      if (contextSettings.auto && cs.baseSystemContent !== void 0) {
        if (cs.pendingEvictedHistory.length > 0) {
          await compactContext("history", { step });
        }
        // OpenCode context-compaction-dsh PART B: dsh compactIfNeeded("pressure")（lib/index.js :914-961）——低于触发点不动；达到触发点先裁剪工具结果
        // （>8192 字符留开头 4096 + 结尾 1024）并重新估算，仍达到则按 retain 压缩，最多 2 次；还超过就警告并继续本步。没有 60% 工具结果清理。
        const spec = dshCompactSpec();
        if (spec.error) {
          warnDshCompactConfig(spec, step);
        } else if (currentContextTokens() >= spec.threshold) {
          const prunedBefore = currentContextTokens();
          const pruned = trimContextToolResultsForCompaction(messages, cs.turnUserMessage ? messages.indexOf(cs.turnUserMessage) : messages.length);
          if (pruned.count > 0) {
            cs.measuredContext = void 0;
            emitTrace({ type: "context_compaction", step, data: { phase: "pruned", reason: "threshold", pruned: pruned.count, before: prunedBefore, after: currentContextTokens(), window: managedContextWindow, threshold: spec.threshold } });
          }
          let usedContext = currentContextTokens();
          if (usedContext >= spec.threshold) {
            let compacted = false;
            for (let attempt = 0; attempt < DSH_COMPACTION_ATTEMPTS; attempt += 1) {
              const outcome = await compactContext("threshold", { step, retain: spec.retain });
              if (!outcome) break;
              compacted = true;
              usedContext = currentContextTokens();
              if (usedContext < spec.threshold) break;
            }
            if (compacted && usedContext >= spec.threshold) {
              console.warn(`[agent-host] step compaction failed: compaction still above threshold after ${DSH_COMPACTION_ATTEMPTS} compaction attempts (${usedContext} estimated tokens >= threshold ${spec.threshold}); continuing the turn`);
              emitTrace({ type: "context_compaction", step, data: { phase: "over", reason: "threshold", after: usedContext, threshold: spec.threshold, window: managedContextWindow } });
            }
          }
        }
      }''')
add(AH+'module-0029.mjs', rng('m29',937,944), r'''          // OpenCode context-compaction-dsh PART B: dsh 溢出恢复（:943-960）——第 1 次：工具结果裁剪 + 只留平衡的尾部（retain 0）压缩；
          // 第 2 次：再加原有的强力裁剪（清理旧工具结果、缩短历史工具上下文、限制单条工具结果长度）+ retain 0。最多 2 次，窗口学习保留在上面。
          trimContextToolResultsForCompaction(messages, cs.turnUserMessage ? messages.indexOf(cs.turnUserMessage) : messages.length);
          if (overflowRetries >= 2) {
            clearOldContextToolResults(messages, 1);
            shrinkPriorToolContextBlocks(messages, cs.turnUserMessage ? messages.indexOf(cs.turnUserMessage) : messages.length, 1500, 500);
            const maxToolChars = Math.max(2e3, Math.floor(usableContextWindow() * 0.3));
            for (const item of messages) {
              if (item?.role === "tool" && typeof item.content === "string" && item.content.length > maxToolChars) item.content = contextClip(item.content, maxToolChars);
            }
          }
          cs.measuredContext = void 0;
          await compactContext("overflow", { retain: 0, step });''')
# ---- agent-compaction
add(AH+'agent-compaction.mjs', J['cmp']['74'], r'''    // OpenCode context-compaction-dsh PART B: 调用方给了 retain（自动压缩 = dsh retain，溢出 = 0）就按它保留尾部
    const keepBase = Number.isInteger(options.retain) && options.retain >= 0 ? options.retain : keepRecentContextTokens();''')
add(AH+'agent-compaction.mjs', rng('cmp',135,136), r'''    // OpenCode context-compaction-dsh PART B: 工具结果裁剪改由调用方在压缩前做（dsh：pruner → 重新估算 → 压缩）；手动 /compact 与历史压缩不裁剪''')
# ---- agent-turn
add(AH+'agent-turn.mjs', 'calibrated, usableContextWindow, applyContextCheckpoint } = env;', 'calibrated, usableContextWindow, historyBudgetTokens, applyContextCheckpoint } = env;')
add(AH+'agent-turn.mjs', J['turn']['48'], r'''    // OpenCode context-compaction-dsh PART B: 历史预算 = dsh 触发点（配置错误时 W−O），不再用 threshold 比例（未设置时为 undefined）
    const historyBudget = Math.max(0, historyBudgetTokens() - fixedTokens - 4096);''')
# ---- agent-context
add(AH+'agent-context.mjs', J['ctx']['58'], J['ctx']['58'].replace('num(raw.threshold, 0.85, 0.3, 0.98)','num(raw.threshold, 0.8, 0.3, 0.98)'))
add(AH+'agent-context.mjs', J['ctx']['59'], r'''    // OpenCode context-compaction-dsh PART B: 0 / 未设置 = dsh 16% 规则；>0 为固定 retain（无下限）
    keepRecentTokens: typeof raw.keepRecentTokens === "number" && Number.isFinite(raw.keepRecentTokens) && raw.keepRecentTokens > 0 ? Math.floor(Math.min(1e7, raw.keepRecentTokens)) : void 0,''')
add(AH+'agent-context.mjs', rng('ctx',175,183), r'''// OpenCode context-compaction-dsh PART B: 与 dsh-compaction-tool-result-pruner 一致——超过 8192 个字符（按 Unicode 码点）的工具结果
// 留开头 4096 + 固定标记 + 结尾 1024；包括最新的结果。只在压缩路径（压力 / 溢出）里调用。
var COMPACTION_TOOL_RESULT_MAX_CHARS = 8192;
var COMPACTION_TOOL_RESULT_HEAD_CHARS = 4096;
var COMPACTION_TOOL_RESULT_TAIL_CHARS = 1024;
var COMPACTION_TOOL_RESULT_PRUNE_MARKER = "\n\n[... tool result middle pruned ...]\n\n";
function trimToolTextForCompaction(text) {
  const value = String(text ?? "");
  if (value.length <= COMPACTION_TOOL_RESULT_MAX_CHARS) return void 0;
  const points = Array.from(value);
  if (points.length <= COMPACTION_TOOL_RESULT_MAX_CHARS) return void 0;
  return `${points.slice(0, COMPACTION_TOOL_RESULT_HEAD_CHARS).join("")}${COMPACTION_TOOL_RESULT_PRUNE_MARKER}${points.slice(points.length - COMPACTION_TOOL_RESULT_TAIL_CHARS).join("")}`;
}''')
add(AH+'agent-context.mjs', J['ctx']['208'], J['ctx']['208'].replace('shrinkPriorToolContextBlocks(messages, priorUptoIndex)','shrinkPriorToolContextBlocks(messages, priorUptoIndex, COMPACTION_TOOL_RESULT_HEAD_CHARS, COMPACTION_TOOL_RESULT_TAIL_CHARS)'))
# ---- module-0014
add(AH+'module-0014.mjs', J['m14']['256'], J['m14']['256']+'\n'+r'''    // OpenCode context-compaction-dsh PART B: 扩展传来的压缩预留输出 O（此前在这里被丢掉）
    outputReserve: Number.isInteger(row.outputReserve) && row.outputReserve >= 0 && row.outputReserve <= 1e7 ? Number(row.outputReserve) : void 0,''')
# ---- module-0177
add(EX+'module-0177.mjs', rng('m177',326,331), r'''// OpenCode context-compaction-dsh PART B: 压缩预留的输出 O 读 PART A 的 outputReserveTokens（手动填写 / 接口返回的值；DeepSeek 官方 256000；其余 0），
// 与 dsh 一致；没有该字段的旧模型对象沿用原规则（手动 / 接口返回或 DeepSeek 官方才预留）。
function ocContextOutputReserve(model) {
  const reserve = Number(model?.outputReserveTokens);
  if (Number.isInteger(reserve) && reserve >= 0) return reserve;
  const value = Number(model?.maxOutputTokens);
  if (!Number.isInteger(value) || value <= 0) return 0;
  return model?.maxOutputTokensExplicit === true || model?.deepSeek === true ? value : 0;
}''')
add(EX+'module-0177.mjs', J['m177']['2952'], J['m177']['2952']+'\n'+r'''          // OpenCode context-compaction-dsh PART B: dsh 压力压缩的裁剪、仍超触发点、配置错误（每个模型只提示一次）
          else if (ctx.phase === "pruned") stream.progress(`已裁剪 ${ctx.pruned} 条过长的工具结果：约 ${ctx.before} → ${ctx.after} tokens（触发点 ${ctx.threshold}）`);
          else if (ctx.phase === "over") stream.progress(`压缩后上下文仍高于触发点（约 ${ctx.after} / ${ctx.threshold} tokens），继续本步`);
          else if (ctx.phase === "config_error") stream.progress(`自动压缩已跳过（窗口与输出预留配置不满足 dsh 公式）：${String(ctx.error ?? "")}`);''')
# ---- package.json
add(PKG, rng('pkg',1685,1687), '''          "minimum": 0.3,
          "maximum": 0.98,
          "description": "dsh 触发比例 ratio（0.3–0.98）。与 dsh 一致：触发点 = min(ratio×窗口, 窗口−预留输出−65536)，留空（默认）ratio=0.8；没有下限，窗口−预留输出−65536≤0 时跳过自动压缩并提示一次。"''')
add(PKG, rng('pkg',1695,1696), '''          "minimum": 0,
          "description": "压缩时原样保留的最近对话 token 数（固定值）。留空或 0（默认）时与 dsh 一致：16%×(窗口−预留输出)；必须小于触发点，否则跳过自动压缩并提示一次。"''')
json.dump(E,open('partB-edits.json','w'),ensure_ascii=False,indent=1)
print(len(E), sorted(set(e['file'] for e in E)))
