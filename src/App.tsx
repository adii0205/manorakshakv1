/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { OperatorLiveCallHud } from './components/OperatorLiveCallHud';
import { ComplainantPortal } from './components/ComplainantPortal';
import { NodalOfficerDashboard } from './components/NodalOfficerDashboard';
import { SimulationSandbox } from './components/SimulationSandbox';
import { InformedConsentModal } from './components/InformedConsentModal';
import { EmergencySosModal } from './components/EmergencySosModal';
import { INITIAL_CASES } from './utils/mockData';
import { CaseRecord } from './types';
import { PhoneCall, Shield, Scale, HeartHandshake, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('operator');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi-IN');
  const [cases, setCases] = useState<CaseRecord[]>(INITIAL_CASES);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isConsentOpen, setIsConsentOpen] = useState<boolean>(false);

  // Add newly created or archived case
  const handleSaveCase = (newCase: CaseRecord) => {
    setCases((prev) => [newCase, ...prev]);
  };

  // Update status from Triage
  const handleUpdateCaseStatus = (caseId: string, status: CaseRecord['status']) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status } : c))
    );
  };

  const pendingCriticalCount = cases.filter(
    (c) => c.assessment.riskCategory === 'CRITICAL' && c.status !== 'RESOLVED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Institutional Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenConsentModal={() => setIsConsentOpen(true)}
        pendingCriticalCount={pendingCriticalCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'operator' && (
          <OperatorLiveCallHud
            onSaveCase={handleSaveCase}
            selectedLanguage={selectedLanguage}
          />
        )}

        {activeTab === 'complainant' && (
          <ComplainantPortal
            onSaveCase={handleSaveCase}
            selectedLanguage={selectedLanguage}
          />
        )}

        {activeTab === 'triage' && (
          <NodalOfficerDashboard
            cases={cases}
            onUpdateCaseStatus={handleUpdateCaseStatus}
          />
        )}

        {activeTab === 'sandbox' && <SimulationSandbox />}
      </main>

      {/* Modals */}
      <InformedConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
      />

      <EmergencySosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500/80" />
            <span>
              National Helpline Against Atrocities (14566) • Department of Social Justice and Empowerment, Govt. of India
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              PoA Act 1989 & 2016 Rules
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-slate-500" />
              Tele-MANAS (14416)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              DPDP Act 2023 Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
