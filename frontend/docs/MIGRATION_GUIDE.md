# Migration from Figma Design to doantotnghiep

## Summary

Đã đồng bộ design system và cấu trúc từ **Knowledge Sharing Platform UI (Figma Make)** (Vite + React Router) sang **doantotnghiep/frontend** (Next.js).

## Changes Made

### 1. ✅ Dependencies Updated (package.json)

Đã thêm các packages cần thiết:

- **Radix UI components**: Tất cả @radix-ui/react-\* packages
- **Additional libraries**:
  - `class-variance-authority` - Component variants
  - `clsx` - Conditional classes
  - `cmdk` - Command palette
  - `embla-carousel-react` - Carousels
  - `input-otp` - OTP inputs
  - `next-themes` - Theme switching
  - `react-day-picker` - Date picker
  - `react-hook-form` - Form handling
  - `react-resizable-panels` - Resizable panels
  - `recharts` - Charts
  - `sonner` - Toast notifications
  - `tailwind-merge` - Class merging
  - `tailwindcss-animate` - Animations
  - `vaul` - Drawer component

### 2. ✅ Design System (globals.css)

`frontend/src/app/globals.css` đã có sẵn design system với:

- Brand colors (sky, blue, violet palettes)
- Custom CSS variables
- Gradient presets
- Base typography
- Dark mode support

### 3. ✅ UI Components

Tất cả shadcn/ui components đã có trong `frontend/src/components/ui/`:

- accordion, alert-dialog, alert, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card, carousel, chart
- checkbox, collapsible, command, context-menu, dialog, drawer
- dropdown-menu, form, hover-card, input-otp, input, label
- menubar, navigation-menu, pagination, popover, progress
- radio-group, resizable, scroll-area, select, separator
- sheet, sidebar, skeleton, slider, sonner, switch, table
- tabs, textarea, toggle-group, toggle, tooltip
- use-mobile.ts, utils.ts

### 4. ✅ Navigation Component

Đã tạo `frontend/src/components/Navigation.tsx`:

- Converted từ React Router sang Next.js (Link, usePathname)
- Responsive design với mobile menu
- Search bar
- Wallet connection state
- Gradient styling từ design system

### 5. ✅ Documentation

Đã tạo:

**`frontend/DESIGN_SYSTEM.md`**:

- Brand colors và gradients
- Typography system
- Component guidelines
- Layout patterns
- Background patterns
- Animation guidelines
- Responsive breakpoints
- Usage do's and don'ts

**`frontend/src/guidelines/Guidelines.md`**:

- General code guidelines
- Design system usage
- Component documentation
- Responsive design patterns
- Accessibility requirements
- Performance best practices
- File organization
- Testing guidelines

### 6. 📁 New Directory Structure

```
frontend/src/
├── components/
│   ├── ui/              # ✅ Already exists (shadcn/ui components)
│   ├── pages/           # ✅ Created (for page components)
│   ├── figma/           # ✅ Created (for Figma-specific components)
│   └── Navigation.tsx   # ✅ Created
├── guidelines/
│   └── Guidelines.md    # ✅ Created
└── app/                 # ✅ Already exists (Next.js app directory)
```

## Next Steps

### To Fully Complete Migration:

1. **Install Dependencies**:

```bash
cd frontend
npm install
# or
pnpm install
```

2. **Copy Page Components** (if needed):

   - HomePage.tsx
   - FeedsPage.tsx
   - EditorPage.tsx
   - LeaderboardPage.tsx
   - WalletPage.tsx
   - GovernancePage.tsx
   - ProfilePage.tsx
   - ModerationPage.tsx
   - MapPage.tsx
   - LoginPage.tsx
   - SignupPage.tsx

   **Note**: Pages hiện tại trong `frontend/src/app/` có thể được refactor để sử dụng design system mới.

3. **Update Layout.tsx**:

```tsx
import { Navigation } from "@/components/Navigation";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

4. **Convert Existing Pages**:

   - Apply design system styles
   - Use new UI components
   - Follow guidelines from Guidelines.md

5. **Test**:
   - Run dev server: `npm run dev`
   - Check all routes
   - Test responsive design
   - Verify all components work

## Key Differences: Vite vs Next.js

### Routing

- **Vite**: `react-router-dom` with `<Link to="/path">`
- **Next.js**: `next/link` with `<Link href="/path">`

### Client Components

- **Next.js**: Add `'use client'` directive for interactive components

### Navigation Hooks

- **Vite**: `useLocation()`, `useNavigate()`
- **Next.js**: `usePathname()`, `useRouter()`, `useSearchParams()`

### File Structure

- **Vite**: Pages in `src/components/pages/`
- **Next.js**: Pages in `src/app/` directory structure

## Design System Match Status

✅ **Fully Matched**:

- Color palette
- Typography system
- Spacing scale
- Border radius
- Shadows
- Gradients
- CSS variables

✅ **Component Library**:

- All shadcn/ui components present
- Navigation component adapted for Next.js
- Utilities (use-mobile, utils)

📝 **Needs Adaptation**:

- Page components (can be copied and adapted from Figma design)
- Some Figma-specific components (ImageWithFallback, etc.)

## Resources

- Design source: `/Knowledge Sharing Platform UI (Figma Make)/`
- Documentation: `frontend/DESIGN_SYSTEM.md` and `frontend/src/guidelines/Guidelines.md`
- UI Components: `frontend/src/components/ui/`
- Navigation: `frontend/src/components/Navigation.tsx`

## Commands

```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

---

**Status**: ✅ Design system migration complete. Ready for implementation and page adaptation.
