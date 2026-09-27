import React from 'react';
import { Shield, Lock, CheckCircle2, X, AlertTriangle, FileText, UserCheck } from 'lucide-react';

interface InformedConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InformedConsentModal: React.FC<InformedConsentModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Privacy, Informed Consent & Ethical AI Framework
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                DPDP Act 2023 & SC/ST PoA Act Statutory Compliance
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed max-h-[460px] overflow-y-auto pr-2">
          {/* Section 1 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5" />
              1. Statutory Protection & Victim Non-Retaliation
            </h4>
            <p className="text-slate-300">
              In accordance with Section 15A of the Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act,
              every victim, complainant, and witness is legally entitled to full protection against intimidation, coercion,
              and discrimination. Contacting the helpline does not alert the local village or prospective perpetrators.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5" />
              2. Real-Time Biometric Voice Anonymization
            </h4>
            <p className="text-slate-300">
              To protect callers from voice identification by local adversaries, the module offers instantaneous client-side
              and server-side pitch/formant masking. The acoustic distress markers (jitter, tremor, pause ratio) are extracted
              mathematically while stripping identity-specific biometric signatures.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
              <UserCheck className="w-3.5 h-3.5" />
              3. Dialect Equity & Non-Discriminatory AI
            </h4>
            <p className="text-slate-300">
              The AI models are calibrated against diverse Indian linguistic variations, tribal idioms, and rural vernaculars
              (Bhojpuri, Awadhi, Bundeli, Gondi, Santhali, rural Tamil/Telugu). The system does not penalize dialectal speech
              and focuses on physiological panic markers rather than grammar or accent.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              4. Human-In-The-Loop Oversight
            </h4>
            <p className="text-slate-300">
              The AI-calculated Stress Vulnerability Index (SVI) acts as a clinical copilot to prioritize human responders.
              No statutory relief denial or emergency dispatch can be blocked solely by algorithmic determination.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">MoSJE • 14566 Ethics Registry v3.2</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
