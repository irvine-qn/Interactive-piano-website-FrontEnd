import * as Tone from "tone";
import { pianoSampler, resetPlayback } from "../../piano/audio/toneEngine";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { getPlaybackRate, setSongTempo, songTimeToTicks } from "./songClock";

let part = null;
let endEventId = null;
let ignoreBefore = 0;
const TIME_EPSILON = 1e-6;

// Bỏ qua sự kiện tồn đọng của vị trí cũ sau khi dừng hoặc tua
export const silencePlayback = (time = Tone.now()) => {
  ignoreBefore = time;
  Tone.Draw.cancel(time);
  if (pianoSampler.loaded) pianoSampler.releaseAll(time);
  Tone.Draw.schedule(() => useWorkspaceStore.getState().resetKeys(), time);
};

export const disposeSheet = () => {
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

export const loadSheet = (notes, bpm) => {
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

  endEventId = Tone.Transport.scheduleOnce(
    () => Tone.Transport.stop(),
    `${songTimeToTicks(songEnd + 0.5)}i`,
  );
};
