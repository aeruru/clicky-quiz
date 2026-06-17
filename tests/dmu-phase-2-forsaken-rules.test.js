const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../FF14/DMU/Phase2/Forsaken/rules.js");

test("defines the Forsaken role set", () => {
  assert.deepEqual(rules.roles, ["MT", "H1", "M1", "R1", "OT", "H2", "M2", "R2"]);
});

test("defines support and DPS role groups", () => {
  assert.deepEqual(rules.roleGroups.support, ["MT", "H1", "OT", "H2"]);
  assert.deepEqual(rules.roleGroups.dps, ["M1", "R1", "M2", "R2"]);
});

test("defines fixed two-player teams", () => {
  assert.deepEqual(rules.roleTeams, [
    { id: "mt-h1", roles: ["MT", "H1"] },
    { id: "ot-h2", roles: ["OT", "H2"] },
    { id: "m1-r1", roles: ["M1", "R1"] },
    { id: "m2-r2", roles: ["M2", "R2"] },
  ]);
});

test("defines the thirteen Forsaken timeline steps", () => {
  assert.deepEqual(
    rules.mechanicSteps.map((step) => step.label),
    [
      "Forsaken",
      "1st towers",
      "2nd towers",
      "All Things Ending Bait",
      "3rd towers",
      "4th towers",
      "All Things Ending Bait",
      "5th towers",
      "6th towers",
      "All Things Ending Bait",
      "7th towers",
      "8th towers",
      "All Things Ending Bait",
    ],
  );
});

test("starts with a Forsaken prep step before tower and bait green squares", () => {
  assert.deepEqual(rules.validSpotIdsForStep(0), []);
  assert.deepEqual(rules.validSpotIdsForStep(1), expectedTowerBaitSpotIds);
  assert.equal(rules.isCorrectSpot(1, "bait-between"), true);
  assert.equal(rules.isCorrectSpot(0, "center"), false);
});

test("places every role on the arena skeleton", () => {
  assert.deepEqual(
    rules.rolePlacements.flatMap((placement) => placement.roles).sort(),
    [...rules.roles].sort(),
  );
});

test("generates one stack in each role group", () => {
  const debuffs = rules.generateOpeningDebuffs(sequenceRandom([0, 0.99, 0.1]));

  assert.equal(debuffs.MT, "stack");
  assert.equal(debuffs.R2, "stack");
  assert.deepEqual(
    rules.roleGroups.support.filter((role) => debuffs[role] === "stack"),
    ["MT"],
  );
  assert.deepEqual(
    rules.roleGroups.dps.filter((role) => debuffs[role] === "stack"),
    ["R2"],
  );
});

test("assigns cones and spreads to opposite non-stack groups", () => {
  const supportSpread = rules.generateOpeningDebuffs(sequenceRandom([0.3, 0.3, 0]));
  const supportCone = rules.generateOpeningDebuffs(sequenceRandom([0.3, 0.3, 0.99]));

  assert.deepEqual(nonStackDebuffs(supportSpread, rules.roleGroups.support), [
    "spread",
    "spread",
    "spread",
  ]);
  assert.deepEqual(nonStackDebuffs(supportSpread, rules.roleGroups.dps), [
    "cone",
    "cone",
    "cone",
  ]);
  assert.deepEqual(nonStackDebuffs(supportCone, rules.roleGroups.support), [
    "cone",
    "cone",
    "cone",
  ]);
  assert.deepEqual(nonStackDebuffs(supportCone, rules.roleGroups.dps), [
    "spread",
    "spread",
    "spread",
  ]);
});

test("splits stack teams into Group A and non-stack teams into Group B", () => {
  const debuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };

  assert.deepEqual(rules.teamGroupsForOpeningDebuffs(debuffs), {
    A: [
      { id: "mt-h1", roles: ["MT", "H1"] },
      { id: "m2-r2", roles: ["M2", "R2"] },
    ],
    B: [
      { id: "ot-h2", roles: ["OT", "H2"] },
      { id: "m1-r1", roles: ["M1", "R1"] },
    ],
  });
});

test("Group B teams combine to two spreads and two cones from opening debuffs", () => {
  const debuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };
  const groupBRoles = rules.teamGroupsForOpeningDebuffs(debuffs).B.flatMap(
    (team) => team.roles,
  );

  assert.deepEqual(debuffCounts(selectDebuffs(debuffs, groupBRoles)), {
    cone: 2,
    spread: 2,
  });
});

test("starts role markers in the opening side layout", () => {
  assert.deepEqual(
    rules.rolePlacementsForStep(0).map((placement) => placement.spot),
    [
      "opening-support-1",
      "opening-support-2",
      "opening-support-3",
      "opening-support-4",
      "opening-dps-1",
      "opening-dps-2",
      "opening-dps-3",
      "opening-dps-4",
    ],
  );
});

test("moves role markers into the tower layout after the opening step", () => {
  assert.deepEqual(
    rules.rolePlacementsForStep(1).some((placement) => placement.roles.length > 1),
    true,
  );
});

test("shows two tower indicators for tower steps", () => {
  assert.deepEqual(rules.towerSpotsForStep(0), []);
  assert.deepEqual(rules.towerSpotsForStep(1), ["tower-left", "tower-right"]);
  assert.deepEqual(rules.towerSpotsForStep(3), ["tower-left", "tower-right"]);
});

test("labels tower sets as odd or even by tower order", () => {
  assert.equal(rules.towerSetNumberForStep(0), null);
  assert.equal(rules.towerSetNumberForStep(1), 1);
  assert.equal(rules.towerSetParityForStep(1), "odd");
  assert.equal(rules.towerSetNumberForStep(2), 2);
  assert.equal(rules.towerSetParityForStep(2), "even");
  assert.equal(rules.towerSetNumberForStep(4), 3);
  assert.equal(rules.towerSetParityForStep(4), "odd");
  assert.equal(rules.towerSetNumberForStep(5), 4);
  assert.equal(rules.towerSetParityForStep(5), "even");
});

test("assigns tower set responsibility to Group A and Group B", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6, 7, 8].map(rules.towerResponsibilityGroupForSet),
    ["A", "A", "A", "B", "B", "B", "B", "A"],
  );
  assert.equal(rules.towerResponsibilityGroupForSet(0), null);
  assert.equal(rules.towerResponsibilityGroupForSet(9), null);
});

test("counts each group's tower takes across the mechanic", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6, 7, 8].map(rules.towerTakeCountForSet),
    [1, 2, 3, 1, 2, 3, 4, 4],
  );
  assert.equal(rules.towerTakeCountForSet(0), null);
  assert.equal(rules.towerTakeCountForSet(9), null);
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 7, 8, 10, 11].map(rules.towerTakeCountForStep),
    [null, 1, 2, null, 3, 1, 2, 3, 4, 4],
  );
});

test("only refreshes debuffs before a group's fourth tower", () => {
  assert.deepEqual(
    [0, 1, 2, 4, 5, 7, 8, 10, 11, 12].map(
      rules.shouldGenerateTowerResolutionDebuffs,
    ),
    [false, true, true, true, true, true, true, false, false, false],
  );
});

test("generates bait casts on even tower steps and their following bait steps", () => {
  const casts = rules.generateBaitCasts(sequenceRandom([0, 0.99, 0.2, 0.8]));

  assert.deepEqual(casts[2], {
    id: "past",
    label: "Past's End",
    targetSpot: "bait-between",
  });
  assert.equal(casts[3], casts[2]);
  assert.deepEqual(casts[5], {
    id: "future",
    label: "Future's End",
    targetSpot: "bait-back",
  });
  assert.equal(casts[6], casts[5]);
  assert.deepEqual(casts[8], {
    id: "past",
    label: "Past's End",
    targetSpot: "bait-between",
  });
  assert.equal(casts[9], casts[8]);
  assert.deepEqual(casts[11], {
    id: "future",
    label: "Future's End",
    targetSpot: "bait-back",
  });
  assert.equal(casts[12], casts[11]);
  assert.equal(casts[0], undefined);
  assert.equal(casts[4], undefined);
});

test("uses bait cast text to choose the following bait-step correct spot", () => {
  const pastCasts = {
    3: { id: "past", label: "Past's End", targetSpot: "bait-between" },
  };
  const futureCasts = {
    3: { id: "future", label: "Future's End", targetSpot: "bait-back" },
  };

  assert.deepEqual(rules.correctSpotIdsForStep(3, pastCasts), ["bait-between"]);
  assert.equal(rules.isCorrectSpot(3, "bait-between", pastCasts), true);
  assert.equal(rules.isCorrectSpot(3, "bait-back", pastCasts), false);
  assert.deepEqual(rules.correctSpotIdsForStep(3, futureCasts), ["bait-back"]);
  assert.equal(rules.isCorrectSpot(3, "bait-back", futureCasts), true);
  assert.equal(rules.isCorrectSpot(3, "bait-between", futureCasts), false);
});

test("keeps tower steps permissive while bait cast only resolves on bait steps", () => {
  const casts = {
    2: { id: "past", label: "Past's End", targetSpot: "bait-between" },
  };

  assert.deepEqual(rules.baitTargetSpotForStep(2, casts), null);
  assert.deepEqual(rules.correctSpotIdsForStep(2, casts), expectedTowerBaitSpotIds);
});

test("derives responsible tower teams and roles from opening debuffs", () => {
  const debuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };

  assert.equal(rules.towerResponsibilityGroupForStep(1), "A");
  assert.deepEqual(rules.responsibleTeamsForTowerStep(1, debuffs), [
    { id: "mt-h1", roles: ["MT", "H1"] },
    { id: "m2-r2", roles: ["M2", "R2"] },
  ]);
  assert.deepEqual(rules.responsibleRolesForTowerStep(1, debuffs), [
    "MT",
    "H1",
    "M2",
    "R2",
  ]);
  assert.equal(rules.towerResponsibilityGroupForStep(5), "B");
  assert.deepEqual(rules.responsibleRolesForTowerStep(5, debuffs), [
    "OT",
    "H2",
    "M1",
    "R1",
  ]);
  assert.equal(rules.towerResponsibilityGroupForStep(3), null);
  assert.deepEqual(rules.responsibleRolesForTowerStep(3, debuffs), []);
});

test("assigns first tower set positions from opening debuffs", () => {
  const openingDebuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };

  assert.deepEqual(rules.roleSpotAssignmentsForTowerStep(1, openingDebuffs), {
    MT: "odd-tower-stack-left",
    H1: "odd-spread-even-spread",
    M2: "odd-tower-stack-right",
    R2: "odd-cone-even-spread",
    OT: "odd-stack-bait-left",
    H2: "odd-cone-bait",
    M1: "odd-stack-bait-right ",
    R1: "odd-stack-bait-right ",
  });
});

test("assigns second tower set default support-left and DPS-right positions", () => {
  const openingDebuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };
  const currentDebuffs = {
    MT: "cone",
    H1: "spread",
    M2: "cone",
    R2: "spread",
  };

  assert.deepEqual(
    rules.roleSpotAssignmentsForTowerStep(2, openingDebuffs, currentDebuffs),
    {
      MT: "even-cone-left",
      H1: "odd-cone-even-spread",
      M2: "even-cone-right",
      R2: "odd-spread-even-spread",
      OT: "even-melee-bait-left",
      H2: "even-cone-bait-left",
      M1: "even-melee-bait-right",
      R1: "even-cone-bait-right",
    },
  );
});

test("flexes tank and melee on second tower set when pairs match debuffs", () => {
  const openingDebuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };
  const currentDebuffs = {
    MT: "cone",
    H1: "cone",
    M2: "spread",
    R2: "spread",
  };

  assert.deepEqual(
    rules.roleSpotAssignmentsForTowerStep(2, openingDebuffs, currentDebuffs),
    {
      H1: "even-cone-left",
      MT: "even-cone-right",
      M2: "odd-cone-even-spread",
      R2: "odd-spread-even-spread",
      OT: "even-melee-bait-left",
      H2: "even-cone-bait-left",
      M1: "even-melee-bait-right",
      R1: "even-cone-bait-right",
    },
  );
});

test("flexes melee and ranged odd-stack positions when DPS both have stack", () => {
  const openingDebuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };
  const currentDebuffs = {
    MT: "spread",
    H1: "cone",
    M2: "stack",
    R2: "stack",
  };

  assert.deepEqual(
    rules.roleSpotAssignmentsForTowerStep(4, openingDebuffs, currentDebuffs),
    {
      M2: "odd-tower-stack-left",
      R2: "odd-tower-stack-right",
      MT: "odd-spread-even-spread",
      H1: "odd-cone-even-spread",
      OT: "odd-stack-bait-left",
      H2: "odd-cone-bait",
      M1: "odd-stack-bait-right ",
      R1: "odd-stack-bait-right ",
    },
  );
});

test("flexes tank and healer odd-stack positions when support both have stack", () => {
  const openingDebuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };
  const currentDebuffs = {
    MT: "stack",
    H1: "stack",
    M2: "spread",
    R2: "cone",
  };

  assert.deepEqual(
    rules.roleSpotAssignmentsForTowerStep(4, openingDebuffs, currentDebuffs),
    {
      H1: "odd-tower-stack-left",
      MT: "odd-tower-stack-right",
      M2: "odd-spread-even-spread",
      R2: "odd-cone-even-spread",
      OT: "odd-stack-bait-left",
      H2: "odd-cone-bait",
      M1: "odd-stack-bait-right ",
      R1: "odd-stack-bait-right ",
    },
  );
});

test("returns no role spot assignments for non-tower steps", () => {
  const openingDebuffs = {
    MT: "stack",
    H1: "spread",
    OT: "spread",
    H2: "spread",
    M1: "cone",
    R1: "cone",
    M2: "stack",
    R2: "cone",
  };

  assert.deepEqual(rules.roleSpotAssignmentsForTowerStep(3, openingDebuffs), {});
});

test("returns no tower set for non-tower steps", () => {
  assert.equal(rules.towerSetNumberForStep(0), null);
  assert.equal(rules.towerSetParityForStep(0), null);
  assert.equal(rules.towerSetNumberForStep(3), null);
  assert.equal(rules.towerSetParityForStep(3), null);
  assert.deepEqual(rules.generateTowerResolutionDebuffs(3, ["MT", "H1"]), {});
});

test("generates two spreads and two cones after odd towers resolve", () => {
  const debuffs = rules.generateTowerResolutionDebuffs(
    1,
    ["MT", "H1", "M1", "R1"],
    sequenceRandom([0.1, 0.4, 0.8]),
  );

  assert.deepEqual(Object.keys(debuffs), ["MT", "H1", "M1", "R1"]);
  assert.deepEqual(debuffCounts(debuffs), { cone: 2, spread: 2 });
});

test("generates two stacks, one spread, and one cone after even towers resolve", () => {
  const debuffs = rules.generateTowerResolutionDebuffs(
    2,
    ["OT", "H2", "M2", "R2"],
    sequenceRandom([0.1, 0.4, 0.8]),
  );

  assert.deepEqual(Object.keys(debuffs), ["OT", "H2", "M2", "R2"]);
  assert.deepEqual(debuffCounts(debuffs), { cone: 1, spread: 1, stack: 2 });
});

test("does not refresh debuffs after a group takes its fourth tower", () => {
  assert.deepEqual(
    rules.generateTowerResolutionDebuffs(10, ["OT", "H2", "M1", "R1"]),
    {},
  );
  assert.deepEqual(
    rules.generateTowerResolutionDebuffs(11, ["MT", "H1", "M2", "R2"]),
    {},
  );
});

test("requires exactly four tokens for tower resolution debuffs", () => {
  assert.throws(
    () => rules.generateTowerResolutionDebuffs(1, ["MT", "H1", "M1"]),
    /exactly four tokens/,
  );
});

test("labels tower-relative green squares for mechanic references", () => {
  assert.deepEqual(rules.validSpotIdsForStep(1), expectedTowerBaitSpotIds);
  assert.deepEqual(
    rules.validSpotsForStep(1).map((spot) => spot.label),
    [
      "Bait back",
      "Bait between",
      "Odd bait clockwise tower",
      "Odd bait counterclockwise tower",
      "Odd cone / even spread",
      "Odd spread / even spread",
      "Stack bait clockwise",
      "Stack bait counterclockwise",
      "Odd cone bait",
      "Even cone clockwise",
      "Even cone counterclockwise",
      "Even cone bait clockwise",
      "Even cone bait counterclockwise",
      "Even melee bait clockwise",
      "Even melee bait counterclockwise",
    ],
  );
});

test("generates rotated tower layouts with fixed tower spacing", () => {
  const baseLayout = rules.generateTowerLayout(sequenceRandom([0]));
  const rotatedLayout = rules.generateTowerLayout(sequenceRandom([0.25]));
  const baseDistance = distance(
    baseLayout.spots["tower-left"],
    baseLayout.spots["tower-right"],
  );
  const rotatedDistance = distance(
    rotatedLayout.spots["tower-left"],
    rotatedLayout.spots["tower-right"],
  );

  assert.equal(baseLayout.bossRotationDegrees, 0);
  assert.equal(rotatedLayout.bossRotationDegrees, 90);
  assert.equal(baseDistance, 30);
  assert.equal(rotatedDistance, 30);
  assert.deepEqual(baseLayout.spots["tower-left"], {
    id: "tower-left",
    label: "Clockwise tower",
    x: 35,
    y: 63,
  });
  assert.deepEqual(rotatedLayout.spots["tower-left"], {
    id: "tower-left",
    label: "Clockwise tower",
    x: 37,
    y: 35,
  });
});

test("generates one tower layout for each mechanic step", () => {
  const layouts = rules.generateTowerLayouts(sequenceRandom([0, 0.25, 0.5]));

  assert.equal(layouts.length, rules.mechanicSteps.length);
  assert.deepEqual(
    layouts.slice(0, 3).map((layout) => layout.bossRotationDegrees),
    [0, 90, 180],
  );
});

test("defines reusable tower and bait green squares", () => {
  assert.deepEqual(rules.validSpotIdsForStep(0), []);
  assert.deepEqual(rules.validSpotIdsForStep(1), expectedTowerBaitSpotIds);
  assert.deepEqual(rules.validSpotIdsForStep(3), rules.validSpotIdsForStep(1));
  assert.equal(rules.isCorrectSpot(1, "bait-between"), true);
  assert.equal(rules.isCorrectSpot(1, "opening-support-1"), false);
});

const expectedTowerBaitSpotIds = [
  "bait-back",
  "bait-between",
  "odd-tower-stack-left",
  "odd-tower-stack-right",
  "odd-cone-even-spread",
  "odd-spread-even-spread",
  "odd-stack-bait-left",
  "odd-stack-bait-right ",
  "odd-cone-bait",
  "even-cone-left",
  "even-cone-right",
  "even-cone-bait-left",
  "even-cone-bait-right",
  "even-melee-bait-left",
  "even-melee-bait-right",
];

function sequenceRandom(values) {
  let index = 0;

  return () => values[index++ % values.length];
}

function nonStackDebuffs(debuffs, group) {
  return group.filter((role) => debuffs[role] !== "stack").map((role) => debuffs[role]);
}

function debuffCounts(debuffs) {
  return Object.values(debuffs)
    .sort()
    .reduce((counts, debuff) => {
      counts[debuff] = (counts[debuff] || 0) + 1;
      return counts;
    }, {});
}

function selectDebuffs(debuffs, selectedRoles) {
  return Object.fromEntries(selectedRoles.map((role) => [role, debuffs[role]]));
}

function distance(first, second) {
  return Math.round(Math.hypot(first.x - second.x, first.y - second.y) * 1000) / 1000;
}
