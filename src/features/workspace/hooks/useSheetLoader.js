import { useCallback, useEffect, useState } from 'react';
import { getSheet, recordView } from '../api/sheetsApi';
import { loadSheet, disposeSheet } from '../audio/sheetPlayer';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

// Tải bài nhạc từ API vào store và lên lịch phát. Trả về hàm tải lại khi lỗi.
export const useSheetLoader = (sheetId) => {
  // Chỉ lấy các action (không đổi) để component gọi hook này không render lại theo mọi thay đổi của store
  const { setSheetLoading, setSheet, setSheetError, setSheetViews } = useWorkspaceStore(
    useShallow((state) => ({
      setSheetLoading: state.setSheetLoading,
      setSheet: state.setSheet,
      setSheetError: state.setSheetError,
      setSheetViews: state.setSheetViews,
    })),
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSheetLoading();

    getSheet(sheetId, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setSheet(data);
        loadSheet(data.notes);
        // Mỗi lần mở bài tính 1 lượt xem. StrictMode (dev) chạy effect 2 lần nhưng request của lần đầu
        // đã bị abort ở cleanup nên chỉ lần tải thành công này gọi. Lỗi đếm lượt xem không ảnh hưởng luyện tập.
        recordView(data.id)
          .then(({ views }) => setSheetViews(data.id, views))
          .catch(() => {});
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSheetError(error);
      });

    return () => {
      controller.abort();
      disposeSheet();
    };
  }, [sheetId, reloadKey, setSheetLoading, setSheet, setSheetError, setSheetViews]);

  return useCallback(() => setReloadKey((k) => k + 1), []);
};
