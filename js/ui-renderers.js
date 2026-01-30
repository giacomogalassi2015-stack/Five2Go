console.log("✅ 2. ui-renderers.js caricato (Localizzato & Fixato)");

// === RENDERER RISTORANTE ===
window.ristoranteRenderer = (r) => {
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

// Funzione di utilità per formattare i numeri
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
    
    // Helper interno per traduzioni
    const getTranslatedVal = (val) => {
        if (!val) return '';
        if (typeof val === 'object') {
            const lang = window.currentLang || 'it';
            return val[lang] || val['it'] || '';
        }
        if (typeof val === 'string' && val.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(val);
                const lang = window.currentLang || 'it';
                return parsed[lang] || parsed['it'] || val;
            } catch (e) { return val; }
        }
        return val;
    };

    // Dati
    const rawName = n.Nome || 'Numero Utile';
    const nome = getTranslatedVal(rawName);

    const rawDesc = n.Utile_per || n.Utili_per || ''; 
    const descrizione = getTranslatedVal(rawDesc);
    const hasInfo = descrizione && descrizione.length > 2; 

    const paesi = getTranslatedVal(window.dbCol(n, 'Paesi')) || 'Cinque Terre'; 
    const numero = n.Numero || n.Telefono || '';

    // Icone
    let icon = 'help_outline'; 
    const nLower = String(nome).toLowerCase();
    if (nLower.includes('carabinieri') || nLower.includes('polizia')) icon = 'security';
    else if (nLower.includes('medica') || nLower.includes('croce')) icon = 'medical_services';
    else if (nLower.includes('taxi')) icon = 'local_taxi';
    else if (nLower.includes('farmacia')) icon = 'local_pharmacy';
    else if (nLower.includes('info')) icon = 'info';

    // Encoding dati
    const safeName = encodeURIComponent(nome);
    const safeDesc = encodeURIComponent(descrizione);
    const safeNum = encodeURIComponent(numero);

    return `
    <div class="info-card animate-fade">
        <div class="info-icon-box">
            <span class="material-icons">${icon}</span>
        </div>
        
        <div class="info-text-col" onclick="${hasInfo ? `openInfoModal('${safeName}', '${safeDesc}', '${safeNum}')` : ''}" style="cursor: pointer;">
            <h3>${nome}</h3>
            <p><span class="material-icons" style="font-size: 0.9rem;">place</span> ${paesi}</p>
        </div>
        
        <div class="action-btn btn-info" 
             style="${hasInfo ? 'display:flex;' : 'display:none;'} background:#e3f2fd; color:#1565c0; margin-right:8px;" 
             onclick="openInfoModal('${safeName}', '${safeDesc}', '${safeNum}')">
            <span class="material-icons">info</span>
        </div>

        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>
    </div>`;
};
