# 🎨 Design System - Knowledge Sharing Platform

## Bảng màu (Color Palette)

Design system sử dụng bảng màu pastel nhẹ nhàng, được trích xuất từ Figma design:

### Brand Colors

| Tên Màu    | HEX Code  | Sử dụng                               | Tailwind Class                         |
| ---------- | --------- | ------------------------------------- | -------------------------------------- |
| **Sky**    | `#C0D8F4` | Pastel sky blue - màu chủ đạo nhất    | `text-brand-sky`, `bg-brand-sky`       |
| **Aqua**   | `#A9CDEB` | Soft cyan - màu phụ                   | `text-brand-aqua`, `bg-brand-aqua`     |
| **Indigo** | `#CDB8ED` | Lavender/indigo - màu chuyển tiếp     | `text-brand-indigo`, `bg-brand-indigo` |
| **Violet** | `#DCBEF2` | Pink-purple - màu kết thúc gradient   | `text-brand-violet`, `bg-brand-violet` |
| **Blue**   | `#6D93E2` | Medium blue - dùng cho text và accent | `text-brand-blue`, `bg-brand-blue`     |

---

## 🌈 Gradient System

### Hero Gradient (Gradient chính)

Gradient chuyển mượt từ xanh pastel → aqua → lavender → hồng tím:

```css
linear-gradient(135deg, #C0D8F4 0%, #A9CDEB 25%, #CDB8ED 60%, #DCBEF2 100%)
```

**Cách sử dụng:**

#### 1. Tailwind Class (Recommended)

```jsx
<div className="bg-hero-gradient min-h-screen">{/* Content */}</div>
```

#### 2. CSS Variable

```jsx
<div className="bg-gradient-hero">{/* Content */}</div>
```

#### 3. Inline Style (khi cần custom)

```jsx
<div
  style={{
    background:
      "linear-gradient(135deg, #C0D8F4 0%, #A9CDEB 25%, #CDB8ED 60%, #DCBEF2 100%)",
  }}
>
  {/* Content */}
</div>
```

---

## 🎯 Use Cases

### 1. Nền trang landing

```jsx
<div className="bg-hero-gradient min-h-screen">
  <div className="container mx-auto">{/* Hero content */}</div>
</div>
```

### 2. Gradient text (Text trong suốt với gradient)

```jsx
<h1
  className="bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-violet 
               bg-clip-text text-transparent text-5xl font-bold"
>
  Share knowledge, earn value
</h1>
```

### 3. Button với gradient

```jsx
<button
  className="px-10 py-4 rounded-full text-white font-semibold
                   bg-gradient-to-br from-brand-blue via-brand-indigo to-brand-violet
                   hover:opacity-90 transition-all duration-300 
                   hover:scale-105 shadow-lg shadow-brand-violet/30"
>
  Get Started
</button>
```

### 4. Card với border gradient

```jsx
<div
  className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl 
                border-2 border-brand-sky/50 
                hover:border-brand-aqua/80 
                hover:shadow-lg hover:shadow-brand-blue/10 
                transition-all duration-300"
>
  {/* Card content */}
</div>
```

### 5. Icon với gradient background

```jsx
<div
  className="bg-gradient-to-br from-brand-sky to-brand-aqua 
                w-16 h-16 rounded-full 
                flex items-center justify-center"
>
  <MapPin className="w-8 h-8 text-brand-blue" />
</div>
```

---

## 📦 Tailwind Configuration

File `tailwind.config.ts` đã được cấu hình sẵn:

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        sky: "#C0D8F4",    // pastel sky
        aqua: "#A9CDEB",   // soft cyan
        indigo: "#CDB8ED", // lavender/indigo
        violet: "#DCBEF2", // pink-purple
        blue: "#6D93E2",   // medium blue (text/gradient)
      },
    },
    backgroundImage: {
      "hero-gradient":
        "linear-gradient(135deg, #C0D8F4 0%, #A9CDEB 25%, #CDB8ED 60%, #DCBEF2 100%)",
    },
  },
}
```

---

## 🎨 CSS Variables (globals.css)

Có sẵn trong `globals.css`:

```css
:root {
  /* Custom Brand Colors - Figma Design */
  --brand-sky: #c0d8f4;
  --brand-aqua: #a9cdeb;
  --brand-indigo: #cdb8ed;
  --brand-violet: #dcbef2;
  --brand-blue: #6d93e2;

  /* Gradient presets */
  --gradient-hero: linear-gradient(
    135deg,
    #c0d8f4 0%,
    #a9cdeb 25%,
    #cdb8ed 60%,
    #dcbef2 100%
  );
}
```

**Utility Classes:**

- `.bg-gradient-hero` - Sử dụng hero gradient
- `.bg-gradient-brand` - Gradient brand thông thường (dùng sky-500, blue-500, violet-500)
- `.bg-gradient-brand-soft` - Gradient nhẹ với opacity

---

## ✨ Best Practices

1. **Ưu tiên sử dụng Tailwind classes** để dễ maintain
2. **Sử dụng CSS variables** khi cần custom phức tạp
3. **Áp dụng backdrop-blur** để tạo hiệu ứng glass morphism
4. **Kết hợp opacity** (`bg-white/80`, `border-brand-sky/50`) để tạo độ sâu
5. **Thêm transitions** để UI mượt mà hơn
6. **Sử dụng shadows** với màu brand để tạo depth

---

## 🔍 So sánh với Figma Export

**Figma Make Export** sử dụng màu đậm hơn:

- Sky 500: `#0ea5e9`
- Blue 500: `#3b82f6`
- Violet 500: `#8b5cf6`

**Custom Design System** (đã áp dụng) sử dụng màu pastel nhẹ hơn:

- Sky: `#C0D8F4` ✅
- Aqua: `#A9CDEB` ✅
- Indigo: `#CDB8ED` ✅
- Violet: `#DCBEF2` ✅
- Blue: `#6D93E2` ✅

→ **Đã đồng bộ và sử dụng bảng màu pastel custom**

---

## 📁 File Structure

```
frontend/
├── tailwind.config.ts          # Tailwind configuration với brand colors
├── src/
│   └── app/
│       ├── globals.css         # CSS variables và utility classes
│       └── landing/
│           └── page.tsx        # Landing page sử dụng design system
└── DESIGN_SYSTEM.md           # Tài liệu này
```

---

## 🚀 Quick Start

```jsx
// Import vào component
import { MapPin, MessageSquare, Users } from "lucide-react";

// Sử dụng
<div className="bg-hero-gradient min-h-screen">
  <h1 className="text-6xl font-bold bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-violet bg-clip-text text-transparent">
    Your Title
  </h1>

  <button className="bg-gradient-to-br from-brand-blue via-brand-indigo to-brand-violet text-white px-8 py-3 rounded-full">
    Click Me
  </button>
</div>;
```

---

**Cập nhật lần cuối:** 15/11/2024
