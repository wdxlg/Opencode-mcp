// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/encryption/electron-browser/encryption.contribution.ts
import { isLinux } from "./module-0014.mjs";
import { parse12 } from "./module-2200.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IJSONEditingService } from "./module-1643.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/encryption/electron-browser/encryption.contribution.ts
var EncryptionContribution = class {
  constructor(jsonEditingService, environmentService, fileService, storageService) {
    this.jsonEditingService = jsonEditingService;
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.storageService = storageService;
    this.migrateToGnomeLibsecret();
  }
  /**
   * Migrate the user from using the gnome or gnome-keyring password-store to gnome-libsecret.
   * TODO@TylerLeonhardt: This migration can be removed in 3 months or so and then storage
   * can be cleaned up.
   */
  async migrateToGnomeLibsecret() {
    if (!isLinux || this.storageService.getBoolean("encryption.migratedToGnomeLibsecret", -1 /* APPLICATION */, false)) {
      return;
    }
    try {
      const content2 = await this.fileService.readFile(this.environmentService.argvResource);
      const argv = parse12(content2.value.toString());
      if (argv["password-store"] === "gnome" || argv["password-store"] === "gnome-keyring") {
        this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ["password-store"], value: "gnome-libsecret" }], true);
      }
      this.storageService.store("encryption.migratedToGnomeLibsecret", true, -1 /* APPLICATION */, 0 /* USER */);
    } catch (error) {
      console.error(error);
    }
  }
};

EncryptionContribution = __decorateClass([
  __decorateParam(0, IJSONEditingService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IStorageService)
], EncryptionContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(EncryptionContribution, 4 /* Eventually */);
export { EncryptionContribution };
