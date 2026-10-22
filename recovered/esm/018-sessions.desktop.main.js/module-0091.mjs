// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/keybinding/common/keybindingsRegistry.ts
import { LinkedList } from "./module-0013.mjs";
import { OS } from "./module-0014.mjs";
import { DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { decodeKeybinding } from "./module-0021.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/platform/keybinding/common/keybindingsRegistry.ts
var KeybindingsRegistryImpl = class _KeybindingsRegistryImpl {
  constructor() {
    this._coreKeybindings = new LinkedList();
    this._coreKeybindingRules = new LinkedList();
    this._extensionKeybindings = [];
    this._cachedMergedKeybindings = null;
  }
  static bindToPlatform(kb, os) {
    if (os === 1 /* Windows */) {
      if (kb && kb.win) {
        return kb.win;
      }
    } else if (os === 2 /* Macintosh */) {
      if (kb && kb.mac) {
        return kb.mac;
      }
    } else {
      if (kb && kb.linux) {
        return kb.linux;
      }
    }
    return kb;
  }
  /**
   * Take current platform into account and reduce to primary & secondary.
   */
  static bindToCurrentPlatform(kb) {
    return _KeybindingsRegistryImpl.bindToPlatform(kb, OS);
  }
  registerKeybindingRule(rule) {
    const actualKb = _KeybindingsRegistryImpl.bindToCurrentPlatform(rule);
    const result = new DisposableStore();
    if (actualKb && actualKb.primary) {
      const kk = decodeKeybinding(actualKb.primary, OS);
      if (kk) {
        result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, 0, rule.when));
      }
    }
    if (actualKb && Array.isArray(actualKb.secondary)) {
      for (let i2 = 0, len = actualKb.secondary.length; i2 < len; i2++) {
        const k = actualKb.secondary[i2];
        const kk = decodeKeybinding(k, OS);
        if (kk) {
          result.add(this._registerDefaultKeybinding(kk, rule.id, rule.args, rule.weight, -i2 - 1, rule.when));
        }
      }
    }
    const removeRule = this._coreKeybindingRules.push(rule);
    result.add(toDisposable(() => {
      removeRule();
    }));
    return result;
  }
  setExtensionKeybindings(rules) {
    const result = [];
    let keybindingsLen = 0;
    for (const rule of rules) {
      if (rule.keybinding) {
        result[keybindingsLen++] = {
          keybinding: rule.keybinding,
          command: rule.id,
          commandArgs: rule.args,
          when: rule.when,
          weight1: rule.weight,
          weight2: 0,
          extensionId: rule.extensionId || null,
          isBuiltinExtension: rule.isBuiltinExtension || false
        };
      }
    }
    this._extensionKeybindings = result;
    this._cachedMergedKeybindings = null;
  }
  registerCommandAndKeybindingRule(desc) {
    return combinedDisposable(
      this.registerKeybindingRule(desc),
      CommandsRegistry.registerCommand(desc)
    );
  }
  _registerDefaultKeybinding(keybinding, commandId, commandArgs, weight1, weight22, when) {
    const remove2 = this._coreKeybindings.push({
      keybinding,
      command: commandId,
      commandArgs,
      when,
      weight1,
      weight2: weight22,
      extensionId: null,
      isBuiltinExtension: false
    });
    this._cachedMergedKeybindings = null;
    return toDisposable(() => {
      remove2();
      this._cachedMergedKeybindings = null;
    });
  }
  getDefaultKeybindings() {
    if (!this._cachedMergedKeybindings) {
      this._cachedMergedKeybindings = Array.from(this._coreKeybindings).concat(this._extensionKeybindings);
      this._cachedMergedKeybindings.sort(sorter);
    }
    return this._cachedMergedKeybindings.slice(0);
  }
  getDefaultKeybindingsForOS(os) {
    const result = [];
    for (const rule of this._coreKeybindingRules) {
      const actualKb = _KeybindingsRegistryImpl.bindToPlatform(rule, os);
      if (actualKb && actualKb.primary) {
        const kk = decodeKeybinding(actualKb.primary, os);
        if (kk) {
          result.push({
            keybinding: kk,
            command: rule.id,
            commandArgs: rule.args,
            when: rule.when,
            weight1: rule.weight,
            weight2: 0,
            extensionId: null,
            isBuiltinExtension: false
          });
        }
      }
      if (actualKb && Array.isArray(actualKb.secondary)) {
        for (let i2 = 0, len = actualKb.secondary.length; i2 < len; i2++) {
          const k = actualKb.secondary[i2];
          const kk = decodeKeybinding(k, os);
          if (kk) {
            result.push({
              keybinding: kk,
              command: rule.id,
              commandArgs: rule.args,
              when: rule.when,
              weight1: rule.weight,
              weight2: -i2 - 1,
              extensionId: null,
              isBuiltinExtension: false
            });
          }
        }
      }
    }
    result.sort(sorter);
    return result;
  }
};

var KeybindingsRegistry = new KeybindingsRegistryImpl();

var Extensions = {
  EditorModes: "platform.keybindingsRegistry"
};

Registry.add(Extensions.EditorModes, KeybindingsRegistry);

function sorter(a, b) {
  if (a.weight1 !== b.weight1) {
    return a.weight1 - b.weight1;
  }
  if (a.command && b.command) {
    if (a.command < b.command) {
      return -1;
    }
    if (a.command > b.command) {
      return 1;
    }
  }
  return a.weight2 - b.weight2;
}
export { sorter, KeybindingsRegistryImpl, KeybindingsRegistry, Extensions };
