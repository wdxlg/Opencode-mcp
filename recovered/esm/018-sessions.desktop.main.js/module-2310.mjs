// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpToolCallUI.ts
import { hasKey } from "./module-0010.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { findMcpServer, startServerAndWaitForLiveTools, translateMcpLogMessage } from "./module-2174.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { McpServer } from "./module-2309.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpSamplingService, IMcpService } from "./module-1206.mjs";
import { IAgentHostService } from "./module-1108.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { isMobile, isWeb, locale } from "./module-0014.mjs";
import { Gesture } from "./module-0251.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpToolCallUI.ts
function readResourceContentToHtml(contents) {
  if (!contents || contents.length === 0) {
    throw new Error("UI resource not found on server");
  }
  const content = contents[0];
  let html3;
  const mimeType = content.mimeType || "text/html";
  if (hasKey(content, { text: true })) {
    html3 = content.text;
  } else if (hasKey(content, { blob: true })) {
    html3 = decodeBase64(content.blob).toString();
  } else {
    throw new Error("UI resource has no content");
  }
  const meta = content._meta?.ui;
  return {
    ...meta,
    html: html3,
    mimeType
  };
}

var LocalMcpAppCallTransport = class extends Disposable {
  constructor(_uiData, _mcpService, _samplingService) {
    super();
    this._uiData = _uiData;
    this._mcpService = _mcpService;
    this._samplingService = _samplingService;
    this._onNotification = this._register(new Emitter());
    this.onNotification = this._onNotification.event;
  }
  async _getServer(token) {
    return findMcpServer(
      this._mcpService,
      (s) => s.definition.id === this._uiData.serverDefinitionId && s.collection.id === this._uiData.collectionId,
      token
    );
  }
  async log(params) {
    const server = await this._getServer(CancellationToken.None);
    if (server) {
      translateMcpLogMessage(server.logger, params, `[App UI]`);
    }
  }
  async loadResource(token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found for UI resource");
    }
    const resourceResult = await McpServer.callOn(server, (h3) => h3.readResource({ uri: this._uiData.resourceUri }, token), token);
    return readResourceContentToHtml(resourceResult.contents);
  }
  async callTool(name, params, token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found for tool call");
    }
    await startServerAndWaitForLiveTools(server, void 0, token);
    const tool = server.tools.get().find((t2) => t2.definition.name === name);
    if (!tool || !(tool.visibility & 2 /* App */)) {
      throw new Error(`Tool not found on server: ${name}`);
    }
    const res = await tool.call(params, void 0, token);
    return {
      content: res.content,
      isError: res.isError,
      _meta: res._meta,
      structuredContent: res.structuredContent
    };
  }
  async readResource(uri4, token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found");
    }
    return await McpServer.callOn(server, (h3) => h3.readResource({ uri: uri4 }, token), token);
  }
  async sampling(params, token) {
    const server = await this._getServer(token);
    if (!server) {
      throw new Error("MCP server not found for sampling");
    }
    const { sample } = await this._samplingService.sample({
      server,
      isDuringToolCall: true,
      params
    }, token);
    return sample;
  }
};

LocalMcpAppCallTransport = __decorateClass([
  __decorateParam(1, IMcpService),
  __decorateParam(2, IMcpSamplingService)
], LocalMcpAppCallTransport);

var AhpMcpAppCallTransport = class extends Disposable {
  constructor(_uiData, _channel, _agentHostService) {
    super();
    this._uiData = _uiData;
    this._channel = _channel;
    this._agentHostService = _agentHostService;
    this._onNotification = this._register(new Emitter());
    this.onNotification = this._onNotification.event;
    this._register(this._agentHostService.onMcpNotification((n2) => {
      if (n2.channel === this._channel) {
        this._onNotification.fire({ method: n2.method, params: n2.params });
      }
    }));
  }
  async log(params) {
    try {
      await this._agentHostService.handleMcpRequest(this._channel, "notifications/message", params);
    } catch {
    }
  }
  async loadResource(_token) {
    const result = await this._agentHostService.handleMcpRequest(this._channel, "resources/read", { uri: this._uiData.resourceUri });
    return readResourceContentToHtml(result.contents);
  }
  async callTool(name, params, _token) {
    const result = await this._agentHostService.handleMcpRequest(this._channel, "tools/call", { name, arguments: params });
    return result;
  }
  async readResource(uri4, _token) {
    const result = await this._agentHostService.handleMcpRequest(this._channel, "resources/read", { uri: uri4 });
    return result;
  }
  async sampling(params, _token) {
    const result = await this._agentHostService.handleMcpRequest(this._channel, "sampling/createMessage", params);
    return result;
  }
};

AhpMcpAppCallTransport = __decorateClass([
  __decorateParam(2, IAgentHostService)
], AhpMcpAppCallTransport);

var McpToolCallUI = class extends Disposable {
  constructor(_uiData, instantiationService, themeService) {
    super();
    this._uiData = _uiData;
    this._transport = this._register(
      _uiData.kind === "agentHost" ? instantiationService.createInstance(AhpMcpAppCallTransport, _uiData, _uiData.channel) : instantiationService.createInstance(LocalMcpAppCallTransport, _uiData)
    );
    this.onNotification = this._transport.onNotification;
    const colorTheme = observableFromEvent(
      themeService.onDidColorThemeChange,
      () => {
        const type = themeService.getColorTheme().type;
        return type === "dark" /* DARK */ || type === "hcDark" /* HIGH_CONTRAST_DARK */ ? "dark" : "light";
      }
    );
    this.hostContext = derived((reader) => {
      return {
        theme: colorTheme.read(reader),
        styles: {
          variables: {
            "--color-background-primary": "var(--vscode-editor-background)",
            "--color-background-secondary": "var(--vscode-sideBar-background)",
            "--color-background-tertiary": "var(--vscode-activityBar-background)",
            "--color-background-inverse": "var(--vscode-editor-foreground)",
            "--color-background-ghost": "transparent",
            "--color-background-info": "var(--vscode-inputValidation-infoBackground)",
            "--color-background-danger": "var(--vscode-inputValidation-errorBackground)",
            "--color-background-success": "var(--vscode-diffEditor-insertedTextBackground)",
            "--color-background-warning": "var(--vscode-inputValidation-warningBackground)",
            "--color-background-disabled": "var(--vscode-editor-inactiveSelectionBackground)",
            "--color-text-primary": "var(--vscode-foreground)",
            "--color-text-secondary": "var(--vscode-descriptionForeground)",
            "--color-text-tertiary": "var(--vscode-disabledForeground)",
            "--color-text-inverse": "var(--vscode-editor-background)",
            "--color-text-info": "var(--vscode-textLink-foreground)",
            "--color-text-danger": "var(--vscode-errorForeground)",
            "--color-text-success": "var(--vscode-testing-iconPassed)",
            "--color-text-warning": "var(--vscode-editorWarning-foreground)",
            "--color-text-disabled": "var(--vscode-disabledForeground)",
            "--color-text-ghost": "var(--vscode-descriptionForeground)",
            "--color-border-primary": "var(--vscode-widget-border)",
            "--color-border-secondary": "var(--vscode-editorWidget-border)",
            "--color-border-tertiary": "var(--vscode-panel-border)",
            "--color-border-inverse": "var(--vscode-foreground)",
            "--color-border-ghost": "transparent",
            "--color-border-info": "var(--vscode-inputValidation-infoBorder)",
            "--color-border-danger": "var(--vscode-inputValidation-errorBorder)",
            "--color-border-success": "var(--vscode-testing-iconPassed)",
            "--color-border-warning": "var(--vscode-inputValidation-warningBorder)",
            "--color-border-disabled": "var(--vscode-disabledForeground)",
            "--color-ring-primary": "var(--vscode-focusBorder)",
            "--color-ring-secondary": "var(--vscode-focusBorder)",
            "--color-ring-inverse": "var(--vscode-focusBorder)",
            "--color-ring-info": "var(--vscode-inputValidation-infoBorder)",
            "--color-ring-danger": "var(--vscode-inputValidation-errorBorder)",
            "--color-ring-success": "var(--vscode-testing-iconPassed)",
            "--color-ring-warning": "var(--vscode-inputValidation-warningBorder)",
            "--font-sans": "var(--vscode-font-family)",
            "--font-mono": "var(--vscode-editor-font-family)",
            "--font-weight-normal": "normal",
            "--font-weight-medium": "500",
            "--font-weight-semibold": "600",
            "--font-weight-bold": "bold",
            "--font-text-xs-size": "10px",
            "--font-text-sm-size": "11px",
            "--font-text-md-size": "13px",
            "--font-text-lg-size": "14px",
            "--font-heading-xs-size": "16px",
            "--font-heading-sm-size": "18px",
            "--font-heading-md-size": "20px",
            "--font-heading-lg-size": "24px",
            "--font-heading-xl-size": "32px",
            "--font-heading-2xl-size": "40px",
            "--font-heading-3xl-size": "48px",
            "--border-radius-xs": "2px",
            "--border-radius-sm": "3px",
            "--border-radius-md": "4px",
            "--border-radius-lg": "6px",
            "--border-radius-xl": "8px",
            "--border-radius-full": "9999px",
            "--border-width-regular": "1px",
            "--font-text-xs-line-height": "1.5",
            "--font-text-sm-line-height": "1.5",
            "--font-text-md-line-height": "1.5",
            "--font-text-lg-line-height": "1.5",
            "--font-heading-xs-line-height": "1.25",
            "--font-heading-sm-line-height": "1.25",
            "--font-heading-md-line-height": "1.25",
            "--font-heading-lg-line-height": "1.25",
            "--font-heading-xl-line-height": "1.25",
            "--font-heading-2xl-line-height": "1.25",
            "--font-heading-3xl-line-height": "1.25",
            "--shadow-hairline": "0 0 0 1px var(--vscode-widget-shadow)",
            "--shadow-sm": "0 1px 2px 0 var(--vscode-widget-shadow)",
            "--shadow-md": "0 4px 6px -1px var(--vscode-widget-shadow)",
            "--shadow-lg": "0 10px 15px -3px var(--vscode-widget-shadow)"
          }
        },
        displayMode: "inline",
        availableDisplayModes: ["inline"],
        locale,
        platform: isWeb ? "web" : isMobile ? "mobile" : "desktop",
        deviceCapabilities: {
          touch: Gesture.isTouchDevice(),
          hover: Gesture.isHoverDevice()
        }
      };
    });
  }
  /**
   * Gets the underlying UI data.
   */
  get uiData() {
    return this._uiData;
  }
  /**
   * Logs a message to the MCP server's logger.
   */
  log(log4) {
    return this._transport.log(log4);
  }
  /**
   * Loads the UI resource from the MCP server.
   * @param token Cancellation token
   * @returns The HTML content and CSP configuration
   */
  loadResource(token) {
    return this._transport.loadResource(token);
  }
  /**
   * Calls a tool on the MCP server.
   * @param name Tool name
   * @param params Tool parameters
   * @param token Cancellation token
   * @returns The tool call result
   */
  callTool(name, params, token) {
    return this._transport.callTool(name, params, token);
  }
  /**
   * Reads a resource from the MCP server.
   * @param uri Resource URI
   * @param token Cancellation token
   * @returns The resource content
   */
  readResource(uri4, token) {
    return this._transport.readResource(uri4, token);
  }
  /**
   * Issues a `sampling/createMessage` request against the MCP server's
   * host-side sampling implementation. Only supported when the App
   * server runs inside an agent host that has opted into sampling.
   */
  sampling(params, token) {
    return this._transport.sampling(params, token);
  }
};

McpToolCallUI = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService)
], McpToolCallUI);
export { readResourceContentToHtml, LocalMcpAppCallTransport, AhpMcpAppCallTransport, McpToolCallUI };
