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

// Lọc ra các track thực sự có chứa nốt nhạc để xử lý
const tracksWithNotes = midi.tracks.filter(track => track.notes.length > 0);
const isSingleTrack = tracksWithNotes.length === 1;

// Sử dụng Set để lưu vết và khử trùng lặp (Deduplication)
const seenNotes = new Set();

// 5. Trích xuất nốt nhạc
tracksWithNotes.forEach((track, index) => {
  track.notes.forEach(note => {
    // Thuật toán 1: Phân loại tay đàn (Hand Routing)
    let hand = 'right';
    if (isSingleTrack) {
      // Nếu file bị gộp thành 1 track, tự động chia tay dựa trên cao độ (C4 là MIDI 60)
      hand = note.midi >= 60 ? 'right' : 'left';
    } else {
      // Nếu file có nhiều track chuẩn, giả định track 0 là tay phải, track 1 là tay trái
      hand = index === 0 ? 'right' : 'left';
    }

    // Thuật toán 2: Khử trùng lặp nốt đè lên nhau
    // Làm tròn thời gian đến 3 chữ số thập phân (mili-giây) để tránh sai số float
    const timeKey = note.time.toFixed(3);
    const noteKey = `${note.name}-${timeKey}`;

    if (!seenNotes.has(noteKey)) {
      seenNotes.add(noteKey);
      fianoSheet.notes.push({
        name: note.name,
        time: note.time,
        duration: note.duration,
        hand: hand,
        velocity: note.velocity
      });
    }
  });
});

// 6. Sắp xếp theo trình tự thời gian
fianoSheet.notes.sort((a, b) => a.time - b.time);

// 7. Lưu file JSON
fs.writeFileSync(jsonOutputPath, JSON.stringify(fianoSheet, null, 2));

console.log('✅ Chuyển đổi thành công!');
console.log(`📂 Đã lưu tại: ${jsonOutputPath}`);
console.log(`🎵 Tổng số nốt nhạc: ${fianoSheet.notes.length}`);