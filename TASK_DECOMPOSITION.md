# TASK_DECOMPOSITION.md 

## Feature: Piano HomePage 

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

> **Quy ước chung**
> - Mã task có tiền tố repo: `[BE]` = `Interactive-piano-website-Backend`, `[FE]` = `Interactive-piano-website-FrontEnd`. File WBS duy nhất nằm ở repo FE.
> - Mỗi sub-task chỉ đụng vài file, có thể review/commit độc lập. Cột Contract ghi rõ file bị ảnh hưởng và task phụ thuộc (`Phụ thuộc:`).
> - Không sửa code của Feature HomePage (`pages/HomePage.jsx`, `features/home/*`). Code dùng chung với Home (`features/piano/audio/toneEngine.js`, `components/common/*`, `index.css`, BE `/piano`, `/frequencies`) chỉ được sửa nếu không đổi hành vi của Home.
> - Task `[BE]` có thêm/đổi API thì cập nhật luôn mục *Available API* trong README của BE.
> - Thứ tự thực hiện phiên này: **Hạ tầng chung → Sheet Library (BE → FE) → Piano Workspace**. Feature User: pending.

## Hạ tầng chung (Common)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **C-01** `[BE]` | API prefix `/api/v1` | Đổi mount point trong `src/app.js` từ `/api` sang `/api/v1` cho `workspace.routes` và `sheets.routes`. Cập nhật toàn bộ ví dụ trong README. Phải merge cùng lúc với C-02. | Done |
| **C-02** `[FE]` | axios baseURL `/api/v1` | Sửa `src/lib/axios.js`: `baseURL = ${API_BASE_URL}/api/v1`. Không sửa `features/home/api/pianoApi.js` (đường dẫn tương đối `/piano` vẫn đúng). Kiểm tra Home vẫn tải được cấu hình piano/metronome. Phụ thuộc: C-01. | Done |
| **C-03** `[FE]` | Chuẩn hoá thư mục `pages/` | Chuyển `pages/sheet/WorkspacePage.jsx` thành `pages/WorkspacePage.jsx`, xoá thư mục `pages/sheet/`, sửa import trong `routes/AppRoutes.jsx`. Trang sau này đặt phẳng trong `pages/` (`LibraryPage`, `NotFoundPage`, ...). | Done |
| **C-04** `[FE]` | Navbar: chữ thương hiệu mới | Trong `components/common/navbar.jsx`, thay ảnh `fiano-logo.png` bằng chữ `FIANO` + dấu chấm màu `--color-brand` (giống tầng 1 hiện tại của WorkspacePage), dùng design token. **Giữ nguyên con cáo mascot** và vị trí. Không đổi menu và ô search. | To Do |
| **C-05** `[FE]` | Tách bundle theo route | Dùng `React.lazy` + `Suspense` trong `routes/AppRoutes.jsx` cho các page để Tone.js không nằm trong bundle chính. So sánh kích thước `dist/assets/*.js` trước và sau. Làm cuối phiên. | To Do |

## Feature: Piano Workspace 

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-01A** | Khởi tạo Kiến trúc | Tạo folder `src/features/workspace`. Khởi tạo Zustand Store (`useWorkspaceStore.js`) với state `currentMode: 'FREE_PLAY'` và `activeKeys: []`. Tạo `WorkspacePage.jsx` rỗng. | Done |
| **T-01B** | UI Bàn phím | Tạo `PianoKeyboard.jsx` và `Key.jsx`. Sử dụng Tailwind CSS xếp layout các phím. Tính toán `z-index` và `position: absolute` chuẩn xác để phím đen nằm đè lên phím trắng. | Done |
| **T-01C** | Audio Engine | Cài đặt `tone` và `@tonejs/piano`. Tạo `audio/ToneEngine.js` chứa logic khởi tạo Sampler và load Soundfont. Viết hàm `playNote(note)` và `releaseNote(note)`. | Done |
| **T-01D** | Tương tác Chuột | Gắn `onMouseDown`, `onMouseUp`, `onMouseLeave` vào `Key.jsx`. Gọi Audio Engine phát tiếng và cập nhật mảng `activeKeys` trong Zustand để đổi màu phím. | Done |
| **T-01E** | Tương tác Bàn phím | Map phím vật lý (A, S, D, W) với nốt nhạc tương ứng. Dùng Global Event Listener cho `keydown`/`keyup`. Phải chặn sự kiện auto-repeat của HĐH khi đè phím lâu. | Done |
| **T-02** | Control Bar | Cài đặt `lucide-react`. Dựng UI thanh điều khiển gồm cụm Mode Selector (Tự Do, Luyện Tập, Tự Động) và cụm Playback (Play, Pause, Volume). Nối state `currentMode` từ Zustand để highlight nút đang chọn. | Done |
| **T-03A** | Waterfall Layout | Bọc lại Layout của WorkspacePage. Đưa khu vực Canvas và Piano Keyboard vào chung một `Shared Scroll Container` (overflow-x-auto). Căn chỉnh để chiều rộng Canvas luôn bằng chính xác chiều rộng của cụm Piano. | Done |
| **T-03B** | Canvas Setup | Tạo `WaterfallCanvas.jsx`. Khởi tạo context 2D. Xử lý sự kiện `resize` để tự động tính toán lại `width` và `height` của Canvas dựa trên Container mà không làm mờ pixel. | Done |
| **T-03C** | Tọa độ & Rendering Loop | Viết logic tính toán trục X: Dựa vào danh sách phím để map chính xác từng nốt nhạc (C3, D3...) với tọa độ X và Width tương ứng trên Canvas. Dùng `requestAnimationFrame` tạo vòng lặp vẽ một khối nốt nhạc rơi thử nghiệm từ trên xuống đáy. | Done |
| **T-03D** | Xử lý file JSON Sheet | Tạo data mẫu (hoặc file JSON bài hát ngắn). Viết hàm parser để đọc dữ liệu: `note` (cao độ), `startTime` (thời điểm bắt đầu), `duration` (độ dài nốt). | Done |
| **T-03E** | Waterfall Engine Core | Hoàn thiện Engine vẽ. Tính toán trục Y dựa trên `startTime`, `currentTime` (từ audio) và `fallSpeed` (tốc độ rơi). Vẽ hình chữ nhật với màu sắc phân biệt (phím đen/phím trắng) cho từng nốt theo thời gian thực. | Done |
| **T-03F** | Đồng bộ UI & Tối ưu Âm thanh | Đồng bộ Control Bar với `Tone.Transport.seconds`. Highlight màu phím đàn khi Auto-play bằng `Tone.Draw.schedule`. Thêm `Tone.Limiter` và giảm Master Volume để chống vỡ tiếng (hard clipping). | Done |
| **T-04A** | Kết nối API bản nhạc | Tạo `lib/axios.js` (baseURL từ `VITE_API_URL`, chuẩn hoá lỗi) và `features/workspace/api/sheetsApi.js`. Workspace nạp bài từ `GET /api/sheets/:id` thay cho file JSON import tĩnh. Có trạng thái loading/lỗi và nút Thử lại; hook `useSheetLoader` huỷ request khi unmount. | Done |
| **T-04B** | Router & cấu trúc thư mục | Thêm `react-router-dom`, `routes/AppRoutes.jsx` với route `/workspace/:sheetId?`. Chuyển `WorkspacePage` ra `src/pages/` theo `Structure.md`. | Done |
| **T-04C** | Đồng bộ với nhánh Home | Nâng Tailwind v3 lên v4 (`@tailwindcss/vite`), xoá `postcss.config.js` và `tailwind.config.js`, đổi class bị đổi nghĩa ở v4. Dùng `index.css` và `index.html` của nhánh `interactive-piano`. Cần kiểm tra lại giao diện Workspace (góc bo, nút) sau khi gộp CSS. | Done |

### Giai đoạn 2: Chế độ chơi & Store

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-05A** `[FE]` | Bỏ chế độ FREE_PLAY | `useWorkspaceStore.js`: `currentMode` mặc định `'AUTO_PLAY'`, chỉ còn `'PRACTICE' \| 'AUTO_PLAY'`. Xoá mode Free trong `ControlBar.jsx`, xoá `PIANO_KEYS_61` (luôn dùng 88 phím) trong `PianoKeyboard.jsx`, bỏ nhánh `FREE_PLAY` trong `practiceWaterfall.jsx`. | To Do |
| **T-05B** `[FE]` | Redirect `/workspace` không có id | `routes/AppRoutes.jsx`: `/workspace` dùng `<Navigate to="/" replace />`, `/workspace/:sheetId` vào WorkspacePage. Xoá `config/sheet.js` (`DEFAULT_SHEET_ID`) và phần fallback trong WorkspacePage. Phụ thuộc: C-03. | To Do |
| **T-05C** `[FE]` | Tối ưu re-render (selector) | Thay mọi chỗ `const {...} = useWorkspaceStore()` bằng selector theo từng field hoặc `useShallow` (zustand/react/shallow) trong `WorkspacePage`, `ControlBar`, `PianoKeyboard`, `practiceWaterfall`, `useSheetLoader`. Không đổi hành vi. Kiểm tra bằng React DevTools Profiler: khi Auto-play, ControlBar và Canvas không render lại theo từng nốt. | To Do |
| **T-05D** `[FE]` | Tách state phím | Tách `activeKeys` thành `pressedKeys` (người dùng nhấn) và `playbackKeys` (Auto-play / gợi ý Practice, lưu kèm `hand`). Đổi `highlightKey`/`unhighlightKey` thành `setPlaybackKey`/`clearPlaybackKey`. `sheetPlayer.js` và `ControlBar.jsx` dùng API mới. `Key` nhận 2 trạng thái riêng. Phụ thuộc: T-05C. | To Do |
| **T-05E** `[FE]` | Khoá thao tác ở AUTO_PLAY | Ở `AUTO_PLAY` bỏ qua chuột và phím máy tính (không phát tiếng, không đổi `pressedKeys`), con trỏ chuột về mặc định. Đổi mode thì nhả hết phím đang giữ. Phụ thuộc: T-05D. | To Do |

### Giai đoạn 3: Nhập liệu bàn phím

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-06A** `[FE]` | Dùng bảng ánh xạ của Home | Workspace gọi `getPianoConfig()` (import từ `features/home/api/pianoApi.js`, không sửa file đó) để dựng map `keyboardKey → note` (`1`=C1 … `m`=C6). Xoá `config/keyMapping.js`. Xử lý trạng thái đang tải/lỗi của cấu hình. | To Do |
| **T-06B** `[FE]` | Chống kẹt phím | Tạo hook `features/workspace/hooks/useKeyboardInput.js` theo cách Home làm: tra theo `event.code` (nhả Shift trước vẫn nhả đúng nốt), bỏ qua `event.repeat`, bỏ qua khi focus ở `input/textarea/select/contenteditable`, `preventDefault`, nhả hết phím khi `window` `blur` và khi unmount, đếm số nguồn giữ mỗi nốt (chuột + phím cùng nốt). `PianoKeyboard.jsx` dùng hook này. Phụ thuộc: T-06A, T-05D. | To Do |
| **T-06C** `[FE]` | Octave Shift (logic) | Thêm `octaveShift` vào store (phạm vi tính từ config như Home: 0 → +1, tức C1–C6 ↔ C2–C7). Map phím tính lại theo shift. Đổi shift thì nhả các phím đang giữ. Phụ thuộc: T-06B. | To Do |

### Giai đoạn 4: Bố cục & giao diện (sao chép UI của Home, giữ cơ chế Workspace)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-07A** `[FE]` | Bố cục 3 tầng | `WorkspacePage.jsx` còn 3 tầng: (1) Thông tin bài + Control Bar, (2) Waterfall, (3) Piano. Xoá header `FIANO.` cũ. Khung theo design token (viền `--color-ink`, `--shadow-hard`, góc vuông), bỏ màu hex và `rounded-*`. Loading/lỗi/Thử lại giữ nguyên. | To Do |
| **T-07B** `[FE]` | Card thông tin bài | Tạo `features/workspace/components/SheetInfoPanel.jsx`: tiêu đề, tác giả, độ khó, tags, lượt xem, lượt thích (chỉ hiển thị). Theo thiết kế `Sheet_Practice_Studio_Waterfall`, chưa có nút Like/Share/Export. Phụ thuộc: T-07A, L-BE-08. | To Do |
| **T-07C** `[FE]` | Tăng lượt xem | Khi tải bài thành công thì gọi `POST /sheets/:id/view` một lần (`sheetsApi.js` + `useSheetLoader.js`). Chặn StrictMode gọi 2 lần trong dev. Phụ thuộc: L-BE-10. | To Do |
| **T-07D** `[FE]` | Bố trí phím dùng chung | Tạo `features/workspace/config/keyLayout.js` tính `left/width` (%) cho 88 phím theo công thức của Home (`BLACK_KEY_RATIO`). Bàn phím và Canvas cùng dùng layout này, thay cho việc đọc DOM `[data-note]` bằng `setTimeout 50ms`. | To Do |
| **T-07E** `[FE]` | Giao diện Piano giống Home | Viết lại phần render của `PianoKeyboard.jsx`/`Key.jsx` theo style Home: khung gỗ, dải nỉ đỏ, phím trắng/đen dùng token, nhãn phím tắt (`kbd`) + tên nốt, vạch đáy phím. Phím người dùng nhấn: màu brand như Home. Phím Auto-play: tay phải cam, tay trái xanh dương. Phụ thuộc: T-07D, T-05D. | To Do |
| **T-07F** `[FE]` | Giao diện Waterfall giống Home | `practiceWaterfall.jsx`: nền giấy, lưới ngang, vạch phân quãng tám, vạch hit-line, khối nốt có gradient + viền ink + bóng cứng, đọc màu từ CSS variables. Tay phải = gradient cam (`--color-note-orange-*`), tay trái = gradient xanh (`--color-note-blue-*`). Hiện tên nốt trên khối nếu đủ chỗ. **Giữ nguyên cơ chế rơi theo `Tone.Transport`.** Phụ thuộc: T-07D. | To Do |
| **T-07G** `[FE]` | Kiểm tra màu 2 tay | Sau khi dữ liệu được convert lại (L-BE-05), kiểm tra Merry Christmas: âm trầm màu xanh (trái), âm cao màu cam (phải). Phụ thuộc: L-BE-05/L-BE-06. | To Do |

### Giai đoạn 5: Control Bar

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-08A** `[FE]` | Restyle Control Bar | `ControlBar.jsx` theo phong cách cartoon (token, viền ink, bóng cứng, góc vuông). Mode selector dạng segmented: *Tự động phát* / *Wait Mode*. Timeline dùng ref thay cho `document.getElementById('progress-thumb')`. Đổi định dạng thời gian thống nhất `m:ss`. | To Do |
| **T-08B** `[FE]` | Nút Tua về đầu | Thêm nút Restart: `Transport.stop()` + về 0:00, nhả nốt, xoá playbackKeys. | To Do |
| **T-08C** `[FE]` | Volume thật | Slider âm lượng chỉ cho Workspace: chỉnh `pianoSampler.volume`, lưu giá trị gốc lúc mount và **khôi phục khi unmount** để không ảnh hưởng Home. | To Do |
| **T-08D** `[FE]` | Tốc độ phát: chuyển sang thời gian nhạc | `sheetPlayer.js`: lên lịch nốt theo ticks (dựa vào BPM bài) thay cho giây tuyệt đối, để đổi `Transport.bpm` thì cả âm thanh lẫn waterfall đều co giãn. Thêm helper `getSongTime()` dùng chung cho Canvas và Timeline. Chưa có UI. | To Do |
| **T-08E** `[FE]` | Tốc độ phát: UI | Bộ chọn 0.5x / 0.75x / 1x / 1.25x / 1.5x kèm hiển thị BPM thực tế (dạng `− 92 BPM +` như thiết kế). Phụ thuộc: T-08D. | To Do |
| **T-08F** `[FE]` | Octave Shift (UI) | Cụm `-1 [C1-C6 (0)] +1` giống Home trong Control Bar, disable ở 2 đầu phạm vi và khi AUTO_PLAY. Phụ thuộc: T-06C. | To Do |
| **T-08G** `[FE]` | Bật/tắt nhãn phím | Select *Phím tắt + Tên nốt* / *Tên nốt* như Home, thay cho logic ẩn nhãn cứng theo mode. Phụ thuộc: T-07E. | To Do |

### Giai đoạn 6: Chế độ PRACTICE (Wait Mode)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-09A** `[FE]` | Gom nốt thành bước | Hàm thuần `features/workspace/practice/buildSteps.js`: gom nốt có `time` lệch nhau ≤ 50ms thành 1 bước `{ time, notes: Set<name>, hands }`, sắp theo thời gian. Có vài test case viết tay trong comment hoặc file test. | To Do |
| **T-09B** `[FE]` | Dừng chờ tại mỗi bước | Ở PRACTICE: Transport chạy, đến thời điểm của bước thì `pause()` và đặt `playbackKeys` = các nốt cần nhấn (gợi ý). Không phát âm tự động. Phụ thuộc: T-09A, T-05D, T-08D. | To Do |
| **T-09C** `[FE]` | Kiểm tra phím người dùng | Người dùng nhấn phím thì có tiếng. Đánh dấu nốt đúng của bước hiện tại. Đủ **tất cả** nốt (nhấn sau khi bước bắt đầu chờ) thì `start()` tiếp. Phím sai vẫn kêu nhưng không tính. Phụ thuộc: T-09B, T-06B. | To Do |
| **T-09D** `[FE]` | Đồng bộ seek/restart | Tua, Restart, đổi mode thì tính lại bước hiện tại theo thời gian mới, xoá gợi ý và các nốt đã đánh dấu. Phụ thuộc: T-09C. | To Do |
| **T-09E** `[FE]` | Phản hồi trực quan | Phím gợi ý có màu theo tay, nốt đã nhấn đúng đổi trạng thái, Control Bar hiện badge *Đang chờ*. Phụ thuộc: T-09C, T-07E. | To Do |
| **T-10** `[FE]` | Review Workspace | Chạy `npm run lint` + `npm run build`, test thủ công (Auto/Practice, seek, đổi bài, rời trang không còn âm hay listener), cập nhật README FE. | To Do |

## Feature: Sheet Library 

### Backend: Database (PostgreSQL + Prisma)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **L-BE-01** `[BE]` | Postgres local bằng Docker | Tạo `docker-compose.yml` (postgres:16, volume, port 5432), `.env.example` có `DATABASE_URL`, README hướng dẫn `docker compose up -d`. Không commit `.env`. | Done |
| **L-BE-02** `[BE]` | Cài Prisma | Cài `prisma@7` + `@prisma/client` + `@prisma/adapter-pg` + `pg`, tạo `prisma.config.js`, `prisma/schema.prisma` (chỉ datasource + generator `prisma-client-js`), `src/lib/prisma.js` (singleton client, disconnect khi tắt server). Script npm: `postinstall` (generate), `db:generate`, `db:migrate`, `db:studio`. | Done |
| **L-BE-03** `[BE]` | Model `Sheet` + migration | Model `Sheet`: `id` (slug, PK), `title`, `subtitle?`, `composer`, `difficulty` (enum EASY/MEDIUM/HARD/EXPERT), `tags String[]`, `bpm`, `timeSignature Int[]`, `keySignature?`, `durationSec`, `noteCount`, `views` (mặc định 0), `likes` (mặc định 0), `coverColor`, `notes Json`, `createdAt`, `updatedAt`. Migration `init_sheets`. Cột `uploaderId` sẽ thêm sau khi có User/Auth. | Done |

### Backend: Dữ liệu bài nhạc (seed)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **L-BE-04A** `[BE]` | Tool convert: phân tích track | Tạo `scripts/midi-to-sheet.mjs` (tool seed riêng, **không đụng `convertMidi.mjs`** vì file đó để dành cho engine Upload). Chế độ `--inspect` in bảng track: tên, nhạc cụ (GM program), channel, số nốt, khoảng cao độ, cao độ trung bình. Track lấy theo `--tracks 0,2` (catalog khai báo). Chỉ khi không khai báo mới tự chọn track piano (program 0–7, bỏ track trống). | Done |
| **L-BE-04B** `[BE]` | Tool convert: chia tay & xuất JSON | Chia tay: nếu có 2+ track piano thì track có cao độ trung bình thấp hơn là tay trái, cao hơn là tay phải. Nếu chỉ có 1 track thì chia theo điểm cắt C4. Lọc nốt ngoài 88 phím, khử nốt trùng, sắp theo `time`. Xuất `{ metadata: { bpm, timeSignature, keySignature? }, notes: [{ midi, name, time, duration, velocity, hand }] }`. Phụ thuộc: L-BE-04A. | Done |
| **L-BE-05** `[BE]` | Convert các bài nhạc | Tạo `src/data/sheets/catalog.json`: mỗi bài có `id`, `midiFile`, `tracks` (track cần lấy, khai báo tường minh), title, subtitle, composer, difficulty (`Easy→EASY`, `Normal→MEDIUM`, `Hard→HARD`), tags (1 thể loại), views/likes mẫu, coverColor. Copy 8 file `.mid` từ `Assets/MIDI-music/` vào `src/data/sheets/midi/` (tên file theo `id`). Script `npm run sheets:build` convert toàn bộ catalog ra `src/data/sheets/<id>.json`. Merry Christmas lấy track `0,1` (Piano + Music Box), sửa lỗi nhãn tay bị ngược. Phụ thuộc: L-BE-04B. | Done |
| **L-BE-06** `[BE]` | Seed script | `prisma/seed.js` đọc `catalog.json` + JSON nốt, tính `durationSec`/`noteCount`, `upsert` theo `id` (chạy lại nhiều lần không bị trùng). Khai báo `migrations.seed` trong `prisma.config.js` + script `db:seed`. Phụ thuộc: L-BE-03, L-BE-05. | Done |

### Backend: API

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **L-BE-07** `[BE]` | Repository Prisma | Tạo `sheets.repository.js` (`findMany` có where/orderBy/skip/take, **không select `notes`**; `findById` có `notes`; `count`). `sheets.service.js` dùng repository thay cho Map trong RAM. Xoá `sheets.catalog.js`. Response của `GET /sheets` và `GET /sheets/:id` **giữ nguyên contract**. Phụ thuộc: L-BE-06, C-01. | Done |
| **L-BE-08** `[BE]` | Mở rộng list & summary | Summary thêm `views`, `likes`, `coverColor`, `subtitle`, `keySignature`. Query: `sort` = `popular` (views) \| `likes` \| `newest` \| `title` (mặc định `popular`), thêm lọc `tag`. Cập nhật validation trong `sheets.schema.js`. Phụ thuộc: L-BE-07. | Done |
| **L-BE-09** `[BE]` | `GET /api/v1/sheets/tags` | Trả danh sách tag kèm số bài, dùng cho thanh lọc. Khai báo route **trước** `/sheets/:id`. Phụ thuộc: L-BE-07. | Done |
| **L-BE-10** `[BE]` | `POST /api/v1/sheets/:id/view` | Tăng `views` lên 1 (atomic `increment`), trả `{ views }`. Trả 404 `SHEET_NOT_FOUND` nếu không có bài. Không cần auth. Phụ thuộc: L-BE-07. | Done |
| **L-BE-11** `[BE]` | Review BE | Test tay bằng Postman hoặc curl mọi endpoint (cả trường hợp lỗi 422/404), cập nhật README (setup DB, API v1, các endpoint mới). | Done |

### Frontend

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **L-FE-01** `[FE]` | API layer | `features/library/api/libraryApi.js`: `getSheets(params, { signal })`, `getTags({ signal })`. | Done |
| **L-FE-02** `[FE]` | Hook query theo URL | `features/library/hooks/useLibraryQuery.js`: đọc/ghi `q, sort, difficulty, tag, page` qua `useSearchParams` (URL là nguồn sự thật, F5 hoặc share link vẫn giữ bộ lọc), gọi API, huỷ request cũ, trạng thái loading/error/retry. Đổi bộ lọc thì về page 1. Không cần Zustand. Phụ thuộc: L-FE-01. | Done |
| **L-FE-03** `[FE]` | LibraryPage + route | `pages/LibraryPage.jsx` (chỉ ghép component) + route `/library` trong `AppRoutes.jsx`. Khung trang + Footer. Phụ thuộc: C-03. | Done |
| **L-FE-04** `[FE]` | `SheetCover` | Ảnh bìa vẽ bằng CSS/SVG: nền pastel theo `coverColor`, hình bản nhạc dùng chung, badge độ khó (vd. *Khó*), nhãn `MIDI`. Không có nhãn PDF. | Done |
| **L-FE-05** `[FE]` | `SheetCard` | Cover + tiêu đề + tác giả + views/likes/thời lượng + nút *Luyện tập* (link `/workspace/:id`). Ẩn nút Like/Thêm vào collection (chờ User). Helper `utils/format.js` (`45.2K`, `03:45`). Phụ thuộc: L-FE-04. | Done |
| **L-FE-06** `[FE]` | `SheetGrid` + trạng thái | Lưới 4 cột (desktop), skeleton khi đang tải, trạng thái rỗng (*Không tìm thấy bản nhạc*), lỗi + nút Thử lại. Phụ thuộc: L-FE-05. | Done |
| **L-FE-07** `[FE]` | Toolbar: tìm kiếm & sắp xếp | Ô tìm kiếm (debounce 300ms), dòng *Hiển thị x / N bản*, dropdown sắp xếp (Phổ biến nhất, Lượt thích, Mới nhất, Tên). Theo thiết kế `Sheet_Library_Cartoon 3`. Phụ thuộc: L-FE-02. | Done |
| **L-FE-08** `[FE]` | Bộ lọc độ khó & thể loại | Segmented độ khó (Tất cả/Dễ/Trung bình/Khó/Chuyên gia) + chip tag (từ `getTags`). Phụ thuộc: L-FE-02, L-BE-09. | Done |
| **L-FE-09** `[FE]` | Phân trang | `Pagination`: prev/next, số trang có `…`, *Trang x trên y*, disable ở 2 đầu, cuộn lên đầu lưới khi đổi trang. Phụ thuộc: L-FE-02. | Done |
| **L-FE-10** `[FE]` | Review Library | `lint` + `build`, test thủ công (tìm kiếm, lọc, sắp xếp, phân trang, F5 giữ URL, BE tắt thì hiện lỗi), cập nhật README FE. | To Do |

## Feature: User
### Sub feature: User profile

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

### Sub feature: User edit profile

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

### Sub feature: User upload sheet

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

## Feature: Auth
### Sub feature: Login

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

### Sub feature: Forgot password

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

### Sub feature: Register

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

## Feature: Handle Error page

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **E-01** `[FE]` | Trang 404 | `pages/NotFoundPage.jsx` + route `*` trong `AppRoutes.jsx`. Phong cách cartoon (con cáo, chữ 404, nút *Về trang chủ* và *Đến Sheet Library*), dùng design token, có Footer. Phụ thuộc: C-03. | To Do |
| **E-02** `[FE]` | Bài nhạc không tồn tại | WorkspacePage khi API trả `404 SHEET_NOT_FOUND` thì hiện thông báo riêng + nút về Library (không hiện nút *Thử lại* vô ích). Phụ thuộc: T-07A. | To Do |

---

## Ghi chú thảo luận với teammate (chưa thực hiện)

- **Navbar – ô search:** gõ + Enter thì chuyển sang `/library?q=...`.
- **Navbar – menu:** thiết kế dùng `Piano | Sheet library | Metronome`. Code hiện tại là `Piano, Library, Practice_sample, Upload, Profile`. Đề xuất: `Piano`, `Sheet library`, `Profile` (ẩn cho tới khi có User). Cần chốt mục *Metronome* trỏ tới đâu.
- **Pages:** `HomePage`, `WorkspacePage`, `LibraryPage`, `UserProfilePage`, `UploadPage`, `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `NotFoundPage`. Đề xuất tách Login/Register/Forgot thành 3 page riêng (3 thiết kế riêng, URL riêng để link reset mật khẩu trong email trỏ thẳng tới).
- **Database:** PostgreSQL + Prisma, migration theo feature. Bảng `users` (Auth) khi có sẽ thêm migration gắn `sheets.uploaderId`. File MIDI/ảnh avatar lưu trên cloud (làm cùng Feature User).
- **Upload:** chỉ nhận file MIDI. Engine xử lý sẽ dựa trên `convertMidi.mjs` + logic chọn track/chia tay trong `scripts/midi-to-sheet.mjs`.