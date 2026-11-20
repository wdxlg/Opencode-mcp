import fs from "node:fs";
const f="recovered/esm/002-agent-host.js/module-0029.mjs";
const L=fs.readFileSync(f,"utf8").split(/\r?\n/);
const [a,b]=process.argv.slice(2).map(Number); // 1-based inclusive
const defRe=/^(?:export\s+)?(?:async\s+function|function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/;
const defs=new Map(); L.forEach((l,i)=>{const m=l.match(defRe); if(m) defs.set(m[1],i+1);});
const imp=new Set(); for(const l of L){const m=l.match(/^import\s*\{([^}]*)\}/); if(m) m[1].split(",").forEach(x=>imp.add(x.trim().split(/\s+as\s+/).pop()));}
const block=L.slice(a-1,b).join("\n"), rest=[...L.slice(0,a-1),...L.slice(b)].join("\n");
const ids=s=>new Set(s.match(/[A-Za-z_$][\w$]*/g));
const bi=ids(block), ri=ids(rest);
const inner=[...defs].filter(([n,l])=>l>=a&&l<=b).map(([n])=>n);
console.log("BLOCK_DEFS",inner.join(","));
console.log("NEEDS_FROM_REST",[...defs].filter(([n,l])=>(l<a||l>b)&&bi.has(n)).map(([n])=>n).join(","));
console.log("NEEDS_IMPORTS",[...imp].filter(n=>bi.has(n)).join(","));
console.log("USED_OUTSIDE",inner.filter(n=>ri.has(n)).join(","));
console.log("FIRST",L[a-1].slice(0,80),"| LAST",L[b-1].slice(0,80),"| NEXT",L[b].slice(0,80));
