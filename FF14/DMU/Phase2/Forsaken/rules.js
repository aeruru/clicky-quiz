(function defineForsakenRules(root, factory) {
  const rules = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }

  root.forsakenRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildRules() {
  const roles = ["MT", "H1", "M1", "R1", "OT", "H2", "M2", "R2"];
  const defaultTowerSpots = ["tower-left", "tower-right"];

  const mechanicSteps = [
    { id: "prep", label: "Prep", seconds: 8, targetSpot: "center" },
    {
      id: "towers-1",
      label: "1st towers",
      seconds: 5,
      targetSpot: "north",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "towers-2",
      label: "2nd towers",
      seconds: 5,
      targetSpot: "east",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "ate-bait-1",
      label: "All Things Ending Bait",
      seconds: 5,
      targetSpot: "southeast",
    },
    {
      id: "towers-3",
      label: "3rd towers",
      seconds: 5,
      targetSpot: "south",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "towers-4",
      label: "4th towers",
      seconds: 5,
      targetSpot: "west",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "ate-bait-2",
      label: "All Things Ending Bait",
      seconds: 5,
      targetSpot: "southwest",
    },
    {
      id: "towers-5",
      label: "5th towers",
      seconds: 5,
      targetSpot: "northwest",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "towers-6",
      label: "6th towers",
      seconds: 5,
      targetSpot: "northeast",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "ate-bait-3",
      label: "All Things Ending Bait",
      seconds: 5,
      targetSpot: "center",
    },
    {
      id: "towers-7",
      label: "7th towers",
      seconds: 5,
      targetSpot: "north",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "towers-8",
      label: "8th towers",
      seconds: 5,
      targetSpot: "south",
      towerSpots: defaultTowerSpots,
    },
    {
      id: "ate-bait-4",
      label: "All Things Ending Bait",
      seconds: 5,
      targetSpot: "center",
    },
  ];

  const arenaSpots = [
    { id: "north", label: "North", x: 50, y: 11 },
    { id: "northeast", label: "Northeast", x: 78, y: 22 },
    { id: "east", label: "East", x: 89, y: 50 },
    { id: "southeast", label: "Southeast", x: 78, y: 78 },
    { id: "south", label: "South", x: 50, y: 89 },
    { id: "southwest", label: "Southwest", x: 22, y: 78 },
    { id: "west", label: "West", x: 11, y: 50 },
    { id: "northwest", label: "Northwest", x: 22, y: 22 },
    { id: "center", label: "Center", x: 50, y: 50 },
    { id: "tower-left", label: "Left tower", x: 36, y: 61 },
    { id: "tower-right", label: "Right tower", x: 64, y: 61 },
  ];

  const rolePlacements = [
    { role: "MT", spot: "northwest", debuff: "stack" },
    { role: "H1", spot: "north", debuff: "spread" },
    { role: "M1", spot: "northeast", debuff: "cone" },
    { role: "R1", spot: "east", debuff: "spread" },
    { role: "OT", spot: "southeast", debuff: "stack" },
    { role: "H2", spot: "south", debuff: "spread" },
    { role: "M2", spot: "southwest", debuff: "cone" },
    { role: "R2", spot: "west", debuff: "spread" },
  ];

  function stepByIndex(stepIndex) {
    return mechanicSteps[stepIndex] || null;
  }

  function isCorrectSpot(stepIndex, clickedSpotId) {
    return stepByIndex(stepIndex)?.targetSpot === clickedSpotId;
  }

  function towerSpotsForStep(stepIndex) {
    return stepByIndex(stepIndex)?.towerSpots || [];
  }

  return {
    arenaSpots,
    isCorrectSpot,
    mechanicSteps,
    rolePlacements,
    roles,
    stepByIndex,
    towerSpotsForStep,
  };
});
