// usage: node move-defs.mjs <newModule> <comment> name1,name2,... [--apply]
import fs from "node:fs";
const dir="recovered/esm/002-agent-host.js/", f=dir+"module-0029.mjs";
const [newMod, note, list, flag]=process.argv.slice(2); const want=list.split(",");
const raw=fs.readFileSync(f,"utf8"), eol=raw.includes("\r\n")?"\r\n":"\n"; const L=raw.split(/\r?\n/);
const defRe=/^(?:async\s+function|function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/;
const starts=[]; L.forEach((l,i)=>{const m=l.match(defRe); if(m) starts.push([m[1],i]);});
const exportIdx=L.findIndex(l=>l.startsWith("export {"));
const ranges=new Map();
starts.forEach(([n,i],k)=>{let end=(k+1<starts.length?starts[k+1][1]:exportIdx)-1; while(end>i&&!/^\s*[}\]);]|\S/.test(L[end])) end--; // trim blanks
  while(end>i && /^\s*\/\//.test(L[end])) end--; // leave trailing comment for next def
  while(end>i && L[end].trim()==="") end--; ranges.set(n,[i,end]);});
for(const n of want) if(!ranges.has(n)) throw Error("no def "+n);
const moved=new Set(); want.forEach(n=>{const [a,b]=ranges.get(n); for(let i=a;i<=b;i++) moved.add(i);});
const ids=s=>new Set(s.match(/[A-Za-z_$][\w$]*/g)||[]);
const block=[...moved].sort((a,b)=>a-b).map(i=>L[i]).join("\n"); const bi=ids(block);
const restLines=L.map((l,i)=>moved.has(i)?"":l); const restTxt=restLines.join("\n");
const imports=L.filter(l=>/^import\s*\{/.test(l));
const back=[...ranges.keys()].filter(n=>!want.includes(n)&&bi.has(n));
const needImp=imports.map(l=>{const m=l.match(/^import\s*\{([^}]*)\}\s*from\s*("[^"]+")/);const ns=m[1].split(",").map(x=>x.trim()).filter(x=>bi.has(x.split(/\s+as\s+/).pop()));return ns.length?`import { ${ns.join(", ")} } from ${m[2]};`:null;}).filter(Boolean);
const usedOutside=want.filter(n=>{const r=restTxt.replace(/^export \{.*$/m,""); return new RegExp("\\b"+n.replace("$","\\$")+"\\b").test(r);});
console.log("BACKREFS",back.join(",")||"none"); console.log("IMPORTS",needImp.join(" | ")||"none"); console.log("USED_IN_0029",usedOutside.join(","));
if(back.length) { console.log("ABORT: circular deps"); process.exit(2); }
if(flag!=="--apply") process.exit(0);
const out=[`// ${note}`,"// module-0029 原样 re-export 这些名字，对外接口不变。",...needImp,"",...[...moved].sort((a,b)=>a-b).map(i=>L[i]),"",`export { ${want.join(", ")} };`,""];
fs.writeFileSync(dir+newMod,out.join(eol));
const firstMoved=Math.min(...moved);
const rest=[]; L.forEach((l,i)=>{ if(i===firstMoved) rest.push(`// ${newMod.replace(".mjs","")}: ${want.length} 个定义已移出`); if(!moved.has(i)) rest.push(l);});
const ii=rest.findIndex(l=>l.startsWith('import { agentToolResultContent }'));
rest.splice(ii+1,0,`import { ${want.join(", ")} } from "./${newMod}";`);
fs.writeFileSync(f,rest.join(eol).replace(/(\r?\n){4,}/g,eol+eol+eol)); console.log("APPLIED", out.length);
