-- 1. 擴充使用者資料表，加入訂閱與藍新金流欄位
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free', -- 'free' 或 'pro'
  ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz,     -- 訂閱到期日 (由 Webhook 更新)
  ADD COLUMN IF NOT EXISTS last_order_no text,                    -- 最近一次的藍新訂單編號
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';  -- 付款狀態

-- 2. 建立回饋資料表 (RLHF 數據收集)
CREATE TABLE IF NOT EXISTS reading_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  reading_id text NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
