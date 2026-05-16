import crypto from 'node:crypto';

// 定義環境變數介面
interface Env {
    NEWEBPAY_MERCHANT_ID: string;
    NEWEBPAY_HASH_KEY: string;
    NEWEBPAY_HASH_IV: string;
    NEWEBPAY_ENV: string; // 'production' or 'test'
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        // 1. 取得前端傳來的參數
        const { priceId, userId, email } = await context.request.json() as any;

        if (!priceId || !userId || !email) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 2. 設定環境變數 (請至 Cloudflare Pages Settings 設定)
        const MERCHANT_ID = context.env.NEWEBPAY_MERCHANT_ID;
        const HASH_KEY = context.env.NEWEBPAY_HASH_KEY;
        const HASH_IV = context.env.NEWEBPAY_HASH_IV;
        // 判斷環境決定 API 網址
        const API_URL = context.env.NEWEBPAY_ENV === 'production'
            ? 'https://core.newebpay.com/MPG/mpg_gateway'
            : 'https://ccore.newebpay.com/MPG/mpg_gateway';

        // 3. 準備訂單資料
        // 產生唯一訂單號 (格式: ORD_時間戳_UserID前5碼)
        const orderNo = `ORD_${Date.now()}_${userId.substring(0, 5)}`;
        const amount = priceId === 'price_premium' ? 399 : 100; // 範例金額邏輯
        const timeStamp = Math.floor(Date.now() / 1000);

        // 藍新 MPG 必要參數
        const tradeData = {
            MerchantID: MERCHANT_ID,
            RespondType: 'JSON',
            TimeStamp: timeStamp,
            Version: '2.0',
            MerchantOrderNo: orderNo,
            Amt: amount,
            ItemDesc: 'Lumen Tarot Premium', // 商品名稱
            Email: email,
            LoginType: 0, // 0: 不需登入藍新會員
            // 設定回調網址 (請替換為你的真實網域名稱)
            ReturnURL: `${new URL(context.request.url).origin}/payment/return`, // 支付完成跳轉頁
            NotifyURL: `${new URL(context.request.url).origin}/api/payment/notify`, // 背景 Webhook
            ClientBackURL: `${new URL(context.request.url).origin}/pricing`, // 取消返回頁
        };

        // 4. 加密流程 (AES-256-CBC)
        // 4.1 URL Encode 參數
        const params = new URLSearchParams();
        Object.entries(tradeData).forEach(([k, v]) => params.append(k, String(v)));
        const paramString = params.toString();

        // 4.2 AES 加密
        const cipher = crypto.createCipheriv('aes-256-cbc', HASH_KEY, HASH_IV);
        let encrypted = cipher.update(paramString, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tradeInfo = encrypted;

        // 4.3 SHA256 壓碼 (產生檢查碼)
        const shaStr = `HashKey=${HASH_KEY}&${tradeInfo}&HashIV=${HASH_IV}`;
        const tradeSha = crypto.createHash('sha256').update(shaStr).digest('hex').toUpperCase();

        // 5. 回傳加密後的資料給前端
        return new Response(JSON.stringify({
            url: API_URL,
            data: {
                MerchantID: MERCHANT_ID,
                TradeInfo: tradeInfo,
                TradeSha: tradeSha,
                Version: '2.0'
            }
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
