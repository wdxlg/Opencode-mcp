// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/color.ts
import { CancellationToken } from "./module-0025.mjs";
import { DefaultDocumentColorProvider } from "./module-0576.mjs";
import { illegalArgument, onUnexpectedExternalError } from "./module-0004.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IModelService } from "./module-0080.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/editor/contrib/colorPicker/browser/color.ts
async function getColors(colorProviderRegistry, model, token, defaultColorDecoratorsEnablement = "auto") {
  return _findColorData(new ColorDataCollector(), colorProviderRegistry, model, token, defaultColorDecoratorsEnablement);
}

function getColorPresentations(model, colorInfo, provider, token) {
  return Promise.resolve(provider.provideColorPresentations(model, colorInfo, token));
}

var ColorDataCollector = class {
  constructor() {
  }
  async compute(provider, model, token, colors) {
    const documentColors = await provider.provideDocumentColors(model, token);
    if (Array.isArray(documentColors)) {
      for (const colorInfo of documentColors) {
        colors.push({ colorInfo, provider });
      }
    }
    return Array.isArray(documentColors);
  }
};

var ExtColorDataCollector = class {
  constructor() {
  }
  async compute(provider, model, token, colors) {
    const documentColors = await provider.provideDocumentColors(model, token);
    if (Array.isArray(documentColors)) {
      for (const colorInfo of documentColors) {
        colors.push({ range: colorInfo.range, color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha] });
      }
    }
    return Array.isArray(documentColors);
  }
};

var ColorPresentationsCollector = class {
  constructor(colorInfo) {
    this.colorInfo = colorInfo;
  }
  async compute(provider, model, _token, colors) {
    const documentColors = await provider.provideColorPresentations(model, this.colorInfo, CancellationToken.None);
    if (Array.isArray(documentColors)) {
      colors.push(...documentColors);
    }
    return Array.isArray(documentColors);
  }
};

async function _findColorData(collector, colorProviderRegistry, model, token, defaultColorDecoratorsEnablement) {
  let validDocumentColorProviderFound = false;
  let defaultProvider;
  const colorData = [];
  const documentColorProviders = colorProviderRegistry.ordered(model);
  for (let i2 = documentColorProviders.length - 1; i2 >= 0; i2--) {
    const provider = documentColorProviders[i2];
    if (defaultColorDecoratorsEnablement !== "always" && provider instanceof DefaultDocumentColorProvider) {
      defaultProvider = provider;
    } else {
      try {
        if (await collector.compute(provider, model, token, colorData)) {
          validDocumentColorProviderFound = true;
        }
      } catch (e4) {
        onUnexpectedExternalError(e4);
      }
    }
  }
  if (validDocumentColorProviderFound) {
    return colorData;
  }
  if (defaultProvider && defaultColorDecoratorsEnablement !== "never") {
    await collector.compute(defaultProvider, model, token, colorData);
    return colorData;
  }
  return [];
}

function _setupColorCommand(accessor, resource) {
  const { colorProvider: colorProviderRegistry } = accessor.get(ILanguageFeaturesService);
  const model = accessor.get(IModelService).getModel(resource);
  if (!model) {
    throw illegalArgument();
  }
  const defaultColorDecoratorsEnablement = accessor.get(IConfigurationService).getValue("editor.defaultColorDecorators", { resource });
  return { model, colorProviderRegistry, defaultColorDecoratorsEnablement };
}
export { getColors, getColorPresentations, _findColorData, _setupColorCommand, ColorDataCollector, ExtColorDataCollector, ColorPresentationsCollector };
