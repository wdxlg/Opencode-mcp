// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/encodedTokenAttributes.ts



// src/vs/editor/common/encodedTokenAttributes.ts
var TokenMetadata = class {
  static getLanguageId(metadata) {
    return (metadata & 255 /* LANGUAGEID_MASK */) >>> 0 /* LANGUAGEID_OFFSET */;
  }
  static getTokenType(metadata) {
    return (metadata & 768 /* TOKEN_TYPE_MASK */) >>> 8 /* TOKEN_TYPE_OFFSET */;
  }
  static containsBalancedBrackets(metadata) {
    return (metadata & 1024 /* BALANCED_BRACKETS_MASK */) !== 0;
  }
  static getFontStyle(metadata) {
    return (metadata & 30720 /* FONT_STYLE_MASK */) >>> 11 /* FONT_STYLE_OFFSET */;
  }
  static getForeground(metadata) {
    return (metadata & 16744448 /* FOREGROUND_MASK */) >>> 15 /* FOREGROUND_OFFSET */;
  }
  static getBackground(metadata) {
    return (metadata & 4278190080 /* BACKGROUND_MASK */) >>> 24 /* BACKGROUND_OFFSET */;
  }
  static getClassNameFromMetadata(metadata) {
    const foreground2 = this.getForeground(metadata);
    let className2 = "mtk" + foreground2;
    const fontStyle = this.getFontStyle(metadata);
    if (fontStyle & 1 /* Italic */) {
      className2 += " mtki";
    }
    if (fontStyle & 2 /* Bold */) {
      className2 += " mtkb";
    }
    if (fontStyle & 4 /* Underline */) {
      className2 += " mtku";
    }
    if (fontStyle & 8 /* Strikethrough */) {
      className2 += " mtks";
    }
    return className2;
  }
  static getInlineStyleFromMetadata(metadata, colorMap) {
    const foreground2 = this.getForeground(metadata);
    const fontStyle = this.getFontStyle(metadata);
    let result = `color: ${colorMap[foreground2]};`;
    if (fontStyle & 1 /* Italic */) {
      result += "font-style: italic;";
    }
    if (fontStyle & 2 /* Bold */) {
      result += "font-weight: bold;";
    }
    let textDecoration = "";
    if (fontStyle & 4 /* Underline */) {
      textDecoration += " underline";
    }
    if (fontStyle & 8 /* Strikethrough */) {
      textDecoration += " line-through";
    }
    if (textDecoration) {
      result += `text-decoration:${textDecoration};`;
    }
    return result;
  }
  static getPresentationFromMetadata(metadata) {
    const foreground2 = this.getForeground(metadata);
    const fontStyle = this.getFontStyle(metadata);
    return {
      foreground: foreground2,
      italic: Boolean(fontStyle & 1 /* Italic */),
      bold: Boolean(fontStyle & 2 /* Bold */),
      underline: Boolean(fontStyle & 4 /* Underline */),
      strikethrough: Boolean(fontStyle & 8 /* Strikethrough */)
    };
  }
};
export { TokenMetadata };
