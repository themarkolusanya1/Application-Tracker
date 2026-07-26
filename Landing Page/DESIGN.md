---
name: Vanguard Kinetic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464554'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#712ae2'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a4cfc'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-padding: 120px
---

## Brand & Style

The design system embodies "Vanguard Kinetic"—a premium, high-energy aesthetic tailored for ambitious career-movers and students. The interface is designed to evoke a sense of momentum, precision, and futuristic capability.

Drawing from **Glassmorphism** and **Modern Corporate** styles, the UI utilizes translucent surfaces to create depth without clutter. The atmosphere is aspirational yet grounded in reliability, ensuring that while the visuals feel cutting-edge, the data feels secure and organized. High-energy elements like vibrant gradients and kinetic hover states keep the user engaged during the often-stressful process of application tracking.

## Colors

The palette is anchored by **Electric Indigo**, a color that bridges the gap between professional stability and digital energy. 

- **Primary (Electric Indigo):** Used for primary actions, active navigation states, and brand-defining accents.
- **Secondary (Cyan):** Applied to success states, supplemental data visualizations, and highlighting key progress metrics.
- **Tertiary (Deep Violet):** Used for "power" features, dark-mode-lite backgrounds, and depth-inducing gradients.
- **Neutral:** A range of cool grays (Slate) provides a clean, breathable canvas that allows the glassmorphic effects to pop against a white-to-slate-50 background.

## Typography

This design system uses a high-contrast typographic pairing to balance energy with legibility.

**Montserrat** is the display powerhouse. It should be used for headlines and hero statements. Its geometric construction feels architectural and modern. Tighten the letter spacing on larger sizes to maintain a "kinetic" and premium feel.

**Hanken Grotesk** serves as the primary workhorse for body text, data entry, and labels. It offers a cleaner, more technical profile than Montserrat, ensuring that complex application data remains highly readable. Use medium weights for sub-headers within cards and bold weights for status labels.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. 

Inspired by the dashboard structure in the reference imagery, the landing page uses a "Product Frame" layout for showcase sections—mimicking a software interface even within a marketing context. 
- **Hero & Features:** Use wide margins and generous vertical padding (120px+) to allow the glassmorphic elements room to breathe.
- **Dashboard Showcase:** Elements should be arranged in a three-column "Kanban" or "Card Grid" style (as seen in Image 2), using 24px gutters to maintain clear separation of data points.
- **Photography:** Feature photography (styled after Image 7) should be integrated using organic, slightly offset frames or full-bleed sections with primary color overlays.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Ambient Shadows**.

- **Level 1 (Surface):** The base background is a subtle gradient from `#FFFFFF` to `#F8FAF8`.
- **Level 2 (Translucent Cards):** Glassmorphic containers use a background of `rgba(255, 255, 255, 0.7)` with a `20px` backdrop-blur. They feature a very thin `1px` border of `rgba(255, 255, 255, 0.5)` to simulate light catching the edge of a pane.
- **Level 3 (Interactive/Floating):** Active elements or modals use a deep, diffused shadow: `0 20px 40px rgba(99, 102, 241, 0.1)`. This indigo-tinted shadow ensures the "Vanguard Kinetic" energy is felt even in the depth model.

## Shapes

The shape language is sophisticated and approachable. 
- **Primary Cards:** Use the `rounded-lg` (16px) standard to create a friendly, modern container.
- **Interactive Elements:** Buttons and input fields follow the `rounded` (8px) standard for a more precise, technical feel.
- **Status Tags:** Use pill-shaped (full round) corners to distinguish them from functional UI components.
- **Images:** Photography should use `rounded-xl` (24px) or be masked into unique, modern geometric shapes to reinforce the "Vanguard" theme.

## Components

### Buttons
- **Primary:** Electric Indigo background, white text, subtle glow on hover.
- **Secondary:** Transparent with an Electric Indigo border and text.
- **Glass Action:** Translucent white background with cyan text for use over colored backgrounds.

### Cards & Dashboards
- Cards must feature the glassmorphic treatment with a subtle inner glow. 
- Headers within cards use `label-sm` in a muted slate color.
- Dashboard views (inspired by the reference) utilize "Board Columns" with light-gray backgrounds to group application stages.

### Input Fields
- Understated borders that transition to an Electric Indigo glow on focus.
- Placeholder text in a light slate weight.

### Chips & Status Indicators
- Use Cyan for "Active," Violet for "Interview," and Indigo for "New." 
- All chips should have a slight background opacity (e.g., 10%) of their respective color to maintain the glassmorphic aesthetic.

### Navigation
- A "sticky" top navigation bar with a heavy backdrop blur and no bottom border, using only a subtle drop shadow to separate it from the content.