// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/bridge-event-store.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/bridge-event-store.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto18 = require("node:crypto");

var BoundedInMemoryEventStore = class {
  constructor(limit) {
    this.limit = limit;
  }
  limit;
  events = /* @__PURE__ */ new Map();
  order = [];
  sequence = 0;
  async storeEvent(streamId, message2) {
    const eventId = `${Date.now().toString(36)}-${(++this.sequence).toString(36)}-${(0, import_node_crypto18.randomUUID)()}`;
    this.events.set(eventId, { streamId, message: message2 });
    this.order.push(eventId);
    while (this.order.length > this.limit) {
      const oldest = this.order.shift();
      if (oldest) this.events.delete(oldest);
    }
    return eventId;
  }
  async replayEventsAfter(lastEventId, { send }) {
    const previous = this.events.get(lastEventId);
    if (!previous) return "";
    let found = false;
    for (const eventId of this.order) {
      if (eventId === lastEventId) {
        found = true;
        continue;
      }
      if (!found) continue;
      const event = this.events.get(eventId);
      if (event?.streamId === previous.streamId) {
        await send(eventId, event.message);
      }
    }
    return previous.streamId;
  }
};
export { import_node_crypto18, BoundedInMemoryEventStore };
