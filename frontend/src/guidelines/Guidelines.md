# Knowledge Sharing Platform - Design Guidelines

## General Guidelines

### Code Quality

- Keep components small and focused on a single responsibility
- Use TypeScript for type safety
- Refactor code as you go to keep it clean
- Put helper functions and reusable components in separate files
- Use meaningful variable and function names

### Responsive Design

- Mobile-first approach - design for mobile, then enhance for desktop
- Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- Test on multiple screen sizes
- Only use absolute positioning when necessary
- Prefer flexbox and grid for layouts

### Performance

- Lazy load images and heavy components
- Use Next.js Image component for optimized images
- Minimize bundle size by importing only what you need
- Use React.memo() for expensive components
- Avoid unnecessary re-renders

## Design System Guidelines

### Color Usage

#### Primary Actions

- Use gradient backgrounds: `bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600`
- This is for: "Connect Wallet", "Get Started", "Publish Post", main CTAs

#### Secondary Actions

- Use outlined style: `border-sky-300 text-sky-700 hover:bg-sky-50`
- This is for: "Sign Up", "Follow", alternative actions

#### Neutral Actions

- Use ghost or outline variant with neutral colors
- This is for: "Cancel", "Close", tertiary actions

### Typography

#### Headings

- H1: Use for page titles only, one per page
- H2: Use for major section headings
- H3: Use for subsection headings
- H4: Use for card titles or small sections
- Apply gradient text for hero titles: `bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 bg-clip-text text-transparent`

#### Body Text

- Use `text-neutral-700` for primary body text
- Use `text-neutral-600` for secondary text
- Use `text-neutral-500` for metadata (timestamps, counts)
- Never use pure black (#000)

### Spacing

#### Section Spacing

- Large sections: `py-20` (hero, landing sections)
- Medium sections: `py-8` (main content areas)
- Small sections: `py-4` (cards, smaller containers)

#### Element Spacing

- Related elements: `gap-2` or `gap-3`
- Separate elements: `gap-4` or `gap-6`
- Major separations: `gap-8`

#### Container Padding

- Cards: `p-4` or `p-6`
- Dialogs: `p-6`
- Mobile: Reduce padding by one size on small screens

### Components

#### Button Component

**Variants:**

- **Primary**: Main action, gradient background

  - Usage: One per screen section for the main action
  - Size: Default or `size="lg"` for hero sections
  - Example: "Connect Wallet", "Publish Post"

- **Secondary**: Supporting action, outlined style

  - Usage: Alongside primary or as main action in neutral contexts
  - Border: `border-sky-300`
  - Example: "Sign Up", "Follow User"

- **Ghost**: Minimal action, transparent background
  - Usage: Navigation items, icon buttons, cancel actions
  - Example: "Login", "Cancel", toolbar buttons

**Sizes:**

- `size="sm"` - For compact spaces, navigation
- Default - For most use cases
- `size="lg"` - For hero sections, important CTAs

**Icons:**

- Place icons before text with `mr-2`
- Use 16px icons (`w-4 h-4`) for small buttons
- Use 20px icons (`w-5 h-5`) for default buttons

#### Card Component

**Structure:**

```tsx
<Card
  className="bg-white/80 backdrop-blur-sm border-neutral-200/50 p-6 
                 shadow-lg shadow-violet-500/5 hover:border-sky-300 
                 transition-colors"
>
  {/* Content */}
</Card>
```

**Usage:**

- For content containers on social feeds
- For sidebar widgets
- For settings panels
- Always include backdrop blur for overlay effect
- Use hover states to indicate interactivity

#### Badge Component

**Tier Badges:**

- Platinum: Most prestigious tier
  - Style: `bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 text-white`
- Gold: High-tier users
  - Style: `bg-gradient-to-r from-blue-500 to-violet-500 text-white`
- Silver: Mid-tier users
  - Style: `bg-gradient-to-r from-sky-400 to-blue-400 text-white`

**Category Badges:**

- Use outline variant: `variant="outline"`
- Border color: `border-sky-300`
- Text color: `text-sky-700`

#### Avatar Component

**Sizes:**

- Small: `w-8 h-8` - For comments, small lists
- Medium: `w-10 h-10` - For posts, navigation
- Large: `w-12 h-12` or larger - For profile headers

**Fallback:**

- Use gradient background: `bg-gradient-to-br from-sky-400 to-blue-600`
- White text for contrast
- Show user initials (2 characters max)

#### Navigation Component

**Desktop:**

- Sticky top with backdrop blur
- Logo always visible on left
- Main nav links in center
- Search bar in middle-right
- Action buttons on right
- Max width: 7xl with horizontal padding

**Mobile:**

- Hamburger menu button
- Full-screen dropdown menu
- Logo and menu button only visible
- Search bar hidden or in menu

**Active State:**

- Background: `bg-gradient-to-br from-sky-50 to-blue-50`
- Text: `text-sky-700`
- Font weight: `font-medium`

### Backgrounds

#### Page Backgrounds

**Main Content Pages:**

```tsx
<div className="min-h-screen bg-white relative overflow-hidden">
  {/* Gradient layer */}
  <div className="absolute inset-0 bg-gradient-to-br from-sky-200/30 via-blue-200/30 to-violet-300/30"></div>

  {/* White overlay for softening */}
  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent"></div>

  {/* Content */}
  <div className="relative">{/* Your content here */}</div>
</div>
```

**Landing Page:**
Use sophisticated diagonal gradient with blur effects (see DESIGN_SYSTEM.md)

#### Blur Effects

**When to Use:**

- Cards over gradient backgrounds: `backdrop-blur-sm`
- Modals/dialogs: `backdrop-blur-md`
- Navigation: `backdrop-blur`
- Popovers: `backdrop-blur-sm`

**Don't:**

- Stack multiple backdrop blurs (performance)
- Use with solid backgrounds (no effect)

### Forms

#### Input Fields

**Structure:**

```tsx
<Input
  placeholder="..."
  className="bg-neutral-50 border-neutral-200 focus:border-sky-400"
/>
```

**Labels:**

- Always include labels for accessibility
- Style: `text-sm text-neutral-700 mb-2`
- Use `htmlFor` to link to input

**Validation:**

- Show errors below field in red text
- Add red border to invalid fields
- Use form libraries like react-hook-form

#### Text Areas

- Same styling as inputs
- Set reasonable min-height: `min-h-[120px]`
- Disable resize: `resize-none`
- Show character count if there's a limit

#### Select/Dropdown

- Use Radix UI Select component from ui/select.tsx
- Match input styling
- Show clear visual indication of selected state

### Icons

#### Guidelines

- Use Lucide React icons exclusively for consistency
- Standard size: `w-4 h-4` or `w-5 h-5`
- Match text color or use brand colors
- Add hover effects for interactive icons
- Include proper spacing with text (`mr-2`, `ml-2`)

#### Common Icons

- **Search**: Search bars
- **MapPin**: Location features
- **Wallet**: Web3 wallet actions
- **Heart**: Likes/favorites
- **MessageSquare**: Comments
- **Share2**: Sharing actions
- **Bookmark**: Saved content
- **TrendingUp**: Analytics, trending
- **Users**: Community features
- **Sparkles**: New/featured content

### Animations

#### Hover Effects

**Buttons:**

```tsx
className="transition-all duration-300 hover:scale-[1.02]
           hover:shadow-xl"
```

**Cards:**

```tsx
className = "transition-colors hover:border-sky-300";
```

**Icons:**

```tsx
className = "transition-colors hover:text-sky-600";
```

#### Loading States

- Use skeleton components from ui/skeleton.tsx
- Show placeholders that match final content shape
- Animate with pulse: `animate-pulse`

#### Transitions

- Default duration: 300ms
- Easing: Use defaults or `ease-in-out`
- Don't animate on initial page load
- Use for hover states, state changes, reveals

### Responsive Breakpoints

#### Mobile (< 768px)

- Single column layout
- Hamburger navigation
- Stack elements vertically
- Hide less important sidebar content
- Increase touch target sizes (min 44px)

#### Tablet (768px - 1024px)

- Show simplified navigation
- Two-column layouts where appropriate
- Show condensed sidebar content

#### Desktop (> 1024px)

- Three-column layouts (sidebar-main-sidebar)
- Full navigation
- Hover states enabled
- Show all features

### Accessibility

#### Required

- All interactive elements keyboard accessible
- Proper semantic HTML (nav, main, article, aside)
- Alt text for all images
- Proper heading hierarchy
- ARIA labels where needed
- Focus visible styles
- Sufficient color contrast

#### Forms

- Associate labels with inputs
- Show validation errors clearly
- Support keyboard navigation
- Provide helpful error messages

### Performance Best Practices

#### Images

- Use Next.js Image component
- Provide appropriate sizes
- Use WebP format when possible
- Lazy load images below fold

#### Code Splitting

- Use dynamic imports for heavy components
- Split routes appropriately
- Lazy load modals and dialogs

#### CSS

- Use Tailwind utilities, avoid custom CSS
- Purge unused CSS in production
- Minimize use of backdrop-filter (heavy)

## File Organization

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── auth/              # Authentication pages
│   ├── social/            # Social feature pages
│   └── map/               # Map feature pages
├── components/
│   ├── ui/                # Shadcn/UI components
│   ├── pages/             # Page-specific components
│   ├── figma/             # Figma-specific components
│   └── Navigation.tsx     # Main navigation
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── services/              # API services
└── guidelines/            # This file and design docs
```

## Testing Guidelines

### Unit Tests

- Test business logic and utility functions
- Test custom hooks
- Mock external dependencies

### Component Tests

- Test user interactions
- Test different states (loading, error, success)
- Test accessibility

### E2E Tests

- Test critical user journeys
- Test form submissions
- Test navigation flows

## Documentation

### Component Documentation

- Document props with TypeScript
- Add JSDoc comments for complex logic
- Include usage examples
- Note any dependencies or requirements

### Code Comments

- Explain "why", not "what"
- Document complex algorithms
- Note any workarounds or hacks
- Keep comments up to date with code

## Review Checklist

Before committing:

- [ ] Code follows naming conventions
- [ ] Components are properly typed
- [ ] Responsive design tested
- [ ] Accessibility checked
- [ ] No console errors or warnings
- [ ] Proper error handling
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Changes are documented if needed
