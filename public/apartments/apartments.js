/**
 * Apartments Page - Shows ALL apartments including on-hold
 */

let allApartments = [];
let currentFilter = 'all';
let searchQuery = '';
let sortBy = 'default';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
    initMobileMenu();
    await loadApartments();
    initFilters();
    initSearch();
    initSort();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ---- LOAD APARTMENTS ----
async function loadApartments() {
    try {
        // Fetch ALL apartments including on-hold ones
        const response = await window.lekkirStaysAPI.request('/apartments?all=true');

        if (response.success && response.apartments) {
            allApartments = response.apartments;
        } else {
            allApartments = [];
        }
    } catch (error) {
        console.error('Error loading apartments:', error);
        allApartments = [];
    }

    renderApartments();
}

// ---- RENDER ----
function renderApartments() {
    const grid = document.getElementById('apartmentsGrid');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');

    // Hide loading
    if (loadingState) loadingState.style.display = 'none';

    // Filter
    let filtered = allApartments.filter(apt => {
        // Filter tab
        if (currentFilter === 'available' && apt.onHold) return false;
        if (currentFilter === 'on_hold' && !apt.onHold) return false;

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchName = apt.name?.toLowerCase().includes(q);
            const matchLocation = apt.location?.toLowerCase().includes(q);
            if (!matchName && !matchLocation) return false;
        }

        return true;
    });

    // Sort
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === 'guests') {
        filtered.sort((a, b) => b.maxGuests - a.maxGuests);
    } else if (sortBy === 'bedrooms') {
        filtered.sort((a, b) => b.bedrooms - a.bedrooms);
    }

    // Update count
    const total = allApartments.length;
    const available = allApartments.filter(a => !a.onHold).length;
    const onHold = allApartments.filter(a => a.onHold).length;
    resultsCount.innerHTML = `
        Showing <strong>${filtered.length}</strong> of <strong>${total}</strong> apartments
        &nbsp;·&nbsp; <span style="color:#10B981">${available} available</span>
        &nbsp;·&nbsp; <span style="color:#F59E0B">${onHold} coming soon</span>
    `;

    // Empty state
    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    emptyState.style.display = 'none';

    // Render cards
    grid.innerHTML = filtered.map((apt, i) => createCard(apt, i)).join('');

    // Animate in
    setTimeout(() => {
        document.querySelectorAll('.apt-card').forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, i * 60);
        });
    }, 50);

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ---- CREATE CARD ----
function createCard(apt, index) {
    const image = apt.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
    const price = apt.pricePerNight?.toLocaleString('en-NG') || '0';
    const bedrooms = apt.bedrooms === 0 ? 'Studio' : `${apt.bedrooms} bed${apt.bedrooms > 1 ? 's' : ''}`;
    const isOnHold = apt.onHold;

    const holdReasonHtml = isOnHold && apt.holdReason ? `
        <div class="hold-reason">
            <i data-lucide="info"></i>
            <span>${apt.holdReason}</span>
        </div>
    ` : isOnHold ? `
        <div class="hold-reason">
            <i data-lucide="info"></i>
            <span>Temporarily unavailable</span>
        </div>
    ` : '';

    const holdOverlay = isOnHold ? `
        <div class="hold-overlay">
            <span class="hold-overlay-text">Coming Soon</span>
        </div>
    ` : '';

    const featuredBadge = apt.featured && !isOnHold ? `<span class="featured-badge">Featured</span>` : '';

    const viewBtn = isOnHold
        ? `<a href="../listings/listing.html?id=${apt.id}" class="view-btn on-hold">
               <i data-lucide="eye"></i> View Details
           </a>`
        : `<a href="../listings/listing.html?id=${apt.id}" class="view-btn available">
               <i data-lucide="arrow-right"></i> View Details
           </a>`;

    return `
        <div class="apt-card ${isOnHold ? 'on-hold' : ''}">
            <div class="card-image">
                <img src="${image}" alt="${apt.name}" loading="lazy">
                <span class="status-badge ${isOnHold ? 'on-hold' : 'available'}">
                    ${isOnHold ? 'Coming Soon' : 'Available'}
                </span>
                ${featuredBadge}
                ${holdOverlay}
            </div>
            <div class="card-body">
                <div class="card-location">
                    <i data-lucide="map-pin"></i>
                    <span>${apt.location}</span>
                </div>
                <h3 class="card-title">${apt.name}</h3>
                <div class="card-specs">
                    <div class="spec-item">
                        <i data-lucide="users"></i>
                        <span>${apt.maxGuests} guests</span>
                    </div>
                    <div class="spec-item">
                        <i data-lucide="bed"></i>
                        <span>${bedrooms}</span>
                    </div>
                    <div class="spec-item">
                        <i data-lucide="bath"></i>
                        <span>${apt.bathrooms} bath</span>
                    </div>
                </div>
                ${holdReasonHtml}
                <div class="card-footer">
                    <div class="card-price">
                        <span class="price-amount">₦${price}</span>
                        <span class="price-label">per night</span>
                    </div>
                    ${viewBtn}
                </div>
            </div>
        </div>
    `;
}

// ---- FILTERS ----
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderApartments();
        });
    });
}

// ---- SEARCH ----
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            searchQuery = input.value.trim();
            renderApartments();
        }, 300);
    });
}

// ---- SORT ----
function initSort() {
    const select = document.getElementById('sortSelect');
    if (!select) return;
    select.addEventListener('change', () => {
        sortBy = select.value;
        renderApartments();
    });
}

// ---- MOBILE MENU ----
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
}
