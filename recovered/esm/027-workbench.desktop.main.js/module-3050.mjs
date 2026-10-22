// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testResultsView/testResultsSubject.ts
import { ITestMessage, InternalTestItem } from "./module-1208.mjs";
import { buildTestUri } from "./module-3032.mjs";
import { Range2 } from "./module-0106.mjs";
import { TestId } from "./module-1207.mjs";


// src/vs/workbench/contrib/testing/browser/testResultsView/testResultsSubject.ts
var getMessageArgs = (test, message) => ({
  $mid: 18 /* TestMessageMenuArgs */,
  test: InternalTestItem.serialize(test),
  message: ITestMessage.serialize(message)
});

var inspectSubjectHasStack = (subject) => subject instanceof MessageSubject && !!subject.stack?.length;

var MessageSubject = class {
  constructor(result, test, taskIndex, messageIndex) {
    this.result = result;
    this.taskIndex = taskIndex;
    this.messageIndex = messageIndex;
    this.test = test.item;
    const messages = test.tasks[taskIndex].messages;
    this.messageIndex = messageIndex;
    const parts = { messageIndex, resultId: result.id, taskIndex, testExtId: test.item.extId };
    this.expectedUri = buildTestUri({ ...parts, type: 4 /* ResultExpectedOutput */ });
    this.actualUri = buildTestUri({ ...parts, type: 3 /* ResultActualOutput */ });
    this.messageUri = buildTestUri({ ...parts, type: 2 /* ResultMessage */ });
    const message = this.message = messages[this.messageIndex];
    this.context = getMessageArgs(test, message);
    this.revealLocation = message.location ?? (test.item.uri && test.item.range ? { uri: test.item.uri, range: Range2.lift(test.item.range) } : void 0);
  }
  get controllerId() {
    return TestId.root(this.test.extId);
  }
  get isDiffable() {
    return this.message.type === 0 /* Error */ && ITestMessage.isDiffable(this.message);
  }
  get contextValue() {
    return this.message.type === 0 /* Error */ ? this.message.contextValue : void 0;
  }
  get stack() {
    return this.message.type === 0 /* Error */ && this.message.stackTrace?.length ? this.message.stackTrace : void 0;
  }
};

var TaskSubject = class {
  constructor(result, taskIndex) {
    this.result = result;
    this.taskIndex = taskIndex;
    this.outputUri = buildTestUri({ resultId: result.id, taskIndex, type: 0 /* TaskOutput */ });
  }
  get controllerId() {
    return this.result.tasks[this.taskIndex].ctrlId;
  }
};

var TestOutputSubject = class {
  constructor(result, taskIndex, test) {
    this.result = result;
    this.taskIndex = taskIndex;
    this.test = test;
    this.outputUri = buildTestUri({ resultId: this.result.id, taskIndex: this.taskIndex, testExtId: this.test.item.extId, type: 1 /* TestOutput */ });
    this.task = result.tasks[this.taskIndex];
  }
  get controllerId() {
    return TestId.root(this.test.item.extId);
  }
};

var equalsSubject = (a, b) => a instanceof MessageSubject && b instanceof MessageSubject && a.message === b.message || a instanceof TaskSubject && b instanceof TaskSubject && a.result === b.result && a.taskIndex === b.taskIndex || a instanceof TestOutputSubject && b instanceof TestOutputSubject && a.test === b.test && a.taskIndex === b.taskIndex;

var mapFindTestMessage = (test, fn) => {
  for (let taskIndex = 0; taskIndex < test.tasks.length; taskIndex++) {
    const task = test.tasks[taskIndex];
    for (let messageIndex = 0; messageIndex < task.messages.length; messageIndex++) {
      const r2 = fn(task, task.messages[messageIndex], messageIndex, taskIndex);
      if (r2 !== void 0) {
        return r2;
      }
    }
  }
  return void 0;
};

var getSubjectTestItem = (subject) => {
  if (subject instanceof MessageSubject) {
    return subject.test;
  }
  if (subject instanceof TaskSubject) {
    return void 0;
  }
  return subject.test.item;
};
export { getMessageArgs, inspectSubjectHasStack, MessageSubject, TaskSubject, TestOutputSubject, equalsSubject, mapFindTestMessage, getSubjectTestItem };
