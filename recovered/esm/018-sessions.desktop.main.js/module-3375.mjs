// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/browser/localHistoryTimeline.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Emitter } from "./module-0017.mjs";
import { LocalHistoryFileSystemProvider } from "./module-3372.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { getVirtualWorkspaceAuthority } from "./module-0937.mjs";
import { SaveSourceRegistry } from "./module-0926.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { LOCAL_HISTORY_ICON_ENTRY, LOCAL_HISTORY_MENU_CONTEXT_VALUE, getLocalHistoryDateFormatter } from "./module-3373.mjs";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID } from "./module-1530.mjs";
import { COMPARE_WITH_FILE_LABEL, toDiffEditorArguments } from "./module-3374.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITimelineService } from "./module-1422.mjs";
import { IWorkingCopyHistoryService } from "./module-3371.mjs";
import { IPathService } from "./module-0939.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/localHistory/browser/localHistoryTimeline.ts
var LocalHistoryTimeline = class extends Disposable {
  constructor(timelineService, workingCopyHistoryService, pathService, fileService, environmentService, configurationService, contextService) {
    super();
    this.timelineService = timelineService;
    this.workingCopyHistoryService = workingCopyHistoryService;
    this.pathService = pathService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.id = "timeline.localHistory";
    this.label = localize(16555, null);
    this.scheme = "*";
    // we try to show local history for all schemes if possible
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.timelineProviderDisposable = this._register(new MutableDisposable());
    this.registerComponents();
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.localHistoryTimeline";
  }
  static {
    this.LOCAL_HISTORY_ENABLED_SETTINGS_KEY = "workbench.localHistory.enabled";
  }
  registerComponents() {
    this.updateTimelineRegistration();
    this._register(this.fileService.registerProvider(LocalHistoryFileSystemProvider.SCHEMA, new LocalHistoryFileSystemProvider(this.fileService)));
  }
  updateTimelineRegistration() {
    if (this.configurationService.getValue(LocalHistoryTimeline.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)) {
      this.timelineProviderDisposable.value = this.timelineService.registerTimelineProvider(this);
    } else {
      this.timelineProviderDisposable.clear();
    }
  }
  registerListeners() {
    this._register(this.workingCopyHistoryService.onDidAddEntry((e4) => this.onDidChangeWorkingCopyHistoryEntry(e4.entry)));
    this._register(this.workingCopyHistoryService.onDidChangeEntry((e4) => this.onDidChangeWorkingCopyHistoryEntry(e4.entry)));
    this._register(this.workingCopyHistoryService.onDidReplaceEntry((e4) => this.onDidChangeWorkingCopyHistoryEntry(e4.entry)));
    this._register(this.workingCopyHistoryService.onDidRemoveEntry((e4) => this.onDidChangeWorkingCopyHistoryEntry(e4.entry)));
    this._register(this.workingCopyHistoryService.onDidRemoveEntries(() => this.onDidChangeWorkingCopyHistoryEntry(
      void 0
      /* all entries */
    )));
    this._register(this.workingCopyHistoryService.onDidMoveEntries(() => this.onDidChangeWorkingCopyHistoryEntry(
      void 0
      /* all entries */
    )));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(LocalHistoryTimeline.LOCAL_HISTORY_ENABLED_SETTINGS_KEY)) {
        this.updateTimelineRegistration();
      }
    }));
  }
  onDidChangeWorkingCopyHistoryEntry(entry) {
    this._onDidChange.fire({
      id: this.id,
      uri: entry?.workingCopy.resource,
      reset: true
      // there is no other way to indicate that items might have been replaced/removed
    });
  }
  async provideTimeline(uri4, options3, token) {
    const items = [];
    let resource = void 0;
    if (uri4.scheme === LocalHistoryFileSystemProvider.SCHEMA) {
      resource = LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(uri4).associatedResource;
    } else if (uri4.scheme === this.pathService.defaultUriScheme || uri4.scheme === Schemas.vscodeUserData) {
      resource = uri4;
    } else if (this.fileService.hasProvider(uri4)) {
      resource = URI.from({
        scheme: this.pathService.defaultUriScheme,
        authority: this.environmentService.remoteAuthority ?? getVirtualWorkspaceAuthority(this.contextService.getWorkspace()),
        path: uri4.path
      });
    }
    if (resource) {
      const entries2 = await this.workingCopyHistoryService.getEntries(resource, token);
      for (const entry of entries2) {
        items.push(this.toTimelineItem(entry));
      }
    }
    return {
      source: this.id,
      items
    };
  }
  toTimelineItem(entry) {
    return {
      handle: entry.id,
      label: SaveSourceRegistry.getSourceLabel(entry.source),
      tooltip: new MarkdownString(`$(history) ${getLocalHistoryDateFormatter().format(entry.timestamp)}

${SaveSourceRegistry.getSourceLabel(entry.source)}${entry.sourceDescription ? ` (${entry.sourceDescription})` : ``}`, { supportThemeIcons: true }),
      source: this.id,
      timestamp: entry.timestamp,
      themeIcon: LOCAL_HISTORY_ICON_ENTRY,
      contextValue: LOCAL_HISTORY_MENU_CONTEXT_VALUE,
      command: {
        id: API_OPEN_DIFF_EDITOR_COMMAND_ID,
        title: COMPARE_WITH_FILE_LABEL.value,
        arguments: toDiffEditorArguments(entry, entry.workingCopy.resource)
      }
    };
  }
};

LocalHistoryTimeline = __decorateClass([
  __decorateParam(0, ITimelineService),
  __decorateParam(1, IWorkingCopyHistoryService),
  __decorateParam(2, IPathService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IWorkspaceContextService)
], LocalHistoryTimeline);
export { LocalHistoryTimeline };
