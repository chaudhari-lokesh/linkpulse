// LinkPulse Interactive Client Scripts

function copyToClipboard(text, message = 'Copied to clipboard!') {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(message, 'success');
        }).catch(err => {
            fallbackCopy(text, message);
        });
    } else {
        fallbackCopy(text, message);
    }
}

function fallbackCopy(text, message) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast(message, 'success');
    } catch (err) {
        showToast('Failed to copy link', 'error');
    }
    document.body.removeChild(textArea);
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;

    if (type === 'success') toast.style.borderLeftColor = 'var(--success)';
    if (type === 'error') toast.style.borderLeftColor = 'var(--error)';

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal handling
function openQrModal(qrSrc, title, shortUrl) {
    const overlay = document.getElementById('qrModal');
    if (!overlay) return;
    document.getElementById('modalQrImage').src = qrSrc;
    document.getElementById('modalTitle').innerText = title || 'Short Link QR Code';
    document.getElementById('modalShortUrl').innerText = shortUrl;
    document.getElementById('downloadQrBtn').href = qrSrc;
    overlay.classList.add('active');
}

function closeQrModal() {
    const overlay = document.getElementById('qrModal');
    if (overlay) overlay.classList.remove('active');
}

// Live Search Filter for Dashboard Table
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#urlsTable tbody tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});
