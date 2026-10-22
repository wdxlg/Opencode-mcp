// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingUri.ts
import { URI } from "./module-0032.mjs";
import { assertNever } from "./module-0009.mjs";


// src/vs/workbench/contrib/testing/common/testingUri.ts
var TEST_DATA_SCHEME = "vscode-test-data";

var parseTestUri = (uri5) => {
  const type = uri5.authority;
  const [resultId, ...request2] = uri5.path.slice(1).split("/");
  if (request2[0] === "message" /* Messages */) {
    const taskIndex = Number(request2[1]);
    const testExtId = uri5.query;
    const index2 = Number(request2[2]);
    const part = request2[3];
    if (type === "results" /* Results */) {
      switch (part) {
        case "TestFailureMessage" /* Text */:
          return { resultId, taskIndex, testExtId, messageIndex: index2, type: 2 /* ResultMessage */ };
        case "ActualOutput" /* ActualOutput */:
          return { resultId, taskIndex, testExtId, messageIndex: index2, type: 3 /* ResultActualOutput */ };
        case "ExpectedOutput" /* ExpectedOutput */:
          return { resultId, taskIndex, testExtId, messageIndex: index2, type: 4 /* ResultExpectedOutput */ };
        case "message" /* Messages */:
      }
    }
  }
  if (request2[0] === "output" /* AllOutput */) {
    const testExtId = uri5.query;
    const taskIndex = Number(request2[1]);
    return testExtId ? { resultId, taskIndex, testExtId, type: 1 /* TestOutput */ } : { resultId, taskIndex, type: 0 /* TaskOutput */ };
  }
  return void 0;
};

var buildTestUri = (parsed) => {
  const uriParts = {
    scheme: TEST_DATA_SCHEME,
    authority: "results" /* Results */
  };
  if (parsed.type === 0 /* TaskOutput */) {
    return URI.from({
      ...uriParts,
      path: ["", parsed.resultId, "output" /* AllOutput */, parsed.taskIndex].join("/")
    });
  }
  const msgRef = (resultId, ...remaining) => URI.from({
    ...uriParts,
    query: parsed.testExtId,
    path: ["", resultId, "message" /* Messages */, ...remaining].join("/")
  });
  switch (parsed.type) {
    case 3 /* ResultActualOutput */:
      return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "ActualOutput" /* ActualOutput */);
    case 4 /* ResultExpectedOutput */:
      return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "ExpectedOutput" /* ExpectedOutput */);
    case 2 /* ResultMessage */:
      return msgRef(parsed.resultId, parsed.taskIndex, parsed.messageIndex, "TestFailureMessage" /* Text */);
    case 1 /* TestOutput */:
      return URI.from({
        ...uriParts,
        query: parsed.testExtId,
        path: ["", parsed.resultId, "output" /* AllOutput */, parsed.taskIndex].join("/")
      });
    default:
      assertNever(parsed, "Invalid test uri");
  }
};
export { TEST_DATA_SCHEME, parseTestUri, buildTestUri };
