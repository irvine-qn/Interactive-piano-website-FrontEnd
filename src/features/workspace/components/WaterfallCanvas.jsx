import React, { useRef, useEffect } from 'react';

const WaterfallCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeAndDraw = () => {
      // 1. Lấy kích thước thực tế của container
      const { width, height } = container.getBoundingClientRect();
      
      // 2. Lấy tỉ lệ điểm ảnh của màn hình (DPR)
      const dpr = window.devicePixelRatio || 1;

      // 3. Set kích thước vật lý của Canvas (để vẽ không bị mờ)
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // 4. Set kích thước hiển thị bằng CSS
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // 5. Đồng bộ hệ tọa độ vẽ theo DPR
      ctx.scale(dpr, dpr);

      // --- KHU VỰC VẼ TEST (Sẽ xóa ở T-03C) ---
      // Xóa toàn bộ canvas trước khi vẽ lại
      ctx.clearRect(0, 0, width, height);

      // Vẽ dòng chữ trung tâm
      ctx.fillStyle = '#ff7a1a';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Waterfall Canvas Đã Sẵn Sàng!', width / 2, height / 2);
      
      // Vẽ thử một "nốt nhạc" đang rơi
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(width / 2 - 25, 50, 50, 120); // x, y, width, height
    };

    // Dùng ResizeObserver để theo dõi sự thay đổi kích thước của container
    const resizeObserver = new ResizeObserver(() => {
      // Dùng requestAnimationFrame để tối ưu hiệu suất khi kéo thả cửa sổ liên tục
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(resizeAndDraw);
    });

    resizeObserver.observe(container);

    // Dọn dẹp memory leak khi component bị hủy
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    // Container bọc ngoài sẽ chiếm trọn không gian được cấp
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

export default WaterfallCanvas;