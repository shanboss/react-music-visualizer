// src/AudioVisualizer.tsx
import {
  useRef,
  useState,
  useEffect
} from "react";

// node_modules/lucide-react/dist/esm/createLucideIcon.js
import { forwardRef as forwardRef2, createElement as createElement2 } from "react";

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
import { forwardRef, createElement } from "react";

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
var Icon = forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => createElement(
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
      ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef2(
    ({ className, ...props }, ref) => createElement2(Icon, {
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
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function AudioVisualizer({
  showPlayer = true,
  showScrubber = true,
  height = 60,
  color = "#4E80EE",
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
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const barRefs = useRef([]);
  const gainNodeRef = useRef(null);
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
  useEffect(() => {
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
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { className: "p-4 text-white w-full", children: [
    /* @__PURE__ */ jsx(
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
    playerPosition === "top" && /* @__PURE__ */ jsx(Fragment, { children: showScrubber && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mt-2 flex items-center gap-2 w-full rounded-lg p-2",
        style: { background: color },
        children: [
          showPlayer && /* @__PURE__ */ jsx("button", { onClick: togglePlay, className: "mr-2", children: isPlaying ? /* @__PURE__ */ jsx(Pause, { size: 16 }) : /* @__PURE__ */ jsx(Play, { size: 16 }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs w-12 text-right", children: formatTime(audioRef.current?.currentTime || 0) }),
          /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsx("span", { className: "text-xs w-12", children: formatTime(audioRef.current?.duration || 0) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
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
          return /* @__PURE__ */ jsx(
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
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `w-full h-full ${barStyle === "rounded" ? "rounded-full" : ""}`,
                  style: { background: color }
                }
              )
            },
            i
          );
        })
      }
    ),
    playerPosition === "bottom" && /* @__PURE__ */ jsx(Fragment, { children: showScrubber && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mt-2 flex items-center gap-2 w-full rounded-lg p-2",
        style: { background: color },
        children: [
          showPlayer && /* @__PURE__ */ jsx("button", { onClick: togglePlay, className: "mr-2", children: isPlaying ? /* @__PURE__ */ jsx(Pause, { size: 16 }) : /* @__PURE__ */ jsx(Play, { size: 16 }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs w-12 text-right", children: formatTime(audioRef.current?.currentTime || 0) }),
          /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsx("span", { className: "text-xs w-12", children: formatTime(audioRef.current?.duration || 0) })
        ]
      }
    ) })
  ] });
}
export {
  AudioVisualizer
};
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
//# sourceMappingURL=index.mjs.map