// --- VERSION: ALPHA v3.2 ---
import React, { useState, useEffect } from "react";
import { fetchOfficialCalendar, fetchFullSeasonResults } from "./f1ApiService";
import { supabase } from "./supabaseClient";
import { 
  Trophy, Calendar, ShieldAlert, Award, RefreshCw, 
  MapPin, CheckCircle, User, LogOut, Lock, LogIn 
} from "lucide-react";

export default function App() {
  // Navigation & Sessions
  const [activeTab, setActiveTab] = useState("paris");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("2024");
  
  // États de chargement des données
  const [calendar, setCalendar] = useState([]);
  const [results2024, setResults2024] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [apiStatus, setApiStatus] = useState("Déconnecté");

  // Charger le calendrier 2026 & résultats 2024 au démarrage
  useEffect(() => {
    async function initData() {
      setApiStatus("Synchronisation...");
      const cal = await fetchOfficialCalendar("2026");
      if (cal) {
        setCalendar(cal);
        setApiStatus("Synchro OK (2026)");
      } else {
        setApiStatus("Mode Hors-Ligne");
      }
    }
    initData();
  }, []);

  // Charger les résultats d'une saison sélectionnée
  useEffect(() => {
    async function loadSeasonResults() {
      setIsLoadingResults(true);
      const res = await fetchFullSeasonResults(selectedSeason);
      if (res) {
        setResults2024(res);
      }
      setIsLoadingResults(false);
    }
    loadSeasonResults();
  }, [selectedSeason]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased pb-12">
      {/* HEADER RESPONSIVE AVEC VERSION */}
      <header className="border-b border-red-600/30 bg-slate-900/90 sticky top-0 z-50 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-red-500 italic">
              PADDOCK BETS
            </span>
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>ALPHA v3.2</span>
            </span>
          </div>

          {/* Bouton de Connexion Responsive */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <User size={16} className="text-red-400" />
                <span className="text-xs sm:inline hidden font-semibold text-slate-300">{profile?.username}</span>
                <button onClick={() => supabase.auth.signOut()} className="hover:text-red-400 transition-colors">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-red-600/20">
                <LogIn size={16} />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>

        {/* Sélecteur d'onglets responsive */}
        <div className="max-w-7xl mx-auto mt-3 sm:hidden">
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="paris">🏁 Saisir un Pari (2026)</option>
            <option value="saisons">📊 Résultats & Saisons</option>
            <option value="classement">🏆 Classement Ligue</option>
          </select>
        </div>

        {/* Onglets Desktop */}
        <div className="hidden sm:flex max-w-7xl mx-auto mt-3 space-x-4">
          <button 
            onClick={() => setActiveTab("paris")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "paris" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            🏁 Paris 2026
          </button>
          <button 
            onClick={() => setActiveTab("saisons")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "saisons" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            📊 Résultats & Saisons
          </button>
          <button 
            onClick={() => setActiveTab("classement")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "classement" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            🏆 Classement Ligue
          </button>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {activeTab === "paris" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h2 className="text-xl font-bold flex items-center space-x-2 text-red-400">
                <Calendar size={20} />
                <span>Calendrier Officiel F1 2026 ({calendar.length} Courses)</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">Données synchronisées en direct avec l'API F1 :</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {calendar.slice(0, 6).map((gp) => (
                  <div key={gp.round} className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-red-500 tracking-wider">ROUND {gp.round}</span>
                      {gp.isSprintWeekend && (
                        <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded border border-yellow-500/20">SPRINT</span>
                      )}
                    </div>
                    <h3 className="font-extrabold mt-1 text-slate-100">{gp.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                      <MapPin size={12} />
                      <span>{gp.city}, {gp.country}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "saisons" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-100">Vérification de l'API & Historique des Saisons</h2>
                <p className="text-sm text-slate-400">Sélectionnez une saison pour charger les résultats officiels de la FIA en direct</p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold text-slate-400">Saison :</label>
                <select 
                  value={selectedSeason} 
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="2026">2026 (En cours)</option>
                  <option value="2025">2025 (Terminée)</option>
                  <option value="2024">2024 (Terminée)</option>
                </select>
              </div>
            </div>

            {/* JAUGE DE CHARGEMENT */}
            {isLoadingResults ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw className="animate-spin text-red-500" size={32} />
                <span className="text-sm text-slate-400 font-bold">Interrogation de l'API Jolpica en cours...</span>
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-300">Grands Prix synchronisés : {results2024.length}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-bold border border-green-500/20 flex items-center space-x-1">
                    <CheckCircle size={12} />
                    <span>Statut API : OK</span>
                  </span>
                </div>

                <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                  {results2024.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Aucun résultat trouvé pour cette saison.</div>
                  ) : (
                    results2024.map((gp) => (
                      <div key={gp.round} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors">
                        <div>
                          <span className="text-[10px] font-black text-red-500 tracking-wider">ROUND {gp.round}</span>
                          <h4 className="font-extrabold text-slate-200">{gp.name}</h4>
                          <p className="text-xs text-slate-400">{gp.circuit}</p>
                        </div>
                        
                        {/* PODIUM COMPLET DE LA COURSE */}
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center min-w-[70px]">
                            <span className="block text-[8px] text-yellow-500 font-black">🥇 1ER</span>
                            <span className="text-xs font-extrabold">{gp.pos1}</span>
                          </div>
                          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center min-w-[70px]">
                            <span className="block text-[8px] text-slate-400 font-black">🥈 2E</span>
                            <span className="text-xs font-extrabold">{gp.pos2}</span>
                          </div>
                          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center min-w-[70px]">
                            <span className="block text-[8px] text-amber-600 font-black">🥉 3E</span>
                            <span className="text-xs font-extrabold">{gp.pos3}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-slate-600 text-xs py-4 border-t border-slate-900">
        <p>Paddock Bets © 2026 - Propulsé par Supabase, StackBlitz & Vercel</p>
        <p className="text-[10px] mt-1 text-slate-700">ALPHA v3.2 - Code de secours et triggers de calcul par LEWIS</p>
      </footer>
    </div>
  );
}
