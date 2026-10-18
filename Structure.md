Fiano-FrontEnd/
 ┣ public/               # File tĩnh không cần compile (favicon, soundfonts mẫu)
 ┗ src/
    ┣ assets/            # Hình ảnh (như ảnh chú cáo Cáo), icons, global CSS
    ┣ components/        # UI Components dùng chung toàn app (Button, Modal, Navbar, Footer)
    ┣ config/            # Cấu hình chung (Hằng số API_URL, cấu hình phím đàn mặc định...)
    ┣ features/          # 🌟 [LÕI KIẾN TRÚC FEATURE-BASED]
    ┃ ┣ auth/            # 1. Nghiệp vụ: Xác thực (Đăng nhập, Quên MK)
    ┃ ┃ ┣ api/           # Các hàm gọi Axios cho auth
    ┃ ┃ ┗ components/    # LoginForm, RegisterForm
    ┃ ┣ library/         # 2. Nghiệp vụ: Thư viện Sheet nhạc
    ┃ ┃ ┣ api/           # Fetch sheet nhạc, thêm vào yêu thích
    ┃ ┃ ┣ components/    # SheetCard, FilterBar, Pagination
    ┃ ┃ ┗ store/         # Zustand store cho bộ lọc (Filter State)
    ┃ ┗ workspace/       # 3. Nghiệp vụ lõi: Trải nghiệm chơi nhạc (Piano + Waterfall)
    ┃   ┣ audio/         # 🌟 Chứa logic Tone.js (ToneEngine.js, SamplerLoader.js)
    ┃   ┣ canvas/        # 🌟 Chứa logic HTML5 <canvas> (WaterfallRenderer.js, Physics)
    ┃   ┣ components/    # PianoKeyboard, ControlPanel, WaterfallView
    ┃   ┗ store/         # 🌟 Zustand store siêu tốc (Lưu BPM, isPlaying, mảng activeNotes)
    ┗ profile/         # 🌟 [MỚI BỔ SUNG] Quản lý thông tin cá nhân
        ┣ api/          # Lấy thông tin user, cập nhật avatar, lấy ds yêu thích
        ┣ components/   # ProfileSettingsForm, FavoriteSheetsGrid
        ┗ pages/        # UserProfilePage
    ┣ hooks/             # Custom hooks chung (useWindowSize, useDebounce...)
    ┣ layouts/           # Layout bọc ngoài (MainLayout cho thư viện, FullScreenLayout cho Workspace)
    ┣ lib/               # Khởi tạo thư viện bên thứ 3 (Axios instance, React Query client)
    ┣ pages/             # Lắp ghép các Features thành 1 trang (HomePage, WorkspacePage)
    ┣ routes/            # Cấu hình React Router (Các đường dẫn URL)
    ┣ store/             # Zustand global store (Lưu thông tin User đang đăng nhập)
    ┣ utils/             # Các hàm tiện ích (formatTime, tính toán tần số Hz từ nốt nhạc)
    ┣ App.jsx
    ┗ main.jsx           # Entry point