// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/utils/promptFilesLocator.ts
import { localize } from "./module-0001.mjs";
import { AGENT_HOST_SCHEME } from "./module-1001.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { PromptsConfig, getPromptFileLocationsConfigKey, isTildePath } from "./module-0999.mjs";
import { AGENTS_SOURCE_FOLDER, AGENT_FILE_EXTENSION, CLAUDE_CONFIG_FOLDER, COPILOT_CONFIG_FOLDER, GITHUB_CONFIG_FOLDER, LEGACY_MODE_FILE_EXTENSION, SKILL_FILENAME, getCleanPromptName, getPromptFileDefaultLocations, getPromptFileExtension, getPromptFileType } from "./module-0997.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { basename2, dirname2, isEqual2, isEqualOrParent2, joinPath } from "./module-0034.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { ISearchService, getExcludes } from "./module-1000.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPathService } from "./module-0939.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/utils/promptFilesLocator.ts
var MAX_INSTRUCTIONS_RECURSION_DEPTH = 5;

var PromptFilesLocator = class {
  constructor(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService, pathService, workspaceTrustManagementService) {
    this.fileService = fileService;
    this.configService = configService;
    this.workspaceService = workspaceService;
    this.environmentService = environmentService;
    this.searchService = searchService;
    this.userDataService = userDataService;
    this.logService = logService;
    this.pathService = pathService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    const userDataPromptsHome = this.userDataService.currentProfile.promptsHome;
    this.userDataFolder = {
      uri: userDataPromptsHome,
      searchRoot: userDataPromptsHome,
      filePattern: void 0,
      source: "user-data" /* UserData */,
      storage: "user" /* user */,
      displayPath: localize(13390, null),
      isDefault: true
    };
  }
  getWorkspaceFolders() {
    return this.workspaceService.getWorkspace().folders.filter((f) => f.uri.scheme !== AGENT_HOST_SCHEME);
  }
  getWorkspaceFolder(resource) {
    return this.workspaceService.getWorkspaceFolder(resource) ?? void 0;
  }
  onDidChangeWorkspaceFolders() {
    return Event2.map(this.workspaceService.onDidChangeWorkspaceFolders, () => void 0);
  }
  /**
   * Returns the configured prompt source folders for the given type.
   * Subclasses can override to filter out unsupported sources.
   */
  getPromptSourceFolders(type) {
    return PromptsConfig.promptSourceFolders(this.configService, type);
  }
  /**
   * Returns the default prompt source folders for the given type.
   * Subclasses can override to filter out unsupported sources.
   */
  getDefaultSourceFolders(type) {
    return getPromptFileDefaultLocations(type);
  }
  async getWorkspaceFolderRoots(includeParents, logger, root) {
    const workspaceFolders = root ? root.scheme === AGENT_HOST_SCHEME ? [] : [{ uri: root }] : this.getWorkspaceFolders();
    if (includeParents) {
      const roots = new ResourceSet();
      const userHome = await this.pathService.userHome();
      for (const workspaceFolder of workspaceFolders) {
        roots.add(workspaceFolder.uri);
        const parents = await this.findParentRepoFolders(workspaceFolder.uri, userHome, roots, logger);
        for (const parent of parents) {
          roots.add(parent);
        }
      }
      return [...roots];
    }
    return workspaceFolders.map((f) => f.uri);
  }
  /**
   * Walks up from {@link folderUri} collecting parent folders until a
   * repository root (a folder containing `.git`) is found.  Returns the
   * intermediate parent folders only when a repo root is found; returns
   * an empty array when the walk reaches the filesystem root, the user
   * home directory, or a folder already present in {@link seen}.
   */
  async findParentRepoFolders(folderUri, userHome, seen, logger) {
    const candidates = [];
    let current = folderUri;
    while (true) {
      try {
        const gitStat = await this.fileService.stat(joinPath(current, ".git")).then((stat) => stat, () => void 0);
        const isRepoRoot = gitStat?.isDirectory === true;
        if (isRepoRoot) {
          if ((await this.workspaceTrustManagementService.getUriTrustInfo(current)).trusted) {
            candidates.push(current);
            return candidates;
          }
          logger?.logInfo(`Repository root found at ${current.toString()}, but it is not trusted. Skipping parent folder inclusion for this workspace folder.`);
          return [];
        }
      } catch (e4) {
        const msg = e4 instanceof Error ? e4.message : String(e4);
        logger?.logInfo(`No repository root found for folder ${folderUri.toString()}. Error accessing ${joinPath(current, ".git")}: ${msg}.`);
        return [];
      }
      candidates.push(current);
      const parent = dirname2(current);
      if (isEqual2(current, parent) || current.path === "/" || isEqual2(userHome, parent) || seen.has(parent)) {
        break;
      }
      current = parent;
    }
    logger?.logInfo(`No repository root found for folder ${folderUri.toString()}.`);
    return [];
  }
  /**
   * List all prompt files from the filesystem.
   *
   * @returns List of prompt files found in the workspace.
   */
  async listFiles(type, storage, token, root) {
    const files = await this.listFilesWithSource(type, storage, token, root);
    return files.map((file) => file.uri);
  }
  async listFilesWithSource(type, storage, token, root) {
    if (storage !== "user" /* user */ && storage !== "local" /* local */) {
      throw new Error(`Unsupported prompt file storage: ${storage}`);
    }
    const configuredLocations = this.getPromptSourceFolders(type);
    const localRoot = storage === "local" /* local */ ? root : void 0;
    const absoluteLocations = await this.toAbsoluteLocations(type, configuredLocations.filter((location2) => location2.storage === storage), void 0, localRoot);
    if (storage === "user" /* user */ && this.isUserDataPromptType(type)) {
      const localLocations = await this.toAbsoluteLocations(type, configuredLocations.filter((location2) => location2.storage === "local" /* local */));
      absoluteLocations.push(...localLocations.filter((location2) => this.sourceFolderOverlapsUserData(type, location2.searchRoot)));
      absoluteLocations.push(this.userDataFolder);
    }
    const paths = new ResourceSet();
    const result = [];
    for (const { searchRoot, filePattern: filePattern2, source, storage: sourceStorage } of absoluteLocations) {
      const files = filePattern2 === void 0 ? await this.resolveFilesAtLocation(searchRoot, type, token, 0, localRoot) : await this.searchFilesInLocation(searchRoot, filePattern2, token);
      for (const file of files) {
        if (getPromptFileType(file) !== type || paths.has(file)) {
          continue;
        }
        const isUserDataFile = this.isUserDataPromptFile(type, file);
        if (isUserDataFile && storage !== "user" /* user */ || !isUserDataFile && sourceStorage !== storage) {
          continue;
        }
        paths.add(file);
        result.push({ uri: file, source: isUserDataFile ? "user-data" /* UserData */ : source });
      }
      if (token.isCancellationRequested) {
        return [];
      }
    }
    return result;
  }
  isUserDataPromptType(type) {
    return type === "agent" /* agent */ || type === "instructions" /* instructions */ || type === "prompt" /* prompt */;
  }
  isUserDataPromptFile(type, resource) {
    return this.isUserDataPromptType(type) && isEqualOrParent2(resource, this.userDataFolder.uri);
  }
  sourceFolderOverlapsUserData(type, searchRoot) {
    return this.isUserDataPromptType(type) && (isEqualOrParent2(searchRoot, this.userDataFolder.uri) || isEqualOrParent2(this.userDataFolder.uri, searchRoot));
  }
  createFilesUpdatedEvent(type) {
    const disposables = new DisposableStore();
    const eventEmitter = disposables.add(new Emitter());
    const token = disposables.add(new CancellationTokenSource()).token;
    const externalFolderWatchers = disposables.add(new DisposableStore());
    const key3 = getPromptFileLocationsConfigKey(type);
    const userDataFolder = this.userDataService.currentProfile.promptsHome;
    let parentFolders = [];
    const updateExternalFolderWatchers = () => {
      externalFolderWatchers.clear();
      for (const folder of parentFolders) {
        if (!this.getWorkspaceFolder(folder.searchRoot)) {
          const recursive = folder.filePattern !== void 0 || type === "instructions" /* instructions */;
          externalFolderWatchers.add(this.fileService.watch(folder.searchRoot, { recursive, excludes: [] }));
        }
      }
    };
    const update = async () => {
      try {
        const configuredLocations = this.getPromptSourceFolders(type);
        parentFolders = await this.toAbsoluteLocations(type, configuredLocations, void 0);
        if (token.isCancellationRequested) {
          return;
        }
        updateExternalFolderWatchers();
      } catch (err) {
        this.logService.error(`Error updating prompt file watchers after config change:`, err);
      }
    };
    disposables.add(this.configService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(key3) || e4.affectsConfiguration(PromptsConfig.USE_CUSTOMIZATIONS_IN_PARENT_REPOS)) {
        void update();
        eventEmitter.fire();
      }
    }));
    disposables.add(this.onDidChangeWorkspaceFolders()(() => {
      void update();
      eventEmitter.fire();
    }));
    disposables.add(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => {
      void update();
      eventEmitter.fire();
    }));
    disposables.add(this.fileService.onDidFilesChange((e4) => {
      if (e4.affects(userDataFolder)) {
        eventEmitter.fire();
        return;
      }
      if (parentFolders.some((folder) => e4.affects(folder.searchRoot))) {
        eventEmitter.fire();
        return;
      }
    }));
    disposables.add(this.fileService.watch(userDataFolder));
    void update();
    return { event: eventEmitter.event, dispose: () => disposables.dispose() };
  }
  createAgentInstructionsUpdatedEvent() {
    const disposables = new DisposableStore();
    const eventEmitter = disposables.add(new Emitter());
    const cts = new CancellationTokenSource();
    disposables.add(toDisposable(() => cts.dispose(true)));
    const token = cts.token;
    const watchers = disposables.add(new DisposableStore());
    const watchedRoots = new ResourceSet();
    const addWatch = (resource) => {
      if (token.isCancellationRequested) {
        return;
      }
      if (watchedRoots.has(resource)) {
        return;
      }
      watchedRoots.add(resource);
      watchers.add(this.fileService.watch(resource));
    };
    const updateWatchers = async () => {
      watchers.clear();
      watchedRoots.clear();
      const watchWorkspaceRoots = this.configService.getValue(PromptsConfig.USE_AGENT_MD) || this.configService.getValue(PromptsConfig.USE_CLAUDE_MD);
      const watchClaudeFolders = this.configService.getValue(PromptsConfig.USE_CLAUDE_MD);
      const watchCopilotFolders = this.configService.getValue(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES);
      const includeParents = this.configService.getValue(PromptsConfig.USE_CUSTOMIZATIONS_IN_PARENT_REPOS) === true;
      const workspaceRoots = await this.getWorkspaceFolderRoots(includeParents);
      if (token.isCancellationRequested) {
        return;
      }
      const userHome = await this.pathService.userHome();
      if (token.isCancellationRequested) {
        return;
      }
      for (const workspaceRoot of workspaceRoots) {
        if (watchWorkspaceRoots) {
          addWatch(workspaceRoot);
        }
        if (watchClaudeFolders) {
          addWatch(joinPath(workspaceRoot, CLAUDE_CONFIG_FOLDER));
        }
        if (watchCopilotFolders) {
          addWatch(joinPath(workspaceRoot, GITHUB_CONFIG_FOLDER));
        }
      }
      if (watchClaudeFolders) {
        addWatch(joinPath(userHome, CLAUDE_CONFIG_FOLDER));
      }
      if (watchCopilotFolders) {
        addWatch(joinPath(userHome, COPILOT_CONFIG_FOLDER));
      }
    };
    const refresh = () => {
      void updateWatchers();
      eventEmitter.fire();
    };
    disposables.add(this.configService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(PromptsConfig.USE_AGENT_MD) || e4.affectsConfiguration(PromptsConfig.USE_CLAUDE_MD) || e4.affectsConfiguration(PromptsConfig.USE_COPILOT_INSTRUCTION_FILES) || e4.affectsConfiguration(PromptsConfig.USE_CUSTOMIZATIONS_IN_PARENT_REPOS)) {
        refresh();
      }
    }));
    disposables.add(this.onDidChangeWorkspaceFolders()(() => {
      refresh();
    }));
    disposables.add(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => {
      refresh();
    }));
    disposables.add(this.fileService.onDidFilesChange((e4) => {
      for (const watchedRoot of watchedRoots) {
        if (e4.affects(watchedRoot)) {
          eventEmitter.fire();
          return;
        }
      }
    }));
    disposables.add(this.fileService.onDidRunOperation((e4) => {
      for (const watchedRoot of watchedRoots) {
        if (isEqualOrParent2(e4.resource, watchedRoot)) {
          eventEmitter.fire();
          return;
        }
        if (e4.isOperation(0 /* CREATE */) || e4.isOperation(2 /* MOVE */) || e4.isOperation(3 /* COPY */)) {
          if (isEqualOrParent2(e4.target.resource, watchedRoot)) {
            eventEmitter.fire();
            return;
          }
        }
      }
    }));
    void updateWatchers();
    return { event: eventEmitter.event, dispose: () => disposables.dispose() };
  }
  /**
   * Gets the hook source folders for creating new hooks.
   * Returns configured hook folders, excluding Claude paths (which are read-only).
   */
  async getHookSourceFolders() {
    const configuredLocations = this.getPromptSourceFolders("hook" /* hook */);
    const allowedHookFolders = configuredLocations.filter(
      (loc) => !loc.path.startsWith(".claude/") && !loc.path.includes("/.claude/")
    );
    const absoluteLocations = await this.toAbsoluteLocations("hook" /* hook */, allowedHookFolders);
    const seen = new ResourceSet();
    const result = [];
    for (const location2 of absoluteLocations) {
      if (!seen.has(location2.searchRoot)) {
        seen.add(location2.searchRoot);
        result.push({ ...location2, uri: location2.searchRoot, filePattern: void 0 });
      }
    }
    return result;
  }
  /**
   * Get all possible unambiguous prompt file source folders based on
   * the current workspace folder structure.
   *
   * This method is currently primarily used by the `> Create Prompt`
   * command that providers users with the list of destination folders
   * for a newly created prompt file. Because such a list cannot contain
   * paths that include `glob pattern` in them, we need to process config
   * values and try to create a list of clear and unambiguous locations.
   *
   * @returns List of possible unambiguous prompt file folders.
   */
  async getConfigBasedSourceFolders(type) {
    const configuredLocations = this.getPromptSourceFolders(type);
    const absoluteLocations = await this.toAbsoluteLocations(type, configuredLocations);
    if (type !== "prompt" /* prompt */ && type !== "instructions" /* instructions */) {
      return absoluteLocations.map((l) => l.uri);
    }
    const result = new ResourceSet();
    for (const absoluteLocation of absoluteLocations) {
      let location2 = absoluteLocation.uri;
      const baseName = basename2(location2);
      const filePatterns = ["*.md", `*${getPromptFileExtension(type)}`];
      for (const filePattern2 of filePatterns) {
        if (baseName === filePattern2) {
          location2 = dirname2(location2);
          continue;
        }
      }
      if (baseName === "*") {
        location2 = dirname2(location2);
      }
      if (isValidGlob(location2.path) === true) {
        continue;
      }
      result.add(location2);
    }
    return [...result];
  }
  /**
   * Gets all resolved source folders for the given prompt type with metadata.
   * This method merges configured locations with default locations and resolves them
   * to absolute paths, including displayPath and isDefault information.
   *
   * The returned order prefers workspace (local) folders first, then user folders.
   * This is used for UX like the "Create Prompt" command where workspace is preferred.
   *
   * @param type The type of prompt files.
   * @returns List of resolved source folders with metadata.
   */
  async getResolvedSourceFolders(type) {
    const absoluteLocations = await this.getLocalStorageFolders(type);
    const localFolders = absoluteLocations.filter((loc) => loc.storage === "local" /* local */);
    const userFolders = absoluteLocations.filter((loc) => loc.storage === "user" /* user */);
    return this.dedupeSourceFolders([...localFolders, ...userFolders]);
  }
  /**
   * Gets all resolved source folders in the same order that file discovery
   * searches them (user folders first, then local/workspace folders).
   * This matches the order used by {@link listFiles} and should be used
   * for debug/diagnostic output so the displayed order is accurate.
   */
  async getSourceFoldersInDiscoveryOrder(type) {
    const absoluteLocations = await this.getLocalStorageFolders(type);
    const userFolders = absoluteLocations.filter((loc) => loc.storage === "user" /* user */);
    const localFolders = absoluteLocations.filter((loc) => loc.storage === "local" /* local */);
    return this.dedupeSourceFolders([...userFolders, ...localFolders]);
  }
  /**
   * Gets all local (workspace) storage folders for the given prompt type.
   * This merges default folders with configured locations.
   */
  async getLocalStorageFolders(type) {
    const configuredLocations = this.getPromptSourceFolders(type);
    const defaultFolders = this.getDefaultSourceFolders(type);
    const isConfigured2 = PromptsConfig.getLocationsValue(this.configService, type) !== void 0;
    const allFolders = isConfigured2 ? configuredLocations : defaultFolders;
    const absoluteLocations = await this.toAbsoluteLocations(type, allFolders, defaultFolders);
    if (type === "agent" /* agent */ || type === "instructions" /* instructions */ || type === "prompt" /* prompt */) {
      absoluteLocations.push(this.userDataFolder);
    }
    return absoluteLocations;
  }
  /**
   * Deduplicates source folders by URI.
   */
  dedupeSourceFolders(folders) {
    const seen = new ResourceSet();
    const result = [];
    for (const folder of folders) {
      if (!seen.has(folder.uri)) {
        seen.add(folder.uri);
        result.push(folder);
      }
    }
    return result;
  }
  /**
   * Converts locations defined in `settings` to absolute filesystem path URIs with metadata.
   * This conversion is needed because locations in settings can be relative,
   * hence we need to resolve them based on the current workspace folders.
   * If userHome is provided, paths starting with `~` will be expanded. Otherwise these paths are ignored.
   * Preserves the type and location properties from the source folder definitions.
   */
  async toAbsoluteLocations(type, configuredLocations, defaultLocations, root) {
    const result = [];
    const seen = new ResourceSet();
    const userHome = await this.pathService.userHome();
    const rootFolders = await this.getWorkspaceFolderRoots(this.configService.getValue(PromptsConfig.USE_CUSTOMIZATIONS_IN_PARENT_REPOS) === true, void 0, root);
    const defaultPaths = new Set(defaultLocations?.map((loc) => loc.path));
    const validLocations = configuredLocations.filter((sourceFolder) => {
      if (type === "instructions" /* instructions */ || type === "prompt" /* prompt */) {
        const path = sourceFolder.path;
        if (hasGlobPattern(path)) {
          if (type === "prompt" /* prompt */) {
            this.logService.warn(`[Deprecated] Glob patterns (* and **) in prompt file locations are deprecated: "${path}". Consider using explicit paths instead.`);
          } else if (type === "instructions" /* instructions */) {
            this.logService.info(`Glob patterns (* and **) detected in instruction file location: "${path}". Consider using explicit paths for better performance.`);
          }
        }
        return true;
      }
      const configuredLocation = sourceFolder.path;
      if (!isValidPromptFolderPath(configuredLocation)) {
        this.logService.warn(`Skipping invalid path (glob patterns and absolute paths not supported): ${configuredLocation}`);
        return false;
      }
      return true;
    });
    for (const sourceFolder of validLocations) {
      const configuredLocation = sourceFolder.path;
      const isDefault = defaultPaths?.has(configuredLocation);
      try {
        if (isTildePath(configuredLocation)) {
          const uri4 = joinPath(userHome, configuredLocation.substring(2));
          if (!seen.has(uri4)) {
            seen.add(uri4);
            const { searchRoot, filePattern: filePattern2 } = resolveSearchLocation(type, uri4);
            result.push({ uri: uri4, searchRoot, filePattern: filePattern2, source: sourceFolder.source, storage: sourceFolder.storage, displayPath: configuredLocation, isDefault });
          }
          continue;
        }
        if (isAbsolute(configuredLocation)) {
          let uri4 = URI.file(configuredLocation);
          const remoteAuthority = this.environmentService.remoteAuthority;
          if (remoteAuthority) {
            uri4 = uri4.with({ scheme: Schemas.vscodeRemote, authority: remoteAuthority });
          }
          if (!seen.has(uri4)) {
            seen.add(uri4);
            const { searchRoot, filePattern: filePattern2 } = resolveSearchLocation(type, uri4);
            result.push({ uri: uri4, searchRoot, filePattern: filePattern2, source: sourceFolder.source, storage: sourceFolder.storage, displayPath: configuredLocation, isDefault });
          }
        } else {
          for (const folder of rootFolders) {
            const absolutePath2 = joinPath(folder, configuredLocation);
            if (!seen.has(absolutePath2)) {
              seen.add(absolutePath2);
              const { searchRoot, filePattern: filePattern2 } = resolveSearchLocation(type, absolutePath2);
              result.push({ uri: absolutePath2, searchRoot, filePattern: filePattern2, source: sourceFolder.source, storage: sourceFolder.storage, displayPath: configuredLocation, isDefault });
            }
          }
        }
      } catch (error) {
        this.logService.error(`Failed to resolve prompt file location: ${configuredLocation}`, error);
      }
    }
    return result;
  }
  /**
   * Uses the file service to resolve the provided location and return either the file at the location of files in the directory.
   * For instruction folders, this searches recursively (up to {@link MAX_INSTRUCTIONS_RECURSION_DEPTH} levels deep) provided
   * the location is not a workspace folder root and does not contain wildcards, to support subdirectories while avoiding
   * accidentally broad traversal.
   */
  async resolveFilesAtLocation(location2, type, token, depth = 0, root) {
    if (type === "skill" /* skill */) {
      return this.findAgentSkillsInFolder(location2, token);
    }
    const isWorkspaceRoot = depth === 0 && (root ? isEqual2(root, location2) : this.getWorkspaceFolders().some((f) => isEqual2(f.uri, location2)));
    const recursive = type === "instructions" /* instructions */ && !isWorkspaceRoot && !hasGlobPattern(location2.path) && depth < MAX_INSTRUCTIONS_RECURSION_DEPTH;
    try {
      const info = await this.fileService.resolve(location2);
      if (token.isCancellationRequested) {
        return [];
      }
      if (info.isFile) {
        return [info.resource];
      } else if (info.isDirectory && info.children) {
        const result = [];
        for (const child of info.children) {
          if (child.isFile) {
            result.push(child.resource);
          } else if (recursive && child.isDirectory) {
            const subFiles = await this.resolveFilesAtLocation(child.resource, type, token, depth + 1, root);
            result.push(...subFiles);
          }
        }
        return result;
      }
    } catch (e4) {
      if (e4 instanceof FileOperationError && e4.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
      } else {
        this.logService.error(`Failed to resolve files at location: ${location2.toString()}`, e4);
      }
    }
    return [];
  }
  /**
   * Uses the search service to find all files at the provided location.
   * Requires a FileSearchProvider to be available for the folder's scheme.
   */
  async searchFilesInLocation(folder, filePattern2, token) {
    if (!this.searchService.schemeHasFileSearchProvider(folder.scheme)) {
      this.logService.warn(`[PromptFilesLocator] No FileSearchProvider available for scheme '${folder.scheme}'. Cannot search for pattern '${filePattern2}' in ${folder.toString()}`);
      return [];
    }
    const disregardIgnoreFiles = this.configService.getValue("explorer.excludeGitIgnore");
    const workspaceRoot = this.getWorkspaceFolder(folder);
    const getExcludePattern = (folder2) => getExcludes(this.configService.getValue({ resource: folder2 })) || {};
    const searchOptions = {
      folderQueries: [{ folder, disregardIgnoreFiles }],
      type: 1 /* File */,
      shouldGlobMatchFilePattern: true,
      excludePattern: workspaceRoot ? getExcludePattern(workspaceRoot.uri) : void 0,
      ignoreGlobCase: true,
      sortByScore: true,
      filePattern: filePattern2
    };
    try {
      const searchResult = await this.searchService.fileSearch(searchOptions, token);
      if (token.isCancellationRequested) {
        return [];
      }
      return searchResult.results.map((r2) => r2.resource);
    } catch (e4) {
      if (!isCancellationError(e4)) {
        throw e4;
      }
    }
    return [];
  }
  /**
   * Gets list of `AGENTS.md` files anywhere in the workspace.
   */
  async findAgentMDsInWorkspace(token) {
    const result = await Promise.all(this.getWorkspaceFolders().map((folder) => this.findAgentMDsInFolder(folder.uri, token)));
    return result.flat(1);
  }
  async findAgentMDsInFolder(folder, token) {
    if (this.searchService.schemeHasFileSearchProvider(folder.scheme)) {
      const disregardIgnoreFiles = this.configService.getValue("explorer.excludeGitIgnore");
      const getExcludePattern = (folder2) => getExcludes(this.configService.getValue({ resource: folder2 })) || {};
      const searchOptions = {
        folderQueries: [{ folder, disregardIgnoreFiles }],
        type: 1 /* File */,
        shouldGlobMatchFilePattern: true,
        excludePattern: getExcludePattern(folder),
        filePattern: "**/AGENTS.md",
        ignoreGlobCase: true
      };
      try {
        const searchResult = await this.searchService.fileSearch(searchOptions, token);
        if (token.isCancellationRequested) {
          return [];
        }
        const results = [];
        for (const r2 of searchResult.results) {
          const realPath = void 0;
          results.push({ uri: r2.resource, realPath, type: "agentsMd" /* agentsMd */ });
        }
        return results;
      } catch (e4) {
        if (!isCancellationError(e4)) {
          throw e4;
        }
      }
      return [];
    } else {
      return this.findAgentMDsUsingFileService(folder, token);
    }
  }
  /**
   * Recursively traverses a folder using the file service to find AGENTS.md files.
   * This is used as a fallback when no FileSearchProvider is available for the scheme.
   */
  async findAgentMDsUsingFileService(folder, token) {
    const result = [];
    const agentsMdFileName = "agents.md";
    const traverse = async (uri4) => {
      if (token.isCancellationRequested) {
        return;
      }
      try {
        const stat = await this.fileService.resolve(uri4);
        if (stat.isFile && stat.name.toLowerCase() === agentsMdFileName) {
          const realPath = stat.isSymbolicLink ? await this.fileService.realpath(stat.resource) : void 0;
          result.push({ uri: stat.resource, realPath, type: "agentsMd" /* agentsMd */ });
        } else if (stat.isDirectory && stat.children) {
          for (const child of stat.children) {
            await traverse(child.resource);
          }
        }
      } catch (error) {
        this.logService.trace(`[PromptFilesLocator] Error traversing ${uri4.toString()}: ${error}`);
      }
    };
    await traverse(folder);
    return result;
  }
  async findFilesInRoots(roots, folder, paths, token, result = []) {
    const toResolve = roots.map((root) => ({ resource: folder !== void 0 ? joinPath(root, folder) : root }));
    const resolvedRoots = await this.fileService.resolveAll(toResolve);
    if (token.isCancellationRequested) {
      return result;
    }
    for (const root of resolvedRoots) {
      if (root.success && root.stat?.children) {
        for (const child of root.stat.children) {
          if (child.isFile) {
            const matchingPath = paths.find((p) => equalsIgnoreCase(p.fileName, child.name));
            if (matchingPath) {
              const realPath = child.isSymbolicLink ? await this.fileService.realpath(child.resource) : void 0;
              result.push({ uri: child.resource, realPath, type: matchingPath.type });
            }
          }
        }
      }
    }
    return result;
  }
  getAgentFileURIFromModeFile(oldURI) {
    if (oldURI.path.endsWith(LEGACY_MODE_FILE_EXTENSION)) {
      let newLocation;
      const workspaceFolder = this.getWorkspaceFolder(oldURI);
      if (workspaceFolder) {
        newLocation = joinPath(workspaceFolder.uri, AGENTS_SOURCE_FOLDER, getCleanPromptName(oldURI) + AGENT_FILE_EXTENSION);
      } else if (isEqualOrParent2(oldURI, this.userDataService.currentProfile.promptsHome)) {
        newLocation = joinPath(this.userDataService.currentProfile.promptsHome, getCleanPromptName(oldURI) + AGENT_FILE_EXTENSION);
      }
      return newLocation;
    }
    return void 0;
  }
  async findAgentSkillsInFolder(uri4, token) {
    try {
      const result = [];
      const stat = await this.fileService.resolve(uri4);
      if (stat.isDirectory && stat.children) {
        for (const child of stat.children) {
          try {
            if (token.isCancellationRequested) {
              return [];
            }
            if (child.isDirectory) {
              const skillFile = joinPath(child.resource, SKILL_FILENAME);
              const skillStat = await this.fileService.resolve(skillFile);
              if (skillStat.isFile) {
                result.push(skillStat.resource);
              }
            }
          } catch (error) {
          }
        }
      }
      return result;
    } catch (e4) {
      if (!isCancellationError(e4)) {
        this.logService.trace(`[PromptFilesLocator] Error searching for skills in ${uri4.toString()}: ${e4}`);
      }
      return [];
    }
  }
  /**
   * Searches for skills in all configured locations.
   */
  async findAgentSkills(token) {
    const configuredLocations = this.getPromptSourceFolders("skill" /* skill */);
    const absoluteLocations = await this.toAbsoluteLocations("skill" /* skill */, configuredLocations);
    const allResults = [];
    for (const { uri: uri4, source, storage } of absoluteLocations) {
      if (token.isCancellationRequested) {
        return [];
      }
      const results = await this.findAgentSkillsInFolder(uri4, token);
      for (const skillUri of results) {
        allResults.push({ uri: skillUri, source, storage, type: "skill" /* skill */ });
      }
    }
    return allResults;
  }
};

PromptFilesLocator = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, ISearchService),
  __decorateParam(5, IUserDataProfileService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IPathService),
  __decorateParam(8, IWorkspaceTrustManagementService)
], PromptFilesLocator);

function hasGlobPattern(path) {
  return path.includes("*");
}

function isValidGlob(pattern) {
  let squareBrackets = false;
  let squareBracketsCount = 0;
  let curlyBrackets = false;
  let curlyBracketsCount = 0;
  let previousCharacter;
  for (const char of pattern) {
    if (previousCharacter === "\\") {
      previousCharacter = char;
      continue;
    }
    if (char === "*") {
      return true;
    }
    if (char === "?") {
      return true;
    }
    if (char === "[") {
      squareBrackets = true;
      squareBracketsCount++;
      previousCharacter = char;
      continue;
    }
    if (char === "]") {
      squareBrackets = true;
      squareBracketsCount--;
      previousCharacter = char;
      continue;
    }
    if (char === "{") {
      curlyBrackets = true;
      curlyBracketsCount++;
      continue;
    }
    if (char === "}") {
      curlyBrackets = true;
      curlyBracketsCount--;
      previousCharacter = char;
      continue;
    }
    previousCharacter = char;
  }
  if (squareBrackets && squareBracketsCount === 0) {
    return true;
  }
  if (curlyBrackets && curlyBracketsCount === 0) {
    return true;
  }
  return false;
}

function resolveSearchLocation(type, location2) {
  if (type !== "instructions" /* instructions */ && type !== "prompt" /* prompt */) {
    return { searchRoot: location2 };
  }
  const segments = location2.path.split("/");
  let i2 = 0;
  while (i2 < segments.length && isValidGlob(segments[i2]) === false) {
    i2++;
  }
  if (i2 === segments.length) {
    return { searchRoot: location2 };
  }
  const parent = location2.with({ path: segments.slice(0, i2).join("/") });
  if (i2 === segments.length - 1 && segments[i2] === "*" || segments[i2] === ``) {
    return { searchRoot: parent };
  }
  return {
    searchRoot: parent,
    filePattern: segments.slice(i2).join("/")
  };
}

var VALID_PROMPT_FOLDER_PATTERN = "^(?![A-Za-z]:[\\\\/])(?!/)(?!~(?!/))(?!.*\\\\)(?!.*[*?\\[\\]{}]).*\\S.*$";

var VALID_PROMPT_FOLDER_REGEX = new RegExp(VALID_PROMPT_FOLDER_PATTERN);

function isValidPromptFolderPath(path) {
  return VALID_PROMPT_FOLDER_REGEX.test(path);
}
export { hasGlobPattern, isValidGlob, resolveSearchLocation, isValidPromptFolderPath, MAX_INSTRUCTIONS_RECURSION_DEPTH, PromptFilesLocator, VALID_PROMPT_FOLDER_PATTERN, VALID_PROMPT_FOLDER_REGEX };
