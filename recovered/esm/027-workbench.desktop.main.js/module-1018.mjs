// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/enablement.ts
import { Disposable } from "./module-0012.mjs";
import { observableMemento } from "./module-1017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { transaction } from "./module-0045.mjs";


// src/vs/workbench/contrib/chat/common/enablement.ts
function isContributionEnabled(state) {
  return state === 2 /* EnabledProfile */ || state === 3 /* EnabledWorkspace */;
}

function isContributionDisabled(state) {
  return !isContributionEnabled(state);
}

function mapToStorage(value2) {
  return JSON.stringify([...value2]);
}

function mapFromStorage(value2) {
  const parsed = JSON.parse(value2);
  return new Map(Array.isArray(parsed) ? parsed : []);
}

var EnablementModel = class extends Disposable {
  constructor(storageKey, storageService) {
    super();
    const mapMemento = observableMemento({
      key: storageKey,
      defaultValue: /* @__PURE__ */ new Map(),
      toStorage: mapToStorage,
      fromStorage: mapFromStorage
    });
    this._profileState = this._register(
      mapMemento(0 /* PROFILE */, 1 /* MACHINE */, storageService)
    );
    this._workspaceState = this._register(
      mapMemento(1 /* WORKSPACE */, 1 /* MACHINE */, storageService)
    );
  }
  readEnabled(key3, reader) {
    return this.readEnabledWithWorkspaceKey(key3, key3, reader);
  }
  readProfileEnabled(key3, reader) {
    return this._profileState.read(reader).get(key3) ?? true;
  }
  readEnabledWithWorkspaceKey(profileKey, workspaceKey, reader) {
    const wsMap = this._workspaceState.read(reader);
    if (workspaceKey !== void 0 && wsMap.has(workspaceKey)) {
      return wsMap.get(workspaceKey) ? 3 /* EnabledWorkspace */ : 1 /* DisabledWorkspace */;
    }
    const profileMap = this._profileState.read(reader);
    if (profileMap.has(profileKey)) {
      return profileMap.get(profileKey) ? 2 /* EnabledProfile */ : 0 /* DisabledProfile */;
    }
    return 2 /* EnabledProfile */;
  }
  setEnabled(key3, state, tx) {
    this.setEnabledWithWorkspaceKey(key3, key3, state, tx);
  }
  setEnabledWithWorkspaceKey(profileKey, workspaceKey, state, tx) {
    switch (state) {
      case 2 /* EnabledProfile */: {
        this._deleteFromMap(this._profileState, profileKey, tx);
        if (workspaceKey !== void 0) {
          this._deleteFromMap(this._workspaceState, workspaceKey, tx);
        }
        break;
      }
      case 0 /* DisabledProfile */: {
        this._setInMap(this._profileState, profileKey, false, tx);
        if (workspaceKey !== void 0) {
          this._deleteFromMap(this._workspaceState, workspaceKey, tx);
        }
        break;
      }
      case 3 /* EnabledWorkspace */: {
        if (workspaceKey === void 0) {
          throw new Error("Cannot enable a contribution for a workspace without a workspace key.");
        }
        this._setInMap(this._workspaceState, workspaceKey, true, tx);
        break;
      }
      case 1 /* DisabledWorkspace */: {
        if (workspaceKey === void 0) {
          throw new Error("Cannot disable a contribution for a workspace without a workspace key.");
        }
        this._setInMap(this._workspaceState, workspaceKey, false, tx);
        break;
      }
    }
  }
  remove(key3) {
    this._deleteFromMap(this._profileState, key3);
    this._deleteFromMap(this._workspaceState, key3);
  }
  _setInMap(memento, key3, value2, tx) {
    const current = memento.get();
    if (current.get(key3) === value2) {
      return;
    }
    const next = new Map(current);
    next.set(key3, value2);
    memento.set(next, tx);
  }
  _deleteFromMap(memento, key3, tx) {
    const current = memento.get();
    if (!current.has(key3)) {
      return;
    }
    const next = new Map(current);
    next.delete(key3);
    memento.set(next, tx);
  }
};

EnablementModel = __decorateClass([
  __decorateParam(1, IStorageService)
], EnablementModel);

var CollisionEnablementModel = class {
  constructor(_base, _collisionGroups) {
    this._base = _base;
    this._collisionGroups = _collisionGroups;
  }
  readEnabled(key3, reader) {
    const baseState = this._base.readEnabled(key3, reader);
    if (!isContributionEnabled(baseState)) {
      return baseState;
    }
    const group2 = this._collisionGroups.read(reader).get(key3);
    if (!group2) {
      return baseState;
    }
    for (const otherId of group2) {
      if (otherId === key3) {
        return baseState;
      }
      if (isContributionEnabled(this._base.readEnabled(otherId, reader))) {
        return 0 /* DisabledProfile */;
      }
    }
    return baseState;
  }
  readProfileEnabled(key3, reader) {
    return this._base.readProfileEnabled(key3, reader);
  }
  setEnabled(key3, state, tx) {
    const isEnabling = state === 2 /* EnabledProfile */ || state === 3 /* EnabledWorkspace */;
    const group2 = isEnabling ? this._collisionGroups.get().get(key3) : void 0;
    if (!group2) {
      this._base.setEnabled(key3, state, tx);
      return;
    }
    const updateGroup = (innerTx) => {
      this._base.setEnabled(key3, state, innerTx);
      for (const otherId of group2) {
        if (otherId !== key3) {
          this._base.setEnabled(otherId, 1 /* DisabledWorkspace */, innerTx);
        }
      }
    };
    if (tx) {
      updateGroup(tx);
    } else {
      transaction((innerTx) => updateGroup(innerTx));
    }
  }
  remove(key3) {
    this._base.remove(key3);
  }
};
export { isContributionEnabled, isContributionDisabled, mapToStorage, mapFromStorage, EnablementModel, CollisionEnablementModel };
