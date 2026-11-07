import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../lib/axios';
import { UPLOAD_TIMEOUT_MS } from '../config/upload';
import {
  CANCELED,
  analyzeMidi,
  buildUploadForm,
  createSheet,
  deleteSheet,
  getMySheets,
  getUserSheets,
  updateSheet,
} from './uploadApi';

vi.mock('../../../lib/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const midiFile = () => new File([new Uint8Array([77, 84, 104, 100])], 'Bài ca.mid', { type: 'audio/midi' });
// FormData -> [[tên trường, giá trị]] (file thành tên file) để so sánh dễ
const entries = (form) => [...form.entries()].map(([key, value]) => [key, value instanceof File ? value.name : value]);

beforeEach(() => {
  vi.clearAllMocks();
  ['get', 'post', 'patch', 'delete'].forEach((method) => apiClient[method].mockResolvedValue({ data: { ok: method } }));
});

describe('buildUploadForm', () => {
  it('file + trường chữ, mảng thành nhiều trường cùng tên, bỏ giá trị rỗng', () => {
    const form = buildUploadForm(midiFile(), { title: 'Bài ca', tags: ['Pop', 'Anime'], tracks: [0, 2], composer: '', coverColor: null });
    expect(entries(form)).toEqual([
      ['file', 'Bài ca.mid'],
      ['title', 'Bài ca'],
      ['tags', 'Pop'],
      ['tags', 'Anime'],
      ['tracks', '0'],
      ['tracks', '2'],
    ]);
  });
});

describe('analyzeMidi', () => {
  it('gửi file (và track đang chọn) với timeout riêng cho upload', async () => {
    const signal = new AbortController().signal;
    await expect(analyzeMidi(midiFile(), { tracks: [0, 1], signal })).resolves.toEqual({ ok: 'post' });
    const [url, form, config] = apiClient.post.mock.calls[0];
    expect(url).toBe('/uploads/midi/analyze');
    expect(entries(form)).toEqual([['file', 'Bài ca.mid'], ['tracks', '0'], ['tracks', '1']]);
    expect(config).toMatchObject({ signal, timeout: UPLOAD_TIMEOUT_MS });
  });

  it('không chọn track thì không gửi trường tracks (BE dùng track gợi ý)', async () => {
    await analyzeMidi(midiFile());
    expect(entries(apiClient.post.mock.calls[0][1])).toEqual([['file', 'Bài ca.mid']]);
  });

  it('lỗi chuẩn hoá từ lib/axios được trả nguyên cho nơi gọi', async () => {
    const error = { status: 415, code: 'UNSUPPORTED_FILE', message: 'Only MIDI files (.mid, .midi) can be uploaded.' };
    apiClient.post.mockRejectedValueOnce(error);
    await expect(analyzeMidi(midiFile())).rejects.toBe(error);
  });

  it('request bị huỷ trả mã CANCELED thay vì NETWORK_ERROR của lib/axios', async () => {
    const controller = new AbortController();
    apiClient.post.mockImplementationOnce(() => {
      controller.abort();
      return Promise.reject({ status: null, code: 'NETWORK_ERROR', message: 'Unable to connect to the server' });
    });
    await expect(analyzeMidi(midiFile(), { signal: controller.signal })).rejects.toMatchObject({ code: CANCELED });
    // Không huỷ mà mất mạng thật thì vẫn là NETWORK_ERROR
    apiClient.post.mockRejectedValueOnce({ status: null, code: 'NETWORK_ERROR', message: 'Unable to connect to the server' });
    await expect(analyzeMidi(midiFile(), { signal: new AbortController().signal })).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});

describe('các API quản lý bài', () => {
  it('createSheet gửi file và thông tin bài lên POST /sheets', async () => {
    await createSheet(midiFile(), { title: 'Bài ca', difficulty: 'EASY', visibility: 'PRIVATE', tracks: [0] });
    const [url, form, config] = apiClient.post.mock.calls[0];
    expect(url).toBe('/sheets');
    expect(entries(form)).toEqual([['file', 'Bài ca.mid'], ['title', 'Bài ca'], ['difficulty', 'EASY'], ['visibility', 'PRIVATE'], ['tracks', '0']]);
    expect(config.timeout).toBe(UPLOAD_TIMEOUT_MS);
  });

  it('danh sách bài của tôi / của người khác, bỏ tham số rỗng', async () => {
    await getMySheets({ page: 2, pageSize: '' });
    expect(apiClient.get).toHaveBeenLastCalledWith('/users/me/sheets', { params: { page: 2 }, signal: undefined });
    await getUserSheets(7, { page: 1 });
    expect(apiClient.get).toHaveBeenLastCalledWith('/users/7/sheets', { params: { page: 1 }, signal: undefined });
  });

  it('sửa và xoá bài, id được mã hoá trong URL', async () => {
    await updateSheet('bai ca/1', { visibility: 'PUBLIC' });
    expect(apiClient.patch).toHaveBeenCalledWith('/sheets/bai%20ca%2F1', { visibility: 'PUBLIC' });
    await expect(deleteSheet('bai-ca')).resolves.toEqual({ ok: 'delete' });
    expect(apiClient.delete).toHaveBeenCalledWith('/sheets/bai-ca');
  });
});
