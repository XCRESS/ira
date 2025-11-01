# IRA Platform - UI Rules

> **Context**: Mobile-first PWA for on-site assessors. Design for thumb, not mouse.

---

## Layout (Mobile-First)

### Breakpoint: 768px
```tsx
// Mobile (< 768px): Bottom nav, cards, sheets, p-4, space-y-4
// Desktop (≥ 768px): Sidebar, tables, modals, p-6, space-y-6
```

### Page Structure (Mobile)
```tsx
<div className="flex flex-col h-screen">
  <MobileHeader />
  <main className="flex-1 overflow-y-auto pb-20">
    <div className="p-4 space-y-4">{content}</div>
  </main>
  <MobileTabBar /> {/* 64px fixed bottom */}
</div>
```

### Page Structure (Desktop)
```tsx
<div className="flex h-screen">
  <Sidebar /> {/* 260px fixed */}
  <main className="flex-1 overflow-y-auto">
    <Header /> {/* 64px sticky */}
    <div className="p-6 space-y-6">{content}</div>
  </main>
</div>
```

---

## Navigation

### Mobile: Bottom Tab Bar (4 tabs)
```tsx
// 64px height (56px bar + 8px safe area)
// Always visible, thumb-friendly
[Home] [Leads] [Reviews/Activity] [Profile]

// Active: bg-primary/10 text-primary
// Inactive: text-foreground/60
```

### Desktop: Sidebar
```tsx
// 260px width, sticky left
// Active: bg-primary text-primary-foreground
```

---

## Components

### Cards
```tsx
// Desktop
<div className="glass rounded-2xl p-6">

// Mobile
<div className="glass rounded-xl p-4">

// Compact (stats)
<div className="glass rounded-xl p-4">

// Never nest glass!
```

### Buttons
```tsx
// Primary
className="rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary/90 active:scale-95"

// Secondary
className="rounded-lg border border-foreground/10 px-4 py-2 text-sm hover:bg-foreground/5"

// Mobile: h-12 min (44px touch target)
// Desktop: h-10 min
```

### Forms
```tsx
// Mobile: h-12, text-base, full-width buttons
<input className="h-12 px-4 py-3 text-base rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary" />

// Desktop: h-10, text-sm, inline buttons
<input className="h-10 px-4 py-2 text-sm rounded-lg border border-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary" />
```

### Tables → Cards (Mobile)
```tsx
// Desktop: <table>
// Mobile:
<div className="space-y-3">
  <div className="glass rounded-xl p-4 active:bg-foreground/5">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{title}</h3>
        <p className="text-xs text-foreground/60 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-foreground/30" />
    </div>
  </div>
</div>
```

### Modals → Sheets (Mobile)
```tsx
// Desktop: Centered modal
// Mobile: Bottom sheet
<div className="fixed inset-x-0 bottom-0 glass-strong rounded-t-2xl p-6 max-h-[90vh]">
  <div className="w-12 h-1 bg-foreground/20 rounded-full mx-auto mb-4" />
  {content}
</div>
```

---

## Spacing Scale

```
Mobile:  p-4, space-y-4, gap-4, mt-4
Desktop: p-6, space-y-6, gap-6, mt-6

Only use: 2, 4, 6, 8, 12
```

---

## Typography

```tsx
// Desktop
h1: text-2xl font-bold (NO h1 if breadcrumb exists!)
h2: text-lg font-semibold
h3: text-base font-semibold
body: text-sm
small: text-xs

// Mobile (reduce by one step)
h1: text-xl font-bold
h2: text-base font-semibold
h3: text-sm font-semibold
body: text-sm
small: text-xs
```

---

## Colors (Semantic Only)

```tsx
// ❌ NEVER: bg-blue-500, text-gray-400
// ✅ ALWAYS: bg-primary, text-foreground/60

bg-primary              → Buttons, active states
text-primary            → Links
bg-foreground/5         → Hover states
text-foreground         → Default text
text-foreground/70      → Secondary text
text-foreground/60      → Muted text
border-foreground/10    → Borders

// Status badges
bg-blue-500/10 text-blue-500       → NEW
bg-purple-500/10 text-purple-500   → ASSIGNED
bg-yellow-500/10 text-yellow-500   → IN_REVIEW
bg-green-500/10 text-green-500     → COMPLETED
```

---

## Glass Effect

```tsx
glass         → 65% opacity, 20px blur (default)
glass-strong  → 75% opacity, 24px blur (dropdowns, sheets)
glass-subtle  → 50% opacity, 16px blur (backgrounds)

// NEVER nest glass!
```

---

## Touch Targets (Mobile)

```
Minimum: 44x44px
Buttons: 48px height
Tab bar items: 56px height
List items: 48px height minimum
```

---

## Responsive Patterns

```tsx
// Stats: 1 → 2 → 4
<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">

// Content: Stack → 2-col
<div className="grid gap-6 lg:grid-cols-2">

// Detail: Stack → 2/3 + 1/3
<div className="grid gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">Main</div>
  <div>Sidebar</div>
</div>

// Sidebar: Stack → Fixed
<div className="grid gap-6 lg:grid-cols-[260px_1fr]">
```

---

## Quick Rules

1. **Mobile-first**: Design for mobile, enhance for desktop
2. **No h1 with breadcrumb**: Breadcrumb IS the title
3. **44px touch targets**: Everything tappable on mobile
4. **Semantic colors only**: No raw blue-500, gray-400
5. **Never nest glass**: Use borders for nesting
6. **Spacing scale**: Only 2, 4, 6, 8, 12
7. **Tables → Cards**: On mobile, always
8. **Modals → Sheets**: On mobile, always
9. **active: not hover:**: On mobile for touch feedback
10. **Truncate long text**: Use `truncate` or `line-clamp-2`

---

## Component Checklist

Before committing:
- [ ] Works on mobile (< 768px)
- [ ] Touch targets 44x44px min
- [ ] Semantic colors used
- [ ] Spacing follows scale
- [ ] No nested glass
- [ ] No h1 with breadcrumb
- [ ] Active states for mobile
- [ ] Responsive breakpoints correct

---

## PWA Essentials

```tsx
// Safe area (iOS notch)
<div className="pt-safe pb-safe">

// Offline indicator
{!isOnline && <OfflineBanner />}

// Install prompt
{showInstall && <InstallPrompt />}
```

---

**That's it. Keep it simple. Mobile-first. Touch-friendly. Consistent.**