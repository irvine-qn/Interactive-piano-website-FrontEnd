import { Link } from 'react-router-dom';
import { ArrowUpFromLine } from 'lucide-react';
import Footer from '../components/common/footer';
import { ROUTES } from '../config/routes';
import UploadCard from '../features/upload/components/UploadCard';
import CopyrightNote from '../features/upload/components/CopyrightNote';
import FileDropzone from '../features/upload/components/FileDropzone';
import FileRow from '../features/upload/components/FileRow';
import TrackTable from '../features/upload/components/TrackTable';
import { useUploadForm } from '../features/upload/hooks/useUploadForm';

const LOCKED_MESSAGE = 'Add a MIDI file first.';

// Trang tải bài lên: 1 trang 2 cột theo thiết kế User_Upload_Sheet_Cartoon (WBS D6).
// Cột trái: các thẻ đánh số ① File → ② Tracks → ③ Details, thẻ sau mở khi đã phân tích file.
// Cột phải: Preview, Privacy, Copyright note.
const UploadPage = () => {
  const {
    file,
    upload,
    analysis,
    selectFile,
    removeFile,
    changeTracks,
    selectedTracks,
    isUpdatingTracks,
    trackError,
    isAnalyzed,
  } = useUploadForm();

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 px-4 pb-14 pt-10">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="m-0 flex list-none items-center gap-1.5 p-0 text-xs font-semibold text-[var(--color-neutral-400)]">
                <li>
                  <Link to={ROUTES.PROFILE} className="text-inherit no-underline hover:text-[var(--color-brand-strong)]">
                    Profile
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-[var(--color-neutral-600)]">
                  Upload a new sheet
                </li>
              </ol>
            </nav>
            <h1 className="m-0 mt-2 text-[32px] font-extrabold leading-tight text-[var(--color-ink)]">Upload a new sheet</h1>
            <p className="m-0 mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
              Turn a MIDI file into a sheet you can practice, then share it with the Fiano community.
            </p>
          </div>
          {/* Gửi bài làm ở U-FE-07 (bật khi đã phân tích file và form hợp lệ), tới lúc đó luôn khoá */}
          <button
            type="button"
            disabled
            title={isAnalyzed ? 'Fill in the sheet details first.' : LOCKED_MESSAGE}
            className="flex h-11 cursor-pointer items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand)] px-6 font-[inherit] text-[15px] font-bold text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-neutral-500)] disabled:shadow-none"
          >
            <ArrowUpFromLine aria-hidden="true" className="h-4 w-4" />
            Publish
          </button>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,540px)]">
          <div className="flex min-w-0 flex-col gap-6">
            <UploadCard number={1} title="MIDI file">
              <div className="flex flex-col gap-4">
                <FileDropzone onFile={selectFile} />
                {file && <FileRow file={file} upload={upload} analysis={analysis} onRemove={removeFile} />}
              </div>
            </UploadCard>
            <UploadCard number={2} title="Tracks" locked={!isAnalyzed} lockedMessage={`${LOCKED_MESSAGE} Its tracks will show up here.`}>
              {isAnalyzed && (
                <TrackTable
                  analysis={analysis}
                  selectedTracks={selectedTracks}
                  isUpdating={isUpdatingTracks}
                  error={trackError}
                  onChange={changeTracks}
                />
              )}
            </UploadCard>
            <UploadCard
              number={3}
              title="Sheet details"
              locked={!isAnalyzed}
              lockedMessage={`${LOCKED_MESSAGE} The title, tempo and key are read from the file.`}
            />
          </div>

          <aside aria-label="Preview and privacy" className="flex min-w-0 flex-col gap-6">
            <UploadCard title="Preview" locked={!isAnalyzed} lockedMessage="Your sheet card will appear here, as it will look in the Sheet Library." />
            {/* Chọn Public / Private làm ở U-FE-06 */}
            <UploadCard title="Privacy">
              <p className="m-0 text-sm font-medium text-[var(--color-neutral-600)]">
                New sheets are private: only you can see them until you make them public.
              </p>
            </UploadCard>
            <CopyrightNote />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;
