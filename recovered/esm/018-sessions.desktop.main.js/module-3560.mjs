// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteHostOptions.ts
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, removeWebSocketRemoteAgentHostEntry } from "./module-1736.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IProgressService } from "./module-0446.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { timeout } from "./module-0036.mjs";
import { toAction } from "./module-0082.mjs";
import { isWeb } from "./module-0014.mjs";
import { TUNNEL_ADDRESS_PREFIX } from "./module-1734.mjs";
import { promptRemoteAgentHostLocationPreference } from "./module-3559.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IProductService } from "./module-0875.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISSHRemoteAgentHostService } from "./module-1779.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IRemoteAgentHostLocationPreferenceService } from "./module-3558.mjs";
import { severity_default } from "./module-0266.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteHostOptions.ts
async function reconnectRemoteHost(provider, remoteAgentHostService) {
  if (provider.connect) {
    await provider.connect();
  } else if (provider.remoteAddress) {
    remoteAgentHostService.reconnect(provider.remoteAddress);
  }
}

async function removeRemoteHost(provider, remoteAgentHostService, configurationService) {
  if (provider.disconnect) {
    await provider.disconnect();
  } else if (provider.remoteAddress) {
    await removeWebSocketRemoteAgentHostEntry(configurationService, provider.remoteAddress);
    await remoteAgentHostService.removeRemoteAgentHost(provider.remoteAddress);
  }
}

function hasUpgradeReconnectStarted(status2) {
  return RemoteAgentHostConnectionStatus.isConnecting(status2) || RemoteAgentHostConnectionStatus.isReconnecting(status2) || RemoteAgentHostConnectionStatus.isConnected(status2);
}

async function runServerUpgrade(accessor, provider, upgradeMethod) {
  const address = provider.remoteAddress;
  if (!address) {
    return;
  }
  const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
  const notificationService = accessor.get(INotificationService);
  const progressService = accessor.get(IProgressService);
  await progressService.withProgress(
    {
      location: 15 /* Notification */,
      title: localize(5250, null, provider.label)
    },
    async (progress) => {
      try {
        const upgradeResult = await remoteAgentHostService.triggerServerUpgrade(address, upgradeMethod);
        if (upgradeResult.upgradeStarted) {
          const waitMs = (upgradeResult.restartDelayMs ?? 3e3) + 2e3;
          const totalSeconds = Math.max(1, Math.ceil(waitMs / 1e3));
          const watchStore = new DisposableStore();
          let reconnectAlreadyInFlight = false;
          if (provider.connectionStatus) {
            watchStore.add(autorun((reader) => {
              const next = provider.connectionStatus.read(reader);
              if (hasUpgradeReconnectStarted(next)) {
                reconnectAlreadyInFlight = true;
              }
            }));
          }
          try {
            for (let secondsLeft = totalSeconds; secondsLeft > 0; secondsLeft--) {
              if (reconnectAlreadyInFlight) {
                break;
              }
              progress.report({
                message: localize(
                  5244,
                  null,
                  secondsLeft
                )
              });
              await timeout(1e3);
            }
          } finally {
            watchStore.dispose();
          }
          if (!reconnectAlreadyInFlight) {
            progress.report({
              message: localize(5249, null)
            });
            await reconnectRemoteHost(provider, remoteAgentHostService);
          }
        } else if (upgradeResult.upgradeNeeded === false) {
          notificationService.notify({
            severity: Severity2.Info,
            message: localize(5247, null, provider.label)
          });
        } else {
          notificationService.notify({
            severity: Severity2.Warning,
            message: upgradeResult.error ? localize(5246, null, provider.label, upgradeResult.error) : localize(5248, null, provider.label)
          });
        }
      } catch (err) {
        notificationService.notify({
          severity: Severity2.Error,
          message: localize(5245, null, provider.label, err instanceof Error ? err.message : String(err))
        });
      }
    }
  );
}

function watchForIncompatibleNotifications(provider, instantiationService, notificationService) {
  if (!provider.connectionStatus) {
    return Disposable.None;
  }
  let lastWasIncompatible = RemoteAgentHostConnectionStatus.isIncompatible(provider.connectionStatus.get());
  return autorun((reader) => {
    const status2 = provider.connectionStatus.read(reader);
    const isIncompatible = RemoteAgentHostConnectionStatus.isIncompatible(status2);
    if (isIncompatible && !lastWasIncompatible) {
      const upgradeMethod = status2.vscodeUpgradeMethod;
      const primaryActions = [];
      if (upgradeMethod) {
        primaryActions.push(toAction({
          id: "agentHost.upgradeFromIncompatible",
          label: localize(5214, null),
          run: () => instantiationService.invokeFunction((accessor) => runServerUpgrade(accessor, provider, upgradeMethod))
        }));
      }
      primaryActions.push(toAction({
        id: "agentHost.showRemoteHostOptions",
        label: localize(5213, null),
        run: () => instantiationService.invokeFunction((accessor) => showRemoteHostOptions(accessor, provider))
      }));
      notificationService.notify({
        severity: Severity2.Warning,
        message: localize(
          5212,
          null,
          provider.label,
          status2.message
        ),
        actions: { primary: primaryActions }
      });
    }
    lastWasIncompatible = isIncompatible;
  });
}

function getStatusLabel(status2) {
  switch (status2.kind) {
    case "connected":
      return localize(5241, null);
    case "connecting":
      return localize(5238, null);
    case "reconnecting":
      return localize(5242, null);
    case "disconnected":
      return localize(5240, null);
    case "incompatible":
      return localize(5239, null);
  }
}

function getStatusHover(status2, address) {
  switch (status2.kind) {
    case "connected":
      return address ? localize(5218, null, address) : localize(5217, null);
    case "connecting":
      return address ? localize(5220, null, address) : localize(5219, null);
    case "reconnecting":
      return address ? localize(5226, null, address) : localize(5225, null);
    case "disconnected":
      return address ? localize(5222, null, address) : localize(5221, null);
    case "incompatible": {
      const offered = status2.supportedByClient.join(", ");
      return address ? localize(5224, null, status2.message, offered, address) : localize(5223, null, status2.message, offered);
    }
  }
}

var SSH_ADDRESS_PREFIX = "ssh:";

function supportsRemoteAgentHostLocationPreference(preferenceKey, isWebPlatform = isWeb) {
  if (isWebPlatform) {
    return false;
  }
  return preferenceKey.startsWith(SSH_ADDRESS_PREFIX) || preferenceKey.startsWith(TUNNEL_ADDRESS_PREFIX);
}

function usesSSHConfigFile(preferenceKey, isWebPlatform = isWeb) {
  if (isWebPlatform) {
    return false;
  }
  return preferenceKey.startsWith(SSH_ADDRESS_PREFIX);
}

function buildRemoteHostOptionItems(options3) {
  const items = [];
  if (options3.upgradeMethod) {
    items.push({ label: "$(cloud-download) " + localize(5243, null), id: "upgrade" });
  }
  if (!options3.isConnected) {
    items.push({ label: "$(debug-restart) " + localize(5235, null), id: "reconnect" });
  }
  items.push(
    { label: "$(trash) " + localize(5237, null), id: "remove" },
    { label: "$(copy) " + localize(5216, null), id: "copy" }
  );
  items.push(usesSSHConfigFile(options3.preferenceKey ?? options3.address, options3.isWebPlatform ?? isWeb) ? { label: "$(settings-gear) " + localize(5234, null), id: "sshConfig" } : { label: "$(settings-gear) " + localize(5233, null), id: "settings" });
  if (supportsRemoteAgentHostLocationPreference(options3.preferenceKey ?? options3.address, options3.isWebPlatform ?? isWeb)) {
    items.push({ label: "$(server-process) " + localize(5215, null), id: "locationPreference" });
  }
  return items;
}

async function changeRemoteAgentHostLocationPreference(options3) {
  const currentPreference = options3.locationPreferenceService.getPreference(options3.preferenceKey);
  const preference = await promptRemoteAgentHostLocationPreference(options3.dialogService, options3.hostLabel, options3.productName, currentPreference);
  if (!preference) {
    return;
  }
  options3.locationPreferenceService.setPreference(options3.preferenceKey, preference);
  const provider = options3.provider;
  if (!provider) {
    options3.notificationService.warn(localize(5231, null, options3.hostLabel));
    return;
  }
  await options3.progressService.withProgress(
    {
      location: 15 /* Notification */,
      title: localize(5230, null, options3.hostLabel)
    },
    async () => {
      try {
        await reconnectRemoteHost(provider, options3.remoteAgentHostService);
        options3.notificationService.info(localize(5232, null, options3.hostLabel));
      } catch (err) {
        options3.notificationService.error(localize(5229, null, options3.hostLabel, err instanceof Error ? err.message : String(err)));
      }
    }
  );
}

async function showRemoteHostOptions(accessor, provider, options3 = {}) {
  const address = provider.remoteAddress;
  if (!address) {
    return void 0;
  }
  const quickInputService = accessor.get(IQuickInputService);
  const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
  const clipboardService = accessor.get(IClipboardService);
  const preferencesService = accessor.get(IPreferencesService);
  const productService = accessor.get(IProductService);
  const instantiationService = accessor.get(IInstantiationService);
  const dialogService = accessor.get(IDialogService);
  const notificationService = accessor.get(INotificationService);
  const progressService = accessor.get(IProgressService);
  const configurationService = accessor.get(IConfigurationService);
  const sshService = accessor.get(ISSHRemoteAgentHostService);
  const editorService = accessor.get(IEditorService);
  const locationPreferenceService = isWeb ? void 0 : accessor.get(IRemoteAgentHostLocationPreferenceService);
  const status2 = provider.connectionStatus?.get();
  const isConnected = RemoteAgentHostConnectionStatus.isConnected(status2);
  const upgradeMethod = RemoteAgentHostConnectionStatus.isIncompatible(status2) ? status2.vscodeUpgradeMethod : void 0;
  const preferenceKey = provider.remoteLocationPreferenceKey ?? address;
  const items = buildRemoteHostOptionItems({ address, preferenceKey, isConnected, upgradeMethod });
  const result = await new Promise((resolve3) => {
    const store = new DisposableStore();
    const picker = store.add(quickInputService.createQuickPick());
    picker.placeholder = localize(5236, null, provider.label);
    picker.items = items;
    if (RemoteAgentHostConnectionStatus.isIncompatible(status2)) {
      const offered = status2.supportedByClient.join(", ");
      const served = status2.offeredByServer?.length ? status2.offeredByServer.join(", ") : void 0;
      picker.severity = severity_default.Warning;
      picker.validationMessage = served ? localize(5228, null, offered, provider.label, served, productService.nameShort) : localize(5227, null, offered, provider.label, status2.message, productService.nameShort);
    }
    if (options3.showBackButton) {
      picker.buttons = [quickInputService.backButton];
    }
    store.add(picker.onDidTriggerButton((button) => {
      if (button === quickInputService.backButton) {
        resolve3("back");
        picker.hide();
      }
    }));
    store.add(picker.onDidAccept(() => {
      resolve3(picker.selectedItems[0]);
      picker.hide();
    }));
    store.add(picker.onDidHide(() => {
      resolve3(void 0);
      store.dispose();
    }));
    picker.show();
  });
  if (result === "back") {
    return "back";
  }
  if (!result) {
    return void 0;
  }
  switch (result.id) {
    case "upgrade":
      if (upgradeMethod) {
        await instantiationService.invokeFunction(runServerUpgrade, provider, upgradeMethod);
      }
      break;
    case "reconnect":
      await reconnectRemoteHost(provider, remoteAgentHostService);
      break;
    case "remove":
      await removeRemoteHost(provider, remoteAgentHostService, configurationService);
      break;
    case "copy":
      await clipboardService.writeText(address);
      break;
    case "settings":
      await preferencesService.openSettings({ query: "chat.remoteAgentHosts" });
      break;
    case "sshConfig": {
      const configResource = await sshService.ensureUserSSHConfig();
      await editorService.openEditor({ resource: configResource, options: { pinned: true } });
      break;
    }
    case "locationPreference":
      if (locationPreferenceService) {
        await changeRemoteAgentHostLocationPreference({
          preferenceKey,
          hostLabel: provider.label,
          productName: productService.nameShort,
          provider,
          dialogService,
          locationPreferenceService,
          notificationService,
          remoteAgentHostService,
          progressService
        });
      }
      break;
  }
  return void 0;
}
export { reconnectRemoteHost, removeRemoteHost, hasUpgradeReconnectStarted, runServerUpgrade, watchForIncompatibleNotifications, getStatusLabel, getStatusHover, supportsRemoteAgentHostLocationPreference, usesSSHConfigFile, buildRemoteHostOptionItems, changeRemoteAgentHostLocationPreference, showRemoteHostOptions, SSH_ADDRESS_PREFIX };
