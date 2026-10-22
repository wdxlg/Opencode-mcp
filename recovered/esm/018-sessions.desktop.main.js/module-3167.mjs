// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/developer/browser/terminal.developer.contribution.ts
import { registerTerminalAction } from "./module-3043.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable, dispose } from "./module-0012.mjs";
import { Delayer } from "./module-0036.mjs";
import { Event2 } from "./module-0017.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";


// src/vs/workbench/contrib/terminalContrib/developer/browser/terminal.developer.contribution.ts
registerTerminalAction({
  id: "workbench.action.terminal.showTextureAtlas" /* ShowTextureAtlas */,
  title: localize2(20711, "Show Terminal Texture Atlas"),
  category: Categories.Developer,
  precondition: ContextKeyExpr.or(TerminalContextKeys.isOpen),
  run: async (c, accessor) => {
    const fileService = accessor.get(IFileService);
    const openerService = accessor.get(IOpenerService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const bitmap = await c.service.activeInstance?.xterm?.textureAtlas;
    if (!bitmap) {
      return;
    }
    const cwdUri = workspaceContextService.getWorkspace().folders[0].uri;
    const fileUri = URI.joinPath(cwdUri, "textureAtlas.png");
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("bitmaprenderer");
    if (!ctx) {
      return;
    }
    ctx.transferFromImageBitmap(bitmap);
    const blob = await new Promise((res) => canvas.toBlob(res));
    if (!blob) {
      return;
    }
    await fileService.writeFile(fileUri, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
    openerService.open(fileUri);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.writeDataToTerminal" /* WriteDataToTerminal */,
  title: localize2(20712, "Write Data to Terminal"),
  category: Categories.Developer,
  run: async (c, accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    const instance2 = await c.service.getActiveOrCreateInstance();
    await c.service.revealActiveTerminal();
    await instance2.processReady;
    if (!instance2.xterm) {
      throw new Error("Cannot write data to terminal if xterm isn't initialized");
    }
    const data = await quickInputService.input({
      value: "",
      placeHolder: "Enter data (supports \\n, \\r, \\xAB)",
      prompt: localize(20713, null)
    });
    if (!data) {
      return;
    }
    let escapedData = data.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    while (true) {
      const match2 = escapedData.match(/\\x([0-9a-fA-F]{2})/);
      if (match2 === null || match2.index === void 0 || match2.length < 2) {
        break;
      }
      escapedData = escapedData.slice(0, match2.index) + String.fromCharCode(parseInt(match2[1], 16)) + escapedData.slice(match2.index + 4);
    }
    const xterm = instance2.xterm;
    xterm._writeText(escapedData);
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.recordSession" /* RecordSession */,
  title: localize2(20708, "Record Terminal Session"),
  category: Categories.Developer,
  run: async (c, accessor) => {
    const clipboardService = accessor.get(IClipboardService);
    const commandService = accessor.get(ICommandService);
    const statusbarService = accessor.get(IStatusbarService);
    const store = new DisposableStore();
    const text2 = localize(20709, null);
    const statusbarEntry = {
      text: text2,
      name: text2,
      ariaLabel: text2,
      showProgress: true
    };
    const statusbarHandle = statusbarService.addEntry(statusbarEntry, "recordSession", 0 /* LEFT */);
    store.add(statusbarHandle);
    const instance2 = await c.service.createTerminal();
    c.service.setActiveInstance(instance2);
    await c.service.revealActiveTerminal();
    await Promise.all([
      instance2.processReady,
      instance2.focusWhenReady(true)
    ]);
    return new Promise((resolve3) => {
      const events = [];
      const endRecording = () => {
        const session = JSON.stringify(events, null, 2);
        clipboardService.writeText(session);
        store.dispose();
        resolve3();
      };
      const timer = store.add(new Delayer(5e3));
      store.add(Event2.runAndSubscribe(instance2.onDimensionsChanged, () => {
        events.push({
          type: "resize",
          cols: instance2.cols,
          rows: instance2.rows
        });
        timer.trigger(endRecording);
      }));
      store.add(commandService.onWillExecuteCommand((e4) => {
        events.push({
          type: "command",
          id: e4.commandId
        });
        timer.trigger(endRecording);
      }));
      store.add(instance2.onWillData((data) => {
        events.push({
          type: "output",
          data
        });
        timer.trigger(endRecording);
      }));
      store.add(instance2.onDidSendText((data) => {
        events.push({
          type: "sendText",
          data
        });
        timer.trigger(endRecording);
      }));
      store.add(instance2.xterm.raw.onData((data) => {
        events.push({
          type: "input",
          data
        });
        timer.trigger(endRecording);
      }));
      let commandDetectedRegistered = false;
      store.add(Event2.runAndSubscribe(instance2.capabilities.onDidAddCapability, (e4) => {
        if (commandDetectedRegistered) {
          return;
        }
        const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
        if (!commandDetection) {
          return;
        }
        store.add(commandDetection.promptInputModel.onDidChangeInput((e5) => {
          events.push({
            type: "promptInputChange",
            data: commandDetection.promptInputModel.getCombinedString()
          });
          timer.trigger(endRecording);
        }));
        commandDetectedRegistered = true;
      }));
    });
  }
});

registerTerminalAction({
  id: "workbench.action.terminal.restartPtyHost" /* RestartPtyHost */,
  title: localize2(20710, "Restart Pty Host"),
  category: Categories.Developer,
  run: async (c, accessor) => {
    const logService = accessor.get(ITerminalLogService);
    const backends = Array.from(c.instanceService.getRegisteredBackends());
    const unresponsiveBackends = backends.filter((e4) => !e4.isResponsive);
    const restartCandidates = unresponsiveBackends.length > 0 ? unresponsiveBackends : backends;
    for (const backend of restartCandidates) {
      logService.warn(`Restarting pty host for authority "${backend.remoteAuthority}"`);
      backend.restartPtyHost();
    }
  }
});

var DevModeContribution = class extends Disposable {
  constructor(_ctx, _configurationService) {
    super();
    this._ctx = _ctx;
    this._configurationService = _configurationService;
    this._activeDevModeDisposables = this._register(new MutableDisposable());
    this._currentColor = 0;
    this._state = 0 /* Off */;
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("terminal.integrated.developer.devMode" /* DevMode */)) {
        this._updateDevMode();
      }
    }));
  }
  static {
    this.ID = "terminal.devMode";
  }
  static get(instance2) {
    return instance2.getContribution(DevModeContribution.ID);
  }
  xtermReady(xterm) {
    this._xterm = xterm;
    this._updateDevMode();
  }
  _updateDevMode() {
    const devMode = this._isEnabled();
    this._xterm?.raw.element?.classList.toggle("dev-mode", devMode);
    const commandDetection = this._ctx.instance.capabilities.get(2 /* CommandDetection */);
    if (devMode) {
      if (commandDetection) {
        if (this._state === 2 /* On */) {
          return;
        }
        this._state = 2 /* On */;
        const commandDecorations = new DisposableMap();
        const otherDisposables = new DisposableStore();
        this._activeDevModeDisposables.value = combinedDisposable(
          commandDecorations,
          otherDisposables,
          // Prompt input
          this._ctx.instance.onDidBlur(() => this._updateDevMode()),
          this._ctx.instance.onDidFocus(() => this._updateDevMode()),
          commandDetection.promptInputModel.onDidChangeInput(() => this._updateDevMode()),
          // Sequence markers
          commandDetection.onCommandFinished((command4) => {
            const colorClass = `color-${this._currentColor}`;
            const decorations = [];
            commandDecorations.set(command4, combinedDisposable(...decorations));
            if (command4.promptStartMarker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command4.promptStartMarker
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e4) => {
                  e4.textContent = "A";
                  e4.classList.add("xterm-sequence-decoration", "top", "left", colorClass);
                }));
              }
            }
            if (command4.marker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command4.marker,
                x: command4.startX
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e4) => {
                  e4.textContent = "B";
                  e4.classList.add("xterm-sequence-decoration", "top", "right", colorClass);
                }));
              }
            }
            if (command4.executedMarker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command4.executedMarker,
                x: command4.executedX
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e4) => {
                  e4.textContent = "C";
                  e4.classList.add("xterm-sequence-decoration", "bottom", "left", colorClass);
                }));
              }
            }
            if (command4.endMarker) {
              const d = this._ctx.instance.xterm.raw?.registerDecoration({
                marker: command4.endMarker
              });
              if (d) {
                decorations.push(d);
                otherDisposables.add(d.onRender((e4) => {
                  e4.textContent = "D";
                  e4.classList.add("xterm-sequence-decoration", "bottom", "right", colorClass);
                }));
              }
            }
            this._currentColor = (this._currentColor + 1) % 2;
          }),
          commandDetection.onCommandInvalidated((commands) => {
            for (const c of commands) {
              const decorations = commandDecorations.get(c);
              if (decorations) {
                dispose(decorations);
              }
              commandDecorations.deleteAndDispose(c);
            }
          })
        );
      } else {
        if (this._state === 1 /* WaitingForCapability */) {
          return;
        }
        this._state = 1 /* WaitingForCapability */;
        this._activeDevModeDisposables.value = this._ctx.instance.capabilities.onDidAddCommandDetectionCapability((e4) => {
          this._updateDevMode();
        });
      }
    } else {
      if (this._state === 0 /* Off */) {
        return;
      }
      this._state = 0 /* Off */;
      this._activeDevModeDisposables.clear();
    }
  }
  _isEnabled() {
    return this._configurationService.getValue("terminal.integrated.developer.devMode" /* DevMode */) || false;
  }
};

DevModeContribution = __decorateClass([
  __decorateParam(1, IConfigurationService)
], DevModeContribution);

registerTerminalContribution(DevModeContribution.ID, DevModeContribution);
export { DevModeContribution };
