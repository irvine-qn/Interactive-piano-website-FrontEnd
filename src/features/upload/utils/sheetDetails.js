import { COMPOSER_MAX, DIFFICULTIES, MAX_TAGS, TAG_MAX, TITLE_MAX } from '../config/upload';

// Gộp khoảng trắng thừa: "  Lo   fi " -> "Lo fi"
export const cleanText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

// "d major" -> "D major", null -> "Not set"
export const formatKey = (keySignature) =>
  keySignature ? keySignature.charAt(0).toUpperCase() + keySignature.slice(1) : 'Not set';

// [3, 4] -> "3/4"
export const formatTimeSignature = (timeSignature) => {
  const [beats, unit] = timeSignature ?? [];
  return beats && unit ? `${beats}/${unit}` : 'Not set';
};

// Id dự kiến của bài từ tên (bỏ dấu tiếng Việt), giống cách Backend tạo id ở U-BE-07 (BE thêm -2, -3 nếu trùng).
// Preview dùng làm seed vẽ bìa để bìa giống lúc lên Library.
export const toSlug = (title) =>
  cleanText(title)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';

// Thêm 1 tag người dùng gõ vào danh sách đang chọn. -> { tags } | { error }
// Trùng tag có sẵn (không phân biệt hoa thường) thì dùng đúng cách viết của tag có sẵn,
// để Library không bị tách thành "pop" và "Pop" (lọc tag ở Library phân biệt hoa thường).
export const addTag = (tags, raw, knownTags = []) => {
  const text = cleanText(raw);
  if (!text) return { tags };
  if (tags.length >= MAX_TAGS) return { error: `You can add up to ${MAX_TAGS} tags.` };
  if (text.length > TAG_MAX) return { error: `A tag can be at most ${TAG_MAX} characters.` };
  const lower = text.toLowerCase();
  if (tags.some((tag) => tag.toLowerCase() === lower)) return { error: `“${text}” is already added.` };
  const known = knownTags.find((tag) => tag.toLowerCase() === lower);
  return { tags: [...tags, known ?? text] };
};

// Lỗi của thẻ ③, theo từng ô. {} = hợp lệ. Câu lỗi hiện ngay dưới ô nên viết tiếng Anh dễ hiểu.
export const validateDetails = ({ title, composer, difficulty, tags }) => {
  const errors = {};
  const cleanTitle = cleanText(title);
  if (!cleanTitle) errors.title = 'Give your sheet a title.';
  else if (cleanTitle.length > TITLE_MAX) errors.title = `The title can be at most ${TITLE_MAX} characters.`;
  if (cleanText(composer).length > COMPOSER_MAX) errors.composer = `The composer can be at most ${COMPOSER_MAX} characters.`;
  if (!DIFFICULTIES.includes(difficulty)) errors.difficulty = 'Choose a difficulty.';
  if (tags.length > MAX_TAGS) errors.tags = `You can add up to ${MAX_TAGS} tags.`;
  return errors;
};
