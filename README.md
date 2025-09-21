# Gemini VEO3 Video Generator

🎥 Ứng dụng web Python Flask tự động tạo video bằng Gemini VEO3 với cookies authentication

## 📋 Tính năng chính

✅ **Đã hoàn thành:**
- 🍪 Upload và verify cookies Gemini từ file .txt/.json
- 📁 Upload file prompts (mỗi dòng 1 prompt) 
- ⚙️ Cài đặt video: kích thước (16:9, 9:16), độ dài (5-8s), độ phân giải (720p-4K)
- 🎨 Giao diện web responsive với Bootstrap
- 📊 Theo dõi tiến trình tạo video real-time
- 💾 Tự động tải video về máy khi hoàn thành

✅ **Hoàn thành cơ bản:**
- 🤖 Cookie validation system (mock - cần API key thực)
- 🎬 Video generation workflow (mock - cần VEO3 API thực)  
- 🔗 Auto prompt generator với Gemini AI (template sẵn)
- 📦 Individual video download system

🔄 **Cần tích hợp thực:**
- Gemini API key thực để verify cookies
- VEO3 API endpoint thực để tạo video
- Background task queue (Celery/Redis) cho production

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd /home/user/webapp
pip install -r requirements.txt
```

### 2. Cấu hình environment
```bash
# File .env đã có sẵn với cấu hình mặc định
# Chỉnh sửa nếu cần thiết
```

### 3. Chạy ứng dụng
```bash
python3 app.py
```

### 4. Truy cập ứng dụng
```
Local: http://localhost:5000
Public URL: https://5000-i69ns191g1897mmbo3aua-6532622b.e2b.dev
```

### 5. File mẫu để test
- `sample_cookies.txt` - File cookies mẫu
- `sample_prompts.txt` - File prompts mẫu

## 📁 Cấu trúc project

```
webapp/
├── app.py                 # Flask application chính
├── requirements.txt       # Python dependencies
├── .env                  # Cấu hình môi trường
├── .gitignore           # Git ignore file
├── README.md            # File hướng dẫn này
├── templates/           # HTML templates
│   ├── base.html       # Template cơ sở
│   └── index.html      # Trang chủ
├── static/             # Static files
│   ├── css/
│   │   └── style.css   # Custom CSS
│   └── js/
│       └── app.js      # Frontend JavaScript
├── uploads/            # Thư mục upload prompts
├── downloads/          # Thư mục tải videos
└── cookies/           # Thư mục lưu cookies
```

## 🍪 Hướng dẫn sử dụng Cookies

### Cách lấy cookies từ trình duyệt:

1. **Đăng nhập Gemini** trên trình duyệt
2. **Mở Developer Tools** (F12)
3. **Vào tab Application/Storage**
4. **Tìm Cookies** cho domain `google.com` hoặc `gemini.google.com`
5. **Export cookies** theo format:

#### Format .txt:
```
__Secure-1PSID=your_psid_value_here
__Secure-3PSID=your_3psid_value_here
HSID=your_hsid_value_here
SSID=your_ssid_value_here
APISID=your_apisid_value_here
SAPISID=your_sapisid_value_here
```

#### Format .json:
```json
{
  "__Secure-1PSID": "your_psid_value_here",
  "__Secure-3PSID": "your_3psid_value_here", 
  "HSID": "your_hsid_value_here",
  "SSID": "your_ssid_value_here",
  "APISID": "your_apisid_value_here",
  "SAPISID": "your_sapisid_value_here"
}
```

## 📝 Hướng dẫn sử dụng Prompts

### Format file prompts (.txt):
```
A cinematic shot of a sunrise over mountains with golden light
A person walking on a beach during sunset with waves
A close-up of raindrops on a window with city lights in background
A time-lapse of clouds moving over a field of flowers
```

**Lưu ý:** Mỗi dòng là một prompt riêng biệt

## ⚙️ Cài đặt Video

- **Kích thước**: 
  - `16:9` - Landscape (phù hợp YouTube, TV)
  - `9:16` - Portrait (phù hợp TikTok, Instagram)

- **Độ dài**: 5-8 giây (tùy theo model VEO3)

- **Độ phân giải**:
  - `720p` - HD (nhanh, nhẹ)
  - `1080p` - Full HD (khuyến nghị)
  - `1440p` - 2K (chất lượng cao)
  - `2160p` - 4K (chất lượng tối đa)

## 🔧 API Endpoints

### Frontend Routes:
- `GET /` - Trang chủ
- `POST /upload_cookies` - Upload cookies file
- `GET /download/<filename>` - Tải video

### API Routes:
- `POST /upload_prompts` - Upload file prompts
- `POST /generate_prompt` - Tạo prompt tối ưu
- `POST /start_generation` - Bắt đầu tạo videos
- `GET /generation_status` - Kiểm tra tiến trình
- `GET /api/status` - Trạng thái ứng dụng

## 🛠️ Tech Stack

- **Backend**: Python Flask 2.3.3
- **Frontend**: Bootstrap 5.3.0, Vanilla JavaScript
- **APIs**: Gemini API, VEO3 API (planned)
- **Storage**: Local file system
- **UI**: Responsive design với dark mode support

## 🔒 Bảo mật

- ✅ Secure file upload với extension validation
- ✅ CORS protection
- ✅ Cookies stored locally không share
- ✅ File size limits (16MB)
- ⚠️ **Lưu ý**: Cookies có thể hết hạn, cần update định kỳ

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Cookies không hợp lệ**
   - Kiểm tra format file cookies
   - Đảm bảo đã đăng nhập Gemini trước khi lấy cookies
   - Cookies có thể hết hạn, cần lấy mới

2. **File prompts không tải được**
   - Kiểm tra file có extension .txt
   - Đảm bảo mỗi dòng là 1 prompt
   - File không vượt quá 16MB

3. **Video generation fails**
   - Hiện tại đang dùng mock API
   - Cần tích hợp VEO3 API thực

## 🚧 Development Status

- **Phase 1** ✅: Basic UI và file handling - HOÀN THÀNH
- **Phase 2** ✅: Cookie management system - HOÀN THÀNH (mock)
- **Phase 3** ✅: Video generation workflow - HOÀN THÀNH (mock)
- **Phase 4** ⏳: Real API integration - CẦN API KEYS THỰC

## 🌐 URLs

- **Ứng dụng web**: https://5000-i69ns191g1897mmbo3aua-6532622b.e2b.dev
- **GitHub**: https://github.com/nbdat92/gemini-veo3-cre
- **Local**: http://localhost:5000

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong terminal
2. Đảm bảo tất cả dependencies đã cài đặt
3. Kiểm tra file cookies format đúng
4. Thử restart ứng dụng

## 📄 License

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại.

---

**Made with ❤️ by AI Assistant** | Last updated: 2024-01-15