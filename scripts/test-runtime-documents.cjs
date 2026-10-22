const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const work=fs.mkdtempSync(path.join(os.tmpdir(),'opencode-docs-'));
const artifacts=['resources/app/extensions/opencode/GUIDE.md','独立版说明.md','开始使用.md','standalone-tools/import-settings.cjs','导入旧版普通设置.cmd','resources/app/out/vs/workbench/workbench.desktop.main.js.copy-prompt-backup-20261007','resources/app/out/vs/sessions/sessions.desktop.main.js.copy-prompt-backup-20261007'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const outputPath=(out,rel)=>path.join(out,...rel.split('/'));
let count=0;function check(x,label){assert(x,label);count++;console.log('PASS '+label);}
function fixture(n,skip=[]){const r=path.join(work,n),out=r+'/generated/source-build';fs.mkdirSync(out,{recursive:true});fs.mkdirSync(r+'/reports');fs.mkdirSync(r+'/assets');const records=artifacts.map((rel,i)=>{const data=Buffer.from('retired-artifact-fixture-'+i+'\n');return{path:rel,sha256:sha(data),data};});fs.writeFileSync(r+'/reports/static-assets.json',JSON.stringify({files:[],retiredArtifacts:records.map(({path,sha256})=>({path,sha256}))}));fs.writeFileSync(out+'/RECOVERY-OUTPUT.json','{}');for(const record of records){if(skip.includes(record.path))continue;const file=outputPath(out,record.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,record.data);}return{root:r,records};}
function run(r){return cp.spawnSync(process.execPath,[root+'/scripts/copy-static-assets.cjs'],{encoding:'utf8',env:{...process.env,OPENCODE_RECOVERY_ROOT:r}});}
try{
 let f=fixture('normal'),r=f.root,out=r+'/generated/source-build';
 fs.mkdirSync(out+'/data');fs.writeFileSync(out+'/data/开始使用.md','user data');fs.writeFileSync(out+'/LICENSE.txt','license');fs.writeFileSync(out+'/README.md','unrelated');
 let x=run(r);check(x.status===0,'cleanup succeeds');check(f.records.every(a=>!fs.existsSync(outputPath(out,a.path))),'all retired artifacts absent');check(fs.readFileSync(out+'/data/开始使用.md','utf8')==='user data','same-named user data preserved');check(fs.readFileSync(out+'/LICENSE.txt','utf8')==='license','license preserved');check(fs.readFileSync(out+'/README.md','utf8')==='unrelated','unrelated document preserved');check(run(r).status===0,'cleanup idempotent');
 f=fixture('custom');r=f.root;out=r+'/generated/source-build';const custom=f.records.find(a=>a.path==='开始使用.md');fs.writeFileSync(outputPath(out,custom.path),'customized');x=run(r);check(x.status!==0&&x.stderr.includes('customized'),'customized artifact rejected');check(fs.existsSync(outputPath(out,'独立版说明.md'))&&fs.readFileSync(outputPath(out,custom.path),'utf8')==='customized','preflight prevents partial artifact removal');
 f=fixture('link',['resources/app/extensions/opencode/GUIDE.md']);r=f.root;out=r+'/generated/source-build';const guide=f.records.find(a=>a.path==='resources/app/extensions/opencode/GUIDE.md');let ext=path.join(work,'outside');fs.mkdirSync(ext);fs.writeFileSync(ext+'/GUIDE.md',guide.data);fs.mkdirSync(out+'/resources/app/extensions',{recursive:true});fs.symlinkSync(ext,out+'/resources/app/extensions/opencode','junction');x=run(r);check(x.status!==0&&x.stderr.includes('link'),'linked ancestor rejected');check(fs.existsSync(ext+'/GUIDE.md')&&fs.existsSync(outputPath(out,'独立版说明.md')),'external and remaining artifacts preserved');
 const a=fs.readFileSync(root+'/assets/resources/app/OPENCODE_CHANGELOG.md','utf8'),b=fs.readFileSync(root+'/assets/resources/app/OPENCODE_CHANGELOG_SHORT.md','utf8');
 check(!/支付|付款|套餐|订单|权益|付费|刷新授权|授权连续性|授权服务器校验/.test(a+b),'software monetization paragraphs absent');
 check(a.includes('OAuth 浏览器授权')&&b.includes('GitHub Authentication'),'external authentication notes retained');
 check(a.includes('任务展示栏高度可拖动')&&a.includes('模型选择器')&&b.includes('API 供应商支持两种请求协议'),'unrelated feature notes retained');
 console.log('DOCUMENT_CHECKS_PASSED='+count);
}finally{fs.rmSync(work,{recursive:true,force:true});}
