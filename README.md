# Interactive-piano-keyboard-website
A web-based instrument that contain interactive piano keyboard (you can use both keyboard or mouse) and music sheet that users upload.
The website includes FE, BE and database and deployment.

- Class project: Web app
- Team members: Nguyen Thanh Binh, Nguyen Thi Ngoc Quynh


# Technologies
Runtime Environment: NodeJS

Language: Javascript

Deployment: mua tên miền

Database: PostgreSQL

Rest API: 

Libraries: ReactJS

Framework: Express.js

Method tạo âm nhạc:


# Các feature chính
Interactive Piano:

Music sheet upload: 

Sign in (lưu nhạc, bản sheet upload): phải đăng nhập mới chơi được music sheet

# Hướng phát triển: 
- Cho phép hướng dẫn người dùng chơi music sheet theo bàn phím


# Ý tưởng cho các feature



"How to use git reposity in practice"
---
# Frontend

Frontend của project được xây dựng bằng **React + Vite + Tailwind CSS**.

## 🛠️ Technologies

* React
* Vite
* Tailwind CSS
* Axios
* Lucide React
* npm

---

## 📋 Requirements

Trước khi chạy project, cần cài:

### Node.js

Khuyến nghị sử dụng **Node.js LTS**.

Kiểm tra Node.js:

```bash
node -v
```

Kiểm tra npm:

```bash
npm -v
```

Nếu chưa cài Node.js, tải tại:

https://nodejs.org/

---

# 🚀 Getting Started

## 3. Cài đặt dependencies

Chạy:

```bash
npm install
```

Lệnh này sẽ đọc file `package.json` và tự động cài toàn bộ thư viện cần thiết.

---

## 4. Chạy Frontend

> Frontend lấy dữ liệu từ Backend (cấu hình piano ở Home, danh sách bài ở Sheet Library, nốt nhạc ở Workspace).
> Hãy chạy Backend trước theo README của repo `Interactive-piano-website-Backend`: bật PostgreSQL (`docker compose up -d`), `npm run db:migrate`, `npm run db:seed`, rồi `npm start` (mặc định `http://localhost:5000`).

Sau khi cài dependencies:

```bash
npm run dev
```

Terminal sẽ hiển thị URL tương tự:

```text
Local: http://localhost:5173/
```

Mở trình duyệt và truy cập:

```text
http://localhost:5173
```

---

# 📁 Project Structure

Cấu trúc frontend hiện tại (feature-based: nghiệp vụ nằm trong `features/`, `pages/` chỉ ghép component):

```text
frontend/
├── src/
│   ├── assets/
│   ├── components/common/     # Navbar, Footer dùng chung
│   ├── config/api.js          # API_BASE_URL từ VITE_API_URL
│   ├── features/
│   │   ├── home/              # Virtual piano trang chủ
│   │   ├── piano/audio/       # toneEngine (Tone.js Sampler) dùng chung Home + Workspace
│   │   ├── workspace/         # Trang luyện tập: store, audio, canvas waterfall, bàn phím
│   │   └── library/           # Sheet Library
│   │       ├── api/           # libraryApi: getSheets, getTags
│   │       ├── components/    # LibraryBrowser, LibraryToolbar, LibraryFilters, SheetGrid, SheetCard, SheetCover, Pagination
│   │       ├── config/        # difficulty (nhãn + màu badge)
│   │       ├── hooks/         # useLibraryQuery (bộ lọc theo URL), useTags
│   │       └── utils/         # pagination (dãy số trang)
│   ├── lib/axios.js           # apiClient: baseURL `${VITE_API_URL}/api/v1`, chuẩn hoá lỗi
│   ├── pages/                 # HomePage, LibraryPage, WorkspacePage
│   ├── routes/AppRoutes.jsx
│   ├── utils/format.js        # formatCount (45.2K), formatDuration (03:45)
│   ├── App.jsx
│   ├── index.css              # Design tokens (--color-*, --shadow-hard...)
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

### Routes

| URL | Page | Ghi chú |
| --- | --- | --- |
| `/` | `HomePage` | Virtual piano + metronome |
| `/library` | `LibraryPage` | Thư viện bản nhạc. Bộ lọc nằm trên URL: `?q=&difficulty=&tag=&sort=&page=` |
| `/workspace/:sheetId` | `WorkspacePage` | Luyện tập một bài, ví dụ `/workspace/canon-in-d` |
| `/workspace` | → `/library` | Chưa chọn bài (vd. nút *Practice* trên Navbar) thì chuyển sang Library để chọn |
| `/login`, `/register`, `/forgot-password` | `pages/auth/*` | Chỉ dành cho khách (`GuestRoute`), đã đăng nhập thì chuyển đi |
| `/profile`, `/upload` | `pages/profile/*`, … | Cần đăng nhập (`ProtectedRoute`), chưa đăng nhập thì về `/login` |
| `*` | `NotFoundPage` | Trang 404 |

Đường dẫn được khai báo tập trung trong `src/config/routes.js` (`ROUTES`). Chữ hiển thị trên giao diện dùng **tiếng Anh**.

---

# 🎼 Sheet Library

Trang `/library` hiển thị danh sách bản nhạc từ `GET /api/v1/sheets`.

* **Tìm kiếm** theo tên bài / tác giả: gõ xong 300ms mới tìm (Enter để tìm ngay, ✕ để xoá).
* **Sắp xếp** (*Sort by*): Most popular (mặc định), Most liked, Newest, Title (A–Z).
* **Lọc** theo độ khó (*Easy / Medium / Hard / Expert*) và thể loại (*Genre*, lấy từ `GET /api/v1/sheets/tags`).
* **Phân trang** 8 bài / trang (*Page x of y*).
* Card **"Practice"** mở `/workspace/:id`.

URL là nguồn sự thật của bộ lọc (hook `useLibraryQuery`): F5, nút Back và chia sẻ link đều giữ nguyên kết quả. Giá trị mặc định không ghi lên URL, giá trị sai trên URL (vd. `?sort=abc`) tự quay về mặc định, `?page` vượt quá số trang tự chuyển về trang cuối.

Các trạng thái: khung xương khi tải lần đầu, giữ lưới cũ (làm mờ) khi đổi bộ lọc, "No sheets found" khi rỗng, thông báo "Could not load the library" + nút "Try again" khi không gọi được Backend.

Ảnh bìa (`SheetCover`) vẽ bằng CSS/SVG, không dùng file ảnh: màu nền theo `coverColor` của bài, nốt nhạc và góc nghiêng sinh cố định theo `id` (mỗi bài một bìa, tải lại không đổi).

Nút Like / Add to collection sẽ được thêm khi có Feature User.

---

# 📦 Installed Packages

Project hiện đang sử dụng các package chính:

### React + Vite

React được sử dụng để xây dựng giao diện.

Vite được sử dụng để chạy development server và build project.

### Axios

Dùng để gọi API từ Frontend đến Backend.

Ví dụ:

```javascript
import axios from "axios";

const response = await axios.get("http://localhost:5000/api/example");
```

### Lucide React

Dùng để sử dụng các icon trong giao diện.

Ví dụ:

```jsx
import { User, Home } from "lucide-react";

<User />
<Home />
```

### Tailwind CSS

Dùng để styling giao diện bằng utility classes.

Ví dụ:

```jsx
<button className="px-4 py-2 rounded-lg bg-blue-500 text-white">
  Button
</button>
```

---

# 🔧 Available Commands

Các lệnh thường dùng:

### Start development server

```bash
npm run dev
```

### Build project

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

# 🔄 Development Workflow

Sau khi clone project, mỗi thành viên có thể làm theo quy trình:

```bash
git clone <repository-url>

cd project-name

cd frontend

npm install

npm run dev
```

Sau khi code:

```bash
git status

git add .

git commit -m "feat: add homepage"

git push
```

Nếu làm việc theo branch:

```bash
git checkout -b feature/homepage
```

Sau khi hoàn thành:

```bash
git add .
git commit -m "feat: add homepage"
git push -u origin feature/homepage
```

Sau đó tạo **Pull Request** trên GitHub để merge vào branch chính.

---

# ⚠️ Important Notes

## 1. Không commit `node_modules`

`node_modules` đã được thêm vào `.gitignore`.

Vì vậy **không push `node_modules` lên GitHub**.

Nếu clone project về máy mới, chỉ cần:

```bash
npm install
```

npm sẽ tự tạo lại `node_modules`.

---

## 2. Không commit `dist`

Thư mục `dist` cũng đã được thêm vào `.gitignore`.

Không cần push thư mục này lên GitHub.

Khi cần build lại project:

```bash
npm run build
```

---

## 3. Environment Variables

Frontend chỉ có một biến môi trường:

```env
# URL gốc của Backend, KHÔNG có /api ở cuối (axios tự nối /api/v1)
VITE_API_URL=http://localhost:5000
```

Nếu không tạo file `.env`, code mặc định dùng `http://localhost:5000` (xem `src/config/api.js`). Chỉ cần tạo `.env` khi Backend chạy ở địa chỉ khác.

> `.env` đã nằm trong `.gitignore`. Mọi biến `VITE_*` đều bị đưa thẳng vào JS gửi xuống trình duyệt, nên **không bao giờ đặt secret/API key** vào env của Frontend.

Tạo `.env` từ file mẫu:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

## 4. Tailwind không có preflight

`src/index.css` chỉ import `tailwindcss/theme.css` và `tailwindcss/utilities.css`, **không có preflight** (bộ reset CSS). Vì vậy:

* `h1`–`h6`, `p`, `ul`, `ol` vẫn giữ margin/padding mặc định của trình duyệt → thêm `m-0`, `p-0`, `list-none` khi cần.
* Khi chỉ muốn viền một cạnh với nét đứt (`border-t-2 border-dashed`), thêm `border-0` trước để 3 cạnh còn lại không hiện viền mặc định.
* `button`, `input`, `select` không tự kế thừa font → thêm `font-[inherit]`.

Dùng màu và bóng qua design tokens trong `index.css` (vd. `bg-[var(--color-brand)]`, `shadow-[var(--shadow-hard)]`) thay vì mã màu hex.

---

# 🐛 Troubleshooting

## `npm install` bị lỗi

Thử kiểm tra version:

```bash
node -v
npm -v
```

Sau đó có thể xóa `node_modules` và cài lại:

```bash
rm -rf node_modules
npm install
```

Trên Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

---

## Port 5173 đang được sử dụng

Nếu Vite báo port `5173` đang được sử dụng, Vite có thể tự động chuyển sang port khác, ví dụ:

```text
http://localhost:5174
```

Hãy truy cập URL được hiển thị trong terminal.

---

# 👥 Team Development

Khi có thay đổi mới từ GitHub:

```bash
git pull origin main
```

Sau đó cài thêm dependencies nếu `package.json` đã thay đổi:

```bash
npm install
```

Chạy


---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
