export const handleCheckout = async (userId: string, email: string, priceId: string) => {
    try {
        // 1. 呼叫我們的 API 取得加密參數
        const response = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, userId, email })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        // 2. 動態建立一個隱藏表單 (Form)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.url; // 藍新的金流網址

        // 3. 將 API 回傳的參數填入 input
        Object.entries(result.data).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
        });

        // 4. 加入 DOM 並自動送出
        document.body.appendChild(form);
        form.submit(); // 使用者將被轉導至藍新付款頁面

    } catch (error) {
        console.error('Checkout failed:', error);
        alert('建立訂單失敗，請稍後再試。');
    }
};
