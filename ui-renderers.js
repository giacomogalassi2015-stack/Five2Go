console.log("✅ 2. ui-renderers.js caricato (Localizzato & Fixato)");

// ============================================================
// 1. RENDERER DELLE CARD (LISTE)
// ============================================================

// === RENDERER RISTORANTE ===
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    // FIX: Corretto il link mappe che aveva un errore di sintassi
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

// === RENDERER SPIAGGE ===
window.spiaggiaRenderer = function(item) {
    const nome = item.Nome || 'Spiaggia';
    const comune = item.Paese || item.Comune || '';
    const tipo = item.Tipo || 'Spiaggia'; 
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
    </div>`;
};

// === RENDERER SENTIERO ===
window.sentieroRenderer = (s) => {
    const paese = window.dbCol(s, 'Paesi');
    const titoloMostrato = s.Nome || paese; 
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");

    let diffColor = '#f39c12';
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

// === RENDERER VINO ===
window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();

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
            <p><span class="material-icons" style="font-size: 0.9rem;">place</span> ${paesi}</p>
        </div>
        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>
    </div>`;
};

// === RENDERER FARMACIE ===
window.farmacieRenderer = (f) => {
    const nome = window.dbCol(f, 'Farmacia') || window.dbCol(f, 'Nome') || 'Farmacia';
    const paese = window.dbCol(f, 'Paese') || window.dbCol(f, 'Paesi') || '';
    const numero = f.Telefono || f.Numero || '';

    return `
    <div class="info-card animate-fade">
        <div class="info-icon-box">
            <span class="material-icons">local_pharmacy</span>
        </div>
        <div class="info-text-col">
            <h3>${nome}</h3>
            <p><span class="material-icons" style="font-size: 0.9rem;">place</span> ${paese}</p>
        </div>
        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>
    </div>`;
};

// === RENDERER ATTRAZIONI ===
window.attrazioniRenderer = (item) => {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = window.dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const tempo = item.Tempo_visita || '--'; 
    const diff = window.dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    
    const rawLabel = window.dbCol(item, 'Label') || 'Storico';
    const label = rawLabel.toLowerCase().trim(); 

    let themeClass = 'is-monument';
    let iconClass = 'fa-landmark'; 
    
    if (label === 'religioso') { themeClass = 'is-church'; iconClass = 'fa-church'; }
    else if (label === 'panorama') { themeClass = 'is-view'; iconClass = 'fa-mountain-sun'; }
    else if (label === 'storico') { themeClass = 'is-monument'; iconClass = 'fa-chess-rook'; }

    return `
    <div class="culture-card ${themeClass} animate-fade" onclick="openModal('attrazione', ${myId})">
        <div class="culture-info">
            <div class="culture-location">
                <span class="material-icons" style="font-size:0.9rem;">place</span> ${paese}
            </div>
            <div class="culture-title">${titolo}</div>
            <div class="culture-tags">
                <span class="c-pill"><span class="material-icons" style="font-size:0.8rem;">schedule</span> ${tempo}</span>
                <span class="c-pill">${diff}</span>
            </div>
        </div>
        <div class="culture-bg-icon"><i class="fa-solid ${iconClass}"></i></div>
    </div>`;
};

// === RENDERER PRODOTTO ===
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const ideale = window.dbCol(p, 'Ideale per') || 'Tutti'; 
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="culture-card is-product animate-fade" onclick="openModal('product', '${safeObj}')">
        <div class="culture-info">
            <div class="culture-title">${titolo}</div>
            <div class="product-subtitle">
                <span class="material-icons">stars</span> ${window.t('ideal_for')}: ${ideale}
            </div>
        </div>
        <div class="culture-product-thumb">
            <img src="${imgUrl}" loading="lazy" alt="${titolo}">
        </div>
    </div>`;
};

// ============================================================
// 2. LOGICA MODALE (CORRETTA)
// ============================================================
window.openModal = async function(type, payload) {
    console.log("Opening Modal:", type, payload); // Debug
    
    // 1. Crea il contenitore base
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';
    let modalClass = 'modal-content'; 
    let item = null; 

    // Helper per recuperare l'item dalle liste globali
    if (window.currentTableData && (type === 'Vini' || type === 'Attrazioni' || type === 'Spiagge' || type === 'attrazione' || type === 'wine')) {
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
        if (!item && typeof payload === 'number') item = window.currentTableData[payload];
    }

    // --- CASO 1: PRODOTTI ---
    if (type === 'product') {
        const p = JSON.parse(decodeURIComponent(payload));
        const nome = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome') || 'Prodotto';
        const desc = window.dbCol(p, 'Descrizione');   
        const ideale = window.dbCol(p, 'Ideale per'); 
        const fotoKey = p.Prodotti_foto || nome;
        modalClass = 'modal-content glass-modal';
        const bigImg = window.getSmartUrl(fotoKey, '', 800);

        contentHtml = `
            <div style="position: relative;">
                <img src="${bigImg}" style="width:100%; border-radius: 0 0 24px 24px; height:250px; object-fit:cover; margin-bottom: 15px; mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);" onerror="this.style.display='none'">
            </div>
            <div style="padding: 0 25px 25px 25px;">
                <h2 style="font-size: 2rem; margin-bottom: 10px; color: #222;">${nome}</h2>
                ${ideale ? `<div style="margin-bottom: 20px;"><span class="glass-tag">✨ ${window.t('ideal_for')}: ${ideale}</span></div>` : ''}
                <p style="font-size: 1.05rem; line-height: 1.6; color: #444;">${desc || ''}</p>
            </div>`;
    }

    // --- CASO 2: TRASPORTI (CORRETTO RILEVAMENTO) ---
    else if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) { console.error("Trasporto non trovato"); modal.remove(); return; }
        
        // Titolo da mostrare
        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(item, 'Descrizione') || '';
        
        // FIX RILEVAMENTO: Creiamo una stringa unica con tutti i campi per cercare le parole chiave
        const searchStr = (
            (window.dbCol(item, 'Nome') || '') + ' ' + 
            (window.dbCol(item, 'Località') || '') + ' ' + 
            (window.dbCol(item, 'Mezzo') || '')
        ).toLowerCase();

        // Rilevamento basato sulla stringa completa
        const isBus = searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc');
        const isFerry = searchStr.includes('battello') || searchStr.includes('traghetto') || searchStr.includes('navigazione');
        const isTrain = searchStr.includes('tren') || searchStr.includes('ferrovi') || searchStr.includes('stazione');

        let customContent = '';

        // --- INTERFACCIA BUS ---
        if (isBus) {
            const infoSms = window.dbCol(item, 'Info_SMS');
            const infoApp = window.dbCol(item, 'Info_App');
            const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
            const hasTicketInfo = infoSms || infoApp || infoAvvisi;

            let ticketSection = '';
            if (hasTicketInfo) {
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
            
            setTimeout(() => { if(window.loadAllStops) window.loadAllStops(); }, 100);
        } 
        
        // --- INTERFACCIA BATTELLO / TRAGHETTO ---
        else if (isFerry) {
            const now = new Date();
            const todayISO = now.toISOString().split('T')[0];
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            customContent = `
            <div class="bus-search-box animate-fade">
                <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;">
                    <span class="material-icons" style="background: linear-gradient(135deg, #0288D1, #0277BD); box-shadow: 0 4px 6px rgba(2, 119, 189, 0.3);">directions_boat</span> 
                    ${window.t('plan_trip')} (Battello)
                </div>

                <button onclick="toggleTicketInfo()" style="width:100%; margin-bottom:15px; background:#e1f5fe; color:#01579b; border:1px solid #b3e5fc; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                    🎟️ ${window.t('how_to_ticket')} ▾
                </button>
                <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px; font-size:0.9rem; color:#333; line-height:1.5;">
                    <p>I biglietti sono acquistabili presso le biglietterie al molo di ogni borgo prima dell'imbarco.</p>
                    <div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;">
                        <strong>⚠️ INFO METEO:</strong> In caso di mare mosso il servizio è sospeso.
                    </div>
                </div>

                <div class="bus-inputs">
                    <div style="flex:1;">
                        <label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('departure')}</label>
                        <select id="selPartenzaFerry" class="bus-select">
                            <option value="" disabled selected>${window.t('loading')}...</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('arrival')}</label>
                        <select id="selArrivoFerry" class="bus-select">
                            <option value="" disabled selected>${window.t('select_start')}</option>
                        </select>
                    </div>
                </div>

                <div class="bus-inputs">
                    <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('date_trip')}</label><input type="date" id="selDataFerry" class="bus-select" value="${todayISO}"></div>
                    <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('time_trip')}</label><input type="time" id="selOraFerry" class="bus-select" value="${nowTime}"></div>
                </div>
                
                <button onclick="eseguiRicercaTraghetto()" class="btn-yellow" style="background: linear-gradient(135deg, #0288D1 0%, #01579b 100%); color:white; width:100%; font-weight:bold; margin-top:5px; box-shadow: 0 10px 25px -5px rgba(2, 136, 209, 0.4);">
                    ${window.t('find_times')}
                </button>
                
                <div id="ferryResultsContainer" style="display:none; margin-top:20px;">
                    <div id="nextFerryCard" class="bus-result-main" style="background: linear-gradient(135deg, #0277BD 0%, #01579b 100%); box-shadow: 0 15px 30px -5px rgba(1, 87, 155, 0.3);"></div>
                    <div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">${window.t('next_runs')}:</div>
                    <div id="otherFerryList" class="bus-list-container"></div>
                </div>
            </div>`;

            setTimeout(() => window.initFerrySearch(), 50);
        }
        
        // --- INTERFACCIA TRENO ---
        else if (isTrain) {
            const now = new Date();
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            if (window.trainSearchRenderer) { customContent = window.trainSearchRenderer(null, nowTime); } 
            else { customContent = "<p>Errore interfaccia Treni.</p>"; }
        } 
        
        // --- FALLBACK (Se non è nessuno dei precedenti) ---
        else {
            customContent = `<p style="color:#666;">${desc}</p>`;
        }
        
        if (isBus || isTrain || isFerry) { contentHtml = customContent; } 
        else { contentHtml = `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`; }
    }

    // --- CASO 3: SENTIERI ---
    else if (type === 'trail') {
        const p = JSON.parse(decodeURIComponent(payload));
        const titolo = window.dbCol(p, 'Paesi') || p.Nome;
        const nomeSentiero = p.Nome || '';
        const dist = p.Distanza || '--';
        const dura = p.Durata || '--';
        const diff = p.Tag || p.Difficolta || 'Media'; 
        const desc = window.dbCol(p, 'Descrizione') || '';
        
        let linkGpx = p.Link_Gpx || p.Link_gpx || p.gpxlink || p.Mappa || p.Gpx;
        if (!linkGpx) {
            const key = Object.keys(p).find(k => k.toLowerCase().includes('gpx') || k.toLowerCase().includes('mappa'));
            if (key) linkGpx = p[key];
        }

        contentHtml = `
        <div style="padding: 20px 15px;">
            <h2 style="text-align:center; margin: 0 0 5px 0; color:#2c3e50;">${titolo}</h2>
            ${nomeSentiero ? `<p style="text-align:center; color:#7f8c8d; margin:0 0 15px 0; font-size:0.9rem;">${nomeSentiero}</p>` : ''}
            
            <div class="trail-stats-grid">
                <div class="trail-stat-box">
                    <span class="material-icons">straighten</span><span class="stat-value">${dist}</span><span class="stat-label">${window.t('distance')}</span>
                </div>
                <div class="trail-stat-box">
                    <span class="material-icons">schedule</span><span class="stat-value">${dura}</span><span class="stat-label">${window.t('duration')}</span>
                </div>
                <div class="trail-stat-box">
                    <span class="material-icons">terrain</span><span class="stat-value">${diff}</span><span class="stat-label">${window.t('level')}</span>
                </div>
            </div>

            <div class="trail-actions-group" style="margin: 20px 0; display: flex; flex-direction: column; gap: 12px;">
                ${linkGpx ? `
                <a href="${linkGpx}" download="${nomeSentiero || 'percorso'}.gpx" class="btn-download-gpx" target="_blank">
                    <span class="material-icons">file_download</span> ${window.t('btn_download_gpx')}
                </a>` : `
                <div style="padding:15px; background:#fff5f5; border:1px solid #feb2b2; border-radius:10px; text-align:center; color:#c53030; font-size:0.85rem;">
                    <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">error_outline</span>
                    ${window.t('gpx_missing')}
                </div>`}
            </div>

            <div style="margin-top:25px; line-height:1.6; color:#444; font-size:0.95rem; text-align:justify;">${desc}</div>
        </div>`;
    }

    // --- CASO 4: MAPPA GPX ---
    else if (type === 'map') {
        const gpxUrl = payload;
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        
        contentHtml = `
            <h3 style="text-align:center; margin-bottom:10px;">${window.t('map_route_title')}</h3>
            <div id="${uniqueMapId}" style="height: 450px; width: 100%; border-radius: 12px; border: 1px solid #ddd;"></div>
            <p style="text-align:center; font-size:0.8rem; color:#888; margin-top:10px;">${window.t('map_zoom_hint')}</p>
        `;

        // Inizializza mappa
        setTimeout(() => {
            const element = document.getElementById(uniqueMapId);
            if (element) {
                const map = L.map(uniqueMapId);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap, © CARTO', maxZoom: 20
                }).addTo(map);

                new L.GPX(gpxUrl, {
                    async: true,
                    marker_options: { 
                        startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', 
                        endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', 
                        shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41]
                    },
                    polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
                }).on('loaded', function(e) { 
                    map.fitBounds(e.target.getBounds(), { padding: [30, 30] }); 
                }).addTo(map);
                setTimeout(() => { map.invalidateSize(); }, 300);
            }
        }, 100);
    }

    // --- CASO 5: RISTORANTE ---
    else if (type === 'ristorante' || type === 'restaurant') {
        const item = JSON.parse(decodeURIComponent(payload));
        const nome = window.dbCol(item, 'Nome');
        const indirizzo = window.dbCol(item, 'Paesi') || ''; 
        const desc = window.dbCol(item, 'Descrizioni') || window.t('desc_missing'); 

        contentHtml = `
            <div class="rest-modal-wrapper">
                <div class="rest-header">
                    <h2>${nome}</h2>
                    <div class="rest-location"><span class="material-icons">place</span> ${indirizzo}</div>
                    <div class="rest-divider"></div>
                </div>
                <div class="rest-body">${desc}</div>
            </div>`;
    }

    // --- CASO 6: FARMACIA ---
    else if (type === 'farmacia') {
        const item = JSON.parse(decodeURIComponent(payload)); 
        const nome = window.dbCol(item, 'Nome');
        const paesi = window.dbCol(item, 'Paesi');
        contentHtml = `<h2>${nome}</h2><p>📍 ${item.Indirizzo}, ${paesi}</p><p>📞 <a href="tel:${item.Numero}">${item.Numero}</a></p>`;
    }

    // --- CASO 7: VINI ---
    else if (type === 'Vini' || type === 'wine') {
        if (!item) { modal.remove(); return; }

        const nome = window.dbCol(item, 'Nome');
        const tipo = window.dbCol(item, 'Tipo');
        const produttore = window.dbCol(item, 'Produttore');
        const uve = window.dbCol(item, 'Uve');
        const gradi = window.dbCol(item, 'Gradi');
        const abbinamenti = window.dbCol(item, 'Abbinamenti');
        const desc = window.dbCol(item, 'Descrizione');
        const foto = window.dbCol(item, 'Foto');

        const t = String(tipo).toLowerCase();
        let color = '#9B2335'; 
        if (t.includes('bianco')) color = '#F4D03F'; 
        if (t.includes('rosato') || t.includes('orange')) color = '#E67E22'; 

        contentHtml = `
            <div style="padding-bottom: 20px;">
                ${foto ? `<img src="${foto}" style="width:100%; height:280px; object-fit:cover; border-radius:24px 24px 0 0;">` : 
                `<div style="text-align:center; padding: 30px 20px 20px; background: #fff; border-bottom: 1px dashed #eee;">
                    <i class="fa-solid fa-wine-bottle" style="font-size: 4.5rem; color: ${color}; margin-bottom:15px; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.1));"></i>
                </div>`}

                <div style="padding: ${foto ? '25px 25px 0' : '0 25px'};">
                    <h2 style="font-family:'Roboto Slab'; font-size:2rem; margin:0 0 5px 0; line-height:1.1; color:#2c3e50;">${nome}</h2>
                    <div style="font-weight:700; color:#7f8c8d; text-transform:uppercase; font-size:0.9rem; margin-bottom:20px;">
                        <span class="material-icons" style="vertical-align:text-bottom; font-size:1.1rem;">storefront</span> ${produttore}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px 25px; background: #fafafa;">
                    <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${window.t('wine_type')}</div>
                        <div style="font-size:1rem; font-weight:700; color:${color}">${tipo || '--'}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${window.t('wine_deg')}</div>
                        <div style="font-size:1rem; font-weight:700;">${gradi || '--'}</div>
                    </div>
                    ${uve ? `<div style="grid-column:1/-1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; text-align:center; font-size:0.95rem;"><strong>🍇 ${window.t('wine_grapes')}:</strong> ${uve}</div>` : ''}
                </div>

                <div style="padding: 25px;">
                    <p style="color:#555; font-size:1.05rem; line-height:1.6; margin:0;">${desc}</p>
                    ${abbinamenti ? `
                    <div style="background: #FFF8E1; border-left: 4px solid #FFB74D; padding: 15px; border-radius: 8px; margin-top: 25px; color: #5D4037;">
                        <div style="font-weight:bold; margin-bottom:5px; text-transform:uppercase; font-size:0.8rem;">🍽️ ${window.t('wine_pairings')}</div>
                        ${abbinamenti}
                    </div>` : ''}
                </div>
            </div>`;
    }

    // --- CASO 8: ATTRAZIONI / CULTURA ---
    else if (type === 'Attrazioni' || type === 'attrazione') {
        if (!item) { modal.remove(); return; }

        const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
        const curiosita = window.dbCol(item, 'Curiosita');
        const desc = window.dbCol(item, 'Descrizione');
        const img = window.dbCol(item, 'Immagine') || window.dbCol(item, 'Foto'); 

        contentHtml = `
            ${img ? `<img src="${img}" class="monument-header-img">` : 
            `<div class="monument-header-icon"><i class="fa-solid fa-landmark" style="font-size:4rem; color:#546e7a;"></i></div>`}

            <div style="padding: 0 25px 30px;">
                <h2 style="font-family:'Roboto Slab'; font-size:2rem; margin: ${img ? '0' : '20px'} 0 10px 0; color:#2c3e50; line-height:1.1;">${titolo}</h2>
                <div style="width:50px; height:4px; background:#e74c3c; margin-bottom:20px; border-radius:2px;"></div>

                ${curiosita ? `
                <div class="curiosity-box animate-fade">
                    <div class="curiosity-title"><span class="material-icons" style="font-size:1rem;">lightbulb</span> ${window.t('label_curiosity')}</div>
                    <div style="font-style:italic; line-height:1.5;">${curiosita}</div>
                </div>` : ''}
                
                <p style="color:#374151; font-size:1.05rem; line-height:1.7; text-align:justify;">${desc || window.t('desc_missing')}</p>
            </div>`;
    }
    
    // --- CASO 9: SPIAGGE (Aggiunto per completezza) ---
    else if (type === 'Spiagge') {
        if (!item) { modal.remove(); return; }
        const nome = item.Nome || 'Spiaggia';
        const desc = window.dbCol(item, 'Descrizione') || '';
        const tipo = item.Tipo || '';
        
        contentHtml = `
             <div style="padding: 25px;">
                <h2 style="font-family:'Roboto Slab'; color:#00695C;">${nome}</h2>
                <span class="c-pill" style="margin-bottom:15px; display:inline-block;">${tipo}</span>
                <p style="line-height:1.6; color:#444;">${desc}</p>
             </div>
        `;
    }

    modal.innerHTML = `<div class="${modalClass}"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
};

// ============================================================
// 3. FUNZIONI DI SUPPORTO E MAPPE
// ============================================================

window.initPendingMaps = function() {
    if (!window.mapsToInit || window.mapsToInit.length === 0) return;
    
    window.mapsToInit.forEach(mapData => {
        const element = document.getElementById(mapData.id);
        if (element && !element._leaflet_id) {
            const map = L.map(mapData.id, { 
                zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false 
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
            }).addTo(map);

            if (mapData.gpx) {
                new L.GPX(mapData.gpx, {
                    async: true,
                    marker_options: { 
                        startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', 
                        endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', 
                        shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', 
                        iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41]   
                    },
                    polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
                }).on('loaded', function(e) { 
                    map.fitBounds(e.target.getBounds(), { padding: [30, 30] });
                }).addTo(map);
            }
        }
    });
    window.mapsToInit = []; 
};

window.initBusMap = function(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    
    if (window.currentBusMap) { window.currentBusMap.remove(); window.currentBusMap = null; }

    const map = L.map('bus-map').setView([44.1000, 9.7385], 13);
    window.currentBusMap = map; 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

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
        btn.innerHTML = `📍 ${window.t('hide_map')} ▾`;
        btn.style.backgroundColor = '#D1C4E9'; 
        setTimeout(() => { if (window.currentBusMap) { window.currentBusMap.invalidateSize(); } }, 100);
    } else {
        container.style.display = 'none';
        btn.innerHTML = `🗺️ ${window.t('show_map')} ▾`;
        btn.style.backgroundColor = '#EDE7F6'; 
    }
};
// ============================================================
// 4. Logica ricerca dei mezzi di trasporto
// ============================================================

window.trainSearchRenderer = (data, nowTime) => {
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
                    <span>${window.t('between_villages')}</span> <b style="color:white;">2-4 min</b>
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

// 1. CARICAMENTO INIZIALE (Fermate e Mappa)
window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza');
    if(!selPart) return;

    // Se non abbiamo la cache, scarichiamo dal DB
    if (!window.cachedStops) {
        // Nota: Scarichiamo LAT e LONG per la mappa
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA, LAT, LONG') 
            .order('NOME_FERMATA', { ascending: true });
        
        if (error) { console.error("Errore fermate:", error); return; }
        window.cachedStops = data;
    }

    // Popola il menu a tendina
    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + options;

    // *** PUNTO CRUCIALE: INIZIALIZZA LA MAPPA ***
    // Ora che abbiamo i dati (LAT/LONG), creiamo i pin sulla mappa
    if (window.cachedStops && window.initBusMap) {
        window.initBusMap(window.cachedStops);
    }
};

// 2. FILTRO DESTINAZIONI (Quando selezioni la partenza)
window.filterDestinations = async function(startId) {
    const selArr = document.getElementById('selArrivo');
    const btnSearch = document.getElementById('btnSearchBus');
    
    if(!startId || !selArr) return;

    // Feedback UI
    selArr.innerHTML = `<option>${window.t('bus_searching')}</option>`;
    selArr.disabled = true;
    btnSearch.style.opacity = '0.5';
    btnSearch.style.pointerEvents = 'none';

    try {
        // Trova le corse che passano per la fermata di partenza
        const { data: corsePassanti } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_CORSA')
            .eq('ID_FERMATA', startId);
        
        const runIds = corsePassanti.map(c => c.ID_CORSA);
        
        if (runIds.length === 0) {
            selArr.innerHTML = `<option disabled>${window.t('bus_no_conn')}</option>`;
            return;
        }

        // Trova le altre fermate di quelle corse
        const { data: fermateCollegate } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_FERMATA')
            .in('ID_CORSA', runIds);

        // Filtra ID unici escludendo la partenza
        const destIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))].filter(id => id != startId);

        // Recupera i nomi dalla cache locale
        let validDestinations = [];
        if (window.cachedStops) {
            validDestinations = window.cachedStops.filter(s => destIds.includes(s.ID));
        }

        // Popola Select Arrivo
        if (validDestinations.length > 0) {
            validDestinations.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));
            
            selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + 
                               validDestinations.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
            selArr.disabled = false;
            
            // Riattiva bottone cerca
            btnSearch.style.opacity = '1';
            btnSearch.style.pointerEvents = 'auto';
        } else {
            selArr.innerHTML = `<option disabled>${window.t('bus_no_dest')}</option>`;
        }

    } catch (err) {
        console.error(err);
        selArr.innerHTML = `<option>${window.t('error')}</option>`;
    }
};

// 3. ESECUZIONE RICERCA ORARI BUS
window.eseguiRicercaBus = async function() {
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');
    const nextCard = document.getElementById('nextBusCard');
    const list = document.getElementById('otherBusList');
    const resultsContainer = document.getElementById('busResultsContainer');

    if (!selPartenza || !selArrivo || !selData || !selOra) return;

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value;
    const oraScelta = selOra.value;

    if (!partenzaId || !arrivoId) return;

    // UI Loading
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">${window.t('loading')} <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    // Calcolo Festivo
    const parts = dataScelta.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    // Usa la funzione helper definita in data-logic.js (assicurati che esista o copiala qui se serve)
    const isFestivo = (typeof isItalianHoliday === 'function') ? isItalianHoliday(dateObj) : (dateObj.getDay() === 0);

    const dayTypeLabel = isFestivo 
        ? `<span class="badge-holiday">${window.t('badge_holiday')}</span>` 
        : `<span class="badge-weekday">${window.t('badge_weekday')}</span>`;

    // Chiamata RPC
    const { data, error } = await window.supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    if (error || !data || data.length === 0) { 
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">event_busy</span><br>
                <strong>${window.t('bus_not_found')}</strong><br>
                <div style="margin-top:5px;">${dayTypeLabel}</div>
                <small style="display:block; margin-top:5px;">${window.t('bus_try_change')}</small>
            </div>`; 
        return; 
    }

    // Risultati
    const primo = data[0];
    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e0f7fa; text-transform:uppercase; font-weight:bold;">${window.t('next_departure')}</span>
            ${dayTypeLabel}
        </div>
        <div class="bus-time-big">${primo.ora_partenza.slice(0,5)}</div>
        <div style="font-size:1rem; color:#e0f7fa;">${window.t('arrival')}: <strong>${primo.ora_arrivo.slice(0,5)}</strong></div>
        <div style="font-size:0.8rem; color:#b2ebf2; margin-top:5px;">${primo.nome_linea || 'Linea ATC'}</div>
    `;

    const successivi = data.slice(1);
    list.innerHTML = successivi.map(b => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
            <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
        </div>
    `).join('');
    
    // Autoscroll
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
};

// ============================================================
// 5. LOGICA RICERCA TRAGHETTI (Battello) - FIXATO
// ============================================================

// Assicuriamoci che FERRY_STOPS sia disponibile qui per evitare errori di riferimento
const FERRY_STOPS_UI = [
    { id: 'levanto', label: 'Levanto' },
    { id: 'monterosso', label: 'Monterosso' },
    { id: 'vernazza', label: 'Vernazza' },
    { id: 'corniglia', label: 'Corniglia' },
    { id: 'manarola', label: 'Manarola' },
    { id: 'riomaggiore', label: 'Riomaggiore' },
    { id: 'portovenere', label: 'Portovenere' },
    { id: 'la spezia', label: 'La Spezia' },
    { id: 'lerici', label: 'Lerici' }
];

window.initFerrySearch = function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    if (!selPart || !selArr) return;

    // Popola Partenza (Tutte le fermate)
    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + 
        FERRY_STOPS_UI.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

    // Listener: Quando cambio partenza, abilito arrivo
    selPart.addEventListener('change', function() {
        const startVal = this.value;
        // Filtra destinazioni (tutte tranne la partenza)
        const destOpts = FERRY_STOPS_UI.filter(s => s.id !== startVal);
        
        selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + 
            destOpts.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        selArr.disabled = false;
    });
};

window.eseguiRicercaTraghetto = async function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    const selOra = document.getElementById('selOraFerry');

    const resultsContainer = document.getElementById('ferryResultsContainer');
    const nextCard = document.getElementById('nextFerryCard');
    const list = document.getElementById('otherFerryList');

    if (!selPart.value || !selArr.value || !selOra.value) return;

    // UI Loading
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">${window.t('loading')} <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    const startCol = selPart.value; // es. 'monterosso'
    const endCol = selArr.value;    // es. 'vernazza'
    const timeFilter = selOra.value; // es. '14:30'

    // 1. Fetch Dati (Prendiamo tutto e filtriamo in JS per semplicità)
    // Selezioniamo solo le colonne che ci interessano + id
    const { data, error } = await window.supabaseClient
        .from('Orari_traghetti')
        .select(`id, direzione, validita, "${startCol}", "${endCol}"`); 

    if (error || !data) {
        nextCard.innerHTML = `<p style="padding:15px; text-align:center;">${window.t('error')}: ${error ? error.message : 'Nessun dato'}</p>`;
        return;
    }

    // 2. Filtro Logico JS
    let validRuns = data.filter(row => {
        const tStart = row[startCol]; // Orario partenza
        const tEnd = row[endCol];     // Orario arrivo

        // A. Devono esistere entrambi gli orari (il battello ferma in entrambi)
        if (!tStart || !tEnd) return false;

        // B. Controllo orario: L'orario di partenza deve essere minore dell'arrivo
        // (Questo gestisce implicitamente la Direzione Andata/Ritorno senza guardare la colonna 'direzione')
        if (tStart >= tEnd) return false;

        // C. Filtro orario utente: La partenza deve essere futura rispetto alla selezione
        if (tStart < timeFilter) return false;

        return true;
    });

    // 3. Ordinamento (Per orario di partenza)
    validRuns.sort((a, b) => a[startCol].localeCompare(b[startCol]));

    // 4. Render Risultati
    if (validRuns.length === 0) {
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">directions_boat_filled</span><br>
                <strong>${window.t('bus_not_found')}</strong><br>
                <small style="display:block; margin-top:5px;">Verifica che la tratta sia diretta.</small>
            </div>`;
        return;
    }

    // Primo Risultato (Highlight)
    const primo = validRuns[0];
    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e1f5fe; text-transform:uppercase; font-weight:bold;">${window.t('next_departure')}</span>
            <span class="badge-weekday" style="background:#0288D1">Navigazione</span>
        </div>
        <div class="bus-time-big">${primo[startCol].slice(0,5)}</div>
        <div style="font-size:1rem; color:#e1f5fe;">${window.t('arrival')}: <strong>${primo[endCol].slice(0,5)}</strong></div>
        <div style="font-size:0.75rem; color:#b3e5fc; margin-top:5px;">Direzione: ${primo.direzione || '--'}</div>
    `;

    // Lista successivi
    const successivi = validRuns.slice(1);
    list.innerHTML = successivi.map(run => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#01579b;">${run[startCol].slice(0,5)}</span>
            <span style="color:#666;">➜ ${run[endCol].slice(0,5)}</span>
        </div>
    `).join('');

    // Autoscroll
    setTimeout(() => { 
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }, 150);
};