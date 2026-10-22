// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/sessions.desktop.main.ts
import { registerSingleton } from "./module-0135.mjs";
import { IUserDataInitializationService, UserDataInitializationService } from "./module-1627.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { IPluginGitService } from "./module-2716.mjs";
import { NativePluginGitCommandService } from "./module-4056.mjs";
import { IRemoteAgentHostService } from "./module-1736.mjs";
import { AgentsWindowRemoteAgentHostService } from "./module-4052.mjs";
import { IRemoteAgentHostLocationPreferenceService } from "./module-3558.mjs";
import { RemoteAgentHostLocationPreferenceService } from "./module-4053.mjs";
import { ISSHHostKeyTrustService } from "./module-4054.mjs";
import { SSHHostKeyTrustService } from "./module-4055.mjs";
import { registerSharedProcessRemoteService } from "./module-3826.mjs";
import { ILocalGitService } from "./module-4042.mjs";


// src/vs/sessions/sessions.desktop.main.ts
registerSingleton(IUserDataInitializationService, new SyncDescriptor(UserDataInitializationService, [[]], true));

registerSingleton(IPluginGitService, NativePluginGitCommandService, 1 /* Delayed */);

registerSingleton(IRemoteAgentHostService, AgentsWindowRemoteAgentHostService, 1 /* Delayed */);

registerSingleton(IRemoteAgentHostLocationPreferenceService, RemoteAgentHostLocationPreferenceService, 1 /* Delayed */);

registerSingleton(ISSHHostKeyTrustService, SSHHostKeyTrustService, 1 /* Delayed */);

registerSharedProcessRemoteService(ILocalGitService, "localGit");
export {};
