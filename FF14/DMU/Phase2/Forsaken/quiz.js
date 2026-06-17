const rules = window.forsakenRules;
const roleButtons = [...document.querySelectorAll(".role-button")];
const selectedRoleLabel = document.querySelector("#selected-role-label");
const hideTimelineDetails = document.querySelector("#hide-timeline-details");
const newRoundButton = document.querySelector("#new-round-button");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const roundTimer = document.querySelector("#round-timer");
const timerCount = document.querySelector("#timer-count");
const timeline = document.querySelector("#mechanic-timeline");
const advanceStepButton = document.querySelector("#advance-step-button");
const roleMarkerLayer = document.querySelector("#role-marker-layer");
const towerLayer = document.querySelector("#tower-layer");
const spotTargetLayer = document.querySelector("#spot-target-layer");
const bossIndicator = document.querySelector(".boss-indicator");
const baitCast = document.querySelector("#bait-cast");
const baitCastLabel = document.querySelector("#bait-cast-label");
const startButton = document.querySelector("#start-button");
const startOverlay = document.querySelector("#start-overlay");
const startOverlayMessage = startOverlay.querySelector("p");
const tryAgainButton = document.querySelector("#try-again-button");
const continueButton = document.querySelector("#continue-button");
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
  baitCasts: rules.generateBaitCasts(),
  currentStepIndex: 0,
  debuffs: {},
  openingDebuffs: {},
  phase: "idle",
  played: 0,
  revealAssignments: null,
  revealDebuffs: null,
  revealSelectedRole: "",
  revealWasWrong: false,
  selectedRole: "",
  streak: 0,
  timerId: null,
  revealTimerId: null,
  towerLayouts: rules.generateTowerLayouts(),
  timeRemaining: rules.mechanicSteps[0].seconds,
};

function spotById(spotId) {
  return rules.spotForId(spotId, currentTowerLayout());
}

function currentTowerLayout() {
  return game.towerLayouts[game.currentStepIndex] || null;
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

function updateTimelineDetailMode() {
  timeline.classList.toggle("mechanic-timeline-compact", hideTimelineDetails.checked);
}

function stopTimer() {
  if (game.timerId) {
    window.clearInterval(game.timerId);
    game.timerId = null;
  }
}

function stopRevealTimer() {
  if (game.revealTimerId) {
    window.clearTimeout(game.revealTimerId);
    game.revealTimerId = null;
  }
}

function isIdlePhase() {
  return game.phase === "idle";
}

function isPrepPhase() {
  return game.phase === "prep";
}

function isSolvingPhase() {
  return game.phase === "active";
}

function isRevealPhase() {
  return game.phase === "revealing" || game.phase === "failed";
}

function selectedRoleCorrectSpotId() {
  if (rules.baitTargetSpotForStep(game.currentStepIndex, game.baitCasts)) {
    return rules.baitTargetSpotForStep(game.currentStepIndex, game.baitCasts);
  }

  return roleAssignmentsForCurrentStep()[game.selectedRole] || null;
}

function roleAssignmentsForCurrentStep() {
  if (game.revealAssignments) {
    return game.revealAssignments;
  }

  return rules.roleSpotAssignmentsForTowerStep(
    game.currentStepIndex,
    game.openingDebuffs,
    game.debuffs,
  );
}

function displayDebuffs() {
  return game.revealDebuffs || game.debuffs;
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
  const placements = rolePlacementsForCurrentView();

  roleMarkerLayer.replaceChildren(...placements.map(renderRoleMarker));
}

function rolePlacementsForCurrentView() {
  if (isIdlePhase() || isPrepPhase()) {
    return rules.rolePlacements.map((placement) => ({
      ...placement,
      showDebuff: isPrepPhase(),
    }));
  }

  if (!isRevealPhase()) {
    return [];
  }

  const assignments = roleAssignmentsForCurrentStep();
  const baitTargetSpot = rules.baitTargetSpotForStep(game.currentStepIndex, game.baitCasts);

  if (baitTargetSpot) {
    return [{ roles: rules.roles, spot: baitTargetSpot, showDebuff: false }];
  }

  return Object.entries(assignments).map(([role, spot]) => ({
    roles: [role],
    spot,
    showDebuff: true,
  }));
}

function renderRoleMarker(placement) {
  const spot = spotById(placement.spot);
  const primaryRole = placement.roles[0];
  const asset = roleAssets[primaryRole];
  const debuffType = displayDebuffs()[primaryRole] || placement.debuff;
  const marker = document.createElement("div");
  const iconWrap = document.createElement("span");
  const icon = document.createElement("img");
  const number = document.createElement("span");

  marker.className = "role-marker";
  marker.classList.toggle(
    "role-marker-selected-wrong",
    game.revealWasWrong && placement.roles.includes(game.selectedRole),
  );
  marker.setAttribute("aria-label", `${placement.roles.join(" and ")} marker`);
  setPosition(marker, spot);

  iconWrap.className = "role-marker-icon";
  icon.src = asset.src;
  icon.alt = primaryRole;
  number.className = "role-marker-number";
  number.textContent =
    placement.roles.length > 1 ? `+${placement.roles.length}` : asset.number;
  iconWrap.append(icon, number);
  marker.append(iconWrap);

  if (placement.showDebuff && debuffType) {
    const debuff = document.createElement("img");
    const debuffAsset = debuffAssets[debuffType];

    debuff.className = debuffAsset.className;
    debuff.src = debuffAsset.src;
    debuff.alt = debuffAsset.alt;
    marker.append(debuff);
  }

  return marker;
}

function renderBossIndicator() {
  const towerLayout = currentTowerLayout();
  const rotationDegrees = isIdlePhase() || isPrepPhase()
    ? 0
    : towerLayout?.bossRotationDegrees || 0;

  bossIndicator.style.setProperty("--boss-rotation", `${rotationDegrees}deg`);
}

function renderTowers() {
  towerLayer.replaceChildren(
    ...rules
      .towerSpotPositionsForStep(game.currentStepIndex, currentTowerLayout())
      .map((spot) => {
      const tower = document.createElement("div");

      tower.className = "tower-indicator";
      setPosition(tower, spot);
      return tower;
    }),
  );
}

function renderBaitCast() {
  const cast = game.baitCasts[game.currentStepIndex];

  if (!cast || rules.towerSetParityForStep(game.currentStepIndex) !== "even") {
    baitCast.hidden = true;
    return;
  }

  baitCastLabel.textContent = cast.label;
  setPosition(baitCast, rules.spotForId("bait-back", currentTowerLayout()));
  baitCast.hidden = false;
}

function renderSpotTargets() {
  const spots = rules.spotsForStep(game.currentStepIndex, currentTowerLayout());

  spotTargetLayer.replaceChildren(
    ...spots.map((spot) => {
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
    target.disabled = !isSolvingPhase();
    target.classList.remove(
      "spot-target-correct",
      "spot-target-selected",
      "spot-target-selected-role-correct",
      "spot-target-wrong",
    );
  });
}

function revealCorrectSpot(showSelectedRoleAsWrong = false) {
  const selectedRoleSpotId = selectedRoleCorrectSpotId();
  const correctSpotIds = selectedRoleSpotId
    ? [selectedRoleSpotId]
    : rules.correctSpotIdsForStep(game.currentStepIndex, game.baitCasts);

  spotTargets().forEach((target) => {
    const isSelectedRoleSpot = target.dataset.spot === selectedRoleSpotId;

    target.classList.toggle(
      "spot-target-correct",
      correctSpotIds.includes(target.dataset.spot) &&
        !(showSelectedRoleAsWrong && isSelectedRoleSpot),
    );
    target.classList.toggle(
      "spot-target-selected-role-correct",
      showSelectedRoleAsWrong && isSelectedRoleSpot,
    );
    target.disabled = true;
  });
}

function renderCurrentStep() {
  const step = rules.stepByIndex(game.currentStepIndex);

  game.timeRemaining = step.seconds;
  updateTimer();
  renderTimeline();
  renderBossIndicator();
  renderTowers();
  renderBaitCast();
  renderRoleMarkers();
  renderSpotTargets();
  resetSpotTargets();
  renderOverlays();
}

function renderOverlays() {
  roundTimer.hidden = !isSolvingPhase();
  startOverlay.hidden = !isIdlePhase() && !isPrepPhase();

  if (isIdlePhase()) {
    startOverlayMessage.textContent = game.selectedRole
      ? "Ready"
      : "Choose your role first";
    startButton.textContent = "Start";
    startButton.disabled = !game.selectedRole;
  }

  if (isPrepPhase()) {
    startOverlayMessage.textContent = "Review your debuffs";
    startButton.textContent = "Start Forsaken";
    startButton.disabled = false;
  }
}

function selectRole(role) {
  game.selectedRole = role;
  selectedRoleLabel.textContent = `: ${role}`;
  newRoundButton.disabled = false;

  roleButtons.forEach((button) => {
    const isSelected = button.dataset.role === role;
    button.classList.toggle("role-button-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected);
  });

  if (game.phase !== "idle") {
    finishRound(false, `Role changed to ${role}.`);
  } else {
    result.hidden = true;
    renderCurrentStep();
  }
}

function finishRound(didWin, message = "") {
  stopTimer();
  stopRevealTimer();
  game.active = false;
  game.phase = didWin ? "complete" : "idle";

  spotTargets().forEach((target) => {
    target.disabled = true;
  });

  if (didWin) {
    game.streak += 1;
    result.classList.add("round-result-win");
    resultMessage.textContent = message || "Correct";
    tryAgainButton.textContent = "Play Again";
    continueButton.hidden = true;
  } else {
    game.streak = 0;
    game.currentStepIndex = 0;
    game.debuffs = {};
    game.openingDebuffs = {};
    game.revealAssignments = null;
    game.revealDebuffs = null;
    game.revealWasWrong = false;
    result.classList.remove("round-result-win");
    resultMessage.textContent = message || "Try again";
    tryAgainButton.textContent = "Try Again";
    continueButton.hidden = true;
    renderCurrentStep();
  }

  updateStats();
  result.hidden = false;
}

function advanceStep() {
  stopRevealTimer();
  game.revealAssignments = null;
  game.revealDebuffs = null;
  game.revealSelectedRole = "";
  game.revealWasWrong = false;
  game.currentStepIndex += 1;

  if (game.currentStepIndex >= rules.mechanicSteps.length) {
    finishRound(true, "Timeline complete.");
    return;
  }

  startStepTimer();
}

function previewNextStep() {
  if (isRevealPhase()) {
    result.hidden = true;
    continueButton.hidden = true;
    advanceStep();
    return;
  }

  stopTimer();
  stopRevealTimer();
  result.hidden = true;
  game.currentStepIndex = (game.currentStepIndex + 1) % rules.mechanicSteps.length;
  game.phase = "idle";
  game.active = false;
  game.revealAssignments = null;
  game.revealDebuffs = null;
  game.revealWasWrong = false;

  if (game.active) {
    startStepTimer();
    return;
  }

  renderCurrentStep();
}

function startStepTimer() {
  stopTimer();
  stopRevealTimer();
  game.phase = "active";
  game.active = true;
  game.revealAssignments = null;
  game.revealDebuffs = null;
  game.revealWasWrong = false;
  renderCurrentStep();

  game.timerId = window.setInterval(() => {
    game.timeRemaining -= 1;
    updateTimer();

    if (game.timeRemaining <= 0) {
      showCorrectReveal();
    }
  }, 1000);
}

function startRound() {
  stopTimer();
  stopRevealTimer();
  result.hidden = true;

  if (!game.selectedRole) {
    game.phase = "idle";
    resetSpotTargets();
    return;
  }

  game.active = false;
  game.baitCasts = rules.generateBaitCasts();
  game.currentStepIndex = 0;
  game.openingDebuffs = rules.generateOpeningDebuffs();
  game.debuffs = { ...game.openingDebuffs };
  game.phase = "prep";
  game.revealAssignments = null;
  game.revealDebuffs = null;
  game.revealWasWrong = false;
  game.towerLayouts = rules.generateTowerLayouts();
  game.played += 1;
  updateStats();
  renderCurrentStep();
}

function startForsaken() {
  if (!isPrepPhase()) {
    return;
  }

  game.currentStepIndex = 1;
  startStepTimer();
}

function handleStartButtonClick() {
  if (isPrepPhase()) {
    startForsaken();
    return;
  }

  startRound();
}

function showCorrectReveal() {
  prepareRevealState(false);
  renderCurrentStep();
  revealCorrectSpot(false);
}

function showIncorrectReveal(message) {
  prepareRevealState(true);
  renderCurrentStep();
  revealCorrectSpot(true);
  game.active = false;
  game.phase = "failed";
  game.streak = 0;
  result.classList.remove("round-result-win");
  resultMessage.textContent = message;
  tryAgainButton.textContent = "Restart";
  continueButton.hidden = false;
  updateStats();
  result.hidden = false;
}

function prepareRevealState(wasWrong) {
  const assignments = roleAssignmentsForCurrentStep();
  const resolutionDebuffs = rules.generateTowerResolutionDebuffs(
    game.currentStepIndex,
    rolesInsideTowers(assignments),
  );

  stopTimer();
  game.phase = wasWrong ? "failed" : "revealing";
  game.active = false;
  game.revealAssignments = assignments;
  game.revealDebuffs = { ...game.debuffs, ...resolutionDebuffs };
  game.revealSelectedRole = game.selectedRole;
  game.revealWasWrong = wasWrong;
  game.debuffs = game.revealDebuffs;
}

function rolesInsideTowers(assignments) {
  return Object.entries(assignments)
    .filter(([, spotId]) => spotId === "tower-left" || spotId === "tower-right" || isInsideTowerSpot(spotId))
    .map(([role]) => role);
}

function isInsideTowerSpot(spotId) {
  return [
    "odd-tower-stack-left",
    "odd-tower-stack-right",
    "odd-cone-even-spread",
    "odd-spread-even-spread",
    "even-cone-left",
    "even-cone-right",
  ].includes(spotId);
}

function continueAfterIncorrect() {
  result.hidden = true;
  continueButton.hidden = true;
  advanceStep();
}

function correctSpotExplanation() {
  const step = rules.stepByIndex(game.currentStepIndex);
  const correctSpotId = selectedRoleCorrectSpotId();
  const spot = correctSpotId ? rules.spotForId(correctSpotId, currentTowerLayout()) : null;
  const baitCastTarget = rules.baitTargetSpotForStep(game.currentStepIndex, game.baitCasts);

  if (baitCastTarget) {
    const cast = game.baitCasts[game.currentStepIndex];
    return `${cast.label} sends everyone to ${spot.label}.`;
  }

  if (!spot) {
    return `${game.selectedRole} does not have a configured spot for ${step.label} yet.`;
  }

  const debuff = game.debuffs[game.selectedRole];
  return `${game.selectedRole} had ${debuff}, so the correct spot for ${step.label} was ${spot.label}.`;
}

function handleSpotClick(event) {
  if (!game.active) {
    return;
  }

  const target = event.currentTarget;
  const correctSpotId = selectedRoleCorrectSpotId();

  if (target.dataset.spot === correctSpotId) {
    target.classList.add("spot-target-selected");
    showCorrectReveal();
    return;
  }

  target.classList.add("spot-target-wrong");
  showIncorrectReveal(`Incorrect. ${correctSpotExplanation()}`);
}

roleButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    selectRole(button.dataset.role);
  });
});
newRoundButton.addEventListener("click", startRound);
startButton.addEventListener("click", handleStartButtonClick);
tryAgainButton.addEventListener("click", startRound);
continueButton.addEventListener("click", continueAfterIncorrect);
advanceStepButton.addEventListener("click", previewNextStep);
hideTimelineDetails.addEventListener("change", updateTimelineDetailMode);

updateTimelineDetailMode();
updateStats();
renderCurrentStep();
