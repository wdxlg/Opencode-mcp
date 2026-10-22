// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/platform/telemetry/common/telemetryUtils.ts
import { localize } from "./module-0013.mjs";
import { safeStringify } from "./module-0030.mjs";
import { isObject } from "./module-0009.mjs";


// src/vs/platform/telemetry/common/telemetryUtils.ts
var NullTelemetryServiceShape = class {
  constructor() {
    this.telemetryLevel = 0 /* NONE */;
    this.sessionId = "someValue.sessionId";
    this.machineId = "someValue.machineId";
    this.sqmId = "someValue.sqmId";
    this.devDeviceId = "someValue.devDeviceId";
    this.firstSessionDate = "someValue.firstSessionDate";
    this.sendErrorTelemetry = false;
  }
  publicLog() {
  }
  publicLog2() {
  }
  publicLogError() {
  }
  publicLogError2() {
  }
  setExperimentProperty() {
  }
  setCommonProperty() {
  }
};

var NullTelemetryService = new NullTelemetryServiceShape();

var telemetryLogId = "telemetry";

var TelemetryLogGroup = { id: telemetryLogId, name: localize(3263, null) };

function validateTelemetryData(data) {
  const properties = {};
  const measurements = {};
  const flat = {};
  flatten(data, flat);
  for (let prop in flat) {
    prop = prop.length > 150 ? prop.substr(prop.length - 149) : prop;
    const value = flat[prop];
    if (typeof value === "number") {
      measurements[prop] = value;
    } else if (typeof value === "boolean") {
      measurements[prop] = value ? 1 : 0;
    } else if (typeof value === "string") {
      if (value.length > 8192) {
        console.warn(`Telemetry property: ${prop} has been trimmed to 8192, the original length is ${value.length}`);
      }
      properties[prop] = value.substring(0, 8191);
    } else if (typeof value !== "undefined" && value !== null) {
      properties[prop] = String(value);
    }
  }
  return {
    properties,
    measurements
  };
}

function flatten(obj, result, order = 0, prefix) {
  if (!obj || typeof obj !== "object" && typeof obj !== "function") {
    return;
  }
  const source = obj;
  for (const item of Object.getOwnPropertyNames(source)) {
    const value = source[item];
    const index = prefix ? prefix + item : item;
    if (Array.isArray(value)) {
      result[index] = safeStringify(value);
    } else if (value instanceof Date) {
      result[index] = value.toISOString();
    } else if (isObject(value)) {
      if (order < 2) {
        flatten(value, result, order + 1, index + ".");
      } else {
        result[index] = safeStringify(value);
      }
    } else {
      result[index] = value;
    }
  }
}
export { validateTelemetryData, flatten, NullTelemetryServiceShape, NullTelemetryService, telemetryLogId, TelemetryLogGroup };
