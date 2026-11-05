import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSheet, recordView } from '../api/sheetsApi';
import { loadSheet, disposeSheet } from '../audio/sheetPlayer';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

export const useSheetLoader = (sheetId) => {
  const location = useLocation();
  const navigate = useNavigate();
  const countedLocationKey = useRef(null);
  const { loadedSheetId, setSheetLoading, setSheet, setSheetError, setSheetViews } = useWorkspaceStore(
    useShallow((state) => ({
      loadedSheetId: state.sheet?.id,
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
        loadSheet(data.notes, data.bpm, data.chords);
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

  useEffect(() => {
    if (!location.state?.countView || loadedSheetId !== sheetId) return;
    if (countedLocationKey.current === location.key) return;
    countedLocationKey.current = location.key;

    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    recordView(sheetId)
      .then(({ views }) => setSheetViews(sheetId, views))
      .catch(() => {});
  }, [location, loadedSheetId, sheetId, navigate, setSheetViews]);

  return useCallback(() => setReloadKey((k) => k + 1), []);
};
