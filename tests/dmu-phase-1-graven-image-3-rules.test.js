const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../FF14/DMU/Phase1/GravenImage3/rules.js");

test("starts without configured Graven 3 Thunder + Fire scenarios", () => {
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
