// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/sendSignal/browser/terminal.sendSignal.contribution.ts
import { isObject, isString } from "./module-0010.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { registerTerminalAction } from "./module-3272.mjs";
import { isWindows } from "./module-0014.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/terminalContrib/sendSignal/browser/terminal.sendSignal.contribution.ts
function toOptionalString3(obj) {
  return isString(obj) ? obj : void 0;
}

var sendSignalString = localize2(20831, "Send Signal");

registerTerminalAction({
  id: "workbench.action.terminal.sendSignal" /* SendSignal */,
  title: sendSignalString,
  f1: !isWindows,
  metadata: {
    description: sendSignalString.value,
    args: [{
      name: "args",
      schema: {
        type: "object",
        required: ["signal"],
        properties: {
          signal: {
            description: localize(20832, null),
            type: "string"
          }
        }
      }
    }]
  },
  run: async (c, accessor, args2) => {
    const quickInputService = accessor.get(IQuickInputService);
    const instance2 = c.service.activeInstance;
    if (!instance2) {
      return;
    }
    function isSignalArg(obj) {
      return isObject(obj) && "signal" in obj;
    }
    let signal = isSignalArg(args2) ? toOptionalString3(args2.signal) : void 0;
    if (!signal) {
      const signalOptions = [
        { label: "SIGINT", description: localize(20835, null) },
        { label: "SIGTERM", description: localize(20839, null) },
        { label: "SIGKILL", description: localize(20836, null) },
        { label: "SIGSTOP", description: localize(20838, null) },
        { label: "SIGCONT", description: localize(20833, null) },
        { label: "SIGHUP", description: localize(20834, null) },
        { label: "SIGQUIT", description: localize(20837, null) },
        { label: "SIGUSR1", description: localize(20840, null) },
        { label: "SIGUSR2", description: localize(20841, null) },
        { type: "separator" },
        { label: localize(20829, null) }
      ];
      const selected = await quickInputService.pick(signalOptions, {
        placeHolder: localize(20830, null)
      });
      if (!selected) {
        return;
      }
      if (selected.label === localize(20829, null)) {
        const inputSignal = await quickInputService.input({
          prompt: localize(20828, null)
        });
        if (!inputSignal) {
          return;
        }
        signal = inputSignal;
      } else {
        signal = selected.label;
      }
    }
    await instance2.sendSignal(signal);
  }
});
export { toOptionalString3, sendSignalString };
