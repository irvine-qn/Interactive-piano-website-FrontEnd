# TASK_DECOMPOSITION.md 

## Feature: Piano HomePage 

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

> **Quy ước chung**
> - **Phân công:** các task trong file này (Hạ tầng chung, Piano Workspace, Sheet Library, **User upload sheet (MIDI)**, Handle Error page) là của **Bình** (Nguyễn Thanh Bình). **Quỳnh** (Nguyễn Thị Ngọc Quỳnh) phụ trách Feature **HomePage**, **Auth**, **User profile** và **User edit profile** (Quỳnh tự quản lý; HomePage để trống ở đây). Ai đọc file này để làm việc thì chỉ làm task của người đang được giao.
> - Mã task có tiền tố repo: `[BE]` = `Interactive-piano-website-Backend`, `[FE]` = `Interactive-piano-website-FrontEnd`. File WBS duy nhất nằm ở repo FE.
> - Mỗi sub-task chỉ đụng vài file, có thể review/commit độc lập. Cột Contract ghi rõ file bị ảnh hưởng và task phụ thuộc (`Phụ thuộc:`).
> - Không sửa code của Feature HomePage (`pages/HomePage.jsx`, `features/home/*`). Code dùng chung với Home (`features/piano/audio/toneEngine.js`, `components/common/*`, `index.css`, BE `/piano`, `/frequencies`) chỉ được sửa nếu không đổi hành vi của Home.
> - Task `[BE]` có thêm/đổi API thì cập nhật luôn mục *Available API* trong README của BE.
> - **Ngôn ngữ giao diện: tiếng Anh** (thống nhất với Quỳnh từ 2026-11). Comment trong code và WBS vẫn viết tiếng Việt.
> - DB: chỉ dùng **Prisma** (schema + migration) cho mọi bảng, không tạo bảng bằng SQL lúc server khởi động.
> - Thứ tự thực hiện: ~~Hạ tầng chung → Sheet Library (BE → FE) → C-06 → C-07 → C-08 → Piano Workspace (T-05 → T-08)~~ (xong) → **C-04, C-05, E-02** → **User upload sheet (MIDI)**. User profile / edit profile: Quỳnh làm. Wait Mode (T-09) và T-10: **pending**, làm sau Feature Upload MIDI.
> - Ghi chú kỹ thuật và nhật ký thay đổi: `docs/NOTES.md`, `docs/CHANGELOG.md` (có ở cả 2 repo).

## Hạ tầng chung (Common)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **C-01** `[BE]` | API prefix `/api/v1` | Đổi mount point trong `src/app.js` từ `/api` sang `/api/v1` cho `workspace.routes` và `sheets.routes`. Cập nhật toàn bộ ví dụ trong README. Phải merge cùng lúc với C-02. | Done |
| **C-02** `[FE]` | axios baseURL `/api/v1` | Sửa `src/lib/axios.js`: `baseURL = ${API_BASE_URL}/api/v1`. Không sửa `features/home/api/pianoApi.js` (đường dẫn tương đối `/piano` vẫn đúng). Kiểm tra Home vẫn tải được cấu hình piano/metronome. Phụ thuộc: C-01. | Done |
| **C-03** `[FE]` | Chuẩn hoá thư mục `pages/` | Chuyển `pages/sheet/WorkspacePage.jsx` thành `pages/WorkspacePage.jsx`, xoá thư mục `pages/sheet/`, sửa import trong `routes/AppRoutes.jsx`. Trang sau này đặt phẳng trong `pages/` (`LibraryPage`, `NotFoundPage`, ...). | Done |
| **C-04** `[FE]` | Navbar: chữ thương hiệu mới | Làm trên **Navbar mới của Quỳnh** (sau C-06B): trong `components/common/navbar.jsx`, thay ảnh `fiano-logo.png` bằng chữ `FIANO` + dấu chấm màu `--color-brand` (giống tầng 1 hiện tại của WorkspacePage), dùng design token. **Giữ nguyên con cáo mascot**, menu, ô search, phần đăng nhập/đăng xuất và menu mobile của Quỳnh. Phụ thuộc: C-06B. | To Do |
| **C-05** `[FE]` | Tách bundle theo route | Dùng `React.lazy` + `Suspense` trong `routes/AppRoutes.jsx` cho các page để Tone.js không nằm trong bundle chính. So sánh kích thước `dist/assets/*.js` trước và sau. Làm cuối phiên. | To Do |

### Đồng bộ với `develop` (sau khi Feature Auth của Quỳnh được merge)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **C-06A** `[BE]` | Merge `develop` vào `sheet-library` | Bạn chạy `git merge origin/develop`, Claude sửa xung đột, bạn `git add .` + commit. `package.json`: gộp dependency 2 bên (Prisma + `bcryptjs`, `jsonwebtoken`, `pg`), chạy `npm install` để sinh lại `package-lock.json`. `app.js`: mọi route dưới `/api/v1` (workspace, sheets, auth). `env.js`: gộp `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`. `server.js`: tạm giữ `createUsersTable()` của Quỳnh + graceful shutdown của mình (bỏ ở C-07C). `.env.example` thêm `JWT_SECRET`, `JWT_EXPIRES_IN`. Kiểm tra: server chạy, `/sheets`, `/piano`, `/auth/register`, `/auth/login` đều hoạt động. | Done |
| **C-06B** `[FE]` | Merge `develop` vào `sheet-library` | Như C-06A. `AppRoutes.jsx`: giữ toàn bộ route của Quỳnh (Login/Register/Forgot, Profile, Upload, `*` NotFound, `GuestRoute`/`ProtectedRoute`, `ROUTES`) + thêm `ROUTES.LIBRARY` → `LibraryPage`, import `pages/WorkspacePage` (vị trí mới từ C-03). Kiểm tra bản sửa tiếng Anh của Quỳnh trong `WorkspacePage` đã vào đúng file mới. Chạy lint + build, mở thử Home, Library, Workspace, Login, trang 404. | Done |

### Chuyển Feature Auth từ `pg` thuần sang Prisma (đã thống nhất với Quỳnh)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **C-07A** `[BE]` | Model `User` + migration `add_users` | Thêm `model User` (`@@map("users")`) khớp **từng cột** bảng hiện tại của Quỳnh: `id` (autoincrement), `username`, `email` (unique, `VarChar` theo `auth.constants.js`), `passwordHash` → `password_hash`, `displayName` → `display_name`, `role` (mặc định `user`), `isVerified` → `is_verified`, `createdAt` → `created_at` (`Timestamptz`). Sinh migration rồi sửa SQL thành `CREATE TABLE IF NOT EXISTS` / `CREATE UNIQUE INDEX IF NOT EXISTS`. **Thử trên DB tạm** (không đụng DB `fiano`): (1) DB mới tinh; (2) DB đã có bảng `users` kèm dữ liệu (giống máy Quỳnh) → `db:migrate` không đòi reset, dữ liệu còn nguyên. Ghi cách xử lý nếu vẫn báo drift (`prisma migrate resolve --applied`). Phụ thuộc: C-06A. **Kết quả:** migration `20261104095754_add_users`; thêm script `db:deploy`. Máy mới: `db:migrate` chạy bình thường. Máy đã có `sheets` + `users`: `db:migrate` báo drift đòi reset → phải chạy `db:deploy` một lần. Máy chỉ có `users` (chưa có Prisma): `deploy` báo P3005 → `prisma migrate resolve --applied 20261104095754_add_users` rồi `db:deploy`. Cả 3 trường hợp đã thử, dữ liệu `users` còn nguyên. DB `fiano` thật đã `db:deploy` (có backup trước). | Done |
| **C-07B** `[BE]` | Bộ test hồi quy Auth (chụp bản gốc) | Viết script test `POST /api/v1/auth/register` và `/login`: đăng ký thành công, trùng username, trùng email, thiếu/sai định dạng từng trường, đăng nhập đúng (bằng username và bằng email), sai mật khẩu, tài khoản không tồn tại. Chạy trên code `pg` hiện tại, lưu response (status + body, bỏ phần token/thời gian thay đổi mỗi lần) làm bản gốc. Phụ thuộc: C-06A. | Done |
| **C-07C** `[BE]` | `users.repository.js` dùng Prisma | Viết lại bằng `prisma.user.*`, **giữ nguyên tên hàm, tham số và dạng dữ liệu trả về** để `auth.service.js` không phải sửa. Xoá `createUsersTable()` (trong repository và `server.js`) và `src/config/database.js`. Giữ package `pg` (Prisma adapter cần). Phụ thuộc: C-07A, C-07B. | Done |
| **C-07D** `[BE]` | So sánh hồi quy + tài liệu | Chạy lại bộ test C-07B trên code Prisma: mọi response phải **giống bản gốc**. Thử thêm: mật khẩu vẫn được hash (không lưu plaintext), tài khoản tạo từ bản `pg` vẫn đăng nhập được sau khi đổi. README BE: mục Auth API (register/login, `Authorization: Bearer`), biến `JWT_SECRET`/`JWT_EXPIRES_IN`, cập nhật cây thư mục và checklist. **Mục "Cập nhật DB cũ sau khi pull"**: hướng dẫn đúng lệnh cho 3 trường hợp ở C-07A (kèm cảnh báo **không gõ `y`** khi `db:migrate` đòi reset), lệnh `db:deploy`. Phụ thuộc: C-07C. | Done |

### Chuyển giao diện Sheet Library sang tiếng Anh

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **C-08** `[FE]` | Library sang tiếng Anh | Dịch mọi chữ hiển thị và `aria-label` trong `features/library/*` + `pages/LibraryPage.jsx`: toolbar (placeholder, *Showing x / N sheets*, *Sort by*, nhãn sắp xếp), bộ lọc (*Difficulty*, *Genre*, *All*), nhãn độ khó (*Easy/Medium/Hard/Expert* trong `config/difficulty.js`), card (*Practice*, aria số lượt xem/thích/thời lượng), trạng thái rỗng/lỗi/thử lại, phân trang (*Page x of y*, *Previous/Next page*). Cập nhật mục Sheet Library trong README FE. Không đổi logic. Phụ thuộc: C-06B. | Done |

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
| **T-05A** `[FE]` | Bỏ chế độ FREE_PLAY | `useWorkspaceStore.js`: `currentMode` mặc định `'AUTO_PLAY'`, chỉ còn `'PRACTICE' \| 'AUTO_PLAY'`. Xoá mode Free trong `ControlBar.jsx`, xoá `PIANO_KEYS_61` (luôn dùng 88 phím) trong `PianoKeyboard.jsx`, bỏ nhánh `FREE_PLAY` trong `practiceWaterfall.jsx`. | Done |
| **T-05B** `[FE]` | Redirect `/workspace` không có id | `routes/AppRoutes.jsx`: `/workspace` dùng `<Navigate to={ROUTES.LIBRARY} replace />` (nút *Practice* trên Navbar trỏ tới `/workspace` → người dùng được đưa sang Library để chọn bài), `/workspace/:sheetId` vào WorkspacePage. Xoá `config/sheet.js` (`DEFAULT_SHEET_ID`) và phần fallback trong WorkspacePage. Phụ thuộc: C-06B. | Done |
| **T-05C** `[FE]` | Tối ưu re-render (selector) | Thay mọi chỗ `const {...} = useWorkspaceStore()` bằng selector theo từng field hoặc `useShallow` (zustand/react/shallow) trong `WorkspacePage`, `ControlBar`, `PianoKeyboard`, `practiceWaterfall`, `useSheetLoader`. Không đổi hành vi. Kiểm tra bằng React DevTools Profiler: khi Auto-play, ControlBar và Canvas không render lại theo từng nốt. | Done |
| **T-05D** `[FE]` | Tách state phím | Tách `activeKeys` thành `pressedKeys` (người dùng nhấn) và `playbackKeys` (Auto-play / gợi ý Practice, lưu kèm `hand`). Đổi `highlightKey`/`unhighlightKey` thành `setPlaybackKey`/`clearPlaybackKey`. `sheetPlayer.js` và `ControlBar.jsx` dùng API mới. `Key` nhận 2 trạng thái riêng. Phụ thuộc: T-05C. | Done |
| **T-05E** `[FE]` | Khoá thao tác ở AUTO_PLAY | Ở `AUTO_PLAY` bỏ qua chuột và phím máy tính (không phát tiếng, không đổi `pressedKeys`), con trỏ chuột về mặc định. Đổi mode thì nhả hết phím đang giữ. Phụ thuộc: T-05D. | Done |

### Giai đoạn 3: Nhập liệu bàn phím

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-06A** `[FE]` | Dùng bảng ánh xạ của Home | Workspace gọi `getPianoConfig()` (import từ `features/home/api/pianoApi.js`, không sửa file đó) để dựng map `keyboardKey → note` (`1`=C1 … `m`=C6). Xoá `config/keyMapping.js`. Xử lý trạng thái đang tải/lỗi của cấu hình. | Done |
| **T-06B** `[FE]` | Chống kẹt phím | Tạo hook `features/workspace/hooks/useKeyboardInput.js` theo cách Home làm: tra theo `event.code` (nhả Shift trước vẫn nhả đúng nốt), bỏ qua `event.repeat`, bỏ qua khi focus ở `input/textarea/select/contenteditable`, `preventDefault`, nhả hết phím khi `window` `blur` và khi unmount, đếm số nguồn giữ mỗi nốt (chuột + phím cùng nốt). `PianoKeyboard.jsx` dùng hook này. Phụ thuộc: T-06A, T-05D. | Done |
| **T-06C** `[FE]` | Octave Shift (logic) | Thêm `octaveShift` vào store (phạm vi tính từ config như Home: 0 → +1, tức C1–C6 ↔ C2–C7). Map phím tính lại theo shift. Đổi shift thì nhả các phím đang giữ. Phụ thuộc: T-06B. | Done |

### Giai đoạn 4: Bố cục & giao diện (sao chép UI của Home, giữ cơ chế Workspace)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-07A** `[FE]` | Bố cục 3 tầng | `WorkspacePage.jsx` còn 3 tầng: (1) Thông tin bài + Control Bar, (2) Waterfall, (3) Piano. Xoá header `FIANO.` cũ. Khung theo design token (viền `--color-ink`, `--shadow-hard`, góc vuông), bỏ màu hex và `rounded-*`. Loading/lỗi/Thử lại giữ nguyên. | Done |
| **T-07B** `[FE]` | Card thông tin bài | Tạo `features/workspace/components/SheetInfoPanel.jsx`: tiêu đề, tác giả, độ khó, tags, lượt xem, lượt thích (chỉ hiển thị). Theo thiết kế `Sheet_Practice_Studio_Waterfall`, chưa có nút Like/Share/Export. Phụ thuộc: T-07A, L-BE-08. | Done |
| **T-07C** `[FE]` | Tăng lượt xem | Khi tải bài thành công thì gọi `POST /sheets/:id/view` một lần (`sheetsApi.js` + `useSheetLoader.js`). Chặn StrictMode gọi 2 lần trong dev. Phụ thuộc: L-BE-10. | Done |
| **T-07D** `[FE]` | Bố trí phím dùng chung | Tạo `features/workspace/config/keyLayout.js` tính `left/width` (%) cho 88 phím theo công thức của Home (`BLACK_KEY_RATIO`). Bàn phím và Canvas cùng dùng layout này, thay cho việc đọc DOM `[data-note]` bằng `setTimeout 50ms`. | Done |
| **T-07E** `[FE]` | Giao diện Piano giống Home | Viết lại phần render của `PianoKeyboard.jsx`/`Key.jsx` theo style Home: khung gỗ, dải nỉ đỏ, phím trắng/đen dùng token, nhãn phím tắt (`kbd`) + tên nốt, vạch đáy phím. Phím người dùng nhấn: màu brand như Home. Phím Auto-play: tay phải cam, tay trái xanh dương. Phụ thuộc: T-07D, T-05D. | Done |
| **T-07F** `[FE]` | Giao diện Waterfall giống Home | `practiceWaterfall.jsx`: nền giấy, lưới ngang, vạch phân quãng tám, vạch hit-line, khối nốt có gradient + viền ink + bóng cứng, đọc màu từ CSS variables. Tay phải = gradient cam (`--color-note-orange-*`), tay trái = gradient xanh (`--color-note-blue-*`). Hiện tên nốt trên khối nếu đủ chỗ. Chiều cao vùng waterfall co giãn theo chiều cao màn hình (tối đa 440px như thiết kế, tối thiểu ~260px) để bàn phím luôn nằm trọn trong màn hình 16:9 (đã thống nhất ở T-07A, có thể chỉnh sau). **Giữ nguyên cơ chế rơi theo `Tone.Transport`.** Phụ thuộc: T-07D. | Done |
| **T-07G** `[FE]` | Kiểm tra màu 2 tay | Sau khi dữ liệu được convert lại (L-BE-05), kiểm tra Merry Christmas: âm trầm màu xanh (trái), âm cao màu cam (phải). Phụ thuộc: L-BE-05/L-BE-06. | Done |

### Giai đoạn 5: Control Bar

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-08A** `[FE]` | Restyle Control Bar | `ControlBar.jsx` theo phong cách cartoon (token, viền ink, bóng cứng, góc vuông). Mode selector dạng segmented: *Auto Play* / *Wait Mode*. Timeline dùng ref thay cho `document.getElementById('progress-thumb')`. Đổi định dạng thời gian thống nhất `m:ss`. | Done |
| **T-08B** `[FE]` | Nút Tua về đầu | Thêm nút Restart: `Transport.stop()` + về 0:00, nhả nốt, xoá playbackKeys. | Done |
| **T-08C** `[FE]` | Volume thật | Slider âm lượng chỉ cho Workspace: chỉnh `pianoSampler.volume`, lưu giá trị gốc lúc mount và **khôi phục khi unmount** để không ảnh hưởng Home. | Done |
| **T-08D** `[FE]` | Tốc độ phát: chuyển sang thời gian nhạc | `sheetPlayer.js`: lên lịch nốt theo ticks (dựa vào BPM bài) thay cho giây tuyệt đối, để đổi `Transport.bpm` thì cả âm thanh lẫn waterfall đều co giãn. Thêm helper `getSongTime()` dùng chung cho Canvas và Timeline. Chưa có UI. | Done |
| **T-08E** `[FE]` | Tốc độ phát: UI | Bộ chọn 0.5x / 0.75x / 1x / 1.25x / 1.5x kèm hiển thị BPM thực tế (dạng `− 92 BPM +` như thiết kế). Phụ thuộc: T-08D. **Lưu ý (từ T-08D):** nốt tự nhả sau độ dài đã quy ra giây thật lúc bắt đầu, nên đổi tốc độ đúng lúc nốt đang ngân thì nốt đó vẫn ngân theo tốc độ cũ; nếu muốn chính xác, khi đổi tốc độ lúc đang phát thì tua lại tại chỗ (`setSongTime(getSongTime())`). | Done |
| **T-08F** `[FE]` | Octave Shift (UI) | Cụm `-1 [C1-C6 (0)] +1` giống Home trong Control Bar, disable ở 2 đầu phạm vi và khi AUTO_PLAY. Phụ thuộc: T-06C. | Done |
| **T-08G** `[FE]` | Bật/tắt nhãn phím | Select *Phím tắt + Tên nốt* / *Tên nốt* như Home, thay cho logic ẩn nhãn cứng theo mode. Phụ thuộc: T-07E. | Done |

### Giai đoạn 6: Chế độ PRACTICE (Wait Mode) — Pending

> **Pending (2026-11-05):** tạm dừng Wait Mode, làm tiếp sau khi hoàn thiện Feature Upload MIDI (để thử với bài do người dùng tải lên). Trong lúc chờ, nút *Wait Mode* chỉ đổi sang chế độ người dùng tự chơi (có nhãn phím tắt, Octave Shift), chưa dừng chờ theo bài.

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-09A** `[FE]` | Gom nốt thành bước | Hàm thuần `features/workspace/practice/buildSteps.js`: gom nốt có `time` lệch nhau ≤ 50ms thành 1 bước `{ time, notes: Set<name>, hands }`, sắp theo thời gian. Có vài test case viết tay trong comment hoặc file test. | To Do |
| **T-09B** `[FE]` | Dừng chờ tại mỗi bước | Ở PRACTICE: Transport chạy, đến thời điểm của bước thì `pause()` và đặt `playbackKeys` = các nốt cần nhấn (gợi ý). Không phát âm tự động. **Lưu ý (phát hiện ở T-05E):** `ControlBar` đang nghe sự kiện `pause`/`stop` của `Tone.Transport` để gọi `stopAllNotes()` + `resetKeys()`, và Tone phát sự kiện này trễ vài chục ms → nếu Wait Mode `pause()` để chờ thì sẽ **tắt tiếng và xoá phím người chơi đang giữ**. Phải tách "dừng do người dùng bấm Pause/Stop/tua" khỏi "dừng chờ của Wait Mode", và chỉ tắt âm/phím của bài nhạc (`playbackKeys`), không đụng `pressedKeys`. Phụ thuộc: T-09A, T-05D, T-08D. | To Do |
| **T-09C** `[FE]` | Kiểm tra phím người dùng | Người dùng nhấn phím thì có tiếng. Đánh dấu nốt đúng của bước hiện tại. Đủ **tất cả** nốt (nhấn sau khi bước bắt đầu chờ) thì `start()` tiếp. Phím sai vẫn kêu nhưng không tính. Phụ thuộc: T-09B, T-06B. | To Do |
| **T-09D** `[FE]` | Đồng bộ seek/restart | Tua, Restart, đổi mode thì tính lại bước hiện tại theo thời gian mới, xoá gợi ý và các nốt đã đánh dấu. Phụ thuộc: T-09C. | To Do |
| **T-09E** `[FE]` | Phản hồi trực quan | Phím gợi ý có màu theo tay, nốt đã nhấn đúng đổi trạng thái, Control Bar hiện badge *Waiting for you*. Phụ thuộc: T-09C, T-07E. | To Do |
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
| **L-FE-10** `[FE]` | Review Library | `lint` + `build`, test thủ công (tìm kiếm, lọc, sắp xếp, phân trang, F5 giữ URL, BE tắt thì hiện lỗi), cập nhật README FE. | Done |

## Feature: User

> **Phân công (2026-11-05):** *User profile* (trang profile) và *User edit profile* (trang chỉnh sửa profile, gồm ảnh avatar) là của **Quỳnh**. *User upload sheet* (upload file MIDI) là của **Bình**. *Bài đã lưu của người dùng*: chưa phân công. Trang profile có thể cần danh sách bài người dùng đã upload: thống nhất API trước khi làm.

### Sub feature: User profile (Quỳnh)

> **Hiện trạng:** `pages/profile/UserProfilePage.jsx` mới có banner chào mừng, tên hiển thị và `@username`, đọc từ `useAuthStore`. Backend chưa có API người dùng.
> **Contract API theo `README_main.md` mục 6.2.** Task `[BE]` đổi API thì cập nhật `docs/api.md` + README của BE.

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **UP-01** `[BE]` | `GET /api/v1/users/me` | Tạo `src/features/users/users.routes.js`, `users.controller.js`, `users.service.js`; mount trong `app.js`. Dùng `requireAuth`, thêm `findById` vào `users.repository.js`. Trả về user công khai, cùng dạng `user` của login, **không có `password_hash`**. Token hợp lệ nhưng tài khoản không còn tồn tại: `401 UNAUTHORIZED` (theo `docs/api.md`). | Done |
| **UP-02** `[FE]` | API layer + đồng bộ store | Tạo `features/profile/api/profileApi.js` dùng `lib/axios.js` (tự gắn token, 401 tự `clearAuth`): `getMe({ signal })`. Thêm action `updateUser(user)` vào `useAuthStore.js`, giữ nguyên `accessToken`. Hook `features/profile/hooks/useProfile.js`: gọi `getMe` khi vào trang và ghi đè `user` đã persist (dữ liệu trong localStorage có thể cũ), huỷ request khi unmount. Phụ thuộc: UP-01. | To Do |
| **UP-03** `[FE]` | Giao diện trang profile | `UserProfilePage.jsx` chỉ ghép component trong `features/profile/components/`: avatar (dùng `default-avatar.jpeg` khi chưa có ảnh), tên hiển thị, `@username`, email, ngày tham gia, nút *Edit profile*. Có trạng thái loading/lỗi/thử lại, dùng design token. `displayName` có thể `null` trong DB nên fallback về `username`. Giữ banner chào mừng sau đăng ký, xử lý để F5 không hiện lại (hiện `location.state` còn nguyên sau khi tải lại trang). Phụ thuộc: UP-02. | To Do |
| **UP-04** `[BE+FE]` | Danh sách bài đã upload | Mục *My uploads* trên trang profile. Cần `sheets.uploaderId` từ *User upload sheet* (Bình), **thống nhất API với Bình trước khi làm**. Phụ thuộc: UP-03, Feature upload MIDI. | To Do |
| **UP-05** `[FE]` | Review profile | `lint` + `build`. Test thủ công: F5 giữ đăng nhập, token hết hạn thì về `/login`, BE tắt thì hiện lỗi, tài khoản `displayName` rỗng, responsive. Cập nhật README FE. Phụ thuộc: UP-03. | To Do |

### Sub feature: User edit profile (Quỳnh)

> **Phạm vi (`README_main.md` mục 3.4):** sửa Display Name, Bio, Avatar, Background Banner và đổi mật khẩu. `username`, `email` chỉ hiển thị.
> **Lưu ảnh (đã chốt):** tạm lưu trong database để chạy local, sau này chuyển sang Cloudinary. Ảnh nằm ở bảng riêng và client chỉ dùng URL, để khi chuyển chỉ phải đổi phần lưu và phục vụ ảnh.

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **UE-01** `[BE]` | Bio, URL ảnh + bảng ảnh tạm | `model User` thêm `bio`, `avatarUrl`, `backgroundUrl` (đều nullable). Thêm model `UserImage` (`userId`, `kind` là avatar/background, `data Bytes`, `mimeType`, khoá chính `userId + kind`), migration `add_user_profile`. Thêm field vào `toRow`, `toPublicUser`. Response login/register có thêm field nên phải chụp lại baseline `scripts/auth-regression.mjs` và xác nhận chỉ khác các field này. Báo Bình chạy migration. | To Do |
| **UE-02** `[BE]` | `PUT /api/v1/users/profile` (chữ) | Dùng `requireAuth`. Body `{ displayName, bio }`: trim, `displayName` bắt buộc, tối đa `DISPLAY_NAME_MAX_LENGTH`, `bio` có giới hạn độ dài trong `auth.constants.js`; sai thì `422 VALIDATION_FAILED`. Chỉ nhận field trong danh sách cho phép, **bỏ qua `role`, `isVerified`, `email`, `username`, `passwordHash`**. Lấy id từ `req.userId`, không nhận id từ client. Trả về user công khai. Có unit test cho schema. Phụ thuộc: UP-01, UE-01. | To Do |
| **UE-03** `[FE]` | Trang + form chỉnh sửa | Thêm `ROUTES.PROFILE_EDIT` (`/profile/edit`) trong `ProtectedRoute`. Tạo `pages/profile/EditProfilePage.jsx` + `features/profile/components/EditProfileForm.jsx`, tái dùng `FieldLabel`, `FormError`, `inputClass`. Điền sẵn dữ liệu hiện tại; validate giống BE; nút *Save* disable khi đang gửi hoặc chưa có thay đổi; *Cancel* về profile. Thành công thì `updateUser` để Navbar đổi tên ngay, rồi về profile. Phụ thuộc: UE-02, UP-02. | To Do |
| **UE-04** `[BE]` | `PUT /api/v1/users/profile` (ảnh) | Cùng endpoint UE-02, nhận thêm `multipart/form-data` với file `avatar`, `background` (không bắt buộc), chỉ JPEG/PNG/WebP, giới hạn dung lượng (đề xuất 2 MB). **Kiểm tra định dạng theo nội dung file**, không tin đuôi file hay `Content-Type` của client. Sai định dạng/quá dung lượng: `422 VALIDATION_FAILED`. Lưu vào `UserImage` (ảnh mới ghi đè ảnh cũ), cập nhật `avatarUrl`/`backgroundUrl`. Thêm `GET /api/v1/users/:username/avatar` và `/background` để trả ảnh; 2 route này là tạm thời, bỏ khi chuyển Cloudinary. Không select `data` ở các truy vấn user. Phụ thuộc: UE-01, UE-02. | To Do |
| **UE-05** `[FE]` | Chọn và tải ảnh | Thêm vào form: chọn avatar và banner, xem trước (thu hồi object URL khi đổi ảnh/unmount), báo lỗi sai định dạng/quá dung lượng ngay ở client, trạng thái đang tải. Axios đang có `timeout` 10s nên cần tăng riêng cho request có file. Phụ thuộc: UE-03, UE-04. | To Do |
| **UE-06** `[FE]` | Hiện ảnh toàn site | `navbar.jsx` và trang profile dùng `user.avatarUrl`, không có hoặc ảnh lỗi thì về `default-avatar.jpeg`; trang profile dùng thêm `user.backgroundUrl`. Chỉ sửa phần avatar của Navbar. Ảnh banner mặc định: báo Quỳnh cung cấp, không tự tạo. Phụ thuộc: UE-05. | To Do |
| **UE-07** `[BE+FE]` | Đổi mật khẩu | `PUT /api/v1/users/change-password` (`requireAuth`, body `{ currentPassword, newPassword }`, cùng quy tắc mật khẩu với đăng ký, sai mật khẩu hiện tại thì báo lỗi). FE: khu vực bảo mật riêng, nối vào nút *Change password* của `AccountSecurityPanel`. Phụ thuộc: UP-01. | To Do |
| **UE-08** `[BE+FE]` | Review edit profile | `lint` + `build` + test BE + `auth-regression --compare`. Test thủ công: tên rỗng, quá dài, bio quá dài, file sai định dạng đổi đuôi, ảnh quá lớn, F5 sau khi lưu, gửi kèm `role` không có tác dụng, đổi mật khẩu rồi đăng nhập lại. Cập nhật `docs/api.md`, README, `docs/CHANGELOG.md` cả 2 repo. Phụ thuộc: UE-06, UE-07. | To Do |

### Sub feature: User upload sheet (Bình)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

## Feature: Auth

> Việc chuyển Auth từ `pg` sang Prisma do Bình làm, xem C-07A → C-07D.

### Sub feature: Login

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **A-L01** `[BE]` | `POST /api/v1/auth/login` | Body `{ identifier, password }`, `identifier` là username hoặc email (trim, chữ thường). So khớp mật khẩu bằng `bcrypt`, trả `{ accessToken, user }` (JWT chứa `sub`, `username`, `role`). Sai tài khoản hoặc mật khẩu đều trả `401 INVALID_CREDENTIALS`. Thiếu trường: `422 VALIDATION_FAILED`. File: `features/auth/auth.{routes,controller,service,schema}.js`. | Done |
| **A-L02** `[FE]` | Trang + form đăng nhập | `pages/auth/LoginPage.jsx`, `features/auth/components/{AuthLayout,AuthFormFields,LoginForm}.jsx`, `features/auth/api/authApi.js` (ánh xạ mã lỗi sang câu tiếng Anh). Có validate rỗng, ẩn/hiện mật khẩu, trạng thái đang gửi, link *Forgot password* và *Sign up*. Thành công thì quay lại trang trước đó (`location.state.from`), mặc định về Home. | Done |
| **A-L03** `[FE]` | Lưu phiên đăng nhập | `store/useAuthStore.js`: Zustand `persist` (key `fiano-auth`), `setAuth`, `clearAuth`; khi tải lại trang, token hết hạn thì tự xoá. `lib/axios.js`: tự gắn `Authorization: Bearer`, gặp 401 thì `clearAuth`. | Done |
| **A-L04** `[FE]` | Bảo vệ route | `routes/RouteGuards.jsx`: `ProtectedRoute` (chưa đăng nhập thì về `/login`, nhớ `from`), `GuestRoute` (đã đăng nhập thì không vào được login/register/forgot). `config/routes.js`, `AppRoutes.jsx`, trang `pages/NotFoundPage.jsx` + route `*`. | Done |
| **A-L05** `[FE]` | Navbar theo trạng thái đăng nhập | `components/common/navbar.jsx`: khách thấy *Log in* / *Sign up*; đã đăng nhập thấy *Upload*, avatar, menu *Profile* / *Log out*. Đăng xuất thì `clearAuth` và về Home. Có menu mobile. | Done |
| **A-L06** `[BE+FE]` | Đăng nhập bằng Google | Nút *Continue with Google (coming soon)* đang bị disable trong `LoginForm.jsx`, chưa có logic. `POST /api/v1/auth/google` (`README_main.md` mục 6.1), chưa chọn thư viện. | To Do |

### Sub feature: Forgot password

> **Chưa dùng được:** FE đã gọi `POST /auth/forgot-password` nhưng Backend chưa có route này nên hiện nhận 404 và form báo lỗi. Chưa có dịch vụ gửi email.

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **A-F01** `[FE]` | Trang + form quên mật khẩu | `pages/auth/ForgotPasswordPage.jsx`, `features/auth/components/ForgotPasswordForm.jsx`, hàm `forgotPassword` trong `authApi.js`. Validate email, trạng thái đang gửi, màn hình *Check your inbox*, link về đăng nhập. | Done |
| **A-F02** `[BE]` | `POST /api/v1/auth/forgot-password` | Tạo token/OTP ngẫu nhiên dùng một lần, có hạn; chỉ lưu bản hash trong DB (migration riêng); gửi qua email bằng Nodemailer. **Chỉ gửi nếu tài khoản đã xác thực email, ngược lại báo lỗi** (`README_main.md` mục 3.5). Có giới hạn tần suất. Phụ thuộc: A-R04. | To Do |
| **A-F03** `[BE+FE]` | Đặt lại mật khẩu | `POST /api/v1/auth/reset-password` (`{ token, password }`, cùng quy tắc mật khẩu với đăng ký, token dùng xong thì vô hiệu) + trang `/reset-password` mở từ link trong email. Phụ thuộc: A-F02. | To Do |

### Sub feature: Register

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **A-R01** `[BE]` | `POST /api/v1/auth/register` | Body `{ displayName, username, email, password }`. Username chỉ gồm chữ thường và số; email chuyển về chữ thường; mật khẩu tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 chữ số; hash bằng `bcrypt`. Trả `201 { accessToken, user }`. Lỗi: `409 USERNAME_TAKEN`, `409 EMAIL_TAKEN`, `422 VALIDATION_FAILED`. Giới hạn độ dài trong `auth.constants.js`. | Done |
| **A-R02** `[BE]` | Test Auth | `auth.schema.test.js`: unit test validate đăng ký/đăng nhập. Test hồi quy qua API: `scripts/auth-regression.mjs` (C-07B). | Done |
| **A-R03** `[FE]` | Trang + form đăng ký | `pages/auth/RegisterPage.jsx`, `features/auth/components/RegisterForm.jsx`, `config/auth.js`. Validate khớp BE, thanh độ mạnh mật khẩu, nhập lại mật khẩu, trạng thái đang gửi. Thành công thì tự đăng nhập và sang `/profile` kèm banner chào mừng. | Done |
| **A-R04** `[BE+FE]` | Xác minh email | Cột `isVerified` đã có (mặc định `false`) nhưng chưa có luồng xác minh. `POST /api/v1/auth/verify-email`, gửi email bằng Nodemailer. | To Do |

## Feature: Handle Error page

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **E-02** `[FE]` | Bài nhạc không tồn tại | WorkspacePage khi API trả `404 SHEET_NOT_FOUND` thì hiện thông báo riêng (tiếng Anh) + nút về Library (không hiện nút *Try again* vô ích). Phụ thuộc: T-07A. | To Do |

> E-01 (trang 404) đã bỏ: Quỳnh đã làm `pages/NotFoundPage.jsx` + route `*` trong Feature Auth.

---

## Ghi chú thảo luận với Quỳnh (chưa thực hiện)

- **Navbar – ô search:** gõ + Enter thì chuyển sang `/library?q=...`.
- ~~**Navbar – menu**~~ và ~~**Pages** (tách Login/Register/Forgot)~~: Quỳnh đã làm trong Feature Auth.
- **Database:** PostgreSQL + Prisma, migration theo feature. Bảng `users` đưa vào Prisma ở C-07; Feature User sẽ thêm migration gắn `sheets.uploaderId` → `users.id`. Dịch vụ lưu trữ đã chốt là Cloudinary (`README_main.md`). Ảnh của edit profile tạm lưu trong database để chạy local, chuyển lên Cloudinary sau; file MIDI (Bình) cần thống nhất có làm tương tự không.
- `index.html` chưa có favicon (trình duyệt báo 404 `/favicon.ico` ở mọi trang).
- HomePage hiện lỗi đỏ "Unable to access MIDI devices…" khi người dùng không cấp quyền Web MIDI; nên ẩn hoặc diễn đạt nhẹ hơn.
- **Upload:** chỉ nhận file MIDI. Engine xử lý sẽ dựa trên `convertMidi.mjs` + logic chọn track/chia tay trong `scripts/midi-to-sheet.mjs`.