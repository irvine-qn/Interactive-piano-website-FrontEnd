import { useCallback, useEffect, useState } from 'react';
import { getSheet, recordView } from '../api/sheetsApi';
import { loadSheet, disposeSheet } from '../audio/sheetPlayer';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

export const useSheetLoader = (sheetId) => {
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
        loadSheet(data.notes, data.bpm);
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
