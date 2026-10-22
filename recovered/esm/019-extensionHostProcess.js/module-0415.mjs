// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/utils/promptsServiceUtils.ts
import { ExtensionIdentifier } from "./module-0059.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/utils/promptsServiceUtils.ts
function isOrganizationPromptFile(uri2, extensionId, productService) {
  const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
  if (!chatExtensionId) {
    return false;
  }
  const isFromBuiltinChatExtension = ExtensionIdentifier.equals(extensionId, chatExtensionId);
  const pathContainsGithub = uri2.path.includes("/github/");
  return isFromBuiltinChatExtension && pathContainsGithub;
}

function isBuiltinAgent(source, uri2, productService) {
  if (source.storage !== "extension" /* extension */) {
    return false;
  }
  const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
  if (!chatExtensionId || !ExtensionIdentifier.equals(source.extensionId, chatExtensionId)) {
    return false;
  }
  return !isOrganizationPromptFile(uri2, source.extensionId, productService);
}
export { isOrganizationPromptFile, isBuiltinAgent };
