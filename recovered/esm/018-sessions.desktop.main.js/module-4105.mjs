// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/browser/baseIssueReporterService.ts
import { Disposable } from "./module-0012.mjs";
import { Delayer, RunOnceScheduler } from "./module-0036.mjs";
import { IssueReporterModel } from "./module-4095.mjs";
import { isLinuxSnap, isMacintosh } from "./module-0014.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { getIconsStyleSheet } from "./module-1628.mjs";
import { escape } from "./module-0030.mjs";
import { Button, ButtonWithDropdown, unthemedButtonStyles } from "./module-0546.mjs";
import { URI } from "./module-0032.mjs";
import { renderIcon } from "./module-0467.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { groupBy } from "./module-0003.mjs";
import { $, isHTMLInputElement, isHTMLTextAreaElement, reset } from "./module-0075.mjs";
import { Schemas } from "./module-0033.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { CancellationError } from "./module-0004.mjs";
import { normalizeGitHubUrl } from "./module-4094.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0250.mjs";
import { IIssueFormService } from "./module-1852.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/issue/browser/baseIssueReporterService.ts
var MAX_URL_LENGTH = 7500;

var MAX_EXTENSION_DATA_LENGTH = 6e4;

var BaseIssueReporterService = class extends Disposable {
  constructor(disableExtensions, data, os, product2, window2, isWeb2, issueFormService, themeService, fileService, fileDialogService, contextMenuService, authenticationService, openerService) {
    super();
    this.disableExtensions = disableExtensions;
    this.data = data;
    this.os = os;
    this.product = product2;
    this.window = window2;
    this.isWeb = isWeb2;
    this.issueFormService = issueFormService;
    this.themeService = themeService;
    this.fileService = fileService;
    this.fileDialogService = fileDialogService;
    this.contextMenuService = contextMenuService;
    this.authenticationService = authenticationService;
    this.openerService = openerService;
    this.receivedSystemInfo = false;
    this.numberOfSearchResultsDisplayed = 0;
    this.receivedPerformanceInfo = false;
    this.shouldQueueSearch = false;
    this.hasBeenSubmitted = false;
    this.openReporter = false;
    this.loadingExtensionData = false;
    this.selectedExtension = "";
    this.delayedSubmit = new Delayer(300);
    this.nonGitHubIssueUrl = false;
    this.needsUpdate = false;
    this.acknowledged = false;
    const targetExtension = data.extensionId ? data.enabledExtensions.find((extension) => extension.id.toLocaleLowerCase() === data.extensionId?.toLocaleLowerCase()) : void 0;
    this.issueReporterModel = new IssueReporterModel({
      ...data,
      issueType: data.issueType || 0 /* Bug */,
      versionInfo: {
        vscodeVersion: `${product2.nameShort} ${!!product2.darwinUniversalAssetId ? `${product2.version} (Universal)` : product2.version} (${product2.commit || "Commit unknown"}, ${product2.date || "Date unknown"})`,
        os: `${this.os.type} ${this.os.arch} ${this.os.release}${isLinuxSnap ? " snap" : ""}`
      },
      extensionsDisabled: !!this.disableExtensions,
      fileOnExtension: data.extensionId ? !targetExtension?.isBuiltin : void 0,
      selectedExtension: targetExtension
    });
    this._register(this.authenticationService.onDidChangeSessions(async () => {
      const previousAuthState = !!this.data.githubAccessToken;
      let githubAccessToken = "";
      try {
        const githubSessions = await this.authenticationService.getSessions("github");
        const potentialSessions = githubSessions.filter((session) => session.scopes.includes("repo"));
        githubAccessToken = potentialSessions[0]?.accessToken;
      } catch (e4) {
      }
      this.data.githubAccessToken = githubAccessToken;
      const currentAuthState = !!githubAccessToken;
      if (previousAuthState !== currentAuthState) {
        this.updateButtonStates();
      }
    }));
    const fileOnMarketplace = data.issueSource === "marketplace" /* Marketplace */;
    const fileOnProduct = data.issueSource === "vscode" /* VSCode */;
    this.issueReporterModel.update({ fileOnMarketplace, fileOnProduct });
    this.createAction = this._register(new Action("issueReporter.create", localize(16235, null), void 0, true, async () => {
      this.delayedSubmit.trigger(async () => {
        this.setSubmittingState(true);
        try {
          await this.createIssue(true);
        } finally {
          this.setSubmittingState(false);
        }
      });
    }));
    this.previewAction = this._register(new Action("issueReporter.preview", localize(16255, null), void 0, true, async () => {
      this.delayedSubmit.trigger(async () => {
        this.setSubmittingState(true);
        try {
          await this.createIssue(false);
        } finally {
          this.setSubmittingState(false);
        }
      });
    }));
    this.privateAction = this._register(new Action("issueReporter.privateCreate", localize(16257, null), void 0, true, async () => {
      this.delayedSubmit.trigger(async () => {
        this.setSubmittingState(true);
        try {
          await this.createIssue(true, true);
        } finally {
          this.setSubmittingState(false);
        }
      });
    }));
    const issueTitle = data.issueTitle;
    if (issueTitle) {
      const issueTitleElement = this.getElementById("issue-title");
      if (issueTitleElement) {
        issueTitleElement.value = issueTitle;
      }
    }
    const issueBody = data.issueBody;
    if (issueBody) {
      const description = this.getElementById("description");
      if (description) {
        description.value = issueBody;
        this.issueReporterModel.update({ issueDescription: issueBody });
      }
    }
    if (this.window.document.documentElement.lang !== "en") {
      show2(this.getElementById("english"));
    }
    const codiconStyleSheet = createStyleSheet();
    codiconStyleSheet.id = "codiconStyles";
    const iconsStyleSheet = this._register(getIconsStyleSheet(this.themeService));
    function updateAll() {
      codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
    }
    const delayer5 = new RunOnceScheduler(updateAll, 0);
    this._register(iconsStyleSheet.onDidChange(() => delayer5.schedule()));
    delayer5.schedule();
    this.handleExtensionData(data.enabledExtensions);
    this.setUpTypes();
    if ((data.data || data.uri) && targetExtension) {
      this.updateExtensionStatus(targetExtension);
    }
    const issueReporterElement = this.getElementById("issue-reporter");
    if (issueReporterElement) {
      this.updateButtonStates();
    }
  }
  render() {
    this.renderBlocks();
  }
  setInitialFocus() {
    const { fileOnExtension } = this.issueReporterModel.getData();
    if (fileOnExtension) {
      const issueTitle = this.window.document.getElementById("issue-title");
      issueTitle?.focus();
    } else {
      const issueType = this.window.document.getElementById("issue-type");
      issueType?.focus();
    }
  }
  updateButtonStates() {
    const issueReporterElement = this.getElementById("issue-reporter");
    if (!issueReporterElement) {
      return;
    }
    let publicElements = this.getElementById("public-elements");
    if (!publicElements) {
      publicElements = document.createElement("div");
      publicElements.id = "public-elements";
      publicElements.classList.add("public-elements");
      issueReporterElement.appendChild(publicElements);
    }
    this.updatePublicGithubButton(publicElements);
    this.updatePublicRepoLink(publicElements);
    let internalElements = this.getElementById("internal-elements");
    if (!internalElements) {
      internalElements = document.createElement("div");
      internalElements.id = "internal-elements";
      internalElements.classList.add("internal-elements");
      internalElements.classList.add("hidden");
      issueReporterElement.appendChild(internalElements);
    }
    let filingRow = this.getElementById("internal-top-row");
    if (!filingRow) {
      filingRow = document.createElement("div");
      filingRow.id = "internal-top-row";
      filingRow.classList.add("internal-top-row");
      internalElements.appendChild(filingRow);
    }
    this.updateInternalFilingNote(filingRow);
    this.updateInternalGithubButton(filingRow);
    this.updateInternalElementsVisibility();
  }
  updateInternalFilingNote(container2) {
    let filingNote = this.getElementById("internal-preview-message");
    if (!filingNote) {
      filingNote = document.createElement("span");
      filingNote.id = "internal-preview-message";
      filingNote.classList.add("internal-preview-message");
      container2.appendChild(filingNote);
    }
    filingNote.textContent = escape(localize(16247, null));
  }
  updatePublicGithubButton(container2) {
    const issueReporterElement = this.getElementById("issue-reporter");
    if (!issueReporterElement) {
      return;
    }
    if (this.publicGithubButton) {
      this.publicGithubButton.dispose();
    }
    if (!this.acknowledged && this.needsUpdate) {
      this.publicGithubButton = this._register(new Button(container2, unthemedButtonStyles));
      this.publicGithubButton.label = localize(16231, null);
      this.publicGithubButton.enabled = false;
    } else if (this.data.githubAccessToken && this.isPreviewEnabled()) {
      this.publicGithubButton = this._register(new ButtonWithDropdown(container2, {
        contextMenuProvider: this.contextMenuService,
        actions: [this.previewAction],
        addPrimaryActionToDropdown: false,
        ...unthemedButtonStyles
      }));
      this._register(this.publicGithubButton.onDidClick(() => {
        this.createAction.run();
      }));
      this.publicGithubButton.label = localize(16237, null);
      this.publicGithubButton.enabled = true;
    } else if (this.data.githubAccessToken && !this.isPreviewEnabled()) {
      this.publicGithubButton = this._register(new Button(container2, unthemedButtonStyles));
      this._register(this.publicGithubButton.onDidClick(() => {
        this.createAction.run();
      }));
      this.publicGithubButton.label = localize(16237, null);
      this.publicGithubButton.enabled = true;
    } else {
      this.publicGithubButton = this._register(new Button(container2, unthemedButtonStyles));
      this._register(this.publicGithubButton.onDidClick(() => {
        this.previewAction.run();
      }));
      this.publicGithubButton.label = localize(16256, null);
      this.publicGithubButton.enabled = true;
    }
    const repoLink = this.getElementById("show-repo-name");
    if (repoLink) {
      container2.insertBefore(this.publicGithubButton.element, repoLink);
    }
  }
  updatePublicRepoLink(container2) {
    let issueRepoName = this.getElementById("show-repo-name");
    if (!issueRepoName) {
      issueRepoName = document.createElement("a");
      issueRepoName.id = "show-repo-name";
      issueRepoName.classList.add("hidden");
      container2.appendChild(issueRepoName);
    }
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    if (selectedExtension && selectedExtension.uri) {
      const urlString = URI.revive(selectedExtension.uri).toString();
      issueRepoName.href = urlString;
      issueRepoName.addEventListener("click", (e4) => this.openLink(e4));
      issueRepoName.addEventListener("auxclick", (e4) => this.openLink(e4));
      const gitHubInfo = this.parseGitHubUrl(urlString);
      issueRepoName.textContent = gitHubInfo ? gitHubInfo.owner + "/" + gitHubInfo.repositoryName : urlString;
      Object.assign(issueRepoName.style, {
        alignSelf: "flex-end",
        display: "block",
        fontSize: "13px",
        padding: "4px 0px",
        textDecoration: "none",
        width: "auto"
      });
      show2(issueRepoName);
    } else if (issueRepoName) {
      issueRepoName.removeAttribute("style");
      hide3(issueRepoName);
    }
  }
  updateInternalGithubButton(container2) {
    const issueReporterElement = this.getElementById("issue-reporter");
    if (!issueReporterElement) {
      return;
    }
    if (this.internalGithubButton) {
      this.internalGithubButton.dispose();
    }
    if (this.data.githubAccessToken && this.data.privateUri) {
      this.internalGithubButton = this._register(new Button(container2, unthemedButtonStyles));
      this._register(this.internalGithubButton.onDidClick(() => {
        this.privateAction.run();
      }));
      this.internalGithubButton.element.id = "internal-create-btn";
      this.internalGithubButton.element.classList.add("internal-create-subtle");
      this.internalGithubButton.label = localize(16236, null);
      this.internalGithubButton.enabled = true;
      this.internalGithubButton.setTitle(this.data.privateUri.path.slice(1));
    }
  }
  updateInternalElementsVisibility() {
    const container2 = this.getElementById("internal-elements");
    if (!container2) {
      return;
    }
    if (this.data.githubAccessToken && this.data.privateUri) {
      show2(container2);
      container2.style.display = "";
      if (this.internalGithubButton) {
        this.internalGithubButton.enabled = this.publicGithubButton?.enabled ?? false;
      }
    } else {
      hide3(container2);
      container2.style.display = "none";
    }
  }
  getSubmitButtonElement() {
    if (this.publicGithubButton instanceof ButtonWithDropdown) {
      return this.publicGithubButton.primaryButton.element;
    }
    return this.publicGithubButton.element;
  }
  setSubmittingState(submitting) {
    this.publicGithubButton.enabled = !submitting;
    if (this.internalGithubButton) {
      this.internalGithubButton.enabled = !submitting;
    }
    const buttonEl = this.getSubmitButtonElement();
    if (submitting) {
      const currentLabel = this.publicGithubButton instanceof ButtonWithDropdown ? this.publicGithubButton.primaryButton.label : this.publicGithubButton.label;
      this.preSubmitButtonLabel = typeof currentLabel === "string" ? currentLabel : "";
      this.publicGithubButton.label = localize(16264, null);
      const spinnerIcon = renderIcon(ThemeIcon.modify(Codicon.loading, "spin"));
      buttonEl.prepend(spinnerIcon);
    } else {
      const spinnerEl = buttonEl.querySelector(".codicon-loading");
      spinnerEl?.remove();
      if (this.preSubmitButtonLabel !== void 0) {
        this.publicGithubButton.label = this.preSubmitButtonLabel;
        this.preSubmitButtonLabel = void 0;
      }
    }
  }
  async updateIssueReporterUri(extension) {
    try {
      if (extension.uri) {
        const uri4 = URI.revive(extension.uri);
        extension.bugsUrl = uri4.toString();
      }
    } catch (e4) {
      this.renderBlocks();
    }
  }
  handleExtensionData(extensions) {
    const installedExtensions = extensions.filter((x) => !x.isBuiltin);
    const { nonThemes, themes } = groupBy(installedExtensions, (ext) => {
      return ext.isTheme ? "themes" : "nonThemes";
    });
    const numberOfThemeExtesions = (themes && themes.length) ?? 0;
    this.issueReporterModel.update({ numberOfThemeExtesions, enabledNonThemeExtesions: nonThemes, allExtensions: installedExtensions });
    this.updateExtensionTable(nonThemes ?? [], numberOfThemeExtesions);
    if (this.disableExtensions || installedExtensions.length === 0) {
      this.getElementById("disableExtensions").disabled = true;
    }
    this.updateExtensionSelector(installedExtensions);
  }
  updateExtensionSelector(extensions) {
    const extensionOptions = extensions.map((extension) => {
      return {
        name: extension.displayName || extension.name || "",
        id: extension.id
      };
    });
    extensionOptions.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName > bName) {
        return 1;
      }
      if (aName < bName) {
        return -1;
      }
      return 0;
    });
    const makeOption = (extension, selectedExtension) => {
      const selected = selectedExtension && extension.id === selectedExtension.id;
      return $("option", {
        "value": extension.id,
        "selected": selected || ""
      }, extension.name);
    };
    const extensionsSelector = this.getElementById("extension-selector");
    if (extensionsSelector) {
      const { selectedExtension } = this.issueReporterModel.getData();
      reset(extensionsSelector, this.makeOption("", localize(16259, null), true), ...extensionOptions.map((extension) => makeOption(extension, selectedExtension)));
      if (!selectedExtension) {
        extensionsSelector.selectedIndex = 0;
      }
      this.addEventListener("extension-selector", "change", async (e4) => {
        this.clearExtensionData();
        const selectedExtensionId = e4.target.value;
        this.selectedExtension = selectedExtensionId;
        const extensions2 = this.issueReporterModel.getData().allExtensions;
        const matches2 = extensions2.filter((extension) => extension.id === selectedExtensionId);
        if (matches2.length) {
          this.issueReporterModel.update({ selectedExtension: matches2[0] });
          const selectedExtension2 = this.issueReporterModel.getData().selectedExtension;
          if (selectedExtension2) {
            const iconElement = document.createElement("span");
            iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.loading), "codicon-modifier-spin");
            this.setLoading(iconElement);
            const openReporterData = await this.sendReporterMenu(selectedExtension2);
            if (openReporterData) {
              if (this.selectedExtension === selectedExtensionId) {
                this.removeLoading(iconElement, true);
                this.data = openReporterData;
              }
            } else {
              if (!this.loadingExtensionData) {
                iconElement.classList.remove(...ThemeIcon.asClassNameArray(Codicon.loading), "codicon-modifier-spin");
              }
              this.removeLoading(iconElement);
              this.clearExtensionData();
              selectedExtension2.data = void 0;
              selectedExtension2.uri = void 0;
            }
            if (this.selectedExtension === selectedExtensionId) {
              this.updateExtensionStatus(matches2[0]);
              this.openReporter = false;
            }
          } else {
            this.issueReporterModel.update({ selectedExtension: void 0 });
            this.clearSearchResults();
            this.clearExtensionData();
            this.validateSelectedExtension();
            this.updateExtensionStatus(matches2[0]);
          }
        }
        this.updateInternalElementsVisibility();
      });
    }
    this.addEventListener("problem-source", "change", (_) => {
      this.clearExtensionData();
      this.validateSelectedExtension();
    });
  }
  async sendReporterMenu(extension) {
    try {
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("sendReporterMenu timed out")), 1e4)
      );
      const data = await Promise.race([
        this.issueFormService.sendReporterMenu(extension.id),
        timeoutPromise
      ]);
      return data;
    } catch (e4) {
      console.error(e4);
      return void 0;
    }
  }
  updateAcknowledgementState() {
    const acknowledgementCheckbox = this.getElementById("includeAcknowledgement");
    if (acknowledgementCheckbox) {
      this.acknowledged = acknowledgementCheckbox.checked;
      this.updateButtonStates();
    }
  }
  setEventHandlers() {
    ["includeSystemInfo", "includeProcessInfo", "includeWorkspaceInfo", "includeExtensions", "includeExperiments", "includeExtensionData"].forEach((elementId) => {
      this.addEventListener(elementId, "click", (event) => {
        event.stopPropagation();
        this.issueReporterModel.update({ [elementId]: !this.issueReporterModel.getData()[elementId] });
      });
    });
    this.addEventListener("includeAcknowledgement", "click", (event) => {
      event.stopPropagation();
      this.updateAcknowledgementState();
    });
    const showInfoElements = this.window.document.getElementsByClassName("showInfo");
    for (let i2 = 0; i2 < showInfoElements.length; i2++) {
      const showInfo = showInfoElements.item(i2);
      showInfo.addEventListener("click", (e4) => {
        e4.preventDefault();
        const label3 = e4.target;
        if (label3) {
          const containingElement = label3.parentElement && label3.parentElement.parentElement;
          const info = containingElement && containingElement.lastElementChild;
          if (info && info.classList.contains("hidden")) {
            show2(info);
            label3.textContent = localize(16246, null);
          } else {
            hide3(info);
            label3.textContent = localize(16261, null);
          }
        }
      });
    }
    this.addEventListener("issue-source", "change", (e4) => {
      const value2 = e4.target.value;
      const problemSourceHelpText = this.getElementById("problem-source-help-text");
      if (value2 === "") {
        this.issueReporterModel.update({ fileOnExtension: void 0 });
        show2(problemSourceHelpText);
        this.clearSearchResults();
        this.render();
        return;
      } else {
        hide3(problemSourceHelpText);
      }
      const descriptionTextArea = this.getElementById("issue-title");
      if (value2 === "vscode" /* VSCode */) {
        descriptionTextArea.placeholder = localize(16268, null);
      } else if (value2 === "extension" /* Extension */) {
        descriptionTextArea.placeholder = localize(16242, null);
      } else if (value2 === "marketplace" /* Marketplace */) {
        descriptionTextArea.placeholder = localize(16249, null);
      } else {
        descriptionTextArea.placeholder = localize(16265, null);
      }
      let fileOnExtension, fileOnMarketplace, fileOnProduct = false;
      if (value2 === "extension" /* Extension */) {
        fileOnExtension = true;
      } else if (value2 === "marketplace" /* Marketplace */) {
        fileOnMarketplace = true;
      } else if (value2 === "vscode" /* VSCode */) {
        fileOnProduct = true;
      }
      this.issueReporterModel.update({ fileOnExtension, fileOnMarketplace, fileOnProduct });
      this.render();
      const title = this.getElementById("issue-title").value;
      this.searchIssues(title, fileOnExtension, fileOnMarketplace);
    });
    this.addEventListener("description", "input", (e4) => {
      const issueDescription = e4.target.value;
      this.issueReporterModel.update({ issueDescription });
      if (this.issueReporterModel.fileOnExtension() === false) {
        const title = this.getElementById("issue-title").value;
        this.searchVSCodeIssues(title, issueDescription);
      }
    });
    this.addEventListener("issue-title", "input", (_) => {
      const titleElement = this.getElementById("issue-title");
      if (titleElement) {
        const title = titleElement.value;
        this.issueReporterModel.update({ issueTitle: title });
      }
    });
    this.addEventListener("issue-title", "input", (e4) => {
      const title = e4.target.value;
      const lengthValidationMessage = this.getElementById("issue-title-length-validation-error");
      const issueUrl = this.getIssueUrl();
      if (title && this.getIssueUrlWithTitle(title, issueUrl).length > MAX_URL_LENGTH) {
        show2(lengthValidationMessage);
      } else {
        hide3(lengthValidationMessage);
      }
      const issueSource = this.getElementById("issue-source");
      if (!issueSource || issueSource.value === "") {
        return;
      }
      const { fileOnExtension, fileOnMarketplace } = this.issueReporterModel.getData();
      this.searchIssues(title, fileOnExtension, fileOnMarketplace);
    });
    this.addEventListener("disableExtensions", "click", () => {
      this.issueFormService.reloadWithExtensionsDisabled();
    });
    this.addEventListener("extensionBugsLink", "click", (e4) => {
      const url = e4.target.innerText;
      this.openLink(url);
    });
    this.addEventListener("disableExtensions", "keydown", (e4) => {
      e4.stopPropagation();
      if (e4.key === "Enter" || e4.key === " ") {
        this.issueFormService.reloadWithExtensionsDisabled();
      }
    });
    this.window.document.onkeydown = async (e4) => {
      const cmdOrCtrlKey = isMacintosh ? e4.metaKey : e4.ctrlKey;
      if (cmdOrCtrlKey && e4.key === "Enter") {
        this.delayedSubmit.trigger(async () => {
          this.setSubmittingState(true);
          try {
            if (await this.createIssue()) {
              this.close();
            }
          } finally {
            this.setSubmittingState(false);
          }
        });
      }
      if (cmdOrCtrlKey && e4.key === "w") {
        e4.stopPropagation();
        e4.preventDefault();
        const issueTitle = this.getElementById("issue-title").value;
        const { issueDescription } = this.issueReporterModel.getData();
        if (!this.hasBeenSubmitted && (issueTitle || issueDescription)) {
          this.issueFormService.showConfirmCloseDialog();
        } else {
          this.close();
        }
      }
      if (isMacintosh) {
        if (cmdOrCtrlKey && e4.key === "a" && e4.target) {
          if (isHTMLInputElement(e4.target) || isHTMLTextAreaElement(e4.target)) {
            e4.target.select();
          }
        }
      }
    };
    this.addEventListener("review-guidance-help-text", "click", (e4) => {
      const target = e4.target;
      if (target.tagName === "A" && target.getAttribute("target") === "_blank") {
        this.openLink(e4);
      }
    });
  }
  updatePerformanceInfo(info) {
    this.issueReporterModel.update(info);
    this.receivedPerformanceInfo = true;
    const state = this.issueReporterModel.getData();
    this.updateProcessInfo(state);
    this.updateWorkspaceInfo(state);
    this.updateButtonStates();
  }
  isPreviewEnabled() {
    const issueType = this.issueReporterModel.getData().issueType;
    if (this.loadingExtensionData) {
      return false;
    }
    if (this.isWeb) {
      if (issueType === 2 /* FeatureRequest */ || issueType === 1 /* PerformanceIssue */ || issueType === 0 /* Bug */) {
        return true;
      }
    } else {
      if (issueType === 0 /* Bug */ && this.receivedSystemInfo) {
        return true;
      }
      if (issueType === 1 /* PerformanceIssue */ && this.receivedSystemInfo && this.receivedPerformanceInfo) {
        return true;
      }
      if (issueType === 2 /* FeatureRequest */) {
        return true;
      }
    }
    return false;
  }
  getExtensionRepositoryUrl() {
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    return selectedExtension && selectedExtension.repositoryUrl;
  }
  getExtensionBugsUrl() {
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    return selectedExtension && selectedExtension.bugsUrl;
  }
  searchVSCodeIssues(title, issueDescription) {
    if (title) {
      this.searchDuplicates(title, issueDescription);
    } else {
      this.clearSearchResults();
    }
  }
  searchIssues(title, fileOnExtension, fileOnMarketplace) {
    if (fileOnExtension) {
      return this.searchExtensionIssues(title);
    }
    if (fileOnMarketplace) {
      return this.searchMarketplaceIssues(title);
    }
    const description = this.issueReporterModel.getData().issueDescription;
    this.searchVSCodeIssues(title, description);
  }
  searchExtensionIssues(title) {
    const url = this.getExtensionGitHubUrl();
    if (title) {
      const matches2 = /^https?:\/\/github\.com\/(.*)/.exec(url);
      if (matches2 && matches2.length) {
        const repo = matches2[1];
        return this.searchGitHub(repo, title);
      }
      if (this.issueReporterModel.getData().selectedExtension) {
        this.clearSearchResults();
        return this.displaySearchResults([]);
      }
    }
    this.clearSearchResults();
  }
  searchMarketplaceIssues(title) {
    if (title) {
      const gitHubInfo = this.parseGitHubUrl(this.product.reportMarketplaceIssueUrl);
      if (gitHubInfo) {
        return this.searchGitHub(`${gitHubInfo.owner}/${gitHubInfo.repositoryName}`, title);
      }
    }
  }
  async close() {
    await this.issueFormService.closeReporter();
  }
  clearSearchResults() {
    const similarIssues = this.getElementById("similar-issues");
    similarIssues.innerText = "";
    this.numberOfSearchResultsDisplayed = 0;
  }
  searchGitHub(repo, title) {
    const query = `is:issue+repo:${repo}+${title}`;
    const similarIssues = this.getElementById("similar-issues");
    fetch(`https://api.github.com/search/issues?q=${query}`).then((response) => {
      response.json().then((result) => {
        similarIssues.innerText = "";
        if (result && result.items) {
          this.displaySearchResults(result.items);
        }
      }).catch((_) => {
        console.warn("Timeout or query limit exceeded");
      });
    }).catch((_) => {
      console.warn("Error fetching GitHub issues");
    });
  }
  searchDuplicates(title, body) {
    const url = "https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates";
    const init = {
      method: "POST",
      body: JSON.stringify({
        title,
        body
      }),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    };
    fetch(url, init).then((response) => {
      response.json().then((result) => {
        this.clearSearchResults();
        if (result && result.candidates) {
          this.displaySearchResults(result.candidates);
        } else {
          throw new Error("Unexpected response, no candidates property");
        }
      }).catch((_) => {
      });
    }).catch((_) => {
    });
  }
  displaySearchResults(results) {
    const similarIssues = this.getElementById("similar-issues");
    if (results.length) {
      const issues = $("div.issues-container");
      const issuesText = $("div.list-title");
      issuesText.textContent = localize(16262, null);
      this.numberOfSearchResultsDisplayed = results.length < 5 ? results.length : 5;
      for (let i2 = 0; i2 < this.numberOfSearchResultsDisplayed; i2++) {
        const issue = results[i2];
        const link2 = $("a.issue-link", { href: issue.html_url });
        link2.textContent = issue.title;
        link2.title = issue.title;
        link2.addEventListener("click", (e4) => this.openLink(e4));
        link2.addEventListener("auxclick", (e4) => this.openLink(e4));
        let issueState;
        let item;
        if (issue.state) {
          issueState = $("span.issue-state");
          const issueIcon = $("span.issue-icon");
          issueIcon.appendChild(renderIcon(issue.state === "open" ? Codicon.issueOpened : Codicon.issueClosed));
          const issueStateLabel = $("span.issue-state.label");
          issueStateLabel.textContent = issue.state === "open" ? localize(16250, null) : localize(16234, null);
          issueState.title = issue.state === "open" ? localize(16250, null) : localize(16234, null);
          issueState.appendChild(issueIcon);
          issueState.appendChild(issueStateLabel);
          item = $("div.issue", void 0, issueState, link2);
        } else {
          item = $("div.issue", void 0, link2);
        }
        issues.appendChild(item);
      }
      similarIssues.appendChild(issuesText);
      similarIssues.appendChild(issues);
    }
  }
  setUpTypes() {
    const makeOption = (issueType2, description) => $("option", { "value": issueType2.valueOf() }, escape(description));
    const typeSelect = this.getElementById("issue-type");
    const { issueType } = this.issueReporterModel.getData();
    reset(
      typeSelect,
      makeOption(0 /* Bug */, localize(16233, null)),
      makeOption(2 /* FeatureRequest */, localize(16243, null)),
      makeOption(1 /* PerformanceIssue */, localize(16253, null))
    );
    typeSelect.value = issueType.toString();
    this.setSourceOptions();
  }
  makeOption(value2, description, disabled) {
    const option2 = document.createElement("option");
    option2.disabled = disabled;
    option2.value = value2;
    option2.textContent = description;
    return option2;
  }
  setSourceOptions() {
    const sourceSelect = this.getElementById("issue-source");
    const { issueType, fileOnExtension, selectedExtension, fileOnMarketplace, fileOnProduct } = this.issueReporterModel.getData();
    let selected = sourceSelect.selectedIndex;
    if (selected === -1) {
      if (fileOnExtension !== void 0) {
        selected = fileOnExtension ? 2 : 1;
      } else if (selectedExtension?.isBuiltin) {
        selected = 1;
      } else if (fileOnMarketplace) {
        selected = 3;
      } else if (fileOnProduct) {
        selected = 1;
      }
    }
    sourceSelect.innerText = "";
    sourceSelect.append(this.makeOption("", localize(16260, null), true));
    sourceSelect.append(this.makeOption("vscode" /* VSCode */, localize(16267, null), false));
    sourceSelect.append(this.makeOption("extension" /* Extension */, localize(16241, null), false));
    if (this.product.reportMarketplaceIssueUrl) {
      sourceSelect.append(this.makeOption("marketplace" /* Marketplace */, localize(16248, null), false));
    }
    if (issueType !== 2 /* FeatureRequest */) {
      sourceSelect.append(this.makeOption("unknown" /* Unknown */, localize(16266, null), false));
    }
    if (selected !== -1 && selected < sourceSelect.options.length) {
      sourceSelect.selectedIndex = selected;
    } else {
      sourceSelect.selectedIndex = 0;
      hide3(this.getElementById("problem-source-help-text"));
    }
  }
  async renderBlocks() {
    const { issueType, fileOnExtension, fileOnMarketplace, selectedExtension } = this.issueReporterModel.getData();
    const blockContainer = this.getElementById("block-container");
    const systemBlock = this.window.document.querySelector(".block-system");
    const processBlock = this.window.document.querySelector(".block-process");
    const workspaceBlock = this.window.document.querySelector(".block-workspace");
    const extensionsBlock = this.window.document.querySelector(".block-extensions");
    const experimentsBlock = this.window.document.querySelector(".block-experiments");
    const extensionDataBlock = this.window.document.querySelector(".block-extension-data");
    const problemSource = this.getElementById("problem-source");
    const descriptionTitle = this.getElementById("issue-description-label");
    const descriptionSubtitle = this.getElementById("issue-description-subtitle");
    const extensionSelector = this.getElementById("extension-selection");
    const downloadExtensionDataLink = this.getElementById("extension-data-download");
    const titleTextArea = this.getElementById("issue-title-container");
    const descriptionTextArea = this.getElementById("description");
    const extensionDataTextArea = this.getElementById("extension-data");
    hide3(blockContainer);
    hide3(systemBlock);
    hide3(processBlock);
    hide3(workspaceBlock);
    hide3(extensionsBlock);
    hide3(experimentsBlock);
    hide3(extensionSelector);
    hide3(extensionDataTextArea);
    hide3(extensionDataBlock);
    hide3(downloadExtensionDataLink);
    show2(problemSource);
    show2(titleTextArea);
    show2(descriptionTextArea);
    if (fileOnExtension) {
      show2(extensionSelector);
    }
    const extensionData = this.issueReporterModel.getData().extensionData;
    if (extensionData && extensionData.length > MAX_EXTENSION_DATA_LENGTH) {
      show2(downloadExtensionDataLink);
      const date = /* @__PURE__ */ new Date();
      const formattedDate = date.toISOString().split("T")[0];
      const formattedTime = date.toTimeString().split(" ")[0].replace(/:/g, "-");
      const fileName = `extensionData_${formattedDate}_${formattedTime}.md`;
      const handleLinkClick = async () => {
        const downloadPath = await this.fileDialogService.showSaveDialog({
          title: localize(16258, null),
          availableFileSystems: [Schemas.file],
          defaultUri: joinPath(await this.fileDialogService.defaultFilePath(Schemas.file), fileName)
        });
        if (downloadPath) {
          await this.fileService.writeFile(downloadPath, VSBuffer.fromString(extensionData));
        }
      };
      downloadExtensionDataLink.addEventListener("click", handleLinkClick);
      this._register({
        dispose: () => downloadExtensionDataLink.removeEventListener("click", handleLinkClick)
      });
    }
    if (selectedExtension && this.nonGitHubIssueUrl) {
      hide3(titleTextArea);
      hide3(descriptionTextArea);
      reset(descriptionTitle, localize(16245, null));
      reset(descriptionSubtitle, localize(16240, null, selectedExtension.displayName));
      this.publicGithubButton.label = localize(16251, null);
      return;
    }
    if (fileOnExtension && selectedExtension?.data) {
      const data = selectedExtension?.data;
      extensionDataTextArea.innerText = data.toString();
      extensionDataTextArea.readOnly = true;
      show2(extensionDataBlock);
    }
    if (fileOnExtension && this.openReporter) {
      extensionDataTextArea.readOnly = true;
      setTimeout(() => {
        if (this.openReporter) {
          show2(extensionDataBlock);
        }
      }, 100);
      show2(extensionDataBlock);
    }
    if (issueType === 0 /* Bug */) {
      if (!fileOnMarketplace) {
        show2(blockContainer);
        show2(systemBlock);
        show2(experimentsBlock);
        if (!fileOnExtension) {
          show2(extensionsBlock);
        }
      }
      reset(descriptionTitle, localize(16263, null) + " ", $("span.required-input", void 0, "*"));
      reset(descriptionSubtitle, localize(16232, null));
    } else if (issueType === 1 /* PerformanceIssue */) {
      if (!fileOnMarketplace) {
        show2(blockContainer);
        show2(systemBlock);
        show2(processBlock);
        show2(workspaceBlock);
        show2(experimentsBlock);
      }
      if (fileOnExtension) {
        show2(extensionSelector);
      } else if (!fileOnMarketplace) {
        show2(extensionsBlock);
      }
      reset(descriptionTitle, localize(16263, null) + " ", $("span.required-input", void 0, "*"));
      reset(descriptionSubtitle, localize(16254, null));
    } else if (issueType === 2 /* FeatureRequest */) {
      reset(descriptionTitle, localize(16238, null) + " ", $("span.required-input", void 0, "*"));
      reset(descriptionSubtitle, localize(16244, null));
    }
  }
  validateInput(inputId) {
    const inputElement = this.getElementById(inputId);
    const inputValidationMessage = this.getElementById(`${inputId}-empty-error`);
    const descriptionShortMessage = this.getElementById(`description-short-error`);
    if (inputId === "description" && this.nonGitHubIssueUrl && this.data.extensionId) {
      return true;
    } else if (!inputElement.value) {
      inputElement.classList.add("invalid-input");
      inputValidationMessage?.classList.remove("hidden");
      descriptionShortMessage?.classList.add("hidden");
      return false;
    } else if (inputId === "description" && inputElement.value.length < 10) {
      inputElement.classList.add("invalid-input");
      descriptionShortMessage?.classList.remove("hidden");
      inputValidationMessage?.classList.add("hidden");
      return false;
    } else {
      inputElement.classList.remove("invalid-input");
      inputValidationMessage?.classList.add("hidden");
      if (inputId === "description") {
        descriptionShortMessage?.classList.add("hidden");
      }
      return true;
    }
  }
  validateInputs() {
    let isValid2 = true;
    ["issue-title", "description", "issue-source"].forEach((elementId) => {
      isValid2 = this.validateInput(elementId) && isValid2;
    });
    if (this.issueReporterModel.fileOnExtension()) {
      isValid2 = this.validateInput("extension-selector") && isValid2;
    }
    return isValid2;
  }
  async submitToGitHub(issueTitle, issueBody, gitHubDetails) {
    const url = `https://api.github.com/repos/${gitHubDetails.owner}/${gitHubDetails.repositoryName}/issues`;
    const init = {
      method: "POST",
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody
      }),
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.data.githubAccessToken}`,
        "User-Agent": "request"
      })
    };
    const response = await fetch(url, init);
    if (!response.ok) {
      console.error("Invalid GitHub URL provided.");
      return false;
    }
    const result = await response.json();
    await this.openLink(result.html_url);
    this.close();
    return true;
  }
  async createIssue(shouldCreate, privateUri) {
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    if (this.nonGitHubIssueUrl) {
      const url2 = this.getExtensionBugsUrl();
      if (url2) {
        this.hasBeenSubmitted = true;
        return true;
      }
    }
    if (!this.validateInputs()) {
      const invalidInput = this.window.document.getElementsByClassName("invalid-input");
      if (invalidInput.length) {
        invalidInput[0].focus();
      }
      this.addEventListener("issue-title", "input", (_) => {
        this.validateInput("issue-title");
      });
      this.addEventListener("description", "input", (_) => {
        this.validateInput("description");
      });
      this.addEventListener("issue-source", "change", (_) => {
        this.validateInput("issue-source");
      });
      if (this.issueReporterModel.fileOnExtension()) {
        this.addEventListener("extension-selector", "change", (_) => {
          this.validateInput("extension-selector");
        });
      }
      return false;
    }
    this.hasBeenSubmitted = true;
    const issueTitle = this.getElementById("issue-title").value;
    const issueBody = this.issueReporterModel.serialize();
    let issueUrl = privateUri ? this.getPrivateIssueUrl() : this.getIssueUrl();
    if (!issueUrl) {
      console.error(`No ${privateUri ? "private " : ""}issue url found`);
      return false;
    }
    if (selectedExtension?.uri) {
      const uri4 = URI.revive(selectedExtension.uri);
      issueUrl = uri4.toString();
    }
    const gitHubDetails = this.parseGitHubUrl(issueUrl);
    if (this.data.githubAccessToken && gitHubDetails && shouldCreate) {
      return this.submitToGitHub(issueTitle, issueBody, gitHubDetails);
    }
    const baseUrl = this.getIssueUrlWithTitle(this.getElementById("issue-title").value, issueUrl);
    let url = baseUrl + `&body=${encodeURIComponent(issueBody)}`;
    url = this.addTemplateToUrl(url, gitHubDetails?.owner, gitHubDetails?.repositoryName);
    if (url.length > MAX_URL_LENGTH) {
      try {
        url = await this.writeToClipboard(baseUrl, issueBody);
        url = this.addTemplateToUrl(url, gitHubDetails?.owner, gitHubDetails?.repositoryName);
      } catch (_) {
        console.error("Writing to clipboard failed");
        return false;
      }
    }
    await this.openLink(url);
    return true;
  }
  async writeToClipboard(baseUrl, issueBody) {
    const shouldWrite = await this.issueFormService.showClipboardDialog();
    if (!shouldWrite) {
      throw new CancellationError();
    }
    return baseUrl + `&body=${encodeURIComponent(localize(16252, null))}`;
  }
  addTemplateToUrl(baseUrl, owner, repositoryName) {
    const isVscode = this.issueReporterModel.getData().fileOnProduct;
    const isMicrosoft = owner?.toLowerCase() === "microsoft";
    const needsTemplate = isVscode || isMicrosoft && (repositoryName === "vscode" || repositoryName === "vscode-python");
    if (needsTemplate) {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set("template", "bug_report.md");
        return url.toString();
      } catch {
        return baseUrl + "&template=bug_report.md";
      }
    }
    return baseUrl;
  }
  getIssueUrl() {
    return this.issueReporterModel.fileOnExtension() ? this.getExtensionGitHubUrl() : this.issueReporterModel.getData().fileOnMarketplace ? this.product.reportMarketplaceIssueUrl : this.product.reportIssueUrl;
  }
  // for when command 'workbench.action.openIssueReporter' passes along a
  // `privateUri` UriComponents value
  getPrivateIssueUrl() {
    return URI.revive(this.data.privateUri)?.toString();
  }
  parseGitHubUrl(url) {
    const match2 = /^https?:\/\/github\.com\/([^\/]*)\/([^\/]*).*/.exec(url);
    if (match2 && match2.length) {
      return {
        owner: match2[1],
        repositoryName: match2[2]
      };
    } else {
      console.error("No GitHub issues match");
    }
    return void 0;
  }
  getExtensionGitHubUrl() {
    let repositoryUrl = "";
    const bugsUrl = this.getExtensionBugsUrl();
    const extensionUrl = this.getExtensionRepositoryUrl();
    if (bugsUrl && bugsUrl.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)\/?(\/issues)?$/)) {
      repositoryUrl = normalizeGitHubUrl(bugsUrl);
    } else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)$/)) {
      repositoryUrl = normalizeGitHubUrl(extensionUrl);
    } else {
      this.nonGitHubIssueUrl = true;
      repositoryUrl = bugsUrl || extensionUrl || "";
    }
    return repositoryUrl;
  }
  getIssueUrlWithTitle(issueTitle, repositoryUrl) {
    if (this.issueReporterModel.fileOnExtension()) {
      repositoryUrl = repositoryUrl + "/issues/new";
    }
    const queryStringPrefix = repositoryUrl.indexOf("?") === -1 ? "?" : "&";
    return `${repositoryUrl}${queryStringPrefix}title=${encodeURIComponent(issueTitle)}`;
  }
  clearExtensionData() {
    this.nonGitHubIssueUrl = false;
    this.issueReporterModel.update({ extensionData: void 0 });
    this.data.issueBody = this.data.issueBody || "";
    this.data.data = void 0;
    this.data.uri = void 0;
    this.data.privateUri = void 0;
  }
  async updateExtensionStatus(extension) {
    this.issueReporterModel.update({ selectedExtension: extension });
    const template2 = this.data.issueBody;
    if (template2) {
      const descriptionTextArea = this.getElementById("description");
      const descriptionText = descriptionTextArea.value;
      if (descriptionText === "" || !descriptionText.includes(template2.toString())) {
        const fullTextArea = descriptionText + (descriptionText === "" ? "" : "\n") + template2.toString();
        descriptionTextArea.value = fullTextArea;
        this.issueReporterModel.update({ issueDescription: fullTextArea });
      }
    }
    const data = this.data.data;
    if (data) {
      this.issueReporterModel.update({ extensionData: data });
      extension.data = data;
      const extensionDataBlock = this.window.document.querySelector(".block-extension-data");
      show2(extensionDataBlock);
      this.renderBlocks();
    }
    const uri4 = this.data.uri;
    if (uri4) {
      extension.uri = uri4;
      this.updateIssueReporterUri(extension);
    }
    this.validateSelectedExtension();
    const title = this.getElementById("issue-title").value;
    this.searchExtensionIssues(title);
    this.updateButtonStates();
    this.renderBlocks();
  }
  validateSelectedExtension() {
    const extensionValidationMessage = this.getElementById("extension-selection-validation-error");
    const extensionValidationNoUrlsMessage = this.getElementById("extension-selection-validation-error-no-url");
    hide3(extensionValidationMessage);
    hide3(extensionValidationNoUrlsMessage);
    const extension = this.issueReporterModel.getData().selectedExtension;
    if (!extension) {
      this.publicGithubButton.enabled = true;
      return;
    }
    if (this.loadingExtensionData) {
      return;
    }
    const hasValidGitHubUrl = this.getExtensionGitHubUrl();
    if (hasValidGitHubUrl) {
      this.publicGithubButton.enabled = true;
    } else {
      this.setExtensionValidationMessage();
      this.publicGithubButton.enabled = false;
    }
  }
  setLoading(element) {
    this.openReporter = true;
    this.loadingExtensionData = true;
    this.updateButtonStates();
    const extensionDataCaption = this.getElementById("extension-id");
    hide3(extensionDataCaption);
    const extensionDataCaption2 = Array.from(this.window.document.querySelectorAll(".ext-parens"));
    extensionDataCaption2.forEach((extensionDataCaption22) => hide3(extensionDataCaption22));
    const showLoading = this.getElementById("ext-loading");
    show2(showLoading);
    while (showLoading.firstChild) {
      showLoading.firstChild.remove();
    }
    showLoading.append(element);
    this.renderBlocks();
  }
  removeLoading(element, fromReporter = false) {
    this.openReporter = fromReporter;
    this.loadingExtensionData = false;
    this.updateButtonStates();
    const extensionDataCaption = this.getElementById("extension-id");
    show2(extensionDataCaption);
    const extensionDataCaption2 = Array.from(this.window.document.querySelectorAll(".ext-parens"));
    extensionDataCaption2.forEach((extensionDataCaption22) => show2(extensionDataCaption22));
    const hideLoading = this.getElementById("ext-loading");
    hide3(hideLoading);
    if (hideLoading.firstChild) {
      element.remove();
    }
    this.renderBlocks();
  }
  setExtensionValidationMessage() {
    const extensionValidationMessage = this.getElementById("extension-selection-validation-error");
    const extensionValidationNoUrlsMessage = this.getElementById("extension-selection-validation-error-no-url");
    const bugsUrl = this.getExtensionBugsUrl();
    if (bugsUrl) {
      show2(extensionValidationMessage);
      const link2 = this.getElementById("extensionBugsLink");
      link2.textContent = bugsUrl;
      return;
    }
    const extensionUrl = this.getExtensionRepositoryUrl();
    if (extensionUrl) {
      show2(extensionValidationMessage);
      const link2 = this.getElementById("extensionBugsLink");
      link2.textContent = extensionUrl;
      return;
    }
    show2(extensionValidationNoUrlsMessage);
  }
  updateProcessInfo(state) {
    const target = this.window.document.querySelector(".block-process .block-info");
    if (target) {
      reset(target, $("code", void 0, state.processInfo ?? ""));
    }
  }
  updateWorkspaceInfo(state) {
    this.window.document.querySelector(".block-workspace .block-info code").textContent = "\n" + state.workspaceInfo;
  }
  updateExtensionTable(extensions, numThemeExtensions) {
    const target = this.window.document.querySelector(".block-extensions .block-info");
    if (target) {
      if (this.disableExtensions) {
        reset(target, localize(16239, null));
        return;
      }
      const themeExclusionStr = numThemeExtensions ? `
(${numThemeExtensions} theme extensions excluded)` : "";
      extensions = extensions || [];
      if (!extensions.length) {
        target.innerText = "Extensions: none" + themeExclusionStr;
        return;
      }
      reset(target, this.getExtensionTableHtml(extensions), document.createTextNode(themeExclusionStr));
    }
  }
  getExtensionTableHtml(extensions) {
    return $(
      "table",
      void 0,
      $(
        "tr",
        void 0,
        $("th", void 0, "Extension"),
        $("th", void 0, "Author (truncated)"),
        $("th", void 0, "Version")
      ),
      ...extensions.map((extension) => $(
        "tr",
        void 0,
        $("td", void 0, extension.name),
        $("td", void 0, extension.publisher?.substr(0, 3) ?? "N/A"),
        $("td", void 0, extension.version)
      ))
    );
  }
  async openLink(eventOrUrl) {
    if (typeof eventOrUrl === "string") {
      await this.openerService.open(eventOrUrl, { openExternal: true });
    } else {
      const event = eventOrUrl;
      event.preventDefault();
      event.stopPropagation();
      if (event.which < 3) {
        await this.openerService.open(event.target.href, { openExternal: true });
      }
    }
  }
  getElementById(elementId) {
    const element = this.window.document.getElementById(elementId);
    if (element) {
      return element;
    } else {
      return void 0;
    }
  }
  addEventListener(elementId, eventType, handler) {
    const element = this.getElementById(elementId);
    element?.addEventListener(eventType, handler);
  }
};

__decorateClass([
  debounce(300)
], BaseIssueReporterService.prototype, "searchGitHub", 1);

__decorateClass([
  debounce(300)
], BaseIssueReporterService.prototype, "searchDuplicates", 1);

BaseIssueReporterService = __decorateClass([
  __decorateParam(6, IIssueFormService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IFileDialogService),
  __decorateParam(10, IContextMenuService),
  __decorateParam(11, IAuthenticationService),
  __decorateParam(12, IOpenerService)
], BaseIssueReporterService);

function hide3(el) {
  el?.classList.add("hidden");
}

function show2(el) {
  el?.classList.remove("hidden");
}
export { hide3, show2, MAX_URL_LENGTH, MAX_EXTENSION_DATA_LENGTH, BaseIssueReporterService };
