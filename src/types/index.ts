export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ChannelType = 'CALL_14566' | 'PORTAL' | 'IVRS' | 'MOBILE_APP' | 'CHATBOT';

export type CasteCategory = 'SC' | 'ST';

export interface DimensionScores {
  acousticDistressScore: number;
  semanticTraumaScore: number;
  immediateThreatScore: number;
  suicidalRiskScore: number;
  socialIsolationScore: number;
}

export interface AcousticMetrics {
  pitchHz: number;
  pitchStdDev: number;
  vocalTremorScore: number;
  jitterPercent: number;
  shimmerPercent: number;
  pauseRatio: number; // 0 to 1
  speechRateWpm: number;
  energyRms: number;
}

export interface KeyTraumaPhrase {
  phrase: string;
  markerType: string;
  distressSeverity: string;
}

export interface PsychologicalEvaluation {
  primaryEmotionalState: string;
  traumaIndicators: string[];
  cognitiveState: string;
  vulnerabilitySummary: string;
}

export interface StatutoryProtocols {
  emergencyPolice112Dispatch: boolean;
  witnessProtectionScheme15A: boolean;
  teleManasUrgentCounselling: boolean;
  dlsaFreeLegalAid: boolean;
  immediateMedicalForensicAid: boolean;
  safeShelterEvacuation: boolean;
  poaReliefEntitlementEstimate: string;
  recommendedPriorityLevel: string;
}

export interface OperatorGuidance {
  immediateDeescalationScriptHi: string;
  immediateDeescalationScriptEn: string;
  pacingInstruction: string;
  doNotSayAlert: string;
}

export interface TraumaAssessment {
  sviScore: number; // 0 - 100
  riskCategory: RiskCategory;
  dimensions: DimensionScores;
  detectedRedFlags: string[];
  psychologicalEvaluation: PsychologicalEvaluation;
  keyTraumaPhrases: KeyTraumaPhrase[];
  statutoryAndInterventionProtocols: StatutoryProtocols;
  operatorGuidance: OperatorGuidance;
  explainableAIRationale: string;
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  callerName: string;
  callerPhone: string;
  casteCategory: CasteCategory;
  district: string;
  state: string;
  incidentType: string;
  channel: ChannelType;
  timestamp: string;
  narrative: string;
  acousticMetrics: AcousticMetrics;
  assessment: TraumaAssessment;
  status: 'NEW_UNASSIGNED' | 'DISPATCHED_112' | 'UNDER_COUNSELLING' | 'DLSA_ASSIGNED' | 'RESOLVED';
  voiceBiometricsAnonymized: boolean;
  assignedOfficer?: string;
  audioDurationSeconds: number;
}

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'en-IN', label: 'English', nativeLabel: 'English' },
  { code: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'pa-IN', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'or-IN', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
];
