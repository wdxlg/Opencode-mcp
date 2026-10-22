// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/folding/browser/foldingDecorations.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { editorSelectionBackground } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { iconForeground } from "./module-0227.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/editor/contrib/folding/browser/foldingDecorations.ts
var foldBackground = registerColor("editor.foldBackground", { light: transparent(editorSelectionBackground, 0.3), dark: transparent(editorSelectionBackground, 0.3), hcDark: null, hcLight: null }, localize(1183, null), true);

registerColor("editor.foldPlaceholderForeground", { light: "#808080", dark: "#808080", hcDark: null, hcLight: null }, localize(1181, null));

registerColor("editorGutter.foldingControlForeground", iconForeground, localize(1182, null));

var foldingExpandedIcon = registerIcon("folding-expanded", Codicon.chevronDown, localize(1185, null));

var foldingCollapsedIcon = registerIcon("folding-collapsed", Codicon.chevronRight, localize(1184, null));

var foldingManualCollapsedIcon = registerIcon("folding-manual-collapsed", foldingCollapsedIcon, localize(1186, null));

var foldingManualExpandedIcon = registerIcon("folding-manual-expanded", foldingExpandedIcon, localize(1187, null));

var foldedBackgroundMinimap = { color: themeColorFromId2(foldBackground), position: 1 /* Inline */ };

var collapsed = localize(1188, null);

var expanded = localize(1189, null);

var FoldingDecorationProvider = class _FoldingDecorationProvider {
  constructor(editor) {
    this.editor = editor;
    this.showFoldingControls = "mouseover";
    this.showFoldingHighlights = true;
  }
  static {
    this.COLLAPSED_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-collapsed-visual-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      afterContentClassName: "inline-folded",
      isWholeLine: true,
      linesDecorationsTooltip: collapsed,
      firstLineDecorationClassName: ThemeIcon.asClassName(foldingCollapsedIcon)
    });
  }
  static {
    this.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-collapsed-highlighted-visual-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      afterContentClassName: "inline-folded",
      className: "folded-background",
      minimap: foldedBackgroundMinimap,
      isWholeLine: true,
      linesDecorationsTooltip: collapsed,
      firstLineDecorationClassName: ThemeIcon.asClassName(foldingCollapsedIcon)
    });
  }
  static {
    this.MANUALLY_COLLAPSED_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-manually-collapsed-visual-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      afterContentClassName: "inline-folded",
      isWholeLine: true,
      linesDecorationsTooltip: collapsed,
      firstLineDecorationClassName: ThemeIcon.asClassName(foldingManualCollapsedIcon)
    });
  }
  static {
    this.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-manually-collapsed-highlighted-visual-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      afterContentClassName: "inline-folded",
      className: "folded-background",
      minimap: foldedBackgroundMinimap,
      isWholeLine: true,
      linesDecorationsTooltip: collapsed,
      firstLineDecorationClassName: ThemeIcon.asClassName(foldingManualCollapsedIcon)
    });
  }
  static {
    this.NO_CONTROLS_COLLAPSED_RANGE_DECORATION = ModelDecorationOptions.register({
      description: "folding-no-controls-range-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      afterContentClassName: "inline-folded",
      isWholeLine: true,
      linesDecorationsTooltip: collapsed
    });
  }
  static {
    this.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION = ModelDecorationOptions.register({
      description: "folding-no-controls-range-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      afterContentClassName: "inline-folded",
      className: "folded-background",
      minimap: foldedBackgroundMinimap,
      isWholeLine: true,
      linesDecorationsTooltip: collapsed
    });
  }
  static {
    this.EXPANDED_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-expanded-visual-decoration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      isWholeLine: true,
      firstLineDecorationClassName: "alwaysShowFoldIcons " + ThemeIcon.asClassName(foldingExpandedIcon),
      linesDecorationsTooltip: expanded
    });
  }
  static {
    this.EXPANDED_AUTO_HIDE_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-expanded-auto-hide-visual-decoration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      isWholeLine: true,
      firstLineDecorationClassName: ThemeIcon.asClassName(foldingExpandedIcon),
      linesDecorationsTooltip: expanded
    });
  }
  static {
    this.MANUALLY_EXPANDED_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-manually-expanded-visual-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      isWholeLine: true,
      firstLineDecorationClassName: "alwaysShowFoldIcons " + ThemeIcon.asClassName(foldingManualExpandedIcon),
      linesDecorationsTooltip: expanded
    });
  }
  static {
    this.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION = ModelDecorationOptions.register({
      description: "folding-manually-expanded-auto-hide-visual-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      isWholeLine: true,
      firstLineDecorationClassName: ThemeIcon.asClassName(foldingManualExpandedIcon),
      linesDecorationsTooltip: expanded
    });
  }
  static {
    this.NO_CONTROLS_EXPANDED_RANGE_DECORATION = ModelDecorationOptions.register({
      description: "folding-no-controls-range-decoration",
      stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
      isWholeLine: true
    });
  }
  static {
    this.HIDDEN_RANGE_DECORATION = ModelDecorationOptions.register({
      description: "folding-hidden-range-decoration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
  }
  getDecorationOption(isCollapsed, isHidden, isManual) {
    if (isHidden) {
      return _FoldingDecorationProvider.HIDDEN_RANGE_DECORATION;
    }
    if (this.showFoldingControls === "never") {
      if (isCollapsed) {
        return this.showFoldingHighlights ? _FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_HIGHLIGHTED_RANGE_DECORATION : _FoldingDecorationProvider.NO_CONTROLS_COLLAPSED_RANGE_DECORATION;
      }
      return _FoldingDecorationProvider.NO_CONTROLS_EXPANDED_RANGE_DECORATION;
    }
    if (isCollapsed) {
      return isManual ? this.showFoldingHighlights ? _FoldingDecorationProvider.MANUALLY_COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : _FoldingDecorationProvider.MANUALLY_COLLAPSED_VISUAL_DECORATION : this.showFoldingHighlights ? _FoldingDecorationProvider.COLLAPSED_HIGHLIGHTED_VISUAL_DECORATION : _FoldingDecorationProvider.COLLAPSED_VISUAL_DECORATION;
    } else if (this.showFoldingControls === "mouseover") {
      return isManual ? _FoldingDecorationProvider.MANUALLY_EXPANDED_AUTO_HIDE_VISUAL_DECORATION : _FoldingDecorationProvider.EXPANDED_AUTO_HIDE_VISUAL_DECORATION;
    } else {
      return isManual ? _FoldingDecorationProvider.MANUALLY_EXPANDED_VISUAL_DECORATION : _FoldingDecorationProvider.EXPANDED_VISUAL_DECORATION;
    }
  }
  changeDecorations(callback) {
    return this.editor.changeDecorations(callback);
  }
  removeDecorations(decorationIds) {
    this.editor.removeDecorations(decorationIds);
  }
};
export { foldBackground, foldingExpandedIcon, foldingCollapsedIcon, foldingManualCollapsedIcon, foldingManualExpandedIcon, foldedBackgroundMinimap, collapsed, expanded, FoldingDecorationProvider };
