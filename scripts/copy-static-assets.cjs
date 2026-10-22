const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=process.env.OPENCODE_RECOVERY_ROOT||path.resolve(__dirname,'..');
const target=root+'/generated/source-build';
if(!fs.existsSync(target+'/RECOVERY-OUTPUT.json'))throw Error('Run build-recovered first');
const manifest=JSON.parse(fs.readFileSync(root+'/reports/static-assets.json'));
const extraFile=root+'/recovered/workbench-assets.json';const extras=fs.existsSync(extraFile)?JSON.parse(fs.readFileSync(extraFile)):{static:[],scripts:[]};
if(!Array.isArray(extras.static)||!Array.isArray(extras.scripts))throw Error('Invalid maintained asset manifest');
for(const rel of extras.static){if(typeof rel!=='string'||rel.includes('..')||rel.includes('\\')||!rel.startsWith('resources/app/extensions/opencode/media/task-workbench/')||/\.(?:c|m)?js$/i.test(rel))throw Error('Invalid maintained static asset');if(!manifest.files.some(f=>f.path===rel))manifest.files.push({path:rel});}

let changed=0,removed=0;
for(const file of manifest.files){
 const source=path.resolve(root,'assets',file.path),dest=path.resolve(target,file.path);
 if(!source.startsWith(path.resolve(root,'assets')+path.sep)||!dest.startsWith(path.resolve(target)+path.sep)||/\.(?:c|m)?js$/i.test(dest))throw Error('Invalid static asset path');
 const data=fs.readFileSync(source);
 if(fs.existsSync(dest)&&fs.readFileSync(dest).equals(data))continue;
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);changed++;
}
// Retire only manifest-pinned legacy artifacts; preserve customized or user-owned files.
const retiredArtifacts=manifest.retiredArtifacts||[];
if(!Array.isArray(retiredArtifacts))throw Error('Invalid retired-artifact manifest');
const targetRoot=path.resolve(target),retiredPaths=new Set();
const removals=[];
for(const item of retiredArtifacts){
 if(!item||typeof item.path!=='string'||typeof item.sha256!=='string'||!/^[a-f0-9]{64}$/i.test(item.sha256)||retiredPaths.has(item.path))throw Error('Invalid or duplicate retired artifact');
 const rel=item.path,expected=item.sha256;retiredPaths.add(rel);
 const file=path.resolve(target,rel);
 if(!file.startsWith(targetRoot+path.sep))throw Error('Retired artifact escapes generated output: '+rel);
 if(!fs.existsSync(file))continue;
 for(let part=file;;part=path.dirname(part)){
  if(fs.lstatSync(part).isSymbolicLink())throw Error('Retired generated document traverses a link; refusing removal: '+rel);
  if(part===targetRoot)break;
 }
 const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(actual!==expected)throw Error('Retired generated artifact was customized; refusing removal: '+rel);
 removals.push(file);
}
for(const file of removals){fs.unlinkSync(file);removed++;}
console.log(JSON.stringify({staticAssets:manifest.files.length,changed,removed}));
