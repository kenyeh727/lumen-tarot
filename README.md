# 🔮 Lumen Tarot — AI Tarot & Lenormand Readings

> A modern, immersive Tarot and Lenormand reading app. Ask a question, draw your cards, and get deep AI-powered interpretations with beautiful generated artwork.
>
> 現代感十足的塔羅與雷諾曼占卜應用。提出你的問題、抽牌，AI 即時給出深度解讀，配上精美生成的牌卡視覺。

---

## ✨ Features

- 🃏 **Tarot & Lenormand Decks** — Choose your preferred divination system
- 🤖 **AI-Powered Readings** — Deep intent analysis and card-by-card interpretation
- 🎨 **Dynamic Artwork** — AI-generated card imagery tailored to your reading
- 🌌 **Immersive UI** — Full-screen experience with glassmorphism and smooth animations
- 📤 **Shareable Results** — Capture your reading as a beautiful share layout
- 👤 **User Accounts** — Sign in, track usage, and manage subscriptions
- 📱 **Mobile Apps** — Native Android and iOS builds via Capacitor

## 🚀 Quick Start

### Prerequisites

- **Node.js** (Latest LTS recommended)
- **Wrangler** (for the backend — installed via devDependencies)
- API key and Supabase credentials (see below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kenyeh727/lumen-tarot.git
   cd lumen-tarot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example file and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_AI_API_KEY=your_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development** (frontend + backend together)
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`. The API backend runs on `:8788` via Wrangler.

5. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Tech Stack

- **Framework**: React 19
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS (CDN) + Custom CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **AI**: AI API integration for intent analysis, readings, and artwork
- **Backend**: Cloudflare Pages Functions (`functions/api`)
- **Auth & Data**: Supabase
- **Mobile**: Capacitor (Android / iOS)

## 📁 Project Structure

```
lumen-tarot/
├── functions/
│   └── api/                    # Cloudflare Pages Functions (backend API)
├── src/
│   ├── components/             # Reusable UI components
│   ├── pages/                  # App pages (Lobby, Reading, Spread, Pricing…)
│   ├── services/               # Frontend API services
│   ├── App.tsx                 # Main application container
│   └── constants.ts            # Deck data and translations
├── android/ / ios/             # Capacitor native projects
├── supabase/                   # Supabase config / migrations
└── package.json
```

## 🌐 Deployment

Deploy to **Cloudflare Pages** (connect the repo or use Wrangler). The `functions/` directory is picked up automatically as the backend — no extra config needed.

## 📝 License

MIT

---

## 中文說明

### 🔮 Lumen Tarot — AI 塔羅與雷諾曼占卜

現代感十足的占卜應用：提出問題、抽牌，AI 即時進行意圖分析與逐張牌義解讀，並生成專屬的牌卡視覺。支援塔羅與雷諾曼兩種系統，沉浸式全螢幕體驗，可把占卜結果做成精美圖卡分享。

**功能特色**

- 🃏 **塔羅＋雷諾曼牌卡** — 兩種占卜系統任選
- 🤖 **AI 解讀** — 意圖分析＋逐張牌義深度解說
- 🎨 **動態牌卡視覺** — 依占卜內容生成的專屬圖像
- 🌌 **沉浸式介面** — 全螢幕、玻璃擬態、流暢動畫
- 📤 **分享圖卡** — 一鍵產出精美占卜結果圖
- 👤 **會員系統** — 登入、使用量管理、訂閱制
- 📱 **手機 App** — Capacitor 打包的 Android / iOS 版

**快速開始**：需求 Node.js（LTS）與 Wrangler。`npm install` → 複製 `.env.example` 為 `.env` 並填入 API key 與 Supabase 設定 → `npm run dev`（前端＋後端一起跑），打開 http://localhost:3000。

**技術棧**：React 19、Vite 6、Tailwind CSS、Framer Motion、Cloudflare Pages Functions 後端、Supabase、Capacitor。

本專案採用 MIT 授權。
