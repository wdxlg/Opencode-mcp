// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/builtInTools/fetchPageTool.ts
import { InternalFetchWebPageToolId } from "./module-2519.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { localize } from "./module-0001.mjs";
import { detectEncodingFromBuffer } from "./module-1123.mjs";
import { URI } from "./module-0032.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { WorkingDirectory } from "./module-2633.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Iterable } from "./module-0011.mjs";
import { normalizePath } from "./module-0034.mjs";
import { assertNever } from "./module-0009.mjs";
import { extname } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWebContentExtractorService } from "./module-2044.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITrustedDomainService } from "./module-1289.mjs";
import { IChatService } from "./module-0972.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentNetworkFilterService } from "./module-1241.mjs";


// src/vs/workbench/contrib/chat/electron-browser/builtInTools/fetchPageTool.ts
var FetchWebPageToolData = {
  id: InternalFetchWebPageToolId,
  displayName: "Fetch Web Page",
  canBeReferencedInPrompt: false,
  modelDescription: "Fetches the main content from a web page. This tool is useful for summarizing or analyzing the content of a webpage.",
  source: ToolDataSource.Internal,
  canRequestPostApproval: true,
  canRequestPreApproval: true,
  inputSchema: {
    type: "object",
    properties: {
      urls: {
        type: "array",
        items: {
          type: "string"
        },
        description: localize(13596, null)
      }
    },
    required: ["urls"]
  }
};

var FetchWebPageTool = class {
  constructor(_readerModeService, _fileService, _trustedDomainService, _chatService, _workspaceContextService, _agentNetworkFilterService) {
    this._readerModeService = _readerModeService;
    this._fileService = _fileService;
    this._trustedDomainService = _trustedDomainService;
    this._chatService = _chatService;
    this._workspaceContextService = _workspaceContextService;
    this._agentNetworkFilterService = _agentNetworkFilterService;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const urls = invocation.parameters.urls || [];
    const { webUris, fileUris, invalidUris, blockedUris } = this._parseUris(urls);
    const allValidUris = [...webUris.values(), ...fileUris.values()];
    if (!allValidUris.length && invalidUris.size === 0 && blockedUris.size === 0) {
      return {
        content: [{ kind: "text", value: localize(13589, null) }]
      };
    }
    let webContents = [];
    if (webUris.size > 0) {
      const trustedDomains = this._trustedDomainService.trustedDomains;
      webContents = await this._readerModeService.extract([...webUris.values()], { trustedDomains });
    }
    const fileContents = [];
    const successfulFileUris = [];
    for (const uri5 of fileUris.values()) {
      try {
        const fileContent = await this._fileService.readFile(uri5, void 0, token);
        const imageMimeType = this._getSupportedImageMimeType(uri5);
        if (imageMimeType) {
          fileContents.push({
            type: "tooldata",
            value: {
              kind: "data",
              value: {
                mimeType: imageMimeType,
                data: fileContent.value
              }
            }
          });
        } else {
          const detected = detectEncodingFromBuffer({ buffer: fileContent.value, bytesRead: fileContent.value.byteLength });
          if (detected.seemsBinary) {
            fileContents.push(localize(13580, null));
          } else {
            fileContents.push(fileContent.value.toString());
          }
        }
        successfulFileUris.push(uri5);
      } catch (error) {
        fileContents.push(void 0);
      }
    }
    const results = [];
    let webIndex = 0;
    let fileIndex = 0;
    for (const url of urls) {
      if (blockedUris.has(url)) {
        results.push(this._agentNetworkFilterService.formatError(URI.parse(url)));
      } else if (invalidUris.has(url)) {
        results.push(void 0);
      } else if (webUris.has(url)) {
        results.push({ type: "extracted", value: webContents[webIndex] });
        webIndex++;
      } else if (fileUris.has(url)) {
        results.push(fileContents[fileIndex]);
        fileIndex++;
      } else {
        results.push(void 0);
      }
    }
    let confirmResults;
    if (webContents.every((e) => e.status === "error" || e.status === "redirect")) {
      confirmResults = false;
    }
    const actuallyValidUris = [...webUris.values(), ...successfulFileUris];
    return {
      content: this._getPromptPartsForResults(urls, results),
      toolResultDetails: actuallyValidUris,
      confirmResults
    };
  }
  async prepareToolInvocation(context2, token) {
    const { webUris, fileUris, invalidUris, blockedUris } = this._parseUris(context2.parameters.urls);
    const validFileUris = [];
    const additionalInvalidUrls = [];
    for (const [originalUrl, uri5] of fileUris.entries()) {
      try {
        await this._fileService.stat(uri5);
        validFileUris.push(uri5);
      } catch (error) {
        additionalInvalidUrls.push(originalUrl);
      }
    }
    const invalid = [...Array.from(invalidUris), ...additionalInvalidUrls, ...Array.from(blockedUris)];
    const allFetchedUris = new ResourceSet([...webUris.values(), ...validFileUris]);
    const workingDir = new WorkingDirectory(this._workspaceContextService, context2.workingDirectory);
    const fileUrisOutsideWorkspace = validFileUris.filter((uri5) => !workingDir.getFolder(uri5));
    const urlsNeedingConfirmation = new ResourceSet([...webUris.values(), ...fileUrisOutsideWorkspace]);
    const pastTenseMessage = invalid.length ? invalid.length > 1 ? new MarkdownString(
      localize(
        13590,
        null,
        allFetchedUris.size,
        invalid.map((url) => `- ${url}`).join("\n")
      )
    ) : new MarkdownString(
      localize(
        13591,
        null,
        invalid[0]
      )
    ) : new MarkdownString();
    const invocationMessage = new MarkdownString();
    if (allFetchedUris.size > 1) {
      pastTenseMessage.appendMarkdown(localize(13592, null, allFetchedUris.size));
      invocationMessage.appendMarkdown(localize(13586, null, allFetchedUris.size));
    } else if (allFetchedUris.size === 1) {
      const url = Iterable.first(allFetchedUris).toString(true);
      if (url.length > 400 || validFileUris.length === 1) {
        pastTenseMessage.appendMarkdown(localize(13594, null, url));
        invocationMessage.appendMarkdown(localize(13588, null, url));
      } else {
        pastTenseMessage.appendMarkdown(localize(13593, null, url));
        invocationMessage.appendMarkdown(localize(13587, null, url));
      }
    }
    let confirmationNotNeededReason;
    if (context2.chatSessionResource) {
      const model = this._chatService.getSession(context2.chatSessionResource);
      const userMessages = model?.getRequests().map((r2) => r2.message.text) ?? [];
      const referencedResources = collectReferencedResources(userMessages);
      let urlsMentionedInPrompt = false;
      for (const uri5 of urlsNeedingConfirmation) {
        if (referencedResources.has(uri5)) {
          urlsNeedingConfirmation.delete(uri5);
          urlsMentionedInPrompt = true;
        }
      }
      if (urlsMentionedInPrompt && urlsNeedingConfirmation.size === 0) {
        confirmationNotNeededReason = localize(13595, null);
      }
    }
    const result = { invocationMessage, pastTenseMessage };
    const allDomainsTrusted = Iterable.every(urlsNeedingConfirmation, (u) => this._trustedDomainService.isValid(u));
    let confirmationTitle;
    let confirmationMessage;
    if (urlsNeedingConfirmation.size && !allDomainsTrusted) {
      if (urlsNeedingConfirmation.size === 1) {
        confirmationTitle = localize(13583, null);
        confirmationMessage = new MarkdownString(
          Iterable.first(urlsNeedingConfirmation).toString(true),
          { supportThemeIcons: true }
        );
      } else {
        confirmationTitle = localize(13582, null);
        confirmationMessage = new MarkdownString(
          [...urlsNeedingConfirmation].map((uri5) => `- ${uri5.toString(true)}`).join("\n"),
          { supportThemeIcons: true }
        );
      }
    }
    result.confirmationMessages = {
      title: confirmationTitle,
      message: confirmationMessage,
      confirmResults: urlsNeedingConfirmation.size > 0,
      allowAutoConfirm: true,
      disclaimer: new MarkdownString("$(info) " + localize(13581, null), { supportThemeIcons: true }),
      confirmationNotNeededReason
    };
    return result;
  }
  _parseUris(urls) {
    const webUris = /* @__PURE__ */ new Map();
    const fileUris = /* @__PURE__ */ new Map();
    const invalidUris = /* @__PURE__ */ new Set();
    const blockedUris = /* @__PURE__ */ new Set();
    urls?.forEach((url) => {
      try {
        const uriObj = URI.parse(url);
        if (uriObj.scheme === "http" || uriObj.scheme === "https") {
          if (!this._agentNetworkFilterService.isUriAllowed(uriObj)) {
            blockedUris.add(url);
          } else {
            webUris.set(url, uriObj);
          }
        } else {
          fileUris.set(url, normalizePath(uriObj));
        }
      } catch (e) {
        invalidUris.add(url);
      }
    });
    return { webUris, fileUris, invalidUris, blockedUris };
  }
  _getPromptPartsForResults(urls, results) {
    return results.map((value2, i2) => {
      const title = results.length > 1 ? localize(13584, null, urls[i2]) : void 0;
      if (!value2) {
        return {
          kind: "text",
          title,
          value: localize(13585, null)
        };
      } else if (typeof value2 === "string") {
        return {
          kind: "text",
          title,
          value: value2
        };
      } else if (value2.type === "tooldata") {
        return { ...value2.value, title };
      } else if (value2.type === "extracted") {
        switch (value2.value.status) {
          case "ok":
            return { kind: "text", title, value: value2.value.result };
          case "redirect":
            return { kind: "text", title, value: `The webpage has redirected to "${value2.value.toURI.toString(true)}". Use the ${InternalFetchWebPageToolId} again to get its contents.` };
          case "error":
            return { kind: "text", title, value: `An error occurred retrieving the fetch result: ${value2.value.error}` };
          default:
            assertNever(value2.value);
        }
      } else {
        throw new Error("unreachable");
      }
    });
  }
  _getSupportedImageMimeType(uri5) {
    const ext = extname(uri5.path).toLowerCase();
    switch (ext) {
      case ".png":
        return "image/png" /* PNG */;
      case ".jpg":
      case ".jpeg":
        return "image/jpeg" /* JPEG */;
      case ".gif":
        return "image/gif" /* GIF */;
      case ".webp":
        return "image/webp" /* WEBP */;
      case ".bmp":
        return "image/bmp" /* BMP */;
      default:
        return void 0;
    }
  }
};

FetchWebPageTool = __decorateClass([
  __decorateParam(0, IWebContentExtractorService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ITrustedDomainService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IAgentNetworkFilterService)
], FetchWebPageTool);

var _schemePrefix = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

function collectReferencedResources(messages) {
  const resources = new ResourceSet();
  for (const message of messages) {
    for (const rawToken of message.split(/\s+/)) {
      const token = rawToken.replace(/^[<("'`[{]+/, "").replace(/[>)"'`\]},.;]+$/, "");
      if (!_schemePrefix.test(token)) {
        continue;
      }
      try {
        resources.add(URI.parse(token, true));
      } catch {
      }
    }
  }
  return resources;
}
export { collectReferencedResources, FetchWebPageToolData, FetchWebPageTool, _schemePrefix };
