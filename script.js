// وضعیت اولیه
let volume = 50;
let recognition;
let isListening = false;

// عناصر DOM
const micStatus = document.getElementById('micStatus');
const statusText = document.getElementById('statusText');
const volumeLevel = document.getElementById('volumeLevel');
const volumeValue = document.getElementById('volumeValue');
const commandLog = document.getElementById('commandLog');

// تنظیمات اولیه
document.addEventListener('DOMContentLoaded', () => {
    updateVolumeDisplay();
    initSpeechRecognition();
});

// مقداردهی اولیه تشخیص گفتار
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        statusText.textContent = 'مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند';
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        updateStatus('در حال گوش دادن...', true);
    };
    
    recognition.onerror = (event) => {
        console.error('خطای تشخیص گفتار:', event.error);
        updateStatus(`خطا: ${event.error}`, false);
        // تلاش مجدد پس از خطا
        setTimeout(() => {
            if (isListening) recognition.start();
        }, 1000);
    };
    
    recognition.onend = () => {
        if (isListening) {
            recognition.start(); // شروع مجدد گوش دادن
        }
    };
    
    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        
        processVoiceCommand(transcript);
    };
    
    // درخواست مجوز میکروفون و شروع تشخیص گفتار
    requestMicrophonePermission();
}

// درخواست دسترسی به میکروفون
function requestMicrophonePermission() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            recognition.start();
        })
        .catch(err => {
            console.error('خطای دسترسی به میکروفون:', err);
            updateStatus('دسترسی به میکروفون داده نشد', false);
            micStatus.style.backgroundColor = '#ff4757';
        });
}

// پردازش دستورات صوتی
function processVoiceCommand(command) {
    logCommand(command);
    
    if (command.includes('up')) {
        adjustVolume(true);
        highlightCommand('up');
    } else if (command.includes('down')) {
        adjustVolume(false);
        highlightCommand('down');
    }
}

// تنظیم صدا
function adjustVolume(increase) {
    const changeAmount = 10;
    
    if (increase) {
        volume = Math.min(100, volume + changeAmount);
    } else {
        volume = Math.max(0, volume - changeAmount);
    }
    
    updateVolumeDisplay();
    
    // نمایش انیمیشن تغییر صدا
    volumeLevel.classList.add('highlight');
    setTimeout(() => volumeLevel.classList.remove('highlight'), 1000);
    
    // در محیط واقعی، اینجا کد کنترل صدا اجرا می‌شد
    console.log(`صدای دستگاه تنظیم شد به: ${volume}%`);
}

// به‌روزرسانی نمایش صدا
function updateVolumeDisplay() {
    volumeLevel.style.width = `${volume}%`;
    volumeValue.textContent = `${volume}%`;
}

// به‌روزرسانی وضعیت
function updateStatus(text, isActive) {
    statusText.textContent = text;
    micStatus.style.backgroundColor = isActive ? '#2ed573' : '#ff4757';
    
    if (isActive) {
        micStatus.parentElement.classList.add('status-listening');
    } else {
        micStatus.parentElement.classList.remove('status-listening');
    }
}

// ثبت دستور در لاگ
function logCommand(command) {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');
    
    const time = new Date().toLocaleTimeString();
    logEntry.innerHTML = `<span class="time">${time}:</span> "${command}"`;
    
    commandLog.prepend(logEntry);
    
    // حفظ تعداد لاگ‌ها
    if (commandLog.children.length > 10) {
        commandLog.removeChild(commandLog.lastChild);
    }
}

// هایلایت دستور در لیست دستورات
function highlightCommand(cmd) {
    const commands = document.querySelectorAll('.instructions li');
    commands.forEach(li => {
        if (li.textContent.includes(cmd)) {
            li.classList.add('highlight');
            setTimeout(() => li.classList.remove('highlight'), 1500);
        }
    });
}

// توقف تشخیص گفتار هنگام بسته شدن صفحه
window.addEventListener('beforeunload', () => {
    if (recognition) {
        isListening = false;
        recognition.stop();
    }
});