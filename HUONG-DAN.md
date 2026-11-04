# Chùa Bạch Quả EZ: đưa lên mạng bằng Render

Sau khi làm xong, anh có một link dạng `https://chua-bach-qua-ez.onrender.com`.
Ai có link cũng vào chơi chung được, không cần tài khoản gì.

## Trong thư mục này có gì

- `public/index.html`: trang sân chùa.
- `server.js`: máy chủ nhỏ, chuyển vị trí, hành động và tin nhắn giữa người chơi.
- `package.json`, `render.yaml`: thông tin để Render biết cách chạy.

## Bước 1: Đưa code lên GitHub (khoảng 5 phút)

1. Vào https://github.com, tạo tài khoản (miễn phí) nếu chưa có.
2. Bấm dấu **+** ở góc trên bên phải, chọn **New repository**.
3. Đặt tên `chua-bach-qua-ez`, để **Public** hoặc **Private** đều được, bấm **Create repository**.
4. Ở trang vừa tạo, bấm **uploading an existing file**.
5. Giải nén file zip, kéo **toàn bộ nội dung bên trong** (thư mục `public` và các file `server.js`, `package.json`, `render.yaml`) vào trang, rồi bấm **Commit changes**.
   Kiểm tra lại: trên GitHub phải thấy thư mục `public` và file `server.js` nằm ngay ngoài cùng.

## Bước 2: Chạy trên Render (khoảng 10 phút)

1. Vào https://render.com, chọn đăng nhập bằng GitHub.
2. Bấm **New +** rồi chọn **Web Service**.
3. Cho phép Render đọc GitHub nếu được hỏi, rồi chọn repository `chua-bach-qua-ez`.
4. Điền các ô (thường Render tự điền sẵn):
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**
5. Bấm **Create Web Service** (hoặc **Deploy**). Chờ vài phút đến khi thấy chữ **Live**.
6. Copy link ở phía trên (dạng `https://....onrender.com`) và gửi cho team.

## Cần biết

- Gói miễn phí của Render cho máy chủ "ngủ" khi không có ai vào một lúc. Người đầu tiên mở link có thể phải chờ khoảng một phút để máy chủ thức dậy. Đây là chính sách của Render và có thể thay đổi.
- Máy chủ chịu được tối đa 80 người cùng lúc, đủ dư cho team.
- Không lưu gì lại: tin nhắn và hành động chỉ hiện với người đang ở trong chùa lúc đó.
- Khi cần sửa trang, anh thay file `public/index.html` trên GitHub. Render tự cập nhật sau vài phút.
