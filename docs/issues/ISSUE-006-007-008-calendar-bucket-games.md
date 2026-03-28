# Issue #006 — Lịch & Sự Kiện (Calendar & Events)

**Module:** Calendar  
**Priority:** 🟠 High  
**Estimate:** 3 ngày  
**Labels:** `calendar`, `events`, `notifications`, `frontend`

---

## Mô Tả

Lịch chung của cặp đôi để quản lý các sự kiện quan trọng: kỷ niệm, sinh nhật, hẹn hò, kế hoạch du lịch. Với nhắc nhở tự động để không bao giờ bỏ lỡ ngày đặc biệt.

---

## Acceptance Criteria

### Giao Diện Lịch
- [ ] Hiển thị dạng tháng (month view) — mặc định
- [ ] Chuyển đổi sang dạng tuần (week view) và danh sách (list view)
- [ ] Navigate tháng trước/sau bằng nút hoặc swipe
- [ ] Ngày có sự kiện: hiển thị dot màu bên dưới số ngày
- [ ] Click ngày → hiện danh sách sự kiện của ngày đó
- [ ] Highlight ngày hôm nay và ngày kỷ niệm yêu

### Thêm / Sửa Sự Kiện
- [ ] Form tạo sự kiện: tiêu đề (bắt buộc), loại sự kiện, ngày, giờ bắt đầu/kết thúc (tùy chọn)
- [ ] Mô tả (tùy chọn), địa điểm, ảnh bìa sự kiện
- [ ] Màu sắc sự kiện (6 màu lựa chọn)
- [ ] Sự kiện lặp lại: Hàng năm (cho kỷ niệm, sinh nhật)
- [ ] Cài đặt nhắc nhở: nhắc trước 1 ngày, 3 ngày, 1 tuần (chọn nhiều)
- [ ] Xóa sự kiện với confirm

### Loại Sự Kiện (Icons + Màu mặc định)
- 💕 Kỷ niệm yêu — đỏ
- 🎂 Sinh nhật — vàng
- 🍽️ Hẹn hò — hồng
- ✈️ Du lịch — xanh
- ⭐ Cột mốc — tím
- 📌 Khác — xám

### Widget Upcoming Events
- [ ] Danh sách 5 sự kiện sắp tới nhất (xuất hiện trên Dashboard)
- [ ] "Hôm nay không có sự kiện" nếu trống
- [ ] Sự kiện trong hôm nay → highlight đặc biệt
- [ ] Đếm ngược dạng "còn X ngày"

### Nhắc Nhở
- [ ] Push notification (Web Push / FCM)
- [ ] Email reminder (nếu bật trong settings)
- [ ] Cron job chạy lúc 8:00 sáng mỗi ngày để gửi reminder
- [ ] Anniversary tự lặp hàng năm theo ngày bắt đầu yêu

### Gợi Ý Hẹn Hò
- [ ] Button "Gợi ý hẹn hò" trong view ngày
- [ ] AI-generated suggestions dựa trên: thời tiết, mùa, ngân sách
- [ ] 3 gợi ý: Ở nhà, Ra ngoài giá rẻ, Ra ngoài đặc biệt

---

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/events?month=2024-03` | Lấy events theo tháng |
| GET | `/api/events/upcoming?limit=5` | Events sắp tới |
| POST | `/api/events` | Tạo event mới |
| PATCH | `/api/events/:id` | Sửa event |
| DELETE | `/api/events/:id` | Xóa event |

---

---

# Issue #007 — Bucket List & Mục Tiêu Chung

**Module:** Bucket List  
**Priority:** 🟡 Medium  
**Estimate:** 3 ngày  
**Labels:** `bucket-list`, `goals`, `frontend`, `backend`

---

## Mô Tả

Danh sách ước mơ và mục tiêu chung của cặp đôi. Cùng nhau lập kế hoạch, theo dõi tiến trình và ăn mừng khi hoàn thành từng mục tiêu.

---

## Acceptance Criteria

### Danh Sách Bucket Items
- [ ] Hiển thị dạng grid cards hoặc list
- [ ] Tabs: Tất cả / Chưa hoàn thành / Đã hoàn thành
- [ ] Filter theo danh mục
- [ ] Sort: theo ngày tạo, theo độ ưu tiên, theo ngày mục tiêu
- [ ] Search theo tên
- [ ] Progress tổng: "X/Y mục tiêu đã hoàn thành (Z%)"
- [ ] Thanh tiến trình màu sắc đẹp

### Thêm / Sửa Item
- [ ] Tiêu đề (bắt buộc)
- [ ] Mô tả chi tiết (tùy chọn)
- [ ] Danh mục (icon + màu)
- [ ] Ngày mục tiêu (target date, tùy chọn)
- [ ] Độ ưu tiên: thấp / trung bình / cao
- [ ] Upload ảnh đại diện cho item
- [ ] Ghi chú kế hoạch (text)

### Đánh Dấu Hoàn Thành
- [ ] Nút "Đánh dấu hoàn thành" với confirm modal
- [ ] Nhập ghi chú hoàn thành (cảm xúc, kỷ niệm)
- [ ] Upload ảnh kỷ niệm lúc hoàn thành (tự động lưu vào album)
- [ ] Animation confetti khi mark complete
- [ ] Trigger achievement check (có thể unlock badge)

### Thống Kê
- [ ] Donut chart: tỷ lệ hoàn thành theo danh mục
- [ ] Timeline: các mục tiêu hoàn thành theo thời gian
- [ ] "Streak": bao nhiêu tháng liên tiếp có ít nhất 1 hoàn thành

### Danh Mục

| Icon | Danh mục | Màu |
|---|---|---|
| ✈️ | Du lịch | Xanh dương |
| 🍜 | Ẩm thực | Cam |
| 🎭 | Trải nghiệm | Tím |
| 👨‍👩‍👧 | Gia đình | Hồng |
| 🏄 | Phiêu lưu | Xanh lá |
| 📚 | Học tập | Vàng |
| 💑 | Lãng mạn | Đỏ |
| 🎯 | Khác | Xám |

---

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/bucket?status=pending&category=TRAVEL` | Lấy danh sách |
| POST | `/api/bucket` | Tạo item |
| PATCH | `/api/bucket/:id` | Sửa item |
| POST | `/api/bucket/:id/complete` | Đánh dấu hoàn thành |
| DELETE | `/api/bucket/:id` | Xóa item |
| GET | `/api/bucket/stats` | Thống kê |

---

---

# Issue #008 — Mini Games & Tương Tác Vui

**Module:** Games  
**Priority:** 🟡 Medium  
**Estimate:** 4 ngày  
**Labels:** `games`, `gamification`, `fun`, `frontend`

---

## Mô Tả

Các mini game và thử thách tương tác giúp cặp đôi hiểu nhau hơn, tạo niềm vui và gắn kết. Quan trọng để tăng daily active usage của ứng dụng.

---

## Acceptance Criteria

### Trang Games Hub
- [ ] Grid các game có thể chơi
- [ ] Badge "Mới", "Hôm nay", "Đang chơi"
- [ ] Leaderboard nhỏ: Couple Score của tháng

### Game 1: Quiz "Ai Hiểu Hơn?" 🧠
- [ ] 20+ câu hỏi về sở thích, thói quen, ký ức cặp đôi
- [ ] Mỗi người trả lời độc lập về đối phương
- [ ] Sau khi cả hai hoàn thành → reveal đáp án và so sánh
- [ ] Scoring: mỗi câu đúng = 10 điểm
- [ ] Lịch sử quiz: điểm số từng lần chơi
- [ ] Bộ câu hỏi mới mỗi tuần

**Ví dụ câu hỏi:**
- "Món ăn yêu thích của người yêu bạn là gì?"
- "Người yêu bạn thích đi ngủ lúc mấy giờ?"
- "Bài hát nào người yêu bạn hay nghe nhất?"

### Game 2: Vòng Quay Hẹn Hò 🎡
- [ ] Spin wheel với 8-10 ý tưởng hẹn hò
- [ ] Tùy chỉnh các lựa chọn trong vòng quay
- [ ] Animation vòng quay mượt mà
- [ ] Kết quả có thể lưu thành sự kiện trong Calendar
- [ ] 3 bộ mặc định: Ở nhà, Ra phố, Surprise

### Game 3: Thử Thách 30 Ngày ❤️
- [ ] Chọn challenge pack (Lãng mạn, Vui vẻ, Giao tiếp)
- [ ] Mỗi ngày unlock 1 thử thách mới
- [ ] Đánh dấu hoàn thành + upload ảnh chứng minh
- [ ] Progress bar 30 ngày
- [ ] Nếu bỏ 3 ngày → streak reset
- [ ] Badge khi hoàn thành toàn bộ

**Ví dụ thử thách:**
- Ngày 1: Gửi cho nhau 1 bài hát yêu thích
- Ngày 2: Kể cho nhau nghe 1 kỷ niệm đẹp
- Ngày 3: Nấu cùng nhau 1 món ăn

### Game 4: "Lắc Hug" 📱
- [ ] Lắc điện thoại → gửi "hug" ảo cho người yêu
- [ ] Người nhận thấy notification + animation ôm trên màn hình
- [ ] Limit: 3 hugs/ngày để giữ sự đặc biệt
- [ ] Đếm tổng số hugs đã gửi/nhận

### Game 5: Love Language Quiz 💬
- [ ] Bài test 5 ngôn ngữ tình yêu (Gary Chapman)
- [ ] 20 câu hỏi tình huống
- [ ] Kết quả: % mỗi love language
- [ ] So sánh kết quả của cả hai
- [ ] Gợi ý cách yêu thương dựa trên kết quả

### Couple Score 🏆
- [ ] Điểm tích lũy từ các hoạt động:
  - Chat hàng ngày: +5
  - Upload ảnh: +10
  - Viết nhật ký: +15
  - Hoàn thành bucket item: +30
  - Chơi game: +5
  - Streak ngày liên tiếp: +điểm nhân
- [ ] Hiển thị điểm trên dashboard
- [ ] Level system: Mới yêu → Đang yêu → Yêu sâu → Tình yêu vĩnh cửu
- [ ] Weekly leaderboard (so sánh vui)

---

## Technical Specification

```
app/(app)/games/
├── page.tsx                     # Games hub
└── [gameType]/
    └── page.tsx                 # Individual game

components/features/games/
├── GamesHub.tsx
├── QuizGame.tsx
├── SpinWheel.tsx
├── ChallengePack.tsx
├── ChallengeDay.tsx
├── ShakeHug.tsx                 # DeviceMotion API
├── LoveLanguageQuiz.tsx
└── CoupleScore.tsx

app/api/games/
├── quiz/
│   ├── route.ts                 # GET questions, POST answer
│   └── history/route.ts
├── spin-wheel/
│   └── route.ts                 # GET/POST custom options
├── challenge/
│   ├── route.ts                 # GET active challenge
│   └── [day]/
│       └── complete/route.ts
├── hug/
│   └── route.ts                 # POST send hug
└── score/
    └── route.ts                 # GET couple score
```

### Shake Detection

```typescript
// hooks/useShakeDetection.ts
export function useShakeDetection(onShake: () => void, threshold = 15) {
  useEffect(() => {
    if (!window.DeviceMotionEvent) return;

    let lastX = 0, lastY = 0, lastZ = 0;

    const handler = (e: DeviceMotionEvent) => {
      const { x, y, z } = e.accelerationIncludingGravity!;
      const delta = Math.abs(x! - lastX) + Math.abs(y! - lastY) + Math.abs(z! - lastZ);
      if (delta > threshold) onShake();
      [lastX, lastY, lastZ] = [x!, y!, z!];
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [onShake, threshold]);
}
```

---

## Definition of Done

- [ ] Quiz không lộ đáp án của người kia trước khi cả hai hoàn thành
- [ ] Spin wheel animation mượt (60fps)
- [ ] Challenge streak tính đúng timezone người dùng
- [ ] Shake hug hoạt động trên iOS (cần user permission DeviceMotion)
- [ ] Couple score cập nhật realtime
- [ ] Love language quiz có thể làm lại sau 30 ngày
