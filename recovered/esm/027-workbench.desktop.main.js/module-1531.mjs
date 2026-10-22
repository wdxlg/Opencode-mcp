// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { localize } from "./module-0001.mjs";
import { compareItemsByFuzzyScore, prepareQuery, scoreItemFuzzy } from "./module-1530.mjs";
import { quickPickItemScorerAccessor } from "./module-0536.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { URI } from "./module-0032.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/browser/parts/editor/editorQuickAccess.ts
var BaseEditorQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(prefix, editorGroupService, editorService, modelService, languageService) {
    super(
      prefix,
      {
        canAcceptInBackground: true,
        noResultsPick: {
          label: localize(6687, null),
          groupId: -1
        }
      }
    );
    this.editorGroupService = editorGroupService;
    this.editorService = editorService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.pickState = new class {
      constructor() {
        this.scorerCache = /* @__PURE__ */ Object.create(null);
        this.isQuickNavigating = void 0;
      }
      reset(isQuickNavigating) {
        if (!isQuickNavigating) {
          this.scorerCache = /* @__PURE__ */ Object.create(null);
        }
        this.isQuickNavigating = isQuickNavigating;
      }
    }();
  }
  provide(picker, token) {
    this.pickState.reset(!!picker.quickNavigate);
    return super.provide(picker, token);
  }
  _getPicks(filter2) {
    const query = prepareQuery(filter2);
    const filteredEditorEntries = this.doGetEditorPickItems().filter((entry) => {
      if (!query.normalized) {
        return true;
      }
      const itemScore = scoreItemFuzzy(entry, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache);
      if (!itemScore.score) {
        return false;
      }
      entry.highlights = { label: itemScore.labelMatch, description: itemScore.descriptionMatch };
      return true;
    });
    if (query.normalized) {
      const groups = this.editorGroupService.getGroups(2 /* GRID_APPEARANCE */).map((group2) => group2.id);
      filteredEditorEntries.sort((entryA, entryB) => {
        if (entryA.groupId !== entryB.groupId) {
          return groups.indexOf(entryA.groupId) - groups.indexOf(entryB.groupId);
        }
        return compareItemsByFuzzyScore(entryA, entryB, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache);
      });
    }
    const filteredEditorEntriesWithSeparators = [];
    if (this.editorGroupService.count > 1) {
      let lastGroupId = void 0;
      for (const entry of filteredEditorEntries) {
        if (typeof lastGroupId !== "number" || lastGroupId !== entry.groupId) {
          const group2 = this.editorGroupService.getGroup(entry.groupId);
          if (group2) {
            filteredEditorEntriesWithSeparators.push({ type: "separator", label: group2.label });
          }
          lastGroupId = entry.groupId;
        }
        filteredEditorEntriesWithSeparators.push(entry);
      }
    } else {
      filteredEditorEntriesWithSeparators.push(...filteredEditorEntries);
    }
    return filteredEditorEntriesWithSeparators;
  }
  doGetEditorPickItems() {
    const editors = this.doGetEditors();
    const mapGroupIdToGroupAriaLabel = /* @__PURE__ */ new Map();
    for (const { groupId } of editors) {
      if (!mapGroupIdToGroupAriaLabel.has(groupId)) {
        const group2 = this.editorGroupService.getGroup(groupId);
        if (group2) {
          mapGroupIdToGroupAriaLabel.set(groupId, group2.ariaLabel);
        }
      }
    }
    return this.doGetEditors().map(({ editor, groupId }) => {
      const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
      const isDirty = editor.isDirty() && !editor.isSaving();
      const description = editor.getDescription();
      const nameAndDescription = description ? `${editor.getName()} ${description}` : editor.getName();
      const icon2 = editor.getIcon();
      return {
        groupId,
        resource,
        label: editor.getName(),
        ariaLabel: (() => {
          if (mapGroupIdToGroupAriaLabel.size > 1) {
            return isDirty ? localize(6686, null, nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId)) : localize(6685, null, nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId));
          }
          return isDirty ? localize(6684, null, nameAndDescription) : nameAndDescription;
        })(),
        description,
        iconPath: URI.isUri(icon2) ? { dark: icon2 } : void 0,
        iconClasses: getIconClasses(this.modelService, this.languageService, resource, void 0, icon2).concat(editor.getLabelExtraClasses()),
        italic: !this.editorGroupService.getGroup(groupId)?.isPinned(editor),
        buttons: (() => {
          return [
            {
              iconClass: isDirty ? "dirty-editor " + ThemeIcon.asClassName(Codicon.closeDirty) : ThemeIcon.asClassName(Codicon.close),
              tooltip: localize(6683, null),
              alwaysVisible: isDirty
            }
          ];
        })(),
        trigger: async () => {
          const group2 = this.editorGroupService.getGroup(groupId);
          if (group2) {
            await group2.closeEditor(editor, { preserveFocus: true });
            if (!group2.contains(editor)) {
              return 3 /* REMOVE_ITEM */;
            }
          }
          return 0 /* NO_ACTION */;
        },
        accept: (keyMods, event) => this.editorGroupService.getGroup(groupId)?.openEditor(editor, { preserveFocus: event.inBackground })
      };
    });
  }
};

BaseEditorQuickAccessProvider = __decorateClass([
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IModelService),
  __decorateParam(4, ILanguageService)
], BaseEditorQuickAccessProvider);

var ActiveGroupEditorsByMostRecentlyUsedQuickAccess = class extends BaseEditorQuickAccessProvider {
  static {
    this.PREFIX = "edt active ";
  }
  constructor(editorGroupService, editorService, modelService, languageService) {
    super(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, editorGroupService, editorService, modelService, languageService);
  }
  doGetEditors() {
    const group2 = this.editorGroupService.activeGroup;
    return group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */).map((editor) => ({ editor, groupId: group2.id }));
  }
};

ActiveGroupEditorsByMostRecentlyUsedQuickAccess = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], ActiveGroupEditorsByMostRecentlyUsedQuickAccess);

var AllEditorsByAppearanceQuickAccess = class extends BaseEditorQuickAccessProvider {
  static {
    this.PREFIX = "edt ";
  }
  constructor(editorGroupService, editorService, modelService, languageService) {
    super(AllEditorsByAppearanceQuickAccess.PREFIX, editorGroupService, editorService, modelService, languageService);
  }
  doGetEditors() {
    const entries2 = [];
    for (const group2 of this.editorGroupService.getGroups(2 /* GRID_APPEARANCE */)) {
      for (const editor of group2.getEditors(1 /* SEQUENTIAL */)) {
        entries2.push({ editor, groupId: group2.id });
      }
    }
    return entries2;
  }
};

AllEditorsByAppearanceQuickAccess = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], AllEditorsByAppearanceQuickAccess);

var AllEditorsByMostRecentlyUsedQuickAccess = class extends BaseEditorQuickAccessProvider {
  static {
    this.PREFIX = "edt mru ";
  }
  constructor(editorGroupService, editorService, modelService, languageService) {
    super(AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, editorGroupService, editorService, modelService, languageService);
  }
  doGetEditors() {
    const entries2 = [];
    for (const editor of this.editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */)) {
      entries2.push(editor);
    }
    return entries2;
  }
};

AllEditorsByMostRecentlyUsedQuickAccess = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], AllEditorsByMostRecentlyUsedQuickAccess);
export { BaseEditorQuickAccessProvider, ActiveGroupEditorsByMostRecentlyUsedQuickAccess, AllEditorsByAppearanceQuickAccess, AllEditorsByMostRecentlyUsedQuickAccess };
