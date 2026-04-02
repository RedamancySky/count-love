# 🗄️ Database Schema — Count Love

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// AUTH & USER
// ─────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // hashed, nullable for OAuth
  birthDate     DateTime?
  nickname      String?   // tên gọi thân mật (do người yêu đặt)
  bio           String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // NextAuth relations
  accounts      Account[]
  sessions      Session[]

  // App relations
  coupleAs1     Couple?   @relation("User1")
  coupleAs2     Couple?   @relation("User2")
  diaryEntries  DiaryEntry[]
  sentMessages  Message[] @relation("SentMessages")
  uploadedMedia Media[]
  notifications Notification[]
  gameScores    GameScore[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─────────────────────────────────────────
// COUPLE
// ─────────────────────────────────────────

model Couple {
  id            String   @id @default(cuid())
  user1Id       String   @unique
  user2Id       String   @unique
  startDate     DateTime // ngày bắt đầu yêu
  coupleCode    String   @unique // mã mời 6 ký tự
  themeName     String   @default("rose") // tên theme giao diện
  coverImage    String?  // ảnh bìa đại diện cặp đôi
  coupleTitle   String?  // danh hiệu cặp đôi tự đặt
  status        CoupleStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user1         User     @relation("User1", fields: [user1Id], references: [id])
  user2         User     @relation("User2", fields: [user2Id], references: [id])

  albums        Album[]
  events        Event[]
  bucketItems   BucketItem[]
  messages      Message[]
  achievements  CoupleAchievement[]
  challenges    Challenge[]
  settings      CoupleSetting?

  @@map("couples")
}

enum CoupleStatus {
  PENDING   // user1 tạo, chờ user2 tham gia
  ACTIVE    // đang hoạt động
  PAUSED    // tạm dừng
}

model CoupleSetting {
  id              String  @id @default(cuid())
  coupleId        String  @unique
  allowDiaryRead  Boolean @default(true)  // cho phép đọc nhật ký nhau
  notifyDays      Int[]   @default([1, 7]) // nhắc trước N ngày
  language        String  @default("vi")
  timezone        String  @default("Asia/Ho_Chi_Minh")

  couple          Couple  @relation(fields: [coupleId], references: [id])

  @@map("couple_settings")
}

// ─────────────────────────────────────────
// ALBUM & MEDIA
// ─────────────────────────────────────────

model Album {
  id          String   @id @default(cuid())
  coupleId    String
  title       String
  description String?
  coverImage  String?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  couple      Couple   @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  media       Media[]

  @@map("albums")
}

model Media {
  id          String    @id @default(cuid())
  albumId     String?
  uploaderId  String
  url         String    // Cloudinary URL
  publicId    String    // Cloudinary public ID
  type        MediaType
  caption     String?
  takenAt     DateTime? // ngày chụp thực tế
  location    String?   // tên địa điểm
  latitude    Float?
  longitude   Float?
  width       Int?
  height      Int?
  duration    Int?      // giây, cho video
  size        Int?      // bytes
  isPrivate   Boolean   @default(false)
  createdAt   DateTime  @default(now())

  album       Album?    @relation(fields: [albumId], references: [id])
  uploader    User      @relation(fields: [uploaderId], references: [id])
  diaryMedia  DiaryMedia[]

  @@map("media")
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
}

// ─────────────────────────────────────────
// DIARY
// ─────────────────────────────────────────

model DiaryEntry {
  id          String    @id @default(cuid())
  authorId    String
  title       String?
  content     String    @db.Text // rich text (HTML / JSON)
  mood        Mood?
  weather     String?
  isPrivate   Boolean   @default(false)
  isShared    Boolean   @default(true)  // chia sẻ với người yêu
  date        DateTime  @default(now()) // ngày thực tế của nhật ký
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  author      User      @relation(fields: [authorId], references: [id])
  media       DiaryMedia[]
  tags        DiaryTag[]

  @@map("diary_entries")
}

model DiaryMedia {
  diaryId     String
  mediaId     String

  diary       DiaryEntry @relation(fields: [diaryId], references: [id], onDelete: Cascade)
  media       Media      @relation(fields: [mediaId], references: [id])

  @@id([diaryId, mediaId])
  @@map("diary_media")
}

model DiaryTag {
  id      String @id @default(cuid())
  name    String
  diaryId String

  diary   DiaryEntry @relation(fields: [diaryId], references: [id], onDelete: Cascade)

  @@map("diary_tags")
}

enum Mood {
  HAPPY
  LOVED
  EXCITED
  CALM
  NOSTALGIC
  SAD
  MISSING
  GRATEFUL
  ROMANTIC
  SILLY
}

// ─────────────────────────────────────────
// MESSAGES & CHAT
// ─────────────────────────────────────────

model Message {
  id            String      @id @default(cuid())
  coupleId      String
  senderId      String
  content       String?     @db.Text
  type          MessageType @default(TEXT)
  mediaUrl      String?
  isRead        Boolean     @default(false)
  readAt        DateTime?
  replyToId     String?     // ID tin nhắn được reply
  scheduledAt   DateTime?   // gửi vào thời điểm cụ thể
  sentAt        DateTime?   // thực tế đã gửi
  isTimeCapsule Boolean     @default(false)
  createdAt     DateTime    @default(now())

  couple        Couple      @relation(fields: [coupleId], references: [id])
  sender        User        @relation("SentMessages", fields: [senderId], references: [id])
  replyTo       Message?    @relation("Replies", fields: [replyToId], references: [id])
  replies       Message[]   @relation("Replies")
  reactions     Reaction[]

  @@map("messages")
}

model Reaction {
  id        String  @id @default(cuid())
  messageId String
  userId    String
  emoji     String  // e.g. "❤️", "😂", "😢"

  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId])
  @@map("reactions")
}

enum MessageType {
  TEXT
  IMAGE
  VIDEO
  STICKER
  LOVE_LETTER
  AUDIO
  LOCATION
  TIME_CAPSULE
}

// ─────────────────────────────────────────
// EVENTS & CALENDAR
// ─────────────────────────────────────────

model Event {
  id            String      @id @default(cuid())
  coupleId      String
  title         String
  description   String?
  type          EventType
  date          DateTime
  endDate       DateTime?
  isRecurring   Boolean     @default(false)
  recurringRule String?     // RRULE string (e.g. FREQ=YEARLY)
  color         String?     // hex màu hiển thị trên lịch
  reminderDays  Int[]       @default([1])
  coverImage    String?
  location      String?
  isPrivate     Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  couple        Couple      @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  reminders     Reminder[]

  @@map("events")
}

enum EventType {
  ANNIVERSARY     // kỷ niệm yêu
  BIRTHDAY        // sinh nhật
  DATE            // hẹn hò
  TRAVEL          // du lịch
  MILESTONE       // cột mốc quan trọng
  OTHER
}

model Reminder {
  id          String   @id @default(cuid())
  eventId     String
  sendAt      DateTime
  isSent      Boolean  @default(false)
  sentAt      DateTime?

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("reminders")
}

// ─────────────────────────────────────────
// BUCKET LIST
// ─────────────────────────────────────────

model BucketItem {
  id            String           @id @default(cuid())
  coupleId      String
  title         String
  description   String?
  category      BucketCategory
  targetDate    DateTime?
  isCompleted   Boolean          @default(false)
  completedAt   DateTime?
  completedNote String?
  coverImage    String?          // ảnh sau khi hoàn thành
  priority      Int              @default(0) // 0=low, 1=medium, 2=high
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  couple        Couple           @relation(fields: [coupleId], references: [id], onDelete: Cascade)

  @@map("bucket_items")
}

enum BucketCategory {
  TRAVEL      // du lịch
  FOOD        // ẩm thực
  EXPERIENCE  // trải nghiệm
  FAMILY      // gia đình
  ADVENTURE   // phiêu lưu
  LEARNING    // học tập
  ROMANTIC    // lãng mạn
  OTHER
}

// ─────────────────────────────────────────
// ACHIEVEMENTS & GAMIFICATION
// ─────────────────────────────────────────

model Achievement {
  id          String   @id @default(cuid())
  code        String   @unique // e.g. "DAYS_100", "FIRST_PHOTO"
  title       String
  description String
  iconUrl     String
  condition   String   // JSON mô tả điều kiện
  points      Int      @default(10)

  couples     CoupleAchievement[]

  @@map("achievements")
}

model CoupleAchievement {
  id            String   @id @default(cuid())
  coupleId      String
  achievementId String
  unlockedAt    DateTime @default(now())

  couple        Couple      @relation(fields: [coupleId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  @@unique([coupleId, achievementId])
  @@map("couple_achievements")
}

// ─────────────────────────────────────────
// CHALLENGES & GAMES
// ─────────────────────────────────────────

model Challenge {
  id          String          @id @default(cuid())
  coupleId    String
  type        ChallengeType
  title       String
  description String
  startDate   DateTime
  endDate     DateTime
  status      ChallengeStatus @default(ACTIVE)
  tasks       Json            // mảng task JSON
  createdAt   DateTime        @default(now())

  couple      Couple          @relation(fields: [coupleId], references: [id])

  @@map("challenges")
}

enum ChallengeType {
  DAILY_30   // 30 ngày thử thách
  WEEKLY
  CUSTOM
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

model GameScore {
  id        String   @id @default(cuid())
  userId    String
  gameType  String   // e.g. "QUIZ", "LOVE_METER"
  score     Int
  metadata  Json?    // dữ liệu phụ
  playedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@map("game_scores")
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  data      Json?            // payload bổ sung
  isRead    Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id])

  @@map("notifications")
}

enum NotificationType {
  MESSAGE           // tin nhắn mới
  ANNIVERSARY       // kỷ niệm sắp tới
  BIRTHDAY          // sinh nhật sắp tới
  ACHIEVEMENT       // huy hiệu mới
  DIARY_SHARED      // nhật ký mới từ người yêu
  CHALLENGE         // thử thách mới
  TIME_CAPSULE      // tin nhắn hẹn giờ đã đến hạn
  SYSTEM
}
```

---

## Entity Relationship Diagram

```
User ──────────────── Couple ──────────────── CoupleSetting
  │                     │
  │              ┌──────┼──────┐──────────────────────┐
  │           Album  Event  BucketItem  Message  Achievement
  │              │              
  │           Media ◄──────── DiaryMedia
  │                                │
  └─── DiaryEntry ─────────────────┘
```

---

## Indexes Quan Trọng

```sql
-- Tìm couple theo user
CREATE INDEX idx_couple_user1 ON couples(user1_id);
CREATE INDEX idx_couple_user2 ON couples(user2_id);

-- Lấy messages theo couple, sort theo thời gian
CREATE INDEX idx_messages_couple_created ON messages(couple_id, created_at DESC);

-- Lấy diary entries theo author và ngày
CREATE INDEX idx_diary_author_date ON diary_entries(author_id, date DESC);

-- Lấy media theo album
CREATE INDEX idx_media_album ON media(album_id, created_at DESC);

-- Tìm events sắp tới
CREATE INDEX idx_events_couple_date ON events(couple_id, date ASC);

-- Notifications chưa đọc
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
```

---

## Issue-001 Local Auth Data Model (In-memory Scaffold)

For local-first implementation in `feature/issue-1`, auth/onboarding state is persisted in-memory (`lib/auth/store.js`) with these collections:

- `users` (`Map<userId, user>`)
  - `id`, `name`, `email`, `passwordHash?`, `emailVerified?`
  - `failedAttempts`, `lockUntil`
  - `onboardingStep`, `onboardingCompleted`
  - `coupleId?`, `nickname?`, `birthDate?`, `bio?`, `avatar?`
  - `oauthProviders[]`
- `usersByEmail` (`Map<email, userId>`)
- `oauthAccounts` (`Map<provider:providerAccountId, userId>`)
- `verifyTokens` (`Map<token, { userId, expiresAt, used }>`)
- `resetTokens` (`Map<token, { userId, expiresAt, used }>`)
- `couplesById` (`Map<coupleId, couple>`)
- `couplesByCode` (`Map<6-char-code, coupleId>`)
- `sessionsByToken` (`Map<sessionToken, { userId, expiresAt }>`)

### Couple room contract

- Room code is uppercase alphanumeric, fixed length 6.
- Room invite expires in 24h.
- `qrCodePayload` format: `countlove://couple/join?code=ABC123`.

### Security rules implemented

- Email/password login blocked until email is verified.
- Account lock after 5 consecutive wrong passwords (15 minutes).
- Password reset token expires in 1 hour and is single-use.

---

## Supabase Connection Notes (March 28, 2026)

Project now uses Supabase Auth as the primary authentication provider.

### Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, for admin/diagnostic operations)

### Health-check endpoint

- `GET /api/health/supabase`
  - Confirms env wiring.
  - Runs `auth.admin.listUsers` only when `SUPABASE_SERVICE_ROLE_KEY` is available.

### Supabase migration file

- Initial SQL schema is now provided at:
  - `supabase/migrations/20260328_000001_init_countlove.sql`
- This migration includes:
  - `profiles` bound to `auth.users`
  - `couples`, onboarding-related columns
  - Core domain tables (albums, media, diary, messages, events, bucket, achievements, challenges, scores, notifications)
  - Indexes and updated_at triggers
  - RLS starter policies for `profiles` and `couples`

