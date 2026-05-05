const runeData = {
  infiniteConstellation: {
    name: "Infinite Constellation",
    baseChance: 35_000_000_000,

    boosts: {
      Stars: { boost: 1.0002, max: 10 },
      Exp: { boost: 1.000001, max: 10 },
      Luck: { boost: 1.0001, max: 2 },
      Bulk: { boost: 1.0001, max: 2 },
      Nebulosa: { boost: 1.00001, max: 5 },
      "Cosmic Dust": { boost: 1.00001, max: 20 },
      RuneLuck: { boost: 1.00001, max: 5 },
      RuneBulk: { boost: 1.00001, max: 3 }
    }
  }
};

const suffixes = {
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
  qd: 1e15,
  qn: 1e18,
  sx: 1e21,
  sp: 1e24,
  oc: 1e27,
  no: 1e30,
  de: 1e33
};

function parseNumber(value) {
  value = value.trim().toLowerCase();

  if (!value) return 0;

  const match = value.match(/^([\d.]+)\s*([a-z]*)$/);

  if (!match) return Number(value) || 0;

  const number = parseFloat(match[1]);
  const suffix = match[2];

  return number * (suffixes[suffix] || 1);
}

function formatNumber(num) {
  if (!isFinite(num)) return "Infinite";

  const list = [
    ["De", 1e33],
    ["No", 1e30],
    ["Oc", 1e27],
    ["Sp", 1e24],
    ["Sx", 1e21],
    ["Qn", 1e18],
    ["Qd", 1e15],
    ["T", 1e12],
    ["B", 1e9],
    ["M", 1e6],
    ["K", 1e3]
  ];

  for (const [suffix, value] of list) {
    if (num >= value) {
      return (num / value).toFixed(2).replace(/\.00$/, "") + suffix;
    }
  }

  return Math.floor(num).toLocaleString();
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return "Infinite time";

  const years = Math.floor(seconds / 31536000);
  seconds %= 31536000;

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  let parts = [];

  if (years > 0) parts.push(`${years}y`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

function calculate() {
  const selectedRune = document.getElementById("runeSelect").value;
  const rps = parseNumber(document.getElementById("rpsInput").value);
  const runeLuck = parseNumber(document.getElementById("luckInput").value);

  const resultText = document.getElementById("resultText");

  if (rps <= 0 || runeLuck <= 0) {
    resultText.innerHTML = "Please enter valid RPS and Rune Luck.";
    return;
  }

  const rune = runeData[selectedRune];

  let stats = {};
  let hitsNeeded = {};

  for (const stat in rune.boosts) {
    stats[stat] = 1;

    const data = rune.boosts[stat];
    hitsNeeded[stat] = Math.ceil(Math.log(data.max) / Math.log(data.boost));
  }

  const maxHitsNeeded = Math.max(...Object.values(hitsNeeded));

  let totalSeconds = 0;
  let currentRps = rps;
  let currentLuck = runeLuck;

  for (let hit = 1; hit <= maxHitsNeeded; hit++) {
    const chancePerRune = currentLuck / rune.baseChance;
    const hitsPerSecond = currentRps * chancePerRune;

    if (hitsPerSecond <= 0) {
      resultText.innerHTML = "Calculation failed. Your stats are too low.";
      return;
    }

    totalSeconds += 1 / hitsPerSecond;

    for (const stat in rune.boosts) {
      const data = rune.boosts[stat];

      if (stats[stat] < data.max) {
        stats[stat] *= data.boost;

        if (stats[stat] > data.max) {
          stats[stat] = data.max;
        }
      }
    }

    currentLuck = runeLuck * stats.RuneLuck * stats.Luck;
    currentRps = rps * stats.RuneBulk * stats.Bulk;
  }

  let statList = "";

  for (const stat in hitsNeeded) {
    statList += `${stat}: ${hitsNeeded[stat].toLocaleString()} hits needed<br>`;
  }

  resultText.innerHTML = `
    <strong>Rune:</strong> ${rune.name}<br>
    <strong>Base Chance:</strong> 1 in ${formatNumber(rune.baseChance)}<br>
    <strong>Starting RPS:</strong> ${formatNumber(rps)}<br>
    <strong>Starting Rune Luck:</strong> ${formatNumber(runeLuck)}<br><br>

    <strong>Estimated time to max:</strong><br>
    ${formatTime(totalSeconds)}<br><br>

    <strong>Total Infinite Constellations needed:</strong><br>
    ${maxHitsNeeded.toLocaleString()}<br><br>

    <strong>Final simulated RPS:</strong> ${formatNumber(currentRps)}<br>
    <strong>Final simulated Rune Luck:</strong> ${formatNumber(currentLuck)}<br><br>

    <strong>Hits needed per stat:</strong><br>
    ${statList}
  `;
}
