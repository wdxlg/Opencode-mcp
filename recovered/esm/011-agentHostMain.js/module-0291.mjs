// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotGitProject.ts
import { Schemas } from "./module-0024.mjs";
import { tryResolvePrimaryWorktreeRoot } from "./module-0162.mjs";
import { basename } from "./module-0018.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/node/copilot/copilotGitProject.ts
async function resolveGitProject(workingDirectory, gitService) {
  if (!workingDirectory || workingDirectory.scheme !== Schemas.file) {
    return void 0;
  }
  const repositoryRoot = await gitService.getRepositoryRoot(workingDirectory);
  if (!repositoryRoot) {
    return void 0;
  }
  const uri = await tryResolvePrimaryWorktreeRoot(gitService, repositoryRoot) ?? repositoryRoot;
  return { uri, displayName: basename(uri.fsPath) || uri.toString() };
}

function projectFromRepository(repository) {
  const uri = repository.includes("://") ? URI.parse(repository) : URI.parse(`https://github.com/${repository}`);
  const rawDisplayName = basename(uri.path) || repository.split("/").filter(Boolean).pop() || repository;
  const displayName = rawDisplayName.endsWith(".git") ? rawDisplayName.slice(0, -".git".length) : rawDisplayName;
  return { uri, displayName };
}

async function projectFromCopilotContext(context, gitService) {
  const workingDirectory = typeof context?.cwd === "string" ? URI.file(context.cwd) : typeof context?.gitRoot === "string" ? URI.file(context.gitRoot) : void 0;
  const gitProject = await resolveGitProject(workingDirectory, gitService);
  if (gitProject) {
    return gitProject;
  }
  if (context?.repository) {
    return projectFromRepository(context.repository);
  }
  return void 0;
}
export { resolveGitProject, projectFromRepository, projectFromCopilotContext };
