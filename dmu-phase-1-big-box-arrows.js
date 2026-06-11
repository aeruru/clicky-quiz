const rules = window.bigBoxArrowRules;
const startButton = document.querySelector("#start-button");
const startOverlay = document.querySelector("#start-overlay");
const tryAgainButton = document.querySelector("#try-again-button");
const result = document.querySelector("#round-result");
const resultMessage = document.querySelector("#round-result-message");
const roundsPlayed = document.querySelector("#rounds-played");
const winStreak = document.querySelector("#win-streak");
const flipArrows = document.querySelector("#flip-arrows");
const boxTargets = [...document.querySelectorAll(".box-target")];

const arrowSlots = [
  {
    image: document.querySelector("#first-arrow-image"),
    timer: document.querySelector("#first-arrow-timer"),
  },
  {
    image: document.querySelector("#second-arrow-image"),
    timer: document.querySelector("#second-arrow-timer"),
  },
];

let game = {
  active: false,
  selectedBoxes: new Set(),
  timedArrows: [],
  comboKey: "",
  previousComboKey: "",
  clickStep: 0,
  timerId: null,
  played: 0,
  streak: 0,
};

function buildTimedArrows(combo) {
  const timers = Math.random() < 0.5 ? [5, 8] : [8, 5];

  return combo.map((direction, index) => ({
    direction,
    seconds: timers[index],
    endTime: 0,
    asset: rules.arrowAssets[direction],
  }));
}

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
    box.classList.remove("box-target-selected", "box-target-wrong");
  });
}

function resetRoundView() {
  clearInterval(game.timerId);
  game.timerId = null;
  game.active = false;
  game.selectedBoxes.clear();
  game.clickStep = 0;
  game.comboKey = "";
  result.hidden = true;
  result.classList.remove("round-result-win");
  tryAgainButton.textContent = "Try Again";
  resetBoxes();
  arrowSlots.forEach((slot) => {
    slot.image.removeAttribute("src");
    slot.image.alt = "";
    slot.image.hidden = true;
    slot.timer.textContent = "--";
  });
}

function updateStats() {
  roundsPlayed.textContent = game.played;
  winStreak.textContent = game.streak;
}

function displayedArrows() {
  return rules.displayedArrows(game.timedArrows, flipArrows.checked);
}

function renderArrowPanel() {
  displayedArrows().forEach((arrow, index) => {
    const slot = arrowSlots[index];
    slot.image.src = arrow.asset;
    slot.image.alt = `${arrow.direction} arrow`;
    slot.image.hidden = false;
    slot.timer.textContent = `${arrow.seconds}s`;
  });
}

function orderedClickArrows() {
  return rules.orderedClickArrows(game.timedArrows);
}

function randomCombo() {
  return rules.randomCombo(game.previousComboKey);
}

function isCorrectBox(box, arrow) {
  const clickedBox = boxNumber(box);
  return rules.isCorrectBox(game.comboKey, clickedBox, arrow.direction);
}

function updateTimers() {
  const now = Date.now();

  displayedArrows().forEach((arrow, index) => {
    const remaining = Math.max(0, (arrow.endTime - now) / 1000);
    arrowSlots[index].timer.textContent = `${Math.ceil(remaining)}s`;
  });

  const requiredArrow = orderedClickArrows()[game.clickStep];
  if (game.active && requiredArrow && now >= requiredArrow.endTime) {
    revealCorrectBoxes();
    finishRound(false);
  }
}

function startRound() {
  resetRoundView();
  startOverlay.hidden = true;

  game.active = true;
  game.played += 1;
  const combo = randomCombo();
  game.comboKey = rules.comboKey(combo);
  game.previousComboKey = game.comboKey;
  game.timedArrows = buildTimedArrows(combo);
  const now = Date.now();

  game.timedArrows.forEach((arrow) => {
    arrow.endTime = now + arrow.seconds * 1000;
  });

  updateStats();
  renderArrowPanel();
  boxTargets.forEach((box) => {
    box.disabled = false;
  });
  updateTimers();
  game.timerId = setInterval(updateTimers, 100);
}

function placeArrow(box, arrow) {
  box.textContent = "";
  box.replaceChildren();

  const image = document.createElement("img");
  image.className = "placed-arrow";
  image.src = arrow.asset;
  image.alt = "";
  box.append(image);
  box.classList.add("box-target-selected");
}

function revealCorrectBoxes() {
  const target = rules.comboTargets[game.comboKey];

  if (target.any) {
    target.any.forEach((number) => {
      const box = boxByNumber(number);
      if (box) {
        placeArrow(box, game.timedArrows[0]);
      }
    });
    return;
  }

  game.timedArrows.forEach((arrow) => {
    const box = boxByNumber(target[arrow.direction]);
    if (box) {
      placeArrow(box, arrow);
    }
  });
}

function failWrongBox(box) {
  box.classList.add("box-target-wrong");
  revealCorrectBoxes();
  finishRound(false, "Wrong spot. Try again 🤡");
}

function finishRound(didWin, message = "") {
  clearInterval(game.timerId);
  game.timerId = null;
  game.active = false;

  boxTargets.forEach((box) => {
    box.disabled = true;
  });

  if (didWin) {
    game.streak += 1;
    resultMessage.textContent = "You win 🍿";
    result.classList.add("round-result-win");
    tryAgainButton.textContent = "Play Again";
  } else {
    game.streak = 0;
    resultMessage.textContent = message || "Time's up. Try again 🤡";
    result.classList.remove("round-result-win");
    tryAgainButton.textContent = "Try Again";
  }

  updateStats();
  result.hidden = false;
}

function handleBoxClick(event) {
  if (!game.active) {
    return;
  }

  const box = event.currentTarget;
  if (game.selectedBoxes.has(box)) {
    failWrongBox(box);
    return;
  }

  const arrow = orderedClickArrows()[game.clickStep];
  if (!arrow || Date.now() >= arrow.endTime) {
    revealCorrectBoxes();
    finishRound(false);
    return;
  }

  if (!isCorrectBox(box, arrow)) {
    failWrongBox(box);
    return;
  }

  game.selectedBoxes.add(box);
  placeArrow(box, arrow);
  game.clickStep += 1;

  if (game.clickStep === 2) {
    finishRound(true);
  }
}

startButton.addEventListener("click", startRound);
tryAgainButton.addEventListener("click", startRound);
flipArrows.addEventListener("change", () => {
  if (game.timedArrows.length > 0) {
    renderArrowPanel();
  }
});
boxTargets.forEach((box) => {
  box.addEventListener("click", handleBoxClick);
});

resetRoundView();
updateStats();
