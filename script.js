// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- VARIABILE GLOBALE PER CODA MAPPE ---
window.mapsToInit = [];

const CLOUDINARY_CLOUD_NAME = 'dkg0jfady'; 
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

// --- CONFIGURAZIONE LINGUA ---
const AVAILABLE_LANGS = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
];

let currentLang = localStorage.getItem('app_lang') || 'it';

// --- DIZIONARIO TESTI UI COMPLETO (Con Nav Bar) ---
const UI_TEXT = {
    it: {
        loading: "Caricamento...", error: "Errore",
        home_title: "5 Terre", food_title: "Cibo & Sapori", outdoor_title: "Outdoor", services_title: "Servizi", maps_title: "Mappe & Cultura",
        // Nav Bar
        nav_villages: "Borghi", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        // Menu Sotto-header
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Attrazioni",
        btn_call: "Chiama", btn_map: "Mappa", btn_info: "Info", btn_website: "Sito Web", btn_hours: "Orari", btn_toll: "Pedaggio", btn_position: "Posizione",
        ideal_for: "Ideale per", no_results: "Nessun risultato.", visit_time: "min", curiosity: "Curiosità", coverage: "Copertura", pharmacy_tag: "FARMACIA",
        map_loaded: "Mappa caricata"
    },
    en: {
        loading: "Loading...", error: "Error",
        home_title: "5 Lands", food_title: "Food & Flavors", outdoor_title: "Outdoor", services_title: "Services", maps_title: "Maps & Culture",
        nav_villages: "Villages", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services",
        menu_prod: "Products", menu_rest: "Restaurants", menu_trail: "Trails", menu_beach: "Beaches", menu_trans: "Transport", menu_num: "Useful Numbers", menu_pharm: "Pharmacies", menu_map: "Maps", menu_monu: "Attractions",
        btn_call: "Call", btn_map: "Map", btn_info: "Info", btn_website: "Website", btn_hours: "Hours", btn_toll: "Toll", btn_position: "Location",
        ideal_for: "Best for", no_results: "No results found.", visit_time: "min", curiosity: "Curiosity", coverage: "Coverage", pharmacy_tag: "PHARMACY",
        map_loaded: "Map loaded"
    },
    es: {
        loading: "Cargando...", error: "Error",
        home_title: "5 Tierras", food_title: "Comida y Sabores", outdoor_title: "Aire Libre", services_title: "Servicios", maps_title: "Mapas y Cultura",
        nav_villages: "Pueblos", nav_food: "Comida", nav_outdoor: "Aire Libre", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas", menu_trans: "Transporte", menu_num: "Números", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Atracciones",
        btn_call: "Llamar", btn_map: "Mapa", btn_info: "Info", btn_website: "Sitio Web", btn_hours: "Horario", btn_toll: "Peaje", btn_position: "Posición",
        ideal_for: "Ideal para", no_results: "Sin resultados.", visit_time: "min", curiosity: "Curiosidad", coverage: "Cobertura", pharmacy_tag: "FARMACIA",
        map_loaded: "Mapa cargado"
    },
    fr: {
        loading: "Chargement...", error: "Erreur",
        home_title: "5 Terres", food_title: "Gastronomie", outdoor_title: "Plein Air", services_title: "Services", maps_title: "Cartes & Culture",
        nav_villages: "Villages", nav_food: "Nourriture", nav_outdoor: "Plein Air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages", menu_trans: "Transport", menu_num: "Numéros", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Attractions",
        btn_call: "Appeler", btn_map: "Carte", btn_info: "Info", btn_website: "Site Web", btn_hours: "Horaires", btn_toll: "Péage", btn_position: "Position",
        ideal_for: "Idéal pour", no_results: "Aucun résultat.", visit_time: "min", curiosity: "Curiosité", coverage: "Couverture", pharmacy_tag: "PHARMACIE",
        map_loaded: "Carte chargée"
    },
    de: {
        loading: "Laden...", error: "Fehler",
        home_title: "5 Länder", food_title: "Essen & Genuss", outdoor_title: "Outdoor", services_title: "Dienste", maps_title: "Karten & Kultur",
        nav_villages: "Dörfer", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände", menu_trans: "Transport", menu_num: "Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Attraktionen",
        btn_call: "Anrufen", btn_map: "Karte", btn_info: "Info", btn_website: "Webseite", btn_hours: "Öffnungszeiten", btn_toll: "Maut", btn_position: "Standort",
        ideal_for: "Ideal für", no_results: "Keine Ergebnisse.", visit_time: "min", curiosity: "Kuriosität", coverage: "Abdeckung", pharmacy_tag: "APOTHEKE",
        map_loaded: "Karte geladen"
    },
    zh: {
        loading: "加载中...", error: "错误",
        home_title: "五渔村", food_title: "美食与风味", outdoor_title: "户外", services_title: "服务", maps_title: "地图与文化",
        nav_villages: "村庄", nav_food: "食物", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "产品", menu_rest: "餐厅", menu_trail: "步道", menu_beach: "海滩", menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药房", menu_map: "地图", menu_monu: "景点",
        btn_call: "致电", btn_map: "地图", btn_info: "信息", btn_website: "网站", btn_hours: "时间", btn_toll: "通行费", btn_position: "位置",
        ideal_for: "适合", no_results: "无结果", visit_time: "分", curiosity: "趣闻", coverage: "覆盖范围", pharmacy_tag: "药房",
        map_loaded: "地图已加载"
    }
};

// Funzione Traduzione UI
function t(key) {
    const langDict = UI_TEXT[currentLang] || UI_TEXT['it'];
    return langDict[key] || key;
}

function dbCol(item, field) {
    if (!item) return '';
    if (currentLang === 'it') return item[field]; 
    const translatedField = `${field}_${currentLang}`; 
    if (item[translatedField] && item[translatedField].trim() !== '') {
        return item[translatedField];
    }
    return item[field];
}

function setupLanguageSelector() {
    const header = document.querySelector('header');
    
    // PULIZIA
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();
    const oldShare = header.querySelector('.header-share-left');
    if (oldShare) oldShare.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    // --- A. LINGUA (SINISTRA) ---
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions'; 
    actionsContainer.id = 'header-btn-lang'; // <--- ID NUOVO IMPORTANTE
    
    actionsContainer.style.position = 'absolute';
    actionsContainer.style.left = '20px';
    actionsContainer.style.top = '50%';
    actionsContainer.style.transform = 'translateY(-50%)';
    actionsContainer.style.zIndex = '20';

    const currFlag = AVAILABLE_LANGS.find(l => l.code === currentLang).flag;
    const currCode = currentLang.toUpperCase();

    const langSelector = document.createElement('div');
    langSelector.className = 'lang-selector';
    langSelector.innerHTML = `
        <button class="current-lang-btn" onclick="toggleLangDropdown(event)">
            <span class="lang-flag">${currFlag}</span> ${currCode} ▾
        </button>
        <div class="lang-dropdown" id="lang-dropdown" style="left: 0; right: auto;">
            ${AVAILABLE_LANGS.map(l => `
                <button class="lang-opt ${l.code === currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                    <span class="lang-flag">${l.flag}</span> ${l.label}
                </button>
            `).join('')}
        </div>
    `;
    actionsContainer.appendChild(langSelector);

    // --- B. CONDIVIDI (DESTRA) ---
    const shareBtn = document.createElement('span');
    shareBtn.className = 'material-icons header-share-right'; 
    shareBtn.id = 'header-btn-share'; // <--- ID NUOVO IMPORTANTE
    shareBtn.innerText = 'share'; 
    shareBtn.onclick = shareApp;
    
    shareBtn.style.position = 'absolute'; 
    shareBtn.style.right = '20px';         
    shareBtn.style.top = '50%';           
    shareBtn.style.transform = 'translateY(-50%)';
    shareBtn.style.color = '#000000';
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.fontSize = '26px';
    shareBtn.style.zIndex = '20';

    header.appendChild(actionsContainer);
    header.appendChild(shareBtn);
}

// --- NUOVA FUNZIONE: Aggiorna testi Nav Bar ---
function updateNavBar() {
    // Selezioniamo le etichette della nav bar (nav-label)
    // Assumiamo che l'ordine sia: 0=Borghi(Home), 1=Cibo, 2=Outdoor, 3=Servizi
    const labels = document.querySelectorAll('.nav-label');
    if (labels.length >= 4) {
        labels[0].innerText = t('nav_villages');
        labels[1].innerText = t('nav_food');
        labels[2].innerText = t('nav_outdoor');
        labels[3].innerText = t('nav_services');
    }
}

function changeLanguage(langCode) {
    currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    
    setupLanguageSelector(); 
    updateNavBar(); // Aggiorna subito la barra in basso
    
    // Ricarica vista
    const activeNav = document.querySelector('.nav-item.active');
    if(activeNav) {
        const onclickAttr = activeNav.getAttribute('onclick');
        const viewMatch = onclickAttr.match(/switchView\('([^']+)'/);
        if(viewMatch) switchView(viewMatch[1], activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
}

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});

// --- FUNZIONE STANDARD OTTIMIZZATA ---
function getSmartUrl(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';

    // Utilizziamo i 4 parametri "Standard" per il caricamento rapido:
    // 1. w_      -> Larghezza precisa (non scarica pixel inutili)
    // 2. c_fill  -> Ritaglio intelligente al centro
    // 3. f_auto  -> Converte in automatico nel formato più leggero (WebP o AVIF)
    // 4. q_auto:good -> Massima compressione senza perdita di qualità visibile
    
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
}

const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');

async function switchView(view, el) {
    if (!content) return;
    
    // Gestione menu attivo in basso
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    
    // --- GESTIONE ICONE HEADER (Solo in Home) ---
    const shareBtn = document.getElementById('header-btn-share');
    const langBtn = document.getElementById('header-btn-lang');
    
    if (shareBtn && langBtn) {
        if (view === 'home') {
            shareBtn.style.display = 'block';
            langBtn.style.display = 'block';
        } else {
            shareBtn.style.display = 'none';
            langBtn.style.display = 'none';
        }
    }
    // ---------------------------------------------

    content.innerHTML = `<div class="loader">${t('loading')}</div>`;

    const titleMap = {
        'home': 'home_title',
        'cibo': 'food_title',
        'outdoor': 'outdoor_title',
        'servizi': 'services_title',
        'mappe_monumenti': 'maps_title'
    };
    if(titleMap[view]) viewTitle.innerText = t(titleMap[view]);

    try {
        if (view === 'home') {
            await renderHome();
        } 
        else if (view === 'cibo') {
            renderSubMenu([
                { label: t('menu_rest'), table: "Ristoranti" },
                { label: t('menu_prod'), table: "Prodotti" }
                
            ], 'Ristoranti');
        }
        else if (view === 'outdoor') {
            renderSubMenu([
                { label: t('menu_trail'), table: "Sentieri" },
                { label: t('menu_beach'), table: "Spiagge" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') {
            renderSubMenu([
                { label: t('menu_trans'), table: "Trasporti" },
                { label: t('menu_num'), table: "Numeri_utili" },
                { label: t('menu_pharm'), table: "Farmacie" }
            ], 'Trasporti');
        } else if (view === 'mappe_monumenti') {
            renderSubMenu([
                { label: t('menu_map'), table: "Attrazioni" },
                { label: t('menu_monu'), table: "Mappe" }
            ], 'Attrazioni');
        }
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">${t('error')}: ${err.message}</div>`;
    }
}
function initPendingMaps() {
    if (!window.mapsToInit || window.mapsToInit.length === 0) return;

    window.mapsToInit.forEach(mapData => {
        const element = document.getElementById(mapData.id);
        // Se l'elemento esiste e non ha già una mappa inizializzata
        if (element && !element._leaflet_id) {
            
            // 1. Crea la mappa (senza controlli zoom per pulizia)
            const map = L.map(mapData.id, {
                zoomControl: false,
                dragging: false, // Blocca drag per non disturbare lo scroll pagina
                scrollWheelZoom: false,
                doubleClickZoom: false,
                attributionControl: false
            });

            // 2. Aggiungi Tile (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            // 3. Carica GPX
            if (mapData.gpx) {
                new L.GPX(mapData.gpx, {
                    async: true,
                    marker_options: {
                        startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png',
                        endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png',
                        shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png',
                        iconSize: [20, 30] // Pin più piccoli
                    },
                    polyline_options: {
                        color: '#E76F51', // Colore Percorso (Corallo)
                        weight: 5,
                        opacity: 0.8
                    }
                }).on('loaded', function(e) {
                   map.fitBounds(e.target.getBounds(), {
        paddingTopLeft: [20, 20],
        paddingBottomRight: [20, 180] // <-- I 180px "alzano" il sentiero
    });
                }).addTo(map);
            }
        }
    });
    window.mapsToInit = []; // Svuota la coda
}

function renderSubMenu(options, defaultTable) {
    // Modifica grafica:
    // A destra ora c'è un bottone chiaro con scritto "FILTRA"
    let menuHtml = `
    <div class="sub-nav-bar" style="display: flex; justify-content: space-between; align-items: center; padding-right: 15px;">
        <div class="sub-nav-tabs" style="display:flex; overflow-x: auto; white-space: nowrap;">
            ${options.map(opt => `<button class="sub-nav-item" onclick="loadTableData('${opt.table}', this)">${opt.label}</button>`).join('')}
        </div>
        
        <button id="filter-toggle-btn" style="display: none; background: #f0f0f0; border: 1px solid #ccc; border-radius: 20px; padding: 5px 12px; font-size: 0.8rem; font-weight: bold; color: #333; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             FILTRA
        </button>
    </div>
    <div id="sub-content"></div>`;
    
    content.innerHTML = menuHtml;

    const firstBtn = content.querySelector('.sub-nav-item');
    if (firstBtn) loadTableData(defaultTable, firstBtn);
}

// RENDER HOME
async function renderHome() {
    const { data, error } = await supabaseClient.from('Cinque_Terre').select('*');
    if (error) throw error;
    
    let html = '<div class="grid-container animate-fade">';
    data.forEach(v => {
        const paeseName = v.Paesi; 
        const imgUrl = getSmartUrl(paeseName, '', 800); 
        const safeName = paeseName.replace(/'/g, "\\'");
        
        html += `
            <div class="village-card" style="background-image: url('${imgUrl}')" onclick="openModal('village', '${safeName}')">
                <div class="card-title-overlay">${paeseName}</div>
            </div>`;
    });

    html += `
        <div class="village-card" style="background-image: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" onclick="switchView('mappe_monumenti', null)">
            <div class="card-title-overlay">${t('maps_title')}</div>
        </div>`;
        
    content.innerHTML = html + '</div>';
}

// CARICAMENTO DATI
async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    const filterBtn = document.getElementById('filter-toggle-btn'); // Recuperiamo il pulsante filtro
    
    if (!subContent) return;

    // Gestione classi attive pulsanti
    document.querySelectorAll('.sub-nav-item').forEach(b => b.classList.remove('active-sub'));
    if (btnEl) btnEl.classList.add('active-sub');

    // Reset tasto filtro (lo nascondiamo di default, lo riattiviamo dentro renderGenericFilterableView)
    if(filterBtn) filterBtn.style.display = 'none';

    subContent.innerHTML = `<div class="loader">${t('loading')}</div>`;

    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (error) {
        subContent.innerHTML = `<p class="error-msg">${t('error')}: ${error.message}</p>`;
        return;
    }

    let html = '<div class="list-container animate-fade">';

    // --- LOGICA SPECIFICA PER OGNI TABELLA ---

    if (tableName === 'Sentieri') {
        // MODIFICA QUI: Cambiato 'Label' con 'Difficoltà'
        renderGenericFilterableView(data, 'Difficolta', subContent, sentieroRenderer);
        return;
    }
    else if (tableName === 'Spiagge') {
        renderGenericFilterableView(data, 'Paesi', subContent, spiaggiaRenderer);
        return; 
    }
    else if (tableName === 'Ristoranti') {
        renderGenericFilterableView(data, 'Paesi', subContent, ristoranteRenderer);
        return;
    }
    else if (tableName === 'Farmacie') {
       renderGenericFilterableView(data, 'Paesi', subContent, farmaciaRenderer);
       return;
    } 
   else if (tableName === 'Attrazioni') {
        // 1. SALVIAMO I DATI NELLA VARIABILE GLOBALE
        window.tempAttractionsData = data;
        
        // 2. ASSEGNIAMO UN ID (INDICE) A OGNI RIGA
        // Così anche se filtriamo, il numero rimane incollato all'attrazione giusta
        data.forEach((item, index) => {
            item._tempIndex = index; 
        });

        renderGenericFilterableView(data, 'Paese', subContent, attrazioniRenderer);
        return;
    }
    else if (tableName === 'Numeri_utili') {
        // Logica ordinamento emergenza
        data.sort((a, b) => {
            const isEmergenzaA = a.Nome.includes('112') || a.Nome.toLowerCase().includes('emergenza');
            const isEmergenzaB = b.Nome.includes('112') || b.Nome.toLowerCase().includes('emergenza');
            if (isEmergenzaA && !isEmergenzaB) return -1;
            if (!isEmergenzaA && isEmergenzaB) return 1;
            return 0;
        }); 
        renderGenericFilterableView(data, 'Comune', subContent, numeriUtiliRenderer);
        return;
    };

    // --- RENDER STANDARD SENZA FILTRI (Prodotti, Trasporti, Mappe) ---
    
    if (tableName === 'Prodotti') {
        data.forEach(p => {
            const titolo = dbCol(p, 'Prodotti') || dbCol(p, 'Nome'); 
            const imgUrl = getSmartUrl(p.Prodotti || p.Nome, '', 400);
            const safeObj = JSON.stringify(p).replace(/'/g, "'");
            html += `
                <div class="card-product" onclick='openModal("product", ${safeObj})'>
                    <div class="prod-info">
                        <div class="prod-title">${titolo}</div>
                        <div class="prod-arrow">➜</div>
                    </div>
                    <img src="${imgUrl}" class="prod-thumb" loading="lazy" alt="${titolo}" onerror="this.style.display='none'">
                </div>`;
        });
    } 
   else if (tableName === 'Trasporti') {
        // 1. SALVIAMO I DATI IN UNA VARIABILE GLOBALE TEMPORANEA
        // In questo modo non dobbiamo scriverli dentro l'HTML (che si rompe)
        window.tempTransportData = data;

        data.forEach((t, index) => {
            const nomeDisplay = dbCol(t, 'Località') || dbCol(t, 'Mezzo');
            const imgUrl = getSmartUrl(t.Località || t.Mezzo, '', 400);
            
            // 2. PASSIAMO SOLO L'INDICE (NUMERO) AL CLICK
            // Passiamo 'index' invece di tutto l'oggetto 't'. 
            // È impossibile che un numero rompa il codice.
            html += `
                <div class="card-product" onclick="openModal('transport', ${index})">
                    <div class="prod-info">
                        <div class="prod-title">${nomeDisplay}</div>
                    </div>
                    <img src="${imgUrl}" class="prod-thumb" loading="lazy" alt="${nomeDisplay}" onerror="this.style.display='none'">
                </div>`;
        });
    }
    else if (tableName === 'Mappe') {
        subContent.innerHTML = `
        <div class="map-container animate-fade">
           <iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe> 
            <div class="map-note">${t('map_loaded')}</div>
        </div>`;
        return; 
    } 
    
    subContent.innerHTML = html + '</div>';
}

const sentieroRenderer = (s) => {
    // Recupero dati reali dal DB
    const paese = dbCol(s, 'Paesi');
    const distanza = s.Distanza || '--';
    const durata = s.Durata || '--';
    const extra = dbCol(s, 'Extra') || 'Sentiero';
    const gpxUrl = s.Gpxlink || s.gpxlink;

    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return `
    <div class="card-sentiero-modern">
        <div id="${uniqueMapId}" class="sentiero-map-bg"></div>
        
        <div class="sentiero-card-overlay">
            <h2 class="sentiero-overlay-title">${paese}</h2>

            <div class="sentiero-stats">
                <div class="stat-pill">
                    <span class="stat-icon">📏</span>
                    <span class="stat-val">${distanza}</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-icon">🕒</span>
                    <span class="stat-val">${durata}</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-icon">🏷️</span>
                    <span class="stat-val">${extra}</span>
                </div>
            </div>

            <button class="btn-outline-details" onclick='openModal("trail", ${JSON.stringify(s).replace(/'/g, "&apos;")})'>
    Dettagli Percorso
</button>
        </div>
    </div>`;
};
const ristoranteRenderer = (r) => {
    const nome = dbCol(r, 'Nome') || 'Ristorante';
    const paesi = dbCol(r, 'Paesi') || '';
    const indirizzo = r.Indirizzo || '';
    
    // 1. BLINDA I DATI (Per evitare errori al click)
    const safeObj = encodeURIComponent(JSON.stringify(r));
    
    // 2. Link Mappa Google (Universale)
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi + ' Cinque Terre')}`;

    // 3. Link Telefono
    const phoneLink = r.Telefono ? `tel:${r.Telefono}` : '#';
    // Colore pulsante telefono: Verde se c'è, Grigio se manca
    const phoneColor = r.Telefono ? '#2E7D32' : '#B0BEC5';
    const phoneCursor = r.Telefono ? 'pointer' : 'default';

    // 4. HTML CON GRAFICA INTEGRATA (Funziona sempre)
    return `
    <div class="animate-fade" style="
        background: #ffffff; 
        border-radius: 16px; 
        margin-bottom: 20px; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
        overflow: hidden; 
        font-family: Roboto;
        border: 1px solid #eee;">
        
        <div onclick="openModal('restaurant', '${safeObj}')" style="padding: 20px; cursor: pointer;">
            <div style="
                font-size: 1.25rem; 
                font-weight: 800; 
                color: #2c3e50; 
                margin-bottom: 6px;
                line-height: 1.2;">
                ${nome}
            </div>
            <div style="font-size: 0.95rem; color: #7f8c8d; display: flex; align-items: center; gap: 5px;">
                <span>📍</span> ${paesi} ${indirizzo ? ' • ' + indirizzo : ''}
            </div>
        </div>

        <div style="
            display: flex; 
            border-top: 1px solid #f0f0f0; 
            background: #fafafa;">
            
            <div onclick="openModal('restaurant', '${safeObj}')" style="
                flex: 1; 
                padding: 15px 0; 
                text-align: center; 
                cursor: pointer; 
                border-right: 1px solid #eee;
                color: #F57C00;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">📄</div>
                <div style="font-size: 0.7rem; font-weight: bold;">SCHEDA</div>
            </div>

            <a href="${phoneLink}" style="
                flex: 1; 
                padding: 15px 0; 
                text-align: center; 
                text-decoration: none; 
                border-right: 1px solid #eee;
                cursor: ${phoneCursor};
                color: ${phoneColor};">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">📞</div>
                <div style="font-size: 0.7rem; font-weight: bold;">CHIAMA</div>
            </a>

            <a href="${mapLink}" target="_blank" style="
                flex: 1; 
                padding: 15px 0; 
                text-align: center; 
                text-decoration: none; 
                color: #1565C0;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">🗺️</div>
                <div style="font-size: 0.7rem; font-weight: bold;">MAPPA</div>
            </a>

        </div>
    </div>`;
};
const spiaggiaRenderer = (s) => {
    const nome = dbCol(s, 'Nome') || 'Spiaggia';
    const paesi = dbCol(s, 'Paesi');
    const desc = dbCol(s, 'Descrizione') || '';
    const safePaesi = paesi.replace(/'/g, "\\'");
    const safeDesc = desc.replace(/'/g, "\\'");
    
    const mapLink = `https://www.google.com/maps/search/?api=1&query=Spiaggia ${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="card-spiaggia" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
        <div class="spiaggia-header">
            <div class="spiaggia-location">📍 ${paesi}</div>
            <span>🏖️</span>
        </div>
        
        <div class="item-title" style="font-size: 1.3rem; margin: 10px 0;">${nome}</div>
        
        <div class="spiaggia-footer">
            <a href="${mapLink}" target="_blank" class="btn-azure" onclick="event.stopPropagation()">
                ${t('btn_position')}
            </a>
        </div>
    </div>`;
};
const farmaciaRenderer = (f) => {
    const nome = dbCol(f, 'Nome');
    const paesi = dbCol(f, 'Paesi');
    const safeObj = JSON.stringify(f).replace(/'/g, "'");
    const fullAddress = `${f.Indirizzo}, ${f.Paesi}`;
    const mapLink = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

    return `
    <div class="card-list-item" onclick='openModal("farmacia", ${safeObj})'>
        <div class="item-info">
            <div class="item-header-row">
                <div class="item-title">${nome}</div>
                <div class="item-tag" style="background-color:#4CAF50;">${t('pharmacy_tag')}</div>
            </div>
            <div class="item-subtitle">📍 ${paesi}</div>
            <div class="card-actions">
                ${f.Numero ? `<a href="tel:${f.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()"><span>📞</span> ${t('btn_call')}</a>` : ''}
                ${f.Indirizzo ? `<a href="${mapLink}" target="_blank" class="action-btn btn-map" onclick="event.stopPropagation()"><span>🗺️</span> ${t('btn_map')}</a>` : ''}
            </div>
        </div>
    </div>`;
};

const numeriUtiliRenderer = (n) => {
    const nome = dbCol(n, 'Nome');
    const comune = dbCol(n, 'Comune');
    const paesi = dbCol(n, 'Paesi'); 

    return `
    <div class="card-list-item" style="cursor:default;">
        <div class="item-info">
            <div class="item-header-row">
                <div class="item-title">${nome}</div>
                <div class="item-tag" style="background-color:#607d8b;">${comune}</div>
            </div>
            <div class="item-subtitle" style="margin-top:6px; color:#555;"><strong>${t('coverage')}:</strong> ${paesi}</div>
            <div class="card-actions">
                <a href="tel:${n.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()">
                    <span style="font-size:1.2rem; margin-right:5px;">📞</span> ${t('btn_call')} ${n.Numero}
                </a>
            </div>
        </div>
    </div>`;
};

const attrazioniRenderer = (item) => {
    const titolo = dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = dbCol(item, 'Paese');
    
    // RECUPERIAMO IL NUMERO SICURO CHE ABBIAMO CREATO PRIMA
    // Se _tempIndex non esiste (caso raro), usiamo 0 per non rompere tutto
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;

    const diff = dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    const isHard = diff.toLowerCase().match(/alta|hard|difficile|schwer|difícil/); 
    const diffStyle = isHard ? 'background:#ffebee; color:#c62828;' : 'background:#e8f5e9; color:#2e7d32;';

    return `
    <div class="card-list-item monument-mode" onclick="openModal('attrazione', ${myId})">
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${titolo}</div></div>
            <div class="item-subtitle" style="margin-bottom: 8px;">📍 ${paese}</div>
            <div class="monument-meta" style="display:flex; gap:8px;">
                <span class="meta-badge" style="${diffStyle} padding:2px 8px; border-radius:4px; font-size:0.75rem;">${diff}</span>
                <span class="meta-badge badge-time" style="background:#f5f5f5; padding:2px 8px; border-radius:4px; font-size:0.75rem;">⏱ ${item["Tempo Visita (min)"] || '--'} ${t('visit_time')}</span>
            </div>
        </div>
        <div class="item-arrow" style="margin-top: auto; margin-bottom: auto;">➜</div>
    </div>`;
};

function simpleAlert(titolo, testo) {
    alert(`${titolo}\n\n${testo}`);
}

async function openModal(type, payload) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';

    if (type === 'village') {
        const bigImg = getSmartUrl(payload, '', 1000);
        const { data } = await supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', payload).single();
        const desc = data ? dbCol(data, 'Descrizione') : t('loading');
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:220px; object-fit:cover;"><h2>${payload}</h2><p>${desc}</p>`;
    } 
    else if (type === 'product') {
        const nome = dbCol(payload, 'Prodotti') || dbCol(payload, 'Nome');
        const desc = dbCol(payload, 'Descrizione');
        const ideale = dbCol(payload, 'Ideale per') || dbCol(payload, 'Ideale per');
        const bigImg = getSmartUrl(payload.Prodotti || payload.Nome, 'Prodotti', 800);
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;" onerror="this.style.display='none'"><h2>${nome}</h2><p>${desc || ''}</p><hr><p><strong>${t('ideal_for')}:</strong> ${ideale || ''}</p>`;
    }
    else if (type === 'transport') {
        // 1. RECUPERA IL DATO DALLA MEMORIA USANDO L'INDICE
        // 'payload' ora è solo un numero (0, 1, 2...), quindi usiamo quello per prendere l'oggetto reale
        const item = window.tempTransportData[payload];

        // Se per caso non trova l'oggetto, usciamo
        if (!item) { console.error("Errore recupero trasporto"); return; }

        // 2. LEGGI I CAMPI (Apostrofi e a capo non danno più fastidio qui)
        const nome = dbCol(item, 'Località') || dbCol(item, 'Mezzo');
        const desc = dbCol(item, 'Descrizione');
        const linkSito = item.Link;
        const linkOrari = item.Link_2;

        contentHtml = `
            <h2>${nome}</h2>
            <p style="margin: 15px 0; line-height: 1.6;">${desc || ''}</p>
            
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                ${linkSito ? `<a href="${linkSito}" target="_blank" class="btn-yellow" style="text-align:center;">${t('btn_website')}</a>` : ''}
                ${linkOrari ? `<a href="${linkOrari}" target="_blank" class="btn-yellow" style="text-align:center;">${t('btn_hours')}</a>` : ''}
                ${(!linkSito && !linkOrari) ? `<p style="text-align:center; color:#999;">Nessun link disponibile</p>` : ''}
            </div>
        `;
    }
    /* --- NUOVO BLOCCO PER I SENTIERI --- */
    else if (type === 'trail') {
        const titolo = dbCol(payload, 'Paesi');
        const aiuto = dbCol(payload, 'Tag aiuto') || '--';
        const dist = payload.Distanza || '--';
        const dura = payload.Durata || '--';
        const tag = dbCol(payload, 'Extra') || 'Sentiero';
        const desc = dbCol(payload, 'Descrizione') || '';

        contentHtml = `
            <div style="padding: 20px 0;">
                <h2 style="text-align: center; margin-bottom: 25px; font-family: 'Roboto Slab', cursive; font-size: 1.8rem; color: var(--primary-dark);">
                    ${titolo}
                </h2>
                
                <div style="display: flex; justify-content: space-between; padding: 0 30px; margin-bottom: 20px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Info</span>
                        <span style="font-weight: 700; color: #444; font-size: 1rem;">${aiuto}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Distanza</span>
                        <span style="font-weight: 700; color: #444; font-size: 1rem;">${dist}</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 0 30px; margin-bottom: 25px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Segnavia</span>
                        <span style="font-weight: 700; color: var(--accent-col); font-size: 1rem;">${tag}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Tempo Stimato</span>
                        <span style="font-weight: 700; color: #444; font-size: 1rem;">${dura}</span>
                    </div>
                </div>

                <div style="margin: 0 30px; height: 1px; background: #eee;"></div>

               <div style="padding: 25px 30px;">
    <p style="line-height: 1.7; color: #666; text-align: center; font-size: 0.95rem; font-family: 'Roboto', sans-serif;">
        ${desc}
    </p>
</div>
                </div>
            </div>
        `;
    }
    /* ------------------------------------ */
   // Gestiamo sia maiuscolo che minuscolo per sicurezza
    else if (type === 'Attrazione' || type === 'attrazione') {
        
        let item = null;

        // Controlliamo se abbiamo i dati in memoria
        if (window.tempAttractionsData && typeof payload === 'number') {
            item = window.tempAttractionsData[payload];
        }

        // SE NON TROVA L'ITEM, NON BLOCCHIAMO TUTTO: Creiamo un oggetto vuoto
        if (!item) {
            console.error("Errore: Attrazione non trovata in memoria indice:", payload);
            contentHtml = `<h2>Errore caricamento</h2><p>Impossibile recuperare i dettagli. Riprova a ricaricare la pagina.</p>`;
        } else {
            // Se tutto ok, leggiamo i dati
            const titolo = dbCol(item, 'Attrazioni');
            const paese = dbCol(item, 'Paese'); 
            const desc = dbCol(item, 'Descrizione');
            const curio = dbCol(item, 'Curiosità');
            const diff = dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
            const mapLink = item["Icona MyMaps"];

            contentHtml = `
                <h2>${titolo}</h2>
                <div style="color:#666; margin-bottom:15px; font-weight:600;">📍 ${paese}</div>
                
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <span class="meta-badge" style="background:#eee; padding:5px; border-radius:8px;">⏱ ${item["Tempo Visita (min)"] || '--'} ${t('visit_time')}</span>
                    <span class="meta-badge" style="background:#eee; padding:5px; border-radius:8px;">${diff}</span>
                </div>
                
                <p style="line-height:1.6;">${desc || ''}</p>
                
                ${curio ? `
                <div class="curiosity-box" style="margin-top:20px; padding:15px; background:#f9f9f9; border-left:4px solid orange; border-radius: 4px;">
                    <strong>💡 ${t('curiosity') || 'Curiosità'}:</strong><br>
                    ${curio}
                </div>` : ''}
                
                <div style="margin-top:20px;">
                    ${mapLink ? `<a href="${mapLink}" target="_blank" class="btn-yellow" style="display:block; text-align:center;">${t('btn_position')}</a>` : ''}
                </div>`;
        }
    }
    modal.innerHTML = `<div class="modal-content"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
}
function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    // 1. Prepara la struttura HTML vuota
    container.innerHTML = `<div class="filter-bar animate-fade" id="dynamic-filters" style="display:none;"></div><div class="list-container animate-fade" id="dynamic-list"></div>`;
    
    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');
    const filterBtn = document.getElementById('filter-toggle-btn');

    // --- GESTIONE PULSANTE FILTRO ---
    if (filterBtn) {
        filterBtn.style.display = 'block'; 
        
        const newBtn = filterBtn.cloneNode(true);
        filterBtn.parentNode.replaceChild(newBtn, filterBtn);
        
        newBtn.onclick = () => {
            if (filterBar.style.display === 'none') {
                filterBar.style.display = 'flex';
                newBtn.style.background = '#e0e0e0'; 
            } else {
                filterBar.style.display = 'none';
                newBtn.style.background = '#f0f0f0'; 
            }
        };
    }

    // 2. CALCOLO TAG UNICI (PULIZIA SPAZI)
    let rawValues = allData.map(item => {
        const val = item[filterKey];
        return val ? val.trim() : null; 
    }).filter(x => x);

    let tagsRaw = [...new Set(rawValues)];
    
    // --- QUI HO CAMBIATO L'ORDINE ---
    // Ho aggiunto "Media" e "Difficile" dopo Facile. 
    // L'ordine in questa lista è l'ordine che vedrai a schermo.
    const customOrder = [
        "Tutti", 
        "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", // Per i paesi
        "Facile", "Media", "Difficile", // <-- IL TUO ORDINE PERSONALIZZATO
        "Turistico", "Escursionistico", "Esperto" // Altri possibili valori (per sicurezza)
    ];
    
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    // Ordina i tag in base alla lista sopra
    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);
        // Se entrambi sono nella lista custom, vince chi ha l'indice più basso
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // Se solo A è nella lista, vince A
        if (indexA !== -1) return -1;
        // Se solo B è nella lista, vince B
        if (indexB !== -1) return 1;
        // Altrimenti ordine alfabetico
        return a.localeCompare(b);
    });

    // 3. Crea i bottoni dei filtri
    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.innerText = tag;
        if (tag === 'Tutti') btn.classList.add('active-filter');
        
        btn.onclick = () => {
            filterBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            
            const filtered = tag === 'Tutti' ? allData : allData.filter(item => {
                const valDB = item[filterKey] ? item[filterKey].trim() : '';
                return (valDB === tag) || (item.Nome && (item.Nome.includes('112') || item.Nome.toLowerCase().includes('emergenza')));
            });
            
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    // 4. Update List
    function updateList(items) {
        if (!items || items.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">${t('no_results')}</p>`;
            return;
        }
        
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');

        if (typeof initPendingMaps === 'function') {
            setTimeout(() => {
                initPendingMaps();
            }, 100);
        }
    }

    updateList(allData);
}
async function shareApp() {
    try {
        if (navigator.share) await navigator.share({ title: '5 Terre App', text: 'Guarda questa guida!', url: window.location.href });
        else { navigator.clipboard.writeText(window.location.href); alert("Link copiato!"); }
    } catch (err) { console.log("Errore:", err); }
}

document.addEventListener('touchmove', function(event) { if (event.scale !== 1) event.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, false);
document.addEventListener('touchstart', function(event) { if (event.touches.length > 1) event.preventDefault(); }, { passive: false });

document.addEventListener('DOMContentLoaded', () => {
    setupLanguageSelector(); 
    updateNavBar(); // Traduce subito la nav bar all'avvio
    switchView('home');      
});