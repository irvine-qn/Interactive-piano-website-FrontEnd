import { useCallback } from 'react';
import { PAGE_SIZE, useLibraryQuery } from '../hooks/useLibraryQuery';
import LibraryToolbar from './LibraryToolbar';
import SheetGrid from './SheetGrid';

// Khối chính của trang Library: nối dữ liệu từ useLibraryQuery vào toolbar, lưới và phân trang
const LibraryBrowser = () => {
  const { query, sheets, meta, status, error, updateQuery, retry } = useLibraryQuery();

  // replace: gõ tìm kiếm không tạo thêm mục lịch sử trình duyệt
  const handleSearch = useCallback((q) => updateQuery({ q }, { replace: true }), [updateQuery]);
  const handleSortChange = useCallback((sort) => updateQuery({ sort }), [updateQuery]);

  return (
    <>
      <LibraryToolbar
        query={query}
        meta={meta}
        shownCount={sheets.length}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
      />
      <SheetGrid sheets={sheets} status={status} error={error} onRetry={retry} skeletonCount={PAGE_SIZE} />
    </>
  );
};

export default LibraryBrowser;
