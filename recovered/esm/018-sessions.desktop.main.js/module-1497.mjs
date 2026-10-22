// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/sizeUtils.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/platform/theme/common/sizeUtils.ts
function asCssVariableName2(sizeIdent) {
  return `--vscode-${sizeIdent.replace(/\./g, "-")}`;
}

function isSizeDefaults(value2) {
  return value2 !== null && typeof value2 === "object" && "light" in value2 && "dark" in value2;
}

function size2(value2, unit = "px") {
  return { value: value2, unit };
}

function sizeForAllThemes(value2, unit = "px") {
  const sizeValue2 = size2(value2, unit);
  return {
    light: sizeValue2,
    dark: sizeValue2,
    hcDark: sizeValue2,
    hcLight: sizeValue2
  };
}

function sizeValueToCss(sizeValue2) {
  return sizeValue2.unit === "" ? `${sizeValue2.value}` : `${sizeValue2.value}${sizeValue2.unit}`;
}

var Extensions16 = {
  SizeContribution: "base.contributions.sizes"
};

var SizeRegistry = class extends Disposable {
  constructor() {
    super();
    this._onDidChangeSchema = this._register(new Emitter());
    this.onDidChangeSchema = this._onDidChangeSchema.event;
    this.sizeSchema = { type: "object", properties: {} };
    this.sizeReferenceSchema = { type: "string", enum: [], enumDescriptions: [] };
    this.sizesById = {};
  }
  notifyThemeUpdate(theme) {
    for (const key3 of Object.keys(this.sizesById)) {
      const sizeVal = this.resolveDefaultSize(key3, theme);
      if (sizeVal) {
        this.sizeSchema.properties[key3].default = sizeValueToCss(sizeVal);
      }
    }
    this._onDidChangeSchema.fire();
  }
  registerSize(id2, defaults, description, deprecationMessage) {
    const sizeContribution = { id: id2, description, defaults, deprecationMessage };
    this.sizesById[id2] = sizeContribution;
    const isUnitless = (() => {
      if (!defaults) {
        return false;
      }
      if (isSizeDefaults(defaults)) {
        const sample = defaults.dark ?? defaults.light ?? defaults.hcDark ?? defaults.hcLight;
        return sample?.unit === "";
      }
      return defaults.unit === "";
    })();
    const propertySchema = isUnitless ? {
      type: "string",
      pattern: "^(?:\\d+|default)$",
      patternErrorMessage: 'Value must be an integer (e.g., "400") or "default"'
    } : {
      type: "string",
      pattern: "^(?:\\d+(\\.\\d+)?(px|rem|em|%)|default)$",
      patternErrorMessage: 'Size must be a number followed by px, rem, em, or % (e.g., "12px", "1.5rem") or "default"'
    };
    if (deprecationMessage) {
      propertySchema.deprecationMessage = deprecationMessage;
    }
    this.sizeSchema.properties[id2] = {
      description,
      ...propertySchema
    };
    this.sizeReferenceSchema.enum.push(id2);
    this.sizeReferenceSchema.enumDescriptions.push(description);
    this._onDidChangeSchema.fire();
    return id2;
  }
  deregisterSize(id2) {
    delete this.sizesById[id2];
    delete this.sizeSchema.properties[id2];
    const index2 = this.sizeReferenceSchema.enum.indexOf(id2);
    if (index2 !== -1) {
      this.sizeReferenceSchema.enum.splice(index2, 1);
      this.sizeReferenceSchema.enumDescriptions.splice(index2, 1);
    }
    this._onDidChangeSchema.fire();
  }
  getSizes() {
    return Object.keys(this.sizesById).map((id2) => this.sizesById[id2]);
  }
  resolveDefaultSize(id2, theme) {
    const sizeDesc = this.sizesById[id2];
    if (sizeDesc?.defaults) {
      const sizeValue2 = isSizeDefaults(sizeDesc.defaults) ? sizeDesc.defaults[theme.type] : sizeDesc.defaults;
      return sizeValue2 ?? void 0;
    }
    return void 0;
  }
  getSizeSchema() {
    return this.sizeSchema;
  }
  getSizeReferenceSchema() {
    return this.sizeReferenceSchema;
  }
  toString() {
    const sorter3 = (a, b) => {
      const cat1 = a.indexOf(".") === -1 ? 0 : 1;
      const cat2 = b.indexOf(".") === -1 ? 0 : 1;
      if (cat1 !== cat2) {
        return cat1 - cat2;
      }
      return a.localeCompare(b);
    };
    return Object.keys(this.sizesById).sort(sorter3).map((k) => `- \`${k}\`: ${this.sizesById[k].description}`).join("\n");
  }
};

var sizeRegistry = new SizeRegistry();

Registry.add(Extensions16.SizeContribution, sizeRegistry);

function registerSize(id2, defaults, description, deprecationMessage) {
  return sizeRegistry.registerSize(id2, defaults, description, deprecationMessage);
}

function getSizeRegistry() {
  return sizeRegistry;
}

var workbenchSizesSchemaId = "vscode://schemas/workbench-sizes";

var schemaRegistry6 = Registry.as(Extensions3.JSONContribution);

schemaRegistry6.registerSchema(workbenchSizesSchemaId, sizeRegistry.getSizeSchema());

var delayer4 = new RunOnceScheduler(() => schemaRegistry6.notifySchemaChanged(workbenchSizesSchemaId), 200);

sizeRegistry.onDidChangeSchema(() => {
  if (!delayer4.isScheduled()) {
    delayer4.schedule();
  }
});
export { asCssVariableName2, isSizeDefaults, size2, sizeForAllThemes, sizeValueToCss, registerSize, getSizeRegistry, Extensions16, SizeRegistry, sizeRegistry, workbenchSizesSchemaId, schemaRegistry6, delayer4 };
