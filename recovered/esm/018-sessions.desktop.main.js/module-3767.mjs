// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/emptyFileEditorInput.ts
import { DockedEditorInput } from "./module-3585.mjs";
import { Codicon } from "./module-0085.mjs";
import { mainWindow } from "./module-0002.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/sessions/contrib/editor/browser/emptyFileEditorInput.ts
var EmptyFileEditorInput = class extends DockedEditorInput {
  constructor(_workspace, layoutService) {
    super();
    this._workspace = _workspace;
    this.layoutService = layoutService;
    this._register(layoutService.onDidChangePartVisibility((event) => {
      if (event.partId === "workbench.parts.editor" /* EDITOR_PART */) {
        this._onDidChangeLabel.fire();
        this._onDidChangeCapabilities.fire();
      }
    }));
  }
  static {
    this.ID = "workbench.editors.agentSessions.emptyFile";
  }
  static {
    this.EDITOR_ID = "workbench.editor.agentSessions.emptyFile";
  }
  static {
    this.ICON = Codicon.files;
  }
  get resource() {
    const workspaceFolderResource = this._workspace?.folders[0]?.workingDirectory;
    return this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) ? workspaceFolderResource : void 0;
  }
  get workspace() {
    return this._workspace;
  }
  setWorkspace(workspace) {
    if (this._workspace !== workspace) {
      this._workspace = workspace;
      this._onDidChangeLabel.fire();
    }
  }
  get typeId() {
    return EmptyFileEditorInput.ID;
  }
  get editorId() {
    return EmptyFileEditorInput.EDITOR_ID;
  }
  get capabilities() {
    const capabilities = super.capabilities | 2 /* Readonly */ | 8 /* Singleton */ | 1024 /* ForceReveal */;
    return this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) ? capabilities : capabilities | 8192 /* CannotClose */;
  }
  getName() {
    return localize(4776, null);
  }
  getIcon() {
    return EmptyFileEditorInput.ICON;
  }
  getTitle(_verbosity) {
    return this.getName();
  }
  canReopen() {
    return true;
  }
  matches(otherInput) {
    return super.matches(otherInput) || otherInput instanceof EmptyFileEditorInput;
  }
};

EmptyFileEditorInput = __decorateClass([
  __decorateParam(1, IWorkbenchLayoutService)
], EmptyFileEditorInput);

var EmptyFileEditorSerializer = class {
  canSerialize(editorInput) {
    return editorInput instanceof EmptyFileEditorInput;
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return void 0;
    }
    const workspace = editorInput.workspace;
    if (!workspace) {
      return "";
    }
    return JSON.stringify({
      uri: workspace.uri.toString(),
      label: workspace.label,
      description: workspace.description,
      group: workspace.group,
      folders: workspace.folders.map((folder) => ({
        root: folder.root.toString(),
        workingDirectory: folder.workingDirectory.toString(),
        name: folder.name,
        description: folder.description
      })),
      requiresWorkspaceTrust: workspace.requiresWorkspaceTrust,
      isVirtualWorkspace: workspace.isVirtualWorkspace
    });
  }
  deserialize(instantiationService, serializedEditor) {
    if (!serializedEditor) {
      return instantiationService.createInstance(EmptyFileEditorInput, void 0);
    }
    try {
      const data = JSON.parse(serializedEditor);
      const workspace = {
        ...data,
        uri: URI.parse(data.uri),
        icon: Codicon.repo,
        folders: data.folders.map((folder) => ({
          ...folder,
          root: URI.parse(folder.root),
          workingDirectory: URI.parse(folder.workingDirectory)
        }))
      };
      return instantiationService.createInstance(EmptyFileEditorInput, workspace);
    } catch {
      return void 0;
    }
  }
};
export { EmptyFileEditorInput, EmptyFileEditorSerializer };
