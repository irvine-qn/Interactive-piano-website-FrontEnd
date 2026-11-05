import * as Tone from "tone";
import { pianoSampler, resetPlayback } from "../../piano/audio/toneEngine";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { getPlaybackRate, getSongTime, setSongTempo, setSongTime, songTimeToTicks } from "./songClock";

let part = null;
let chordPart = null;
let chords = [];
let waitingChord = null;
let clearedChordIndex = -1;
let waitPauseTime = null;
const recentPresses = new Map();
let endEventId = null;
let ignoreBefore = 0;
const TIME_EPSILON = 1e-6;
const EARLY_PRESS_WINDOW_MS = 250;
const START_POSITION_TOLERANCE_SECONDS = 0.05;
const WAIT_PAUSE_TIME_TOLERANCE = 0.01;
const RESUME_DELAY_SECONDS = 0.001;

const wasPressedRecently = (note) => {
  const pressedAt = recentPresses.get(note);
  return pressedAt !== undefined && performance.now() - pressedAt <= EARLY_PRESS_WINDOW_MS;
};

const isChordComplete = (chord) => [...chord.notes.keys()].every(wasPressedRecently);

const clearWaitingChord = () => {
  if (!waitingChord) return;
  const store = useWorkspaceStore.getState();
  waitingChord.notes.forEach((_, name) => store.clearPlaybackKey(name));
  clearedChordIndex = waitingChord.index;
  waitingChord = null;
};

const handleChordReached = (time, chord) => {
  if (useWorkspaceStore.getState().currentMode !== "PRACTICE") return;
  if (time < ignoreBefore - TIME_EPSILON || chord.index === clearedChordIndex) return;
  if (waitingChord?.index === chord.index) return;
  if (isChordComplete(chord)) {
    clearedChordIndex = chord.index;
    return;
  }
  waitingChord = chord;
  waitPauseTime = time;
  Tone.Transport.pause(time);
  const store = useWorkspaceStore.getState();
  chord.notes.forEach((hand, name) => store.setPlaybackKey(name, hand));
};

const startFromFirstChord = async () => {
  if (Tone.context.state !== "running") await Tone.start();
  setSongTime(chords[0].time);
  Tone.Transport.start();
};

export const handleUserNote = (note) => {
  recentPresses.set(note, performance.now());
  const notStarted = Tone.Transport.state !== "started" && getSongTime() < START_POSITION_TOLERANCE_SECONDS;
  if (notStarted && chords[0]?.notes.has(note)) {
    startFromFirstChord();
    return;
  }
  if (!waitingChord || !isChordComplete(waitingChord)) return;
  clearWaitingChord();
  if (useWorkspaceStore.getState().isPlaying) {
    Tone.Transport.start(Math.max(Tone.now(), waitPauseTime) + RESUME_DELAY_SECONDS);
  }
};

export const isWaitingForNotes = () => waitingChord !== null;

export const isWaitPause = (time) =>
  waitPauseTime !== null && Math.abs(time - waitPauseTime) <= WAIT_PAUSE_TIME_TOLERANCE;

export const resetWaitState = () => {
  waitingChord = null;
  clearedChordIndex = -1;
  waitPauseTime = null;
  recentPresses.clear();
};

// Bỏ qua sự kiện tồn đọng của vị trí cũ sau khi dừng hoặc tua
export const silencePlayback = (time = Tone.now()) => {
  ignoreBefore = time;
  resetWaitState();
  Tone.Draw.cancel(time);
  if (pianoSampler.loaded) pianoSampler.releaseAll(time);
  Tone.Draw.schedule(() => useWorkspaceStore.getState().resetKeys(), time);
};

export const disposeSheet = () => {
  resetWaitState();
  chords = [];
  if (chordPart) {
    chordPart.dispose();
    chordPart = null;
  }
  if (part) {
    part.dispose();
    part = null;
  }
  if (endEventId !== null) {
    Tone.Transport.clear(endEventId);
    endEventId = null;
  }
  resetPlayback();
};

export const loadSheet = (notes, bpm, sheetChords) => {
  disposeSheet();
  setSongTempo(bpm);

  const store = useWorkspaceStore.getState();
  store.setPlaybackRate(1);
  const songEnd = notes.reduce(
    (max, n) => Math.max(max, n.time + n.duration),
    0,
  );
  store.setDuration(Math.ceil(songEnd));

  // Mỗi nốt tự nhả vì tách bấm và nhả thành hai sự kiện có thể gây kẹt nốt
  part = new Tone.Part(
    (time, n) => {
      if (useWorkspaceStore.getState().currentMode !== "AUTO_PLAY") return;
      if (time < ignoreBefore - TIME_EPSILON) return;
      const duration = n.duration / getPlaybackRate();
      if (pianoSampler.loaded) {
        pianoSampler.triggerAttackRelease(n.name, duration, time, n.velocity);
      }
      Tone.Draw.schedule(
        () => useWorkspaceStore.getState().setPlaybackKey(n.name, n.hand),
        time,
      );
      Tone.Draw.schedule(
        () => useWorkspaceStore.getState().clearPlaybackKey(n.name),
        time + duration,
      );
    },
    notes.map((n) => [`${songTimeToTicks(n.time)}i`, n]),
  ).start(0);

  chords = sheetChords.map((chord) => ({
    ...chord,
    notes: new Map(chord.notes.map(({ name, hand }) => [name, hand])),
  }));
  chordPart = new Tone.Part(
    handleChordReached,
    chords.map((chord) => [`${songTimeToTicks(chord.time)}i`, chord]),
  ).start(0);

  endEventId = Tone.Transport.scheduleOnce(
    () => Tone.Transport.stop(),
    `${songTimeToTicks(songEnd + 0.5)}i`,
  );
};
