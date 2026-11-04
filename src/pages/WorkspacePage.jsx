import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "../features/workspace/store/useWorkspaceStore";
import PianoKeyboard from "../features/workspace/components/PianoKeyboard";
import ControlBar from "../features/workspace/components/ControlBar";
import WaterfallCanvas from "../features/workspace/canvas/practiceWaterfall";
import { useSheetLoader } from "../features/workspace/hooks/useSheetLoader";
import Footer from "../components/common/footer";

const WorkspacePage = () => {
  const { sheet, sheetStatus, sheetError } = useWorkspaceStore();
  const { sheetId } = useParams();
  const reloadSheet = useSheetLoader(sheetId);

  return (
    <div className="flex flex-1 flex-col bg-[#cbf0ff] font-sans">
      <div className="w-full pt-4 pb-4 text-center shrink-0">
        <h1 className="text-3xl font-black text-gray-800 tracking-wider">
          FIANO<span className="text-[#ff7a1a]">.</span>
        </h1>
        {sheet && (
          <p className="mt-1 text-sm font-semibold text-gray-600">
            {sheet.title}{" "}
            <span className="font-normal text-gray-500">
              - {sheet.composer}
            </span>
          </p>
        )}
      </div>

      <div className="w-full border-y border-gray-300 shrink-0">
        <ControlBar />
      </div>

      <div className="flex-1 flex flex-col w-full mx-auto px-4 mt-2">
        <div className="flex-1 relative w-full bg-[#f8f9fa]/90 border-b-4 border-[#ff7a1a] rounded-t-lg overflow-hidden">
          <WaterfallCanvas />
          {sheetStatus === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-600">
              Loading sheet...
            </div>
          )}
          {sheetStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
              <p className="text-sm font-bold text-red-600">
                {sheetError?.message}
              </p>
              <button
                onClick={reloadSheet}
                className="cursor-pointer px-4 py-2 rounded-lg bg-[#ff7a1a] text-white text-sm font-bold hover:bg-[#e8630a] transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* TẦNG 4: PIANO KEYBOARD (shrink-0 để luôn giữ nguyên kích thước không bị bóp méo) */}
        <div className="w-full shrink-0 pb-4 pt-0">
          <PianoKeyboard />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkspacePage;
