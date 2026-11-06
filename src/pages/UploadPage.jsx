import { Link } from 'react-router-dom';
import { ArrowUpFromLine, Upload } from 'lucide-react';
import Footer from '../components/common/footer';
import { ROUTES } from '../config/routes';
import UploadCard from '../features/upload/components/UploadCard';
import CopyrightNote from '../features/upload/components/CopyrightNote';
import { useUploadForm } from '../features/upload/hooks/useUploadForm';
import { MAX_MIDI_BYTES, MIDI_EXTENSIONS } from '../features/upload/config/upload';

const MAX_SIZE_LABEL = `${MAX_MIDI_BYTES / (1024 * 1024)} MB`;
const LOCKED_MESSAGE = 'Add a MIDI file first.';

// Trang tải bài lên: 1 trang 2 cột theo thiết kế User_Upload_Sheet_Cartoon (WBS D6).
// Cột trái: các thẻ đánh số ① File → ② Tracks → ③ Details, thẻ sau mở khi đã phân tích file.
// Cột phải: Preview, Privacy, Copyright note.
const UploadPage = () => {
  const { isAnalyzed } = useUploadForm();

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
          {/* Gửi bài làm ở U-FE-07; trước khi phân tích file xong thì khoá */}
          <button
            type="button"
            disabled={!isAnalyzed}
            title={isAnalyzed ? undefined : LOCKED_MESSAGE}
            className="flex h-11 cursor-pointer items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand)] px-6 font-[inherit] text-[15px] font-bold text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-neutral-500)] disabled:shadow-none"
          >
            <ArrowUpFromLine aria-hidden="true" className="h-4 w-4" />
            Publish
          </button>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,540px)]">
          <div className="flex min-w-0 flex-col gap-6">
            <UploadCard number={1} title="MIDI file">
              {/* Chọn / kéo thả file thật làm ở U-FE-03 */}
              <div className="flex flex-col items-center gap-2 border-2 border-dashed border-[var(--color-brand)] px-6 py-10 text-center">
                <Upload aria-hidden="true" className="h-10 w-10 text-[var(--color-brand)]" />
                <p className="m-0 text-base font-bold text-[var(--color-ink)]">Drag and drop a MIDI file here</p>
                <p className="m-0 text-xs font-medium text-[var(--color-neutral-400)]">
                  Supports {MIDI_EXTENSIONS.join(', ')} • Up to {MAX_SIZE_LABEL}
                </p>
              </div>
            </UploadCard>
            <UploadCard number={2} title="Tracks" locked={!isAnalyzed} lockedMessage={`${LOCKED_MESSAGE} Its tracks will show up here.`} />
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
