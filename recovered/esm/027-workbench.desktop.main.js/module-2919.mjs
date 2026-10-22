// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/common/searchExtensionsTool.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ToolDataSource } from "./module-0990.mjs";
import { EXTENSION_CATEGORIES } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";


// src/vs/workbench/contrib/extensions/common/searchExtensionsTool.ts
var SearchExtensionsToolId = "vscode_searchExtensions_internal";

var SearchExtensionsToolData = {
  id: SearchExtensionsToolId,
  toolReferenceName: "extensions",
  legacyToolReferenceFullNames: ["extensions"],
  icon: ThemeIcon.fromId(Codicon.extensions.id),
  displayName: localize(15612, null),
  modelDescription: "This is a tool for browsing Visual Studio Code Extensions Marketplace. It allows the model to search for extensions and retrieve detailed information about them. The model should use this tool whenever it needs to discover extensions or resolve information about known ones. To use the tool, the model has to provide the category of the extensions, relevant search keywords, or known extension IDs. Note that search results may include false positives, so reviewing and filtering is recommended.",
  userDescription: localize(15614, null),
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "The category of extensions to search for",
        enum: EXTENSION_CATEGORIES
      },
      keywords: {
        type: "array",
        items: {
          type: "string"
        },
        description: "The keywords to search for"
      },
      ids: {
        type: "array",
        items: {
          type: "string"
        },
        description: "The ids of the extensions to search for"
      }
    }
  }
};

var SearchExtensionsTool = class {
  constructor(extensionWorkbenchService) {
    this.extensionWorkbenchService = extensionWorkbenchService;
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const params = invocation.parameters;
    if (!params.keywords?.length && !params.category && !params.ids?.length) {
      return {
        content: [{
          kind: "text",
          value: localize(15613, null)
        }]
      };
    }
    const extensionsMap = /* @__PURE__ */ new Map();
    const addExtension = (extensions) => {
      for (const extension of extensions) {
        if (extension.deprecationInfo || extension.isMalicious) {
          continue;
        }
        extensionsMap.set(extension.identifier.id.toLowerCase(), {
          id: extension.identifier.id,
          name: extension.displayName,
          description: extension.description,
          installed: extension.state === 1 /* Installed */,
          installCount: extension.installCount ?? 0,
          rating: extension.rating ?? 0,
          categories: extension.categories ?? [],
          tags: extension.gallery?.tags ?? []
        });
      }
    };
    const queryAndAddExtensions = async (text2) => {
      const extensions = await this.extensionWorkbenchService.queryGallery({
        text: text2,
        pageSize: 10,
        sortBy: "InstallCount" /* InstallCount */
      }, token);
      if (extensions.firstPage.length) {
        addExtension(extensions.firstPage);
      }
    };
    if (params.ids?.length) {
      const extensions = await this.extensionWorkbenchService.getExtensions(params.ids.map((id2) => ({ id: id2 })), token);
      addExtension(extensions);
    }
    if (params.keywords?.length) {
      for (const keyword of params.keywords ?? []) {
        if (keyword === "featured") {
          await queryAndAddExtensions("featured");
        } else {
          let text2 = params.category ? `category:"${params.category}"` : "";
          text2 = keyword ? `${text2} ${keyword}`.trim() : text2;
          await queryAndAddExtensions(text2);
        }
      }
    } else {
      await queryAndAddExtensions(`category:"${params.category}"`);
    }
    const result = Array.from(extensionsMap.values());
    return {
      content: [{
        kind: "text",
        value: `Here are the list of extensions:
${JSON.stringify(result)}
. Important: Use the following format to display extensions to the user because there is a renderer available to parse these extensions in this format and display them with all details. So, do not describe about the extensions to the user.
\`\`\`vscode-extensions
extensionId1,extensionId2
\`\`\`
.`
      }],
      toolResultDetails: {
        input: JSON.stringify(params),
        output: [{ type: "embed", isText: true, value: JSON.stringify(result.map((extension) => extension.id)) }]
      }
    };
  }
};

SearchExtensionsTool = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], SearchExtensionsTool);
export { SearchExtensionsToolId, SearchExtensionsToolData, SearchExtensionsTool };
