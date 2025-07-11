"use client";
import React, {
  useRef,
  useState,
  useEffect,
  RefObject,
  ChangeEvent,
} from "react";

type AudioVisualizer = {
  showPlayer?: boolean;
  showScrubber?: boolean;
  color?: string;
  height?: number;
  song: string;
  numBars?: number;
  sampleRate?: number;
  fftSize?: number;
  startFreq?: number;
  endFreq?: number;
};

export default function AudioVisualizer({
  showPlayer = true,
  showScrubber = true,
  height = 60,
  color = "#4E80EE",
  song,
  fftSize = 4096,
  numBars = 80,
  startFreq = 20,
  endFreq = 20000,
  sampleRate = 44100,
}: AudioVisualizer) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100 %

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const barRefs = useRef<HTMLDivElement[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const getFrequencyForBin = (
    index: number,
    sampleRate = 44100,
    fftSize = 8192
  ) => {
    const nyquist = sampleRate / 2;
    return ((index + 0.5) * nyquist) / (fftSize / 2);
  };

  const formatTime = (secs: number): string =>
    isNaN(secs)
      ? "0:00"
      : `${Math.floor(secs / 60)}:${("0" + Math.floor(secs % 60)).slice(-2)}`;

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const a = audioRef.current;
    if (a && a.duration) {
      a.currentTime = (pct / 100) * a.duration;
      setProgress(pct);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audioContextRef.current?.resume();
      audio.play();

      if (gainNodeRef.current && audioContextRef.current) {
        const time = audioContextRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(time);
        gainNodeRef.current.gain.setValueAtTime(0, time);
        gainNodeRef.current.gain.linearRampToValueAtTime(1, time + 1);
      }
    }

    setIsPlaying(!isPlaying);
  };

  // logIndices: log-distributed bins
  const logBins = new Set<number>();
  const logIndices: number[] = [];
  const nyquist = sampleRate / 2;

  for (let i = 0; i < numBars * 3; i++) {
    const logIndex = i / (numBars * 3 - 1);
    const freq = startFreq * Math.pow(endFreq / startFreq, logIndex);
    if (freq > nyquist) break;
    const bin = Math.floor((freq / nyquist) * (fftSize / 2));
    if (bin === 0) continue;
    if (!logBins.has(bin)) {
      logBins.add(bin);
      logIndices.push(bin);
    }
    if (logIndices.length === numBars) break;
  }

  useEffect(() => {
    if (!audioRef.current) return;

    const audioCtx = new window.AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 0.15;
    analyser.fftSize = 8192;

    const source = audioCtx.createMediaElementSource(audioRef.current);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    gainNodeRef.current = gainNode;

    return () => {
      analyser.disconnect();
      source.disconnect();
      audioCtx.close();
    };
  }, []);

  useEffect(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    let animationId: number;
    const animate = () => {
      analyserRef.current!.getByteFrequencyData(dataArrayRef.current!);
      logIndices.forEach((bin, i) => {
        const val = dataArrayRef.current![bin] || 0;
        const pct = Math.max(1, (val / 255) * 100);
        const bar = barRefs.current[i];
        if (bar) bar.style.height = pct + "%";
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="p-4 text-white w-full">
      <audio
        ref={audioRef}
        src={song}
        preload="auto"
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
        }}
        onLoadedMetadata={() => setProgress(0)}
      />
      {/* Player Controls */}
      <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>

      {/* Scrubber */}
      {showScrubber && (
        <div
          className="mt-2 flex items-center gap-2 w-full rounded-lg p-2"  
          style={{ background: color }}
        >
          <span className="text-xs w-12 text-right">
            {formatTime(audioRef.current?.currentTime || 0)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="flex-1 cursor-pointer"
            style={{ accentColor: color }}
          />
          <span className="text-xs w-12">
            {formatTime(audioRef.current?.duration || 0)}
          </span>
        </div>
      )}

      {/* Bars */}
      <div
        className="flex items-end gap-px mt-4 w-full overflow-hidden"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        {logIndices.map((bin, i) => {
          const freqLabel = getFrequencyForBin(bin);
          const keyFreqs = [20, 100, 1000, 10000, 20000];
          const showLabel = keyFreqs.some((f) => {
            const tol = f < 100 ? 2 : f < 1000 ? 20 : 200;
            return Math.abs(freqLabel - f) < tol;
          });

          return (
            <div
              key={i}
              ref={(el) => {
                barRefs.current[i] = el!;
              }}
              className="flex flex-col items-center flex-1 basis-0 duration-150 rounded-full"
              style={{ height: "1%" }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{ background: color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
