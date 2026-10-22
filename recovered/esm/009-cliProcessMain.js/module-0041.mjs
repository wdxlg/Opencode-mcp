// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/product/common/product.ts
import { env } from "./module-0015.mjs";


// src/vs/platform/product/common/product.ts
function getDependencyVersion(packageConfiguration, packageName) {
  return packageConfiguration.dependencies?.[packageName]?.replace(/^[~^]/, "");
}

var product;

var vscodeGlobal2 = globalThis.vscode;

if (typeof vscodeGlobal2 !== "undefined" && typeof vscodeGlobal2.context !== "undefined") {
  const configuration = vscodeGlobal2.context.configuration();
  if (configuration) {
    product = configuration.product;
  } else {
    throw new Error("Sandbox: unable to resolve product configuration from preload script.");
  }
} else if (globalThis._VSCODE_PRODUCT_JSON && globalThis._VSCODE_PACKAGE_JSON) {
  product = globalThis._VSCODE_PRODUCT_JSON;
  const packageConfiguration = globalThis._VSCODE_PACKAGE_JSON;
  if (env["VSCODE_DEV"]) {
    Object.assign(product, {
      nameShort: `${product.nameShort} Dev`,
      nameLong: `${product.nameLong} Dev`,
      dataFolderName: `${product.dataFolderName}-dev`,
      serverDataFolderName: product.serverDataFolderName ? `${product.serverDataFolderName}-dev` : void 0
    });
  }
  if (!product.version) {
    Object.assign(product, {
      version: packageConfiguration.version
    });
  }
  if (!product.copilotVersions) {
    const runtime = getDependencyVersion(packageConfiguration, "@github/copilot");
    const sdk = getDependencyVersion(packageConfiguration, "@github/copilot-sdk");
    if (runtime && sdk) {
      Object.assign(product, { copilotVersions: { runtime, sdk } });
    }
  }
} else {
  product = {"opencodeVersion":"0.8.1","nameShort":"OpenCode","nameLong":"OpenCode","applicationName":"opencode","dataFolderName":".opencode","sharedDataFolderName":".opencode-shared","win32MutexName":"opencode","licenseName":"MIT","licenseUrl":"https://github.com/microsoft/vscode/blob/main/LICENSE.txt","serverLicenseUrl":"https://github.com/microsoft/vscode/blob/main/LICENSE.txt","serverGreeting":[],"serverLicense":[],"serverLicensePrompt":"","serverApplicationName":"opencode-server","serverDataFolderName":".opencode-server","tunnelApplicationName":"opencode-tunnel","win32DirName":"OpenCode","win32NameVersion":"OpenCode","win32RegValueName":"OpenCode","win32x64AppId":"{{4DDC76BC-6B27-477B-8A5E-533BE10A1016}","win32arm64AppId":"{{88833AD6-6685-4E9C-AB5F-246F37297CD5}","win32x64UserAppId":"{{3E5FA206-B32E-48F9-8D44-A8B4D2FC38F8}","win32arm64UserAppId":"{{F48B4EF7-5A88-4B69-AC8A-C41DBD1A8B80}","win32AppUserModelId":"OpenCode.OpenCode","win32ShellNameShort":"OpenCode","win32TunnelServiceMutex":"opencode-tunnelservice","win32TunnelMutex":"opencode-tunnel","darwinBundleIdentifier":"local.opencode","darwinProfileUUID":"42ADC01A-68C9-423C-B673-345254B55C7C","darwinProfilePayloadUUID":"725229E0-B307-4A19-BDDE-AC6895F2BFAE","linuxIconName":"opencode","licenseFileName":"LICENSE.txt","reportIssueUrl":"https://github.com/microsoft/vscode/issues/new","nodejsArtifactFeed":"","electronArtifactFeed":"","urlProtocol":"opencode","agentsTelemetryAppName":"agents","webviewContentExternalBaseUrlTemplate":"https://{{uuid}}.vscode-cdn.net/insider/ef65ac1ba57f57f2a3961bfe94aa20481caca4c6/out/vs/workbench/contrib/webview/browser/pre/","builtInExtensions":[{"name":"ms-vscode.js-debug-companion","version":"1.1.3","sha256":"7380a890787452f14b2db7835dfa94de538caf358ebc263f9d46dd68ac52de93","repo":"https://github.com/microsoft/vscode-js-debug-companion","metadata":{"id":"99cb0b7f-7354-4278-b8da-6cc79972169d","publisherId":{"publisherId":"5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee","publisherName":"ms-vscode","displayName":"Microsoft","flags":"verified"},"publisherDisplayName":"Microsoft"}},{"name":"ms-vscode.js-debug","version":"1.117.0","sha256":"854eeb8a785b1f41ba2bd02d7ccd4fdbe10021b61473293973c7e96d036c7fb8","repo":"https://github.com/microsoft/vscode-js-debug","metadata":{"id":"25629058-ddac-4e17-abba-74678e126c5d","publisherId":{"publisherId":"5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee","publisherName":"ms-vscode","displayName":"Microsoft","flags":"verified"},"publisherDisplayName":"Microsoft"}},{"name":"ms-vscode.vscode-js-profile-table","version":"1.0.11","sha256":"a962a1e6a3baf74c9354b7f47fa96e6d6f0423a63bff55d7f976b6134a748ae9","repo":"https://github.com/microsoft/vscode-js-profile-visualizer","metadata":{"id":"7e52b41b-71ad-457b-ab7e-0620f1fc4feb","publisherId":{"publisherId":"5f5636e7-69ed-4afe-b5d6-8d231fb3d3ee","publisherName":"ms-vscode","displayName":"Microsoft","flags":"verified"},"publisherDisplayName":"Microsoft"}}],"trustedExtensionAuthAccess":{},"onboardingKeymaps":[{"id":"vscode","label":"VS Code","description":"Default keyboard mapping"},{"id":"sublime","label":"Sublime Text","extensionId":"ms-vscode.sublime-keybindings","description":"Keyboard mapping from Sublime Text"},{"id":"intellij","label":"IntelliJ / JetBrains","extensionId":"k--kato.intellij-idea-keybindings","description":"Keyboard mapping from IntelliJ IDEA"},{"id":"vim","label":"Vim","extensionId":"vscodevim.vim","description":"Vim modal editing"},{"id":"eclipse","label":"Eclipse","extensionId":"alphabotsec.vscode-eclipse-keybindings","description":"Keyboard mapping from Eclipse"},{"id":"notepadpp","label":"Notepad++","extensionId":"ms-vscode.notepadplusplus-keybindings","description":"Keyboard mapping from Notepad++"}],"onboardingThemes":[{"id":"dark-2026","label":"Dark 2026","themeId":"Dark 2026","type":"dark"},{"id":"hc-dark","label":"Dark High Contrast","themeId":"Default High Contrast","type":"hcDark"},{"id":"solarized-dark","label":"Solarized Dark","themeId":"Solarized Dark","type":"dark"},{"id":"light-2026","label":"Light 2026","themeId":"Light 2026","type":"light"},{"id":"hc-light","label":"Light High Contrast","themeId":"Default High Contrast Light","type":"hcLight"},{"id":"solarized-light","label":"Solarized Light","themeId":"Solarized Light","type":"light"}],"builtInExtensionsEnabledWithAutoUpdates":[],"sessionsWindowAllowedExtensions":[],"voiceWsUrl":"wss://falcon-caas.mai.microsoft.com/voice-code/api/v1/realtime/voice","extensionsGallery":{"serviceUrl":"https://open-vsx.org/vscode/gallery","itemUrl":"https://open-vsx.org/vscode/item","latestUrlTemplate":"https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest","controlUrl":"https://raw.githubusercontent.com/EclipseFdn/publish-extensions/refs/heads/master/extension-control/extensions.json"},"extensionEnabledApiProposals":{"opencode.opencode":["defaultChatParticipant","chatParticipantAdditions","chatParticipantPrivate","chatReferenceBinaryData","chatPromptFiles","chatProvider","languageModelThinkingPart"]},"opencodeBundledCopilot":false,"opencodeAgentsWindowEnabled":false,"commit":"5c03086397d13f66eb8c46dc97043a91d9e97c9f","date":"2026-10-06T09:54:53.534Z","version":"1.136.1","copilotVersions":{"runtime":"1.0.81-0","sdk":"1.0.11"},"opencodeBuildId":"327d42bd49005d0e","target":"system","opencodeLocalBranding":false,"opencodeStandaloneVersion":"2026.10.13.2"};
  if (Object.keys(product).length === 0) {
    Object.assign(product, {
      version: "1.104.0-dev",
      nameShort: "Code - OSS Dev",
      nameLong: "Code - OSS Dev",
      applicationName: "code-oss",
      dataFolderName: ".vscode-oss",
      urlProtocol: "code-oss",
      reportIssueUrl: "https://github.com/microsoft/vscode/issues/new",
      licenseName: "MIT",
      licenseUrl: "https://github.com/microsoft/vscode/blob/main/LICENSE.txt",
      serverLicenseUrl: "https://github.com/microsoft/vscode/blob/main/LICENSE.txt",
      defaultChatAgent: {
        extensionId: "GitHub.copilot",
        chatExtensionId: "GitHub.copilot-chat",
        provider: {
          default: {
            id: "github",
            name: "GitHub"
          },
          enterprise: {
            id: "github-enterprise",
            name: "GitHub Enterprise"
          }
        },
        providerScopes: []
      }
    });
  }
}

var product_default = product;
export { getDependencyVersion, product, vscodeGlobal2, product_default };
