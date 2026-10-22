// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatPullRequestContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatPullRequestContentPart.ts
var ChatPullRequestContentPart = class extends Disposable {
  constructor(pullRequestContent, commandService) {
    super();
    this.pullRequestContent = pullRequestContent;
    this.commandService = commandService;
    this.domNode = $(".chat-pull-request-content-part");
    const container3 = append(this.domNode, $(".container"));
    const contentContainer = append(container3, $(".content-container"));
    const titleContainer = append(contentContainer, $(".title-container"));
    const icon2 = append(titleContainer, $(".icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.gitPullRequest));
    const titleLink = append(titleContainer, $("a.title"));
    titleLink.textContent = `${this.pullRequestContent.title} - ${this.pullRequestContent.author}`;
    if (this.pullRequestContent.uri) {
      titleLink.href = this.pullRequestContent.uri?.toString();
    }
    this._register(addDisposableListener(titleLink, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.commandService.executeCommand(this.pullRequestContent.command.id, ...this.pullRequestContent.command.arguments ?? []);
    }));
  }
  hasSameContent(other, followingContent, element) {
    return other.kind === "pullRequest";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatPullRequestContentPart = __decorateClass([
  __decorateParam(1, ICommandService)
], ChatPullRequestContentPart);
export { ChatPullRequestContentPart };
