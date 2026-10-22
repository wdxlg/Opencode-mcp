// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/history/common/history.ts
import { IInstantiationService } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { isNumber } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { isWindows } from "./module-0014.mjs";
import { env } from "./module-0015.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { join } from "./module-0026.mjs";


// src/vs/workbench/contrib/terminalContrib/history/common/history.ts
var directoryHistory = void 0;

function getDirectoryHistory(accessor) {
  if (!directoryHistory) {
    directoryHistory = accessor.get(IInstantiationService).createInstance(TerminalPersistedHistory, "dirs");
  }
  return directoryHistory;
}

var commandHistory = void 0;

function getCommandHistory(accessor) {
  if (!commandHistory) {
    commandHistory = accessor.get(IInstantiationService).createInstance(TerminalPersistedHistory, "commands");
  }
  return commandHistory;
}

var TerminalPersistedHistory = class extends Disposable {
  constructor(_storageDataKey, _configurationService, _storageService) {
    super();
    this._storageDataKey = _storageDataKey;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._timestamp = 0;
    this._isReady = false;
    this._isStale = true;
    this._entries = new LRUCache(this._getHistoryLimit());
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.shellIntegration.history" /* ShellIntegrationCommandHistory */)) {
        this._entries.limit = this._getHistoryLimit();
      }
    }));
    this._register(this._storageService.onDidChangeValue(-1 /* APPLICATION */, this._getTimestampStorageKey(), this._store)(() => {
      if (!this._isStale) {
        this._isStale = this._storageService.getNumber(this._getTimestampStorageKey(), -1 /* APPLICATION */, 0) !== this._timestamp;
      }
    }));
  }
  get entries() {
    this._ensureUpToDate();
    return this._entries.entries();
  }
  add(key3, value2) {
    this._ensureUpToDate();
    this._entries.set(key3, value2);
    this._saveState();
  }
  remove(key3) {
    this._ensureUpToDate();
    this._entries.delete(key3);
    this._saveState();
  }
  clear() {
    this._ensureUpToDate();
    this._entries.clear();
    this._saveState();
  }
  _ensureUpToDate() {
    if (!this._isReady) {
      this._loadState();
      this._isReady = true;
    }
    if (this._isStale) {
      this._entries.clear();
      this._loadState();
      this._isStale = false;
    }
  }
  _loadState() {
    this._timestamp = this._storageService.getNumber(this._getTimestampStorageKey(), -1 /* APPLICATION */, 0);
    const serialized = this._loadPersistedState();
    if (serialized) {
      for (const entry of serialized.entries) {
        this._entries.set(entry.key, entry.value);
      }
    }
  }
  _loadPersistedState() {
    const raw = this._storageService.get(this._getEntriesStorageKey(), -1 /* APPLICATION */);
    if (raw === void 0 || raw.length === 0) {
      return void 0;
    }
    let serialized = void 0;
    try {
      serialized = JSON.parse(raw);
    } catch {
      return void 0;
    }
    return serialized;
  }
  _saveState() {
    const serialized = { entries: [] };
    this._entries.forEach((value2, key3) => serialized.entries.push({ key: key3, value: value2 }));
    this._storageService.store(this._getEntriesStorageKey(), JSON.stringify(serialized), -1 /* APPLICATION */, 1 /* MACHINE */);
    this._timestamp = Date.now();
    this._storageService.store(this._getTimestampStorageKey(), this._timestamp, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  _getHistoryLimit() {
    const historyLimit = this._configurationService.getValue("terminal.integrated.shellIntegration.history" /* ShellIntegrationCommandHistory */);
    return isNumber(historyLimit) ? historyLimit : 100 /* DefaultHistoryLimit */;
  }
  _getTimestampStorageKey() {
    return `${"terminal.history.timestamp" /* Timestamp */}.${this._storageDataKey}`;
  }
  _getEntriesStorageKey() {
    return `${"terminal.history.entries" /* Entries */}.${this._storageDataKey}`;
  }
};

TerminalPersistedHistory = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], TerminalPersistedHistory);

var shellFileHistory = /* @__PURE__ */ new Map();

async function getShellFileHistory(accessor, shellType) {
  const cached = shellFileHistory.get(shellType);
  if (cached === null) {
    return void 0;
  }
  if (cached !== void 0) {
    return cached;
  }
  let result;
  switch (shellType) {
    case "bash" /* Bash */:
      result = await fetchBashHistory(accessor);
      break;
    case "pwsh" /* PowerShell */:
      result = await fetchPwshHistory(accessor);
      break;
    case "zsh" /* Zsh */:
      result = await fetchZshHistory(accessor);
      break;
    case "fish" /* Fish */:
      result = await fetchFishHistory(accessor);
      break;
    case "python" /* Python */:
      result = await fetchPythonHistory(accessor);
      break;
    default:
      return void 0;
  }
  if (result === void 0) {
    shellFileHistory.set(shellType, null);
    return void 0;
  }
  shellFileHistory.set(shellType, result);
  return result;
}

function clearShellFileHistory() {
  shellFileHistory.clear();
}

async function fetchBashHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === 1 /* Windows */ || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const sourceLabel = "~/.bash_history";
  const home2 = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
  const resolvedFile = await fetchFileContents(home2, ".bash_history", false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const fileLines = resolvedFile.content.split("\n");
  const result = /* @__PURE__ */ new Set();
  let currentLine;
  let currentCommand = void 0;
  let wrapChar = void 0;
  for (let i2 = 0; i2 < fileLines.length; i2++) {
    currentLine = fileLines[i2];
    if (currentCommand === void 0) {
      currentCommand = currentLine;
    } else {
      currentCommand += `
${currentLine}`;
    }
    for (let c = 0; c < currentLine.length; c++) {
      if (wrapChar) {
        if (currentLine[c] === wrapChar) {
          wrapChar = void 0;
        }
      } else {
        if (currentLine[c].match(/['"]/)) {
          wrapChar = currentLine[c];
        }
      }
    }
    if (wrapChar === void 0) {
      if (currentCommand.length > 0) {
        result.add(currentCommand.trim());
      }
      currentCommand = void 0;
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}

async function fetchZshHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === 1 /* Windows */ || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const sourceLabel = "~/.zsh_history";
  const home2 = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
  const resolvedFile = await fetchFileContents(home2, ".zsh_history", false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const isExtendedHistory = /^:\s\d+:\d+;/.test(resolvedFile.content);
  const fileLines = resolvedFile.content.split(isExtendedHistory ? /\:\s\d+\:\d+;/ : /(?<!\\)\n/);
  const result = /* @__PURE__ */ new Set();
  for (let i2 = 0; i2 < fileLines.length; i2++) {
    const sanitized = fileLines[i2].replace(/\\\n/g, "\n").trim();
    if (sanitized.length > 0) {
      result.add(sanitized);
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}

async function fetchPythonHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  const sourceLabel = "~/.python_history";
  const home2 = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
  const resolvedFile = await fetchFileContents(home2, ".python_history", false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const fileLines = resolvedFile.content.split("\n");
  const result = /* @__PURE__ */ new Set();
  fileLines.forEach((line) => {
    if (line.trim().length > 0) {
      result.add(line.trim());
    }
  });
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}

async function fetchPwshHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  let folderPrefix;
  let filePath;
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  const isFileWindows = remoteEnvironment?.os === 1 /* Windows */ || !remoteEnvironment && isWindows;
  let sourceLabel;
  if (isFileWindows) {
    folderPrefix = env["APPDATA"];
    filePath = "Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt";
    sourceLabel = `$APPDATA\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt`;
  } else {
    folderPrefix = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
    filePath = ".local/share/powershell/PSReadline/ConsoleHost_history.txt";
    sourceLabel = `~/${filePath}`;
  }
  const resolvedFile = await fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const fileLines = resolvedFile.content.split("\n");
  const result = /* @__PURE__ */ new Set();
  let currentLine;
  let currentCommand = void 0;
  let wrapChar = void 0;
  for (let i2 = 0; i2 < fileLines.length; i2++) {
    currentLine = fileLines[i2];
    if (currentCommand === void 0) {
      currentCommand = currentLine;
    } else {
      currentCommand += `
${currentLine}`;
    }
    if (!currentLine.endsWith("`")) {
      const sanitized = currentCommand.trim();
      if (sanitized.length > 0) {
        result.add(sanitized);
      }
      currentCommand = void 0;
      continue;
    }
    for (let c = 0; c < currentLine.length; c++) {
      if (wrapChar) {
        if (currentLine[c] === wrapChar) {
          wrapChar = void 0;
        }
      } else {
        if (currentLine[c].match(/`/)) {
          wrapChar = currentLine[c];
        }
      }
    }
    if (!wrapChar) {
      const sanitized = currentCommand.trim();
      if (sanitized.length > 0) {
        result.add(sanitized);
      }
      currentCommand = void 0;
    } else {
      currentCommand = currentCommand.replace(/`$/, "");
      wrapChar = void 0;
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}

async function fetchFishHistory(accessor) {
  const fileService = accessor.get(IFileService);
  const remoteAgentService = accessor.get(IRemoteAgentService);
  const remoteEnvironment = await remoteAgentService.getEnvironment();
  if (remoteEnvironment?.os === 1 /* Windows */ || !remoteEnvironment && isWindows) {
    return void 0;
  }
  const overridenDataHome = env["XDG_DATA_HOME"];
  let folderPrefix;
  let filePath;
  let sourceLabel;
  if (overridenDataHome) {
    sourceLabel = "$XDG_DATA_HOME/fish/fish_history";
    folderPrefix = env["XDG_DATA_HOME"];
    filePath = "fish/fish_history";
  } else {
    sourceLabel = "~/.local/share/fish/fish_history";
    folderPrefix = remoteEnvironment?.userHome?.fsPath ?? env["HOME"];
    filePath = ".local/share/fish/fish_history";
  }
  const resolvedFile = await fetchFileContents(folderPrefix, filePath, false, fileService, remoteAgentService);
  if (resolvedFile === void 0) {
    return void 0;
  }
  const result = /* @__PURE__ */ new Set();
  const cmds = resolvedFile.content.split("\n").filter((x) => x.startsWith("- cmd:")).map((x) => x.substring(6).trimStart());
  for (let i2 = 0; i2 < cmds.length; i2++) {
    const sanitized = sanitizeFishHistoryCmd(cmds[i2]).trim();
    if (sanitized.length > 0) {
      result.add(sanitized);
    }
  }
  return {
    sourceLabel,
    sourceResource: resolvedFile.resource,
    commands: Array.from(result.values())
  };
}

function sanitizeFishHistoryCmd(cmd) {
  return repeatedReplace(/(^|[^\\])((?:\\\\)*)(\\n)/g, cmd, "$1$2\n");
}

function repeatedReplace(pattern, value2, replaceValue) {
  let last;
  let current = value2;
  while (true) {
    last = current;
    current = current.replace(pattern, replaceValue);
    if (current === last) {
      return current;
    }
  }
}

async function fetchFileContents(folderPrefix, filePath, isFileWindows, fileService, remoteAgentService) {
  if (!folderPrefix) {
    return void 0;
  }
  const connection = remoteAgentService.getConnection();
  const isRemote = !!connection?.remoteAuthority;
  const resource = URI.from({
    scheme: isRemote ? Schemas.vscodeRemote : Schemas.file,
    authority: isRemote ? connection.remoteAuthority : void 0,
    path: URI.file(join(folderPrefix, filePath)).path
  });
  let content2;
  try {
    content2 = await fileService.readFile(resource);
  } catch (e) {
    if (e instanceof FileOperationError && e.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
      return void 0;
    }
    throw e;
  }
  if (content2 === void 0) {
    return void 0;
  }
  return {
    resource,
    content: content2.value.toString()
  };
}
export { getDirectoryHistory, getCommandHistory, getShellFileHistory, clearShellFileHistory, fetchBashHistory, fetchZshHistory, fetchPythonHistory, fetchPwshHistory, fetchFishHistory, sanitizeFishHistoryCmd, repeatedReplace, fetchFileContents, directoryHistory, commandHistory, TerminalPersistedHistory, shellFileHistory };
