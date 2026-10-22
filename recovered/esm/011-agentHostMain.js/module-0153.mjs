// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/request/node/proxy.ts
import { isBoolean } from "./module-0008.mjs";


// src/vs/platform/request/node/proxy.ts
import { parse as parseUrl } from "url";

function getSystemProxyURI(requestURL, env2) {
  if (requestURL.protocol === "http:") {
    return env2.HTTP_PROXY || env2.http_proxy || null;
  } else if (requestURL.protocol === "https:") {
    return env2.HTTPS_PROXY || env2.https_proxy || env2.HTTP_PROXY || env2.http_proxy || null;
  }
  return null;
}

async function getProxyAgent(rawRequestURL, env2, options = {}) {
  const requestURL = parseUrl(rawRequestURL);
  const proxyURL = options.proxyUrl || getSystemProxyURI(requestURL, env2);
  if (!proxyURL) {
    return null;
  }
  const proxyEndpoint = parseUrl(proxyURL);
  if (!/^https?:$/.test(proxyEndpoint.protocol || "")) {
    return null;
  }
  const opts = {
    host: proxyEndpoint.hostname || "",
    port: (proxyEndpoint.port ? +proxyEndpoint.port : 0) || (proxyEndpoint.protocol === "https" ? 443 : 80),
    auth: proxyEndpoint.auth,
    rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true
  };
  if (requestURL.protocol === "http:") {
    const { default: mod } = await import("http-proxy-agent");
    return new mod.HttpProxyAgent(proxyURL, opts);
  } else {
    const { default: mod } = await import("https-proxy-agent");
    return new mod.HttpsProxyAgent(proxyURL, opts);
  }
}
export { getSystemProxyURI, getProxyAgent, parseUrl };
