// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatPetAccessoryRenderer.ts
import { FileAccess } from "./module-0033.mjs";
import { getChatPetAccessoryRigFrame, getChatPetAntennaeOcclusionBounds, getChatPetEyeAccessoryAnchor } from "./module-2143.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatPetAccessoryRenderer.ts
var CHAT_PET_ACCESSORY_ATLAS_CELL_SIZE = 64;

var CHAT_PET_WIDE_ACCESSORY_ATLAS_CELL_SIZE = 96;

var CHAT_PET_ACCESSORY_ATLAS_WIDTH = CHAT_PET_ACCESSORY_ATLAS_CELL_SIZE * 4;

var CHAT_PET_ACCESSORY_ATLAS_HEIGHT = CHAT_PET_ACCESSORY_ATLAS_CELL_SIZE * 3;

function getChatPetAccessoryImageSource(accessory) {
  const cellSize = accessory.atlasCellSize ?? CHAT_PET_ACCESSORY_ATLAS_CELL_SIZE;
  return {
    url: FileAccess.asBrowserUri(`vs/workbench/contrib/chat/browser/widget/media/chatPet/accessories/${accessory.atlasName}.png`).toString(true),
    cellSize,
    width: cellSize * 4,
    height: cellSize * 3
  };
}

function hasChatPetBodyImageDimensions(image, frameWidth, frameHeight, frameCount) {
  return image.naturalWidth === frameWidth * frameCount && image.naturalHeight === frameHeight;
}

function hasChatPetAccessoryImageDimensions(image, source) {
  return image.naturalWidth === source.width && image.naturalHeight === source.height;
}

function drawChatPetComposite(context2, bodyImage, accessoryImage, bodyFrameIndex, rigFrameIndex, frameWidth, frameHeight, facingDirection, state, fixedOrientationDecorations, includeEyeAccessory = true, eyeAccessoryMirrorsWithFacing = true, coversAntennae = false) {
  context2.clearRect(0, 0, frameWidth, frameHeight);
  const sourceX = bodyFrameIndex * frameWidth;
  const rigFrame = getChatPetAccessoryRigFrame(state, rigFrameIndex);
  if (fixedOrientationDecorations !== void 0 && facingDirection === "left") {
    drawMirroredChatPetLayer(context2, bodyImage, sourceX, 0, frameWidth, frameHeight);
    drawFixedOrientationDecorations(context2, bodyImage, bodyFrameIndex, frameWidth, fixedOrientationDecorations);
    if (accessoryImage) {
      if (coversAntennae) {
        clearChatPetAntennae(context2, state, rigFrameIndex, frameWidth, true);
      }
      context2.save();
      context2.globalCompositeOperation = "destination-over";
      drawMirroredAccessoryLayer(context2, accessoryImage, rigFrame, "back", frameWidth);
      context2.restore();
      drawMirroredAccessoryLayer(context2, accessoryImage, rigFrame, "front", frameWidth);
      if (includeEyeAccessory) {
        if (eyeAccessoryMirrorsWithFacing) {
          drawMirroredEyeAccessory(context2, accessoryImage, rigFrame, frameWidth);
        } else {
          drawEyeAccessory(context2, accessoryImage, rigFrame, getChatPetEyeAccessoryAnchor(state, rigFrameIndex, "left", false, frameWidth));
        }
      }
    }
    return;
  }
  if (accessoryImage) {
    drawTrackedAccessoryLayer(context2, accessoryImage, rigFrame, "back", frameWidth);
  }
  context2.drawImage(bodyImage, sourceX, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
  if (accessoryImage) {
    if (coversAntennae) {
      clearChatPetAntennae(context2, state, rigFrameIndex, frameWidth, false);
      context2.save();
      context2.globalCompositeOperation = "destination-over";
      drawTrackedAccessoryLayer(context2, accessoryImage, rigFrame, "back", frameWidth);
      context2.restore();
    }
    drawTrackedAccessoryLayer(context2, accessoryImage, rigFrame, "front", frameWidth);
    if (includeEyeAccessory) {
      drawEyeAccessory(context2, accessoryImage, rigFrame);
    }
  }
}

function drawChatPetAccessory(context2, accessoryImage, state, frameIndex, facingDirection) {
  const rigFrame = getChatPetAccessoryRigFrame(state, frameIndex);
  const mirrorsHeadAccessory = facingDirection === "left" !== !!rigFrame.mirrorsHeadAccessory;
  if (mirrorsHeadAccessory) {
    drawMirroredAccessoryLayer(context2, accessoryImage, rigFrame, "back", context2.canvas.width);
    drawMirroredAccessoryLayer(context2, accessoryImage, rigFrame, "front", context2.canvas.width);
    drawMirroredEyeAccessory(context2, accessoryImage, rigFrame, context2.canvas.width);
    return;
  }
  drawAccessoryLayer(context2, accessoryImage, rigFrame, "back");
  drawAccessoryLayer(context2, accessoryImage, rigFrame, "front");
  drawEyeAccessory(context2, accessoryImage, rigFrame);
}

function drawChatPetEyeAccessory(context2, accessoryImage, state, frameIndex, facingDirection, mirrorsWithFacing = true, gazeOffset) {
  context2.clearRect(0, 0, context2.canvas.width, context2.canvas.height);
  const rigFrame = getChatPetAccessoryRigFrame(state, frameIndex);
  if (facingDirection === "left" && mirrorsWithFacing) {
    drawMirroredEyeAccessory(context2, accessoryImage, rigFrame, context2.canvas.width);
    return;
  }
  const anchor = getChatPetEyeAccessoryAnchor(state, frameIndex, facingDirection, mirrorsWithFacing, context2.canvas.width);
  drawEyeAccessory(context2, accessoryImage, rigFrame, anchor && gazeOffset ? {
    x: anchor.x + gazeOffset[0],
    y: anchor.y + gazeOffset[1]
  } : anchor);
}

function drawMirroredChatPetLayer(context2, image, sourceX, sourceY, frameWidth, frameHeight) {
  context2.save();
  context2.translate(frameWidth, 0);
  context2.scale(-1, 1);
  context2.drawImage(image, sourceX, sourceY, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
  context2.restore();
}

function clearChatPetAntennae(context2, state, frameIndex, frameWidth, mirrored) {
  const bounds = getChatPetAntennaeOcclusionBounds(state, frameIndex);
  if (!bounds) {
    return;
  }
  const x = mirrored ? frameWidth - bounds.x - bounds.width : bounds.x;
  context2.clearRect(x, bounds.y, bounds.width, bounds.height);
}

function drawFixedOrientationDecorations(context2, bodyImage, frameIndex, frameWidth, decorations) {
  for (const decoration3 of decorations) {
    const currentBounds = decoration3.frameBounds[frameIndex];
    const canonicalBounds = decoration3.frameBounds[decoration3.sourceFrame];
    const [currentLeft, currentTop, currentRight, currentBottom] = currentBounds;
    const [canonicalLeft, canonicalTop, canonicalRight, canonicalBottom] = canonicalBounds;
    const canonicalWidth = canonicalRight - canonicalLeft;
    const canonicalHeight = canonicalBottom - canonicalTop;
    context2.clearRect(frameWidth - currentRight, currentTop, currentRight - currentLeft, currentBottom - currentTop);
    context2.drawImage(
      bodyImage,
      decoration3.sourceFrame * frameWidth + canonicalLeft,
      canonicalTop,
      canonicalWidth,
      canonicalHeight,
      frameWidth - currentLeft - canonicalWidth,
      currentTop,
      canonicalWidth,
      canonicalHeight
    );
  }
}

var rigPoseColumn = {
  upright: 0,
  sleeping: 1,
  airborne: 0,
  impact: 2,
  splat: 3
};

var compactHeadPivot = {
  upright: [32, 48],
  sleeping: [32, 48],
  airborne: [32, 48],
  impact: [32, 32],
  splat: [32, 48]
};

var wideHeadPivot = {
  upright: [48, 40],
  sleeping: [48, 40],
  airborne: [48, 40],
  impact: [48, 40],
  splat: [48, 80]
};

function getAtlasCellSize(atlasImage) {
  return atlasImage.naturalWidth / 4;
}

function drawAccessoryLayer(context2, atlasImage, rigFrame, layer) {
  const cellSize = getAtlasCellSize(atlasImage);
  const sourceX = rigPoseColumn[rigFrame.pose] * cellSize;
  if (rigFrame.head) {
    const headSourceY = (layer === "back" ? 0 : 1) * cellSize;
    const [headPivotX, headPivotY] = cellSize === CHAT_PET_WIDE_ACCESSORY_ATLAS_CELL_SIZE ? wideHeadPivot[rigFrame.pose] : compactHeadPivot[rigFrame.pose];
    context2.drawImage(
      atlasImage,
      sourceX,
      headSourceY,
      cellSize,
      cellSize,
      rigFrame.head.x - headPivotX,
      rigFrame.head.y - headPivotY,
      cellSize,
      cellSize
    );
  }
}

function drawTrackedAccessoryLayer(context2, atlasImage, rigFrame, layer, frameWidth) {
  if (rigFrame.mirrorsHeadAccessory) {
    drawMirroredAccessoryLayer(context2, atlasImage, rigFrame, layer, frameWidth);
  } else {
    drawAccessoryLayer(context2, atlasImage, rigFrame, layer);
  }
}

function drawMirroredAccessoryLayer(context2, atlasImage, rigFrame, layer, frameWidth) {
  context2.save();
  context2.translate(frameWidth, 0);
  context2.scale(-1, 1);
  drawAccessoryLayer(context2, atlasImage, rigFrame, layer);
  context2.restore();
}

function drawEyeAccessory(context2, atlasImage, rigFrame, eyeAnchor = rigFrame.rightEye) {
  if (!eyeAnchor) {
    return;
  }
  const cellSize = getAtlasCellSize(atlasImage);
  const sourceX = rigPoseColumn[rigFrame.pose] * cellSize;
  context2.drawImage(
    atlasImage,
    sourceX,
    2 * cellSize,
    cellSize,
    cellSize,
    eyeAnchor.x,
    eyeAnchor.y,
    cellSize,
    cellSize
  );
}

function drawMirroredEyeAccessory(context2, atlasImage, rigFrame, frameWidth) {
  context2.save();
  context2.translate(frameWidth, 0);
  context2.scale(-1, 1);
  drawEyeAccessory(context2, atlasImage, rigFrame);
  context2.restore();
}
export { getChatPetAccessoryImageSource, hasChatPetBodyImageDimensions, hasChatPetAccessoryImageDimensions, drawChatPetComposite, drawChatPetAccessory, drawChatPetEyeAccessory, drawMirroredChatPetLayer, clearChatPetAntennae, drawFixedOrientationDecorations, getAtlasCellSize, drawAccessoryLayer, drawTrackedAccessoryLayer, drawMirroredAccessoryLayer, drawEyeAccessory, drawMirroredEyeAccessory, CHAT_PET_ACCESSORY_ATLAS_CELL_SIZE, CHAT_PET_WIDE_ACCESSORY_ATLAS_CELL_SIZE, CHAT_PET_ACCESSORY_ATLAS_WIDTH, CHAT_PET_ACCESSORY_ATLAS_HEIGHT, rigPoseColumn, compactHeadPivot, wideHeadPivot };
