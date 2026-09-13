# Brand Guidelines: UI/UX Specifications

**Project:** Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management
**Aesthetic Theme:** Terminal Brutalism / Cyberpunk Minimalist

This document defines the strict visual language and UI components for the platform. The design emphasizes a highly technical, raw, and secure feel with a refined pastel aesthetic.

---

## 1. Color Palette

The interface relies on extreme high contrast with smooth, non-harsh tones to simulate a modern minimalist terminal interface.

*   **Primary Background:** Pitch Black (`#000000`)
    *   *Usage:* The main background of the app, sidebars, and card backgrounds.
*   **Primary Accent (The "Glow"):** Pastel Green (`#77DD77` or `#61D095`)
    *   *Usage:* Primary buttons, active states, borders, success messages, and key data points.
*   **Primary Text:** Bright White (`#FFFFFF`) or Bright Pastel Green (`#77DD77`)
    *   *Usage:* Headings, critical values, and primary navigation.
*   **Secondary Text:** Muted Gray (`#A0A0A0`) or Darker Mint Green (`#38A368`)
    *   *Usage:* Body paragraphs, inactive states, secondary labels, and audit log timestamps.

---

## 2. Typography

All text across the application must use a clean, legible monospace font to reinforce the technical nature of the platform.

*   **Primary Font Family:** `JetBrains Mono`, `Fira Code`, `Space Mono`, or standard `monospace`.
*   **Styling Rules:**
    *   No cursive, sans-serif, or serif fonts are permitted.
    *   Keep font weights distinct (e.g., Regular 400 for body, Bold 700 for headings).
    *   Letter spacing (tracking) should be slightly wider than default for readability against the black background.

---

## 3. Shape & Geometry (The "Sharp Edge" Rule)

Absolutely **no rounded corners** are allowed anywhere in the application.

*   **Border Radius:** `0px` globally (CSS: `border-radius: 0 !important;`).
*   **Visual Structure:** Everything is a perfect rectangle or square.
*   **Borders:** Use solid, thin borders (1px or 2px) to define structural elements instead of drop shadows. Shadow effects, if used, should be hard block shadows (e.g., `box-shadow: 4px 4px 0px #77DD77`), not blurred.

---

## 4. UI Components

### Buttons
*   **Primary Button:**
    *   Background: Pastel Green (`#77DD77`)
    *   Text: Pitch Black (`#000000`)
    *   Border: None
    *   Hover State: Invert colors (Background: Black, Text: Pastel Green, Border: 2px solid Pastel Green).
*   **Secondary / Outline Button:**
    *   Background: Pitch Black (`#000000`)
    *   Text: Pastel Green (`#77DD77`)
    *   Border: 2px solid Pastel Green (`#77DD77`)
    *   Hover State: Background turns solid Pastel Green, Text turns Black.

### Cards & Containers (e.g., NFT Assets, User Profiles)
*   **Background:** Pitch Black (`#000000`).
*   **Border:** 1px solid Pastel Green or Dark Gray.
*   **Padding:** Generous block padding (e.g., `24px`).
*   **Corners:** Sharp (`0px`).

### Inputs & Forms
*   **Background:** Pitch Black or very dark gray (`#111111`).
*   **Border:** 1px solid Gray, turns to 2px solid Pastel Green on focus.
*   **Caret:** Pastel Green block caret if possible, or standard line caret.
*   **Text:** Bright White or Pastel Green.

---

## 5. Implementation Notes (CSS/Tailwind)

To implement this in Tailwind CSS, update your `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        black: '#000000',
        pastel: '#77DD77',
        pastelGreen: '#77DD77',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      }
    }
  }
}
```
