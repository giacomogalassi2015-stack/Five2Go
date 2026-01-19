console.log("✅ 2. ui-renderers.js caricato");

// RENDERER SENTIERO
window.sentieroRenderer = (s) => {
    const paese = window.dbCol(s, 'Paesi');
    const distanza = s.Distanza || '--';
    const durata = s.Durata || '--';
    const extra = window.dbCol(s, 'Extra') || 'Sentiero';
    const gpxUrl = s.Gpxlink || s.gpxlink;

    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return `
    <div class="card-sentiero-modern">
        <div id="${uniqueMapId}" class="sentiero-map-bg"></div>
        <div class="sentiero-card-overlay">
            <h2 class="sentiero-overlay-title">${paese}</h2>
            <div class="sentiero-stats">
                <div class="stat-pill"><span class="stat-icon">📏</span><span class="stat-val">${distanza}</span></div>
                <div class="stat-pill"><span class="stat-icon">🕒</span><span class="stat-val">${durata}</span></div>
                <div class="stat-pill"><span class="stat-icon">🏷️</span><span class="stat-val">${extra}</span></div>
            </div>
            <button class="btn-outline-details" onclick='openModal("trail", ${JSON.stringify(s).replace(/'/g, "'")})'>
                Dettagli Percorso
            </button>
        </div>
    </div>`;
};

// RENDERER RISTORANTE
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const indirizzo = r.Indirizzo || '';
    const safeObj = encodeURIComponent(JSON.stringify(r));
    // Correzione URL Mappa
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi + ' Cinque Terre')}`;
    const phoneLink = r.Telefono ? `tel:${r.Telefono}` : '#';
    const phoneColor = r.Telefono ? '#2E7D32' : '#B0BEC5';
    const phoneCursor = r.Telefono ? 'pointer' : 'default';

    return `
    <div class="animate-fade" style="background: #ffffff; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); overflow: hidden; font-family: Roboto; border: 1px solid #eee;">
        <div onclick="openModal('restaurant', '${safeObj}')" style="padding: 20px; cursor: pointer;">
            <div style="font-size: 1.25rem; font-weight: 800; color: #2c3e50; margin-bottom: 6px; line-height: 1.2;">${nome}</div>
            <div style="font-size: 0.95rem; color: #7f8c8d; display: flex; align-items: center; gap: 5px;"><span>📍</span> ${paesi} ${indirizzo ? ' • ' + indirizzo : ''}</div>
        </div>
        <div style="display: flex; border-top: 1px solid #f0f0f0; background: #fafafa;">
            <div onclick="openModal('restaurant', '${safeObj}')" style="flex: 1; padding: 15px 0; text-align: center; cursor: pointer; border-right: 1px solid #eee; color: #F57C00;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">📄</div><div style="font-size: 0.7rem; font-weight: bold;">SCHEDA</div>
            </div>
            <a href="${phoneLink}" style="flex: 1; padding: 15px 0; text-align: center; text-decoration: none; border-right: 1px solid #eee; cursor: ${phoneCursor}; color: ${phoneColor};">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">📞</div><div style="font-size: 0.7rem; font-weight: bold;">CHIAMA</div>
            </a>
            <a href="${mapLink}" target="_blank" style="flex: 1; padding: 15px 0; text-align: center; text-decoration: none; color: #1565C0;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">🗺️</div><div style="font-size: 0.7rem; font-weight: bold;">MAPPA</div>
            </a>
        </div>
    </div>`;
};

// RENDERER SPIAGGIA
window.spiaggiaRenderer = (s) => {
    const nome = window.dbCol(s, 'Nome') || 'Spiaggia';
    const paesi = window.dbCol(s, 'Paesi');
    const desc = window.dbCol(s, 'Descrizione') || '';
    const safePaesi = paesi.replace(/'/g, "\\'");
    const safeDesc = desc.replace(/'/g, "\\'");
    // Correzione URL Mappa
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="card-spiaggia" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
        <div class="spiaggia-header"><div class="spiaggia-location">📍 ${paesi}</div><span>🏖️</span></div>
        <div class="item-title" style="font-size: 1.3rem; margin: 10px 0;">${nome}</div>
        <div class="spiaggia-footer">
            <a href="${mapLink}" target="_blank" class="btn-azure" onclick="event.stopPropagation()">${window.t('btn_position')}</a>
        </div>
    </div>`;
};

// RENDERER FARMACIA
window.farmaciaRenderer = (f) => {
    const nome = window.dbCol(f, 'Nome');
    const paesi = window.dbCol(f, 'Paesi');
    const safeObj = JSON.stringify(f).replace(/'/g, "'");
    const fullAddress = `${f.Indirizzo}, ${f.Paesi}`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return `
    <div class="card-list-item" onclick='openModal("farmacia", ${safeObj})'>
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${nome}</div><div class="item-tag" style="background-color:#4CAF50;">${window.t('pharmacy_tag')}</div></div>
            <div class="item-subtitle">📍 ${paesi}</div>
            <div class="card-actions">
                ${f.Numero ? `<a href="tel:${f.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()"><span>📞</span> ${window.t('btn_call')}</a>` : ''}
                ${f.Indirizzo ? `<a href="${mapLink}" target="_blank" class="action-btn btn-map" onclick="event.stopPropagation()"><span>🗺️</span> ${window.t('btn_map')}</a>` : ''}
            </div>
        </div>
    </div>`;
};

// RENDERER NUMERI UTILI
window.numeriUtiliRenderer = (n) => {
    const nome = window.dbCol(n, 'Nome');
    const comune = window.dbCol(n, 'Comune');
    const paesi = window.dbCol(n, 'Paesi'); 
    return `
    <div class="card-list-item" style="cursor:default;">
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${nome}</div><div class="item-tag" style="background-color:#607d8b;">${comune}</div></div>
            <div class="item-subtitle" style="margin-top:6px; color:#555;"><strong>${window.t('coverage')}:</strong> ${paesi}</div>
            <div class="card-actions">
                <a href="tel:${n.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()">
                    <span style="font-size:1.2rem; margin-right:5px;">📞</span> ${window.t('btn_call')} ${n.Numero}
                </a>
            </div>
        </div>
    </div>`;
};

// RENDERER ATTRAZIONI
window.attrazioniRenderer = (item) => {
    const titolo = window.dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = window.dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const diff = window.dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    const isHard = diff.toLowerCase().match(/alta|hard|difficile|schwer|difícil/); 
    const diffStyle = isHard ? 'background:#ffebee; color:#c62828;' : 'background:#e8f5e9; color:#2e7d32;';

    return `
    <div class="card-list-item monument-mode" onclick="openModal('attrazione', ${myId})">
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${titolo}</div></div>
            <div class="item-subtitle" style="margin-bottom: 8px;">📍 ${paese}</div>
            <div class="monument-meta" style="display:flex; gap:8px;">
                <span class="meta-badge" style="${diffStyle} padding:2px 8px; border-radius:4px; font-size:0.75rem;">${diff}</span>
                <span class="meta-badge badge-time" style="background:#f5f5f5; padding:2px 8px; border-radius:4px; font-size:0.75rem;">⏱ ${item["Tempo Visita (min)"] || '--'} ${window.t('visit_time')}</span>
            </div>
        </div>
        <div class="item-arrow" style="margin-top: auto; margin-bottom: auto;">➜</div>
    </div>`;
};

// ============================================================
// SEZIONE LOGICA PRINCIPALE (Proveniente da app.js)
// ============================================================

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
        const desc = window.dbCol(item, 'Descrizione') || '';
        
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
            // === CASO NON BUS (TRENI, TRAGHETTI, ECC.) ===
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

// --- FUNZIONE CHE CREA LA MAPPA BUS ---
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