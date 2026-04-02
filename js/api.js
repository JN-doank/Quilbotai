// API Configuration
const API_CONFIG = {
    baseURL: 'https://puruboy-api.vercel.app',
    endpoints: {
        quillbot: '/api/quillbot'
    },
    timeout: 30000
};

// API Service Class
class QuillbotAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
    }

    async paraphrase(text, style = 'standard') {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

            const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.quillbot}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    mode: style
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Format response sesuai struktur yang diharapkan
            return {
                success: true,
                paraphrased: data.paraphrased || data.result || data.data?.paraphrased,
                original: text,
                style: style,
                timestamp: new Date().toISOString(),
                confidence: data.confidence_score || 0.92,
                engine: data.metadata?.version || 'Neural v4.0'
            };
        } catch (error) {
            console.error('API Error:', error);
            
            // Fallback / Mock response jika API tidak tersedia
            if (error.name === 'AbortError') {
                return this.mockParaphrase(text, style, 'Request Timeout');
            }
            
            return this.mockParaphrase(text, style, error.message);
        }
    }

    // Mock response untuk development/testing
    mockParaphrase(text, style, errorMsg = null) {
        const paraphrases = {
            standard: `Hasil paraphrase standar dari teks: "${text}"`,
            formal: `Berdasarkan analisis formal, teks yang disampaikan: "${text}" dapat diparafrasekan menjadi...`,
            creative: `✨ Kreatif! Mari kita ubah "${text}" menjadi sesuatu yang lebih menarik... ✨`,
            fluency: `📝 Versi fluency: "${text}" dioptimalkan menjadi kalimat yang lebih lancar.`
        };

        return {
            success: errorMsg ? false : true,
            paraphrased: paraphrases[style] || paraphrases.standard,
            original: text,
            style: style,
            timestamp: new Date().toISOString(),
            confidence: errorMsg ? 0 : 0.89,
            engine: 'Neural v4.0 (Mock Mode)',
            error: errorMsg
        };
    }
}

// Export instance
const quillbotAPI = new QuillbotAPI();
