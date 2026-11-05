import * as Tone from 'tone';


const DEFAULT_BPM = 120;
let baseBpm = DEFAULT_BPM;
// Lưu riêng tỉ lệ tốc độ vì suy ngược từ bpm sẽ lệch số thực
let playbackRate = 1;

export const songTimeToTicks = (seconds) => Math.round(((seconds * baseBpm) / 60) * Tone.Transport.PPQ);

export const setSongTempo = (bpm) => {
  baseBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : DEFAULT_BPM;
  playbackRate = 1;
  Tone.Transport.bpm.value = baseBpm;
};

// Khi đang phát phải đọc theo currentTime vì Tone now đi trước tiếng thật
export const getSongTime = () => {
  const at = Tone.Transport.state === 'started' ? Tone.context.currentTime : Tone.now();
  const ticks = Tone.Transport.getTicksAtTime(at);
  return ((ticks / Tone.Transport.PPQ) * 60) / baseBpm;
};

// Lùi một tick để không mất nốt nằm đúng điểm tua
export const setSongTime = (seconds) => {
  Tone.Transport.ticks = Math.max(0, songTimeToTicks(Math.max(0, seconds)) - 1);
};

export const getPlaybackRate = () => playbackRate;
export const setPlaybackRate = (rate) => {
  playbackRate = rate;
  Tone.Transport.bpm.value = baseBpm * rate;
};
export const getBaseBpm = () => baseBpm;
