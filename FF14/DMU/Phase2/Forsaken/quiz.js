const rules = window.forsakenRules;
const roleButtons = [...document.querySelectorAll(".role-button")];
const selectedRoleLabel = document.querySelector("#selected-role-label");
const hideTimelineDetails = document.querySelector("#hide-timeline-details");
const enableTimer = document.querySelector("#enable-timer");
const rotateTowers = document.querySelector("#rotate-towers");
const newRoundButton = document.querySelector("#new-round-button");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const roundTimer = document.querySelector("#round-timer");
const timerCount = document.querySelector("#timer-count");
const timeline = document.querySelector("#mechanic-timeline");
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
const resultDebuffSummary = document.querySelector("#result-debuff-summary");

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
  failureCount: 0,
  openingDebuffs: {},
  phase: "idle",
  pendingResolutionDebuffs: null,
  played: 0,
  revealAssignments: null,
  revealDebuffs: null,
  revealDebuffRoles: [],
  revealResolutionApplied: false,
  revealSelectedRole: "",
  revealWasWrong: false,
  selectedRole: "",
  streak: 0,
  timerId: null,
  revealTimerId: null,
  towerLayouts: rules.generateTowerLayouts(),
  timeRemaining: rules.mechanicSteps[0].seconds,
};

// Phase glossary:
// idle: no round is running; the user can choose a role and start.
// prep: Forsaken has started, opening debuffs are visible, and the user can study them.
// active: the user is choosing a green square for the current mechanic step.
// revealing/failed: a chosen spot is being resolved before Continue is pressed.
// complete: the timeline is finished and the final result is visible.

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

function timersEnabled() {
  return enableTimer.checked;
}

function towerLayoutOptions() {
  return { rotateTowers: rotateTowers.checked };
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

function shouldShowDebuffForRole(role) {
  if (isPrepPhase()) {
    return true;
  }

  return game.revealResolutionApplied && game.revealDebuffRoles.includes(role);
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
  scrollTimelineToCurrentStep();
}

function scrollTimelineToCurrentStep() {
  window.requestAnimationFrame(() => {
    const activeStep = timeline.querySelector(".timeline-step-active");

    if (!activeStep) {
      return;
    }

    timeline.scrollTop =
      activeStep.offsetTop - timeline.clientHeight / 2 + activeStep.clientHeight / 2;
  });
}

function renderRoleMarkers() {
  const placements = rolePlacementsForCurrentView();
  const duplicateCounts = rolePlacementDuplicateCounts(placements);
  const duplicateIndexes = {};

  roleMarkerLayer.replaceChildren(
    ...placements.map((placement) => {
      const duplicateIndex = duplicateIndexes[placement.spot] || 0;
      duplicateIndexes[placement.spot] = duplicateIndex + 1;

      return renderRoleMarker(placement, {
        duplicateCount: duplicateCounts[placement.spot] || 1,
        duplicateIndex,
      });
    }),
  );
}

function rolePlacementDuplicateCounts(placements) {
  return placements.reduce((counts, placement) => {
    counts[placement.spot] = (counts[placement.spot] || 0) + 1;
    return counts;
  }, {});
}

function rolePlacementsForCurrentView() {
  if (isIdlePhase() || isPrepPhase()) {
    return rules.rolePlacements.map((placement) => ({
      ...placement,
      showDebuff: placement.roles.some(shouldShowDebuffForRole),
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
    showDebuff: shouldShowDebuffForRole(role),
  }));
}

function renderRoleMarker(placement, duplicate = { duplicateCount: 1, duplicateIndex: 0 }) {
  const spot = offsetDuplicateSpot(spotById(placement.spot), duplicate);
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

function offsetDuplicateSpot(spot, duplicate) {
  if (duplicate.duplicateCount <= 1) {
    return spot;
  }

  const offsetStep = 3;
  const midpoint = (duplicate.duplicateCount - 1) / 2;
  const offset = (duplicate.duplicateIndex - midpoint) * offsetStep;

  return {
    ...spot,
    x: spot.x + offset,
    y: spot.y + offset,
  };
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
  const castStepIndex = baitCastStepIndexForCurrentView();
  const cast = castStepIndex === null ? null : game.baitCasts[castStepIndex];

  if (!cast) {
    baitCast.hidden = true;
    return;
  }

  baitCastLabel.textContent = cast.label;
  setPosition(
    baitCast,
    rules.spotForId("bait-back", game.towerLayouts[castStepIndex] || currentTowerLayout()),
  );
  baitCast.hidden = false;
}

function baitCastStepIndexForCurrentView() {
  if (
    isSolvingPhase() &&
    rules.towerSetParityForStep(game.currentStepIndex) === "even"
  ) {
    return game.currentStepIndex;
  }

  // During the post-odd-tower debuff preview, show the castbar for the even
  // tower that is about to start. Do not show it after even towers, because the
  // next step is the bait resolution and the cast text would reveal the answer.
  const nextStepIndex = game.currentStepIndex + 1;

  if (
    isRevealPhase() &&
    game.revealResolutionApplied &&
    rules.towerSetParityForStep(game.currentStepIndex) === "odd" &&
    rules.towerSetParityForStep(nextStepIndex) === "even"
  ) {
    return nextStepIndex;
  }

  return null;
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
  roundTimer.hidden = !isSolvingPhase() || !timersEnabled();
  startOverlay.hidden = !isIdlePhase() && !isPrepPhase();

  if (isIdlePhase()) {
    startOverlayMessage.textContent = "Choose your role first";
    startButton.hidden = true;
    startButton.disabled = true;
  }

  if (isPrepPhase()) {
    startOverlayMessage.textContent = "Review your debuffs";
    startButton.hidden = false;
    setKeybindButtonLabel(startButton, "Start Forsaken");
    startButton.disabled = false;
  }
}

function setKeybindButtonLabel(button, label) {
  button.replaceChildren(
    Object.assign(document.createElement("span"), {
      className: "button-label",
      textContent: label,
    }),
    Object.assign(document.createElement("span"), {
      className: "keybind-hint",
      textContent: "(spacebar)",
    }),
  );
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

  if (isIdlePhase()) {
    startRound();
  } else {
    finishRound(false, `Role changed to ${role}.`);
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
    resetResultCorner();
    resultDebuffSummary.hidden = true;
    game.streak += 1;
    result.classList.add("round-result-win");
    resultMessage.textContent = message || "Correct";
    tryAgainButton.hidden = false;
    tryAgainButton.textContent = "Play Again";
    continueButton.hidden = true;
  } else {
    resetResultCorner();
    resultDebuffSummary.hidden = true;
    game.streak = 0;
    game.currentStepIndex = 0;
    game.debuffs = {};
    game.failureCount = 0;
    game.openingDebuffs = {};
    game.pendingResolutionDebuffs = null;
    game.revealAssignments = null;
    game.revealDebuffs = null;
    game.revealDebuffRoles = [];
    game.revealResolutionApplied = false;
    game.revealWasWrong = false;
    result.classList.remove("round-result-win");
    resultMessage.textContent = message || "Try again";
    tryAgainButton.hidden = false;
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
  game.pendingResolutionDebuffs = null;
  game.revealDebuffRoles = [];
  game.revealResolutionApplied = false;
  game.revealSelectedRole = "";
  game.revealWasWrong = false;
  game.currentStepIndex += 1;

  if (game.currentStepIndex >= rules.mechanicSteps.length) {
    completeRound();
    return;
  }

  startStepTimer();
}

function completeRound() {
  stopTimer();
  stopRevealTimer();
  game.active = false;
  game.phase = "complete";

  spotTargets().forEach((target) => {
    target.disabled = true;
  });

  resetResultCorner();
  resultDebuffSummary.hidden = true;
  continueButton.hidden = true;
  tryAgainButton.hidden = false;
  tryAgainButton.textContent = "Try Again";

  if (game.failureCount === 0) {
    game.streak += 1;
    result.classList.add("round-result-win");
    resultMessage.textContent = "Correctly executed Forsaken.";
    tryAgainButton.textContent = "Play Again";
  } else {
    game.streak = 0;
    result.classList.remove("round-result-win");
    resultMessage.textContent =
      `Failed Forsaken: ${game.failureCount} ${game.failureCount === 1 ? "step" : "steps"} failed.`;
    tryAgainButton.textContent = "Try Again";
  }

  updateStats();
  result.hidden = false;
}

function startStepTimer() {
  stopTimer();
  stopRevealTimer();
  game.phase = "active";
  game.active = true;
  game.revealAssignments = null;
  game.revealDebuffs = null;
  game.pendingResolutionDebuffs = null;
  game.revealDebuffRoles = [];
  game.revealResolutionApplied = false;
  game.revealWasWrong = false;
  renderCurrentStep();

  if (!timersEnabled()) {
    return;
  }

  startCountdownTimer();
}

function startCountdownTimer() {
  stopTimer();
  game.timerId = window.setInterval(() => {
    game.timeRemaining -= 1;
    updateTimer();

    if (game.timeRemaining <= 0) {
      showTimeoutReveal();
    }
  }, 1000);
}

function startRound() {
  stopTimer();
  stopRevealTimer();
  result.hidden = true;
  resultDebuffSummary.hidden = true;
  tryAgainButton.hidden = false;

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
  game.failureCount = 0;
  game.phase = "prep";
  game.revealAssignments = null;
  game.revealDebuffs = null;
  game.pendingResolutionDebuffs = null;
  game.revealDebuffRoles = [];
  game.revealResolutionApplied = false;
  game.revealWasWrong = false;
  game.towerLayouts = rules.generateTowerLayouts(Math.random, towerLayoutOptions());
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
  positionResultPanelAwayFromTowers();
  renderResultDebuffSummary(game.revealDebuffRoles, game.revealDebuffs);
  result.classList.add("round-result-win");
  resultMessage.textContent = `Correct. ${selectedRoleSpotMessage()}`;
  tryAgainButton.hidden = true;
  continueButton.hidden = false;
  result.hidden = false;
}

function showTimeoutReveal() {
  game.failureCount += 1;
  prepareRevealState(false);
  renderCurrentStep();
  revealCorrectSpot(false);
  positionResultPanelAwayFromTowers();
  renderResultDebuffSummary(game.revealDebuffRoles, game.revealDebuffs);
  result.classList.remove("round-result-win");
  resultMessage.textContent = `Time's up. ${selectedRoleSpotMessage()}`;
  tryAgainButton.hidden = true;
  continueButton.hidden = false;
  result.hidden = false;
}

function showIncorrectReveal(message) {
  game.failureCount += 1;
  prepareRevealState(true);
  renderCurrentStep();
  revealCorrectSpot(true);
  positionResultPanelAwayFromTowers();
  renderResultDebuffSummary(game.revealDebuffRoles, game.revealDebuffs);
  game.active = false;
  game.phase = "failed";
  game.streak = 0;
  result.classList.remove("round-result-win");
  resultMessage.textContent = `${message} ${selectedRoleSpotMessage()}`;
  tryAgainButton.hidden = false;
  tryAgainButton.textContent = "Restart";
  continueButton.hidden = false;
  updateStats();
  result.hidden = false;
}

function prepareRevealState(wasWrong) {
  const assignments = roleAssignmentsForCurrentStep();
  const towerRoles = rolesInsideTowers(assignments);
  const resolutionDebuffs = rules.generateTowerResolutionDebuffs(
    game.currentStepIndex,
    towerRoles,
  );

  stopTimer();
  game.phase = wasWrong ? "failed" : "revealing";
  game.active = false;
  game.pendingResolutionDebuffs = resolutionDebuffs;
  game.revealAssignments = assignments;
  game.revealDebuffs = { ...game.debuffs };
  game.revealDebuffRoles = towerRoles;
  game.revealResolutionApplied = false;
  game.revealSelectedRole = game.selectedRole;
  game.revealWasWrong = wasWrong;
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

function continueReveal() {
  stopRevealTimer();
  game.revealDebuffs = { ...game.debuffs, ...(game.pendingResolutionDebuffs || {}) };
  game.debuffs = game.revealDebuffs;
  const hasNewDebuffs = Object.keys(game.pendingResolutionDebuffs || {}).length > 0;
  game.pendingResolutionDebuffs = null;
  game.revealResolutionApplied = true;
  result.hidden = true;
  tryAgainButton.hidden = false;
  continueButton.hidden = true;

  if (!hasNewDebuffs) {
    advanceStep();
    return;
  }

  // Keep this preview anchored to the resolved tower step. Advancing the step
  // here would render next-step assignments and leak the next answer.
  renderCurrentStep();
  revealCorrectSpot(game.revealWasWrong);
  positionResultPanelAwayFromTowers();
  result.hidden = true;
  resultDebuffSummary.hidden = true;
  game.revealTimerId = window.setTimeout(() => {
    advanceStep();
  }, 3000);
}

function selectedRoleSpotMessage() {
  const correctSpotId = selectedRoleCorrectSpotId();
  const spot = correctSpotId ? rules.spotForId(correctSpotId, currentTowerLayout()) : null;
  const spotLabel = spot?.label || "configured";

  return `${game.selectedRole} should be in the ${spotLabel} spot.`;
}

function renderResultDebuffSummary(roles, debuffs) {
  const orderedRoles = rules.roles.filter((role) => roles.includes(role));

  resultDebuffSummary.hidden = orderedRoles.length === 0;
  resultDebuffSummary.replaceChildren(
    ...orderedRoles.map((role) => resultDebuffCard(role, debuffs[role])),
  );
}

function resultDebuffCard(role, debuffType) {
  const asset = roleAssets[role];
  const debuffAsset = debuffAssets[debuffType];
  const card = document.createElement("div");
  const roleIcon = document.createElement("span");
  const icon = document.createElement("img");
  const number = document.createElement("span");

  card.className = "result-debuff-card";
  roleIcon.className = "result-role-icon";
  icon.src = asset.src;
  icon.alt = role;
  number.className = "result-role-number";
  number.textContent = asset.number;
  roleIcon.append(icon, number);
  card.append(roleIcon);

  if (debuffAsset) {
    const debuff = document.createElement("img");

    debuff.className = `result-debuff-icon ${debuffType === "cone" ? "result-debuff-icon-cone" : ""}`;
    debuff.src = debuffAsset.src;
    debuff.alt = debuffAsset.alt;
    card.append(debuff);
  }

  return card;
}

function positionResultPanelAwayFromTowers() {
  resetResultCorner();

  const towerSpots = rules.towerSpotPositionsForStep(
    game.currentStepIndex,
    currentTowerLayout(),
  );

  if (towerSpots.length === 0) {
    result.classList.add("round-result-corner-bottom-left");
    return;
  }

  const average = towerSpots.reduce(
    (total, spot) => ({
      x: total.x + spot.x / towerSpots.length,
      y: total.y + spot.y / towerSpots.length,
    }),
    { x: 0, y: 0 },
  );
  const vertical = average.y >= 50 ? "top" : "bottom";
  const horizontal = average.x >= 50 ? "left" : "right";

  result.classList.add(`round-result-corner-${vertical}-${horizontal}`);
}

function resetResultCorner() {
  result.classList.remove(
    "round-result-corner-top-left",
    "round-result-corner-top-right",
    "round-result-corner-bottom-left",
    "round-result-corner-bottom-right",
  );
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
  showIncorrectReveal("Incorrect.");
}

function handleKeyboardShortcut(event) {
  if (event.code !== "Space" || event.target.closest("input, select, textarea")) {
    return;
  }

  if (!startOverlay.hidden && !startButton.disabled) {
    event.preventDefault();
    handleStartButtonClick();
    return;
  }

  if (!result.hidden && !continueButton.hidden && !continueButton.disabled) {
    event.preventDefault();
    continueReveal();
  }
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
continueButton.addEventListener("click", continueReveal);
hideTimelineDetails.addEventListener("change", updateTimelineDetailMode);
enableTimer.addEventListener("change", () => {
  if (!timersEnabled()) {
    stopTimer();
  } else if (isSolvingPhase()) {
    startCountdownTimer();
  }

  renderOverlays();
});
document.addEventListener("keydown", handleKeyboardShortcut);
rotateTowers.addEventListener("change", () => {
  if (isIdlePhase() || isPrepPhase()) {
    game.towerLayouts = rules.generateTowerLayouts(Math.random, towerLayoutOptions());
    renderCurrentStep();
  }
});

updateTimelineDetailMode();
updateStats();
renderCurrentStep();
