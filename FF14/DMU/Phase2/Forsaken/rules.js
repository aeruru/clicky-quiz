(function defineForsakenRules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.forsakenRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const roles = ["MT", "H1", "M1", "R1", "OT", "H2", "M2", "R2"];
  const arenaCenter = { x: 50, y: 50 };
  const roleGroups = {
    support: ["MT", "H1", "OT", "H2"],
    dps: ["M1", "R1", "M2", "R2"],
  };
  const roleTeams = [
    { id: "mt-h1", roles: ["MT", "H1"] },
    { id: "ot-h2", roles: ["OT", "H2"] },
    { id: "m1-r1", roles: ["M1", "R1"] },
    { id: "m2-r2", roles: ["M2", "R2"] },
  ];
  const defaultTowerSpots = ["tower-cw", "tower-ccw"];
  const towerBaitSpotIds = [
    "bait-back",
    "bait-between",
    "odd-bait-cw",
    "odd-bait-ccw",
    "odd-cone-even-spread",
    "odd-spread-even-spread",
    "stack-bait-cw",
    "stack-bait-ccw",
    "odd-cone-bait",
    "even-cone-cw",
    "even-cone-ccw",
    "even-cone-bait-cw",
    "even-cone-bait-ccw",
    "even-melee-bait-cw",
    "even-melee-bait-ccw",
  ];
  const towerLayoutSpotIds = [...defaultTowerSpots, ...towerBaitSpotIds];
  const baitCastOptions = [
    { id: "past", label: "Past's End", targetSpot: "bait-between" },
    { id: "future", label: "Future's End", targetSpot: "bait-back" },
  ];

  const mechanicSteps = [
    {
      id: "forsaken",
      label: "Forsaken",
      seconds: 0,
      towerSpots: [],
      validSpotIds: [],
    },
    {
      id: "towers-1",
      label: "1st towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-2",
      label: "2nd towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "ate-bait-1",
      label: "All Things Ending Bait",
      seconds: 5,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-3",
      label: "3rd towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-4",
      label: "4th towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "ate-bait-2",
      label: "All Things Ending Bait",
      seconds: 5,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-5",
      label: "5th towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-6",
      label: "6th towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "ate-bait-3",
      label: "All Things Ending Bait",
      seconds: 5,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-7",
      label: "7th towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "towers-8",
      label: "8th towers",
      seconds: 7,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
    {
      id: "ate-bait-4",
      label: "All Things Ending Bait",
      seconds: 5,
      towerSpots: defaultTowerSpots,
      validSpotIds: towerBaitSpotIds,
    },
  ];

  const staticArenaSpots = [
    { id: "north", label: "North", x: 50, y: 11 },
    { id: "northeast", label: "Northeast", x: 78, y: 22 },
    { id: "east", label: "East", x: 89, y: 50 },
    { id: "southeast", label: "Southeast", x: 78, y: 78 },
    { id: "south", label: "South", x: 50, y: 89 },
    { id: "southwest", label: "Southwest", x: 22, y: 78 },
    { id: "west", label: "West", x: 11, y: 50 },
    { id: "northwest", label: "Northwest", x: 22, y: 22 },
    { id: "center", label: "Center", x: 50, y: 50 },
    { id: "opening-support-1", label: "Support opening 1", x: 18, y: 35 },
    { id: "opening-support-2", label: "Support opening 2", x: 28, y: 35 },
    { id: "opening-support-3", label: "Support opening 3", x: 18, y: 53 },
    { id: "opening-support-4", label: "Support opening 4", x: 28, y: 53 },
    { id: "opening-dps-1", label: "DPS opening 1", x: 72, y: 35 },
    { id: "opening-dps-2", label: "DPS opening 2", x: 82, y: 35 },
    { id: "opening-dps-3", label: "DPS opening 3", x: 72, y: 53 },
    { id: "opening-dps-4", label: "DPS opening 4", x: 82, y: 53 },
  ];
  const towerLayoutBaseSpots = [
    { id: "tower-cw", label: "Clockwise tower", x: 35, y: 63 },
    { id: "tower-ccw", label: "Counterclockwise tower", x: 65, y: 63 },
    { id: "bait-back", label: "Bait back", x: 50, y: 27 },
    { id: "bait-between", label: "Bait between", x: 50, y: 63 },
    { id: "odd-bait-cw", label: "Odd bait clockwise tower", x: 35, y: 53 },
    { id: "odd-bait-ccw", label: "Odd bait counterclockwise tower", x: 65, y: 53 },
    { id: "odd-cone-even-spread", label: "Odd cone / even spread", x: 35, y: 73 },
    { id: "odd-spread-even-spread", label: "Odd spread / even spread", x: 65, y: 73 },
    { id: "stack-bait-cw", label: "Stack bait clockwise", x: 41, y: 60 },
    { id: "stack-bait-ccw", label: "Stack bait counterclockwise", x: 59, y: 60 },
    { id: "odd-cone-bait", label: "Odd cone bait", x: 20, y: 65 },
    { id: "even-cone-cw", label: "Even cone clockwise", x: 28, y: 56 },
    { id: "even-cone-ccw", label: "Even cone counterclockwise", x: 72, y: 56 },
    { id: "even-cone-bait-cw", label: "Even cone bait clockwise", x: 21, y: 63 },
    { id: "even-cone-bait-ccw", label: "Even cone bait counterclockwise", x: 79, y: 63 },
    { id: "even-melee-bait-cw", label: "Even melee bait clockwise", x: 32, y: 43 },
    { id: "even-melee-bait-ccw", label: "Even melee bait counterclockwise", x: 68, y: 43 },
  ];
  const arenaSpots = [...staticArenaSpots, ...towerLayoutBaseSpots];

  const openingRolePlacements = [
    { roles: ["H1"], spot: "opening-support-1", debuff: "spread" },
    { roles: ["MT"], spot: "opening-support-2", debuff: "stack" },
    { roles: ["H2"], spot: "opening-support-3", debuff: "spread" },
    { roles: ["OT"], spot: "opening-support-4", debuff: "stack" },
    { roles: ["M1"], spot: "opening-dps-1", debuff: "cone" },
    { roles: ["R1"], spot: "opening-dps-2", debuff: "spread" },
    { roles: ["M2"], spot: "opening-dps-3", debuff: "cone" },
    { roles: ["R2"], spot: "opening-dps-4", debuff: "spread" },
  ];
  const towerBaitRolePlacements = [
    { roles: ["H1"], spot: "odd-bait-cw", debuff: "spread" },
    { roles: ["M1"], spot: "odd-cone-even-spread", debuff: "cone" },
    { roles: ["R1"], spot: "even-cone-bait-cw", debuff: "spread" },
    { roles: ["H2"], spot: "odd-cone-bait", debuff: "spread" },
    { roles: ["MT"], spot: "odd-bait-ccw", debuff: "stack" },
    { roles: ["M2", "R2"], spot: "even-cone-ccw", debuff: "cone" },
    { roles: ["OT"], spot: "odd-spread-even-spread", debuff: "stack" },
    { roles: ["R1", "R2"], spot: "even-cone-bait-ccw", debuff: "spread" },
  ];

  function stepByIndex(stepIndex) {
    return mechanicSteps[stepIndex] || null;
  }

  function randomRole(group, random = Math.random) {
    return group[Math.floor(random() * group.length)];
  }

  function generateOpeningDebuffs(random = Math.random) {
    const supportStack = randomRole(roleGroups.support, random);
    const dpsStack = randomRole(roleGroups.dps, random);
    const supportFill = random() < 0.5 ? "spread" : "cone";
    const dpsFill = supportFill === "spread" ? "cone" : "spread";

    return Object.fromEntries(
      roles.map((role) => {
        if (role === supportStack || role === dpsStack) {
          return [role, "stack"];
        }

        const roleGroup = roleGroups.support.includes(role) ? "support" : "dps";
        return [role, roleGroup === "support" ? supportFill : dpsFill];
      }),
    );
  }

  function generateTowerLayout(random = Math.random) {
    const rotationDegrees = random() * 360;
    const spots = Object.fromEntries(
      towerLayoutBaseSpots.map((spot) => {
        const rotatedSpot = rotateSpot(spot, rotationDegrees);
        return [spot.id, rotatedSpot];
      }),
    );

    return { bossRotationDegrees: rotationDegrees, spots };
  }

  function generateTowerLayouts(random = Math.random) {
    return mechanicSteps.map(() => generateTowerLayout(random));
  }

  function generateBaitCasts(random = Math.random) {
    const casts = {};

    mechanicSteps.forEach((step, stepIndex) => {
      if (!isTowerStep(step) || towerSetParityForStep(stepIndex) !== "even") {
        return;
      }

      const nextBaitStepIndex = nextBaitStepIndexAfter(stepIndex);

      if (nextBaitStepIndex === null) {
        return;
      }

      casts[stepIndex] = randomBaitCast(random);
      casts[nextBaitStepIndex] = casts[stepIndex];
    });

    return casts;
  }

  function randomBaitCast(random = Math.random) {
    return baitCastOptions[Math.floor(random() * baitCastOptions.length)];
  }

  function generateTowerResolutionDebuffs(stepIndex, tokenRoles, random = Math.random) {
    if (!shouldGenerateTowerResolutionDebuffs(stepIndex)) {
      return {};
    }

    const parity = towerSetParityForStep(stepIndex);

    if (tokenRoles.length !== 4) {
      throw new Error("Tower debuffs must be generated for exactly four tokens.");
    }

    const debuffPool =
      parity === "odd"
        ? ["spread", "spread", "cone", "cone"]
        : ["stack", "stack", "spread", "cone"];
    const shuffledDebuffs = shuffle(debuffPool, random);

    return Object.fromEntries(
      tokenRoles.map((role, index) => [role, shuffledDebuffs[index]]),
    );
  }

  function teamGroupsForOpeningDebuffs(debuffs) {
    const groupATeams = roleTeams.filter((team) =>
      team.roles.some((role) => debuffs[role] === "stack"),
    );
    const groupBTeams = roleTeams.filter(
      (team) => !groupATeams.some((groupATeam) => groupATeam.id === team.id),
    );

    return {
      A: groupATeams,
      B: groupBTeams,
    };
  }

  function towerResponsibilityGroupForSet(towerSetNumber) {
    if (towerSetNumber >= 1 && towerSetNumber <= 3) {
      return "A";
    }

    if (towerSetNumber >= 4 && towerSetNumber <= 7) {
      return "B";
    }

    if (towerSetNumber === 8) {
      return "A";
    }

    return null;
  }

  function towerResponsibilityGroupForStep(stepIndex) {
    const towerSetNumber = towerSetNumberForStep(stepIndex);

    return towerSetNumber ? towerResponsibilityGroupForSet(towerSetNumber) : null;
  }

  function towerTakeCountForSet(towerSetNumber) {
    const responsibilityGroup = towerResponsibilityGroupForSet(towerSetNumber);

    if (!responsibilityGroup) {
      return null;
    }

    let takeCount = 0;

    for (let setNumber = 1; setNumber <= towerSetNumber; setNumber += 1) {
      if (towerResponsibilityGroupForSet(setNumber) === responsibilityGroup) {
        takeCount += 1;
      }
    }

    return takeCount;
  }

  function towerTakeCountForStep(stepIndex) {
    const towerSetNumber = towerSetNumberForStep(stepIndex);

    return towerSetNumber ? towerTakeCountForSet(towerSetNumber) : null;
  }

  function shouldGenerateTowerResolutionDebuffs(stepIndex) {
    const takeCount = towerTakeCountForStep(stepIndex);

    return takeCount !== null && takeCount < 4;
  }

  function responsibleTeamsForTowerStep(stepIndex, debuffs) {
    const responsibilityGroup = towerResponsibilityGroupForStep(stepIndex);

    if (!responsibilityGroup) {
      return [];
    }

    return teamGroupsForOpeningDebuffs(debuffs)[responsibilityGroup];
  }

  function responsibleRolesForTowerStep(stepIndex, debuffs) {
    return responsibleTeamsForTowerStep(stepIndex, debuffs).flatMap((team) => team.roles);
  }

  function roleSpotAssignmentsForTowerStep(
    stepIndex,
    openingDebuffs,
    currentDebuffs = openingDebuffs,
  ) {
    const towerSetNumber = towerSetNumberForStep(stepIndex);

    if (towerSetNumber === 1 || towerSetNumber === 3 || towerSetNumber === 5 || towerSetNumber === 7) {
      return oddTowerSetAssignments(stepIndex, openingDebuffs, currentDebuffs);
    }

    if (towerSetNumber && towerSetNumber % 2 === 0) {
      return evenTowerSetAssignments(stepIndex, openingDebuffs, currentDebuffs);
    }

    return {};
  }

  function oddTowerSetAssignments(stepIndex, openingDebuffs, currentDebuffs) {
    const assignments = {};
    const towerRoles = responsibleRolesForTowerStep(stepIndex, openingDebuffs);
    const baitRoles = roles.filter((role) => !towerRoles.includes(role));

    assignOddTowerStacks(assignments, towerRoles, currentDebuffs);

    towerRoles
      .filter((role) => currentDebuffs[role] !== "stack")
      .forEach((role) => {
        assignments[role] =
          currentDebuffs[role] === "cone"
            ? "odd-cone-even-spread"
            : "odd-spread-even-spread";
      });

    baitRoles.forEach((role) => {
      if (isTankRole(role)) {
        assignments[role] = "stack-bait-cw";
      } else if (isHealerRole(role)) {
        assignments[role] = "odd-cone-bait";
      } else if (isDpsRole(role)) {
        assignments[role] = "stack-bait-ccw";
      }
    });

    return assignments;
  }

  function assignOddTowerStacks(assignments, towerRoles, currentDebuffs) {
    const supportStackRoles = towerRoles.filter(
      (role) => isSupportRole(role) && currentDebuffs[role] === "stack",
    );
    const dpsStackRoles = towerRoles.filter(
      (role) => isDpsRole(role) && currentDebuffs[role] === "stack",
    );

    if (supportStackRoles.length === 1) {
      assignments[supportStackRoles[0]] = "odd-bait-cw";
    } else if (supportStackRoles.length === 2) {
      assignments[supportStackRoles.find(isHealerRole)] = "odd-bait-cw";
      assignments[supportStackRoles.find(isTankRole)] = "odd-bait-ccw";
    }

    if (dpsStackRoles.length === 1) {
      assignments[dpsStackRoles[0]] = "odd-bait-ccw";
    } else if (dpsStackRoles.length === 2) {
      assignments[dpsStackRoles.find(isMeleeRole)] = "odd-bait-cw";
      assignments[dpsStackRoles.find(isRangedRole)] = "odd-bait-ccw";
    }
  }

  function evenTowerSetAssignments(stepIndex, openingDebuffs, currentDebuffs) {
    const assignments = {};
    const towerRoles = responsibleRolesForTowerStep(stepIndex, openingDebuffs);
    const baitRoles = roles.filter((role) => !towerRoles.includes(role));

    assignEvenTowerRoles(assignments, towerRoles, currentDebuffs);
    assignEvenTowerBaitRoles(assignments, baitRoles);

    return assignments;
  }

  function assignEvenTowerRoles(assignments, towerRoles, currentDebuffs) {
    ["cone", "spread"].forEach((debuff) => {
      assignEvenSupportTowerRoles(assignments, towerRoles, currentDebuffs, debuff);
      assignEvenDpsTowerRoles(assignments, towerRoles, currentDebuffs, debuff);
    });
  }

  function assignEvenSupportTowerRoles(assignments, towerRoles, currentDebuffs, debuff) {
    const supportRoles = towerRoles.filter(
      (role) => isSupportRole(role) && currentDebuffs[role] === debuff,
    );

    if (supportRoles.length === 1) {
      assignments[supportRoles[0]] = evenTowerSpotFor("cw", debuff);
      return;
    }

    if (supportRoles.length === 2) {
      const tankRole = supportRoles.find(isTankRole);
      const healerRole = supportRoles.find(isHealerRole);
      assignments[healerRole] = evenTowerSpotFor("cw", debuff);
      assignments[tankRole] = evenTowerSpotFor("ccw", debuff);
    }
  }

  function assignEvenDpsTowerRoles(assignments, towerRoles, currentDebuffs, debuff) {
    const dpsRoles = towerRoles.filter(
      (role) => isDpsRole(role) && currentDebuffs[role] === debuff,
    );

    if (dpsRoles.length === 1) {
      assignments[dpsRoles[0]] = evenTowerSpotFor("ccw", debuff);
      return;
    }

    if (dpsRoles.length === 2) {
      const meleeRole = dpsRoles.find(isMeleeRole);
      const rangedRole = dpsRoles.find(isRangedRole);
      assignments[meleeRole] = evenTowerSpotFor("cw", debuff);
      assignments[rangedRole] = evenTowerSpotFor("ccw", debuff);
    }
  }

  function assignEvenTowerBaitRoles(assignments, baitRoles) {
    baitRoles.forEach((role) => {
      if (isTankRole(role)) {
        assignments[role] = "even-melee-bait-cw";
      } else if (isHealerRole(role)) {
        assignments[role] = "even-cone-bait-cw";
      } else if (isMeleeRole(role)) {
        assignments[role] = "even-melee-bait-ccw";
      } else if (isRangedRole(role)) {
        assignments[role] = "even-cone-bait-ccw";
      }
    });
  }

  function evenTowerSpotFor(side, debuff) {
    if (debuff === "cone") {
      return side === "cw" ? "even-cone-cw" : "even-cone-ccw";
    }

    return side === "cw" ? "odd-cone-even-spread" : "odd-spread-even-spread";
  }

  function towerSetNumberForStep(stepIndex) {
    if (!isTowerStep(stepByIndex(stepIndex))) {
      return null;
    }

    return mechanicSteps
      .slice(0, stepIndex + 1)
      .filter(isTowerStep).length;
  }

  function towerSetParityForStep(stepIndex) {
    const towerSetNumber = towerSetNumberForStep(stepIndex);

    if (!towerSetNumber) {
      return null;
    }

    return towerSetNumber % 2 === 1 ? "odd" : "even";
  }

  function shuffle(items, random = Math.random) {
    const shuffledItems = [...items];

    for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffledItems[index], shuffledItems[swapIndex]] = [
        shuffledItems[swapIndex],
        shuffledItems[index],
      ];
    }

    return shuffledItems;
  }

  function isTowerStep(step) {
    return step?.id.startsWith("towers-") || false;
  }

  function isBaitStep(step) {
    return step?.id.startsWith("ate-bait-") || false;
  }

  function nextBaitStepIndexAfter(stepIndex) {
    const baitStepIndex = mechanicSteps.findIndex(
      (step, candidateIndex) => candidateIndex > stepIndex && isBaitStep(step),
    );

    return baitStepIndex === -1 ? null : baitStepIndex;
  }

  function isTankRole(role) {
    return role === "MT" || role === "OT";
  }

  function isHealerRole(role) {
    return role === "H1" || role === "H2";
  }

  function isSupportRole(role) {
    return isTankRole(role) || isHealerRole(role);
  }

  function isMeleeRole(role) {
    return role === "M1" || role === "M2";
  }

  function isRangedRole(role) {
    return role === "R1" || role === "R2";
  }

  function isDpsRole(role) {
    return isMeleeRole(role) || isRangedRole(role);
  }

  function rotateSpot(spot, rotationDegrees) {
    const radians = (rotationDegrees * Math.PI) / 180;
    const dx = spot.x - arenaCenter.x;
    const dy = spot.y - arenaCenter.y;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return {
      ...spot,
      x: roundCoordinate(arenaCenter.x + dx * cos - dy * sin),
      y: roundCoordinate(arenaCenter.y + dx * sin + dy * cos),
    };
  }

  function roundCoordinate(value) {
    return Math.round(value * 1000) / 1000;
  }

  function isCorrectSpot(stepIndex, clickedSpotId, baitCasts = null) {
    return correctSpotIdsForStep(stepIndex, baitCasts).includes(clickedSpotId);
  }

  function correctSpotIdsForStep(stepIndex, baitCasts = null) {
    const baitTargetSpot = baitTargetSpotForStep(stepIndex, baitCasts);

    return baitTargetSpot ? [baitTargetSpot] : validSpotIdsForStep(stepIndex);
  }

  function baitTargetSpotForStep(stepIndex, baitCasts = null) {
    const cast = baitCasts?.[stepIndex];

    if (!cast || !isBaitStep(stepByIndex(stepIndex))) {
      return null;
    }

    return cast.targetSpot;
  }

  function validSpotIdsForStep(stepIndex) {
    return stepByIndex(stepIndex)?.validSpotIds || [];
  }

  function validSpotsForStep(stepIndex) {
    const validSpotIds = new Set(validSpotIdsForStep(stepIndex));

    return arenaSpots.filter((spot) => validSpotIds.has(spot.id));
  }

  function spotsForStep(stepIndex, towerLayout = null) {
    if (!towerLayout) {
      return validSpotsForStep(stepIndex);
    }

    return validSpotIdsForStep(stepIndex).map((spotId) => spotForId(spotId, towerLayout));
  }

  function towerSpotPositionsForStep(stepIndex, towerLayout = null) {
    return towerSpotsForStep(stepIndex).map((spotId) => spotForId(spotId, towerLayout));
  }

  function towerSpotsForStep(stepIndex) {
    return stepByIndex(stepIndex)?.towerSpots || [];
  }

  function spotForId(spotId, towerLayout = null) {
    return towerLayout?.spots?.[spotId] || arenaSpots.find((spot) => spot.id === spotId);
  }

  function rolePlacementsForStep(stepIndex) {
    return stepIndex === 0 ? openingRolePlacements : towerBaitRolePlacements;
  }

  return {
    arenaSpots,
    baitCastOptions,
    baitTargetSpotForStep,
    correctSpotIdsForStep,
    generateBaitCasts,
    generateTowerResolutionDebuffs,
    generateTowerLayout,
    generateTowerLayouts,
    generateOpeningDebuffs,
    isCorrectSpot,
    mechanicSteps,
    rolePlacements: openingRolePlacements,
    rolePlacementsForStep,
    roleGroups,
    roleTeams,
    roles,
    roleSpotAssignmentsForTowerStep,
    shouldGenerateTowerResolutionDebuffs,
    spotForId,
    spotsForStep,
    stepByIndex,
    towerLayoutSpotIds,
    towerSetNumberForStep,
    towerSetParityForStep,
    towerTakeCountForSet,
    towerTakeCountForStep,
    towerSpotPositionsForStep,
    towerSpotsForStep,
    responsibleRolesForTowerStep,
    responsibleTeamsForTowerStep,
    teamGroupsForOpeningDebuffs,
    towerResponsibilityGroupForSet,
    towerResponsibilityGroupForStep,
    validSpotIdsForStep,
    validSpotsForStep,
  };
});
