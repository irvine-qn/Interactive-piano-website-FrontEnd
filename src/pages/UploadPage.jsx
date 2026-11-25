import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpFromLine, LoaderCircle } from 'lucide-react';
import Footer from '../components/common/footer';
import { ROUTES } from '../config/routes';
import UploadCard from '../features/upload/components/UploadCard';
import CopyrightNote from '../features/upload/components/CopyrightNote';
import FileDropzone from '../features/upload/components/FileDropzone';
import FileRow from '../features/upload/components/FileRow';
import TrackTable from '../features/upload/components/TrackTable';
import SheetDetailsForm from '../features/upload/components/SheetDetailsForm';
import SheetPreview from '../features/upload/components/SheetPreview';
import PrivacyOptions from '../features/upload/components/PrivacyOptions';
import PublishAlert from '../features/upload/components/PublishAlert';
import { useTags } from '../features/library/hooks/useTags';
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
    details,
    detailErrors,
    updateField,
    isAnalyzed,
    publish,
    publishSheet,
    publishBlocker,
    isPublishing,
    publishErrorFor,
  } = useUploadForm();
  // Tag có sẵn trong Library (nhiều bài nhất trước) để gợi ý ở thẻ ③
  const tags = useTags();
  const knownTags = useMemo(() => tags.map((tag) => tag.name), [tags]);
  const navigate = useNavigate();

  // Gửi lỗi -> cuộn tới thẻ có lỗi (lỗi chung: lên đầu trang, cạnh nút Publish)
  useEffect(() => {
    if (publish.status !== 'error') return;
    document.getElementById(`upload-${publish.target.card}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [publish]);

  const handlePublish = async () => {
    const sheet = await publishSheet();
    // Thành công: mở bài vừa tạo ở Workspace để luyện tập ngay
    if (sheet) navigate(`${ROUTES.WORKSPACE}/${encodeURIComponent(sheet.id)}`);
  };

  const publishLabel =
    publish.status === 'uploading'
      ? `Uploading ${publish.progress}%`
      : publish.status === 'saving' || publish.status === 'done'
        ? 'Saving…'
        : 'Publish';

  return (
    <div className="flex flex-1 flex-col max-sm:pb-[6.5rem]">
      <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 px-4 pb-14 pt-6 sm:gap-8 sm:pt-10">
        <header id="upload-page" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
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
              <h1 className="m-0 mt-2 text-[26px] sm:text-[32px] font-extrabold leading-tight text-[var(--color-ink)]">Upload a new sheet</h1>
              <p className="m-0 mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
                Turn a MIDI file into a sheet you can practice, then share it with the Fiano community.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-20 max-sm:border-0 max-sm:border-t-2 max-sm:border-solid max-sm:border-[var(--color-ink)] max-sm:bg-[var(--color-surface-card)] max-sm:px-4 max-sm:py-3">
              <button
                type="button"
                onClick={handlePublish}
                disabled={Boolean(publishBlocker) || isPublishing || publish.status === 'done'}
                title={publishBlocker ?? undefined}
                aria-describedby={publishBlocker ? 'publish-blocker' : undefined}
                className="flex h-11 min-w-[10rem] cursor-pointer items-center justify-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand)] px-6 font-[inherit] text-[15px] font-bold text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-neutral-500)] disabled:shadow-none"
              >
                {isPublishing || publish.status === 'done' ? (
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpFromLine aria-hidden="true" className="h-4 w-4" />
                )}
                {publishLabel}
              </button>
              {publishBlocker && (
                <span id="publish-blocker" className="text-right text-xs max-sm:text-center font-medium text-[var(--color-neutral-500)]">
                  {publishBlocker}
                </span>
              )}
            </div>
          </div>
          {(isPublishing || publish.status === 'done') && (
            <div
              role="progressbar"
              aria-label="Publishing"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={publish.progress}
              className="h-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)]"
            >
              <div className="h-full bg-[var(--color-brand)] transition-[width]" style={{ width: `${publish.progress}%` }} />
            </div>
          )}
          <PublishAlert error={publishErrorFor('page')} />
        </header>

        {/* Đang gửi: khoá cả form (fieldset disabled khoá mọi input / nút bên trong) */}
        <fieldset
          disabled={isPublishing || publish.status === 'done'}
          aria-busy={isPublishing || undefined}
          className="m-0 min-w-0 border-0 p-0 disabled:opacity-70"
        >
          <legend className="sr-only">Sheet to upload</legend>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,540px)]">
            <div className="flex min-w-0 flex-col gap-6">
              <div id="upload-file">
                <UploadCard number={1} title="MIDI file">
                  <div className="flex flex-col gap-4">
                    <FileDropzone onFile={selectFile} />
                    {file && <FileRow file={file} upload={upload} analysis={analysis} onRemove={removeFile} />}
                    <PublishAlert error={publishErrorFor('file')} hint="Choose another file." />
                  </div>
                </UploadCard>
              </div>
              <div id="upload-tracks">
                <UploadCard number={2} title="Tracks" locked={!isAnalyzed} lockedMessage={`${LOCKED_MESSAGE} Its tracks will show up here.`}>
                  {isAnalyzed && (
                    <div className="flex flex-col gap-4">
                      <TrackTable
                        analysis={analysis}
                        selectedTracks={selectedTracks}
                        isUpdating={isUpdatingTracks}
                        error={trackError}
                        onChange={changeTracks}
                      />
                      <PublishAlert error={publishErrorFor('tracks')} hint="Choose other tracks." />
                    </div>
                  )}
                </UploadCard>
              </div>
              <div id="upload-details">
                <UploadCard
                  number={3}
                  title="Sheet details"
                  locked={!isAnalyzed}
                  lockedMessage={`${LOCKED_MESSAGE} The title, tempo and key are read from the file.`}
                >
                  {isAnalyzed && (
                    <SheetDetailsForm
                      analysis={analysis}
                      details={details}
                      errors={detailErrors}
                      knownTags={knownTags}
                      onChange={updateField}
                    />
                  )}
                </UploadCard>
              </div>
            </div>

            <aside aria-label="Preview and privacy" className="flex min-w-0 flex-col gap-6">
              <UploadCard title="Preview" locked={!isAnalyzed} lockedMessage="Your sheet card will appear here, as it will look in the Sheet Library.">
                {isAnalyzed && <SheetPreview analysis={analysis} details={details} onChange={updateField} />}
              </UploadCard>
              <UploadCard title="Privacy">
                <PrivacyOptions value={details.visibility} onChange={updateField} />
              </UploadCard>
              <CopyrightNote />
            </aside>
          </div>
        </fieldset>
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;
