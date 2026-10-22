// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/workspaceCommands.ts
import { localize, localize2 } from "./module-0001.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";
import { IWorkspaceContextService, hasWorkspaceFileExtension } from "./module-0509.mjs";
import { IPathService } from "./module-0938.mjs";
import { mnemonicButtonLabel } from "./module-0711.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { dirname2 } from "./module-0034.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { IWorkspacesService } from "./module-1379.mjs";


// src/vs/workbench/browser/actions/workspaceCommands.ts
var ADD_ROOT_FOLDER_COMMAND_ID = "addRootFolder";

var ADD_ROOT_FOLDER_LABEL = localize2(6186, "Add Folder to Workspace...");

var SET_ROOT_FOLDER_COMMAND_ID = "setRootFolder";

var PICK_WORKSPACE_FOLDER_COMMAND_ID = "_workbench.pickWorkspaceFolder";

CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFileFolderInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickFileFolderAndOpen({ forceNewWindow: true })
});

CommandsRegistry.registerCommand({
  id: "_files.pickFolderAndOpen",
  handler: (accessor, options3) => accessor.get(IFileDialogService).pickFolderAndOpen(options3)
});

CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFolderInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickFolderAndOpen({ forceNewWindow: true })
});

CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFileInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickFileAndOpen({ forceNewWindow: true })
});

CommandsRegistry.registerCommand({
  id: "workbench.action.openWorkspaceInNewWindow",
  handler: (accessor) => accessor.get(IFileDialogService).pickWorkspaceAndOpen({ forceNewWindow: true })
});

CommandsRegistry.registerCommand({
  id: ADD_ROOT_FOLDER_COMMAND_ID,
  handler: async (accessor) => {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const folders = await selectWorkspaceFolders(accessor);
    if (!folders?.length) {
      return;
    }
    await workspaceEditingService.addFolders(folders.map((folder) => ({ uri: folder })));
  }
});

CommandsRegistry.registerCommand({
  id: SET_ROOT_FOLDER_COMMAND_ID,
  handler: async (accessor) => {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const contextService = accessor.get(IWorkspaceContextService);
    const folders = await selectWorkspaceFolders(accessor);
    if (!folders?.length) {
      return;
    }
    await workspaceEditingService.updateFolders(0, contextService.getWorkspace().folders.length, folders.map((folder) => ({ uri: folder })));
  }
});

async function selectWorkspaceFolders(accessor) {
  const dialogsService = accessor.get(IFileDialogService);
  const pathService = accessor.get(IPathService);
  const folders = await dialogsService.showOpenDialog({
    openLabel: mnemonicButtonLabel(localize(6185, null)),
    title: localize(6187, null),
    canSelectFolders: true,
    canSelectMany: true,
    defaultUri: await dialogsService.defaultFolderPath(),
    availableFileSystems: [pathService.defaultUriScheme]
  });
  return folders;
}

CommandsRegistry.registerCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, async function(accessor, args2) {
  const quickInputService = accessor.get(IQuickInputService);
  const labelService = accessor.get(ILabelService);
  const contextService = accessor.get(IWorkspaceContextService);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const folders = contextService.getWorkspace().folders;
  if (!folders.length) {
    return;
  }
  const folderPicks = folders.map((folder) => {
    const label3 = folder.name;
    const description = labelService.getUriLabel(dirname2(folder.uri), { relative: true });
    return {
      label: label3,
      description: description !== label3 ? description : void 0,
      // https://github.com/microsoft/vscode/issues/183418
      folder,
      iconClasses: getIconClasses(modelService, languageService, folder.uri, 2 /* ROOT_FOLDER */)
    };
  });
  const options3 = (args2 ? args2[0] : void 0) || /* @__PURE__ */ Object.create(null);
  if (!options3.activeItem) {
    options3.activeItem = folderPicks[0];
  }
  if (!options3.placeHolder) {
    options3.placeHolder = localize(6188, null);
  }
  if (typeof options3.matchOnDescription !== "boolean") {
    options3.matchOnDescription = true;
  }
  const token = (args2 ? args2[1] : void 0) || CancellationToken.None;
  const pick = await quickInputService.pick(folderPicks, options3, token);
  if (pick) {
    return folders[folderPicks.indexOf(pick)];
  }
  return;
});

CommandsRegistry.registerCommand({
  id: "vscode.openFolder",
  handler: (accessor, uriComponents, arg) => {
    const commandService = accessor.get(ICommandService);
    if (typeof arg === "boolean") {
      arg = { forceNewWindow: arg };
    }
    if (!uriComponents) {
      const options4 = {
        forceNewWindow: arg?.forceNewWindow
      };
      if (arg?.forceLocalWindow) {
        options4.remoteAuthority = null;
        options4.availableFileSystems = ["file"];
      }
      return commandService.executeCommand("_files.pickFolderAndOpen", options4);
    }
    const uri5 = URI.from(uriComponents, true);
    const options3 = {
      forceNewWindow: arg?.forceNewWindow,
      forceReuseWindow: arg?.forceReuseWindow,
      noRecentEntry: arg?.noRecentEntry,
      remoteAuthority: arg?.forceLocalWindow ? null : void 0,
      forceProfile: arg?.forceProfile,
      forceTempProfile: arg?.forceTempProfile
    };
    const workspaceToOpen = hasWorkspaceFileExtension(uri5) || uri5.scheme === Schemas.untitled ? { workspaceUri: uri5 } : { folderUri: uri5 };
    const filesToOpen = arg?.filesToOpen?.map((file) => ({ fileUri: URI.from(file, true) })) ?? [];
    return commandService.executeCommand("_files.windowOpen", [workspaceToOpen, ...filesToOpen], options3);
  },
  metadata: {
    description: "Open a folder or workspace in the current window or new window depending on the newWindow argument. Note that opening in the same window will shutdown the current extension host process and start a new one on the given folder/workspace unless the newWindow parameter is set to true.",
    args: [
      {
        name: "uri",
        description: "(optional) Uri of the folder or workspace file to open. If not provided, a native dialog will ask the user for the folder",
        constraint: (value2) => value2 === void 0 || value2 === null || value2 instanceof URI
      },
      {
        name: "options",
        description: "(optional) Options. Object with the following properties: `forceNewWindow`: Whether to open the folder/workspace in a new window or the same. Defaults to opening in the same window. `forceReuseWindow`: Whether to force opening the folder/workspace in the same window.  Defaults to false. `noRecentEntry`: Whether the opened URI will appear in the 'Open Recent' list. Defaults to false. `forceLocalWindow`: Whether to force opening the folder/workspace in a local window. Defaults to false. `forceProfile`: The profile to use when opening the folder/workspace. Defaults to the current profile. `forceTempProfile`: Whether to use a temporary profile when opening the folder/workspace. Defaults to false. `filesToOpen`: An array of files to open in the new window. Defaults to an empty array. Note, for backward compatibility, options can also be of type boolean, representing the `forceNewWindow` setting.",
        constraint: (value2) => value2 === void 0 || typeof value2 === "object" || typeof value2 === "boolean"
      }
    ]
  }
});

CommandsRegistry.registerCommand({
  id: "vscode.newWindow",
  handler: (accessor, options3) => {
    const commandService = accessor.get(ICommandService);
    const commandOptions = {
      forceReuseWindow: options3?.reuseWindow,
      remoteAuthority: options3?.remoteAuthority
    };
    return commandService.executeCommand("_files.newWindow", commandOptions);
  },
  metadata: {
    description: "Opens an new window depending on the newWindow argument.",
    args: [
      {
        name: "options",
        description: "(optional) Options. Object with the following properties: `reuseWindow`: Whether to open a new window or the same. Defaults to opening in a new window. ",
        constraint: (value2) => value2 === void 0 || typeof value2 === "object"
      }
    ]
  }
});

CommandsRegistry.registerCommand("_workbench.removeFromRecentlyOpened", function(accessor, uri5) {
  const workspacesService = accessor.get(IWorkspacesService);
  return workspacesService.removeRecentlyOpened([uri5]);
});

CommandsRegistry.registerCommand({
  id: "vscode.removeFromRecentlyOpened",
  handler: (accessor, path) => {
    const workspacesService = accessor.get(IWorkspacesService);
    if (typeof path === "string") {
      path = path.match(/^[^:/?#]+:\/\//) ? URI.parse(path) : URI.file(path);
    } else {
      path = URI.revive(path);
    }
    return workspacesService.removeRecentlyOpened([path]);
  },
  metadata: {
    description: "Removes an entry with the given path from the recently opened list.",
    args: [
      { name: "path", description: "URI or URI string to remove from recently opened.", constraint: (value2) => typeof value2 === "string" || value2 instanceof URI }
    ]
  }
});

CommandsRegistry.registerCommand("_workbench.addToRecentlyOpened", async function(accessor, recentEntry) {
  const workspacesService = accessor.get(IWorkspacesService);
  const uri5 = recentEntry.uri;
  const label3 = recentEntry.label;
  const remoteAuthority = recentEntry.remoteAuthority;
  let recent = void 0;
  if (recentEntry.type === "workspace") {
    const workspace = await workspacesService.getWorkspaceIdentifier(uri5);
    recent = { workspace, label: label3, remoteAuthority };
  } else if (recentEntry.type === "folder") {
    recent = { folderUri: uri5, label: label3, remoteAuthority };
  } else {
    recent = { fileUri: uri5, label: label3, remoteAuthority };
  }
  return workspacesService.addRecentlyOpened([recent]);
});

CommandsRegistry.registerCommand("_workbench.getRecentlyOpened", async function(accessor) {
  const workspacesService = accessor.get(IWorkspacesService);
  return workspacesService.getRecentlyOpened();
});
export { selectWorkspaceFolders, ADD_ROOT_FOLDER_COMMAND_ID, ADD_ROOT_FOLDER_LABEL, SET_ROOT_FOLDER_COMMAND_ID, PICK_WORKSPACE_FOLDER_COMMAND_ID };
