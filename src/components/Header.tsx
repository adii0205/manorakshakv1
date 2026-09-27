import React from 'react';
import { PhoneCall, Shield, AlertTriangle, FileText, Activity, Lock, Languages, Siren } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types';

export type ActiveTab = 'operator' | 'complainant' | 'triage' | 'sandbox';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  onOpenSos: () => void;
  onOpenConsentModal: () => void;
  pendingCriticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedLanguage,
  setSelectedLanguage,
  onOpenSos,
  onOpenConsentModal,
  pendingCriticalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Official Government of India & NHAA 14566 top bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wide text-slate-200">
              Department of Social Justice and Empowerment • Government of India
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-amber-300 font-medium">
              SC/ST (Prevention of Atrocities) Act, 1989 & 2016 Rules Ecosystem
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenConsentModal}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>DPDP 2023 Consent & Trauma Ethics</span>
            </button>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              <PhoneCall className="w-3 h-3 animate-bounce" />
              <span className="font-bold">TOLL FREE: 14566 (24x7)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-indigo-900 p-0.5 shadow-lg shadow-amber-900/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                NHAA 14566
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI Real-Time Trauma Assessment
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              National Helpline Against Atrocities & Integrated Portal Real-Time Distress Intelligence
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('operator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'operator'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>14566 Call Officer HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('complainant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'complainant'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Citizen Intake Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'triage'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>District Triage & Redressal</span>
              {pendingCriticalCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {pendingCriticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulation & Mic Sandbox</span>
            </button>
          </nav>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-100">
                  {l.label} ({l.nativeLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Red SOS Button */}
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg shadow-rose-950/40 border border-rose-500/50 transition-all transform active:scale-95"
          >
            <Siren className="w-4 h-4 animate-spin" />
            <span>RED SOS DISPATCH</span>
          </button>
        </div>
      </div>
    </header>
  );
};
