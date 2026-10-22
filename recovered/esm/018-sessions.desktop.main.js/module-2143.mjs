// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatPetAccessoryRig.ts



// src/vs/workbench/contrib/chat/browser/widget/chatPetAccessoryRig.ts
var defaultHeadAnchor = { x: 48, y: 32 };

var defaultRightEyeAnchor = { x: 56, y: 56 };

var CHAT_PET_HEAD_WEAR_OFFSET = 8;

var trackSpans = {
  idle: [
    { firstFrame: 0, lastFrame: 19, head: defaultHeadAnchor, rightEye: defaultRightEyeAnchor },
    { firstFrame: 20, lastFrame: 49, head: { x: 48, y: 36 }, rightEye: { x: 56, y: 60 } }
  ],
  rendering: [
    { firstFrame: 0, lastFrame: 19, head: defaultHeadAnchor, rightEye: defaultRightEyeAnchor },
    { firstFrame: 20, lastFrame: 49, head: { x: 48, y: 36 }, rightEye: { x: 56, y: 60 } }
  ],
  sleep: [
    { firstFrame: 0, lastFrame: 2, head: defaultHeadAnchor, rightEye: { x: 56, y: 64 } },
    { firstFrame: 3, lastFrame: 7, head: { x: 48, y: 36 }, rightEye: { x: 56, y: 64 } }
  ],
  waking: [
    { firstFrame: 0, lastFrame: 2, head: { x: 48, y: 36 }, pose: "sleeping", rightEye: { x: 56, y: 64 } },
    { firstFrame: 3, lastFrame: 7, head: defaultHeadAnchor, pose: "upright", rightEye: defaultRightEyeAnchor }
  ],
  love: [
    { firstFrame: 0, lastFrame: 3, head: { x: 48, y: 36 } },
    { firstFrame: 4, lastFrame: 5, head: defaultHeadAnchor }
  ],
  jump: [
    { firstFrame: 0, lastFrame: 0, head: defaultHeadAnchor, rightEye: { x: 56, y: 56 } },
    { firstFrame: 1, lastFrame: 1, head: { x: 48, y: 48 }, rightEye: { x: 56, y: 64 } },
    { firstFrame: 2, lastFrame: 2, head: defaultHeadAnchor, rightEye: { x: 56, y: 48 } },
    { firstFrame: 3, lastFrame: 3, head: defaultHeadAnchor, rightEye: { x: 56, y: 40 } },
    { firstFrame: 4, lastFrame: 4, head: { x: 48, y: 56 }, rightEye: { x: 56, y: 64 } },
    { firstFrame: 5, lastFrame: 5, head: defaultHeadAnchor, rightEye: { x: 56, y: 56 } }
  ],
  cool: [
    { firstFrame: 0, lastFrame: 1, head: defaultHeadAnchor },
    { firstFrame: 2, lastFrame: 2, head: { x: 48, y: 36 } },
    { firstFrame: 3, lastFrame: 8, head: defaultHeadAnchor }
  ],
  sing: [
    { firstFrame: 0, lastFrame: 3, head: { x: 48, y: 52 }, rightEye: { x: 56, y: 72 } }
  ],
  worry: [
    { firstFrame: 0, lastFrame: 0, head: defaultHeadAnchor },
    { firstFrame: 1, lastFrame: 1, head: defaultHeadAnchor, mirrorsHeadAccessory: true }
  ],
  dizzy: [
    { firstFrame: 0, lastFrame: 7, head: { x: 48, y: 48 }, hideEyeAccessory: true }
  ],
  falling: [
    { firstFrame: 0, lastFrame: 5, head: defaultHeadAnchor, rightEye: { x: 48, y: 48 } }
  ],
  splat: [
    { firstFrame: 0, lastFrame: 0, head: { x: 48, y: 72 }, pose: "splat", hideEyeAccessory: true },
    { firstFrame: 1, lastFrame: 1, head: { x: 48, y: 64 }, pose: "splat", hideEyeAccessory: true },
    { firstFrame: 2, lastFrame: 2, head: { x: 48, y: 48 }, pose: "splat", hideEyeAccessory: true },
    { firstFrame: 3, lastFrame: 3, head: defaultHeadAnchor, pose: "upright" }
  ]
};

function getChatPetAccessoryTrack(state) {
  switch (state) {
    case "achievementUnlocked":
      return "rendering";
    case "sleep":
    case "waking":
    case "typing":
    case "rendering":
    case "love":
    case "clapping":
    case "jump":
    case "cool":
    case "sing":
    case "speechless":
    case "worry":
    case "dizzy":
    case "falling":
    case "splat":
      return state;
    case "buttonPress":
      return "buttonPress";
    case "yappingMouthOpen":
      return "yapping";
    case "wallImpact":
      return "wallImpact";
    case "onTheRun":
    case "searching":
    case "searchingDown":
      return "search";
    case "complete":
    case "yapping":
    case "idle":
      return "idle";
  }
}

function getDefaultChatPetAccessoryRigPose(state) {
  switch (state) {
    case "sleep":
    case "waking":
      return "sleeping";
    case "jump":
    case "dizzy":
    case "falling":
      return "airborne";
    case "wallImpact":
      return "impact";
    case "splat":
      return "splat";
    default:
      return "upright";
  }
}

function getChatPetAccessoryRigFrame(state, frameIndex) {
  const spans = trackSpans[getChatPetAccessoryTrack(state)];
  const span = spans?.find((candidate) => frameIndex >= candidate.firstFrame && frameIndex <= candidate.lastFrame);
  const trackedHead = span?.head ?? defaultHeadAnchor;
  const hideEyeAccessory = span?.hideEyeAccessory || doesChatPetStateHideEyeAccessory(state);
  return {
    pose: span?.pose ?? getDefaultChatPetAccessoryRigPose(state),
    head: state === "love" || state === "complete" || state === "dizzy" ? void 0 : {
      x: trackedHead.x,
      y: trackedHead.y + CHAT_PET_HEAD_WEAR_OFFSET
    },
    rightEye: hideEyeAccessory ? void 0 : span?.rightEye ?? defaultRightEyeAnchor,
    ...span?.mirrorsHeadAccessory ? { mirrorsHeadAccessory: true } : {}
  };
}

function getChatPetAntennaeOcclusionBounds(state, frameIndex) {
  const rigFrame = getChatPetAccessoryRigFrame(state, frameIndex);
  if (!rigFrame.head) {
    return void 0;
  }
  if (rigFrame.pose === "impact") {
    return {
      x: 16,
      y: 24,
      width: 64,
      height: 8
    };
  }
  return {
    x: rigFrame.head.x - 32,
    y: rigFrame.head.y - 48,
    width: 64,
    height: 40
  };
}

function getChatPetEyeAccessoryAnchor(state, frameIndex, facingDirection, mirrorsWithFacing, frameWidth = 96) {
  const anchor = getChatPetAccessoryRigFrame(state, frameIndex).rightEye;
  if (!anchor || facingDirection === "right" || mirrorsWithFacing) {
    return anchor;
  }
  return {
    x: anchor.x - 16 + frameWidth - 96,
    y: anchor.y
  };
}

function getChatPetReducedMotionRigFrame(state) {
  switch (state) {
    case "sleep":
      return 4;
    case "waking":
      return 7;
    case "buttonPress":
      return 4;
    case "love":
      return 5;
    case "splat":
      return 3;
    default:
      return 0;
  }
}

function doesChatPetStateHideEyeAccessory(state) {
  return state === "love" || state === "complete" || state === "cool" || state === "speechless" || state === "worry" || state === "dizzy" || state === "wallImpact";
}
export { getChatPetAccessoryTrack, getDefaultChatPetAccessoryRigPose, getChatPetAccessoryRigFrame, getChatPetAntennaeOcclusionBounds, getChatPetEyeAccessoryAnchor, getChatPetReducedMotionRigFrame, doesChatPetStateHideEyeAccessory, defaultHeadAnchor, defaultRightEyeAnchor, CHAT_PET_HEAD_WEAR_OFFSET, trackSpans };
