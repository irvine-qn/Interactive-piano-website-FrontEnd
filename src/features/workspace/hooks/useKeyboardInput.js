import { useEffect, useRef } from 'react';
import { KEY_LAYOUT, KEY_LAYOUT_BY_NOTE } from '../config/keyLayout';

const NON_TEXT_INPUTS = ['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'color', 'file'];
const SINGLE_NOTE = [0];
const ZONE_ARROWS = {
  ArrowLeft: ['left', -1],
  ArrowRight: ['left', 1],
  ArrowDown: ['right', -1],
  ArrowUp: ['right', 1],
};
const NOTE_BY_MIDI = new Map(KEY_LAYOUT.map(({ midi, note }) => [midi, note]));

const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  const field = target.closest('input, textarea, select, [contenteditable=true]');
  if (!field) return false;
  return !(field instanceof HTMLInputElement && NON_TEXT_INPUTS.includes(field.type));
};

const isArrowControl = (target) => target instanceof HTMLElement && Boolean(target.closest('input, select'));

export const useKeyboardInput = ({ noteByCode, handByCode, chordKeys, pressKey, releaseKey, moveZone }) => {
  const heldRef = useRef(new Map());
  const heldChordsRef = useRef(new Map());
  const latestRef = useRef({ noteByCode, handByCode, chordKeys, pressKey, releaseKey, moveZone });
  useEffect(() => {
    latestRef.current = { noteByCode, handByCode, chordKeys, pressKey, releaseKey, moveZone };
  }, [noteByCode, handByCode, chordKeys, pressKey, releaseKey, moveZone]);

  useEffect(() => {
    const held = heldRef.current;
    const heldChords = heldChordsRef.current;

    const findChordKey = (code) => {
      const { chordKeys: keys } = latestRef.current;
      if (!keys) return null;
      for (const hand of ['left', 'right']) {
        const chord = keys[hand].find((item) => item.code === code);
        if (chord) return { hand, intervals: chord.intervals };
      }
      return null;
    };

    const pressIntervals = (code, item, intervals) => {
      intervals.forEach((interval) => {
        const source = `keyboard:${code}:${interval}`;
        const note = NOTE_BY_MIDI.get(item.rootMidi + interval);
        if (!note || item.sources.has(source)) return;
        item.sources.add(source);
        latestRef.current.pressKey(note, source);
      });
    };

    const handleKeyDown = (event) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;

      const arrow = ZONE_ARROWS[event.code];
      if (arrow) {
        if (isArrowControl(event.target)) return;
        event.preventDefault();
        latestRef.current.moveZone(...arrow);
        return;
      }

      const chordKey = findChordKey(event.code);
      if (chordKey) {
        event.preventDefault();
        heldChords.set(event.code, chordKey);
        held.forEach((item, code) => {
          if (latestRef.current.handByCode[code] === chordKey.hand) pressIntervals(code, item, chordKey.intervals);
        });
        return;
      }

      if (held.has(event.code)) return;
      const note = latestRef.current.noteByCode[event.code];
      if (!note) return;
      event.preventDefault();

      const hand = latestRef.current.handByCode[event.code];
      const activeChord = [...heldChords.values()].find((item) => item.hand === hand);
      const item = { rootMidi: KEY_LAYOUT_BY_NOTE.get(note).midi, sources: new Set() };
      pressIntervals(event.code, item, activeChord?.intervals ?? SINGLE_NOTE);
      held.set(event.code, item);
    };

    const handleKeyUp = (event) => {
      heldChords.delete(event.code);
      const item = held.get(event.code);
      if (!item) return;
      held.delete(event.code);
      item.sources.forEach((source) => latestRef.current.releaseKey(source));
    };

    const releaseAll = () => {
      const { releaseKey: release } = latestRef.current;
      held.forEach(({ sources }) => sources.forEach((source) => release(source)));
      held.clear();
      heldChords.clear();
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
