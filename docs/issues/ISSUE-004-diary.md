# Issue #004 — Nhật Ký Tình Yêu (Love Diary)

**Module:** Diary  
**Priority:** 🟠 High  
**Estimate:** 4 ngày  
**Labels:** `diary`, `rich-text`, `mood`, `frontend`, `backend`

---

## Mô Tả

Module viết nhật ký cá nhân với rich text editor, mood tracker và khả năng chia sẻ với người yêu. Nhật ký là không gian riêng tư nhất của ứng dụng — nơi mỗi người ghi lại cảm xúc, suy nghĩ và kỷ niệm của ngày hôm đó.

---

## User Stories

```
US-018: Là người dùng, tôi muốn viết nhật ký với rich text editor
        để ghi lại cảm xúc và câu chuyện của ngày hôm nay.

US-019: Là người dùng, tôi muốn đính kèm ảnh vào nhật ký
        để nhật ký sinh động hơn.

US-020: Là người dùng, tôi muốn gắn mood (cảm xúc) cho từng entry
        để theo dõi cảm xúc theo thời gian.

US-021: Là người dùng, tôi muốn chia sẻ nhật ký với người yêu
        để họ biết cảm xúc của mình mà không cần nói trực tiếp.

US-022: Là người dùng, tôi muốn có nhật ký bí mật chỉ mình đọc
        để có không gian riêng tư hoàn toàn.

US-023: Là người dùng, tôi muốn export nhật ký thành PDF
        để lưu giữ vĩnh viễn.

US-024: Là người dùng, tôi muốn tìm kiếm nhật ký theo từ khóa và ngày
        để tìm lại ký ức cụ thể.
```

---

## Acceptance Criteria

### Danh Sách Nhật Ký
- [ ] Hiển thị entries theo dạng timeline (mới nhất trên cùng)
- [ ] Mỗi entry: ngày, mood emoji, tiêu đề (hoặc snippet nội dung), ảnh thumbnail (nếu có)
- [ ] Badge "Bí mật 🔒" cho private entries
- [ ] Badge "Đã chia sẻ 👁" cho entries người yêu đã xem
- [ ] Filter: Tất cả / Của tôi / Của người yêu
- [ ] Filter theo mood
- [ ] Filter theo tháng/năm (calendar mini picker)
- [ ] Tìm kiếm full-text
- [ ] Infinite scroll

### Viết Nhật Ký (Editor)
- [ ] Rich text editor với toolbar: **Bold**, *Italic*, Underline, ~~Strike~~
- [ ] Heading H1, H2, H3
- [ ] Danh sách có dấu đầu dòng và đánh số
- [ ] Block quote
- [ ] Emoji picker
- [ ] Chèn ảnh vào trong nội dung
- [ ] Chèn ảnh từ album đã có hoặc upload mới
- [ ] Text alignment (left, center, right)
- [ ] Giới hạn: không giới hạn độ dài văn bản
- [ ] Auto-save draft mỗi 30 giây
- [ ] Hiển thị "Đã lưu lúc HH:MM" ở góc

### Header Nhật Ký
- [ ] Chọn ngày viết (mặc định là hôm nay)
- [ ] Tiêu đề (tùy chọn, max 100 ký tự)
- [ ] Chọn Mood (emoji picker — 10 mood)
- [ ] Ghi thời tiết (text, tùy chọn)
- [ ] Tags (tự nhập, có autocomplete từ tags đã dùng)

### Quyền Riêng Tư
- [ ] Toggle "Chia sẻ với người yêu" (mặc định ON theo setting couple)
- [ ] Toggle "Bí mật" (chỉ mình đọc, kể cả người yêu cũng không thấy)
- [ ] Nếu là "Bí mật" → hiển thị cảnh báo rõ ràng
- [ ] Người yêu xem được diary được share → badge "Đã xem" hiện trên entry của tác giả

### Đọc Nhật Ký Của Người Yêu
- [ ] Hiển thị nhật ký của người yêu (những entry họ đã set isShared=true)
- [ ] Có thể react bằng emoji (không comment, chỉ react để bảo tồn sự riêng tư)
- [ ] Notification khi người yêu có entry mới

### Mood Timeline
- [ ] Trang riêng hiển thị mood theo ngày trong tháng
- [ ] Dạng heatmap calendar: mỗi ô là 1 ngày, màu sắc theo mood
- [ ] Hover/click để xem entry của ngày đó
- [ ] Thống kê: mood phổ biến nhất tháng này

### Export PDF
- [ ] Chọn khoảng thời gian export
- [ ] Chọn include/exclude: ảnh, private entries
- [ ] PDF được định dạng đẹp với typography lãng mạn
- [ ] Mỗi entry là một trang hoặc liên tiếp
- [ ] Cover page với tên cặp đôi và khoảng thời gian
- [ ] Page numbers và watermark nhẹ

---

## Technical Specification

### Files Cần Tạo

```
app/(app)/diary/
├── page.tsx                       # Danh sách entries
├── loading.tsx
├── new/
│   └── page.tsx                   # Trang viết mới
├── [entryId]/
│   ├── page.tsx                   # Đọc entry
│   └── edit/
│       └── page.tsx               # Sửa entry
└── mood/
    └── page.tsx                   # Mood timeline

components/features/diary/
├── DiaryList.tsx
├── DiaryCard.tsx
├── DiaryEditor.tsx                # Wrapper cho Tiptap
├── DiaryHeader.tsx                # Ngày, mood, tiêu đề
├── MoodPicker.tsx
├── TagInput.tsx
├── PrivacyToggle.tsx
├── DiaryViewer.tsx                # Read-only view
├── MoodCalendar.tsx               # Heatmap calendar
├── DiaryFilters.tsx
└── ExportDiaryModal.tsx

app/api/diary/
├── route.ts                       # GET (list), POST (create)
├── [entryId]/
│   └── route.ts                   # GET, PATCH, DELETE
├── draft/
│   └── route.ts                   # PUT (auto-save)
└── export/
    └── route.ts                   # POST (generate PDF)
```

### Rich Text Editor — Tiptap Config

```typescript
// components/features/diary/DiaryEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({ inline: true, allowBase64: false }),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: "Hôm nay của bạn như thế nào?..." }),
    CharacterCount,
  ],
  onUpdate: ({ editor }) => {
    // trigger auto-save debounced 30s
  }
});
```

### Auto-Save

```typescript
// Debounced auto-save
const autoSave = useDebouncedCallback(async (content) => {
  await fetch("/api/diary/draft", {
    method: "PUT",
    body: JSON.stringify({ content, entryId: draftId })
  });
  setSavedAt(new Date());
}, 30000);
```

### API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/diary?filter=mine&mood=HAPPY&month=2024-03&q=keyword` | Danh sách, filter, search |
| POST | `/api/diary` | Tạo entry mới |
| GET | `/api/diary/:id` | Lấy chi tiết entry |
| PATCH | `/api/diary/:id` | Cập nhật entry |
| DELETE | `/api/diary/:id` | Xóa entry |
| PUT | `/api/diary/draft` | Auto-save draft |
| POST | `/api/diary/export` | Generate PDF |

### PDF Export (Server-side)

```typescript
// Dùng @react-pdf/renderer
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

// Render HTML content từ Tiptap → parse → render thành React PDF components
// Cover page: tên cặp đôi, khoảng thời gian, số ngày yêu
```

---

## Mood List

| Emoji | Key | Label VN |
|---|---|---|
| 😊 | HAPPY | Vui vẻ |
| 🥰 | LOVED | Được yêu |
| 🎉 | EXCITED | Hào hứng |
| 😌 | CALM | Bình yên |
| 🥺 | NOSTALGIC | Nhớ nhung |
| 😢 | SAD | Buồn |
| 💭 | MISSING | Nhớ người yêu |
| 🙏 | GRATEFUL | Biết ơn |
| 💕 | ROMANTIC | Lãng mạn |
| 😜 | SILLY | Nghịch ngợm |

---

## Definition of Done

- [ ] Editor hoạt động tốt trên mobile (virtual keyboard không che editor)
- [ ] Auto-save không mất nội dung khi tắt tab
- [ ] Private entries không lộ qua API cho người khác
- [ ] Search full-text hoạt động (PostgreSQL full-text search)
- [ ] Mood calendar render đúng màu sắc
- [ ] PDF export đúng định dạng, ảnh nhúng được
- [ ] Notification khi người yêu có diary mới
- [ ] Không cho người dùng khác ngoài couple đọc diary
