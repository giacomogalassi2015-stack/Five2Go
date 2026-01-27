console.log("✅ 2. ui-renderers.js caricato (DOM Safe Mode - Fixed IDs)");

// ============================================================
// 1. RENDERER DELLE CARD (Restituiscono ELEMENTI DOM, non stringhe)
// ============================================================

window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    
    // FIX 3: Estrazione sicura dell'ID per evitare conflitti o undefined
    const itemId = String(r.id || r.ID || r.POI_ID);
    
    const mapLink = r.Mappa || `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(nome + ' ' + paesi)}`;

    // Costruzione sicura
    return window.mk('div', { class: 'restaurant-glass-card' }, [
        window.mk('h3', { class: 'rest-card-title' }, nome),
        window.mk('p', { class: 'rest-card-subtitle' }, [
            window.mk('span', { class: 'material-icons' }, 'restaurant'),
            ` ${paesi}`
        ]),
        window.mk('div', { class: 'rest-card-actions' }, [
            // Qui passiamo itemId, che è univoco per questa istanza grazie a 'const' e scope
            window.mk('div', { class: 'action-btn btn-info rest-btn-size', onclick: () => window.openModal('ristorante', itemId) }, 
                window.mk('span', { class: 'material-icons' }, 'info_outline')
            ),
            numero ? window.mk('div', { class: 'action-btn btn-call rest-btn-size', onclick: () => window.location.href=`tel:${numero}` },
                window.mk('span', { class: 'material-icons' }, 'call')
            ) : null,
            window.mk('div', { class: 'action-btn btn-map rest-btn-size', onclick: () => window.open(mapLink, '_blank') },
                window.mk('span', { class: 'material-icons' }, 'map')
            )
        ])
    ]);
};

window.spiaggiaRenderer = (item) => {
    const nome = item.Nome || 'Spiaggia';
    const comune = item.Paese || item.Comune || '';
    const tipo = item.Tipo || 'Spiaggia';
    
    // FIX 3: ID Univoco Sicuro
    const safeId = String(item.id || item.ID || item.POI_ID);

    return window.mk('div', { class: 'culture-card is-beach animate-fade', onclick: () => window.openModal('Spiagge', safeId) }, [
        window.mk('div', { class: 'culture-info' }, [
            comune ? window.mk('div', { class: 'culture-location' }, [
                window.mk('span', { class: 'material-icons icon-sm' }, 'place'),
                ` ${comune}`
            ]) : null,
            window.mk('h3', { class: 'culture-title' }, nome),
            window.mk('div', { class: 'culture-tags' }, 
                window.mk('span', { class: 'c-pill' }, tipo)
            )
        ]),
        window.mk('div', { class: 'culture-bg-icon' }, 
            window.mk('i', { class: 'fa-solid fa-water' })
        )
    ]);
};

window.sentieroRenderer = (s) => {
    const paese = window.dbCol(s, 'Paesi');
    const nomeSentiero = s.Nome || '';
    const titoloMostrato = nomeSentiero || paese; 
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const itemId = String(s.id || s.ID || s.POI_ID);
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;

    let diffColor = '#f39c12';
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60';
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b';

    // Registra la mappa per l'inizializzazione successiva
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return window.mk('div', { class: 'trail-card-modern animate-fade' }, [
        window.mk('div', { 
            id: uniqueMapId, 
            class: 'trail-map-container',
            onclick: (e) => { e.stopPropagation(); window.openModal('map', gpxUrl); }
        }),
        window.mk('div', { class: 'trail-info-overlay' }, [
            window.mk('h3', { 
                class: 'text-center font-bold color-dark', 
                style: { margin: '5px 0', fontFamily: 'Roboto Slab', fontSize: '1.25rem' } 
            }, titoloMostrato),
            window.mk('div', { 
                class: 'text-center text-uppercase font-bold mb-20',
                style: { fontSize: '0.75rem', color: diffColor, letterSpacing: '1px' }
            }, diff),
            window.mk('button', { 
                class: 'btn-trail-action',
                onclick: () => window.openModal('trail', itemId)
            }, [
                window.t('btn_details'),
                window.mk('span', { class: 'material-icons', style: { fontSize: '1.1rem' } }, 'arrow_forward')
            ])
        ])
    ]);
};

window.vinoRenderer = (item) => {
    const safeId = String(item.id || item.ID || item.POI_ID);
    const nome = item.Nome || 'Vino';
    const cantina = window.dbCol(item, 'Produttore') || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();
    
    let themeClass = 'is-wine-red'; 
    if (tipo.includes('bianco')) themeClass = 'is-wine-white';
    if (tipo.includes('rosato') || tipo.includes('orange')) themeClass = 'is-wine-orange';

    return window.mk('div', { class: `culture-card ${themeClass} animate-fade`, onclick: () => window.openModal('Vini', safeId) }, [
        window.mk('div', { class: 'culture-info' }, [
            cantina ? window.mk('div', { class: 'culture-location' }, [
                window.mk('span', { class: 'material-icons icon-sm' }, 'storefront'), ` ${cantina}`
            ]) : null,
            window.mk('div', { class: 'culture-title' }, nome),
            window.mk('div', { class: 'culture-tags' }, 
                window.mk('span', { class: 'c-pill', style: { textTransform: 'capitalize' } }, item.Tipo || 'Vino')
            )
        ]),
        window.mk('div', { class: 'culture-bg-icon' }, window.mk('i', { class: 'fa-solid fa-wine-bottle' }))
    ]);
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

    return window.mk('div', { class: 'info-card animate-fade' }, [
        window.mk('div', { class: 'info-icon-box' }, window.mk('span', { class: 'material-icons' }, icon)),
        window.mk('div', { class: 'info-text-col' }, [
            window.mk('h3', {}, nome),
            window.mk('p', {}, [window.mk('span', { class: 'material-icons icon-sm' }, 'place'), ` ${paesi}`])
        ]),
        window.mk('div', { class: 'action-btn btn-call', onclick: () => window.location.href=`tel:${numero}` },
            window.mk('span', { class: 'material-icons' }, 'call')
        )
    ]);
};

window.farmacieRenderer = (f) => {
    const nome = window.dbCol(f, 'Farmacia') || window.dbCol(f, 'Nome') || 'Farmacia';
    const paese = window.dbCol(f, 'Paese') || window.dbCol(f, 'Paesi') || '';
    const numero = f.Telefono || f.Numero || '';
    const itemId = String(f.id || f.ID || f.POI_ID);

    return window.mk('div', { class: 'info-card animate-fade', onclick: () => window.openModal('farmacia', itemId) }, [
        window.mk('div', { class: 'info-icon-box' }, window.mk('span', { class: 'material-icons' }, 'local_pharmacy')),
        window.mk('div', { class: 'info-text-col' }, [
            window.mk('h3', {}, nome),
            window.mk('p', {}, [window.mk('span', { class: 'material-icons icon-sm' }, 'place'), ` ${paese}`])
        ]),
        window.mk('div', { class: 'action-btn btn-call', onclick: (e) => { e.stopPropagation(); window.location.href=`tel:${numero}`; } },
            window.mk('span', { class: 'material-icons' }, 'call')
        )
    ]);
};

window.attrazioniRenderer = (item) => {
    const safeId = String(item.POI_ID || item.id || item.ID);
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

    return window.mk('div', { class: `culture-card ${themeClass} animate-fade`, onclick: () => window.openModal('attrazione', safeId) }, [
        window.mk('div', { class: 'culture-info' }, [
            window.mk('div', { class: 'culture-location' }, [window.mk('span', { class: 'material-icons icon-sm' }, 'place'), ` ${paese}`]),
            window.mk('div', { class: 'culture-title' }, titolo),
            window.mk('div', { class: 'culture-tags' }, [
                window.mk('span', { class: 'c-pill' }, [window.mk('span', { class: 'material-icons icon-xs' }, 'schedule'), ` ${tempo}`]),
                window.mk('span', { class: 'c-pill' }, diff)
            ])
        ]),
        window.mk('div', { class: 'culture-bg-icon' }, window.mk('i', { class: `fa-solid ${iconClass}` }))
    ]);
};

window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const ideale = window.dbCol(p, 'Ideale per') || 'Tutti'; 
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200);
    
    // FIX 3: ID Sicuro
    const itemId = String(p.id || p.ID || p.POI_ID);

    return window.mk('div', { class: 'culture-card is-product animate-fade', onclick: () => window.openModal('product', itemId) }, [
        window.mk('div', { class: 'culture-info' }, [
            window.mk('div', { class: 'culture-title' }, titolo),
            window.mk('div', { class: 'product-subtitle' }, [window.mk('span', { class: 'material-icons' }, 'stars'), ` ${window.t('ideal_for')}: ${ideale}`])
        ]),
        window.mk('div', { class: 'culture-product-thumb' }, 
            window.mk('img', { src: imgUrl, loading: 'lazy', alt: titolo })
        )
    ]);
};

// ============================================================
// 2. LOGICA MODALE (DOM Only)
// ============================================================

window.openModal = async function(type, payload) {
    // Factory crea contenuto DOM
    const generator = window.ModalFactory.create(type, payload);
    const contentEl = generator.generate(); 
    const modalClass = generator.getClass();

    const overlay = window.mk('div', { class: 'modal-overlay animate-fade', onclick: (e) => { if(e.target === overlay) overlay.remove(); } });
    
    const contentWrapper = window.mk('div', { class: modalClass }, [
        window.mk('span', { class: 'close-modal', onclick: () => overlay.remove() }, '×'),
        contentEl
    ]);

    overlay.appendChild(contentWrapper);
    document.body.appendChild(overlay);
};

// ============================================================
// 3. MAP & UTILS
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
    container.innerHTML = ''; 
    const listContainer = window.mk('div', { class: 'list-container animate-fade', id: 'dynamic-list', style: { paddingBottom: '80px' } });
    container.appendChild(listContainer);

    ['filter-sheet', 'filter-overlay', 'filter-toggle-btn'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.remove();
    });

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

    const overlay = window.mk('div', { id: 'filter-overlay', class: 'sheet-overlay' });
    const optionsContainer = window.mk('div', { class: 'filter-grid', id: 'sheet-options' });
    
    const sheet = window.mk('div', { id: 'filter-sheet', class: 'bottom-sheet' }, [
        window.mk('div', { class: 'sheet-header' }, [
            window.mk('div', { class: 'sheet-title' }, window.t('filter_title')),
            window.mk('div', { class: 'material-icons sheet-close', onclick: window.closeFilterSheet }, 'close')
        ]),
        optionsContainer
    ]);

    let activeTag = 'Tutti'; 

    uniqueTags.forEach(tag => {
        const isAll = tag === 'Tutti';
        const chip = window.mk('button', { 
            class: `sheet-chip ${isAll ? 'active-filter' : ''}`, 
            onclick: () => {
                document.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active-filter'));
                chip.classList.add('active-filter');
                activeTag = tag;
                const filtered = isAll ? allData : allData.filter(item => { 
                    const valDB = item[filterKey] ? item[filterKey].trim() : ''; 
                    return valDB.includes(tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza')); 
                });
                updateList(filtered); 
                window.closeFilterSheet();
            }
        }, isAll ? window.t('filter_all') : tag);
        optionsContainer.appendChild(chip);
    });

    const filterBtn = window.mk('button', { 
        id: 'filter-toggle-btn', 
        style: { display: 'block' },
        onclick: window.openFilterSheet
    }, window.mk('span', { class: 'material-icons' }, 'filter_list'));

    document.body.append(overlay, sheet, filterBtn);

    window.openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };
    window.closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    overlay.onclick = window.closeFilterSheet;

    function updateList(items) {
        listContainer.innerHTML = '';
        if (!items || items.length === 0) { 
            listContainer.appendChild(window.mk('p', { style: { textAlign:'center', padding:'40px', color:'#999' } }, window.t('no_results')));
            return; 
        }
        
        const frag = document.createDocumentFragment();
        items.forEach(item => frag.appendChild(cardRenderer(item)));
        listContainer.appendChild(frag);

        if (typeof window.initPendingMaps === 'function') setTimeout(() => window.initPendingMaps(), 100);
    }
    updateList(allData);
};

window.renderDoubleFilterView = function(allData, filtersConfig, container, cardRenderer) {
    container.innerHTML = '';
    const listContainer = window.mk('div', { class: 'list-container animate-fade', id: 'dynamic-list', style: { paddingBottom: '80px' } });
    container.appendChild(listContainer);

    ['filter-sheet', 'filter-overlay', 'filter-toggle-btn'].forEach(id => { const el = document.getElementById(id); if(el) el.remove(); });

    const getUniqueValues = (key, customOrder = []) => {
        const raw = allData.map(i => window.dbCol(i, key)).filter(x => x).map(x => x.trim());
        let unique = [...new Set(raw)];
        if (customOrder && customOrder.length > 0) { return unique.sort((a, b) => { const idxA = customOrder.indexOf(a); const idxB = customOrder.indexOf(b); if (idxA !== -1 && idxB !== -1) return idxA - idxB; if (idxA !== -1) return -1; if (idxB !== -1) return 1; return a.localeCompare(b); }); } else { return unique.sort(); }
    };

    const values1 = getUniqueValues(filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(filtersConfig.secondary.key, filtersConfig.secondary.customOrder);
    let activeVal1 = 'Tutti'; let activeVal2 = 'Tutti';

    const overlay = window.mk('div', { class: 'sheet-overlay' });
    const sheet = window.mk('div', { class: 'bottom-sheet' });
    
    const opts1 = window.mk('div', { class: 'filter-grid', id: 'section-1-options' });
    const opts2 = window.mk('div', { class: 'filter-grid', id: 'section-2-options' });

    sheet.append(
        window.mk('div', { class: 'sheet-header' }, [
            window.mk('div', { class: 'sheet-title' }, window.t('filter_title')),
            window.mk('div', { class: 'material-icons sheet-close', onclick: window.closeFilterSheet }, 'close')
        ]),
        window.mk('div', { class: 'filter-section-title' }, filtersConfig.primary.title || window.t('filter_village')),
        opts1,
        window.mk('div', { class: 'filter-section-title', style: { marginTop: '25px' } }, filtersConfig.secondary.title || window.t('filter_cat')),
        opts2,
        window.mk('button', { class: 'btn-apply-filters', onclick: window.closeFilterSheet }, window.t('show_results'))
    );

    document.body.append(overlay, sheet);

    function createChip(text, isActive, onClick) {
        return window.mk('button', { 
            class: `sheet-chip ${isActive ? 'active-filter' : ''}`, 
            onclick: onClick 
        }, text);
    }

    function renderChips() {
        opts1.innerHTML = ''; opts2.innerHTML = '';
        
        opts1.appendChild(createChip(window.t('filter_all'), activeVal1 === 'Tutti', () => { activeVal1 = 'Tutti'; applyFilters(); renderChips(); }));
        values1.forEach(v => opts1.appendChild(createChip(v, activeVal1 === v, () => { activeVal1 = v; applyFilters(); renderChips(); })));
        
        opts2.appendChild(createChip(window.t('filter_all'), activeVal2 === 'Tutti', () => { activeVal2 = 'Tutti'; applyFilters(); renderChips(); }));
        values2.forEach(v => {
            const label = v.charAt(0).toUpperCase() + v.slice(1);
            opts2.appendChild(createChip(label, activeVal2 === v, () => { activeVal2 = v; applyFilters(); renderChips(); }));
        });
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
        listContainer.innerHTML = '';
        if (!items || items.length === 0) { 
            listContainer.appendChild(window.mk('p', { style: { textAlign:'center', padding:'40px', color:'#999' } }, window.t('no_results'))); 
        } else { 
            const frag = document.createDocumentFragment();
            items.forEach(item => frag.appendChild(cardRenderer(item))); 
            listContainer.appendChild(frag);
        }
    }

    const filterBtn = window.mk('button', { id: 'filter-toggle-btn', style: { display:'block' }, onclick: window.openFilterSheet }, 
        window.mk('span', { class: 'material-icons' }, 'filter_list')
    );
    document.body.appendChild(filterBtn);

    window.openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };
    window.closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    overlay.onclick = window.closeFilterSheet;

    renderChips(); updateList(allData);
};