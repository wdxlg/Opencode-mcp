// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/browser/keybindingService.ts
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { commandsExtensionPoint } from "./module-1524.mjs";
import { AbstractKeybindingService } from "./module-1664.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { EventType, addDisposableListener, getWindow, onDidRegisterWindow, trackFocus } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { isFullscreen, onDidChangeFullscreen } from "./module-0018.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { StandardKeyboardEvent, printKeyboardEvent, printStandardKeyboardEvent } from "./module-0022.mjs";
import { remove } from "./module-0007.mjs";
import { UserSettingsLabelProvider } from "./module-0504.mjs";
import { OS, isMacintosh } from "./module-0014.mjs";
import { KeyCodeChord, ScanCodeChord } from "./module-0021.mjs";
import { IMMUTABLE_CODE_TO_KEY_CODE, KeyCodeUtils, ScanCodeUtils } from "./module-0019.mjs";
import { DeferredPromise, RunOnceScheduler } from "./module-0036.mjs";
import { KeybindingResolver } from "./module-0582.mjs";
import { ResolvedKeybindingItem } from "./module-1644.mjs";
import { KeybindingParser } from "./module-1663.mjs";
import { MenuRegistry } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { KeybindingIO, OutputBuilder } from "./module-1666.mjs";
import { getAllUnboundCommands } from "./module-1645.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IHostService } from "./module-1117.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { IKeyboardLayoutService } from "./module-1665.mjs";
import { dirname2 } from "./module-0034.mjs";
import { equals4 } from "./module-0098.mjs";
import { parse5 } from "./module-0883.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { isLocalizedString } from "./module-0505.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/services/keybinding/browser/keybindingService.ts
function isValidContributedKeyBinding(keyBinding, rejects) {
  if (!keyBinding) {
    rejects.push(localize(23185, null));
    return false;
  }
  if (typeof keyBinding.command !== "string") {
    rejects.push(localize(23187, null, "command"));
    return false;
  }
  if (keyBinding.key && typeof keyBinding.key !== "string") {
    rejects.push(localize(23186, null, "key"));
    return false;
  }
  if (keyBinding.when && typeof keyBinding.when !== "string") {
    rejects.push(localize(23186, null, "when"));
    return false;
  }
  if (keyBinding.mac && typeof keyBinding.mac !== "string") {
    rejects.push(localize(23186, null, "mac"));
    return false;
  }
  if (keyBinding.linux && typeof keyBinding.linux !== "string") {
    rejects.push(localize(23186, null, "linux"));
    return false;
  }
  if (keyBinding.win && typeof keyBinding.win !== "string") {
    rejects.push(localize(23186, null, "win"));
    return false;
  }
  return true;
}

var keybindingType = {
  type: "object",
  default: { command: "", key: "" },
  required: ["command", "key"],
  properties: {
    command: {
      description: localize(23191, null),
      type: "string"
    },
    args: {
      description: localize(23190, null)
    },
    key: {
      description: localize(23192, null),
      type: "string"
    },
    mac: {
      description: localize(23194, null),
      type: "string"
    },
    linux: {
      description: localize(23193, null),
      type: "string"
    },
    win: {
      description: localize(23196, null),
      type: "string"
    },
    when: {
      description: localize(23195, null),
      type: "string"
    }
  }
};

var keybindingsExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "keybindings",
  deps: [commandsExtensionPoint],
  jsonSchema: {
    description: localize(23189, null),
    oneOf: [
      keybindingType,
      {
        type: "array",
        items: keybindingType
      }
    ]
  }
});

var NUMPAD_PRINTABLE_SCANCODES = [
  90 /* NumpadDivide */,
  91 /* NumpadMultiply */,
  92 /* NumpadSubtract */,
  93 /* NumpadAdd */,
  95 /* Numpad1 */,
  96 /* Numpad2 */,
  97 /* Numpad3 */,
  98 /* Numpad4 */,
  99 /* Numpad5 */,
  100 /* Numpad6 */,
  101 /* Numpad7 */,
  102 /* Numpad8 */,
  103 /* Numpad9 */,
  104 /* Numpad0 */,
  105 /* NumpadDecimal */
];

var otherMacNumpadMapping = /* @__PURE__ */ new Map();

otherMacNumpadMapping.set(95 /* Numpad1 */, 22 /* Digit1 */);

otherMacNumpadMapping.set(96 /* Numpad2 */, 23 /* Digit2 */);

otherMacNumpadMapping.set(97 /* Numpad3 */, 24 /* Digit3 */);

otherMacNumpadMapping.set(98 /* Numpad4 */, 25 /* Digit4 */);

otherMacNumpadMapping.set(99 /* Numpad5 */, 26 /* Digit5 */);

otherMacNumpadMapping.set(100 /* Numpad6 */, 27 /* Digit6 */);

otherMacNumpadMapping.set(101 /* Numpad7 */, 28 /* Digit7 */);

otherMacNumpadMapping.set(102 /* Numpad8 */, 29 /* Digit8 */);

otherMacNumpadMapping.set(103 /* Numpad9 */, 30 /* Digit9 */);

otherMacNumpadMapping.set(104 /* Numpad0 */, 21 /* Digit0 */);

var WorkbenchKeybindingService = class extends AbstractKeybindingService {
  constructor(contextKeyService, commandService, telemetryService, notificationService, userDataProfileService, hostService, extensionService, fileService, uriIdentityService, logService, keyboardLayoutService) {
    super(contextKeyService, commandService, telemetryService, notificationService, logService);
    this.hostService = hostService;
    this.keyboardLayoutService = keyboardLayoutService;
    this._contributions = [];
    this.isComposingGlobalContextKey = contextKeyService.createKey(EditorContextKeys.isComposing.key, false);
    this.kbsJsonSchema = new KeybindingsJsonSchema();
    this.updateKeybindingsJsonSchema();
    this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
    this._register(this.keyboardLayoutService.onDidChangeKeyboardLayout(() => {
      this._keyboardMapper = this.keyboardLayoutService.getKeyboardMapper();
      this.updateResolver();
    }));
    this._keybindingHoldMode = null;
    this._cachedResolver = null;
    this.userKeybindings = this._register(new UserKeybindings(userDataProfileService, uriIdentityService, fileService, logService));
    this.userKeybindings.initialize().then(() => {
      if (this.userKeybindings.keybindings.length) {
        this.updateResolver();
      }
    });
    this._register(this.userKeybindings.onDidChange(() => {
      logService.debug("User keybindings changed");
      this.updateResolver();
    }));
    keybindingsExtPoint.setHandler((extensions) => {
      const keybindings = [];
      for (const extension of extensions) {
        this._handleKeybindingsExtensionPointUser(extension.description.identifier, extension.description.isBuiltin, extension.value, extension.collector, keybindings);
      }
      KeybindingsRegistry.setExtensionKeybindings(keybindings);
      this.updateResolver();
    });
    this.updateKeybindingsJsonSchema();
    this._register(extensionService.onDidRegisterExtensions(() => this.updateKeybindingsJsonSchema()));
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => disposables.add(this._registerKeyListeners(window2)), { window: mainWindow, disposables: this._store }));
    this._register(onDidChangeFullscreen((windowId) => {
      if (windowId !== mainWindow.vscodeWindowId) {
        return;
      }
      const keyboard = navigator.keyboard;
      if (BrowserFeatures.keyboard === 2 /* None */) {
        return;
      }
      if (isFullscreen(mainWindow)) {
        keyboard?.lock(["Escape"]);
      } else {
        keyboard?.unlock();
      }
      this._cachedResolver = null;
      this._onDidUpdateKeybindings.fire();
    }));
  }
  dispose() {
    this._contributions.forEach((c) => c.listener?.dispose());
    this._contributions.length = 0;
    super.dispose();
  }
  _registerKeyListeners(window2) {
    const disposables = new DisposableStore();
    disposables.add(addDisposableListener(window2, EventType.KEY_DOWN, (e) => {
      if (this._keybindingHoldMode) {
        return;
      }
      this.isComposingGlobalContextKey.set(e.isComposing);
      const keyEvent = new StandardKeyboardEvent(e);
      this._log(`/ Received  keydown event - ${printKeyboardEvent(e)}`);
      this._log(`| Converted keydown event - ${printStandardKeyboardEvent(keyEvent)}`);
      const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
      if (shouldPreventDefault) {
        keyEvent.preventDefault();
      }
      this.isComposingGlobalContextKey.set(false);
    }));
    disposables.add(addDisposableListener(window2, EventType.KEY_UP, (e) => {
      this._resetKeybindingHoldMode();
      this.isComposingGlobalContextKey.set(e.isComposing);
      const keyEvent = new StandardKeyboardEvent(e);
      const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
      if (shouldPreventDefault) {
        keyEvent.preventDefault();
      }
      this.isComposingGlobalContextKey.set(false);
    }));
    return disposables;
  }
  registerSchemaContribution(contribution) {
    const listener = contribution.onDidChange?.(() => this.updateKeybindingsJsonSchema());
    const entry = { listener, contribution };
    this._contributions.push(entry);
    this.updateKeybindingsJsonSchema();
    return toDisposable(() => {
      listener?.dispose();
      remove(this._contributions, entry);
      this.updateKeybindingsJsonSchema();
    });
  }
  updateKeybindingsJsonSchema() {
    this.kbsJsonSchema.updateSchema(this._contributions.flatMap((x) => x.contribution.getSchemaAdditions()));
  }
  _printKeybinding(keybinding) {
    return UserSettingsLabelProvider.toLabel(OS, keybinding.chords, (chord) => {
      if (chord instanceof KeyCodeChord) {
        return KeyCodeUtils.toString(chord.keyCode);
      }
      return ScanCodeUtils.toString(chord.scanCode);
    }) || "[null]";
  }
  _printResolvedKeybinding(resolvedKeybinding) {
    return resolvedKeybinding.getDispatchChords().map((x) => x || "[null]").join(" ");
  }
  _printResolvedKeybindings(output, input, resolvedKeybindings) {
    const padLength = 35;
    const firstRow = `${input.padStart(padLength, " ")} => `;
    if (resolvedKeybindings.length === 0) {
      output.push(`${firstRow}${"[NO BINDING]".padStart(padLength, " ")}`);
      return;
    }
    const firstRowIndentation = firstRow.length;
    const isFirst = true;
    for (const resolvedKeybinding of resolvedKeybindings) {
      if (isFirst) {
        output.push(`${firstRow}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, " ")}`);
      } else {
        output.push(`${" ".repeat(firstRowIndentation)}${this._printResolvedKeybinding(resolvedKeybinding).padStart(padLength, " ")}`);
      }
    }
  }
  _dumpResolveKeybindingDebugInfo() {
    const seenBindings = /* @__PURE__ */ new Set();
    const result = [];
    result.push(`Default Resolved Keybindings (unique only):`);
    for (const item of KeybindingsRegistry.getDefaultKeybindings()) {
      if (!item.keybinding) {
        continue;
      }
      const input = this._printKeybinding(item.keybinding);
      if (seenBindings.has(input)) {
        continue;
      }
      seenBindings.add(input);
      const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
      this._printResolvedKeybindings(result, input, resolvedKeybindings);
    }
    result.push(`User Resolved Keybindings (unique only):`);
    for (const item of this.userKeybindings.keybindings) {
      if (!item.keybinding) {
        continue;
      }
      const input = item._sourceKey ?? "Impossible: missing source key, but has keybinding";
      if (seenBindings.has(input)) {
        continue;
      }
      seenBindings.add(input);
      const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
      this._printResolvedKeybindings(result, input, resolvedKeybindings);
    }
    return result.join("\n");
  }
  _dumpDebugInfo() {
    const layoutInfo = JSON.stringify(this.keyboardLayoutService.getCurrentKeyboardLayout(), null, "	");
    const mapperInfo = this._keyboardMapper.dumpDebugInfo();
    const resolvedKeybindings = this._dumpResolveKeybindingDebugInfo();
    const rawMapping = JSON.stringify(this.keyboardLayoutService.getRawKeyboardMapping(), null, "	");
    return `Layout info:
${layoutInfo}

${resolvedKeybindings}

${mapperInfo}

Raw mapping:
${rawMapping}`;
  }
  _dumpDebugInfoJSON() {
    const info = {
      layout: this.keyboardLayoutService.getCurrentKeyboardLayout(),
      rawMapping: this.keyboardLayoutService.getRawKeyboardMapping()
    };
    return JSON.stringify(info, null, "	");
  }
  enableKeybindingHoldMode(commandId) {
    if (this._currentlyDispatchingCommandId !== commandId) {
      return void 0;
    }
    this._keybindingHoldMode = new DeferredPromise();
    const focusTracker = trackFocus(getWindow(void 0));
    const listener = focusTracker.onDidBlur(() => this._resetKeybindingHoldMode());
    this._keybindingHoldMode.p.finally(() => {
      listener.dispose();
      focusTracker.dispose();
    });
    this._log(`+ Enabled hold-mode for ${commandId}.`);
    return this._keybindingHoldMode.p;
  }
  _resetKeybindingHoldMode() {
    if (this._keybindingHoldMode) {
      this._keybindingHoldMode?.complete();
      this._keybindingHoldMode = null;
    }
  }
  customKeybindingsCount() {
    return this.userKeybindings.keybindings.length;
  }
  updateResolver() {
    this._cachedResolver = null;
    this._onDidUpdateKeybindings.fire();
  }
  _getResolver() {
    if (!this._cachedResolver) {
      const defaults = this._resolveKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
      const overrides = this._resolveUserKeybindingItems(this.userKeybindings.keybindings, false);
      this._cachedResolver = new KeybindingResolver(defaults, overrides, (str) => this._log(str));
    }
    return this._cachedResolver;
  }
  _documentHasFocus() {
    return this.hostService.hasFocus;
  }
  _resolveKeybindingItems(items, isDefault) {
    const result = [];
    let resultLen = 0;
    for (const item of items) {
      const when = item.when || void 0;
      const keybinding = item.keybinding;
      if (!keybinding) {
        result[resultLen++] = new ResolvedKeybindingItem(void 0, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
      } else {
        if (this._assertBrowserConflicts(keybinding)) {
          continue;
        }
        const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(keybinding);
        for (let i2 = resolvedKeybindings.length - 1; i2 >= 0; i2--) {
          const resolvedKeybinding = resolvedKeybindings[i2];
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, item.extensionId, item.isBuiltinExtension);
        }
      }
    }
    return result;
  }
  _resolveUserKeybindingItems(items, isDefault) {
    const result = [];
    let resultLen = 0;
    for (const item of items) {
      const when = item.when || void 0;
      if (!item.keybinding) {
        result[resultLen++] = new ResolvedKeybindingItem(void 0, item.command, item.commandArgs, when, isDefault, null, false, item.systemWide);
      } else {
        const resolvedKeybindings = this._keyboardMapper.resolveKeybinding(item.keybinding);
        for (const resolvedKeybinding of resolvedKeybindings) {
          result[resultLen++] = new ResolvedKeybindingItem(resolvedKeybinding, item.command, item.commandArgs, when, isDefault, null, false, item.systemWide);
        }
      }
    }
    return result;
  }
  _assertBrowserConflicts(keybinding) {
    if (BrowserFeatures.keyboard === 0 /* Always */) {
      return false;
    }
    if (BrowserFeatures.keyboard === 1 /* FullScreen */ && isFullscreen(mainWindow)) {
      return false;
    }
    for (const chord of keybinding.chords) {
      if (!chord.metaKey && !chord.altKey && !chord.ctrlKey && !chord.shiftKey) {
        continue;
      }
      const modifiersMask = 2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */;
      let partModifiersMask = 0;
      if (chord.metaKey) {
        partModifiersMask |= 2048 /* CtrlCmd */;
      }
      if (chord.shiftKey) {
        partModifiersMask |= 1024 /* Shift */;
      }
      if (chord.altKey) {
        partModifiersMask |= 512 /* Alt */;
      }
      if (chord.ctrlKey && OS === 2 /* Macintosh */) {
        partModifiersMask |= 256 /* WinCtrl */;
      }
      if ((partModifiersMask & modifiersMask) === (2048 /* CtrlCmd */ | 512 /* Alt */)) {
        if (chord instanceof ScanCodeChord && (chord.scanCode === 86 /* ArrowLeft */ || chord.scanCode === 85 /* ArrowRight */)) {
          return true;
        }
        if (chord instanceof KeyCodeChord && (chord.keyCode === 15 /* LeftArrow */ || chord.keyCode === 17 /* RightArrow */)) {
          return true;
        }
      }
      if ((partModifiersMask & modifiersMask) === 2048 /* CtrlCmd */) {
        if (chord instanceof ScanCodeChord && (chord.scanCode >= 36 /* Digit1 */ && chord.scanCode <= 45 /* Digit0 */)) {
          return true;
        }
        if (chord instanceof KeyCodeChord && (chord.keyCode >= 21 /* Digit0 */ && chord.keyCode <= 30 /* Digit9 */)) {
          return true;
        }
      }
    }
    return false;
  }
  resolveKeybinding(kb) {
    return this._keyboardMapper.resolveKeybinding(kb);
  }
  resolveKeyboardEvent(keyboardEvent) {
    this.keyboardLayoutService.validateCurrentKeyboardMapping(keyboardEvent);
    return this._keyboardMapper.resolveKeyboardEvent(keyboardEvent);
  }
  resolveUserBinding(userBinding) {
    const keybinding = KeybindingParser.parseKeybinding(userBinding);
    return keybinding ? this._keyboardMapper.resolveKeybinding(keybinding) : [];
  }
  _handleKeybindingsExtensionPointUser(extensionId, isBuiltin, keybindings, collector, result) {
    if (Array.isArray(keybindings)) {
      for (let i2 = 0, len = keybindings.length; i2 < len; i2++) {
        this._handleKeybinding(extensionId, isBuiltin, i2 + 1, keybindings[i2], collector, result);
      }
    } else {
      this._handleKeybinding(extensionId, isBuiltin, 1, keybindings, collector, result);
    }
  }
  _handleKeybinding(extensionId, isBuiltin, idx, keybindings, collector, result) {
    const rejects = [];
    if (isValidContributedKeyBinding(keybindings, rejects)) {
      const rule = this._asCommandRule(extensionId, isBuiltin, idx++, keybindings);
      if (rule) {
        result.push(rule);
      }
    }
    if (rejects.length > 0) {
      collector.error(localize(
        23176,
        null,
        keybindingsExtPoint.name,
        rejects.join("\n")
      ));
    }
  }
  static bindToCurrentPlatform(key3, mac, linux, win) {
    if (OS === 1 /* Windows */ && win) {
      if (win) {
        return win;
      }
    } else if (OS === 2 /* Macintosh */) {
      if (mac) {
        return mac;
      }
    } else {
      if (linux) {
        return linux;
      }
    }
    return key3;
  }
  _asCommandRule(extensionId, isBuiltin, idx, binding) {
    const { command: command4, args: args2, when, key: key3, mac, linux, win } = binding;
    const keybinding = WorkbenchKeybindingService.bindToCurrentPlatform(key3, mac, linux, win);
    if (!keybinding) {
      return void 0;
    }
    let weight5;
    if (isBuiltin) {
      weight5 = 300 /* BuiltinExtension */ + idx;
    } else {
      weight5 = 400 /* ExternalExtension */ + idx;
    }
    const commandAction = MenuRegistry.getCommand(command4);
    const precondition2 = commandAction && commandAction.precondition;
    let fullWhen;
    if (when && precondition2) {
      fullWhen = ContextKeyExpr.and(precondition2, ContextKeyExpr.deserialize(when));
    } else if (when) {
      fullWhen = ContextKeyExpr.deserialize(when);
    } else if (precondition2) {
      fullWhen = precondition2;
    }
    const desc = {
      id: command4,
      args: args2,
      when: fullWhen,
      weight: weight5,
      keybinding: KeybindingParser.parseKeybinding(keybinding),
      extensionId: extensionId.value,
      isBuiltinExtension: isBuiltin
    };
    return desc;
  }
  getDefaultKeybindingsContent() {
    const resolver = this._getResolver();
    const defaultKeybindings = resolver.getDefaultKeybindings();
    const boundCommands = resolver.getDefaultBoundCommands();
    return WorkbenchKeybindingService._getDefaultKeybindings(defaultKeybindings) + "\n\n" + WorkbenchKeybindingService._getAllCommandsAsComment(boundCommands);
  }
  static _getDefaultKeybindings(defaultKeybindings) {
    const out = new OutputBuilder();
    out.writeLine("[");
    const lastIndex = defaultKeybindings.length - 1;
    defaultKeybindings.forEach((k, index2) => {
      KeybindingIO.writeKeybindingItem(out, k);
      if (index2 !== lastIndex) {
        out.writeLine(",");
      } else {
        out.writeLine();
      }
    });
    out.writeLine("]");
    return out.toString();
  }
  static _getAllCommandsAsComment(boundCommands) {
    const unboundCommands = getAllUnboundCommands(boundCommands);
    const pretty2 = unboundCommands.sort().join("\n// - ");
    return "// " + localize(23188, null) + "\n// - " + pretty2;
  }
  mightProducePrintableCharacter(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    const code = ScanCodeUtils.toEnum(event.code);
    if (NUMPAD_PRINTABLE_SCANCODES.indexOf(code) !== -1) {
      if (event.keyCode === IMMUTABLE_CODE_TO_KEY_CODE[code]) {
        return true;
      }
      if (isMacintosh && event.keyCode === otherMacNumpadMapping.get(code)) {
        return true;
      }
      return false;
    }
    const keycode = IMMUTABLE_CODE_TO_KEY_CODE[code];
    if (keycode !== -1) {
      return false;
    }
    const mapping2 = this.keyboardLayoutService.getRawKeyboardMapping();
    if (!mapping2) {
      return false;
    }
    const keyInfo = mapping2[event.code];
    if (!keyInfo) {
      return false;
    }
    if (!keyInfo.value || /\s/.test(keyInfo.value)) {
      return false;
    }
    return true;
  }
};

WorkbenchKeybindingService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IUserDataProfileService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IExtensionService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IUriIdentityService),
  __decorateParam(9, ILogService),
  __decorateParam(10, IKeyboardLayoutService)
], WorkbenchKeybindingService);

var UserKeybindings = class extends Disposable {
  constructor(userDataProfileService, uriIdentityService, fileService, logService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this._rawKeybindings = [];
    this._keybindings = [];
    this.watchDisposables = this._register(new DisposableStore());
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.watch();
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reload().then((changed) => {
      if (changed) {
        this._onDidChange.fire();
      }
    }), 50));
    this._register(Event2.filter(this.fileService.onDidFilesChange, (e) => e.contains(this.userDataProfileService.currentProfile.keybindingsResource))(() => {
      logService.debug("Keybindings file changed");
      this.reloadConfigurationScheduler.schedule();
    }));
    this._register(this.fileService.onDidRunOperation((e) => {
      if (e.operation === 4 /* WRITE */ && e.resource.toString() === this.userDataProfileService.currentProfile.keybindingsResource.toString()) {
        logService.debug("Keybindings file written");
        this.reloadConfigurationScheduler.schedule();
      }
    }));
    this._register(userDataProfileService.onDidChangeCurrentProfile((e) => {
      if (!this.uriIdentityService.extUri.isEqual(e.previous.keybindingsResource, e.profile.keybindingsResource)) {
        e.join(this.whenCurrentProfileChanged());
      }
    }));
  }
  get keybindings() {
    return this._keybindings;
  }
  async whenCurrentProfileChanged() {
    this.watch();
    this.reloadConfigurationScheduler.schedule();
  }
  watch() {
    this.watchDisposables.clear();
    this.watchDisposables.add(this.fileService.watch(dirname2(this.userDataProfileService.currentProfile.keybindingsResource)));
    this.watchDisposables.add(this.fileService.watch(this.userDataProfileService.currentProfile.keybindingsResource));
  }
  async initialize() {
    await this.reload();
  }
  async reload() {
    const newKeybindings = await this.readUserKeybindings();
    if (equals4(this._rawKeybindings, newKeybindings)) {
      return false;
    }
    this._rawKeybindings = newKeybindings;
    this._keybindings = this._rawKeybindings.map((k) => KeybindingIO.readUserKeybindingItem(k));
    return true;
  }
  async readUserKeybindings() {
    try {
      const content2 = await this.fileService.readFile(this.userDataProfileService.currentProfile.keybindingsResource);
      const value2 = parse5(content2.value.toString());
      return Array.isArray(value2) ? value2.filter(
        (v2) => v2 && typeof v2 === "object"
        /* just typeof === object doesn't catch `null` */
      ) : [];
    } catch (e) {
      return [];
    }
  }
};

var KeybindingsJsonSchema = class _KeybindingsJsonSchema {
  constructor() {
    this.commandsSchemas = [];
    this.commandsEnum = [];
    this.removalCommandsEnum = [];
    this.commandsEnumDescriptions = [];
    this.schema = {
      id: _KeybindingsJsonSchema.schemaId,
      type: "array",
      title: localize(23183, null),
      allowTrailingCommas: true,
      allowComments: true,
      definitions: {
        "editorGroupsSchema": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "groups": {
                "$ref": "#/definitions/editorGroupsSchema",
                "default": [{}, {}]
              },
              "size": {
                "type": "number",
                "default": 0.5
              }
            }
          }
        },
        "commandNames": {
          "type": "string",
          "enum": this.commandsEnum,
          "enumDescriptions": this.commandsEnumDescriptions,
          "description": localize(23179, null)
        },
        "commandType": {
          "anyOf": [
            // repetition of this clause here and below is intentional: one is for nice diagnostics & one is for code completion
            {
              $ref: "#/definitions/commandNames"
            },
            {
              "type": "string",
              "enum": this.removalCommandsEnum,
              "enumDescriptions": this.commandsEnumDescriptions,
              "description": localize(23181, null)
            },
            {
              "type": "string"
            }
          ]
        },
        "commandsSchemas": {
          "allOf": this.commandsSchemas
        }
      },
      items: {
        "required": ["key"],
        "type": "object",
        "defaultSnippets": [{ "body": { "key": "$1", "command": "$2", "when": "$3" } }],
        "properties": {
          "key": {
            "type": "string",
            "description": localize(23180, null)
          },
          "command": {
            "anyOf": [
              {
                "if": {
                  "type": "array"
                },
                "then": {
                  "not": {
                    "type": "array"
                  },
                  "errorMessage": localize(23177, null, "string")
                },
                "else": {
                  "$ref": "#/definitions/commandType"
                }
              },
              {
                "$ref": "#/definitions/commandType"
              }
            ]
          },
          "when": {
            "type": "string",
            "description": localize(23184, null)
          },
          "args": {
            "description": localize(23178, null)
          },
          "systemWide": {
            "type": "boolean",
            "default": false,
            "markdownDescription": localize(23182, null)
          }
        },
        "$ref": "#/definitions/commandsSchemas"
      }
    };
    this.schemaRegistry = Registry.as(Extensions3.JSONContribution);
    this.schemaRegistry.registerSchema(_KeybindingsJsonSchema.schemaId, this.schema);
  }
  static {
    this.schemaId = "vscode://schemas/keybindings";
  }
  // TODO@ulugbekna: can updates happen incrementally rather than rebuilding; concerns:
  // - is just appending additional schemas enough for the registry to pick them up?
  // - can `CommandsRegistry.getCommands` and `MenuRegistry.getCommands` return different values at different times? ie would just pushing new schemas from `additionalContributions` not be enough?
  updateSchema(additionalContributions) {
    this.commandsSchemas.length = 0;
    this.commandsEnum.length = 0;
    this.removalCommandsEnum.length = 0;
    this.commandsEnumDescriptions.length = 0;
    const knownCommands = /* @__PURE__ */ new Set();
    const addKnownCommand = (commandId, description) => {
      if (!/^_/.test(commandId)) {
        if (!knownCommands.has(commandId)) {
          knownCommands.add(commandId);
          this.commandsEnum.push(commandId);
          this.commandsEnumDescriptions.push(
            description === void 0 ? "" : isLocalizedString(description) ? description.value : description
          );
          this.removalCommandsEnum.push(`-${commandId}`);
        }
      }
    };
    const allCommands = CommandsRegistry.getCommands();
    for (const [commandId, command4] of allCommands) {
      const commandMetadata = command4.metadata;
      addKnownCommand(commandId, commandMetadata?.description ?? MenuRegistry.getCommand(commandId)?.title);
      if (!commandMetadata || !commandMetadata.args || commandMetadata.args.length !== 1 || !commandMetadata.args[0].schema) {
        continue;
      }
      const argsSchema2 = commandMetadata.args[0].schema;
      const argsRequired = typeof commandMetadata.args[0].isOptional !== "undefined" ? !commandMetadata.args[0].isOptional : Array.isArray(argsSchema2.required) && argsSchema2.required.length > 0;
      const addition = {
        "if": {
          "required": ["command"],
          "properties": {
            "command": { "const": commandId }
          }
        },
        "then": {
          "required": [].concat(argsRequired ? ["args"] : []),
          "properties": {
            "args": argsSchema2
          }
        }
      };
      this.commandsSchemas.push(addition);
    }
    const menuCommands = MenuRegistry.getCommands();
    for (const commandId of menuCommands.keys()) {
      addKnownCommand(commandId);
    }
    this.commandsSchemas.push(...additionalContributions);
    this.schemaRegistry.notifySchemaChanged(_KeybindingsJsonSchema.schemaId);
  }
};

registerSingleton(IKeybindingService, WorkbenchKeybindingService, 0 /* Eager */);
export { isValidContributedKeyBinding, keybindingType, keybindingsExtPoint, NUMPAD_PRINTABLE_SCANCODES, otherMacNumpadMapping, WorkbenchKeybindingService, UserKeybindings, KeybindingsJsonSchema };
