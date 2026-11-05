import { useEffect, useRef } from 'react';

const NON_TEXT_INPUTS = ['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'color', 'file'];
const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  const field = target.closest('input, textarea, select, [contenteditable=true]');
  if (!field) return false;
  return !(field instanceof HTMLInputElement && NON_TEXT_INPUTS.includes(field.type));
};

// Nhả phím theo event code để nhả Shift trước vẫn không kẹt nốt
export const useKeyboardInput = ({ noteByKey, pressKey, releaseKey }) => {
  const heldRef = useRef(new Map());
  // Listener chỉ đăng ký một lần để đổi bảng phím không làm nhả phím đang giữ
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
