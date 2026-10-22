// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptUrlHandler.ts
import { Disposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { mainWindow } from "./module-0002.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { VSBuffer, streamToBuffer } from "./module-0038.mjs";
import { askForPromptSourceFolder } from "./module-2133.mjs";
import { askForPromptFileName } from "./module-2132.mjs";
import { getCleanPromptName } from "./module-0997.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IURLService } from "./module-1285.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IRequestService } from "./module-0947.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IHostService } from "./module-1118.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptUrlHandler.ts
var PromptUrlHandler = class extends Disposable {
  constructor(urlService, notificationService, requestService, instantiationService, fileService, openerService, logService, dialogService, hostService) {
    super();
    this.notificationService = notificationService;
    this.requestService = requestService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this._register(urlService.registerHandler(this));
  }
  static {
    this.ID = "workbench.contrib.promptUrlHandler";
  }
  async handleURL(uri4) {
    let promptType;
    switch (uri4.path) {
      case "chat-prompt/install":
        promptType = "prompt" /* prompt */;
        break;
      case "chat-instructions/install":
        promptType = "instructions" /* instructions */;
        break;
      case "chat-mode/install":
      case "chat-agent/install":
        promptType = "agent" /* agent */;
        break;
      default:
        return false;
    }
    try {
      const query = decodeURIComponent(uri4.query);
      if (!query || !query.startsWith("url=")) {
        return true;
      }
      const urlString = query.substring(4);
      const url = URI.parse(urlString);
      if (url.scheme !== Schemas.https && url.scheme !== Schemas.http) {
        this.logService.error(`[PromptUrlHandler] Invalid URL: ${urlString}`);
        return true;
      }
      await this.hostService.focus(mainWindow);
      if (await this.shouldBlockInstall(promptType, url)) {
        return true;
      }
      const result = await this.requestService.request({ type: "GET", url: urlString, callSite: "promptUrlHandler.resolveUrl" }, CancellationToken.None);
      if (result.res.statusCode !== 200) {
        this.logService.error(`[PromptUrlHandler] Failed to fetch URL: ${urlString}`);
        this.notificationService.error(localize(11553, null, urlString));
        return true;
      }
      const responseData = (await streamToBuffer(result.stream)).toString();
      const newFolder = await this.instantiationService.invokeFunction(askForPromptSourceFolder, promptType);
      if (!newFolder) {
        return true;
      }
      const newName = await this.instantiationService.invokeFunction(askForPromptFileName, promptType, newFolder.uri, getCleanPromptName(url));
      if (!newName) {
        return true;
      }
      const promptUri = URI.joinPath(newFolder.uri, newName);
      await this.fileService.createFolder(newFolder.uri);
      await this.fileService.createFile(promptUri, VSBuffer.fromString(responseData));
      await this.openerService.open(promptUri);
      return true;
    } catch (error) {
      this.logService.error(`Error handling prompt URL ${uri4.toString()}`, error);
      return true;
    }
  }
  async shouldBlockInstall(promptType, url) {
    let uriLabel = url.toString();
    if (uriLabel.length > 50) {
      uriLabel = `${uriLabel.substring(0, 35)}...${uriLabel.substring(uriLabel.length - 15)}`;
    }
    const detail2 = new MarkdownString("", { supportHtml: true });
    detail2.appendMarkdown(localize(11551, null, `[${uriLabel}](${url.toString()})`));
    detail2.appendMarkdown(localize(11552, null));
    let message;
    switch (promptType) {
      case "prompt" /* prompt */:
        message = localize(11550, null);
        break;
      case "instructions" /* instructions */:
        message = localize(11549, null);
        break;
      default:
        message = localize(11548, null);
        break;
    }
    const { confirmed } = await this.dialogService.confirm({
      type: "warning",
      primaryButton: localize(11555, null),
      cancelButton: localize(11554, null),
      message,
      custom: {
        markdownDetails: [{
          markdown: detail2
        }]
      }
    });
    return !confirmed;
  }
};

PromptUrlHandler = __decorateClass([
  __decorateParam(0, IURLService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IHostService)
], PromptUrlHandler);
export { PromptUrlHandler };
