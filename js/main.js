// DOM Elements
const inputText = document.getElementById('inputText');
const processBtn = document.getElementById('processBtn');
const loadingContainer = document.getElementById('loadingContainer');
const outputSection = document.getElementById('outputSection');
const originalTextEl = document.getElementById('originalText');
const paraphrasedTextEl = document.getElementById('paraphrasedText');
const wordCounter = document.getElementById('wordCounter');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const speakBtn = document.getElementById('speakBtn');
const processTimeEl = document.getElementById('processTime');
const confidenceScoreEl = document.getElementById('confidenceScore');
const engineVersionEl = document.getElementById('engineVersion');

// State
let currentStyle = 'standard';
let currentResult = null;
let startTime = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeStars();
    initializeParticles();
    initializeStyleButtons();
    initializeWordCounter();
    initializeEventListeners();
});

// Create stars background
function initializeStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = Math.random() * 3 + 2 + 's';
        starsContainer.appendChild(star);
    }
}

// Particle animation
function initializeParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animate() {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Style buttons
function initializeStyleButtons() {
    const styleBtns = document.querySelectorAll('.style-btn');
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
        });
    });
}

// Word counter
function initializeWordCounter() {
    inputText.addEventListener('input', () => {
        const text = inputText.value.trim();
        const wordCount = text === '' ? 0 : text.split(/\s+/).length;
        wordCounter.textContent = `${wordCount} kata`;
    });
}

// Event listeners
function initializeEventListeners() {
    processBtn.addEventListener('click', processParaphrase);
    copyBtn?.addEventListener('click', copyToClipboard);
    shareBtn?.addEventListener('click', shareResult);
    speakBtn?.addEventListener('click', textToSpeech);
}

// Main process function
async function processParaphrase() {
    const text = inputText.value.trim();
    
    if (!text) {
        showNotification('❌ Mohon masukkan teks terlebih dahulu!', 'error');
        inputText.focus();
        return;
    }
    
    // Show loading
    loadingContainer.style.display = 'block';
    outputSection.style.display = 'none';
    processBtn.disabled = true;
    startTime = performance.now();
    
    try {
        const result = await quillbotAPI.paraphrase(text, currentStyle);
        currentResult = result;
        
        const endTime = performance.now();
        const processTime = (endTime - startTime).toFixed(0);
        
        if (result.success) {
            displayResult(result, processTime);
            showNotification('✅ Paraphrase berhasil!', 'success');
        } else {
            showNotification(`⚠️ ${result.error || 'Terjadi kesalahan'}`, 'error');
            displayResult(result, processTime);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Gagal memproses. Coba lagi!', 'error');
    } finally {
        loadingContainer.style.display = 'none';
        processBtn.disabled = false;
    }
}

// Display result
function displayResult(result, processTime) {
    originalTextEl.textContent = result.original;
    paraphrasedTextEl.textContent = result.paraphrased;
    processTimeEl.textContent = `${processTime}ms`;
    confidenceScoreEl.textContent = `${Math.round(result.confidence * 100)}%`;
    engineVersionEl.textContent = result.engine || 'Neural v4.0';
    
    outputSection.style.display = 'block';
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Copy to clipboard
async function copyToClipboard() {
    if (!currentResult) return;
    
    const textToCopy = `Original: ${currentResult.original}\n\nParaphrased: ${currentResult.paraphrased}`;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showNotification('📋 Teks berhasil disalin!', 'success');
        
        // Animation effect
        copyBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            copyBtn.style.transform = '';
        }, 200);
    } catch (err) {
        showNotification('❌ Gagal menyalin teks', 'error');
    }
}

// Share result
async function shareResult() {
    if (!currentResult) return;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Mwehehe AI - Hasil Paraphrase',
                text: currentResult.paraphrased
            });
            showNotification('✨ Berhasil dibagikan!', 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                showNotification('⚠️ Gagal membagikan', 'error');
            }
        }
    } else {
        copyToClipboard();
        showNotification('💡 Salin manual untuk berbagi', 'info');
    }
}

// Text to speech
function textToSpeech() {
    if (!currentResult) return;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentResult.paraphrased);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        
        showNotification('🔊 Membacakan hasil...', 'info');
    } else {
        showNotification('⚠️ Browser tidak support Text-to-Speech', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : type === 'error' ? 'rgba(255, 0, 102, 0.9)' : 'rgba(0, 212, 255, 0.9)'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 14px;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
