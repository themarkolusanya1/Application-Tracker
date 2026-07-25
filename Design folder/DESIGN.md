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
  tertiary: '#b90538'
  on-tertiary: '#ffffff'
  tertiary-container: '#dc2c4f'
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
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 16px
  container-padding-desktop: 40px
  gutter: 24px
  card-gap: 24px
---

## Brand & Style

The brand personality is **ambitious, supportive, and cutting-edge**. It is designed to resonate with high-achievers—students and job seekers who view their career as a trajectory to be optimized. The aesthetic is a fusion of **Corporate Modern** and **Glassmorphism**, emphasizing high-fidelity surfaces that feel premium and "software-as-a-service" forward.

The visual language communicates momentum through subtle directional gradients and depth through layered translucency. The emotional response should be one of empowerment and clarity; the UI acts as a professional springboard that clarifies the path to the user's next big opportunity.

## Colors

This design system utilizes a high-vibrancy palette to maintain an energetic feel while remaining grounded in professional reliability.

- **Primary (Electric Indigo):** Used for main actions, active states, and branding. It represents ambition and intelligence.
- **Secondary (Vibrant Cyan):** Used for accents, progress indicators, and "success" highlights. It adds a fresh, technological edge.
- **Tertiary (Rose):** Reserved for high-urgency notifications or "Trial Ending" alerts to ensure immediate attention.
- **Background & Surfaces:** A base of `Neutral 50` (#F8FAFC) ensures that primary cards stand out with maximum contrast. Pure white is used for the card surfaces themselves to create a "lifted" appearance against the soft gray background.

## Typography

The typography strategy leverages **Montserrat** for impactful headlines to convey confidence and **Inter** for body text to ensure maximum readability during data-heavy job searches.

- **Headlines:** Use heavy weights (700-800) and tight letter spacing for a modern, editorial feel. 
- **Body:** Inter provides a systematic, neutral base that balances the loud headlines.
- **Labels:** Used for metadata like "Trial Status" or "Days Left." These should often use a slightly heavier weight than body text to maintain hierarchy at small sizes.

## Layout & Spacing

The design system employs a **fluid grid** with an 8px base unit. Layouts are designed to feel airy and uncrowded.

- **Mobile:** Single column with 16px side margins. Cards are full-width.
- **Desktop:** 12-column grid. The trial card components typically span 4 columns in a sidebar or 8-12 columns in a featured hero section.
- **Spacing Rhythm:** Use 24px (3 units) for internal card padding and 40px (5 units) for vertical section spacing to maintain a "premium" sense of scale.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** combined with **Ambient Shadows**.

- **Level 1 (Base):** Neutral 50 background.
- **Level 2 (Cards):** Pure White (#FFFFFF) with a 1px border (#E2E8F0) and a soft, multi-layered shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)`.
- **Level 3 (Trial Highlights):** Use a subtle Cyan-to-Indigo gradient (10% opacity) as a background fill for specific sections within a card to create a "glass" focal point.
- **Interactions:** On hover, cards should lift slightly (shadow increases in blur) and borders should transition to the Primary Indigo at 30% opacity.

## Shapes

The shape language is **Rounded**, favoring a modern and approachable silhouette. 

- **Cards & Containers:** Use `rounded-lg` (16px) to maintain a friendly yet structured appearance.
- **Buttons:** Use `rounded-lg` for standard actions; use `rounded-full` (pill) specifically for "Trial Start" or "Upgrade" buttons to make them feel more tactile and distinct.
- **Input Fields:** Use `rounded-md` (8px) for a sharper, more functional look.

## Components

### Trial Cards
The flagship component. Features a white surface with a subtle 1px Primary border. Include a **Gradient Header** (Primary to Secondary) at 5% opacity to house the title. The "Time Remaining" should be a prominent **Circular Progress Indicator** using the Secondary Cyan color.

### Buttons
- **Primary:** Solid Electric Indigo with white text. Apply a subtle drop shadow to make it feel "pressable."
- **Ghost:** Transparent background with Indigo border and text. Used for secondary actions like "Learn More."

### Benefit Highlights
Use a horizontal list layout. Each item features a small, soft-round icon background (Secondary Cyan at 10% opacity) with a matching icon color.

### Chips / Badges
Small, high-contrast labels used for status (e.g., "7 DAYS LEFT"). Use uppercase `label-sm` typography. Backgrounds should be the tinted version of the color (e.g., light rose background for an "Expiring" badge).

### Progress Indicators
Linear progress bars should have a `Neutral 100` track and a `Secondary Cyan` fill. For "Elite" or "Pro" trials, the fill can be a Primary-to-Secondary horizontal gradient.