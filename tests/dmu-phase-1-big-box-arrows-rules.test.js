const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../dmu-phase-1-big-box-arrows-rules.js");

test("defines the eight valid ordered arrow combinations", () => {
  assert.deepEqual(rules.arrowCombos.map(rules.comboKey), [
    "N+N",
    "E+E",
    "S+S",
    "W+W",
    "N+E",
    "E+S",
    "S+W",
    "W+N",
  ]);
});

test("weights mixed arrow combinations twice as often as same arrow combinations", () => {
  const counts = rules.weightedArrowCombos.reduce((result, combo) => {
    const key = rules.comboKey(combo);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  assert.equal(counts["N+N"], 1);
  assert.equal(counts["E+E"], 1);
  assert.equal(counts["S+S"], 1);
  assert.equal(counts["W+W"], 1);
  assert.equal(counts["N+E"], 2);
  assert.equal(counts["E+S"], 2);
  assert.equal(counts["S+W"], 2);
  assert.equal(counts["W+N"], 2);
});

test("removes the previous combo from the next random pool", () => {
  const availableKeys = rules.availableCombos("W+N").map(rules.comboKey);

  assert.equal(availableKeys.includes("W+N"), false);
  assert.equal(availableKeys.includes("N+E"), true);
});

test("validates same-arrow target boxes", () => {
  assert.equal(rules.isCorrectBox("N+N", 14, "N"), true);
  assert.equal(rules.isCorrectBox("N+N", 15, "N"), true);
  assert.equal(rules.isCorrectBox("N+N", 13, "N"), false);
});

test("validates direction-specific mixed-arrow target boxes", () => {
  assert.equal(rules.isCorrectBox("W+N", 12, "W"), true);
  assert.equal(rules.isCorrectBox("W+N", 13, "N"), true);
  assert.equal(rules.isCorrectBox("W+N", 13, "W"), false);
  assert.equal(rules.isCorrectBox("W+N", 12, "N"), false);
});

test("flips only displayed arrow order", () => {
  const timedArrows = [
    { direction: "W", seconds: 8 },
    { direction: "N", seconds: 5 },
  ];

  assert.deepEqual(
    rules.displayedArrows(timedArrows, false).map((arrow) => arrow.direction),
    ["W", "N"],
  );
  assert.deepEqual(
    rules.displayedArrows(timedArrows, true).map((arrow) => arrow.direction),
    ["N", "W"],
  );
  assert.deepEqual(
    rules.orderedClickArrows(timedArrows).map((arrow) => arrow.direction),
    ["N", "W"],
  );
});
