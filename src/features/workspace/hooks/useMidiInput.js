import { useEffect } from 'react';
import { KEY_LAYOUT } from '../config/keyLayout';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const STATUS_MASK = 0xf0;
const NOTE_BY_MIDI = new Map(KEY_LAYOUT.map(({ midi, note }) => [midi, note]));

export const useMidiInput = ({ pressKey, releaseKey }) => {
  useEffect(() => {
    let access = null;
    let cancelled = false;

    const handleMessage = ({ data: [status, midi, velocity] }) => {
      const note = NOTE_BY_MIDI.get(midi);
      if (!note) return;
      const type = status & STATUS_MASK;
      const source = `midi:${midi}`;
      if (type === NOTE_ON && velocity > 0) pressKey(note, source);
      else if (type === NOTE_OFF || type === NOTE_ON) releaseKey(source);
    };

    const connectInputs = () => {
      access?.inputs.forEach((input) => {
        input.onmidimessage = handleMessage;
      });
    };

    const requestAccess = () => {
      removeGestureListeners();
      if (cancelled || access) return;
      navigator.requestMIDIAccess?.({ sysex: false })
        .then((midiAccess) => {
          if (cancelled) return;
          access = midiAccess;
          access.onstatechange = connectInputs;
          connectInputs();
        })
        .catch(() => {});
    };

    // Chi xin quyen MIDI khi da duoc cap san, hoac sau thao tac dau tien cua nguoi dung.
    // Tranh popup xin quyen luc tai trang va giu duoc back/forward cache.
    const GESTURES = ['pointerdown', 'keydown'];
    const removeGestureListeners = () => GESTURES.forEach((type) => window.removeEventListener(type, requestAccess));
    if (navigator.requestMIDIAccess) {
      GESTURES.forEach((type) => window.addEventListener(type, requestAccess, { once: true }));
      navigator.permissions?.query({ name: 'midi' })
        .then((status) => { if (status.state === 'granted') requestAccess(); })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      removeGestureListeners();
      if (!access) return;
      access.onstatechange = null;
      access.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [pressKey, releaseKey]);
};
