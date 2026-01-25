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

// === RENDERER SENTIERO (Centrato e Adattivo) ===
window.sentieroRenderer = (s) => {
    const paese = window.dbCol(s, 'Paesi');
    // Se c'è un nome specifico lo usiamo, altrimenti usiamo il paese
    const titoloMostrato = s.Nome || paese; 
    const distanza = s.Distanza || '--';
    const durata = s.Durata || '--';
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");

    // Calcolo Colore Testo Difficoltà (Invece del badge)
    let diffColor = '#f39c12'; // Default (Media - Arancio)
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60'; // Verde
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('expert') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b'; // Rosso

    // Inizializza mappa
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return `
    <div class="trail-card-modern animate-fade">
        <div id="${uniqueMapId}" class="trail-map-container" 
             onclick="event.stopPropagation(); openModal('map', '${gpxUrl}')">
        </div>

        <div class="trail-info-overlay" onclick="openModal('trail', '${safeObj}')" style="text-align: center;"> <h3 style="margin:0 0 5px 0; font-family:'Roboto Slab'; font-size: clamp(1.2rem, 5vw, 1.5rem); color:#222; line-height:1.2;">
                ${titoloMostrato}
            </h3>

            <div style="font-size:0.9rem; font-weight:700; color:${diffColor}; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px;">
                ${diff}
            </div>

            <div class="trail-stats-row">
                <div class="stat-bubble">
                    <strong>${distanza}</strong>
                    <span>Distanza</span>
                </div>
                <div class="stat-bubble">
                    <strong>${durata}</strong>
                    <span>Tempo</span>
                </div>
            </div>

            <button style="width:100%; padding:14px; border:none; background:#2D3436; color:white; border-radius:14px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:8px;">
                Vedi Dettagli <span class="material-icons" style="font-size:1rem;">arrow_forward</span>
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

// === RENDERER PRODOTTO (Compatto: 140px Altezza) ===
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    
    // Immagine Sfondo
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 600);
    
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="prod-card-fixed animate-fade" 
         style="background-image: url('${imgUrl}');" 
         onclick="openModal('product', '${safeObj}')">
         
         <div class="prod-overlay-fixed">
            <div class="prod-title-fixed">${titolo}</div>
         </div>
         
    </div>`;
};

// ============================================================
// LOGICA MODALE PRINCIPALE (window.openModal)
// ============================================================
window.openModal = async function(type, payload) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';
    let modalClass = 'modal-content'; 
// --- INCOLLA QUESTO SUBITO DOPO AVER CREATO IL DIV MODAL ---
    let item = null; 
    // Tentativo di recupero standard per Vini e Attrazioni
    if (window.currentTableData && (type === 'Vini' || type === 'Attrazioni' || type === 'Spiagge')) {
        // Cerca per ID standard o POI_ID
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
    }
    // --- PRODOTTI ---
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
                ${ideale ? `
                <div style="margin-bottom: 20px;">
                    <span class="glass-tag">✨ ${window.t('ideal_for')}: ${ideale}</span>
                </div>` : ''}
                <p style="font-size: 1.05rem; line-height: 1.6; color: #444;">${desc || ''}</p>
            </div>`;
    }

   // --- TRASPORTI ---
    else if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) { console.error("Errore recupero trasporto"); return; }
        
        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(item, 'Descrizione') || '';
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
        const hasTicketInfo = infoSms || infoApp || infoAvvisi;
        const isBus = nome.toLowerCase().includes('bus') || nome.toLowerCase().includes('autobus') || nome.toLowerCase().includes('atc');
        const isTrain = nome.toLowerCase().includes('tren') || nome.toLowerCase().includes('ferrovi') || nome.toLowerCase().includes('stazione');
        let customContent = '';

        if (isBus) {
            // Sezione Ticket (invariata)
            let ticketSection = '';
            if (hasTicketInfo) {
                // ... (tuo codice ticket HTML esistente) ...
            }

            const now = new Date();
            const todayISO = now.toISOString().split('T')[0];
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            // --- NUOVO HTML: Solo Partenza e Arrivo "Reattivi" ---
            customContent = `
            <div class="bus-search-box animate-fade">
                <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;">
                    <span class="material-icons">directions_bus</span> ${window.t('plan_trip')}
                </div>
                
                ${ticketSection}

                <div class="bus-inputs">
                    <div style="flex:1;">
                        <label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('departure')}</label>
                        <select id="selPartenza" class="bus-select" onchange="filterDestinations(this.value)">
                            <option value="" disabled selected>Caricamento...</option>
                        </select>
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('arrival')}</label>
                        <select id="selArrivo" class="bus-select" disabled>
                            <option value="" disabled selected>-- Seleziona Partenza --</option>
                        </select>
                    </div>
                </div>

                <div class="bus-inputs">
                    <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('date_trip')}</label><input type="date" id="selData" class="bus-select" value="${todayISO}"></div>
                    <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('time_trip')}</label><input type="time" id="selOra" class="bus-select" value="${nowTime}"></div>
                </div>
                
                <button id="btnSearchBus" onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px; opacity: 0.5; pointer-events: none;">${window.t('find_times')}</button>
                
                <div id="busResultsContainer" style="display:none; margin-top:20px;"><div id="nextBusCard" class="bus-result-main"></div><div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">${window.t('next_runs')}:</div><div id="otherBusList" class="bus-list-container"></div></div>
            </div>`;
            
            // Appena aperta la modale, carichiamo TUTTE le fermate nella Partenza
            setTimeout(() => { loadAllStops(); }, 50);

        }
        else if (isTrain) {
            const now = new Date();
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            if (window.trainSearchRenderer) { customContent = window.trainSearchRenderer(null, nowTime); } 
            else { customContent = "<p>Errore interfaccia Treni.</p>"; }
        }
        else {
            if (hasTicketInfo) {
                 customContent = `
                 <button onclick="toggleTicketInfo()" style="width:100%; margin-top:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    🎟️ ${window.t('how_to_ticket')}
                 </button>
                 <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-top:10px;">
                    ${infoSms ? `<p><strong>SMS:</strong> ${infoSms}</p>` : ''}
                    ${infoApp ? `<p><strong>APP:</strong> ${infoApp}</p>` : ''}
                    ${infoAvvisi ? `<p style="color:#856404; background:#fff3cd; padding:5px;">${infoAvvisi}</p>` : ''}
                 </div>`;
            } else { customContent = `<div style="text-align:center; padding:30px; background:#f9f9f9; border-radius:12px; margin-top:20px; color:#999;">Info coming soon</div>`; }
        }
        if (isBus || isTrain) { contentHtml = customContent; } else { contentHtml = `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`; }
    }

    // --- DETTAGLI SENTIERO ---
    else if (type === 'trail') {
        const p = JSON.parse(decodeURIComponent(payload));
        const titolo = window.dbCol(p, 'Paesi') || p.Nome;
        const nomeSentiero = p.Nome || '';
        const dist = p.Distanza || '--';
        const dura = p.Durata || '--';
        const diff = p.Tag || p.Difficolta || 'Media'; 
        const desc = window.dbCol(p, 'Descrizione') || '';
        const linkGpx = p.Link_Gpx || p.Mappa || '';

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
            ${linkGpx ? `
            <button onclick="openModal('map', '${linkGpx}')" class="btn-trail-action">
                <span class="material-icons">map</span> ${window.t('details_trail')}
            </button>
            ` : ''}
            <div style="margin-top:25px; line-height:1.6; color:#444; font-size:0.95rem; text-align:justify;">${desc}</div>
        </div>`;
    }
 
        // --- MAPPA FULL SCREEN (GPX) ---
    else if (type === 'map') {
        const gpxUrl = payload;
        // Creiamo un ID unico per questa mappa modale
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        
        // Impostiamo un'altezza fissa importante
        contentHtml = `
            <h3 style="text-align:center; margin-bottom:10px;">Mappa Percorso</h3>
            <div id="${uniqueMapId}" style="height: 450px; width: 100%; border-radius: 12px; border: 1px solid #ddd;"></div>
            <p style="text-align:center; font-size:0.8rem; color:#888; margin-top:10px;">Usa due dita per zoomare</p>
        `;

        // --- IL TRUCCO PER FARLA APPARIRE ---
        // Inizializziamo la mappa DOPO che la modale è stata inserita nel DOM (setTimeout)
        setTimeout(() => {
            const element = document.getElementById(uniqueMapId);
            if (element) {
                const map = L.map(uniqueMapId);
                
                // Layer CartoDB (quello bello moderno)
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap, © CARTO',
                    maxZoom: 20
                }).addTo(map);

                // Carichiamo il GPX con le ancore corrette anche qui
                new L.GPX(gpxUrl, {
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
                    map.fitBounds(e.target.getBounds(), { padding: [20, 20] }); 
                }).addTo(map);

                // --- COMANDO MAGICO: Forza il ricalcolo delle dimensioni ---
                setTimeout(() => { map.invalidateSize(); }, 300);
            }
        }, 100); // Ritardo iniziale di 100ms per attendere il render HTML
    }
// --- SCHEDA RISTORANTE (Solo Testo Centrato) ---
    else if (type === 'ristorante' || type === 'restaurant') {
        const item = JSON.parse(decodeURIComponent(payload));
        
        const nome = window.dbCol(item, 'Nome');
        const indirizzo = window.dbCol(item, 'Paesi') || ''; 
        const desc = window.dbCol(item, 'Descrizioni') || 'Dettagli non disponibili.'; 

        contentHtml = `
            <div class="rest-modal-wrapper">
                
                <div class="rest-header">
                    <h2>${nome}</h2>
                    <div class="rest-location">
                        <span class="material-icons">place</span> ${indirizzo}
                    </div>
                    <div class="rest-divider"></div>
                </div>

                <div class="rest-body">
                    ${desc}
                </div>

            </div>`;
    }
    // --- DETTAGLI FARMACIA ---
    else if (type === 'farmacia') {
        const item = JSON.parse(decodeURIComponent(payload)); 
        const nome = window.dbCol(item, 'Nome');
        const paesi = window.dbCol(item, 'Paesi');
        contentHtml = `<h2>${nome}</h2><p>📍 ${item.Indirizzo}, ${paesi}</p><p>📞 <a href="tel:${item.Numero}">${item.Numero}</a></p>`;
    }
  // ... (inizio funzione openModal invariato fino al recupero item) ...

// --- MODALE VINI (Colonne Corrette: Nome, Tipo, Produttore, Uve, Foto, Gradi, Abbinamenti, Descrizione) ---
    if (type === 'Vini' || type === 'wine') {
        
        // 1. RECUPERO ITEM (Più robusto)
        if (!item && window.currentTableData) {
            // Cerca confrontando stringhe e numeri (== invece di ===)
            item = window.currentTableData.find(i => i.id == payload || i.ID == payload);
        }

        // Se ancora non lo trova, stampa errore in console per capire
        if (!item) { 
            console.error("Vino non trovato. Payload:", payload, "Dati:", window.currentTableData);
            modal.innerHTML = `<div class="modal-content"><p style="padding:20px">Errore: Vino non trovato (ID: ${payload})</p></div>`; 
            return; 
        }

        // 2. MAPPATURA VARIABILI (Esattamente le tue colonne)
        const nome = window.dbCol(item, 'Nome');
        const tipo = window.dbCol(item, 'Tipo');
        const produttore = window.dbCol(item, 'Produttore');
        const uve = window.dbCol(item, 'Uve');
        const gradi = window.dbCol(item, 'Gradi');
        const abbinamenti = window.dbCol(item, 'Abbinamenti');
        const desc = window.dbCol(item, 'Descrizione');
        const foto = window.dbCol(item, 'Foto'); // Nuova colonna

        // 3. COLORI
        const t = String(tipo).toLowerCase();
        let color = '#9B2335'; // Rosso
        if (t.includes('bianco')) color = '#F4D03F'; 
        if (t.includes('rosato') || t.includes('orange')) color = '#E67E22'; 

        // 4. HTML
        contentHtml = `
            <div style="padding-bottom: 20px;">
                
                ${foto ? 
                /* SE C'È LA FOTO: Mostra Immagine Grande */
                `<img src="${foto}" style="width:100%; height:280px; object-fit:cover; border-radius:24px 24px 0 0;">` 
                : 
                /* ALTRIMENTI: Mostra Icona Bottiglia */
                `<div style="text-align:center; padding: 30px 20px 20px; background: #fff; border-bottom: 1px dashed #eee;">
                    <i class="fa-solid fa-wine-bottle" style="font-size: 4.5rem; color: ${color}; margin-bottom:15px; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.1));"></i>
                </div>`
                }

                <div style="padding: ${foto ? '25px 25px 0' : '0 25px'};">
                    <h2 style="font-family:'Roboto Slab'; font-size:2rem; margin:0 0 5px 0; line-height:1.1; color:#2c3e50;">${nome}</h2>
                    <div style="font-weight:700; color:#7f8c8d; text-transform:uppercase; font-size:0.9rem; margin-bottom:20px;">
                        <span class="material-icons" style="vertical-align:text-bottom; font-size:1.1rem;">storefront</span> ${produttore}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px 25px; background: #fafafa;">
                    <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">Tipologia</div>
                        <div style="font-size:1rem; font-weight:700; color:${color}">${tipo || '--'}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">Gradi</div>
                        <div style="font-size:1rem; font-weight:700;">${gradi || '--'}</div>
                    </div>
                    ${uve ? `<div style="grid-column:1/-1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; text-align:center; font-size:0.95rem;"><strong>🍇 Uve:</strong> ${uve}</div>` : ''}
                </div>

                <div style="padding: 25px;">
                    <p style="color:#555; font-size:1.05rem; line-height:1.6; margin:0;">${desc}</p>
                    ${abbinamenti ? `
                    <div style="background: #FFF8E1; border-left: 4px solid #FFB74D; padding: 15px; border-radius: 8px; margin-top: 25px; color: #5D4037;">
                        <div style="font-weight:bold; margin-bottom:5px; text-transform:uppercase; font-size:0.8rem;">🍽️ Abbinamenti</div>
                        ${abbinamenti}
                    </div>` : ''}
                </div>
            </div>`;
    }
    // --- MODALE ATTRAZIONI / MONUMENTI (Funzionante & Stile Curato) ---
    else if (type === 'Attrazioni' || type === 'attrazione') {
        
        // 1. Cerca l'item (FIX: Cerca per POI_ID se il payload è una stringa tipo 'P01')
        if (!item && window.currentTableData) {
            item = window.currentTableData.find(i => i.POI_ID == payload || i.id == payload);
        }
        // Fallback per l'indice numerico (se il vecchio renderer manda un numero)
        if (!item && typeof payload === 'number' && window.currentTableData) {
            item = window.currentTableData[payload];
        }
        
        if (!item) { modal.innerHTML = `<div class="modal-content"><p style="padding:20px">Errore: Monumento non trovato.</p></div>`; return; }

        // 2. Dati
        const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
        const curiosita = window.dbCol(item, 'Curiosita');
        const desc = window.dbCol(item, 'Descrizione');
        const img = window.dbCol(item, 'Immagine') || window.dbCol(item, 'Foto'); // Opzionale

        contentHtml = `
            ${img ? 
                `<img src="${img}" class="monument-header-img">` : 
                `<div class="monument-header-icon"><i class="fa-solid fa-landmark" style="font-size:4rem; color:#546e7a;"></i></div>`
            }

            <div style="padding: 0 25px 30px;">
                <h2 style="font-family:'Roboto Slab'; font-size:2rem; margin: ${img ? '0' : '20px'} 0 10px 0; color:#2c3e50; line-height:1.1;">${titolo}</h2>
                
                <div style="width:50px; height:4px; background:#e74c3c; margin-bottom:20px; border-radius:2px;"></div>

                ${curiosita ? `
                <div class="curiosity-box animate-fade">
                    <div class="curiosity-title">
                        <span class="material-icons" style="font-size:1rem;">lightbulb</span> Curiosità
                    </div>
                    <div style="font-style:italic; line-height:1.5;">${curiosita}</div>
                </div>` : ''}
                
                <p style="color:#374151; font-size:1.05rem; line-height:1.7; text-align:justify;">${desc || 'Descrizione non disponibile.'}</p>
            </div>`;
    }

    // ... (lascia gli altri else if invariati) ...
    modal.innerHTML = `<div class="${modalClass}"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
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

    // Cache per evitare chiamate inutili se l'utente apre/chiude spesso
    if (!window.cachedStops) {
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA')
            .order('NOME_FERMATA', { ascending: true });
        
        if (error) { console.error(error); return; }
        window.cachedStops = data;
    }

    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + options;
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
