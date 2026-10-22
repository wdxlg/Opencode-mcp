// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/webPubSub/framing.ts
import { chunk } from "./module-4277.mjs";
import { parseGroupName } from "./module-4278.mjs";


// src/vs/platform/agentHost/common/webPubSub/framing.ts
var RELIABLE_JSON_SUBPROTOCOL = "json.reliable.webpubsub.azure.v1";

function buildPublish(options3) {
  const envelopes = chunk(options3.payload, options3.chunkOptions);
  return envelopes.map(
    (envelope) => ({
      type: "sendToGroup",
      group: options3.group,
      ackId: options3.nextAckId(),
      dataType: "json",
      noEcho: true,
      data: envelope
    })
  );
}

var FramingError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "FramingError";
  }
};

function isObject4(value2) {
  return typeof value2 === "object" && value2 !== null;
}

function parseInbound(frame, options3) {
  if (!isObject4(frame)) {
    return { kind: "ignored" };
  }
  if (frame["type"] !== "message" || frame["from"] !== "group") {
    return { kind: "ignored" };
  }
  if (frame["dataType"] !== "json") {
    throw new FramingError(`group-fanout frame has unsupported dataType '${String(frame["dataType"])}'`);
  }
  if (typeof frame["group"] !== "string") {
    throw new FramingError(`group-fanout frame is missing a string 'group' field`);
  }
  if (!isObject4(frame["data"])) {
    throw new FramingError(`group-fanout frame is missing a 'data' ChunkEnvelope`);
  }
  const group2 = parseGroupName(frame["group"], options3.groupValidation);
  const envelope = frame["data"];
  const payload = options3.reassembler.ingest(envelope);
  if (payload === null) {
    return { kind: "pending", group: group2 };
  }
  return { kind: "payload", group: group2, payload };
}
export { buildPublish, isObject4, parseInbound, RELIABLE_JSON_SUBPROTOCOL, FramingError };
