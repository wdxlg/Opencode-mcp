// Focused regression: actual source methods + isolated filesystem fixtures. No application/model launch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'opencode-version-test-'));
const original={...process.env};
const results=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s);};
async function test(name,fn){await fn();results.push({name,passed:true});console.log('PASS '+name);}
const restore=()=>{for(const key of Object.keys(process.env))if(!(key in original))delete process.env[key];Object.assign(process.env,original);};
let services=[];
try {
  process.env.HOME=process.env.USERPROFILE=path.join(tmp,'home');
  process.env.APPDATA=path.join(tmp,'roaming');process.env.LOCALAPPDATA=path.join(tmp,'local');
  process.env.TEMP=process.env.TMP=path.join(tmp,'temp');fs.mkdirSync(process.env.TEMP,{recursive:true});
  process.env.OPENCODE_AUTOMATION_HOME=path.join(tmp,'shared');
  const {localProfilePath,assertMcpRuntimePaths}=await import(pathToFileURL(path.join(root,'recovered/shared/version-paths.mjs')));
  const a=path.join(tmp,'version-a'),b=path.join(tmp,'version-b');
  for(const app of [a,b]){write(path.join(app,'OPENCODE-RELEASE.json'),'{}');write(path.join(app,'resources/app/out/main.js'),'fixture');}
  const boot=read('recovered/esm/006-main.js/module-0394.mjs');
  const start=boot.indexOf('function configurePortable('),end=boot.indexOf('\nexport {',start);
  const bootFunction=boot.slice(start,end).replaceAll('import.meta.dirname','moduleDirectory');
  function portable(app,env={}){
    const p={platform:process.platform,env};
    const configure=vm.runInNewContext(bootFunction+';configurePortable',{path,fs,process:p,moduleDirectory:path.join(app,'resources/app/out')});
    return {result:configure({applicationName:'opencode'}),env};
  }
  await test('normal startup ignores inherited foreign profile and creates local data',()=>{
    const foreign=path.join(a,'data');fs.mkdirSync(foreign,{recursive:true});
    const x=portable(b,{VSCODE_PORTABLE:foreign});assert.equal(x.result.portableDataPath,path.join(b,'data'));assert.equal(x.env.VSCODE_PORTABLE,path.join(b,'data'));assert.equal(x.env.TEMP,path.join(b,'data/tmp'));
    assert.equal(portable(a).result.portableDataPath,foreign);
  });
  await test('only this runtime recovery profile is accepted; foreign recovery rejected',()=>{
    assert.equal(portable(b,{VSCODE_PORTABLE:path.join(b,'.recovery-profile')}).result.portableDataPath,path.join(b,'.recovery-profile'));
    assert.equal(portable(b,{VSCODE_PORTABLE:path.join(a,'.recovery-profile')}).result.portableDataPath,path.join(b,'data'));
  });
  await test('CLI and main portable bootstrap stay identical',()=>{
    const cli=read('recovered/esm/005-cli.js/module-0054.mjs');
    assert.equal(cli.slice(cli.indexOf('function configurePortable('),cli.indexOf('\nexport {',cli.indexOf('function configurePortable('))),boot.slice(start,end));
  });
  await test('Windows launcher shares rules while isolating ordinary data (stubbed application start)',()=>{
    if(process.platform!=='win32') return;
    const source=read('assets/Start-Isolated.cmd');assert(source.includes('start "" "%~dp0OpenCode.exe"'));
    const stub=source.split(/\r?\n/).map(line=>line.startsWith('start "" ')?'echo RULES=%OPENCODE_AUTOMATION_HOME%\r\necho PROFILE=%VSCODE_PORTABLE%\r\necho DISCOVERY=%OPENCODE_SHARED_LOCALAPPDATA%':line).join('\r\n');
    const file=path.join(b,'launcher-fixture.cmd');write(file,stub);
    const local=path.join(tmp,'original-local'),env={...process.env,LOCALAPPDATA:local};delete env.OPENCODE_AUTOMATION_HOME;delete env.OPENCODE_SHARED_LOCALAPPDATA;
    const run=spawnSync(process.env.ComSpec||'cmd.exe',['/d','/c',file],{env,encoding:'utf8',timeout:10000});
    assert.equal(run.status,0,run.stderr);assert(run.stdout.includes('RULES='+path.join(local,'OpenCode/shared-automation')));assert(run.stdout.includes('PROFILE='+path.join(b,'.recovery-profile')));assert(run.stdout.includes('DISCOVERY='+local));
  });
  const profile=path.join(b,'data');process.env.VSCODE_PORTABLE=profile;
  await test('private paths reject traversal, another version, and directory junctions',()=>{
    assert.equal(localProfilePath(path.join(profile,'skills')),path.join(profile,'skills'));
    assert.throws(()=>localProfilePath(path.join(a,'data/skills')),/VERSION_DATA_OUTSIDE_PROFILE/);
    const link=path.join(profile,'linked');fs.symlinkSync(path.join(a,'data'),link,process.platform==='win32'?'junction':'dir');
    assert.throws(()=>localProfilePath(path.join(link,'skills')),/VERSION_DATA_LINK/);fs.unlinkSync(link);
  });
  await test('MCP rejects other runtime command/argument/env without altering config',()=>{
    const own=path.join(b,'OpenCode.exe'),foreign=path.join(a,'resources/app/helper.js');
    for(const config of [{transport:'stdio',command:foreign},{transport:'stdio',command:'node',args:[foreign]},{transport:'stdio',command:'node',env:{STATE:foreign}}])assert.throws(()=>assertMcpRuntimePaths(config,own),/MCP_CROSS_VERSION_PATH/);
    assert.equal(assertMcpRuntimePaths({transport:'stdio',command:'node',args:[path.join(b,'resources/app/helper.js')]},own).command,'node');
    assert.equal(assertMcpRuntimePaths({transport:'http',url:'https://example.invalid'},own).transport,'http');
  });
  const settingsSource=read('recovered/esm/000-extension.js/module-0026.mjs');
  const cls=settingsSource.slice(settingsSource.indexOf('var GlobalSkillSettings = class'),settingsSource.lastIndexOf('\nexport'));
  const Settings=vm.runInNewContext(cls+';GlobalSkillSettings',{localProfilePath,process,import_node_fs2:fs,import_node_path2:{default:path},import_node_crypto:crypto});
  await test('Skills settings use portable relative paths and survive copy/rename',()=>{
    const file=path.join(profile,'.opencode/global-skills.json'),settings=new Settings(file,path.join(profile,'skills'));
    settings.setDirectory(path.join(profile,'skills-custom'));const stored=JSON.parse(fs.readFileSync(file));assert.equal(stored.version,2);assert.equal(stored.directory,'skills-custom');
    const moved=path.join(tmp,'renamed-version/data');fs.mkdirSync(moved,{recursive:true});const movedFile=path.join(moved,'.opencode/global-skills.json');write(movedFile,fs.readFileSync(file));
    process.env.VSCODE_PORTABLE=moved;assert.equal(new Settings(movedFile,path.join(moved,'skills')).getDirectory(),path.join(moved,'skills-custom'));
    write(movedFile,JSON.stringify({version:1,directory:path.join(a,'data/skills')}));assert.throws(()=>new Settings(movedFile,'').getDirectory(),/VERSION_DATA_OUTSIDE_PROFILE/);process.env.VSCODE_PORTABLE=profile;
  });
  const catalogSource=read('recovered/esm/000-extension.js/module-0059.mjs');
  await test('legacy MCP migration is copy-only and never overwrites destination',()=>{
    const legacy=path.join(tmp,'legacy/external-mcp.json'),target=path.join(profile,'skills/external-mcp.json');write(legacy,'{"servers":[]}');
    const method=catalogSource.slice(catalogSource.indexOf('  migrateLegacyConfig(target) {'),catalogSource.indexOf('  /** Read-only answer'));
    const obj=vm.runInNewContext('({'+method+'})',{LEGACY_EXTERNAL_MCP_CONFIG_PATH:legacy,import_node_fs19:fs,import_node_path24:{default:path}});
    obj.migrateLegacyConfig(target);assert.equal(fs.readFileSync(legacy,'utf8'),'{"servers":[]}');assert.equal(fs.readFileSync(target,'utf8'),'{"servers":[]}');
    write(target,'local');obj.migrateLegacyConfig(target);assert.equal(fs.readFileSync(target,'utf8'),'local');assert(!fs.existsSync(legacy+'.migrated.bak'));
  });
  await test('MCP catalog never falls back to public HOME in portable mode',()=>{
    const fn=catalogSource.slice(catalogSource.indexOf('function defaultExternalMcpConfigPath()'),catalogSource.indexOf('\nvar MAX_EXTERNAL_MCP_SERVERS'));
    const get=vm.runInNewContext(fn+';defaultExternalMcpConfigPath',{globalSkillsDirectory:()=>undefined,process,localProfilePath,import_node_path24:{default:path},LEGACY_EXTERNAL_MCP_CONFIG_PATH:path.join(tmp,'public.json'),EXTERNAL_MCP_CONFIG_FILENAME:'external-mcp.json'});
    assert.equal(get(),path.join(profile,'.opencode/external-mcp.json'));
  });
  const module=path.join(root,'recovered/shared/automation-store.mjs');
  const {AutomationService}=await import(pathToFileURL(module));
  function service(extra={}){const s=new AutomationService({initialText:()=> 'test only',workspaces:()=>[],...extra});services.push(s);return s;}
  await test('two profiles and an independent process continuously share schema-4 rules',async()=>{
    const first=service({snapshot:path.join(a,'data/snapshot.json')});await first.initialize();
    const second=service({snapshot:path.join(b,'data/snapshot.json')});await second.initialize();
    assert.equal(first.file,second.file);await first.mutate('fixture',state=>{state.presets[0].name='from-A';});assert.equal(second.read().presets[0].name,'from-A');
    const child=spawnSync(process.execPath,['--input-type=module','-e',`import {AutomationService} from ${JSON.stringify(pathToFileURL(module).href)};const s=new AutomationService({workspaces:()=>[]});try{await s.initialize();await s.mutate('fixture',x=>{x.presets[0].name='from-child';});}finally{s.dispose();}`],{env:{...process.env,VSCODE_PORTABLE:path.join(a,'data')},encoding:'utf8',timeout:15000});
    assert.equal(child.status,0,child.stderr);assert.equal(first.read().presets[0].name,'from-child');assert.equal(second.read().presets[0].name,'from-child');
  });
  await test('legacy schemas require explicit migration and future formats are never overwritten',async()=>{
    const originalShared=process.env.OPENCODE_AUTOMATION_HOME;
    for(const schema of [1,2,3,999]){
      process.env.OPENCODE_AUTOMATION_HOME=path.join(tmp,'schema-'+schema);
      const s=service(),fixture=services[0].read();fixture.schemaVersion=schema;
      if(schema===1)for(const group of fixture.presets){group.text='legacy';delete group.rules;}
      if(schema<3){delete fixture.ruleLibrary;delete fixture.ruleLibraryVersion;for(const group of fixture.presets)for(const rule of group.rules||[]){delete rule.libraryRuleId;delete rule.libraryVersion;}}
      write(s.file,JSON.stringify(fixture));const before=fs.readFileSync(s.file);
      await assert.rejects(()=>s.initialize(),e=>e.code===(schema===999?'RULES_SCHEMA_UNSUPPORTED':'RULES_MIGRATION_CONFIRMATION_REQUIRED'));
      assert.deepEqual(fs.readFileSync(s.file),before);
      if(schema!==999){const enabled=service({allowLegacyMigration:true});await enabled.initialize();assert.equal(enabled.read().schemaVersion,4);assert(fs.readdirSync(enabled.directory).some(x=>x.includes('schema-'+schema+'-backup.')));}
    }
    process.env.OPENCODE_AUTOMATION_HOME=originalShared;
  });
  await test('missing Skill blocks worker authorization before any paid request',async()=>{
    const text=read('recovered/shared/collaboration-workers.mjs');const method=text.slice(text.indexOf('  async authorize('),text.indexOf('  async pump('));
    const object=vm.runInNewContext('({'+method+'})',{fail:(code,message)=>{throw Object.assign(new Error(message),{code});}});
    const task={id:'fixture',status:'queued',attempts:[]};object.service={requireCollaboration(){},read:()=>({}),task:()=>task,collaboration:{route:()=>({skills:['required'],model:{vendor:'x',id:'m'}})}};object.active=new Map();object.queued=new Map();object.models=async()=>[];object.refreshCatalog=async()=>({skills:[],skillDiscoveryError:null});
    await assert.rejects(()=>object.authorize(['fixture']),e=>e.code==='TASK_DEPENDENCY_MISSING');assert.equal(object.queued.size,0);
  });
  await test('clean-build publishes only after verification; launcher captures shared path before redirection',()=>{
    const clean=read('scripts/clean-build.cjs');assert(clean.indexOf("'publish-runtime.cjs'")>clean.indexOf("'verify-build.cjs'"));
    const launch=read('assets/Start-Isolated.cmd');assert(launch.indexOf('set "OPENCODE_AUTOMATION_HOME=')<launch.indexOf('set "LOCALAPPDATA='));assert(!launch.includes('set "OPENCODE_AUTOMATION_HOME=%VSCODE_PORTABLE%'));
  });
  fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/version-isolation-tests.json'),JSON.stringify({passed:true,results,applicationStarted:false,realModelRequests:false,usedRealUserData:false,at:new Date().toISOString()},null,2));
} finally {for(const s of services)s.dispose();restore();await fsp.rm(tmp,{recursive:true,force:true});}
