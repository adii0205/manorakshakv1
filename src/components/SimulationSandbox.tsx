import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code,
  Zap,
} from 'lucide-react';
import { AcousticMetrics, TraumaAssessment } from '../types';
import { LiveAudioAnalyzer } from '../utils/audioAnalyzer';
import { AudioSpectrogramCanvas } from './AudioSpectrogramCanvas';
import { SviGauge } from './SviGauge';
import { RiskBadge } from './RiskBadge';

const PRESET_SCENARIOS = [
  {
    title: 'Bundelkhand: Armed Mob & Well Water Cutoff',
    state: 'Uttar Pradesh',
    caste: 'SC',
    incident: 'Social Boycott & Violent Retribution',
    narrative:
      'सर हमारे पूरे मोहल्ले का पानी बंद कर दिया है। रात को 15-20 लोग लाठी और कट्टे लेकर घर पर आए और धमकी दी कि अगर कल सुबह तक गांव नहीं छोड़ा तो आग लगा देंगे। बच्चे रो रहे हैं, हम घर के अंदर बंद हैं, बाहर वे गालियां दे रहे हैं। पुलिस चौकी गए थे पर मुंशी जी ने भगा दिया।',
    presetAcoustics: {
      pitchHz: 284,
      pitchStdDev: 48,
      vocalTremorScore: 84,
      jitterPercent: 4.8,
      shimmerPercent: 7.2,
      pauseRatio: 0.42,
      speechRateWpm: 92,
      energyRms: 0.68,
    },
  },
  {
    title: 'Dindori: Tribal Land Grab & Severe Head Injury',
    state: 'Madhya Pradesh',
    caste: 'ST',
    incident: 'Land Dispossession & Physical Assault',
    narrative:
      'हमारा पट्टा की जमीन पर गांव के दबंगों ने ट्रैक्टर चलाकर हमारी फसल नष्ट कर दी। विरोध करने पर मेरे पति को कुल्हाड़ी के पिछले हिस्से से मारा। सिर पर गंभीर चोट आई है और जिला अस्पताल में भर्ती हैं। मैं बहुत डरी हुई हूं।',
    presetAcoustics: {
      pitchHz: 230,
      pitchStdDev: 32,
      vocalTremorScore: 71,
      jitterPercent: 3.2,
      shimmerPercent: 5.6,
      pauseRatio: 0.35,
      speechRateWpm: 104,
      energyRms: 0.54,
    },
  },
  {
    title: 'Madurai: Public Dignity Denial & Footwear Ban',
    state: 'Tamil Nadu',
    caste: 'SC',
    incident: 'Untouchability & Denial of Public Space',
    narrative:
      'In our village festival, our community members were forbidden from walking on the main street with slippers and threatened with boycott. We demand protection and FIR under Section 3(1)(za).',
    presetAcoustics: {
      pitchHz: 185,
      pitchStdDev: 22,
      vocalTremorScore: 45,
      jitterPercent: 1.8,
      shimmerPercent: 3.1,
      pauseRatio: 0.22,
      speechRateWpm: 120,
      energyRms: 0.42,
    },
  },
  {
    title: 'Delhi: Post-Matric Scholarship Procedural Query',
    state: 'Delhi',
    caste: 'SC',
    incident: 'Procedural Administrative Inquiry',
    narrative:
      'I am calling to verify the DBT disbursement timeline for my post-matric scholarship application under the MoSJE portal. No emergency or threat.',
    presetAcoustics: {
      pitchHz: 130,
      pitchStdDev: 12,
      vocalTremorScore: 18,
      jitterPercent: 0.8,
      shimmerPercent: 1.4,
      pauseRatio: 0.11,
      speechRateWpm: 135,
      energyRms: 0.35,
    },
  },
];

export const SimulationSandbox: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [narrativeText, setNarrativeText] = useState<string>(PRESET_SCENARIOS[0].narrative);
  const [acousticMetrics, setAcousticMetrics] = useState<AcousticMetrics>(
    PRESET_SCENARIOS[0].presetAcoustics
  );

  // Live mic tester
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(false);
  const audioAnalyzerRef = useRef<LiveAudioAnalyzer | null>(null);

  // Assessment results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<TraumaAssessment | null>(null);
  const [apiSource, setApiSource] = useState<string>('');

  // Handle Preset selection
  const handleSelectScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setNarrativeText(PRESET_SCENARIOS[idx].narrative);
    setAcousticMetrics(PRESET_SCENARIOS[idx].presetAcoustics);
  };

  // Toggle Live Mic
  const handleToggleLiveMic = async () => {
    if (!audioAnalyzerRef.current) {
      audioAnalyzerRef.current = new LiveAudioAnalyzer();
    }

    if (!isLiveMicActive) {
      const ok = await audioAnalyzerRef.current.startListening(false);
      if (ok) {
        setIsLiveMicActive(true);
        const interval = setInterval(() => {
          if (audioAnalyzerRef.current?.isRecording) {
            const cur = audioAnalyzerRef.current.calculateCurrentMetrics();
            setAcousticMetrics(cur);
          } else {
            clearInterval(interval);
          }
        }, 400);
      }
    } else {
      setIsLiveMicActive(false);
      await audioAnalyzerRef.current.stopListening();
    }
  };

  // Run AI Assessment
  const handleRunAssessment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/assess-trauma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative: narrativeText,
          language: 'Hindi / English',
          channel: 'CALL_14566',
          acousticMetrics,
          complainantMetadata: {
            casteCategory: PRESET_SCENARIOS[activeScenarioIdx]?.caste || 'SC',
            state: PRESET_SCENARIOS[activeScenarioIdx]?.state || 'Uttar Pradesh',
          },
        }),
      });

      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
        setApiSource(data.source || 'gemini-3.8-flash');
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">
            Acoustic & Semantic Stress Assessment Simulation Sandbox
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Test the multi-modal AI engine by selecting real-world atrocity scenarios, speaking into your live microphone,
          or manually tweaking speech acoustics (jitter, pitch instability, pause ratio) to evaluate the model's sensitivity.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SCENARIOS.map((sc, i) => (
          <button
            key={i}
            onClick={() => handleSelectScenario(i)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeScenarioIdx === i
                ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                Scenario #{i + 1}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">
                {sc.caste}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{sc.title}</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              "{sc.narrative}"
            </p>
          </button>
        ))}
      </div>

      {/* Interactive Controls & Telemetry adjustments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Text narrative, Mic, Acoustic Sliders */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Input Narrative & Live Telemetry Modulation
                </h3>
              </div>

              {/* Mic toggle */}
              <button
                onClick={handleToggleLiveMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isLiveMicActive
                    ? 'bg-rose-950/80 text-rose-300 border-rose-600/50 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isLiveMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isLiveMicActive ? 'Stop Live Mic' : 'Test With Live Mic'}</span>
              </button>
            </div>

            {/* Audio Waveform Canvas */}
            <AudioSpectrogramCanvas
              isActive={isLiveMicActive || true}
              simulatedTremorScore={acousticMetrics.vocalTremorScore}
              height={90}
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

            {/* Narrative Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Spoken or Written Grievance Narrative
              </label>
              <textarea
                value={narrativeText}
                onChange={(e) => setNarrativeText(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
              />
            </div>

            {/* Acoustic Feature Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase block">
                Acoustic Distress Parameter Calibration
              </span>

              {/* Slider 1: Vocal Tremor Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Vocal Tremor & Shudder Index (0–100)</span>
                  <span className="font-mono font-bold text-amber-400">
                    {acousticMetrics.vocalTremorScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={acousticMetrics.vocalTremorScore}
                  onChange={(e) =>
                    setAcousticMetrics({
                      ...acousticMetrics,
                      vocalTremorScore: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider 2: Pause / Hesitation Ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Pause / Freezing Ratio (0.05–0.90)</span>
                  <span className="font-mono font-bold text-amber-400">
                    {(acousticMetrics.pauseRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={acousticMetrics.pauseRatio * 100}
                  onChange={(e) =>
                    setAcousticMetrics({
                      ...acousticMetrics,
                      pauseRatio: +(Number(e.target.value) / 100).toFixed(2),
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider 3: Pitch F0 & Instability */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Fundamental Pitch (Hz)</span>
                  <span className="font-mono font-bold text-amber-400">
                    {acousticMetrics.pitchHz} Hz (±{acousticMetrics.pitchStdDev})
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="380"
                  value={acousticMetrics.pitchHz}
                  onChange={(e) =>
                    setAcousticMetrics({
                      ...acousticMetrics,
                      pitchHz: Number(e.target.value),
                      pitchStdDev: Math.round(Number(e.target.value) * 0.18),
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Evaluate Button */}
            <div className="pt-2">
              <button
                onClick={handleRunAssessment}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isLoading ? 'Running Gemini 3.8 Flash Stress Assessment...' : 'Evaluate Trauma Index with Gemini'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): AI Assessment Output Card */}
        <div className="lg:col-span-5 space-y-4">
          {assessment ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    AI Evaluation Output
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                  {apiSource}
                </span>
              </div>

              {/* SVI Gauge */}
              <SviGauge
                score={assessment.sviScore}
                riskCategory={assessment.riskCategory}
                dimensions={assessment.dimensions}
              />

              {/* Red Flags detected */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Detected Red Flags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.detectedRedFlags.map((flag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/50"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explainable AI Rationale */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-amber-400 font-semibold font-mono text-[10px] block uppercase">
                  Explainable AI (XAI) Rationale
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {assessment.explainableAIRationale}
                </p>
              </div>

              {/* Statutory Entitlements */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl text-xs space-y-1">
                <span className="text-emerald-400 font-semibold font-mono text-[10px] block uppercase">
                  PoA Relief Sanction
                </span>
                <div className="text-sm font-bold text-emerald-300 font-mono">
                  {assessment.statutoryAndInterventionProtocols.poaReliefEntitlementEstimate}
                </div>
                <div className="text-[11px] text-slate-400">
                  Priority: {assessment.statutoryAndInterventionProtocols.recommendedPriorityLevel}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Click "Evaluate Trauma Index with Gemini" to generate real-time clinical assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
