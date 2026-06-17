(function defineGravenImage3Rules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.gravenImage3Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const scenarios = [];
  const patternScreenshotFiles = [
    "laf-spread-lie-in-1.png",
    "laf-spread-lie-in-2.png",
    "laf-spread-lie-out-1.png",
    "laf-spread-lie-out-2.png",
    "laf-spread-lie-out-3.png",
    "laf-spread-lie-out-4.png",
    "laf-spread-truth-in-1.png",
    "laf-spread-truth-out-1.png",
    "laf-stack-lie-in-1.png",
    "laf-stack-lie-in-2.png",
    "laf-stack-lie-in-3.png",
    "laf-stack-lie-out-1.png",
    "laf-stack-lie-out-2.png",
    "laf-stack-truth-in-1.png",
    "laf-stack-truth-in-2.png",
  ];
  const stackOutSpots = {
    dps: {
      A1: [13],
      A2: [15],
      A3: [16],
      A4: [14],
    },
    support: {
      A1: [21],
      A2: [23],
      A3: [24],
      A4: [22],
    },
  };

  function flippedSpots(spots) {
    return {
      A1: spots.A2,
      A2: spots.A1,
      A3: spots.A4,
      A4: spots.A3,
    };
  }

  function roleSpots(spreadOutSpots, stackGroup) {
    const stackOut = stackOutSpots[stackGroup];

    return {
      spread: {
        in: flippedSpots(spreadOutSpots),
        out: spreadOutSpots,
      },
      stack: {
        in: flippedSpots(stackOut),
        out: stackOut,
      },
    };
  }

  const otSpreadOutSpots = {
    ...stackOutSpots.support,
    A2: [23, 29],
  };

  const correctSpots = {
    H1: roleSpots(
      {
        A1: [9],
        A2: [8],
        A3: [7],
        A4: [8],
      },
      "support",
    ),
    H2: roleSpots(
      {
        A1: [4],
        A2: [5],
        A3: [5],
        A4: [6],
      },
      "support",
    ),
    M1: roleSpots({
      A1: [13, 29],
      A2: [15],
      A3: [16],
      A4: [14],
    }, "dps"),
    M2: roleSpots({
      A1: [27],
      A2: [25],
      A3: [26],
      A4: [28, 29],
    }, "dps"),
    MT: roleSpots(
      {
        A1: [19],
        A2: [17],
        A3: [18, 29],
        A4: [20],
      },
      "support",
    ),
    OT: roleSpots(otSpreadOutSpots, "support"),
    R1: roleSpots({
      A1: [2],
      A2: [3],
      A3: [2],
      A4: [1],
    }, "dps"),
    R2: roleSpots({
      A1: [11],
      A2: [10],
      A3: [12],
      A4: [11],
    }, "dps"),
  };

  function availableScenarios(previousScenarioId) {
    return scenarios.filter((scenario) => scenario.id !== previousScenarioId);
  }

  function isCorrectBox(scenario, clickedBox) {
    return scenario.correctBoxes.includes(clickedBox);
  }

  function resolveLineRequirement(bottomOrbColor) {
    return bottomOrbColor === "blue" ? "out" : "in";
  }

  function resolveTruthState(orbColor) {
    return orbColor === "blue" ? "truth" : "lie";
  }

  function screenshotKeyForPattern(pattern) {
    return [
      pattern.shownMarkerPattern,
      pattern.truthState || resolveTruthState(pattern.topOrb),
      pattern.lineRequirement,
    ].join("+");
  }

  function patternScreenshotFromImageFile(fileName) {
    const match = fileName.match(
      /^laf-(spread|stack)-(truth|lie)-(in|out)-(\d+)\.png$/,
    );

    if (!match) {
      throw new Error(`Unexpected Graven Image 3 pattern filename: ${fileName}`);
    }

    const [, shownMarkerPattern, truthState, lineRequirement, variant] = match;

    return {
      id: fileName.replace(".png", ""),
      imageAlt: `Lightning and fire ${shownMarkerPattern} ${truthState} ${lineRequirement} pattern`,
      imageSrc: `patterns/${fileName}`,
      lineRequirement,
      mechanic: "laf",
      shownMarkerPattern,
      truthState,
      variant: Number(variant),
    };
  }

  const patternScreenshots = patternScreenshotFiles.map(
    patternScreenshotFromImageFile,
  );

  const patternScreenshotsByKey = patternScreenshots.reduce(
    (screenshotsByKey, screenshot) => {
      const key = screenshotKeyForPattern(screenshot);
      screenshotsByKey[key] = screenshotsByKey[key] || [];
      screenshotsByKey[key].push(screenshot);
      return screenshotsByKey;
    },
    {},
  );

  function randomItem(items, random) {
    return items[Math.floor(random() * items.length)];
  }

  function randomPatternScreenshot(pattern, random = Math.random) {
    const screenshots = patternScreenshotsByKey[screenshotKeyForPattern(pattern)] || [];

    if (screenshots.length === 0) {
      return null;
    }

    return randomItem(screenshots, random);
  }

  function correctBoxesFor({ lineConfig, lineRequirement, markerPattern, role }) {
    return (
      correctSpots[role]?.[markerPattern]?.[lineRequirement]?.[lineConfig] || []
    );
  }

  function scenarioForPattern(pattern) {
    const correctBoxes = correctBoxesFor(pattern);

    if (correctBoxes.length === 0) {
      return null;
    }

    return {
      correctBoxes,
      id: [
        pattern.role,
        pattern.lineConfig,
        pattern.markerPattern,
        pattern.lineRequirement,
      ].join(":"),
    };
  }

  function randomScenario(previousScenarioId, random = Math.random) {
    const options = availableScenarios(previousScenarioId);
    const pool = options.length > 0 ? options : scenarios;

    if (pool.length === 0) {
      return null;
    }

    return pool[Math.floor(random() * pool.length)];
  }

  return {
    availableScenarios,
    correctBoxesFor,
    correctSpots,
    isCorrectBox,
    patternScreenshotFiles,
    patternScreenshotFromImageFile,
    patternScreenshots,
    randomPatternScreenshot,
    randomScenario,
    resolveLineRequirement,
    resolveTruthState,
    screenshotKeyForPattern,
    scenarios,
    scenarioForPattern,
  };
});
