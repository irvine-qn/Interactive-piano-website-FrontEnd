import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSheets } from '../api/libraryApi';

export const PAGE_SIZE = 8;
export const DEFAULT_SORT = 'popular';
export const SORT_OPTIONS = ['popular', 'likes', 'newest', 'title'];
export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

// Đọc bộ lọc từ URL. Giá trị sai (vd. ?sort=abc, ?page=-1) thì dùng mặc định thay vì để BE trả 422.
const readQuery = (searchParams) => {
  const sort = searchParams.get('sort');
  const difficulty = searchParams.get('difficulty');
  const page = Number(searchParams.get('page'));
  return {
    q: searchParams.get('q') ?? '',
    sort: SORT_OPTIONS.includes(sort) ? sort : DEFAULT_SORT,
    difficulty: DIFFICULTIES.includes(difficulty) ? difficulty : '',
    tag: searchParams.get('tag') ?? '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
};

// Giá trị mặc định không ghi lên URL để link gọn (/library thay vì /library?sort=popular&page=1)
const isDefault = (key, value) =>
  value === '' || value === undefined || value === null ||
  (key === 'sort' && value === DEFAULT_SORT) ||
  (key === 'page' && Number(value) === 1);

// URL là nguồn sự thật của bộ lọc: F5 hoặc chia sẻ link vẫn giữ nguyên kết quả.
export const useLibraryQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = readQuery(searchParams);
  const { q, sort, difficulty, tag, page } = query;

  const [reloadKey, setReloadKey] = useState(0);
  // Kết quả của request gần nhất, gắn với khoá của request đó
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const requestKey = JSON.stringify([q, sort, difficulty, tag, page, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    getSheets(
      { q: q.trim(), sort, difficulty, tag, page, pageSize: PAGE_SIZE },
      { signal: controller.signal },
    )
      .then((data) => setResult({ key: requestKey, data, error: null }))
      .catch((error) => {
        // Request bị huỷ (đổi bộ lọc / rời trang) cũng ra NETWORK_ERROR, không coi là lỗi
        if (controller.signal.aborted) return;
        setResult({ key: requestKey, data: null, error });
      });
    return () => controller.abort();
  }, [q, sort, difficulty, tag, page, requestKey]);

  // Đổi bộ lọc thì về trang 1, trừ khi chính `page` được đổi.
  // replace: true cho ô tìm kiếm để mỗi lần gõ không tạo thêm một mục lịch sử trình duyệt.
  const updateQuery = useCallback(
    (patch, { replace = false } = {}) => {
      setSearchParams(
        (current) => {
          const next = { ...readQuery(current), page: 1, ...patch };
          const params = new URLSearchParams();
          Object.entries(next).forEach(([key, value]) => {
            if (!isDefault(key, value)) params.set(key, String(value));
          });
          return params;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const retry = useCallback(() => setReloadKey((k) => k + 1), [setReloadKey]);

  const isLoading = result.key !== requestKey;
  return {
    query,
    // Giữ dữ liệu cũ trong lúc tải trang/bộ lọc mới để lưới không bị nháy trắng
    sheets: result.data?.data ?? [],
    meta: result.data?.meta ?? null,
    status: isLoading ? 'loading' : result.error ? 'error' : 'success',
    error: isLoading ? null : result.error,
    updateQuery,
    retry,
  };
};
