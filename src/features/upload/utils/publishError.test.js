import { describe, expect, it } from 'vitest';
import { publishErrorTarget } from './publishError';

describe('publishErrorTarget', () => {
  it('lỗi ô của thẻ ③ hiện dưới đúng ô', () => {
    expect(publishErrorTarget({ code: 'VALIDATION_FAILED', details: { field: 'title' } })).toEqual({ card: 'details', field: 'title' });
    expect(publishErrorTarget({ code: 'VALIDATION_FAILED', details: { field: 'tags' } })).toEqual({ card: 'details', field: 'tags' });
  });

  it('lỗi file ở thẻ ①, lỗi track ở thẻ ②', () => {
    expect(publishErrorTarget({ code: 'INVALID_MIDI' }).card).toBe('file');
    expect(publishErrorTarget({ code: 'FILE_TOO_LARGE' }).card).toBe('file');
    expect(publishErrorTarget({ code: 'NO_NOTES' }).card).toBe('tracks');
  });

  it('còn lại hiện chung dưới nút Publish', () => {
    expect(publishErrorTarget({ code: 'VALIDATION_FAILED', details: { field: 'visibility' } }).card).toBe('page');
    expect(publishErrorTarget({ code: 'VALIDATION_FAILED' }).card).toBe('page');
    expect(publishErrorTarget({ code: 'NETWORK_ERROR' }).card).toBe('page');
    expect(publishErrorTarget({ code: 'SHEET_ID_TAKEN' }).card).toBe('page');
  });
});
