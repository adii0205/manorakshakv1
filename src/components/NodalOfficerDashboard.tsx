import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  ShieldAlert,
  PhoneCall,
  MapPin,
  Calendar,
  Eye,
  FileCheck2,
  Siren,
  Scale,
  Sparkles,
  Download,
  CheckCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { CaseRecord, RiskCategory } from '../types';
import { RiskBadge } from './RiskBadge';
import { SviGauge } from './SviGauge';

interface NodalOfficerDashboardProps {
  cases: CaseRecord[];
  onUpdateCaseStatus: (caseId: string, status: CaseRecord['status']) => void;
}

export const NodalOfficerDashboard: React.FC<NodalOfficerDashboardProps> = ({
  cases,
  onUpdateCaseStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(cases[0] || null);

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.narrative.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      selectedRiskFilter === 'ALL' || c.assessment.riskCategory === selectedRiskFilter;

    return matchesSearch && matchesRisk;
  });

  // Calculate statistics
  const totalCount = cases.length;
  const criticalCount = cases.filter((c) => c.assessment.riskCategory === 'CRITICAL').length;
  const highCount = cases.filter((c) => c.assessment.riskCategory === 'HIGH').length;
  const avgSvi = Math.round(
    cases.reduce((sum, c) => sum + c.assessment.sviScore, 0) / Math.max(1, totalCount)
  );

  return (
    <div className="space-y-6">
      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono uppercase">
            <span>Active Grievances</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalCount}</div>
          <span className="text-[11px] text-slate-500">Across 14566 & Web Portal</span>
        </div>

        <div className="bg-slate-900 border border-rose-900/40 p-4 rounded-2xl shadow-lg bg-gradient-to-b from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-rose-300 text-xs mb-1 font-mono uppercase">
            <span>Critical (P0) Alarms</span>
            <Siren className="w-4 h-4 text-rose-400 animate-spin" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{criticalCount}</div>
          <span className="text-[11px] text-rose-300/80">Immediate Life Threat / Armed Mob</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 p-4 rounded-2xl shadow-lg bg-gradient-to-b from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-1 font-mono uppercase">
            <span>High Risk (P1) Cases</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{highCount}</div>
          <span className="text-[11px] text-amber-300/80">Bodily Injury / Eviction Threats</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-mono uppercase">
            <span>Mean Stress Index</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {avgSvi} <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500">Calculated via Speech & NLP AI</span>
        </div>
      </div>

      {/* Main Split: Left Column (Triage Queue Table), Right Column (Detailed Forensic Dossier) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Triage Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>District Nodal Officer Triage Queue</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Prioritized by real-time Stress Vulnerability Index (SVI) score
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search district, case, keyword..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Risk Category Filters */}
            <div className="flex flex-wrap gap-2 text-xs">
              {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setSelectedRiskFilter(risk)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    selectedRiskFilter === risk
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>

            {/* Case List items */}
            <div className="space-y-2.5 pt-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No cases match the selected filter criteria.
                </div>
              ) : (
                filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedCase?.id === c.id
                        ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            {c.caseNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">
                            {c.casteCategory}
                          </span>
                          <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                          {c.incidentType}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <RiskBadge category={c.assessment.riskCategory} size="sm" />
                        <div className="text-xs font-mono font-bold text-slate-300 mt-1">
                          SVI: {c.assessment.sviScore}/100
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      "{c.narrative}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.district}, {c.state}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Status: {c.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View Dossier
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Selected Case Forensic Dossier */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCase ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 sticky top-20">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Forensic Psychological Dossier
                  </span>
                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    {selectedCase.caseNumber}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedCase.district}, {selectedCase.state}</span>
                    <span>•</span>
                    <span className="text-amber-300">{selectedCase.casteCategory} Community</span>
                  </div>
                </div>

                <RiskBadge category={selectedCase.assessment.riskCategory} size="md" />
              </div>

              {/* SVI Gauge preview */}
              <SviGauge
                score={selectedCase.assessment.sviScore}
                riskCategory={selectedCase.assessment.riskCategory}
                dimensions={selectedCase.assessment.dimensions}
                compact={false}
              />

              {/* Psychological Evaluation Narrative */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
                <span className="font-semibold text-slate-300 block uppercase font-mono text-[10px]">
                  Clinical Trauma Assessment
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedCase.assessment.psychologicalEvaluation.vulnerabilitySummary}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCase.assessment.detectedRedFlags.map((flag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/50"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Statutory Relief Entitlement Calculation */}
              <div className="bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-900/40 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-300 font-semibold font-mono text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    PoA Rules 2016 Annexure-I Relief
                  </span>
                  <span>Mandated by Law</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {selectedCase.assessment.statutoryAndInterventionProtocols.poaReliefEntitlementEstimate}
                </div>
                <p className="text-[11px] text-slate-400">
                  First-stage 25% interim relief payable to the victim upon registration of FIR without requiring conviction.
                </p>
              </div>

              {/* Administrative Action Dispatch Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono block">
                  Nodal Redressal Actions
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => onUpdateCaseStatus(selectedCase.id, 'DISPATCHED_112')}
                    className="p-2.5 rounded-xl font-bold bg-rose-600/20 text-rose-300 border border-rose-600/40 hover:bg-rose-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>Dispatch 112 PCR</span>
                  </button>

                  <button
                    onClick={() => onUpdateCaseStatus(selectedCase.id, 'UNDER_COUNSELLING')}
                    className="p-2.5 rounded-xl font-bold bg-blue-600/20 text-blue-300 border border-blue-600/40 hover:bg-blue-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Tele-MANAS Care</span>
                  </button>

                  <button
                    onClick={() => onUpdateCaseStatus(selectedCase.id, 'DLSA_ASSIGNED')}
                    className="p-2.5 rounded-xl font-bold bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Assign DLSA Legal</span>
                  </button>

                  <button
                    onClick={() => onUpdateCaseStatus(selectedCase.id, 'RESOLVED')}
                    className="p-2.5 rounded-xl font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Handled</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              Select a case from the queue to view complete forensic dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
