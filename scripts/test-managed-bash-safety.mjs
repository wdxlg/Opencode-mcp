// Opt-in protocol and isolated real-Bash regression. Only printf/exit run in a fresh HOME.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const protocolSource=fs.readFileSync(path.join(root,'recovered/esm/000-extension.js/module-0169.mjs'),'utf8');
const brokerSource=fs.readFileSync(path.join(root,'recovered/esm/000-extension.js/module-0165.mjs'),'utf8');
const protocolText=protocolSource.slice(protocolSource.indexOf('function windowsManagedBashProtocol('),protocolSource.indexOf('function safeInteger('));
const protocol=vm.runInNewContext(protocolText+';windowsManagedBashProtocol');
const finishText=brokerSource.slice(brokerSource.indexOf('  finishState('),brokerSource.indexOf('  pruneCommandStates(',brokerSource.indexOf('  finishState(')));
function finish(output, code=0) {
 const method=vm.runInNewContext('({'+finishText+'})',{Date});method.pruneCommandStates=()=>{};
 const state={status:'running',output:Buffer.from(output),resolveDone(){this.done=true;}};
 method.finishState(state,code);return state;
}
test('literal exclamation survives the actual Windows-protocol Bash invocation',()=>{
 const spec=protocol('isolated_test');
 const match=spec.args[3].match(/exec "\$BASH" ([^;]+)$/);assert(match);
 const args=match[1].trim().split(/\s+/);
 const bash=process.platform==='win32'?path.join(root,'generated/source-build/resources/app/extensions/opencode/runtime/git/bin/bash.exe'):'/bin/bash';
 assert(fs.existsSync(bash),'Bundled Bash must already exist; do not install dependencies automatically');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'opencode-bash-safety-'));
 try {
  const result=spawnSync(bash,args,{cwd:dir,env:{...process.env,HOME:dir,USERPROFILE:dir,HISTFILE:path.join(dir,'history'),PROMPT_COMMAND:'',PS1:'',BASH_ENV:''},input:'printf "%s\\n" "![data"\nexit\n',encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/!\[data/);assert(!result.stderr.includes('event not found'),result.stderr);
  assert(args.includes('+H'));
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('POSIX managed Bash disables history expansion too',()=>{
 assert.match(brokerSource,/args: \["--noprofile", "--norc", "\+H", "-i"\]/);
});
test('history-expansion failure cannot be reported as a successful command',()=>{
 const state=finish('bash: ![data,.recovery: event not found\r\n');
 assert.equal(state.status,'failed');assert.equal(state.exitCode,null);assert.equal(state.suspectedParserError,true);assert.equal(state.done,true);
});
test('normal output and nonzero failures retain their terminal status',()=>{
 const ok=finish('literal ! safely printed\n');assert.equal(ok.status,'completed');assert.equal(ok.exitCode,0);
 const bad=finish('ordinary failure\n',7);assert.equal(bad.status,'failed');assert.equal(bad.exitCode,7);
});
