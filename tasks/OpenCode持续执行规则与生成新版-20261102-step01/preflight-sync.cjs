// Read-only safety inspection before scripts/sync-shared.cjs.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const shared=['shared-skills-paths.mjs','bundled-leanrea.mjs','version-paths.mjs','concurrency-runtime.mjs','default-bootstrap.mjs','task-workbench.mjs','workbench-mcp-publisher.mjs','builtin-extension-uninstall.mjs','automation-store.mjs','automation-workbench.mjs','collaboration-review.mjs','collaboration-merge.mjs','collaboration-contracts.mjs','collaboration-workspaces.mjs','collaboration-runtime.mjs','collaboration-workers.mjs','collaboration-staff-contracts.mjs','collaboration-staff-store.mjs','collaboration-staff.mjs','collaboration-staff-integration.mjs','external-mcp-content.mjs','windows-mcp-integration.mjs','assistant-source-registry.mjs','assistant-source-local.mjs','project-memory.mjs'];
const changes=[];
for(const name of fs.readdirSync(root+'/recovered/esm')){
 const base=root+'/recovered/esm/'+name,mp=base+'/modules.json';if(!fs.existsSync(mp))continue;
 const meta=JSON.parse(fs.readFileSync(mp)),used=new Set();
 for(const m of meta.modules){if(shared.includes(m.file))continue;const text=fs.readFileSync(base+'/'+m.file,'utf8');for(const f of shared)if(text.includes("'./"+f+"'")||text.includes('"./'+f+'"'))used.add(f);}
 if(used.has('task-workbench.mjs'))used.add('workbench-mcp-publisher.mjs');if(used.has('default-bootstrap.mjs'))used.add('concurrency-runtime.mjs');if(used.has('automation-workbench.mjs')){used.add('automation-store.mjs');used.add('external-mcp-content.mjs');}if(used.has('automation-store.mjs')){used.add('concurrency-runtime.mjs');used.add('project-memory.mjs');}
 const queue=[...used];for(let i=0;i<queue.length;i++){const text=fs.readFileSync(root+'/recovered/shared/'+queue[i],'utf8');for(const f of shared)if((text.includes("'./"+f+"'")||text.includes('"./'+f+'"'))&&!used.has(f)){used.add(f);queue.push(f);}}
 for(const f of used){const dest=base+'/'+f,src=root+'/recovered/shared/'+f;if(!fs.existsSync(dest)||!fs.readFileSync(dest).equals(fs.readFileSync(src)))changes.push(path.relative(root,dest).replaceAll('\\','/'));if(!meta.modules.some(x=>x.file===f))changes.push(path.relative(root,mp).replaceAll('\\','/')+' (module entry)');}
}
console.log(JSON.stringify({changes},null,2));
if(changes.some(p=>p!=='recovered/esm/000-extension.js/automation-store.mjs'))process.exitCode=2;
