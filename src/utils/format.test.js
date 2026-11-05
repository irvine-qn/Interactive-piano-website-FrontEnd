import { describe, expect, it } from 'vitest';
import { formatCount, formatDuration } from './format';

describe('formatCount', () => {
  it('rút gọn số lớn', () => {
    expect(formatCount(950)).toBe('950');
    expect(formatCount(45200)).toBe('45.2K');
    expect(formatCount(undefined)).toBe('0');
  });
});

describe('formatDuration', () => {
  it('định dạng thời lượng', () => {
    expect(formatDuration(225)).toBe('03:45');
    expect(formatDuration(3725)).toBe('1:02:05');
    expect(formatDuration(undefined)).toBe('00:00');
  });
});
