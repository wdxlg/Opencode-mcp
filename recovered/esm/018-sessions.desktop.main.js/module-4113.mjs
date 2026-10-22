// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/nativeGitHubUploadService.ts
import { Disposable } from "./module-0012.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { INativeHostService } from "./module-2566.mjs";


// src/vs/workbench/contrib/issue/electron-browser/nativeGitHubUploadService.ts
var NativeGitHubUploadService = class extends Disposable {
  constructor(logService, nativeHostService) {
    super();
    this.logService = logService;
    this.nativeHostService = nativeHostService;
  }
  async resolveRepositoryId(owner, repo, token) {
    const headers = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const r2 = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { headers });
    if (!r2.ok) {
      const body = await r2.text().catch(() => "");
      throw new Error(`Repo ID lookup failed for ${owner}/${repo}: ${r2.status} ${r2.statusText}${body ? ` \u2014 ${body.substring(0, 300)}` : ""}`);
    }
    const json = await r2.json();
    return String(json.id);
  }
  async uploadViaMobileApi(token, repoId, files) {
    const results = [];
    for (const file of files) {
      const result = await this.nativeHostService.uploadFileViaMobileApi(
        token,
        repoId,
        file.name,
        VSBuffer.wrap(file.bytes),
        file.contentType
      );
      this.logService.info(`[GitHubUpload] Uploaded ${file.name} (${file.bytes.length} bytes) -> ${result.assetUrl}`);
      results.push(result);
    }
    return results;
  }
};

NativeGitHubUploadService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, INativeHostService)
], NativeGitHubUploadService);
export { NativeGitHubUploadService };
