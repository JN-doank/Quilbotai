// DOM Elements
const videoUrl = document.getElementById('videoUrl');
const processBtn = document.getElementById('processBtn');
const pasteBtn = document.getElementById('pasteBtn');
const loadingContainer = document.getElementById('loadingContainer');
const outputSection = document.getElementById('outputSection');
const historySection = document.getElementById('historySection');
const loadingStep = document.getElementById('loadingStep');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const previewBtn = document.getElementById('previewBtn');
const clipVideo = document.getElementById('clipVideo');
const videoSource = document.getElementById('videoSource');
const clipDuration = document.getElementById('clipDuration');
const aiConfidence = document.getElementById('aiConfidence');
const fileSize = document.getElementById('fileSize');
const processTime = document.getElementById('processTime');
const timelineMarker = document.getElementById('timelineMarker');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyList = document.getElementById('historyList');
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappPopup = document.getElementById('whatsappPopup');
const confirmWhatsapp = document.getElementById('confirmWhatsapp');
const closePopup = document.getElementById('closePopup');

// State
let currentDuration = 30;
let currentMode = 'auto';
let currentFormat = 'mp4';
let currentResult = null;
let startTime = null;
let history = [];

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem('aiClipperHistory');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('aiClipperHistory', JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

// Render history list
function renderHistory() {
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-folder-open"></i>
                <p>Belum ada riwayat clipping</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div class="history-info">
                <div class="history-url">${item.url.substring(0, 50)}...</div>
                <div class="history-meta">
                    <span><i class="far fa-clock"></i> ${item.duration}s</span>
                    <span><i class="fas fa-magic"></i> ${item.mode}</span>
                    <span><i class="far fa-calendar"></i> ${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="history-btn" onclick="replayHistory(${index})" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button class="history-btn" onclick="deleteHistory(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Add to history
function addToHistory(url, duration, mode, result) {
    history.unshift({
        url: url,
        duration: duration,
        mode: mode,
        format: currentFormat,
        resultUrl: result.videoUrl,
        timestamp: Date.now()
    });
    
    if (history.length > 10) history.pop();
    saveHistory();
}

// Replay from history
window.replayHistory = function(index) {
    const item = history[index];
    if (item && item.resultUrl) {
        displayResult({
            videoUrl: item.resultUrl,
            duration: item.duration,
            fileSize: 'From history',
            confidence: 0,
            mode: item.mode,
            format: item.format,
            timeline: [25, 50, 75]
        }, 0);
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete from history
window.deleteHistory = function(index) {
    history.splice(index, 1);
    saveHistory();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeStars();
    initializeParticles();
    initializeEventListeners();
    loadHistory();
});

// Create stars background
function initializeStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    
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
    if (!canvas) return;
    
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
            ctx.fillStyle = `rgba(255, 0, 110, ${p.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Event listeners
function initializeEventListeners() {
    // Duration buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const duration = btn.dataset.duration;
            if (duration === 'custom') {
                document.getElementById('customDuration').style.display = 'block';
                currentDuration = parseInt(document.getElementById('customDurationValue').value) || 30;
            } else {
                document.getElementById('customDuration').style.display = 'none';
                currentDuration = parseInt(duration);
            }
        });
    });
    
    // Custom duration input
    const customDurationInput = document.getElementById('customDurationValue');
    if (customDurationInput) {
        customDurationInput.addEventListener('input', () => {
            currentDuration = parseInt(customDurationInput.value) || 30;
        });
    }
    
    // AI Mode buttons
    document.querySelectorAll('.ai-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ai-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
        });
    });
    
    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormat = btn.dataset.format;
        });
    });
    
    // Process button
    processBtn.addEventListener('click', processClip);
    
    // Paste button
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                videoUrl.value = text;
                showNotification('📋 URL berhasil ditempel!', 'success');
            } catch (err) {
                showNotification('❌ Gagal membaca clipboard', 'error');
            }
        });
    }
    
    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (currentResult && currentResult.videoUrl) {
                const link = document.createElement('a');
                link.href = currentResult.videoUrl;
                link.download = `clip_${Date.now()}.${currentFormat}`;
                link.click();
                showNotification('⬇️ Download dimulai!', 'success');
            }
        });
    }
    
    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (currentResult && currentResult.videoUrl) {
                if (navigator.share) {
                    navigator.share({
                        title: 'AI Auto Clipper Result',
                        text: `Clip hasil dari AI Auto Clipper (${currentDuration}s)`,
                        url: currentResult.videoUrl
                    }).catch(() => {});
                } else {
                    navigator.clipboard.writeText(currentResult.videoUrl);
                    showNotification('🔗 Link clip disalin!', 'success');
                }
            }
        });
    }
    
    // Preview button
    if (previewBtn && clipVideo) {
        previewBtn.addEventListener('click', () => {
            if (clipVideo.paused) {
                clipVideo.play();
                previewBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                clipVideo.pause();
                previewBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        clipVideo.addEventListener('ended', () => {
            previewBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    }
    
    // Clear history
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Hapus semua riwayat?')) {
                history = [];
                saveHistory();
                showNotification('🗑️ Riwayat dihapus!', 'success');
            }
        });
    }
    
    // WhatsApp button
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            whatsappPopup.style.display = 'block';
        });
    }
    
    if (confirmWhatsapp) {
        confirmWhatsapp.addEventListener('click', () => {
            window.open(WHATSAPP_CONFIG.channelUrl, '_blank');
            whatsappPopup.style.display = 'none';
            showNotification('📱 Terima kasih telah join channel!', 'success');
        });
    }
    
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            whatsappPopup.style.display = 'none';
        });
    }
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (whatsappPopup && !whatsappBtn.contains(e.target) && !whatsappPopup.contains(e.target)) {
            whatsappPopup.style.display = 'none';
        }
    });
}

// Main process function
async function processClip() {
    const url = videoUrl.value.trim();
    
    if (!url) {
        showNotification('❌ Masukkan URL video terlebih dahulu!', 'error');
        videoUrl.focus();
        return;
    }
    
    if (!autoClipperAPI.isValidUrl(url)) {
        showNotification('❌ URL tidak valid!', 'error');
        return;
    }
    
    // Show loading
    loadingContainer.style.display = 'block';
    outputSection.style.display = 'none';
    processBtn.disabled = true;
    startTime = performance.now();
    
    // Update loading steps
    const steps = [
        'Menganalisis video...',
        'Mendeteksi momen terbaik...',
        'Memproses AI detection...',
        'Memotong clip...',
        'Menyiapkan output...'
    ];
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
        if (loadingStep && stepIndex < steps.length) {
            loadingStep.textContent = steps[stepIndex];
            stepIndex++;
        }
    }, 1000);
    
    try {
        const result = await autoClipperAPI.processClip(url, {
            duration: currentDuration,
            mode: currentMode,
            format: currentFormat
        });
        
        currentResult = result;
        
        const endTime = performance.now();
        const procTime = (endTime - startTime).toFixed(0);
        
        if (result.success) {
            displayResult(result, procTime);
            addToHistory(url, currentDuration, currentMode, result);
            showNotification('✂️ Clip berhasil dibuat!', 'success');
        } else {
            showNotification(`⚠️ ${result.error || 'Gagal memproses video'}`, 'error');
            displayResult(result, procTime);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Gagal memproses. Coba lagi!', 'error');
    } finally {
        clearInterval(stepInterval);
        loadingContainer.style.display = 'none';
        processBtn.disabled = false;
    }
}

// Display result
function displayResult(result, procTime) {
    if (!result.videoUrl) return;
    
    // Update video player
    videoSource.src = result.videoUrl;
    clipVideo.load();
    
    // Update info
    clipDuration.textContent = `${result.duration} detik`;
    aiConfidence.textContent = `${Math.round((result.confidence || 0.85) * 100)}%`;
    fileSize.textContent = result.fileSize || '~5 MB';
    processTime.textContent = `${procTime}ms`;
    
    // Update timeline
    if (result.timeline && timelineMarker) {
        const maxTimeline = 100;
        const avgPosition = result.timeline.reduce((a,b) => a + b, 0) / result.timeline.length;
        timelineMarker.style.width = `${avgPosition}%`;
    }
    
    outputSection.style.display = 'block';
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
