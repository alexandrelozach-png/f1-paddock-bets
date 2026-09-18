// --- VERSION: ALPHA v3.1 ---
import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Clock, 
  Flag, 
  Calendar, 
  ChevronRight, 
  Flame, 
  BarChart3, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  MapPin,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Lock,
  RefreshCw,
  Zap,
  Globe
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { fetchOfficialCalendar, fetchFullSeasonResults } from "./f1ApiService";

// --- VERSION DE L'APPLICATION ---
const APP_VERSION = "ALPHA v3.1";

// --- GRILLE PILOTES 2026 OFFICIELLE ---
const DRIVERS_2026 = [
  { id: "leclerc", name: "Charles Leclerc", number: 16, team: "Ferrari", teamColor: "#E8002D" },
  { id: "hamilton", name: "Lewis Hamilton", number: 44, team: "Ferrari", teamColor: "#E8002D" },
  { id: "norris", name: "Lando Norris", number: 4, team: "McLaren", teamColor: "#FF8000" },
  { id: "piastri", name: "Oscar Piastri", number: 81, team: "McLaren", teamColor: "#FF8000" },
  { id: "verstappen", name: "Max Verstappen", number: 1, team: "Red Bull Racing", teamColor: "#3671C6" },
  { id: "hadjar", name: "Isack Hadjar", number: 6, team: "Red Bull Racing", teamColor: "#3671C6" },
  { id: "russell", name: "George Russell", number: 63, team: "Mercedes", teamColor: "#27F4D2" },
  { id: "antonelli", name: "Kimi Antonelli", number: 12, team: "Mercedes", teamColor: "#27F4D2" },
  { id: "alonso", name: "Fernando Alonso", number: 14, team: "Aston Martin", teamColor: "#229971" },
  { id: "stroll", name: "Lance Stroll", number: 18, team: "Aston Martin", teamColor: "#229971" },
  { id: "albon", name: "Alexander Albon", number: 23, team: "Williams", teamColor: "#64C4FF" },
  { id: "sainz", name: "Carlos Sainz", number: 55, team: "Williams", teamColor: "#64C4FF" },
  { id: "gasly", name: "Pierre Gasly", number: 10, team: "Alpine", teamColor: "#FF87BC" },
  { id: "colapinto", name: "Franco Colapinto", number: 43, team: "Alpine", teamColor: "#FF87BC" },
  { id: "lawson", name: "Liam Lawson", number: 30, team: "Racing Bulls", teamColor: "#6692FF" },
  { id: "lindblad", name: "Arvid Lindblad", number: 45, team: "Racing Bulls", teamColor: "#6692FF" },
  { id: "hulkenberg", name: "Nico Hülkenberg", number: 27, team: "Sauber Audi", teamColor: "#52E252" },
  { id: "bortoleto", name: "Gabriel Bortoleto", number: 5, team: "Sauber Audi", teamColor: "#52E252" },
  { id: "ocon", name: "Esteban Ocon", number: 31, team: "Haas", teamColor: "#B6BABD" },
  { id: "bearman", name: "Oliver Bearman", number: 87, team: "Haas", teamColor: "#B6BABD" }
];

// --- TRACÉS VECTORIELS SVG OFFICIELS ---
const CIRCUIT_SVGS = {
  baku: (
    <svg viewBox="0 0 400 180" className="w-full h-36 stroke-current">
      <defs>
        <linearGradient id="bakuGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M 40 145 L 360 145 L 360 100 L 260 100 L 260 40 L 200 40 L 180 65 L 140 65 L 130 35 L 80 35 L 40 70 Z" 
        fill="none" stroke="#2b2b3d" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 40 145 L 360 145 L 360 100 L 260 100 L 260 40 L 200 40 L 180 65 L 140 65 L 130 35 L 80 35 L 40 70 Z" 
        fill="none" stroke="url(#bakuGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="160" y1="137" x2="160" y2="153" stroke="#ffffff" strokeWidth="3" />
      <text x="165" y="165" fill="#ffffff" fontSize="9" fontFamily="monospace">BAKU CITY (2.2 KM LIGNE DROITE)</text>
    </svg>
  ),
  barcelona: (
    <svg viewBox="0 0 400 180" className="w-full h-36 stroke-current">
      <defs>
        <linearGradient id="barcaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M 60 145 L 310 145 C 340 145 350 120 330 95 C 315 80 280 85 270 70 C 260 50 280 30 250 25 L 180 25 C 160 25 150 45 130 50 L 90 50 C 70 50 65 75 80 90 L 110 110 C 120 120 105 135 90 135 L 60 145 Z" 
        fill="none" stroke="#2b2b3d" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 60 145 L 310 145 C 340 145 350 120 330 95 C 315 80 280 85 270 70 C 260 50 280 30 250 25 L 180 25 C 160 25 150 45 130 50 L 90 50 C 70 50 65 75 80 90 L 110 110 C 120 120 105 135 90 135 L 60 145 Z" 
        fill="none" stroke="url(#barcaGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="140" y1="137" x2="140" y2="153" stroke="#ffffff" strokeWidth="3" />
      <text x="145" y="165" fill="#ffffff" fontSize="9" fontFamily="monospace">CATALUNYA S1/S2/S3</text>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 400 180" className="w-full h-36 stroke-current">
      <defs>
        <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M 60 130 C 100 150 250 150 310 130 C 360 110 350 50 280 40 C 220 30 180 70 130 50 C 80 30 40 80 60 130 Z" 
        fill="none" stroke="#2b2b3d" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 60 130 C 100 150 250 150 310 130 C 360 110 350 50 280 40 C 220 30 180 70 130 50 C 80 30 40 80 60 130 Z" 
        fill="none" stroke="url(#defGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="180" y1="132" x2="180" y2="148" stroke="#ffffff" strokeWidth="3" />
      <text x="185" y="162" fill="#ffffff" fontSize="9" fontFamily="monospace">SECTEURS S1 • S2 • S3</text>
    </svg>
  )
};

// --- CALENDRIER OFFICIEL 2026 DE BASE ---
const INITIAL_CALENDAR_2026 = [
  { round: 1, id: "melbourne", name: "Australian Grand Prix", circuit: "Albert Park Circuit", country: "Australie 🇦🇺", city: "Melbourne", status: "completed", qualiDeadline: "2026-03-07T05:00:00Z", isSprint: false, length: "5.278 km", laps: 58, lapRecord: "1:19.813 (Leclerc)", officialResults: { pole: "norris", pos1: "norris", pos2: "verstappen", pos3: "leclerc", dotd: "sainz" }, practice: [] },
  { round: 2, id: "shanghai", name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", country: "Chine 🇨🇳", city: "Shanghai", status: "completed", qualiDeadline: "2026-03-14T07:00:00Z", isSprint: true, length: "5.451 km", laps: 56, lapRecord: "1:32.238 (Schumacher)", officialResults: { pole: "verstappen", pos1: "verstappen", pos2: "norris", pos3: "leclerc", dotd: "leclerc" }, practice: [] },
  { round: 3, id: "suzuka", name: "Japanese Grand Prix", circuit: "Suzuka Circuit", country: "Japon 🇯🇵", city: "Suzuka", status: "completed", qualiDeadline: "2026-03-28T06:00:00Z", isSprint: false, length: "5.807 km", laps: 53, lapRecord: "1:30.983 (Hamilton)", officialResults: { pole: "verstappen", pos1: "verstappen", pos2: "perez", pos3: "sainz", dotd: "leclerc" }, practice: [] },
  { round: 4, id: "sakhir", name: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", country: "Bahreïn 🇧🇭", city: "Sakhir", status: "completed", qualiDeadline: "2026-04-11T16:00:00Z", isSprint: false, length: "5.412 km", laps: 57, lapRecord: "1:31.447 (de la Rosa)", officialResults: { pole: "verstappen", pos1: "verstappen", pos2: "perez", pos3: "sainz", dotd: "sainz" }, practice: [] },
  { round: 5, id: "jeddah", name: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", country: "Arabie Saoudite 🇸🇦", city: "Djeddah", status: "completed", qualiDeadline: "2026-04-18T17:00:00Z", isSprint: false, length: "6.174 km", laps: 50, lapRecord: "1:30.734 (Hamilton)", officialResults: { pole: "verstappen", pos1: "verstappen", pos2: "leclerc", pos3: "perez", dotd: "bearman" }, practice: [] },
  { round: 6, id: "miami", name: "Miami Grand Prix", circuit: "Miami International Autodrome", country: "USA 🇺🇸", city: "Miami", status: "completed", qualiDeadline: "2026-05-02T20:00:00Z", isSprint: true, length: "5.412 km", laps: 57, lapRecord: "1:29.708 (Verstappen)", officialResults: { pole: "verstappen", pos1: "norris", pos2: "verstappen", pos3: "leclerc", dotd: "norris" }, practice: [] },
  { round: 7, id: "montreal", name: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve", country: "Canada 🇨🇦", city: "Montréal", status: "completed", qualiDeadline: "2026-05-23T20:00:00Z", isSprint: false, length: "4.361 km", laps: 70, lapRecord: "1:13.078 (Bottas)", officialResults: { pole: "russell", pos1: "verstappen", pos2: "norris", pos3: "russell", dotd: "norris" }, practice: [] },
  { round: 8, id: "monaco", name: "Grand Prix de Monaco", circuit: "Circuit de Monaco", country: "Monaco 🇲🇨", city: "Monte-Carlo", status: "completed", qualiDeadline: "2026-06-06T14:00:00Z", isSprint: false, length: "3.337 km", laps: 78, lapRecord: "1:12.909 (Hamilton)", officialResults: { pole: "leclerc", pos1: "leclerc", pos2: "piastri", pos3: "sainz", dotd: "leclerc" }, practice: [] },
  { round: 9, id: "barcelona", name: "Gran Premio de España (Barcelone)", circuit: "Circuit de Barcelona-Catalunya", country: "Espagne 🇪🇸", city: "Barcelone", status: "completed", qualiDeadline: "2026-06-13T14:00:00Z", isSprint: false, length: "4.657 km", laps: 66, lapRecord: "1:16.330 (Verstappen)", officialResults: { pole: "norris", pos1: "verstappen", pos2: "norris", pos3: "hamilton", dotd: "norris" }, practice: [] },
  { round: 10, id: "spielberg", name: "Austrian Grand Prix", circuit: "Red Bull Ring", country: "Autriche 🇦🇹", city: "Spielberg", status: "completed", qualiDeadline: "2026-06-27T14:00:00Z", isSprint: true, length: "4.318 km", laps: 71, lapRecord: "1:05.619 (Sainz)", officialResults: { pole: "verstappen", pos1: "russell", pos2: "piastri", pos3: "sainz", dotd: "norris" }, practice: [] },
  { round: 11, id: "silverstone", name: "British Grand Prix", circuit: "Silverstone Circuit", country: "Royaume-Uni 🇬🇧", city: "Silverstone", status: "completed", qualiDeadline: "2026-07-04T14:00:00Z", isSprint: false, length: "5.891 km", laps: 52, lapRecord: "1:27.097 (Verstappen)", officialResults: { pole: "russell", pos1: "hamilton", pos2: "verstappen", pos3: "norris", dotd: "hamilton" }, practice: [] },
  { round: 12, id: "spa", name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", country: "Belgique 🇧🇪", city: "Spa", status: "completed", qualiDeadline: "2026-07-18T14:00:00Z", isSprint: true, length: "7.004 km", laps: 44, lapRecord: "1:44.701 (Perez)", officialResults: { pole: "leclerc", pos1: "hamilton", pos2: "piastri", pos3: "leclerc", dotd: "hamilton" }, practice: [] },
  { round: 13, id: "hungaroring", name: "Hungarian Grand Prix", circuit: "Hungaroring", country: "Hongrie 🇭🇺", city: "Budapest", status: "completed", qualiDeadline: "2026-07-25T14:00:00Z", isSprint: false, length: "4.381 km", laps: 70, lapRecord: "1:16.627 (Hamilton)", officialResults: { pole: "norris", pos1: "piastri", pos2: "norris", pos3: "hamilton", dotd: "piastri" }, practice: [] },
  { round: 14, id: "zandvoort", name: "Dutch Grand Prix", circuit: "Circuit Zandvoort", country: "Pays-Bas 🇳🇱", city: "Zandvoort", status: "completed", qualiDeadline: "2026-08-22T13:00:00Z", isSprint: false, length: "4.259 km", laps: 72, lapRecord: "1:11.097 (Hamilton)", officialResults: { pole: "norris", pos1: "norris", pos2: "verstappen", pos3: "leclerc", dotd: "norris" }, practice: [] },
  { round: 15, id: "monza", name: "Gran Premio d'Italia (Monza)", circuit: "Autodromo Nazionale Monza", country: "Italie 🇮🇹", city: "Monza", status: "completed", qualiDeadline: "2026-09-05T14:00:00Z", isSprint: false, length: "5.793 km", laps: 53, lapRecord: "1:21.046 (Barrichello)", officialResults: { pole: "norris", pos1: "leclerc", pos2: "piastri", pos3: "norris", dotd: "leclerc" }, practice: [] },
  { round: 16, id: "madrid", name: "Gran Premio de Madrid (Madring)", circuit: "Madring IFEMA Circuit", country: "Espagne 🇪🇸", city: "Madrid", status: "completed", qualiDeadline: "2026-09-12T14:00:00Z", isSprint: false, length: "5.474 km", laps: 55, lapRecord: "1:18.200 (Sainz)", officialResults: { pole: "sainz", pos1: "sainz", pos2: "leclerc", pos3: "alonso", dotd: "alonso" }, practice: [] },
  { round: 17, id: "baku", name: "Azerbaijan Grand Prix (Bakou)", circuit: "Baku City Circuit", country: "Azerbaïdjan 🇦🇿", city: "Bakou", status: "active", qualiDeadline: new Date(Date.now() + (9 * 24 * 60 * 60 * 1000)).toISOString(), isSprint: false, length: "6.003 km", laps: 51, lapRecord: "1:43.009 (Leclerc)", officialResults: null, practice: [{ pos: 1, driver: "Leclerc", team: "Ferrari", time: "1:42.980", tire: "SOFT", laps: 17 }, { pos: 2, driver: "Piastri", team: "McLaren", time: "1:43.112", tire: "SOFT", laps: 19 }, { pos: 3, driver: "Hadjar", team: "Red Bull", time: "1:43.405", tire: "HARD", laps: 28 }] },
  { round: 18, id: "singapore", name: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", country: "Singapour 🇸🇬", city: "Marina Bay", status: "upcoming", qualiDeadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), isSprint: false, length: "4.940 km", laps: 62, lapRecord: "1:34.486 (Ricciardo)", officialResults: null, practice: [] },
  { round: 19, id: "austin", name: "United States Grand Prix", circuit: "Circuit of the Americas", country: "USA 🇺🇸", city: "Austin", status: "upcoming", qualiDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), isSprint: true, length: "5.513 km", laps: 56, lapRecord: "1:36.169 (Leclerc)", officialResults: null, practice: [] },
  { round: 20, id: "mexico", name: "Gran Premio de la Ciudad de México", circuit: "Autódromo Hermanos Rodríguez", country: "Mexique 🇲🇽", city: "Mexico", status: "upcoming", qualiDeadline: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(), isSprint: false, length: "4.304 km", laps: 71, lapRecord: "1:17.774 (Bottas)", officialResults: null, practice: [] },
  { round: 21, id: "saopaulo", name: "Grande Prêmio de São Paulo", circuit: "Autódromo de Interlagos", country: "Brésil 🇧🇷", city: "São Paulo", status: "upcoming", qualiDeadline: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(), isSprint: true, length: "4.309 km", laps: 71, lapRecord: "1:10.540 (Bottas)", officialResults: null, practice: [] },
  { round: 22, id: "lasvegas", name: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", country: "USA 🇺🇸", city: "Las Vegas", status: "upcoming", qualiDeadline: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000).toISOString(), isSprint: false, length: "6.201 km", laps: 50, lapRecord: "1:35.490 (Piastri)", officialResults: null, practice: [] },
  { round: 23, id: "lusail", name: "Qatar Grand Prix", circuit: "Lusail International Circuit", country: "Qatar 🇶🇦", city: "Lusail", status: "upcoming", qualiDeadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(), isSprint: true, length: "5.419 km", laps: 57, lapRecord: "1:24.319 (Verstappen)", officialResults: null, practice: [] },
  { round: 24, id: "abudhabi", name: "Abu Dhabi Grand Prix (Finale)", circuit: "Yas Marina Circuit", country: "Émirats Arabes Unis 🇦🇪", city: "Yas Island", status: "upcoming", qualiDeadline: new Date(Date.now() + 72 * 24 * 60 * 60 * 1000).toISOString(), isSprint: false, length: "5.281 km", laps: 58, lapRecord: "1:26.103 (Verstappen)", officialResults: null, practice: [] }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("bet");
  const [selectedRound, setSelectedRound] = useState(17);
  const [calendar, setCalendar] = useState(INITIAL_CALENDAR_2026);
  const [isApiSyncing, setIsApiSyncing] = useState(false);
  const [apiStatus, setApiStatus] = useState({ synced: false, lastUpdate: null });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPractice, setShowPractice] = useState(true);

  // Sélecteur de saison pour test rigoureux
  const [selectedSeason, setSelectedSeason] = useState("2026");
  const [seasonArchiveResults, setSeasonArchiveResults] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);

  // Utilisateur & Session
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");

  // Pronostics
  const [currentBet, setCurrentBet] = useState({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "", isLocked: false });
  const [formFeedback, setFormFeedback] = useState({ type: "", message: "" });
  const [savingBet, setSavingBet] = useState(false);

  // Superviseur
  const [adminResults, setAdminResults] = useState({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "" });
  const [adminSaving, setAdminSaving] = useState(false);

  const currentGP = calendar.find((gp) => gp.round === selectedRound) || calendar[0];
  const isAdmin = userProfile?.role === "admin";

  // Charger les résultats complets selon la saison sélectionnée
  const loadSeasonArchive = async (year) => {
    setLoadingArchive(true);
    try {
      const data = await fetchFullSeasonResults(year);
      if (data && data.length > 0) {
        setSeasonArchiveResults(data);
      } else {
        setSeasonArchiveResults([]);
      }
    } catch (e) {
      console.warn("Erreur chargement archive:", e);
      setSeasonArchiveResults([]);
    } finally {
      setLoadingArchive(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadSeasonArchive(selectedSeason);
    }
  }, [selectedSeason, activeTab]);

  // Synchronisation du calendrier 2026 avec l'API
  const syncWithF1Api = async () => {
    setIsApiSyncing(true);
    try {
      const apiRaces = await fetchOfficialCalendar("2026");
      if (apiRaces && apiRaces.length > 0) {
        setCalendar((prev) =>
          prev.map((localGP) => {
            const apiMatch = apiRaces.find((r) => r.round === localGP.round);
            if (!apiMatch) return localGP;
            return {
              ...localGP,
              qualiDeadline: apiMatch.qualiDeadline || localGP.qualiDeadline,
              isSprint: apiMatch.isSprintWeekend ?? localGP.isSprint
            };
          })
        );
        setApiStatus({ synced: true, lastUpdate: new Date().toLocaleTimeString() });
      }
    } catch (err) {
      console.warn("Échec synchronisation calendrier API:", err);
    } finally {
      setIsApiSyncing(false);
    }
  };

  useEffect(() => {
    syncWithF1Api();

    async function fetchProfile(userId) {
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (data) setUserProfile(data);
      } catch (e) {}
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (deadline) => {
    const diff = new Date(deadline).getTime() - currentTime.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, expired: false };
  };

  const timeRemaining = calculateTimeRemaining(currentGP.qualiDeadline);
  const isExpired = currentGP.status === "completed" || timeRemaining.expired;

  return (
    <div className="min-h-screen bg-[#0e0e14] text-white flex flex-col font-sans">
      {/* HEADER SPORTIF RESPONSIVE */}
      <header className="bg-[#15151e] border-b border-[#2b2b3d] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-[#e10600] text-white font-black italic tracking-tighter text-lg sm:text-xl px-2 sm:px-2.5 py-0.5 rounded shadow-lg shadow-red-900/40">
              F1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm tracking-wider text-zinc-100 uppercase">
                  Paddock Bets
                </span>
                <span className="text-[9px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {APP_VERSION}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <nav className="hidden md:flex items-center bg-[#1e1e2d] border border-[#2b2b3d] p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab("bet")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === "bet" ? "bg-[#e10600] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Flag className="w-3.5 h-3.5" /> Paris
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === "standings" ? "bg-[#e10600] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" /> Classement
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeTab === "history" ? "bg-[#e10600] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" /> Résultats & Saisons
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    activeTab === "admin" ? "bg-amber-500 text-black" : "text-amber-400 hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Superviseur
                </button>
              )}
            </nav>

            {/* Menu Smartphone */}
            <div className="md:hidden relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="bg-[#1e1e2d] border border-[#2b2b3d] text-zinc-200 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none appearance-none pr-7"
              >
                <option value="bet">🏁 Paris</option>
                <option value="standings">🏆 Classement</option>
                <option value="history">📜 Résultats & Saisons</option>
                {isAdmin && <option value="admin">🛡️ Superviseur</option>}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {user ? (
              <div className="flex items-center gap-1.5 bg-[#1e1e2d] border border-emerald-500/40 px-2 sm:px-3 py-1.5 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-zinc-100 font-semibold truncate max-w-[80px] sm:max-w-[120px]">
                  {userProfile?.username || user.email?.split("@")[0]}
                </span>
                <button onClick={() => supabase.auth.signOut()} className="text-zinc-400 hover:text-red-400 p-0.5">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-[#e10600] hover:bg-[#c30500] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SÉLECTEUR 24 GP */}
      <section className="bg-[#12121b] border-b border-[#2b2b3d] px-4 py-2.5 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-2 min-w-max">
          <Calendar className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
          {calendar.map((gp) => (
            <button
              key={gp.round}
              onClick={() => setSelectedRound(gp.round)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border ${
                selectedRound === gp.round
                  ? "bg-[#e10600] border-[#e10600] text-white shadow-lg shadow-red-900/30"
                  : gp.status === "completed"
                  ? "bg-[#181824] border-[#2b2b3d] text-zinc-400 hover:text-white"
                  : "bg-[#181824] border-[#2b2b3d] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <span>R{gp.round}</span>
              <span>{gp.city}</span>
              {gp.isSprint && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-mono">SPRINT</span>}
              {gp.status === "active" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === "bet" && (
          <>
            {/* CARTE GP EN COURS & COMPTE À REBOURS */}
            <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#e10600] uppercase tracking-wider">
                      Round {currentGP.round} • {currentGP.country}
                    </span>
                    {currentGP.isSprint && (
                      <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Week-end Sprint
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-black text-white mt-1">{currentGP.name}</h1>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-[#e10600]" />
                    {currentGP.circuit}
                  </p>
                </div>

                <div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl flex items-center gap-4 shrink-0">
                  <Clock className="w-6 h-6 text-[#e10600] animate-pulse" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">
                      Compte à rebours Qualifications
                    </div>
                    {isExpired ? (
                      <div className="text-xs font-bold text-red-400">PRONOSTICS FERMÉS</div>
                    ) : (
                      <div className="text-lg font-black font-mono text-white">
                        {timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TRACÉ DU CIRCUIT */}
              <div className="mt-4 pt-4 border-t border-[#2b2b3d] flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-2/3 bg-[#0e0e14] rounded-lg p-2 border border-[#2b2b3d]">
                  {currentGP.id === "baku" ? CIRCUIT_SVGS.baku : currentGP.id === "barcelona" ? CIRCUIT_SVGS.barcelona : CIRCUIT_SVGS.default}
                </div>
                <div className="w-full md:w-1/3 text-xs space-y-2 bg-[#15151e] p-3 rounded-lg border border-[#2b2b3d]">
                  <div className="flex justify-between"><span className="text-zinc-500">Longueur:</span> <strong>{currentGP.length}</strong></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Tours en course:</span> <strong>{currentGP.laps}</strong></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Record officiel:</span> <strong className="text-amber-400">{currentGP.lapRecord}</strong></div>
                </div>
              </div>
            </div>

            {/* FORMULAIRE DES PARIS */}
            <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-[#e10600]" />
                Vos 5 Pronostics pour {currentGP.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl">
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Pole Position (+1 pt)</label>
                  <select
                    value={currentBet.pole}
                    onChange={(e) => setCurrentBet({ ...currentBet, pole: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
                  >
                    <option value="">Choisir un pilote...</option>
                    {DRIVERS_2026.map((d) => <option key={d.id} value={d.id}>#{d.number} {d.name} ({d.team})</option>)}
                  </select>
                </div>

                <div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl">
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Driver of the Day (+1 pt)</label>
                  <select
                    value={currentBet.dotd}
                    onChange={(e) => setCurrentBet({ ...currentBet, dotd: e.target.value })}
                    className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
                  >
                    <option value="">Choisir un pilote...</option>
                    {DRIVERS_2026.map((d) => <option key={d.id} value={d.id}>#{d.number} {d.name} ({d.team})</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl mt-4">
                <label className="text-xs font-bold text-zinc-300 block mb-2">Podium (1er, 2e, 3e - Anti-Doublon)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-amber-400 font-bold block mb-1">1er 🥇</span>
                    <select
                      value={currentBet.pos1}
                      onChange={(e) => setCurrentBet({ ...currentBet, pos1: e.target.value })}
                      className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
                    >
                      <option value="">Choisir...</option>
                      {DRIVERS_2026.map((d) => (
                        <option key={d.id} value={d.id} disabled={currentBet.pos2 === d.id || currentBet.pos3 === d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-300 font-bold block mb-1">2e 🥈</span>
                    <select
                      value={currentBet.pos2}
                      onChange={(e) => setCurrentBet({ ...currentBet, pos2: e.target.value })}
                      className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
                    >
                      <option value="">Choisir...</option>
                      {DRIVERS_2026.map((d) => (
                        <option key={d.id} value={d.id} disabled={currentBet.pos1 === d.id || currentBet.pos3 === d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] text-amber-600 font-bold block mb-1">3e 🥉</span>
                    <select
                      value={currentBet.pos3}
                      onChange={(e) => setCurrentBet({ ...currentBet, pos3: e.target.value })}
                      className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
                    >
                      <option value="">Choisir...</option>
                      {DRIVERS_2026.map((d) => (
                        <option key={d.id} value={d.id} disabled={currentBet.pos1 === d.id || currentBet.pos2 === d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ONGLET HISTORIQUE & SÉLECTEUR DE SAISON */}
        {activeTab === "history" && (
          <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2b3d] pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" />
                  Résultats & Archives Officielles
                </h2>
                <p className="text-xs text-zinc-400">Interrogation en direct des API Jolpica & Ergast F1</p>
              </div>

              {/* SÉLECTEUR DE SAISON */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Saison :
                </span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-[#15151e] border border-[#2b2b3d] text-white text-xs font-bold rounded-lg px-3 py-1.5 outline-none"
                >
                  <option value="2026">2026 (En cours)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024 (Saison complète terminée)</option>
                </select>
              </div>
            </div>

            {loadingArchive ? (
              <div className="py-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#e10600]" />
                <span>Chargement des données officielles depuis l'API Jolpica...</span>
              </div>
            ) : selectedSeason === "2026" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calendar.filter((gp) => gp.status === "completed").map((gp) => (
                  <div key={gp.round} className="bg-[#15151e] border border-[#2b2b3d] p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">Round {gp.round} • {gp.name}</strong>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Terminé</span>
                    </div>
                    <div className="pt-2 border-t border-[#2b2b3d] space-y-1">
                      <div>🥇 1er: <strong className="text-amber-400">{gp.officialResults?.pos1?.toUpperCase()}</strong></div>
                      <div>🥈 2e: <strong className="text-zinc-300">{gp.officialResults?.pos2?.toUpperCase()}</strong></div>
                      <div>🥉 3e: <strong className="text-amber-600">{gp.officialResults?.pos3?.toUpperCase()}</strong></div>
                      <div className="text-zinc-500 pt-1">Pole: {gp.officialResults?.pole?.toUpperCase()} • DotD: {gp.officialResults?.dotd?.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonArchiveResults.map((race) => (
                  <div key={race.round} className="bg-[#15151e] border border-[#2b2b3d] p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">R{race.round} • {race.raceName}</strong>
                      <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded font-mono">
                        {race.date}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{race.circuitName} ({race.country})</div>
                    <div className="pt-2 border-t border-[#2b2b3d] space-y-1">
                      <div>🥇 1er: <strong className="text-amber-400">{race.p1 ? `${race.p1.name} (${race.p1.team})` : "N/A"}</strong></div>
                      <div>🥈 2e: <strong className="text-zinc-300">{race.p2 ? `${race.p2.name} (${race.p2.team})` : "N/A"}</strong></div>
                      <div>🥉 3e: <strong className="text-amber-600">{race.p3 ? `${race.p3.name} (${race.p3.team})` : "N/A"}</strong></div>
                      {race.fastestLap && (
                        <div className="text-zinc-500 pt-1">⚡ Meilleur tour: <span className="text-emerald-400">{race.fastestLap}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET CLASSEMENT */}
        {activeTab === "standings" && (
          <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
              Classement Général des Collègues
            </h2>
            <div className="space-y-2">
              {[
                { rank: 1, name: "Thomas R.", points: 52, badge: "🥇 P1 Leader" },
                { rank: 2, name: "Alexandre L.", points: 48, badge: "🥈 P2 Chaser" },
                { rank: 3, name: "Sarah M.", points: 41, badge: "🥉 P3 Podium" },
                { rank: 4, name: "Julien B.", points: 36, badge: "Top 5" }
              ].map((p) => (
                <div key={p.rank} className="flex items-center justify-between p-3 bg-[#15151e] border border-[#2b2b3d] rounded-xl text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-zinc-400 w-6">#{p.rank}</span>
                    <span className="font-bold text-white">{p.name}</span>
                  </div>
                  <span className="font-mono font-black text-[#e10600]">{p.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#15151e] border-t border-[#2b2b3d] py-4 text-center text-xs text-zinc-500">
        F1 Paddock Bets 2026 • {APP_VERSION} • API Jolpica F1
      </footer>
    </div>
  );
}