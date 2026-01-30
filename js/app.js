console.log("✅ 3. app.js caricato");

const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');
window.pendingMaps = []; 

const getGlobalFooter = () => ``;

// --- 1. SETUP LINGUA & HEADER ---
function setupHeaderElements() {
    const header = document.querySelector('header');
    
    // 1. PULIZIA
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();
    const oldShare = document.getElementById('header-btn-share');
    if (oldShare) oldShare.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    // 2. LOGICA
    if (window.currentViewName !== 'home') return; 

    // 3. COSTRUZIONE
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions animate-fade'; 
    actionsContainer.id = 'header-btn-lang'; 
    Object.assign(actionsContainer.style, { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: '20' });

    const currFlag = window.AVAILABLE_LANGS.find(l => l.code === window.currentLang).flag;
    const currCode = window.currentLang.toUpperCase();

    const langSelector = document.createElement('div');
    langSelector.className = 'lang-selector';
    langSelector.innerHTML = `
        <button class="current-lang-btn" onclick="toggleLangDropdown(event)">
            <span class="lang-flag">${currFlag}</span> ${currCode} ▾
        </button>
        <div class="lang-dropdown" id="lang-dropdown" style="left: 0; right: auto;">
            ${window.AVAILABLE_LANGS.map(l => `
                <button class="lang-opt ${l.code === window.currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                    <span class="lang-flag">${l.flag}</span> ${l.label}
                </button>
            `).join('')}
        </div>`;
    actionsContainer.appendChild(langSelector);
}

function updateNavBar() {
    const labels = document.querySelectorAll('.nav-label');
    if (labels.length >= 4) {
        labels[0].innerText = window.t('nav_villages'); 
        labels[1].innerText = window.t('nav_food');
        labels[2].innerText = window.t('nav_outdoor');
        labels[3].innerText = window.t('nav_services'); 
    }
}

// Funzione Globale per cambiare lingua
window.changeLanguage = function(langCode) {
    window.currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    
    setupHeaderElements(); 
    updateNavBar(); 
    
    const activeNav = document.querySelector('.nav-item.active');
    if(activeNav) {
        const onclickAttr = activeNav.getAttribute('onclick');
        const viewMatch = onclickAttr.match(/switchView\('([^']+)'/);
        if(viewMatch) switchView(viewMatch[1], activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
};

window.toggleLangDropdown = function(event) {
    event.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.toggle('show');
};

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});

// --- 2. NAVIGAZIONE PRINCIPALE ---
window.switchView = async function(view, el) {
    if (!content) return;
    window.currentViewName = view; 
    document.body.classList.remove('is-home');

    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) { globalFilterBtn.remove(); }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    else if (view === 'home') {
         const homeBtn = document.querySelector('.nav-item[onclick*="home"]');
         if(homeBtn) homeBtn.classList.add('active');
    }

    try {
        if (view === 'home') renderHome();
        else if (view === 'cibo') {
            renderSubMenu([
                { label: window.t('menu_rest'), table: "Ristoranti" },
                { label: window.t('menu_prod'), table: "Prodotti" },
                { label: window.t('menu_wine'), table: "Vini" } 
            ], 'Ristoranti');
        } else if (view === 'outdoor') {
            renderSubMenu([
                { label: window.t('menu_trail'), table: "Sentieri" },
                { label: window.t('menu_beach'), table: "Spiagge" },
                { label: window.t('menu_monu'), table: "Attrazioni" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') await renderServicesGrid();
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: window.t('menu_map'), table: "Mappe" }], 'Mappe');
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">${window.t('error')}: ${err.message}</div>`;
    }
};

// --- RENDER HOME ---
function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    document.body.classList.add('is-home');

    content.innerHTML = `
    <div class="home-hero-fullscreen animate-fade">
        <img src="${bgImage}" alt="Cinque Terre">
    </div>

    <div class="welcome-overlay">
        <div class="welcome-content">
            
            <h1></h1>
            
            <div class="welcome-divider"></div>
            
            <div class="lang-grid">
                ${window.AVAILABLE_LANGS.map(l => `
                    <button class="lang-tile ${l.code === window.currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                        <span class="lang-flag-large">${l.flag}</span>
                        <span class="lang-label">${l.label}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    </div>`;
}

// ============================================================
// 1. RENDER MENU
// ============================================================
function renderSubMenu(options, defaultTable) {
    let menuHtml = `
    <div class="nav-sticky-header animate-fade">
        <div class="nav-scroll-container">
            ${options.map(opt => `
                <button class="btn-3d" onclick="loadTableData('${opt.table}', this)">
                    ${opt.label}
                </button>
            `).join('')}
        </div>
    </div>
    
    <div id="sub-content"></div>`;
    
    content.innerHTML = menuHtml;
    
    const firstBtn = content.querySelector('.btn-3d');
    if (firstBtn) {
        loadTableData(defaultTable, firstBtn);
    }
}

window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    if (!window.appCache[tableName]) {
        subContent.innerHTML = `<div class="loader" style="margin-top:20px;">${window.t('loading')}...</div>`;
    }
    
    if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe></div>`;
        return; 
    }

    // --- LOGICA CACHE INTELLIGENTE ---
    let data;
    
    if (window.appCache[tableName]) {
        console.log(`⚡ Cache hit: recupero dati per ${tableName} dalla memoria.`);
        data = window.appCache[tableName];
    } 
    else {
        console.log(`🌐 Cache miss: scarico dati per ${tableName} dal server...`);
        const response = await window.supabaseClient.from(tableName).select('*');
        
        if (response.error) { 
            subContent.innerHTML = `<p class="error-msg">${response.error.message}</p>`; 
            return; 
        }
        
        data = response.data;
        window.appCache[tableName] = data; 
    }

    window.currentTableData = data; 

    // 6. Routing Renderers
    if (tableName === 'Vini') {
        renderGenericFilterableView(data, 'Tipo', subContent, window.vinoRenderer);
    }
    else if (tableName === 'Spiagge') {
        renderGenericFilterableView(data, 'Paesi', subContent, window.spiaggiaRenderer);
    }
    else if (tableName === 'Prodotti') {
        let html = '<div class="list-container animate-fade" style="padding-bottom:20px;">'; 
        data.forEach(p => { html += window.prodottoRenderer(p); });
        subContent.innerHTML = html + '</div>';
    }
    else if (tableName === 'Trasporti') {
        window.tempTransportData = data;
        let html = '<div class="list-container animate-fade">';
        data.forEach((t, index) => {
            const nomeDisplay = window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', '${index}')"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy"></div>`;
        });
        subContent.innerHTML = html + '</div>';
    }
    else if (tableName === 'Attrazioni') { 
        const culturaConfig = {
            primary: { key: 'Paese', title: '📍 ' + (window.t('nav_villages') || 'Borgo'), customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] },
            secondary: { key: 'Label', title: '🏷️ Categoria' }
        };
        renderDoubleFilterView(data, culturaConfig, subContent, window.attrazioniRenderer); 
    }
    else if (tableName === 'Ristoranti') { renderGenericFilterableView(data, 'Paesi', subContent, window.ristoranteRenderer); }
    else if (tableName === 'Sentieri') { renderGenericFilterableView(data, 'difficolta_cai', subContent, window.sentieroRenderer); }
    else if (tableName === 'Farmacie') { renderGenericFilterableView(data, 'Paesi', subContent, window.farmacieRenderer); } 
    else if (tableName === 'Numeri_utili') { renderGenericFilterableView(data, 'Comune', subContent, window.numeriUtiliRenderer); }
};

/* ============================================================
   SWIPE TRA LE PAGINE
   ============================================================ */

const minSwipeDistance = 50; 
const maxVerticalDistance = 100; 
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    if (e.target.closest('.leaflet-container') || 
        e.target.closest('.map-container') || 
        e.target.closest('.swiper-container') ||      
        e.target.closest('.nav-scroll-container') ||  
        e.target.closest('.nav-sticky-header') ||     
        e.target.closest('.modal-content')) {         
        
        touchStartX = null; 
        return;
    }

    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, {passive: true});

document.addEventListener('touchend', e => {
    if (touchStartX === null) return; 

    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    handlePageSwipe();
}, {passive: true});

function handlePageSwipe() {
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;
    
    if (Math.abs(xDiff) < minSwipeDistance) return;
    
    if (Math.abs(yDiff) > maxVerticalDistance) return;
    if (Math.abs(yDiff) > Math.abs(xDiff)) return;

    const tabs = document.querySelectorAll('.nav-chip, .btn-3d');
    
    if (tabs.length === 0) return;

    let activeIndex = -1;
    tabs.forEach((tab, index) => {
        if (tab.classList.contains('active-chip') || tab.classList.contains('active-3d')) {
            activeIndex = index;
        }
    });

    if (activeIndex === -1) return; 

    if (xDiff < 0) {
        if (activeIndex < tabs.length - 1) {
            tabs[activeIndex + 1].click();
        }
    } else {
        if (activeIndex > 0) {
            tabs[activeIndex - 1].click();
        }
    }
    
    touchStartX = null;
    touchStartY = null;
}

/* ============================================================
   FUNZIONE RENDER SERVIZI (Statica - No Supabase)
   ============================================================ */
window.renderServicesGrid = async function() {
    console.log("🔘 Avvio renderServicesGrid (Modalità Statica)...");
    const targetEl = document.getElementById('app-content');
    if (!targetEl) return;

    // 1. Definiamo i mezzi manualmente con le chiavi di traduzione
    const staticTransports = [
        { id: 'train', labelKey: 'label_train', icon: 'train', type: 'transport' },
        { id: 'ferry', labelKey: 'label_ferry', icon: 'directions_boat', type: 'transport' },
        { id: 'bus',   labelKey: 'label_bus',   icon: 'directions_bus', type: 'transport' }
    ];

    let html = '<div class="services-grid-modern animate-fade" style="padding-bottom:100px;">';

    // 2. Loop Mezzi di Trasporto
    staticTransports.forEach(t => {
        const translatedLabel = window.t(t.labelKey); 
        html += `
        <div class="service-widget" onclick="openModal('${t.type}', '${t.id}')">
            <span class="material-icons widget-icon">${t.icon}</span>
            <span class="widget-label">${translatedLabel}</span>
        </div>`;
    });

    // 3. Widget Fissi
    const labelNum = window.t('menu_num');
    const labelPharm = window.t('menu_pharm');
    const labelLegal = window.t('menu_legal');

    html += `
    <div class="service-widget" onclick="renderSimpleList('Numeri_utili')">
        <span class="material-icons widget-icon">phonelink_ring</span>
        <span class="widget-label">${labelNum}</span>
    </div>
    
    <div class="service-widget" onclick="renderSimpleList('Farmacie')">
        <span class="material-icons widget-icon">medical_services</span>
        <span class="widget-label">${labelPharm}</span>
    </div>

    <div class="service-widget" onclick="renderLegalPage()">
        <span class="material-icons widget-icon">policy</span>
        <span class="widget-label">${labelLegal}</span>
    </div>
    
    </div>`; 

    targetEl.innerHTML = html;
    console.log("✅ Servizi caricati.");
};

// Funzione Liste Semplici (Farmacie/Numeri)
window.renderSimpleList = function(tableName) {
    const targetEl = document.getElementById('app-content');
    if (!targetEl) return;
    
    const cleanTitle = tableName.replace('_', ' ');
    
    targetEl.innerHTML = `
    <div class="header-simple-list animate-fade">
        <button onclick="renderServicesGrid()" class="btn-back-custom">
            <span class="material-icons">arrow_back</span>
        </button>
        <h2>${cleanTitle}</h2>
    </div>
    <div id="sub-content">
        <div class="loader">Caricamento...</div>
    </div>`;

    if(window.loadTableData) {
        window.loadTableData(tableName, null);
    } else {
        console.error("❌ loadTableData non trovata! Controlla app.js");
    }
};

window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; }
};

// --- LOGICA FILTRI (Bottom Sheet) ---
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');

    const oldSheet = document.getElementById('filter-sheet');
    if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldBtn = document.getElementById('filter-toggle-btn');
    if (oldBtn) oldBtn.remove();

    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile"];
    
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a), indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const overlay = document.createElement('div');
    overlay.id = 'filter-overlay';
    overlay.className = 'sheet-overlay';
    
    const sheet = document.createElement('div');
    sheet.id = 'filter-sheet';
    sheet.className = 'bottom-sheet';
    sheet.innerHTML = `
        <div class="sheet-header">
            <div class="sheet-title">${window.t('filter_title')}</div> 
            <div class="material-icons sheet-close" onclick="closeFilterSheet()">close</div>
        </div>
        <div class="filter-grid" id="sheet-options"></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    const optionsContainer = sheet.querySelector('#sheet-options');
    let activeTag = 'Tutti'; 

    uniqueTags.forEach(tag => {
        const chip = document.createElement('button');
        chip.className = 'sheet-chip';
        if (tag === 'Tutti') chip.classList.add('active-filter');
        
        chip.innerText = (tag === 'Tutti') ? window.t('filter_all') : tag; 

        chip.onclick = () => {
            document.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active-filter'));
            chip.classList.add('active-filter');
            activeTag = tag;
            
            const filtered = tag === 'Tutti' ? allData : allData.filter(item => {
                const valDB = item[filterKey] ? item[filterKey].trim() : '';
                return valDB.includes(tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza'));
            });

            updateList(filtered);
            closeFilterSheet();
        };
        optionsContainer.appendChild(chip);
    });

    const filterBtn = document.createElement('button');
    filterBtn.id = 'filter-toggle-btn';
    filterBtn.innerHTML = '<span class="material-icons">filter_list</span>';
    filterBtn.style.display = 'block'; 
    document.body.appendChild(filterBtn);

    window.openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };
    window.closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };

    filterBtn.onclick = window.openFilterSheet;
    overlay.onclick = window.closeFilterSheet;

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="...">${window.t('no_results')}</p>`; 
        } else {
            listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
            
            setTimeout(() => {
                if(window.initPendingMaps) window.initPendingMaps();
            }, 100);
        }
    }
    
    updateList(allData);
}

// --- LOGICA FILTRO DOPPIO ---
function renderDoubleFilterView(allData, filtersConfig, container, cardRenderer) {
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');

    const oldSheet = document.getElementById('filter-sheet');
    if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldBtn = document.getElementById('filter-toggle-btn');
    if (oldBtn) oldBtn.remove();

    const getUniqueValues = (key, customOrder = []) => {
        const raw = allData.map(i => window.dbCol(i, key)).filter(x => x).map(x => x.trim());
        let unique = [...new Set(raw)];
        if (customOrder && customOrder.length > 0) {
            return unique.sort((a, b) => {
                const idxA = customOrder.indexOf(a);
                const idxB = customOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });
        } else {
            return unique.sort();
        }
    };

    const values1 = getUniqueValues(filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(filtersConfig.secondary.key, filtersConfig.secondary.customOrder);

    let activeVal1 = 'Tutti';
    let activeVal2 = 'Tutti';

    const overlay = document.createElement('div');
    overlay.className = 'sheet-overlay';
    
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet';
    
    const title1 = filtersConfig.primary.title || window.t('filter_village');
    const title2 = filtersConfig.secondary.title || window.t('filter_cat');

    sheet.innerHTML = `
        <div class="sheet-header">
            <div class="sheet-title">${window.t('filter_title')}</div>
            <div class="material-icons sheet-close" onclick="closeFilterSheet()">close</div>
        </div>
        
        <div class="filter-section-title">${title1}</div>
        <div class="filter-grid" id="section-1-options"></div>

        <div class="filter-section-title" style="margin-top: 25px;">${title2}</div>
        <div class="filter-grid" id="section-2-options"></div>

        <button class="btn-apply-filters" onclick="closeFilterSheet()">
            ${window.t('show_results')}
        </button>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    function renderChips() {
        const c1 = sheet.querySelector('#section-1-options');
        c1.innerHTML = '';
        c1.appendChild(createChip(window.t('filter_all'), activeVal1 === 'Tutti', () => { activeVal1 = 'Tutti'; applyFilters(); renderChips(); }));
        
        values1.forEach(v => {
            c1.appendChild(createChip(v, activeVal1 === v, () => { activeVal1 = v; applyFilters(); renderChips(); }));
        });

        const c2 = sheet.querySelector('#section-2-options');
        c2.innerHTML = '';
        c2.appendChild(createChip(window.t('filter_all'), activeVal2 === 'Tutti', () => { activeVal2 = 'Tutti'; applyFilters(); renderChips(); }));

        values2.forEach(v => {
            const label = v.charAt(0).toUpperCase() + v.slice(1); 
            c2.appendChild(createChip(label, activeVal2 === v, () => { activeVal2 = v; applyFilters(); renderChips(); }));
        });
    }

    function createChip(text, isActive, onClick) {
        const btn = document.createElement('button');
        btn.className = 'sheet-chip';
        if (isActive) btn.classList.add('active-filter');
        btn.innerText = text;
        btn.onclick = onClick;
        return btn;
    }

    function applyFilters() {
        const filtered = allData.filter(item => {
            const val1 = window.dbCol(item, filtersConfig.primary.key) || '';
            const val2 = window.dbCol(item, filtersConfig.secondary.key) || '';
            const match1 = (activeVal1 === 'Tutti') || val1.includes(activeVal1);
            const match2 = (activeVal2 === 'Tutti') || val2.toLowerCase().includes(activeVal2.toLowerCase());
            return match1 && match2;
        });
        updateList(filtered);
    }

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${window.t('no_results')}</p>`; 
        } else {
            listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        }
    }

    const filterBtn = document.createElement('button');
    filterBtn.id = 'filter-toggle-btn';
    filterBtn.innerHTML = '<span class="material-icons">filter_list</span>';
    filterBtn.style.display = 'block';
    document.body.appendChild(filterBtn);

    window.openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };
    window.closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };

    filterBtn.onclick = window.openFilterSheet;
    overlay.onclick = window.closeFilterSheet;

    renderChips();
    updateList(allData);
}

document.addEventListener('DOMContentLoaded', () => {
    window.currentViewName = 'home'; 
    setupHeaderElements(); 
    updateNavBar(); 
    switchView('home');
});

// --- FUNZIONE SITO TRENITALIA ---
window.apriTrenitalia = function() {
    window.open('https://www.trenitalia.com', '_blank');
};

// ============================================================
// FUNZIONE PER ACCENDERE LE MAPPE NELLA LISTA
// ============================================================
window.initPendingMaps = function() {
    console.log("Avvio rendering di " + window.pendingMaps.length + " mappe...");
    
    window.pendingMaps.forEach(item => {
        const container = document.getElementById(item.id);
        if (container && !container._leaflet_id) { 
            
            const map = L.map(item.id, {
                zoomControl: false,      
                scrollWheelZoom: false,  
                dragging: false,         
                attributionControl: false 
            });

            L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 16
            }).addTo(map);

            new L.GPX(item.gpx, {
                async: true,
                marker_options: {
                    startIconUrl: null, 
                    endIconUrl: null,   
                    shadowUrl: null
                },
                polyline_options: {
                    color: '#D32F2F', 
                    opacity: 1,
                    weight: 4
                }
            }).on('loaded', function(e) {
                map.fitBounds(e.target.getBounds()); 
            }).addTo(map);
        }
    });

    window.pendingMaps = [];
};

// ============================================================
// FUNZIONE GPS
// ============================================================
window.watchId = null;    
window.userMarker = null; 

window.toggleGPS = function() {
    const map = window.currentMap;
    const btn = document.getElementById('btn-gps');
    
    if (!map) return;

    if (window.watchId !== null) {
        navigator.geolocation.clearWatch(window.watchId);
        window.watchId = null;
        
        if (window.userMarker) {
            map.removeLayer(window.userMarker);
            window.userMarker = null;
        }

        btn.style.backgroundColor = '#29B6F6'; 
        btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
        return;
    }

    if (!navigator.geolocation) {
        alert("GPS non supportato dal tuo browser.");
        return;
    }

    btn.innerHTML = '<span class="material-icons spin">refresh</span> Cerco...';
    btn.style.backgroundColor = '#f39c12'; 

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    window.watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;

            if (!window.userMarker) {
                window.userMarker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: "#2196F3",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(map);
                
                map.setView([lat, lng], 15);
                
                btn.innerHTML = '<span class="material-icons">stop_circle</span> Stop';
                btn.style.backgroundColor = '#c0392b'; 
            } else {
                window.userMarker.setLatLng([lat, lng]);
            }
        },
        (err) => {
            console.error("Errore GPS:", err);
            alert("Impossibile trovare la posizione. Verifica i permessi GPS.");
            btn.innerHTML = '<span class="material-icons">error</span> Err';
            btn.style.backgroundColor = '#7f8c8d';
            window.watchId = null;
        },
        options
    );
};

const originalCloseModal = window.closeModal;
window.closeModal = function() {
    if (window.watchId !== null) {
        navigator.geolocation.clearWatch(window.watchId);
        window.watchId = null;
        window.userMarker = null;
    }
    if(originalCloseModal) originalCloseModal();
};