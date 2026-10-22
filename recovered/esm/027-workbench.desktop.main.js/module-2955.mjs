// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatDefaultModel.ts
import { DefaultModelContribution, createDefaultModelArrays } from "./module-2793.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { ILogService } from "./module-0095.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatDefaultModel.ts
var arrays3 = createDefaultModelArrays();

var InlineChatDefaultModel = class extends DefaultModelContribution {
  static {
    this.ID = "workbench.contrib.inlineChatDefaultModel";
  }
  static {
    this.modelIds = arrays3.modelIds;
  }
  static {
    this.modelLabels = arrays3.modelLabels;
  }
  static {
    this.modelDescriptions = arrays3.modelDescriptions;
  }
  constructor(languageModelsService, logService) {
    super(arrays3, {
      configKey: "inlineChat.defaultModel" /* DefaultModel */,
      configSectionId: "inlineChat",
      logPrefix: "[InlineChatDefaultModel]",
      filter: (metadata) => !!metadata.capabilities?.toolCalling
    }, languageModelsService, logService);
  }
};

InlineChatDefaultModel = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, ILogService)
], InlineChatDefaultModel);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...{ id: "inlineChat", title: localize(16158, null), order: 30, type: "object" },
  properties: {
    ["inlineChat.defaultModel" /* DefaultModel */]: {
      description: localize(16159, null),
      type: "string",
      default: "",
      order: 1,
      enum: InlineChatDefaultModel.modelIds,
      enumItemLabels: InlineChatDefaultModel.modelLabels,
      markdownEnumDescriptions: InlineChatDefaultModel.modelDescriptions
    }
  }
});
export { arrays3, InlineChatDefaultModel };
