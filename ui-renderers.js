console.log("✅ 2. ui-renderers.js caricato (Localizzato)");



// === RENDERER RISTORANTE ===

window.ristoranteRenderer = (r) => {
    // ... (codice precedente invariato) ...
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="restaurant-glass-card"> 
        
        <h3 class="rest-card-title">${nome}</h3>
        
        <p class="rest-card-subtitle">
            <span class="material-icons">restaurant</span>
            ${paesi}
        </p>
       
        <div class="rest-card-actions">
            
            <div class="action-btn btn-info rest-btn-size" onclick="openModal('ristorante', '${safeObj}')">
                <span class="material-icons">info_outline</span>
            </div>

            ${numero ? `
                <div class="action-btn btn-call rest-btn-size" onclick="window.location.href='tel:${numero}'">
                    <span class="material-icons">call</span>
                </div>` : ''}
            
            <div class="action-btn btn-map rest-btn-size" onclick="window.open('${mapLink}', '_blank')">
                <span class="material-icons">map</span>
            </div>

        </div>
    </div>`;
};
// ============================================================
// RENDERER SPIAGGE (Stile Monumenti Unificato)
// ============================================================
window.spiaggiaRenderer = function(item) {
    // Dati
    const nome = item.Nome || 'Spiaggia';
    const comune = item.Paese || item.Comune || '';
    // Se hai un campo per il tipo di spiaggia (es. "Sabbia", "Scogli") usalo qui
    const tipo = item.Tipo || 'Spiaggia'; 

    // Icona specifica per la spiaggia (Onde marine - NO palme)
    const iconClass = 'fa-water';

    return `
    <div class="culture-card is-beach animate-fade" onclick="openModal('Spiagge', '${item.id}')">
        <div class="culture-info">
            ${comune ? `<div class="culture-location"><span class="material-icons" style="font-size:0.9rem">place</span> ${comune}</div>` : ''}
            
            <h3 class="culture-title">${nome}</h3>
            
            <div class="culture-tags">
                 <span class="c-pill">${tipo}</span>
            </div>
        </div>
        
        <div class="culture-bg-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>
    </div>
    `;
};

// === RENDERER SENTIERO (Correzione Spaziature) ===
// === RENDERER SENTIERO ===
window.sentieroRenderer = (s) => {
    // ... (variabili iniziali) ...
    const paese = window.dbCol(s, 'Paesi');
    const titoloMostrato = s.Nome || paese; 
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");

    let diffColor = '#f39c12';
    // Assumiamo che i tag nel DB siano standardizzati, ma la visualizzazione colore resta logica interna
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60';
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('expert') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b';

    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return `
    <div class="trail-card-modern animate-fade">
        <div id="${uniqueMapId}" class="trail-map-container" 
             onclick="event.stopPropagation(); openModal('map', '${gpxUrl}')">
        </div>

        <div class="trail-info-overlay" style="text-align: center; cursor: default; padding: 25px 15px 15px 15px;"> 
            <h3 style="margin: 5px 0 5px 0; font-family:'Roboto Slab'; font-size: 1.25rem; color:#222; line-height:1.2;">
                ${titoloMostrato}
            </h3>
            <div style="font-size:0.75rem; font-weight:700; color:${diffColor}; text-transform:uppercase; letter-spacing:1px; margin-bottom:18px;">
                ${diff}
            </div>
            <button onclick="openModal('trail', '${safeObj}')" 
                    style="width:100%; padding:14px; border:none; background:#2D3436; color:white; border-radius:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:8px; cursor: pointer; transition: background 0.2s;">
                ${window.t('btn_details')} <span class="material-icons" style="font-size:1.1rem;">arrow_forward</span>
            </button>
        </div>
    </div>`;
};

window.vinoRenderer = function(item) {
    // 1. Cerca l'ID in tutti i modi possibili (id minuscolo o ID maiuscolo)
    const safeId = item.id || item.ID; 
    
    // Dati esatti dalle tue colonne
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();

    // Logica Colori
    let themeClass = 'is-wine-red'; 
    if (tipo.includes('bianco')) themeClass = 'is-wine-white';
    if (tipo.includes('rosato') || tipo.includes('orange')) themeClass = 'is-wine-orange';

    return `
    <div class="culture-card ${themeClass} animate-fade" onclick="openModal('Vini', '${safeId}')">
        <div class="culture-info">
            ${cantina ? `<div class="culture-location"><span class="material-icons" style="font-size:0.9rem">storefront</span> ${cantina}</div>` : ''}
            
            <div class="culture-title">${nome}</div>
            
            <div class="culture-tags">
                 <span class="c-pill" style="text-transform: capitalize;">${item.Tipo || 'Vino'}</span>
            </div>
        </div>
        
        <div class="culture-bg-icon">
            <i class="fa-solid fa-wine-bottle"></i>
        </div>
    </div>`;
};
// === RENDERER NUMERI UTILI ===
window.numeriUtiliRenderer = (n) => {
    const nome = window.dbCol(n, 'Nome') || 'Numero Utile';
    const paesi = window.dbCol(n, 'Paesi') || 'Info'; 
    const numero = n.Numero || n.Telefono || '';

    // Logica Icone
    let icon = 'help_outline'; 
    const nLower = nome.toLowerCase();
    if (nLower.includes('carabinieri') || nLower.includes('polizia')) icon = 'security';
    else if (nLower.includes('medica') || nLower.includes('croce')) icon = 'medical_services';
    else if (nLower.includes('taxi')) icon = 'local_taxi';
    else if (nLower.includes('farmacia')) icon = 'local_pharmacy';
    else if (nLower.includes('info')) icon = 'info';

    return `
    <div class="info-card animate-fade">
        <div class="info-icon-box">
            <span class="material-icons">${icon}</span>
        </div>
        <div class="info-text-col">
            <h3>${nome}</h3>
            <p>
                <span class="material-icons" style="font-size: 0.9rem;">place</span>
                ${paesi}
            </p>
        </div>
        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>
    </div>`;
};

// === RENDERER FARMACIE (Versione White & Clean) ===
window.farmacieRenderer = (f) => {
    // Debug: Controlla in console se i dati arrivano
    console.log("Render Farmacia:", f);

    // 1. Recupero dati (Massima compatibilità nomi colonne)
    const nome = window.dbCol(f, 'Farmacia') || window.dbCol(f, 'Nome') || 'Farmacia';
    const paese = window.dbCol(f, 'Paese') || window.dbCol(f, 'Paesi') || '';
    const numero = f.Telefono || f.Numero || '';

    // 2. HTML
    return `
    <div class="info-card animate-fade">
        
        <div class="info-icon-box">
            <span class="material-icons">local_pharmacy</span>
        </div>

        <div class="info-text-col">
            <h3>${nome}</h3>
            <p>
                <span class="material-icons" style="font-size: 0.9rem;">place</span>
                ${paese}
            </p>
        </div>

        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>

    </div>`;
};
// === RENDERER ATTRAZIONI (Basato su colonna LABEL) ===
window.attrazioniRenderer = (item) => {
    
const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = window.dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const tempo = item.Tempo_visita || '--'; 
    const diff = window.dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    
    // RECUPERA LA LABEL (Storico, Religioso, Panorama)
    // Se è vuota, usa 'Storico' come default
    const rawLabel = window.dbCol(item, 'Label') || 'Storico';
    const label = rawLabel.toLowerCase().trim(); // Pulisce il testo (es. "  Religioso " -> "religioso")

    // Variabili per CSS e Icona
    let themeClass = 'is-monument';
    let iconClass = 'fa-landmark'; 

    // --- LOGICA DI ASSEGNAZIONE ---
    
    // 1. RELIGIOSO (Viola) -> Icona Chiesa
    if (label === 'religioso') {
        themeClass = 'is-church';
        iconClass = 'fa-church'; 
    }
    
    // 2. PANORAMA (Verde Acqua) -> Icona Monti e Sole
    else if (label === 'panorama') {
        themeClass = 'is-view';
        iconClass = 'fa-mountain-sun'; 
    }
    
    // 3. STORICO (Terracotta) -> Icona Torre/Castello
    else if (label === 'storico') {
        themeClass = 'is-monument';
        iconClass = 'fa-chess-rook'; // Torre medievale
    }
    
    // Fallback (se hai scritto altro nella colonna Label)
    else {
        themeClass = 'is-monument';
        iconClass = 'fa-landmark';
    }

    return `
    <div class="culture-card ${themeClass} animate-fade" onclick="openModal('attrazione', ${myId})">
        
        <div class="culture-info">
            <div class="culture-location">
                <span class="material-icons" style="font-size:0.9rem;">place</span> ${paese}
            </div>
            
            <div class="culture-title">${titolo}</div>
            
            <div class="culture-tags">
                <span class="c-pill">
                    <span class="material-icons" style="font-size:0.8rem;">schedule</span> ${tempo}
                </span>
                <span class="c-pill">
                    ${diff}
                </span>
            </div>
        </div>

        <div class="culture-bg-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>

    </div>`;
};

// === RENDERER PRODOTTO (Titolo Dominante + Foto a Destra) ===
window.prodottoRenderer = (p) => {
    // 1. Recupero Dati
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const ideale = window.dbCol(p, 'Ideale per') || 'Tutti'; 
    
    // 2. Immagine
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200); // Thumb piccola
    
    // 3. Oggetto per modale
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="culture-card is-product animate-fade" onclick="openModal('product', '${safeObj}')">
        
        <div class="culture-info">
            <div class="culture-title">${titolo}</div>

            <div class="product-subtitle">
                <span class="material-icons">stars</span> 
                Ideale per: ${ideale}
            </div>
        </div>
        
        <div class="culture-product-thumb">
            <img src="${imgUrl}" loading="lazy" alt="${titolo}">
        </div>

    </div>`;
};
// ============================================================
// LOGICA MODALE PRINCIPALE (window.openModal)
// ============================================================
window.openModal = async function(type, payload) {
    // ... (Creazione modale base) ...
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    let contentHtml = '';
    let modalClass = 'modal-content'; 
    let item = null; 

    // ... (Recupero Item Attrazioni/Vini) ...
    if (window.currentTableData && (type === 'Vini' || type === 'Attrazioni' || type === 'Spiagge')) {
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
    }

    if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) return;
        
        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo');
        const desc = window.dbCol(item, 'Descrizione') || '';
        
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
        const hasTicketInfo = infoSms || infoApp || infoAvvisi;
        
        const isBus = nome.toLowerCase().includes('bus') || nome.toLowerCase().includes('autobus');
        const isTrain = nome.toLowerCase().includes('tren') || nome.toLowerCase().includes('ferrovi');
        
        let customContent = '';

        if (isBus) {
            let ticketSection = '';
            if (hasTicketInfo) {
                // MODIFICA: Traduzioni Hardcoded
                ticketSection = `
                <button onclick="toggleTicketInfo()" style="width:100%; margin-bottom:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                    🎟️ ${window.t('how_to_ticket')} ▾
                </button>
                <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px; font-size:0.9rem; color:#333; line-height:1.5;">
                    ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                    ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                    ${infoAvvisi ? `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;"><strong>⚠️ ${window.t('label_warning')}:</strong> ${infoAvvisi}</div>` : ''}
                </div>`;
            }

            const mapToggleSection = `
                <button id="btn-bus-map-toggle" onclick="toggleBusMap()" style="width:100%; margin-bottom:15px; background:#EDE7F6; color:#4527A0; border:1px solid #D1C4E9; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition: background 0.3s;">
                    🗺️ ${window.t('show_map')} ▾
                </button>
                <div id="bus-map-wrapper" style="display:none; margin-bottom: 20px;">
                    <div id="bus-map" style="height: 280px; width: 100%; border-radius: 12px; z-index: 1; border: 2px solid #EDE7F6;"></div>
                    <p style="font-size:0.75rem; text-align:center; color:#999; margin-top:5px;">${window.t('map_hint')}</p>
                </div>`;

            const now = new Date();
            const todayISO = now.toISOString().split('T')[0];
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            customContent = `
            <div class="bus-search-box animate-fade">
                <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;">
                    <span class="material-icons">directions_bus</span> ${window.t('plan_trip')}
                </div>
                
                ${ticketSection}
                ${mapToggleSection}

                <div class="bus-inputs">
                    <div style="flex:1;">
                        <label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('departure')}</label>
                        <select id="selPartenza" class="bus-select" onchange="filterDestinations(this.value)">
                            <option value="" disabled selected>${window.t('loading')}...</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('arrival')}</label>
                        <select id="selArrivo" class="bus-select" disabled>
                            <option value="" disabled selected>${window.t('select_start')}</option>
                        </select>
                    </div>
                </div>

                <div class="bus-inputs">
                    <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('date_trip')}</label><input type="date" id="selData" class="bus-select" value="${todayISO}"></div>
                    <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('time_trip')}</label><input type="time" id="selOra" class="bus-select" value="${nowTime}"></div>
                </div>
                
                <button id="btnSearchBus" onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px; opacity: 0.5; pointer-events: none;">${window.t('find_times')}</button>
                
                <div id="busResultsContainer" style="display:none; margin-top:20px;">
                    <div id="nextBusCard" class="bus-result-main"></div>
                    <div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">${window.t('next_runs')}:</div>
                    <div id="otherBusList" class="bus-list-container"></div>
                </div>
            </div>`;
            
            setTimeout(() => { loadAllStops(); }, 50);
        }
        else if (isTrain) {
            const now = new Date();
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            if (window.trainSearchRenderer) { customContent = window.trainSearchRenderer(null, nowTime); } 
            else { customContent = `<p>${window.t('error')}</p>`; }
        }
        // ... (Altro codice transport invariato) ...
        if (isBus || isTrain) { contentHtml = customContent; } else { contentHtml = `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`; }
    }
    else if (type === 'trail') {
        // ... (Logica sentieri) ...
        const p = JSON.parse(decodeURIComponent(payload));
        // ...
        
        contentHtml = `
        <div style="padding: 20px 15px;">
            <h2 style="text-align:center; margin: 0 0 5px 0; color:#2c3e50;">${p.Paesi || p.Nome}</h2>
            
            <div class="trail-stats-grid">
                <div class="trail-stat-box">
                    <span class="material-icons">straighten</span><span class="stat-value">${p.Distanza || '--'}</span><span class="stat-label">${window.t('distance')}</span>
                </div>
                <div class="trail-stat-box">
                    <span class="material-icons">schedule</span><span class="stat-value">${p.Durata || '--'}</span><span class="stat-label">${window.t('duration')}</span>
                </div>
                <div class="trail-stat-box">
                    <span class="material-icons">terrain</span><span class="stat-value">${p.Tag || p.Difficolta || 'Media'}</span><span class="stat-label">${window.t('level')}</span>
                </div>
            </div>

            <div class="trail-actions-group" style="margin: 20px 0; display: flex; flex-direction: column; gap: 12px;">
                ${p.Gpxlink ? `
                <a href="${p.Gpxlink}" download="track.gpx" class="btn-download-gpx" target="_blank">
                    <span class="material-icons">file_download</span> ${window.t('btn_download_gpx')}
                </a>` : `
                <div style="padding:15px; background:#fff5f5; border:1px solid #feb2b2; border-radius:10px; text-align:center; color:#c53030; font-size:0.85rem;">
                    <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">error_outline</span>
                    ${window.t('gpx_missing')}
                </div>`}
            </div>
            <div style="margin-top:25px; line-height:1.6; color:#444;">${window.dbCol(p, 'Descrizione')}</div>
        </div>`;
    }
    // ... (Map Modal) ...
    else if (type === 'map') {
        contentHtml = `
            <h3 style="text-align:center; margin-bottom:10px;">${window.t('map_route_title')}</h3>
            <div id="modal-map-${Math.random().toString(36).substr(2, 9)}" style="height: 450px; width: 100%; border-radius: 12px; border: 1px solid #ddd;"></div>
            <p style="text-align:center; font-size:0.8rem; color:#888; margin-top:10px;">${window.t('map_zoom_hint')}</p>
        `;
        // ... (Logica caricamento mappa invariata) ...
    }
    
    // ... (Vini Modal) ...
    else if (type === 'Vini' || type === 'wine') {
        // ... (Logica Vini invariata fino a HTML) ...
        contentHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px 25px; background: #fafafa;">
                <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                    <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${window.t('wine_type')}</div>
                    <div style="font-size:1rem; font-weight:700; color:${color}">${tipo || '--'}</div>
                </div>
                <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                    <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${window.t('wine_deg')}</div>
                    <div style="font-size:1rem; font-weight:700;">${gradi || '--'}</div>
                </div>
                ${uve ? `<div style="grid-column:1/-1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; text-align:center;"><strong>🍇 ${window.t('wine_grapes')}:</strong> ${uve}</div>` : ''}
            </div>

            <div style="padding: 25px;">
                <p>${desc}</p>
                ${abbinamenti ? `
                <div style="background: #FFF8E1; border-left: 4px solid #FFB74D; padding: 15px; border-radius: 8px; margin-top: 25px; color: #5D4037;">
                    <div style="font-weight:bold; margin-bottom:5px; text-transform:uppercase; font-size:0.8rem;">🍽️ ${window.t('wine_pairings')}</div>
                    ${abbinamenti}
                </div>` : ''}
            </div>`;
    }

    modal.innerHTML = `<div class="${modalClass}"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
    
    // Inizializzazioni ritardate (mappe bus/sentieri)
    if(type==='map') setTimeout(() => { /* ... logica mappa ... */ }, 100);
    if(type==='transport') setTimeout(() => { /* ... logica bus ... */ }, 100);
};

// --- ALTRE FUNZIONI DI SUPPORTO ---
// 1. INIZIALIZZA LE MAPPE DEI SENTIERI (e altre modali)
window.initPendingMaps = function() {
    if (!window.mapsToInit || window.mapsToInit.length === 0) return;
    
    window.mapsToInit.forEach(mapData => {
        const element = document.getElementById(mapData.id);
        // Controlla se l'elemento esiste e se la mappa non è già stata creata
        if (element && !element._leaflet_id) {
            const map = L.map(mapData.id, { 
                zoomControl: false, 
                dragging: false, 
                scrollWheelZoom: false, 
                doubleClickZoom: false, 
                attributionControl: false 
            });

            // --- QUI C'È LA MODIFICA DELLA MAPPA ---
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            // ---------------------------------------

            if (mapData.gpx) {
new L.GPX(mapData.gpx, {
    async: true,
    marker_options: { 
        startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', 
        endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', 
        shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', 
        iconSize: [25, 41],    
        iconAnchor: [12, 41],
        shadowSize: [41, 41]   
    },
    polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
}).on('loaded', function(e) { 
    
    // === MODIFICA QUI ===
    // Prima avevi paddingBottomRight: [20, 180]. CANCELLALO.
    // Usa questo per centrare perfettamente la traccia nel riquadro:
    
    map.fitBounds(e.target.getBounds(), { 
        padding: [30, 30]  // 30px di spazio vuoto su TUTTI i lati (Sopra, Sotto, Destra, Sinistra)
    });

    // ====================

}).addTo(map);
            }
        }
    });
    window.mapsToInit = []; 
};

// 2. INIZIALIZZA LA MAPPA DEI BUS
window.initBusMap = function(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    
    // Rimuovi mappa precedente se esiste
    if (window.currentBusMap) { 
        window.currentBusMap.remove(); 
        window.currentBusMap = null; 
    }

    // Centra su Riomaggiore/Cinque Terre
    const map = L.map('bus-map').setView([44.1000, 9.7385], 13);
    window.currentBusMap = map; 

    // --- QUI C'È LA MODIFICA DELLA MAPPA ---
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    // ---------------------------------------

    const markersGroup = new L.FeatureGroup();
    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        marker.bindPopup(`
            <div style="text-align:center; min-width:150px;">
                <h3 style="margin:0 0 10px 0; font-size:1rem;">${f.NOME_FERMATA}</h3>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="setBusStop('selPartenza', '${f.ID}')" class="btn-popup-start">Partenza</button>
                    <button onclick="setBusStop('selArrivo', '${f.ID}')" class="btn-popup-end">Arrivo</button>
                </div>
            </div>`);
        markersGroup.addLayer(marker);
    });
    map.addLayer(markersGroup);
    
    // Ricalcola dimensioni dopo breve delay (per il menu a tendina)
    setTimeout(() => { map.invalidateSize(); }, 200);
};

window.setBusStop = function(selectId, value) {
    const select = document.getElementById(selectId);
    if (select) {
        select.value = value;
        select.style.backgroundColor = "#fff3cd"; 
        setTimeout(() => select.style.backgroundColor = "white", 500);
    }
};

window.toggleBusMap = function() {
    const container = document.getElementById('bus-map-wrapper');
    const btn = document.getElementById('btn-bus-map-toggle');
    if (!container || !btn) return;
    const isHidden = container.style.display === 'none';
    if (isHidden) {
        container.style.display = 'block';
        btn.innerHTML = `📍 ${window.t('hide_map')} ▴`;
        btn.style.backgroundColor = '#D1C4E9'; 
        setTimeout(() => { if (window.currentBusMap) { window.currentBusMap.invalidateSize(); } }, 100);
    } else {
        container.style.display = 'none';
        btn.innerHTML = `🗺️ ${window.t('show_map')} ▾`;
        btn.style.backgroundColor = '#EDE7F6'; 
    }
};

window.trainSearchRenderer = () => {
    return `
    <div class="bus-search-box animate-fade" style="border-top: 4px solid #c0392b; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); color: white; border-radius: 20px;">
        <div class="bus-title">
            <span class="material-icons" style="background: rgba(255, 255, 255, 0.3); color:#e74c3c;">train</span> 
            Cinque Terre Express
        </div>
        <div style="padding: 0 5px;">
            <p style="font-size:0.9rem; color:#ccc; line-height:1.5; margin-bottom:15px;">${window.t('train_desc')}</p>
            <div style="background: rgba(255, 255, 255, 0.19); border-radius:12px; padding:15px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.1);">
                <h4 style="margin:0 0 10px 0; font-size:0.8rem; color:#aaa; text-transform:uppercase;">⏱️ ${window.t('avg_times')}</h4>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
                    <span>La Spezia ↔ Riomaggiore</span> <b style="color:white;">7 min</b>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255, 255, 255, 0.25); padding:8px 0;">
                    <span>${window.t('between_villages')} (e.g. Rio-Manarola)</span> <b style="color:white;">2-4 min</b>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px 0;">
                    <span>Monterosso ↔ Levanto</span> <b style="color:white;">5 min</b>
                </div>
            </div>
        </div>
        <button onclick="apriTrenitalia()" class="btn-yellow" style="background: #c0392b; color: white; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(192, 57, 43, 0.4); display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:15px; border-radius:12px;">
            <span class="material-icons" style="font-size:1.2rem;">confirmation_number</span> 
            <span style="font-weight:bold;">${window.t('train_cta')}</span>
        </button>
        <p style="font-size:0.75rem; text-align:center; color:#888; margin-top:10px;">${window.t('check_site')}</p>
    </div>`;
};

// 1. CARICAMENTO INIZIALE (Tutte le fermate in Partenza)
window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza');
    if(!selPart) return;

    // Cache per evitare chiamate inutili
    if (!window.cachedStops) {
        // AGGIUNTO 'LAT, LONG' ALLA SELECT
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA, LAT, LONG') 
            .order('NOME_FERMATA', { ascending: true });
        
        if (error) { console.error(error); return; }
        window.cachedStops = data;
    }

    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + options;

    // INIZIALIZZA LA MAPPA ORA CHE ABBIAMO I DATI
    // (Non serve fare un'altra fetch come nel file m-)
    if (window.cachedStops && window.initBusMap) {
        window.initBusMap(window.cachedStops);
    }
};
// 2. FILTRO DESTINAZIONI (Il cuore della logica)
window.filterDestinations = async function(startId) {
    const selArr = document.getElementById('selArrivo');
    const btnSearch = document.getElementById('btnSearchBus');
    
    if(!startId || !selArr) return;

    // UI Feedback
    selArr.innerHTML = `<option>Cerco collegamenti...</option>`;
    selArr.disabled = true;
    btnSearch.style.opacity = '0.5';
    btnSearch.style.pointerEvents = 'none';

    try {
        // STEP A: Trova tutte le CORSE che passano per la fermata di partenza
        const { data: corsePassanti, error: errCorse } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_CORSA')
            .eq('ID_FERMATA', startId);

        if(errCorse) throw errCorse;
        
        // Estraiamo gli ID delle corse (es. [101, 102, 105])
        const runIds = corsePassanti.map(c => c.ID_CORSA);
        
        if (runIds.length === 0) {
            selArr.innerHTML = `<option disabled>Nessun collegamento</option>`;
            return;
        }

        // STEP B: Trova tutte le ALTRE fermate che appartengono a quelle corse
        const { data: fermateCollegate, error: errColl } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_FERMATA')
            .in('ID_CORSA', runIds); // "Dammi tutte le fermate di queste corse"

        if(errColl) throw errColl;

        // Estraiamo gli ID unici delle destinazioni (escludendo la partenza stessa)
        const destIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))]
                        .filter(id => id != startId); // Rimuovi la fermata di partenza stessa

        // STEP C: Recupera i nomi delle destinazioni dalla cache (o DB)
        // Usiamo window.cachedStops che abbiamo caricato prima per fare veloce
        let validDestinations = [];
        if (window.cachedStops) {
            validDestinations = window.cachedStops.filter(s => destIds.includes(s.ID));
        } else {
            // Fallback se la cache non c'è (raro)
            const { data } = await window.supabaseClient
                .from('Fermate_bus').select('ID, NOME_FERMATA').in('ID', destIds);
            validDestinations = data || [];
        }

        // STEP D: Popola la Select Arrivo
        if (validDestinations.length > 0) {
            // Ordina alfabeticamente per pulizia
            validDestinations.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));
            
            selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + 
                               validDestinations.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
            selArr.disabled = false;
            
            // Riattiva bottone cerca
            btnSearch.style.opacity = '1';
            btnSearch.style.pointerEvents = 'auto';
        } else {
            selArr.innerHTML = `<option disabled>Nessuna destinazione</option>`;
        }

    } catch (err) {
        console.error("Errore filtro destinazioni:", err);
        selArr.innerHTML = `<option>Errore</option>`;
    }
};
