import { useEffect, useRef } from "react";

const FALL_SPEED = 180;
const ROW_HEIGHT = 24;
const HIT_LINE_HEIGHT = 4;
const HIT_LINE_OFFSET = 10;
const BAR_INSET = 3;

const readColors = (element) => {
  const style = getComputedStyle(element);
  const read = (name) => style.getPropertyValue(name).trim();
  return {
    ink: read("--color-ink"),
    brand: read("--color-brand"),
    paper: read("--color-surface-paper"),
    grid: read("--color-line-grid"),
    octave: read("--color-line-lane-octave"),
    noteTop: read("--color-note-orange-top"),
    noteMid: read("--color-note-orange-mid"),
    noteEnd: read("--color-note-orange-end"),
    noteBlackKey: read("--color-grass"),
  };
};

const Waterfall = ({ keyLayout, activeNotes }) => {
  const canvasRef = useRef(null);
  const barsRef = useRef([]);
  const keysRef = useRef(new Map());

  useEffect(() => {
    keysRef.current = new Map(keyLayout.map((key) => [key.note.name, key]));
  }, [keyLayout]);

  useEffect(() => {
    const now = performance.now();
    const bars = barsRef.current;
    activeNotes.forEach((name) => {
      if (!bars.some((bar) => bar.name === name && bar.end === null)) {
        bars.push({ name, start: now, end: null });
      }
    });
    bars.forEach((bar) => {
      if (bar.end === null && !activeNotes.has(bar.name)) {
        bar.end = now;
      }
    });
  }, [activeNotes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const colors = readColors(canvas);
    let frame;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const hitY = height - HIT_LINE_OFFSET - HIT_LINE_HEIGHT;
      const toPixels = (percent) => (percent / 100) * width;

      context.fillStyle = colors.paper;
      context.fillRect(0, 0, width, height);
      context.fillStyle = colors.grid;
      for (let y = ROW_HEIGHT; y < hitY; y += ROW_HEIGHT) {
        context.fillRect(0, y, width, 1);
      }
      context.fillStyle = colors.octave;
      keysRef.current.forEach((key) => {
        if (!key.black && key.note.name.startsWith("C")) {
          context.fillRect(toPixels(key.left), 0, 1, height);
        }
      });

      barsRef.current = barsRef.current.filter(
        (bar) => bar.end === null || ((time - bar.end) * FALL_SPEED) / 1000 < hitY,
      );

      context.save();
      context.beginPath();
      context.rect(0, 0, width, hitY);
      context.clip();
      barsRef.current.forEach((bar) => {
        const key = keysRef.current.get(bar.name);
        if (!key) {
          return;
        }
        const bottom =
          bar.end === null ? hitY : hitY - ((time - bar.end) * FALL_SPEED) / 1000;
        const top = Math.max(hitY - ((time - bar.start) * FALL_SPEED) / 1000, 0);
        if (bottom <= top) {
          return;
        }
        const x = toPixels(key.left) + BAR_INSET;
        const barWidth = toPixels(key.width) - BAR_INSET * 2;
        context.fillStyle = key.black ? colors.noteBlackKey : colors.noteMid;
        context.fillRect(x, top, barWidth, bottom - top);
        context.strokeStyle = colors.ink;
        context.lineWidth = 2;
        context.strokeRect(x, top, barWidth, bottom - top);
      });
      context.restore();

      context.fillStyle = colors.brand;
      context.fillRect(0, hitY, width, HIT_LINE_HEIGHT);
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="border-2 border-[var(--color-ink)] bg-[var(--color-surface-paper)] px-[14px]">
      <canvas ref={canvasRef} aria-hidden="true" className="block h-[clamp(10rem,calc(100dvh-30rem),18.75rem)] w-full max-md:portrait:h-[clamp(14rem,45dvh,20rem)]" />
    </div>
  );
};

export default Waterfall;
