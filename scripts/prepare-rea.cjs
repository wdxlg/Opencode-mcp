// Rebuild only embedded backend assets from maintained source and an existing dependency cache.
// No install/download, upstream CLI/service, lifecycle scripts or engine execution.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'recovered/rea-backend'),defaults=path.join(root,'defaults'),cache=path.join(root,'upstream/rea-backend-deps/node_modules');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifestPath=path.join(defaults,'manifest.json'),oldBytes=fs.readFileSync(manifestPath),manifest=JSON.parse(oldBytes),provenance=read(path.join(source,'PROVENANCE.json'));
if(provenance.architecture!=='embedded-native-backend'||provenance.tools!==229)throw Error('Backend source port is incomplete');
const assets=new Map();
function addTree(dir,prefix){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.isSymbolicLink())throw Error('Linked backend asset refused');const p=path.join(dir,entry.name),rel=prefix+'/'+entry.name;if(entry.isDirectory())addTree(p,rel);else if(entry.isFile())assets.set(rel,fs.readFileSync(p));}}
addTree(source,'rea-backend');
const dependencyLock=read(path.join(source,'DEPENDENCIES.lock.json'));
function treeDigest(dir){const rows=[];function visit(d,prefix=''){for(const e of fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){if(e.isSymbolicLink())throw Error('Linked dependency refused');const file=path.join(d,e.name),rel=prefix+e.name;if(e.isDirectory())visit(file,rel+'/');else if(e.isFile())rows.push(rel+'\0'+hash(fs.readFileSync(file)));}}visit(dir);return hash(rows.join('\n'));}

for(const name of Object.keys(provenance.packages)){if(['rea-agents','frida','electron','@modelcontextprotocol/server'].includes(name))throw Error('Standalone service/engine dependency refused');const p=path.join(cache,...name.split('/'));if(read(path.join(p,'package.json')).version!==provenance.packages[name].version)throw Error('Dependency version changed: '+name);if(treeDigest(p)!==dependencyLock.packages[name]?.treeSha256)throw Error('Locked dependency content changed: '+name);const assetRoot=name.startsWith('rea-agents/node_modules/')?'rea-backend/vendor/node_modules/'+name.slice('rea-agents/node_modules/'.length):'rea-backend/node_modules/'+name;addTree(p,assetRoot);}
const oldEntries=new Map(manifest.files.map(f=>[f.path,f]));
for(const [rel,data]of assets){const p=path.join(defaults,rel);if(fs.existsSync(p)){const old=oldEntries.get(rel),current=fs.readFileSync(p);if(!current.equals(data)&&(!old||hash(current)!==old.sha256))throw Error('Customized/unmanaged backend asset refused: '+rel);}}
const retiring=manifest.files.filter(f=>f.path==='rea-bridge.mjs'||f.path.startsWith('rea/')||(f.path.startsWith('rea-backend/')&&!assets.has(f.path)));
for(const f of retiring){const p=path.join(defaults,f.path);if(fs.existsSync(p)&&hash(fs.readFileSync(p))!==f.sha256)throw Error('Legacy default was customized, refusing removal: '+f.path);}
if(retiring.some(f=>f.path==='rea-bridge.mjs'||f.path.startsWith('rea/'))&&!process.argv.includes('--retire-legacy'))throw Error('Explicit --retire-legacy is required for the one-time owned runtime asset retirement');
for(const [rel,data]of assets){const p=path.join(defaults,rel);fs.mkdirSync(path.dirname(p),{recursive:true});if(!fs.existsSync(p)||!fs.readFileSync(p).equals(data))fs.writeFileSync(p,data);}
for(const f of retiring){const p=path.join(defaults,f.path);if(fs.existsSync(p))fs.unlinkSync(p);}
// Remove only now-empty owned parent directories, never unrelated user files.
const dirs=new Set();for(const f of retiring){for(let d=path.dirname(path.join(defaults,f.path));d!==defaults&&d.startsWith(defaults+path.sep);d=path.dirname(d))dirs.add(d);}
for(const d of [...dirs].sort((a,b)=>b.length-a.length))if(fs.existsSync(d)&&fs.readdirSync(d).length===0)fs.rmdirSync(d);
manifest.files=manifest.files.filter(f=>!f.path.startsWith('rea/')&&f.path!=='rea-bridge.mjs'&&!f.path.startsWith('rea-backend/'));
for(const [rel,data]of assets)manifest.files.push({path:rel,bytes:data.length,sha256:hash(data)});
manifest.files.sort((a,b)=>a.path.localeCompare(b.path));manifest.rea={version:'6.8.0',architecture:'embedded-native-backend',tools:229,nodeRuntimeBundled:false,externalEnginesBundled:false,sourceIntegrity:provenance.sourceIntegrity};
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('REA_BACKEND_PREPARED '+JSON.stringify({assets:assets.size,retired:retiring.length,source:'recovered/rea-backend',dependencyPackages:Object.keys(provenance.packages).length,previousManifestSha256:hash(oldBytes),manifestSha256:hash(fs.readFileSync(manifestPath)),productStarted:false}));
