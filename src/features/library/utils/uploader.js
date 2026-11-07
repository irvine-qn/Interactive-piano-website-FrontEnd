// "Uploaded by …" của bài upload. null = bài mẫu (không có người upload).
export const uploaderLabel = (sheet) => {
  if (!sheet?.uploader) return null;
  return sheet.isMine ? 'Uploaded by you' : `Uploaded by ${sheet.uploader.displayName}`;
};
