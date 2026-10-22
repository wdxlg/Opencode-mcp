// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionArtifacts.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, getComparisonKey } from "./module-0034.mjs";
import { Schemas, matchesSomeScheme } from "./module-0033.mjs";
import { AGENT_HOST_SCHEME } from "./module-1001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { getMediaMime } from "./module-0136.mjs";
import { toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { openChatTurnFile, previewKind } from "./module-2240.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/sessions/contrib/chat/browser/sessionArtifacts.ts
var OPEN_IMAGE_CAROUSEL_COMMAND_ID = "workbench.action.chat.openImageInCarousel";

var SESSION_REFERENCES_PILL_ID = "sessions.chatPills.references";

var sessionReferencesPillOptions = {
  widgetId: "sessionReferences",
  icon: Codicon.bookmark,
  title: localize(4599, null),
  summaryLabel: (count2) => count2 === 1 ? localize(4596, null) : localize(4595, null, count2),
  summaryAriaLabel: (count2) => count2 === 1 ? localize(4598, null) : localize(4597, null, count2),
  singleEntry: "summary" /* Summary */
};

var artifactIcons = /* @__PURE__ */ new Map([
  ["pullRequest" /* PullRequest */, Codicon.gitPullRequest],
  ["issue" /* Issue */, Codicon.issues],
  ["commit" /* Commit */, Codicon.gitCommit],
  ["website" /* Website */, Codicon.globe],
  ["resource" /* Resource */, Codicon.link]
]);

var sectionOrder = [
  { kind: "pullRequest" /* PullRequest */, title: localize(4592, null) },
  { kind: "issue" /* Issue */, title: localize(4589, null) },
  { kind: "commit" /* Commit */, title: localize(4582, null) },
  { kind: "website" /* Website */, title: localize(4594, null) },
  { kind: "file" /* File */, title: localize(4586, null) },
  { kind: "resource" /* Resource */, title: localize(4593, null) }
];

function artifactValueKey(artifact) {
  if (artifact.uri) {
    return getComparisonKey(artifact.uri);
  }
  return (artifact.link?.toString() ?? artifact.commitHash ?? artifact.id).toLowerCase();
}

var pathSchemes = [Schemas.file, Schemas.vscodeRemote, Schemas.vscodeUserData, AGENT_HOST_SCHEME];

function sessionArtifactLocationText(uri4, labelService) {
  if (!matchesSomeScheme(uri4, ...pathSchemes)) {
    return uri4.toString(true);
  }
  return labelService.getUriLabel(uri4, { relative: true }) || labelService.getUriLabel(uri4);
}

function sessionArtifactLocation(location2, label3) {
  return {
    ariaDescription: location2,
    ariaLabel: localize(4590, null, label3),
    hover: { content: new MarkdownString().appendText(location2) },
    tooltip: location2
  };
}

function getImageMimeType(uri4) {
  const mimeType = getMediaMime(uri4.path);
  return mimeType?.startsWith("image/") ? mimeType : void 0;
}

function websiteKey(url) {
  const parsed = URL.parse(url);
  if (!parsed) {
    return void 0;
  }
  const path = parsed.pathname.length > 1 && parsed.pathname.endsWith("/") ? parsed.pathname.slice(0, -1) : parsed.pathname;
  return `${parsed.protocol}//${parsed.host}${path}${parsed.search}${parsed.hash}`;
}

function isShownInBrowser(link2, browserKeys) {
  if (!link2 || browserKeys.size === 0) {
    return false;
  }
  const key3 = websiteKey(link2.toString());
  return !!key3 && browserKeys.has(key3);
}

function toEntry2(artifact, actions, labelService) {
  if (artifact.kind === "file" /* File */) {
    if (!artifact.uri) {
      return void 0;
    }
    const uri4 = artifact.uri;
    const label3 = basename2(uri4);
    return { id: artifact.id, label: label3, resource: uri4, ...sessionArtifactLocation(sessionArtifactLocationText(uri4, labelService), label3), open: () => actions.openResource(uri4) };
  }
  const icon2 = artifactIcons.get(artifact.kind) ?? Codicon.archive;
  if (artifact.kind === "commit" /* Commit */) {
    if (!artifact.link) {
      return void 0;
    }
    const link3 = artifact.link;
    const copyAction = artifact.commitHash ? [toAction({
      id: "sessions.artifacts.copyCommitHash",
      label: localize(4583, null),
      class: ThemeIcon.asClassName(Codicon.copy),
      run: () => actions.copy(artifact.commitHash)
    })] : [];
    return { id: artifact.id, label: artifact.label, icon: icon2, toolbarActions: copyAction, ...sessionArtifactLocation(sessionArtifactLocationText(link3, labelService), artifact.label), open: () => actions.openExternal(link3) };
  }
  if (artifact.kind === "resource" /* Resource */) {
    if (!artifact.uri) {
      return void 0;
    }
    const uri4 = artifact.uri;
    return { id: artifact.id, label: artifact.label, icon: icon2, ...sessionArtifactLocation(sessionArtifactLocationText(uri4, labelService), artifact.label), open: () => actions.openResource(uri4) };
  }
  if (!artifact.link) {
    return void 0;
  }
  const link2 = artifact.link;
  const isGitHubReference = artifact.kind === "pullRequest" /* PullRequest */ || artifact.kind === "issue" /* Issue */;
  const copyLinkAction = isGitHubReference ? [toAction({
    id: "sessions.artifacts.copyLink",
    label: artifact.kind === "pullRequest" /* PullRequest */ ? localize(4585, null) : localize(4584, null),
    class: ThemeIcon.asClassName(Codicon.copy),
    run: () => actions.copy(link2.toString(true))
  })] : [];
  return { id: artifact.id, label: artifact.label, icon: icon2, toolbarActions: copyLinkAction, ...sessionArtifactLocation(sessionArtifactLocationText(link2, labelService), artifact.label), open: () => actions.openExternal(link2) };
}

function buildSessionArtifactSections(artifacts, actions, labelService, imageCarouselEnabled, browserUrls) {
  const entriesByKind = /* @__PURE__ */ new Map();
  const images = [];
  const seen = /* @__PURE__ */ new Set();
  const browserKeys = /* @__PURE__ */ new Set();
  for (const url of browserUrls) {
    const key3 = websiteKey(url);
    if (key3) {
      browserKeys.add(key3);
    }
  }
  for (const artifact of artifacts) {
    if (artifact.kind === "website" /* Website */ && isShownInBrowser(artifact.link, browserKeys)) {
      continue;
    }
    const imageMimeType = artifact.uri ? getImageMimeType(artifact.uri) : void 0;
    if (artifact.kind === "file" /* File */ && artifact.uri && imageMimeType) {
      if (!seen.has(artifactValueKey(artifact))) {
        seen.add(artifactValueKey(artifact));
        images.push({ uri: artifact.uri, mimeType: imageMimeType });
      }
      continue;
    }
    const entry = toEntry2(artifact, actions, labelService);
    if (!entry || seen.has(artifactValueKey(artifact))) {
      continue;
    }
    seen.add(artifactValueKey(artifact));
    const entries2 = entriesByKind.get(artifact.kind) ?? [];
    entries2.push(entry);
    entriesByKind.set(artifact.kind, entries2);
  }
  const sections = [];
  for (const { kind, title } of sectionOrder) {
    if (kind === "file" /* File */ && images.length) {
      sections.push({
        title: localize(4588, null),
        entries: images.map(({ uri: uri4 }, index2) => {
          const label3 = basename2(uri4);
          return {
            id: uri4.toString(),
            label: label3,
            resource: uri4,
            ...sessionArtifactLocation(sessionArtifactLocationText(uri4, labelService), label3),
            ...imageCarouselEnabled ? {
              ariaLabel: localize(4591, null, label3),
              open: () => actions.openImages(images, index2)
            } : { open: () => actions.openResource(uri4) }
          };
        })
      });
    }
    const entries2 = entriesByKind.get(kind);
    if (entries2?.length) {
      sections.push({ title, entries: entries2 });
    }
  }
  return sections;
}

var SessionArtifacts = class extends Disposable {
  constructor(session, _browserUrls, _clipboardService, _commandService, _configurationService, _labelService, _openerService, workspaceContextService) {
    super();
    this._browserUrls = _browserUrls;
    this._clipboardService = _clipboardService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._labelService = _labelService;
    this._openerService = _openerService;
    const imageCarouselEnabled = observableConfigValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */, true, this._configurationService);
    const locationFormatting = observableSignalFromEvent(this, Event2.any(this._labelService.onDidChangeFormatters, workspaceContextService.onDidChangeWorkspaceFolders));
    const sectionsFor = (isArtifact) => derived(this, (reader) => {
      const current = session.read(reader);
      if (!current) {
        return [];
      }
      locationFormatting.read(reader);
      return buildSessionArtifactSections(
        (current.artifacts?.read(reader) ?? []).filter((artifact) => artifact.isArtifact === isArtifact),
        this._actions(),
        this._labelService,
        imageCarouselEnabled.read(reader),
        this._browserUrls.read(reader)
      );
    });
    this.sections = sectionsFor(true);
    this.referenceSections = sectionsFor(false);
  }
  _actions() {
    return {
      // Contributed openers make a link behave the same here as in the response
      // markdown it came from, so a localhost page lands in the integrated
      // browser rather than the system one.
      openExternal: (link2) => {
        void this._openerService.open(link2, { openExternal: true, allowContributedOpeners: true, fromUserGesture: true });
      },
      openResource: (uri4) => {
        if (previewKind(uri4)) {
          void openChatTurnFile({ uri: uri4, kind: previewKind(uri4), created: false }, this._openerService, this._configurationService);
          return;
        }
        void this._openerService.open(uri4, { fromUserGesture: true });
      },
      openImages: (images, startIndex) => {
        const collection = {
          id: generateUuid(),
          title: localize(4587, null),
          sections: [{
            title: localize(4588, null),
            images: images.map((image) => ({
              id: image.uri.toString(),
              name: basename2(image.uri),
              mimeType: image.mimeType,
              uri: image.uri
            }))
          }]
        };
        void this._commandService.executeCommand(OPEN_IMAGE_CAROUSEL_COMMAND_ID, { collection, startIndex });
      },
      copy: (text2) => {
        void this._clipboardService.writeText(text2);
      }
    };
  }
};

SessionArtifacts = __decorateClass([
  __decorateParam(2, IClipboardService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IWorkspaceContextService)
], SessionArtifacts);
export { artifactValueKey, sessionArtifactLocationText, sessionArtifactLocation, getImageMimeType, websiteKey, isShownInBrowser, toEntry2, buildSessionArtifactSections, OPEN_IMAGE_CAROUSEL_COMMAND_ID, SESSION_REFERENCES_PILL_ID, sessionReferencesPillOptions, artifactIcons, sectionOrder, pathSchemes, SessionArtifacts };
