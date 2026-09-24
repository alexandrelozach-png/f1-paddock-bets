// --- VERSION: ALPHA v3.12 ---
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
ChevronUp,
Sparkles,
Lock,
RefreshCw,
Zap,
Globe,
Gauge,
XCircle,
PlusCircle,
Share2,
Copy,
Crown,
Check
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { fetchOfficialCalendar, fetchFullSeasonResults, runAutoSyncPipeline } from "./f1ApiService";

// --- VERSION DE L'APPLICATION ---
const APP_VERSION = "ALPHA v3.12";

// --- GRILLE PILOTES 2026 OFFICIELLE (11 ÉQUIPES - 22 PILOTES AVEC CADILLAC) ---
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

  { id: "bearman", name: "Oliver Bearman", number: 87, team: "Haas", teamColor: "#B6BABD" },

  { id: "perez", name: "Sergio Pérez", number: 11, team: "Cadillac", teamColor: "#D4AF37" },

  { id: "bottas", name: "Valtteri Bottas", number: 77, team: "Cadillac", teamColor: "#D4AF37" }

];



// --- TRACÉS VECTORIELS SVG OFFICIELS ---

const CIRCUIT_SVGS = {

  madrid: (
    <img 
      src="https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000001/common/f1/2026/track/2026trackmadringdetailed.webp" 
      alt="Madrid City Circuit" 
      className="w-full h-36 object-contain filter invert opacity-90 brightness-125"
    />
  ),

  baku: (
    <img 
      src="https://media.formula1.com/image/upload/c_fit,h_704/q_auto/v1740000001/common/f1/2026/track/2026trackbakudetailed.webp" 
      alt="Baku City Circuit" 
      className="w-full h-36 object-contain filter invert opacity-90 brightness-125"
    />
  ),

sepang: (

<svg viewBox="0 0 400 180" className="w-full h-36 stroke-current">

<defs>

<linearGradient id="sepangGrad" x1="0%" y1="0%" x2="100%" y2="100%">

<stop offset="0%" stopColor="#10b981" />

<stop offset="50%" stopColor="#f59e0b" />

<stop offset="100%" stopColor="#3b82f6" />

</linearGradient>

</defs>

<path d="M 50 140 L 330 140 C 360 140 360 110 330 90 L 230 90 C 200 90 200 50 240 50 L 310 50 C 330 50 330 25 300 25 L 120 25 C 90 25 80 50 100 70 L 130 90 C 150 110 130 130 100 130 L 50 140 Z" 

fill="none" stroke="#2b2b3d" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />

<path d="M 50 140 L 330 140 C 360 140 360 110 330 90 L 230 90 C 200 90 200 50 240 50 L 310 50 C 330 50 330 25 300 25 L 120 25 C 90 25 80 50 100 70 L 130 90 C 150 110 130 130 100 130 L 50 140 Z" 

fill="none" stroke="url(#sepangGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

<line x1="180" y1="132" x2="180" y2="148" stroke="#ffffff" strokeWidth="3" />

<text x="185" y="162" fill="#ffffff" fontSize="9" fontFamily="monospace">SEPANG INTERNATIONAL (5.543 KM)</text>

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



// --- CALENDRIER 2026 STRICTEMENT CHRONOLOGIQUE ---

const INITIAL_CALENDAR_2026 = [

  { round: 1, id: "melbourne", name: "Australian Grand Prix", circuit: "Albert Park Circuit", country: "Australie 🇦🇺", city: "Melbourne", status: "completed", isCancelled: false, qualiDeadline: "2026-03-07T05:00:00Z", isSprint: false, length: "5.278 km", laps: 58, lapRecord: "1:19.813 (Leclerc)", officialResults: { pole: "norris", pos1: "norris", pos2: "verstappen", pos3: "leclerc", dotd: "sainz" }, practice: [] },

  { round: 2, id: "shanghai", name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", country: "Chine 🇨🇳", city: "Shanghai", status: "completed", isCancelled: false, qualiDeadline: "2026-03-14T07:00:00Z", isSprint: true, length: "5.451 km", laps: 56, lapRecord: "1:32.238 (Schumacher)", officialResults: { pole: "verstappen", pos1: "verstappen", pos2: "norris", pos3: "leclerc", dotd: "leclerc" }, practice: [] },

  { round: 3, id: "suzuka", name: "Japanese Grand Prix", circuit: "Suzuka Circuit", country: "Japon 🇯🇵", city: "Suzuka", status: "completed", isCancelled: false, qualiDeadline: "2026-03-28T06:00:00Z", isSprint: false, length: "5.807 km", laps: 53, lapRecord: "1:30.983 (Hamilton)", officialResults: { pole: "verstappen", pos1: "verstappen", pos2: "norris", pos3: "sainz", dotd: "leclerc" }, practice: [] },

  { round: 4, id: "sakhir", name: "Bahrain Grand Prix (Annulé)", circuit: "Bahrain International Circuit", country: "Bahreïn 🇧🇭", city: "Sakhir", status: "completed", isCancelled: true, qualiDeadline: "2026-04-11T16:00:00Z", isSprint: false, length: "5.412 km", laps: 57, lapRecord: "1:31.447 (de la Rosa)", officialResults: null, practice: [] },

  { round: 5, id: "jeddah", name: "Saudi Arabian Grand Prix (Annulé)", circuit: "Jeddah Corniche Circuit", country: "Arabie Saoudite 🇸🇦", city: "Djeddah", status: "completed", isCancelled: true, qualiDeadline: "2026-04-18T17:00:00Z", isSprint: false, length: "6.174 km", laps: 50, lapRecord: "1:30.734 (Hamilton)", officialResults: null, practice: [] },

  { round: 6, id: "miami", name: "Miami Grand Prix", circuit: "Miami International Autodrome", country: "USA 🇺🇸", city: "Miami", status: "completed", isCancelled: false, qualiDeadline: "2026-05-02T20:00:00Z", isSprint: true, length: "5.412 km", laps: 57, lapRecord: "1:29.708 (Verstappen)", officialResults: { pole: "verstappen", pos1: "norris", pos2: "verstappen", pos3: "leclerc", dotd: "norris" }, practice: [] },

  { round: 7, id: "montreal", name: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve", country: "Canada 🇨🇦", city: "Montréal", status: "completed", isCancelled: false, qualiDeadline: "2026-05-23T20:00:00Z", isSprint: false, length: "4.361 km", laps: 70, lapRecord: "1:13.078 (Bottas)", officialResults: { pole: "russell", pos1: "verstappen", pos2: "norris", pos3: "russell", dotd: "norris" }, practice: [] },

  { round: 8, id: "monaco", name: "Grand Prix de Monaco", circuit: "Circuit de Monaco", country: "Monaco 🇲🇨", city: "Monte-Carlo", status: "completed", isCancelled: false, qualiDeadline: "2026-06-06T14:00:00Z", isSprint: false, length: "3.337 km", laps: 78, lapRecord: "1:12.909 (Hamilton)", officialResults: { pole: "leclerc", pos1: "leclerc", pos2: "piastri", pos3: "sainz", dotd: "leclerc" }, practice: [] },

  { round: 9, id: "barcelona", name: "Gran Premio de España (Barcelone)", circuit: "Circuit de Barcelona-Catalunya", country: "Espagne 🇪🇸", city: "Barcelone", status: "completed", isCancelled: false, qualiDeadline: "2026-06-13T14:00:00Z", isSprint: false, length: "4.657 km", laps: 66, lapRecord: "1:16.330 (Verstappen)", officialResults: { pole: "norris", pos1: "verstappen", pos2: "norris", pos3: "hamilton", dotd: "norris" }, practice: [] },

  { round: 10, id: "spielberg", name: "Austrian Grand Prix", circuit: "Red Bull Ring", country: "Autriche 🇦🇹", city: "Spielberg", status: "completed", isCancelled: false, qualiDeadline: "2026-06-27T14:00:00Z", isSprint: true, length: "4.318 km", laps: 71, lapRecord: "1:05.619 (Sainz)", officialResults: { pole: "verstappen", pos1: "russell", pos2: "piastri", pos3: "sainz", dotd: "norris" }, practice: [] },

  { round: 11, id: "silverstone", name: "British Grand Prix", circuit: "Silverstone Circuit", country: "Royaume-Uni 🇬🇧", city: "Silverstone", status: "completed", isCancelled: false, qualiDeadline: "2026-07-04T14:00:00Z", isSprint: false, length: "5.891 km", laps: 52, lapRecord: "1:27.097 (Verstappen)", officialResults: { pole: "russell", pos1: "hamilton", pos2: "verstappen", pos3: "norris", dotd: "hamilton" }, practice: [] },

  { round: 12, id: "spa", name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", country: "Belgique 🇧🇪", city: "Spa", status: "completed", isCancelled: false, qualiDeadline: "2026-07-18T14:00:00Z", isSprint: true, length: "7.004 km", laps: 44, lapRecord: "1:44.701 (Perez)", officialResults: { pole: "leclerc", pos1: "hamilton", pos2: "piastri", pos3: "leclerc", dotd: "hamilton" }, practice: [] },

  { round: 13, id: "hungaroring", name: "Hungarian Grand Prix", circuit: "Hungaroring", country: "Hongrie 🇭🇺", city: "Budapest", status: "completed", isCancelled: false, qualiDeadline: "2026-07-25T14:00:00Z", isSprint: false, length: "4.381 km", laps: 70, lapRecord: "1:16.627 (Hamilton)", officialResults: { pole: "norris", pos1: "piastri", pos2: "norris", pos3: "hamilton", dotd: "piastri" }, practice: [] },

  { round: 14, id: "zandvoort", name: "Dutch Grand Prix", circuit: "Circuit Zandvoort", country: "Pays-Bas 🇳🇱", city: "Zandvoort", status: "completed", isCancelled: false, qualiDeadline: "2026-08-22T13:00:00Z", isSprint: false, length: "4.259 km", laps: 72, lapRecord: "1:11.097 (Hamilton)", officialResults: { pole: "norris", pos1: "norris", pos2: "verstappen", pos3: "leclerc", dotd: "norris" }, practice: [] },

  { round: 15, id: "monza", name: "Gran Premio d'Italia (Monza)", circuit: "Autodromo Nazionale Monza", country: "Italie 🇮🇹", city: "Monza", status: "completed", isCancelled: false, qualiDeadline: "2026-09-05T14:00:00Z", isSprint: false, length: "5.793 km", laps: 53, lapRecord: "1:21.046 (Barrichello)", officialResults: { pole: "norris", pos1: "leclerc", pos2: "piastri", pos3: "norris", dotd: "leclerc" }, practice: [] },

  { round: 16, id: "madrid", name: "Gran Premio de Madrid (Madring)", circuit: "Madring IFEMA Circuit", country: "Espagne 🇪🇸", city: "Madrid", status: "completed", isCancelled: false, qualiDeadline: "2026-09-12T14:00:00Z", isSprint: false, length: "5.474 km", laps: 55, lapRecord: "1:18.200 (Sainz)", officialResults: { pole: "sainz", pos1: "sainz", pos2: "leclerc", pos3: "alonso", dotd: "alonso" }, practice: [] },

  { 

round: 17, 

id: "baku", 

name: "Azerbaijan Grand Prix (Bakou)", 

circuit: "Baku City Circuit", 

country: "Azerbaïdjan 🇦🇿", 

city: "Bakou", 

status: "active", 

isCancelled: false,

qualiDeadline: "2026-09-25T14:00:00Z",

isSprint: false, 

length: "6.003 km", 

laps: 51, 

lapRecord: "1:43.009 (Leclerc)", 

officialResults: null, 

practice: [] 

  },

  { 

round: 18, 

id: "sepang", 

name: "Petronas Malaysian Grand Prix", 

circuit: "Petronas Sepang International Circuit", 

country: "Malaisie 🇲🇾", 

city: "Sepang", 

status: "upcoming", 

isCancelled: false, 

qualiDeadline: "2026-10-03T06:00:00Z", 

isSprint: false, 

length: "5.543 km", 

laps: 56, 

lapRecord: "1:34.080 (Vettel)", 

officialResults: null, 

practice: [] 

  },

  { round: 19, id: "singapore", name: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", country: "Singapour 🇸🇬", city: "Marina Bay", status: "upcoming", isCancelled: false, qualiDeadline: "2026-10-10T13:00:00Z", isSprint: false, length: "4.940 km", laps: 62, lapRecord: "1:34.486 (Ricciardo)", officialResults: null, practice: [] },

  { round: 20, id: "austin", name: "United States Grand Prix", circuit: "Circuit of the Americas", country: "USA 🇺🇸", city: "Austin", status: "upcoming", isCancelled: false, qualiDeadline: "2026-10-24T22:00:00Z", isSprint: true, length: "5.513 km", laps: 56, lapRecord: "1:36.169 (Leclerc)", officialResults: null, practice: [] },

  { round: 21, id: "mexico", name: "Gran Premio de México", circuit: "Autódromo Hermanos Rodríguez", country: "Mexique 🇲🇽", city: "Mexico", status: "upcoming", isCancelled: false, qualiDeadline: "2026-10-31T20:00:00Z", isSprint: false, length: "4.304 km", laps: 71, lapRecord: "1:17.774 (Bottas)", officialResults: null, practice: [] },

  { round: 22, id: "saopaulo", name: "Grande Prêmio de São Paulo", circuit: "Autódromo de Interlagos", country: "Brésil 🇧🇷", city: "São Paulo", status: "upcoming", isCancelled: false, qualiDeadline: "2026-11-07T18:00:00Z", isSprint: true, length: "4.309 km", laps: 71, lapRecord: "1:10.540 (Bottas)", officialResults: null, practice: [] },

  { round: 23, id: "lasvegas", name: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Circuit", country: "USA 🇺🇸", city: "Las Vegas", status: "upcoming", isCancelled: false, qualiDeadline: "2026-11-21T06:00:00Z", isSprint: false, length: "6.201 km", laps: 50, lapRecord: "1:35.490 (Piastri)", officialResults: null, practice: [] },

  { round: 24, id: "lusail", name: "Qatar Grand Prix", circuit: "Lusail International Circuit", country: "Qatar 🇶🇦", city: "Lusail", status: "upcoming", isCancelled: false, qualiDeadline: "2026-11-28T18:00:00Z", isSprint: true, length: "5.419 km", laps: 57, lapRecord: "1:24.319 (Verstappen)", officialResults: null, practice: [] },

  { round: 25, id: "abudhabi", name: "Abu Dhabi Grand Prix (Finale)", circuit: "Yas Marina Circuit", country: "Émirats Arabes Unis 🇦🇪", city: "Yas Island", status: "upcoming", isCancelled: false, qualiDeadline: "2026-12-05T14:00:00Z", isSprint: false, length: "5.281 km", laps: 58, lapRecord: "1:26.103 (Verstappen)", officialResults: null, practice: [] }

];



export default function App() {

const [activeTab, setActiveTab] = useState("bet");

const [selectedRound, setSelectedRound] = useState(17);

const [calendar, setCalendar] = useState(INITIAL_CALENDAR_2026);

const [showPractice, setShowPractice] = useState(true);

const [selectedPracticeSession, setSelectedPracticeSession] = useState("FP3");

const [currentTime, setCurrentTime] = useState(Date.now());

const [syncEngineLogs, setSyncEngineLogs] = useState([]);



// Gestion des Teams / Groupes

const [currentTeam, setCurrentTeam] = useState({

name: "Scuderia Bosch R&D",

inviteCode: "SB2026",

isPrincipal: true,

members: [

      { id: "1", name: "Alexandre L. (Alex)", role: "Team Principal", points: 84, rank: 1, avatar: "🏎️" },

      { id: "2", name: "Mélissa", role: "Pilote Titulaire", points: 79, rank: 2, avatar: "⚡" },

      { id: "3", name: "Jacques", role: "Pilote Titulaire", points: 71, rank: 3, avatar: "🏁" },

      { id: "4", name: "Léo", role: "Ingénieur Stratégie", points: 68, rank: 4, avatar: "📊" },

      { id: "5", name: "Marion", role: "Pilote Essais", points: 64, rank: 5, avatar: "🎯" },

      { id: "6", name: "Clément", role: "Télémétrie", points: 59, rank: 6, avatar: "🛠️" }

    ]

  });



const [showTeamModal, setShowTeamModal] = useState(false);
const [copiedCode, setCopiedCode] = useState(false);
const [joinCodeInput, setJoinCodeInput] = useState("");
const [userTeam, setUserTeam] = useState(null); // L'écurie réelle de l'utilisateur connecté
const [checkingTeam, setCheckingTeam] = useState(true); // Chargement en cours
const [teamOnboardingMode, setTeamOnboardingMode] = useState("choice"); // "choice" | "create" | "join"
const [newTeamName, setNewTeamName] = useState("");
const [joinTeamCode, setJoinTeamCode] = useState("");
const [teamActionError, setTeamActionError] = useState("");
const [teamActionLoading, setTeamActionLoading] = useState(false);


const [officialResultForm, setOfficialResultForm] = useState({
  pole: "", pos1: "", pos2: "", pos3: "", dotd: ""
});
const [fetchingResults, setFetchingResults] = useState(false);
const [resultSaveFeedback, setResultSaveFeedback] = useState({ visible: false, message: "" });

// Sélecteur de saison & Archives

const [selectedSeason, setSelectedSeason] = useState("2026");

const [seasonArchiveResults, setSeasonArchiveResults] = useState([]);

const [season2026OfficialFromDB, setSeason2026OfficialFromDB] = useState([]);

const [loadingArchive, setLoadingArchive] = useState(false);



// Utilisateur & Session

const [user, setUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

const [showAuthModal, setShowAuthModal] = useState(false);
const [authMode, setAuthMode] = useState("login"); // "login" ou "signup"
const [authEmail, setAuthEmail] = useState("");
const [authPassword, setAuthPassword] = useState("");
const [authUsername, setAuthUsername] = useState("");
const [authError, setAuthError] = useState("");
const [authLoadingAction, setAuthLoadingAction] = useState(false);


// Pronostics & Validation

const [currentBet, setCurrentBet] = useState({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "", isLocked: false });
const [saveFeedback, setSaveFeedback] = useState({ visible: false, message: "" });
const currentGP = calendar.find((gp) => gp.round === selectedRound) || calendar[0];
const activeGP = calendar.find((gp) => gp.status === "active") || calendar[16];
const isTeamPrincipal = userTeam?.team_principal_id === user?.id;

//correspondance des pilotes

const findDriverIdByFamilyName = (familyName) => {
  if (!familyName) return "";
  const match = DRIVERS_2026.find((d) =>
    d.name.toLowerCase().includes(familyName.toLowerCase())
  );
  return match?.id || "";
};

// Raccourci vers le Grand Prix actif (Bouton F1)

const goToActiveGrandPrix = () => {

setSelectedRound(activeGP.round);

setActiveTab("bet");

  };



// Copie du code d'invitation

const copyInviteCode = () => {
  if (!userTeam?.invite_code) return;
  navigator.clipboard.writeText(userTeam.invite_code);
  setCopiedCode(true);
  setTimeout(() => setCopiedCode(false), 2500);
};

// Chargement intelligent des archives ou de la saison 2026 depuis Supabase

const loadSeasonArchive = async (year) => {
setLoadingArchive(true);
try {
if (year === "2026") {
const { data: dbData, error: dbErr } = await supabase

          .from("grand_prix")

          .select("*, official_results(*)")

          .eq("season", 2026)

          .order("round", { ascending: true });



if (!dbErr && dbData && dbData.length > 0) {

const formatted = dbData

            .filter((g) => g.completed)

            .map((g) => {

const res = g.official_results?.[0] || g.official_results;

return {

round: g.round,

raceName: g.name,

circuitName: g.circuit_name,

country: g.country,

date: g.race_start_time?.split("T")[0] || "2026",

isCancelled: g.is_cancelled,

pole: res?.pole_id ? DRIVERS_2026.find((d) => d.id === res.pole_id)?.name || res.pole_id.toUpperCase() : "N/A",

p1: res?.pos1_id ? { name: DRIVERS_2026.find((d) => d.id === res.pos1_id)?.name || res.pos1_id.toUpperCase(), team: DRIVERS_2026.find((d) => d.id === res.pos1_id)?.team || "" } : null,

p2: res?.pos2_id ? { name: DRIVERS_2026.find((d) => d.id === res.pos2_id)?.name || res.pos2_id.toUpperCase(), team: DRIVERS_2026.find((d) => d.id === res.pos2_id)?.team || "" } : null,

p3: res?.pos3_id ? { name: DRIVERS_2026.find((d) => d.id === res.pos3_id)?.name || res.pos3_id.toUpperCase(), team: DRIVERS_2026.find((d) => d.id === res.pos3_id)?.team || "" } : null,

dotd: res?.dotd_id ? DRIVERS_2026.find((d) => d.id === res.dotd_id)?.name || res.dotd_id.toUpperCase() : null

              };

            });

setSeason2026OfficialFromDB(formatted);

        }

      } else {

const { data: dbData, error: dbErr } = await supabase

          .from("season_archives")

          .select("*")

          .eq("season", parseInt(year, 10))

          .order("round", { ascending: true });



if (!dbErr && dbData && dbData.length > 0) {

setSeasonArchiveResults(

dbData.map((r) => ({

round: r.round,

raceName: r.race_name,

circuitName: r.circuit_name,

country: r.country,

date: r.race_date,

p1: { name: r.p1_name, team: r.p1_team },

p2: { name: r.p2_name, team: r.p2_team },

p3: { name: r.p3_name, team: r.p3_team },

fastestLap: r.fastest_lap,

dotd: r.dotd_name || r.p1_name

            }))

          );

        } else {

const data = await fetchFullSeasonResults(year);

setSeasonArchiveResults(data || []);

        }

      }

    } catch (e) {

console.warn("Erreur chargement archive:", e);

    } finally {

setLoadingArchive(false);

    }

  };



useEffect(() => {

if (activeTab === "history") {

loadSeasonArchive(selectedSeason);

    }

  }, [selectedSeason, activeTab]);

//Gestion des équipes  
  const checkUserTeam = async () => {
    if (!user?.id) {
      setUserTeam(null);
      setCheckingTeam(false);
      return;
    }
  
    setCheckingTeam(true);
  
    const { data, error } = await supabase
      .from("team_members")
      .select("*, teams(*)")
      .eq("user_id", user.id)
      .maybeSingle();
  
    if (!error && data?.teams) {
      setUserTeam(data.teams);
    } else {
      setUserTeam(null);
    }
  
    setCheckingTeam(false);
  };
  
  useEffect(() => {
    checkUserTeam();
  }, [user]);

//chargement des membres

const [teamMembersList, setTeamMembersList] = useState([]);

const loadTeamMembers = async (teamId) => {
  if (!teamId) return;

  const { data, error } = await supabase
    .from("team_members")
    .select("user_id, role, profiles(username, email)")
    .eq("team_id", teamId);

  if (!error && data) {
    const membersWithPoints = await Promise.all(
      data.map(async (m) => {
        const { data: betsData } = await supabase
          .from("bets")
          .select("points_awarded")
          .eq("user_id", m.user_id);

        const totalPoints = betsData?.reduce((sum, b) => sum + (b.points_awarded || 0), 0) || 0;

        return {
          id: m.user_id,
          name: m.profiles?.username || m.profiles?.email?.split("@")[0] || "Utilisateur",
          role: m.role,
          points: totalPoints
        };
      })
    );

    membersWithPoints.sort((a, b) => b.points - a.points);
    setTeamMembersList(membersWithPoints);
  }
};

useEffect(() => {
  if (userTeam?.id) {
    loadTeamMembers(userTeam.id);
  }
}, [userTeam]);

//création écurie
const generateInviteCode = (teamName) => {
  const prefix = teamName.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "F1";
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomPart}`;
};

const handleCreateTeam = async () => {
  setTeamActionError("");

  if (!newTeamName.trim() || newTeamName.trim().length < 3) {
    setTeamActionError("Le nom de l'écurie doit contenir au moins 3 caractères.");
    return;
  }

  setTeamActionLoading(true);

  try {
    // Vérification préalable de disponibilité du nom
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("name", newTeamName.trim())
      .maybeSingle();

    if (existingTeam) {
      setTeamActionError("Ce nom d'écurie est déjà pris. Merci d'en choisir un autre.");
      setTeamActionLoading(false);
      return;
    }

    const inviteCode = generateInviteCode(newTeamName.trim());

    const { data: newTeam, error: createError } = await supabase
      .from("teams")
      .insert({
        name: newTeamName.trim(),
        invite_code: inviteCode,
        team_principal_id: user.id
      })
      .select()
      .single();

    if (createError) throw createError;

    // Ajout automatique du créateur comme membre (Team Principal)
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: newTeam.id,
        user_id: user.id,
        role: "Team Principal"
      });

    if (memberError) throw memberError;

    setUserTeam(newTeam);
    setNewTeamName("");
  } catch (err) {
    if (err.message?.includes("duplicate")) {
      setTeamActionError("Ce nom d'écurie est déjà pris. Merci d'en choisir un autre.");
    } else {
      setTeamActionError(err.message || "Une erreur est survenue lors de la création.");
    }
  } finally {
    setTeamActionLoading(false);
  }
};

//fonction rejoindre une écurie
const handleJoinTeam = async () => {
  setTeamActionError("");

  if (!joinTeamCode.trim()) {
    setTeamActionError("Merci de saisir un code d'invitation.");
    return;
  }

  setTeamActionLoading(true);

  try {
    const { data: foundTeam, error: findError } = await supabase
      .from("teams")
      .select("*")
      .eq("invite_code", joinTeamCode.trim().toUpperCase())
      .maybeSingle();

    if (findError || !foundTeam) {
      setTeamActionError("Ce code d'invitation n'existe pas. Vérifie-le auprès de ton collègue.");
      setTeamActionLoading(false);
      return;
    }

    const { error: joinError } = await supabase
      .from("team_members")
      .insert({
        team_id: foundTeam.id,
        user_id: user.id,
        role: "Pilote Titulaire"
      });

    if (joinError) throw joinError;

    setUserTeam(foundTeam);
    setJoinTeamCode("");
  } catch (err) {
    if (err.message?.includes("duplicate")) {
      setTeamActionError("Tu fais déjà partie de cette écurie.");
    } else {
      setTeamActionError(err.message || "Une erreur est survenue.");
    }
  } finally {
    setTeamActionLoading(false);
  }
};

//Recupération auto via API

const handleAutoFetchResults = async () => {
  setFetchingResults(true);
  setResultSaveFeedback({ visible: false, message: "" });

  try {
    // Récupération de la pole position (résultats qualifs)
    const qualiRes = await fetch(
      `https://api.jolpi.ca/ergast/f1/2026/${currentGP.round}/qualifying.json`
    );
    const qualiData = await qualiRes.json();
    const poleDriverFamily = qualiData?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0]?.Driver?.familyName;

    // Récupération du podium (résultats course)
    const raceRes = await fetch(
      `https://api.jolpi.ca/ergast/f1/2026/${currentGP.round}/results.json`
    );
    const raceData = await raceRes.json();
    const results = raceData?.MRData?.RaceTable?.Races?.[0]?.Results || [];

    const pos1Family = results[0]?.Driver?.familyName;
    const pos2Family = results[1]?.Driver?.familyName;
    const pos3Family = results[2]?.Driver?.familyName;

    if (!poleDriverFamily && results.length === 0) {
      setResultSaveFeedback({
        visible: true,
        message: "⚠️ Aucun résultat disponible pour l'instant sur l'API (course pas encore terminée ou données pas encore publiées)."
      });
      setFetchingResults(false);
      return;
    }

    setOfficialResultForm((prev) => ({
      ...prev,
      pole: findDriverIdByFamilyName(poleDriverFamily) || prev.pole,
      pos1: findDriverIdByFamilyName(pos1Family) || prev.pos1,
      pos2: findDriverIdByFamilyName(pos2Family) || prev.pos2,
      pos3: findDriverIdByFamilyName(pos3Family) || prev.pos3
    }));

    setResultSaveFeedback({
      visible: true,
      message: "✅ Pole et podium récupérés automatiquement ! Vérifiez les pilotes puis sélectionnez le Driver of the Day."
    });
  } catch (err) {
    console.error("Erreur récupération API:", err);
    setResultSaveFeedback({
      visible: true,
      message: "❌ Erreur lors de la récupération automatique. Vous pouvez remplir manuellement."
    });
  } finally {
    setFetchingResults(false);
  }
};

// Sauvegarde des résultats officiels

const handleSaveOfficialResults = async () => {
  if (!officialResultForm.pole || !officialResultForm.pos1 || !officialResultForm.pos2 || !officialResultForm.pos3 || !officialResultForm.dotd) {
    setResultSaveFeedback({ visible: true, message: "⚠️ Merci de compléter les 5 champs avant d'enregistrer." });
    return;
  }

  if (typeof currentGP.id !== "number") {
    setResultSaveFeedback({ visible: true, message: "❌ Ce Grand Prix n'est pas synchronisé avec la base de données." });
    return;
  }

  try {
    const { error } = await supabase
      .from("official_results")
      .upsert(
        {
          gp_id: currentGP.id,
          pole_id: officialResultForm.pole,
          pos1_id: officialResultForm.pos1,
          pos2_id: officialResultForm.pos2,
          pos3_id: officialResultForm.pos3,
          dotd_id: officialResultForm.dotd
        },
        { onConflict: "gp_id" }
      );

    if (error) throw error;

    setResultSaveFeedback({
      visible: true,
      message: "🏆 Résultats officiels enregistrés ! Les points de l'écurie ont été recalculés automatiquement."
    });

    // Recharge les données pour rafraîchir l'affichage
    load2026DataFromDB();
    if (userTeam?.id) loadTeamMembers(userTeam.id);
  } catch (err) {
    console.error("Erreur sauvegarde résultats:", err);
    setResultSaveFeedback({ visible: true, message: "❌ Erreur lors de l'enregistrement." });
  }
};

// Synchronisation du calendrier 2026 et séances FP depuis Supabase

const load2026DataFromDB = async () => {

try {

const { data: gpData, error: gpErr } = await supabase

        .from("grand_prix")

        .select("*, official_results(*)")

        .eq("season", 2026)

        .order("round", { ascending: true });



const { data: practiceData } = await supabase

        .from("practice_results")

        .select("*, grand_prix(round)")

        .order("position", { ascending: true });



if (!gpErr && gpData && gpData.length > 0) {

setCalendar((prev) =>

prev.map((localGP) => {

const dbMatch = gpData.find((d) => d.round === localGP.round);

if (!dbMatch) return localGP;

const res = dbMatch.official_results?.[0] || dbMatch.official_results;



const matchingPractice = practiceData

? practiceData

                  .filter((p) => p.grand_prix?.round === localGP.round || p.gp_id === dbMatch.id)

                  .map((p) => ({

session: p.session_type,

pos: p.position,

driver: p.driver_name,

team: p.team_name,

time: p.best_lap_time,

tire: p.tire_compound,

laps: p.laps_completed

                  }))

: [];



return {

...localGP,

id: dbMatch.id || localGP.id,

name: dbMatch.name || localGP.name,

circuit: dbMatch.circuit_name || localGP.circuit,

country: dbMatch.country || localGP.country,

city: dbMatch.city || localGP.city,

qualiDeadline: dbMatch.quali_start_time || localGP.qualiDeadline,

raceDate: dbMatch.race_start_time || localGP.raceDate,

isSprint: dbMatch.is_sprint ?? localGP.isSprint,

isCancelled: dbMatch.is_cancelled ?? localGP.isCancelled,

status: dbMatch.completed ? "completed" : dbMatch.round === 17 ? "active" : "upcoming",

practice: matchingPractice.length > 0 ? matchingPractice : localGP.practice,

officialResults: res ? {

pole: res.pole_id,

pos1: res.pos1_id,

pos2: res.pos2_id,

pos3: res.pos3_id,

dotd: res.dotd_id

              } : localGP.officialResults

            };

          })

        );

      }

    } catch (err) {

console.warn("Échec chargement DB:", err);

    }

  };



useEffect(() => {

load2026DataFromDB();

  }, []);



// Horloge dynamique et exécution du Moteur d'Automatisation Temporelle (ALPHA v3.9)

useEffect(() => {

const timer = setInterval(() => {

const now = Date.now();

setCurrentTime(now);



// Exécution du pipeline automatique en arrière-plan

if (activeGP) {

runAutoSyncPipeline(activeGP, supabase).then((res) => {

if (res?.status === "advanced" && res.nextRound) {

setSelectedRound(res.nextRound);

load2026DataFromDB();

          }

if (res?.logs && res.logs.length > 0) {

setSyncEngineLogs((prev) => [...res.logs, ...prev].slice(0, 5));

          }
        });
      }
    }, 1000);
return () => clearInterval(timer);
}, [activeGP]);

// Chargement du pronostic existant de l'utilisateur pour le GP sélectionné (ALPHA v3.11)
useEffect(() => {
  const loadExistingBet = async () => {
    if (!user?.id || typeof currentGP.id !== "number") {
      setCurrentBet({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "", isLocked: false });
      return;
    }

    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .eq("gp_id", currentGP.id)
      .maybeSingle();

    if (!error && data) {
      setCurrentBet({
        pole: data.pole_id,
        pos1: data.pos1_id,
        pos2: data.pos2_id,
        pos3: data.pos3_id,
        dotd: data.dotd_id,
        isLocked: false
      });
    } else {
      setCurrentBet({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "", isLocked: false });
    }
  };

  loadExistingBet();
}, [selectedRound, user?.id, currentGP.id]);

useEffect(() => {
  // 1. Vérifier si une session existe déjà au chargement de la page
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setAuthLoading(false);
  });

  // 2. Écouter les changements (connexion / déconnexion en direct)
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => listener.subscription.unsubscribe();
}, []);

useEffect(() => {
  const loadProfile = async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  loadProfile();
}, [user]);

// Chargement des résultats officiels existants pour le Team Principal (édition possible)
useEffect(() => {
  const loadExistingOfficialResult = async () => {
    if (typeof currentGP.id !== "number") {
      setOfficialResultForm({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "" });
      return;
    }
    const { data, error } = await supabase
      .from("official_results")
      .select("*")
      .eq("gp_id", currentGP.id)
      .maybeSingle();

    if (!error && data) {
      setOfficialResultForm({
        pole: data.pole_id,
        pos1: data.pos1_id,
        pos2: data.pos2_id,
        pos3: data.pos3_id,
        dotd: data.dotd_id
      });
    } else {
      setOfficialResultForm({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "" });
    }
  };

  if (isTeamPrincipal) loadExistingOfficialResult();
}, [selectedRound, currentGP.id, isTeamPrincipal]);

// Compte à rebours universel adapté au fuseau horaire

const calculateTimeRemaining = (deadlineIso) => {

if (!deadlineIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

const deadlineTime = Date.parse(deadlineIso);

const diff = deadlineTime - currentTime;



if (isNaN(diff) || diff <= 0) {

return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

    }



const days = Math.floor(diff / (1000 * 60 * 60 * 24));

const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

const minutes = Math.floor((diff / (1000 * 60)) % 60);

const seconds = Math.floor((diff / 1000) % 60);

return { days, hours, minutes, seconds, expired: false };

  };



const timeRemaining = calculateTimeRemaining(currentGP.qualiDeadline);

const isExpired = currentGP.status === "completed" || timeRemaining.expired;



// Formatage de date locale avec gestion automatique du fuseau (Heure de Paris)

const formatQualiDate = (isoString) => {

if (!isoString) return "Date non définie";

const dateObj = new Date(isoString);

const options = {

weekday: "long",

day: "numeric",

month: "long",

year: "numeric",

hour: "2-digit",

minute: "2-digit"

    };



const isParisTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.includes("Paris");

const formatted = dateObj.toLocaleDateString("fr-FR", options);

return isParisTimeZone ? `${formatted} (heure de Paris)` : formatted;

  };



const getTireBadge = (compound) => {

switch (compound) {

case "SOFT":

return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">🔴 SOFT</span>;

case "MEDIUM":

return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🟡 MEDIUM</span>;

case "HARD":

return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200/20 text-white border border-white/30">⚪ HARD</span>;

default:

return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-zinc-400">{compound}</span>;

    }

  };



const activePracticeList = currentGP.practice?.filter((p) => !p.session || p.session === selectedPracticeSession) || [];



// Action de validation / sauvegarde des pronostics

const handleAuthSubmit = async (e) => {
  e.preventDefault();
  setAuthError("");
  setAuthLoadingAction(true);

  try {
    if (authMode === "signup") {
      // Vérification préalable : le nom d'utilisateur est-il déjà pris ?
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", authUsername)
        .maybeSingle();

      if (existingUser) {
        setAuthError("Ce nom d'utilisateur est déjà pris. Merci d'en choisir un autre.");
        setAuthLoadingAction(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { username: authUsername }
        }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from("profiles").update({ username: authUsername }).eq("id", data.user.id);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;
    }

    setShowAuthModal(false);
    setAuthEmail("");
    setAuthPassword("");
    setAuthUsername("");
  } catch (err) {
    // Traduction des messages d'erreur techniques en français compréhensible
    if (err.message?.includes("Database error saving new user") || err.message?.includes("duplicate")) {
      setAuthError("Ce nom d'utilisateur est déjà pris. Merci d'en choisir un autre.");
    } else if (err.message?.includes("already registered")) {
      setAuthError("Cette adresse email est déjà associée à un compte.");
    } else {
      setAuthError(err.message || "Une erreur est survenue.");
    }
  } finally {
    setAuthLoadingAction(false);
  }
};

const handleSaveBet = async () => {
  if (isExpired || !user?.id) return;

  if (!currentBet.pole || !currentBet.pos1 || !currentBet.pos2 || !currentBet.pos3 || !currentBet.dotd) {
    setSaveFeedback({ visible: true, message: "⚠️ Merci de compléter les 5 pronostics avant d'enregistrer." });
    setTimeout(() => setSaveFeedback({ visible: false, message: "" }), 4000);
    return;
  }

  if (typeof currentGP.id !== "number") {
    setSaveFeedback({ visible: true, message: "❌ Ce Grand Prix n'est pas encore synchronisé avec la base de données." });
    setTimeout(() => setSaveFeedback({ visible: false, message: "" }), 4000);
    return;
  }

  try {
    const { error } = await supabase
      .from("bets")
      .upsert(
        {
          user_id: user.id,
          gp_id: currentGP.id,
          pole_id: currentBet.pole,
          pos1_id: currentBet.pos1,
          pos2_id: currentBet.pos2,
          pos3_id: currentBet.pos3,
          dotd_id: currentBet.dotd,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,gp_id" }
      );

    if (error) throw error;

    setSaveFeedback({
      visible: true,
      message: "✅ Pronostics enregistrés avec succès ! Vous pouvez les modifier à volonté avant la deadline."
    });
  } catch (err) {
    console.error("Erreur sauvegarde pari:", err);
    setSaveFeedback({
      visible: true,
      message: err.message?.includes("deadline") || err.message?.includes("Date limite")
        ? "🔒 Trop tard ! Les qualifications ont déjà commencé."
        : "❌ Erreur lors de l'enregistrement. Réessayez."
    });
  } finally {
    setTimeout(() => setSaveFeedback({ visible: false, message: "" }), 4000);
  }
};
return (

<div className="min-h-screen bg-[#0e0e14] text-white flex flex-col font-sans">

{/* HEADER SPORTIF RESPONSIVE AVEC BADGE DE TEAM ET STATUT MOTEUR */}

<header className="bg-[#15151e] border-b border-[#2b2b3d] sticky top-0 z-50">

<div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">

<div className="flex items-center gap-2 sm:gap-3 shrink-0">

{/* BOUTON F1 CLIQUABLE : RETOUR AU GRAND PRIX ACTIF */}

<button

onClick={goToActiveGrandPrix}

title="Retourner au Grand Prix actif"

className="bg-[#e10600] hover:bg-[#c30500] text-white font-black italic tracking-tighter text-lg sm:text-xl px-2.5 py-0.5 rounded shadow-lg shadow-red-900/40 cursor-pointer transition-transform hover:scale-105 active:scale-95"

>

              F1

</button>

<div>

<div className="flex items-center gap-2">

<span className="font-black text-xs sm:text-sm tracking-wider text-zinc-100 uppercase">

                  Paddock Bets

</span>

<span className="text-[9px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">

<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

{APP_VERSION}

</span>

<span className="hidden lg:inline text-[9px] font-mono text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded">

                  AutoSync : Actif

</span>

</div>

</div>

</div>



{/* BADGE DE TEAM PRINCIPAL / GROUPE EN HAUT DE PAGE */}

<div className="hidden sm:flex items-center gap-2">

{userTeam && (
  <button
    onClick={() => setShowTeamModal(true)}
    className="bg-[#1e1e2d] hover:bg-[#28283c] border border-amber-500/40 px-3 py-1 rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-amber-950/20"
  >
    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
    <div className="text-left">
      <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Écurie Active</span>
      <span className="font-extrabold text-white text-xs">{userTeam.name}</span>
    </div>
    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
      {userTeam.invite_code}
    </span>
  </button>
)}

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

</nav>



{/* Menu Smartphone */}

<div className="md:hidden relative">

<select

value={activeTab}

onChange={(e) => setActiveTab(e.target.value)}

className="bg-[#1e1e2d] border border-[#2b2b3d] text-zinc-200 text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none appearance-none pr-7"

>

<option value="bet">🏁 Paris</option>

<option value="standings">🏆 Classement Team</option>

<option value="history">📜 Résultats & Saisons</option>

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



{/* SÉLECTEUR 25 GP ORDONNÉ CHRONOLOGIQUEMENT */}

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

                  : gp.isCancelled

                  ? "bg-[#181824] border-red-900/30 text-zinc-500 line-through"

                  : gp.status === "completed"

                  ? "bg-[#181824] border-[#2b2b3d] text-zinc-400 hover:text-white"

                  : "bg-[#181824] border-[#2b2b3d] text-zinc-300 hover:border-zinc-500"

}`}

>

<span>R{gp.round}</span>

<span>{gp.city}</span>

{gp.isCancelled && <span className="text-[9px] bg-red-900/40 text-red-400 px-1 py-0.2 rounded font-mono">ANNULÉ</span>}

{gp.isSprint && !gp.isCancelled && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-mono">SPRINT</span>}

{gp.status === "active" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}

</button>

          ))}

</div>

</section>



{/* CONTENU PRINCIPAL */}

<main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">

{user && !checkingTeam && !userTeam ? (
  <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-6 sm:p-10 shadow-2xl max-w-lg mx-auto space-y-6">
    <div className="text-center space-y-2">
      <Crown className="w-10 h-10 text-amber-400 mx-auto" />
      <h2 className="text-xl font-black text-white">Bienvenue dans le Paddock !</h2>
      <p className="text-xs text-zinc-400">
        Avant de faire vos pronostics, vous devez rejoindre ou créer une écurie.
      </p>
    </div>

    {teamOnboardingMode === "choice" && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => { setTeamOnboardingMode("create"); setTeamActionError(""); }}
          className="bg-[#e10600] hover:bg-[#c30500] text-white font-bold py-4 rounded-xl text-sm transition flex flex-col items-center gap-2"
        >
          <PlusCircle className="w-6 h-6" />
          Créer une écurie
        </button>
        <button
          onClick={() => { setTeamOnboardingMode("join"); setTeamActionError(""); }}
          className="bg-[#1e1e2d] hover:bg-[#252538] border border-[#2b2b3d] text-white font-bold py-4 rounded-xl text-sm transition flex flex-col items-center gap-2"
        >
          <Share2 className="w-6 h-6" />
          Rejoindre une écurie
        </button>
      </div>
    )}

    {teamOnboardingMode === "create" && (
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-300 block">Nom de votre écurie</label>
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Ex: Scuderia Bosch R&D"
          className="w-full bg-[#15151e] border border-[#2b2b3d] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#e10600]"
        />
        {teamActionError && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {teamActionError}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setTeamOnboardingMode("choice")}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#15151e] border border-[#2b2b3d] text-zinc-300 hover:bg-[#252538]"
          >
            Retour
          </button>
          <button
            onClick={handleCreateTeam}
            disabled={teamActionLoading}
            className="flex-1 bg-[#e10600] hover:bg-[#c30500] text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
          >
            {teamActionLoading ? "Création..." : "Créer l'écurie"}
          </button>
        </div>
      </div>
    )}

    {teamOnboardingMode === "join" && (
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-300 block">Code d'invitation</label>
        <input
          type="text"
          value={joinTeamCode}
          onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
          placeholder="Ex: SB2026"
          className="w-full bg-[#15151e] border border-[#2b2b3d] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#e10600] font-mono"
        />
        {teamActionError && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {teamActionError}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setTeamOnboardingMode("choice")}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#15151e] border border-[#2b2b3d] text-zinc-300 hover:bg-[#252538]"
          >
            Retour
          </button>
          <button
            onClick={handleJoinTeam}
            disabled={teamActionLoading}
            className="flex-1 bg-[#e10600] hover:bg-[#c30500] text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
          >
            {teamActionLoading ? "Connexion..." : "Rejoindre l'écurie"}
          </button>
        </div>
      </div>
    )}
  </div>
) : (
  <>

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

{currentGP.isCancelled && (

<span className="text-[10px] bg-red-500/20 border border-red-500/40 text-red-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">

<XCircle className="w-3 h-3" /> Grand Prix Annulé

</span>

                    )}

{currentGP.isSprint && !currentGP.isCancelled && (

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



<div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl flex flex-col justify-center shrink-0">

<div className="flex items-center gap-3">

<Clock className="w-6 h-6 text-[#e10600] animate-pulse shrink-0" />

<div>

<div className="text-[10px] uppercase font-bold text-zinc-400">

                        Compte à rebours Qualifications

</div>

{currentGP.isCancelled ? (

<div className="text-xs font-bold text-red-400">ÉVÉNEMENT ANNULÉ</div>

                      ) : isExpired ? (

<div className="text-xs font-bold text-red-400">PRONOSTICS FERMÉS</div>

                      ) : (

<div className="text-lg font-black font-mono text-white">

{timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s

</div>

                      )}

</div>

</div>



{!currentGP.isCancelled && (

<div className="mt-2.5 pt-2 border-t border-[#2b2b3d] text-[11px] text-zinc-400 flex items-center justify-between gap-2">

<span className="text-zinc-500">Date limite :</span>

<strong className="text-amber-400 capitalize">

{formatQualiDate(currentGP.qualiDeadline)}

</strong>

</div>

                  )}

</div>

</div>

{/* TRACÉ DU CIRCUIT */}
<div className="mt-4 pt-4 border-t border-[#2b2b3d] flex flex-col md:flex-row items-center gap-4">
  <div className="w-full md:w-2/3 bg-[#0e0e14] rounded-lg p-2 border border-[#2b2b3d]">
    {currentGP.round === 16 || currentGP.id === "madrid" ? CIRCUIT_SVGS.madrid :
     currentGP.round === 17 || currentGP.id === "baku" ? CIRCUIT_SVGS.baku : 
     currentGP.round === 18 || currentGP.id === "sepang" ? CIRCUIT_SVGS.sepang : 
     currentGP.round === 9 || currentGP.id === "barcelona" ? CIRCUIT_SVGS.barcelona : 
     CIRCUIT_SVGS.default}
  </div>


<div className="w-full md:w-1/3 text-xs space-y-2 bg-[#15151e] p-3 rounded-lg border border-[#2b2b3d]">

<div className="flex justify-between"><span className="text-zinc-500">Longueur:</span> <strong>{currentGP.length}</strong></div>

<div className="flex justify-between"><span className="text-zinc-500">Tours en course:</span> <strong>{currentGP.laps}</strong></div>

<div className="flex justify-between"><span className="text-zinc-500">Record officiel:</span> <strong className="text-amber-400">{currentGP.lapRecord}</strong></div>

</div>

</div>

</div>

{/* PANNEAU ADMIN : SAISIE DES RÉSULTATS OFFICIELS (TEAM PRINCIPAL UNIQUEMENT) */}
{isTeamPrincipal && !currentGP.isCancelled && (
  <div className="bg-[#1e1e2d] border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
        <Crown className="w-4 h-4" />
        Admin • Résultats Officiels du Grand Prix
      </h2>
      <button
        onClick={handleAutoFetchResults}
        disabled={fetchingResults}
        className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${fetchingResults ? "animate-spin" : ""}`} />
        {fetchingResults ? "Récupération..." : "Récupérer via API"}
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-[#15151e] border border-[#2b2b3d] p-3 rounded-xl">
        <label className="text-xs font-bold text-zinc-300 block mb-1">Pole Position</label>
        <select
          value={officialResultForm.pole}
          onChange={(e) => setOfficialResultForm({ ...officialResultForm, pole: e.target.value })}
          className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
        >
          <option value="">Choisir...</option>
          {DRIVERS_2026.map((d) => <option key={d.id} value={d.id}>#{d.number} {d.name}</option>)}
        </select>
      </div>

      <div className="bg-[#15151e] border border-[#2b2b3d] p-3 rounded-xl">
        <label className="text-xs font-bold text-zinc-300 block mb-1">Driver of the Day</label>
        <select
          value={officialResultForm.dotd}
          onChange={(e) => setOfficialResultForm({ ...officialResultForm, dotd: e.target.value })}
          className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
        >
          <option value="">Choisir...</option>
          {DRIVERS_2026.map((d) => <option key={d.id} value={d.id}>#{d.number} {d.name}</option>)}
        </select>
      </div>
    </div>

    <div className="bg-[#15151e] border border-[#2b2b3d] p-3 rounded-xl">
      <label className="text-xs font-bold text-zinc-300 block mb-2">Podium (Anti-doublon)</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-[11px] text-amber-400 font-bold block mb-1">1er 🥇</span>
          <select
            value={officialResultForm.pos1}
            onChange={(e) => setOfficialResultForm({ ...officialResultForm, pos1: e.target.value })}
            className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
          >
            <option value="">Choisir...</option>
            {DRIVERS_2026.map((d) => (
              <option key={d.id} value={d.id} disabled={officialResultForm.pos2 === d.id || officialResultForm.pos3 === d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-[11px] text-zinc-300 font-bold block mb-1">2e 🥈</span>
          <select
            value={officialResultForm.pos2}
            onChange={(e) => setOfficialResultForm({ ...officialResultForm, pos2: e.target.value })}
            className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
          >
            <option value="">Choisir...</option>
            {DRIVERS_2026.map((d) => (
              <option key={d.id} value={d.id} disabled={officialResultForm.pos1 === d.id || officialResultForm.pos3 === d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-[11px] text-amber-600 font-bold block mb-1">3e 🥉</span>
          <select
            value={officialResultForm.pos3}
            onChange={(e) => setOfficialResultForm({ ...officialResultForm, pos3: e.target.value })}
            className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs"
          >
            <option value="">Choisir...</option>
            {DRIVERS_2026.map((d) => (
              <option key={d.id} value={d.id} disabled={officialResultForm.pos1 === d.id || officialResultForm.pos2 === d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {resultSaveFeedback.visible && (
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center gap-2">
        <span>{resultSaveFeedback.message}</span>
      </div>
    )}

    <button
      onClick={handleSaveOfficialResults}
      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wide transition"
    >
      🏆 Enregistrer les Résultats Officiels
    </button>
  </div>
)}

{/* VOLET ESSAIS LIBRES & PNEUMATIQUES DE TOUS LES GRANDS PRIX */}

{!currentGP.isCancelled && (

<div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl overflow-hidden shadow-2xl">

<button 

onClick={() => setShowPractice(!showPractice)}

className="w-full p-4 flex items-center justify-between text-left hover:bg-[#252538] transition-colors"

>

<div className="flex items-center gap-2">

<Gauge className="w-5 h-5 text-emerald-400" />

<div>

<h3 className="text-sm font-black text-white">Forces en Présence • Essais Libres & Pneumatiques</h3>

<p className="text-[11px] text-zinc-400">Télémétries réelles FP1, FP2 et FP3 synchronisées automatiquement à T-2h</p>

</div>

</div>

{showPractice ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}

</button>



{showPractice && (

<div className="p-4 pt-0 border-t border-[#2b2b3d] bg-[#15151e]/60">

<div className="flex items-center justify-between py-3">

<span className="text-xs font-bold text-zinc-400">Séance affichée :</span>

<div className="flex gap-1.5">

{["FP1", "FP2", "FP3"].map((s) => (

<button

key={s}

onClick={() => setSelectedPracticeSession(s)}

className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition ${

selectedPracticeSession === s ? "bg-[#e10600] text-white" : "bg-[#1e1e2d] text-zinc-400 hover:text-white"

}`}

>

{s}

</button>

                        ))}

</div>

</div>



{activePracticeList.length > 0 ? (

<div className="divide-y divide-[#2b2b3d] border border-[#2b2b3d] rounded-xl overflow-hidden bg-[#12121b]">

{activePracticeList.map((item, idx) => (

<div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-[#181826]">

<div className="flex items-center gap-3">

<span className="font-mono font-bold text-zinc-500 w-4">#{item.pos}</span>

<div>

<strong className="text-zinc-100">{item.driver}</strong>

<span className="text-[10px] text-zinc-400 ml-1.5 font-mono">({item.team})</span>

</div>

</div>

<div className="flex items-center gap-3">

<span className="font-mono font-black text-emerald-400">{item.time}</span>

{getTireBadge(item.tire)}

<span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">{item.laps} tours</span>

</div>

</div>

                        ))}

</div>

                    ) : (

<div className="p-6 text-center text-xs text-zinc-500 italic">

                        Aucun chrono enregistré dans Supabase pour la séance {selectedPracticeSession} de ce Grand Prix. Synchronisation automatique à T-2h des qualifications.

</div>

                    )}

</div>

                )}

</div>

            )}



{/* FORMULAIRE DES PARIS & BOUTON D'ENREGISTREMENT */}

{!currentGP.isCancelled && (

<div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl space-y-4">

<div className="flex items-center justify-between">

<h2 className="text-lg font-bold text-white flex items-center gap-2">

<Flame className="w-5 h-5 text-[#e10600]" />

                  Vos 5 Pronostics pour {currentGP.name}

</h2>

{isExpired ? (

<span className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">

<Lock className="w-3.5 h-3.5" /> Pronostics Clôturés

</span>

                ) : (

<span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">

<Sparkles className="w-3.5 h-3.5" /> Pronostics Ouverts

</span>

                )}

</div>



<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl">

<label className="text-xs font-bold text-zinc-300 block mb-1">Pole Position (+1 pt)</label>

<select

disabled={isExpired}

value={currentBet.pole}

onChange={(e) => setCurrentBet({ ...currentBet, pole: e.target.value })}

className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs disabled:opacity-50"

>

<option value="">Choisir un pilote...</option>

{DRIVERS_2026.map((d) => <option key={d.id} value={d.id}>#{d.number} {d.name} ({d.team})</option>)}

</select>

</div>



<div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl">

<label className="text-xs font-bold text-zinc-300 block mb-1">Driver of the Day (+1 pt)</label>

<select

disabled={isExpired}

value={currentBet.dotd}

onChange={(e) => setCurrentBet({ ...currentBet, dotd: e.target.value })}

className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs disabled:opacity-50"

>

<option value="">Choisir un pilote...</option>

{DRIVERS_2026.map((d) => <option key={d.id} value={d.id}>#{d.number} {d.name} ({d.team})</option>)}

</select>

</div>

</div>



<div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl">

<label className="text-xs font-bold text-zinc-300 block mb-2">Podium (1er, 2e, 3e - Règle Anti-Doublon)</label>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

<div>

<span className="text-[11px] text-amber-400 font-bold block mb-1">1er 🥇</span>

<select

disabled={isExpired}

value={currentBet.pos1}

onChange={(e) => setCurrentBet({ ...currentBet, pos1: e.target.value })}

className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs disabled:opacity-50"

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

disabled={isExpired}

value={currentBet.pos2}

onChange={(e) => setCurrentBet({ ...currentBet, pos2: e.target.value })}

className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs disabled:opacity-50"

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

disabled={isExpired}

value={currentBet.pos3}

onChange={(e) => setCurrentBet({ ...currentBet, pos3: e.target.value })}

className="w-full bg-[#1e1e2d] border border-[#2b2b3d] text-white p-2 rounded-lg text-xs disabled:opacity-50"

>

<option value="">Choisir...</option>

{DRIVERS_2026.map((d) => (

<option key={d.id} value={d.id} disabled={currentBet.pos1 === d.id || currentBet.pos2 === d.id}>{d.name}</option>

                        ))}

</select>

</div>

</div>

</div>



{/* BOUTON D'ENREGISTREMENT ET DE MODIFICATION DES PARIS */}

<div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">

<div className="text-xs text-zinc-400">

{isExpired ? (

<span className="text-red-400 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Les modifications sont closes pour cette manche.</span>

                  ) : (

<span>Vous pouvez modifier vos pronostics librement jusqu'à l'heure des qualifications.</span>

                  )}

</div>

<button

onClick={handleSaveBet}

disabled={isExpired}

className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all flex items-center gap-2 shadow-lg ${

isExpired

                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"

                    : "bg-[#e10600] hover:bg-[#c30500] text-white shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"

}`}

>

<Check className="w-4 h-4" />

<span>{isExpired ? "Pronostics Fermés" : "Enregistrer mes pronostics"}</span>

</button>

</div>



{saveFeedback.visible && (

<div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">

<CheckCircle2 className="w-4 h-4 shrink-0" />

<span>{saveFeedback.message}</span>

</div>

              )}

</div>

            )}

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

<p className="text-xs text-zinc-400">Données officielles consolidées dans la base de données Supabase</p>

</div>



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

<option value="2025">2025 (Terminée)</option>

<option value="2024">2024 (Terminée)</option>

</select>

</div>

</div>



{loadingArchive ? (

<div className="py-12 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">

<RefreshCw className="w-6 h-6 animate-spin text-[#e10600]" />

<span>Chargement des données officielles depuis Supabase...</span>

</div>

            ) : selectedSeason === "2026" ? (

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

{season2026OfficialFromDB.map((gp) => (

<div key={gp.round} className="bg-[#15151e] border border-[#2b2b3d] p-4 rounded-xl text-xs space-y-2">

<div className="flex justify-between items-center">

<strong className="text-white">Round {gp.round} • {gp.raceName}</strong>

<span className={`text-[10px] px-2 py-0.5 rounded ${gp.isCancelled ? "bg-red-900/40 text-red-300 border border-red-700/40" : "bg-zinc-800 text-zinc-400"}`}>

{gp.isCancelled ? "Annulé" : "Terminé"}

</span>

</div>

{gp.isCancelled ? (

<div className="text-zinc-500 italic pt-1">Grand Prix officiellement déprogrammé du calendrier mondial.</div>

                    ) : (

<div className="pt-2 border-t border-[#2b2b3d] space-y-1">

<div>🥇 1er: <strong className="text-amber-400">{gp.p1?.name}</strong> <span className="text-zinc-500 text-[10px]">({gp.p1?.team})</span></div>

<div>🥈 2e: <strong className="text-zinc-300">{gp.p2?.name}</strong> <span className="text-zinc-500 text-[10px]">({gp.p2?.team})</span></div>

<div>🥉 3e: <strong className="text-amber-600">{gp.p3?.name}</strong> <span className="text-zinc-500 text-[10px]">({gp.p3?.team})</span></div>

<div className="text-zinc-400 pt-1 flex items-center justify-between">

<span>Pole: <strong className="text-white">{gp.pole}</strong></span>

{gp.dotd && (

<span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold">

                              DOTD: {gp.dotd}

</span>

                          )}

</div>

</div>

                    )}

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

<div className="text-zinc-400 pt-1 flex items-center justify-between">

{race.fastestLap && <span>⚡ Meilleur tour: <strong className="text-emerald-400">{race.fastestLap}</strong></span>}

{race.dotd && (

<span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold">

                            DOTD: {race.dotd}

</span>

                        )}

</div>

</div>

</div>

                ))}

</div>

            )}

</div>

        )}



{/* ONGLET CLASSEMENT : LIMITÉ AUX COLLÈGUES DE LA TEAM */}

{activeTab === "standings" && userTeam && (
  <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2b3d] pb-4">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white">
            Classement de l'Écurie : <span className="text-amber-400">{userTeam.name}</span>
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Points cumulés sur la saison 2026 entre les {teamMembersList.length} membres de votre groupe
        </p>
      </div>

      <button
        onClick={() => setShowTeamModal(true)}
        className="flex items-center gap-1.5 bg-[#e10600] hover:bg-[#c30500] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-lg shadow-red-900/30"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Inviter un Collègue</span>
      </button>
    </div>

    <div className="space-y-2">
      {teamMembersList.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-500 italic">
          Chargement des membres de l'écurie...
        </div>
      ) : (
        teamMembersList.map((member, index) => (
          <div
            key={member.id}
            className={`flex items-center justify-between p-3.5 rounded-xl text-xs border transition-all ${
              member.id === user?.id
                ? "bg-[#1f1a2e] border-amber-500/50 shadow-md shadow-amber-950/20"
                : "bg-[#15151e] border-[#2b2b3d] hover:border-zinc-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`font-mono font-black text-sm w-6 text-center ${
                  index === 0 ? "text-amber-400" : index === 1 ? "text-zinc-300" : index === 2 ? "text-amber-600" : "text-zinc-500"
                }`}
              >
                #{index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-white text-sm">{member.name}</strong>
                  {member.role === "Team Principal" && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-black flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> TEAM PRINCIPAL
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400">{member.role}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-sm text-[#e10600] block">{member.points} pts</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
    </>
)}
</main>

{showAuthModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-[#2b2b3d] pb-3">
        <h3 className="text-base font-black text-white">
          {authMode === "login" ? "Connexion" : "Créer un compte"}
        </h3>
        <button onClick={() => setShowAuthModal(false)} className="text-zinc-400 hover:text-white">✕</button>
      </div>

      <form onSubmit={handleAuthSubmit} className="space-y-3">
        {authMode === "signup" && (
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              required
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              className="w-full bg-[#15151e] border border-[#2b2b3d] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#e10600]"
              placeholder="Ex: Alex L."
            />
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-1">Email</label>
          <input
            type="email"
            required
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            className="w-full bg-[#15151e] border border-[#2b2b3d] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#e10600]"
            placeholder="prenom@entreprise.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-1">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full bg-[#15151e] border border-[#2b2b3d] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#e10600]"
            placeholder="••••••••"
          />
        </div>

        {authError && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {authError}
          </div>
        )}

        <button
          type="submit"
          disabled={authLoadingAction}
          className="w-full bg-[#e10600] hover:bg-[#c30500] text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {authLoadingAction ? "Chargement..." : authMode === "login" ? "Se connecter" : "S'inscrire"}
        </button>
      </form>

      <button
        onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}
        className="w-full text-center text-[11px] text-zinc-400 hover:text-white"
      >
        {authMode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  </div>
)}

{/* MODAL GESTION DE TEAM & INVITATION */}

{showTeamModal && userTeam && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-[#2b2b3d] pb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-black text-white">Gestion de l'Écurie</h3>
        </div>
        <button onClick={() => setShowTeamModal(false)} className="text-zinc-400 hover:text-white">✕</button>
      </div>

      <div className="bg-[#15151e] p-4 rounded-xl border border-[#2b2b3d] space-y-2">
        <div className="text-xs text-zinc-400">Écurie active :</div>
        <div className="text-lg font-black text-white">{userTeam.name}</div>
        <div className="flex items-center justify-between pt-2 border-t border-[#2b2b3d]">
          <span className="text-xs text-zinc-400">Code d'invitation collègue :</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              {userTeam.invite_code}
            </span>
            <button
              onClick={copyInviteCode}
              className="p-1 hover:text-white text-zinc-400 transition"
              title="Copier le code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        {copiedCode && (
          <div className="text-[11px] text-emerald-400 font-bold text-right">
            ✓ Code copié dans le presse-papier !
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Membres de l'écurie ({teamMembersList.length})
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {teamMembersList.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#15151e] border border-[#2b2b3d] text-xs"
            >
              <div>
                <span className="text-white font-bold">{member.name}</span>
                {member.role === "Team Principal" && (
                  <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-black">
                    <Crown className="w-2.5 h-2.5 inline mr-0.5" />
                    PRINCIPAL
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-[#e10600]">{member.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowTeamModal(false)}
        className="w-full bg-[#15151e] hover:bg-[#252538] text-zinc-300 text-xs font-bold py-2.5 rounded-xl border border-[#2b2b3d] transition"
      >
        Fermer
      </button>
    </div>
  </div>
)}



{/* FOOTER */}

<footer className="bg-[#15151e] border-t border-[#2b2b3d] py-4 text-center text-xs text-zinc-500 mt-auto">

        F1 Paddock Bets 2026 • {APP_VERSION} • Propulsé par Supabase & Vercel

</footer>

</div>

  );

}