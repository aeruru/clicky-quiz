(function defineGravenImage3Rules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.gravenImage3Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const scenarios = [];
  const tankStackOutSpots = {
    A1: [21],
    A2: [23],
    A3: [24],
    A4: [22],
  };

  const tankStackInSpots = {
    A1: tankStackOutSpots.A2,
    A2: tankStackOutSpots.A1,
    A3: tankStackOutSpots.A4,
    A4: tankStackOutSpots.A3,
  };

  const mtSpreadOutSpots = {
    A1: [19],
    A2: [17],
    A3: [18, 29],
    A4: [20],
  };

  const mtSpreadInSpots = {
    A1: mtSpreadOutSpots.A2,
    A2: mtSpreadOutSpots.A1,
    A3: mtSpreadOutSpots.A4,
    A4: mtSpreadOutSpots.A3,
  };

  const h1SpreadOutSpots = {
    A1: [9],
    A2: [8],
    A3: [7],
    A4: [8],
  };

  const h1SpreadInSpots = {
    A1: h1SpreadOutSpots.A2,
    A2: h1SpreadOutSpots.A1,
    A3: h1SpreadOutSpots.A4,
    A4: h1SpreadOutSpots.A3,
  };

  const h2SpreadOutSpots = {
    A1: [4],
    A2: [5],
    A3: [6],
    A4: [5],
  };

  const h2SpreadInSpots = {
    A1: h2SpreadOutSpots.A2,
    A2: h2SpreadOutSpots.A1,
    A3: h2SpreadOutSpots.A4,
    A4: h2SpreadOutSpots.A3,
  };

  const dpsStackOutSpots = {
    A1: [13],
    A2: [15],
    A3: [16],
    A4: [14],
  };

  const dpsStackInSpots = {
    A1: dpsStackOutSpots.A2,
    A2: dpsStackOutSpots.A1,
    A3: dpsStackOutSpots.A4,
    A4: dpsStackOutSpots.A3,
  };

  function flippedSpots(spots) {
    return {
      A1: spots.A2,
      A2: spots.A1,
      A3: spots.A4,
      A4: spots.A3,
    };
  }

  function spreadRole(outSpots) {
    return {
      spread: {
        in: flippedSpots(outSpots),
        out: outSpots,
      },
      stack: {
        in: dpsStackInSpots,
        out: dpsStackOutSpots,
      },
    };
  }

  const otSpreadOutSpots = {
    ...tankStackOutSpots,
    A2: [23, 29],
  };

  const otSpreadInSpots = {
    ...tankStackInSpots,
    A1: [23, 29],
  };

  const correctSpots = {
    H1: {
      spread: {
        in: h1SpreadInSpots,
        out: h1SpreadOutSpots,
      },
      stack: {
        in: tankStackInSpots,
        out: tankStackOutSpots,
      },
    },
    H2: {
      spread: {
        in: h2SpreadInSpots,
        out: h2SpreadOutSpots,
      },
      stack: {
        in: tankStackInSpots,
        out: tankStackOutSpots,
      },
    },
    M1: spreadRole({
      A1: [13, 29],
      A2: [15],
      A3: [16],
      A4: [14],
    }),
    M2: spreadRole({
      A1: [27],
      A2: [25],
      A3: [26],
      A4: [28, 29],
    }),
    MT: {
      spread: {
        in: mtSpreadInSpots,
        out: mtSpreadOutSpots,
      },
      stack: {
        in: tankStackInSpots,
        out: tankStackOutSpots,
      },
    },
    OT: {
      spread: {
        in: otSpreadInSpots,
        out: otSpreadOutSpots,
      },
      stack: {
        in: tankStackInSpots,
        out: tankStackOutSpots,
      },
    },
    R1: spreadRole({
      A1: [2],
      A2: [3],
      A3: [2],
      A4: [1],
    }),
    R2: spreadRole({
      A1: [11],
      A2: [10],
      A3: [12],
      A4: [11],
    }),
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
    randomScenario,
    resolveLineRequirement,
    scenarios,
    scenarioForPattern,
  };
});
