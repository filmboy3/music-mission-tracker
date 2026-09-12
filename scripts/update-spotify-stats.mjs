import { readFile, writeFile } from "node:fs/promises";

const outputPath = new URL("../stats.json", import.meta.url);
const artistUrl = "https://open.spotify.com/artist/4FzJ4PHbqeGr3ou6x20Nhf";

function parseMonthlyListeners(html) {
  const precise = html.match(/data-testid="monthly-listeners-label"[^>]*>([\d,]+) monthly listeners/i);
  if (precise) return Number(precise[1].replaceAll(",", ""));

  const compact = html.match(/Artist (?:·|&middot;|\u00B7) ([\d.]+)([KM]?) monthly listeners/i);
  if (!compact) return 0;

  const multiplier = compact[2].toUpperCase() === "M" ? 1_000_000 : compact[2].toUpperCase() === "K" ? 1_000 : 1;
  return Math.round(Number(compact[1]) * multiplier);
}

try {
  const response = await fetch(artistUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MusicMissionTracker/1.0)",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  if (!response.ok) throw new Error(`Spotify returned ${response.status}`);

  const monthlyListeners = parseMonthlyListeners(await response.text());
  if (!monthlyListeners) throw new Error("Monthly-listener count was not found");

  const stats = {
    spotify: {
      monthlyListeners,
      asOf: new Date().toISOString().slice(0, 10),
      source: artistUrl
    }
  };
  await writeFile(outputPath, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`Spotify monthly listeners: ${monthlyListeners.toLocaleString("en-US")}`);
} catch (error) {
  const fallback = JSON.parse(await readFile(outputPath, "utf8"));
  console.warn(`Spotify refresh skipped: ${error.message}`);
  console.warn(`Using last verified value from ${fallback.spotify.asOf}.`);
}
