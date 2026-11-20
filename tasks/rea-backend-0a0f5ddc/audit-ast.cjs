// Read-only product analysis using an already installed JavaScript parser; writes task evidence only.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=process.cwd(),dir=path.join(root,'tasks/rea-backend-0a0f5ddc'),base=path.join(root,'defaults/rea/node_modules/rea-agents'),dist=path.join(base,'dist');
const parser=require(require.resolve('@babel/parser',{paths:[base]}));
const previous=JSON.parse(fs.readFileSync(path.join(dir,'audit.json'),'utf8'));
if(fs.existsSync(path.join(dir,'audit-ast.json')))throw Error('AST audit exists; inspect, do not replay');
const excluded=new Set(previous.proposedBoundaryExclusions),queue=[...previous.entrypoints],seen=new Set(),graph={},external={},dynamic=[],resources=[],errors=[];
const canonical=p=>path.relative(dist,path.resolve(dist,p)).replace(/\\/g,'/');
for(let i=0;i<queue.length;i++){
 const rel=canonical(queue[i]);if(seen.has(rel)||excluded.has(rel))continue;seen.add(rel);const absolute=path.resolve(dist,rel);
 if(!absolute.startsWith(base+path.sep)){errors.push({path:rel,reason:'outside upstream package'});continue;}
 if(!fs.existsSync(absolute)){errors.push({path:rel,reason:'missing'});continue;}
 const bytes=fs.readFileSync(absolute),edges=[],sha256=crypto.createHash('sha256').update(bytes).digest('hex');
 graph[rel]={sha256,imports:edges};if(!/\.[cm]?js$/.test(rel))continue;
 let ast;try{ast=parser.parse(bytes.toString('utf8'),{sourceType:'unambiguous'});}catch(e){errors.push({path:rel,reason:e.message});continue;}
 const specifier=(spec,line)=>{if(spec.startsWith('.')){const target=canonical(path.posix.join(path.posix.dirname(rel),spec));edges.push(target);if(!excluded.has(target))queue.push(target);}else if(!spec.startsWith('node:'))(external[spec]??=[]).push({path:rel,line});};
 const walk=node=>{
  if(!node||typeof node!=='object')return;
  if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration','ImportExpression'].includes(node.type)&&node.source?.type==='StringLiteral')specifier(node.source.value,node.loc?.start.line);
  if(node.type==='CallExpression'&&(node.callee.type==='Import'||(node.callee.type==='Identifier'&&node.callee.name==='require'))){const arg=node.arguments[0];if(arg?.type==='StringLiteral')specifier(arg.value,node.loc?.start.line);else dynamic.push({path:rel,line:node.loc?.start.line,expression:bytes.toString('utf8').slice(node.start,node.end).slice(0,300)});}
  if(node.type==='NewExpression'&&node.callee?.name==='URL'&&node.arguments[0]?.type==='StringLiteral'){
   const second=node.arguments[1];if(second?.type==='MemberExpression'&&second.object?.type==='MetaProperty'&&second.property?.name==='url'){
    const target=canonical(path.posix.join(path.posix.dirname(rel),node.arguments[0].value));resources.push({from:rel,path:target,exists:fs.existsSync(path.resolve(dist,target))});if(/\.[cm]?js$/.test(target))queue.push(target);
   }
  }
  for(const [key,v] of Object.entries(node)){if(['loc','start','end','extra','comments','tokens'].includes(key))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
 };walk(ast.program);
}
const catalog=JSON.parse(fs.readFileSync(path.join(dist,'mcp-catalog-full.json'),'utf8'));
const result={taskId:previous.taskId,at:new Date().toISOString(),pre:previous.pre,method:'Babel AST static module closure; no upstream execution',supersedesRegexDependencyEstimate:true,entrypoints:previous.entrypoints,proposedBoundaryExclusions:[...excluded],moduleCount:Object.keys(graph).length,external,dynamicImportsRequiringReview:dynamic,urlResources:resources,errors,catalogTopLevelKeys:Object.keys(catalog),catalogToolCount:catalog.tools?.length,graph,declaredEngines:previous.upstream.declaredEngines,buildNode:process.version,productSourcesChanged:false,buildRun:false,functionalTestsRun:false};
fs.writeFileSync(path.join(dir,'audit-ast.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,graph:undefined,external, urlResources:resources},null,2));
