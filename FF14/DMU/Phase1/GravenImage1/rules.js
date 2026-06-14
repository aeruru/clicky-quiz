(function definePatternCalloutRules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.patternCalloutRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const markerPatterns = ["spread", "stack"];
  const orbColors = ["blue", "red"];

  function oppositeMarkerPattern(markerPattern) {
    return markerPattern === "spread" ? "stack" : "spread";
  }

  function resolveMarkerPattern(topOrb, shownMarkerPattern) {
    return topOrb === "blue"
      ? shownMarkerPattern
      : oppositeMarkerPattern(shownMarkerPattern);
  }

  function resolvePosition(bottomOrb) {
    return bottomOrb === "blue" ? "out" : "in";
  }

  function resolvePattern(pattern) {
    return {
      markerPattern: resolveMarkerPattern(
        pattern.topOrb,
        pattern.shownMarkerPattern,
      ),
      position: resolvePosition(pattern.bottomOrb),
    };
  }

  function randomItem(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function randomOrbPositions(random = Math.random) {
    const first = 18 + random() * 64;
    const secondCandidates =
      first < 50
        ? [Math.max(first + 28, 54), 82]
        : [18, Math.min(first - 28, 46)];

    return {
      top: first,
      bottom:
        secondCandidates[0] +
        random() * (secondCandidates[1] - secondCandidates[0]),
    };
  }

  function randomPattern(random = Math.random) {
    const positions = randomOrbPositions(random);

    return {
      bottomOrb: randomItem(orbColors, random),
      bottomOrbPosition: positions.bottom,
      shownMarkerPattern: randomItem(markerPatterns, random),
      topOrb: randomItem(orbColors, random),
      topOrbPosition: positions.top,
    };
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
    orbColors,
    randomPattern,
    resolveMarkerPattern,
    resolvePattern,
    resolvePosition,
  };
});
