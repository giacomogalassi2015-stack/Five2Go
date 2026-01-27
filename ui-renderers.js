console.log("✅ 2. ui-renderers.js caricato (Refactored IDs)");

// ============================================================
// 1. RENDERER DELLE CARD (LISTE)
// ============================================================

window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    // CHANGE: Pass ID instead of full object
    const itemId = r.id || r.ID;
    const mapLink = r.Mappa || `https://www.google.com/maps/search/?api=1&query=$?q=$?q=${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="restaurant-glass-card"> 
        <h3 class="rest-card-title">${nome}</h3>
        <p class="rest-card-subtitle"><span class="material-icons">restaurant</span> ${paesi}</p>
        <div class="rest-card-actions">
            <div class="action-btn btn-info rest-btn-size" onclick="openModal('ristorante', '${itemId}')">
                <span class="material-icons">info_outline</span>
            </div>
            ${numero ? `<div class="action-btn btn-call rest-btn-size" onclick="window.location.href='tel:${numero}'"><span class="material-icons">call</span></div>` : ''}
            <div class="action-btn btn-map rest-btn-size" onclick="window.open('${mapLink}', '_blank')"><span class="material-icons">map</span></div>
        </div>
    </div>`;
};

window.spiaggiaRenderer = function(item) {
    const nome = item.Nome || 'Spiaggia';
    const comune = item.Paese || item.Comune || '';
    const tipo = item.Tipo || 'Spiaggia'; 
    const iconClass = 'fa-water';
    // ID is already safe to pass directly
    return `<div class="culture-card is-beach animate-fade" onclick="openModal('Spiagge', '${item.id}')"><div class="culture-info">${comune ? `<div class="culture-location"><span class="material-icons icon-sm">place</span> ${comune}</div>` : ''}<h3 class="culture-title">${nome}</h3><div class="culture-tags"><span class="c-pill">${tipo}</span></div></div><div class="culture-bg-icon"><i class="fa-solid ${iconClass}"></i></div></div>`;
};

window.sentieroRenderer = (s) => {
    const paese = window.dbCol(s, 'Paesi');
    const titoloMostrato = s.Nome || paese; 
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    
    // CHANGE: Pass ID instead of full object
    const itemId = s.id || s.ID;

    let diffColor = '#f39c12';
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60';
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b';
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }
    
    return `<div class="trail-card-modern animate-fade"><div id="${uniqueMapId}" class="trail-map-container" onclick="event.stopPropagation(); openModal('map', '${gpxUrl}')"></div><div class="trail-info-overlay"><h3 class="text-center font-bold color-dark" style="margin: 5px 0; font-family:'Roboto Slab'; font-size: 1.25rem;">${titoloMostrato}</h3><div class="text-center text-uppercase font-bold mb-20" style="font-size:0.75rem; color:${diffColor}; letter-spacing:1px;">${diff}</div><button onclick="openModal('trail', '${itemId}')" class="btn-trail-action">${window.t('btn_details')} <span class="material-icons" style="font-size:1.1rem;">arrow_forward</span></button></div></div>`;
};

window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();
    let themeClass = 'is-wine-red'; 
    if (tipo.includes('bianco')) themeClass = 'is-wine-white';
    if (tipo.includes('rosato') || tipo.includes('orange')) themeClass = 'is-wine-orange';
    return `<div class="culture-card ${themeClass} animate-fade" onclick="openModal('Vini', '${safeId}')"><div class="culture-info">${cantina ? `<div class="culture-location"><span class="material-icons icon-sm">storefront</span> ${cantina}</div>` : ''}<div class="culture-title">${nome}</div><div class="culture-tags"><span class="c-pill" style="text-transform: capitalize;">${item.Tipo || 'Vino'}</span></div></div><div class="culture-bg-icon"><i class="fa-solid fa-wine-bottle"></i></div></div>`;
};

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
    // Numeri utili raramente aprono modali, solo chiamata
    return `<div class="info-card animate-fade"><div class="info-icon-box"><span class="material-icons">${icon}</span></div><div class="info-text-col"><h3>${nome}</h3><p><span class="material-icons icon-sm">place</span> ${paesi}</p></div><div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'"><span class="material-icons">call</span></div></div>`;
};

window.farmacieRenderer = (f) => {
    const nome = window.dbCol(f, 'Farmacia') || window.dbCol(f, 'Nome') || 'Farmacia';
    const paese = window.dbCol(f, 'Paese') || window.dbCol(f, 'Paesi') || '';
    const numero = f.Telefono || f.Numero || '';
    const itemId = f.id || f.ID;
    return `<div class="info-card animate-fade" onclick="openModal('farmacia', '${itemId}')"><div class="info-icon-box"><span class="material-icons">local_pharmacy</span></div><div class="info-text-col"><h3>${nome}</h3><p><span class="material-icons icon-sm">place</span> ${paese}</p></div><div class="action-btn btn-call" onclick="event.stopPropagation(); window.location.href='tel:${numero}'"><span class="material-icons">call</span></div></div>`;
};

window.attrazioniRenderer = (item) => {
    // CHANGE: Use ID or POI_ID preferentially
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = window.dbCol(item, 'Paese');
    const tempo = item.Tempo_visita || '--'; 
    const diff = window.dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    const rawLabel = window.dbCol(item, 'Label') || 'Storico';
    const label = rawLabel.toLowerCase().trim(); 
    let themeClass = 'is-monument';
    let iconClass = 'fa-landmark'; 
    if (label === 'religioso') { themeClass = 'is-church'; iconClass = 'fa-church'; }
    else if (label === 'panorama') { themeClass = 'is-view'; iconClass = 'fa-mountain-sun'; }
    else if (label === 'storico') { themeClass = 'is-monument'; iconClass = 'fa-chess-rook'; }
    
    return `<div class="culture-card ${themeClass} animate-fade" onclick="openModal('attrazione', '${safeId}')"><div class="culture-info"><div class="culture-location"><span class="material-icons icon-sm">place</span> ${paese}</div><div class="culture-title">${titolo}</div><div class="culture-tags"><span class="c-pill"><span class="material-icons icon-xs">schedule</span> ${tempo}</span><span class="c-pill">${diff}</span></div></div><div class="culture-bg-icon"><i class="fa-solid ${iconClass}"></i></div></div>`;
};

window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const ideale = window.dbCol(p, 'Ideale per') || 'Tutti'; 
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200);
    // CHANGE: Pass ID
    const itemId = p.id || p.ID;
    return `<div class="culture-card is-product animate-fade" onclick="openModal('product', '${itemId}')"><div class="culture-info"><div class="culture-title">${titolo}</div><div class="product-subtitle"><span class="material-icons">stars</span> ${window.t('ideal_for')}: ${ideale}</div></div><div class="culture-product-thumb"><img src="${imgUrl}" loading="lazy" alt="${titolo}"></div></div>`;
};

// ============================================================
// 2. LOGICA MODALE (Factory Pattern - vedi strategies.js)
// ============================================================

window.openModal = async function(type, payload) {
    console.log("Opening Modal (ID Pattern):", type, payload);
    const generator = window.ModalFactory.create(type, payload);
    const contentHtml = generator.generate();
    const modalClass = generator.getClass();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    modal.innerHTML = `<div class="${modalClass}"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
};

// ============================================================
// 3. TEMPLATE HELPERS (Per i Trasporti - Invariato)
// ============================================================

window.renderBusTemplate = (item) => {
    const infoSms = window.dbCol(item, 'Info_SMS');
    const infoApp = window.dbCol(item, 'Info_App');
    const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
    const hasTicketInfo = infoSms || infoApp || infoAvvisi;

    let ticketSection = '';
    if (hasTicketInfo) {
        ticketSection = `
        <button onclick="toggleTicketInfo()" class="ticket-toggle-btn">🎟️ ${window.t('how_to_ticket')} ▾</button>
        <div id="ticket-info-box" class="ticket-info-content">
            ${infoSms ? `<p class="mb-10"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
            ${infoApp ? `<p class="mb-10"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
            ${infoAvvisi ? `<div class="warning-box"><strong>⚠️ ${window.t('label_warning')}:</strong> ${infoAvvisi}</div>` : ''}
        </div>`;
    }

    const mapToggleSection = `
        <button id="btn-bus-map-toggle" onclick="toggleBusMap()" class="map-toggle-btn">🗺️ ${window.t('show_map')} ▾</button>
        <div id="bus-map-wrapper" class="map-hidden-container"><div id="bus-map" class="bus-map-frame"></div><p class="map-modal-hint">${window.t('map_hint')}</p></div>`;

    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    return `
    <div class="bus-search-box animate-fade">
        <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;"><span class="material-icons">directions_bus</span> ${window.t('plan_trip')}</div>
        ${ticketSection} ${mapToggleSection}
        <div class="bus-inputs">
            <div style="flex:1;"><label class="input-label-sm">${window.t('departure')}</label><select id="selPartenza" class="bus-select" onchange="filterDestinations(this.value)"><option value="" disabled selected>${window.t('loading')}...</option></select></div>
            <div style="flex:1;"><label class="input-label-sm">${window.t('arrival')}</label><select id="selArrivo" class="bus-select" disabled><option value="" disabled selected>${window.t('select_start')}</option></select></div>
        </div>
        <div class="bus-inputs">
            <div style="flex:1;"><label class="input-label-sm">${window.t('date_trip')}</label><input type="date" id="selData" class="bus-select" value="${todayISO}"></div>
            <div style="flex:1;"><label class="input-label-sm">${window.t('time_trip')}</label><input type="time" id="selOra" class="bus-select" value="${nowTime}"></div>
        </div>
        <button id="btnSearchBus" onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px; opacity: 0.5; pointer-events: none;">${window.t('find_times')}</button>
        <div id="busResultsContainer" class="d-none mt-20"><div id="nextBusCard" class="bus-result-main"></div><div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">${window.t('next_runs')}:</div><div id="otherBusList" class="bus-list-container"></div></div>
    </div>`;
};

window.renderFerryTemplate = () => {
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    return `
    <div class="bus-search-box animate-fade">
        <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;"><span class="material-icons" style="background: linear-gradient(135deg, #0288D1, #0277BD); box-shadow: 0 4px 6px rgba(2, 119, 189, 0.3);">directions_boat</span> ${window.t('plan_trip')} (Battello)</div>
        <button onclick="toggleTicketInfo()" class="ticket-toggle-btn" style="background:#e1f5fe; color:#01579b; border-color:#b3e5fc;">🎟️ ${window.t('how_to_ticket')} ▾</button>
        <div id="ticket-info-box" class="ticket-info-content"><p>I biglietti sono acquistabili presso le biglietterie al molo.</p><div class="warning-box"><strong>⚠️ INFO METEO:</strong> In caso di mare mosso il servizio è sospeso.</div></div>
        <div class="bus-inputs">
            <div style="flex:1;"><label class="input-label-sm">${window.t('departure')}</label><select id="selPartenzaFerry" class="bus-select"><option value="" disabled selected>${window.t('loading')}...</option></select></div>
            <div style="flex:1;"><label class="input-label-sm">${window.t('arrival')}</label><select id="selArrivoFerry" class="bus-select"><option value="" disabled selected>${window.t('select_start')}</option></select></div>
        </div>
        <div class="bus-inputs">
            <div style="flex:1;"><label class="input-label-sm">${window.t('date_trip')}</label><input type="date" id="selDataFerry" class="bus-select" value="${todayISO}"></div>
            <div style="flex:1;"><label class="input-label-sm">${window.t('time_trip')}</label><input type="time" id="selOraFerry" class="bus-select" value="${nowTime}"></div>
        </div>
        <button onclick="eseguiRicercaTraghetto()" class="btn-yellow" style="background: linear-gradient(135deg, #0288D1 0%, #01579b 100%); color:white; width:100%; font-weight:bold; margin-top:5px; box-shadow: 0 10px 25px -5px rgba(2, 136, 209, 0.4);">${window.t('find_times')}</button>
        <div id="ferryResultsContainer" class="d-none mt-20"><div id="nextFerryCard" class="bus-result-main" style="background: linear-gradient(135deg, #0277BD 0%, #01579b 100%); box-shadow: 0 15px 30px -5px rgba(1, 87, 155, 0.3);"></div><div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">${window.t('next_runs')}:</div><div id="otherFerryList" class="bus-list-container"></div></div>
    </div>`;
};

// ============================================================
// 4. MAP & UTILS (GPX Init, Bottom Sheet Filters)
// ============================================================

window.initGpxMap = function(divId, gpxUrl) {
    const element = document.getElementById(divId);
    if (element) {
        const map = L.map(divId);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CARTO', maxZoom: 20 }).addTo(map);
        new L.GPX(gpxUrl, {
            async: true,
            marker_options: { startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] },
            polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
        }).on('loaded', function(e) { map.fitBounds(e.target.getBounds(), { padding: [30, 30] }); }).addTo(map);
        setTimeout(() => { map.invalidateSize(); }, 300);
    }
};

window.renderGenericFilterableView = function(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');
    const oldSheet = document.getElementById('filter-sheet'); if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay'); if (oldOverlay) oldOverlay.remove();
    const oldBtn = document.getElementById('filter-toggle-btn'); if (oldBtn) oldBtn.remove();
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
    const overlay = document.createElement('div'); overlay.id = 'filter-overlay'; overlay.className = 'sheet-overlay';
    const sheet = document.createElement('div'); sheet.id = 'filter-sheet'; sheet.className = 'bottom-sheet';
    sheet.innerHTML = `<div class="sheet-header"><div class="sheet-title">${window.t('filter_title')}</div><div class="material-icons sheet-close" onclick="closeFilterSheet()">close</div></div><div class="filter-grid" id="sheet-options"></div>`;
    document.body.appendChild(overlay); document.body.appendChild(sheet);
    const optionsContainer = sheet.querySelector('#sheet-options');
    let activeTag = 'Tutti'; 
    uniqueTags.forEach(tag => {
        const chip = document.createElement('button'); chip.className = 'sheet-chip';
        if (tag === 'Tutti') chip.classList.add('active-filter');
        chip.innerText = (tag === 'Tutti') ? window.t('filter_all') : tag; 
        chip.onclick = () => {
            document.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active-filter'));
            chip.classList.add('active-filter');
            activeTag = tag;
            const filtered = tag === 'Tutti' ? allData : allData.filter(item => { const valDB = item[filterKey] ? item[filterKey].trim() : ''; return valDB.includes(tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza')); });
            updateList(filtered); closeFilterSheet();
        };
        optionsContainer.appendChild(chip);
    });
    const filterBtn = document.createElement('button'); filterBtn.id = 'filter-toggle-btn'; filterBtn.innerHTML = '<span class="material-icons">filter_list</span>'; filterBtn.style.display = 'block'; document.body.appendChild(filterBtn);
    window.openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };
    window.closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    filterBtn.onclick = window.openFilterSheet; overlay.onclick = window.closeFilterSheet;
    function updateList(items) {
        if (!items || items.length === 0) { listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${window.t('no_results')}</p>`; return; }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        if (typeof window.initPendingMaps === 'function') setTimeout(() => window.initPendingMaps(), 100);
    }
    updateList(allData);
};

window.renderDoubleFilterView = function(allData, filtersConfig, container, cardRenderer) {
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');
    const oldSheet = document.getElementById('filter-sheet'); if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay'); if (oldOverlay) oldOverlay.remove();
    const oldBtn = document.getElementById('filter-toggle-btn'); if (oldBtn) oldBtn.remove();

    const getUniqueValues = (key, customOrder = []) => {
        const raw = allData.map(i => window.dbCol(i, key)).filter(x => x).map(x => x.trim());
        let unique = [...new Set(raw)];
        if (customOrder && customOrder.length > 0) { return unique.sort((a, b) => { const idxA = customOrder.indexOf(a); const idxB = customOrder.indexOf(b); if (idxA !== -1 && idxB !== -1) return idxA - idxB; if (idxA !== -1) return -1; if (idxB !== -1) return 1; return a.localeCompare(b); }); } else { return unique.sort(); }
    };
    const values1 = getUniqueValues(filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(filtersConfig.secondary.key, filtersConfig.secondary.customOrder);
    let activeVal1 = 'Tutti'; let activeVal2 = 'Tutti';

    const overlay = document.createElement('div'); overlay.className = 'sheet-overlay';
    const sheet = document.createElement('div'); sheet.className = 'bottom-sheet';
    const title1 = filtersConfig.primary.title || window.t('filter_village');
    const title2 = filtersConfig.secondary.title || window.t('filter_cat');

    sheet.innerHTML = `<div class="sheet-header"><div class="sheet-title">${window.t('filter_title')}</div><div class="material-icons sheet-close" onclick="closeFilterSheet()">close</div></div><div class="filter-section-title">${title1}</div><div class="filter-grid" id="section-1-options"></div><div class="filter-section-title" style="margin-top: 25px;">${title2}</div><div class="filter-grid" id="section-2-options"></div><button class="btn-apply-filters" onclick="closeFilterSheet()">${window.t('show_results')}</button>`;
    document.body.appendChild(overlay); document.body.appendChild(sheet);

    function renderChips() {
        const c1 = sheet.querySelector('#section-1-options'); c1.innerHTML = '';
        c1.appendChild(createChip(window.t('filter_all'), activeVal1 === 'Tutti', () => { activeVal1 = 'Tutti'; applyFilters(); renderChips(); }));
        values1.forEach(v => { c1.appendChild(createChip(v, activeVal1 === v, () => { activeVal1 = v; applyFilters(); renderChips(); })); });
        const c2 = sheet.querySelector('#section-2-options'); c2.innerHTML = '';
        c2.appendChild(createChip(window.t('filter_all'), activeVal2 === 'Tutti', () => { activeVal2 = 'Tutti'; applyFilters(); renderChips(); }));
        values2.forEach(v => { const label = v.charAt(0).toUpperCase() + v.slice(1); c2.appendChild(createChip(label, activeVal2 === v, () => { activeVal2 = v; applyFilters(); renderChips(); })); });
    }
    function createChip(text, isActive, onClick) {
        const btn = document.createElement('button'); btn.className = 'sheet-chip';
        if (isActive) btn.classList.add('active-filter');
        btn.innerText = text; btn.onclick = onClick; return btn;
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
        if (!items || items.length === 0) { listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${window.t('no_results')}</p>`; } 
        else { listContainer.innerHTML = items.map(item => cardRenderer(item)).join(''); }
    }
    const filterBtn = document.createElement('button'); filterBtn.id = 'filter-toggle-btn'; filterBtn.innerHTML = '<span class="material-icons">filter_list</span>'; filterBtn.style.display = 'block'; document.body.appendChild(filterBtn);
    window.openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };
    window.closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    filterBtn.onclick = window.openFilterSheet; overlay.onclick = window.closeFilterSheet;
    renderChips(); updateList(allData);
};