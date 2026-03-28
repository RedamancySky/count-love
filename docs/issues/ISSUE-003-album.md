# Issue #003 — Album Kỷ Niệm (Photo Album)

**Module:** Album  
**Priority:** 🔴 Critical  
**Estimate:** 5 ngày  
**Labels:** `album`, `media`, `upload`, `cloudinary`, `frontend`

---

## Mô Tả

Tính năng lưu trữ ảnh và video kỷ niệm của cặp đôi. Đây là một trong những tính năng được sử dụng nhiều nhất — người dùng upload ảnh hàng ngày, tổ chức theo album, và xem lại những kỷ niệm đẹp.

---

## User Stories

```
US-012: Là người dùng, tôi muốn upload ảnh/video lên album
        để lưu giữ kỷ niệm của chúng tôi.

US-013: Là người dùng, tôi muốn tạo nhiều album khác nhau
        để phân loại ảnh theo chủ đề / chuyến đi.

US-014: Là người dùng, tôi muốn xem ảnh dạng lưới và slideshow
        để tận hưởng lại những khoảnh khắc đẹp.

US-015: Là người dùng, tôi muốn xem tính năng "On This Day"
        để nhớ lại những gì xảy ra đúng ngày này năm trước.

US-016: Là người dùng, tôi muốn thêm caption và vị trí cho ảnh
        để gắn thêm câu chuyện vào từng tấm ảnh.

US-017: Là người dùng, tôi muốn share ảnh ra ngoài với watermark
        để người khác biết đây là kỷ niệm của chúng tôi.
```

---

## Acceptance Criteria

### Danh Sách Album
- [ ] Hiển thị tất cả album dạng grid (2 cột mobile, 3-4 cột desktop)
- [ ] Mỗi album: ảnh bìa, tên album, số lượng ảnh, ngày gần nhất
- [ ] Album mặc định "Tất cả ảnh" luôn ở đầu
- [ ] Nút tạo album mới (modal)
- [ ] Sắp xếp: mới nhất / cũ nhất / nhiều ảnh nhất
- [ ] Swipe để xóa album (mobile)

### Tạo / Sửa Album
- [ ] Nhập tên album (bắt buộc, max 50 ký tự)
- [ ] Thêm mô tả (tùy chọn, max 200 ký tự)
- [ ] Chọn ảnh bìa (từ ảnh đã có hoặc upload mới)
- [ ] Xóa album (confirm dialog, ảnh vẫn còn trong "Tất cả ảnh")

### Upload Ảnh/Video
- [ ] Click chọn nhiều file cùng lúc (multi-select)
- [ ] Kéo thả file vào vùng upload (drag & drop)
- [ ] Chụp ảnh trực tiếp từ camera (mobile)
- [ ] Upload tối đa 20 file mỗi lần
- [ ] Giới hạn kích thước: ảnh 10MB, video 100MB
- [ ] Định dạng hỗ trợ: JPG, PNG, HEIC, GIF, MP4, MOV
- [ ] Progress bar cho từng file
- [ ] Tự động nén ảnh trước khi upload (giữ chất lượng)
- [ ] EXIF metadata tự động đọc ngày chụp và GPS

### Xem Ảnh Trong Album
- [ ] Grid layout với lazy loading
- [ ] Click ảnh → mở lightbox/viewer toàn màn hình
- [ ] Swipe trái/phải để xem ảnh tiếp theo trong lightbox (mobile)
- [ ] Hiển thị caption, ngày chụp, vị trí trong lightbox
- [ ] Zoom in/out bằng pinch (mobile) hoặc scroll (desktop)
- [ ] Nút download ảnh gốc
- [ ] Nút share (copy link / share image)

### Chỉnh Sửa Ảnh
- [ ] Chỉnh sửa caption
- [ ] Thêm/sửa ngày chụp thực tế
- [ ] Thêm/sửa tên địa điểm (text hoặc map picker)
- [ ] Di chuyển ảnh sang album khác
- [ ] Đặt làm ảnh bìa album
- [ ] Đặt làm ảnh bìa cặp đôi
- [ ] Xóa ảnh (confirm dialog)

### Tính Năng "On This Day"
- [ ] Widget nhỏ trên trang album hoặc dashboard
- [ ] Hiển thị ảnh được chụp đúng ngày này các năm trước
- [ ] Format: "1 năm trước - [caption]" với ảnh preview
- [ ] Nếu không có ảnh ngày này → ẩn widget
- [ ] Click → xem ảnh trong lightbox

### Timeline View
- [ ] Chuyển đổi giữa Grid view và Timeline view
- [ ] Timeline sắp xếp theo tháng/năm
- [ ] Mỗi group có header "Tháng X, Năm Y — N ảnh"
- [ ] Scroll nhanh theo năm (năm selector ở sidebar)

### Video
- [ ] Thumbnail preview tự động cho video
- [ ] Play video inline trong grid (tự động tắt tiếng)
- [ ] Fullscreen player trong lightbox
- [ ] Chỉ hiện icon play overlay trên thumbnail

### Share Ảnh
- [ ] Tạo link chia sẻ công khai (có thể xem không cần đăng nhập)
- [ ] Watermark tùy chọn: tên cặp đôi + logo app + số ngày
- [ ] Share thẳng lên Facebook, Instagram, copy link
- [ ] Tắt chức năng share theo từng ảnh

---

## Technical Specification

### Files Cần Tạo

```
app/(app)/album/
├── page.tsx                       # Danh sách album
├── loading.tsx
├── [albumId]/
│   ├── page.tsx                   # Ảnh trong album
│   ├── loading.tsx
│   └── [mediaId]/
│       └── page.tsx               # Lightbox (OG)

components/features/album/
├── AlbumGrid.tsx
├── AlbumCard.tsx
├── CreateAlbumModal.tsx
├── MediaGrid.tsx
├── MediaCard.tsx
├── MediaLightbox.tsx              # Fullscreen viewer
├── UploadZone.tsx                 # Drag & drop upload
├── UploadProgress.tsx
├── EditMediaModal.tsx
├── OnThisDay.tsx
├── TimelineView.tsx
└── ShareModal.tsx

app/api/
├── albums/
│   ├── route.ts                   # GET (list), POST (create)
│   └── [albumId]/
│       ├── route.ts               # GET, PATCH, DELETE
│       └── media/
│           └── route.ts           # GET (list media in album)
└── media/
    ├── route.ts                   # POST (upload)
    ├── [mediaId]/
    │   └── route.ts               # GET, PATCH, DELETE
    └── on-this-day/
        └── route.ts               # GET
```

### Upload Flow

```typescript
// 1. Client: chọn file → validate → compress
// 2. Client: gọi POST /api/media/presigned để lấy Cloudinary upload URL
// 3. Client: upload trực tiếp lên Cloudinary (không qua server)
// 4. Client: sau khi upload xong → gọi POST /api/media với publicId
// 5. Server: lưu metadata vào database

// Upload API
// POST /api/media
// Body: { albumId, publicId, type, takenAt, location, caption }
// Response: { media: Media }

// PATCH /api/media/:id
// Body: { caption?, takenAt?, location?, albumId? }

// DELETE /api/media/:id
// (soft delete hoặc xóa luôn Cloudinary)
```

### Cloudinary Config

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload folder structure:
// count-love/{coupleId}/albums/{albumId}/{publicId}

// Transformations:
// Thumbnail: w_400,h_400,c_fill,q_auto,f_auto
// Preview:   w_800,q_auto,f_auto
// Original:  fl_attachment (force download)
```

### Image Compression (Client-side)

```typescript
// lib/image-compress.ts
import Compressor from "compressorjs";

export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 2048,
      maxHeight: 2048,
      success: (result) => resolve(result as File),
      error: reject,
    });
  });
}
```

### API Response Types

```typescript
interface AlbumWithCount {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  _count: { media: number };
  latestMedia: { url: string; createdAt: string }[];
  createdAt: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  caption: string | null;
  takenAt: string | null;
  location: string | null;
  width: number | null;
  height: number | null;
  uploader: { id: string; name: string; image: string };
  createdAt: string;
}
```

---

## Storage Limits

| Plan | Storage | Ảnh tối đa | Video tối đa |
|---|---|---|---|
| Free | 1 GB | 10 MB/file | 50 MB/file |
| Premium | 10 GB | 20 MB/file | 200 MB/file |

---

## Definition of Done

- [ ] Upload hoạt động trên mobile (iOS Safari, Android Chrome)
- [ ] Progress bar chính xác khi upload nhiều file
- [ ] Lightbox swipe gesture hoạt động
- [ ] "On This Day" hiển thị đúng ảnh theo ngày
- [ ] Thumbnail tự động generate cho video
- [ ] Share với watermark render đúng
- [ ] Xóa ảnh cũng xóa trên Cloudinary
- [ ] Lazy loading ảnh hoạt động (Intersection Observer)
- [ ] Test upload file >10MB → báo lỗi đúng
