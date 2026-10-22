// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/base/common/stream.ts



// src/vs/base/common/stream.ts
function consumeStream(stream, reducer) {
  return new Promise((resolve2, reject) => {
    const chunks = [];
    listenStream(stream, {
      onData: (chunk) => {
        if (reducer) {
          chunks.push(chunk);
        }
      },
      onError: (error) => {
        if (reducer) {
          reject(error);
        } else {
          resolve2(void 0);
        }
      },
      onEnd: () => {
        if (reducer) {
          resolve2(reducer(chunks));
        } else {
          resolve2(void 0);
        }
      }
    });
  });
}

function listenStream(stream, listener, token) {
  stream.on("error", (error) => {
    if (!token?.isCancellationRequested) {
      listener.onError(error);
    }
  });
  stream.on("end", () => {
    if (!token?.isCancellationRequested) {
      listener.onEnd();
    }
  });
  stream.on("data", (data) => {
    if (!token?.isCancellationRequested) {
      listener.onData(data);
    }
  });
}
export { consumeStream, listenStream };
