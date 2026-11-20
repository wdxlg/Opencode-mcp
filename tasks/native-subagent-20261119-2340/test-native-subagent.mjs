// Unit test for native-subagent-20261119-2340: Bridge calls made by an OpenCode native subagent (agent-host
// spawn_subagent, a session with a parentID) get their own canvas identity marked subagent:true + parentId and are
// hidden by the webview filter; top-level native sessions keep the shared "local" entry, unmarked.
// node tasks/native-subagent-20261119-2340/test-native-subagent.mjs   (no OpenCode, no browser needed)
import fs from "node:fs";
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const { CanvasConsole, localSubagentOf } = await import(pathToFileURL(path.join(root, "recovered/shared/canvas-console.mjs")).href);

let pass = 0, fail = 0;
const ok = (cond, name, extra) => { if (cond) { pass++; console.log("PASS", name); } else { fail++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };

// ---- the shipped pieces of the chain, evaluated from source ----
const collabJs = read("recovered/standalone/resources/app/extensions/opencode/media/task-workbench/collaboration.js");
const filterSrc = collabJs.match(/const isSubAi = (\(a\) => [^\n]*?);\s*\n/);
ok(!!filterSrc, "collaboration.js isSubAi filter found");
const isSubAi = filterSrc ? (0, eval)(filterSrc[1]) : () => false;

// agent host: spawn_subagent gives the sub run a session; the tool executor forwards it; agent/run forwards it to the extension.
const m29 = read("recovered/esm/002-agent-host.js/module-0029.mjs");
ok(/subagentSession: \{ id: ocSubagentSessionId\(\), parentID: input2\.subagentSession\?\.id \?\? null/.test(m29), "agent-host spawn_subagent gives the sub run its own session (parentID = spawning session)");
const exec = read("recovered/esm/002-agent-host.js/agent-tool-exec.mjs");
ok(exec.includes("input2.executeExternalTool(toolName, args, input2.subagentSession?.id ? { session: input2.subagentSession } : void 0)"), "agent-host tool executor passes the subagent session to executeExternalTool");
const m14 = read("recovered/esm/002-agent-host.js/module-0014.mjs");
const spread = m14.match(/arguments: args, (\.\.\.\(meta\?\.session[^\n]*?: \{\}\)) \}, brokerTimeoutMs/);
ok(!!spread, "agent-host ide/tool/invoke forwards meta.session");
const peerParams = spread ? (0, eval)(`(meta) => ({ runId: "run-1", name: "set_todos", arguments: {}, ${spread[1]} })`) : () => ({});
const subParams = peerParams({ session: { id: "sub_aaaa1111", parentID: null, depth: 1 } });
ok(subParams.session?.id === "sub_aaaa1111" && subParams.session.parentID === null, "ide/tool/invoke params carry session {id, parentID:null} for a first-level subagent", subParams);
ok(!("session" in peerParams(undefined)), "ide/tool/invoke params unchanged for a top-level call");

// extension: handleIdeToolRequest turns params.session into { sessionId, parentID } (null parent -> the dialogue).
const m183 = read("recovered/esm/000-extension.js/module-0183.mjs");
const helperSrc = m183.match(/const ocNativeSubagentSession = (\(session, ownerId\) => \{[\s\S]*?\n    \});/);
ok(!!helperSrc, "extension ocNativeSubagentSession helper found");
const toNative = helperSrc ? (0, eval)(helperSrc[1]) : () => undefined;
ok(m183.includes("ocNativeSubagentSession(params.session, context.chatTaskOwnerId));"), "extension passes the session to dispatchChatTool");
const nat1 = toNative(subParams.session, "native-chat:dlg-42");
ok(nat1?.sessionId === "sub_aaaa1111" && nat1.parentID === "dlg-42", "null parentID becomes the dialogue session id", nat1);
ok(toNative(undefined, "native-chat:dlg-42") === undefined, "no session -> no native subagent stamp");
ok(toNative({ id: "sub_b", parentID: "sub_aaaa1111" }, "native-chat:dlg-42")?.parentID === "sub_aaaa1111", "nested subagent keeps its parent subagent session");
const m114 = read("recovered/esm/000-extension.js/module-0114.mjs");
ok(m114.includes("async dispatchChatTool(name, args, ownerId, signal, toolInvocationToken, nativeSession)") && m114.includes("...(nativeSession?.sessionId ? { ocSession: nativeSession } : {})"), "dispatchChatTool puts the session on extra.ocSession");
ok(read("recovered/esm/000-extension.js/module-0023.mjs").includes("bridge.dispatchChatTool(name, args, ownerId, signal, toolInvocationToken, nativeSession)"), "module-0023 wrapper forwards the session");

// Bridge dispatcher: ocActorFromExtra (with its OC_ACTOR_STORE fallback), evaluated from module-0143.
const m143 = read("recovered/esm/000-extension.js/module-0143.mjs");
const actorSrc = m143.match(/function ocNativeSessionOf\(extra\) \{[\s\S]*?\n\}\nfunction ocActorFromExtra\(extra\) \{[\s\S]*?\n\}\n/);
ok(!!actorSrc, "module-0143 ocNativeSessionOf/ocActorFromExtra found");
const OC_ACTOR_STORE = new AsyncLocalStorage();
const actorFrom = actorSrc ? new Function("NATIVE_MANAGED_COMMAND_OWNER_ID", "OC_ACTOR_STORE", "OC_CLIENT_NAMES", actorSrc[0] + "\nreturn ocActorFromExtra;")("native-chat", OC_ACTOR_STORE, [[/claude/i, "Claude"]]) : () => ({});
const extraTop = { commandOwnerId: "native-chat:dlg-42", taskOwnerId: "native-chat:dlg-42" };
const extraSub = { ...extraTop, ocSession: nat1 };
const actorTop = actorFrom(extraTop), actorSub = actorFrom(extraSub);
ok(actorTop.kind === "local" && actorTop.id === "local" && !("sessionId" in actorTop), "top-level native call: plain local actor (unchanged)", actorTop);
ok(actorSub.kind === "local" && actorSub.id === "local" && actorSub.sessionId === "sub_aaaa1111" && actorSub.parentID === "dlg-42", "subagent native call: local actor with sessionId + parentID", actorSub);
const inherited = OC_ACTOR_STORE.run(actorSub, () => actorFrom({ commandOwnerId: "native-chat:dlg-42" }));
ok(inherited.sessionId === "sub_aaaa1111" && inherited.parentID === "dlg-42", "rebuilt extra inside the dispatch inherits the session from OC_ACTOR_STORE", inherited);
ok(actorFrom({ commandOwnerId: "bridge:1", clientName: "Claude Code" }).kind === "remote", "remote MCP actor unchanged");
ok(localSubagentOf(actorSub)?.parentID === "dlg-42" && localSubagentOf(actorTop) === null && localSubagentOf({ kind: "remote", sessionId: "x", parentID: "y" }) === null, "localSubagentOf only for local actors with a parent");

// ---- canvas-console: identities, marks, and what the webview hides ----
let t = 1_800_000_000_000;
const c = new CanvasConsole({ now: () => t });
c.configure({ backend: { projects: () => [{ id: "w1", name: "P", root: "D:/p" }], currentProjectId: () => "w1", read: () => [], post: (id, m) => ({ ...m, id: "m", time: new Date(t).toISOString(), cursor: "c", fromName: m.from }) } });
const owner = "native-chat:dlg-42";
const call = async (actor, tool, args, ref) => {
  const id = c.begin(owner, actor, tool, args, ref);
  const res = tool.startsWith("chat_") ? await c.handleChatTool(tool, args, { owner, actor, ref }) : { content: [{ type: "text", text: "ok" }] };
  c.end(id, res); t += 1000; return res;
};
await call(actorTop, "set_todos", { todos: [{ title: "parent work", status: "in_progress" }], overview_session_id: "dlg-42" });
await call(actorSub, "set_todos", { todos: [{ title: "sub work", status: "in_progress" }], overview_session_id: "dlg-42" });
let v = c.view({});
const top = v.ais.find((a) => a.key === "local");
const sub = v.ais.find((a) => a.key === "local:sub:sub_aaaa1111");
ok(!!top && !top.subagent && !top.parentId && top.kind === "local", "top-level native session: the shared local entry, unmarked", top);
ok(!!top && !isSubAi(top), "top-level native session is visible on the canvas / chat list");
ok(!!sub && sub.subagent === true && sub.parentId === "local" && sub.kind === "local", "native subagent: own entry, subagent:true, parentId=local", sub);
ok(!!sub && isSubAi(sub), "native subagent entry is hidden by the webview filter");
ok(v.activity.filter((e) => e.ai === "local:sub:sub_aaaa1111").length === 1 && v.activity.filter((e) => e.ai === "local").length === 1, "each call is recorded under its own session");

// nested subagent -> parentId is the spawning subagent's entry
const actorSub2 = actorFrom({ ...extraTop, ocSession: toNative({ id: "sub_bbbb2222", parentID: "sub_aaaa1111" }, owner) });
await call(actorSub2, "bridge_get_effective_rules", {});
v = c.view({});
const sub2 = v.ais.find((a) => a.key === "local:sub:sub_bbbb2222");
ok(!!sub2 && sub2.subagent === true && sub2.parentId === "local:sub:sub_aaaa1111" && isSubAi(sub2), "nested native subagent points at its parent subagent and is hidden", sub2);

// a parent that named itself in chat: the owner/session links it claims never capture its subagent's calls
await call(actorTop, "chat_join", { name: "Lead", project: "w1" });
await call(actorTop, "set_todos", { todos: [] });
await call(actorSub, "set_todos", { todos: [], overview_session_id: "dlg-42", task_id: "TASK-1" });
v = c.view({});
const lead = v.ais.find((a) => a.key === "ai:lead");
ok(!!lead && !lead.subagent && !isSubAi(lead), "named parent stays visible and unmarked", lead);
ok(v.activity.filter((e) => e.ai === "local:sub:sub_aaaa1111").length === 2, "subagent call with the parent's card/session/owner still goes to the subagent entry");
ok(lead.calls === 2, "parent's named entry only counts its own calls", lead.calls);

// a subagent that names itself: fresh name is marked; later calls of that session go to the named entry
await call(actorSub, "chat_join", { name: "Helper", project: "w1" });
await call(actorSub, "set_todos", { todos: [] });
v = c.view({});
const helper = v.ais.find((a) => a.key === "ai:helper");
ok(!!helper && helper.subagent === true && helper.parentId === "local" && isSubAi(helper), "subagent's own chat name is marked and hidden", helper);
ok(helper.calls === 2, "later calls from that subagent session attach to its named entry", helper.calls);
ok(c.byOwner.get(owner) === "ai:lead", "a subagent never takes over the shared native owner link", c.byOwner.get(owner));
// a subagent reusing its parent's chat name never hides the parent
await call(actorSub2, "chat_send", { name: "Lead", text: "hi" });
v = c.view({});
ok(!v.ais.find((a) => a.key === "ai:lead").subagent, "subagent reusing the parent's name does not mark the parent");

// remote MCP behaviour unchanged
const remote = { kind: "remote", id: "remote:claude", label: "Claude" };
c.begin("bridge:x", remote, "set_todos", { todos: [] }, undefined);
v = c.view({});
const cl = v.ais.find((a) => a.key === "client:claude");
ok(!!cl && !cl.subagent && !isSubAi(cl), "remote client entry unchanged (unmarked)");

// marks survive a persist / reload
const dir = fs.mkdtempSync(path.join((await import("node:os")).tmpdir(), "ns-test-"));
c.storeFile = path.join(dir, "canvas-console.json"); c.persist();
const c2 = new CanvasConsole({ now: () => t }); c2.configure({ storeDir: dir, backend: c.backend });
const reSub = c2.view({}).ais.find((a) => a.key === "local:sub:sub_aaaa1111");
ok(!!reSub && reSub.subagent === true && reSub.parentId === "local", "native subagent mark survives reload", reSub);
fs.rmSync(dir, { recursive: true, force: true });

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
