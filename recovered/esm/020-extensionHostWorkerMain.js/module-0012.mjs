// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/stream.ts
import { onUnexpectedError } from "./module-0002.mjs";


// src/vs/base/common/stream.ts
function newWriteableStream(reducer, options2) {
  return new WriteableStreamImpl(reducer, options2);
}

var WriteableStreamImpl = class {
  /**
   * @param reducer a function that reduces the buffered data into a single object;
   * 				  because some objects can be complex and non-reducible, we also
   * 				  allow passing the explicit `null` value to skip the reduce step
   * @param options stream options
   */
  constructor(reducer, options2) {
    this.reducer = reducer;
    this.options = options2;
    this.state = {
      flowing: false,
      ended: false,
      destroyed: false
    };
    this.buffer = {
      data: [],
      error: []
    };
    this.listeners = {
      data: [],
      error: [],
      end: []
    };
    this.pendingWritePromises = [];
  }
  pause() {
    if (this.state.destroyed) {
      return;
    }
    this.state.flowing = false;
  }
  resume() {
    if (this.state.destroyed) {
      return;
    }
    if (!this.state.flowing) {
      this.state.flowing = true;
      this.flowData();
      this.flowErrors();
      this.flowEnd();
    }
  }
  write(data2) {
    if (this.state.destroyed) {
      return;
    }
    if (this.state.flowing) {
      this.emitData(data2);
    } else {
      this.buffer.data.push(data2);
      if (typeof this.options?.highWaterMark === "number" && this.buffer.data.length > this.options.highWaterMark) {
        return new Promise((resolve2) => this.pendingWritePromises.push(resolve2));
      }
    }
  }
  error(error) {
    if (this.state.destroyed) {
      return;
    }
    if (this.state.flowing) {
      this.emitError(error);
    } else {
      this.buffer.error.push(error);
    }
  }
  end(result) {
    if (this.state.destroyed) {
      return;
    }
    if (typeof result !== "undefined") {
      this.write(result);
    }
    if (this.state.flowing) {
      this.emitEnd();
      this.destroy();
    } else {
      this.state.ended = true;
    }
  }
  emitData(data2) {
    this.listeners.data.slice(0).forEach((listener) => listener(data2));
  }
  emitError(error) {
    if (this.listeners.error.length === 0) {
      onUnexpectedError(error);
    } else {
      this.listeners.error.slice(0).forEach((listener) => listener(error));
    }
  }
  emitEnd() {
    this.listeners.end.slice(0).forEach((listener) => listener());
  }
  on(event, callback) {
    if (this.state.destroyed) {
      return;
    }
    switch (event) {
      case "data":
        this.listeners.data.push(callback);
        this.resume();
        break;
      case "end":
        this.listeners.end.push(callback);
        if (this.state.flowing && this.flowEnd()) {
          this.destroy();
        }
        break;
      case "error":
        this.listeners.error.push(callback);
        if (this.state.flowing) {
          this.flowErrors();
        }
        break;
    }
  }
  removeListener(event, callback) {
    if (this.state.destroyed) {
      return;
    }
    let listeners = void 0;
    switch (event) {
      case "data":
        listeners = this.listeners.data;
        break;
      case "end":
        listeners = this.listeners.end;
        break;
      case "error":
        listeners = this.listeners.error;
        break;
    }
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }
  flowData() {
    if (this.buffer.data.length === 0) {
      return;
    }
    if (typeof this.reducer === "function") {
      const fullDataBuffer = this.reducer(this.buffer.data);
      this.emitData(fullDataBuffer);
    } else {
      for (const data2 of this.buffer.data) {
        this.emitData(data2);
      }
    }
    this.buffer.data.length = 0;
    const pendingWritePromises = [...this.pendingWritePromises];
    this.pendingWritePromises.length = 0;
    pendingWritePromises.forEach((pendingWritePromise) => pendingWritePromise());
  }
  flowErrors() {
    if (this.listeners.error.length > 0) {
      for (const error of this.buffer.error) {
        this.emitError(error);
      }
      this.buffer.error.length = 0;
    }
  }
  flowEnd() {
    if (this.state.ended) {
      this.emitEnd();
      return this.listeners.end.length > 0;
    }
    return false;
  }
  destroy() {
    if (!this.state.destroyed) {
      this.state.destroyed = true;
      this.state.ended = true;
      this.buffer.data.length = 0;
      this.buffer.error.length = 0;
      this.listeners.data.length = 0;
      this.listeners.error.length = 0;
      this.listeners.end.length = 0;
      this.pendingWritePromises.length = 0;
    }
  }
};

function consumeReadable(readable, reducer) {
  const chunks = [];
  let chunk;
  while ((chunk = readable.read()) !== null) {
    chunks.push(chunk);
  }
  return reducer(chunks);
}

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
  stream.on("data", (data2) => {
    if (!token?.isCancellationRequested) {
      listener.onData(data2);
    }
  });
}

function toStream(t, reducer) {
  const stream = newWriteableStream(reducer);
  stream.end(t);
  return stream;
}
export { newWriteableStream, consumeReadable, consumeStream, listenStream, toStream, WriteableStreamImpl };
