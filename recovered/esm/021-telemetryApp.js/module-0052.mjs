// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/workbench/contrib/debug/node/telemetryApp.ts
import { OneDataSystemAppender } from "./module-0051.mjs";
import { TelemetryAppenderChannel } from "./module-0037.mjs";
import { Server } from "./module-0001.mjs";


// src/vs/workbench/contrib/debug/node/telemetryApp.ts
var appender = new OneDataSystemAppender(void 0, false, process.argv[2], JSON.parse(process.argv[3]), process.argv[4]);

process.once("exit", () => appender.flush());

var channel = new TelemetryAppenderChannel([appender]);

var server = new Server("telemetry");

server.registerChannel("telemetryAppender", channel);
export { appender, channel, server };
