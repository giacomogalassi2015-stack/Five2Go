console.log("✅ 2. ui-renderers.js caricato (Localizzato)");



// === RENDERER RISTORANTE ===

window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="restaurant-glass-card" onclick="openModal('ristorante', '${safeObj}')">
        
        <h3 class="rest-card-title">${nome}</h3>
        
        <p class="rest-card-subtitle">
            <span class="material-icons" style="font-size: 1.2rem; color: #f39c12;">restaurant</span>
            ${paesi}
        </p>
       
        <div class="rest-card-actions">
            ${numero ? `
                <div class="action-btn btn-call rest-btn-size" onclick="event.stopPropagation(); window.location.href='tel:${numero}'">
                    <span class="material-icons">call</span>
                </div>` : ''}
            
            <div class="action-btn btn-map rest-btn-size" onclick="event.stopPropagation(); window.open('${mapLink}', '_blank')">
                <span class="material-icons">map</span>
            </div>
        </div>
    </div>`;
};

// === RENDERER SPIAGGIA (Ocean Vibe) ===
window.spiaggiaRenderer = (s) => {
    const nome = window.dbCol(s, 'Nome') || 'Spiaggia';
    const paesi = window.dbCol(s, 'Paesi');
    const desc = window.dbCol(s, 'Descrizione') || '';
    
    // Sicurezza stringhe
    const safePaesi = paesi.replace(/'/g, "\\'").replace(/"/g, '"');
    const safeDesc = desc.replace(/'/g, "\\'").replace(/"/g, '"');
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi + ' beach')}`;

    return `
    <div class="beach-card-modern animate-fade" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
        <div class="beach-gradient-header">
            <div style="font-size:0.8rem; opacity:0.8; text-transform:uppercase; font-weight:700; letter-spacing:1px;">
                <span class="material-icons" style="font-size:1rem; vertical-align:text-top;">place</span> ${paesi}
            </div>
            <svg class="beach-wave-shape" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                <path fill="#ffffff" fill-opacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
        </div>

        <div class="beach-content-body">

            <div class="beach-title">${nome}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                <span style="font-size:0.85rem; color:#888;">Tocca per info</span>
                <button onclick="event.stopPropagation(); window.open('${mapLink}', '_blank')" 
                        style="background:#0288D1; color:white; border:none; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(2, 136, 209, 0.4);">
                    <span class="material-icons">near_me</span>
                </button>
            </div>
        </div>
    </div>`;
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

// === RENDERER FARMACIA ===
window.farmaciaRenderer = (f) => {
    const nome = window.dbCol(f, 'Nome');
    const paesi = window.dbCol(f, 'Paesi');
    const indirizzo = f.Indirizzo || '';
    const safeObj = encodeURIComponent(JSON.stringify(f)).replace(/'/g, "%27");
    const fullAddress = `${indirizzo}, ${paesi}`;
    const mapLink = f.Mappa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Farmacia ' + nome + ' ' + fullAddress)}`;

    return `
    <div class="info-card" onclick="openModal('farmacia', '${safeObj}')" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px; text-align: center; padding: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 1.3rem; width: 100%; color: #ffffff;">${nome}</h3>
        <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.95rem; display: flex; align-items: center; justify-content: center;">
            <span class="material-icons" style="font-size: 1.1rem; color: #ea4335; margin-right: 5px;">place</span>
            ${paesi}
        </p>
        <p style="margin: 4px 0 15px 0; font-size: 0.85rem; color: rgba(255,255,255,0.5);">${indirizzo}</p>
        <div style="display: flex; justify-content: center; gap: 25%; width: 100%; padding: 0 10%;">
            ${f.Numero ? `
                <div class="action-btn btn-call" style="margin:0;" onclick="event.stopPropagation(); window.location.href='tel:${f.Numero}'">
                    <span class="material-icons">call</span>
                </div>` : ''}
            <div class="action-btn btn-map" style="margin:0;" onclick="event.stopPropagation(); window.open('${mapLink}', '_blank')">
                <span class="material-icons">map</span>
            </div>
        </div>
    </div>`;
};

// === RENDERER NUMERI UTILI ===
window.numeriUtiliRenderer = (n) => {
    const nome = window.dbCol(n, 'Nome');
    const paesi = window.dbCol(n, 'Paesi'); 
    const numero = n.Numero || n.Telefono || '';

    return `
    <div class="info-card" onclick="window.location.href='tel:${numero}'" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px; text-align: center; padding: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 1.4rem; width: 100%; color: #ffffff; letter-spacing: 0.5px;">${nome}</h3>
        <p style="margin: 0 0 25px 0; color: rgba(255,255,255,0.7); font-size: 1rem; display: flex; align-items: center; justify-content: center;">
            <span class="material-icons" style="font-size: 1.2rem; color: #4285f4; margin-right: 6px;">location_on</span>
            ${paesi}
        </p>
        <div class="action-btn btn-call" style="margin: 0; width: 60px; height: 60px;">
            <span class="material-icons" style="font-size: 1.8rem;">call</span>
        </div>
    </div>`;
};

// === RENDERER ATTRAZIONI (Museum/Art Style) ===
window.attrazioniRenderer = (item) => {
    const titolo = window.dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = window.dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const diff = window.dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    const tempo = item["Tempo Visita"] || '--';

    // Logica Colori Difficoltà
    const isHard = diff.toLowerCase().match(/alta|hard|difficile/);
    const diffColor = isHard ? 'background:#FFEBEE; color:#D32F2F;' : 'background:#E8F5E9; color:#2E7D32;'; // Rosso o Verde chiaro

    // Logica Icona Intelligente (Se il titolo contiene "Chiesa" cambia icona)
    let icon = 'museum'; // Default
    if (titolo.toLowerCase().includes('chiesa') || titolo.toLowerCase().includes('santuario')) icon = 'church';
    if (titolo.toLowerCase().includes('castello') || titolo.toLowerCase().includes('torre')) icon = 'castle';
    if (titolo.toLowerCase().includes('panorama') || titolo.toLowerCase().includes('vista')) icon = 'visibility';

    return `
    <div class="culture-card-modern animate-fade" onclick="openModal('attrazione', ${myId})">
        
        <div class="culture-accent-strip"></div>
        
        <div class="culture-content">
            <div class="culture-location">
                <span class="material-icons" style="font-size:0.9rem;">place</span> ${paese}
            </div>
            
            <div class="culture-title">${titolo}</div>
            
            <div style="margin-top: 12px;" class="culture-meta-tags">
                <span class="culture-pill pill-time">
                    <span class="material-icons" style="font-size:0.8rem;">schedule</span> ${tempo}
                </span>
                <span class="culture-pill" style="${diffColor}">
                    ${diff}
                </span>
            </div>
        </div>

        <div class="culture-icon-deco">
            <span class="material-icons">${icon}</span>
        </div>
    </div>`;
};

// === RENDERER PRODOTTO ===
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 800);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="village-card animate-fade" 
         style="background-image: url('${imgUrl}'); background-color: #f0f0f0;" 
         onclick="openModal('product', '${safeObj}')">
         <div class="card-title-overlay">
            ${titolo || 'Senza Nome'}
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

    if (type === 'village') {
        const bigImg = window.getSmartUrl(payload, '', 1000);
        const { data } = await window.supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', payload).single();
        const desc = data ? window.dbCol(data, 'Descrizione') : window.t('loading');
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:220px; object-fit:cover;"><h2>${payload}</h2><p>${desc}</p>`;
    } 
    
    // --- PRODOTTI ---
    else if (type === 'product') {
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
            const { data: fermate, error } = await window.supabaseClient.from('Fermate_bus').select('ID, NOME_FERMATA, LAT, LONG').order('NOME_FERMATA', { ascending: true });
            if (fermate && !error) {
                const now = new Date();
                const todayISO = now.toISOString().split('T')[0];
                const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                const options = fermate.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
                
                let ticketSection = '';
                if (hasTicketInfo) {
                    ticketSection = `
                    <button onclick="toggleTicketInfo()" style="width:100%; margin-bottom:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        🎟️ ${window.t('how_to_ticket')} ▾
                    </button>
                    <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px; font-size:0.9rem; color:#333; line-height:1.5;">
                        ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                        ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                        ${infoAvvisi ? `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;"><strong>⚠️ ${window.t('error')}:</strong> ${infoAvvisi}</div>` : ''}
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

                customContent = `
                <div class="bus-search-box animate-fade">
                    <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;">
                        <span class="material-icons">directions_bus</span> ${window.t('plan_trip')}
                    </div>
                    ${ticketSection}
                    ${mapToggleSection} 
                    <div class="bus-inputs">
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('departure')}</label><select id="selPartenza" class="bus-select"><option value="" disabled selected>${window.t('select_placeholder')}</option>${options}</select></div>
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('arrival')}</label><select id="selArrivo" class="bus-select"><option value="" disabled selected>${window.t('select_placeholder')}</option>${options}</select></div>
                    </div>
                    <div class="bus-inputs">
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('date_trip')}</label><input type="date" id="selData" class="bus-select" value="${todayISO}"></div>
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">${window.t('time_trip')}</label><input type="time" id="selOra" class="bus-select" value="${nowTime}"></div>
                    </div>
                    <button onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px;">${window.t('find_times')}</button>
                    <div id="busResultsContainer" style="display:none; margin-top:20px;"><div id="nextBusCard" class="bus-result-main"></div><div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">${window.t('next_runs')}:</div><div id="otherBusList" class="bus-list-container"></div></div>
                </div>`;
                setTimeout(() => { initBusMap(fermate); }, 300);
            } else { customContent = `<p style="color:red;">${window.t('error')}</p>`; }
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

    // --- DETTAGLI FARMACIA ---
    else if (type === 'farmacia') {
        const item = JSON.parse(decodeURIComponent(payload)); 
        const nome = window.dbCol(item, 'Nome');
        const paesi = window.dbCol(item, 'Paesi');
        contentHtml = `<h2>${nome}</h2><p>📍 ${item.Indirizzo}, ${paesi}</p><p>📞 <a href="tel:${item.Numero}">${item.Numero}</a></p>`;
    }
    // --- DETTAGLI ATTRAZIONE ---
    else if (type === 'attrazione') {
         const item = (window.tempAttractionsData && typeof payload === 'number') ? window.tempAttractionsData[payload] : null;
         if(item) {
             const titolo = window.dbCol(item, 'Attrazioni');
             const paese = window.dbCol(item, 'Paese');
             contentHtml = `<h2>${titolo}</h2><p>📍 ${paese}</p><p>${window.dbCol(item, 'Descrizione')}</p>`;
         }
    }
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