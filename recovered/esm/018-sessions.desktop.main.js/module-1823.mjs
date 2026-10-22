// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsLayout.ts
import { localize } from "./module-0001.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { isWeb, isWindows } from "./module-0014.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsLayout.ts
var COMMONLY_USED_SETTINGS = [
  "editor.fontSize",
  "editor.formatOnSave",
  "files.autoSave",
  "GitHub.copilot-chat.manageExtension",
  "editor.defaultFormatter",
  "editor.fontFamily",
  "editor.wordWrap",
  "chat.agent.maxRequests",
  "files.exclude",
  "workbench.colorTheme",
  "editor.tabSize",
  "editor.mouseWheelZoom",
  "editor.formatOnPaste"
];

function getCommonlyUsedData(settingGroups) {
  const allSettings2 = /* @__PURE__ */ new Map();
  for (const group2 of settingGroups) {
    for (const section of group2.sections) {
      for (const s of section.settings) {
        allSettings2.set(s.key, s);
      }
    }
  }
  const settings = [];
  for (const id2 of COMMONLY_USED_SETTINGS) {
    const setting = allSettings2.get(id2);
    if (setting) {
      settings.push(setting);
    }
  }
  return {
    id: "commonlyUsed",
    label: localize(18258, null),
    settings
  };
}

var tocData = {
  id: "root",
  label: "root",
  children: [
    {
      id: "editor",
      label: localize(18295, null),
      settings: ["editor.*"],
      children: [
        {
          id: "editor/cursor",
          label: localize(18259, null),
          settings: ["editor.cursor*"]
        },
        {
          id: "editor/find",
          label: localize(18268, null),
          settings: ["editor.find.*"]
        },
        {
          id: "editor/font",
          label: localize(18269, null),
          settings: ["editor.font*"]
        },
        {
          id: "editor/format",
          label: localize(18270, null),
          settings: ["editor.format*"]
        },
        {
          id: "editor/diffEditor",
          label: localize(18261, null),
          settings: ["diffEditor.*"]
        },
        {
          id: "editor/multiDiffEditor",
          label: localize(18275, null),
          settings: ["multiDiffEditor.*"]
        },
        {
          id: "editor/minimap",
          label: localize(18274, null),
          settings: ["editor.minimap.*"]
        },
        {
          id: "editor/suggestions",
          label: localize(18290, null),
          settings: ["editor.*suggest*"]
        },
        {
          id: "editor/files",
          label: localize(18267, null),
          settings: ["files.*"]
        }
      ]
    },
    {
      id: "workbench",
      label: localize(18299, null),
      settings: ["workbench.*"],
      children: [
        {
          id: "workbench/appearance",
          label: localize(18244, null),
          settings: ["workbench.activityBar.*", "workbench.*color*", "workbench.fontAliasing", "workbench.iconTheme", "workbench.sidebar.location", "workbench.*.visible", "workbench.tips.enabled", "workbench.tree.*", "workbench.view.*"]
        },
        {
          id: "workbench/breadcrumbs",
          label: localize(18246, null),
          settings: ["breadcrumbs.*"]
        },
        {
          id: "workbench/editor",
          label: localize(18262, null),
          settings: ["workbench.editor.*"]
        },
        {
          id: "workbench/settings",
          label: localize(18288, null),
          settings: ["workbench.settings.*"]
        },
        {
          id: "workbench/zenmode",
          label: localize(18301, null),
          settings: ["zenmode.*"]
        },
        {
          id: "workbench/screencastmode",
          label: localize(18285, null),
          settings: ["screencastMode.*"]
        },
        {
          id: "workbench/browser",
          label: localize(18247, null),
          settings: ["workbench.browser.*"]
        }
      ]
    },
    {
      id: "window",
      label: localize(18298, null),
      settings: ["window.*"],
      children: [
        {
          id: "window/newWindow",
          label: localize(18277, null),
          settings: ["window.*newwindow*"]
        }
      ]
    },
    {
      id: "chat",
      label: localize(18248, null),
      children: [
        {
          id: "chat/agent",
          label: localize(18249, null),
          settings: [
            "chat.agent.*",
            "chat.checkpoints.*",
            "chat.editRequests",
            "chat.requestQueuing.*",
            "chat.undoRequests.*",
            "chat.customAgentInSubagent.*",
            "chat.editing.autoAcceptDelay",
            "chat.editing.confirmEditRequest*",
            "chat.planAgent.defaultModel"
          ]
        },
        {
          id: "chat/appearance",
          label: localize(18250, null),
          settings: [
            "chat.editor.*",
            "chat.fontFamily",
            "chat.fontSize",
            "chat.math.*",
            "chat.agentsControl.*",
            "chat.alternativeToolAction.*",
            "chat.codeBlock.*",
            "chat.editing.explainChanges.enabled",
            "chat.editorAssociations",
            "chat.extensionUnification.*",
            "chat.inlineReferences.*",
            "chat.notifyWindow*",
            "chat.statusWidget.*",
            "chat.tips.*",
            "chat.unifiedAgentsBar.*",
            "accessibility.signals.chatUserActionRequired",
            "accessibility.signals.chatResponseReceived"
          ]
        },
        {
          id: "chat/sessions",
          label: localize(18255, null),
          settings: [
            "chat.agentSessionProjection.*",
            "chat.sessions.*",
            "chat.viewProgressBadge.*",
            "chat.viewSessions.*",
            "chat.restoreLastPanelSession",
            "chat.exitAfterDelegation",
            "chat.repoInfo.*"
          ]
        },
        {
          id: "chat/tools",
          label: localize(18256, null),
          settings: [
            "chat.tools.*",
            "chat.extensionTools.*"
          ]
        },
        {
          id: "chat/mcp",
          label: localize(18253, null),
          settings: ["mcp", "chat.mcp.*", "mcp.*"]
        },
        {
          id: "chat/context",
          label: localize(18251, null),
          settings: [
            "chat.detectParticipant.*",
            "chat.experimental.detectParticipant.*",
            "chat.implicitContext.*",
            "chat.promptFilesLocations",
            "chat.instructionsFilesLocations",
            "chat.modeFilesLocations",
            "chat.agentFilesLocations",
            "chat.agentSkillsLocations",
            "chat.hookFilesLocations",
            "chat.promptFilesRecommendations",
            "chat.useAgentsMdFile",
            "chat.useNestedAgentsMdFiles",
            "chat.useAgentSkills",
            "chat.experimental.useSkillAdherencePrompt",
            "chat.useHooks",
            "chat.includeApplyingInstructions",
            "chat.includeReferencedInstructions",
            "chat.useClaudeMdFile"
          ]
        },
        {
          id: "chat/inlineChat",
          label: localize(18252, null),
          settings: ["inlineChat.*"]
        },
        {
          id: "chat/miscellaneous",
          label: localize(18254, null),
          settings: [
            ChatAIDisabledSettingId,
            "chat.allowAnonymousAccess"
          ]
        }
      ]
    },
    {
      id: "features",
      label: localize(18265, null),
      children: [
        {
          id: "features/accessibilitySignals",
          label: localize(18243, null),
          settings: ["accessibility.signal*"]
        },
        {
          id: "features/accessibility",
          label: localize(18242, null),
          settings: ["accessibility.*"]
        },
        {
          id: "features/explorer",
          label: localize(18266, null),
          settings: ["explorer.*", "outline.*"]
        },
        {
          id: "features/search",
          label: localize(18286, null),
          settings: ["search.*"]
        },
        {
          id: "features/debug",
          label: localize(18260, null),
          settings: ["debug.*", "launch"]
        },
        {
          id: "features/testing",
          label: localize(18294, null),
          settings: ["testing.*"]
        },
        {
          id: "features/scm",
          label: localize(18284, null),
          settings: ["scm.*"]
        },
        {
          id: "features/extensions",
          label: localize(18264, null),
          settings: ["extensions.*"]
        },
        {
          id: "features/terminal",
          label: localize(18293, null),
          settings: ["terminal.*"]
        },
        {
          id: "features/task",
          label: localize(18291, null),
          settings: ["task.*"]
        },
        {
          id: "features/problems",
          label: localize(18281, null),
          settings: ["problems.*"]
        },
        {
          id: "features/output",
          label: localize(18280, null),
          settings: ["output.*"]
        },
        {
          id: "features/comments",
          label: localize(18257, null),
          settings: ["comments.*"]
        },
        {
          id: "features/remote",
          label: localize(18283, null),
          settings: ["remote.*"]
        },
        {
          id: "features/timeline",
          label: localize(18296, null),
          settings: ["timeline.*"]
        },
        {
          id: "features/notebook",
          label: localize(18278, null),
          settings: ["notebook.*", "interactiveWindow.*"]
        },
        {
          id: "features/mergeEditor",
          label: localize(18273, null),
          settings: ["mergeEditor.*"]
        },
        {
          id: "features/issueReporter",
          label: localize(18271, null),
          settings: ["issueReporter.*"],
          hide: !isWeb
        }
      ]
    },
    {
      id: "application",
      label: localize(18245, null),
      children: [
        {
          id: "application/http",
          label: localize(18282, null),
          settings: ["http.*"]
        },
        {
          id: "application/keyboard",
          label: localize(18272, null),
          settings: ["keyboard.*"]
        },
        {
          id: "application/update",
          label: localize(18297, null),
          settings: ["update.*"]
        },
        {
          id: "application/telemetry",
          label: localize(18292, null),
          settings: ["telemetry.*"]
        },
        {
          id: "application/settingsSync",
          label: localize(18289, null),
          settings: ["settingsSync.*"]
        },
        {
          id: "application/network",
          label: localize(18276, null),
          settings: ["network.*"]
        },
        {
          id: "application/experimental",
          label: localize(18263, null),
          settings: ["application.experimental.*"]
        },
        {
          id: "application/other",
          label: localize(18279, null),
          settings: ["application.*"],
          hide: isWindows
        }
      ]
    },
    {
      id: "security",
      label: localize(18287, null),
      settings: ["security.*"],
      children: [
        {
          id: "security/workspace",
          label: localize(18300, null),
          settings: ["security.workspace.*"]
        }
      ]
    }
  ]
};
export { getCommonlyUsedData, COMMONLY_USED_SETTINGS, tocData };
