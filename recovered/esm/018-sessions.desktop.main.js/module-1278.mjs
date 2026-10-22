// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { env } from "./module-0015.mjs";
import { timeout } from "./module-0036.mjs";
import { URI } from "./module-0032.mjs";
import { gitBashToWindowsPath, windowsToGitBashPath } from "./module-1277.mjs";
import { isString } from "./module-0010.mjs";
import { match } from "./module-0857.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { basename } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ITerminalLogService } from "./module-1155.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionService.ts
var ITerminalCompletionService = createDecorator("terminalCompletionService");

var TerminalCompletionService = class extends Disposable {
  constructor(_configurationService, _fileService, _labelService, _logService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._labelService = _labelService;
    this._logService = _logService;
    this._providers = /* @__PURE__ */ new Map();
    this._onDidChangeProviders = this._register(new Emitter());
    this.onDidChangeProviders = this._onDidChangeProviders.event;
    this._processEnv = env;
  }
  get providers() {
    return this._providersGenerator();
  }
  *_providersGenerator() {
    for (const providerMap of this._providers.values()) {
      for (const provider of providerMap.values()) {
        yield provider;
      }
    }
  }
  /** Overrides the environment for testing purposes. */
  set processEnv(env2) {
    this._processEnv = env2;
  }
  registerTerminalCompletionProvider(extensionIdentifier, id2, provider, ...triggerCharacters) {
    let extMap = this._providers.get(extensionIdentifier);
    if (!extMap) {
      extMap = /* @__PURE__ */ new Map();
      this._providers.set(extensionIdentifier, extMap);
    }
    provider.triggerCharacters = triggerCharacters;
    provider.id = id2;
    extMap.set(id2, provider);
    this._onDidChangeProviders.fire();
    return toDisposable(() => {
      const extMap2 = this._providers.get(extensionIdentifier);
      if (extMap2) {
        extMap2.delete(id2);
        if (extMap2.size === 0) {
          this._providers.delete(extensionIdentifier);
        }
      }
      this._onDidChangeProviders.fire();
    });
  }
  async provideCompletions(promptValue, cursorPosition, allowFallbackCompletions, shellType, capabilities, token, triggerCharacter, skipExtensionCompletions, explicitlyInvoked) {
    this._logService.trace("TerminalCompletionService#provideCompletions");
    if (!this._providers || !this._providers.values || cursorPosition < 0) {
      return void 0;
    }
    let providers2;
    if (triggerCharacter) {
      const providersToRequest = [];
      for (const provider of this.providers) {
        if (!provider.triggerCharacters) {
          continue;
        }
        for (const char of provider.triggerCharacters) {
          if (promptValue.substring(0, cursorPosition)?.endsWith(char)) {
            providersToRequest.push(provider);
            break;
          }
        }
      }
      providers2 = providersToRequest;
    } else {
      providers2 = [...this._providers.values()].flatMap((providerMap) => [...providerMap.values()]);
    }
    if (skipExtensionCompletions) {
      providers2 = providers2.filter((p) => p.isBuiltin);
      return this._collectCompletions(providers2, shellType, promptValue, cursorPosition, allowFallbackCompletions, capabilities, token, explicitlyInvoked);
    }
    providers2 = this._getEnabledProviders(providers2);
    if (!providers2.length) {
      return;
    }
    return this._collectCompletions(providers2, shellType, promptValue, cursorPosition, allowFallbackCompletions, capabilities, token, explicitlyInvoked);
  }
  _getEnabledProviders(providers2) {
    const providerConfig = this._configurationService.getValue("terminal.integrated.suggest.providers" /* Providers */);
    return providers2.filter((p) => {
      const providerId = p.id;
      return providerId && (!Object.prototype.hasOwnProperty.call(providerConfig, providerId) || providerConfig[providerId] !== false);
    });
  }
  async _collectCompletions(providers2, shellType, promptValue, cursorPosition, allowFallbackCompletions, capabilities, token, explicitlyInvoked) {
    this._logService.trace("TerminalCompletionService#_collectCompletions");
    const completionPromises = providers2.map(async (provider) => {
      if (provider.shellTypes && shellType && !provider.shellTypes.includes(shellType)) {
        return void 0;
      }
      const timeoutMs = explicitlyInvoked ? 3e4 : 5e3;
      let timedOut = false;
      let completions;
      try {
        completions = await Promise.race([
          provider.provideCompletions(promptValue, cursorPosition, token).then((result) => {
            this._logService.trace(`TerminalCompletionService#_collectCompletions provider ${provider.id} finished`);
            return result;
          }),
          (async () => {
            await timeout(timeoutMs);
            timedOut = true;
            return void 0;
          })()
        ]);
      } catch (e4) {
        this._logService.trace(`[TerminalCompletionService] Exception from provider '${provider.id}':`, e4);
        return void 0;
      }
      if (timedOut) {
        this._logService.trace(`[TerminalCompletionService] Provider '${provider.id}' timed out after ${timeoutMs}ms. promptValue='${promptValue}', cursorPosition=${cursorPosition}, explicitlyInvoked=${explicitlyInvoked}`);
        return void 0;
      }
      if (!completions) {
        return void 0;
      }
      const completionItems = Array.isArray(completions) ? completions : completions.items ?? [];
      this._logService.trace(`TerminalCompletionService#_collectCompletions amend ${completionItems.length} completion items`);
      if (shellType === "pwsh" /* PowerShell */) {
        for (const completion of completionItems) {
          const start = completion.replacementRange ? completion.replacementRange[0] : 0;
          completion.isFileOverride ??= completion.kind === 2 /* Method */ && start === 0;
        }
      }
      if (provider.isBuiltin) {
        for (const item of completionItems) {
          item.provider ??= provider.id;
        }
      }
      if (Array.isArray(completions)) {
        return completionItems;
      }
      if (completions.resourceOptions) {
        const resourceCompletions = await this.resolveResources(completions.resourceOptions, promptValue, cursorPosition, `core:path:ext:${provider.id}`, capabilities, shellType);
        this._logService.trace(`TerminalCompletionService#_collectCompletions dedupe`);
        if (resourceCompletions) {
          const labels = new Set(completionItems.map((c) => c.label));
          for (const item of resourceCompletions) {
            if (!labels.has(item.label)) {
              completionItems.push(item);
            }
          }
        }
        this._logService.trace(`TerminalCompletionService#_collectCompletions dedupe done`);
      }
      return completionItems;
    });
    const results = await Promise.all(completionPromises);
    this._logService.trace("TerminalCompletionService#_collectCompletions done");
    return results.filter((result) => !!result).flat();
  }
  async resolveResources(resourceOptions, promptValue, cursorPosition, provider, capabilities, shellType) {
    this._logService.trace(`TerminalCompletionService#resolveResources`);
    const useWindowsStylePath = resourceOptions.pathSeparator === "\\";
    if (useWindowsStylePath) {
      promptValue = promptValue.replaceAll(/[\\/]/g, resourceOptions.pathSeparator);
    }
    const showDirectories = (resourceOptions.showDirectories || resourceOptions.showFiles) ?? false;
    const showFiles = resourceOptions.showFiles ?? false;
    const globPattern = resourceOptions.globPattern ?? void 0;
    if (!showDirectories && !showFiles) {
      return;
    }
    const resourceCompletions = [];
    const cursorPrefix = promptValue.substring(0, cursorPosition);
    const wordsBeforeCursor = cursorPrefix.split(/(?<!\\) /);
    const isCommandPosition = wordsBeforeCursor.length <= 1 && !cursorPrefix.endsWith(" ");
    let lastWord = cursorPrefix.endsWith(" ") ? "" : cursorPrefix.split(/(?<!\\) /).at(-1) ?? "";
    const matchEnvVarPrefix = lastWord.match(/^[a-zA-Z_]+=(?<rhs>.+)$/);
    if (matchEnvVarPrefix?.groups?.rhs) {
      lastWord = matchEnvVarPrefix.groups.rhs;
    }
    let lastSlashIndex;
    if (useWindowsStylePath) {
      let lastBackslashIndex = -1;
      for (let i2 = lastWord.length - 1; i2 >= 0; i2--) {
        if (lastWord[i2] === "\\") {
          if (i2 === lastWord.length - 1 || lastWord[i2 + 1] !== " ") {
            lastBackslashIndex = i2;
            break;
          }
        }
      }
      lastSlashIndex = Math.max(lastBackslashIndex, lastWord.lastIndexOf("/"));
    } else {
      lastSlashIndex = lastWord.lastIndexOf(resourceOptions.pathSeparator);
    }
    let lastWordFolder = lastSlashIndex === -1 ? "" : lastWord.slice(0, lastSlashIndex + 1);
    if (useWindowsStylePath) {
      lastWordFolder = lastWordFolder.replaceAll("/", "\\");
    }
    const lastWordFolderHasDotPrefix = !!lastWordFolder.match(/^\.\.?[\\\/]/);
    const lastWordFolderHasTildePrefix = !!lastWordFolder.match(/^~[\\\/]?/);
    const isAbsolutePath2 = getIsAbsolutePath(shellType, resourceOptions.pathSeparator, lastWordFolder, useWindowsStylePath);
    const type = lastWordFolderHasTildePrefix ? "tilde" : isAbsolutePath2 ? "absolute" : "relative";
    const cwd2 = URI.revive(resourceOptions.cwd);
    let lastWordFolderResource;
    if (type === "relative" && lastWordFolder.length > 0) {
      const normalizedFolder = (useWindowsStylePath ? lastWordFolder.replaceAll("\\", "/") : lastWordFolder).replaceAll("\\ ", " ");
      const hasDotPrefix = normalizedFolder.startsWith("./");
      if (hasDotPrefix) {
        const stripped = normalizedFolder.replace(/^\.\/+/, "").replace(/\/+$/, "");
        if (stripped) {
          const cwdParts = cwd2.path.replace(/\/+$/, "").split("/");
          const strippedParts = stripped.split("/");
          const tailMatches = strippedParts.length <= cwdParts.length && strippedParts.every((part, idx) => cwdParts[cwdParts.length - strippedParts.length + idx] === part);
          if (tailMatches) {
            try {
              await this._fileService.stat(cwd2);
              lastWordFolderResource = cwd2;
            } catch {
              return void 0;
            }
          }
        } else {
          try {
            await this._fileService.stat(cwd2);
            lastWordFolderResource = cwd2;
          } catch {
            return void 0;
          }
        }
      }
      if (!lastWordFolderResource) {
        const folderToResolve = URI.joinPath(cwd2, normalizedFolder);
        try {
          await this._fileService.stat(folderToResolve);
          lastWordFolderResource = folderToResolve;
        } catch {
          return void 0;
        }
      }
    } else if (type === "relative") {
      lastWordFolderResource = cwd2;
    }
    if (type === "relative" && !lastWordFolderResource) {
      try {
        await this._fileService.stat(cwd2);
        lastWordFolderResource = cwd2;
      } catch {
        return void 0;
      }
    }
    switch (type) {
      case "tilde": {
        const home2 = this._getHomeDir(useWindowsStylePath, capabilities);
        if (home2) {
          lastWordFolderResource = URI.joinPath(createUriFromLocalPath(cwd2, home2), lastWordFolder.slice(1).replaceAll("\\ ", " "));
        }
        if (!lastWordFolderResource) {
          if (lastWord.match(/^~[\\\/]$/)) {
            lastWordFolderResource = useWindowsStylePath ? "Home directory" : "$HOME";
          }
        }
        break;
      }
      case "absolute": {
        if (shellType === "gitbash" /* GitBash */) {
          lastWordFolderResource = createUriFromLocalPath(cwd2, gitBashToWindowsPath(lastWordFolder, this._processEnv.SystemDrive));
        } else {
          lastWordFolderResource = createUriFromLocalPath(cwd2, lastWordFolder.replaceAll("\\ ", " "));
        }
        break;
      }
      case "relative": {
        lastWordFolderResource ??= cwd2;
        break;
      }
    }
    if (!lastWordFolderResource) {
      return void 0;
    }
    if (isString(lastWordFolderResource)) {
      resourceCompletions.push({
        label: lastWordFolder,
        provider,
        kind: 1 /* Folder */,
        detail: lastWordFolderResource,
        replacementRange: [cursorPosition - lastWord.length, cursorPosition]
      });
      return resourceCompletions;
    }
    const stat = await this._fileService.resolve(lastWordFolderResource, {
      resolveMetadata: true,
      resolveSingleChildDescendants: true
    });
    if (!stat?.children) {
      return;
    }
    this._logService.trace(`TerminalCompletionService#resolveResources cwd`);
    if (showDirectories) {
      let label3;
      switch (type) {
        case "tilde": {
          label3 = lastWordFolder;
          break;
        }
        case "absolute": {
          label3 = lastWordFolder;
          break;
        }
        case "relative": {
          label3 = ".";
          if (lastWordFolder.length > 0) {
            label3 = addPathRelativePrefix(lastWordFolder, resourceOptions, lastWordFolderHasDotPrefix);
          }
          break;
        }
      }
      resourceCompletions.push({
        label: label3,
        provider,
        kind: 1 /* Folder */,
        detail: getFriendlyPath(this._labelService, lastWordFolderResource, resourceOptions.pathSeparator, 1 /* Folder */, shellType),
        replacementRange: [cursorPosition - lastWord.length, cursorPosition]
      });
    }
    this._logService.trace(`TerminalCompletionService#resolveResources direct children`);
    await Promise.all(stat.children.map((child) => (async () => {
      let kind;
      let detail2 = void 0;
      if (showDirectories && child.isDirectory) {
        if (child.isSymbolicLink) {
          kind = 9 /* SymbolicLinkFolder */;
        } else {
          kind = 1 /* Folder */;
        }
      } else if (showFiles && child.isFile) {
        if (isCommandPosition && !useWindowsStylePath) {
          if (!child.executable) {
            return;
          }
        }
        if (child.isSymbolicLink) {
          kind = 8 /* SymbolicLinkFile */;
        } else {
          kind = 0 /* File */;
        }
      }
      if (kind === void 0) {
        return;
      }
      let label3 = lastWordFolder;
      if (label3.length > 0 && !label3.endsWith(resourceOptions.pathSeparator)) {
        label3 += resourceOptions.pathSeparator;
      }
      label3 += child.name;
      if (type === "relative") {
        label3 = addPathRelativePrefix(label3, resourceOptions, lastWordFolderHasDotPrefix);
      }
      if (child.isDirectory && !label3.endsWith(resourceOptions.pathSeparator)) {
        label3 += resourceOptions.pathSeparator;
      }
      label3 = escapeTerminalCompletionLabel(label3, shellType, resourceOptions.pathSeparator);
      if (child.isFile && globPattern) {
        const filePath = child.resource.fsPath;
        const ignoreCase = !this._fileService.hasCapability(child.resource, 1024 /* PathCaseSensitive */);
        const matches2 = match(globPattern, filePath, { ignoreCase });
        if (!matches2) {
          return;
        }
      }
      if (child.isSymbolicLink) {
        try {
          const realpath = await this._fileService.realpath(child.resource);
          if (realpath && !isEqual2(child.resource, realpath)) {
            detail2 = `${getFriendlyPath(this._labelService, child.resource, resourceOptions.pathSeparator, kind, shellType)} -> ${getFriendlyPath(this._labelService, realpath, resourceOptions.pathSeparator, kind, shellType)}`;
          }
        } catch (error) {
        }
      }
      resourceCompletions.push({
        label: label3,
        provider,
        kind,
        detail: detail2 ?? getFriendlyPath(this._labelService, child.resource, resourceOptions.pathSeparator, kind, shellType),
        replacementRange: [cursorPosition - lastWord.length, cursorPosition]
      });
    })()));
    this._logService.trace(`TerminalCompletionService#resolveResources CDPATH`);
    if (type === "relative" && showDirectories) {
      if (promptValue.startsWith("cd ")) {
        const config = this._configurationService.getValue("terminal.integrated.suggest.cdPath" /* CdPath */);
        if (config === "absolute" || config === "relative") {
          const cdPath = this._getEnvVar("CDPATH", capabilities);
          if (cdPath) {
            const cdPathEntries = cdPath.split(useWindowsStylePath ? ";" : ":");
            for (const cdPathEntry of cdPathEntries) {
              try {
                const fileStat = await this._fileService.resolve(createUriFromLocalPath(cwd2, cdPathEntry), { resolveSingleChildDescendants: true });
                if (fileStat?.children) {
                  for (const child of fileStat.children) {
                    if (!child.isDirectory) {
                      continue;
                    }
                    const useRelative = config === "relative";
                    const kind = 1 /* Folder */;
                    const label3 = useRelative ? basename(child.resource.fsPath) : shellType === "gitbash" /* GitBash */ ? windowsToGitBashPath(child.resource.fsPath) : getFriendlyPath(this._labelService, child.resource, resourceOptions.pathSeparator, kind, shellType);
                    const detail2 = useRelative ? `CDPATH ${getFriendlyPath(this._labelService, child.resource, resourceOptions.pathSeparator, kind, shellType)}` : `CDPATH`;
                    resourceCompletions.push({
                      label: label3,
                      provider,
                      kind,
                      detail: detail2,
                      replacementRange: [cursorPosition - lastWord.length, cursorPosition]
                    });
                  }
                }
              } catch {
              }
            }
          }
        }
      }
    }
    this._logService.trace(`TerminalCompletionService#resolveResources parent dir`);
    if (type === "relative" && showDirectories) {
      let label3 = `..${resourceOptions.pathSeparator}`;
      if (lastWordFolder.length > 0) {
        label3 = addPathRelativePrefix(lastWordFolder + label3, resourceOptions, lastWordFolderHasDotPrefix);
      }
      const parentDir = URI.joinPath(lastWordFolderResource, ".." + resourceOptions.pathSeparator);
      resourceCompletions.push({
        label: label3,
        provider,
        kind: 1 /* Folder */,
        detail: getFriendlyPath(this._labelService, parentDir, resourceOptions.pathSeparator, 1 /* Folder */, shellType),
        replacementRange: [cursorPosition - lastWord.length, cursorPosition]
      });
    }
    this._logService.trace(`TerminalCompletionService#resolveResources tilde`);
    if (type === "relative" && !lastWordFolder.match(/[\\\/]/)) {
      let homeResource;
      const home2 = this._getHomeDir(useWindowsStylePath, capabilities);
      if (home2) {
        homeResource = createUriFromLocalPath(cwd2, home2);
      }
      if (!homeResource) {
        homeResource = useWindowsStylePath ? "Home directory" : "$HOME";
      }
      resourceCompletions.push({
        label: "~",
        provider,
        kind: 1 /* Folder */,
        detail: isString(homeResource) ? homeResource : getFriendlyPath(this._labelService, homeResource, resourceOptions.pathSeparator, 1 /* Folder */, shellType),
        replacementRange: [cursorPosition - lastWord.length, cursorPosition]
      });
    }
    this._logService.trace(`TerminalCompletionService#resolveResources done`);
    return resourceCompletions;
  }
  _getEnvVar(key3, capabilities) {
    const env2 = capabilities.get(5 /* ShellEnvDetection */)?.env?.value;
    if (env2) {
      return env2[key3];
    }
    return this._processEnv[key3];
  }
  _getHomeDir(useWindowsStylePath, capabilities) {
    return useWindowsStylePath ? this._getEnvVar("USERPROFILE", capabilities) : this._getEnvVar("HOME", capabilities);
  }
};

TerminalCompletionService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, ITerminalLogService)
], TerminalCompletionService);

function getFriendlyPath(labelService, uri4, pathSeparator, kind, shellType) {
  let path = labelService.getUriLabel(uri4, { noPrefix: true });
  const sep2 = shellType === "gitbash" /* GitBash */ ? "\\" : pathSeparator;
  if (kind === 1 /* Folder */ && !path.endsWith(sep2)) {
    path += sep2;
  }
  return path;
}

function addPathRelativePrefix(text2, resourceOptions, lastWordFolderHasDotPrefix) {
  if (!lastWordFolderHasDotPrefix) {
    if (text2.startsWith(resourceOptions.pathSeparator)) {
      return `.${text2}`;
    }
    return `.${resourceOptions.pathSeparator}${text2}`;
  }
  return text2;
}

function escapeTerminalCompletionLabel(label3, shellType, pathSeparator) {
  if (shellType === void 0 || shellType === "pwsh" /* PowerShell */ || shellType === "cmd" /* CommandPrompt */) {
    return label3;
  }
  return label3.replace(/[\[\]\(\)'"\\\`\*\?;|&<>]/g, "\\$&");
}

function getIsAbsolutePath(shellType, pathSeparator, lastWord, useWindowsStylePath) {
  if (shellType === "gitbash" /* GitBash */) {
    return lastWord.startsWith(pathSeparator) || /^[a-zA-Z]:\//.test(lastWord);
  }
  return useWindowsStylePath ? /^[a-zA-Z]:[\\\/]/.test(lastWord) : lastWord.startsWith(pathSeparator);
}

function createUriFromLocalPath(cwd2, absolutePath2) {
  if (cwd2.scheme === "file") {
    return URI.file(absolutePath2);
  }
  return cwd2.with({ path: absolutePath2 });
}
export { getFriendlyPath, addPathRelativePrefix, escapeTerminalCompletionLabel, getIsAbsolutePath, createUriFromLocalPath, ITerminalCompletionService, TerminalCompletionService };
