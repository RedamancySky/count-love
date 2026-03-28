# Issue #009 — Thành Tích & Huy Hiệu (Achievements)

**Module:** Achievements  
**Priority:** 🟡 Medium  
**Estimate:** 2 ngày  
**Labels:** `achievements`, `gamification`, `backend`

---

## Mô Tả

Hệ thống huy hiệu và thành tích để ghi nhận các cột mốc quan trọng của cặp đôi, thúc đẩy engagement và tạo cảm giác tự hào khi đạt được.

---

## Danh Sách Achievements

### Cột Mốc Thời Gian
| Code | Tên | Điều kiện | Điểm |
|---|---|---|---|
| DAYS_7 | 1 Tuần Ngọt Ngào 🍯 | Yêu nhau được 7 ngày | 10 |
| DAYS_30 | 1 Tháng Hạnh Phúc 🌸 | Yêu nhau được 30 ngày | 20 |
| DAYS_100 | 100 Ngày Bên Nhau 💯 | Yêu nhau được 100 ngày | 50 |
| DAYS_365 | 1 Năm Tình Yêu 🎉 | Yêu nhau được 365 ngày | 100 |
| DAYS_500 | 500 Ngày Không Phai 🌹 | Yêu nhau được 500 ngày | 100 |
| DAYS_1000 | Ngàn Ngày Yêu Thương 💎 | Yêu nhau được 1000 ngày | 200 |
| DAYS_1825 | 5 Năm Bền Chắc 🏆 | Yêu nhau được 5 năm | 500 |

### Album & Ảnh
| Code | Tên | Điều kiện | Điểm |
|---|---|---|---|
| FIRST_PHOTO | Ảnh Đầu Tiên 📸 | Upload ảnh đầu tiên | 10 |
| PHOTO_50 | Bộ Sưu Tập 50 | Upload 50 ảnh | 30 |
| PHOTO_200 | Nhiếp Ảnh Gia 200 | Upload 200 ảnh | 50 |
| ALBUM_5 | Nhà Sưu Tập Album | Tạo 5 album | 20 |

### Nhật Ký
| Code | Tên | Điều kiện | Điểm |
|---|---|---|---|
| DIARY_FIRST | Tâm Sự Đầu Tiên ✍️ | Viết nhật ký đầu tiên | 10 |
| DIARY_30 | Người Viết Chuyên Cần | Viết 30 entries | 50 |
| DIARY_STREAK_7 | 7 Ngày Liên Tiếp | Viết nhật ký 7 ngày liên tiếp | 30 |
| DIARY_STREAK_30 | Thói Quen Vàng | Viết nhật ký 30 ngày liên tiếp | 100 |
| ALL_MOODS | Cảm Xúc Phong Phú | Dùng đủ 10 mood | 20 |

### Chat & Kết Nối
| Code | Tên | Điều kiện | Điểm |
|---|---|---|---|
| FIRST_MESSAGE | Lời Đầu Tiên 💬 | Gửi tin nhắn đầu tiên | 5 |
| CAPSULE_OPEN | Cỗ Máy Thời Gian ⏳ | Mở 1 time capsule | 20 |
| LOVE_LETTER_5 | Nhà Thơ Tình Yêu 💌 | Gửi 5 love letters | 30 |
| HUG_50 | Cái Ôm Ảo 50 🤗 | Gửi 50 lần lắc hug | 20 |

### Bucket List
| Code | Tên | Điều kiện | Điểm |
|---|---|---|---|
| BUCKET_FIRST | Giấc Mơ Đầu 🌟 | Tạo bucket item đầu tiên | 5 |
| BUCKET_COMPLETE_5 | Chinh Phục 5 | Hoàn thành 5 bucket items | 50 |
| BUCKET_COMPLETE_20 | Người Chinh Phục | Hoàn thành 20 bucket items | 100 |
| TRAVEL_COMPLETE | Nhà Thám Hiểm ✈️ | Hoàn thành 1 bucket du lịch | 30 |

### Games
| Code | Tên | Điều kiện | Điểm |
|---|---|---|---|
| QUIZ_PERFECT | Hiểu Nhau Hoàn Toàn 🧠 | Đạt 100% trong 1 quiz | 50 |
| CHALLENGE_30 | Chiến Binh Tình Yêu 🏅 | Hoàn thành challenge 30 ngày | 100 |
| LOVE_LANG_TEST | Biết Mình Biết Ta | Hoàn thành love language quiz | 20 |

---

## Acceptance Criteria

- [ ] Check achievement sau mỗi action liên quan (event-driven)
- [ ] Notification khi unlock badge mới
- [ ] Animation đặc biệt: confetti + badge popup
- [ ] Trang "Thành tích" hiển thị tất cả badge (đạt và chưa đạt - ẩn/mờ)
- [ ] Mỗi badge có: icon, tên, mô tả, ngày đạt được
- [ ] Badge chưa đạt: hiển thị tiến trình (ex: "47/50 ảnh")
- [ ] Tổng điểm + Level cặp đôi

---

## Technical Specification

```typescript
// lib/achievement-engine.ts
// Sau mỗi action, gọi checkAchievements(coupleId, triggerType)
// triggerType: "PHOTO_UPLOAD" | "DIARY_ENTRY" | "BUCKET_COMPLETE" | ...

export async function checkAchievements(
  coupleId: string,
  trigger: AchievementTrigger
): Promise<Achievement[]> {
  // 1. Lấy danh sách achievements chưa unlock của couple
  // 2. Kiểm tra từng achievement có thỏa điều kiện không
  // 3. Unlock những cái thỏa → lưu DB → gửi notification
  // 4. Return danh sách mới unlock
}
```

---

---

# Issue #010 — Cài Đặt & Cá Nhân Hóa (Settings)

**Module:** Settings  
**Priority:** 🟡 Medium  
**Estimate:** 3 ngày  
**Labels:** `settings`, `profile`, `privacy`, `frontend`

---

## Mô Tả

Trang cài đặt toàn diện cho phép người dùng và cặp đôi tùy chỉnh trải nghiệm, quản lý thông báo, quyền riêng tư và dữ liệu cá nhân.

---

## Acceptance Criteria

### Hồ Sơ Cá Nhân
- [ ] Thay đổi ảnh đại diện (upload mới hoặc chọn từ album)
- [ ] Sửa tên hiển thị
- [ ] Sửa ngày sinh
- [ ] Sửa bio (max 150 ký tự)
- [ ] Đổi mật khẩu (yêu cầu nhập mật khẩu cũ)
- [ ] Kết nối / ngắt kết nối Google, Facebook

### Hồ Sơ Cặp Đôi
- [ ] Thay đổi ảnh bìa cặp đôi
- [ ] Đặt tên / danh hiệu cho cặp đôi
- [ ] Thay đổi ngày bắt đầu yêu (confirm rõ ràng vì ảnh hưởng bộ đếm)
- [ ] Tên gọi thân mật cho nhau (nickname)
- [ ] Xem mã mời lại / tạo mã mới

### Giao Diện
- [ ] Chọn theme màu (6+ themes)
- [ ] Light mode / Dark mode / System
- [ ] Chọn font chữ (3 lựa chọn)
- [ ] Ngôn ngữ: Tiếng Việt / English
- [ ] Múi giờ (tự detect hoặc chọn thủ công)

### Thông Báo
- [ ] Toggle từng loại notification:
  - Tin nhắn mới
  - Nhật ký mới của người yêu
  - Sự kiện sắp tới (X ngày trước)
  - Time Capsule mở
  - Thành tích mới
  - Thử thách hàng ngày
- [ ] Email notifications (on/off)
- [ ] Push notifications (on/off + request permission)
- [ ] Quiet hours (không nhận notification trong khoảng giờ nhất định)

### Quyền Riêng Tư
- [ ] Toggle "Chia sẻ nhật ký với người yêu" mặc định
- [ ] Toggle "Chia sẻ mood với người yêu"
- [ ] Xem danh sách thiết bị đã đăng nhập
- [ ] Đăng xuất khỏi tất cả thiết bị

### Dữ Liệu
- [ ] Xuất toàn bộ dữ liệu (JSON + ảnh ZIP) — yêu cầu xác nhận email
- [ ] Xóa tài khoản cá nhân (2 bước: email confirm)
- [ ] Rời khỏi Couple Room (ảnh và nội dung vẫn được giữ X ngày)
- [ ] Xóa Couple Room (yêu cầu cả hai xác nhận)

### About
- [ ] Version app
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Liên hệ hỗ trợ
- [ ] Rate app (link store)

---

## Technical Specification

```
app/(app)/settings/
├── page.tsx                   # Settings index
├── profile/page.tsx
├── couple/page.tsx
├── appearance/page.tsx
├── notifications/page.tsx
├── privacy/page.tsx
└── data/page.tsx

app/api/settings/
├── profile/route.ts           # PATCH
├── couple/route.ts            # PATCH
├── notifications/route.ts     # GET, PATCH
├── export-data/route.ts       # POST (async job)
└── delete-account/route.ts    # DELETE
```

### Theme System

```typescript
// Themes lưu trong localStorage + DB (để sync)
const themes = {
  rose:    { primary: "#FF6B9D", secondary: "#C44569", accent: "#F8B500" },
  violet:  { primary: "#8B5CF6", secondary: "#6D28D9", accent: "#F59E0B" },
  ocean:   { primary: "#0EA5E9", secondary: "#0284C7", accent: "#F97316" },
  forest:  { primary: "#10B981", secondary: "#059669", accent: "#FBBF24" },
  sunset:  { primary: "#F97316", secondary: "#EA580C", accent: "#EF4444" },
  midnight:{ primary: "#6366F1", secondary: "#4F46E5", accent: "#EC4899" },
};
// Apply via CSS variables on :root
```

---

## Definition of Done

- [ ] Tất cả settings lưu ngay lập tức (optimistic update)
- [ ] Theme thay đổi không cần reload
- [ ] Export data job chạy background, email khi xong
- [ ] Xóa tài khoản xóa sạch data trong DB và Cloudinary
- [ ] Push notification permission flow hoạt động trên iOS 16+
