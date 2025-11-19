# SCSS Architecture

Dự án này sử dụng SCSS để tạo các styles tái sử dụng và maintainable cho các components.

## 📁 Structure

```
src/components/
├── Map/
│   └── map.scss          # Map component styles
└── social/
    └── social.scss       # Social media component styles
```

## 🎨 Map Styles (`map.scss`)

### Variables

- `$map-border-radius`: 8px - Border radius cho các elements
- `$map-shadow-light`: Box shadow nhẹ
- `$map-shadow-heavy`: Box shadow đậm
- `$map-transition`: Transition duration
- Colors: `$map-bg-light`, `$map-bg-dark`, etc.

### Mixins

- `@mixin map-card`: Style cho cards/containers
- `@mixin map-button`: Style cho buttons
- `@mixin map-popup`: Style cho popups

### Classes

- `.map-container`: Main map container
- `.map-controls`: Control buttons container
- `.map-marker`: Marker styling với hover effects
- `.map-popup-content`: Popup content styling

### MapBox GL Overrides

- `.mapboxgl-popup-content`: Custom popup styling
- `.mapboxgl-ctrl-group`: Control group styling
- `.mapboxgl-ctrl button`: Button styling

---

## 👥 Social Styles (`social.scss`)

### Variables

- `$social-primary`: #3b82f6 - Primary blue color
- `$social-border-radius`: 8px - Standard border radius
- `$social-shadow`: Box shadow cho cards
- Colors: `$social-bg-primary`, `$social-text-primary`, etc.

### Mixins

- `@mixin social-card`: Reusable card styling
- `@mixin social-button($variant)`: Button variants (primary/secondary)
- `@mixin social-input`: Form input styling
- `@mixin social-avatar($size)`: Avatar với responsive sizing

### Component Classes

#### Header

- `.social-header`: Main header styling
- `.header-nav`: Navigation styling
- `.header-search`: Search bar styling

#### Sidebar

- `.social-sidebar`: Left sidebar container
- `.sidebar-nav`: Navigation menu
- `.nav-item`: Individual menu items

#### Posts

- `.social-post`: Individual post container
- `.post-header`: Post author info
- `.post-content`: Post text/media content
- `.post-actions`: Like/comment/share buttons

#### Create Post

- `.create-post`: Create post form container
- `.create-form`: Form layout
- `.create-actions`: Action buttons

#### Trending

- `.trending-sidebar`: Right sidebar
- `.trending-section`: Individual trending sections
- `.suggested-user`: User suggestion items

---

## 📱 Responsive Design

Cả hai files đều có responsive breakpoints:

### Mobile (`@media (max-width: 768px)`)

- Reduced padding/margins
- Smaller font sizes
- Adjusted spacing
- Hidden elements trên mobile

### Tablet (`@media (max-width: 1024px)`)

- Hidden sidebars
- Full width main content
- Adjusted navigation

---

## 🎯 Benefits của SCSS Architecture

### 1. **Reusability**

```scss
// Thay vì repeat code
.button-primary { background: #3b82f6; padding: 8px 16px; }
.submit-btn { background: #3b82f6; padding: 8px 16px; }

// Sử dụng mixin
@mixin social-button($variant: 'primary') { ... }
.button-primary { @include social-button('primary'); }
.submit-btn { @include social-button('primary'); }
```

### 2. **Maintainability**

```scss
// Thay đổi 1 biến affect toàn bộ
$social-primary: #3b82f6; // Change này sẽ update tất cả
```

### 3. **Consistency**

- Unified color palette
- Consistent spacing/sizing
- Standardized transitions/animations

### 4. **Organization**

- Logical grouping theo components
- Clear separation of concerns
- Easy to find and modify styles

---

## 🔧 Usage

### Import trong Components

```tsx
// Map components
import "./map.scss";

// Social components
import "./social.scss";
```

### Applying Classes

```tsx
// Combine SCSS classes với Tailwind
<div className="social-post bg-white rounded-lg">
  <div className="post-header">
    <div className="author-avatar">...</div>
  </div>
</div>
```

---

## 🚀 Future Enhancements

1. **CSS Custom Properties**: Thêm CSS variables cho theming
2. **Dark Mode**: Extend dark mode support
3. **Animation Library**: Thêm advanced animations
4. **Component Variants**: Thêm nhiều button/card variants
5. **Utility Classes**: Tạo utility classes như Tailwind

---

## 💡 Best Practices

1. **Use Variables**: Cho colors, spacing, durations
2. **Mixins for Patterns**: Repeated styling patterns
3. **Semantic Naming**: `.social-post` thay vì `.blue-card`
4. **Mobile First**: Design mobile trước, desktop sau
5. **Performance**: Avoid deep nesting (max 3 levels)
