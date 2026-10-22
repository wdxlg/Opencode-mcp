// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugModel.ts
import { isString, isUndefinedOrNull } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Emitter, trackSetChanges } from "./module-0017.mjs";
import { stringHash } from "./module-0039.mjs";
import { Range2 } from "./module-0106.mjs";
import { UNKNOWN_SOURCE_LABEL, getUriFromSource } from "./module-1062.mjs";
import { DisassemblyViewInput } from "./module-1063.mjs";
import { URI } from "./module-0032.mjs";
import { DEBUG_MEMORY_SCHEME } from "./module-1058.mjs";
import { mixin } from "./module-0098.mjs";
import { distinct } from "./module-0007.mjs";
import { basenameOrAuthority } from "./module-0034.mjs";
import { Disposable } from "./module-0012.mjs";
import { DeferredPromise, RunOnceScheduler } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/debug/common/debugModel.ts
var ExpressionContainer = class _ExpressionContainer {
  constructor(session, threadId, _reference, id2, namedVariables = 0, indexedVariables = 0, memoryReference = void 0, startOfVariables = 0, presentationHint = void 0, valueLocationReference = void 0) {
    this.session = session;
    this.threadId = threadId;
    this._reference = _reference;
    this.id = id2;
    this.namedVariables = namedVariables;
    this.indexedVariables = indexedVariables;
    this.memoryReference = memoryReference;
    this.startOfVariables = startOfVariables;
    this.presentationHint = presentationHint;
    this.valueLocationReference = valueLocationReference;
    this.valueChanged = false;
    this._value = "";
  }
  static {
    this.allValues = /* @__PURE__ */ new Map();
  }
  static {
    // Use chunks to support variable paging #9537
    this.BASE_CHUNK_SIZE = 100;
  }
  get reference() {
    return this._reference;
  }
  set reference(value2) {
    this._reference = value2;
    this.children = void 0;
  }
  async evaluateLazy() {
    if (typeof this.reference === "undefined") {
      return;
    }
    const response = await this.session.variables(this.reference, this.threadId, void 0, void 0, void 0);
    if (!response || !response.body || !response.body.variables || response.body.variables.length !== 1) {
      return;
    }
    const dummyVar = response.body.variables[0];
    this.reference = dummyVar.variablesReference;
    this._value = dummyVar.value;
    this.namedVariables = dummyVar.namedVariables;
    this.indexedVariables = dummyVar.indexedVariables;
    this.memoryReference = dummyVar.memoryReference;
    this.presentationHint = dummyVar.presentationHint;
    this.valueLocationReference = dummyVar.valueLocationReference;
    this.adoptLazyResponse(dummyVar);
  }
  adoptLazyResponse(response) {
  }
  getChildren() {
    if (!this.children) {
      this.children = this.doGetChildren();
    }
    return this.children;
  }
  async doGetChildren() {
    if (!this.hasChildren) {
      return [];
    }
    if (!this.getChildrenInChunks) {
      return this.fetchVariables(void 0, void 0, void 0);
    }
    const children = this.namedVariables ? await this.fetchVariables(void 0, void 0, "named") : [];
    let chunkSize = _ExpressionContainer.BASE_CHUNK_SIZE;
    while (!!this.indexedVariables && this.indexedVariables > chunkSize * _ExpressionContainer.BASE_CHUNK_SIZE) {
      chunkSize *= _ExpressionContainer.BASE_CHUNK_SIZE;
    }
    if (!!this.indexedVariables && this.indexedVariables > chunkSize) {
      const numberOfChunks = Math.ceil(this.indexedVariables / chunkSize);
      for (let i2 = 0; i2 < numberOfChunks; i2++) {
        const start = (this.startOfVariables || 0) + i2 * chunkSize;
        const count2 = Math.min(chunkSize, this.indexedVariables - i2 * chunkSize);
        children.push(new Variable3(this.session, this.threadId, this, this.reference, `[${start}..${start + count2 - 1}]`, "", "", void 0, count2, void 0, { kind: "virtual" }, void 0, void 0, true, start));
      }
      return children;
    }
    const variables = await this.fetchVariables(this.startOfVariables, this.indexedVariables, "indexed");
    return children.concat(variables);
  }
  getId() {
    return this.id;
  }
  getSession() {
    return this.session;
  }
  get value() {
    return this._value;
  }
  get hasChildren() {
    return !!this.reference && this.reference > 0 && !this.presentationHint?.lazy;
  }
  async fetchVariables(start, count2, filter2) {
    try {
      const response = await this.session.variables(this.reference || 0, this.threadId, filter2, start, count2);
      if (!response || !response.body || !response.body.variables) {
        return [];
      }
      const nameCount = /* @__PURE__ */ new Map();
      const vars = response.body.variables.filter((v2) => !!v2).map((v2) => {
        if (isString(v2.value) && isString(v2.name) && typeof v2.variablesReference === "number") {
          const count3 = nameCount.get(v2.name) || 0;
          const idDuplicationIndex = count3 > 0 ? count3.toString() : "";
          nameCount.set(v2.name, count3 + 1);
          return new Variable3(this.session, this.threadId, this, v2.variablesReference, v2.name, v2.evaluateName, v2.value, v2.namedVariables, v2.indexedVariables, v2.memoryReference, v2.presentationHint, v2.type, v2.__vscodeVariableMenuContext, true, 0, idDuplicationIndex, v2.declarationLocationReference, v2.valueLocationReference);
        }
        return new Variable3(this.session, this.threadId, this, 0, "", void 0, localize(14813, null), 0, 0, void 0, { kind: "virtual" }, void 0, void 0, false);
      });
      if (this.session.autoExpandLazyVariables) {
        await Promise.all(vars.map((v2) => v2.presentationHint?.lazy && v2.evaluateLazy()));
      }
      return vars;
    } catch (e4) {
      return [new Variable3(this.session, this.threadId, this, 0, "", void 0, e4.message, 0, 0, void 0, { kind: "virtual" }, void 0, void 0, false)];
    }
  }
  // The adapter explicitly sents the children count of an expression only if there are lots of children which should be chunked.
  get getChildrenInChunks() {
    return !!this.indexedVariables;
  }
  set value(value2) {
    this._value = value2;
    this.valueChanged = !!_ExpressionContainer.allValues.get(this.getId()) && _ExpressionContainer.allValues.get(this.getId()) !== Expression.DEFAULT_VALUE && _ExpressionContainer.allValues.get(this.getId()) !== value2;
    _ExpressionContainer.allValues.set(this.getId(), value2);
  }
  toString() {
    return this.value;
  }
  async evaluateExpression(expression, session, stackFrame, context2, keepLazyVars = false, location2) {
    if (!session || !stackFrame && context2 !== "repl") {
      this.value = context2 === "repl" ? localize(14818, null) : Expression.DEFAULT_VALUE;
      this.reference = 0;
      return false;
    }
    this.session = session;
    try {
      const response = await session.evaluate(expression, stackFrame ? stackFrame.frameId : void 0, context2, location2);
      if (response && response.body) {
        this.value = response.body.result || "";
        this.reference = response.body.variablesReference;
        this.namedVariables = response.body.namedVariables;
        this.indexedVariables = response.body.indexedVariables;
        this.memoryReference = response.body.memoryReference;
        this.type = response.body.type || this.type;
        this.presentationHint = response.body.presentationHint;
        this.valueLocationReference = response.body.valueLocationReference;
        if (!keepLazyVars && response.body.presentationHint?.lazy) {
          await this.evaluateLazy();
        }
        return true;
      }
      return false;
    } catch (e4) {
      this.value = e4.message || "";
      this.reference = 0;
      this.memoryReference = void 0;
      return false;
    }
  }
};

function handleSetResponse(expression, response) {
  if (response && response.body) {
    expression.value = response.body.value || "";
    expression.type = response.body.type || expression.type;
    expression.reference = response.body.variablesReference;
    expression.namedVariables = response.body.namedVariables;
    expression.indexedVariables = response.body.indexedVariables;
    expression.memoryReference = response.body.memoryReference;
    expression.valueLocationReference = response.body.valueLocationReference;
  }
}

var VisualizedExpression = class {
  constructor(session, visualizer, treeId, treeItem, original) {
    this.session = session;
    this.visualizer = visualizer;
    this.treeId = treeId;
    this.treeItem = treeItem;
    this.original = original;
    this.id = generateUuid();
  }
  evaluateLazy() {
    return Promise.resolve();
  }
  getChildren() {
    return this.visualizer.getVisualizedChildren(this.session, this.treeId, this.treeItem.id);
  }
  getId() {
    return this.id;
  }
  get name() {
    return this.treeItem.label;
  }
  get value() {
    return this.treeItem.description || "";
  }
  get hasChildren() {
    return this.treeItem.collapsibleState !== 0 /* None */;
  }
  getSession() {
    return this.session;
  }
  /** Edits the value, sets the {@link errorMessage} and returns false if unsuccessful */
  async edit(newValue) {
    try {
      await this.visualizer.editTreeItem(this.treeId, this.treeItem, newValue);
      return true;
    } catch (e4) {
      this.errorMessage = e4.message;
      return false;
    }
  }
};

var Expression = class _Expression extends ExpressionContainer {
  constructor(name, id2 = generateUuid()) {
    super(void 0, void 0, 0, id2);
    this.name = name;
    this._onDidChangeValue = new Emitter();
    this.onDidChangeValue = this._onDidChangeValue.event;
    this.available = false;
    if (name) {
      this.value = _Expression.DEFAULT_VALUE;
    }
  }
  static {
    this.DEFAULT_VALUE = localize(14814, null);
  }
  async evaluate(session, stackFrame, context2, keepLazyVars, location2) {
    const hadDefaultValue = this.value === _Expression.DEFAULT_VALUE;
    this.available = await this.evaluateExpression(this.name, session, stackFrame, context2, keepLazyVars, location2);
    if (hadDefaultValue || this.valueChanged) {
      this._onDidChangeValue.fire(this);
    }
  }
  toString() {
    return `${this.name}
${this.value}`;
  }
  toJSON() {
    return {
      sessionId: this.getSession()?.getId(),
      variable: this.toDebugProtocolObject()
    };
  }
  toDebugProtocolObject() {
    return {
      name: this.name,
      variablesReference: this.reference || 0,
      memoryReference: this.memoryReference,
      value: this.value,
      type: this.type,
      evaluateName: this.name
    };
  }
  async setExpression(value2, stackFrame) {
    if (!this.session) {
      return;
    }
    const response = await this.session.setExpression(stackFrame.frameId, this.name, value2);
    handleSetResponse(this, response);
  }
};

var Variable3 = class extends ExpressionContainer {
  constructor(session, threadId, parent, reference, name, evaluateName, value2, namedVariables, indexedVariables, memoryReference, presentationHint, type = void 0, variableMenuContext = void 0, available = true, startOfVariables = 0, idDuplicationIndex = "", declarationLocationReference = void 0, valueLocationReference = void 0) {
    super(session, threadId, reference, `variable:${parent.getId()}:${name}:${idDuplicationIndex}`, namedVariables, indexedVariables, memoryReference, startOfVariables, presentationHint, valueLocationReference);
    this.parent = parent;
    this.name = name;
    this.evaluateName = evaluateName;
    this.variableMenuContext = variableMenuContext;
    this.available = available;
    this.declarationLocationReference = declarationLocationReference;
    this.value = value2 || "";
    this.type = type;
  }
  getThreadId() {
    return this.threadId;
  }
  async setVariable(value2, stackFrame) {
    if (!this.session) {
      return;
    }
    try {
      if (this.session.capabilities.supportsSetExpression && !this.session.capabilities.supportsSetVariable && this.evaluateName) {
        return this.setExpression(value2, stackFrame);
      }
      const response = await this.session.setVariable(this.parent.reference, this.name, value2);
      handleSetResponse(this, response);
    } catch (err) {
      this.errorMessage = err.message;
    }
  }
  async setExpression(value2, stackFrame) {
    if (!this.session || !this.evaluateName) {
      return;
    }
    const response = await this.session.setExpression(stackFrame.frameId, this.evaluateName, value2);
    handleSetResponse(this, response);
  }
  toString() {
    return this.name ? `${this.name}: ${this.value}` : this.value;
  }
  toJSON() {
    return {
      sessionId: this.getSession()?.getId(),
      container: this.parent instanceof Expression ? { expression: this.parent.name } : this.parent.toDebugProtocolObject(),
      variable: this.toDebugProtocolObject()
    };
  }
  adoptLazyResponse(response) {
    this.evaluateName = response.evaluateName;
  }
  toDebugProtocolObject() {
    return {
      name: this.name,
      variablesReference: this.reference || 0,
      memoryReference: this.memoryReference,
      value: this.value,
      type: this.type,
      evaluateName: this.evaluateName
    };
  }
};

var Scope = class extends ExpressionContainer {
  constructor(stackFrame, id2, name, reference, expensive, namedVariables, indexedVariables, range2) {
    super(stackFrame.thread.session, stackFrame.thread.threadId, reference, `scope:${name}:${id2}`, namedVariables, indexedVariables);
    this.stackFrame = stackFrame;
    this.name = name;
    this.expensive = expensive;
    this.range = range2;
  }
  get childrenHaveBeenLoaded() {
    return !!this.children;
  }
  toString() {
    return this.name;
  }
  toDebugProtocolObject() {
    return {
      name: this.name,
      variablesReference: this.reference || 0,
      expensive: this.expensive
    };
  }
};

var ErrorScope = class extends Scope {
  constructor(stackFrame, index2, message) {
    super(stackFrame, index2, message, 0, false);
  }
  toString() {
    return this.name;
  }
};

var StackFrame = class {
  constructor(thread, frameId, source, name, presentationHint, range2, index2, canRestart, instructionPointerReference) {
    this.thread = thread;
    this.frameId = frameId;
    this.source = source;
    this.name = name;
    this.presentationHint = presentationHint;
    this.range = range2;
    this.index = index2;
    this.canRestart = canRestart;
    this.instructionPointerReference = instructionPointerReference;
  }
  getId() {
    return `stackframe:${this.thread.getId()}:${this.index}:${this.source.name}`;
  }
  getScopes() {
    if (!this.scopes) {
      this.scopes = this.thread.session.scopes(this.frameId, this.thread.threadId).then((response) => {
        if (!response || !response.body || !response.body.scopes) {
          return [];
        }
        const usedIds = /* @__PURE__ */ new Set();
        return response.body.scopes.map((rs) => {
          let id2 = 0;
          do {
            id2 = stringHash(`${rs.name}:${rs.line}:${rs.column}`, id2);
          } while (usedIds.has(id2));
          usedIds.add(id2);
          return new Scope(
            this,
            id2,
            rs.name,
            rs.variablesReference,
            rs.expensive,
            rs.namedVariables,
            rs.indexedVariables,
            rs.line && rs.column && rs.endLine && rs.endColumn ? new Range2(rs.line, rs.column, rs.endLine, rs.endColumn) : void 0
          );
        });
      }, (err) => [new ErrorScope(this, 0, err.message)]);
    }
    return this.scopes;
  }
  async getMostSpecificScopes(range2) {
    const scopes = await this.getScopes();
    const nonExpensiveScopes = scopes.filter((s) => !s.expensive);
    const haveRangeInfo = nonExpensiveScopes.some((s) => !!s.range);
    if (!haveRangeInfo) {
      return nonExpensiveScopes;
    }
    const scopesContainingRange = nonExpensiveScopes.filter((scope) => scope.range && Range2.containsRange(scope.range, range2)).sort((first2, second) => first2.range.endLineNumber - first2.range.startLineNumber - (second.range.endLineNumber - second.range.startLineNumber));
    return scopesContainingRange.length ? scopesContainingRange : nonExpensiveScopes;
  }
  restart() {
    return this.thread.session.restartFrame(this.frameId, this.thread.threadId);
  }
  forgetScopes() {
    this.scopes = void 0;
  }
  toString() {
    const lineNumberToString = typeof this.range.startLineNumber === "number" ? `:${this.range.startLineNumber}` : "";
    const sourceToString = `${this.source.inMemory ? this.source.name : this.source.uri.fsPath}${lineNumberToString}`;
    return sourceToString === UNKNOWN_SOURCE_LABEL ? this.name : `${this.name} (${sourceToString})`;
  }
  async openInEditor(editorService, preserveFocus, sideBySide, pinned) {
    const threadStopReason = this.thread.stoppedDetails?.reason;
    if (this.instructionPointerReference && (threadStopReason === "instruction breakpoint" && !preserveFocus || threadStopReason === "step" && this.thread.lastSteppingGranularity === "instruction" && !preserveFocus || editorService.activeEditor instanceof DisassemblyViewInput)) {
      return editorService.openEditor(DisassemblyViewInput.instance, { pinned: true, revealIfOpened: true, preserveFocus });
    }
    if (this.source.available) {
      return this.source.openInEditor(editorService, this.range, preserveFocus, sideBySide, pinned);
    }
    return void 0;
  }
  equals(other) {
    return this.name === other.name && other.thread === this.thread && this.frameId === other.frameId && other.source === this.source && Range2.equalsRange(this.range, other.range);
  }
};

var getUriForDebugMemory = (sessionId, memoryReference, range2, displayName = "memory") => {
  return URI.from({
    scheme: DEBUG_MEMORY_SCHEME,
    authority: sessionId,
    path: "/" + encodeURIComponent(memoryReference) + `/${encodeURIComponent(displayName)}.bin`,
    query: range2 ? `?range=${range2.fromOffset}:${range2.toOffset}` : void 0
  });
};

var Enablement = class {
  constructor(enabled, id2) {
    this.enabled = enabled;
    this.id = id2;
  }
  getId() {
    return this.id;
  }
};

function toBreakpointSessionData(data, capabilities) {
  return mixin({
    supportsConditionalBreakpoints: !!capabilities.supportsConditionalBreakpoints,
    supportsHitConditionalBreakpoints: !!capabilities.supportsHitConditionalBreakpoints,
    supportsLogPoints: !!capabilities.supportsLogPoints,
    supportsFunctionBreakpoints: !!capabilities.supportsFunctionBreakpoints,
    supportsDataBreakpoints: !!capabilities.supportsDataBreakpoints,
    supportsInstructionBreakpoints: !!capabilities.supportsInstructionBreakpoints
  }, data);
}

var BaseBreakpoint = class extends Enablement {
  constructor(id2, opts) {
    super(opts.enabled ?? true, id2);
    this.sessionData = /* @__PURE__ */ new Map();
    this.condition = opts.condition;
    this.hitCondition = opts.hitCondition;
    this.logMessage = opts.logMessage;
    this.mode = opts.mode;
    this.modeLabel = opts.modeLabel;
  }
  setSessionData(sessionId, data) {
    if (!data) {
      this.sessionData.delete(sessionId);
    } else {
      data.sessionId = sessionId;
      this.sessionData.set(sessionId, data);
    }
    const allData = Array.from(this.sessionData.values());
    const verifiedData = distinct(allData.filter((d) => d.verified), (d) => `${d.line}:${d.column}`);
    if (verifiedData.length) {
      this.data = verifiedData.length === 1 ? verifiedData[0] : void 0;
    } else {
      this.data = allData.length ? allData[0] : void 0;
    }
  }
  get message() {
    if (!this.data) {
      return void 0;
    }
    return this.data.message;
  }
  get verified() {
    return this.data ? this.data.verified : true;
  }
  get sessionsThatVerified() {
    const sessionIds = [];
    for (const [sessionId, data] of this.sessionData) {
      if (data.verified) {
        sessionIds.push(sessionId);
      }
    }
    return sessionIds;
  }
  getIdFromAdapter(sessionId) {
    const data = this.sessionData.get(sessionId);
    return data ? data.id : void 0;
  }
  getDebugProtocolBreakpoint(sessionId) {
    const data = this.sessionData.get(sessionId);
    if (data) {
      const bp = {
        id: data.id,
        verified: data.verified,
        message: data.message,
        source: data.source,
        line: data.line,
        column: data.column,
        endLine: data.endLine,
        endColumn: data.endColumn,
        instructionReference: data.instructionReference,
        offset: data.offset
      };
      return bp;
    }
    return void 0;
  }
  toJSON() {
    return {
      id: this.getId(),
      enabled: this.enabled,
      condition: this.condition,
      hitCondition: this.hitCondition,
      logMessage: this.logMessage,
      mode: this.mode,
      modeLabel: this.modeLabel
    };
  }
};

var Breakpoint2 = class extends BaseBreakpoint {
  constructor(opts, textFileService, uriIdentityService, logService, id2 = generateUuid()) {
    super(id2, opts);
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._uri = opts.uri;
    this._lineNumber = opts.lineNumber;
    this._column = opts.column;
    this._adapterData = opts.adapterData;
    this.triggeredBy = opts.triggeredBy;
  }
  toDAP() {
    return {
      line: this.sessionAgnosticData.lineNumber,
      column: this.sessionAgnosticData.column,
      condition: this.condition,
      hitCondition: this.hitCondition,
      logMessage: this.logMessage,
      mode: this.mode
    };
  }
  get originalUri() {
    return this._uri;
  }
  get lineNumber() {
    return this.verified && this.data && typeof this.data.line === "number" ? this.data.line : this._lineNumber;
  }
  get verified() {
    if (this.data) {
      return this.data.verified && !this.textFileService.isDirty(this._uri);
    }
    return true;
  }
  get pending() {
    if (this.data) {
      return false;
    }
    return this.triggeredBy !== void 0;
  }
  get uri() {
    return this.verified && this.data && this.data.source ? getUriFromSource(this.data.source, this.data.source.path, this.data.sessionId, this.uriIdentityService, this.logService) : this._uri;
  }
  get column() {
    return this.verified && this.data && typeof this.data.column === "number" ? this.data.column : this._column;
  }
  get message() {
    if (this.textFileService.isDirty(this.uri)) {
      return localize(14812, null);
    }
    return super.message;
  }
  get adapterData() {
    return this.data && this.data.source && this.data.source.adapterData ? this.data.source.adapterData : this._adapterData;
  }
  get endLineNumber() {
    return this.verified && this.data ? this.data.endLine : void 0;
  }
  get endColumn() {
    return this.verified && this.data ? this.data.endColumn : void 0;
  }
  get sessionAgnosticData() {
    return {
      lineNumber: this._lineNumber,
      column: this._column
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    if (this.logMessage && !this.data.supportsLogPoints) {
      return false;
    }
    if (this.condition && !this.data.supportsConditionalBreakpoints) {
      return false;
    }
    if (this.hitCondition && !this.data.supportsHitConditionalBreakpoints) {
      return false;
    }
    return true;
  }
  setSessionData(sessionId, data) {
    super.setSessionData(sessionId, data);
    if (!this._adapterData) {
      this._adapterData = this.adapterData;
    }
  }
  toJSON() {
    return {
      ...super.toJSON(),
      uri: this._uri,
      lineNumber: this._lineNumber,
      column: this._column,
      adapterData: this.adapterData,
      triggeredBy: this.triggeredBy
    };
  }
  toString() {
    return `${basenameOrAuthority(this.uri)} ${this.lineNumber}`;
  }
  setSessionDidTrigger(sessionId, didTrigger = true) {
    if (didTrigger) {
      this.sessionsDidTrigger ??= /* @__PURE__ */ new Set();
      this.sessionsDidTrigger.add(sessionId);
    } else {
      this.sessionsDidTrigger?.delete(sessionId);
    }
  }
  getSessionDidTrigger(sessionId) {
    return !!this.sessionsDidTrigger?.has(sessionId);
  }
  update(data) {
    if (data.hasOwnProperty("lineNumber") && !isUndefinedOrNull(data.lineNumber)) {
      this._lineNumber = data.lineNumber;
    }
    if (data.hasOwnProperty("column")) {
      this._column = data.column;
    }
    if (data.hasOwnProperty("condition")) {
      this.condition = data.condition;
    }
    if (data.hasOwnProperty("hitCondition")) {
      this.hitCondition = data.hitCondition;
    }
    if (data.hasOwnProperty("logMessage")) {
      this.logMessage = data.logMessage;
    }
    if (data.hasOwnProperty("mode")) {
      this.mode = data.mode;
      this.modeLabel = data.modeLabel;
    }
    if (data.hasOwnProperty("triggeredBy")) {
      this.triggeredBy = data.triggeredBy;
      this.sessionsDidTrigger = void 0;
    }
  }
};

var FunctionBreakpoint2 = class extends BaseBreakpoint {
  constructor(opts, id2 = generateUuid()) {
    super(id2, opts);
    this.name = opts.name;
  }
  toDAP() {
    return {
      name: this.name,
      condition: this.condition,
      hitCondition: this.hitCondition
    };
  }
  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    return this.data.supportsFunctionBreakpoints;
  }
  toString() {
    return this.name;
  }
};

var DataBreakpoint2 = class extends BaseBreakpoint {
  constructor(opts, id2 = generateUuid()) {
    super(id2, opts);
    this.sessionDataIdForAddr = /* @__PURE__ */ new WeakMap();
    this.description = opts.description;
    if ("dataId" in opts) {
      opts.src = { type: 0 /* Variable */, dataId: opts.dataId };
    }
    this.src = opts.src;
    this.canPersist = opts.canPersist;
    this.accessTypes = opts.accessTypes;
    this.accessType = opts.accessType;
    if (opts.initialSessionData) {
      this.sessionDataIdForAddr.set(opts.initialSessionData.session, opts.initialSessionData.dataId);
    }
  }
  async toDAP(session) {
    let dataId;
    if (this.src.type === 0 /* Variable */) {
      dataId = this.src.dataId;
    } else {
      let sessionDataId = this.sessionDataIdForAddr.get(session);
      if (!sessionDataId) {
        sessionDataId = (await session.dataBytesBreakpointInfo(this.src.address, this.src.bytes))?.dataId;
        if (!sessionDataId) {
          return void 0;
        }
        this.sessionDataIdForAddr.set(session, sessionDataId);
      }
      dataId = sessionDataId;
    }
    return {
      dataId,
      accessType: this.accessType,
      condition: this.condition,
      hitCondition: this.hitCondition
    };
  }
  toJSON() {
    return {
      ...super.toJSON(),
      description: this.description,
      src: this.src,
      accessTypes: this.accessTypes,
      accessType: this.accessType,
      canPersist: this.canPersist
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    return this.data.supportsDataBreakpoints;
  }
  toString() {
    return this.description;
  }
};

var ExceptionBreakpoint = class extends BaseBreakpoint {
  constructor(opts, id2 = generateUuid()) {
    super(id2, opts);
    this.supportedSessions = /* @__PURE__ */ new Set();
    this.fallback = false;
    this.filter = opts.filter;
    this.label = opts.label;
    this.supportsCondition = opts.supportsCondition;
    this.description = opts.description;
    this.conditionDescription = opts.conditionDescription;
    this.fallback = opts.fallback || false;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      filter: this.filter,
      label: this.label,
      enabled: this.enabled,
      supportsCondition: this.supportsCondition,
      conditionDescription: this.conditionDescription,
      condition: this.condition,
      fallback: this.fallback,
      description: this.description
    };
  }
  setSupportedSession(sessionId, supported3) {
    if (supported3) {
      this.supportedSessions.add(sessionId);
    } else {
      this.supportedSessions.delete(sessionId);
    }
  }
  /**
   * Used to specify which breakpoints to show when no session is specified.
   * Useful when no session is active and we want to show the exception breakpoints from the last session.
   */
  setFallback(isFallback) {
    this.fallback = isFallback;
  }
  get supported() {
    return true;
  }
  /**
   * Checks if the breakpoint is applicable for the specified session.
   * If sessionId is undefined, returns true if this breakpoint is a fallback breakpoint.
   */
  isSupportedSession(sessionId) {
    return sessionId ? this.supportedSessions.has(sessionId) : this.fallback;
  }
  matches(filter2) {
    return this.filter === filter2.filter && this.label === filter2.label && this.supportsCondition === !!filter2.supportsCondition && this.conditionDescription === filter2.conditionDescription && this.description === filter2.description;
  }
  toString() {
    return this.label;
  }
};

var InstructionBreakpoint = class extends BaseBreakpoint {
  constructor(opts, id2 = generateUuid()) {
    super(id2, opts);
    this.instructionReference = opts.instructionReference;
    this.offset = opts.offset;
    this.canPersist = opts.canPersist;
    this.address = opts.address;
  }
  toDAP() {
    return {
      instructionReference: this.instructionReference,
      condition: this.condition,
      hitCondition: this.hitCondition,
      mode: this.mode,
      offset: this.offset
    };
  }
  toJSON() {
    return {
      ...super.toJSON(),
      instructionReference: this.instructionReference,
      offset: this.offset,
      canPersist: this.canPersist,
      address: this.address
    };
  }
  get supported() {
    if (!this.data) {
      return true;
    }
    return this.data.supportsInstructionBreakpoints;
  }
  toString() {
    return this.instructionReference;
  }
};

var DebugModel = class extends Disposable {
  constructor(debugStorage, textFileService, uriIdentityService, logService) {
    super();
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.schedulers = /* @__PURE__ */ new Map();
    this.breakpointsActivated = true;
    this._onDidChangeBreakpoints = this._register(new Emitter());
    this._onDidChangeCallStack = this._register(new Emitter());
    this._onDidChangeCallStackFire = this._register(new RunOnceScheduler(() => {
      this._onDidChangeCallStack.fire(void 0);
    }, 100));
    this._onDidChangeWatchExpressions = this._register(new Emitter());
    this._onDidChangeWatchExpressionValue = this._register(new Emitter());
    this._breakpointModes = /* @__PURE__ */ new Map();
    this._register(autorun((reader) => {
      this.breakpoints = debugStorage.breakpoints.read(reader);
      this.functionBreakpoints = debugStorage.functionBreakpoints.read(reader);
      this.exceptionBreakpoints = debugStorage.exceptionBreakpoints.read(reader);
      this.dataBreakpoints = debugStorage.dataBreakpoints.read(reader);
      this._onDidChangeBreakpoints.fire(void 0);
    }));
    this._register(autorun((reader) => {
      this.watchExpressions = debugStorage.watchExpressions.read(reader);
      this._onDidChangeWatchExpressions.fire(void 0);
    }));
    this._register(
      trackSetChanges(
        () => new Set(this.watchExpressions),
        this.onDidChangeWatchExpressions,
        (we) => we.onDidChangeValue((e4) => this._onDidChangeWatchExpressionValue.fire(e4))
      )
    );
    this.instructionBreakpoints = [];
    this.sessions = [];
  }
  getId() {
    return "root";
  }
  getSession(sessionId, includeInactive = false) {
    if (sessionId) {
      return this.getSessions(includeInactive).find((s) => s.getId() === sessionId);
    }
    return void 0;
  }
  getSessions(includeInactive = false) {
    return this.sessions.filter((s) => includeInactive || s.state !== 0 /* Inactive */);
  }
  shouldDisposeSession(session, newSession) {
    if (session.state !== 0 /* Inactive */) {
      return false;
    }
    if (session.configuration.name === newSession.configuration.name) {
      return true;
    }
    if (newSession.parentSession) {
      return false;
    }
    let rootSession = session;
    while (rootSession.parentSession) {
      rootSession = rootSession.parentSession;
    }
    return rootSession.state === 0 /* Inactive */ && rootSession.configuration.name === newSession.configuration.name;
  }
  addSession(session) {
    this.sessions = this.sessions.filter((s) => {
      if (s.getId() === session.getId()) {
        return false;
      }
      if (this.shouldDisposeSession(s, session)) {
        s.dispose();
        return false;
      }
      return true;
    });
    let i2 = 1;
    while (this.sessions.some((s) => s.getLabel() === session.getLabel())) {
      session.setName(`${session.configuration.name} ${++i2}`);
    }
    let index2 = -1;
    if (session.parentSession) {
      index2 = this.sessions.findLastIndex((s) => s.parentSession === session.parentSession || s === session.parentSession);
    }
    if (index2 >= 0) {
      this.sessions.splice(index2 + 1, 0, session);
    } else {
      this.sessions.push(session);
    }
    this._onDidChangeCallStack.fire(void 0);
  }
  get onDidChangeBreakpoints() {
    return this._onDidChangeBreakpoints.event;
  }
  get onDidChangeCallStack() {
    return this._onDidChangeCallStack.event;
  }
  get onDidChangeWatchExpressions() {
    return this._onDidChangeWatchExpressions.event;
  }
  get onDidChangeWatchExpressionValue() {
    return this._onDidChangeWatchExpressionValue.event;
  }
  rawUpdate(data) {
    const session = this.sessions.find((p) => p.getId() === data.sessionId);
    if (session) {
      session.rawUpdate(data);
      this._onDidChangeCallStack.fire(void 0);
    }
  }
  clearThreads(id2, removeThreads, reference = void 0) {
    const session = this.sessions.find((p) => p.getId() === id2);
    if (session) {
      let threads;
      if (reference === void 0) {
        threads = session.getAllThreads();
      } else {
        const thread = session.getThread(reference);
        threads = thread !== void 0 ? [thread] : [];
      }
      for (const thread of threads) {
        const threadId = thread.getId();
        const entry = this.schedulers.get(threadId);
        if (entry !== void 0) {
          entry.scheduler.dispose();
          entry.completeDeferred.complete();
          this.schedulers.delete(threadId);
        }
      }
      session.clearThreads(removeThreads, reference);
      if (!this._onDidChangeCallStackFire.isScheduled()) {
        this._onDidChangeCallStackFire.schedule();
      }
    }
  }
  /**
   * Update the call stack and notify the call stack view that changes have occurred.
   */
  async fetchCallstack(thread, levels) {
    if (thread.reachedEndOfCallStack) {
      return;
    }
    const totalFrames = thread.stoppedDetails?.totalFrames;
    const remainingFrames = typeof totalFrames === "number" ? totalFrames - thread.getCallStack().length : void 0;
    if (!levels || remainingFrames && levels > remainingFrames) {
      levels = remainingFrames;
    }
    if (levels && levels > 0) {
      await thread.fetchCallStack(levels);
      this._onDidChangeCallStack.fire();
    }
    return;
  }
  refreshTopOfCallstack(thread, fetchFullStack = true) {
    if (thread.session.capabilities.supportsDelayedStackTraceLoading) {
      let topCallStack = Promise.resolve();
      const wholeCallStack2 = new Promise((c, e4) => {
        topCallStack = thread.fetchCallStack(1).then(() => {
          if (!fetchFullStack) {
            c();
            this._onDidChangeCallStack.fire();
            return;
          }
          if (!this.schedulers.has(thread.getId())) {
            const deferred = new DeferredPromise();
            this.schedulers.set(thread.getId(), {
              completeDeferred: deferred,
              scheduler: new RunOnceScheduler(() => {
                thread.fetchCallStack(19).then(() => {
                  const stale = thread.getStaleCallStack();
                  const current = thread.getCallStack();
                  let bottomOfCallStackChanged = stale.length !== current.length;
                  for (let i2 = 1; i2 < stale.length && !bottomOfCallStackChanged; i2++) {
                    bottomOfCallStackChanged = !stale[i2].equals(current[i2]);
                  }
                  if (bottomOfCallStackChanged) {
                    this._onDidChangeCallStack.fire();
                  }
                }).finally(() => {
                  deferred.complete();
                  this.schedulers.delete(thread.getId());
                });
              }, 420)
            });
          }
          const entry = this.schedulers.get(thread.getId());
          entry.scheduler.schedule();
          entry.completeDeferred.p.then(c, e4);
          this._onDidChangeCallStack.fire();
        });
      });
      return { topCallStack, wholeCallStack: wholeCallStack2 };
    }
    const wholeCallStack = thread.fetchCallStack();
    return { wholeCallStack, topCallStack: wholeCallStack };
  }
  getBreakpoints(filter2) {
    if (filter2) {
      const uriStr = filter2.uri?.toString();
      const originalUriStr = filter2.originalUri?.toString();
      return this.breakpoints.filter((bp) => {
        if (uriStr && bp.uri.toString() !== uriStr) {
          return false;
        }
        if (originalUriStr && bp.originalUri.toString() !== originalUriStr) {
          return false;
        }
        if (filter2.lineNumber && bp.lineNumber !== filter2.lineNumber) {
          return false;
        }
        if (filter2.column && bp.column !== filter2.column) {
          return false;
        }
        if (filter2.enabledOnly && (!this.breakpointsActivated || !bp.enabled)) {
          return false;
        }
        if (filter2.triggeredOnly && bp.triggeredBy === void 0) {
          return false;
        }
        return true;
      });
    }
    return this.breakpoints;
  }
  getFunctionBreakpoints() {
    return this.functionBreakpoints;
  }
  getDataBreakpoints() {
    return this.dataBreakpoints;
  }
  getExceptionBreakpoints() {
    return this.exceptionBreakpoints;
  }
  getExceptionBreakpointsForSession(sessionId) {
    return this.exceptionBreakpoints.filter((ebp) => ebp.isSupportedSession(sessionId));
  }
  getInstructionBreakpoints() {
    return this.instructionBreakpoints;
  }
  setExceptionBreakpointsForSession(sessionId, filters2) {
    if (!filters2) {
      return;
    }
    let didChangeBreakpoints = false;
    filters2.forEach((d) => {
      let ebp = this.exceptionBreakpoints.filter((exbp) => exbp.matches(d)).pop();
      if (!ebp) {
        didChangeBreakpoints = true;
        ebp = new ExceptionBreakpoint({
          filter: d.filter,
          label: d.label,
          enabled: !!d.default,
          supportsCondition: !!d.supportsCondition,
          description: d.description,
          conditionDescription: d.conditionDescription
        });
        this.exceptionBreakpoints.push(ebp);
      }
      ebp.setSupportedSession(sessionId, true);
    });
    if (didChangeBreakpoints) {
      this._onDidChangeBreakpoints.fire(void 0);
    }
  }
  removeExceptionBreakpointsForSession(sessionId) {
    this.exceptionBreakpoints.forEach((ebp) => ebp.setSupportedSession(sessionId, false));
  }
  // Set last focused session as fallback session.
  // This is done to keep track of the exception breakpoints to show when no session is active.
  setExceptionBreakpointFallbackSession(sessionId) {
    this.exceptionBreakpoints.forEach((ebp) => ebp.setFallback(ebp.isSupportedSession(sessionId)));
  }
  setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
    exceptionBreakpoint.condition = condition;
    this._onDidChangeBreakpoints.fire(void 0);
  }
  areBreakpointsActivated() {
    return this.breakpointsActivated;
  }
  setBreakpointsActivated(activated) {
    this.breakpointsActivated = activated;
    this._onDidChangeBreakpoints.fire(void 0);
  }
  addBreakpoints(uri4, rawData, fireEvent = true) {
    const newBreakpoints = rawData.map((rawBp) => {
      return new Breakpoint2({
        uri: uri4,
        lineNumber: rawBp.lineNumber,
        column: rawBp.column,
        enabled: rawBp.enabled ?? true,
        condition: rawBp.condition,
        hitCondition: rawBp.hitCondition,
        logMessage: rawBp.logMessage,
        triggeredBy: rawBp.triggeredBy,
        adapterData: void 0,
        mode: rawBp.mode,
        modeLabel: rawBp.modeLabel
      }, this.textFileService, this.uriIdentityService, this.logService, rawBp.id);
    });
    this.breakpoints = this.breakpoints.concat(newBreakpoints);
    this.breakpointsActivated = true;
    this.sortAndDeDup();
    if (fireEvent) {
      this._onDidChangeBreakpoints.fire({ added: newBreakpoints, sessionOnly: false });
    }
    return newBreakpoints;
  }
  removeBreakpoints(toRemove) {
    this.breakpoints = this.breakpoints.filter((bp) => !toRemove.some((toRemove2) => toRemove2.getId() === bp.getId()));
    this._onDidChangeBreakpoints.fire({ removed: toRemove, sessionOnly: false });
  }
  updateBreakpoints(data) {
    const updated = [];
    this.breakpoints.forEach((bp) => {
      const bpData = data.get(bp.getId());
      if (bpData) {
        bp.update(bpData);
        updated.push(bp);
      }
    });
    this.sortAndDeDup();
    this._onDidChangeBreakpoints.fire({ changed: updated, sessionOnly: false });
  }
  setBreakpointSessionData(sessionId, capabilites, data) {
    this.breakpoints.forEach((bp) => {
      if (!data) {
        bp.setSessionData(sessionId, void 0);
      } else {
        const bpData = data.get(bp.getId());
        if (bpData) {
          bp.setSessionData(sessionId, toBreakpointSessionData(bpData, capabilites));
        }
      }
    });
    this.functionBreakpoints.forEach((fbp) => {
      if (!data) {
        fbp.setSessionData(sessionId, void 0);
      } else {
        const fbpData = data.get(fbp.getId());
        if (fbpData) {
          fbp.setSessionData(sessionId, toBreakpointSessionData(fbpData, capabilites));
        }
      }
    });
    this.dataBreakpoints.forEach((dbp) => {
      if (!data) {
        dbp.setSessionData(sessionId, void 0);
      } else {
        const dbpData = data.get(dbp.getId());
        if (dbpData) {
          dbp.setSessionData(sessionId, toBreakpointSessionData(dbpData, capabilites));
        }
      }
    });
    this.exceptionBreakpoints.forEach((ebp) => {
      if (!data) {
        ebp.setSessionData(sessionId, void 0);
      } else {
        const ebpData = data.get(ebp.getId());
        if (ebpData) {
          ebp.setSessionData(sessionId, toBreakpointSessionData(ebpData, capabilites));
        }
      }
    });
    this.instructionBreakpoints.forEach((ibp) => {
      if (!data) {
        ibp.setSessionData(sessionId, void 0);
      } else {
        const ibpData = data.get(ibp.getId());
        if (ibpData) {
          ibp.setSessionData(sessionId, toBreakpointSessionData(ibpData, capabilites));
        }
      }
    });
    this._onDidChangeBreakpoints.fire({
      sessionOnly: true
    });
  }
  getDebugProtocolBreakpoint(breakpointId, sessionId) {
    const bp = this.breakpoints.find((bp2) => bp2.getId() === breakpointId);
    if (bp) {
      return bp.getDebugProtocolBreakpoint(sessionId);
    }
    return void 0;
  }
  getBreakpointModes(forBreakpointType) {
    return [...this._breakpointModes.values()].filter((mode) => mode.appliesTo.includes(forBreakpointType));
  }
  registerBreakpointModes(debugType, modes) {
    for (const mode of modes) {
      const key3 = `${mode.mode}/${mode.label}`;
      const rec = this._breakpointModes.get(key3);
      if (rec) {
        for (const target of mode.appliesTo) {
          if (!rec.appliesTo.includes(target)) {
            rec.appliesTo.push(target);
          }
        }
      } else {
        const duplicate = [...this._breakpointModes.values()].find((r2) => r2 !== rec && r2.label === mode.label);
        if (duplicate) {
          duplicate.label = `${duplicate.label} (${duplicate.firstFromDebugType})`;
        }
        this._breakpointModes.set(key3, {
          mode: mode.mode,
          label: duplicate ? `${mode.label} (${debugType})` : mode.label,
          firstFromDebugType: debugType,
          description: mode.description,
          appliesTo: mode.appliesTo.slice()
          // avoid later mutations
        });
      }
    }
  }
  sortAndDeDup() {
    this.breakpoints = this.breakpoints.sort((first2, second) => {
      if (first2.uri.toString() !== second.uri.toString()) {
        return basenameOrAuthority(first2.uri).localeCompare(basenameOrAuthority(second.uri));
      }
      if (first2.lineNumber === second.lineNumber) {
        if (first2.column && second.column) {
          return first2.column - second.column;
        }
        return 1;
      }
      return first2.lineNumber - second.lineNumber;
    });
    this.breakpoints = distinct(this.breakpoints, (bp) => `${bp.uri.toString()}:${bp.lineNumber}:${bp.column}`);
  }
  setEnablement(element, enable) {
    if (element instanceof Breakpoint2 || element instanceof FunctionBreakpoint2 || element instanceof ExceptionBreakpoint || element instanceof DataBreakpoint2 || element instanceof InstructionBreakpoint) {
      const changed = [];
      if (element.enabled !== enable && (element instanceof Breakpoint2 || element instanceof FunctionBreakpoint2 || element instanceof DataBreakpoint2 || element instanceof InstructionBreakpoint)) {
        changed.push(element);
      }
      element.enabled = enable;
      if (enable) {
        this.breakpointsActivated = true;
      }
      this._onDidChangeBreakpoints.fire({ changed, sessionOnly: false });
    }
  }
  enableOrDisableAllBreakpoints(enable) {
    const changed = [];
    this.breakpoints.forEach((bp) => {
      if (bp.enabled !== enable) {
        changed.push(bp);
      }
      bp.enabled = enable;
    });
    this.functionBreakpoints.forEach((fbp) => {
      if (fbp.enabled !== enable) {
        changed.push(fbp);
      }
      fbp.enabled = enable;
    });
    this.dataBreakpoints.forEach((dbp) => {
      if (dbp.enabled !== enable) {
        changed.push(dbp);
      }
      dbp.enabled = enable;
    });
    this.instructionBreakpoints.forEach((ibp) => {
      if (ibp.enabled !== enable) {
        changed.push(ibp);
      }
      ibp.enabled = enable;
    });
    if (enable) {
      this.breakpointsActivated = true;
    }
    this._onDidChangeBreakpoints.fire({ changed, sessionOnly: false });
  }
  addFunctionBreakpoint(opts, id2) {
    const newFunctionBreakpoint = new FunctionBreakpoint2(opts, id2);
    this.functionBreakpoints.push(newFunctionBreakpoint);
    this._onDidChangeBreakpoints.fire({ added: [newFunctionBreakpoint], sessionOnly: false });
    return newFunctionBreakpoint;
  }
  updateFunctionBreakpoint(id2, update) {
    const functionBreakpoint2 = this.functionBreakpoints.find((fbp) => fbp.getId() === id2);
    if (functionBreakpoint2) {
      if (typeof update.name === "string") {
        functionBreakpoint2.name = update.name;
      }
      if (typeof update.condition === "string") {
        functionBreakpoint2.condition = update.condition;
      }
      if (typeof update.hitCondition === "string") {
        functionBreakpoint2.hitCondition = update.hitCondition;
      }
      this._onDidChangeBreakpoints.fire({ changed: [functionBreakpoint2], sessionOnly: false });
    }
  }
  removeFunctionBreakpoints(id2) {
    let removed;
    if (id2) {
      removed = this.functionBreakpoints.filter((fbp) => fbp.getId() === id2);
      this.functionBreakpoints = this.functionBreakpoints.filter((fbp) => fbp.getId() !== id2);
    } else {
      removed = this.functionBreakpoints;
      this.functionBreakpoints = [];
    }
    this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
  }
  addDataBreakpoint(opts, id2) {
    const newDataBreakpoint = new DataBreakpoint2(opts, id2);
    this.dataBreakpoints.push(newDataBreakpoint);
    this._onDidChangeBreakpoints.fire({ added: [newDataBreakpoint], sessionOnly: false });
  }
  updateDataBreakpoint(id2, update) {
    const dataBreakpoint2 = this.dataBreakpoints.find((fbp) => fbp.getId() === id2);
    if (dataBreakpoint2) {
      if (typeof update.condition === "string") {
        dataBreakpoint2.condition = update.condition;
      }
      if (typeof update.hitCondition === "string") {
        dataBreakpoint2.hitCondition = update.hitCondition;
      }
      this._onDidChangeBreakpoints.fire({ changed: [dataBreakpoint2], sessionOnly: false });
    }
  }
  removeDataBreakpoints(id2) {
    let removed;
    if (id2) {
      removed = this.dataBreakpoints.filter((fbp) => fbp.getId() === id2);
      this.dataBreakpoints = this.dataBreakpoints.filter((fbp) => fbp.getId() !== id2);
    } else {
      removed = this.dataBreakpoints;
      this.dataBreakpoints = [];
    }
    this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
  }
  addInstructionBreakpoint(opts) {
    const newInstructionBreakpoint = new InstructionBreakpoint(opts);
    this.instructionBreakpoints.push(newInstructionBreakpoint);
    this._onDidChangeBreakpoints.fire({ added: [newInstructionBreakpoint], sessionOnly: true });
  }
  removeInstructionBreakpoints(instructionReference, offset, address) {
    let removed = [];
    if (address !== void 0) {
      for (let i2 = 0; i2 < this.instructionBreakpoints.length; i2++) {
        const ibp = this.instructionBreakpoints[i2];
        if (ibp.address === address) {
          removed.push(ibp);
          this.instructionBreakpoints.splice(i2--, 1);
        }
      }
    } else if (instructionReference) {
      for (let i2 = 0; i2 < this.instructionBreakpoints.length; i2++) {
        const ibp = this.instructionBreakpoints[i2];
        if (ibp.instructionReference === instructionReference && (offset === void 0 || ibp.offset === offset)) {
          removed.push(ibp);
          this.instructionBreakpoints.splice(i2--, 1);
        }
      }
    } else {
      removed = this.instructionBreakpoints;
      this.instructionBreakpoints = [];
    }
    this._onDidChangeBreakpoints.fire({ removed, sessionOnly: false });
  }
  getWatchExpressions() {
    return this.watchExpressions;
  }
  addWatchExpression(name) {
    const we = new Expression(name || "");
    this.watchExpressions.push(we);
    this._onDidChangeWatchExpressions.fire(we);
    return we;
  }
  renameWatchExpression(id2, newName) {
    const filtered = this.watchExpressions.filter((we) => we.getId() === id2);
    if (filtered.length === 1) {
      filtered[0].name = newName;
      this._onDidChangeWatchExpressions.fire(filtered[0]);
    }
  }
  removeWatchExpressions(id2 = null) {
    this.watchExpressions = id2 ? this.watchExpressions.filter((we) => we.getId() !== id2) : [];
    this._onDidChangeWatchExpressions.fire(void 0);
  }
  moveWatchExpression(id2, position2) {
    const we = this.watchExpressions.find((we2) => we2.getId() === id2);
    if (we) {
      this.watchExpressions = this.watchExpressions.filter((we2) => we2.getId() !== id2);
      this.watchExpressions = this.watchExpressions.slice(0, position2).concat(we, this.watchExpressions.slice(position2));
      this._onDidChangeWatchExpressions.fire(void 0);
    }
  }
  sourceIsNotAvailable(uri4) {
    this.sessions.forEach((s) => {
      const source = s.getSourceForUri(uri4);
      if (source) {
        source.available = false;
      }
    });
    this._onDidChangeCallStack.fire(void 0);
  }
};

DebugModel = __decorateClass([
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], DebugModel);
export { handleSetResponse, toBreakpointSessionData, ExpressionContainer, VisualizedExpression, Expression, Variable3, Scope, ErrorScope, StackFrame, getUriForDebugMemory, Enablement, BaseBreakpoint, Breakpoint2, FunctionBreakpoint2, DataBreakpoint2, ExceptionBreakpoint, InstructionBreakpoint, DebugModel };
