// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/mcp-runtime-host.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/mcp-runtime-host.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_child_process6 = require("node:child_process");

var import_promises11 = require("node:fs/promises");

var import_node_path26 = __toESM(require("node:path"));

function runProvisionCommand(command, args, timeoutMs, log) {
  return new Promise((resolve) => {
    let output2 = "";
    let child;
    try {
      child = (0, import_node_child_process6.spawn)(command, [...args], { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    } catch (error2) {
      resolve({ ok: false, output: error2 instanceof Error ? error2.message : String(error2) });
      return;
    }
    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {
      }
    }, Math.max(1e3, timeoutMs));
    const collect = (chunk) => {
      output2 += chunk.toString("utf8");
      if (output2.length > 64e3) output2 = output2.slice(-64e3);
    };
    child.stdout?.on("data", collect);
    child.stderr?.on("data", collect);
    child.on("error", (error2) => {
      clearTimeout(timer);
      resolve({ ok: false, output: `${output2}
${error2.message}`.trim() });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      log?.(`[configure_mcp] ${command} ${args.join(" ")} -> exit ${code ?? "null"}`);
      resolve({ ok: code === 0, output: output2 });
    });
  });
}

async function hasExecutableOnPath(command, bundledBinDir) {
  if (bundledBinDir && (command === "uv" || command === "uvx")) {
    try {
      await (0, import_promises11.access)(import_node_path26.default.join(bundledBinDir, command + (process.platform === "win32" ? ".exe" : "")));
      return true;
    } catch {
    }
  }
  const probe = process.platform === "win32" ? "where" : "which";
  const result = await runProvisionCommand(probe, [command], 15e3);
  return result.ok;
}
export { runProvisionCommand, hasExecutableOnPath, import_node_child_process6, import_promises11, import_node_path26 };
