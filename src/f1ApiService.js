// --- VERSION: ALPHA v3.4 ---
// Service d'interrogation multi-saisons Jolpica & OpenF1
const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * 1. Récupère le calendrier complet avec les horaires internationaux (UTC)
 * Extrait les créneaux FP1, FP2, FP3, Sprint, Qualifs et Course
 */
export async function fetchOfficialCalendarWithSessions(year = "2026") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}.json?limit=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    return races.map((race) => {
      const makeIso = (session) => {
        if (!session || !session.date) return null;
        return `${session.date}T${session.time || "12:00:00Z"}`;
      };

      const isSprint = Boolean(race.Sprint);
      const qualiDate = makeIso(race.Qualifying) || `${race.date}T14:00:00Z`;

      return {
        season: parseInt(year, 10),
        round: parseInt(race.round, 10),
        name: race.raceName,
        circuit_name: race.Circuit?.circuitName || "Circuit",
        country: race.Circuit?.Location?.country || "",
        city: race.Circuit?.Location?.locality || "",
        is_sprint: isSprint,
        fp1_time: makeIso(race.FirstPractice),
        fp2_time: makeIso(race.SecondPractice),
        fp3_time: makeIso(race.ThirdPractice),
        sprint_quali_time: makeIso(race.SprintQualifying),
        sprint_race_time: makeIso(race.Sprint),
        quali_start_time: qualiDate, // Date limite des pronostics
        race_start_time: `${race.date}T${race.time || "13:00:00Z"}`
      };
    });
  } catch (error) {
    console.warn(`Erreur calendrier Jolpica ${year}:`, error);
    return null;
  }
}

/**
 * 2. Récupère les archives officielles d'une saison terminée
 */
export async function fetchFullSeasonResults(year = "2024") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}/results.json?limit=1000`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    return races.map((race) => {
      const results = race.Results || [];
      const formatDriver = (entry) => {
        if (!entry || !entry.Driver) return null;
        const d = entry.Driver;
        const c = entry.Constructor;
        return {
          name: `${d.givenName || ""} ${d.familyName || ""}`.trim(),
          team: c?.name || "Écurie"
        };
      };

      return {
        round: parseInt(race.round, 10),
        raceName: race.raceName,
        circuitName: race.Circuit?.circuitName || "Circuit",
        country: race.Circuit?.Location?.country || "",
        date: race.date,
        p1: formatDriver(results[0]),
        p2: formatDriver(results[1]),
        p3: formatDriver(results[2]),
        fastestLap: results.find((r) => r?.FastestLap?.rank === "1")?.Driver?.familyName || null
      };
    });
  } catch (error) {
    console.warn(`Erreur archive ${year}:`, error);
    return [];
  }
}