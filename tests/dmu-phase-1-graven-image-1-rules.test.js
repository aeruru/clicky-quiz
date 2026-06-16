const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../FF14/DMU/Phase1/GravenImage1/rules.js");

test("truth keeps the shown spread or stack pattern", () => {
  assert.equal(rules.resolveMarkerPattern("spread", "truth"), "spread");
  assert.equal(rules.resolveMarkerPattern("stack", "truth"), "stack");
});

test("lie flips the shown spread or stack pattern", () => {
  assert.equal(rules.resolveMarkerPattern("spread", "lie"), "stack");
  assert.equal(rules.resolveMarkerPattern("stack", "lie"), "spread");
});

test("parses screenshot names into quiz patterns", () => {
  assert.deepEqual(
    rules.patternFromImageFile("iaf-stack-lie-out-2.png"),
    {
      id: "iaf-stack-lie-out-2",
      imageAlt: "Ice and fire stack lie out pattern",
      imageSrc: "patterns/iaf-stack-lie-out-2.png",
      mechanic: "iaf",
      position: "out",
      shownMarkerPattern: "stack",
      truthState: "lie",
      variant: 2,
    },
  );
});

test("validates a complete callout selection", () => {
  const pattern = rules.patternFromImageFile("iaf-spread-lie-out-1.png");

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

test("exposes one quiz pattern for every configured screenshot", () => {
  assert.equal(rules.patterns.length, 15);
  assert.equal(
    rules.patterns.every((pattern) => pattern.imageSrc.endsWith(".png")),
    true,
  );
});

test("groups screenshots by their quiz pattern", () => {
  const groupCounts = rules.patternGroups.reduce((result, group) => {
    result[group.id] = group.patterns.length;
    return result;
  }, {});

  assert.deepEqual(groupCounts, {
    "spread+lie+in": 2,
    "spread+lie+out": 3,
    "spread+truth+in": 2,
    "spread+truth+out": 1,
    "stack+lie+in": 2,
    "stack+lie+out": 2,
    "stack+truth+out": 3,
  });
});

test("randomly picks a pattern group before picking a screenshot", () => {
  const pattern = rules.randomPattern(() => 0.5);

  assert.equal(rules.patternGroupKey(pattern), "spread+truth+out");
});

test("does not repeat the same screenshot twice in a row", () => {
  const pattern = rules.randomPattern("iaf-spread-truth-out-1", () => 0.5);

  assert.notEqual(pattern.id, "iaf-spread-truth-out-1");
});
