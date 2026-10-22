// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessionsChangesets.ts
import { derived, derivedOpts } from "./module-0054.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitService } from "./module-1485.mjs";
import { BRANCH_CHANGES_CHANGESET_ID, gitHubInfoEqual, sessionFileChangesEqual } from "./module-1767.mjs";
import { toPRContentUri } from "./module-3606.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { AgentSessionProviders } from "./module-0983.mjs";
import { constObservable } from "./module-0061.mjs";
import { localize } from "./module-0001.mjs";
import { ObservablePromise } from "./module-0055.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessionsChangesets.ts
var GitRepositoryChangesetResolver = class {
  constructor(workspace, _gitService) {
    this._gitService = _gitService;
    this._repositoryUriObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      const gitRepository = workspace.read(reader)?.folders[0].gitRepository;
      return gitRepository?.workTreeUri ?? gitRepository?.uri;
    });
  }
  async resolve(firstCheckpointRef, lastCheckpointRef) {
    const repositoryUri = this._repositoryUriObs.get();
    if (!repositoryUri) {
      return [];
    }
    const repository = await this._gitService.openRepository(repositoryUri);
    const ref = lastCheckpointRef ? `${firstCheckpointRef}..${lastCheckpointRef}` : firstCheckpointRef;
    const changes = await repository?.diffBetweenWithStats2(ref) ?? [];
    return toIChatSessionFileChange2(changes, firstCheckpointRef, lastCheckpointRef);
  }
};

GitRepositoryChangesetResolver = __decorateClass([
  __decorateParam(1, IGitService)
], GitRepositoryChangesetResolver);

var GitHubRepositoryChangesetResolver = class {
  constructor(workspace, _gitHubService) {
    this._gitHubService = _gitHubService;
    this._gitHubInfoObs = derivedOpts({ equalsFn: gitHubInfoEqual }, (reader) => {
      const gitRepository = workspace.read(reader)?.folders[0].gitRepository;
      return gitRepository?.gitHubInfo.read(reader);
    });
  }
  async resolve(firstCheckpointRef, lastCheckpointRef) {
    const gitHubInfo = this._gitHubInfoObs.get();
    if (!gitHubInfo || !gitHubInfo.pullRequest?.number) {
      return void 0;
    }
    const params = {
      owner: gitHubInfo.owner,
      repo: gitHubInfo.repo,
      prNumber: gitHubInfo.pullRequest.number
    };
    const changes = await this._gitHubService.getChangedFiles(params.owner, params.repo, firstCheckpointRef, lastCheckpointRef);
    return changes.map((change) => {
      const uri4 = toPRContentUri(change.filename, {
        ...params,
        commitSha: lastCheckpointRef,
        status: change.status,
        isBase: false
      });
      const originalUri = change.status !== "added" ? toPRContentUri(change.previous_filename || change.filename, {
        ...params,
        commitSha: firstCheckpointRef,
        previousFileName: change.previous_filename,
        status: change.status,
        isBase: true
      }) : void 0;
      const modifiedUri = change.status !== "removed" ? uri4 : void 0;
      return {
        uri: uri4,
        originalUri,
        modifiedUri,
        insertions: change.additions,
        deletions: change.deletions
      };
    });
  }
};

GitHubRepositoryChangesetResolver = __decorateClass([
  __decorateParam(1, IGitHubService)
], GitHubRepositoryChangesetResolver);

function createChangesets2(sessionType, workspaceObs, chatsObs, instantiationService) {
  const changesetResolver = sessionType === AgentSessionProviders.Cloud ? instantiationService.createInstance(GitHubRepositoryChangesetResolver, workspaceObs) : instantiationService.createInstance(GitRepositoryChangesetResolver, workspaceObs);
  const changesets = [new BranchChangesChangeset(workspaceObs, chatsObs)];
  if (sessionType !== AgentSessionProviders.Cloud) {
    changesets.push(new UncommittedChangesChangeset(workspaceObs, chatsObs, changesetResolver));
  }
  changesets.push(new AllChangesChangeset(chatsObs, changesetResolver));
  changesets.push(new LastTurnChangesChangeset(chatsObs, changesetResolver));
  return constObservable(changesets);
}

var AbstractChangeset = class {
  constructor(_chats) {
    this._chats = _chats;
    this.operations = constObservable([]);
  }
  async invokeOperation(_operationId, _target) {
  }
};

var BranchChangesChangeset = class _BranchChangesChangeset extends AbstractChangeset {
  constructor(workspaceObs, chatsObs) {
    super(chatsObs);
    this.id = _BranchChangesChangeset.ID;
    this.label = localize(5041, null);
    this.category = localize(5042, null);
    this.isLoadingChanges = constObservable(false);
    this.modifiedCheckpointRef = constObservable(void 0);
    const gitRepository = workspaceObs.get()?.folders[0].gitRepository;
    const branchName = gitRepository?.branchName;
    const baseBranchName = gitRepository?.baseBranchName;
    this.description = branchName && baseBranchName ? `${branchName} \u2192 ${baseBranchName}` : branchName;
    this.originalCheckpointRef = derived((reader) => {
      return chatsObs.read(reader)[0]?.checkpoints.read(reader)?.firstCheckpointRef;
    });
    const isArchivedObs = derived((reader) => chatsObs.read(reader)[0]?.isArchived.read(reader) === true);
    this.isDefault = derived((reader) => !isArchivedObs.read(reader));
    this.isEnabled = derived((reader) => !isArchivedObs.read(reader));
    this.changes = derived((reader) => {
      return chatsObs.read(reader)[0]?.changes.read(reader) ?? [];
    });
  }
  static {
    this.ID = BRANCH_CHANGES_CHANGESET_ID;
  }
};

var UncommittedChangesChangeset = class _UncommittedChangesChangeset extends AbstractChangeset {
  constructor(workspaceObs, chatsObs, changesetResolver) {
    super(chatsObs);
    this.id = _UncommittedChangesChangeset.ID;
    this.label = localize(5046, null);
    this.description = localize(5047, null);
    this.category = localize(5042, null);
    this.isDefault = constObservable(false);
    this.originalCheckpointRef = constObservable("HEAD");
    this.modifiedCheckpointRef = constObservable(void 0);
    this.isEnabled = derived((reader) => chatsObs.read(reader)[0]?.isArchived.read(reader) !== true);
    const uncommittedChangesCountObs = derived((reader) => {
      const gitRepository = workspaceObs.read(reader)?.folders[0].gitRepository;
      return gitRepository?.uncommittedChanges ?? 0;
    });
    const changesPromiseObs = derived((reader) => {
      const originalCheckpointRef = this.originalCheckpointRef.read(reader);
      const modifiedCheckpointRef = this.modifiedCheckpointRef.read(reader);
      uncommittedChangesCountObs.read(reader);
      const diffPromise = changesetResolver.resolve(originalCheckpointRef, modifiedCheckpointRef);
      return new ObservablePromise(diffPromise).resolvedValue;
    });
    this.isLoadingChanges = derived((reader) => {
      return changesPromiseObs.read(reader).read(reader) === void 0;
    });
    this.changes = derivedOpts({ equalsFn: sessionFileChangesEqual }, (reader) => {
      return changesPromiseObs.read(reader).read(reader) ?? [];
    });
  }
  static {
    this.ID = "uncommittedChanges";
  }
};

var AllChangesChangeset = class _AllChangesChangeset extends AbstractChangeset {
  constructor(chatsObs, changesetResolver) {
    super(chatsObs);
    this.id = _AllChangesChangeset.ID;
    this.label = localize(5039, null);
    this.description = localize(5040, null);
    this.category = localize(5043, null);
    this.originalCheckpointRef = derived((reader) => {
      return chatsObs.read(reader)[0]?.checkpoints.read(reader)?.firstCheckpointRef;
    });
    this.modifiedCheckpointRef = derived((reader) => {
      const chats = chatsObs.read(reader);
      if (chats.length === 0) {
        return void 0;
      }
      if (chats.length === 1) {
        return chats[0].checkpoints.read(reader)?.lastCheckpointRef;
      }
      const chatsSortedByLastTurnEnd = chats.toSorted((chatA, chatB) => {
        const chatALastTurnEnd = chatA.lastTurnEnd.read(reader);
        const chatBLastTurnEnd = chatB.lastTurnEnd.read(reader);
        return sortDateDesc(chatALastTurnEnd, chatBLastTurnEnd);
      });
      return chatsSortedByLastTurnEnd[0].checkpoints.read(reader)?.lastCheckpointRef;
    });
    const changesPromiseObs = derived((reader) => {
      const originalCheckpointRef = this.originalCheckpointRef.read(reader);
      const modifiedCheckpointRef = this.modifiedCheckpointRef.read(reader);
      if (!originalCheckpointRef || !modifiedCheckpointRef) {
        return constObservable([]);
      }
      const diffPromise = changesetResolver.resolve(originalCheckpointRef, modifiedCheckpointRef);
      return new ObservablePromise(diffPromise).resolvedValue;
    });
    this.isLoadingChanges = derived((reader) => {
      return changesPromiseObs.read(reader).read(reader) === void 0;
    });
    this.changes = derivedOpts({ equalsFn: sessionFileChangesEqual }, (reader) => {
      return changesPromiseObs.read(reader).read(reader) ?? [];
    });
    this.isDefault = derived((reader) => chatsObs.read(reader)[0]?.isArchived.read(reader) === true);
    this.isEnabled = derived((reader) => this.originalCheckpointRef.read(reader) !== void 0 && this.modifiedCheckpointRef.read(reader) !== void 0);
  }
  static {
    this.ID = "allChanges";
  }
};

var LastTurnChangesChangeset = class _LastTurnChangesChangeset extends AbstractChangeset {
  constructor(chatsObs, changesetResolver) {
    super(chatsObs);
    this.id = _LastTurnChangesChangeset.ID;
    this.label = localize(5044, null);
    this.description = localize(5045, null);
    this.category = localize(5043, null);
    this.isDefault = constObservable(false);
    this.modifiedCheckpointRef = derived((reader) => {
      const chats = chatsObs.read(reader);
      if (chats.length === 0) {
        return void 0;
      }
      if (chats.length === 1) {
        return chats[0].checkpoints.read(reader)?.lastCheckpointRef;
      }
      const chatsSortedByLastTurnEnd = chats.toSorted((chatA, chatB) => {
        const chatALastTurnEnd = chatA.lastTurnEnd.read(reader);
        const chatBLastTurnEnd = chatB.lastTurnEnd.read(reader);
        return sortDateDesc(chatALastTurnEnd, chatBLastTurnEnd);
      });
      return chatsSortedByLastTurnEnd[0].checkpoints.read(reader)?.lastCheckpointRef;
    });
    this.originalCheckpointRef = derived((reader) => {
      const modifiedCheckpointRef = this.modifiedCheckpointRef.read(reader);
      return modifiedCheckpointRef ? `${modifiedCheckpointRef}^` : void 0;
    });
    const changesPromiseObs = derived((reader) => {
      const originalCheckpointRef = this.originalCheckpointRef.read(reader);
      const modifiedCheckpointRef = this.modifiedCheckpointRef.read(reader);
      if (!originalCheckpointRef || !modifiedCheckpointRef) {
        return constObservable([]);
      }
      const diffPromise = changesetResolver.resolve(originalCheckpointRef, modifiedCheckpointRef);
      return new ObservablePromise(diffPromise).resolvedValue;
    });
    this.isLoadingChanges = derived((reader) => {
      return changesPromiseObs.read(reader).read(reader) === void 0;
    });
    this.changes = derivedOpts({ equalsFn: sessionFileChangesEqual }, (reader) => {
      return changesPromiseObs.read(reader).read(reader) ?? [];
    });
    this.isEnabled = derived((reader) => this.originalCheckpointRef.read(reader) !== void 0 && this.modifiedCheckpointRef.read(reader) !== void 0);
  }
  static {
    this.ID = "lastTurnChanges";
  }
};

function sortDateDesc(dateA, dateB) {
  const chatALastTurnEnd = dateA?.getTime();
  const chatBLastTurnEnd = dateB?.getTime();
  if (!chatALastTurnEnd && !chatBLastTurnEnd) {
    return 0;
  }
  if (!chatALastTurnEnd) {
    return 1;
  }
  if (!chatBLastTurnEnd) {
    return -1;
  }
  return chatBLastTurnEnd - chatALastTurnEnd;
}

function toIChatSessionFileChange2(changes, originalRef, modifiedRef) {
  return changes.map((change) => ({
    uri: change.uri,
    originalUri: change.originalUri ? originalRef ? change.originalUri.with({ scheme: "git", query: JSON.stringify({ path: change.originalUri.fsPath, ref: originalRef }) }) : change.originalUri : void 0,
    modifiedUri: change.modifiedUri ? modifiedRef ? change.modifiedUri.with({ scheme: "git", query: JSON.stringify({ path: change.modifiedUri.fsPath, ref: modifiedRef }) }) : change.modifiedUri : void 0,
    insertions: change.insertions,
    deletions: change.deletions
  }));
}
export { createChangesets2, sortDateDesc, toIChatSessionFileChange2, GitRepositoryChangesetResolver, GitHubRepositoryChangesetResolver, AbstractChangeset, BranchChangesChangeset, UncommittedChangesChangeset, AllChangesChangeset, LastTurnChangesChangeset };
