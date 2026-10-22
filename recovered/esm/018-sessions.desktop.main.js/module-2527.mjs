// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/createPluginAction.ts
import { localize, localize2 } from "./module-0001.mjs";
import { basename2, dirname2, joinPath } from "./module-0034.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { InstalledAgentPluginsViewId } from "./module-0982.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotificationService } from "./module-0336.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { parse12 } from "./module-2175.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/actions/createPluginAction.ts
var VALID_PLUGIN_NAME = /^[a-z0-9]([a-z0-9\-.]*[a-z0-9])?$/;

var INVALID_CONSECUTIVE = /--|[.][.]/;

function validatePluginName(name) {
  if (!name) {
    return localize(8855, null);
  }
  if (name.length > 64) {
    return localize(8856, null);
  }
  if (!VALID_PLUGIN_NAME.test(name)) {
    return localize(8853, null);
  }
  if (INVALID_CONSECUTIVE.test(name)) {
    return localize(8852, null);
  }
  return void 0;
}

function isUserDefined(storage) {
  return storage === "local" /* local */ || storage === "user" /* user */;
}

function isUserDefinedMcpCollection(collection) {
  const order = collection.order;
  return order === 200 /* User */ || order === 0 /* WorkspaceFolder */ || order === 100 /* Workspace */;
}

function getResourceLabel2(r2) {
  if (r2.name) {
    return r2.name;
  }
  if (r2.type === "skill" /* skill */ && basename2(r2.uri).toLowerCase() === "skill.md") {
    return basename2(dirname2(r2.uri));
  }
  return basename2(r2.uri);
}

function getResourceFileName(r2) {
  const label3 = getResourceLabel2(r2);
  const colonIndex = label3.indexOf(":");
  return colonIndex >= 0 ? label3.substring(colonIndex + 1) : label3;
}

var CreatePluginAction = class _CreatePluginAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.createPlugin";
  }
  constructor() {
    super({
      id: _CreatePluginAction.ID,
      title: localize2(8844, "Create Plugin"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatContextKeys.enabled,
      icon: Codicon.save,
      menu: [{
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", InstalledAgentPluginsViewId),
          ChatContextKeys.Setup.hidden.negate(),
          ChatContextKeys.Setup.disabledInWorkspace.negate()
        ),
        group: "navigation",
        order: 2
      }]
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const promptsService = accessor.get(IPromptsService);
    const mcpRegistry = accessor.get(IMcpRegistry);
    const fileDialogService = accessor.get(IFileDialogService);
    const fileService = accessor.get(IFileService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const [instructions, prompts, agents, skills, hooks] = await (async () => {
      const cts = new CancellationTokenSource();
      try {
        return await Promise.all([
          promptsService.listPromptFiles("instructions" /* instructions */, cts.token),
          promptsService.listPromptFiles("prompt" /* prompt */, cts.token),
          promptsService.listPromptFiles("agent" /* agent */, cts.token),
          promptsService.listPromptFiles("skill" /* skill */, cts.token),
          promptsService.listPromptFiles("hook" /* hook */, cts.token)
        ]);
      } finally {
        cts.dispose(true);
      }
    })();
    const mcpCollections = mcpRegistry.collections.get();
    let showAll = false;
    const buildTree = () => {
      const groups = [];
      const addGroup = (resources, resourceType, groupLabel, icon2) => {
        const filtered = showAll ? resources : resources.filter((r2) => isUserDefined(r2.storage));
        if (filtered.length === 0) {
          return;
        }
        const children = filtered.map((r2) => ({
          label: getResourceLabel2(r2),
          description: r2.storage,
          resourceType,
          promptPath: r2,
          checked: false
        }));
        groups.push({
          label: groupLabel,
          iconClass: ThemeIcon.asClassName(icon2),
          checked: void 0,
          collapsed: false,
          pickable: false,
          children
        });
      };
      addGroup(instructions, "instruction", localize(8847, null), Codicon.book);
      addGroup(prompts, "prompt", localize(8857, null), Codicon.comment);
      addGroup(agents, "agent", localize(8843, null), Codicon.copilot);
      addGroup(skills, "skill", localize(8862, null), Codicon.lightbulb);
      addGroup(hooks, "hook", localize(8846, null), Codicon.zap);
      const mcpChildren = [];
      for (const collection of mcpCollections) {
        if (!showAll && !isUserDefinedMcpCollection(collection)) {
          continue;
        }
        const defs = collection.serverDefinitions.get();
        for (const def2 of defs) {
          mcpChildren.push({
            label: def2.label,
            description: collection.label,
            resourceType: "mcp",
            mcpServer: { collection, definition: def2 },
            checked: false
          });
        }
      }
      if (mcpChildren.length > 0) {
        groups.push({
          label: localize(8848, null),
          iconClass: ThemeIcon.asClassName(Codicon.mcp),
          checked: void 0,
          collapsed: false,
          pickable: false,
          children: mcpChildren
        });
      }
      return groups;
    };
    const disposables = new DisposableStore();
    const tree = disposables.add(quickInputService.createQuickTree());
    tree.placeholder = localize(8860, null);
    tree.matchOnDescription = true;
    tree.matchOnLabel = true;
    tree.sortByLabel = false;
    tree.title = localize(8845, null);
    tree.setItemTree(buildTree());
    const toggleButton = { iconClass: ThemeIcon.asClassName(Codicon.filter), tooltip: localize(8861, null) };
    tree.buttons = [toggleButton];
    disposables.add(tree.onDidTriggerButton((button) => {
      if (button === toggleButton) {
        showAll = !showAll;
        tree.setItemTree(buildTree());
      }
    }));
    const selectedItems = await new Promise((resolve3) => {
      disposables.add(tree.onDidAccept(() => {
        resolve3(tree.checkedLeafItems);
        tree.hide();
      }));
      disposables.add(tree.onDidHide(() => {
        resolve3(void 0);
      }));
      tree.show();
    });
    disposables.dispose();
    if (!selectedItems || selectedItems.length === 0) {
      return;
    }
    const selected = selectedItems.filter((i2) => !!i2.resourceType);
    const pluginName = await quickInputService.input({
      prompt: localize(8854, null),
      placeHolder: "my-plugin",
      validateInput: async (value2) => validatePluginName(value2)
    });
    if (!pluginName) {
      return;
    }
    const folderUris = await fileDialogService.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      title: localize(8859, null),
      openLabel: localize(8858, null)
    });
    if (!folderUris || folderUris.length === 0) {
      return;
    }
    const targetDir = folderUris[0];
    const pluginRoot = joinPath(targetDir, pluginName);
    if (await fileService.exists(pluginRoot)) {
      notificationService.error(localize(8851, null, pluginName));
      return;
    }
    try {
      await writePluginToDisk(fileService, pluginRoot, pluginName, selected);
      await updateMarketplaceIfNeeded(fileService, targetDir, pluginName);
      try {
        await commandService.executeCommand("revealFileInOS", pluginRoot);
      } catch {
      }
      notificationService.info(localize(8849, null, pluginName));
    } catch (err) {
      notificationService.error(localize(8850, null, String(err)));
    }
  }
};

async function writePluginToDisk(fileService, pluginRoot, pluginName, selected) {
  await fileService.createFolder(pluginRoot);
  const manifestDir = joinPath(pluginRoot, ".plugin");
  await fileService.createFolder(manifestDir);
  const manifest = {
    name: pluginName,
    version: "1.0.0",
    description: ""
  };
  await fileService.writeFile(joinPath(manifestDir, "plugin.json"), VSBuffer.fromString(JSON.stringify(manifest, null, "	")));
  const byType = {
    instruction: selected.filter((i2) => i2.resourceType === "instruction"),
    prompt: selected.filter((i2) => i2.resourceType === "prompt"),
    agent: selected.filter((i2) => i2.resourceType === "agent"),
    skill: selected.filter((i2) => i2.resourceType === "skill"),
    hook: selected.filter((i2) => i2.resourceType === "hook"),
    mcp: selected.filter((i2) => i2.resourceType === "mcp")
  };
  if (byType.instruction.length > 0) {
    const rulesDir = joinPath(pluginRoot, "rules");
    await fileService.createFolder(rulesDir);
    for (const item of byType.instruction) {
      if (!item.promptPath) {
        continue;
      }
      const name = getResourceFileName(item.promptPath);
      const fileName = name.endsWith(".instructions.md") || name.endsWith(".mdc") || name.endsWith(".md") ? name : name + ".instructions.md";
      const content = await fileService.readFile(item.promptPath.uri);
      await fileService.writeFile(joinPath(rulesDir, fileName), content.value);
    }
  }
  if (byType.prompt.length > 0) {
    const commandsDir = joinPath(pluginRoot, "commands");
    await fileService.createFolder(commandsDir);
    for (const item of byType.prompt) {
      if (!item.promptPath) {
        continue;
      }
      const name = getResourceFileName(item.promptPath);
      const fileName = name.endsWith(".md") ? name : name + ".md";
      const content = await fileService.readFile(item.promptPath.uri);
      await fileService.writeFile(joinPath(commandsDir, fileName), content.value);
    }
  }
  if (byType.agent.length > 0) {
    const agentsDir = joinPath(pluginRoot, "agents");
    await fileService.createFolder(agentsDir);
    for (const item of byType.agent) {
      if (!item.promptPath) {
        continue;
      }
      const name = getResourceFileName(item.promptPath);
      const fileName = name.endsWith(".md") ? name : name + ".md";
      const content = await fileService.readFile(item.promptPath.uri);
      await fileService.writeFile(joinPath(agentsDir, fileName), content.value);
    }
  }
  if (byType.skill.length > 0) {
    const skillsDir = joinPath(pluginRoot, "skills");
    await fileService.createFolder(skillsDir);
    for (const item of byType.skill) {
      if (!item.promptPath) {
        continue;
      }
      const sourceUri = item.promptPath.uri;
      const skillName = getResourceFileName(item.promptPath);
      const sourceName = basename2(sourceUri);
      const isFile2 = sourceName.toLowerCase() === "skill.md";
      const skillSourceDir = isFile2 ? joinPath(sourceUri, "..") : sourceUri;
      const destSkillDir = joinPath(skillsDir, skillName);
      await copyDirectory(fileService, skillSourceDir, destSkillDir);
    }
  }
  if (byType.hook.length > 0) {
    const hooksDir = joinPath(pluginRoot, "hooks");
    await fileService.createFolder(hooksDir);
    const mergedHooks = {};
    for (const item of byType.hook) {
      if (!item.promptPath) {
        continue;
      }
      try {
        const content = await fileService.readFile(item.promptPath.uri);
        const parsed = parse12(content.value.toString());
        const hooksObj = parsed?.hooks ?? parsed;
        if (hooksObj && typeof hooksObj === "object") {
          for (const [hookType, commands] of Object.entries(hooksObj)) {
            if (Array.isArray(commands)) {
              if (!mergedHooks[hookType]) {
                mergedHooks[hookType] = [];
              }
              for (const cmd of commands) {
                mergedHooks[hookType].push(serializeHookCommand(cmd));
              }
            }
          }
        }
      } catch {
      }
    }
    const hooksJson = { hooks: mergedHooks };
    await fileService.writeFile(
      joinPath(hooksDir, "hooks.json"),
      VSBuffer.fromString(JSON.stringify(hooksJson, null, "	"))
    );
  }
  if (byType.mcp.length > 0) {
    const mcpServers = {};
    for (const item of byType.mcp) {
      if (!item.mcpServer) {
        continue;
      }
      const def2 = item.mcpServer.definition;
      mcpServers[def2.label] = serializeMcpLaunch(def2.launch);
    }
    const mcpJson = { mcpServers };
    await fileService.writeFile(
      joinPath(pluginRoot, ".mcp.json"),
      VSBuffer.fromString(JSON.stringify(mcpJson, null, "	"))
    );
  }
}

function serializeHookCommand(cmd) {
  const result = { type: "command" };
  if (typeof cmd.command === "string") {
    result["command"] = cmd.command;
  }
  if (typeof cmd.windows === "string") {
    result["windows"] = cmd.windows;
  }
  if (typeof cmd.linux === "string") {
    result["linux"] = cmd.linux;
  }
  if (typeof cmd.osx === "string") {
    result["osx"] = cmd.osx;
  }
  if (cmd.cwd !== void 0) {
    result["cwd"] = isUriComponents(cmd.cwd) ? URI.revive(cmd.cwd).fsPath : String(cmd.cwd);
  }
  if (cmd.env && typeof cmd.env === "object" && Object.keys(cmd.env).length > 0) {
    result["env"] = cmd.env;
  }
  if (typeof cmd.timeout === "number") {
    result["timeout"] = cmd.timeout;
  }
  return result;
}

function serializeMcpLaunch(launch) {
  if (launch.type === 1 /* Stdio */) {
    const result = {
      type: "stdio",
      command: launch.command
    };
    if (launch.args.length > 0) {
      result["args"] = [...launch.args];
    }
    if (launch.cwd) {
      result["cwd"] = launch.cwd;
    }
    if (Object.keys(launch.env).length > 0) {
      result["env"] = { ...launch.env };
    }
    return result;
  } else {
    const result = {
      type: "http",
      url: launch.uri.toString()
    };
    if (launch.headers.length > 0) {
      const headers = {};
      for (const [key3, value2] of launch.headers) {
        headers[key3] = value2;
      }
      result["headers"] = headers;
    }
    return result;
  }
}

async function copyDirectory(fileService, source, target) {
  const stat = await fileService.resolve(source);
  if (stat.isDirectory) {
    await fileService.createFolder(target);
    if (stat.children) {
      for (const child of stat.children) {
        const childName = basename2(child.resource);
        await copyDirectory(fileService, child.resource, joinPath(target, childName));
      }
    }
  } else {
    const content = await fileService.readFile(source);
    await fileService.writeFile(target, content.value);
  }
}

var MARKETPLACE_PATHS = [
  "marketplace.json",
  ".plugin/marketplace.json"
];

async function updateMarketplaceIfNeeded(fileService, targetDir, pluginName) {
  for (const relPath of MARKETPLACE_PATHS) {
    const marketplaceUri = joinPath(targetDir, relPath);
    if (await fileService.exists(marketplaceUri)) {
      try {
        const content = await fileService.readFile(marketplaceUri);
        const marketplace = parse12(content.value.toString());
        if (marketplace && typeof marketplace === "object") {
          if (!Array.isArray(marketplace["plugins"])) {
            marketplace["plugins"] = [];
          }
          const plugins = marketplace["plugins"];
          if (plugins.some((p) => p.name === pluginName)) {
            return;
          }
          plugins.push({
            name: pluginName,
            source: `./${pluginName}/`
          });
          await fileService.writeFile(
            marketplaceUri,
            VSBuffer.fromString(JSON.stringify(marketplace, null, "	"))
          );
        }
      } catch {
      }
      return;
    }
  }
}

function registerCreatePluginAction() {
  const store = new DisposableStore();
  store.add(registerAction2(CreatePluginAction));
  return store;
}
export { validatePluginName, isUserDefined, isUserDefinedMcpCollection, getResourceLabel2, getResourceFileName, writePluginToDisk, serializeHookCommand, serializeMcpLaunch, copyDirectory, updateMarketplaceIfNeeded, registerCreatePluginAction, VALID_PLUGIN_NAME, INVALID_CONSECUTIVE, CreatePluginAction, MARKETPLACE_PATHS };
