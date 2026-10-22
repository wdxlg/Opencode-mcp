// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/parsers.ts



// src/vs/base/common/parsers.ts
var ValidationStatus = class {
  constructor() {
    this._state = 0 /* OK */;
  }
  get state() {
    return this._state;
  }
  set state(value2) {
    if (value2 > this._state) {
      this._state = value2;
    }
  }
  isOK() {
    return this._state === 0 /* OK */;
  }
  isFatal() {
    return this._state === 4 /* Fatal */;
  }
};

var Parser3 = class {
  constructor(problemReporter) {
    this._problemReporter = problemReporter;
  }
  reset() {
    this._problemReporter.status.state = 0 /* OK */;
  }
  get problemReporter() {
    return this._problemReporter;
  }
  info(message) {
    this._problemReporter.info(message);
  }
  warn(message) {
    this._problemReporter.warn(message);
  }
  error(message) {
    this._problemReporter.error(message);
  }
  fatal(message) {
    this._problemReporter.fatal(message);
  }
};
export { ValidationStatus, Parser3 };
