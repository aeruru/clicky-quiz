const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../FF14/DMU/Phase2/Forsaken/rules.js");

test("defines the Forsaken role set", () => {
  assert.deepEqual(rules.roles, ["MT", "H1", "M1", "R1", "OT", "H2", "M2", "R2"]);
});

test("defines the thirteen Forsaken timeline steps", () => {
  assert.deepEqual(
    rules.mechanicSteps.map((step) => step.label),
    [
      "Prep",
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

test("checks the placeholder correct spot for a step", () => {
  assert.equal(rules.isCorrectSpot(0, "center"), true);
  assert.equal(rules.isCorrectSpot(0, "north"), false);
});

test("places every role on the arena skeleton", () => {
  assert.deepEqual(
    rules.rolePlacements.map((placement) => placement.role),
    rules.roles,
  );
});

test("uses stack, cone, and spread debuffs in the skeleton", () => {
  assert.deepEqual(
    [...new Set(rules.rolePlacements.map((placement) => placement.debuff))].sort(),
    ["cone", "spread", "stack"],
  );
});

test("shows two tower indicators for tower steps", () => {
  assert.deepEqual(rules.towerSpotsForStep(1), ["tower-left", "tower-right"]);
  assert.deepEqual(rules.towerSpotsForStep(3), []);
});
