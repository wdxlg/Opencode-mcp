// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/keybinding/common/keybindingResolver.ts
import { implies } from "./module-0089.mjs";


// src/vs/platform/keybinding/common/keybindingResolver.ts
var NoMatchingKb = { kind: 0 /* NoMatchingKb */ };

var MoreChordsNeeded = { kind: 1 /* MoreChordsNeeded */ };

function KbFound(commandId, commandArgs, isBubble) {
  return { kind: 2 /* KbFound */, commandId, commandArgs, isBubble };
}

var KeybindingResolver = class _KeybindingResolver {
  constructor(defaultKeybindings, overrides, log4) {
    this._log = log4;
    this._defaultKeybindings = defaultKeybindings;
    this._defaultBoundCommands = /* @__PURE__ */ new Map();
    for (const defaultKeybinding of defaultKeybindings) {
      const command4 = defaultKeybinding.command;
      if (command4 && command4.charAt(0) !== "-") {
        this._defaultBoundCommands.set(command4, true);
      }
    }
    this._map = /* @__PURE__ */ new Map();
    this._lookupMap = /* @__PURE__ */ new Map();
    this._keybindings = _KeybindingResolver.handleRemovals([].concat(defaultKeybindings).concat(overrides));
    for (let i2 = 0, len = this._keybindings.length; i2 < len; i2++) {
      const k = this._keybindings[i2];
      if (k.chords.length === 0) {
        continue;
      }
      const when = k.when?.substituteConstants();
      if (when && when.type === 0 /* False */) {
        continue;
      }
      this._addKeyPress(k.chords[0], k);
    }
  }
  static _isTargetedForRemoval(defaultKb, keypress, when) {
    if (keypress) {
      for (let i2 = 0; i2 < keypress.length; i2++) {
        if (keypress[i2] !== defaultKb.chords[i2]) {
          return false;
        }
      }
    }
    if (when && when.type !== 1 /* True */) {
      if (!defaultKb.when) {
        return false;
      }
      const defaultWhen = defaultKb.when.substituteConstants();
      const removalWhen = when.substituteConstants();
      if (!_KeybindingResolver.whenIsEntirelyIncluded(defaultWhen, removalWhen)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Looks for rules containing "-commandId" and removes them.
   */
  static handleRemovals(rules) {
    const removals = /* @__PURE__ */ new Map();
    for (let i2 = 0, len = rules.length; i2 < len; i2++) {
      const rule = rules[i2];
      if (rule.command && rule.command.charAt(0) === "-") {
        const command4 = rule.command.substring(1);
        if (!removals.has(command4)) {
          removals.set(command4, [rule]);
        } else {
          removals.get(command4).push(rule);
        }
      }
    }
    if (removals.size === 0) {
      return rules;
    }
    const result = [];
    for (let i2 = 0, len = rules.length; i2 < len; i2++) {
      const rule = rules[i2];
      if (!rule.command || rule.command.length === 0) {
        result.push(rule);
        continue;
      }
      if (rule.command.charAt(0) === "-") {
        continue;
      }
      const commandRemovals = removals.get(rule.command);
      if (!commandRemovals || !rule.isDefault) {
        result.push(rule);
        continue;
      }
      let isRemoved = false;
      for (const commandRemoval of commandRemovals) {
        const when = commandRemoval.when;
        if (this._isTargetedForRemoval(rule, commandRemoval.chords, when)) {
          isRemoved = true;
          break;
        }
      }
      if (!isRemoved) {
        result.push(rule);
        continue;
      }
    }
    return result;
  }
  _addKeyPress(keypress, item) {
    const conflicts = this._map.get(keypress);
    if (typeof conflicts === "undefined") {
      this._map.set(keypress, [item]);
      this._addToLookupMap(item);
      return;
    }
    for (let i2 = conflicts.length - 1; i2 >= 0; i2--) {
      const conflict = conflicts[i2];
      if (conflict.command === item.command) {
        continue;
      }
      let isShorterKbPrefix = true;
      for (let i3 = 1; i3 < conflict.chords.length && i3 < item.chords.length; i3++) {
        if (conflict.chords[i3] !== item.chords[i3]) {
          isShorterKbPrefix = false;
          break;
        }
      }
      if (!isShorterKbPrefix) {
        continue;
      }
      if (_KeybindingResolver.whenIsEntirelyIncluded(conflict.when, item.when)) {
        this._removeFromLookupMap(conflict);
      }
    }
    conflicts.push(item);
    this._addToLookupMap(item);
  }
  _addToLookupMap(item) {
    if (!item.command) {
      return;
    }
    let arr = this._lookupMap.get(item.command);
    if (typeof arr === "undefined") {
      arr = [item];
      this._lookupMap.set(item.command, arr);
    } else {
      arr.push(item);
    }
  }
  _removeFromLookupMap(item) {
    if (!item.command) {
      return;
    }
    const arr = this._lookupMap.get(item.command);
    if (typeof arr === "undefined") {
      return;
    }
    for (let i2 = 0, len = arr.length; i2 < len; i2++) {
      if (arr[i2] === item) {
        arr.splice(i2, 1);
        return;
      }
    }
  }
  /**
   * Returns true if it is provable `a` implies `b`.
   */
  static whenIsEntirelyIncluded(a, b) {
    if (!b || b.type === 1 /* True */) {
      return true;
    }
    if (!a || a.type === 1 /* True */) {
      return false;
    }
    return implies(a, b);
  }
  getDefaultBoundCommands() {
    return this._defaultBoundCommands;
  }
  getDefaultKeybindings() {
    return this._defaultKeybindings;
  }
  getKeybindings() {
    return this._keybindings;
  }
  lookupKeybindings(commandId) {
    const items = this._lookupMap.get(commandId);
    if (typeof items === "undefined" || items.length === 0) {
      return [];
    }
    const result = [];
    let resultLen = 0;
    for (let i2 = items.length - 1; i2 >= 0; i2--) {
      result[resultLen++] = items[i2];
    }
    return result;
  }
  lookupPrimaryKeybinding(commandId, context2, enforceContextCheck = false) {
    const items = this._lookupMap.get(commandId);
    if (typeof items === "undefined" || items.length === 0) {
      return null;
    }
    if (items.length === 1 && !enforceContextCheck) {
      return items[0];
    }
    for (let i2 = items.length - 1; i2 >= 0; i2--) {
      const item = items[i2];
      if (context2.contextMatchesRules(item.when)) {
        return item;
      }
    }
    if (enforceContextCheck) {
      return null;
    }
    return items[items.length - 1];
  }
  /**
   * Looks up a keybinding trigged as a result of pressing a sequence of chords - `[...currentChords, keypress]`
   *
   * Example: resolving 3 chords pressed sequentially - `cmd+k cmd+p cmd+i`:
   * 	`currentChords = [ 'cmd+k' , 'cmd+p' ]` and `keypress = `cmd+i` - last pressed chord
   */
  resolve(context2, currentChords, keypress) {
    const pressedChords = [...currentChords, keypress];
    this._log(`| Resolving ${pressedChords}`);
    const kbCandidates = this._map.get(pressedChords[0]);
    if (kbCandidates === void 0) {
      this._log(`\\ No keybinding entries.`);
      return NoMatchingKb;
    }
    let lookupMap = null;
    if (pressedChords.length < 2) {
      lookupMap = kbCandidates;
    } else {
      lookupMap = [];
      for (let i2 = 0, len = kbCandidates.length; i2 < len; i2++) {
        const candidate = kbCandidates[i2];
        if (pressedChords.length > candidate.chords.length) {
          continue;
        }
        let prefixMatches = true;
        for (let i3 = 1; i3 < pressedChords.length; i3++) {
          if (candidate.chords[i3] !== pressedChords[i3]) {
            prefixMatches = false;
            break;
          }
        }
        if (prefixMatches) {
          lookupMap.push(candidate);
        }
      }
    }
    const result = this._findCommand(context2, lookupMap);
    if (!result) {
      this._log(`\\ From ${lookupMap.length} keybinding entries, no when clauses matched the context.`);
      return NoMatchingKb;
    }
    if (pressedChords.length < result.chords.length) {
      this._log(`\\ From ${lookupMap.length} keybinding entries, awaiting ${result.chords.length - pressedChords.length} more chord(s), when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
      return MoreChordsNeeded;
    }
    this._log(`\\ From ${lookupMap.length} keybinding entries, matched ${result.command}, when: ${printWhenExplanation(result.when)}, source: ${printSourceExplanation(result)}.`);
    return KbFound(result.command, result.commandArgs, result.bubble);
  }
  _findCommand(context2, matches2) {
    for (let i2 = matches2.length - 1; i2 >= 0; i2--) {
      const k = matches2[i2];
      if (!_KeybindingResolver._contextMatchesRules(context2, k.when)) {
        continue;
      }
      return k;
    }
    return null;
  }
  static _contextMatchesRules(context2, rules) {
    if (!rules) {
      return true;
    }
    return rules.evaluate(context2);
  }
};

function printWhenExplanation(when) {
  if (!when) {
    return `no when condition`;
  }
  return `${when.serialize()}`;
}

function printSourceExplanation(kb) {
  return kb.extensionId ? kb.isBuiltinExtension ? `built-in extension ${kb.extensionId}` : `user extension ${kb.extensionId}` : kb.isDefault ? `built-in` : `user`;
}
export { KbFound, printWhenExplanation, printSourceExplanation, NoMatchingKb, MoreChordsNeeded, KeybindingResolver };
