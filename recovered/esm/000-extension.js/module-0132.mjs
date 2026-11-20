// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/bridge-http-router.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { describeProtocolSupport } from "./module-0135.mjs";
import { getBuildInfo } from "./module-0133.mjs";
import { gzip as zlibGzip } from "node:zlib";


// src/bridge-http-router.ts
init_define_OPENCODE_BUILD_INFO();


// src/bridge-http-router.ts
function createBridgeHttpRoutes(routeToken) {
  return {
    endpointPath: `/mcp/${routeToken}`,
    healthPath: `/healthz/${routeToken}`
  };
}

function writeBridgeJsonError(response, statusCode, message2) {
  writeBridgeJsonRpcError(response, statusCode, statusCode === 404 ? -32004 : -32e3, message2, null);
}

function writeBridgeJsonRpcError(response, statusCode, rpcCode, message2, id) {
  if (response.headersSent) return;
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({
    jsonrpc: "2.0",
    error: { code: rpcCode, message: message2 },
    id
  }));
}

/**
 * bridge-gzip-step01: compress plain JSON MCP responses (e.g. tools/list, about 4.4 MB) with gzip
 * when the client advertises Accept-Encoding: gzip. SSE (text/event-stream), small bodies (< 1 KB),
 * responses that already carry Content-Encoding, and clients that do not ask for gzip are passed
 * through untouched, so behaviour only changes in transfer size. Compression is async (no event-loop
 * stall); on a compression error the original bytes are sent uncompressed.
 */
function enableBridgeJsonGzip(request, response) {
  const accept = String(request.headers["accept-encoding"] ?? "");
  if (!/(^|[,\s])gzip(\s*;\s*q=(?!0(\.0*)?\s*($|,))[0-9.]+)?\s*($|,)/i.test(accept)) return;
  const originalWriteHead = response.writeHead;
  const originalWrite = response.write;
  const originalEnd = response.end;
  const originalFlushHeaders = response.flushHeaders;
  let mode;
  let status;
  let reason;
  const chunks = [];
  const restore = () => {
    response.writeHead = originalWriteHead;
    response.write = originalWrite;
    response.end = originalEnd;
    response.flushHeaders = originalFlushHeaders;
  };
  const decide = () => {
    if (mode) return mode;
    const contentType = String(response.getHeader("content-type") ?? "");
    mode = /application\/json/i.test(contentType) && !response.getHeader("content-encoding") ? "gzip" : "pass";
    if (mode === "pass") restore();
    return mode;
  };
  const toBuffer = (chunk, encoding) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk instanceof Uint8Array ? chunk : String(chunk), typeof encoding === "string" ? encoding : "utf8");
  response.writeHead = function(statusCode, ...rest) {
    if (mode !== "gzip") {
      const headers = typeof rest[0] === "string" ? rest[1] : rest[0];
      if (Array.isArray(headers)) { mode = "pass"; restore(); return originalWriteHead.call(response, statusCode, ...rest); }
      if (headers) for (const [key, value] of Object.entries(headers)) if (value !== void 0) response.setHeader(key, value);
      if (decide() === "pass") return typeof rest[0] === "string" ? originalWriteHead.call(response, statusCode, rest[0]) : originalWriteHead.call(response, statusCode);
    }
    status = statusCode;
    if (typeof rest[0] === "string") reason = rest[0];
    return response;
  };
  response.flushHeaders = function() {
    if (decide() === "pass") return originalFlushHeaders.call(response);
  };
  response.write = function(chunk, encoding, callback) {
    if (decide() === "pass") return originalWrite.call(response, chunk, encoding, callback);
    if (chunk !== void 0 && chunk !== null) chunks.push(toBuffer(chunk, encoding));
    const done = typeof encoding === "function" ? encoding : callback;
    if (typeof done === "function") process.nextTick(done);
    return true;
  };
  response.end = function(chunk, encoding, callback) {
    if (typeof chunk === "function") { callback = chunk; chunk = void 0; encoding = void 0; }
    else if (typeof encoding === "function") { callback = encoding; encoding = void 0; }
    if (decide() === "pass") return originalEnd.call(response, chunk, encoding, callback);
    if (chunk !== void 0 && chunk !== null) chunks.push(toBuffer(chunk, encoding));
    const body = Buffer.concat(chunks);
    restore();
    const finish = (payload, compressed) => {
      if (response.headersSent || response.destroyed) return;
      response.setHeader("Vary", "Accept-Encoding");
      if (compressed) response.setHeader("Content-Encoding", "gzip");
      response.setHeader("Content-Length", String(payload.length));
      const code = status ?? response.statusCode;
      if (reason !== void 0) originalWriteHead.call(response, code, reason); else originalWriteHead.call(response, code);
      originalEnd.call(response, payload, callback);
    };
    if (body.length < 1024) { finish(body, false); return response; }
    zlibGzip(body, (error, zipped) => error ? finish(body, false) : finish(zipped, true));
    return response;
  };
}

async function readJsonBody(request, maxRequestBytes) {
  return await new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buffer.length;
      if (total > maxRequestBytes) {
        reject(new Error(`MCP request body exceeds ${maxRequestBytes} bytes.`));
        request.destroy();
        return;
      }
      chunks.push(buffer);
    });
    request.on("end", () => {
      if (chunks.length === 0) {
        resolve(void 0);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("MCP request body is not valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

async function handleBridgeHttpRequest(options, handlers, request, response) {
  const url2 = new URL(request.url ?? "/", "http://127.0.0.1");
  if (url2.pathname === options.routes.healthPath) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      writeBridgeJsonError(response, 405, "Method not allowed.");
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.writeHead(200);
    if (request.method !== "HEAD") {
      const protocol = describeProtocolSupport();
      response.end(JSON.stringify({
        ok: true,
        name: "opencode-bridge",
        sessions: handlers.getSessionCount(),
        build: getBuildInfo(),
        latestProtocolVersion: protocol.latest,
        supportedVersions: protocol.supportedVersions,
        protocol: protocol.transport,
        statelessCapable: protocol.statelessCapable,
        workspaceHub: "machine-wide (macOS) / globalStorage (Linux) - account and chat preserved across workspace switches"
      }));
    } else {
      response.end();
    }
    return;
  }
  if (url2.pathname !== options.routes.endpointPath) {
    writeBridgeJsonError(response, 404, "Not found");
    return;
  }
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "content-type, accept, mcp-session-id, mcp-protocol-version, mcp-method, mcp-name, last-event-id, authorization, x-opencode-account, x-opencode-workspace, x-opencode-client-id");
  response.setHeader("Access-Control-Expose-Headers", "mcp-session-id, mcp-protocol-version, mcp-method, mcp-name");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  response.setHeader("Cache-Control", "no-store");
  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }
  const sessionId = request.headers["mcp-session-id"];
  const protocolVersion = request.headers["mcp-protocol-version"];
  const mcpMethod = request.headers["mcp-method"] ?? request.headers["Mcp-Method"];
  const mcpName = request.headers["mcp-name"] ?? request.headers["Mcp-Name"];
  if (request.method === "POST") {
    const body = await readJsonBody(request, options.maxRequestBytes);
    enableBridgeJsonGzip(request, response);
    await handlers.handlePost(request, response, body, sessionId, protocolVersion, mcpMethod, mcpName);
    return;
  }
  if (request.method === "GET") {
    if (!options.standaloneGetEnabled) {
      response.setHeader("Allow", "POST, DELETE, OPTIONS");
      writeBridgeJsonError(response, 405, "Standalone SSE is disabled for Cloudflare Quick Tunnel; use Streamable HTTP POST responses.");
      return;
    }
    if (!sessionId) {
      writeBridgeJsonError(response, 400, "Bad Request: Mcp-Session-Id header is required for GET requests.");
      return;
    }
    await handlers.handleGet(request, response, sessionId);
    return;
  }
  if (request.method === "DELETE") {
    if (!sessionId) {
      writeBridgeJsonError(response, 400, "Bad Request: Mcp-Session-Id header is required for DELETE requests.");
      return;
    }
    await handlers.handleDelete(request, response, sessionId);
    return;
  }
  writeBridgeJsonError(response, 405, "Method not allowed.");
}
export { createBridgeHttpRoutes, writeBridgeJsonError, writeBridgeJsonRpcError, readJsonBody, handleBridgeHttpRequest };
