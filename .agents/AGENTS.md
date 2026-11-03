## Style & UI Guidelines

1. **Consistent UI Components**: Luôn tuân thủ cách thức thiết kế các khung tab, button switch, dropdown menu giống hệt như chuẩn đã làm ở trang `site setting page` (FacebookPageSettings.tsx). Không tự ý sáng tạo layout UI mới cho các component cơ bản này.
2. **Color Palette**: Tuyệt đối sử dụng màu sắc theo cấu hình (theme/color variables) của layout hiện tại. Tuyệt đối KHÔNG sử dụng màu Hồng và Tím.

## VPS Safety & Deployment Guidelines (Bắt buộc tuân thủ)

1. **Zero-Data Loss & Phân tách dự án (Zero Interference)**:
   - Tuyệt đối KHÔNG chạy các lệnh xóa volume hoặc reset database (`docker compose down -v`, `prisma db push --force-reset`).
   - Trên VPS `84.247.128.133` đang có các dự án khác vận hành (như `t5.goxo.us` tại `/root/ztreel-app`). Tuyệt đối NGHIÊM CẤM đụng chạm, sửa đổi, dừng hoặc xóa bất kỳ file/container/volume nào ngoài phạm vi của `t6` (`/root/ztreel6-app`, prefix `ztreel6_`).
2. **Quyền hạn can thiệp**: Mọi thay đổi mã nguồn hoặc cấu hình trên VPS (`t6.goxo.us`) chỉ được phép thực hiện khi người dùng yêu cầu hoặc đồng ý.
3. **Quản lý Git**:
   - `upstream` (Read-only, cục bộ tại thư mục này): `https://github.com/trungseodn/t2goxo` (tuyệt đối không push). Không ảnh hưởng đến các máy/dự án khác.
   - `origin` (Chính): `https://github.com/trungseodn/t6goxo` (tất cả code đẩy vào đây).
4. **Thông tin & Lệnh SSH đăng nhập VPS**:
   - Hostname: `vmi3704097` | IP: `84.247.128.133` (Port: `22`) | User: `root`
   - Domain: `t6.goxo.us`
   - Thư mục dự án trên VPS: `/root/ztreel6-app`
   - Compose file: `docker-compose.t6.yml`
   - Lệnh SSH chuẩn:
     ```powershell
     ssh -o StrictHostKeyChecking=no root@84.247.128.133
     ```
   - Chạy lệnh một lần từ PowerShell:
     ```powershell
     ssh -o BatchMode=yes -o StrictHostKeyChecking=no root@84.247.128.133 '<lệnh_bash>'
     ```
5. **Quy trình chi tiết**: Xem đầy đủ tại file [DEPLOYMENT_RULES.md](file:///d:/projects/t6.goxo.us/DEPLOYMENT_RULES.md).
