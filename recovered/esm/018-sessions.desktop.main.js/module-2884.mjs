// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcp.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { McpRegistry } from "./module-2859.mjs";
import { IMcpSandboxService, McpSandboxService } from "./module-2306.mjs";
import { IMcpElicitationService, IMcpSamplingService, IMcpService, IMcpWorkbenchService } from "./module-1206.mjs";
import { McpService } from "./module-2863.mjs";
import { MCPContextsInitialisation, McpWorkbenchService } from "./module-2883.mjs";
import { IMcpDevModeDebugging, McpDevModeDebugging } from "./module-2304.mjs";
import { McpSamplingService } from "./module-2862.mjs";
import { McpElicitationService } from "./module-2875.mjs";
import { IWorkbenchMcpGatewayService } from "./module-1445.mjs";
import { BrowserMcpGatewayService } from "./module-2865.mjs";
import { mcpDiscoveryRegistry } from "./module-2844.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { RemoteNativeMpcDiscovery } from "./module-2848.mjs";
import { InstalledMcpServersDiscovery } from "./module-2843.mjs";
import { ExtensionMcpDiscovery } from "./module-2841.mjs";
import { CursorWorkspaceMcpDiscoveryAdapter } from "./module-2849.mjs";
import { WorkspaceDotMcpDiscovery } from "./module-2850.mjs";
import { PluginMcpDiscovery } from "./module-2627.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { McpDiscovery } from "./module-2872.mjs";
import { McpStartup } from "./module-2873.mjs";
import { McpContextKeysController } from "./module-2851.mjs";
import { McpLanguageFeatures } from "./module-2877.mjs";
import { McpResourceFilesystem } from "./module-2860.mjs";
import { McpLanguageModelToolContribution } from "./module-2853.mjs";
import { McpGatewayToolBrokerContribution } from "./module-2867.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { AddConfigurationAction2, EditStoredInput, InstallFromManifestAction, ListMcpServerCommand, MCPServerActionRendering, McpAgentHostServerOptionsCommand, McpBrowseCommand, McpBrowseResourcesCommand, McpConfigureSamplingModels, McpConfirmationServerOptionsCommand, McpServerOptionsCommand, McpSkipCurrentAutostartCommand, McpStartPromptingServerCommand, OpenRemoteUserMcpResourceCommand, OpenUserMcpResourceCommand, OpenWorkspaceFolderMcpResourceCommand, OpenWorkspaceMcpResourceCommand, RemoveStoredInput, ResetMcpCachedTools, ResetMcpTrustCommand, RestartServer, SetOAuthClientSecret, ShowConfiguration, ShowInstalledMcpServersCommand, ShowOutput, StartServer, StopServer } from "./module-2871.mjs";
import { McpAddContextContribution } from "./module-2870.mjs";
import { McpConfigMigrationContribution } from "./module-2878.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { mcpSchemaId } from "./module-1198.mjs";
import { mcpServerSchema } from "./module-1420.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { McpServerEditor } from "./module-2881.mjs";
import { localize } from "./module-0001.mjs";
import { McpServerEditorInput } from "./module-2882.mjs";
import { Extensions18 } from "./module-1552.mjs";
import { McpResourceQuickAccess } from "./module-2869.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Extensions14 } from "./module-1113.mjs";
import { mcpAccessConfig } from "./module-1196.mjs";


// src/vs/workbench/contrib/mcp/browser/mcp.contribution.ts
registerSingleton(IMcpRegistry, McpRegistry, 1 /* Delayed */);

registerSingleton(IMcpSandboxService, McpSandboxService, 1 /* Delayed */);

registerSingleton(IMcpService, McpService, 1 /* Delayed */);

registerSingleton(IMcpWorkbenchService, McpWorkbenchService, 0 /* Eager */);

registerSingleton(IMcpDevModeDebugging, McpDevModeDebugging, 1 /* Delayed */);

registerSingleton(IMcpSamplingService, McpSamplingService, 1 /* Delayed */);

registerSingleton(IMcpElicitationService, McpElicitationService, 1 /* Delayed */);

registerSingleton(IWorkbenchMcpGatewayService, BrowserMcpGatewayService, 1 /* Delayed */);

mcpDiscoveryRegistry.register(new SyncDescriptor(RemoteNativeMpcDiscovery));

mcpDiscoveryRegistry.register(new SyncDescriptor(InstalledMcpServersDiscovery));

mcpDiscoveryRegistry.register(new SyncDescriptor(ExtensionMcpDiscovery));

mcpDiscoveryRegistry.register(new SyncDescriptor(CursorWorkspaceMcpDiscoveryAdapter));

mcpDiscoveryRegistry.register(new SyncDescriptor(WorkspaceDotMcpDiscovery));

mcpDiscoveryRegistry.register(new SyncDescriptor(PluginMcpDiscovery));

registerWorkbenchContribution2("mcpDiscovery", McpDiscovery, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(McpStartup.ID, McpStartup, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2("mcpContextKeys", McpContextKeysController, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2("mcpLanguageFeatures", McpLanguageFeatures, WorkbenchPhase.Eventually);

registerWorkbenchContribution2("mcpResourceFilesystem", McpResourceFilesystem, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(McpLanguageModelToolContribution.ID, McpLanguageModelToolContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2("mcpGatewayToolBrokerRemote", McpGatewayToolBrokerContribution, WorkbenchPhase.AfterRestored);

registerAction2(ListMcpServerCommand);

registerAction2(McpServerOptionsCommand);

registerAction2(McpAgentHostServerOptionsCommand);

registerAction2(McpConfirmationServerOptionsCommand);

registerAction2(ResetMcpTrustCommand);

registerAction2(ResetMcpCachedTools);

registerAction2(AddConfigurationAction2);

registerAction2(InstallFromManifestAction);

registerAction2(RemoveStoredInput);

registerAction2(EditStoredInput);

registerAction2(SetOAuthClientSecret);

registerAction2(StartServer);

registerAction2(StopServer);

registerAction2(ShowOutput);

registerAction2(RestartServer);

registerAction2(ShowConfiguration);

registerAction2(McpBrowseCommand);

registerAction2(OpenUserMcpResourceCommand);

registerAction2(OpenRemoteUserMcpResourceCommand);

registerAction2(OpenWorkspaceMcpResourceCommand);

registerAction2(OpenWorkspaceFolderMcpResourceCommand);

registerAction2(ShowInstalledMcpServersCommand);

registerAction2(McpBrowseResourcesCommand);

registerAction2(McpConfigureSamplingModels);

registerAction2(McpStartPromptingServerCommand);

registerAction2(McpSkipCurrentAutostartCommand);

registerWorkbenchContribution2("mcpActionRendering", MCPServerActionRendering, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2("mcpAddContext", McpAddContextContribution, WorkbenchPhase.Eventually);

registerWorkbenchContribution2(MCPContextsInitialisation.ID, MCPContextsInitialisation, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(McpConfigMigrationContribution.ID, McpConfigMigrationContribution, WorkbenchPhase.Eventually);

var jsonRegistry2 = Registry.as(Extensions3.JSONContribution);

jsonRegistry2.registerSchema(mcpSchemaId, mcpServerSchema);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    McpServerEditor,
    McpServerEditor.ID,
    localize(16766, null)
  ),
  [
    new SyncDescriptor(McpServerEditorInput)
  ]
);

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: McpResourceQuickAccess,
  prefix: McpResourceQuickAccess.PREFIX,
  when: ChatContextKeys.enabled,
  placeholder: localize(16765, null),
  helpEntries: [{
    description: localize(16764, null),
    commandId: "workbench.mcp.addConfiguration" /* AddConfiguration */
  }]
});

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "chat.mcp.enabled",
  migrateFn: (value2, accessor) => {
    const result = [["chat.mcp.enabled", { value: void 0 }]];
    if (value2 === true) {
      result.push([mcpAccessConfig, { value: "all" /* All */ }]);
    }
    if (value2 === false) {
      result.push([mcpAccessConfig, { value: "none" /* None */ }]);
    }
    return result;
  }
}]);
export { jsonRegistry2 };
