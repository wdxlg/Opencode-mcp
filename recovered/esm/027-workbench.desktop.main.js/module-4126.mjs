// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/electron-browser/agentsVoiceNativeCommands.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { INativeHostService } from "./module-2591.mjs";


// src/vs/workbench/contrib/agentsVoice/electron-browser/agentsVoiceNativeCommands.ts
CommandsRegistry.registerCommand("_agentsVoice.setWindowAlwaysOnTop", async (accessor, alwaysOnTop, targetWindowId) => {
  const nativeHostService = accessor.get(INativeHostService);
  await nativeHostService.setWindowAlwaysOnTop(alwaysOnTop, { targetWindowId });
});

CommandsRegistry.registerCommand("_agentsVoice.minimizeWindow", async (accessor, targetWindowId) => {
  const nativeHostService = accessor.get(INativeHostService);
  await nativeHostService.minimizeWindow({ targetWindowId });
});
export {};
