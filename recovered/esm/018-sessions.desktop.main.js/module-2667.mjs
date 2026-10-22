// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeWidget.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { URI } from "./module-0032.mjs";
import { $, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { localizeBridge } from "./module-2621.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";
import { NEW_WINDOW_COMMAND_ID, OPEN_FOLDER_COMMAND_ID, newWindowTooltip, openFolderTooltip } from "./module-2657.mjs";
import { OpenCodeBridgeStatusMessage } from "./module-2664.mjs";
import { OpenCodeBridgePublicUrlField, encodeMcpAddressForDisplay } from "./module-2660.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { BRIDGE_QUICK_LINKS_SETTING, DEFAULT_QUICK_LINKS, QUICK_LINK_MAX_NAME_LENGTH, QUICK_LINK_MAX_URL_LENGTH, isValidQuickLinkUrl, readQuickLinks } from "./module-2658.mjs";
import { describeBridgeStartupFailure } from "./module-2665.mjs";
import { bridgeSettingWriteTarget, isBridgeSettingProjectOverride } from "./module-2655.mjs";
import { AICustomizationManagementEditorInput } from "./module-2622.mjs";
import { runBridgeStartupFailureAction } from "./module-2666.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { aiCustomizationManagementSectionRegistry } from "./module-2623.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeWidget.ts
var BRIDGE_GET_STATUS = "opencode.bridge.getStatus";

var BRIDGE_CONFIGURE = "opencode.bridge.configure";

var BRIDGE_CONFIGURE_NAMED_TUNNEL = "opencode.bridge.configureNamedTunnel";

var BRIDGE_CLEAR_NAMED_TUNNEL_TOKEN = "opencode.bridge.clearNamedTunnelToken";

var BRIDGE_SET_TUNNEL_PROVIDER = "opencode.bridge.setTunnelProvider";

var BRIDGE_START = "opencode.bridge.start";

var BRIDGE_STOP = "opencode.bridge.stop";

var BRIDGE_CLEANUP_PROCESSES = "opencode.bridge.cleanupProcesses";

var BRIDGE_CHECK_TUNNEL = "opencode.bridge.checkTunnel";

var BRIDGE_INSTALL_CLOUDFLARED = "opencode.bridge.installCloudflared";

var BRIDGE_ROTATE_ENDPOINT = "opencode.bridge.rotateEndpoint";

var BRIDGE_OPEN_SESSION = "opencode.bridge.openSession";

var BRIDGE_PERSISTENT_MODE = "opencode.bridge.persistentMode";

var NGROK_VIDEO_TUTORIAL_URL = "https://www.bilibili.com/video/BV1NMt36yEZt/";

var DEFAULT_ARENA_PROMPT = "使用上方 MCP_URL_BASE64 接入 MCP，完成 initialize 与 initialized 握手，先通过 tools/list 阅读工具规则并创建或更新 Bridge 任务卡。接入时必须完整读取已设置的全部已启用规则：调用 bridge_get_effective_rules，再调用 bridge_acknowledge_rules 确认当前哈希。未读取和确认规则，不执行工作区操作；工具不可用时如实说明，不能假装已经读取。";

var BRIDGE_COPY_PROMPT_SETTING = "opencode.bridge.copyPromptText";

var DEFAULT_ARENA_PROMPT_VARIANTS = [DEFAULT_ARENA_PROMPT];

var BRIDGE_WORKSPACE_SCOPE_SETTING = "opencode.bridge.workspaceScope";

var WINDOW_RESTORE_SETTING = "opencode.windowRestore";

var BRIDGE_STARTUP_PIN_PAGE_SETTING = "opencode.bridge.startupPinPage";

var BRIDGE_SETTINGS_PAGE_FLOATING_SETTING = "opencode.bridge.settingsPageFloating";

var OpenCodeBridgeWidget = class extends Disposable {
  constructor(container2, commandService, clipboardService, openerService, dialogService, configurationService) {
    super();
    this.commandService = commandService;
    this.clipboardService = clipboardService;
    this.openerService = openerService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.providerChoiceCards = /* @__PURE__ */ new Map();
    this.providerChoiceStacks = /* @__PURE__ */ new Map();
    this.cleaningTunnel = false;
    this.lastDefaultPromptIndex = -1;
    this.quickLinkButtons = [];
    this.quickLinkRowButtons = [];
    this.busy = false;
    this.statusRequestVersion = 0;
    this.statusRefreshInFlight = false;
    this.domainInputDirty = false;
    this.namedTunnelInputDirty = false;
    this.installingCloudflared = false;
    this.lastCopiedQuickTunnelUrl = "";
    /** Startup-failure buttons reuse the page's existing handlers and commands (P7). */
    this.startupFailureActions = {
      context: () => ({ provider: this.lastStatus?.tunnelProvider, namedDomainConfigured: Boolean(this.lastStatus?.configuredNamedDomain), platform: isMacintosh ? "macOS" : "Windows" }),
      retryStart: () => this.toggleBridge(),
      installCloudflared: () => this.lastStatus?.tunnelProvider === "cloudflare" ? this.installAndCheckCloudflared() : this.installCloudflared(),
      checkTunnel: () => this.runCommand(BRIDGE_CHECK_TUNNEL),
      revealNgrokSetup: () => this.revealNgrokSetup(),
      selectQuickTunnel: () => this.selectTunnelProvider("cloudflare"),
      openConnectionSettings: (field) => this.revealConnectionField(field),
      openFolder: () => this.openWorkspaceFolder(),
      cleanupProcesses: () => this.cleanupTunnel(),
      executeCommand: (id2, ...args2) => this.commandService.executeCommand(id2, ...args2),
      openExternal: (url) => this.openerService.open(URI.parse(url), { openExternal: true }),
      copyText: (text2) => this.copyText(text2)
    };
    this.disposed = false;
    clearNode(container2);
    this.root = append(container2, $(".opencode-bridge"));
    this.copyToast = append(this.root, $(".opencode-bridge-copy-toast"));
    this.copyToast.setAttribute("role", "status");
    this.copyToast.setAttribute("aria-live", "polite");
    const heroCard = append(this.root, $(".opencode-bridge-card.opencode-bridge-hero"));
    const heroHeader = append(heroCard, $(".opencode-bridge-card-header"));
    append(heroHeader, $("h2", void 0, localizeBridge("opencodeBridge.title", "OpenCode Bridge")));
    const heroHeaderRight = append(heroHeader, $(".opencode-bridge-hero-header-right"));
    const heroHeaderActions = append(heroHeaderRight, $(".opencode-bridge-header-actions"));
    this.newWindowButton = this._register(new Button(heroHeaderActions, { ...defaultButtonStyles, supportIcons: true }));
    this.newWindowButton.element.classList.add("opencode-bridge-new-window-button");
    this.newWindowButton.label = `$(${Codicon.emptyWindow.id}) ${localizeBridge("opencodeBridge.newWindow", "New Window")}`;
    this.newWindowButton.setTitle(newWindowTooltip(localizeBridge("opencodeBridge.newWindowTitle", "Open a new OpenCode window, same as File > New Window")));
    this._register(this.newWindowButton.onDidClick(() => this.openNewWindow()));
    this.openFolderButton = this._register(new Button(heroHeaderActions, { ...defaultButtonStyles, supportIcons: true }));
    this.openFolderButton.element.classList.add("opencode-bridge-open-folder-button");
    this.openFolderButton.label = `$(${Codicon.folderOpened.id}) ${localizeBridge("opencodeBridge.openFolder", "Open Folder")}`;
    this.openFolderButton.setTitle(openFolderTooltip(localizeBridge("opencodeBridge.openFolderTitle", "Open a folder in OpenCode, same as File > Open Folder\u2026")));
    this._register(this.openFolderButton.onDidClick(() => this.openWorkspaceFolder()));
    this.stateBadge = append(heroHeaderRight, $(".opencode-bridge-state state-stopped"));
    append(heroCard, $(
      "p.opencode-bridge-hero-description",
      void 0,
      localizeBridge("opencodeBridge.descriptionShort", "Connect the current workspace tools to ChatGPT or another remote MCP client.")
    ));
    this.statusMessage = this._register(new OpenCodeBridgeStatusMessage(heroCard, (action, failure2) => this.runStartupFailureAction(action, failure2)));
    this.statusMessage.render({
      message: localizeBridge("opencodeBridge.loadingStatus", "Checking Bridge status\u2026"),
      error: false
    });
    this.publicUrlField = this._register(new OpenCodeBridgePublicUrlField(heroCard, (url) => this.copyText(url)));
    const heroControls = append(heroCard, $(".opencode-bridge-controls.opencode-bridge-hero-actions"));
    this.startStopButton = this._register(new Button(heroControls, { ...defaultButtonStyles, supportIcons: true }));
    this.startStopButton.label = `$(${Codicon.play.id}) ${localizeBridge("opencodeBridge.start", "Start Bridge")}`;
    this._register(this.startStopButton.onDidClick(() => this.toggleBridge()));
    const copyPromptButton = this._register(new Button(heroControls, { ...defaultButtonStyles, supportIcons: true }));
    copyPromptButton.label = `$(${Codicon.copy.id}) ${localizeBridge("opencodeBridge.copyPrompt", "Copy prompt")}`;
    copyPromptButton.setTitle(localizeBridge("opencodeBridge.copyPromptTitleBase64", "Copy the Base64 MCP address and connection prompt to the clipboard"));
    this._register(copyPromptButton.onDidClick(() => this.copyArenaPrompt()));
    this.cleanupButton = this._register(new Button(heroControls, { ...defaultButtonStyles, supportIcons: true, secondary: true }));
    this.cleanupButton.element.classList.add("opencode-bridge-cleanup-button");
    this.cleanupButton.label = `$(${Codicon.trash.id}) ${localizeBridge("opencodeBridge.cleanup", "Clean up processes")}`;
    this.cleanupButton.setTitle(localizeBridge("opencodeBridge.cleanupDetail", "Terminate only tunnel processes left behind by a crashed previous session. The running Bridge is not stopped; other windows, editors, proxy tools and tunnels are not affected."));
    this._register(this.cleanupButton.onDidClick(() => this.cleanupTunnel()));
    this.quickLinkButtonsContainer = append(heroControls, $(".opencode-bridge-quick-links"));
    this.renderQuickLinkButtons();
    const securityNote = append(heroCard, $(".opencode-bridge-security-note"));
    const warningIcon3 = append(securityNote, $("span"));
    warningIcon3.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
    append(securityNote, $(
      "span",
      void 0,
      localizeBridge("opencodeBridge.securityWarningShort", "Bridge can edit files and run terminal commands. Keep the MCP address private.")
    ));
    this.connectionCard = append(this.root, $("details.opencode-bridge-card.opencode-bridge-connection-card"));
    this.connectionCard.open = false;
    const connectionSummary = append(this.connectionCard, $("summary"));
    const connectionSummaryMain = append(connectionSummary, $(".opencode-bridge-connection-summary-main"));
    append(connectionSummaryMain, $("h3", void 0, localizeBridge("opencodeBridge.connectionSettings", "Connection settings")));
    this.connectionDetails = append(connectionSummaryMain, $(
      ".opencode-bridge-connection-details",
      void 0,
      localizeBridge("opencodeBridge.connectionChecking", "Checking tunnel settings\u2026")
    ));
    this.connectionBadge = append(connectionSummary, $(
      ".opencode-bridge-state state-stopped",
      void 0,
      localizeBridge("opencodeBridge.checking", "Checking")
    ));
    const configurationCard = append(this.connectionCard, $(".opencode-bridge-connection-body"));
    const providerField = this.createField(configurationCard, localizeBridge("opencodeBridge.tunnelProvider", "Tunnel mode"));
    const providerChoices = append(providerField, $(".opencode-bridge-provider-choices"));
    providerChoices.setAttribute("role", "radiogroup");
    this.cloudflareProviderButton = this.createTunnelProviderChoice(
      providerChoices,
      "cloudflare",
      localizeBridge("opencodeBridge.cloudflareQuickTunnel", "Cloudflare Quick Tunnel (no account or domain)"),
      localizeBridge("opencodeBridge.cloudflareRecommended", "Default \xB7 zero configuration"),
      localizeBridge("opencodeBridge.cloudflareModeSummary", "A new address is created after every Bridge restart. Best when setup simplicity matters more than keeping one permanent URL."),
      [
        localizeBridge("opencodeBridge.cloudflareModeAddress", "Address: temporary; changes after restart"),
        localizeBridge("opencodeBridge.cloudflareModeLimits", "Limits: no listed monthly request quota; 200 concurrent requests; no SLA"),
        localizeBridge("opencodeBridge.cloudflareModeSetup", "Setup: install cloudflared and allow Cloudflare Tunnel egress on port 7844 (or enable a global/TUN proxy); no account or domain")
      ]
    );
    [this.quickInstallCloudflaredShortcutButton] = this.createProviderShortcutActions("cloudflare", [
      {
        labelKey: "opencodeBridge.quickInstallCloudflared",
        label: "Install now",
        titleKey: "opencodeBridge.quickInstallCloudflaredHelp",
        title: "Run the cloudflared install and verification steps below",
        run: () => this.installAndCheckCloudflared()
      }
    ]);
    this.cloudflareNamedProviderButton = this.createTunnelProviderChoice(
      providerChoices,
      "cloudflare-named",
      localizeBridge("opencodeBridge.cloudflareNamedTunnel", "Cloudflare Named Tunnel"),
      localizeBridge("opencodeBridge.cloudflareNamedStableAddress", "Stable address"),
      localizeBridge("opencodeBridge.cloudflareNamedModeSummary", "Use a Cloudflare-managed hostname that remains unchanged after OpenCode restarts."),
      [
        localizeBridge("opencodeBridge.cloudflareNamedModeAddress", "Address: stable hostname on your Cloudflare-managed domain"),
        localizeBridge("opencodeBridge.cloudflareNamedModeLimits", "Limits: no ngrok-style 20,000 monthly request quota"),
        localizeBridge("opencodeBridge.cloudflareNamedModeSetup", "Setup: Cloudflare account, domain, Tunnel Token, and published application route")
      ]
    );
    this.ngrokProviderButton = this.createTunnelProviderChoice(
      providerChoices,
      "ngrok",
      localizeBridge("opencodeBridge.ngrokReservedTunnel", "ngrok development domain"),
      localizeBridge("opencodeBridge.ngrokStableAddress", "Stable address"),
      localizeBridge("opencodeBridge.ngrokModeSummary", "The account-assigned development domain can be reused after restart, so the ChatGPT MCP address normally stays unchanged."),
      [
        localizeBridge("opencodeBridge.ngrokModeAddress", "Address: stable; reusable after restart"),
        localizeBridge("opencodeBridge.ngrokModeLimits", "Free limits: 20,000 HTTP/S requests and 1 GB outbound data per month"),
        localizeBridge("opencodeBridge.ngrokModeSetup", "Setup: ngrok account, Authtoken, and assigned development domain")
      ]
    );
    this.createProviderShortcutActions("ngrok", [
      {
        labelKey: "opencodeBridge.jumpToNgrokSetup",
        label: "Setup commands",
        titleKey: "opencodeBridge.jumpToNgrokSetupHelp",
        title: "Jump to the ngrok setup commands below",
        run: () => this.revealNgrokSetup()
      },
      {
        labelKey: "opencodeBridge.openNgrokVideoTutorial",
        label: "Video tutorial",
        titleKey: "opencodeBridge.openNgrokVideoTutorialHelp",
        title: "Open the ngrok video tutorial",
        run: () => this.openerService.open(URI.parse(NGROK_VIDEO_TUTORIAL_URL), { openExternal: true })
      }
    ]);
    append(providerField, $(
      ".opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.tunnelProviderHelp", "Select a mode above. Stop Bridge before switching tunnel modes.")
    ));
    this.domainField = this.createField(configurationCard, localizeBridge("opencodeBridge.domain", "ngrok domain"));
    this.domainInput = append(this.domainField, $("input.opencode-bridge-input"));
    this.domainInput.type = "text";
    this.domainInput.spellcheck = false;
    this.domainInput.placeholder = "your-name.ngrok-free.dev";
    this._register(addDisposableListener(this.domainInput, "input", () => {
      this.domainInputDirty = true;
    }));
    this._register(addDisposableListener(this.domainInput, "blur", () => void this.persistDomain()));
    this._register(addDisposableListener(this.domainInput, "keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void this.persistDomain();
        this.domainInput.blur();
      }
    }));
    append(this.domainField, $(
      ".opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.domainHelpShort", "Enter the reserved hostname from your ngrok dashboard.")
    ));
    this.namedTunnelConfiguration = append(configurationCard, $(".opencode-bridge-named-configuration"));
    append(this.namedTunnelConfiguration, $(
      "h4",
      void 0,
      localizeBridge("opencodeBridge.cloudflareNamedConfiguration", "Cloudflare Named Tunnel configuration")
    ));
    const namedGrid = append(this.namedTunnelConfiguration, $(".opencode-bridge-named-grid"));
    const namedDomainField = this.createField(namedGrid, localizeBridge("opencodeBridge.cloudflareNamedHostname", "Public hostname"));
    this.namedTunnelDomainInput = append(namedDomainField, $("input.opencode-bridge-input"));
    this.namedTunnelDomainInput.type = "text";
    this.namedTunnelDomainInput.spellcheck = false;
    this.namedTunnelDomainInput.placeholder = "mcp.example.com";
    const namedTokenField = this.createField(namedGrid, localizeBridge("opencodeBridge.cloudflareTunnelToken", "Tunnel Token"));
    this.namedTunnelTokenInput = append(namedTokenField, $("input.opencode-bridge-input"));
    this.namedTunnelTokenInput.type = "password";
    this.namedTunnelTokenInput.spellcheck = false;
    this.namedTunnelTokenInput.autocomplete = "off";
    this.namedTunnelTokenInput.placeholder = localizeBridge("opencodeBridge.cloudflareTunnelTokenPlaceholder", "Paste token to set or replace it");
    this.namedTunnelTokenStatus = append(namedTokenField, $(".opencode-bridge-help"));
    const namedPortField = this.createField(namedGrid, localizeBridge("opencodeBridge.cloudflareNamedLocalPort", "Fixed local port"));
    this.namedTunnelPortInput = append(namedPortField, $("input.opencode-bridge-input"));
    this.namedTunnelPortInput.type = "number";
    this.namedTunnelPortInput.min = "1024";
    this.namedTunnelPortInput.max = "65535";
    this.namedTunnelPortInput.step = "1";
    const namedOriginField = this.createField(namedGrid, localizeBridge("opencodeBridge.cloudflareNamedServiceUrl", "Cloudflare Service URL"));
    const namedOriginRow = append(namedOriginField, $(".opencode-bridge-named-origin-row"));
    this.namedTunnelOriginValue = append(namedOriginRow, $("input.opencode-bridge-input"));
    this.namedTunnelOriginValue.type = "text";
    this.namedTunnelOriginValue.readOnly = true;
    const copyNamedOriginButton = append(namedOriginRow, $("button.opencode-bridge-copy-url"));
    copyNamedOriginButton.type = "button";
    copyNamedOriginButton.textContent = localizeBridge("copy", "Copy");
    this._register(addDisposableListener(copyNamedOriginButton, "click", () => this.copyText(this.namedTunnelOriginValue.value)));
    append(this.namedTunnelConfiguration, $(
      ".opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.cloudflareNamedServiceHelp", "In Cloudflare Tunnels, the published application hostname must match the public hostname above and the Service URL must exactly match this local URL.")
    ));
    const namedActions = append(this.namedTunnelConfiguration, $(".opencode-bridge-controls"));
    this.saveNamedTunnelButton = this._register(new Button(namedActions, { ...defaultButtonStyles, supportIcons: true }));
    this.saveNamedTunnelButton.label = `$(${Codicon.save.id}) ${localizeBridge("opencodeBridge.saveNamedTunnel", "Save Named Tunnel")}`;
    this._register(this.saveNamedTunnelButton.onDidClick(() => this.saveNamedTunnel()));
    this.clearNamedTunnelTokenButton = this._register(new Button(namedActions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.clearNamedTunnelTokenButton.label = `$(${Codicon.clearAll.id}) ${localizeBridge("opencodeBridge.clearTunnelToken", "Clear token")}`;
    this._register(this.clearNamedTunnelTokenButton.onDidClick(() => this.clearNamedTunnelToken()));
    for (const input of [this.namedTunnelDomainInput, this.namedTunnelTokenInput, this.namedTunnelPortInput]) {
      this._register(addDisposableListener(input, "input", () => {
        this.namedTunnelInputDirty = true;
        this.updateNamedTunnelOriginPreview();
        this.updateControls();
      }));
    }
    this.tunnelSetupPanel = append(configurationCard, $(".opencode-bridge-tunnel-panel"));
    const tunnelStatusRow = append(this.tunnelSetupPanel, $(".opencode-bridge-tunnel-status-row"));
    const tunnelStatusText = append(tunnelStatusRow, $(".opencode-bridge-tunnel-status-text"));
    append(tunnelStatusText, $(
      ".opencode-bridge-label",
      void 0,
      localizeBridge("opencodeBridge.tunnelStatus", "Tunnel status")
    ));
    this.tunnelState = append(tunnelStatusText, $(
      ".opencode-bridge-tunnel-state",
      void 0,
      localizeBridge("opencodeBridge.tunnelUnchecked", "The tunnel client has not been checked yet.")
    ));
    const tunnelStatusActions = append(tunnelStatusRow, $(".opencode-bridge-controls.opencode-bridge-tunnel-actions"));
    this.checkButton = this._register(new Button(tunnelStatusActions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.checkButton.label = `$(${Codicon.check.id}) ${localizeBridge("opencodeBridge.checkTunnel", "Check tunnel")}`;
    this._register(this.checkButton.onDidClick(() => this.runCommand(BRIDGE_CHECK_TUNNEL)));
    this.installCloudflaredButton = this._register(new Button(tunnelStatusActions, { ...defaultButtonStyles, supportIcons: true }));
    this.installCloudflaredButton.label = `$(${Codicon.cloudDownload.id}) ${localizeBridge("opencodeBridge.installCloudflaredNow", "Install cloudflared")}`;
    this._register(this.installCloudflaredButton.onDidClick(() => this.installCloudflared()));
    const cloudflareSetup = this.createCloudflareSetupSection(this.tunnelSetupPanel);
    this.cloudflareSetupDetails = cloudflareSetup.details;
    this.cloudflareSetupSummary = cloudflareSetup.summary;
    const cloudflareNamedSetup = this.createCloudflareNamedSetupSection(this.tunnelSetupPanel);
    this.cloudflareNamedSetupDetails = cloudflareNamedSetup.details;
    this.cloudflareNamedSetupSummary = cloudflareNamedSetup.summary;
    const ngrokSetup = this.createNgrokSetupSection(this.tunnelSetupPanel);
    this.ngrokSetupDetails = ngrokSetup.details;
    this.ngrokSetupSummary = ngrokSetup.summary;
    const persistentRow = append(configurationCard, $(".opencode-bridge-persistent-row"));
    const persistentText = append(persistentRow, $(".opencode-bridge-persistent-text"));
    const persistentLabel = append(persistentText, $("label.opencode-bridge-label"));
    persistentLabel.textContent = localizeBridge("opencodeBridge.persistentMode", "Start Bridge with OpenCode");
    append(persistentText, $(
      ".opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.persistentModeHelpShort", "Automatically open and start Bridge after the app is ready.")
    ));
    this.persistentModeToggle = append(persistentRow, $("button.opencode-bridge-switch"));
    this.persistentModeToggle.type = "button";
    this.persistentModeToggle.setAttribute("role", "switch");
    this.persistentModeToggle.setAttribute("aria-label", localizeBridge("opencodeBridge.persistentMode", "Start Bridge with OpenCode"));
    append(this.persistentModeToggle, $("span.opencode-bridge-switch-track"));
    this.renderPersistentModeToggle(this.configurationService.getValue(BRIDGE_PERSISTENT_MODE) === true);
    this._register(addDisposableListener(this.persistentModeToggle, "click", () => {
      const enabled = this.persistentModeToggle.getAttribute("aria-checked") !== "true";
      this.renderPersistentModeToggle(enabled);
      void this.configurationService.updateValue(BRIDGE_PERSISTENT_MODE, enabled, 2 /* USER */).catch((error) => {
        this.renderPersistentModeToggle(this.configurationService.getValue(BRIDGE_PERSISTENT_MODE) === true);
        this.renderLocalError(error instanceof Error ? error.message : String(error));
      });
    }));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(BRIDGE_PERSISTENT_MODE)) {
        this.renderPersistentModeToggle(this.configurationService.getValue(BRIDGE_PERSISTENT_MODE) === true);
      }
    }));
    this.quickLinksCard = append(this.root, $("details.opencode-bridge-card.opencode-bridge-quick-links-card"));
    this.quickLinksCard.open = false;
    const quickLinksSummary = append(this.quickLinksCard, $("summary"));
    append(quickLinksSummary, $("h3", void 0, localizeBridge("opencodeBridge.quickLinks", "Quick open")));
    const quickLinksBody = append(this.quickLinksCard, $(".opencode-bridge-quick-links-body"));
    append(quickLinksBody, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.quickLinksHelp", "Shortcuts you add here appear as buttons at the top of this page and open in the OpenCode built-in browser.")
    ));
    const quickLinkForm = append(quickLinksBody, $(".opencode-bridge-quick-link-form"));
    this.quickLinkNameInput = append(quickLinkForm, $("input.opencode-bridge-input.opencode-bridge-quick-link-name-input"));
    this.quickLinkNameInput.type = "text";
    this.quickLinkNameInput.spellcheck = false;
    this.quickLinkNameInput.placeholder = localizeBridge("opencodeBridge.quickLinkNamePlaceholder", "Name");
    this.quickLinkUrlInput = append(quickLinkForm, $("input.opencode-bridge-input.opencode-bridge-quick-link-url-input"));
    this.quickLinkUrlInput.type = "text";
    this.quickLinkUrlInput.spellcheck = false;
    this.quickLinkUrlInput.placeholder = localizeBridge("opencodeBridge.quickLinkUrlPlaceholder", "https://\u2026");
    this.quickLinkAddButton = this._register(new Button(quickLinkForm, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.quickLinkAddButton.label = `$(${Codicon.add.id}) ${localizeBridge("opencodeBridge.quickLinkAdd", "Add")}`;
    this._register(this.quickLinkAddButton.onDidClick(() => this.addQuickLink()));
    for (const input of [this.quickLinkNameInput, this.quickLinkUrlInput]) {
      this._register(addDisposableListener(input, "input", () => this.updateControls()));
      this._register(addDisposableListener(input, "keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void this.addQuickLink();
        }
      }));
    }
    this.quickLinkMessage = append(quickLinksBody, $(".opencode-bridge-quick-link-message"));
    this.quickLinkList = append(quickLinksBody, $(".opencode-bridge-quick-link-list"));
    this.renderQuickLinksList();
    const quickLinkFooter = append(quickLinksBody, $(".opencode-bridge-quick-link-footer"));
    this.quickLinkRestoreButton = this._register(new Button(quickLinkFooter, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.quickLinkRestoreButton.label = `$(${Codicon.refresh.id}) ${localizeBridge("opencodeBridge.quickLinkRestoreDefaults", "Restore defaults")}`;
    this._register(this.quickLinkRestoreButton.onDidClick(() => void this.restoreQuickLinksDefaults()));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(BRIDGE_QUICK_LINKS_SETTING)) {
        this.renderQuickLinkButtons();
        this.renderQuickLinksList();
      }
    }));
    const advanced = append(this.root, $("details.opencode-bridge-card.opencode-bridge-advanced-card"));
    advanced.open = false;
    const advancedSummary = append(advanced, $("summary"));
    append(advancedSummary, $("h3", void 0, localizeBridge("opencodeBridge.advancedSettings", "Advanced settings")));
    const advancedBody = append(advanced, $(".opencode-bridge-advanced-body"));
    const transportRow = append(advancedBody, $(".opencode-bridge-static-row"));
    append(transportRow, $(".opencode-bridge-label", void 0, localizeBridge("opencodeBridge.transport", "Transport protocol")));
    append(transportRow, $(
      ".opencode-bridge-static-value",
      void 0,
      localizeBridge("opencodeBridge.streamableHttp", "Streamable HTTP")
    ));
    const workScopeSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(workScopeSection, $("h4", void 0, localizeBridge("opencodeBridge.workScope", "Work scope")));
    append(workScopeSection, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.workScopeHelp", "Choose the default target described to remote agents. Entire device still prioritizes the current workspace; Project files expands outside it only when you explicitly name another local path. Workspace file tools remain workspace-scoped.")
    ));
    const workScopeControls = append(workScopeSection, $(".opencode-bridge-controls"));
    this.workspaceScopeButton = this._register(new Button(workScopeControls, { ...defaultButtonStyles, secondary: true }));
    this.renderWorkspaceScopeButton();
    this._register(this.workspaceScopeButton.onDidClick(() => void this.toggleWorkspaceScope()));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(BRIDGE_WORKSPACE_SCOPE_SETTING)) {
        this.renderWorkspaceScopeButton();
      }
    }));
    const windowRestoreSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(windowRestoreSection, $("h4", void 0, localizeBridge("opencodeBridge.windowRestore", "Window restore")));
    append(windowRestoreSection, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.windowRestoreHelp", "Choose what OpenCode reopens on startup. Restoring only the last closed window avoids a pile of workspace windows; restoring everything keeps the previous session intact.")
    ));
    const windowRestoreControls = append(windowRestoreSection, $(".opencode-bridge-controls"));
    this.windowRestoreButton = this._register(new Button(windowRestoreControls, { ...defaultButtonStyles, secondary: true }));
    this.renderWindowRestoreButton();
    this._register(this.windowRestoreButton.onDidClick(() => void this.toggleWindowRestore()));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(WINDOW_RESTORE_SETTING)) {
        this.renderWindowRestoreButton();
      }
    }));
    const startupPinSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(startupPinSection, $("h4", void 0, localizeBridge("opencodeBridge.startupPinPage", "Pin Bridge settings page")));
    const startupPinRow = append(startupPinSection, $(".opencode-bridge-persistent-row"));
    const startupPinText = append(startupPinRow, $(".opencode-bridge-persistent-text"));
    append(startupPinText, $(
      ".opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.startupPinPageHelp", "When enabled, every restart and new window brings the Bridge page to the front and pins it, removing the default welcome page. When disabled, standard startup behavior is restored.")
    ));
    this.startupPinPageToggle = append(startupPinRow, $("button.opencode-bridge-switch"));
    this.startupPinPageToggle.type = "button";
    this.startupPinPageToggle.setAttribute("role", "switch");
    this.startupPinPageToggle.setAttribute("aria-label", localizeBridge("opencodeBridge.startupPinPage", "Pin Bridge settings page"));
    append(this.startupPinPageToggle, $("span.opencode-bridge-switch-track"));
    this.renderStartupPinPageToggle(this.configurationService.getValue(BRIDGE_STARTUP_PIN_PAGE_SETTING) !== false);
    this._register(addDisposableListener(this.startupPinPageToggle, "click", () => {
      const enabled = this.startupPinPageToggle.getAttribute("aria-checked") !== "true";
      this.renderStartupPinPageToggle(enabled);
      void this.configurationService.updateValue(BRIDGE_STARTUP_PIN_PAGE_SETTING, enabled, 2 /* USER */).catch((error) => {
        this.renderStartupPinPageToggle(this.configurationService.getValue(BRIDGE_STARTUP_PIN_PAGE_SETTING) !== false);
        this.renderLocalError(error instanceof Error ? error.message : String(error));
      });
    }));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(BRIDGE_STARTUP_PIN_PAGE_SETTING)) {
        this.renderStartupPinPageToggle(this.configurationService.getValue(BRIDGE_STARTUP_PIN_PAGE_SETTING) !== false);
      }
    }));
    const settingsPageFloatSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(settingsPageFloatSection, $("h4", void 0, localizeBridge("opencodeBridge.settingsPageFloat", "Floating Bridge settings card")));
    const settingsPageFloatRow = append(settingsPageFloatSection, $(".opencode-bridge-persistent-row"));
    const settingsPageFloatText = append(settingsPageFloatRow, $(".opencode-bridge-persistent-text"));
    append(settingsPageFloatText, $(
      ".opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.settingsPageFloatHelp", "When enabled, the Bridge settings render in a floating card inside the window that can be dragged anywhere. When disabled, the default embedded layout is restored.")
    ));
    this.settingsPageFloatToggle = append(settingsPageFloatRow, $("button.opencode-bridge-switch"));
    this.settingsPageFloatToggle.type = "button";
    this.settingsPageFloatToggle.setAttribute("role", "switch");
    this.settingsPageFloatToggle.setAttribute("aria-label", localizeBridge("opencodeBridge.settingsPageFloat", "Floating Bridge settings card"));
    append(this.settingsPageFloatToggle, $("span.opencode-bridge-switch-track"));
    this.renderSettingsPageFloatToggle(this.configurationService.getValue(BRIDGE_SETTINGS_PAGE_FLOATING_SETTING) === true);
    this._register(addDisposableListener(this.settingsPageFloatToggle, "click", () => {
      const enabled = this.settingsPageFloatToggle.getAttribute("aria-checked") !== "true";
      this.renderSettingsPageFloatToggle(enabled);
      void this.configurationService.updateValue(BRIDGE_SETTINGS_PAGE_FLOATING_SETTING, enabled, 2 /* USER */).catch((error) => {
        this.renderSettingsPageFloatToggle(this.configurationService.getValue(BRIDGE_SETTINGS_PAGE_FLOATING_SETTING) === true);
        this.renderLocalError(error instanceof Error ? error.message : String(error));
      });
    }));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(BRIDGE_SETTINGS_PAGE_FLOATING_SETTING)) {
        this.applySettingsPagePresentation();
      }
    }));
    this.applySettingsPagePresentation();
    const diagnosticsSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(diagnosticsSection, $("h4", void 0, localizeBridge("opencodeBridge.connectionDiagnostics", "Connection diagnostics")));
    const diagnosticControls = append(diagnosticsSection, $(".opencode-bridge-controls.opencode-bridge-diagnostic-actions"));
    const openSessionButton = this._register(new Button(diagnosticControls, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    openSessionButton.label = `$(${Codicon.openPreview.id}) ${localizeBridge("opencodeBridge.openSession", "Open Bridge Session")}`;
    this._register(openSessionButton.onDidClick(() => this.commandService.executeCommand(BRIDGE_OPEN_SESSION)));
    const securitySection = append(advancedBody, $(".opencode-bridge-advanced-section.opencode-bridge-security-section"));
    append(securitySection, $("h4", void 0, localizeBridge("opencodeBridge.securityAccess", "Security & access")));
    append(securitySection, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.resetAddressHelp", "Reset the secret path if the MCP address was exposed. Every client using the old address will stop working.")
    ));
    const securityControls = append(securitySection, $(".opencode-bridge-controls"));
    this.rotateButton = this._register(new Button(securityControls, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.rotateButton.label = `$(${Codicon.key.id}) ${localizeBridge("opencodeBridge.resetMcpAddress", "Reset MCP address")}`;
    this._register(this.rotateButton.onDidClick(() => this.resetMcpAddress()));
    const promptSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(promptSection, $("h4", void 0, localizeBridge("opencodeBridge.copyPromptText", "Copy prompt text")));
    append(promptSection, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.copyPromptTextHelpRotating", "Copy prompt includes the Base64-encoded live MCP address. Leave this field empty to rotate the default wording; custom text is used as written.")
    ));
    this.copyPromptInput = append(promptSection, $("textarea.opencode-bridge-input.opencode-bridge-copy-prompt-input"));
    this.copyPromptInput.rows = 3;
    this.copyPromptInput.spellcheck = false;
    this.copyPromptInput.placeholder = DEFAULT_ARENA_PROMPT;
    this.copyPromptInput.value = this.configuredArenaPrompt();
    const promptControls = append(promptSection, $(".opencode-bridge-controls"));
    const savePromptButton = this._register(new Button(promptControls, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    savePromptButton.label = `$(${Codicon.save.id}) ${localizeBridge("opencodeBridge.copyPromptSave", "Save prompt text")}`;
    this._register(savePromptButton.onDidClick(() => this.saveCopyPromptText()));
    const resetPromptButton = this._register(new Button(promptControls, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    resetPromptButton.label = `$(${Codicon.discard.id}) ${localizeBridge("opencodeBridge.copyPromptReset", "Restore default")}`;
    this._register(resetPromptButton.onDidClick(() => this.resetCopyPromptText()));
    this.copyPromptMessage = append(promptSection, $("p.opencode-bridge-inline-message"));
    const toolsSection = append(advancedBody, $(".opencode-bridge-advanced-section"));
    append(toolsSection, $("h4", void 0, localizeBridge("opencodeBridge.exposedTools", "Exposed tools")));
    this.toolsContainer = append(toolsSection, $(".opencode-bridge-tools"));
    const timer = setInterval(() => void this.refresh(), 1e3);
    this._register(toDisposable(() => clearInterval(timer)));
    void this.refresh();
  }
  createField(parent, label3) {
    const field = append(parent, $(".opencode-bridge-field"));
    append(field, $("label.opencode-bridge-label", void 0, label3));
    return field;
  }
  createTunnelProviderChoice(parent, provider, title, badge, summary, facts) {
    const stack = append(parent, $(".opencode-bridge-provider-choice-stack"));
    this.providerChoiceStacks.set(provider, stack);
    const card = append(stack, $(".opencode-bridge-provider-choice-card"));
    this.providerChoiceCards.set(provider, card);
    const button = append(card, $("button.opencode-bridge-provider-choice"));
    button.type = "button";
    button.dataset.provider = provider;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", "false");
    const header2 = append(button, $(".opencode-bridge-provider-header"));
    append(header2, $(".opencode-bridge-provider-title", void 0, title));
    const meta = append(header2, $(".opencode-bridge-provider-meta"));
    append(meta, $(".opencode-bridge-provider-badge", void 0, badge));
    append(button, $(".opencode-bridge-provider-summary", void 0, summary));
    const factList = append(button, $("ul.opencode-bridge-provider-facts"));
    for (const fact of facts) append(factList, $("li", void 0, fact));
    this._register(addDisposableListener(button, "click", () => void this.selectTunnelProvider(provider)));
    return button;
  }
  createProviderShortcutActions(provider, actions) {
    const card = this.providerChoiceCards.get(provider);
    if (!card) {
      throw new Error(`Provider choice card not found for ${provider}`);
    }
    const host = append(card, $(".opencode-bridge-provider-shortcut-host"));
    const row = append(host, $(".opencode-bridge-controls.opencode-bridge-provider-shortcuts"));
    const buttons = [];
    for (const action of actions) {
      const button = this._register(new Button(row, { ...defaultButtonStyles, supportIcons: true }));
      button.label = localizeBridge(action.labelKey, action.label);
      button.setTitle(localizeBridge(action.titleKey, action.title));
      this._register(button.onDidClick(() => void action.run()));
      buttons.push(button);
    }
    return buttons;
  }
  async installAndCheckCloudflared() {
    this.revealedSetupProvider = "cloudflare";
    this.cloudflareSetupDetails.open = true;
    this.updateControls();
    if (this.busy || this.lastStatus?.state === "running" || this.lastStatus?.state === "starting") return;
    if (this.lastStatus?.tunnelInstalled !== true) {
      await this.installCloudflared();
    }
    const statusAfterInstall = this.lastStatus;
    if (this.busy || statusAfterInstall?.state === "starting") return;
    await this.runCommand(BRIDGE_CHECK_TUNNEL);
  }
  revealNgrokSetup() {
    this.revealedSetupProvider = "ngrok";
    this.ngrokSetupDetails.open = true;
    this.updateControls();
    setTimeout(() => {
      this.ngrokSetupDetails.scrollIntoView({ block: "start", behavior: "smooth" });
      this.ngrokSetupSummary.focus();
    }, 0);
  }
  async selectTunnelProvider(provider) {
    this.revealedSetupProvider = void 0;
    if (this.busy || this.lastStatus?.state === "running" || this.lastStatus?.state === "starting" || this.lastStatus?.tunnelProvider === provider) return;
    await this.runCommand(BRIDGE_SET_TUNNEL_PROVIDER, provider);
  }
  createCloudflareSetupSection(parent) {
    const details = append(parent, $("details.opencode-bridge-setup"));
    const summary = append(details, $("summary"));
    summary.textContent = localizeBridge("opencodeBridge.configureCloudflare", "Install cloudflared");
    const body = append(details, $(".opencode-bridge-setup-body"));
    append(body, $(
      "p",
      void 0,
      localizeBridge("opencodeBridge.cloudflareSetupIntro", "Install cloudflared once and allow Cloudflare Tunnel egress on port 7844 (or enable a global/TUN proxy). No Cloudflare account, token, or domain is required for Quick Tunnel.")
    ));
    this.createSetupStep(body, "1", localizeBridge("opencodeBridge.installCloudflared", "Install or update cloudflared"), [
      ...isMacintosh ? [
        localizeBridge("opencodeBridge.command.brewInstallCloudflared", "brew install cloudflared"),
        localizeBridge("opencodeBridge.command.brewUpgradeCloudflared", "brew upgrade cloudflared")
      ] : [
        "winget install --id Cloudflare.cloudflared --exact --accept-package-agreements --accept-source-agreements",
        "winget upgrade --id Cloudflare.cloudflared --exact --accept-package-agreements --accept-source-agreements"
      ]
    ], localizeBridge("opencodeBridge.downloadCloudflared", "Open official download page"), "https://developers.cloudflare.com/tunnel/downloads/");
    this.createSetupStep(body, "2", localizeBridge("opencodeBridge.verifyCloudflared", "Verify cloudflared"), [
      "cloudflared --version"
    ]);
    append(body, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.cloudflareAddressHelp", "Each Bridge start creates a new temporary MCP address. OpenCode copies it automatically; update the address in ChatGPT.")
    ));
    return { details, summary };
  }
  createCloudflareNamedSetupSection(parent) {
    const details = append(parent, $("details.opencode-bridge-setup"));
    const summary = append(details, $("summary"));
    summary.textContent = localizeBridge("opencodeBridge.configureCloudflareNamed", "Configure Cloudflare Named Tunnel");
    const body = append(details, $(".opencode-bridge-setup-body"));
    append(body, $(
      "p",
      void 0,
      localizeBridge("opencodeBridge.cloudflareNamedSetupIntro", "Create a remotely managed Cloudflare Tunnel, copy its token, and publish your hostname to the fixed OpenCode Service URL shown above.")
    ));
    this.createSetupStep(body, "1", localizeBridge("opencodeBridge.installCloudflared", "Install or update cloudflared"), [
      ...isMacintosh ? [
        localizeBridge("opencodeBridge.command.brewInstallCloudflared", "brew install cloudflared"),
        localizeBridge("opencodeBridge.command.brewUpgradeCloudflared", "brew upgrade cloudflared")
      ] : ["winget install --id Cloudflare.cloudflared --exact --accept-package-agreements --accept-source-agreements"]
    ], localizeBridge("opencodeBridge.downloadCloudflared", "Open official download page"), "https://developers.cloudflare.com/tunnel/downloads/");
    this.createSetupStep(
      body,
      "2",
      localizeBridge("opencodeBridge.createCloudflareTunnel", "Create or open a Cloudflare Tunnel and copy its token"),
      [],
      localizeBridge("opencodeBridge.openCloudflareTunnels", "Open Cloudflare Tunnels"),
      "https://dash.cloudflare.com/?to=%2F%3Aaccount%2Ftunnels"
    );
    this.createSetupStep(body, "3", localizeBridge("opencodeBridge.publishCloudflareHostname", "Add a published application route"), []);
    append(body, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.publishCloudflareHostnameHelp", "Set the public hostname to the value saved above and set the Service URL to the exact http://127.0.0.1:<port> value shown by OpenCode.")
    ));
    this.createSetupStep(
      body,
      "4",
      localizeBridge("opencodeBridge.reviewCloudflareDns", "Review the hostname DNS record"),
      [],
      localizeBridge("opencodeBridge.openCloudflareDns", "Open Cloudflare DNS"),
      "https://dash.cloudflare.com/?to=%2F%3Aaccount%2F%3Azone%2Fdns%2Frecords"
    );
    return { details, summary };
  }
  createNgrokSetupSection(parent) {
    const details = append(parent, $("details.opencode-bridge-setup"));
    const summary = append(details, $("summary"));
    summary.textContent = localizeBridge("opencodeBridge.configureNgrok", "Configure ngrok");
    const body = append(details, $(".opencode-bridge-setup-body"));
    append(body, $(
      "p",
      void 0,
      isMacintosh ? localizeBridge("opencodeBridge.setupIntroMac", "Run the following once in the macOS Terminal. After installation, restart OpenCode so ngrok is available to the Extension Host.") : localizeBridge("opencodeBridge.setupIntro", "Run the following once in Windows PowerShell. After installation, restart OpenCode so ngrok is available to the Extension Host.")
    ));
    this.createSetupStep(body, "1", localizeBridge("opencodeBridge.installNgrok", "Install or update ngrok"), [
      ...isMacintosh ? [
        localizeBridge("opencodeBridge.command.brewInstallNgrok", "brew install ngrok"),
        localizeBridge("opencodeBridge.command.brewUpgradeNgrok", "brew upgrade ngrok")
      ] : [
        "winget install --id 9MVS1J51GMK6 --source msstore --accept-package-agreements --accept-source-agreements",
        "winget upgrade --id 9MVS1J51GMK6 --source msstore --accept-package-agreements --accept-source-agreements"
      ]
    ], localizeBridge("opencodeBridge.downloadNgrok", "Open official download page"), isMacintosh ? "https://ngrok.com/download/mac-os" : "https://ngrok.com/download/windows");
    this.createSetupStep(body, "2", localizeBridge("opencodeBridge.addAuthtoken", "Add your ngrok Authtoken"), [
      localizeBridge("opencodeBridge.command.ngrokAddAuthtoken", "ngrok config add-authtoken YOUR_AUTHTOKEN")
    ], localizeBridge("opencodeBridge.openAuthtoken", "Open Authtoken page"), "https://dashboard.ngrok.com/get-started/your-authtoken");
    append(body, $(
      "p.opencode-bridge-help",
      void 0,
      localizeBridge("opencodeBridge.authtokenCommandHelp", "Replace YOUR_AUTHTOKEN in the command with the token shown in the ngrok dashboard. Keep the token private.")
    ));
    this.createSetupStep(body, "3", localizeBridge("opencodeBridge.verifyNgrok", "Verify installation and configuration"), [
      isMacintosh ? localizeBridge("opencodeBridge.command.ngrokVerifyMac", "ngrok version && ngrok config check") : "ngrok version; ngrok config check"
    ]);
    this.createSetupStep(
      body,
      "4",
      localizeBridge("opencodeBridge.reserveDomain", "Choose your free reserved domain"),
      [],
      localizeBridge("opencodeBridge.openDomains", "Open Domains page"),
      "https://dashboard.ngrok.com/domains"
    );
    return { details, summary };
  }
  createSetupStep(parent, number, title, commands, linkLabel, link2) {
    const step = append(parent, $(".opencode-bridge-setup-step"));
    append(step, $("h4", void 0, `${number}. ${title}`));
    for (const command4 of commands) {
      const row = append(step, $(".opencode-bridge-command-row"));
      append(row, $("code", void 0, command4));
      const copy = this._register(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
      copy.label = `$(${Codicon.copy.id})`;
      copy.setTitle(localizeBridge("copy", "Copy"));
      this._register(copy.onDidClick(() => this.copyText(command4)));
    }
    if (linkLabel && link2) {
      const open2 = this._register(new Button(step, { ...defaultButtonStyles, secondary: true }));
      open2.label = linkLabel;
      this._register(open2.onDidClick(() => this.openerService.open(URI.parse(link2))));
    }
  }
  async persistDomain() {
    if (this.busy || this.lastStatus?.tunnelProvider !== "ngrok" || this.lastStatus?.state === "running" || this.lastStatus?.state === "starting") return;
    if (!this.domainInputDirty) return;
    const domain = this.domainInput.value.trim();
    if (!domain) {
      this.domainInputDirty = false;
      this.domainInput.value = this.lastStatus?.configuredDomain ?? "";
      return;
    }
    if (domain === this.lastStatus?.configuredDomain) {
      this.domainInputDirty = false;
      return;
    }
    const status2 = await this.runCommand(BRIDGE_CONFIGURE, domain);
    if (status2) {
      this.domainInputDirty = false;
      this.domainInput.value = status2.configuredDomain;
    }
  }
  updateNamedTunnelOriginPreview() {
    const port = Number(this.namedTunnelPortInput.value) || this.lastStatus?.namedTunnelLocalPort || 48271;
    this.namedTunnelOriginValue.value = `http://127.0.0.1:${port}`;
    this.namedTunnelOriginValue.title = this.namedTunnelOriginValue.value;
  }
  async saveNamedTunnel() {
    if (this.busy || this.lastStatus?.state === "running" || this.lastStatus?.state === "starting") return;
    const domain = this.namedTunnelDomainInput.value.trim();
    const token = this.namedTunnelTokenInput.value.trim();
    const localPort = Number(this.namedTunnelPortInput.value);
    if (!domain) {
      this.renderLocalError(localizeBridge("opencodeBridge.cloudflareNamedHostnameRequired", "Enter the Cloudflare public hostname."));
      this.namedTunnelDomainInput.focus();
      return;
    }
    if (!Number.isInteger(localPort) || localPort < 1024 || localPort > 65535) {
      this.renderLocalError(localizeBridge("opencodeBridge.cloudflareNamedPortRequired", "Enter a local port from 1024 to 65535."));
      this.namedTunnelPortInput.focus();
      return;
    }
    if (!token && !this.lastStatus?.namedTunnelTokenConfigured) {
      this.renderLocalError(localizeBridge("opencodeBridge.cloudflareTunnelTokenRequired", "Paste the Cloudflare Tunnel Token before saving."));
      this.namedTunnelTokenInput.focus();
      return;
    }
    const status2 = await this.runCommand(BRIDGE_CONFIGURE_NAMED_TUNNEL, {
      domain,
      localPort,
      ...token ? { token } : {}
    });
    if (status2) {
      this.namedTunnelInputDirty = false;
      this.namedTunnelTokenInput.value = "";
    }
  }
  async clearNamedTunnelToken() {
    if (this.busy || !this.lastStatus?.namedTunnelTokenConfigured) return;
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localizeBridge("opencodeBridge.clearTunnelTokenConfirm", "Clear the Cloudflare Tunnel Token?"),
      detail: localizeBridge("opencodeBridge.clearTunnelTokenConfirmDetail", "Cloudflare Named Tunnel cannot start until a new token is saved."),
      primaryButton: localizeBridge("opencodeBridge.clearTunnelToken", "Clear token")
    });
    if (!result.confirmed) return;
    await this.runCommand(BRIDGE_CLEAR_NAMED_TUNNEL_TOKEN);
  }
  async cleanupTunnel() {
    if (this.cleaningTunnel) return;
    this.cleaningTunnel = true;
    this.updateControls();
    try {
      const result = await this.dialogService.confirm({
        type: "warning",
        message: localizeBridge("opencodeBridge.cleanupConfirm", "Clean up leftover tunnel processes?"),
        detail: localizeBridge("opencodeBridge.cleanupDetail", "Terminate only tunnel processes left behind by a crashed previous session. The running Bridge is not stopped; other windows, editors, proxy tools and tunnels are not affected."),
        primaryButton: localizeBridge("opencodeBridge.cleanup", "Clean up processes")
      });
      if (!result.confirmed) return;
      const status2 = await this.commandService.executeCommand(BRIDGE_CLEANUP_PROCESSES);
      if (status2) this.render(status2);
    } catch (error) {
      this.renderLocalError(error instanceof Error ? error.message : String(error));
    } finally {
      this.cleaningTunnel = false;
      this.updateControls();
      void this.refresh();
    }
  }
  async toggleBridge() {
    if (this.busy) return;
    if (this.lastStatus?.state === "running" || this.lastStatus?.state === "starting") {
      await this.runCommand(BRIDGE_STOP);
      return;
    }
    const provider = this.lastStatus?.tunnelProvider ?? "cloudflare";
    const domain = this.domainInput.value.trim();
    if (provider === "ngrok" && !domain) {
      this.connectionCard.open = true;
      this.renderLocalStartupFailure({ code: "ngrok-domain-missing", stage: "precheck", at: Date.now() });
      this.domainInput.focus();
      return;
    }
    if (provider === "cloudflare-named" && (!this.lastStatus?.configuredNamedDomain || !this.lastStatus.namedTunnelTokenConfigured)) {
      this.connectionCard.open = true;
      this.renderLocalStartupFailure({ code: "named-config-missing", stage: "precheck", at: Date.now() });
      (this.lastStatus?.configuredNamedDomain ? this.namedTunnelTokenInput : this.namedTunnelDomainInput).focus();
      return;
    }
    this.localStartupFailure = void 0;
    await this.runCommand(BRIDGE_START, provider === "ngrok" ? domain : void 0);
  }
  async installCloudflared() {
    if (this.busy) return;
    this.installingCloudflared = true;
    this.tunnelState.textContent = isMacintosh ? localizeBridge("opencodeBridge.installingCloudflaredMac", "Installing cloudflared with Homebrew\u2026") : localizeBridge("opencodeBridge.installingCloudflared", "Installing cloudflared with Winget\u2026");
    this.updateControls();
    try {
      await this.runCommand(BRIDGE_INSTALL_CLOUDFLARED);
    } finally {
      this.installingCloudflared = false;
      await this.refresh();
      this.updateControls();
    }
  }
  configuredArenaPrompt() {
    const configured = this.configurationService.getValue(BRIDGE_COPY_PROMPT_SETTING);
    return typeof configured === "string" ? configured.trim() : "";
  }
  /** Keep a custom override unchanged; rotate defaults at copy time, without immediate repeats. */
  resolveArenaPrompt() {
    const configured = this.configuredArenaPrompt();
    if (configured) return configured;
    const count2 = DEFAULT_ARENA_PROMPT_VARIANTS.length;
    const index2 = this.lastDefaultPromptIndex < 0 ? Math.floor(Math.random() * count2) : (this.lastDefaultPromptIndex + 1 + Math.floor(Math.random() * (count2 - 1))) % count2;
    this.lastDefaultPromptIndex = index2;
    return DEFAULT_ARENA_PROMPT_VARIANTS[index2];
  }
  async copyArenaPrompt() {
    const url = this.lastStatus?.publicUrl?.trim();
    const prompt = url ? this.resolveArenaPrompt() : this.configuredArenaPrompt() || DEFAULT_ARENA_PROMPT;
    const text2 = url ? `MCP_URL_BASE64=${encodeMcpAddressForDisplay(url)}

${prompt}` : prompt;
    const httpClientInstructions = "用 Bash 工具手动实现 MCP HTTP 客户端：\n先 initialize 获取 session，再 notifications/initialized 完成握手，\n再 tools/list 确认接口并同步 Bridge 任务卡，\n立即调用 bridge_get_effective_rules 完整读取当前工作区全部已启用规则，\n再 bridge_acknowledge_rules 确认返回的 rules_hash，最后才做工作区只读验证。\n本机规则在连接握手说明中也会全文下发；规则切换后必须重新读取确认。";
    await this.copyText(`${text2}\n\n${httpClientInstructions}`);
  }
  async copyText(text2) {
    if (!text2) return;
    try {
      await this.clipboardService.writeText(text2);
      this.showCopyToast(localizeBridge("opencodeBridge.copySucceeded", "Copied to clipboard"));
    } catch {
      this.showCopyToast(localizeBridge("opencodeBridge.copyFailed", "Copy failed. Try again."), true);
    }
  }
  /** Runs the File menu's New Window command; failures are surfaced instead of ignored. */
  async openNewWindow() {
    try {
      await this.commandService.executeCommand(NEW_WINDOW_COMMAND_ID);
    } catch (error) {
      this.showCopyToast(localizeBridge("opencodeBridge.newWindowFailed", "Could not open a new window: {0}", error instanceof Error ? error.message : String(error)), true);
    }
  }
  /** Runs the File menu's Open Folder command; failures are surfaced instead of ignored. */
  async openWorkspaceFolder() {
    try {
      await this.commandService.executeCommand(OPEN_FOLDER_COMMAND_ID);
    } catch (error) {
      this.showCopyToast(localizeBridge("opencodeBridge.openFolderFailed", "Could not open the folder picker: {0}", error instanceof Error ? error.message : String(error)), true);
    }
  }
  showCopyToast(message, isError = false) {
    if (this.copyToastTimer !== void 0) clearTimeout(this.copyToastTimer);
    this.copyToast.textContent = message;
    this.copyToast.classList.toggle("error", isError);
    this.copyToast.classList.add("visible");
    this.copyToastTimer = setTimeout(() => {
      this.copyToast.classList.remove("visible");
      this.copyToastTimer = void 0;
    }, 1800);
  }
  async resetMcpAddress() {
    if (this.busy || this.lastStatus?.state === "running" || this.lastStatus?.state === "starting") return;
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localizeBridge("opencodeBridge.resetAddressConfirm", "Reset the MCP address?"),
      detail: localizeBridge("opencodeBridge.resetAddressConfirmDetail", "The current MCP address will stop working immediately. Update the address in ChatGPT and every other connected client."),
      primaryButton: localizeBridge("opencodeBridge.resetMcpAddress", "Reset MCP address")
    });
    if (!result.confirmed) return;
    await this.runCommand(BRIDGE_ROTATE_ENDPOINT);
  }
  async runCommand(command4, ...args2) {
    if (this.busy) return void 0;
    this.busy = true;
    this.updateControls();
    try {
      const status2 = await this.commandService.executeCommand(command4, ...args2);
      if (status2) this.render(status2);
      return status2;
    } catch (error) {
      if (command4 === BRIDGE_START || command4 === BRIDGE_CHECK_TUNNEL || command4 === BRIDGE_INSTALL_CLOUDFLARED || command4 === BRIDGE_CONFIGURE || command4 === BRIDGE_CONFIGURE_NAMED_TUNNEL || command4 === BRIDGE_CLEAR_NAMED_TUNNEL_TOKEN || command4 === BRIDGE_SET_TUNNEL_PROVIDER) {
        this.connectionCard.open = true;
      }
      if (command4 === BRIDGE_START) {
        this.renderLocalStartupFailure(error instanceof Error ? error.message : String(error), true);
      } else {
        this.renderLocalError(error instanceof Error ? error.message : String(error));
      }
      return void 0;
    } finally {
      this.busy = false;
      this.updateControls();
      void this.refresh();
    }
  }
  async refresh() {
    if (this.disposed || this.busy || this.statusRefreshInFlight) return;
    this.statusRefreshInFlight = true;
    const requestVersion = ++this.statusRequestVersion;
    try {
      const status2 = await this.commandService.executeCommand(BRIDGE_GET_STATUS);
      if (this.disposed || this.busy || requestVersion !== this.statusRequestVersion) return;
      if (status2) this.render(status2);
    } catch (error) {
      if (this.disposed || this.busy || requestVersion !== this.statusRequestVersion) return;
      this.renderLocalError(error instanceof Error ? error.message : String(error));
    } finally {
      this.statusRefreshInFlight = false;
    }
  }
  /**
   * The failure the K-02 card shows (R2 §8.3–8.4): a page precheck made after the extension's last
   * failure is the newer fact; otherwise the extension's coded startFailure, so a refresh never
   * overwrites it; raw lastError only when no code was sent.
   */
  startupFailureFor(status2) {
    if (status2.state === "running" || status2.state === "starting" && !status2.startFailure) {
      this.localStartupFailure = void 0;
      return void 0;
    }
    const local = this.localStartupFailure;
    if (local?.stage === "precheck" && (local.at ?? 0) >= (status2.startFailure?.at ?? 0)) {
      return local;
    }
    if (status2.startFailure) {
      return describeBridgeStartupFailure(status2.startFailure);
    }
    return status2.state === "error" ? describeBridgeStartupFailure(status2.lastError ?? "") : local;
  }
  render(status2) {
    const previousStatus = this.lastStatus;
    this.lastStatus = status2;
    const isQuick = status2.tunnelProvider === "cloudflare";
    const isNamed = status2.tunnelProvider === "cloudflare-named";
    const isNgrok = status2.tunnelProvider === "ngrok";
    this.cloudflareProviderButton.classList.toggle("selected", isQuick);
    this.providerChoiceCards.get("cloudflare")?.classList.toggle("selected", isQuick);
    this.cloudflareProviderButton.setAttribute("aria-checked", String(isQuick));
    this.cloudflareNamedProviderButton.classList.toggle("selected", isNamed);
    this.providerChoiceCards.get("cloudflare-named")?.classList.toggle("selected", isNamed);
    this.cloudflareNamedProviderButton.setAttribute("aria-checked", String(isNamed));
    this.ngrokProviderButton.classList.toggle("selected", isNgrok);
    this.providerChoiceCards.get("ngrok")?.classList.toggle("selected", isNgrok);
    this.ngrokProviderButton.setAttribute("aria-checked", String(isNgrok));
    if (status2.tunnelInstalled === void 0 && this.autoCheckedTunnelProvider !== status2.tunnelProvider && !this.busy) {
      this.autoCheckedTunnelProvider = status2.tunnelProvider;
      void this.runCommand(BRIDGE_CHECK_TUNNEL);
    }
    this.domainField.style.display = isNgrok ? "" : "none";
    this.namedTunnelConfiguration.style.display = isNamed ? "" : "none";
    if (this.domainInputDirty && this.domainInput.value.trim().toLowerCase() === status2.configuredDomain) {
      this.domainInputDirty = false;
    }
    if (!this.domainInputDirty && this.domainInput.value !== status2.configuredDomain) {
      this.domainInput.value = status2.configuredDomain;
    }
    if (!this.namedTunnelInputDirty) {
      this.namedTunnelDomainInput.value = status2.configuredNamedDomain;
      this.namedTunnelPortInput.value = String(status2.namedTunnelLocalPort);
    }
    this.namedTunnelTokenStatus.textContent = status2.namedTunnelTokenConfigured ? localizeBridge("opencodeBridge.cloudflareTunnelTokenSaved", "Token saved securely. Leave the field blank to keep it.") : localizeBridge("opencodeBridge.cloudflareTunnelTokenMissing", "No token saved.");
    this.updateNamedTunnelOriginPreview();
    this.stateBadge.className = `opencode-bridge-state state-${status2.state}`;
    this.stateBadge.textContent = status2.state === "running" ? localizeBridge("opencodeBridge.running", "Running") : status2.state === "starting" ? localizeBridge("opencodeBridge.starting", "Starting\u2026") : status2.state === "error" ? localizeBridge("opencodeBridge.error", "Error") : localizeBridge("opencodeBridge.stopped", "Stopped");
    let stateDetail = status2.state === "running" ? localizeBridge("opencodeBridge.runningDetailCompact", "Remote endpoint active \xB7 {0} active request(s)", status2.activeRequests) : status2.state === "starting" ? isQuick ? localizeBridge("opencodeBridge.quickTunnelStartingDetail", "Generating a new temporary Cloudflare MCP address\u2026") : isNamed ? localizeBridge("opencodeBridge.namedTunnelStartingDetail", "Connecting the fixed Cloudflare hostname\u2026") : localizeBridge("opencodeBridge.startingDetail", "Opening the secure MCP endpoint\u2026") : status2.state === "error" ? localizeBridge("opencodeBridge.bridgeErrorDetail", "Bridge could not start.") : isQuick ? localizeBridge("opencodeBridge.quickTunnelStoppedDetail", "Start Bridge to generate a temporary Cloudflare MCP address.") : isNamed ? status2.configuredNamedDomain ? localizeBridge("opencodeBridge.namedTunnelStoppedDetail", "Bridge is stopped. The fixed Cloudflare hostname is not connected.") : localizeBridge("opencodeBridge.namedHostnameRequiredSummary", "Configure the Cloudflare hostname and Tunnel Token before starting.") : status2.configuredDomain ? localizeBridge("opencodeBridge.stoppedDetailCompact", "Bridge is stopped. No public endpoint is open.") : localizeBridge("opencodeBridge.domainRequiredSummary", "Enter an ngrok domain in Connection settings before starting.");
    if (isQuick && previousStatus?.publicUrl && previousStatus.publicUrl !== status2.publicUrl && status2.state === "starting") {
      stateDetail = localizeBridge("opencodeBridge.quickTunnelRecoveryDetail", "The previous temporary address expired. Generating and copying a replacement address\u2026");
    }
    const startupFailure = this.startupFailureFor(status2);
    this.statusMessage.render({ message: stateDetail, error: status2.state === "error" || startupFailure?.severity === "error", failure: startupFailure });
    const providerDomainMissing = isNgrok ? !status2.configuredDomain : isNamed ? !status2.configuredNamedDomain : false;
    const connectionNeedsAttention = status2.state === "error" || status2.tunnelInstalled !== true || status2.tunnelConfigValid !== true || providerDomainMissing;
    if (connectionNeedsAttention) {
      this.connectionCard.open = true;
    }
    const connectionState = status2.state === "error" ? "error" : connectionNeedsAttention ? "stopped" : "running";
    this.connectionBadge.className = `opencode-bridge-state state-${connectionState}`;
    if (status2.state === "error") {
      this.connectionBadge.textContent = localizeBridge("opencodeBridge.actionRequired", "Action required");
      this.connectionDetails.textContent = localizeBridge("opencodeBridge.connectionErrorSummary", "Bridge connection needs attention");
    } else if (status2.tunnelInstalled === void 0) {
      this.connectionBadge.textContent = localizeBridge("opencodeBridge.checking", "Checking");
      this.connectionDetails.textContent = localizeBridge("opencodeBridge.connectionChecking", "Checking tunnel settings\u2026");
    } else if (!status2.tunnelInstalled) {
      this.connectionBadge.textContent = localizeBridge("opencodeBridge.setupRequired", "Setup required");
      this.connectionDetails.textContent = isQuick || isNamed ? localizeBridge("opencodeBridge.cloudflareNotInstalledSummary", "cloudflared is not installed") : localizeBridge("opencodeBridge.ngrokNotInstalledSummary", "ngrok is not installed");
    } else if (!status2.tunnelConfigValid) {
      this.connectionBadge.textContent = localizeBridge("opencodeBridge.actionRequired", "Action required");
      this.connectionDetails.textContent = isNamed ? localizeBridge("opencodeBridge.cloudflareNamedConfigAttentionSummary", "Cloudflare Named Tunnel configuration needs attention") : localizeBridge("opencodeBridge.ngrokConfigAttentionSummary", "ngrok configuration needs attention");
    } else if (providerDomainMissing) {
      this.connectionBadge.textContent = localizeBridge("opencodeBridge.setupRequired", "Setup required");
      this.connectionDetails.textContent = isNamed ? localizeBridge("opencodeBridge.namedHostnameMissingSummary", "Cloudflare hostname not set") : localizeBridge("opencodeBridge.domainMissingSummary", "Reserved domain not set");
    } else {
      this.connectionBadge.textContent = localizeBridge("opencodeBridge.ready", "Ready");
      this.connectionDetails.textContent = isQuick ? localizeBridge("opencodeBridge.cloudflareReadySummary", "Cloudflare Quick Tunnel ready \xB7 temporary address changes after restart") : isNamed ? localizeBridge("opencodeBridge.cloudflareNamedReadySummary", "Cloudflare Named Tunnel ready \xB7 {0}", status2.configuredNamedDomain) : localizeBridge("opencodeBridge.connectionReadySummary", "ngrok ready \xB7 {0}", status2.configuredDomain);
    }
    if (status2.tunnelInstalled === void 0) {
      this.tunnelState.textContent = localizeBridge("opencodeBridge.tunnelUnchecked", "The tunnel client has not been checked yet.");
    } else if (!status2.tunnelInstalled) {
      this.tunnelState.textContent = isQuick || isNamed ? localizeBridge("opencodeBridge.cloudflareMissingAction", "cloudflared is not installed. Complete the one-time setup below.") : localizeBridge("opencodeBridge.ngrokMissingAction", "ngrok is not installed. Complete the setup below.");
    } else if (!status2.tunnelConfigValid) {
      this.tunnelState.textContent = isNamed ? localizeBridge("opencodeBridge.cloudflareNamedInvalidAction", "cloudflared is installed, but the hostname, Tunnel Token, or Service URL needs attention.") : localizeBridge("opencodeBridge.ngrokInvalidAction", "ngrok is installed, but its Authtoken or configuration needs attention.");
    } else if (providerDomainMissing) {
      this.tunnelState.textContent = localizeBridge("opencodeBridge.ngrokDomainMissing", "ngrok is ready. Add your reserved domain above.");
    } else {
      const tunnelLabel = status2.tunnelVersion ?? (isQuick || isNamed ? "cloudflared" : "ngrok");
      this.tunnelState.textContent = `${tunnelLabel} \xB7 ${localizeBridge("opencodeBridge.tunnelReady", "ready")}`;
    }
    const needsTunnelSetup = status2.tunnelInstalled === false || status2.tunnelConfigValid === false || providerDomainMissing;
    const visibleSetupProvider = this.revealedSetupProvider ?? status2.tunnelProvider;
    this.tunnelSetupPanel.classList.toggle("needs-attention", needsTunnelSetup);
    this.cloudflareSetupDetails.style.display = visibleSetupProvider === "cloudflare" ? "" : "none";
    this.cloudflareNamedSetupDetails.style.display = visibleSetupProvider === "cloudflare-named" ? "" : "none";
    this.ngrokSetupDetails.style.display = visibleSetupProvider === "ngrok" ? "" : "none";
    this.installCloudflaredButton.element.style.display = isQuick || isNamed ? "" : "none";
    this.cloudflareSetupSummary.textContent = needsTunnelSetup ? localizeBridge("opencodeBridge.configureCloudflare", "Install cloudflared") : localizeBridge("opencodeBridge.cloudflareConfigurationHelp", "cloudflared setup help");
    this.ngrokSetupSummary.textContent = needsTunnelSetup ? localizeBridge("opencodeBridge.configureNgrok", "Configure ngrok") : localizeBridge("opencodeBridge.ngrokConfigurationHelp", "ngrok configuration help");
    this.cloudflareNamedSetupSummary.textContent = needsTunnelSetup ? localizeBridge("opencodeBridge.configureCloudflareNamed", "Configure Cloudflare Named Tunnel") : localizeBridge("opencodeBridge.cloudflareNamedConfigurationHelp", "Cloudflare Named Tunnel setup help");
    const activeSetupDetails = visibleSetupProvider === "cloudflare" ? this.cloudflareSetupDetails : visibleSetupProvider === "cloudflare-named" ? this.cloudflareNamedSetupDetails : this.ngrokSetupDetails;
    const tunnelProviderChanged = this.tunnelSetupProvider !== visibleSetupProvider;
    if (needsTunnelSetup && (this.tunnelNeedsSetup !== true || tunnelProviderChanged)) {
      activeSetupDetails.open = true;
    }
    this.tunnelNeedsSetup = needsTunnelSetup;
    this.tunnelSetupProvider = visibleSetupProvider;
    const activePublicUrl = status2.state === "running" ? status2.publicUrl : void 0;
    this.publicUrlField.render({
      url: activePublicUrl,
      notice: isQuick && activePublicUrl ? localizeBridge("opencodeBridge.quickTunnelAddressCopied", "Temporary MCP address copied. Replace the MCP address in ChatGPT after each Bridge restart.") : void 0
    });
    if (isQuick && activePublicUrl && activePublicUrl !== this.lastCopiedQuickTunnelUrl) {
      this.lastCopiedQuickTunnelUrl = activePublicUrl;
      void this.clipboardService.writeText(activePublicUrl);
    }
    clearNode(this.toolsContainer);
    for (const tool of status2.toolNames) {
      const badge = append(this.toolsContainer, $(".opencode-bridge-tool", void 0, tool));
      if (tool === "report_progress" || tool === "set_todos") {
        badge.classList.add("bridge-only");
        badge.title = tool === "set_todos" ? localizeBridge("opencodeBridge.bridgeOnlyTodos", "Bridge-only durable task-state tool") : localizeBridge("opencodeBridge.bridgeOnly", "Bridge-only progress reporting tool");
      }
    }
    this.updateControls();
  }
  renderPersistentModeToggle(enabled) {
    this.persistentModeToggle.setAttribute("aria-checked", String(enabled));
    this.persistentModeToggle.title = enabled ? localizeBridge("opencodeBridge.persistentModeOn", "Bridge will open and start automatically after restart") : localizeBridge("opencodeBridge.persistentModeOff", "OpenCode will start in Chat mode");
  }
  readWorkspaceScope() {
    return this.configurationService.getValue(BRIDGE_WORKSPACE_SCOPE_SETTING) === "device" ? "device" : "workspace";
  }
  renderWorkspaceScopeButton() {
    const scope = this.readWorkspaceScope();
    this.workspaceScopeButton.label = scope === "workspace" ? localizeBridge("opencodeBridge.workScopeProject", "Project files") : localizeBridge("opencodeBridge.workScopeDevice", "Entire device");
    const title = scope === "workspace" ? localizeBridge("opencodeBridge.workScopeProjectTitle", "Current workspace first; another local path only when explicitly named") : localizeBridge("opencodeBridge.workScopeDeviceTitle", "This PC by default; current workspace remains the priority");
    this.workspaceScopeButton.setTitle(isBridgeSettingProjectOverride(this.configurationService.inspect(BRIDGE_WORKSPACE_SCOPE_SETTING)) ? `${title}
${localizeBridge("opencodeBridge.workScopeProjectOverride", "This project sets its own work scope in its workspace settings; switching here changes only this project.")}` : title);
  }
  async toggleWorkspaceScope() {
    const next = this.readWorkspaceScope() === "workspace" ? "device" : "workspace";
    try {
      await this.configurationService.updateValue(BRIDGE_WORKSPACE_SCOPE_SETTING, next, bridgeSettingWriteTarget(this.configurationService.inspect(BRIDGE_WORKSPACE_SCOPE_SETTING)));
      this.renderWorkspaceScopeButton();
    } catch (error) {
      this.renderLocalError(error instanceof Error ? error.message : String(error));
    }
  }
  readWindowRestore() {
    return this.configurationService.getValue(WINDOW_RESTORE_SETTING) === "all" ? "all" : "last";
  }
  renderWindowRestoreButton() {
    const mode = this.readWindowRestore();
    this.windowRestoreButton.label = mode === "last" ? localizeBridge("opencodeBridge.windowRestoreLast", "Restore last closed window") : localizeBridge("opencodeBridge.windowRestoreAll", "Restore all windows");
    this.windowRestoreButton.setTitle(mode === "last" ? localizeBridge("opencodeBridge.windowRestoreLastTitle", "Only the last closed window reopens on startup (default)") : localizeBridge("opencodeBridge.windowRestoreAllTitle", "Every window from the previous session reopens on startup"));
  }
  renderStartupPinPageToggle(enabled) {
    this.startupPinPageToggle.setAttribute("aria-checked", String(enabled));
    this.startupPinPageToggle.title = enabled ? localizeBridge("opencodeBridge.startupPinPageOn", "Bridge page is pinned on startup and replaces the welcome page") : localizeBridge("opencodeBridge.startupPinPageOff", "Default startup configuration restored");
  }
  async toggleWindowRestore() {
    const next = this.readWindowRestore() === "last" ? "all" : "last";
    try {
      await this.configurationService.updateValue(WINDOW_RESTORE_SETTING, next, 2 /* USER */);
      this.renderWindowRestoreButton();
    } catch (error) {
      this.renderLocalError(error instanceof Error ? error.message : String(error));
    }
  }
  renderSettingsPageFloatToggle(enabled) {
    this.settingsPageFloatToggle.setAttribute("aria-checked", String(enabled));
    this.settingsPageFloatToggle.title = enabled ? localizeBridge("opencodeBridge.settingsPageFloatOn", "Floating card on: Bridge settings float inside the window and can be dragged") : localizeBridge("opencodeBridge.settingsPageFloatOff", "Embedded: Bridge settings render inside the settings page");
  }
  isSettingsPageFloating() {
    return this.configurationService.getValue(BRIDGE_SETTINGS_PAGE_FLOATING_SETTING) === true;
  }
  applySettingsPagePresentation() {
    const modal = this.isSettingsPageFloating();
    this.renderSettingsPageFloatToggle(modal);
    AICustomizationManagementEditorInput.setModalPresentation(modal);
  }
  /** Shows a page-found failure in the K-02 card; `reveal` scrolls it into view after a manual start. */
  renderLocalStartupFailure(input, reveal = false) {
    const failure2 = describeBridgeStartupFailure(input);
    this.localStartupFailure = failure2;
    if (failure2.severity === "error") {
      this.stateBadge.className = "opencode-bridge-state state-error";
      this.stateBadge.textContent = localizeBridge("opencodeBridge.error", "Error");
    }
    this.statusMessage.render({ message: failure2.heading, error: failure2.severity === "error", failure: failure2 });
    if (reveal) this.statusMessage.revealFailure();
  }
  runStartupFailureAction(action, failure2) {
    void Promise.resolve(runBridgeStartupFailureAction(action, failure2, this.startupFailureActions)).catch((error) => this.showCopyToast(error instanceof Error ? error.message : String(error), true));
  }
  /** Opens Connection settings and focuses the field a failure points at. */
  revealConnectionField(field) {
    this.connectionCard.open = true;
    const input = field === "ngrok-domain" ? this.domainInput : field === "named-domain" ? this.namedTunnelDomainInput : field === "named-token" ? this.namedTunnelTokenInput : field === "named-port" ? this.namedTunnelPortInput : void 0;
    (input ?? this.connectionCard).scrollIntoView({ block: "nearest" });
    input?.focus();
  }
  renderLocalError(message) {
    this.stateBadge.className = "opencode-bridge-state state-error";
    this.stateBadge.textContent = localizeBridge("opencodeBridge.error", "Error");
    this.statusMessage.render({ message, error: true });
  }
  updateControls() {
    const running = this.lastStatus?.state === "running";
    const starting = this.lastStatus?.state === "starting";
    const isNgrok = this.lastStatus?.tunnelProvider === "ngrok";
    const isQuick = this.lastStatus?.tunnelProvider === "cloudflare";
    const isNamed = this.lastStatus?.tunnelProvider === "cloudflare-named";
    this.cloudflareProviderButton.disabled = this.busy || running || starting;
    this.cloudflareNamedProviderButton.disabled = this.busy || running || starting;
    this.ngrokProviderButton.disabled = this.busy || running || starting;
    this.domainInput.disabled = this.busy || running || starting || !isNgrok;
    this.namedTunnelDomainInput.disabled = this.busy || running || starting || !isNamed;
    this.namedTunnelTokenInput.disabled = this.busy || running || starting || !isNamed;
    this.namedTunnelPortInput.disabled = this.busy || running || starting || !isNamed;
    this.saveNamedTunnelButton.enabled = !this.busy && !running && !starting && isNamed && Boolean(this.namedTunnelDomainInput.value.trim()) && Number.isInteger(Number(this.namedTunnelPortInput.value));
    this.clearNamedTunnelTokenButton.enabled = !this.busy && !running && !starting && isNamed && this.lastStatus?.namedTunnelTokenConfigured === true;
    this.checkButton.enabled = !this.busy && !starting;
    this.installCloudflaredButton.enabled = !this.busy && !running && !starting && (isQuick || isNamed) && this.lastStatus?.tunnelInstalled !== true;
    this.installCloudflaredButton.label = this.installingCloudflared ? `$(${Codicon.loading.id}) ${localizeBridge("opencodeBridge.installingCloudflaredShort", "Installing\u2026")}` : this.lastStatus?.tunnelInstalled ? `$(${Codicon.check.id}) ${localizeBridge("opencodeBridge.cloudflaredInstalled", "Installed")}` : `$(${Codicon.cloudDownload.id}) ${localizeBridge("opencodeBridge.installCloudflaredNow", "Install cloudflared")}`;
    this.quickInstallCloudflaredShortcutButton.enabled = !this.busy && !running && !starting;
    this.quickInstallCloudflaredShortcutButton.label = this.installingCloudflared ? `$(${Codicon.loading.id}) ${localizeBridge("opencodeBridge.installingCloudflaredShort", "Installing\u2026")}` : this.lastStatus?.tunnelInstalled ? `$(${Codicon.check.id}) ${localizeBridge("opencodeBridge.checkTunnel", "Check tunnel")}` : `$(${Codicon.cloudDownload.id}) ${localizeBridge("opencodeBridge.quickInstallCloudflared", "Install now")}`;
    this.rotateButton.enabled = !this.busy && !running && !starting;
    this.startStopButton.enabled = !this.busy && !this.cleaningTunnel;
    this.cleanupButton.enabled = !this.cleaningTunnel;
    this.persistentModeToggle.disabled = this.busy;
    this.startupPinPageToggle.disabled = this.busy;
    this.quickLinkAddButton.enabled = !this.busy && Boolean(this.quickLinkNameInput.value.trim()) && Boolean(this.quickLinkUrlInput.value.trim());
    this.startStopButton.label = running ? `$(${Codicon.debugStop.id}) ${localizeBridge("opencodeBridge.stop", "Stop Bridge")}` : starting ? `$(${Codicon.stopCircle.id}) ${localizeBridge("opencodeBridge.cancelStart", "Cancel start")}` : `$(${Codicon.play.id}) ${localizeBridge("opencodeBridge.start", "Start Bridge")}`;
    this.startStopButton.setTitle(starting ? localizeBridge("opencodeBridge.cancelStartTitle", "Stop the start attempt and return the Bridge to stopped") : "");
  }
  focus() {
    if (this.lastStatus?.tunnelProvider === "ngrok") this.domainInput.focus();
    else if (this.lastStatus?.tunnelProvider === "cloudflare-named") this.namedTunnelDomainInput.focus();
    else this.cloudflareProviderButton.focus();
  }
  /**
   * The configured shortcuts, or the defaults when the setting has never been
   * written.
   *
   * An unset setting must fall back: returning [] left a fresh install with no
   * shortcut buttons at all, even though DEFAULT_QUICK_LINKS exists. An
   * explicitly empty array is respected, so a user who deletes every shortcut
   * keeps an empty row instead of having the defaults reappear.
   */
  readQuickLinks() {
    return readQuickLinks(this.configurationService);
  }
  isValidQuickLinkUrl(value2) {
    return isValidQuickLinkUrl(value2);
  }
  renderQuickLinkButtons() {
    clearNode(this.quickLinkButtonsContainer);
    this.quickLinkButtons.forEach((button) => button.dispose());
    this.quickLinkButtons = [];
    for (const link2 of this.readQuickLinks()) {
      if (!this.isValidQuickLinkUrl(link2.url)) continue;
      const button = this._register(new Button(this.quickLinkButtonsContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
      button.label = `$(${Codicon.linkExternal.id}) ${link2.name}`;
      button.setTitle(link2.url);
      this._register(button.onDidClick(() => this.commandService.executeCommand("simpleBrowser.show", link2.url)));
      this.quickLinkButtons.push(button);
    }
  }
  renderQuickLinksList() {
    clearNode(this.quickLinkList);
    this.quickLinkRowButtons.forEach((button) => button.dispose());
    this.quickLinkRowButtons = [];
    const links = this.readQuickLinks();
    if (!links.length) {
      this.quickLinkList.classList.add("empty");
      this.quickLinkList.textContent = localizeBridge("opencodeBridge.quickLinksEmpty", "No custom shortcuts yet.");
      return;
    }
    this.quickLinkList.classList.remove("empty");
    for (const link2 of links) {
      const row = append(this.quickLinkList, $(".opencode-bridge-quick-link-row"));
      const text2 = append(row, $(".opencode-bridge-quick-link-text"));
      append(text2, $(".opencode-bridge-quick-link-name-text", void 0, link2.name));
      append(text2, $(".opencode-bridge-quick-link-url-text", void 0, link2.url));
      const actions = append(row, $(".opencode-bridge-quick-link-actions"));
      const openButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
      openButton.label = `$(${Codicon.linkExternal.id}) ${localizeBridge("opencodeBridge.quickLinkOpen", "Open")}`;
      this._register(openButton.onDidClick(() => this.commandService.executeCommand("simpleBrowser.show", link2.url)));
      this.quickLinkRowButtons.push(openButton);
      const deleteButton2 = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
      deleteButton2.label = `$(${Codicon.trash.id}) ${localizeBridge("opencodeBridge.quickLinkDelete", "Delete")}`;
      this._register(deleteButton2.onDidClick(() => this.removeQuickLink(link2)));
      this.quickLinkRowButtons.push(deleteButton2);
    }
  }
  async addQuickLink() {
    const name = this.quickLinkNameInput.value.trim();
    const url = this.quickLinkUrlInput.value.trim();
    if (!name) {
      this.renderQuickLinkMessage(localizeBridge("opencodeBridge.quickLinkNameRequired", "Enter a name for the shortcut."));
      this.quickLinkNameInput.focus();
      return;
    }
    if (!this.isValidQuickLinkUrl(url)) {
      this.renderQuickLinkMessage(localizeBridge("opencodeBridge.quickLinkUrlInvalid", "Enter a valid http:// or https:// address."));
      this.quickLinkUrlInput.focus();
      return;
    }
    const normalizedUrl = url.slice(0, QUICK_LINK_MAX_URL_LENGTH);
    const links = this.readQuickLinks();
    if (links.some((link2) => link2.url.toLowerCase() === normalizedUrl.toLowerCase())) {
      this.renderQuickLinkMessage(localizeBridge("opencodeBridge.quickLinkUrlDuplicate", "This address is already in the list."));
      this.quickLinkUrlInput.focus();
      return;
    }
    const next = [...links, { name: name.slice(0, QUICK_LINK_MAX_NAME_LENGTH), url: normalizedUrl }];
    try {
      await this.configurationService.updateValue(BRIDGE_QUICK_LINKS_SETTING, next, 2 /* USER */);
      this.quickLinkNameInput.value = "";
      this.quickLinkUrlInput.value = "";
      this.renderQuickLinkMessage("");
      this.updateControls();
    } catch (error) {
      this.renderQuickLinkMessage(error instanceof Error ? error.message : String(error));
    }
  }
  async removeQuickLink(link2) {
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localizeBridge("opencodeBridge.quickLinkDeleteConfirm", "Delete the quick open shortcut \u201C{0}\u201D?", link2.name),
      detail: localizeBridge("opencodeBridge.quickLinkDeleteConfirmDetail", "The button is removed from the top of this page."),
      primaryButton: localizeBridge("opencodeBridge.quickLinkDelete", "Delete")
    });
    if (!result.confirmed) return;
    const next = this.readQuickLinks().filter((candidate) => candidate.url !== link2.url || candidate.name !== link2.name);
    try {
      await this.configurationService.updateValue(BRIDGE_QUICK_LINKS_SETTING, next, 2 /* USER */);
    } catch (error) {
      this.renderQuickLinkMessage(error instanceof Error ? error.message : String(error));
    }
  }
  async restoreQuickLinksDefaults() {
    try {
      await this.configurationService.updateValue(BRIDGE_QUICK_LINKS_SETTING, DEFAULT_QUICK_LINKS.map((link2) => ({ ...link2 })), 2 /* USER */);
      this.renderQuickLinkMessage(localizeBridge("opencodeBridge.quickLinkRestored", "Restored the default shortcuts."));
    } catch (error) {
      this.renderQuickLinkMessage(error instanceof Error ? error.message : String(error));
    }
  }
  async saveCopyPromptText() {
    const value2 = this.copyPromptInput.value.trim();
    try {
      await this.configurationService.updateValue(
        BRIDGE_COPY_PROMPT_SETTING,
        value2 || void 0,
        2 /* USER */
      );
      this.copyPromptInput.value = this.configuredArenaPrompt();
      this.renderCopyPromptMessage(value2 ? localizeBridge("opencodeBridge.copyPromptSaved", "Saved. The Copy prompt button will use this text.") : localizeBridge("opencodeBridge.copyPromptCleared", "Cleared. The default text is in use again."));
    } catch (error) {
      this.renderCopyPromptMessage(error instanceof Error ? error.message : String(error));
    }
  }
  async resetCopyPromptText() {
    try {
      await this.configurationService.updateValue(BRIDGE_COPY_PROMPT_SETTING, void 0, 2 /* USER */);
      this.copyPromptInput.value = "";
      this.renderCopyPromptMessage(localizeBridge("opencodeBridge.copyPromptCleared", "Cleared. The default text is in use again."));
    } catch (error) {
      this.renderCopyPromptMessage(error instanceof Error ? error.message : String(error));
    }
  }
  renderCopyPromptMessage(message) {
    this.copyPromptMessage.textContent = message;
    this.copyPromptMessage.classList.toggle("visible", Boolean(message));
  }
  renderQuickLinkMessage(message) {
    this.quickLinkMessage.textContent = message;
    this.quickLinkMessage.classList.toggle("visible", Boolean(message));
  }
  dispose() {
    this.disposed = true;
    if (this.copyToastTimer !== void 0) clearTimeout(this.copyToastTimer);
    super.dispose();
  }
};

OpenCodeBridgeWidget = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IClipboardService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IConfigurationService)
], OpenCodeBridgeWidget);

aiCustomizationManagementSectionRegistry.register({
  id: AICustomizationManagementSection.Bridge,
  label: localizeBridge("opencodeBridge.navigationLabel", "Bridge"),
  icon: Codicon.radioTower,
  description: localizeBridge("opencodeBridge.navigationDescription", "Expose OpenCode tools as a remote Streamable HTTP MCP endpoint."),
  supportsHarness: () => true,
  create: (instantiationService, container2) => instantiationService.createInstance(OpenCodeBridgeWidget, container2)
});
export { BRIDGE_GET_STATUS, BRIDGE_CONFIGURE, BRIDGE_CONFIGURE_NAMED_TUNNEL, BRIDGE_CLEAR_NAMED_TUNNEL_TOKEN, BRIDGE_SET_TUNNEL_PROVIDER, BRIDGE_START, BRIDGE_STOP, BRIDGE_CLEANUP_PROCESSES, BRIDGE_CHECK_TUNNEL, BRIDGE_INSTALL_CLOUDFLARED, BRIDGE_ROTATE_ENDPOINT, BRIDGE_OPEN_SESSION, BRIDGE_PERSISTENT_MODE, NGROK_VIDEO_TUTORIAL_URL, DEFAULT_ARENA_PROMPT, BRIDGE_COPY_PROMPT_SETTING, DEFAULT_ARENA_PROMPT_VARIANTS, BRIDGE_WORKSPACE_SCOPE_SETTING, WINDOW_RESTORE_SETTING, BRIDGE_STARTUP_PIN_PAGE_SETTING, BRIDGE_SETTINGS_PAGE_FLOATING_SETTING, OpenCodeBridgeWidget };
