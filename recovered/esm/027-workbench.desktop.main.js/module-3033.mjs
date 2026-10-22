// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingContentProvider.ts
import { TEST_DATA_SCHEME, parseTestUri } from "./module-3032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { removeAnsiEscapeCodes } from "./module-0030.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITestResultService } from "./module-1434.mjs";


// src/vs/workbench/contrib/testing/common/testingContentProvider.ts
var TestingContentProvider = class {
  constructor(textModelResolverService, languageService, modelService, resultService) {
    this.languageService = languageService;
    this.modelService = modelService;
    this.resultService = resultService;
    textModelResolverService.registerTextModelContentProvider(TEST_DATA_SCHEME, this);
  }
  static {
    this.ID = "workbench.contrib.testing.contentProvider";
  }
  /**
   * @inheritdoc
   */
  async provideTextContent(resource) {
    const existing = this.modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    const parsed = parseTestUri(resource);
    if (!parsed) {
      return null;
    }
    const result = this.resultService.getResult(parsed.resultId);
    if (!result) {
      return null;
    }
    if (parsed.type === 0 /* TaskOutput */) {
      const task = result.tasks[parsed.taskIndex];
      const model = this.modelService.createModel("", null, resource, false);
      const append4 = (text3) => model.applyEdits([{
        range: { startColumn: 1, endColumn: 1, startLineNumber: Infinity, endLineNumber: Infinity },
        text: text3
      }]);
      const init = VSBuffer.concat(task.output.buffers, task.output.length).toString();
      append4(removeAnsiEscapeCodes(init));
      let hadContent = init.length > 0;
      const dispose2 = new DisposableStore();
      dispose2.add(task.output.onDidWriteData((d) => {
        hadContent ||= d.byteLength > 0;
        append4(removeAnsiEscapeCodes(d.toString()));
      }));
      task.output.endPromise.then(() => {
        if (dispose2.isDisposed) {
          return;
        }
        if (!hadContent) {
          append4(localize(21327, null));
          dispose2.dispose();
        }
      });
      dispose2.add(model.onWillDispose(() => dispose2.dispose()));
      return model;
    }
    const test = result?.getStateById(parsed.testExtId);
    if (!test) {
      return null;
    }
    let text2;
    let language2 = null;
    switch (parsed.type) {
      case 3 /* ResultActualOutput */: {
        const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
        if (message?.type === 0 /* Error */) {
          text2 = message.actual;
        }
        break;
      }
      case 1 /* TestOutput */: {
        text2 = "";
        const output = result.tasks[parsed.taskIndex].output;
        for (const message of test.tasks[parsed.taskIndex].messages) {
          if (message.type === 1 /* Output */) {
            text2 += removeAnsiEscapeCodes(output.getRange(message.offset, message.length).toString());
          }
        }
        break;
      }
      case 4 /* ResultExpectedOutput */: {
        const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
        if (message?.type === 0 /* Error */) {
          text2 = message.expected;
        }
        break;
      }
      case 2 /* ResultMessage */: {
        const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
        if (!message) {
          break;
        }
        if (message.type === 1 /* Output */) {
          const content2 = result.tasks[parsed.taskIndex].output.getRange(message.offset, message.length);
          text2 = removeAnsiEscapeCodes(content2.toString());
        } else if (typeof message.message === "string") {
          text2 = removeAnsiEscapeCodes(message.message);
        } else {
          text2 = message.message.value;
          language2 = this.languageService.createById("markdown");
        }
      }
    }
    if (text2 === void 0) {
      return null;
    }
    return this.modelService.createModel(text2, language2, resource, false);
  }
};

TestingContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ITestResultService)
], TestingContentProvider);
export { TestingContentProvider };
