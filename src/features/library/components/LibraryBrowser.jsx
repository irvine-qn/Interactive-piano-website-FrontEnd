import { useCallback, useEffect } from 'react';
import { PAGE_SIZE, useLibraryQuery } from '../hooks/useLibraryQuery';
import { useTags } from '../hooks/useTags';
import LibraryFilters from './LibraryFilters';
import LibraryToolbar from './LibraryToolbar';
import Pagination from './Pagination';
import SheetGrid from './SheetGrid';

// Khối chính của trang Library: nối dữ liệu từ useLibraryQuery vào toolbar, lưới và phân trang
const LibraryBrowser = () => {
  const { query, sheets, meta, status, error, updateQuery, retry } = useLibraryQuery();
  const tags = useTags();

  // replace: gõ tìm kiếm không tạo thêm mục lịch sử trình duyệt
  const handleSearch = useCallback((q) => updateQuery({ q }, { replace: true }), [updateQuery]);
  const handleSortChange = useCallback((sort) => updateQuery({ sort }), [updateQuery]);
  const handlePageChange = (page) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Link cũ trỏ quá số trang hiện có (vd. ?page=99) thì chuyển về trang cuối
  const lastPage = meta?.totalPages ?? 0;
  useEffect(() => {
    if (status === 'success' && lastPage > 0 && query.page > lastPage) {
      updateQuery({ page: lastPage }, { replace: true });
    }
  }, [status, lastPage, query.page, updateQuery]);

  return (
    <>
      <LibraryToolbar
        query={query}
        meta={meta}
        shownCount={sheets.length}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
      >
        <LibraryFilters difficulty={query.difficulty} tag={query.tag} tags={tags} onChange={updateQuery} />
      </LibraryToolbar>
      <SheetGrid sheets={sheets} status={status} error={error} onRetry={retry} skeletonCount={PAGE_SIZE} />
      {meta && meta.total > 0 && status !== 'error' && (
        <Pagination page={query.page} totalPages={meta.totalPages} onChange={handlePageChange} />
      )}
    </>
  );
};

export default LibraryBrowser;
