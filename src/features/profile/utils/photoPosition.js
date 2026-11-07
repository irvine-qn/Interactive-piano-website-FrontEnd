// Ảnh phủ kín khung, giữ tỉ lệ, ban đầu nằm giữa khung
export const getCoverLayout = (image, frame) => {
  const scale = Math.max(frame.width / image.width, frame.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return { scale, width, height, x: (frame.width - width) / 2, y: (frame.height - height) / 2 };
};

const clamp = (value, min) => Math.min(0, Math.max(min, value));

export const clampOffset = (offset, layout, frame) => ({
  x: clamp(offset.x, frame.width - layout.width),
  y: clamp(offset.y, frame.height - layout.height),
});

// Vùng đang thấy trong khung, tính theo pixel của ảnh gốc
export const getCropRect = (offset, scale, frame) => ({
  x: -offset.x / scale,
  y: -offset.y / scale,
  width: frame.width / scale,
  height: frame.height / scale,
});
