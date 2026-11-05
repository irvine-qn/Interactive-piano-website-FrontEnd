import { useEffect, useRef } from 'react';

// Phím đang gõ chữ (ô search trên Navbar, form...) thì không phải phím đàn.
// Thanh trượt / checkbox / nút không gõ chữ (range chỉ dùng mũi tên, Home/End, PageUp/Down - không phải phím đàn)
// nên vẫn chơi được: kéo timeline hay âm lượng xong gõ phím đàn ngay, không phải click ra chỗ khác.
const NON_TEXT_INPUTS = ['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'color', 'file'];
const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  const field = target.closest('input, textarea, select, [contenteditable=true]');
  if (!field) return false;
  return !(field instanceof HTMLInputElement && NON_TEXT_INPUTS.includes(field.type));
};

// Chơi đàn bằng bàn phím máy tính, theo cách HomePage đang làm:
// - Tìm nốt theo event.key lúc nhấn, nhưng nhả theo event.code (vị trí phím): nhả Shift trước rồi mới nhả "T"
//   thì event.key đã thành "t", còn event.code vẫn là "KeyT" -> vẫn nhả đúng nốt, không kẹt.
// - Bỏ qua auto-repeat, ô nhập liệu và tổ hợp Ctrl/Cmd/Alt (để Ctrl+S... vẫn là phím tắt của trình duyệt).
// - Cửa sổ mất focus (Alt+Tab, đổi tab) hoặc rời trang thì nhả hết phím đang giữ.
export const useKeyboardInput = ({ noteByKey, pressKey, releaseKey }) => {
  // event.code -> source đang giữ (một phím vật lý giữ đúng một nốt)
  const heldRef = useRef(new Map());
  // Bảng phím đổi (Octave Shift, tải xong cấu hình) không được làm nhả phím đang giữ, nên listener chỉ đăng ký
  // một lần và đọc giá trị mới nhất qua ref; releaseAll chỉ chạy khi mất focus hoặc rời trang.
  const latestRef = useRef({ noteByKey, pressKey, releaseKey });
  useEffect(() => {
    latestRef.current = { noteByKey, pressKey, releaseKey };
  }, [noteByKey, pressKey, releaseKey]);

  useEffect(() => {
    const held = heldRef.current;

    const handleKeyDown = (event) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      if (held.has(event.code)) return;
      const note = latestRef.current.noteByKey[event.key];
      if (!note) return;
      event.preventDefault();
      const source = `keyboard:${event.code}`;
      held.set(event.code, source);
      latestRef.current.pressKey(note, source);
    };

    const handleKeyUp = (event) => {
      const source = held.get(event.code);
      if (!source) return;
      held.delete(event.code);
      latestRef.current.releaseKey(source);
    };

    const releaseAll = () => {
      const { releaseKey: release } = latestRef.current;
      held.forEach((source) => release(source));
      held.clear();
      // Đang giữ chuột trên phím mà cửa sổ mất focus thì mouseup không bao giờ tới
      release('mouse');
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
  }, []);
};
