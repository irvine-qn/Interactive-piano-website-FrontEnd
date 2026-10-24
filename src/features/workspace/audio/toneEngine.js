import * as Tone from 'tone';

// Đặt Limiter ở ngưỡng an toàn để cắt peak đột ngột, không nén gắt làm vỡ tiếng
const masterLimiter = new Tone.Limiter(-2).toDestination();

// Hạ Master Volume để chừa headroom khi nhiều nốt chồng lên nhau (chống hard clipping)
Tone.Destination.volume.value = -5;

// Khởi tạo một Sampler. 
// Thay vì phải tải toàn bộ 88 file mp3, chúng ta chỉ cần tải một số nốt chuẩn (C, D#, F#, A).
// Tone.js sẽ tự động nội suy (pitch-shift) để tạo ra các nốt còn lại, giúp web load cực nhanh!
export const pianoSampler = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3"
  },
  // Sử dụng bộ âm thanh Salamander Grand Piano mã nguồn mở được host sẵn trên server của Tone.js
  // (Sau này chúng ta có thể tải về host trên S3 của mình sau)
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  release: 0.5,
  volume: -5,
  onload: () => {
    console.log("Fiano Audio Engine: Piano samples loaded!");
  }
}).connect(masterLimiter);

// Hàm phát nốt
export const playNote = async (note) => {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  if (pianoSampler.loaded) {
    pianoSampler.triggerAttack(note);
  }
};

export const stopNote = (note) => {
  if (pianoSampler.loaded) {
    pianoSampler.triggerRelease(note);
  }
};

// Hàm ngắt toàn bộ âm thanh (BẮT BUỘC GỌI HÀM NÀY KHI TUA)
export const stopAllNotes = () => {
  if (pianoSampler.loaded) {
    pianoSampler.releaseAll();
  }
};

// Dừng Transport, quay về đầu bài và tắt toàn bộ âm đang ngân
export const resetPlayback = () => {
  Tone.Transport.stop();
  stopAllNotes();
};
