// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionCustomizations.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { isEqualOrParent2, relativePath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { Disposable } from "./module-0012.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { AICustomizationManagementCommands2 } from "./module-1471.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/sessions/contrib/chat/browser/sessionCustomizations.ts
var SESSION_CUSTOMIZATIONS_PILL_ID = "sessions.chatPills.customizations";

var chatCustomizationPillOptions = {
  widgetId: "chatCustomizations",
  icon: Codicon.bookmark,
  title: localize(4639, null),
  summaryLabel: (count2) => count2 === 1 ? localize(4636, null) : localize(4635, null, count2),
  summaryAriaLabel: (count2) => count2 === 1 ? localize(4638, null) : localize(4637, null, count2),
  singleEntry: "summary" /* Summary */
};

var customizationIcons = /* @__PURE__ */ new Map([
  ["agent" /* Agent */, Codicon.robot],
  ["skill" /* Skill */, Codicon.lightbulb],
  ["instruction" /* Instruction */, Codicon.book],
  ["hook" /* Hook */, Codicon.plug],
  ["prompt" /* Prompt */, Codicon.commentDiscussion],
  ["mcpServer" /* McpServer */, Codicon.mcp],
  ["plugin" /* Plugin */, Codicon.extensions]
]);

var customizationSections = /* @__PURE__ */ new Map([
  ["agent" /* Agent */, AICustomizationManagementSection.Agents],
  ["skill" /* Skill */, AICustomizationManagementSection.Skills],
  ["instruction" /* Instruction */, AICustomizationManagementSection.Instructions],
  ["hook" /* Hook */, AICustomizationManagementSection.Hooks],
  ["prompt" /* Prompt */, AICustomizationManagementSection.Prompts],
  ["mcpServer" /* McpServer */, AICustomizationManagementSection.McpServers],
  ["plugin" /* Plugin */, AICustomizationManagementSection.Plugins]
]);

var sectionOrder2 = [
  { kind: "agent" /* Agent */, title: localize(4640, null) },
  { kind: "skill" /* Skill */, title: localize(4646, null) },
  { kind: "instruction" /* Instruction */, title: localize(4642, null) },
  { kind: "hook" /* Hook */, title: localize(4641, null) },
  { kind: "prompt" /* Prompt */, title: localize(4645, null) },
  { kind: "mcpServer" /* McpServer */, title: localize(4643, null) },
  { kind: "plugin" /* Plugin */, title: localize(4644, null) }
];

function buildSessionCustomizationSections(customizations, sessionFolders, reveal) {
  const entriesByKind = /* @__PURE__ */ new Map();
  for (const customization of customizations) {
    const entries2 = entriesByKind.get(customization.kind) ?? [];
    const path = customization.uri ? getCustomizationPath(customization.uri, sessionFolders) : void 0;
    entries2.push({
      id: customization.id,
      label: customization.name,
      icon: customizationIcons.get(customization.kind) ?? Codicon.bookmark,
      ariaDescription: path,
      hover: path ? { content: new MarkdownString().appendText(path) } : void 0,
      open: () => reveal(customization)
    });
    entriesByKind.set(customization.kind, entries2);
  }
  const sections = [];
  for (const { kind, title } of sectionOrder2) {
    const entries2 = entriesByKind.get(kind);
    if (entries2?.length) {
      sections.push({ title, entries: entries2 });
    }
  }
  return sections;
}

function getCustomizationPath(uri4, sessionFolders) {
  for (const folder of sessionFolders) {
    if (!isEqualOrParent2(uri4, folder.workingDirectory)) {
      continue;
    }
    const path = relativePath(folder.workingDirectory, uri4);
    if (path === void 0) {
      continue;
    }
    if (!path) {
      return folder.name;
    }
    return sessionFolders.length > 1 ? `${folder.name}/${path}` : path;
  }
  return uri4.scheme === Schemas.file ? uri4.fsPath : uri4.toString(true);
}

var SessionCustomizations = class extends Disposable {
  constructor(chat, session, _commandService) {
    super();
    this._commandService = _commandService;
    this.sections = derivedOpts({ owner: this, equalsFn: sectionsEqual }, (reader) => {
      const customizations = chat.read(reader)?.customizations?.read(reader) ?? [];
      const sessionFolders = session.read(reader)?.workspace.read(reader)?.folders ?? [];
      return buildSessionCustomizationSections(customizations, sessionFolders, (customization) => this._reveal(customization));
    });
  }
  _reveal(customization) {
    void this._commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, {
      section: customizationSections.get(customization.kind),
      revealUri: customization.uri
    });
  }
};

SessionCustomizations = __decorateClass([
  __decorateParam(2, ICommandService)
], SessionCustomizations);

function sectionsEqual(a, b) {
  return a.length === b.length && a.every((section, i2) => section.title === b[i2].title && section.entries.length === b[i2].entries.length && section.entries.every((entry, j) => entry.id === b[i2].entries[j].id && entry.label === b[i2].entries[j].label && hoverContentEqual(entry, b[i2].entries[j])));
}

function hoverContentEqual(a, b) {
  const aContent = a.hover?.content;
  const bContent = b.hover?.content;
  return isMarkdownString(aContent) && isMarkdownString(bContent) ? aContent.value === bContent.value : aContent === bContent;
}
export { buildSessionCustomizationSections, getCustomizationPath, sectionsEqual, hoverContentEqual, SESSION_CUSTOMIZATIONS_PILL_ID, chatCustomizationPillOptions, customizationIcons, customizationSections, sectionOrder2, SessionCustomizations };
