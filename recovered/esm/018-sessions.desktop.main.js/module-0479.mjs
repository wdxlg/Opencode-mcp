// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/iconRegistry.ts
import { ThemeIcon } from "./module-0086.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { getCodiconFontCharacters } from "./module-0083.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/platform/theme/common/iconRegistry.ts
var Extensions9 = {
  IconContribution: "base.contributions.icons"
};

var IconContribution;

((IconContribution5) => {
  function getDefinition(contribution, registry4) {
    let definition = contribution.defaults;
    while (ThemeIcon.isThemeIcon(definition)) {
      const c = iconRegistry.getIcon(definition.id);
      if (!c) {
        return void 0;
      }
      definition = c.defaults;
    }
    return definition;
  }
  IconContribution5.getDefinition = getDefinition;
})(IconContribution || (IconContribution = {}));

var IconFontDefinition;

((IconFontDefinition3) => {
  function toJSONObject(iconFont) {
    return {
      weight: iconFont.weight,
      style: iconFont.style,
      src: iconFont.src.map((s) => ({ format: s.format, location: s.location.toString() }))
    };
  }
  IconFontDefinition3.toJSONObject = toJSONObject;
  function fromJSONObject(json) {
    const stringOrUndef = (s) => isString(s) ? s : void 0;
    if (json && Array.isArray(json.src) && json.src.every((s) => isString(s.format) && isString(s.location))) {
      return {
        weight: stringOrUndef(json.weight),
        style: stringOrUndef(json.style),
        src: json.src.map((s) => ({ format: s.format, location: URI.parse(s.location) }))
      };
    }
    return void 0;
  }
  IconFontDefinition3.fromJSONObject = fromJSONObject;
})(IconFontDefinition || (IconFontDefinition = {}));

var fontIdRegex = /^([\w_-]+)$/;

var fontStyleRegex = /^(normal|italic|(oblique[ \w\s-]+))$/;

var fontWeightRegex = /^(normal|bold|lighter|bolder|(\d{0-1000}))$/;

var fontSizeRegex = /^([\w_.%+-]+)$/;

var fontFormatRegex = /^woff|woff2|truetype|opentype|embedded-opentype|svg$/;

var fontColorRegex = /^#[0-9a-fA-F]{0,6}$/;

var fontIdErrorMessage = localize(3564, null);

var IconRegistry = class extends Disposable {
  constructor() {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.iconSchema = {
      definitions: {
        icons: {
          type: "object",
          properties: {
            fontId: { type: "string", description: localize(3561, null), pattern: fontIdRegex.source, patternErrorMessage: fontIdErrorMessage },
            fontCharacter: { type: "string", description: localize(3560, null) }
          },
          additionalProperties: false,
          defaultSnippets: [{ body: { fontCharacter: "\\\\e030" } }]
        }
      },
      type: "object",
      properties: {}
    };
    this.iconReferenceSchema = { type: "string", pattern: `^${ThemeIcon.iconNameExpression}$`, enum: [], enumDescriptions: [] };
    this.iconsById = {};
    this.iconFontsById = {};
  }
  registerIcon(id2, defaults, description, deprecationMessage) {
    const existing = this.iconsById[id2];
    if (existing) {
      if (description && !existing.description) {
        existing.description = description;
        this.iconSchema.properties[id2].markdownDescription = `${description} $(${id2})`;
        const enumIndex = this.iconReferenceSchema.enum.indexOf(id2);
        if (enumIndex !== -1) {
          this.iconReferenceSchema.enumDescriptions[enumIndex] = description;
        }
        this._onDidChange.fire();
      }
      return existing;
    }
    const iconContribution = { id: id2, description, defaults, deprecationMessage };
    this.iconsById[id2] = iconContribution;
    const propertySchema = { $ref: "#/definitions/icons" };
    if (deprecationMessage) {
      propertySchema.deprecationMessage = deprecationMessage;
    }
    if (description) {
      propertySchema.markdownDescription = `${description}: $(${id2})`;
    }
    this.iconSchema.properties[id2] = propertySchema;
    this.iconReferenceSchema.enum.push(id2);
    this.iconReferenceSchema.enumDescriptions.push(description || "");
    this._onDidChange.fire();
    return { id: id2 };
  }
  deregisterIcon(id2) {
    delete this.iconsById[id2];
    delete this.iconSchema.properties[id2];
    const index2 = this.iconReferenceSchema.enum.indexOf(id2);
    if (index2 !== -1) {
      this.iconReferenceSchema.enum.splice(index2, 1);
      this.iconReferenceSchema.enumDescriptions.splice(index2, 1);
    }
    this._onDidChange.fire();
  }
  getIcons() {
    return Object.keys(this.iconsById).map((id2) => this.iconsById[id2]);
  }
  getIcon(id2) {
    return this.iconsById[id2];
  }
  getIconSchema() {
    return this.iconSchema;
  }
  getIconReferenceSchema() {
    return this.iconReferenceSchema;
  }
  registerIconFont(id2, definition) {
    const existing = this.iconFontsById[id2];
    if (existing) {
      return existing;
    }
    this.iconFontsById[id2] = definition;
    this._onDidChange.fire();
    return definition;
  }
  deregisterIconFont(id2) {
    delete this.iconFontsById[id2];
  }
  getIconFont(id2) {
    return this.iconFontsById[id2];
  }
  toString() {
    const sorter3 = (i1, i2) => {
      return i1.id.localeCompare(i2.id);
    };
    const classNames2 = (i2) => {
      while (ThemeIcon.isThemeIcon(i2.defaults)) {
        i2 = this.iconsById[i2.defaults.id];
      }
      return `codicon codicon-${i2 ? i2.id : ""}`;
    };
    const reference = [];
    reference.push(`| preview     | identifier                        | default codicon ID                | description`);
    reference.push(`| ----------- | --------------------------------- | --------------------------------- | --------------------------------- |`);
    const contributions = Object.keys(this.iconsById).map((key3) => this.iconsById[key3]);
    for (const i2 of contributions.filter((i3) => !!i3.description).sort(sorter3)) {
      reference.push(`|<i class="${classNames2(i2)}"></i>|${i2.id}|${ThemeIcon.isThemeIcon(i2.defaults) ? i2.defaults.id : i2.id}|${i2.description || ""}|`);
    }
    reference.push(`| preview     | identifier                        `);
    reference.push(`| ----------- | --------------------------------- |`);
    for (const i2 of contributions.filter((i3) => !ThemeIcon.isThemeIcon(i3.defaults)).sort(sorter3)) {
      reference.push(`|<i class="${classNames2(i2)}"></i>|${i2.id}|`);
    }
    return reference.join("\n");
  }
};

var iconRegistry = new IconRegistry();

Registry.add(Extensions9.IconContribution, iconRegistry);

function registerIcon(id2, defaults, description, deprecationMessage) {
  return iconRegistry.registerIcon(id2, defaults, description, deprecationMessage);
}

function getIconRegistry() {
  return iconRegistry;
}

function initialize() {
  const codiconFontCharacters = getCodiconFontCharacters();
  for (const icon2 in codiconFontCharacters) {
    const fontCharacter = "\\" + codiconFontCharacters[icon2].toString(16);
    iconRegistry.registerIcon(icon2, { fontCharacter });
  }
}

initialize();

var iconsSchemaId = "vscode://schemas/icons";

var schemaRegistry2 = Registry.as(Extensions3.JSONContribution);

schemaRegistry2.registerSchema(iconsSchemaId, iconRegistry.getIconSchema());

var delayer2 = new RunOnceScheduler(() => schemaRegistry2.notifySchemaChanged(iconsSchemaId), 200);

iconRegistry.onDidChange(() => {
  if (!delayer2.isScheduled()) {
    delayer2.schedule();
  }
});

var widgetClose = registerIcon("widget-close", Codicon.close, localize(3565, null));

var gotoPreviousLocation = registerIcon("goto-previous-location", Codicon.arrowUp, localize(3563, null));

var gotoNextLocation = registerIcon("goto-next-location", Codicon.arrowDown, localize(3562, null));

var syncing = ThemeIcon.modify(Codicon.sync, "spin");

var spinningLoading = ThemeIcon.modify(Codicon.loading, "spin");
export { registerIcon, getIconRegistry, initialize, Extensions9, IconContribution, IconFontDefinition, fontIdRegex, fontStyleRegex, fontWeightRegex, fontSizeRegex, fontFormatRegex, fontColorRegex, fontIdErrorMessage, IconRegistry, iconRegistry, iconsSchemaId, schemaRegistry2, delayer2, widgetClose, gotoPreviousLocation, gotoNextLocation, syncing, spinningLoading };
