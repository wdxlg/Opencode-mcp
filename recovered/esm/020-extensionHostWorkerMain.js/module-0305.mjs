// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/configurationResolver/common/variableResolver.ts
import { VariableError, allVariableKinds } from "./module-0303.mjs";
import { isWindows } from "./module-0016.mjs";
import { ConfigurationResolverExpression } from "./module-0304.mjs";
import { normalizeDriveLetter } from "./module-0192.mjs";
import { localize } from "./module-0015.mjs";
import { basename, dirname, extname, relative, sep } from "./module-0022.mjs";
import { isObject, isString, isUndefinedOrNull } from "./module-0009.mjs";
import { cwd } from "./module-0017.mjs";


// src/vs/workbench/services/configurationResolver/common/variableResolver.ts
var AbstractVariableResolverService = class {
  constructor(_context, _labelService, _userHomePromise, _envVariablesPromise) {
    this._contributedVariables = /* @__PURE__ */ new Map();
    this.resolvableVariables = new Set(allVariableKinds);
    this._context = _context;
    this._labelService = _labelService;
    this._userHomePromise = _userHomePromise;
    if (_envVariablesPromise) {
      this._envVariablesPromise = _envVariablesPromise.then((envVariables) => {
        return this.prepareEnv(envVariables);
      });
    }
  }
  prepareEnv(envVariables) {
    if (isWindows) {
      const ev = /* @__PURE__ */ Object.create(null);
      Object.keys(envVariables).forEach((key) => {
        ev[key.toLowerCase()] = envVariables[key];
      });
      return ev;
    }
    return envVariables;
  }
  async resolveWithEnvironment(environment, folder, value) {
    const expr = ConfigurationResolverExpression.parse(value);
    for (const replacement of expr.unresolved()) {
      const resolvedValue = await this.evaluateSingleVariable(replacement, folder?.uri, environment);
      if (resolvedValue !== void 0) {
        expr.resolve(replacement, String(resolvedValue));
      }
    }
    return expr.toObject();
  }
  async resolveAsync(folder, config) {
    const expr = ConfigurationResolverExpression.parse(config);
    for (const replacement of expr.unresolved()) {
      const resolvedValue = await this.evaluateSingleVariable(replacement, folder?.uri);
      if (resolvedValue !== void 0) {
        expr.resolve(replacement, String(resolvedValue));
      }
    }
    return expr.toObject();
  }
  resolveWithInteractionReplace(folder, config) {
    throw new Error("resolveWithInteractionReplace not implemented.");
  }
  resolveWithInteraction(folder, config) {
    throw new Error("resolveWithInteraction not implemented.");
  }
  contributeVariable(variable, resolution) {
    if (this._contributedVariables.has(variable)) {
      throw new Error("Variable " + variable + " is contributed twice.");
    } else {
      this.resolvableVariables.add(variable);
      this._contributedVariables.set(variable, resolution);
    }
  }
  fsPath(displayUri) {
    return this._labelService ? this._labelService.getUriLabel(displayUri, { noPrefix: true }) : displayUri.fsPath;
  }
  async evaluateSingleVariable(replacement, folderUri, processEnvironment, commandValueMapping) {
    const environment = {
      env: processEnvironment !== void 0 ? this.prepareEnv(processEnvironment) : await this._envVariablesPromise,
      userHome: processEnvironment !== void 0 ? void 0 : await this._userHomePromise
    };
    const { name: variable, arg: argument } = replacement;
    const getFilePath2 = (variableKind) => {
      const filePath = this._context.getFilePath();
      if (filePath) {
        return normalizeDriveLetter(filePath);
      }
      throw new VariableError(variableKind, localize(22839, null, replacement.id));
    };
    const getFolderPathForFile = (variableKind) => {
      const filePath = getFilePath2(variableKind);
      if (this._context.getWorkspaceFolderPathForFile) {
        const folderPath = this._context.getWorkspaceFolderPathForFile();
        if (folderPath) {
          return normalizeDriveLetter(folderPath);
        }
      }
      throw new VariableError(variableKind, localize(22840, null, replacement.id, basename(filePath)));
    };
    const getFolderUri = (variableKind) => {
      if (argument) {
        const folder = this._context.getFolderUri(argument);
        if (folder) {
          return folder;
        }
        throw new VariableError(variableKind, localize(22837, null, variableKind, argument));
      }
      if (folderUri) {
        return folderUri;
      }
      if (this._context.getWorkspaceFolderCount() > 1) {
        throw new VariableError(variableKind, localize(22845, null, variableKind));
      }
      throw new VariableError(variableKind, localize(22844, null, variableKind));
    };
    switch (variable) {
      case "env":
        if (argument) {
          if (environment.env) {
            const env2 = environment.env[isWindows ? argument.toLowerCase() : argument];
            if (isString(env2)) {
              return env2;
            }
          }
          return "";
        }
        throw new VariableError("env" /* Env */, localize(22850, null, replacement.id));
      case "config":
        if (argument) {
          const config = this._context.getConfigurationValue(folderUri, argument);
          if (isUndefinedOrNull(config)) {
            throw new VariableError("config" /* Config */, localize(22847, null, replacement.id, argument));
          }
          if (isObject(config)) {
            throw new VariableError("config" /* Config */, localize(22846, null, replacement.id, argument));
          }
          return config;
        }
        throw new VariableError("config" /* Config */, localize(22849, null, replacement.id));
      case "command":
        return this.resolveFromMap("command" /* Command */, replacement.id, argument, commandValueMapping, "command");
      case "input":
        return this.resolveFromMap("input" /* Input */, replacement.id, argument, commandValueMapping, "input");
      case "extensionInstallFolder":
        if (argument) {
          const ext = await this._context.getExtension(argument);
          if (!ext) {
            throw new VariableError("extensionInstallFolder" /* ExtensionInstallFolder */, localize(22848, null, replacement.id, argument));
          }
          return this.fsPath(ext.extensionLocation);
        }
        throw new VariableError("extensionInstallFolder" /* ExtensionInstallFolder */, localize(22851, null, replacement.id));
      default: {
        switch (variable) {
          case "workspaceRoot":
          case "workspaceFolder": {
            const uri2 = getFolderUri("workspaceFolder" /* WorkspaceFolder */);
            return uri2 ? normalizeDriveLetter(this.fsPath(uri2)) : void 0;
          }
          case "cwd": {
            if (!folderUri && !argument) {
              return cwd();
            }
            const uri2 = getFolderUri("cwd" /* Cwd */);
            return uri2 ? normalizeDriveLetter(this.fsPath(uri2)) : void 0;
          }
          case "workspaceRootFolderName":
          case "workspaceFolderBasename": {
            const uri2 = getFolderUri("workspaceFolderBasename" /* WorkspaceFolderBasename */);
            return uri2 ? normalizeDriveLetter(basename(this.fsPath(uri2))) : void 0;
          }
          case "userHome":
            if (environment.userHome) {
              return environment.userHome;
            }
            throw new VariableError("userHome" /* UserHome */, localize(22843, null, replacement.id));
          case "lineNumber": {
            const lineNumber = this._context.getLineNumber();
            if (lineNumber) {
              return lineNumber;
            }
            throw new VariableError("lineNumber" /* LineNumber */, localize(22841, null, replacement.id));
          }
          case "columnNumber": {
            const columnNumber = this._context.getColumnNumber();
            if (columnNumber) {
              return columnNumber;
            }
            throw new Error(localize(22838, null, replacement.id));
          }
          case "selectedText": {
            const selectedText = this._context.getSelectedText();
            if (selectedText) {
              return selectedText;
            }
            throw new VariableError("selectedText" /* SelectedText */, localize(22842, null, replacement.id));
          }
          case "file":
            return getFilePath2("file" /* File */);
          case "fileWorkspaceFolder":
            return getFolderPathForFile("fileWorkspaceFolder" /* FileWorkspaceFolder */);
          case "fileWorkspaceFolderBasename":
            return basename(getFolderPathForFile("fileWorkspaceFolderBasename" /* FileWorkspaceFolderBasename */));
          case "relativeFile":
            if (folderUri || argument) {
              return relative(this.fsPath(getFolderUri("relativeFile" /* RelativeFile */)), getFilePath2("relativeFile" /* RelativeFile */));
            }
            return getFilePath2("relativeFile" /* RelativeFile */);
          case "relativeFileDirname": {
            const dirname3 = dirname(getFilePath2("relativeFileDirname" /* RelativeFileDirname */));
            if (folderUri || argument) {
              const relative2 = relative(this.fsPath(getFolderUri("relativeFileDirname" /* RelativeFileDirname */)), dirname3);
              return relative2.length === 0 ? "." : relative2;
            }
            return dirname3;
          }
          case "fileDirname":
            return dirname(getFilePath2("fileDirname" /* FileDirname */));
          case "fileExtname":
            return extname(getFilePath2("fileExtname" /* FileExtname */));
          case "fileBasename":
            return basename(getFilePath2("fileBasename" /* FileBasename */));
          case "fileBasenameNoExtension": {
            const basename3 = basename(getFilePath2("fileBasenameNoExtension" /* FileBasenameNoExtension */));
            return basename3.slice(0, basename3.length - extname(basename3).length);
          }
          case "fileDirnameBasename":
            return basename(dirname(getFilePath2("fileDirnameBasename" /* FileDirnameBasename */)));
          case "execPath": {
            const ep = this._context.getExecPath();
            if (ep) {
              return ep;
            }
            return replacement.id;
          }
          case "execInstallFolder": {
            const ar = this._context.getAppRoot();
            if (ar) {
              return ar;
            }
            return replacement.id;
          }
          case "pathSeparator":
          case "/":
            return sep;
          default: {
            try {
              return this.resolveFromMap("unknown" /* Unknown */, replacement.id, argument, commandValueMapping, void 0);
            } catch {
              return replacement.id;
            }
          }
        }
      }
    }
  }
  resolveFromMap(variableKind, match2, argument, commandValueMapping, prefix) {
    if (argument && commandValueMapping) {
      const v = prefix === void 0 ? commandValueMapping[argument] : commandValueMapping[prefix + ":" + argument];
      if (typeof v === "string") {
        return v;
      }
      throw new VariableError(variableKind, localize(22852, null, match2));
    }
    return match2;
  }
};
export { AbstractVariableResolverService };
