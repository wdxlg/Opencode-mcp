// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncMachines.ts
import { createDecorator } from "./module-0077.mjs";
import { PlatformToString, isAndroid, isChrome, isEdge, isFirefox, isSafari, isWeb, platform } from "./module-0014.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getServiceMachineId } from "./module-0891.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUserDataSyncLogService, IUserDataSyncStoreService } from "./module-1639.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/platform/userDataSync/common/userDataSyncMachines.ts
var IUserDataSyncMachinesService = createDecorator("IUserDataSyncMachinesService");

var currentMachineNameKey = "sync.currentMachineName";

var Safari = "Safari";

var Chrome = "Chrome";

var Edge = "Edge";

var Firefox = "Firefox";

var Android = "Android";

function getPlatformName() {
  if (isSafari) {
    return Safari;
  }
  if (isChrome) {
    return Chrome;
  }
  if (isEdge) {
    return Edge;
  }
  if (isFirefox) {
    return Firefox;
  }
  if (isAndroid) {
    return Android;
  }
  return PlatformToString(isWeb ? 0 /* Web */ : platform);
}

var UserDataSyncMachinesService = class extends Disposable {
  constructor(environmentService, fileService, storageService, userDataSyncStoreService, logService, productService) {
    super();
    this.storageService = storageService;
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.logService = logService;
    this.productService = productService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.userData = null;
    this.currentMachineIdPromise = getServiceMachineId(environmentService, fileService, storageService);
  }
  static {
    this.VERSION = 1;
  }
  static {
    this.RESOURCE = "machines";
  }
  async getMachines(manifest) {
    const currentMachineId = await this.currentMachineIdPromise;
    const machineData = await this.readMachinesData(manifest);
    return machineData.machines.map((machine) => ({ ...machine, ...{ isCurrent: machine.id === currentMachineId } }));
  }
  async addCurrentMachine(manifest) {
    const currentMachineId = await this.currentMachineIdPromise;
    const machineData = await this.readMachinesData(manifest);
    if (!machineData.machines.some(({ id: id2 }) => id2 === currentMachineId)) {
      machineData.machines.push({ id: currentMachineId, name: this.computeCurrentMachineName(machineData.machines), platform: getPlatformName() });
      await this.writeMachinesData(machineData);
    }
  }
  async removeCurrentMachine(manifest) {
    const currentMachineId = await this.currentMachineIdPromise;
    const machineData = await this.readMachinesData(manifest);
    const updatedMachines = machineData.machines.filter(({ id: id2 }) => id2 !== currentMachineId);
    if (updatedMachines.length !== machineData.machines.length) {
      machineData.machines = updatedMachines;
      await this.writeMachinesData(machineData);
    }
  }
  async renameMachine(machineId, name, manifest) {
    const machineData = await this.readMachinesData(manifest);
    const machine = machineData.machines.find(({ id: id2 }) => id2 === machineId);
    if (machine) {
      machine.name = name;
      await this.writeMachinesData(machineData);
      const currentMachineId = await this.currentMachineIdPromise;
      if (machineId === currentMachineId) {
        this.storageService.store(currentMachineNameKey, name, -1 /* APPLICATION */, 1 /* MACHINE */);
      }
    }
  }
  async setEnablements(enablements) {
    const machineData = await this.readMachinesData();
    for (const [machineId, enabled] of enablements) {
      const machine = machineData.machines.find((machine2) => machine2.id === machineId);
      if (machine) {
        machine.disabled = enabled ? void 0 : true;
      }
    }
    await this.writeMachinesData(machineData);
  }
  computeCurrentMachineName(machines) {
    const previousName = this.storageService.get(currentMachineNameKey, -1 /* APPLICATION */);
    if (previousName) {
      if (!machines.some((machine) => machine.name === previousName)) {
        return previousName;
      }
      this.storageService.remove(currentMachineNameKey, -1 /* APPLICATION */);
    }
    const namePrefix = `${this.productService.embedderIdentifier ? `${this.productService.embedderIdentifier} - ` : ""}${getPlatformName()} (${this.productService.nameShort})`;
    const nameRegEx = new RegExp(`${escapeRegExpCharacters(namePrefix)}\\s#(\\d+)`);
    let nameIndex = 0;
    for (const machine of machines) {
      const matches2 = nameRegEx.exec(machine.name);
      const index2 = matches2 ? parseInt(matches2[1]) : 0;
      nameIndex = index2 > nameIndex ? index2 : nameIndex;
    }
    return `${namePrefix} #${nameIndex + 1}`;
  }
  async readMachinesData(manifest) {
    this.userData = await this.readUserData(manifest);
    const machinesData = this.parse(this.userData);
    if (machinesData.version !== UserDataSyncMachinesService.VERSION) {
      throw new Error(localize(3694, null, this.productService.nameLong));
    }
    return machinesData;
  }
  async writeMachinesData(machinesData) {
    const content = JSON.stringify(machinesData);
    const ref = await this.userDataSyncStoreService.writeResource(UserDataSyncMachinesService.RESOURCE, content, this.userData?.ref || null);
    this.userData = { ref, content };
    this._onDidChange.fire();
  }
  async readUserData(manifest) {
    if (this.userData) {
      const latestRef = manifest && manifest.latest ? manifest.latest[UserDataSyncMachinesService.RESOURCE] : void 0;
      if (this.userData.ref === latestRef) {
        return this.userData;
      }
      if (latestRef === void 0 && this.userData.content === null) {
        return this.userData;
      }
    }
    return this.userDataSyncStoreService.readResource(UserDataSyncMachinesService.RESOURCE, this.userData);
  }
  parse(userData) {
    if (userData.content !== null) {
      try {
        return JSON.parse(userData.content);
      } catch (e4) {
        this.logService.error(e4);
      }
    }
    return {
      version: UserDataSyncMachinesService.VERSION,
      machines: []
    };
  }
};

UserDataSyncMachinesService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IUserDataSyncStoreService),
  __decorateParam(4, IUserDataSyncLogService),
  __decorateParam(5, IProductService)
], UserDataSyncMachinesService);
export { getPlatformName, IUserDataSyncMachinesService, currentMachineNameKey, Safari, Chrome, Edge, Firefox, Android, UserDataSyncMachinesService };
