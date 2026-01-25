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

     // === FIX BUG FILTRO: Rimuovi il tasto filtro globale se esiste ===
    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) {
        globalFilterBtn.remove();
    }
    // ================================================================

    // Aggiorna menu in basso (UI Attiva)
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    else if (view === 'home') {
         // Fallback: se chiamo switchView('home', null), attivo il primo tasto
         const homeBtn = document.querySelector('.nav-item[onclick*="home"]');
         if(homeBtn) homeBtn.classList.add('active');
    }
  

    // Routing Viste
    try {
        if (view === 'home') renderHome();
       else if (view === 'cibo') {
            renderSubMenu([
        { label: window.t('menu_rest'), table: "Ristoranti" },
        { label: window.t('menu_prod'), table: "Prodotti" },
        { label: window.t('menu_wine'), table: "Vini" } // <--- NUOVO TAB
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
// --- NUOVA RENDER HOME (Corretta senza scritta doppia) ---
function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    content.innerHTML = `
    <div class="welcome-card animate-fade" style="background-image: url('${bgImage}');">
        <div class="welcome-overlay">
            <div class="welcome-content">
                <h1 class="welcome-title">${window.t('welcome_app_name')}</h1>
    
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
        </div>
    </div>`;
}

// ============================================================
// 1. RENDER MENU (Stile 3D)
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
    
    // Attiva il primo bottone
    const firstBtn = content.querySelector('.btn-3d');
    if (firstBtn) {
        loadTableData(defaultTable, firstBtn);
    }
}

window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    // 1. Gestione Visiva Bottoni (Spegni tutti, accendi cliccato)
    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        // Supporta entrambi gli stili di bottoni che abbiamo provato
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    // 2. Reset Filtri e UI
    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    // 3. Loader
    subContent.innerHTML = `<div class="loader" style="margin-top:20px;">${window.t('loading')}...</div>`;
    
    // 4. Gestione Mappe (Caso speciale iframe)
    if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe></div>`;
        return; 
    }

    // 5. Caricamento Dati dal DB
    const { data, error } = await window.supabaseClient.from(tableName).select('*');
    if (error) { 
        subContent.innerHTML = `<p class="error-msg">${error.message}</p>`; 
        return; 
    }

    // *** FONDAMENTALE: Salva i dati per il modale ***
    window.currentTableData = data; 
    // ************************************************

    // 6. Routing Renderers (Come mostrare i dati)
    
    // VINI (Usa renderer lista filtrabile, lo stile è nel CSS)
    if (tableName === 'Vini') {
        renderGenericFilterableView(data, 'Tipo', subContent, window.vinoRenderer);
    }
    // SPIAGGE
    else if (tableName === 'Spiagge') {
        renderGenericFilterableView(data, 'Paesi', subContent, window.spiaggiaRenderer);
    }
    // PRODOTTI (Griglia)
    else if (tableName === 'Prodotti') {
        let html = '<div class="products-grid-fixed animate-fade">'; 
        data.forEach(p => { html += window.prodottoRenderer(p); });
        subContent.innerHTML = html + '</div>';
    }
    // TRASPORTI (Salva dati temp e mostra card)
    else if (tableName === 'Trasporti') {
        window.tempTransportData = data; // Serve per il modale trasporti
        let html = '<div class="list-container animate-fade">';
        data.forEach((t, index) => {
            const nomeDisplay = window.dbCol(t, 'Località') || window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', '${index}')"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy"></div>`;
        });
        subContent.innerHTML = html + '</div>';
    }
    // ALTRE CATEGORIE
    else if (tableName === 'Attrazioni') { renderGenericFilterableView(data, 'Paese', subContent, window.attrazioniRenderer); }
    else if (tableName === 'Ristoranti') { renderGenericFilterableView(data, 'Paesi', subContent, window.ristoranteRenderer); }
    else if (tableName === 'Sentieri') { renderGenericFilterableView(data, 'Difficolta', subContent, window.sentieroRenderer); }
    else if (tableName === 'Farmacie') { renderGenericFilterableView(data, 'Paesi', subContent, window.farmacieRenderer); } 
    else if (tableName === 'Numeri_utili') { renderGenericFilterableView(data, 'Comune', subContent, window.numeriUtiliRenderer); }
};
/* ============================================================
   SWIPE TRA LE PAGINE (Aggiornato per Nuovi Pulsanti)
   ============================================================ */

const minSwipeDistance = 50; 
const maxVerticalDistance = 100; // Tolleranza per non confondere scroll e swipe
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    // 1. BLOCCO SWIPE SU ELEMENTI SPECIFICI
    // Se tocchi mappe, slider o la barra del menu stesso, lo swipe di pagina NON parte
    if (e.target.closest('.leaflet-container') || 
        e.target.closest('.map-container') || 
        e.target.closest('.swiper-container') ||      // Blocca se tocchi lo slider Swiper
        e.target.closest('.nav-scroll-container') ||  // Blocca se tocchi i bottoni 3D
        e.target.closest('.nav-sticky-header') ||     // Blocca tutta la testata
        e.target.closest('.modal-content')) {         // Blocca se c'è una modale aperta
        
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
    
    // 2. CONTROLLI DI VALIDITÀ
    // Deve essere uno swipe abbastanza lungo orizzontalmente
    if (Math.abs(xDiff) < minSwipeDistance) return;
    
    // Non deve essere uno scroll verticale (se muovi più in Y che in X, è scroll)
    if (Math.abs(yDiff) > maxVerticalDistance) return;
    if (Math.abs(yDiff) > Math.abs(xDiff)) return;

    // 3. SELEZIONE DEI NUOVI BOTTONI
    // Cerchiamo sia i bottoni 'chip' che quelli '3d'
    const tabs = document.querySelectorAll('.nav-chip, .btn-3d');
    
    if (tabs.length === 0) return;

    // 4. TROVA IL TAB ATTIVO CORRENTE
    let activeIndex = -1;
    tabs.forEach((tab, index) => {
        // Controlla le nuove classi attive (.active-chip o .active-3d)
        if (tab.classList.contains('active-chip') || tab.classList.contains('active-3d')) {
            activeIndex = index;
        }
    });

    if (activeIndex === -1) return; // Nessun tab attivo trovato

    // 5. ESEGUI IL CLICK VIRTUALE SUL PROSSIMO/PRECEDENTE
    if (xDiff < 0) {
        // Swipe Sinistra -> Vado avanti (Tab successivo)
        if (activeIndex < tabs.length - 1) {
            tabs[activeIndex + 1].click();
        }
    } else {
        // Swipe Destra -> Torno indietro (Tab precedente)
        if (activeIndex > 0) {
            tabs[activeIndex - 1].click();
        }
    }
    
    // Reset
    touchStartX = null;
    touchStartY = null;
}

// --- RENDER SERVIZI (Versione Vetro Nero & Icone) ---
window.renderServicesGrid = async function() {
    const content = document.getElementById('app-content');
    
    // 1. Recupero dati dal DB
    const { data, error } = await window.supabaseClient.from('Trasporti').select('*');
    if (error) { 
        console.error(error);
        content.innerHTML = `<p class="error-msg">Errore caricamento servizi.</p>`; 
        return;
    }
    window.tempTransportData = data;

    // 2. Helper Semplice: Solo Icone (I colori sono gestiti dal CSS ora)
    function getServiceIcon(name, type) {
        const n = name.toLowerCase();
        if (n.includes('treno') || n.includes('stazione')) return 'train';
        if (n.includes('battello') || n.includes('traghetto')) return 'directions_boat';
        if (n.includes('bus') || n.includes('autobus')) return 'directions_bus';
        if (n.includes('taxi')) return 'local_taxi';
        if (type === 'farmacia') return 'local_pharmacy';
        if (type === 'info') return 'phonelink_ring';
        return 'confirmation_number'; // Icona default
    }

    let html = '<div class="services-grid-modern animate-fade">';

    // 3. Generazione Card Trasporti
    data.forEach((t, index) => {
        const nome = t.Mezzo || t.Località || 'Trasporto';
        const icon = getServiceIcon(nome, 'trasporto');
        
        // NOTA: Ho rimosso style="background..." -> Ora è tutto nero dal CSS
        html += `
        <div class="service-widget" onclick="openModal('transport', ${index})">
            <span class="material-icons widget-icon">${icon}</span>
            <span class="widget-label">${nome}</span>
        </div>`;
    });

    // 4. Generazione Card Statiche
    html += `
    <div class="service-widget" onclick="renderSimpleList('Numeri_utili')">
        <span class="material-icons widget-icon">phonelink_ring</span>
        <span class="widget-label">${window.t('menu_num') || 'Numeri Utili'}</span>
    </div>`;
    
    html += `
    <div class="service-widget" onclick="renderSimpleList('Farmacie')">
        <span class="material-icons widget-icon">medical_services</span>
        <span class="widget-label">${window.t('menu_pharm') || 'Farmacie'}</span>
    </div>`;

    html += '</div>';
    content.innerHTML = html;
};
// Funzione per renderizzare liste semplici (Farmacie, Numeri Utili) con Header Bello
function renderSimpleList(tableName) {
    const cleanTitle = tableName.replace('_', ' '); // Es. "Numeri_utili" -> "Numeri utili"

    // Header con Bottone Custom + Contenitore Contenuto
    const layout = `
    <div class="header-simple-list animate-fade">
        <button onclick="renderServicesGrid()" class="btn-back-custom">
            <span class="material-icons">arrow_back</span>
        </button>
        <h2>${cleanTitle}</h2>
    </div>
    
    <div id="sub-content">
        <div class="loader">${window.t('loading')}...</div>
    </div>`;

    content.innerHTML = layout;
    
    // Carica effettivamente i dati
    window.loadTableData(tableName, null);
}
window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; }
};

// --- LOGICA FILTRI (Tasto Galleggiante in Basso) ---
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    // Prepara i contenitori
    container.innerHTML = `
        <div class="filter-bar animate-fade" id="dynamic-filters" style="display:none; margin-bottom:15px;"></div>
        <div class="list-container animate-fade" id="dynamic-list"></div>
    `;
    
    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');
    
    // --- GESTIONE TASTO FILTRO ---
    // Cerchiamo il tasto nel documento (fuori dal container, perché è fixed)
    let filterBtn = document.getElementById('filter-toggle-btn');
    
    // Se non esiste, lo creiamo al volo
    if (!filterBtn) {
        filterBtn = document.createElement('button');
        filterBtn.id = 'filter-toggle-btn';
        document.body.appendChild(filterBtn);
    }
    
    // Impostiamo lo stile e l'ICONA (Imbuto/Filtro)
    filterBtn.style.display = 'block';
    filterBtn.innerHTML = '<span class="material-icons">filter_alt</span>'; // Icona Filtro
    
    // Gestione Click (Apre/Chiude la barra)
    // Cloniamo il nodo per rimuovere vecchi event listener di altre pagine
    const newBtn = filterBtn.cloneNode(true);
    filterBtn.parentNode.replaceChild(newBtn, filterBtn);
    
    newBtn.onclick = () => {
        const isHidden = filterBar.style.display === 'none';
        
        if (isHidden) {
            filterBar.style.display = 'flex';
            // Scrolla leggermente in alto per far vedere i filtri
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Cambia icona in "Chiudi" (X) o lascia filtro colorato?
            // Lasciamo filtro ma magari cambiamo colore per feedback
            newBtn.style.color = '#42e695'; // Diventa verde quando aperto
        } else {
            filterBar.style.display = 'none';
            newBtn.style.color = '#ffffff'; // Torna bianco
        }
    };

    // --- GENERAZIONE TAG DEI FILTRI ---
    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    
    // Ordine personalizzato
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile"];
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
                return (valDB === tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza'));
            });
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">${window.t('no_results')}</p>`; 
            return; 
        }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        
        // Se ci sono mappe da inizializzare
        if (typeof initPendingMaps === 'function') setTimeout(() => initPendingMaps(), 100);
    }
    
    // Caricamento iniziale
    updateList(allData);
}
document.addEventListener('DOMContentLoaded', () => {
    window.currentViewName = 'home'; 
    setupHeaderElements(); // Avvia header con configurazione Home
    updateNavBar(); 
    switchView('home');
});
// --- FUNZIONE SITO TRENITALIA ---
window.apriTrenitalia = function() {
    // Apre il sito ufficiale Trenitalia.
    // Perfetto per: Acquistare biglietti, vedere prezzi e orari futuri.
    window.open('https://www.trenitalia.com', '_blank');
};