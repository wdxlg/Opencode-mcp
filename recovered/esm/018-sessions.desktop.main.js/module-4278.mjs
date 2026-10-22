// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/webPubSub/groups.ts



// src/vs/platform/agentHost/common/webPubSub/groups.ts
var MAX_GROUP_NAME_BYTES = 256;

var GroupNameError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GroupNameError";
  }
};

var encoder = new TextEncoder();

var OPAQUE_ID = /^[A-Za-z0-9_-]+$/;

function validateOpaqueId(name, value2) {
  if (value2.length === 0) {
    throw new GroupNameError(`${name} segment is empty`);
  }
  if (!OPAQUE_ID.test(value2)) {
    throw new GroupNameError(`${name} segment contains characters outside the opaque-id grammar`);
  }
}

function parseGroupName(name, options3 = {}) {
  const byteLength2 = encoder.encode(name).byteLength;
  if (byteLength2 > MAX_GROUP_NAME_BYTES) {
    throw new GroupNameError(`group name is ${byteLength2} bytes, exceeds ${MAX_GROUP_NAME_BYTES}-byte cap`);
  }
  if (byteLength2 === 0) {
    throw new GroupNameError("group name is empty");
  }
  const segments = name.split(".");
  if (segments.length < 5) {
    throw new GroupNameError(`expected at least 5 segments, got ${segments.length}: ${name}`);
  }
  if (segments[0] !== "user") {
    throw new GroupNameError(`expected first segment 'user', got '${segments[0]}'`);
  }
  const uid = segments[1] ?? "";
  validateOpaqueId("uid", uid);
  if (options3.expected?.uid !== void 0 && uid !== options3.expected.uid) {
    throw new GroupNameError(`uid '${uid}' does not match expected '${options3.expected.uid}'`);
  }
  if (segments[2] !== "env") {
    throw new GroupNameError(`expected third segment 'env', got '${segments[2]}'`);
  }
  const eid = segments[3] ?? "";
  validateOpaqueId("eid", eid);
  if (options3.expected?.eid !== void 0 && eid !== options3.expected.eid) {
    throw new GroupNameError(`eid '${eid}' does not match expected '${options3.expected.eid}'`);
  }
  const lane = segments.slice(4);
  if (lane[0] === "client") {
    if (lane.length < 3) {
      throw new GroupNameError(`client lane truncated: ${name}`);
    }
    const cid = lane[1] ?? "";
    validateOpaqueId("cid", cid);
    if (options3.expected?.cid !== void 0 && cid !== options3.expected.cid) {
      throw new GroupNameError(`cid '${cid}' does not match expected '${options3.expected.cid}'`);
    }
    const direction = lane[2];
    if (direction === "broadcast" || direction === "to-host" || direction === "to-client") {
      if (lane.length !== 3) {
        throw new GroupNameError(`unexpected trailing segments after '${direction}': ${lane.slice(3).join(".")}`);
      }
      return { scope: "client", lane: direction, uid, eid, cid };
    }
    throw new GroupNameError(`unknown client direction '${direction}'`);
  }
  if (lane.length !== 1) {
    throw new GroupNameError(`env lane must be a single segment, got ${lane.length}: ${lane.join(".")}`);
  }
  const envLane = lane[0];
  if (envLane !== "root" && envLane !== "events" && envLane !== "lifecycle" && envLane !== "control" && envLane !== "ingest-ack") {
    throw new GroupNameError(`unknown env lane '${envLane}'`);
  }
  return { scope: "env", lane: envLane, uid, eid };
}
export { validateOpaqueId, parseGroupName, MAX_GROUP_NAME_BYTES, GroupNameError, encoder, OPAQUE_ID };
