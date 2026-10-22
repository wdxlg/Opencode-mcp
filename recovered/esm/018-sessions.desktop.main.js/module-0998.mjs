// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/common/userDataProfile.ts
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { RawContextKey } from "./module-0089.mjs";


// src/vs/workbench/services/userDataProfile/common/userDataProfile.ts
var IUserDataProfileService = createDecorator("IUserDataProfileService");

var IUserDataProfileManagementService = createDecorator("IUserDataProfileManagementService");

var PROFILE_URL_AUTHORITY = "profile";

function toUserDataProfileUri(path, productService) {
  return URI.from({
    scheme: productService.urlProtocol,
    authority: PROFILE_URL_AUTHORITY,
    path: path.startsWith("/") ? path : `/${path}`
  });
}

var PROFILE_URL_AUTHORITY_PREFIX = "profile-";

function isProfileURL(uri4) {
  return uri4.authority === PROFILE_URL_AUTHORITY || new RegExp(`^${PROFILE_URL_AUTHORITY_PREFIX}`).test(uri4.authority);
}

var IUserDataProfileImportExportService = createDecorator("IUserDataProfileImportExportService");

var defaultUserDataProfileIcon = registerIcon("defaultProfile-icon", Codicon.settings, localize(23670, null));

var PROFILES_TITLE = localize2(23672, "Profiles");

var PROFILES_CATEGORY = { ...PROFILES_TITLE };

var PROFILE_EXTENSION = "code-profile";

var PROFILE_FILTER = [{ name: localize(23671, null), extensions: [PROFILE_EXTENSION] }];

var CURRENT_PROFILE_CONTEXT = new RawContextKey("currentProfile", "");

var HAS_PROFILES_CONTEXT = new RawContextKey("hasProfiles", false);
export { toUserDataProfileUri, isProfileURL, IUserDataProfileService, IUserDataProfileManagementService, PROFILE_URL_AUTHORITY, PROFILE_URL_AUTHORITY_PREFIX, IUserDataProfileImportExportService, defaultUserDataProfileIcon, PROFILES_TITLE, PROFILES_CATEGORY, PROFILE_EXTENSION, PROFILE_FILTER, CURRENT_PROFILE_CONTEXT, HAS_PROFILES_CONTEXT };
