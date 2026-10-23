const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const shared=['shared-skills-paths.mjs','version-paths.mjs','concurrency-runtime.mjs','default-bootstrap.mjs','task-workbench.mjs','workbench-mcp-publisher.mjs','builtin-extension-uninstall.mjs','automation-store.mjs','automation-workbench.mjs','collaboration-contracts.mjs','collaboration-workspaces.mjs','collaboration-runtime.mjs','collaboration-workers.mjs','collaboration-staff-contracts.mjs','collaboration-staff-store.mjs','collaboration-staff.mjs','collaboration-staff-integration.mjs','external-mcp-content.mjs','windows-mcp-integration.mjs','assistant-source-registry.mjs','assistant-source-local.mjs','project-memory.mjs'];
for(const name of fs.readdirSync(root+'/recovered/esm')){
 const base=root+'/recovered/esm/'+name,mp=base+'/modules.json';if(!fs.existsSync(mp))continue;
 const meta=JSON.parse(fs.readFileSync(mp));const used=new Set();
 for(const m of meta.modules){if(shared.includes(m.file))continue;const text=fs.readFileSync(base+'/'+m.file,'utf8');for(const file of shared)if(text.includes("'./"+file+"'")||text.includes('"./'+file+'"'))used.add(file);}
 if(used.has('task-workbench.mjs'))used.add('workbench-mcp-publisher.mjs');
 if(used.has('default-bootstrap.mjs'))used.add('concurrency-runtime.mjs');
 if(used.has('automation-workbench.mjs')){used.add('automation-store.mjs');used.add('external-mcp-content.mjs');}
 if(used.has('automation-store.mjs')){used.add('concurrency-runtime.mjs');used.add('project-memory.mjs');}
 // Resolve maintained shared imports transitively, using either JavaScript quote style.
 const queue=[...used];for(let i=0;i<queue.length;i++){const text=fs.readFileSync(root+'/recovered/shared/'+queue[i],'utf8');for(const file of shared)if((text.includes("'./"+file+"'")||text.includes('"./'+file+'"'))&&!used.has(file)){used.add(file);queue.push(file);}}
 let changed=false;for(const file of used){const data=fs.readFileSync(root+'/recovered/shared/'+file);if(!fs.existsSync(base+'/'+file)||!fs.readFileSync(base+'/'+file).equals(data))fs.writeFileSync(base+'/'+file,data);if(!meta.modules.some(x=>x.file===file)){meta.modules.push({file,modulePath:'maintained/shared/'+file});changed=true;}}
 if(changed)fs.writeFileSync(mp,JSON.stringify(meta,null,2));
}
console.log('Shared source variants synchronized');
