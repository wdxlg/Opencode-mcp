// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/treeViewsDndService.ts
import { createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { TreeViewsDnDService } from "./module-0669.mjs";


// src/vs/editor/common/services/treeViewsDndService.ts
var ITreeViewsDnDService = createDecorator("treeViewsDndService");

registerSingleton(ITreeViewsDnDService, TreeViewsDnDService, 1 /* Delayed */);
export { ITreeViewsDnDService };
