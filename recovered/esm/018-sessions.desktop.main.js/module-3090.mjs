// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/agentHostTerminalService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { localize } from "./module-0001.mjs";
import { transaction } from "./module-0045.mjs";
import { URI } from "./module-0032.mjs";
import { generateUuid } from "./module-0190.mjs";
import { AgentHostPty } from "./module-3087.mjs";
import { AgentHostOutputChannel } from "./module-3088.mjs";
import { AhpTerminalCommandSource } from "./module-3089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalChatService, ITerminalService } from "./module-1150.mjs";
import { ITerminalProfileService } from "./module-1174.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ITerminalLogService } from "./module-1155.mjs";


// src/vs/workbench/contrib/terminal/browser/agentHostTerminalService.ts
var AGENT_HOST_PROFILE_EXT_ID = "vscode.agent-host-terminal";

var IAgentHostTerminalService = createDecorator("agentHostTerminalService");

var AgentHostTerminalService = class extends Disposable {
  constructor(_terminalService, _terminalChatService, _terminalProfileService, _quickInputService, _logService) {
    super();
    this._terminalService = _terminalService;
    this._terminalChatService = _terminalChatService;
    this._terminalProfileService = _terminalProfileService;
    this._quickInputService = _quickInputService;
    this._logService = _logService;
    this._entries = [];
    this._usedHosts = /* @__PURE__ */ new Set();
    this._profileRegistrations = this._register(new DisposableMap());
    this._profiles = observableValue("agentHostTerminalProfiles", []);
    this.profiles = this._profiles;
    /** Revived terminal instances, keyed by terminal URI string. */
    this._revivedInstances = /* @__PURE__ */ new Map();
    /**
     * Active AgentHostPty instances with their owning connection clientId,
     * keyed by terminal URI string. Used for reconnection scoping.
     */
    this._activePtys = /* @__PURE__ */ new Map();
    this._pendingRevives = /* @__PURE__ */ new Map();
  }
  // #region Profile management
  registerEntry(entry) {
    this._entries.push(entry);
    this._reconcile();
    return toDisposable(() => {
      const idx = this._entries.indexOf(entry);
      if (idx >= 0) {
        this._entries.splice(idx, 1);
        this._reconcile();
      }
    });
  }
  getProfileForConnection(address) {
    const entry = this._entries.find((e4) => e4.address === address);
    if (!entry) {
      return void 0;
    }
    if (!this._profileRegistrations.has(address)) {
      this._usedHosts.add(address);
      this._reconcile();
    }
    return this._profiles.get().find((p) => p.address === address);
  }
  setDefaultCwd(cwd2) {
    this._defaultCwd = cwd2;
  }
  _reconcile() {
    const entries2 = this._entries;
    const desiredProfiles = /* @__PURE__ */ new Map();
    if (entries2.length === 0) {
    } else if (entries2.length === 1) {
      desiredProfiles.set(entries2[0].address, entries2[0]);
    } else {
      let displaying = 0;
      for (const address of this._usedHosts) {
        const entry = entries2.find((e4) => e4.address === address);
        if (entry) {
          displaying++;
          desiredProfiles.set(entry.address, entry);
        }
      }
      if (displaying === entries2.length - 1) {
        const missing = entries2.find((e4) => !this._usedHosts.has(e4.address));
        if (missing) {
          desiredProfiles.set(missing.address, missing);
        }
      } else if (displaying < entries2.length) {
        desiredProfiles.set("__quickpick__", {
          name: localize(19907, null),
          address: "__quickpick__",
          getConnection: () => void 0
        });
      }
    }
    for (const [key3, entry] of desiredProfiles) {
      if (!this._profileRegistrations.has(key3)) {
        this._registerProfile(key3, entry, entries2);
      }
    }
    for (const key3 of this._profileRegistrations.keys()) {
      if (!desiredProfiles.has(key3)) {
        this._profileRegistrations.deleteAndDispose(key3);
      }
    }
    const infos = [];
    for (const [key3] of desiredProfiles) {
      infos.push({
        extensionIdentifier: AGENT_HOST_PROFILE_EXT_ID,
        profileId: key3,
        title: key3 === "__quickpick__" ? localize(19907, null) : localize(19909, null, desiredProfiles.get(key3).name),
        address: key3
      });
    }
    transaction((tx) => {
      this._profiles.set(infos, tx);
    });
  }
  _registerProfile(key3, entry, allEntries) {
    const provider = {
      createContributedTerminalProfile: async (options3) => {
        let connection;
        let displayName = entry.name;
        if (key3 === "__quickpick__") {
          const picks = allEntries.map((e4) => ({
            label: localize(19909, null, e4.name),
            address: e4.address,
            hostName: e4.name
          }));
          const pick = await this._quickInputService.pick(picks, {
            placeHolder: localize(19908, null)
          });
          if (!pick) {
            return;
          }
          this._usedHosts.add(pick.address);
          this._reconcile();
          displayName = pick.hostName;
          connection = allEntries.find((e4) => e4.address === pick.address)?.getConnection();
        } else {
          connection = entry.getConnection();
        }
        if (!connection) {
          return;
        }
        await this.createTerminal(connection, {
          name: localize(19909, null, displayName),
          cwd: options3.cwd ? typeof options3.cwd === "string" ? URI.file(options3.cwd) : options3.cwd : this._defaultCwd,
          location: options3.location
        });
      }
    };
    const title = key3 === "__quickpick__" ? localize(19907, null) : localize(19909, null, entry.name);
    const store = new DisposableStore();
    store.add(this._terminalProfileService.registerTerminalProfileProvider(
      AGENT_HOST_PROFILE_EXT_ID,
      key3,
      provider
    ));
    store.add(this._terminalProfileService.registerInternalContributedProfile({
      extensionIdentifier: AGENT_HOST_PROFILE_EXT_ID,
      id: key3,
      title,
      icon: "remote"
    }));
    this._profileRegistrations.set(key3, store);
  }
  // #endregion
  async createTerminalForEntry(address, options3) {
    const entry = this._entries.find((e4) => e4.address === address);
    if (!entry) {
      return void 0;
    }
    const connection = entry.getConnection();
    if (!connection) {
      return void 0;
    }
    return this.createTerminal(connection, options3);
  }
  async createTerminal(connection, options3) {
    const terminalUri = URI.from({ scheme: "agenthost-terminal", path: `/${generateUuid()}` });
    const name = options3?.name ?? localize(19906, null);
    const key3 = terminalUri.toString();
    const ptyRegistration = this._createPtyRegistration(key3, connection.clientId);
    let instance2;
    try {
      instance2 = await this._terminalService.createTerminal({
        config: {
          customPtyImplementation: (id2, cols, rows) => {
            const pty = new AgentHostPty(id2, connection, terminalUri, {
              name,
              cwd: options3?.cwd
            }, this._logService);
            if (cols > 0 && rows > 0) {
              pty.resize(cols, rows);
            }
            ptyRegistration.setPty(pty);
            return pty;
          },
          name,
          icon: { id: "remote" },
          isFeatureTerminal: false
        },
        location: options3?.location
      });
    } catch (error) {
      ptyRegistration.dispose();
      throw error;
    }
    this._registerInstancePtyCleanup(instance2, key3, ptyRegistration);
    return instance2;
  }
  async reviveTerminal(connection, terminalUri, terminalToolSessionId) {
    const key3 = terminalUri.toString();
    const pending = this._pendingRevives.get(key3);
    if (pending) {
      return pending;
    }
    const revive2 = this._doReviveTerminal(connection, terminalUri, terminalToolSessionId, key3).finally(() => {
      if (this._pendingRevives.get(key3) === revive2) {
        this._pendingRevives.delete(key3);
      }
    });
    this._pendingRevives.set(key3, revive2);
    return revive2;
  }
  attachOutputTerminal(connection, terminalUri, terminalToolSessionId) {
    const store = new DisposableStore();
    const source = store.add(new AgentHostOutputChannel(connection, terminalUri));
    store.add(this._terminalChatService.registerOutputSource(terminalToolSessionId, source));
    return store;
  }
  async _doReviveTerminal(connection, terminalUri, terminalToolSessionId, key3) {
    const existing = this._revivedInstances.get(key3);
    if (existing) {
      return existing;
    }
    const store = new DisposableStore();
    const commandSource = store.add(new AhpTerminalCommandSource());
    const ptyRegistration = this._createPtyRegistration(key3, connection.clientId);
    const instancePromise = Promise.resolve().then(() => this._terminalService.createTerminal({
      config: {
        customPtyImplementation: (id2, cols, rows) => {
          const pty = new AgentHostPty(id2, connection, terminalUri, {
            attachOnly: true
          }, this._logService);
          if (cols > 0 && rows > 0) {
            pty.resize(cols, rows);
          }
          if (!store.isDisposed) {
            commandSource.connect(instance2, pty);
          }
          ptyRegistration.setPty(pty);
          return pty;
        },
        name: localize(19910, null),
        isFeatureTerminal: true,
        hideFromUser: true
      }
    }));
    store.add(this._terminalChatService.registerAhpCommandSource(terminalToolSessionId, commandSource, instancePromise));
    let instance2;
    try {
      instance2 = await instancePromise;
    } catch (error) {
      store.dispose();
      ptyRegistration.dispose();
      throw error;
    }
    this._terminalChatService.registerTerminalInstanceWithToolSession(terminalToolSessionId, instance2);
    this._revivedInstances.set(key3, instance2);
    instance2.store.add(store);
    this._registerInstancePtyCleanup(instance2, key3, ptyRegistration);
    return instance2;
  }
  /** Creates the registration that owns the pty produced for {@link key}. */
  _createPtyRegistration(key3, clientId) {
    let pty;
    let isDisposed = false;
    return {
      setPty: (value2) => {
        if (isDisposed) {
          value2.dispose();
          return;
        }
        pty = value2;
        this._activePtys.set(key3, { pty, clientId });
      },
      dispose: () => {
        if (isDisposed) {
          return;
        }
        isDisposed = true;
        if (this._activePtys.get(key3)?.pty === pty) {
          this._activePtys.delete(key3);
        }
        pty?.dispose();
      }
    };
  }
  /**
   * Ties the registration's lifetime to the terminal instance so the local
   * pty is disposed even on paths that never call `shutdown()`.
   */
  _registerInstancePtyCleanup(instance2, key3, ptyRegistration) {
    const cleanup = () => {
      if (this._revivedInstances.get(key3) === instance2) {
        this._revivedInstances.delete(key3);
      }
      ptyRegistration.dispose();
    };
    if (instance2.isDisposed) {
      cleanup();
    } else {
      instance2.store.add(instance2.onDisposed(cleanup));
    }
  }
  async reconnectTerminals(newConnection, oldClientId) {
    const entries2 = [...this._activePtys.entries()].filter(
      ([, entry]) => entry.clientId === oldClientId
    );
    const total = entries2.length;
    let recovered = 0;
    const promises = [];
    for (const [key3, entry] of entries2) {
      promises.push(
        entry.pty.reconnect(newConnection).then((success) => {
          if (success) {
            recovered++;
            entry.clientId = newConnection.clientId;
          } else {
            this._logService.warn(`[AgentHostTerminalService] Failed to reconnect terminal: ${key3}`);
          }
        })
      );
    }
    await Promise.all(promises);
    return { recovered, total };
  }
};

AgentHostTerminalService = __decorateClass([
  __decorateParam(0, ITerminalService),
  __decorateParam(1, ITerminalChatService),
  __decorateParam(2, ITerminalProfileService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, ITerminalLogService)
], AgentHostTerminalService);
export { AGENT_HOST_PROFILE_EXT_ID, IAgentHostTerminalService, AgentHostTerminalService };
