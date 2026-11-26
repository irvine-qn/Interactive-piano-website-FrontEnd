# Ghi chú kỹ thuật – Frontend

Những điều cần biết khi làm việc với repo này: ai phụ trách phần nào, thay đổi lớn, cách Workspace phát nhạc, lỗi dễ mắc và việc còn mở.
Hướng dẫn cài đặt, cấu trúc thư mục, routes và quy ước Tailwind nằm ở [README](../README.md). Lịch sử thay đổi theo ngày: [CHANGELOG](CHANGELOG.md). Danh sách task: [TASK_DECOMPOSITION.md](../TASK_DECOMPOSITION.md).

> Khi một thay đổi ảnh hưởng tới người khác trong team (đổi route, đổi code dùng chung, cần chạy lệnh mới sau khi pull...), ghi thêm vào file này và `CHANGELOG.md`.

---

## 1. Ai phụ trách phần nào

| Phần                                                                                                                                 | Phụ trách                                | Ghi chú                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HomePage (`pages/HomePage.jsx`, `features/home/*`)                                                                                | **Quỳnh**                           | Bình **không sửa**. Cần dùng lại thì import (vd. Workspace dùng `features/home/api/pianoApi.js`)                                       |
| Auth (`features/auth/*`, `pages/auth/*`, `RouteGuards.jsx`, `useAuthStore.js`), Navbar mới, `NotFoundPage`                 | **Quỳnh**                           | Riêng chữ thương hiệu trên Navbar (C-04) Bình làm, giữ nguyên phần còn lại của Quỳnh                                                    |
| Sheet Library (`features/library/*`, `pages/LibraryPage.jsx`)                                                                     | **Bình** (nhánh `sheet-library`) | Quỳnh **không sửa**                                                                                                                           |
| Piano Workspace (`features/workspace/*`, `pages/WorkspacePage.jsx`)                                                               | **Bình** (nhánh `sheet-library`) | Quỳnh **không sửa**, kể cả Wait Mode (T-09) đang pending                                                                                   |
| User profile + User edit profile (`pages/profile/*`: trang profile, trang chỉnh sửa profile, ảnh avatar)                         | **Quỳnh**                           | Bình **không sửa**                                                                                                                            |
| User upload sheet (`features/upload/*`, `pages/UploadPage.jsx`, nhãn *Private* / *Uploaded by* trong `features/library/*`) | **Bình**                            | Quỳnh **không sửa**. Trang profile lấy bài của một người qua `getUserSheets(userId)` (`features/upload/api/uploadApi.js`, đã có) |
| Bài đã lưu của người dùng                                                                                                     | Chưa phân công                          |                                                                                                                                                        |
| Code dùng chung: `features/piano/audio/toneEngine.js`, `components/common/*`, `index.css`, `lib/axios.js`                    | Cả hai                                    | Chỉ sửa nếu **không đổi hành vi** của phần người kia. Sửa xong mở thử Home, Library, Workspace                                     |

> Phân công giữa **Nguyễn Thanh Bình** và **Nguyễn Thị Ngọc Quỳnh**. Khi đọc tài liệu/WBS này để làm việc, chỉ làm phần của người đang được giao; phần của người kia thì không sửa, cần đổi thì báo để người đó làm.

## 2. Thay đổi lớn cần biết khi pull

- **API `/api/v1` (2026-10-28):** `lib/axios.js` dùng `baseURL = ${VITE_API_URL}/api/v1`. `VITE_API_URL` **không** có `/api` ở cuối. Gọi API thì dùng đường dẫn tương đối (`/sheets`, `/piano`, `/auth/login`).
- **Backend Auth chuyển từ `pg` thuần sang Prisma (2026-11-04):** request/response của `/auth/register`, `/auth/login` giữ nguyên nên FE **không phải sửa gì**. Nhưng máy nào đã có DB cũ thì phải cập nhật DB một lần theo README của Backend mục 6.3 (xem `docs/NOTES.md` của repo Backend).
- **`pages/` phẳng (2026-10-29):** mỗi page là một file trong `pages/` (riêng auth/profile có thư mục con). `pages/sheet/` đã bỏ.
- **Giao diện tiếng Anh (2026-11-04):** mọi chữ trên UI viết tiếng Anh; comment trong code và WBS viết tiếng Việt.
- **Workspace (2026-11-04 → 11-05):**
  - Bỏ chế độ FREE_PLAY. Còn 2 chế độ là **Auto Play** (mặc định, bài tự phát) và **Wait Mode** (người dùng tự chơi).
  - `/workspace` không có id thì chuyển sang `/library`.
  - Bàn phím 88 phím và waterfall làm lại theo giao diện Home.
  - Control Bar có Restart, âm lượng, tốc độ; header Waterfall có Key labels và Octave Shift.
- **Giao diện mobile (2026-11-20):** phân biệt **thiết bị cảm ứng** bằng biến thể Tailwind `pointer-coarse:` (không theo độ rộng màn hình). Trên cảm ứng ẩn mọi thứ chỉ dùng cho bàn phím máy tính (dải Shortcuts, Zone, How to play, ký tự phím tắt). Bố cục điện thoại dùng `max-sm:` (dưới 640px) nên desktop không đổi. Hằng số dùng chung: `IS_TOUCH_SCREEN`, `DEFAULT_KEY_LABELS` trong `features/workspace/config/keyLayout.js`.
- **`API_BASE_URL` (2026-11-20):** không có `VITE_API_URL` thì dùng `<giao thức>//<tên máy đang mở trang>:5000` (`config/api.js`). Thử trên điện thoại: `npm run dev -- --host`, mở địa chỉ *Network* Vite in ra.
- **Auth (2026-11-20):** thêm trang `/reset-password`, `/verify-email` (không nằm trong `GuestRoute`, người đang đăng nhập vẫn mở được link). Khung trạng thái dùng chung: `AuthStatus` trong `AuthFormFields.jsx`.

## 3. Workspace: cách phát nhạc (đọc trước khi sửa `features/workspace/audio/*`)

### 3.1 Các file chính

| File                                                      | Vai trò                                                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `audio/songClock.js`                                    | "Đồng hồ bài nhạc": `Transport.bpm` = BPM gốc của bài ở 1x; `getSongTime()` / `setSongTime()` / `setPlaybackRate()` |
| `audio/sheetPlayer.js`                                  | Nạp bài vào `Tone.Part` (lên lịch theo **tick**), tự dừng khi hết bài, `silencePlayback()` khi dừng/tua          |
| `store/useWorkspaceStore.js`                            | Zustand: chế độ, phím đang nhấn, phím do bài bật sáng, quãng, âm lượng, tốc độ, nhãn phím, sheet                  |
| `canvas/practiceWaterfall.jsx`                          | Vẽ nốt rơi bằng canvas, đọc `getSongTime()` mỗi khung hình                                                                 |
| `components/ControlBar.jsx`                             | Chọn chế độ, timeline, tốc độ, Restart, Play/Pause, âm lượng; nghe sự kiện `start`/`pause`/`stop` của Transport   |
| `config/keyLayout.js`                                   | Vị trí 88 phím (A0–C8) dùng chung cho bàn phím **và** waterfall, để nốt rơi đúng phím                           |
| `hooks/useKeyMapping.js`, `hooks/useKeyboardInput.js` | Phím tắt máy tính theo bảng của Home (`GET /api/v1/piano`), Octave Shift, chống kẹt phím                                  |
| `hooks/useFollowNotes.js`                               | Mobile: khi đang phát, dời khung nhìn quãng theo nốt sắp rơi trong 3 giây tới                                                |
| `hooks/useWorkspaceVolume.js`                           | Âm lượng riêng của Workspace, trả lại mức gốc khi rời trang                                                                |

### 3.2 Những điều dễ làm hỏng

- **Chỉ Workspace dùng `Tone.Transport`.** Home không dùng, nên Workspace được đổi `Transport.bpm`. Nếu sau này Home cần Transport (vd. metronome theo nhịp) thì phải bàn lại, vì hai bên sẽ dùng chung một đồng hồ.
- **`pianoSampler` dùng chung với Home.** Workspace đổi âm lượng thì phải trả lại khi unmount (`useWorkspaceVolume` đã làm). Không sửa `toneEngine.js` theo cách đổi hành vi của Home.
- **Thời gian trong sheet là giây ở tốc độ gốc.** Đọc thời gian bài bằng `getSongTime()`, **không** dùng `Transport.seconds`: khi đổi tốc độ, `Transport.seconds` là giây thật đã trôi qua chứ không còn là vị trí trong bài.
- **Lookahead 0,1 giây của Tone:** `Tone.now()` đi trước tiếng đang phát 0,1 giây. `getSongTime()` khi đang phát đọc theo `Tone.context.currentTime`, nên nốt chạm vạch đúng lúc phím sáng và có tiếng. Dùng `Tone.now()` thì nốt chạm vạch sớm hơn khoảng 100ms (khoảng 15px).
- **Phím sáng theo bài** (`playbackKeys`) được bật/tắt qua `Tone.Draw.schedule`. Khi dừng, tua hay Restart phải hủy các lệnh Draw đang chờ (`Tone.Draw.cancel`), nếu không phím vừa tắt sẽ sáng lại. Việc này nằm trong `silencePlayback()` và `silenceNow()` của Control Bar.
- **Mỗi nốt tự nhả** (`triggerAttackRelease`). Đừng tách thành 2 sự kiện bấm/nhả riêng: Tone thỉnh thoảng bỏ sót hoặc chạy lặp một tick ở ranh giới giữa 2 nhịp xử lý, mất lệnh nhả là kẹt nốt (đã thử ở T-08D và phải bỏ).
- **Tua lùi 1 tick** (khoảng 3ms, xem `setSongTime`). Nếu tua đúng vào tick của một nốt, Tone có lúc làm tròn sang tick sau và bỏ mất nốt đó. Đồng hồ trên Control Bar cộng 10ms khi hiển thị để tua tới 1:00 vẫn hiện `1:00`.
- **Thứ tự trong Restart/tua:** gọi `silenceNow()` **trước** rồi mới `setSongTime()`. Làm ngược lại thì có lúc nốt nằm đúng điểm tua bị coi là sự kiện cũ và bị bỏ.
- **Sự kiện `pause`/`stop` của Transport** làm Control Bar tắt âm và xóa phím sáng. Khi làm Wait Mode (T-09B) phải tách "dừng do người dùng bấm" khỏi "dừng để chờ", nếu không phím người chơi đang giữ sẽ bị xóa (đã ghi trong WBS).
- **Phím tắt Practice:** bảng phím lấy từ `practiceKeys` của `GET /api/v1/piano`, tra theo `event.code` nên Shift không ảnh hưởng. `useKeyboardInput` bỏ qua phím khi focus đang ở ô gõ chữ (ô search, form), nhưng **không** bỏ qua khi focus ở thanh trượt (timeline, âm lượng). Ô select chọn xong tự bỏ focus.
- **Thứ tự khóa trong object:** JavaScript luôn xếp khóa dạng số (`"0"`–`"9"`) lên trước, nên đừng lấy "phím đầu/cuối" theo thứ tự `Object.values(noteByKey)` (lỗi cũ: nhãn hiện `E2-C6` thay vì `C1-C6`).
- **Waterfall không vẽ chữ tên nốt** (bỏ ngày 2026-11-20 theo yêu cầu). Tên nốt chỉ hiện trên phím đàn.
- **Phím cần bấm ở chế độ Play** (`playback-suggest`, màu xanh lá) được **đặt lại toàn bộ** bằng `useWorkspaceStore.setState({ playbackKeys })` mỗi khi tới hợp âm mới và xoá khi bấm đủ. Đừng đổi về cộng / trừ dần từng phím: sẽ còn phím sáng sót.
- **`handleUserNote` chỉ chạy ở chế độ Play.** Bỏ điều kiện này thì bấm phím lúc Auto Play đang dừng sẽ làm bài tự chạy ngầm.
- **Phím đàn dùng Pointer Events** (`Key.jsx`): chuột có nguồn `mouse`, mỗi ngón tay có nguồn `pointer-<id>`. Store và bộ phát âm nhả nốt theo nguồn, nên giữ đúng nguồn khi gọi `onPress` / `onRelease`.

### 3.3 Quy ước React/ESLint gặp nhiều

- Lấy dữ liệu từ store bằng `useShallow` (`zustand/react/shallow`) và chỉ lấy field cần dùng, để bàn phím không render lại cả 88 phím mỗi khi một phím sáng.
- ESLint (react-hooks v7) báo lỗi `set-state-in-effect`: trạng thái "đang tải" nên **suy ra** từ dữ liệu (vd. so `result.key` với `reloadKey`) thay vì gọi `setState` trong effect.
- ESLint bỏ qua biến và tham số viết hoa đầu (`varsIgnorePattern` / `argsIgnorePattern` là `^[A-Z_]`), giống template Vite React, vì `no-unused-vars` không hiểu biến dùng làm thẻ JSX (`<Icon />`).
- Màu và bóng dùng design token trong `index.css` (`var(--color-*)`, `var(--shadow-hard)`), kể cả trên canvas (đọc bằng `getComputedStyle`).

## 3b. Upload sheet (Bình)

- Gửi file bằng `FormData` thì **không tự đặt `Content-Type`** (axios tự thêm boundary). Mảng (tracks, tags) gửi thành nhiều trường cùng tên.
- Giới hạn file (1 MB, `.mid`/`.midi`, timeout 30 s) và thông tin bài (độ dài title, composer, số tag) ở `features/upload/config/upload.js`, **phải khớp Backend**.
- `lib/axios.js` (dùng chung) biến request bị huỷ thành `NETWORK_ERROR` *"Unable to connect to the server"*. `uploadApi.js` trả mã `CANCELED` để giao diện bỏ qua; nơi khác dùng `signal` thì kiểm tra `signal.aborted` trước khi hiện lỗi. Lỗi có thêm `details` nếu Backend gửi (vd `{ field: 'title' }`).
- **Mọi state của trang `/upload` nằm trong `useUploadForm`**: thẻ mới chỉ đọc/ghi qua hook, không tự giữ state riêng. Muốn lấy title / độ khó thì đọc `details`, không đọc `fields`: trong `fields` giá trị `null` nghĩa là chưa sửa, dùng gợi ý của Backend. Không gộp trạng thái đổi track vào trạng thái file (dòng file sẽ nhảy về *Analyzing*/*Failed* khi chỉ đổi track).
- Đừng bỏ đoạn chặn thả file toàn trang trong `FileDropzone`: lỡ thả ra ngoài thì trình duyệt mở file, rời trang, mất dữ liệu đang nhập.
- Bìa bài vẽ theo `id`. Preview ở `/upload` đoán id bằng `toSlug(title)` (`utils/sheetDetails.js`): đổi cách Backend tạo id thì sửa cả `toSlug`, nếu không bìa Preview sẽ khác bìa thật.
- `getUserSheets(userId)` dành cho trang profile của Quỳnh (bài PUBLIC của một người dùng).
- **Profile:** `ProfileSheetList` dùng chung cho cả 3 tab, đổi phần thông tin bằng `renderMeta`, nút bằng `renderActions`. `useMySheets` tính trang *Load more* từ số bài đang có (`nextPageToLoad`): đừng đổi thành cộng dồn số trang, xoá bài xong sẽ sót bài.
- **Ảnh hồ sơ:** Backend trả đường dẫn tương đối, hiển thị qua `toImageUrl` (`config/api.js`). `PhotoPositionDialog` cắt ảnh bằng canvas ở trình duyệt; chỉnh lại vị trí phải chọn lại ảnh vì Backend chỉ lưu bản đã cắt.
- **`npm uninstall` / `npm install <gói>` có thể hạ `eslint` từ 10 xuống 9**, làm lint báo hàng loạt lỗi `no-unused-vars` giả. Gặp thì kiểm tra `npm ls eslint`; thêm `--legacy-peer-deps` khi gỡ gói.

## 4. Giới hạn đã biết (chưa sửa)

| Vấn đề                                                                                                                                  | Ghi chú                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Đổi tốc độ đúng lúc một nốt đang ngân thì nốt đó vẫn ngân theo tốc độ cũ                                             | Các nốt sau đúng tốc độ mới. Muốn chính xác thì tua lại tại chỗ khi đổi tốc độ, nhưng sẽ cắt các nốt đang ngân |
| Tua vào giữa một nốt thì nốt đó không phát lại                                                                                  | Hành vi của `Tone.Part`                                                                                                               |
| Trang *Sheet not found* (và lúc đang tải bài): timeline vẫn hiện độ dài của bài trước, hoặc 4:10 nếu chưa mở bài nào | `duration` của `useWorkspaceStore` (mặc định 250 giây) không đặt lại khi tải bài lỗi                                      |
| Chunk bản nhạc (VexFlow) 562 kB, Vite vẫn cảnh báo lớn hơn 500 kB                                                                     | Chỉ tải khi bấm *Show sheet music*. Đã bỏ 5 bộ font thừa (C-05). Chunk Tone.js khoảng 420 kB dùng chung cho Home và Workspace       |
| Mobile: nốt hai tay cách nhau xa hơn số quãng màn hình hiện được thì khung nhìn ưu tiên phần trầm                                  | `pickViewOctave` trong `useFollowNotes.js`. Xoay ngang (4 quãng) để thấy cả hai tay                                                  |
| Đặt ngón lên phím rồi trượt sang phím khác thì nốt vẫn là phím ban đầu                                                                | Hành vi mặc định của Pointer Events trên cảm ứng. Chưa làm kiểu trượt ngón đổi phím                                                  |
| `/favicon.ico` báo 404 ở mọi trang                                                                                                    | `index.html` chưa có favicon                                                                                                          |

## 5. Việc đang chờ

- Review Workspace (T-10): **pending**. Chế độ chờ nốt nay có tên **Play** và đã chạy, logic nằm trong `audio/sheetPlayer.js`.
- **C-04** chữ thương hiệu trên Navbar mới (giữ con cáo), **C-05** tách bundle.
- **User profile / edit profile** (Quỳnh): còn đổi mật khẩu và các mục *Coming soon*.
- **Kết quả đánh giá code (2026-11-07):** AU-01 → AU-17 trong `TASK_DECOMPOSITION.md`. **Chưa nên deploy công khai** khi chưa xong nhóm 1. AU-01 (quên mật khẩu) và AU-07 (xác thực email) đã xong ngày 2026-11-20.
- **Giao diện mobile:** đã sửa đủ 11 trang theo thiết kế (MB-xx). Còn các tính năng chỉ có trong thiết kế (Playlist, Export, Chia sẻ, Lưu nháp, thanh độ mạnh mật khẩu...) và footer theo thiết kế: chờ quyết định.
- **Chưa có nút gửi lại email xác thực trên giao diện** (API `POST /auth/verify-email/resend` đã có). Tài khoản cũ chưa xác thực thì chưa dùng được Quên mật khẩu.
- Security: còn AU-04, AU-06; AU-05 mới có giới hạn CORS.

## 5b. Production (Cloudflare Workers)

- **Merge vào `main` là deploy.** Cloudflare Workers Builds chạy `npm run build` rồi `npx wrangler deploy` theo `wrangler.jsonc`.
- **`VITE_API_URL` đặt ở mục *Build variables*** trên Cloudflare, không phải biến runtime: Vite gắn giá trị vào code lúc build. Đổi URL Backend thì phải build lại.
- `wrangler.jsonc` bật `not_found_handling: "single-page-application"`: mọi đường dẫn không phải file đều trả `index.html` cho React Router. Đừng thêm `public/404.html`.
- Domain Frontend mới (vd thêm `www`) thì thêm vào `CORS_ORIGIN` của Backend, nếu không trình duyệt chặn request.
- Test component FE: chưa viết.

## 6. Kiểm tra trước khi tạo PR

1. `npm run lint`, `npm test` và `npm run build` không lỗi (cảnh báo chunk VexFlow lớn hơn 500 kB là bình thường).
2. Chạy Backend (PostgreSQL bật, đã migrate và seed), `npm run dev`, rồi mở thử:
   - `/`: Home chơi được bằng chuột và phím, metronome chạy, Octave Shift của Home đúng.
   - `/library`: tìm kiếm, lọc, sắp xếp, phân trang; bấm *Practice* mở Workspace.
   - `/workspace/merry-christmas-mr-lawrence`:
     - Play/Pause/Restart, tua;
     - đổi tốc độ 0.5x–1.5x, âm lượng (rời sang Home thì âm lượng Home vẫn như cũ);
     - nốt rơi đúng phím, tay phải cam, tay trái xanh;
     - Play: nốt chạm vạch thì dừng, nhấn đủ mới chạy tiếp; phím tắt, Octave Shift, Key labels.
   - `/upload` (đã đăng nhập): chọn một file mẫu, đổi track, sửa thông tin, *Publish* mở được bài ở Workspace; xoá bài thử khi xong.
   - `/profile`: tab *Uploaded sheets* sửa, đổi Public/Private, xoá bài; tab *Practice history*.
   - `/profile/edit`: đổi avatar, ảnh bìa, kéo chỉnh vị trí; Navbar hiện avatar mới.
   - `/workspace/khong-co-bai-nay`: hiện *Sheet not found* và nút về Library.
   - `/workspace` chuyển sang `/library`; `/login`, `/register`, một URL không tồn tại ra trang 404.
   - `/forgot-password` → mở link trong email (hoặc console Backend) → `/reset-password` đổi được mật khẩu; mở lại link thì báo hết hạn. Tương tự `/verify-email`.
   - **Mobile:** DevTools bật Device Toolbar (Ctrl+Shift+M), chọn một điện thoại, tải lại trang. Shortcuts phải ẩn, bàn phím giữ nhiều ngón được, các thanh nút cố định ở đáy (Upload, Edit profile) không che nội dung. Tắt Device Toolbar thì shortcuts hiện lại.
3. Mở DevTools Console: không có lỗi đỏ mới (ngoài favicon và MIDI ở Home đã biết).
