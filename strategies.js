console.log("✅ strategies.js caricato (DOM Safe Mode - Fixed Bus & Ferry)");

/* ============================================================
   PATTERN 1: STRATEGY (Gestione Caricamento Viste/Tabelle)
   ============================================================ */

class BaseViewStrategy {
    async load(container) {
        throw new Error("Method 'load' must be implemented.");
    }
    async fetchData(tableName) {
        if (window.appCache[tableName]) return window.appCache[tableName];
        const { data, error } = await window.supabaseClient.from(tableName).select('*');
        if (error) throw error;
        window.appCache[tableName] = data;
        return data;
    }
}

class WineStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Vini');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Tipo', container, window.vinoRenderer);
    }
}

class BeachStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Spiagge');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Paesi', container, window.spiaggiaRenderer);
    }
}

class ProductStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Prodotti');
        window.currentTableData = data;
        container.innerHTML = '';
        const listDiv = window.mk('div', { class: 'list-container animate-fade', style: { paddingBottom:'20px' } });
        // Passiamo 'data' completo, il renderer gestirà l'id
        data.forEach(p => listDiv.appendChild(window.prodottoRenderer(p)));
        container.appendChild(listDiv);
    }
}

class TransportStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Trasporti');
        window.tempTransportData = data; // Cruciale per la modale trasporti
        container.innerHTML = '';
        const listDiv = window.mk('div', { class: 'list-container animate-fade' });
        
        data.forEach((t, index) => {
            const nomeDisplay = window.dbCol(t, 'Località') || window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Mezzo, '', 400);
            
            // Usiamo l'indice per i trasporti perché la modale trasporti lavora su tempTransportData[index]
            const card = window.mk('div', { class: 'card-product', onclick: () => window.openModal('transport', index) }, [
                window.mk('div', { class: 'prod-info' }, window.mk('div', { class: 'prod-title' }, nomeDisplay)),
                window.mk('img', { src: imgUrl, class: 'prod-thumb', loading: 'lazy' })
            ]);
            listDiv.appendChild(card);
        });
        container.appendChild(listDiv);
    }
}

class AttractionStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Attrazioni');
        window.currentTableData = data;
        const culturaConfig = {
            primary: { key: 'Paese', title: '📍 ' + (window.t('nav_villages') || 'Borgo'), customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] },
            secondary: { key: 'Label', title: '🏷️ Categoria' }
        };
        window.renderDoubleFilterView(data, culturaConfig, container, window.attrazioniRenderer);
    }
}

class RestaurantStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Ristoranti');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Paesi', container, window.ristoranteRenderer);
    }
}

class TrailStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Sentieri');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Difficolta', container, window.sentieroRenderer);
    }
}

class PharmacyStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Farmacie');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Paesi', container, window.farmacieRenderer);
    }
}

class UsefulNumbersStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Numeri_utili');
        window.currentTableData = data; 
        window.renderGenericFilterableView(data, 'Comune', container, window.numeriUtiliRenderer);
    }
}

class MapStrategy extends BaseViewStrategy {
    async load(container) {
        container.innerHTML = '';
        container.appendChild(
            window.mk('div', { class: 'map-container animate-fade' }, 
                window.mk('iframe', { 
                    src: 'https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1', 
                    width: '640', height: '480', style: { border: 'none' } 
                })
            )
        );
    }
}

class ViewContext {
    constructor() {
        this.strategies = {
            'Vini': new WineStrategy(),
            'Spiagge': new BeachStrategy(),
            'Prodotti': new ProductStrategy(),
            'Trasporti': new TransportStrategy(),
            'Attrazioni': new AttractionStrategy(),
            'Ristoranti': new RestaurantStrategy(),
            'Sentieri': new TrailStrategy(),
            'Farmacie': new PharmacyStrategy(),
            'Numeri_utili': new UsefulNumbersStrategy(),
            'Mappe': new MapStrategy()
        };
    }
    getStrategy(tableName) { return this.strategies[tableName]; }
}

window.viewStrategyContext = new ViewContext();

/* ============================================================
   PATTERN 2: FACTORY (MODALI DOM BASED)
   ============================================================ */

class ModalContentFactory {
    static create(type, payload) {
        let item = null;

        // 1. Mappe e Trasporti (logica speciale)
        if (type === 'map') return new MapModalGenerator(payload);
        if (type === 'transport') return new TransportModalGenerator(payload);

        // 2. Lookup Item Generico per ID
        // FIX: Usiamo String() per assicurarci che confronti stringa con stringa (es. "1" === "1")
        if (window.currentTableData) {
            const searchId = String(payload);
            item = window.currentTableData.find(i => {
                // Controlla tutte le possibili varianti di ID
                const itemId = String(i.id || i.ID || i.POI_ID);
                return itemId === searchId;
            });
        }

        if (!item) {
            console.warn(`Oggetto non trovato per ID: ${payload}. Controllare window.currentTableData.`);
            return { 
                generate: () => window.mk('div', { class: 'modal-body-pad' }, window.mk('p', {}, `Dati non disponibili o ID non trovato (${payload}).`)), 
                getClass: () => 'modal-content' 
            };
        }

        // 3. Routing
        switch (type) {
            case 'product': case 'Prodotti': return new ProductModalGenerator(item);
            case 'trail': case 'Sentieri': return new TrailModalGenerator(item);
            case 'ristorante': case 'restaurant': case 'Ristoranti': return new RestaurantModalGenerator(item);
            case 'farmacia': case 'Farmacie': return new PharmacyModalGenerator(item);
            case 'Vini': case 'wine': return new WineModalGenerator(item);
            case 'Attrazioni': case 'attrazione': return new AttractionModalGenerator(item);
            case 'Spiagge': return new BeachModalGenerator(item);
            default: return { generate: () => window.mk('p', {}, 'Content not found'), getClass: () => 'modal-content' };
        }
    }
}

// GENERATORI DOM

class ProductModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content glass-modal'; }
    generate() {
        const nome = window.dbCol(this.p, 'Prodotti') || window.dbCol(this.p, 'Nome');
        const desc = window.dbCol(this.p, 'Descrizione');   
        const ideale = window.dbCol(this.p, 'Ideale per'); 
        const bigImg = window.getSmartUrl(this.p.Prodotti_foto || nome, '', 800);

        return window.mk('div', {}, [
            window.mk('div', { class: 'modal-hero-wrapper' }, 
                window.mk('img', { src: bigImg, class: 'modal-hero-img', onerror: function() { this.style.display='none'; } })
            ),
            window.mk('div', { class: 'modal-body-pad' }, [
                window.mk('h2', { class: 'modal-title-lg' }, nome),
                ideale ? window.mk('div', { class: 'mb-20' }, window.mk('span', { class: 'glass-tag' }, `✨ ${window.t('ideal_for')}: ${ideale}`)) : null,
                window.mk('p', { class: 'modal-desc-text' }, desc)
            ])
        ]);
    }
}

class TransportModalGenerator {
    constructor(index) { 
        // Recupera dai dati temporanei salvati dalla strategy
        this.item = window.tempTransportData ? window.tempTransportData[index] : null; 
    }
    getClass() { return 'modal-content'; }
    
    generate() {
        if (!this.item) return window.mk('div', { class: 'modal-body-pad' }, window.mk('p', {}, 'Errore caricamento dati trasporto.'));
        
        const searchStr = ((window.dbCol(this.item, 'Nome') || '') + ' ' + (window.dbCol(this.item, 'Località') || '') + ' ' + (window.dbCol(this.item, 'Mezzo') || '')).toLowerCase();

        if (searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc')) {
            setTimeout(() => { if(window.loadAllStops) window.loadAllStops(); }, 100);
            return this._createBusDOM(this.item);
        }
        if (searchStr.includes('battello') || searchStr.includes('traghetto')) {
            setTimeout(() => window.initFerrySearch(), 100);
            return this._createFerryDOM();
        }
        
        // Default (Treno, Taxi, ecc.)
        const nome = window.dbCol(this.item, 'Nome') || 'Trasporto';
        return window.mk('div', { class: 'modal-body-pad mt-10' }, [
            window.mk('h2', {}, nome),
            window.mk('p', { class: 'color-gray' }, window.dbCol(this.item, 'Descrizione'))
        ]);
    }

    // FIX 1: Ricreato UI Bus con Ticket Info e Mappa
    _createBusDOM(item) {
        const container = window.mk('div', { class: 'bus-search-box animate-fade' });
        
        // Titolo
        container.appendChild(window.mk('div', { class: 'bus-title', style: { paddingBottom:'15px' } }, [
            window.mk('span', { class: 'material-icons' }, 'directions_bus'), 
            ` ${window.t('plan_trip')}`
        ]));

        // Sezione Ticket Info (nascosta di default)
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');

        if (infoSms || infoApp || infoAvvisi) {
            const ticketBox = window.mk('div', { id: 'ticket-info-box', class: 'ticket-info-content', style: { display: 'none' } });
            if(infoSms) ticketBox.appendChild(window.mk('p', { class: 'mb-10' }, [window.mk('strong', {}, '📱 SMS'), window.mk('br'), infoSms]));
            if(infoApp) ticketBox.appendChild(window.mk('p', { class: 'mb-10' }, [window.mk('strong', {}, '📲 APP'), window.mk('br'), infoApp]));
            if(infoAvvisi) ticketBox.appendChild(window.mk('div', { class: 'warning-box' }, [window.mk('strong', {}, `⚠️ ${window.t('label_warning')}: `), infoAvvisi]));

            const toggleBtn = window.mk('button', { 
                class: 'ticket-toggle-btn', 
                onclick: () => { 
                    const t = document.getElementById('ticket-info-box'); 
                    if(t) t.style.display = (t.style.display === 'none') ? 'block' : 'none'; 
                } 
            }, `🎟️ ${window.t('how_to_ticket')} ▾`);

            container.append(toggleBtn, ticketBox);
        }

        // Sezione Mappa (nascosta di default)
        const mapBox = window.mk('div', { id: 'bus-map-wrapper', class: 'map-hidden-container', style: { display: 'none' } }, [
            window.mk('div', { id: 'bus-map', class: 'bus-map-frame' }),
            window.mk('p', { class: 'map-modal-hint' }, window.t('map_hint'))
        ]);
        
        const mapBtn = window.mk('button', { 
            class: 'map-toggle-btn',
            onclick: () => {
                const m = document.getElementById('bus-map-wrapper');
                if(m) m.style.display = (m.style.display === 'none') ? 'block' : 'none';
            }
        }, `🗺️ ${window.t('show_map')} ▾`);

        container.append(mapBtn, mapBox);

        // Inputs Ricerca
        const inputs = window.mk('div', {}, [
            window.mk('div', { class: 'bus-inputs' }, [
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('departure')),
                    window.mk('select', { id: 'selPartenza', class: 'bus-select', onchange: function(){ window.filterDestinations(this.value) } }, 
                        window.mk('option', { disabled: true, selected: true }, window.t('loading'))
                    )
                ]),
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('arrival')),
                    window.mk('select', { id: 'selArrivo', class: 'bus-select', disabled: true }, 
                        window.mk('option', { disabled: true, selected: true }, window.t('select_start'))
                    )
                ])
            ]),
            window.mk('div', { class: 'bus-inputs' }, [
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('date_trip')),
                    window.mk('input', { type: 'date', id: 'selData', class: 'bus-select', value: new Date().toISOString().split('T')[0] })
                ]),
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('time_trip')),
                    window.mk('input', { type: 'time', id: 'selOra', class: 'bus-select', value: new Date().toTimeString().substring(0,5) })
                ])
            ])
        ]);

        const btnSearch = window.mk('button', { 
            id: 'btnSearchBus', 
            class: 'btn-yellow', 
            style: { width: '100%', marginTop: '5px', opacity: '0.5', pointerEvents: 'none' },
            onclick: () => window.eseguiRicercaBus()
        }, window.t('find_times'));

        const results = window.mk('div', { id: 'busResultsContainer', class: 'd-none mt-20' }, [
            window.mk('div', { id: 'nextBusCard', class: 'bus-result-main' }),
            window.mk('div', { style: { fontSize:'0.8rem', fontWeight:'bold', color:'#666', marginTop:'15px' } }, `${window.t('next_runs')}:`),
            window.mk('div', { id: 'otherBusList', class: 'bus-list-container' })
        ]);

        container.append(inputs, btnSearch, results);
        return container;
    }

    // FIX 2: Ricreato UI Battelli completa
    _createFerryDOM() {
        const container = window.mk('div', { class: 'bus-search-box animate-fade' });
        
        // Header Battello
        const headerIcon = window.mk('span', { 
            class: 'material-icons', 
            style: { background: 'linear-gradient(135deg, #0288D1, #0277BD)', boxShadow: '0 4px 6px rgba(2, 119, 189, 0.3)' } 
        }, 'directions_boat');
        
        container.appendChild(window.mk('div', { class: 'bus-title', style: { paddingBottom:'15px' } }, [headerIcon, ` ${window.t('plan_trip')} (Battello)`]));

        // Info Biglietti & Meteo
        const ticketBox = window.mk('div', { id: 'ticket-info-box-ferry', class: 'ticket-info-content', style: { display: 'none' } }, [
            window.mk('p', {}, 'I biglietti sono acquistabili presso le biglietterie al molo.'),
            window.mk('div', { class: 'warning-box' }, [window.mk('strong', {}, '⚠️ INFO METEO:'), ' In caso di mare mosso il servizio è sospeso.'])
        ]);

        const toggleBtn = window.mk('button', { 
            class: 'ticket-toggle-btn', 
            style: { background:'#e1f5fe', color:'#01579b', borderColor:'#b3e5fc' },
            onclick: () => { 
                const t = document.getElementById('ticket-info-box-ferry'); 
                if(t) t.style.display = (t.style.display === 'none') ? 'block' : 'none'; 
            } 
        }, `🎟️ ${window.t('how_to_ticket')} ▾`);

        container.append(toggleBtn, ticketBox);

        // Inputs Battelli
        const inputs = window.mk('div', {}, [
            window.mk('div', { class: 'bus-inputs' }, [
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('departure')),
                    window.mk('select', { id: 'selPartenzaFerry', class: 'bus-select' }, 
                        window.mk('option', { disabled: true, selected: true }, window.t('loading'))
                    )
                ]),
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('arrival')),
                    window.mk('select', { id: 'selArrivoFerry', class: 'bus-select' }, 
                        window.mk('option', { disabled: true, selected: true }, window.t('select_start'))
                    )
                ])
            ]),
            window.mk('div', { class: 'bus-inputs' }, [
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('date_trip')),
                    window.mk('input', { type: 'date', id: 'selDataFerry', class: 'bus-select', value: new Date().toISOString().split('T')[0] })
                ]),
                window.mk('div', { style: { flex:1 } }, [
                    window.mk('label', { class: 'input-label-sm' }, window.t('time_trip')),
                    window.mk('input', { type: 'time', id: 'selOraFerry', class: 'bus-select', value: new Date().toTimeString().substring(0,5) })
                ])
            ])
        ]);

        const btnSearch = window.mk('button', { 
            class: 'btn-yellow', 
            style: { 
                background: 'linear-gradient(135deg, #0288D1 0%, #01579b 100%)', 
                color: 'white', width: '100%', fontWeight: 'bold', marginTop: '5px', 
                boxShadow: '0 10px 25px -5px rgba(2, 136, 209, 0.4)'
            },
            onclick: () => window.eseguiRicercaTraghetto()
        }, window.t('find_times'));

        // Contenitore Risultati
        const results = window.mk('div', { id: 'ferryResultsContainer', class: 'd-none mt-20' }, [
            window.mk('div', { 
                id: 'nextFerryCard', 
                class: 'bus-result-main', 
                style: { background: 'linear-gradient(135deg, #0277BD 0%, #01579b 100%)', boxShadow: '0 15px 30px -5px rgba(1, 87, 155, 0.3)' } 
            }),
            window.mk('div', { style: { fontSize:'0.8rem', fontWeight:'bold', color:'#666', marginTop:'15px' } }, `${window.t('next_runs')}:`),
            window.mk('div', { id: 'otherFerryList', class: 'bus-list-container' })
        ]);

        container.append(inputs, btnSearch, results);
        return container;
    }
}

class TrailModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const p = this.p;
        const titolo = window.dbCol(p, 'Paesi') || p.Nome;
        const linkGpx = p.Link_Gpx || p.gpxlink || p.Mappa;

        return window.mk('div', { class: 'trail-modal-pad' }, [
            window.mk('h2', { class: 'trail-modal-title' }, titolo),
            window.mk('div', { class: 'trail-stats-grid' }, [
                window.mk('div', { class: 'trail-stat-box' }, [window.mk('span', { class: 'material-icons' }, 'straighten'), window.mk('span', { class: 'stat-value' }, p.Distanza||'--')]),
                window.mk('div', { class: 'trail-stat-box' }, [window.mk('span', { class: 'material-icons' }, 'schedule'), window.mk('span', { class: 'stat-value' }, p.Durata||'--')]),
                window.mk('div', { class: 'trail-stat-box' }, [window.mk('span', { class: 'material-icons' }, 'terrain'), window.mk('span', { class: 'stat-value' }, p.Tag||'Media')])
            ]),
            window.mk('div', { class: 'trail-actions-group' }, 
                linkGpx ? window.mk('a', { href: linkGpx, download: '', class: 'btn-download-gpx', target: '_blank' }, [
                    window.mk('span', { class: 'material-icons' }, 'file_download'), ` ${window.t('btn_download_gpx')}`
                ]) : window.mk('div', { class: 'gpx-error-box' }, window.t('gpx_missing'))
            ),
            window.mk('div', { class: 'text-justify mt-10 line-height-relaxed color-dark' }, window.dbCol(p, 'Descrizione'))
        ]);
    }
}

class MapModalGenerator {
    constructor(url) { this.url = url; }
    getClass() { return 'modal-content'; }
    generate() {
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        setTimeout(() => window.initGpxMap(uniqueMapId, this.url), 100);
        return window.mk('div', {}, [
            window.mk('h3', { class: 'text-center mb-10' }, window.t('map_route_title')),
            window.mk('div', { id: uniqueMapId, class: 'map-modal-frame' }),
            window.mk('p', { class: 'map-modal-hint' }, window.t('map_zoom_hint'))
        ]);
    }
}

class RestaurantModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        return window.mk('div', { class: 'rest-modal-wrapper' }, [
            window.mk('div', { class: 'rest-header' }, [
                window.mk('h2', {}, window.dbCol(this.item, 'Nome')),
                window.mk('div', { class: 'rest-location' }, [window.mk('span', { class: 'material-icons' }, 'place'), ` ${window.dbCol(this.item, 'Paesi')}`]),
                window.mk('div', { class: 'rest-divider' })
            ]),
            window.mk('div', { class: 'rest-body' }, window.dbCol(this.item, 'Descrizioni') || window.t('desc_missing'))
        ]);
    }
}

class PharmacyModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        return window.mk('div', { class: 'modal-body-pad' }, [
            window.mk('h2', {}, window.dbCol(this.item, 'Nome')),
            window.mk('p', {}, `📍 ${this.item.Indirizzo}, ${window.dbCol(this.item, 'Paesi')}`),
            window.mk('p', {}, window.mk('a', { href: `tel:${this.item.Numero}` }, `📞 ${this.item.Numero}`))
        ]);
    }
}

class WineModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return window.mk('div', {});
        const t = String(this.item.Tipo).toLowerCase();
        let color = '#9B2335'; 
        if (t.includes('bianco')) color = '#F4D03F'; 
        if (t.includes('rosato')) color = '#E67E22'; 
        const foto = window.dbCol(this.item, 'Foto');

        return window.mk('div', { class: 'mb-20' }, [
            foto ? window.mk('img', { src: foto, class: 'wine-hero-img' }) : 
            window.mk('div', { class: 'wine-placeholder-box' }, window.mk('i', { class: 'fa-solid fa-wine-bottle wine-placeholder-icon', style: { color } })),
            
            window.mk('div', { class: foto ? 'wine-header-pad-img' : 'wine-header-pad' }, [
                window.mk('h2', { class: 'wine-title' }, window.dbCol(this.item, 'Nome')),
                window.mk('div', { class: 'wine-producer' }, [window.mk('span', { class: 'material-icons icon-sm' }, 'storefront'), ` ${window.dbCol(this.item, 'Produttore')}`])
            ]),
            
            window.mk('div', { class: 'wine-stats-grid' }, [
                window.mk('div', { class: 'wine-stat-card' }, [
                    window.mk('div', { class: 'wine-stat-label' }, window.t('wine_type')),
                    window.mk('div', { class: 'wine-stat-value', style: { color } }, this.item.Tipo)
                ]),
                window.mk('div', { class: 'wine-stat-card' }, [
                    window.mk('div', { class: 'wine-stat-label' }, window.t('wine_deg')),
                    window.mk('div', { class: 'wine-stat-value' }, this.item.Gradi)
                ])
            ]),
            
            window.mk('div', { class: 'modal-body-pad' }, [
                window.mk('p', { class: 'modal-desc-text mt-10' }, window.dbCol(this.item, 'Descrizione'))
            ])
        ]);
    }
}

class AttractionModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const img = window.dbCol(this.item, 'Immagine');
        return window.mk('div', {}, [
            img ? window.mk('img', { src: img, class: 'monument-header-img' }) : 
            window.mk('div', { class: 'monument-header-icon' }, window.mk('i', { class: 'fa-solid fa-landmark', style: { fontSize:'4rem', color:'#546e7a' } })),
            
            window.mk('div', { class: 'monument-body-pad' }, [
                window.mk('h2', { class: 'monument-title', style: { marginTop: img ? '0' : '20px' } }, window.dbCol(this.item, 'Attrazioni')),
                window.mk('div', { class: 'monument-divider' }),
                window.mk('p', { class: 'modal-desc-text text-justify' }, window.dbCol(this.item, 'Descrizione'))
            ])
        ]);
    }
}

class BeachModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        return window.mk('div', { class: 'modal-body-pad' }, [
            window.mk('h2', { style: { fontFamily:'Roboto Slab', color:'#00695C' } }, this.item.Nome),
            window.mk('span', { class: 'c-pill mb-15', style: { display:'inline-block' } }, this.item.Tipo),
            window.mk('p', { class: 'line-height-relaxed color-444' }, window.dbCol(this.item, 'Descrizione'))
        ]);
    }
}

window.ModalFactory = ModalContentFactory;