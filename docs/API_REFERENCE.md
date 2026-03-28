# 📡 API Reference — Count Love

**Base URL:** `https://countlove.app/api`  
**Auth:** Bearer JWT (NextAuth session token)  
**Content-Type:** `application/json`

---

## Authentication Headers

Mọi endpoint (trừ auth) đều yêu cầu:
```
Authorization: Bearer <session_token>
Cookie: next-auth.session-token=<token>
```

---

## 🔐 Auth

### POST `/auth/register`
Đăng ký tài khoản mới.

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "Password123"
}
```
**Response 201:**
```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận."
}
```
**Errors:** `400` (validation), `409` (email tồn tại)

---

### POST `/auth/couple/create`
Tạo Couple Room mới.

**Response 201:**
```json
{
  "couple": {
    "id": "clx...",
    "coupleCode": "LOVE42",
    "qrCodeUrl": "https://..."
  }
}
```

### POST `/auth/couple/join`
Tham gia Couple Room bằng mã.

**Request:** `{ "code": "LOVE42" }`

**Response 200:**
```json
{
  "couple": { "id": "...", "user1": {...}, "startDate": null }
}
```
**Errors:** `404` (mã không tồn tại), `400` (mã hết hạn), `409` (đã có couple)

---

## 💑 Couple

### GET `/couple/me`
Lấy thông tin couple hiện tại.

**Response 200:**
```json
{
  "couple": {
    "id": "...",
    "startDate": "2022-02-14T00:00:00Z",
    "themeName": "rose",
    "coupleTitle": "Team Nước Mắt 😭",
    "user1": { "id": "...", "name": "...", "image": "...", "nickname": "Cún" },
    "user2": { "id": "...", "name": "...", "image": "...", "nickname": "Miu" },
    "_count": { "media": 247, "diaryEntries": 83 }
  }
}
```

### PATCH `/couple/me`
Cập nhật thông tin couple.

**Request:**
```json
{
  "startDate": "2022-02-14",
  "coupleTitle": "Team Nước Mắt",
  "themeName": "violet",
  "coverImage": "https://cloudinary.com/..."
}
```

---

## 📸 Media & Albums

### GET `/albums`
Lấy danh sách album.

**Query params:** `sort=latest|oldest|count`

**Response 200:**
```json
{
  "albums": [
    {
      "id": "...",
      "title": "Chuyến Đà Lạt",
      "coverImage": "...",
      "_count": { "media": 42 },
      "latestMedia": [{ "url": "..." }, { "url": "..." }],
      "createdAt": "..."
    }
  ]
}
```

### POST `/albums`
**Request:** `{ "title": "...", "description": "..." }`

### GET `/albums/:id/media`
**Query:** `page=1&limit=30&type=IMAGE|VIDEO`

**Response 200:**
```json
{
  "media": [ MediaItem[] ],
  "total": 42,
  "page": 1,
  "totalPages": 2
}
```

### POST `/media`
Lưu metadata sau khi upload lên Cloudinary.

**Request:**
```json
{
  "albumId": "...",
  "publicId": "count-love/xyz/photo1",
  "type": "IMAGE",
  "url": "https://res.cloudinary.com/...",
  "width": 1920,
  "height": 1080,
  "caption": "Bữa tối đặc biệt ❤️",
  "takenAt": "2024-02-14T19:00:00Z",
  "location": "Nhà hàng Panorama, Đà Lạt"
}
```

### PATCH `/media/:id`
**Request:** `{ "caption"?, "takenAt"?, "location"?, "albumId"? }`

### DELETE `/media/:id`
Xóa media (xóa cả trên Cloudinary).

### GET `/media/on-this-day`
Lấy ảnh được chụp đúng ngày này các năm trước.

**Response 200:**
```json
{
  "groups": [
    {
      "yearsAgo": 2,
      "label": "2 năm trước",
      "media": [ MediaItem[] ]
    }
  ]
}
```

---

## 📖 Diary

### GET `/diary`
**Query:** `filter=mine|partner|all`, `mood=HAPPY`, `month=2024-03`, `q=keyword`, `cursor=...`

**Response 200:**
```json
{
  "entries": [
    {
      "id": "...",
      "title": "Ngày đẹp trời",
      "content": "<p>...</p>",
      "mood": "HAPPY",
      "isPrivate": false,
      "isShared": true,
      "date": "2024-03-15",
      "author": { "id": "...", "name": "...", "image": "..." },
      "media": [ MediaItem[] ],
      "tags": ["Hạnh phúc", "Cuối tuần"],
      "createdAt": "..."
    }
  ],
  "nextCursor": "...",
  "hasMore": true
}
```

### POST `/diary`
**Request:**
```json
{
  "title": "Ngày đẹp trời",
  "content": "<p>Hôm nay rất vui...</p>",
  "mood": "HAPPY",
  "weather": "Nắng đẹp",
  "isPrivate": false,
  "isShared": true,
  "date": "2024-03-15",
  "tags": ["Hạnh phúc"],
  "mediaIds": ["media_id_1", "media_id_2"]
}
```

### PUT `/diary/draft`
Auto-save draft. Upsert theo userId + ngày hiện tại.

---

## 💬 Messages

### GET `/messages`
**Query:** `cursor=<messageId>&limit=30` (load tin nhắn cũ hơn)

**Response 200:**
```json
{
  "messages": [
    {
      "id": "...",
      "content": "Anh nhớ em ❤️",
      "type": "TEXT",
      "senderId": "...",
      "isRead": true,
      "readAt": "...",
      "replyTo": null,
      "reactions": [{ "emoji": "❤️", "userId": "...", "count": 1 }],
      "isTimeCapsule": false,
      "createdAt": "..."
    }
  ],
  "nextCursor": "...",
  "hasMore": true
}
```

### POST `/messages`
**Request:**
```json
{
  "content": "Em nhớ anh 🥺",
  "type": "TEXT",
  "replyToId": null,
  "scheduledAt": null,
  "isTimeCapsule": false
}
```

### POST `/messages/:id/react`
**Request:** `{ "emoji": "❤️" }`  
Toggle: nếu đã react cùng emoji → xóa, nếu chưa → thêm.

### POST `/messages/read`
**Request:** `{ "messageIds": ["id1", "id2"] }` — Mark as read.

### GET `/messages/time-capsule`
Lấy danh sách capsule chưa mở và đã mở.

---

## 📅 Events

### GET `/events`
**Query:** `month=2024-03` hoặc `from=2024-03-01&to=2024-03-31`

### GET `/events/upcoming`
**Query:** `limit=5`

**Response 200:**
```json
{
  "events": [
    {
      "id": "...",
      "title": "Kỷ niệm 2 năm",
      "type": "ANNIVERSARY",
      "date": "2026-02-14",
      "daysUntil": 7,
      "color": "#FF6B9D",
      "isToday": false
    }
  ]
}
```

---

## 🎯 Bucket List

### GET `/bucket`
**Query:** `status=pending|completed|all`, `category=TRAVEL`, `sort=date|priority|created`

### POST `/bucket/:id/complete`
**Request:**
```json
{
  "completedNote": "Cuối cùng cũng đã leo đến đỉnh!",
  "completedAt": "2024-03-15",
  "mediaIds": ["id1"]
}
```

---

## 🏆 Achievements

### GET `/achievements`
Lấy tất cả achievements (đã và chưa unlock).

**Response 200:**
```json
{
  "unlocked": [
    {
      "code": "DAYS_100",
      "title": "100 Ngày Bên Nhau",
      "iconUrl": "...",
      "points": 50,
      "unlockedAt": "2022-05-25"
    }
  ],
  "locked": [
    {
      "code": "DAYS_365",
      "title": "1 Năm Tình Yêu",
      "iconUrl": "...",
      "points": 100,
      "progress": { "current": 247, "target": 365 }
    }
  ],
  "totalPoints": 280,
  "level": "Đang Yêu Đậm Sâu"
}
```

---

## 🎮 Games

### GET `/games/quiz/questions`
**Query:** `week=2024-W11` — Câu hỏi của tuần hiện tại.

### POST `/games/quiz/answer`
**Request:** `{ "questionId": "...", "answer": "Phở bò" }`

### GET `/games/score`
**Response:** `{ "coupleScore": 1240, "level": "Tình Yêu Vĩnh Cửu", "weeklyRank": null }`

---

## 🔔 Notifications

### GET `/notifications`
**Query:** `unread=true`, `cursor=...`

### POST `/notifications/read`
**Request:** `{ "ids": ["id1", "id2"] }` hoặc `{ "all": true }`

---

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "email", "message": "Email không đúng định dạng" }
    ]
  }
}
```

**HTTP Status Codes:**
- `200` OK
- `201` Created
- `400` Bad Request (validation)
- `401` Unauthorized
- `403` Forbidden (not in couple / wrong couple)
- `404` Not Found
- `409` Conflict
- `429` Too Many Requests
- `500` Internal Server Error

---

## Issue-001 Auth/Onboarding (Implemented in `feature/issue-1`)

The current implementation uses an in-memory auth service for local development and tests.

### Endpoints added/updated

- `POST /auth/register`
  - Register email/password account.
  - Returns debug verify token in local scaffold.
- `POST /auth/resend-verify`
  - Re-issue verify token when email is not verified.
- `GET /auth/verify-email?token=...`
  - Verify email token (24h TTL, single-use).
- `POST /auth/login`
  - Email/password sign-in.
  - Rejects unverified email.
  - Locks account for 15 minutes after 5 consecutive wrong passwords.
  - Supports `rememberMe` (30 days).
- `POST /auth/oauth`
  - OAuth simulation (`google`, `facebook`) for local scaffold.
  - Auto-merges with existing email/password account when email matches.
- `POST /auth/forgot-password`
  - Issues reset token (1h TTL).
- `POST /auth/reset-password`
  - Single-use reset token.
- `POST /auth/couple/create`
  - Creates 6-character invite code + QR payload.
  - Invite expires in 24 hours.
- `POST /auth/couple/join`
  - Join with 6-character code or `invitePayload`.
- `GET /auth/couple/status`
  - Poll room status (waiting/connected).
- `PATCH /auth/onboarding`
  - Saves onboarding progress (steps 1-6).

### Auth/session behavior

- Session cookie: `countlove_session` (HttpOnly).
- Onboarding status cookie: `countlove_onboarding_completed` (HttpOnly).
- Middleware redirects:
  - Unauthenticated users to `/login`.
  - Authenticated but incomplete onboarding users to `/onboarding` before protected pages.

