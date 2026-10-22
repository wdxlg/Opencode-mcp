// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/node/ptyHostMain.ts
import { timeout } from "./module-0028.mjs";
import { isUtilityProcess } from "./module-0037.mjs";
import { Server2 } from "./module-0038.mjs";
import { Server } from "./module-0032.mjs";
import { DisposableStore } from "./module-0011.mjs";
import { product_default } from "./module-0057.mjs";
import { NativeEnvironmentService } from "./module-0040.mjs";
import { OPTIONS, parseArgs } from "./module-0039.mjs";
import { LoggerService } from "./module-0056.mjs";
import { getLogLevel, isDevConsoleLogForwardingEnabled, registerDevConsoleLogForwarder } from "./module-0049.mjs";
import { LoggerChannel } from "./module-0050.mjs";
import { DefaultURITransformer } from "./module-0018.mjs";
import { localize } from "./module-0013.mjs";
import { LogService } from "./module-0051.mjs";
import { HeartbeatService } from "./module-0060.mjs";
import { ProxyChannel } from "./module-0031.mjs";
import { PtyService } from "./module-0061.mjs";


// src/vs/platform/terminal/node/ptyHostMain.ts
startPtyHost();

async function startPtyHost() {
  const startupDelay = parseInt(process.env.VSCODE_STARTUP_DELAY ?? "0");
  const simulatedLatency = parseInt(process.env.VSCODE_LATENCY ?? "0");
  const reconnectConstants = {
    graceTime: parseInt(process.env.VSCODE_RECONNECT_GRACE_TIME || "0"),
    shortGraceTime: parseInt(process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME || "0"),
    scrollback: parseInt(process.env.VSCODE_RECONNECT_SCROLLBACK || "100")
  };
  delete process.env.VSCODE_RECONNECT_GRACE_TIME;
  delete process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME;
  delete process.env.VSCODE_RECONNECT_SCROLLBACK;
  delete process.env.VSCODE_LATENCY;
  delete process.env.VSCODE_STARTUP_DELAY;
  if (startupDelay) {
    await timeout(startupDelay);
  }
  const _isUtilityProcess = isUtilityProcess(process);
  let server;
  if (_isUtilityProcess) {
    server = new Server2();
  } else {
    server = new Server("ptyHost" /* PtyHost */);
  }
  const disposables = new DisposableStore();
  const productService = { _serviceBrand: void 0, ...product_default };
  const environmentService = new NativeEnvironmentService(parseArgs(process.argv, OPTIONS), productService);
  const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
  server.registerChannel("logger" /* Logger */, new LoggerChannel(loggerService, () => DefaultURITransformer));
  const logger = loggerService.createLogger("ptyhost", { name: localize(3299, null) });
  const logService = new LogService(logger);
  if (!environmentService.isBuilt && isDevConsoleLogForwardingEnabled) {
    disposables.add(registerDevConsoleLogForwarder(logService));
  }
  if (startupDelay) {
    logService.warn(`Pty Host startup is delayed ${startupDelay}ms`);
  }
  if (simulatedLatency) {
    logService.warn(`Pty host is simulating ${simulatedLatency}ms latency`);
  }
  const heartbeatService = new HeartbeatService();
  server.registerChannel("heartbeat" /* Heartbeat */, ProxyChannel.fromService(heartbeatService, disposables));
  const ptyService = new PtyService(logService, productService, reconnectConstants, simulatedLatency);
  const ptyServiceChannel = ProxyChannel.fromService(ptyService, disposables);
  server.registerChannel("ptyHost" /* PtyHost */, ptyServiceChannel);
  if (_isUtilityProcess) {
    server.registerChannel("ptyHostWindow" /* PtyHostWindow */, ptyServiceChannel);
  }
  process.once("exit", () => {
    logService.trace("Pty host exiting");
    logService.dispose();
    heartbeatService.dispose();
    ptyService.dispose();
  });
}
export { startPtyHost };
