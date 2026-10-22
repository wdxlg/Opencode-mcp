// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/sessionSummaryHover.ts
import { $, EventHelper, append, clearNode } from "./module-0075.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { chatLinesAddedForeground, chatLinesRemovedForeground } from "./module-2063.mjs";
import { renderIcon } from "./module-0467.mjs";
import { asCssVariable } from "./module-0226.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/sessionSummaryHover.ts
var SessionSummaryHoverWidget = class {
  constructor(data) {
    this.domNode = $(".session-summary-hover");
    this._title = append(this.domNode, $(".session-summary-hover-title"));
    this._location = append(this.domNode, $(".session-summary-hover-section.session-summary-hover-location"));
    this._pullRequests = append(this.domNode, $(".session-summary-hover-section.session-summary-hover-pull-requests"));
    this._createdBy = append(this.domNode, $(".session-summary-hover-section.session-summary-hover-created-by"));
    this._externalSession = append(this.domNode, $(".session-summary-hover-section.session-summary-hover-external-session"));
    if (data) {
      this.update(data);
    }
  }
  update(data) {
    clearNode(this._title);
    append(this._title, $("span.session-summary-hover-title-text", void 0, data.title));
    if (data.providerLabel) {
      appendSeparator(this._title);
      append(this._title, $("span.session-summary-hover-provider", void 0, data.providerLabel));
    }
    clearNode(this._location);
    this._renderLocation(data.location);
    this._location.classList.toggle("hidden", !this._location.hasChildNodes());
    clearNode(this._pullRequests);
    for (const pullRequest of data.pullRequests ?? []) {
      const icon2 = pullRequest.icon ?? Codicon.gitPullRequest;
      if (pullRequest.uri && pullRequest.onOpen) {
        this._appendLinkRow(this._pullRequests, icon2, pullRequest.uri, pullRequest.onOpen, pullRequest.title);
      } else {
        this._appendRow(this._pullRequests, icon2, pullRequest.title);
      }
    }
    this._pullRequests.classList.toggle("hidden", !this._pullRequests.hasChildNodes());
    clearNode(this._createdBy);
    if (data.createdBy) {
      this._appendButtonRow(this._createdBy, Codicon.reply, data.createdBy.onOpen, localize(9255, null), data.createdBy.title);
    }
    this._createdBy.classList.toggle("hidden", !this._createdBy.hasChildNodes());
    clearNode(this._externalSession);
    if (data.externalSession) {
      this._appendButtonRow(this._externalSession, Codicon.multipleWindows, data.externalSession.onOpen, localize(9256, null));
    }
    this._externalSession.classList.toggle("hidden", !this._externalSession.hasChildNodes());
  }
  _renderLocation(location2) {
    if (!location2) {
      return;
    }
    if (location2.workspace) {
      this._appendRow(this._location, location2.workspaceIcon ?? Codicon.folder, localize(9259, null), location2.workspace);
    }
    if (location2.worktreePending) {
      this._appendRow(this._location, Codicon.worktree, localize(9260, null), localize(9261, null));
    } else if (location2.worktree) {
      this._appendRow(this._location, Codicon.worktree, localize(9260, null), location2.worktree);
    }
    if (location2.branch) {
      this._appendRow(this._location, Codicon.gitBranch, localize(9254, null), location2.branch);
    }
    const changes = location2.changes;
    if (changes) {
      const files = changes.files === 1 ? localize(9257, null) : localize(9258, null, changes.files);
      const text2 = this._appendRow(this._location, Codicon.diffMultiple, files);
      appendCount(text2, "session-summary-hover-insertions", chatLinesAddedForeground, `+${changes.insertions}`);
      appendCount(text2, "session-summary-hover-deletions", chatLinesRemovedForeground, `-${changes.deletions}`);
    }
  }
  /**
   * A row of `icon label [· detail]`, returning the inline text container so
   * callers can append further inline content. The icon keeps its theme color,
   * so a merged pull request reads as merged at a glance.
   */
  _appendRow(parent, icon2, label3, detail2) {
    const row = append(parent, $(".session-summary-hover-row"));
    return this._appendRowContent(row, icon2, label3, detail2);
  }
  /**
   * A row that navigates somewhere: a real anchor, so assistive technology
   * announces a link and the usual affordances (copy the target, open it in a
   * new tab) are available. Activation is handled rather than left to the
   * anchor, so the target is opened through the caller's opener service
   * instead of navigating the window the hover is shown in.
   */
  _appendLinkRow(parent, icon2, uri5, onOpen, label3, detail2) {
    const link2 = append(parent, $("a.session-summary-hover-row.session-summary-hover-link"));
    link2.href = uri5.toString();
    link2.onclick = (event) => {
      EventHelper.stop(event, true);
      onOpen();
    };
    return this._appendRowContent(link2, icon2, label3, detail2);
  }
  /** A row that runs an in-app action, so it has no target to link to. */
  _appendButtonRow(parent, icon2, onOpen, label3, detail2) {
    const button = append(parent, $("button.session-summary-hover-row.session-summary-hover-link"));
    button.type = "button";
    button.onclick = onOpen;
    return this._appendRowContent(button, icon2, label3, detail2);
  }
  _appendRowContent(row, icon2, label3, detail2) {
    const iconElement = append(row, renderIcon(icon2));
    iconElement.classList.add("session-summary-hover-icon");
    if (icon2.color) {
      iconElement.style.color = asCssVariable(icon2.color.id);
    }
    const text2 = append(row, $("span.session-summary-hover-text"));
    if (label3) {
      append(text2, $("span", void 0, label3));
    }
    if (detail2) {
      appendSeparator(text2);
      append(text2, $("span.session-summary-hover-detail", void 0, detail2));
    }
    return text2;
  }
};

var SEPARATOR = " \xB7 ";

function appendSeparator(parent) {
  append(parent, $("span.session-summary-hover-separator", void 0, SEPARATOR));
}

function appendCount(parent, className2, colorId, text2) {
  const element = append(parent, $(`span.${className2}`, void 0, text2));
  element.style.color = asCssVariable(colorId);
}
export { appendSeparator, appendCount, SessionSummaryHoverWidget, SEPARATOR };
