// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/theme/common/tokenClassificationRegistry.ts
import { Color } from "./module-0197.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/platform/theme/common/tokenClassificationRegistry.ts
var TOKEN_TYPE_WILDCARD = "*";

var TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR = ":";

var CLASSIFIER_MODIFIER_SEPARATOR = ".";

var idPattern = "\\w+[-_\\w+]*";

var typeAndModifierIdPattern = `^${idPattern}$`;

var selectorPattern = `^(${idPattern}|\\*)(\\${CLASSIFIER_MODIFIER_SEPARATOR}${idPattern})*(${TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR}${idPattern})?$`;

var fontStylePattern = "^(\\s*(italic|bold|underline|strikethrough))*\\s*$";

var TokenStyle = class {
  constructor(foreground2, bold, underline, strikethrough, italic) {
    this.foreground = foreground2;
    this.bold = bold;
    this.underline = underline;
    this.strikethrough = strikethrough;
    this.italic = italic;
  }
};

((TokenStyle3) => {
  function toJSONObject(style) {
    return {
      _foreground: style.foreground === void 0 ? null : Color.Format.CSS.formatHexA(style.foreground, true),
      _bold: style.bold === void 0 ? null : style.bold,
      _underline: style.underline === void 0 ? null : style.underline,
      _italic: style.italic === void 0 ? null : style.italic,
      _strikethrough: style.strikethrough === void 0 ? null : style.strikethrough
    };
  }
  TokenStyle3.toJSONObject = toJSONObject;
  function fromJSONObject(obj) {
    if (obj) {
      const boolOrUndef = (b) => typeof b === "boolean" ? b : void 0;
      const colorOrUndef = (s) => typeof s === "string" ? Color.fromHex(s) : void 0;
      return new TokenStyle3(
        colorOrUndef(obj._foreground),
        boolOrUndef(obj._bold),
        boolOrUndef(obj._underline),
        boolOrUndef(obj._strikethrough),
        boolOrUndef(obj._italic)
      );
    }
    return void 0;
  }
  TokenStyle3.fromJSONObject = fromJSONObject;
  function equals5(s1, s2) {
    if (s1 === s2) {
      return true;
    }
    return s1 !== void 0 && s2 !== void 0 && (s1.foreground instanceof Color ? s1.foreground.equals(s2.foreground) : s2.foreground === void 0) && s1.bold === s2.bold && s1.underline === s2.underline && s1.strikethrough === s2.strikethrough && s1.italic === s2.italic;
  }
  TokenStyle3.equals = equals5;
  function is(s) {
    return s instanceof TokenStyle3;
  }
  TokenStyle3.is = is;
  function fromData(data) {
    return new TokenStyle3(data.foreground, data.bold, data.underline, data.strikethrough, data.italic);
  }
  TokenStyle3.fromData = fromData;
  function fromSettings(foreground2, fontStyle, bold, underline, strikethrough, italic) {
    let foregroundColor = void 0;
    if (foreground2 !== void 0) {
      foregroundColor = Color.fromHex(foreground2);
    }
    if (fontStyle !== void 0) {
      bold = italic = underline = strikethrough = false;
      const expression = /italic|bold|underline|strikethrough/g;
      let match2;
      while (match2 = expression.exec(fontStyle)) {
        switch (match2[0]) {
          case "bold":
            bold = true;
            break;
          case "italic":
            italic = true;
            break;
          case "underline":
            underline = true;
            break;
          case "strikethrough":
            strikethrough = true;
            break;
        }
      }
    }
    return new TokenStyle3(foregroundColor, bold, underline, strikethrough, italic);
  }
  TokenStyle3.fromSettings = fromSettings;
})(TokenStyle || (TokenStyle = {}));

var SemanticTokenRule;

((SemanticTokenRule2) => {
  function fromJSONObject(registry4, o) {
    if (o && typeof o._selector === "string" && o._style) {
      const style = TokenStyle.fromJSONObject(o._style);
      if (style) {
        try {
          return { selector: registry4.parseTokenSelector(o._selector), style };
        } catch (_ignore) {
        }
      }
    }
    return void 0;
  }
  SemanticTokenRule2.fromJSONObject = fromJSONObject;
  function toJSONObject(rule) {
    return {
      _selector: rule.selector.id,
      _style: TokenStyle.toJSONObject(rule.style)
    };
  }
  SemanticTokenRule2.toJSONObject = toJSONObject;
  function equals5(r1, r2) {
    if (r1 === r2) {
      return true;
    }
    return r1 !== void 0 && r2 !== void 0 && r1.selector && r2.selector && r1.selector.id === r2.selector.id && TokenStyle.equals(r1.style, r2.style);
  }
  SemanticTokenRule2.equals = equals5;
  function is(r2) {
    return r2 && r2.selector && typeof r2.selector.id === "string" && TokenStyle.is(r2.style);
  }
  SemanticTokenRule2.is = is;
})(SemanticTokenRule || (SemanticTokenRule = {}));

var Extensions12 = {
  TokenClassificationContribution: "base.contributions.tokenClassification"
};

var TokenClassificationRegistry = class extends Disposable {
  constructor() {
    super();
    this._onDidChangeSchema = this._register(new Emitter());
    this.onDidChangeSchema = this._onDidChangeSchema.event;
    this.currentTypeNumber = 0;
    this.currentModifierBit = 1;
    this.tokenStylingDefaultRules = [];
    this.tokenStylingSchema = {
      type: "object",
      properties: {},
      patternProperties: {
        [selectorPattern]: getStylingSchemeEntry()
      },
      //errorMessage: nls.localize('schema.token.errors', 'Valid token selectors have the form (*|tokenType)(.tokenModifier)*(:tokenLanguage)?.'),
      additionalProperties: false,
      definitions: {
        style: {
          type: "object",
          description: localize(3638, null),
          properties: {
            foreground: {
              type: "string",
              description: localize(3636, null),
              format: "color-hex",
              default: "#ff0000"
            },
            background: {
              type: "string",
              deprecationMessage: localize(3632, null)
            },
            fontStyle: {
              type: "string",
              description: localize(3634, null),
              pattern: fontStylePattern,
              patternErrorMessage: localize(3631, null),
              defaultSnippets: [
                { label: localize(3635, null), bodyText: '""' },
                { body: "italic" },
                { body: "bold" },
                { body: "underline" },
                { body: "strikethrough" },
                { body: "italic bold" },
                { body: "italic underline" },
                { body: "italic strikethrough" },
                { body: "bold underline" },
                { body: "bold strikethrough" },
                { body: "underline strikethrough" },
                { body: "italic bold underline" },
                { body: "italic bold strikethrough" },
                { body: "italic underline strikethrough" },
                { body: "bold underline strikethrough" },
                { body: "italic bold underline strikethrough" }
              ]
            },
            bold: {
              type: "boolean",
              description: localize(3633, null)
            },
            italic: {
              type: "boolean",
              description: localize(3637, null)
            },
            underline: {
              type: "boolean",
              description: localize(3640, null)
            },
            strikethrough: {
              type: "boolean",
              description: localize(3639, null)
            }
          },
          defaultSnippets: [{ body: { foreground: "${1:#FF0000}", fontStyle: "${2:bold}" } }]
        }
      }
    };
    this.tokenTypeById = /* @__PURE__ */ Object.create(null);
    this.tokenModifierById = /* @__PURE__ */ Object.create(null);
    this.typeHierarchy = /* @__PURE__ */ Object.create(null);
  }
  registerTokenType(id2, description, superType, deprecationMessage) {
    if (!id2.match(typeAndModifierIdPattern)) {
      throw new Error("Invalid token type id.");
    }
    if (superType && !superType.match(typeAndModifierIdPattern)) {
      throw new Error("Invalid token super type id.");
    }
    const num = this.currentTypeNumber++;
    const tokenStyleContribution = { num, id: id2, superType, description, deprecationMessage };
    this.tokenTypeById[id2] = tokenStyleContribution;
    const stylingSchemeEntry = getStylingSchemeEntry(description, deprecationMessage);
    this.tokenStylingSchema.properties[id2] = stylingSchemeEntry;
    this.typeHierarchy = /* @__PURE__ */ Object.create(null);
  }
  registerTokenModifier(id2, description, deprecationMessage) {
    if (!id2.match(typeAndModifierIdPattern)) {
      throw new Error("Invalid token modifier id.");
    }
    const num = this.currentModifierBit;
    this.currentModifierBit = this.currentModifierBit * 2;
    const tokenStyleContribution = { num, id: id2, description, deprecationMessage };
    this.tokenModifierById[id2] = tokenStyleContribution;
    this.tokenStylingSchema.properties[`*.${id2}`] = getStylingSchemeEntry(description, deprecationMessage);
  }
  parseTokenSelector(selectorString, language2) {
    const selector = parseClassifierString(selectorString, language2);
    if (!selector.type) {
      return {
        match: () => -1,
        id: "$invalid"
      };
    }
    return {
      match: (type, modifiers, language3) => {
        let score3 = 0;
        if (selector.language !== void 0) {
          if (selector.language !== language3) {
            return -1;
          }
          score3 += 10;
        }
        if (selector.type !== TOKEN_TYPE_WILDCARD) {
          const hierarchy = this.getTypeHierarchy(type);
          const level = hierarchy.indexOf(selector.type);
          if (level === -1) {
            return -1;
          }
          score3 += 100 - level;
        }
        for (const selectorModifier of selector.modifiers) {
          if (modifiers.indexOf(selectorModifier) === -1) {
            return -1;
          }
        }
        return score3 + selector.modifiers.length * 100;
      },
      id: `${[selector.type, ...selector.modifiers.sort()].join(".")}${selector.language !== void 0 ? ":" + selector.language : ""}`
    };
  }
  registerTokenStyleDefault(selector, defaults) {
    this.tokenStylingDefaultRules.push({ selector, defaults });
  }
  deregisterTokenStyleDefault(selector) {
    const selectorString = selector.id;
    this.tokenStylingDefaultRules = this.tokenStylingDefaultRules.filter((r2) => r2.selector.id !== selectorString);
  }
  deregisterTokenType(id2) {
    delete this.tokenTypeById[id2];
    delete this.tokenStylingSchema.properties[id2];
    this.typeHierarchy = /* @__PURE__ */ Object.create(null);
  }
  deregisterTokenModifier(id2) {
    delete this.tokenModifierById[id2];
    delete this.tokenStylingSchema.properties[`*.${id2}`];
  }
  getTokenTypes() {
    return Object.keys(this.tokenTypeById).map((id2) => this.tokenTypeById[id2]);
  }
  getTokenModifiers() {
    return Object.keys(this.tokenModifierById).map((id2) => this.tokenModifierById[id2]);
  }
  getTokenStylingSchema() {
    return this.tokenStylingSchema;
  }
  getTokenStylingDefaultRules() {
    return this.tokenStylingDefaultRules;
  }
  getTypeHierarchy(typeId) {
    let hierarchy = this.typeHierarchy[typeId];
    if (!hierarchy) {
      this.typeHierarchy[typeId] = hierarchy = [typeId];
      let type = this.tokenTypeById[typeId];
      while (type && type.superType) {
        hierarchy.push(type.superType);
        type = this.tokenTypeById[type.superType];
      }
    }
    return hierarchy;
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
    return Object.keys(this.tokenTypeById).sort(sorter3).map((k) => `- \`${k}\`: ${this.tokenTypeById[k].description}`).join("\n");
  }
};

var CHAR_LANGUAGE = TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR.charCodeAt(0);

var CHAR_MODIFIER = CLASSIFIER_MODIFIER_SEPARATOR.charCodeAt(0);

function parseClassifierString(s, defaultLanguage) {
  let k = s.length;
  let language2 = defaultLanguage;
  const modifiers = [];
  for (let i2 = k - 1; i2 >= 0; i2--) {
    const ch = s.charCodeAt(i2);
    if (ch === CHAR_LANGUAGE || ch === CHAR_MODIFIER) {
      const segment = s.substring(i2 + 1, k);
      k = i2;
      if (ch === CHAR_LANGUAGE) {
        language2 = segment;
      } else {
        modifiers.push(segment);
      }
    }
  }
  const type = s.substring(0, k);
  return { type, modifiers, language: language2 };
}

var tokenClassificationRegistry = createDefaultTokenClassificationRegistry();

Registry.add(Extensions12.TokenClassificationContribution, tokenClassificationRegistry);

function createDefaultTokenClassificationRegistry() {
  const registry4 = new TokenClassificationRegistry();
  function registerTokenType(id2, description, scopesToProbe = [], superType, deprecationMessage) {
    registry4.registerTokenType(id2, description, superType, deprecationMessage);
    if (scopesToProbe) {
      registerTokenStyleDefault(id2, scopesToProbe);
    }
    return id2;
  }
  function registerTokenStyleDefault(selectorString, scopesToProbe) {
    try {
      const selector = registry4.parseTokenSelector(selectorString);
      registry4.registerTokenStyleDefault(selector, { scopesToProbe });
    } catch (e4) {
      console.log(e4);
    }
  }
  registerTokenType("comment", localize(3608, null), [["comment"]]);
  registerTokenType("string", localize(3642, null), [["string"]]);
  registerTokenType("keyword", localize(3618, null), [["keyword.control"]]);
  registerTokenType("number", localize(3625, null), [["constant.numeric"]]);
  registerTokenType("regexp", localize(3630, null), [["constant.regexp"]]);
  registerTokenType("operator", localize(3626, null), [["keyword.operator"]]);
  registerTokenType("namespace", localize(3624, null), [["entity.name.namespace"]]);
  registerTokenType("type", localize(3644, null), [["entity.name.type"], ["support.type"]]);
  registerTokenType("struct", localize(3643, null), [["entity.name.type.struct"]]);
  registerTokenType("class", localize(3607, null), [["entity.name.type.class"], ["support.class"]]);
  registerTokenType("interface", localize(3617, null), [["entity.name.type.interface"]]);
  registerTokenType("enum", localize(3613, null), [["entity.name.type.enum"]]);
  registerTokenType("typeParameter", localize(3645, null), [["entity.name.type.parameter"]]);
  registerTokenType("function", localize(3616, null), [["entity.name.function"], ["support.function"]]);
  registerTokenType("member", localize(3621, null), [], "method", "Deprecated use `method` instead");
  registerTokenType("method", localize(3622, null), [["entity.name.function.member"], ["support.function"]]);
  registerTokenType("macro", localize(3620, null), [["entity.name.function.preprocessor"]]);
  registerTokenType("variable", localize(3646, null), [["variable.other.readwrite"], ["entity.name.variable"]]);
  registerTokenType("parameter", localize(3627, null), [["variable.parameter"]]);
  registerTokenType("property", localize(3628, null), [["variable.other.property"]]);
  registerTokenType("enumMember", localize(3614, null), [["variable.other.enummember"]]);
  registerTokenType("event", localize(3615, null), [["variable.other.event"]]);
  registerTokenType("decorator", localize(3610, null), [["entity.name.decorator"], ["entity.name.function"]]);
  registerTokenType("label", localize(3619, null), void 0);
  registry4.registerTokenModifier("declaration", localize(3609, null), void 0);
  registry4.registerTokenModifier("documentation", localize(3612, null), void 0);
  registry4.registerTokenModifier("static", localize(3641, null), void 0);
  registry4.registerTokenModifier("abstract", localize(3605, null), void 0);
  registry4.registerTokenModifier("deprecated", localize(3611, null), void 0);
  registry4.registerTokenModifier("modification", localize(3623, null), void 0);
  registry4.registerTokenModifier("async", localize(3606, null), void 0);
  registry4.registerTokenModifier("readonly", localize(3629, null), void 0);
  registerTokenStyleDefault("variable.readonly", [["variable.other.constant"]]);
  registerTokenStyleDefault("property.readonly", [["variable.other.constant.property"]]);
  registerTokenStyleDefault("type.defaultLibrary", [["support.type"]]);
  registerTokenStyleDefault("class.defaultLibrary", [["support.class"]]);
  registerTokenStyleDefault("interface.defaultLibrary", [["support.class"]]);
  registerTokenStyleDefault("variable.defaultLibrary", [["support.variable"], ["support.other.variable"]]);
  registerTokenStyleDefault("variable.defaultLibrary.readonly", [["support.constant"]]);
  registerTokenStyleDefault("property.defaultLibrary", [["support.variable.property"]]);
  registerTokenStyleDefault("property.defaultLibrary.readonly", [["support.constant.property"]]);
  registerTokenStyleDefault("function.defaultLibrary", [["support.function"]]);
  registerTokenStyleDefault("member.defaultLibrary", [["support.function"]]);
  return registry4;
}

function getTokenClassificationRegistry() {
  return tokenClassificationRegistry;
}

function getStylingSchemeEntry(description, deprecationMessage) {
  return {
    description,
    deprecationMessage,
    defaultSnippets: [{ body: "${1:#ff0000}" }],
    anyOf: [
      {
        type: "string",
        format: "color-hex"
      },
      {
        $ref: "#/definitions/style"
      }
    ]
  };
}

var tokenStylingSchemaId = "vscode://schemas/token-styling";

var schemaRegistry4 = Registry.as(Extensions3.JSONContribution);

schemaRegistry4.registerSchema(tokenStylingSchemaId, tokenClassificationRegistry.getTokenStylingSchema());

var delayer3 = new RunOnceScheduler(() => schemaRegistry4.notifySchemaChanged(tokenStylingSchemaId), 200);

tokenClassificationRegistry.onDidChangeSchema(() => {
  if (!delayer3.isScheduled()) {
    delayer3.schedule();
  }
});
export { parseClassifierString, createDefaultTokenClassificationRegistry, getTokenClassificationRegistry, getStylingSchemeEntry, TOKEN_TYPE_WILDCARD, TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR, CLASSIFIER_MODIFIER_SEPARATOR, idPattern, typeAndModifierIdPattern, selectorPattern, fontStylePattern, TokenStyle, SemanticTokenRule, Extensions12, TokenClassificationRegistry, CHAR_LANGUAGE, CHAR_MODIFIER, tokenClassificationRegistry, tokenStylingSchemaId, schemaRegistry4, delayer3 };
