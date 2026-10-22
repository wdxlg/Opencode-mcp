// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-connection.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { externalMcpTimeout } from "./module-0060.mjs";
import { Client, SSEClientTransport, StreamableHTTPClientTransport } from "./module-0070.mjs";
import { StdioClientTransport } from "./module-0156.mjs";
import { managedStdioEnvironment } from "./module-0110.mjs";


// extensions/opencode/src/external-mcp-connection.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_os6 = __toESM(require("node:os"));


// extensions/opencode/src/external-mcp-connection.ts
var DEFAULT_TIMEOUTS = { connect: 5e3, list: 3e3, call: 2e4 };

function externalMcpTimeoutMs(config2, phase) {
  const seconds = externalMcpTimeout(config2.timeout);
  return seconds === void 0 ? DEFAULT_TIMEOUTS[phase] : Math.round(seconds * 1e3);
}

async function connectWithin(work, timeoutMs) {
  let timer;
  try {
    await Promise.race([work, new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error("upstream connection timed out"), { name: "TimeoutError" })), timeoutMs);
    })]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function connectExternalMcp(config2, onChanged, onClosed, bundledBinDir, firstConnectTimeoutMs) {
  const mode = config2.httpTransport ?? "streamable-http";
  const attempts = config2.transport === "stdio" ? ["stdio"] : mode === "auto" ? ["streamable-http", "sse"] : [mode];
  for (const attempt of attempts) {
    const client = new Client({ name: "opencode-bridge-upstream", version: "1.0.0" }, {
      capabilities: {},
      listChanged: { tools: { onChanged: () => onChanged() } }
    });
    let transport;
    let probeStatus;
    try {
      if (attempt === "stdio") {
        if (!config2.command) throw new Error("missing command");
        const stdio = new StdioClientTransport({
          command: config2.command,
          args: config2.args ?? [],
          env: managedStdioEnvironment(config2.env, process.env, process.platform, bundledBinDir),
          cwd: config2.cwd ?? import_node_os6.default.homedir(),
          stderr: "pipe"
        });
        stdio.stderr?.on("data", () => void 0);
        transport = stdio;
      } else {
        if (!config2.url) throw new Error("missing URL");
        const endpoint = new URL(config2.url);
        const guardedFetch = async (input, init) => {
          const url2 = new URL(input instanceof Request ? input.url : String(input));
          if (url2.origin !== endpoint.origin || url2.username || url2.password || url2.hash) {
            throw new Error("MCP endpoint must stay on the configured origin");
          }
          const authorization = await config2.oauth?.token();
          const headers = new Headers(init?.headers ?? config2.headers);
          if (authorization) headers.set("Authorization", `Bearer ${authorization.token}`);
          let response = await fetch(input, { ...init, headers, redirect: "error" });
          if (response.status === 401 && authorization && config2.oauth) {
            await response.body?.cancel().catch(() => void 0);
            const renewed = await config2.oauth.token(authorization.stamp);
            headers.set("Authorization", `Bearer ${renewed.token}`);
            response = await fetch(input, { ...init, headers, redirect: "error" });
          }
          if (attempt === "streamable-http" && probeStatus === void 0 && (init?.method ?? "GET").toUpperCase() === "POST") probeStatus = response.status;
          return response;
        };
        const options = { requestInit: { headers: config2.headers }, fetch: guardedFetch };
        transport = attempt === "sse" ? new SSEClientTransport(endpoint, options) : new StreamableHTTPClientTransport(endpoint, options);
      }
      const timeout = firstConnectTimeoutMs ?? externalMcpTimeoutMs(config2, "connect");
      await connectWithin(client.connect(transport, { timeout }), timeout);
      client.onclose = onClosed;
      client.onerror = () => onClosed();
      return {
        list: async (signal) => {
          const tools=[],seen=new Set();let cursor;
          for(let page=0;page<100;page++){
            const result=await client.listTools(cursor?{cursor}:undefined,{signal,timeout:externalMcpTimeoutMs(config2,'list')});
            if(!Array.isArray(result.tools))throw Error('Invalid upstream tools/list page');
            tools.push(...result.tools);
            if(tools.length>100)throw Error('Upstream exceeds the supported 100-tool budget');
            const next=result.nextCursor;
            if(next===undefined||next===null||next==='')return tools;
            if(typeof next!=='string'||seen.has(next))throw Error('Upstream tools/list cursor did not advance');
            seen.add(next);cursor=next;
          }
          throw Error('Upstream tools/list pagination budget exceeded');
        },
        call: (name, args, signal) => client.callTool({ name, arguments: args }, { signal, timeout: externalMcpTimeoutMs(config2, "call") }),
        close: () => client.close()
      };
    } catch (error2) {
      await client.close().catch(() => void 0);
      await transport?.close().catch(() => void 0);
      if (mode === "auto" && attempt === "streamable-http" && probeStatus !== void 0 && [400, 404, 405, 406, 415].includes(probeStatus)) continue;
      throw error2;
    }
  }
  throw new Error("MCP transport unavailable");
}
export { externalMcpTimeoutMs, connectWithin, connectExternalMcp, import_node_os6, DEFAULT_TIMEOUTS };
