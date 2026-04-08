# 🎓 EduVision AI — Nền Tảng Học Tập Thông Minh

> **Nghiên Cứu Khoa Học (NCKH)** — Nền tảng e-learning tích hợp AI/ML để dự đoán kết quả học tập của sinh viên theo thời gian thực.

---

## 👥 Thành Viên Nhóm

| STT | Họ và Tên | Vai trò |
|-----|-----------|---------|
| 1 | **Phạm Văn Giang** | Trưởng nhóm / Full-stack Developer |
| 2 | **Từ Hữu Minh Vũ** | Frontend Developer / UI Design |
| 3 | **Trần Hà Quang** | Backend Developer / AI/ML Integration |

---

## 📌 Giới Thiệu

**EduVision AI** là nền tảng học trực tuyến thế hệ mới, sử dụng mô hình học máy (PyTorch) để:

- 📊 Theo dõi hành vi học tập của sinh viên theo thời gian thực (telemetry)
- 🤖 Dự đoán nguy cơ thất bại/thành công trong từng module học
- 🏫 Hỗ trợ giảng viên quản lý khoá học, upload model AI và xem analytics
- 🛒 Cho phép sinh viên đăng ký, mua và học các khoá học trực tuyến

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 19** + **TypeScript** — UI framework
- **Vite** — Build tool
- **React Router v7** — Routing
- **Zustand** — State management
- **Lucide React** — Icon library
- **React Toastify** — Notifications

### Backend
- **NestJS** — Node.js framework
- **TypeORM** + **PostgreSQL** — Database
- **JWT** — Authentication
- **Socket.IO** — Real-time communication
- **Stripe** — Payment processing

### AI/ML
- **PyTorch** — Deep learning model
- Custom inference bridge cho dự đoán kết quả học tập

---

## 🚀 Cài Đặt & Chạy Local

### Yêu cầu
- **Node.js** >= 18
- **npm** hoặc **yarn**
- Backend server đang chạy tại `http://localhost:3000`

### Bước 1: Clone project
```bash
git clone <repo-url>
cd nckh_-3
```

### Bước 2: Cài dependencies
```bash
npm install
```

### Bước 3: Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

### Build production
```bash
npm run build
npm run preview
```

---

## 📁 Cấu Trúc Project

```
nckh_-3/
├── pages/
│   ├── LandingPage.tsx       # Trang chủ
│   ├── Login.tsx             # Đăng nhập
│   ├── Signup.tsx            # Đăng ký
│   ├── CourseCatalog.tsx     # Danh sách khoá học
│   ├── CourseDetail.tsx      # Chi tiết khoá học
│   ├── CourseLearning.tsx    # Giao diện học tập
│   ├── StudentDashboard.tsx  # Dashboard sinh viên
│   ├── AdminDashboard.tsx    # Dashboard giảng viên/admin
│   ├── PredictionPage.tsx    # Trang dự đoán AI
│   ├── CartPage.tsx          # Giỏ hàng
│   ├── MessagesPage.tsx      # Tin nhắn
│   ├── ProfilePage.tsx       # Hồ sơ người dùng
│   └── CourseEditor.tsx      # Trình soạn thảo khoá học
├── App.tsx                   # Root component + Routing
├── store.ts                  # Zustand state stores
├── api.ts                    # Axios API client
├── types.ts                  # TypeScript interfaces
└── backend/                  # NestJS backend
```

---

## 🔑 Tài Khoản Demo

| Role | Email | Password |
|------|-------|----------|
| 👨‍🎓 Sinh viên | `student@nckh.edu.vn` | `password123` |
| 👨‍🏫 Giảng viên | `instructor@nckh.edu.vn` | `password123` |

---

## 🎯 Tính Năng Chính

### Dành cho Sinh viên
- ✅ Đăng ký, đăng nhập tài khoản
- ✅ Duyệt và mua khoá học
- ✅ Xem video bài giảng, làm quiz
- ✅ Theo dõi tiến độ học tập
- ✅ Nhận chứng chỉ hoàn thành
- ✅ Nhắn tin với giảng viên

### Dành cho Giảng viên / Admin
- ✅ Quản lý khoá học (tạo, sửa, xóa)
- ✅ Upload mô hình AI (.pth)
- ✅ Xem learning analytics chi tiết
- ✅ Dự đoán nguy cơ thất bại của sinh viên
- ✅ Quản lý ML weights registry

---

## 📡 API Endpoints Chính

```
POST   /api/auth/login          — Đăng nhập
POST   /api/auth/register       — Đăng ký
GET    /api/courses             — Lấy danh sách khoá học
GET    /api/courses/my          — Khoá học đã đăng ký
GET    /api/courses/teaching    — Khoá học đang dạy
POST   /api/models/upload       — Upload mô hình AI
POST   /api/models/:id/activate — Kích hoạt mô hình
POST   /api/predictions/run/:course/:student — Chạy inference
GET    /api/logs                — Lấy learning logs
```

---

## 📄 License

Dự án được thực hiện phục vụ mục đích **Nghiên Cứu Khoa Học** — Không sử dụng cho mục đích thương mại.

---

<div align="center">

Made with ❤️ by **Nhóm NCKH** — Phạm Văn Giang · Từ Hữu Minh Vũ · Trần Hà Quang

</div>
