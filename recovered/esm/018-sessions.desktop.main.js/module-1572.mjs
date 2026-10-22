// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/undoRedo/common/undoRedoService.ts
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { IUndoRedoService, ResourceEditStackSnapshot, UndoRedoGroup, UndoRedoSource } from "./module-0374.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Disposable, isDisposable } from "./module-0012.mjs";
import { severity_default } from "./module-0266.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/undoRedo/common/undoRedoService.ts
var DEBUG2 = false;

function getResourceLabel(resource) {
  return resource.scheme === Schemas.file ? resource.fsPath : resource.path;
}

var stackElementCounter = 0;

var ResourceStackElement = class {
  constructor(actual, resourceLabel, strResource, groupId, groupOrder, sourceId, sourceOrder) {
    this.id = ++stackElementCounter;
    this.type = 0 /* Resource */;
    this.actual = actual;
    this.label = actual.label;
    this.confirmBeforeUndo = actual.confirmBeforeUndo || false;
    this.resourceLabel = resourceLabel;
    this.strResource = strResource;
    this.resourceLabels = [this.resourceLabel];
    this.strResources = [this.strResource];
    this.groupId = groupId;
    this.groupOrder = groupOrder;
    this.sourceId = sourceId;
    this.sourceOrder = sourceOrder;
    this.isValid = true;
  }
  setValid(isValid2) {
    this.isValid = isValid2;
  }
  toString() {
    return `[id:${this.id}] [group:${this.groupId}] [${this.isValid ? "  VALID" : "INVALID"}] ${this.actual.constructor.name} - ${this.actual}`;
  }
};

var ResourceReasonPair = class {
  constructor(resourceLabel, reason) {
    this.resourceLabel = resourceLabel;
    this.reason = reason;
  }
};

var RemovedResources = class {
  constructor() {
    this.elements = /* @__PURE__ */ new Map();
  }
  createMessage() {
    const externalRemoval = [];
    const noParallelUniverses = [];
    for (const [, element] of this.elements) {
      const dest = element.reason === 0 /* ExternalRemoval */ ? externalRemoval : noParallelUniverses;
      dest.push(element.resourceLabel);
    }
    const messages = [];
    if (externalRemoval.length > 0) {
      messages.push(
        localize(
          3661,
          null,
          externalRemoval.join(", ")
        )
      );
    }
    if (noParallelUniverses.length > 0) {
      messages.push(
        localize(
          3663,
          null,
          noParallelUniverses.join(", ")
        )
      );
    }
    return messages.join("\n");
  }
  get size() {
    return this.elements.size;
  }
  has(strResource) {
    return this.elements.has(strResource);
  }
  set(strResource, value2) {
    this.elements.set(strResource, value2);
  }
  delete(strResource) {
    return this.elements.delete(strResource);
  }
};

var WorkspaceStackElement = class {
  constructor(actual, resourceLabels, strResources, groupId, groupOrder, sourceId, sourceOrder) {
    this.id = ++stackElementCounter;
    this.type = 1 /* Workspace */;
    this.actual = actual;
    this.label = actual.label;
    this.confirmBeforeUndo = actual.confirmBeforeUndo || false;
    this.resourceLabels = resourceLabels;
    this.strResources = strResources;
    this.groupId = groupId;
    this.groupOrder = groupOrder;
    this.sourceId = sourceId;
    this.sourceOrder = sourceOrder;
    this.removedResources = null;
    this.invalidatedResources = null;
  }
  canSplit() {
    return typeof this.actual.split === "function";
  }
  removeResource(resourceLabel, strResource, reason) {
    if (!this.removedResources) {
      this.removedResources = new RemovedResources();
    }
    if (!this.removedResources.has(strResource)) {
      this.removedResources.set(strResource, new ResourceReasonPair(resourceLabel, reason));
    }
  }
  setValid(resourceLabel, strResource, isValid2) {
    if (isValid2) {
      if (this.invalidatedResources) {
        this.invalidatedResources.delete(strResource);
        if (this.invalidatedResources.size === 0) {
          this.invalidatedResources = null;
        }
      }
    } else {
      if (!this.invalidatedResources) {
        this.invalidatedResources = new RemovedResources();
      }
      if (!this.invalidatedResources.has(strResource)) {
        this.invalidatedResources.set(strResource, new ResourceReasonPair(resourceLabel, 0 /* ExternalRemoval */));
      }
    }
  }
  toString() {
    return `[id:${this.id}] [group:${this.groupId}] [${this.invalidatedResources ? "INVALID" : "  VALID"}] ${this.actual.constructor.name} - ${this.actual}`;
  }
};

var ResourceEditStack = class {
  constructor(resourceLabel, strResource) {
    this.resourceLabel = resourceLabel;
    this.strResource = strResource;
    this._past = [];
    this._future = [];
    this.locked = false;
    this.versionId = 1;
  }
  dispose() {
    for (const element of this._past) {
      if (element.type === 1 /* Workspace */) {
        element.removeResource(this.resourceLabel, this.strResource, 0 /* ExternalRemoval */);
      }
    }
    for (const element of this._future) {
      if (element.type === 1 /* Workspace */) {
        element.removeResource(this.resourceLabel, this.strResource, 0 /* ExternalRemoval */);
      }
    }
    this.versionId++;
  }
  toString() {
    const result = [];
    result.push(`* ${this.strResource}:`);
    for (let i2 = 0; i2 < this._past.length; i2++) {
      result.push(`   * [UNDO] ${this._past[i2]}`);
    }
    for (let i2 = this._future.length - 1; i2 >= 0; i2--) {
      result.push(`   * [REDO] ${this._future[i2]}`);
    }
    return result.join("\n");
  }
  flushAllElements() {
    this._past = [];
    this._future = [];
    this.versionId++;
  }
  setElementsIsValid(isValid2) {
    for (const element of this._past) {
      if (element.type === 1 /* Workspace */) {
        element.setValid(this.resourceLabel, this.strResource, isValid2);
      } else {
        element.setValid(isValid2);
      }
    }
    for (const element of this._future) {
      if (element.type === 1 /* Workspace */) {
        element.setValid(this.resourceLabel, this.strResource, isValid2);
      } else {
        element.setValid(isValid2);
      }
    }
  }
  _setElementValidFlag(element, isValid2) {
    if (element.type === 1 /* Workspace */) {
      element.setValid(this.resourceLabel, this.strResource, isValid2);
    } else {
      element.setValid(isValid2);
    }
  }
  setElementsValidFlag(isValid2, filter2) {
    for (const element of this._past) {
      if (filter2(element.actual)) {
        this._setElementValidFlag(element, isValid2);
      }
    }
    for (const element of this._future) {
      if (filter2(element.actual)) {
        this._setElementValidFlag(element, isValid2);
      }
    }
  }
  pushElement(element) {
    for (const futureElement of this._future) {
      if (futureElement.type === 1 /* Workspace */) {
        futureElement.removeResource(this.resourceLabel, this.strResource, 1 /* NoParallelUniverses */);
      }
    }
    this._future = [];
    this._past.push(element);
    this.versionId++;
  }
  createSnapshot(resource) {
    const elements = [];
    for (let i2 = 0, len = this._past.length; i2 < len; i2++) {
      elements.push(this._past[i2].id);
    }
    for (let i2 = this._future.length - 1; i2 >= 0; i2--) {
      elements.push(this._future[i2].id);
    }
    return new ResourceEditStackSnapshot(resource, elements);
  }
  restoreSnapshot(snapshot) {
    const snapshotLength = snapshot.elements.length;
    let isOK = true;
    let snapshotIndex = 0;
    let removePastAfter = -1;
    for (let i2 = 0, len = this._past.length; i2 < len; i2++, snapshotIndex++) {
      const element = this._past[i2];
      if (isOK && (snapshotIndex >= snapshotLength || element.id !== snapshot.elements[snapshotIndex])) {
        isOK = false;
        removePastAfter = i2;
      }
      if (!isOK && element.type === 1 /* Workspace */) {
        element.removeResource(this.resourceLabel, this.strResource, 0 /* ExternalRemoval */);
      }
    }
    let removeFutureBefore = -1;
    for (let i2 = this._future.length - 1; i2 >= 0; i2--, snapshotIndex++) {
      const element = this._future[i2];
      if (isOK && (snapshotIndex >= snapshotLength || element.id !== snapshot.elements[snapshotIndex])) {
        isOK = false;
        removeFutureBefore = i2;
      }
      if (!isOK && element.type === 1 /* Workspace */) {
        element.removeResource(this.resourceLabel, this.strResource, 0 /* ExternalRemoval */);
      }
    }
    if (removePastAfter !== -1) {
      this._past = this._past.slice(0, removePastAfter);
    }
    if (removeFutureBefore !== -1) {
      this._future = this._future.slice(removeFutureBefore + 1);
    }
    this.versionId++;
  }
  getElements() {
    const past = [];
    const future = [];
    for (const element of this._past) {
      past.push(element.actual);
    }
    for (const element of this._future) {
      future.push(element.actual);
    }
    return { past, future };
  }
  getClosestPastElement() {
    if (this._past.length === 0) {
      return null;
    }
    return this._past[this._past.length - 1];
  }
  getSecondClosestPastElement() {
    if (this._past.length < 2) {
      return null;
    }
    return this._past[this._past.length - 2];
  }
  getClosestFutureElement() {
    if (this._future.length === 0) {
      return null;
    }
    return this._future[this._future.length - 1];
  }
  hasPastElements() {
    return this._past.length > 0;
  }
  hasFutureElements() {
    return this._future.length > 0;
  }
  splitPastWorkspaceElement(toRemove, individualMap) {
    for (let j = this._past.length - 1; j >= 0; j--) {
      if (this._past[j] === toRemove) {
        if (individualMap.has(this.strResource)) {
          this._past[j] = individualMap.get(this.strResource);
        } else {
          this._past.splice(j, 1);
        }
        break;
      }
    }
    this.versionId++;
  }
  splitFutureWorkspaceElement(toRemove, individualMap) {
    for (let j = this._future.length - 1; j >= 0; j--) {
      if (this._future[j] === toRemove) {
        if (individualMap.has(this.strResource)) {
          this._future[j] = individualMap.get(this.strResource);
        } else {
          this._future.splice(j, 1);
        }
        break;
      }
    }
    this.versionId++;
  }
  moveBackward(element) {
    this._past.pop();
    this._future.push(element);
    this.versionId++;
  }
  moveForward(element) {
    this._future.pop();
    this._past.push(element);
    this.versionId++;
  }
};

var EditStackSnapshot = class {
  constructor(editStacks) {
    this.editStacks = editStacks;
    this._versionIds = [];
    for (let i2 = 0, len = this.editStacks.length; i2 < len; i2++) {
      this._versionIds[i2] = this.editStacks[i2].versionId;
    }
  }
  isValid() {
    for (let i2 = 0, len = this.editStacks.length; i2 < len; i2++) {
      if (this._versionIds[i2] !== this.editStacks[i2].versionId) {
        return false;
      }
    }
    return true;
  }
};

var missingEditStack = new ResourceEditStack("", "");

missingEditStack.locked = true;

var UndoRedoService = class {
  constructor(_dialogService, _notificationService) {
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._editStacks = /* @__PURE__ */ new Map();
    this._uriComparisonKeyComputers = [];
  }
  registerUriComparisonKeyComputer(scheme, uriComparisonKeyComputer) {
    this._uriComparisonKeyComputers.push([scheme, uriComparisonKeyComputer]);
    return {
      dispose: () => {
        for (let i2 = 0, len = this._uriComparisonKeyComputers.length; i2 < len; i2++) {
          if (this._uriComparisonKeyComputers[i2][1] === uriComparisonKeyComputer) {
            this._uriComparisonKeyComputers.splice(i2, 1);
            return;
          }
        }
      }
    };
  }
  getUriComparisonKey(resource) {
    for (const uriComparisonKeyComputer of this._uriComparisonKeyComputers) {
      if (uriComparisonKeyComputer[0] === resource.scheme) {
        return uriComparisonKeyComputer[1].getComparisonKey(resource);
      }
    }
    return resource.toString();
  }
  _print(label3) {
    console.log(`------------------------------------`);
    console.log(`AFTER ${label3}: `);
    const str = [];
    for (const element of this._editStacks) {
      str.push(element[1].toString());
    }
    console.log(str.join("\n"));
  }
  pushElement(element, group2 = UndoRedoGroup.None, source = UndoRedoSource.None) {
    if (element.type === 0 /* Resource */) {
      const resourceLabel = getResourceLabel(element.resource);
      const strResource = this.getUriComparisonKey(element.resource);
      this._pushElement(new ResourceStackElement(element, resourceLabel, strResource, group2.id, group2.nextOrder(), source.id, source.nextOrder()));
    } else {
      const seen = /* @__PURE__ */ new Set();
      const resourceLabels = [];
      const strResources = [];
      for (const resource of element.resources) {
        const resourceLabel = getResourceLabel(resource);
        const strResource = this.getUriComparisonKey(resource);
        if (seen.has(strResource)) {
          continue;
        }
        seen.add(strResource);
        resourceLabels.push(resourceLabel);
        strResources.push(strResource);
      }
      if (resourceLabels.length === 1) {
        this._pushElement(new ResourceStackElement(element, resourceLabels[0], strResources[0], group2.id, group2.nextOrder(), source.id, source.nextOrder()));
      } else {
        this._pushElement(new WorkspaceStackElement(element, resourceLabels, strResources, group2.id, group2.nextOrder(), source.id, source.nextOrder()));
      }
    }
    if (DEBUG2) {
      this._print("pushElement");
    }
  }
  _pushElement(element) {
    for (let i2 = 0, len = element.strResources.length; i2 < len; i2++) {
      const resourceLabel = element.resourceLabels[i2];
      const strResource = element.strResources[i2];
      let editStack;
      if (this._editStacks.has(strResource)) {
        editStack = this._editStacks.get(strResource);
      } else {
        editStack = new ResourceEditStack(resourceLabel, strResource);
        this._editStacks.set(strResource, editStack);
      }
      editStack.pushElement(element);
    }
  }
  getLastElement(resource) {
    const strResource = this.getUriComparisonKey(resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      if (editStack.hasFutureElements()) {
        return null;
      }
      const closestPastElement = editStack.getClosestPastElement();
      return closestPastElement ? closestPastElement.actual : null;
    }
    return null;
  }
  _splitPastWorkspaceElement(toRemove, ignoreResources) {
    const individualArr = toRemove.actual.split();
    const individualMap = /* @__PURE__ */ new Map();
    for (const _element of individualArr) {
      const resourceLabel = getResourceLabel(_element.resource);
      const strResource = this.getUriComparisonKey(_element.resource);
      const element = new ResourceStackElement(_element, resourceLabel, strResource, 0, 0, 0, 0);
      individualMap.set(element.strResource, element);
    }
    for (const strResource of toRemove.strResources) {
      if (ignoreResources && ignoreResources.has(strResource)) {
        continue;
      }
      const editStack = this._editStacks.get(strResource);
      editStack.splitPastWorkspaceElement(toRemove, individualMap);
    }
  }
  _splitFutureWorkspaceElement(toRemove, ignoreResources) {
    const individualArr = toRemove.actual.split();
    const individualMap = /* @__PURE__ */ new Map();
    for (const _element of individualArr) {
      const resourceLabel = getResourceLabel(_element.resource);
      const strResource = this.getUriComparisonKey(_element.resource);
      const element = new ResourceStackElement(_element, resourceLabel, strResource, 0, 0, 0, 0);
      individualMap.set(element.strResource, element);
    }
    for (const strResource of toRemove.strResources) {
      if (ignoreResources && ignoreResources.has(strResource)) {
        continue;
      }
      const editStack = this._editStacks.get(strResource);
      editStack.splitFutureWorkspaceElement(toRemove, individualMap);
    }
  }
  removeElements(resource) {
    const strResource = typeof resource === "string" ? resource : this.getUriComparisonKey(resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      editStack.dispose();
      this._editStacks.delete(strResource);
    }
    if (DEBUG2) {
      this._print("removeElements");
    }
  }
  setElementsValidFlag(resource, isValid2, filter2) {
    const strResource = this.getUriComparisonKey(resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      editStack.setElementsValidFlag(isValid2, filter2);
    }
    if (DEBUG2) {
      this._print("setElementsValidFlag");
    }
  }
  hasElements(resource) {
    const strResource = this.getUriComparisonKey(resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      return editStack.hasPastElements() || editStack.hasFutureElements();
    }
    return false;
  }
  createSnapshot(resource) {
    const strResource = this.getUriComparisonKey(resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      return editStack.createSnapshot(resource);
    }
    return new ResourceEditStackSnapshot(resource, []);
  }
  restoreSnapshot(snapshot) {
    const strResource = this.getUriComparisonKey(snapshot.resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      editStack.restoreSnapshot(snapshot);
      if (!editStack.hasPastElements() && !editStack.hasFutureElements()) {
        editStack.dispose();
        this._editStacks.delete(strResource);
      }
    }
    if (DEBUG2) {
      this._print("restoreSnapshot");
    }
  }
  getElements(resource) {
    const strResource = this.getUriComparisonKey(resource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      return editStack.getElements();
    }
    return { past: [], future: [] };
  }
  _findClosestUndoElementWithSource(sourceId) {
    if (!sourceId) {
      return [null, null];
    }
    let matchedElement = null;
    let matchedStrResource = null;
    for (const [strResource, editStack] of this._editStacks) {
      const candidate = editStack.getClosestPastElement();
      if (!candidate) {
        continue;
      }
      if (candidate.sourceId === sourceId) {
        if (!matchedElement || candidate.sourceOrder > matchedElement.sourceOrder) {
          matchedElement = candidate;
          matchedStrResource = strResource;
        }
      }
    }
    return [matchedElement, matchedStrResource];
  }
  canUndo(resourceOrSource) {
    if (resourceOrSource instanceof UndoRedoSource) {
      const [, matchedStrResource] = this._findClosestUndoElementWithSource(resourceOrSource.id);
      return matchedStrResource ? true : false;
    }
    const strResource = this.getUriComparisonKey(resourceOrSource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      return editStack.hasPastElements();
    }
    return false;
  }
  _onError(err, element) {
    onUnexpectedError(err);
    for (const strResource of element.strResources) {
      this.removeElements(strResource);
    }
    this._notificationService.error(err);
  }
  _acquireLocks(editStackSnapshot) {
    for (const editStack of editStackSnapshot.editStacks) {
      if (editStack.locked) {
        throw new Error("Cannot acquire edit stack lock");
      }
    }
    for (const editStack of editStackSnapshot.editStacks) {
      editStack.locked = true;
    }
    return () => {
      for (const editStack of editStackSnapshot.editStacks) {
        editStack.locked = false;
      }
    };
  }
  _safeInvokeWithLocks(element, invoke, editStackSnapshot, cleanup, continuation) {
    const releaseLocks = this._acquireLocks(editStackSnapshot);
    let result;
    try {
      result = invoke();
    } catch (err) {
      releaseLocks();
      cleanup.dispose();
      return this._onError(err, element);
    }
    if (result) {
      return result.then(
        () => {
          releaseLocks();
          cleanup.dispose();
          return continuation();
        },
        (err) => {
          releaseLocks();
          cleanup.dispose();
          return this._onError(err, element);
        }
      );
    } else {
      releaseLocks();
      cleanup.dispose();
      return continuation();
    }
  }
  async _invokeWorkspacePrepare(element) {
    if (typeof element.actual.prepareUndoRedo === "undefined") {
      return Disposable.None;
    }
    const result = element.actual.prepareUndoRedo();
    if (typeof result === "undefined") {
      return Disposable.None;
    }
    return result;
  }
  _invokeResourcePrepare(element, callback) {
    if (element.actual.type !== 1 /* Workspace */ || typeof element.actual.prepareUndoRedo === "undefined") {
      return callback(Disposable.None);
    }
    const r2 = element.actual.prepareUndoRedo();
    if (!r2) {
      return callback(Disposable.None);
    }
    if (isDisposable(r2)) {
      return callback(r2);
    }
    return r2.then((disposable) => {
      return callback(disposable);
    });
  }
  _getAffectedEditStacks(element) {
    const affectedEditStacks = [];
    for (const strResource of element.strResources) {
      affectedEditStacks.push(this._editStacks.get(strResource) || missingEditStack);
    }
    return new EditStackSnapshot(affectedEditStacks);
  }
  _tryToSplitAndUndo(strResource, element, ignoreResources, message) {
    if (element.canSplit()) {
      this._splitPastWorkspaceElement(element, ignoreResources);
      this._notificationService.warn(message);
      return new WorkspaceVerificationError(this._undo(strResource, 0, true));
    } else {
      for (const strResource2 of element.strResources) {
        this.removeElements(strResource2);
      }
      this._notificationService.warn(message);
      return new WorkspaceVerificationError();
    }
  }
  _checkWorkspaceUndo(strResource, element, editStackSnapshot, checkInvalidatedResources) {
    if (element.removedResources) {
      return this._tryToSplitAndUndo(
        strResource,
        element,
        element.removedResources,
        localize(
          3653,
          null,
          element.label,
          element.removedResources.createMessage()
        )
      );
    }
    if (checkInvalidatedResources && element.invalidatedResources) {
      return this._tryToSplitAndUndo(
        strResource,
        element,
        element.invalidatedResources,
        localize(
          3653,
          null,
          element.label,
          element.invalidatedResources.createMessage()
        )
      );
    }
    const cannotUndoDueToResources = [];
    for (const editStack of editStackSnapshot.editStacks) {
      if (editStack.getClosestPastElement() !== element) {
        cannotUndoDueToResources.push(editStack.resourceLabel);
      }
    }
    if (cannotUndoDueToResources.length > 0) {
      return this._tryToSplitAndUndo(
        strResource,
        element,
        null,
        localize(
          3654,
          null,
          element.label,
          cannotUndoDueToResources.join(", ")
        )
      );
    }
    const cannotLockDueToResources = [];
    for (const editStack of editStackSnapshot.editStacks) {
      if (editStack.locked) {
        cannotLockDueToResources.push(editStack.resourceLabel);
      }
    }
    if (cannotLockDueToResources.length > 0) {
      return this._tryToSplitAndUndo(
        strResource,
        element,
        null,
        localize(
          3656,
          null,
          element.label,
          cannotLockDueToResources.join(", ")
        )
      );
    }
    if (!editStackSnapshot.isValid()) {
      return this._tryToSplitAndUndo(
        strResource,
        element,
        null,
        localize(
          3655,
          null,
          element.label
        )
      );
    }
    return null;
  }
  _workspaceUndo(strResource, element, undoConfirmed) {
    const affectedEditStacks = this._getAffectedEditStacks(element);
    const verificationError = this._checkWorkspaceUndo(
      strResource,
      element,
      affectedEditStacks,
      /*invalidated resources will be checked after the prepare call*/
      false
    );
    if (verificationError) {
      return verificationError.returnValue;
    }
    return this._confirmAndExecuteWorkspaceUndo(strResource, element, affectedEditStacks, undoConfirmed);
  }
  _isPartOfUndoGroup(element) {
    if (!element.groupId) {
      return false;
    }
    for (const [, editStack] of this._editStacks) {
      const pastElement = editStack.getClosestPastElement();
      if (!pastElement) {
        continue;
      }
      if (pastElement === element) {
        const secondPastElement = editStack.getSecondClosestPastElement();
        if (secondPastElement && secondPastElement.groupId === element.groupId) {
          return true;
        }
      }
      if (pastElement.groupId === element.groupId) {
        return true;
      }
    }
    return false;
  }
  async _confirmAndExecuteWorkspaceUndo(strResource, element, editStackSnapshot, undoConfirmed) {
    if (element.canSplit() && !this._isPartOfUndoGroup(element)) {
      let UndoChoice;
      ((UndoChoice2) => {
        UndoChoice2[UndoChoice2["All"] = 0] = "All";
        UndoChoice2[UndoChoice2["This"] = 1] = "This";
        UndoChoice2[UndoChoice2["Cancel"] = 2] = "Cancel";
      })(UndoChoice || (UndoChoice = {}));
      const { result } = await this._dialogService.prompt({
        type: severity_default.Info,
        message: localize(3660, null, element.label),
        buttons: [
          {
            label: localize(3664, null, editStackSnapshot.editStacks.length),
            run: () => 0 /* All */
          },
          {
            label: localize(3662, null),
            run: () => 1 /* This */
          }
        ],
        cancelButton: {
          run: () => 2 /* Cancel */
        }
      });
      if (result === 2 /* Cancel */) {
        return;
      }
      if (result === 1 /* This */) {
        this._splitPastWorkspaceElement(element, null);
        return this._undo(strResource, 0, true);
      }
      const verificationError1 = this._checkWorkspaceUndo(
        strResource,
        element,
        editStackSnapshot,
        /*invalidated resources will be checked after the prepare call*/
        false
      );
      if (verificationError1) {
        return verificationError1.returnValue;
      }
      undoConfirmed = true;
    }
    let cleanup;
    try {
      cleanup = await this._invokeWorkspacePrepare(element);
    } catch (err) {
      return this._onError(err, element);
    }
    const verificationError2 = this._checkWorkspaceUndo(
      strResource,
      element,
      editStackSnapshot,
      /*now also check that there are no more invalidated resources*/
      true
    );
    if (verificationError2) {
      cleanup.dispose();
      return verificationError2.returnValue;
    }
    for (const editStack of editStackSnapshot.editStacks) {
      editStack.moveBackward(element);
    }
    return this._safeInvokeWithLocks(element, () => element.actual.undo(), editStackSnapshot, cleanup, () => this._continueUndoInGroup(element.groupId, undoConfirmed));
  }
  _resourceUndo(editStack, element, undoConfirmed) {
    if (!element.isValid) {
      editStack.flushAllElements();
      return;
    }
    if (editStack.locked) {
      const message = localize(
        3648,
        null,
        element.label
      );
      this._notificationService.warn(message);
      return;
    }
    return this._invokeResourcePrepare(element, (cleanup) => {
      editStack.moveBackward(element);
      return this._safeInvokeWithLocks(element, () => element.actual.undo(), new EditStackSnapshot([editStack]), cleanup, () => this._continueUndoInGroup(element.groupId, undoConfirmed));
    });
  }
  _findClosestUndoElementInGroup(groupId) {
    if (!groupId) {
      return [null, null];
    }
    let matchedElement = null;
    let matchedStrResource = null;
    for (const [strResource, editStack] of this._editStacks) {
      const candidate = editStack.getClosestPastElement();
      if (!candidate) {
        continue;
      }
      if (candidate.groupId === groupId) {
        if (!matchedElement || candidate.groupOrder > matchedElement.groupOrder) {
          matchedElement = candidate;
          matchedStrResource = strResource;
        }
      }
    }
    return [matchedElement, matchedStrResource];
  }
  _continueUndoInGroup(groupId, undoConfirmed) {
    if (!groupId) {
      return;
    }
    const [, matchedStrResource] = this._findClosestUndoElementInGroup(groupId);
    if (matchedStrResource) {
      return this._undo(matchedStrResource, 0, undoConfirmed);
    }
  }
  undo(resourceOrSource) {
    if (resourceOrSource instanceof UndoRedoSource) {
      const [, matchedStrResource] = this._findClosestUndoElementWithSource(resourceOrSource.id);
      return matchedStrResource ? this._undo(matchedStrResource, resourceOrSource.id, false) : void 0;
    }
    if (typeof resourceOrSource === "string") {
      return this._undo(resourceOrSource, 0, false);
    }
    return this._undo(this.getUriComparisonKey(resourceOrSource), 0, false);
  }
  _undo(strResource, sourceId = 0, undoConfirmed) {
    if (!this._editStacks.has(strResource)) {
      return;
    }
    const editStack = this._editStacks.get(strResource);
    const element = editStack.getClosestPastElement();
    if (!element) {
      return;
    }
    if (element.groupId) {
      const [matchedElement, matchedStrResource] = this._findClosestUndoElementInGroup(element.groupId);
      if (element !== matchedElement && matchedStrResource) {
        return this._undo(matchedStrResource, sourceId, undoConfirmed);
      }
    }
    const shouldPromptForConfirmation = element.sourceId !== sourceId || element.confirmBeforeUndo;
    if (shouldPromptForConfirmation && !undoConfirmed) {
      return this._confirmAndContinueUndo(strResource, sourceId, element);
    }
    try {
      if (element.type === 1 /* Workspace */) {
        return this._workspaceUndo(strResource, element, undoConfirmed);
      } else {
        return this._resourceUndo(editStack, element, undoConfirmed);
      }
    } finally {
      if (DEBUG2) {
        this._print("undo");
      }
    }
  }
  async _confirmAndContinueUndo(strResource, sourceId, element) {
    const result = await this._dialogService.confirm({
      message: localize(3657, null, element.label),
      primaryButton: localize(3659, null),
      cancelButton: localize(3658, null)
    });
    if (!result.confirmed) {
      return;
    }
    return this._undo(strResource, sourceId, true);
  }
  _findClosestRedoElementWithSource(sourceId) {
    if (!sourceId) {
      return [null, null];
    }
    let matchedElement = null;
    let matchedStrResource = null;
    for (const [strResource, editStack] of this._editStacks) {
      const candidate = editStack.getClosestFutureElement();
      if (!candidate) {
        continue;
      }
      if (candidate.sourceId === sourceId) {
        if (!matchedElement || candidate.sourceOrder < matchedElement.sourceOrder) {
          matchedElement = candidate;
          matchedStrResource = strResource;
        }
      }
    }
    return [matchedElement, matchedStrResource];
  }
  canRedo(resourceOrSource) {
    if (resourceOrSource instanceof UndoRedoSource) {
      const [, matchedStrResource] = this._findClosestRedoElementWithSource(resourceOrSource.id);
      return matchedStrResource ? true : false;
    }
    const strResource = this.getUriComparisonKey(resourceOrSource);
    if (this._editStacks.has(strResource)) {
      const editStack = this._editStacks.get(strResource);
      return editStack.hasFutureElements();
    }
    return false;
  }
  _tryToSplitAndRedo(strResource, element, ignoreResources, message) {
    if (element.canSplit()) {
      this._splitFutureWorkspaceElement(element, ignoreResources);
      this._notificationService.warn(message);
      return new WorkspaceVerificationError(this._redo(strResource));
    } else {
      for (const strResource2 of element.strResources) {
        this.removeElements(strResource2);
      }
      this._notificationService.warn(message);
      return new WorkspaceVerificationError();
    }
  }
  _checkWorkspaceRedo(strResource, element, editStackSnapshot, checkInvalidatedResources) {
    if (element.removedResources) {
      return this._tryToSplitAndRedo(
        strResource,
        element,
        element.removedResources,
        localize(
          3649,
          null,
          element.label,
          element.removedResources.createMessage()
        )
      );
    }
    if (checkInvalidatedResources && element.invalidatedResources) {
      return this._tryToSplitAndRedo(
        strResource,
        element,
        element.invalidatedResources,
        localize(
          3649,
          null,
          element.label,
          element.invalidatedResources.createMessage()
        )
      );
    }
    const cannotRedoDueToResources = [];
    for (const editStack of editStackSnapshot.editStacks) {
      if (editStack.getClosestFutureElement() !== element) {
        cannotRedoDueToResources.push(editStack.resourceLabel);
      }
    }
    if (cannotRedoDueToResources.length > 0) {
      return this._tryToSplitAndRedo(
        strResource,
        element,
        null,
        localize(
          3650,
          null,
          element.label,
          cannotRedoDueToResources.join(", ")
        )
      );
    }
    const cannotLockDueToResources = [];
    for (const editStack of editStackSnapshot.editStacks) {
      if (editStack.locked) {
        cannotLockDueToResources.push(editStack.resourceLabel);
      }
    }
    if (cannotLockDueToResources.length > 0) {
      return this._tryToSplitAndRedo(
        strResource,
        element,
        null,
        localize(
          3652,
          null,
          element.label,
          cannotLockDueToResources.join(", ")
        )
      );
    }
    if (!editStackSnapshot.isValid()) {
      return this._tryToSplitAndRedo(
        strResource,
        element,
        null,
        localize(
          3651,
          null,
          element.label
        )
      );
    }
    return null;
  }
  _workspaceRedo(strResource, element) {
    const affectedEditStacks = this._getAffectedEditStacks(element);
    const verificationError = this._checkWorkspaceRedo(
      strResource,
      element,
      affectedEditStacks,
      /*invalidated resources will be checked after the prepare call*/
      false
    );
    if (verificationError) {
      return verificationError.returnValue;
    }
    return this._executeWorkspaceRedo(strResource, element, affectedEditStacks);
  }
  async _executeWorkspaceRedo(strResource, element, editStackSnapshot) {
    let cleanup;
    try {
      cleanup = await this._invokeWorkspacePrepare(element);
    } catch (err) {
      return this._onError(err, element);
    }
    const verificationError = this._checkWorkspaceRedo(
      strResource,
      element,
      editStackSnapshot,
      /*now also check that there are no more invalidated resources*/
      true
    );
    if (verificationError) {
      cleanup.dispose();
      return verificationError.returnValue;
    }
    for (const editStack of editStackSnapshot.editStacks) {
      editStack.moveForward(element);
    }
    return this._safeInvokeWithLocks(element, () => element.actual.redo(), editStackSnapshot, cleanup, () => this._continueRedoInGroup(element.groupId));
  }
  _resourceRedo(editStack, element) {
    if (!element.isValid) {
      editStack.flushAllElements();
      return;
    }
    if (editStack.locked) {
      const message = localize(
        3647,
        null,
        element.label
      );
      this._notificationService.warn(message);
      return;
    }
    return this._invokeResourcePrepare(element, (cleanup) => {
      editStack.moveForward(element);
      return this._safeInvokeWithLocks(element, () => element.actual.redo(), new EditStackSnapshot([editStack]), cleanup, () => this._continueRedoInGroup(element.groupId));
    });
  }
  _findClosestRedoElementInGroup(groupId) {
    if (!groupId) {
      return [null, null];
    }
    let matchedElement = null;
    let matchedStrResource = null;
    for (const [strResource, editStack] of this._editStacks) {
      const candidate = editStack.getClosestFutureElement();
      if (!candidate) {
        continue;
      }
      if (candidate.groupId === groupId) {
        if (!matchedElement || candidate.groupOrder < matchedElement.groupOrder) {
          matchedElement = candidate;
          matchedStrResource = strResource;
        }
      }
    }
    return [matchedElement, matchedStrResource];
  }
  _continueRedoInGroup(groupId) {
    if (!groupId) {
      return;
    }
    const [, matchedStrResource] = this._findClosestRedoElementInGroup(groupId);
    if (matchedStrResource) {
      return this._redo(matchedStrResource);
    }
  }
  redo(resourceOrSource) {
    if (resourceOrSource instanceof UndoRedoSource) {
      const [, matchedStrResource] = this._findClosestRedoElementWithSource(resourceOrSource.id);
      return matchedStrResource ? this._redo(matchedStrResource) : void 0;
    }
    if (typeof resourceOrSource === "string") {
      return this._redo(resourceOrSource);
    }
    return this._redo(this.getUriComparisonKey(resourceOrSource));
  }
  _redo(strResource) {
    if (!this._editStacks.has(strResource)) {
      return;
    }
    const editStack = this._editStacks.get(strResource);
    const element = editStack.getClosestFutureElement();
    if (!element) {
      return;
    }
    if (element.groupId) {
      const [matchedElement, matchedStrResource] = this._findClosestRedoElementInGroup(element.groupId);
      if (element !== matchedElement && matchedStrResource) {
        return this._redo(matchedStrResource);
      }
    }
    try {
      if (element.type === 1 /* Workspace */) {
        return this._workspaceRedo(strResource, element);
      } else {
        return this._resourceRedo(editStack, element);
      }
    } finally {
      if (DEBUG2) {
        this._print("redo");
      }
    }
  }
};

UndoRedoService = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, INotificationService)
], UndoRedoService);

var WorkspaceVerificationError = class {
  constructor(returnValue) {
    this.returnValue = returnValue;
  }
};

registerSingleton(IUndoRedoService, UndoRedoService, 1 /* Delayed */);
export { getResourceLabel, DEBUG2, stackElementCounter, ResourceStackElement, ResourceReasonPair, RemovedResources, WorkspaceStackElement, ResourceEditStack, EditStackSnapshot, missingEditStack, UndoRedoService, WorkspaceVerificationError };
