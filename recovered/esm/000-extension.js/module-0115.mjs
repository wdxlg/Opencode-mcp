// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/bridge-ngrok-failure.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/bridge-ngrok-failure.ts
init_define_OPENCODE_BUILD_INFO();
// src/bridge-ngrok-failure.ts
init_define_OPENCODE_BUILD_INFO();
function isNgrokEndpointBusy(error2) {
  const message2 = typeof error2 === "string" ? error2 : error2 && typeof error2 === "object" && "message" in error2 ? String(error2.message) : "";
  return /ERR_NGROK_334\b/i.test(message2) || /\bendpoint\b[^\r\n]{0,2048}\bis already online\b/i.test(message2);
}
function ngrokSessionStatusLine(line, reservedDomain) {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    return void 0;
  }
  if (!event || typeof event !== "object") return void 0;
  if (event.msg === "session closed, starting reconnect loop" || event.msg === "heartbeat timeout, terminating session" || event.msg === "failed to reconnect session") return "offline";
  if (event.msg === "tunnel session started" && event.obj === "tunnels.session") return "session-started";
  if (event.msg !== "started tunnel" || typeof event.url !== "string" || !reservedDomain) return void 0;
  try {
    const url2 = new URL(event.url);
    return url2.protocol === "https:" && url2.hostname.toLowerCase() === reservedDomain.toLowerCase() ? "online" : void 0;
  } catch {
    return void 0;
  }
}
function isNonRetryableNgrokFailure(error2) {
  const record4 = error2 && typeof error2 === "object" ? error2 : {};
  const message2 = typeof error2 === "string" ? error2 : String(record4.message ?? "");
  return record4.retryable === false || isNgrokEndpointBusy(message2) || /ERR_NGROK_(?:9009|105|107|4018|3820)\b|authentication failed|invalid authtoken|pay-as-you-go/i.test(message2);
}
function mayRetryNgrokReplacement(error2, failedAttempt) {
  return isNgrokEndpointBusy(error2) ? failedAttempt < 3 : !isNonRetryableNgrokFailure(error2);
}
function ngrokStartFailure(output2) {
  if (isNgrokEndpointBusy(output2)) {
    return Object.assign(new Error(
      "ngrok endpoint is already online (ERR_NGROK_334). Check the existing agent or Cloud Endpoint/traffic policy in the ngrok dashboard. Use a dedicated MCP domain, or stop only an endpoint you own and no longer need, then retry. A recently stopped endpoint may need time to release. Do not enable pooling for independent MCP workspaces or kill unrelated processes."
    ), { failureCode: "ngrok-endpoint-busy", code: "ERR_NGROK_334", retryable: false });
  }
  if (/ERR_NGROK_3820\b/i.test(output2)) {
    return Object.assign(new Error(
      "ngrok rejected an old AI Gateway traffic policy (ERR_NGROK_3820). The ai-gateway action has been retired; inspect the existing Cloud Endpoint in the ngrok dashboard and use a dedicated MCP domain. This is not a Bash or local process error."
    ), { failureCode: "ngrok-start-failed", code: "ERR_NGROK_3820", retryable: false });
  }
  const code = output2.match(/ERR_NGROK_\d+\b/i)?.[0].toUpperCase();
  const error2 = new Error(`ngrok failed to establish the reserved domain.${code ? ` ${code}.` : ""} See the Bridge log for technical details.`);
  return isNonRetryableNgrokFailure(output2) ? Object.assign(error2, { retryable: false }) : error2;
}
export { isNgrokEndpointBusy, ngrokSessionStatusLine, isNonRetryableNgrokFailure, mayRetryNgrokReplacement, ngrokStartFailure };
