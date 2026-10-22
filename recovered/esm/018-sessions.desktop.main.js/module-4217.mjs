// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/policyExport/electron-browser/policyExport.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { join } from "./module-0026.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { PolicyCategory, PolicyCategoryData } from "./module-0873.mjs";
import { hasKey } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { process2 } from "./module-3821.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/policyExport/electron-browser/policyExport.contribution.ts
var PolicyExportContribution = class extends Disposable {
  constructor(nativeEnvironmentService, extensionService, fileService, configurationService, nativeHostService, progressService, logService) {
    super();
    this.nativeEnvironmentService = nativeEnvironmentService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.nativeHostService = nativeHostService;
    this.progressService = progressService;
    this.logService = logService;
    if (this.nativeEnvironmentService.isBuilt) {
      return;
    }
    const policyDataPath = this.nativeEnvironmentService.exportPolicyData;
    if (policyDataPath !== void 0) {
      const defaultPath = join(this.nativeEnvironmentService.appRoot, PolicyExportContribution.DEFAULT_POLICY_EXPORT_PATH);
      void this.exportPolicyDataAndQuit(policyDataPath ? policyDataPath : defaultPath);
    }
  }
  static {
    this.ID = "workbench.contrib.policyExport";
  }
  static {
    this.DEFAULT_POLICY_EXPORT_PATH = "build/lib/policies/policyData.jsonc";
  }
  log(msg, ...args2) {
    this.logService.info(`[${PolicyExportContribution.ID}]`, msg, ...args2);
  }
  async exportPolicyDataAndQuit(policyDataPath) {
    try {
      await this.progressService.withProgress({
        location: 15 /* Notification */,
        title: `Exporting policy data to ${policyDataPath}`
      }, async (_progress) => {
        this.log("Export started. Waiting for configurations to load.");
        await this.extensionService.whenInstalledExtensionsRegistered();
        await this.configurationService.whenRemoteConfigurationLoaded();
        this.log("Extensions and configuration loaded.");
        const configurationRegistry25 = Registry.as(Extensions4.Configuration);
        const configurationProperties = {
          ...configurationRegistry25.getExcludedConfigurationProperties(),
          ...configurationRegistry25.getConfigurationProperties()
        };
        const policyData = {
          categories: Object.values(PolicyCategory).map((category9) => ({
            key: category9,
            name: PolicyCategoryData[category9].name
          })),
          policies: []
        };
        for (const [key3, schema10] of Object.entries(configurationProperties)) {
          if (schema10.policy?.localization) {
            policyData.policies.push({
              key: key3,
              name: schema10.policy.name,
              category: schema10.policy.category,
              minimumVersion: schema10.policy.minimumVersion,
              localization: {
                description: schema10.policy.localization.description,
                enumDescriptions: schema10.policy.localization.enumDescriptions
              },
              type: schema10.type,
              default: schema10.default,
              enum: schema10.enum,
              included: schema10.included !== false
            });
          }
        }
        this.log(`Discovered ${policyData.policies.length} policies to export.`);
        const distroProduct = await this.getDistroProductJson();
        const extensionPolicies = distroProduct["extensionConfigurationPolicy"];
        const productReferencesByPolicyName = /* @__PURE__ */ new Map();
        if (extensionPolicies) {
          const existingKeys = new Set(policyData.policies.map((p) => p.key));
          let added = 0;
          let referenced = 0;
          for (const [key3, entry] of Object.entries(extensionPolicies)) {
            if (existingKeys.has(key3)) {
              continue;
            }
            if (hasKey(entry, { policyReference: true })) {
              const ownerName = entry.policyReference?.name;
              if (!ownerName) {
                throw new Error(`Extension policy reference '${key3}' is missing required 'policyReference.name' field.`);
              }
              const list2 = productReferencesByPolicyName.get(ownerName) ?? [];
              list2.push(key3);
              productReferencesByPolicyName.set(ownerName, list2);
              referenced++;
              continue;
            }
            if (!entry.name || !entry.category || !entry.description) {
              throw new Error(`Extension policy '${key3}' is missing required 'name', 'category', or 'description' field.`);
            }
            policyData.policies.push({
              key: key3,
              name: entry.name,
              category: entry.category,
              minimumVersion: entry.minimumVersion,
              localization: {
                description: { key: key3, value: entry.description }
              },
              type: "boolean",
              default: true,
              included: true
            });
            added++;
          }
          this.log(`Merged ${added} extension configuration policies (${referenced} references).`);
        }
        const policyReferenceConfigurations = configurationRegistry25.getPolicyReferenceConfigurations();
        const linkedProductReferenceNames = /* @__PURE__ */ new Set();
        let linkedReferences = 0;
        for (const policy of policyData.policies) {
          const references = new Set(policyReferenceConfigurations.get(policy.name) ?? []);
          const productReferences = productReferencesByPolicyName.get(policy.name);
          if (productReferences) {
            for (const productRefKey of productReferences) {
              references.add(productRefKey);
            }
            linkedProductReferenceNames.add(policy.name);
          }
          if (references.size > 0) {
            for (const referenceKey of references) {
              const referenceType = configurationProperties[referenceKey]?.type;
              if (referenceType !== void 0 && referenceType !== policy.type) {
                throw new Error(`Policy '${policy.name}': setting '${referenceKey}' (type '${referenceType}') declares a 'policyReference' to a policy of type '${policy.type}'. A 'policyReference' must match the owning setting's type.`);
              }
            }
            policy.referencedSettings = [...references].sort();
            linkedReferences += references.size;
          }
        }
        for (const policyName of productReferencesByPolicyName.keys()) {
          if (!linkedProductReferenceNames.has(policyName)) {
            throw new Error(`Extension policy reference to '${policyName}' has no owning policy. Ensure an in-code setting declares 'policy: { name: '${policyName}', ... }'.`);
          }
        }
        this.log(`Linked ${linkedReferences} referenced settings across ${policyData.policies.length} policies.`);
        const disclaimerComment = `/** THIS FILE IS AUTOMATICALLY GENERATED USING \`npm run export-policy-data\`. DO NOT MODIFY IT MANUALLY. **/`;
        const policyDataFileContent = `${disclaimerComment}
${JSON.stringify(policyData, null, 4)}
`;
        await this.fileService.writeFile(URI.file(policyDataPath), VSBuffer.fromString(policyDataFileContent));
        this.log(`Successfully exported ${policyData.policies.length} policies to ${policyDataPath}.`);
      });
      await this.nativeHostService.exit(0);
    } catch (error) {
      this.log("Failed to export policy", error);
      await this.nativeHostService.exit(1);
    }
  }
  /**
   * Reads the distro product.json for the 'stable' quality.
   * Checks DISTRO_PRODUCT_JSON env var (for testing),
   * then falls back to fetching from the GitHub API using GITHUB_TOKEN.
   */
  async getDistroProductJson() {
    const root = this.nativeEnvironmentService.appRoot;
    const envPath = process2.env["DISTRO_PRODUCT_JSON"];
    if (envPath) {
      this.log(`Reading distro product.json from DISTRO_PRODUCT_JSON=${envPath}`);
      const content2 = (await this.fileService.readFile(URI.file(envPath))).value.toString();
      return JSON.parse(content2);
    }
    const packageJsonPath = join(root, "package.json");
    const packageJsonContent = (await this.fileService.readFile(URI.file(packageJsonPath))).value.toString();
    const packageJson = JSON.parse(packageJsonContent);
    const distroCommit = packageJson.distro;
    if (!distroCommit) {
      throw new Error(
        "No distro commit found in package.json. Use `npm run export-policy-data` which sets up the required environment."
      );
    }
    const token = process2.env["GITHUB_TOKEN"];
    if (!token) {
      throw new Error(
        "GITHUB_TOKEN is required to fetch distro product.json. Use `npm run export-policy-data` which sets up the required environment."
      );
    }
    this.log(`Fetching distro product.json for commit ${distroCommit} from GitHub...`);
    const url = `https://api.github.com/repos/microsoft/vscode-distro/contents/mixin/stable/product.json?ref=${encodeURIComponent(distroCommit)}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "VSCode Build"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch distro product.json: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.encoding !== "base64") {
      throw new Error(`Unexpected encoding from GitHub API: ${data.encoding}`);
    }
    const content = VSBuffer.wrap(Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0))).toString();
    return JSON.parse(content);
  }
};

PolicyExportContribution = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IWorkbenchConfigurationService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IProgressService),
  __decorateParam(6, ILogService)
], PolicyExportContribution);

registerWorkbenchContribution2(
  PolicyExportContribution.ID,
  PolicyExportContribution,
  WorkbenchPhase.Eventually
);
export { PolicyExportContribution };
