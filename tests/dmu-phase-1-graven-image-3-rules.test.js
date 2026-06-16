const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../FF14/DMU/Phase1/GravenImage3/rules.js");

test("starts without configured Graven 3 Lightning + Fire scenarios", () => {
  assert.deepEqual(rules.scenarios, []);
  assert.equal(rules.randomScenario("any"), null);
});

test("validates a scenario against its configured correct boxes", () => {
  const scenario = {
    correctBoxes: [4, 5],
  };

  assert.equal(rules.isCorrectBox(scenario, 4), true);
  assert.equal(rules.isCorrectBox(scenario, 5), true);
  assert.equal(rules.isCorrectBox(scenario, 6), false);
});

test("resolves purple line requirement from bottom orb color", () => {
  assert.equal(rules.resolveLineRequirement("blue"), "out");
  assert.equal(rules.resolveLineRequirement("red"), "in");
});

test("resolves truth state from top orb color", () => {
  assert.equal(rules.resolveTruthState("blue"), "truth");
  assert.equal(rules.resolveTruthState("red"), "lie");
});

test("parses screenshot names into Graven 3 patterns", () => {
  assert.deepEqual(
    rules.patternScreenshotFromImageFile("laf-stack-lie-in-3.png"),
    {
      id: "laf-stack-lie-in-3",
      imageAlt: "Lightning and fire stack lie in pattern",
      imageSrc: "patterns/laf-stack-lie-in-3.png",
      lineRequirement: "in",
      mechanic: "laf",
      shownMarkerPattern: "stack",
      truthState: "lie",
      variant: 3,
    },
  );
});

test("finds screenshots for matching generated patterns", () => {
  const screenshot = rules.randomPatternScreenshot(
    {
      lineRequirement: "out",
      shownMarkerPattern: "spread",
      topOrb: "red",
    },
    () => 0.99,
  );

  assert.equal(screenshot.id, "laf-spread-lie-out-4");
});

test("returns no screenshot for missing generated pattern screenshots", () => {
  assert.equal(
    rules.randomPatternScreenshot({
      lineRequirement: "in",
      shownMarkerPattern: "stack",
      topOrb: "blue",
    }),
    null,
  );
});

test("defines OT spread or stack out positions by line config", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "OT",
    }),
    [23, 29],
  );

  ["spread", "stack"].forEach((markerPattern) => {
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A1",
        lineRequirement: "out",
        markerPattern,
        role: "OT",
      }),
      [21],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A3",
        lineRequirement: "out",
        markerPattern,
        role: "OT",
      }),
      [24],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A4",
        lineRequirement: "out",
        markerPattern,
        role: "OT",
      }),
      [22],
    );
  });

  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "OT",
    }),
    [23],
  );
});

test("flips OT positions when player should be in purple", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "OT",
    }),
    [23, 29],
  );

  ["spread", "stack"].forEach((markerPattern) => {
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A2",
        lineRequirement: "in",
        markerPattern,
        role: "OT",
      }),
      [21],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A3",
        lineRequirement: "in",
        markerPattern,
        role: "OT",
      }),
      [22],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A4",
        lineRequirement: "in",
        markerPattern,
        role: "OT",
      }),
      [24],
    );
  });

  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "OT",
    }),
    [23],
  );
});

test("defines MT spread out positions by line config", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "MT",
    }),
    [19],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "MT",
    }),
    [17],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "MT",
    }),
    [18, 29],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "MT",
    }),
    [20],
  );
});

test("flips MT spread positions when player should be in purple", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "MT",
    }),
    [17],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "MT",
    }),
    [19],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "MT",
    }),
    [20],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "MT",
    }),
    [18, 29],
  );
});

test("uses tank stack positions for MT", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "MT",
    }),
    [21],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "MT",
    }),
    [23],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "MT",
    }),
    [22],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "MT",
    }),
    [24],
  );
});

test("defines H1 spread out positions by line config", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H1",
    }),
    [9],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H1",
    }),
    [8],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H1",
    }),
    [7],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H1",
    }),
    [8],
  );
});

test("flips H1 spread positions when player should be in purple", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H1",
    }),
    [8],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H1",
    }),
    [9],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H1",
    }),
    [8],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H1",
    }),
    [7],
  );
});

test("uses stack positions for H1", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "H1",
    }),
    [21],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "H1",
    }),
    [23],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "H1",
    }),
    [22],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "H1",
    }),
    [24],
  );
});

test("defines H2 spread out positions by line config", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H2",
    }),
    [4],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H2",
    }),
    [5],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H2",
    }),
    [5],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "out",
      markerPattern: "spread",
      role: "H2",
    }),
    [6],
  );
});

test("flips H2 spread positions when player should be in purple", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H2",
    }),
    [5],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H2",
    }),
    [4],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H2",
    }),
    [6],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "in",
      markerPattern: "spread",
      role: "H2",
    }),
    [5],
  );
});

test("uses stack positions for H2", () => {
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A1",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "H2",
    }),
    [21],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A2",
      lineRequirement: "out",
      markerPattern: "stack",
      role: "H2",
    }),
    [23],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A3",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "H2",
    }),
    [22],
  );
  assert.deepEqual(
    rules.correctBoxesFor({
      lineConfig: "A4",
      lineRequirement: "in",
      markerPattern: "stack",
      role: "H2",
    }),
    [24],
  );
});

test("defines remaining role spread out positions by line config", () => {
  const expectedByRole = {
    M1: {
      A1: [13, 29],
      A2: [15],
      A3: [16],
      A4: [14],
    },
    M2: {
      A1: [27],
      A2: [25],
      A3: [26],
      A4: [28, 29],
    },
    R1: {
      A1: [2],
      A2: [3],
      A3: [2],
      A4: [1],
    },
    R2: {
      A1: [11],
      A2: [10],
      A3: [12],
      A4: [11],
    },
  };

  Object.entries(expectedByRole).forEach(([role, expectedByConfig]) => {
    Object.entries(expectedByConfig).forEach(([lineConfig, expected]) => {
      assert.deepEqual(
        rules.correctBoxesFor({
          lineConfig,
          lineRequirement: "out",
          markerPattern: "spread",
          role,
        }),
        expected,
      );
    });
  });
});

test("flips remaining role spread positions when player should be in purple", () => {
  const expectedByRole = {
    M1: {
      A1: [15],
      A2: [13, 29],
      A3: [14],
      A4: [16],
    },
    M2: {
      A1: [25],
      A2: [27],
      A3: [28, 29],
      A4: [26],
    },
    R1: {
      A1: [3],
      A2: [2],
      A3: [1],
      A4: [2],
    },
    R2: {
      A1: [10],
      A2: [11],
      A3: [11],
      A4: [12],
    },
  };

  Object.entries(expectedByRole).forEach(([role, expectedByConfig]) => {
    Object.entries(expectedByConfig).forEach(([lineConfig, expected]) => {
      assert.deepEqual(
        rules.correctBoxesFor({
          lineConfig,
          lineRequirement: "in",
          markerPattern: "spread",
          role,
        }),
        expected,
      );
    });
  });
});

test("uses shared DPS stack positions for remaining roles", () => {
  ["M1", "M2", "R1", "R2"].forEach((role) => {
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A1",
        lineRequirement: "out",
        markerPattern: "stack",
        role,
      }),
      [13],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A2",
        lineRequirement: "out",
        markerPattern: "stack",
        role,
      }),
      [15],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A3",
        lineRequirement: "in",
        markerPattern: "stack",
        role,
      }),
      [14],
    );
    assert.deepEqual(
      rules.correctBoxesFor({
        lineConfig: "A4",
        lineRequirement: "in",
        markerPattern: "stack",
        role,
      }),
      [16],
    );
  });
});
