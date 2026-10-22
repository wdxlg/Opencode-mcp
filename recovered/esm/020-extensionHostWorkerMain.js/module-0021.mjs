// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/performance.ts



// src/vs/base/common/performance.ts
function _definePolyfillMarks(timeOrigin) {
  const _data = [];
  if (typeof timeOrigin === "number") {
    _data.push("code/timeOrigin", timeOrigin);
  }
  function mark2(name2, markOptions) {
    _data.push(name2, markOptions?.startTime ?? Date.now());
  }
  function getMarks2() {
    const result = [];
    for (let i = 0; i < _data.length; i += 2) {
      result.push({
        name: _data[i],
        startTime: _data[i + 1]
      });
    }
    return result;
  }
  function clearMarks2(name2) {
    if (typeof name2 === "undefined") {
      const hasTimeOrigin = _data.length >= 2 && _data[0] === "code/timeOrigin";
      const timeOriginValue = hasTimeOrigin ? _data[1] : void 0;
      _data.length = 0;
      if (hasTimeOrigin) {
        _data.push("code/timeOrigin", timeOriginValue);
      }
    } else {
      for (let i = _data.length - 2; i >= 0; i -= 2) {
        if (_data[i] === name2) {
          _data.splice(i, 2);
        }
      }
    }
  }
  return { mark: mark2, getMarks: getMarks2, clearMarks: clearMarks2 };
}

function _define() {
  if (typeof performance === "object" && typeof performance.mark === "function" && !performance.nodeTiming) {
    if (typeof performance.timeOrigin !== "number" && !performance.timing) {
      return _definePolyfillMarks();
    } else {
      return {
        mark(name2, markOptions) {
          performance.mark(name2, markOptions);
        },
        clearMarks(name2) {
          performance.clearMarks(name2);
        },
        getMarks() {
          let timeOrigin = performance.timeOrigin;
          if (typeof timeOrigin !== "number") {
            timeOrigin = (performance.timing.navigationStart || performance.timing.redirectStart || performance.timing.fetchStart) ?? 0;
          }
          const result = [{ name: "code/timeOrigin", startTime: Math.round(timeOrigin) }];
          for (const entry of performance.getEntriesByType("mark")) {
            result.push({
              name: entry.name,
              startTime: Math.round(timeOrigin + entry.startTime)
            });
          }
          return result;
        }
      };
    }
  } else if (typeof process === "object") {
    const timeOrigin = performance?.timeOrigin;
    return _definePolyfillMarks(timeOrigin);
  } else {
    console.trace("perf-util loaded in UNKNOWN environment");
    return _definePolyfillMarks();
  }
}

function _factory(sharedObj) {
  if (!sharedObj.MonacoPerformanceMarks) {
    sharedObj.MonacoPerformanceMarks = _define();
  }
  return sharedObj.MonacoPerformanceMarks;
}

var perf = _factory(globalThis);

var mark = perf.mark;

var clearMarks = perf.clearMarks;

var getMarks = perf.getMarks;
export { _definePolyfillMarks, _define, _factory, perf, mark, clearMarks, getMarks };
