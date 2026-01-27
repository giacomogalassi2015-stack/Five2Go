console.log("✅ strategies.js caricato (Refactor ID Pattern)");

/* ============================================================
   PATTERN 1: STRATEGY (Gestione Caricamento Viste/Tabelle)
   ============================================================ */

class BaseViewStrategy {
    async load(container) {
        throw new Error("Method 'load' must be implemented.");
    }

    async fetchData(tableName) {
        if (window.appCache[tableName]) {
            console.log(`⚡ Cache hit: ${tableName}`);
            return window.appCache[tableName];
        }
        console.log(`🌐 Cache miss: ${tableName}`);
        const { data, error } = await window.supabaseClient.from(tableName).select('*');
        if (error) throw error;
        window.appCache[tableName] = data;
        return data;
    }
}

class WineStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Vini');
        window.currentTableData = data; // Fondamentale per il lookup ID
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
        window.currentTableData = data; // AGGIUNTO: Salva i dati per la modale
        let html = '<div class="list-container animate-fade" style="padding-bottom:20px;">';
        data.forEach(p => { html += window.prodottoRenderer(p); });
        container.innerHTML = html + '</div>';
    }
}

class TransportStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Trasporti');
        window.tempTransportData = data; // I trasporti usano un array separato
        let html = '<div class="list-container animate-fade">';
        data.forEach((t, index) => {
            // Qui passiamo l'indice o l'ID se presente, manteniamo index per compatibilità Trasporti
            const nomeDisplay = window.dbCol(t, 'Località') || window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', '${index}')"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy"></div>`;
        });
        container.innerHTML = html + '</div>';
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
        window.currentTableData = data; // AGGIUNTO
        window.renderGenericFilterableView(data, 'Paesi', container, window.farmacieRenderer);
    }
}

class UsefulNumbersStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Numeri_utili');
        // I numeri utili raramente hanno modali complesse, ma se servisse:
        window.currentTableData = data; 
        window.renderGenericFilterableView(data, 'Comune', container, window.numeriUtiliRenderer);
    }
}

class MapStrategy extends BaseViewStrategy {
    async load(container) {
        container.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe></div>`;
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
   PATTERN 2: FACTORY (Generazione Contenuto Modali)
   ============================================================ */

class ModalContentFactory {
    static create(type, payload) {
        let item = null;

        // 1. GESTIONE SPECIALE: MAPPE (URL diretto)
        if (type === 'map') {
            return new MapModalGenerator(payload);
        }

        // 2. GESTIONE SPECIALE: TRASPORTI (Usa tempTransportData e Indice)
        if (type === 'transport') {
            // Payload qui è l'indice dell'array
            return new TransportModalGenerator(payload);
        }

        // 3. LOOKUP GENERICO PER ID
        // Cerca l'oggetto corrispondente all'ID passato nel payload
        if (window.currentTableData) {
            // Normalizziamo a stringa per evitare problemi '1' vs 1
            const searchId = String(payload);
            item = window.currentTableData.find(i => 
                String(i.id) === searchId || 
                String(i.ID) === searchId || 
                String(i.POI_ID) === searchId
            );
        }

        // Se non troviamo l'oggetto, mostriamo errore (eccetto mappe che passano URL)
        if (!item) {
            console.warn(`Oggetto non trovato per ID: ${payload} in contesto ${type}`);
            return { generate: () => `<div class="modal-body-pad"><p>Dati non disponibili o ID non trovato (${payload}).</p></div>`, getClass: () => 'modal-content' };
        }

        // 4. ROUTING GENERATORI
        switch (type) {
            case 'product': 
            case 'Prodotti':
                return new ProductModalGenerator(item);
            
            case 'trail': 
            case 'Sentieri':
                return new TrailModalGenerator(item);
            
            case 'ristorante':
            case 'restaurant': 
            case 'Ristoranti':
                return new RestaurantModalGenerator(item);
            
            case 'farmacia': 
            case 'Farmacie':
                return new PharmacyModalGenerator(item);
            
            case 'Vini':
            case 'wine': 
                return new WineModalGenerator(item);
            
            case 'Attrazioni':
            case 'attrazione': 
                return new AttractionModalGenerator(item);
            
            case 'Spiagge': 
                return new BeachModalGenerator(item);
            
            default: 
                return { generate: () => `<p>Content not found for type: ${type}</p>`, getClass: () => 'modal-content' };
        }
    }
}

// --- GENERATORI CONCRETI ---
// NOTA: Ora ricevono l'Oggetto Item reale, non una stringa JSON da parsare.

class ProductModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content glass-modal'; }
    generate() {
        const nome = window.dbCol(this.p, 'Prodotti') || window.dbCol(this.p, 'Nome') || 'Prodotto';
        const desc = window.dbCol(this.p, 'Descrizione');   
        const ideale = window.dbCol(this.p, 'Ideale per'); 
        const fotoKey = this.p.Prodotti_foto || nome;
        const bigImg = window.getSmartUrl(fotoKey, '', 800);

        return `
            <div class="modal-hero-wrapper">
                <img src="${bigImg}" class="modal-hero-img" onerror="this.style.display='none'">
            </div>
            <div class="modal-body-pad">
                <h2 class="modal-title-lg">${nome}</h2>
                ${ideale ? `<div class="mb-20"><span class="glass-tag">✨ ${window.t('ideal_for')}: ${ideale}</span></div>` : ''}
                <p class="modal-desc-text">${desc || ''}</p>
            </div>`;
    }
}

class TransportModalGenerator {
    constructor(index) { this.item = window.tempTransportData[index]; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '<p>Errore dati trasporto</p>';
        const nome = window.dbCol(this.item, 'Nome') || window.dbCol(this.item, 'Località') || window.dbCol(this.item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(this.item, 'Descrizione') || '';
        
        const searchStr = ((window.dbCol(this.item, 'Nome') || '') + ' ' + (window.dbCol(this.item, 'Località') || '') + ' ' + (window.dbCol(this.item, 'Mezzo') || '')).toLowerCase();

        if (searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc')) return this._generateBusHtml();
        if (searchStr.includes('battello') || searchStr.includes('traghetto')) return this._generateFerryHtml();
        if (searchStr.includes('tren') || searchStr.includes('ferrovi')) return this._generateTrainHtml();
        
        return `<div class="modal-body-pad mt-10"><h2>${nome}</h2><p class="color-gray">${desc}</p></div>`;
    }

    _generateBusHtml() {
        setTimeout(() => { if(window.loadAllStops) window.loadAllStops(); }, 100);
        return window.renderBusTemplate(this.item);
    }

    _generateFerryHtml() {
        setTimeout(() => window.initFerrySearch(), 50);
        return window.renderFerryTemplate();
    }

    _generateTrainHtml() {
        const now = new Date();
        const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        return window.trainSearchRenderer ? window.trainSearchRenderer(null, nowTime) : "<p>Errore UI Treni</p>";
    }
}

class TrailModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const p = this.p;
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

        return `
        <div class="trail-modal-pad">
            <h2 class="trail-modal-title">${titolo}</h2>
            ${nomeSentiero ? `<p class="trail-modal-subtitle">${nomeSentiero}</p>` : ''}
            
            <div class="trail-stats-grid">
                <div class="trail-stat-box"><span class="material-icons">straighten</span><span class="stat-value">${dist}</span><span class="stat-label">${window.t('distance')}</span></div>
                <div class="trail-stat-box"><span class="material-icons">schedule</span><span class="stat-value">${dura}</span><span class="stat-label">${window.t('duration')}</span></div>
                <div class="trail-stat-box"><span class="material-icons">terrain</span><span class="stat-value">${diff}</span><span class="stat-label">${window.t('level')}</span></div>
            </div>

            <div class="trail-actions-group">
                ${linkGpx ? `
                <a href="${linkGpx}" download="${nomeSentiero || 'percorso'}.gpx" class="btn-download-gpx" target="_blank">
                    <span class="material-icons">file_download</span> ${window.t('btn_download_gpx')}
                </a>` : `
                <div class="gpx-error-box">
                    <span class="material-icons icon-sm">error_outline</span> ${window.t('gpx_missing')}
                </div>`}
            </div>
            <div class="text-justify mt-10 line-height-relaxed color-dark">${desc}</div>
        </div>`;
    }
}

class MapModalGenerator {
    constructor(url) { this.url = url; }
    getClass() { return 'modal-content'; }
    generate() {
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        setTimeout(() => window.initGpxMap(uniqueMapId, this.url), 100);
        return `
            <h3 class="text-center mb-10">${window.t('map_route_title')}</h3>
            <div id="${uniqueMapId}" class="map-modal-frame"></div>
            <p class="map-modal-hint">${window.t('map_zoom_hint')}</p>`;
    }
}

class RestaurantModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const nome = window.dbCol(this.item, 'Nome');
        const indirizzo = window.dbCol(this.item, 'Paesi') || ''; 
        const desc = window.dbCol(this.item, 'Descrizioni') || window.t('desc_missing'); 

        return `
            <div class="rest-modal-wrapper">
                <div class="rest-header">
                    <h2>${nome}</h2>
                    <div class="rest-location"><span class="material-icons">place</span> ${indirizzo}</div>
                    <div class="rest-divider"></div>
                </div>
                <div class="rest-body">${desc}</div>
            </div>`;
    }
}

class PharmacyModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const nome = window.dbCol(this.item, 'Nome');
        const paesi = window.dbCol(this.item, 'Paesi');
        return `<h2>${nome}</h2><p>📍 ${this.item.Indirizzo}, ${paesi}</p><p>📞 <a href="tel:${this.item.Numero}">${this.item.Numero}</a></p>`;
    }
}

class WineModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '';
        const item = this.item;
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

        return `
            <div class="mb-20">
                ${foto ? `<img src="${foto}" class="wine-hero-img">` : 
                `<div class="wine-placeholder-box">
                    <i class="fa-solid fa-wine-bottle wine-placeholder-icon" style="color: ${color};"></i>
                </div>`}

                <div class="${foto ? 'wine-header-pad-img' : 'wine-header-pad'}">
                    <h2 class="wine-title">${nome}</h2>
                    <div class="wine-producer">
                        <span class="material-icons icon-sm">storefront</span> ${produttore}
                    </div>
                </div>

                <div class="wine-stats-grid">
                    <div class="wine-stat-card">
                        <div class="wine-stat-label">${window.t('wine_type')}</div>
                        <div class="wine-stat-value" style="color:${color}">${tipo || '--'}</div>
                    </div>
                    <div class="wine-stat-card">
                        <div class="wine-stat-label">${window.t('wine_deg')}</div>
                        <div class="wine-stat-value">${gradi || '--'}</div>
                    </div>
                    ${uve ? `<div class="wine-grapes-box"><strong>🍇 ${window.t('wine_grapes')}:</strong> ${uve}</div>` : ''}
                </div>

                <div class="modal-body-pad">
                    <p class="modal-desc-text mt-10">${desc}</p>
                    ${abbinamenti ? `
                    <div class="wine-pairing-box">
                        <div class="font-bold mb-10 icon-xs text-uppercase">🍽️ ${window.t('wine_pairings')}</div>
                        ${abbinamenti}
                    </div>` : ''}
                </div>
            </div>`;
    }
}

class AttractionModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '';
        const item = this.item;
        const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
        const curiosita = window.dbCol(item, 'Curiosita');
        const desc = window.dbCol(item, 'Descrizione');
        const img = window.dbCol(item, 'Immagine') || window.dbCol(item, 'Foto'); 

        return `
            ${img ? `<img src="${img}" class="monument-header-img">` : 
            `<div class="monument-header-icon"><i class="fa-solid fa-landmark" style="font-size:4rem; color:#546e7a;"></i></div>`}

            <div class="monument-body-pad">
                <h2 class="monument-title" style="margin-top: ${img ? '0' : '20px'}">${titolo}</h2>
                <div class="monument-divider"></div>

                ${curiosita ? `
                <div class="curiosity-box animate-fade">
                    <div class="curiosity-title"><span class="material-icons icon-sm">lightbulb</span> ${window.t('label_curiosity')}</div>
                    <div style="font-style:italic; line-height:1.5;">${curiosita}</div>
                </div>` : ''}
                
                <p class="modal-desc-text text-justify">${desc || window.t('desc_missing')}</p>
            </div>`;
    }
}

class BeachModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '';
        const nome = this.item.Nome || 'Spiaggia';
        const desc = window.dbCol(this.item, 'Descrizione') || '';
        const tipo = this.item.Tipo || '';
        
        return `
             <div class="modal-body-pad">
                <h2 style="font-family:'Roboto Slab'; color:#00695C;">${nome}</h2>
                <span class="c-pill mb-15" style="display:inline-block;">${tipo}</span>
                <p class="line-height-relaxed color-444">${desc}</p>
             </div>
        `;
    }
}

window.ModalFactory = ModalContentFactory;