// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/tfIdf.ts



// src/vs/base/common/tfIdf.ts
function countMapFrom(values) {
  const map = /* @__PURE__ */ new Map();
  for (const value2 of values) {
    map.set(value2, (map.get(value2) ?? 0) + 1);
  }
  return map;
}

var TfIdfCalculator = class _TfIdfCalculator {
  constructor() {
    /**
     * Total number of chunks
     */
    this.chunkCount = 0;
    this.chunkOccurrences = /* @__PURE__ */ new Map();
    this.documents = /* @__PURE__ */ new Map();
  }
  calculateScores(query, token) {
    const embedding = this.computeEmbedding(query);
    const idfCache = /* @__PURE__ */ new Map();
    const scores = [];
    for (const [key3, doc] of this.documents) {
      if (token.isCancellationRequested) {
        return [];
      }
      for (const chunk of doc.chunks) {
        const score3 = this.computeSimilarityScore(chunk, embedding, idfCache);
        if (score3 > 0) {
          scores.push({ key: key3, score: score3 });
        }
      }
    }
    return scores;
  }
  /**
   * Count how many times each term (word) appears in a string.
   */
  static termFrequencies(input) {
    return countMapFrom(_TfIdfCalculator.splitTerms(input));
  }
  /**
   * Break a string into terms (words).
   */
  static *splitTerms(input) {
    const normalize3 = (word) => word.toLowerCase();
    for (const [word] of input.matchAll(/\b\p{Letter}[\p{Letter}\d]{2,}\b/gu)) {
      yield normalize3(word);
      const camelParts = word.replace(/([a-z])([A-Z])/g, "$1 $2").split(/\s+/g);
      if (camelParts.length > 1) {
        for (const part of camelParts) {
          if (part.length > 2 && /\p{Letter}{3,}/gu.test(part)) {
            yield normalize3(part);
          }
        }
      }
    }
  }
  updateDocuments(documents) {
    for (const { key: key3 } of documents) {
      this.deleteDocument(key3);
    }
    for (const doc of documents) {
      const chunks = [];
      for (const text2 of doc.textChunks) {
        const tf = _TfIdfCalculator.termFrequencies(text2);
        for (const term of tf.keys()) {
          this.chunkOccurrences.set(term, (this.chunkOccurrences.get(term) ?? 0) + 1);
        }
        chunks.push({ text: text2, tf });
      }
      this.chunkCount += chunks.length;
      this.documents.set(doc.key, { chunks });
    }
    return this;
  }
  deleteDocument(key3) {
    const doc = this.documents.get(key3);
    if (!doc) {
      return;
    }
    this.documents.delete(key3);
    this.chunkCount -= doc.chunks.length;
    for (const chunk of doc.chunks) {
      for (const term of chunk.tf.keys()) {
        const currentOccurrences = this.chunkOccurrences.get(term);
        if (typeof currentOccurrences === "number") {
          const newOccurrences = currentOccurrences - 1;
          if (newOccurrences <= 0) {
            this.chunkOccurrences.delete(term);
          } else {
            this.chunkOccurrences.set(term, newOccurrences);
          }
        }
      }
    }
  }
  computeSimilarityScore(chunk, queryEmbedding, idfCache) {
    let sum2 = 0;
    for (const [term, termTfidf] of Object.entries(queryEmbedding)) {
      const chunkTf = chunk.tf.get(term);
      if (!chunkTf) {
        continue;
      }
      let chunkIdf = idfCache.get(term);
      if (typeof chunkIdf !== "number") {
        chunkIdf = this.computeIdf(term);
        idfCache.set(term, chunkIdf);
      }
      const chunkTfidf = chunkTf * chunkIdf;
      sum2 += chunkTfidf * termTfidf;
    }
    return sum2;
  }
  computeEmbedding(input) {
    const tf = _TfIdfCalculator.termFrequencies(input);
    return this.computeTfidf(tf);
  }
  computeIdf(term) {
    const chunkOccurrences = this.chunkOccurrences.get(term) ?? 0;
    return chunkOccurrences > 0 ? Math.log((this.chunkCount + 1) / chunkOccurrences) : 0;
  }
  computeTfidf(termFrequencies) {
    const embedding = /* @__PURE__ */ Object.create(null);
    for (const [word, occurrences] of termFrequencies) {
      const idf = this.computeIdf(word);
      if (idf > 0) {
        embedding[word] = occurrences * idf;
      }
    }
    return embedding;
  }
};

function normalizeTfIdfScores(scores) {
  const result = scores.slice(0);
  result.sort((a, b) => b.score - a.score);
  const max = result[0]?.score ?? 0;
  if (max > 0) {
    for (const score3 of result) {
      score3.score /= max;
    }
  }
  return result;
}
export { countMapFrom, normalizeTfIdfScores, TfIdfCalculator };
