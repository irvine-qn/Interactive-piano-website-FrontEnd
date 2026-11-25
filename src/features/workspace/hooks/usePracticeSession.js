import { useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { savePracticeSession } from "../api/sheetsApi";

export const PRACTICE_MIN_NOTES = 5;
export const PRACTICE_IDLE_GAP_MS = 10000;

let noteCount = 0;
let activeMs = 0;
let lastPressAt = null;

export const recordNotePress = (now = Date.now()) => {
  if (lastPressAt !== null && now - lastPressAt <= PRACTICE_IDLE_GAP_MS) {
    activeMs += now - lastPressAt;
  }
  lastPressAt = now;
  noteCount += 1;
};

export const takePracticeSession = () => {
  const session = { noteCount, durationSec: Math.round(activeMs / 1000) };
  noteCount = 0;
  activeMs = 0;
  lastPressAt = null;
  return session.noteCount >= PRACTICE_MIN_NOTES ? session : null;
};

export const usePracticeSession = (sheetId) => {
  useEffect(() => {
    if (!sheetId) return undefined;

    const saveSession = () => {
      const session = takePracticeSession();
      const { accessToken } = useAuthStore.getState();
      if (session && accessToken) {
        savePracticeSession(sheetId, session, accessToken).catch(() => {});
      }
    };

    window.addEventListener("pagehide", saveSession);
    return () => {
      window.removeEventListener("pagehide", saveSession);
      saveSession();
    };
  }, [sheetId]);
};
