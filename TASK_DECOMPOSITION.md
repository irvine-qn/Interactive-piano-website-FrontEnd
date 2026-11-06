# TASK_DECOMPOSITION.md 

## Feature: Piano HomePage 

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

> **Quy ước chung**
> - **Phân công:** các task trong file này (Hạ tầng chung, Piano Workspace, Sheet Library, **User upload sheet (MIDI)**, Handle Error page) là của **Bình** (Nguyễn Thanh Bình). **Quỳnh** (Nguyễn Thị Ngọc Quỳnh) phụ trách Feature **HomePage**, **Auth**, **User profile** và **User edit profile** (các mục đó để trống ở đây, Quỳnh tự quản lý). Ai đọc file này để làm việc thì chỉ làm task của người đang được giao.
> - Mã task có tiền tố repo: `[BE]` = `Interactive-piano-website-Backend`, `[FE]` = `Interactive-piano-website-FrontEnd`. File WBS duy nhất nằm ở repo FE.
> - Mỗi sub-task chỉ đụng vài file, có thể review/commit độc lập. Cột Contract ghi rõ file bị ảnh hưởng và task phụ thuộc (`Phụ thuộc:`).
> - Không sửa code của Feature HomePage (`pages/HomePage.jsx`, `features/home/*`). Code dùng chung với Home (`features/piano/audio/toneEngine.js`, `components/common/*`, `index.css`, BE `/piano`, `/frequencies`) chỉ được sửa nếu không đổi hành vi của Home.
> - Task `[BE]` có thêm/đổi API thì cập nhật luôn mục *Available API* trong README của BE.
> - **Ngôn ngữ giao diện: tiếng Anh** (thống nhất với Quỳnh từ 2026-11). Comment trong code và WBS vẫn viết tiếng Việt.
> - DB: chỉ dùng **Prisma** (schema + migration) cho mọi bảng, không tạo bảng bằng SQL lúc server khởi động.
> - Thứ tự thực hiện: ~~Hạ tầng chung → Sheet Library (BE → FE) → C-06 → C-07 → C-08 → Piano Workspace (T-05 → T-08)~~ (xong) → **User upload sheet (MIDI)** (nhánh `upload-midi`, tách từ `develop` ngày 2026-11-06) → C-04, C-05, E-02, T-10. User profile / edit profile: Quỳnh làm. Wait Mode (T-09): Quỳnh đã làm (chế độ **Play**), xem mục *Thay đổi của Quỳnh sau khi merge*.
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
| **T-05E** `[FE]` | Khoá thao tác ở AUTO_PLAY | Ở `AUTO_PLAY` bỏ qua chuột và phím máy tính (không phát tiếng, không đổi `pressedKeys`), con trỏ chuột về mặc định. Đổi mode thì nhả hết phím đang giữ. Phụ thuộc: T-05D. **Quỳnh đổi (2026-11-05):** Auto Play **cho phép** người dùng chơi phím trong lúc bài chạy (bỏ chặn trong `pressKey`). Khi bài chưa chạy, nhấn đúng nốt đầu tiên của bài thì bài tự chạy từ nốt đó (cả Auto Play và Play). Bình đồng ý giữ nguyên. | Done |

### Giai đoạn 3: Nhập liệu bàn phím

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-06A** `[FE]` | Dùng bảng ánh xạ của Home | Workspace gọi `getPianoConfig()` (import từ `features/home/api/pianoApi.js`, không sửa file đó) để dựng map `keyboardKey → note` (`1`=C1 … `m`=C6). Xoá `config/keyMapping.js`. Xử lý trạng thái đang tải/lỗi của cấu hình. **Quỳnh đổi (2026-11-05):** bảng phím Practice lấy từ `practiceKeys` của `GET /api/v1/piano` (2 vùng phím, không dùng Shift), Home và Practice dùng chung `useKeyMapping`. | Done |
| **T-06B** `[FE]` | Chống kẹt phím | Tạo hook `features/workspace/hooks/useKeyboardInput.js` theo cách Home làm: tra theo `event.code` (nhả Shift trước vẫn nhả đúng nốt), bỏ qua `event.repeat`, bỏ qua khi focus ở `input/textarea/select/contenteditable`, `preventDefault`, nhả hết phím khi `window` `blur` và khi unmount, đếm số nguồn giữ mỗi nốt (chuột + phím cùng nốt). `PianoKeyboard.jsx` dùng hook này. Phụ thuộc: T-06A, T-05D. **Quỳnh đổi (2026-11-05):** `useKeyboardInput` viết lại, tra theo `event.code`, thêm phím hợp âm (giữ `A F K` / `1 4 8`) và mũi tên dời vùng phím. Vẫn giữ: bỏ qua ô gõ chữ, nhả hết khi `blur`. | Done |
| **T-06C** `[FE]` | Octave Shift (logic) | Thêm `octaveShift` vào store (phạm vi tính từ config như Home: 0 → +1, tức C1–C6 ↔ C2–C7). Map phím tính lại theo shift. Đổi shift thì nhả các phím đang giữ. Phụ thuộc: T-06B. **Quỳnh đổi (2026-11-05):** bỏ `octaveShift`, thay bằng `handOctaves` (vùng tay trái / tay phải, `moveHandOctave`). Ở Play vùng phím tự dời theo `chords`. | Done |

### Giai đoạn 4: Bố cục & giao diện (sao chép UI của Home, giữ cơ chế Workspace)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-07A** `[FE]` | Bố cục 3 tầng | `WorkspacePage.jsx` còn 3 tầng: (1) Thông tin bài + Control Bar, (2) Waterfall, (3) Piano. Xoá header `FIANO.` cũ. Khung theo design token (viền `--color-ink`, `--shadow-hard`, góc vuông), bỏ màu hex và `rounded-*`. Loading/lỗi/Thử lại giữ nguyên. | Done |
| **T-07B** `[FE]` | Card thông tin bài | Tạo `features/workspace/components/SheetInfoPanel.jsx`: tiêu đề, tác giả, độ khó, tags, lượt xem, lượt thích (chỉ hiển thị). Theo thiết kế `Sheet_Practice_Studio_Waterfall`, chưa có nút Like/Share/Export. Phụ thuộc: T-07A, L-BE-08. | Done |
| **T-07C** `[FE]` | Tăng lượt xem | Khi tải bài thành công thì gọi `POST /sheets/:id/view` một lần (`sheetsApi.js` + `useSheetLoader.js`). Chặn StrictMode gọi 2 lần trong dev. Phụ thuộc: L-BE-10. **Quỳnh đổi (2026-11-05):** lượt xem chỉ tăng khi bấm *Practice* ở Library (`state.countView`), F5 hoặc mở thẳng link không tính. | Done |
| **T-07D** `[FE]` | Bố trí phím dùng chung | Tạo `features/workspace/config/keyLayout.js` tính `left/width` (%) cho 88 phím theo công thức của Home (`BLACK_KEY_RATIO`). Bàn phím và Canvas cùng dùng layout này, thay cho việc đọc DOM `[data-note]` bằng `setTimeout 50ms`. | Done |
| **T-07E** `[FE]` | Giao diện Piano giống Home | Viết lại phần render của `PianoKeyboard.jsx`/`Key.jsx` theo style Home: khung gỗ, dải nỉ đỏ, phím trắng/đen dùng token, nhãn phím tắt (`kbd`) + tên nốt, vạch đáy phím. Phím người dùng nhấn: màu brand như Home. Phím Auto-play: tay phải cam, tay trái xanh dương. Phụ thuộc: T-07D, T-05D. **Quỳnh đổi (2026-11-05):** tách phần khung + phím thành `PianoKeybed.jsx`, Home và Practice dùng chung. | Done |
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
| **T-08F** `[FE]` | Octave Shift (UI) | Cụm `-1 [C1-C6 (0)] +1` giống Home trong Control Bar, disable ở 2 đầu phạm vi và khi AUTO_PLAY. Phụ thuộc: T-06C. **Quỳnh đổi (2026-11-05):** `OctaveShiftControl` thành 2 cụm *Zone 1* / *Zone 2* (`- Zone 1: C3 +`), dùng chung với Home, tự khoá ở Play. | Done |
| **T-08G** `[FE]` | Bật/tắt nhãn phím | Select *Phím tắt + Tên nốt* / *Tên nốt* như Home, thay cho logic ẩn nhãn cứng theo mode. Phụ thuộc: T-07E. **Quỳnh đổi (2026-11-05):** `KeyLabelSelect` thành component nhận props, dùng chung với Home. Thêm nút Hide/Show shortcuts (`ShortcutToggle`). | Done |

### Giai đoạn 6: Chế độ PRACTICE (Wait Mode → Play)

> **Cập nhật (2026-11-06):** Bình tạm dừng nhóm này ngày 2026-11-05; cùng ngày Quỳnh đã làm Wait Mode trên `develop` và đổi tên thành **Play**. Các task bên dưới ghi lại phần Quỳnh đã làm và phần còn thiếu (T-09E).

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **T-09A** `[FE]` | Gom nốt thành bước | Hàm thuần `features/workspace/practice/buildSteps.js`: gom nốt có `time` lệch nhau ≤ 50ms thành 1 bước `{ time, notes: Set<name>, hands }`, sắp theo thời gian. Có vài test case viết tay trong comment hoặc file test. **Quỳnh làm (2026-11-05):** gom nốt ở **Backend** (`sheets.score.js` → `chords` trong `GET /sheets/:id`, nốt cách nhau ≤ 30 ms là 1 hợp âm, tối đa 4 nốt `required`), không có `buildSteps.js` ở FE. | Done (Quỳnh) |
| **T-09B** `[FE]` | Dừng chờ tại mỗi bước | Ở PRACTICE: Transport chạy, đến thời điểm của bước thì `pause()` và đặt `playbackKeys` = các nốt cần nhấn (gợi ý). Không phát âm tự động. **Lưu ý (phát hiện ở T-05E):** `ControlBar` đang nghe sự kiện `pause`/`stop` của `Tone.Transport` để gọi `stopAllNotes()` + `resetKeys()`, và Tone phát sự kiện này trễ vài chục ms → nếu Wait Mode `pause()` để chờ thì sẽ **tắt tiếng và xoá phím người chơi đang giữ**. Phải tách "dừng do người dùng bấm Pause/Stop/tua" khỏi "dừng chờ của Wait Mode", và chỉ tắt âm/phím của bài nhạc (`playbackKeys`), không đụng `pressedKeys`. Phụ thuộc: T-09A, T-05D, T-08D. **Quỳnh làm:** `chordPart` + `handleChordReached` trong `audio/sheetPlayer.js` gọi `Transport.pause(time)`; Control Bar bỏ qua lần dừng chờ nhờ `isWaitPause(time)` nên không xoá phím người chơi. | Done (Quỳnh) |
| **T-09C** `[FE]` | Kiểm tra phím người dùng | Người dùng nhấn phím thì có tiếng. Đánh dấu nốt đúng của bước hiện tại. Đủ **tất cả** nốt (nhấn sau khi bước bắt đầu chờ) thì `start()` tiếp. Phím sai vẫn kêu nhưng không tính. Phụ thuộc: T-09B, T-06B. **Quỳnh làm:** `handleUserNote` (gọi từ `pressKey`), nhấn sớm tối đa 400 ms vẫn tính; đủ nốt `required` thì chạy tiếp, các nốt không bắt buộc tự kêu. | Done (Quỳnh) |
| **T-09D** `[FE]` | Đồng bộ seek/restart | Tua, Restart, đổi mode thì tính lại bước hiện tại theo thời gian mới, xoá gợi ý và các nốt đã đánh dấu. Phụ thuộc: T-09C. **Quỳnh làm:** `resetWaitState` + `alignOctavesToTime` khi tua, Restart, đổi chế độ; tua lúc đang chờ thì chạy tiếp từ vị trí mới. | Done (Quỳnh) |
| **T-09E** `[FE]` | Phản hồi trực quan | Phím gợi ý có màu theo tay, nốt đã nhấn đúng đổi trạng thái, Control Bar hiện badge *Waiting for you*. Phụ thuộc: T-09C, T-07E. **Quỳnh làm một phần:** phím gợi ý đã có màu theo tay. **Còn thiếu:** badge *Waiting for you* trên Control Bar và trạng thái riêng cho nốt đã nhấn đúng. | Một phần (Quỳnh) |
| **T-10** `[FE]` | Review Workspace | Chạy `npm run lint` + `npm run build`, test thủ công (Auto/Practice, seek, đổi bài, rời trang không còn âm hay listener), cập nhật README FE. **Cập nhật (2026-11-06):** không còn phải chờ, làm được bất cứ lúc nào. Thêm `npm test` (Quỳnh đã thêm Vitest) vào bước kiểm tra. | To Do |

### Thay đổi của Quỳnh sau khi merge `sheet-library` (2026-11-05)

Ghi lại để biết code hiện tại khác gì so với các task ở trên. Chi tiết: `docs/CHANGELOG.md` của 2 repo.

| Thay đổi | Repo / file chính | Ảnh hưởng tới phần của Bình |
| :--- | :--- | :--- |
| Chế độ **Play** (Wait Mode) chờ theo hợp âm | FE `audio/sheetPlayer.js`, `ControlBar.jsx`; BE `sheets.score.js` (`chords`) | Thay nhóm T-09. Bài upload chỉ cần `notes` đúng định dạng là BE tự tính `chords` |
| Phím Practice 2 vùng, phím hợp âm, mũi tên dời vùng, nhận đàn MIDI thật | FE `useKeyMapping`, `useKeyboardInput`, `useMidiInput`; BE `practiceKeys` trong `/piano` | Thay T-06A/B/C, T-08F |
| Home và Practice dùng chung bàn phím và các control | FE `PianoKeybed`, `KeyLabelSelect`, `OctaveShiftControl`, nút How to play | Sửa các file này thì phải mở thử cả Home |
| Dải Shortcuts nằm ngang + nút Hide/Show | FE `ShortcutStrip.jsx`, `ShortcutToggle.jsx` | Mới |
| Xem bản nhạc (khuông nhạc) bằng VexFlow, nút chuyển Waterfall / Sheet music | FE `canvas/sheetMusicScore.jsx`, `ViewModeToggle.jsx`; BE `GET /sheets/:id/score` | Bài upload cũng có bản nhạc, BE tính từ `notes` |
| Like thật (cần đăng nhập), `likedByMe` | FE `LikeButton.jsx` (Library + Workspace); BE bảng `sheet_likes`, `POST /sheets/:id/like`, `auth.middleware.js` | Có migration `add_sheet_likes`: **đưa `views`, `likes` của mọi bài về 0**. Máy cũ chạy `npm run db:deploy` |
| Lượt xem chỉ tính khi bấm Practice ở Library | FE `SheetCard.jsx`, `useSheetLoader.js` | Thay T-07C |
| Test tự động | FE `npm test` (Vitest); BE `npm test` (`node:test`), file `*.test.js` đặt cạnh code | Task mới nên kèm test |
| Rút gọn comment trong code (nhánh `fix-codestyle-logic`) | Nhiều file của Workspace và Library | Comment giải thích "vì sao" gần như bị xoá, logic giữ nguyên. Lý do của các cách làm khó (tua, tick, lookahead) xem `docs/NOTES.md` mục 3 |
| `npm run dev` cho BE, cấu hình nguồn mẫu âm piano | BE `package.json`; FE `config/api.js` (`PIANO_SAMPLES_BASE_URL`) | Không |

### Lưu ý nhỏ (ghi lại để xử lý sau, chưa phải bug)

- **Auto Play cho phép người dùng đánh đàn** và nhấn nốt đầu tiên thì bài tự chạy (cả ở Auto Play). Bình đồng ý giữ nguyên (2026-11-06). Nếu thấy vô tình chạm phím làm bài tự chạy gây khó chịu thì có thể giới hạn phần tự chạy chỉ ở Play.
- **Store và `sheetPlayer.js` import lẫn nhau** (`useWorkspaceStore` ↔ `audio/sheetPlayer`). Hiện chạy được vì 2 bên chỉ gọi nhau bên trong hàm; đừng thêm code dùng store ở cấp module trong `sheetPlayer.js` (sẽ lỗi do thứ tự import).
- `lib/axios.js` (dùng chung) biến request bị huỷ bằng `AbortController` thành `NETWORK_ERROR` *"Unable to connect to the server"*. Upload đã tự xử lý (mã `CANCELED`); nơi khác dùng `signal` nên kiểm tra `signal.aborted` trước khi hiện lỗi. Sửa ở file dùng chung thì báo Quỳnh.
- Bộ test e2e (CDP) Bình dùng cho T-05 → T-08 đã cũ so với hành vi mới (nhãn *Play*, Auto Play nhận phím, Zone thay Octave Shift, cách đếm lượt xem). Cần viết lại trước khi dùng làm test hồi quy.
- Bảng phân công trong `docs/NOTES.md` (2 repo) ghi Quỳnh không sửa phần Workspace/Library; thực tế Quỳnh đã sửa. Cập nhật lại sau khi Bình và Quỳnh thống nhất.
- Nhánh `profile` trên GitHub hiện trùng `main` (2026-11-06), chưa có code trang profile.
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
| **L-BE-04A** `[BE]` | Tool convert: phân tích track | Tạo `scripts/midi-to-sheet.mjs` (tool seed riêng). *(2026-11-06: lõi đã chuyển sang `src/features/uploads/midiToSheet.js` ở U-BE-01, `convertMidi.mjs` cũ đã xoá.)* Chế độ `--inspect` in bảng track: tên, nhạc cụ (GM program), channel, số nốt, khoảng cao độ, cao độ trung bình. Track lấy theo `--tracks 0,2` (catalog khai báo). Chỉ khi không khai báo mới tự chọn track piano (program 0–7, bỏ track trống). | Done |
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

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

### Sub feature: User edit profile (Quỳnh)

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |

### Sub feature: User upload sheet (Bình)

> **Phân tích (2026-11-06)**
> - **Engine: dùng lại, không viết mới.** Lõi `convertMidi()` trong `scripts/midi-to-sheet.mjs` (BE) đã làm đúng phần khó: `@tonejs/midi` quy thời gian nốt ra giây theo tempo map, lọc 88 phím, khử nốt trùng, chọn track piano, chia tay, lấy BPM/nhịp/giọng. Đo trên 9 bài mẫu: đọc + chuyển mất 1–42 ms (file lớn nhất 82 KB) nên tốc độ không phải vấn đề. Thứ còn thiếu là **độ bền với file lạ**: track không có tên nhạc cụ (gặp ở `golden-hour`, `flower-dance`), file hỏng, file không có track piano, nốt dài 0 giây, quá nhiều nốt.
> - **Tự chọn track chỉ là gợi ý:** so với lựa chọn tay trong `catalog.json`, tự chọn đúng 7/9 bài (sai ở `merry-christmas-mr-lawrence`: bỏ track *music box*; `golden-hour`: lấy thừa track 7 có 19 nốt). Vì vậy upload làm **2 bước**: phân tích file (trả danh sách track + gợi ý) → người dùng xác nhận/sửa track → lưu.
> - **Quỳnh đã làm giúp phần sau upload:** `GET /sheets/:id` tự tính `chords` (chế độ Play) và `GET /sheets/:id/score` tự tính bản nhạc từ `notes`. Bài upload chỉ cần lưu `notes` đúng định dạng `{ midi, name, time, duration, velocity, hand }` là có đủ Waterfall, Play và bản nhạc.
> - **Giới hạn đã biết:** bản nhạc (`sheets.score.js`) tính theo **1 BPM** nên bài đổi tempo nhiều lần sẽ lệch ô nhịp (vd `rivers-flow-in-you` có 14 tempo). Waterfall/Play không bị ảnh hưởng. Upload trả cảnh báo cho những bài này; sửa bản nhạc là việc của Quỳnh nếu cần.
> - **Lỗi có sẵn phát hiện khi phân tích:** `catalog.json` khai báo `MerryChristmasMr.Lawrence.mid` nhưng file nằm ở `midi/` → `npm run sheets:build` đang hỏng (DB không bị ảnh hưởng vì JSON đã tạo từ trước). Sửa ở U-BE-01.
>
> **Quyết định (Bình chốt 2026-11-06):**
> - **D1 Nhận file:** thư viện `multer`, giữ file trong RAM (không ghi ra ổ đĩa), tối đa 1 MB, 1 file. Không tin `mimetype` trình duyệt gửi: kiểm tra đuôi `.mid`/`.midi` **và** 4 byte đầu là `MThd`. Lỗi: `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_FILE`, `422 INVALID_MIDI`.
> - **D2 Lưu file gốc:** có lưu (để chuyển lại khi engine tốt hơn, chọn lại track, tải lại file). **Local/test: PostgreSQL**, bảng riêng `sheet_files` (không gộp vào `sheets` để truy vấn danh sách không đọc kèm file). **Khi deploy: chuyển sang dịch vụ Cloud**, dùng chung với ảnh avatar của Quỳnh. Vì vậy mọi thao tác với file đi qua module `src/lib/fileStorage.js` (`save`, `read`, `remove`), chọn nơi lưu bằng biến môi trường `FILE_STORAGE` (hiện chỉ có `postgres`); đổi sang Cloud không phải sửa API (U-BE-12).
> - **D3 Ai thấy bài upload:** cột `visibility` (`PUBLIC` | `PRIVATE`). Bài upload mặc định **PRIVATE**, người dùng tự bật PUBLIC để hiện trong Library. 9 bài mẫu là PUBLIC (Library không đổi). Bài PRIVATE của người khác trả **404** (không phải 403, để không lộ bài có tồn tại); chỉ chủ bài xem / tăng lượt xem / Like được.
> - **D4 Thông tin bài:** tên bài máy gợi ý từ tên file (tên trong MIDI thường rỗng hoặc "Track 1"), người dùng sửa; tác giả không bắt buộc (mặc định *Unknown*); BPM, nhịp, giọng, thời lượng, số nốt lấy từ file; độ khó máy gợi ý (số nốt/giây, hợp âm lớn nhất, độ rộng cao độ, có 2 tay), **hiệu chỉnh công thức bằng độ khó đã gán tay của 9 bài mẫu**, người dùng sửa được; tag chọn từ tag có sẵn hoặc thêm mới, tối đa 3; màu bìa chọn 1 trong 4 (mặc định ngẫu nhiên); `id` tạo từ tên bài, bỏ dấu tiếng Việt, trùng thì thêm `-2`, `-3`.
> - **D5 API cho trang profile của Quỳnh:** làm **cả 2**: `GET /api/v1/users/me/sheets` (mọi bài tôi upload, cần đăng nhập) và `GET /api/v1/users/:id/sheets` (chỉ bài PUBLIC của người đó). Dạng response giống `GET /sheets` (`data` + `meta`, phân trang) để Quỳnh dùng lại `SheetCard`. Báo Quỳnh trước khi làm U-BE-09.

#### Backend

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **U-BE-01** `[BE]` | Engine dùng chung cho seed và upload | Chuyển lõi của `scripts/midi-to-sheet.mjs` (`describeTracks`, `pickDefaultTracks`, `convertMidi`) sang module CommonJS `src/features/uploads/midiToSheet.js`, nhận `Buffer`/`Midi` (không đọc file). `scripts/midi-to-sheet.mjs` và `build-sheets.mjs` import lại từ đó. Sửa đường dẫn `midiFile` của Merry Christmas trong `catalog.json`. **Kiểm tra hồi quy:** chạy `npm run sheets:build`, 9 file JSON phải **giống hệt** bản đang có (`git diff` rỗng). Xoá `src/data/sheets/convertMidi.mjs` (bản đầu tiên Bình viết ở T-03D, đã được `midi-to-sheet.mjs` thay hoàn toàn) và sửa các chỗ còn nhắc tới nó: WBS L-BE-04A, ghi chú *Upload* cuối WBS, `docs/NOTES.md` (BE) mục 3. **Kết quả:** 9 file JSON không đổi một byte; `npm run sheets:build` chạy lại được; thêm test hồi quy `midiToSheet.test.js` (so từng nốt của 9 bài mẫu, chạy trong `npm test`). | Done |
| **U-BE-02** `[BE]` | Engine chịu được file lạ | Trong `midiToSheet.js`: (1) file không phải MIDI hoặc đọc lỗi → lỗi `INVALID_MIDI`; (2) track không có tên nhạc cụ vẫn chạy; (3) chọn track gợi ý: track piano (GM 0–7) có nốt, bỏ track có quá ít nốt so với track chính; không có track piano thì gợi ý mọi track không phải trống; (4) nốt dài 0 giây đặt tối thiểu 0.05 s; (5) giới hạn tối đa 20 000 nốt và 20 phút (vượt → lỗi `MIDI_TOO_LARGE`); (6) trả `warnings`: nốt ngoài 88 phím bị bỏ, bài đổi tempo nhiều lần (bản nhạc có thể lệch), track bị bỏ. Test bằng `node:test`: MIDI tự tạo bằng `@tonejs/midi` cho từng trường hợp + 9 bài mẫu. Phụ thuộc: U-BE-01.  **Kết quả:** 26/26 test (`npm test`); lỗi là `ApiError` 422 (`INVALID_MIDI`, `INVALID_TRACKS`, `NO_NOTES`, `MIDI_TOO_LARGE`); gợi ý track khớp 8/9 bài mẫu (sửa được `golden-hour`); `warnings`: `OUT_OF_RANGE_NOTES`, `ZERO_LENGTH_NOTES`, `TEMPO_CHANGES`. Sửa có chủ đích 1 nốt dài 0 giây của `chasing-kou` (đã `sheets:build` + `db:seed`). | Done |
| **U-BE-03** `[BE]` | Chia tay tốt hơn cho file 1 track *(tuỳ chọn)* | Hiện file 1 track chia cứng tại C4. Thử cách chia theo từng hợp âm có giữ ổn định theo thời gian. **Đo bằng dữ liệu thật:** gộp 2 track của `fur-elise`, `canon-in-d`, `tori-no-uta` thành 1 rồi so tỉ lệ đoán đúng tay với bản gốc, chỉ thay nếu tốt hơn rõ rệt so với mốc C4. Phụ thuộc: U-BE-02. | To Do |
| **U-BE-04** `[BE]` | Migration cho bài upload | Model `Sheet` thêm `uploaderId Int?` (FK `users.id`, `ON DELETE SET NULL`, null = bài mẫu), `visibility` enum `PUBLIC`/`PRIVATE` (mặc định `PUBLIC` cho dữ liệu cũ). Model `SheetFile` (`sheet_files`: `sheetId` PK/FK cascade, `data Bytes`, `originalName`, `size`, `createdAt`). Thêm `src/lib/fileStorage.js` (`save(sheetId, buffer, meta)`, `read(sheetId)`, `remove(sheetId)`) với driver `postgres`, chọn bằng `FILE_STORAGE` trong `.env` (mặc định `postgres`, thêm vào `.env.example`). Migration không làm mất dữ liệu; `db:seed` vẫn chạy được. Phụ thuộc: D2, D3.  **Kết quả:** migration `20261106064950_add_sheet_uploads` (chỉ thêm cột/bảng, 9 bài mẫu PUBLIC, dữ liệu giữ nguyên, có backup trước khi chạy); `fileStorage.js` + 6 test; kiểm tra trên DB thật 7/7 (lưu cùng transaction, transaction lỗi không sót dữ liệu, xoá tài khoản giữ bài, xoá bài xoá file). Model `User` của Quỳnh chỉ thêm quan hệ `uploadedSheets`. | Done |
| **U-BE-05** `[BE]` | Nhận file upload | Thêm `multer` (memory storage, `fileSize` 1 MB, 1 file, field `file`). Lỗi trả đúng format chung: `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_FILE` (sai đuôi / không có header `MThd`), `422 INVALID_MIDI`. Middleware dùng lại được cho các route upload. Phụ thuộc: D1.  **Kết quả:** `multer` 2.5.0, middleware `receiveMidiFile` (`src/common/middlewares/upload.middleware.js`), thêm `400 FILE_REQUIRED`, `400 UNEXPECTED_FILE`, `400 INVALID_UPLOAD` (multipart hỏng không còn thành 500); giữ tên file tiếng Việt (`defParamCharset: utf8`, mặc định multer làm lỗi font); 7 test bằng HTTP thật. | Done |
| **U-BE-06** `[BE]` | `POST /api/v1/uploads/midi/analyze` | `requireAuth`. Nhận file, **không lưu gì**. Trả `{ fileName, suggestedTitle, bpm, timeSignature, keySignature, durationSec, tracks: [{ index, name, instrument, program, isPiano, isPercussion, noteCount, minNote, maxNote, suggested }], suggestedTracks, suggestedDifficulty, warnings }`. `suggestedTitle` lấy từ tên bài trong file hoặc tên file. Phụ thuộc: U-BE-02, U-BE-05.  **Kết quả:** thêm trường tuỳ chọn `tracks` (vd `0,1`) để tính lại số nốt, thời lượng, độ khó, cảnh báo theo track đang chọn, response có `selectedTracks`; cảnh báo `NO_PIANO_TRACK`; độ khó gợi ý khớp 8/9 bài mẫu (`sheetSuggestions.js`). Kiểm tra trên server thật: 9/9 file mẫu trả 200 trong 4–53 ms, DB không đổi. 16 test mới (48/48). Tài liệu: README + `docs/api.md` › Uploads. | Done |
| **U-BE-07** `[BE]` | `POST /api/v1/sheets` (tạo bài từ file) | `requireAuth`, multipart: `file` + `title`, `composer?`, `difficulty`, `tags[]`, `coverColor?`, `visibility?`, `tracks[]`. Validate (schema như `auth.schema.js`), convert theo `tracks` người dùng chọn, tạo `id` slug từ title (thêm hậu tố nếu trùng), lưu `sheets` + file gốc (qua `fileStorage`) trong 1 transaction, `uploaderId` = người dùng. Trả sheet summary (`201`). Phụ thuộc: U-BE-04, U-BE-06. | To Do |
| **U-BE-08** `[BE]` | Quyền xem bài PRIVATE | `GET /sheets`, `/sheets/tags`: chỉ tính bài `PUBLIC`. `GET /sheets/:id`, `/score`, `/view`, `/like`: bài `PRIVATE` của người khác → `404 SHEET_NOT_FOUND`. Response thêm `visibility`, `uploader: { id, displayName } \| null`, `isMine`. Không đổi kết quả của 9 bài mẫu (chạy lại smoke test cũ). Phụ thuộc: U-BE-04. | To Do |
| **U-BE-09** `[BE]` | API bài đã upload của người dùng | (1) `GET /api/v1/users/me/sheets` (`requireAuth`): mọi bài tôi upload (PUBLIC + PRIVATE). (2) `GET /api/v1/users/:id/sheets`: chỉ bài PUBLIC của người đó, user không tồn tại → `404 USER_NOT_FOUND`. Cả 2 mới nhất trước, phân trang và dạng response giống `GET /sheets` (`data` + `meta`, kèm `visibility`). Dùng cho *My uploads* và trang profile của Quỳnh (D5). **Báo Quỳnh trước khi làm.** Phụ thuộc: U-BE-08. | To Do |
| **U-BE-10** `[BE]` | Sửa / xoá bài của mình | `PATCH /api/v1/sheets/:id` (title, composer, difficulty, tags, coverColor, visibility; không đổi nốt) và `DELETE /api/v1/sheets/:id` (xoá luôn likes, file). Chỉ người upload: người khác `404`, bài mẫu (không có uploader) không sửa/xoá được. Phụ thuộc: U-BE-07. | To Do |
| **U-BE-11** `[BE]` | Review Backend | `npm test` (thêm test cho analyze/tạo/quyền xem), README mục *Available API*, `docs/CHANGELOG.md` + `docs/NOTES.md` (bảng phân công, lệnh cần chạy sau khi pull). | To Do |
| **U-BE-12** `[BE]` | Lưu file trên Cloud khi deploy *(làm lúc deploy)* | Thêm driver Cloud cho `src/lib/fileStorage.js` (cùng dịch vụ với ảnh avatar của Quỳnh, thống nhất dịch vụ với Quỳnh), bật bằng `FILE_STORAGE`. Script chuyển các file đang nằm trong `sheet_files` lên Cloud. API không đổi. Phụ thuộc: U-BE-04, quyết định deploy. | To Do |

#### Frontend

> **D6 Bố cục trang `/upload` (Bình chốt 2026-11-06):** làm theo thiết kế `Fiano_SVG_UI/User_Upload_Sheet_Cartoon 1.svg`: **1 trang, 2 cột**, các thẻ đánh số mở dần (thẻ sau khoá đến khi phân tích file xong), không làm trình tự 3 bước như kế hoạch cũ.
> - Cột trái: **① File nhạc** → **② Tracks** (thêm so với thiết kế, vì tự chọn track chỉ đúng 8/9 bài) → **③ Thông tin bản nhạc**. Cột phải: **Xem trước**, **Quyền riêng tư**, **Lưu ý bản quyền**. Đầu trang: đường dẫn *Profile / Upload a new sheet*, tiêu đề, nút **Publish**.
> - **Bỏ so với thiết kế** (chưa có tính năng / cột DB): nhiều file, PDF/MusicXML, *người chuyển soạn*, *mô tả*, *bản nháp* (nút *Lưu bản nháp*), mức riêng tư *chỉ người theo dõi*, thẻ *Tuỳ chọn* (tải file, Wait Mode mặc định, bình luận). *Thể loại* gộp vào tag. Tempo, tông, nhịp chỉ hiển thị (lấy từ file).
> - **Không phải sửa Backend đã làm:** vẫn là 2 bước `analyze` (U-BE-06, có `tracks` để phân tích lại) → `POST /sheets` (U-BE-07, hợp đồng giữ nguyên); 2 mức riêng tư khớp enum `Visibility` (U-BE-04); thanh tiến trình dùng `onUploadProgress` có sẵn trong `uploadApi`.
> - Chữ trên giao diện tiếng Anh như các trang khác.

| Sub-Task | Component | Contract & Constraints | Status |
| :--- | :--- | :--- | :--- |
| **U-FE-01** `[FE]` | API layer upload | `features/upload/api/uploadApi.js`: `analyzeMidi(file)`, `createSheet(file, fields)` (gửi `FormData`), `getMySheets(params)`, `updateSheet(id, fields)`, `deleteSheet(id)`. Lỗi chuẩn hoá qua `lib/axios.js` (đọc `error.code`). Phụ thuộc: U-BE-06, U-BE-07.  **Kết quả:** thêm `getUserSheets(userId)` cho profile của Quỳnh; request có file timeout 30 s; request bị huỷ trả mã `CANCELED` (lib/axios gộp vào `NETWORK_ERROR`); 8 test Vitest + kiểm tra trong Chrome với Backend thật (tên file tiếng Việt, nhiều trường `tracks`, lỗi 401/415/422, huỷ request). | Done |
| **U-FE-02** `[FE]` | Trang `/upload`: bố cục 1 trang | `pages/UploadPage.jsx` thay `NotFoundPage` ở `ROUTES.UPLOAD` (đã nằm trong `ProtectedRoute`, Navbar đã có link *Upload*, **không sửa Navbar**). Đầu trang: đường dẫn *Profile / Upload a new sheet*, tiêu đề, mô tả ngắn, nút **Publish** (chưa gửi, bật ở U-FE-07). 2 cột (màn hẹp xếp 1 cột): trái là thẻ ①②③ có số thứ tự, phải là *Preview*, *Privacy*, *Copyright note*. Thẻ ②③ hiện trạng thái khoá đến khi có kết quả phân tích. State của trang gom một chỗ (hook `useUploadForm`) để các thẻ dùng chung, sửa thẻ này không mất dữ liệu thẻ khác. Style cartoon theo Library/Workspace (token, viền ink, bóng cứng).  **Kết quả:** `pages/UploadPage.jsx`, `UploadCard` (ô số thứ tự, trạng thái khoá), `CopyrightNote`, hook `useUploadForm`; route `/upload` không còn trỏ `NotFoundPage`. Kiểm tra trong Chrome 10/10: chưa đăng nhập về `/login`, đủ thành phần, khoá đúng thẻ, 2 cột ở 1920px, 1 cột ở 900px, không tràn ngang ở 375px, link *Upload* của Navbar mở đúng trang. | Done |
| **U-FE-03** `[FE]` | Thẻ ① File nhạc | Vùng kéo thả + nút *Choose a file*, chỉ 1 file. Kiểm tra đuôi `.mid`/`.midi` và ≤ 1 MB ngay ở FE (`config/upload.js`). Gọi `analyzeMidi`, dòng file hiện tên, dung lượng, thanh tiến trình (`onUploadProgress`) và trạng thái *Analyzing* / *Ready* / lỗi (message tiếng Anh từ BE theo `error.code`), nút ✕ để bỏ file (xoá kết quả phân tích, khoá lại ②③), chọn file khác thì thay file cũ. Phụ thuộc: U-FE-01, U-FE-02.  **Kết quả:** `FileDropzone`, `FileRow`, `utils/midiFile.js`, logic trong `useUploadForm` (`selectFile`, `analyze`, `removeFile`); thả nhiều file thì báo lỗi; chặn trình duyệt tự mở file khi thả ra ngoài vùng thả. Chrome 14/14: chọn bằng nút, thả file, kéo thả thật, lỗi FE không gửi request, lỗi BE hiện đúng câu, ✕ khoá lại thẻ, đổi file liên tục giữ đúng file cuối. | Done |
| **U-FE-04** `[FE]` | Thẻ ② Tracks | Bảng track: tên, nhạc cụ, số nốt, khoảng nốt, đánh dấu track gợi ý; checkbox chọn (ít nhất 1). Hiện `warnings`. Đổi lựa chọn thì gọi lại `analyzeMidi(file, tracks)` (huỷ lần gọi trước, bỏ qua lỗi `CANCELED`); BE trả `selectedTracks`, số nốt, thời lượng, độ khó gợi ý và cảnh báo theo track đang chọn. Phụ thuộc: U-FE-03. | To Do |
| **U-FE-05** `[FE]` | Thẻ ③ Thông tin bản nhạc | Title (bắt buộc, gợi ý sẵn từ tên file), composer (tuỳ chọn, để trống là *Unknown*), độ khó dạng nút chọn 4 mức (*Easy / Medium / Hard / Expert*, chọn sẵn mức gợi ý; người dùng đã tự chọn thì phân tích lại không ghi đè), tag dạng chip (chọn từ `GET /sheets/tags` hoặc thêm mới, tối đa 3), tempo / tông / nhịp / thời lượng / số nốt chỉ hiển thị. Báo lỗi ngay dưới từng ô. Phụ thuộc: U-FE-03. | To Do |
| **U-FE-06** `[FE]` | Cột phải: Preview, Privacy, Copyright | *Preview*: card bài như ở Library (dùng lại `SheetCover`), cập nhật ngay theo title, composer, độ khó, BPM, tông, nhịp, màu bìa (chọn 1 trong 4, mặc định ngẫu nhiên). *Privacy*: 2 lựa chọn *Public* (mọi người tìm thấy trong Library) / *Private* (chỉ mình bạn, mặc định). *Copyright note*: khung chữ lưu ý bản quyền. Phụ thuộc: U-FE-02. | To Do |
| **U-FE-07** `[FE]` | Publish | Bật nút *Publish* khi đã phân tích xong và form hợp lệ. Gửi `createSheet(file, { title, composer, difficulty, tags, coverColor, visibility, tracks })`, thanh tiến trình + khoá form trong lúc gửi, lỗi hiện tại thẻ liên quan, thành công thì chuyển sang `/workspace/:id`. Phụ thuộc: U-FE-04, U-FE-05, U-FE-06, U-BE-07. | To Do |
| **U-FE-08** `[FE]` | Nghe thử trước khi lưu *(tuỳ chọn)* | Nút *Preview* nghe thử ~15 giây đầu với các track đang chọn bằng `pianoSampler` chung (không đụng Transport của Workspace, dừng khi rời trang). Cần thêm tham số `preview` cho analyze trả nốt đã chuyển. Phụ thuộc: U-FE-04. | To Do |
| **U-FE-09** `[FE]` | *My uploads* | Danh sách bài của tôi (dùng lại `SheetCard`), đổi Public/Private, sửa thông tin, xoá (hỏi xác nhận). Đặt ở trang `/upload` (dưới form) hoặc trang riêng, chốt khi làm. Phụ thuộc: U-BE-09, U-BE-10. | To Do |
| **U-FE-10** `[FE]` | Hiển thị bài upload ở Library / Workspace | Badge *Private* và *Uploaded by …* trên `SheetCard` và `SheetInfoPanel`. Mở bài PRIVATE của người khác (404) dùng chung trang lỗi của E-02. Phụ thuộc: U-BE-08. | To Do |
| **U-FE-11** `[FE]` | Review Frontend | `npm run lint`, `npm test`, `npm run build`. Test tay toàn bộ luồng: upload 9 file mẫu + 1 file 1 track + 1 file lỗi; bài vừa upload chơi được ở Auto Play, Play, xem bản nhạc. Cập nhật `docs/`. | To Do |

> **Thứ tự đề xuất:** U-BE-01 → U-BE-02 → (U-BE-03 tuỳ chọn) → U-BE-04 → U-BE-05 → U-BE-06 → U-FE-01 → U-FE-02 → U-FE-03 → U-FE-04 → U-FE-05 → U-FE-06 → U-BE-07 → U-FE-07 → U-BE-08 → U-FE-10 → U-BE-09 → U-BE-10 → U-FE-09 → (U-FE-08 tuỳ chọn) → U-BE-11 → U-FE-11. U-BE-12 làm khi deploy. Làm xong luồng chính (upload được và chơi được) trước, quyền xem và quản lý bài sau.

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
| **E-02** `[FE]` | Bài nhạc không tồn tại | WorkspacePage khi API trả `404 SHEET_NOT_FOUND` thì hiện thông báo riêng (tiếng Anh) + nút về Library (không hiện nút *Try again* vô ích). Phụ thuộc: T-07A. | To Do |

> E-01 (trang 404) đã bỏ: Quỳnh đã làm `pages/NotFoundPage.jsx` + route `*` trong Feature Auth.

---

## Ghi chú thảo luận với Quỳnh (chưa thực hiện)

- **Navbar – ô search:** gõ + Enter thì chuyển sang `/library?q=...`.
- ~~**Navbar – menu**~~ và ~~**Pages** (tách Login/Register/Forgot)~~: Quỳnh đã làm trong Feature Auth.
- **Database:** PostgreSQL + Prisma, migration theo feature. Bảng `users` đưa vào Prisma ở C-07; Feature User sẽ thêm migration gắn `sheets.uploaderId` → `users.id`. File MIDI (Bình, upload sheet) và ảnh avatar (Quỳnh, edit profile) lưu trên cloud: nên dùng chung một dịch vụ lưu trữ, thống nhất trước khi làm.
- `index.html` chưa có favicon (trình duyệt báo 404 `/favicon.ico` ở mọi trang).
- HomePage hiện lỗi đỏ "Unable to access MIDI devices…" khi người dùng không cấp quyền Web MIDI; nên ẩn hoặc diễn đạt nhẹ hơn.
- **Upload:** chỉ nhận file MIDI. Engine: `src/features/uploads/midiToSheet.js` (BE), xem mục *User upload sheet (Bình)*.