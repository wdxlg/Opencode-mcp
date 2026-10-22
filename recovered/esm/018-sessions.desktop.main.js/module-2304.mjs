// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpDevMode.ts
import { Disposable } from "./module-0012.mjs";
import { autorun, autorunDelta } from "./module-0052.mjs";
import { equals4 } from "./module-0098.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { equals } from "./module-0007.mjs";
import { Throttler } from "./module-0036.mjs";
import { parse4 } from "./module-0857.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";
import { assertNever } from "./module-0009.mjs";
import { IDebugService } from "./module-1058.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/mcp/common/mcpDevMode.ts
var McpDevModeServerAttache = class extends Disposable {
  constructor(server, fwdRef, registry4, fileService, workspaceContextService) {
    super();
    const workspaceFolder = server.readDefinitions().map(({ collection }) => collection?.presentation?.origin && workspaceContextService.getWorkspaceFolder(collection.presentation?.origin)?.uri);
    const restart = async () => {
      const lastDebugged = fwdRef.lastModeDebugged;
      await server.stop();
      await server.start({ debug: lastDebugged });
    };
    let didAutoStart = false;
    this._register(autorun((reader) => {
      const defs = server.readDefinitions().read(reader);
      if (!defs.collection || !defs.server || !defs.server.devMode) {
        didAutoStart = false;
        return;
      }
      if (didAutoStart) {
        return;
      }
      const delegates = registry4.delegates.read(reader);
      if (!delegates.some((d) => d.canStart(defs.collection, defs.server))) {
        return;
      }
      server.start();
      didAutoStart = true;
    }));
    const debugMode = server.readDefinitions().map((d) => !!d.server?.devMode?.debug);
    this._register(autorunDelta(debugMode, ({ lastValue, newValue }) => {
      if (!!newValue && !equals4(lastValue, newValue)) {
        restart();
      }
    }));
    const watchObs = derivedOpts({ equalsFn: equals }, (reader) => {
      const def2 = server.readDefinitions().read(reader);
      const watch2 = def2.server?.devMode?.watch;
      return typeof watch2 === "string" ? [watch2] : watch2;
    });
    const restartScheduler = this._register(new Throttler());
    this._register(autorun((reader) => {
      const pattern = watchObs.read(reader);
      const wf = workspaceFolder.read(reader);
      if (!pattern || !wf) {
        return;
      }
      const includes2 = pattern.filter((p) => !p.startsWith("!"));
      const excludes = pattern.filter((p) => p.startsWith("!")).map((p) => p.slice(1));
      reader.store.add(fileService.watch(wf, { includes: includes2, excludes, recursive: true }));
      const ignoreCase = !fileService.hasCapability(wf, 1024 /* PathCaseSensitive */);
      const includeParse = includes2.map((p) => parse4({ base: wf.fsPath, pattern: p }, { ignoreCase }));
      const excludeParse = excludes.map((p) => parse4({ base: wf.fsPath, pattern: p }, { ignoreCase }));
      reader.store.add(fileService.onDidFilesChange((e4) => {
        for (const change of [e4.rawAdded, e4.rawDeleted, e4.rawUpdated]) {
          for (const uri4 of change) {
            if (includeParse.some((i2) => i2(uri4.fsPath)) && !excludeParse.some((e5) => e5(uri4.fsPath))) {
              restartScheduler.queue(restart);
              break;
            }
          }
        }
      }));
    }));
  }
};

McpDevModeServerAttache = __decorateClass([
  __decorateParam(2, IMcpRegistry),
  __decorateParam(3, IFileService),
  __decorateParam(4, IWorkspaceContextService)
], McpDevModeServerAttache);

var IMcpDevModeDebugging = createDecorator("mcpDevModeDebugging");

var DEBUG_HOST = "127.0.0.1";

var McpDevModeDebugging = class {
  constructor(_debugService, _commandService) {
    this._debugService = _debugService;
    this._commandService = _commandService;
  }
  async transform(definition, launch) {
    if (!definition.devMode?.debug || launch.type !== 1 /* Stdio */) {
      return launch;
    }
    const port = await this.getDebugPort();
    const name = `MCP: ${definition.label}`;
    const options3 = { startedByUser: false, suppressDebugView: true };
    const commonConfig = {
      internalConsoleOptions: "neverOpen",
      suppressMultipleSessionWarning: true
    };
    switch (definition.devMode.debug.type) {
      case "node": {
        if (!/node[0-9]*$/.test(launch.command)) {
          throw new Error(localize(17152, null, launch.command));
        }
        this._debugService.startDebugging(void 0, {
          type: "pwa-node",
          request: "attach",
          name,
          port,
          host: DEBUG_HOST,
          timeout: 3e4,
          continueOnAttach: true,
          ...commonConfig
        }, options3);
        return { ...launch, args: [`--inspect-brk=${DEBUG_HOST}:${port}`, ...launch.args] };
      }
      case "debugpy": {
        if (!/python[0-9.]*$/.test(launch.command)) {
          throw new Error(localize(17153, null, launch.command));
        }
        let command4;
        let args2 = ["--wait-for-client", "--connect", `${DEBUG_HOST}:${port}`, ...launch.args];
        if (definition.devMode.debug.debugpyPath) {
          command4 = definition.devMode.debug.debugpyPath;
        } else {
          try {
            const debugPyPath = await this._commandService.executeCommand("python.getDebugpyPackagePath");
            if (debugPyPath) {
              command4 = launch.command;
              args2 = [debugPyPath, ...args2];
            }
          } catch {
          }
        }
        if (!command4) {
          command4 = "debugpy";
        }
        await Promise.race([
          // eslint-disable-next-line local/code-no-dangerous-type-assertions
          this._debugService.startDebugging(void 0, {
            type: "debugpy",
            name,
            request: "attach",
            listen: {
              host: DEBUG_HOST,
              port
            },
            ...commonConfig
          }, options3),
          this.ensureListeningOnPort(port)
        ]);
        return { ...launch, command: command4, args: args2 };
      }
      default:
        assertNever(definition.devMode.debug, `Unknown debug type ${JSON.stringify(definition.devMode.debug)}`);
    }
  }
  ensureListeningOnPort(port) {
    return Promise.resolve();
  }
  getDebugPort() {
    return Promise.resolve(9230);
  }
};

McpDevModeDebugging = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, ICommandService)
], McpDevModeDebugging);
export { McpDevModeServerAttache, IMcpDevModeDebugging, DEBUG_HOST, McpDevModeDebugging };
