// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gpu/browser/gpuActions.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILogService } from "./module-0095.mjs";
import { ViewGpuContext } from "./module-0344.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { GlyphRasterizer } from "./module-0330.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { ensureNonNullable } from "./module-0329.mjs";


// src/vs/editor/contrib/gpu/browser/gpuActions.ts
var DebugEditorGpuRendererAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.debugEditorGpuRenderer",
      label: localize2(1274, "Developer: Debug Editor GPU Renderer"),
      // TODO: Why doesn't `ContextKeyExpr.equals('config:editor.experimentalGpuAcceleration', 'on')` work?
      precondition: ContextKeyExpr.true()
    });
  }
  async run(accessor, editor) {
    const instantiationService = accessor.get(IInstantiationService);
    const quickInputService = accessor.get(IQuickInputService);
    const choice = await quickInputService.pick([
      {
        label: localize(1275, null),
        id: "logTextureAtlasStats"
      },
      {
        label: localize(1276, null),
        id: "saveTextureAtlas"
      },
      {
        label: localize(1273, null),
        id: "drawGlyph"
      }
    ], { canPickMany: false });
    if (!choice) {
      return;
    }
    switch (choice.id) {
      case "logTextureAtlasStats":
        instantiationService.invokeFunction((accessor2) => {
          const logService = accessor2.get(ILogService);
          const atlas = ViewGpuContext.atlas;
          if (!ViewGpuContext.atlas) {
            logService.error("No texture atlas found");
            return;
          }
          const stats = atlas.getStats();
          logService.info(["Texture atlas stats", ...stats].join("\n\n"));
        });
        break;
      case "saveTextureAtlas":
        instantiationService.invokeFunction(async (accessor2) => {
          const workspaceContextService = accessor2.get(IWorkspaceContextService);
          const fileService = accessor2.get(IFileService);
          const folders = workspaceContextService.getWorkspace().folders;
          if (folders.length > 0) {
            const atlas = ViewGpuContext.atlas;
            const promises = [];
            for (const [layerIndex, page] of atlas.pages.entries()) {
              promises.push(...[
                fileService.writeFile(
                  URI.joinPath(folders[0].uri, `textureAtlasPage${layerIndex}_actual.png`),
                  VSBuffer.wrap(new Uint8Array(await (await page.source.convertToBlob()).arrayBuffer()))
                ),
                fileService.writeFile(
                  URI.joinPath(folders[0].uri, `textureAtlasPage${layerIndex}_usage.png`),
                  VSBuffer.wrap(new Uint8Array(await (await page.getUsagePreview()).arrayBuffer()))
                )
              ]);
            }
            await Promise.all(promises);
          }
        });
        break;
      case "drawGlyph":
        instantiationService.invokeFunction(async (accessor2) => {
          const configurationService = accessor2.get(IConfigurationService);
          const fileService = accessor2.get(IFileService);
          const quickInputService2 = accessor2.get(IQuickInputService);
          const workspaceContextService = accessor2.get(IWorkspaceContextService);
          const folders = workspaceContextService.getWorkspace().folders;
          if (folders.length === 0) {
            return;
          }
          const atlas = ViewGpuContext.atlas;
          const fontFamily = configurationService.getValue("editor.fontFamily");
          const fontSize = configurationService.getValue("editor.fontSize");
          const rasterizer = new GlyphRasterizer(fontSize, fontFamily, getActiveWindow().devicePixelRatio, ViewGpuContext.decorationStyleCache);
          let chars = await quickInputService2.input({
            prompt: "Enter a character to draw (prefix with 0x for code point))"
          });
          if (!chars) {
            return;
          }
          const codePoint = chars.match(/0x(?<codePoint>[0-9a-f]+)/i)?.groups?.codePoint;
          if (codePoint !== void 0) {
            chars = String.fromCodePoint(parseInt(codePoint, 16));
          }
          const tokenMetadata = 0;
          const charMetadata = 0;
          const rasterizedGlyph = atlas.getGlyph(rasterizer, chars, tokenMetadata, charMetadata, 0);
          if (!rasterizedGlyph) {
            return;
          }
          const imageData = atlas.pages[rasterizedGlyph.pageIndex].source.getContext("2d")?.getImageData(
            rasterizedGlyph.x,
            rasterizedGlyph.y,
            rasterizedGlyph.w,
            rasterizedGlyph.h
          );
          if (!imageData) {
            return;
          }
          const canvas = new OffscreenCanvas(imageData.width, imageData.height);
          const ctx = ensureNonNullable(canvas.getContext("2d"));
          ctx.putImageData(imageData, 0, 0);
          const blob = await canvas.convertToBlob({ type: "image/png" });
          const resource = URI.joinPath(folders[0].uri, `glyph_${chars}_${tokenMetadata}_${fontSize}px_${fontFamily.replaceAll(/[,\\\/\.'\s]/g, "_")}.png`);
          await fileService.writeFile(resource, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
        });
        break;
    }
  }
};

registerEditorAction(DebugEditorGpuRendererAction);
export { DebugEditorGpuRendererAction };
