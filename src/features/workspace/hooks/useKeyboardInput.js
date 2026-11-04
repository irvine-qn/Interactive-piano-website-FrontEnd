import { useEffect, useRef } from 'react';

// Phím đang gõ chữ (ô search trên Navbar, form...) thì không phải phím đàn
const isTypingTarget = (target) =>
  target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable=true]');

// Chơi đàn bằng bàn phím máy tính, theo cách HomePage đang làm:
// - Tìm nốt theo event.key lúc nhấn, nhưng nhả theo event.code (vị trí phím): nhả Shift trước rồi mới nhả "T"
//   thì event.key đã thành "t", còn event.code vẫn là "KeyT" -> vẫn nhả đúng nốt, không kẹt.
// - Bỏ qua auto-repeat, ô nhập liệu và tổ hợp Ctrl/Cmd/Alt (để Ctrl+S... vẫn là phím tắt của trình duyệt).
// - Cửa sổ mất focus (Alt+Tab, đổi tab) hoặc rời trang thì nhả hết phím đang giữ.
export const useKeyboardInput = ({ noteByKey, pressKey, releaseKey }) => {
  // event.code -> source đang giữ (một phím vật lý giữ đúng một nốt)
  const heldRef = useRef(new Map());

  useEffect(() => {
    const held = heldRef.current;

    const handleKeyDown = (event) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      if (held.has(event.code)) return;
      const note = noteByKey[event.key];
      if (!note) return;
      event.preventDefault();
      const source = `keyboard:${event.code}`;
      held.set(event.code, source);
      pressKey(note, source);
    };

    const handleKeyUp = (event) => {
      const source = held.get(event.code);
      if (!source) return;
      held.delete(event.code);
      releaseKey(source);
    };

    const releaseAll = () => {
      held.forEach((source) => releaseKey(source));
      held.clear();
      // Đang giữ chuột trên phím mà cửa sổ mất focus thì mouseup không bao giờ tới
      releaseKey('mouse');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', releaseAll);
      releaseAll();
    };
  }, [noteByKey, pressKey, releaseKey]);
};
