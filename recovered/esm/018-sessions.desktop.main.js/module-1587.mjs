// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/browser/keybindingsEditorModel.ts
import { localize } from "./module-0001.mjs";
import { matchesBaseContiguousSubString, matchesCamelCase, matchesContiguousSubString, matchesWords, or } from "./module-0453.mjs";
import { EditorModel } from "./module-1097.mjs";
import { AriaLabelProvider, UILabelProvider, UserSettingsLabelProvider } from "./module-0504.mjs";
import { isEmptyObject, isString } from "./module-0010.mjs";
import { ExtensionIdentifier, ExtensionIdentifierMap } from "./module-0688.mjs";
import { ResolvedKeybindingItem } from "./module-1585.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { coalesce, distinct } from "./module-0007.mjs";
import { getAllUnboundCommands } from "./module-1586.mjs";
import { MenuRegistry } from "./module-0092.mjs";
import { Language } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { compareIgnoreCase, equalsIgnoreCase } from "./module-0030.mjs";


// src/vs/workbench/services/preferences/browser/keybindingsEditorModel.ts
var KEYBINDING_ENTRY_TEMPLATE_ID = "keybinding.entry.template";

var SOURCE_SYSTEM = localize(23278, null);

var SOURCE_EXTENSION = localize(23279, null);

var SOURCE_USER = localize(23282, null);

function createKeybindingCommandQuery(commandId, when) {
  const whenPart = when ? ` +when:${when}` : "";
  return `@command:${commandId}${whenPart}`;
}

var wordFilter = or(matchesBaseContiguousSubString, matchesWords);

var COMMAND_REGEX = /@command:\s*([^\+]+)/i;

var WHEN_REGEX = /\+when:\s*(.+)/i;

var SOURCE_REGEX = /@source:\s*(user|default|system|extension)/i;

var EXTENSION_REGEX = /@ext:\s*((".+")|([^\s]+))/i;

var KEYBINDING_REGEX = /@keybinding:\s*((\".+\")|(\S+))/i;

var KeybindingsEditorModel = class extends EditorModel {
  constructor(os, keybindingsService, extensionService) {
    super();
    this.keybindingsService = keybindingsService;
    this.extensionService = extensionService;
    this._keybindingItems = [];
    this._keybindingItemsSortedByPrecedence = [];
    this.modifierLabels = {
      ui: UILabelProvider.modifierLabels[os],
      aria: AriaLabelProvider.modifierLabels[os],
      user: UserSettingsLabelProvider.modifierLabels[os]
    };
  }
  fetch(searchValue, sortByPrecedence = false) {
    let keybindingItems = sortByPrecedence ? this._keybindingItemsSortedByPrecedence : this._keybindingItems;
    const commandIdMatches = COMMAND_REGEX.exec(searchValue);
    if (commandIdMatches && commandIdMatches[1]) {
      const command4 = commandIdMatches[1].trim();
      let filteredKeybindingItems = keybindingItems.filter((k) => k.command === command4);
      if (filteredKeybindingItems.length) {
        const whenMatches = WHEN_REGEX.exec(searchValue);
        if (whenMatches && whenMatches[1]) {
          const whenValue = whenMatches[1].trim();
          filteredKeybindingItems = this.filterByWhen(filteredKeybindingItems, command4, whenValue);
        }
      }
      return filteredKeybindingItems.map((keybindingItem) => ({ id: KeybindingsEditorModel.getId(keybindingItem), keybindingItem, templateId: KEYBINDING_ENTRY_TEMPLATE_ID }));
    }
    if (SOURCE_REGEX.test(searchValue)) {
      keybindingItems = this.filterBySource(keybindingItems, searchValue);
      searchValue = searchValue.replace(SOURCE_REGEX, "");
    } else {
      const extensionMatches = EXTENSION_REGEX.exec(searchValue);
      if (extensionMatches && (extensionMatches[2] || extensionMatches[3])) {
        const extensionId = extensionMatches[2] ? extensionMatches[2].substring(1, extensionMatches[2].length - 1) : extensionMatches[3];
        keybindingItems = this.filterByExtension(keybindingItems, extensionId);
        searchValue = searchValue.replace(EXTENSION_REGEX, "");
      } else {
        const keybindingMatches = KEYBINDING_REGEX.exec(searchValue);
        if (keybindingMatches && (keybindingMatches[2] || keybindingMatches[3])) {
          searchValue = keybindingMatches[2] || `"${keybindingMatches[3]}"`;
        }
      }
    }
    searchValue = searchValue.trim();
    if (!searchValue) {
      return keybindingItems.map((keybindingItem) => ({ id: KeybindingsEditorModel.getId(keybindingItem), keybindingItem, templateId: KEYBINDING_ENTRY_TEMPLATE_ID }));
    }
    return this.filterByText(keybindingItems, searchValue);
  }
  filterBySource(keybindingItems, searchValue) {
    if (/@source:\s*default/i.test(searchValue) || /@source:\s*system/i.test(searchValue)) {
      return keybindingItems.filter((k) => k.source === SOURCE_SYSTEM);
    }
    if (/@source:\s*user/i.test(searchValue)) {
      return keybindingItems.filter((k) => k.source === SOURCE_USER);
    }
    if (/@source:\s*extension/i.test(searchValue)) {
      return keybindingItems.filter((k) => !isString(k.source) || k.source === SOURCE_EXTENSION);
    }
    return keybindingItems;
  }
  filterByExtension(keybindingItems, extension) {
    extension = extension.toLowerCase().trim();
    return keybindingItems.filter((k) => !isString(k.source) && (ExtensionIdentifier.equals(k.source.identifier, extension) || k.source.displayName?.toLowerCase() === extension.toLowerCase()));
  }
  filterByText(keybindingItems, searchValue) {
    const quoteAtFirstChar = searchValue.charAt(0) === '"';
    const quoteAtLastChar = searchValue.charAt(searchValue.length - 1) === '"';
    const completeMatch = quoteAtFirstChar && quoteAtLastChar;
    if (quoteAtFirstChar) {
      searchValue = searchValue.substring(1);
    }
    if (quoteAtLastChar) {
      searchValue = searchValue.substring(0, searchValue.length - 1);
    }
    searchValue = searchValue.trim();
    const result = [];
    const words = searchValue.split(" ");
    const keybindingWords = this.splitKeybindingWords(words);
    for (const keybindingItem of keybindingItems) {
      const keybindingMatches = new KeybindingItemMatches(this.modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch);
      if (keybindingMatches.commandIdMatches || keybindingMatches.commandLabelMatches || keybindingMatches.commandDefaultLabelMatches || keybindingMatches.sourceMatches || keybindingMatches.whenMatches || keybindingMatches.keybindingMatches || keybindingMatches.extensionIdMatches || keybindingMatches.extensionLabelMatches) {
        result.push({
          id: KeybindingsEditorModel.getId(keybindingItem),
          templateId: KEYBINDING_ENTRY_TEMPLATE_ID,
          commandLabelMatches: keybindingMatches.commandLabelMatches || void 0,
          commandDefaultLabelMatches: keybindingMatches.commandDefaultLabelMatches || void 0,
          keybindingItem,
          keybindingMatches: keybindingMatches.keybindingMatches || void 0,
          commandIdMatches: keybindingMatches.commandIdMatches || void 0,
          sourceMatches: keybindingMatches.sourceMatches || void 0,
          whenMatches: keybindingMatches.whenMatches || void 0,
          extensionIdMatches: keybindingMatches.extensionIdMatches || void 0,
          extensionLabelMatches: keybindingMatches.extensionLabelMatches || void 0
        });
      }
    }
    return result;
  }
  filterByWhen(keybindingItems, command4, when) {
    if (keybindingItems.length === 0) {
      return [];
    }
    const keybindingItemsWithWhen = keybindingItems.filter((k) => k.when === when);
    if (keybindingItemsWithWhen.length) {
      return keybindingItemsWithWhen;
    }
    const commandLabel = keybindingItems[0].commandLabel;
    const keybindingItem = new ResolvedKeybindingItem(void 0, command4, null, ContextKeyExpr.deserialize(when), false, null, false);
    const actionLabels = /* @__PURE__ */ new Map([[command4, commandLabel]]);
    return [KeybindingsEditorModel.toKeybindingEntry(command4, keybindingItem, actionLabels, this.getExtensionsMapping())];
  }
  splitKeybindingWords(wordsSeparatedBySpaces) {
    const result = [];
    for (const word of wordsSeparatedBySpaces) {
      result.push(...coalesce(word.split("+")));
    }
    return result;
  }
  async resolve(actionLabels = /* @__PURE__ */ new Map()) {
    const extensions = this.getExtensionsMapping();
    this._keybindingItemsSortedByPrecedence = [];
    const boundCommands = /* @__PURE__ */ new Map();
    for (const keybinding of this.keybindingsService.getKeybindings()) {
      if (keybinding.command) {
        this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel.toKeybindingEntry(keybinding.command, keybinding, actionLabels, extensions));
        boundCommands.set(keybinding.command, true);
      }
    }
    const commandsWithDefaultKeybindings = this.keybindingsService.getDefaultKeybindings().map((keybinding) => keybinding.command);
    for (const command4 of getAllUnboundCommands(boundCommands)) {
      const keybindingItem = new ResolvedKeybindingItem(void 0, command4, null, void 0, commandsWithDefaultKeybindings.indexOf(command4) === -1, null, false);
      this._keybindingItemsSortedByPrecedence.push(KeybindingsEditorModel.toKeybindingEntry(command4, keybindingItem, actionLabels, extensions));
    }
    this._keybindingItemsSortedByPrecedence = distinct(this._keybindingItemsSortedByPrecedence, (keybindingItem) => KeybindingsEditorModel.getId(keybindingItem));
    this._keybindingItems = this._keybindingItemsSortedByPrecedence.slice(0).sort((a, b) => KeybindingsEditorModel.compareKeybindingData(a, b));
    return super.resolve();
  }
  static getId(keybindingItem) {
    return keybindingItem.command + (keybindingItem?.keybinding?.getAriaLabel() ?? "") + keybindingItem.when + (isString(keybindingItem.source) ? keybindingItem.source : keybindingItem.source.identifier.value);
  }
  getExtensionsMapping() {
    const extensions = new ExtensionIdentifierMap();
    for (const extension of this.extensionService.extensions) {
      extensions.set(extension.identifier, extension);
    }
    return extensions;
  }
  static compareKeybindingData(a, b) {
    if (a.keybinding && !b.keybinding) {
      return -1;
    }
    if (b.keybinding && !a.keybinding) {
      return 1;
    }
    if (a.commandLabel && !b.commandLabel) {
      return -1;
    }
    if (b.commandLabel && !a.commandLabel) {
      return 1;
    }
    if (a.commandLabel && b.commandLabel) {
      if (a.commandLabel !== b.commandLabel) {
        return a.commandLabel.localeCompare(b.commandLabel);
      }
    }
    if (a.command === b.command) {
      return a.keybindingItem.isDefault ? 1 : -1;
    }
    return a.command.localeCompare(b.command);
  }
  static toKeybindingEntry(command4, keybindingItem, actions, extensions) {
    const menuCommand = MenuRegistry.getCommand(command4);
    const editorActionLabel = actions.get(command4);
    let source = SOURCE_USER;
    if (keybindingItem.isDefault) {
      const extensionId = keybindingItem.extensionId ?? (keybindingItem.resolvedKeybinding ? void 0 : menuCommand?.source?.id);
      source = extensionId ? extensions.get(extensionId) ?? SOURCE_EXTENSION : SOURCE_SYSTEM;
    }
    return {
      keybinding: keybindingItem.resolvedKeybinding,
      keybindingItem,
      command: command4,
      commandLabel: KeybindingsEditorModel.getCommandLabel(menuCommand, editorActionLabel),
      commandDefaultLabel: KeybindingsEditorModel.getCommandDefaultLabel(menuCommand),
      when: keybindingItem.when ? keybindingItem.when.serialize() : "",
      source
    };
  }
  static getCommandDefaultLabel(menuCommand) {
    if (!Language.isDefaultVariant()) {
      if (menuCommand && menuCommand.title && menuCommand.title.original) {
        const category9 = menuCommand.category ? menuCommand.category.original : void 0;
        const title = menuCommand.title.original;
        return category9 ? localize(23277, null, category9, title) : title;
      }
    }
    return null;
  }
  static getCommandLabel(menuCommand, editorActionLabel) {
    if (menuCommand) {
      const category9 = menuCommand.category ? typeof menuCommand.category === "string" ? menuCommand.category : menuCommand.category.value : void 0;
      const title = typeof menuCommand.title === "string" ? menuCommand.title : menuCommand.title.value;
      return category9 ? localize(23277, null, category9, title) : title;
    }
    if (editorActionLabel) {
      return editorActionLabel;
    }
    return "";
  }
};

KeybindingsEditorModel = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IExtensionService)
], KeybindingsEditorModel);

var KeybindingItemMatches = class {
  constructor(modifierLabels, keybindingItem, searchValue, words, keybindingWords, completeMatch) {
    this.modifierLabels = modifierLabels;
    this.commandIdMatches = null;
    this.commandLabelMatches = null;
    this.commandDefaultLabelMatches = null;
    this.sourceMatches = null;
    this.whenMatches = null;
    this.keybindingMatches = null;
    this.extensionIdMatches = null;
    this.extensionLabelMatches = null;
    if (!completeMatch) {
      this.commandIdMatches = this.matches(searchValue, keybindingItem.command, or(matchesWords, matchesCamelCase), words);
      this.commandLabelMatches = keybindingItem.commandLabel ? this.matches(searchValue, keybindingItem.commandLabel, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.commandLabel, true), words) : null;
      this.commandDefaultLabelMatches = keybindingItem.commandDefaultLabel ? this.matches(searchValue, keybindingItem.commandDefaultLabel, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.commandDefaultLabel, true), words) : null;
      this.whenMatches = keybindingItem.when ? this.matches(null, keybindingItem.when, or(matchesWords, matchesCamelCase), words) : null;
      if (isString(keybindingItem.source)) {
        this.sourceMatches = this.matches(searchValue, keybindingItem.source, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.source, true), words);
      } else {
        this.extensionLabelMatches = keybindingItem.source.displayName ? this.matches(searchValue, keybindingItem.source.displayName, (word, wordToMatchAgainst) => matchesWords(word, keybindingItem.commandLabel, true), words) : null;
      }
    }
    this.keybindingMatches = keybindingItem.keybinding ? this.matchesKeybinding(keybindingItem.keybinding, searchValue, keybindingWords, completeMatch) : null;
  }
  matches(searchValue, wordToMatchAgainst, wordMatchesFilter, words) {
    let matches2 = searchValue ? wordFilter(searchValue, wordToMatchAgainst) : null;
    if (!matches2) {
      matches2 = this.matchesWords(words, wordToMatchAgainst, wordMatchesFilter);
    }
    if (matches2) {
      matches2 = this.filterAndSort(matches2);
    }
    return matches2;
  }
  matchesWords(words, wordToMatchAgainst, wordMatchesFilter) {
    let matches2 = [];
    for (const word of words) {
      const wordMatches = wordMatchesFilter(word, wordToMatchAgainst);
      if (wordMatches) {
        matches2 = [...matches2 || [], ...wordMatches];
      } else {
        matches2 = null;
        break;
      }
    }
    return matches2;
  }
  filterAndSort(matches2) {
    return distinct(matches2, ((a) => a.start + "." + a.end)).filter((match2) => !matches2.some((m) => !(m.start === match2.start && m.end === match2.end) && (m.start <= match2.start && m.end >= match2.end))).sort((a, b) => a.start - b.start);
  }
  matchesKeybinding(keybinding, searchValue, words, completeMatch) {
    const [firstPart, chordPart] = keybinding.getChords();
    const userSettingsLabel = keybinding.getUserSettingsLabel();
    const ariaLabel = keybinding.getAriaLabel();
    const label3 = keybinding.getLabel();
    if (userSettingsLabel && compareIgnoreCase(searchValue, userSettingsLabel) === 0 || ariaLabel && compareIgnoreCase(searchValue, ariaLabel) === 0 || label3 && compareIgnoreCase(searchValue, label3) === 0) {
      return {
        firstPart: this.createCompleteMatch(firstPart),
        chordPart: this.createCompleteMatch(chordPart)
      };
    }
    const firstPartMatch = {};
    let chordPartMatch = {};
    const matchedWords = [];
    const firstPartMatchedWords = [];
    let chordPartMatchedWords = [];
    let matchFirstPart = true;
    for (let index2 = 0; index2 < words.length; index2++) {
      const word = words[index2];
      let firstPartMatched = false;
      let chordPartMatched = false;
      matchFirstPart = matchFirstPart && !firstPartMatch.keyCode;
      let matchChordPart = !chordPartMatch.keyCode;
      if (matchFirstPart) {
        firstPartMatched = this.matchPart(firstPart, firstPartMatch, word, completeMatch);
        if (firstPartMatch.keyCode) {
          for (const cordPartMatchedWordIndex of chordPartMatchedWords) {
            if (firstPartMatchedWords.indexOf(cordPartMatchedWordIndex) === -1) {
              matchedWords.splice(matchedWords.indexOf(cordPartMatchedWordIndex), 1);
            }
          }
          chordPartMatch = {};
          chordPartMatchedWords = [];
          matchChordPart = false;
        }
      }
      if (matchChordPart) {
        chordPartMatched = this.matchPart(chordPart, chordPartMatch, word, completeMatch);
      }
      if (firstPartMatched) {
        firstPartMatchedWords.push(index2);
      }
      if (chordPartMatched) {
        chordPartMatchedWords.push(index2);
      }
      if (firstPartMatched || chordPartMatched) {
        matchedWords.push(index2);
      }
      matchFirstPart = matchFirstPart && this.isModifier(word);
    }
    if (matchedWords.length !== words.length) {
      return null;
    }
    if (completeMatch) {
      if (!this.isCompleteMatch(firstPart, firstPartMatch)) {
        return null;
      }
      if (!isEmptyObject(chordPartMatch) && !this.isCompleteMatch(chordPart, chordPartMatch)) {
        return null;
      }
    }
    return this.hasAnyMatch(firstPartMatch) || this.hasAnyMatch(chordPartMatch) ? { firstPart: firstPartMatch, chordPart: chordPartMatch } : null;
  }
  matchPart(chord, match2, word, completeMatch) {
    let matched = false;
    if (this.matchesMetaModifier(chord, word)) {
      matched = true;
      match2.metaKey = true;
    }
    if (this.matchesCtrlModifier(chord, word)) {
      matched = true;
      match2.ctrlKey = true;
    }
    if (this.matchesShiftModifier(chord, word)) {
      matched = true;
      match2.shiftKey = true;
    }
    if (this.matchesAltModifier(chord, word)) {
      matched = true;
      match2.altKey = true;
    }
    if (this.matchesKeyCode(chord, word, completeMatch)) {
      match2.keyCode = true;
      matched = true;
    }
    return matched;
  }
  matchesKeyCode(chord, word, completeMatch) {
    if (!chord) {
      return false;
    }
    const ariaLabel = chord.keyAriaLabel || "";
    if (completeMatch || ariaLabel.length === 1 || word.length === 1) {
      if (compareIgnoreCase(ariaLabel, word) === 0) {
        return true;
      }
    } else {
      if (matchesContiguousSubString(word, ariaLabel)) {
        return true;
      }
    }
    return false;
  }
  matchesMetaModifier(chord, word) {
    if (!chord) {
      return false;
    }
    if (!chord.metaKey) {
      return false;
    }
    return this.wordMatchesMetaModifier(word);
  }
  matchesCtrlModifier(chord, word) {
    if (!chord) {
      return false;
    }
    if (!chord.ctrlKey) {
      return false;
    }
    return this.wordMatchesCtrlModifier(word);
  }
  matchesShiftModifier(chord, word) {
    if (!chord) {
      return false;
    }
    if (!chord.shiftKey) {
      return false;
    }
    return this.wordMatchesShiftModifier(word);
  }
  matchesAltModifier(chord, word) {
    if (!chord) {
      return false;
    }
    if (!chord.altKey) {
      return false;
    }
    return this.wordMatchesAltModifier(word);
  }
  hasAnyMatch(keybindingMatch) {
    return !!keybindingMatch.altKey || !!keybindingMatch.ctrlKey || !!keybindingMatch.metaKey || !!keybindingMatch.shiftKey || !!keybindingMatch.keyCode;
  }
  isCompleteMatch(chord, match2) {
    if (!chord) {
      return true;
    }
    if (!match2.keyCode) {
      return false;
    }
    if (chord.metaKey && !match2.metaKey) {
      return false;
    }
    if (chord.altKey && !match2.altKey) {
      return false;
    }
    if (chord.ctrlKey && !match2.ctrlKey) {
      return false;
    }
    if (chord.shiftKey && !match2.shiftKey) {
      return false;
    }
    return true;
  }
  createCompleteMatch(chord) {
    const match2 = {};
    if (chord) {
      match2.keyCode = true;
      if (chord.metaKey) {
        match2.metaKey = true;
      }
      if (chord.altKey) {
        match2.altKey = true;
      }
      if (chord.ctrlKey) {
        match2.ctrlKey = true;
      }
      if (chord.shiftKey) {
        match2.shiftKey = true;
      }
    }
    return match2;
  }
  isModifier(word) {
    if (this.wordMatchesAltModifier(word)) {
      return true;
    }
    if (this.wordMatchesCtrlModifier(word)) {
      return true;
    }
    if (this.wordMatchesMetaModifier(word)) {
      return true;
    }
    if (this.wordMatchesShiftModifier(word)) {
      return true;
    }
    return false;
  }
  wordMatchesAltModifier(word) {
    if (equalsIgnoreCase(this.modifierLabels.ui.altKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.aria.altKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.user.altKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(localize(23281, null), word)) {
      return true;
    }
    return false;
  }
  wordMatchesCtrlModifier(word) {
    if (equalsIgnoreCase(this.modifierLabels.ui.ctrlKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.aria.ctrlKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.user.ctrlKey, word)) {
      return true;
    }
    return false;
  }
  wordMatchesMetaModifier(word) {
    if (equalsIgnoreCase(this.modifierLabels.ui.metaKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.aria.metaKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.user.metaKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(localize(23280, null), word)) {
      return true;
    }
    return false;
  }
  wordMatchesShiftModifier(word) {
    if (equalsIgnoreCase(this.modifierLabels.ui.shiftKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.aria.shiftKey, word)) {
      return true;
    }
    if (equalsIgnoreCase(this.modifierLabels.user.shiftKey, word)) {
      return true;
    }
    return false;
  }
};
export { createKeybindingCommandQuery, KEYBINDING_ENTRY_TEMPLATE_ID, SOURCE_SYSTEM, SOURCE_EXTENSION, SOURCE_USER, wordFilter, COMMAND_REGEX, WHEN_REGEX, SOURCE_REGEX, EXTENSION_REGEX, KEYBINDING_REGEX, KeybindingsEditorModel, KeybindingItemMatches };
