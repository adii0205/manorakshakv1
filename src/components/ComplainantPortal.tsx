import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Lock,
  Shield,
  Heart,
  PhoneCall,
  AlertCircle,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { CaseRecord, TraumaAssessment, AcousticMetrics } from '../types';
import { LiveAudioAnalyzer } from '../utils/audioAnalyzer';
import { AudioSpectrogramCanvas } from './AudioSpectrogramCanvas';
import { RiskBadge } from './RiskBadge';

interface ComplainantPortalProps {
  onSaveCase: (caseRecord: CaseRecord) => void;
  selectedLanguage: string;
}

export const ComplainantPortal: React.FC<ComplainantPortalProps> = ({
  onSaveCase,
  selectedLanguage,
}) => {
  const [complainantName, setComplainantName] = useState<string>('');
  const [complainantPhone, setComplainantPhone] = useState<string>('');
  const [casteCategory, setCasteCategory] = useState<'SC' | 'ST'>('SC');
  const [district, setDistrict] = useState<string>('Banda');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [incidentType, setIncidentType] = useState<string>('Social Boycott & Denial of Drinking Water (Sec 3(1)(za))');
  const [narrative, setNarrative] = useState<string>('');
  const [voiceMasked, setVoiceMasked] = useState<boolean>(true);
  const [hasConsented, setHasConsented] = useState<boolean>(true);

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{
    caseNumber: string;
    assessment: TraumaAssessment;
  } | null>(null);

  // Box Breathing Exercise state
  const [showBreathing, setShowBreathing] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingCounter, setBreathingCounter] = useState<number>(4);

  // Audio analyzer instance
  const audioAnalyzerRef = useRef<LiveAudioAnalyzer | null>(null);
  const [acousticMetrics, setAcousticMetrics] = useState<AcousticMetrics>({
    pitchHz: 210,
    pitchStdDev: 35,
    vocalTremorScore: 60,
    jitterPercent: 2.8,
    shimmerPercent: 4.5,
    pauseRatio: 0.32,
    speechRateWpm: 98,
    energyRms: 0.45,
  });

  // Timer for voice recording
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isRecording) {
      t = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  // Box breathing cyclic animation timer
  useEffect(() => {
    let bTimer: NodeJS.Timeout;
    if (showBreathing) {
      bTimer = setInterval(() => {
        setBreathingCounter((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(bTimer);
  }, [showBreathing]);

  // Toggle Voice Recording
  const handleToggleRecord = async () => {
    if (!audioAnalyzerRef.current) {
      audioAnalyzerRef.current = new LiveAudioAnalyzer();
    }

    if (!isRecording) {
      const ok = await audioAnalyzerRef.current.startListening(voiceMasked);
      if (ok) {
        setIsRecording(true);
        setRecordSeconds(0);
        // Start polling acoustic features
        const interval = setInterval(() => {
          if (audioAnalyzerRef.current?.isRecording) {
            const cur = audioAnalyzerRef.current.calculateCurrentMetrics();
            setAcousticMetrics(cur);
          } else {
            clearInterval(interval);
          }
        }, 500);
      }
    } else {
      setIsRecording(false);
      await audioAnalyzerRef.current.stopListening();
      if (!narrative) {
        setNarrative(
          'मुझे और मेरे परिवार को गांव के कुछ दबंगों द्वारा रास्ता रोकने और सार्वजनिक कुएं से पानी भरने से रोका जा रहा है। हमने विरोध किया तो हमें जान से मारने और गांव से निकालने की धमकी दी गई।'
        );
      }
    }
  };

  // Safe Exit - Quickly redirects or masks screen
  const handleSafeExit = () => {
    window.location.href = 'https://www.google.com';
  };

  // Submit Grievance & Run AI Assessment
  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assess-trauma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative,
          language: selectedLanguage,
          channel: 'PORTAL',
          acousticMetrics,
          complainantMetadata: {
            casteCategory,
            district,
            state,
            incidentType,
          },
        }),
      });

      const data = await res.json();
      const assessment: TraumaAssessment = data.assessment;

      const caseNumber = `NHAA/2026/${state.slice(0, 2).toUpperCase()}/${Math.floor(10000 + Math.random() * 90000)}`;

      const newCase: CaseRecord = {
        id: `case-${Date.now()}`,
        caseNumber,
        callerName: complainantName || 'Anonymous Complainant',
        callerPhone: complainantPhone || '+91 ••••••••••',
        casteCategory,
        district,
        state,
        incidentType,
        channel: 'PORTAL',
        timestamp: 'Just now',
        audioDurationSeconds: recordSeconds,
        voiceBiometricsAnonymized: voiceMasked,
        status: assessment.riskCategory === 'CRITICAL' ? 'DISPATCHED_112' : 'NEW_UNASSIGNED',
        narrative,
        acousticMetrics,
        assessment,
      };

      onSaveCase(newCase);
      setSubmissionResult({ caseNumber, assessment });
    } catch (err) {
      console.error('Error submitting grievance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner: Confidentiality, DPDP Act & Safe Exit */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>National Helpline Against Atrocities — Citizen Grievance Portal</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Confidential
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Your safety is our statutory priority. Grievances are protected under the SC/ST PoA Act and DPDP Act 2023.
            </p>
          </div>
        </div>

        {/* Safe Exit / Panic Masking Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBreathing(!showBreathing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60 transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showBreathing ? 'Close Calming Guide' : 'Need Grounding / Breathing Help?'}</span>
          </button>

          <button
            onClick={handleSafeExit}
            title="Instantly exit this screen to a blank search page if someone approaches"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700/80 border border-slate-700 transition-all"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Quick Panic Exit</span>
          </button>
        </div>
      </div>

      {/* Interactive Box-Breathing Widget */}
      {showBreathing && (
        <div className="bg-slate-900/95 border border-emerald-800/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-center space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Trauma Grounding Exercise (Box Breathing 4-4-4-4)
            </span>
            <h3 className="text-lg font-bold text-slate-100">
              You are safe here. Take a moment to breathe with us.
            </h3>
            <p className="text-xs text-slate-400">
              Slow down your heart rate and regulate your nervous system before describing your distress.
            </p>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 ${
                breathingPhase === 'Inhale'
                  ? 'scale-110 border-emerald-400 bg-emerald-950/40 text-emerald-200'
                  : breathingPhase === 'Hold'
                  ? 'scale-110 border-amber-400 bg-amber-950/40 text-amber-200'
                  : breathingPhase === 'Exhale'
                  ? 'scale-90 border-blue-400 bg-blue-950/40 text-blue-200'
                  : 'scale-95 border-slate-400 bg-slate-950/40 text-slate-300'
              }`}
            >
              <span className="text-xs font-mono uppercase tracking-widest font-bold">
                {breathingPhase}
              </span>
              <span className="text-3xl font-mono font-extrabold">{breathingCounter}s</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            "सांस अंदर लें... धीरे से रोकें... सांस बाहर छोड़ें... शांत रहें।"
          </p>
        </div>
      )}

      {/* Main Submission Form / Result Card */}
      {!submissionResult ? (
        <form onSubmit={handleSubmitGrievance} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>1. Complainant Details & Atrocity Classification</span>
              </h3>
              <p className="text-xs text-slate-400">
                You may submit anonymously or with protected identity. Caste information ensures correct statutory remedies under the PoA Act.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name (Optional / Protected)
                </label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="Leave blank for confidential anonymous report"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Contact Phone (For Emergency Dispatch)
                </label>
                <input
                  type="text"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="+91 Mobile number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Caste Category (Mandatory under PoA Act)
                </label>
                <select
                  value={casteCategory}
                  onChange={(e) => setCasteCategory(e.target.value as 'SC' | 'ST')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Banda, Sonbhadra, Belagavi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">State / UT</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh, Madhya Pradesh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Category</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Social Boycott & Denial of Drinking Water (Sec 3(1)(za))">
                    Social Boycott / Water Denial (Sec 3(1)(za))
                  </option>
                  <option value="Physical Assault & Grievous Hurt (Sec 3(2)(v))">
                    Physical Assault & Grievous Hurt (Sec 3(2)(v))
                  </option>
                  <option value="Forceful Dispossession of Agricultural Land (Sec 3(1)(g))">
                    Land Dispossession / Crop Destruction (Sec 3(1)(g))
                  </option>
                  <option value="Sexual Harassment / Violence (Sec 3(1)(w))">
                    Sexual Harassment / Violence (Sec 3(1)(w))
                  </option>
                  <option value="Caste-Based Verbal Abuse & Defamation (Sec 3(1)(r))">
                    Caste Verbal Abuse / Slurs (Sec 3(1)(r))
                  </option>
                  <option value="Police Inaction & Refusal to Register FIR">
                    Police Inaction / Refusal to Register FIR
                  </option>
                </select>
              </div>
            </div>

            {/* Voice Audio Intake Option */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>2. Speak Your Grievance (Voice Stress & Speech Intake)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    If writing is difficult or you are in immediate distress, press record and speak freely.
                  </p>
                </div>

                {/* Voice Anonymization Toggle */}
                <button
                  type="button"
                  onClick={() => setVoiceMasked(!voiceMasked)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    voiceMasked
                      ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Anonymize Voice: {voiceMasked ? 'ON (Masked)' : 'OFF'}</span>
                </button>
              </div>

              {/* Record Button & Visualizer */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/90 border border-slate-800/80 p-4 rounded-xl">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shrink-0 ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? `Recording... (${recordSeconds}s) Stop` : 'Record Voice Note'}</span>
                </button>

                <div className="w-full">
                  <AudioSpectrogramCanvas
                    isActive={isRecording}
                    simulatedTremorScore={acousticMetrics.vocalTremorScore}
                    height={70}
                    anonymized={voiceMasked}
                    getFrequencyData={
                      audioAnalyzerRef.current?.isRecording
                        ? (arr) => audioAnalyzerRef.current?.getFrequencyData(arr)
                        : undefined
                    }
                    getTimeDomainData={
                      audioAnalyzerRef.current?.isRecording
                        ? (arr) => audioAnalyzerRef.current?.getTimeDomainData(arr)
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>

            {/* Written Narrative Section */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="block text-sm font-bold text-slate-100">
                3. Incident Details / Written Narrative
              </label>
              <p className="text-xs text-slate-400">
                Describe what happened, who threatened you, if weapons were displayed, or if police refused to help.
              </p>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 leading-relaxed"
                placeholder="अपनी शिकायत यहाँ लिखें या ऊपर दिए गए 'Record Voice Note' बटन से बोलकर बताएं..."
              />
            </div>

            {/* Informed Consent Agreement */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300 leading-relaxed">
                  I understand that this digital assessment automatically evaluates psychological distress
                  and vulnerability to prioritize legal protection, emergency 112 dispatch, and
                  statutory relief under the SC/ST (PoA) Act. My data will be kept strictly confidential.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Immediate 24x7 Helpline: <strong>14566</strong></span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !hasConsented || !narrative.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Trauma with AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Grievance & Assess SVI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Submission Success Receipt */
        <div className="bg-slate-900 border border-emerald-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  GRIEVANCE SECURELY LODGED
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Reference Case ID: <span className="text-amber-400 font-mono">{submissionResult.caseNumber}</span>
                </h3>
              </div>
            </div>

            <RiskBadge category={submissionResult.assessment.riskCategory} size="lg" />
          </div>

          {/* SVI Assessment Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Stress Vulnerability Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-extrabold text-amber-400">
                  {submissionResult.assessment.sviScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Category: <strong>{submissionResult.assessment.riskCategory} RISK</strong>
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Emergency Protocol</span>
              <div className="text-sm font-bold text-rose-400 mt-1">
                {submissionResult.assessment.statutoryAndInterventionProtocols.recommendedPriorityLevel}
              </div>
              <p className="text-[11px] text-slate-400">
                {submissionResult.assessment.statutoryAndInterventionProtocols.emergencyPolice112Dispatch
                  ? 'Police 112 Dispatched'
                  : 'Nodal Officer Verification Triggered'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Estimated PoA Relief</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {submissionResult.assessment.statutoryAndInterventionProtocols.poaReliefEntitlementEstimate}
              </div>
              <p className="text-[11px] text-slate-400">
                Mandated under SC/ST PoA Rules 2016 Annexure-I
              </p>
            </div>
          </div>

          {/* Immediate Reassurance Script */}
          <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase font-mono">
              <Heart className="w-3.5 h-3.5 text-indigo-400" />
              Trauma Support & Immediate Protection Message
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{submissionResult.assessment.operatorGuidance.immediateDeescalationScriptHi}"
            </p>
          </div>

          {/* Emergency Helpline Contacts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block">NHAA Atrocities Helpline</span>
              <strong className="text-amber-400 text-sm">14566 (24x7)</strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Police Emergency</span>
              <strong className="text-rose-400 text-sm">112</strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Tele-MANAS Mental Health</span>
              <strong className="text-blue-400 text-sm">14416</strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Women Helpline</span>
              <strong className="text-purple-400 text-sm">181</strong>
            </div>
          </div>

          {/* Action to file another or return */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSubmissionResult(null);
                setNarrative('');
                setRecordSeconds(0);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Submit Another Grievance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
