沒問題，我直接把完整的計畫書內容貼在這裡給您：


Lumen Tarot SaaS 轉型計畫書 🔮

這份計畫書旨在將 Lumen Tarot 從單純的 Web App 轉型為一個具備商業化能力、高安全性、且架構穩健的 SaaS 產品。

🏗️ 1. 系統架構總覽 (System Architecture)

我們採用 Serverless (無伺服器) 架構，以降低維運成本並提高擴展性。

• 前端 (Frontend)：React 19 + Vite (UI 介面、互動邏輯)
• 路由 (Routing)：React Router v6 (管理頁面導航、支援手機實體返回鍵)
• 狀態管理 (State)：Zustand + Context (取代原本 Monolithic 的 App.tsx 狀態)
• 託管 (Hosting)：Cloudflare Pages (全球 CDN 加速、靜態資源託管)
• 後端 API (Backend)：Cloudflare Functions (核心安全層。代理 Gemini API、處理 Stripe Webhook)
• 資料庫 (DB)：Supabase (PostgreSQL) (使用者資料、訂閱狀態、歷史紀錄、回饋數據)
• 金流 (Payments)：Stripe (信用卡訂閱處理)
• 手機封裝 (Mobile)：Capacitor (將網頁包裝為 iOS/Android App)

🔒 2. 安全性與後端 API (Backend Proxy)

目標： 徹底移除前端暴露的 VITE_GEMINI_API_KEY，所有 AI 請求走自家後端。

2.1 建立 Cloudflare Functions (functions/api/reading.ts)

在專案根目錄建立 functions/api 資料夾，Cloudflare Pages 會自動將其部署為路由。

// functions/api/reading.ts
interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // 1. 安全性：確認 API Key 存在
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Server Config Error" }), { status: 500 });
  }

  try {
    const body = await request.json() as any;
    // ... (接收前端參數：question, selectedCards, intent...)

    // 2. 呼叫 Google Gemini (Server-to-Server)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    // ... (建構 Prompt 邏輯，包含語言設定)

    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* ...Gemini Payload... */ })
    });

    // 3. 回傳結果給前端
    const data: any = await response.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Generation Failed" }), { status: 500 });
  }
}

2.2 前端服務重構 (src/services/geminiService.ts)

修改前端程式碼，不再直接呼叫 Google，改為呼叫自己的 API。

export const generateReading = async (payload: any) => {
  // 呼叫 Cloudflare Function
  const res = await fetch('/api/reading', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
};


🛠️ 3. 前端架構重構 (Refactoring Monolith)

目標： 拆解 App.tsx，引入路由與狀態管理，解決「手機返回鍵失效」與「代碼難以維護」的問題。

3.1 引入 React Router

安裝：npm install react-router-dom

新的路由結構建議：

• / - 首頁 (Lobby)
• /library - 牌義圖書館
• /spread/:deckType - 抽牌流程 (包含洗牌、切牌、選牌)
• /reading/:id - 解讀結果頁 (支援透過 URL 分享)
• /history - 歷史紀錄
• /login - 登入頁
• /pricing - 訂閱方案頁 (SaaS 新增)
3.2 狀態管理 (Zustand 範例)

建立 src/store/gameStore.ts 來管理全域狀態：

import { create } from 'zustand';

interface GameState {
  question: string;
  selectedCards: Card[];
  readingResult: Reading | null;
  setQuestion: (q: string) => void;
  addCard: (card: Card) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  question: '',
  selectedCards: [],
  readingResult: null,
  setQuestion: (q) => set({ question: q }),
  addCard: (card) => set((state) => ({ selectedCards: [...state.selectedCards, card] })),
  resetGame: () => set({ question: '', selectedCards: [], readingResult: null }),
}));


💰 4. SaaS 訂閱與資料庫 (Subscription & DB)

目標： 實作 Freemium 模式（免費試用 + 付費訂閱），使用 Stripe 收款。

4.1 Supabase Schema 更新 (SQL)

在 Supabase SQL Editor 執行：

-- 1. 擴充使用者資料表，加入訂閱欄位
ALTER TABLE profiles 
ADD COLUMN subscription_tier text DEFAULT 'free', -- 'free' 或 'pro'
ADD COLUMN subscription_end_date timestamptz,
ADD COLUMN stripe_customer_id text,
ADD COLUMN stripe_subscription_id text;

-- 2. 建立回饋資料表 (RLHF 數據收集)
CREATE TABLE reading_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  reading_id text NOT NULL, -- 對應 history 中的 ID
  rating int CHECK (rating >= 1 AND rating <= 5), -- 1-5 星
  comment text,
  created_at timestamptz DEFAULT now()
);
4.2 建立訂閱 API (functions/api/create-checkout.ts)

處理 Stripe Checkout Session 建立。

import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
  const { priceId, userId, email } = await context.request.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${new URL(context.request.url).origin}/success`,
    cancel_url: `${new URL(context.request.url).origin}/pricing`,
    customer_email: email,
    metadata: { userId } // 關鍵：將 userId 傳給 Stripe Webhook 使用
  });

  return new Response(JSON.stringify({ url: session.url }));
}


📊 5. 使用者回饋機制 (Feedback Loop)

目標： 收集使用者對 AI 解牌的滿意度，作為未來優化 Prompt 的數據 (RLHF)。

5.1 前端 UI (src/components/FeedbackWidget.tsx)

在解牌結果頁底部加入簡單的評分組件：

const FeedbackWidget = ({ readingId }) => {
  const [rating, setRating] = useState(0);

  const submitFeedback = async (score: number) => {
    setRating(score);
    // 寫入 Supabase
    await supabase.from('reading_feedback').insert({
      reading_id: readingId,
      rating: score
    });
    alert("感謝您的回饋！這將幫助星空狐狸更準確。");
  };

  return (
    <div className="feedback-area">
      <p>這份解讀對您有幫助嗎？</p>
      <div className="stars">
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => submitFeedback(star)}>
            {star <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
    </div>
  );
};


📱 6. 手機端效能優化 (Mobile Optimization)

目標： 解決 html2canvas 效能低落問題，提供原生體驗。

6.1 Capacitor 截圖方案

若檢測到環境為 Native App (Capacitor)，使用原生插件進行截圖分享。

1. 安裝插件：
npm install @capacitor-community/screenshot @capacitor/share
2. 修改分享邏輯：import { Capacitor } from '@capacitor/core';
import { Screenshot } from '@capacitor-community/screenshot';
import { Share } from '@capacitor/share';

const handleShare = async () => {
  if (Capacitor.isNativePlatform()) {
    // 使用原生截圖 (極快且高清)
    const result = await Screenshot.take();
    await Share.share({
      title: 'Lumen Tarot',
      text: `My Reading: ${reading.summary}`,
      url: result.base64, 
    });
  } else {
    // 網頁版繼續使用 html2canvas (Fallback)
    // ...原有邏輯
  }
};


這份筆記您可以直接複製保存。如果您需要實作其中的任何一部分（例如幫您寫好 functions/api 的程式碼檔案），請隨時告訴我！