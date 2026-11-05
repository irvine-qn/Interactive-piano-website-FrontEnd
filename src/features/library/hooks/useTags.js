import { useEffect, useState } from 'react';
import { getTags } from '../api/libraryApi';

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
