// 2. FUNZIONE PRINCIPALE (Il Generatore)
window.getModalContent = function(type, payload, item) {
    
    // Variabili che verranno riempite dai tuoi IF
    let contentHtml = '';
    let modalClass = 'modal-content';
    let onRender = null; // Funzione opzionale da eseguire dopo (es. per traghetti o bus)   

    // --- RISTORANTE ---
    if (type === 'ristorante' || type === 'restaurant') {
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

// ---  PRODOTTI ---
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
                ${ideale ? `<div style="margin-bottom: 20px;"><span class="glass-tag">✨ ${window.t('ideal_for')}: ${ideale}</span></div>` : ''}
                <p style="font-size: 1.05rem; line-height: 1.6; color: #444;">${desc || ''}</p>
            </div>`;
    }

    // --- VINI ---
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

        // --- SENTIERI ---
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

    // --- MAPPA GPX ---
    else if (type === 'map') {
        const gpxUrl = payload;
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        
        contentHtml = `
            <h3 style="text-align:center; margin-bottom:10px;">${window.t('map_route_title')}</h3>
            <div id="${uniqueMapId}" style="height: 450px; width: 100%; border-radius: 12px; border: 1px solid #ddd;"></div>
            <p style="text-align:center; font-size:0.8rem; color:#888; margin-top:10px;">${window.t('map_zoom_hint')}</p>
        `;

    }

  //  SPIAGGE ---
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

    // --- ATTRAZIONI  ---
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
    
  //  SPIAGGE ---
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

    // --- ATTRAZIONI  ---
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
    
    
    // ---  TRASPORTI ---
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
       // --- FARMACIA ---
    else if (type === 'farmacia') {
        const item = JSON.parse(decodeURIComponent(payload)); 
        const nome = window.dbCol(item, 'Nome');
        const paesi = window.dbCol(item, 'Paesi');
        contentHtml = `<h2>${nome}</h2><p>📍 ${item.Indirizzo}, ${paesi}</p><p>📞 <a href="tel:${item.Numero}">${item.Numero}</a></p>`;
    }

return { html: contentHtml, class: modalClass, onRender: onRender };

}
window.trainSearchRenderer = (data, nowTime) => {
    return `
    <div class="bus-search-box train-box animate-fade">
        <div class="bus-title">
            <span class="material-icons">train</span> 
            Cinque Terre Express
        </div>
        
        <div class="transport-details">
            <p class="transport-desc">${window.t('train_desc')}</p>
            
            <div class="avg-times-container">
                <h4 class="avg-times-title">⏱️ ${window.t('avg_times')}</h4>
                <div class="avg-time-row">
                    <span>La Spezia ↔ Riomaggiore</span> <b>7 min</b>
                </div>
                <div class="avg-time-row">
                    <span>${window.t('between_villages')}</span> <b>2-4 min</b>
                </div>
                <div class="avg-time-row">
                    <span>Monterosso ↔ Levanto</span> <b>5 min</b>
                </div>
            </div>
        </div>

        <button onclick="apriTrenitalia()" class="btn-red">
            <span>${window.t('train_cta')}</span>
        </button>
        
        <p class="transport-disclaimer">${window.t('check_site')}</p>
    </div>`;
};

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