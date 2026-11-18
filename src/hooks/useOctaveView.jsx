import { useCallback, useState, useSyncExternalStore } from "react";
import { KEY_LAYOUT } from "../features/workspace/config/keyLayout";

// Mobile: dọc hiện 2 quãng, ngang hiện 4 quãng; desktop hiện đủ 88 phím.
const PORTRAIT_QUERY = "(max-width: 767px) and (orientation: portrait)";
const LANDSCAPE_QUERY = "(max-width: 1023px) and (orientation: landscape)";
const VIEW_BY_MODE = { portrait: { octaves: 2 }, landscape: { octaves: 4 } };
const WHITE_KEY_COUNT = KEY_LAYOUT.filter((key) => !key.isBlack).length;
const KEYS_BEFORE_C1 = 2;
const FRAME_INSET = 14;
export const MIN_VIEW_OCTAVE = 1;

const getWhiteIndex = (octave) => KEYS_BEFORE_C1 + (octave - 1) * 7;
const getMaxViewOctave = (octaves) =>
  Math.floor((WHITE_KEY_COUNT - KEYS_BEFORE_C1 - octaves * 7) / 7) + 1;

const getScreenMode = () => {
  if (window.matchMedia(PORTRAIT_QUERY).matches) return "portrait";
  if (window.matchMedia(LANDSCAPE_QUERY).matches) return "landscape";
  return "desktop";
};

const subscribeScreenMode = (onChange) => {
  const lists = [PORTRAIT_QUERY, LANDSCAPE_QUERY].map((query) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
};

export const useOctaveView = (initial) => {
  const mode = useSyncExternalStore(subscribeScreenMode, getScreenMode);
  const [viewOctaves, setViewOctaves] = useState(initial);
  const view = VIEW_BY_MODE[mode] ?? null;
  const viewOctave = view ? viewOctaves[mode] : null;
  const maxViewOctave = view ? getMaxViewOctave(view.octaves) : null;

  const setViewOctave = useCallback(
    (octave) =>
      setViewOctaves((current) => ({
        ...current,
        [mode]: Math.min(maxViewOctave, Math.max(MIN_VIEW_OCTAVE, octave)),
      })),
    [mode, maxViewOctave],
  );

  const moveView = (delta) =>
    setViewOctaves((current) => ({
      ...current,
      [mode]: Math.min(maxViewOctave, Math.max(MIN_VIEW_OCTAVE, current[mode] + delta)),
    }));

  // Phóng to cả dải phím rồi dịch sang quãng đang xem; canvas đọc vị trí keybed nên tự khớp.
  const renderInView = (content, { framed = false } = {}) => {
    if (!view) return content;
    const visibleWhites = view.octaves * 7;
    return (
      <div className="relative overflow-hidden">
        <div
          style={{
            width: `calc((100% - ${FRAME_INSET * 2}px) * ${WHITE_KEY_COUNT / visibleWhites} + ${FRAME_INSET * 2}px)`,
            transform: `translateX(calc((${FRAME_INSET * 2}px - 100%) * ${getWhiteIndex(viewOctave) / WHITE_KEY_COUNT}))`,
          }}
        >
          {content}
        </div>
        {framed && (
          <>
            <span
              aria-hidden="true"
              style={{ width: FRAME_INSET }}
              className="pointer-events-none absolute inset-y-0 left-0 border-y-2 border-l-2 border-r-[1.5px] border-[var(--color-ink)] bg-[var(--color-piano-wood)]"
            />
            <span
              aria-hidden="true"
              style={{ width: FRAME_INSET }}
              className="pointer-events-none absolute inset-y-0 right-0 border-y-2 border-r-2 border-l-[1.5px] border-[var(--color-ink)] bg-[var(--color-piano-wood)]"
            />
          </>
        )}
      </div>
    );
  };

  return { mode, view, viewOctave, maxViewOctave, moveView, setViewOctave, renderInView };
};
