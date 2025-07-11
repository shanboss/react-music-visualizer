"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AudioVisualizer: () => AudioVisualizer
});
module.exports = __toCommonJS(index_exports);

// src/AudioVisualizer.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function AudioVisualizer({
  showScrubber = true,
  height = 60,
  color = "#4E80EE",
  song,
  fftSize = 4096,
  numBars = 80,
  startFreq = 20,
  endFreq = 2e4,
  sampleRate = 44100
}) {
  const audioRef = (0, import_react.useRef)(null);
  const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
  const [progress, setProgress] = (0, import_react.useState)(0);
  const audioContextRef = (0, import_react.useRef)(null);
  const analyserRef = (0, import_react.useRef)(null);
  const dataArrayRef = (0, import_react.useRef)(null);
  const barRefs = (0, import_react.useRef)([]);
  const gainNodeRef = (0, import_react.useRef)(null);
  const getFrequencyForBin = (index, sampleRate2 = 44100, fftSize2 = 8192) => {
    const nyquist2 = sampleRate2 / 2;
    return (index + 0.5) * nyquist2 / (fftSize2 / 2);
  };
  const formatTime = (secs) => isNaN(secs) ? "0:00" : `${Math.floor(secs / 60)}:${("0" + Math.floor(secs % 60)).slice(-2)}`;
  const handleSeek = (e) => {
    const pct = parseFloat(e.target.value);
    const a = audioRef.current;
    if (a && a.duration) {
      a.currentTime = pct / 100 * a.duration;
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
  const logBins = /* @__PURE__ */ new Set();
  const logIndices = [];
  const nyquist = sampleRate / 2;
  for (let i = 0; i < numBars * 3; i++) {
    const logIndex = i / (numBars * 3 - 1);
    const freq = startFreq * Math.pow(endFreq / startFreq, logIndex);
    if (freq > nyquist) break;
    const bin = Math.floor(freq / nyquist * (fftSize / 2));
    if (bin === 0) continue;
    if (!logBins.has(bin)) {
      logBins.add(bin);
      logIndices.push(bin);
    }
    if (logIndices.length === numBars) break;
  }
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    let animationId;
    const animate = () => {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      logIndices.forEach((bin, i) => {
        const val = dataArrayRef.current[bin] || 0;
        const pct = Math.max(1, val / 255 * 100);
        const bar = barRefs.current[i];
        if (bar) bar.style.height = pct + "%";
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 text-white w-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "audio",
      {
        ref: audioRef,
        src: song,
        preload: "auto",
        onTimeUpdate: () => {
          const a = audioRef.current;
          if (a && a.duration) setProgress(a.currentTime / a.duration * 100);
        },
        onLoadedMetadata: () => setProgress(0)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: togglePlay, children: isPlaying ? "Pause" : "Play" }),
    showScrubber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: "mt-2 flex items-center gap-2 w-full rounded-lg p-2",
        style: { background: color },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs w-12 text-right", children: formatTime(audioRef.current?.currentTime || 0) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "range",
              min: "0",
              max: "100",
              step: "0.1",
              value: progress,
              onChange: handleSeek,
              className: "flex-1 cursor-pointer",
              style: { accentColor: color }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs w-12", children: formatTime(audioRef.current?.duration || 0) })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "flex items-end gap-px mt-4 w-full overflow-hidden",
        style: { height: typeof height === "number" ? `${height}px` : height },
        children: logIndices.map((bin, i) => {
          const freqLabel = getFrequencyForBin(bin);
          const keyFreqs = [20, 100, 1e3, 1e4, 2e4];
          const showLabel = keyFreqs.some((f) => {
            const tol = f < 100 ? 2 : f < 1e3 ? 20 : 200;
            return Math.abs(freqLabel - f) < tol;
          });
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              ref: (el) => {
                barRefs.current[i] = el;
              },
              className: "flex flex-col items-center flex-1 basis-0 duration-150 rounded-full",
              style: { height: "1%" },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  className: "w-full h-full rounded-full",
                  style: { background: color }
                }
              )
            },
            i
          );
        })
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AudioVisualizer
});
//# sourceMappingURL=index.js.map