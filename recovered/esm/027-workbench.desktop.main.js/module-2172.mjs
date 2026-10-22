// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatPetWidget.ts
import { FileAccess } from "./module-0033.mjs";
import { getChatPetAccessoryRigFrame, getChatPetReducedMotionRigFrame } from "./module-2170.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { $, AnimationFrameScheduler, DisposableResizeObserver, EventHelper, EventType, addDisposableListener, append, getActiveWindow, getWindow, getWindowId, isHTMLElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { observableValue } from "./module-0048.mjs";
import { Button } from "./module-0546.mjs";
import { autorun } from "./module-0052.mjs";
import { CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID, getChatPetAccessory, getChatPetAchievement } from "./module-2138.mjs";
import { status } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { BroadcastDataChannel } from "./module-1380.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { CHAT_PET_DEFAULT_SCALE, IChatPetService } from "./module-2139.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { drawChatPetComposite, drawChatPetEyeAccessory, getChatPetAccessoryImageSource, hasChatPetAccessoryImageDimensions, hasChatPetBodyImageDimensions } from "./module-2171.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatPetWidget.ts
var CHAT_PET_OVERLAY_CLASS = "chat-pet-overlay";

var CHAT_PET_IDLE_SLEEP_DELAY = 2e4;

var CHAT_PET_CONFIRMATION_ATTENTION_DURATION = 2e3;

var CHAT_PET_ACHIEVEMENT_UNLOCKED_DURATION = 1e4;

var CHAT_PET_ICON_TRANSFORMATION_CHANCE = 1 / 100;

var CHAT_PET_YAPPING_CHANCE = 1 / 100;

var CHAT_PET_WALL_IMPACT_DURATION = 48;

var CHAT_PET_WINDOW_OWNERSHIP_CHANNEL = "vscode-chat-pet-window-ownership";

var TRANSIENT_STATE_DURATION = 2e3;

var COMPLETE_STATE_DURATION = 960;

var BUTTON_PRESS_STATE_DURATION = 2850;

var SPLAT_STATE_DURATION = 520;

var LOVE_STATE_DURATION = 2940;

var COOL_STATE_DURATION = 3e3;

var SING_STATE_DURATION = 2880;

var SPEECHLESS_STATE_DURATION = 2720;

var WORRY_STATE_DURATION = 2400;

var DIZZY_STATE_DURATION = 2200;

var WAKE_STATE_DURATION = 880;

var DIZZY_DIRECTION_CHANGE_COUNT = 8;

var DIZZY_DIRECTION_CHANGE_MAX_INTERVAL = 600;

var RESPAWN_EFFECT_DURATION = 800;

var RESPAWN_EFFECT_REDUCED_MOTION_DURATION = 400;

var DRAG_THRESHOLD = 2;

var HOP_DISTANCE = 24;

var HOP_APEX_DELAY = 300;

var HOP_REST_DELAY = 90;

var HOP_HOLD_GRACE = 350;

var HOP_IDLE_DEBOUNCE = 900;

var BLINK_MIN_DELAY = 1400;

var BLINK_MAX_DELAY = 3400;

var POSITION_EPSILON = 0.5;

var THROW_VELOCITY_SAMPLE_DURATION = 100;

var THROW_RELEASE_GRACE_DURATION = 80;

var THROW_MIN_VELOCITY = 650;

var THROW_MAX_VELOCITY = 2400;

var THROW_KEYBOARD_HORIZONTAL_VELOCITY = 1400;

var THROW_KEYBOARD_UPWARD_VELOCITY = 420;

var THROW_GRAVITY = 1800;

var THROW_MAX_FRAME_DURATION = 32;

var THROW_MAX_DURATION = 4e3;

var THROW_WALL_RESTITUTION = 0.2;

var THROW_CEILING_RESTITUTION = 0.2;

var THROW_ROTATION_PER_PIXEL = 0.65;

var THROW_SELF_RIGHTING_START_VELOCITY = -450;

var THROW_SELF_RIGHTING_SPEED = 720;

var CHAT_PET_SOURCE_SIZE = 96;

var CHAT_PET_SLEEP_SOURCE_WIDTH = 120;

var CHAT_PET_TYPING_SOURCE_WIDTH = 168;

var CHAT_PET_BUTTON_PRESS_SOURCE_WIDTH = 160;

var CHAT_PET_SING_SOURCE_WIDTH = 164;

var CHAT_PET_SING_SOURCE_HEIGHT = 124;

var CHAT_PET_DIZZY_SOURCE_HEIGHT = 128;

var CHAT_PET_MAX_VERTICAL_OFFSET = 10;

var CHAT_PET_DEFAULT_RIGHT_INSET = 32;

var CHAT_PET_MIN_SCALE = 0.4;

var CHAT_PET_SCALE_STEP = 0.2;

var CHAT_PET_SPEECH_BUBBLE_RIGHT_OVERHANG = 20;

var CHAT_PET_SLEEP_RIGHT_OVERHANG = (CHAT_PET_SLEEP_SOURCE_WIDTH - CHAT_PET_SOURCE_SIZE) / 2;

var CHAT_PET_TYPING_RIGHT_OVERHANG = (CHAT_PET_TYPING_SOURCE_WIDTH - CHAT_PET_SOURCE_SIZE) / 2;

var CHAT_PET_BUTTON_PRESS_RIGHT_OVERHANG = (CHAT_PET_BUTTON_PRESS_SOURCE_WIDTH - CHAT_PET_SOURCE_SIZE) / 2;

var CHAT_PET_SING_RIGHT_OVERHANG = (CHAT_PET_SING_SOURCE_WIDTH - CHAT_PET_SOURCE_SIZE) / 2;

var IDLE_FRAME_DURATIONS = Array.from({ length: 50 }, () => 40);

var SLEEP_FRAME_DURATIONS = Array.from({ length: 8 }, () => 300);

var WAKE_FRAME_DURATIONS = [160, 100, 80, 90, 90, 90, 100, 170];

var TYPING_FRAME_DURATIONS = [320, 480];

var BUTTON_PRESS_FRAME_DURATIONS = [500, 300, 350, 250, 450, 1e3];

var FALLING_FRAME_DURATIONS = [120, 80, 80, 120, 80, 80];

var JUMP_FRAME_DURATIONS = [70, 80, 90, 160, 100, 100];

var SPLAT_FRAME_DURATIONS = [120, 100, 100, 200];

var RESPAWN_FRAME_DURATIONS = [120, 100, 120, 240, 100, 120];

var SPEECH_FRAME_DURATIONS = [220, 220, 220, 100, 160, 180];

var CLAPPING_FRAME_DURATIONS = [80, 40, 40, 40, 80, 40, 40, 40, 40, 80, 40, 40, 80];

var LOVE_FRAME_DURATIONS = [200, 200, 380, 100, 80, 1980];

var COOL_FRAME_DURATIONS = [600, 120, 120, 120, 160, 80, 80, 80, 1640];

var SING_FRAME_DURATIONS = [180, 180, 180, 180];

var SPEECHLESS_FRAME_DURATIONS = [400, 120, 1e3, 120, 1080];

var WORRY_FRAME_DURATIONS = [600, 600];

var DIZZY_FRAME_DURATIONS = Array.from({ length: 8 }, () => 120);

var SEARCH_FRAME_DURATIONS = [500, 500, 500, 500];

var CHAT_PET_SING_FIXED_ORIENTATION_DECORATIONS = [
  {
    frameBounds: [
      [16, 36, 80, 52],
      [16, 36, 80, 52],
      [16, 36, 80, 52],
      [16, 36, 80, 52]
    ],
    sourceFrame: 0
  },
  {
    frameBounds: [
      [96, 8, 160, 72],
      [96, 4, 160, 68],
      [100, 0, 164, 64],
      [92, 4, 156, 68]
    ],
    sourceFrame: 0
  }
];

function getChatPetBuddyName(quality) {
  return quality === "stable" ? "buddy-idle-stable" : "buddy-idle-insiders";
}

var spriteSources = /* @__PURE__ */ new Map();

var speechSpriteSources = /* @__PURE__ */ new Map();

var respawnSpriteSources = /* @__PURE__ */ new Map();

function doesChatPetStateTrackCursor(state) {
  return state !== void 0 && state !== "sleep" && state !== "waking" && state !== "typing" && state !== "buttonPress" && state !== "complete" && state !== "jump" && state !== "love" && state !== "cool" && state !== "yappingMouthOpen" && state !== "sing" && state !== "speechless" && state !== "worry" && state !== "dizzy" && state !== "falling" && state !== "wallImpact" && state !== "splat" && state !== "onTheRun" && state !== "searching" && state !== "searchingDown";
}

function doesChatPetStateBlink(state, frameIndex) {
  return (state === "typing" || state === "buttonPress" || state === "love") && (state !== "buttonPress" || frameIndex !== BUTTON_PRESS_FRAME_DURATIONS.length - 1);
}

function getChatPetSpriteName(state, quality) {
  const variant = quality === "stable" ? "stable" : "insiders";
  switch (state) {
    case "love":
      return `buddy-love-${variant}`;
    case "clapping":
      return `buddy-clapping-${variant}`;
    case "cool":
      return `buddy-cool-${variant}`;
    case "buttonPress":
      return `buddy-press-button-${variant}`;
    case "falling":
      return `buddy-falling-${variant}`;
    case "jump":
      return `buddy-jump-${variant}`;
    case "dizzy":
      return `buddy-dizzy-${variant}`;
    case "wallImpact":
      return `buddy-wall-impact-${variant}`;
    case "splat":
      return `buddy-splat-${variant}`;
    case "onTheRun":
    case "searching":
    case "searchingDown":
      return `buddy-search-${variant}`;
    case "sleep":
      return `buddy-sleep-${variant}`;
    case "waking":
      return `buddy-waking-${variant}`;
    case "typing":
      return `buddy-typing-${variant}`;
    case "rendering":
    case "achievementUnlocked":
      return `buddy-rendering-${variant}`;
    case "yappingMouthOpen":
      return `buddy-yapping-${variant}`;
    case "sing":
    case "speechless":
    case "worry":
      return `buddy-${state}-${variant}`;
    default:
      return getChatPetBuddyName(quality);
  }
}

function getChatPetFrameDurations(state) {
  switch (state) {
    case "sleep":
      return SLEEP_FRAME_DURATIONS;
    case "waking":
      return WAKE_FRAME_DURATIONS;
    case "typing":
      return TYPING_FRAME_DURATIONS;
    case "buttonPress":
      return BUTTON_PRESS_FRAME_DURATIONS;
    case "falling":
      return FALLING_FRAME_DURATIONS;
    case "jump":
      return JUMP_FRAME_DURATIONS;
    case "splat":
      return SPLAT_FRAME_DURATIONS;
    case "rendering":
    case "achievementUnlocked":
      return IDLE_FRAME_DURATIONS;
    case "clapping":
      return CLAPPING_FRAME_DURATIONS;
    case "love":
      return LOVE_FRAME_DURATIONS;
    case "cool":
      return COOL_FRAME_DURATIONS;
    case "sing":
      return SING_FRAME_DURATIONS;
    case "speechless":
      return SPEECHLESS_FRAME_DURATIONS;
    case "worry":
      return WORRY_FRAME_DURATIONS;
    case "dizzy":
      return DIZZY_FRAME_DURATIONS;
    case "searching":
      return SEARCH_FRAME_DURATIONS;
    case "onTheRun":
    case "wallImpact":
    case "searchingDown":
      return [];
    case "yappingMouthOpen":
    case "yapping":
      return [];
    default:
      return IDLE_FRAME_DURATIONS;
  }
}

function createSpriteSources(name, state, tracksCursor = true, sourceWidth, sourceHeight = CHAT_PET_SOURCE_SIZE, fixedOrientationDecorations) {
  const root = "vs/workbench/contrib/chat/browser/widget/media/chatPet";
  const suffix = tracksCursor ? "-tracking-96" : `-${sourceHeight}`;
  const frameDurations = getChatPetFrameDurations(state);
  const frameWidth = sourceWidth ?? (state === "typing" ? CHAT_PET_TYPING_SOURCE_WIDTH : state === "buttonPress" ? CHAT_PET_BUTTON_PRESS_SOURCE_WIDTH : CHAT_PET_SOURCE_SIZE);
  const staticSource = {
    url: FileAccess.asBrowserUri(`${root}/${name}${suffix}.png`).toString(true),
    frameWidth,
    frameHeight: sourceHeight,
    fixedOrientationDecorations,
    frameDurations: [],
    iterations: 1,
    accessoryRigFrame: getChatPetReducedMotionRigFrame(state)
  };
  return {
    animated: frameDurations.length === 0 ? staticSource : {
      url: FileAccess.asBrowserUri(`${root}/${name}${suffix}.spritesheet.png`).toString(true),
      frameWidth,
      frameHeight: sourceHeight,
      fixedOrientationDecorations,
      frameDurations,
      iterations: state === "waking" || state === "buttonPress" || state === "cool" || state === "splat" || state === "searching" || state === "jump" ? 1 : Infinity
    },
    reducedMotion: staticSource
  };
}

function getSpriteSources(variant) {
  let sources = spriteSources.get(variant);
  if (!sources) {
    const createStateSpriteSources = (state) => createSpriteSources(getChatPetSpriteName(state, variant), state, doesChatPetStateTrackCursor(state));
    sources = {
      idle: createStateSpriteSources("idle"),
      sleep: createSpriteSources(getChatPetSpriteName("sleep", variant), "sleep", false, CHAT_PET_SLEEP_SOURCE_WIDTH),
      waking: createSpriteSources(getChatPetSpriteName("waking", variant), "waking", false, CHAT_PET_SLEEP_SOURCE_WIDTH),
      typing: createStateSpriteSources("typing"),
      rendering: createStateSpriteSources("rendering"),
      achievementUnlocked: createStateSpriteSources("achievementUnlocked"),
      buttonPress: createStateSpriteSources("buttonPress"),
      complete: createStateSpriteSources("complete"),
      love: createStateSpriteSources("love"),
      clapping: createStateSpriteSources("clapping"),
      jump: createStateSpriteSources("jump"),
      cool: createStateSpriteSources("cool"),
      yapping: createStateSpriteSources("yapping"),
      yappingMouthOpen: createStateSpriteSources("yappingMouthOpen"),
      sing: createSpriteSources(getChatPetSpriteName("sing", variant), "sing", false, CHAT_PET_SING_SOURCE_WIDTH, CHAT_PET_SING_SOURCE_HEIGHT, CHAT_PET_SING_FIXED_ORIENTATION_DECORATIONS),
      speechless: createStateSpriteSources("speechless"),
      worry: createStateSpriteSources("worry"),
      dizzy: createSpriteSources(getChatPetSpriteName("dizzy", variant), "dizzy", false, void 0, CHAT_PET_DIZZY_SOURCE_HEIGHT),
      falling: createStateSpriteSources("falling"),
      wallImpact: createStateSpriteSources("wallImpact"),
      splat: createStateSpriteSources("splat"),
      onTheRun: createStateSpriteSources("onTheRun"),
      searching: createStateSpriteSources("searching"),
      searchingDown: createStateSpriteSources("searchingDown")
    };
    spriteSources.set(variant, sources);
  }
  return sources;
}

function getSpeechSpriteSources(variant) {
  let sources = speechSpriteSources.get(variant);
  if (!sources) {
    const root = "vs/workbench/contrib/chat/browser/widget/media/chatPet";
    const name = `buddy-speech-${variant}-96`;
    sources = {
      animated: {
        url: FileAccess.asBrowserUri(`${root}/${name}.spritesheet.png`).toString(true),
        frameWidth: CHAT_PET_SOURCE_SIZE,
        frameDurations: SPEECH_FRAME_DURATIONS,
        iterations: Infinity
      },
      reducedMotion: {
        url: FileAccess.asBrowserUri(`${root}/${name}.png`).toString(true),
        frameWidth: CHAT_PET_SOURCE_SIZE,
        frameDurations: [],
        iterations: 1
      }
    };
    speechSpriteSources.set(variant, sources);
  }
  return sources;
}

function getRespawnSpriteSources(variant) {
  let sources = respawnSpriteSources.get(variant);
  if (!sources) {
    const root = "vs/workbench/contrib/chat/browser/widget/media/chatPet";
    const name = `buddy-respawn-${variant}-96`;
    sources = {
      animated: {
        url: FileAccess.asBrowserUri(`${root}/${name}.spritesheet.png`).toString(true),
        frameWidth: CHAT_PET_SOURCE_SIZE,
        frameDurations: RESPAWN_FRAME_DURATIONS,
        iterations: 1
      },
      reducedMotion: {
        url: FileAccess.asBrowserUri(`${root}/${name}.png`).toString(true),
        frameWidth: CHAT_PET_SOURCE_SIZE,
        frameDurations: [],
        iterations: 1
      }
    };
    respawnSpriteSources.set(variant, sources);
  }
  return sources;
}

function doesChatPetStateSpeak(state) {
  return state === "rendering" || state === "achievementUnlocked";
}

function drawChatPetAchievementStar(context2, variant) {
  context2.fillStyle = variant === "stable" ? "rgb(35, 168, 242)" : "rgb(36, 191, 165)";
  context2.fillRect(56, 34, 24, 24);
  context2.fillStyle = "rgb(255, 205, 15)";
  const rows = ["..#..", ".###.", "#####", ".#.#.", "#...#"];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "#") {
        context2.fillRect(58 + x * 4, 36 + y * 4, 4, 4);
      }
    }
  }
}

function isChatPetImageSource(image, source) {
  return image.getAttribute("src") === source;
}

function getChatPetBaseState(hasActiveRequest, needsInput, confirmationAttentionExpired, hasInput, idleExpired) {
  if (needsInput) {
    return confirmationAttentionExpired ? "idle" : "clapping";
  }
  if (hasActiveRequest) {
    return "rendering";
  }
  if (idleExpired) {
    return "sleep";
  }
  if (hasInput) {
    return "typing";
  }
  return "idle";
}

function shouldReserveChatPetSpace(enabled, activeHost) {
  return enabled && activeHost;
}

function isChatPetVisible(enabled, windowActive = true) {
  return enabled && windowActive;
}

function isChatPetWindowActive(activeWindowId, targetWindowId) {
  return activeWindowId === targetWindowId;
}

function shouldClaimChatPetWindowOnConstruction(windowActive, documentFocused) {
  return windowActive && documentFocused;
}

function isChatPetKeyboardInteractionEnabled(enabled, isDead, hasPointerInteraction, isAirborne, onTheRun) {
  return enabled && !isDead && !hasPointerInteraction && !isAirborne && !onTheRun;
}

function isChatPetYapState(state) {
  return state === "yapping" || state === "yappingMouthOpen";
}

function getChatPetRenderedState(baseState, transientState, isDragging) {
  if (isDragging) {
    return "idle";
  }
  if (isChatPetYapState(transientState) && baseState !== "idle") {
    return baseState;
  }
  return transientState ?? baseState;
}

function getChatPetAnimationFrame(frameDurations, elapsed, iterations, reverse = false) {
  if (frameDurations.length === 0) {
    return { frameIndex: 0, complete: true };
  }
  const totalDuration = frameDurations.reduce((total, duration) => total + duration, 0);
  const lastFrameIndex = frameDurations.length - 1;
  if (elapsed >= totalDuration * iterations) {
    return { frameIndex: reverse ? 0 : lastFrameIndex, complete: true };
  }
  const iterationElapsed = Math.max(0, elapsed) % totalDuration;
  let frameEnd = 0;
  for (let animationFrameIndex = 0; animationFrameIndex < frameDurations.length; animationFrameIndex++) {
    const frameIndex = reverse ? lastFrameIndex - animationFrameIndex : animationFrameIndex;
    frameEnd += frameDurations[frameIndex];
    if (iterationElapsed < frameEnd) {
      return { frameIndex, complete: false, nextFrameDelay: frameEnd - iterationElapsed };
    }
  }
  return { frameIndex: reverse ? 0 : lastFrameIndex, complete: false, nextFrameDelay: totalDuration };
}

function getTransientStateDuration(state) {
  switch (state) {
    case "buttonPress":
      return BUTTON_PRESS_STATE_DURATION;
    case "complete":
      return COMPLETE_STATE_DURATION;
    case "splat":
      return SPLAT_STATE_DURATION;
    case "love":
      return LOVE_STATE_DURATION;
    case "cool":
      return COOL_STATE_DURATION;
    case "sing":
      return SING_STATE_DURATION;
    case "speechless":
      return SPEECHLESS_STATE_DURATION;
    case "worry":
      return WORRY_STATE_DURATION;
    case "dizzy":
      return DIZZY_STATE_DURATION;
    case "achievementUnlocked":
      return CHAT_PET_ACHIEVEMENT_UNLOCKED_DURATION;
    case "waking":
      return WAKE_STATE_DURATION;
    default:
      return TRANSIENT_STATE_DURATION;
  }
}

function getChatPetClickInteraction(random, previousInteraction) {
  if (random < CHAT_PET_ICON_TRANSFORMATION_CHANCE) {
    return "complete";
  }
  const yappingThreshold = CHAT_PET_ICON_TRANSFORMATION_CHANCE + CHAT_PET_YAPPING_CHANCE;
  if (random < yappingThreshold) {
    return "yapping";
  }
  const interactions = ["buttonPress", "love", "cool", "sing", "speechless", "worry"];
  const availableInteractions = interactions.filter((interaction) => interaction !== previousInteraction);
  const normalizedRandom = (random - yappingThreshold) / (1 - yappingThreshold);
  return availableInteractions[Math.min(Math.floor(normalizedRandom * availableInteractions.length), availableInteractions.length - 1)];
}

function getChatPetBlinkDelay(random) {
  const normalizedRandom = Math.max(0, Math.min(1, random));
  return BLINK_MIN_DELAY + Math.round(normalizedRandom * (BLINK_MAX_DELAY - BLINK_MIN_DELAY));
}

function getChatPetGazeDirection(cursorX, cursorY, petCenterX, petCenterY) {
  const deltaX = cursorX - petCenterX;
  const deltaY = cursorY - petCenterY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance === 0) {
    return [0, 0];
  }
  return [
    Math.round(deltaX / distance),
    Math.round(deltaY / distance)
  ];
}

function getChatPetEyeAccessoryGazeOffset(gazeDirection) {
  return [gazeDirection[0] * 4, gazeDirection[1] * 4];
}

var ChatPetBlinkController = class extends Disposable {
  constructor(onBlinkChange, random = Math.random) {
    super();
    this.onBlinkChange = onBlinkChange;
    this.random = random;
    this._blinkScheduler = this._register(new RunOnceScheduler(() => this._startBlink(), 0));
    this._enabled = false;
    this._blinking = false;
  }
  setEnabled(enabled) {
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    this._blinkScheduler.cancel();
    this._setBlinking(false);
    if (enabled) {
      this._scheduleBlink();
    }
  }
  onAnimationComplete() {
    if (!this._blinking) {
      return;
    }
    this._setBlinking(false);
    if (this._enabled) {
      this._scheduleBlink();
    }
  }
  _scheduleBlink() {
    this._blinkScheduler.schedule(getChatPetBlinkDelay(this.random()));
  }
  _startBlink() {
    if (this._enabled) {
      this._setBlinking(true);
    }
  }
  _setBlinking(blinking) {
    if (this._blinking === blinking) {
      return;
    }
    this._blinking = blinking;
    this.onBlinkChange(blinking);
  }
};

var ChatPetFacingController = class {
  constructor() {
    this._direction = "right";
    this._tracksCursor = false;
  }
  get direction() {
    return this._direction;
  }
  setDirection(direction) {
    this._direction = direction;
  }
  setState(state, isDragging) {
    this._tracksCursor = state === "idle" && !isDragging;
  }
  snapToCursor(cursorX, petCenterX) {
    if (cursorX < petCenterX) {
      this.setDirection("left");
    } else if (cursorX > petCenterX) {
      this.setDirection("right");
    }
    return this._direction;
  }
  update(cursorX, petCenterX) {
    if (this._tracksCursor) {
      return this.snapToCursor(cursorX, petCenterX);
    }
    return this._direction;
  }
};

var ChatPetDirectionChangeController = class {
  constructor(directionChangeCount = DIZZY_DIRECTION_CHANGE_COUNT, maxDirectionChangeInterval = DIZZY_DIRECTION_CHANGE_MAX_INTERVAL) {
    this.directionChangeCount = directionChangeCount;
    this.maxDirectionChangeInterval = maxDirectionChangeInterval;
    this._directionChangeCount = 0;
  }
  record(direction, timestamp) {
    if (this._lastDirection === direction) {
      return false;
    }
    if (this._lastDirection === void 0) {
      this._lastDirection = direction;
      this._lastDirectionChangeTime = timestamp;
      return false;
    }
    if (this._lastDirectionChangeTime !== void 0 && timestamp - this._lastDirectionChangeTime > this.maxDirectionChangeInterval) {
      this._directionChangeCount = 0;
    }
    this._lastDirection = direction;
    this._lastDirectionChangeTime = timestamp;
    this._directionChangeCount++;
    if (this._directionChangeCount < this.directionChangeCount) {
      return false;
    }
    this.reset();
    return true;
  }
  reset() {
    this._lastDirection = void 0;
    this._lastDirectionChangeTime = void 0;
    this._directionChangeCount = 0;
  }
};

function getChatPetHorizontalPosition2(left, minimumLeft, maximumLeft) {
  return Math.max(minimumLeft, Math.min(Math.max(minimumLeft, maximumLeft), left));
}

function getChatPetDefaultHorizontalPosition(minimumLeft, maximumLeft) {
  return Math.max(minimumLeft, maximumLeft - CHAT_PET_DEFAULT_RIGHT_INSET);
}

function getChatPetRestoredHorizontalPosition(relativePosition, minimumLeft, maximumLeft) {
  return relativePosition === void 0 ? getChatPetDefaultHorizontalPosition(minimumLeft, maximumLeft) : getChatPetHorizontalPosition2(minimumLeft + relativePosition * Math.max(0, maximumLeft - minimumLeft), minimumLeft, maximumLeft);
}

function getChatPetRelativeHorizontalPosition(left, minimumLeft, maximumLeft) {
  const horizontalRange = maximumLeft - minimumLeft;
  if (horizontalRange <= 0) {
    return void 0;
  }
  return Math.max(0, Math.min(1, (left - minimumLeft) / horizontalRange));
}

function getChatPetHorizontalAnchor(left, minimumLeft, maximumLeft) {
  const clampedLeft = getChatPetHorizontalPosition2(left, minimumLeft, maximumLeft);
  const normalizedMaximumLeft = Math.max(minimumLeft, maximumLeft);
  const leftInset = clampedLeft - minimumLeft;
  const rightInset = normalizedMaximumLeft - clampedLeft;
  return leftInset <= rightInset ? { edge: "left", inset: leftInset } : { edge: "right", inset: rightInset };
}

function getChatPetAnchoredHorizontalPosition(anchor, minimumLeft, maximumLeft) {
  const normalizedMaximumLeft = Math.max(minimumLeft, maximumLeft);
  const left = anchor.edge === "left" ? minimumLeft + anchor.inset : normalizedMaximumLeft - anchor.inset;
  return getChatPetHorizontalPosition2(left, minimumLeft, normalizedMaximumLeft);
}

function getChatPetScale2(scale, delta2) {
  return Math.max(CHAT_PET_MIN_SCALE, Math.round((scale + delta2) * 10) / 10);
}

function getChatPetDragPosition(left, top2, minimumLeft, maximumLeft, minimumTop, maximumTop) {
  return [
    getChatPetHorizontalPosition2(left, minimumLeft, maximumLeft),
    Math.max(minimumTop, Math.min(Math.max(minimumTop, maximumTop), top2))
  ];
}

function getChatPetThrowVelocity(samples, releaseTime) {
  if (samples.length < 2) {
    return void 0;
  }
  const latest = samples[samples.length - 1];
  if (releaseTime - latest.time > THROW_RELEASE_GRACE_DURATION) {
    return void 0;
  }
  let first2 = latest;
  for (let index2 = samples.length - 2; index2 >= 0; index2--) {
    const sample = samples[index2];
    if (latest.time - sample.time > THROW_VELOCITY_SAMPLE_DURATION) {
      break;
    }
    first2 = sample;
  }
  const elapsed = Math.max(16, latest.time - first2.time);
  const velocityX = (latest.x - first2.x) / elapsed * 1e3;
  const velocityY = (latest.y - first2.y) / elapsed * 1e3;
  const speed = Math.hypot(velocityX, velocityY);
  if (speed < THROW_MIN_VELOCITY) {
    return void 0;
  }
  const velocityScale = Math.min(1, THROW_MAX_VELOCITY / speed);
  return {
    x: velocityX * velocityScale,
    y: velocityY * velocityScale
  };
}

function getChatPetWallReboundVelocity(velocity) {
  return {
    x: -velocity.x * THROW_WALL_RESTITUTION,
    y: velocity.y
  };
}

function getChatPetThrowRotation(rotation, horizontalDistance, verticalVelocity, elapsed) {
  const selfRightingProgress = Math.max(0, Math.min(1, (verticalVelocity - THROW_SELF_RIGHTING_START_VELOCITY) / -THROW_SELF_RIGHTING_START_VELOCITY));
  const nextRotation = rotation + horizontalDistance * THROW_ROTATION_PER_PIXEL * (1 - selfRightingProgress);
  const uprightRotation = horizontalDistance > 0 ? Math.ceil(nextRotation / 360) * 360 : horizontalDistance < 0 ? Math.floor(nextRotation / 360) * 360 : Math.round(nextRotation / 360) * 360;
  const rotationDelta = uprightRotation - nextRotation;
  const maximumCorrection = THROW_SELF_RIGHTING_SPEED * Math.max(0, elapsed) / 1e3 * selfRightingProgress;
  return Math.abs(rotationDelta) <= maximumCorrection ? uprightRotation : nextRotation + Math.sign(rotationDelta) * maximumCorrection;
}

function advanceChatPetThrow(motion, elapsed, bounds) {
  const duration = Math.max(0, elapsed) / 1e3;
  const projectedLeft = motion.left + motion.x * duration;
  const hasHorizontalRange = bounds.maximumLeft > bounds.minimumLeft;
  let wall;
  let motionDuration = duration;
  let left = hasHorizontalRange ? projectedLeft : bounds.minimumLeft;
  if (hasHorizontalRange && projectedLeft < bounds.minimumLeft) {
    wall = "left";
    motionDuration *= (bounds.minimumLeft - motion.left) / (projectedLeft - motion.left);
    left = bounds.minimumLeft;
  } else if (hasHorizontalRange && projectedLeft > bounds.maximumLeft) {
    wall = "right";
    motionDuration *= (bounds.maximumLeft - motion.left) / (projectedLeft - motion.left);
    left = bounds.maximumLeft;
  }
  let top2 = motion.top + motion.y * motionDuration + THROW_GRAVITY * motionDuration * motionDuration / 2;
  let velocityY = motion.y + THROW_GRAVITY * motionDuration;
  if (top2 < bounds.minimumTop) {
    top2 = bounds.minimumTop;
    velocityY = Math.abs(velocityY) * THROW_CEILING_RESTITUTION;
  }
  return {
    left,
    top: top2,
    x: hasHorizontalRange ? motion.x : 0,
    y: velocityY,
    wall
  };
}

function shouldSettleChatPetThrow(startTime, currentTime, top2, verticalVelocity, floorTop) {
  return currentTime - startTime >= THROW_MAX_DURATION || top2 > floorTop && verticalVelocity >= 0;
}

function getChatPetFallTarget(petLeft, petTop, petWidth, petHeight, platformLeft, platformRight, platformTop, floorBottom, fallbackPlatformTop) {
  const petCenter = petLeft + petWidth / 2;
  const isWithinPlatform = petCenter >= platformLeft && petCenter <= platformRight;
  const petBottom = petTop + petHeight;
  const landingPlatformTop = isWithinPlatform && petBottom <= platformTop ? platformTop : isWithinPlatform && fallbackPlatformTop !== void 0 && petBottom <= fallbackPlatformTop ? fallbackPlatformTop : void 0;
  return {
    top: landingPlatformTop !== void 0 ? landingPlatformTop - petHeight : floorBottom - petHeight,
    landsOnPlatform: landingPlatformTop !== void 0
  };
}

function getChatPetThrowLanding(previousLeft, previousTop, left, top2, petWidth, petHeight, platformLeft, platformRight, platformTop, floorTop) {
  if (top2 <= previousTop) {
    return void 0;
  }
  const getLeftAtTop = (targetTop) => previousLeft + (left - previousLeft) * (targetTop - previousTop) / (top2 - previousTop);
  const platformLandingTop = platformTop - petHeight;
  if (previousTop <= platformLandingTop && top2 >= platformLandingTop) {
    const landingLeft = getLeftAtTop(platformLandingTop);
    const petCenter = landingLeft + petWidth / 2;
    if (petCenter >= platformLeft && petCenter <= platformRight) {
      return { left: landingLeft, top: platformLandingTop, landsOnPlatform: true };
    }
  }
  if (previousTop <= floorTop && top2 >= floorTop) {
    return { left: getLeftAtTop(floorTop), top: floorTop, landsOnPlatform: false };
  }
  return void 0;
}

function getChatPetFallDuration(distance) {
  return Math.max(180, Math.min(700, Math.sqrt(Math.abs(distance)) * 20));
}

function getChatPetVerticalOffset(hostTop, inputTop) {
  return Math.max(0, Math.min(CHAT_PET_MAX_VERTICAL_OFFSET, inputTop - hostTop));
}

function getChatPetPlatformTop(hostTop, inputTop, substantiveSurfaceTop) {
  if (substantiveSurfaceTop !== void 0 && substantiveSurfaceTop >= hostTop && substantiveSurfaceTop <= inputTop) {
    return substantiveSurfaceTop;
  }
  return hostTop + getChatPetVerticalOffset(hostTop, inputTop);
}

function getChatPetPillPlatformTop(petCenterX, pillBounds) {
  for (const bounds of pillBounds) {
    if (bounds.width > 0 && bounds.height > 0 && petCenterX >= bounds.left && petCenterX <= bounds.right) {
      return bounds.top;
    }
  }
  return void 0;
}

function getChatPetStackPlatformTop(container3, inputContainer, startAfter) {
  const inputTop = inputContainer.getBoundingClientRect().top;
  let current = container3;
  let previousElement = startAfter;
  while (true) {
    const children = Array.from(current.children);
    const startIndex = previousElement ? children.indexOf(previousElement) + 1 : 0;
    let nestedContainer;
    for (let index2 = startIndex; index2 < children.length; index2++) {
      const child = children[index2];
      if (!isHTMLElement(child) || child.classList.contains(CHAT_PET_OVERLAY_CLASS)) {
        continue;
      }
      if (child === inputContainer) {
        return inputTop;
      }
      if (child.contains(inputContainer)) {
        nestedContainer = child;
        break;
      }
      const bounds = child.getBoundingClientRect();
      if (bounds.height > 0 && bounds.top <= inputTop) {
        return bounds.top;
      }
    }
    if (!nestedContainer) {
      return inputTop;
    }
    current = nestedContainer;
    previousElement = void 0;
  }
}

function shouldPlaceChatPetSpeechBubbleLeft(state, buttonRight, inputRight, scale = 1) {
  return state === "rendering" && buttonRight + CHAT_PET_SPEECH_BUBBLE_RIGHT_OVERHANG * scale > inputRight;
}

function getChatPetWideSpriteHorizontalOffset(state, facingDirection, buttonLeft, buttonRight, inputLeft, inputRight, scale = 1) {
  const overhang = state === "sleep" || state === "waking" ? CHAT_PET_SLEEP_RIGHT_OVERHANG : state === "typing" ? CHAT_PET_TYPING_RIGHT_OVERHANG : state === "buttonPress" ? CHAT_PET_BUTTON_PRESS_RIGHT_OVERHANG : state === "sing" ? CHAT_PET_SING_RIGHT_OVERHANG : 0;
  if (overhang === 0) {
    return 0;
  }
  return facingDirection === "left" ? Math.max(0, overhang - (buttonLeft - inputLeft) / scale) : Math.min(0, (inputRight - buttonRight) / scale - overhang);
}

function setChatPetWideLayerOffset(offset, layers) {
  const translate = offset === 0 ? "" : `${offset}px`;
  for (const layer of layers) {
    layer.style.translate = translate;
  }
}

var ChatPetHopController = class extends Disposable {
  constructor(callbacks) {
    super();
    this.callbacks = callbacks;
    this._stepScheduler = this._register(new RunOnceScheduler(() => this._applyStep(), HOP_APEX_DELAY));
    this._restScheduler = this._register(new RunOnceScheduler(() => this._beginHop(), HOP_REST_DELAY));
    this._direction = 0;
    this._heldUntil = 0;
    this._active = false;
  }
  request(direction, motionReduced) {
    this._direction = direction;
    this.callbacks.onDirectionChange(direction);
    this.callbacks.onRequest();
    if (motionReduced) {
      this.cancel();
      this.callbacks.onMove(direction * HOP_DISTANCE);
      this.callbacks.onReducedMotionStart();
      return;
    }
    this._heldUntil = Date.now() + HOP_HOLD_GRACE;
    if (!this._active) {
      this._beginHop();
    }
  }
  cancel() {
    this._active = false;
    this._direction = 0;
    this._heldUntil = 0;
    this._stepScheduler.cancel();
    this._restScheduler.cancel();
  }
  onAnimationComplete() {
    if (!this._active) {
      return;
    }
    if (Date.now() < this._heldUntil) {
      this._restScheduler.schedule();
    } else {
      this._active = false;
    }
  }
  _beginHop() {
    this._active = true;
    this.callbacks.onStart();
    this._stepScheduler.schedule();
  }
  _applyStep() {
    if (!this._active || this._direction === 0) {
      return;
    }
    this.callbacks.onMove(this._direction * HOP_DISTANCE);
  }
};

var ChatPetWidget = class extends Disposable {
  constructor(host, resizeObserverCtor, chatPetService, accessibilityService, contextMenuService, commandService, logService, hostService) {
    super();
    this.chatPetService = chatPetService;
    this.accessibilityService = accessibilityService;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.logService = logService;
    this.hostService = hostService;
    this._hostLayoutDisposables = this._register(new MutableDisposable());
    this._eyeAccessoryVisible = false;
    this._eyeAccessoryFixedOrientation = false;
    this._eyeAccessoryGazeOffset = [0, 0];
    this._pupils = [];
    this._facingController = new ChatPetFacingController();
    this._directionChangeController = new ChatPetDirectionChangeController();
    this._dragMonitor = this._register(new GlobalPointerMoveMonitor());
    this._idleExpired = observableValue(this, false);
    this._confirmationAttentionExpired = observableValue(this, false);
    this._transientState = observableValue(this, void 0);
    this._isDragging = observableValue(this, false);
    this._isDead = observableValue(this, false);
    this._idleScheduler = this._register(new RunOnceScheduler(() => this._idleExpired.set(true, void 0), CHAT_PET_IDLE_SLEEP_DELAY));
    this._confirmationAttentionScheduler = this._register(new RunOnceScheduler(() => this._confirmationAttentionExpired.set(true, void 0), CHAT_PET_CONFIRMATION_ATTENTION_DURATION));
    this._transientScheduler = this._register(new RunOnceScheduler(() => this._transientState.set(void 0, void 0), TRANSIENT_STATE_DURATION));
    this._clickSuppressionScheduler = this._register(new RunOnceScheduler(() => this._suppressNextPointerClick = false, 0));
    this._spriteAnimation = this._register(new MutableDisposable());
    this._speechAnimation = this._register(new MutableDisposable());
    this._respawnAnimation = this._register(new MutableDisposable());
    this._throwAnimation = this._register(new MutableDisposable());
    this._respawnEffectScheduler = this._register(new RunOnceScheduler(() => this._showRespawnEffect(), RESPAWN_EFFECT_DURATION));
    this._respawnFallScheduler = this._register(new RunOnceScheduler(() => this._beginRespawnFall(), RESPAWN_EFFECT_DURATION));
    this._hopController = this._register(new ChatPetHopController({
      onDirectionChange: (direction) => this._button.element.dataset.hopDirection = direction < 0 ? "left" : "right",
      onMove: (delta2) => {
        this._setHorizontalPosition(this._getCurrentLeft() + delta2);
        this._updateVerticalPosition();
      },
      onStart: () => {
        if (this._transientState.get() === "jump") {
          this._renderState("jump", true);
        } else {
          this._transientState.set("jump", void 0);
        }
      },
      onReducedMotionStart: () => this._transientState.set("jump", void 0),
      onRequest: () => this._transientScheduler.schedule(HOP_IDLE_DEBOUNCE)
    }));
    this._contextMenuActions = this._register(new MutableDisposable());
    this._renderGeneration = 0;
    this._accessoryGeneration = 0;
    this._activeFrameIndex = 0;
    this._failedAccessorySources = /* @__PURE__ */ new Set();
    this._motionReduced = false;
    this._enabled = false;
    this._busy = false;
    this._enablementInitialized = false;
    this._positionInitialized = false;
    this._hasCustomPosition = false;
    this._suppressNextPointerClick = false;
    this._contextMenuVisible = false;
    this._fallLandsOnPlatform = false;
    this._throwGeometryDirty = false;
    this._respawnPhase = "none";
    this._scale = 1;
    this.parent = host.parent;
    this.dragBounds = host.dragBounds;
    this.movementBounds = host.movementBounds;
    this._host = observableValue(this, host);
    this._variant = this.chatPetService.variant.get();
    this._selectedAccessory = this.chatPetService.selectedAccessory.get();
    this.parent.classList.add("chat-pet-host");
    this._overlay = $(`.${CHAT_PET_OVERLAY_CLASS}`);
    this.parent.prepend(this._overlay);
    this._register(toDisposable(() => {
      this.parent.classList.remove("chat-pet-host");
      this._overlay.remove();
    }));
    this._button = this._register(new Button(this._overlay, {
      ariaLabel: this._getAriaLabel(false, false)
    }));
    this._button.element.classList.add("chat-pet-button");
    this._button.element.dataset.facing = this._facingController.direction;
    this._visual = append(this._button.element, $(".chat-pet-visual"));
    const respawnEffectCanvas = append(this._overlay, $("canvas.chat-pet-canvas.chat-pet-respawn-effect.hidden"));
    respawnEffectCanvas.width = CHAT_PET_SOURCE_SIZE;
    respawnEffectCanvas.height = CHAT_PET_SOURCE_SIZE;
    respawnEffectCanvas.setAttribute("aria-hidden", "true");
    const respawnEffectImage = append(this._overlay, $("img.chat-pet-spritesheet"));
    respawnEffectImage.alt = "";
    respawnEffectImage.setAttribute("aria-hidden", "true");
    this._respawnEffect = { container: respawnEffectCanvas, image: respawnEffectImage, canvas: respawnEffectCanvas };
    this._register(addDisposableListener(respawnEffectImage, "load", () => this._startRespawnEffectAnimation()));
    this._sprites = [0, 1].map(() => {
      const container3 = append(this._visual, $(".chat-pet-sprite.hidden"));
      const canvas = append(container3, $("canvas.chat-pet-canvas"));
      canvas.width = CHAT_PET_SOURCE_SIZE;
      canvas.height = CHAT_PET_SOURCE_SIZE;
      canvas.setAttribute("aria-hidden", "true");
      const image = append(container3, $("img.chat-pet-spritesheet"));
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      const accessoryImages = [0, 1].map(() => {
        const accessoryImage = append(container3, $("img.chat-pet-spritesheet"));
        accessoryImage.alt = "";
        accessoryImage.setAttribute("aria-hidden", "true");
        return accessoryImage;
      });
      const sprite = { container: container3, image, accessoryImages, canvas };
      this._register(addDisposableListener(image, "load", () => this._onBodyImageLoad(sprite)));
      this._register(addDisposableListener(image, "error", () => this._onBodyImageError(sprite)));
      for (const accessoryImage of accessoryImages) {
        this._register(addDisposableListener(accessoryImage, "load", () => this._onAccessoryImageLoad(sprite, accessoryImage)));
        this._register(addDisposableListener(accessoryImage, "error", () => this._onAccessoryImageError(sprite, accessoryImage)));
      }
      return sprite;
    });
    this._eyes = append(this._visual, $(".chat-pet-eyes"));
    this._eyes.setAttribute("aria-hidden", "true");
    for (const side of ["left", "right"]) {
      const eye = append(this._eyes, $(`.chat-pet-eye.${side}`));
      this._pupils.push(append(eye, $(".chat-pet-pupil")));
    }
    this._blinkController = this._register(new ChatPetBlinkController((blinking) => this._eyes.classList.toggle("blink", blinking)));
    const targetDocument = getWindow(this._button.element).document;
    this._register(addDisposableListener(targetDocument, "visibilitychange", () => this._updateEyes(this._renderedState)));
    this._eyeAccessoryContainer = append(this._visual, $(".chat-pet-eye-accessory.hidden"));
    this._eyeAccessory = append(this._eyeAccessoryContainer, $("canvas.chat-pet-eye-accessory-canvas"));
    this._eyeAccessory.width = CHAT_PET_SOURCE_SIZE;
    this._eyeAccessory.height = CHAT_PET_SOURCE_SIZE;
    this._eyeAccessory.setAttribute("aria-hidden", "true");
    const speechBubbleContainer = append(this._visual, $(".chat-pet-speech-bubble.hidden"));
    const speechBubbleCanvas = append(speechBubbleContainer, $("canvas.chat-pet-canvas.chat-pet-speech-canvas"));
    speechBubbleCanvas.width = CHAT_PET_SOURCE_SIZE;
    speechBubbleCanvas.height = CHAT_PET_SOURCE_SIZE;
    speechBubbleCanvas.setAttribute("aria-hidden", "true");
    const speechBubbleImage = append(speechBubbleContainer, $("img.chat-pet-spritesheet"));
    speechBubbleImage.alt = "";
    speechBubbleImage.setAttribute("aria-hidden", "true");
    this._speechBubble = { container: speechBubbleContainer, image: speechBubbleImage, canvas: speechBubbleCanvas };
    this._resizeObserver = this._register(new DisposableResizeObserver("ChatPetWidget.dragBounds", () => this._handleHostLayoutChange(), getWindow(this._button.element), { resizeObserverCtor }));
    this._observeHost(host);
    if (this._getHorizontalBounds() !== void 0) {
      this._restoreHorizontalPosition();
      this._updateVerticalPosition();
      this._updateSpeechBubblePosition();
    }
    this._register(addDisposableListener(speechBubbleImage, "load", () => this._updateSpeechBubble(this._renderedState, true)));
    this._gazeScheduler = this._register(new AnimationFrameScheduler(this._button.element, () => this._updateGaze()));
    this._register(addDisposableListener(getWindow(this._button.element).document, EventType.POINTER_MOVE, (event) => {
      this._cursorPosition = [event.clientX, event.clientY];
      if (this._enabled && doesChatPetStateTrackCursor(this._renderedState)) {
        this._gazeScheduler.schedule();
      }
    }));
    const onAnimationComplete = (event) => {
      if (event.animationName === "chat-pet-enter") {
        this._button.element.classList.remove("entering");
      } else if (event.animationName === "chat-pet-exit" && !this._enabled) {
        this._finishDisable();
      } else if (event.animationName === "chat-pet-yapping-fall" && !this._isDragging.get() && event.target === this._activeSprite?.container && this._button.element.dataset.state === "yapping") {
        this._transientState.set("yappingMouthOpen", void 0);
      } else if ((event.animationName === "chat-pet-eye-blink" || event.animationName === "chat-pet-tall-eye-blink") && event.target === this._pupils[0]) {
        this._blinkController.onAnimationComplete();
      }
    };
    this._register(addDisposableListener(this._button.element, EventType.ANIMATION_END, onAnimationComplete));
    this._register(addDisposableListener(this._button.element, "animationcancel", onAnimationComplete));
    const onTransitionComplete = (event) => {
      if (event.propertyName === "top" && this._button.element.classList.contains("falling")) {
        this._finishFall();
      } else if (event.target === this._button.element && event.propertyName === "transform") {
        this._button.element.classList.remove("returning-from-run");
      }
    };
    this._register(addDisposableListener(this._button.element, "transitionend", onTransitionComplete));
    this._register(addDisposableListener(this._button.element, "transitioncancel", onTransitionComplete));
    this._register(addDisposableListener(this._button.element, EventType.POINTER_DOWN, (event) => this._startDrag(event)));
    this._register(addDisposableListener(this._button.element, EventType.KEY_DOWN, (event) => this._onKeyDown(event)));
    this._register(addDisposableListener(this._button.element, EventType.CONTEXT_MENU, (event) => {
      if (!this._enabled) {
        return;
      }
      EventHelper.stop(event, true);
      this._showContextMenu(event);
    }));
    this._register(autorun((reader) => {
      const currentHost = this._host.read(reader);
      reader.store.add(currentHost.inputChanged(() => {
        if (this._enabled && !this.chatPetService.onTheRun.read(void 0)) {
          this._wake();
        }
      }));
    }));
    this._register(this._button.onDidClick((e) => {
      EventHelper.stop(e, true);
      if (this._contextMenuVisible) {
        return;
      }
      if (this._suppressNextPointerClick && e.type !== EventType.KEY_DOWN) {
        this._suppressNextPointerClick = false;
        this._clickSuppressionScheduler.cancel();
        return;
      }
      if (this._transientState.get() === "achievementUnlocked") {
        this._transientScheduler.cancel();
        this._transientState.set(void 0, void 0);
        void this.commandService.executeCommand(CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID);
        return;
      }
      if (this.chatPetService.onTheRun.get()) {
        this._transientState.set(void 0, void 0);
        this.chatPetService.setOnTheRun(false);
        return;
      }
      const wasSleeping = this._idleExpired.get() || this._renderedState === "sleep";
      if (wasSleeping) {
        this._wake();
      }
      if (wasSleeping || this._transientState.get() === "waking") {
        status(localize(12450, null));
        return;
      }
      const interaction = getChatPetClickInteraction(Math.random(), this._lastClickInteraction);
      this._lastClickInteraction = interaction;
      this._showTransientState(interaction);
      switch (interaction) {
        case "buttonPress":
          status(localize(12435, null));
          break;
        case "complete":
          status(localize(12445, null));
          break;
        case "love":
          status(localize(12431, null));
          break;
        case "cool":
          status(localize(12423, null));
          break;
        case "yapping":
          status(localize(12452, null));
          break;
        case "sing":
          status(localize(12442, null));
          break;
        case "speechless":
          status(localize(12444, null));
          break;
        case "worry":
          status(localize(12451, null));
          break;
      }
    }));
    this._register(this.chatPetService.onDidUnlockAchievement((id2) => {
      if (!this._enabled || !this.hostService.hasFocus || this.chatPetService.onTheRun.get() || this._isDead.get()) {
        return;
      }
      this._showTransientState("achievementUnlocked", false);
      status(localize(12416, null, getChatPetAchievement(id2).title));
    }));
    const motionReduced = observableFromEvent(this, this.accessibilityService.onDidChangeReducedMotion, () => this.accessibilityService.isMotionReduced());
    const targetWindow = getWindow(this._button.element);
    const targetWindowId = getWindowId(targetWindow);
    const windowActive = observableValue(this, isChatPetWindowActive(getWindowId(getActiveWindow()), targetWindowId));
    const ownershipChannel = this._register(new BroadcastDataChannel(CHAT_PET_WINDOW_OWNERSHIP_CHANNEL));
    this._register(ownershipChannel.onDidReceiveData(({ windowId }) => {
      windowActive.set(isChatPetWindowActive(windowId, targetWindowId), void 0);
    }));
    const claimWindowOwnership = () => {
      windowActive.set(true, void 0);
      ownershipChannel.postData({ windowId: targetWindowId });
    };
    this._register(addDisposableListener(targetWindow, EventType.FOCUS, claimWindowOwnership));
    this._register(this.hostService.onDidChangeActiveWindow((windowId) => {
      if (isChatPetWindowActive(windowId, targetWindowId)) {
        claimWindowOwnership();
      } else {
        windowActive.set(false, void 0);
      }
    }));
    if (shouldClaimChatPetWindowOnConstruction(windowActive.get(), targetWindow.document.hasFocus())) {
      claimWindowOwnership();
    }
    this._register(autorun((reader) => {
      const wasMotionReduced = this._motionReduced;
      this._motionReduced = motionReduced.read(reader);
      if (this._motionReduced) {
        this._blinkController.setEnabled(false);
      }
      if (!wasMotionReduced && this._motionReduced && this._button.element.classList.contains("throwing")) {
        this._finishThrow();
      }
      const serviceEnabled = this.chatPetService.enabled.read(reader);
      const isWindowActive = windowActive.read(reader);
      const scale = this.chatPetService.scale.read(reader);
      if (scale !== this._scale) {
        this._setScale(scale);
      }
      const enabled = isChatPetVisible(serviceEnabled, isWindowActive);
      const variant = this.chatPetService.variant.read(reader);
      const variantChanged = variant !== this._variant;
      this._variant = variant;
      const selectedAccessory = this.chatPetService.selectedAccessory.read(reader);
      const accessoryChanged = selectedAccessory !== this._selectedAccessory;
      this._selectedAccessory = selectedAccessory;
      if (accessoryChanged) {
        this._switchAccessory(selectedAccessory);
      }
      const onTheRun = this.chatPetService.onTheRun.read(reader);
      const isDead = this._isDead.read(reader);
      if (onTheRun || this._motionReduced) {
        this._button.element.classList.remove("returning-from-run");
      } else if (this._enabled && this._button.element.classList.contains("on-the-run")) {
        this._button.element.classList.add("returning-from-run");
      }
      this._button.element.classList.toggle("on-the-run", onTheRun);
      const currentHost = this._host.read(reader);
      const chatModel = currentHost.model.read(reader);
      const request2 = chatModel?.lastRequestObs.read(reader);
      const needsInput = !!request2?.response?.isPendingConfirmation.read(reader);
      let confirmationAttentionExpired = this._confirmationAttentionExpired.read(reader);
      if (!needsInput) {
        this._confirmationAttentionScheduler.cancel();
        if (confirmationAttentionExpired) {
          confirmationAttentionExpired = false;
          this._confirmationAttentionExpired.set(false, void 0);
        }
      } else if (!confirmationAttentionExpired && !this._confirmationAttentionScheduler.isScheduled()) {
        this._confirmationAttentionScheduler.schedule();
      }
      const hasActiveRequest = chatModel?.hasActiveRequest.read(reader) ?? false;
      const inputHasContent = currentHost.hasInput.read(reader);
      this._busy = hasActiveRequest || needsInput;
      let idleExpired = this._idleExpired.read(reader);
      let transientState = this._transientState.read(reader);
      this._button.setAriaLabel(this._getAriaLabel(onTheRun, transientState === "achievementUnlocked"));
      const isDragging = this._isDragging.read(reader);
      if (!this._enablementInitialized || enabled !== this._enabled) {
        const wasInitialized = this._enablementInitialized;
        this._enablementInitialized = true;
        this._enabled = enabled;
        this._observeHost(this._host.read(void 0));
        if (enabled) {
          if (isDead) {
            this._showRespawnSequence();
          } else {
            this._startEnableAnimation();
          }
        } else if (wasInitialized) {
          if (serviceEnabled && !isWindowActive) {
            this._finishDisable();
          } else {
            this._startDisableAnimation();
          }
        } else {
          this._finishDisable();
        }
      }
      if (!enabled) {
        this._hopController.cancel();
        this._idleScheduler.cancel();
        this._transientScheduler.cancel();
        if (transientState !== void 0) {
          this._transientState.set(void 0, void 0);
        }
        if (this._motionReduced) {
          this._finishDisable();
        }
        return;
      }
      if (isDead) {
        this._hopController.cancel();
        this._idleScheduler.cancel();
        this._transientScheduler.cancel();
        this._showRespawnSequence();
        return;
      }
      if (onTheRun) {
        this._hopController.cancel();
        this._idleScheduler.cancel();
        this._renderState("onTheRun", variantChanged);
        return;
      }
      if (this._busy) {
        this._idleScheduler.cancel();
        if (idleExpired) {
          idleExpired = false;
          this._idleExpired.set(false, void 0);
          transientState = this._beginWakeAnimation() ?? transientState;
        }
      } else if (!idleExpired && !this._idleScheduler.isScheduled()) {
        this._idleScheduler.schedule();
      }
      const baseState = getChatPetBaseState(hasActiveRequest, needsInput, confirmationAttentionExpired, inputHasContent, idleExpired);
      if (isChatPetYapState(transientState) && baseState !== "idle") {
        transientState = void 0;
        this._transientState.set(void 0, void 0);
      }
      const renderedState = getChatPetRenderedState(baseState, transientState, isDragging);
      if (renderedState !== "jump" || this._motionReduced) {
        this._hopController.cancel();
      }
      this._renderState(renderedState, variantChanged, isDragging);
    }));
    this._register(autorun((reader) => {
      const chatModel = this._host.read(reader).model.read(reader);
      const response = chatModel?.lastRequestObs.read(reader)?.response;
      if (!response) {
        return;
      }
      reader.store.add(response.onDidChange((e) => {
        if (e.reason === "completedRequest" && !response.isCanceled) {
          this._showTransientState("buttonPress");
        }
      }));
    }));
  }
  setHost(host) {
    if (this._host.get() === host) {
      return;
    }
    this.parent.classList.remove("chat-pet-host");
    this.parent = host.parent;
    this.dragBounds = host.dragBounds;
    this.movementBounds = host.movementBounds;
    this.parent.classList.add("chat-pet-host");
    this.parent.prepend(this._overlay);
    this._observeHost(host);
    this._host.set(host, void 0);
    this._handleHostLayoutChange();
  }
  _observeHost(host) {
    const store = new DisposableStore();
    if (this._enabled) {
      store.add(this._resizeObserver.observe(host.dragBounds));
      store.add(this._resizeObserver.observe(host.movementBounds));
      store.add(this._resizeObserver.observe(host.parent));
    }
    store.add(host.onDidChangePlatform(() => this._updatePlatformPosition()));
    this._hostLayoutDisposables.value = store;
  }
  _handleHostLayoutChange() {
    if (!this._enabled || this._getHorizontalBounds() === void 0) {
      return;
    }
    if (!this._positionInitialized) {
      this._restoreHorizontalPosition();
      this._updateVerticalPosition();
      return;
    }
    this._updateSpeechBubblePosition();
    if (this._isDead.get()) {
      this._updateRespawnEffectPosition();
    } else if (this._isAirborne()) {
      if (this._button.element.classList.contains("throwing")) {
        this._throwGeometryDirty = true;
      }
    } else {
      this._updateRestingPosition();
    }
  }
  _updatePlatformPosition() {
    if (!this._enabled || this._isDead.get() || this._getHorizontalBounds() === void 0) {
      return;
    }
    if (this._isAirborne()) {
      if (this._button.element.classList.contains("throwing")) {
        this._throwGeometryDirty = true;
      }
      return;
    }
    this._updateRestingPosition();
  }
  _updateRestingPosition() {
    if (this._isDragging.get()) {
      return;
    }
    if (this._fallLandsOnPlatform) {
      if (this._hasCustomPosition) {
        this._setAnchoredPlatformPosition();
      } else {
        this._setDefaultPlatformPosition();
      }
    } else {
      if (this._hasCustomPosition) {
        this._setAnchoredHorizontalPosition();
      } else {
        this._setDefaultHorizontalPosition();
      }
      this._updateVerticalPosition();
    }
  }
  _startDrag(event) {
    if (!this._enabled || this._isDead.get() || this._isDragging.get() || this._isAirborne() || this.chatPetService.onTheRun.get() || event.button !== 0) {
      return;
    }
    this._wake();
    EventHelper.stop(event);
    this._button.element.focus();
    const targetWindow = getWindow(this._button.element);
    const startX = event.clientX;
    const startY = event.clientY;
    const pointerSamples = [{ x: startX, y: startY, time: targetWindow.performance.now() }];
    const buttonBounds = this._button.element.getBoundingClientRect();
    const overlayBounds = this._overlay.getBoundingClientRect();
    const startLeft = buttonBounds.left - overlayBounds.left;
    const startTop = buttonBounds.top - overlayBounds.top;
    let didDrag = false;
    this._dragMonitor.startMonitoring(this._button.element, event.pointerId, event.buttons, (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const sampleTime = targetWindow.performance.now();
      pointerSamples.push({ x: moveEvent.clientX, y: moveEvent.clientY, time: sampleTime });
      while (pointerSamples.length > 2 && sampleTime - pointerSamples[0].time > THROW_VELOCITY_SAMPLE_DURATION) {
        pointerSamples.shift();
      }
      if (!didDrag && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
        return;
      }
      if (!didDrag) {
        didDrag = true;
        this._button.element.classList.remove("entering");
        this._button.element.classList.add("dragging");
        this._spriteAnimation.clear();
        this._setDragPosition(startLeft, startTop);
        this._isDragging.set(true, void 0);
      }
      EventHelper.stop(moveEvent, true);
      this._setDragPosition(startLeft + deltaX, startTop + deltaY);
    }, () => {
      this._button.element.classList.remove("dragging", "resisting", "soft-resisting");
      if (didDrag) {
        this._suppressNextPointerClick = true;
        this._clickSuppressionScheduler.schedule();
        const throwVelocity = getChatPetThrowVelocity(pointerSamples, targetWindow.performance.now());
        if (!this._motionReduced && throwVelocity) {
          this._beginThrow(throwVelocity);
        } else {
          this._beginFall();
        }
      }
    });
  }
  _setDragPosition(left, top2) {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const movementBounds = this.movementBounds.getBoundingClientRect();
    const minimumLeft = movementBounds.left - overlayBounds.left;
    const maximumLeft = movementBounds.right - overlayBounds.left - this._button.element.offsetWidth;
    const minimumTop = movementBounds.top - overlayBounds.top;
    const maximumTop = movementBounds.bottom - overlayBounds.top - this._button.element.offsetHeight;
    const [clampedLeft, clampedTop] = getChatPetDragPosition(left, top2, minimumLeft, maximumLeft, minimumTop, maximumTop);
    this._button.element.style.left = `${clampedLeft}px`;
    this._button.element.style.top = `${clampedTop}px`;
    this._button.element.style.right = "auto";
    this._button.element.style.bottom = "auto";
    this._hasCustomPosition = true;
    this._updateSpeechBubblePosition();
    if (this._button.element.classList.contains("dragging")) {
      this._updateDragWiggle();
    }
  }
  _getFallTarget() {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const platformBounds = this._getPlatformBounds();
    const fallbackPlatformBounds = this._getPlatformBounds(false);
    const movementBounds = this.movementBounds.getBoundingClientRect();
    return getChatPetFallTarget(
      Number.parseFloat(this._button.element.style.left),
      Number.parseFloat(this._button.element.style.top),
      this._getDisplaySize(),
      this._getDisplaySize(),
      platformBounds.left - overlayBounds.left,
      platformBounds.right - overlayBounds.left,
      platformBounds.top - overlayBounds.top,
      movementBounds.bottom - overlayBounds.top,
      fallbackPlatformBounds.top - overlayBounds.top
    );
  }
  _updateDragWiggle() {
    const landsOnPlatform = this._getFallTarget().landsOnPlatform;
    this._button.element.classList.toggle("soft-resisting", landsOnPlatform);
    this._button.element.classList.toggle("resisting", !landsOnPlatform);
  }
  _getThrowGeometry() {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const movementBounds = this.movementBounds.getBoundingClientRect();
    const platformBounds = this._getPlatformBounds(false);
    const displaySize = this._getDisplaySize();
    return {
      bounds: {
        minimumLeft: movementBounds.left - overlayBounds.left,
        maximumLeft: Math.max(movementBounds.left - overlayBounds.left, movementBounds.right - overlayBounds.left - displaySize),
        minimumTop: movementBounds.top - overlayBounds.top
      },
      displaySize,
      overlayLeft: overlayBounds.left,
      overlayTop: overlayBounds.top,
      platformLeft: platformBounds.left - overlayBounds.left,
      platformRight: platformBounds.right - overlayBounds.left,
      platformTop: platformBounds.top - overlayBounds.top,
      floorTop: movementBounds.bottom - overlayBounds.top - displaySize
    };
  }
  _beginThrow(velocity) {
    const targetWindow = getWindow(this._button.element);
    let geometry = this._getThrowGeometry();
    const buttonBounds = this._button.element.getBoundingClientRect();
    let motion = {
      left: buttonBounds.left - geometry.overlayLeft,
      top: buttonBounds.top - geometry.overlayTop,
      x: velocity.x,
      y: velocity.y
    };
    let rotation = 0;
    let wallImpact;
    const startTime = targetWindow.performance.now();
    let lastFrameTime = startTime;
    if (velocity.x !== 0) {
      this._setFacingDirection(velocity.x < 0 ? "left" : "right");
    }
    this._transientScheduler.cancel();
    this._throwWallImpact = void 0;
    this._throwGeometryDirty = false;
    this._fallLandsOnPlatform = false;
    this._setThrowPosition(motion.left, motion.top);
    this._transientState.set("falling", void 0);
    this._isDragging.set(false, void 0);
    this._renderState("falling", true);
    this._button.element.classList.add("throwing");
    const animationDisposables = new DisposableStore();
    const scheduledFrame = animationDisposables.add(new MutableDisposable());
    const scheduleFrame = () => {
      scheduledFrame.value = scheduleAtNextAnimationFrame(targetWindow, updateFrame);
    };
    const updateFrame = () => {
      if (this._throwAnimation.value !== animationDisposables) {
        return;
      }
      const now = targetWindow.performance.now();
      if (this._throwGeometryDirty) {
        geometry = this._getThrowGeometry();
        this._throwGeometryDirty = false;
        motion = {
          ...motion,
          left: getChatPetHorizontalPosition2(motion.left, geometry.bounds.minimumLeft, geometry.bounds.maximumLeft)
        };
        this._setThrowPosition(motion.left, motion.top);
      }
      if (shouldSettleChatPetThrow(startTime, now, motion.top, motion.y, geometry.floorTop)) {
        this._finishThrow();
        return;
      }
      if (wallImpact) {
        if (now < wallImpact.endsAt) {
          scheduleFrame();
          return;
        }
        motion = {
          ...motion,
          ...getChatPetWallReboundVelocity(motion)
        };
        rotation = wallImpact.wall === "left" ? -90 : 90;
        this._button.element.style.transform = `rotate(${rotation}deg)`;
        wallImpact = void 0;
        lastFrameTime = now;
        this._transientState.set("falling", void 0);
        scheduleFrame();
        return;
      }
      const elapsed = Math.min(THROW_MAX_FRAME_DURATION, Math.max(0, now - lastFrameTime));
      lastFrameTime = now;
      const previousLeft = motion.left;
      const previousTop = motion.top;
      const step = advanceChatPetThrow(motion, elapsed, geometry.bounds);
      motion = step;
      rotation = getChatPetThrowRotation(rotation, motion.left - previousLeft, motion.y, elapsed);
      this._setThrowPosition(motion.left, motion.top);
      const landing = getChatPetThrowLanding(previousLeft, previousTop, motion.left, motion.top, geometry.displaySize, geometry.displaySize, geometry.platformLeft, geometry.platformRight, geometry.platformTop, geometry.floorTop);
      if (motion.y >= 0 && landing) {
        motion = {
          ...motion,
          left: landing.left,
          top: landing.top
        };
        this._setThrowPosition(motion.left, motion.top);
        this._finishThrow(true, landing);
        return;
      }
      if (step.wall) {
        this._throwWallImpact = step.wall;
        wallImpact = { wall: step.wall, endsAt: now + CHAT_PET_WALL_IMPACT_DURATION };
        this._setFacingDirection(step.wall);
        rotation = step.wall === "left" ? -90 : 90;
        this._button.element.style.transform = `rotate(${rotation}deg)`;
        this._transientState.set("wallImpact", void 0);
        scheduleFrame();
        return;
      }
      this._button.element.style.transform = `rotate(${rotation}deg)`;
      scheduleFrame();
    };
    this._throwAnimation.value = animationDisposables;
    scheduleFrame();
  }
  _setThrowPosition(left, top2) {
    this._button.element.style.left = `${left}px`;
    this._button.element.style.top = `${top2}px`;
    this._button.element.style.right = "auto";
    this._button.element.style.bottom = "auto";
    this._hasCustomPosition = true;
  }
  _getThrowSettleTarget() {
    const geometry = this._getThrowGeometry();
    return {
      top: geometry.platformTop - geometry.displaySize,
      landsOnPlatform: true
    };
  }
  _finishThrow(announce = true, target) {
    if (!this._button.element.classList.contains("throwing")) {
      return;
    }
    const resolvedTarget = target ?? this._getThrowSettleTarget();
    const wallImpact = this._throwWallImpact;
    this._throwWallImpact = void 0;
    this._throwGeometryDirty = false;
    this._throwAnimation.clear();
    this._button.element.style.transform = "";
    this._button.element.style.top = `${resolvedTarget.top}px`;
    this._button.element.getBoundingClientRect();
    this._button.element.classList.remove("throwing");
    this._fallLandsOnPlatform = resolvedTarget.landsOnPlatform;
    this._completeFall(announce, wallImpact);
  }
  _isAirborne() {
    return this._button.element.classList.contains("falling") || this._button.element.classList.contains("throwing");
  }
  _beginFall() {
    const top2 = Number.parseFloat(this._button.element.style.top);
    const target = this._getFallTarget();
    this._transientScheduler.cancel();
    this._throwAnimation.clear();
    this._throwWallImpact = void 0;
    this._throwGeometryDirty = false;
    this._button.element.style.transform = "";
    this._button.element.classList.remove("throwing");
    this._button.element.classList.remove("resisting", "soft-resisting");
    this._fallLandsOnPlatform = target.landsOnPlatform;
    this._transientState.set("falling", void 0);
    this._isDragging.set(false, void 0);
    this._renderState("falling", true);
    this._button.element.style.transitionDuration = `${getChatPetFallDuration(target.top - top2)}ms`;
    this._button.element.getBoundingClientRect();
    this._button.element.classList.add("falling");
    this._button.element.style.top = `${target.top}px`;
    if (this._motionReduced || Math.abs(target.top - top2) <= POSITION_EPSILON) {
      this._finishFall();
    }
  }
  _finishFall(announce = true) {
    if (!this._button.element.classList.contains("falling")) {
      return;
    }
    this._button.element.classList.remove("falling");
    this._button.element.style.transitionDuration = "";
    this._completeFall(announce);
  }
  _completeFall(announce, wallImpact) {
    if (this._fallLandsOnPlatform) {
      const respawned = this._respawnPhase === "falling";
      this._respawnPhase = "none";
      this._respawnPosition = void 0;
      const left = this._getCurrentLeft();
      this._setPlatformPosition(left);
      if (announce) {
        this._showTransientState("splat");
        if (respawned) {
          status(localize(12437, null));
        } else if (wallImpact === "left") {
          status(localize(12418, null));
        } else if (wallImpact === "right") {
          status(localize(12420, null));
        } else {
          status(localize(12430, null));
        }
      }
      return;
    }
    this._deathPosition = [
      Number.parseFloat(this._button.element.style.left),
      Number.parseFloat(this._button.element.style.top)
    ];
    this._respawnPhase = "none";
    this._respawnPosition = void 0;
    this._button.element.classList.add("hidden");
    this._button.element.tabIndex = -1;
    this._isDead.set(true, void 0);
    if (announce) {
      if (wallImpact === "left") {
        status(localize(12419, null));
      } else if (wallImpact === "right") {
        status(localize(12421, null));
      } else {
        status(localize(12425, null));
      }
    }
  }
  _showContextMenu(event) {
    this._contextMenuVisible = true;
    const onTheRun = this.chatPetService.onTheRun.get();
    const actions = new DisposableStore();
    this._contextMenuActions.value = actions;
    const achievements = actions.add(new Action(
      "chat.pet.achievements",
      localize(12417, null),
      void 0,
      true,
      () => this.commandService.executeCommand(CHAT_PET_OPEN_ACHIEVEMENTS_COMMAND_ID)
    ));
    const stable = actions.add(new Action("chat.pet.variant.stable", localize(12449, null), void 0, true, () => this.chatPetService.setVariant("stable")));
    stable.checked = this.chatPetService.variant.get() === "stable";
    const insiders = actions.add(new Action("chat.pet.variant.insiders", localize(12448, null), void 0, true, () => this.chatPetService.setVariant("insiders")));
    insiders.checked = this.chatPetService.variant.get() === "insiders";
    const grow = actions.add(new Action("chat.pet.grow", localize(12428, null), void 0, true, () => {
      const scale = getChatPetScale2(this._scale, CHAT_PET_SCALE_STEP);
      this.chatPetService.setScale(scale);
      status(localize(12427, null, Math.round(scale * 100)));
    }));
    const shrink = actions.add(new Action("chat.pet.shrink", localize(12441, null), void 0, this._scale > CHAT_PET_MIN_SCALE, () => {
      const scale = getChatPetScale2(this._scale, -CHAT_PET_SCALE_STEP);
      this.chatPetService.setScale(scale);
      status(localize(12440, null, Math.round(scale * 100)));
    }));
    const resetSize = actions.add(new Action("chat.pet.resetSize", localize(12436, null), void 0, this._scale !== CHAT_PET_DEFAULT_SCALE, () => {
      this.chatPetService.resetScale();
      status(localize(12443, null, CHAT_PET_DEFAULT_SCALE * 100));
    }));
    const onTheRunAction = actions.add(new Action(
      "chat.pet.onTheRun",
      onTheRun ? localize(12422, null) : localize(12426, null),
      void 0,
      true,
      () => {
        this._transientState.set(void 0, void 0);
        this.chatPetService.setOnTheRun(!onTheRun);
      }
    ));
    const interactionSeparator = new Separator();
    const appearanceSeparator = new Separator();
    this.contextMenuService.showContextMenu({
      getAnchor: () => new StandardMouseEvent(getWindow(this._button.element), event),
      getActions: () => [
        achievements,
        onTheRunAction,
        interactionSeparator,
        grow,
        shrink,
        resetSize,
        appearanceSeparator,
        stable,
        insiders
      ],
      onHide: () => {
        this._contextMenuVisible = false;
        if (this._contextMenuActions.value === actions) {
          this._contextMenuActions.clear();
        }
      }
    });
  }
  _onKeyDown(event) {
    const hasPointerInteraction = this._isDragging.get() || this._dragMonitor.isMonitoring();
    if (!isChatPetKeyboardInteractionEnabled(this._enabled, this._isDead.get(), hasPointerInteraction, this._isAirborne(), this.chatPetService.onTheRun.get())) {
      return;
    }
    const keyboardEvent = new StandardKeyboardEvent(event);
    let direction = 0;
    let throwRequested = false;
    if (keyboardEvent.equals(1024 /* Shift */ | 15 /* LeftArrow */)) {
      direction = -1;
      throwRequested = true;
    } else if (keyboardEvent.equals(1024 /* Shift */ | 17 /* RightArrow */)) {
      direction = 1;
      throwRequested = true;
    } else if (keyboardEvent.equals(15 /* LeftArrow */)) {
      direction = -1;
    } else if (keyboardEvent.equals(17 /* RightArrow */)) {
      direction = 1;
    } else {
      return;
    }
    this._wake();
    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    const facingDirection = direction < 0 ? "left" : "right";
    if (this._transientState.get() === "dizzy" || this._recordDirectionChange(facingDirection)) {
      return;
    }
    this._setFacingDirection(facingDirection);
    if (throwRequested && !this._motionReduced) {
      this._beginThrow({
        x: direction * THROW_KEYBOARD_HORIZONTAL_VELOCITY,
        y: -THROW_KEYBOARD_UPWARD_VELOCITY
      });
      status(direction < 0 ? localize(12446, null) : localize(12447, null));
      return;
    }
    this._hopController.request(direction, this._motionReduced);
    status(direction < 0 ? localize(12432, null) : localize(12433, null));
  }
  _getAriaLabel(onTheRun, achievementUnlocked) {
    return achievementUnlocked ? localize(12434, null) : onTheRun ? localize(12439, null) : localize(12429, null);
  }
  _getCurrentLeft() {
    return this._button.element.offsetLeft;
  }
  _getDisplaySize() {
    return CHAT_PET_SOURCE_SIZE / 2 * this._scale;
  }
  _setScale(scale) {
    this._scale = scale;
    const displaySize = this._getDisplaySize();
    this._button.element.style.width = `${displaySize}px`;
    this._button.element.style.height = `${displaySize}px`;
    this._visual.style.transform = `scale(${scale})`;
    if (this._button.element.classList.contains("throwing")) {
      this._throwGeometryDirty = true;
    }
    if (!this._enabled || this._isDead.get() || this._isDragging.get() || this._isAirborne()) {
      return;
    }
    this._updateRestingPosition();
  }
  _setHorizontalPosition(left) {
    const bounds = this._getHorizontalBounds();
    if (!bounds) {
      return false;
    }
    return this._applyHorizontalPosition(left, bounds, true);
  }
  _setAnchoredHorizontalPosition() {
    const bounds = this._getHorizontalBounds();
    if (!bounds) {
      return;
    }
    const left = this._horizontalAnchor ? getChatPetAnchoredHorizontalPosition(this._horizontalAnchor, bounds.minimumLeft, bounds.maximumLeft) : this._getCurrentLeft();
    this._applyHorizontalPosition(left, bounds, false);
  }
  _applyHorizontalPosition(left, bounds, updateAnchor) {
    const { minimumLeft, maximumLeft } = bounds;
    const clampedLeft = getChatPetHorizontalPosition2(left, minimumLeft, maximumLeft);
    this._button.element.style.left = `${clampedLeft}px`;
    this._button.element.style.right = "auto";
    this._positionInitialized = true;
    this._hasCustomPosition = true;
    if (updateAnchor) {
      this._horizontalAnchor = getChatPetHorizontalAnchor(clampedLeft, minimumLeft, maximumLeft);
      const relativePosition = getChatPetRelativeHorizontalPosition(clampedLeft, minimumLeft, maximumLeft);
      if (relativePosition !== void 0) {
        this.chatPetService.setHorizontalPosition(relativePosition);
      }
    }
    this._updateSpeechBubblePosition();
    return clampedLeft !== left;
  }
  _setDefaultHorizontalPosition() {
    const bounds = this._getHorizontalBounds();
    if (!bounds) {
      return;
    }
    const { minimumLeft, maximumLeft } = bounds;
    this._button.element.style.left = `${getChatPetDefaultHorizontalPosition(minimumLeft, maximumLeft)}px`;
    this._button.element.style.right = "auto";
    this._positionInitialized = true;
    this._hasCustomPosition = false;
    this._horizontalAnchor = void 0;
    this._updateSpeechBubblePosition();
  }
  _getHorizontalBounds() {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const inputBounds = this.dragBounds.getBoundingClientRect();
    if (overlayBounds.width <= 0 || inputBounds.width <= 0) {
      return void 0;
    }
    return {
      minimumLeft: inputBounds.left - overlayBounds.left,
      maximumLeft: inputBounds.right - overlayBounds.left - this._getDisplaySize()
    };
  }
  _getPlatformBounds(includeHorizontalPlatform = true) {
    const hostBounds = this._overlay.getBoundingClientRect();
    const inputBounds = this.dragBounds.getBoundingClientRect();
    const petCenterX = includeHorizontalPlatform ? hostBounds.left + this._getCurrentLeft() + this._getDisplaySize() / 2 : void 0;
    return {
      left: inputBounds.left,
      right: inputBounds.right,
      top: getChatPetPlatformTop(hostBounds.top, inputBounds.top, this._host.get().getPlatformTop(petCenterX))
    };
  }
  _updateVerticalPosition() {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const platformTop = this._getPlatformBounds().top;
    this._button.element.style.top = "auto";
    this._button.element.style.bottom = `calc(100% - ${platformTop - overlayBounds.top}px)`;
  }
  _setPlatformPosition(left) {
    this._setHorizontalPosition(left);
    this._updatePlatformVerticalPosition();
  }
  _setAnchoredPlatformPosition() {
    this._setAnchoredHorizontalPosition();
    this._updatePlatformVerticalPosition();
  }
  _updatePlatformVerticalPosition() {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const platformBounds = this._getPlatformBounds();
    this._button.element.style.top = `${platformBounds.top - overlayBounds.top - this._getDisplaySize()}px`;
    this._button.element.style.bottom = "auto";
  }
  _setDefaultPlatformPosition() {
    this._setDefaultHorizontalPosition();
    this._updatePlatformVerticalPosition();
  }
  _showRespawnSequence() {
    this._blinkController.setEnabled(false);
    this._button.element.classList.add("hidden");
    this._button.element.tabIndex = -1;
    const startsDespawning = this._respawnPhase === "none";
    if (startsDespawning) {
      this._respawnPhase = "despawning";
    }
    if (this._respawnPhase !== "despawning" && this._respawnPhase !== "respawning") {
      return;
    }
    this._respawnEffect.container.classList.remove("hidden");
    this._updateRespawnEffectPosition();
    this._startRespawnEffectAnimation();
    if (startsDespawning) {
      this._respawnEffectScheduler.schedule(this._motionReduced ? RESPAWN_EFFECT_REDUCED_MOTION_DURATION : RESPAWN_EFFECT_DURATION);
    }
  }
  _updateRespawnEffectPosition() {
    const overlayBounds = this._overlay.getBoundingClientRect();
    const movementBounds = this.movementBounds.getBoundingClientRect();
    const displaySize = this._getDisplaySize();
    let left;
    let top2;
    if (this._respawnPhase === "despawning") {
      if (!this._deathPosition) {
        return;
      }
      const minimumLeft = movementBounds.left - overlayBounds.left;
      const maximumLeft = movementBounds.right - overlayBounds.left - displaySize;
      const minimumTop = movementBounds.top - overlayBounds.top;
      const maximumTop = movementBounds.bottom - overlayBounds.top - displaySize;
      [left, top2] = getChatPetDragPosition(this._deathPosition[0], this._deathPosition[1], minimumLeft, maximumLeft, minimumTop, maximumTop);
      this._deathPosition = [left, top2];
    } else if (this._respawnPhase === "respawning") {
      const inputBounds = this.dragBounds.getBoundingClientRect();
      const minimumLeft = inputBounds.left - overlayBounds.left;
      const maximumLeft = inputBounds.right - overlayBounds.left - displaySize;
      left = getChatPetDefaultHorizontalPosition(minimumLeft, maximumLeft);
      top2 = movementBounds.top - overlayBounds.top;
      this._respawnPosition = [left, top2];
    } else {
      return;
    }
    this._respawnEffect.container.style.left = `${left}px`;
    this._respawnEffect.container.style.top = `${top2}px`;
  }
  _showRespawnEffect() {
    if (!this._enabled || !this._isDead.get() || this._respawnPhase !== "despawning") {
      return;
    }
    this._respawnPhase = "respawning";
    this._respawnAnimation.clear();
    this._updateRespawnEffectPosition();
    this._startRespawnEffectAnimation();
    this._respawnFallScheduler.schedule(this._motionReduced ? RESPAWN_EFFECT_REDUCED_MOTION_DURATION : RESPAWN_EFFECT_DURATION);
    status(localize(12438, null));
  }
  _startRespawnEffectAnimation() {
    if (this._respawnPhase !== "despawning" && this._respawnPhase !== "respawning") {
      return;
    }
    const sources = getRespawnSpriteSources(this._variant);
    const source = this._motionReduced ? sources.reducedMotion : sources.animated;
    if (!isChatPetImageSource(this._respawnEffect.image, source.url)) {
      this._respawnAnimation.clear();
      this._respawnEffect.image.removeAttribute("src");
      this._respawnEffect.image.src = source.url;
      return;
    }
    if (this._respawnEffect.image.complete && this._respawnEffect.image.naturalWidth > 0) {
      this._respawnAnimation.clear();
      this._startSpriteAnimation(source, this._respawnEffect, this._respawnAnimation, void 0, this._respawnPhase === "despawning");
    }
  }
  _beginRespawnFall() {
    if (!this._enabled || !this._isDead.get() || this._respawnPhase !== "respawning") {
      return;
    }
    this._respawnPhase = "falling";
    this._respawnAnimation.clear();
    this._respawnEffect.container.classList.add("hidden");
    this._deathPosition = void 0;
    this._fallLandsOnPlatform = true;
    this._transientState.set("falling", void 0);
    this._button.element.classList.remove("falling", "throwing", "dragging", "resisting", "soft-resisting");
    this._button.element.style.transform = "";
    this._button.element.classList.remove("hidden");
    this._button.element.tabIndex = 0;
    if (!this._respawnPosition) {
      this._updateRespawnEffectPosition();
    }
    const [spawnLeft, spawnTop] = this._respawnPosition ?? [this._getCurrentLeft(), 0];
    this._button.element.style.left = `${spawnLeft}px`;
    this._button.element.style.right = "auto";
    this._hasCustomPosition = false;
    const overlayBounds = this._overlay.getBoundingClientRect();
    const platformBounds = this._getPlatformBounds();
    const startTop = spawnTop;
    const targetTop = platformBounds.top - overlayBounds.top - this._getDisplaySize();
    this._button.element.style.top = `${startTop}px`;
    this._button.element.style.bottom = "auto";
    this._button.element.style.transitionDuration = `${getChatPetFallDuration(targetTop - startTop)}ms`;
    this._renderState("falling", true);
    this._isDead.set(false, void 0);
    this._button.element.getBoundingClientRect();
    this._button.element.classList.add("falling");
    this._button.element.style.top = `${targetTop}px`;
    if (this._motionReduced || startTop === targetTop) {
      this._finishFall();
    }
  }
  _updateSpeechBubblePosition() {
    const buttonBounds = this._button.element.getBoundingClientRect();
    const inputBounds = this.dragBounds.getBoundingClientRect();
    this._button.element.classList.toggle("speech-bubble-left", shouldPlaceChatPetSpeechBubbleLeft(this._renderedState, buttonBounds.right, inputBounds.right, this._scale));
    const wideSpriteOffset = getChatPetWideSpriteHorizontalOffset(this._renderedState, this._facingController.direction, buttonBounds.left, buttonBounds.right, inputBounds.left, inputBounds.right, this._scale);
    setChatPetWideLayerOffset(wideSpriteOffset, [
      ...this._activeSprite ? [this._activeSprite.container] : [],
      this._eyes,
      this._eyeAccessoryContainer
    ]);
  }
  _updateGaze() {
    if (!this._cursorPosition) {
      return;
    }
    const bounds = this._button.element.getBoundingClientRect();
    const facingDirection = this._facingController.update(this._cursorPosition[0], bounds.left + bounds.width / 2);
    if (this._button.element.dataset.facing !== facingDirection) {
      this._setFacingDirection(facingDirection);
      this._recordDirectionChange(facingDirection);
    }
    const [x, y] = getChatPetGazeDirection(
      this._cursorPosition[0],
      this._cursorPosition[1],
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2
    );
    for (const pupil of this._pupils) {
      pupil.style.transform = `translate(${x * 2}px, ${y * 2}px)`;
    }
    this._eyeAccessoryGazeOffset = getChatPetEyeAccessoryGazeOffset([x, y]);
    this._redrawEyeAccessory?.();
  }
  _snapFacingToCursor() {
    if (!this._cursorPosition) {
      return;
    }
    const bounds = this._button.element.getBoundingClientRect();
    this._setFacingDirection(this._facingController.snapToCursor(this._cursorPosition[0], bounds.left + bounds.width / 2));
  }
  _setFacingDirection(direction) {
    const changed = this._button.element.dataset.facing !== direction;
    this._facingController.setDirection(direction);
    this._button.element.dataset.facing = direction;
    if (changed) {
      this._redrawActiveFrame?.();
      this._updateSpeechBubblePosition();
    }
  }
  _recordDirectionChange(direction) {
    if (!this._enabled || this._isDead.get() || this.chatPetService.onTheRun.get() || this._transientState.get() === "dizzy") {
      return false;
    }
    if (!this._directionChangeController.record(direction, getWindow(this._button.element).performance.now())) {
      return false;
    }
    this._setFacingDirection(direction);
    this._showTransientState("dizzy", false);
    status(localize(12424, null));
    return true;
  }
  _startEnableAnimation() {
    this._button.element.classList.remove("hidden", "exiting", "entering");
    this._button.element.tabIndex = 0;
    this._restoreHorizontalPosition();
    this._updateVerticalPosition();
    this._button.element.getBoundingClientRect();
    this._gazeScheduler.schedule();
    if (!this._motionReduced) {
      this._button.element.classList.add("entering");
    }
  }
  _restoreHorizontalPosition() {
    const bounds = this._getHorizontalBounds();
    if (!bounds) {
      return;
    }
    const relativePosition = this.chatPetService.horizontalPosition.get();
    const left = getChatPetRestoredHorizontalPosition(relativePosition, bounds.minimumLeft, bounds.maximumLeft);
    this._button.element.style.left = `${left}px`;
    this._button.element.style.right = "auto";
    this._positionInitialized = true;
    this._hasCustomPosition = relativePosition !== void 0;
    this._horizontalAnchor = relativePosition === void 0 ? void 0 : getChatPetHorizontalAnchor(left, bounds.minimumLeft, bounds.maximumLeft);
    this._updateSpeechBubblePosition();
  }
  _startDisableAnimation() {
    this._blinkController.setEnabled(false);
    if (this._button.element.classList.contains("throwing")) {
      this._finishThrow(false);
    }
    this._button.element.tabIndex = -1;
    this._button.element.classList.remove("entering");
    if (this._motionReduced || this._button.element.classList.contains("hidden")) {
      this._finishDisable();
      return;
    }
    this._button.element.classList.add("exiting");
  }
  _finishDisable() {
    if (this._button.element.classList.contains("throwing")) {
      this._finishThrow(false);
    }
    if (this._button.element.classList.contains("falling")) {
      this._finishFall(false);
    }
    this._hopController.cancel();
    if (this._isDragging.get()) {
      this._isDragging.set(false, void 0);
    }
    this._throwAnimation.clear();
    this._throwGeometryDirty = false;
    this._button.element.style.transform = "";
    this._button.element.classList.remove("entering", "exiting", "falling", "throwing", "dragging", "resisting", "soft-resisting", "returning-from-run");
    this._button.element.style.transitionDuration = "";
    this._button.element.classList.add("hidden");
    this._respawnEffectScheduler.cancel();
    this._respawnFallScheduler.cancel();
    this._respawnAnimation.clear();
    this._respawnEffect.container.classList.add("hidden");
    this._respawnPhase = "none";
    this._respawnPosition = void 0;
    this._spriteAnimation.clear();
    this._speechAnimation.clear();
    this._redrawEyeAccessory = void 0;
    this._eyeAccessoryGazeOffset = [0, 0];
    this._eyeAccessoryVisible = false;
    this._eyeAccessoryContainer.classList.add("hidden");
    this._eyeAccessory.getContext("2d")?.clearRect(0, 0, this._eyeAccessory.width, this._eyeAccessory.height);
    this._speechBubble.container.classList.add("hidden");
    this._speechBubble.image.removeAttribute("src");
    this._pendingRender = void 0;
    this._pendingAccessorySwitch = void 0;
    this._renderGeneration++;
    this._accessoryGeneration++;
    this._activeSprite = void 0;
    this._activeSource = void 0;
    this._redrawActiveFrame = void 0;
    this._renderedState = void 0;
    this._directionChangeController.reset();
    for (const sprite of this._sprites) {
      sprite.container.classList.add("hidden");
      sprite.image.removeAttribute("src");
      sprite.activeAccessory = void 0;
      sprite.activeAccessoryImage = void 0;
      for (const accessoryImage of sprite.accessoryImages ?? []) {
        accessoryImage.removeAttribute("src");
      }
    }
  }
  _showTransientState(state, snapFacingToCursor = true) {
    if (!this.chatPetService.enabled.get()) {
      return;
    }
    if (this._transientState.get() === "achievementUnlocked" && state !== "achievementUnlocked") {
      return;
    }
    if (snapFacingToCursor) {
      this._snapFacingToCursor();
    }
    this._wake();
    const renderedState = state === "yapping" && this._motionReduced ? "yappingMouthOpen" : state;
    this._transientState.set(renderedState, void 0);
    if (renderedState === "yappingMouthOpen" || renderedState === "yapping") {
      this._transientScheduler.cancel();
    } else {
      this._transientScheduler.schedule(getTransientStateDuration(renderedState));
    }
    if (!this._isDragging.get() && this._transientState.get() === renderedState) {
      this._renderState(renderedState, true);
    }
  }
  _wake() {
    const wasSleeping = this._idleExpired.get() || this._renderedState === "sleep";
    this._idleExpired.set(false, void 0);
    if (this._busy) {
      this._idleScheduler.cancel();
    } else {
      this._idleScheduler.schedule();
    }
    if (wasSleeping) {
      this._beginWakeAnimation();
    }
  }
  _beginWakeAnimation() {
    if (this._motionReduced) {
      return void 0;
    }
    this._transientState.set("waking", void 0);
    this._transientScheduler.schedule(WAKE_STATE_DURATION);
    return "waking";
  }
  _renderState(state, restart = false, useStaticSprite = false) {
    if (state !== "idle" || useStaticSprite) {
      this._facingController.setState(state, useStaticSprite);
    }
    const sources = getSpriteSources(this._variant)[state];
    const source = this._motionReduced || useStaticSprite ? sources.reducedMotion : sources.animated;
    if (!restart && this._activeSprite && isChatPetImageSource(this._activeSprite.image, source.url)) {
      this._pendingRender = void 0;
      this._renderGeneration++;
      this._button.element.dataset.state = state;
      this._renderedState = state;
      this._setRenderedFacingState(state, useStaticSprite);
      this._updateEyes(state);
      this._updateSpeechBubble(state, restart);
      return;
    }
    const sprite = this._sprites.find((candidate) => candidate !== this._activeSprite);
    if (!sprite) {
      return;
    }
    const accessorySource = this._getAccessoryImageSource();
    const cachedAccessoryImage = accessorySource ? sprite.accessoryImages?.find((candidate) => isChatPetImageSource(candidate, accessorySource.url) && candidate.complete && candidate.naturalWidth > 0) : void 0;
    const accessoryImage = accessorySource && !this._failedAccessorySources.has(accessorySource.url) ? cachedAccessoryImage ?? sprite.accessoryImages?.find((candidate) => candidate !== sprite.activeAccessoryImage) : void 0;
    const generation = ++this._renderGeneration;
    this._pendingRender = {
      generation,
      sprite,
      bodySource: source,
      accessorySource: accessoryImage ? accessorySource : void 0,
      accessoryImage,
      accessory: accessoryImage ? this._selectedAccessory : void 0,
      state,
      useStaticSprite
    };
    sprite.image.removeAttribute("src");
    sprite.image.src = source.url;
    if (accessoryImage && accessorySource && accessoryImage !== cachedAccessoryImage) {
      accessoryImage.removeAttribute("src");
      accessoryImage.src = accessorySource.url;
    }
  }
  _getAccessoryImageSource() {
    if (!this._selectedAccessory) {
      return void 0;
    }
    return getChatPetAccessoryImageSource(getChatPetAccessory(this._selectedAccessory));
  }
  _onBodyImageLoad(sprite) {
    if (sprite !== this._pendingRender?.sprite) {
      return;
    }
    this._tryCompletePendingRender();
  }
  _onBodyImageError(sprite) {
    const pendingRender = this._pendingRender;
    if (!pendingRender || pendingRender.sprite !== sprite || !isChatPetImageSource(sprite.image, pendingRender.bodySource.url)) {
      return;
    }
    this.logService.error(`[ChatPetWidget] Failed to load pet sprite: ${pendingRender.bodySource.url}`);
    this._pendingRender = void 0;
  }
  _onAccessoryImageLoad(sprite, image) {
    if (this._pendingRender?.sprite === sprite && this._pendingRender.accessoryImage === image) {
      this._tryCompletePendingRender();
    }
    if (this._pendingAccessorySwitch?.sprite === sprite && this._pendingAccessorySwitch.image === image) {
      this._tryCompleteAccessorySwitch();
    }
  }
  _onAccessoryImageError(sprite, image) {
    const pendingRender = this._pendingRender;
    if (pendingRender?.sprite === sprite && pendingRender.accessoryImage === image && pendingRender.accessorySource) {
      this._recordAccessoryFailure(pendingRender.accessorySource.url, "load");
      this._pendingRender = {
        ...pendingRender,
        accessorySource: void 0,
        accessoryImage: void 0,
        accessory: void 0
      };
      this._tryCompletePendingRender();
    }
    const pendingSwitch = this._pendingAccessorySwitch;
    if (pendingSwitch?.sprite === sprite && pendingSwitch.image === image) {
      this._recordAccessoryFailure(pendingSwitch.source.url, "load");
      this._completeAccessorySwitchWithoutAccessory(pendingSwitch);
    }
  }
  _tryCompletePendingRender() {
    const pendingRender = this._pendingRender;
    if (!pendingRender || pendingRender.generation !== this._renderGeneration || !isChatPetImageSource(pendingRender.sprite.image, pendingRender.bodySource.url) || !pendingRender.sprite.image.complete || pendingRender.sprite.image.naturalWidth === 0) {
      return;
    }
    const frameHeight = pendingRender.bodySource.frameHeight ?? CHAT_PET_SOURCE_SIZE;
    const frameCount = Math.max(1, pendingRender.bodySource.frameDurations.length);
    if (!hasChatPetBodyImageDimensions(pendingRender.sprite.image, pendingRender.bodySource.frameWidth, frameHeight, frameCount)) {
      this.logService.error(`[ChatPetWidget] Invalid pet sprite dimensions: ${pendingRender.bodySource.url}`);
      this._pendingRender = void 0;
      return;
    }
    if (pendingRender.accessorySource && pendingRender.accessoryImage) {
      if (!isChatPetImageSource(pendingRender.accessoryImage, pendingRender.accessorySource.url) || !pendingRender.accessoryImage.complete || pendingRender.accessoryImage.naturalWidth === 0) {
        return;
      }
      if (!hasChatPetAccessoryImageDimensions(pendingRender.accessoryImage, pendingRender.accessorySource)) {
        this._recordAccessoryFailure(pendingRender.accessorySource.url, "dimensions");
        this._pendingRender = {
          ...pendingRender,
          accessorySource: void 0,
          accessoryImage: void 0,
          accessory: void 0
        };
        this._tryCompletePendingRender();
        return;
      }
    }
    this._spriteAnimation.clear();
    const previousSprite = this._activeSprite;
    previousSprite?.container.classList.add("hidden");
    pendingRender.sprite.container.classList.remove("hidden");
    pendingRender.sprite.activeAccessory = pendingRender.accessory;
    pendingRender.sprite.activeAccessoryImage = pendingRender.accessoryImage;
    this._activeSprite = pendingRender.sprite;
    this._activeSource = pendingRender.bodySource;
    this._pendingAccessorySwitch = void 0;
    this._accessoryGeneration++;
    const state = pendingRender.state;
    this._startSpriteAnimation(
      pendingRender.bodySource,
      pendingRender.sprite,
      this._spriteAnimation,
      () => this._onSpriteAnimationComplete(pendingRender.sprite, state),
      false,
      (frameIndex) => {
        if (pendingRender.sprite === this._activeSprite) {
          this._updateEyes(state, frameIndex);
        }
      },
      state
    );
    this._button.element.dataset.state = state;
    this._renderedState = state;
    this._setRenderedFacingState(state, this._isDragging.get());
    this._updateEyes(state);
    this._updateSpeechBubble(state, true);
    this._pendingRender = void 0;
    this._clearUnusedAccessoryImages(pendingRender.sprite, pendingRender.accessorySource?.url);
    if (previousSprite) {
      if (!pendingRender.accessorySource || !previousSprite.activeAccessoryImage || !isChatPetImageSource(previousSprite.activeAccessoryImage, pendingRender.accessorySource.url)) {
        previousSprite.activeAccessory = void 0;
        previousSprite.activeAccessoryImage = void 0;
      }
      this._clearUnusedAccessoryImages(previousSprite, pendingRender.accessorySource?.url);
    }
    this._restartEyeAnimation();
  }
  _switchAccessory(accessory) {
    const pendingRender = this._pendingRender;
    if (pendingRender) {
      this._renderState(pendingRender.state, true, pendingRender.useStaticSprite);
    }
    const sprite = this._activeSprite;
    const bodySource = this._activeSource;
    const state = this._renderedState;
    const generation = ++this._accessoryGeneration;
    this._pendingAccessorySwitch = void 0;
    if (!sprite || !bodySource || !state) {
      return;
    }
    if (!accessory) {
      sprite.activeAccessory = void 0;
      sprite.activeAccessoryImage = void 0;
      this._clearAllAccessoryImages();
      this._redrawActiveFrame?.();
      return;
    }
    const source = getChatPetAccessoryImageSource(getChatPetAccessory(accessory));
    if (this._failedAccessorySources.has(source.url)) {
      sprite.activeAccessory = void 0;
      sprite.activeAccessoryImage = void 0;
      this._clearAllAccessoryImages();
      this._redrawActiveFrame?.();
      return;
    }
    const image = sprite.accessoryImages?.find((candidate) => candidate !== sprite.activeAccessoryImage);
    if (!image) {
      return;
    }
    this._pendingAccessorySwitch = { generation, sprite, source, image, accessory };
    image.removeAttribute("src");
    image.src = source.url;
  }
  _tryCompleteAccessorySwitch() {
    const pendingSwitch = this._pendingAccessorySwitch;
    if (!pendingSwitch || pendingSwitch.generation !== this._accessoryGeneration || pendingSwitch.accessory !== this._selectedAccessory || !isChatPetImageSource(pendingSwitch.image, pendingSwitch.source.url) || !pendingSwitch.image.complete || pendingSwitch.image.naturalWidth === 0) {
      return;
    }
    if (!hasChatPetAccessoryImageDimensions(pendingSwitch.image, pendingSwitch.source)) {
      this._recordAccessoryFailure(pendingSwitch.source.url, "dimensions");
      this._completeAccessorySwitchWithoutAccessory(pendingSwitch);
      return;
    }
    pendingSwitch.sprite.activeAccessory = pendingSwitch.accessory;
    pendingSwitch.sprite.activeAccessoryImage = pendingSwitch.image;
    this._pendingAccessorySwitch = void 0;
    this._clearAllAccessoryImages((source) => source === pendingSwitch.source.url);
    this._redrawActiveFrame?.();
  }
  _completeAccessorySwitchWithoutAccessory(pendingSwitch) {
    if (this._pendingAccessorySwitch !== pendingSwitch) {
      return;
    }
    pendingSwitch.sprite.activeAccessory = void 0;
    pendingSwitch.sprite.activeAccessoryImage = void 0;
    this._pendingAccessorySwitch = void 0;
    this._clearAllAccessoryImages();
    this._redrawActiveFrame?.();
  }
  _recordAccessoryFailure(url, reason) {
    if (this._failedAccessorySources.has(url)) {
      return;
    }
    this._failedAccessorySources.add(url);
    this.logService.error(`[ChatPetWidget] Failed chat pet accessory ${reason === "load" ? "load" : "dimension validation"}: ${url}`);
  }
  _clearUnusedAccessoryImages(sprite, keepSourceUrl) {
    for (const image of sprite.accessoryImages ?? []) {
      if (!keepSourceUrl || !isChatPetImageSource(image, keepSourceUrl)) {
        image.removeAttribute("src");
      }
    }
  }
  _clearAllAccessoryImages(keepSource) {
    for (const sprite of this._sprites) {
      for (const image of sprite.accessoryImages ?? []) {
        const source = image.getAttribute("src");
        if (!source || !keepSource?.(source)) {
          image.removeAttribute("src");
          if (sprite.activeAccessoryImage === image) {
            sprite.activeAccessory = void 0;
            sprite.activeAccessoryImage = void 0;
          }
        }
      }
    }
  }
  _setRenderedFacingState(state, isDragging) {
    this._facingController.setState(state, isDragging);
    if (!isDragging && doesChatPetStateTrackCursor(state)) {
      this._gazeScheduler.schedule();
    }
  }
  _updateEyes(state, frameIndex) {
    const tracksCursor = doesChatPetStateTrackCursor(state);
    const blinking = doesChatPetStateBlink(state, frameIndex);
    this._eyes.classList.toggle("tracking", tracksCursor);
    this._eyes.classList.toggle("blinking", blinking);
    this._blinkController.setEnabled(this._enabled && !this._motionReduced && !getWindow(this._eyes).document.hidden && (tracksCursor || blinking));
    if (!tracksCursor && (this._eyeAccessoryGazeOffset[0] !== 0 || this._eyeAccessoryGazeOffset[1] !== 0)) {
      this._eyeAccessoryGazeOffset = [0, 0];
      this._redrawEyeAccessory?.();
    }
    if (blinking) {
      for (const pupil of this._pupils) {
        pupil.style.transform = "";
      }
    }
  }
  _onSpriteAnimationComplete(sprite, state) {
    if (sprite !== this._activeSprite) {
      return;
    }
    if (state === "jump") {
      this._hopController.onAnimationComplete();
    }
  }
  _startSpriteAnimation(source, sprite, animationDisposable, onComplete, reverse = false, onFrame, state) {
    const { frameDurations } = source;
    const { image, canvas } = sprite;
    const displaySize = sprite === this._speechBubble ? 72 : sprite === this._respawnEffect ? this._getDisplaySize() : 48;
    const frameHeight = source.frameHeight ?? CHAT_PET_SOURCE_SIZE;
    const displayScale = displaySize / CHAT_PET_SOURCE_SIZE;
    const displayWidth = source.frameWidth * displayScale;
    const displayHeight = frameHeight * displayScale;
    sprite.container.style.width = `${displayWidth}px`;
    sprite.container.style.height = `${displayHeight}px`;
    canvas.width = source.frameWidth;
    canvas.height = frameHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    const context2 = canvas.getContext("2d");
    if (!context2) {
      return;
    }
    context2.imageSmoothingEnabled = false;
    const drawFrame = (frameIndex) => {
      if (state) {
        const activeAccessory = sprite.activeAccessory ? getChatPetAccessory(sprite.activeAccessory) : void 0;
        drawChatPetComposite(
          context2,
          image,
          sprite.activeAccessoryImage,
          frameIndex,
          source.accessoryRigFrame ?? frameIndex,
          source.frameWidth,
          frameHeight,
          this._facingController.direction,
          state,
          source.fixedOrientationDecorations,
          false,
          activeAccessory?.eyeAccessoryMirrorsWithFacing !== false,
          activeAccessory?.coversAntennae === true
        );
        this._drawEyeAccessory(sprite.activeAccessory, sprite.activeAccessoryImage, source, state, source.accessoryRigFrame ?? frameIndex);
      } else {
        context2.clearRect(0, 0, source.frameWidth, frameHeight);
        context2.drawImage(image, frameIndex * source.frameWidth, 0, source.frameWidth, frameHeight, 0, 0, source.frameWidth, frameHeight);
      }
      if (sprite === this._activeSprite) {
        this._activeFrameIndex = frameIndex;
      }
      onFrame?.(frameIndex);
    };
    if (sprite === this._activeSprite) {
      this._redrawActiveFrame = () => drawFrame(this._activeFrameIndex);
      this._redrawEyeAccessory = state ? () => this._drawEyeAccessory(sprite.activeAccessory, sprite.activeAccessoryImage, source, state, source.accessoryRigFrame ?? this._activeFrameIndex) : void 0;
    }
    const initialFrameIndex = reverse && frameDurations.length > 0 ? frameDurations.length - 1 : 0;
    drawFrame(initialFrameIndex);
    if (frameDurations.length < 2) {
      return;
    }
    const targetWindow = getWindow(canvas);
    const startTime = targetWindow.performance.now();
    let currentFrame = 0;
    let frameTimer;
    const animationDisposables = new DisposableStore();
    const clearFrameTimer = () => {
      if (frameTimer !== void 0) {
        targetWindow.clearTimeout(frameTimer);
        frameTimer = void 0;
      }
    };
    const scheduleFrame = (delay) => {
      clearFrameTimer();
      if (!targetWindow.document.hidden) {
        frameTimer = targetWindow.setTimeout(updateFrame, Math.max(1, Math.ceil(delay)));
      }
    };
    const updateFrame = () => {
      frameTimer = void 0;
      const frame = getChatPetAnimationFrame(frameDurations, targetWindow.performance.now() - startTime, source.iterations, reverse);
      if (frame.complete) {
        drawFrame(frame.frameIndex);
        animationDisposables.dispose();
        onComplete?.();
        return;
      }
      if (frame.frameIndex !== currentFrame) {
        currentFrame = frame.frameIndex;
        drawFrame(frame.frameIndex);
      }
      scheduleFrame(frame.nextFrameDelay);
    };
    animationDisposables.add(addDisposableListener(targetWindow.document, "visibilitychange", () => {
      clearFrameTimer();
      if (!targetWindow.document.hidden) {
        updateFrame();
      }
    }));
    animationDisposables.add(toDisposable(clearFrameTimer));
    scheduleFrame(frameDurations[initialFrameIndex]);
    animationDisposable.value = animationDisposables;
  }
  _drawEyeAccessory(accessoryId, accessoryImage, source, state, rigFrameIndex) {
    const frameHeight = source.frameHeight ?? CHAT_PET_SOURCE_SIZE;
    const visible = accessoryImage !== void 0 && getChatPetAccessoryRigFrame(state, rigFrameIndex).rightEye !== void 0;
    if (visible !== this._eyeAccessoryVisible) {
      this._eyeAccessoryVisible = visible;
      this._eyeAccessoryContainer.classList.toggle("hidden", !visible);
    }
    if (!visible || !accessoryImage) {
      return;
    }
    const accessory = accessoryId ? getChatPetAccessory(accessoryId) : void 0;
    const mirrorsWithFacing = accessory?.eyeAccessoryMirrorsWithFacing !== false;
    const fixedOrientation = !mirrorsWithFacing;
    if (fixedOrientation !== this._eyeAccessoryFixedOrientation) {
      this._eyeAccessoryFixedOrientation = fixedOrientation;
      this._eyeAccessoryContainer.classList.toggle("fixed-orientation", fixedOrientation);
    }
    const dimensions = this._eyeAccessoryDimensions;
    if (!dimensions || dimensions.frameWidth !== source.frameWidth || dimensions.frameHeight !== frameHeight) {
      this._eyeAccessoryDimensions = { frameWidth: source.frameWidth, frameHeight };
      const displayScale = 48 / CHAT_PET_SOURCE_SIZE;
      this._eyeAccessory.width = source.frameWidth;
      this._eyeAccessory.height = frameHeight;
      this._eyeAccessoryContainer.style.width = `${source.frameWidth * displayScale}px`;
      this._eyeAccessoryContainer.style.height = `${frameHeight * displayScale}px`;
      this._eyeAccessory.style.width = `${source.frameWidth * displayScale}px`;
      this._eyeAccessory.style.height = `${frameHeight * displayScale}px`;
    }
    const context2 = this._eyeAccessory.getContext("2d");
    if (!context2) {
      return;
    }
    context2.imageSmoothingEnabled = false;
    const facingDirection = source.fixedOrientationDecorations || !mirrorsWithFacing ? this._facingController.direction : "right";
    drawChatPetEyeAccessory(
      context2,
      accessoryImage,
      state,
      rigFrameIndex,
      facingDirection,
      mirrorsWithFacing,
      mirrorsWithFacing ? void 0 : this._eyeAccessoryGazeOffset
    );
  }
  _updateSpeechBubble(state, restart = false) {
    this._updateSpeechBubblePosition();
    const visible = doesChatPetStateSpeak(state);
    const speechBubbleState = visible ? state : void 0;
    const stateChanged = speechBubbleState !== this._speechBubbleState;
    this._speechBubbleState = speechBubbleState;
    this._speechBubble.container.classList.toggle("hidden", !visible);
    if (!visible) {
      this._speechAnimation.clear();
      return;
    }
    const sources = getSpeechSpriteSources(this._variant);
    const source = this._motionReduced ? sources.reducedMotion : sources.animated;
    if (!isChatPetImageSource(this._speechBubble.image, source.url)) {
      this._speechAnimation.clear();
      this._speechBubble.image.removeAttribute("src");
      this._speechBubble.image.src = source.url;
      return;
    }
    if ((restart || stateChanged) && this._speechBubble.image.complete && this._speechBubble.image.naturalWidth > 0) {
      this._speechAnimation.clear();
      this._startSpriteAnimation(
        source,
        this._speechBubble,
        this._speechAnimation,
        void 0,
        false,
        state === "achievementUnlocked" ? () => {
          const context2 = this._speechBubble.canvas.getContext("2d");
          if (context2) {
            drawChatPetAchievementStar(context2, this._variant);
          }
        } : void 0
      );
    }
  }
  _restartEyeAnimation() {
    this._eyes.classList.remove("animated");
    this._eyes.getBoundingClientRect();
    if (!this._motionReduced) {
      this._eyes.classList.add("animated");
    }
  }
};

ChatPetWidget = __decorateClass([
  __decorateParam(2, IChatPetService),
  __decorateParam(3, IAccessibilityService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IHostService)
], ChatPetWidget);
export { getChatPetBuddyName, doesChatPetStateTrackCursor, doesChatPetStateBlink, getChatPetSpriteName, getChatPetFrameDurations, createSpriteSources, getSpriteSources, getSpeechSpriteSources, getRespawnSpriteSources, doesChatPetStateSpeak, drawChatPetAchievementStar, isChatPetImageSource, getChatPetBaseState, shouldReserveChatPetSpace, isChatPetVisible, isChatPetWindowActive, shouldClaimChatPetWindowOnConstruction, isChatPetKeyboardInteractionEnabled, isChatPetYapState, getChatPetRenderedState, getChatPetAnimationFrame, getTransientStateDuration, getChatPetClickInteraction, getChatPetBlinkDelay, getChatPetGazeDirection, getChatPetEyeAccessoryGazeOffset, getChatPetHorizontalPosition2, getChatPetDefaultHorizontalPosition, getChatPetRestoredHorizontalPosition, getChatPetRelativeHorizontalPosition, getChatPetHorizontalAnchor, getChatPetAnchoredHorizontalPosition, getChatPetScale2, getChatPetDragPosition, getChatPetThrowVelocity, getChatPetWallReboundVelocity, getChatPetThrowRotation, advanceChatPetThrow, shouldSettleChatPetThrow, getChatPetFallTarget, getChatPetThrowLanding, getChatPetFallDuration, getChatPetVerticalOffset, getChatPetPlatformTop, getChatPetPillPlatformTop, getChatPetStackPlatformTop, shouldPlaceChatPetSpeechBubbleLeft, getChatPetWideSpriteHorizontalOffset, setChatPetWideLayerOffset, CHAT_PET_OVERLAY_CLASS, CHAT_PET_IDLE_SLEEP_DELAY, CHAT_PET_CONFIRMATION_ATTENTION_DURATION, CHAT_PET_ACHIEVEMENT_UNLOCKED_DURATION, CHAT_PET_ICON_TRANSFORMATION_CHANCE, CHAT_PET_YAPPING_CHANCE, CHAT_PET_WALL_IMPACT_DURATION, CHAT_PET_WINDOW_OWNERSHIP_CHANNEL, TRANSIENT_STATE_DURATION, COMPLETE_STATE_DURATION, BUTTON_PRESS_STATE_DURATION, SPLAT_STATE_DURATION, LOVE_STATE_DURATION, COOL_STATE_DURATION, SING_STATE_DURATION, SPEECHLESS_STATE_DURATION, WORRY_STATE_DURATION, DIZZY_STATE_DURATION, WAKE_STATE_DURATION, DIZZY_DIRECTION_CHANGE_COUNT, DIZZY_DIRECTION_CHANGE_MAX_INTERVAL, RESPAWN_EFFECT_DURATION, RESPAWN_EFFECT_REDUCED_MOTION_DURATION, DRAG_THRESHOLD, HOP_DISTANCE, HOP_APEX_DELAY, HOP_REST_DELAY, HOP_HOLD_GRACE, HOP_IDLE_DEBOUNCE, BLINK_MIN_DELAY, BLINK_MAX_DELAY, POSITION_EPSILON, THROW_VELOCITY_SAMPLE_DURATION, THROW_RELEASE_GRACE_DURATION, THROW_MIN_VELOCITY, THROW_MAX_VELOCITY, THROW_KEYBOARD_HORIZONTAL_VELOCITY, THROW_KEYBOARD_UPWARD_VELOCITY, THROW_GRAVITY, THROW_MAX_FRAME_DURATION, THROW_MAX_DURATION, THROW_WALL_RESTITUTION, THROW_CEILING_RESTITUTION, THROW_ROTATION_PER_PIXEL, THROW_SELF_RIGHTING_START_VELOCITY, THROW_SELF_RIGHTING_SPEED, CHAT_PET_SOURCE_SIZE, CHAT_PET_SLEEP_SOURCE_WIDTH, CHAT_PET_TYPING_SOURCE_WIDTH, CHAT_PET_BUTTON_PRESS_SOURCE_WIDTH, CHAT_PET_SING_SOURCE_WIDTH, CHAT_PET_SING_SOURCE_HEIGHT, CHAT_PET_DIZZY_SOURCE_HEIGHT, CHAT_PET_MAX_VERTICAL_OFFSET, CHAT_PET_DEFAULT_RIGHT_INSET, CHAT_PET_MIN_SCALE, CHAT_PET_SCALE_STEP, CHAT_PET_SPEECH_BUBBLE_RIGHT_OVERHANG, CHAT_PET_SLEEP_RIGHT_OVERHANG, CHAT_PET_TYPING_RIGHT_OVERHANG, CHAT_PET_BUTTON_PRESS_RIGHT_OVERHANG, CHAT_PET_SING_RIGHT_OVERHANG, IDLE_FRAME_DURATIONS, SLEEP_FRAME_DURATIONS, WAKE_FRAME_DURATIONS, TYPING_FRAME_DURATIONS, BUTTON_PRESS_FRAME_DURATIONS, FALLING_FRAME_DURATIONS, JUMP_FRAME_DURATIONS, SPLAT_FRAME_DURATIONS, RESPAWN_FRAME_DURATIONS, SPEECH_FRAME_DURATIONS, CLAPPING_FRAME_DURATIONS, LOVE_FRAME_DURATIONS, COOL_FRAME_DURATIONS, SING_FRAME_DURATIONS, SPEECHLESS_FRAME_DURATIONS, WORRY_FRAME_DURATIONS, DIZZY_FRAME_DURATIONS, SEARCH_FRAME_DURATIONS, CHAT_PET_SING_FIXED_ORIENTATION_DECORATIONS, spriteSources, speechSpriteSources, respawnSpriteSources, ChatPetBlinkController, ChatPetFacingController, ChatPetDirectionChangeController, ChatPetHopController, ChatPetWidget };
