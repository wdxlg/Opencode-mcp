const fs=require('fs');const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const byId=new Map(p.nodes.map(n=>[n.id,n]));const parent=new Map();for(const n of p.nodes)for(const c of n.children||[])parent.set(c,n.id);
const dt=new Map();p.samples.forEach((s,i)=>dt.set(s,(dt.get(s)||0)+(p.timeDeltas[i+1]||0)));
const key=n=>{const f=n.callFrame;return `${f.functionName||'(anon)'} ${(f.url||'').split(/[\\/]/).slice(-2).join('/')}:${f.lineNumber+1}`;};
const self=new Map(),total=new Map();
for(const [id,t] of dt){let n=byId.get(id);self.set(key(n),(self.get(key(n))||0)+t);const seen=new Set();let cur=id;while(cur!==undefined){const k=key(byId.get(cur));if(!seen.has(k)){seen.add(k);total.set(k,(total.get(k)||0)+t);}cur=parent.get(cur);}}
const all=[...dt.values()].reduce((a,b)=>a+b,0);console.log('profile ms',(all/1000).toFixed(0),'idle',((self.get('(idle) :0')||0)/1000).toFixed(0));
const top=(m,n)=>[...m].filter(([k])=>!/^\((idle|program|root|garbage collector)\)/.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>(v/1000).toFixed(0).padStart(6)+'ms '+k.slice(0,150)).join('\n');
console.log('== self');console.log(top(self,25));console.log('== total');console.log(top(total,45));
