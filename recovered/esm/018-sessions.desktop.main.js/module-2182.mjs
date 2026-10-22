// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAgentMergeContentPart.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { parseAgentMergePrompt } from "./module-2181.mjs";
import { Disposable } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHoverService } from "./module-0520.mjs";
import { posix } from "./module-0026.mjs";
import { shorten } from "./module-0711.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAgentMergeContentPart.ts
var transparentButtonStyles = {
  buttonBackground: void 0,
  buttonBorder: void 0,
  buttonForeground: void 0,
  buttonHoverBackground: void 0,
  buttonSecondaryBackground: void 0,
  buttonSecondaryBorder: void 0,
  buttonSecondaryForeground: void 0,
  buttonSecondaryHoverBackground: void 0,
  buttonSeparator: void 0
};

var agentMergeTitle = localize(11882, null);

function describeBadges(summary, commentCount) {
  const badges = [];
  if (commentCount > 0) {
    badges.push({
      icon: Codicon.commentCompact,
      label: commentCount === 1 ? localize(11879, null) : localize(11875, null, commentCount)
    });
  }
  if (summary.failedChecks.length > 0) {
    badges.push({
      icon: Codicon.errorCompact,
      label: summary.failedChecks.length === 1 ? localize(11878, null) : localize(11873, null, summary.failedChecks.length)
    });
  }
  if (badges.length === 0) {
    badges.push({
      icon: summary.conflicting ? Codicon.warningCompact : Codicon.arrowDown,
      label: summary.conflicting ? localize(11877, null) : summary.behind ? localize(11872, null) : localize(11883, null)
    });
  }
  return badges;
}

function getAgentMergeSummaryLabel(summary) {
  const badges = describeBadges(summary, collectComments(summary).length);
  return [agentMergeTitle, ...badges.map((badge) => badge.label)].join(", ");
}

function getAgentMergeRequestLabel(element) {
  if (element.systemInitiatedLabel !== void 0) {
    return void 0;
  }
  const summary = parseAgentMergePrompt(element.messageText);
  return summary && getAgentMergeSummaryLabel(summary);
}

var ChatAgentMergeContentPart = class extends Disposable {
  constructor(_summary, _sessionResource, _markdownRenderer, _openerService, _hoverService, _commandService) {
    super();
    this._summary = _summary;
    this._sessionResource = _sessionResource;
    this._markdownRenderer = _markdownRenderer;
    this._openerService = _openerService;
    this._hoverService = _hoverService;
    this._commandService = _commandService;
    this._comments = collectComments(_summary);
    this._fileLabels = describeAgentMergeFileLabels(this._comments);
    this.domNode = $(".chat-agent-merge");
    this._createHeader(this.domNode);
    const body = append(this.domNode, $(".chat-agent-merge-body"));
    this._createPullRequestRow(body);
    this._createCommentsSection(body);
    this._createChecksSection(body);
    this._createAgentMessageSection(body);
  }
  _createHeader(parent) {
    const button = this._register(new Button(parent, { ...transparentButtonStyles, title: false }));
    button.element.classList.add("chat-agent-merge-header");
    const twistie = append(button.element, $("span.chat-agent-merge-twistie"));
    twistie.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRightCompact));
    const icon2 = append(button.element, $("span.chat-agent-merge-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.gitMerge));
    append(button.element, $("span.chat-agent-merge-title", void 0, agentMergeTitle));
    const badges = append(button.element, $("span.chat-agent-merge-badges"));
    for (const badge of describeBadges(this._summary, this._comments.length)) {
      const badgeElement = append(badges, $("span.chat-agent-merge-badge"));
      const badgeIcon = append(badgeElement, $("span"));
      badgeIcon.classList.add(...ThemeIcon.asClassNameArray(badge.icon));
      append(badgeElement, $("span", void 0, badge.label));
    }
    this._register(toggleDisclosure(button, this.domNode, getAgentMergeSummaryLabel(this._summary)));
  }
  _createPullRequestRow(body) {
    if (!this._summary.pullRequestUrl) {
      return;
    }
    const row = append(body, $(".chat-agent-merge-pr"));
    const icon2 = append(row, $("span.chat-agent-merge-row-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.gitPullRequest));
    const link2 = append(row, $("a.chat-agent-merge-link.chat-agent-merge-pr-title", void 0, this._summary.title || this._summary.pullRequestUrl));
    link2.href = this._summary.pullRequestUrl;
    this._registerLink(link2, this._summary.pullRequestUrl, () => this._openerService.open(URI.parse(this._summary.pullRequestUrl)));
  }
  _createCommentsSection(body) {
    if (this._comments.length === 0) {
      return;
    }
    const section = append(body, $(".chat-agent-merge-section"));
    append(section, $(".chat-agent-merge-section-title", void 0, localize(11876, null)));
    const fileElements = /* @__PURE__ */ new Map();
    this._comments.forEach((comment, index2) => {
      const item = append(section, $(".chat-agent-merge-comment"));
      const icon2 = append(item, $("span.chat-agent-merge-row-icon.chat-agent-merge-comment-icon"));
      icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.commentCompact));
      const header2 = append(item, $(".chat-agent-merge-comment-header"));
      if (comment.author) {
        append(header2, $("span.chat-agent-merge-comment-author", void 0, comment.author));
      }
      const label3 = this._fileLabels[index2];
      if (label3) {
        const file = append(header2, $("span.chat-agent-merge-comment-file", void 0, label3.name));
        this._register(this._hoverService.setupDelayedHover(file, { content: label3.title }));
        if (label3.description) {
          append(header2, $("span.chat-agent-merge-comment-file-description", void 0, label3.description));
        }
        if (comment.threadId) {
          fileElements.set(comment.threadId, file);
        }
      }
      const rendered = this._register(this._markdownRenderer.render(new MarkdownString(comment.body)));
      rendered.element.classList.add("chat-agent-merge-comment-body");
      item.appendChild(rendered.element);
    });
    this._linkMirroredComments(fileElements);
  }
  /**
   * Turns the file label of each thread the session mirrored into agent
   * feedback into a link that reveals that comment in the editor. Runs only
   * where the feedback commands exist (the Agents window) and after the lookup
   * resolves, so an unmirrored thread stays plain text.
   */
  async _linkMirroredComments(fileElements) {
    if (fileElements.size === 0 || !CommandsRegistry.getCommand("_agentFeedbackReview.getPullRequestThreadLinks" /* GetPullRequestThreadLinks */)) {
      return;
    }
    const links = await this._commandService.executeCommand(
      "_agentFeedbackReview.getPullRequestThreadLinks" /* GetPullRequestThreadLinks */,
      this._sessionResource
    );
    if (this._store.isDisposed || !links) {
      return;
    }
    for (const link2 of links) {
      const file = fileElements.get(link2.pullRequestThreadId);
      if (!file) {
        continue;
      }
      file.classList.add("chat-agent-merge-link");
      file.setAttribute("role", "link");
      this._registerLink(file, localize(11881, null), () => this._commandService.executeCommand("_agentFeedbackReview.reveal" /* Reveal */, this._sessionResource, link2.commentId));
    }
  }
  _createChecksSection(body) {
    if (this._summary.failedChecks.length === 0) {
      return;
    }
    const section = append(body, $(".chat-agent-merge-section"));
    append(section, $(".chat-agent-merge-section-title", void 0, localize(11874, null)));
    const checksUrl = this._summary.pullRequestUrl ? `${this._summary.pullRequestUrl}/checks` : void 0;
    for (const check of this._summary.failedChecks) {
      const item = append(section, $(".chat-agent-merge-check"));
      const icon2 = append(item, $("span.chat-agent-merge-row-icon.chat-agent-merge-check-icon"));
      icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.errorCompact));
      if (!checksUrl) {
        append(item, $("span.chat-agent-merge-check-name", void 0, check));
        continue;
      }
      const link2 = append(item, $("a.chat-agent-merge-link.chat-agent-merge-check-name", void 0, check));
      link2.href = checksUrl;
      this._registerLink(link2, localize(11880, null), () => this._openerService.open(URI.parse(checksUrl)));
    }
  }
  _createAgentMessageSection(body) {
    if (!this._summary.agentMessage) {
      return;
    }
    const label3 = localize(11871, null);
    const section = append(body, $(".chat-agent-merge-message"));
    const messageBody = $(".chat-agent-merge-message-body", void 0, this._summary.agentMessage);
    const button = this._register(new Button(section, { ...transparentButtonStyles, title: false }));
    button.element.classList.add("chat-agent-merge-message-header");
    const twistie = append(button.element, $("span.chat-agent-merge-twistie"));
    twistie.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRightCompact));
    append(button.element, $("span", void 0, label3));
    section.appendChild(messageBody);
    this._register(toggleDisclosure(button, section, label3));
  }
  /** Makes an element activate `run` by mouse or keyboard, with a hover describing it. */
  _registerLink(element, hover, run) {
    element.tabIndex = 0;
    this._register(this._hoverService.setupDelayedHover(element, { content: hover }));
    this._register(addDisposableListener(element, EventType.CLICK, (event) => {
      EventHelper.stop(event, true);
      run();
    }));
    this._register(addDisposableListener(element, EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(3 /* Enter */) || keyboardEvent.equals(10 /* Space */)) {
        EventHelper.stop(event, true);
        run();
      }
    }));
  }
};

ChatAgentMergeContentPart = __decorateClass([
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, ICommandService)
], ChatAgentMergeContentPart);

function toggleDisclosure(button, owner, ariaLabel) {
  const apply2 = (expanded2) => {
    owner.classList.toggle("collapsed", !expanded2);
    button.element.ariaExpanded = String(expanded2);
    button.element.ariaLabel = ariaLabel;
  };
  apply2(false);
  return button.onDidClick(() => apply2(owner.classList.contains("collapsed")));
}

function collectComments(summary) {
  const comments = [];
  for (const thread of summary.reviewThreads) {
    for (const comment of thread.comments) {
      comments.push({
        ...comment,
        ...thread.path ? { path: thread.path } : {},
        ...thread.line !== void 0 ? { line: thread.line } : {},
        threadId: thread.id
      });
    }
  }
  comments.push(...summary.reviewSummaries, ...summary.newComments);
  return comments;
}

function describeAgentMergeFileLabels(locations) {
  const indicesByName = /* @__PURE__ */ new Map();
  locations.forEach((location2, index2) => {
    if (location2.path) {
      const name = posix.basename(location2.path);
      const existing = indicesByName.get(name);
      if (existing) {
        existing.push(index2);
      } else {
        indicesByName.set(name, [index2]);
      }
    }
  });
  const labels = locations.map(() => void 0);
  for (const [name, indices] of indicesByName) {
    const directories = indices.map((index2) => posix.dirname(locations[index2].path));
    const distinct3 = [...new Set(directories)];
    const shortened = distinct3.length > 1 ? shorten(distinct3, posix.sep) : void 0;
    indices.forEach((index2, position2) => {
      const location2 = locations[index2];
      const description = shortened?.[distinct3.indexOf(directories[position2])];
      labels[index2] = {
        name: location2.line === void 0 ? name : `${name}:${location2.line}`,
        ...description ? { description } : {},
        title: location2.path
      };
    });
  }
  return labels;
}
export { describeBadges, getAgentMergeSummaryLabel, getAgentMergeRequestLabel, toggleDisclosure, collectComments, describeAgentMergeFileLabels, transparentButtonStyles, agentMergeTitle, ChatAgentMergeContentPart };
