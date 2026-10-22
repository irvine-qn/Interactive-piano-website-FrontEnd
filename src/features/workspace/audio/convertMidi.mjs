// chạy lệnh: node src/features/workspace/audio/convertMidi.mjs 

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@tonejs/midi';
const { Midi } = pkg;

// 1. Lấy thư mục hiện tại của file script này (chống lỗi đường dẫn khi chạy node từ root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Thiết lập đường dẫn đọc/ghi file ngay tại thư mục audio này
const midiFilePath = path.join(__dirname, 'MerryChristmasMr.Lawrence.mid');
const jsonOutputPath = path.join(__dirname, 'merry-christmas.json');

// 3. Đọc và Parse file MIDI
const midiData = fs.readFileSync(midiFilePath);
const midi = new Midi(midiData);

// 4. Tạo cấu trúc JSON
const fianoSheet = {
  metadata: {
    title: "Merry Christmas Mr. Lawrence",
    bpm: midi.header.tempos.length > 0 ? Math.round(midi.header.tempos[0].bpm) : 120,
    timeSignature: midi.header.timeSignatures.length > 0 ? midi.header.timeSignatures[0].timeSignature : [4, 4]
  },
  notes: []
};

// 5. Trích xuất nốt nhạc
midi.tracks.forEach((track, index) => {
  const hand = index === 0 ? 'right' : 'left'; // Track 0 thường là tay phải

  track.notes.forEach(note => {
    fianoSheet.notes.push({
      name: note.name,
      time: note.time,
      duration: note.duration,
      hand: hand,
      velocity: note.velocity
    });
  });
});

// 6. Sắp xếp theo trình tự thời gian
fianoSheet.notes.sort((a, b) => a.time - b.time);

// 7. Lưu file JSON
fs.writeFileSync(jsonOutputPath, JSON.stringify(fianoSheet, null, 2));

console.log('✅ Chuyển đổi thành công!');
console.log(`📂 Đã lưu tại: ${jsonOutputPath}`);
console.log(`🎵 Tổng số nốt nhạc: ${fianoSheet.notes.length}`);