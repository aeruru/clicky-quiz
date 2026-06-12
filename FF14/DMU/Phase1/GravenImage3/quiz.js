const rules = window.gravenImage3Rules;
const startButton = document.querySelector("#start-button");
const startOverlay = document.querySelector("#start-overlay");
const tryAgainButton = document.querySelector("#try-again-button");
const result = document.querySelector("#round-result");
const resultMessage = document.querySelector("#round-result-message");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const cycleLinesButton = document.querySelector("#cycle-lines-button");
const lineConfigLabel = document.querySelector("#line-config-label");
const lineOverlay = document.querySelector("#line-overlay");
const rerollPatternButton = document.querySelector("#reroll-pattern-button");
const topPatternOrb = document.querySelector("#top-pattern-orb");
const bottomPatternOrb = document.querySelector("#bottom-pattern-orb");
const boxTargets = [...document.querySelectorAll(".box-target")];

const orbAssets = {
  blue: {
    alt: "Blue orb",
    src: "orbs/thunder-orb.svg?v=orb-refresh",
  },
  red: {
    alt: "Red orb",
    src: "orbs/fire-question-orb.svg?v=orb-refresh",
  },
};

const lineConfigs = [
  {
    className: "line-overlay-diagonal-a",
    label: "Diagonal A",
  },
  {
    className: "line-overlay-diagonal-b",
    label: "Diagonal B",
  },
  {
    className: "line-overlay-rotated-a",
    label: "Rotated A",
  },
  {
    className: "line-overlay-rotated-b",
    label: "Rotated B",
  },
];

let game = {
  active: false,
  currentScenario: null,
  lineConfigIndex: 0,
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
    box.textContent = boxNumber(box);
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

function renderLineConfig() {
  const config = lineConfigs[game.lineConfigIndex];

  lineOverlay.setAttribute("class", `line-overlay ${config.className}`);
  lineConfigLabel.textContent = config.label;
}

function cycleLineConfig() {
  game.lineConfigIndex = (game.lineConfigIndex + 1) % lineConfigs.length;
  renderLineConfig();
}

function randomOrbPositions(random = Math.random) {
  const first = 18 + random() * 64;
  const secondCandidates =
    first < 50
      ? [Math.max(first + 28, 54), 82]
      : [18, Math.min(first - 28, 46)];

  return {
    top: first,
    bottom:
      secondCandidates[0] + random() * (secondCandidates[1] - secondCandidates[0]),
  };
}

function randomOrbAsset(random = Math.random) {
  return random() < 0.5 ? orbAssets.red : orbAssets.blue;
}

function setPatternOrb(orb, asset, position) {
  orb.src = asset.src;
  orb.alt = asset.alt;
  orb.style.setProperty("--orb-x", `${position}%`);
}

function renderPattern() {
  const positions = randomOrbPositions();
  const topOrb = randomOrbAsset();
  const bottomOrb = randomOrbAsset();

  setPatternOrb(topPatternOrb, topOrb, positions.top);
  setPatternOrb(bottomPatternOrb, bottomOrb, positions.bottom);
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
  renderPattern();

  const scenario = rules.randomScenario(game.previousScenarioId);
  if (!scenario) {
    startOverlay.hidden = false;
    return;
  }

  startOverlay.hidden = true;
  game.active = true;
  game.played += 1;
  game.currentScenario = scenario;
  game.previousScenarioId = scenario.id;
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
cycleLinesButton.addEventListener("click", cycleLineConfig);
rerollPatternButton.addEventListener("click", renderPattern);
boxTargets.forEach((box) => {
  box.addEventListener("click", handleBoxClick);
});

resetRoundView();
updateStats();
renderLineConfig();
renderPattern();
