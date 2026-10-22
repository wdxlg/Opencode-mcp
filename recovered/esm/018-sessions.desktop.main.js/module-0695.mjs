// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/validation.ts
import { mapFilter } from "./module-0007.mjs";


// src/vs/base/common/validation.ts
var ValidatorBase = class {
  validateOrThrow(content) {
    const result = this.validate(content);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.content;
  }
};

var TypeofValidator = class extends ValidatorBase {
  constructor(type) {
    super();
    this.type = type;
  }
  validate(content) {
    if (typeof content !== this.type) {
      return { content: void 0, error: { message: `Expected ${this.type}, but got ${typeof content}` } };
    }
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return { type: this.type };
  }
};

var vStringValidator = new TypeofValidator("string");

function vString() {
  return vStringValidator;
}

var vNumberValidator = new TypeofValidator("number");

var vBooleanValidator = new TypeofValidator("boolean");

function vBoolean() {
  return vBooleanValidator;
}

var vObjAnyValidator = new TypeofValidator("object");

var UncheckedValidator = class extends ValidatorBase {
  validate(content) {
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return {};
  }
};

function vUnchecked() {
  return new UncheckedValidator();
}

var UndefinedValidator = class extends ValidatorBase {
  validate(content) {
    if (content !== void 0) {
      return { content: void 0, error: { message: `Expected undefined, but got ${typeof content}` } };
    }
    return { content: void 0, error: void 0 };
  }
  getJSONSchema() {
    return {};
  }
};

function vUndefined() {
  return new UndefinedValidator();
}

var Optional = class {
  constructor(validator) {
    this.validator = validator;
  }
};

function vOptionalProp(validator) {
  return new Optional(validator);
}

var ObjValidator = class extends ValidatorBase {
  constructor(properties) {
    super();
    this.properties = properties;
  }
  validate(content) {
    if (typeof content !== "object" || content === null) {
      return { content: void 0, error: { message: "Expected object" } };
    }
    const result = {};
    for (const key3 in this.properties) {
      const prop = this.properties[key3];
      const fieldValue = content[key3];
      const isOptional = prop instanceof Optional;
      const validator = isOptional ? prop.validator : prop;
      if (isOptional && fieldValue === void 0) {
        continue;
      }
      const { content: value2, error } = validator.validate(fieldValue);
      if (error) {
        return { content: void 0, error: { message: `Error in property '${key3}': ${error.message}` } };
      }
      result[key3] = value2;
    }
    return { content: result, error: void 0 };
  }
  getJSONSchema() {
    const requiredFields = [];
    const schemaProperties = {};
    for (const [key3, prop] of Object.entries(this.properties)) {
      const isOptional = prop instanceof Optional;
      const validator = isOptional ? prop.validator : prop;
      schemaProperties[key3] = validator.getJSONSchema();
      if (!isOptional) {
        requiredFields.push(key3);
      }
    }
    const schema10 = {
      type: "object",
      properties: schemaProperties,
      ...requiredFields.length > 0 ? { required: requiredFields } : {}
    };
    return schema10;
  }
};

function vObj(properties) {
  return new ObjValidator(properties);
}

var UnionValidator = class extends ValidatorBase {
  constructor(validators) {
    super();
    this.validators = validators;
  }
  validate(content) {
    let lastError;
    for (const validator of this.validators) {
      const { content: value2, error } = validator.validate(content);
      if (!error) {
        return { content: value2, error: void 0 };
      }
      lastError = error;
    }
    return { content: void 0, error: lastError };
  }
  getJSONSchema() {
    return {
      oneOf: mapFilter(this.validators, (validator) => {
        if (validator instanceof UndefinedValidator) {
          return void 0;
        }
        return validator.getJSONSchema();
      })
    };
  }
};

function vUnion(...validators) {
  return new UnionValidator(validators);
}

var EnumValidator = class extends ValidatorBase {
  constructor(values) {
    super();
    this.values = values;
  }
  validate(content) {
    if (this.values.indexOf(content) === -1) {
      return { content: void 0, error: { message: `Expected one of: ${this.values.join(", ")}` } };
    }
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return {
      enum: this.values
    };
  }
};

function vEnum(...values) {
  return new EnumValidator(values);
}

var UseRefSchemaValidator = class extends ValidatorBase {
  constructor(_ref2, _validator) {
    super();
    this._ref = _ref2;
    this._validator = _validator;
  }
  validate(content) {
    return this._validator.validate(content);
  }
  getJSONSchema() {
    return { $ref: this._ref };
  }
};

function vWithJsonSchemaRef(ref, validator) {
  return new UseRefSchemaValidator(ref, validator);
}
export { vString, vBoolean, vUnchecked, vUndefined, vOptionalProp, vObj, vUnion, vEnum, vWithJsonSchemaRef, ValidatorBase, TypeofValidator, vStringValidator, vNumberValidator, vBooleanValidator, vObjAnyValidator, UncheckedValidator, UndefinedValidator, Optional, ObjValidator, UnionValidator, EnumValidator, UseRefSchemaValidator };
