console.log("✅ 2. ui-renderers.js caricato (Localizzato & Fixato)");

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

// === RENDERER SENTIERO ===
window.sentieroRenderer = (s) => {
    const uniqueId = 'k-map-' + (s.poi_id || Math.floor(Math.random() * 99999));
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");
    const nome = s.nome || 'Sentiero';
    const desc = s.descrizione ? decodeURIComponent(s.descrizione).replace(/'/g, "\\'") : '';
    
    let diff = s.difficolta_cai || 'T';
    let diffColor = '#27ae60'; 
    if(diff.includes('E')) diffColor = '#f39c12';
    if(diff.includes('EE')) diffColor = '#c0392b';

    if(s.gpx_url) {
        if(!window.pendingMaps) window.pendingMaps = [];
        window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url });
    }

    return `
    <div class="komoot-card animate-fade">
        
        <div id="${uniqueId}" class="komoot-map-container" onclick="window.openTechMap('${safeObj}')"></div>

        <div class="komoot-info-body" style="padding-bottom:5px;">
            <div class="komoot-header-row">
                <h3 class="komoot-title">${nome}</h3>
                <span class="komoot-badge" style="background:${diffColor}">${diff}</span>
            </div>
        </div>

        <div class="trail-actions-grid">
            
            <button class="btn-trail-modern btn-trail-tech" onclick="window.openTechMap('${safeObj}')">
                <span class="material-icons" style="font-size:1.1rem;">map</span> Scheda Tecnica
            </button>

            <button class="btn-trail-modern btn-trail-info" onclick="alert('Descrizione: ' + '${desc}')">
                <span class="material-icons" style="font-size:1.1rem; color:#777;">info</span> Info
            </button>
            
        </div>

    </div>`;
};

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

// Funzione di utilità per formattare i numeri (evita che lo '0' diventi '--')
const formatInt = (val) => (val !== null && val !== undefined) ? val : '--';

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
