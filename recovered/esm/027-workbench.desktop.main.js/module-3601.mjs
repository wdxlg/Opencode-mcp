// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/outline/browser/outline.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { IOutlinePane } from "./module-2003.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { OutlinePane } from "./module-3599.mjs";
import { VIEW_CONTAINER2 } from "./module-3090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/outline/browser/outline.contribution.ts
var outlineViewIcon = registerIcon("outline-view-icon", Codicon.symbolClass, localize(17964, null));

Registry.as(Extensions13.ViewsRegistry).registerViews([{
  id: IOutlinePane.Id,
  name: localize2(17955, "Outline"),
  containerIcon: outlineViewIcon,
  ctorDescriptor: new SyncDescriptor(OutlinePane),
  canToggleVisibility: true,
  canMoveView: true,
  hideByDefault: false,
  collapsed: true,
  order: 2,
  weight: 30,
  focusCommand: { id: "outline.focus" }
}], VIEW_CONTAINER2);

Registry.as(Extensions4.Configuration).registerConfiguration({
  "id": "outline",
  "order": 117,
  "title": localize(17963, null),
  "type": "object",
  "properties": {
    ["outline.icons" /* icons */]: {
      "description": localize(17961, null),
      "type": "boolean",
      "default": true
    },
    ["outline.collapseItems" /* collapseItems */]: {
      "description": localize(17956, null),
      "type": "string",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      "enum": [
        "alwaysCollapse",
        "alwaysExpand"
      ],
      "enumDescriptions": [
        localize(17957, null),
        localize(17958, null)
      ],
      "default": "alwaysExpand"
    },
    ["outline.problems.enabled" /* problemsEnabled */]: {
      "markdownDescription": localize(17962, null, "`#problems.visibility#`"),
      "type": "boolean",
      "default": true
    },
    ["outline.problems.colors" /* problemsColors */]: {
      "markdownDescription": localize(17959, null, "`#problems.visibility#`"),
      "type": "boolean",
      "default": true
    },
    ["outline.problems.badges" /* problemsBadges */]: {
      "markdownDescription": localize(17960, null, "`#problems.visibility#`"),
      "type": "boolean",
      "default": true
    },
    "outline.showFiles": {
      type: "boolean",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      default: true,
      markdownDescription: localize(17938, null)
    },
    "outline.showModules": {
      type: "boolean",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      default: true,
      markdownDescription: localize(17943, null)
    },
    "outline.showNamespaces": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17944, null)
    },
    "outline.showPackages": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17949, null)
    },
    "outline.showClasses": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17931, null)
    },
    "outline.showMethods": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17942, null)
    },
    "outline.showProperties": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17950, null)
    },
    "outline.showFields": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17937, null)
    },
    "outline.showConstructors": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17933, null)
    },
    "outline.showEnums": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17934, null)
    },
    "outline.showInterfaces": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17940, null)
    },
    "outline.showFunctions": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17939, null)
    },
    "outline.showVariables": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17954, null)
    },
    "outline.showConstants": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17932, null)
    },
    "outline.showStrings": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17951, null)
    },
    "outline.showNumbers": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17946, null)
    },
    "outline.showBooleans": {
      type: "boolean",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      default: true,
      markdownDescription: localize(17930, null)
    },
    "outline.showArrays": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17929, null)
    },
    "outline.showObjects": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17947, null)
    },
    "outline.showKeys": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17941, null)
    },
    "outline.showNull": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17945, null)
    },
    "outline.showEnumMembers": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17935, null)
    },
    "outline.showStructs": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17952, null)
    },
    "outline.showEvents": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17936, null)
    },
    "outline.showOperators": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17948, null)
    },
    "outline.showTypeParameters": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(17953, null)
    }
  }
});
export { outlineViewIcon };
