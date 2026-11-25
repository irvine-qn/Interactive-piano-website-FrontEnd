import { cleanText } from "../../upload/utils/sheetDetails";

// Trang cần tải tiếp, tính từ số bài đang có thay vì cộng dồn số trang:
// xoá 1 bài làm các bài sau dồn lên 1 vị trí, nếu cứ sang trang kế tiếp sẽ sót mất bài đó.
export const nextPageToLoad = (loadedCount, pageSize) => Math.floor(loadedCount / pageSize) + 1;

// Nối trang mới vào danh sách, bài đã có giữ nguyên (có thể vừa được sửa)
export const mergeSheets = (current, incoming) => {
  const knownIds = new Set(current.map((sheet) => sheet.id));
  return [...current, ...incoming.filter((sheet) => !knownIds.has(sheet.id))];
};

export const toEditDetails = ({ title, composer, difficulty, tags, coverColor, visibility }) => ({
  title,
  composer,
  difficulty,
  tags,
  coverColor,
  visibility,
});

// Tác giả để trống thì Backend tự đổi thành Unknown
export const toSheetUpdate = (details) => ({
  ...details,
  title: cleanText(details.title),
  composer: cleanText(details.composer),
});
