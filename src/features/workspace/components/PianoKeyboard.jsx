import React, { useEffect } from 'react';
import Key from './Key';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { KEYBOARD_TO_NOTE_MAP } from '../config/keyMapping';

const NOTES_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Sinh ra mốc 88 phím chuẩn
const generate88Keys = () => {
  const keys = [];
  keys.push({ note: 'A0', isBlack: false }, { note: 'A#0', isBlack: true }, { note: 'B0', isBlack: false });
  for (let octave = 1; octave <= 7; octave++) {
    NOTES_IN_OCTAVE.forEach(note => {
      keys.push({ note: `${note}${octave}`, isBlack: note.includes('#') });
    });
  }
  keys.push({ note: 'C8', isBlack: false });
  return keys;
};

const PIANO_KEYS_88 = generate88Keys();

// Lọc ra 61 phím (từ C2 đến C7) cho chế độ chơi tay
const PIANO_KEYS_61 = PIANO_KEYS_88.filter(keyObj => {
  const octave = parseInt(keyObj.note.slice(-1));
  // Lấy trọn vẹn các quãng 2, 3, 4, 5, 6
  if (octave >= 2 && octave <= 6) return true;
  // Lấy thêm nốt C7 làm nốt chốt cuối cùng
  if (keyObj.note === 'C7') return true;
  return false;
});

const PianoKeyboard = () => {
  const { activeKeys, pressKey, releaseKey, currentMode } = useWorkspaceStore();

  // Quyết định dùng mảng nào dựa trên Mode hiện tại
  const displayedKeys = currentMode === 'AUTO_PLAY' ? PIANO_KEYS_88 : PIANO_KEYS_61;

  // --- LẮNG NGHE BÀN PHÍM ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bỏ qua nếu người dùng đang nhấn các phím Ctrl/Cmd/Alt (để dùng phím tắt trình duyệt)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const note = KEYBOARD_TO_NOTE_MAP[e.key];
      if (note && !e.repeat) { // e.repeat = true khi giữ đè phím, ta bỏ qua để không phát tiếng liên tục
        pressKey(note);
      }
    };

    const handleKeyUp = (e) => {
      const note = KEYBOARD_TO_NOTE_MAP[e.key];
      if (note) {
        releaseKey(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressKey, releaseKey]); // Chạy một lần khi component mount

  return (
    // Dùng justify-start để đảm bảo thanh cuộn không bị ăn mất phím bên trái khi thu nhỏ màn hình
    <div className="flex justify-start items-start overflow-x-auto w-full p-4 bg-gray-900 rounded-lg shadow-2xl">
      <div className="flex relative mx-auto">
        {displayedKeys.map((keyObj) => (
          <Key
            key={keyObj.note}
            note={keyObj.note}
            isBlack={keyObj.isBlack}
            isActive={activeKeys.includes(keyObj.note)}
            onMouseDown={pressKey}
            onMouseUp={releaseKey}
          />
        ))}
      </div>
    </div>
  );
};

export default PianoKeyboard;