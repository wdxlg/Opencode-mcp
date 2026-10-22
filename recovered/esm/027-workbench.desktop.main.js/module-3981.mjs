// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/common/issueReporterUtil.ts
import { rtrim } from "./module-0030.mjs";


// src/vs/workbench/contrib/issue/common/issueReporterUtil.ts
function normalizeGitHubUrl(url) {
  if (url.endsWith(".git")) {
    url = url.substr(0, url.length - 4);
  }
  url = rtrim(url, "/");
  if (url.endsWith("/new")) {
    url = rtrim(url, "/new");
  }
  if (url.endsWith("/issues")) {
    url = rtrim(url, "/issues");
  }
  return url;
}
export { normalizeGitHubUrl };
