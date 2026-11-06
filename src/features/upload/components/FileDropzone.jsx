import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { MAX_MIDI_BYTES, MIDI_ACCEPT, MIDI_EXTENSIONS } from '../config/upload';

const MAX_SIZE_LABEL = `${MAX_MIDI_BYTES / (1024 * 1024)} MB`;

// Vùng kéo thả + nút chọn file. Chỉ nhận 1 file, kiểm tra nội dung để hook useUploadForm làm.
const FileDropzone = ({ onFile, disabled = false }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropError, setDropError] = useState(null);

  // Thả file ra ngoài vùng này thì trình duyệt mặc định MỞ file đó (rời trang, mất dữ liệu đang nhập) -> chặn
  useEffect(() => {
    const preventOpen = (event) => {
      if (event.dataTransfer?.types?.includes('Files')) event.preventDefault();
    };
    window.addEventListener('dragover', preventOpen);
    window.addEventListener('drop', preventOpen);
    return () => {
      window.removeEventListener('dragover', preventOpen);
      window.removeEventListener('drop', preventOpen);
    };
  }, []);

  const pickFiles = (files) => {
    if (!files?.length) return;
    if (files.length > 1) {
      setDropError('Drop one MIDI file at a time.');
      return;
    }
    setDropError(null);
    onFile(files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) pickFiles(event.dataTransfer.files);
  };

  return (
    <div>
      <div
        role="group"
        aria-label="Drop a MIDI file"
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        // Rời sang phần tử con bên trong vẫn tính là đang kéo trên vùng thả
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-2 border-2 border-dashed px-6 py-9 text-center transition-colors ${
          isDragging
            ? 'border-[var(--color-brand-strong)] bg-[var(--color-brand-tint)]'
            : 'border-[var(--color-brand)] bg-[var(--color-surface-soft)]'
        }`}
      >
        <Upload aria-hidden="true" className="h-10 w-10 text-[var(--color-brand)]" />
        <p className="m-0 text-base font-bold text-[var(--color-ink)]">
          {isDragging ? 'Drop the file to analyze it' : 'Drag and drop a MIDI file here'}
        </p>
        <p className="m-0 text-xs font-medium text-[var(--color-neutral-400)]">
          Supports {MIDI_EXTENSIONS.join(', ')} • Up to {MAX_SIZE_LABEL}
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-2 h-10 cursor-pointer border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-6 font-[inherit] text-sm font-bold text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-tint)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          Choose a file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={MIDI_ACCEPT}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(event) => {
            pickFiles(event.target.files);
            // Xoá giá trị để chọn lại đúng file vừa chọn vẫn kích hoạt onChange
            event.target.value = '';
          }}
        />
      </div>
      {dropError && (
        <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[var(--color-danger)]">
          {dropError}
        </p>
      )}
    </div>
  );
};

export default FileDropzone;
