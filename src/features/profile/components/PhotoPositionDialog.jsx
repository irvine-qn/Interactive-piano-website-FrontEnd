import { useEffect, useRef, useState } from "react";
import { clampOffset, getCoverLayout, getCropRect } from "../utils/photoPosition";

const OUTPUT_SIZES = {
  avatar: { width: 512, height: 512 },
  background: { width: 1600, height: 267 },
};
const KEY_STEP = 10;
const ARROW_KEYS = {
  ArrowLeft: { x: KEY_STEP, y: 0 },
  ArrowRight: { x: -KEY_STEP, y: 0 },
  ArrowUp: { x: 0, y: KEY_STEP },
  ArrowDown: { x: 0, y: -KEY_STEP },
};
const BUTTON_CLASS =
  "h-10 cursor-pointer border-2 border-[var(--color-ink)] px-4 font-[inherit] text-sm font-bold";

// Kéo ảnh để chọn vùng hiển thị, Save thì cắt đúng vùng đó thành Blob
const PhotoPositionDialog = ({ kind, url, onConfirm, onCancel, onError }) => {
  const dialogRef = useRef(null);
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [view, setView] = useState(null);
  const output = OUTPUT_SIZES[kind];

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  const handleLoad = ({ target }) => {
    const frame = { width: frameRef.current.clientWidth, height: frameRef.current.clientHeight };
    const layout = getCoverLayout({ width: target.naturalWidth, height: target.naturalHeight }, frame);
    setView({ frame, layout, offset: { x: layout.x, y: layout.y } });
  };

  const moveTo = (offset) => {
    setView((current) => ({ ...current, offset: clampOffset(offset, current.layout, current.frame) }));
  };

  const handlePointerDown = (event) => {
    if (!view) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX - view.offset.x, y: event.clientY - view.offset.y };
  };

  const handlePointerMove = (event) => {
    if (dragRef.current) moveTo({ x: event.clientX - dragRef.current.x, y: event.clientY - dragRef.current.y });
  };

  const handleKeyDown = (event) => {
    const step = ARROW_KEYS[event.key];
    if (!step || !view) return;
    event.preventDefault();
    moveTo({ x: view.offset.x + step.x, y: view.offset.y + step.y });
  };

  const handleSave = () => {
    const crop = getCropRect(view.offset, view.layout.scale, view.frame);
    const canvas = document.createElement("canvas");
    canvas.width = output.width;
    canvas.height = output.height;
    canvas
      .getContext("2d")
      .drawImage(imageRef.current, crop.x, crop.y, crop.width, crop.height, 0, 0, output.width, output.height);
    canvas.toBlob(
      (blob) => (blob ? onConfirm(blob) : onError("Unable to process this image.")),
      "image/webp",
      0.92,
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Adjust photo position"
      onClose={onCancel}
      className="m-auto w-[min(640px,calc(100vw-32px))] border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 shadow-[var(--shadow-hard-lg)]"
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div>
          <h2 className="m-0 text-xl font-extrabold text-[var(--color-ink)]">Adjust photo</h2>
          <p className="m-0 mt-1 text-sm text-[var(--color-neutral-600)]">Drag the photo to choose what shows.</p>
        </div>
        <div
          ref={frameRef}
          role="application"
          aria-label="Photo position. Use the arrow keys to move the photo."
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => {
            dragRef.current = null;
          }}
          onKeyDown={handleKeyDown}
          style={{ aspectRatio: `${output.width} / ${output.height}` }}
          className={`relative mx-auto cursor-grab touch-none select-none overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-surface-muted)] active:cursor-grabbing ${
            kind === "avatar" ? "w-[min(320px,100%)]" : "w-full"
          }`}
        >
          <img
            ref={imageRef}
            src={url}
            alt=""
            draggable={false}
            onLoad={handleLoad}
            onError={() => onError("Please choose a valid image file.")}
            className="pointer-events-none absolute left-0 top-0"
            style={
              view
                ? {
                    width: view.layout.width,
                    height: view.layout.height,
                    maxWidth: "none",
                    transform: `translate(${view.offset.x}px, ${view.offset.y}px)`,
                  }
                : { visibility: "hidden" }
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`${BUTTON_CLASS} bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!view}
            onClick={handleSave}
            className={`${BUTTON_CLASS} bg-[var(--color-brand)] text-[var(--color-ink)] hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Save
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default PhotoPositionDialog;
