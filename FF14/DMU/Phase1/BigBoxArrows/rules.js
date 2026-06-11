(function defineBigBoxArrowRules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.bigBoxArrowRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const arrowCombos = [
    ["N", "N"],
    ["E", "E"],
    ["S", "S"],
    ["W", "W"],
    ["N", "E"],
    ["E", "S"],
    ["S", "W"],
    ["W", "N"],
  ];

  const weightedArrowCombos = arrowCombos.flatMap((combo) =>
    combo[0] === combo[1] ? [combo] : [combo, combo],
  );

  const arrowAssets = {
    N: "arrows/arrow-up.svg",
    E: "arrows/arrow-right.svg",
    S: "arrows/arrow-down.svg",
    W: "arrows/arrow-left.svg",
  };

  const comboTargets = {
    "N+N": { any: [14, 15] },
    "E+E": { any: [2, 3] },
    "S+S": { any: [6, 7] },
    "W+W": { any: [10, 11] },
    "N+E": { N: 16, E: 1 },
    "E+S": { E: 4, S: 5 },
    "S+W": { S: 8, W: 9 },
    "W+N": { W: 12, N: 13 },
  };

  function comboKey(combo) {
    return combo.join("+");
  }

  function availableCombos(previousComboKey) {
    return weightedArrowCombos.filter(
      (combo) => comboKey(combo) !== previousComboKey,
    );
  }

  function displayedArrows(timedArrows, shouldFlip) {
    return shouldFlip ? [...timedArrows].reverse() : timedArrows;
  }

  function orderedClickArrows(timedArrows) {
    return [...timedArrows].sort((a, b) => a.seconds - b.seconds);
  }

  function isCorrectBox(comboKeyValue, clickedBox, direction) {
    const target = comboTargets[comboKeyValue];

    if (!target) {
      return false;
    }

    if (target.any) {
      return target.any.includes(clickedBox);
    }

    return target[direction] === clickedBox;
  }

  function randomCombo(previousComboKey, random = Math.random) {
    const options = availableCombos(previousComboKey);
    const pool = options.length > 0 ? options : weightedArrowCombos;

    return pool[Math.floor(random() * pool.length)];
  }

  return {
    arrowAssets,
    arrowCombos,
    availableCombos,
    comboKey,
    comboTargets,
    displayedArrows,
    isCorrectBox,
    orderedClickArrows,
    randomCombo,
    weightedArrowCombos,
  };
});
