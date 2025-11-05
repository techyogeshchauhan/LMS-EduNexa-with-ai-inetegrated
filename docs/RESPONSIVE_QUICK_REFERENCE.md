# 📱 Responsive Design Quick Reference Card

## Breakpoints Cheat Sheet

```
xs:  475px  →  Extra small phones
sm:  640px  →  Mobile landscape
md:  768px  →  Tablets
lg:  1024px →  Laptops
xl:  1280px →  Desktops
2xl: 1536px →  Large screens
```

## Common Patterns

### 1. Padding/Margin
```tsx
p-3 sm:p-4 md:p-6 lg:p-8
m-2 sm:m-3 md:m-4 lg:m-6
gap-2 sm:gap-4 md:gap-6
```

### 2. Grid Layouts
```tsx
// 1 → 2 → 3 → 4 columns
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

// 2 → 4 columns (stats)
grid grid-cols-2 lg:grid-cols-4

// 1 → 2 columns (forms)
grid grid-cols-1 md:grid-cols-2
```

### 3. Flex Direction
```tsx
// Stack on mobile, row on tablet+
flex flex-col sm:flex-row

// Reverse on mobile
flex flex-col-reverse sm:flex-row
```

### 4. Text Sizing
```tsx
text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl
text-sm sm:text-base md:text-lg
text-base sm:text-lg md:text-xl
```

### 5. Icon Sizing
```tsx
h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6
h-3 w-3 sm:h-4 sm:w-4
```

### 6. Button Sizing
```tsx
px-3 py-1.5 sm:px-4 sm:py-2
px-2 sm:px-3 py-1 sm:py-1.5
```

### 7. Visibility
```tsx
hidden md:block          // Hide mobile, show desktop
block md:hidden          // Show mobile, hide desktop
hidden xs:inline         // Hide < 475px
hidden sm:block          // Hide < 640px
```

### 8. Width
```tsx
w-full sm:w-auto         // Full width mobile, auto tablet+
w-full md:w-1/2          // Full mobile, half tablet+
max-w-full               // Never overflow
```

## Component Patterns

### Card
```tsx
<div className="bg-white rounded-lg sm:rounded-xl border p-4 sm:p-6">
  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
    Title
  </h3>
  <p className="text-sm sm:text-base text-gray-600">
    Content
  </p>
</div>
```

### Button
```tsx
<button className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg">
  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
  <span className="hidden sm:inline">Label</span>
</button>
```

### Modal
```tsx
<div className="fixed inset-0 p-3 sm:p-4">
  <div className="bg-white rounded-lg max-w-2xl w-full">
    <div className="p-4 sm:p-6">
      Content
    </div>
  </div>
</div>
```

### Form
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
  <input className="px-3 py-2 text-sm sm:text-base" />
</div>
```

### Navigation
```tsx
<nav className="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-4">
  <button className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
    Tab
  </button>
</nav>
```

## Utility Classes

### Custom Classes (in index.css)
```css
.scrollbar-hide      /* Hide scrollbar */
.line-clamp-1        /* Truncate to 1 line */
.line-clamp-2        /* Truncate to 2 lines */
.line-clamp-3        /* Truncate to 3 lines */
.tap-target          /* Min 44x44px */
```

### Usage
```tsx
<div className="overflow-x-auto scrollbar-hide">
  Horizontal scroll without scrollbar
</div>

<p className="line-clamp-2">
  Long text that will be truncated to 2 lines...
</p>
```

## Testing Commands

```bash
# Start dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## Browser DevTools

```
Open DevTools:     F12 or Ctrl+Shift+I
Responsive Mode:   Ctrl+Shift+M
Console:           Ctrl+Shift+J
```

## Quick Checks

### Mobile (< 640px)
- [ ] Sidebar slides in
- [ ] Hamburger menu works
- [ ] No horizontal scroll
- [ ] Touch targets 44px+
- [ ] Text readable (14px+)

### Tablet (640px - 1024px)
- [ ] 2-3 column grids
- [ ] Sidebar collapsible
- [ ] Proper spacing

### Desktop (> 1024px)
- [ ] 3-4 column grids
- [ ] Sidebar visible
- [ ] All features work

## Common Fixes

### Horizontal Scroll
```tsx
// Add to container
className="max-w-full overflow-x-hidden"
```

### Text Overflow
```tsx
// Add to text element
className="truncate"           // Single line
className="line-clamp-2"       // Multiple lines
```

### Small Touch Targets
```tsx
// Increase padding
className="p-3"                // 12px = 44px with content
className="min-w-[44px] min-h-[44px]"  // Force minimum
```

### Image Responsive
```tsx
<img 
  className="w-full h-auto object-cover"
  alt="Description"
/>
```

## Performance Tips

1. Use `lazy loading` for images
2. Minimize bundle size
3. Use CSS containment
4. Debounce resize events
5. Hardware-accelerated animations

## Accessibility

```tsx
// Touch targets
min-w-[44px] min-h-[44px]

// Font size
text-sm sm:text-base  // Min 14px

// Focus states
focus:ring-2 focus:ring-blue-500

// ARIA labels
aria-label="Description"
```

## Mobile-Specific

### Prevent Zoom on Input
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
```

### Touch Scrolling
```css
-webkit-overflow-scrolling: touch;
```

### Tap Highlight
```css
-webkit-tap-highlight-color: transparent;
```

## Debug Tips

### Check Viewport
```javascript
console.log(window.innerWidth, window.innerHeight);
```

### Check Breakpoint
```javascript
// In component
const isMobile = window.innerWidth < 640;
const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
const isDesktop = window.innerWidth >= 1024;
```

### Find Overflow
```javascript
// In console
document.querySelectorAll('*').forEach(el => {
  if (el.scrollWidth > el.clientWidth) {
    console.log('Overflow:', el);
  }
});
```

## Resources

- [Tailwind Docs](https://tailwindcss.com/docs)
- [MDN Responsive](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Mobile](https://web.dev/mobile/)

## Print This!

```
┌─────────────────────────────────────┐
│  BREAKPOINTS                        │
├─────────────────────────────────────┤
│  xs:  475px  Extra small            │
│  sm:  640px  Mobile landscape       │
│  md:  768px  Tablets                │
│  lg:  1024px Laptops                │
│  xl:  1280px Desktops               │
│  2xl: 1536px Large screens          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  COMMON PATTERNS                    │
├─────────────────────────────────────┤
│  Padding:  p-3 sm:p-4 md:p-6       │
│  Grid:     grid-cols-1 sm:grid-    │
│            cols-2 lg:grid-cols-3    │
│  Flex:     flex flex-col sm:flex-  │
│            row                       │
│  Text:     text-sm sm:text-base    │
│  Hide:     hidden md:block          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  TESTING                            │
├─────────────────────────────────────┤
│  DevTools:  F12                     │
│  Responsive: Ctrl+Shift+M           │
│  Test:      375px, 768px, 1280px   │
└─────────────────────────────────────┘
```

---

**Keep this handy while coding!** 📌
