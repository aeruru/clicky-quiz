(function definePatternCalloutRules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.patternCalloutRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const markerPatterns = ["spread", "stack"];
  const positions = ["in", "out"];
  const truthStates = ["truth", "lie"];
  const patternImageFiles = [
    "iaf-spread-lie-in-1.png",
    "iaf-spread-lie-in-2.png",
    "iaf-spread-lie-out-1.png",
    "iaf-spread-lie-out-2.png",
    "iaf-spread-lie-out-3.png",
    "iaf-spread-truth-in-1.png",
    "iaf-spread-truth-in-2.png",
    "iaf-spread-truth-out-1.png",
    "iaf-stack-lie-in-1.png",
    "iaf-stack-lie-in-2.png",
    "iaf-stack-lie-out-1.png",
    "iaf-stack-lie-out-2.png",
    "iaf-stack-truth-out-1.png",
    "iaf-stack-truth-out-2.png",
    "iaf-stack-truth-out-3.png",
  ];

  function oppositeMarkerPattern(markerPattern) {
    return markerPattern === "spread" ? "stack" : "spread";
  }

  function resolveMarkerPattern(shownMarkerPattern, truthState) {
    return truthState === "truth"
      ? shownMarkerPattern
      : oppositeMarkerPattern(shownMarkerPattern);
  }

  function resolvePattern(pattern) {
    return {
      markerPattern: resolveMarkerPattern(
        pattern.shownMarkerPattern,
        pattern.truthState,
      ),
      position: pattern.position,
    };
  }

  function patternFromImageFile(fileName) {
    const match = fileName.match(
      /^iaf-(spread|stack)-(truth|lie)-(in|out)-(\d+)\.png$/,
    );

    if (!match) {
      throw new Error(`Unexpected Graven Image 1 pattern filename: ${fileName}`);
    }

    const [, shownMarkerPattern, truthState, position, variant] = match;

    return {
      id: fileName.replace(".png", ""),
      imageAlt: `Ice and fire ${shownMarkerPattern} ${truthState} ${position} pattern`,
      imageSrc: `patterns/${fileName}`,
      mechanic: "iaf",
      position,
      shownMarkerPattern,
      truthState,
      variant: Number(variant),
    };
  }

  const patterns = patternImageFiles.map(patternFromImageFile);
  const patternGroups = Object.values(
    patterns.reduce((groups, pattern) => {
      const key = patternGroupKey(pattern);
      groups[key] = groups[key] || {
        id: key,
        patterns: [],
      };
      groups[key].patterns.push(pattern);
      return groups;
    }, {}),
  );

  function patternGroupKey(pattern) {
    return [
      pattern.shownMarkerPattern,
      pattern.truthState,
      pattern.position,
    ].join("+");
  }

  function randomItem(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function randomPattern(previousPatternId = "", random = Math.random) {
    if (typeof previousPatternId === "function") {
      random = previousPatternId;
      previousPatternId = "";
    }

    const availableGroups = patternGroups.filter((group) =>
      group.patterns.some((pattern) => pattern.id !== previousPatternId),
    );
    const groupPool = availableGroups.length > 0 ? availableGroups : patternGroups;
    const group = randomItem(groupPool, random);
    const screenshotPool = group.patterns.filter(
      (pattern) => pattern.id !== previousPatternId,
    );

    return randomItem(
      screenshotPool.length > 0 ? screenshotPool : group.patterns,
      random,
    );
  }

  function isCorrectSelection(pattern, selection) {
    const answer = resolvePattern(pattern);

    return (
      selection.markerPattern === answer.markerPattern &&
      selection.position === answer.position
    );
  }

  return {
    isCorrectSelection,
    markerPatterns,
    oppositeMarkerPattern,
    patternFromImageFile,
    patternGroupKey,
    patternGroups,
    patterns,
    positions,
    randomPattern,
    resolveMarkerPattern,
    resolvePattern,
    truthStates,
  };
});
