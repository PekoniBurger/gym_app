# 🏋️ Gym Logger

A "Majestic", minimal, mobile-first Progressive Web App (PWA) designed for frictionless workout logging. Built to be used at the gym, prioritizing speed, touch-friendly interfaces, and tactile feedback.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first, `@theme`-driven)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Google Auth)
- **State Management**: React Context + Firestore Optimistic UI
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## ✨ Key Features

- **Mobile First**: Optimized for one-handed use in the gym.
- **Minimal Taps**: Log a set in under 5 seconds.
- **Optimistic UI**: Instant updates with background Firestore sync.
- **Glassmorphism**: Elegant, semi-transparent navigation and UI elements.
- **Tactile Feedback**: Spring-based animations and "teal flash" active states for buttons.
- **Full PWA**: Installable on iOS and Android for a native app feel.
- **Theme Support**: Premium Light and Dark modes with automatic system detection.

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PekoniBurger/gym_app.git
   cd gym_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📐 Architecture & Principles

- **Undo over Confirmation**: Immediate actions use a 5-second undo toast rather than blocking dialogs.
- **Semantic HTML**: Accessible and SEO-friendly structure.
- **Performance**: Leveraging React Compiler and efficient Firestore read/write patterns (embedded entries).

## 📄 License

MIT
