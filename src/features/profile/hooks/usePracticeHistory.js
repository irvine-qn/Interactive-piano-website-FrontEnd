import { useCallback, useEffect, useState } from "react";
import { getPracticeHistory } from "../api/profileApi";

export const usePracticeHistory = () => {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    getPracticeHistory({ page }, { signal: controller.signal })
      .then(({ data, meta }) => {
        setSessions((current) => {
          if (page === 1) return data;
          const knownIds = new Set(current.map((session) => session.id));
          return [...current, ...data.filter((session) => !knownIds.has(session.id))];
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

  return { sessions, total, status, retry, loadMore };
};
