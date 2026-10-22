// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/naturalLanguage/korean.ts



// src/vs/base/common/naturalLanguage/korean.ts
function getKoreanAltChars(code) {
  const result = disassembleKorean(code);
  if (result && result.length > 0) {
    return new Uint32Array(result);
  }
  return void 0;
}

var codeBufferLength = 0;

var codeBuffer = new Uint32Array(10);

function disassembleKorean(code) {
  codeBufferLength = 0;
  getCodesFromArray(code, modernConsonants, 4352 /* InitialConsonant */);
  if (codeBufferLength > 0) {
    return codeBuffer.subarray(0, codeBufferLength);
  }
  getCodesFromArray(code, modernVowels, 4449 /* Vowel */);
  if (codeBufferLength > 0) {
    return codeBuffer.subarray(0, codeBufferLength);
  }
  getCodesFromArray(code, modernFinalConsonants, 4520 /* FinalConsonant */);
  if (codeBufferLength > 0) {
    return codeBuffer.subarray(0, codeBufferLength);
  }
  getCodesFromArray(code, compatibilityJamo, 12593 /* CompatibilityJamo */);
  if (codeBufferLength) {
    return codeBuffer.subarray(0, codeBufferLength);
  }
  if (code >= 44032 && code <= 55203) {
    const hangulIndex = code - 44032;
    const vowelAndFinalConsonantProduct = hangulIndex % 588;
    const initialConsonantIndex = Math.floor(hangulIndex / 588);
    const vowelIndex = Math.floor(vowelAndFinalConsonantProduct / 28);
    const finalConsonantIndex = vowelAndFinalConsonantProduct % 28 - 1;
    if (initialConsonantIndex < modernConsonants.length) {
      getCodesFromArray(initialConsonantIndex, modernConsonants, 0);
    } else if (4352 /* InitialConsonant */ + initialConsonantIndex - 12593 /* CompatibilityJamo */ < compatibilityJamo.length) {
      getCodesFromArray(4352 /* InitialConsonant */ + initialConsonantIndex, compatibilityJamo, 12593 /* CompatibilityJamo */);
    }
    if (vowelIndex < modernVowels.length) {
      getCodesFromArray(vowelIndex, modernVowels, 0);
    } else if (4449 /* Vowel */ + vowelIndex - 12593 /* CompatibilityJamo */ < compatibilityJamo.length) {
      getCodesFromArray(4449 /* Vowel */ + vowelIndex - 12593 /* CompatibilityJamo */, compatibilityJamo, 12593 /* CompatibilityJamo */);
    }
    if (finalConsonantIndex >= 0) {
      if (finalConsonantIndex < modernFinalConsonants.length) {
        getCodesFromArray(finalConsonantIndex, modernFinalConsonants, 0);
      } else if (4520 /* FinalConsonant */ + finalConsonantIndex - 12593 /* CompatibilityJamo */ < compatibilityJamo.length) {
        getCodesFromArray(4520 /* FinalConsonant */ + finalConsonantIndex - 12593 /* CompatibilityJamo */, compatibilityJamo, 12593 /* CompatibilityJamo */);
      }
    }
    if (codeBufferLength > 0) {
      return codeBuffer.subarray(0, codeBufferLength);
    }
  }
  return void 0;
}

function getCodesFromArray(code, array3, arrayStartIndex) {
  if (code >= arrayStartIndex && code < arrayStartIndex + array3.length) {
    addCodesToBuffer(array3[code - arrayStartIndex]);
  }
}

function addCodesToBuffer(codes) {
  if (codes === 0 /* NUL */) {
    return;
  }
  codeBuffer[codeBufferLength++] = codes & 255;
  if (codes >> 8) {
    codeBuffer[codeBufferLength++] = codes >> 8 & 255;
  }
  if (codes >> 16) {
    codeBuffer[codeBufferLength++] = codes >> 16 & 255;
  }
}

var modernConsonants = new Uint8Array([
  114 /* r */,
  // ㄱ
  82 /* R */,
  // ㄲ
  115 /* s */,
  // ㄴ
  101 /* e */,
  // ㄷ
  69 /* E */,
  // ㄸ
  102 /* f */,
  // ㄹ
  97 /* a */,
  // ㅁ
  113 /* q */,
  // ㅂ
  81 /* Q */,
  // ㅃ
  116 /* t */,
  // ㅅ
  84 /* T */,
  // ㅆ
  100 /* d */,
  // ㅇ
  119 /* w */,
  // ㅈ
  87 /* W */,
  // ㅉ
  99 /* c */,
  // ㅊ
  122 /* z */,
  // ㅋ
  120 /* x */,
  // ㅌ
  118 /* v */,
  // ㅍ
  103 /* g */
  // ㅎ
]);

var modernVowels = new Uint16Array([
  107 /* k */,
  //  -> ㅏ
  111 /* o */,
  //  -> ㅐ
  105 /* i */,
  //  -> ㅑ
  79 /* O */,
  //  -> ㅒ
  106 /* j */,
  //  -> ㅓ
  112 /* p */,
  //  -> ㅔ
  117 /* u */,
  //  -> ㅕ
  80 /* P */,
  //  -> ㅖ
  104 /* h */,
  //  -> ㅗ
  27496 /* hk */,
  //  -> ㅘ
  28520 /* ho */,
  //  -> ㅙ
  27752 /* hl */,
  //  -> ㅚ
  121 /* y */,
  //  -> ㅛ
  110 /* n */,
  //  -> ㅜ
  27246 /* nj */,
  //  -> ㅝ
  28782 /* np */,
  //  -> ㅞ
  27758 /* nl */,
  //  -> ㅟ
  98 /* b */,
  //  -> ㅠ
  109 /* m */,
  //  -> ㅡ
  27757 /* ml */,
  //  -> ㅢ
  108 /* l */
  //  -> ㅣ
]);

var modernFinalConsonants = new Uint16Array([
  114 /* r */,
  // ㄱ
  82 /* R */,
  // ㄲ
  29810 /* rt */,
  // ㄳ
  115 /* s */,
  // ㄴ
  30579 /* sw */,
  // ㄵ
  26483 /* sg */,
  // ㄶ
  101 /* e */,
  // ㄷ
  102 /* f */,
  // ㄹ
  29286 /* fr */,
  // ㄺ
  24934 /* fa */,
  // ㄻ
  29030 /* fq */,
  // ㄼ
  29798 /* ft */,
  // ㄽ
  30822 /* fx */,
  // ㄾ
  30310 /* fv */,
  // ㄿ
  26470 /* fg */,
  // ㅀ
  97 /* a */,
  // ㅁ
  113 /* q */,
  // ㅂ
  29809 /* qt */,
  // ㅄ
  116 /* t */,
  // ㅅ
  84 /* T */,
  // ㅆ
  100 /* d */,
  // ㅇ
  119 /* w */,
  // ㅈ
  99 /* c */,
  // ㅊ
  122 /* z */,
  // ㅋ
  120 /* x */,
  // ㅌ
  118 /* v */,
  // ㅍ
  103 /* g */
  // ㅎ
]);

var compatibilityJamo = new Uint16Array([
  114 /* r */,
  // ㄱ
  82 /* R */,
  // ㄲ
  29810 /* rt */,
  // ㄳ
  115 /* s */,
  // ㄴ
  30579 /* sw */,
  // ㄵ
  26483 /* sg */,
  // ㄶ
  101 /* e */,
  // ㄷ
  69 /* E */,
  // ㄸ
  102 /* f */,
  // ㄹ
  29286 /* fr */,
  // ㄺ
  24934 /* fa */,
  // ㄻ
  29030 /* fq */,
  // ㄼ
  29798 /* ft */,
  // ㄽ
  30822 /* fx */,
  // ㄾ
  30310 /* fv */,
  // ㄿ
  26470 /* fg */,
  // ㅀ
  97 /* a */,
  // ㅁ
  113 /* q */,
  // ㅂ
  81 /* Q */,
  // ㅃ
  29809 /* qt */,
  // ㅄ
  116 /* t */,
  // ㅅ
  84 /* T */,
  // ㅆ
  100 /* d */,
  // ㅇ
  119 /* w */,
  // ㅈ
  87 /* W */,
  // ㅉ
  99 /* c */,
  // ㅊ
  122 /* z */,
  // ㅋ
  120 /* x */,
  // ㅌ
  118 /* v */,
  // ㅍ
  103 /* g */,
  // ㅎ
  107 /* k */,
  // ㅏ
  111 /* o */,
  // ㅐ
  105 /* i */,
  // ㅑ
  79 /* O */,
  // ㅒ
  106 /* j */,
  // ㅓ
  112 /* p */,
  // ㅔ
  117 /* u */,
  // ㅕ
  80 /* P */,
  // ㅖ
  104 /* h */,
  // ㅗ
  27496 /* hk */,
  // ㅘ
  28520 /* ho */,
  // ㅙ
  27752 /* hl */,
  // ㅚ
  121 /* y */,
  // ㅛ
  110 /* n */,
  // ㅜ
  27246 /* nj */,
  // ㅝ
  28782 /* np */,
  // ㅞ
  27758 /* nl */,
  // ㅟ
  98 /* b */,
  // ㅠ
  109 /* m */,
  // ㅡ
  27757 /* ml */,
  // ㅢ
  108 /* l */
  // ㅣ
  // HF: Hangul Filler (everything after this is archaic)
  // ㅥ
  // ㅦ
  // ㅧ
  // ㅨ
  // ㅩ
  // ㅪ
  // ㅫ
  // ㅬ
  // ㅮ
  // ㅯ
  // ㅰ
  // ㅱ
  // ㅲ
  // ㅳ
  // ㅴ
  // ㅵ
  // ㅶ
  // ㅷ
  // ㅸ
  // ㅹ
  // ㅺ
  // ㅻ
  // ㅼ
  // ㅽ
  // ㅾ
  // ㅿ
  // ㆀ
  // ㆁ
  // ㆂ
  // ㆃ
  // ㆄ
  // ㆅ
  // ㆆ
  // ㆇ
  // ㆈ
  // ㆉ
  // ㆊ
  // ㆋ
  // ㆌ
  // ㆍ
  // ㆎ
]);
export { getKoreanAltChars, disassembleKorean, getCodesFromArray, addCodesToBuffer, codeBufferLength, codeBuffer, modernConsonants, modernVowels, modernFinalConsonants, compatibilityJamo };
