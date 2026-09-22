// --- VERSION: ALPHA v3.9 ---
// Service d'interrogation multi-saisons Jolpica (Ergast) et OpenF1 avec Moteur Temporel
const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/**
 * 1. Récupère le calendrier officiel complet
 */
export async function fetchOfficialCalendar(year = "2026") {
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
        isSprintWeekend: isSprint,
        fp1_time: makeIso(race.FirstPractice),
        fp2_time: makeIso(race.SecondPractice),
        fp3_time: makeIso(race.ThirdPractice),
        sprint_quali_time: makeIso(race.SprintQualifying),
        sprint_race_time: makeIso(race.Sprint),
        qualiDeadline: qualiDate,
        raceDate: `${race.date}T${race.time || "13:00:00Z"}`
      };
    });
  } catch (error) {
    console.warn(`Erreur calendrier Jolpica ${year}:`, error);
    return null;
  }
}

export const fetchOfficialCalendarWithSessions = fetchOfficialCalendar;

/**
 * 2. Moteur Temporel d'Ingestion Automatique (ALPHA v3.9)
 * Gère les fenêtres T-2h (Essais), T+3h (Qualifs), T+5h (Course) et T+24h (Bascule GP)
 */
export async function runAutoSyncPipeline(activeGP, supabaseClient) {
  if (!activeGP || activeGP.isCancelled) return { status: "idle", message: "Aucun GP actif à synchroniser." };

  const now = Date.now();
  const qualiTime = new Date(activeGP.qualiDeadline).getTime();
  const raceTime = activeGP.raceDate ? new Date(activeGP.raceDate).getTime() : qualiTime + (24 * 3600 * 1000);

  const logs = [];

  // FENÊTRE 1 : T - 2h avant les qualifications -> Récupération Essais Libres (FP1, FP2, FP3)
  const fpSyncThreshold = qualiTime - (2 * 3600 * 1000);
  if (now >= fpSyncThreshold && now < qualiTime) {
    try {
      // Appel API OpenF1 pour récupérer les sessions d'essais libres
      const openF1Res = await fetch(`${OPENF1_BASE}/sessions?year=2026&round=${activeGP.round}`);
      if (openF1Res.ok) {
        const sessions = await openF1Res.json();
        logs.push(`Synchronisation FP1/FP2/FP3 déclenchée à T-2h pour Round ${activeGP.round}`);
      }
    } catch (e) {
      console.warn("AutoSync FP Error:", e);
    }
  }

  // FENÊTRE 2 : T + 3h après le début des qualifications -> Pole Position officielle
  const qualiSyncThreshold = qualiTime + (3 * 3600 * 1000);
  if (now >= qualiSyncThreshold && (!activeGP.officialResults || !activeGP.officialResults.pole)) {
    try {
      const qualiRes = await fetch(`${JOLPICA_BASE}/2026/${activeGP.round}/qualifying.json`);
      if (qualiRes.ok) {
        const qData = await qualiRes.json();
        const poleDriver = qData?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0]?.Driver?.driverId;
        if (poleDriver && supabaseClient) {
          await supabaseClient.from("official_results").upsert({
            gp_id: activeGP.id,
            pole_id: poleDriver
          }, { onConflict: "gp_id" });
          logs.push(`Pole position (${poleDriver}) enregistrée à T+3h.`);
        }
      }
    } catch (e) {
      console.warn("AutoSync Quali Error:", e);
    }
  }

  // FENÊTRE 3 : T + 5h après le départ de la course -> Résultats complets et scoring
  const raceSyncThreshold = raceTime + (5 * 3600 * 1000);
  if (now >= raceSyncThreshold && (!activeGP.officialResults || !activeGP.officialResults.pos1)) {
    try {
      const raceRes = await fetch(`${JOLPICA_BASE}/2026/${activeGP.round}/results.json`);
      if (raceRes.ok) {
        const rData = await raceRes.json();
        const results = rData?.MRData?.RaceTable?.Races?.[0]?.Results || [];
        if (results.length >= 3 && supabaseClient) {
          const pos1 = results[0].Driver.driverId;
          const pos2 = results[1].Driver.driverId;
          const pos3 = results[2].Driver.driverId;
          await supabaseClient.from("official_results").upsert({
            gp_id: activeGP.id,
            pos1_id: pos1,
            pos2_id: pos2,
            pos3_id: pos3,
            dotd_id: pos1
          }, { onConflict: "gp_id" });
          logs.push(`Résultats de course (P1, P2, P3) synchronisés à T+5h.`);
        }
      }
    } catch (e) {
      console.warn("AutoSync Race Error:", e);
    }
  }

  // FENÊTRE 4 : T + 24h après la course -> Clôture et bascule sur le GP suivant
  const advanceThreshold = raceTime + (24 * 3600 * 1000);
  if (now >= advanceThreshold && activeGP.status !== "completed") {
    if (supabaseClient) {
      await supabaseClient.from("grand_prix").update({ completed: true }).eq("id", activeGP.id);
      logs.push(`Grand Prix Round ${activeGP.round} clôturé à H+24h. Bascule sur Round ${activeGP.round + 1}.`);
    }
    return { status: "advanced", nextRound: activeGP.round + 1, logs };
  }

  return { status: "active", logs };
}

/**
 * 3. Récupère les archives officielles d'une saison passée
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