/* views.js - Strategy Pattern per le Viste */

import { supabaseClient } from './api.js';
import { t, dbCol, getSmartUrl, escapeHTML } from './utils.js';
import * as Renderers from './components.js';

// Cache interna dei dati
const appCache = {};

class BaseViewStrategy {
    async load(container) {
        throw new Error("Method 'load' must be implemented.");
    }
    async fetchData(tableName) {
        if (appCache[tableName]) return appCache[tableName];
        const { data, error } = await supabaseClient.from(tableName).select('*');
        if (error) throw error;
        appCache[tableName] = data;
        return data;
    }
}

class WineStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Vini');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data; 
        Renderers.renderGenericFilterableView(data, 'Tipo', container, Renderers.vinoRenderer);
    }
}

class BeachStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Spiagge');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data;
        Renderers.renderGenericFilterableView(data, 'Paesi', container, Renderers.spiaggiaRenderer);
    }
}

class ProductStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Prodotti');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data;
        
        const cardsHtml = data.map(p => Renderers.prodottoRenderer(p)).join('');
        container.innerHTML = `<div class="list-container animate-fade" style="padding-bottom:20px;">${cardsHtml}</div>`;
    }
}

class TransportStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Trasporti');
        if(window.app && window.app.dataStore) window.app.dataStore.transportList = data; // Salva in store dedicato per i trasporti
        
        const cardsHtml = data.map((tVal, index) => {
            const nomeDisplay = escapeHTML(dbCol(tVal, 'Località') || dbCol(tVal, 'Mezzo'));
            const imgUrl = getSmartUrl(tVal.Mezzo, '', 400);
            
            // Refactored to data-action
            return `
            <div class="card-product" data-action="open-modal" data-modal-type="transport" data-id="${index}">
                <div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div>
                <img src="${imgUrl}" class="prod-thumb" loading="lazy">
            </div>`;
        }).join('');
        
        container.innerHTML = `<div class="list-container animate-fade">${cardsHtml}</div>`;
    }
}

class AttractionStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Attrazioni');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data;
        const culturaConfig = {
            primary: { key: 'Paese', title: '📍 ' + (t('nav_villages') || 'Borgo'), customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] },
            secondary: { key: 'Label', title: '🏷️ Categoria' }
        };
        Renderers.renderDoubleFilterView(data, culturaConfig, container, Renderers.attrazioniRenderer);
    }
}

class RestaurantStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Ristoranti');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data;
        Renderers.renderGenericFilterableView(data, 'Paesi', container, Renderers.ristoranteRenderer);
    }
}

class TrailStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Sentieri');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data;
        Renderers.renderGenericFilterableView(data, 'Difficolta', container, Renderers.sentieroRenderer);
    }
}

class PharmacyStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Farmacie');
        if(window.app && window.app.dataStore) window.app.dataStore.currentList = data;
        Renderers.renderGenericFilterableView(data, 'Paesi', container, Renderers.farmacieRenderer);
    }
}

class UsefulNumbersStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Numeri_utili');
        Renderers.renderGenericFilterableView(data, 'Comune', container, Renderers.numeriUtiliRenderer);
    }
}

class MapStrategy extends BaseViewStrategy {
    async load(container) {
        container.innerHTML = `
        <div class="map-container animate-fade">
            <iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480" style="border:none"></iframe>
        </div>`;
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

export const viewStrategyContext = new ViewContext();