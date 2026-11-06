import sheetCoverDots from '../../../assets/virtual-piano-assets/sheet-cover-dots.svg';
import { DIFFICULTY_META } from '../config/difficulty';
import { COVER_BG } from '../config/cover';
import PrivateBadge from './PrivateBadge';


const createRandom = (seedText) => {
  let seed = [...seedText].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 7);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const STAFF_LEFT = 10;
const STAFF_RIGHT = 310;
const LINE_GAP = 9.5;
const STAFF_TOPS = [64, 142];
const MEASURE_SLOTS = 6;
const STEM_LENGTH = 27;
const NOTE_RX = 4.8;
const NOTE_RY = 3.6;

const buildStaffNotes = (random, staffTop) => {
  const staffBottom = staffTop + LINE_GAP * 4;
  const middleY = staffTop + LINE_GAP * 2;
  const measureWidth = (STAFF_RIGHT - STAFF_LEFT - 40) / 2;
  const notes = [];
  const beams = [];

  for (let measure = 0; measure < 2; measure++) {
    const measureLeft = STAFF_LEFT + 40 + measure * measureWidth;
    let slot = 0;
    while (slot < MEASURE_SLOTS) {
      const x = measureLeft + 12 + slot * ((measureWidth - 20) / MEASURE_SLOTS);
      const y = staffBottom - Math.floor(random() * 9) * (LINE_GAP / 2);
      const canBeam = slot < MEASURE_SLOTS - 1 && random() < 0.35;

      if (canBeam) {
        const x2 = x + (measureWidth - 20) / MEASURE_SLOTS;
        const y2 = staffBottom - Math.floor(random() * 9) * (LINE_GAP / 2);
        const stemUp = (y + y2) / 2 > middleY;
        const beamY = stemUp ? Math.min(y, y2) - STEM_LENGTH : Math.max(y, y2) + STEM_LENGTH;
        const offset = stemUp ? NOTE_RX - 0.6 : -(NOTE_RX - 0.6);
        notes.push({ x, y, stemUp, stemEnd: beamY, hollow: false });
        notes.push({ x: x2, y: y2, stemUp, stemEnd: beamY, hollow: false });
        beams.push({ x1: x + offset, x2: x2 + offset, y: beamY });
        slot += 2;
      } else {
        const stemUp = y > middleY;
        notes.push({ x, y, stemUp, stemEnd: stemUp ? y - STEM_LENGTH : y + STEM_LENGTH, hollow: random() < 0.15 });
        slot += 1;
      }
    }
  }
  return { staffTop, notes, beams, barX: STAFF_LEFT + 40 + measureWidth };
};

const buildCoverArt = (id) => {
  const random = createRandom(id);
  const tilt = Number((random() * 5 - 2.5).toFixed(2));
  return { tilt, staves: STAFF_TOPS.map((staffTop) => buildStaffNotes(random, staffTop)) };
};

const TrebleClef = ({ x, staffTop }) => (
  <path
    transform={`translate(${x} ${staffTop}) scale(${LINE_GAP / 8})`}
    d="M6 -9 C-2 3, 14 12, 6 22 C-2 30, -1 38, 7 38 C15 38, 14 26, 6 27 C0 28, 1 35, 6 34
       M6 -9 L5 44 C5 50, -1 50, 0 45"
    fill="none"
    strokeWidth="1.9"
    strokeLinecap="round"
  />
);

const Staff = ({ staff }) => {
  const { staffTop, notes, beams, barX } = staff;
  return (
    <g>
      {[0, 1, 2, 3, 4].map((line) => (
        <line key={line} x1={STAFF_LEFT} x2={STAFF_RIGHT} y1={staffTop + line * LINE_GAP} y2={staffTop + line * LINE_GAP} strokeWidth="1" />
      ))}
      {[STAFF_LEFT, barX, STAFF_RIGHT].map((x) => (
        <line key={x} x1={x} x2={x} y1={staffTop} y2={staffTop + LINE_GAP * 4} strokeWidth="1.2" />
      ))}
      <TrebleClef x={STAFF_LEFT + 6} staffTop={staffTop} />
      {notes.map((note) => {
        const stemX = note.stemUp ? note.x + NOTE_RX - 0.6 : note.x - (NOTE_RX - 0.6);
        return (
          <g key={`${note.x}-${note.y}`}>
            <line x1={stemX} x2={stemX} y1={note.y} y2={note.stemEnd} strokeWidth="1.6" />
            <ellipse
              cx={note.x}
              cy={note.y}
              rx={NOTE_RX}
              ry={NOTE_RY}
              transform={`rotate(-20 ${note.x} ${note.y})`}
              fill={note.hollow ? 'var(--color-surface-card)' : 'var(--color-ink)'}
              strokeWidth="1.4"
            />
          </g>
        );
      })}
      {beams.map((beam) => (
        <line key={`${beam.x1}-${beam.y}`} x1={beam.x1} x2={beam.x2} y1={beam.y} y2={beam.y} strokeWidth="4" />
      ))}
    </g>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const meta = DIFFICULTY_META[difficulty];
  if (!meta) return null;
  return (
    <span className={`flex items-center gap-1.5 border-[1.5px] border-[var(--color-ink)] px-2 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
};

const SheetCover = ({ sheet }) => {
  const { tilt, staves } = buildCoverArt(sheet.id);

  return (
    <div className={`relative aspect-[8/5] w-full overflow-hidden ${COVER_BG[sheet.coverColor] ?? COVER_BG.yellow}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: `url("${sheetCoverDots}")` }}
      />

      <div
        className="absolute left-1/2 top-[52%] w-[70%] border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]"
        style={{ transform: `translate(-50%, -50%) rotate(${tilt}deg)` }}
      >
        <svg aria-hidden="true" viewBox="0 0 320 220" className="block w-full" stroke="var(--color-ink)" fill="var(--color-ink)">
          <rect x="126" y="16" width="68" height="6" fill="var(--color-neutral-600)" stroke="none" />
          <rect x="138" y="27" width="44" height="3.5" fill="var(--color-neutral-300)" stroke="none" />
          {staves.map((staff) => (
            <Staff key={staff.staffTop} staff={staff} />
          ))}
        </svg>
      </div>

      <div className="absolute left-2.5 top-2.5">
        <DifficultyBadge difficulty={sheet.difficulty} />
      </div>
      <div className="absolute right-2.5 top-2.5 flex gap-1.5">
        {/* Bài upload chỉ mình thấy (U-FE-10) */}
        {sheet.visibility === 'PRIVATE' && <PrivateBadge />}
        <span className="border-[1.5px] border-[var(--color-ink)] bg-[var(--color-surface-card)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-brand-strong)]">
          MIDI
        </span>
      </div>
    </div>
  );
};

export default SheetCover;
