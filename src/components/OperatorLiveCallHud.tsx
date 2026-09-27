import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Siren,
  ShieldAlert,
  HeartHandshake,
  FileCheck2,
  Lock,
  Volume2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AcousticMetrics, CaseRecord, TraumaAssessment } from '../types';
import { AudioSpectrogramCanvas } from './AudioSpectrogramCanvas';
import { SviGauge } from './SviGauge';
import { RiskBadge } from './RiskBadge';
import { LiveAudioAnalyzer } from '../utils/audioAnalyzer';

interface OperatorLiveCallHudProps {
  onSaveCase: (caseRecord: CaseRecord) => void;
  selectedLanguage: string;
}

export const OperatorLiveCallHud: React.FC<OperatorLiveCallHudProps> = ({
  onSaveCase,
  selectedLanguage,
}) => {
  // Call status
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState<number>(142);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Caller Details
  const [callerPhone] = useState<string>('+91 94120 •••••');
  const [callerCaste] = useState<'SC' | 'ST'>('SC');
  const [callerDistrict] = useState<string>('Sonbhadra, Uttar Pradesh');
  const [incidentCategory] = useState<string>('PoA Sec 3(1)(za) - Social Boycott & Mob Intimidation');

  // Real-time Audio metrics
  const [acousticMetrics, setAcousticMetrics] = useState<AcousticMetrics>({
    pitchHz: 284,
    pitchStdDev: 48.2,
    vocalTremorScore: 84,
    jitterPercent: 4.8,
    shimmerPercent: 7.2,
    pauseRatio: 0.42,
    speechRateWpm: 92,
    energyRms: 0.68,
  });

  // Current Transcript
  const [transcript, setTranscript] = useState<string>(
    'सर हमारे पूरे मोहल्ले का पानी बंद कर दिया है। रात को 15-20 लोग लाठी और कट्टे लेकर घर पर आए और धमकी दी कि अगर कल सुबह तक गांव नहीं छोड़ा तो आग लगा देंगे। बच्चे रो रहे हैं, हम घर के अंदर बंद हैं, बाहर वे गालियां दे रहे हैं। पुलिस चौकी गए थे पर मुंशी जी ने भगा दिया।'
  );

  // Active Assessment State
  const [assessment, setAssessment] = useState<TraumaAssessment>({
    sviScore: 94,
    riskCategory: 'CRITICAL',
    dimensions: {
      acousticDistressScore: 88,
      semanticTraumaScore: 96,
      immediateThreatScore: 98,
      suicidalRiskScore: 45,
      socialIsolationScore: 95,
    },
    detectedRedFlags: [
      'IMMEDIATE_PHYSICAL_THREAT',
      'WEAPONS_REPORTED',
      'VILLAGE_BOYCOTT',
      'POLICE_REFUSAL_FIR',
      'CHILDREN_AT_RISK',
    ],
    psychologicalEvaluation: {
      primaryEmotionalState: 'Acute Terror & Threat Hyperarousal',
      traumaIndicators: ['Severe Vocal Tremor', 'Freezing State', 'Caste Boycott Trauma', 'Hyperventilation'],
      cognitiveState: 'Crisis survival mode, severe terror of mob lynching',
      vulnerabilitySummary: 'Complainant and family surrounded by armed mob; basic life resource (drinking water) shut off.',
    },
    keyTraumaPhrases: [
      { phrase: 'आग लगा देंगे (threat to set fire)', markerType: 'Arson / Life Peril', distressSeverity: 'CRITICAL' },
      { phrase: 'पानी बंद कर दिया (water boycott)', markerType: 'Denial of Basic Resource', distressSeverity: 'HIGH' },
      { phrase: 'कट्टे लेकर घर पर आए (armed with pistols)', markerType: 'Lethal Weapons Presence', distressSeverity: 'CRITICAL' },
    ],
    statutoryAndInterventionProtocols: {
      emergencyPolice112Dispatch: true,
      witnessProtectionScheme15A: true,
      teleManasUrgentCounselling: true,
      dlsaFreeLegalAid: true,
      immediateMedicalForensicAid: false,
      safeShelterEvacuation: true,
      poaReliefEntitlementEstimate: '₹4,25,000 (Annexure-I S.3(1)(za) + S.3(2)(iv))',
      recommendedPriorityLevel: 'P0 - RED EMERGENCY (Within 10 Mins)',
    },
    operatorGuidance: {
      immediateDeescalationScriptHi: 'रमेश जी, आप बिल्कुल सुरक्षित हैं। 14566 कंट्रोल रूम से हम सीधे पुलिस अधीक्षक (SP) और 112 को आपकी लोकेशन पर भेज रहे हैं। घर के दरवाजे अंदर से बंद रखें।',
      immediateDeescalationScriptEn: 'Ramesh ji, stay inside and keep doors barred. 14566 has alerted SP Sonbhadra and emergency 112 interceptors are en route right now. We are on the line with you.',
      pacingInstruction: 'Keep tone steady, low-frequency, unhurried. Do not ask for written documents.',
      doNotSayAlert: 'Do not advise the caller to step outside or confront the mob.',
    },
    explainableAIRationale: 'Assessed 94 SVI due to concurrent weapon threat, arson intimidation, water boycott, and high pitch tremor (84/100).',
  });

  // Action states
  const [policeDispatched, setPoliceDispatched] = useState<boolean>(true);
  const [witnessProtected, setWitnessProtected] = useState<boolean>(true);
  const [teleManasConnected, setTeleManasConnected] = useState<boolean>(false);
  const [poaReliefFiled, setPoaReliefFiled] = useState<boolean>(false);

  // Audio analyzer instance
  const audioAnalyzerRef = useRef<LiveAudioAnalyzer | null>(null);

  // Call timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Format call duration MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Re-assess via Gemini API
  const handleTriggerAiAssessment = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/assess-trauma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative: transcript,
          language: selectedLanguage,
          channel: 'CALL_14566',
          acousticMetrics,
          complainantMetadata: {
            casteCategory: callerCaste,
            district: callerDistrict,
            incidentType: incidentCategory,
          },
        }),
      });
      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch (err) {
      console.error('AI assessment error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Live mic toggle for the operator
  const handleToggleLiveMic = async () => {
    if (!audioAnalyzerRef.current) {
      audioAnalyzerRef.current = new LiveAudioAnalyzer();
    }

    if (!audioAnalyzerRef.current.isRecording) {
      const ok = await audioAnalyzerRef.current.startListening(isAnonymized);
      if (ok) {
        setIsMicMuted(false);
        // Start telemetry polling
        const interval = setInterval(() => {
          if (audioAnalyzerRef.current?.isRecording) {
            const current = audioAnalyzerRef.current.calculateCurrentMetrics();
            setAcousticMetrics(current);
          } else {
            clearInterval(interval);
          }
        }, 600);
      }
    } else {
      await audioAnalyzerRef.current.stopListening();
      setIsMicMuted(true);
    }
  };

  const handleEndCallAndArchive = () => {
    setIsCallActive(false);
    const newCase: CaseRecord = {
      id: `case-${Date.now()}`,
      caseNumber: `NHAA/2026/UP/${Math.floor(10000 + Math.random() * 90000)}`,
      callerName: 'Complainant (Voice Protected)',
      callerPhone,
      casteCategory: callerCaste,
      district: callerDistrict.split(',')[0].trim(),
      state: 'Uttar Pradesh',
      incidentType: incidentCategory,
      channel: 'CALL_14566',
      timestamp: 'Just now',
      audioDurationSeconds: callDuration,
      voiceBiometricsAnonymized: isAnonymized,
      status: policeDispatched ? 'DISPATCHED_112' : 'UNDER_COUNSELLING',
      narrative: transcript,
      acousticMetrics,
      assessment,
    };
    onSaveCase(newCase);
  };

  return (
    <div className="space-y-4">
      {/* Top Telephony Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Active Call Information */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCallActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <PhoneCall className={`w-6 h-6 ${isCallActive ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                  {isCallActive ? 'LIVE CALL IN PROGRESS' : 'CALL TERMINATED / ARCHIVED'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Duration: <strong className="text-slate-100">{formatTime(callDuration)}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                <span>Caller ID: {callerPhone}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Category: {callerCaste}
                </span>
                <span className="text-xs text-slate-400">📍 {callerDistrict}</span>
              </h2>
            </div>
          </div>

          {/* Telephonic Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsAnonymized(!isAnonymized)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAnonymized
                  ? 'bg-purple-950/60 text-purple-300 border-purple-600/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Voice Masking: {isAnonymized ? 'Active' : 'Off'}</span>
            </button>

            <button
              onClick={handleToggleLiveMic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                !isMicMuted
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {!isMicMuted ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>{!isMicMuted ? 'Mic Monitored' : 'Mic Muted'}</span>
            </button>

            <button
              onClick={handleTriggerAiAssessment}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Re-analyzing...' : 'Run Gemini Stress AI'}</span>
            </button>

            {isCallActive ? (
              <button
                onClick={handleEndCallAndArchive}
                className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Archive & Complete</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsCallActive(true);
                  setCallDuration(0);
                }}
                className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Next Inbound</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Spectrogram & Live Transcript; Right side SVI Gauge & Intervention Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Spectrogram, Transcript, Acoustic Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Waveform & Spectrogram Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Real-Time Voice Spectrogram & Frequency Stress Heatmap
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Sample Rate: 48kHz</span>
                <span>•</span>
                <span className="text-emerald-400">FFT 2048</span>
              </div>
            </div>

            <AudioSpectrogramCanvas
              isActive={isCallActive}
              simulatedTremorScore={acousticMetrics.vocalTremorScore}
              height={150}
              anonymized={isAnonymized}
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

            {/* Acoustic Telemetry Metrics Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-slate-400 text-[10px] uppercase block">Pitch (F0) & Instability</span>
                <span className="text-amber-300 font-bold text-sm">
                  {acousticMetrics.pitchHz} Hz{' '}
                  <span className="text-[10px] text-rose-400">(±{acousticMetrics.pitchStdDev})</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">High voice tension</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-slate-400 text-[10px] uppercase block">Vocal Tremor Score</span>
                <span className="text-rose-400 font-bold text-sm">
                  {acousticMetrics.vocalTremorScore} / 100
                </span>
                <span className="text-[10px] text-rose-400/80 block mt-0.5">Severe shudder</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-slate-400 text-[10px] uppercase block">Hesitation / Pause Ratio</span>
                <span className="text-amber-300 font-bold text-sm">
                  {(acousticMetrics.pauseRatio * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Emotional freezing</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-slate-400 text-[10px] uppercase block">Cadence / Jitter</span>
                <span className="text-slate-200 font-bold text-sm">
                  {acousticMetrics.speechRateWpm} WPM{' '}
                  <span className="text-[10px] text-amber-400">({acousticMetrics.jitterPercent}%)</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Irregular phonation</span>
              </div>
            </div>
          </div>

          {/* Live Call Transcript with Sentiment Heatmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Live Multilingual Transcript & Sentiment Annotations
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Recognized Dialect: Eastern Hindi (Awadhi / Bhojpuri blend)
              </span>
            </div>

            {/* Transcript text area */}
            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 font-sans leading-relaxed"
                placeholder="Transcribing incoming audio stream in real-time..."
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
                Editable for corrections
              </span>
            </div>

            {/* Extracted Key Trauma Phrases */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Identified Atrocity & Distress Triggers
              </span>
              <div className="flex flex-wrap gap-2">
                {assessment.keyTraumaPhrases.map((item, idx) => (
                  <div
                    key={idx}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                      item.distressSeverity === 'CRITICAL'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        : item.distressSeverity === 'HIGH'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <strong>{item.phrase}</strong>
                    <span className="text-[10px] opacity-80 font-mono">[{item.markerType}]</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable AI Forensic Rationale */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Explainable AI (XAI) Assessment Summary:
              </span>
              <p className="text-slate-300 leading-relaxed font-sans">
                {assessment.explainableAIRationale}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): SVI Gauge, Copilot Guidance, Statutory Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* SVI Gauge */}
          <SviGauge
            score={assessment.sviScore}
            riskCategory={assessment.riskCategory}
            dimensions={assessment.dimensions}
          />

          {/* Trauma-Informed Operator Copilot Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-900/30">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Trauma-Informed Operator Copilot
                </h4>
              </div>
              <RiskBadge category={assessment.riskCategory} size="sm" />
            </div>

            {/* Suggested Calming Script (Hindi) */}
            <div className="space-y-1 bg-slate-950/80 border border-indigo-950 rounded-xl p-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-indigo-300">
                <span>DE-ESCALATION PHRASE (HINDI)</span>
                <span className="text-[10px] text-emerald-400">Validated Trauma Response</span>
              </div>
              <p className="text-xs text-amber-200 font-medium leading-relaxed bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                "{assessment.operatorGuidance.immediateDeescalationScriptHi}"
              </p>
            </div>

            {/* English Equivalent */}
            <div className="space-y-1 bg-slate-950/80 border border-indigo-950 rounded-xl p-3">
              <span className="text-[11px] font-mono text-indigo-300">DE-ESCALATION PHRASE (ENGLISH)</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{assessment.operatorGuidance.immediateDeescalationScriptEn}"
              </p>
            </div>

            {/* Pacing and Alert Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Pacing Directive
                </span>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {assessment.operatorGuidance.pacingInstruction}
                </p>
              </div>

              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-2.5 space-y-1">
                <span className="text-[10px] font-mono text-rose-400 block uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Do NOT Say
                </span>
                <p className="text-rose-200 text-[11px] leading-snug">
                  {assessment.operatorGuidance.doNotSayAlert}
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Escalations & Mandatory Interventions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Mandatory Statutory Protocols
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
                PoA Rules 2016 Compliant
              </span>
            </div>

            {/* Recommended Priority */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Response Priority:</span>
              <strong className="text-rose-400 font-mono">
                {assessment.statutoryAndInterventionProtocols.recommendedPriorityLevel}
              </strong>
            </div>

            {/* 1-Click Action Interventions */}
            <div className="space-y-2 pt-1">
              {/* Emergency Police 112 Dispatch */}
              <button
                onClick={() => setPoliceDispatched(!policeDispatched)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  policeDispatched
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Siren className={`w-4 h-4 ${policeDispatched ? 'text-rose-400 animate-spin' : ''}`} />
                  <span>Immediate Emergency 112 Police PCR Dispatch</span>
                </div>
                {policeDispatched ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Dispatched
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono text-[11px]">Click to Trigger</span>
                )}
              </button>

              {/* Witness Protection Scheme Sec 15A */}
              <button
                onClick={() => setWitnessProtected(!witnessProtected)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  witnessProtected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Witness Protection Scheme (PoA Sec 15A Escort)</span>
                </div>
                {witnessProtected ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> SP Alerted
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono text-[11px]">Click to Request</span>
                )}
              </button>

              {/* Urgent Tele-MANAS Counselling */}
              <button
                onClick={() => setTeleManasConnected(!teleManasConnected)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  teleManasConnected
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-blue-400" />
                  <span>Tele-MANAS (14416) Trauma Psychiatrist Patch</span>
                </div>
                {teleManasConnected ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Patched
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono text-[11px]">Click to Connect</span>
                )}
              </button>

              {/* PoA Compensation Filing */}
              <button
                onClick={() => setPoaReliefFiled(!poaReliefFiled)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  poaReliefFiled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Auto-Sanction Annexure-I Relief (Est:{' '}
                    {assessment.statutoryAndInterventionProtocols.poaReliefEntitlementEstimate})
                  </span>
                </div>
                {poaReliefFiled ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Auto-Filed
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono text-[11px]">Initiate Sanction</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
