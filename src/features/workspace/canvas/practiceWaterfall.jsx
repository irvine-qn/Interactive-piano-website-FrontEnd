import { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { KEY_LAYOUT } from '../config/keyLayout';
import { getSongTime } from '../audio/songClock';

const PIXELS_PER_SECOND = 150;
const ROW_HEIGHT = 24;
const HIT_LINE_HEIGHT = 4;
const SHADOW_OFFSET = 2;

const readColors = (element) => {
  const style = getComputedStyle(element);
  const read = (name) => style.getPropertyValue(name).trim();
  return {
    ink: read('--color-ink'),
    brand: read('--color-brand'),
    paper: read('--color-surface-paper'),
    grid: read('--color-line-grid'),
    octave: read('--color-line-lane-octave'),
    right: [read('--color-note-orange-top'), read('--color-note-orange-mid'), read('--color-note-orange-end')],
    left: [read('--color-note-blue-top'), read('--color-note-blue-mid'), read('--color-note-blue-end')],
  };
};

const WaterfallCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const notes = useWorkspaceStore((state) => state.sheet?.notes);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const colors = readColors(container);
    const keybed = document.querySelector('[data-keybed]');
    let animationFrameId;
    let keyMap = {};
    let octaveLines = [];
    let canvasWidth = 0;
    let canvasHeight = 0;

    const updateLayout = () => {
      const rect = container.getBoundingClientRect();
      canvasWidth = rect.width;
      canvasHeight = rect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bed = keybed ? keybed.getBoundingClientRect() : rect;
      const bedStyle = keybed ? getComputedStyle(keybed) : null;
      const borderLeft = bedStyle ? parseFloat(bedStyle.borderLeftWidth) || 0 : 0;
      const borderRight = bedStyle ? parseFloat(bedStyle.borderRightWidth) || 0 : 0;
      const offset = bed.left + borderLeft - rect.left;
      const bedWidth = bed.width - borderLeft - borderRight;
      keyMap = {};
      octaveLines = [];
      KEY_LAYOUT.forEach((key) => {
        const x = offset + (key.left / 100) * bedWidth;
        keyMap[key.note] = { x, width: (key.width / 100) * bedWidth, isBlack: key.isBlack };
        if (!key.isBlack && key.note.startsWith('C')) octaveLines.push(Math.round(x));
      });
    };

    const drawBackground = (hitY) => {
      ctx.fillStyle = colors.paper;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = colors.grid;
      for (let y = ROW_HEIGHT; y < hitY; y += ROW_HEIGHT) ctx.fillRect(0, y, canvasWidth, 1);
      ctx.fillStyle = colors.octave;
      octaveLines.forEach((x) => ctx.fillRect(x, 0, 1, hitY));
    };

    const drawNote = (note, keyData, top, height) => {
      const inset = keyData.isBlack ? 1 : 2;
      const x = keyData.x + inset;
      const width = keyData.width - inset * 2;
      if (width <= 0) return;

      ctx.fillStyle = colors.ink;
      ctx.fillRect(x + SHADOW_OFFSET, top + SHADOW_OFFSET, width, height);

      const [light, mid, dark] = note.hand === 'left' ? colors.left : colors.right;
      const gradient = ctx.createLinearGradient(0, top, 0, top + height);
      gradient.addColorStop(0, light);
      gradient.addColorStop(0.45, mid);
      gradient.addColorStop(1, dark);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, top, width, height);

      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, top + 1, width - 2, height - 2);
    };

    let lastBedLeft = null;
    let lastBedWidth = null;
    const renderLoop = () => {
      // Trên mobile keybed bị dịch bằng transform (đổi quãng) nên ResizeObserver không báo.
      if (keybed) {
        const { left, width } = keybed.getBoundingClientRect();
        if (left !== lastBedLeft || width !== lastBedWidth) {
          lastBedLeft = left;
          lastBedWidth = width;
          updateLayout();
        }
      }
      const hitY = canvasHeight - HIT_LINE_HEIGHT;
      drawBackground(hitY);

      if (notes) {
        const currentTime = getSongTime();

        const visible = [];
        notes.forEach((note) => {
          const keyData = keyMap[note.name];
          if (!keyData) return;
          const height = note.duration * PIXELS_PER_SECOND;
          const top = hitY - (note.time - currentTime) * PIXELS_PER_SECOND - height;
          if (top < hitY && top + height > 0) visible.push({ note, keyData, top, height });
        });

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvasWidth, hitY);
        ctx.clip();
        ctx.lineJoin = 'round';
        visible.forEach((v) => !v.keyData.isBlack && drawNote(v.note, v.keyData, v.top, v.height));
        visible.forEach((v) => v.keyData.isBlack && drawNote(v.note, v.keyData, v.top, v.height));
        ctx.restore();
      }

      ctx.fillStyle = colors.brand;
      ctx.fillRect(0, hitY, canvasWidth, HIT_LINE_HEIGHT);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });
    resizeObserver.observe(container);
    if (keybed) resizeObserver.observe(keybed);

    renderLoop();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [notes]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="block" />
    </div>
  );
};

export default WaterfallCanvas;
