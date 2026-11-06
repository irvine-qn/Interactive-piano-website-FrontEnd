import { useCallback, useEffect, useState } from "react";
import { deleteSheet, getMySheets, updateSheet } from "../../upload/api/uploadApi";
import { mergeSheets, nextPageToLoad } from "../utils/mySheets";

const PAGE_SIZE = 20;

// Danh sách bài tôi đã upload. Đổi q / difficulty thì nơi dùng đổi `key` để bắt đầu lại từ đầu.
export const useMySheets = ({ q, difficulty } = {}) => {
  // nonce: tải lại được cả khi số trang không đổi (thử lại, hoặc Load more sau khi xoá bài)
  const [request, setRequest] = useState({ page: 1, nonce: 0 });
  const [sheets, setSheets] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    getMySheets(
      { page: request.page, pageSize: PAGE_SIZE, q: q || undefined, difficulty },
      { signal: controller.signal },
    )
      .then(({ data, meta }) => {
        setSheets((current) => mergeSheets(current, data));
        setTotal(meta.total);
        setStatus("success");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });

    return () => controller.abort();
  }, [request, q, difficulty]);

  const retry = useCallback(() => {
    setStatus("loading");
    setRequest((current) => ({ ...current, nonce: current.nonce + 1 }));
  }, []);

  const loadMore = useCallback(() => {
    setRequest((current) => ({
      page: nextPageToLoad(sheets.length, PAGE_SIZE),
      nonce: current.nonce + 1,
    }));
  }, [sheets.length]);

  const update = useCallback(async (id, fields) => {
    const updated = await updateSheet(id, fields);
    setSheets((current) =>
      current.map((sheet) => (sheet.id === id ? { ...sheet, ...updated } : sheet)),
    );
  }, []);

  const remove = useCallback(async (id) => {
    await deleteSheet(id);
    setSheets((current) => current.filter((sheet) => sheet.id !== id));
    setTotal((current) => Math.max(current - 1, 0));
  }, []);

  return { sheets, total, status, retry, loadMore, update, remove };
};

// Tổng số bài đã upload cho thẻ thống kê: không đổi theo ô tìm kiếm của tab
export const useUploadedCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMySheets({ pageSize: 1 }, { signal: controller.signal })
      .then(({ meta }) => setCount(meta.total))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const decrement = useCallback(() => setCount((current) => Math.max(current - 1, 0)), []);

  return { count, decrement };
};
