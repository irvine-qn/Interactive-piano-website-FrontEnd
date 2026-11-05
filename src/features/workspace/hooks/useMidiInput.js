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

    navigator.requestMIDIAccess?.()
      .then((midiAccess) => {
        if (cancelled) return;
        access = midiAccess;
        access.onstatechange = connectInputs;
        connectInputs();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (!access) return;
      access.onstatechange = null;
      access.inputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [pressKey, releaseKey]);
};
