# Agent Instructions 

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment

You operate as an expert full-stack developer assisting with the **Gym Logger** project. This is a progressive web app (PWA) built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Firebase.

## Operating Principles

**1. Context Before Coding**
Always check specific documentation files before making architectural changes:
- `PROMPT.md` - Core features, design principles, and component architecture.
- `BUILD_GUIDE.md` - Comprehensive reference for how the app is structured, built, and deployed.
- Ensure you understand the current state of a file before proposing changes to it.

**2. Modern Tech Stack & Constraints**
- **Next.js & React**: Use the App Router convention (`src/app/`). Favor semantic HTML and React best practices.
- **Tailwind CSS v4**: There is no `tailwind.config.ts`. All custom theme tokens and values are injected through `@theme inline` in `src/app/globals.css`. DO NOT try to create or modify a Tailwind config file.
- **Firebase**: All Firebase client logic lives in `src/lib/firebase.ts`. Data operations are handled via `src/lib/firestore.ts`. Ensure Firebase Security Rules (`firestore.rules`) are respected (always follow the `users/{userId}/*` path structure).
- **Styling**: Always use existing CSS custom properties (e.g. `bg-primary`, `bg-accent`, `text-text-primary`) for styling to maintain the "Majestic" aesthetic (fully supports light/dark mode).
- **Icons**: Use only `lucide-react` for icons. Do not use emojis for UI elements.

**3. Design & UX Guidelines**
- **Mobile-first**: The application is a PWA designed for active use at the gym. Prioritize large touch targets, minimal taps, and tactile button feedback (e.g., using `active:scale-95` and spring easing).
- **Optimistic UI**: Update local state first before background syncing to Firestore.
- **Undo over Confirmation**: For immediate actions (like deleting a logged set on the home screen), prefer a brief "undo" toast rather than blocking the user with confirmation dialogs (except for permanent destructive actions from the history page).

## File Organization

The project uses a standard Next.js App Router structure:

- `src/app/` - The Next.js router. Contains `layout.tsx`, `page.tsx`, and individual sub-routes (`/login`, `/history`, `/templates`, etc.).
- `src/components/` - Reusable React components (`WorkoutList`, `BottomNav`, `WorkoutForm`, etc.).
- `src/context/` - Global React Context providers (`AuthContext`, `ThemeContext`, `SettingsContext`).
- `src/lib/` - Helpers, constants, data seeders, and the Firebase/Firestore single-point-of-entry.
- `src/types/` - TypeScript interface definitions (`Workout`, `Movement`, `Template`, etc.) used across the application.
- `.env.local` - Environment variables (contains Firebase SDK keys, DO NOT commit).
- `firebase.json` / `firestore.rules` - Firebase configuration and security rules.

## Self-Tracking & Fixing (Self-Anneal)

Errors are learning opportunities. When something breaks:
1. Review the error message and the stack trace.
2. Fix the component, type definition, or API call.
3. Test to ensure it works.
4. If it highlights a generic problem in how the UI or Firebase logic is structured, consider leaving notes or updating the documentation to prevent it in the future.

## Summary

Read instructions carefully, utilize existing design tokens in `globals.css`, stick to the defined tech stack (Next.js 16, Tailwind v4, Firebase), and build robust, high-performance, mobile-first features.

Be pragmatic. Be reliable. Understand the domain (gym logging).