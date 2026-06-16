const rules = window.forsakenRules;
const roleButtons = [...document.querySelectorAll(".role-button")];
const selectedRoleLabel = document.querySelector("#selected-role-label");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const roundTimer = document.querySelector("#round-timer");
const timerCount = document.querySelector("#timer-count");
const timeline = document.querySelector("#mechanic-timeline");
const advanceStepButton = document.querySelector("#advance-step-button");
const roleMarkerLayer = document.querySelector("#role-marker-layer");
const towerLayer = document.querySelector("#tower-layer");
const spotTargetLayer = document.querySelector("#spot-target-layer");
const startButton = document.querySelector("#start-button");
const startOverlay = document.querySelector("#start-overlay");
const startOverlayMessage = startOverlay.querySelector("p");
const tryAgainButton = document.querySelector("#try-again-button");
const result = document.querySelector("#round-result");
const resultMessage = document.querySelector("#round-result-message");

const roleAssets = {
  H1: { number: "1", src: "../../Phase1/GravenImage3/roles/healer-role.svg" },
  H2: { number: "2", src: "../../Phase1/GravenImage3/roles/healer-role.svg" },
  M1: { number: "1", src: "../../Phase1/GravenImage3/roles/fist-role.svg" },
  M2: { number: "2", src: "../../Phase1/GravenImage3/roles/fist-role.svg" },
  MT: { number: "1", src: "../../Phase1/GravenImage3/roles/shield-role.svg" },
  OT: { number: "2", src: "../../Phase1/GravenImage3/roles/shield-role.svg" },
  R1: { number: "1", src: "../../Phase1/GravenImage3/roles/arrow-role.svg" },
  R2: { number: "2", src: "../../Phase1/GravenImage3/roles/arrow-role.svg" },
};

const debuffAssets = {
  cone: {
    alt: "Cone debuff",
    className: "debuff-icon debuff-icon-cone",
    src: "assets/cone-debuff.png",
  },
  spread: {
    alt: "Spread debuff",
    className: "debuff-icon debuff-icon-spread",
    src: "assets/spread-debuff.svg",
  },
  stack: {
    alt: "Stack debuff",
    className: "debuff-icon debuff-icon-stack",
    src: "../../Phase1/GravenImage3/markers/spread-ring-marker.svg",
  },
};

let game = {
  active: false,
  currentStepIndex: 0,
  played: 0,
  selectedRole: "",
  streak: 0,
  timerId: null,
  timeRemaining: rules.mechanicSteps[0].seconds,
};

function spotById(spotId) {
  return rules.arenaSpots.find((spot) => spot.id === spotId);
}

function setPosition(element, spot) {
  element.style.setProperty("--x", `${spot.x}%`);
  element.style.setProperty("--y", `${spot.y}%`);
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

function renderTimeline() {
  timeline.replaceChildren(
    ...rules.mechanicSteps.map((step, index) => {
      const item = document.createElement("li");
      const stepNumber = document.createElement("span");
      const label = document.createElement("span");
      const time = document.createElement("span");

      item.className = "timeline-step";
      item.classList.toggle("timeline-step-active", index === game.currentStepIndex);
      item.classList.toggle("timeline-step-complete", index < game.currentStepIndex);
      stepNumber.className = "timeline-step-index";
      stepNumber.textContent = index + 1;
      label.className = "timeline-step-label";
      label.textContent = step.label;
      time.className = "timeline-step-time";
      time.textContent = `${step.seconds}s`;

      item.append(stepNumber, label, time);
      return item;
    }),
  );
}

function renderRoleMarkers() {
  roleMarkerLayer.replaceChildren(
    ...rules.rolePlacements.map((placement) => {
      const spot = spotById(placement.spot);
      const asset = roleAssets[placement.role];
      const marker = document.createElement("div");
      const iconWrap = document.createElement("span");
      const icon = document.createElement("img");
      const number = document.createElement("span");
      const debuff = document.createElement("img");
      const debuffAsset = debuffAssets[placement.debuff];

      marker.className = "role-marker";
      marker.setAttribute("aria-label", `${placement.role} marker`);
      setPosition(marker, spot);

      iconWrap.className = "role-marker-icon";
      icon.src = asset.src;
      icon.alt = placement.role;
      number.className = "role-marker-number";
      number.textContent = asset.number;
      iconWrap.append(icon, number);

      debuff.className = debuffAsset.className;
      debuff.src = debuffAsset.src;
      debuff.alt = debuffAsset.alt;
      marker.append(iconWrap, debuff);

      return marker;
    }),
  );
}

function renderTowers() {
  towerLayer.replaceChildren(
    ...rules.towerSpotsForStep(game.currentStepIndex).map((spotId) => {
      const tower = document.createElement("div");
      const spot = spotById(spotId);

      tower.className = "tower-indicator";
      setPosition(tower, spot);
      return tower;
    }),
  );
}

function renderSpotTargets() {
  spotTargetLayer.replaceChildren(
    ...rules.arenaSpots.filter((spot) => !spot.id.startsWith("tower-")).map((spot) => {
      const button = document.createElement("button");
      button.className = "spot-target";
      button.type = "button";
      button.disabled = true;
      button.dataset.spot = spot.id;
      button.setAttribute("aria-label", `${spot.label} green square`);
      setPosition(button, spot);
      button.addEventListener("click", handleSpotClick);
      return button;
    }),
  );
}

function spotTargets() {
  return [...spotTargetLayer.querySelectorAll(".spot-target")];
}

function resetSpotTargets() {
  spotTargets().forEach((target) => {
    target.disabled = !game.active;
    target.classList.remove(
      "spot-target-correct",
      "spot-target-selected",
      "spot-target-wrong",
    );
  });
}

function revealCorrectSpot() {
  const step = rules.stepByIndex(game.currentStepIndex);

  spotTargets().forEach((target) => {
    target.classList.toggle(
      "spot-target-correct",
      target.dataset.spot === step.targetSpot,
    );
  });
}

function renderCurrentStep() {
  const step = rules.stepByIndex(game.currentStepIndex);

  game.timeRemaining = step.seconds;
  updateTimer();
  renderTimeline();
  renderTowers();
  resetSpotTargets();
}

function selectRole(role) {
  const wasActive = game.active;

  game.selectedRole = role;
  selectedRoleLabel.textContent = `: ${role}`;
  startOverlayMessage.textContent = "Start Game";
  startButton.disabled = false;

  roleButtons.forEach((button) => {
    const isSelected = button.dataset.role === role;
    button.classList.toggle("role-button-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });

  if (wasActive) {
    finishRound(false, `Role changed to ${role}.`);
  } else {
    result.hidden = true;
  }
}

function finishRound(didWin, message = "") {
  stopTimer();
  game.active = false;

  spotTargets().forEach((target) => {
    target.disabled = true;
  });

  if (didWin) {
    game.streak += 1;
    result.classList.add("round-result-win");
    resultMessage.textContent = message || "Correct";
    tryAgainButton.textContent = "Play Again";
  } else {
    game.streak = 0;
    result.classList.remove("round-result-win");
    resultMessage.textContent = message || "Try again";
    tryAgainButton.textContent = "Try Again";
  }

  updateStats();
  result.hidden = false;
}

function advanceStep() {
  game.currentStepIndex += 1;

  if (game.currentStepIndex >= rules.mechanicSteps.length) {
    finishRound(true, "Timeline complete.");
    return;
  }

  startStepTimer();
}

function previewNextStep() {
  stopTimer();
  result.hidden = true;
  game.currentStepIndex = (game.currentStepIndex + 1) % rules.mechanicSteps.length;

  if (game.active) {
    startStepTimer();
    return;
  }

  renderCurrentStep();
}

function startStepTimer() {
  stopTimer();
  renderCurrentStep();
  roundTimer.hidden = false;

  game.timerId = window.setInterval(() => {
    const step = rules.stepByIndex(game.currentStepIndex);

    game.timeRemaining -= 1;
    updateTimer();

    if (game.timeRemaining <= 0) {
      revealCorrectSpot();
      finishRound(false, `Time's up on ${step.label}.`);
    }
  }, 1000);
}

function startRound() {
  stopTimer();
  result.hidden = true;

  if (!game.selectedRole) {
    game.active = false;
    startOverlay.hidden = false;
    startOverlayMessage.textContent = "Choose your role first";
    startButton.disabled = true;
    resetSpotTargets();
    return;
  }

  game.active = true;
  game.currentStepIndex = 0;
  game.played += 1;
  startOverlay.hidden = true;
  updateStats();
  startStepTimer();
}

function handleSpotClick(event) {
  if (!game.active) {
    return;
  }

  const target = event.currentTarget;

  if (rules.isCorrectSpot(game.currentStepIndex, target.dataset.spot)) {
    target.classList.add("spot-target-selected");
    advanceStep();
    return;
  }

  target.classList.add("spot-target-wrong");
  revealCorrectSpot();
  finishRound(false, `Incorrect on ${rules.stepByIndex(game.currentStepIndex).label}.`);
}

roleButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    selectRole(button.dataset.role);
  });
});
startButton.addEventListener("click", startRound);
tryAgainButton.addEventListener("click", startRound);
advanceStepButton.addEventListener("click", previewNextStep);

renderRoleMarkers();
renderSpotTargets();
renderTimeline();
updateStats();
updateTimer();
startOverlay.hidden = false;
