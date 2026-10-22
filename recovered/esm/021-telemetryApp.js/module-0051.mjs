// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/platform/telemetry/node/1dsAppender.ts
import { CancellationToken } from "./module-0018.mjs";
import { streamToBuffer } from "./module-0029.mjs";
import { NO_FETCH_TELEMETRY } from "./module-0045.mjs";
import { AbstractOneDataSystemAppender } from "./module-0050.mjs";


// src/vs/platform/telemetry/node/1dsAppender.ts
async function makeTelemetryRequest(options, requestService) {
  const response = await requestService.request(options, CancellationToken.None);
  const responseData = (await streamToBuffer(response.stream)).toString();
  const statusCode = response.res.statusCode ?? 200;
  const headers = response.res.headers;
  return {
    headers,
    statusCode,
    responseData
  };
}

async function makeLegacyTelemetryRequest(options) {
  const https = await import("https");
  const httpsOptions = {
    method: options.type,
    headers: options.headers
  };
  const responsePromise = new Promise((resolve2, reject) => {
    const req = https.request(options.url ?? "", httpsOptions, (res) => {
      res.on("data", function(responseData) {
        resolve2({
          headers: res.headers,
          statusCode: res.statusCode ?? 200,
          responseData: responseData.toString()
        });
      });
      res.on("error", function(err) {
        reject(err);
      });
    });
    req.write(options.data, (err) => {
      if (err) {
        reject(err);
      }
    });
    req.end();
  });
  return responsePromise;
}

async function sendPostAsync(requestService, payload, oncomplete) {
  const telemetryRequestData = typeof payload.data === "string" ? payload.data : new TextDecoder().decode(payload.data);
  const requestOptions = {
    type: "POST",
    headers: {
      ...payload.headers,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload.data).toString()
    },
    url: payload.urlString,
    data: telemetryRequestData,
    callSite: NO_FETCH_TELEMETRY
  };
  try {
    const responseData = requestService ? await makeTelemetryRequest(requestOptions, requestService) : await makeLegacyTelemetryRequest(requestOptions);
    oncomplete(responseData.statusCode, responseData.headers, responseData.responseData);
  } catch {
    oncomplete(0, {});
  }
}

var OneDataSystemAppender = class extends AbstractOneDataSystemAppender {
  constructor(requestService, isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory) {
    const customHttpXHROverride = {
      sendPOST: (payload, oncomplete) => {
        sendPostAsync(requestService, payload, oncomplete);
      }
    };
    super(isInternalTelemetry, eventPrefix, defaultData, iKeyOrClientFactory, customHttpXHROverride);
  }
};
export { makeTelemetryRequest, makeLegacyTelemetryRequest, sendPostAsync, OneDataSystemAppender };
