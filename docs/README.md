# 💕 Count Love — Ứng Dụng Đếm Ngày Yêu

> *Ghi lại từng khoảnh khắc, lưu giữ từng kỷ niệm của tình yêu.*

---

## 📌 Tổng Quan Dự Án

**Count Love** là ứng dụng web dành cho các cặp đôi, giúp họ:
- Đếm số ngày đã yêu nhau
- Lưu trữ kỷ niệm, ảnh và nhật ký tình yêu
- Gửi thông điệp ngọt ngào, lời nhắn bí mật
- Tổ chức kế hoạch hẹn hò và sự kiện đặc biệt
- Chia sẻ mục tiêu chung của cặp đôi
- Tạo không gian riêng tư, ấm cúng chỉ dành cho hai người

**Công nghệ chính:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth.js, Cloudinary, Pusher (realtime)

---

## 🗂 Mục Lục

1. [Mục Tiêu Sản Phẩm](#mục-tiêu-sản-phẩm)
2. [Đối Tượng Người Dùng](#đối-tượng-người-dùng)
3. [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)
4. [Danh Sách Tính Năng](#danh-sách-tính-năng)
5. [Luồng Người Dùng](#luồng-người-dùng)
6. [Thiết Kế UI/UX](#thiết-kế-uiux)
7. [Yêu Cầu Kỹ Thuật](#yêu-cầu-kỹ-thuật)
8. [Yêu Cầu Phi Chức Năng](#yêu-cầu-phi-chức-năng)
9. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
10. [Roadmap](#roadmap)

---

## Mục Tiêu Sản Phẩm

| Mục tiêu | Mô tả |
|---|---|
| 🎯 Kết nối cặp đôi | Tạo không gian riêng tư, an toàn và lãng mạn chỉ dành cho hai người |
| 📸 Lưu giữ ký ức | Lưu trữ ảnh, video, nhật ký và các kỷ niệm đáng nhớ |
| 📅 Nhắc nhở quan trọng | Không bao giờ quên các ngày đặc biệt như kỷ niệm, sinh nhật |
| 💬 Giao tiếp ngọt ngào | Gửi tin nhắn, lời thỏ thẻ, thử thách tình yêu vui vẻ |
| 🎯 Xây dựng tương lai | Lập kế hoạch, ước mơ và mục tiêu chung |

---

## Đối Tượng Người Dùng

- **Cặp đôi đang yêu:** 18–35 tuổi, quen dùng smartphone và ứng dụng
- **Cặp đôi xa cách (Long Distance):** Cần giao tiếp và kết nối thường xuyên hơn
- **Cặp đôi đã kết hôn:** Muốn lưu giữ kỷ niệm và duy trì sự lãng mạn

---

## Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────┐
│              CLIENT (Next.js)           │
│  App Router + React Server Components  │
│  Tailwind CSS + Framer Motion          │
└────────────────┬────────────────────────┘
                 │ HTTP / WebSocket
┌────────────────▼────────────────────────┐
│           API LAYER (Next.js API)       │
│    Route Handlers + Server Actions      │
│    NextAuth.js (Authentication)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           DATA LAYER                    │
│  Prisma ORM ──► PostgreSQL (Supabase)  │
│  Cloudinary (Media Storage)            │
│  Pusher (Realtime WebSocket)           │
│  Redis (Cache / Session)               │
└─────────────────────────────────────────┘
```

---

## Danh Sách Tính Năng

### 🔐 Module 1: Authentication & Onboarding
- Đăng ký / Đăng nhập (Email, Google, Facebook)
- Tạo hồ sơ cá nhân (tên, avatar, ngày sinh)
- Tạo / Tham gia "Couple Room" bằng mã mời
- Chọn ngày bắt đầu yêu nhau
- Chọn theme giao diện cho cặp đôi

### 💑 Module 2: Couple Dashboard (Trang Chính)
- Bộ đếm ngày yêu (năm / tháng / ngày / giờ / phút / giây)
- Ảnh đại diện cặp đôi và tên gọi thân mật
- Widget thời tiết theo vị trí
- Câu trích dẫn tình yêu mỗi ngày
- Countdown đến ngày kỷ niệm tiếp theo
- Hoạt động gần đây của cặp đôi (feed)

### 📸 Module 3: Album Kỷ Niệm
- Upload ảnh / video từ thiết bị hoặc camera
- Tổ chức theo album (Lần đầu gặp, Du lịch, Ngày thường,...)
- Xem ảnh dạng lưới, timeline, slideshow
- Thêm caption, tag ngày tháng, vị trí địa lý
- Tính năng "On This Day" — Hôm nay X năm trước
- Chia sẻ ảnh ra ngoài với watermark

### 📖 Module 4: Nhật Ký Tình Yêu (Love Diary)
- Viết nhật ký hàng ngày (rich text editor)
- Cả hai có thể đọc nhật ký của nhau (nếu cho phép)
- Mood tracker — Ghi lại cảm xúc theo ngày
- Tìm kiếm và lọc nhật ký theo ngày, mood
- Nhật ký bí mật (chỉ mình tự đọc)
- Export nhật ký thành PDF

### 💬 Module 5: Nhắn Tin & Thông Điệp
- Chat realtime giữa hai người
- Gửi tin nhắn có hẹn giờ (Time Capsule Message)
- Gửi "Love Letter" trang trí đẹp
- Thư viện sticker, emoji tình yêu
- Phản ứng cảm xúc với tin nhắn
- Trả lời tin nhắn cụ thể (reply)

### 📅 Module 6: Lịch & Sự Kiện
- Lịch chung của cặp đôi
- Thêm sự kiện: hẹn hò, kỷ niệm, sinh nhật, du lịch
- Nhắc nhở thông báo trước 1 ngày / 1 tuần
- Đếm ngược đến sự kiện sắp tới
- Lịch sử sự kiện đã qua
- Gợi ý ý tưởng hẹn hò theo ngày / mùa

### 🎯 Module 7: Mục Tiêu & Bucket List
- Tạo danh sách ước mơ / mục tiêu chung (Bucket List)
- Đánh dấu hoàn thành và gắn ảnh kỷ niệm
- Phân loại: Du lịch, Ẩm thực, Trải nghiệm, Gia đình,...
- Tiến độ hoàn thành dạng thanh/vòng tròn
- Thách thức hàng tuần / tháng cho cặp đôi

### 🎮 Module 8: Mini Games & Tương Tác Vui
- "Hỏi & Đáp Tình Yêu" — Trả lời câu hỏi về đối phương
- "Ai Hiểu Nhau Hơn" — Quiz về sở thích, thói quen
- Vòng quay may mắn — Quyết định hẹn hò hôm nay
- Thử thách tình yêu 30 ngày
- Lắc điện thoại để gửi "hug" ảo

### 🏆 Module 9: Thành Tích & Kỷ Niệm
- Huy hiệu (badges) theo cột mốc: 100 ngày, 1 năm, 3 năm,...
- Timeline kỷ niệm tổng hợp
- "Couple Score" — Điểm gắn kết dựa trên hoạt động
- Tạo "Love Book" — Sách kỷ niệm in được

### ⚙️ Module 10: Cài Đặt & Cá Nhân Hóa
- Thay đổi theme màu sắc và font chữ
- Tải ảnh nền tùy chỉnh
- Cài đặt thông báo (push, email)
- Quản lý quyền riêng tư
- Xuất toàn bộ dữ liệu (GDPR)
- Xóa tài khoản / Couple Room

---

## Luồng Người Dùng

### Onboarding Flow
```
Truy cập web → Đăng ký tài khoản → Tạo hồ sơ cá nhân
  → Tạo Couple Room (nhận mã) HOẶC Nhập mã từ người yêu
  → Chọn ngày bắt đầu yêu → Chọn theme → Dashboard
```

### Daily Usage Flow
```
Mở app → Xem dashboard (bộ đếm + feed)
  → Đọc tin nhắn mới → Viết nhật ký / Upload ảnh
  → Kiểm tra lịch sự kiện → Chơi mini game
```

---

## Thiết Kế UI/UX

### Nguyên Tắc Thiết Kế
- **Lãng mạn & Ấm áp:** Màu sắc pastel, tone hồng / đỏ / tím nhẹ
- **Tối giản & Dễ dùng:** Không quá nhiều thao tác, flow rõ ràng
- **Cá nhân hóa cao:** Mỗi cặp đôi có thể custom giao diện riêng
- **Mobile-first:** Thiết kế ưu tiên cho mobile, responsive cho desktop

### Color Palette Mặc Định
```
Primary:   #FF6B9D (Rose Pink)
Secondary: #C44569 (Deep Rose)
Accent:    #F8B500 (Golden)
Background:#FFF5F7 (Light Blush)
Text:      #2C2C54 (Deep Purple)
```

### Typography
- Display: `Playfair Display` (elegant, romantic)
- Body: `Plus Jakarta Sans` (clean, readable)
- Accent: `Dancing Script` (handwritten feel)

---

## Yêu Cầu Kỹ Thuật

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript 5+ |
| Styling | Tailwind CSS 3 + CSS Modules |
| Animation | Framer Motion |
| State Management | Zustand + React Query (TanStack) |
| Authentication | NextAuth.js v5 |
| Database ORM | Prisma 5 |
| Database | PostgreSQL (Supabase) |
| File Storage | Cloudinary |
| Realtime | Pusher / Ably |
| Cache | Redis (Upstash) |
| Email | Resend + React Email |
| Push Notification | Web Push API + Firebase FCM |
| Deployment | Vercel |
| Monitoring | Sentry + Vercel Analytics |

### API Design
- RESTful API với Next.js Route Handlers
- Server Actions cho form mutations
- Optimistic UI updates
- Infinite scroll / pagination

### Bảo Mật
- HTTPS bắt buộc
- JWT + Refresh Token
- Rate limiting (upstash/ratelimit)
- Input validation (Zod)
- XSS / CSRF protection
- Data encryption cho nội dung nhạy cảm

---

## Yêu Cầu Phi Chức Năng

| Tiêu chí | Yêu cầu |
|---|---|
| Performance | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| Availability | 99.9% uptime |
| Mobile UX | Score Lighthouse Mobile ≥ 90 |
| Accessibility | WCAG 2.1 AA |
| SEO | Landing page được index đầy đủ |
| Security | OWASP Top 10 compliant |
| Data | Backup hàng ngày, retention 30 ngày |

---

## Cấu Trúc Dự Án

```
count-love/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, register)
│   ├── (app)/                  # Protected app pages
│   │   ├── dashboard/
│   │   ├── album/
│   │   ├── diary/
│   │   ├── chat/
│   │   ├── calendar/
│   │   ├── bucket-list/
│   │   ├── games/
│   │   └── settings/
│   ├── api/                    # API Route Handlers
│   └── layout.tsx
├── components/
│   ├── ui/                     # Base UI components
│   ├── features/               # Feature-specific components
│   └── shared/                 # Shared components
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── pusher.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── hooks/                      # Custom React hooks
├── store/                      # Zustand stores
├── types/                      # TypeScript types
└── docs/                       # Documentation & Issues
    ├── issues/
    └── REQUIREMENTS.md
```

---

## Roadmap

### Phase 1 — MVP (4 tuần)
- [x] Authentication & Onboarding
- [x] Couple Dashboard + Bộ đếm ngày
- [x] Chat realtime cơ bản
- [x] Album ảnh cơ bản
- [x] Lịch & Sự kiện

### Phase 2 — Core Features (4 tuần)
- [ ] Nhật ký tình yêu đầy đủ
- [ ] Bucket List
- [ ] Mini Games
- [ ] Thành tích & Huy hiệu
- [ ] Push Notifications

### Phase 3 — Polish & Growth (4 tuần)
- [ ] Love Book (tạo sách in)
- [ ] Cá nhân hóa theme nâng cao
- [ ] Tính năng Long Distance đặc biệt
- [ ] Phân tích & thống kê cặp đôi
- [ ] App mobile (PWA)

---

*Tài liệu này được cập nhật lần cuối: 2026-03-28*
