import React, { useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const WaterfallCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { currentMode } = useWorkspaceStore(); // 1. Lắng nghe sự thay đổi của Mode

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

      // Quét DOM tìm các phím đàn
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

    let yPos = -100; 

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      yPos += 3; 
      if (yPos > canvasHeight) yPos = -100; 

      const testNotes = ['G2', 'A#2', 'C4', 'D#4'];
      
      // NHỊP 1: VẼ CÁC NỐT TRẮNG TRƯỚC (Lớp dưới)
      testNotes.forEach(note => {
        const keyData = keyMap[note];
        if (keyData && !keyData.isBlack) {
          const octave = parseInt(note.slice(-1));
          const isLeftHand = octave < 4; 
          
          // Phím trắng: Dùng màu sáng
          ctx.fillStyle = isLeftHand ? '#93c5fd' : '#ffb07a'; 
          ctx.fillRect(keyData.x, yPos, keyData.width, 80);
        }
      });

      // NHỊP 2: VẼ CÁC NỐT ĐEN SAU (Đè lên lớp trên)
      testNotes.forEach(note => {
        const keyData = keyMap[note];
        if (keyData && keyData.isBlack) {
          const octave = parseInt(note.slice(-1));
          const isLeftHand = octave < 4; 
          
          // Phím đen: Dùng màu đậm
          ctx.fillStyle = isLeftHand ? '#3b82f6' : '#e8630a'; 
          ctx.fillRect(keyData.x, yPos, keyData.width, 80);
        }
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // 2. Dùng setTimeout để đảm bảo DOM của PianoKeyboard đã render xong các phím mới trước khi đo đạc
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
  }, [currentMode]); // 3. Thêm currentMode vào Dependency Array. Mỗi khi đổi mode, useEffect sẽ chạy lại để vẽ lại tọa độ.

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default WaterfallCanvas;