const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../FF14/DMU/Phase1/PatternCallouts/rules.js");

test("blue top orb keeps the shown spread or stack pattern", () => {
  assert.equal(rules.resolveMarkerPattern("blue", "spread"), "spread");
  assert.equal(rules.resolveMarkerPattern("blue", "stack"), "stack");
});

test("red top orb flips the shown spread or stack pattern", () => {
  assert.equal(rules.resolveMarkerPattern("red", "spread"), "stack");
  assert.equal(rules.resolveMarkerPattern("red", "stack"), "spread");
});

test("bottom orb resolves in or out", () => {
  assert.equal(rules.resolvePosition("blue"), "out");
  assert.equal(rules.resolvePosition("red"), "in");
});

test("validates a complete callout selection", () => {
  const pattern = {
    bottomOrb: "blue",
    shownMarkerPattern: "spread",
    topOrb: "red",
  };

  assert.equal(
    rules.isCorrectSelection(pattern, {
      markerPattern: "stack",
      position: "out",
    }),
    true,
  );
  assert.equal(
    rules.isCorrectSelection(pattern, {
      markerPattern: "spread",
      position: "out",
    }),
    false,
  );
});
