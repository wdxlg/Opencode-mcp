import fs from 'node:fs';
import path from 'node:path';
const equal = (a,b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
function inside(root, target) { const rel=path.relative(root,target); return !rel || !path.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..'+path.sep); }
export function localProfilePath(value, profile=process.env.VSCODE_PORTABLE) {
  const target=path.resolve(value);
  if (!profile) return target;
  const base=path.resolve(profile);
  if (!inside(base,target)) throw Error('VERSION_DATA_OUTSIDE_PROFILE：此配置仍引用本运行版之外的目录。请在本版本数据目录内重新选择位置；原配置和文件未迁移、未删除。');
  let cursor=target;
  for (;;) {
    try { if(fs.lstatSync(cursor).isSymbolicLink()) throw Error('VERSION_DATA_LINK：版本私有数据不能通过链接共享。'); }
    catch(error) { if(error.code!=='ENOENT') throw error; }
    if(equal(cursor,base)) break;
    cursor=path.dirname(cursor);
  }
  return target;
}
function runtimeRoot(value) {
  let cursor=path.resolve(value), tail=[];
  // Resolve existing parent links as well as existing files; do not leak the actual path in errors.
  for (;;) {
    try { cursor=path.join(fs.realpathSync(cursor),...tail); break; }
    catch(error) { if(error.code!=='ENOENT'&&error.code!=='ENOTDIR') throw error; }
    const parent=path.dirname(cursor);if(parent===cursor){cursor=path.join(cursor,...tail);break;}
    tail.unshift(path.basename(cursor));cursor=parent;
  }
  for (;;) {
    if(fs.existsSync(path.join(cursor,'OPENCODE-RELEASE.json'))) return cursor;
    try { const product=JSON.parse(fs.readFileSync(path.join(cursor,'resources','app','product.json'),'utf8')); if(product.applicationName==='opencode') return cursor; } catch {}
    const parent=path.dirname(cursor); if(parent===cursor) return null; cursor=parent;
  }
}
export function assertMcpRuntimePaths(runtime, executable=process.execPath) {
  if(runtime.transport!=='stdio') return runtime;
  const own=runtimeRoot(executable);
  if(!own) return runtime;
  const values=[runtime.command,runtime.cwd,...runtime.args||[],...Object.values(runtime.env||{})];
  for(const value of values) {
    if(typeof value!=='string') continue;
    const candidate=value.startsWith('--')&&value.includes('=')?value.slice(value.indexOf('=')+1):value;
    if(!path.isAbsolute(candidate)) continue;
    const other=runtimeRoot(candidate);
    if(other&&!equal(path.resolve(other),path.resolve(own))) throw Error('MCP_CROSS_VERSION_PATH：MCP 配置引用另一个 OpenCode 运行版。请核对启动命令、参数或工作目录；原配置保留，不自动改写或调用旧版。');
  }
  return runtime;
}
