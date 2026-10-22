// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/common/preferencesValidation.ts
import { isObject, isString, isStringArray, isUndefinedOrNull } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { Color } from "./module-0197.mjs";


// src/vs/workbench/services/preferences/common/preferencesValidation.ts
function canBeType(propTypes, ...types) {
  return types.some((t2) => propTypes.includes(t2));
}

function isNullOrEmpty(value2) {
  return value2 === "" || isUndefinedOrNull(value2);
}

function createValidator(prop) {
  const type = Array.isArray(prop.type) ? prop.type : [prop.type];
  const isNullable = canBeType(type, "null");
  const isNumeric = (canBeType(type, "number") || canBeType(type, "integer")) && (type.length === 1 || type.length === 2 && isNullable);
  const numericValidations = getNumericValidators(prop);
  const stringValidations = getStringValidators(prop);
  const arrayValidator = getArrayValidator(prop);
  const objectValidator = getObjectValidator(prop);
  return (value2) => {
    if (isNullable && isNullOrEmpty(value2)) {
      return "";
    }
    const errors = [];
    if (arrayValidator) {
      const err = arrayValidator(value2);
      if (err) {
        errors.push(err);
      }
    }
    if (objectValidator) {
      const err = objectValidator(value2);
      if (err) {
        errors.push(err);
      }
    }
    if (prop.type === "boolean" && value2 !== true && value2 !== false) {
      errors.push(localize(23296, null));
    }
    if (isNumeric) {
      if (isNullOrEmpty(value2) || typeof value2 === "boolean" || Array.isArray(value2) || isNaN(+value2)) {
        errors.push(localize(23301, null));
      } else {
        errors.push(...numericValidations.filter((validator) => !validator.isValid(+value2)).map((validator) => validator.message));
      }
    }
    if (prop.type === "string") {
      if (prop.enum && !isStringArray(prop.enum)) {
        errors.push(localize(23318, null));
      } else if (!isString(value2)) {
        errors.push(localize(23319, null));
      } else {
        errors.push(...stringValidations.filter((validator) => !validator.isValid(value2)).map((validator) => validator.message));
      }
    }
    if (errors.length) {
      return prop.errorMessage ? [prop.errorMessage, ...errors].join(" ") : errors.join(" ");
    }
    return "";
  };
}

function getInvalidTypeError(value2, type) {
  if (typeof type === "undefined") {
    return;
  }
  const typeArr = Array.isArray(type) ? type : [type];
  if (!typeArr.some((_type) => valueValidatesAsType(value2, _type))) {
    return localize(23293, null, JSON.stringify(type));
  }
  return;
}

function valueValidatesAsType(value2, type) {
  const valueType = typeof value2;
  if (type === "boolean") {
    return valueType === "boolean";
  } else if (type === "object") {
    return value2 && !Array.isArray(value2) && valueType === "object";
  } else if (type === "null") {
    return value2 === null;
  } else if (type === "array") {
    return Array.isArray(value2);
  } else if (type === "string") {
    return valueType === "string";
  } else if (type === "number" || type === "integer") {
    return valueType === "number";
  }
  return true;
}

function toRegExp2(pattern) {
  try {
    return new RegExp(pattern, "u");
  } catch (e) {
    try {
      return new RegExp(pattern);
    } catch (e2) {
      console.error(localize(23294, null), pattern);
      return /.*/;
    }
  }
}

function getStringValidators(prop) {
  const uriRegex = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  let patternRegex;
  if (typeof prop.pattern === "string") {
    patternRegex = toRegExp2(prop.pattern);
  }
  return [
    {
      enabled: prop.maxLength !== void 0,
      isValid: ((value2) => value2.length <= prop.maxLength),
      message: localize(23304, null, prop.maxLength)
    },
    {
      enabled: prop.minLength !== void 0,
      isValid: ((value2) => value2.length >= prop.minLength),
      message: localize(23306, null, prop.minLength)
    },
    {
      enabled: patternRegex !== void 0,
      isValid: ((value2) => patternRegex.test(value2)),
      message: prop.patternErrorMessage || localize(23311, null, prop.pattern)
    },
    {
      enabled: prop.format === "color-hex",
      isValid: ((value2) => Color.Format.CSS.parseHex(value2)),
      message: localize(23297, null)
    },
    {
      enabled: prop.format === "uri" || prop.format === "uri-reference",
      isValid: ((value2) => !!value2.length),
      message: localize(23320, null)
    },
    {
      enabled: prop.format === "uri" || prop.format === "uri-reference",
      isValid: ((value2) => uriRegex.test(value2)),
      message: localize(23321, null)
    },
    {
      enabled: prop.format === "uri",
      isValid: ((value2) => {
        const matches2 = value2.match(uriRegex);
        return !!(matches2 && matches2[2]);
      }),
      message: localize(23322, null)
    },
    {
      enabled: prop.enum !== void 0,
      isValid: ((value2) => {
        return prop.enum.includes(value2);
      }),
      message: localize(
        23302,
        null,
        prop.enum ? prop.enum.map((key3) => `"${key3}"`).join(", ") : "[]"
      )
    }
  ].filter((validation) => validation.enabled);
}

function getNumericValidators(prop) {
  const type = Array.isArray(prop.type) ? prop.type : [prop.type];
  const isNullable = canBeType(type, "null");
  const isIntegral = canBeType(type, "integer") && (type.length === 1 || type.length === 2 && isNullable);
  const isNumeric = canBeType(type, "number", "integer") && (type.length === 1 || type.length === 2 && isNullable);
  if (!isNumeric) {
    return [];
  }
  let exclusiveMax;
  let exclusiveMin;
  if (typeof prop.exclusiveMaximum === "boolean") {
    exclusiveMax = prop.exclusiveMaximum ? prop.maximum : void 0;
  } else {
    exclusiveMax = prop.exclusiveMaximum;
  }
  if (typeof prop.exclusiveMinimum === "boolean") {
    exclusiveMin = prop.exclusiveMinimum ? prop.minimum : void 0;
  } else {
    exclusiveMin = prop.exclusiveMinimum;
  }
  return [
    {
      enabled: exclusiveMax !== void 0 && (prop.maximum === void 0 || exclusiveMax <= prop.maximum),
      isValid: ((value2) => value2 < exclusiveMax),
      message: localize(23298, null, exclusiveMax)
    },
    {
      enabled: exclusiveMin !== void 0 && (prop.minimum === void 0 || exclusiveMin >= prop.minimum),
      isValid: ((value2) => value2 > exclusiveMin),
      message: localize(23299, null, exclusiveMin)
    },
    {
      enabled: prop.maximum !== void 0 && (exclusiveMax === void 0 || exclusiveMax > prop.maximum),
      isValid: ((value2) => value2 <= prop.maximum),
      message: localize(23303, null, prop.maximum)
    },
    {
      enabled: prop.minimum !== void 0 && (exclusiveMin === void 0 || exclusiveMin < prop.minimum),
      isValid: ((value2) => value2 >= prop.minimum),
      message: localize(23305, null, prop.minimum)
    },
    {
      enabled: prop.multipleOf !== void 0,
      isValid: ((value2) => value2 % prop.multipleOf === 0),
      message: localize(23307, null, prop.multipleOf)
    },
    {
      enabled: isIntegral,
      isValid: ((value2) => value2 % 1 === 0),
      message: localize(23300, null)
    }
  ].filter((validation) => validation.enabled);
}

function getArrayValidator(prop) {
  if (prop.type === "array" && prop.items && !Array.isArray(prop.items)) {
    const propItems = prop.items;
    if (propItems && !Array.isArray(propItems.type)) {
      const withQuotes = (s) => `'` + s + `'`;
      return (value2) => {
        if (!value2) {
          return null;
        }
        let message = "";
        if (!Array.isArray(value2)) {
          message += localize(23295, null);
          message += "\n";
          return message;
        }
        const arrayValue = value2;
        if (prop.uniqueItems) {
          if (new Set(arrayValue).size < arrayValue.length) {
            message += localize(23317, null);
            message += "\n";
          }
        }
        if (prop.minItems && arrayValue.length < prop.minItems) {
          message += localize(23316, null, prop.minItems);
          message += "\n";
        }
        if (prop.maxItems && arrayValue.length > prop.maxItems) {
          message += localize(23315, null, prop.maxItems);
          message += "\n";
        }
        if (propItems.type === "string") {
          if (!isStringArray(arrayValue)) {
            message += localize(23312, null);
            message += "\n";
            return message;
          }
          if (typeof propItems.pattern === "string") {
            const patternRegex = toRegExp2(propItems.pattern);
            arrayValue.forEach((v2) => {
              if (!patternRegex.test(v2)) {
                message += propItems.patternErrorMessage || localize(
                  23314,
                  null,
                  withQuotes(v2),
                  withQuotes(propItems.pattern)
                );
              }
            });
          }
          const propItemsEnum = propItems.enum;
          if (propItemsEnum) {
            arrayValue.forEach((v2) => {
              if (propItemsEnum.indexOf(v2) === -1) {
                message += localize(
                  23313,
                  null,
                  withQuotes(v2),
                  "[" + propItemsEnum.map(withQuotes).join(", ") + "]"
                );
                message += "\n";
              }
            });
          }
        } else if (propItems.type === "integer" || propItems.type === "number") {
          arrayValue.forEach((v2) => {
            const errorMessage = getErrorsForSchema(propItems, v2);
            if (errorMessage) {
              message += `${v2}: ${errorMessage}
`;
            }
          });
        }
        return message;
      };
    }
  }
  return null;
}

function getObjectValidator(prop) {
  if (prop.type === "object") {
    const { properties, patternProperties, additionalProperties, propertyNames } = prop;
    return (value2) => {
      if (!value2) {
        return null;
      }
      const errors = [];
      let propertyNamesErrorShown = false;
      if (!isObject(value2)) {
        errors.push(localize(23308, null));
      } else {
        Object.keys(value2).forEach((key3) => {
          const data = value2[key3];
          if (propertyNames?.pattern && !propertyNamesErrorShown) {
            const patternRegex = toRegExp2(propertyNames.pattern);
            if (!patternRegex.test(key3)) {
              const errorMessage = propertyNames.patternErrorMessage || localize(23310, null, propertyNames.pattern);
              errors.push(errorMessage + "\n");
              propertyNamesErrorShown = true;
            }
          }
          if (properties && key3 in properties) {
            const errorMessage = getErrorsForSchema(properties[key3], data);
            if (errorMessage) {
              errors.push(`${key3}: ${errorMessage}
`);
            }
            return;
          }
          if (patternProperties) {
            for (const pattern in patternProperties) {
              if (RegExp(pattern).test(key3)) {
                const errorMessage = getErrorsForSchema(patternProperties[pattern], data);
                if (errorMessage) {
                  errors.push(`${key3}: ${errorMessage}
`);
                }
                return;
              }
            }
          }
          if (additionalProperties === false) {
            errors.push(localize(23309, null, key3));
          } else if (typeof additionalProperties === "object") {
            const errorMessage = getErrorsForSchema(additionalProperties, data);
            if (errorMessage) {
              errors.push(`${key3}: ${errorMessage}
`);
            }
          }
        });
      }
      if (errors.length) {
        return prop.errorMessage ? [prop.errorMessage, ...errors].join(" ") : errors.join(" ");
      }
      return "";
    };
  }
  return null;
}

function validatePropertyName(propertyNames, key3) {
  if (!propertyNames?.pattern) {
    return true;
  }
  const patternRegex = toRegExp2(propertyNames.pattern);
  return patternRegex.test(key3);
}

function getErrorsForSchema(propertySchema, data) {
  const validator = createValidator(propertySchema);
  const errorMessage = validator(data);
  return errorMessage;
}
export { canBeType, isNullOrEmpty, createValidator, getInvalidTypeError, valueValidatesAsType, toRegExp2, getStringValidators, getNumericValidators, getArrayValidator, getObjectValidator, validatePropertyName, getErrorsForSchema };
