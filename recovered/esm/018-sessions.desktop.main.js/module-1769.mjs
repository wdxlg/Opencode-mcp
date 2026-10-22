// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/worktreeTrust.ts
import { isWorktreeUnderRepository } from "./module-1768.mjs";


// src/vs/sessions/services/sessions/browser/worktreeTrust.ts
async function ensureSessionWorktreesTrusted(workspace, workspaceTrustManagementService) {
  if (!workspace?.requiresWorkspaceTrust) {
    return;
  }
  await Promise.all(workspace.folders.map(async (folder) => {
    const gitRepository = folder.gitRepository;
    if (!gitRepository?.workTreeUri || !isWorktreeUnderRepository(folder.workingDirectory, gitRepository.uri)) {
      return;
    }
    const [worktreeTrust, baseRepoTrust] = await Promise.all([
      workspaceTrustManagementService.getUriTrustInfo(folder.workingDirectory),
      workspaceTrustManagementService.getUriTrustInfo(gitRepository.uri)
    ]);
    if (!worktreeTrust.trusted && baseRepoTrust.trusted) {
      await workspaceTrustManagementService.setUrisTrust([folder.workingDirectory], true);
    }
  }));
}
export { ensureSessionWorktreesTrusted };
