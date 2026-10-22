// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/environmentChanges/browser/terminal.environmentChanges.contribution.ts
import { registerActiveInstanceAction } from "./module-3043.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0935.mjs";
import { URI } from "./module-0032.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/contrib/terminalContrib/environmentChanges/browser/terminal.environmentChanges.contribution.ts
registerActiveInstanceAction({
  id: "workbench.action.terminal.showEnvironmentContributions" /* ShowEnvironmentContributions */,
  title: localize2(20717, "Show Environment Contributions"),
  run: async (activeInstance, c, accessor, arg) => {
    const collection = activeInstance.extEnvironmentVariableCollection;
    if (collection) {
      const scope = arg;
      const instantiationService = accessor.get(IInstantiationService);
      const outputProvider = instantiationService.createInstance(EnvironmentCollectionProvider);
      const editorService = accessor.get(IEditorService);
      const timestamp = (/* @__PURE__ */ new Date()).getTime();
      const scopeDesc = scope?.workspaceFolder ? ` - ${scope.workspaceFolder.name}` : "";
      const textContent = await outputProvider.provideTextContent(URI.from(
        {
          scheme: EnvironmentCollectionProvider.scheme,
          path: `Environment changes${scopeDesc}`,
          fragment: describeEnvironmentChanges(collection, scope),
          query: `environment-collection-${timestamp}`
        }
      ));
      if (textContent) {
        await editorService.openEditor({
          resource: textContent.uri
        });
      }
    }
  }
});

function describeEnvironmentChanges(collection, scope) {
  let content = `# ${localize(20714, null)}`;
  const globalDescriptions = collection.getDescriptionMap(void 0);
  const workspaceDescriptions = collection.getDescriptionMap(scope);
  for (const [ext, coll] of collection.collections) {
    content += `

## ${localize(20715, null, ext)}`;
    content += "\n";
    const globalDescription = globalDescriptions.get(ext);
    if (globalDescription) {
      content += `
${globalDescription}
`;
    }
    const workspaceDescription = workspaceDescriptions.get(ext);
    if (workspaceDescription) {
      const workspaceSuffix = globalDescription ? ` (${localize(20716, null)})` : "";
      content += `
${workspaceDescription}${workspaceSuffix}
`;
    }
    for (const mutator of coll.map.values()) {
      if (filterScope2(mutator, scope) === false) {
        continue;
      }
      content += `
- \`${mutatorTypeLabel(mutator.type, mutator.value, mutator.variable)}\``;
    }
  }
  return content;
}

function filterScope2(mutator, scope) {
  if (!mutator.scope) {
    return true;
  }
  if (mutator.scope.workspaceFolder && scope?.workspaceFolder && mutator.scope.workspaceFolder.index === scope.workspaceFolder.index) {
    return true;
  }
  return false;
}

function mutatorTypeLabel(type, value2, variable) {
  switch (type) {
    case 3 /* Prepend */:
      return `${variable}=${value2}\${env:${variable}}`;
    case 2 /* Append */:
      return `${variable}=\${env:${variable}}${value2}`;
    default:
      return `${variable}=${value2}`;
  }
}

var EnvironmentCollectionProvider = class {
  constructor(textModelResolverService, _modelService) {
    this._modelService = _modelService;
    textModelResolverService.registerTextModelContentProvider(EnvironmentCollectionProvider.scheme, this);
  }
  static {
    this.scheme = "ENVIRONMENT_CHANGES_COLLECTION";
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    return this._modelService.createModel(resource.fragment, { languageId: "markdown", onDidChange: Event2.None }, resource, false);
  }
};

EnvironmentCollectionProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService)
], EnvironmentCollectionProvider);
export { describeEnvironmentChanges, filterScope2, mutatorTypeLabel, EnvironmentCollectionProvider };
