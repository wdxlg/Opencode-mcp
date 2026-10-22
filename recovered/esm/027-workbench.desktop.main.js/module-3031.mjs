// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingChatAgentTool.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { collectTestStateCounts, getTestProgressText } from "./module-3030.mjs";
import { RunOnceScheduler, disposableTimeout } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { ITestService, testsInFile, waitForTestToBeIdle } from "./module-1435.mjs";
import { basename, isAbsolute } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { isDefined } from "./module-0010.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ITestResultService } from "./module-1434.mjs";
import { ITestProfileService } from "./module-1429.mjs";
import { getTotalCoveragePercent } from "./module-1425.mjs";
import { Position } from "./module-0079.mjs";
import { isFailedState } from "./module-1430.mjs";
import { TestId } from "./module-1207.mjs";


// src/vs/workbench/contrib/testing/common/testingChatAgentTool.ts
var TestingChatAgentToolContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.testing.chatAgentTool";
  }
  constructor(instantiationService, toolsService) {
    super();
    const runTestsTool = instantiationService.createInstance(RunTestTool);
    this._register(toolsService.registerTool(RunTestTool.DEFINITION, runTestsTool));
    this._register(toolsService.executeToolSet.addTool(RunTestTool.DEFINITION));
    const testFailureTool = instantiationService.createInstance(TestFailureTool);
    this._register(toolsService.registerTool(TestFailureTool.DEFINITION, testFailureTool));
    this._register(toolsService.executeToolSet.addTool(TestFailureTool.DEFINITION));
  }
};

TestingChatAgentToolContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILanguageModelToolsService)
], TestingChatAgentToolContribution);

var RunTestTool = class {
  constructor(_testService, _uriIdentityService, _workspaceContextService, _testResultService, _testProfileService) {
    this._testService = _testService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    this._testResultService = _testResultService;
    this._testProfileService = _testProfileService;
  }
  static {
    this.ID = "runTests";
  }
  static {
    this.DEFINITION = {
      id: this.ID,
      toolReferenceName: "runTests",
      legacyToolReferenceFullNames: ["runTests"],
      displayName: "Run tests",
      modelDescription: 'Runs unit tests in files. Use this tool if the user asks to run tests or when you want to validate changes using unit tests, and prefer using this tool instead of the terminal tool. When possible, always try to provide `files` paths containing the relevant unit tests in order to avoid unnecessarily long test runs. This tool outputs detailed information about the results of the test run. Set mode="coverage" to also collect coverage and optionally provide coverageFiles for focused reporting.',
      icon: Codicon.beaker,
      inputSchema: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description: "Absolute paths to the test files to run. If not provided, all test files will be run."
          },
          testNames: {
            type: "array",
            items: { type: "string" },
            description: "An array of test names to run. Depending on the context, test names defined in code may be strings or the names of functions or classes containing the test cases. If not provided, all tests in the files will be run."
          },
          mode: {
            type: "string",
            enum: ["run", "coverage"],
            description: 'Execution mode: "run" (default) runs tests normally, "coverage" collects coverage.'
          },
          coverageFiles: {
            type: "array",
            items: { type: "string" },
            description: 'When mode="coverage": absolute file paths to include detailed coverage info for. If not provided, a file-level summary of all files with incomplete coverage is shown.'
          }
        }
      },
      userDescription: localize(21322, null),
      source: ToolDataSource.Internal,
      tags: [
        "vscode_editing_with_tests",
        "enable_other_tool_copilot_readFile",
        "enable_other_tool_copilot_listDirectory",
        "enable_other_tool_copilot_findFiles",
        "enable_other_tool_copilot_runTests",
        "enable_other_tool_copilot_runTestsWithCoverage",
        "enable_other_tool_testFailure"
      ]
    };
  }
  async invoke(invocation, countTokens, progress, token) {
    const params = invocation.parameters;
    const mode = params.mode === "coverage" ? "coverage" : "run";
    let group2 = mode === "coverage" ? 8 /* Coverage */ : 2 /* Run */;
    const coverageFiles = mode === "coverage" ? params.coverageFiles && params.coverageFiles.length ? params.coverageFiles : void 0 : void 0;
    const testFiles = await this._getFileTestsToRun(params, progress);
    const testCases = await this._getTestCasesToRun(params, testFiles, progress);
    if (!testCases.length) {
      return {
        content: [{ kind: "text", value: "No tests found in the files. Ensure the correct absolute paths are passed to the tool." }],
        toolResultError: localize(21321, null)
      };
    }
    progress.report({ message: localize(21319, null) });
    if (group2 === 8 /* Coverage */) {
      if (!testCases.some((tc) => this._testProfileService.capabilitiesForTest(tc.item) & 8 /* Coverage */)) {
        group2 = 2 /* Run */;
      }
    }
    const result = await this._captureTestResult(testCases, group2, token);
    if (!result) {
      return {
        content: [{ kind: "text", value: "No test run was started. Instruct the user to ensure their test runner is correctly configured" }],
        toolResultError: localize(21320, null)
      };
    }
    await this._monitorRunProgress(result, progress, token);
    if (token.isCancellationRequested) {
      this._testService.cancelTestRun(result.id);
      return {
        content: [{ kind: "text", value: localize(21316, null) }],
        toolResultMessage: localize(21316, null)
      };
    }
    const summary = await buildTestRunSummary(result, mode, coverageFiles);
    const content2 = [{ kind: "text", value: summary }];
    return {
      content: content2,
      toolResultMessage: getTestProgressText(collectTestStateCounts(false, [result]))
    };
  }
  /** Updates the UI progress as the test runs, resolving when the run is finished. */
  async _monitorRunProgress(result, progress, token) {
    const store = new DisposableStore();
    const update = () => {
      const counts = collectTestStateCounts(!result.completedAt, [result]);
      const text2 = getTestProgressText(counts);
      progress.report({ message: text2, progress: counts.runSoFar / counts.totalWillBeRun });
    };
    const throttler = store.add(new RunOnceScheduler(update, 500));
    return new Promise((resolve3) => {
      store.add(result.onChange(() => {
        if (!throttler.isScheduled) {
          throttler.schedule();
        }
      }));
      store.add(token.onCancellationRequested(() => {
        this._testService.cancelTestRun(result.id);
        resolve3();
      }));
      store.add(result.onComplete(() => {
        update();
        resolve3();
      }));
    }).finally(() => store.dispose());
  }
  /**
   * Captures the test result. This is a little tricky because some extensions
   * trigger an 'out of bound' test run, so we actually wait for the first
   * test run to come in that contains one or more tasks and treat that as the
   * one we're looking for.
   */
  async _captureTestResult(testCases, group2, token) {
    const store = new DisposableStore();
    const onDidTimeout = store.add(new Emitter());
    return new Promise((resolve3) => {
      store.add(onDidTimeout.event(() => {
        resolve3(void 0);
      }));
      store.add(this._testResultService.onResultsChanged((ev) => {
        if ("started" in ev) {
          store.add(ev.started.onNewTask(() => {
            store.dispose();
            resolve3(ev.started);
          }));
        }
      }));
      this._testService.runTests({
        group: group2,
        tests: testCases,
        preserveFocus: true
      }, token).then(() => {
        if (!store.isDisposed) {
          store.add(disposableTimeout(() => onDidTimeout.fire(), 5e3));
        }
      });
    }).finally(() => store.dispose());
  }
  /** Filters the test files to individual test cases based on the provided parameters. */
  async _getTestCasesToRun(params, tests, progress) {
    if (!params.testNames?.length) {
      return tests;
    }
    progress.report({ message: localize(21318, null) });
    const testNames = params.testNames.map((t2) => t2.toLowerCase().trim());
    const filtered = [];
    const doFilter = async (test) => {
      const name = test.item.label.toLowerCase().trim();
      if (testNames.some((tn) => name.includes(tn))) {
        filtered.push(test);
        return;
      }
      if (test.expand === 1 /* Expandable */) {
        await this._testService.collection.expand(test.item.extId, 1);
      }
      await waitForTestToBeIdle(this._testService, test);
      await Promise.all([...test.children].map(async (id2) => {
        const item = this._testService.collection.getNodeById(id2);
        if (item) {
          await doFilter(item);
        }
      }));
    };
    await Promise.all(tests.map(doFilter));
    return filtered;
  }
  /** Gets the file tests to run based on the provided parameters. */
  async _getFileTestsToRun(params, progress) {
    if (!params.files?.length) {
      return [...this._testService.collection.rootItems];
    }
    progress.report({ message: localize(21317, null) });
    const firstWorkspaceFolder = this._workspaceContextService.getWorkspace().folders.at(0)?.uri;
    const uris = params.files.map((f) => {
      if (isAbsolute(f)) {
        return URI.file(f);
      } else if (firstWorkspaceFolder) {
        return URI.joinPath(firstWorkspaceFolder, f);
      } else {
        return void 0;
      }
    }).filter(isDefined);
    const tests = [];
    for (const uri5 of uris) {
      for await (const files of testsInFile(this._testService, this._uriIdentityService, uri5, void 0, false)) {
        for (const file of files) {
          tests.push(file);
        }
      }
    }
    return tests;
  }
  prepareToolInvocation(context2, token) {
    const params = context2.parameters;
    const title = localize(21315, null);
    const inFiles = params.files?.map((f) => "`" + basename(f) + "`");
    return Promise.resolve({
      invocationMessage: localize(21313, null),
      confirmationMessages: {
        title,
        message: inFiles?.length ? new MarkdownString().appendMarkdown(localize(21314, null, inFiles.join(", "))) : localize(21312, null),
        allowAutoConfirm: true
      }
    });
  }
};

RunTestTool = __decorateClass([
  __decorateParam(0, ITestService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, ITestResultService),
  __decorateParam(4, ITestProfileService)
], RunTestTool);

var TestFailureTool = class {
  constructor(_testResultService) {
    this._testResultService = _testResultService;
  }
  static {
    this.ID = "testFailure";
  }
  static {
    this.DEFINITION = {
      id: this.ID,
      toolReferenceName: "testFailure",
      legacyToolReferenceFullNames: ["copilot_testFailure"],
      displayName: localize(21323, null),
      modelDescription: "Includes test failure information in the prompt. Use this tool to get the details of test failures from the most recent test run. If there are no failures yet, suggest running tests first.",
      icon: Codicon.beaker,
      inputSchema: {
        type: "object",
        properties: {}
      },
      userDescription: localize(21326, null),
      source: ToolDataSource.Internal,
      tags: [
        "vscode_editing_with_tests",
        "enable_other_tool_copilot_readFile",
        "enable_other_tool_copilot_listDirectory",
        "enable_other_tool_copilot_findFiles",
        "enable_other_tool_copilot_runTests"
      ]
    };
  }
  async invoke(invocation, countTokens, progress, token) {
    const result = this._testResultService.results.find((r2) => r2.tasks.length > 0);
    if (!result) {
      return {
        content: [{ kind: "text", value: "No test failures were found yet, call the runTests tool to run tests and find failures." }]
      };
    }
    const details = await getFailureDetails(result);
    return {
      content: [{ kind: "text", value: details }]
    };
  }
  prepareToolInvocation(context2, token) {
    return Promise.resolve({
      invocationMessage: localize(21324, null),
      pastTenseMessage: localize(21325, null)
    });
  }
};

TestFailureTool = __decorateClass([
  __decorateParam(0, ITestResultService)
], TestFailureTool);

async function buildTestRunSummary(result, mode, coverageFiles) {
  const failures = result.counts[6 /* Errored */] + result.counts[4 /* Failed */];
  let str = `<summary passed=${result.counts[3 /* Passed */]} failed=${failures} />
`;
  if (failures !== 0) {
    str += await getFailureDetails(result);
  }
  if (mode === "coverage") {
    str += await getCoverageSummary(result, coverageFiles);
  }
  return str;
}

async function getCoverageSummary(result, coverageFiles) {
  let str = "";
  for (const task of result.tasks) {
    const coverage = task.coverage.get();
    if (!coverage) {
      continue;
    }
    if (!coverageFiles || !coverageFiles.length) {
      str += getOverallCoverageSummary(coverage);
      continue;
    }
    const normalized = coverageFiles.map((file) => URI.file(file).fsPath);
    const coveredFilesMap = /* @__PURE__ */ new Map();
    for (const file of coverage.getAllFiles().values()) {
      coveredFilesMap.set(file.uri.fsPath, file);
    }
    for (const path of normalized) {
      const file = coveredFilesMap.get(path);
      if (!file) {
        continue;
      }
      str += await getFileCoverageDetails(file, path);
    }
  }
  return str;
}

function getOverallCoverageSummary(coverage) {
  const files = [...coverage.getAllFiles().values()].map((f) => ({ path: f.uri.fsPath, pct: getTotalCoveragePercent(f.statement, f.branch, f.declaration) * 100 })).filter((f) => f.pct < 100).sort((a, b) => a.pct - b.pct);
  if (!files.length) {
    return "<coverageSummary>All files have 100% coverage.</coverageSummary>\n";
  }
  let str = "<coverageSummary>\n";
  for (const f of files) {
    str += `<file path="${f.path}" percent=${f.pct.toFixed(1)} />
`;
  }
  str += "</coverageSummary>\n";
  return str;
}

async function getFileCoverageDetails(file, path) {
  const pct2 = getTotalCoveragePercent(file.statement, file.branch, file.declaration) * 100;
  let str = `<coverage path="${path}" percent=${pct2.toFixed(1)} statements=${file.statement.covered}/${file.statement.total}`;
  if (file.branch) {
    str += ` branches=${file.branch.covered}/${file.branch.total}`;
  }
  if (file.declaration) {
    str += ` declarations=${file.declaration.covered}/${file.declaration.total}`;
  }
  str += ">\n";
  try {
    const details = await file.details();
    const uncoveredDeclarations = [];
    const uncoveredBranches = [];
    const uncoveredLines = [];
    for (const detail2 of details) {
      if (detail2.type === 0 /* Declaration */) {
        if (!detail2.count) {
          const line = Position.isIPosition(detail2.location) ? detail2.location.lineNumber : detail2.location.startLineNumber;
          uncoveredDeclarations.push({ name: detail2.name, line });
        }
      } else {
        if (!detail2.count) {
          const startLine = Position.isIPosition(detail2.location) ? detail2.location.lineNumber : detail2.location.startLineNumber;
          const endLine = Position.isIPosition(detail2.location) ? detail2.location.lineNumber : detail2.location.endLineNumber;
          uncoveredLines.push([startLine, endLine]);
        }
        if (detail2.branches) {
          for (const branch of detail2.branches) {
            if (!branch.count) {
              let line;
              if (branch.location) {
                line = Position.isIPosition(branch.location) ? branch.location.lineNumber : branch.location.startLineNumber;
              } else {
                line = Position.isIPosition(detail2.location) ? detail2.location.lineNumber : detail2.location.startLineNumber;
              }
              uncoveredBranches.push({ line, label: branch.label });
            }
          }
        }
      }
    }
    if (uncoveredDeclarations.length) {
      str += "uncovered functions: " + uncoveredDeclarations.map((d) => `${d.name}(L${d.line})`).join(", ") + "\n";
    }
    if (uncoveredBranches.length) {
      str += "uncovered branches: " + uncoveredBranches.map((b) => b.label ? `L${b.line}(${b.label})` : `L${b.line}`).join(", ") + "\n";
    }
    if (uncoveredLines.length) {
      str += "uncovered lines: " + mergeLineRanges(uncoveredLines) + "\n";
    }
  } catch {
  }
  str += "</coverage>\n";
  return str;
}

function mergeLineRanges(ranges) {
  if (!ranges.length) {
    return "";
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (let i2 = 1; i2 < ranges.length; i2++) {
    const last = merged[merged.length - 1];
    const [start, end] = ranges[i2];
    if (start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged.map(([s, e]) => s === e ? `${s}` : `${s}-${e}`).join(", ");
}

async function getFailureDetails(result) {
  let str = "";
  let hadMessages = false;
  for (const failure2 of result.tests) {
    if (!isFailedState(failure2.ownComputedState)) {
      continue;
    }
    const [, ...testPath] = TestId.split(failure2.item.extId);
    const testName = testPath.pop();
    str += `<testFailure name=${JSON.stringify(testName)} path=${JSON.stringify(testPath.join(" > "))}>
`;
    for (const task of failure2.tasks) {
      for (const message of task.messages.filter((m) => m.type === 0 /* Error */)) {
        hadMessages = true;
        if (message.expected !== void 0 && message.actual !== void 0) {
          str += `<expectedOutput>
${message.expected}
</expectedOutput>
`;
          str += `<actualOutput>
${message.actual}
</actualOutput>
`;
        } else {
          const messageText2 = typeof message.message === "string" ? message.message : message.message.value;
          str += `<message>
${messageText2}
</message>
`;
        }
        if (message.stackTrace && message.stackTrace.length > 0) {
          for (const frame of message.stackTrace.slice(0, 10)) {
            if (frame.uri && frame.position) {
              str += `<stackFrame path="${frame.uri.fsPath}" line="${frame.position.lineNumber}" col="${frame.position.column}" />
`;
            } else if (frame.uri) {
              str += `<stackFrame path="${frame.uri.fsPath}">${frame.label}</stackFrame>
`;
            } else {
              str += `<stackFrame>${frame.label}</stackFrame>
`;
            }
          }
        }
        if (message.location) {
          str += `<location path="${message.location.uri.fsPath}" line="${message.location.range.startLineNumber}" col="${message.location.range.startColumn}" />
`;
        }
      }
    }
    str += `</testFailure>
`;
  }
  if (!hadMessages) {
    const output = result.tasks.map((t2) => t2.output.getRange(0, t2.output.length).toString().trim()).join("\n");
    if (output) {
      str += `<output>
${output}
</output>
`;
    }
  }
  return str;
}
export { buildTestRunSummary, getCoverageSummary, getOverallCoverageSummary, getFileCoverageDetails, mergeLineRanges, getFailureDetails, TestingChatAgentToolContribution, RunTestTool, TestFailureTool };
