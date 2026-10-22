// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetAchievements.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetAchievements.ts
var CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID = "chat.pet.openAchievements";

var ChatPetAchievementIds = {
  RequestRevision: "requestRevision",
  FirstChatMessage: "firstChatMessage",
  ModelSwitch: "modelSwitch",
  QueueOrSteeringMessage: "queueOrSteeringMessage",
  AgentsWindowOpened: "agentsWindowOpened",
  CreatePullRequest: "createPullRequest",
  AgentEditKept: "agentEditKept",
  AgentChangesReviewed: "agentChangesReviewed",
  ChatReferenceOpened: "chatReferenceOpened",
  UsefulOutputCopied: "usefulOutputCopied",
  AutopilotEnabled: "autopilotEnabled",
  IntegratedBrowserShared: "integratedBrowserShared",
  ChatOutputCopied: "chatOutputCopied",
  CustomSkillPresent: "customSkillPresent",
  McpServerPresent: "mcpServerPresent",
  InstructionPresent: "instructionPresent",
  ImageRequest: "imageRequest"
};

var ChatPetAccessoryIds = {
  CowboyHat: "cowboyHat",
  TopHatMonocle: "topHatMonocle",
  SailorHat: "sailorHat",
  DarkSailorHat: "darkSailorHat",
  BaseballCap: "baseballCap",
  PartyHat: "partyHat",
  PinkPartyHat: "pinkPartyHat",
  SpinnerHat: "spinnerHat",
  PropellerHat: "propellerHat",
  ConstructionHardHat: "constructionHardHat",
  FirefighterHelmet: "firefighterHelmet",
  Crown: "crown",
  ArtistBeret: "artistBeret",
  BambooHat: "bambooHat",
  StrawHat: "strawHat",
  WhiteChefHat: "whiteChefHat",
  WizardHat: "wizardHat"
};

var enabledChatPetAchievements = [
  {
    id: ChatPetAchievementIds.RequestRevision,
    title: localize(10998, null),
    description: localize(10996, null),
    hint: localize(10997, null),
    enabled: true,
    accessories: [
      {
        id: ChatPetAccessoryIds.TopHatMonocle,
        label: localize(10948, null),
        atlasName: "grand-top-hat-monocle",
        atlasCellSize: 96,
        eyeAccessoryMirrorsWithFacing: false,
        coversAntennae: true
      }
    ]
  },
  {
    id: ChatPetAchievementIds.FirstChatMessage,
    title: localize(10977, null),
    description: localize(10975, null),
    hint: localize(10976, null),
    enabled: true,
    accessories: [
      {
        id: ChatPetAccessoryIds.CowboyHat,
        label: localize(10938, null),
        atlasName: "cowboy-hat",
        atlasCellSize: 96,
        coversAntennae: true
      }
    ]
  },
  {
    id: ChatPetAchievementIds.IntegratedBrowserShared,
    title: localize(10986, null),
    description: localize(10984, null),
    hint: localize(10985, null),
    enabled: true,
    accessories: [
      {
        id: ChatPetAccessoryIds.BaseballCap,
        label: localize(10936, null),
        atlasName: "baseball-cap",
        atlasCellSize: 96,
        coversAntennae: true
      }
    ]
  },
  {
    id: ChatPetAchievementIds.ModelSwitch,
    title: localize(10992, null),
    description: localize(10990, null),
    hint: localize(10991, null),
    enabled: true,
    accessories: [
      {
        id: ChatPetAccessoryIds.ConstructionHardHat,
        label: localize(10937, null),
        atlasName: "construction-hard-hat",
        atlasCellSize: 96,
        coversAntennae: true
      }
    ]
  },
  {
    id: ChatPetAchievementIds.McpServerPresent,
    title: localize(10989, null),
    description: localize(10987, null),
    hint: localize(10988, null),
    enabled: true,
    accessories: [
      {
        id: ChatPetAccessoryIds.FirefighterHelmet,
        label: localize(10941, null),
        atlasName: "firefighter-helmet",
        atlasCellSize: 96,
        coversAntennae: true
      }
    ]
  },
  {
    id: ChatPetAchievementIds.CustomSkillPresent,
    title: localize(10974, null),
    description: localize(10972, null),
    hint: localize(10973, null),
    enabled: true,
    accessories: [
      {
        id: ChatPetAccessoryIds.Crown,
        label: localize(10939, null),
        atlasName: "crown",
        atlasCellSize: 96,
        coversAntennae: true
      }
    ]
  },
  {
    id: ChatPetAchievementIds.AgentsWindowOpened,
    title: localize(10959, null),
    description: localize(10957, null),
    hint: localize(10958, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.PropellerHat,
      label: localize(10944, null),
      atlasName: "propeller-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.CreatePullRequest,
    title: localize(10971, null),
    description: localize(10969, null),
    hint: localize(10970, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.DarkSailorHat,
      label: localize(10940, null),
      atlasName: "dark-sailor-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.AgentEditKept,
    title: localize(10956, null),
    description: localize(10954, null),
    hint: localize(10955, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.WhiteChefHat,
      label: localize(10949, null),
      atlasName: "white-chef-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.AgentChangesReviewed,
    title: localize(10953, null),
    description: localize(10951, null),
    hint: localize(10952, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.BambooHat,
      label: localize(10935, null),
      atlasName: "bamboo-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.ChatReferenceOpened,
    title: localize(10968, null),
    description: localize(10966, null),
    hint: localize(10967, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.StrawHat,
      label: localize(10947, null),
      atlasName: "straw-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.UsefulOutputCopied,
    title: localize(11001, null),
    description: localize(10999, null),
    hint: localize(11000, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.PinkPartyHat,
      label: localize(10943, null),
      atlasName: "pink-party-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.AutopilotEnabled,
    title: localize(10962, null),
    description: localize(10960, null),
    hint: localize(10961, null),
    enabled: true,
    accessories: [{
      id: ChatPetAccessoryIds.WizardHat,
      label: localize(10950, null),
      atlasName: "wizard-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  }
];

var disabledChatPetAchievements = [
  {
    id: ChatPetAchievementIds.InstructionPresent,
    title: localize(10983, null),
    description: localize(10981, null),
    hint: localize(10982, null),
    enabled: false,
    accessories: [{
      id: ChatPetAccessoryIds.SailorHat,
      label: localize(10945, null),
      atlasName: "sailor-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.QueueOrSteeringMessage,
    title: localize(10995, null),
    description: localize(10993, null),
    hint: localize(10994, null),
    enabled: false,
    accessories: [{
      id: ChatPetAccessoryIds.SpinnerHat,
      label: localize(10946, null),
      atlasName: "full-size-spinner-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.ChatOutputCopied,
    title: localize(10965, null),
    description: localize(10963, null),
    hint: localize(10964, null),
    enabled: false,
    accessories: [{
      id: ChatPetAccessoryIds.PartyHat,
      label: localize(10942, null),
      atlasName: "leaning-party-hat",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  },
  {
    id: ChatPetAchievementIds.ImageRequest,
    title: localize(10980, null),
    description: localize(10978, null),
    hint: localize(10979, null),
    enabled: false,
    accessories: [{
      id: ChatPetAccessoryIds.ArtistBeret,
      label: localize(10934, null),
      atlasName: "artist-beret",
      atlasCellSize: 96,
      coversAntennae: true
    }]
  }
];

var allChatPetAchievements = [...enabledChatPetAchievements, ...disabledChatPetAchievements];

var chatPetAchievements = allChatPetAchievements.filter((achievement) => achievement.enabled);

var chatPetAchievementIds = new Set(chatPetAchievements.map((achievement) => achievement.id));

var allChatPetAchievementIds = new Set(allChatPetAchievements.map((achievement) => achievement.id));

var chatPetAccessories = chatPetAchievements.flatMap((achievement) => achievement.accessories);

var allChatPetAccessories = allChatPetAchievements.flatMap((achievement) => achievement.accessories);

var chatPetAccessoryById = new Map(chatPetAccessories.map((accessory) => [accessory.id, accessory]));

var allChatPetAccessoryById = new Map(allChatPetAccessories.map((accessory) => [accessory.id, accessory]));

function isChatPetAchievementId(value2) {
  return allChatPetAchievementIds.has(value2);
}

function isChatPetAchievementEnabled(id2) {
  return chatPetAchievementIds.has(id2);
}

function isChatPetAccessoryId(value2) {
  return allChatPetAccessoryById.has(value2);
}

function getChatPetAchievement(id2) {
  const achievement = chatPetAchievements.find((candidate) => candidate.id === id2);
  if (!achievement) {
    throw new Error(`Unknown chat pet achievement: ${id2}`);
  }
  return achievement;
}

function getChatPetAccessory(id2) {
  const accessory = chatPetAccessoryById.get(id2);
  if (!accessory) {
    throw new Error(`Unknown chat pet accessory: ${id2}`);
  }
  return accessory;
}

function getChatPetAchievementForAccessory(id2) {
  const achievement = allChatPetAchievements.find((candidate) => candidate.accessories.some((accessory) => accessory.id === id2));
  if (!achievement) {
    throw new Error(`No chat pet achievement rewards accessory: ${id2}`);
  }
  return achievement;
}

function didExplicitlySwitchChatPetModel(previousModelIdentifier, selectedModelIdentifier) {
  return previousModelIdentifier !== void 0 && previousModelIdentifier !== selectedModelIdentifier;
}

function didExplicitlyEnableChatPetAutopilot(previousMode, selectedMode) {
  return previousMode === "interactive" && selectedMode === "autopilot";
}

function hasChatPetImageAttachment(entries2) {
  return entries2.some((entry) => entry.kind === "image");
}

function shouldUnlockChatPetIntegratedBrowserShare(shared, succeeded) {
  return shared && succeeded;
}

function isUserAuthoredChatPetCustomization(source, isBuiltin) {
  return !isBuiltin && (source === "local" || source === "user");
}

function getChatPetAchievementPresentation(achievement, unlocked) {
  return unlocked ? {
    locked: false,
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    accessories: achievement.accessories
  } : {
    locked: true,
    id: achievement.id,
    hint: achievement.hint,
    rewardLabels: achievement.accessories.map((accessory) => accessory.label)
  };
}
export { isChatPetAchievementId, isChatPetAchievementEnabled, isChatPetAccessoryId, getChatPetAchievement, getChatPetAccessory, getChatPetAchievementForAccessory, didExplicitlySwitchChatPetModel, didExplicitlyEnableChatPetAutopilot, hasChatPetImageAttachment, shouldUnlockChatPetIntegratedBrowserShare, isUserAuthoredChatPetCustomization, getChatPetAchievementPresentation, CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID, ChatPetAchievementIds, ChatPetAccessoryIds, enabledChatPetAchievements, disabledChatPetAchievements, allChatPetAchievements, chatPetAchievements, chatPetAchievementIds, allChatPetAchievementIds, chatPetAccessories, allChatPetAccessories, chatPetAccessoryById, allChatPetAccessoryById };
