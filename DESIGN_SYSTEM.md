# IRA Platform - Design System

> **Philosophy**: Consistency, Clarity, Efficiency. Every design decision should serve the user's ability to assess IPO readiness quickly and accurately.

---

## 1. Layout System

### Container Widths
```tsx
// Page container (all dashboard pages)
<div className="p-6">           // Standard page padding
  {/* Breadcrumbs */}
  <Breadcrumbs items={[...]} />

  {/* Page header - IF NEEDED (see Typography below) */}
  <div className="mt-6">
    <h1>Page Title</h1>
  </div>

  {/* Content */}
  <div className="mt-6 space-y-6">
    {/* Cards and content */}
  </div>
</div>
```

### Spacing Scale
```
space-y-2  → Tight (form fields, list items)
space-y-4  → Medium (card internal sections)
space-y-6  → Standard (page sections, card grid)
space-y-8  → Large (major page divisions)
space-y-12 → XLarge (rare, only for major separations)
```

**Rule**: Use `space-y-6` as default for page-level sections. Only deviate with reason.

### Grid Systems

#### Stats Cards (Dashboard, Leads)
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Always 4 columns on desktop */}
</div>
```

#### Two-Column Layout (Detail pages)
```tsx
<div className="grid gap-6 lg:grid-cols-3">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

#### Settings/Sidebar Layout
```tsx
<div className="grid gap-6 lg:grid-cols-[260px_1fr]">
  <nav>{/* Fixed width sidebar */}</nav>
  <div>{/* Flexible content */}</div>
</div>
```

---

## 2. Typography System

### Hierarchy Rules

```tsx
// ❌ DON'T: Redundant page title when breadcrumb exists
<Breadcrumbs items={[{ label: "Leads" }]} />
<h1 className="text-2xl font-bold">Leads</h1>  // REMOVE THIS

// ✅ DO: Let breadcrumb serve as page title
<Breadcrumbs items={[{ label: "Leads" }]} />
<div className="mt-6">
  {/* Optional: Action buttons or filters */}
</div>
```

### Heading Scale
```tsx
// H1 - Only use when NO breadcrumb exists (e.g., welcome messages)
className="text-2xl font-bold"

// H2 - Section headings within page
className="text-lg font-semibold"

// H3 - Sub-section headings
className="text-base font-semibold"

// Body text
className="text-sm"           // Standard
className="text-sm text-foreground/70"  // Muted/secondary

// Small text
className="text-xs"           // Labels, metadata
className="text-xs text-foreground/60"  // Muted labels
```

### Font Weight
```
font-bold      → Only for H1
font-semibold  → H2, H3, important labels
font-medium    → Navigation items, buttons, data values
font-normal    → Default (don't specify)
```

---

## 3. Card & Surface System

### Glass Cards (Primary Pattern)

```tsx
// Standard card - most common
<div className="glass rounded-2xl p-6">
  <h2 className="mb-4 text-lg font-semibold">Section Title</h2>
  {/* Content */}
</div>

// Card with more padding (settings, forms)
<div className="glass rounded-2xl p-8">
  {/* Content */}
</div>

// Stats card (compact)
<div className="glass rounded-xl p-4">
  <p className="text-sm text-foreground/70">Label</p>
  <p className="mt-2 text-2xl font-bold">Value</p>
</div>
```

### Card Padding Rules
```
p-4  → Stats cards, compact info cards
p-6  → Standard cards (default)
p-8  → Forms, settings, content with lots of whitespace
```

### Glass Variants
```tsx
glass         → Standard (65% opacity, 20px blur) - DEFAULT
glass-strong  → Dropdowns, modals (75% opacity, 24px blur)
glass-subtle  → Backgrounds, overlays (50% opacity, 16px blur)
```

### When NOT to use glass
```tsx
// ❌ Don't nest glass inside glass
<div className="glass">
  <div className="glass">  // WRONG
  </div>
</div>

// ✅ Use subtle borders/backgrounds for nested sections
<div className="glass rounded-2xl p-6">
  <div className="rounded-lg border border-foreground/10 bg-foreground/2 p-4">
    {/* Nested content */}
  </div>
</div>
```

---

## 4. Color System

### Semantic Colors (Use these, NOT raw colors)

```tsx
// Backgrounds
bg-background       → Page background
bg-card             → Solid card background (rare)
bg-foreground/5     → Subtle hover states
bg-foreground/2     → Nested section backgrounds

// Text
text-foreground           → Primary text (default)
text-foreground/70        → Secondary text
text-foreground/60        → Muted text
text-foreground/50        → Disabled text

// Interactive
bg-primary               → Primary buttons, active states
text-primary             → Links, interactive text
hover:bg-primary/90      → Primary button hover

// Status Colors
bg-success / text-success   → Positive, completed
bg-warning / text-warning   → Caution, pending
bg-danger / text-danger     → Error, critical

// Borders
border-foreground/10     → Standard borders
border-foreground/5      → Subtle dividers
border-primary/20        → Accented borders
```

### Status Badge Colors (Consistent!)
```tsx
// Lead statuses
NEW              → bg-blue-500/10 text-blue-500
ASSIGNED         → bg-purple-500/10 text-purple-500
IN_REVIEW        → bg-yellow-500/10 text-yellow-500
PAYMENT_PENDING  → bg-orange-500/10 text-orange-500
COMPLETED        → bg-green-500/10 text-green-500

// Pattern: Always {color}-500/10 background, {color}-500 text
<span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-500">
  Completed
</span>
```

---

## 5. Component Patterns

### Buttons

```tsx
// Primary action (destructive, important)
<button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
  Create Lead
</button>

// Secondary action
<button className="rounded-lg border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5">
  Cancel
</button>

// Ghost button (subtle)
<button className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-foreground/5">
  View Details
</button>

// Icon button
<button className="rounded-lg p-2 hover:bg-foreground/5">
  <Icon className="h-4 w-4" />
</button>
```

### Form Inputs

```tsx
// Standard input
<input
  type="text"
  className="w-full rounded-lg border border-foreground/10 bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
/>

// Select
<select className="w-full rounded-lg border border-foreground/10 bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
  <option>Option</option>
</select>

// Textarea
<textarea
  rows={4}
  className="w-full rounded-lg border border-foreground/10 bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
/>
```

### Tables

```tsx
<div className="glass overflow-hidden rounded-2xl">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="border-b border-foreground/10">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-foreground/70">
            Column
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-foreground/5">
        <tr className="cursor-pointer hover:bg-foreground/5 transition-colors">
          <td className="px-6 py-4 text-sm">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Empty States

```tsx
<div className="py-12 text-center">
  <Icon className="mx-auto h-12 w-12 text-foreground/20" />
  <p className="mt-4 text-sm font-medium text-foreground">No items found</p>
  <p className="mt-1 text-sm text-foreground/60">
    Get started by creating your first item
  </p>
  {/* Optional action button */}
</div>
```

---

## 6. Interactive States

### Hover States
```tsx
// Cards
className="hover:bg-foreground/5 transition-colors"

// Buttons
className="hover:bg-primary/90"         // Primary
className="hover:bg-foreground/5"       // Secondary/Ghost

// Links
className="hover:text-primary/80"
```

### Focus States (Forms)
```tsx
focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
```

### Active States (Navigation)
```tsx
// Sidebar navigation
{isActive
  ? "bg-primary text-primary-foreground"
  : "hover:bg-foreground/5"
}
```

### Disabled States
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

---

## 7. Animation & Transitions

### Standard Transitions
```tsx
transition-colors  → Default for hover states
transition-all     → When multiple properties change
transition-opacity → Fades
```

### Duration (use defaults, rarely specify)
```tsx
duration-200  → Fast (hover)
duration-300  → Standard (default)
duration-500  → Slow (major transitions)
```

---

## 8. Responsive Design

### Breakpoint Strategy
```tsx
// Mobile first approach
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  // 1 col mobile, 2 cols tablet, 4 cols desktop
</div>

// Hide on mobile, show on desktop
<div className="hidden sm:block">Desktop only</div>

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">
```

### Common Patterns
```tsx
// Stats grid: 1 → 2 → 4
sm:grid-cols-2 lg:grid-cols-4

// Two column: Stack → Side-by-side
lg:grid-cols-2

// Sidebar layout: Stack → Fixed sidebar
lg:grid-cols-[260px_1fr]

// Three column: Stack → 2/3 + 1/3
lg:grid-cols-3
lg:col-span-2  // For main content
```

---

## 9. Icon Usage

### Size Guidelines
```tsx
h-4 w-4   → Inline with text (buttons, links)
h-5 w-5   → Section icons, navigation
h-6 w-6   → Larger buttons, standalone
h-12 w-12 → Empty states, illustrations
```

### Color Guidelines
```tsx
// Match text color (default)
<Icon className="h-4 w-4" />

// Muted icons
<Icon className="h-4 w-4 text-foreground/50" />

// Status colors
<Icon className="h-5 w-5 text-success" />
```

---

## 10. Accessibility Rules

### Focus Indicators
✅ Always include focus states on interactive elements
✅ Use `focus:outline-none` ONLY if you provide alternative focus indicator

### Color Contrast
✅ Text must meet WCAG AA standards
✅ `text-foreground/60` is minimum for body text
✅ `text-foreground/50` only for disabled states

### Semantic HTML
✅ Use `<button>` for actions, `<a>` for navigation
✅ Use proper heading hierarchy (h1 → h2 → h3)
✅ Tables must have `<thead>` and `<tbody>`

---

## 11. Common Anti-Patterns to Avoid

### ❌ Don't Do This:

```tsx
// 1. Inconsistent spacing
<div className="space-y-3">  // Use 2, 4, 6, 8 only
<div className="p-5">        // Use 4, 6, 8 only

// 2. Redundant headings
<Breadcrumbs items={[{ label: "Settings" }]} />
<h1>Settings</h1>  // Already in breadcrumb!

// 3. Raw colors instead of semantic
<div className="bg-blue-500">  // Use bg-primary
<p className="text-gray-400">  // Use text-foreground/60

// 4. Nested glass effects
<div className="glass">
  <div className="glass">  // Never nest glass!
  </div>
</div>

// 5. Inconsistent button styles
<button className="bg-blue-600 px-3 py-1.5">  // Use design system!

// 6. Magic numbers
<div className="mt-7">  // Use scale: 2, 4, 6, 8, 12
<div className="p-5">   // Use scale: 4, 6, 8
```

### ✅ Do This Instead:

```tsx
// 1. Follow spacing scale
<div className="space-y-6">
<div className="p-6">

// 2. Trust breadcrumbs as page title
<Breadcrumbs items={[{ label: "Settings" }]} />
{/* No h1 needed */}

// 3. Use semantic colors
<div className="bg-primary">
<p className="text-foreground/60">

// 4. Use borders for nesting
<div className="glass">
  <div className="border border-foreground/10">
  </div>
</div>

// 5. Use component patterns
<button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary/90">

// 6. Use spacing scale
<div className="mt-6">
<div className="p-6">
```

---

## 12. Page Templates

### List Page (Leads, Assessments)
```tsx
export default async function ListPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Items" }]} />

      {/* Header with actions */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <button className="...">New Item</button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards */}
      </div>

      {/* Main content */}
      <div className="mt-6 glass rounded-2xl overflow-hidden">
        {/* Table or grid */}
      </div>
    </div>
  )
}
```

### Detail Page (Lead Detail)
```tsx
export default async function DetailPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[
        { label: "Items", href: "/items" },
        { label: "Item Name" }
      ]} />

      {/* Header with status */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Item Name</h1>
        <span className="...">Status</span>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Main content cards */}
        </div>
        <div className="space-y-6">
          {/* Sidebar cards */}
        </div>
      </div>
    </div>
  )
}
```

### Settings Page
```tsx
export default function SettingsPage() {
  return (
    <div className="p-6">
      <Breadcrumbs items={[{ label: "Settings" }]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="glass rounded-2xl p-3">
          {/* Navigation items */}
        </nav>
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-6 text-lg font-semibold">Section</h2>
          {/* Settings content */}
        </div>
      </div>
    </div>
  )
}
```

---

## 13. Review Checklist

Before committing any UI component, check:

- [ ] Spacing follows scale (2, 4, 6, 8, 12)
- [ ] Card padding is 4, 6, or 8
- [ ] Typography uses correct hierarchy
- [ ] Colors are semantic, not raw
- [ ] Hover states are present
- [ ] Focus states are visible
- [ ] Responsive breakpoints are appropriate
- [ ] Icons are sized correctly
- [ ] No nested glass effects
- [ ] No redundant headings with breadcrumbs
- [ ] Consistent with similar components in codebase

---

## 14. Component Library Roadmap

**Phase 1 (Immediate)**: Document and standardize
- ✅ Design system documentation (this file)
- ⏳ Audit existing components for compliance
- ⏳ Refactor non-compliant pages

**Phase 2 (Future)**: Create reusable components
- Create `<Card>` component with variants
- Create `<Button>` component with variants
- Create `<Badge>` component for status
- Create `<FormInput>` components
- Create `<EmptyState>` component
- Create `<PageHeader>` component

**Phase 3 (Later)**: Advanced patterns
- Create form builder
- Create table component
- Create modal/dialog system
- Create toast notifications

---

## Questions?

When in doubt:
1. Check this document first
2. Look at similar patterns in the codebase
3. Favor consistency over creativity
4. Keep it simple and accessible

**Remember**: A design system is a living document. Update this file as patterns evolve!