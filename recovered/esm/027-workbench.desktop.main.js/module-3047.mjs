// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testingConfigurationUi.ts
import { localize } from "./module-0001.mjs";
import { ITestProfileService, canUseProfileWithTest } from "./module-1429.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { testConfigurationGroupNames } from "./module-1427.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { testingUpdateProfiles } from "./module-3039.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { isDefined } from "./module-0010.mjs";


// src/vs/workbench/contrib/testing/browser/testingConfigurationUi.ts
function buildPicker(accessor, {
  onlyGroup,
  showConfigureButtons = true,
  onlyForTest,
  onlyConfigurable,
  placeholder = localize(21145, null)
}) {
  const profileService = accessor.get(ITestProfileService);
  const items = [];
  const pushItems = (allProfiles, description) => {
    for (const profiles2 of groupBy2(allProfiles, (a, b) => a.group - b.group)) {
      let addedHeader = false;
      if (onlyGroup) {
        if (profiles2[0].group !== onlyGroup) {
          continue;
        }
        addedHeader = true;
      }
      for (const profile of profiles2) {
        if (onlyConfigurable && !profile.hasConfigurationHandler) {
          continue;
        }
        if (!addedHeader) {
          items.push({ type: "separator", label: testConfigurationGroupNames[profiles2[0].group] });
          addedHeader = true;
        }
        items.push({
          type: "item",
          profile,
          label: profile.label,
          description,
          alwaysShow: true,
          buttons: profile.hasConfigurationHandler && showConfigureButtons ? [{
            iconClass: ThemeIcon.asClassName(testingUpdateProfiles),
            tooltip: localize(21146, null)
          }] : []
        });
      }
    }
  };
  if (onlyForTest !== void 0) {
    pushItems(profileService.getControllerProfiles(onlyForTest.controllerId).filter((p) => canUseProfileWithTest(p, onlyForTest)));
  } else {
    for (const { profiles: profiles2, controller } of profileService.all()) {
      pushItems(profiles2, controller.label.get());
    }
  }
  const quickpick = accessor.get(IQuickInputService).createQuickPick({ useSeparators: true });
  quickpick.items = items;
  quickpick.placeholder = placeholder;
  return quickpick;
}

var triggerButtonHandler = (service, resolve3) => (evt) => {
  const profile = evt.item.profile;
  if (profile) {
    service.configure(profile.controllerId, profile.profileId);
    resolve3(void 0);
  }
};

CommandsRegistry.registerCommand({
  id: "vscode.pickMultipleTestProfiles",
  handler: async (accessor, options3) => {
    const profileService = accessor.get(ITestProfileService);
    const quickpick = buildPicker(accessor, options3);
    if (!quickpick) {
      return;
    }
    const disposables = new DisposableStore();
    disposables.add(quickpick);
    quickpick.canSelectMany = true;
    if (options3.selected) {
      quickpick.selectedItems = quickpick.items.filter((i2) => i2.type === "item").filter((i2) => options3.selected.some((s) => s.controllerId === i2.profile.controllerId && s.profileId === i2.profile.profileId));
    }
    const pick = await new Promise((resolve3) => {
      disposables.add(quickpick.onDidAccept(() => {
        const selected = quickpick.selectedItems;
        resolve3(selected.map((s) => s.profile).filter(isDefined));
      }));
      disposables.add(quickpick.onDidHide(() => resolve3(void 0)));
      disposables.add(quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve3)));
      quickpick.show();
    });
    disposables.dispose();
    return pick;
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.pickTestProfile",
  handler: async (accessor, options3) => {
    const profileService = accessor.get(ITestProfileService);
    const quickpick = buildPicker(accessor, options3);
    if (!quickpick) {
      return;
    }
    const disposables = new DisposableStore();
    disposables.add(quickpick);
    const pick = await new Promise((resolve3) => {
      disposables.add(quickpick.onDidAccept(() => resolve3(quickpick.selectedItems[0]?.profile)));
      disposables.add(quickpick.onDidHide(() => resolve3(void 0)));
      disposables.add(quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve3)));
      quickpick.show();
    });
    disposables.dispose();
    return pick;
  }
});
export { buildPicker, triggerButtonHandler };
