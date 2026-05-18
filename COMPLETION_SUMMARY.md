# AI Photobooth Frontend Refinement: iOS/macOS Style

This document summarizes the changes applied to the AI Photobooth frontend to achieve a premium, glassmorphic look inspired by modern iOS and macOS design paradigms.

## Key Enhancements

### 1. Design System & Style Tokens (`tailwind.config.ts`, `globals.css`)

* **Aesthetic Backgrounds:** Deep space, dark-mode base with vibrant radial and linear color gradients.
* **Glassmorphism Utility Classes:** Predefined `.glass` and `.glass-light` classes utilizing backing filters, thin borders, and subtle highlights.
* **Shadow Systems:** Smooth iOS-like box shadows (`shadow-ios`, `shadow-glow-pink`).
* **Smooth Animations:** Enhanced transition-durations and easing configurations matching natural OS physics.

### 2. High-Fidelity UI Components (`src/components/ui/`)

* **Button (`button.tsx`):** Press-scaling animations, glowing states, and responsive glassmorphic variants.
* **Card (`card.tsx`):** Card elevations with rounded-3xl corners and thin borders.
* **Input (`input.tsx`):** Glowing active borders and semi-transparent input fields.
* **Sidebar (`sidebar.tsx`):** Elegant sliding navigation panel using modern dark-glass effects.

### 3. Visual Effects & Additions (`src/components/common/` & `src/components/layout/`)

* **AnimatedBackground (`AnimatedBackground.tsx`):** Moving gradient mesh layers that dynamically react to viewport changes.
* **AnimatedLoader (`AnimatedLoader.tsx`):** Spinning neon ring states for processing indicator overlays.
* **ConfettiParticles (`ConfettiParticles.tsx`):** Burst particle effects to celebrate successful photoshoots.
* **animations.ts (`src/lib/animations.ts`):** Centralized Framer Motion variants.

### 4. Interactive Pages (`src/app/page.tsx` & `src/app/layout.tsx`)

* Fully integrated page transitions.
* Standardized metadata and modern Outfit / Inter font integration.
