// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/keybinding/common/resolvedKeybindingItem.ts



// src/vs/platform/keybinding/common/resolvedKeybindingItem.ts
var ResolvedKeybindingItem = class {
  constructor(resolvedKeybinding, command4, commandArgs, when, isDefault, extensionId, isBuiltinExtension, systemWide = false) {
    this._resolvedKeybindingItemBrand = void 0;
    this.resolvedKeybinding = resolvedKeybinding;
    this.chords = resolvedKeybinding ? toEmptyArrayIfContainsNull(resolvedKeybinding.getDispatchChords()) : [];
    if (resolvedKeybinding && this.chords.length === 0) {
      this.chords = toEmptyArrayIfContainsNull(resolvedKeybinding.getSingleModifierDispatchChords());
    }
    this.bubble = command4 ? command4.charCodeAt(0) === 94 /* Caret */ : false;
    this.command = this.bubble ? command4.substr(1) : command4;
    this.commandArgs = commandArgs;
    this.when = when;
    this.isDefault = isDefault;
    this.extensionId = extensionId;
    this.isBuiltinExtension = isBuiltinExtension;
    this.systemWide = systemWide;
  }
};

function toEmptyArrayIfContainsNull(arr) {
  const result = [];
  for (let i2 = 0, len = arr.length; i2 < len; i2++) {
    const element = arr[i2];
    if (!element) {
      return [];
    }
    result.push(element);
  }
  return result;
}
export { toEmptyArrayIfContainsNull, ResolvedKeybindingItem };
