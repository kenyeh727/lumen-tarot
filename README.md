# Lumen Tarot 🔮

A modern, high-aesthetic Tarot and Lenormand reading web application built with React, Vite, and Gemini AI.

## ✨ Features

- **Tarot & Lenormand Decks**: Choose your preferred divination tool.
- **AI-Powered Readings**: Integrated with Gemini AI for deep intent analysis and interpretation.
- **Dynamic Artwork**: AI-generated card imagery based on your reading.
- **Modern UI**: Full-screen immersive experience with glassmorphism and smooth animations.
- **Shareable Results**: Capture and share your destiny with beautiful generated layouts.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS (CDN) + Custom Vanilla CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **AI**: Google Generative AI (Gemini)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Gemini API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Development

Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Build

Build for production:
```bash
npm run build
```

## 📂 Project Structure

- `App.tsx`: Main application container and stage management.
- `components/`: Reusable UI components (StarField, DeckSelector, etc.).
- `services/`: Backend services (Gemini API integration).
- `constants.ts`: Deck data and translations.
- `types.ts`: TypeScript definitions.

## 📜 License

MIT
