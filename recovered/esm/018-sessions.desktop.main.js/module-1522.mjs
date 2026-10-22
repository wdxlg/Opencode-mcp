// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/fuzzyScorer.ts
import { createMatches, fuzzyScore, isUpper, matchesPrefix } from "./module-0453.mjs";
import { hash } from "./module-0039.mjs";
import { isLinux, isWindows } from "./module-0014.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { sep } from "./module-0026.mjs";
import { compareAnything } from "./module-1521.mjs";


// src/vs/base/common/fuzzyScorer.ts
var NO_MATCH = 0;

var NO_SCORE = [NO_MATCH, []];

function scoreFuzzy(target, query, queryLower, allowNonContiguousMatches) {
  if (!target || !query) {
    return NO_SCORE;
  }
  const targetLength = target.length;
  const queryLength = query.length;
  if (targetLength < queryLength) {
    return NO_SCORE;
  }
  const targetLower = target.toLowerCase();
  const res = doScoreFuzzy(query, queryLower, queryLength, target, targetLower, targetLength, allowNonContiguousMatches);
  return res;
}

function doScoreFuzzy(query, queryLower, queryLength, target, targetLower, targetLength, allowNonContiguousMatches) {
  const scores = [];
  const matches2 = [];
  for (let queryIndex2 = 0; queryIndex2 < queryLength; queryIndex2++) {
    const queryIndexOffset = queryIndex2 * targetLength;
    const queryIndexPreviousOffset = queryIndexOffset - targetLength;
    const queryIndexGtNull = queryIndex2 > 0;
    const queryCharAtIndex = query[queryIndex2];
    const queryLowerCharAtIndex = queryLower[queryIndex2];
    for (let targetIndex2 = 0; targetIndex2 < targetLength; targetIndex2++) {
      const targetIndexGtNull = targetIndex2 > 0;
      const currentIndex = queryIndexOffset + targetIndex2;
      const leftIndex = currentIndex - 1;
      const diagIndex = queryIndexPreviousOffset + targetIndex2 - 1;
      const leftScore = targetIndexGtNull ? scores[leftIndex] : 0;
      const diagScore = queryIndexGtNull && targetIndexGtNull ? scores[diagIndex] : 0;
      const matchesSequenceLength = queryIndexGtNull && targetIndexGtNull ? matches2[diagIndex] : 0;
      let score3;
      if (!diagScore && queryIndexGtNull) {
        score3 = 0;
      } else {
        score3 = computeCharScore(queryCharAtIndex, queryLowerCharAtIndex, target, targetLower, targetIndex2, matchesSequenceLength);
      }
      const isValidScore = score3 && diagScore + score3 >= leftScore;
      if (isValidScore && // We don't need to check if it's contiguous if we allow non-contiguous matches
      (allowNonContiguousMatches || // We must be looking for a contiguous match.
      // Looking at an index higher than 0 in the query means we must have already
      // found out this is contiguous otherwise there wouldn't have been a score
      queryIndexGtNull || // lastly check if the query is completely contiguous at this index in the target
      targetLower.startsWith(queryLower, targetIndex2))) {
        matches2[currentIndex] = matchesSequenceLength + 1;
        scores[currentIndex] = diagScore + score3;
      } else {
        matches2[currentIndex] = NO_MATCH;
        scores[currentIndex] = leftScore;
      }
    }
  }
  const positions = [];
  let queryIndex = queryLength - 1;
  let targetIndex = targetLength - 1;
  while (queryIndex >= 0 && targetIndex >= 0) {
    const currentIndex = queryIndex * targetLength + targetIndex;
    const match2 = matches2[currentIndex];
    if (match2 === NO_MATCH) {
      targetIndex--;
    } else {
      positions.push(targetIndex);
      queryIndex--;
      targetIndex--;
    }
  }
  return [scores[queryLength * targetLength - 1], positions.reverse()];
}

function computeCharScore(queryCharAtIndex, queryLowerCharAtIndex, target, targetLower, targetIndex, matchesSequenceLength) {
  let score3 = 0;
  if (!considerAsEqual(queryLowerCharAtIndex, targetLower[targetIndex])) {
    return score3;
  }
  score3 += 1;
  if (matchesSequenceLength > 0) {
    score3 += Math.min(matchesSequenceLength, 3) * 6 + Math.max(0, matchesSequenceLength - 3) * 3;
  }
  if (queryCharAtIndex === target[targetIndex]) {
    score3 += 1;
  }
  if (targetIndex === 0) {
    score3 += 8;
  } else {
    const separatorBonus = scoreSeparatorAtPos(target.charCodeAt(targetIndex - 1));
    if (separatorBonus) {
      score3 += separatorBonus;
    } else if (isUpper(target.charCodeAt(targetIndex)) && matchesSequenceLength === 0) {
      score3 += 2;
    }
  }
  return score3;
}

function considerAsEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === "/" || a === "\\") {
    return b === "/" || b === "\\";
  }
  return false;
}

function scoreSeparatorAtPos(charCode) {
  switch (charCode) {
    case 47 /* Slash */:
    case 92 /* Backslash */:
      return 5;
    // prefer path separators...
    case 95 /* Underline */:
    case 45 /* Dash */:
    case 46 /* Period */:
    case 32 /* Space */:
    case 39 /* SingleQuote */:
    case 34 /* DoubleQuote */:
    case 58 /* Colon */:
      return 4;
    // ...over other separators
    default:
      return 0;
  }
}

var NO_SCORE2 = [void 0, []];

function scoreFuzzy2(target, query, patternStart = 0, wordStart = 0) {
  const preparedQuery = query;
  if (preparedQuery.values && preparedQuery.values.length > 1) {
    return doScoreFuzzy2Multiple(target, preparedQuery.values, patternStart, wordStart);
  }
  return doScoreFuzzy2Single(target, query, patternStart, wordStart);
}

function doScoreFuzzy2Multiple(target, query, patternStart, wordStart) {
  let totalScore = 0;
  const totalMatches = [];
  for (const queryPiece of query) {
    const [score3, matches2] = doScoreFuzzy2Single(target, queryPiece, patternStart, wordStart);
    if (typeof score3 !== "number") {
      return NO_SCORE2;
    }
    totalScore += score3;
    totalMatches.push(...matches2);
  }
  return [totalScore, normalizeMatches(totalMatches)];
}

function doScoreFuzzy2Single(target, query, patternStart, wordStart) {
  const score3 = fuzzyScore(query.normalized, query.normalizedLowercase, patternStart, target, target.toLowerCase(), wordStart, { firstMatchCanBeWeak: true, boostFullMatch: true });
  if (!score3) {
    return NO_SCORE2;
  }
  return [score3[0], createMatches(score3)];
}

var NO_ITEM_SCORE = Object.freeze({ score: 0 });

var PATH_IDENTITY_SCORE = 1 << 18;

var LABEL_PREFIX_SCORE_THRESHOLD = 1 << 17;

var LABEL_SCORE_THRESHOLD = 1 << 16;

function getCacheHash(label3, description, allowNonContiguousMatches, query) {
  const values = query.values ? query.values : [query];
  const cacheHash = hash({
    [query.normalized]: {
      values: values.map((v2) => ({ value: v2.normalized, expectContiguousMatch: v2.expectContiguousMatch })),
      label: label3,
      description,
      allowNonContiguousMatches
    }
  });
  return cacheHash;
}

function scoreItemFuzzy(item, query, allowNonContiguousMatches, accessor, cache2) {
  if (!item || !query.normalized) {
    return NO_ITEM_SCORE;
  }
  const label3 = accessor.getItemLabel(item);
  if (!label3) {
    return NO_ITEM_SCORE;
  }
  const description = accessor.getItemDescription(item);
  const cacheHash = getCacheHash(label3, description, allowNonContiguousMatches, query);
  const cached = cache2[cacheHash];
  if (cached) {
    return cached;
  }
  const itemScore = doScoreItemFuzzy(label3, description, accessor.getItemPath(item), query, allowNonContiguousMatches);
  cache2[cacheHash] = itemScore;
  return itemScore;
}

function doScoreItemFuzzy(label3, description, path, query, allowNonContiguousMatches) {
  const preferLabelMatches = !path || !query.containsPathSeparator;
  if (path && (isLinux ? query.pathNormalized === path : equalsIgnoreCase(query.pathNormalized, path))) {
    return { score: PATH_IDENTITY_SCORE, labelMatch: [{ start: 0, end: label3.length }], descriptionMatch: description ? [{ start: 0, end: description.length }] : void 0 };
  }
  if (query.values && query.values.length > 1) {
    return doScoreItemFuzzyMultiple(label3, description, path, query.values, preferLabelMatches, allowNonContiguousMatches);
  }
  return doScoreItemFuzzySingle(label3, description, path, query, preferLabelMatches, allowNonContiguousMatches);
}

function doScoreItemFuzzyMultiple(label3, description, path, query, preferLabelMatches, allowNonContiguousMatches) {
  let totalScore = 0;
  const totalLabelMatches = [];
  const totalDescriptionMatches = [];
  for (const queryPiece of query) {
    const { score: score3, labelMatch, descriptionMatch } = doScoreItemFuzzySingle(label3, description, path, queryPiece, preferLabelMatches, allowNonContiguousMatches);
    if (score3 === NO_MATCH) {
      return NO_ITEM_SCORE;
    }
    totalScore += score3;
    if (labelMatch) {
      totalLabelMatches.push(...labelMatch);
    }
    if (descriptionMatch) {
      totalDescriptionMatches.push(...descriptionMatch);
    }
  }
  return {
    score: totalScore,
    labelMatch: normalizeMatches(totalLabelMatches),
    descriptionMatch: normalizeMatches(totalDescriptionMatches)
  };
}

function doScoreItemFuzzySingle(label3, description, path, query, preferLabelMatches, allowNonContiguousMatches) {
  if (preferLabelMatches || !description) {
    const [labelScore, labelPositions] = scoreFuzzy(
      label3,
      query.normalized,
      query.normalizedLowercase,
      allowNonContiguousMatches && !query.expectContiguousMatch
    );
    if (labelScore) {
      const labelPrefixMatch = matchesPrefix(query.normalized, label3);
      let baseScore;
      if (labelPrefixMatch) {
        baseScore = LABEL_PREFIX_SCORE_THRESHOLD;
        const prefixLengthBoost = Math.round(query.normalized.length / label3.length * 100);
        baseScore += prefixLengthBoost;
      } else {
        baseScore = LABEL_SCORE_THRESHOLD;
      }
      return { score: baseScore + labelScore, labelMatch: labelPrefixMatch || createMatches2(labelPositions) };
    }
  }
  if (description) {
    let descriptionPrefix = description;
    if (!!path) {
      descriptionPrefix = `${description}${sep}`;
    }
    const descriptionPrefixLength = descriptionPrefix.length;
    const descriptionAndLabel = `${descriptionPrefix}${label3}`;
    const [labelDescriptionScore, labelDescriptionPositions] = scoreFuzzy(
      descriptionAndLabel,
      query.normalized,
      query.normalizedLowercase,
      allowNonContiguousMatches && !query.expectContiguousMatch
    );
    if (labelDescriptionScore) {
      const labelDescriptionMatches = createMatches2(labelDescriptionPositions);
      const labelMatch = [];
      const descriptionMatch = [];
      labelDescriptionMatches.forEach((h3) => {
        if (h3.start < descriptionPrefixLength && h3.end > descriptionPrefixLength) {
          labelMatch.push({ start: 0, end: h3.end - descriptionPrefixLength });
          descriptionMatch.push({ start: h3.start, end: descriptionPrefixLength });
        } else if (h3.start >= descriptionPrefixLength) {
          labelMatch.push({ start: h3.start - descriptionPrefixLength, end: h3.end - descriptionPrefixLength });
        } else {
          descriptionMatch.push(h3);
        }
      });
      return { score: labelDescriptionScore, labelMatch, descriptionMatch };
    }
  }
  return NO_ITEM_SCORE;
}

function createMatches2(offsets) {
  const ret = [];
  if (!offsets) {
    return ret;
  }
  let last;
  for (const pos of offsets) {
    if (last && last.end === pos) {
      last.end += 1;
    } else {
      last = { start: pos, end: pos + 1 };
      ret.push(last);
    }
  }
  return ret;
}

function normalizeMatches(matches2) {
  const sortedMatches = matches2.sort((matchA, matchB) => {
    return matchA.start - matchB.start;
  });
  const normalizedMatches = [];
  let currentMatch = void 0;
  for (const match2 of sortedMatches) {
    if (!currentMatch || !matchOverlaps(currentMatch, match2)) {
      currentMatch = match2;
      normalizedMatches.push(match2);
    } else {
      currentMatch.start = Math.min(currentMatch.start, match2.start);
      currentMatch.end = Math.max(currentMatch.end, match2.end);
    }
  }
  return normalizedMatches;
}

function matchOverlaps(matchA, matchB) {
  if (matchA.end < matchB.start) {
    return false;
  }
  if (matchB.end < matchA.start) {
    return false;
  }
  return true;
}

function compareItemsByFuzzyScore(itemA, itemB, query, allowNonContiguousMatches, accessor, cache2) {
  const itemScoreA = scoreItemFuzzy(itemA, query, allowNonContiguousMatches, accessor, cache2);
  const itemScoreB = scoreItemFuzzy(itemB, query, allowNonContiguousMatches, accessor, cache2);
  const scoreA = itemScoreA.score;
  const scoreB = itemScoreB.score;
  if (scoreA === PATH_IDENTITY_SCORE || scoreB === PATH_IDENTITY_SCORE) {
    if (scoreA !== scoreB) {
      return scoreA === PATH_IDENTITY_SCORE ? -1 : 1;
    }
  }
  if (scoreA > LABEL_SCORE_THRESHOLD || scoreB > LABEL_SCORE_THRESHOLD) {
    if (scoreA !== scoreB) {
      return scoreA > scoreB ? -1 : 1;
    }
    if (scoreA < LABEL_PREFIX_SCORE_THRESHOLD && scoreB < LABEL_PREFIX_SCORE_THRESHOLD) {
      const comparedByMatchLength = compareByMatchLength(itemScoreA.labelMatch, itemScoreB.labelMatch);
      if (comparedByMatchLength !== 0) {
        return comparedByMatchLength;
      }
    }
    const labelA = accessor.getItemLabel(itemA) || "";
    const labelB = accessor.getItemLabel(itemB) || "";
    if (labelA.length !== labelB.length) {
      return labelA.length - labelB.length;
    }
  }
  if (scoreA !== scoreB) {
    return scoreA > scoreB ? -1 : 1;
  }
  const itemAHasLabelMatches = Array.isArray(itemScoreA.labelMatch) && itemScoreA.labelMatch.length > 0;
  const itemBHasLabelMatches = Array.isArray(itemScoreB.labelMatch) && itemScoreB.labelMatch.length > 0;
  if (itemAHasLabelMatches && !itemBHasLabelMatches) {
    return -1;
  } else if (itemBHasLabelMatches && !itemAHasLabelMatches) {
    return 1;
  }
  const itemAMatchDistance = computeLabelAndDescriptionMatchDistance(itemA, itemScoreA, accessor);
  const itemBMatchDistance = computeLabelAndDescriptionMatchDistance(itemB, itemScoreB, accessor);
  if (itemAMatchDistance && itemBMatchDistance && itemAMatchDistance !== itemBMatchDistance) {
    return itemBMatchDistance > itemAMatchDistance ? -1 : 1;
  }
  return fallbackCompare(itemA, itemB, query, accessor);
}

function computeLabelAndDescriptionMatchDistance(item, score3, accessor) {
  let matchStart = -1;
  let matchEnd = -1;
  if (score3.descriptionMatch?.length) {
    matchStart = score3.descriptionMatch[0].start;
  } else if (score3.labelMatch?.length) {
    matchStart = score3.labelMatch[0].start;
  }
  if (score3.labelMatch?.length) {
    matchEnd = score3.labelMatch[score3.labelMatch.length - 1].end;
    if (score3.descriptionMatch?.length) {
      const itemDescription = accessor.getItemDescription(item);
      if (itemDescription) {
        matchEnd += itemDescription.length;
      }
    }
  } else if (score3.descriptionMatch?.length) {
    matchEnd = score3.descriptionMatch[score3.descriptionMatch.length - 1].end;
  }
  return matchEnd - matchStart;
}

function compareByMatchLength(matchesA, matchesB) {
  if (!matchesA && !matchesB || !matchesA?.length && !matchesB?.length) {
    return 0;
  }
  if (!matchesB?.length) {
    return -1;
  }
  if (!matchesA?.length) {
    return 1;
  }
  const matchStartA = matchesA[0].start;
  const matchEndA = matchesA[matchesA.length - 1].end;
  const matchLengthA = matchEndA - matchStartA;
  const matchStartB = matchesB[0].start;
  const matchEndB = matchesB[matchesB.length - 1].end;
  const matchLengthB = matchEndB - matchStartB;
  return matchLengthA === matchLengthB ? 0 : matchLengthB < matchLengthA ? 1 : -1;
}

function fallbackCompare(itemA, itemB, query, accessor) {
  const labelA = accessor.getItemLabel(itemA) || "";
  const labelB = accessor.getItemLabel(itemB) || "";
  const descriptionA = accessor.getItemDescription(itemA);
  const descriptionB = accessor.getItemDescription(itemB);
  const labelDescriptionALength = labelA.length + (descriptionA ? descriptionA.length : 0);
  const labelDescriptionBLength = labelB.length + (descriptionB ? descriptionB.length : 0);
  if (labelDescriptionALength !== labelDescriptionBLength) {
    return labelDescriptionALength - labelDescriptionBLength;
  }
  const pathA = accessor.getItemPath(itemA);
  const pathB = accessor.getItemPath(itemB);
  if (pathA && pathB && pathA.length !== pathB.length) {
    return pathA.length - pathB.length;
  }
  if (labelA !== labelB) {
    return compareAnything(labelA, labelB, query.normalized);
  }
  if (descriptionA && descriptionB && descriptionA !== descriptionB) {
    return compareAnything(descriptionA, descriptionB, query.normalized);
  }
  if (pathA && pathB && pathA !== pathB) {
    return compareAnything(pathA, pathB, query.normalized);
  }
  return 0;
}

function queryExpectsExactMatch(query) {
  return query.startsWith('"') && query.endsWith('"');
}

var MULTIPLE_QUERY_VALUES_SEPARATOR = " ";

function prepareQuery(original) {
  if (typeof original !== "string") {
    original = "";
  }
  const originalLowercase = original.toLowerCase();
  const { pathNormalized, normalized, normalizedLowercase } = normalizeQuery(original);
  const containsPathSeparator = pathNormalized.indexOf(sep) >= 0;
  const expectExactMatch = queryExpectsExactMatch(original);
  let values = void 0;
  const originalSplit = original.split(MULTIPLE_QUERY_VALUES_SEPARATOR);
  if (originalSplit.length > 1) {
    for (const originalPiece of originalSplit) {
      const expectExactMatchPiece = queryExpectsExactMatch(originalPiece);
      const {
        pathNormalized: pathNormalizedPiece,
        normalized: normalizedPiece,
        normalizedLowercase: normalizedLowercasePiece
      } = normalizeQuery(originalPiece);
      if (normalizedPiece) {
        if (!values) {
          values = [];
        }
        values.push({
          original: originalPiece,
          originalLowercase: originalPiece.toLowerCase(),
          pathNormalized: pathNormalizedPiece,
          normalized: normalizedPiece,
          normalizedLowercase: normalizedLowercasePiece,
          expectContiguousMatch: expectExactMatchPiece
        });
      }
    }
  }
  return { original, originalLowercase, pathNormalized, normalized, normalizedLowercase, values, containsPathSeparator, expectContiguousMatch: expectExactMatch };
}

function normalizeQuery(original) {
  let pathNormalized;
  if (isWindows) {
    pathNormalized = original.replace(/\//g, sep);
  } else {
    pathNormalized = original.replace(/\\/g, sep);
  }
  const normalized = pathNormalized.replace(/[\*\u2026\s"]/g, "").replace(/(?<=.)#$/, "");
  return {
    pathNormalized,
    normalized,
    normalizedLowercase: normalized.toLowerCase()
  };
}

function pieceToQuery(arg1) {
  if (Array.isArray(arg1)) {
    return prepareQuery(arg1.map((piece) => piece.original).join(MULTIPLE_QUERY_VALUES_SEPARATOR));
  }
  return prepareQuery(arg1.original);
}
export { scoreFuzzy, doScoreFuzzy, computeCharScore, considerAsEqual, scoreSeparatorAtPos, scoreFuzzy2, doScoreFuzzy2Multiple, doScoreFuzzy2Single, getCacheHash, scoreItemFuzzy, doScoreItemFuzzy, doScoreItemFuzzyMultiple, doScoreItemFuzzySingle, createMatches2, normalizeMatches, matchOverlaps, compareItemsByFuzzyScore, computeLabelAndDescriptionMatchDistance, compareByMatchLength, fallbackCompare, queryExpectsExactMatch, prepareQuery, normalizeQuery, pieceToQuery, NO_MATCH, NO_SCORE, NO_SCORE2, NO_ITEM_SCORE, PATH_IDENTITY_SCORE, LABEL_PREFIX_SCORE_THRESHOLD, LABEL_SCORE_THRESHOLD, MULTIPLE_QUERY_VALUES_SEPARATOR };
