// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/configurationResolver/common/configurationResolver.ts
import { createDecorator2 } from "./module-0048.mjs";
import { ErrorNoTelemetry } from "./module-0003.mjs";


// src/vs/workbench/services/configurationResolver/common/configurationResolver.ts
var IConfigurationResolverService = createDecorator2("configurationResolverService");

var VariableKind = /* @__PURE__ */ ((VariableKind2) => {
  VariableKind2["Unknown"] = "unknown";
  VariableKind2["Env"] = "env";
  VariableKind2["Config"] = "config";
  VariableKind2["Command"] = "command";
  VariableKind2["Input"] = "input";
  VariableKind2["ExtensionInstallFolder"] = "extensionInstallFolder";
  VariableKind2["TaskVar"] = "taskVar";
  VariableKind2["WorkspaceFolder"] = "workspaceFolder";
  VariableKind2["Cwd"] = "cwd";
  VariableKind2["WorkspaceFolderBasename"] = "workspaceFolderBasename";
  VariableKind2["UserHome"] = "userHome";
  VariableKind2["LineNumber"] = "lineNumber";
  VariableKind2["ColumnNumber"] = "columnNumber";
  VariableKind2["SelectedText"] = "selectedText";
  VariableKind2["File"] = "file";
  VariableKind2["FileWorkspaceFolder"] = "fileWorkspaceFolder";
  VariableKind2["FileWorkspaceFolderBasename"] = "fileWorkspaceFolderBasename";
  VariableKind2["RelativeFile"] = "relativeFile";
  VariableKind2["RelativeFileDirname"] = "relativeFileDirname";
  VariableKind2["FileDirname"] = "fileDirname";
  VariableKind2["FileExtname"] = "fileExtname";
  VariableKind2["FileBasename"] = "fileBasename";
  VariableKind2["FileBasenameNoExtension"] = "fileBasenameNoExtension";
  VariableKind2["FileDirnameBasename"] = "fileDirnameBasename";
  VariableKind2["ExecPath"] = "execPath";
  VariableKind2["ExecInstallFolder"] = "execInstallFolder";
  VariableKind2["PathSeparator"] = "pathSeparator";
  VariableKind2["PathSeparatorAlias"] = "/";
  return VariableKind2;
})(VariableKind || {});

var allVariableKinds = Object.values(VariableKind).filter((value) => typeof value === "string");

var VariableError = class extends ErrorNoTelemetry {
  constructor(variable, message) {
    super(message);
    this.variable = variable;
  }
};
export { IConfigurationResolverService, VariableKind, allVariableKinds, VariableError };
