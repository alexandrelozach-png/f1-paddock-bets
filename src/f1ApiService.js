// --- VERSION: ALPHA v3.2 ---
// Service d'interrogation des API Jolpica (Ergast) et OpenF1

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * 1. Récupère le calendrier complet d'une saison
 */
export async function fetchOfficialCalendar(year = "2026") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}.json?limit=100`);
    if (!res.ok) throw new Error("Erreur de récupération du calendrier");
    const data = await res.json();
    const races = data.MRData.RaceTable.Races;

    return races.map((race) => {
      const qualiDate = race.Qualifying 
        ? `${race.Qualifying.date}T${race.Qualifying.time}` 
        : `${race.date}T14:00:00Z`;

      return {
        round: parseInt(race.round, 10),
        name: race.raceName,
        circuit: race.Circuit.circuitName,
        city: race.Circuit.Location.locality,
        country: race.Circuit.Location.country,
        raceDate: `${race.date}T${race.time || "13:00:00Z"}`,
        qualiDeadline: qualiDate,
        isSprintWeekend: Boolean(race.Sprint)
      };
    });
  } catch (error) {
    console.error("Erreur de calendrier Jolpica:", error);
    return null;
  }
}

/**
 * 2. Récupère les résultats réels de course d'une saison pour test de validation
 */
export async function fetchFullSeasonResults(year = "2024") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}/results.json?limit=1000`);
    if (!res.ok) throw new Error("Erreur de récupération des résultats");
    const data = await res.json();
    const races = data.MRData.RaceTable.Races;

    return races.map((race) => {
      const results = race.Results || [];
      return {
        round: parseInt(race.round, 10),
        name: race.raceName,
        circuit: race.Circuit.circuitName,
        pole: results[0]?.Driver?.familyName || "Inconnu", // Estimation
        pos1: results[0]?.Driver?.familyName || "Inconnu",
        pos2: results[1]?.Driver?.familyName || "Inconnu",
        pos3: results[2]?.Driver?.familyName || "Inconnu",
        fastestLap: results.find(r => r.FastestLap?.rank === "1")?.Driver?.familyName || "Inconnu"
      };
    });
  } catch (error) {
    console.error("Erreur résultats Jolpica:", error);
    return null;
  }
}
