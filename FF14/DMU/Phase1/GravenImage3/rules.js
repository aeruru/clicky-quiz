(function defineGravenImage3Rules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.gravenImage3Rules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const scenarios = [];

  function availableScenarios(previousScenarioId) {
    return scenarios.filter((scenario) => scenario.id !== previousScenarioId);
  }

  function isCorrectBox(scenario, clickedBox) {
    return scenario.correctBoxes.includes(clickedBox);
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
    isCorrectBox,
    randomScenario,
    scenarios,
  };
});
