import * as Tone from "tone";
import { pianoSampler, resetPlayback } from "../../piano/audio/toneEngine";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { getPlaybackRate, setSongTempo, songTimeToTicks } from "./songClock";

let part = null;
let endEventId = null;
// Sự kiện của Part có thời điểm trước mốc này là "tồn đọng" của lần phát trước (xem silencePlayback) -> bỏ qua
let ignoreBefore = 0;
const TIME_EPSILON = 1e-6; // giây, nhỏ hơn nhiều so với 1 tick (~3ms) nhưng lớn hơn nhiều sai số số thực

// Dừng / Pause / tua / Restart có hiệu lực tại `time` (Tone đặt mốc này đi trước ~0.1s so với lúc đang phát ra tiếng).
// Tone xử lý sự kiện của Part theo từng nhịp (~50ms) nên sau lệnh dừng vẫn còn vài sự kiện trước `time` chưa chạy
// (của vị trí cũ): bỏ qua chúng, nhả các nốt đang ngân tại `time` và xoá phím sáng đúng lúc dừng.
// Nốt của vị trí mới (sau khi tua / phát tiếp) luôn có thời điểm từ `time` trở đi nên không bị ảnh hưởng.
export const silencePlayback = (time = Tone.now()) => {
  ignoreBefore = time;
  Tone.Draw.cancel(time); // huỷ các lệnh bật/tắt phím từ lúc dừng trở đi (resetKeys bên dưới tắt hết)
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

// ở các chế độ khác Transport vẫn chạy để Waterfall có đồng hồ chung.
// bpm: BPM gốc của bài. Nốt được lên lịch theo ticks (không phải giây) để đổi Transport.bpm thì cả bài co giãn
export const loadSheet = (notes, bpm) => {
  disposeSheet();
  setSongTempo(bpm);

  const store = useWorkspaceStore.getState();
  const songEnd = notes.reduce(
    (max, n) => Math.max(max, n.time + n.duration),
    0,
  );
  store.setDuration(Math.ceil(songEnd));

  // Mỗi nốt là 1 sự kiện (theo ticks) tự nhả sau đúng độ dài (triggerAttackRelease). Không tách thành 2 sự kiện
  // bấm/nhả: Tone đôi khi bỏ sót hoặc chạy lặp 1 tick ở ranh giới giữa 2 nhịp xử lý (sai số số thực), mất lệnh nhả là
  // kẹt nốt; còn nốt tự nhả thì luôn tắt.
  // Giới hạn: độ dài được quy ra giây thật lúc nốt bắt đầu, nên nếu đổi tốc độ đúng lúc một nốt đang ngân thì nốt đó
  // vẫn ngân theo tốc độ cũ (các nốt sau thì đúng tốc độ mới).
  part = new Tone.Part(
    (time, n) => {
      if (useWorkspaceStore.getState().currentMode !== "AUTO_PLAY") return;
      // Sự kiện tồn đọng của vị trí cũ (đã dừng / tua). Chừa sai số số thực để không bỏ nhầm nốt nằm đúng mốc dừng
      if (time < ignoreBefore - TIME_EPSILON) return;
      // Độ dài nốt tính bằng giây thật: chơi chậm (0.5x) thì nốt ngân dài gấp đôi
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
    // "<ticks>i" = thời điểm tính bằng ticks của Transport
    notes.map((n) => [`${songTimeToTicks(n.time)}i`, n]),
  ).start(0);

  // Hết bài thì tự dừng và quay về 0:00
  endEventId = Tone.Transport.scheduleOnce(
    () => Tone.Transport.stop(),
    `${songTimeToTicks(songEnd + 0.5)}i`,
  );
};
