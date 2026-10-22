// OpenCode REA Bridge adapter, 2026-10-13. Local integration, not upstream REA.
// Two structured tools retain access to the full REA catalog without exceeding
// OpenCode's per-upstream discovery limit. No shell execution or target auto-open.
import { createRequire } from 'node:module';
import { pathToFileURL,fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
const stateRoot=process.env.OPENCODE_REA_STATE_ROOT||path.join(os.tmpdir(),'opencode-rea-sessions');
fs.mkdirSync(stateRoot,{recursive:true,mode:0o700});
const sessionDirectory=label=>fs.mkdtempSync(path.join(stateRoot,label+'-'));
let base=path.dirname(fileURLToPath(import.meta.url)),root;
for(let depth=0;depth<9;depth++){for(const candidate of [path.join(base,'rea/node_modules/rea-agents'),path.join(base,'resources/app/extensions/opencode/defaults/rea/node_modules/rea-agents')])if(fs.existsSync(path.join(candidate,'package.json')))root=candidate;if(root)break;base=path.dirname(base);}
if(!root)throw Error('Bundled REA runtime missing');
const resolve = createRequire(root + '/package.json');
const load = name => import(pathToFileURL(resolve.resolve(name)).href);
const [{ Client }, { StdioClientTransport }, { McpServer }, { serveStdio }, { z }] = await Promise.all([
  load('@modelcontextprotocol/client'), load('@modelcontextprotocol/client/stdio'),
  load('@modelcontextprotocol/server'), load('@modelcontextprotocol/server/stdio'), load('zod'),
]);
let catalog, ready = false, closing = false;
const sessions=new Map();
async function ownerSession(owner){
 if(closing)throw Error('REA_SHUTTING_DOWN: no new owner session was started');
 if(sessions.has(owner))return sessions.get(owner);
 if(sessions.size>=8)throw Error("REA_SESSION_LIMIT: maximum 8 isolated owners; restart this adapter after finishing tasks to release them");
 const pending=(async()=>{
  const client=new Client({name:"opencode-rea-owner",version:"1.1.0"},{capabilities:{}});
  const transport=new StdioClientTransport({command:process.execPath,args:[root+"/scripts/rea.mjs","mcp"],cwd:sessionDirectory('owner'),env,stderr:"pipe"});
  transport.stderr?.on("data",()=>{});
  try{await client.connect(transport,{timeout:30000});}
  catch{
   // Failed initialization dispatched no business tool. Release only its own
   // transport and capacity; never replace an established/uncertain session.
   try{await client.close();}catch{}
   try{await transport.close();}catch{}
   throw Error('REA_SESSION_CONNECT_FAILED: owner session initialization failed; no tool was dispatched');
  }
  return {client,active:false,id:crypto.randomUUID()};
 })();
 sessions.set(owner,pending);
 try{return await pending;}
 catch(error){if(sessions.get(owner)===pending)sessions.delete(owner);throw error;}
}
const upstream = new Client({ name: 'opencode-rea-adapter', version: '1.0.0' }, {
  capabilities: {}, listChanged: { tools: { onChanged: () => { catalog = undefined; } } },
});
const env = { ...process.env, REA_MCP_MAX_RESPONSE_BYTES: '10485760' };
delete env.HOPPER_TARGET_PATH; // Connecting must never implicitly open a target.
const transport = new StdioClientTransport({
  command: process.execPath, args: [root + '/scripts/rea.mjs', 'mcp'],
  cwd: sessionDirectory('catalog'), env, stderr: 'pipe',
});
transport.stderr?.on('data', () => {}); // Do not leak possible target data or credentials.
const connection = upstream.connect(transport, { timeout: 30000 }).then(() => {
  ready = true;
  upstream.onclose = () => { ready = false; catalog = undefined; };
}).catch(() => { ready = false; });
const failure = (code, message) => ({ isError: true, content: [{ type: 'text', text: JSON.stringify({ code, message }) }] });
const output = data => ({ content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data });
async function tools(signal) {
  await connection;
  if (!ready) throw new Error('UPSTREAM_UNAVAILABLE');
  if (catalog) return catalog;
  const found = []; let cursor;
  for (let page = 0; page < 20; page++) {
    const result = await upstream.listTools(cursor ? { cursor } : undefined, { signal, timeout: 20000 });
    found.push(...result.tools);
    if (found.length > 2000) throw new Error('CATALOG_LIMIT');
    cursor = result.nextCursor;
    if (!cursor) { catalog = found; return found; }
  }
  throw new Error('CATALOG_PAGE_LIMIT');
}
const handle = serveStdio(() => {
  const server = new McpServer({ name: 'opencode-rea-bridge', version: '1.0.0' }, {
    capabilities: {}, instructions: 'REA 6.4.0 adapter. Discover actual REA names and schemas with list_rea_tools; invoke through call_rea_tool. Do not treat tool availability as permission to execute targets or mutate files. Bridge-authenticated owners receive isolated upstream REA sessions; check binary_session before changing targets. Do not retry timed-out mutations without inspecting state.',
  });
  server.registerTool('list_rea_tools', {
    description: 'Discover all REA tools with pagination. Use query for keyword search, tool_name for an exact tool, and include_schema=true before calling it. Reports actual upstream tool count and schemas; listing does not run an analysis.',
    inputSchema: z.object({
      _bridge_owner: z.string().max(128).optional().describe('Injected by Bridge from authenticated command ownership; do not set manually.'),
      query: z.string().max(200).optional(), tool_name: z.string().max(200).optional(),
      offset: z.number().int().min(0).max(2000).default(0),
      limit: z.number().int().min(1).max(20).default(10), include_schema: z.boolean().default(false),
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async (input, context) => {
    try {
      const all = await tools(context.mcpReq.signal);
      const query = input.query?.toLowerCase();
      const matches = all.filter(t => (!input.tool_name || t.name === input.tool_name) && (!query || (t.name + ' ' + (t.description ?? '')).toLowerCase().includes(query)));
      const selected = matches.slice(input.offset, input.offset + input.limit);
      const data = { upstream: 'rea', version: '6.4.0', connected: ready, total_tools: all.length, matched_tools: matches.length,
        offset: input.offset, next_offset: input.offset + selected.length < matches.length ? input.offset + selected.length : null,
        tools: selected.map(t => input.include_schema ? t : { name: t.name, description: t.description, annotations: t.annotations }),
      };
      if (Buffer.byteLength(JSON.stringify(data)) > 350000) return failure('PAGE_TOO_LARGE', 'Request a smaller page, or one exact tool_name.');
      return output(data);
    } catch { return failure('DISCOVERY_FAILED', 'REA discovery failed or was cancelled. Check MCP connection state; no analysis was started.'); }
  });
  server.registerTool('call_rea_tool', {
    description: 'Invoke one REA tool by its exact name and arguments from list_rea_tools. Returns the actual REA MCP result, including errors and evidence. Some operations execute targets, use networks, write files, or change the shared active target: obtain task-specific authorization. Calls are serialized; do not automatically retry uncertain outcomes.',
    inputSchema: z.object({ _bridge_owner: z.string().max(128).optional().describe('Injected by Bridge; caller values are overridden.'), tool_name: z.string().min(1).max(200), arguments: z.record(z.string(), z.unknown()).default({}) }),
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true, idempotentHint: false },
  }, async (input, context) => {
    let session;
    try{session=await ownerSession(input._bridge_owner||'direct');}catch(e){return failure('SESSION_UNAVAILABLE',String(e.message));}
    if(session.active)return failure('BUSY','Another call for this owner is still active.');
    session.active=true;
    try {
      const all = await tools(context.mcpReq.signal);
      if (!all.some(t => t.name === input.tool_name)) return failure('UNKNOWN_TOOL', 'Name not present in the actual REA catalog. Discover tools first.');
      // REA's own MCP server validates the selected tool's full input schema.
      const result = await session.client.callTool({ name: input.tool_name, arguments: input.arguments }, { signal: context.mcpReq.signal, timeout: 330000 });
      // Bridge limits the serialized result to 1 MB; preserve a margin for wrapping.
      if (Buffer.byteLength(JSON.stringify(result)) > 700000) {
        return failure('RESULT_TOO_LARGE', 'REA completed the call, but its response exceeds the Bridge budget. Do not repeat the producer. Use get_evidence_bundle with detail=summary to find retained Evidence IDs, then inspect_analysis_view for smaller pages. This is a transport limit, not a claim that the operation failed.');
      }
      return {...result,_meta:{...result._meta,'opencode/reaSessionId':session.id}};
    } catch { return failure('CALL_INTERRUPTED', 'REA call failed, disconnected, timed out, or was cancelled. Outcome may be unknown; inspect session/evidence before retrying.'); }
    finally { session.active = false; }
  });
  return server;
}, { onerror: () => { process.stderr.write('REA adapter transport error.\n'); } });
async function shutdown() {
  if (closing) return; closing = true; ready = false;
  await Promise.allSettled([handle.close(), upstream.close(), ...[...sessions.values()].map(async p=>(await p).client.close())]);
}
for (const event of ['SIGTERM', 'SIGINT']) process.once(event, () => { void shutdown(); });
process.stdin.once('end', () => { void shutdown(); });
process.stdin.once('close', () => { void shutdown(); });
