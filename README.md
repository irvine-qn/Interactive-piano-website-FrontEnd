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

Cấu trúc frontend hiện tại:

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

### Một số thư mục / file quan trọng

| File / Folder    | Chức năng                           |
| ---------------- | ----------------------------------- |
| `src/`           | Source code chính của Frontend      |
| `src/assets/`    | Images, icons và các static assets  |
| `src/App.jsx`    | Component chính của ứng dụng        |
| `src/main.jsx`   | Entry point của React               |
| `public/`        | Static files                        |
| `package.json`   | Quản lý dependencies và scripts     |
| `vite.config.js` | Cấu hình Vite                       |
| `.gitignore`     | Các file không được push lên GitHub |

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

Nếu project sử dụng environment variables, tạo file:

```text
.env
```

Ví dụ:

```env
VITE_API_URL=http://localhost:5000/api
```

Sau đó sử dụng trong React:

```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

> Không commit các secret hoặc API key lên GitHub.

Nếu có `.env`, nên tạo thêm:

```text
.env.example
```

Ví dụ:

```env
VITE_API_URL=
```

Các thành viên khác có thể copy:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

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
