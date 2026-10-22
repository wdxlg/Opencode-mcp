// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostSCM.ts
import { URI } from "./module-0025.mjs";
import { Schemas } from "./module-0026.mjs";
import { isLinux } from "./module-0014.mjs";
import { ThemeIcon } from "./module-0084.mjs";
import { MarkdownString3, SourceControlInputBoxValidationType2 } from "./module-0245.mjs";
import { comparePaths } from "./module-0344.mjs";
import { equals, sortedDiff } from "./module-0006.mjs";
import { Emitter, Event } from "./module-0017.mjs";
import { checkProposedApiEnabled, isProposedApiEnabled } from "./module-0173.mjs";
import { asPromise } from "./module-0029.mjs";
import { DisposableMap, DisposableStore, MutableDisposable } from "./module-0011.mjs";
import { structuralEquals } from "./module-0105.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0035.mjs";
import { ExtensionIdentifierMap } from "./module-0059.mjs";
import { MainContext } from "./module-0054.mjs";
import { Iterable } from "./module-0010.mjs";
import { ILogService } from "./module-0062.mjs";


// src/vs/workbench/api/common/extHostSCM.ts
function isUri2(thing) {
  return thing instanceof URI;
}

function uriEquals(a, b) {
  if (a.scheme === Schemas.file && b.scheme === Schemas.file && isLinux) {
    return a.toString() === b.toString();
  }
  return a.toString().toLowerCase() === b.toString().toLowerCase();
}

function getIconResource(decorations) {
  if (!decorations) {
    return void 0;
  } else if (typeof decorations.iconPath === "string") {
    return URI.file(decorations.iconPath);
  } else if (URI.isUri(decorations.iconPath)) {
    return decorations.iconPath;
  } else if (ThemeIcon.isThemeIcon(decorations.iconPath)) {
    return decorations.iconPath;
  } else {
    return void 0;
  }
}

function getHistoryItemIconDto(icon) {
  if (!icon) {
    return void 0;
  } else if (URI.isUri(icon)) {
    return icon;
  } else if (ThemeIcon.isThemeIcon(icon)) {
    return icon;
  } else {
    const iconDto = icon;
    return { light: iconDto.light, dark: iconDto.dark };
  }
}

function toSCMHistoryItemDto(historyItem) {
  const authorIcon = getHistoryItemIconDto(historyItem.authorIcon);
  const tooltip = Array.isArray(historyItem.tooltip) ? MarkdownString3.fromMany(historyItem.tooltip) : historyItem.tooltip ? MarkdownString3.from(historyItem.tooltip) : void 0;
  const references = historyItem.references?.map((r2) => ({
    ...r2,
    icon: getHistoryItemIconDto(r2.icon)
  }));
  return { ...historyItem, authorIcon, references, tooltip };
}

function toSCMHistoryItemRefDto(historyItemRef) {
  return historyItemRef ? { ...historyItemRef, icon: getHistoryItemIconDto(historyItemRef.icon) } : void 0;
}

function compareResourceThemableDecorations(a, b) {
  if (!a.iconPath && !b.iconPath) {
    return 0;
  } else if (!a.iconPath) {
    return -1;
  } else if (!b.iconPath) {
    return 1;
  }
  const aPath = typeof a.iconPath === "string" ? a.iconPath : URI.isUri(a.iconPath) ? a.iconPath.fsPath : a.iconPath.id;
  const bPath = typeof b.iconPath === "string" ? b.iconPath : URI.isUri(b.iconPath) ? b.iconPath.fsPath : b.iconPath.id;
  return comparePaths(aPath, bPath);
}

function compareResourceStatesDecorations(a, b) {
  let result = 0;
  if (a.strikeThrough !== b.strikeThrough) {
    return a.strikeThrough ? 1 : -1;
  }
  if (a.faded !== b.faded) {
    return a.faded ? 1 : -1;
  }
  if (a.tooltip !== b.tooltip) {
    return (a.tooltip || "").localeCompare(b.tooltip || "");
  }
  result = compareResourceThemableDecorations(a, b);
  if (result !== 0) {
    return result;
  }
  if (a.light && b.light) {
    result = compareResourceThemableDecorations(a.light, b.light);
  } else if (a.light) {
    return 1;
  } else if (b.light) {
    return -1;
  }
  if (result !== 0) {
    return result;
  }
  if (a.dark && b.dark) {
    result = compareResourceThemableDecorations(a.dark, b.dark);
  } else if (a.dark) {
    return 1;
  } else if (b.dark) {
    return -1;
  }
  return result;
}

function compareCommands(a, b) {
  if (a.command !== b.command) {
    return a.command < b.command ? -1 : 1;
  }
  if (a.title !== b.title) {
    return a.title < b.title ? -1 : 1;
  }
  if (a.tooltip !== b.tooltip) {
    if (a.tooltip !== void 0 && b.tooltip !== void 0) {
      return a.tooltip < b.tooltip ? -1 : 1;
    } else if (a.tooltip !== void 0) {
      return 1;
    } else if (b.tooltip !== void 0) {
      return -1;
    }
  }
  if (a.arguments === b.arguments) {
    return 0;
  } else if (!a.arguments) {
    return -1;
  } else if (!b.arguments) {
    return 1;
  } else if (a.arguments.length !== b.arguments.length) {
    return a.arguments.length - b.arguments.length;
  }
  for (let i = 0; i < a.arguments.length; i++) {
    const aArg = a.arguments[i];
    const bArg = b.arguments[i];
    if (aArg === bArg) {
      continue;
    }
    if (isUri2(aArg) && isUri2(bArg) && uriEquals(aArg, bArg)) {
      continue;
    }
    return aArg < bArg ? -1 : 1;
  }
  return 0;
}

function compareResourceStates(a, b) {
  let result = comparePaths(a.resourceUri.fsPath, b.resourceUri.fsPath, true);
  if (result !== 0) {
    return result;
  }
  if (a.command && b.command) {
    result = compareCommands(a.command, b.command);
  } else if (a.command) {
    return 1;
  } else if (b.command) {
    return -1;
  }
  if (result !== 0) {
    return result;
  }
  if (a.decorations && b.decorations) {
    result = compareResourceStatesDecorations(a.decorations, b.decorations);
  } else if (a.decorations) {
    return 1;
  } else if (b.decorations) {
    return -1;
  }
  if (result !== 0) {
    return result;
  }
  if (a.multiFileDiffEditorModifiedUri && b.multiFileDiffEditorModifiedUri) {
    result = comparePaths(a.multiFileDiffEditorModifiedUri.fsPath, b.multiFileDiffEditorModifiedUri.fsPath, true);
  } else if (a.multiFileDiffEditorModifiedUri) {
    return 1;
  } else if (b.multiFileDiffEditorModifiedUri) {
    return -1;
  }
  if (result !== 0) {
    return result;
  }
  if (a.multiDiffEditorOriginalUri && b.multiDiffEditorOriginalUri) {
    result = comparePaths(a.multiDiffEditorOriginalUri.fsPath, b.multiDiffEditorOriginalUri.fsPath, true);
  } else if (a.multiDiffEditorOriginalUri) {
    return 1;
  } else if (b.multiDiffEditorOriginalUri) {
    return -1;
  }
  return result;
}

function compareArgs(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function commandEquals(a, b) {
  return a.command === b.command && a.title === b.title && a.tooltip === b.tooltip && (a.arguments && b.arguments ? compareArgs(a.arguments, b.arguments) : a.arguments === b.arguments);
}

function commandListEquals(a, b) {
  return equals(a, b, commandEquals);
}

var ExtHostSCMInputBox = class {
  constructor(_extension, _extHostDocuments, proxy, _sourceControlHandle, _documentUri) {
    this._extension = _extension;
    this._sourceControlHandle = _sourceControlHandle;
    this._documentUri = _documentUri;
    this._value = "";
    this._onDidChange = new Emitter();
    this._placeholder = "";
    this._enabled = true;
    this._visible = true;
    this.#extHostDocuments = _extHostDocuments;
    this.#proxy = proxy;
  }
  #proxy;
  #extHostDocuments;
  get value() {
    return this._value;
  }
  set value(value) {
    value = value ?? "";
    this.#proxy.$setInputBoxValue(this._sourceControlHandle, value);
    this.updateValue(value);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this.#proxy.$setInputBoxPlaceholder(this._sourceControlHandle, placeholder);
    this._placeholder = placeholder;
  }
  get validateInput() {
    checkProposedApiEnabled(this._extension, "scmValidation");
    return this._validateInput;
  }
  set validateInput(fn) {
    checkProposedApiEnabled(this._extension, "scmValidation");
    if (fn && typeof fn !== "function") {
      throw new Error(`[${this._extension.identifier.value}]: Invalid SCM input box validation function`);
    }
    this._validateInput = fn;
    this.#proxy.$setValidationProviderIsEnabled(this._sourceControlHandle, !!fn);
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(enabled) {
    enabled = !!enabled;
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    this.#proxy.$setInputBoxEnablement(this._sourceControlHandle, enabled);
  }
  get visible() {
    return this._visible;
  }
  set visible(visible) {
    visible = !!visible;
    if (this._visible === visible) {
      return;
    }
    this._visible = visible;
    this.#proxy.$setInputBoxVisibility(this._sourceControlHandle, visible);
  }
  get document() {
    checkProposedApiEnabled(this._extension, "scmTextDocument");
    return this.#extHostDocuments.getDocument(this._documentUri);
  }
  showValidationMessage(message, type) {
    checkProposedApiEnabled(this._extension, "scmValidation");
    this.#proxy.$showValidationMessage(this._sourceControlHandle, message, SourceControlInputBoxValidationType2.from(type));
  }
  $onInputBoxValueChange(value) {
    this.updateValue(value);
  }
  updateValue(value) {
    this._value = value;
    this._onDidChange.fire(value);
  }
};

var ExtHostSourceControlResourceGroup = class _ExtHostSourceControlResourceGroup {
  constructor(_proxy, _commands, _sourceControlHandle, _id, _label, multiDiffEditorEnableViewChanges, _extension) {
    this._proxy = _proxy;
    this._commands = _commands;
    this._sourceControlHandle = _sourceControlHandle;
    this._id = _id;
    this._label = _label;
    this.multiDiffEditorEnableViewChanges = multiDiffEditorEnableViewChanges;
    this._extension = _extension;
    this._resourceHandlePool = 0;
    this._resourceStates = [];
    this._resourceStatesMap = /* @__PURE__ */ new Map();
    this._resourceStatesCommandsMap = /* @__PURE__ */ new Map();
    this._resourceStatesDisposablesMap = /* @__PURE__ */ new Map();
    this._onDidUpdateResourceStates = new Emitter();
    this.onDidUpdateResourceStates = this._onDidUpdateResourceStates.event;
    this._disposed = false;
    this._onDidDispose = new Emitter();
    this.onDidDispose = this._onDidDispose.event;
    this._handlesSnapshot = [];
    this._resourceSnapshot = [];
    this._contextValue = void 0;
    this._hideWhenEmpty = void 0;
    this.handle = _ExtHostSourceControlResourceGroup._handlePool++;
  }
  static {
    this._handlePool = 0;
  }
  get disposed() {
    return this._disposed;
  }
  get id() {
    return this._id;
  }
  get label() {
    return this._label;
  }
  set label(label) {
    this._label = label;
    this._proxy.$updateGroupLabel(this._sourceControlHandle, this.handle, label);
  }
  get contextValue() {
    return this._contextValue;
  }
  set contextValue(contextValue) {
    this._contextValue = contextValue;
    this._proxy.$updateGroup(this._sourceControlHandle, this.handle, this.features);
  }
  get hideWhenEmpty() {
    return this._hideWhenEmpty;
  }
  set hideWhenEmpty(hideWhenEmpty) {
    this._hideWhenEmpty = hideWhenEmpty;
    this._proxy.$updateGroup(this._sourceControlHandle, this.handle, this.features);
  }
  get features() {
    return {
      contextValue: this.contextValue,
      hideWhenEmpty: this.hideWhenEmpty
    };
  }
  get resourceStates() {
    return [...this._resourceStates];
  }
  set resourceStates(resources) {
    this._resourceStates = [...resources];
    this._onDidUpdateResourceStates.fire();
  }
  getResourceState(handle) {
    return this._resourceStatesMap.get(handle);
  }
  $executeResourceCommand(handle, preserveFocus) {
    const command = this._resourceStatesCommandsMap.get(handle);
    if (!command) {
      return Promise.resolve(void 0);
    }
    return asPromise(() => this._commands.executeCommand(command.command, ...command.arguments || [], preserveFocus));
  }
  _takeResourceStateSnapshot() {
    const snapshot = [...this._resourceStates].sort(compareResourceStates);
    const diffs = sortedDiff(this._resourceSnapshot, snapshot, compareResourceStates);
    const splices = diffs.map((diff2) => {
      const toInsert = diff2.toInsert.map((r2) => {
        const handle = this._resourceHandlePool++;
        this._resourceStatesMap.set(handle, r2);
        const sourceUri = r2.resourceUri;
        let command;
        if (r2.command) {
          if (r2.command.command === "vscode.open" || r2.command.command === "vscode.diff" || r2.command.command === "vscode.changes") {
            const disposables = new DisposableStore();
            command = this._commands.converter.toInternal(r2.command, disposables);
            this._resourceStatesDisposablesMap.set(handle, disposables);
          } else {
            this._resourceStatesCommandsMap.set(handle, r2.command);
          }
        }
        const hasScmMultiDiffEditorProposalEnabled = isProposedApiEnabled(this._extension, "scmMultiDiffEditor");
        const multiFileDiffEditorOriginalUri = hasScmMultiDiffEditorProposalEnabled ? r2.multiDiffEditorOriginalUri : void 0;
        const multiFileDiffEditorModifiedUri = hasScmMultiDiffEditorProposalEnabled ? r2.multiFileDiffEditorModifiedUri : void 0;
        const icon = getIconResource(r2.decorations);
        const lightIcon = r2.decorations && getIconResource(r2.decorations.light) || icon;
        const darkIcon = r2.decorations && getIconResource(r2.decorations.dark) || icon;
        const icons = [lightIcon, darkIcon];
        const tooltip = r2.decorations && r2.decorations.tooltip || "";
        const strikeThrough = r2.decorations && !!r2.decorations.strikeThrough;
        const faded = r2.decorations && !!r2.decorations.faded;
        const contextValue = r2.contextValue || "";
        const rawResource = [handle, sourceUri, icons, tooltip, strikeThrough, faded, contextValue, command, multiFileDiffEditorOriginalUri, multiFileDiffEditorModifiedUri];
        return { rawResource, handle };
      });
      return { start: diff2.start, deleteCount: diff2.deleteCount, toInsert };
    });
    const rawResourceSplices = splices.map(({ start, deleteCount, toInsert }) => [start, deleteCount, toInsert.map((i) => i.rawResource)]);
    const reverseSplices = splices.reverse();
    for (const { start, deleteCount, toInsert } of reverseSplices) {
      const handles = toInsert.map((i) => i.handle);
      const handlesToDelete = this._handlesSnapshot.splice(start, deleteCount, ...handles);
      for (const handle of handlesToDelete) {
        this._resourceStatesMap.delete(handle);
        this._resourceStatesCommandsMap.delete(handle);
        this._resourceStatesDisposablesMap.get(handle)?.dispose();
        this._resourceStatesDisposablesMap.delete(handle);
      }
    }
    this._resourceSnapshot = snapshot;
    return rawResourceSplices;
  }
  dispose() {
    this._disposed = true;
    this._onDidDispose.fire();
    this._onDidUpdateResourceStates.dispose();
    this._onDidDispose.dispose();
  }
};

var _ExtHostSourceControl = class _ExtHostSourceControl {
  constructor(_extension, _extHostDocuments, proxy, _commands, _id, _label, _rootUri, _iconPath, _isHidden, _parent) {
    this._extension = _extension;
    this._commands = _commands;
    this._id = _id;
    this._label = _label;
    this._rootUri = _rootUri;
    this._onDidDispose = new Emitter();
    this.onDidDispose = this._onDidDispose.event;
    this._groups = /* @__PURE__ */ new Map();
    this._contextValue = void 0;
    this._count = void 0;
    this._quickDiffProvider = void 0;
    this._secondaryQuickDiffProvider = void 0;
    this._historyProviderDisposable = new MutableDisposable();
    this._artifactProviderDisposable = new MutableDisposable();
    this._commitTemplate = void 0;
    this._acceptInputDisposables = new MutableDisposable();
    this._acceptInputCommand = void 0;
    // We know what we're doing here:
    // eslint-disable-next-line local/code-no-potentially-unsafe-disposables
    this._actionButtonDisposables = new DisposableStore();
    // We know what we're doing here:
    // eslint-disable-next-line local/code-no-potentially-unsafe-disposables
    this._statusBarDisposables = new DisposableStore();
    this._statusBarCommands = void 0;
    this._selected = false;
    this._onDidChangeSelection = new Emitter();
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._artifactCommandsDisposables = new DisposableMap();
    this.handle = _ExtHostSourceControl._handlePool++;
    this.createdResourceGroups = /* @__PURE__ */ new Map();
    this.updatedResourceGroups = /* @__PURE__ */ new Set();
    this.#proxy = proxy;
    const inputBoxDocumentUri = URI.from({
      scheme: Schemas.vscodeSourceControl,
      path: `${_id}/scm${this.handle}/input`,
      query: _rootUri ? `rootUri=${encodeURIComponent(_rootUri.toString())}` : void 0
    });
    this._inputBox = new ExtHostSCMInputBox(_extension, _extHostDocuments, this.#proxy, this.handle, inputBoxDocumentUri);
    this.#proxy.$registerSourceControl(this.handle, _parent?.handle, _id, _label, _rootUri, getHistoryItemIconDto(_iconPath), _isHidden, inputBoxDocumentUri);
    this.onDidDisposeParent = _parent ? _parent.onDidDispose : Event.None;
  }
  static {
    this._handlePool = 0;
  }
  #proxy;
  get id() {
    return this._id;
  }
  get label() {
    return this._label;
  }
  get rootUri() {
    return this._rootUri;
  }
  get contextValue() {
    checkProposedApiEnabled(this._extension, "scmProviderOptions");
    return this._contextValue;
  }
  set contextValue(contextValue) {
    checkProposedApiEnabled(this._extension, "scmProviderOptions");
    if (this._contextValue === contextValue) {
      return;
    }
    this._contextValue = contextValue;
    this.#proxy.$updateSourceControl(this.handle, { contextValue });
  }
  get inputBox() {
    return this._inputBox;
  }
  get count() {
    return this._count;
  }
  set count(count2) {
    if (this._count === count2) {
      return;
    }
    this._count = count2;
    this.#proxy.$updateSourceControl(this.handle, { count: count2 });
  }
  get quickDiffProvider() {
    return this._quickDiffProvider;
  }
  set quickDiffProvider(quickDiffProvider) {
    this._quickDiffProvider = quickDiffProvider;
    let quickDiffLabel = void 0;
    if (isProposedApiEnabled(this._extension, "quickDiffProvider")) {
      quickDiffLabel = quickDiffProvider?.label;
    }
    this.#proxy.$updateSourceControl(this.handle, { hasQuickDiffProvider: !!quickDiffProvider, quickDiffLabel });
  }
  get secondaryQuickDiffProvider() {
    checkProposedApiEnabled(this._extension, "quickDiffProvider");
    return this._secondaryQuickDiffProvider;
  }
  set secondaryQuickDiffProvider(secondaryQuickDiffProvider) {
    checkProposedApiEnabled(this._extension, "quickDiffProvider");
    this._secondaryQuickDiffProvider = secondaryQuickDiffProvider;
    const secondaryQuickDiffLabel = secondaryQuickDiffProvider?.label;
    this.#proxy.$updateSourceControl(this.handle, { hasSecondaryQuickDiffProvider: !!secondaryQuickDiffProvider, secondaryQuickDiffLabel });
  }
  get historyProvider() {
    checkProposedApiEnabled(this._extension, "scmHistoryProvider");
    return this._historyProvider;
  }
  set historyProvider(historyProvider) {
    checkProposedApiEnabled(this._extension, "scmHistoryProvider");
    this._historyProvider = historyProvider;
    this._historyProviderDisposable.value = new DisposableStore();
    this.#proxy.$updateSourceControl(this.handle, { hasHistoryProvider: !!historyProvider });
    if (historyProvider) {
      this._historyProviderDisposable.value.add(historyProvider.onDidChangeCurrentHistoryItemRefs(() => {
        const historyItemRef = toSCMHistoryItemRefDto(historyProvider?.currentHistoryItemRef);
        const historyItemRemoteRef = toSCMHistoryItemRefDto(historyProvider?.currentHistoryItemRemoteRef);
        const historyItemBaseRef = toSCMHistoryItemRefDto(historyProvider?.currentHistoryItemBaseRef);
        this.#proxy.$onDidChangeHistoryProviderCurrentHistoryItemRefs(this.handle, historyItemRef, historyItemRemoteRef, historyItemBaseRef);
      }));
      this._historyProviderDisposable.value.add(historyProvider.onDidChangeHistoryItemRefs((e) => {
        if (e.added.length === 0 && e.modified.length === 0 && e.removed.length === 0) {
          return;
        }
        const added = e.added.map((ref) => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) }));
        const modified = e.modified.map((ref) => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) }));
        const removed = e.removed.map((ref) => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) }));
        this.#proxy.$onDidChangeHistoryProviderHistoryItemRefs(this.handle, { added, modified, removed, silent: e.silent });
      }));
    }
  }
  get artifactProvider() {
    checkProposedApiEnabled(this._extension, "scmArtifactProvider");
    return this._artifactProvider;
  }
  set artifactProvider(artifactProvider) {
    checkProposedApiEnabled(this._extension, "scmArtifactProvider");
    this._artifactProvider = artifactProvider;
    this._artifactProviderDisposable.value = new DisposableStore();
    this.#proxy.$updateSourceControl(this.handle, { hasArtifactProvider: !!artifactProvider });
    if (artifactProvider) {
      this._artifactProviderDisposable.value.add(artifactProvider.onDidChangeArtifacts((groups) => {
        if (groups.length !== 0) {
          this.#proxy.$onDidChangeArtifacts(this.handle, groups);
        }
      }));
    }
  }
  get commitTemplate() {
    return this._commitTemplate;
  }
  set commitTemplate(commitTemplate) {
    if (commitTemplate === this._commitTemplate) {
      return;
    }
    this._commitTemplate = commitTemplate;
    this.#proxy.$updateSourceControl(this.handle, { commitTemplate });
  }
  get acceptInputCommand() {
    return this._acceptInputCommand;
  }
  set acceptInputCommand(acceptInputCommand) {
    this._acceptInputDisposables.value = new DisposableStore();
    this._acceptInputCommand = acceptInputCommand;
    const internal = this._commands.converter.toInternal(acceptInputCommand, this._acceptInputDisposables.value);
    this.#proxy.$updateSourceControl(this.handle, { acceptInputCommand: internal });
  }
  get actionButton() {
    checkProposedApiEnabled(this._extension, "scmActionButton");
    return this._actionButton;
  }
  set actionButton(actionButton) {
    checkProposedApiEnabled(this._extension, "scmActionButton");
    if (structuralEquals(this._actionButton, actionButton)) {
      return;
    }
    const oldActionButtonDisposables = this._actionButtonDisposables;
    this._actionButtonDisposables = new DisposableStore();
    this._actionButton = actionButton;
    const actionButtonDto = actionButton !== void 0 ? {
      command: {
        ...this._commands.converter.toInternal(actionButton.command, this._actionButtonDisposables),
        shortTitle: actionButton.command.shortTitle
      },
      secondaryCommands: actionButton.secondaryCommands?.map((commandGroup) => {
        return commandGroup.map((command) => this._commands.converter.toInternal(command, this._actionButtonDisposables));
      }),
      enabled: actionButton.enabled
    } : null;
    this.#proxy.$updateSourceControl(this.handle, { actionButton: actionButtonDto }).finally(() => oldActionButtonDisposables.dispose());
  }
  get statusBarCommands() {
    return this._statusBarCommands;
  }
  set statusBarCommands(statusBarCommands) {
    if (this._statusBarCommands && statusBarCommands && commandListEquals(this._statusBarCommands, statusBarCommands)) {
      return;
    }
    const oldStatusBarDisposables = this._statusBarDisposables;
    this._statusBarDisposables = new DisposableStore();
    this._statusBarCommands = statusBarCommands;
    const internal = (statusBarCommands || []).map((c) => this._commands.converter.toInternal(c, this._statusBarDisposables));
    this.#proxy.$updateSourceControl(this.handle, { statusBarCommands: internal }).finally(() => oldStatusBarDisposables.dispose());
  }
  get selected() {
    return this._selected;
  }
  createResourceGroup(id2, label, options2) {
    const multiDiffEditorEnableViewChanges = isProposedApiEnabled(this._extension, "scmMultiDiffEditor") && options2?.multiDiffEditorEnableViewChanges === true;
    const group = new ExtHostSourceControlResourceGroup(this.#proxy, this._commands, this.handle, id2, label, multiDiffEditorEnableViewChanges, this._extension);
    const disposable = Event.once(group.onDidDispose)(() => this.createdResourceGroups.delete(group));
    this.createdResourceGroups.set(group, disposable);
    this.eventuallyAddResourceGroups();
    return group;
  }
  eventuallyAddResourceGroups() {
    const groups = [];
    const splices = [];
    for (const [group, disposable] of this.createdResourceGroups) {
      disposable.dispose();
      const updateListener = group.onDidUpdateResourceStates(() => {
        this.updatedResourceGroups.add(group);
        this.eventuallyUpdateResourceStates();
      });
      Event.once(group.onDidDispose)(() => {
        this.updatedResourceGroups.delete(group);
        updateListener.dispose();
        this._groups.delete(group.handle);
        this.#proxy.$unregisterGroup(this.handle, group.handle);
      });
      groups.push([group.handle, group.id, group.label, group.features, group.multiDiffEditorEnableViewChanges]);
      const snapshot = group._takeResourceStateSnapshot();
      if (snapshot.length > 0) {
        splices.push([group.handle, snapshot]);
      }
      this._groups.set(group.handle, group);
    }
    this.#proxy.$registerGroups(this.handle, groups, splices);
    this.createdResourceGroups.clear();
  }
  eventuallyUpdateResourceStates() {
    const splices = [];
    this.updatedResourceGroups.forEach((group) => {
      const snapshot = group._takeResourceStateSnapshot();
      if (snapshot.length === 0) {
        return;
      }
      splices.push([group.handle, snapshot]);
    });
    if (splices.length > 0) {
      this.#proxy.$spliceResourceStates(this.handle, splices);
    }
    this.updatedResourceGroups.clear();
  }
  getResourceGroup(handle) {
    return this._groups.get(handle);
  }
  setSelectionState(selected) {
    this._selected = selected;
    this._onDidChangeSelection.fire(selected);
  }
  async provideArtifacts(group, token) {
    const commandsDisposables = new DisposableStore();
    const artifacts = await this.artifactProvider?.provideArtifacts(group, token);
    const artifactsDto = artifacts?.map((artifact) => ({
      ...artifact,
      icon: getHistoryItemIconDto(artifact.icon),
      command: artifact.command ? this._commands.converter.toInternal(artifact.command, commandsDisposables) : void 0
    }));
    this._artifactCommandsDisposables.get(group)?.dispose();
    this._artifactCommandsDisposables.set(group, commandsDisposables);
    return artifactsDto;
  }
  dispose() {
    this._acceptInputDisposables.dispose();
    this._actionButtonDisposables.dispose();
    this._statusBarDisposables.dispose();
    this._historyProviderDisposable.dispose();
    this._artifactProviderDisposable.dispose();
    this._artifactCommandsDisposables.dispose();
    this._groups.forEach((group) => group.dispose());
    this.#proxy.$unregisterSourceControl(this.handle);
    this._onDidChangeSelection.dispose();
    this._onDidDispose.fire();
    this._onDidDispose.dispose();
  }
};

__decorateClass([
  debounce(100)
], _ExtHostSourceControl.prototype, "eventuallyAddResourceGroups", 1);

__decorateClass([
  debounce(100)
], _ExtHostSourceControl.prototype, "eventuallyUpdateResourceStates", 1);

var ExtHostSourceControl = _ExtHostSourceControl;

var ExtHostSCM = class {
  constructor(mainContext, _commands, _extHostDocuments, logService) {
    this._commands = _commands;
    this._extHostDocuments = _extHostDocuments;
    this.logService = logService;
    this._sourceControls = /* @__PURE__ */ new Map();
    this._sourceControlsByExtension = new ExtensionIdentifierMap();
    this._onDidChangeActiveProvider = new Emitter();
    this._proxy = mainContext.getProxy(MainContext.MainThreadSCM);
    this._telemetry = mainContext.getProxy(MainContext.MainThreadTelemetry);
    _commands.registerArgumentProcessor({
      processArgument: (arg) => {
        if (arg && arg.$mid === 3 /* ScmResource */) {
          const sourceControl = this._sourceControls.get(arg.sourceControlHandle);
          if (!sourceControl) {
            return arg;
          }
          const group = sourceControl.getResourceGroup(arg.groupHandle);
          if (!group) {
            return arg;
          }
          return group.getResourceState(arg.handle);
        } else if (arg && arg.$mid === 4 /* ScmResourceGroup */) {
          const sourceControl = this._sourceControls.get(arg.sourceControlHandle);
          if (!sourceControl) {
            return arg;
          }
          return sourceControl.getResourceGroup(arg.groupHandle);
        } else if (arg && arg.$mid === 5 /* ScmProvider */) {
          const sourceControl = this._sourceControls.get(arg.handle);
          if (!sourceControl) {
            return arg;
          }
          return sourceControl;
        }
        return arg;
      }
    });
  }
  get onDidChangeActiveProvider() {
    return this._onDidChangeActiveProvider.event;
  }
  createSourceControl(extension, id2, label, rootUri, iconPath, isHidden, parent) {
    this.logService.trace("ExtHostSCM#createSourceControl", extension.identifier.value, id2, label, rootUri);
    this._telemetry.$publicLog2("api/scm/createSourceControl", {
      extensionId: extension.identifier.value
    });
    const parentSourceControl = parent ? Iterable.find(this._sourceControls.values(), (s) => s === parent) : void 0;
    const sourceControl = new ExtHostSourceControl(extension, this._extHostDocuments, this._proxy, this._commands, id2, label, rootUri, iconPath, isHidden, parentSourceControl);
    this._sourceControls.set(sourceControl.handle, sourceControl);
    const sourceControls = this._sourceControlsByExtension.get(extension.identifier) || [];
    sourceControls.push(sourceControl);
    this._sourceControlsByExtension.set(extension.identifier, sourceControls);
    Event.once(sourceControl.onDidDispose)(() => {
      this.logService.trace("ExtHostSCM#disposeSourceControl", extension.identifier.value, id2, label, rootUri);
      this._sourceControls.delete(sourceControl.handle);
      const sourceControls2 = this._sourceControlsByExtension.get(extension.identifier);
      if (sourceControls2) {
        const index = sourceControls2.indexOf(sourceControl);
        if (index !== -1) {
          sourceControls2.splice(index, 1);
        }
        if (sourceControls2.length === 0) {
          this._sourceControlsByExtension.delete(extension.identifier);
        }
      }
    });
    return sourceControl;
  }
  // Deprecated
  getLastInputBox(extension) {
    this.logService.trace("ExtHostSCM#getLastInputBox", extension.identifier.value);
    const sourceControls = this._sourceControlsByExtension.get(extension.identifier);
    const sourceControl = sourceControls && sourceControls[sourceControls.length - 1];
    return sourceControl && sourceControl.inputBox;
  }
  $provideOriginalResource(sourceControlHandle, uriComponents, token) {
    const uri2 = URI.revive(uriComponents);
    this.logService.trace("ExtHostSCM#$provideOriginalResource", sourceControlHandle, uri2.toString());
    const sourceControl = this._sourceControls.get(sourceControlHandle);
    if (!sourceControl || !sourceControl.quickDiffProvider || !sourceControl.quickDiffProvider.provideOriginalResource) {
      return Promise.resolve(null);
    }
    return asPromise(() => sourceControl.quickDiffProvider.provideOriginalResource(uri2, token)).then((r2) => r2 || null);
  }
  $provideSecondaryOriginalResource(sourceControlHandle, uriComponents, token) {
    const uri2 = URI.revive(uriComponents);
    this.logService.trace("ExtHostSCM#$provideSecondaryOriginalResource", sourceControlHandle, uri2.toString());
    const sourceControl = this._sourceControls.get(sourceControlHandle);
    if (!sourceControl || !sourceControl.secondaryQuickDiffProvider || !sourceControl.secondaryQuickDiffProvider.provideOriginalResource) {
      return Promise.resolve(null);
    }
    return asPromise(() => sourceControl.secondaryQuickDiffProvider.provideOriginalResource(uri2, token)).then((r2) => r2 || null);
  }
  $onInputBoxValueChange(sourceControlHandle, value) {
    this.logService.trace("ExtHostSCM#$onInputBoxValueChange", sourceControlHandle);
    const sourceControl = this._sourceControls.get(sourceControlHandle);
    if (!sourceControl) {
      return Promise.resolve(void 0);
    }
    sourceControl.inputBox.$onInputBoxValueChange(value);
    return Promise.resolve(void 0);
  }
  $executeResourceCommand(sourceControlHandle, groupHandle, handle, preserveFocus) {
    this.logService.trace("ExtHostSCM#$executeResourceCommand", sourceControlHandle, groupHandle, handle);
    const sourceControl = this._sourceControls.get(sourceControlHandle);
    if (!sourceControl) {
      return Promise.resolve(void 0);
    }
    const group = sourceControl.getResourceGroup(groupHandle);
    if (!group) {
      return Promise.resolve(void 0);
    }
    return group.$executeResourceCommand(handle, preserveFocus);
  }
  $validateInput(sourceControlHandle, value, cursorPosition) {
    this.logService.trace("ExtHostSCM#$validateInput", sourceControlHandle);
    const sourceControl = this._sourceControls.get(sourceControlHandle);
    if (!sourceControl) {
      return Promise.resolve(void 0);
    }
    if (!sourceControl.inputBox.validateInput) {
      return Promise.resolve(void 0);
    }
    return asPromise(() => sourceControl.inputBox.validateInput(value, cursorPosition)).then((result) => {
      if (!result) {
        return Promise.resolve(void 0);
      }
      const message = MarkdownString3.fromStrict(result.message);
      if (!message) {
        return Promise.resolve(void 0);
      }
      return Promise.resolve([message, result.type]);
    });
  }
  $setSelectedSourceControl(selectedSourceControlHandle) {
    this.logService.trace("ExtHostSCM#$setSelectedSourceControl", selectedSourceControlHandle);
    if (this._selectedSourceControlHandle === selectedSourceControlHandle) {
      return Promise.resolve(void 0);
    }
    if (selectedSourceControlHandle !== void 0) {
      this._sourceControls.get(selectedSourceControlHandle)?.setSelectionState(true);
    }
    if (this._selectedSourceControlHandle !== void 0) {
      this._sourceControls.get(this._selectedSourceControlHandle)?.setSelectionState(false);
    }
    this._selectedSourceControlHandle = selectedSourceControlHandle;
    return Promise.resolve(void 0);
  }
  async $resolveHistoryItem(sourceControlHandle, historyItemId, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const historyItem = await historyProvider?.resolveHistoryItem(historyItemId, token);
      return historyItem ? toSCMHistoryItemDto(historyItem) : void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$resolveHistoryItem", err);
      return void 0;
    }
  }
  async $resolveHistoryItemChatContext(sourceControlHandle, historyItemId, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const chatContext = await historyProvider?.resolveHistoryItemChatContext(historyItemId, token);
      return chatContext ?? void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$resolveHistoryItemChatContext", err);
      return void 0;
    }
  }
  async $resolveHistoryItemChangeRangeChatContext(sourceControlHandle, historyItemId, historyItemParentId, path, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const chatContext = await historyProvider?.resolveHistoryItemChangeRangeChatContext?.(historyItemId, historyItemParentId, path, token);
      return chatContext ?? void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$resolveHistoryItemChangeRangeChatContext", err);
      return void 0;
    }
  }
  async $resolveHistoryItemRefsCommonAncestor(sourceControlHandle, historyItemRefs, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const ancestor = await historyProvider?.resolveHistoryItemRefsCommonAncestor(historyItemRefs, token);
      return ancestor ?? void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$resolveHistoryItemRefsCommonAncestor", err);
      return void 0;
    }
  }
  async $provideHistoryItemRefs(sourceControlHandle, historyItemRefs, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const refs = await historyProvider?.provideHistoryItemRefs(historyItemRefs, token);
      return refs?.map((ref) => ({ ...ref, icon: getHistoryItemIconDto(ref.icon) })) ?? void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$provideHistoryItemRefs", err);
      return void 0;
    }
  }
  async $provideHistoryItems(sourceControlHandle, options2, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const historyItems = await historyProvider?.provideHistoryItems(options2, token);
      return historyItems?.map((item) => toSCMHistoryItemDto(item)) ?? void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$provideHistoryItems", err);
      return void 0;
    }
  }
  async $provideHistoryItemChanges(sourceControlHandle, historyItemId, historyItemParentId, token) {
    try {
      const historyProvider = this._sourceControls.get(sourceControlHandle)?.historyProvider;
      const changes = await historyProvider?.provideHistoryItemChanges(historyItemId, historyItemParentId, token);
      return changes ?? void 0;
    } catch (err) {
      this.logService.error("ExtHostSCM#$provideHistoryItemChanges", err);
      return void 0;
    }
  }
  async $provideArtifactGroups(sourceControlHandle, token) {
    try {
      const artifactProvider = this._sourceControls.get(sourceControlHandle)?.artifactProvider;
      const groups = await artifactProvider?.provideArtifactGroups(token);
      return groups?.map((group) => ({
        ...group,
        icon: getHistoryItemIconDto(group.icon)
      }));
    } catch (err) {
      this.logService.error("ExtHostSCM#$provideArtifactGroups", err);
      return void 0;
    }
  }
  async $provideArtifacts(sourceControlHandle, group, token) {
    try {
      const sourceControl = this._sourceControls.get(sourceControlHandle);
      return sourceControl?.provideArtifacts(group, token);
    } catch (err) {
      this.logService.error("ExtHostSCM#$provideArtifacts", err);
      return void 0;
    }
  }
};

ExtHostSCM = __decorateClass([
  __decorateParam(3, ILogService)
], ExtHostSCM);
export { isUri2, uriEquals, getIconResource, getHistoryItemIconDto, toSCMHistoryItemDto, toSCMHistoryItemRefDto, compareResourceThemableDecorations, compareResourceStatesDecorations, compareCommands, compareResourceStates, compareArgs, commandEquals, commandListEquals, ExtHostSCMInputBox, ExtHostSourceControlResourceGroup, _ExtHostSourceControl, ExtHostSourceControl, ExtHostSCM };
