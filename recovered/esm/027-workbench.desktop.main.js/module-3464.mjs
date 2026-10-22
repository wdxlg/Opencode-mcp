// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/problemMatcher.ts
import { isBoolean, isNumber, isString, isStringArray, isUndefined, isUndefinedOrNull } from "./module-0010.mjs";
import { join, normalize } from "./module-0026.mjs";
import { deepClone, mixin } from "./module-0098.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { asArray } from "./module-0007.mjs";
import { OS } from "./module-0014.mjs";
import { equalsIgnoreCase, trim } from "./module-0030.mjs";
import { severity_default } from "./module-0266.mjs";
import { MarkerSeverity2 } from "./module-0560.mjs";
import { ok } from "./module-0009.mjs";
import { Parser3, ValidationStatus } from "./module-3463.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/tasks/common/problemMatcher.ts
var FileLocationKind = /* @__PURE__ */ ((FileLocationKind2) => {
  FileLocationKind2[FileLocationKind2["Default"] = 0] = "Default";
  FileLocationKind2[FileLocationKind2["Relative"] = 1] = "Relative";
  FileLocationKind2[FileLocationKind2["Absolute"] = 2] = "Absolute";
  FileLocationKind2[FileLocationKind2["AutoDetect"] = 3] = "AutoDetect";
  FileLocationKind2[FileLocationKind2["Search"] = 4] = "Search";
  return FileLocationKind2;
})(FileLocationKind || {});

((FileLocationKind2) => {
  function fromString(value2) {
    value2 = value2.toLowerCase();
    if (value2 === "absolute") {
      return 2 /* Absolute */;
    } else if (value2 === "relative") {
      return 1 /* Relative */;
    } else if (value2 === "autodetect") {
      return 3 /* AutoDetect */;
    } else if (value2 === "search") {
      return 4 /* Search */;
    } else {
      return void 0;
    }
  }
  FileLocationKind2.fromString = fromString;
})(FileLocationKind || (FileLocationKind = {}));

var ProblemLocationKind = /* @__PURE__ */ ((ProblemLocationKind2) => {
  ProblemLocationKind2[ProblemLocationKind2["File"] = 0] = "File";
  ProblemLocationKind2[ProblemLocationKind2["Location"] = 1] = "Location";
  return ProblemLocationKind2;
})(ProblemLocationKind || {});

((ProblemLocationKind2) => {
  function fromString(value2) {
    value2 = value2.toLowerCase();
    if (value2 === "file") {
      return 0 /* File */;
    } else if (value2 === "location") {
      return 1 /* Location */;
    } else {
      return void 0;
    }
  }
  ProblemLocationKind2.fromString = fromString;
})(ProblemLocationKind || (ProblemLocationKind = {}));

var ApplyToKind = /* @__PURE__ */ ((ApplyToKind2) => {
  ApplyToKind2[ApplyToKind2["allDocuments"] = 0] = "allDocuments";
  ApplyToKind2[ApplyToKind2["openDocuments"] = 1] = "openDocuments";
  ApplyToKind2[ApplyToKind2["closedDocuments"] = 2] = "closedDocuments";
  return ApplyToKind2;
})(ApplyToKind || {});

((ApplyToKind2) => {
  function fromString(value2) {
    value2 = value2.toLowerCase();
    if (value2 === "alldocuments") {
      return 0 /* allDocuments */;
    } else if (value2 === "opendocuments") {
      return 1 /* openDocuments */;
    } else if (value2 === "closeddocuments") {
      return 2 /* closedDocuments */;
    } else {
      return void 0;
    }
  }
  ApplyToKind2.fromString = fromString;
})(ApplyToKind || (ApplyToKind = {}));

function isNamedProblemMatcher(value2) {
  return value2 && isString(value2.name) ? true : false;
}

async function getResource(filename, matcher, fileService) {
  const kind = matcher.fileLocation;
  let fullPath;
  if (kind === 2 /* Absolute */) {
    fullPath = filename;
  } else if (kind === 1 /* Relative */ && matcher.filePrefix && isString(matcher.filePrefix)) {
    fullPath = join(matcher.filePrefix, filename);
  } else if (kind === 3 /* AutoDetect */) {
    const matcherClone = deepClone(matcher);
    matcherClone.fileLocation = 1 /* Relative */;
    if (fileService) {
      const relative2 = await getResource(filename, matcherClone);
      let stat = void 0;
      try {
        stat = await fileService.stat(relative2);
      } catch (ex) {
      }
      if (stat) {
        return relative2;
      }
    }
    matcherClone.fileLocation = 2 /* Absolute */;
    return getResource(filename, matcherClone);
  } else if (kind === 4 /* Search */ && fileService) {
    const fsProvider = fileService.getProvider(Schemas.file);
    if (fsProvider) {
      const uri5 = await searchForFileLocation(filename, fsProvider, matcher.filePrefix);
      fullPath = uri5?.path;
    }
    if (!fullPath) {
      const absoluteMatcher = deepClone(matcher);
      absoluteMatcher.fileLocation = 2 /* Absolute */;
      return getResource(filename, absoluteMatcher);
    }
  }
  if (fullPath === void 0) {
    throw new Error("FileLocationKind is not actionable. Does the matcher have a filePrefix? This should never happen.");
  }
  fullPath = normalize(fullPath);
  fullPath = fullPath.replace(/\\/g, "/");
  if (fullPath[0] !== "/") {
    fullPath = "/" + fullPath;
  }
  if (matcher.uriProvider !== void 0) {
    return matcher.uriProvider(fullPath);
  } else {
    return URI.file(fullPath);
  }
}

async function searchForFileLocation(filename, fsProvider, args2) {
  const exclusions = new Set(asArray(args2.exclude || []).map((x) => URI.file(x).path));
  async function search2(dir) {
    if (exclusions.has(dir.path)) {
      return void 0;
    }
    const entries2 = await fsProvider.readdir(dir);
    const subdirs = [];
    for (const [name, fileType] of entries2) {
      if (fileType === 2 /* Directory */) {
        subdirs.push(URI.joinPath(dir, name));
        continue;
      }
      if (fileType === 1 /* File */) {
        const fullUri = URI.joinPath(dir, name);
        if (fullUri.path.endsWith(filename)) {
          return fullUri;
        }
      }
    }
    for (const subdir of subdirs) {
      const result = await search2(subdir);
      if (result) {
        return result;
      }
    }
    return void 0;
  }
  for (const dir of asArray(args2.include || [])) {
    const hit = await search2(URI.file(dir));
    if (hit) {
      return hit;
    }
  }
  return void 0;
}

function createLineMatcher(matcher, fileService, logService) {
  const pattern = matcher.pattern;
  if (Array.isArray(pattern)) {
    return new MultiLineMatcher(matcher, fileService, logService);
  } else {
    return new SingleLineMatcher(matcher, fileService, logService);
  }
}

var endOfLine = OS === 1 /* Windows */ ? "\r\n" : "\n";

var AbstractLineMatcher = class {
  constructor(matcher, fileService, logService) {
    this.matcher = matcher;
    this.fileService = fileService;
    this.logService = logService;
  }
  handle(lines, start = 0) {
    return { match: null, continue: false };
  }
  next(line) {
    return null;
  }
  regexpExec(regexp2, line) {
    const start = Date.now();
    const result = regexp2.exec(line);
    const elapsed = Date.now() - start;
    if (elapsed > 5) {
      this.logService?.trace(`ProblemMatcher: slow regexp took ${elapsed}ms to execute`, regexp2.source);
    }
    return result;
  }
  fillProblemData(data, pattern, matches2) {
    if (data) {
      this.fillProperty(data, "file", pattern, matches2, true);
      this.appendProperty(data, "message", pattern, matches2, true);
      this.fillProperty(data, "code", pattern, matches2, true);
      this.fillProperty(data, "severity", pattern, matches2, true);
      this.fillProperty(data, "location", pattern, matches2, true);
      this.fillProperty(data, "line", pattern, matches2);
      this.fillProperty(data, "character", pattern, matches2);
      this.fillProperty(data, "endLine", pattern, matches2);
      this.fillProperty(data, "endCharacter", pattern, matches2);
      return true;
    } else {
      return false;
    }
  }
  appendProperty(data, property, pattern, matches2, trim2 = false) {
    const patternProperty = pattern[property];
    if (isUndefined(data[property])) {
      this.fillProperty(data, property, pattern, matches2, trim2);
    } else if (!isUndefined(patternProperty) && patternProperty < matches2.length) {
      let value2 = matches2[patternProperty];
      if (trim2) {
        value2 = trim(value2);
      }
      data[property] = data[property] + endOfLine + value2;
    }
  }
  fillProperty(data, property, pattern, matches2, trim2 = false) {
    const patternAtProperty = pattern[property];
    if (isUndefined(data[property]) && !isUndefined(patternAtProperty) && patternAtProperty < matches2.length) {
      let value2 = matches2[patternAtProperty];
      if (value2 !== void 0) {
        if (trim2) {
          value2 = trim(value2);
        }
        data[property] = value2;
      }
    }
  }
  getMarkerMatch(data) {
    try {
      const location2 = this.getLocation(data);
      if (data.file && location2 && data.message) {
        const marker = {
          severity: this.getSeverity(data),
          startLineNumber: location2.startLineNumber,
          startColumn: location2.startCharacter,
          endLineNumber: location2.endLineNumber,
          endColumn: location2.endCharacter,
          message: data.message
        };
        if (data.code !== void 0) {
          marker.code = data.code;
        }
        if (this.matcher.source !== void 0) {
          marker.source = this.matcher.source;
        }
        return {
          description: this.matcher,
          resource: this.getResource(data.file),
          marker
        };
      }
    } catch (err) {
      console.error(`Failed to convert problem data into match: ${JSON.stringify(data)}`);
    }
    return void 0;
  }
  getResource(filename) {
    return getResource(filename, this.matcher, this.fileService);
  }
  getLocation(data) {
    if (data.kind === 0 /* File */) {
      return this.createLocation(0, 0, 0, 0);
    }
    if (data.location) {
      return this.parseLocationInfo(data.location);
    }
    if (!data.line) {
      return null;
    }
    const startLine = parseInt(data.line);
    const startColumn = data.character ? parseInt(data.character) : void 0;
    const endLine = data.endLine ? parseInt(data.endLine) : void 0;
    const endColumn = data.endCharacter ? parseInt(data.endCharacter) : void 0;
    return this.createLocation(startLine, startColumn, endLine, endColumn);
  }
  parseLocationInfo(value2) {
    if (!value2 || !value2.match(/(\d+|\d+,\d+|\d+,\d+,\d+,\d+)/)) {
      return null;
    }
    const parts = value2.split(",");
    const startLine = parseInt(parts[0]);
    const startColumn = parts.length > 1 ? parseInt(parts[1]) : void 0;
    if (parts.length > 3) {
      return this.createLocation(startLine, startColumn, parseInt(parts[2]), parseInt(parts[3]));
    } else {
      return this.createLocation(startLine, startColumn, void 0, void 0);
    }
  }
  createLocation(startLine, startColumn, endLine, endColumn) {
    if (startColumn !== void 0 && endColumn !== void 0) {
      return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: endLine || startLine, endCharacter: endColumn };
    }
    if (startColumn !== void 0) {
      return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: startLine, endCharacter: startColumn };
    }
    return { startLineNumber: startLine, startCharacter: 1, endLineNumber: startLine, endCharacter: 2 ** 31 - 1 };
  }
  getSeverity(data) {
    let result = null;
    if (data.severity) {
      const value2 = data.severity;
      if (value2) {
        result = severity_default.fromValue(value2);
        if (result === severity_default.Ignore) {
          if (value2 === "E") {
            result = severity_default.Error;
          } else if (value2 === "W") {
            result = severity_default.Warning;
          } else if (value2 === "I") {
            result = severity_default.Info;
          } else if (equalsIgnoreCase(value2, "hint")) {
            result = severity_default.Info;
          } else if (equalsIgnoreCase(value2, "note")) {
            result = severity_default.Info;
          }
        }
      }
    }
    if (result === null || result === severity_default.Ignore) {
      result = this.matcher.severity || severity_default.Error;
    }
    return MarkerSeverity2.fromSeverity(result);
  }
};

var SingleLineMatcher = class extends AbstractLineMatcher {
  constructor(matcher, fileService, logService) {
    super(matcher, fileService, logService);
    this.pattern = matcher.pattern;
  }
  get matchLength() {
    return 1;
  }
  handle(lines, start = 0) {
    ok(lines.length - start === 1);
    const data = /* @__PURE__ */ Object.create(null);
    if (this.pattern.kind !== void 0) {
      data.kind = this.pattern.kind;
    }
    const matches2 = this.regexpExec(this.pattern.regexp, lines[start]);
    if (matches2) {
      this.fillProblemData(data, this.pattern, matches2);
      if (data.kind === 1 /* Location */ && !data.location && !data.line && data.file) {
        data.kind = 0 /* File */;
      }
      const match2 = this.getMarkerMatch(data);
      if (match2) {
        return { match: match2, continue: false };
      }
    }
    return { match: null, continue: false };
  }
  next(line) {
    return null;
  }
};

var MultiLineMatcher = class extends AbstractLineMatcher {
  constructor(matcher, fileService, logService) {
    super(matcher, fileService, logService);
    this.patterns = matcher.pattern;
  }
  get matchLength() {
    return this.patterns.length;
  }
  handle(lines, start = 0) {
    ok(lines.length - start === this.patterns.length);
    this.data = /* @__PURE__ */ Object.create(null);
    let data = this.data;
    data.kind = this.patterns[0].kind;
    for (let i2 = 0; i2 < this.patterns.length; i2++) {
      const pattern = this.patterns[i2];
      const matches2 = this.regexpExec(pattern.regexp, lines[i2 + start]);
      if (!matches2) {
        return { match: null, continue: false };
      } else {
        if (pattern.loop && i2 === this.patterns.length - 1) {
          data = deepClone(data);
        }
        this.fillProblemData(data, pattern, matches2);
      }
    }
    const loop = !!this.patterns[this.patterns.length - 1].loop;
    if (!loop) {
      this.data = void 0;
    }
    const markerMatch = data ? this.getMarkerMatch(data) : null;
    return { match: markerMatch ? markerMatch : null, continue: loop };
  }
  next(line) {
    const pattern = this.patterns[this.patterns.length - 1];
    ok(pattern.loop === true && this.data !== null);
    const matches2 = this.regexpExec(pattern.regexp, line);
    if (!matches2) {
      this.data = void 0;
      return null;
    }
    const data = deepClone(this.data);
    let problemMatch;
    if (this.fillProblemData(data, pattern, matches2)) {
      problemMatch = this.getMarkerMatch(data);
    }
    return problemMatch ? problemMatch : null;
  }
};

var Config;

((Config2) => {
  let CheckedProblemPattern;
  ((CheckedProblemPattern2) => {
    function is(value2) {
      const candidate = value2;
      return candidate && isString(candidate.regexp);
    }
    CheckedProblemPattern2.is = is;
  })(CheckedProblemPattern = Config2.CheckedProblemPattern || (Config2.CheckedProblemPattern = {}));
  let NamedProblemPattern;
  ((NamedProblemPattern2) => {
    function is(value2) {
      const candidate = value2;
      return candidate && isString(candidate.name);
    }
    NamedProblemPattern2.is = is;
  })(NamedProblemPattern = Config2.NamedProblemPattern || (Config2.NamedProblemPattern = {}));
  let NamedCheckedProblemPattern;
  ((NamedCheckedProblemPattern2) => {
    function is(value2) {
      const candidate = value2;
      return candidate && NamedProblemPattern.is(candidate) && isString(candidate.regexp);
    }
    NamedCheckedProblemPattern2.is = is;
  })(NamedCheckedProblemPattern = Config2.NamedCheckedProblemPattern || (Config2.NamedCheckedProblemPattern = {}));
  let MultiLineProblemPattern;
  ((MultiLineProblemPattern2) => {
    function is(value2) {
      return Array.isArray(value2);
    }
    MultiLineProblemPattern2.is = is;
  })(MultiLineProblemPattern = Config2.MultiLineProblemPattern || (Config2.MultiLineProblemPattern = {}));
  let MultiLineCheckedProblemPattern;
  ((MultiLineCheckedProblemPattern2) => {
    function is(value2) {
      if (!MultiLineProblemPattern.is(value2)) {
        return false;
      }
      for (const element of value2) {
        if (!Config2.CheckedProblemPattern.is(element)) {
          return false;
        }
      }
      return true;
    }
    MultiLineCheckedProblemPattern2.is = is;
  })(MultiLineCheckedProblemPattern = Config2.MultiLineCheckedProblemPattern || (Config2.MultiLineCheckedProblemPattern = {}));
  let NamedMultiLineCheckedProblemPattern;
  ((NamedMultiLineCheckedProblemPattern2) => {
    function is(value2) {
      const candidate = value2;
      return candidate && isString(candidate.name) && Array.isArray(candidate.patterns) && MultiLineCheckedProblemPattern.is(candidate.patterns);
    }
    NamedMultiLineCheckedProblemPattern2.is = is;
  })(NamedMultiLineCheckedProblemPattern = Config2.NamedMultiLineCheckedProblemPattern || (Config2.NamedMultiLineCheckedProblemPattern = {}));
  function isNamedProblemMatcher2(value2) {
    return isString(value2.name);
  }
  Config2.isNamedProblemMatcher = isNamedProblemMatcher2;
})(Config || (Config = {}));

var ProblemPatternParser = class extends Parser3 {
  constructor(logger) {
    super(logger);
  }
  parse(value2) {
    if (Config.NamedMultiLineCheckedProblemPattern.is(value2)) {
      return this.createNamedMultiLineProblemPattern(value2);
    } else if (Config.MultiLineCheckedProblemPattern.is(value2)) {
      return this.createMultiLineProblemPattern(value2);
    } else if (Config.NamedCheckedProblemPattern.is(value2)) {
      const result = this.createSingleProblemPattern(value2);
      result.name = value2.name;
      return result;
    } else if (Config.CheckedProblemPattern.is(value2)) {
      return this.createSingleProblemPattern(value2);
    } else {
      this.error(localize(19848, null));
      return null;
    }
  }
  createSingleProblemPattern(value2) {
    const result = this.doCreateSingleProblemPattern(value2, true);
    if (result === void 0) {
      return null;
    } else if (result.kind === void 0) {
      result.kind = 1 /* Location */;
    }
    return this.validateProblemPattern([result]) ? result : null;
  }
  createNamedMultiLineProblemPattern(value2) {
    const validPatterns = this.createMultiLineProblemPattern(value2.patterns);
    if (!validPatterns) {
      return null;
    }
    const result = {
      name: value2.name,
      label: value2.label ? value2.label : value2.name,
      patterns: validPatterns
    };
    return result;
  }
  createMultiLineProblemPattern(values) {
    const result = [];
    for (let i2 = 0; i2 < values.length; i2++) {
      const pattern = this.doCreateSingleProblemPattern(values[i2], false);
      if (pattern === void 0) {
        return null;
      }
      if (i2 < values.length - 1) {
        if (!isUndefined(pattern.loop) && pattern.loop) {
          pattern.loop = false;
          this.error(localize(19843, null));
        }
      }
      result.push(pattern);
    }
    if (!result || result.length === 0) {
      this.error(localize(19844, null));
      return null;
    }
    if (result[0].kind === void 0) {
      result[0].kind = 1 /* Location */;
    }
    return this.validateProblemPattern(result) ? result : null;
  }
  doCreateSingleProblemPattern(value2, setDefaults) {
    const regexp2 = this.createRegularExpression(value2.regexp);
    if (regexp2 === void 0) {
      return void 0;
    }
    let result = { regexp: regexp2 };
    if (value2.kind) {
      result.kind = ProblemLocationKind.fromString(value2.kind);
    }
    function copyProperty(result2, source, resultKey, sourceKey) {
      const value3 = source[sourceKey];
      if (typeof value3 === "number") {
        result2[resultKey] = value3;
      }
    }
    copyProperty(result, value2, "file", "file");
    copyProperty(result, value2, "location", "location");
    copyProperty(result, value2, "line", "line");
    copyProperty(result, value2, "character", "column");
    copyProperty(result, value2, "endLine", "endLine");
    copyProperty(result, value2, "endCharacter", "endColumn");
    copyProperty(result, value2, "severity", "severity");
    copyProperty(result, value2, "code", "code");
    copyProperty(result, value2, "message", "message");
    if (value2.loop === true || value2.loop === false) {
      result.loop = value2.loop;
    }
    if (setDefaults) {
      if (result.location || result.kind === 0 /* File */) {
        const defaultValue = {
          file: 1,
          message: 0
        };
        result = mixin(result, defaultValue, false);
      } else {
        const defaultValue = {
          file: 1,
          line: 2,
          character: 3,
          message: 0
        };
        result = mixin(result, defaultValue, false);
      }
    }
    return result;
  }
  validateProblemPattern(values) {
    if (!values || values.length === 0) {
      this.error(localize(19844, null));
      return false;
    }
    let file = false, message = false, location2 = false, line = false;
    const locationKind = values[0].kind === void 0 ? 1 /* Location */ : values[0].kind;
    values.forEach((pattern, i2) => {
      if (i2 !== 0 && pattern.kind) {
        this.error(localize(19845, null));
      }
      file = file || !isUndefined(pattern.file);
      message = message || !isUndefined(pattern.message);
      location2 = location2 || !isUndefined(pattern.location);
      line = line || !isUndefined(pattern.line);
    });
    if (!(file && message)) {
      this.error(localize(19847, null));
      return false;
    }
    if (locationKind === 1 /* Location */ && !(location2 || line)) {
      this.error(localize(19846, null));
      return false;
    }
    return true;
  }
  createRegularExpression(value2) {
    let result;
    try {
      result = new RegExp(value2);
    } catch (err) {
      this.error(localize(19842, null, value2));
    }
    return result;
  }
};

var ExtensionRegistryReporter = class {
  constructor(_collector, _validationStatus = new ValidationStatus()) {
    this._collector = _collector;
    this._validationStatus = _validationStatus;
  }
  info(message) {
    this._validationStatus.state = 1 /* Info */;
    this._collector.info(message);
  }
  warn(message) {
    this._validationStatus.state = 2 /* Warning */;
    this._collector.warn(message);
  }
  error(message) {
    this._validationStatus.state = 3 /* Error */;
    this._collector.error(message);
  }
  fatal(message) {
    this._validationStatus.state = 4 /* Fatal */;
    this._collector.error(message);
  }
  get status() {
    return this._validationStatus;
  }
};

var Schemas2;

((Schemas3) => {
  Schemas3.ProblemPattern = {
    default: {
      regexp: "^([^\\\\s].*)\\\\((\\\\d+,\\\\d+)\\\\):\\\\s*(.*)$",
      file: 1,
      location: 2,
      message: 3
    },
    type: "object",
    additionalProperties: false,
    properties: {
      regexp: {
        type: "string",
        description: localize(19860, null)
      },
      kind: {
        type: "string",
        description: localize(19855, null)
      },
      file: {
        type: "integer",
        description: localize(19854, null)
      },
      location: {
        type: "integer",
        description: localize(19857, null)
      },
      line: {
        type: "integer",
        description: localize(19856, null)
      },
      column: {
        type: "integer",
        description: localize(19851, null)
      },
      endLine: {
        type: "integer",
        description: localize(19853, null)
      },
      endColumn: {
        type: "integer",
        description: localize(19852, null)
      },
      severity: {
        type: "integer",
        description: localize(19861, null)
      },
      code: {
        type: "integer",
        description: localize(19850, null)
      },
      message: {
        type: "integer",
        description: localize(19859, null)
      },
      loop: {
        type: "boolean",
        description: localize(19858, null)
      }
    }
  };
  Schemas3.NamedProblemPattern = deepClone(Schemas3.ProblemPattern);
  Schemas3.NamedProblemPattern.properties = deepClone(Schemas3.NamedProblemPattern.properties) || {};
  Schemas3.NamedProblemPattern.properties["name"] = {
    type: "string",
    description: localize(19812, null)
  };
  Schemas3.MultiLineProblemPattern = {
    type: "array",
    items: Schemas3.ProblemPattern
  };
  Schemas3.NamedMultiLineProblemPattern = {
    type: "object",
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        description: localize(19808, null)
      },
      patterns: {
        type: "array",
        description: localize(19809, null),
        items: Schemas3.ProblemPattern
      }
    }
  };
  Schemas3.WatchingPattern = {
    type: "object",
    additionalProperties: false,
    properties: {
      regexp: {
        type: "string",
        description: localize(19863, null)
      },
      file: {
        type: "integer",
        description: localize(19862, null)
      }
    }
  };
  Schemas3.PatternType = {
    anyOf: [
      {
        type: "string",
        description: localize(19814, null)
      },
      Schemas3.ProblemPattern,
      Schemas3.MultiLineProblemPattern
    ],
    description: localize(19813, null)
  };
  Schemas3.ProblemMatcher = {
    type: "object",
    additionalProperties: false,
    properties: {
      base: {
        type: "string",
        description: localize(19831, null)
      },
      owner: {
        type: "string",
        description: localize(19833, null)
      },
      source: {
        type: "string",
        description: localize(19835, null)
      },
      severity: {
        type: "string",
        enum: ["error", "warning", "info"],
        description: localize(19834, null)
      },
      applyTo: {
        type: "string",
        enum: ["allDocuments", "openDocuments", "closedDocuments"],
        description: localize(19826, null)
      },
      pattern: Schemas3.PatternType,
      fileLocation: {
        oneOf: [
          {
            type: "string",
            enum: ["absolute", "relative", "autoDetect", "search"]
          },
          {
            type: "array",
            prefixItems: [
              {
                type: "string",
                enum: ["absolute", "relative", "autoDetect", "search"]
              }
            ],
            minItems: 1,
            maxItems: 1,
            additionalItems: false
          },
          {
            type: "array",
            prefixItems: [
              { type: "string", enum: ["relative", "autoDetect"] },
              { type: "string" }
            ],
            minItems: 2,
            maxItems: 2,
            additionalItems: false,
            examples: [
              ["relative", "${workspaceFolder}"],
              ["autoDetect", "${workspaceFolder}"]
            ]
          },
          {
            type: "array",
            prefixItems: [
              { type: "string", enum: ["search"] },
              {
                type: "object",
                properties: {
                  "include": {
                    oneOf: [
                      { type: "string" },
                      { type: "array", items: { type: "string" } }
                    ]
                  },
                  "exclude": {
                    oneOf: [
                      { type: "string" },
                      { type: "array", items: { type: "string" } }
                    ]
                  }
                },
                required: ["include"]
              }
            ],
            minItems: 2,
            maxItems: 2,
            additionalItems: false,
            examples: [
              ["search", { "include": ["${workspaceFolder}"] }],
              ["search", { "include": ["${workspaceFolder}"], "exclude": [] }]
            ]
          }
        ],
        description: localize(19832, null)
      },
      background: {
        type: "object",
        additionalProperties: false,
        description: localize(19827, null),
        properties: {
          activeOnStart: {
            type: "boolean",
            description: localize(19828, null)
          },
          beginsPattern: {
            oneOf: [
              {
                type: "string"
              },
              Schemas3.WatchingPattern
            ],
            description: localize(19829, null)
          },
          endsPattern: {
            oneOf: [
              {
                type: "string"
              },
              Schemas3.WatchingPattern
            ],
            description: localize(19830, null)
          }
        }
      },
      watching: {
        type: "object",
        additionalProperties: false,
        deprecationMessage: localize(19839, null),
        description: localize(19836, null),
        properties: {
          activeOnStart: {
            type: "boolean",
            description: localize(19837, null)
          },
          beginsPattern: {
            oneOf: [
              {
                type: "string"
              },
              Schemas3.WatchingPattern
            ],
            description: localize(19838, null)
          },
          endsPattern: {
            oneOf: [
              {
                type: "string"
              },
              Schemas3.WatchingPattern
            ],
            description: localize(19840, null)
          }
        }
      }
    }
  };
  Schemas3.LegacyProblemMatcher = deepClone(Schemas3.ProblemMatcher);
  Schemas3.LegacyProblemMatcher.properties = deepClone(Schemas3.LegacyProblemMatcher.properties) || {};
  Schemas3.LegacyProblemMatcher.properties["watchedTaskBeginsRegExp"] = {
    type: "string",
    deprecationMessage: localize(19803, null),
    description: localize(19802, null)
  };
  Schemas3.LegacyProblemMatcher.properties["watchedTaskEndsRegExp"] = {
    type: "string",
    deprecationMessage: localize(19805, null),
    description: localize(19804, null)
  };
  Schemas3.NamedProblemMatcher = deepClone(Schemas3.ProblemMatcher);
  Schemas3.NamedProblemMatcher.properties = deepClone(Schemas3.NamedProblemMatcher.properties) || {};
  Schemas3.NamedProblemMatcher.properties.name = {
    type: "string",
    description: localize(19811, null)
  };
  Schemas3.NamedProblemMatcher.properties.label = {
    type: "string",
    description: localize(19810, null)
  };
})(Schemas2 || (Schemas2 = {}));

var problemPatternExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "problemPatterns",
  jsonSchema: {
    description: localize(19841, null),
    type: "array",
    items: {
      anyOf: [
        Schemas2.NamedProblemPattern,
        Schemas2.NamedMultiLineProblemPattern
      ]
    }
  }
});

var ProblemPatternRegistryImpl = class {
  constructor() {
    this.patterns = /* @__PURE__ */ Object.create(null);
    this.fillDefaults();
    this.readyPromise = new Promise((resolve3, reject) => {
      problemPatternExtPoint.setHandler((extensions, delta2) => {
        try {
          delta2.removed.forEach((extension) => {
            const problemPatterns = extension.value;
            for (const pattern of problemPatterns) {
              if (this.patterns[pattern.name]) {
                delete this.patterns[pattern.name];
              }
            }
          });
          delta2.added.forEach((extension) => {
            const problemPatterns = extension.value;
            const parser2 = new ProblemPatternParser(new ExtensionRegistryReporter(extension.collector));
            for (const pattern of problemPatterns) {
              if (Config.NamedMultiLineCheckedProblemPattern.is(pattern)) {
                const result = parser2.parse(pattern);
                if (parser2.problemReporter.status.state < 3 /* Error */) {
                  this.add(result.name, result.patterns);
                } else {
                  extension.collector.error(localize(19849, null));
                  extension.collector.error(JSON.stringify(pattern, void 0, 4));
                }
              } else if (Config.NamedProblemPattern.is(pattern)) {
                const result = parser2.parse(pattern);
                if (parser2.problemReporter.status.state < 3 /* Error */) {
                  this.add(pattern.name, result);
                } else {
                  extension.collector.error(localize(19849, null));
                  extension.collector.error(JSON.stringify(pattern, void 0, 4));
                }
              }
              parser2.reset();
            }
          });
        } catch (error) {
        }
        resolve3(void 0);
      });
    });
  }
  onReady() {
    return this.readyPromise;
  }
  add(key3, value2) {
    this.patterns[key3] = value2;
  }
  get(key3) {
    return this.patterns[key3];
  }
  fillDefaults() {
    this.add("msCompile", {
      regexp: /^\s*(?:\s*\d+>)?(\S.*?)(?:\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\))?\s*:\s+(?:(\S+)\s+)?((?:fatal +)?error|warning|info)\s+(\w+\d+)?\s*:\s*(.*)$/,
      kind: 1 /* Location */,
      file: 1,
      location: 2,
      severity: 4,
      code: 5,
      message: 6
    });
    this.add("gulp-tsc", {
      regexp: /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(\d+)\s+(.*)$/,
      kind: 1 /* Location */,
      file: 1,
      location: 2,
      code: 3,
      message: 4
    });
    this.add("cpp", {
      regexp: /^(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(C\d+)\s*:\s*(.*)$/,
      kind: 1 /* Location */,
      file: 1,
      location: 2,
      severity: 3,
      code: 4,
      message: 5
    });
    this.add("csc", {
      regexp: /^(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(CS\d+)\s*:\s*(.*)$/,
      kind: 1 /* Location */,
      file: 1,
      location: 2,
      severity: 3,
      code: 4,
      message: 5
    });
    this.add("vb", {
      regexp: /^(\S.*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(BC\d+)\s*:\s*(.*)$/,
      kind: 1 /* Location */,
      file: 1,
      location: 2,
      severity: 3,
      code: 4,
      message: 5
    });
    this.add("lessCompile", {
      regexp: /^\s*(.*) in file (.*) line no. (\d+)$/,
      kind: 1 /* Location */,
      message: 1,
      file: 2,
      line: 3
    });
    this.add("jshint", {
      regexp: /^(.*):\s+line\s+(\d+),\s+col\s+(\d+),\s(.+?)(?:\s+\((\w)(\d+)\))?$/,
      kind: 1 /* Location */,
      file: 1,
      line: 2,
      character: 3,
      message: 4,
      severity: 5,
      code: 6
    });
    this.add("jshint-stylish", [
      {
        regexp: /^(.+)$/,
        kind: 1 /* Location */,
        file: 1
      },
      {
        regexp: /^\s+line\s+(\d+)\s+col\s+(\d+)\s+(.+?)(?:\s+\((\w)(\d+)\))?$/,
        line: 1,
        character: 2,
        message: 3,
        severity: 4,
        code: 5,
        loop: true
      }
    ]);
    this.add("eslint-compact", {
      regexp: /^(.+):\sline\s(\d+),\scol\s(\d+),\s(Error|Warning|Info)\s-\s(.+)\s\((.+)\)$/,
      file: 1,
      kind: 1 /* Location */,
      line: 2,
      character: 3,
      severity: 4,
      message: 5,
      code: 6
    });
    this.add("eslint-stylish", [
      {
        regexp: /^((?:[a-zA-Z]:)*[./\\]+.*?)$/,
        kind: 1 /* Location */,
        file: 1
      },
      {
        regexp: /^\s+(\d+):(\d+)\s+(error|warning|info)\s+(.+?)(?:\s\s+(.*))?$/,
        line: 1,
        character: 2,
        severity: 3,
        message: 4,
        code: 5,
        loop: true
      }
    ]);
    this.add("go", {
      regexp: /^([^:]*: )?((.:)?[^:]*):(\d+)(:(\d+))?: (.*)$/,
      kind: 1 /* Location */,
      file: 2,
      line: 4,
      character: 6,
      message: 7
    });
  }
};

var ProblemPatternRegistry = new ProblemPatternRegistryImpl();

var ProblemMatcherParser = class extends Parser3 {
  constructor(logger) {
    super(logger);
  }
  parse(json) {
    const result = this.createProblemMatcher(json);
    if (!this.checkProblemMatcherValid(json, result)) {
      return void 0;
    }
    this.addWatchingMatcher(json, result);
    return result;
  }
  checkProblemMatcherValid(externalProblemMatcher, problemMatcher) {
    if (!problemMatcher) {
      this.error(localize(19821, null, JSON.stringify(externalProblemMatcher, null, 4)));
      return false;
    }
    if (!problemMatcher.pattern) {
      this.error(localize(19822, null, JSON.stringify(externalProblemMatcher, null, 4)));
      return false;
    }
    if (!problemMatcher.owner) {
      this.error(localize(19820, null, JSON.stringify(externalProblemMatcher, null, 4)));
      return false;
    }
    if (isUndefined(problemMatcher.fileLocation)) {
      this.error(localize(19818, null, JSON.stringify(externalProblemMatcher, null, 4)));
      return false;
    }
    return true;
  }
  createProblemMatcher(description) {
    let result = null;
    const owner = isString(description.owner) ? description.owner : generateUuid();
    const source = isString(description.source) ? description.source : void 0;
    let applyTo = isString(description.applyTo) ? ApplyToKind.fromString(description.applyTo) : 0 /* allDocuments */;
    if (!applyTo) {
      applyTo = 0 /* allDocuments */;
    }
    let fileLocation = void 0;
    let filePrefix = void 0;
    let kind;
    if (isUndefined(description.fileLocation)) {
      fileLocation = 1 /* Relative */;
      filePrefix = "${workspaceFolder}";
    } else if (isString(description.fileLocation)) {
      kind = FileLocationKind.fromString(description.fileLocation);
      if (kind) {
        fileLocation = kind;
        if (kind === 1 /* Relative */ || kind === 3 /* AutoDetect */) {
          filePrefix = "${workspaceFolder}";
        } else if (kind === 4 /* Search */) {
          filePrefix = { include: ["${workspaceFolder}"] };
        }
      }
    } else if (isStringArray(description.fileLocation)) {
      const values = description.fileLocation;
      if (values.length > 0) {
        kind = FileLocationKind.fromString(values[0]);
        if (values.length === 1 && kind === 2 /* Absolute */) {
          fileLocation = kind;
        } else if (values.length === 2 && (kind === 1 /* Relative */ || kind === 3 /* AutoDetect */) && values[1]) {
          fileLocation = kind;
          filePrefix = values[1];
        }
      }
    } else if (Array.isArray(description.fileLocation)) {
      const kind2 = FileLocationKind.fromString(description.fileLocation[0]);
      if (kind2 === 4 /* Search */) {
        fileLocation = 4 /* Search */;
        filePrefix = description.fileLocation[1] ?? { include: ["${workspaceFolder}"] };
      }
    }
    const pattern = description.pattern ? this.createProblemPattern(description.pattern) : void 0;
    let severity = description.severity ? severity_default.fromValue(description.severity) : void 0;
    if (severity === severity_default.Ignore) {
      this.info(localize(19825, null, description.severity));
      severity = severity_default.Error;
    }
    if (isString(description.base)) {
      const variableName = description.base;
      if (variableName.length > 1 && variableName[0] === "$") {
        const base = ProblemMatcherRegistry.get(variableName.substring(1));
        if (base) {
          result = deepClone(base);
          if (description.owner !== void 0 && owner !== void 0) {
            result.owner = owner;
          }
          if (description.source !== void 0 && source !== void 0) {
            result.source = source;
          }
          if (description.fileLocation !== void 0 && fileLocation !== void 0) {
            result.fileLocation = fileLocation;
            result.filePrefix = filePrefix;
          }
          if (description.pattern !== void 0 && pattern !== void 0 && pattern !== null) {
            result.pattern = pattern;
          }
          if (description.severity !== void 0 && severity !== void 0) {
            result.severity = severity;
          }
          if (description.applyTo !== void 0 && applyTo !== void 0) {
            result.applyTo = applyTo;
          }
        }
      }
    } else if (fileLocation && pattern) {
      result = {
        owner,
        applyTo,
        fileLocation,
        pattern
      };
      if (source) {
        result.source = source;
      }
      if (filePrefix) {
        result.filePrefix = filePrefix;
      }
      if (severity) {
        result.severity = severity;
      }
    }
    if (Config.isNamedProblemMatcher(description)) {
      result.name = description.name;
      result.label = isString(description.label) ? description.label : description.name;
    }
    return result;
  }
  createProblemPattern(value2) {
    if (isString(value2)) {
      const variableName = value2;
      if (variableName.length > 1 && variableName[0] === "$") {
        const result = ProblemPatternRegistry.get(variableName.substring(1));
        if (!result) {
          this.error(localize(19817, null, variableName));
        }
        return result;
      } else {
        if (variableName.length === 0) {
          this.error(localize(19819, null));
        } else {
          this.error(localize(19823, null, variableName));
        }
      }
    } else if (value2) {
      const problemPatternParser = new ProblemPatternParser(this.problemReporter);
      if (Array.isArray(value2)) {
        return problemPatternParser.parse(value2);
      } else {
        return problemPatternParser.parse(value2);
      }
    }
    return null;
  }
  addWatchingMatcher(external, internal) {
    const oldBegins = this.createRegularExpression(external.watchedTaskBeginsRegExp);
    const oldEnds = this.createRegularExpression(external.watchedTaskEndsRegExp);
    if (oldBegins && oldEnds) {
      internal.watching = {
        activeOnStart: false,
        beginsPattern: { regexp: oldBegins },
        endsPattern: { regexp: oldEnds }
      };
      return;
    }
    const backgroundMonitor = external.background || external.watching;
    if (isUndefinedOrNull(backgroundMonitor)) {
      return;
    }
    const begins = this.createWatchingPattern(backgroundMonitor.beginsPattern);
    const ends = this.createWatchingPattern(backgroundMonitor.endsPattern);
    if (begins && ends) {
      internal.watching = {
        activeOnStart: isBoolean(backgroundMonitor.activeOnStart) ? backgroundMonitor.activeOnStart : false,
        beginsPattern: begins,
        endsPattern: ends
      };
      return;
    }
    if (begins || ends) {
      this.error(localize(19824, null));
    }
  }
  createWatchingPattern(external) {
    if (isUndefinedOrNull(external)) {
      return null;
    }
    let regexp2;
    let file;
    if (isString(external)) {
      regexp2 = this.createRegularExpression(external);
    } else {
      regexp2 = this.createRegularExpression(external.regexp);
      if (isNumber(external.file)) {
        file = external.file;
      }
    }
    if (!regexp2) {
      return null;
    }
    return file ? { regexp: regexp2, file } : { regexp: regexp2, file: 1 };
  }
  createRegularExpression(value2) {
    let result = null;
    if (!value2) {
      return result;
    }
    try {
      result = new RegExp(value2);
    } catch (err) {
      this.error(localize(19816, null, value2));
    }
    return result;
  }
};

var problemMatchersExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "problemMatchers",
  deps: [problemPatternExtPoint],
  jsonSchema: {
    description: localize(19815, null),
    type: "array",
    items: Schemas2.NamedProblemMatcher
  }
});

var ProblemMatcherRegistryImpl = class {
  constructor() {
    this._onMatchersChanged = new Emitter();
    this.onMatcherChanged = this._onMatchersChanged.event;
    this.matchers = /* @__PURE__ */ Object.create(null);
    this.fillDefaults();
    this.readyPromise = new Promise((resolve3, reject) => {
      problemMatchersExtPoint.setHandler((extensions, delta2) => {
        try {
          delta2.removed.forEach((extension) => {
            const problemMatchers = extension.value;
            for (const matcher2 of problemMatchers) {
              if (this.matchers[matcher2.name]) {
                delete this.matchers[matcher2.name];
              }
            }
          });
          delta2.added.forEach((extension) => {
            const problemMatchers = extension.value;
            const parser2 = new ProblemMatcherParser(new ExtensionRegistryReporter(extension.collector));
            for (const matcher2 of problemMatchers) {
              const result = parser2.parse(matcher2);
              if (result && isNamedProblemMatcher(result)) {
                this.add(result);
              }
            }
          });
          if (delta2.removed.length > 0 || delta2.added.length > 0) {
            this._onMatchersChanged.fire();
          }
        } catch (error) {
        }
        const matcher = this.get("tsc-watch");
        if (matcher) {
          matcher.tscWatch = true;
        }
        resolve3(void 0);
      });
    });
  }
  onReady() {
    ProblemPatternRegistry.onReady();
    return this.readyPromise;
  }
  add(matcher) {
    this.matchers[matcher.name] = matcher;
  }
  get(name) {
    return this.matchers[name];
  }
  keys() {
    return Object.keys(this.matchers);
  }
  fillDefaults() {
    this.add({
      name: "msCompile",
      label: localize(19807, null),
      owner: "msCompile",
      source: "cpp",
      applyTo: 0 /* allDocuments */,
      fileLocation: 2 /* Absolute */,
      pattern: ProblemPatternRegistry.get("msCompile")
    });
    this.add({
      name: "lessCompile",
      label: localize(19806, null),
      deprecated: true,
      owner: "lessCompile",
      source: "less",
      applyTo: 0 /* allDocuments */,
      fileLocation: 2 /* Absolute */,
      pattern: ProblemPatternRegistry.get("lessCompile"),
      severity: severity_default.Error
    });
    this.add({
      name: "gulp-tsc",
      label: localize(19799, null),
      owner: "typescript",
      source: "ts",
      applyTo: 2 /* closedDocuments */,
      fileLocation: 1 /* Relative */,
      filePrefix: "${workspaceFolder}",
      pattern: ProblemPatternRegistry.get("gulp-tsc")
    });
    this.add({
      name: "jshint",
      label: localize(19800, null),
      owner: "jshint",
      source: "jshint",
      applyTo: 0 /* allDocuments */,
      fileLocation: 2 /* Absolute */,
      pattern: ProblemPatternRegistry.get("jshint")
    });
    this.add({
      name: "jshint-stylish",
      label: localize(19801, null),
      owner: "jshint",
      source: "jshint",
      applyTo: 0 /* allDocuments */,
      fileLocation: 2 /* Absolute */,
      pattern: ProblemPatternRegistry.get("jshint-stylish")
    });
    this.add({
      name: "eslint-compact",
      label: localize(19796, null),
      owner: "eslint",
      source: "eslint",
      applyTo: 0 /* allDocuments */,
      fileLocation: 2 /* Absolute */,
      filePrefix: "${workspaceFolder}",
      pattern: ProblemPatternRegistry.get("eslint-compact")
    });
    this.add({
      name: "eslint-stylish",
      label: localize(19797, null),
      owner: "eslint",
      source: "eslint",
      applyTo: 0 /* allDocuments */,
      fileLocation: 2 /* Absolute */,
      pattern: ProblemPatternRegistry.get("eslint-stylish")
    });
    this.add({
      name: "go",
      label: localize(19798, null),
      owner: "go",
      source: "go",
      applyTo: 0 /* allDocuments */,
      fileLocation: 1 /* Relative */,
      filePrefix: "${workspaceFolder}",
      pattern: ProblemPatternRegistry.get("go")
    });
  }
};

var ProblemMatcherRegistry = new ProblemMatcherRegistryImpl();
export { isNamedProblemMatcher, getResource, searchForFileLocation, createLineMatcher, FileLocationKind, ProblemLocationKind, ApplyToKind, endOfLine, AbstractLineMatcher, SingleLineMatcher, MultiLineMatcher, Config, ProblemPatternParser, ExtensionRegistryReporter, Schemas2, problemPatternExtPoint, ProblemPatternRegistryImpl, ProblemPatternRegistry, ProblemMatcherParser, problemMatchersExtPoint, ProblemMatcherRegistryImpl, ProblemMatcherRegistry };
