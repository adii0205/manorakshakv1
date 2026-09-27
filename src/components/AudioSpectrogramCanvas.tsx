import React, { useEffect, useRef } from 'react';

interface AudioSpectrogramCanvasProps {
  isActive: boolean;
  getFrequencyData?: (arr: Uint8Array) => void;
  getTimeDomainData?: (arr: Uint8Array) => void;
  simulatedTremorScore?: number;
  height?: number;
  anonymized?: boolean;
}

export const AudioSpectrogramCanvas: React.FC<AudioSpectrogramCanvasProps> = ({
  isActive,
  getFrequencyData,
  getTimeDomainData,
  simulatedTremorScore = 30,
  height = 140,
  anonymized = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 128;
    const freqArray = new Uint8Array(bufferLength);
    const timeArray = new Uint8Array(bufferLength);
    let simPhase = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const h = canvas.height;

      // Dark futuristic slate background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, h);

      // Grid background lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let y = 20; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isActive && getFrequencyData && getTimeDomainData) {
        getFrequencyData(freqArray);
        getTimeDomainData(timeArray);
      } else if (isActive) {
        // Simulated audio animation if using synthetic telemetry
        simPhase += 0.08;
        const distressMultiplier = simulatedTremorScore / 50;
        for (let i = 0; i < bufferLength; i++) {
          const raw =
            Math.sin(simPhase * 1.5 + i * 0.15) * 45 +
            Math.cos(simPhase * 3.2 + i * 0.08) * (25 * distressMultiplier) +
            Math.random() * (12 * distressMultiplier);
          freqArray[i] = Math.max(10, Math.min(255, 60 + raw));
          timeArray[i] = 128 + Math.sin(simPhase * 2 + i * 0.2) * (30 * distressMultiplier);
        }
      } else {
        // Idle line
        for (let i = 0; i < bufferLength; i++) {
          freqArray[i] = 0;
          timeArray[i] = 128;
        }
      }

      // 1. Draw Spectrogram Frequency Bars
      const barWidth = (width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (freqArray[i] / 255) * (h * 0.72);

        // Color coding by frequency stress zone
        let strokeColor = 'rgba(16, 185, 129, 0.7)'; // Calm emerald
        if (freqArray[i] > 160 || simulatedTremorScore > 65) {
          strokeColor = 'rgba(239, 68, 68, 0.85)'; // Distress Crimson
        } else if (freqArray[i] > 110 || simulatedTremorScore > 40) {
          strokeColor = 'rgba(245, 158, 11, 0.8)'; // Warning Amber
        }

        if (anonymized) {
          strokeColor = 'rgba(139, 92, 246, 0.8)'; // Masked purple
        }

        ctx.fillStyle = strokeColor;
        ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);

        x += barWidth;
        if (x > width) break;
      }

      // 2. Draw Waveform Oscillogram Overlay
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = anonymized
        ? '#c084fc'
        : simulatedTremorScore > 65
        ? '#f87171'
        : '#34d399';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let waveX = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = timeArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) ctx.moveTo(waveX, y);
        else ctx.lineTo(waveX, y);

        waveX += sliceWidth;
      }
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      // Telemetry frequency labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('0 Hz', 8, h - 6);
      ctx.fillText('F0 SPEECH (80-250Hz)', width * 0.18, h - 6);
      ctx.fillText('TENSION (2-4kHz)', width * 0.55, h - 6);
      ctx.fillText('PEAK DISTRESS (>6kHz)', width * 0.80, h - 6);

      if (anonymized) {
        ctx.fillStyle = '#c084fc';
        ctx.fillText('🛡️ BIOMETRIC VOICE ANONYMIZATION ACTIVE (FORMANT SHIFTED)', 8, 18);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, getFrequencyData, getTimeDomainData, simulatedTremorScore, anonymized]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full block"
      />
      {isActive && (
        <div className="absolute top-2 right-3 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-full text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                simulatedTremorScore > 65 ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                simulatedTremorScore > 65 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            ></span>
          </span>
          <span className="text-slate-300 font-semibold tracking-wider uppercase text-[10px]">
            {anonymized ? 'Masked Audio Live' : 'Live Acoustic Stream'}
          </span>
        </div>
      )}
    </div>
  );
};
