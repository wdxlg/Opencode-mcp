// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/replModel.ts
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { ExpressionContainer } from "./module-1065.mjs";


// src/vs/workbench/contrib/debug/common/replModel.ts
var ReplOutputElement = class {
  constructor(session, id2, value2, severity, sourceData, expression) {
    this.session = session;
    this.id = id2;
    this.value = value2;
    this.severity = severity;
    this.sourceData = sourceData;
    this.expression = expression;
    this._count = 1;
    this._onDidChangeCount = new Emitter();
  }
  toString(includeSource = false) {
    let valueRespectCount = this.value;
    for (let i2 = 1; i2 < this.count; i2++) {
      valueRespectCount += (valueRespectCount.endsWith("\n") ? "" : "\n") + this.value;
    }
    const sourceStr = this.sourceData && includeSource ? ` ${this.sourceData.source.name}` : "";
    return valueRespectCount + sourceStr;
  }
  getId() {
    return this.id;
  }
  getChildren() {
    return this.expression?.getChildren() || Promise.resolve([]);
  }
  set count(value2) {
    this._count = value2;
    this._onDidChangeCount.fire();
  }
  get count() {
    return this._count;
  }
  get onDidChangeCount() {
    return this._onDidChangeCount.event;
  }
  get hasChildren() {
    return !!this.expression?.hasChildren;
  }
};

var ReplVariableElement = class {
  constructor(session, expression, severity, sourceData) {
    this.session = session;
    this.expression = expression;
    this.severity = severity;
    this.sourceData = sourceData;
    this.id = generateUuid();
    this.hasChildren = expression.hasChildren;
  }
  getSession() {
    return this.session;
  }
  getChildren() {
    return this.expression.getChildren();
  }
  toString() {
    return this.expression.toString();
  }
  getId() {
    return this.id;
  }
};

var RawObjectReplElement = class _RawObjectReplElement {
  // upper bound of children per value
  constructor(id2, name, valueObj, sourceData, annotation) {
    this.id = id2;
    this.name = name;
    this.valueObj = valueObj;
    this.sourceData = sourceData;
    this.annotation = annotation;
  }
  static {
    this.MAX_CHILDREN = 1e3;
  }
  getId() {
    return this.id;
  }
  getSession() {
    return void 0;
  }
  get value() {
    if (this.valueObj === null) {
      return "null";
    } else if (Array.isArray(this.valueObj)) {
      return `Array[${this.valueObj.length}]`;
    } else if (isObject(this.valueObj)) {
      return "Object";
    } else if (isString(this.valueObj)) {
      return `"${this.valueObj}"`;
    }
    return String(this.valueObj) || "";
  }
  get hasChildren() {
    return Array.isArray(this.valueObj) && this.valueObj.length > 0 || isObject(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0;
  }
  evaluateLazy() {
    throw new Error("Method not implemented.");
  }
  getChildren() {
    let result = [];
    if (Array.isArray(this.valueObj)) {
      result = this.valueObj.slice(0, _RawObjectReplElement.MAX_CHILDREN).map((v2, index2) => new _RawObjectReplElement(`${this.id}:${index2}`, String(index2), v2));
    } else if (isObject(this.valueObj)) {
      result = Object.getOwnPropertyNames(this.valueObj).slice(0, _RawObjectReplElement.MAX_CHILDREN).map((key3, index2) => new _RawObjectReplElement(`${this.id}:${index2}`, key3, this.valueObj[key3]));
    }
    return Promise.resolve(result);
  }
  toString() {
    return `${this.name}
${this.value}`;
  }
};

var ReplEvaluationInput = class {
  constructor(value2) {
    this.value = value2;
    this.id = generateUuid();
  }
  toString() {
    return this.value;
  }
  getId() {
    return this.id;
  }
};

var ReplEvaluationResult = class extends ExpressionContainer {
  constructor(originalExpression) {
    super(void 0, void 0, 0, generateUuid());
    this.originalExpression = originalExpression;
    this._available = true;
  }
  get available() {
    return this._available;
  }
  async evaluateExpression(expression, session, stackFrame, context2) {
    const result = await super.evaluateExpression(expression, session, stackFrame, context2);
    this._available = result;
    return result;
  }
  toString() {
    return `${this.value}`;
  }
};

var ReplGroup = class _ReplGroup {
  constructor(session, name, autoExpand, sourceData) {
    this.session = session;
    this.name = name;
    this.autoExpand = autoExpand;
    this.sourceData = sourceData;
    this.children = [];
    this.ended = false;
    this.id = `replGroup:${_ReplGroup.COUNTER++}`;
  }
  static {
    this.COUNTER = 0;
  }
  get hasChildren() {
    return true;
  }
  getId() {
    return this.id;
  }
  toString(includeSource = false) {
    const sourceStr = includeSource && this.sourceData ? ` ${this.sourceData.source.name}` : "";
    return this.name + sourceStr;
  }
  addChild(child) {
    const lastElement = this.children.length ? this.children[this.children.length - 1] : void 0;
    if (lastElement instanceof _ReplGroup && !lastElement.hasEnded) {
      lastElement.addChild(child);
    } else {
      this.children.push(child);
    }
  }
  getChildren() {
    return this.children;
  }
  end() {
    const lastElement = this.children.length ? this.children[this.children.length - 1] : void 0;
    if (lastElement instanceof _ReplGroup && !lastElement.hasEnded) {
      lastElement.end();
    } else {
      this.ended = true;
    }
  }
  get hasEnded() {
    return this.ended;
  }
};
export { ReplOutputElement, ReplVariableElement, RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup };
