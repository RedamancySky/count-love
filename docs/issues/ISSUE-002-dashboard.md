# Issue #002 — Couple Dashboard (Trang Chính)

**Module:** Dashboard  
**Priority:** 🔴 Critical  
**Estimate:** 4 ngày  
**Labels:** `dashboard`, `realtime`, `frontend`, `animation`

---

## Mô Tả

Trang chủ của ứng dụng sau khi đăng nhập — trung tâm hiển thị thông tin tình yêu, bộ đếm thời gian realtime, feed hoạt động và các widget tiện ích. Đây là trang người dùng nhìn thấy đầu tiên mỗi ngày.

---

## User Stories

```
US-007: Là người dùng, tôi muốn thấy ngay bộ đếm số ngày yêu nhau
        để cảm nhận hành trình tình yêu của mình.

US-008: Là người dùng, tôi muốn thấy ảnh đại diện và tên của cả hai
        để dashboard trở nên cá nhân hóa.

US-009: Là người dùng, tôi muốn xem các hoạt động gần đây của người yêu
        để biết họ vừa làm gì trong app.

US-010: Là người dùng, tôi muốn thấy countdown đến ngày kỷ niệm tiếp theo
        để chuẩn bị trước.

US-011: Là người dùng, tôi muốn thấy câu trích dẫn tình yêu mỗi ngày
        để có thêm cảm hứng.
```

---

## Acceptance Criteria

### Bộ Đếm Thời Gian (Love Counter)
- [ ] Hiển thị: Năm — Tháng — Ngày — Giờ — Phút — Giây
- [ ] Cập nhật realtime mỗi giây (không reload trang)
- [ ] Animation đẹp khi số thay đổi (flip/slide effect)
- [ ] Label bằng tiếng Việt: "năm", "tháng", "ngày", "giờ", "phút", "giây"
- [ ] Hiển thị thêm tổng số ngày bên dưới (ex: "1.247 ngày bên nhau")
- [ ] Responsive: trên mobile hiển thị gọn hơn

### Header Cặp Đôi
- [ ] Ảnh avatar của cả hai (hình tròn, viền đẹp)
- [ ] Biểu tượng trái tim ở giữa hai avatar
- [ ] Tên hiển thị / tên gọi thân mật của từng người
- [ ] Tên / danh hiệu cặp đôi (nếu có)
- [ ] Ảnh bìa nền (có thể tùy chỉnh)
- [ ] Badge số ngày lớn nhất (milestone badge)

### Widget Countdown Sự Kiện
- [ ] Hiển thị sự kiện sắp tới gần nhất
- [ ] Đếm ngược dạng "còn X ngày"
- [ ] Nếu hôm nay là ngày sự kiện → hiển thị animation chúc mừng 🎉
- [ ] Click vào → chuyển đến trang Calendar

### Feed Hoạt Động (Activity Feed)
- [ ] Hiển thị 10 hoạt động gần nhất của cả hai
- [ ] Các loại hoạt động: upload ảnh, viết nhật ký, thêm bucket item, đạt thành tích
- [ ] Avatar + tên người thực hiện + mô tả + thời gian tương đối (ex: "2 giờ trước")
- [ ] Click vào activity → navigate đến nội dung tương ứng
- [ ] Infinite scroll hoặc nút "Xem thêm"

### Daily Quote Widget
- [ ] Một câu trích dẫn tình yêu mỗi ngày (thay đổi theo ngày)
- [ ] Có thể swipe/click để đổi quote
- [ ] Nút share quote ra ngoài (copy hoặc share image)
- [ ] Tối thiểu 365 quote trong database

### Widget Thời Tiết
- [ ] Xin quyền vị trí → hiển thị thời tiết hiện tại
- [ ] Nếu từ chối → ô trống hoặc ẩn widget
- [ ] Hiển thị: icon thời tiết, nhiệt độ, mô tả
- [ ] Gợi ý hẹn hò theo thời tiết (ex: "Trời đẹp, đi dạo nhé? 🌤️")

### Quick Actions (Shortcuts)
- [ ] 4-6 nút shortcut: Nhắn tin, Thêm ảnh, Viết nhật ký, Thêm sự kiện
- [ ] Floating Action Button trên mobile
- [ ] Hiển thị số thông báo chưa đọc trên icon Chat

### Mood Check-in Hàng Ngày
- [ ] Mỗi ngày hiện 1 lần prompt "Hôm nay bạn cảm thấy thế nào?"
- [ ] Chọn mood bằng emoji (10 lựa chọn)
- [ ] Sau khi chọn → hiển thị mood của người yêu (nếu họ đã check-in)
- [ ] Lưu vào diary entry của ngày

---

## Technical Specification

### Component Tree

```
DashboardPage
├── DashboardHeader (ảnh bìa + avatar cặp đôi)
├── LoveCounter (bộ đếm realtime)
├── MoodCheckIn (check-in hàng ngày)
├── EventCountdown (widget sự kiện tiếp theo)
├── WeatherWidget
├── DailyQuote
├── ActivityFeed
│   └── ActivityItem[]
└── QuickActions (FAB mobile / buttons desktop)
```

### Files Cần Tạo

```
app/(app)/dashboard/
├── page.tsx                     # Server Component, fetch initial data
├── loading.tsx                  # Skeleton loading
└── error.tsx

components/features/dashboard/
├── LoveCounter.tsx              # Client Component - setInterval
├── DashboardHeader.tsx
├── EventCountdown.tsx
├── ActivityFeed.tsx
├── ActivityItem.tsx
├── DailyQuote.tsx
├── WeatherWidget.tsx
├── MoodCheckIn.tsx
└── QuickActions.tsx

hooks/
├── useLoveCounter.ts            # Tính toán thời gian
├── useWeather.ts                # Fetch weather API
└── useActivityFeed.ts           # SWR / React Query

lib/
└── love-counter.ts              # Pure function tính năm/tháng/ngày
```

### Love Counter Logic

```typescript
// lib/love-counter.ts
export interface LoveDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export function calculateLoveDuration(startDate: Date): LoveDuration {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();

  const totalSeconds = Math.floor(diff / 1000);
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Tính năm/tháng chính xác theo lịch
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  // ... (edge cases xử lý đầy đủ)

  return { years, months, days, hours, minutes, seconds, totalDays };
}
```

### Activity Feed API

```typescript
// GET /api/couple/activity-feed
// Response:
{
  activities: [
    {
      id: string,
      type: "PHOTO_UPLOAD" | "DIARY_ENTRY" | "BUCKET_COMPLETED" | "ACHIEVEMENT",
      actorId: string,
      actorName: string,
      actorAvatar: string,
      description: string,
      targetId: string,     // ID của resource liên quan
      targetUrl: string,    // URL navigate đến
      thumbnail: string,    // ảnh preview nếu có
      createdAt: string
    }
  ],
  nextCursor: string | null
}
```

### Realtime Updates

```typescript
// Dùng Pusher để nhận realtime activity
// Channel: private-couple-{coupleId}
// Events:
//   - new-activity: hoạt động mới
//   - partner-mood: người yêu vừa check-in mood
//   - new-message: tin nhắn mới (badge count)
```

---

## UI/UX Details

### Love Counter Animation
```css
/* Flip card animation khi số thay đổi */
.counter-digit {
  animation: flip-down 0.3s ease-in-out;
}
@keyframes flip-down {
  0%   { transform: rotateX(0deg); }
  50%  { transform: rotateX(-90deg); }
  100% { transform: rotateX(0deg); }
}
```

### Milestone Celebrations
Khi đạt cột mốc (100 ngày, 365 ngày, ...) → hiển thị:
- Confetti animation toàn màn hình
- Modal chúc mừng với badge đặc biệt
- Tùy chọn chia sẻ lên mạng xã hội

### Skeleton Loading
Tất cả widget dùng skeleton placeholder trong khi fetch data để tránh layout shift.

---

## Performance Requirements

- Dashboard load < 1.5s (TTI)
- Activity feed: pagination 10 items/page
- Weather API: cache 30 phút
- Daily quote: cache toàn bộ trong localStorage, fetch mới mỗi ngày
- Love counter: chạy bằng `setInterval` trên client, không gọi API

---

## Definition of Done

- [ ] Bộ đếm chạy chính xác, không lệch giờ so với múi giờ người dùng
- [ ] Activity feed load đúng, infinite scroll hoạt động
- [ ] Mood check-in lưu được và hiển thị mood của partner
- [ ] Weather widget hiển thị đúng vị trí
- [ ] Responsive hoàn hảo từ 375px đến 1440px
- [ ] Không có layout shift khi load (CLS = 0)
- [ ] Milestone celebration hiển thị đúng vào ngày đặc biệt
- [ ] Dark mode hỗ trợ đầy đủ
