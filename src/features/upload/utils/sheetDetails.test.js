import { describe, expect, it } from 'vitest';
import { addTag, cleanText, formatKey, formatTimeSignature, toSlug, validateDetails } from './sheetDetails';
import { MAX_TAGS, TAG_MAX, TITLE_MAX } from '../config/upload';

const VALID = { title: 'Clair de Lune', composer: '', difficulty: 'HARD', tags: [] };

describe('cleanText', () => {
  it('gộp khoảng trắng thừa', () => {
    expect(cleanText('  Lo   fi \n')).toBe('Lo fi');
    expect(cleanText(null)).toBe('');
  });
});

describe('toSlug / formatKey / formatTimeSignature', () => {
  it('tạo id từ tên bài, bỏ dấu tiếng Việt', () => {
    expect(toSlug('  Đêm Lao Xao (Piano)! ')).toBe('dem-lao-xao-piano');
    expect(toSlug('Für Elise')).toBe('fur-elise');
    expect(toSlug('あの夏')).toBe('untitled');
  });

  it('định dạng giọng và nhịp', () => {
    expect(formatKey('d major')).toBe('D major');
    expect(formatKey(null)).toBe('Not set');
    expect(formatTimeSignature([6, 8])).toBe('6/8');
    expect(formatTimeSignature(null)).toBe('Not set');
  });
});

describe('addTag', () => {
  it('thêm tag mới, bỏ qua chuỗi rỗng', () => {
    expect(addTag([], '  Lo  fi ').tags).toEqual(['Lo fi']);
    expect(addTag(['Pop'], '   ').tags).toEqual(['Pop']);
  });

  it('trùng tag có sẵn thì dùng cách viết của tag có sẵn', () => {
    expect(addTag([], 'pop', ['Pop', 'Anime']).tags).toEqual(['Pop']);
  });

  it('từ chối trùng (không phân biệt hoa thường), quá dài, quá số lượng', () => {
    expect(addTag(['Pop'], 'POP').error).toMatch(/already added/);
    expect(addTag([], 'x'.repeat(TAG_MAX + 1)).error).toMatch(/at most/);
    expect(addTag(['a', 'b', 'c'].slice(0, MAX_TAGS), 'd').error).toMatch(/up to/);
  });
});

describe('validateDetails', () => {
  it('hợp lệ khi có title và độ khó, composer tuỳ chọn', () => {
    expect(validateDetails(VALID)).toEqual({});
  });

  it('báo lỗi theo từng ô', () => {
    const errors = validateDetails({ title: '   ', composer: 'x'.repeat(101), difficulty: null, tags: ['a', 'b', 'c', 'd'] });
    expect(Object.keys(errors).sort()).toEqual(['composer', 'difficulty', 'tags', 'title']);
    expect(validateDetails({ ...VALID, title: 'x'.repeat(TITLE_MAX + 1) }).title).toMatch(/at most/);
  });
});
