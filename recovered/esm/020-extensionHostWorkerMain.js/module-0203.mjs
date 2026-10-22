// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/userDataProfile/common/userDataProfile.ts
import { createDecorator } from "./module-0038.mjs";
import { registerIcon } from "./module-0202.mjs";
import { Codicon } from "./module-0069.mjs";
import { localize, localize2 } from "./module-0015.mjs";
import { RawContextKey } from "./module-0044.mjs";


// src/vs/workbench/services/userDataProfile/common/userDataProfile.ts
var IUserDataProfileService = createDecorator("IUserDataProfileService");

var IUserDataProfileManagementService = createDecorator("IUserDataProfileManagementService");

var IUserDataProfileImportExportService = createDecorator("IUserDataProfileImportExportService");

var defaultUserDataProfileIcon = registerIcon("defaultProfile-icon", Codicon.settings, localize(23670, null));

var PROFILES_TITLE = localize2(23672, "Profiles");

var PROFILES_CATEGORY = { ...PROFILES_TITLE };

var PROFILE_EXTENSION = "code-profile";

var PROFILE_FILTER = [{ name: localize(23671, null), extensions: [PROFILE_EXTENSION] }];

var CURRENT_PROFILE_CONTEXT = new RawContextKey("currentProfile", "");

var HAS_PROFILES_CONTEXT = new RawContextKey("hasProfiles", false);
export { IUserDataProfileService, IUserDataProfileManagementService, IUserDataProfileImportExportService, defaultUserDataProfileIcon, PROFILES_TITLE, PROFILES_CATEGORY, PROFILE_EXTENSION, PROFILE_FILTER, CURRENT_PROFILE_CONTEXT, HAS_PROFILES_CONTEXT };
