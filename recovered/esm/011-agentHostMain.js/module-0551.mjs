// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/builtInChatContributions.ts
import { DisposableStore } from "./module-0010.mjs";
import { LocalCommandContribution } from "./module-0538.mjs";
import { TurnAdmissionContribution } from "./module-0548.mjs";
import { TurnDelegationContribution } from "./module-0549.mjs";
import { PersistedTurnUsageContribution } from "./module-0541.mjs";
import { WorktreeAnnouncementContribution } from "./module-0550.mjs";
import { CheckpointAndChangesetContribution } from "./module-0536.mjs";
import { QueueDrainContribution } from "./module-0542.mjs";
import { SessionInputNeededContribution } from "./module-0544.mjs";
import { GitHubReferencesContribution } from "./module-0537.mjs";
import { SessionTitleContribution } from "./module-0545.mjs";
import { MarkUnreadContribution } from "./module-0540.mjs";
import { ChatDraftContribution } from "./module-0534.mjs";
import { MarkdownPlanRichLinksContribution } from "./module-0539.mjs";
import { ArtifactToolsContribution } from "./module-0533.mjs";
import { ChatSurfaceContribution } from "./module-0535.mjs";
import { SideChatContribution } from "./module-0547.mjs";
import { SessionFlagsContribution } from "./module-0543.mjs";


// src/vs/platform/agentHost/node/chatContributions/builtInChatContributions.ts
function registerBuiltInChatContributions(contributions) {
  const registrations = new DisposableStore();
  registrations.add(contributions.registerContribution(LocalCommandContribution));
  registrations.add(contributions.registerContribution(TurnAdmissionContribution));
  registrations.add(contributions.registerContribution(TurnDelegationContribution));
  registrations.add(contributions.registerContribution(PersistedTurnUsageContribution));
  registrations.add(contributions.registerContribution(WorktreeAnnouncementContribution));
  registrations.add(contributions.registerContribution(CheckpointAndChangesetContribution));
  registrations.add(contributions.registerContribution(QueueDrainContribution));
  registrations.add(contributions.registerContribution(SessionInputNeededContribution));
  registrations.add(contributions.registerContribution(GitHubReferencesContribution));
  registrations.add(contributions.registerContribution(SessionTitleContribution));
  registrations.add(contributions.registerContribution(MarkUnreadContribution));
  registrations.add(contributions.registerContribution(ChatDraftContribution));
  registrations.add(contributions.registerContribution(MarkdownPlanRichLinksContribution));
  registrations.add(contributions.registerContribution(ArtifactToolsContribution));
  registrations.add(contributions.registerContribution(ChatSurfaceContribution));
  registrations.add(contributions.registerContribution(SideChatContribution));
  registrations.add(contributions.registerContribution(SessionFlagsContribution));
  return registrations;
}
export { registerBuiltInChatContributions };
