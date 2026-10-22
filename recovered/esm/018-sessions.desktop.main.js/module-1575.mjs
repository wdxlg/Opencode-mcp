// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/common/keybindingEditing.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Queue } from "./module-0036.mjs";
import { parse5 } from "./module-0885.mjs";
import { setProperty } from "./module-1377.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { equals4 } from "./module-0098.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Selection } from "./module-0107.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/keybinding/common/keybindingEditing.ts
var IKeybindingEditingService = createDecorator("keybindingEditingService");

var KeybindingsEditingService = class extends Disposable {
  constructor(textModelResolverService, textFileService, fileService, userDataProfileService) {
    super();
    this.textModelResolverService = textModelResolverService;
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.userDataProfileService = userDataProfileService;
    this.queue = new Queue();
  }
  addKeybinding(keybindingItem, key3, when) {
    return this.queue.queue(() => this.doEditKeybinding(keybindingItem, key3, when, true));
  }
  editKeybinding(keybindingItem, key3, when) {
    return this.queue.queue(() => this.doEditKeybinding(keybindingItem, key3, when, false));
  }
  resetKeybinding(keybindingItem) {
    return this.queue.queue(() => this.doResetKeybinding(keybindingItem));
  }
  removeKeybinding(keybindingItem) {
    return this.queue.queue(() => this.doRemoveKeybinding(keybindingItem));
  }
  async doEditKeybinding(keybindingItem, key3, when, add) {
    const reference = await this.resolveAndValidate();
    const model = reference.object.textEditorModel;
    if (add) {
      this.updateKeybinding(keybindingItem, key3, when, model, -1);
    } else {
      const userKeybindingEntries = parse5(model.getValue());
      const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries);
      this.updateKeybinding(keybindingItem, key3, when, model, userKeybindingEntryIndex);
      if (keybindingItem.isDefault && keybindingItem.resolvedKeybinding) {
        this.removeDefaultKeybinding(keybindingItem, model);
      }
    }
    try {
      await this.save();
    } finally {
      reference.dispose();
    }
  }
  async doRemoveKeybinding(keybindingItem) {
    const reference = await this.resolveAndValidate();
    const model = reference.object.textEditorModel;
    if (keybindingItem.isDefault) {
      this.removeDefaultKeybinding(keybindingItem, model);
    } else {
      this.removeUserKeybinding(keybindingItem, model);
    }
    try {
      return await this.save();
    } finally {
      reference.dispose();
    }
  }
  async doResetKeybinding(keybindingItem) {
    const reference = await this.resolveAndValidate();
    const model = reference.object.textEditorModel;
    if (!keybindingItem.isDefault) {
      this.removeUserKeybinding(keybindingItem, model);
      this.removeUnassignedDefaultKeybinding(keybindingItem, model);
    }
    try {
      return await this.save();
    } finally {
      reference.dispose();
    }
  }
  save() {
    return this.textFileService.save(this.userDataProfileService.currentProfile.keybindingsResource);
  }
  updateKeybinding(keybindingItem, newKey, when, model, userKeybindingEntryIndex) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    if (userKeybindingEntryIndex !== -1) {
      this.applyEditsToBuffer(setProperty(model.getValue(), [userKeybindingEntryIndex, "key"], newKey, { tabSize, insertSpaces, eol })[0], model);
      const edits = setProperty(model.getValue(), [userKeybindingEntryIndex, "when"], when, { tabSize, insertSpaces, eol });
      if (edits.length > 0) {
        this.applyEditsToBuffer(edits[0], model);
      }
    } else {
      this.applyEditsToBuffer(setProperty(model.getValue(), [-1], this.asObject(newKey, keybindingItem.command, when, false), { tabSize, insertSpaces, eol })[0], model);
    }
  }
  removeUserKeybinding(keybindingItem, model) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const userKeybindingEntries = parse5(model.getValue());
    const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries);
    if (userKeybindingEntryIndex !== -1) {
      this.applyEditsToBuffer(setProperty(model.getValue(), [userKeybindingEntryIndex], void 0, { tabSize, insertSpaces, eol })[0], model);
    }
  }
  removeDefaultKeybinding(keybindingItem, model) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const key3 = keybindingItem.resolvedKeybinding ? keybindingItem.resolvedKeybinding.getUserSettingsLabel() : null;
    if (key3) {
      const entry = this.asObject(key3, keybindingItem.command, keybindingItem.when ? keybindingItem.when.serialize() : void 0, true);
      const userKeybindingEntries = parse5(model.getValue());
      if (userKeybindingEntries.every((e4) => !this.areSame(e4, entry))) {
        this.applyEditsToBuffer(setProperty(model.getValue(), [-1], entry, { tabSize, insertSpaces, eol })[0], model);
      }
    }
  }
  removeUnassignedDefaultKeybinding(keybindingItem, model) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const userKeybindingEntries = parse5(model.getValue());
    const indices = this.findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries).reverse();
    for (const index2 of indices) {
      this.applyEditsToBuffer(setProperty(model.getValue(), [index2], void 0, { tabSize, insertSpaces, eol })[0], model);
    }
  }
  findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
    for (let index2 = 0; index2 < userKeybindingEntries.length; index2++) {
      const keybinding = userKeybindingEntries[index2];
      if (keybinding.command === keybindingItem.command) {
        if (!keybinding.when && !keybindingItem.when) {
          return index2;
        }
        if (keybinding.when && keybindingItem.when) {
          const contextKeyExpr = ContextKeyExpr.deserialize(keybinding.when);
          if (contextKeyExpr && contextKeyExpr.serialize() === keybindingItem.when.serialize()) {
            return index2;
          }
        }
      }
    }
    return -1;
  }
  findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
    const indices = [];
    for (let index2 = 0; index2 < userKeybindingEntries.length; index2++) {
      if (userKeybindingEntries[index2].command === `-${keybindingItem.command}`) {
        indices.push(index2);
      }
    }
    return indices;
  }
  asObject(key3, command4, when, negate) {
    const object2 = { key: key3 };
    if (command4) {
      object2["command"] = negate ? `-${command4}` : command4;
    }
    if (when) {
      object2["when"] = when;
    }
    return object2;
  }
  areSame(a, b) {
    if (a.command !== b.command) {
      return false;
    }
    if (a.key !== b.key) {
      return false;
    }
    const whenA = ContextKeyExpr.deserialize(a.when);
    const whenB = ContextKeyExpr.deserialize(b.when);
    if (whenA && !whenB || !whenA && whenB) {
      return false;
    }
    if (whenA && whenB && !whenA.equals(whenB)) {
      return false;
    }
    if (!equals4(a.args, b.args)) {
      return false;
    }
    return true;
  }
  applyEditsToBuffer(edit3, model) {
    const startPosition = model.getPositionAt(edit3.offset);
    const endPosition = model.getPositionAt(edit3.offset + edit3.length);
    const range2 = new Range2(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    const currentText = model.getValueInRange(range2);
    const editOperation = currentText ? EditOperation.replace(range2, edit3.content) : EditOperation.insert(startPosition, edit3.content);
    model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
  }
  async resolveModelReference() {
    const exists = await this.fileService.exists(this.userDataProfileService.currentProfile.keybindingsResource);
    if (!exists) {
      await this.textFileService.write(this.userDataProfileService.currentProfile.keybindingsResource, this.getEmptyContent(), { encoding: "utf8" });
    }
    return this.textModelResolverService.createModelReference(this.userDataProfileService.currentProfile.keybindingsResource);
  }
  async resolveAndValidate() {
    if (this.textFileService.isDirty(this.userDataProfileService.currentProfile.keybindingsResource)) {
      throw new Error(localize(23199, null));
    }
    const reference = await this.resolveModelReference();
    const model = reference.object.textEditorModel;
    const EOL = model.getEOL();
    if (model.getValue()) {
      const parsed = this.parse(model);
      if (parsed.parseErrors.length) {
        reference.dispose();
        throw new Error(localize(23200, null));
      }
      if (parsed.result) {
        if (!Array.isArray(parsed.result)) {
          reference.dispose();
          throw new Error(localize(23198, null));
        }
      } else {
        const content = EOL + "[]";
        this.applyEditsToBuffer({ content, length: content.length, offset: model.getValue().length }, model);
      }
    } else {
      const content = this.getEmptyContent();
      this.applyEditsToBuffer({ content, length: content.length, offset: 0 }, model);
    }
    return reference;
  }
  parse(model) {
    const parseErrors = [];
    const result = parse5(model.getValue(), parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    return { result, parseErrors };
  }
  getEmptyContent() {
    return "// " + localize(23197, null) + "\n[\n]";
  }
};

KeybindingsEditingService = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUserDataProfileService)
], KeybindingsEditingService);

registerSingleton(IKeybindingEditingService, KeybindingsEditingService, 1 /* Delayed */);
export { IKeybindingEditingService, KeybindingsEditingService };
