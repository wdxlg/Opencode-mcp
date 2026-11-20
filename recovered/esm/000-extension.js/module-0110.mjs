// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-stdio-env.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/external-mcp-stdio-env.ts
init_define_OPENCODE_BUILD_INFO();

var MANAGED_STDIO_WINDOWS_ENV = [
  "APPDATA",
  "COMSPEC",
  "HOMEDRIVE",
  "HOMEPATH",
  "LOCALAPPDATA",
  "PATH",
  "PATHEXT",
  "PROCESSOR_ARCHITECTURE",
  "PROGRAMDATA",
  "PROGRAMFILES",
  "PROGRAMFILES(X86)",
  "SYSTEMDRIVE",
  "SYSTEMROOT",
  "TEMP",
  "TMP",
  "USERPROFILE",
  "WINDIR"
];

var MANAGED_STDIO_POSIX_ENV = ["HOME", "LANG", "LC_ALL", "LC_CTYPE", "LOGNAME", "PATH", "SHELL", "TEMP", "TMP", "TMPDIR", "USER"];

var canonical = (name, platform) => platform === "win32" ? name.toUpperCase() : name;

function managedStdioBaseEnvironment(host = process.env, platform = process.platform) {
  const allowed = new Set(platform === "win32" ? MANAGED_STDIO_WINDOWS_ENV : MANAGED_STDIO_POSIX_ENV);
  const selected = /* @__PURE__ */ Object.create(null);
  for (const [name, value] of Object.entries(host)) {
    const key = canonical(name, platform);
    if (allowed.has(key) && typeof value === "string") selected[key] = value;
  }
  return selected;
}

function hasCredentials(proxy) {
  try {
    const url2 = new URL(proxy);
    return !!(url2.username || url2.password);
  } catch {
    return true;
  }
}

function stdioProxyEnvironment(input) {
  const env10 = /* @__PURE__ */ Object.create(null);
  if (input.extraCaCertificates?.trim()) env10.NODE_EXTRA_CA_CERTS = input.extraCaCertificates.trim();
  if (input.mode === "none") return { env: env10 };
  let proxy;
  if (input.mode === "custom") {
    proxy = input.customProxy;
    if (!proxy) return { env: env10, notice: "\u5DF2\u9009\u62E9\u81EA\u5B9A\u4E49\u4EE3\u7406\uFF0C\u4F46\u5C1A\u672A\u586B\u5199\u4EE3\u7406\u5730\u5740\u3002" };
  } else {
    if (input.proxySupport === "off") return { env: env10 };
    if (input.pac && !input.resolvedProxy) return { env: env10, notice: "\u7CFB\u7EDF\u4F7F\u7528 PAC \u81EA\u52A8\u4EE3\u7406\uFF0C\u65E0\u6CD5\u5199\u5165\u73AF\u5883\u53D8\u91CF\uFF1B\u5982\u9700\u4EE3\u7406\uFF0C\u8BF7\u5728\u300C\u7F51\u7EDC\u4EE3\u7406\u300D\u4E2D\u9009\u62E9\u81EA\u5B9A\u4E49\u3002" };
    proxy = input.resolvedProxy;
    if (!proxy) return { env: env10 };
    if (hasCredentials(proxy)) return { env: env10, notice: "\u5F53\u524D\u4EE3\u7406\u542B\u7528\u6237\u540D\u6216\u5BC6\u7801\uFF0C\u672A\u81EA\u52A8\u4F20\u7ED9 stdio \u670D\u52A1\uFF1B\u5982\u9700\u4EE3\u7406\uFF0C\u8BF7\u5728\u300C\u7F51\u7EDC\u4EE3\u7406\u300D\u4E2D\u9009\u62E9\u81EA\u5B9A\u4E49\u3002" };
  }
  let url2;
  try {
    url2 = new URL(proxy);
  } catch {
    return { env: env10, notice: "\u4EE3\u7406\u5730\u5740\u65E0\u6548\uFF0C\u672A\u6CE8\u5165\u3002" };
  }
  if (url2.protocol.startsWith("socks")) {
    const socks = `socks5h://${url2.username ? `${url2.username}${url2.password ? `:${url2.password}` : ""}@` : ""}${url2.host}`;
    env10.ALL_PROXY = env10.all_proxy = socks;
  } else {
    env10.HTTP_PROXY = env10.HTTPS_PROXY = env10.http_proxy = env10.https_proxy = proxy;
    env10.NODE_USE_ENV_PROXY = "1";
  }
  const bypass = ["localhost", "127.0.0.1", "::1", ".local", ...(input.noProxy ?? []).map((entry) => entry.trim()).filter((entry) => /^[A-Za-z0-9.*:_\-[\]/]+$/.test(entry))];
  env10.NO_PROXY = env10.no_proxy = [...new Set(bypass)].join(",");
  return { env: env10 };
}

function managedStdioEnvironment(serverEnv, host = process.env, platform = process.platform, bundledBinDir) {
  const env10 = managedStdioBaseEnvironment(host, platform);
  const explicitPath = Object.keys(serverEnv ?? {}).some((name) => canonical(name, platform) === "PATH");
  if (bundledBinDir && !explicitPath) {
    const sep = platform === "win32" ? ";" : ":";
    const identity = (value) => {
      const unquoted = value.replace(/^"(.*)"$/, "$1");
      return (platform === "win32" ? unquoted.replace(/\\/g, "/").toLowerCase() : unquoted).replace(/\/+$/, "");
    };
    const existing = env10.PATH;
    if (!existing || !existing.split(sep).some((entry) => identity(entry) === identity(bundledBinDir))) {
      env10.PATH = existing ? `${existing}${sep}${bundledBinDir}` : bundledBinDir;
    }
  }
  for (const [name, value] of Object.entries(serverEnv ?? {})) {
    const key = canonical(name, platform);
    env10[key] = value;
  }
  return env10;
}
// OpenCode: Windows-MCP direct control. Upstream windows-mcp blocks desktop tools
// for 3 s after physical input and preempts on mouse movement; the bundled
// runtime/windows-mcp-direct/sitecustomize.py disables that for the windows-mcp
// stdio server only. OPENCODE_WINDOWS_MCP_DIRECT=0 in the server env opts out.
function isWindowsMcpLaunch(command, args) {
  if (!Array.isArray(args)) return false;
  const base = String(command ?? "").replace(/\\/g, "/").split("/").pop().toLowerCase().replace(/\.exe$/, "");
  if (base === "windows-mcp") return true;
  if (!["uvx", "uv", "python", "python3", "py", "pythonw"].includes(base)) return false;
  return args.some((arg) => /^windows[-_]mcp(?:\[[^\]]*\])?(?:\s*[=<>~!]=?.*)?$/i.test(String(arg)));
}
function windowsMcpDirectEnvironment(command, args, serverEnv, bundledBinDir, platform = process.platform) {
  if (platform !== "win32" || !bundledBinDir || !isWindowsMcpLaunch(command, args)) return {};
  const names = Object.keys(serverEnv ?? {});
  const read = (wanted) => {
    const name = names.find((item) => item.toUpperCase() === wanted);
    return name === void 0 ? void 0 : serverEnv[name];
  };
  if (/^(?:0|false|off|no)$/i.test(String(read("OPENCODE_WINDOWS_MCP_DIRECT") ?? "").trim())) return {};
  const runtimeDir = String(bundledBinDir).replace(/[\\/]+$/, "").replace(/[\\/][^\\/]*$/, "");
  const directDir = `${runtimeDir}\\windows-mcp-direct`;
  const existing = read("PYTHONPATH");
  return { OPENCODE_WINDOWS_MCP_DIRECT: "1", PYTHONPATH: existing ? `${directDir};${existing}` : directDir };
}
export { managedStdioBaseEnvironment, hasCredentials, stdioProxyEnvironment, managedStdioEnvironment, isWindowsMcpLaunch, windowsMcpDirectEnvironment, MANAGED_STDIO_WINDOWS_ENV, MANAGED_STDIO_POSIX_ENV, canonical };
