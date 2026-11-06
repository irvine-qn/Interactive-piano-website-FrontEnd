import { useCallback, useEffect, useState } from "react";
import { toggleSheetLike } from "../../library/api/libraryApi";
import { getLikedSheets } from "../api/profileApi";

const LIKED_SHEETS_SORT = "newest";

export const useLikedSheets = () => {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    getLikedSheets({ sort: LIKED_SHEETS_SORT, page }, { signal: controller.signal })
      .then(({ data, meta }) => {
        setSheets((current) => {
          if (page === 1) return data;
          const knownIds = new Set(current.map((sheet) => sheet.id));
          return [...current, ...data.filter((sheet) => !knownIds.has(sheet.id))];
        });
        setTotal(meta.total);
        setStatus("success");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });

    return () => controller.abort();
  }, [page, reloadKey]);

  const retry = useCallback(() => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  }, []);

  const loadMore = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const unlike = useCallback(async (id) => {
    const { liked } = await toggleSheetLike(id);
    if (liked) {
      await toggleSheetLike(id);
    }
    setSheets((current) => current.filter((sheet) => sheet.id !== id));
    setTotal((current) => Math.max(current - 1, 0));
  }, []);

  return { sheets, total, status, retry, loadMore, unlike };
};
