import React, { useState } from 'react';
import { Siren, X, AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [district, setDistrict] = useState<string>('Sonbhadra');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [landmark, setLandmark] = useState<string>('Near Primary School, Harijan Basti');

  if (!isOpen) return null;

  const handleTriggerDispatch = () => {
    setIsDispatched(true);
    setTimeout(() => {
      // Keep dispatched state active
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 ring-4 ring-rose-600/30">
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 animate-pulse">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-rose-300 font-mono tracking-tight">
                CRITICAL RED EMERGENCY SOS DISPATCH
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                NHAA 14566 • Direct Interceptor Integration
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

        {!isDispatched ? (
          <div className="space-y-4 text-xs">
            <div className="bg-rose-950/40 border border-rose-900/60 p-3.5 rounded-xl space-y-1">
              <span className="font-bold text-rose-300 flex items-center gap-1.5 uppercase font-mono text-[11px]">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Immediate Life Threat Protocol
              </span>
              <p className="text-slate-300 leading-relaxed">
                Triggering this will immediately bypass procedural queues and dispatch the nearest
                Emergency 112 Police Mobile Patrol (PCR) and alert the District Magistrate (DM) and
                Superintendent of Police (SP) under Section 15A of the SC/ST PoA Act.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Victim / Complainant District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Incident Landmark & Location
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleTriggerDispatch}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 flex items-center gap-2 border border-rose-400/40"
              >
                <Siren className="w-4 h-4 animate-spin" />
                <span>CONFIRM RED DISPATCH (112 PCR)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-100 font-mono">
                DISPATCH SIGNAL TRANSMITTED
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                Emergency 112 interceptor unit in <strong>{district}</strong> has received the GPS coordinate.
                District Control Room and Special Cell DSP notified.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
              Broadcast ID: SOS-NHAA-112-99824 • ETA: 8-12 Minutes
            </div>
            <button
              onClick={() => {
                setIsDispatched(false);
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Close Alert Dialog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
