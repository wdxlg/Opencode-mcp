// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/urlFinder.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceWorker } from "./module-0036.mjs";
import { removeAnsiEscapeCodes } from "./module-0030.mjs";


// src/vs/workbench/contrib/remote/browser/urlFinder.ts
var UrlFinder = class _UrlFinder extends Disposable {
  constructor(terminalService, debugService) {
    super();
    this._onDidMatchLocalUrl = this._register(new Emitter());
    this.onDidMatchLocalUrl = this._onDidMatchLocalUrl.event;
    this.listeners = /* @__PURE__ */ new Map();
    this.terminalDataWorkers = this._register(new DisposableMap());
    this.replPositions = /* @__PURE__ */ new Map();
    terminalService.instances.forEach((instance2) => {
      this.registerTerminalInstance(instance2);
    });
    this._register(terminalService.onDidCreateInstance((instance2) => {
      this.registerTerminalInstance(instance2);
    }));
    this._register(terminalService.onDidDisposeInstance((instance2) => {
      this.listeners.get(instance2)?.dispose();
      this.listeners.delete(instance2);
      this.terminalDataWorkers.deleteAndDispose(instance2);
    }));
    this._register(debugService.onDidNewSession((session) => {
      if (!session.parentSession || session.parentSession && session.hasSeparateRepl()) {
        this.listeners.set(session.getId(), session.onDidChangeReplElements(() => {
          this.processNewReplElements(session);
        }));
      }
    }));
    this._register(debugService.onDidEndSession(({ session }) => {
      if (this.listeners.has(session.getId())) {
        this.listeners.get(session.getId())?.dispose();
        this.listeners.delete(session.getId());
      }
    }));
  }
  static {
    /**
     * Debounce time in ms before processing accumulated terminal data.
     */
    this.dataDebounceTimeout = 500;
  }
  static {
    /**
     * Maximum amount of data to accumulate before skipping URL detection.
     * When data exceeds this threshold, it indicates high-throughput scenarios
     * (like games or animations) where URL detection is unlikely to find useful results.
     */
    this.maxDataLength = 1e4;
  }
  static {
    /**
     * Local server url pattern matching following urls:
     * http://localhost:3000/ - commonly used across multiple frameworks
     * https://127.0.0.1:5001/ - ASP.NET
     * http://:8080 - Beego Golang
     * http://0.0.0.0:4000 - Elixir Phoenix
     */
    this.localUrlRegex = /\b\w{0,20}(?::\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0|:\d{2,5})[\w\-\.\~:\/\?\#[\]\@!\$&\(\)\*\+\,\;\=]*/gim;
  }
  static {
    this.extractPortRegex = /(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})/;
  }
  static {
    /**
     * https://github.com/microsoft/vscode-remote-release/issues/3949
     */
    this.localPythonServerRegex = /HTTP\son\s(127\.0\.0\.1|0\.0\.0\.0)\sport\s(\d+)/;
  }
  static {
    this.excludeTerminals = ["Dev Containers"];
  }
  registerTerminalInstance(instance2) {
    if (!_UrlFinder.excludeTerminals.includes(instance2.title)) {
      this.listeners.set(instance2, instance2.onData((data) => {
        this.getOrCreateWorker(instance2).work(data);
      }));
    }
  }
  getOrCreateWorker(instance2) {
    let worker = this.terminalDataWorkers.get(instance2);
    if (!worker) {
      worker = new RunOnceWorker((chunks) => this.processTerminalData(chunks), _UrlFinder.dataDebounceTimeout);
      this.terminalDataWorkers.set(instance2, worker);
    }
    return worker;
  }
  processTerminalData(chunks) {
    const totalLength = chunks.reduce((sum2, chunk2) => sum2 + chunk2.length, 0);
    if (totalLength > _UrlFinder.maxDataLength) {
      return;
    }
    this.processData(chunks.join(""));
  }
  processNewReplElements(session) {
    const oldReplPosition = this.replPositions.get(session.getId());
    const replElements = session.getReplElements();
    this.replPositions.set(session.getId(), { position: replElements.length - 1, tail: replElements[replElements.length - 1] });
    if (!oldReplPosition && replElements.length > 0) {
      replElements.forEach((element) => this.processData(element.toString()));
    } else if (oldReplPosition && replElements.length - 1 !== oldReplPosition.position) {
      for (let i2 = replElements.length - 1; i2 >= 0; i2--) {
        const element = replElements[i2];
        if (element === oldReplPosition.tail) {
          break;
        } else {
          this.processData(element.toString());
        }
      }
    }
  }
  dispose() {
    super.dispose();
    for (const listener of this.listeners.values()) {
      listener.dispose();
    }
  }
  processData(data) {
    data = removeAnsiEscapeCodes(data);
    const urlMatches = data.match(_UrlFinder.localUrlRegex) || [];
    if (urlMatches && urlMatches.length > 0) {
      urlMatches.forEach((match2) => {
        let serverUrl;
        try {
          serverUrl = new URL(match2);
        } catch (e4) {
        }
        if (serverUrl) {
          const portMatch = match2.match(_UrlFinder.extractPortRegex);
          const port = parseFloat(serverUrl.port ? serverUrl.port : portMatch ? portMatch[2] : "NaN");
          if (!isNaN(port) && Number.isInteger(port) && port > 0 && port <= 65535) {
            let host = serverUrl.hostname;
            if (host !== "0.0.0.0" && host !== "127.0.0.1") {
              host = "localhost";
            }
            if (port !== 9229 && data.startsWith("Debugger listening on")) {
              return;
            }
            this._onDidMatchLocalUrl.fire({ port, host });
          }
        }
      });
    } else {
      const pythonMatch = data.match(_UrlFinder.localPythonServerRegex);
      if (pythonMatch && pythonMatch.length === 3) {
        this._onDidMatchLocalUrl.fire({ host: pythonMatch[1], port: Number(pythonMatch[2]) });
      }
    }
  }
};
export { UrlFinder };
