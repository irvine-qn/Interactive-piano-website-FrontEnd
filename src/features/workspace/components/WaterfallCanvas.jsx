import React, { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import * as Tone from 'tone';
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

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Chế độ Tự Do không có sheet nhạc nên không vẽ thác nốt
      if (currentMode === 'FREE_PLAY') {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // Thời gian bài hát lấy từ Tone.Transport -> đồng bộ với Play/Pause/Seek và âm thanh
      const currentTime = Tone.Transport.seconds;

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

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const timeoutId = setTimeout(() => {
      updateLayout();
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