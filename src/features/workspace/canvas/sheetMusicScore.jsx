import { useEffect, useRef, useState } from 'react';
import { Accidental, Beam, Dot, Formatter, Renderer, Stave, StaveConnector, StaveNote, StaveTie, Voice } from 'vexflow/bravura';
import { getSheetScore } from '../api/sheetsApi';
import { getSongTime } from '../audio/songClock';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const MIN_MEASURE_WIDTH = 300;
const WIDTH_PER_NOTE_EVENT = 34;
const FIRST_MEASURE_EXTRA_WIDTH = 120;
const PADDING_X = 12;
const ROW_HEIGHT = 210;
const TREBLE_OFFSET_Y = 10;
const BASS_OFFSET_Y = 100;
const CURSOR_HEIGHT = 170;
const CURSOR_OFFSET_Y = 30;
const REST_KEY = { treble: 'b/4', bass: 'd/3' };

const buildTickable = (event, clef) => {
  if (event.isRest) return new StaveNote({ clef, keys: [REST_KEY[clef]], duration: `${event.duration}r` });

  const chord = new StaveNote({ clef, keys: event.notes.map((note) => note.key), duration: event.duration, auto_stem: true });
  event.notes.forEach((note, index) => {
    if (note.accidental) chord.addModifier(new Accidental(note.accidental), index);
  });
  return chord;
};

const buildTickables = (events, clef) => {
  const tickables = events.map((event) => buildTickable(event, clef));
  tickables.filter((note) => note.isDotted()).forEach((note) => {
    Dot.buildAndAttach([note], { all: true });
  });
  return tickables;
};

const countNoteEvents = (events) => events.filter((event) => !event.isRest).length;

const drawScore = (container, score) => {
  const { measures, measureSeconds, beats, beatUnit, keySignature } = score;
  const availableWidth = container.clientWidth - PADDING_X * 2;
  const densestMeasure = Math.max(
    ...measures.map(({ treble, bass }) => Math.max(countNoteEvents(treble), countNoteEvents(bass))),
  );
  const minMeasureWidth = Math.max(MIN_MEASURE_WIDTH, densestMeasure * WIDTH_PER_NOTE_EVENT);
  const perRow = Math.max(1, Math.floor((availableWidth - FIRST_MEASURE_EXTRA_WIDTH) / minMeasureWidth));
  const measureWidth = (availableWidth - FIRST_MEASURE_EXTRA_WIDTH) / perRow;
  const rows = Math.ceil(measures.length / perRow);

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(container.clientWidth, rows * ROW_HEIGHT);
  const context = renderer.getContext();
  const positions = [];
  const pendingTies = { treble: null, bass: null };

  const drawTies = (clef, events, tickables, row) => {
    events.forEach((event, eventIndex) => {
      const indices = event.notes.map((_, noteIndex) => noteIndex);
      const pending = pendingTies[clef];
      if (pending && !event.isRest) {
        if (pending.row === row) {
          new StaveTie({ first_note: pending.note, last_note: tickables[eventIndex], first_indices: indices, last_indices: indices }).setContext(context).draw();
        } else {
          new StaveTie({ first_note: pending.note, first_indices: indices, last_indices: indices }).setContext(context).draw();
          new StaveTie({ last_note: tickables[eventIndex], first_indices: indices, last_indices: indices }).setContext(context).draw();
        }
      }
      pendingTies[clef] = event.tieToNext ? { note: tickables[eventIndex], row } : null;
    });
  };

  measures.forEach((measure, index) => {
    const row = Math.floor(index / perRow);
    const column = index % perRow;
    const isRowStart = column === 0;
    const x = PADDING_X + (isRowStart ? 0 : FIRST_MEASURE_EXTRA_WIDTH + column * measureWidth);
    const width = measureWidth + (isRowStart ? FIRST_MEASURE_EXTRA_WIDTH : 0);
    const y = row * ROW_HEIGHT;

    const trebleStave = new Stave(x, y + TREBLE_OFFSET_Y, width);
    const bassStave = new Stave(x, y + BASS_OFFSET_Y, width);
    if (isRowStart) {
      trebleStave.addClef('treble').addKeySignature(keySignature);
      bassStave.addClef('bass').addKeySignature(keySignature);
    }
    if (index === 0) {
      trebleStave.addTimeSignature(`${beats}/${beatUnit}`);
      bassStave.addTimeSignature(`${beats}/${beatUnit}`);
    }
    const noteStartX = Math.max(trebleStave.getNoteStartX(), bassStave.getNoteStartX());
    trebleStave.setNoteStartX(noteStartX);
    bassStave.setNoteStartX(noteStartX);
    trebleStave.setContext(context).draw();
    bassStave.setContext(context).draw();
    if (isRowStart) {
      new StaveConnector(trebleStave, bassStave).setType(StaveConnector.type.BRACE).setContext(context).draw();
    }
    new StaveConnector(trebleStave, bassStave).setType(StaveConnector.type.SINGLE_LEFT).setContext(context).draw();

    const trebleNotes = buildTickables(measure.treble, 'treble');
    const bassNotes = buildTickables(measure.bass, 'bass');
    const makeVoice = (notes) =>
      new Voice({ num_beats: beats, beat_value: beatUnit }).setMode(Voice.Mode.SOFT).addTickables(notes);
    const trebleVoice = makeVoice(trebleNotes);
    const bassVoice = makeVoice(bassNotes);
    const beams = [...Beam.generateBeams(trebleNotes), ...Beam.generateBeams(bassNotes)];
    const formatter = new Formatter();
    formatter.joinVoices([trebleVoice]);
    formatter.joinVoices([bassVoice]);
    formatter.format([trebleVoice, bassVoice], trebleStave.getNoteEndX() - noteStartX - PADDING_X);
    trebleVoice.draw(context, trebleStave);
    bassVoice.draw(context, bassStave);
    beams.forEach((beam) => beam.setContext(context).draw());
    drawTies('treble', measure.treble, trebleNotes, row);
    drawTies('bass', measure.bass, bassNotes, row);

    positions.push({ startX: noteStartX, endX: x + width, y });
  });

  return { positions, measureSeconds };
};

const SheetMusicScore = () => {
  const sheetId = useWorkspaceStore((state) => state.sheet?.id);
  const [result, setResult] = useState({ sheetId: null, score: null, error: null });
  const scrollRef = useRef(null);
  const scoreRef = useRef(null);
  const cursorRef = useRef(null);
  const score = result.sheetId === sheetId ? result.score : null;
  const error = result.sheetId === sheetId ? result.error : null;

  useEffect(() => {
    if (!sheetId) return undefined;
    const controller = new AbortController();
    getSheetScore(sheetId, { signal: controller.signal })
      .then((data) => setResult({ sheetId, score: data, error: null }))
      .catch((requestError) => {
        if (!controller.signal.aborted) setResult({ sheetId, score: null, error: requestError });
      });
    return () => controller.abort();
  }, [sheetId]);

  useEffect(() => {
    const scroll = scrollRef.current;
    const container = scoreRef.current;
    const cursor = cursorRef.current;
    if (!score || !scroll || !container || !cursor) return undefined;

    let layout = null;
    let drawnWidth = 0;
    let frame;
    let lastY = null;

    const render = () => {
      if (container.clientWidth === drawnWidth || container.clientWidth === 0) return;
      drawnWidth = container.clientWidth;
      container.replaceChildren();
      layout = drawScore(container, score);
      lastY = null;
    };

    const paint = () => {
      if (layout?.positions.length) {
        const position = getSongTime() / layout.measureSeconds;
        const index = Math.min(Math.floor(position), layout.positions.length - 1);
        const measure = layout.positions[Math.max(index, 0)];
        const progress = Math.min(Math.max(position - index, 0), 1);
        cursor.style.transform = `translate(${measure.startX + progress * (measure.endX - measure.startX)}px, ${measure.y + CURSOR_OFFSET_Y}px)`;
        if (measure.y !== lastY) {
          scroll.scrollTop = measure.y;
          lastY = measure.y;
        }
      }
      frame = requestAnimationFrame(paint);
    };

    const observer = new ResizeObserver(render);
    observer.observe(container);
    render();
    frame = requestAnimationFrame(paint);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      container.replaceChildren();
    };
  }, [score]);

  if (error) {
    return (
      <p role="alert" className="absolute inset-0 m-0 flex items-center justify-center px-4 text-center text-sm font-bold text-[var(--color-danger)]">
        {error.message}
      </p>
    );
  }

  return (
    <div ref={scrollRef} className="absolute inset-0 overflow-y-auto">
      <div className="relative">
        <div ref={scoreRef} />
        <span
          ref={cursorRef}
          aria-hidden="true"
          style={{ height: CURSOR_HEIGHT }}
          className="pointer-events-none absolute left-0 top-0 w-0.5 bg-[var(--color-brand)]"
        />
      </div>
    </div>
  );
};

export default SheetMusicScore;
