import * as react_jsx_runtime from 'react/jsx-runtime';

type AudioVisualizer = {
    showPlayer?: boolean;
    showScrubber?: boolean;
    color?: string;
    colorGradient?: [string, string];
    height?: number;
    song: string;
    numBars?: number;
    sampleRate?: number;
    fftSize?: number;
    startFreq?: number;
    endFreq?: number;
    graphStyle?: "bottom" | "centered";
    barStyle?: "rounded" | "square";
    gapWidth?: number;
    playerPosition?: "top" | "bottom";
};
declare function AudioVisualizer({ showPlayer, showScrubber, height, color, colorGradient, song, fftSize, numBars, startFreq, endFreq, sampleRate, graphStyle, barStyle, gapWidth, playerPosition, }: AudioVisualizer): react_jsx_runtime.JSX.Element;

export { AudioVisualizer };
