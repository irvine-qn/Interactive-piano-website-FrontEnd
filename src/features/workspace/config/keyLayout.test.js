import { describe, expect, it } from 'vitest';
import { KEY_LAYOUT, KEY_LAYOUT_BY_NOTE } from './keyLayout';

describe('KEY_LAYOUT', () => {
  it('có đủ 88 phím từ A0 đến C8', () => {
    expect(KEY_LAYOUT).toHaveLength(88);
    expect(KEY_LAYOUT[0].note).toBe('A0');
    expect(KEY_LAYOUT[87].note).toBe('C8');
    expect(KEY_LAYOUT.filter((key) => !key.isBlack)).toHaveLength(52);
  });

  it('tra được số MIDI theo tên nốt', () => {
    expect(KEY_LAYOUT_BY_NOTE.get('C4').midi).toBe(60);
    expect(KEY_LAYOUT_BY_NOTE.get('C#4').isBlack).toBe(true);
  });

  it('phím trắng phủ hết chiều ngang', () => {
    const last = KEY_LAYOUT[87];
    expect(last.left + last.width).toBeCloseTo(100);
  });
});
