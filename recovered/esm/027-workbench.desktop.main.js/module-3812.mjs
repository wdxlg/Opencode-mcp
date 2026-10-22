// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/parts/request/common/requestImpl.ts
import { canceled } from "./module-0004.mjs";
import { VSBuffer, bufferToStream } from "./module-0038.mjs";
import { OfflineError } from "./module-1690.mjs";


// src/vs/base/parts/request/common/requestImpl.ts
async function request(options3, token, isOnline) {
  if (token.isCancellationRequested) {
    throw canceled();
  }
  const cancellation = new AbortController();
  const disposable = token.onCancellationRequested(() => cancellation.abort());
  const signal = options3.timeout ? AbortSignal.any([
    cancellation.signal,
    AbortSignal.timeout(options3.timeout)
  ]) : cancellation.signal;
  try {
    const fetchInit = {
      method: options3.type || "GET",
      headers: getRequestHeaders(options3),
      body: options3.data,
      signal
    };
    if (options3.disableCache) {
      fetchInit.cache = "no-store";
    }
    const res = await fetch(options3.url || "", fetchInit);
    return {
      res: {
        statusCode: res.status,
        headers: getResponseHeaders(res)
      },
      stream: bufferToStream(VSBuffer.wrap(new Uint8Array(await res.arrayBuffer())))
    };
  } catch (err) {
    if (isOnline && !isOnline()) {
      throw new OfflineError();
    }
    if (err?.name === "AbortError") {
      throw canceled();
    }
    if (err?.name === "TimeoutError") {
      throw new Error(`Fetch timeout: ${options3.timeout}ms`);
    }
    throw err;
  } finally {
    disposable.dispose();
  }
}

function getRequestHeaders(options3) {
  if (options3.headers || options3.user || options3.password || options3.proxyAuthorization) {
    const headers = new Headers();
    outer: for (const k in options3.headers) {
      switch (k.toLowerCase()) {
        case "user-agent":
        case "accept-encoding":
        case "content-length":
          continue outer;
      }
      const header2 = options3.headers[k];
      if (typeof header2 === "string") {
        headers.set(k, header2);
      } else if (Array.isArray(header2)) {
        for (const h3 of header2) {
          headers.append(k, h3);
        }
      }
    }
    if (options3.user || options3.password) {
      headers.set("Authorization", "Basic " + btoa(`${options3.user || ""}:${options3.password || ""}`));
    }
    if (options3.proxyAuthorization) {
      headers.set("Proxy-Authorization", options3.proxyAuthorization);
    }
    return headers;
  }
  return void 0;
}

function getResponseHeaders(res) {
  const headers = /* @__PURE__ */ Object.create(null);
  res.headers.forEach((value2, key3) => {
    if (headers[key3]) {
      if (Array.isArray(headers[key3])) {
        headers[key3].push(value2);
      } else {
        headers[key3] = [headers[key3], value2];
      }
    } else {
      headers[key3] = value2;
    }
  });
  return headers;
}
export { request, getRequestHeaders, getResponseHeaders };
