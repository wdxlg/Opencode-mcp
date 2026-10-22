// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpFormModel.ts



// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpFormModel.ts
var fail = (field, problem) => ({ ok: false, field, problem });

function mcpFormServerKey(name, kind, url, command4, args2) {
  if (/[A-Za-z]/.test(name)) {
    return name;
  }
  if (kind === "http") {
    try {
      return new URL(url).hostname || "server";
    } catch {
      return "server";
    }
  }
  const pkg = args2.find((arg) => /^@?[a-z0-9._-]+(?:\/[a-z0-9._-]+)?$/i.test(arg) && !arg.startsWith("-"));
  return pkg || command4.split(/[\\/]/).pop() || "server";
}

function pairs(field, rows) {
  const values = /* @__PURE__ */ Object.create(null);
  for (const row of rows) {
    const name = row.name.trim();
    if (!name && !row.value) {
      continue;
    }
    if (!name) {
      return { error: fail(field, field === "headers" ? "\u8BF7\u586B\u5199\u8BF7\u6C42\u5934\u540D\u79F0\u3002" : "\u8BF7\u586B\u5199\u73AF\u5883\u53D8\u91CF\u540D\u79F0\u3002") };
    }
    if (!row.value) {
      return { error: fail(field, `\u8BF7\u586B\u5199\u300C${name}\u300D\u7684\u503C\u3002`) };
    }
    if (Object.keys(values).some((existing) => field === "headers" ? existing.toLowerCase() === name.toLowerCase() : existing === name)) {
      return { error: fail(field, `\u300C${name}\u300D\u91CD\u590D\u4E86\u3002`) };
    }
    values[name] = row.value;
  }
  return { values: Object.keys(values).length ? values : void 0 };
}

function buildMcpFormImport(values) {
  const label3 = values.name.trim();
  if (!label3) {
    return fail("name", "\u8BF7\u586B\u5199\u540D\u79F0\u3002");
  }
  if (label3.length > 100) {
    return fail("name", "\u540D\u79F0\u6700\u591A 100 \u4E2A\u5B57\u7B26\u3002");
  }
  const description = values.description?.trim();
  if (description && (description.length > 2e3 || description.includes("\0"))) {
    return fail("description", "\u63CF\u8FF0\u6700\u591A 2000 \u4E2A\u5B57\u7B26\uFF0C\u4E0D\u80FD\u5305\u542B\u7A7A\u5B57\u7B26\u3002");
  }
  const timeoutText = values.timeout?.trim();
  const timeout2 = timeoutText ? Number(timeoutText) : void 0;
  if (timeout2 !== void 0 && (!Number.isFinite(timeout2) || timeout2 < 1 || timeout2 > 3600)) {
    return fail("timeout", "\u8D85\u65F6\u987B\u4E3A 1\u20133600 \u79D2\u7684\u6570\u5B57\u3002");
  }
  let definition;
  let secrets;
  let key3;
  if (values.kind === "http") {
    const url = values.url.trim();
    if (!url) {
      return fail("url", "\u8BF7\u586B\u5199\u8FDC\u7A0B URL\u3002");
    }
    if (!/^https?:\/\//i.test(url)) {
      return fail("url", "\u8FDC\u7A0B URL \u9700\u4EE5 https:// \u5F00\u5934\uFF08\u672C\u673A\u5730\u5740\u53EF\u7528 http://\uFF09\u3002");
    }
    definition = { type: "http", ...values.httpTransport ? { transport: values.httpTransport } : {}, url, label: label3 };
    const headers = pairs("headers", values.headers);
    if ("error" in headers) {
      return headers.error;
    }
    if (headers.values) {
      secrets = { headers: headers.values };
    }
    if (values.auth === "oauth") {
      const clientId = values.oauthClientId?.trim();
      const scope = values.oauthScope?.trim();
      const clientSecret = values.oauthClientSecret;
      if (clientId && (clientId.length > 1024 || /[\r\n\0]/.test(clientId) || clientId.includes("${"))) {
        return fail("oauthClientId", "OAuth Client ID \u65E0\u6548\u3002");
      }
      if (scope && (scope.length > 2048 || !/^[\x21\x23-\x5B\x5D-\x7E]+(?: +[\x21\x23-\x5B\x5D-\x7E]+)*$/.test(scope))) {
        return fail("oauthScope", "Scope \u987B\u4E3A\u7A7A\u683C\u5206\u9694\u7684\u6709\u6548\u6743\u9650\u540D\u79F0\u3002");
      }
      if (clientSecret && !clientId) {
        return fail("oauthClientId", "\u586B\u5199 Client Secret \u65F6\u4E5F\u987B\u586B\u5199 Client ID\u3002");
      }
      if (clientSecret && (clientSecret.length > 4096 || /[\r\n\0]/.test(clientSecret) || clientSecret.includes("${"))) {
        return fail("oauthClientSecret", "OAuth Client Secret \u65E0\u6548\u3002");
      }
      if (headers.values && Object.keys(headers.values).some((name) => name.toLowerCase() === "authorization")) {
        return fail("headers", "OAuth \u4E0E\u81EA\u5B9A\u4E49 Authorization \u4E0D\u80FD\u540C\u65F6\u8BBE\u7F6E\uFF1B\u5176\u4ED6\u8BF7\u6C42\u5934\u53EF\u4EE5\u4FDD\u7559\u3002");
      }
      definition.authType = "oauth";
      definition.oauth = { ...clientId ? { clientId } : {}, ...scope ? { scope } : {} };
      if (clientSecret) {
        secrets = { ...secrets, oauthClientSecret: clientSecret };
      }
    } else if (values.auth === "bearer") {
      const token = values.bearer.trim();
      if (!token) {
        return fail("bearer", "\u8BF7\u586B\u5199 Bearer \u4EE4\u724C\uFF0C\u6216\u628A\u9274\u6743\u6539\u4E3A\u201C\u65E0\u201D\u3002");
      }
      if (headers.values && Object.keys(headers.values).some((name) => name.toLowerCase() === "authorization")) {
        return fail("headers", "Bearer \u4E0E\u81EA\u5B9A\u4E49 Authorization \u4E0D\u80FD\u540C\u65F6\u8BBE\u7F6E\uFF1B\u53EF\u4EE5\u6DFB\u52A0\u5176\u4ED6\u8BF7\u6C42\u5934\u3002");
      }
      secrets = { ...secrets, bearer: token };
    } else if (values.auth === "headers" && !headers.values) {
      return fail("headers", "\u8BF7\u81F3\u5C11\u586B\u5199\u4E00\u4E2A\u8BF7\u6C42\u5934\uFF0C\u6216\u628A\u9274\u6743\u6539\u4E3A\u201C\u65E0\u201D\u3002");
    }
    key3 = mcpFormServerKey(label3, "http", url, "", []);
  } else {
    const command4 = values.command.trim();
    if (!command4) {
      return fail("command", "\u8BF7\u586B\u5199\u542F\u52A8\u547D\u4EE4\uFF0C\u4F8B\u5982 npx\u3002");
    }
    const args2 = values.args.split(/\r?\n/).map((arg) => arg.trim()).filter(Boolean);
    if (args2.length > 64) {
      return fail("args", "\u53C2\u6570\u6700\u591A 64 \u9879\u3002");
    }
    const cwd2 = values.cwd?.trim();
    if (cwd2 && (cwd2.length > 4096 || /[\r\n\0]/.test(cwd2) || cwd2.includes("${"))) {
      return fail("cwd", "\u8BF7\u586B\u5199\u5DF2\u89E3\u6790\u7684\u5DE5\u4F5C\u76EE\u5F55\uFF0C\u4E0D\u8981\u5305\u542B\u6362\u884C\u6216\u53D8\u91CF\u5F15\u7528\u3002");
    }
    definition = { type: "stdio", command: command4, args: args2, label: label3, ...cwd2 ? { cwd: cwd2 } : {} };
    const env2 = pairs("env", values.env);
    if ("error" in env2) {
      return env2.error;
    }
    if (env2.values) {
      secrets = { env: env2.values };
    }
    key3 = mcpFormServerKey(label3, "stdio", "", command4, args2);
  }
  if (description) {
    definition.description = description;
  }
  if (timeout2 !== void 0) {
    definition.timeout = timeout2;
  }
  return { ok: true, raw: JSON.stringify({ mcpServers: { [key3]: definition } }), label: label3, secrets };
}
export { mcpFormServerKey, pairs, buildMcpFormImport, fail };
