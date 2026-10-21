# TASK_DECOMPOSITION.md - Feature: Piano Workspace (Free Play)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-01A** | Khởi tạo Kiến trúc | Tạo folder `src/features/workspace`. Khởi tạo Zustand Store (`useWorkspaceStore.js`) với state `currentMode: 'FREE_PLAY'` và `activeKeys: []`. Tạo `WorkspacePage.jsx` rỗng. | Done |
| **T-01B** | UI Bàn phím | Tạo `PianoKeyboard.jsx` và `Key.jsx`. Sử dụng Tailwind CSS xếp layout các phím. Tính toán `z-index` và `position: absolute` chuẩn xác để phím đen nằm đè lên phím trắng. | Done |
| **T-01C** | Audio Engine | Cài đặt `tone` và `@tonejs/piano`. Tạo `audio/ToneEngine.js` chứa logic khởi tạo Sampler và load Soundfont. Viết hàm `playNote(note)` và `releaseNote(note)`. | Done |
| **T-01D** | Tương tác Chuột | Gắn `onMouseDown`, `onMouseUp`, `onMouseLeave` vào `Key.jsx`. Gọi Audio Engine phát tiếng và cập nhật mảng `activeKeys` trong Zustand để đổi màu phím. | Done |
| **T-01E** | Tương tác Bàn phím | Map phím vật lý (A, S, D, W) với nốt nhạc tương ứng. Dùng Global Event Listener cho `keydown`/`keyup`. Phải chặn sự kiện auto-repeat của HĐH khi đè phím lâu. | Done |
| **T-01F** | Tối ưu & Review | Clear Memory Leak (remove Event Listeners khi unmount). Đẩy code lên nhánh `feature/piano-workspace` và mở Pull Request cho teammate review. | To Do |
| **T-02** | Control Bar | Cài đặt `lucide-react`. Dựng UI thanh điều khiển gồm cụm Mode Selector (Tự Do, Luyện Tập, Tự Động) và cụm Playback (Play, Pause, Volume). Nối state `currentMode` từ Zustand để highlight nút đang chọn. | Done |
| **T-03A** | Waterfall Layout | Bọc lại Layout của WorkspacePage. Đưa khu vực Canvas và Piano Keyboard vào chung một `Shared Scroll Container` (overflow-x-auto). Căn chỉnh để chiều rộng Canvas luôn bằng chính xác chiều rộng của cụm Piano. | Done |
| **T-03B** | Canvas Setup | Tạo `WaterfallCanvas.jsx`. Khởi tạo context 2D. Xử lý sự kiện `resize` để tự động tính toán lại `width` và `height` của Canvas dựa trên Container mà không làm mờ pixel. | Done |
| **T-03C** | Tọa độ & Rendering Loop | Viết logic tính toán trục X: Dựa vào danh sách phím để map chính xác từng nốt nhạc (C3, D3...) với tọa độ X và Width tương ứng trên Canvas. Dùng `requestAnimationFrame` tạo vòng lặp vẽ một khối nốt nhạc rơi thử nghiệm từ trên xuống đáy. | Done |
| **T-03D** | Xử lý file JSON Sheet | Tạo data mẫu (hoặc file JSON bài hát ngắn). Viết hàm parser để đọc dữ liệu: `note` (cao độ), `startTime` (thời điểm bắt đầu), `duration` (độ dài nốt). | To Do |
| **T-03E** | Waterfall Engine Core | Hoàn thiện Engine vẽ. Tính toán trục Y dựa trên `startTime`, `currentTime` (từ audio) và `fallSpeed` (tốc độ rơi). Vẽ hình chữ nhật với màu sắc phân biệt (phím đen/phím trắng) cho từng nốt theo thời gian thực. | To Do |