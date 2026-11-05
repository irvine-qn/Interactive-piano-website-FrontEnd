// Danh sách nút phân trang: luôn có trang đầu, trang cuối và các trang quanh trang hiện tại,
// chỗ bị lược bỏ thay bằng '…'. Vd. (1, 155) -> [1, 2, 3, '…', 155]; (50, 155) -> [1, '…', 49, 50, 51, '…', 155]
export const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(2, Math.min(page - 1, totalPages - 2));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 3));
  const items = [1];
  if (start > 2) items.push('…');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push('…');
  items.push(totalPages);
  return items;
};
