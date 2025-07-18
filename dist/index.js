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
var import_react3 = require("react");

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var import_react2 = require("react");

// node_modules/lucide-react/dist/esm/shared/src/utils.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};

// node_modules/lucide-react/dist/esm/Icon.js
var import_react = require("react");

// node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/lucide-react/dist/esm/Icon.js
var Icon = (0, import_react.forwardRef)(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => (0, import_react.createElement)(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = (0, import_react2.forwardRef)(
    ({ className, ...props }, ref) => (0, import_react2.createElement)(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// node_modules/lucide-react/dist/esm/icons/pause.js
var __iconNode = [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
];
var Pause = createLucideIcon("pause", __iconNode);

// node_modules/lucide-react/dist/esm/icons/play.js
var __iconNode2 = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]];
var Play = createLucideIcon("play", __iconNode2);

// src/AudioVisualizer.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function AudioVisualizer({
  showPlayer = true,
  showScrubber = true,
  height = 60,
  color = "#4E80EE",
  colorGradient,
  song,
  fftSize = 4096,
  numBars = 30,
  startFreq = 20,
  endFreq = 2e4,
  sampleRate = 44100,
  graphStyle = "bottom",
  barStyle = "rounded",
  gapWidth = 1,
  playerPosition = "bottom"
}) {
  const audioRef = (0, import_react3.useRef)(null);
  const [isPlaying, setIsPlaying] = (0, import_react3.useState)(false);
  const [progress, setProgress] = (0, import_react3.useState)(0);
  const audioContextRef = (0, import_react3.useRef)(null);
  const analyserRef = (0, import_react3.useRef)(null);
  const dataArrayRef = (0, import_react3.useRef)(null);
  const barRefs = (0, import_react3.useRef)([]);
  const gainNodeRef = (0, import_react3.useRef)(null);
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
  (0, import_react3.useEffect)(() => {
    if (!audioRef.current) return;
    const audioCtx = new window.AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.smoothingTimeConstant = 0.01;
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
  (0, import_react3.useEffect)(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    let animationId;
    const animate = () => {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      logIndices.forEach((bin, i) => {
        const raw = dataArrayRef.current[bin] || 0;
        const linear = raw / 255;
        const pct = Math.max(1, linear * 100);
        const bar = barRefs.current[i];
        if (bar) {
          if (graphStyle === "centered") {
            bar.style.transform = `scaleY(${pct / 100})`;
            bar.style.transformOrigin = "center";
          } else {
            bar.style.height = pct + "%";
            bar.style.transform = "";
            bar.style.transformOrigin = "";
          }
        }
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [graphStyle]);
  const gradientId = "audio-vis-gradient-fixed";
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
        onLoadedMetadata: () => setProgress(0),
        onEnded: () => {
          setIsPlaying(false);
          setProgress(0);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }
      }
    ),
    playerPosition === "top" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: showScrubber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: "mt-2 flex items-center gap-2 w-full rounded-lg p-2",
        style: { background: color },
        children: [
          showPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: togglePlay, className: "mr-2", children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 }) }),
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
    ) }),
    colorGradient && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "svg",
      {
        style: { height: 0, width: 0, position: "absolute" },
        "aria-hidden": "true",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: gradientId, x1: "0%", y1: "100%", x2: "0%", y2: "0%", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", stopColor: colorGradient[0] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", stopColor: colorGradient[1] })
        ] }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: `flex ${graphStyle === "centered" ? "items-center" : "items-end"} mt-4 w-full overflow-hidden`,
        style: {
          height: typeof height === "number" ? `${height}px` : height,
          gap: `${gapWidth}px`
          // ← NEW
        },
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
              className: "flex flex-col items-center flex-1 basis-0",
              style: {
                height: graphStyle === "centered" ? "100%" : "1%",
                transform: graphStyle === "centered" ? "scaleY(1)" : void 0,
                transformOrigin: graphStyle === "centered" ? "center" : void 0,
                transition: "height 150ms ease, transform 150ms ease"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  className: `w-full h-full ${barStyle === "rounded" ? "rounded-full" : ""}`,
                  style: {
                    background: colorGradient ? `url(#${gradientId})` : color,
                    backgroundImage: colorGradient ? `linear-gradient(to top, ${colorGradient[0]}, ${colorGradient[1]})` : void 0,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 100%"
                  }
                }
              )
            },
            i
          );
        })
      }
    ),
    playerPosition === "bottom" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: showScrubber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: "mt-2 flex items-center gap-2 w-full rounded-lg p-2",
        style: { background: color },
        children: [
          showPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: togglePlay, className: "mr-2", children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 }) }),
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
    ) })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AudioVisualizer
});
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/pause.js:
lucide-react/dist/esm/icons/play.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.525.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=index.js.map