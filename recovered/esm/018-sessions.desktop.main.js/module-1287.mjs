// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/url/browser/trustedDomains.ts
import { URI } from "./module-0032.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { createScanner } from "./module-0885.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0875.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";


// src/vs/workbench/contrib/url/browser/trustedDomains.ts
var TRUSTED_DOMAINS_URI = URI.parse("trustedDomains:/Trusted Domains");

var TRUSTED_DOMAINS_STORAGE_KEY = "http.linkProtectionTrustedDomains";

var TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = "http.linkProtectionTrustedDomainsContent";

async function openInEditor(editorService, resource) {
  await editorService.openEditor({
    resource,
    languageId: "jsonc",
    options: { pinned: true }
  });
  const editor = editorService.activeTextEditorControl;
  if (!isCodeEditor(editor)) {
    return;
  }
  const model = editor.getModel();
  if (!model || !isEqual2(model.uri, resource)) {
    return;
  }
  const scanner = createScanner(model.getValue(), true);
  let offset;
  for (let token = scanner.scan(); token !== 17 /* EOF */; token = scanner.scan()) {
    if (token === 3 /* OpenBracketToken */) {
      offset = scanner.getTokenOffset() + scanner.getTokenLength();
      const nextToken = scanner.scan();
      if (nextToken !== 17 /* EOF */ && nextToken !== 4 /* CloseBracketToken */) {
        offset = scanner.getTokenOffset();
      }
      break;
    }
  }
  if (offset !== void 0) {
    const position2 = model.getPositionAt(offset);
    editor.setPosition(position2);
    editor.revealPositionInCenter(position2);
  }
}

var manageTrustedDomainSettingsCommand = {
  id: "workbench.action.manageTrustedDomain",
  description: {
    description: localize2(21574, "Manage Trusted Domains"),
    args: []
  },
  handler: async (accessor) => {
    const editorService = accessor.get(IEditorService);
    await openInEditor(editorService, TRUSTED_DOMAINS_URI);
    return;
  }
};

async function configureOpenerTrustedDomainsHandler(trustedDomains, domainToConfigure, resource, quickInputService, storageService, editorService, telemetryService) {
  const parsedDomainToConfigure = URI.parse(domainToConfigure);
  const toplevelDomainSegements = parsedDomainToConfigure.authority.split(".");
  const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join(".");
  const topLevelDomain = "*." + domainEnd;
  const options3 = [];
  options3.push({
    type: "item",
    label: localize(21578, null, domainToConfigure),
    id: "trust",
    toTrust: domainToConfigure,
    picked: true
  });
  const isIP = toplevelDomainSegements.length === 4 && toplevelDomainSegements.every((segment) => Number.isInteger(+segment) || Number.isInteger(+segment.split(":")[0]));
  if (isIP) {
    if (parsedDomainToConfigure.authority.includes(":")) {
      const base = parsedDomainToConfigure.authority.split(":")[0];
      options3.push({
        type: "item",
        label: localize(21577, null, base),
        toTrust: base + ":*",
        id: "trust"
      });
    }
  } else {
    options3.push({
      type: "item",
      label: localize(21579, null, domainEnd),
      toTrust: topLevelDomain,
      id: "trust"
    });
  }
  options3.push({
    type: "item",
    label: localize(21576, null),
    toTrust: "*",
    id: "trust"
  });
  options3.push({
    type: "item",
    label: localize(21575, null),
    id: "manage"
  });
  const pickedResult = await quickInputService.pick(
    options3,
    { activeItem: options3[0] }
  );
  if (pickedResult && pickedResult.id) {
    switch (pickedResult.id) {
      case "manage": {
        const uriWithFragment = TRUSTED_DOMAINS_URI.with({ fragment: resource.toString() });
        await openInEditor(editorService, uriWithFragment);
        return trustedDomains;
      }
      case "trust": {
        const itemToTrust = pickedResult.toTrust;
        if (trustedDomains.indexOf(itemToTrust) === -1) {
          storageService.remove(TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, -1 /* APPLICATION */);
          storageService.store(
            TRUSTED_DOMAINS_STORAGE_KEY,
            JSON.stringify([...trustedDomains, itemToTrust]),
            -1 /* APPLICATION */,
            0 /* USER */
          );
          return [...trustedDomains, itemToTrust];
        }
      }
    }
  }
  return [];
}

async function readTrustedDomains(accessor) {
  const { defaultTrustedDomains, trustedDomains } = readStaticTrustedDomains(accessor);
  return {
    defaultTrustedDomains,
    trustedDomains
  };
}

function readStaticTrustedDomains(accessor) {
  const storageService = accessor.get(IStorageService);
  const productService = accessor.get(IProductService);
  const environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
  const defaultTrustedDomains = [
    ...productService.linkProtectionTrustedDomains ?? [],
    ...environmentService.options?.additionalTrustedDomains ?? []
  ];
  let trustedDomains = [];
  try {
    const trustedDomainsSrc = storageService.get(TRUSTED_DOMAINS_STORAGE_KEY, -1 /* APPLICATION */);
    if (trustedDomainsSrc) {
      trustedDomains = JSON.parse(trustedDomainsSrc);
    }
  } catch (err) {
  }
  return {
    defaultTrustedDomains,
    trustedDomains
  };
}
export { openInEditor, configureOpenerTrustedDomainsHandler, readTrustedDomains, readStaticTrustedDomains, TRUSTED_DOMAINS_URI, TRUSTED_DOMAINS_STORAGE_KEY, TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, manageTrustedDomainSettingsCommand };
