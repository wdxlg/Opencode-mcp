// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/annotations.ts
import { binarySearch2 } from "./module-0007.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/editor/common/model/tokens/annotations.ts
var AnnotatedString = class _AnnotatedString {
  constructor(annotations = []) {
    /**
     * Annotations are non intersecting and contiguous in the array.
     */
    this._annotations = [];
    this._annotations = annotations;
  }
  /**
   * Set annotations for a specific range.
   * Annotations should be sorted and non-overlapping.
   * If the annotation value is undefined, the annotation is removed.
   */
  setAnnotations(annotations) {
    for (const annotation of annotations.annotations) {
      const startIndex = this._getStartIndexOfIntersectingAnnotation(annotation.range.start);
      const endIndexExclusive = this._getEndIndexOfIntersectingAnnotation(annotation.range.endExclusive);
      if (annotation.annotation !== void 0) {
        this._annotations.splice(startIndex, endIndexExclusive - startIndex, { range: annotation.range, annotation: annotation.annotation });
      } else {
        this._annotations.splice(startIndex, endIndexExclusive - startIndex);
      }
    }
  }
  /**
   * Returns all annotations that intersect with the given offset range.
   */
  getAnnotationsIntersecting(range2) {
    const startIndex = this._getStartIndexOfIntersectingAnnotation(range2.start);
    const endIndexExclusive = this._getEndIndexOfIntersectingAnnotation(range2.endExclusive);
    return this._annotations.slice(startIndex, endIndexExclusive);
  }
  _getStartIndexOfIntersectingAnnotation(offset) {
    const startIndexWhereToReplace = binarySearch2(this._annotations.length, (index2) => {
      return this._annotations[index2].range.start - offset;
    });
    let startIndex;
    if (startIndexWhereToReplace >= 0) {
      startIndex = startIndexWhereToReplace;
      const nextCandidate = this._annotations[startIndex]?.range;
      if (nextCandidate && nextCandidate.endExclusive === offset) {
        startIndex--;
      }
    } else {
      const candidate = this._annotations[-(startIndexWhereToReplace + 2)]?.range;
      if (candidate && offset >= candidate.start && offset < candidate.endExclusive) {
        startIndex = -(startIndexWhereToReplace + 2);
      } else {
        startIndex = -(startIndexWhereToReplace + 1);
      }
    }
    return startIndex;
  }
  _getEndIndexOfIntersectingAnnotation(offset) {
    const endIndexWhereToReplace = binarySearch2(this._annotations.length, (index2) => {
      return this._annotations[index2].range.endExclusive - offset;
    });
    let endIndexExclusive;
    if (endIndexWhereToReplace >= 0) {
      endIndexExclusive = endIndexWhereToReplace + 1;
      const nextCandidate = this._annotations[endIndexExclusive]?.range;
      if (nextCandidate && nextCandidate.start === offset) {
        endIndexExclusive++;
      }
    } else {
      const candidate = this._annotations[-(endIndexWhereToReplace + 1)]?.range;
      if (candidate && offset >= candidate.start && offset <= candidate.endExclusive) {
        endIndexExclusive = -endIndexWhereToReplace;
      } else {
        endIndexExclusive = -(endIndexWhereToReplace + 1);
      }
    }
    return endIndexExclusive;
  }
  /**
   * Returns a copy of all annotations.
   */
  getAllAnnotations() {
    return this._annotations.slice();
  }
  /**
   * Applies a string edit to the annotated string, updating annotation ranges accordingly.
   * @param edit The string edit to apply.
   * @returns The annotations that were deleted (became empty) as a result of the edit.
   */
  applyEdit(edit3) {
    const annotations = this._annotations.slice();
    const finalAnnotations = [];
    const deletedAnnotations = [];
    let offset = 0;
    for (const e4 of edit3.replacements) {
      while (true) {
        const annotation = annotations[0];
        if (!annotation) {
          break;
        }
        const range2 = annotation.range;
        if (range2.endExclusive >= e4.replaceRange.start) {
          break;
        }
        annotations.shift();
        const newAnnotation = { range: range2.delta(offset), annotation: annotation.annotation };
        if (!newAnnotation.range.isEmpty) {
          finalAnnotations.push(newAnnotation);
        } else {
          deletedAnnotations.push(newAnnotation);
        }
      }
      const intersecting = [];
      while (true) {
        const annotation = annotations[0];
        if (!annotation) {
          break;
        }
        const range2 = annotation.range;
        if (!range2.intersectsOrTouches(e4.replaceRange)) {
          break;
        }
        annotations.shift();
        intersecting.push(annotation);
      }
      for (let i2 = intersecting.length - 1; i2 >= 0; i2--) {
        const annotation = intersecting[i2];
        let r2 = annotation.range;
        const shouldExtend = i2 === 0 && e4.replaceRange.endExclusive > r2.start && e4.replaceRange.start < r2.endExclusive;
        const overlap = r2.intersect(e4.replaceRange).length;
        r2 = r2.deltaEnd(-overlap + (shouldExtend ? e4.newText.length : 0));
        const rangeAheadOfReplaceRange = r2.start - e4.replaceRange.start;
        if (rangeAheadOfReplaceRange > 0) {
          r2 = r2.delta(-rangeAheadOfReplaceRange);
        }
        if (!shouldExtend && rangeAheadOfReplaceRange >= 0) {
          r2 = r2.delta(e4.newText.length);
        }
        r2 = r2.delta(-(e4.newText.length - e4.replaceRange.length));
        annotations.unshift({ annotation: annotation.annotation, range: r2 });
      }
      offset += e4.newText.length - e4.replaceRange.length;
    }
    while (true) {
      const annotation = annotations[0];
      if (!annotation) {
        break;
      }
      annotations.shift();
      const newAnnotation = { annotation: annotation.annotation, range: annotation.range.delta(offset) };
      if (!newAnnotation.range.isEmpty) {
        finalAnnotations.push(newAnnotation);
      } else {
        deletedAnnotations.push(newAnnotation);
      }
    }
    this._annotations = finalAnnotations;
    return deletedAnnotations;
  }
  /**
   * Creates a shallow clone of this annotated string.
   */
  clone() {
    return new _AnnotatedString(this._annotations.slice());
  }
};

var AnnotationsUpdate = class _AnnotationsUpdate {
  static create(annotations) {
    return new _AnnotationsUpdate(annotations);
  }
  constructor(annotations) {
    this._annotations = annotations;
  }
  get annotations() {
    return this._annotations;
  }
  rebase(edit3) {
    const annotatedString = new AnnotatedString(this._annotations);
    annotatedString.applyEdit(edit3);
    this._annotations = annotatedString.getAllAnnotations();
  }
  serialize(serializingFunc) {
    return this._annotations.map((annotation) => {
      const range2 = { start: annotation.range.start, endExclusive: annotation.range.endExclusive };
      if (!annotation.annotation) {
        return { range: range2, annotation: void 0 };
      }
      return { range: range2, annotation: serializingFunc(annotation.annotation) };
    });
  }
  static deserialize(serializedAnnotations, deserializingFunc) {
    const annotations = serializedAnnotations.map((serializedAnnotation) => {
      const range2 = new OffsetRange(serializedAnnotation.range.start, serializedAnnotation.range.endExclusive);
      if (!serializedAnnotation.annotation) {
        return { range: range2, annotation: void 0 };
      }
      return { range: range2, annotation: deserializingFunc(serializedAnnotation.annotation) };
    });
    return new _AnnotationsUpdate(annotations);
  }
};
export { AnnotatedString, AnnotationsUpdate };
