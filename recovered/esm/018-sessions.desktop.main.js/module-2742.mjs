// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPetAchievementPreview.ts
import { DisposableStore } from "./module-0012.mjs";
import { addDisposableListener, getWindow } from "./module-0075.mjs";
import { drawChatPetAccessory, drawChatPetComposite, getChatPetAccessoryImageSource, hasChatPetAccessoryImageDimensions, hasChatPetBodyImageDimensions } from "./module-2144.mjs";
import { FileAccess } from "./module-0033.mjs";
import { foreground } from "./module-0227.mjs";


// src/vs/workbench/contrib/chat/browser/chatPetAchievementPreview.ts
var CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE = 96;

function renderChatPetAchievementPreview(canvas, accessory, unlocked, variant, themeService, logService) {
  const store = new DisposableStore();
  const targetWindow = getWindow(canvas);
  const bodyImage = targetWindow.document.createElement("img");
  const accessoryImage = accessory ? targetWindow.document.createElement("img") : void 0;
  const accessorySource = accessory ? getChatPetAccessoryImageSource(accessory) : void 0;
  const bodySource = FileAccess.asBrowserUri(`vs/workbench/contrib/chat/browser/widget/media/chatPet/buddy-idle-${variant}-96.png`).toString(true);
  let bodyLoaded = !unlocked;
  let accessoryLoaded = accessory === void 0;
  const draw = () => {
    if (!bodyLoaded || !accessoryLoaded) {
      return;
    }
    const context2 = canvas.getContext("2d");
    if (!context2) {
      return;
    }
    context2.imageSmoothingEnabled = false;
    if (unlocked) {
      drawChatPetComposite(
        context2,
        bodyImage,
        accessoryImage,
        0,
        0,
        CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE,
        CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE,
        "right",
        "idle",
        void 0,
        true,
        accessory?.eyeAccessoryMirrorsWithFacing !== false,
        accessory?.coversAntennae === true
      );
      return;
    }
    context2.clearRect(0, 0, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE);
    if (!accessoryImage) {
      return;
    }
    drawChatPetAccessory(context2, accessoryImage, "idle", 0, "right");
    context2.globalCompositeOperation = "source-in";
    const silhouetteColor = themeService.getColorTheme().getColor(foreground);
    if (!silhouetteColor) {
      context2.clearRect(0, 0, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE);
      context2.globalCompositeOperation = "source-over";
      return;
    }
    context2.fillStyle = silhouetteColor.toString();
    context2.fillRect(0, 0, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE);
    context2.globalCompositeOperation = "source-over";
  };
  if (unlocked) {
    store.add(addDisposableListener(bodyImage, "load", () => {
      if (!hasChatPetBodyImageDimensions(bodyImage, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE, 1)) {
        logService.error(`[ChatPetAchievementPreview] Invalid preview body dimensions: ${bodySource}`);
        return;
      }
      bodyLoaded = true;
      draw();
    }));
    store.add(addDisposableListener(bodyImage, "error", () => {
      logService.error(`[ChatPetAchievementPreview] Failed to load preview body: ${bodySource}`);
    }));
    bodyImage.src = bodySource;
  }
  if (accessoryImage && accessorySource) {
    store.add(addDisposableListener(accessoryImage, "load", () => {
      if (!hasChatPetAccessoryImageDimensions(accessoryImage, accessorySource)) {
        logService.error(`[ChatPetAchievementPreview] Invalid preview accessory dimensions: ${accessorySource.url}`);
        return;
      }
      accessoryLoaded = true;
      draw();
    }));
    store.add(addDisposableListener(accessoryImage, "error", () => {
      logService.error(`[ChatPetAchievementPreview] Failed to load preview accessory: ${accessorySource.url}`);
    }));
    accessoryImage.src = accessorySource.url;
  }
  return store;
}
export { renderChatPetAchievementPreview, CHAT_PET_ACHIEVEMENT_PREVIEW_SIZE };
