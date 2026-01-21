console.log("✅ 3. app.js caricato");

const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');

// --- 1. SETUP LINGUA & HEADER (Logic Condizionale) ---
function setupHeaderElements() {
    const header = document.querySelector('header');
    
    // 1. PULIZIA: Rimuoviamo sempre tutto prima di decidere cosa mostrare
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();
    const oldShare = document.getElementById('header-btn-share');
    if (oldShare) oldShare.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    // 2. LOGICA: Se NON siamo in home, ci fermiamo qui (Header pulito, solo titolo)
    if (window.currentViewName !== 'home') return; 

    // 3. COSTRUZIONE (Solo per Home): Aggiungiamo Selettore e Share
    
    // --- Selettore Lingua (Sinistra) ---
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

    // --- Bottone Share (Destra) ---
    const shareBtn = document.createElement('span');
    shareBtn.className = 'material-icons header-share-right animate-fade'; 
    shareBtn.id = 'header-btn-share'; 
    shareBtn.innerText = 'share'; 
    shareBtn.onclick = window.shareApp; 
    Object.assign(shareBtn.style, { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#000000', cursor: 'pointer', fontSize: '26px', zIndex: '20' });

    header.appendChild(actionsContainer);
    header.appendChild(shareBtn);
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
    
    setupHeaderElements(); // Rigenera header (bandierina aggiornata)
    updateNavBar(); 
    
    // Ricarica la vista corrente
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
    window.currentViewName = view; // Salva stato vista corrente

    // Aggiorna menu in basso (UI Attiva)
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    else if (view === 'home') {
         // Fallback: se chiamo switchView('home', null), attivo il primo tasto
         const homeBtn = document.querySelector('.nav-item[onclick*="home"]');
         if(homeBtn) homeBtn.classList.add('active');
    }
    
    // --- GESTIONE HEADER ---
    // 1. Applica la logica di visibilità bottoni (Share/Lang)
    setupHeaderElements();
    
    // 2. Il titolo centrale c'è SEMPRE (anche in Home ora)
    if (viewTitle) viewTitle.style.display = 'block';

    // 3. Imposta il testo del titolo
    const titleMap = { 
        'home': 'home_title',  // "Benvenuto"
        'cibo': 'food_title', 
        'outdoor': 'outdoor_title', 
        'servizi': 'services_title', 
        'mappe_monumenti': 'maps_title' 
    };
    if(titleMap[view] && viewTitle) viewTitle.innerText = window.t(titleMap[view]);

    // Loading State
    content.innerHTML = `<div class="loader">${window.t('loading')}</div>`;

    // Routing Viste
    try {
        if (view === 'home') renderHome();
        else if (view === 'cibo') renderSubMenu([{ label: window.t('menu_rest'), table: "Ristoranti" }, { label: window.t('menu_prod'), table: "Prodotti" }], 'Ristoranti');
        else if (view === 'outdoor') {
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

// --- NUOVA RENDER HOME (Integrata nel layout) ---
function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    // Nota: Non usiamo più position:fixed, ma riempiamo il contenitore principale
    content.innerHTML = `
    <div class="welcome-card animate-fade" style="background-image: url('${bgImage}');">
        <div class="welcome-overlay">
            <div class="welcome-content">
                <h1 class="welcome-title">${window.t('welcome_app_name')}</h1>
                <p class="welcome-desc">${window.t('welcome_desc')}</p>
                <div class="welcome-divider"></div>
                
                <p style="color:rgba(255,255,255,0.8); font-size:0.8rem; margin-bottom:10px; text-transform:uppercase; font-weight:bold;">${window.t('nav_villages')}</p>
                <div class="lang-grid">
                    ${window.AVAILABLE_LANGS.map(l => `
                        <button class="lang-tile ${l.code === window.currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                            <span class="lang-flag-large">${l.flag}</span>
                            <span class="lang-label">${l.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
}

function renderSubMenu(options, defaultTable) {
    let menuHtml = `
    <div class="sub-nav-bar" style="display: flex !important; width: 100% !important; align-items: center !important; padding-right: 10px !important; margin-bottom: 5px !important; border-bottom: 1px solid rgba(0,0,0,0.05);">
        
        <div class="sub-nav-tabs" style="display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; flex: 1 !important; min-width: 0 !important; gap: 15px !important; padding-bottom: 0 !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: none !important;">
            ${options.map(opt => `
                <button class="sub-nav-item" onclick="loadTableData('${opt.table}', this)" style="flex: 0 0 auto !important; white-space: nowrap !important; background: transparent !important; box-shadow: none !important; border: none !important;">
                    ${opt.label}
                </button>
            `).join('')}
        </div>

        <button id="filter-toggle-btn" style="display: none; margin-left: 10px; flex-shrink: 0 !important; background: #f0f0f0; border: none; border-radius: 50px; padding: 8px 12px; font-size: 0.75rem; font-weight: bold; color: #333; cursor: pointer; white-space: nowrap;">
            ⚡
        </button>

    </div>
    <div id="sub-content"></div>`;
    
    content.innerHTML = menuHtml;
    const firstBtn = content.querySelector('.sub-nav-item');
    if (firstBtn) loadTableData(defaultTable, firstBtn);
}

// Funzione globale per essere chiamata dall'HTML
window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    const filterBtn = document.getElementById('filter-toggle-btn');
    if (!subContent) return;

    // Gestione visuale tab attivo
    document.querySelectorAll('.sub-nav-item').forEach(b => b.classList.remove('active-sub'));
    if (btnEl) btnEl.classList.add('active-sub');
    if(filterBtn) filterBtn.style.display = 'none';

    subContent.innerHTML = `<div class="loader">${window.t('loading')}</div>`;
    
    if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe><div class="map-note">${window.t('map_loaded')}</div></div>`;
        return; 
    }

    const { data, error } = await window.supabaseClient.from(tableName).select('*');
    if (error) { subContent.innerHTML = `<p class="error-msg">${window.t('error')}: ${error.message}</p>`; return; }

    let html = '<div class="list-container animate-fade">';

    if (tableName === 'Sentieri') { 
        renderGenericFilterableView(data, 'Difficolta', subContent, window.sentieroRenderer); 
        return; 
    }
    else if (tableName === 'Spiagge') { 
        renderGenericFilterableView(data, 'Paesi', subContent, window.spiaggiaRenderer); 
        return; 
    }
    else if (tableName === 'Ristoranti') { 
        renderGenericFilterableView(data, 'Paesi', subContent, window.ristoranteRenderer); 
        return; 
    }
    else if (tableName === 'Farmacie') { 
        renderGenericFilterableView(data, 'Paesi', subContent, window.farmaciaRenderer); 
        return; 
    } 
    else if (tableName === 'Attrazioni') {
        window.tempAttractionsData = data; 
        data.forEach((item, index) => { item._tempIndex = index; });
        renderGenericFilterableView(data, 'Paese', subContent, window.attrazioniRenderer);
        return;
    }
    else if (tableName === 'Numeri_utili') {
        data.sort((a, b) => {
            const isEmergenzaA = a.Nome.includes('112') || a.Nome.toLowerCase().includes('emergenza');
            const isEmergenzaB = b.Nome.includes('112') || b.Nome.toLowerCase().includes('emergenza');
            return (isEmergenzaA === isEmergenzaB) ? 0 : isEmergenzaA ? -1 : 1;
        }); 
        renderGenericFilterableView(data, 'Comune', subContent, window.numeriUtiliRenderer);
        return;
    }
    else if (tableName === 'Prodotti') {
        html = '<div class="grid-container animate-fade">'; 
        data.forEach(p => {
            html += window.prodottoRenderer(p);
        });
        html += '</div>';
    }
    else if (tableName === 'Trasporti') {
        window.tempTransportData = data; 
        data.forEach((t, index) => {
            const nomeDisplay = window.dbCol(t, 'Località') || window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Località || t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', ${index})"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy" onerror="this.style.display='none'"></div>`;
        });
        html += '</div>';
    }
    
    if(tableName !== 'Trasporti' && tableName !== 'Prodotti') {
       subContent.innerHTML = html + '</div>';
    } else {
       subContent.innerHTML = html;
    }
};

// --- LOGICA FILTRI ---
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `<div class="filter-bar animate-fade" id="dynamic-filters" style="display:none;"></div><div class="list-container animate-fade" id="dynamic-list"></div>`;
    
    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');
    const filterBtn = document.getElementById('filter-toggle-btn');

    if (filterBtn) {
        filterBtn.style.display = 'block'; 
        const newBtn = filterBtn.cloneNode(true);
        filterBtn.parentNode.replaceChild(newBtn, filterBtn);
        
        newBtn.onclick = () => {
            const isHidden = filterBar.style.display === 'none';
            filterBar.style.display = isHidden ? 'flex' : 'none';
            newBtn.style.background = isHidden ? '#e0e0e0' : '#f0f0f0'; 
        };
    }

    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile", "Turistico", "Escursionistico", "Esperto"];
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a), indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.innerText = tag;
        if (tag === 'Tutti') btn.classList.add('active-filter');
        
        btn.onclick = () => {
            filterBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            
            const filtered = tag === 'Tutti' ? allData : allData.filter(item => {
                const valDB = item[filterKey] ? item[filterKey].trim() : '';
                return (valDB === tag) || (item.Nome && (item.Nome.includes('112') || item.Nome.toLowerCase().includes('emergenza')));
            });
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    function updateList(items) {
        if (!items || items.length === 0) { listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">${window.t('no_results')}</p>`; return; }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        if (typeof initPendingMaps === 'function') setTimeout(() => initPendingMaps(), 100);
    }
    
    updateList(allData);
}

// --- 6. EVENT LISTENERS E AVVIO ---
document.addEventListener('touchmove', function(event) { if (event.scale !== 1) event.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, false);
document.addEventListener('touchstart', function(event) { if (event.touches.length > 1) event.preventDefault(); }, { passive: false });

document.addEventListener('DOMContentLoaded', () => {
    window.currentViewName = 'home'; 
    setupHeaderElements(); // Avvia header con configurazione Home
    updateNavBar(); 
    switchView('home');
});

// ... (Resto funzioni swipe, servizi grid, ecc... invariate) ...
/* ============================================================
   SWIPE TRA LE PAGINE (Fixed & Global)
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
        e.target.closest('#bus-map') || 
        e.target.closest('.sub-nav-tabs')) {
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

    const tabs = document.querySelectorAll('.sub-nav-item');
    if (tabs.length === 0) return;

    let activeIndex = -1;
    tabs.forEach((tab, index) => {
        if (tab.classList.contains('active-sub')) activeIndex = index;
    });

    if (activeIndex === -1) return;

    if (xDiff < 0) {
        if (activeIndex < tabs.length - 1) tabs[activeIndex + 1].click();
    } else {
        if (activeIndex > 0) tabs[activeIndex - 1].click();
    }
    
    touchStartX = null;
    touchStartY = null;
}

// ... (renderServicesGrid e toggleTicketInfo restano uguali alla versione precedente, omettiamo per brevità visto che non sono toccati) ...
async function renderServicesGrid() {
    const { data, error } = await window.supabaseClient.from('Trasporti').select('*');
    if (error) throw error;
    window.tempTransportData = data;
    let html = '<div class="grid-container animate-fade">';
    data.forEach((t, index) => {
        const titolo = t.Mezzo || t.Località || 'Trasporto'; 
        const imgUrl = window.getSmartUrl(titolo, 'Trasporti', 600);
        html += `<div class="village-card" style="background-image: url('${imgUrl}')" onclick="openModal('transport', ${index})"><div class="card-title-overlay">${titolo}</div></div>`;
    });
    html += `<div class="village-card" style="background-image: url('https://images.unsplash.com/photo-1596524430623-ad560a5e8424?auto=format&fit=crop&w=600&q=80')" onclick="renderSimpleList('Numeri_utili')"><div class="card-title-overlay">${window.t('menu_num') || 'Numeri Utili'}</div></div>`;
    html += `<div class="village-card" style="background-image: url('https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=600&q=80')" onclick="renderSimpleList('Farmacie')"><div class="card-title-overlay">${window.t('menu_pharm') || 'Farmacie'}</div></div>`;
    content.innerHTML = html + '</div>';
}
function renderSimpleList(tableName) {
    content.innerHTML = `<div style="padding: 10px 0; display:flex; align-items:center; gap:10px;"><button onclick="renderServicesGrid()" class="btn-back" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">⬅</button><h2 style="margin:0;">${tableName.replace('_', ' ')}</h2></div><div id="sub-content"></div>`;
    window.loadTableData(tableName, null);
}
window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; }
};