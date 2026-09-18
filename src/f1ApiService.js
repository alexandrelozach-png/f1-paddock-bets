// src/f1ApiService.js - Service d'interrogation multi-saisons Jolpica & OpenF1

const JOLPICA_BASE = "https://api.jolpica.net/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * 1. Récupère le calendrier officiel pour l'année demandée (2024, 2025, 2026)
 */
export async function fetchOfficialCalendar(year = "2026") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    return races.map((race) => {
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
    console.warn(`Jolpica indisponible pour la saison ${year}:`, error);
    return null;
  }
}

/**
 * 2. Récupère tous les résultats officiels complets d'une saison (Podiums P1/P2/P3, Pole, etc.)
 */
export async function fetchFullSeasonResults(year = "2024") {
  try {
    const res = await fetch(`${JOLPICA_BASE}/${year}/results.json?limit=1000`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const races = data?.MRData?.RaceTable?.Races || [];

    return races.map((race) => {
      const results = race.Results || [];
      const p1 = results[0];
      const p2 = results[1];
      const p3 = results[2];
      const fastestLap = results.find((r) => r.FastestLap?.rank === "1");

      return {
        round: parseInt(race.round, 10),
        raceName: race.raceName,
        circuitName: race.Circuit.circuitName,
        country: race.Circuit.Location.country,
        date: race.date,
        p1: p1 ? { name: `${p1.Driver.givenName} ${p1.Driver.familyName}`, code: p1.Driver.code, team: p1.Constructor.name } : null,
        p2: p2 ? { name: `${p2.Driver.givenName} ${p2.Driver.familyName}`, code: p2.Driver.code, team: p2.Constructor.name } : null,
        p3: p3 ? { name: `${p3.Driver.givenName} ${p3.Driver.familyName}`, code: p3.Driver.code, team: p3.Constructor.name } : null,
        fastestLap: fastestLap ? `${fastestLap.Driver.givenName} ${fastestLap.Driver.familyName}` : null
      };
    });
  } catch (error) {
    console.warn(`Erreur récupération résultats complets ${year}:`, error);
    return null;
  }
}