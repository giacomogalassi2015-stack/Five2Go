window.openModal = async function(type, payload) {
    // 1. Crea il contenitore base
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    // 2. Recupera l'oggetto dati se necessario (per passarlo al generatore contenuti)
    let item = null; 
    if (window.currentTableData && (['Vini', 'Attrazioni', 'Spiagge', 'attrazione', 'wine'].includes(type))) {
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
        if (!item && typeof payload === 'number') item = window.currentTableData[payload];
    }

    // 3. RECUPERA IL CONTENUTO (Chiama la funzione nel file ui-modal-contents.js)
    // Se la funzione non esiste o non restituisce nulla, chiude tutto per sicurezza.
    if (!window.getModalContent) { console.error("Manca ui-modal-contents.js"); modal.remove(); return; }
    
    const content = window.getModalContent(type, payload, item);
    
    if (!content || !content.html) {
        console.warn("Nessun contenuto generato per:", type);
        modal.remove();
        return;
    }

    // 4. Inietta l'HTML
    const modalClass = content.class || 'modal-content';
    modal.innerHTML = `<div class="${modalClass}"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${content.html}</div>`;

    // 5. Esegue script post-render (es. init listener traghetti o mappe)
    if (content.onRender && typeof content.onRender === 'function') {
        setTimeout(() => content.onRender(), 50);
    }
};

window.openTechMap = function(safeObj) {
    try {
        const s = JSON.parse(decodeURIComponent(safeObj));
        let gpxUrl = s.gpx_url ? s.gpx_url.trim() : null;

        const dist = s.distanza_km || '--';
        const dur = s.durata_minuti || '--';
        const d_plus = s.dislivello_positivo || s.dislivello_passivo || '--';
        const d_minus = s.dislivello_negativo || '--';
        const alt_max = s.altitudine_max || '--';
        const alt_min = s.altitudine_minima || '--';

        const modalHtml = `
            <div class="tech-container">
                
                <button onclick="closeModal()" style="
                    position: absolute; top: 15px; right: 15px; z-index: 2000;
                    width: 35px; height: 35px; border-radius: 50%; background: white; border: none;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-size: 1.5rem; 
                    display: flex; align-items: center; justify-content: center; cursor:pointer;">
                    &times;
                </button>

                <div class="tech-scroll-wrapper">
                    
                    <div class="tech-data-row">
                        <div class="tech-data-group">
                            <div class="tech-data-item"><span class="t-val">${dist}<span class="t-unit">km</span></span><span class="t-lbl">Distanza</span></div>
                            <div class="tech-divider"></div>
                            <div class="tech-data-item"><span class="t-val">${dur}<span class="t-unit">min</span></span><span class="t-lbl">Durata</span></div>
                        </div>
                        <div class="tech-data-group">
                            <div class="tech-data-item"><span class="t-val" style="color:#d32f2f;">+${d_plus}<span class="t-unit">m</span></span><span class="t-lbl">D+</span></div>
                            <div class="tech-divider"></div>
                            <div class="tech-data-item"><span class="t-val" style="color:#27ae60;">-${d_minus}<span class="t-unit">m</span></span><span class="t-lbl">D-</span></div>
                        </div>
                        <div class="tech-data-group">
                            <div class="tech-data-item"><span class="t-val">${alt_max}<span class="t-unit">m</span></span><span class="t-lbl">Alt. Max</span></div>
                            <div class="tech-divider"></div>
                            <div class="tech-data-item"><span class="t-val">${alt_min}<span class="t-unit">m</span></span><span class="t-lbl">Alt. Min</span></div>
                        </div>
                    </div>

                    <div id="tech-map-canvas"></div>
                    
                    <div id="elevation-div"></div>
                    
                </div> <div class="modal-actions-grid">
                    <button class="btn-trail-modern btn-trail-info" onclick="window.downloadGPX('${gpxUrl}')">
                        <span class="material-icons">download</span> GPX
                    </button>
                    <button id="btn-gps" class="btn-trail-modern btn-trail-gps" onclick="window.toggleGPS()">
                        <span class="material-icons">my_location</span> GPS
                    </button>
                    <button id="btn-toggle-ele" class="btn-trail-modern btn-trail-tech" onclick="toggleElevationChart()">
                        <span class="material-icons">show_chart</span> Grafico
                    </button>
                </div>

            </div>
        `;

        let modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            modalContainer.className = 'modal-overlay';
            document.body.appendChild(modalContainer);
        }
        modalContainer.innerHTML = modalHtml;
        modalContainer.style.display = 'flex';

        setTimeout(() => { initLeafletMap('tech-map-canvas', gpxUrl); }, 300);

    } catch (e) { console.error(e); }
};

window.toggleElevationChart = function() {
    const elDiv = document.getElementById('elevation-div');
    const btn = document.getElementById('btn-toggle-ele');
    
    // Controllo di sicurezza se gli elementi non esistono
    if (!elDiv || !btn) return;

    // LOGICA ROBUSTA:
    // Verifica se è nascosto.
    // Controlla sia 'none' (inline) sia '' (se nascosto dal CSS)
    const isHidden = elDiv.style.display === 'none' || elDiv.style.display === '';

    if (isHidden) {
        // --- AZIONE: APRI ---
        elDiv.style.display = 'block';
        
        // Cambia tasto in "Chiudi" (Rosso)
        btn.innerHTML = '<span class="material-icons">close</span> Chiudi';
        btn.style.backgroundColor = '#FFEBEE'; 
        btn.style.color = '#c62828';
        
        // Forza l'aggiornamento della mappa principale per adattarsi
        if (window.currentMap) {
            setTimeout(() => { window.currentMap.invalidateSize(); }, 100);
        }

        // Scroll automatico verso il basso per mostrare il grafico
        const container = document.querySelector('.tech-container');
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }

    } else {
        // --- AZIONE: CHIUDI ---
        elDiv.style.display = 'none';
        
        // Ripristina tasto "Grafico" (Verde)
        btn.innerHTML = '<span class="material-icons">show_chart</span> Grafico';
        btn.style.backgroundColor = '#2A9D8F'; 
        btn.style.color = 'white';
        
        // Aggiorna mappa
        if (window.currentMap) {
            setTimeout(() => { window.currentMap.invalidateSize(); }, 50);
        }
    }
};

// Download GPX
window.downloadGPX = function(url) {
    if(!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Funzione GPS REALE
window.toggleGPS = function() {
    // 1. Controlla se la mappa esiste
    if (!window.currentMap) {
        console.error("Mappa non trovata");
        return;
    }

    const btn = document.getElementById('btn-gps');
    
    // Cambia icona per far capire che sta caricando
    if(btn) btn.innerHTML = '<span class="material-icons check-icon">hourglass_empty</span> Cerco...';

    // 2. Usa il sistema di localizzazione di Leaflet
    window.currentMap.locate({
        setView: true,       // Sposta la mappa su di te
        maxZoom: 16,         // Zoom a livello stradale
        enableHighAccuracy: true // Usa il GPS preciso
    });

    // 3. Quando ti trova:
    window.currentMap.once('locationfound', function(e) {
        const radius = e.accuracy / 2; // Raggio di precisione

        // Rimuovi vecchio marker se esiste
        if (window.userMarker) {
            window.currentMap.removeLayer(window.userMarker);
            window.currentMap.removeLayer(window.userCircle);
        }

        // Aggiungi un pallino blu
        window.userMarker = L.marker(e.latlng).addTo(window.currentMap)
            .bindPopup("Sei qui (precisione " + Math.round(radius) + "m)").openPopup();

        window.userCircle = L.circle(e.latlng, radius).addTo(window.currentMap);

        // Ripristina il bottone
        if(btn) btn.innerHTML = '<span class="material-icons">my_location</span> Trovato';
        
        // Dopo 2 secondi rimetti la scritta GPS normale
        setTimeout(() => {
             if(btn) btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
        }, 2000);
    });

    // 4. Se c'è un errore (es. GPS spento o permesso negato)
    window.currentMap.once('locationerror', function(e) {
        alert("Impossibile trovare la tua posizione: " + e.message);
        if(btn) btn.innerHTML = '<span class="material-icons">error_outline</span> Errore';
    });
};

window.closeModal = function() {
    const m = document.getElementById('modal-container');
    if(m) m.style.display = 'none';
    if(window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
};

// 4. MOTORE MAPPA (Configurazione Stabile)
function initLeafletMap(divId, gpxUrl) {
    if (!document.getElementById(divId)) return;
    if (window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
    document.getElementById('elevation-div').innerHTML = '';

    const map = L.map(divId);
    window.currentMap = map;
    map.setView([44.118, 9.711], 13); 

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 16, attribution: 'OpenTopoMap'
    }).addTo(map);

    if (gpxUrl) {
        try {
            const elevationOptions = {
                theme: "steelblue-theme",
                detached: true,
                elevationDiv: "#elevation-div",
                xAttr: 'dist', yAttr: 'altitude', 
                time: false, summary: false, followMarker: true,
                margins: { top: 20, right: 20, bottom: 20, left: 50 },
                polyline: { color: '#D32F2F', opacity: 0.9, weight: 5 }
            };
            L.control.elevation(elevationOptions).addTo(map).load(gpxUrl);
        } catch (e) {
            new L.GPX(gpxUrl, { async: true, polyline_options: { color: 'red' } })
              .on('loaded', e => map.fitBounds(e.target.getBounds())).addTo(map);
        }
    }
    setTimeout(() => { map.invalidateSize(); }, 300);
}

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


