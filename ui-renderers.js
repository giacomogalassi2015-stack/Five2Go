console.log("✅ 2. ui-renderers.js caricato");

// === RENDERER SENTIERO ===
window.sentieroRenderer = (s) => {
    const paese = window.dbCol(s, 'Paesi');
    const distanza = s.Distanza || '--';
    const durata = s.Durata || '--';
    const extra = window.dbCol(s, 'Extra') || 'Sentiero';
    const gpxUrl = s.Gpxlink || s.gpxlink; // Link al file del percorso

    // ID per la mappa piccola nella card
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    
    // Inizializza la mappa piccola se c'è GPX
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    // Codifica sicura per il pulsante dettagli
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");

    return `
    <div class="card-sentiero-modern animate-fade">
        
        <div id="${uniqueMapId}" 
             class="sentiero-map-bg" 
             style="cursor: pointer;"
             onclick="event.stopPropagation(); openModal('map', '${gpxUrl}')"> 
        </div>
        
        <div class="sentiero-card-overlay" 
             style="cursor: pointer;" 
             onclick="openModal('trail', '${safeObj}')">
            
            <h2 class="sentiero-overlay-title">${paese}</h2>
            
            <button class="btn-outline-details">
                Dettagli Percorso
            </button>
        </div>
    </div>`;
};

// === RENDERER RISTORANTE ===
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="info-card" onclick="openModal('ristorante', '${safeObj}')" 
         style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; text-align: center; padding: 25px;
                background: rgba(0, 0, 0, 0.6) !important; 
                backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 30px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                margin-bottom: 20px;">
        
        <h3 style="margin: 0 0 8px 0; font-size: 1.5rem; color: #ffffff;">${nome}</h3>
        
        <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 1.1rem; display: flex; align-items: center; justify-content: center;">
            <span class="material-icons" style="font-size: 1.2rem; color: #f39c12; margin-right: 6px;">restaurant</span>
            ${paesi}
        </p>

        <p style="margin: 12px 0 25px 0; color: #ffffff; font-weight: 700; font-size: 1.1rem; letter-spacing: 1px;">
            ${numero}
        </p>

        <div style="display: flex; justify-content: center; gap: 30px; width: 100%;">
            ${numero ? `
                <div class="action-btn btn-call" style="width: 55px; height: 55px;" onclick="event.stopPropagation(); window.location.href='tel:${numero}'">
                    <span class="material-icons">call</span>
                </div>` : ''}
            <div class="action-btn btn-map" style="width: 55px; height: 55px;" onclick="event.stopPropagation(); window.open('${mapLink}', '_blank')">
                <span class="material-icons">map</span>
            </div>
        </div>
    </div>`;
};

// === RENDERER SPIAGGIA ===
window.spiaggiaRenderer = (s) => {
    const nome = window.dbCol(s, 'Nome') || 'Spiaggia';
    const paesi = window.dbCol(s, 'Paesi');
    const desc = window.dbCol(s, 'Descrizione') || '';
    
    // Escape per simpleAlert (apici singoli e doppi)
    const safePaesi = paesi.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeDesc = desc.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    // Correzione URL Mappa
    const mapQuery = encodeURIComponent(`${nome} ${paesi} beach`);
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    return `
    <div class="card-spiaggia" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
        <div class="spiaggia-header"><div class="spiaggia-location">📍 ${paesi}</div><span></span></div>
        <div class="item-title" style="font-size: 1.3rem; margin: 10px 0;">${nome}</div>
        <div class="spiaggia-footer">
            <a href="${mapLink}" target="_blank" class="btn-azure" onclick="event.stopPropagation()">${window.t('btn_position')}</a>
        </div>
    </div>`;
};
// === RENDERER FARMACIA (Centrato & Proporzionato) ===
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

// === RENDERER NUMERI UTILI (Centrato & Titolo Grande) ===
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

// === RENDERER ATTRAZIONI ===
window.attrazioniRenderer = (item) => {
    const titolo = window.dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = window.dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const diff = window.dbCol(item, 'Difficoltà accesso');
    const isHard = diff.toLowerCase().match(/alta|hard|difficile|schwer|difícil/); 
    const diffStyle = isHard ? 'background:#ffebee; color:#c62828;' : 'background:#e8f5e9; color:#2e7d32;';

    return `
    <div class="card-list-item monument-mode" onclick="openModal('attrazione', ${myId})">
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${titolo}</div></div>
            <div class="item-subtitle" style="margin-bottom: 8px;">📍 ${paese}</div>
            <div class="monument-meta" style="display:flex; gap:8px;">
                <span class="meta-badge" style="${diffStyle} padding:2px 8px; border-radius:4px; font-size:0.75rem;">${diff}</span>
                <span class="meta-badge badge-time" style="background:#f5f5f5; padding:2px 8px; border-radius:4px; font-size:0.75rem;">⏱ ${item["Tempo Visita"] || '--'} ${window.t('visit_time')}</span>
            </div>
        </div>
        <div class="item-arrow" style="margin-top: auto; margin-bottom: auto;">➜</div>
    </div>`;
};

// === RENDERER PRODOTTO ===
window.prodottoRenderer = (p) => {
    // Cerchiamo il nome nella colonna 'Prodotti' o 'Nome' per sicurezza
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    
    // === MODIFICA FOTO QUI (Per Card Lista) ===
    // 1. Cerco prima nella colonna specifica 'Prodotti_foto'
    // 2. Se è vuota, uso il 'titolo' come fallback
    const fotoKey = p.Prodotti_foto || titolo;
    
    const imgUrl = window.getSmartUrl(fotoKey, '', 800);
    
    // Encode sicuro per modale
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

        // === MODIFICA FOTO QUI (Per Modale) ===
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
                    <span class="glass-tag">✨ Ideale per: ${ideale}</span>
                </div>` : ''}

                <p style="font-size: 1.05rem; line-height: 1.6; color: #444;">${desc || ''}</p>
            </div>
        `;
    }

   // --- TRASPORTI ---
    else if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) { console.error("Errore recupero trasporto"); return; }
        
        const nome = window.dbCol(item, 'Nome') || window.dbCol(item, 'Località') || window.dbCol(item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(item, 'Descrizione') || '';
        
        // Info Generiche
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
        const hasTicketInfo = infoSms || infoApp || infoAvvisi;

        const isBus = nome.toLowerCase().includes('bus') || nome.toLowerCase().includes('autobus') || nome.toLowerCase().includes('atc');
        const isTrain = nome.toLowerCase().includes('tren') || nome.toLowerCase().includes('ferrovi') || nome.toLowerCase().includes('stazione');

        let customContent = '';

        if (isBus) {
            // === LOGICA BUS (Mappa + Ricerca) ===
            const { data: fermate, error } = await window.supabaseClient
                .from('Fermate_bus')
                .select('ID, NOME_FERMATA, LAT, LONG') 
                .order('NOME_FERMATA', { ascending: true });

            if (fermate && !error) {
                const now = new Date();
                const todayISO = now.toISOString().split('T')[0];
                const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                const options = fermate.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
                
                // Sezione Biglietti
                let ticketSection = '';
                if (hasTicketInfo) {
                    ticketSection = `
                    <button onclick="toggleTicketInfo()" style="width:100%; margin-bottom:15px; background:#e0f7fa; color:#006064; border:1px solid #b2ebf2; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                        🎟️ COME ACQUISTARE IL BIGLIETTO ▾
                    </button>
                    <div id="ticket-info-box" style="display:none; background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px; font-size:0.9rem; color:#333; line-height:1.5;">
                        ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                        ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                        ${infoAvvisi ? `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;"><strong>⚠️ ATTENZIONE:</strong> ${infoAvvisi}</div>` : ''}
                    </div>`;
                }

                // Sezione Mappa a Tendina
                const mapToggleSection = `
                    <button id="btn-bus-map-toggle" onclick="toggleBusMap()" style="width:100%; margin-bottom:15px; background:#EDE7F6; color:#4527A0; border:1px solid #D1C4E9; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition: background 0.3s;">
                        🗺️ MOSTRA MAPPA FERMATE ▾
                    </button>
                    <div id="bus-map-wrapper" style="display:none; margin-bottom: 20px;">
                        <div id="bus-map" style="height: 280px; width: 100%; border-radius: 12px; z-index: 1; border: 2px solid #EDE7F6;"></div>
                        <p style="font-size:0.75rem; text-align:center; color:#999; margin-top:5px;">Tocca i segnaposto per impostare Partenza/Arrivo</p>
                    </div>`;

                // Costruzione HTML Bus
                customContent = `
                <div class="bus-search-box animate-fade">
                    <div class="bus-title" style="margin-bottom: 0px; padding-bottom: 15px;">
                        <span class="material-icons">directions_bus</span> Pianifica Viaggio
                    </div>
                    
                    ${ticketSection}
                    ${mapToggleSection} 
                    
                    <div class="bus-inputs">
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">PARTENZA</label><select id="selPartenza" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select></div>
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">ARRIVO</label><select id="selArrivo" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select></div>
                    </div>
                    <div class="bus-inputs">
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">DATA VIAGGIO</label><input type="date" id="selData" class="bus-select" value="${todayISO}"></div>
                        <div style="flex:1;"><label style="font-size:0.7rem; color:#666; font-weight:bold;">ORARIO</label><input type="time" id="selOra" class="bus-select" value="${nowTime}"></div>
                    </div>
                    <button onclick="eseguiRicercaBus()" class="btn-yellow" style="width:100%; font-weight:bold; margin-top:5px;">TROVA ORARI</button>
                    <div id="busResultsContainer" style="display:none; margin-top:20px;"><div id="nextBusCard" class="bus-result-main"></div><div style="font-size:0.8rem; font-weight:bold; color:#666; margin-top:15px;">CORSE SUCCESSIVE:</div><div id="otherBusList" class="bus-list-container"></div></div>
                </div>`;
                
                setTimeout(() => { initBusMap(fermate); }, 300);
            } else {
                customContent = `<p style="color:red;">Errore caricamento fermate.</p>`;
            }
        } 
        else if (isTrain) {
            // === NUOVA LOGICA TRENI (Trenitalia) ===
            // Calcolo orario corrente
            const now = new Date();
            const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            // Richiama il renderer che abbiamo creato in ui-renderers.js
            if (window.trainSearchRenderer) {
                customContent = window.trainSearchRenderer(null, nowTime);
            } else {
                customContent = "<p>Errore interfaccia Treni.</p>";
            }
        }
        else {
            // === ALTRI TRASPORTI (Traghetti, Taxi) ===
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

        // Output Finale
        if (isBus || isTrain) {
            // Bus e Treni hanno già la loro grafica "customContent" completa
            contentHtml = customContent;
        } else {
            // Gli altri mostrano Titolo + Descrizione + Info Biglietti
            contentHtml = `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`;
        }
    }

    // --- DETTAGLI SENTIERO (Design Aggiornato) ---
    else if (type === 'trail') {
        const p = JSON.parse(decodeURIComponent(payload));
        
        // Recupero Dati
        const titolo = window.dbCol(p, 'Paesi') || p.Nome; // Titolo principale
        const nomeSentiero = p.Nome || ''; // Sottotitolo (es. "SVA - Sentiero Azzurro")
        const dist = p.Distanza || '--';
        const dura = p.Durata || '--';
        // Usiamo 'Tag' o 'Difficolta' per il terzo box
        const diff = p.Tag || p.Difficolta || 'Media'; 
        const desc = window.dbCol(p, 'Descrizione') || '';
        // Link alla mappa GPX
        const linkGpx = p.Link_Gpx || p.Mappa || '';

        contentHtml = `
        <div style="padding: 20px 15px;">
            
            <h2 style="text-align:center; margin: 0 0 5px 0; color:#2c3e50;">${titolo}</h2>
            ${nomeSentiero ? `<p style="text-align:center; color:#7f8c8d; margin:0 0 15px 0; font-size:0.9rem;">${nomeSentiero}</p>` : ''}

            <div class="trail-stats-grid">
                <div class="trail-stat-box">
                    <span class="material-icons">straighten</span>
                    <span class="stat-value">${dist}</span>
                    <span class="stat-label">Distanza</span>
                </div>

                <div class="trail-stat-box">
                    <span class="material-icons">schedule</span>
                    <span class="stat-value">${dura}</span>
                    <span class="stat-label">Durata</span>
                </div>

                <div class="trail-stat-box">
                    <span class="material-icons">terrain</span>
                    <span class="stat-value">${diff}</span>
                    <span class="stat-label">Livello</span>
                </div>
            </div>

            ${linkGpx ? `
            <button onclick="openModal('map', '${linkGpx}')" class="btn-trail-action">
                <span class="material-icons">map</span>
                DETTAGLI PERCORSO
            </button>
            ` : ''}

            <div style="margin-top:25px; line-height:1.6; color:#444; font-size:0.95rem; text-align:justify;">
                ${desc}
            </div>

        </div>`;
    }
    // --- DETTAGLI RISTORANTE ---
    else if (type === 'restaurant') {
        const item = JSON.parse(decodeURIComponent(payload));
        const nome = window.dbCol(item, 'Nome');
        const desc = window.dbCol(item, 'Descrizione') || '';
        const orari = item.Orari || 'Orari non disponibili';
        const telefono = item.Telefono || '';
        const web = item.SitoWeb || '';
        const mapQuery = encodeURIComponent(`${nome} ${window.dbCol(item, 'Paesi')}`);
        
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
                <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" class="btn-azure" style="display:inline-block; text-decoration:none; padding:10px 20px; border-radius:20px;">Portami qui 🗺️</a>
            </div>
        `;
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

// --- ALTRE FUNZIONI DI SUPPORTO (Maps, ecc.) ---
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

window.initBusMap = function(fermate) {
    // === COORDINATE RIOMAGGIORE ===
    const startLat = 44.1000; 
    const startLong = 9.7385;
    
    // Zoom 13: Abbastanza per vedere Riomaggiore e dintorni, ma non troppo chiuso sui tetti
    const startZoom = 13; 

    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;

    // Rimuove la mappa vecchia se esiste (pulizia)
    if (window.currentBusMap) {
        window.currentBusMap.remove();
        window.currentBusMap = null;
    }

    // Inizializza la mappa su Riomaggiore
    const map = L.map('bus-map').setView([startLat, startLong], startZoom);
    
    // Salviamo la mappa in globale
    window.currentBusMap = map; 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '© OpenStreetMap', 
        maxZoom: 18 
    }).addTo(map);

    const markersGroup = new L.FeatureGroup();
    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        const popupContent = `
            <div style="text-align:center; min-width:150px;">
                <h3 style="margin:0 0 10px 0; font-size:1rem;">${f.NOME_FERMATA}</h3>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="setBusStop('selPartenza', '${f.ID}')" style="background:#4CAF50; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Partenza</button>
                    <button onclick="setBusStop('selArrivo', '${f.ID}')" style="background:#F44336; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Arrivo</button>
                </div>
            </div>`;
        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
    });
    map.addLayer(markersGroup);
    
    // --- NOTA: Ho rimosso map.fitBounds() ---
    // In questo modo la mappa rispetta il tuo "setView" su Riomaggiore
    // invece di auto-adattarsi per mostrare tutte le fermate da La Spezia a Levanto.
    
    // Forza il ricalcolo dimensionale (per il toggle a tendina)
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
    
    if (!container || !btn) {
        console.error("❌ Elementi mappa non trovati (container o bottone mancante)");
        return;
    }

    const isHidden = container.style.display === 'none';

    if (isHidden) {
        // MOSTRA
        container.style.display = 'block';
        btn.innerHTML = '📍 NASCONDI MAPPA FERMATE ▴';
        btn.style.backgroundColor = '#D1C4E9'; // Viola più scuro
        
        // Ricalcola dimensioni mappa Leaflet
        setTimeout(() => {
            if (window.currentBusMap) {
                window.currentBusMap.invalidateSize();
            } else {
                console.warn("⚠️ Mappa non ancora inizializzata");
            }
        }, 100);
    } else {
        // NASCONDI
        container.style.display = 'none';
        btn.innerHTML = '🗺️ MOSTRA MAPPA FERMATE ▾';
        btn.style.backgroundColor = '#EDE7F6'; // Viola chiaro
    }
};

// ui-renderers.js

window.trainSearchRenderer = () => {
    return `
    <div class="bus-search-box animate-fade" style="border-top: 4px solid #c0392b; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); color: white; border-radius: 20px;">
        <div class="bus-title">
            <span class="material-icons" style="background: rgba(255, 255, 255, 0.3); color:#e74c3c;">train</span> 
            Cinque Terre Express
        </div>
        
        <div style="padding: 0 5px;">
            <p style="font-size:0.9rem; color:#ccc; line-height:1.5; margin-bottom:15px;">
                Il treno è il mezzo più veloce. Corse frequenti ogni 15-20 minuti tra i borghi.
            </p>

            <div style="background: rgba(255, 255, 255, 0.19); border-radius:12px; padding:15px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.1);">
                <h4 style="margin:0 0 10px 0; font-size:0.8rem; color:#aaa; text-transform:uppercase;">⏱️ Tempi Medi</h4>
                
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
                    <span>La Spezia ↔ Riomaggiore</span> <b style="color:white;">7 min</b>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255, 255, 255, 0.25); padding:8px 0;">
                    <span>Tra i Borghi (es. Rio-Manarola)</span> <b style="color:white;">2-4 min</b>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px 0;">
                    <span>Monterosso ↔ Levanto</span> <b style="color:white;">5 min</b>
                </div>
            </div>
        </div>

        <button onclick="apriTrenitalia()" class="btn-yellow" style="background: #c0392b; color: white; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(192, 57, 43, 0.4); display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:15px; border-radius:12px;">
            <span class="material-icons" style="font-size:1.2rem;">confirmation_number</span> 
            <span style="font-weight:bold;">ORARI E BIGLIETTI</span>
        </button>

        <p style="font-size:0.75rem; text-align:center; color:#888; margin-top:10px;">
            Acquista e controlla gli orari sul sito ufficiale Trenitalia
        </p>
    </div>`;
};