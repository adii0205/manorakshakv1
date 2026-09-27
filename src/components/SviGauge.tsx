import React from 'react';
import { DimensionScores, RiskCategory } from '../types';
import { Activity, ShieldAlert, HeartPulse, UserX, AlertTriangle } from 'lucide-react';

interface SviGaugeProps {
  score: number;
  riskCategory: RiskCategory;
  dimensions?: DimensionScores;
  compact?: boolean;
}

export const SviGauge: React.FC<SviGaugeProps> = ({
  score,
  riskCategory,
  dimensions,
  compact = false,
}) => {
  // SVG semi-circle gauge calculation
  const clampedScore = Math.min(100, Math.max(0, score));
  // Needle rotation: -90deg (0 score) to +90deg (100 score)
  const needleAngle = -90 + (clampedScore / 100) * 180;

  const getScoreColor = () => {
    if (clampedScore >= 80) return 'text-rose-400';
    if (clampedScore >= 60) return 'text-amber-400';
    if (clampedScore >= 30) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getScoreBgGlow = () => {
    if (clampedScore >= 80) return 'from-rose-500/20 to-transparent';
    if (clampedScore >= 60) return 'from-amber-500/20 to-transparent';
    if (clampedScore >= 30) return 'from-yellow-500/15 to-transparent';
    return 'from-emerald-500/15 to-transparent';
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-gradient-to-b ${getScoreBgGlow()} bg-slate-900/90 p-4 shadow-xl backdrop-blur-md`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Clinical Metric
          </span>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            Stress Vulnerability Index (SVI)
          </h3>
        </div>
        <span className="font-mono text-xs text-slate-400">Scale: 0–100</span>
      </div>

      {/* Semi-circular dial */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <svg viewBox="0 0 220 112" className="w-52 sm:w-60 overflow-visible select-none">
          <defs>
            <linearGradient id="sviGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="28%" stopColor="#34d399" />
              <stop offset="38%" stopColor="#eab308" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="85%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background Track Arc (Radius = 75, Center = 110, 95) */}
          <path
            d="M 35 95 A 75 75 0 0 1 185 95"
            fill="none"
            stroke="#1e293b"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Active Gradient Gauge Track */}
          <path
            d="M 35 95 A 75 75 0 0 1 185 95"
            fill="none"
            stroke="url(#sviGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
            opacity="0.95"
          />

          {/* Radial Ticks */}
          {/* 0 (180deg) */}
          <line x1="35" y1="95" x2="26" y2="95" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          {/* 30 (126deg) */}
          <line x1="66" y1="34" x2="59" y2="25" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          {/* 60 (72deg) */}
          <line x1="133" y1="24" x2="136" y2="15" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
          {/* 80 (36deg) */}
          <line x1="171" y1="51" x2="178" y2="44" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
          {/* 100 (0deg) */}
          <line x1="185" y1="95" x2="194" y2="95" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

          {/* Scale Numeric Labels */}
          <text x="21" y="99" fill="#94a3b8" fontSize="8.5" fontWeight="600" textAnchor="end" fontFamily="monospace">0</text>
          <text x="54" y="21" fill="#34d399" fontSize="8.5" fontWeight="600" textAnchor="middle" fontFamily="monospace">30</text>
          <text x="138" y="12" fill="#eab308" fontSize="8.5" fontWeight="600" textAnchor="middle" fontFamily="monospace">60</text>
          <text x="186" y="40" fill="#f97316" fontSize="8.5" fontWeight="600" textAnchor="start" fontFamily="monospace">80</text>
          <text x="200" y="99" fill="#ef4444" fontSize="8.5" fontWeight="600" textAnchor="start" fontFamily="monospace">100</text>

          {/* Needle with pivot at (110, 95) */}
          <g transform={`rotate(${needleAngle}, 110, 95)`}>
            {/* Needle Shaft */}
            <line
              x1="110"
              y1="95"
              x2="110"
              y2="38"
              stroke="#f8fafc"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Arrow Tip */}
            <polygon points="107,42 113,42 110,26" fill="#f43f5e" />
            {/* Counterweight */}
            <line
              x1="110"
              y1="95"
              x2="110"
              y2="103"
              stroke="#64748b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* Pivot Center Hub (No overlapping text) */}
          <circle cx="110" cy="95" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="110" cy="95" r="3" fill="#f43f5e" />
        </svg>

        {/* Digital Score Display cleanly positioned beneath the gauge baseline */}
        <div className="text-center mt-2">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className={`text-4xl font-extrabold tracking-tight font-mono ${getScoreColor()}`}>
              {clampedScore}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-widest mt-1 flex items-center justify-center gap-1.5">
            <span>CATEGORY:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                clampedScore >= 80
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : clampedScore >= 60
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : clampedScore >= 30
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {riskCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Dimensional Breakdown Sub-metrics */}
      {!compact && dimensions && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>MULTI-AXIS PSYCHOLOGICAL VECTORS</span>
            <span className="text-[10px] text-slate-500">Sub-Score</span>
          </div>

          {/* 1. Acoustic Distress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                Acoustic Distress & Vocal Instability
              </span>
              <span className="font-mono font-bold text-slate-200">
                {dimensions.acousticDistressScore}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${dimensions.acousticDistressScore}%` }}
              />
            </div>
          </div>

          {/* 2. Semantic Trauma */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Semantic Trauma & PTSD Markers
              </span>
              <span className="font-mono font-bold text-slate-200">
                {dimensions.semanticTraumaScore}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${dimensions.semanticTraumaScore}%` }}
              />
            </div>
          </div>

          {/* 3. Immediate Threat */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Immediate Threat & Physical Peril
              </span>
              <span className="font-mono font-bold text-slate-200">
                {dimensions.immediateThreatScore}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${dimensions.immediateThreatScore}%` }}
              />
            </div>
          </div>

          {/* 4. Suicidal Ideation / Despair */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Helplessness & Self-Harm Ideation
              </span>
              <span className="font-mono font-bold text-slate-200">
                {dimensions.suicidalRiskScore}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${dimensions.suicidalRiskScore}%` }}
              />
            </div>
          </div>

          {/* 5. Social Boycott / Isolation */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-blue-400" />
                Social Boycott & Resource Denial
              </span>
              <span className="font-mono font-bold text-slate-200">
                {dimensions.socialIsolationScore}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${dimensions.socialIsolationScore}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
