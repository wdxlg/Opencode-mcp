// Item 12 — channels: an adapter interface for message channels that trigger work, plus one implementation, a local
// webhook bound to loopback only (no external service is contacted). Default off; requires a token.
//   ChannelAdapter = { id, kind, start(onMessage) → Promise<info>, stop() → Promise<void>, status() }
//   onMessage({ type: "task"|"steer"|"review_approve"|"review_reject", text?, task_id?, title?, reason? }) → result
import http from "node:http";
import crypto from "node:crypto";
import { statePath, appendJsonl, readJsonlFamily, nowIso, newId, redactString } from "./core.mjs";
import { postSteer } from "./steer.mjs";
import { approveReview, rejectReview } from "./review-gate.mjs";

const inboundFile = () => statePath("channels", "inbound.jsonl");
const adapters = new Map();

/** Route one inbound channel message. "via=channel" marks user-side actions (e.g. review approval). */
export function handleChannelMessage(msg, config, channelId = "local") {
  const type = msg?.type;
  if (type === "steer") return { steer: postSteer({ task_id: msg.task_id, text: msg.text, from: `channel:${channelId}` }) };
  if (type === "task") {
    const text = String(msg.text ?? "").trim();
    if (!text) throw Object.assign(new Error("task 需要 text"), { code: "INVALID_ARGUMENT" });
    const entry = { id: newId("ch"), at: nowIso(), channel: channelId, title: String(msg.title ?? text.slice(0, 60)), text: text.slice(0, 8000), taken: false };
    appendJsonl(inboundFile(), entry);
    return { queued: entry };
  }
  if (type === "review_approve") return { review: approveReview({ task_id: msg.task_id, merge: msg.merge !== false, note: msg.note }, config, "channel") };
  if (type === "review_reject") return { review: rejectReview({ task_id: msg.task_id, reason: msg.reason }, "channel") };
  throw Object.assign(new Error(`未知消息类型：${type}`), { code: "INVALID_ARGUMENT" });
}
export function inbound({ include_taken = false } = {}) { return readJsonlFamily(inboundFile(), 1).filter((e) => include_taken || !e.taken).map((e) => ({ ...e, text: redactString(e.text, 2000) })); }

const LOOPBACK = new Set(["127.0.0.1", "::1", "localhost"]);
export function createLocalWebhookChannel({ host = "127.0.0.1", port = 0, token, maxBytes = 64 * 1024 } = {}) {
  if (!LOOPBACK.has(host)) throw Object.assign(new Error("本地 webhook 只允许绑定回环地址"), { code: "NOT_LOOPBACK" });
  if (!token || String(token).length < 16) throw Object.assign(new Error("需要至少 16 位的 token（channels.webhook.token）"), { code: "TOKEN_REQUIRED" });
  const expected = Buffer.from(String(token));
  let server = null, info = null;
  const send = (res, code, body) => { res.writeHead(code, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(body)); };
  return {
    id: "local-webhook", kind: "webhook",
    status: () => ({ running: !!server, ...(info ?? {}) }),
    start(onMessage) {
      if (server) return Promise.resolve(info);
      server = http.createServer((req, res) => {
        const got = Buffer.from(String(req.headers["x-opencode-token"] ?? ""));
        if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return send(res, 401, { error: "UNAUTHORIZED" });
        if (req.method !== "POST" || req.url !== "/v1/message") return send(res, 404, { error: "NOT_FOUND", hint: "POST /v1/message" });
        let size = 0; const chunks = [];
        req.on("data", (c) => { size += c.length; if (size > maxBytes) { req.destroy(); } else chunks.push(c); });
        req.on("end", async () => {
          let msg; try { msg = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return send(res, 400, { error: "BAD_JSON" }); }
          try { send(res, 200, { ok: true, result: await onMessage(msg) }); } catch (e) { send(res, 400, { ok: false, error: e.code ?? "FAILED", message: e.message }); }
        });
      });
      return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, () => { const a = server.address(); info = { host, port: a.port, url: `http://${host}:${a.port}/v1/message` }; resolve(info); });
      });
    },
    stop() { return new Promise((r) => { if (!server) return r(); server.close(() => r()); server = null; info = null; }); }
  };
}

export async function startChannels(config) {
  const ch = config.channels ?? {};
  if (!ch.enabled) throw Object.assign(new Error("渠道接入默认关闭：设置 channels.enabled=true 与 channels.webhook.enabled=true、token 后启动"), { code: "DISABLED" });
  const out = [];
  if (ch.webhook?.enabled && !adapters.has("local-webhook")) {
    const a = createLocalWebhookChannel(ch.webhook);
    out.push(await a.start((msg) => handleChannelMessage(msg, config, a.id)));
    adapters.set(a.id, a);
  }
  return { started: out, running: [...adapters.values()].map((a) => ({ id: a.id, ...a.status() })) };
}
export async function stopChannels() { for (const a of adapters.values()) await a.stop(); const n = adapters.size; adapters.clear(); return { stopped: n }; }

export const channelsFeature = {
  id: "channels",
  actions: {
    channels_start: (a, c) => startChannels(c.config),
    channels_stop: () => stopChannels(),
    channels_status: (a, c) => ({ enabled: !!c.config.channels?.enabled, running: [...adapters.values()].map((x) => ({ id: x.id, ...x.status() })) }),
    channel_inbound: (a) => ({ inbound: inbound(a) })
  }
};
