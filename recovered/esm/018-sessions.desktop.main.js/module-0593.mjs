// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/search.ts
import { containsUppercaseCharacter } from "./module-0030.mjs";


// src/vs/base/common/search.ts
function buildReplaceStringWithCasePreserved(matches2, pattern) {
  if (matches2 && matches2[0] !== "") {
    const containsHyphens = validateSpecificSpecialCharacter(matches2, pattern, "-");
    const containsUnderscores = validateSpecificSpecialCharacter(matches2, pattern, "_");
    if (containsHyphens && !containsUnderscores) {
      return buildReplaceStringForSpecificSpecialCharacter(matches2, pattern, "-");
    } else if (!containsHyphens && containsUnderscores) {
      return buildReplaceStringForSpecificSpecialCharacter(matches2, pattern, "_");
    }
    if (matches2[0].toUpperCase() === matches2[0]) {
      return pattern.toUpperCase();
    } else if (matches2[0].toLowerCase() === matches2[0]) {
      return pattern.toLowerCase();
    } else if (containsUppercaseCharacter(matches2[0][0]) && pattern.length > 0) {
      return pattern[0].toUpperCase() + pattern.substr(1);
    } else if (matches2[0][0].toUpperCase() !== matches2[0][0] && pattern.length > 0) {
      return pattern[0].toLowerCase() + pattern.substr(1);
    } else {
      return pattern;
    }
  } else {
    return pattern;
  }
}

function validateSpecificSpecialCharacter(matches2, pattern, specialCharacter) {
  const doesContainSpecialCharacter = matches2[0].indexOf(specialCharacter) !== -1 && pattern.indexOf(specialCharacter) !== -1;
  return doesContainSpecialCharacter && matches2[0].split(specialCharacter).length === pattern.split(specialCharacter).length;
}

function buildReplaceStringForSpecificSpecialCharacter(matches2, pattern, specialCharacter) {
  const splitPatternAtSpecialCharacter = pattern.split(specialCharacter);
  const splitMatchAtSpecialCharacter = matches2[0].split(specialCharacter);
  let replaceString = "";
  splitPatternAtSpecialCharacter.forEach((splitValue, index2) => {
    replaceString += buildReplaceStringWithCasePreserved([splitMatchAtSpecialCharacter[index2]], splitValue) + specialCharacter;
  });
  return replaceString.slice(0, -1);
}
export { buildReplaceStringWithCasePreserved, validateSpecificSpecialCharacter, buildReplaceStringForSpecificSpecialCharacter };
