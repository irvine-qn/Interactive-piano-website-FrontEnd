import { useCallback, useEffect, useState } from 'react';
import { getSheet } from '../api/sheetsApi';
import { loadSheet, disposeSheet } from '../audio/sheetPlayer';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

// Tải bài nhạc từ API vào store và lên lịch phát. Trả về hàm tải lại khi lỗi.
export const useSheetLoader = (sheetId) => {
  // Chỉ lấy các action (không đổi) để component gọi hook này không render lại theo mọi thay đổi của store
  const { setSheetLoading, setSheet, setSheetError } = useWorkspaceStore(
    useShallow((state) => ({
      setSheetLoading: state.setSheetLoading,
      setSheet: state.setSheet,
      setSheetError: state.setSheetError,
    })),
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSheetLoading();

    getSheet(sheetId, { signal: controller.signal })
      .then((data) => {
        setSheet(data);
        loadSheet(data.notes);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSheetError(error);
      });

    return () => {
      controller.abort();
      disposeSheet();
    };
  }, [sheetId, reloadKey, setSheetLoading, setSheet, setSheetError]);

  return useCallback(() => setReloadKey((k) => k + 1), []);
};
