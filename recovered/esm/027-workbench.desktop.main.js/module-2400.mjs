// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/replModel.ts
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { ExpressionContainer } from "./module-1064.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";


// src/vs/workbench/contrib/debug/common/replModel.ts
var topReplElementCounter = 0;

var getUniqueId = () => `topReplElement:${topReplElementCounter++}`;

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

function areSourcesEqual(first2, second) {
  if (!first2 && !second) {
    return true;
  }
  if (first2 && second) {
    return first2.column === second.column && first2.lineNumber === second.lineNumber && first2.source.uri.toString() === second.source.uri.toString();
  }
  return false;
}

var ReplModel = class _ReplModel {
  constructor(configurationService) {
    this.configurationService = configurationService;
    this.replElements = [];
    this._onDidChangeElements = new Emitter();
    this.onDidChangeElements = this._onDidChangeElements.event;
  }
  getReplElements() {
    return this.replElements;
  }
  async addReplExpression(session, stackFrame, expression) {
    this.addReplElement(new ReplEvaluationInput(expression));
    const result = new ReplEvaluationResult(expression);
    await result.evaluateExpression(expression, session, stackFrame, "repl");
    this.addReplElement(result);
  }
  appendToRepl(session, { output, expression, sev, source }) {
    const clearAnsiSequence = "\x1B[2J";
    const clearAnsiIndex = output.lastIndexOf(clearAnsiSequence);
    if (clearAnsiIndex !== -1) {
      this.removeReplExpressions();
      this.appendToRepl(session, { output: localize(14866, null), sev: severity_default.Ignore });
      output = output.substring(clearAnsiIndex + clearAnsiSequence.length);
    }
    if (expression) {
      this.addReplElement(output ? new ReplOutputElement(session, getUniqueId(), output, sev, source, expression) : new ReplVariableElement(session, expression, sev, source));
      return;
    }
    this.appendOutputToRepl(session, output, sev, source);
  }
  appendOutputToRepl(session, output, sev, source) {
    const config = this.configurationService.getValue("debug");
    const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : void 0;
    if (previousElement instanceof ReplOutputElement && previousElement.severity === sev && areSourcesEqual(previousElement.sourceData, source)) {
      if (!previousElement.value.endsWith("\n") && !previousElement.value.endsWith("\r\n") && previousElement.count === 1) {
        const combinedOutput = previousElement.value + output;
        this.replElements[this.replElements.length - 1] = new ReplOutputElement(
          session,
          getUniqueId(),
          combinedOutput,
          sev,
          source
        );
        this._onDidChangeElements.fire(void 0);
        if (config.console.collapseIdenticalLines && combinedOutput.endsWith("\n")) {
          this.tryCollapseCompleteLine(sev, source);
        }
        if (config.console.collapseIdenticalLines && combinedOutput.includes("\n")) {
          const lines = this.splitIntoLines(combinedOutput);
          if (lines.length > 1) {
            this.applyLineLevelCollapsing(session, sev, source);
          }
        }
        return;
      }
    }
    if (config.console.collapseIdenticalLines && output.includes("\n")) {
      this.processMultiLineOutput(session, output, sev, source);
    } else {
      if (previousElement instanceof ReplOutputElement && previousElement.severity === sev && areSourcesEqual(previousElement.sourceData, source)) {
        if (previousElement.value === output && config.console.collapseIdenticalLines) {
          previousElement.count++;
          return;
        }
      }
      const element = new ReplOutputElement(session, getUniqueId(), output, sev, source);
      this.addReplElement(element);
    }
  }
  tryCollapseCompleteLine(sev, source) {
    if (this.replElements.length < 2) {
      return;
    }
    const lastElement = this.replElements[this.replElements.length - 1];
    const secondToLastElement = this.replElements[this.replElements.length - 2];
    if (lastElement instanceof ReplOutputElement && secondToLastElement instanceof ReplOutputElement && lastElement.severity === sev && secondToLastElement.severity === sev && areSourcesEqual(lastElement.sourceData, source) && areSourcesEqual(secondToLastElement.sourceData, source) && lastElement.value === secondToLastElement.value && lastElement.count === 1 && lastElement.value.endsWith("\n")) {
      secondToLastElement.count += lastElement.count;
      this.replElements.pop();
      this._onDidChangeElements.fire(void 0);
    }
  }
  processMultiLineOutput(session, output, sev, source) {
    const lines = this.splitIntoLines(output);
    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }
      const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : void 0;
      if (previousElement instanceof ReplOutputElement && previousElement.severity === sev && areSourcesEqual(previousElement.sourceData, source) && previousElement.value === line) {
        previousElement.count++;
      } else {
        const element = new ReplOutputElement(session, getUniqueId(), line, sev, source);
        this.addReplElement(element);
      }
    }
  }
  splitIntoLines(text2) {
    const lines = [];
    let start = 0;
    while (start < text2.length) {
      const nextLF = text2.indexOf("\n", start);
      if (nextLF === -1) {
        lines.push(text2.substring(start));
        break;
      }
      lines.push(text2.substring(start, nextLF + 1));
      start = nextLF + 1;
    }
    return lines;
  }
  applyLineLevelCollapsing(session, sev, source) {
    const lastElement = this.replElements[this.replElements.length - 1];
    if (!(lastElement instanceof ReplOutputElement) || lastElement.severity !== sev || !areSourcesEqual(lastElement.sourceData, source)) {
      return;
    }
    const lines = this.splitIntoLines(lastElement.value);
    if (lines.length <= 1) {
      return;
    }
    this.replElements.pop();
    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }
      const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : void 0;
      if (previousElement instanceof ReplOutputElement && previousElement.severity === sev && areSourcesEqual(previousElement.sourceData, source) && previousElement.value === line) {
        previousElement.count++;
      } else {
        const element = new ReplOutputElement(session, getUniqueId(), line, sev, source);
        this.addReplElement(element);
      }
    }
    this._onDidChangeElements.fire(void 0);
  }
  startGroup(session, name, autoExpand, sourceData) {
    const group2 = new ReplGroup(session, name, autoExpand, sourceData);
    this.addReplElement(group2);
  }
  endGroup() {
    const lastElement = this.replElements[this.replElements.length - 1];
    if (lastElement instanceof ReplGroup) {
      lastElement.end();
    }
  }
  addReplElement(newElement) {
    const lastElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : void 0;
    if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
      lastElement.addChild(newElement);
    } else {
      this.replElements.push(newElement);
      const config = this.configurationService.getValue("debug");
      if (this.replElements.length > config.console.maximumLines) {
        this.replElements.splice(0, this.replElements.length - config.console.maximumLines);
      }
    }
    this._onDidChangeElements.fire(newElement);
  }
  removeReplExpressions() {
    if (this.replElements.length > 0) {
      this.replElements = [];
      this._onDidChangeElements.fire(void 0);
    }
  }
  /** Returns a new REPL model that's a copy of this one. */
  clone() {
    const newRepl = new _ReplModel(this.configurationService);
    newRepl.replElements = this.replElements.slice();
    return newRepl;
  }
};
export { areSourcesEqual, topReplElementCounter, getUniqueId, ReplOutputElement, ReplVariableElement, RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, ReplModel };
