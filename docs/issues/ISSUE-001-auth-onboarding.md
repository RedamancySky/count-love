# Issue #001 — Authentication & Onboarding

**Module:** Auth  
**Priority:** 🔴 Critical  
**Estimate:** 5 ngày  
**Labels:** `auth`, `onboarding`, `backend`, `frontend`

---

## Mô Tả

Xây dựng toàn bộ hệ thống xác thực người dùng và luồng onboarding cho cặp đôi mới. Đây là nền tảng của toàn bộ ứng dụng — mọi tính năng khác đều phụ thuộc vào module này.

---

## User Stories

```
US-001: Là người dùng mới, tôi muốn đăng ký tài khoản bằng email và mật khẩu
        để bắt đầu sử dụng ứng dụng.

US-002: Là người dùng, tôi muốn đăng nhập bằng tài khoản Google / Facebook
        để tiết kiệm thời gian tạo tài khoản.

US-003: Là người dùng vừa đăng ký, tôi muốn được hướng dẫn từng bước
        để kết nối với người yêu và thiết lập hồ sơ cặp đôi.

US-004: Là người dùng, tôi muốn nhận email xác nhận
        để bảo vệ tài khoản của mình.

US-005: Là người dùng quên mật khẩu, tôi muốn reset mật khẩu qua email
        để lấy lại quyền truy cập.

US-006: Là người dùng đã đăng nhập, tôi muốn được bảo vệ session
        để không bị đăng xuất đột ngột.
```

---

## Acceptance Criteria

### Đăng Ký
- [ ] Form đăng ký có các trường: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu
- [ ] Validate email hợp lệ (format + unique)
- [ ] Mật khẩu tối thiểu 8 ký tự, có chữ hoa, chữ thường, số
- [ ] Hiển thị lỗi inline, rõ ràng bên dưới từng trường
- [ ] Gửi email xác nhận sau khi đăng ký thành công
- [ ] Không cho đăng nhập nếu email chưa xác nhận
- [ ] Loading state khi đang submit

### Đăng Nhập
- [ ] Đăng nhập bằng Email + Password
- [ ] Nút "Đăng nhập với Google" (OAuth)
- [ ] Nút "Đăng nhập với Facebook" (OAuth)
- [ ] Checkbox "Ghi nhớ đăng nhập" (30 ngày)
- [ ] Hiển thị lỗi cụ thể (sai mật khẩu, email không tồn tại)
- [ ] Rate limiting: khóa tài khoản sau 5 lần sai liên tiếp (15 phút)

### Quên Mật Khẩu
- [ ] Nhập email → nhận link reset (hết hạn sau 1 giờ)
- [ ] Link reset chỉ dùng được 1 lần
- [ ] Sau khi reset thành công → chuyển về trang đăng nhập

### Luồng Onboarding (6 bước)

**Bước 1 — Chào mừng**
- [ ] Màn hình splash với animation chào mừng
- [ ] Giới thiệu ngắn gọn về app

**Bước 2 — Tạo Hồ Sơ**
- [ ] Upload ảnh đại diện (từ máy hoặc camera)
- [ ] Điền tên hiển thị (bắt buộc)
- [ ] Điền ngày sinh (bắt buộc, để nhắc sinh nhật)
- [ ] Viết bio ngắn (tùy chọn, max 150 ký tự)

**Bước 3 — Kết Nối Người Yêu**
- [ ] Hiển thị 2 lựa chọn: "Tạo phòng mới" hoặc "Tham gia phòng"
- [ ] Tạo phòng mới: Generate mã 6 ký tự (ex: `LOVE42`) + QR code
- [ ] Tham gia phòng: Nhập mã 6 ký tự hoặc quét QR
- [ ] Mã mời hết hạn sau 24 giờ
- [ ] Hiển thị loading khi chờ người yêu quét mã

**Bước 4 — Ngày Bắt Đầu Yêu**
- [ ] Date picker trực quan, dạng lịch
- [ ] Không cho chọn ngày trong tương lai
- [ ] Hiển thị preview "Bạn đã yêu nhau X ngày"

**Bước 5 — Chọn Theme**
- [ ] Hiển thị tối thiểu 6 theme màu sắc khác nhau
- [ ] Preview realtime khi chọn theme
- [ ] Đặt tên cho cặp đôi (tùy chọn)

**Bước 6 — Hoàn Thành**
- [ ] Màn hình congrats với animation ✨
- [ ] CTA "Khám phá ngay" → chuyển tới Dashboard

---

## Technical Specification

### Files Cần Tạo

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   └── verify-email/
│       └── page.tsx
├── (onboarding)/
│   ├── layout.tsx
│   └── onboarding/
│       ├── page.tsx          # Step controller
│       ├── step-1-welcome/
│       ├── step-2-profile/
│       ├── step-3-connect/
│       ├── step-4-date/
│       ├── step-5-theme/
│       └── step-6-done/
└── api/
    └── auth/
        ├── [...nextauth]/route.ts
        ├── register/route.ts
        ├── verify-email/route.ts
        ├── forgot-password/route.ts
        ├── reset-password/route.ts
        ├── couple/
        │   ├── create/route.ts
        │   └── join/route.ts
        └── onboarding/route.ts
```

### NextAuth Config

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({ ... }),
    Facebook({ ... }),
    Credentials({
      async authorize(credentials) {
        // validate email + bcrypt password
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.coupleId = user.coupleId; // attach coupleId
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.coupleId = token.coupleId;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  }
});
```

### API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| GET | `/api/auth/verify-email` | Xác nhận email |
| POST | `/api/auth/forgot-password` | Yêu cầu reset |
| POST | `/api/auth/reset-password` | Đặt mật khẩu mới |
| POST | `/api/auth/couple/create` | Tạo Couple Room |
| POST | `/api/auth/couple/join` | Tham gia bằng mã |
| PATCH | `/api/auth/onboarding` | Lưu tiến trình onboarding |

### Validation Schema (Zod)

```typescript
// lib/validations/auth.ts
export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Cần ít nhất 1 số"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"]
});

export const coupleJoinSchema = z.object({
  code: z.string().length(6).toUpperCase()
});

export const onboardingProfileSchema = z.object({
  nickname: z.string().min(1).max(50),
  birthDate: z.date().max(new Date()),
  bio: z.string().max(150).optional(),
  avatar: z.string().url().optional(),
});
```

### Middleware

```typescript
// middleware.ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/album/:path*",
    "/diary/:path*",
    "/chat/:path*",
    "/calendar/:path*",
    "/games/:path*",
    "/settings/:path*",
  ]
};

// Redirect nếu chưa đăng nhập hoặc chưa hoàn thành onboarding
```

---

## Email Templates

### 1. Xác Nhận Email
- Subject: "Xác nhận email của bạn — Count Love 💕"
- Body: Nút CTA + link fallback, hết hạn sau 24 giờ

### 2. Reset Mật Khẩu
- Subject: "Đặt lại mật khẩu — Count Love"
- Body: Nút reset + cảnh báo bảo mật, hết hạn sau 1 giờ

### 3. Chào Mừng (sau verify)
- Subject: "Chào mừng bạn đến với Count Love 💕"
- Body: Hướng dẫn bắt đầu + link app

---

## Edge Cases

| Tình huống | Xử lý |
|---|---|
| Email đã tồn tại khi đăng ký | Báo lỗi "Email đã được sử dụng" |
| Link verify email hết hạn | Cho phép gửi lại email mới |
| Mã kết đôi không tồn tại | Báo lỗi rõ ràng + gợi ý kiểm tra lại |
| User đã có couple nhập mã khác | Từ chối + giải thích |
| OAuth email trùng với email/pass | Merge tài khoản tự động |
| Mất kết nối khi onboarding | Lưu tiến trình, tiếp tục được |

---

## Definition of Done

- [ ] Tất cả AC đều pass
- [ ] Unit test cho validation logic
- [ ] Integration test cho auth flow
- [ ] Email templates render đúng trên các mail client
- [ ] Responsive trên mobile (375px) và desktop (1440px)
- [ ] Accessibility: form labels, focus states, error announcements
- [ ] Rate limiting hoạt động
- [ ] Không có secret/key lộ trong code

---

## Implementation Status (feature/issue-1, 2026-03-28)

Delivered in current branch:

- Register/login/verify/resend-verify/forgot/reset flows with validation and inline error wiring.
- OAuth simulation endpoints for Google/Facebook with account merge by email.
- Rate limiting lock after 5 failed attempts (15 minutes).
- Onboarding step controller (6 steps) including profile avatar upload, partner connect with invite code + QR payload, start-date preview, theme live preview, and completion CTA.
- Couple room create/join/status endpoints with 24h invite expiry.
- Middleware guards for auth and onboarding completion.
- Unit/integration coverage in local test harness.

Known scaffold constraint:

- Auth persistence is in-memory (not yet Prisma/Postgres-backed).
- OAuth is simulated endpoint flow for local-first verification.

