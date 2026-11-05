import { create } from 'zustand';
import { playNote, stopNote, resetPlayback } from '../../piano/audio/toneEngine';
import { setPlaybackRate as applyPlaybackRate } from '../audio/songClock';

export const useWorkspaceStore = create((set, get) => ({
  currentMode: 'AUTO_PLAY',
  pressedSources: {},
  pressedKeys: [],
  octaveShift: 0,
  playbackKeys: {},
  isPlaying: false,
  volume: 100,
  playbackRate: 1,
  keyLabels: 'shortcuts',
  duration: 250,
  sheet: null,
  sheetStatus: 'idle',
  sheetError: null,

  setMode: (mode) => {
    resetPlayback();
    set({ currentMode: mode, pressedSources: {}, pressedKeys: [], playbackKeys: {} });
  },
  setIsPlaying: (status) => set({ isPlaying: status }),
  setKeyLabels: (keyLabels) => set({ keyLabels }),
  setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
  setPlaybackRate: (rate) => {
    applyPlaybackRate(rate);
    set({ playbackRate: rate });
  },
  setDuration: (time) => set({ duration: time }),
  setSheetLoading: () => set({ sheet: null, sheetStatus: 'loading', sheetError: null }),
  setSheet: (sheet) => set({ sheet, sheetStatus: 'ready', sheetError: null }),
  setSheetError: (error) => set({ sheet: null, sheetStatus: 'error', sheetError: error }),
  setSheetViews: (id, views) => {
    const { sheet } = get();
    if (sheet?.id === id) set({ sheet: { ...sheet, views } });
  },

  pressKey: (note, source = 'mouse') => {
    const { pressedSources, currentMode } = get();
    if (currentMode === 'AUTO_PLAY') return;
    if (pressedSources[source]) return;
    const alreadyHeld = Object.values(pressedSources).includes(note);
    if (!alreadyHeld) playNote(note);
    const next = { ...pressedSources, [source]: note };
    set({ pressedSources: next, pressedKeys: [...new Set(Object.values(next))] });
  },

  releaseKey: (source = 'mouse') => {
    const { pressedSources } = get();
    const note = pressedSources[source];
    if (!note) return;
    const next = { ...pressedSources };
    delete next[source];
    const stillHeld = Object.values(next).includes(note);
    if (!stillHeld) stopNote(note);
    set({ pressedSources: next, pressedKeys: [...new Set(Object.values(next))] });
  },

  setOctaveShift: (octaveShift) => {
    const { pressedSources, octaveShift: current } = get();
    if (octaveShift === current) return;
    const next = Object.fromEntries(Object.entries(pressedSources).filter(([source]) => !source.startsWith('keyboard:')));
    const stillHeld = new Set(Object.values(next));
    new Set(Object.values(pressedSources)).forEach((note) => {
      if (!stillHeld.has(note)) stopNote(note);
    });
    set({ octaveShift, pressedSources: next, pressedKeys: [...stillHeld] });
  },

  setPlaybackKey: (note, hand) => {
    const { playbackKeys } = get();
    const count = (playbackKeys[note]?.count ?? 0) + 1;
    set({ playbackKeys: { ...playbackKeys, [note]: { hand, count } } });
  },

  clearPlaybackKey: (note) => {
    const { playbackKeys } = get();
    const current = playbackKeys[note];
    if (!current) return;
    const rest = { ...playbackKeys };
    if (current.count > 1) rest[note] = { ...current, count: current.count - 1 };
    else delete rest[note];
    set({ playbackKeys: rest });
  },

  resetKeys: () => set({ pressedSources: {}, pressedKeys: [], playbackKeys: {} }),
}));
