import { PAGE_SIZE, useLibraryQuery } from '../hooks/useLibraryQuery';
import SheetGrid from './SheetGrid';

// Khối chính của trang Library: nối dữ liệu từ useLibraryQuery vào toolbar, lưới và phân trang
const LibraryBrowser = () => {
  const { sheets, status, error, retry } = useLibraryQuery();

  return <SheetGrid sheets={sheets} status={status} error={error} onRetry={retry} skeletonCount={PAGE_SIZE} />;
};

export default LibraryBrowser;
