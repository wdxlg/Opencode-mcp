// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Memento } from "./module-1041.mjs";
import { walkthroughs } from "./module-3492.mjs";
import { FileAccess } from "./module-0033.mjs";
import { walkthroughsExtensionPoint } from "./module-3493.mjs";
import { EXTENSION_INSTALL_DEP_PACK_CONTEXT, EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, IExtensionManagementService } from "./module-0872.mjs";
import { URI } from "./module-0032.mjs";
import { joinPath } from "./module-0034.mjs";
import { dirname } from "./module-0026.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { checkGlobFileExists } from "./module-1313.mjs";
import { extensionDefaultIcon } from "./module-2250.mjs";
import { GettingStartedInput } from "./module-3494.mjs";
import { coalesce } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUserDataSyncEnablementService } from "./module-1696.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1117.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IEditorService } from "./module-0934.mjs";
import { parseLinkedText } from "./module-1329.mjs";
import { asWebviewUri } from "./module-1911.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService.ts
var HasMultipleNewFileEntries = new RawContextKey("hasMultipleNewFileEntries", false);

var IWalkthroughsService = createDecorator("walkthroughsService");

var hiddenEntriesConfigurationKey = "workbench.welcomePage.hiddenCategories";

var walkthroughMetadataConfigurationKey = "workbench.welcomePage.walkthroughMetadata";

var BUILT_IN_SOURCE = localize(21994, null);

var DAYS = 24 * 60 * 60 * 1e3;

var NEW_WALKTHROUGH_TIME = 7 * DAYS;

var WalkthroughsService = class extends Disposable {
  constructor(storageService, commandService, instantiationService, workspaceContextService, contextService, userDataSyncEnablementService, configurationService, extensionManagementService, hostService, viewsService, telemetryService, tasExperimentService, layoutService, editorService) {
    super();
    this.storageService = storageService;
    this.commandService = commandService;
    this.instantiationService = instantiationService;
    this.workspaceContextService = workspaceContextService;
    this.contextService = contextService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.configurationService = configurationService;
    this.extensionManagementService = extensionManagementService;
    this.hostService = hostService;
    this.viewsService = viewsService;
    this.telemetryService = telemetryService;
    this.tasExperimentService = tasExperimentService;
    this.layoutService = layoutService;
    this.editorService = editorService;
    this._onDidAddWalkthrough = this._register(new Emitter());
    this.onDidAddWalkthrough = this._onDidAddWalkthrough.event;
    this._onDidRemoveWalkthrough = this._register(new Emitter());
    this.onDidRemoveWalkthrough = this._onDidRemoveWalkthrough.event;
    this._onDidChangeWalkthrough = this._register(new Emitter());
    this.onDidChangeWalkthrough = this._onDidChangeWalkthrough.event;
    this._onDidProgressStep = this._register(new Emitter());
    this.onDidProgressStep = this._onDidProgressStep.event;
    this.sessionEvents = /* @__PURE__ */ new Set();
    this.completionListeners = /* @__PURE__ */ new Map();
    this.gettingStartedContributions = /* @__PURE__ */ new Map();
    this.steps = /* @__PURE__ */ new Map();
    this.sessionInstalledExtensions = /* @__PURE__ */ new Set();
    this.categoryVisibilityContextKeys = /* @__PURE__ */ new Set();
    this.stepCompletionContextKeyExpressions = /* @__PURE__ */ new Set();
    this.stepCompletionContextKeys = /* @__PURE__ */ new Set();
    this.metadata = new Map(
      JSON.parse(
        this.storageService.get(walkthroughMetadataConfigurationKey, 0 /* PROFILE */, "[]")
      )
    );
    this.memento = new Memento("gettingStartedService", this.storageService);
    this.stepProgress = this.memento.getMemento(0 /* PROFILE */, 0 /* USER */);
    this.initCompletionEventListeners();
    HasMultipleNewFileEntries.bindTo(this.contextService).set(false);
    this.registerWalkthroughs();
  }
  registerWalkthroughs() {
    walkthroughs.forEach(async (category11, index2) => {
      this._registerWalkthrough({
        ...category11,
        icon: { type: "icon", icon: category11.icon },
        order: walkthroughs.length - index2,
        source: BUILT_IN_SOURCE,
        when: ContextKeyExpr.deserialize(category11.when) ?? ContextKeyExpr.true(),
        steps: category11.content.steps.map((step, index3) => {
          return {
            ...step,
            completionEvents: step.completionEvents ?? [],
            description: parseDescription(step.description),
            category: category11.id,
            order: index3,
            when: ContextKeyExpr.deserialize(step.when) ?? ContextKeyExpr.true(),
            media: step.media.type === "image" ? {
              type: "image",
              altText: step.media.altText,
              path: convertInternalMediaPathsToBrowserURIs(step.media.path)
            } : step.media.type === "svg" ? {
              type: "svg",
              altText: step.media.altText,
              path: convertInternalMediaPathToFileURI(step.media.path).with({ query: JSON.stringify({ moduleId: "vs/workbench/contrib/welcomeGettingStarted/common/media/" + step.media.path }) })
            } : step.media.type === "markdown" ? {
              type: "markdown",
              path: convertInternalMediaPathToFileURI(step.media.path).with({ query: JSON.stringify({ moduleId: "vs/workbench/contrib/welcomeGettingStarted/common/media/" + step.media.path }) }),
              base: FileAccess.asFileUri("vs/workbench/contrib/welcomeGettingStarted/common/media/"),
              root: FileAccess.asFileUri("vs/workbench/contrib/welcomeGettingStarted/common/media/")
            } : {
              type: "video",
              path: convertRelativeMediaPathsToWebviewURIs(FileAccess.asFileUri("vs/workbench/contrib/welcomeGettingStarted/common/media/"), step.media.path),
              altText: step.media.altText,
              root: FileAccess.asFileUri("vs/workbench/contrib/welcomeGettingStarted/common/media/"),
              poster: step.media.poster ? convertRelativeMediaPathsToWebviewURIs(FileAccess.asFileUri("vs/workbench/contrib/welcomeGettingStarted/common/media/"), step.media.poster) : void 0
            }
          };
        })
      });
    });
    walkthroughsExtensionPoint.setHandler((_, { added, removed }) => {
      added.map((e) => this.registerExtensionWalkthroughContributions(e.description));
      removed.map((e) => this.unregisterExtensionWalkthroughContributions(e.description));
    });
  }
  initCompletionEventListeners() {
    this._register(this.commandService.onDidExecuteCommand((command4) => this.progressByEvent(`onCommand:${command4.commandId}`)));
    this.extensionManagementService.getInstalled().then((installed) => {
      installed.forEach((ext) => this.progressByEvent(`extensionInstalled:${ext.identifier.id.toLowerCase()}`));
    });
    this._register(this.extensionManagementService.onDidInstallExtensions((result) => {
      for (const e of result) {
        const skipWalkthrough = e?.context?.[EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT] || e?.context?.[EXTENSION_INSTALL_DEP_PACK_CONTEXT];
        if (!skipWalkthrough) {
          this.sessionInstalledExtensions.add(e.identifier.id.toLowerCase());
        }
        this.progressByEvent(`extensionInstalled:${e.identifier.id.toLowerCase()}`);
      }
    }));
    this._register(this.contextService.onDidChangeContext((event) => {
      if (event.affectsSome(this.stepCompletionContextKeys)) {
        this.stepCompletionContextKeyExpressions.forEach((expression) => {
          if (event.affectsSome(new Set(expression.keys())) && this.contextService.contextMatchesRules(expression)) {
            this.progressByEvent(`onContext:` + expression.serialize());
          }
        });
      }
    }));
    this._register(this.viewsService.onDidChangeViewVisibility((e) => {
      if (e.visible) {
        this.progressByEvent("onView:" + e.id);
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      e.affectedKeys.forEach((key3) => {
        this.progressByEvent("onSettingChanged:" + key3);
      });
    }));
    if (this.userDataSyncEnablementService.isEnabled()) {
      this.progressByEvent("onEvent:sync-enabled");
    }
    this._register(this.userDataSyncEnablementService.onDidChangeEnablement(() => {
      if (this.userDataSyncEnablementService.isEnabled()) {
        this.progressByEvent("onEvent:sync-enabled");
      }
    }));
  }
  markWalkthroughOpened(id2) {
    const walkthrough = this.gettingStartedContributions.get(id2);
    const prior = this.metadata.get(id2);
    if (prior && walkthrough) {
      this.metadata.set(id2, { ...prior, manaullyOpened: true, stepIDs: walkthrough.steps.map((s) => s.id) });
    }
    this.storageService.store(walkthroughMetadataConfigurationKey, JSON.stringify([...this.metadata.entries()]), 0 /* PROFILE */, 0 /* USER */);
  }
  async registerExtensionWalkthroughContributions(extension) {
    const convertExtensionPathToFileURI = (path) => path.startsWith("https://") ? URI.parse(path, true) : FileAccess.uriToFileUri(joinPath(extension.extensionLocation, path));
    const convertExtensionRelativePathsToBrowserURIs = (path) => {
      const convertPath = (path2) => path2.startsWith("https://") ? URI.parse(path2, true) : FileAccess.uriToBrowserUri(joinPath(extension.extensionLocation, path2));
      if (typeof path === "string") {
        const converted = convertPath(path);
        return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
      } else {
        return {
          hcDark: convertPath(path.hc),
          hcLight: convertPath(path.hcLight ?? path.light),
          light: convertPath(path.light),
          dark: convertPath(path.dark)
        };
      }
    };
    if (!extension.contributes?.walkthroughs?.length) {
      return;
    }
    let sectionToOpen;
    let sectionToOpenIndex = Math.min();
    await Promise.all(extension.contributes?.walkthroughs?.map(async (walkthrough, index2) => {
      const categoryID = extension.identifier.value + "#" + walkthrough.id;
      const isNewlyInstalled = !this.metadata.get(categoryID);
      if (isNewlyInstalled) {
        this.metadata.set(categoryID, { firstSeen: +/* @__PURE__ */ new Date(), stepIDs: walkthrough.steps?.map((s) => s.id) ?? [], manaullyOpened: false });
      }
      const override = await Promise.race([
        this.tasExperimentService?.getTreatment(`gettingStarted.overrideCategory.${extension.identifier.value + "." + walkthrough.id}.when`),
        new Promise((resolve3) => setTimeout(() => resolve3(walkthrough.when), 5e3))
      ]);
      if (this.sessionInstalledExtensions.has(extension.identifier.value.toLowerCase()) && this.contextService.contextMatchesRules(ContextKeyExpr.deserialize(override ?? walkthrough.when) ?? ContextKeyExpr.true())) {
        this.sessionInstalledExtensions.delete(extension.identifier.value.toLowerCase());
        if (index2 < sectionToOpenIndex && isNewlyInstalled) {
          sectionToOpen = categoryID;
          sectionToOpenIndex = index2;
        }
      }
      const steps = (walkthrough.steps ?? []).map((step, index3) => {
        const description = parseDescription(step.description || "");
        const fullyQualifiedID = extension.identifier.value + "#" + walkthrough.id + "#" + step.id;
        let media;
        if (!step.media) {
          throw Error("missing media in walkthrough step: " + walkthrough.id + "@" + step.id);
        }
        if (step.media.image) {
          const altText = step.media.altText;
          if (altText === void 0) {
            console.error("Walkthrough item:", fullyQualifiedID, "is missing altText for its media element.");
          }
          media = { type: "image", altText, path: convertExtensionRelativePathsToBrowserURIs(step.media.image) };
        } else if (step.media.markdown) {
          media = {
            type: "markdown",
            path: convertExtensionPathToFileURI(step.media.markdown),
            base: convertExtensionPathToFileURI(dirname(step.media.markdown)),
            root: FileAccess.uriToFileUri(extension.extensionLocation)
          };
        } else if (step.media.svg) {
          media = {
            type: "svg",
            path: convertExtensionPathToFileURI(step.media.svg),
            altText: step.media.svg
          };
        } else if (step.media.video) {
          const baseURI = FileAccess.uriToFileUri(extension.extensionLocation);
          media = {
            type: "video",
            path: convertRelativeMediaPathsToWebviewURIs(baseURI, step.media.video),
            root: FileAccess.uriToFileUri(extension.extensionLocation),
            altText: step.media.altText,
            poster: step.media.poster ? convertRelativeMediaPathsToWebviewURIs(baseURI, step.media.poster) : void 0
          };
        } else {
          throw new Error("Unknown walkthrough format detected for " + fullyQualifiedID);
        }
        return {
          description,
          media,
          completionEvents: step.completionEvents?.filter((x) => typeof x === "string") ?? [],
          id: fullyQualifiedID,
          title: step.title,
          when: ContextKeyExpr.deserialize(step.when) ?? ContextKeyExpr.true(),
          category: categoryID,
          order: index3
        };
      });
      let isFeatured = false;
      if (walkthrough.featuredFor) {
        const folders = this.workspaceContextService.getWorkspace().folders.map((f) => f.uri);
        const token = new CancellationTokenSource();
        setTimeout(() => token.cancel(), 2e3);
        isFeatured = await this.instantiationService.invokeFunction((a) => checkGlobFileExists(a, folders, walkthrough.featuredFor, token.token));
      }
      const iconStr = walkthrough.icon ?? extension.icon;
      const walkthoughDescriptor = {
        description: walkthrough.description,
        title: walkthrough.title,
        id: categoryID,
        isFeatured,
        source: extension.displayName ?? extension.name,
        order: 0,
        walkthroughPageTitle: extension.displayName ?? extension.name,
        steps,
        icon: iconStr ? {
          type: "image",
          path: FileAccess.uriToBrowserUri(joinPath(extension.extensionLocation, iconStr)).toString(true)
        } : {
          icon: extensionDefaultIcon,
          type: "icon"
        },
        when: ContextKeyExpr.deserialize(override ?? walkthrough.when) ?? ContextKeyExpr.true()
      };
      this._registerWalkthrough(walkthoughDescriptor);
      this._onDidAddWalkthrough.fire(this.resolveWalkthrough(walkthoughDescriptor));
    }));
    this.storageService.store(walkthroughMetadataConfigurationKey, JSON.stringify([...this.metadata.entries()]), 0 /* PROFILE */, 0 /* USER */);
    const hadLastFoucs = await this.hostService.hadLastFocus();
    const startupEditor = this.configurationService.getValue("workbench.startupEditor");
    if (hadLastFoucs && sectionToOpen && this.configurationService.getValue("workbench.welcomePage.walkthroughs.openOnInstall") && startupEditor !== "agentSessionsWelcomePage") {
      this.telemetryService.publicLog2("gettingStarted.didAutoOpenWalkthrough", { id: sectionToOpen });
      const activeEditor = this.editorService.activeEditor;
      if (activeEditor instanceof GettingStartedInput) {
        this.commandService.executeCommand("workbench.action.keepEditor");
      }
      this.commandService.executeCommand("workbench.action.openWalkthrough", sectionToOpen, {
        inactive: this.layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */)
        // do not steal the active editor away
      });
    }
  }
  unregisterExtensionWalkthroughContributions(extension) {
    if (!extension.contributes?.walkthroughs?.length) {
      return;
    }
    extension.contributes?.walkthroughs?.forEach((section) => {
      const categoryID = extension.identifier.value + "#" + section.id;
      section.steps.forEach((step) => {
        const fullyQualifiedID = extension.identifier.value + "#" + section.id + "#" + step.id;
        this.steps.delete(fullyQualifiedID);
      });
      this.gettingStartedContributions.delete(categoryID);
      this._onDidRemoveWalkthrough.fire(categoryID);
    });
  }
  getWalkthrough(id2) {
    const walkthrough = this.gettingStartedContributions.get(id2);
    if (!walkthrough) {
      throw Error("Trying to get unknown walkthrough: " + id2);
    }
    return this.resolveWalkthrough(walkthrough);
  }
  getWalkthroughs() {
    const registeredCategories = [...this.gettingStartedContributions.values()];
    const categoriesWithCompletion = registeredCategories.map((category11) => {
      return {
        ...category11,
        content: {
          type: "steps",
          steps: category11.steps
        }
      };
    }).filter((category11) => category11.content.type !== "steps" || category11.content.steps.length).filter((category11) => category11.id !== "NewWelcomeExperience").map((category11) => this.resolveWalkthrough(category11));
    return categoriesWithCompletion;
  }
  resolveWalkthrough(category11) {
    const stepsWithProgress = category11.steps.map((step) => this.getStepProgress(step));
    const hasOpened = this.metadata.get(category11.id)?.manaullyOpened;
    const firstSeenDate = this.metadata.get(category11.id)?.firstSeen;
    const isNew = firstSeenDate && firstSeenDate > +/* @__PURE__ */ new Date() - NEW_WALKTHROUGH_TIME;
    const lastStepIDs = this.metadata.get(category11.id)?.stepIDs;
    const rawCategory = this.gettingStartedContributions.get(category11.id);
    if (!rawCategory) {
      throw Error("Could not find walkthrough with id " + category11.id);
    }
    const currentStepIds = rawCategory.steps.map((s) => s.id);
    const hasNewSteps = lastStepIDs && (currentStepIds.length !== lastStepIDs.length || currentStepIds.some((id2, index2) => id2 !== lastStepIDs[index2]));
    let recencyBonus = 0;
    if (firstSeenDate) {
      const currentDate = +/* @__PURE__ */ new Date();
      const timeSinceFirstSeen = currentDate - firstSeenDate;
      recencyBonus = Math.max(0, (NEW_WALKTHROUGH_TIME - timeSinceFirstSeen) / NEW_WALKTHROUGH_TIME);
    }
    return {
      ...category11,
      recencyBonus,
      steps: stepsWithProgress,
      newItems: !!hasNewSteps,
      newEntry: !!(isNew && !hasOpened)
    };
  }
  getStepProgress(step) {
    return {
      ...step,
      done: false,
      ...this.stepProgress[step.id]
    };
  }
  progressStep(id2) {
    const oldProgress = this.stepProgress[id2];
    if (!oldProgress || oldProgress.done !== true) {
      this.stepProgress[id2] = { done: true };
      this.memento.saveMemento();
      const step = this.getStep(id2);
      if (!step) {
        throw Error("Tried to progress unknown step");
      }
      this._onDidProgressStep.fire(this.getStepProgress(step));
    }
  }
  deprogressStep(id2) {
    delete this.stepProgress[id2];
    this.memento.saveMemento();
    const step = this.getStep(id2);
    this._onDidProgressStep.fire(this.getStepProgress(step));
  }
  progressByEvent(event) {
    if (this.sessionEvents.has(event)) {
      return;
    }
    this.sessionEvents.add(event);
    this.completionListeners.get(event)?.forEach((id2) => this.progressStep(id2));
  }
  registerWalkthrough(walkthoughDescriptor) {
    this._registerWalkthrough({
      ...walkthoughDescriptor,
      steps: walkthoughDescriptor.steps.map((step) => ({ ...step, description: parseDescription(step.description) }))
    });
  }
  _registerWalkthrough(walkthroughDescriptor) {
    const oldCategory = this.gettingStartedContributions.get(walkthroughDescriptor.id);
    if (oldCategory) {
      console.error(`Skipping attempt to overwrite walkthrough. (${walkthroughDescriptor.id})`);
      return;
    }
    this.gettingStartedContributions.set(walkthroughDescriptor.id, walkthroughDescriptor);
    walkthroughDescriptor.steps.forEach((step) => {
      if (this.steps.has(step.id)) {
        throw Error("Attempting to register step with id " + step.id + " twice. Second is dropped.");
      }
      this.steps.set(step.id, step);
      step.when.keys().forEach((key3) => this.categoryVisibilityContextKeys.add(key3));
      this.registerDoneListeners(step);
    });
    walkthroughDescriptor.when.keys().forEach((key3) => this.categoryVisibilityContextKeys.add(key3));
  }
  registerDoneListeners(step) {
    if (step.doneOn) {
      console.error(`wakthrough step`, step, `uses deprecated 'doneOn' property. Adopt 'completionEvents' to silence this warning`);
      return;
    }
    if (!step.completionEvents.length) {
      step.completionEvents = coalesce(
        step.description.filter((linkedText) => linkedText.nodes.length === 1).flatMap((linkedText) => linkedText.nodes.filter(((node) => typeof node !== "string")).map(({ href }) => {
          if (href.startsWith("command:")) {
            return "onCommand:" + href.slice("command:".length, href.includes("?") ? href.indexOf("?") : void 0);
          }
          if (href.startsWith("https://") || href.startsWith("http://")) {
            return "onLink:" + href;
          }
          return void 0;
        }))
      );
    }
    if (!step.completionEvents.length) {
      step.completionEvents.push("stepSelected");
    }
    for (let event of step.completionEvents) {
      const [_, eventType, argument] = /^([^:]*):?(.*)$/.exec(event) ?? [];
      if (!eventType) {
        console.error(`Unknown completionEvent ${event} when registering step ${step.id}`);
        continue;
      }
      switch (eventType) {
        case "onLink":
        case "onEvent":
        case "onView":
        case "onSettingChanged":
          break;
        case "onContext": {
          const expression = ContextKeyExpr.deserialize(argument);
          if (expression) {
            this.stepCompletionContextKeyExpressions.add(expression);
            expression.keys().forEach((key3) => this.stepCompletionContextKeys.add(key3));
            event = eventType + ":" + expression.serialize();
            if (this.contextService.contextMatchesRules(expression)) {
              this.sessionEvents.add(event);
            }
          } else {
            console.error("Unable to parse context key expression:", expression, "in walkthrough step", step.id);
          }
          break;
        }
        case "onStepSelected":
        case "stepSelected":
          event = "stepSelected:" + step.id;
          break;
        case "onCommand":
          event = eventType + ":" + argument.replace(/^toSide:/, "");
          break;
        case "onExtensionInstalled":
        case "extensionInstalled":
          event = "extensionInstalled:" + argument.toLowerCase();
          break;
        default:
          console.error(`Unknown completionEvent ${event} when registering step ${step.id}`);
          continue;
      }
      this.registerCompletionListener(event, step);
    }
  }
  registerCompletionListener(event, step) {
    if (!this.completionListeners.has(event)) {
      this.completionListeners.set(event, /* @__PURE__ */ new Set());
    }
    this.completionListeners.get(event)?.add(step.id);
  }
  getStep(id2) {
    const step = this.steps.get(id2);
    if (!step) {
      throw Error("Attempting to access step which does not exist in registry " + id2);
    }
    return step;
  }
};

WalkthroughsService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IUserDataSyncEnablementService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionManagementService),
  __decorateParam(8, IHostService),
  __decorateParam(9, IViewsService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IWorkbenchAssignmentService),
  __decorateParam(12, IWorkbenchLayoutService),
  __decorateParam(13, IEditorService)
], WalkthroughsService);

var parseDescription = (desc) => desc.split("\n").filter((x) => x).map((text2) => parseLinkedText(text2));

var convertInternalMediaPathToFileURI = (path) => path.startsWith("https://") ? URI.parse(path, true) : FileAccess.asFileUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);

var convertInternalMediaPathToBrowserURI = (path) => path.startsWith("https://") ? URI.parse(path, true) : FileAccess.asBrowserUri(`vs/workbench/contrib/welcomeGettingStarted/common/media/${path}`);

var convertInternalMediaPathsToBrowserURIs = (path) => {
  if (typeof path === "string") {
    const converted = convertInternalMediaPathToBrowserURI(path);
    return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
  } else {
    return {
      hcDark: convertInternalMediaPathToBrowserURI(path.hc),
      hcLight: convertInternalMediaPathToBrowserURI(path.hcLight ?? path.light),
      light: convertInternalMediaPathToBrowserURI(path.light),
      dark: convertInternalMediaPathToBrowserURI(path.dark)
    };
  }
};

var convertRelativeMediaPathsToWebviewURIs = (basePath, path) => {
  const convertPath = (path2) => path2.startsWith("https://") ? URI.parse(path2, true) : asWebviewUri(joinPath(basePath, path2));
  if (typeof path === "string") {
    const converted = convertPath(path);
    return { hcDark: converted, hcLight: converted, dark: converted, light: converted };
  } else {
    return {
      hcDark: convertPath(path.hc),
      hcLight: convertPath(path.hcLight ?? path.light),
      light: convertPath(path.light),
      dark: convertPath(path.dark)
    };
  }
};

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "resetGettingStartedProgress",
      category: localize2(21995, "Developer"),
      title: localize2(21997, "Reset Welcome Page Walkthrough Progress"),
      f1: true,
      metadata: {
        description: localize2(21996, "Reset the progress of all Walkthrough steps on the Welcome Page to make them appear as if they are being viewed for the first time, providing a fresh start to the getting started experience.")
      }
    });
  }
  run(accessor) {
    const gettingStartedService = accessor.get(IWalkthroughsService);
    const storageService = accessor.get(IStorageService);
    storageService.store(
      hiddenEntriesConfigurationKey,
      JSON.stringify([]),
      0 /* PROFILE */,
      0 /* USER */
    );
    storageService.store(
      walkthroughMetadataConfigurationKey,
      JSON.stringify([]),
      0 /* PROFILE */,
      0 /* USER */
    );
    const memento = new Memento("gettingStartedService", accessor.get(IStorageService));
    const record = memento.getMemento(0 /* PROFILE */, 0 /* USER */);
    for (const key3 in record) {
      if (Object.prototype.hasOwnProperty.call(record, key3)) {
        try {
          gettingStartedService.deprogressStep(key3);
        } catch (e) {
          console.error(e);
        }
      }
    }
    memento.saveMemento();
  }
});

registerSingleton(IWalkthroughsService, WalkthroughsService, 1 /* Delayed */);
export { HasMultipleNewFileEntries, IWalkthroughsService, hiddenEntriesConfigurationKey, walkthroughMetadataConfigurationKey, BUILT_IN_SOURCE, DAYS, NEW_WALKTHROUGH_TIME, WalkthroughsService, parseDescription, convertInternalMediaPathToFileURI, convertInternalMediaPathToBrowserURI, convertInternalMediaPathsToBrowserURIs, convertRelativeMediaPathsToWebviewURIs };
