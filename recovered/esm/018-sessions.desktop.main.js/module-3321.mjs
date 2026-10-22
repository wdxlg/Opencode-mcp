// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/browser/updateTooltip.ts
import { Disposable } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ShowCurrentReleaseNotesActionId } from "./module-2752.mjs";
import { Codicon } from "./module-0085.mjs";
import { computeDownloadSpeed, computeDownloadTimeRemaining, computeProgressPercent, formatBytes, formatDate, formatTimeRemaining, tryParseDate } from "./module-3319.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/contrib/update/browser/updateTooltip.ts
var UpdateTooltip = class extends Disposable {
  constructor(clipboardService, commandService, configurationService, hoverService, productService) {
    super();
    this.clipboardService = clipboardService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
    this.productService = productService;
    this.domNode = $(".update-tooltip");
    const header2 = append(this.domNode, $(".header"));
    this.titleNode = append(header2, $(".title"));
    this.productInfoNode = append(this.domNode, $(".product-info"));
    const logoContainer = append(this.productInfoNode, $(".product-logo"));
    logoContainer.setAttribute("role", "img");
    logoContainer.setAttribute("aria-label", this.productService.nameLong);
    const details = append(this.productInfoNode, $(".product-details"));
    this.productNameNode = append(details, $(".product-name"));
    this.productNameNode.textContent = this.productService.nameLong;
    const currentVersionRow = this.createVersionRow(details);
    this.currentVersionNode = currentVersionRow.label;
    this.currentVersionCopyValue = currentVersionRow.copyValue;
    this.currentVersionCopyButton = currentVersionRow.copyButton;
    const latestVersionRow = this.createVersionRow(details);
    this.latestVersionNode = latestVersionRow.label;
    this.latestVersionCopyValue = latestVersionRow.copyValue;
    this.latestVersionCopyButton = latestVersionRow.copyButton;
    this.releaseDateNode = append(details, $(".product-release-date"));
    this.progressContainer = append(this.domNode, $(".progress-container"));
    const progressBar = append(this.progressContainer, $(".progress-bar"));
    this.progressFill = append(progressBar, $(".progress-fill"));
    const progressText = append(this.progressContainer, $(".progress-text"));
    this.progressPercentNode = append(progressText, $("span"));
    this.progressSizeNode = append(progressText, $("span"));
    this.downloadStatsContainer = append(this.progressContainer, $(".download-stats"));
    this.timeRemainingNode = append(this.downloadStatsContainer, $(".time-remaining"));
    this.speedInfoNode = append(this.downloadStatsContainer, $(".speed-info"));
    this.messageNode = append(this.domNode, $(".state-message"));
    this.buttonBar = append(this.domNode, $(".button-bar"));
    this.releaseNotesButton = append(this.buttonBar, $("button.release-notes-button"));
    this.releaseNotesButton.textContent = localize(21565, null);
    this._register(addDisposableListener(this.releaseNotesButton, "click", () => {
      if (this.releaseNotesVersion) {
        this.runCommandAndClose(ShowCurrentReleaseNotesActionId, this.releaseNotesVersion);
      }
    }));
    this.actionButton = append(this.buttonBar, $("button.action-button"));
    this._register(addDisposableListener(this.actionButton, "click", () => {
      const commandId = this.actionButton.dataset.commandId;
      if (commandId) {
        this.runCommandAndClose(commandId);
      }
    }));
    this.updateCurrentVersion();
  }
  updateCurrentVersion() {
    const productVersion = this.productService.version;
    if (productVersion) {
      const currentCommitId = this.productService.commit?.substring(0, 7);
      this.currentVersionNode.textContent = currentCommitId ? localize(21529, null, productVersion, currentCommitId) : localize(21528, null, productVersion);
      this.currentVersionCopyValue.value = currentCommitId ? `${productVersion} (${this.productService.commit})` : productVersion;
      this.currentVersionNode.parentElement.style.display = "";
      this.currentVersionCopyButton.tabIndex = 0;
    } else {
      this.currentVersionNode.parentElement.style.display = "none";
      this.currentVersionCopyButton.tabIndex = -1;
    }
  }
  hideAll() {
    this.productInfoNode.style.display = "";
    this.progressContainer.style.display = "none";
    this.speedInfoNode.textContent = "";
    this.timeRemainingNode.textContent = "";
    this.messageNode.style.display = "none";
    this.actionButton.style.display = "none";
    this.actionButton.tabIndex = -1;
    this.actionButton.dataset.commandId = "";
    this.releaseNotesButton.style.marginRight = "";
  }
  renderState(state) {
    this.hideAll();
    switch (state.type) {
      case "uninitialized" /* Uninitialized */:
        this.renderUninitialized();
        break;
      case "disabled" /* Disabled */:
        this.renderDisabled(state);
        break;
      case "idle" /* Idle */:
        this.renderIdle(state);
        break;
      case "checking for updates" /* CheckingForUpdates */:
        this.renderCheckingForUpdates();
        break;
      case "available for download" /* AvailableForDownload */:
        this.renderAvailableForDownload(state);
        break;
      case "downloading" /* Downloading */:
        this.renderDownloading(state);
        break;
      case "downloaded" /* Downloaded */:
        this.renderDownloaded(state);
        break;
      case "updating" /* Updating */:
        this.renderUpdating(state);
        break;
      case "ready" /* Ready */:
        this.renderReady(state);
        break;
      case "overwriting" /* Overwriting */:
        this.renderOverwriting(state);
        break;
      case "cancelling" /* Cancelling */:
        this.renderCancelling();
        break;
      case "restarting" /* Restarting */:
        this.renderRestarting(state);
        break;
    }
  }
  renderUninitialized() {
    this.renderTitleAndInfo(localize(21545, null));
    this.renderMessage(localize(21544, null));
  }
  renderDisabled({ reason }) {
    this.renderTitleAndInfo(localize(21563, null));
    switch (reason) {
      case 0 /* NotBuilt */:
        this.renderMessage(
          localize(21536, null),
          Codicon.info
        );
        break;
      case 1 /* DisabledByEnvironment */:
        this.renderMessage(
          localize(21530, null),
          Codicon.warning
        );
        break;
      case 2 /* ManuallyDisabled */:
        this.renderMessage(
          localize(21534, null),
          Codicon.warning
        );
        break;
      case 3 /* Policy */:
        this.renderMessage(
          localize(21531, null),
          Codicon.info
        );
        break;
      case 4 /* MissingConfiguration */:
        this.renderMessage(
          localize(21535, null),
          Codicon.info
        );
        break;
      case 5 /* InvalidConfiguration */:
        this.renderMessage(
          localize(21533, null),
          Codicon.error
        );
        break;
      case 6 /* RunningAsAdmin */:
        this.renderMessage(
          localize(
            21537,
            null,
            this.productService.nameShort
          ),
          Codicon.warning
        );
        break;
      default:
        this.renderMessage(localize(21532, null), Codicon.warning);
        break;
    }
  }
  renderIdle({ error, notAvailable }) {
    if (error) {
      this.renderTitleAndInfo(localize(21560, null));
      this.renderMessage(error, Codicon.error);
      return;
    }
    if (notAvailable) {
      this.renderTitleAndInfo(localize(21552, null));
      this.renderMessage(localize(21551, null), Codicon.info);
      return;
    }
    const updateMode = this.configurationService.getValue("update.mode");
    this.renderTitleAndInfo(localize(21564, null));
    switch (updateMode) {
      case "none":
        this.renderMessage(localize(21521, null), Codicon.warning);
        break;
      case "manual":
        this.renderMessage(localize(21520, null));
        break;
      case "start":
        this.renderMessage(localize(21522, null));
        break;
      case "default":
        this.renderMessage(
          localize(21519, null),
          Codicon.smiley
        );
        break;
    }
  }
  renderCheckingForUpdates() {
    this.renderTitleAndInfo(localize(21525, null));
    this.renderMessage(localize(21526, null));
  }
  renderAvailableForDownload({ update }) {
    this.renderTitleAndInfo(localize(21559, null), update);
    this.renderActionButton(localize(21538, null), "update.downloadNow");
  }
  renderDownloading(state) {
    this.renderTitleAndInfo(localize(21542, null), state.update);
    const { downloadedBytes, totalBytes } = state;
    if (downloadedBytes !== void 0 && totalBytes !== void 0 && totalBytes > 0) {
      const percentage = computeProgressPercent(downloadedBytes, totalBytes) ?? 0;
      this.progressFill.style.width = `${percentage}%`;
      this.progressPercentNode.textContent = `${percentage}%`;
      this.progressSizeNode.textContent = `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}`;
      this.progressContainer.style.display = "";
      const speed = computeDownloadSpeed(state);
      if (speed !== void 0 && speed > 0) {
        this.speedInfoNode.textContent = localize(21543, null, formatBytes(speed));
      }
      const timeRemaining = computeDownloadTimeRemaining(state);
      if (timeRemaining !== void 0 && timeRemaining > 0) {
        this.timeRemainingNode.textContent = `~${formatTimeRemaining(timeRemaining)} ${localize(21558, null)}`;
      }
      this.downloadStatsContainer.style.display = "";
    } else {
      this.renderMessage(localize(21541, null));
    }
  }
  renderDownloaded({ update }) {
    this.renderTitleAndInfo(localize(21562, null), update);
    this.renderActionButton(localize(21546, null), "update.install");
  }
  renderUpdating({ update, currentProgress, maxProgress }) {
    this.renderTitleAndInfo(localize(21548, null), update);
    const percentage = computeProgressPercent(currentProgress, maxProgress);
    if (percentage !== void 0) {
      this.progressFill.style.width = `${percentage}%`;
      this.progressPercentNode.textContent = `${percentage}%`;
      this.progressSizeNode.textContent = "";
      this.progressContainer.style.display = "";
    } else {
      this.renderMessage(localize(21547, null));
    }
  }
  renderReady({ update }) {
    if (this.configurationService.getValue("update.mode") === "manual") {
      this.renderTitleAndInfo(localize(21561, null), update);
      this.renderActionButton(localize(21554, null), "update.restart");
    } else {
      this.renderTitleAndInfo(localize(21557, null), update);
    }
  }
  renderOverwriting({ update }) {
    this.renderTitleAndInfo(localize(21540, null), update);
    this.renderMessage(localize(21539, null));
  }
  renderRestarting({ update }) {
    this.renderTitleAndInfo(localize(21556, null, this.productService.nameShort), update);
    this.renderMessage(localize(21555, null));
  }
  renderCancelling() {
    this.renderTitleAndInfo(localize(21524, null));
    this.renderMessage(localize(21523, null));
  }
  renderTitleAndInfo(title, update) {
    this.titleNode.textContent = title;
    const version2 = update?.productVersion;
    if (version2) {
      const updateCommitId = update.version?.substring(0, 7);
      this.latestVersionNode.textContent = updateCommitId ? localize(21550, null, version2, updateCommitId) : localize(21549, null, version2);
      this.latestVersionCopyValue.value = updateCommitId ? `${version2} (${update.version})` : version2;
      this.latestVersionNode.parentElement.style.display = "";
      this.latestVersionCopyButton.tabIndex = 0;
    } else {
      this.latestVersionNode.parentElement.style.display = "none";
      this.latestVersionCopyButton.tabIndex = -1;
    }
    const releaseDate = update?.timestamp ?? tryParseDate(this.productService.date);
    if (typeof releaseDate === "number" && releaseDate > 0) {
      this.releaseDateNode.textContent = localize(21553, null, formatDate(releaseDate));
      this.releaseDateNode.style.display = "";
    } else {
      this.releaseDateNode.style.display = "none";
    }
    this.releaseNotesVersion = version2 ?? this.productService.version;
    this.releaseNotesButton.style.display = this.releaseNotesVersion ? "" : "none";
    this.releaseNotesButton.tabIndex = this.releaseNotesVersion ? 0 : -1;
    this.releaseNotesButton.style.marginRight = this.releaseNotesVersion ? "auto" : "";
    this.buttonBar.style.display = this.releaseNotesVersion ? "" : "none";
  }
  renderActionButton(label3, commandId) {
    this.actionButton.textContent = label3;
    this.actionButton.dataset.commandId = commandId;
    this.actionButton.style.display = "";
    this.actionButton.tabIndex = 0;
  }
  renderMessage(message, icon2) {
    clearNode(this.messageNode);
    if (icon2) {
      const iconNode = append(this.messageNode, $(".state-message-icon"));
      iconNode.classList.add(...ThemeIcon.asClassNameArray(icon2));
    }
    append(this.messageNode, document.createTextNode(message));
    this.messageNode.style.display = "";
  }
  createVersionRow(parent) {
    const row = append(parent, $(".product-version"));
    const label3 = append(row, $("span"));
    const copyValue = { value: "" };
    const copyButton = append(row, $("a.copy-version-button"));
    copyButton.setAttribute("role", "button");
    copyButton.setAttribute("tabindex", "0");
    const title = localize(21527, null);
    copyButton.title = title;
    copyButton.setAttribute("aria-label", title);
    const copyIcon2 = append(copyButton, $(".copy-icon"));
    copyIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.copy));
    this._register(addDisposableListener(copyButton, "click", (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      if (copyValue.value) {
        this.clipboardService.writeText(copyValue.value);
      }
    }));
    return { label: label3, copyValue, copyButton };
  }
  runCommandAndClose(command4, ...args2) {
    this.commandService.executeCommand(command4, ...args2);
    this.hoverService.hideHover(true);
  }
};

UpdateTooltip = __decorateClass([
  __decorateParam(0, IClipboardService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IProductService)
], UpdateTooltip);
export { UpdateTooltip };
