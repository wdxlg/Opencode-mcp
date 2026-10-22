// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/aiCustomizationWorkspaceService.ts
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { AGENT_HOST_SCHEME } from "./module-1001.mjs";
import { relativePath } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { CustomizationCreatorService } from "./module-2645.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/sessions/contrib/chat/browser/aiCustomizationWorkspaceService.ts
var SessionsAICustomizationWorkspaceService = class {
  constructor(sessionsService, instantiationService, promptsService, commandService, logService, fileService, notificationService) {
    this.sessionsService = sessionsService;
    this.instantiationService = instantiationService;
    this.promptsService = promptsService;
    this.commandService = commandService;
    this.logService = logService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    this.managementSections = [
      AICustomizationManagementSection.Plugins,
      AICustomizationManagementSection.McpServers,
      AICustomizationManagementSection.Skills,
      AICustomizationManagementSection.Instructions,
      AICustomizationManagementSection.Agents,
      AICustomizationManagementSection.Hooks,
      AICustomizationManagementSection.Tools,
      AICustomizationManagementSection.Automations,
      AICustomizationManagementSection.HarnessSettings
    ];
    this.isSessionsWindow = true;
    this.welcomePageFeatures = {
      showGettingStartedBanner: true
    };
    this._overrideRoot = observableValue(this, void 0);
    this.activeProjectRoot = derived((reader) => {
      const override = this._overrideRoot.read(reader);
      if (override) {
        return override;
      }
      const session = this.sessionsService.activeSession.read(reader);
      const folder = session?.workspace.read(reader)?.folders[0];
      const root = folder?.workingDirectory;
      if (root?.scheme === AGENT_HOST_SCHEME) {
        return void 0;
      }
      return root;
    });
    this.hasOverrideProjectRoot = derived((reader) => {
      return this._overrideRoot.read(reader) !== void 0;
    });
  }
  getActiveProjectRoot() {
    const override = this._overrideRoot.get();
    if (override) {
      return override;
    }
    const session = this.sessionsService.activeSession.get();
    const folder = session?.workspace.get()?.folders[0];
    const root = folder?.workingDirectory;
    if (root?.scheme === AGENT_HOST_SCHEME) {
      return void 0;
    }
    return root;
  }
  setOverrideProjectRoot(root) {
    this._overrideRoot.set(root, void 0);
  }
  clearOverrideProjectRoot() {
    this._overrideRoot.set(void 0, void 0);
  }
  /**
   * Commits customization files. Always commits to the main repository
   * so the change persists across worktrees. When a worktree is active
   * the file is also committed there so the session sees it immediately.
   */
  async commitFiles(_projectRoot, fileUris) {
    const session = this.sessionsService.activeSession.get();
    const folder = session?.workspace.get()?.folders[0];
    if (!folder?.root) {
      return;
    }
    for (const fileUri of fileUris) {
      await this.commitFileToRepos(fileUri, folder.root, folder.workingDirectory);
    }
  }
  /**
   * Commits the deletion of files that have already been removed from disk.
   * Always stages + commits the removal in the main repository, and also
   * in the worktree if one is active.
   */
  async deleteFiles(_projectRoot, fileUris) {
    const session = this.sessionsService.activeSession.get();
    const folder = session?.workspace.get()?.folders[0];
    if (!folder?.root) {
      return;
    }
    for (const fileUri of fileUris) {
      await this.commitDeletionToRepos(fileUri, folder.root, folder.workingDirectory);
    }
  }
  /**
   * Computes the repository-relative path for a file. The file may be
   * located under the worktree or the repository root.
   */
  getRelativePath(fileUri, repositoryUri, worktreeUri) {
    if (worktreeUri) {
      const rel = relativePath(worktreeUri, fileUri);
      if (rel) {
        return rel;
      }
    }
    return relativePath(repositoryUri, fileUri);
  }
  /**
   * Commits a single file to the main repository and optionally the worktree.
   * Copies the file content between trees when needed.
   */
  async commitFileToRepos(fileUri, repositoryUri, worktreeUri) {
    const relPath = this.getRelativePath(fileUri, repositoryUri, worktreeUri);
    if (!relPath) {
      return;
    }
    const repoFileUri = URI.joinPath(repositoryUri, relPath);
    try {
      if (repoFileUri.toString() !== fileUri.toString()) {
        const content = await this.fileService.readFile(fileUri);
        await this.fileService.writeFile(repoFileUri, content.value);
      }
      await this.commandService.executeCommand(
        "github.copilot.cli.sessions.commitToRepository",
        { repositoryUri, fileUri: repoFileUri }
      );
    } catch (error) {
      this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit to repository:", error);
      if (worktreeUri) {
        this.notificationService.notify({
          severity: Severity2.Warning,
          message: localize(4311, null)
        });
      }
    }
    if (worktreeUri) {
      const worktreeFileUri = URI.joinPath(worktreeUri, relPath);
      try {
        if (worktreeFileUri.toString() !== fileUri.toString()) {
          const content = await this.fileService.readFile(fileUri);
          await this.fileService.writeFile(worktreeFileUri, content.value);
        }
        await this.commandService.executeCommand(
          "github.copilot.cli.sessions.commitToWorktree",
          { worktreeUri, fileUri: worktreeFileUri }
        );
      } catch (error) {
        this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit to worktree:", error);
      }
    }
  }
  /**
   * Commits the deletion of a file to the main repository and optionally
   * the worktree. The file is already deleted from disk before this is called;
   * `git add` on a deleted path stages the removal.
   */
  async commitDeletionToRepos(fileUri, repositoryUri, worktreeUri) {
    const relPath = this.getRelativePath(fileUri, repositoryUri, worktreeUri);
    if (!relPath) {
      return;
    }
    const repoFileUri = URI.joinPath(repositoryUri, relPath);
    try {
      if (await this.fileService.exists(repoFileUri)) {
        await this.fileService.del(repoFileUri, { useTrash: true, recursive: true });
      }
      await this.commandService.executeCommand(
        "github.copilot.cli.sessions.commitToRepository",
        { repositoryUri, fileUri: repoFileUri }
      );
    } catch (error) {
      this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit deletion to repository:", error);
      if (worktreeUri) {
        this.notificationService.notify({
          severity: Severity2.Warning,
          message: localize(4312, null)
        });
      }
    }
    if (worktreeUri) {
      const worktreeFileUri = URI.joinPath(worktreeUri, relPath);
      try {
        await this.commandService.executeCommand(
          "github.copilot.cli.sessions.commitToWorktree",
          { worktreeUri, fileUri: worktreeFileUri }
        );
      } catch (error) {
        this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit deletion to worktree:", error);
      }
    }
  }
  async generateCustomization(type) {
    const creator = this.instantiationService.createInstance(CustomizationCreatorService);
    await creator.createWithAI(type);
  }
  async getFilteredPromptSlashCommands(token) {
    return await this.promptsService.getPromptSlashCommands(token);
  }
  static {
    this._skillUIIntegrations = /* @__PURE__ */ new Map([
      ["act-on-feedback", localize(4313, null)],
      ["fix-ci", localize(4318, null)],
      ["code-review", localize(4314, null)],
      ["generate-run-commands", localize(4319, null)],
      ["create-pr", localize(4317, null)],
      ["create-draft-pr", localize(4316, null)],
      ["update-pr", localize(4321, null)],
      ["merge-changes", localize(4320, null)],
      ["commit", localize(4315, null)]
    ]);
  }
  getSkillUIIntegrations() {
    return SessionsAICustomizationWorkspaceService._skillUIIntegrations;
  }
};

SessionsAICustomizationWorkspaceService = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IPromptsService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IFileService),
  __decorateParam(6, INotificationService)
], SessionsAICustomizationWorkspaceService);
export { SessionsAICustomizationWorkspaceService };
