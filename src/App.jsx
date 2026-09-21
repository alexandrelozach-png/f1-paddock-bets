import React, { useState, useEffect } from "react";
import { 
  Trophy, Clock, Flag, Calendar, Flame, History, 
  User, ShieldAlert, ChevronDown, ChevronUp, Lock, 
  RefreshCw, Zap, Globe, Gauge, XCircle, Share2, Copy, Crown, MapPin, LogIn, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { fetchOfficialCalendar, fetchFullSeasonResults } from "./f1ApiService";

const APP_VERSION = "ALPHA v3.8 fix3";

const DRIVERS_2026 = [
  { id: "leclerc", name: "Charles Leclerc", number: 16, team: "Ferrari" },
  { id: "hamilton", name: "Lewis Hamilton", number: 44, team: "Ferrari" },
  { id: "norris", name: "Lando Norris", number: 4, team: "McLaren" },
  { id: "piastri", name: "Oscar Piastri", number: 81, team: "McLaren" },
  { id: "verstappen", name: "Max Verstappen", number: 1, team: "Red Bull Racing" },
  { id: "hadjar", name: "Isack Hadjar", number: 6, team: "Red Bull Racing" },
  { id: "russell", name: "George Russell", number: 63, team: "Mercedes" },
  { id: "antonelli", name: "Kimi Antonelli", number: 12, team: "Mercedes" },
  { id: "alonso", name: "Fernando Alonso", number: 14, team: "Aston Martin" },
  { id: "stroll", name: "Lance Stroll", number: 18, team: "Aston Martin" },
  { id: "albon", name: "Alexander Albon", number: 23, team: "Williams" },
  { id: "sainz", name: "Carlos Sainz", number: 55, team: "Williams" }
];

// Tracés SVG simplifiés pour l'exemple
const CIRCUIT_SVGS = {
  baku: <svg viewBox="0 0 400 180" className="w-full h-36 stroke-current"><path d="M 40 145 L 360 145 L 360 100 L 260 100 L 260 40 L 200 40 L 180 65 L 140 65 L 130 35 L 80 35 L 40 70 Z" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  sepang: <svg viewBox="0 0 400 180" className="w-full h-36 stroke-current"><path d="M 50 140 L 330 140 C 360 140 360 110 330 90 L 230 90 C 200 90 200 50 240 50 L 310 50 C 330 50 330 25 300 25 L 120 25 C 90 25 80 50 100 70 L 130 90 C 150 110 130 130 100 130 L 50 140 Z" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  default: <svg viewBox="0 0 400 180" className="w-full h-36 stroke-current"><path d="M 60 130 C 100 150 250 150 310 130 C 360 110 350 50 280 40 C 220 30 180 70 130 50 C 80 30 40 80 60 130 Z" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
};

const INITIAL_CALENDAR_2026 = [
  { round: 1, id: "melbourne", name: "Australian Grand Prix", city: "Melbourne", status: "completed", isCancelled: false, qualiDeadline: "2026-03-07T05:00:00Z", isSprint: false },
  { round: 16, id: "madrid", name: "Gran Premio de Madrid", city: "Madrid", status: "completed", isCancelled: false, qualiDeadline: "2026-09-12T14:00:00Z", isSprint: false },
  { 
    round: 17, 
    id: "baku", 
    name: "Azerbaijan Grand Prix (Bakou)", 
    circuit: "Baku City Circuit", 
    country: "Azerbaïdjan 🇦🇿", 
    city: "Bakou", 
    status: "active", 
    isCancelled: false,
    qualiDeadline: "2026-09-25T12:00:00Z", // 12:00 UTC = 14:00 Heure de Paris !
    isSprint: false, 
    length: "6.003 km", 
    laps: 51, 
    lapRecord: "1:43.009 (Leclerc)",
    practice: [
      { session: "FP3", pos: 1, driver: "Charles Leclerc", team: "Ferrari", time: "1:42.120", tire: "SOFT", laps: 18 },
      { session: "FP3", pos: 2, driver: "Lando Norris", team: "McLaren", time: "1:42.195", tire: "SOFT", laps: 19 },
      { session: "FP3", pos: 3, driver: "Max Verstappen", team: "Red Bull", time: "1:42.450", tire: "SOFT", laps: 17 },
      { session: "FP3", pos: 4, driver: "Lewis Hamilton", team: "Ferrari", time: "1:42.600", tire: "MEDIUM", laps: 20 },
      { session: "FP3", pos: 5, driver: "Oscar Piastri", team: "McLaren", time: "1:42.750", tire: "HARD", laps: 22 },
      { session: "FP3", pos: 6, driver: "George Russell", team: "Mercedes", time: "1:42.800", tire: "SOFT", laps: 15 }
    ] 
  },
  { 
    round: 18, 
    id: "sepang", 
    name: "Petronas Malaysian Grand Prix", 
    circuit: "Petronas Sepang", 
    country: "Malaisie 🇲🇾", 
    city: "Sepang", 
    status: "upcoming", 
    isCancelled: false, 
    qualiDeadline: "2026-10-03T06:00:00Z", // 06:00 UTC = 08:00 Heure de Paris
    isSprint: false,
    length: "5.543 km", 
    laps: 56, 
    lapRecord: "1:34.080 (Vettel)",
    practice: [] 
  },
  { round: 19, id: "singapore", name: "Singapore Grand Prix", city: "Marina Bay", status: "upcoming", isCancelled: false, qualiDeadline: "2026-10-10T13:00:00Z", isSprint: false }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("bet");
  const [selectedRound, setSelectedRound] = useState(17);
  const [calendar, setCalendar] = useState(INITIAL_CALENDAR_2026);
  const [showPractice, setShowPractice] = useState(true);
  const [selectedPracticeSession, setSelectedPracticeSession] = useState("FP3");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Groupes
  const [currentTeam, setCurrentTeam] = useState({
    name: "Scuderia Bosch R&D",
    inviteCode: "SB2026",
    isPrincipal: true,
    members: [
      { id: "1", name: "Alexandre L.", role: "Team Principal", points: 84, rank: 1, avatar: "🏎️" },
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
  
  const [user, setUser] = useState({ email: "alex@entreprise.com" });
  const [currentBet, setCurrentBet] = useState({ pole: "", pos1: "", pos2: "", pos3: "", dotd: "", isLocked: false });

  const currentGP = calendar.find((gp) => gp.round === selectedRound) || calendar[0];

  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentTeam.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (deadlineIso) => {
    if (!deadlineIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const deadlineTime = new Date(deadlineIso).getTime();
    const diff = deadlineTime - currentTime;

    if (isNaN(diff) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false
    };
  };

  const timeRemaining = calculateTimeRemaining(currentGP.qualiDeadline);
  const isExpired = currentGP.status === "completed" || timeRemaining.expired;

  // Format d'affichage local (ex: Paris)
  const formatQualiDate = (isoString) => {
    if (!isoString) return "Date non définie";
    const dateObj = new Date(isoString);
    const options = { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" };
    const formatted = dateObj.toLocaleDateString("fr-FR", options);
    return `${formatted} (Heure Locale)`;
  };

  const activePracticeList = currentGP.practice?.filter((p) => !p.session || p.session === selectedPracticeSession) || [];

  return (
    <div className="min-h-screen bg-[#0e0e14] text-white flex flex-col font-sans">
      <header className="bg-[#15151e] border-b border-[#2b2b3d] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedRound(17); setActiveTab("bet"); }}
              className="bg-[#e10600] hover:bg-[#c30500] text-white font-black italic tracking-tighter text-xl px-2.5 py-0.5 rounded shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              F1
            </button>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider uppercase">Paddock Bets</span>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">{APP_VERSION}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTeamModal(true)} className="bg-[#1e1e2d] border border-amber-500/40 px-3 py-1 rounded-xl text-xs flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-left">
                <span className="block text-[9px] text-zinc-400 font-bold uppercase">Écurie Active</span>
                <span className="font-extrabold text-white text-xs">{currentTeam.name}</span>
              </div>
            </button>
            <nav className="flex items-center bg-[#1e1e2d] p-1 rounded-xl text-xs ml-3">
              <button onClick={() => setActiveTab("bet")} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${activeTab === "bet" ? "bg-[#e10600] text-white" : "text-zinc-400"}`}><Flag className="w-3.5 h-3.5" /> Paris</button>
              <button onClick={() => setActiveTab("standings")} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${activeTab === "standings" ? "bg-[#e10600] text-white" : "text-zinc-400"}`}><Trophy className="w-3.5 h-3.5" /> Classement</button>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-[#12121b] border-b border-[#2b2b3d] px-4 py-2.5 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-2 min-w-max">
          <Calendar className="w-4 h-4 text-zinc-500 mr-1" />
          {calendar.map((gp) => (
            <button
              key={gp.round}
              onClick={() => setSelectedRound(gp.round)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${selectedRound === gp.round ? "bg-[#e10600] border-[#e10600] text-white" : gp.isCancelled ? "bg-[#181824] text-zinc-500 line-through" : "bg-[#181824] text-zinc-400"}`}
            >
              R{gp.round} {gp.city}
              {gp.status === "active" && <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />}
            </button>
          ))}
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {activeTab === "bet" && (
          <>
            <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl relative">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-[#e10600] uppercase tracking-wider">Round {currentGP.round} • {currentGP.country}</span>
                  <h1 className="text-2xl font-black mt-1">{currentGP.name}</h1>
                </div>
                <div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl flex flex-col shrink-0">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-[#e10600] animate-pulse" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Compte à rebours Qualifs</div>
                      {isExpired ? <div className="text-xs font-bold text-red-400">FERMÉS</div> : <div className="text-lg font-black font-mono">{timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s</div>}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#2b2b3d] text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Deadline :</span>
                    <strong className="text-amber-400 capitalize">{formatQualiDate(currentGP.qualiDeadline)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-[#15151e] border-b border-[#2b2b3d] flex justify-between items-center">
                <h3 className="text-sm font-black flex items-center gap-2"><Gauge className="w-5 h-5 text-emerald-400" /> Forces en Présence (Top 6)</h3>
                <div className="flex gap-1.5">
                  {["FP1", "FP2", "FP3"].map(s => (
                    <button key={s} onClick={() => setSelectedPracticeSession(s)} className={`px-2.5 py-1 rounded text-xs font-bold ${selectedPracticeSession === s ? "bg-[#e10600] text-white" : "bg-[#1e1e2d] text-zinc-400"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-[#12121b]">
                {activePracticeList.length > 0 ? (
                  <div className="divide-y divide-[#2b2b3d] border border-[#2b2b3d] rounded-xl overflow-hidden">
                    {activePracticeList.map((item, idx) => (
                      <div key={idx} className="p-2.5 px-3 flex justify-between text-xs hover:bg-[#181826]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-zinc-500 w-4">#{item.pos}</span>
                          <strong className="text-zinc-100">{item.driver} <span className="text-[10px] text-zinc-400 font-mono">({item.team})</span></strong>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-emerald-400">{item.time}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${item.tire === 'SOFT' ? 'bg-red-500/20 text-red-400 border-red-500/30' : item.tire === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-slate-200/20 text-white border-white/30'}`}>
                            {item.tire}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500">Aucun chrono enregistré dans Supabase pour {selectedPracticeSession}.</div>
                )}
              </div>
            </div>

            <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Flame className="w-5 h-5 text-[#e10600]" /> Vos Pronostics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#15151e] border border-[#2b2b3d] p-3.5 rounded-xl">
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Pole Position (+1 pt)</label>
                  <select className="w-full bg-[#1e1e2d] border border-[#2b2b3d] p-2 rounded-lg text-xs"><option>Choisir un pilote...</option></select>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "standings" && (
          <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-5 shadow-2xl">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-amber-400" /> Classement : {currentTeam.name}</h2>
            <div className="space-y-2">
              {currentTeam.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3.5 rounded-xl text-xs bg-[#15151e] border border-[#2b2b3d]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-amber-400 w-6">#{member.rank}</span>
                    <strong className="text-white text-sm">{member.name}</strong>
                  </div>
                  <span className="font-mono font-black text-sm text-[#e10600]">{member.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Écurie */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e2d] border border-[#2b2b3d] rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h3 className="text-base font-black text-white flex justify-between">Gestion Écurie <button onClick={() => setShowTeamModal(false)}>✕</button></h3>
            <div className="bg-[#15151e] p-4 rounded-xl border border-[#2b2b3d] mt-4">
              <div className="text-lg font-black text-white">{currentTeam.name}</div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400">Code d'invitation :</span>
                <span className="font-mono text-amber-400">{currentTeam.inviteCode}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
