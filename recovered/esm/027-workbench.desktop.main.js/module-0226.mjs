// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/colorUtils.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Color } from "./module-0197.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { assertNever } from "./module-0009.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/platform/theme/common/colorUtils.ts
function asCssVariableName(colorIdent) {
  return `--vscode-${colorIdent.replace(/\./g, "-")}`;
}

function asCssVariable(color2) {
  return `var(${asCssVariableName(color2)})`;
}

function asCssVariableWithDefault(color2, defaultCssValue) {
  return `var(${asCssVariableName(color2)}, ${defaultCssValue})`;
}

function isColorDefaults(value2) {
  return value2 !== null && typeof value2 === "object" && "light" in value2 && "dark" in value2;
}

var Extensions6 = {
  ColorContribution: "base.contributions.colors"
};

var DEFAULT_COLOR_CONFIG_VALUE = "default";

var ColorRegistry = class extends Disposable {
  constructor() {
    super();
    this._onDidChangeSchema = this._register(new Emitter());
    this.onDidChangeSchema = this._onDidChangeSchema.event;
    this.colorSchema = { type: "object", properties: {} };
    this.colorReferenceSchema = { type: "string", enum: [], enumDescriptions: [] };
    this.colorsById = {};
  }
  notifyThemeUpdate(colorThemeData) {
    for (const key3 of Object.keys(this.colorsById)) {
      const color2 = colorThemeData.getColor(key3);
      if (color2) {
        this.colorSchema.properties[key3].oneOf[0].defaultSnippets[0].body = `\${1:${Color.Format.CSS.formatHexA(color2, true)}}`;
      }
    }
    this._onDidChangeSchema.fire();
  }
  registerColor(id2, defaults, description, needsTransparency = false, deprecationMessage) {
    const colorContribution = { id: id2, description, defaults, needsTransparency, deprecationMessage };
    this.colorsById[id2] = colorContribution;
    const propertySchema = { type: "string", format: "color-hex", defaultSnippets: [{ body: "${1:#ff0000}" }] };
    if (deprecationMessage) {
      propertySchema.deprecationMessage = deprecationMessage;
    }
    if (needsTransparency) {
      propertySchema.pattern = "^#(?:(?<rgba>[0-9a-fA-f]{3}[0-9a-eA-E])|(?:[0-9a-fA-F]{6}(?:(?![fF]{2})(?:[0-9a-fA-F]{2}))))?$";
      propertySchema.patternErrorMessage = localize(3558, null);
    }
    this.colorSchema.properties[id2] = {
      description,
      oneOf: [
        propertySchema,
        { type: "string", const: DEFAULT_COLOR_CONFIG_VALUE, description: localize(3559, null) }
      ]
    };
    this.colorReferenceSchema.enum.push(id2);
    this.colorReferenceSchema.enumDescriptions.push(description);
    this._onDidChangeSchema.fire();
    return id2;
  }
  updateDefaultColor(id2, defaults) {
    const existing = this.colorsById[id2];
    if (existing) {
      this.colorsById[id2] = { ...existing, defaults };
    }
  }
  deregisterColor(id2) {
    delete this.colorsById[id2];
    delete this.colorSchema.properties[id2];
    const index2 = this.colorReferenceSchema.enum.indexOf(id2);
    if (index2 !== -1) {
      this.colorReferenceSchema.enum.splice(index2, 1);
      this.colorReferenceSchema.enumDescriptions.splice(index2, 1);
    }
    this._onDidChangeSchema.fire();
  }
  getColors() {
    return Object.keys(this.colorsById).map((id2) => this.colorsById[id2]);
  }
  resolveDefaultColor(id2, theme) {
    const colorDesc = this.colorsById[id2];
    if (colorDesc?.defaults) {
      const colorValue = isColorDefaults(colorDesc.defaults) ? colorDesc.defaults[theme.type] : colorDesc.defaults;
      return resolveColorValue(colorValue, theme);
    }
    return void 0;
  }
  getColorSchema() {
    return this.colorSchema;
  }
  getColorReferenceSchema() {
    return this.colorReferenceSchema;
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
    return Object.keys(this.colorsById).sort(sorter3).map((k) => `- \`${k}\`: ${this.colorsById[k].description}`).join("\n");
  }
};

var colorRegistry = new ColorRegistry();

Registry.add(Extensions6.ColorContribution, colorRegistry);

function registerColor(id2, defaults, description, needsTransparency, deprecationMessage) {
  return colorRegistry.registerColor(id2, defaults, description, needsTransparency, deprecationMessage);
}

function getColorRegistry() {
  return colorRegistry;
}

function executeTransform(transform2, theme) {
  switch (transform2.op) {
    case 0 /* Darken */:
      return resolveColorValue(transform2.value, theme)?.darken(transform2.factor);
    case 1 /* Lighten */:
      return resolveColorValue(transform2.value, theme)?.lighten(transform2.factor);
    case 2 /* Transparent */:
      return resolveColorValue(transform2.value, theme)?.transparent(transform2.factor);
    case 7 /* Mix */: {
      const primaryColor = resolveColorValue(transform2.color, theme) || Color.transparent;
      const otherColor = resolveColorValue(transform2.with, theme) || Color.transparent;
      return primaryColor.mix(otherColor, transform2.ratio);
    }
    case 3 /* Opaque */: {
      const backgroundColor = resolveColorValue(transform2.background, theme);
      if (!backgroundColor) {
        return resolveColorValue(transform2.value, theme);
      }
      return resolveColorValue(transform2.value, theme)?.makeOpaque(backgroundColor);
    }
    case 4 /* OneOf */:
      for (const candidate of transform2.values) {
        const color2 = resolveColorValue(candidate, theme);
        if (color2) {
          return color2;
        }
      }
      return void 0;
    case 6 /* IfDefinedThenElse */:
      return resolveColorValue(theme.defines(transform2.if) ? transform2.then : transform2.else, theme);
    case 5 /* LessProminent */: {
      const from = resolveColorValue(transform2.value, theme);
      if (!from) {
        return void 0;
      }
      const backgroundColor = resolveColorValue(transform2.background, theme);
      if (!backgroundColor) {
        return from.transparent(transform2.factor * transform2.transparency);
      }
      return from.isDarkerThan(backgroundColor) ? Color.getLighterColor(from, backgroundColor, transform2.factor).transparent(transform2.transparency) : Color.getDarkerColor(from, backgroundColor, transform2.factor).transparent(transform2.transparency);
    }
    default:
      throw assertNever(transform2);
  }
}

function darken(colorValue, factor2) {
  return { op: 0 /* Darken */, value: colorValue, factor: factor2 };
}

function lighten(colorValue, factor2) {
  return { op: 1 /* Lighten */, value: colorValue, factor: factor2 };
}

function transparent(colorValue, factor2) {
  return { op: 2 /* Transparent */, value: colorValue, factor: factor2 };
}

function opaque(colorValue, background) {
  return { op: 3 /* Opaque */, value: colorValue, background };
}

function oneOf(...colorValues) {
  return { op: 4 /* OneOf */, values: colorValues };
}

function ifDefinedThenElse(ifArg, thenArg, elseArg) {
  return { op: 6 /* IfDefinedThenElse */, if: ifArg, then: thenArg, else: elseArg };
}

function lessProminent(colorValue, backgroundColorValue, factor2, transparency) {
  return { op: 5 /* LessProminent */, value: colorValue, background: backgroundColorValue, factor: factor2, transparency };
}

function resolveColorValue(colorValue, theme) {
  if (colorValue === null) {
    return void 0;
  } else if (typeof colorValue === "string") {
    if (colorValue[0] === "#") {
      return Color.fromHex(colorValue);
    }
    return theme.getColor(colorValue);
  } else if (colorValue instanceof Color) {
    return colorValue;
  } else if (typeof colorValue === "object") {
    return executeTransform(colorValue, theme);
  }
  return void 0;
}

var workbenchColorsSchemaId = "vscode://schemas/workbench-colors";

var schemaRegistry = Registry.as(Extensions3.JSONContribution);

schemaRegistry.registerSchema(workbenchColorsSchemaId, colorRegistry.getColorSchema());

var delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(workbenchColorsSchemaId), 200);

colorRegistry.onDidChangeSchema(() => {
  if (!delayer.isScheduled()) {
    delayer.schedule();
  }
});
export { asCssVariableName, asCssVariable, asCssVariableWithDefault, isColorDefaults, registerColor, getColorRegistry, executeTransform, darken, lighten, transparent, opaque, oneOf, ifDefinedThenElse, lessProminent, resolveColorValue, Extensions6, DEFAULT_COLOR_CONFIG_VALUE, ColorRegistry, colorRegistry, workbenchColorsSchemaId, schemaRegistry, delayer };
