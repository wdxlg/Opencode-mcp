// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/validation.ts
import { mapFilter } from "./module-0005.mjs";


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

function vNumber() {
  return vNumberValidator;
}

var vBooleanValidator = new TypeofValidator("boolean");

var vObjAnyValidator = new TypeofValidator("object");

function vObjAny() {
  return vObjAnyValidator;
}

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

function vUnknown() {
  return vUnchecked();
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
    for (const key in this.properties) {
      const prop = this.properties[key];
      const fieldValue = content[key];
      const isOptional = prop instanceof Optional;
      const validator = isOptional ? prop.validator : prop;
      if (isOptional && fieldValue === void 0) {
        continue;
      }
      const { content: value, error } = validator.validate(fieldValue);
      if (error) {
        return { content: void 0, error: { message: `Error in property '${key}': ${error.message}` } };
      }
      result[key] = value;
    }
    return { content: result, error: void 0 };
  }
  getJSONSchema() {
    const requiredFields = [];
    const schemaProperties = {};
    for (const [key, prop] of Object.entries(this.properties)) {
      const isOptional = prop instanceof Optional;
      const validator = isOptional ? prop.validator : prop;
      schemaProperties[key] = validator.getJSONSchema();
      if (!isOptional) {
        requiredFields.push(key);
      }
    }
    const schema = {
      type: "object",
      properties: schemaProperties,
      ...requiredFields.length > 0 ? { required: requiredFields } : {}
    };
    return schema;
  }
};

function vObj(properties) {
  return new ObjValidator(properties);
}

var ArrayValidator = class extends ValidatorBase {
  constructor(validator) {
    super();
    this.validator = validator;
  }
  validate(content) {
    if (!Array.isArray(content)) {
      return { content: void 0, error: { message: "Expected array" } };
    }
    const result = [];
    for (let i = 0; i < content.length; i++) {
      const { content: value, error } = this.validator.validate(content[i]);
      if (error) {
        return { content: void 0, error: { message: `Error in element ${i}: ${error.message}` } };
      }
      result.push(value);
    }
    return { content: result, error: void 0 };
  }
  getJSONSchema() {
    return {
      type: "array",
      items: this.validator.getJSONSchema()
    };
  }
};

function vArray(validator) {
  return new ArrayValidator(validator);
}

var UnionValidator = class extends ValidatorBase {
  constructor(validators) {
    super();
    this.validators = validators;
  }
  validate(content) {
    let lastError;
    for (const validator of this.validators) {
      const { content: value, error } = validator.validate(content);
      if (!error) {
        return { content: value, error: void 0 };
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

var LiteralValidator = class extends ValidatorBase {
  constructor(value) {
    super();
    this.value = value;
  }
  validate(content) {
    if (content !== this.value) {
      return { content: void 0, error: { message: `Expected: ${this.value}` } };
    }
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return {
      const: this.value
    };
  }
};

function vLiteral(value) {
  return new LiteralValidator(value);
}
export { vString, vNumber, vObjAny, vUnchecked, vUnknown, vOptionalProp, vObj, vArray, vUnion, vEnum, vLiteral, ValidatorBase, TypeofValidator, vStringValidator, vNumberValidator, vBooleanValidator, vObjAnyValidator, UncheckedValidator, UndefinedValidator, Optional, ObjValidator, ArrayValidator, UnionValidator, EnumValidator, LiteralValidator };
