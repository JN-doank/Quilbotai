// Untuk deployment di Vercel sebagai API proxy
// File: api/quillbot.js

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { text, mode = 'standard' } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    try {
        // Panggil API puruboy
        const response = await fetch('https://puruboy-api.vercel.app/api/quillbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, mode })
        });
        
        const data = await response.json();
        
        return res.status(200).json({
            success: true,
            data: {
                paraphrased: data.paraphrased || data.result,
                original: text,
                style: mode
            },
            metadata: {
                timestamp: new Date().toISOString(),
                engine: 'Mwehehe AI Neural'
            }
        });
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
