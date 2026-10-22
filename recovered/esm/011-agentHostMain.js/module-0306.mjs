// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/githubMcpServer.ts
import { findExecutable } from "./module-0036.mjs";
import { gitHubMcpServerUrl } from "./module-0160.mjs";


// src/vs/platform/agentHost/node/shared/githubMcpServer.ts
var GITHUB_MCP_SERVER_NAME = "github-mcp-server";

var GITHUB_MCP_FEATURES_HEADER = "X-MCP-Features";

var GITHUB_MCP_FEATURES = "remote_mcp_ui_apps,mcp_apps_disable_form_deferral";

var GITHUB_MCP_TOOLS_HEADER = "X-MCP-Tools";

var GITHUB_MCP_TOOLS_WITHOUT_GH_EQUIVALENTS = [
  "get_file_contents",
  "search_code",
  "get_copilot_space",
  "list_copilot_spaces",
  "web_search",
  "search_users"
];

var GITHUB_MCP_TOOLS_WITH_GH_EQUIVALENTS = [
  "search_repositories",
  "list_branches",
  "list_commits",
  "get_commit",
  "issue_read",
  "list_issues",
  "search_issues",
  "pull_request_read",
  "list_pull_requests",
  "search_pull_requests",
  "actions_list",
  "actions_get",
  "get_job_logs"
];

var GITHUB_MCP_DEPRECATED_WORKFLOW_TOOLS = [
  "list_workflow_runs",
  "get_workflow_run",
  "list_workflows",
  "get_workflow_run_logs",
  "get_workflow"
];

var ghCliAvailable;

async function isGhCliAvailable() {
  ghCliAvailable ??= (async () => await findExecutable("gh").catch(() => void 0) !== void 0)();
  return ghCliAvailable;
}

function getGitHubMcpTools(hasGhCli) {
  return hasGhCli ? GITHUB_MCP_TOOLS_WITHOUT_GH_EQUIVALENTS : [
    ...GITHUB_MCP_TOOLS_WITHOUT_GH_EQUIVALENTS,
    ...GITHUB_MCP_TOOLS_WITH_GH_EQUIVALENTS,
    ...GITHUB_MCP_DEPRECATED_WORKFLOW_TOOLS
  ];
}

function createGitHubMcpServerConfiguration(copilotApiBaseUri, hasGhCli = false) {
  const url2 = gitHubMcpServerUrl(copilotApiBaseUri);
  if (!url2) {
    throw new Error("Unable to resolve the GitHub MCP server URL");
  }
  const headers = {
    [GITHUB_MCP_FEATURES_HEADER]: GITHUB_MCP_FEATURES,
    [GITHUB_MCP_TOOLS_HEADER]: getGitHubMcpTools(hasGhCli).join(",")
  };
  return {
    type: "http" /* REMOTE */,
    url: url2,
    headers
  };
}

async function resolveGitHubMcpServerConfiguration(copilotApiService, token) {
  if (!token) {
    return void 0;
  }
  const [copilotApiBaseUri, hasGhCli] = await Promise.all([
    copilotApiService.resolveApiEndpoint(token),
    isGhCliAvailable()
  ]);
  if (!copilotApiBaseUri) {
    return void 0;
  }
  return createGitHubMcpServerConfiguration(copilotApiBaseUri, hasGhCli);
}
export { isGhCliAvailable, getGitHubMcpTools, createGitHubMcpServerConfiguration, resolveGitHubMcpServerConfiguration, GITHUB_MCP_SERVER_NAME, GITHUB_MCP_FEATURES_HEADER, GITHUB_MCP_FEATURES, GITHUB_MCP_TOOLS_HEADER, GITHUB_MCP_TOOLS_WITHOUT_GH_EQUIVALENTS, GITHUB_MCP_TOOLS_WITH_GH_EQUIVALENTS, GITHUB_MCP_DEPRECATED_WORKFLOW_TOOLS, ghCliAvailable };
