// Service d'interrogation des API Jolpica (Ergast) et OpenF1

const JOLPICA_BASE = "https://api.jolpica.net/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * 1. Récupère le calendrier officiel avec les dates limites des qualifications
 */
export async function fetchOfficialCalendar(year = "current") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}.json`);
    const data = await res.json();
    const races = data.MRData.RaceTable.Races;

    return races.map((race) => {
      // Détection du début exact des qualifications (UTC)
      const qualiDate = race.Qualifying ? `${race.Qualifying.date}T${race.Qualifying.time}` : `${race.date}T14:00:00Z`;
      const isSprint = Boolean(race.Sprint);

      return {
        round: parseInt(race.round, 10),
        name: race.raceName,
        circuit: race.Circuit.circuitName,
        city: race.Circuit.Location.locality,
        country: race.Circuit.Location.country,
        raceDate: `${race.date}T${race.time || "13:00:00Z"}`,
        qualiDeadline: qualiDate,
        isSprintWeekend: isSprint
      };
    });
  } catch (error) {
    console.error("Erreur récupération calendrier Jolpica:", error);
    return null;
  }
}

/**
 * 2. Récupère les résultats officiels après la course pour clôturer le Grand Prix
 */
export async function fetchOfficialRaceResults(round, year = "current") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}/${round}/results.json`);
    const data = await res.json();
    const race = data.MRData.RaceTable.Races[0];
    if (!race || !race.Results) return null;

    const results = race.Results;
    return {
      pos1: results[0]?.Driver?.driverId,
      pos2: results[1]?.Driver?.driverId,
      pos3: results[2]?.Driver?.driverId,
      fastestLapDriver: results.find((r) => r.FastestLap?.rank === "1")?.Driver?.driverId
    };
  } catch (error) {
    console.error(`Erreur résultats R${round}:`, error);
    return null;
  }
}

/**
 * 3. Récupère les pneumatiques et chronos d'essais libres via OpenF1
 */
export async function fetchPracticeTires(sessionKey) {
  try {
    const res = await fetch(`${OPENF1_BASE}/stints?session_key=${sessionKey}`);
    const stints = await res.json();
    return stints.slice(0, 10);
  } catch (error) {
    console.error("Erreur récupération pneus OpenF1:", error);
    return [];
  }
}