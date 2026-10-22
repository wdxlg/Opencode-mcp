// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostCheckpointService.ts
import { Disposable } from "./module-0010.mjs";
import { SequencerByKey } from "./module-0027.mjs";
import { buildCheckpointRefName } from "./module-0131.mjs";
import { URI } from "./module-0023.mjs";
import { AgentSession } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostCheckpointService.ts
var AgentHostCheckpointService = class extends Disposable {
  constructor(_sessionDataService, _agentConfigService, _gitService, _logService) {
    super();
    this._sessionDataService = _sessionDataService;
    this._agentConfigService = _agentConfigService;
    this._gitService = _gitService;
    this._logService = _logService;
    /**
     * Serializes capture/dispose per session so back-to-back end-of-turn
     * captures don't race on the temp-index files or the `setTurnCheckpointRef`
     * write, and a dispose can't run concurrently with an in-flight capture.
     * Keyed by session URI string.
     */
    this._sequencer = new SequencerByKey();
    this._turnStartCheckpoints = /* @__PURE__ */ new Map();
    this._register(this._sessionDataService.onWillDeleteSessionData((e) => {
      e.waitUntil(this._sequencer.queue(e.session.toString(), async () => {
        this._turnStartCheckpoints.delete(e.session.toString());
        await this._deleteCheckpoints(e.session, e.workingDirectories);
      }));
    }));
  }
  captureBaselineCheckpoint(sessionUri, workingDirectories) {
    return this._sequencer.queue(sessionUri.toString(), () => this._captureBaseline(sessionUri, workingDirectories));
  }
  async _captureBaseline(sessionUri, workingDirectories) {
    if (!workingDirectories || workingDirectories.length === 0) {
      this._logService.trace(`[AgentHostCheckpoint] Skipping baseline capture for ${sessionUri.toString()} as no working directories are found`);
      return;
    }
    const sanitized = this._sanitizedSessionId(sessionUri);
    const baselineRefName = buildCheckpointRefName(sanitized, 0);
    for (const workingDirectoryUri of workingDirectories) {
      try {
        const repositoryRootUri = await this._gitService.getRepositoryRoot(workingDirectoryUri);
        if (!repositoryRootUri) {
          continue;
        }
        const baselineCheckpointRef = await this.getBaselineCheckpoint(sessionUri, repositoryRootUri);
        if (baselineCheckpointRef) {
          continue;
        }
        const commit = await this._writeCheckpointCommit(repositoryRootUri, void 0, `Agent host session ${sanitized} - baseline checkpoint`);
        if (!commit) {
          continue;
        }
        await this._gitService.updateRef(repositoryRootUri, baselineRefName, commit);
        this._logService.trace(`[AgentHostCheckpoint] Captured baseline for ${sessionUri.toString()} at ${baselineRefName} in working directory ${workingDirectoryUri.toString()}`);
      } catch (err) {
        this._logService.warn(`[AgentHostCheckpoint] Failed to capture baseline for ${sessionUri.toString()} in working directory ${workingDirectoryUri.toString()}`, err);
      }
    }
  }
  captureTurnStartCheckpoint(sessionUri, chatUri, turnId, workingDirectories) {
    return this._sequencer.queue(sessionUri.toString(), () => this._captureTurnStartCheckpoint(sessionUri, chatUri, turnId, workingDirectories));
  }
  async _captureTurnStartCheckpoint(sessionUri, chatUri, turnId, workingDirectories) {
    if (!workingDirectories || workingDirectories.length === 0) {
      return;
    }
    const sessionKey = sessionUri.toString();
    const chatKey = chatUri.toString();
    const turnKey = this._turnKey(chatKey, turnId);
    let sessionCheckpoints = this._turnStartCheckpoints.get(sessionKey);
    if (!sessionCheckpoints) {
      sessionCheckpoints = /* @__PURE__ */ new Map();
      this._turnStartCheckpoints.set(sessionKey, sessionCheckpoints);
    }
    if (sessionCheckpoints.has(turnKey)) {
      return;
    }
    const hasConcurrentTurn = sessionCheckpoints.size > 0;
    if (hasConcurrentTurn) {
      for (const checkpoint2 of sessionCheckpoints.values()) {
        checkpoint2.gitEligible = false;
      }
    }
    const checkpoint = { chatKey, trees: /* @__PURE__ */ new Map(), gitEligible: !hasConcurrentTurn };
    sessionCheckpoints.set(turnKey, checkpoint);
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(sessionUri);
      await ref.object.createTurn(turnId);
      if (await ref.object.getTurnCheckpointRef(turnId)) {
        sessionCheckpoints.delete(turnKey);
        return;
      }
      for (const workingDirectoryUri of workingDirectories) {
        try {
          const repositoryRootUri = await this._gitService.getRepositoryRoot(workingDirectoryUri);
          if (!repositoryRootUri) {
            continue;
          }
          const tree = await this._gitService.captureWorkingTreeAsTree(repositoryRootUri);
          if (tree) {
            await this._ensureBaselineCheckpoint(sessionUri, repositoryRootUri, tree);
            checkpoint.trees.set(repositoryRootUri.toString(), tree);
          }
        } catch (err) {
          this._logService.warn(`[AgentHostCheckpoint] Failed to capture turn start for ${sessionUri.toString()}/${turnId} in working directory ${workingDirectoryUri.toString()}`, err);
        }
      }
    } catch (err) {
      this._logService.warn(`[AgentHostCheckpoint] Failed to capture turn start for ${sessionUri.toString()}/${turnId}`, err);
    } finally {
      if (sessionCheckpoints.size === 0) {
        this._turnStartCheckpoints.delete(sessionKey);
      }
      ref?.dispose();
    }
  }
  discardTurnStartCheckpoint(sessionUri, chatUri, turnId) {
    return this._sequencer.queue(sessionUri.toString(), async () => {
      this._deleteTurnStartCheckpoint(sessionUri, this._turnKey(chatUri.toString(), turnId));
    });
  }
  discardChatTurnStartCheckpoints(sessionUri, chatUri) {
    return this._sequencer.queue(sessionUri.toString(), async () => {
      const sessionCheckpoints = this._turnStartCheckpoints.get(sessionUri.toString());
      if (!sessionCheckpoints) {
        return;
      }
      const chatKey = chatUri.toString();
      for (const [turnKey, checkpoint] of sessionCheckpoints) {
        if (checkpoint.chatKey === chatKey) {
          sessionCheckpoints.delete(turnKey);
        }
      }
      if (sessionCheckpoints.size === 0) {
        this._turnStartCheckpoints.delete(sessionUri.toString());
      }
    });
  }
  captureTurnCheckpoint(sessionUri, chatUri, turnId, workingDirectories) {
    return this._sequencer.queue(sessionUri.toString(), () => this._captureTurnCheckpoint(sessionUri, chatUri, turnId, workingDirectories));
  }
  async _captureTurnCheckpoint(sessionUri, chatUri, turnId, workingDirectories) {
    const turnKey = this._turnKey(chatUri.toString(), turnId);
    if (!workingDirectories || workingDirectories.length === 0) {
      this._logService.trace(`[AgentHostCheckpoint] Skipping turn checkpoint capture for ${sessionUri.toString()} as no working directories are found`);
      this._deleteTurnStartCheckpoint(sessionUri, turnKey);
      return;
    }
    const startCheckpoint = this._turnStartCheckpoints.get(sessionUri.toString())?.get(turnKey);
    let ref;
    try {
      if (!startCheckpoint || !startCheckpoint.gitEligible) {
        return;
      }
      ref = this._sessionDataService.openDatabase(sessionUri);
      const sanitized = this._sanitizedSessionId(sessionUri);
      const turnNumber = await this._nextTurnNumber(ref.object);
      const refName = buildCheckpointRefName(sanitized, turnNumber);
      const [checkpointRef, prevTurnCheckpointRef] = await Promise.all([
        ref.object.getTurnCheckpointRef(turnId),
        ref.object.getPreviousCheckpointRef(turnId)
      ]);
      if (checkpointRef) {
        return;
      }
      let capturedCheckpointRef = false;
      for (const workingDirectoryUri of workingDirectories) {
        try {
          const repositoryRootUri = await this._gitService.getRepositoryRoot(workingDirectoryUri);
          if (!repositoryRootUri) {
            continue;
          }
          const baselineCheckpointRef = await this.getBaselineCheckpoint(sessionUri, repositoryRootUri);
          if (!baselineCheckpointRef) {
            continue;
          }
          const parentRef = prevTurnCheckpointRef ?? baselineCheckpointRef;
          let parentCommitOid = await this._gitService.revParse(repositoryRootUri, parentRef);
          if (!parentCommitOid) {
            this._logService.warn(`[AgentHostCheckpoint] Parent ref ${parentRef} missing for session ${sessionUri.toString()} in working directory ${workingDirectoryUri.toString()}`);
            continue;
          }
          const startTree = startCheckpoint.trees.get(repositoryRootUri.toString());
          if (!startTree) {
            continue;
          }
          const startCommitOid = await this._gitService.commitTree(repositoryRootUri, startTree, parentCommitOid, `Agent host session ${sanitized} - turn ${turnNumber} start`);
          if (!startCommitOid) {
            continue;
          }
          parentCommitOid = startCommitOid;
          const tree = await this._gitService.captureWorkingTreeAsTree(repositoryRootUri);
          if (!tree) {
            continue;
          }
          const commitOid = await this._gitService.commitTree(repositoryRootUri, tree, parentCommitOid, `Agent host session ${sanitized} - turn ${turnNumber}`);
          if (!commitOid) {
            continue;
          }
          await this._gitService.updateRef(repositoryRootUri, refName, commitOid);
          capturedCheckpointRef = true;
          this._logService.trace(`[AgentHostCheckpoint] Captured turn ${turnNumber} for ${sessionUri.toString()} in working directory ${workingDirectoryUri.toString()} at ${refName}`);
        } catch (err) {
          this._logService.warn(`[AgentHostCheckpoint] Failed to capture turn checkpoint for ${sessionUri.toString()} in working directory ${workingDirectoryUri.toString()}`, err);
        }
      }
      if (capturedCheckpointRef) {
        await ref.object.setTurnCheckpointRef(turnId, refName);
      }
    } catch (err) {
      this._logService.warn(`[AgentHostCheckpoint] Failed to capture turn checkpoint for ${sessionUri.toString()}/${turnId}`, err);
    } finally {
      this._deleteTurnStartCheckpoint(sessionUri, turnKey);
      ref?.dispose();
    }
  }
  async getTurnCheckpointPair(sessionUri, turnId, workingDirectory) {
    if (!workingDirectory) {
      const workingDirectories = this._agentConfigService.getEffectiveWorkingDirectories(sessionUri.toString());
      if (!workingDirectories || workingDirectories.length === 0) {
        return void 0;
      }
      workingDirectory = URI.parse(workingDirectories[0]);
    }
    const ref = this._sessionDataService.openDatabase(sessionUri);
    try {
      const [currentCheckpointRef, previousCheckpointRef, baselineCheckpointRef] = await Promise.all([
        ref.object.getTurnCheckpointRef(turnId),
        ref.object.getPreviousCheckpointRef(turnId),
        this.getBaselineCheckpoint(sessionUri, workingDirectory)
      ]);
      if (!currentCheckpointRef || !baselineCheckpointRef) {
        return void 0;
      }
      if (currentCheckpointRef === previousCheckpointRef) {
        return { current: currentCheckpointRef, parent: currentCheckpointRef };
      }
      const parentCheckpoint = await this._gitService.revParse(workingDirectory, `${currentCheckpointRef}^`);
      if (!parentCheckpoint) {
        return void 0;
      }
      return {
        current: currentCheckpointRef,
        parent: parentCheckpoint
      };
    } finally {
      ref.dispose();
    }
  }
  async getBaselineCheckpoint(sessionUri, workingDirectory) {
    if (!workingDirectory) {
      const workingDirectories = this._agentConfigService.getEffectiveWorkingDirectories(sessionUri.toString());
      if (!workingDirectories || workingDirectories.length === 0) {
        return void 0;
      }
      workingDirectory = URI.parse(workingDirectories[0]);
    }
    const sanitized = this._sanitizedSessionId(sessionUri);
    const baselineRefName = buildCheckpointRefName(sanitized, 0);
    const baselineRef = await this._gitService.revParse(workingDirectory, baselineRefName);
    return baselineRef ? baselineRefName : void 0;
  }
  adoptLegacyCheckpoints(sessionUri, workingDirectory, rawSessionId, turnIds) {
    return this._sequencer.queue(sessionUri.toString(), () => this._adoptLegacyCheckpoints(sessionUri, workingDirectory, rawSessionId, turnIds));
  }
  async _adoptLegacyCheckpoints(sessionUri, workingDirectory, rawSessionId, turnIds) {
    const repoRoot = await this._gitService.getRepositoryRoot(workingDirectory);
    if (!repoRoot || !this._gitService.listRefNamesWithOids) {
      return;
    }
    const legacy = await this._gitService.listRefNamesWithOids(repoRoot, `refs/sessions/${rawSessionId}`);
    if (legacy.length === 0) {
      return;
    }
    const oidByTurn = /* @__PURE__ */ new Map();
    for (const { ref: ref2, oid } of legacy) {
      const n = parseInt(ref2.substring(ref2.lastIndexOf("/") + 1), 10);
      if (Number.isFinite(n)) {
        oidByTurn.set(n, oid);
      }
    }
    const sanitized = this._sanitizedSessionId(sessionUri);
    const refByTurn = /* @__PURE__ */ new Map();
    for (const [n, oid] of oidByTurn) {
      const refName = buildCheckpointRefName(sanitized, n);
      await this._gitService.updateRef(repoRoot, refName, oid);
      refByTurn.set(n, refName);
    }
    const ref = this._sessionDataService.openDatabase(sessionUri);
    try {
      for (let i = 0; i < turnIds.length; i++) {
        const refName = refByTurn.get(i + 1);
        if (refName) {
          await ref.object.setTurnCheckpointRef(turnIds[i], refName);
        }
      }
    } finally {
      ref.dispose();
    }
    await this._gitService.deleteRefs(repoRoot, legacy.map((l) => l.ref)).catch(() => {
    });
    this._logService.info(`[AgentHostCheckpoint] Adopted ${refByTurn.size} legacy checkpoint refs for ${sessionUri.toString()}`);
  }
  async deleteCheckpoints(sessionUri, workingDirectories) {
    await this._sequencer.queue(sessionUri.toString(), () => this._deleteCheckpoints(sessionUri, workingDirectories));
  }
  async _deleteCheckpoints(sessionUri, workingDirectories) {
    if (!workingDirectories || workingDirectories.length === 0) {
      return;
    }
    const refHandle = await this._sessionDataService.tryOpenDatabase(sessionUri);
    if (!refHandle) {
      return;
    }
    try {
      const turnRefs = await refHandle.object.getAllCheckpointRefs();
      for (const workingDirectory of workingDirectories) {
        try {
          const workingDirectoryUri = URI.parse(workingDirectory);
          const repositoryRootUri = await this._gitService.getRepositoryRoot(workingDirectoryUri);
          if (!repositoryRootUri) {
            continue;
          }
          const baselineCheckpointRef = await this.getBaselineCheckpoint(sessionUri, repositoryRootUri);
          if (!baselineCheckpointRef) {
            continue;
          }
          const checkpointRefs = /* @__PURE__ */ new Set([baselineCheckpointRef, ...turnRefs]);
          await this._gitService.deleteRefs(repositoryRootUri, [...checkpointRefs]);
          this._logService.trace(`[AgentHostCheckpoint] Deleted ${checkpointRefs.size} checkpoint refs for ${sessionUri.toString()} in working directory ${workingDirectory}`);
        } catch (err) {
          this._logService.warn(`[AgentHostCheckpoint] Failed to delete checkpoint refs for ${sessionUri.toString()} in working directory ${workingDirectory}`, err);
        }
      }
    } catch (err) {
      this._logService.warn(`[AgentHostCheckpoint] Failed to dispose checkpoint refs for ${sessionUri.toString()}`, err);
    } finally {
      refHandle.dispose();
    }
  }
  async _writeCheckpointCommit(repositoryRootUri, parentOid, message) {
    const tree = await this._gitService.captureWorkingTreeAsTree(repositoryRootUri);
    if (!tree) {
      return void 0;
    }
    const commitOid = await this._gitService.commitTree(repositoryRootUri, tree, parentOid, message);
    if (!commitOid) {
      return void 0;
    }
    return commitOid;
  }
  async _ensureBaselineCheckpoint(sessionUri, repositoryRootUri, tree) {
    if (await this.getBaselineCheckpoint(sessionUri, repositoryRootUri)) {
      return;
    }
    const sanitized = this._sanitizedSessionId(sessionUri);
    const baselineRefName = buildCheckpointRefName(sanitized, 0);
    const commit = await this._gitService.commitTree(repositoryRootUri, tree, void 0, `Agent host session ${sanitized} - baseline checkpoint`);
    if (commit) {
      await this._gitService.updateRef(repositoryRootUri, baselineRefName, commit);
    }
  }
  /**
   * Parses the highest turn number from the existing refs and returns
   * the next one. Falls back to 1 (baseline is always 0).
   */
  async _nextTurnNumber(db) {
    const refs = await db.getAllCheckpointRefs();
    let max = 0;
    for (const ref of refs) {
      const idx = ref.lastIndexOf("/");
      const tail = idx >= 0 ? ref.substring(idx + 1) : ref;
      const n = parseInt(tail, 10);
      if (Number.isFinite(n) && n > max) {
        max = n;
      }
    }
    return max + 1;
  }
  _sanitizedSessionId(sessionUri) {
    return AgentSession.id(sessionUri).replace(/[^a-zA-Z0-9_.-]/g, "-");
  }
  _deleteTurnStartCheckpoint(sessionUri, turnKey) {
    const sessionKey = sessionUri.toString();
    const sessionCheckpoints = this._turnStartCheckpoints.get(sessionKey);
    sessionCheckpoints?.delete(turnKey);
    if (sessionCheckpoints?.size === 0) {
      this._turnStartCheckpoints.delete(sessionKey);
    }
  }
  _turnKey(chatKey, turnId) {
    return `${chatKey}\0${turnId}`;
  }
};

AgentHostCheckpointService = __decorateClass([
  __decorateParam(0, ISessionDataService),
  __decorateParam(1, IAgentConfigurationService),
  __decorateParam(2, IAgentHostGitService),
  __decorateParam(3, ILogService)
], AgentHostCheckpointService);
export { AgentHostCheckpointService };
