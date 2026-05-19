interface Env {
    GEMINI_API_KEY?: string;
    VITE_GEMINI_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const rawApiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.trim() : undefined;

    if (!apiKey) {
        console.error("Missing API Key");
        return new Response(JSON.stringify({ error: "Server Config Error: Missing API Key" }), { status: 500 });
    }

    try {
        const body = await request.json() as any;
        const { action, ...params } = body;

        let systemInstruction = "";
        let userPrompt = "";

        // Determine logic based on action
        if (action === 'analyze_intent') {
            // Logic for intent analysis
            systemInstruction = "You are an expert Tarot reader. Analyze the user's question and categorize it into one of: 'Love', 'Career', 'Health', 'Spiritual', 'General'. Return JSON: { \"category\": \"...\" }";
            userPrompt = `Question: ${params.question}`;
        } else if (action === 'analyze_card') {
            // Logic for single card analysis
            systemInstruction = "You are an expert Tarot scholar. Analyze the given card. Return JSON: { \"meaning\": \"Detailed meaning...\", \"keywords\": [\"key1\", \"key2\"], \"element\": \"Element\" }";
            userPrompt = `Card: ${params.cardName}. Deck: ${params.deckType}. Language: ${params.lang || 'en'}`;
        } else if (action === 'reading') {
            // Logic for reading
            systemInstruction = `You are a mystical Tarot reader. Provide a reading based on the cards. 
       Output JSON format: 
       {
         "summary": "Short title",
         "keywords": ["tag1", "tag2"],
         "analysis": "Detailed analysis...",
         "advice": "Actionable advice...",
         "affirmation": "Positive affirmation...",
         "luckyColor": "Color",
         "luckyNumber": "Number",
         "flavorText": "Mystical opening..."
       }
       Language: ${params.lang || 'en'}`;
            userPrompt = `Question: ${params.question}. Cards: ${JSON.stringify(params.cards)}. Spread: ${params.spread}. Intent: ${params.intent}.`;
        } else if (action === 'generate_image') {
            return new Response(JSON.stringify({ imageUrl: null }), { headers: { "Content-Type": "application/json" } });
        } else {
            return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: systemInstruction + "\n\n" + userPrompt }]
            }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data: any = await response.json();

        // Parse Gemini response
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const text = data.candidates[0].content.parts[0].text;
            try {
                const json = JSON.parse(text);
                return new Response(JSON.stringify(json), { headers: { "Content-Type": "application/json" } });
            } catch (e) {
                // If generic text
                return new Response(JSON.stringify({ result: text }), { headers: { "Content-Type": "application/json" } });
            }
        }

        console.error("Gemini API Error:", JSON.stringify(data));
        const status = response.status && response.status !== 200 ? response.status : 500;
        return new Response(JSON.stringify(data), { 
            status: status,
            headers: { "Content-Type": "application/json" } 
        });

    } catch (err: any) {
        console.error("Worker Error:", err.message, err.stack);
        return new Response(JSON.stringify({ error: "Generation Failed", details: err.message }), { status: 500 });
    }
}
