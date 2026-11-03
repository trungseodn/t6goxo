# BẢN QUY TẮC BẢO TOÀN DỮ LIỆU & QUY TRÌNH TRIỂN KHAI HỆ THỐNG VPS
**Dự án**: T6 Goxo Reels & Image Automation (`t6.goxo.us`)  
**Ngày thiết lập**: 03/11/2026  
**Trạng thái**: Có hiệu lực bắt buộc cho toàn bộ chu trình phát triển & bảo trì  

---

## 1. TÔN CHỈ BẤT BIẾN (CORE SAFETY PRINCIPLES)

1. **BẢO TOÀN DỮ LIỆU VÀ CÁC DỰ ÁN KHÁC TRÊN VPS (ZERO INTERFERENCE & DATA LOSS)**:
   * VPS này đang chạy cùng dự án khác (như `t5.goxo.us` tại `/root/ztreel-app`).
   * **Nghiêm cấm tuyệt đối đụng chạm, sửa đổi, dừng (stop), xóa, hoặc ghi đè bất kỳ file/container/database/port nào của các dự án khác.**
   * Toàn bộ mã nguồn, container, docker volume, network và cấu hình của `t6` phải được cô lập hoàn toàn (prefix `ztreel6_`, thư mục riêng `/root/ztreel6-app`).

2. **QUẢN LÝ MÃ NGUỒN PHÂN TÁCH HOÀN TOÀN**:
   * **Upstream (Template gốc)**: `https://github.com/trungseodn/t2goxo` $\rightarrow$ **CHỈ ĐỌC (READ-ONLY)**.
   * **Origin (Phát triển chính)**: `https://github.com/trungseodn/t6goxo` $\rightarrow$ Toàn bộ code phát triển, tính năng mới và deploy đều đi qua repo này.

3. **CƠ CHẾ PHÊ DUYỆT (EXPLICIT APPROVAL)**:
   * Mọi can thiệp vào VPS (pull code mới, chạy migration, rebuild container, sửa cấu hình Nginx) đều phải được trình bày trước rõ ràng và CHỈ thực hiện sau khi người dùng gửi yêu cầu hoặc đồng ý.

---

## 2. HƯỚNG DẪN ĐĂNG NHẬP & KẾT NỐI VPS (SSH ACCESS DETAILS)

Mỗi khi cần kết nối, kiểm tra hoặc thao tác trên VPS, AI Assistant hoặc kỹ thuật viên sẽ sử dụng thông tin và câu lệnh chuẩn dưới đây:

* **Tên Server / Hostname**: `vmi3704097`
* **IP Server**: `84.247.128.133` (Port: `22`)
* **Domain trỏ về**: `t6.goxo.us`
* **User**: `root`
* **Đường dẫn thư mục dự án trên VPS**: `/root/ztreel6-app`
* **File Docker Compose**: `docker-compose.t6.yml`

### Các câu lệnh SSH chuẩn:

1. **Mở phiên SSH tương tác (Interactive Shell)**:
   ```powershell
   ssh -o StrictHostKeyChecking=no root@84.247.128.133
   ```

2. **Chạy lệnh đơn từ PowerShell (One-shot command)**:
   ```powershell
   ssh -o BatchMode=yes -o StrictHostKeyChecking=no root@84.247.128.133 '<câu_lệnh_bash>'
   ```

3. **Xem trạng thái các container của T6**:
   ```powershell
   ssh -o BatchMode=yes -o StrictHostKeyChecking=no root@84.247.128.133 'docker ps --filter "name=ztreel6"'
   ```

4. **Xem log realtime của API T6**:
   ```powershell
   ssh -o StrictHostKeyChecking=no root@84.247.128.133 'docker logs -f ztreel6_api_prod --tail 100'
   ```

---

## 3. THIẾT KẾ CÔ LẬP HỆ THỐNG T6 TRÊN VPS

* **Thư mục dự án**: `/root/ztreel6-app`
* **Docker Compose file**: `docker-compose.t6.yml`
* **Containers của T6**:
  * `ztreel6_api_prod` (API NestJS - Port host `3006` -> container `3000`)
  * `ztreel6_web_prod` (Frontend React - Port host `8086` -> container `80`)
  * `ztreel6_postgres_prod` (PostgreSQL 15 - Port host `5436` -> container `5432`)
  * `ztreel6_redis_prod` (Redis 7 - Port host `6386` -> container `6379`)
* **Docker Volumes cô lập**:
  * `ztreel6-app_ztreel6_postgres_data`
  * `ztreel6-app_ztreel6_redis_data`
  * `ztreel6-app_ztreel6_storage`
  * `ztreel6-app_ztreel6_uploads`
* **Docker Network riêng**: `ztreel6_net`

---

## 4. CÁC ĐIỀU CẤM TUYỆT ĐỐI (STRICT PROHIBITIONS)

❌ **NGHIÊM CẤM** đụng đến thư mục `/root/ztreel-app` hoặc bất kỳ container/volume/process nào không thuộc `ztreel6`.  
❌ **NGHIÊM CẤM** dùng lệnh `docker compose down -v` hoặc `docker-compose down -v` (Cờ `-v` sẽ xóa sạch các Docker Volume dữ liệu!).  
❌ **NGHIÊM CẤM** dùng lệnh `npx prisma db push --force-reset` hoặc `npx prisma migrate reset`.  
❌ **NGHIÊM CẤM** tự ý xóa file `.env` hoặc `apps/api/.env` trên VPS.  
❌ **NGHIÊM CẤM** chỉnh sửa trực tiếp mã nguồn trên VPS bằng tay. Mọi thay đổi phải đi từ Local $\rightarrow$ Commit Git $\rightarrow$ Pull về VPS.  
❌ **NGHIÊM CẤM** push code lên repo `trungseodn/t2goxo` (chỉ push lên `trungseodn/t6goxo`).  
