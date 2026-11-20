// Item 11 — permission scopes per role / session (default off, and with no role assigned nothing is tightened).
// A role can allow/deny tools (glob) and paths (prefix, case-insensitive, / and \ equivalent) and be read-only.
// It only ever narrows what the existing gates already allow; it never widens anything.
import path from "node:path";

const WRITE_TOOLS = new Set(["apply_patch", "run_command", "send_command_input", "cancel_command", "configure_mcp", "bridge_memory_append", "bridge_memory_forget", "bridge_memory_handoff", "bridge_memory_archive", "bridge_memory_promote", "bridge_memory_consolidate", "bridge_memory_policy"]);
const glob = (pat) => new RegExp(`^${String(pat).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`, "i");
const norm = (p) => path.resolve(String(p)).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const under = (p, prefix) => { const a = norm(p), b = norm(prefix); return a === b || a.startsWith(`${b}/`); };

export function pathsOf(tool, args = {}) {
  const out = [];
  for (const k of ["path", "cwd", "workspace_root", "memory_dir"]) if (typeof args[k] === "string") out.push(args[k]);
  for (const f of Array.isArray(args.files) ? args.files : []) if (f && typeof f.path === "string") out.push(f.path); else if (typeof f === "string") out.push(f);
  if (tool === "apply_patch" && typeof args.patch === "string") for (const m of args.patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$|^\*\*\* Move to: (.+)$/gm)) out.push((m[1] ?? m[2]).trim());
  return out;
}
export function roleFor(ctx, cfg) {
  return cfg.owners?.[ctx.ownerId] ?? ctx.session?.role ?? cfg.defaultRole ?? null;
}
export function checkCall(tool, args, role, roleName) {
  if (!role) return null;
  if (role.denyTools?.some((p) => glob(p).test(tool))) return `角色 ${roleName} 禁止工具 ${tool}`;
  if (role.allowTools?.length && !role.allowTools.some((p) => glob(p).test(tool))) return `角色 ${roleName} 不允许工具 ${tool}`;
  if (role.readOnly && WRITE_TOOLS.has(tool)) return `角色 ${roleName} 为只读，禁止 ${tool}`;
  for (const p of pathsOf(tool, args)) {
    if (role.denyPaths?.some((d) => under(p, d))) return `角色 ${roleName} 禁止路径 ${p}`;
    if (role.allowPaths?.length && !role.allowPaths.some((d) => under(p, d))) return `角色 ${roleName} 不允许路径 ${p}`;
  }
  return null;
}
export function evaluate(ctx, cfg) {
  if (!cfg?.enabled) return null;
  const roleName = roleFor(ctx, cfg);
  if (!roleName) return null;
  const role = cfg.roles?.[roleName];
  if (!role) return `角色 ${roleName} 未定义，按最严处理拒绝`;
  const calls = [{ tool: ctx.toolName, args: ctx.args }, ...(ctx.toolName === "bridge_batch" && Array.isArray(ctx.args?.calls) ? ctx.args.calls.map((c) => ({ tool: c.tool, args: c.arguments ?? {} })) : [])];
  for (const c of calls) { const why = checkCall(c.tool, c.args, role, roleName); if (why) return why; }
  return null;
}

export const permissionsFeature = {
  id: "permissions",
  before(ctx) {
    const why = evaluate(ctx, ctx.config.permissions);
    if (!why) return null;
    return { deny: { isError: true, content: [{ type: "text", text: `PERMISSION_SCOPE：${why}。这是本机配置的权限范围（multica.config.json → permissions），不是临时故障；请改用允许的工具/路径。` }], structuredContent: { code: "PERMISSION_SCOPE", reason: why } } };
  },
  actions: {
    perm_whoami: (a, c) => ({ enabled: !!c.config.permissions?.enabled, role: roleFor({ ownerId: c.ownerId, session: c.session }, c.config.permissions ?? {}), roles: Object.keys(c.config.permissions?.roles ?? {}) }),
    perm_check: (a, c) => {
      const cfg = { ...(c.config.permissions ?? {}), enabled: true };
      const roleName = a.role ?? roleFor({ ownerId: c.ownerId, session: c.session }, cfg);
      return { role: roleName, denied: roleName ? checkCall(a.tool, a.args ?? {}, cfg.roles?.[roleName] ?? { denyTools: ["*"] }, roleName) : null };
    },
    /** A session may only switch itself into a role marked selfAssignable (used to narrow, e.g. "reviewer"). */
    perm_set_role: (a, c) => {
      const role = c.config.permissions?.roles?.[a.role];
      if (!role?.selfAssignable) throw Object.assign(new Error(`角色 ${a.role} 未标记 selfAssignable，不能自行切换`), { code: "NOT_ALLOWED" });
      c.session.role = a.role;
      return { role: a.role };
    }
  }
};
