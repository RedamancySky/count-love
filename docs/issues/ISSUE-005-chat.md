# Issue #005 — Nhắn Tin Realtime (Love Chat)

**Module:** Chat  
**Priority:** 🔴 Critical  
**Estimate:** 5 ngày  
**Labels:** `chat`, `realtime`, `pusher`, `frontend`, `backend`

---

## Mô Tả

Hệ thống nhắn tin realtime chỉ dành cho hai người trong cặp đôi. Không chỉ là chat thông thường — đây là không gian nhắn tin đặc biệt với Love Letter, Time Capsule, sticker tình yêu và nhiều tính năng lãng mạn khác.

---

## User Stories

```
US-025: Là người dùng, tôi muốn chat realtime với người yêu
        để liên lạc nhanh chóng trong ứng dụng.

US-026: Là người dùng, tôi muốn gửi ảnh, video trong chat
        để chia sẻ khoảnh khắc ngay lập tức.

US-027: Là người dùng, tôi muốn gửi tin nhắn hẹn giờ (Time Capsule)
        để người yêu đọc vào một thời điểm đặc biệt trong tương lai.

US-028: Là người dùng, tôi muốn viết Love Letter được trang trí đẹp
        để thể hiện tình cảm một cách đặc biệt.

US-029: Là người dùng, tôi muốn react emoji vào tin nhắn
        để phản hồi nhanh mà không cần gõ chữ.

US-030: Là người dùng, tôi muốn biết khi nào người yêu đã đọc tin nhắn
        để biết họ có nhận được không.
```

---

## Acceptance Criteria

### Giao Diện Chat
- [ ] Layout 2 cột trên desktop: sidebar danh sách (chỉ 1 conversation) + vùng chat
- [ ] Layout fullscreen trên mobile
- [ ] Bubble tin nhắn: người dùng hiện tại bên phải (màu primary), người yêu bên trái (màu nhạt)
- [ ] Avatar người gửi bên cạnh bubble (chỉ hiện khi nhóm tin nhắn đầu tiên)
- [ ] Thời gian gửi: hover trên desktop / dưới bubble trên mobile
- [ ] Ngày phân cách (date divider) giữa các ngày khác nhau
- [ ] Nút scroll to bottom khi có tin nhắn mới và đang scroll lên
- [ ] Unread badge trên navigation icon

### Gửi Tin Nhắn
- [ ] Text input với hỗ trợ xuống dòng (Shift+Enter)
- [ ] Gửi bằng Enter (desktop) hoặc nút gửi (mobile)
- [ ] Emoji picker (tích hợp, có tìm kiếm)
- [ ] Chèn ảnh nhanh (từ album hoặc chụp mới)
- [ ] Sticker tình yêu (thư viện 50+ sticker)
- [ ] GIF search (tích hợp GIPHY hoặc Tenor)
- [ ] Character limit: 2000 ký tự

### Trạng Thái Tin Nhắn
- [ ] ✓ Đã gửi (single check)
- [ ] ✓✓ Đã nhận (double check, xám)
- [ ] ✓✓ Đã đọc (double check, màu primary)
- [ ] Đang gõ... (typing indicator với animation 3 chấm)
- [ ] Online / Offline indicator của người yêu

### Reply Tin Nhắn
- [ ] Swipe phải trên bubble để reply (mobile)
- [ ] Hover + click icon reply (desktop)
- [ ] Preview tin nhắn gốc bên trên input
- [ ] Click reply preview trong bubble → scroll đến tin gốc + highlight

### Reaction
- [ ] Long press hoặc hover → hiện picker 6 emoji phổ biến
- [ ] Cho phép chọn nhiều loại reaction trên 1 tin
- [ ] Hiển thị tổng reaction count bên dưới bubble
- [ ] Click reaction → xem ai đã react

### Time Capsule Message 📦
- [ ] Nút đặc biệt trong toolbar input
- [ ] Modal chọn thời gian gửi (date + time picker)
- [ ] Thời gian tối thiểu: 1 giờ sau
- [ ] Thời gian tối đa: 10 năm sau
- [ ] Thêm tiêu đề cho capsule
- [ ] Nội dung: text, ảnh, voice note
- [ ] Tin nhắn hiện với lock icon, không đọc được cho đến khi đến giờ
- [ ] Notification + animation đặc biệt khi capsule mở
- [ ] Danh sách capsule chờ (tab riêng)

### Love Letter 💌
- [ ] Nút "Viết Love Letter" đặc biệt
- [ ] Chọn template thiết kế (5+ mẫu đẹp)
- [ ] Rich text editor đơn giản
- [ ] Chọn màu nền / pattern / border
- [ ] Preview trước khi gửi
- [ ] Người nhận thấy envelope animation trước khi mở
- [ ] Love Letter có thể lưu vào album đặc biệt

### Voice Message 🎙️
- [ ] Nhấn và giữ nút mic để ghi âm
- [ ] Waveform animation khi đang ghi
- [ ] Preview và xóa trước khi gửi
- [ ] Tối đa 2 phút
- [ ] Playback trong chat với progress bar

### Tìm Kiếm Trong Chat
- [ ] Tìm kiếm tin nhắn theo từ khóa
- [ ] Highlight kết quả tìm thấy
- [ ] Navigate giữa các kết quả (↑↓)

### Quản Lý Tin Nhắn
- [ ] Long press → context menu: Copy, Reply, React, Xóa (chỉ trong 24 giờ)
- [ ] Xóa tin nhắn của mình (hiện "Tin nhắn đã bị xóa")
- [ ] Ghim tin nhắn quan trọng (tối đa 5 tin)
- [ ] Xem tin nhắn đã ghim (header click)

---

## Technical Specification

### Files Cần Tạo

```
app/(app)/chat/
├── page.tsx                       # Chat page
└── loading.tsx

components/features/chat/
├── ChatWindow.tsx                 # Main chat area
├── MessageList.tsx                # Virtualized list
├── MessageBubble.tsx              # Single message
├── MessageInput.tsx               # Input bar
├── EmojiPicker.tsx
├── StickerPicker.tsx
├── GifPicker.tsx
├── ReactionPicker.tsx
├── TypingIndicator.tsx
├── TimeCapsuleModal.tsx
├── LoveLetterModal.tsx
├── LoveLetterViewer.tsx
├── VoiceRecorder.tsx
├── AudioPlayer.tsx
├── PinnedMessages.tsx
└── ChatSearch.tsx

hooks/
├── useChat.ts                     # Chat state + Pusher
├── useTypingIndicator.ts
└── useMessageVirtualization.ts    # Virtualized scroll

app/api/messages/
├── route.ts                       # GET (paginated), POST
├── [messageId]/
│   ├── route.ts                   # DELETE
│   └── react/
│       └── route.ts               # POST/DELETE reaction
├── time-capsule/
│   └── route.ts                   # GET list, POST
└── read/
    └── route.ts                   # POST (mark read)
```

### Pusher Realtime Setup

```typescript
// lib/pusher-server.ts
import Pusher from "pusher";
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Channels:
// private-couple-{coupleId}
//   Events:
//   - new-message: { message: Message }
//   - message-read: { messageId, readAt }
//   - reaction-added: { messageId, emoji, userId }
//   - typing: { userId, isTyping }
//   - capsule-opened: { messageId }

// lib/pusher-client.ts
import PusherClient from "pusher-js";
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: "/api/pusher/auth",
});
```

### Message Pagination

```typescript
// GET /api/messages?cursor=<messageId>&limit=30
// Cursor-based pagination, load cũ hơn khi scroll lên trên

{
  messages: Message[],
  nextCursor: string | null,
  hasMore: boolean
}
```

### Typing Indicator

```typescript
// Client: khi người dùng gõ
const handleTyping = useDebouncedCallback(() => {
  pusherClient.trigger(`private-couple-${coupleId}`, "typing", {
    userId: currentUser.id,
    isTyping: false
  });
}, 1000);

// Khi bắt đầu gõ: gửi isTyping: true
// Sau 1 giây không gõ: gửi isTyping: false
```

### Time Capsule Cron Job

```typescript
// Dùng Vercel Cron hoặc QStash để check mỗi phút
// Tìm các capsule có scheduledAt <= now và chưa gửi
// Trigger Pusher event + gửi notification
// /api/cron/time-capsule (GET, protected by secret)
```

---

## Performance

- Message list dùng **virtualization** (react-virtual hoặc @tanstack/virtual) — không render tất cả
- Ảnh trong chat dùng lazy loading + thumbnail nhỏ
- Pusher connection tái sử dụng cho toàn app (singleton)
- Optimistic UI: tin nhắn hiện ngay trước khi server confirm

---

## Definition of Done

- [ ] Chat realtime < 200ms latency (Pusher)
- [ ] Tin nhắn không bị mất khi mất mạng (offline queue)
- [ ] Time Capsule mở đúng giờ
- [ ] Love Letter hiển thị animation đúng
- [ ] Voice message ghi/play hoạt động trên iOS Safari
- [ ] Notification khi có tin mới và app không mở
- [ ] Read receipt cập nhật ngay lập tức
- [ ] Virtualized list không bị giật khi có 1000+ tin nhắn
