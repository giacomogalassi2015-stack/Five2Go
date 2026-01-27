/* components.js - UI Renderers (Template Strings + Event Delegation Tags) */

import { t, dbCol, getSmartUrl, escapeHTML } from './utils.js';

// --- RENDERERS (Return HTML Strings with Data Attributes) ---

export const ristoranteRenderer = (r) => {
    const nome = escapeHTML(dbCol(r, 'Nome') || 'Ristorante');
    const paesi = escapeHTML(dbCol(r, 'Paesi') || '');
    const numero = r.Numero || r.Telefono || '';
    const itemId = String(r.id || r.ID || r.POI_ID);
    const mapLink = r.Mappa || `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(nome + ' ' + paesi)}`;

    // Uso tag <a> per il telefono e la mappa
    const callBtn = numero 
        ? `<a href="tel:${numero}" class="action-btn btn-call rest-btn-size" style="text-decoration:none">
             <span class="material-icons">call</span>
           </a>` 
        : '';

    return `
    <div class="restaurant-glass-card">
        <h3 class="rest-card-title">${nome}</h3>
        <p class="rest-card-subtitle">
            <span class="material-icons">restaurant</span> ${paesi}
        </p>
        <div class="rest-card-actions">
            <div class="action-btn btn-info rest-btn-size" data-action="open-modal" data-modal-type="ristorante" data-id="${itemId}">
                <span class="material-icons">info_outline</span>
            </div>
            ${callBtn}
            <a href="${mapLink}" target="_blank" class="action-btn btn-map rest-btn-size" style="text-decoration:none">
                <span class="material-icons">map</span>
            </a>
        </div>
    </div>`;
};

export const spiaggiaRenderer = (item) => {
    const nome = escapeHTML(item.Nome || 'Spiaggia');
    const comune = escapeHTML(item.Paese || item.Comune || '');
    const tipo = escapeHTML(item.Tipo || 'Spiaggia');
    const safeId = String(item.id || item.ID || item.POI_ID);

    const locationHtml = comune 
        ? `<div class="culture-location"><span class="material-icons icon-sm">place</span> ${comune}</div>` 
        : '';

    return `
    <div class="culture-card is-beach animate-fade" data-action="open-modal" data-modal-type="Spiagge" data-id="${safeId}">
        <div class="culture-info">
            ${locationHtml}
            <h3 class="culture-title">${nome}</h3>
            <div class="culture-tags">
                <span class="c-pill">${tipo}</span>
            </div>
        </div>
        <div class="culture-bg-icon">
            <i class="fa-solid fa-water"></i>
        </div>
    </div>`;
};

export const sentieroRenderer = (s) => {
    const paese = dbCol(s, 'Paesi');
    const nomeSentiero = s.Nome || '';
    const titoloMostrato = escapeHTML(nomeSentiero || paese); 
    const diff = escapeHTML(s.Tag || s.Difficolta || 'Media');
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const itemId = String(s.id || s.ID || s.POI_ID);
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;

    let diffColor = '#f39c12';
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60';
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b';
    
    // Script iniettato: Dispatch evento custom per mappa (gestito in main.js)
    const scriptInit = gpxUrl 
        ? `<script>setTimeout(()=>window.dispatchEvent(new CustomEvent('init-map', {detail:{id:'${uniqueMapId}', url:'${gpxUrl}'}})), 500)</script>`
        : '';

    return `
    <div class="trail-card-modern animate-fade">
        <div id="${uniqueMapId}" class="trail-map-container" data-action="open-modal" data-modal-type="map" data-payload="${gpxUrl}"></div>
        <div class="trail-info-overlay">
            <h3 class="text-center font-bold color-dark" style="margin: 5px 0; fontFamily: 'Roboto Slab'; fontSize: 1.25rem;">
                ${titoloMostrato}
            </h3>
            <div class="text-center text-uppercase font-bold mb-20" style="fontSize: 0.75rem; color: ${diffColor}; letterSpacing: 1px;">
                ${diff}
            </div>
            <button class="btn-trail-action" data-action="open-modal" data-modal-type="trail" data-id="${itemId}">
                ${t('btn_details')}
                <span class="material-icons" style="fontSize: 1.1rem;">arrow_forward</span>
            </button>
        </div>
        ${scriptInit}
    </div>`;
};

export const vinoRenderer = (item) => {
    const safeId = String(item.id || item.ID || item.POI_ID);
    const nome = escapeHTML(item.Nome || 'Vino');
    const cantina = escapeHTML(dbCol(item, 'Produttore') || ''); 
    const tipo = (item.Tipo || '').toLowerCase().trim();
    
    let themeClass = 'is-wine-red'; 
    if (tipo.includes('bianco')) themeClass = 'is-wine-white';
    if (tipo.includes('rosato') || tipo.includes('orange')) themeClass = 'is-wine-orange';

    const cantinaHtml = cantina 
        ? `<div class="culture-location"><span class="material-icons icon-sm">storefront</span> ${cantina}</div>` 
        : '';

    return `
    <div class="culture-card ${themeClass} animate-fade" data-action="open-modal" data-modal-type="Vini" data-id="${safeId}">
        <div class="culture-info">
            ${cantinaHtml}
            <div class="culture-title">${nome}</div>
            <div class="culture-tags">
                <span class="c-pill" style="text-transform: capitalize;">${escapeHTML(item.Tipo || 'Vino')}</span>
            </div>
        </div>
        <div class="culture-bg-icon"><i class="fa-solid fa-wine-bottle"></i></div>
    </div>`;
};

export const numeriUtiliRenderer = (n) => {
    const nome = escapeHTML(dbCol(n, 'Nome') || 'Numero Utile');
    const paesi = escapeHTML(dbCol(n, 'Paesi') || 'Info'); 
    const numero = n.Numero || n.Telefono || '';
    
    let icon = 'help_outline'; 
    const nLower = nome.toLowerCase();
    if (nLower.includes('carabinieri') || nLower.includes('polizia')) icon = 'security';
    else if (nLower.includes('medica') || nLower.includes('croce')) icon = 'medical_services';
    else if (nLower.includes('taxi')) icon = 'local_taxi';
    else if (nLower.includes('farmacia')) icon = 'local_pharmacy';

    return `
    <div class="info-card animate-fade">
        <div class="info-icon-box"><span class="material-icons">${icon}</span></div>
        <div class="info-text-col">
            <h3>${nome}</h3>
            <p><span class="material-icons icon-sm">place</span> ${paesi}</p>
        </div>
        <a href="tel:${numero}" class="action-btn btn-call" style="text-decoration:none">
            <span class="material-icons">call</span>
        </a>
    </div>`;
};

export const farmacieRenderer = (f) => {
    const nome = escapeHTML(dbCol(f, 'Farmacia') || dbCol(f, 'Nome') || 'Farmacia');
    const paese = escapeHTML(dbCol(f, 'Paese') || dbCol(f, 'Paesi') || '');
    const numero = f.Telefono || f.Numero || '';
    const itemId = String(f.id || f.ID || f.POI_ID);

    return `
    <div class="info-card animate-fade" data-action="open-modal" data-modal-type="farmacia" data-id="${itemId}">
        <div class="info-icon-box"><span class="material-icons">local_pharmacy</span></div>
        <div class="info-text-col">
            <h3>${nome}</h3>
            <p><span class="material-icons icon-sm">place</span> ${paese}</p>
        </div>
        <a href="tel:${numero}" class="action-btn btn-call" style="text-decoration:none" data-action="stop-prop-call">
            <span class="material-icons">call</span>
        </a>
    </div>`;
};

export const attrazioniRenderer = (item) => {
    const safeId = String(item.POI_ID || item.id || item.ID);
    const titolo = escapeHTML(dbCol(item, 'Attrazioni') || 'Attrazione');
    const paese = escapeHTML(dbCol(item, 'Paese'));
    const tempo = escapeHTML(item.Tempo_visita || '--'); 
    const diff = escapeHTML(dbCol(item, 'Difficoltà Accesso') || 'Accessibile');
    const rawLabel = dbCol(item, 'Label') || 'Storico';
    const label = rawLabel.toLowerCase().trim(); 
    
    let themeClass = 'is-monument';
    let iconClass = 'fa-landmark'; 
    if (label === 'religioso') { themeClass = 'is-church'; iconClass = 'fa-church'; }
    else if (label === 'panorama') { themeClass = 'is-view'; iconClass = 'fa-mountain-sun'; }
    else if (label === 'storico') { themeClass = 'is-monument'; iconClass = 'fa-chess-rook'; }

    return `
    <div class="culture-card ${themeClass} animate-fade" data-action="open-modal" data-modal-type="attrazione" data-id="${safeId}">
        <div class="culture-info">
            <div class="culture-location"><span class="material-icons icon-sm">place</span> ${paese}</div>
            <div class="culture-title">${titolo}</div>
            <div class="culture-tags">
                <span class="c-pill"><span class="material-icons icon-xs">schedule</span> ${tempo}</span>
                <span class="c-pill">${diff}</span>
            </div>
        </div>
        <div class="culture-bg-icon"><i class="fa-solid ${iconClass}"></i></div>
    </div>`;
};

export const prodottoRenderer = (p) => {
    const titolo = escapeHTML(dbCol(p, 'Prodotti') || dbCol(p, 'Nome'));
    const ideale = escapeHTML(dbCol(p, 'Ideale per') || 'Tutti'); 
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = getSmartUrl(fotoKey, '', 200);
    const itemId = String(p.id || p.ID || p.POI_ID);

    return `
    <div class="culture-card is-product animate-fade" data-action="open-modal" data-modal-type="product" data-id="${itemId}">
        <div class="culture-info">
            <div class="culture-title">${titolo}</div>
            <div class="product-subtitle">
                <span class="material-icons">stars</span> ${t('ideal_for')}: ${ideale}
            </div>
        </div>
        <div class="culture-product-thumb">
            <img src="${imgUrl}" loading="lazy" alt="${titolo}">
        </div>
    </div>`;
};

// --- LOGICA FILTRI (Generazione HTML + Binding Eventi LOCALI JS) ---

export const renderGenericFilterableView = (allData, filterKey, container, cardRenderer) => {
    // 1. Pulizia e Setup
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');

    // Rimuovi vecchi elementi filtro se presenti
    ['filter-sheet', 'filter-overlay', 'filter-toggle-btn'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.remove();
    });

    // 2. Calcolo Tags
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

    // 3. Generazione HTML Filtri
    let chipsHtml = uniqueTags.map(tag => {
        const isAll = tag === 'Tutti';
        // Nota: Qui non usiamo data-action perché leghiamo l'evento JS direttamente sotto
        return `<button class="sheet-chip ${isAll ? 'active-filter' : ''}" data-tag="${tag}">
                    ${isAll ? t('filter_all') : tag}
                </button>`;
    }).join('');

    const filterHtml = `
    <div id="filter-overlay" class="sheet-overlay"></div>
    <div id="filter-sheet" class="bottom-sheet">
        <div class="sheet-header">
            <div class="sheet-title">${t('filter_title')}</div>
            <div class="material-icons sheet-close">close</div>
        </div>
        <div class="filter-grid" id="sheet-options">
            ${chipsHtml}
        </div>
    </div>
    <button id="filter-toggle-btn" style="display: block;">
        <span class="material-icons">filter_list</span>
    </button>`;

    // 4. Iniezione nel DOM
    document.body.insertAdjacentHTML('beforeend', filterHtml);

    // 5. Binding Logica (JavaScript locale, no globali)
    const overlay = document.getElementById('filter-overlay');
    const sheet = document.getElementById('filter-sheet');
    const closeBtn = sheet.querySelector('.sheet-close');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    const chips = sheet.querySelectorAll('.sheet-chip');

    const closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    const openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };

    toggleBtn.onclick = openFilterSheet;
    overlay.onclick = closeFilterSheet;
    closeBtn.onclick = closeFilterSheet;

    // Gestione click sui chip (Local JS Binding)
    chips.forEach(chip => {
        chip.onclick = () => {
            chips.forEach(c => c.classList.remove('active-filter'));
            chip.classList.add('active-filter');
            const tag = chip.getAttribute('data-tag');
            
            const isAll = tag === 'Tutti';
            const filtered = isAll ? allData : allData.filter(item => { 
                const valDB = item[filterKey] ? item[filterKey].trim() : ''; 
                return valDB.includes(tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza')); 
            });
            
            updateList(filtered); 
            closeFilterSheet();
        };
    });

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${t('no_results')}</p>`;
            return; 
        }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
    }

    // Init lista
    updateList(allData);
};

export const renderDoubleFilterView = (allData, filtersConfig, container, cardRenderer) => {
    // 1. Setup Container
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');

    ['filter-sheet', 'filter-overlay', 'filter-toggle-btn'].forEach(id => { const el = document.getElementById(id); if(el) el.remove(); });

    // 2. Helper Valori Unici
    const getUniqueValues = (key, customOrder = []) => {
        const raw = allData.map(i => dbCol(i, key)).filter(x => x).map(x => x.trim());
        let unique = [...new Set(raw)];
        if (customOrder.length > 0) { 
            return unique.sort((a, b) => { 
                const idxA = customOrder.indexOf(a), idxB = customOrder.indexOf(b); 
                if (idxA !== -1 && idxB !== -1) return idxA - idxB; 
                if (idxA !== -1) return -1; if (idxB !== -1) return 1; 
                return a.localeCompare(b); 
            }); 
        } else { return unique.sort(); }
    };

    const values1 = getUniqueValues(filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(filtersConfig.secondary.key, filtersConfig.secondary.customOrder);
    let activeVal1 = 'Tutti'; 
    let activeVal2 = 'Tutti';

    // 3. Generazione HTML Filtri
    const createChip = (text, type, value) => {
        return `<button class="sheet-chip ${value === 'Tutti' ? 'active-filter' : ''}" data-type="${type}" data-val="${value}">
                    ${text}
                </button>`;
    };

    const renderChipsHtml = (vals, type) => {
        let html = createChip(t('filter_all'), type, 'Tutti');
        vals.forEach(v => {
            const label = v.charAt(0).toUpperCase() + v.slice(1);
            html += createChip(label, type, v);
        });
        return html;
    };

    const filterHtml = `
    <div id="filter-overlay" class="sheet-overlay"></div>
    <div id="filter-sheet" class="bottom-sheet">
        <div class="sheet-header">
            <div class="sheet-title">${t('filter_title')}</div>
            <div class="material-icons sheet-close">close</div>
        </div>
        <div class="filter-section-title">${filtersConfig.primary.title || t('filter_village')}</div>
        <div class="filter-grid" id="section-1-options">${renderChipsHtml(values1, 'primary')}</div>
        
        <div class="filter-section-title" style="margin-top: 25px;">${filtersConfig.secondary.title || t('filter_cat')}</div>
        <div class="filter-grid" id="section-2-options">${renderChipsHtml(values2, 'secondary')}</div>
        
        <button class="btn-apply-filters">${t('show_results')}</button>
    </div>
    <button id="filter-toggle-btn" style="display: block;">
        <span class="material-icons">filter_list</span>
    </button>`;

    document.body.insertAdjacentHTML('beforeend', filterHtml);

    // 4. Binding
    const overlay = document.getElementById('filter-overlay');
    const sheet = document.getElementById('filter-sheet');
    const closeBtn = sheet.querySelector('.sheet-close');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    const applyBtn = sheet.querySelector('.btn-apply-filters');
    const opts1 = document.getElementById('section-1-options');
    const opts2 = document.getElementById('section-2-options');

    const closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    const openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };

    toggleBtn.onclick = openFilterSheet;
    overlay.onclick = closeFilterSheet;
    closeBtn.onclick = closeFilterSheet;
    applyBtn.onclick = closeFilterSheet;

    const handleChipClick = (e, container, type) => {
        if(e.target.classList.contains('sheet-chip')) {
            container.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active-filter'));
            e.target.classList.add('active-filter');
            
            const val = e.target.getAttribute('data-val');
            if(type === 'primary') activeVal1 = val;
            if(type === 'secondary') activeVal2 = val;
            
            applyFilters();
        }
    };

    opts1.onclick = (e) => handleChipClick(e, opts1, 'primary');
    opts2.onclick = (e) => handleChipClick(e, opts2, 'secondary');

    function applyFilters() {
        const filtered = allData.filter(item => {
            const val1 = dbCol(item, filtersConfig.primary.key) || '';
            const val2 = dbCol(item, filtersConfig.secondary.key) || '';
            const match1 = (activeVal1 === 'Tutti') || val1.includes(activeVal1);
            const match2 = (activeVal2 === 'Tutti') || val2.toLowerCase().includes(activeVal2.toLowerCase());
            return match1 && match2;
        });
        updateList(filtered);
    }

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${t('no_results')}</p>`;
        } else { 
            listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        }
    }

    updateList(allData);
};