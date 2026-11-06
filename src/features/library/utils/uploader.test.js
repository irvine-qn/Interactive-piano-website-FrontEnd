import { describe, expect, it } from 'vitest';
import { uploaderLabel } from './uploader';

describe('uploaderLabel', () => {
  it('bài mẫu (không có người upload): không hiện', () => {
    expect(uploaderLabel({ uploader: null })).toBeNull();
    expect(uploaderLabel({})).toBeNull();
  });

  it('bài của tôi: "Uploaded by you", của người khác: tên hiển thị', () => {
    expect(uploaderLabel({ uploader: { id: 1, displayName: 'Bình' }, isMine: true })).toBe('Uploaded by you');
    expect(uploaderLabel({ uploader: { id: 2, displayName: 'Quỳnh' }, isMine: false })).toBe('Uploaded by Quỳnh');
  });
});
