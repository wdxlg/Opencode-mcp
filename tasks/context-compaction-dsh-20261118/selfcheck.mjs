// context-compaction-dsh 自检：只读源码 + 按源码里的公式算触发点（不是测试套件）
import fs from "node:fs";
const R="recovered/esm/";const rd=f=>fs.readFileSync(R+f,"utf8");
const a29=rd("002-agent-host.js/module-0029.mjs"),a64=rd("002-agent-host.js/module-0064.mjs"),e73=rd("000-extension.js/module-0173.mjs"),e74=rd("000-extension.js/module-0174.mjs"),e71=rd("000-extension.js/module-0171.mjs"),e77=rd("000-extension.js/module-0177.mjs");
let ok=0,bad=0;const t=(n,c)=>{c?ok++:bad++;console.log((c?"PASS ":"FAIL ")+n)};
t("agent-host DeepSeek 输出 256000",/DEEPSEEK_MAX_OUTPUT_TOKENS = 256e3/.test(a64));
t("扩展 DeepSeek 输出 256000",/DEEPSEEK_MAX_OUTPUT_TOKENS = 256e3/.test(e73));
t("默认输出 32768",/DEFAULT_API_MAX_OUTPUT_TOKENS = 32768/.test(e74));
t("不再有 384e3 取值",!/= 384e3/.test(a64+e73+e74));
t("去掉 60% 清理",!/clearToolResultsAt/.test(a29));
t("触发点函数存在",/const compactTriggerTokens = \(\) =>/.test(a29)&&/W - O - 65536/.test(a29));
t("阈值判断用触发点",/usedContext > compactTriggerTokens\(\)/.test(a29));
t("保留原文 16%",/\* 0\.16\)\)/.test(a29));
t("压缩时裁剪工具结果",/trimContextToolResultsForCompaction\(messages,/.test(a29)&&/COMPACTION_TOOL_RESULT_MAX_CHARS = 8e3/.test(a29));
t("不再引用 contextSettings.keepRecentTokens / 4",!/contextSettings\.keepRecentTokens \/ 4/.test(a29));
t("扩展传 outputReserve",/outputReserve: ocContextOutputReserve\(effectiveRuntimeModel\)/.test(e77));
t("扩展只传明确设置的阈值",/ocExplicitContextSetting\(ocContextConfig, "compactThreshold"\)/.test(e77)&&!/get\("compactThreshold", 0\.85\)/.test(e77));
t("0171 标记明确输出",(e71.match(/maxOutputTokensExplicit/g)||[]).length>=4);
// 按公式计算
const trig=(W,O)=>Math.max(Math.floor(W*0.4),Math.floor(Math.min(W*0.8,W-O-65536)));
const keep=(W,O)=>Math.max(2e3,Math.floor((W-O)*0.16));
const cases=[["64K 学到的窗口",65536,0,26214],["128K(128000)",128000,0,62464],["128K(131072)",131072,0,65536],["256K",262144,0,196608],["DeepSeek 1M",1048576,256000,727040]];
for(const [n,W,O,exp] of cases){const v=trig(W,O);t(`${n} 触发点 ${v}（期望 ${exp}）保留 ${keep(W,O)}`,v===exp)}
// 工具裁剪函数
const m=a29.match(/var COMPACTION_TOOL_RESULT_MAX_CHARS[\s\S]*?\nfunction trimContextToolResultsForCompaction/);
const fn=new Function(m[0].replace(/\nfunction trimContextToolResultsForCompaction$/,"")+";return trimToolTextForCompaction;")();
t("8000 字符不裁",fn("x".repeat(8000))===undefined);
const r=fn("a".repeat(4000)+"b".repeat(5000)+"c".repeat(1000));t("10000 字符→头4K+尾1K",r.startsWith("a".repeat(4000)+"\n…[5000")&&r.endsWith("c".repeat(1000)));
console.log(`${ok}/${ok+bad} 通过`);process.exit(bad?1:0);
