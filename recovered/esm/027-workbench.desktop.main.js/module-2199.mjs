// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpTypesUtils.ts
import { DisposableStore } from "./module-0012.mjs";
import { autorun, autorunSelfDisposable } from "./module-0052.mjs";
import { McpConnectionState } from "./module-1206.mjs";
import { disposableTimeout, timeout } from "./module-0036.mjs";
import { CancellationError } from "./module-0004.mjs";


// src/vs/workbench/contrib/mcp/common/mcpTypesUtils.ts
function startServerByFilter(mcpService, filter2, timeout2 = 5e3) {
  return new Promise((resolve3, reject) => {
    const store = new DisposableStore();
    store.add(autorun((reader) => {
      const servers = mcpService.servers.read(reader);
      const server = servers.find(filter2);
      if (server) {
        server.start({ promptType: "all-untrusted" }).then((state) => {
          if (state.state === McpConnectionState.Kind.Error) {
            server.showOutput();
          }
        });
        resolve3();
        store.dispose();
      }
    }));
    store.add(disposableTimeout(() => {
      store.dispose();
      reject(new CancellationError());
    }, timeout2));
  });
}

async function startServerAndWaitForLiveTools(server, opts, token) {
  const r2 = await server.start(opts);
  const store = new DisposableStore();
  const ok2 = await new Promise((resolve3) => {
    if (token?.isCancellationRequested || r2.state === McpConnectionState.Kind.Error || r2.state === McpConnectionState.Kind.Stopped) {
      return resolve3(false);
    }
    if (token) {
      store.add(token.onCancellationRequested(() => {
        resolve3(false);
      }));
    }
    store.add(autorun((reader) => {
      const connState = server.connectionState.read(reader).state;
      if (connState === McpConnectionState.Kind.Error || connState === McpConnectionState.Kind.Stopped) {
        resolve3(false);
      }
      const toolState = server.cacheState.read(reader);
      if (toolState === 5 /* Live */) {
        resolve3(true);
      }
    }));
  });
  store.dispose();
  if (ok2) {
    await timeout(0);
  }
  return ok2;
}

function mcpServerToSourceData(server, reader) {
  const metadata = server.serverMetadata.read(reader);
  return {
    type: "mcp",
    serverLabel: metadata?.serverName,
    instructions: metadata?.serverInstructions,
    label: server.definition.label,
    collectionId: server.collection.id,
    definitionId: server.definition.id
  };
}

function canLoadMcpNetworkResourceDirectly(resource, server) {
  let isResourceRequestValid = false;
  if (resource.protocol === "http:") {
    const launch = server?.connection.get()?.launchDefinition;
    if (launch && launch.type === 2 /* HTTP */ && launch.uri.authority.toLowerCase() === resource.host.toLowerCase()) {
      isResourceRequestValid = true;
    }
  } else if (resource.protocol === "https:") {
    isResourceRequestValid = true;
  }
  return isResourceRequestValid;
}

function isTaskResult(obj) {
  return obj.task !== void 0;
}

function findMcpServer(mcpService, filter2, token) {
  return new Promise((resolve3) => {
    autorunSelfDisposable((reader) => {
      if (token) {
        if (token.isCancellationRequested) {
          reader.dispose();
          resolve3(void 0);
          return;
        }
        reader.store.add(token.onCancellationRequested(() => {
          reader.dispose();
          resolve3(void 0);
        }));
      }
      const servers = mcpService.servers.read(reader);
      const server = servers.find(filter2);
      if (server) {
        resolve3(server);
        reader.dispose();
      }
    });
  });
}

function translateMcpLogMessage(logger, params, prefix = "") {
  let contents = typeof params.data === "string" ? params.data : JSON.stringify(params.data);
  if (params.logger) {
    contents = `${params.logger}: ${contents}`;
  }
  if (prefix) {
    contents = `${prefix} ${contents}`;
  }
  switch (params?.level) {
    case "debug":
      logger.debug(contents);
      break;
    case "info":
    case "notice":
      logger.info(contents);
      break;
    case "warning":
      logger.warn(contents);
      break;
    case "error":
    case "critical":
    case "alert":
    case "emergency":
      logger.error(contents);
      break;
    default:
      logger.info(contents);
      break;
  }
}
export { startServerByFilter, startServerAndWaitForLiveTools, mcpServerToSourceData, canLoadMcpNetworkResourceDirectly, isTaskResult, findMcpServer, translateMcpLogMessage };
