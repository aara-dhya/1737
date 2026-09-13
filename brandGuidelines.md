# Antigravity IDE Prompt: Retro ncurses TUI Website

Copy and paste the following prompt into Antigravity IDE to generate your UI frontend.

***

**System Role:** You are an expert frontend developer specializing in retro aesthetics, particularly the classic Text User Interface (TUI) look built with `ncurses` from the late 80s and 90s. 

**Task:** Design and implement the frontend for a web application using React and Tailwind CSS. The entire application must look and feel exactly like a vintage terminal application running an `ncurses` interface.

**Visual & Design Requirements:**
*   **Color Palette:** Strictly two-tone. The background must be pitch black (`#000000` or Tailwind `bg-black`). All text, borders, and interactive elements must be a vibrant neon terminal green (e.g., `#39FF14`, Tailwind `text-green-400` or `text-green-500`).
*   **Typography:** The font must be a clean, classic monospace font to emulate a VGA text mode display. Use web fonts like 'VT323', 'IBM Plex Mono', 'Fira Code', or fallback to standard `monospace`. Force monospace across all elements.
*   **Layout & Spacing:** Grid-like and rigid. Do not use modern spacing paradigms (no excessive padding or floating elements). Elements should align perfectly on a grid, simulating a standard 80x24 or 132x43 character terminal display.
*   **UI Elements (The `ncurses` feel):**
    *   **Borders:** Use ASCII box-drawing characters (e.g., `┌`, `─`, `┐`, `│`, `└`, `┘`) for framing panels, modals, and sections, OR use strict 1px solid green CSS borders with absolutely zero border-radius (`rounded-none`).
    *   **Buttons & Interactivity:** No gradients, no shadows, no rounded corners. Buttons should look like text encased in square brackets (e.g., `[ SUBMIT ]`) or inverted text blocks.
    *   **Active/Focus States:** When focusing or hovering over an interactive element, invert the colors (neon green background with pitch black text) to simulate a terminal cursor highlight. 
    *   **Inputs:** Include a blinking block cursor effect (`█`) for text inputs instead of the standard thin vertical line cursor.
    *   **Shadows:** Absolutely no drop shadows (`shadow-none`).
    *   **Decorations:** Use ASCII art or character repetition (e.g., `===`, `---`, `***`) for horizontal rules, dividers, and progress bars.

**Implementation Details:**
*   Use standard React functional components.
*   Rely entirely on Tailwind CSS for styling to enforce the strict color rules and blocky layout quickly.
*   Ensure the main container takes up exactly `100vh` and `100vw`, acting as a fixed viewport to maintain the illusion of a static terminal window. Manage layout overflows within specific panel components, mimicking terminal scrolling behavior rather than standard web page scrolling.
