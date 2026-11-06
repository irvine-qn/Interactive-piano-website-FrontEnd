import { describe, expect, it } from 'vitest';
import { validateMidiFile } from './midiFile';
import { MAX_MIDI_BYTES } from '../config/upload';
import { formatFileSize } from '../../../utils/format';

const fileOf = (name, size) => ({ name, size });

describe('validateMidiFile', () => {
  it('nhận .mid / .midi (không phân biệt hoa thường), tối đa 1 MB', () => {
    expect(validateMidiFile(fileOf('song.mid', 2048))).toBeNull();
    expect(validateMidiFile(fileOf('Bài ca.MIDI', MAX_MIDI_BYTES))).toBeNull();
  });

  it('từ chối sai đuôi, file rỗng, quá 1 MB, không có file', () => {
    expect(validateMidiFile(fileOf('song.mp3', 10)).code).toBe('UNSUPPORTED_FILE');
    expect(validateMidiFile(fileOf('song.mid.txt', 10)).code).toBe('UNSUPPORTED_FILE');
    expect(validateMidiFile(fileOf('song.mid', 0))).toMatchObject({ code: 'UNSUPPORTED_FILE', message: 'This file is empty.' });
    expect(validateMidiFile(fileOf('song.mid', MAX_MIDI_BYTES + 1)).code).toBe('FILE_TOO_LARGE');
    expect(validateMidiFile(null).code).toBe('FILE_REQUIRED');
  });
});

describe('formatFileSize', () => {
  it('B, KB, MB', () => {
    expect(formatFileSize(820)).toBe('820 B');
    expect(formatFileSize(48 * 1024)).toBe('48 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1.25 * 1024 * 1024)).toBe('1.3 MB');
    expect(formatFileSize(undefined)).toBe('0 B');
  });
});
