// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/aquarium/browser/aquarium.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { AquariumService, IAquariumService, SESSIONS_DEVELOPER_JOY_ENABLED_SETTING } from "./module-3556.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/sessions/contrib/aquarium/browser/aquarium.contribution.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "sessions",
  properties: {
    [SESSIONS_DEVELOPER_JOY_ENABLED_SETTING]: {
      type: "boolean",
      default: true,
      description: localize(4131, null),
      tags: ["experimental"]
    }
  }
});

registerSingleton(IAquariumService, AquariumService, 1 /* Delayed */);

var SimulateFishFeedingStreakAction = class _SimulateFishFeedingStreakAction extends Action2 {
  static {
    this.ID = "sessions.aquarium.simulateStreak";
  }
  constructor() {
    super({
      id: _SimulateFishFeedingStreakAction.ID,
      title: localize2(4120, "Simulate Fish Feeding Streak"),
      f1: true,
      category: Categories.Developer
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const aquariumService = accessor.get(IAquariumService);
    const aliveItem = { id: "alive", label: localize(4121, null), detail: localize(4122, null) };
    const diedItem = { id: "died", label: localize(4127, null), detail: localize(4128, null) };
    const clearItem = { id: "clear", label: localize(4123, null), detail: localize(4124, null) };
    const scenario = await quickInputService.pick([aliveItem, diedItem, clearItem], {
      placeHolder: localize(4129, null)
    });
    if (!scenario) {
      return;
    }
    if (scenario.id === "clear") {
      aquariumService.simulateStreak(0, true);
      return;
    }
    const raw = await quickInputService.input({
      value: "30",
      prompt: localize(4126, null),
      validateInput: async (value2) => {
        const n2 = Number(value2);
        return !Number.isInteger(n2) || n2 <= 0 ? localize(4125, null) : void 0;
      }
    });
    if (raw === void 0) {
      return;
    }
    aquariumService.simulateStreak(Number(raw), scenario.id === "alive");
  }
};

registerAction2(SimulateFishFeedingStreakAction);

var ToggleAquariumActionVisibilityAction = class _ToggleAquariumActionVisibilityAction extends Action2 {
  static {
    this.ID = "sessions.aquarium.toggleActionVisibility";
  }
  constructor() {
    super({
      id: _ToggleAquariumActionVisibilityAction.ID,
      title: localize2(4130, "Toggle Aquarium Action Visibility"),
      f1: true,
      category: Categories.Developer
    });
  }
  run(accessor) {
    accessor.get(IAquariumService).toggleActionVisibility();
  }
};

registerAction2(ToggleAquariumActionVisibilityAction);
export { SimulateFishFeedingStreakAction, ToggleAquariumActionVisibilityAction };
