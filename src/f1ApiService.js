// --- VERSION: ALPHA v3.3 ---
// Service d'interrogation multi-saisons Jolpica & OpenF1
const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * 1. Récupère le calendrier officiel pour l'année demandée (ex: 2026)
 */
export async function fetchOfficialCalendar(year = "2026") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}.json?limit=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    return races.map((race) => {
      const qualiDate = race.Qualifying ? `${race.Qualifying.date}T${race.Qualifying.time}` : `${race.date}T14:00:00Z`;
      return {
        round: parseInt(race.round, 10),
        name: race.raceName,
        circuit: race.Circuit?.circuitName || "Circuit",
        city: race.Circuit?.Location?.locality || "",
        country: race.Circuit?.Location?.country || "",
        raceDate: `${race.date}T${race.time || "13:00:00Z"}`,
        qualiDeadline: qualiDate,
        isSprintWeekend: Boolean(race.Sprint)
      };
    });
  } catch (error) {
    console.warn(`Jolpica calendrier ${year}:`, error);
    return null;
  }
}

/**
 * 2. Récupère les 24 résultats complets officiels d'une saison (Podiums P1/P2/P3, Pole, etc.)
 */
export async function fetchFullSeasonResults(year = "2024") {
  try {
    // limit=1000 garantit de recevoir les 24 courses d'un seul bloc
    const res = await fetch(`${JOLPICA_BASE}/${year}/results.json?limit=1000`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    return races.map((race) => {
      const results = race.Results || [];
      const p1 = results[0];
      const p2 = results[1];
      const p3 = results[2];
      const fastestLap = results.find((r) => r?.FastestLap?.rank === "1");

      const formatDriver = (entry) => {
        if (!entry || !entry.Driver) return null;
        const d = entry.Driver;
        const c = entry.Constructor;
        const name = `${d.givenName || ""} ${d.familyName || ""}`.trim() || d.driverId || "Pilote";
        return {
          name,
          code: d.code || d.familyName?.substring(0, 3)?.toUpperCase() || "F1",
          team: c?.name || "Écurie"
        };
      };

      return {
        round: parseInt(race.round, 10),
        raceName: race.raceName,
        circuitName: race.Circuit?.circuitName || "Circuit",
        country: race.Circuit?.Location?.country || "",
        date: race.date,
        p1: formatDriver(p1),
        p2: formatDriver(p2),
        p3: formatDriver(p3),
        fastestLap: fastestLap?.Driver ? `${fastestLap.Driver.givenName} ${fastestLap.Driver.familyName}` : null
      };
    });
  } catch (error) {
    console.warn(`Erreur récupération résultats complets ${year}:`, error);
    return [];
  }
}