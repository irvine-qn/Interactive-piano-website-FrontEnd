import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useWorkspaceStore } from "../features/workspace/store/useWorkspaceStore";
import PianoKeyboard from "../features/workspace/components/PianoKeyboard";
import ControlBar from "../features/workspace/components/ControlBar";
import SheetInfoPanel from "../features/workspace/components/SheetInfoPanel";
import OctaveShiftControl from "../features/workspace/components/OctaveShiftControl";
import KeyLabelSelect from "../features/workspace/components/KeyLabelSelect";
import ShortcutStrip from "../features/workspace/components/ShortcutStrip";
import ShortcutToggle from "../features/workspace/components/ShortcutToggle";
import ViewModeToggle from "../features/workspace/components/ViewModeToggle";
import WaterfallCanvas from "../features/workspace/canvas/practiceWaterfall";
import { useSheetLoader } from "../features/workspace/hooks/useSheetLoader";
import { usePracticeSession } from "../features/workspace/hooks/usePracticeSession";
import Footer from "../components/common/footer";
import HowToPlay from "../features/home/components/HowToPlay";

const SheetMusicScore = lazy(() => import("../features/workspace/canvas/sheetMusicScore"));

const CARD_CLASS =
  "border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]";

const WorkspacePage = () => {
  const { sheet, sheetStatus, sheetError, viewMode, keyLabels, setKeyLabels, handOctaves, moveHandOctave, showShortcuts, currentMode } = useWorkspaceStore(
    useShallow((state) => ({
      sheet: state.sheet,
      sheetStatus: state.sheetStatus,
      sheetError: state.sheetError,
      viewMode: state.viewMode,
      showShortcuts: state.showShortcuts,
      currentMode: state.currentMode,
      keyLabels: state.keyLabels,
      setKeyLabels: state.setKeyLabels,
      handOctaves: state.handOctaves,
      moveHandOctave: state.moveHandOctave,
    })),
  );
  const isSheetView = viewMode === "sheet";
  const { sheetId } = useParams();
  const reloadSheet = useSheetLoader(sheetId);
  usePracticeSession(sheetId);

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 pb-14 pt-10">
        <section aria-label="Sheet information" className={`${CARD_CLASS} px-5 py-4`}>
          <SheetInfoPanel sheet={sheet} status={sheetStatus} />
        </section>

        <section aria-label="Playback controls" className={CARD_CLASS}>
          <ControlBar />
        </section>

        <section aria-label="Waterfall and piano" className={CARD_CLASS}>
          <header className="flex flex-wrap items-center gap-3 border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-2">
            <span aria-hidden="true" className="h-3 w-3 border-2 border-[var(--color-ink)] bg-[var(--color-brand)]" />
            <h2 className="m-0 text-sm font-bold uppercase tracking-wide text-[var(--color-ink)]">{isSheetView ? "Sheet music" : "Waterfall"}</h2>
            <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
              <ViewModeToggle />
              <ShortcutToggle />
              <KeyLabelSelect value={keyLabels} onChange={setKeyLabels} />
              <OctaveShiftControl handOctaves={handOctaves} onMove={moveHandOctave} automatic={currentMode === "PRACTICE"} />
            </div>
          </header>

          <div className="flex flex-col p-[14px]">
            {showShortcuts && <ShortcutStrip />}
            <div className="relative h-[clamp(260px,calc(100dvh-360px),440px)] w-full overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-surface-paper)]">
              {isSheetView ? (
                <Suspense fallback={null}>
                  <SheetMusicScore />
                </Suspense>
              ) : (
                <WaterfallCanvas />
              )}
              {sheetStatus === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--color-neutral-600)]">
                  Loading sheet...
                </div>
              )}
              {sheetStatus === "error" && (
                <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="m-0 text-sm font-bold text-[var(--color-danger)]">{sheetError?.message}</p>
                  <button
                    type="button"
                    onClick={reloadSheet}
                    className="flex h-10 cursor-pointer items-center border-2 border-[var(--color-ink)] bg-[var(--color-brand)] px-5 font-[inherit] text-sm font-bold text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            <div className="w-full shrink-0">
              <PianoKeyboard />
            </div>
          </div>
        </section>
      </main>
      <HowToPlay />
      <Footer />
    </div>
  );
};

export default WorkspacePage;
