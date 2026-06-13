const rules = window.patternCalloutRules;
const answerButtons = [...document.querySelectorAll(".answer-button")];
const bottomPatternOrb = document.querySelector("#bottom-pattern-orb");
const markerPattern = document.querySelector("#marker-pattern");
const nextButton = document.querySelector("#next-button");
const result = document.querySelector("#round-result");
const roundsPlayed = document.querySelector("#rounds-played");
const topPatternOrb = document.querySelector("#top-pattern-orb");
const winStreak = document.querySelector("#win-streak");

const orbAssets = {
  blue: {
    alt: "Blue orb",
    src: "../GravenImage3/orbs/thunder-orb.svg",
  },
  red: {
    alt: "Red orb",
    src: "../GravenImage3/orbs/fire-question-orb.svg",
  },
};

const markerAssets = {
  spread: {
    alt: "Spread marker",
    className: "marker-pattern marker-pattern-spread",
    count: 8,
    src: "../GravenImage3/markers/spread-marker.svg",
  },
  stack: {
    alt: "Stack marker",
    className: "marker-pattern marker-pattern-stack",
    count: 2,
    src: "../GravenImage3/markers/spread-ring-marker.svg",
  },
};

let game = {
  active: false,
  currentPattern: null,
  played: 0,
  selection: {
    markerPattern: "",
    position: "",
  },
  streak: 0,
};

function setPatternOrb(orb, asset, position) {
  orb.src = asset.src;
  orb.alt = asset.alt;
  orb.style.setProperty("--orb-x", `${position}%`);
}

function renderMarkerPattern(patternName) {
  const pattern = markerAssets[patternName];
  markerPattern.className = pattern.className;
  markerPattern.replaceChildren();

  for (let index = 0; index < pattern.count; index += 1) {
    const marker = document.createElement("img");
    marker.className = "pattern-marker";
    marker.src = pattern.src;
    marker.alt = pattern.alt;
    markerPattern.append(marker);
  }
}

function renderPattern(pattern) {
  setPatternOrb(topPatternOrb, orbAssets[pattern.topOrb], pattern.topOrbPosition);
  setPatternOrb(
    bottomPatternOrb,
    orbAssets[pattern.bottomOrb],
    pattern.bottomOrbPosition,
  );
  renderMarkerPattern(pattern.shownMarkerPattern);
}

function updateStats() {
  roundsPlayed.textContent = game.played;
  winStreak.textContent = game.streak;
}

function resetButtons() {
  answerButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove(
      "answer-button-correct",
      "answer-button-selected",
      "answer-button-wrong",
    );
  });
}

function selectButton(button) {
  const group = button.dataset.answerGroup;
  game.selection[group] = button.dataset.answerValue;

  answerButtons
    .filter((answerButton) => answerButton.dataset.answerGroup === group)
    .forEach((answerButton) => {
      answerButton.classList.toggle(
        "answer-button-selected",
        answerButton === button,
      );
    });
}

function labelForAnswer(answer) {
  return `${answer.markerPattern}, ${answer.position}`;
}

function finishRound() {
  const answer = rules.resolvePattern(game.currentPattern);
  const didWin = rules.isCorrectSelection(game.currentPattern, game.selection);

  game.active = false;
  game.played += 1;
  game.streak = didWin ? game.streak + 1 : 0;

  answerButtons.forEach((button) => {
    const group = button.dataset.answerGroup;
    const value = button.dataset.answerValue;
    const isCorrect = answer[group] === value;
    const isSelected = game.selection[group] === value;

    button.disabled = true;
    button.classList.toggle("answer-button-correct", isCorrect);
    button.classList.toggle("answer-button-wrong", isSelected && !isCorrect);
  });

  result.textContent = didWin
    ? `Correct: ${labelForAnswer(answer)}.`
    : `Answer: ${labelForAnswer(answer)}.`;
  updateStats();
}

function maybeScoreRound() {
  if (game.selection.markerPattern && game.selection.position) {
    finishRound();
  }
}

function startRound() {
  game.active = true;
  game.currentPattern = rules.randomPattern();
  game.selection = {
    markerPattern: "",
    position: "",
  };

  resetButtons();
  renderPattern(game.currentPattern);
  result.textContent = "Pick one from each side.";
}

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!game.active) {
      return;
    }

    selectButton(button);
    maybeScoreRound();
  });
});

nextButton.addEventListener("click", startRound);

startRound();
updateStats();
