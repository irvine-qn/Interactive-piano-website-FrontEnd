import React, { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { playNote } from '../audio/toneEngine';
import sheetData from '../audio/merry-christmas.json'; 

const WaterfallCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { currentMode } = useWorkspaceStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
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

      const keyElements = document.querySelectorAll('[data-note]');
      keyMap = {}; 
      
      keyElements.forEach(el => {
        const note = el.getAttribute('data-note');
        const keyRect = el.getBoundingClientRect();
        
        keyMap[note] = {
          x: keyRect.left - rect.left,
          width: keyRect.width,
          isBlack: note.includes('#')
        };
      });
    };

    // --- CÁC THÔNG SỐ VẬT LÝ CHO WATERFALL ---
    const PIXELS_PER_SECOND = 150; // Tốc độ rơi: 1 giây nốt đi được 150 pixel
    let startTime = Date.now();    // Cột mốc thời gian bắt đầu bài nhạc
    let playedNotes = new Set();   // Bộ nhớ tạm để đánh dấu các nốt đã phát tiếng

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Thời gian hiện tại của bài hát (bằng giây)
      const currentTime = (Date.now() - startTime) / 1000;

      // CHỈ TOÁN: Lọc ra những nốt ĐANG NẰM TRONG KHUNG HÌNH để tối ưu hiệu suất
      const visibleNotes = sheetData.notes.filter(note => {
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

      // NHỊP 3: KÍCH HOẠT ÂM THANH NẾU LÀ AUTO_PLAY
      if (currentMode === 'AUTO_PLAY') {
        sheetData.notes.forEach((note, index) => {
          // Nếu bài nhạc chạy qua thời điểm đánh nốt VÀ nốt chưa được đánh
          if (currentTime >= note.time && !playedNotes.has(index)) {
            playNote(note.name);
            playedNotes.add(index);
          }
        });
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const timeoutId = setTimeout(() => {
      updateLayout();
      startTime = Date.now(); // Reset lại thời gian khi DOM đã sẵn sàng
    }, 50);

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });
    resizeObserver.observe(container);

    renderLoop();

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentMode]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-[#111] bg-opacity-10">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default WaterfallCanvas;