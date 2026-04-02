// Untuk deployment di Vercel sebagai API proxy
// File: api/auto-clipper.js

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
    
    const { url, duration = 30, mode = 'auto', format = 'mp4' } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    try {
        // Panggil API puruboy untuk auto clipper
        const response = await fetch('https://puruboy-api.vercel.app/api/auto-clipper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, duration, mode, format })
        });
        
        const data = await response.json();
        
        return res.status(200).json({
            success: true,
            clipUrl: data.clipUrl || data.url,
            duration: duration,
            fileSize: data.fileSize,
            confidence: data.confidence,
            timeline: data.timeline
        });
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// File: api/video-info.js
export async function videoInfoHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { url } = req.body;
    
    try {
        const response = await fetch('https://puruboy-api.vercel.app/api/video-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
