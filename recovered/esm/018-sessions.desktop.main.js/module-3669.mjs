// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionChangesets.ts
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { isMultiRootSession } from "./module-3667.mjs";
import { URI } from "./module-0032.mjs";
import { basename2, extUriBiasedIgnorePathCase, isEqual2 } from "./module-0034.mjs";
import { resolveChangesetUriTemplate } from "./module-3668.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { buildDefaultChatUri } from "./module-1008.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { observableValue } from "./module-0048.mjs";
import { derivedObservableWithCache, mapObservableArrayCached } from "./module-0059.mjs";
import { changesetFileToChange } from "./module-3666.mjs";
import { isDefined } from "./module-0010.mjs";
import { sessionFileChangesEqual } from "./module-1767.mjs";
import { arrayEqualsC, structuralEquals } from "./module-0042.mjs";
import { format2 } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDialogService } from "./module-0267.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionChangesets.ts
function sessionFileChangeUri(change) {
  return isIChatSessionFileChange2(change) ? change.uri : change.modifiedUri;
}

function filterChangesToPrimaryWorkingDirectory(changes, workingDirectories) {
  if (!isMultiRootSession(workingDirectories)) {
    return changes;
  }
  const primary = workingDirectories?.[0];
  if (!primary) {
    return changes;
  }
  const primaryWorkingDirectory = URI.parse(primary);
  return changes.filter((change) => extUriBiasedIgnorePathCase.isEqualOrParent(
    primaryWorkingDirectory.with({ path: sessionFileChangeUri(change).path }),
    primaryWorkingDirectory
  ));
}

function createChangesets(sessionUri, options3, isActiveSessionObs, changesets) {
  if (!changesets) {
    return [];
  }
  const sessionChangesets = [];
  const defaultKind = options3.defaultChangesetKind ?? "branch" /* Branch */;
  const defaultChangeset = changesets.find((c) => c.changeKind === defaultKind) ?? changesets[0];
  for (const catalogueEntry of changesets) {
    const isDefault = catalogueEntry === defaultChangeset;
    const changeset = {
      ...catalogueEntry,
      uriTemplate: resolveChangesetUriTemplate(sessionUri.toString(), catalogueEntry.uriTemplate)
    };
    if (changeset.changeKind === "branch" /* Branch */ || changeset.changeKind === "uncommitted" /* Uncommitted */ || changeset.changeKind === "session" /* Session */) {
      sessionChangesets.push(options3.instantiationService.createInstance(AgentHostChangeset, options3, isActiveSessionObs, {
        ...changeset,
        isDefault
      }));
    } else if (changeset.changeKind === "turn" /* Turn */) {
      sessionChangesets.push(options3.instantiationService.createInstance(AgentHostLastTurnChangeset, sessionUri, options3, isActiveSessionObs, {
        ...changeset,
        isDefault
      }));
    }
  }
  return sessionChangesets;
}

function createActiveSessionSubscriptionObs(options3, isActiveSessionObs, component, resourceObs) {
  return derived((reader) => {
    const connection = options3.getConnection();
    if (!connection) {
      return constObservable(null);
    }
    const resource = resourceObs.read(reader);
    if (!resource) {
      return constObservable(null);
    }
    const isActiveSession = isActiveSessionObs.read(reader);
    if (!isActiveSession) {
      return constObservable(null);
    }
    const subscriptionRef = connection.getSubscription(component, resource, "AgentHostSessionChangesets");
    reader.store.add(subscriptionRef);
    return observableFromEvent(
      subscriptionRef.object.onDidChange,
      () => subscriptionRef.object.value
    );
  });
}

function selectMostRecentChatUri(sessionState, sessionUri) {
  if (!sessionState || sessionState instanceof Error) {
    return URI.parse(buildDefaultChatUri(sessionUri));
  }
  const mostRecentChat = sessionState.chats.reduce(
    (best, c) => !best || c.modifiedAt > best.modifiedAt ? c : best,
    void 0
  );
  return URI.parse(mostRecentChat?.resource ?? sessionState.defaultChat ?? buildDefaultChatUri(sessionUri));
}

function toSessionChangesetOperationScope(scope) {
  switch (scope) {
    case "changeset" /* Changeset */:
      return "changeset" /* Changeset */;
    case "resource" /* Resource */:
      return "resource" /* Resource */;
    case "range" /* Range */:
      return "range" /* Range */;
    default:
      throw new Error(`Unknown ChangesetOperationScope: ${scope}`);
  }
}

function toSessionChangesetOperationStatus(status2) {
  switch (status2) {
    case "idle" /* Idle */:
      return "idle" /* Idle */;
    case "running" /* Running */:
      return "running" /* Running */;
    case "error" /* Error */:
      return "error" /* Error */;
    case "disabled" /* Disabled */:
      return "disabled" /* Disabled */;
    default:
      throw new Error(`Unknown ChangesetOperationStatus: ${status2}`);
  }
}

function toSessionChangesetOperation(operation) {
  return {
    id: operation.id,
    label: operation.label,
    description: operation.description,
    icon: operation.icon ? ThemeIcon.fromId(operation.icon) : void 0,
    group: operation.group,
    confirmation: operation.confirmation ? typeof operation.confirmation === "string" ? operation.confirmation : new MarkdownString(operation.confirmation.markdown, {
      isTrusted: false,
      supportThemeIcons: true
    }) : void 0,
    scopes: operation.scopes.map(toSessionChangesetOperationScope),
    status: toSessionChangesetOperationStatus(operation.status)
  };
}

var AbstractAgentHostChangeset = class {
  constructor(changeset, _options, _dialogService) {
    this._options = _options;
    this._dialogService = _dialogService;
    this.originalCheckpointRef = observableValue(this, void 0);
    this.modifiedCheckpointRef = observableValue(this, void 0);
    this.capabilities = {
      review: changeset.capabilities?.review !== void 0
    };
    const providedChangesObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const providedChanges = changeset.changes?.read(reader);
      if (providedChanges !== void 0) {
        return providedChanges;
      }
      if (lastValue === void 0) {
        return void 0;
      }
      const changesetState = this.changesetStateObs.read(reader).read(reader);
      return changesetState && !(changesetState instanceof Error) && changesetState.status === "ready" /* Ready */ ? void 0 : lastValue;
    });
    this.isLoadingChanges = derived((reader) => {
      if (providedChangesObs.read(reader) !== void 0) {
        return false;
      }
      const changesetState = this.changesetStateObs.read(reader).read(reader);
      if (changesetState === void 0) {
        return true;
      }
      if (changesetState === null || changesetState instanceof Error) {
        return false;
      }
      return changesetState.status === "computing" /* Computing */;
    });
    const mapDiffUri = this._options.mapDiffUri;
    this._changesetFilesObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const changesetState = this.changesetStateObs.read(reader).read(reader);
      if (changesetState === null || changesetState instanceof Error) {
        return [];
      }
      if (changesetState === void 0) {
        return lastValue;
      }
      if (changesetState.status !== "ready" /* Ready */ && lastValue !== void 0) {
        return lastValue;
      }
      return changesetState.files;
    });
    const mappedChangesObs = mapObservableArrayCached(
      this,
      this._changesetFilesObs.map((files) => files ?? []),
      (file) => changesetFileToChange(file, mapDiffUri)
    );
    const changesObs = derived(this, (reader) => {
      return mappedChangesObs.read(reader).filter(isDefined);
    });
    this.changes = derivedOpts({ equalsFn: sessionFileChangesEqual }, (reader) => {
      const changes = providedChangesObs.read(reader) ?? changesObs.read(reader) ?? [];
      return this._filterChanges(changes, reader);
    });
    const operationsObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const changesetState = this.changesetStateObs.read(reader).read(reader);
      if (changesetState === null || changesetState instanceof Error) {
        return [];
      }
      if (changesetState === void 0) {
        return lastValue ?? [];
      }
      return changesetState.operations?.map(toSessionChangesetOperation) ?? [];
    });
    this.operations = derivedOpts({ equalsFn: arrayEqualsC(structuralEquals) }, (reader) => {
      return operationsObs.read(reader) ?? [];
    });
  }
  /**
   * Hook applied to the computed changes before they are published on
   * {@link changes}. The base implementation performs no filtering; subclasses
   * may override to restrict the set (e.g. the "Last Turn Changes" changeset
   * limits multi-root sessions to their primary working directory). Runs inside
   * the {@link changes} derived, so overrides may read observables via `reader`.
   */
  _filterChanges(changes, reader) {
    return changes;
  }
  async invokeOperation(operationId, target) {
    const connection = this._options.getConnection();
    if (!connection) {
      return;
    }
    const channel = this.channelUriObs.get();
    if (!channel) {
      return;
    }
    const operation = this.operations.get().find((o) => o.id === operationId);
    if (operation?.confirmation) {
      const message = typeof operation.confirmation === "string" ? operation.confirmation : operation.confirmation.value;
      const { confirmed } = await this._dialogService.confirm({
        type: "warning",
        message: target?.kind === "resource" ? format2(message, basename2(target.resource)) : message,
        primaryButton: operation.label
      });
      if (!confirmed) {
        return;
      }
    }
    await connection.invokeChangesetOperation({
      operationId,
      channel: channel.toString(),
      target: target?.kind === "resource" ? {
        kind: "resource" /* Resource */,
        resource: target.resource.toString()
      } : void 0
    });
  }
  setReviewState(resources, reviewed) {
    if (!this.capabilities.review) {
      return;
    }
    const connection = this._options.getConnection();
    const channel = this.channelUriObs.get();
    if (!connection || !channel) {
      return;
    }
    const files = resources.map((resource) => {
      const file = this._changesetFilesObs.get()?.find((candidate) => {
        const change = changesetFileToChange(candidate, this._options.mapDiffUri);
        return isEqual2(change?.modifiedUri, resource) || isEqual2(change?.originalUri, resource);
      });
      if (!file) {
        throw new Error(`Resource '${resource.toString()}' is not part of changeset '${this.id}'`);
      }
      return file.id;
    });
    if (files.length === 0) {
      return;
    }
    connection.dispatch(channel.toString(), {
      type: "changeset/filesReviewChanged" /* ChangesetFilesReviewChanged */,
      files,
      reviewed
    });
  }
};

var AgentHostChangeset = class extends AbstractAgentHostChangeset {
  constructor(options3, isActiveSessionObs, changesetSummary, dialogService) {
    super(changesetSummary, options3, dialogService);
    this.isEnabled = constObservable(true);
    this.channelUriObs = constObservable(URI.parse(changesetSummary.uriTemplate));
    this.changesetStateObs = createActiveSessionSubscriptionObs(
      options3,
      isActiveSessionObs,
      4 /* Changeset */,
      this.channelUriObs
    );
    this.id = changesetSummary.changeKind;
    this._label = changesetSummary.label;
    this._description = changesetSummary.description;
    this.isDefault = constObservable(changesetSummary.isDefault);
  }
  get label() {
    return this._label;
  }
  get description() {
    return this._description;
  }
};

AgentHostChangeset = __decorateClass([
  __decorateParam(3, IDialogService)
], AgentHostChangeset);

var AgentHostLastTurnChangeset = class extends AbstractAgentHostChangeset {
  constructor(sessionUri, options3, isActiveSessionObs, changesetSummary, dialogService) {
    super(changesetSummary, options3, dialogService);
    this.label = localize(4929, null);
    this.description = localize(4930, null);
    this.isDefault = observableValue(this, false);
    this.id = changesetSummary.changeKind;
    const sessionStateObs = createActiveSessionSubscriptionObs(
      options3,
      isActiveSessionObs,
      1 /* Session */,
      constObservable(sessionUri)
    );
    this._workingDirectoriesObs = derived((reader) => {
      const sessionState = sessionStateObs.read(reader).read(reader);
      if (!sessionState || sessionState instanceof Error) {
        return void 0;
      }
      return sessionState.workingDirectories;
    });
    const mostRecentChatUriObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      const sessionState = sessionStateObs.read(reader).read(reader);
      return selectMostRecentChatUri(sessionState, sessionUri);
    });
    const chatStateObs = createActiveSessionSubscriptionObs(
      options3,
      isActiveSessionObs,
      2 /* Chat */,
      mostRecentChatUriObs
    );
    const lastTurnIdObs = derived((reader) => {
      const chatState = chatStateObs.read(reader).read(reader);
      if (!chatState || chatState instanceof Error) {
        return void 0;
      }
      return chatState.activeTurn?.id ?? chatState.turns?.at(-1)?.id;
    });
    this.channelUriObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      const lastTurnId = lastTurnIdObs.read(reader);
      if (!lastTurnId) {
        return void 0;
      }
      const uri4 = changesetSummary.uriTemplate.replace("{turnId}", lastTurnId);
      return uri4 ? URI.parse(uri4) : void 0;
    });
    this.changesetStateObs = createActiveSessionSubscriptionObs(
      options3,
      isActiveSessionObs,
      4 /* Changeset */,
      this.channelUriObs
    );
    this.isEnabled = derived((reader) => this.channelUriObs.read(reader) !== void 0);
  }
  /**
   * For multi-root sessions, restrict the last-turn changes to files under the
   * session's primary working directory so the single-root Changes tree in the
   * Agents Window stays renderable. Single-root sessions are unaffected —
   * {@link filterChangesToPrimaryWorkingDirectory} returns the input unchanged.
   */
  _filterChanges(changes, reader) {
    return filterChangesToPrimaryWorkingDirectory(changes, this._workingDirectoriesObs.read(reader));
  }
};

AgentHostLastTurnChangeset = __decorateClass([
  __decorateParam(4, IDialogService)
], AgentHostLastTurnChangeset);
export { sessionFileChangeUri, filterChangesToPrimaryWorkingDirectory, createChangesets, createActiveSessionSubscriptionObs, selectMostRecentChatUri, toSessionChangesetOperationScope, toSessionChangesetOperationStatus, toSessionChangesetOperation, AbstractAgentHostChangeset, AgentHostChangeset, AgentHostLastTurnChangeset };
