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
// 1. GENERAZIONE MENU (Con Swiper.js)
// ============================================================
function renderSubMenu(options, defaultTable) {
    // Creiamo la struttura HTML specifica che Swiper richiede
    let menuHtml = `
    <div class="nav-sticky-header animate-fade">
        <div class="swiper swiper-container" id="menuSwiper">
            <div class="swiper-wrapper">
                ${options.map(opt => `
                    <div class="swiper-slide">
                        <button class="nav-chip" onclick="loadTableData('${opt.table}', this)">
                            ${opt.label}
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <div id="sub-content" style="padding-top: 5px; min-height: 300px;"></div>`;
    
    content.innerHTML = menuHtml;

    // --- ATTIVAZIONE SWIPER (Il motore fluido) ---
    // Usiamo un piccolo ritardo per assicurarci che l'HTML sia renderizzato
    setTimeout(() => {
        new Swiper('#menuSwiper', {
            slidesPerView: 'auto',  // La larghezza dipende dal testo
            freeMode: true,         // Scorrimento libero (inerzia)
            spaceBetween: 0,        // Spazio gestito dal CSS
            grabCursor: true,       // Cursore manina su PC
        });
    }, 10);
    
    // Attiva il primo bottone automaticamente
    const firstBtn = content.querySelector('.nav-chip');
    if (firstBtn) {
        loadTableData(defaultTable, firstBtn);
    }
}

// ============================================================
// 2. CARICAMENTO DATI (Gestione Click)
// ============================================================
window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    // --- GESTIONE VISIVA (Spegni/Accendi) ---
    // 1. Togli la classe 'active-chip' a TUTTI i bottoni
    document.querySelectorAll('.nav-chip').forEach(btn => {
        btn.classList.remove('active-chip');
    });

    // 2. Aggiungi la classe 'active-chip' SOLO a quello cliccato
    if (btnEl) {
        btnEl.classList.add('active-chip');
    }
    // ----------------------------------------

    // Reset Filtri
    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    // Loader
    subContent.innerHTML = `<div class="loader" style="margin-top:20px;">${window.t('loading')}...</div>`;
    
    // Gestione Mappe (Caso speciale)
    if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe></div>`;
        return; 
    }

    // Caricamento Dati Reali
    const { data, error } = await window.supabaseClient.from(tableName).select('*');
    
    if (error) { 
        subContent.innerHTML = `<p class="error-msg">Errore connessione: ${error.message}</p>`; 
        return; 
    }

    // --- ROUTING RENDERER (I tuoi layout) ---
    if (tableName === 'Prodotti') {
        let html = '<div class="products-grid-fixed animate-fade">'; 
        data.forEach(p => { html += window.prodottoRenderer(p); });
        subContent.innerHTML = html + '</div>';
    }
    else if (tableName === 'Ristoranti') { 
        renderGenericFilterableView(data, 'Paesi', subContent, window.ristoranteRenderer); 
    }
    else if (tableName === 'Sentieri') { 
        renderGenericFilterableView(data, 'Difficolta', subContent, window.sentieroRenderer); 
    }
    else if (tableName === 'Spiagge') { 
        renderGenericFilterableView(data, 'Paesi', subContent, window.spiaggiaRenderer); 
    }
    else if (tableName === 'Attrazioni') {
        renderGenericFilterableView(data, 'Paese', subContent, window.attrazioniRenderer);
    }
    else if (tableName === 'Farmacie') { 
        renderGenericFilterableView(data, 'Paesi', subContent, window.farmacieRenderer); 
    } 
    else if (tableName === 'Numeri_utili') {
        renderGenericFilterableView(data, 'Comune', subContent, window.numeriUtiliRenderer);
    }
};
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