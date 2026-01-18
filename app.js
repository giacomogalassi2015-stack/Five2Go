console.log("✅ 3. app.js caricato");

const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');

// --- 1. SETUP LINGUA & HEADER ---
function setupLanguageSelector() {
    const header = document.querySelector('header');
    
    // Pulizia
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();
    const oldShare = header.querySelector('.header-share-left');
    if (oldShare) oldShare.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    // Selettore Lingua
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions'; 
    actionsContainer.id = 'header-btn-lang'; 
    Object.assign(actionsContainer.style, { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: '20' });

    // window.AVAILABLE_LANGS viene da data-logic.js
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

    // Bottone Share
    const shareBtn = document.createElement('span');
    shareBtn.className = 'material-icons header-share-right'; 
    shareBtn.id = 'header-btn-share'; 
    shareBtn.innerText = 'share'; 
    shareBtn.onclick = window.shareApp; // Usa la funzione globale
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
    setupLanguageSelector(); 
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
    
    // Aggiorna menu in basso
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    
    // Gestione Header (mostra icone solo in Home)
    const shareBtn = document.getElementById('header-btn-share');
    const langBtn = document.getElementById('header-btn-lang');
    if (shareBtn && langBtn) {
        shareBtn.style.display = (view === 'home') ? 'block' : 'none';
        langBtn.style.display = (view === 'home') ? 'block' : 'none';
    }

    content.innerHTML = `<div class="loader">${window.t('loading')}</div>`;

    // Aggiorna Titolo
    const titleMap = { 'home': 'home_title', 'cibo': 'food_title', 'outdoor': 'outdoor_title', 'servizi': 'services_title', 'mappe_monumenti': 'maps_title' };
    if(titleMap[view] && viewTitle) viewTitle.innerText = window.t(titleMap[view]);

    try {
        if (view === 'home') await renderHome();
        else if (view === 'cibo') renderSubMenu([{ label: window.t('menu_rest'), table: "Ristoranti" }, { label: window.t('menu_prod'), table: "Prodotti" }], 'Ristoranti');
        else if (view === 'outdoor') renderSubMenu([{ label: window.t('menu_trail'), table: "Sentieri" }, { label: window.t('menu_beach'), table: "Spiagge" }], 'Sentieri');
        else if (view === 'servizi') renderSubMenu([{ label: window.t('menu_trans'), table: "Trasporti" }, { label: window.t('menu_num'), table: "Numeri_utili" }, { label: window.t('menu_pharm'), table: "Farmacie" }], 'Trasporti');
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: window.t('menu_map'), table: "Attrazioni" }, { label: window.t('menu_monu'), table: "Mappe" }], 'Attrazioni');
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">${window.t('error')}: ${err.message}</div>`;
    }
};

async function renderHome() {
    const { data, error } = await window.supabaseClient.from('Cinque_Terre').select('*');
    if (error) throw error;
    
    let html = '<div class="grid-container animate-fade">';
    data.forEach(v => {
        const paeseName = v.Paesi; 
        const imgUrl = window.getSmartUrl(paeseName, '', 800); 
        const safeName = paeseName.replace(/'/g, "\\'");
        // Nota: openModal è definita globalmente sotto
        html += `<div class="village-card" style="background-image: url('${imgUrl}')" onclick="openModal('village', '${safeName}')"><div class="card-title-overlay">${paeseName}</div></div>`;
    });
    // Card Extra per Mappe
    html += `<div class="village-card" style="background-image: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" onclick="switchView('mappe_monumenti', null)"><div class="card-title-overlay">${window.t('maps_title')}</div></div>`;
    
    content.innerHTML = html + '</div>';
}

// --- 3. SOTTO-MENU E CARICAMENTO DATI ---
function renderSubMenu(options, defaultTable) {
    // Genera tab e bottone Filtra
    let menuHtml = `
    <div class="sub-nav-bar" style="display: flex; justify-content: space-between; align-items: center; padding-right: 15px;">
        <div class="sub-nav-tabs" style="display:flex; overflow-x: auto; white-space: nowrap;">
            ${options.map(opt => `<button class="sub-nav-item" onclick="loadTableData('${opt.table}', this)">${opt.label}</button>`).join('')}
        </div>
        <button id="filter-toggle-btn" style="display: none; background: #f0f0f0; border: 1px solid #ccc; border-radius: 20px; padding: 5px 12px; font-size: 0.8rem; font-weight: bold; color: #333; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">FILTRA</button>
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
    
    const { data, error } = await window.supabaseClient.from(tableName).select('*');
    if (error) { subContent.innerHTML = `<p class="error-msg">${window.t('error')}: ${error.message}</p>`; return; }

    let html = '<div class="list-container animate-fade">';

    // ROUTING VERSO I RENDERER SPECIFICI (definiti in ui-renderers.js)
    // Nota: window.ristoranteRenderer etc devono esistere in ui-renderers.js

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
        window.tempAttractionsData = data; // Salva per il modal
        data.forEach((item, index) => { item._tempIndex = index; });
        renderGenericFilterableView(data, 'Paese', subContent, window.attrazioniRenderer);
        return;
    }
    else if (tableName === 'Numeri_utili') {
        // Ordina per emergenza
        data.sort((a, b) => {
            const isEmergenzaA = a.Nome.includes('112') || a.Nome.toLowerCase().includes('emergenza');
            const isEmergenzaB = b.Nome.includes('112') || b.Nome.toLowerCase().includes('emergenza');
            return (isEmergenzaA === isEmergenzaB) ? 0 : isEmergenzaA ? -1 : 1;
        }); 
        renderGenericFilterableView(data, 'Comune', subContent, window.numeriUtiliRenderer);
        return;
    };

    // Render Standard (senza filtri complessi)
    if (tableName === 'Prodotti') {
        data.forEach(p => {
            const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome'); 
            const imgUrl = window.getSmartUrl(p.Prodotti || p.Nome, '', 400);
            const safeObj = JSON.stringify(p).replace(/'/g, "'");
            html += `<div class="card-product" onclick='openModal("product", ${safeObj})'><div class="prod-info"><div class="prod-title">${titolo}</div><div class="prod-arrow">➜</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy" onerror="this.style.display='none'"></div>`;
        });
    } 
    else if (tableName === 'Trasporti') {
        window.tempTransportData = data; // Salva per il modal
        data.forEach((t, index) => {
            const nomeDisplay = window.dbCol(t, 'Località') || window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Località || t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', ${index})"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy" onerror="this.style.display='none'"></div>`;
        });
    }
    else if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe><div class="map-note">${window.t('map_loaded')}</div></div>`;
        return; 
    } 
    
    subContent.innerHTML = html + '</div>';
};

// --- LOGICA FILTRI ---
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `<div class="filter-bar animate-fade" id="dynamic-filters" style="display:none;"></div><div class="list-container animate-fade" id="dynamic-list"></div>`;
    
    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');
    const filterBtn = document.getElementById('filter-toggle-btn');

    if (filterBtn) {
        filterBtn.style.display = 'block'; 
        // Clona per rimuovere vecchi listener
        const newBtn = filterBtn.cloneNode(true);
        filterBtn.parentNode.replaceChild(newBtn, filterBtn);
        
        newBtn.onclick = () => {
            const isHidden = filterBar.style.display === 'none';
            filterBar.style.display = isHidden ? 'flex' : 'none';
            newBtn.style.background = isHidden ? '#e0e0e0' : '#f0f0f0'; 
        };
    }

    // Calcolo Tag Unici
    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile", "Turistico", "Escursionistico", "Esperto"];
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    // Ordinamento Tag
    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a), indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    // Creazione Bottoni Filtro
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
                // Filtro speciale per numeri emergenza
                return (valDB === tag) || (item.Nome && (item.Nome.includes('112') || item.Nome.toLowerCase().includes('emergenza')));
            });
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    function updateList(items) {
        if (!items || items.length === 0) { listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">${window.t('no_results')}</p>`; return; }
        // Usa il renderer passato come argomento
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        
        // Inizializza mappe se presenti
        if (typeof initPendingMaps === 'function') setTimeout(() => initPendingMaps(), 100);
    }
    
    // Primo render: tutto
    updateList(allData);
}

// --- 4. GESTIONE MODALI E BUS ---
window.openModal = async function(type, payload) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';

    if (type === 'village') {
        const bigImg = window.getSmartUrl(payload, '', 1000);
        const { data } = await window.supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', payload).single();
        const desc = data ? window.dbCol(data, 'Descrizione') : window.t('loading');
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:220px; object-fit:cover;"><h2>${payload}</h2><p>${desc}</p>`;
    } 
    else if (type === 'product') {
        const nome = window.dbCol(payload, 'Prodotti') || window.dbCol(payload, 'Nome');
        const desc = window.dbCol(payload, 'Descrizione');
        const ideale = window.dbCol(payload, 'Ideale per');
        const bigImg = window.getSmartUrl(payload.Prodotti || payload.Nome, 'Prodotti', 800);
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;" onerror="this.style.display='none'"><h2>${nome}</h2><p>${desc || ''}</p><hr><p><strong>${window.t('ideal_for')}:</strong> ${ideale || ''}</p>`;
    }
   // --- GESTIONE TRASPORTI (Corretto) ---
    else if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) { console.error("Errore recupero trasporto"); return; }
        
        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(item, 'Descrizione') || '';
        
        let customContent = '';

        // SE È IL BUS -> ATTIVA IL MOTORE COMPLETO
        if (nome.toLowerCase().includes('bus') || nome.toLowerCase().includes('autobus') || nome.toLowerCase().includes('atc')) {
            // CORREZIONE QUI: Usiamo i nomi esatti delle colonne ("ID" e "NOME_FERMATA")
            // Nota: Se su Supabase sono minuscole, usa 'id, nome_fermata'. Se Maiuscole, usa 'ID, NOME_FERMATA'.
            // Provo con la versione più probabile basata sui tuoi CSV precedenti:
            const { data: fermate, error } = await window.supabaseClient
                .from('Fermate_bus')
                .select('ID, NOME_FERMATA') 
                .order('NOME_FERMATA', { ascending: true });

            if (fermate && !error) {
                const now = new Date();
                const todayISO = now.toISOString().split('T')[0];
                const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

                // CORREZIONE QUI: f.ID e f.NOME_FERMATA (devono coincidere con la select sopra)
                const options = fermate.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
                
                customContent = `
                <div class="bus-search-box animate-fade">
                    <div class="bus-title"><span class="material-icons">directions_bus</span> Pianifica Viaggio</div>
                    
                    <div class="bus-inputs">
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">PARTENZA</label>
                            <select id="selPartenza" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select>
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">ARRIVO</label>
                            <select id="selArrivo" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select>
                        </div>
                    </div>

                    <div class="bus-inputs">
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">DATA VIAGGIO</label>
                            <input type="date" id="selData" class="bus-select" value="${todayISO}">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.7rem; color:#666; font-weight:bold;">ORARIO</label>
                            <input type="time" id="selOra" class="bus-select" value="${nowTime}">
                        </div>
                    </div>

                    <button onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px;">TROVA ORARI</button>
                    
                    <div id="busResultsContainer" style="display:none; margin-top:20px;">
                        <div id="nextBusCard" class="bus-result-main"></div>
                        <div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">CORSE SUCCESSIVE:</div>
                        <div id="otherBusList" class="bus-list-container"></div>
                    </div>
                </div>`;
            } else {
                console.error("Errore Supabase:", error); // Logga l'errore per vederlo
                customContent = `<p style="color:red;">Errore caricamento fermate: ${error ? error.message : 'Sconosciuto'}</p>`;
            }
        } else {
            customContent = `<div style="text-align:center; padding:30px; background:#f9f9f9; border-radius:12px; margin-top:20px; color:#999;">Funzione in arrivo</div>`;
        }

        contentHtml = `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`;
    }
    // ... Altri tipi (trail, attrazione) ...
    else if (type === 'trail') {
        const titolo = window.dbCol(payload, 'Paesi');
        const dist = payload.Distanza || '--';
        const dura = payload.Durata || '--';
        const desc = window.dbCol(payload, 'Descrizione') || '';
        contentHtml = `<div style="padding:20px;"><h2 style="text-align:center;">${titolo}</h2><div style="display:flex; justify-content:space-between; margin:20px 0;"><div><strong>Distanza</strong><br>${dist}</div><div><strong>Tempo</strong><br>${dura}</div></div><p>${desc}</p></div>`;
    }
    else if (type === 'restaurant') {
        const item = JSON.parse(decodeURIComponent(payload)); // Decodifica l'oggetto passato dal renderer
        const nome = window.dbCol(item, 'Nome');
        const desc = window.dbCol(item, 'Descrizione') || '';
        const orari = item.Orari || 'Orari non disponibili';
        const telefono = item.Telefono || '';
        const web = item.SitoWeb || '';
        
        // Costruisci il contenuto
        contentHtml = `
            <h2>${nome}</h2>
            <div style="margin-bottom:15px; color:#666;">📍 ${window.dbCol(item, 'Paesi')} • ${item.Indirizzo || ''}</div>
            <p>${desc}</p>
            <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
            <div style="display:flex; flex-direction:column; gap:10px;">
                <div><strong>🕒 Orari:</strong><br>${orari}</div>
                ${telefono ? `<div><strong>📞 Telefono:</strong> <a href="tel:${telefono}">${telefono}</a></div>` : ''}
                ${web ? `<div><strong>🌐 Sito Web:</strong> <a href="${web}" target="_blank">Apri sito</a></div>` : ''}
            </div>
            <div style="margin-top:20px; text-align:center;">
                <a href="http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(nome + ' ' + window.dbCol(item, 'Paesi'))}" target="_blank" class="btn-azure" style="display:inline-block; text-decoration:none; padding:10px 20px; border-radius:20px;">Portami qui 🗺️</a>
            </div>
        `;
    }
    else if (type === 'farmacia') {
        // ... logica simile per farmacia se serve, o usa quella generica
        const item = payload; // Farmacia passa l'oggetto diretto non codificato
        contentHtml = `<h2>${item.Nome}</h2><p>📍 ${item.Indirizzo}, ${item.Paesi}</p><p>📞 <a href="tel:${item.Numero}">${item.Numero}</a></p>`;
    }
    else if (type === 'attrazione') {
         // Logica già gestita sopra con tempAttractionsData
         const item = (window.tempAttractionsData && typeof payload === 'number') ? window.tempAttractionsData[payload] : null;
         if(item) {
             const titolo = window.dbCol(item, 'Attrazioni');
             const paese = window.dbCol(item, 'Paese');
             contentHtml = `<h2>${titolo}</h2><p>📍 ${paese}</p><p>${window.dbCol(item, 'Descrizione')}</p>`;
         }
    }

    modal.innerHTML = `<div class="modal-content"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
};


// --- 5. INIZIALIZZAZIONE MAPPE ---
window.initPendingMaps = function() {
    if (!window.mapsToInit || window.mapsToInit.length === 0) return;
    window.mapsToInit.forEach(mapData => {
        const element = document.getElementById(mapData.id);
        if (element && !element._leaflet_id) {
            const map = L.map(mapData.id, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            if (mapData.gpx) {
                new L.GPX(mapData.gpx, {
                    async: true,
                    marker_options: { startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', iconSize: [20, 30] },
                    polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
                }).on('loaded', function(e) { map.fitBounds(e.target.getBounds(), { paddingTopLeft: [20, 20], paddingBottomRight: [20, 180] }); }).addTo(map);
            }
        }
    });
    window.mapsToInit = []; 
};

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
    setupLanguageSelector(); 
    updateNavBar(); 
    switchView('home');      
});/* ==============================================
   AGGIUNTA: SWIPE MANUALE (GRAB & DRAG)
   ============================================== */
function activateSwipe() {
    // Cerchiamo la lista dei bottoni
    const slider = document.querySelector('.sub-nav-tabs');
    
    // Se non esiste ancora (magari la pagina sta caricando), riproviamo tra poco
    if(!slider) {
        setTimeout(activateSwipe, 500);
        return;
    }

    let isDown = false;
    let startX;
    let scrollLeft;

    // FORZATURA STILE VIA JS (Così vince su tutto)
    slider.style.display = 'flex';
    slider.style.overflowX = 'auto'; // Lasciamo auto per il mobile nativo
    slider.style.flexWrap = 'nowrap';
    slider.style.cursor = 'grab';
    slider.style.justifyContent = 'flex-start'; // Allinea a sinistra

    // Blocchiamo il restringimento dei bottoni
    Array.from(slider.children).forEach(child => {
        child.style.flexShrink = '0';
    });

    // --- EVENTI MOUSE (PC) ---
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Velocità scroll
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Avvia la funzione ogni volta che cambia la vista (perché i bottoni vengono ricreati)
// Modifica alla funzione loadTableData esistente per rilanciare lo swipe? 
// No, usiamo un trucco: controlliamo ciclicamente se ci sono bottoni nuovi.
setInterval(() => {
    const slider = document.querySelector('.sub-nav-tabs');
    // Se il slider esiste ma non ha ancora l'attributo "data-swipe-active"
    if(slider && !slider.hasAttribute('data-swipe-active')) {
        slider.setAttribute('data-swipe-active', 'true');
        activateSwipe();
    }
}, 1000);