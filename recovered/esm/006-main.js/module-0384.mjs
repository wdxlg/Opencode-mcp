// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/fileManagedSettingsService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Barrier, ThrottledDelayer, init_async } from "./module-0034.mjs";
import { init_errors, isCancellationError } from "./module-0010.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { equals2, init_objects } from "./module-0121.mjs";
import { init_types, isObject } from "./module-0016.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_copilotManagedSettings, normalizeManagedSettings } from "./module-0250.mjs";


// src/vs/platform/policy/common/fileManagedSettingsService.ts
var MANAGED_SETTINGS_MAX_FILE_SIZE, FileManagedSettingsService;

var init_fileManagedSettingsService = __esm({
  "src/vs/platform/policy/common/fileManagedSettingsService.ts"() {
    init_async();
    init_errors();
    init_event();
    init_lifecycle();
    init_objects();
    init_types();
    init_files();
    init_log();
    init_copilotManagedSettings();
    MANAGED_SETTINGS_MAX_FILE_SIZE = 1024 * 1024;
    FileManagedSettingsService = class extends Disposable {
      constructor(file, fileService, logService) {
        super();
        this.file = file;
        this.fileService = fileService;
        this.logService = logService;
        this._rawManagedSettings = {};
        this._managedSettings = {};
        this._onDidChangeRawManagedSettings = this._register(new Emitter());
        this.onDidChangeRawManagedSettings = this._onDidChangeRawManagedSettings.event;
        this._onDidChangeManagedSettings = this._register(new Emitter());
        this.onDidChangeManagedSettings = this._onDidChangeManagedSettings.event;
        this.throttledDelayer = this._register(new ThrottledDelayer(500));
        this.initialized = new Barrier();
        const onDidChangeFile = Event.filter(fileService.onDidFilesChange, (e) => e.affects(file));
        this._register(fileService.watch(file));
        this._register(onDidChangeFile(() => this.scheduleRefresh()));
        this.scheduleRefresh(0);
      }
      get rawManagedSettings() {
        return this._rawManagedSettings;
      }
      get managedSettings() {
        return this._managedSettings;
      }
      async initialize() {
        await this.initialized.wait();
        return this._managedSettings;
      }
      scheduleRefresh(delay) {
        void this.throttledDelayer.trigger(() => this.refresh(), delay).then(() => {
          this.initialized.open();
        }, (error) => {
          if (!isCancellationError(error)) {
            this.logService.error("[FileManagedSettingsService] Failed to schedule managed-settings refresh", error);
            this.initialized.open();
          }
        });
      }
      async refresh() {
        const previousRaw = this._rawManagedSettings;
        const previous = this._managedSettings;
        try {
          const content = await this.fileService.readFile(this.file, { limits: { size: MANAGED_SETTINGS_MAX_FILE_SIZE } });
          const parsed = JSON.parse(content.value.toString());
          if (isObject(parsed)) {
            this._rawManagedSettings = parsed;
            this._managedSettings = normalizeManagedSettings(
              parsed,
              (msg) => this.logService.warn(`[FileManagedSettingsService] ${msg}`)
            );
          } else {
            this.logService.warn("[FileManagedSettingsService] managed-settings.json is not a JSON object");
            this._rawManagedSettings = {};
            this._managedSettings = {};
          }
        } catch (error) {
          if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
            this.logService.error("[FileManagedSettingsService] Failed to read managed-settings.json", error);
          }
          this._rawManagedSettings = {};
          this._managedSettings = {};
        }
        if (!equals2(previousRaw, this._rawManagedSettings)) {
          this._onDidChangeRawManagedSettings.fire(this._rawManagedSettings);
        }
        if (!equals2(previous, this._managedSettings)) {
          this._onDidChangeManagedSettings.fire(this._managedSettings);
        }
      }
    };
    FileManagedSettingsService = __decorateClass([
      __decorateParam(1, IFileService),
      __decorateParam(2, ILogService)
    ], FileManagedSettingsService);
  }
});
export { MANAGED_SETTINGS_MAX_FILE_SIZE, FileManagedSettingsService, init_fileManagedSettingsService };
