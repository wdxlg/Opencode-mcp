// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent.ts
import { product_default } from "./module-0139.mjs";
import { theme_picker_default } from "./module-3489.mjs";
import { theme_picker_small_default } from "./module-3490.mjs";
import { notebookProfile_default } from "./module-3491.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { NotebookSetting } from "./module-0909.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent.ts
var defaultChat8 = {
  documentationUrl: product_default.defaultChatAgent?.documentationUrl ?? "",
  provider: product_default.defaultChatAgent?.provider ?? { default: { name: "" } },
  publicCodeMatchesUrl: product_default.defaultChatAgent?.publicCodeMatchesUrl ?? "",
  termsStatementUrl: product_default.defaultChatAgent?.termsStatementUrl ?? "",
  privacyStatementUrl: product_default.defaultChatAgent?.privacyStatementUrl ?? ""
};

var GettingStartedContentProviderRegistry = class {
  constructor() {
    this.providers = /* @__PURE__ */ new Map();
  }
  registerProvider(moduleId, provider) {
    this.providers.set(moduleId, provider);
  }
  getProvider(moduleId) {
    return this.providers.get(moduleId);
  }
};

var gettingStartedContentRegistry = new GettingStartedContentProviderRegistry();

gettingStartedContentRegistry.registerProvider("vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker", theme_picker_default);

gettingStartedContentRegistry.registerProvider("vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker_small", theme_picker_small_default);

gettingStartedContentRegistry.registerProvider("vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile", notebookProfile_default);

gettingStartedContentRegistry.registerProvider("vs/workbench/contrib/welcomeGettingStarted/common/media/empty", () => "");

var setupIcon = registerIcon("getting-started-setup", Codicon.zap, localize(22008, null));

var beginnerIcon = registerIcon("getting-started-beginner", Codicon.lightbulb, localize(22007, null));

var startEntries = [
  {
    id: "welcome.showNewFileEntries",
    title: localize(22051, null),
    description: localize(22050, null),
    icon: Codicon.newFile,
    content: {
      type: "startEntry",
      command: "command:welcome.showNewFileEntries"
    }
  },
  {
    id: "topLevelOpenMac",
    title: localize(22063, null),
    description: localize(22062, null),
    icon: Codicon.folderOpened,
    when: "!isWeb && isMac",
    content: {
      type: "startEntry",
      command: "command:workbench.action.files.openFileFolder"
    }
  },
  {
    id: "topLevelOpenFile",
    title: localize(22059, null),
    description: localize(22058, null),
    icon: Codicon.goToFile,
    when: "isWeb || !isMac",
    content: {
      type: "startEntry",
      command: "command:workbench.action.files.openFile"
    }
  },
  {
    id: "topLevelOpenFolder",
    title: localize(22061, null),
    description: localize(22060, null),
    icon: Codicon.folderOpened,
    when: "!isWeb && !isMac",
    content: {
      type: "startEntry",
      command: "command:workbench.action.files.openFolder"
    }
  },
  {
    id: "topLevelOpenFolderWeb",
    title: localize(22061, null),
    description: localize(22060, null),
    icon: Codicon.folderOpened,
    when: "!openFolderWorkspaceSupport && workbenchState == 'workspace'",
    content: {
      type: "startEntry",
      command: "command:workbench.action.files.openFolderViaWorkspace"
    }
  },
  {
    id: "topLevelGitClone",
    title: localize(22091, null),
    description: localize(22090, null),
    when: "config.git.enabled && !git.missing",
    icon: Codicon.sourceControl,
    content: {
      type: "startEntry",
      command: "command:git.clone"
    }
  },
  {
    id: "topLevelGitOpen",
    title: localize(22093, null),
    description: localize(22092, null),
    when: "workspacePlatform == 'webworker'",
    icon: Codicon.sourceControl,
    content: {
      type: "startEntry",
      command: "command:remoteHub.openRepository"
    }
  },
  {
    id: "topLevelRemoteOpen",
    title: localize(22097, null),
    description: localize(22096, null),
    when: "!isWeb",
    icon: Codicon.remote,
    content: {
      type: "startEntry",
      command: "command:workbench.action.remote.showMenu"
    }
  },
  {
    id: "topLevelOpenTunnel",
    title: localize(22095, null),
    description: localize(22094, null),
    when: "isWeb && showRemoteStartEntryInWeb",
    icon: Codicon.remote,
    content: {
      type: "startEntry",
      command: "command:workbench.action.remote.showWebStartEntryActions"
    }
  },
  {
    id: "topLevelNewWorkspaceChat",
    title: localize(22053, null),
    description: localize(22052, null),
    icon: Codicon.chatSparkle,
    when: "!isWeb && !chatSetupHidden && !chatSetupDisabledInWorkspace",
    content: {
      type: "startEntry",
      command: "command:welcome.newWorkspaceChat"
    }
  }
];

var Button2 = (title, href) => `[${title}](${href})`;

var CopilotStepTitle = localize(22028, null);

var CopilotDescription = localize(22026, null, defaultChat8.documentationUrl ?? "");

var CopilotTermsString = localize(22027, null, defaultChat8.provider.default.name, defaultChat8.provider.default.name, defaultChat8.termsStatementUrl, defaultChat8.privacyStatementUrl);

var CopilotAnonymousButton = Button2(localize(22120, null), `command:workbench.action.chat.triggerSetupAnonymousWithoutDialog`);

var CopilotSignedOutButton = Button2(localize(22120, null), `command:workbench.action.chat.triggerSetup`);

var CopilotSignedInButton = Button2(localize(22120, null), `command:workbench.action.chat.triggerSetup`);

var CopilotCompleteButton = Button2(localize(22119, null), "command:workbench.action.chat.open");

function createCopilotSetupStep(id2, button, when, includeTerms) {
  const description = includeTerms ? `${CopilotDescription}
${CopilotTermsString}
${button}` : `${CopilotDescription}
${button}`;
  return {
    id: id2,
    title: CopilotStepTitle,
    description,
    when: `${when} && !chatSetupHidden && !chatSetupDisabledInWorkspace`,
    media: {
      type: "svg",
      altText: "VS Code Copilot multi file edits",
      path: "multi-file-edits.svg"
    }
  };
}

var walkthroughs = [
  {
    id: "OpenCodeLinux",
    title: localize(22148, null),
    description: localize(22146, null),
    isFeatured: true,
    icon: setupIcon,
    when: "isLinux && !isWeb",
    walkthroughPageTitle: localize(22147, null),
    content: {
      type: "steps",
      steps: [
        {
          id: "opencodeLinuxOpenProject",
          title: localize(22145, null),
          description: localize(22139, null, Button2(localize(22140, null), "command:workbench.action.files.openFolder")),
          completionEvents: ["onContext:workbenchState != empty"],
          media: { type: "svg", path: "openFolder.svg", altText: localize(22138, null) }
        },
        {
          id: "opencodeLinuxRevealProject",
          title: localize(22144, null),
          description: localize(22142, null, Button2(localize(22143, null), "command:workbench.action.files.revealActiveFileInWindows")),
          // The Welcome editor has no file resource, so this upstream action reveals the first workspace folder.
          when: "isLinux && !isWeb && workspaceFolderCount > 0 && !remoteName && !virtualWorkspace",
          completionEvents: ["onCommand:workbench.action.files.revealActiveFileInWindows"],
          media: { type: "svg", path: "openFolder.svg", altText: localize(22141, null) }
        },
        {
          id: "opencodeLinuxWorkspaceTrust",
          title: localize(22152, null),
          description: localize(22150, null, Button2(localize(22151, null), "command:workbench.trust.manage")),
          completionEvents: ["onContext:isWorkspaceTrusted"],
          media: { type: "svg", path: "workspaceTrust.svg", altText: localize(22149, null) }
        },
        {
          id: "opencodeLinuxConfigureModels",
          title: localize(22137, null),
          description: localize(22136, null, Button2(localize(22134, null), "command:aiCustomization.openManagementEditor?%5B%22models%22%5D"), Button2(localize(22135, null), "command:aiCustomization.openManagementEditor?%5B%22codex%22%5D")),
          completionEvents: ["onContext:chatSessionHasModels"],
          media: { type: "svg", path: "settings.svg", altText: localize(22133, null) }
        },
        {
          id: "opencodeLinuxStartChat",
          title: localize(22132, null),
          description: localize(22130, null, Button2(localize(22131, null), "command:workbench.action.chat.open")),
          completionEvents: ["onCommand:workbench.action.chat.open"],
          media: { type: "svg", path: "multi-file-edits.svg", altText: localize(22129, null) }
        }
      ]
    }
  },
  {
    id: "SetupWeb",
    title: localize(22082, null),
    description: localize(22081, null),
    isFeatured: true,
    icon: setupIcon,
    when: "isWeb",
    next: "Beginner",
    walkthroughPageTitle: localize(22083, null),
    content: {
      type: "steps",
      steps: [
        {
          id: "pickColorThemeWeb",
          title: localize(22065, null),
          description: localize(22064, null, Button2(localize(22155, null), "command:workbench.action.selectTheme")),
          completionEvents: [
            "onSettingChanged:workbench.colorTheme",
            "onCommand:workbench.action.selectTheme"
          ],
          media: { type: "markdown", path: "theme_picker" }
        },
        {
          id: "menuBarWeb",
          title: localize(22049, null),
          description: localize(22048, null, Button2(localize(22159, null), "command:workbench.action.toggleMenuBar")),
          when: "isWeb",
          media: {
            type: "svg",
            altText: "Comparing menu dropdown with the visible menu bar.",
            path: "menuBar.svg"
          }
        },
        {
          id: "extensionsWebWeb",
          title: localize(22034, null),
          description: localize(22035, null, Button2(localize(22002, null), "command:workbench.extensions.action.showPopularExtensions")),
          when: "workspacePlatform == 'webworker'",
          media: {
            type: "svg",
            altText: "VS Code extension marketplace with featured language extensions",
            path: "extensions-web.svg"
          }
        },
        {
          id: "findLanguageExtensionsWeb",
          title: localize(22037, null),
          description: localize(22036, null, Button2(localize(22000, null), "command:workbench.extensions.action.showLanguageExtensions")),
          when: "workspacePlatform != 'webworker'",
          media: {
            type: "svg",
            altText: "Language extensions",
            path: "languages.svg"
          }
        },
        {
          id: "settingsSyncWeb",
          title: localize(22075, null),
          description: localize(22074, null, Button2(localize(22005, null), "command:workbench.userDataSync.actions.turnOn")),
          when: "syncStatus != uninitialized",
          completionEvents: ["onEvent:sync-enabled"],
          media: {
            type: "svg",
            altText: 'The "Turn on Sync" entry in the settings gear menu.',
            path: "settingsSync.svg"
          }
        },
        {
          id: "commandPaletteTaskWeb",
          title: localize(22023, null),
          description: localize(22022, null, Button2(localize(22004, null), "command:workbench.action.showCommands")),
          media: { type: "svg", altText: "Command Palette overlay for searching and executing commands.", path: "commandPalette.svg" }
        },
        {
          id: "pickAFolderTask-WebWeb",
          title: localize(22076, null),
          description: localize(22077, null, Button2(localize(22110, null), "command:workbench.action.addRootFolder"), Button2(localize(22112, null), "command:remoteHub.openRepository")),
          when: "workspaceFolderCount == 0",
          media: {
            type: "svg",
            altText: "Explorer view showing buttons for opening folder and cloning repository.",
            path: "openFolder.svg"
          }
        },
        {
          id: "quickOpenWeb",
          title: localize(22067, null),
          description: localize(22066, null, Button2(localize(22115, null), "command:toSide:workbench.action.quickOpen")),
          when: "workspaceFolderCount != 0",
          media: {
            type: "svg",
            altText: "Go to file in quick search.",
            path: "search.svg"
          }
        }
      ]
    }
  },
  {
    id: "SetupAccessibility",
    title: localize(22079, null),
    description: localize(22078, null),
    isFeatured: true,
    icon: setupIcon,
    when: CONTEXT_ACCESSIBILITY_MODE_ENABLED.key,
    next: "Setup",
    walkthroughPageTitle: localize(22080, null),
    content: {
      type: "steps",
      steps: [
        {
          id: "accessibilityHelp",
          title: localize(22010, null),
          description: localize(22009, null, Button2(localize(22107, null), "command:editor.action.accessibilityHelp")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "accessibleView",
          title: localize(22016, null),
          description: localize(22015, null, Button2(localize(22109, null), "command:editor.action.accessibleView")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "verbositySettings",
          title: localize(22099, null),
          description: localize(22098, null, Button2(localize(22114, null), "command:workbench.action.openAccessibilitySettings")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "commandPaletteTaskAccessibility",
          title: localize(22025, null),
          description: localize(22024, null, Button2(localize(22004, null), "command:workbench.action.showCommands")),
          media: { type: "markdown", path: "empty" }
        },
        {
          id: "keybindingsAccessibility",
          title: localize(22047, null),
          description: localize(22046, null, Button2(localize(22104, null), "command:toSide:workbench.action.openGlobalKeybindings")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "accessibilitySignals",
          title: localize(22014, null),
          description: localize(22013, null, Button2(localize(22106, null), "command:signals.sounds.help"), Button2(localize(22105, null), "command:accessibility.announcement.help")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "hover",
          title: localize(22041, null),
          description: localize(22040, null, Button2(localize(22121, null), "command:editor.action.showHover")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "goToSymbol",
          title: localize(22039, null),
          description: localize(22038, null, Button2(localize(22111, null), "command:editor.action.goToSymbol")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "codeFolding",
          title: localize(22021, null),
          description: localize(22020, null, Button2(localize(22157, null), "command:editor.toggleFold"), Button2(localize(22158, null), "command:editor.toggleFoldRecursively")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "intellisense",
          title: localize(22045, null),
          description: localize(22044, null, Button2(localize(22161, null), "command:editor.action.triggerSuggest"), Button2(localize(22160, null), "command:editor.action.inlineSuggest.trigger")),
          media: {
            type: "markdown",
            path: "empty"
          }
        },
        {
          id: "accessibilitySettings",
          title: localize(22012, null),
          description: localize(22011, null, Button2(localize(22108, null), "command:workbench.action.openAccessibilitySettings")),
          media: { type: "markdown", path: "empty" }
        },
        {
          id: "dictation",
          title: localize(22032, null),
          description: localize(22031, null, Button2(localize(22156, null), "command:workbench.action.editorDictation.start"), Button2(localize(22153, null), "command:workbench.action.terminal.startVoice"), Button2(localize(22154, null), "command:workbench.action.terminal.stopVoice")),
          when: "hasSpeechProvider",
          media: { type: "markdown", path: "empty" }
        }
      ]
    }
  },
  {
    id: "Beginner",
    isFeatured: false,
    title: localize(22018, null),
    icon: beginnerIcon,
    description: localize(22017, null),
    walkthroughPageTitle: localize(22019, null),
    content: {
      type: "steps",
      steps: [
        {
          id: "settingsAndSync",
          title: localize(22072, null),
          description: localize(22073, null, Button2(localize(22162, null), "command:toSide:workbench.action.openSettings")),
          when: "workspacePlatform != 'webworker' && syncStatus != uninitialized",
          completionEvents: ["onEvent:sync-enabled"],
          media: {
            type: "svg",
            altText: "VS Code Settings",
            path: "settings.svg"
          }
        },
        {
          id: "extensions",
          title: localize(22034, null),
          description: localize(22033, null, Button2(localize(22001, null), "command:workbench.extensions.action.showPopularExtensions")),
          when: "workspacePlatform != 'webworker'",
          media: {
            type: "svg",
            altText: "VS Code extension marketplace with featured language extensions",
            path: "extensions.svg"
          }
        },
        {
          id: "terminal",
          title: localize(22089, null),
          description: localize(22088, null, Button2(localize(22122, null), "command:workbench.action.terminal.toggleTerminal")),
          when: "workspacePlatform != 'webworker' && remoteName != codespaces && !terminalIsOpen",
          media: {
            type: "svg",
            altText: "Integrated terminal running a few npm commands",
            path: "terminal.svg"
          }
        },
        {
          id: "debugging",
          title: localize(22030, null),
          description: localize(22029, null, Button2(localize(22116, null), "command:workbench.action.debug.selectandstart")),
          when: "workspacePlatform != 'webworker' && workspaceFolderCount != 0",
          media: {
            type: "svg",
            altText: "Run and debug view.",
            path: "debug.svg"
          }
        },
        {
          id: "scmClone",
          title: localize(22069, null),
          description: localize(22070, null, Button2(localize(22003, null), "command:git.clone")),
          when: "config.git.enabled && !git.missing && workspaceFolderCount == 0",
          media: {
            type: "svg",
            altText: "Source Control view.",
            path: "git.svg"
          }
        },
        {
          id: "scmSetup",
          title: localize(22069, null),
          description: localize(22071, null, Button2(localize(22102, null), "command:git.init")),
          when: "config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount == 0",
          media: {
            type: "svg",
            altText: "Source Control view.",
            path: "git.svg"
          }
        },
        {
          id: "scm",
          title: localize(22069, null),
          description: localize(22068, null, Button2(localize(22113, null), "command:workbench.view.scm")),
          when: "config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount != 0 && activeViewlet != 'workbench.view.scm'",
          media: {
            type: "svg",
            altText: "Source Control view.",
            path: "git.svg"
          }
        },
        {
          id: "installGit",
          title: localize(22043, null),
          description: localize(22042, null, Button2(localize(22103, null), "https://aka.ms/vscode-install-git"), "[", "](command:workbench.action.reloadWindow)"),
          when: "git.missing",
          media: {
            type: "svg",
            altText: "Install Git.",
            path: "git.svg"
          },
          completionEvents: [
            "onContext:git.state == initialized"
          ]
        },
        {
          id: "tasks",
          title: localize(22087, null),
          when: "workspaceFolderCount != 0 && workspacePlatform != 'webworker'",
          description: localize(22086, null, Button2(localize(22117, null), "command:workbench.action.tasks.runTask")),
          media: {
            type: "svg",
            altText: "Task runner.",
            path: "runTask.svg"
          }
        },
        {
          id: "shortcuts",
          title: localize(22085, null),
          description: localize(22084, null, Button2(localize(22104, null), "command:toSide:workbench.action.openGlobalKeybindings")),
          media: {
            type: "svg",
            altText: "Interactive shortcuts.",
            path: "shortcuts.svg"
          }
        },
        {
          id: "workspaceTrust",
          title: localize(22101, null),
          description: localize(22100, null, Button2(localize(22163, null), "https://code.visualstudio.com/docs/editor/workspace-trust"), Button2(localize(22006, null), "command:toSide:workbench.trust.manage")),
          when: "workspacePlatform != 'webworker' && !isWorkspaceTrusted && workspaceFolderCount == 0",
          media: {
            type: "svg",
            altText: "Workspace Trust editor in Restricted mode and a primary button for switching to Trusted mode.",
            path: "workspaceTrust.svg"
          }
        }
      ]
    }
  },
  {
    id: "notebooks",
    title: localize(22054, null),
    description: "",
    icon: setupIcon,
    isFeatured: false,
    when: `config.${NotebookSetting.openGettingStarted} && userHasOpenedNotebook`,
    walkthroughPageTitle: localize(22055, null),
    content: {
      type: "steps",
      steps: [
        {
          completionEvents: ["onCommand:notebook.setProfile"],
          id: "notebookProfile",
          title: localize(22057, null),
          description: localize(22056, null),
          when: "userHasOpenedNotebook",
          media: {
            type: "markdown",
            path: "notebookProfile"
          }
        }
      ]
    }
  }
];
export { createCopilotSetupStep, defaultChat8, GettingStartedContentProviderRegistry, gettingStartedContentRegistry, setupIcon, beginnerIcon, startEntries, Button2, CopilotStepTitle, CopilotDescription, CopilotTermsString, CopilotAnonymousButton, CopilotSignedOutButton, CopilotSignedInButton, CopilotCompleteButton, walkthroughs };
