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
const waitingPresses = new Set();
let endEventId = null;
let ignoreBefore = 0;
const TIME_EPSILON = 1e-6;
const EARLY_PRESS_WINDOW_MS = 400;
const START_POSITION_TOLERANCE_SECONDS = 0.05;
const WAIT_PAUSE_TIME_TOLERANCE = 0.01;
const RESUME_DELAY_SECONDS = 0.001;

const wasPressedRecently = (note) => {
  const pressedAt = recentPresses.get(note);
  return pressedAt !== undefined && performance.now() - pressedAt <= EARLY_PRESS_WINDOW_MS;
};

const requiredNotes = (chord) => chord.notes.filter((note) => note.required);

const isChordComplete = (chord) =>
  requiredNotes(chord).every(({ name }) => wasPressedRecently(name) || waitingPresses.has(name));

const applyChordOctaves = (chord) => {
  if (chord) useWorkspaceStore.getState().setHandOctaves(chord.octaves);
};

const finishChord = (chord) => {
  clearedChordIndex = chord.index;
  waitingPresses.clear();
  const rate = getPlaybackRate();
  chord.notes
    .filter((note) => !note.required && pianoSampler.loaded)
    .forEach(({ name, duration, velocity }) => pianoSampler.triggerAttackRelease(name, duration / rate, Tone.immediate(), velocity));
  applyChordOctaves(chords[chord.index + 1]);
};

const clearWaitingChord = () => {
  if (!waitingChord) return;
  const store = useWorkspaceStore.getState();
  requiredNotes(waitingChord).forEach(({ name }) => store.clearPlaybackKey(name));
  const chord = waitingChord;
  waitingChord = null;
  finishChord(chord);
};

const handleChordReached = (time, chord) => {
  if (useWorkspaceStore.getState().currentMode !== "PRACTICE") return;
  if (time < ignoreBefore - TIME_EPSILON || chord.index === clearedChordIndex) return;
  if (waitingChord?.index === chord.index) return;
  applyChordOctaves(chord);
  if (isChordComplete(chord)) {
    finishChord(chord);
    return;
  }
  waitingChord = chord;
  waitPauseTime = time;
  Tone.Transport.pause(time);
  const store = useWorkspaceStore.getState();
  requiredNotes(chord).forEach(({ name, hand }) => store.setPlaybackKey(name, hand));
};

const startFromFirstChord = async () => {
  if (Tone.context.state !== "running") await Tone.start();
  setSongTime(chords[0].time);
  Tone.Transport.start();
};

export const handleUserNote = (note) => {
  recentPresses.set(note, performance.now());
  const notStarted = Tone.Transport.state !== "started" && getSongTime() < START_POSITION_TOLERANCE_SECONDS;
  if (waitingChord) waitingPresses.add(note);
  if (notStarted && chords[0] && requiredNotes(chords[0]).some(({ name }) => name === note)) {
    startFromFirstChord();
    return;
  }
  if (!waitingChord || !isChordComplete(waitingChord)) return;
  clearWaitingChord();
  if (useWorkspaceStore.getState().isPlaying) {
    Tone.Transport.start(Math.max(Tone.immediate(), waitPauseTime) + RESUME_DELAY_SECONDS);
  }
};

export const alignOctavesToTime = (seconds) => {
  if (useWorkspaceStore.getState().currentMode !== "PRACTICE") return;
  applyChordOctaves(chords.find((chord) => chord.time >= seconds));
};

export const isWaitingForNotes = () => waitingChord !== null;

export const isWaitPause = (time) =>
  waitPauseTime !== null && Math.abs(time - waitPauseTime) <= WAIT_PAUSE_TIME_TOLERANCE;

export const resetWaitState = () => {
  waitingChord = null;
  clearedChordIndex = -1;
  waitPauseTime = null;
  recentPresses.clear();
  waitingPresses.clear();
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

  chords = sheetChords;
  applyChordOctaves(chords[0]);
  chordPart = new Tone.Part(
    handleChordReached,
    chords.map((chord) => [`${songTimeToTicks(chord.time)}i`, chord]),
  ).start(0);

  endEventId = Tone.Transport.scheduleOnce(
    () => Tone.Transport.stop(),
    `${songTimeToTicks(songEnd + 0.5)}i`,
  );
};
