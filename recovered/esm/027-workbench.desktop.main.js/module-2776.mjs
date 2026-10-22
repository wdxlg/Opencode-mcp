// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatRepoInfo.ts
import { detectEncodingFromBuffer } from "./module-1123.mjs";
import { FileOperationError } from "./module-0269.mjs";
import { linesDiffComputers } from "./module-0196.mjs";
import { relativePath } from "./module-0034.mjs";
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { ISCMService } from "./module-1080.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/chatRepoInfo.ts
var MAX_CHANGES = 100;

var MAX_DIFFS_SIZE_BYTES = 900 * 1024;

var MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

var RemoteMatcher = /^\s*url\s*=\s*(.+\S)\s*$/mg;

function getRawRemotes(text2) {
  const remotes = [];
  let match2;
  while (match2 = RemoteMatcher.exec(text2)) {
    remotes.push(match2[1]);
  }
  return remotes;
}

function getRemoteHost(remoteUrl) {
  try {
    const url = new URL(remoteUrl);
    return url.hostname.toLowerCase();
  } catch {
    const atIndex = remoteUrl.lastIndexOf("@");
    const hostAndPath = atIndex !== -1 ? remoteUrl.slice(atIndex + 1) : remoteUrl;
    const colonIndex = hostAndPath.indexOf(":");
    if (colonIndex !== -1) {
      const host = hostAndPath.slice(0, colonIndex);
      return host ? host.toLowerCase() : void 0;
    }
    const slashIndex = hostAndPath.indexOf("/");
    if (slashIndex !== -1) {
      const host = hostAndPath.slice(0, slashIndex);
      return host ? host.toLowerCase() : void 0;
    }
    return void 0;
  }
}

function determineChangeType(resource, groupId) {
  const contextValue = resource.contextValue?.toLowerCase() ?? "";
  const groupIdLower = groupId.toLowerCase();
  if (contextValue.includes("untracked") || contextValue.includes("add")) {
    return "added";
  }
  if (contextValue.includes("delete")) {
    return "deleted";
  }
  if (contextValue.includes("rename")) {
    return "renamed";
  }
  if (groupIdLower.includes("untracked")) {
    return "added";
  }
  if (resource.decorations.strikeThrough) {
    return "deleted";
  }
  if (!resource.multiDiffEditorOriginalUri) {
    return "added";
  }
  return "modified";
}

async function generateUnifiedDiff(fileService, relPath, originalUri, modifiedUri, changeType) {
  try {
    let originalContent = "";
    let modifiedContent = "";
    if (originalUri && changeType !== "added") {
      try {
        const originalFile = await fileService.readFile(originalUri, { limits: { size: MAX_FILE_SIZE_BYTES } });
        const detected = detectEncodingFromBuffer({ buffer: originalFile.value, bytesRead: originalFile.value.byteLength });
        if (detected.seemsBinary) {
          return void 0;
        }
        originalContent = originalFile.value.toString();
      } catch (e) {
        if (e instanceof FileOperationError && e.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
          return void 0;
        }
        if (changeType === "modified") {
          return void 0;
        }
      }
    }
    if (changeType !== "deleted") {
      try {
        const modifiedFile = await fileService.readFile(modifiedUri, { limits: { size: MAX_FILE_SIZE_BYTES } });
        const detected = detectEncodingFromBuffer({ buffer: modifiedFile.value, bytesRead: modifiedFile.value.byteLength });
        if (detected.seemsBinary) {
          return void 0;
        }
        modifiedContent = modifiedFile.value.toString();
      } catch (e) {
        if (e instanceof FileOperationError && e.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
          return void 0;
        }
        return void 0;
      }
    }
    const originalLines = originalContent.split("\n");
    const modifiedLines = modifiedContent.split("\n");
    const originalEndsWithNewline = originalContent.length > 0 && originalContent.endsWith("\n");
    const modifiedEndsWithNewline = modifiedContent.length > 0 && modifiedContent.endsWith("\n");
    if (originalEndsWithNewline && originalLines.length > 0 && originalLines[originalLines.length - 1] === "") {
      originalLines.pop();
    }
    if (modifiedEndsWithNewline && modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] === "") {
      modifiedLines.pop();
    }
    const diffLines = [];
    const aPath = changeType === "added" ? "/dev/null" : `a/${relPath}`;
    const bPath = changeType === "deleted" ? "/dev/null" : `b/${relPath}`;
    diffLines.push(`--- ${aPath}`);
    diffLines.push(`+++ ${bPath}`);
    if (changeType === "added") {
      if (modifiedLines.length > 0) {
        diffLines.push(`@@ -0,0 +1,${modifiedLines.length} @@`);
        for (const line of modifiedLines) {
          diffLines.push(`+${line}`);
        }
        if (!modifiedEndsWithNewline) {
          diffLines.push("\\ No newline at end of file");
        }
      }
    } else if (changeType === "deleted") {
      if (originalLines.length > 0) {
        diffLines.push(`@@ -1,${originalLines.length} +0,0 @@`);
        for (const line of originalLines) {
          diffLines.push(`-${line}`);
        }
        if (!originalEndsWithNewline) {
          diffLines.push("\\ No newline at end of file");
        }
      }
    } else {
      const hunks = computeDiffHunks(originalLines, modifiedLines, originalEndsWithNewline, modifiedEndsWithNewline);
      for (const hunk of hunks) {
        diffLines.push(hunk);
      }
    }
    return diffLines.join("\n");
  } catch {
    return void 0;
  }
}

function computeDiffHunks(originalLines, modifiedLines, originalEndsWithNewline, modifiedEndsWithNewline) {
  const contextSize = 3;
  const result = [];
  const diffComputer = linesDiffComputers.getDefault();
  const diffResult = diffComputer.computeDiff(originalLines, modifiedLines, {
    ignoreTrimWhitespace: false,
    maxComputationTimeMs: 1e3,
    computeMoves: false
  });
  if (diffResult.changes.length === 0) {
    return result;
  }
  const hunkGroups = [];
  let currentGroup = [];
  for (const change of diffResult.changes) {
    if (currentGroup.length === 0) {
      currentGroup.push(change);
    } else {
      const lastChange = currentGroup[currentGroup.length - 1];
      const lastContextEnd = lastChange.original.endLineNumberExclusive - 1 + contextSize;
      const currentContextStart = change.original.startLineNumber - contextSize;
      if (currentContextStart <= lastContextEnd + 1) {
        currentGroup.push(change);
      } else {
        hunkGroups.push(currentGroup);
        currentGroup = [change];
      }
    }
  }
  if (currentGroup.length > 0) {
    hunkGroups.push(currentGroup);
  }
  for (const group2 of hunkGroups) {
    const firstChange = group2[0];
    const lastChange = group2[group2.length - 1];
    const hunkOrigStart = Math.max(1, firstChange.original.startLineNumber - contextSize);
    const hunkOrigEnd = Math.min(originalLines.length, lastChange.original.endLineNumberExclusive - 1 + contextSize);
    const hunkModStart = Math.max(1, firstChange.modified.startLineNumber - contextSize);
    const hunkLines = [];
    let lastOriginalLineIndex = -1;
    let lastModifiedLineIndex = -1;
    let origLineNum = hunkOrigStart;
    let origCount = 0;
    let modCount = 0;
    for (const change of group2) {
      const origStart = change.original.startLineNumber;
      const origEnd = change.original.endLineNumberExclusive;
      const modStart = change.modified.startLineNumber;
      const modEnd = change.modified.endLineNumberExclusive;
      while (origLineNum < origStart) {
        const idx = hunkLines.length;
        hunkLines.push(` ${originalLines[origLineNum - 1]}`);
        if (origLineNum === originalLines.length) {
          lastOriginalLineIndex = idx;
        }
        const modLineNum = hunkModStart + modCount;
        if (modLineNum === modifiedLines.length) {
          lastModifiedLineIndex = idx;
        }
        origLineNum++;
        origCount++;
        modCount++;
      }
      for (let i2 = origStart; i2 < origEnd; i2++) {
        const idx = hunkLines.length;
        hunkLines.push(`-${originalLines[i2 - 1]}`);
        if (i2 === originalLines.length) {
          lastOriginalLineIndex = idx;
        }
        origLineNum++;
        origCount++;
      }
      for (let i2 = modStart; i2 < modEnd; i2++) {
        const idx = hunkLines.length;
        hunkLines.push(`+${modifiedLines[i2 - 1]}`);
        if (i2 === modifiedLines.length) {
          lastModifiedLineIndex = idx;
        }
        modCount++;
      }
    }
    while (origLineNum <= hunkOrigEnd) {
      const idx = hunkLines.length;
      hunkLines.push(` ${originalLines[origLineNum - 1]}`);
      if (origLineNum === originalLines.length) {
        lastOriginalLineIndex = idx;
      }
      const modLineNum = hunkModStart + modCount;
      if (modLineNum === modifiedLines.length) {
        lastModifiedLineIndex = idx;
      }
      origLineNum++;
      origCount++;
      modCount++;
    }
    result.push(`@@ -${hunkOrigStart},${origCount} +${hunkModStart},${modCount} @@`);
    for (let i2 = 0; i2 < hunkLines.length; i2++) {
      result.push(hunkLines[i2]);
      const isLastOriginal = i2 === lastOriginalLineIndex;
      const isLastModified = i2 === lastModifiedLineIndex;
      if (isLastOriginal && isLastModified) {
        if (!originalEndsWithNewline || !modifiedEndsWithNewline) {
          result.push("\\ No newline at end of file");
        }
      } else if (isLastOriginal && !originalEndsWithNewline) {
        result.push("\\ No newline at end of file");
      } else if (isLastModified && !modifiedEndsWithNewline) {
        result.push("\\ No newline at end of file");
      }
    }
  }
  return result;
}

function captureRepoMetadata(scmService) {
  const repositories = [...scmService.repositories];
  if (repositories.length === 0) {
    return void 0;
  }
  const repository = repositories[0];
  const rootUri = repository.provider.rootUri;
  if (!rootUri) {
    return void 0;
  }
  let localBranch;
  let localHeadCommit;
  let remoteTrackingBranch;
  let remoteHeadCommit;
  let remoteBaseBranch;
  const historyProvider = repository.provider.historyProvider?.get();
  if (historyProvider) {
    const historyItemRef = historyProvider.historyItemRef.get();
    localBranch = historyItemRef?.name;
    localHeadCommit = historyItemRef?.revision;
    const historyItemRemoteRef = historyProvider.historyItemRemoteRef.get();
    if (historyItemRemoteRef) {
      remoteTrackingBranch = historyItemRemoteRef.name;
      remoteHeadCommit = historyItemRemoteRef.revision;
    }
    const historyItemBaseRef = historyProvider.historyItemBaseRef.get();
    if (historyItemBaseRef) {
      remoteBaseBranch = historyItemBaseRef.name;
    }
  }
  let workspaceType;
  let syncStatus;
  if (remoteTrackingBranch || remoteHeadCommit || remoteBaseBranch) {
    workspaceType = "remote-git";
    if (!remoteTrackingBranch) {
      syncStatus = "unpublished";
    } else if (localHeadCommit && remoteHeadCommit && localHeadCommit === remoteHeadCommit) {
      syncStatus = "synced";
    } else {
      syncStatus = "unpushed";
    }
  } else {
    workspaceType = "local-git";
    syncStatus = "local-only";
  }
  return {
    workspaceType,
    syncStatus,
    localBranch,
    remoteTrackingBranch,
    remoteBaseBranch,
    localHeadCommit,
    remoteHeadCommit,
    diffsStatus: "notCaptured"
  };
}

async function captureRepoInfo(scmService, fileService) {
  const repositories = [...scmService.repositories];
  if (repositories.length === 0) {
    return void 0;
  }
  const repository = repositories[0];
  const rootUri = repository.provider.rootUri;
  if (!rootUri) {
    return void 0;
  }
  let hasGit = false;
  try {
    const gitDirUri = rootUri.with({ path: `${rootUri.path}/.git` });
    hasGit = await fileService.exists(gitDirUri);
  } catch {
  }
  if (!hasGit) {
    return {
      workspaceType: "plain-folder",
      syncStatus: "no-git",
      diffs: void 0
    };
  }
  let remoteUrl;
  try {
    const gitConfigUri = rootUri.with({ path: `${rootUri.path}/.git/config` });
    const exists = await fileService.exists(gitConfigUri);
    if (exists) {
      const content2 = await fileService.readFile(gitConfigUri);
      const remotes = getRawRemotes(content2.value.toString());
      remoteUrl = remotes[0];
    }
  } catch {
  }
  let localBranch;
  let localHeadCommit;
  let remoteTrackingBranch;
  let remoteHeadCommit;
  let remoteBaseBranch;
  const historyProvider = repository.provider.historyProvider?.get();
  if (historyProvider) {
    const historyItemRef = historyProvider.historyItemRef.get();
    localBranch = historyItemRef?.name;
    localHeadCommit = historyItemRef?.revision;
    const historyItemRemoteRef = historyProvider.historyItemRemoteRef.get();
    if (historyItemRemoteRef) {
      remoteTrackingBranch = historyItemRemoteRef.name;
      remoteHeadCommit = historyItemRemoteRef.revision;
    }
    const historyItemBaseRef = historyProvider.historyItemBaseRef.get();
    if (historyItemBaseRef) {
      remoteBaseBranch = historyItemBaseRef.name;
    }
  }
  let workspaceType;
  let syncStatus;
  if (!remoteUrl) {
    workspaceType = "local-git";
    syncStatus = "local-only";
  } else {
    workspaceType = "remote-git";
    if (!remoteTrackingBranch) {
      syncStatus = "unpublished";
    } else if (localHeadCommit === remoteHeadCommit) {
      syncStatus = "synced";
    } else {
      syncStatus = "unpushed";
    }
  }
  let remoteVendor;
  if (remoteUrl) {
    const host = getRemoteHost(remoteUrl);
    if (host === "github.com") {
      remoteVendor = "github";
    } else if (host === "dev.azure.com" || host && host.endsWith(".visualstudio.com")) {
      remoteVendor = "ado";
    } else {
      remoteVendor = "other";
    }
  }
  let totalChangeCount = 0;
  for (const group2 of repository.provider.groups) {
    totalChangeCount += group2.resources.length;
  }
  const baseRepoData = {
    workspaceType,
    syncStatus,
    remoteUrl,
    remoteVendor,
    localBranch,
    remoteTrackingBranch,
    remoteBaseBranch,
    localHeadCommit,
    remoteHeadCommit
  };
  if (totalChangeCount === 0) {
    return {
      ...baseRepoData,
      diffs: void 0,
      diffsStatus: "noChanges",
      changedFileCount: 0
    };
  }
  if (totalChangeCount > MAX_CHANGES) {
    return {
      ...baseRepoData,
      diffs: void 0,
      diffsStatus: "tooManyChanges",
      changedFileCount: totalChangeCount
    };
  }
  const diffs = [];
  const diffPromises = [];
  for (const group2 of repository.provider.groups) {
    for (const resource of group2.resources) {
      const relPath = relativePath(rootUri, resource.sourceUri) ?? resource.sourceUri.path;
      const changeType = determineChangeType(resource, group2.id);
      const diffPromise = (async () => {
        const unifiedDiff = await generateUnifiedDiff(
          fileService,
          relPath,
          resource.multiDiffEditorOriginalUri,
          resource.sourceUri,
          changeType
        );
        return {
          relativePath: relPath,
          changeType,
          status: group2.label || group2.id,
          unifiedDiff
        };
      })();
      diffPromises.push(diffPromise);
    }
  }
  const generatedDiffs = await Promise.all(diffPromises);
  for (const diff4 of generatedDiffs) {
    if (diff4) {
      diffs.push(diff4);
    }
  }
  const diffsJson = JSON.stringify(diffs);
  const diffsSizeBytes = new TextEncoder().encode(diffsJson).length;
  if (diffsSizeBytes > MAX_DIFFS_SIZE_BYTES) {
    return {
      ...baseRepoData,
      diffs: void 0,
      diffsStatus: "tooLarge",
      changedFileCount: totalChangeCount
    };
  }
  return {
    ...baseRepoData,
    diffs,
    diffsStatus: "included",
    changedFileCount: totalChangeCount
  };
}

var ChatRepoInfoContribution = class extends Disposable {
  constructor(chatService, chatEntitlementService, scmService, logService, configurationService) {
    super();
    this.chatService = chatService;
    this.chatEntitlementService = chatEntitlementService;
    this.scmService = scmService;
    this.logService = logService;
    this.configurationService = configurationService;
    this._configurationRegistered = false;
    this.registerConfigurationIfInternal();
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => {
      this.registerConfigurationIfInternal();
    }));
    this._register(this.chatService.onDidSubmitRequest(({ chatSessionResource }) => {
      const model = this.chatService.getSession(chatSessionResource);
      if (!model) {
        return;
      }
      this.captureAndSetRepoMetadata(model);
    }));
  }
  static {
    this.ID = "workbench.contrib.chatRepoInfo";
  }
  registerConfigurationIfInternal() {
    if (this._configurationRegistered) {
      return;
    }
    if (!this.chatEntitlementService.isInternal) {
      return;
    }
    const registry4 = Registry.as(Extensions4.Configuration);
    registry4.registerConfiguration({
      id: "chatRepoInfo",
      title: localize(11079, null),
      type: "object",
      properties: {
        ["chat.repoInfo.enabled" /* RepoInfoEnabled */]: {
          type: "boolean",
          description: localize(11078, null),
          default: false
        }
      }
    });
    this._configurationRegistered = true;
    this.logService.debug("[ChatRepoInfo] Configuration registered for internal user");
  }
  /**
   * Captures lightweight metadata (branch, commit, remote refs) on first message.
   * Synchronous, no file I/O. Reads only from SCM provider observables.
   */
  captureAndSetRepoMetadata(model) {
    if (!this.chatEntitlementService.isInternal) {
      return;
    }
    if (!this.configurationService.getValue("chat.repoInfo.enabled" /* RepoInfoEnabled */)) {
      return;
    }
    if (model.repoData) {
      return;
    }
    try {
      const metadata = captureRepoMetadata(this.scmService);
      if (metadata) {
        model.setRepoData(metadata);
        if (!metadata.localHeadCommit) {
          this.logService.warn("[ChatRepoInfo] Captured repo metadata without commit hash - git history may not be ready");
        }
      } else {
        this.logService.debug("[ChatRepoInfo] No SCM repository available for chat session");
      }
    } catch (error) {
      this.logService.warn("[ChatRepoInfo] Failed to capture repo metadata:", error);
    }
  }
};

ChatRepoInfoContribution = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatEntitlementService),
  __decorateParam(2, ISCMService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IConfigurationService)
], ChatRepoInfoContribution);
export { getRawRemotes, getRemoteHost, determineChangeType, generateUnifiedDiff, computeDiffHunks, captureRepoMetadata, captureRepoInfo, MAX_CHANGES, MAX_DIFFS_SIZE_BYTES, MAX_FILE_SIZE_BYTES, RemoteMatcher, ChatRepoInfoContribution };
