const fs=require('fs');const R='E:/OpenCode-Source-Recovery-20261013/';
const OLD_START="  const wrap=(fn,name)=>async()=>{try{await fn();}catch(e){log(name+' failed: '+e.message);";
const NEW=String.raw`  // OpenCode 20:40: 去掉状态栏「GitHub」按钮和点开后的快速选择菜单（Issue 交给协作组 / 开 PR / 合议审查）；
  // 改为给 AI 一个通用 GitHub 工具 opencode_github：用已登录的 GitHub 账号调用 REST / GraphQL，Issue、PR、评论、审查、Actions、Release、搜索等都能用。
  void issueToTeam;void openPR;void reviewPR;
  const SAFE=new Set(['GET','HEAD']);
  const fill=async s=>{s=String(s||'');if(s.includes('{owner}')||s.includes('{repo}')){const r=await repo();s=s.split('{owner}').join(r.owner).split('{repo}').join(r.name);}return s;};
  const isWrite=i=>i.graphql?/^\s*(?:#[^\n]*\n\s*)*mutation\b/i.test(String(i.graphql)):!SAFE.has(String(i.method||'GET').toUpperCase());
  async function ghCall(i){
    let method=String(i.method||(i.graphql?'POST':'GET')).toUpperCase();
    let p=i.graphql?'/graphql':String(i.path||'').trim();
    if(!p)throw Error('需要 path（REST 路径，如 /repos/{owner}/{repo}/issues）或 graphql。');
    if(/^https?:\/\//i.test(p)){const u=new URL(p);if(u.hostname!=='api.github.com')throw Error('只允许 https://api.github.com');p=u.pathname+u.search;}
    if(!p.startsWith('/'))p='/'+p;
    p=await fill(p);
    if(i.query&&typeof i.query==='object'){const qs=new URLSearchParams();for(const [k,v] of Object.entries(i.query))if(v!==undefined&&v!==null)qs.append(k,String(v));const s=qs.toString();if(s)p+=(p.includes('?')?'&':'?')+s;}
    if(i.graphql)method='POST';
    let body=i.graphql?{query:await fill(i.graphql),variables:i.variables&&typeof i.variables==='object'?i.variables:{}}:i.body;
    const send=body!==undefined&&body!==null&&!SAFE.has(method);
    const t=await token(false);
    const r=await fetch('https://api.github.com'+p,{method,headers:{Authorization:'Bearer '+t,Accept:String(i.accept||'application/vnd.github+json'),'X-GitHub-Api-Version':'2022-11-28','User-Agent':'OpenCode',...(send?{'Content-Type':'application/json'}:{})},body:send?(typeof body==='string'?body:JSON.stringify(body)):void 0});
    let txt=await r.text();const max=Math.max(2000,Math.min(Number(i.max_chars)||60000,200000));
    const link=r.headers.get('link');
    if(txt.length>max)txt=txt.slice(0,max)+'\n…（已截断，原长 '+txt.length+' 字符；用 per_page/page 或更窄的查询）';
    return 'HTTP '+r.status+' '+method+' '+p+(link?'\nlink: '+link:'')+'\n'+txt;
  }
  try{context.subscriptions.push(vscode.lm.registerTool('opencode_github',{
    prepareInvocation(o){const i=o?.input||{};const m=String(i.method||(i.graphql?'POST':'GET')).toUpperCase();const what=(i.graphql?'GraphQL':m+' '+String(i.path||'')).slice(0,140);
      if(!isWrite(i))return {invocationMessage:'GitHub · '+what};
      const detail=(i.graphql?String(i.graphql)+(i.variables?'\n'+JSON.stringify(i.variables,null,2):''):(i.body===undefined?'':JSON.stringify(i.body,null,2))).slice(0,4000);
      return {invocationMessage:'GitHub · '+what,confirmationMessages:{title:'GitHub 写操作：'+what,message:new vscode.MarkdownString(detail?'`+"```"+String.raw`\n'+detail+'\n`+"```"+String.raw`':'')}};},
    async invoke(o){try{return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(await ghCall(o?.input||{}))]);}catch(e){log('tool: '+e.message);return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('ERROR: '+e.message)]);}}
  }));}catch(e){log('registerTool opencode_github failed: '+e.message);}
}
`;
for(const f of ['recovered/shared/automation-workbench.mjs','recovered/esm/000-extension.js/automation-workbench.mjs']){
  let s=fs.readFileSync(R+f,'utf8');const a=s.indexOf(OLD_START);if(a<0)throw Error('anchor missing '+f);
  const tail=s.slice(a);if(!/\n\}\s*$/.test(tail))throw Error('tail unexpected '+f);
  fs.writeFileSync(R+f+'.pre-ghtool2040',s);s=s.slice(0,a)+NEW;fs.writeFileSync(R+f,s);console.log('patched',f);
}
const pj=R+'assets/resources/app/extensions/opencode/package.json';const P=JSON.parse(fs.readFileSync(pj,'utf8'));
fs.writeFileSync(pj+'.pre-ghtool2040',fs.readFileSync(pj));
const tools=P.contributes.languageModelTools;const k=tools.findIndex(t=>t.name==='opencode_github');
const def={name:'opencode_github',displayName:'GitHub',toolReferenceName:'github',canBeReferencedInPrompt:true,icon:'$(github)',
userDescription:'用你登录的 GitHub 账号访问 Issue、PR、评论、审查、Actions、Release、搜索等。',
modelDescription:"Call the GitHub API as the signed-in user. Use it for anything on GitHub: issues, pull requests (files, diffs, reviews, review comments, merge), comments, labels, milestones, branches, commits, compare, contents, releases, Actions workflows/runs/logs, checks, gists, notifications, code/issue search, repos and users. REST: set method (default GET) and path, e.g. '/repos/{owner}/{repo}/issues', '/repos/{owner}/{repo}/pulls/12/files', '/search/issues'; '{owner}' and '{repo}' are replaced with the current workspace's GitHub origin. Put URL parameters in query (per_page up to 100, page). Use body for POST/PATCH/PUT/DELETE payloads. For a PR diff use accept 'application/vnd.github.v3.diff'. GraphQL: set graphql (and variables); '{owner}'/'{repo}' are replaced there too. The result starts with 'HTTP <status>' and a 'link' header for pagination. Write operations ask the user to confirm first. Prefer this tool over running gh/curl in the terminal.",
inputSchema:{type:'object',properties:{
 method:{type:'string',enum:['GET','POST','PATCH','PUT','DELETE','HEAD'],description:'HTTP method for REST calls. Default GET.'},
 path:{type:'string',description:"REST path on api.github.com, e.g. /repos/{owner}/{repo}/pulls?state=open or /user. Ignored when graphql is set."},
 query:{type:'object',description:'URL query parameters, e.g. {"state":"open","per_page":50}.',additionalProperties:true},
 body:{description:'JSON request body for POST/PATCH/PUT/DELETE.'},
 graphql:{type:'string',description:'GraphQL query or mutation. When set, path/method are ignored.'},
 variables:{type:'object',description:'GraphQL variables.',additionalProperties:true},
 accept:{type:'string',description:'Accept header, e.g. application/vnd.github.v3.diff for a PR diff. Default application/vnd.github+json.'},
 max_chars:{type:'integer',minimum:2000,maximum:200000,description:'Truncate the response to this many characters. Default 60000.'}
},additionalProperties:false}};
if(k>=0)tools[k]=def;else{const c=tools.findIndex(t=>t.name==='opencode_confirm');tools.splice(c>=0?c:tools.length,0,def);}
fs.writeFileSync(pj,JSON.stringify(P,null,2)+'\n');console.log('package.json tools',tools.length);
