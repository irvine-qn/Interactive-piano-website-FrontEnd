import * as Tone from 'tone';

// Đồng hồ "thời gian bài nhạc" của Workspace.
// Nốt trong sheet tính bằng giây ở tốc độ gốc (BPM của bài). Ta lên lịch nốt theo ticks của Transport,
// với Transport.bpm = BPM gốc ở tốc độ 1x. Khi đổi tốc độ chỉ cần đổi Transport.bpm: âm thanh, waterfall
// và timeline cùng co giãn, còn "thời gian bài" (giây ở tốc độ gốc) vẫn giữ nguyên ý nghĩa.
// Chỉ Workspace dùng Tone.Transport (HomePage không dùng) nên đổi bpm không ảnh hưởng Home.

const DEFAULT_BPM = 120;
let baseBpm = DEFAULT_BPM;
// Lưu riêng tỉ lệ tốc độ: suy ngược từ Transport.bpm sẽ lệch số thực (0.9999999999999999)
let playbackRate = 1;

// Giây của bài (tốc độ gốc) -> ticks của Transport
export const songTimeToTicks = (seconds) => Math.round(((seconds * baseBpm) / 60) * Tone.Transport.PPQ);

// Nạp bài mới: lưu BPM gốc và đưa tốc độ về 1x
export const setSongTempo = (bpm) => {
  baseBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : DEFAULT_BPM;
  playbackRate = 1;
  Tone.Transport.bpm.value = baseBpm;
};

// Thời gian hiện tại của bài (giây ở tốc độ gốc), dùng chung cho Waterfall và Timeline.
// getTicksAtTime trả về số thực (Transport.ticks thì làm tròn lên) -> nốt rơi mượt.
// Đang phát: đọc ở thời điểm đang phát ra tiếng (context.currentTime). Tone.now() đi trước 0.1s (lookAhead để
// kịp lên lịch âm thanh) nên nếu dùng nó thì nốt chạm vạch sớm hơn lúc phím sáng / có tiếng ~100ms.
// Đang dừng/Pause: đọc ở Tone.now(), vì tua/Restart ghi vị trí mới tại mốc đó (đọc sớm hơn sẽ thấy vị trí cũ).
export const getSongTime = () => {
  const at = Tone.Transport.state === 'started' ? Tone.context.currentTime : Tone.now();
  const ticks = Tone.Transport.getTicksAtTime(at);
  return ((ticks / Tone.Transport.PPQ) * 60) / baseBpm;
};

// Tua tới một thời điểm của bài (giây ở tốc độ gốc).
// Đặt lùi 1 tick (~3ms): nếu tua đúng vào tick của một nốt, Tone tính tick bắt đầu bằng số thực rồi làm tròn lên,
// đôi khi ra tick kế tiếp -> nốt nằm đúng điểm tua (vd A#2 ở 60.000s khi kéo timeline tới 1:00) bị bỏ qua.
export const setSongTime = (seconds) => {
  Tone.Transport.ticks = Math.max(0, songTimeToTicks(Math.max(0, seconds)) - 1);
};

// Tốc độ phát so với bản gốc (1 = 1x). Dùng cho UI chọn tốc độ ở T-08E
export const getPlaybackRate = () => playbackRate;
export const setPlaybackRate = (rate) => {
  playbackRate = rate;
  Tone.Transport.bpm.value = baseBpm * rate;
};
export const getBaseBpm = () => baseBpm;
