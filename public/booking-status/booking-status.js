/**
 * Booking Status Page
 * Allows guests to look up their booking by reference or phone number
 */

let activeTab = 'ref';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSearch();
    checkURLParams();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${activeTab}`).classList.add('active');
            document.getElementById('searchError').style.display = 'none';
        });
    });
}

function initSearch() {
    document.getElementById('searchBtn').addEventListener('click', doSearch);
    document.getElementById('refInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    document.getElementById('phoneInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        document.getElementById('refInput').value = ref;
        doSearch();
    }
}

async function doSearch() {
    const errorEl = document.getElementById('searchError');
    errorEl.style.display = 'none';

    let ref = '', phone = '';
    if (activeTab === 'ref') {
        ref = document.getElementById('refInput').value.trim();
        if (!ref) { showError('Please enter your booking reference'); return; }
    } else {
        phone = document.getElementById('phoneInput').value.trim();
        if (!phone) { showError('Please enter your phone number'); return; }
    }

    showLoading();

    try {
        const params = new URLSearchParams();
        if (ref) params.set('ref', ref);
        if (phone) params.set('phone', phone);

        const response = await window.lekkirStaysAPI.request(`/bookings/lookup?${params}`);

        if (response.success && response.bookings?.length > 0) {
            showResults(response.bookings);
        } else {
            hideLoading();
            showError(response.error || 'No booking found. Please check your reference or phone number.');
        }
    } catch (error) {
        hideLoading();
        showError('Unable to look up booking. Please try again.');
    }
}

function showLoading() {
    document.getElementById('searchCard').style.display = 'none';
    document.getElementById('loadingCard').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
}

function hideLoading() {
    document.getElementById('searchCard').style.display = 'block';
    document.getElementById('loadingCard').style.display = 'none';
}

function showError(msg) {
    const el = document.getElementById('searchError');
    el.innerHTML = `<i data-lucide="alert-circle"></i> ${msg}`;
    el.style.display = 'flex';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showResults(bookings) {
    document.getElementById('loadingCard').style.display = 'none';
    document.getElementById('searchCard').style.display = 'none';

    const section = document.getElementById('resultsSection');
    section.style.display = 'block';
    section.innerHTML = `
        <button class="search-again-btn" id="searchAgainBtn">
            <i data-lucide="arrow-left"></i>
            Search again
        </button>
        ${bookings.map(b => renderBookingCard(b)).join('')}
    `;

    document.getElementById('searchAgainBtn').addEventListener('click', () => {
        section.style.display = 'none';
        document.getElementById('searchCard').style.display = 'block';
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderBookingCard(b) {
    const statusConfig = {
        pending:         { label: 'Pending Review',    class: 'status-pending',         icon: 'clock',        step: 0 },
        confirmed:       { label: 'Confirmed',          class: 'status-confirmed',        icon: 'check-circle', step: 1 },
        payment_pending: { label: 'Awaiting Payment',   class: 'status-payment_pending',  icon: 'credit-card',  step: 2 },
        paid:            { label: 'Paid & Confirmed',   class: 'status-paid',             icon: 'star',         step: 3 },
        cancelled:       { label: 'Cancelled',          class: 'status-cancelled',        icon: 'x-circle',     step: -1 },
        declined:        { label: 'Declined',           class: 'status-declined',         icon: 'x-circle',     step: -1 },
    };

    const cfg = statusConfig[b.status] || statusConfig.pending;
    const nights = Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000);
    const checkIn = new Date(b.checkIn).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    const checkOut = new Date(b.checkOut).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

    const steps = [
        { label: 'Request\nReceived', done: cfg.step >= 0, active: cfg.step === 0 },
        { label: 'Booking\nConfirmed', done: cfg.step >= 1, active: cfg.step === 1 },
        { label: 'Payment\nSent', done: cfg.step >= 2, active: cfg.step === 2 },
        { label: 'Fully\nPaid', done: cfg.step >= 3, active: cfg.step === 3 },
    ];

    const timelineHtml = b.status !== 'cancelled' && b.status !== 'declined' ? `
        <div class="status-timeline">
            <h3>Booking Progress</h3>
            <div class="timeline">
                ${steps.map((s, i) => `
                    <div class="timeline-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}">
                        <div class="step-dot">${s.done && !s.active ? '✓' : i + 1}</div>
                        <div class="step-label">${s.label.replace('\n', '<br>')}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const statusMsg = getStatusMessage(b);

    const imageHtml = b.apartmentImage
        ? `<img src="${b.apartmentImage}" alt="${b.apartmentName}" class="result-card-image">`
        : '';

    return `
        <div class="result-card">
            ${imageHtml}
            <div class="result-card-body">
                <div class="result-ref">
                    <div>
                        <div class="result-ref-label">Booking Reference</div>
                        <div class="result-ref-value">${b.bookingRef}</div>
                    </div>
                    <span class="status-badge ${cfg.class}">
                        <i data-lucide="${cfg.icon}"></i>
                        ${cfg.label}
                    </span>
                </div>

                <div class="booking-details-grid">
                    <div class="detail-item">
                        <label>Apartment</label>
                        <p>${b.apartmentName}</p>
                    </div>
                    <div class="detail-item">
                        <label>Location</label>
                        <p>${b.apartmentLocation || '—'}</p>
                    </div>
                    <div class="detail-item">
                        <label>Check-in</label>
                        <p>${checkIn}</p>
                    </div>
                    <div class="detail-item">
                        <label>Check-out</label>
                        <p>${checkOut}</p>
                    </div>
                    <div class="detail-item">
                        <label>Nights</label>
                        <p>${nights}</p>
                    </div>
                    <div class="detail-item">
                        <label>Guests</label>
                        <p>${b.guests}</p>
                    </div>
                    <div class="detail-item">
                        <label>Total Amount</label>
                        <p>₦${b.totalPrice.toLocaleString('en-NG')}</p>
                    </div>
                    <div class="detail-item">
                        <label>Guest Name</label>
                        <p>${b.guestName}</p>
                    </div>
                </div>

                ${timelineHtml}
                ${statusMsg}

                <div class="result-actions">
                    <a href="../index.html#contact" class="btn-secondary">
                        <i data-lucide="message-circle"></i>
                        Contact Us
                    </a>
                    <a href="../apartments/apartments.html" class="btn-primary">
                        <i data-lucide="home"></i>
                        Browse Apartments
                    </a>
                </div>
            </div>
        </div>
    `;
}

function getStatusMessage(b) {
    const checkIn = new Date(b.checkIn).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    switch (b.status) {
        case 'pending':
            return `<div class="status-message warning"><i data-lucide="clock"></i><span>Your booking request is under review. Our team will confirm and send payment details to your WhatsApp within 2 hours.</span></div>`;
        case 'confirmed':
            return `<div class="status-message info"><i data-lucide="message-circle"></i><span>Your booking is confirmed! Payment details have been sent to your WhatsApp. Please complete payment to secure your reservation.</span></div>`;
        case 'payment_pending':
            return `<div class="status-message warning"><i data-lucide="credit-card"></i><span>Payment details have been sent to your WhatsApp. Please complete payment as soon as possible to avoid cancellation.</span></div>`;
        case 'paid':
            return `<div class="status-message success"><i data-lucide="check-circle"></i><span>🎉 Your booking is fully confirmed and paid! We look forward to hosting you on <strong>${checkIn}</strong>. Check-in instructions will be sent 24 hours before arrival.</span></div>`;
        case 'cancelled':
            return `<div class="status-message warning"><i data-lucide="x-circle"></i><span>This booking has been cancelled. Browse our available apartments to make a new reservation.</span></div>`;
        case 'declined':
            return `<div class="status-message warning"><i data-lucide="x-circle"></i><span>This booking request was declined. Please contact us for more information or try different dates.</span></div>`;
        default:
            return '';
    }
}
