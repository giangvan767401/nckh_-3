# Bản Đặc tả Use Case: Hệ thống Học tập NCKH

## 1. Giới thiệu
Tài liệu này mô tả chi tiết các trường hợp sử dụng (Use Case) của hệ thống **NCKH Learning Systems**. Hệ thống tập trung vào việc cung cấp nền tảng học tập trực tuyến tích hợp trí tuệ nhân tạo để theo dõi và dự báo kết quả học tập của học viên.

## 2. Các Tác nhân (Actors)

| Tác nhân | Mô tả |
| :--- | :--- |
| **Học viên (Student)** | Người sử dụng hệ thống để tìm kiếm, đăng ký và tham gia các khóa học. Hệ thống sẽ thu thập dữ liệu hành vi của học viên để phục vụ dự báo. |
| **Giảng viên / Quản trị viên (Instructor/Admin)** | Người tạo và quản lý nội dung khóa học, theo dõi tiến độ đào tạo, quản lý các mô hình ML và thực hiện dự báo rủi ro học tập. |
| **Hệ thống Machine Learning (ML System)** | Tác nhân hệ thống thực hiện tính toán và trả về kết quả dự báo dựa trên dữ liệu logs. |

---

## 3. Sơ đồ Use Case Tổng thể

```mermaid
useCaseDiagram
    actor "Học viên" as Student
    actor "Giảng viên" as Instructor
    
    package "Quản lý Tài khoản" {
        usecase "Đăng ký/Đăng nhập" as UC_Auth
        usecase "Quản lý Hồ sơ" as UC_Profile
    }
    
    package "Học tập (Học viên)" {
        usecase "Xem Danh mục & Tìm kiếm" as UC_Browse
        usecase "Đăng ký Khóa học (Giỏ hàng)" as UC_Enroll
        usecase "Học bài (Xem Video/Làm Quiz)" as UC_Learn
        usecase "Theo dõi tiến độ" as UC_Progress
    }
    
    package "Quản lý & Dự báo (Giảng viên)" {
        usecase "Quản lý Khóa học & Bài giảng" as UC_ManageCourse
        usecase "Xem Phân tích Người học" as UC_Analytics
        usecase "Quản lý Mô hình ML" as UC_ManageML
        usecase "Chạy Dự báo Kết quả" as UC_Predict
        usecase "Gửi Thông báo Rủi ro" as UC_Notify
    }

    Student --> UC_Auth
    Student --> UC_Profile
    Student --> UC_Browse
    Student --> UC_Enroll
    Student --> UC_Learn
    Student --> UC_Progress
    Student --> UC_Notify
    
    Instructor --> UC_Auth
    Instructor --> UC_ManageCourse
    Instructor --> UC_Analytics
    Instructor --> UC_ManageML
    Instructor --> UC_Predict
    Instructor --> UC_Notify
```

---

## 4. Đặc tả Chi tiết các Use Case Chính

### 4.1. Nhóm Use Case Học tập

#### Use Case: Học bài (Xem Video/Làm Quiz)
*   **Mã hiệu**: UC_Learn
*   **Tác nhân chính**: Học viên
*   **Mô tả**: Học viên truy cập vào nội dung khóa học để xem video bài giảng hoặc thực hiện bài kiểm tra trắc nghiệm. Hệ thống tự động ghi lại các chỉ số hành vi (telemetry).
*   **Điều kiện tiền quyết**: Học viên đã đăng ký khóa học và đang trong trạng thái đăng nhập.
*   **Luồng sự kiện chính**:
    1. Học viên chọn bài giảng trong danh sách bài học của khóa học.
    2. Nếu là bài giảng Video: Hệ thống hiển thị trình phát video.
    3. Nếu là bài giảng Quiz: Hệ thống hiển thị bộ câu hỏi trắc nghiệm.
    4. Hệ thống bắt đầu ghi nhận các chỉ số: thời gian xem, tỷ lệ hoàn thành video, số lần nhấn nút, điểm số quiz...
    5. Học viên hoàn thành nội dung và nhấn "Tiếp tục".
    6. Hệ thống cập nhật trạng thái hoàn thành và lưu trữ logs hành vi.
*   **Luồng phụ**: 
    - Nếu kết nối mạng bị ngắt: Hệ thống cố gắng lưu trữ logs tạm thời và thông báo cho người dùng.
    - Nếu bài Quiz không đạt điểm tối thiểu (80%): Hệ thống ghi nhận nhưng không đánh dấu bài học là hoàn thành.

---

### 4.2. Nhóm Use Case Quản lý & Dự báo

#### Use Case: Quản lý Khóa học & Bài giảng
*   **Mã hiệu**: UC_ManageCourse
*   **Tác nhân chính**: Giảng viên
*   **Mô tả**: Giảng viên tạo mới khóa học, thiết lập thông tin cơ bản và thêm các bài học (Video/Quiz).
*   **Luồng sự kiện chính**:
    1. Giảng viên chọn chức năng "Tạo khóa học" hoặc "Chỉnh sửa".
    2. Nhập các thông tin: Tên, mô tả, cấp độ (Cơ bản/Trung bình/Nâng cao), giá tiền.
    3. Thêm các chương và bài giảng vào cấu trúc khóa học.
    4. Tải lên video bài giảng hoặc nhập danh sách câu hỏi cho bài Quiz.
    5. Lưu thay đổi và xuất bản khóa học.

#### Use Case: Chạy Dự báo Kết quả Học tập
*   **Mã hiệu**: UC_Predict
*   **Tác nhân chính**: Giảng viên
*   **Mô tả**: Giảng viên kích hoạt tiến trình chạy mô hình ML để dự báo khả năng trượt/đỗ hoặc mức độ rủi ro của một học viên cụ thể trong khóa học.
*   **Điều kiện tiền quyết**: Khóa học đã được gán một mô hình ML hoạt động. Học viên đã có dữ liệu tương tác (logs).
*   **Luồng sự kiện chính**:
    1. Giảng viên vào trang "Prediction Dashboard".
    2. Chọn khóa học và tìm kiếm học viên cần dự báo.
    3. Nhấn nút "Run Prediction".
    4. Hệ thống thu thập 22 chỉ số hành vi gần nhất của học viên đó.
    5. Hệ thống gọi kịch bản Python (inference.py) để xử lý dữ liệu.
    6. Kết quả dự báo (Điểm rủi ro, Mức độ tin cậy) được hiển thị trên giao diện và lưu vào cơ sở dữ liệu.
    7. Hệ thống tự động gửi thông báo nếu học viên nằm trong nhóm rủi ro cao.

#### Use Case: Đăng ký & Thanh toán Khóa học
*   **Mã hiệu**: UC_Enroll
*   **Tác nhân chính**: Học viên
*   **Mô tả**: Học viên chọn khóa học muốn học, thêm vào giỏ hàng và thực hiện quy trình đăng ký (có thể bao gồm thanh toán giả lập).
*   **Luồng sự kiện chính**:
    1. Học viên duyệt danh mục khóa học hoặc xem chi tiết.
    2. Nhấn "Thêm vào giỏ hàng".
    3. Truy cập trang Giỏ hàng để kiểm tra danh sách.
    4. Nhấn "Đăng ký ngay/Thanh toán".
    5. Hệ thống xử lý giao dịch và mở quyền truy cập khóa học cho học viên.
    6. Gửi thông báo đăng ký thành công.

#### Use Case: Gửi & Nhận Thông báo
*   **Mã hiệu**: UC_Notify
*   **Tác nhân chính**: Học viên, Giảng viên
*   **Mô tả**: Hệ thống gửi các thông báo quan trọng đến người dùng (như thông báo rủi ro học tập, cập nhật khóa học, hoặc tin nhắn nội bộ).
*   **Luồng sự kiện chính**:
    1. Hệ thống tự động kích hoạt thông báo (ví dụ: khi có kết quả dự báo mới) hoặc Giảng viên chủ động gửi tin nhắn.
    2. Người dùng nhận được thông báo theo thời gian thực (Toast) hoặc trong hộp thư đến.
    3. Người dùng vào trang "Messages/Notifications" để xem chi tiết.
    4. Đánh dấu đã đọc hoặc phản hồi tin nhắn.

---

## 5. Danh sách các Chỉ số Hành vi (22 Metrics)
Hệ thống tự động thu thập các chỉ số sau trong các Use Case học tập:
1.  **Engagement**: Thời gian học, số trang đã xem, % video đã xem.
2.  **Interactivity**: Số lần click, ghi chú đã tạo, bài đăng diễn đàn.
3.  **Performance**: Điểm Quiz, số lần thử lại, điểm bài tập.
4.  **Behavioral Trends**: Số ngày kể từ lần hoạt động cuối, xu hướng học tập (Tăng trưởng/Ổn định/Giảm sút).
... (và các chỉ số kỹ thuật khác phục vụ model ML)
