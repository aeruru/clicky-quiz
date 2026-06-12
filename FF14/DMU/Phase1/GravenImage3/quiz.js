const rules = window.gravenImage3Rules;
const startButton = document.querySelector("#start-button");
const startOverlay = document.querySelector("#start-overlay");
const startOverlayMessage = startOverlay.querySelector("p");
const tryAgainButton = document.querySelector("#try-again-button");
const result = document.querySelector("#round-result");
const resultMessage = document.querySelector("#round-result-message");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const roleButtons = [...document.querySelectorAll(".role-button")];
const selectedRoleLabel = document.querySelector("#selected-role-label");
const lineOverlay = document.querySelector("#line-overlay");
const patternPreview = document.querySelector(".pattern-preview");
const roundTimer = document.querySelector("#round-timer");
const timerCount = document.querySelector("#timer-count");
const topPatternOrb = document.querySelector("#top-pattern-orb");
const bottomPatternOrb = document.querySelector("#bottom-pattern-orb");
const markerPattern = document.querySelector("#marker-pattern");
const boxTargets = [...document.querySelectorAll(".box-target")];
const roundSeconds = 7;

const orbAssets = {
  blue: {
    alt: "Blue orb",
    color: "blue",
    src: "orbs/thunder-orb.svg?v=orb-refresh",
  },
  red: {
    alt: "Red orb",
    color: "red",
    src: "orbs/fire-question-orb.svg?v=orb-refresh",
  },
};

const markerPatterns = {
  spread: {
    alt: "Spread marker",
    className: "marker-pattern marker-pattern-spread",
    count: 8,
    id: "spread",
    src: "markers/spread-marker.svg",
  },
  stack: {
    alt: "Stack marker",
    className: "marker-pattern marker-pattern-stack",
    count: 2,
    id: "stack",
    src: "markers/spread-ring-marker.svg",
  },
};

const lineConfigs = [
  {
    className: "line-overlay-a1",
    hiddenBoxes: [1, 6, 7, 12, 14, 16, 20, 18, 26, 28, 22, 24],
    id: "A1",
    label: "A1",
  },
  {
    className: "line-overlay-a2",
    hiddenBoxes: [1, 6, 7, 12, 14, 16, 20, 18, 26, 28, 22, 24],
    id: "A2",
    label: "A2",
  },
  {
    className: "line-overlay-a3",
    hiddenBoxes: [3, 4, 9, 10, 13, 15, 17, 19, 21, 23, 25, 27],
    id: "A3",
    label: "A3",
  },
  {
    className: "line-overlay-a4",
    hiddenBoxes: [3, 4, 9, 10, 13, 15, 17, 19, 21, 23, 25, 27],
    id: "A4",
    label: "A4",
  },
];

let game = {
  active: false,
  currentScenario: null,
  currentPattern: null,
  lineConfigIndex: 0,
  previousScenarioId: "",
  played: 0,
  selectedRole: "",
  streak: 0,
  timerId: null,
  timeRemaining: roundSeconds,
};

function currentLineConfig() {
  return lineConfigs[game.lineConfigIndex];
}

function boxNumber(box) {
  return Number(box.getAttribute("aria-label").replace("Box ", ""));
}

function boxByNumber(number) {
  return boxTargets.find((box) => boxNumber(box) === number);
}

function selectedRoleAsset() {
  const button = roleButtons.find((roleButton) => {
    return roleButton.dataset.role === game.selectedRole;
  });
  const icon = button?.querySelector("img");
  const number = button?.querySelector(".role-number");

  return icon
    ? {
        alt: game.selectedRole,
        number: number?.textContent || "",
        src: icon.getAttribute("src"),
      }
    : null;
}

function placeRoleIcon(box) {
  const asset = selectedRoleAsset();

  if (!asset) {
    return;
  }

  const marker = document.createElement("span");
  const icon = document.createElement("img");
  icon.alt = asset.alt;
  icon.src = asset.src;
  marker.className = "placed-role-icon";
  marker.append(icon);

  if (asset.number) {
    const number = document.createElement("span");
    number.className = "placed-role-number";
    number.textContent = asset.number;
    marker.append(number);
  }

  box.replaceChildren(marker);
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

function enableVisibleBoxes() {
  boxTargets.forEach((box) => {
    box.disabled = box.classList.contains("graven-spot-hidden");
  });
}

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
      revealCorrectBoxes();
      finishRound(false, `Time's up. ${mechanicSummary()}`);
    }
  }, 1000);
}

function selectRole(role) {
  game.selectedRole = role;
  selectedRoleLabel.textContent = `: ${role}`;
  startOverlayMessage.textContent = "Start Game";
  startButton.disabled = false;
  result.hidden = true;

  roleButtons.forEach((button) => {
    const isSelected = button.dataset.role === role;
    button.classList.toggle("role-button-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });

  if (game.active) {
    resetRoundView({ showStart: true });
  }
}

function renderLineConfig() {
  const config = currentLineConfig();
  const hiddenBoxes = new Set(config.hiddenBoxes);

  lineOverlay.setAttribute("class", `line-overlay ${config.className}`);
  boxTargets.forEach((box) => {
    box.classList.toggle("graven-spot-hidden", hiddenBoxes.has(boxNumber(box)));
  });

  if (game.active) {
    enableVisibleBoxes();
  }
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

function randomMarkerPattern(random = Math.random) {
  return random() < 0.5 ? markerPatterns.spread : markerPatterns.stack;
}

function oppositeMarkerPattern(markerPatternId) {
  return markerPatternId === "spread" ? "stack" : "spread";
}

function resolveMarkerPattern(topOrb, shownMarkerPattern) {
  return topOrb.color === "blue"
    ? shownMarkerPattern.id
    : oppositeMarkerPattern(shownMarkerPattern.id);
}

function renderMarkerPattern(pattern) {
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

function renderPattern() {
  const positions = randomOrbPositions();
  const topOrb = randomOrbAsset();
  const bottomOrb = randomOrbAsset();
  const markers = randomMarkerPattern();
  const resolvedMarkerPattern = resolveMarkerPattern(topOrb, markers);
  const lineRequirement = rules.resolveLineRequirement(bottomOrb.color);

  game.currentPattern = {
    bottomOrb: bottomOrb.color,
    bottomOrbPosition: positions.bottom,
    lineRequirement,
    resolvedMarkerPattern,
    shownMarkerPattern: markers.id,
    topOrb: topOrb.color,
    topOrbPosition: positions.top,
  };

  setPatternOrb(topPatternOrb, topOrb, positions.top);
  setPatternOrb(bottomPatternOrb, bottomOrb, positions.bottom);
  renderMarkerPattern(markers);
  patternPreview.hidden = false;
}

function generateRoundPattern() {
  game.lineConfigIndex = (game.lineConfigIndex + 1) % lineConfigs.length;
  renderLineConfig();
  renderPattern();
}

function resetRoundView({ showStart = false } = {}) {
  stopTimer();
  game.active = false;
  game.currentScenario = null;
  game.currentPattern = null;
  game.timeRemaining = roundSeconds;
  roundTimer.hidden = true;
  updateTimer();
  patternPreview.hidden = true;
  startOverlay.hidden = !showStart;
  startOverlayMessage.textContent = game.selectedRole
    ? "Start Game"
    : "Choose your role first";
  startButton.disabled = !game.selectedRole;
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
      placeRoleIcon(box);
    }
  });
}

function finishRound(didWin, message = "") {
  stopTimer();
  game.active = false;

  boxTargets.forEach((box) => {
    box.disabled = true;
  });

  if (didWin) {
    game.streak += 1;
    resultMessage.textContent = message || "You win";
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

function mechanicSummary(scenario = game.currentScenario) {
  const pattern = game.currentPattern;
  const markerCopy =
    pattern.resolvedMarkerPattern === "spread" ? "spread" : "stack";
  const lineCopy = pattern.lineRequirement === "out" ? "out of" : "in";

  return `${game.selectedRole} ${markerCopy}, ${lineCopy} purple.`;
}

function buildScenario() {
  return rules.scenarioForPattern({
    lineConfig: currentLineConfig().id,
    lineRequirement: game.currentPattern.lineRequirement,
    markerPattern: game.currentPattern.resolvedMarkerPattern,
    role: game.selectedRole,
  });
}

function startRound() {
  resetRoundView();

  if (!game.selectedRole) {
    startOverlay.hidden = false;
    startOverlayMessage.textContent = "Choose your role first";
    return;
  }

  generateRoundPattern();

  const scenario = buildScenario();

  if (!scenario) {
    patternPreview.hidden = true;
    startOverlay.hidden = false;
    startOverlayMessage.textContent = `${game.selectedRole} logic is not added yet`;
    return;
  }

  startOverlay.hidden = true;
  game.active = true;
  game.played += 1;
  game.currentScenario = scenario;
  game.previousScenarioId = scenario.id;
  updateStats();
  enableVisibleBoxes();
  startTimer();
}

function handleBoxClick(event) {
  if (!game.active || !game.currentScenario) {
    return;
  }

  const box = event.currentTarget;
  const clickedBox = boxNumber(box);

  if (rules.isCorrectBox(game.currentScenario, clickedBox)) {
    placeRoleIcon(box);
    box.classList.add("box-target-selected");
    finishRound(true, `Correct! ${mechanicSummary()}`);
    return;
  }

  placeRoleIcon(box);
  box.classList.add("box-target-wrong");
  revealCorrectBoxes();
  finishRound(false, `Incorrect. ${mechanicSummary()}`);
}

startButton.addEventListener("click", startRound);
tryAgainButton.addEventListener("click", () => {
  resetRoundView();
  startRound();
});
roleButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    selectRole(button.dataset.role);
  });
});
boxTargets.forEach((box) => {
  box.addEventListener("click", handleBoxClick);
});

resetRoundView({ showStart: true });
updateStats();
renderLineConfig();
patternPreview.hidden = true;
