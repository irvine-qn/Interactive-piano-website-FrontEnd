# Nhật ký thay đổi – Frontend

Ghi các thay đổi quan trọng theo ngày (mới nhất ở trên). Chỉ ghi những gì người khác trong team cần biết. Chi tiết từng việc xem commit hoặc [TASK_DECOMPOSITION.md](../TASK_DECOMPOSITION.md).
Mục **Cần làm sau khi pull** là các lệnh phải chạy trên máy của bạn.

---

## 2026-11-06 – Chọn file MIDI (U-FE-03, Bình)

- Thẻ ① của `/upload`: kéo thả hoặc *Choose a file*, kiểm tra đuôi và dung lượng ngay ở FE, gửi đi phân tích, dòng file có thanh tiến trình và trạng thái (*Ready* / *Failed* kèm lý do), nút ✕ để bỏ file. Phân tích xong thì thẻ ② ③ và Preview mở khoá (nội dung làm ở các task sau).
- Thêm `formatFileSize` trong `utils/format.js`.

## 2026-11-06 – Trang /upload (U-FE-02, Bình)

- `/upload` (link *Upload* trên Navbar, cần đăng nhập) không còn là trang 404: khung trang theo thiết kế, thẻ ① File nhạc, ② Tracks, ③ Sheet details, Preview, Privacy, Copyright note. Chưa chọn được file (U-FE-03).

## 2026-11-06 – Lớp gọi API upload (U-FE-01, Bình)

- Thêm `features/upload/api/uploadApi.js` và `features/upload/config/upload.js`: phân tích file MIDI, tạo bài, bài của tôi / của một người dùng (cho trang profile của Quỳnh), sửa, xoá. Chưa có giao diện.
- Request bị huỷ trả mã `CANCELED` thay vì `NETWORK_ERROR` (xem `docs/NOTES.md` mục 3b).

## 2026-11-05 – Hoá biểu, dấu nối và test

- Bản nhạc có hoá biểu và dấu nối (dữ liệu từ Backend).
- Home không còn hiện lỗi đỏ khi trình duyệt không cấp quyền Web MIDI.
- Chế độ Play: Zone về đúng vị trí ngay khi vào chế độ và khi hết bài, khoá dời Zone bằng tay.
- Thêm `npm test` (Vitest), file test đặt cạnh code.

**Cần làm sau khi pull:** `npm install`.

## 2026-11-05 – Đồng bộ Home và Practice

- Home và Practice dùng chung bàn phím 88 phím (`PianoKeybed`), cách đọc phím (`useKeyboardInput`, `useKeyMapping`), `KeyLabelSelect`, `OctaveShiftControl` và nút How to play.
- Practice có dải Shortcuts nằm ngang: mỗi cột là một lần nhấn, phím nhấn cùng lúc xếp ở dòng dưới. Nút Hide/Show shortcuts để ẩn hoặc hiện dải.
- Zone 1 di chuyển bằng mũi tên trái phải, Zone 2 bằng mũi tên lên xuống. Giữ `A F K` hoặc `1 4 8` rồi nhấn một nốt để chơi hợp âm.

**Cần làm sau khi pull:** `npm install`, cập nhật Backend theo `docs/CHANGELOG.md` của repo Backend.

## 2026-11-05 – Phím Practice hai tay

- Bỏ Shift: mỗi nốt thăng có phím riêng, Zone 1 dùng hàng `Z`/`S`, Zone 2 dùng hàng `Q`/`2`.
- Chế độ Play tự đổi quãng theo bài. Mỗi hợp âm cần nhấn tối đa 4 nốt, các nốt còn lại tự kêu.
- Practice nhận đàn MIDI nếu trình duyệt được cấp quyền.

**Cần làm sau khi pull:** cập nhật Backend theo `docs/CHANGELOG.md` của repo Backend.

## 2026-11-05 – Đổi logic Practice

- Auto Play: người dùng chơi được phím trong lúc bài đang chạy.
- Khi chưa bắt đầu, nhấn đúng nốt đầu tiên của bài thì bài chạy từ nốt đó.
- Wait Mode đổi tên thành **Play** và đã có logic chờ: nốt chạm vạch thì dừng, nhấn đủ các nốt mới chạy tiếp. Danh sách nốt phải nhấn lấy từ `chords` của Backend.

## 2026-11-05 – Bản nhạc trong Workspace

- Workspace có nút chuyển giữa Waterfall và bản nhạc (`canvas/sheetMusicScore.jsx`, dùng VexFlow). Dữ liệu bản nhạc lấy từ `GET /sheets/:id/score` của Backend.

**Cần làm sau khi pull:** `npm install`.

## 2026-11-05 – Lượt xem và lượt thích thật

- Lượt xem chỉ tăng khi bấm *Practice* ở Library. F5 hoặc mở thẳng link không tính.
- Thêm `LikeButton` ở card Library và Workspace. Chưa đăng nhập thì chuyển sang trang đăng nhập.

**Cần làm sau khi pull:** cập nhật Backend theo `docs/CHANGELOG.md` của repo Backend.

## 2026-11-05

- Thêm thư mục `docs/` (`NOTES.md`, `CHANGELOG.md`) để ghi chú kỹ thuật và nhật ký thay đổi.
- **Wait Mode (T-09) và review Workspace (T-10) chuyển sang pending**, làm sau Feature Upload MIDI.
- Workspace – tốc độ phát (T-08D, T-08E):
  - Nốt được lên lịch theo nhịp của bài (`songClock.js`).
  - Control Bar có ô `− 96 BPM +` để chọn 0.5x / 0.75x / 1x / 1.25x / 1.5x. Đổi bài thì tốc độ về 1x.
- Workspace – sửa lỗi đồng bộ:
  - Nốt từng chạm vạch sớm hơn lúc phím sáng khoảng 100ms.
  - Sau khi dừng/tua đôi khi còn kêu nốt của vị trí cũ.
  - Tua đúng điểm bắt đầu một nốt đôi khi mất nốt đó.
- Header Waterfall có thêm **Octave Shift** (T-08F) và **Key labels** (T-08G) giống Home.
- Sửa nhãn dải phím tắt (hiện `E2-C6` thay vì `C1-C6`). Kéo timeline/âm lượng xong thì phím tắt vẫn chơi được ngay.

## 2026-11-04 – Merge Auth, giao diện Workspace mới (C-06B, C-08, T-05 → T-08C)

- Merge `develop` (Feature Auth, Navbar mới, NotFoundPage của Quỳnh) vào `sheet-library` (Bình). Giữ toàn bộ route của Quỳnh, thêm `/library`.
- Sheet Library chuyển sang tiếng Anh (C-08).
- Workspace:
  - Bỏ FREE_PLAY, mặc định Auto Play; bàn phím 88 phím A0–C8. `/workspace` không có id thì chuyển sang `/library`.
  - Tối ưu render; tách phím do người dùng nhấn (`pressedKeys`) và phím do bài bật sáng (`playbackKeys`); ở Auto Play không nhận phím của người dùng.
  - Phím tắt dùng bảng của Home, chống kẹt phím, logic Octave Shift.
  - Bố cục 3 tầng; card thông tin bài; mỗi lần mở bài tăng 1 lượt xem.
  - Bàn phím và waterfall giống Home, màu theo tay (phải cam, trái xanh).
  - Control Bar kiểu cartoon, nút Restart, âm lượng thật (chỉ trong Workspace).
- Backend đổi Auth từ `pg` thuần sang Prisma: FE không phải sửa gì.

**Cần làm sau khi pull:** `npm install`. Cập nhật Backend theo `docs/CHANGELOG.md` của repo Backend (thường là `npm run db:deploy` một lần).

## 2026-10-29 – Sheet Library (C-03, L-FE-01 → L-FE-10)

- Trang `/library`: tìm kiếm, sắp xếp, lọc độ khó/thể loại, phân trang; bộ lọc lưu trên URL.
- `pages/` chuyển sang cấu trúc phẳng (`pages/WorkspacePage.jsx`).

**Cần làm sau khi pull:** `npm install`. Backend cần `npm run db:migrate` và `npm run db:seed`.

## 2026-10-28 – API `/api/v1` (C-02)

- `lib/axios.js` dùng `baseURL = ${VITE_API_URL}/api/v1` (đi cùng thay đổi C-01 của Backend). `VITE_API_URL` không có `/api` ở cuối.

**Cần làm sau khi pull:** nếu có file `.env`, kiểm tra `VITE_API_URL=http://localhost:5000` (không kèm `/api`).
