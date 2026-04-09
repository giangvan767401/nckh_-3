# Hướng dẫn chạy dự án nckh-<3

Dự án bao gồm hai phần chính: **Backend (NestJS)** và **Frontend (React/Vite)**. Để chạy toàn bộ dự án, bạn cần thực hiện theo các bước sau:

## 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên (Để kiểm tra: `node -v`).
- **NPM**: Đi kèm với Node.js.

## 2. Cài đặt Dependencies
Bạn cần cài đặt thư viện cho cả hai phần backend và frontend.

### Frontend
Mở terminal tại thư mục gốc của dự án (`d:\workspace\nckh-_3`) và chạy:
```bash
npm install
```

### Backend
Di chuyển vào thư mục `backend` và cài đặt:
```bash
cd backend
npm install
```

## 3. Cấu hình Môi trường (Environment Variables)
- **Backend**: Kiểm tra file `backend/.env`. Bạn cần cung cấp `GEMINI_API_KEY` nếu muốn sử dụng tính năng liên quan đến AI.
- **Frontend**: Kiểm tra file `.env.local` ở thư mục gốc.

## 4. Chạy Dự án
Bạn cần mở **hai terminal** riêng biệt để chạy đồng thời backend và frontend.

### Terminal 1: Chạy Backend
```bash
cd backend
npm run start:dev
```
*Backend sẽ chạy tại: `http://localhost:3000/api`*

### Terminal 2: Chạy Frontend
```bash
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:5173`*

## 5. Lưu ý
- Nếu bạn gặp lỗi "Missing script: start:dev" khi chạy ở thư mục gốc, đó là do lệnh này chỉ tồn tại trong thư mục `backend`. Hãy nhớ `cd backend` trước khi chạy.
- Database sử dụng SQLite (`elearning.db` trong `backend/data`), nên bạn không cần cài đặt thêm MySQL hay MongoDB.
