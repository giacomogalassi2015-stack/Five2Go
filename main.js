/* main.js - Entry Point, Router e Global App Object */

import { AVAILABLE_LANGS } from './config.js';
import { t, getLang, setLang } from './utils.js';
import { supabaseClient, filterDestinations, eseguiRicercaBus, updateFerryDestinations, eseguiRicercaTraghetto } from './api.js';
import { viewStrategyContext } from './views.js';
import { openModal } from './modals.js';
import { renderGenericFilterableView, numeriUtiliRenderer, farmacieRenderer } from './components.js';

console.log("✅ main.js caricato (Delegation Mode)");

// --- SETUP GLOBAL APP STATE (Solo Dati, niente funzioni esposte) ---
window.app = {
    dataStore: {
        currentList: [],
        transportList: []
    }
};

// --- STATE GLOBALE APP ---
let currentViewName = 'home';
const content = document.getElementById('app-content');

// --- EVENT DELEGATOR (Gestore Unico degli Eventi Click) ---
document.body.addEventListener('click', (e) => {
    // 1. Gestione click diretti sugli elementi con data-action
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    // Gestione Azioni
    switch (action) {
        case 'open-modal': {
            e.preventDefault(); // Previene il default se è un link o form
            const type = target.dataset.modalType || target.dataset.type; // Fallback
            // Supporta sia 'id' che 'payload' (per gpx)
            const payload = target.dataset.id || target.dataset.payload;
            if (type && payload) {
                openModal(type, payload);
            }
            break;
        }
        case 'change-language': {
            const code = target.dataset.lang;
            if (code) changeLanguage(code);
            break;
        }
        case 'toggle-ticket':
        case 'toggle-element': {
            const targetId = target.dataset.target;
            const el = document.getElementById(targetId);
            if(el) el.style.display = (el.style.display === 'none') ? 'block' : 'none';
            break;
        }
        case 'bus-search': {
            eseguiRicercaBus();
            break;
        }
        case 'ferry-search': {
            eseguiRicercaTraghetto();
            break;
        }
        case 'stop-prop-call': {
            // Non fare nulla, ma evita che l'evento risalga al padre (la card)
            e.stopPropagation(); 
            break;
        }
        // Aggiungere qui altri case se necessario
    }
});

// --- EVENT DELEGATOR (Gestore Unico degli Eventi Change) ---
document.body.addEventListener('change', (e) => {
    // Intercetta i change delle select (perché create dinamicamente)
    if (e.target.dataset.action === 'bus-filter-destinations') {
        filterDestinations(e.target.value);
    }
    if (e.target.dataset.action === 'ferry-filter-destinations') {
        updateFerryDestinations(e.target.value);
    }
});

// --- SETUP HEADER ---
const createGlobalFooter = () => `<footer class="app-footer"><p>© 2026 Five2Go. ${t('footer_rights')}</p></footer>`;

// Esposizione Eventi Mappa
window.addEventListener('init-map', (e) => {
    if(window.L && window.L.GPX) {
        const { id, url } = e.detail;
        const map = L.map(id);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
        new L.GPX(url, { async: true, polyline_options: { color: '#E76F51' } }).on('loaded', (ev) => map.fitBounds(ev.target.getBounds())).addTo(map);
    }
});

function setupHeaderElements() {
    const header = document.querySelector('header');
    
    // Pulizia Header
    const oldActions = header.querySelector('.header-actions-container');
    if (oldActions) oldActions.remove();
    
    if (currentViewName !== 'home') return; 

    const currLang = getLang();
    const langObj = AVAILABLE_LANGS.find(l => l.code === currLang);
    const currFlag = langObj ? langObj.flag : '🇮🇹';
    const currCode = currLang.toUpperCase();
    
    // Generazione HTML Dropdown con data-action
    const dropdownOpts = AVAILABLE_LANGS.map(l => `
        <button class="lang-opt ${l.code === currLang ? 'active' : ''}" data-action="change-language" data-lang="${l.code}">
            <span class="lang-flag">${l.flag}</span> ${l.label}
        </button>
    `).join('');

    const actionsHtml = `
    <div id="header-btn-lang" class="header-actions animate-fade header-actions-container">
        <div class="lang-selector">
            <button class="current-lang-btn" id="lang-btn-toggle">
                <span class="lang-flag">${currFlag}</span> ${currCode} ▾
            </button>
            <div class="lang-dropdown lang-dropdown-wrapper" id="lang-dropdown">
                ${dropdownOpts}
            </div>
        </div>
    </div>`;

    header.insertAdjacentHTML('beforeend', actionsHtml);

    // Binding Eventi Header (Qui usiamo ID perché è statico dopo render)
    const toggleBtn = document.getElementById('lang-btn-toggle');
    if(toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            const dd = document.getElementById('lang-dropdown');
            if(dd) dd.classList.toggle('show');
        };
    }
}

function updateNavBar() {
    const labels = document.querySelectorAll('.nav-label');
    if (labels.length >= 4) {
        labels[0].innerText = t('nav_villages'); 
        labels[1].innerText = t('nav_food');
        labels[2].innerText = t('nav_outdoor');
        labels[3].innerText = t('nav_services'); 
    }
}

// Funzioni Cambio Lingua
function changeLanguage(langCode) {
    setLang(langCode);
    
    const old = document.querySelector('.header-actions-container');
    if(old) old.remove();
    
    setupHeaderElements(); 
    updateNavBar(); 
    
    const activeNav = document.querySelector('.nav-item.active');
    if(activeNav) {
        const view = activeNav.getAttribute('data-view');
        if(view) switchView(view, activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
}

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});

// --- NAVIGAZIONE PRINCIPALE ---
async function switchView(view, el) {
    if (!content) return;
    currentViewName = view; 

    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) { globalFilterBtn.remove(); }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    if (el) {
        el.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-item[data-view="${view}"]`);
        if(btn) btn.classList.add('active');
    }

    try {
        if (view === 'home') renderHome();
        else if (view === 'cibo') {
            renderSubMenu([
                { label: t('menu_rest'), table: "Ristoranti" },
                { label: t('menu_prod'), table: "Prodotti" },
                { label: t('menu_wine'), table: "Vini" } 
            ], 'Ristoranti');
        } else if (view === 'outdoor') {
            renderSubMenu([
                { label: t('menu_trail'), table: "Sentieri" },
                { label: t('menu_beach'), table: "Spiagge" },
                { label: t('menu_monu'), table: "Attrazioni" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') await renderServicesGrid();
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: t('menu_map'), table: "Mappe" }], 'Mappe');
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">${t('error')}: ${err.message}</div>`;
    }
}

function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    
    const langTiles = AVAILABLE_LANGS.map(l => `
        <button class="lang-tile ${l.code === getLang() ? 'active' : ''}" data-action="change-language" data-lang="${l.code}">
            <span class="lang-flag-large">${l.flag}</span>
            <span class="lang-label">${l.label}</span>
        </button>
    `).join('');

    content.innerHTML = `
    <div class="welcome-card animate-fade" style="background-image: url('${bgImage}')">
        <div class="welcome-overlay">
            <div class="welcome-content">
                <h1 class="welcome-title">${t('welcome_app_name')}</h1>
                <div class="welcome-divider"></div>
                <div class="lang-grid">${langTiles}</div>
            </div>
        </div>
    </div>`;
}

function renderSubMenu(options, defaultTable) {
    const btnsHtml = options.map(opt => 
        `<button class="btn-3d" data-table="${opt.table}">${opt.label}</button>`
    ).join('');

    content.innerHTML = `
    <div class="nav-sticky-header animate-fade">
        <div class="nav-scroll-container">${btnsHtml}</div>
    </div>
    <div id="sub-content"></div>`;
    
    const scrollContainer = content.querySelector('.nav-scroll-container');
    
    // Binding manuale per la navigazione interna delle tab (non è un'azione globale, è logica di UI locale)
    scrollContainer.querySelectorAll('.btn-3d').forEach(btn => {
        btn.onclick = function() { loadTableData(this.getAttribute('data-table'), this); };
    });

    if (scrollContainer.firstElementChild) {
        loadTableData(defaultTable, scrollContainer.firstElementChild);
    }
}

async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    subContent.innerHTML = `<div class="loader" style="margin-top:20px">${t('loading')}...</div>`;
    
    try {
        const strategy = viewStrategyContext.getStrategy(tableName);
        if (strategy) {
            await strategy.load(subContent);
        } else {
            console.error(`Nessuna strategia per: ${tableName}`);
            subContent.innerText = `Nessuna vista per ${tableName}`;
        }
    } catch (err) {
        console.error(err);
        subContent.innerHTML = `<p class="error-msg">${t('error')}: ${err.message}</p>`;
    }
}

async function renderServicesGrid() {
    const content = document.getElementById('app-content');
    
    const { data, error } = await supabaseClient.from('Trasporti').select('*');
    if (error) { 
        content.innerHTML = `<p class="error-msg">${t('error')}</p>`; 
        return;
    }
    
    window.app.dataStore.transportList = data;

    function getServiceIcon(name) {
        const n = name.toLowerCase();
        if (n.includes('treno')) return 'train';
        if (n.includes('battello')) return 'directions_boat';
        if (n.includes('bus')) return 'directions_bus';
        if (n.includes('taxi')) return 'local_taxi';
        return 'confirmation_number';
    }

    const gridItems = data.map((tVal, index) => {
        const nome = tVal.Mezzo || tVal.Località || 'Trasporto';
        const icon = getServiceIcon(nome);
        return `
        <div class="service-widget" data-action="open-modal" data-modal-type="transport" data-id="${index}">
            <span class="material-icons widget-icon">${icon}</span>
            <span class="widget-label">${nome}</span>
        </div>`;
    }).join('');

    const extraItems = `
        <div class="service-widget" id="btn-serv-numeri">
            <span class="material-icons widget-icon">phonelink_ring</span>
            <span class="widget-label">${t('menu_num')}</span>
        </div>
        <div class="service-widget" id="btn-serv-farmacie">
            <span class="material-icons widget-icon">medical_services</span>
            <span class="widget-label">${t('menu_pharm')}</span>
        </div>
    `;

    content.innerHTML = `
        <div class="services-grid-modern animate-fade">
            ${gridItems}
            ${extraItems}
        </div>
        ${createGlobalFooter()}
    `;

    // Binding per gli elementi extra
    document.getElementById('btn-serv-numeri').onclick = () => renderSimpleList('Numeri_utili');
    document.getElementById('btn-serv-farmacie').onclick = () => renderSimpleList('Farmacie');
}

async function renderSimpleList(tableName) {
    const cleanTitle = tableName.replace('_', ' '); 
    const content = document.getElementById('app-content');
    
    content.innerHTML = `
    <div class="header-simple-list animate-fade">
        <button class="btn-back-custom" id="simple-list-back">
            <span class="material-icons">arrow_back</span>
        </button>
        <h2>${cleanTitle}</h2>
    </div>
    <div id="sub-content">
        <div class="loader">${t('loading')}...</div>
    </div>`;

    document.getElementById('simple-list-back').onclick = renderServicesGrid;

    const subContent = document.getElementById('sub-content');
    
    try {
        const { data, error } = await supabaseClient.from(tableName).select('*');
        if(error) throw error;
        
        window.app.dataStore.currentList = data;

        if(tableName === 'Numeri_utili') renderGenericFilterableView(data, 'Comune', subContent, numeriUtiliRenderer);
        if(tableName === 'Farmacie') renderGenericFilterableView(data, 'Paesi', subContent, farmacieRenderer);

    } catch(err) {
        subContent.innerText = 'Errore caricamento lista.';
    }
}

// --- SWIPE GESTURE ---
const minSwipeDistance = 50; 
const maxVerticalDistance = 100;
let touchStartX = 0; let touchStartY = 0; let touchEndX = 0; let touchEndY = 0;

document.addEventListener('touchstart', e => {
    if (e.target.closest('.leaflet-container') || e.target.closest('.map-container') || e.target.closest('.nav-scroll-container')) { touchStartX = null; return; }
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, {passive: true});

document.addEventListener('touchend', e => {
    if (touchStartX === null) return; 
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handlePageSwipe();
}, {passive: true});

function handlePageSwipe() {
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;
    if (Math.abs(xDiff) < minSwipeDistance) return;
    if (Math.abs(yDiff) > maxVerticalDistance) return;
    if (Math.abs(yDiff) > Math.abs(xDiff)) return;

    const tabs = document.querySelectorAll('.nav-chip, .btn-3d');
    if (tabs.length === 0) return;

    let activeIndex = -1;
    tabs.forEach((tab, index) => { if (tab.classList.contains('active-chip') || tab.classList.contains('active-3d')) activeIndex = index; });
    if (activeIndex === -1) return; 

    if (xDiff < 0) { if (activeIndex < tabs.length - 1) tabs[activeIndex + 1].click(); } 
    else { if (activeIndex > 0) tabs[activeIndex - 1].click(); }
    touchStartX = null;
}

// --- INITIALIZATION ---
const initApp = () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            switchView(viewName, item);
        });
    });

    setupHeaderElements(); 
    updateNavBar(); 
    switchView('home');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}