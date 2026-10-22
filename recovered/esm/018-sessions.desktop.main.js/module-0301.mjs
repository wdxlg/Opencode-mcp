// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/viewLines/viewLineOptions.ts



// src/vs/editor/browser/viewParts/viewLines/viewLineOptions.ts
var ViewLineOptions = class {
  constructor(config, themeType) {
    this.themeType = themeType;
    const options3 = config.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    this.renderWhitespace = options3.get(113 /* renderWhitespace */);
    this.experimentalWhitespaceRendering = options3.get(47 /* experimentalWhitespaceRendering */);
    this.renderControlCharacters = options3.get(108 /* renderControlCharacters */);
    this.spaceWidth = fontInfo.spaceWidth;
    this.middotWidth = fontInfo.middotWidth;
    this.wsmiddotWidth = fontInfo.wsmiddotWidth;
    this.useMonospaceOptimizations = fontInfo.isMonospace && !options3.get(40 /* disableMonospaceOptimizations */);
    this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
    this.lineHeight = options3.get(75 /* lineHeight */);
    this.stopRenderingLineAfter = options3.get(133 /* stopRenderingLineAfter */);
    this.fontLigatures = options3.get(60 /* fontLigatures */);
    this.verticalScrollbarSize = options3.get(117 /* scrollbar */).verticalScrollbarSize;
    this.useGpu = options3.get(46 /* experimentalGpuAcceleration */) === "on";
  }
  equals(other) {
    return this.themeType === other.themeType && this.renderWhitespace === other.renderWhitespace && this.experimentalWhitespaceRendering === other.experimentalWhitespaceRendering && this.renderControlCharacters === other.renderControlCharacters && this.spaceWidth === other.spaceWidth && this.middotWidth === other.middotWidth && this.wsmiddotWidth === other.wsmiddotWidth && this.useMonospaceOptimizations === other.useMonospaceOptimizations && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.lineHeight === other.lineHeight && this.stopRenderingLineAfter === other.stopRenderingLineAfter && this.fontLigatures === other.fontLigatures && this.verticalScrollbarSize === other.verticalScrollbarSize && this.useGpu === other.useGpu;
  }
};
export { ViewLineOptions };
