const rules = window.gravenImage3Rules;
const startButton = document.querySelector("#start-button");
const startOverlay = document.querySelector("#start-overlay");
const tryAgainButton = document.querySelector("#try-again-button");
const result = document.querySelector("#round-result");
const resultMessage = document.querySelector("#round-result-message");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const rotateArena = document.querySelector("#rotate-arena");
const arenaRotator = document.querySelector("#arena-rotator");
const mechanicTitle = document.querySelector("#mechanic-title");
const mechanicCopy = document.querySelector("#mechanic-copy");
const boxTargets = [...document.querySelectorAll(".box-target")];

let game = {
  active: false,
  currentScenario: null,
  previousScenarioId: "",
  played: 0,
  streak: 0,
};

function boxNumber(box) {
  return Number(box.getAttribute("aria-label").replace("Box ", ""));
}

function boxByNumber(number) {
  return boxTargets.find((box) => boxNumber(box) === number);
}

function resetBoxes() {
  boxTargets.forEach((box) => {
    box.disabled = true;
    box.textContent = "";
    box.classList.remove(
      "box-target-selected",
      "box-target-wrong",
      "box-target-correct",
    );
  });
}

function updateStats() {
  roundsPlayed.textContent = game.played;
  winStreak.textContent = game.streak;
}

function setMechanicCopy(title, copy) {
  mechanicTitle.textContent = title;
  mechanicCopy.textContent = copy;
}

function resetRoundView() {
  game.active = false;
  game.currentScenario = null;
  result.hidden = true;
  result.classList.remove("round-result-win");
  tryAgainButton.textContent = "Try Again";
  resetBoxes();
}

function revealCorrectBoxes() {
  if (!game.currentScenario) {
    return;
  }

  game.currentScenario.correctBoxes.forEach((number) => {
    const box = boxByNumber(number);
    if (box) {
      box.classList.add("box-target-correct");
    }
  });
}

function finishRound(didWin, message = "") {
  game.active = false;

  boxTargets.forEach((box) => {
    box.disabled = true;
  });

  if (didWin) {
    game.streak += 1;
    resultMessage.textContent = "You win";
    result.classList.add("round-result-win");
    tryAgainButton.textContent = "Play Again";
  } else {
    game.streak = 0;
    resultMessage.textContent = message || "Try again";
    result.classList.remove("round-result-win");
    tryAgainButton.textContent = "Try Again";
  }

  updateStats();
  result.hidden = false;
}

function startRound() {
  resetRoundView();

  const scenario = rules.randomScenario(game.previousScenarioId);
  if (!scenario) {
    setMechanicCopy(
      "Rules pending",
      "The Graven 3 Thunder + Fire arena is ready. Add scenarios to rules.js to make this playable.",
    );
    startOverlay.hidden = false;
    return;
  }

  startOverlay.hidden = true;
  game.active = true;
  game.played += 1;
  game.currentScenario = scenario;
  game.previousScenarioId = scenario.id;

  setMechanicCopy(scenario.title, scenario.prompt);
  updateStats();
  boxTargets.forEach((box) => {
    box.disabled = false;
  });
}

function handleBoxClick(event) {
  if (!game.active || !game.currentScenario) {
    return;
  }

  const box = event.currentTarget;
  const clickedBox = boxNumber(box);

  if (rules.isCorrectBox(game.currentScenario, clickedBox)) {
    box.classList.add("box-target-selected");
    finishRound(true);
    return;
  }

  box.classList.add("box-target-wrong");
  revealCorrectBoxes();
  finishRound(false, "Wrong spot. Try again");
}

startButton.addEventListener("click", startRound);
tryAgainButton.addEventListener("click", startRound);
rotateArena.addEventListener("change", () => {
  arenaRotator.classList.toggle("arena-rotator-d-north", rotateArena.checked);
});
boxTargets.forEach((box) => {
  box.addEventListener("click", handleBoxClick);
});

resetRoundView();
updateStats();
