console.log("✅ 3. app.js caricato (Controller - DOM Safe Mode)");

const content = document.getElementById('app-content');

// --- SETUP HEADER (DOM) ---
const createGlobalFooter = () => window.mk('footer', { class: 'app-footer' }, 
    window.mk('p', {}, `© 2026 Five2Go. ${window.t('footer_rights')}`)
);

function setupHeaderElements() {
    const header = document.querySelector('header');
    
    const oldActions = header.querySelector('.header-actions-container');
    if (oldActions) oldActions.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    if (window.currentViewName !== 'home') return; 

    // Costruzione Container Lingue
    const currFlag = window.AVAILABLE_LANGS.find(l => l.code === window.currentLang).flag;
    const currCode = window.currentLang.toUpperCase();
    
    // Dropdown (nascosto di base)
    const dropdown = window.mk('div', { class: 'lang-dropdown lang-dropdown-wrapper', id: 'lang-dropdown' });
    window.AVAILABLE_LANGS.forEach(l => {
        const btn = window.mk('button', { 
            class: `lang-opt ${l.code === window.currentLang ? 'active' : ''}`,
            onclick: () => window.changeLanguage(l.code)
        }, [
            window.mk('span', { class: 'lang-flag' }, l.flag),
            ` ${l.label}`
        ]);
        dropdown.appendChild(btn);
    });

    // Selettore principale
    const langSelector = window.mk('div', { class: 'lang-selector' }, [
        window.mk('button', { class: 'current-lang-btn', onclick: window.toggleLangDropdown }, [
            window.mk('span', { class: 'lang-flag' }, currFlag), 
            ` ${currCode} ▾`
        ]),
        dropdown
    ]);

    const actionsContainer = window.mk('div', { 
        id: 'header-btn-lang',
        class: 'header-actions animate-fade header-actions-container' 
    }, langSelector);

    header.appendChild(actionsContainer);
}

function updateNavBar() {
    const labels = document.querySelectorAll('.nav-label');
    if (labels.length >= 4) {
        labels[0].innerText = window.t('nav_villages'); 
        labels[1].innerText = window.t('nav_food');
        labels[2].innerText = window.t('nav_outdoor');
        labels[3].innerText = window.t('nav_services'); 
    }
}

// Funzione Globale per cambiare lingua
window.changeLanguage = function(langCode) {
    window.currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    setupHeaderElements(); 
    updateNavBar(); 
    
    const activeNav = document.querySelector('.nav-item.active');
    if(activeNav) {
        const onclickAttr = activeNav.getAttribute('onclick');
        const viewMatch = onclickAttr.match(/switchView\('([^']+)'/);
        if(viewMatch) switchView(viewMatch[1], activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
};

window.toggleLangDropdown = function(event) {
    event.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.toggle('show');
};

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});


// --- NAVIGAZIONE PRINCIPALE ---
window.switchView = async function(view, el) {
    if (!content) return;
    window.currentViewName = view; 

    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) { globalFilterBtn.remove(); }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    else if (view === 'home') {
         const homeBtn = document.querySelector('.nav-item[onclick*="home"]');
         if(homeBtn) homeBtn.classList.add('active');
    }

    try {
        if (view === 'home') renderHome();
        else if (view === 'cibo') {
            renderSubMenu([
                { label: window.t('menu_rest'), table: "Ristoranti" },
                { label: window.t('menu_prod'), table: "Prodotti" },
                { label: window.t('menu_wine'), table: "Vini" } 
            ], 'Ristoranti');
        } else if (view === 'outdoor') {
            renderSubMenu([
                { label: window.t('menu_trail'), table: "Sentieri" },
                { label: window.t('menu_beach'), table: "Spiagge" },
                { label: window.t('menu_monu'), table: "Attrazioni" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') await renderServicesGrid();
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: window.t('menu_map'), table: "Mappe" }], 'Mappe');
    } catch (err) {
        console.error(err);
        content.innerHTML = '';
        content.appendChild(window.mk('div', { class: 'error-msg' }, `${window.t('error')}: ${err.message}`));
    }
};

function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    
    content.innerHTML = '';
    
    // Griglia Lingue per Home
    const langGrid = window.mk('div', { class: 'lang-grid' });
    window.AVAILABLE_LANGS.forEach(l => {
        langGrid.appendChild(window.mk('button', { 
            class: `lang-tile ${l.code === window.currentLang ? 'active' : ''}`,
            onclick: () => window.changeLanguage(l.code)
        }, [
            window.mk('span', { class: 'lang-flag-large' }, l.flag),
            window.mk('span', { class: 'lang-label' }, l.label)
        ]));
    });

    const welcomeCard = window.mk('div', { class: 'welcome-card animate-fade', style: { backgroundImage: `url('${bgImage}')` } }, 
        window.mk('div', { class: 'welcome-overlay' }, 
            window.mk('div', { class: 'welcome-content' }, [
                window.mk('h1', { class: 'welcome-title' }, window.t('welcome_app_name')),
                window.mk('div', { class: 'welcome-divider' }),
                langGrid
            ])
        )
    );
    
    content.appendChild(welcomeCard);
}

function renderSubMenu(options, defaultTable) {
    content.innerHTML = '';

    const scrollContainer = window.mk('div', { class: 'nav-scroll-container' });
    options.forEach(opt => {
        const btn = window.mk('button', { 
            class: 'btn-3d', 
            onclick: function() { loadTableData(opt.table, this); } 
        }, opt.label);
        scrollContainer.appendChild(btn);
    });

    const stickyHeader = window.mk('div', { class: 'nav-sticky-header animate-fade' }, scrollContainer);
    const subContent = window.mk('div', { id: 'sub-content' });

    content.append(stickyHeader, subContent);
    
    // Click automatico sul primo
    const firstBtn = scrollContainer.firstChild;
    if (firstBtn) {
        loadTableData(defaultTable, firstBtn);
    }
}

// --- FUNZIONE CENTRALE (USA STRATEGY) ---
window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    // UI Buttons
    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    // Reset Filtri
    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    // Loading
    if (!window.appCache[tableName] && tableName !== 'Mappe') {
        subContent.innerHTML = '';
        subContent.appendChild(window.mk('div', { class: 'loader', style: { marginTop:'20px' } }, `${window.t('loading')}...`));
    }
    
    try {
        const strategy = window.viewStrategyContext.getStrategy(tableName);
        if (strategy) {
            await strategy.load(subContent);
        } else {
            console.error(`Nessuna strategia per: ${tableName}`);
            subContent.innerText = `Nessuna vista per ${tableName}`;
        }
    } catch (err) {
        console.error(err);
        subContent.innerHTML = '';
        subContent.appendChild(window.mk('p', { class: 'error-msg' }, `${window.t('error')}: ${err.message}`));
    }
};

// --- SWIPE GESTURE (Invariata) ---
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

// --- RENDER SERVIZI (DOM) ---
window.renderServicesGrid = async function() {
    const content = document.getElementById('app-content');
    
    const { data, error } = await window.supabaseClient.from('Trasporti').select('*');
    if (error) { 
        content.innerHTML = ''; content.appendChild(window.mk('p', { class: 'error-msg' }, window.t('error'))); 
        return;
    }
    window.tempTransportData = data;

    function getServiceIcon(name, type) {
        const n = name.toLowerCase();
        if (n.includes('treno')) return 'train';
        if (n.includes('battello')) return 'directions_boat';
        if (n.includes('bus')) return 'directions_bus';
        if (n.includes('taxi')) return 'local_taxi';
        return 'confirmation_number';
    }

    const grid = window.mk('div', { class: 'services-grid-modern animate-fade' });

    data.forEach((t, index) => {
        const nome = t.Mezzo || t.Località || 'Trasporto';
        const icon = getServiceIcon(nome, 'trasporto');
        const widget = window.mk('div', { class: 'service-widget', onclick: () => window.openModal('transport', index) }, [
            window.mk('span', { class: 'material-icons widget-icon' }, icon),
            window.mk('span', { class: 'widget-label' }, nome)
        ]);
        grid.appendChild(widget);
    });

    // Widget Extra
    grid.appendChild(window.mk('div', { class: 'service-widget', onclick: () => renderSimpleList('Numeri_utili') }, [
        window.mk('span', { class: 'material-icons widget-icon' }, 'phonelink_ring'),
        window.mk('span', { class: 'widget-label' }, window.t('menu_num'))
    ]));
    
    grid.appendChild(window.mk('div', { class: 'service-widget', onclick: () => renderSimpleList('Farmacie') }, [
        window.mk('span', { class: 'material-icons widget-icon' }, 'medical_services'),
        window.mk('span', { class: 'widget-label' }, window.t('menu_pharm'))
    ]));

    content.innerHTML = '';
    content.append(grid, createGlobalFooter());
};

function renderSimpleList(tableName) {
    const cleanTitle = tableName.replace('_', ' '); 
    content.innerHTML = '';

    const header = window.mk('div', { class: 'header-simple-list animate-fade' }, [
        window.mk('button', { class: 'btn-back-custom', onclick: window.renderServicesGrid }, 
            window.mk('span', { class: 'material-icons' }, 'arrow_back')
        ),
        window.mk('h2', {}, cleanTitle)
    ]);

    const subContent = window.mk('div', { id: 'sub-content' }, 
        window.mk('div', { class: 'loader' }, `${window.t('loading')}...`)
    );

    content.append(header, subContent);
    window.loadTableData(tableName, null);
}

window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
};

window.toggleBusMap = function() {
    const wrapper = document.getElementById('bus-map-wrapper');
    if (wrapper) wrapper.style.display = (wrapper.style.display === 'none' || wrapper.style.display === '') ? 'block' : 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    window.currentViewName = 'home'; 
    setupHeaderElements(); 
    updateNavBar(); 
    switchView('home');
});