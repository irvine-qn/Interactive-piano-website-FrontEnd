import { useEffect, useState } from 'react';
import { getTags } from '../api/libraryApi';

// Danh sách thể loại cho thanh lọc. Lỗi thì trả mảng rỗng (ẩn nhóm thể loại), không chặn cả trang.
export const useTags = () => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    getTags({ signal: controller.signal })
      .then((res) => setTags(res.data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return tags;
};
