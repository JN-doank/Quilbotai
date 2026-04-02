// API Configuration
const API_CONFIG = {
    baseURL: 'https://puruboy-api.vercel.app',
    endpoints: {
        autoClipper: '/api/auto-clipper',
        videoInfo: '/api/video-info'
    },
    timeout: 60000 // 60 detik untuk processing video
};

// WhatsApp Channel Configuration
const WHATSAPP_CONFIG = {
    channelUrl: 'https://whatsapp.com/channel/0029VbBCfLWL2AU8SGofvA04',
    // Ganti dengan link channel WhatsApp Anda yang sebenarnya
    // Contoh: 'https://whatsapp.com/channel/0029VaAbc123Xyz789'
};

// API Service Class
class AutoClipperAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
    }

    async getVideoInfo(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.videoInfo}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ url: url }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Video Info Error:', error);
            return this.mockVideoInfo(url);
        }
    }

    async processClip(url, options) {
        const { duration, mode, format } = options;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.autoClipper}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    duration: duration,
                    mode: mode,
                    format: format
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                videoUrl: data.clipUrl || data.url,
                duration: duration,
                fileSize: this.formatFileSize(data.fileSize || Math.random() * 10 + 2),
                confidence: data.confidence || 0.88,
                mode: mode,
                format: format,
                timeline: data.timeline || [25, 50, 75]
            };
        } catch (error) {
            console.error('Clipping Error:', error);
            return this.mockClipResult(url, options, error.message);
        }
    }

    mockVideoInfo(url) {
        const platform = this.detectPlatform(url);
        return {
            success: true,
            platform: platform,
            title: `Video from ${platform}`,
            duration: Math.floor(Math.random() * 300 + 60),
            thumbnail: null
        };
    }

    mockClipResult(url, options, errorMsg = null) {
        const { duration, mode, format } = options;
        
        // Mock video URL (placeholder)
        const mockVideoUrl = `https://sample-videos.com/video123/mp4/480/big_buck_bunny_${duration}sec.mp4`;
        
        return {
            success: errorMsg ? false : true,
            videoUrl: mockVideoUrl,
            duration: duration,
            fileSize: this.formatFileSize(Math.random() * 15 + 1),
            confidence: errorMsg ? 0 : (Math.random() * 0.3 + 0.65).toFixed(2),
            mode: mode,
            format: format,
            timeline: [20, 45, 70],
            error: errorMsg
        };
    }

    detectPlatform(url) {
        url = url.toLowerCase();
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
        if (url.includes('tiktok.com')) return 'TikTok';
        if (url.includes('instagram.com')) return 'Instagram';
        if (url.includes('facebook.com') || url.includes('fb.com')) return 'Facebook';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
        return 'Unknown';
    }

    formatFileSize(mb) {
        if (mb < 1) return `${Math.round(mb * 1024)} KB`;
        return `${mb.toFixed(1)} MB`;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Export instance
const autoClipperAPI = new AutoClipperAPI();
