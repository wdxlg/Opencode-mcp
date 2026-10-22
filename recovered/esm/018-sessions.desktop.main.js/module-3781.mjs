// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/common/isolationGroupModel.ts
import { observableValue } from "./module-0048.mjs";
import { transaction } from "./module-0045.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/sessions/contrib/automations/common/isolationGroupModel.ts
var GENERATED_WORKTREE_BRANCH_MARKER = "copilot-worktree-";

function isSelectableAutomationBranch(name) {
  return !!name && !name.includes(GENERATED_WORKTREE_BRANCH_MARKER);
}

function normalizeAutomationBranchNames(names) {
  return [...new Set([...names].filter(isSelectableAutomationBranch))].sort((a, b) => a.localeCompare(b));
}

var AutomationIsolationModel = class {
  constructor(_state) {
    this._state = _state;
    this._supportsWorktreeConfiguration = false;
    if (_state.isQuickChat) {
      _state.folderUri = void 0;
      _state.isolationMode = void 0;
      _state.branch = void 0;
    }
    const branch = _state.isolationMode === "worktree" ? _state.branch : void 0;
    this._selectedBranch = isSelectableAutomationBranch(branch) ? branch : void 0;
    this._state.branch = this._selectedBranch;
    this._isQuickChat = observableValue(this, _state.isQuickChat);
    this.isQuickChatObs = this._isQuickChat;
    this._folderUri = observableValue(this, _state.folderUri);
    this.folderUriObs = this._folderUri;
  }
  get isQuickChat() {
    return this._state.isQuickChat;
  }
  get folderUri() {
    return this._state.folderUri;
  }
  get isolationMode() {
    return this._state.isolationMode ?? "workspace";
  }
  get selectedBranch() {
    return this._selectedBranch;
  }
  get headBranch() {
    return this._headBranch;
  }
  get displayBranch() {
    return this.isolationMode === "worktree" ? this._selectedBranch ?? this._headBranch : this._headBranch;
  }
  get persistedBranch() {
    if (!this._state.folderUri || this.isolationMode !== "worktree" || !this._supportsWorktreeConfiguration) {
      return void 0;
    }
    return this._selectedBranch ?? this._headBranch;
  }
  get supportsWorktreeConfiguration() {
    return this._supportsWorktreeConfiguration;
  }
  get branchPickerAvailable() {
    return !!this._state.folderUri && this.isolationMode === "worktree" && this._supportsWorktreeConfiguration;
  }
  setSupportsWorktreeConfiguration(supported3) {
    this._supportsWorktreeConfiguration = supported3;
  }
  selectIsolationMode(mode) {
    if (this._state.isQuickChat || mode === "worktree" && (!this._state.folderUri || !this._supportsWorktreeConfiguration)) {
      return false;
    }
    this._state.isolationMode = mode;
    return true;
  }
  setQuickChat(isQuickChat2, workspaceFolderUri) {
    if (this._state.isQuickChat === isQuickChat2) {
      if (!isQuickChat2) {
        this.setWorkspace(workspaceFolderUri);
      }
      return;
    }
    this._state.isQuickChat = isQuickChat2;
    if (isQuickChat2) {
      this._state.folderUri = void 0;
      this._state.isolationMode = void 0;
      this._headBranch = void 0;
      this._selectedBranch = void 0;
      this._state.branch = void 0;
    } else {
      this._state.isolationMode = "workspace";
      this._state.folderUri = workspaceFolderUri;
    }
    transaction((tx) => {
      this._isQuickChat.set(isQuickChat2, tx);
      this._folderUri.set(this._state.folderUri, tx);
    });
  }
  setWorkspace(folderUri) {
    if (this._state.isQuickChat) {
      return false;
    }
    if (isEqual2(this._state.folderUri, folderUri)) {
      return true;
    }
    this._state.folderUri = folderUri;
    this._headBranch = void 0;
    this._selectedBranch = void 0;
    this._state.branch = void 0;
    if (!folderUri) {
      this._state.isolationMode = "workspace";
    }
    this._folderUri.set(folderUri, void 0);
    return true;
  }
  setHeadBranch(branch) {
    this._headBranch = isSelectableAutomationBranch(branch) ? branch : void 0;
  }
  selectBranch(branch) {
    if (!isSelectableAutomationBranch(branch)) {
      return;
    }
    this._selectedBranch = branch;
    this._state.branch = branch;
  }
};
export { isSelectableAutomationBranch, normalizeAutomationBranchNames, GENERATED_WORKTREE_BRANCH_MARKER, AutomationIsolationModel };
