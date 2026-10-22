// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/quickDiff.contribution.ts
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { QuickDiffWorkbenchController } from "./module-3150.mjs";
import { registerEditorContribution } from "./module-0097.mjs";
import { QuickDiffEditorController } from "./module-3151.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IQuickDiffService } from "./module-1079.mjs";
import { QuickDiffService } from "./module-3149.mjs";
import { IQuickDiffModelService, QuickDiffModelService } from "./module-1082.mjs";


// src/vs/workbench/contrib/scm/browser/quickDiff.contribution.ts
MenuRegistry.appendMenuItem(MenuId.EditorLineNumberContext, {
  title: localize(18728, null),
  submenu: MenuId.SCMQuickDiffDecorations,
  when: ContextKeyExpr.or(
    ContextKeyExpr.equals("config.scm.diffDecorations", "all"),
    ContextKeyExpr.equals("config.scm.diffDecorations", "gutter")
  ),
  group: "9_quickDiffDecorations"
});

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(QuickDiffWorkbenchController, 3 /* Restored */);

registerEditorContribution(
  QuickDiffEditorController.ID,
  QuickDiffEditorController,
  1 /* AfterFirstRender */
);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "scm",
  order: 5,
  title: localize(18743, null),
  type: "object",
  scope: 5 /* RESOURCE */,
  properties: {
    "scm.diffDecorations": {
      type: "string",
      enum: ["all", "gutter", "overview", "minimap", "none"],
      enumDescriptions: [
        localize(18729, null),
        localize(18730, null),
        localize(18733, null),
        localize(18731, null),
        localize(18732, null)
      ],
      default: "all",
      description: localize(18722, null)
    },
    "scm.diffDecorationsGutterWidth": {
      type: "number",
      enum: [1, 2, 3, 4, 5],
      default: 3,
      description: localize(18727, null)
    },
    "scm.diffDecorationsGutterVisibility": {
      type: "string",
      enum: ["always", "hover"],
      enumDescriptions: [
        localize(18738, null),
        localize(18739, null)
      ],
      description: localize(18737, null),
      default: "always"
    },
    "scm.diffDecorationsGutterAction": {
      type: "string",
      enum: ["diff", "none"],
      enumDescriptions: [
        localize(18735, null),
        localize(18736, null)
      ],
      description: localize(18734, null),
      default: "diff"
    },
    "scm.diffDecorationsGutterPattern": {
      type: "object",
      description: localize(18724, null),
      additionalProperties: false,
      properties: {
        "added": {
          type: "boolean",
          description: localize(18725, null)
        },
        "modified": {
          type: "boolean",
          description: localize(18726, null)
        }
      },
      default: {
        "added": false,
        "modified": true
      }
    },
    "scm.diffDecorationsIgnoreTrimWhitespace": {
      type: "string",
      enum: ["true", "false", "inherit"],
      enumDescriptions: [
        localize(18742, null),
        localize(18740, null),
        localize(18741, null)
      ],
      description: localize(18723, null),
      default: "false"
    }
  }
});

registerSingleton(IQuickDiffService, QuickDiffService, 1 /* Delayed */);

registerSingleton(IQuickDiffModelService, QuickDiffModelService, 1 /* Delayed */);
export {};
