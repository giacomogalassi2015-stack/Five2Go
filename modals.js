/* modals.js - Factory e Generatori Modali */

import { t, dbCol, getSmartUrl, escapeHTML } from './utils.js';
import { loadAllStops, initFerrySearch } from './api.js';

// Global Data Store accessibile solo tramite il namespace app (che ora è solo datastore)
// Nota: Per mantenere il dataStore, lo useremo tramite una variabile interna al modulo se possibile, 
// ma main.js espone app.dataStore. Lo useremo in lettura.

export const openModal = async (type, payload) => {
    // Recupera i dati dal global store (definito in main.js/app.dataStore)
    // Usiamo window.app.dataStore perché main.js lo inizializza ancora per contenere i dati
    const currentTableData = window.app && window.app.dataStore ? window.app.dataStore.currentList : [];
    const tempTransportData = window.app && window.app.dataStore ? window.app.dataStore.transportList : [];

    const generator = ModalContentFactory.create(type, payload, currentTableData, tempTransportData);
    const contentHtml = generator.generateHtml(); 
    const modalClass = generator.getClass();

    // Creazione Overlay HTML
    const overlayHtml = `
    <div class="modal-overlay animate-fade" id="active-modal-overlay">
        <div class="${modalClass}">
            <span class="close-modal" id="close-modal-btn">×</span>
            ${contentHtml}
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', overlayHtml);

    // Binding Eventi chiusura
    const overlay = document.getElementById('active-modal-overlay');
    const closeBtn = document.getElementById('close-modal-btn');
    
    const closeModal = () => overlay.remove();
    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

    // Esecuzione script post-render (es. init mappe o bus search)
    if (generator.postRender) {
        setTimeout(() => generator.postRender(), 50);
    }
};

const initGpxMap = (divId, gpxUrl) => {
    const element = document.getElementById(divId);
    if (element && window.L && window.L.GPX) {
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

class ModalContentFactory {
    static create(type, payload, currentTableData, tempTransportData) {
        let item = null;

        if (type === 'map') return new MapModalGenerator(payload);
        if (type === 'transport') return new TransportModalGenerator(payload, tempTransportData);

        if (currentTableData) {
            const searchId = String(payload);
            item = currentTableData.find(i => String(i.id || i.ID || i.POI_ID) === searchId);
        }

        if (!item) {
            return { 
                generateHtml: () => `<div class="modal-body-pad"><p>Dati non disponibili o ID non trovato (${payload}).</p></div>`, 
                getClass: () => 'modal-content' 
            };
        }

        switch (type) {
            case 'product': case 'Prodotti': return new ProductModalGenerator(item);
            case 'trail': case 'Sentieri': return new TrailModalGenerator(item);
            case 'ristorante': case 'restaurant': case 'Ristoranti': return new RestaurantModalGenerator(item);
            case 'farmacia': case 'Farmacie': return new PharmacyModalGenerator(item);
            case 'Vini': case 'wine': return new WineModalGenerator(item);
            case 'Attrazioni': case 'attrazione': return new AttractionModalGenerator(item);
            case 'Spiagge': return new BeachModalGenerator(item);
            default: return { generateHtml: () => '<p>Content not found</p>', getClass: () => 'modal-content' };
        }
    }
}

class ProductModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content glass-modal'; }
    generateHtml() {
        const nome = escapeHTML(dbCol(this.p, 'Prodotti') || dbCol(this.p, 'Nome'));
        const desc = escapeHTML(dbCol(this.p, 'Descrizione'));   
        const ideale = escapeHTML(dbCol(this.p, 'Ideale per')); 
        const bigImg = getSmartUrl(this.p.Prodotti_foto || nome, '', 800);

        const tagHtml = ideale ? `<div class="mb-20"><span class="glass-tag">✨ ${t('ideal_for')}: ${ideale}</span></div>` : '';

        return `
        <div>
            <div class="modal-hero-wrapper">
                <img src="${bigImg}" class="modal-hero-img" onerror="this.style.display='none'">
            </div>
            <div class="modal-body-pad">
                <h2 class="modal-title-lg">${nome}</h2>
                ${tagHtml}
                <p class="modal-desc-text">${desc}</p>
            </div>
        </div>`;
    }
}

class TransportModalGenerator {
    constructor(index, data) { 
        this.item = data ? data[index] : null; 
    }
    getClass() { return 'modal-content'; }
    
    generateHtml() {
        if (!this.item) return `<div class="modal-body-pad"><p>Errore caricamento dati trasporto.</p></div>`;
        
        const searchStr = ((dbCol(this.item, 'Nome') || '') + ' ' + (dbCol(this.item, 'Località') || '') + ' ' + (dbCol(this.item, 'Mezzo') || '')).toLowerCase();

        if (searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc')) {
            return this._createBusHTML(this.item);
        }
        if (searchStr.includes('battello') || searchStr.includes('traghetto')) {
            return this._createFerryHTML();
        }
        
        const nome = escapeHTML(dbCol(this.item, 'Nome') || 'Trasporto');
        return `
        <div class="modal-body-pad mt-10">
            <h2>${nome}</h2>
            <p class="color-gray">${escapeHTML(dbCol(this.item, 'Descrizione'))}</p>
        </div>`;
    }

    postRender() {
        const searchStr = ((dbCol(this.item, 'Nome') || '') + ' ' + (dbCol(this.item, 'Località') || '') + ' ' + (dbCol(this.item, 'Mezzo') || '')).toLowerCase();
        
        if (searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc')) {
            loadAllStops(document.getElementById('selPartenza'));
            // Il resto (toggle e search) è gestito dal delegator globale tramite data-action
        } 
        else if (searchStr.includes('battello') || searchStr.includes('traghetto')) {
            initFerrySearch();
            // Il resto è gestito dal delegator
        }
    }

    _createBusHTML(item) {
        const infoSms = escapeHTML(dbCol(item, 'Info_SMS'));
        const infoApp = escapeHTML(dbCol(item, 'Info_App'));
        const infoAvvisi = escapeHTML(dbCol(item, 'Info_Avvisi'));

        let ticketInfo = '';
        if (infoSms || infoApp || infoAvvisi) {
            ticketInfo = `
            <button class="ticket-toggle-btn" data-action="toggle-element" data-target="ticket-info-box">🎟️ ${t('how_to_ticket')} ▾</button>
            <div id="ticket-info-box" class="ticket-info-content" style="display: none;">
                ${infoSms ? `<p class="mb-10"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                ${infoApp ? `<p class="mb-10"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                ${infoAvvisi ? `<div class="warning-box"><strong>⚠️ ${t('label_warning')}: </strong>${infoAvvisi}</div>` : ''}
            </div>`;
        }

        return `
        <div class="bus-search-box animate-fade">
            <div class="bus-title" style="padding-bottom:15px;">
                <span class="material-icons">directions_bus</span> ${t('plan_trip')}
            </div>
            
            ${ticketInfo}

            <button class="map-toggle-btn" data-action="toggle-element" data-target="bus-map-wrapper">🗺️ ${t('show_map')} ▾</button>
            <div id="bus-map-wrapper" class="map-hidden-container" style="display: none;">
                <div id="bus-map" class="bus-map-frame"></div>
                <p class="map-modal-hint">${t('map_hint')}</p>
            </div>

            <div>
                <div class="bus-inputs">
                    <div style="flex:1">
                        <label class="input-label-sm">${t('departure')}</label>
                        <select id="selPartenza" class="bus-select" data-action="bus-filter-destinations">
                            <option disabled selected>${t('loading')}</option>
                        </select>
                    </div>
                    <div style="flex:1">
                        <label class="input-label-sm">${t('arrival')}</label>
                        <select id="selArrivo" class="bus-select" disabled>
                            <option disabled selected>${t('select_start')}</option>
                        </select>
                    </div>
                </div>
                <div class="bus-inputs">
                    <div style="flex:1">
                        <label class="input-label-sm">${t('date_trip')}</label>
                        <input type="date" id="selData" class="bus-select" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="flex:1">
                        <label class="input-label-sm">${t('time_trip')}</label>
                        <input type="time" id="selOra" class="bus-select" value="${new Date().toTimeString().substring(0,5)}">
                    </div>
                </div>
            </div>

            <button id="btnSearchBus" class="btn-yellow" style="width: 100%; margin-top: 5px; opacity: 0.5; pointer-events: none;" data-action="bus-search">
                ${t('find_times')}
            </button>

            <div id="busResultsContainer" class="d-none mt-20">
                <div id="nextBusCard" class="bus-result-main"></div>
                <div style="font-size:0.8rem; fontWeight:bold; color:#666; margin-top:15px;">${t('next_runs')}:</div>
                <div id="otherBusList" class="bus-list-container"></div>
            </div>
        </div>`;
    }

    _createFerryHTML() {
        return `
        <div class="bus-search-box animate-fade">
            <div class="bus-title" style="padding-bottom:15px;">
                <span class="material-icons" style="background: linear-gradient(135deg, #0288D1, #0277BD); box-shadow: 0 4px 6px rgba(2, 119, 189, 0.3);">directions_boat</span> 
                ${t('plan_trip')} (Battello)
            </div>

            <button class="ticket-toggle-btn" style="background:#e1f5fe; color:#01579b; border-color:#b3e5fc;" data-action="toggle-element" data-target="ticket-info-box-ferry">
                🎟️ ${t('how_to_ticket')} ▾
            </button>
            <div id="ticket-info-box-ferry" class="ticket-info-content" style="display: none;">
                <p>I biglietti sono acquistabili presso le biglietterie al molo.</p>
                <div class="warning-box"><strong>⚠️ INFO METEO:</strong> In caso di mare mosso il servizio è sospeso.</div>
            </div>

            <div>
                <div class="bus-inputs">
                    <div style="flex:1">
                        <label class="input-label-sm">${t('departure')}</label>
                        <select id="selPartenzaFerry" class="bus-select" data-action="ferry-filter-destinations">
                            <option disabled selected>${t('loading')}</option>
                        </select>
                    </div>
                    <div style="flex:1">
                        <label class="input-label-sm">${t('arrival')}</label>
                        <select id="selArrivoFerry" class="bus-select">
                            <option disabled selected>${t('select_start')}</option>
                        </select>
                    </div>
                </div>
                <div class="bus-inputs">
                    <div style="flex:1">
                        <label class="input-label-sm">${t('date_trip')}</label>
                        <input type="date" id="selDataFerry" class="bus-select" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="flex:1">
                        <label class="input-label-sm">${t('time_trip')}</label>
                        <input type="time" id="selOraFerry" class="bus-select" value="${new Date().toTimeString().substring(0,5)}">
                    </div>
                </div>
            </div>

            <button id="btnSearchFerry" class="btn-yellow" style="background: linear-gradient(135deg, #0288D1 0%, #01579b 100%); color: white; width: 100%; font-weight: bold; margin-top: 5px; box-shadow: 0 10px 25px -5px rgba(2, 136, 209, 0.4);" data-action="ferry-search">
                ${t('find_times')}
            </button>

            <div id="ferryResultsContainer" class="d-none mt-20">
                <div id="nextFerryCard" class="bus-result-main" style="background: linear-gradient(135deg, #0277BD 0%, #01579b 100%); box-shadow: 0 15px 30px -5px rgba(1, 87, 155, 0.3);"></div>
                <div style="font-size:0.8rem; fontWeight:bold; color:#666; margin-top:15px;">${t('next_runs')}:</div>
                <div id="otherFerryList" class="bus-list-container"></div>
            </div>
        </div>`;
    }
}

class TrailModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        const p = this.p;
        const titolo = escapeHTML(dbCol(p, 'Paesi') || p.Nome);
        const linkGpx = p.Link_Gpx || p.gpxlink || p.Mappa;

        const gpxBtn = linkGpx 
            ? `<a href="${linkGpx}" download class="btn-download-gpx" target="_blank">
                 <span class="material-icons">file_download</span> ${t('btn_download_gpx')}
               </a>`
            : `<div class="gpx-error-box">${t('gpx_missing')}</div>`;

        return `
        <div class="trail-modal-pad">
            <h2 class="trail-modal-title">${titolo}</h2>
            <div class="trail-stats-grid">
                <div class="trail-stat-box"><span class="material-icons">straighten</span><span class="stat-value">${p.Distanza||'--'}</span></div>
                <div class="trail-stat-box"><span class="material-icons">schedule</span><span class="stat-value">${p.Durata||'--'}</span></div>
                <div class="trail-stat-box"><span class="material-icons">terrain</span><span class="stat-value">${p.Tag||'Media'}</span></div>
            </div>
            <div class="trail-actions-group">${gpxBtn}</div>
            <div class="text-justify mt-10 line-height-relaxed color-dark">${escapeHTML(dbCol(p, 'Descrizione'))}</div>
        </div>`;
    }
}

class MapModalGenerator {
    constructor(url) { this.url = url; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        return `
        <div>
            <h3 class="text-center mb-10">${t('map_route_title')}</h3>
            <div id="${uniqueMapId}" class="map-modal-frame"></div>
            <p class="map-modal-hint">${t('map_zoom_hint')}</p>
        </div>`;
    }
    postRender() {
        const frame = document.querySelector('.map-modal-frame');
        if(frame) initGpxMap(frame.id, this.url);
    }
}

class RestaurantModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        const nome = escapeHTML(dbCol(this.item, 'Nome'));
        const paese = escapeHTML(dbCol(this.item, 'Paesi'));
        const desc = escapeHTML(dbCol(this.item, 'Descrizioni') || t('desc_missing'));
        
        return `
        <div class="rest-modal-wrapper">
            <div class="rest-header">
                <h2>${nome}</h2>
                <div class="rest-location"><span class="material-icons">place</span> ${paese}</div>
                <div class="rest-divider"></div>
            </div>
            <div class="rest-body">${desc}</div>
        </div>`;
    }
}

class PharmacyModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        const nome = escapeHTML(dbCol(this.item, 'Nome'));
        const indirizzo = escapeHTML(this.item.Indirizzo);
        const paese = escapeHTML(dbCol(this.item, 'Paesi'));
        const numero = this.item.Numero;

        return `
        <div class="modal-body-pad">
            <h2>${nome}</h2>
            <p>📍 ${indirizzo}, ${paese}</p>
            <p><a href="tel:${numero}">📞 ${numero}</a></p>
        </div>`;
    }
}

class WineModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        if (!this.item) return '<div></div>';
        const tVal = String(this.item.Tipo).toLowerCase();
        let color = '#9B2335'; 
        if (tVal.includes('bianco')) color = '#F4D03F'; 
        if (tVal.includes('rosato')) color = '#E67E22'; 
        const foto = dbCol(this.item, 'Foto');
        const nome = escapeHTML(dbCol(this.item, 'Nome'));
        const produttore = escapeHTML(dbCol(this.item, 'Produttore'));
        const desc = escapeHTML(dbCol(this.item, 'Descrizione'));

        const hero = foto 
            ? `<img src="${foto}" class="wine-hero-img">`
            : `<div class="wine-placeholder-box"><i class="fa-solid fa-wine-bottle wine-placeholder-icon" style="color:${color}"></i></div>`;

        return `
        <div class="mb-20">
            ${hero}
            <div class="${foto ? 'wine-header-pad-img' : 'wine-header-pad'}">
                <h2 class="wine-title">${nome}</h2>
                <div class="wine-producer"><span class="material-icons icon-sm">storefront</span> ${produttore}</div>
            </div>
            
            <div class="wine-stats-grid">
                <div class="wine-stat-card">
                    <div class="wine-stat-label">${t('wine_type')}</div>
                    <div class="wine-stat-value" style="color:${color}">${this.item.Tipo}</div>
                </div>
                <div class="wine-stat-card">
                    <div class="wine-stat-label">${t('wine_deg')}</div>
                    <div class="wine-stat-value">${this.item.Gradi}</div>
                </div>
            </div>
            
            <div class="modal-body-pad">
                <p class="modal-desc-text mt-10">${desc}</p>
            </div>
        </div>`;
    }
}

class AttractionModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        const img = dbCol(this.item, 'Immagine');
        const titolo = escapeHTML(dbCol(this.item, 'Attrazioni'));
        const desc = escapeHTML(dbCol(this.item, 'Descrizione'));

        const header = img 
            ? `<img src="${img}" class="monument-header-img">`
            : `<div class="monument-header-icon"><i class="fa-solid fa-landmark" style="font-size:4rem; color:#546e7a;"></i></div>`;

        return `
        <div>
            ${header}
            <div class="monument-body-pad">
                <h2 class="monument-title" style="margin-top: ${img ? '0' : '20px'}">${titolo}</h2>
                <div class="monument-divider"></div>
                <p class="modal-desc-text text-justify">${desc}</p>
            </div>
        </div>`;
    }
}

class BeachModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generateHtml() {
        return `
        <div class="modal-body-pad">
            <h2 style="font-family:'Roboto Slab'; color:#00695C;">${escapeHTML(this.item.Nome)}</h2>
            <span class="c-pill mb-15" style="display:inline-block;">${escapeHTML(this.item.Tipo)}</span>
            <p class="line-height-relaxed color-444">${escapeHTML(dbCol(this.item, 'Descrizione'))}</p>
        </div>`;
    }
}