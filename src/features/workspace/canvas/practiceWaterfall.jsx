import { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { KEY_LAYOUT } from '../config/keyLayout';
import { getSongTime } from '../audio/songClock';

// --- THÔNG SỐ VẼ (giống waterfall HomePage) ---
const PIXELS_PER_SECOND = 150; // Tốc độ rơi: 1 giây nốt đi được 150 pixel
const ROW_HEIGHT = 24; // Khoảng cách lưới ngang
const HIT_LINE_HEIGHT = 4; // Vạch cam ở đáy: nốt chạm vạch = phím sáng
const SHADOW_OFFSET = 2; // Bóng cứng của khối nốt
const LABEL_SIZES = [10, 8]; // Cỡ chữ nhãn: thử 10px trước, hẹp thì 8px
const LABEL_PADDING = 3; // Viền chữ dày 3px -> mỗi bên lố 1.5px
const LABEL_MIN_HEIGHT = 16; // Khối thấp hơn thì không ghi tên nốt

// Màu lấy từ CSS variables (index.css) để đổi theme chỉ cần sửa token
const readColors = (element) => {
  const style = getComputedStyle(element);
  const read = (name) => style.getPropertyValue(name).trim();
  return {
    ink: read('--color-ink'),
    brand: read('--color-brand'),
    paper: read('--color-surface-paper'),
    grid: read('--color-line-grid'),
    octave: read('--color-line-lane-octave'),
    label: read('--color-neutral-white'),
    fontFamily: read('--font-sans') || 'sans-serif', // Cùng font với trang (Inter)
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
    // Bàn phím render cùng lượt với canvas (cùng trang) nên lúc effect chạy vùng phím đã có trong DOM
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

      // Toạ độ X lấy từ KEY_LAYOUT (cùng công thức với bàn phím), quy đổi theo vị trí vùng phím (data-keybed)
      // so với canvas, nên viền/lề của khung bàn phím khác canvas vẫn rơi đúng phím.
      // Phím đặt bằng left/width % tính trong phần bên trong viền của vùng phím, nên trừ viền trái/phải
      const bed = keybed ? keybed.getBoundingClientRect() : rect;
      const bedStyle = keybed ? getComputedStyle(keybed) : null;
      const borderLeft = bedStyle ? parseFloat(bedStyle.borderLeftWidth) || 0 : 0;
      const borderRight = bedStyle ? parseFloat(bedStyle.borderRightWidth) || 0 : 0;
      const offset = bed.left + borderLeft - rect.left;
      const bedWidth = bed.width - borderLeft - borderRight;
      keyMap = {};
      octaveLines = [];
      labelCache.clear(); // Bề rộng phím đổi thì nhãn phải đo lại
      KEY_LAYOUT.forEach((key) => {
        const x = offset + (key.left / 100) * bedWidth;
        keyMap[key.note] = { x, width: (key.width / 100) * bedWidth, isBlack: key.isBlack };
        // Vạch phân quãng tám ở mép trái mỗi phím Đô
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

    // Khối nốt: bóng cứng -> gradient theo tay -> viền ink -> tên nốt (nếu đủ chỗ)
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

      const label = height >= LABEL_MIN_HEIGHT ? fitLabel(note.name, width) : null;
      if (label) {
        ctx.font = label.font;
        const labelY = top + height - 5; // Tên nốt nằm sát đáy khối, chỗ sắp chạm phím
        // Chữ lấn sang bóng thì dời tâm theo, để chữ luôn nằm trong khối + bóng
        const centerX = x + (label.overShadow ? width + SHADOW_OFFSET : width) / 2;
        ctx.lineWidth = 3;
        ctx.strokeText(label.text, centerX, labelY);
        ctx.fillStyle = colors.label;
        ctx.fillText(label.text, centerX, labelY);
      }
    };

    // Khối hẹp (nốt đen) thì thu gọn nhãn dần: tên đầy đủ 10px -> 8px -> bỏ số quãng -> không ghi.
    // Mỗi cách thử vừa trong khối trước, không vừa thì cho lấn sang phần bóng cứng bên phải.
    // Kết quả theo (tên nốt, bề rộng) được nhớ lại để không đo chữ mỗi khung hình
    const labelCache = new Map();
    const labelFont = (size) => `700 ${size}px ${colors.fontFamily}`;
    // Inter tải từ Google Fonts (display=swap): lúc đầu chữ được đo bằng font dự phòng, tải xong phải đo lại
    const clearLabelCache = () => labelCache.clear();
    document.fonts?.addEventListener('loadingdone', clearLabelCache);
    const fitLabel = (name, width) => {
      const space = Math.floor(width); // Làm tròn xuống để chữ không bao giờ tràn ra ngoài
      const cacheKey = `${name}|${space}`;
      if (labelCache.has(cacheKey)) return labelCache.get(cacheKey);
      const pitch = name.replace(/-?\d+$/, '');
      const options = [
        { text: name, font: labelFont(LABEL_SIZES[0]) },
        { text: name, font: labelFont(LABEL_SIZES[1]) },
        { text: pitch, font: labelFont(LABEL_SIZES[1]) },
      ];
      let result = null;
      for (const option of options) {
        ctx.font = option.font;
        const needed = ctx.measureText(option.text).width + LABEL_PADDING;
        if (needed <= space) result = { ...option, overShadow: false };
        else if (needed <= space + SHADOW_OFFSET) result = { ...option, overShadow: true };
        if (result) break;
      }
      labelCache.set(cacheKey, result);
      return result;
    };

    const renderLoop = () => {
      // Đáy vùng rơi là vạch hit-line, nốt chạm vạch đúng lúc phím sáng
      const hitY = canvasHeight - HIT_LINE_HEIGHT;
      drawBackground(hitY);

      // Chưa tải xong bài thì chỉ vẽ nền
      if (notes) {
        // Thời gian bài (giây ở tốc độ gốc) suy từ ticks của Transport -> đồng bộ với Play/Pause/Seek/tốc độ và âm thanh.
        // Khoảng cách rơi tính theo thời gian bài nên chơi chậm thì nốt rơi chậm theo
        const currentTime = getSongTime();

        // Chỉ vẽ những nốt đang nằm trong khung hình
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
        ctx.textAlign = 'center';
        ctx.lineJoin = 'round';
        // Nốt phím trắng vẽ trước, nốt phím đen đè lên trên (giống phím đen nằm trên phím trắng)
        visible.forEach((v) => !v.keyData.isBlack && drawNote(v.note, v.keyData, v.top, v.height));
        visible.forEach((v) => v.keyData.isBlack && drawNote(v.note, v.keyData, v.top, v.height));
        ctx.restore();
      }

      ctx.fillStyle = colors.brand;
      ctx.fillRect(0, hitY, canvasWidth, HIT_LINE_HEIGHT);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Tính lại khi canvas hoặc vùng phím đổi kích thước (ResizeObserver gọi ngay lần đầu khi bắt đầu theo dõi)
    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });
    resizeObserver.observe(container);
    if (keybed) resizeObserver.observe(keybed);

    renderLoop();

    return () => {
      resizeObserver.disconnect();
      document.fonts?.removeEventListener('loadingdone', clearLabelCache);
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
