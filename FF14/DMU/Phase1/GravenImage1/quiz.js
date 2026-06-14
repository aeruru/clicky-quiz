const rules = window.patternCalloutRules;
const answerButtons = [...document.querySelectorAll(".answer-button")];
const nextButton = document.querySelector("#next-button");
const patternScreenshot = document.querySelector("#pattern-screenshot");
const result = document.querySelector("#round-result");
const roundsPlayed = document.querySelector("#rounds-played");
const roundTimer = document.querySelector("#round-timer");
const timerCount = document.querySelector("#timer-count");
const winStreak = document.querySelector("#win-streak");
const roundSeconds = 7;

let game = {
  active: false,
  currentPattern: null,
  played: 0,
  selection: {
    markerPattern: "",
    position: "",
  },
  streak: 0,
  timerId: null,
  timeRemaining: roundSeconds,
};

function updateStats() {
  roundsPlayed.textContent = game.played;
  winStreak.textContent = game.streak;
}

function updateTimer() {
  timerCount.textContent = game.timeRemaining;
}

function stopTimer() {
  if (game.timerId) {
    window.clearInterval(game.timerId);
    game.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  game.timeRemaining = roundSeconds;
  roundTimer.hidden = false;
  updateTimer();

  game.timerId = window.setInterval(() => {
    game.timeRemaining -= 1;
    updateTimer();

    if (game.timeRemaining <= 0) {
      finishRound(false, "Time's up.");
    }
  }, 1000);
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

function renderPattern(pattern) {
  patternScreenshot.src = pattern.imageSrc;
  patternScreenshot.alt = pattern.imageAlt;
}

function finishRound(didWin = rules.isCorrectSelection(game.currentPattern, game.selection), prefix = "") {
  if (!game.active) {
    return;
  }

  const answer = rules.resolvePattern(game.currentPattern);

  stopTimer();
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
    : `${prefix ? `${prefix} ` : ""}Answer: ${labelForAnswer(answer)}.`;
  updateStats();
}

function maybeScoreRound() {
  if (game.selection.markerPattern && game.selection.position) {
    finishRound();
  }
}

function startRound() {
  stopTimer();
  game.active = true;
  game.currentPattern = rules.randomPattern();
  game.selection = {
    markerPattern: "",
    position: "",
  };

  resetButtons();
  renderPattern(game.currentPattern);
  result.textContent = "Pick spread or stack, then in or out.";
  startTimer();
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
