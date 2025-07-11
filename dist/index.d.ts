import * as react_jsx_runtime from 'react/jsx-runtime';

type AudioVisualizer = {
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
declare function AudioVisualizer({ showScrubber, height, color, song, fftSize, numBars, startFreq, endFreq, sampleRate, }: AudioVisualizer): react_jsx_runtime.JSX.Element;

export { AudioVisualizer };
