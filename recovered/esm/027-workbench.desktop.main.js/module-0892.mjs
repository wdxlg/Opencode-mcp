// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/common/languageConfigurationExtensionPoint.ts
import { Disposable } from "./module-0012.mjs";
import { hash } from "./module-0039.mjs";
import { getNodeType, parse5 } from "./module-0883.mjs";
import { localize } from "./module-0001.mjs";
import { getParseErrorMessage } from "./module-0888.mjs";
import { isObject } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IExtensionResourceLoaderService } from "./module-0891.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";


// src/vs/workbench/contrib/codeEditor/common/languageConfigurationExtensionPoint.ts
function isStringArr(something) {
  if (!Array.isArray(something)) {
    return false;
  }
  for (let i2 = 0, len = something.length; i2 < len; i2++) {
    if (typeof something[i2] !== "string") {
      return false;
    }
  }
  return true;
}

function isCharacterPair(something) {
  return isStringArr(something) && something.length === 2;
}

var LanguageConfigurationFileHandler = class extends Disposable {
  constructor(_languageService, _extensionResourceLoaderService, _extensionService, _languageConfigurationService) {
    super();
    this._languageService = _languageService;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this._extensionService = _extensionService;
    this._languageConfigurationService = _languageConfigurationService;
    /**
     * A map from language id to a hash computed from the config files locations.
     */
    this._done = /* @__PURE__ */ new Map();
    this._register(this._languageService.onDidRequestBasicLanguageFeatures(async (languageIdentifier) => {
      this._extensionService.whenInstalledExtensionsRegistered().then(() => {
        this._loadConfigurationsForMode(languageIdentifier);
      });
    }));
    this._register(this._languageService.onDidChange(() => {
      for (const [languageId] of this._done) {
        this._loadConfigurationsForMode(languageId);
      }
    }));
  }
  async _loadConfigurationsForMode(languageId) {
    const configurationFiles = this._languageService.getConfigurationFiles(languageId);
    const configurationHash = hash(configurationFiles.map((uri5) => uri5.toString()));
    if (this._done.get(languageId) === configurationHash) {
      return;
    }
    this._done.set(languageId, configurationHash);
    const configs = await Promise.all(configurationFiles.map((configFile) => this._readConfigFile(configFile)));
    for (const config of configs) {
      this._handleConfig(languageId, config);
    }
  }
  async _readConfigFile(configFileLocation) {
    try {
      const contents = await this._extensionResourceLoaderService.readExtensionResource(configFileLocation);
      const errors = [];
      let configuration2 = parse5(contents, errors);
      if (errors.length) {
        console.error(localize(13858, null, configFileLocation.toString(), errors.map((e) => `[${e.offset}, ${e.length}] ${getParseErrorMessage(e.error)}`).join("\n")));
      }
      if (getNodeType(configuration2) !== "object") {
        console.error(localize(13857, null, configFileLocation.toString()));
        configuration2 = {};
      }
      return configuration2;
    } catch (err) {
      console.error(err);
      return {};
    }
  }
  static _extractValidCommentRule(languageId, configuration2) {
    const source = configuration2.comments;
    if (typeof source === "undefined") {
      return void 0;
    }
    if (!isObject(source)) {
      console.warn(`[${languageId}]: language configuration: expected \`comments\` to be an object.`);
      return void 0;
    }
    let result = void 0;
    if (typeof source.lineComment !== "undefined") {
      if (typeof source.lineComment === "string") {
        result = result || {};
        result.lineComment = source.lineComment;
      } else if (isObject(source.lineComment)) {
        const lineCommentObj = source.lineComment;
        if (typeof lineCommentObj.comment === "string") {
          result = result || {};
          result.lineComment = {
            comment: lineCommentObj.comment,
            noIndent: lineCommentObj.noIndent
          };
        } else {
          console.warn(`[${languageId}]: language configuration: expected \`comments.lineComment.comment\` to be a string.`);
        }
      } else {
        console.warn(`[${languageId}]: language configuration: expected \`comments.lineComment\` to be a string or an object with comment property.`);
      }
    }
    if (typeof source.blockComment !== "undefined") {
      if (!isCharacterPair(source.blockComment)) {
        console.warn(`[${languageId}]: language configuration: expected \`comments.blockComment\` to be an array of two strings.`);
      } else {
        result = result || {};
        result.blockComment = source.blockComment;
      }
    }
    return result;
  }
  static _extractValidBrackets(languageId, configuration2) {
    const source = configuration2.brackets;
    if (typeof source === "undefined") {
      return void 0;
    }
    if (!Array.isArray(source)) {
      console.warn(`[${languageId}]: language configuration: expected \`brackets\` to be an array.`);
      return void 0;
    }
    let result = void 0;
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      const pair = source[i2];
      if (!isCharacterPair(pair)) {
        console.warn(`[${languageId}]: language configuration: expected \`brackets[${i2}]\` to be an array of two strings.`);
        continue;
      }
      result = result || [];
      result.push(pair);
    }
    return result;
  }
  static _extractValidAutoClosingPairs(languageId, configuration2) {
    const source = configuration2.autoClosingPairs;
    if (typeof source === "undefined") {
      return void 0;
    }
    if (!Array.isArray(source)) {
      console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs\` to be an array.`);
      return void 0;
    }
    let result = void 0;
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      const pair = source[i2];
      if (Array.isArray(pair)) {
        if (!isCharacterPair(pair)) {
          console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i2}]\` to be an array of two strings or an object.`);
          continue;
        }
        result = result || [];
        result.push({ open: pair[0], close: pair[1] });
      } else {
        if (!isObject(pair)) {
          console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i2}]\` to be an array of two strings or an object.`);
          continue;
        }
        if (typeof pair.open !== "string") {
          console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i2}].open\` to be a string.`);
          continue;
        }
        if (typeof pair.close !== "string") {
          console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i2}].close\` to be a string.`);
          continue;
        }
        if (typeof pair.notIn !== "undefined") {
          if (!isStringArr(pair.notIn)) {
            console.warn(`[${languageId}]: language configuration: expected \`autoClosingPairs[${i2}].notIn\` to be a string array.`);
            continue;
          }
        }
        result = result || [];
        result.push({ open: pair.open, close: pair.close, notIn: pair.notIn });
      }
    }
    return result;
  }
  static _extractValidSurroundingPairs(languageId, configuration2) {
    const source = configuration2.surroundingPairs;
    if (typeof source === "undefined") {
      return void 0;
    }
    if (!Array.isArray(source)) {
      console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs\` to be an array.`);
      return void 0;
    }
    let result = void 0;
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      const pair = source[i2];
      if (Array.isArray(pair)) {
        if (!isCharacterPair(pair)) {
          console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i2}]\` to be an array of two strings or an object.`);
          continue;
        }
        result = result || [];
        result.push({ open: pair[0], close: pair[1] });
      } else {
        if (!isObject(pair)) {
          console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i2}]\` to be an array of two strings or an object.`);
          continue;
        }
        if (typeof pair.open !== "string") {
          console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i2}].open\` to be a string.`);
          continue;
        }
        if (typeof pair.close !== "string") {
          console.warn(`[${languageId}]: language configuration: expected \`surroundingPairs[${i2}].close\` to be a string.`);
          continue;
        }
        result = result || [];
        result.push({ open: pair.open, close: pair.close });
      }
    }
    return result;
  }
  static _extractValidColorizedBracketPairs(languageId, configuration2) {
    const source = configuration2.colorizedBracketPairs;
    if (typeof source === "undefined") {
      return void 0;
    }
    if (!Array.isArray(source)) {
      console.warn(`[${languageId}]: language configuration: expected \`colorizedBracketPairs\` to be an array.`);
      return void 0;
    }
    const result = [];
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      const pair = source[i2];
      if (!isCharacterPair(pair)) {
        console.warn(`[${languageId}]: language configuration: expected \`colorizedBracketPairs[${i2}]\` to be an array of two strings.`);
        continue;
      }
      result.push([pair[0], pair[1]]);
    }
    return result;
  }
  static _extractValidOnEnterRules(languageId, configuration2) {
    const source = configuration2.onEnterRules;
    if (typeof source === "undefined") {
      return void 0;
    }
    if (!Array.isArray(source)) {
      console.warn(`[${languageId}]: language configuration: expected \`onEnterRules\` to be an array.`);
      return void 0;
    }
    let result = void 0;
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      const onEnterRule = source[i2];
      if (!isObject(onEnterRule)) {
        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i2}]\` to be an object.`);
        continue;
      }
      if (!isObject(onEnterRule.action)) {
        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i2}].action\` to be an object.`);
        continue;
      }
      let indentAction;
      if (onEnterRule.action.indent === "none") {
        indentAction = 0 /* None */;
      } else if (onEnterRule.action.indent === "indent") {
        indentAction = 1 /* Indent */;
      } else if (onEnterRule.action.indent === "indentOutdent") {
        indentAction = 2 /* IndentOutdent */;
      } else if (onEnterRule.action.indent === "outdent") {
        indentAction = 3 /* Outdent */;
      } else {
        console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i2}].action.indent\` to be 'none', 'indent', 'indentOutdent' or 'outdent'.`);
        continue;
      }
      const action = { indentAction };
      if (onEnterRule.action.appendText) {
        if (typeof onEnterRule.action.appendText === "string") {
          action.appendText = onEnterRule.action.appendText;
        } else {
          console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i2}].action.appendText\` to be undefined or a string.`);
        }
      }
      if (onEnterRule.action.removeText) {
        if (typeof onEnterRule.action.removeText === "number") {
          action.removeText = onEnterRule.action.removeText;
        } else {
          console.warn(`[${languageId}]: language configuration: expected \`onEnterRules[${i2}].action.removeText\` to be undefined or a number.`);
        }
      }
      const beforeText = this._parseRegex(languageId, `onEnterRules[${i2}].beforeText`, onEnterRule.beforeText);
      if (!beforeText) {
        continue;
      }
      const resultingOnEnterRule = { beforeText, action };
      if (onEnterRule.afterText) {
        const afterText = this._parseRegex(languageId, `onEnterRules[${i2}].afterText`, onEnterRule.afterText);
        if (afterText) {
          resultingOnEnterRule.afterText = afterText;
        }
      }
      if (onEnterRule.previousLineText) {
        const previousLineText = this._parseRegex(languageId, `onEnterRules[${i2}].previousLineText`, onEnterRule.previousLineText);
        if (previousLineText) {
          resultingOnEnterRule.previousLineText = previousLineText;
        }
      }
      result = result || [];
      result.push(resultingOnEnterRule);
    }
    return result;
  }
  static extractValidConfig(languageId, configuration2) {
    const comments = this._extractValidCommentRule(languageId, configuration2);
    const brackets = this._extractValidBrackets(languageId, configuration2);
    const autoClosingPairs = this._extractValidAutoClosingPairs(languageId, configuration2);
    const surroundingPairs = this._extractValidSurroundingPairs(languageId, configuration2);
    const colorizedBracketPairs = this._extractValidColorizedBracketPairs(languageId, configuration2);
    const autoCloseBefore = typeof configuration2.autoCloseBefore === "string" ? configuration2.autoCloseBefore : void 0;
    const wordPattern = configuration2.wordPattern ? this._parseRegex(languageId, `wordPattern`, configuration2.wordPattern) : void 0;
    const indentationRules = configuration2.indentationRules ? this._mapIndentationRules(languageId, configuration2.indentationRules) : void 0;
    let folding = void 0;
    if (configuration2.folding) {
      const rawMarkers = configuration2.folding.markers;
      const startMarker = rawMarkers && rawMarkers.start ? this._parseRegex(languageId, `folding.markers.start`, rawMarkers.start) : void 0;
      const endMarker = rawMarkers && rawMarkers.end ? this._parseRegex(languageId, `folding.markers.end`, rawMarkers.end) : void 0;
      const markers = startMarker && endMarker ? { start: startMarker, end: endMarker } : void 0;
      folding = {
        offSide: configuration2.folding.offSide,
        markers
      };
    }
    const onEnterRules = this._extractValidOnEnterRules(languageId, configuration2);
    const richEditConfig = {
      comments,
      brackets,
      wordPattern,
      indentationRules,
      onEnterRules,
      autoClosingPairs,
      surroundingPairs,
      colorizedBracketPairs,
      autoCloseBefore,
      folding,
      __electricCharacterSupport: void 0
    };
    return richEditConfig;
  }
  _handleConfig(languageId, configuration2) {
    const richEditConfig = LanguageConfigurationFileHandler.extractValidConfig(languageId, configuration2);
    this._languageConfigurationService.register(languageId, richEditConfig, 50);
  }
  static _parseRegex(languageId, confPath, value2) {
    if (typeof value2 === "string") {
      try {
        return new RegExp(value2, "");
      } catch (err) {
        console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
        return void 0;
      }
    }
    if (isObject(value2)) {
      if (typeof value2.pattern !== "string") {
        console.warn(`[${languageId}]: language configuration: expected \`${confPath}.pattern\` to be a string.`);
        return void 0;
      }
      if (typeof value2.flags !== "undefined" && typeof value2.flags !== "string") {
        console.warn(`[${languageId}]: language configuration: expected \`${confPath}.flags\` to be a string.`);
        return void 0;
      }
      try {
        return new RegExp(value2.pattern, value2.flags);
      } catch (err) {
        console.warn(`[${languageId}]: Invalid regular expression in \`${confPath}\`: `, err);
        return void 0;
      }
    }
    console.warn(`[${languageId}]: language configuration: expected \`${confPath}\` to be a string or an object.`);
    return void 0;
  }
  static _mapIndentationRules(languageId, indentationRules) {
    const increaseIndentPattern = this._parseRegex(languageId, `indentationRules.increaseIndentPattern`, indentationRules.increaseIndentPattern);
    if (!increaseIndentPattern) {
      return void 0;
    }
    const decreaseIndentPattern = this._parseRegex(languageId, `indentationRules.decreaseIndentPattern`, indentationRules.decreaseIndentPattern);
    if (!decreaseIndentPattern) {
      return void 0;
    }
    const result = {
      increaseIndentPattern,
      decreaseIndentPattern
    };
    if (indentationRules.indentNextLinePattern) {
      result.indentNextLinePattern = this._parseRegex(languageId, `indentationRules.indentNextLinePattern`, indentationRules.indentNextLinePattern);
    }
    if (indentationRules.unIndentedLinePattern) {
      result.unIndentedLinePattern = this._parseRegex(languageId, `indentationRules.unIndentedLinePattern`, indentationRules.unIndentedLinePattern);
    }
    return result;
  }
};

LanguageConfigurationFileHandler = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, IExtensionResourceLoaderService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, ILanguageConfigurationService)
], LanguageConfigurationFileHandler);

var schemaId2 = "vscode://schemas/language-configuration";

var schema2 = {
  allowComments: true,
  allowTrailingCommas: true,
  default: {
    comments: {
      blockComment: ["/*", "*/"],
      lineComment: "//"
    },
    brackets: [["(", ")"], ["[", "]"], ["{", "}"]],
    autoClosingPairs: [["(", ")"], ["[", "]"], ["{", "}"]],
    surroundingPairs: [["(", ")"], ["[", "]"], ["{", "}"]]
  },
  definitions: {
    openBracket: {
      type: "string",
      description: localize(13921, null)
    },
    closeBracket: {
      type: "string",
      description: localize(13866, null)
    },
    bracketPair: {
      type: "array",
      items: [{
        $ref: "#/definitions/openBracket"
      }, {
        $ref: "#/definitions/closeBracket"
      }]
    }
  },
  properties: {
    comments: {
      default: {
        blockComment: ["/*", "*/"],
        lineComment: { comment: "//", noIndent: false }
      },
      description: localize(13868, null),
      type: "object",
      properties: {
        blockComment: {
          type: "array",
          description: localize(13864, null),
          items: [{
            type: "string",
            description: localize(13862, null)
          }, {
            type: "string",
            description: localize(13863, null)
          }]
        },
        lineComment: {
          type: "object",
          description: localize(13899, null),
          properties: {
            comment: {
              type: "string",
              description: localize(13897, null)
            },
            noIndent: {
              type: "boolean",
              description: localize(13898, null),
              default: false
            }
          },
          required: ["comment"],
          additionalProperties: false
        }
      }
    },
    brackets: {
      default: [["(", ")"], ["[", "]"], ["{", "}"]],
      markdownDescription: localize(13865, null, "`colorizedBracketPairs`"),
      type: "array",
      items: {
        $ref: "#/definitions/bracketPair"
      }
    },
    colorizedBracketPairs: {
      default: [["(", ")"], ["[", "]"], ["{", "}"]],
      markdownDescription: localize(13867, null, "`brackets`"),
      type: "array",
      items: {
        $ref: "#/definitions/bracketPair"
      }
    },
    autoClosingPairs: {
      default: [["(", ")"], ["[", "]"], ["{", "}"]],
      description: localize(13860, null),
      type: "array",
      items: {
        oneOf: [{
          $ref: "#/definitions/bracketPair"
        }, {
          type: "object",
          properties: {
            open: {
              $ref: "#/definitions/openBracket"
            },
            close: {
              $ref: "#/definitions/closeBracket"
            },
            notIn: {
              type: "array",
              description: localize(13861, null),
              items: {
                enum: ["string", "comment"]
              }
            }
          }
        }]
      }
    },
    autoCloseBefore: {
      default: ";:.,=}])> \n	",
      description: localize(13859, null),
      type: "string"
    },
    surroundingPairs: {
      default: [["(", ")"], ["[", "]"], ["{", "}"]],
      description: localize(13922, null),
      type: "array",
      items: {
        oneOf: [{
          $ref: "#/definitions/bracketPair"
        }, {
          type: "object",
          properties: {
            open: {
              $ref: "#/definitions/openBracket"
            },
            close: {
              $ref: "#/definitions/closeBracket"
            }
          }
        }]
      }
    },
    wordPattern: {
      default: "",
      description: localize(13923, null),
      type: ["string", "object"],
      properties: {
        pattern: {
          type: "string",
          description: localize(13926, null),
          default: ""
        },
        flags: {
          type: "string",
          description: localize(13924, null),
          default: "g",
          pattern: "^([gimuy]+)$",
          patternErrorMessage: localize(13925, null)
        }
      }
    },
    indentationRules: {
      default: {
        increaseIndentPattern: "",
        decreaseIndentPattern: ""
      },
      description: localize(13880, null),
      type: "object",
      properties: {
        increaseIndentPattern: {
          type: ["string", "object"],
          description: localize(13885, null),
          properties: {
            pattern: {
              type: "string",
              description: localize(13888, null),
              default: ""
            },
            flags: {
              type: "string",
              description: localize(13887, null),
              default: "",
              pattern: "^([gimuy]+)$",
              patternErrorMessage: localize(13886, null)
            }
          }
        },
        decreaseIndentPattern: {
          type: ["string", "object"],
          description: localize(13881, null),
          properties: {
            pattern: {
              type: "string",
              description: localize(13884, null),
              default: ""
            },
            flags: {
              type: "string",
              description: localize(13883, null),
              default: "",
              pattern: "^([gimuy]+)$",
              patternErrorMessage: localize(13882, null)
            }
          }
        },
        indentNextLinePattern: {
          type: ["string", "object"],
          description: localize(13889, null),
          properties: {
            pattern: {
              type: "string",
              description: localize(13892, null),
              default: ""
            },
            flags: {
              type: "string",
              description: localize(13891, null),
              default: "",
              pattern: "^([gimuy]+)$",
              patternErrorMessage: localize(13890, null)
            }
          }
        },
        unIndentedLinePattern: {
          type: ["string", "object"],
          description: localize(13893, null),
          properties: {
            pattern: {
              type: "string",
              description: localize(13896, null),
              default: ""
            },
            flags: {
              type: "string",
              description: localize(13895, null),
              default: "",
              pattern: "^([gimuy]+)$",
              patternErrorMessage: localize(13894, null)
            }
          }
        }
      }
    },
    folding: {
      type: "object",
      description: localize(13869, null),
      properties: {
        offSide: {
          type: "boolean",
          description: localize(13879, null)
        },
        markers: {
          type: "object",
          description: localize(13870, null),
          properties: {
            start: {
              type: ["string", "object"],
              description: localize(13875, null),
              properties: {
                pattern: {
                  type: "string",
                  description: localize(13878, null),
                  default: ""
                },
                flags: {
                  type: "string",
                  description: localize(13877, null),
                  default: "",
                  pattern: "^([gimuy]+)$",
                  patternErrorMessage: localize(13876, null)
                }
              }
            },
            end: {
              type: ["string", "object"],
              description: localize(13871, null),
              properties: {
                pattern: {
                  type: "string",
                  description: localize(13874, null),
                  default: ""
                },
                flags: {
                  type: "string",
                  description: localize(13873, null),
                  default: "",
                  pattern: "^([gimuy]+)$",
                  patternErrorMessage: localize(13872, null)
                }
              }
            }
          }
        }
      }
    },
    onEnterRules: {
      type: "array",
      description: localize(13900, null),
      items: {
        type: "object",
        description: localize(13900, null),
        required: ["beforeText", "action"],
        properties: {
          beforeText: {
            type: ["string", "object"],
            description: localize(13913, null),
            properties: {
              pattern: {
                type: "string",
                description: localize(13916, null),
                default: ""
              },
              flags: {
                type: "string",
                description: localize(13915, null),
                default: "",
                pattern: "^([gimuy]+)$",
                patternErrorMessage: localize(13914, null)
              }
            }
          },
          afterText: {
            type: ["string", "object"],
            description: localize(13909, null),
            properties: {
              pattern: {
                type: "string",
                description: localize(13912, null),
                default: ""
              },
              flags: {
                type: "string",
                description: localize(13911, null),
                default: "",
                pattern: "^([gimuy]+)$",
                patternErrorMessage: localize(13910, null)
              }
            }
          },
          previousLineText: {
            type: ["string", "object"],
            description: localize(13917, null),
            properties: {
              pattern: {
                type: "string",
                description: localize(13920, null),
                default: ""
              },
              flags: {
                type: "string",
                description: localize(13919, null),
                default: "",
                pattern: "^([gimuy]+)$",
                patternErrorMessage: localize(13918, null)
              }
            }
          },
          action: {
            type: ["string", "object"],
            description: localize(13901, null),
            required: ["indent"],
            default: { "indent": "indent" },
            properties: {
              indent: {
                type: "string",
                description: localize(13903, null),
                default: "indent",
                enum: ["none", "indent", "indentOutdent", "outdent"],
                markdownEnumDescriptions: [
                  localize(13906, null),
                  localize(13904, null),
                  localize(13905, null),
                  localize(13907, null)
                ]
              },
              appendText: {
                type: "string",
                description: localize(13902, null),
                default: ""
              },
              removeText: {
                type: "number",
                description: localize(13908, null),
                default: 0
              }
            }
          }
        }
      }
    }
  }
};

var schemaRegistry5 = Registry.as(Extensions3.JSONContribution);

schemaRegistry5.registerSchema(schemaId2, schema2);
export { isStringArr, isCharacterPair, LanguageConfigurationFileHandler, schemaId2, schema2, schemaRegistry5 };
