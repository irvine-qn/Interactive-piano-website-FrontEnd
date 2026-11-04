import { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import * as Tone from 'tone';
import { KEY_LAYOUT } from '../config/keyLayout';

const WaterfallCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const notes = useWorkspaceStore((state) => state.sheet?.notes);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    // Bàn phím render cùng lượt với canvas (cùng trang) nên lúc effect chạy vùng phím đã có trong DOM
    const keybed = document.querySelector('[data-keybed]');
    let animationFrameId;
    let keyMap = {}; 
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
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

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
      KEY_LAYOUT.forEach((key) => {
        keyMap[key.note] = {
          x: offset + (key.left / 100) * bedWidth,
          width: (key.width / 100) * bedWidth,
          isBlack: key.isBlack,
        };
      });
    };

    // --- CÁC THÔNG SỐ VẬT LÝ CHO WATERFALL ---
    const PIXELS_PER_SECOND = 150; // Tốc độ rơi: 1 giây nốt đi được 150 pixel

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Chưa tải xong bài thì chưa có nốt để vẽ
      if (!notes) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Thời gian bài hát lấy từ Tone.Transport -> đồng bộ với Play/Pause/Seek và âm thanh
      const currentTime = Tone.Transport.seconds;

      // CHỈ TOÁN: Lọc ra những nốt ĐANG NẰM TRONG KHUNG HÌNH để tối ưu hiệu suất
      const visibleNotes = notes.filter(note => {
        const noteHeight = note.duration * PIXELS_PER_SECOND;
        const distanceToBottom = (note.time - currentTime) * PIXELS_PER_SECOND;
        const yPos = canvasHeight - distanceToBottom - noteHeight;
        
        return yPos < canvasHeight && (yPos + noteHeight) > 0;
      });

      // NHỊP 1: VẼ LỚP NỐT TRẮNG BÊN DƯỚI
      visibleNotes.forEach(note => {
        const keyData = keyMap[note.name];
        if (keyData && !keyData.isBlack) {
          const noteHeight = note.duration * PIXELS_PER_SECOND;
          const distanceToBottom = (note.time - currentTime) * PIXELS_PER_SECOND;
          const yPos = canvasHeight - distanceToBottom - noteHeight; // Tính toán vị trí rơi

          ctx.fillStyle = note.hand === 'left' ? '#93c5fd' : '#ffb07a'; 
          ctx.fillRect(keyData.x, yPos, keyData.width, noteHeight);
        }
      });

      // NHỊP 2: VẼ LỚP NỐT ĐEN ĐÈ LÊN TRÊN
      visibleNotes.forEach(note => {
        const keyData = keyMap[note.name];
        if (keyData && keyData.isBlack) {
          const noteHeight = note.duration * PIXELS_PER_SECOND;
          const distanceToBottom = (note.time - currentTime) * PIXELS_PER_SECOND;
          const yPos = canvasHeight - distanceToBottom - noteHeight;

          ctx.fillStyle = note.hand === 'left' ? '#3b82f6' : '#e8630a'; 
          ctx.fillRect(keyData.x, yPos, keyData.width, noteHeight);
        }
      });

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
      cancelAnimationFrame(animationFrameId);
    };
  }, [notes]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[#111]/10">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default WaterfallCanvas;
