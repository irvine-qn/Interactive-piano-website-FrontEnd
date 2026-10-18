# TASK_DECOMPOSITION.md - Feature: Piano Workspace (Free Play)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-01A** | Khởi tạo Kiến trúc | Tạo folder `src/features/workspace`. Khởi tạo Zustand Store (`useWorkspaceStore.js`) với state `currentMode: 'FREE_PLAY'` và `activeKeys: []`. Tạo `WorkspacePage.jsx` rỗng. | To Do |
| **T-01B** | UI Bàn phím | Tạo `PianoKeyboard.jsx` và `Key.jsx`. Sử dụng Tailwind CSS xếp layout các phím. Tính toán `z-index` và `position: absolute` chuẩn xác để phím đen nằm đè lên phím trắng. | To Do |
| **T-01C** | Audio Engine | Cài đặt `tone` và `@tonejs/piano`. Tạo `audio/ToneEngine.js` chứa logic khởi tạo Sampler và load Soundfont. Viết hàm `playNote(note)` và `releaseNote(note)`. | To Do |
| **T-01D** | Tương tác Chuột | Gắn `onMouseDown`, `onMouseUp`, `onMouseLeave` vào `Key.jsx`. Gọi Audio Engine phát tiếng và cập nhật mảng `activeKeys` trong Zustand để đổi màu phím. | To Do |
| **T-01E** | Tương tác Bàn phím | Map phím vật lý (A, S, D, W) với nốt nhạc tương ứng. Dùng Global Event Listener cho `keydown`/`keyup`. Phải chặn sự kiện auto-repeat của HĐH khi đè phím lâu. | To Do |
| **T-01F** | Tối ưu & Review | Clear Memory Leak (remove Event Listeners khi unmount). Đẩy code lên nhánh `feature/piano-workspace` và mở Pull Request cho teammate review. | To Do |