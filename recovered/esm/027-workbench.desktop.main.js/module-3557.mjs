// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { startEntries } from "./module-3492.mjs";
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Delayer, Throttler } from "./module-0036.mjs";
import { $, addDisposableListener, append, clearNode, reset } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { generateUuid } from "./module-0190.mjs";
import { GettingStartedDetailsRenderer } from "./module-3550.mjs";
import { coalesce, equals } from "./module-0007.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { gettingStartedCheckedCodicon, gettingStartedUncheckedCodicon } from "./module-3551.mjs";
import { status } from "./module-0076.mjs";
import { IWorkspaceContextService, UNKNOWN_EMPTY_WINDOW_WORKSPACE } from "./module-0509.mjs";
import { restoreWalkthroughsConfigurationKey } from "./module-3554.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { URI } from "./module-0032.mjs";
import { OpenRecentAction } from "./module-1520.mjs";
import { WorkbenchStateContext } from "./module-0949.mjs";
import { OpenFileFolderAction, OpenFolderAction, OpenFolderViaWorkspaceAction } from "./module-1522.mjs";
import { IWalkthroughsService, hiddenEntriesConfigurationKey, parseDescription } from "./module-3495.mjs";
import { Schemas, matchesScheme } from "./module-0033.mjs";
import { AccessibleViewAction } from "./module-1375.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { Toggle } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultButtonStyles, defaultKeybindingLabelStyles, defaultToggleStyles } from "./module-0513.mjs";
import { canShowAgentsBanner, createAgentsBanner } from "./module-3556.mjs";
import { ITelemetryService, firstSessionDateStorageKey } from "./module-0093.mjs";
import { IWorkspacesService, isRecentFolder, isRecentWorkspace } from "./module-1379.mjs";
import { splitRecentLabel } from "./module-0711.mjs";
import { GettingStartedIndexList } from "./module-3555.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { IEditorGroupsService, preferredSideBySideGroupDirection } from "./module-0933.mjs";
import { GettingStartedInput } from "./module-3494.mjs";
import { parse2 } from "./module-0265.mjs";
import { Button } from "./module-0546.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { Link } from "./module-0550.mjs";
import { getTelemetryLevel } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IProductService } from "./module-0873.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IWorkbenchThemeService } from "./module-0916.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWebviewService } from "./module-1042.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts
var SLIDE_TRANSITION_TIME_MS = 250;

var configurationKey2 = "workbench.startupEditor";

var allWalkthroughsHiddenContext = new RawContextKey("allWalkthroughsHidden", false);

var inWelcomeContext = new RawContextKey("inWelcome", false);

var parsedStartEntries = startEntries.map((e, i2) => ({
  command: e.content.command,
  description: e.description,
  icon: { type: "icon", icon: e.icon },
  id: e.id,
  order: i2,
  title: e.title,
  when: ContextKeyExpr.deserialize(e.when) ?? ContextKeyExpr.true()
}));

var REDUCED_MOTION_KEY = "workbench.welcomePage.preferReducedMotion";

var GettingStartedPage = class extends EditorPane {
  constructor(group2, commandService, productService, keybindingService, gettingStartedService, configurationService, telemetryService, languageService, fileService, openerService, themeService, storageService, extensionService, instantiationService, notificationService, groupsService, contextService, quickInputService, workspacesService, labelService, hostService, webviewService, workspaceContextService, accessibilityService, markdownRendererService, chatEntitlementService) {
    super(GettingStartedPage.ID, group2, telemetryService, themeService, storageService);
    this.commandService = commandService;
    this.productService = productService;
    this.keybindingService = keybindingService;
    this.gettingStartedService = gettingStartedService;
    this.configurationService = configurationService;
    this.languageService = languageService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.themeService = themeService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.groupsService = groupsService;
    this.quickInputService = quickInputService;
    this.workspacesService = workspacesService;
    this.labelService = labelService;
    this.hostService = hostService;
    this.webviewService = webviewService;
    this.workspaceContextService = workspaceContextService;
    this.accessibilityService = accessibilityService;
    this.markdownRendererService = markdownRendererService;
    this.chatEntitlementService = chatEntitlementService;
    this.inProgressScroll = Promise.resolve();
    this.dispatchListeners = new DisposableStore();
    this.stepDisposables = new DisposableStore();
    this.detailsPageDisposables = new DisposableStore();
    this.mediaDisposables = new DisposableStore();
    this.detailsScrollbar = this._register(new MutableDisposable());
    this.buildSlideThrottle = this._register(new Throttler());
    this.recentlyOpenedList = this._register(new MutableDisposable());
    this.startList = this._register(new MutableDisposable());
    this.gettingStartedList = this._register(new MutableDisposable());
    this.showFeaturedWalkthrough = true;
    this.currentMediaComponent = void 0;
    this.currentMediaType = void 0;
    this.container = $(
      ".gettingStartedContainer",
      {
        role: "document",
        tabindex: 0,
        "aria-label": localize(21918, null)
      }
    );
    this.stepMediaComponent = $(".getting-started-media");
    this.stepMediaComponent.id = generateUuid();
    this.categoriesSlideDisposables = this._register(new DisposableStore());
    this.detailsRenderer = new GettingStartedDetailsRenderer(this.fileService, this.notificationService, this.extensionService, this.languageService);
    this.contextService = this._register(contextService.createScoped(this.container));
    inWelcomeContext.bindTo(this.contextService).set(true);
    this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
    this._register(this.dispatchListeners);
    const rerender = () => {
      this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
      if (this.currentWalkthrough) {
        const existingSteps = this.currentWalkthrough.steps.map((step) => step.id);
        const newCategory = this.gettingStartedCategories.find((category11) => this.currentWalkthrough?.id === category11.id);
        if (newCategory) {
          const newSteps = newCategory.steps.map((step) => step.id);
          if (!equals(newSteps, existingSteps)) {
            this.buildSlideThrottle.queue(() => this.buildCategoriesSlide());
          }
        }
      } else {
        this.buildSlideThrottle.queue(() => this.buildCategoriesSlide());
      }
    };
    this._register(this.gettingStartedService.onDidAddWalkthrough(rerender));
    this._register(this.gettingStartedService.onDidRemoveWalkthrough(rerender));
    this.recentlyOpened = this.workspacesService.getRecentlyOpened();
    this._register(workspacesService.onDidChangeRecentlyOpened(() => {
      this.recentlyOpened = workspacesService.getRecentlyOpened();
      this.refreshRecentlyOpened();
    }));
    this._register(this.gettingStartedService.onDidChangeWalkthrough((category11) => {
      const ourCategory = this.gettingStartedCategories.find((c) => c.id === category11.id);
      if (!ourCategory) {
        return;
      }
      ourCategory.title = category11.title;
      ourCategory.description = category11.description;
      this.container.querySelectorAll(`[x-category-title-for="${category11.id}"]`).forEach((step) => step.innerText = ourCategory.title);
      this.container.querySelectorAll(`[x-category-description-for="${category11.id}"]`).forEach((step) => step.innerText = ourCategory.description);
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(REDUCED_MOTION_KEY)) {
        this.container.classList.toggle("animatable", this.shouldAnimate());
      }
    }));
    this._register(this.gettingStartedService.onDidProgressStep((step) => {
      const category11 = this.gettingStartedCategories.find((c) => c.id === step.category);
      if (!category11) {
        throw Error("Could not find category with ID: " + step.category);
      }
      const ourStep = category11.steps.find((_step) => _step.id === step.id);
      if (!ourStep) {
        throw Error("Could not find step with ID: " + step.id);
      }
      const stats = this.getWalkthroughCompletionStats(category11);
      if (!ourStep.done && stats.stepsComplete === stats.stepsTotal - 1) {
        this.hideCategory(category11.id);
      }
      ourStep.done = step.done;
      if (category11.id === this.currentWalkthrough?.id) {
        const badgeelements = assertReturnsDefined(this.window.document.querySelectorAll(`[data-done-step-id="${step.id}"]`));
        badgeelements.forEach((badgeelement) => {
          if (step.done) {
            badgeelement.setAttribute("aria-checked", "true");
            badgeelement.parentElement?.setAttribute("aria-checked", "true");
            badgeelement.classList.remove(...ThemeIcon.asClassNameArray(gettingStartedUncheckedCodicon));
            badgeelement.classList.add("complete", ...ThemeIcon.asClassNameArray(gettingStartedCheckedCodicon));
            badgeelement.setAttribute("aria-label", localize(21911, null, step.title));
          } else {
            badgeelement.setAttribute("aria-checked", "false");
            badgeelement.parentElement?.setAttribute("aria-checked", "false");
            badgeelement.classList.remove("complete", ...ThemeIcon.asClassNameArray(gettingStartedCheckedCodicon));
            badgeelement.classList.add(...ThemeIcon.asClassNameArray(gettingStartedUncheckedCodicon));
            badgeelement.setAttribute("aria-label", localize(21912, null, step.title));
          }
        });
        if (step.done) {
          status(localize(21910, null, step.title));
        }
      }
      this.updateCategoryProgress();
    }));
    this._register(this.storageService.onWillSaveState((e) => {
      if (e.reason !== 1 /* SHUTDOWN */) {
        return;
      }
      if (this.workspaceContextService.getWorkspace().folders.length !== 0) {
        return;
      }
      if (!this.editorInput || !this.currentWalkthrough || !this.editorInput.selectedCategory || !this.editorInput.selectedStep) {
        return;
      }
      const editorPane = this.groupsService.activeGroup.activeEditorPane;
      if (!(editorPane instanceof GettingStartedPage)) {
        return;
      }
      const restoreData = { folder: UNKNOWN_EMPTY_WINDOW_WORKSPACE.id, category: this.editorInput.selectedCategory, step: this.editorInput.selectedStep };
      this.storageService.store(
        restoreWalkthroughsConfigurationKey,
        JSON.stringify(restoreData),
        0 /* PROFILE */,
        1 /* MACHINE */
      );
    }));
  }
  static {
    this.ID = "gettingStartedPage";
  }
  get editorInput() {
    return this._input;
  }
  // remove when 'workbench.welcomePage.preferReducedMotion' deprecated
  shouldAnimate() {
    if (this.configurationService.getValue(REDUCED_MOTION_KEY)) {
      return false;
    }
    if (this.accessibilityService.isMotionReduced()) {
      return false;
    }
    return true;
  }
  getWalkthroughCompletionStats(walkthrough) {
    const activeSteps = walkthrough.steps.filter((s) => this.contextService.contextMatchesRules(s.when));
    return {
      stepsComplete: activeSteps.filter((s) => s.done).length,
      stepsTotal: activeSteps.length
    };
  }
  async setInput(newInput, options3, context2, token) {
    await super.setInput(newInput, options3, context2, token);
    const selectedCategory = options3?.selectedCategory ?? newInput.selectedCategory;
    const selectedStep = options3?.selectedStep ?? newInput.selectedStep;
    await this.applyInput({ ...options3, selectedCategory, selectedStep });
  }
  async setOptions(options3) {
    super.setOptions(options3);
    if (!this.editorInput) {
      return;
    }
    if (this.editorInput.selectedCategory !== options3?.selectedCategory || this.editorInput.selectedStep !== options3?.selectedStep) {
      await this.applyInput(options3);
    }
  }
  async applyInput(options3) {
    if (!this.editorInput) {
      return;
    }
    this.editorInput.showTelemetryNotice = options3?.showTelemetryNotice ?? true;
    this.editorInput.selectedCategory = options3?.selectedCategory;
    this.editorInput.selectedStep = options3?.selectedStep;
    this.editorInput.returnToCommand = options3?.returnToCommand;
    this.container.classList.remove("animatable");
    await this.buildCategoriesSlide(options3?.preserveFocus);
    if (this.shouldAnimate()) {
      setTimeout(() => this.container.classList.add("animatable"), 0);
    }
  }
  async makeCategoryVisibleWhenAvailable(categoryID, stepId) {
    this.scrollToCategory(categoryID, stepId);
  }
  registerDispatchListeners() {
    this.dispatchListeners.clear();
    this.container.querySelectorAll("[x-dispatch]").forEach((element) => {
      const dispatch = element.getAttribute("x-dispatch") ?? "";
      let command4, argument;
      if (dispatch.startsWith("openLink:https")) {
        [command4, argument] = ["openLink", dispatch.replace("openLink:", "")];
      } else {
        [command4, argument] = dispatch.split(":");
      }
      if (command4) {
        this.dispatchListeners.add(addDisposableListener(element, "click", (e) => {
          e.stopPropagation();
          this.runDispatchCommand(command4, argument);
        }));
        this.dispatchListeners.add(addDisposableListener(element, "keyup", (e) => {
          const keyboardEvent = new StandardKeyboardEvent(e);
          e.stopPropagation();
          switch (keyboardEvent.keyCode) {
            case 3 /* Enter */:
            case 10 /* Space */:
              this.runDispatchCommand(command4, argument);
              return;
          }
        }));
      }
    });
  }
  /**
   * OpenCode: a walkthrough can advertise its own documentation through docsUrl. Links that
   * point at that site belong inside the app, so they open in the built-in browser:
   * `simpleBrowser.show` forwards to the integrated browser when that command exists and
   * otherwise opens the Simple Browser panel.
   */
  isWalkthroughDocsLink(href) {
    const docsUrl = this.currentWalkthrough?.docsUrl;
    if (!docsUrl || !(href.startsWith("https://") || href.startsWith("http://"))) {
      return false;
    }
    try {
      const target = URI.parse(href);
      const docs = URI.parse(docsUrl);
      return target.scheme === docs.scheme && target.authority === docs.authority;
    } catch {
      return false;
    }
  }
  openDocsInBuiltInBrowser(url) {
    this.commandService.executeCommand("simpleBrowser.show", url).catch(() => this.openerService.open(url));
  }
  async runDispatchCommand(command4, argument) {
    this.commandService.executeCommand("workbench.action.keepEditor");
    this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: command4, argument, walkthroughId: this.currentWalkthrough?.id });
    switch (command4) {
      case "scrollPrev": {
        this.scrollPrev();
        break;
      }
      case "skip": {
        this.runSkip();
        break;
      }
      case "showMoreRecents": {
        this.commandService.executeCommand(OpenRecentAction.ID);
        break;
      }
      case "seeAllWalkthroughs": {
        await this.openWalkthroughSelector();
        break;
      }
      case "openFolder": {
        if (this.contextService.contextMatchesRules(ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("workspace")))) {
          this.commandService.executeCommand(OpenFolderViaWorkspaceAction.ID);
        } else {
          this.commandService.executeCommand("workbench.action.files.openFolder");
        }
        break;
      }
      case "selectCategory": {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "selectCategory", argument, walkthroughId: this.currentWalkthrough?.id });
        this.scrollToCategory(argument);
        this.gettingStartedService.markWalkthroughOpened(argument);
        break;
      }
      case "selectStartEntry": {
        const selected = startEntries.find((e) => e.id === argument);
        if (selected) {
          this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "selectStartEntry", argument, walkthroughId: this.currentWalkthrough?.id });
          this.runStepCommand(selected.content.command);
        } else {
          throw Error("could not find start entry with id: " + argument);
        }
        break;
      }
      case "hideCategory": {
        this.hideCategory(argument);
        break;
      }
      // Use selectTask over selectStep to keep telemetry consistant:https://github.com/microsoft/vscode/issues/122256
      case "selectTask": {
        this.selectStep(argument);
        break;
      }
      case "toggleStepCompletion": {
        this.toggleStepCompletion(argument);
        break;
      }
      case "allDone": {
        this.markAllStepsComplete();
        break;
      }
      case "nextSection": {
        const next = this.currentWalkthrough?.next;
        if (next) {
          this.prevWalkthrough = this.currentWalkthrough;
          this.scrollToCategory(next);
        } else {
          console.error("Error scrolling to next section of", this.currentWalkthrough);
        }
        break;
      }
      case "openDocs": {
        const docsUrl = this.gettingStartedCategories.find((c) => c.id === argument)?.docsUrl;
        if (docsUrl) {
          this.openDocsInBuiltInBrowser(docsUrl);
        }
        break;
      }
      case "openLink": {
        if (this.isWalkthroughDocsLink(argument)) {
          this.openDocsInBuiltInBrowser(argument);
          break;
        }
        this.openerService.open(argument);
        break;
      }
      default: {
        console.error("Dispatch to", command4, argument, "not defined");
        break;
      }
    }
  }
  hideCategory(categoryId) {
    const selectedCategory = this.gettingStartedCategories.find((category11) => category11.id === categoryId);
    if (!selectedCategory) {
      throw Error("Could not find category with ID " + categoryId);
    }
    this.setHiddenCategories([...this.getHiddenCategories().add(categoryId)]);
    this.gettingStartedList.value?.rerender();
  }
  markAllStepsComplete() {
    if (this.currentWalkthrough) {
      this.currentWalkthrough?.steps.forEach((step) => {
        if (!step.done) {
          this.gettingStartedService.progressStep(step.id);
        }
      });
      this.hideCategory(this.currentWalkthrough?.id);
      this.scrollPrev();
    } else {
      throw Error("No walkthrough opened");
    }
  }
  toggleStepCompletion(argument) {
    const stepToggle = assertReturnsDefined(this.currentWalkthrough?.steps.find((step) => step.id === argument));
    if (stepToggle.done) {
      this.gettingStartedService.deprogressStep(argument);
    } else {
      this.gettingStartedService.progressStep(argument);
    }
  }
  async openWalkthroughSelector() {
    const selection = await this.quickInputService.pick(this.gettingStartedCategories.filter((c) => this.contextService.contextMatchesRules(c.when)).map((x) => ({
      id: x.id,
      label: x.title,
      detail: x.description,
      description: x.source
    })), { canPickMany: false, matchOnDescription: true, matchOnDetail: true, title: localize(21903, null) });
    if (selection) {
      this.runDispatchCommand("selectCategory", selection.id);
    }
  }
  getHiddenCategories() {
    return new Set(JSON.parse(this.storageService.get(hiddenEntriesConfigurationKey, 0 /* PROFILE */, "[]")));
  }
  setHiddenCategories(hidden) {
    this.storageService.store(
      hiddenEntriesConfigurationKey,
      JSON.stringify(hidden),
      0 /* PROFILE */,
      0 /* USER */
    );
  }
  async buildMediaComponent(stepId, forceRebuild = false) {
    if (!this.currentWalkthrough) {
      throw Error("no walkthrough selected");
    }
    const stepToExpand = assertReturnsDefined(this.currentWalkthrough.steps.find((step) => step.id === stepId));
    if (!forceRebuild && this.currentMediaComponent === stepId) {
      return;
    }
    this.currentMediaComponent = stepId;
    this.stepDisposables.clear();
    this.stepDisposables.add({
      dispose: () => {
        this.currentMediaComponent = void 0;
      }
    });
    if (this.currentMediaType !== stepToExpand.media.type) {
      this.mediaDisposables.clear();
      this.currentMediaType = stepToExpand.media.type;
      this.mediaDisposables.add(toDisposable(() => {
        this.currentMediaType = void 0;
      }));
      clearNode(this.stepMediaComponent);
      if (stepToExpand.media.type === "svg") {
        this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ title: void 0, options: { disableServiceWorker: true }, contentOptions: {}, extension: void 0 }));
        this.webview.mountTo(this.stepMediaComponent, this.window);
      } else if (stepToExpand.media.type === "markdown") {
        this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ options: {}, contentOptions: { localResourceRoots: [stepToExpand.media.root], allowScripts: true }, title: "", extension: void 0 }));
        this.webview.mountTo(this.stepMediaComponent, this.window);
      } else if (stepToExpand.media.type === "video") {
        this.webview = this.mediaDisposables.add(this.webviewService.createWebviewElement({ options: {}, contentOptions: { localResourceRoots: [stepToExpand.media.root], allowScripts: true }, title: "", extension: void 0 }));
        this.webview.mountTo(this.stepMediaComponent, this.window);
      }
    }
    if (stepToExpand.media.type === "image") {
      this.stepsContent.classList.add("image");
      this.stepsContent.classList.remove("markdown");
      this.stepsContent.classList.remove("video");
      const media = stepToExpand.media;
      const mediaElement = $("img");
      clearNode(this.stepMediaComponent);
      this.stepMediaComponent.appendChild(mediaElement);
      mediaElement.setAttribute("alt", media.altText);
      this.updateMediaSourceForColorMode(mediaElement, media.path);
      this.stepDisposables.add(addDisposableListener(this.stepMediaComponent, "click", () => {
        const hrefs = stepToExpand.description.map((lt2) => lt2.nodes.filter((node) => typeof node !== "string").map((node) => node.href)).flat();
        if (hrefs.length === 1) {
          const href = hrefs[0];
          if (href.startsWith("http")) {
            this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "runStepAction", argument: href, walkthroughId: this.currentWalkthrough?.id });
            this.openerService.open(href);
          }
        }
      }));
      this.stepDisposables.add(this.themeService.onDidColorThemeChange(() => this.updateMediaSourceForColorMode(mediaElement, media.path)));
    } else if (stepToExpand.media.type === "svg") {
      this.stepsContent.classList.add("image");
      this.stepsContent.classList.remove("markdown");
      this.stepsContent.classList.remove("video");
      const media = stepToExpand.media;
      this.webview.setHtml(await this.detailsRenderer.renderSVG(media.path));
      let isDisposed = false;
      this.stepDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
        const body = await this.detailsRenderer.renderSVG(media.path);
        if (!isDisposed) {
          this.webview.setHtml(body);
        }
      }));
      this.stepDisposables.add(addDisposableListener(this.stepMediaComponent, "click", () => {
        const hrefs = stepToExpand.description.map((lt2) => lt2.nodes.filter((node) => typeof node !== "string").map((node) => node.href)).flat();
        if (hrefs.length === 1) {
          const href = hrefs[0];
          if (href.startsWith("http")) {
            this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "runStepAction", argument: href, walkthroughId: this.currentWalkthrough?.id });
            this.openerService.open(href);
          }
        }
      }));
      this.stepDisposables.add(this.webview.onDidClickLink((link2) => {
        if (matchesScheme(link2, Schemas.https) || matchesScheme(link2, Schemas.http) || matchesScheme(link2, Schemas.command)) {
          this.openerService.open(link2, { allowCommands: true });
        }
      }));
    } else if (stepToExpand.media.type === "markdown") {
      this.stepsContent.classList.remove("image");
      this.stepsContent.classList.add("markdown");
      this.stepsContent.classList.remove("video");
      const media = stepToExpand.media;
      const rawHTML = await this.detailsRenderer.renderMarkdown(media.path, media.base);
      this.webview.setHtml(rawHTML);
      const serializedContextKeyExprs = rawHTML.match(/checked-on=\"([^'][^"]*)\"/g)?.map((attr) => attr.slice('checked-on="'.length, -1).replace(/&#39;/g, "'").replace(/&amp;/g, "&"));
      const postTrueKeysMessage = () => {
        const enabledContextKeys = serializedContextKeyExprs?.filter((expr) => this.contextService.contextMatchesRules(ContextKeyExpr.deserialize(expr)));
        if (enabledContextKeys) {
          this.webview.postMessage({
            enabledContextKeys
          });
        }
      };
      if (serializedContextKeyExprs) {
        const contextKeyExprs = coalesce(serializedContextKeyExprs.map((expr) => ContextKeyExpr.deserialize(expr)));
        const watchingKeys = new Set(contextKeyExprs.flatMap((expr) => expr.keys()));
        this.stepDisposables.add(this.contextService.onDidChangeContext((e) => {
          if (e.affectsSome(watchingKeys)) {
            postTrueKeysMessage();
          }
        }));
      }
      let isDisposed = false;
      this.stepDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.stepDisposables.add(this.webview.onDidClickLink((link2) => {
        if (matchesScheme(link2, Schemas.https) || matchesScheme(link2, Schemas.http) || matchesScheme(link2, Schemas.command)) {
          const toSide = link2.startsWith("command:toSide:");
          if (toSide) {
            link2 = link2.replace("command:toSide:", "command:");
            this.focusSideEditorGroup();
          }
          this.openerService.open(link2, { allowCommands: true, openToSide: toSide });
        }
      }));
      if (rawHTML.indexOf("<code>") >= 0) {
        this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
          const body = await this.detailsRenderer.renderMarkdown(media.path, media.base);
          if (!isDisposed) {
            this.webview.setHtml(body);
            postTrueKeysMessage();
          }
        }));
      }
      const layoutDelayer = new Delayer(50);
      this.layoutMarkdown = () => {
        layoutDelayer.trigger(() => {
          this.webview.postMessage({ layoutMeNow: true });
        });
      };
      this.stepDisposables.add(layoutDelayer);
      this.stepDisposables.add({ dispose: () => this.layoutMarkdown = void 0 });
      postTrueKeysMessage();
      this.stepDisposables.add(this.webview.onMessage(async (e) => {
        const message = e.message;
        if (message.startsWith("command:")) {
          this.openerService.open(message, { allowCommands: true });
        } else if (message.startsWith("setTheme:")) {
          const themeId = message.slice("setTheme:".length);
          const theme = (await this.themeService.getColorThemes()).find((theme2) => theme2.settingsId === themeId);
          if (theme) {
            this.themeService.setColorTheme(theme.id, 2 /* USER */);
          }
        } else {
          console.error("Unexpected message", message);
        }
      }));
    } else if (stepToExpand.media.type === "video") {
      this.stepsContent.classList.add("video");
      this.stepsContent.classList.remove("markdown");
      this.stepsContent.classList.remove("image");
      const media = stepToExpand.media;
      const themeType = this.themeService.getColorTheme().type;
      const videoPath = media.path[themeType];
      const videoPoster = media.poster ? media.poster[themeType] : void 0;
      const altText = media.altText ? media.altText : localize(21914, null, stepToExpand.title);
      const rawHTML = await this.detailsRenderer.renderVideo(videoPath, videoPoster, altText);
      this.webview.setHtml(rawHTML);
      let isDisposed = false;
      this.stepDisposables.add(toDisposable(() => {
        isDisposed = true;
      }));
      this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
        const themeType2 = this.themeService.getColorTheme().type;
        const videoPath2 = media.path[themeType2];
        const videoPoster2 = media.poster ? media.poster[themeType2] : void 0;
        const body = await this.detailsRenderer.renderVideo(videoPath2, videoPoster2, altText);
        if (!isDisposed) {
          this.webview.setHtml(body);
        }
      }));
    }
  }
  async selectStepLoose(id2) {
    if (!this.editorInput) {
      return;
    }
    if (id2.startsWith(`${this.editorInput.selectedCategory}#`)) {
      this.selectStep(id2);
    } else {
      const toSelect = this.editorInput.selectedCategory + "#" + id2;
      this.selectStep(toSelect);
    }
  }
  provideScreenReaderUpdate() {
    if (this.configurationService.getValue("accessibility.verbosity.walkthrough" /* Walkthrough */)) {
      const kbLabel = this.keybindingService.lookupKeybinding(AccessibleViewAction.id)?.getAriaLabel();
      return kbLabel ? localize(21884, null, kbLabel) : localize(21885, null);
    }
    return "";
  }
  async selectStep(id2, delayFocus = true, preserveFocus) {
    if (!this.editorInput) {
      return;
    }
    if (id2) {
      let stepElement = this.container.querySelector(`[data-step-id="${id2}"]`);
      if (!stepElement) {
        stepElement = this.container.querySelector(`[data-step-id]`);
        if (!stepElement) {
          return;
        }
        id2 = assertReturnsDefined(stepElement.getAttribute("data-step-id"));
      }
      stepElement.parentElement?.querySelectorAll(".expanded").forEach((node) => {
        if (node.getAttribute("data-step-id") !== id2) {
          node.classList.remove("expanded");
          node.setAttribute("aria-expanded", "false");
          const codiconElement2 = node.querySelector(".codicon");
          if (codiconElement2) {
            codiconElement2.removeAttribute("tabindex");
          }
        }
      });
      if (!preserveFocus) {
        setTimeout(() => stepElement.focus(), delayFocus && this.shouldAnimate() ? SLIDE_TRANSITION_TIME_MS : 0);
      }
      this.editorInput.selectedStep = id2;
      stepElement.classList.add("expanded");
      stepElement.setAttribute("aria-expanded", "true");
      this.buildMediaComponent(id2, true);
      const codiconElement = stepElement.querySelector(".codicon");
      if (codiconElement) {
        codiconElement.setAttribute("tabindex", "0");
      }
      this.gettingStartedService.progressByEvent("stepSelected:" + id2);
      const step = this.currentWalkthrough?.steps?.find((step2) => step2.id === id2);
      if (step) {
        stepElement.setAttribute("aria-label", `${this.provideScreenReaderUpdate()} ${step.title}`);
      }
    } else {
      this.editorInput.selectedStep = void 0;
    }
    this.detailsPageScrollbar?.scanDomNode();
    this.detailsScrollbar.value?.scanDomNode();
  }
  updateMediaSourceForColorMode(element, sources) {
    const themeType = this.themeService.getColorTheme().type;
    const src = sources[themeType].toString(true).replace(/ /g, "%20");
    element.srcset = src.toLowerCase().endsWith(".svg") ? src : src + " 1.5x";
  }
  createEditor(parent) {
    if (this.detailsPageScrollbar) {
      this.detailsPageScrollbar.dispose();
    }
    if (this.categoriesPageScrollbar) {
      this.categoriesPageScrollbar.dispose();
    }
    this.categoriesSlide = $(".gettingStartedSlideCategories.gettingStartedSlide");
    const prevButton = $("button.prev-button.button-link", { "x-dispatch": "scrollPrev" }, $("span.scroll-button.codicon.codicon-chevron-left"), $("span.moreText", {}, localize(21895, null)));
    this.stepsSlide = $(".gettingStartedSlideDetails.gettingStartedSlide", {}, prevButton);
    this.stepsContent = $(".gettingStartedDetailsContent", {});
    this.detailsPageScrollbar = this._register(new DomScrollableElement(this.stepsContent, { className: "full-height-scrollable", vertical: 2 /* Hidden */ }));
    this.categoriesPageScrollbar = this._register(new DomScrollableElement(this.categoriesSlide, { className: "full-height-scrollable categoriesScrollbar", vertical: 2 /* Hidden */ }));
    this.stepsSlide.appendChild(this.detailsPageScrollbar.getDomNode());
    const gettingStartedPage = $(".gettingStarted", {}, this.categoriesPageScrollbar.getDomNode(), this.stepsSlide);
    this.container.appendChild(gettingStartedPage);
    this.categoriesPageScrollbar.scanDomNode();
    this.detailsPageScrollbar.scanDomNode();
    parent.appendChild(this.container);
  }
  async buildCategoriesSlide(preserveFocus) {
    this.categoriesSlideDisposables.clear();
    const showOnStartupCheckbox = new Toggle({
      icon: Codicon.check,
      actionClassName: "getting-started-checkbox",
      isChecked: this.configurationService.getValue(configurationKey2) === "welcomePage",
      title: localize(21887, null),
      ...defaultToggleStyles
    });
    showOnStartupCheckbox.domNode.id = "showOnStartup";
    const showOnStartupLabel = $("label.caption", { for: "showOnStartup" }, localize(21922, null));
    const onShowOnStartupChanged = () => {
      if (showOnStartupCheckbox.checked) {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "showOnStartupChecked", argument: void 0, walkthroughId: this.currentWalkthrough?.id });
        this.configurationService.updateValue(configurationKey2, "welcomePage");
      } else {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "showOnStartupUnchecked", argument: void 0, walkthroughId: this.currentWalkthrough?.id });
        this.configurationService.updateValue(configurationKey2, "none");
      }
    };
    this.categoriesSlideDisposables.add(showOnStartupCheckbox);
    this.categoriesSlideDisposables.add(showOnStartupCheckbox.onChange(() => {
      onShowOnStartupChanged();
    }));
    this.categoriesSlideDisposables.add(addDisposableListener(showOnStartupLabel, "click", () => {
      showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
      onShowOnStartupChanged();
    }));
    const header2 = $(
      ".header",
      {},
      $("h1.product-name.caption", {}, this.productService.nameLong),
      $("p.subtitle.description", {}, localize(21892, null))
    );
    const leftColumn = $(".categories-column.categories-column-left", {});
    const rightColumn = $(".categories-column.categories-column-right", {});
    const startList = this.buildStartList();
    const recentList = this.buildRecentlyOpenedList();
    const gettingStartedList = this.buildGettingStartedWalkthroughsList();
    const footerChildren = [];
    if (canShowAgentsBanner(this.chatEntitlementService)) {
      const agentsBanner = createAgentsBanner(
        {
          cssClass: "getting-started-category.agents-banner",
          source: "welcomePage"
        },
        this.commandService,
        this.telemetryService
      );
      this.categoriesSlideDisposables.add(agentsBanner.disposables);
      footerChildren.push(agentsBanner.element);
    }
    footerChildren.push($(
      "p.showOnStartup",
      {},
      showOnStartupCheckbox.domNode,
      showOnStartupLabel
    ));
    const footer = $(".footer", {}, ...footerChildren);
    const layoutLists = () => {
      if (gettingStartedList.itemCount) {
        this.container.classList.remove("noWalkthroughs");
        reset(rightColumn, gettingStartedList.getDomElement());
      } else {
        this.container.classList.add("noWalkthroughs");
        reset(rightColumn);
      }
      setTimeout(() => this.categoriesPageScrollbar?.scanDomNode(), 50);
      layoutRecentList();
    };
    const layoutRecentList = () => {
      if (this.container.classList.contains("noWalkthroughs")) {
        recentList.setLimit(10);
        reset(leftColumn, startList.getDomElement());
        reset(rightColumn, recentList.getDomElement());
      } else {
        recentList.setLimit(5);
        reset(leftColumn, startList.getDomElement(), recentList.getDomElement());
      }
    };
    gettingStartedList.onDidChange(layoutLists);
    layoutLists();
    reset(this.categoriesSlide, $(".gettingStartedCategoriesContainer", {}, header2, leftColumn, rightColumn, footer));
    this.categoriesPageScrollbar?.scanDomNode();
    this.updateCategoryProgress();
    this.registerDispatchListeners();
    const editorInput = this.editorInput;
    if (editorInput?.selectedCategory) {
      this.currentWalkthrough = this.gettingStartedCategories.find((category11) => category11.id === editorInput.selectedCategory);
      if (!this.currentWalkthrough) {
        this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
        this.currentWalkthrough = this.gettingStartedCategories.find((category11) => category11.id === editorInput.selectedCategory);
        if (this.currentWalkthrough) {
          this.buildCategorySlide(editorInput.selectedCategory, editorInput.selectedStep, preserveFocus);
          this.setSlide("details");
          return;
        }
      } else {
        this.buildCategorySlide(editorInput.selectedCategory, editorInput.selectedStep, preserveFocus);
        this.setSlide("details");
        return;
      }
    }
    if (this.editorInput?.showTelemetryNotice && this.productService.openToWelcomeMainPage) {
      const telemetryNotice = $("p.telemetry-notice");
      this.buildTelemetryFooter(telemetryNotice);
      footer.appendChild(telemetryNotice);
    } else if (!this.productService.openToWelcomeMainPage && this.showFeaturedWalkthrough && this.storageService.isNew(-1 /* APPLICATION */) && !this.configurationService.getValue("workbench.welcomePage.experimentalOnboarding")) {
      const firstSessionDateString = this.storageService.get(firstSessionDateStorageKey, -1 /* APPLICATION */) || (/* @__PURE__ */ new Date()).toUTCString();
      const daysSinceFirstSession = (+/* @__PURE__ */ new Date() - +new Date(firstSessionDateString)) / 1e3 / 60 / 60 / 24;
      const fistContentBehaviour = daysSinceFirstSession < 1 ? "openToFirstCategory" : "index";
      if (fistContentBehaviour === "openToFirstCategory") {
        const first2 = this.gettingStartedCategories.filter((c) => !c.when || this.contextService.contextMatchesRules(c.when))[0];
        if (first2 && this.editorInput) {
          this.currentWalkthrough = first2;
          this.editorInput.selectedCategory = this.currentWalkthrough?.id;
          this.editorInput.walkthroughPageTitle = this.currentWalkthrough.walkthroughPageTitle;
          this.buildCategorySlide(this.editorInput.selectedCategory, void 0, preserveFocus);
          this.setSlide(
            "details",
            true
            /* firstLaunch */
          );
          return;
        }
      }
    }
    this.setSlide("categories");
  }
  buildRecentlyOpenedList() {
    const renderRecent = (recent) => {
      let fullPath;
      let windowOpenable;
      let resourceUri;
      if (isRecentFolder(recent)) {
        windowOpenable = { folderUri: recent.folderUri };
        fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.folderUri, { verbose: 2 /* LONG */ });
        resourceUri = recent.folderUri;
      } else {
        fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* LONG */ });
        windowOpenable = { workspaceUri: recent.workspace.configPath };
        resourceUri = recent.workspace.configPath;
      }
      const { name, parentPath } = splitRecentLabel(fullPath);
      const li = $("li");
      const link2 = $("button.button-link");
      link2.innerText = name;
      link2.title = fullPath;
      link2.setAttribute("aria-label", localize(21919, null, name, parentPath));
      link2.addEventListener("click", (e) => {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "openRecent", argument: void 0, walkthroughId: this.currentWalkthrough?.id });
        this.hostService.openWindow([windowOpenable], {
          forceNewWindow: e.ctrlKey || e.metaKey,
          remoteAuthority: recent.remoteAuthority || null
          // local window if remoteAuthority is not set or can not be deducted from the openable
        });
        e.preventDefault();
        e.stopPropagation();
      });
      li.appendChild(link2);
      const span = $("span");
      span.classList.add("path");
      span.classList.add("detail");
      span.innerText = parentPath;
      span.title = fullPath;
      li.appendChild(span);
      const deleteButton2 = $("a.codicon.codicon-close.hide-category-button.recently-opened-delete-button", {
        "tabindex": 0,
        "role": "button",
        "title": localize(21920, null),
        "aria-label": localize(21921, null, name)
      });
      const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.workspacesService.removeRecentlyOpened([resourceUri]);
      };
      deleteButton2.addEventListener("click", handleDelete);
      deleteButton2.addEventListener("keydown", async (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) {
          await handleDelete(e);
        }
      });
      li.appendChild(deleteButton2);
      return li;
    };
    const recentlyOpenedList = this.recentlyOpenedList.value = new GettingStartedIndexList(
      {
        title: localize(21905, null),
        klass: "recently-opened",
        limit: 5,
        empty: $(
          ".empty-recent",
          {},
          localize(21900, null),
          $("button.button-link", { "x-dispatch": "openFolder" }, localize(21901, null)),
          localize(21913, null)
        ),
        more: $(
          ".more",
          {},
          $(
            "button.button-link",
            {
              "x-dispatch": "showMoreRecents",
              title: localize(21906, null, this.getKeybindingLabel(OpenRecentAction.ID))
            },
            localize(21907, null)
          )
        ),
        renderElement: renderRecent,
        contextService: this.contextService
      }
    );
    recentlyOpenedList.onDidChange(() => this.registerDispatchListeners());
    this.recentlyOpened.then(({ workspaces }) => {
      const workspacesWithID = this.filterRecentlyOpened(workspaces);
      const updateEntries = () => {
        recentlyOpenedList.setEntries(workspacesWithID);
      };
      updateEntries();
      recentlyOpenedList.register(this.labelService.onDidChangeFormatters(() => updateEntries()));
    }).catch(onUnexpectedError);
    return recentlyOpenedList;
  }
  filterRecentlyOpened(workspaces) {
    return workspaces.filter((recent) => !this.workspaceContextService.isCurrentWorkspace(isRecentWorkspace(recent) ? recent.workspace : recent.folderUri)).map((recent) => ({ ...recent, id: isRecentWorkspace(recent) ? recent.workspace.id : recent.folderUri.toString() }));
  }
  refreshRecentlyOpened() {
    if (!this.recentlyOpenedList.value) {
      return;
    }
    this.recentlyOpened.then(({ workspaces }) => {
      const workspacesWithID = this.filterRecentlyOpened(workspaces);
      this.recentlyOpenedList.value?.setEntries(workspacesWithID);
    }).catch(onUnexpectedError);
  }
  buildStartList() {
    const renderStartEntry = (entry) => $(
      "li",
      {},
      $(
        "button.button-link",
        {
          "x-dispatch": "selectStartEntry:" + entry.id,
          title: entry.description + " " + this.getKeybindingLabel(entry.command)
        },
        this.iconWidgetFor(entry),
        $("span", {}, entry.title)
      )
    );
    const startList = this.startList.value = new GettingStartedIndexList(
      {
        title: localize(21909, null),
        klass: "start-container",
        limit: 10,
        renderElement: renderStartEntry,
        rankElement: (e) => -e.order,
        contextService: this.contextService
      }
    );
    startList.setEntries(parsedStartEntries);
    startList.onDidChange(() => this.registerDispatchListeners());
    return startList;
  }
  buildGettingStartedWalkthroughsList() {
    const renderGetttingStaredWalkthrough = (category11) => {
      const renderNewBadge = (category11.newItems || category11.newEntry) && !category11.isFeatured;
      const newBadge = $(".new-badge", {});
      if (category11.newEntry) {
        reset(newBadge, $(".new-category", {}, localize(21897, null)));
      } else if (category11.newItems) {
        reset(newBadge, $(".new-items", {}, localize(21898, null)));
      }
      const featuredBadge = $(".featured-badge", {});
      const descriptionContent = $(".description-content", {});
      if (category11.isFeatured && this.showFeaturedWalkthrough) {
        reset(featuredBadge, $(".featured", {}, $("span.featured-icon.codicon.codicon-star-full")));
        reset(descriptionContent, ...renderLabelWithIcons(category11.description));
      }
      const titleContent = $("h3.category-title.max-lines-3", { "x-category-title-for": category11.id });
      reset(titleContent, ...renderLabelWithIcons(category11.title));
      return $(
        "button.getting-started-category" + (category11.isFeatured && this.showFeaturedWalkthrough ? ".featured" : ""),
        {
          // Cards that advertise docsUrl jump straight to the documentation; every other
          // walkthrough keeps the upstream behaviour of expanding in place.
          "x-dispatch": category11.docsUrl ? "openDocs:" + category11.id : "selectCategory:" + category11.id,
          "title": category11.docsUrl ? localize(21908, null, category11.docsUrl) : category11.description
        },
        featuredBadge,
        $(
          ".main-content",
          {},
          this.iconWidgetFor(category11),
          titleContent,
          renderNewBadge ? newBadge : $(".no-badge"),
          $("a.codicon.codicon-close.hide-category-button", {
            "tabindex": 0,
            "x-dispatch": "hideCategory:" + category11.id,
            "title": localize(21888, null),
            "role": "button",
            "aria-label": localize(21889, null)
          })
        ),
        descriptionContent,
        $(
          ".category-progress",
          { "x-data-category-id": category11.id },
          $(
            ".progress-bar-outer",
            { "role": "progressbar" },
            $(".progress-bar-inner")
          )
        )
      );
    };
    const rankWalkthrough = (e) => {
      let rank = e.order;
      if (e.isFeatured) {
        rank += 7;
      }
      if (e.newEntry) {
        rank += 3;
      }
      if (e.newItems) {
        rank += 2;
      }
      if (e.recencyBonus) {
        rank += 4 * e.recencyBonus;
      }
      if (this.getHiddenCategories().has(e.id)) {
        rank = null;
      }
      return rank;
    };
    const gettingStartedList = this.gettingStartedList.value = new GettingStartedIndexList(
      {
        title: localize(21916, null),
        klass: "getting-started",
        limit: 5,
        footer: $("span.button-link.see-all-walkthroughs", { "x-dispatch": "seeAllWalkthroughs", "tabindex": 0 }, localize(21907, null)),
        renderElement: renderGetttingStaredWalkthrough,
        rankElement: rankWalkthrough,
        contextService: this.contextService
      }
    );
    gettingStartedList.onDidChange(() => {
      const hidden = this.getHiddenCategories();
      const someWalkthroughsHidden = hidden.size || gettingStartedList.itemCount < this.gettingStartedCategories.filter((c) => this.contextService.contextMatchesRules(c.when)).length;
      this.container.classList.toggle("someWalkthroughsHidden", !!someWalkthroughsHidden);
      this.registerDispatchListeners();
      allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
      this.updateCategoryProgress();
    });
    gettingStartedList.setEntries(this.gettingStartedCategories);
    allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
    return gettingStartedList;
  }
  layout(size3) {
    this.detailsScrollbar.value?.scanDomNode();
    this.categoriesPageScrollbar?.scanDomNode();
    this.detailsPageScrollbar?.scanDomNode();
    this.startList.value?.layout(size3);
    this.gettingStartedList.value?.layout(size3);
    this.recentlyOpenedList.value?.layout(size3);
    if (this.editorInput?.selectedStep && this.currentMediaType) {
      this.mediaDisposables.clear();
      this.stepDisposables.clear();
      this.buildMediaComponent(this.editorInput.selectedStep);
    }
    this.layoutMarkdown?.();
    this.container.classList.toggle("height-constrained", size3.height <= 600);
    this.container.classList.toggle("width-constrained", size3.width <= 400);
    this.container.classList.toggle("width-semi-constrained", size3.width <= 950);
    this.categoriesPageScrollbar?.scanDomNode();
    this.detailsPageScrollbar?.scanDomNode();
    this.detailsScrollbar.value?.scanDomNode();
  }
  updateCategoryProgress() {
    this.window.document.querySelectorAll(".category-progress").forEach((element) => {
      const categoryID = element.getAttribute("x-data-category-id");
      const category11 = this.gettingStartedCategories.find((c) => c.id === categoryID);
      if (!category11) {
        return;
      }
      const stats = this.getWalkthroughCompletionStats(category11);
      const bar = assertReturnsDefined(element.querySelector(".progress-bar-inner"));
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuenow", "" + stats.stepsComplete);
      bar.setAttribute("aria-valuemax", "" + stats.stepsTotal);
      const progress = stats.stepsComplete / stats.stepsTotal * 100;
      bar.style.width = `${progress}%`;
      element.parentElement.classList.toggle("no-progress", stats.stepsComplete === 0);
      if (stats.stepsTotal === stats.stepsComplete) {
        bar.title = localize(21891, null, stats.stepsComplete);
      } else {
        bar.title = localize(21894, null, stats.stepsComplete, stats.stepsTotal);
      }
    });
  }
  async scrollToCategory(categoryID, stepId) {
    if (!this.gettingStartedCategories.some((c) => c.id === categoryID)) {
      this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
    }
    const ourCategory = this.gettingStartedCategories.find((c) => c.id === categoryID);
    if (!ourCategory) {
      throw Error("Could not find category with ID: " + categoryID);
    }
    this.inProgressScroll = this.inProgressScroll.then(async () => {
      if (!this.editorInput) {
        return;
      }
      reset(this.stepsContent);
      this.editorInput.selectedCategory = categoryID;
      this.editorInput.selectedStep = stepId;
      this.editorInput.walkthroughPageTitle = ourCategory.walkthroughPageTitle;
      this.currentWalkthrough = ourCategory;
      this.buildCategorySlide(categoryID, stepId);
      this.setSlide("details");
    });
  }
  iconWidgetFor(category11) {
    const widget = category11.icon.type === "icon" ? $(ThemeIcon.asCSSSelector(category11.icon.icon)) : $("img.category-icon", { src: category11.icon.path });
    widget.classList.add("icon-widget");
    return widget;
  }
  focusSideEditorGroup() {
    const fullSize = this.groupsService.getPart(this.group).contentDimension;
    if (!fullSize || fullSize.width <= 700 || this.container.classList.contains("width-constrained") || this.container.classList.contains("width-semi-constrained")) {
      return;
    }
    if (this.groupsService.count === 1) {
      const editorGroupSplitDirection = preferredSideBySideGroupDirection(this.configurationService);
      const sideGroup = this.groupsService.addGroup(this.groupsService.groups[0], editorGroupSplitDirection);
      this.groupsService.activateGroup(sideGroup);
    }
    const nonGettingStartedGroup = this.groupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).find((group2) => !(group2.activeEditor instanceof GettingStartedInput));
    if (nonGettingStartedGroup) {
      this.groupsService.activateGroup(nonGettingStartedGroup);
      nonGettingStartedGroup.focus();
    }
  }
  runStepCommand(href) {
    const isCommand = href.startsWith("command:");
    const toSide = href.startsWith("command:toSide:");
    const command4 = href.replace(/command:(toSide:)?/, "command:");
    this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { command: "runStepAction", argument: href, walkthroughId: this.currentWalkthrough?.id });
    if (toSide) {
      this.focusSideEditorGroup();
    }
    if (isCommand) {
      const commandURI = URI.parse(command4);
      let args2 = [];
      try {
        args2 = parse2(decodeURIComponent(commandURI.query));
      } catch {
        try {
          args2 = parse2(commandURI.query);
        } catch {
        }
      }
      if (!Array.isArray(args2)) {
        args2 = [args2];
      }
      if ((commandURI.path === OpenFileFolderAction.ID.toString() || commandURI.path === OpenFolderAction.ID.toString()) && this.workspaceContextService.getWorkspace().folders.length === 0) {
        const selectedStepIndex = this.currentWalkthrough?.steps.findIndex((step) => step.id === this.editorInput?.selectedStep);
        if (selectedStepIndex !== void 0 && selectedStepIndex > -1 && this.currentWalkthrough?.steps.slice(selectedStepIndex + 1).some((step) => !step.done)) {
          const restoreData = { folder: UNKNOWN_EMPTY_WINDOW_WORKSPACE.id, category: this.editorInput?.selectedCategory, step: this.editorInput?.selectedStep };
          this.storageService.store(
            restoreWalkthroughsConfigurationKey,
            JSON.stringify(restoreData),
            0 /* PROFILE */,
            1 /* MACHINE */
          );
        }
      }
      this.commandService.executeCommand(commandURI.path, ...args2).then((result) => {
        const toOpen = result?.openFolder;
        if (toOpen) {
          if (!URI.isUri(toOpen)) {
            console.warn("Warn: Running walkthrough command", href, "yielded non-URI `openFolder` result", toOpen, ". It will be disregarded.");
            return;
          }
          const restoreData = { folder: toOpen.toString(), category: this.editorInput?.selectedCategory, step: this.editorInput?.selectedStep };
          this.storageService.store(
            restoreWalkthroughsConfigurationKey,
            JSON.stringify(restoreData),
            0 /* PROFILE */,
            1 /* MACHINE */
          );
          this.hostService.openWindow([{ folderUri: toOpen }]);
        }
      });
    } else if (this.isWalkthroughDocsLink(command4)) {
      this.openDocsInBuiltInBrowser(command4);
    } else {
      this.openerService.open(command4, { allowCommands: true });
    }
    if (!isCommand && (href.startsWith("https://") || href.startsWith("http://"))) {
      this.gettingStartedService.progressByEvent("onLink:" + href);
    }
  }
  buildMarkdownDescription(container3, text2) {
    while (container3.firstChild) {
      container3.firstChild.remove();
    }
    for (const linkedText of text2) {
      if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== "string") {
        const node = linkedText.nodes[0];
        const buttonContainer = append(container3, $(".button-container"));
        const button = new Button(buttonContainer, { title: node.title, supportIcons: true, ...defaultButtonStyles });
        const isCommand = node.href.startsWith("command:");
        const command4 = node.href.replace(/command:(toSide:)?/, "command:");
        button.label = node.label;
        button.onDidClick((e) => {
          e.stopPropagation();
          e.preventDefault();
          this.runStepCommand(node.href);
        }, null, this.detailsPageDisposables);
        if (isCommand) {
          const keybinding = this.getKeyBinding(command4);
          if (keybinding) {
            const shortcutMessage = $("span.shortcut-message", {}, localize(21893, null));
            container3.appendChild(shortcutMessage);
            const label3 = new KeybindingLabel(shortcutMessage, OS, { ...defaultKeybindingLabelStyles });
            label3.set(keybinding);
            this.detailsPageDisposables.add(label3);
          }
        }
        this.detailsPageDisposables.add(button);
      } else {
        const p = append(container3, $("p"));
        for (const node of linkedText.nodes) {
          if (typeof node === "string") {
            const labelWithIcon = renderLabelWithIcons(node);
            for (const element of labelWithIcon) {
              if (typeof element === "string") {
                p.appendChild(renderFormattedText(element, { renderCodeSegments: true }, $("span")));
              } else {
                p.appendChild(element);
              }
            }
          } else {
            const nodeWithTitle = matchesScheme(node.href, Schemas.http) || matchesScheme(node.href, Schemas.https) ? { ...node, title: node.href } : node;
            const link2 = this.instantiationService.createInstance(Link, p, nodeWithTitle, { opener: (href) => this.runStepCommand(href) });
            this.detailsPageDisposables.add(link2);
          }
        }
      }
    }
    return container3;
  }
  clearInput() {
    this.stepDisposables.clear();
    super.clearInput();
  }
  buildCategorySlide(categoryID, selectedStep, preserveFocus) {
    if (!this.editorInput) {
      return;
    }
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      this.extensionService.activateByEvent(`onWalkthrough:${categoryID.replace(/[^#]+#/, "")}`);
    });
    this.detailsPageDisposables.clear();
    this.mediaDisposables.clear();
    const category11 = this.gettingStartedCategories.find((category12) => category12.id === categoryID);
    if (!category11) {
      throw Error("could not find category with ID " + categoryID);
    }
    const descriptionContainer = $(".category-description.description.max-lines-3", { "x-category-description-for": category11.id });
    this.buildMarkdownDescription(descriptionContainer, parseDescription(category11.description));
    const categoryDescriptorComponent = $(
      ".getting-started-category",
      {},
      $(
        ".category-description-container",
        {},
        $("h2.category-title.max-lines-3", { "x-category-title-for": category11.id }, ...renderLabelWithIcons(category11.title)),
        descriptionContainer
      )
    );
    const stepListContainer = $(".step-list-container");
    this.detailsPageDisposables.add(addDisposableListener(stepListContainer, "keydown", (e) => {
      const event = new StandardKeyboardEvent(e);
      const currentStepIndex = () => category11.steps.findIndex((e2) => e2.id === this.editorInput?.selectedStep);
      if (event.keyCode === 16 /* UpArrow */) {
        const toExpand2 = category11.steps.filter((step, index2) => index2 < currentStepIndex() && this.contextService.contextMatchesRules(step.when));
        if (toExpand2.length) {
          this.selectStep(toExpand2[toExpand2.length - 1].id, false);
        }
      }
      if (event.keyCode === 18 /* DownArrow */) {
        const toExpand2 = category11.steps.find((step, index2) => index2 > currentStepIndex() && this.contextService.contextMatchesRules(step.when));
        if (toExpand2) {
          this.selectStep(toExpand2.id, false);
        }
      }
    }));
    let renderedSteps = void 0;
    const contextKeysToWatch = new Set(category11.steps.flatMap((step) => step.when.keys()));
    const buildStepList = () => {
      category11.steps.sort((a, b) => a.order - b.order);
      const toRender = category11.steps.filter((step) => this.contextService.contextMatchesRules(step.when));
      if (equals(renderedSteps, toRender, (a, b) => a.id === b.id)) {
        return;
      }
      renderedSteps = toRender;
      reset(stepListContainer, ...renderedSteps.map((step) => {
        const codicon = $(
          ".codicon" + (step.done ? ".complete" + ThemeIcon.asCSSSelector(gettingStartedCheckedCodicon) : ThemeIcon.asCSSSelector(gettingStartedUncheckedCodicon)),
          {
            "data-done-step-id": step.id,
            "x-dispatch": "toggleStepCompletion:" + step.id,
            "role": "checkbox",
            "aria-checked": step.done ? "true" : "false",
            "aria-label": step.done ? localize(21911, null, step.title) : localize(21912, null, step.title)
          }
        );
        const container3 = $(".step-description-container", { "x-step-description-for": step.id });
        this.buildMarkdownDescription(container3, step.description);
        const stepTitle = $("h3.step-title.max-lines-3", { "x-step-title-for": step.id });
        reset(stepTitle, ...renderLabelWithIcons(step.title));
        const stepDescription = $(
          ".step-container",
          {},
          stepTitle,
          container3
        );
        if (step.media.type === "image") {
          stepDescription.appendChild(
            $(".image-description", { "aria-label": localize(21896, null, step.media.altText) })
          );
        } else if (step.media.type === "video") {
          stepDescription.appendChild(
            $(".video-description", { "aria-label": localize(21915, null, step.media.altText) })
          );
        }
        return $(
          "button.getting-started-step",
          {
            "x-dispatch": "selectTask:" + step.id,
            "data-step-id": step.id,
            "aria-expanded": "false",
            "aria-checked": step.done ? "true" : "false",
            "role": "button"
          },
          codicon,
          stepDescription
        );
      }));
    };
    buildStepList();
    this.detailsPageDisposables.add(this.contextService.onDidChangeContext((e) => {
      if (e.affectsSome(contextKeysToWatch) && this.currentWalkthrough && this.editorInput) {
        buildStepList();
        this.registerDispatchListeners();
        this.selectStep(this.editorInput.selectedStep, false);
      }
    }));
    const showNextCategory = this.gettingStartedCategories.find((_category) => _category.id === category11.next);
    const stepsContainer = $(
      ".getting-started-detail-container",
      { "role": "list" },
      stepListContainer,
      $(
        ".done-next-container",
        {},
        $("button.button-link.all-done", { "x-dispatch": "allDone" }, $("span.codicon.codicon-check-all"), localize(21886, null)),
        ...showNextCategory ? [$("button.button-link.next", { "x-dispatch": "nextSection" }, localize(21899, null), $("span.codicon.codicon-arrow-right"))] : []
      )
    );
    this.detailsScrollbar.value = new DomScrollableElement(stepsContainer, { className: "steps-container" });
    const stepListComponent = this.detailsScrollbar.value.getDomNode();
    const categoryFooter = $(".getting-started-footer");
    if (this.editorInput.showTelemetryNotice && getTelemetryLevel(this.configurationService) !== 0 /* NONE */ && this.productService.enableTelemetry) {
      this.buildTelemetryFooter(categoryFooter);
    }
    reset(this.stepsContent, categoryDescriptorComponent, stepListComponent, this.stepMediaComponent, categoryFooter);
    const toExpand = category11.steps.find((step) => this.contextService.contextMatchesRules(step.when) && !step.done) ?? category11.steps[0];
    this.selectStep(selectedStep ?? toExpand.id, !selectedStep, preserveFocus);
    this.detailsScrollbar.value?.scanDomNode();
    this.detailsPageScrollbar?.scanDomNode();
    this.registerDispatchListeners();
  }
  buildTelemetryFooter(parent) {
    const privacyStatementCopy = localize(21904, null);
    const privacyStatementButton = `[${privacyStatementCopy}](command:workbench.action.openPrivacyStatementUrl)`;
    const optOutCopy = localize(21902, null);
    const optOutButton = `[${optOutCopy}](command:settings.filterByTelemetry)`;
    const text2 = localize(
      21890,
      null,
      this.productService.nameShort,
      privacyStatementButton,
      optOutButton
    );
    const renderedContents = this.detailsPageDisposables.add(this.markdownRendererService.render({ value: text2, isTrusted: true }));
    parent.append(renderedContents.element);
  }
  getKeybindingLabel(command4) {
    command4 = command4.replace(/^command:/, "");
    const label3 = this.keybindingService.lookupKeybinding(command4)?.getLabel();
    if (!label3) {
      return "";
    } else {
      return `(${label3})`;
    }
  }
  getKeyBinding(command4) {
    command4 = command4.replace(/^command:/, "");
    return this.keybindingService.lookupKeybinding(command4);
  }
  async scrollPrev() {
    this.inProgressScroll = this.inProgressScroll.then(async () => {
      if (this.prevWalkthrough && this.prevWalkthrough !== this.currentWalkthrough) {
        this.currentWalkthrough = this.prevWalkthrough;
        this.prevWalkthrough = void 0;
        this.makeCategoryVisibleWhenAvailable(this.currentWalkthrough.id);
      } else if (this.editorInput?.returnToCommand) {
        this.commandService.executeCommand(this.editorInput.returnToCommand);
      } else {
        this.currentWalkthrough = void 0;
        if (this.editorInput) {
          this.editorInput.selectedCategory = void 0;
          this.editorInput.selectedStep = void 0;
          this.editorInput.showTelemetryNotice = false;
          this.editorInput.walkthroughPageTitle = void 0;
        }
        if (this.gettingStartedCategories.length !== this.gettingStartedList.value?.itemCount) {
          this.buildCategoriesSlide();
        }
        this.selectStep(void 0);
        this.setSlide("categories");
        this.container.focus();
      }
    });
  }
  runSkip() {
    this.commandService.executeCommand("workbench.action.closeActiveEditor");
  }
  escape() {
    if (this.editorInput?.selectedCategory) {
      this.scrollPrev();
    } else {
      this.runSkip();
    }
  }
  setSlide(toEnable, firstLaunch = false) {
    const slideManager = assertReturnsDefined(this.container.querySelector(".gettingStarted"));
    if (toEnable === "categories") {
      slideManager.classList.remove("showDetails");
      slideManager.classList.add("showCategories");
      this.container.querySelector(".prev-button.button-link").style.display = "none";
      this.container.querySelector(".gettingStartedSlideDetails").querySelectorAll("button").forEach((button) => button.disabled = true);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("button").forEach((button) => button.disabled = false);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("input").forEach((button) => button.disabled = false);
    } else {
      slideManager.classList.add("showDetails");
      slideManager.classList.remove("showCategories");
      const prevButton = this.container.querySelector(".prev-button.button-link");
      prevButton.style.display = this.editorInput?.showWelcome || this.editorInput?.returnToCommand || this.prevWalkthrough ? "block" : "none";
      const moreTextElement = prevButton.querySelector(".moreText");
      moreTextElement.textContent = firstLaunch ? localize(21917, null) : localize(21895, null);
      this.container.querySelector(".gettingStartedSlideDetails").querySelectorAll("button").forEach((button) => button.disabled = false);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("button").forEach((button) => button.disabled = true);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("input").forEach((button) => button.disabled = true);
    }
  }
  focus() {
    super.focus();
    const active = this.container.ownerDocument.activeElement;
    let parent = this.container.parentElement;
    while (parent && parent !== active) {
      parent = parent.parentElement;
    }
    if (parent) {
      this.container.focus();
    }
  }
};

GettingStartedPage = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IWalkthroughsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IWorkbenchThemeService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IExtensionService),
  __decorateParam(13, IInstantiationService),
  __decorateParam(14, INotificationService),
  __decorateParam(15, IEditorGroupsService),
  __decorateParam(16, IContextKeyService),
  __decorateParam(17, IQuickInputService),
  __decorateParam(18, IWorkspacesService),
  __decorateParam(19, ILabelService),
  __decorateParam(20, IHostService),
  __decorateParam(21, IWebviewService),
  __decorateParam(22, IWorkspaceContextService),
  __decorateParam(23, IAccessibilityService),
  __decorateParam(24, IMarkdownRendererService),
  __decorateParam(25, IChatEntitlementService)
], GettingStartedPage);

var GettingStartedInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return JSON.stringify({ selectedCategory: editorInput.selectedCategory, selectedStep: editorInput.selectedStep });
  }
  deserialize(instantiationService, serializedEditorInput) {
    return instantiationService.invokeFunction((accessor) => {
      try {
        const { selectedCategory, selectedStep } = JSON.parse(serializedEditorInput);
        return new GettingStartedInput({ selectedCategory, selectedStep });
      } catch {
      }
      return new GettingStartedInput({});
    });
  }
};
export { SLIDE_TRANSITION_TIME_MS, configurationKey2, allWalkthroughsHiddenContext, inWelcomeContext, parsedStartEntries, REDUCED_MOTION_KEY, GettingStartedPage, GettingStartedInputSerializer };
