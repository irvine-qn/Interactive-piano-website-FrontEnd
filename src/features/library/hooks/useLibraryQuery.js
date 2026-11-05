import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSheets } from '../api/libraryApi';

export const PAGE_SIZE = 8;
export const DEFAULT_SORT = 'popular';
export const SORT_OPTIONS = ['popular', 'likes', 'newest', 'title'];
export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

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

const isDefault = (key, value) =>
  value === '' || value === undefined || value === null ||
  (key === 'sort' && value === DEFAULT_SORT) ||
  (key === 'page' && Number(value) === 1);

export const useLibraryQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = readQuery(searchParams);
  const { q, sort, difficulty, tag, page } = query;

  const [reloadKey, setReloadKey] = useState(0);
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
        if (controller.signal.aborted) return;
        setResult({ key: requestKey, data: null, error });
      });
    return () => controller.abort();
  }, [q, sort, difficulty, tag, page, requestKey]);

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
    sheets: result.data?.data ?? [],
    meta: result.data?.meta ?? null,
    status: isLoading ? 'loading' : result.error ? 'error' : 'success',
    error: isLoading ? null : result.error,
    updateQuery,
    retry,
  };
};
