// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/userDataProfile/common/userDataProfile.ts
import { createDecorator2 } from "./module-0048.mjs";
import { registerIcon } from "./module-0208.mjs";
import { Codicon } from "./module-0083.mjs";
import { localize, localize2 } from "./module-0013.mjs";
import { RawContextKey } from "./module-0049.mjs";


// src/vs/workbench/services/userDataProfile/common/userDataProfile.ts
var IUserDataProfileService = createDecorator2("IUserDataProfileService");

var IUserDataProfileManagementService = createDecorator2("IUserDataProfileManagementService");

var IUserDataProfileImportExportService = createDecorator2("IUserDataProfileImportExportService");

var defaultUserDataProfileIcon = registerIcon("defaultProfile-icon", Codicon.settings, localize(23670, null));

var PROFILES_TITLE = localize2(23672, "Profiles");

var PROFILES_CATEGORY = { ...PROFILES_TITLE };

var PROFILE_EXTENSION = "code-profile";

var PROFILE_FILTER = [{ name: localize(23671, null), extensions: [PROFILE_EXTENSION] }];

var CURRENT_PROFILE_CONTEXT = new RawContextKey("currentProfile", "");

var HAS_PROFILES_CONTEXT = new RawContextKey("hasProfiles", false);
export { IUserDataProfileService, IUserDataProfileManagementService, IUserDataProfileImportExportService, defaultUserDataProfileIcon, PROFILES_TITLE, PROFILES_CATEGORY, PROFILE_EXTENSION, PROFILE_FILTER, CURRENT_PROFILE_CONTEXT, HAS_PROFILES_CONTEXT };
