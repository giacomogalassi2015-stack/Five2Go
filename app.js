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
        else if (view === 'servizi') await renderServicesGrid();
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

function renderSubMenu(options, defaultTable) {
    // Genera Tab stile "Text Only" - Pulito e Minimale
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

 // ... codice precedente ...

    if (tableName === 'Prodotti') {
        // 1. Apriamo il contenitore GRIGLIA (come nei Borghi)
        html = '<div class="grid-container animate-fade">'; 

        data.forEach(p => {
            // Recuperiamo Titolo e Immagine
            const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome'); 
            
            // NOTA: Ho aumentato la qualità a 600/800 perché ora l'immagine è uno sfondo grande
            const imgUrl = window.getSmartUrl(p.Prodotti || p.Nome, '', 800); 
            
            // Prepariamo l'oggetto per il click (lasciamo la logica del modal prodotto)
            // Attenzione agli apici nel JSON per evitare errori
            const safeObj = JSON.stringify(p).replace(/'/g, "\\'"); 

            // 2. Usiamo la classe "village-card" invece di "card-product"
            html += `
            <div class="village-card" 
                 style="background-image: url('${imgUrl}')" 
                 onclick='openModal("product", ${safeObj})'>
                
                <div class="card-title-overlay">
                    ${titolo}
                </div>
            
            </div>`;
        });

        // 3. Chiudiamo il contenitore
        html += '</div>';
    }

    // ... codice successivo ...
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
    
// --- GESTIONE TRASPORTI ---
    else if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) { console.error("Errore recupero trasporto"); return; }
        
        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo') || 'Trasporto';
        // const desc = window.dbCol(item, 'Descrizione') || ''; // NON SERVE PIÙ
        
        // 1. RECUPERO DATI DAL DB
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
        
        // Verifica se c'è almeno un'info da mostrare
        const hasTicketInfo = infoSms || infoApp || infoAvvisi;

        let customContent = '';

        // Controlliamo se è un BUS
        const isBus = nome.toLowerCase().includes('bus') || nome.toLowerCase().includes('autobus') || nome.toLowerCase().includes('atc');

        if (isBus) {
            // === LOGICA PER I BUS (Mappa + Ricerca) ===
            const { data: fermate, error } = await window.supabaseClient
                .from('Fermate_bus')
                .select('ID, NOME_FERMATA, LAT, LONG') 
                .order('NOME_FERMATA', { ascending: true });

            if (fermate && !error) {
                const now = new Date();
                const todayISO = now.toISOString().split('T')[0];
                const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                const options = fermate.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
                
                // Sezione Biglietti per il Bus
                let ticketSection = '';
                if (hasTicketInfo) {
                    ticketSection = `
                    <button onclick="toggleTicketInfo()" style="width:100%; margin-bottom:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        🎟️ COME ACQUISTARE IL BIGLIETTO ▾
                    </button>
                    <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px; font-size:0.9rem; color:#333; line-height:1.5;">
                        ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                        ${infoSms && infoApp ? `<hr style="border:0; border-top:1px solid #eee; margin:10px 0;">` : ''}
                        ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                        ${infoAvvisi ? `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;"><strong>⚠️ ATTENZIONE:</strong> ${infoAvvisi}</div>` : ''}
                    </div>`;
                }

                customContent = `
                <div class="bus-search-box animate-fade">
                    <div class="bus-title"><span class="material-icons">directions_bus</span> Pianifica Viaggio</div>
                    
                    <div id="bus-map" style="height: 280px; width: 100%; border-radius: 12px; margin-bottom: 20px; z-index: 1;"></div>
                    
                    ${ticketSection}

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

                // Inizializza Mappa
                setTimeout(() => { initBusMap(fermate); }, 300);

            } else {
                console.error("Errore Supabase:", error);
                customContent = `<p style="color:red;">Errore caricamento fermate.</p>`;
            }
        } 
        else {
            // === CASO NON BUS ===
            if (hasTicketInfo) {
                 customContent = `
                 <button onclick="toggleTicketInfo()" style="width:100%; margin-top:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    🎟️ INFO BIGLIETTI
                 </button>
                 <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-top:10px;">
                    ${infoSms ? `<p><strong>SMS:</strong> ${infoSms}</p>` : ''}
                    ${infoApp ? `<p><strong>APP:</strong> ${infoApp}</p>` : ''}
                    ${infoAvvisi ? `<p style="color:#856404; background:#fff3cd; padding:5px;">${infoAvvisi}</p>` : ''}
                 </div>`;
            } else {
                customContent = `<div style="text-align:center; padding:30px; background:#f9f9f9; border-radius:12px; margin-top:20px; color:#999;">Funzione in arrivo</div>`;
            }
        }

        // *** MODIFICA EFFETTUATA QUI SOTTO ***
        // Ho rimosso <p>${desc}</p>. Se vuoi rimuovere anche il titolo, togli <h2>${nome}</h2>
        contentHtml = `<h2>${nome}</h2>${customContent}`;
        
        modal.innerHTML = `<div class="modal-content"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
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
});
/* ============================================================
   SWIPE TRA LE PAGINE (Cambio Tab automatico)
   ============================================================ */

const minSwipeDistance = 60; // Sensibilità (più alto = devi strisciare di più)
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

const contentArea = document.getElementById('app-content');

// 1. Inizio tocco
contentArea.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

// 2. Fine tocco
contentArea.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handlePageSwipe();
}, {passive: true});

function handlePageSwipe() {
    // Calcoliamo quanto ti sei mosso in orizzontale e verticale
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;

    // Se l'utente sta scorrendo in giù (scroll pagina), ignoriamo lo swipe laterale
    if (Math.abs(yDiff) > Math.abs(xDiff)) return;

    // Se il movimento è troppo corto, ignoriamo
    if (Math.abs(xDiff) < minSwipeDistance) return;

    // Troviamo i bottoni (Tab) attivi
    const tabs = document.querySelectorAll('.sub-nav-item');
    if (tabs.length === 0) return;

    // Troviamo quale è attivo ora
    let activeIndex = -1;
    tabs.forEach((tab, index) => {
        if (tab.classList.contains('active-sub')) activeIndex = index;
    });

    if (activeIndex === -1) return;

    // LOGICA CAMBIO PAGINA
    if (xDiff < 0) {
        // Swipe Sinistra (Next)
        if (activeIndex < tabs.length - 1) {
            animateTransition('left', () => tabs[activeIndex + 1].click());
        }
    } else {
        // Swipe Destra (Prev)
        if (activeIndex > 0) {
            animateTransition('right', () => tabs[activeIndex - 1].click());
        }
    }
}

// Piccolo effetto visivo (Opzionale, ma carino)
function animateTransition(direction, callback) {
    const container = document.getElementById('sub-content');
    if(!container) { callback(); return; }

    // Dissolvenza veloce prima di cambiare
    container.style.transition = 'transform 0.15s, opacity 0.15s';
    container.style.opacity = '0';
    container.style.transform = direction === 'left' ? 'translateX(-20px)' : 'translateX(20px)';

    setTimeout(() => {
        callback(); // Carica i nuovi dati
        // Reset posizione per la nuova pagina
        setTimeout(() => {
            container.style.transition = 'none';
            container.style.transform = direction === 'left' ? 'translateX(20px)' : 'translateX(-20px)';
            
            setTimeout(() => {
                container.style.transition = 'transform 0.15s, opacity 0.15s';
                container.style.opacity = '1';
                container.style.transform = 'translateX(0)';
            }, 10);
        }, 50);
    }, 150);
}/* ============================================================
   NUOVA GRIGLIA SERVIZI (Misto: Trasporti DB + Card Statiche)
   ============================================================ */
async function renderServicesGrid() {
    // 1. Scarichiamo i Trasporti dal DB
    const { data, error } = await window.supabaseClient.from('Trasporti').select('*');
    if (error) throw error;

    // Salviamo i dati per far funzionare il modal (fondamentale!)
    window.tempTransportData = data;

    let html = '<div class="grid-container animate-fade">';

    // A. GENERAZIONE CARD TRASPORTI (Dinamiche dal DB)
    data.forEach((t, index) => {
        // Usa colonna 'Mezzo' come richiesto, oppure 'Località' come fallback
        const titolo = t.Mezzo || t.Località || 'Trasporto'; 
        
        // Immagine intelligente basata sul nome del mezzo
        const imgUrl = window.getSmartUrl(titolo, 'Trasporti', 600);
        
        // Apre il modal esistente dei trasporti
        html += `
        <div class="village-card" 
             style="background-image: url('${imgUrl}')" 
             onclick="openModal('transport', ${index})">
            <div class="card-title-overlay">${titolo}</div>
        </div>`;
    });

    // B. CARD STATICHE (Numeri Utili & Farmacie)
    // Qui puoi cambiare le immagini URL con quelle che preferisci
    
    // Card NUMERI UTILI
    html += `
    <div class="village-card" 
         style="background-image: url('https://images.unsplash.com/photo-1596524430623-ad560a5e8424?auto=format&fit=crop&w=600&q=80')" 
         onclick="renderSimpleList('Numeri_utili')">
        <div class="card-title-overlay">${window.t('menu_num') || 'Numeri Utili'}</div>
    </div>`;

    // Card FARMACIE
    html += `
    <div class="village-card" 
         style="background-image: url('https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=600&q=80')" 
         onclick="renderSimpleList('Farmacie')">
        <div class="card-title-overlay">${window.t('menu_pharm') || 'Farmacie'}</div>
    </div>`;

    content.innerHTML = html + '</div>';
}

/* Funzione Helper per aprire le liste senza Tabs (es. cliccando su Farmacie) */
function renderSimpleList(tableName) {
    // Crea un contenitore pulito con un titolo e il pulsante "Indietro"
    content.innerHTML = `
        <div style="padding: 10px 0; display:flex; align-items:center; gap:10px;">
            <button onclick="renderServicesGrid()" class="btn-back" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">⬅</button>
            <h2 style="margin:0;">${tableName.replace('_', ' ')}</h2>
        </div>
        <div id="sub-content"></div>
    `;
    
    // Riutilizza la tua funzione esistente per caricare i dati
    window.loadTableData(tableName, null);
}
// Funzione per mostrare/nascondere info biglietti bus
window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) {
        const isHidden = box.style.display === 'none';
        box.style.display = isHidden ? 'block' : 'none';
    }
};// --- FUNZIONE CHE CREA LA MAPPA BUS ---
window.initBusMap = function(fermate) {
    // Coordinate centrali (Cinque Terre indicative)
    const startLat = 44.12; 
    const startLong = 9.70;
    
    // Controlla se esiste il div e se la mappa non è già inizializzata
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;

    // Crea la mappa
    const map = L.map('bus-map').setView([startLat, startLong], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
    }).addTo(map);

    // Gruppo per adattare lo zoom ai marker
    const markersGroup = new L.FeatureGroup();

    fermate.forEach(f => {
        // Salta se mancano coordinate
        if (!f.LAT || !f.LONG) return;

        // Crea icona personalizzata (opzionale, qui standard)
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        
        // Contenuto del Popup con i due bottoni
        const popupContent = `
            <div style="text-align:center; min-width:150px;">
                <h3 style="margin:0 0 10px 0; font-size:1rem;">${f.NOME_FERMATA}</h3>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="setBusStop('selPartenza', '${f.ID}')" 
                            style="background:#4CAF50; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                        Partenza
                    </button>
                    <button onclick="setBusStop('selArrivo', '${f.ID}')" 
                            style="background:#F44336; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                        Arrivo
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
    });

    map.addLayer(markersGroup);
    
    // Adatta lo zoom per vedere tutte le fermate
    if (markersGroup.getLayers().length > 0) {
        map.fitBounds(markersGroup.getBounds(), { padding: [30, 30] });
    }
    
    // Fix rendering Leaflet dentro modali
    setTimeout(() => { map.invalidateSize(); }, 200);
};

// --- FUNZIONE CHE IMPOSTA LA SELECT QUANDO CLICCHI SULLA MAPPA ---
window.setBusStop = function(selectId, value) {
    const select = document.getElementById(selectId);
    if (select) {
        select.value = value;
        // Effetto visivo di conferma
        select.style.backgroundColor = "#fff3cd"; 
        setTimeout(() => select.style.backgroundColor = "white", 500);
    }
};